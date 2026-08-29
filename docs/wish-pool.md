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

The admin endpoints are intentionally not linked from the public site. Retrieve
the admin token through the cluster's normal secret-access process, then use it
only over HTTPS.

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
