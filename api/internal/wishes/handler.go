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
	"regexp"
	"strings"
	"time"
	"unicode"
	"unicode/utf8"
)

const (
	deviceCookieName = "nycu_wish_device"
	maxBodyBytes     = 4096
)

var (
	urlPattern       = regexp.MustCompile(`(?i)(https?://|www\.|[a-z0-9-]+\.(com|net|org|tw)(/|\b))`)
	emailPattern     = regexp.MustCompile(`(?i)\b[^\s@]+@[^\s@]+\.[^\s@]+\b`)
	longDigitPattern = regexp.MustCompile(`\b\d{7,12}\b`)
)

type Handler struct {
	store        Store
	cookieSecret []byte
	adminToken   string
	logger       *slog.Logger
	now          func() time.Time
	changes      *changeBroker
}

func NewHandler(store Store, cookieSecret, adminToken string, logger *slog.Logger) (*Handler, error) {
	if store == nil {
		return nil, errors.New("wish store is required")
	}
	if len(cookieSecret) < 32 {
		return nil, errors.New("WISH_COOKIE_SECRET must contain at least 32 characters")
	}
	if logger == nil {
		logger = slog.Default()
	}
	return &Handler{
		store:        store,
		cookieSecret: []byte(cookieSecret),
		adminToken:   adminToken,
		logger:       logger,
		now:          time.Now,
		changes:      newChangeBroker(),
	}, nil
}

func (h *Handler) Routes() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/wishes/healthz", h.health)
	mux.HandleFunc("GET /api/wishes", h.list)
	mux.HandleFunc("GET /api/wishes/events", h.events)
	mux.HandleFunc("POST /api/wishes", h.create)
	mux.HandleFunc("POST /api/wishes/{id}/support", h.support)
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
	actorHash, err := h.actorHash(w, r)
	if err != nil {
		h.internalError(w, r, err)
		return
	}
	items, err := h.store.List(r.Context(), actorHash, 24)
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

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	if !sameOrigin(r) {
		writeError(w, http.StatusForbidden, "cross-origin writes are not allowed")
		return
	}
	actorHash, err := h.actorHash(w, r)
	if err != nil {
		h.internalError(w, r, err)
		return
	}
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
	input.ActorHash = actorHash
	input.Visibility = VisibilityPublished
	if requiresReview(input.Title + " " + input.Detail) {
		input.Visibility = VisibilityPending
	}

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
	if wish.Visibility == VisibilityPublished {
		h.changes.publish()
	}
}

func (h *Handler) support(w http.ResponseWriter, r *http.Request) {
	if !sameOrigin(r) {
		writeError(w, http.StatusForbidden, "cross-origin writes are not allowed")
		return
	}
	id := r.PathValue("id")
	if !validUUID(id) {
		writeError(w, http.StatusNotFound, "wish not found")
		return
	}
	actorHash, err := h.actorHash(w, r)
	if err != nil {
		h.internalError(w, r, err)
		return
	}
	result, err := h.store.ToggleSupport(r.Context(), id, actorHash)
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
	if !h.authorizeAdmin(r) {
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
	items, err := h.store.AdminList(r.Context(), visibility, 100)
	if err != nil {
		h.internalError(w, r, err)
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"data": items})
}

func (h *Handler) adminUpdate(w http.ResponseWriter, r *http.Request) {
	if !h.authorizeAdmin(r) {
		writeError(w, http.StatusUnauthorized, "admin authorization required")
		return
	}
	id := r.PathValue("id")
	if !validUUID(id) {
		writeError(w, http.StatusNotFound, "wish not found")
		return
	}
	var input UpdateInput
	if err := decodeJSON(w, r, &input); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}
	if input.Visibility != nil && !input.Visibility.Valid() {
		writeError(w, http.StatusBadRequest, "invalid visibility")
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
	h.changes.publish()
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

func (h *Handler) authorizeAdmin(r *http.Request) bool {
	if h.adminToken == "" {
		return false
	}
	provided := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
	if len(provided) != len(h.adminToken) {
		return false
	}
	return subtle.ConstantTimeCompare([]byte(provided), []byte(h.adminToken)) == 1
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

func requiresReview(value string) bool {
	return urlPattern.MatchString(value) || emailPattern.MatchString(value) || longDigitPattern.MatchString(value)
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
	r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)
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
