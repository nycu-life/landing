# Wish Pool

The Wish Pool is a public co-creation surface embedded directly in the landing
page. A wish posted in one browser is stored in PostgreSQL and appears in every
other browser on the same page.

## Product behavior

- Posting is anonymous to the public. A signed, HttpOnly device cookie is used
  only for rate limits, support toggles, and duplicate-report prevention.
- New public wishes begin at `new`. The team can move them through `picked`,
  `building`, `fulfilled`, or `declined` and attach a public response.
- People can filter by category, open a wish to see its journey, and toggle
  “I want this too.”
- Content with a URL, email address, or a 7–12 digit number is held in
  `pending` review instead of being published immediately.
- Three distinct device reports hide a published wish until the team reviews
  it. This is a safety circuit, not a substitute for moderation.

The animation is deliberately applied to decorative glyphs rather than the
clickable card itself, so the pool feels alive without creating moving targets.
Reduced-motion preferences disable the optional movement.

## Runtime architecture

The SvelteKit site remains fully static. `/api/wishes` is routed by Traefik to a
small Go service on the same origin; every other path continues to nginx. The
API owns its PostgreSQL tables and a migration hook runs before the deployment
rolls out.

Required environment variables:

- `DATABASE_URL`
- `WISH_COOKIE_SECRET` (at least 32 characters)
- `WISH_ADMIN_TOKEN`
- `PORT` (optional, defaults to `3001`)

The dev GitOps overlay generates durable database and application credentials
through External Secrets and OpenBao. The database has a retain reclaim policy.

## Moderation API

The admin endpoints are intentionally not linked from the public site. Retrieve
the admin token through the cluster's normal secret-access process, then use it
only over HTTPS.

```sh
curl -H "Authorization: Bearer $WISH_ADMIN_TOKEN" \
  'https://landing.dev.nycu.one/api/wishes/admin?visibility=pending'

curl -X PATCH \
  -H "Authorization: Bearer $WISH_ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"visibility":"published","status":"picked","teamResponse":"我們正在確認可用資料。"}' \
  'https://landing.dev.nycu.one/api/wishes/admin/WISH_ID'
```

Valid visibility values are `published`, `pending`, and `hidden`.

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

For frontend-only visual work, append `?wish-preview=1` while using the Vite
development server. Preview mode never runs in a production build.
