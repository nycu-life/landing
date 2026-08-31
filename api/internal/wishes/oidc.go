package wishes

import (
	"context"
	"crypto/subtle"
	"errors"
	"fmt"
	"net/url"
	"strings"
	"sync"

	"github.com/coreos/go-oidc/v3/oidc"
	"golang.org/x/oauth2"
)

type AdminIdentity struct {
	Subject string `json:"subject"`
	Name    string `json:"name"`
	Method  string `json:"-"`
}

type AdminAuthenticator interface {
	AuthorizationURL(ctx context.Context, state, nonce, verifier string) (string, error)
	Exchange(ctx context.Context, code, verifier, nonce string) (AdminIdentity, error)
}

type OIDCConfig struct {
	Issuer       string
	ClientID     string
	ClientSecret string
	RedirectURL  string
}

type OIDCAuthenticator struct {
	config   OIDCConfig
	mu       sync.Mutex
	provider *oidc.Provider
}

type oidcIdentityClaims struct {
	Subject           string `json:"sub"`
	Nonce             string `json:"nonce"`
	Name              string `json:"name"`
	PreferredUsername string `json:"preferred_username"`
	Email             string `json:"email"`
}

func NewOIDCAuthenticator(config OIDCConfig) (*OIDCAuthenticator, error) {
	config.Issuer = strings.TrimSpace(config.Issuer)
	config.ClientID = strings.TrimSpace(config.ClientID)
	config.ClientSecret = strings.TrimSpace(config.ClientSecret)
	config.RedirectURL = strings.TrimSpace(config.RedirectURL)
	values := []string{config.Issuer, config.ClientID, config.RedirectURL}
	configured := 0
	for _, value := range values {
		if value != "" {
			configured++
		}
	}
	if configured == 0 && config.ClientSecret == "" {
		return nil, nil
	}
	if configured != len(values) {
		return nil, errors.New("issuer, client ID, and redirect URL are required when Wish Pool OIDC is enabled")
	}
	issuer, err := url.Parse(config.Issuer)
	if err != nil || issuer.Scheme != "https" || issuer.Host == "" || issuer.RawQuery != "" || issuer.Fragment != "" {
		return nil, errors.New("WISH_OIDC_ISSUER must be an absolute HTTPS URL")
	}
	redirect, err := url.Parse(config.RedirectURL)
	if err != nil || redirect.Host == "" || redirect.RawQuery != "" || redirect.Fragment != "" ||
		(redirect.Scheme != "https" && !(redirect.Scheme == "http" && isLoopbackHost(redirect.Hostname()))) {
		return nil, errors.New("WISH_OIDC_REDIRECT_URL must use HTTPS or HTTP on loopback")
	}
	return &OIDCAuthenticator{config: config}, nil
}

func isLoopbackHost(host string) bool {
	return host == "localhost" || host == "127.0.0.1" || host == "::1"
}

func (a *OIDCAuthenticator) oidcProvider(ctx context.Context) (*oidc.Provider, error) {
	a.mu.Lock()
	defer a.mu.Unlock()
	if a.provider != nil {
		return a.provider, nil
	}
	provider, err := oidc.NewProvider(ctx, a.config.Issuer)
	if err != nil {
		return nil, fmt.Errorf("discover OIDC provider: %w", err)
	}
	a.provider = provider
	return provider, nil
}

func (a *OIDCAuthenticator) oauthConfig(provider *oidc.Provider) oauth2.Config {
	return oauth2.Config{
		ClientID:     a.config.ClientID,
		ClientSecret: a.config.ClientSecret,
		RedirectURL:  a.config.RedirectURL,
		Endpoint:     provider.Endpoint(),
		Scopes:       []string{oidc.ScopeOpenID, "profile", "email"},
	}
}

func (a *OIDCAuthenticator) AuthorizationURL(
	ctx context.Context,
	state, nonce, verifier string,
) (string, error) {
	provider, err := a.oidcProvider(ctx)
	if err != nil {
		return "", err
	}
	config := a.oauthConfig(provider)
	return config.AuthCodeURL(
		state,
		oidc.Nonce(nonce),
		oauth2.S256ChallengeOption(verifier),
	), nil
}

func (a *OIDCAuthenticator) Exchange(
	ctx context.Context,
	code, verifier, nonce string,
) (AdminIdentity, error) {
	provider, err := a.oidcProvider(ctx)
	if err != nil {
		return AdminIdentity{}, err
	}
	config := a.oauthConfig(provider)
	token, err := config.Exchange(ctx, code, oauth2.VerifierOption(verifier))
	if err != nil {
		return AdminIdentity{}, fmt.Errorf("exchange OIDC code: %w", err)
	}
	rawIDToken, ok := token.Extra("id_token").(string)
	if !ok || rawIDToken == "" {
		return AdminIdentity{}, errors.New("OIDC response did not include an ID token")
	}
	idToken, err := provider.Verifier(&oidc.Config{ClientID: a.config.ClientID}).Verify(ctx, rawIDToken)
	if err != nil {
		return AdminIdentity{}, fmt.Errorf("verify OIDC ID token: %w", err)
	}
	var claims oidcIdentityClaims
	if err := idToken.Claims(&claims); err != nil {
		return AdminIdentity{}, fmt.Errorf("decode OIDC claims: %w", err)
	}
	return a.identityFromClaims(claims, nonce)
}

func (a *OIDCAuthenticator) identityFromClaims(
	claims oidcIdentityClaims,
	nonce string,
) (AdminIdentity, error) {
	if claims.Subject == "" || len(claims.Nonce) != len(nonce) ||
		subtle.ConstantTimeCompare([]byte(claims.Nonce), []byte(nonce)) != 1 {
		return AdminIdentity{}, errors.New("OIDC nonce or subject is invalid")
	}
	name := firstNonEmpty(claims.Name, claims.PreferredUsername, claims.Email, claims.Subject)
	return AdminIdentity{Subject: claims.Subject, Name: name, Method: "oidc"}, nil
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if value = strings.TrimSpace(value); value != "" {
			return value
		}
	}
	return ""
}
