package wishes

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"net/url"
	"strings"
	"time"
	"unicode"
	"unicode/utf8"
)

const (
	deviceCookieName  = "nycu_wish_device"
	maxBodyBytes      = 4096
	maxAdminBodyBytes = 16 << 10
	publicListLimit   = 24
)

type Handler struct {
	store          Store
	cookieSecret   []byte
	adminToken     string
	adminAuth      AdminAuthenticator
	serviceClients []ServiceClient
	cmsSSOSecret   []byte
	logger         *slog.Logger
	now            func() time.Time
	changes        *changeBroker
}

// HandlerOption configures optional Handler features.
type HandlerOption func(*Handler)

// WithServiceClients enables server-to-server (BFF) access for the given clients.
func WithServiceClients(clients []ServiceClient) HandlerOption {
	return func(h *Handler) { h.serviceClients = clients }
}

// WithCMSSSOSecret makes the CMS gate vouch for signed-in admins to Ghost: every
// allowed request carries a short-lived signed identity token (cmssso.go) that
// the Ghost SSO adapter maps to the matching staff email. Empty disables it.
func WithCMSSSOSecret(secret string) HandlerOption {
	return func(h *Handler) {
		if secret != "" {
			h.cmsSSOSecret = []byte(secret)
		}
	}
}

func NewHandler(
	store Store,
	cookieSecret, adminToken string,
	adminAuth AdminAuthenticator,
	logger *slog.Logger,
	options ...HandlerOption,
) (*Handler, error) {
	if store == nil {
		return nil, errors.New("wish store is required")
	}
	if len(cookieSecret) < 32 {
		return nil, errors.New("WISH_COOKIE_SECRET must contain at least 32 characters")
	}
	if logger == nil {
		logger = slog.Default()
	}
	handler := &Handler{
		store:        store,
		cookieSecret: []byte(cookieSecret),
		adminToken:   adminToken,
		adminAuth:    adminAuth,
		logger:       logger,
		now:          time.Now,
		changes:      newChangeBroker(),
	}
	for _, option := range options {
		option(handler)
	}
	if adminToken != "" {
		adminDigest := sha256.Sum256([]byte(adminToken))
		for _, client := range handler.serviceClients {
			if subtle.ConstantTimeCompare(adminDigest[:], client.digest[:]) == 1 {
				return nil, fmt.Errorf("WISH_SERVICE_CLIENTS client %q must not reuse WISH_ADMIN_TOKEN", client.Name)
			}
		}
	}
	return handler, nil
}

func (h *Handler) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/wishes/healthz", h.health)
	mux.HandleFunc("GET /api/wishes", h.list)
	mux.HandleFunc("GET /api/wishes/events", h.events)
	mux.HandleFunc("POST /api/wishes", h.create)
	mux.HandleFunc("POST /api/wishes/{id}/support", h.support)
	mux.HandleFunc("GET /api/wishes/auth/login", h.authLogin)
	mux.HandleFunc("GET /api/wishes/auth/callback", h.authCallback)
	mux.HandleFunc("GET /api/wishes/auth/me", h.authMe)
	mux.HandleFunc("/api/wishes/auth/gate", h.authGate)
	mux.HandleFunc("POST /api/wishes/auth/logout", h.authLogout)
	mux.HandleFunc("GET /api/wishes/admin", h.adminList)
	mux.HandleFunc("PATCH /api/wishes/admin/{id}", h.adminUpdate)
	return h.securityHeaders(h.recoverPanics(mux))
}

func (h *Handler) health(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), 2*time.Second)
	defer cancel()
	if err := h.store.Ping(ctx); err != nil {
		h.internalError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"status": "ok"})
}

func (h *Handler) list(w http.ResponseWriter, r *http.Request) {
	status := Status(r.URL.Query().Get("status"))
	if status == "" {
		status = StatusOpen
	}
	if !status.Valid() {
		writeError(w, http.StatusBadRequest, "invalid status")
		return
	}
	actor, code, err := h.resolveActor(w, r, false)
	if err != nil {
		h.writeActorError(w, r, code, err)
		return
	}
	items, err := h.store.List(r.Context(), actor.hash, status, publicListLimit)
	if err != nil {
		h.internalError(w, r, err)
		return
	}
	w.Header().Set("Cache-Control", "private, no-store")
	writeJSON(w, http.StatusOK, map[string]any{"data": items})
}

func (h *Handler) events(w http.ResponseWriter, r *http.Request) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		writeError(w, http.StatusInternalServerError, "live updates are unavailable")
		return
	}
	// This response intentionally outlives the server's normal request write timeout.
	_ = http.NewResponseController(w).SetWriteDeadline(time.Time{})
	w.Header().Set("Content-Type", "text/event-stream; charset=utf-8")
	w.Header().Set("Cache-Control", "no-cache, no-store, no-transform")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")
	_, _ = io.WriteString(w, "event: ready\ndata: {}\n\n")
	flusher.Flush()

	updates, unsubscribe := h.changes.subscribe()
	defer unsubscribe()
	heartbeat := time.NewTicker(15 * time.Second)
	defer heartbeat.Stop()
	for {
		select {
		case <-r.Context().Done():
			return
		case <-updates:
			_, _ = io.WriteString(w, "event: wishes\ndata: {}\n\n")
			flusher.Flush()
		case <-heartbeat.C:
			_, _ = io.WriteString(w, ": keepalive\n\n")
			flusher.Flush()
		}
	}
}

// writeActor resolves the actor for a public write. Cookie-based (browser)
// writes must be same-origin; service requests authenticate with a bearer
// token instead and carry no Origin.
func (h *Handler) writeActor(w http.ResponseWriter, r *http.Request) (requestActor, bool) {
	if r.Header.Get("Authorization") == "" && !sameOrigin(r) {
		writeError(w, http.StatusForbidden, "cross-origin writes are not allowed")
		return requestActor{}, false
	}
	actor, code, err := h.resolveActor(w, r, true)
	if err != nil {
		h.writeActorError(w, r, code, err)
		return requestActor{}, false
	}
	return actor, true
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	actor, ok := h.writeActor(w, r)
	if !ok {
		return
	}
	var err error
	var input CreateInput
	if err := decodeJSON(w, r, &input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	input.Title = normalizeText(input.Title)
	input.Detail = normalizeText(input.Detail)
	if err := validateCreate(input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	input.ID, err = newUUID()
	if err != nil {
		h.internalError(w, r, err)
		return
	}
	input.ActorHash = actor.hash
	// Every wish waits for an administrator to approve it before it becomes
	// public, so user-submitted content is never served without review.
	input.Visibility = VisibilityPending

	wish, err := h.store.Create(r.Context(), input)
	if errors.Is(err, ErrRateLimited) {
		w.Header().Set("Retry-After", "3600")
		writeError(w, http.StatusTooManyRequests, "you can post up to three wishes per hour")
		return
	}
	if err != nil {
		h.internalError(w, r, err)
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{
		"data": wish,
		"meta": map[string]bool{"pending": wish.Visibility == VisibilityPending},
	})
}

func (h *Handler) support(w http.ResponseWriter, r *http.Request) {
	actor, ok := h.writeActor(w, r)
	if !ok {
		return
	}
	id := r.PathValue("id")
	if !validUUID(id) {
		writeError(w, http.StatusNotFound, "wish not found")
		return
	}
	result, err := h.store.ToggleSupport(r.Context(), id, actor.hash)
	if errors.Is(err, ErrNotFound) {
		writeError(w, http.StatusNotFound, "wish not found")
		return
	}
	if err != nil {
		h.internalError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"data": result})
	h.changes.publish()
}

func (h *Handler) adminList(w http.ResponseWriter, r *http.Request) {
	if _, ok := h.adminIdentity(r); !ok {
		writeError(w, http.StatusUnauthorized, "admin authorization required")
		return
	}
	visibility := Visibility(r.URL.Query().Get("visibility"))
	if visibility == "" {
		visibility = VisibilityPending
	}
	if !visibility.Valid() {
		writeError(w, http.StatusBadRequest, "invalid visibility")
		return
	}
	status := Status(r.URL.Query().Get("status"))
	if status != "" && !status.Valid() {
		writeError(w, http.StatusBadRequest, "invalid status")
		return
	}
	items, err := h.store.AdminList(r.Context(), visibility, status, 100)
	if err != nil {
		h.internalError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"data": items})
}

func (h *Handler) adminUpdate(w http.ResponseWriter, r *http.Request) {
	identity, ok := h.adminIdentity(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "admin authorization required")
		return
	}
	if identity.Method == "oidc" && !sameOrigin(r) {
		writeError(w, http.StatusForbidden, "cross-origin writes are not allowed")
		return
	}
	id := r.PathValue("id")
	if !validUUID(id) {
		writeError(w, http.StatusNotFound, "wish not found")
		return
	}
	var input UpdateInput
	if err := decodeJSONLimit(w, r, &input, maxAdminBodyBytes); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if err := normalizeUpdate(&input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	wish, err := h.store.AdminUpdate(r.Context(), id, input)
	if errors.Is(err, ErrNotFound) {
		writeError(w, http.StatusNotFound, "wish not found")
		return
	}
	if err != nil {
		h.internalError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"data": wish})
	h.logger.Info(
		"wish admin update",
		"subject", identity.Subject,
		"wish_id", wish.ID,
		"visibility", wish.Visibility,
		"status", wish.Status,
		"visibility_changed", input.Visibility != nil,
		"status_changed", input.Status != nil,
		"reply_changed", input.Reply != nil,
	)
	// Public lists only contain published wishes, so status or reply edits on
	// an unpublished wish do not need to wake browsers. A visibility change may
	// have just removed a wish from the public list, so it always notifies.
	if wish.Visibility == VisibilityPublished || input.Visibility != nil {
		h.changes.publish()
	}
}

// normalizeUpdate validates an admin PATCH body and normalizes the reply text,
// keeping line breaks but trimming surrounding whitespace.
func normalizeUpdate(input *UpdateInput) error {
	if input.Empty() {
		return errors.New("request must change visibility, status, or reply")
	}
	if input.Visibility != nil && !input.Visibility.Valid() {
		return errors.New("invalid visibility")
	}
	if input.Status != nil && !input.Status.Valid() {
		return errors.New("invalid status")
	}
	if input.Reply != nil {
		reply := strings.ReplaceAll(*input.Reply, "\r\n", "\n")
		reply = strings.TrimSpace(strings.ReplaceAll(reply, "\r", "\n"))
		if utf8.RuneCountInString(reply) > MaxReplyLength {
			return fmt.Errorf("reply must contain at most %d characters", MaxReplyLength)
		}
		if !utf8.ValidString(reply) || containsUnsafeControl(reply) {
			return errors.New("reply contains unsupported characters")
		}
		input.Reply = &reply
	}
	return nil
}

func (h *Handler) actorHash(w http.ResponseWriter, r *http.Request) ([]byte, error) {
	var payload string
	if cookie, err := r.Cookie(deviceCookieName); err == nil {
		parts := strings.Split(cookie.Value, ".")
		if len(parts) == 2 && h.validSignature(parts[0], parts[1]) {
			payload = parts[0]
		}
	}
	if payload == "" {
		random := make([]byte, 24)
		if _, err := rand.Read(random); err != nil {
			return nil, err
		}
		payload = base64.RawURLEncoding.EncodeToString(random)
		value := payload + "." + h.sign(payload)
		http.SetCookie(w, &http.Cookie{
			Name:     deviceCookieName,
			Value:    value,
			Path:     "/api/wishes",
			MaxAge:   365 * 24 * 60 * 60,
			Expires:  h.now().Add(365 * 24 * time.Hour),
			HttpOnly: true,
			Secure:   r.TLS != nil || r.Header.Get("X-Forwarded-Proto") == "https",
			SameSite: http.SameSiteLaxMode,
		})
	}
	mac := hmac.New(sha256.New, h.cookieSecret)
	_, _ = io.WriteString(mac, "actor:")
	_, _ = io.WriteString(mac, payload)
	return mac.Sum(nil), nil
}

func (h *Handler) sign(payload string) string {
	mac := hmac.New(sha256.New, h.cookieSecret)
	_, _ = io.WriteString(mac, payload)
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}

func (h *Handler) validSignature(payload, signature string) bool {
	want, err := base64.RawURLEncoding.DecodeString(h.sign(payload))
	if err != nil {
		return false
	}
	got, err := base64.RawURLEncoding.DecodeString(signature)
	return err == nil && hmac.Equal(got, want)
}

func (h *Handler) internalError(w http.ResponseWriter, r *http.Request, err error) {
	h.logger.Error("wish request failed", "method", r.Method, "path", r.URL.Path, "error", err)
	writeError(w, http.StatusInternalServerError, "the Wish Pool is temporarily unavailable")
}

func (h *Handler) securityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		next.ServeHTTP(w, r)
	})
}

func (h *Handler) recoverPanics(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if recovered := recover(); recovered != nil {
				h.logger.Error("wish request panicked", "method", r.Method, "path", r.URL.Path, "error", recovered)
				writeError(w, http.StatusInternalServerError, "the Wish Pool is temporarily unavailable")
			}
		}()
		next.ServeHTTP(w, r)
	})
}

func validateCreate(input CreateInput) error {
	length := utf8.RuneCountInString(input.Title)
	if length < 4 || length > 120 {
		return errors.New("title must contain between 4 and 120 characters")
	}
	if utf8.RuneCountInString(input.Detail) > 500 {
		return errors.New("detail must contain at most 500 characters")
	}
	if !input.Category.Valid() {
		return errors.New("invalid category")
	}
	if containsUnsafeControl(input.Title) || containsUnsafeControl(input.Detail) {
		return errors.New("wish contains unsupported characters")
	}
	return nil
}

func normalizeText(value string) string {
	return strings.Join(strings.Fields(strings.TrimSpace(value)), " ")
}

func containsUnsafeControl(value string) bool {
	for _, char := range value {
		if unicode.IsControl(char) && char != '\n' && char != '\t' {
			return true
		}
	}
	return false
}

func sameOrigin(r *http.Request) bool {
	origin := r.Header.Get("Origin")
	if origin == "" {
		return true
	}
	parsed, err := url.Parse(origin)
	if err != nil {
		return false
	}
	hosts := []string{r.Host}
	if forwarded := strings.TrimSpace(strings.Split(r.Header.Get("X-Forwarded-Host"), ",")[0]); forwarded != "" {
		hosts = append(hosts, forwarded)
	}
	for _, host := range hosts {
		if strings.EqualFold(parsed.Host, host) {
			return true
		}
	}
	return false
}

func decodeJSON(w http.ResponseWriter, r *http.Request, destination any) error {
	return decodeJSONLimit(w, r, destination, maxBodyBytes)
}

func decodeJSONLimit(w http.ResponseWriter, r *http.Request, destination any, limit int64) error {
	r.Body = http.MaxBytesReader(w, r.Body, limit)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(destination); err != nil {
		return errors.New("request body must be valid JSON")
	}
	if err := decoder.Decode(&struct{}{}); !errors.Is(err, io.EOF) {
		return errors.New("request body must contain one JSON object")
	}
	return nil
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		slog.Error("write JSON response", "error", err)
	}
}

func writeError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]any{"error": map[string]string{"message": message}})
}

func newUUID() (string, error) {
	value := make([]byte, 16)
	if _, err := rand.Read(value); err != nil {
		return "", err
	}
	value[6] = (value[6] & 0x0f) | 0x40
	value[8] = (value[8] & 0x3f) | 0x80
	encoded := hex.EncodeToString(value)
	return fmt.Sprintf("%s-%s-%s-%s-%s", encoded[0:8], encoded[8:12], encoded[12:16], encoded[16:20], encoded[20:32]), nil
}

func validUUID(value string) bool {
	if len(value) != 36 || value[8] != '-' || value[13] != '-' || value[18] != '-' || value[23] != '-' {
		return false
	}
	_, err := hex.DecodeString(strings.ReplaceAll(value, "-", ""))
	return err == nil
}

func WithContext(ctx context.Context, handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		handler.ServeHTTP(w, r.WithContext(ctx))
	})
}
