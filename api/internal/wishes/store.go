package wishes

import (
	"context"
	"errors"
)

var (
	ErrNotFound    = errors.New("wish not found")
	ErrRateLimited = errors.New("wish submission rate limit exceeded")
)

type Store interface {
	Ping(ctx context.Context) error
	// List returns published wishes with the given status. actorHash may be nil,
	// in which case supportedByMe is false for every wish.
	List(ctx context.Context, actorHash []byte, status Status, limit int) ([]Wish, error)
	Create(ctx context.Context, input CreateInput) (Wish, error)
	ToggleSupport(ctx context.Context, id string, actorHash []byte) (SupportResult, error)
	// AdminList filters by visibility and, when status is non-empty, by status.
	AdminList(ctx context.Context, visibility Visibility, status Status, limit int) ([]Wish, error)
	AdminUpdate(ctx context.Context, id string, input UpdateInput) (Wish, error)
}
