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

func (s *PostgresStore) List(ctx context.Context, actorHash []byte, limit int) ([]Wish, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT w.id::text, w.title, w.detail, w.category, w.status, w.visibility,
		       w.team_response, w.created_at, w.updated_at,
		       (SELECT count(*) FROM wish_supports s WHERE s.wish_id = w.id)::int,
		       EXISTS(SELECT 1 FROM wish_supports s WHERE s.wish_id = w.id AND s.actor_hash = $1)
		FROM wishes w
		WHERE w.visibility = 'published'
		ORDER BY w.created_at DESC
		LIMIT $2`, actorHash, limit)
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
		RETURNING id::text, title, detail, category, status, visibility,
		          team_response, created_at, updated_at`,
		input.ID, input.Title, input.Detail, input.Category, input.Visibility, input.ActorHash,
	).Scan(
		&wish.ID, &wish.Title, &wish.Detail, &wish.Category, &wish.Status, &wish.Visibility,
		&wish.TeamResponse, &wish.CreatedAt, &wish.UpdatedAt,
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

func (s *PostgresStore) Report(ctx context.Context, id string, actorHash []byte, reason string) error {
	tx, err := s.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	command, err := tx.Exec(ctx, `
		INSERT INTO wish_reports (wish_id, actor_hash, reason)
		SELECT id, $2, $3 FROM wishes WHERE id = $1::uuid AND visibility = 'published'
		ON CONFLICT (wish_id, actor_hash) DO NOTHING`, id, actorHash, reason)
	if err != nil {
		return err
	}
	if command.RowsAffected() == 0 {
		var exists bool
		if err := tx.QueryRow(ctx,
			`SELECT EXISTS(SELECT 1 FROM wishes WHERE id = $1::uuid AND visibility = 'published')`, id,
		).Scan(&exists); err != nil {
			return err
		}
		if !exists {
			return ErrNotFound
		}
	}
	if _, err := tx.Exec(ctx, `
		UPDATE wishes SET visibility = 'hidden', updated_at = now()
		WHERE id = $1::uuid AND (
			SELECT count(*) FROM wish_reports WHERE wish_id = $1::uuid
		) >= 3`, id); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (s *PostgresStore) AdminList(ctx context.Context, visibility Visibility, limit int) ([]Wish, error) {
	rows, err := s.pool.Query(ctx, `
		SELECT w.id::text, w.title, w.detail, w.category, w.status, w.visibility,
		       w.team_response, w.created_at, w.updated_at,
		       (SELECT count(*) FROM wish_supports s WHERE s.wish_id = w.id)::int,
		       false
		FROM wishes w
		WHERE w.visibility = $1
		ORDER BY w.created_at DESC
		LIMIT $2`, visibility, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanWishRows(rows)
}

func (s *PostgresStore) AdminUpdate(ctx context.Context, id string, input UpdateInput) (Wish, error) {
	var status any
	if input.Status != nil {
		status = *input.Status
	}
	var visibility any
	if input.Visibility != nil {
		visibility = *input.Visibility
	}
	var teamResponse any
	if input.TeamResponse != nil {
		teamResponse = *input.TeamResponse
	}

	var wish Wish
	err := s.pool.QueryRow(ctx, `
		UPDATE wishes SET
			status = COALESCE($2::text, status),
			visibility = COALESCE($3::text, visibility),
			team_response = COALESCE($4::text, team_response),
			updated_at = now()
		WHERE id = $1::uuid
		RETURNING id::text, title, detail, category, status, visibility,
		          team_response, created_at, updated_at,
		          (SELECT count(*) FROM wish_supports s WHERE s.wish_id = wishes.id)::int,
		          false`, id, status, visibility, teamResponse).Scan(
		&wish.ID, &wish.Title, &wish.Detail, &wish.Category, &wish.Status, &wish.Visibility,
		&wish.TeamResponse, &wish.CreatedAt, &wish.UpdatedAt, &wish.SupportCount, &wish.SupportedByMe,
	)
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
		&wish.ID, &wish.Title, &wish.Detail, &wish.Category, &wish.Status, &wish.Visibility,
		&wish.TeamResponse, &wish.CreatedAt, &wish.UpdatedAt, &wish.SupportCount, &wish.SupportedByMe,
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
