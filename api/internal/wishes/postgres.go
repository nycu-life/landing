package wishes

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresStore struct {
	pool *pgxpool.Pool
}

func NewPostgresStore(pool *pgxpool.Pool) *PostgresStore {
	return &PostgresStore{pool: pool}
}

func (s *PostgresStore) Ping(ctx context.Context) error {
	return s.pool.Ping(ctx)
}

func Migrate(ctx context.Context, pool *pgxpool.Pool) error {
	for index, statement := range MigrationStatements {
		if _, err := pool.Exec(ctx, statement); err != nil {
			return fmt.Errorf("migration statement %d: %w", index+1, err)
		}
	}
	return nil
}

// wishColumns is the shared projection for scanWish; callers append the
// support count and supportedByMe expressions.
const wishColumns = `w.id::text, w.title, w.detail, w.category, w.visibility,
		       w.status, w.reply, w.replied_at, w.fulfilled_at,
		       w.created_at, w.updated_at`

func (s *PostgresStore) List(ctx context.Context, actorHash []byte, status Status, limit int) ([]Wish, error) {
	// Fulfilled wishes are listed by when they were fulfilled; open ones by age.
	rows, err := s.pool.Query(ctx, `
		SELECT `+wishColumns+`,
		       (SELECT count(*) FROM wish_supports s WHERE s.wish_id = w.id)::int,
		       EXISTS(SELECT 1 FROM wish_supports s WHERE s.wish_id = w.id AND s.actor_hash = $1)
		FROM wishes w
		WHERE w.visibility = 'published' AND w.status = $2::text
		ORDER BY CASE WHEN $2::text = 'fulfilled' THEN w.fulfilled_at END DESC NULLS LAST,
		         w.created_at DESC
		LIMIT $3`, actorHash, status, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanWishRows(rows)
}

func (s *PostgresStore) Create(ctx context.Context, input CreateInput) (Wish, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return Wish{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var recent int
	if err := tx.QueryRow(ctx,
		`SELECT count(*) FROM wishes WHERE actor_hash = $1 AND created_at > now() - interval '1 hour'`,
		input.ActorHash,
	).Scan(&recent); err != nil {
		return Wish{}, err
	}
	if recent >= 3 {
		return Wish{}, ErrRateLimited
	}

	var wish Wish
	err = tx.QueryRow(ctx, `
		INSERT INTO wishes (id, title, detail, category, visibility, actor_hash)
		VALUES ($1::uuid, $2, $3, $4, $5, $6)
		RETURNING id::text, title, detail, category, visibility,
		          status, reply, replied_at, fulfilled_at,
		          created_at, updated_at`,
		input.ID, input.Title, input.Detail, input.Category, input.Visibility, input.ActorHash,
	).Scan(
		&wish.ID, &wish.Title, &wish.Detail, &wish.Category, &wish.Visibility,
		&wish.Status, &wish.Reply, &wish.RepliedAt, &wish.FulfilledAt,
		&wish.CreatedAt, &wish.UpdatedAt,
	)
	if err != nil {
		return Wish{}, err
	}
	if _, err := tx.Exec(ctx,
		`INSERT INTO wish_supports (wish_id, actor_hash) VALUES ($1::uuid, $2)`,
		wish.ID, input.ActorHash,
	); err != nil {
		return Wish{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return Wish{}, err
	}
	wish.SupportCount = 1
	wish.SupportedByMe = true
	return wish, nil
}

func (s *PostgresStore) ToggleSupport(ctx context.Context, id string, actorHash []byte) (SupportResult, error) {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return SupportResult{}, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var visibility Visibility
	if err := tx.QueryRow(ctx, `SELECT visibility FROM wishes WHERE id = $1::uuid FOR UPDATE`, id).Scan(&visibility); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return SupportResult{}, ErrNotFound
		}
		return SupportResult{}, err
	}
	if visibility != VisibilityPublished {
		return SupportResult{}, ErrNotFound
	}

	result := SupportResult{}
	command, err := tx.Exec(ctx,
		`DELETE FROM wish_supports WHERE wish_id = $1::uuid AND actor_hash = $2`, id, actorHash,
	)
	if err != nil {
		return SupportResult{}, err
	}
	if command.RowsAffected() == 0 {
		if _, err := tx.Exec(ctx,
			`INSERT INTO wish_supports (wish_id, actor_hash) VALUES ($1::uuid, $2)`, id, actorHash,
		); err != nil {
			return SupportResult{}, err
		}
		result.Supported = true
	}
	if err := tx.QueryRow(ctx,
		`SELECT count(*)::int FROM wish_supports WHERE wish_id = $1::uuid`, id,
	).Scan(&result.SupportCount); err != nil {
		return SupportResult{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return SupportResult{}, err
	}
	return result, nil
}

func (s *PostgresStore) AdminList(ctx context.Context, visibility Visibility, status Status, limit int) ([]Wish, error) {
	var statusFilter any
	if status != "" {
		statusFilter = status
	}
	rows, err := s.pool.Query(ctx, `
		SELECT `+wishColumns+`,
		       (SELECT count(*) FROM wish_supports s WHERE s.wish_id = w.id)::int,
		       false
		FROM wishes w
		WHERE w.visibility = $1 AND ($2::text IS NULL OR w.status = $2::text)
		ORDER BY w.created_at DESC
		LIMIT $3`, visibility, statusFilter, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanWishRows(rows)
}

func (s *PostgresStore) AdminUpdate(ctx context.Context, id string, input UpdateInput) (Wish, error) {
	var visibility, status, reply any
	if input.Visibility != nil {
		visibility = *input.Visibility
	}
	if input.Status != nil {
		status = *input.Status
	}
	if input.Reply != nil {
		reply = *input.Reply
	}
	// Right-hand sides see the row's previous values, so fulfilled_at keeps its
	// first timestamp on repeated "fulfilled" updates and replied_at only moves
	// when the reply text actually changes.
	wish, err := scanWish(s.pool.QueryRow(ctx, `
		UPDATE wishes AS w SET
			visibility = COALESCE($2::text, w.visibility),
			status = COALESCE($3::text, w.status),
			fulfilled_at = CASE
				WHEN $3::text IS NULL THEN w.fulfilled_at
				WHEN $3::text = 'fulfilled' THEN COALESCE(w.fulfilled_at, now())
				ELSE NULL
			END,
			reply = COALESCE($4::text, w.reply),
			replied_at = CASE
				WHEN $4::text IS NULL THEN w.replied_at
				WHEN $4::text = '' THEN NULL
				WHEN $4::text = w.reply THEN w.replied_at
				ELSE now()
			END,
			updated_at = now()
		WHERE w.id = $1::uuid
		RETURNING `+wishColumns+`,
		          (SELECT count(*) FROM wish_supports s WHERE s.wish_id = w.id)::int,
		          false`, id, visibility, status, reply))
	if errors.Is(err, pgx.ErrNoRows) {
		return Wish{}, ErrNotFound
	}
	return wish, err
}

type rowScanner interface {
	Scan(dest ...any) error
}

type rowsScanner interface {
	Next() bool
	Scan(dest ...any) error
	Err() error
}

func scanWish(row rowScanner) (Wish, error) {
	var wish Wish
	err := row.Scan(
		&wish.ID, &wish.Title, &wish.Detail, &wish.Category, &wish.Visibility,
		&wish.Status, &wish.Reply, &wish.RepliedAt, &wish.FulfilledAt,
		&wish.CreatedAt, &wish.UpdatedAt, &wish.SupportCount, &wish.SupportedByMe,
	)
	return wish, err
}

func scanWishRows(rows rowsScanner) ([]Wish, error) {
	items := make([]Wish, 0)
	for rows.Next() {
		wish, err := scanWish(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, wish)
	}
	return items, rows.Err()
}
