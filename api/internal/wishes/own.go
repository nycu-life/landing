package wishes

import (
	"errors"
	"fmt"
	"net/http"
	"unicode/utf8"
)

// "My wishes" for service clients (the Super App BFF): an end user, identified
// by the same X-Wish-Actor that posted the wishes, lists them with their review
// state, edits them while they await review, and withdraws them.
//
// Browsers are not supported: their only identity is a device cookie, which is
// lost with the device or cleared site data.

const ownListLimit = 100

var (
	// ErrNotEditable: the wish has been reviewed; edits would bypass moderation.
	ErrNotEditable = errors.New("only wishes awaiting review can be edited")
	// ErrNotWithdrawable: fulfilled wishes stay as the team's record.
	ErrNotWithdrawable = errors.New("fulfilled wishes cannot be withdrawn")
)

// OwnWish is a wish as its author sees it, including the review state.
type OwnWish struct {
	Wish
	// Visibility is the review state: pending (awaiting review), published
	// (public), or hidden (not shown publicly).
	Visibility   Visibility `json:"visibility"`
	Editable     bool       `json:"editable"`
	Withdrawable bool       `json:"withdrawable"`
}

func newOwnWish(wish Wish) OwnWish {
	return OwnWish{
		Wish:         wish,
		Visibility:   wish.Visibility,
		Editable:     wish.Visibility == VisibilityPending,
		Withdrawable: wish.Status != StatusFulfilled,
	}
}

// OwnUpdateInput is the author's PATCH body; every field is optional.
type OwnUpdateInput struct {
	Title    *string   `json:"title"`
	Detail   *string   `json:"detail"`
	Category *Category `json:"category"`
}

func normalizeOwnUpdate(input *OwnUpdateInput) error {
	if input.Title == nil && input.Detail == nil && input.Category == nil {
		return errors.New("request must change title, detail, or category")
	}
	if input.Title != nil {
		title := normalizeText(*input.Title)
		if length := utf8.RuneCountInString(title); length < 4 || length > 120 {
			return errors.New("title must contain between 4 and 120 characters")
		}
		if containsUnsafeControl(title) {
			return errors.New("wish contains unsupported characters")
		}
		input.Title = &title
	}
	if input.Detail != nil {
		detail := normalizeText(*input.Detail)
		if utf8.RuneCountInString(detail) > 500 {
			return errors.New("detail must contain at most 500 characters")
		}
		if containsUnsafeControl(detail) {
			return errors.New("wish contains unsupported characters")
		}
		input.Detail = &detail
	}
	if input.Category != nil && !input.Category.Valid() {
		return errors.New("invalid category")
	}
	return nil
}

// ownActor requires a service client and an X-Wish-Actor.
func (h *Handler) ownActor(w http.ResponseWriter, r *http.Request) (requestActor, bool) {
	if r.Header.Get("Authorization") == "" {
		w.Header().Set("WWW-Authenticate", `Bearer realm="wish-api"`)
		writeError(w, http.StatusUnauthorized, "service authorization required")
		return requestActor{}, false
	}
	actor, code, err := h.resolveActor(w, r, true)
	if err != nil {
		h.writeActorError(w, r, code, err)
		return requestActor{}, false
	}
	return actor, true
}

func (h *Handler) ownList(w http.ResponseWriter, r *http.Request) {
	actor, ok := h.ownActor(w, r)
	if !ok {
		return
	}
	items, err := h.store.ListOwn(r.Context(), actor.hash, ownListLimit)
	if err != nil {
		h.internalError(w, r, err)
		return
	}
	data := make([]OwnWish, 0, len(items))
	for _, wish := range items {
		data = append(data, newOwnWish(wish))
	}
	w.Header().Set("Cache-Control", "private, no-store")
	writeJSON(w, http.StatusOK, map[string]any{"data": data})
}

func (h *Handler) ownUpdate(w http.ResponseWriter, r *http.Request) {
	actor, ok := h.ownActor(w, r)
	if !ok {
		return
	}
	id := r.PathValue("id")
	if !validUUID(id) {
		writeError(w, http.StatusNotFound, "wish not found")
		return
	}
	var input OwnUpdateInput
	if err := decodeJSON(w, r, &input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := normalizeOwnUpdate(&input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	wish, err := h.store.UpdateOwn(r.Context(), id, actor.hash, input)
	if h.writeOwnError(w, r, err) {
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"data": newOwnWish(wish)})
}

func (h *Handler) ownWithdraw(w http.ResponseWriter, r *http.Request) {
	actor, ok := h.ownActor(w, r)
	if !ok {
		return
	}
	id := r.PathValue("id")
	if !validUUID(id) {
		writeError(w, http.StatusNotFound, "wish not found")
		return
	}
	wasPublic, err := h.store.WithdrawOwn(r.Context(), id, actor.hash)
	if h.writeOwnError(w, r, err) {
		return
	}
	w.WriteHeader(http.StatusNoContent)
	if wasPublic {
		h.changes.publish()
	}
}

// writeOwnError renders a store error; it reports whether one was written.
func (h *Handler) writeOwnError(w http.ResponseWriter, r *http.Request, err error) bool {
	switch {
	case err == nil:
		return false
	case errors.Is(err, ErrNotFound):
		// Someone else's wish looks exactly like a missing one.
		writeError(w, http.StatusNotFound, "wish not found")
	case errors.Is(err, ErrNotEditable), errors.Is(err, ErrNotWithdrawable):
		writeError(w, http.StatusConflict, err.Error())
	default:
		h.internalError(w, r, fmt.Errorf("own wish: %w", err))
	}
	return true
}
