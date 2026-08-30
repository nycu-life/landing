package wishes

import "testing"

func TestNewOIDCAuthenticatorRequiresCompleteSecureConfiguration(t *testing.T) {
	auth, err := NewOIDCAuthenticator(OIDCConfig{})
	if err != nil || auth != nil {
		t.Fatalf("empty config should disable OIDC, got auth=%#v err=%v", auth, err)
	}

	_, err = NewOIDCAuthenticator(OIDCConfig{Issuer: "https://auth.nycu.one/application/o/wishpool-admin/"})
	if err == nil {
		t.Fatal("partial OIDC config should fail")
	}
	_, err = NewOIDCAuthenticator(OIDCConfig{ClientSecret: "orphaned-secret"})
	if err == nil {
		t.Fatal("an orphaned confidential-client secret should fail")
	}

	complete := OIDCConfig{
		Issuer:      "http://auth.nycu.one/application/o/wishpool-admin/",
		ClientID:    "wishpool-admin",
		RedirectURL: "https://nycu.life/api/wishes/auth/callback",
	}
	if _, err := NewOIDCAuthenticator(complete); err == nil {
		t.Fatal("non-HTTPS issuer should fail")
	}

	complete.Issuer = "https://auth.nycu.one/application/o/wishpool-admin/"
	complete.RedirectURL = "http://nycu.life/api/wishes/auth/callback"
	if _, err := NewOIDCAuthenticator(complete); err == nil {
		t.Fatal("non-loopback HTTP redirect should fail")
	}

	complete.RedirectURL = "http://127.0.0.1:3001/api/wishes/auth/callback"
	auth, err = NewOIDCAuthenticator(complete)
	if err != nil || auth == nil {
		t.Fatalf("public client with loopback redirect should be accepted: auth=%#v err=%v", auth, err)
	}

	complete.ClientSecret = "optional-confidential-client-secret"
	if auth, err = NewOIDCAuthenticator(complete); err != nil || auth == nil {
		t.Fatalf("confidential clients should remain supported: auth=%#v err=%v", auth, err)
	}
}

func TestFirstNonEmptyTrimsDisplayNames(t *testing.T) {
	if got := firstNonEmpty("  ", " 管理員 ", "fallback"); got != "管理員" {
		t.Fatalf("firstNonEmpty returned %q", got)
	}
}

func TestOIDCIdentityRequiresNonceAndStableSubject(t *testing.T) {
	auth := &OIDCAuthenticator{}
	claims := oidcIdentityClaims{
		Subject: "stable-provider-subject",
		Nonce:   "expected-nonce",
		Name:    "管理員",
		Email:   "changeable-email@nycu.edu.tw",
	}

	identity, err := auth.identityFromClaims(claims, "expected-nonce")
	if err != nil {
		t.Fatal(err)
	}
	if identity.Subject != "stable-provider-subject" || identity.Name != "管理員" {
		t.Fatalf("identity must use stable sub and display name: %#v", identity)
	}

	if _, err := auth.identityFromClaims(claims, "wrong-nonce"); err == nil {
		t.Fatal("nonce mismatch should be denied")
	}

	claims.Subject = ""
	claims.Nonce = "expected-nonce"
	if _, err := auth.identityFromClaims(claims, "expected-nonce"); err == nil {
		t.Fatal("missing stable subject should be denied")
	}
}
