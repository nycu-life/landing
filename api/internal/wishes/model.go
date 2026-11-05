package wishes

import "time"

type Category string

const (
	CategoryLife      Category = "life"
	CategoryTransport Category = "transport"
	CategoryLearning  Category = "learning"
	CategorySpace     Category = "space"
	CategoryOther     Category = "other"
)

func (c Category) Valid() bool {
	switch c {
	case CategoryLife, CategoryTransport, CategoryLearning, CategorySpace, CategoryOther:
		return true
	default:
		return false
	}
}

type Visibility string

const (
	VisibilityPublished Visibility = "published"
	VisibilityPending   Visibility = "pending"
	VisibilityHidden    Visibility = "hidden"
)

func (v Visibility) Valid() bool {
	switch v {
	case VisibilityPublished, VisibilityPending, VisibilityHidden:
		return true
	default:
		return false
	}
}

// Status is the team's processing state for a wish. It is independent of
// moderation visibility: only published wishes are ever public, whatever their
// status.
type Status string

const (
	StatusOpen      Status = "open"
	StatusFulfilled Status = "fulfilled"
)

func (s Status) Valid() bool {
	switch s {
	case StatusOpen, StatusFulfilled:
		return true
	default:
		return false
	}
}

// MaxReplyLength bounds the team reply in Unicode code points.
const MaxReplyLength = 1000

type Wish struct {
	ID            string     `json:"id"`
	Title         string     `json:"title"`
	Detail        string     `json:"detail"`
	Category      Category   `json:"category"`
	Visibility    Visibility `json:"-"`
	Status        Status     `json:"status"`
	Reply         string     `json:"reply"`
	RepliedAt     *time.Time `json:"repliedAt"`
	FulfilledAt   *time.Time `json:"fulfilledAt"`
	SupportCount  int        `json:"supportCount"`
	SupportedByMe bool       `json:"supportedByMe"`
	CreatedAt     time.Time  `json:"createdAt"`
	UpdatedAt     time.Time  `json:"-"`
}

type CreateInput struct {
	ID         string   `json:"-"`
	Title      string   `json:"title"`
	Detail     string   `json:"detail"`
	Category   Category `json:"category"`
	ActorHash  []byte   `json:"-"`
	Visibility Visibility
}

// UpdateInput is the admin PATCH body. Every field is optional; an empty
// reply string clears the team reply.
type UpdateInput struct {
	Visibility *Visibility `json:"visibility"`
	Status     *Status     `json:"status"`
	Reply      *string     `json:"reply"`
}

func (u UpdateInput) Empty() bool {
	return u.Visibility == nil && u.Status == nil && u.Reply == nil
}

type SupportResult struct {
	Supported    bool `json:"supported"`
	SupportCount int  `json:"supportCount"`
}

var MigrationStatements = []string{
	`CREATE TABLE IF NOT EXISTS wishes (
		id uuid PRIMARY KEY,
		title text NOT NULL,
		detail text NOT NULL DEFAULT '',
		category text NOT NULL CHECK (category IN ('life','transport','learning','space','other')),
		visibility text NOT NULL DEFAULT 'pending' CHECK (visibility IN ('published','pending','hidden')),
		actor_hash bytea NOT NULL,
		created_at timestamptz NOT NULL DEFAULT now(),
		updated_at timestamptz NOT NULL DEFAULT now()
	)`,
	`ALTER TABLE wishes ALTER COLUMN visibility SET DEFAULT 'pending'`,
	`CREATE INDEX IF NOT EXISTS wishes_public_created_idx ON wishes (created_at DESC) WHERE visibility = 'published'`,
	`CREATE INDEX IF NOT EXISTS wishes_actor_created_idx ON wishes (actor_hash, created_at DESC)`,
	`CREATE TABLE IF NOT EXISTS wish_supports (
		wish_id uuid NOT NULL REFERENCES wishes(id) ON DELETE CASCADE,
		actor_hash bytea NOT NULL,
		created_at timestamptz NOT NULL DEFAULT now(),
		PRIMARY KEY (wish_id, actor_hash)
	)`,
	// Processing status and team reply (issue #99). ADD COLUMN IF NOT EXISTS keeps
	// the statements idempotent; existing rows become open wishes without a reply.
	`ALTER TABLE wishes ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'open'
		CHECK (status IN ('open','fulfilled'))`,
	`ALTER TABLE wishes ADD COLUMN IF NOT EXISTS reply text NOT NULL DEFAULT ''
		CHECK (char_length(reply) <= 1000)`,
	`ALTER TABLE wishes ADD COLUMN IF NOT EXISTS replied_at timestamptz`,
	`ALTER TABLE wishes ADD COLUMN IF NOT EXISTS fulfilled_at timestamptz`,
	`CREATE INDEX IF NOT EXISTS wishes_public_status_created_idx
		ON wishes (status, created_at DESC) WHERE visibility = 'published'`,
}
