package wishes

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"time"
)

// cmsIdentityHeader carries the signed identity the CMS gate vouches for.
// Traefik forwardAuth copies it from the gate's response onto the request it
// forwards to Ghost (authResponseHeaders), replacing anything the client sent.
// The NycuOneSSO Ghost adapter (docker/ghost/adapters/sso/NycuOneSSO) verifies
// it and signs the visitor in as the shared CMS staff account.
const cmsIdentityHeader = "X-Nycu-Cms-Identity"

// cmsIdentityTTL is short: a token is minted for every gated request and only
// needs to survive the hop from Traefik to Ghost.
const cmsIdentityTTL = 2 * time.Minute

type cmsIdentity struct {
	Subject  string `json:"sub"`
	Name     string `json:"name,omitempty"`
	IssuedAt int64  `json:"iat"`
	Expires  int64  `json:"exp"`
}

// signCMSIdentity returns `v1.<base64url(JSON)>.<base64url(HMAC-SHA256)>`, the
// MAC covering "v1." plus the payload. The Ghost adapter shares the format.
func signCMSIdentity(secret []byte, identity AdminIdentity, now time.Time) string {
	data, _ := json.Marshal(cmsIdentity{
		Subject:  identity.Subject,
		Name:     identity.Name,
		IssuedAt: now.Unix(),
		Expires:  now.Add(cmsIdentityTTL).Unix(),
	})
	signed := "v1." + base64.RawURLEncoding.EncodeToString(data)
	mac := hmac.New(sha256.New, secret)
	mac.Write([]byte(signed))
	return signed + "." + base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}
