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
	adminSessionTTL    = 8 * time.Hour
	oauthStateTTL      = 10 * time.Minute
)

type oauthState struct {
	State    string `json:"state"`
	Nonce    string `json:"nonce"`
	Verifier string `json:"verifier"`
	Expires  int64  `json:"expires"`
}

type adminSession struct {
	Subject string `json:"subject"`
	Name    string `json:"name"`
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
		Expires: h.now().Add(adminSessionTTL).Unix(),
	}
	encoded, err := h.encodeSignedCookie("admin-session", session)
	if err != nil {
		h.internalError(w, r, err)
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     adminSessionCookie,
		Value:    encoded,
		Path:     "/api/wishes",
		MaxAge:   int(adminSessionTTL.Seconds()),
		Expires:  h.now().Add(adminSessionTTL),
		HttpOnly: true,
		Secure:   requestIsHTTPS(r),
		SameSite: http.SameSiteLaxMode,
	})
	h.logger.Info("wish admin signed in", "subject", identity.Subject)
	w.Header().Set("Cache-Control", "no-store")
	http.Redirect(w, r, adminReturnPath, http.StatusFound)
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
	if h.adminToken != "" {
		provided := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
		if len(provided) == len(h.adminToken) &&
			subtle.ConstantTimeCompare([]byte(provided), []byte(h.adminToken)) == 1 {
			return AdminIdentity{Subject: "break-glass-token", Name: "CLI", Method: "token"}, true
		}
	}
	return h.sessionIdentity(r)
}

func (h *Handler) sessionIdentity(r *http.Request) (AdminIdentity, bool) {
	cookie, err := r.Cookie(adminSessionCookie)
	if err != nil {
		return AdminIdentity{}, false
	}
	var session adminSession
	if err := h.decodeSignedCookie("admin-session", cookie.Value, &session); err != nil ||
		session.Subject == "" || session.Expires <= h.now().Unix() {
		return AdminIdentity{}, false
	}
	return AdminIdentity{Subject: session.Subject, Name: session.Name, Method: "oidc"}, true
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
	http.SetCookie(w, &http.Cookie{
		Name:     adminSessionCookie,
		Value:    "",
		Path:     "/api/wishes",
		MaxAge:   -1,
		Expires:  time.Unix(1, 0),
		HttpOnly: true,
		Secure:   requestIsHTTPS(r),
		SameSite: http.SameSiteLaxMode,
	})
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
