# Ghost CMS: dev log, comics, and NYCU One sign-in

The SvelteKit site runs with `adapter-node`. Home, About, and Wish Pool stay
prerendered; `/devlog/`, `/devlog/<slug>/`, `/comics/`, `/comics/<slug>/`, and
`/sitemap.xml` render on request with the same Svelte components and i18n.

Published content is fetched through Ghost's Content API and cached in each Node
process for **30 seconds**. Concurrent refreshes share one fetch. Publish, edit,
unpublish, and delete need no build, webhook, GitHub token, or deployment. Reload
an open page after the cache expires. Newly published slugs and sitemap entries
appear together; removed content disappears at the next refresh.

## Runtime configuration

| Variable                | Meaning                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `ORIGIN`                | Public site origin, `https://nycu.life` in production.                                               |
| `GHOST_URL`             | Server-reachable Ghost base URL, including sub-path (`http://landing-ghost:2368/cms` in Kubernetes). |
| `GHOST_PUBLIC_URL`      | Browser-reachable base URL, `https://nycu.life/cms`; images use `/content/images/` below it.         |
| `GHOST_CONTENT_API_KEY` | Content key of the existing landing Custom Integration, injected from a runtime Secret.              |

Builds never contact Ghost and carry no CMS credentials. Without Ghost config,
local content pages use the empty dev log / placeholder comics, noindex and absent
from the sitemap. A configured Ghost failing or timing out (5 seconds) yields a
503 on content pages, rather than a misleading empty index or indefinitely stale
posts. Fixed pages continue to work. Empty Ghost sections are a normal state.

Images are served directly by Ghost's public route. Former `/devlog/media/…`
and `/comics/media/…` URLs redirect to that route for compatibility. Staff-authored
HTML is trusted and rendered by the existing components; do not feed member or
comment HTML into it. The comics section stays out of navigation until ready.

## Editor conventions

### 開發日誌 (dev log)

| What            | How in Ghost                                                                                                                                                         |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mark a post     | Add the **internal tag `#devlog`** (a public `devlog` tag also works). Only **published** posts are used, newest first.                                              |
| Labels          | Any other **public** tag (e.g. `校園公車`, `NYCozU`) shows as a label on the card and the post. Internal `#tags` are never shown.                                    |
| Title / excerpt | Post title → card title and `<h1>`. Custom excerpt → card summary, lede, and meta description.                                                                       |
| Cover           | Optional post **feature image**, **16:9** (e.g. 1600×900). Without one the card shows a brand gradient.                                                              |
| Body            | Normal Ghost editor: headings, lists, quotes, code, image / gallery / callout / bookmark cards. Upload images to Ghost so they stay on the public Ghost image route. |
| Language        | Posts are single-language (Traditional Chinese); the English UI says so.                                                                                             |
| URL             | Post **slug** → `https://nycu.life/devlog/<slug>/`. Changing a slug after publishing breaks the old URL.                                                             |

The newest post is shown as the large card at the top of `/devlog/`.

### 漫畫專區 (comics)

| What                | How in Ghost                                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mark a comic        | Add the **internal tag `#comics`** (a public `comics` tag also works). Only **published** posts are used.                                                                                         |
| Episode number      | Add an internal tag **`#ep-NN`**, e.g. `#ep-01`, `#ep-12`. Posts without one are numbered after the tagged ones, in `published_at` order. A duplicate `#ep-NN` is ignored (with a build warning). |
| Title               | Post title → card title and reader `<h1>` (same text in both locales).                                                                                                                            |
| Cover               | Post **feature image**, square **1:1** (e.g. 1080×1080). Feature-image alt text = cover alt.                                                                                                      |
| Panels              | Post body: one **image card per panel**, top to bottom. Short text paragraphs are fine. Upload images to Ghost (don't paste external URLs) so they stay on the public Ghost image route.          |
| URL                 | Post **slug** → `https://nycu.life/comics/<slug>/`. Changing a slug after publishing breaks the old URL.                                                                                          |
| Description         | Post **excerpt** (custom excerpt) → meta description.                                                                                                                                             |
| Publish / unpublish | Publishing, editing, or unpublishing refreshes the runtime catalog (see below). A new request sees the change within 30 seconds; reload an already-open page.                                     |

The "Latest / 最新集數" badge goes on the highest episode number.

## Local Ghost

`docker/ghost/compose.yml` runs `ghost:6-alpine` (6.75.x) and `mysql:8.4` with
healthchecks and named volumes (`ghost-mysql`, `ghost-content`). Ghost binds to
`127.0.0.1:2368`. The stub mail transport drops email, so Ghost 6's emailed
staff-device verification is turned off locally. Production needs real SMTP
and keeps it on.

```sh
# 1. Start Ghost + MySQL (first boot takes ~30 s)
docker compose -f docker/ghost/compose.yml up -d --wait

# 2. Owner setup, Custom Integration, 10 sample episodes (idempotent).
#    The first run needs an owner password (10+ chars). It is saved, together with
#    the generated Content/Admin API keys, to the untracked .env.ghost.local (0600).
GHOST_OWNER_PASSWORD='choose-a-long-one' node docker/ghost/seed.mjs
#    Later runs read the password back from .env.ghost.local:
node docker/ghost/seed.mjs

# 3. Build / preview / e2e against Ghost
set -a; . ./.env.ghost.local; set +a
GHOST_REQUIRED=1 pnpm build && pnpm preview

# 4. Stop (keeps volumes) / wipe everything
docker compose -f docker/ghost/compose.yml down
docker compose -f docker/ghost/compose.yml down -v
```

Ghost Admin: <http://127.0.0.1:2368/ghost/>, owner `editor@nycu.life.local`
(override with `GHOST_OWNER_EMAIL`). The seed creates posts `ep-01` … `ep-10`,
each with an SVG cover and three SVG panels uploaded through the Admin images
API. Posts whose slug already exists are skipped. Optional seed variables:
`GHOST_ADMIN_URL`, `GHOST_OWNER_NAME`, `GHOST_ENV_FILE`. Other compose
variables: `GHOST_PUBLIC_URL` (Ghost `url`, default `http://127.0.0.1:2368`),
`GHOST_PORT`, `GHOST_DB_PASSWORD`, `GHOST_DB_ROOT_PASSWORD`.

To include the stack from a root compose file:

```yaml
include:
  - path: landing/docker/ghost/compose.yml
```

## Production login and deployment

Traefik forwards `/cms` authorization to wish-api's `/api/wishes/auth/gate`.
Signed-out editors go through the existing `wishpool-admin` OIDC client at
`auth.nycu.one`, then return to Ghost. As explicitly configured for this site,
**every NYCU One account** can pass the gate and use the shared staff account.

The gate signs a short-lived `X-Nycu-Cms-Identity` token. Traefik's
`authResponseHeaders` overwrites any client value. The `NycuOneSSO` adapter uses
Ghost 6.75's supported SSO hook to verify the token and create a verified staff
session for **hermes@nycu.one** on the Admin entry page. No shared password is
needed by the bridge. Everyone appears as hermes in Ghost; individual changes
cannot be attributed through Ghost's author/history UI. The gate logs the NYCU
One subject when the session is created.

`docker/ghost/Dockerfile` packages the adapter outside the persistent content
volume. Activate with `adapters__sso__active=NycuOneSSO`, set
`NYCU_CMS_SSO_STAFF_EMAIL`, and inject the same random secret into
`NYCU_CMS_SSO_SECRET` (Ghost) and `WISH_CMS_SSO_SECRET` (wish-api). GitOps generates
and persists this secret through ExternalSecrets/OpenBao. Missing/invalid tokens
never create sessions; Ghost's manual login remains available behind the gate.

The `/cms` gate remains mandatory on **every** Admin/API request, even when a
Ghost session exists. Wish Pool sign-out clears the gate's CMS cookie too. The
public Content API and uploaded images bypass the gate; the Admin API does not.
SMTP is still unconfigured, so staff-device email verification stays disabled.

Production manifests live in `nycu-life/k8s-manifests/apps/landing/overlays/prod`.
Set the existing Content API key in source Secret `landing-web-ghost-source`,
property `GHOST_CONTENT_API_KEY`, before the Node rollout. PushSecret persists it
to OpenBao (`secret/landing/prod/ghost-content`); ExternalSecret populates
`landing-web-ghost-secret` for the Node service. Do not commit keys. The web and
Wish API use rolling updates with `maxUnavailable: 0` and readiness probes. Ghost
keeps its single RWO content volume and Recreate strategy: its restart briefly
interrupts CMS access; the fixed site and Wish API stay available. MySQL and
content volumes are preserved. Roll back web/wish-api/ghost image tags together
if required; no database schema changes are introduced by this release.

Run `pnpm test:cms-sso`, Go tests/vet, frontend checks/tests, and Playwright against
the actual Node server. Verify publishing, editing, unpublishing, new slugs,
sitemap updates, and signed/forged SSO tokens with a disposable Ghost instance.
