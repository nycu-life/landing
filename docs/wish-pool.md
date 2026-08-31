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
- Each card shows an automatically updated relative creation time instead of a
  manually maintained workflow status.
- New wishes and `+1` counts are pushed to other open browsers immediately over
  a same-origin Server-Sent Events stream. A 10-second refresh is retained as a
  fallback when a proxy or temporary network cannot keep that stream open.
- Category filters stay hidden until the pool has more than 20 public wishes.
- Content with a URL, email address, or a 7–12 digit number is held in
  `pending` review instead of being published immediately.
  New wishes use a short entrance transition, while the list and its clickable
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
development server. Preview mode never runs in a production build.
