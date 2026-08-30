package wishes

import (
	"bufio"
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"
	"time"
)

type fakeStore struct {
	items         []Wish
	created       CreateInput
	createErr     error
	supportResult SupportResult
	updated       UpdateInput
}

type fakeAdminAuthenticator struct {
	state       string
	nonce       string
	verifier    string
	code        string
	identity    AdminIdentity
	exchangeErr error
}

func (f *fakeAdminAuthenticator) AuthorizationURL(
	_ context.Context,
	state, nonce, verifier string,
) (string, error) {
	f.state = state
	f.nonce = nonce
	f.verifier = verifier
	return "https://auth.nycu.one/application/o/authorize/?state=" + url.QueryEscape(state), nil
}

func (f *fakeAdminAuthenticator) Exchange(
	_ context.Context,
	code, verifier, nonce string,
) (AdminIdentity, error) {
	f.code = code
	if verifier != f.verifier || nonce != f.nonce {
		return AdminIdentity{}, errors.New("OAuth callback did not preserve PKCE verifier and nonce")
	}
	return f.identity, f.exchangeErr
}

func (f *fakeStore) Ping(context.Context) error { return nil }
func (f *fakeStore) List(context.Context, []byte, int) ([]Wish, error) {
	return f.items, nil
}
func (f *fakeStore) Create(_ context.Context, input CreateInput) (Wish, error) {
	f.created = input
	if f.createErr != nil {
		return Wish{}, f.createErr
	}
	return Wish{
		ID:            input.ID,
		Title:         input.Title,
		Detail:        input.Detail,
		Category:      input.Category,
		Visibility:    input.Visibility,
		SupportCount:  1,
		SupportedByMe: true,
		CreatedAt:     time.Unix(1_700_000_000, 0).UTC(),
	}, nil
}
func (f *fakeStore) ToggleSupport(context.Context, string, []byte) (SupportResult, error) {
	return f.supportResult, nil
}
func (f *fakeStore) AdminList(context.Context, Visibility, int) ([]Wish, error) {
	return f.items, nil
}
func (f *fakeStore) AdminUpdate(_ context.Context, _ string, input UpdateInput) (Wish, error) {
	f.updated = input
	return Wish{ID: "00000000-0000-4000-8000-000000000001", Visibility: *input.Visibility}, nil
}

func testHandler(t *testing.T, store *fakeStore) http.Handler {
	t.Helper()
	return testHandlerWithAuth(t, store, nil)
}

func testHandlerWithAuth(t *testing.T, store *fakeStore, auth AdminAuthenticator) http.Handler {
	t.Helper()
	handler, err := NewHandler(
		store,
		"0123456789abcdef0123456789abcdef",
		"admin-token-for-tests",
		auth,
		slog.New(slog.NewTextHandler(io.Discard, nil)),
	)
	if err != nil {
		t.Fatal(err)
	}
	handler.now = func() time.Time { return time.Unix(1_700_000_000, 0).UTC() }
	return handler.Routes()
}

func responseCookie(t *testing.T, recorder *httptest.ResponseRecorder, name string) *http.Cookie {
	t.Helper()
	for _, cookie := range recorder.Result().Cookies() {
		if cookie.Name == name {
			return cookie
		}
	}
	t.Fatalf("response did not set %s cookie", name)
	return nil
}

func requestJSON(t *testing.T, handler http.Handler, method, target, body string) *httptest.ResponseRecorder {
	t.Helper()
	request := httptest.NewRequest(method, target, bytes.NewBufferString(body))
	request.Host = "nycu.life"
	request.Header.Set("Origin", "https://nycu.life")
	request.Header.Set("Content-Type", "application/json")
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)
	return recorder
}

func TestCreatePublishesNormalizedWishAndSetsAnonymousCookie(t *testing.T) {
	store := &fakeStore{}
	recorder := requestJSON(t, testHandler(t, store), http.MethodPost, "/api/wishes", `{
		"title":"  想知道   健身房人流  ",
		"detail":" 出發前  想先確認 ",
		"category":"life"
	}`)
	if recorder.Code != http.StatusCreated {
		t.Fatalf("create returned %d: %s", recorder.Code, recorder.Body.String())
	}
	if store.created.Title != "想知道 健身房人流" || store.created.Detail != "出發前 想先確認" {
		t.Fatalf("text was not normalized: %#v", store.created)
	}
	if store.created.Visibility != VisibilityPublished || len(store.created.ActorHash) != sha256Size {
		t.Fatalf("unexpected create metadata: %#v", store.created)
	}
	response := recorder.Result()
	defer response.Body.Close()
	cookies := response.Cookies()
	if len(cookies) != 1 || cookies[0].Name != deviceCookieName || !cookies[0].HttpOnly {
		t.Fatalf("missing secure device cookie: %#v", cookies)
	}
	var payload struct {
		Meta struct {
			Pending bool `json:"pending"`
		} `json:"meta"`
	}
	if err := json.NewDecoder(response.Body).Decode(&payload); err != nil {
		t.Fatal(err)
	}
	if payload.Meta.Pending {
		t.Fatal("ordinary wish should publish immediately")
	}
}

const sha256Size = 32

func TestCreateRoutesPersonalDataToReview(t *testing.T) {
	store := &fakeStore{}
	recorder := requestJSON(t, testHandler(t, store), http.MethodPost, "/api/wishes", `{
		"title":"請聯絡 0912345678 一起做專案",
		"detail":"",
		"category":"other"
	}`)
	if recorder.Code != http.StatusCreated {
		t.Fatalf("create returned %d: %s", recorder.Code, recorder.Body.String())
	}
	if store.created.Visibility != VisibilityPending {
		t.Fatalf("personal data should be pending, got %q", store.created.Visibility)
	}
	var payload struct {
		Meta struct {
			Pending bool `json:"pending"`
		} `json:"meta"`
	}
	if err := json.NewDecoder(recorder.Body).Decode(&payload); err != nil {
		t.Fatal(err)
	}
	if !payload.Meta.Pending {
		t.Fatal("pending metadata should be visible to the submitter")
	}
}

func TestCreateRejectsCrossOriginAndRateLimit(t *testing.T) {
	store := &fakeStore{}
	handler := testHandler(t, store)
	request := httptest.NewRequest(http.MethodPost, "/api/wishes", bytes.NewBufferString(`{"title":"想要更多插座","category":"space"}`))
	request.Host = "nycu.life"
	request.Header.Set("Origin", "https://attacker.example")
	recorder := httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusForbidden {
		t.Fatalf("cross-origin create returned %d", recorder.Code)
	}

	store.createErr = ErrRateLimited
	recorder = requestJSON(t, handler, http.MethodPost, "/api/wishes", `{"title":"想要更多插座","category":"space"}`)
	if recorder.Code != http.StatusTooManyRequests || recorder.Header().Get("Retry-After") != "3600" {
		t.Fatalf("rate limit returned %d with headers %#v", recorder.Code, recorder.Header())
	}
}

func TestSameOriginAcceptsTheProxyForwardedHost(t *testing.T) {
	request := httptest.NewRequest(http.MethodPost, "/api/wishes", nil)
	request.Host = "127.0.0.1:3001"
	request.Header.Set("Origin", "http://100.71.224.62:5174")
	request.Header.Set("X-Forwarded-Host", "100.71.224.62:5174")
	if !sameOrigin(request) {
		t.Fatal("the browser-facing host should remain same-origin behind a trusted proxy")
	}
}

func TestSupportAndAdminUpdate(t *testing.T) {
	store := &fakeStore{supportResult: SupportResult{Supported: true, SupportCount: 8}}
	handler := testHandler(t, store)
	id := "00000000-0000-4000-8000-000000000001"

	recorder := requestJSON(t, handler, http.MethodPost, "/api/wishes/"+id+"/support", "")
	if recorder.Code != http.StatusOK || !bytes.Contains(recorder.Body.Bytes(), []byte(`"supportCount":8`)) {
		t.Fatalf("support returned %d: %s", recorder.Code, recorder.Body.String())
	}
	recorder = requestJSON(t, handler, http.MethodPatch, "/api/wishes/admin/"+id, `{"visibility":"published"}`)
	if recorder.Code != http.StatusUnauthorized {
		t.Fatalf("unauthorized admin update returned %d", recorder.Code)
	}
	request := httptest.NewRequest(http.MethodPatch, "/api/wishes/admin/"+id, bytes.NewBufferString(`{"visibility":"published"}`))
	request.Header.Set("Authorization", "Bearer admin-token-for-tests")
	recorder = httptest.NewRecorder()
	handler.ServeHTTP(recorder, request)
	if recorder.Code != http.StatusOK || store.updated.Visibility == nil || *store.updated.Visibility != VisibilityPublished {
		t.Fatalf("admin update returned %d: %s", recorder.Code, recorder.Body.String())
	}
}

func TestAdminOIDCSessionFlowAndSameOriginProtection(t *testing.T) {
	store := &fakeStore{items: []Wish{{
		ID:         "00000000-0000-4000-8000-000000000001",
		Title:      "希望圖書館座位更好找",
		Visibility: VisibilityPending,
	}}}
	auth := &fakeAdminAuthenticator{identity: AdminIdentity{
		Subject: "authentik-user-id",
		Name:    "管理員",
		Method:  "oidc",
	}}
	handler := testHandlerWithAuth(t, store, auth)

	loginRequest := httptest.NewRequest(http.MethodGet, "/api/wishes/auth/login", nil)
	loginRequest.Host = "nycu.life"
	loginRequest.Header.Set("X-Forwarded-Proto", "https")
	login := httptest.NewRecorder()
	handler.ServeHTTP(login, loginRequest)
	if login.Code != http.StatusFound || auth.state == "" || auth.nonce == "" || auth.verifier == "" {
		t.Fatalf("login returned %d with redirect %q", login.Code, login.Header().Get("Location"))
	}
	stateCookie := responseCookie(t, login, oauthStateCookie)
	if !stateCookie.HttpOnly || !stateCookie.Secure || stateCookie.SameSite != http.SameSiteLaxMode {
		t.Fatalf("OAuth state cookie is not hardened: %#v", stateCookie)
	}

	callbackRequest := httptest.NewRequest(
		http.MethodGet,
		"/api/wishes/auth/callback?state="+url.QueryEscape(auth.state)+"&code=authorization-code",
		nil,
	)
	callbackRequest.Host = "nycu.life"
	callbackRequest.Header.Set("X-Forwarded-Proto", "https")
	callbackRequest.AddCookie(stateCookie)
	callback := httptest.NewRecorder()
	handler.ServeHTTP(callback, callbackRequest)
	if callback.Code != http.StatusFound || callback.Header().Get("Location") != adminReturnPath {
		t.Fatalf("callback returned %d with redirect %q", callback.Code, callback.Header().Get("Location"))
	}
	if auth.code != "authorization-code" {
		t.Fatalf("callback exchanged code %q", auth.code)
	}
	sessionCookie := responseCookie(t, callback, adminSessionCookie)
	if !sessionCookie.HttpOnly || !sessionCookie.Secure || sessionCookie.SameSite != http.SameSiteLaxMode {
		t.Fatalf("admin session cookie is not hardened: %#v", sessionCookie)
	}

	meRequest := httptest.NewRequest(http.MethodGet, "/api/wishes/auth/me", nil)
	meRequest.AddCookie(sessionCookie)
	me := httptest.NewRecorder()
	handler.ServeHTTP(me, meRequest)
	if me.Code != http.StatusOK ||
		!bytes.Contains(me.Body.Bytes(), []byte(`"authenticated":true`)) ||
		!bytes.Contains(me.Body.Bytes(), []byte(`"subject":"authentik-user-id"`)) {
		t.Fatalf("session lookup returned %d: %s", me.Code, me.Body.String())
	}

	listRequest := httptest.NewRequest(http.MethodGet, "/api/wishes/admin?visibility=pending", nil)
	listRequest.AddCookie(sessionCookie)
	list := httptest.NewRecorder()
	handler.ServeHTTP(list, listRequest)
	if list.Code != http.StatusOK || !bytes.Contains(list.Body.Bytes(), []byte("圖書館")) {
		t.Fatalf("session admin list returned %d: %s", list.Code, list.Body.String())
	}

	id := "00000000-0000-4000-8000-000000000001"
	attack := httptest.NewRequest(
		http.MethodPatch,
		"/api/wishes/admin/"+id,
		bytes.NewBufferString(`{"visibility":"published"}`),
	)
	attack.Host = "nycu.life"
	attack.Header.Set("Origin", "https://attacker.example")
	attack.Header.Set("Content-Type", "application/json")
	attack.AddCookie(sessionCookie)
	attackResponse := httptest.NewRecorder()
	handler.ServeHTTP(attackResponse, attack)
	if attackResponse.Code != http.StatusForbidden {
		t.Fatalf("cross-origin session update returned %d", attackResponse.Code)
	}

	update := httptest.NewRequest(
		http.MethodPatch,
		"/api/wishes/admin/"+id,
		bytes.NewBufferString(`{"visibility":"published"}`),
	)
	update.Host = "nycu.life"
	update.Header.Set("Origin", "https://nycu.life")
	update.Header.Set("Content-Type", "application/json")
	update.AddCookie(sessionCookie)
	updated := httptest.NewRecorder()
	handler.ServeHTTP(updated, update)
	if updated.Code != http.StatusOK || store.updated.Visibility == nil || *store.updated.Visibility != VisibilityPublished {
		t.Fatalf("same-origin session update returned %d: %s", updated.Code, updated.Body.String())
	}

	logout := httptest.NewRequest(http.MethodPost, "/api/wishes/auth/logout", nil)
	logout.Host = "nycu.life"
	logout.Header.Set("Origin", "https://nycu.life")
	logout.AddCookie(sessionCookie)
	loggedOut := httptest.NewRecorder()
	handler.ServeHTTP(loggedOut, logout)
	if loggedOut.Code != http.StatusOK || responseCookie(t, loggedOut, adminSessionCookie).MaxAge != -1 {
		t.Fatalf("logout returned %d: %s", loggedOut.Code, loggedOut.Body.String())
	}
}

func TestAdminOIDCRejectsInvalidStateAndExchangeFailure(t *testing.T) {
	auth := &fakeAdminAuthenticator{exchangeErr: errors.New("provider unavailable")}
	handler := testHandlerWithAuth(t, &fakeStore{}, auth)

	loginRequest := httptest.NewRequest(http.MethodGet, "/api/wishes/auth/login", nil)
	login := httptest.NewRecorder()
	handler.ServeHTTP(login, loginRequest)
	stateCookie := responseCookie(t, login, oauthStateCookie)

	invalidRequest := httptest.NewRequest(
		http.MethodGet,
		"/api/wishes/auth/callback?state=wrong&code=authorization-code",
		nil,
	)
	invalidRequest.AddCookie(stateCookie)
	invalid := httptest.NewRecorder()
	handler.ServeHTTP(invalid, invalidRequest)
	if invalid.Code != http.StatusFound || invalid.Header().Get("Location") != adminReturnPath+"?auth=invalid_callback" {
		t.Fatalf("invalid state returned %d with redirect %q", invalid.Code, invalid.Header().Get("Location"))
	}
	if auth.code != "" {
		t.Fatal("invalid state must not exchange an authorization code")
	}

	login = httptest.NewRecorder()
	handler.ServeHTTP(login, httptest.NewRequest(http.MethodGet, "/api/wishes/auth/login", nil))
	stateCookie = responseCookie(t, login, oauthStateCookie)
	deniedRequest := httptest.NewRequest(
		http.MethodGet,
		"/api/wishes/auth/callback?state="+url.QueryEscape(auth.state)+"&code=authorization-code",
		nil,
	)
	deniedRequest.AddCookie(stateCookie)
	denied := httptest.NewRecorder()
	handler.ServeHTTP(denied, deniedRequest)
	if denied.Code != http.StatusFound || denied.Header().Get("Location") != adminReturnPath+"?auth=invalid_callback" {
		t.Fatalf("exchange failure returned %d with redirect %q", denied.Code, denied.Header().Get("Location"))
	}
	for _, cookie := range denied.Result().Cookies() {
		if cookie.Name == adminSessionCookie && cookie.MaxAge >= 0 {
			t.Fatal("failed exchange must not receive an admin session")
		}
	}
}

func TestEventsPushPublishedWishChanges(t *testing.T) {
	store := &fakeStore{}
	server := httptest.NewServer(testHandler(t, store))
	defer server.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	request, err := http.NewRequestWithContext(ctx, http.MethodGet, server.URL+"/api/wishes/events", nil)
	if err != nil {
		t.Fatal(err)
	}
	response, err := http.DefaultClient.Do(request)
	if err != nil {
		t.Fatal(err)
	}
	defer response.Body.Close()
	if response.Header.Get("Content-Type") != "text/event-stream; charset=utf-8" {
		t.Fatalf("unexpected event content type: %q", response.Header.Get("Content-Type"))
	}
	scanner := bufio.NewScanner(response.Body)
	if !scanner.Scan() || scanner.Text() != "event: ready" {
		t.Fatalf("missing ready event: %q", scanner.Text())
	}

	post, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		server.URL+"/api/wishes",
		bytes.NewBufferString(`{"title":"希望圖書館座位更好找","detail":"","category":"learning"}`),
	)
	if err != nil {
		t.Fatal(err)
	}
	post.Header.Set("Content-Type", "application/json")
	post.Header.Set("Origin", server.URL)
	posted, err := http.DefaultClient.Do(post)
	if err != nil {
		t.Fatal(err)
	}
	defer posted.Body.Close()
	if posted.StatusCode != http.StatusCreated {
		t.Fatalf("create returned %d", posted.StatusCode)
	}

	foundChange := false
	for scanner.Scan() {
		if scanner.Text() == "event: wishes" {
			foundChange = true
			break
		}
	}
	if !foundChange {
		t.Fatalf("missing wish change event: %v", scanner.Err())
	}
}

func TestValidationAndReviewDetection(t *testing.T) {
	if !requiresReview("email me at hello@example.com") || !requiresReview("https://example.com") {
		t.Fatal("contact details and URLs should require review")
	}
	if requiresReview("希望可以顯示校車即時位置") {
		t.Fatal("ordinary campus wish should not require review")
	}
	if err := validateCreate(CreateInput{Title: "太短", Category: CategoryLife}); err == nil {
		t.Fatal("short title should fail validation")
	}
	if err := validateCreate(CreateInput{Title: "想要更多插座", Category: "invalid"}); err == nil {
		t.Fatal("invalid category should fail validation")
	}
	if !errors.Is(ErrNotFound, ErrNotFound) {
		t.Fatal("sentinel errors should be comparable")
	}
}
