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

type Wish struct {
	ID            string     `json:"id"`
	Title         string     `json:"title"`
	Detail        string     `json:"detail"`
	Category      Category   `json:"category"`
	Visibility    Visibility `json:"-"`
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

type UpdateInput struct {
	Visibility *Visibility `json:"visibility"`
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
		visibility text NOT NULL DEFAULT 'published' CHECK (visibility IN ('published','pending','hidden')),
		actor_hash bytea NOT NULL,
		created_at timestamptz NOT NULL DEFAULT now(),
		updated_at timestamptz NOT NULL DEFAULT now()
	)`,
	`CREATE INDEX IF NOT EXISTS wishes_public_created_idx ON wishes (created_at DESC) WHERE visibility = 'published'`,
	`CREATE INDEX IF NOT EXISTS wishes_actor_created_idx ON wishes (actor_hash, created_at DESC)`,
	`CREATE TABLE IF NOT EXISTS wish_supports (
		wish_id uuid NOT NULL REFERENCES wishes(id) ON DELETE CASCADE,
		actor_hash bytea NOT NULL,
		created_at timestamptz NOT NULL DEFAULT now(),
		PRIMARY KEY (wish_id, actor_hash)
	)`,
}
