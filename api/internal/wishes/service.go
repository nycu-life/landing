package wishes

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
)

const (
	// ServiceActorHeader carries the BFF's opaque, stable end-user id.
	ServiceActorHeader = "X-Wish-Actor"

	minServiceTokenLength = 32
	maxServiceTokenLength = 512
	maxServiceNameLength  = 32
	maxServiceActorLength = 128
)

// ServiceClient is a trusted server-side caller (a BFF) identified by a bearer
// token from WISH_SERVICE_CLIENTS. Only the token digest is kept in memory so
// comparisons are constant time regardless of token length.
type ServiceClient struct {
	Name   string
	digest [sha256.Size]byte
}

// String deliberately omits the token so a client can never leak into logs.
func (c ServiceClient) String() string { return "ServiceClient(" + c.Name + ")" }

// ParseServiceClients parses WISH_SERVICE_CLIENTS: comma-separated name:token
// pairs. An empty value configures no clients. Any malformed entry fails the
// whole configuration so the API never starts half-configured.
func ParseServiceClients(raw string) ([]ServiceClient, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return nil, nil
	}
	clients := make([]ServiceClient, 0)
	names := make(map[string]struct{})
	digests := make(map[[sha256.Size]byte]struct{})
	for index, entry := range strings.Split(raw, ",") {
		entry = strings.TrimSpace(entry)
		name, token, ok := strings.Cut(entry, ":")
		// Errors mention the entry position and client name only, never the token.
		if !ok {
			return nil, fmt.Errorf("WISH_SERVICE_CLIENTS entry %d must use name:token", index+1)
		}
		if !validServiceName(name) {
			return nil, fmt.Errorf(
				"WISH_SERVICE_CLIENTS entry %d: name must be 1-%d lowercase letters, digits, '-' or '_'",
				index+1, maxServiceNameLength,
			)
		}
		if len(token) < minServiceTokenLength || len(token) > maxServiceTokenLength || !visibleASCII(token) {
			return nil, fmt.Errorf(
				"WISH_SERVICE_CLIENTS client %q: token must be %d-%d visible ASCII characters",
				name, minServiceTokenLength, maxServiceTokenLength,
			)
		}
		if _, duplicate := names[name]; duplicate {
			return nil, fmt.Errorf("WISH_SERVICE_CLIENTS client %q is listed twice", name)
		}
		digest := sha256.Sum256([]byte(token))
		if _, duplicate := digests[digest]; duplicate {
			return nil, fmt.Errorf("WISH_SERVICE_CLIENTS client %q reuses another client's token", name)
		}
		names[name] = struct{}{}
		digests[digest] = struct{}{}
		clients = append(clients, ServiceClient{Name: name, digest: digest})
	}
	return clients, nil
}

func validServiceName(name string) bool {
	if name == "" || len(name) > maxServiceNameLength {
		return false
	}
	for _, char := range name {
		if !(char >= 'a' && char <= 'z' || char >= '0' && char <= '9' || char == '-' || char == '_') {
			return false
		}
	}
	return true
}

func visibleASCII(value string) bool {
	for index := 0; index < len(value); index++ {
		if value[index] < 0x21 || value[index] > 0x7e {
			return false
		}
	}
	return true
}

var (
	errServiceUnauthorized = errors.New("invalid service credentials")
	errServiceActorMissing = errors.New(ServiceActorHeader + " header is required for service writes")
	errServiceActorInvalid = errors.New(ServiceActorHeader + " header must be 1-128 visible ASCII characters")
)

// requestActor identifies who is acting on a public endpoint.
type requestActor struct {
	hash    []byte
	service bool
}

// serviceClient authenticates an Authorization: Bearer header against the
// configured service clients. present reports whether any bearer credential
// was supplied at all. Every client is compared so timing does not reveal
// which entry matched.
func (h *Handler) serviceClient(r *http.Request) (client ServiceClient, present, ok bool) {
	header := r.Header.Get("Authorization")
	if header == "" {
		return ServiceClient{}, false, false
	}
	scheme, token, found := strings.Cut(header, " ")
	if !found || !strings.EqualFold(scheme, "Bearer") || token == "" {
		return ServiceClient{}, true, false
	}
	digest := sha256.Sum256([]byte(token))
	for _, candidate := range h.serviceClients {
		if subtle.ConstantTimeCompare(digest[:], candidate.digest[:]) == 1 {
			client, ok = candidate, true
		}
	}
	return client, true, ok
}

// resolveActor returns the actor for a public request. A request carrying a
// bearer credential must be a valid service request; otherwise the signed
// device cookie is used (and created when missing). Service requests never
// receive cookies. requireServiceActor makes X-Wish-Actor mandatory.
func (h *Handler) resolveActor(
	w http.ResponseWriter,
	r *http.Request,
	requireServiceActor bool,
) (requestActor, int, error) {
	client, present, ok := h.serviceClient(r)
	if !present {
		hash, err := h.actorHash(w, r)
		if err != nil {
			return requestActor{}, http.StatusInternalServerError, err
		}
		return requestActor{hash: hash}, 0, nil
	}
	if !ok {
		return requestActor{}, http.StatusUnauthorized, errServiceUnauthorized
	}
	values := r.Header.Values(ServiceActorHeader)
	if len(values) == 0 {
		if requireServiceActor {
			return requestActor{}, http.StatusBadRequest, errServiceActorMissing
		}
		return requestActor{service: true}, 0, nil
	}
	if len(values) != 1 || len(values[0]) > maxServiceActorLength || values[0] == "" || !visibleASCII(values[0]) {
		return requestActor{}, http.StatusBadRequest, errServiceActorInvalid
	}
	mac := hmac.New(sha256.New, h.cookieSecret)
	_, _ = io.WriteString(mac, "svc:")
	_, _ = io.WriteString(mac, client.Name)
	_, _ = io.WriteString(mac, ":")
	_, _ = io.WriteString(mac, values[0])
	return requestActor{hash: mac.Sum(nil), service: true}, 0, nil
}

// writeActorError renders a resolveActor failure.
func (h *Handler) writeActorError(w http.ResponseWriter, r *http.Request, status int, err error) {
	switch status {
	case http.StatusUnauthorized:
		w.Header().Set("WWW-Authenticate", `Bearer realm="wish-api"`)
		writeError(w, status, err.Error())
	case http.StatusBadRequest:
		writeError(w, status, err.Error())
	default:
		h.internalError(w, r, err)
	}
}
