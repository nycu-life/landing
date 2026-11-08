package wishes

import (
	"context"
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"strings"
	"time"
)

const (
	adminSessionCookie = "nycu_wish_admin"
	oauthStateCookie   = "nycu_wish_oauth_state"
	adminReturnPath    = "/wishpool/admin/"
	// Both the legacy /cms and native-theme /ghost Admin paths are gated.
	// Keep both cookies during the staged rollout and rollback window.
	cmsSessionCookie = "nycu_cms_session"
	cmsPath          = "/cms"
	ghostPath        = "/ghost"
	adminSessionTTL  = 8 * time.Hour
	oauthStateTTL    = 10 * time.Minute
)

type oauthState struct {
	State    string `json:"state"`
	Nonce    string `json:"nonce"`
	Verifier string `json:"verifier"`
	Expires  int64  `json:"expires"`
	// Return is a validated same-site path to land on after sign-in.
	Return string `json:"return,omitempty"`
}

type adminSession struct {
	Subject string `json:"subject"`
	Name    string `json:"name"`
	Email   string `json:"email,omitempty"`
	Expires int64  `json:"expires"`
}

func (h *Handler) authLogin(w http.ResponseWriter, r *http.Request) {
	if h.adminAuth == nil {
		writeError(w, http.StatusServiceUnavailable, "admin SSO is not configured")
		return
	}
	state, err := randomURLToken(32)
	if err != nil {
		h.internalError(w, r, err)
		return
	}
	nonce, err := randomURLToken(32)
	if err != nil {
		h.internalError(w, r, err)
		return
	}
	verifier, err := randomURLToken(48)
	if err != nil {
		h.internalError(w, r, err)
		return
	}
	login := oauthState{
		State:    state,
		Nonce:    nonce,
		Verifier: verifier,
		Expires:  h.now().Add(oauthStateTTL).Unix(),
		Return:   safeReturnPath(r.URL.Query().Get("return")),
	}
	encoded, err := h.encodeSignedCookie("oauth-state", login)
	if err != nil {
		h.internalError(w, r, err)
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     oauthStateCookie,
		Value:    encoded,
		Path:     "/api/wishes/auth",
		MaxAge:   int(oauthStateTTL.Seconds()),
		Expires:  h.now().Add(oauthStateTTL),
		HttpOnly: true,
		Secure:   requestIsHTTPS(r),
		SameSite: http.SameSiteLaxMode,
	})
	ctx, cancel := context.WithTimeout(r.Context(), 8*time.Second)
	defer cancel()
	destination, err := h.adminAuth.AuthorizationURL(ctx, state, nonce, verifier)
	if err != nil {
		h.logger.Error("wish admin OIDC discovery failed", "error", err)
		h.clearOAuthState(w, r)
		h.redirectAdminAuthError(w, r, "unavailable")
		return
	}
	w.Header().Set("Cache-Control", "no-store")
	http.Redirect(w, r, destination, http.StatusFound)
}

func (h *Handler) authCallback(w http.ResponseWriter, r *http.Request) {
	// A browser returning from the IdP can retain its cross-origin Referer
	// through this redirect. Ghost must establish its session at the Admin
	// origin, so stop forwarding that referrer rather than relaxing its checks.
	w.Header().Set("Referrer-Policy", "no-referrer")
	cookie, err := r.Cookie(oauthStateCookie)
	if err != nil {
		h.redirectAdminAuthError(w, r, "invalid_callback")
		return
	}
	h.clearOAuthState(w, r)
	var login oauthState
	if err := h.decodeSignedCookie("oauth-state", cookie.Value, &login); err != nil ||
		login.Expires <= h.now().Unix() {
		h.redirectAdminAuthError(w, r, "invalid_callback")
		return
	}
	providedState := r.URL.Query().Get("state")
	if len(providedState) != len(login.State) ||
		subtle.ConstantTimeCompare([]byte(providedState), []byte(login.State)) != 1 {
		h.redirectAdminAuthError(w, r, "invalid_callback")
		return
	}
	if r.URL.Query().Get("error") != "" {
		h.redirectAdminAuthError(w, r, "oauth_error")
		return
	}
	code := strings.TrimSpace(r.URL.Query().Get("code"))
	if code == "" || h.adminAuth == nil {
		h.redirectAdminAuthError(w, r, "invalid_callback")
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 8*time.Second)
	defer cancel()
	identity, err := h.adminAuth.Exchange(ctx, code, login.Verifier, login.Nonce)
	if err != nil {
		h.logger.Error("wish admin OIDC callback failed", "error", err)
		h.redirectAdminAuthError(w, r, "invalid_callback")
		return
	}
	session := adminSession{
		Subject: identity.Subject,
		Name:    identity.Name,
		Email:   identity.Email,
		Expires: h.now().Add(adminSessionTTL).Unix(),
	}
	encoded, err := h.encodeSignedCookie("admin-session", session)
	if err != nil {
		h.internalError(w, r, err)
		return
	}
	for _, path := range []string{"/api/wishes", cmsPath, ghostPath} {
		name := adminSessionCookie
		if path == cmsPath || path == ghostPath {
			name = cmsSessionCookie
		}
		http.SetCookie(w, &http.Cookie{
			Name:     name,
			Value:    encoded,
			Path:     path,
			MaxAge:   int(adminSessionTTL.Seconds()),
			Expires:  h.now().Add(adminSessionTTL),
			HttpOnly: true,
			Secure:   requestIsHTTPS(r),
			SameSite: http.SameSiteLaxMode,
		})
	}
	h.logger.Info("wish admin signed in", "subject", identity.Subject)
	w.Header().Set("Cache-Control", "no-store")
	destination := adminReturnPath
	if login.Return != "" {
		destination = login.Return
	}
	http.Redirect(w, r, destination, http.StatusFound)
}

func (h *Handler) authMe(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "private, no-store")
	identity, ok := h.sessionIdentity(r)
	if !ok {
		h.clearAdminSession(w, r)
		writeJSON(w, http.StatusOK, map[string]any{
			"data": map[string]bool{"authenticated": false},
		})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"data": map[string]any{
			"authenticated": true,
			"user":          identity,
		},
	})
}

func (h *Handler) authLogout(w http.ResponseWriter, r *http.Request) {
	if !sameOrigin(r) {
		writeError(w, http.StatusForbidden, "cross-origin writes are not allowed")
		return
	}
	h.clearAdminSession(w, r)
	w.Header().Set("Cache-Control", "no-store")
	writeJSON(w, http.StatusOK, map[string]any{
		"data": map[string]bool{"authenticated": false},
	})
}

func (h *Handler) adminIdentity(r *http.Request) (AdminIdentity, bool) {
	// A service (BFF) token never grants admin access, even alongside a
	// browser admin session cookie.
	if _, _, isService := h.serviceClient(r); isService {
		return AdminIdentity{}, false
	}
	if h.adminToken != "" {
		provided := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
		if len(provided) == len(h.adminToken) &&
			subtle.ConstantTimeCompare([]byte(provided), []byte(h.adminToken)) == 1 {
			return AdminIdentity{Subject: "break-glass-token", Name: "CLI", Method: "token"}, true
		}
	}
	return h.sessionIdentity(r)
}

// authGate is the Traefik forwardAuth target for /cms/ (Ghost). Any 2xx lets
// the original request through; a signed-out browser navigation is sent to the
// same auth.nycu.one sign-in as the Wish Pool admin and returned afterwards.
// Traefik always calls it with GET and passes the original request in the
// X-Forwarded-* headers and its cookies.
func (h *Handler) authGate(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-store")
	if identity, ok := h.cookieIdentity(r, cmsSessionCookie); ok {
		w.Header().Set("X-Wish-Admin-Subject", identity.Subject)
		if len(h.cmsSSOSecret) > 0 {
			w.Header().Set(cmsIdentityHeader, signCMSIdentity(h.cmsSSOSecret, identity, h.now()))
		}
		w.WriteHeader(http.StatusNoContent)
		return
	}
	method := r.Header.Get("X-Forwarded-Method")
	if h.adminAuth != nil && (method == "" || method == http.MethodGet || method == http.MethodHead) {
		login := url.URL{Path: "/api/wishes/auth/login"}
		if target := safeReturnPath(r.Header.Get("X-Forwarded-Uri")); target != "" {
			login.RawQuery = url.Values{"return": {target}}.Encode()
		}
		location := login.String()
		if origin, ok := h.adminAuth.(interface{ PublicOrigin() string }); ok && origin.PublicOrigin() != "" {
			location = origin.PublicOrigin() + location
		}
		w.Header().Set("Location", location)
		w.WriteHeader(http.StatusFound)
		return
	}
	writeError(w, http.StatusUnauthorized, "sign in at /api/wishes/auth/login first")
}

// safeReturnPath accepts only local paths under /cms/ or /ghost/ (gated CMS); anything
// else (absolute or scheme-relative URLs, other paths) yields "".
func safeReturnPath(raw string) string {
	if raw == "" || strings.ContainsAny(raw, "\\\r\n") || strings.HasPrefix(raw, "//") {
		return ""
	}
	parsed, err := url.Parse(raw)
	if err != nil || parsed.Scheme != "" || parsed.Host != "" || parsed.User != nil {
		return ""
	}
	allowed := parsed.Path == cmsPath || strings.HasPrefix(parsed.Path, cmsPath+"/") ||
		parsed.Path == ghostPath || strings.HasPrefix(parsed.Path, ghostPath+"/")
	if !allowed ||
		strings.Contains(parsed.Path, "/../") || strings.HasSuffix(parsed.Path, "/..") {
		return ""
	}
	return parsed.RequestURI()
}

func (h *Handler) sessionIdentity(r *http.Request) (AdminIdentity, bool) {
	return h.cookieIdentity(r, adminSessionCookie)
}

func (h *Handler) cookieIdentity(r *http.Request, name string) (AdminIdentity, bool) {
	cookie, err := r.Cookie(name)
	if err != nil {
		return AdminIdentity{}, false
	}
	var session adminSession
	if err := h.decodeSignedCookie("admin-session", cookie.Value, &session); err != nil ||
		session.Subject == "" || session.Expires <= h.now().Unix() {
		return AdminIdentity{}, false
	}
	return AdminIdentity{Subject: session.Subject, Name: session.Name, Email: session.Email, Method: "oidc"}, true
}

func (h *Handler) encodeSignedCookie(purpose string, value any) (string, error) {
	data, err := json.Marshal(value)
	if err != nil {
		return "", err
	}
	payload := base64.RawURLEncoding.EncodeToString(data)
	signature := h.sign(purpose + ":" + payload)
	return payload + "." + signature, nil
}

func (h *Handler) decodeSignedCookie(purpose, value string, destination any) error {
	parts := strings.Split(value, ".")
	if len(parts) != 2 || !h.validSignature(purpose+":"+parts[0], parts[1]) {
		return errors.New("invalid signed cookie")
	}
	data, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		return err
	}
	return json.Unmarshal(data, destination)
}

func (h *Handler) clearOAuthState(w http.ResponseWriter, r *http.Request) {
	http.SetCookie(w, &http.Cookie{
		Name:     oauthStateCookie,
		Value:    "",
		Path:     "/api/wishes/auth",
		MaxAge:   -1,
		Expires:  time.Unix(1, 0),
		HttpOnly: true,
		Secure:   requestIsHTTPS(r),
		SameSite: http.SameSiteLaxMode,
	})
}

func (h *Handler) clearAdminSession(w http.ResponseWriter, r *http.Request) {
	for _, path := range []string{"/api/wishes", cmsPath, ghostPath} {
		name := cmsSessionCookie
		if path == "/api/wishes" {
			name = adminSessionCookie
		}
		http.SetCookie(w, &http.Cookie{
			Name:     name,
			Value:    "",
			Path:     path,
			MaxAge:   -1,
			Expires:  time.Unix(1, 0),
			HttpOnly: true,
			Secure:   requestIsHTTPS(r),
			SameSite: http.SameSiteLaxMode,
		})
	}
}

func (h *Handler) redirectAdminAuthError(w http.ResponseWriter, r *http.Request, code string) {
	destination, _ := url.Parse(adminReturnPath)
	query := destination.Query()
	query.Set("auth", code)
	destination.RawQuery = query.Encode()
	w.Header().Set("Cache-Control", "no-store")
	http.Redirect(w, r, destination.String(), http.StatusFound)
}

func requestIsHTTPS(r *http.Request) bool {
	return r.TLS != nil || strings.EqualFold(strings.TrimSpace(r.Header.Get("X-Forwarded-Proto")), "https")
}

func randomURLToken(size int) (string, error) {
	data := make([]byte, size)
	if _, err := rand.Read(data); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(data), nil
}
