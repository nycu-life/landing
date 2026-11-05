package wishes

import (
	"bytes"
	"encoding/json"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
)

const (
	testServiceToken = "superapp-service-token-0123456789abcdef"
	testOtherToken   = "other-service-token-0123456789abcdefgh"
	testWishID       = "00000000-0000-4000-8000-000000000001"
)

func serviceHandler(t *testing.T, store *fakeStore) *Handler {
	t.Helper()
	clients, err := ParseServiceClients("superapp:" + testServiceToken + ", other:" + testOtherToken)
	if err != nil {
		t.Fatal(err)
	}
	handler, err := NewHandler(
		store,
		"0123456789abcdef0123456789abcdef",
		"admin-token-for-tests",
		nil,
		slog.New(slog.NewTextHandler(io.Discard, nil)),
		WithServiceClients(clients),
	)
	if err != nil {
		t.Fatal(err)
	}
	return handler
}

func serviceRequest(
	t *testing.T,
	handler http.Handler,
	method, target, body, token, actor string,
) *httptest.ResponseRecorder {
	t.Helper()
	request := httptest.NewRequest(method, target, bytes.NewBufferString(body))
	request.Host = "nycu.life"
	if body != "" {
		request.Header.Set("Content-Type", "application/json")
	}
	if token != "" {
		request.Header.Set("Authorization", "Bearer "+token)
	}
	if actor != "" {
		request.Header.Set(ServiceActorHeader, actor)
	}
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)
	return recorder
}

func TestParseServiceClients(t *testing.T) {
	clients, err := ParseServiceClients(" superapp:" + testServiceToken + " ,other:" + testOtherToken + " ")
	if err != nil {
		t.Fatal(err)
	}
	if len(clients) != 2 || clients[0].Name != "superapp" || clients[1].Name != "other" {
		t.Fatalf("unexpected clients: %v", clients)
	}
	if strings.Contains(clients[0].String(), testServiceToken) {
		t.Fatal("client String() must not expose the token")
	}
	if clients, err := ParseServiceClients("   "); err != nil || clients != nil {
		t.Fatalf("empty configuration should disable service access, got %v %v", clients, err)
	}
	for name, raw := range map[string]string{
		"missing separator": "superapp" + testServiceToken,
		"short token":       "superapp:too-short",
		"empty name":        ":" + testServiceToken,
		"uppercase name":    "SuperApp:" + testServiceToken,
		"token whitespace":  "superapp:" + testServiceToken + " x",
		"duplicate name":    "superapp:" + testServiceToken + ",superapp:" + testOtherToken,
		"duplicate token":   "superapp:" + testServiceToken + ",other:" + testServiceToken,
		"trailing comma":    "superapp:" + testServiceToken + ",",
	} {
		_, err := ParseServiceClients(raw)
		if err == nil {
			t.Errorf("%s: expected an error", name)
			continue
		}
		if strings.Contains(err.Error(), testServiceToken) || strings.Contains(err.Error(), testOtherToken) {
			t.Errorf("%s: error leaks the token: %v", name, err)
		}
	}
}

func TestServiceTokenMustNotReuseAdminToken(t *testing.T) {
	token := "shared-admin-and-service-token-0123456789"
	clients, err := ParseServiceClients("superapp:" + token)
	if err != nil {
		t.Fatal(err)
	}
	_, err = NewHandler(&fakeStore{}, "0123456789abcdef0123456789abcdef", token, nil, nil, WithServiceClients(clients))
	if err == nil || strings.Contains(err.Error(), token) {
		t.Fatalf("expected a token-free startup error, got %v", err)
	}
}

func TestServiceCreateUsesPerUserActorWithoutCookies(t *testing.T) {
	store := &fakeStore{}
	handler := serviceHandler(t, store).Routes()
	body := `{"title":"希望校車能顯示即時擁擠度","detail":"","category":"transport"}`

	recorder := serviceRequest(t, handler, http.MethodPost, "/api/wishes", body, testServiceToken, "user-a")
	if recorder.Code != http.StatusCreated {
		t.Fatalf("service create returned %d: %s", recorder.Code, recorder.Body.String())
	}
	if len(recorder.Result().Cookies()) != 0 {
		t.Fatal("service requests must not receive cookies")
	}
	if store.created.Visibility != VisibilityPending {
		t.Fatal("service wishes still wait for review")
	}
	userA := append([]byte(nil), store.created.ActorHash...)

	serviceRequest(t, handler, http.MethodPost, "/api/wishes", body, testServiceToken, "user-b")
	userB := append([]byte(nil), store.created.ActorHash...)
	serviceRequest(t, handler, http.MethodPost, "/api/wishes", body, testOtherToken, "user-a")
	otherClient := append([]byte(nil), store.created.ActorHash...)
	serviceRequest(t, handler, http.MethodPost, "/api/wishes", body, testServiceToken, "user-a")
	userAAgain := store.created.ActorHash

	if bytes.Equal(userA, userB) {
		t.Fatal("different BFF users must map to different actors")
	}
	if bytes.Equal(userA, otherClient) {
		t.Fatal("the same actor id from different clients must not collide")
	}
	if !bytes.Equal(userA, userAAgain) || len(userA) != sha256Size {
		t.Fatal("the same BFF user must map to a stable actor")
	}

	// A browser cookie actor never equals a service actor.
	browser := requestJSON(t, handler, http.MethodPost, "/api/wishes", body)
	if browser.Code != http.StatusCreated || bytes.Equal(store.created.ActorHash, userA) {
		t.Fatalf("browser create returned %d", browser.Code)
	}
}

func TestServiceWritesRequireActorAndValidToken(t *testing.T) {
	store := &fakeStore{supportResult: SupportResult{Supported: true, SupportCount: 2}}
	handler := serviceHandler(t, store).Routes()
	body := `{"title":"想要更多插座","category":"space"}`
	support := "/api/wishes/" + testWishID + "/support"

	cases := []struct {
		name, method, target, body, token, actor string
		status                                   int
	}{
		{"create without actor", http.MethodPost, "/api/wishes", body, testServiceToken, "", http.StatusBadRequest},
		{"support without actor", http.MethodPost, support, "", testServiceToken, "", http.StatusBadRequest},
		{"oversized actor", http.MethodPost, support, "", testServiceToken, strings.Repeat("a", 129), http.StatusBadRequest},
		{"non-printable actor", http.MethodPost, support, "", testServiceToken, "user\x01a", http.StatusBadRequest},
		{"unknown token", http.MethodPost, support, "", "unknown-service-token-0123456789abcdef", "user-a", http.StatusUnauthorized},
		{"admin token on public write", http.MethodPost, support, "", "admin-token-for-tests", "user-a", http.StatusUnauthorized},
		{"unknown token on read", http.MethodGet, "/api/wishes", "", "unknown-service-token-0123456789abcdef", "", http.StatusUnauthorized},
		{"support with actor", http.MethodPost, support, "", testServiceToken, "user-a", http.StatusOK},
	}
	for _, tc := range cases {
		recorder := serviceRequest(t, handler, tc.method, tc.target, tc.body, tc.token, tc.actor)
		if recorder.Code != tc.status {
			t.Errorf("%s: got %d want %d: %s", tc.name, recorder.Code, tc.status, recorder.Body.String())
		}
		if tc.status == http.StatusUnauthorized && recorder.Header().Get("WWW-Authenticate") == "" {
			t.Errorf("%s: missing WWW-Authenticate", tc.name)
		}
		if len(recorder.Result().Cookies()) != 0 {
			t.Errorf("%s: service requests must not receive cookies", tc.name)
		}
	}

	// Malformed bearer schemes are rejected rather than silently treated as browsers.
	request := httptest.NewRequest(http.MethodGet, "/api/wishes", nil)
	request.Header.Set("Authorization", "Basic "+testServiceToken)
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("non-bearer authorization returned %d", recorder.Code)
	}
}

func TestServiceWritesBypassBrowserOriginCheck(t *testing.T) {
	store := &fakeStore{supportResult: SupportResult{Supported: true, SupportCount: 2}}
	handler := serviceHandler(t, store).Routes()
	request := httptest.NewRequest(http.MethodPost, "/api/wishes/"+testWishID+"/support", nil)
	request.Host = "wish-api.landing.svc"
	request.Header.Set("Origin", "https://superapp.nycu.life")
	request.Header.Set("Authorization", "Bearer "+testServiceToken)
	request.Header.Set(ServiceActorHeader, "user-a")
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusOK {
		t.Fatalf("service support returned %d: %s", recorder.Code, recorder.Body.String())
	}

	// Cookie-based writes keep the same-origin check.
	request = httptest.NewRequest(http.MethodPost, "/api/wishes/"+testWishID+"/support", nil)
	request.Host = "nycu.life"
	request.Header.Set("Origin", "https://attacker.example")
	recorder = httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusForbidden {
		t.Fatalf("cross-origin browser support returned %d", recorder.Code)
	}
}

func TestServiceReadsComputeSupportedByMeOnlyWithActor(t *testing.T) {
	store := &fakeStore{items: []Wish{}}
	handler := serviceHandler(t, store).Routes()

	recorder := serviceRequest(t, handler, http.MethodGet, "/api/wishes", "", testServiceToken, "")
	if recorder.Code != http.StatusOK || store.listActor != nil || len(recorder.Result().Cookies()) != 0 {
		t.Fatalf("anonymous service read returned %d with actor %x", recorder.Code, store.listActor)
	}
	recorder = serviceRequest(t, handler, http.MethodGet, "/api/wishes?status=fulfilled", "", testServiceToken, "user-a")
	if recorder.Code != http.StatusOK || len(store.listActor) != sha256Size || store.listStatus != StatusFulfilled {
		t.Fatalf("service read returned %d with status %q", recorder.Code, store.listStatus)
	}
}

func TestServiceTokenNeverGrantsAdminAccess(t *testing.T) {
	store := &fakeStore{}
	handler := serviceHandler(t, store).Routes()
	for _, method := range []string{http.MethodGet, http.MethodPatch} {
		target := "/api/wishes/admin"
		body := ""
		if method == http.MethodPatch {
			target += "/" + testWishID
			body = `{"visibility":"published"}`
		}
		recorder := serviceRequest(t, handler, method, target, body, testServiceToken, "user-a")
		if recorder.Code != http.StatusUnauthorized {
			t.Fatalf("service token on admin %s returned %d", method, recorder.Code)
		}
	}
	// The break-glass admin token keeps working with service clients configured.
	recorder := serviceRequest(t, handler, http.MethodGet, "/api/wishes/admin?visibility=pending", "", "admin-token-for-tests", "")
	if recorder.Code != http.StatusOK {
		t.Fatalf("admin token returned %d", recorder.Code)
	}

	// A service token alongside a valid admin session cookie is still refused.
	h := serviceHandler(t, store)
	h.now = func() time.Time { return time.Unix(1_700_000_000, 0).UTC() }
	session, err := h.encodeSignedCookie("admin-session", adminSession{
		Subject: "authentik-user-id",
		Expires: time.Unix(1_700_000_000, 0).Add(time.Hour).Unix(),
	})
	if err != nil {
		t.Fatal(err)
	}
	request := httptest.NewRequest(http.MethodGet, "/api/wishes/admin", nil)
	request.AddCookie(&http.Cookie{Name: adminSessionCookie, Value: session})
	request.Header.Set("Authorization", "Bearer "+testServiceToken)
	recorder = httptest.NewRecorder()
	h.Routes().ServeHTTP(recorder, request)
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("service token with admin cookie returned %d", recorder.Code)
	}
	request = httptest.NewRequest(http.MethodGet, "/api/wishes/admin", nil)
	request.AddCookie(&http.Cookie{Name: adminSessionCookie, Value: session})
	recorder = httptest.NewRecorder()
	h.Routes().ServeHTTP(recorder, request)
	if recorder.Code != http.StatusOK {
		t.Fatalf("admin session alone returned %d", recorder.Code)
	}
}

func TestPublicListStatusFilterAndWishShape(t *testing.T) {
	fulfilledAt := time.Date(2026, 10, 1, 8, 0, 0, 0, time.UTC)
	store := &fakeStore{items: []Wish{{
		ID:          testWishID,
		Title:       "希望校車能顯示即時擁擠度",
		Category:    CategoryTransport,
		Visibility:  VisibilityPublished,
		Status:      StatusFulfilled,
		Reply:       "已在 NYCU LIFE 上線！",
		RepliedAt:   &fulfilledAt,
		FulfilledAt: &fulfilledAt,
		CreatedAt:   fulfilledAt.Add(-48 * time.Hour),
	}}}
	handler := testHandler(t, store)

	recorder := requestJSON(t, handler, http.MethodGet, "/api/wishes", "")
	if recorder.Code != http.StatusOK || store.listStatus != StatusOpen {
		t.Fatalf("default list returned %d with status %q", recorder.Code, store.listStatus)
	}
	recorder = requestJSON(t, handler, http.MethodGet, "/api/wishes?status=fulfilled", "")
	if recorder.Code != http.StatusOK || store.listStatus != StatusFulfilled {
		t.Fatalf("fulfilled list returned %d with status %q", recorder.Code, store.listStatus)
	}
	var payload struct {
		Data []map[string]any `json:"data"`
	}
	if err := json.Unmarshal(recorder.Body.Bytes(), &payload); err != nil {
		t.Fatal(err)
	}
	wish := payload.Data[0]
	if wish["status"] != "fulfilled" || wish["reply"] != "已在 NYCU LIFE 上線！" ||
		wish["fulfilledAt"] != "2026-10-01T08:00:00Z" || wish["repliedAt"] != "2026-10-01T08:00:00Z" {
		t.Fatalf("unexpected wish JSON: %v", wish)
	}
	if _, leaked := wish["visibility"]; leaked {
		t.Fatal("visibility must not be exposed publicly")
	}
	if recorder = requestJSON(t, handler, http.MethodGet, "/api/wishes?status=done", ""); recorder.Code != http.StatusBadRequest {
		t.Fatalf("invalid status returned %d", recorder.Code)
	}
}

func adminPatch(t *testing.T, handler http.Handler, body string) *httptest.ResponseRecorder {
	t.Helper()
	request := httptest.NewRequest(http.MethodPatch, "/api/wishes/admin/"+testWishID, bytes.NewBufferString(body))
	request.Header.Set("Authorization", "Bearer admin-token-for-tests")
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)
	return recorder
}

func TestAdminUpdateStatusAndReply(t *testing.T) {
	store := &fakeStore{}
	handler := testHandler(t, store)

	recorder := adminPatch(t, handler, `{"status":"fulfilled","reply":"  第一行\r\n第二行  "}`)
	if recorder.Code != http.StatusOK {
		t.Fatalf("status+reply update returned %d: %s", recorder.Code, recorder.Body.String())
	}
	if store.updated.Status == nil || *store.updated.Status != StatusFulfilled ||
		store.updated.Reply == nil || *store.updated.Reply != "第一行\n第二行" || store.updated.Visibility != nil {
		t.Fatalf("unexpected update input: %#v", store.updated)
	}

	if recorder = adminPatch(t, handler, `{"reply":""}`); recorder.Code != http.StatusOK ||
		store.updated.Reply == nil || *store.updated.Reply != "" {
		t.Fatalf("clearing reply returned %d", recorder.Code)
	}

	for name, body := range map[string]string{
		"empty patch":      `{}`,
		"invalid status":   `{"status":"done"}`,
		"invalid vis":      `{"visibility":"deleted"}`,
		"long reply":       `{"reply":"` + strings.Repeat("回", MaxReplyLength+1) + `"}`,
		"control in reply": `{"reply":"bad\u0007bell"}`,
		"unknown field":    `{"reply":"ok","pinned":true}`,
	} {
		if recorder := adminPatch(t, handler, body); recorder.Code != http.StatusBadRequest {
			t.Errorf("%s: got %d: %s", name, recorder.Code, recorder.Body.String())
		}
	}
	// A maximum-length CJK reply fits within the admin body limit.
	if recorder := adminPatch(t, handler, `{"reply":"`+strings.Repeat("回", MaxReplyLength)+`"}`); recorder.Code != http.StatusOK {
		t.Fatalf("max-length reply returned %d: %s", recorder.Code, recorder.Body.String())
	}
}

func TestAdminListStatusFilter(t *testing.T) {
	store := &fakeStore{}
	handler := testHandler(t, store)
	request := func(target string) int {
		r := httptest.NewRequest(http.MethodGet, target, nil)
		r.Header.Set("Authorization", "Bearer admin-token-for-tests")
		recorder := httptest.NewRecorder()
		handler.ServeHTTP(recorder, r)
		return recorder.Code
	}
	if code := request("/api/wishes/admin?visibility=published"); code != http.StatusOK || store.adminStatus != "" {
		t.Fatalf("unfiltered admin list returned %d with %q", code, store.adminStatus)
	}
	if code := request("/api/wishes/admin?visibility=published&status=fulfilled"); code != http.StatusOK ||
		store.adminStatus != StatusFulfilled {
		t.Fatalf("filtered admin list returned %d with %q", code, store.adminStatus)
	}
	if code := request("/api/wishes/admin?status=bogus"); code != http.StatusBadRequest {
		t.Fatalf("invalid admin status returned %d", code)
	}
}

func TestAdminUpdatesNotifyOnlyForPublicChanges(t *testing.T) {
	store := &fakeStore{}
	handler, err := NewHandler(store, "0123456789abcdef0123456789abcdef", "admin-token-for-tests", nil, nil)
	if err != nil {
		t.Fatal(err)
	}
	updates, unsubscribe := handler.changes.subscribe()
	defer unsubscribe()
	drain := func() bool {
		select {
		case <-updates:
			return true
		default:
			return false
		}
	}

	store.updatedWish = &Wish{ID: testWishID, Visibility: VisibilityPublished, Status: StatusFulfilled}
	adminPatch(t, handler.Routes(), `{"status":"fulfilled"}`)
	if !drain() {
		t.Fatal("fulfilling a published wish must notify live listeners")
	}
	store.updatedWish = &Wish{ID: testWishID, Visibility: VisibilityPending, Status: StatusOpen}
	adminPatch(t, handler.Routes(), `{"reply":"thanks"}`)
	if drain() {
		t.Fatal("replying to a pending wish must not notify public listeners")
	}
	store.updatedWish = &Wish{ID: testWishID, Visibility: VisibilityHidden, Status: StatusOpen}
	adminPatch(t, handler.Routes(), `{"visibility":"hidden"}`)
	if !drain() {
		t.Fatal("hiding a wish must notify live listeners")
	}
}
