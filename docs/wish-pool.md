# Wish Pool

The Wish Pool is a public co-creation surface at `/wishpool/`. The landing page
keeps a short invitation section and footer link that lead to the dedicated
page, rather than embedding the full interface in the home story. A wish posted
in one browser is stored in PostgreSQL and appears in every other browser on the
same page.

## Product behavior

- Posting is anonymous to the public. A signed, HttpOnly device cookie is used
  only for rate limits and support toggles.
- Each wish card has a direct `+1` action, so people can show support without
  opening a detail view.
- Each open card shows an automatically updated relative creation time.
- The board has an in-page **願望池 / 已實現** (Wishes / Fulfilled) tab control.
  It stays on `/wishpool/` (no extra URL, so no sitemap or nginx change). The
  fulfilled tab lists wishes the team has completed, newest first, with their
  `+1` count and fulfilled date. A team reply is shown as a
  "NYCU LIFE 團隊回覆" bubble on both fulfilled and open cards.
- New wishes and `+1` counts are pushed to other open browsers immediately over
  a same-origin Server-Sent Events stream. A 10-second refresh is retained as a
  fallback when a proxy or temporary network cannot keep that stream open.
- Category filters stay hidden until the pool has more than 20 public wishes.
- Every new wish is stored as `pending` and never appears publicly until an
  administrator approves it from `/wishpool/admin/`. The submitter sees a
  confirmation that the wish is waiting for review; the public list and the
  SSE stream only change when an administrator publishes, hides, or restores a
  wish, or when someone adds a `+1`.
- New wishes use a short entrance transition, while the list and its clickable
  cards stay still and predictable. Reduced-motion preferences disable the
  optional transition.

## Runtime architecture

The SvelteKit site remains fully static. `/api/wishes` is routed by Traefik to a
small Go service on the same origin; every other path continues to nginx. The
API owns its PostgreSQL tables and a migration hook runs before the deployment
rolls out. `GET /api/wishes/events` is the long-lived SSE endpoint used only as
an invalidation signal; browsers still fetch the canonical list from
`GET /api/wishes`, so the event stream never carries wish content.

Required environment variables:

- `DATABASE_URL`
- `WISH_COOKIE_SECRET` (at least 32 characters)
- `WISH_ADMIN_TOKEN`
- `WISH_SERVICE_CLIENTS` (optional; see [Service (BFF) access](#service-bff-access))
- `PORT` (optional, defaults to `3001`)

The dev GitOps overlay generates durable database and application credentials
through External Secrets and OpenBao. The database has a retain reclaim policy.

## Moderation API

The API has an unlisted browser workspace at `/wishpool/admin/`. Operators sign
in through the Authentik OIDC provider on `auth.nycu.one`; every identity
successfully authenticated by that provider receives an eight-hour, signed,
`HttpOnly`, `Secure`, `SameSite=Lax` session. The browser never receives an
OAuth access token, client secret, or `WISH_ADMIN_TOKEN`. OIDC identity is keyed
by the stable provider `sub` claim rather than email.

The authorization-code flow uses PKCE S256, a nonce, and a signed ten-minute
state cookie. Admin writes made with the browser session also require a
same-origin request. The public Wish Pool remains available when Authentik is
unavailable because OIDC discovery happens lazily only when an administrator
starts login.

`WISH_ADMIN_TOKEN` remains a CLI-only break-glass credential. Retrieve it
through the cluster's normal secret-access process and use it only over HTTPS:

```sh
curl -H "Authorization: Bearer $WISH_ADMIN_TOKEN" \
  'https://landing.dev.nycu.one/api/wishes/admin?visibility=pending'

curl -X PATCH \
  -H "Authorization: Bearer $WISH_ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"visibility":"published"}' \
  'https://landing.dev.nycu.one/api/wishes/admin/WISH_ID'
```

Valid visibility values are `published`, `pending`, and `hidden`.

### Status and team reply

Moderation visibility and processing status are separate. `status` is `open`
(default) or `fulfilled`; only `published` wishes are ever public, whatever
their status. `PATCH /api/wishes/admin/{id}` accepts any non-empty combination
of these optional fields:

```json
{
	"visibility": "published",
	"status": "fulfilled",
	"reply": "校車即時位置已經在 App 上線！"
}
```

- `status: "fulfilled"` sets `fulfilledAt` the first time; `"open"` clears it.
- `reply` is trimmed, keeps line breaks, and holds at most 1000 characters.
  `""` clears the reply and `repliedAt`; `repliedAt` only moves when the text
  changes.
- An empty body (`{}`), unknown fields, or invalid values return `400`.

`GET /api/wishes/admin` takes `visibility` (default `pending`) and an optional
`status=open|fulfilled`. The browser workspace exposes the same controls:
**標記為已實現 / 重新開啟**, **撰寫回覆 / 編輯回覆 / 清除回覆**, and a progress
filter. Live SSE invalidation fires whenever a published wish changes or a
visibility changes; editing an unpublished wish is silent.

Existing databases are migrated by the same idempotent `migrate` hook:
existing rows become `open` wishes with no reply.

OIDC requires the issuer, client ID, and redirect URL together; the API fails
to start on a partial or insecure configuration:

```text
WISH_OIDC_ISSUER=https://auth.nycu.one/application/o/wishpool-admin/
WISH_OIDC_CLIENT_ID=wishpool-admin
WISH_OIDC_REDIRECT_URL=https://nycu.life/api/wishes/auth/callback
```

The provider must register the redirect URL exactly. Dev uses a separate
`wishpool-admin-dev` provider/client
and `https://landing.dev.nycu.one/api/wishes/auth/callback`. Both deployed
clients are public OAuth clients secured with PKCE S256, so they do not use a
client secret. `WISH_OIDC_CLIENT_SECRET` remains optional for a separately
registered confidential client and must never be committed to Git.

### CMS gate

`/api/wishes/auth/gate` is the Traefik forwardAuth target for the Ghost CMS
at `/cms/` (`docs/ghost.md`). It answers `204` for a valid admin session (read
from the `Path=/cms` copy of the session cookie, `nycu_cms_session`). A
signed-out navigation gets `302` to `/api/wishes/auth/login?return=/cms/…`, and
any other signed-out request gets `401`. `return` only accepts local paths under
`/cms/`; the callback falls back to `/wishpool/admin/` for anything else.

After OIDC, the gate includes the NYCU One subject, display name, and email in
the short-lived CMS identity token. Ghost resolves that email to an existing
staff user, so Ghost roles and edit history stay per person. The Ghost Owner
must invite or create staff users before they can use SSO.

## Wish JSON

Every public and admin endpoint returns wishes in this shape (`visibility` is
never exposed):

```json
{
	"id": "0fa3a41d-e488-422b-a9ea-730067a2e4d8",
	"title": "希望校車可以看到即時位置",
	"detail": "",
	"category": "transport",
	"status": "fulfilled",
	"reply": "校車即時位置已經在 NYCU LIFE App 上線！",
	"repliedAt": "2026-10-02T04:00:00Z",
	"fulfilledAt": "2026-10-01T08:00:00Z",
	"supportCount": 128,
	"supportedByMe": true,
	"createdAt": "2026-08-12T10:00:00Z"
}
```

`category` is one of `life`, `transport`, `learning`, `space`, `other`.
`reply` is `""` when there is no reply; `repliedAt` and `fulfilledAt` are
`null` when unset.

## Service (BFF) access

The NYCU LIFE Super App reads and posts wishes through its server-side BFF.
Browser rate limits and `+1` de-duplication are keyed by the device cookie,
which a BFF cannot use, so trusted servers authenticate with a service token
and name the end user per request instead.

### Configuration

`WISH_SERVICE_CLIENTS` is a comma-separated list of `name:token` pairs:

```text
WISH_SERVICE_CLIENTS=superapp:<random token, at least 32 characters>
```

- Names use lowercase letters, digits, `-` or `_` (at most 32 characters).
- Tokens are 32–512 visible ASCII characters with no spaces. Generate one with
  `openssl rand -base64 48 | tr -d '\n'`.
- The API refuses to start on a malformed entry, a duplicate name or token, or
  a token equal to `WISH_ADMIN_TOKEN`. Tokens are compared in constant time and
  are never logged; startup logs only the client names.
- An empty or unset value disables service access.

Provision the token the same way as the other Wish API credentials. Store it
in OpenBao next to the API's existing application secrets, and add a
`WISH_SERVICE_CLIENTS` key to the landing overlay's External Secrets mapping
in `nycu-life/k8s-manifests`. Then give the Super App BFF the same token
(without the `superapp:` prefix) through its own ExternalSecret. Never commit
it to Git. To rotate, add a second client name with the new token, switch the
BFF over, then remove the old entry.

### Headers

| Header                                  | Required for              | Notes                                                                                       |
| --------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------- |
| `Authorization: Bearer <token>`         | every service request     | Any bearer credential on a public endpoint must be a valid service token, otherwise `401`.  |
| `X-Wish-Actor: <opaque stable user id>` | writes; optional on reads | 1–128 visible ASCII characters. Use a stable, non-personal id (for example a hashed `sub`). |

The API derives the actor as `HMAC-SHA256(WISH_COOKIE_SECRET, "svc:" + client + ":" + actor)`.
The same app user therefore keeps the same rate-limit bucket and `+1` state.
Different clients that send the same actor id never collide, and a service
actor never matches a browser cookie actor. Service requests never receive
cookies, and they skip the browser same-origin check because they carry no
`Origin`. Cookie-based browser writes still require a same-origin request.

A service token **never** grants admin access. `/api/wishes/admin*` returns
`401` for a service token even alongside an admin session cookie. The admin
token (`WISH_ADMIN_TOKEN`) is not a service token: sending it to a public
endpoint returns `401`.

### Endpoints

| Method and path                    | Actor header | Success response                                                         |
| ---------------------------------- | ------------ | ------------------------------------------------------------------------ |
| `GET /api/wishes?status=open`      | optional     | `200 {"data": [Wish…]}` (newest 24; `supportedByMe` needs the actor)     |
| `GET /api/wishes?status=fulfilled` | optional     | `200 {"data": [Wish…]}` (24 most recently fulfilled)                     |
| `POST /api/wishes`                 | required     | `201 {"data": Wish, "meta": {"pending": true}}`                          |
| `POST /api/wishes/{id}/support`    | required     | `200 {"data": {"supported": true, "supportCount": 43}}` (toggles the +1) |

`status` defaults to `open`. A new wish body is
`{"title": "…", "detail": "…", "category": "life"}`. The title holds 4–120
characters and the detail at most 500. Every new wish is `pending` until an
administrator publishes it, exactly as for browsers. `GET /api/wishes/events`
(SSE) needs no authentication; it only signals that lists changed.

### Errors and limits

Errors use `{"error": {"message": "…"}}`.

| Status | When                                                                                           |
| ------ | ---------------------------------------------------------------------------------------------- |
| `400`  | invalid JSON or fields, invalid `status`, missing or invalid `X-Wish-Actor` on a service write |
| `401`  | unknown, malformed, or non-`Bearer` credential (`WWW-Authenticate: Bearer`)                    |
| `404`  | wish not found or not published (support toggle)                                               |
| `429`  | more than three new wishes per actor per hour (`Retry-After: 3600`)                            |
| `500`  | `the Wish Pool is temporarily unavailable`                                                     |

Rate limits apply per derived actor, so each app user gets the same allowance
as a browser: three wishes per rolling hour and one `+1` per wish. Reads are
not rate limited by the API. The BFF should cache or throttle its own traffic.

### Examples

```sh
API=https://nycu.life/api/wishes
TOKEN=…   # the superapp token from the secret store

curl -H "Authorization: Bearer $TOKEN" -H 'X-Wish-Actor: user-7f3a9c' \
  "$API?status=fulfilled"

curl -X POST -H "Authorization: Bearer $TOKEN" -H 'X-Wish-Actor: user-7f3a9c' \
  -H 'Content-Type: application/json' \
  -d '{"title":"希望校車能顯示即時擁擠度","detail":"","category":"transport"}' \
  "$API"

curl -X POST -H "Authorization: Bearer $TOKEN" -H 'X-Wish-Actor: user-7f3a9c' \
  "$API/WISH_ID/support"
```

## Local development

Run PostgreSQL and the API on port 3001, then start the existing Vite dev
server. Vite proxies `/api/wishes` to the Go process.

```sh
cd api
DATABASE_URL='postgres://…' go run ./cmd/wish-api migrate
DATABASE_URL='postgres://…' \
WISH_COOKIE_SECRET='at-least-32-characters-long' \
WISH_ADMIN_TOKEN='local-admin-token' \
go run ./cmd/wish-api
```

For a local OIDC client, use a loopback callback such as
`http://127.0.0.1:3001/api/wishes/auth/callback`; non-loopback HTTP callbacks
are rejected.

For frontend-only visual work, append `?wish-preview=1` while using the Vite
development server. The preview data includes open wishes (one with a team
reply) and fulfilled wishes with replies, so both tabs can be reviewed without
the API. Preview mode never runs in a production build.
