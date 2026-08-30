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
	List(ctx context.Context, actorHash []byte, limit int) ([]Wish, error)
	Create(ctx context.Context, input CreateInput) (Wish, error)
	ToggleSupport(ctx context.Context, id string, actorHash []byte) (SupportResult, error)
	AdminList(ctx context.Context, visibility Visibility, limit int) ([]Wish, error)
	AdminUpdate(ctx context.Context, id string, input UpdateInput) (Wish, error)
}
