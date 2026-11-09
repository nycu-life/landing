package wishes

import (
	"bytes"
	"encoding/json"
	"net/http"
	"testing"
)

func TestOwnWishesRequireServiceClientAndActor(t *testing.T) {
	store := &fakeStore{}
	handler := serviceHandler(t, store).Routes()
	for _, test := range []struct {
		name, method, target, token, actor string
		want                               int
	}{
		{"browser list", http.MethodGet, "/api/wishes/mine", "", "", http.StatusUnauthorized},
		{"browser withdraw", http.MethodDelete, "/api/wishes/mine/" + testWishID, "", "", http.StatusUnauthorized},
		{"bad token", http.MethodGet, "/api/wishes/mine", "not-a-valid-service-token-0123456789", "user-1", http.StatusUnauthorized},
		{"missing actor", http.MethodGet, "/api/wishes/mine", testServiceToken, "", http.StatusBadRequest},
		{"admin token", http.MethodGet, "/api/wishes/mine", "admin-token-for-tests", "user-1", http.StatusUnauthorized},
	} {
		t.Run(test.name, func(t *testing.T) {
			recorder := serviceRequest(t, handler, test.method, test.target, "", test.token, test.actor)
			if recorder.Code != test.want {
				t.Fatalf("status = %d, want %d: %s", recorder.Code, test.want, recorder.Body)
			}
			if len(recorder.Result().Cookies()) != 0 {
				t.Fatal("own-wish requests must not set cookies")
			}
		})
	}
}

func TestOwnListUsesTheSameActorAsCreate(t *testing.T) {
	store := &fakeStore{ownItems: []Wish{
		{ID: testWishID, Title: "pending wish", Visibility: VisibilityPending, Status: StatusOpen},
		{ID: "00000000-0000-4000-8000-000000000002", Title: "done", Visibility: VisibilityPublished, Status: StatusFulfilled, Reply: "done!"},
	}}
	handler := serviceHandler(t, store).Routes()
	created := serviceRequest(t, handler, http.MethodPost, "/api/wishes",
		`{"title":"more bike racks","category":"life"}`, testServiceToken, "user-1")
	if created.Code != http.StatusCreated {
		t.Fatalf("create = %d: %s", created.Code, created.Body)
	}
	recorder := serviceRequest(t, handler, http.MethodGet, "/api/wishes/mine", "", testServiceToken, "user-1")
	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d: %s", recorder.Code, recorder.Body)
	}
	if !bytes.Equal(store.ownActor, store.created.ActorHash) {
		t.Fatal("own list must use the actor hash the wish was created with")
	}
	if got := recorder.Header().Get("Cache-Control"); got != "private, no-store" {
		t.Fatalf("Cache-Control = %q", got)
	}
	var body struct {
		Data []map[string]any `json:"data"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if len(body.Data) != 2 {
		t.Fatalf("got %d wishes", len(body.Data))
	}
	first, second := body.Data[0], body.Data[1]
	if first["visibility"] != "pending" || first["editable"] != true || first["withdrawable"] != true {
		t.Fatalf("pending wish = %v", first)
	}
	if second["visibility"] != "published" || second["editable"] != false ||
		second["withdrawable"] != false || second["reply"] != "done!" {
		t.Fatalf("fulfilled wish = %v", second)
	}

	other := serviceRequest(t, handler, http.MethodGet, "/api/wishes/mine", "", testServiceToken, "user-2")
	if other.Code != http.StatusOK || bytes.Equal(store.ownActor, store.created.ActorHash) {
		t.Fatal("a different actor must map to a different hash")
	}
}

func TestOwnUpdateValidatesAndMapsErrors(t *testing.T) {
	store := &fakeStore{}
	handler := serviceHandler(t, store).Routes()
	target := "/api/wishes/mine/" + testWishID

	recorder := serviceRequest(t, handler, http.MethodPatch, target,
		`{"title":"  new   title  "}`, testServiceToken, "user-1")
	if recorder.Code != http.StatusOK {
		t.Fatalf("status = %d: %s", recorder.Code, recorder.Body)
	}
	if store.ownUpdate.Title == nil || *store.ownUpdate.Title != "new title" {
		t.Fatalf("title was not normalized: %v", store.ownUpdate.Title)
	}
	for _, body := range []string{`{}`, `{"title":"abc"}`, `{"category":"food"}`, `{"title":"ok title","extra":1}`} {
		if code := serviceRequest(t, handler, http.MethodPatch, target, body, testServiceToken, "user-1").Code; code != http.StatusBadRequest {
			t.Fatalf("%s: status = %d, want 400", body, code)
		}
	}
	if code := serviceRequest(t, handler, http.MethodPatch, "/api/wishes/mine/not-a-uuid",
		`{"title":"new title"}`, testServiceToken, "user-1").Code; code != http.StatusNotFound {
		t.Fatalf("invalid id: status = %d", code)
	}

	store.ownErr = ErrNotEditable
	if code := serviceRequest(t, handler, http.MethodPatch, target,
		`{"title":"new title"}`, testServiceToken, "user-1").Code; code != http.StatusConflict {
		t.Fatalf("reviewed wish: status = %d, want 409", code)
	}
	store.ownErr = ErrNotFound
	if code := serviceRequest(t, handler, http.MethodPatch, target,
		`{"title":"new title"}`, testServiceToken, "user-1").Code; code != http.StatusNotFound {
		t.Fatalf("someone else's wish: status = %d, want 404", code)
	}
}

func TestOwnWithdraw(t *testing.T) {
	store := &fakeStore{ownWasPublic: true}
	wishes := serviceHandler(t, store)
	handler := wishes.Routes()
	target := "/api/wishes/mine/" + testWishID
	notified, unsubscribe := wishes.changes.subscribe()
	defer unsubscribe()

	recorder := serviceRequest(t, handler, http.MethodDelete, target, "", testServiceToken, "user-1")
	if recorder.Code != http.StatusNoContent || store.ownWithdrawn != testWishID {
		t.Fatalf("status = %d, withdrawn = %q", recorder.Code, store.ownWithdrawn)
	}
	select {
	case <-notified:
	default:
		t.Fatal("withdrawing a public wish must notify live lists")
	}

	store.ownErr = ErrNotWithdrawable
	if code := serviceRequest(t, handler, http.MethodDelete, target, "", testServiceToken, "user-1").Code; code != http.StatusConflict {
		t.Fatalf("fulfilled wish: status = %d, want 409", code)
	}
}
