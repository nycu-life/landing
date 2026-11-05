# Ghost CMS — headless content for 漫畫專區 (comics)

The comics section (`/comics/`, `/comics/<slug>/`, issue #107) is authored in
[Ghost](https://ghost.org) and **read only at build time**. `pnpm build`
prerenders every page from the Ghost Content API and mirrors the images into
`build/comics/media/`. The deployed site is still plain static files behind nginx:
browsers never contact Ghost, and a Ghost outage never takes nycu.life down.
It only blocks the next content rebuild.

```
editor ──(SSO: auth.nycu.one)──▶ Ghost Admin (cms.nycu.life/ghost/)
                                     │ publish → webhook
                                     ▼
                              relay ──▶ GitHub repository_dispatch "ghost-publish"
                                     ▼
          docker.yml: pnpm build (reads Ghost Content API) → harbor …/landing/web
                                     ▼
                              ArgoCD → nycu.life (static nginx)
```

## Build-time contract

| Variable                | Where                                                  | Meaning                                                                                                      |
| ----------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `GHOST_URL`             | env / Docker build arg / repo **variable** `GHOST_URL` | Ghost base URL reachable from the build, e.g. `https://cms.nycu.life`.                                       |
| `GHOST_CONTENT_API_KEY` | env / BuildKit secret / repo **secret**                | Content API key of the "NYCU LIFE landing build" Custom Integration (read-only).                             |
| `GHOST_REQUIRED`        | env / Docker build arg                                 | `1` = fail the build if Ghost is unset, unreachable, or has no comics. CI sets it for every image it pushes. |

Without Ghost (the default for local dev, PR checks, and forks) the build logs a
warning and uses the placeholder catalog in `src/lib/content/comics.ts`. That is
10 episodes from the design: EP.01 "小貢上大學了", the rest "[本集標題]", with CSS
covers. Placeholder episode pages are `noindex` and left out of the sitemap.
Ghost-backed episodes are indexable and listed in `/sitemap.xml`.

The loader lives in `src/lib/server/ghost.ts`. It makes one memoised fetch per
build, shared by `/comics/`, every episode page, the media mirror, and the
sitemap. The variables come from `process.env` because SvelteKit 2 forbids
`$env/dynamic/*` while prerendering. Vite does **not** load `.env*` files into
`process.env`, so export them, e.g. `set -a; . ./.env.ghost.local; set +a`.

### Images

Image URLs under Ghost's `/content/images/` (covers, `src`, `srcset`) are
rewritten to `/comics/media/<path>`, and
`src/routes/comics/media/[...path]/+server.ts` downloads each file once at
build time. The match uses both `GHOST_URL` and Ghost's own public `url` setting.
Images hosted anywhere else are left as they are, which means they are
hot-linked; avoid them.

### Trust model

Post HTML is rendered with `{@html}` without sanitising. Only authenticated Ghost
staff can write it, and they sit behind SSO plus a Ghost staff login, so it
carries the same trust as a commit to this repo. Do not route member- or
comment-authored content through this path. Give editors the **Contributor**
or **Author** role. Only Administrators can add code injection or integrations
(we don't render Ghost code injection anyway).

## Editor conventions

| What                | How in Ghost                                                                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mark a comic        | Add the **internal tag `#comics`** (a public `comics` tag also works). Only **published** posts are used.                                                                                         |
| Episode number      | Add an internal tag **`#ep-NN`**, e.g. `#ep-01`, `#ep-12`. Posts without one are numbered after the tagged ones, in `published_at` order. A duplicate `#ep-NN` is ignored (with a build warning). |
| Title               | Post title → card title and reader `<h1>` (same text in both locales).                                                                                                                            |
| Cover               | Post **feature image**, square **1:1** (e.g. 1080×1080). Feature-image alt text = cover alt.                                                                                                      |
| Panels              | Post body: one **image card per panel**, top to bottom. Short text paragraphs are fine. Upload images to Ghost (don't paste external URLs) so they get mirrored.                                  |
| URL                 | Post **slug** → `https://nycu.life/comics/<slug>/`. Changing a slug after publishing breaks the old URL.                                                                                          |
| Description         | Post **excerpt** (custom excerpt) → meta description.                                                                                                                                             |
| Publish / unpublish | Publishing, editing, or unpublishing triggers a rebuild (see below). The site updates when the new image is deployed, not instantly.                                                              |

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

## Editor login via auth.nycu.one

Ghost has no native OIDC/SAML for staff users. The agreed model has two gates:

1. **Authentik forward auth** (auth.nycu.one) in front of `cms.nycu.life`. Only
   people allowed into the Authentik application ever reach Ghost Admin.
2. The editor then signs in with their **Ghost staff account**. Invite them from
   Ghost Admin → Settings → Staff, using their NYCU LIFE email.

Removing someone means removing them from the Authentik group, which closes
the gate, and suspending their Ghost staff user.

### Authentik (Proxy Provider, forward auth, single application)

1. **Applications → Providers → Create → Proxy Provider**
   - Name: `nycu-life-cms`
   - Authorization flow: the default explicit/implicit consent flow
   - Mode: **Forward auth (single application)**
   - External host: `https://cms.nycu.life`
   - Token validity: e.g. `hours=12`
   - Advanced → **Unauthenticated Paths**: leave empty. Public paths are routed
     around the middleware in Traefik (below), which is easier to audit.
2. **Applications → Applications → Create**: name `NYCU LIFE CMS`, slug
   `nycu-life-cms`, provider `nycu-life-cms`. Bind a group policy, e.g. only the
   `nycu-life-editors` group.
3. **Applications → Outposts**: add the application to the embedded outpost (or
   to the cluster's proxy outpost).

### Traefik (example for `nycu-life/k8s-manifests`, not deployable from here)

```yaml
apiVersion: traefik.io/v1alpha1
kind: Middleware
metadata:
  name: authentik-forward-auth
  namespace: ghost
spec:
  forwardAuth:
    # Embedded outpost service; adjust namespace/name to the cluster's Authentik release.
    address: http://ak-outpost-authentik-embedded-outpost.authentik.svc.cluster.local:9000/outpost.goauthentik.io/auth/traefik
    trustForwardHeader: true
    authResponseHeaders:
      - X-authentik-username
      - X-authentik-groups
      - X-authentik-email
      - X-authentik-name
      - X-authentik-uid
---
apiVersion: traefik.io/v1alpha1
kind: IngressRoute
metadata:
  name: ghost
  namespace: ghost
spec:
  entryPoints: [websecure]
  routes:
    # Public, key-gated: the landing build (GitHub runners) reads posts here.
    - match: Host(`cms.nycu.life`) && PathPrefix(`/ghost/api/content/`)
      priority: 100
      kind: Rule
      services: [{ name: ghost, port: 2368 }]
    # Public: uploaded images (the build mirrors them; editors' previews load them).
    - match: Host(`cms.nycu.life`) && PathPrefix(`/content/images/`)
      priority: 100
      kind: Rule
      services: [{ name: ghost, port: 2368 }]
    # Members API: only needed if Ghost members/newsletters are ever enabled.
    - match: Host(`cms.nycu.life`) && PathPrefix(`/members/api/`)
      priority: 100
      kind: Rule
      services: [{ name: ghost, port: 2368 }]
    # Authentik's callback/sign-in endpoints for this host.
    - match: Host(`cms.nycu.life`) && PathPrefix(`/outpost.goauthentik.io/`)
      priority: 90
      kind: Rule
      services:
        - name: ak-outpost-authentik-embedded-outpost
          namespace: authentik
          port: 9000
    # Everything else, incl. Ghost Admin (/ghost/, /ghost/api/admin/) and the
    # unused theme front end, behind SSO.
    - match: Host(`cms.nycu.life`)
      priority: 10
      kind: Rule
      middlewares: [{ name: authentik-forward-auth }]
      services: [{ name: ghost, port: 2368 }]
  tls:
    secretName: cms-nycu-life-tls
```

Notes:

- Cross-namespace services need Traefik's `allowCrossNamespace`. Otherwise
  route the outpost path through an `ExternalName` service in `ghost`.
- Webhooks are **outbound** from Ghost, so no inbound path is needed for them.
- Admin API scripts (like `seed.mjs`) can't get through forward auth from
  outside. Run them against the in-cluster service, e.g.
  `kubectl port-forward svc/ghost 2368`.
- Production Ghost needs `url=https://cms.nycu.life`, real `mail__*` SMTP
  settings, and device verification left on (the default).

### Local SSO profile (oauth2-proxy)

The local `sso` profile does the same job as the gate above, using oauth2-proxy
with Authentik as the OIDC issuer. Create an **OAuth2/OpenID Provider** in
Authentik (confidential client, redirect URI
`http://127.0.0.1:4180/oauth2/callback`, application slug e.g.
`nycu-life-cms-local`), then run:

```sh
export GHOST_OIDC_ISSUER_URL=https://auth.nycu.one/application/o/nycu-life-cms-local/
export GHOST_OIDC_CLIENT_ID=…      # from Authentik, never committed
export GHOST_OIDC_CLIENT_SECRET=…  # from Authentik, never committed
export GHOST_SSO_COOKIE_SECRET="$(openssl rand -base64 32 | tr -- '+/' '-_')"
GHOST_PUBLIC_URL=http://127.0.0.1:4180 \
  docker compose -f docker/ghost/compose.yml --profile sso up -d --wait
```

Open <http://127.0.0.1:4180/ghost/>. oauth2-proxy sends you to auth.nycu.one
first, then Ghost asks for the staff login. `/ghost/api/content/`,
`/content/images/`, and `/members/api/` skip SSO. Port 2368 stays open on
loopback for builds and the seed.

## Publish → rebuild

`.github/workflows/docker.yml` accepts `repository_dispatch` with type
`ghost-publish` (and `workflow_dispatch`). That run rebuilds and pushes
`landing/web` (`:latest` + `sha-…`) with `GHOST_REQUIRED=1`, and skips the
Wish API image. Bursts of dispatches cancel each other, so only the newest
rebuild finishes. `CONTENT_REVISION` (run id) busts the Docker layer cache.
Without it, a content-only rebuild would reuse the cached build output,
because BuildKit secrets aren't part of the cache key.

Repo configuration:

- Variable `GHOST_URL` = `https://cms.nycu.life`
- Secret `GHOST_CONTENT_API_KEY` = the Content API key of the "NYCU LIFE
  landing build" integration

How the key stays out of the image: the Dockerfile reads it with
`RUN --mount=type=secret,id=ghost_content_api_key,env=GHOST_CONTENT_API_KEY`.
That puts it in the environment of that single `RUN` and nowhere else: not an
`ARG`/`ENV`, not a layer, not image history, not the GHA cache. The runtime
stage copies only `build/`. The output contains Ghost data (HTML, images) but
no key or Ghost URL. This was checked by scanning `docker history`, the image
config, and every layer of a locally built image. The Content API key is
read-only and Ghost treats it as public-grade, but there is no reason to ship
it.

Ghost webhooks can't add GitHub's `Authorization` header, so something has to
sit in between. Options:

1. **Minimal relay (recommended).** In Ghost Admin → Settings → Integrations →
   "NYCU LIFE landing build" → _Add webhook_, add one webhook for each of
   _Post published_, _Published post updated_, _Post unpublished_, and
   _Post deleted_. Point them at the relay URL and set a webhook secret. The
   relay checks Ghost's `X-Ghost-Signature` HMAC, then calls GitHub with a
   token that can only dispatch to this repo: a fine-grained PAT or GitHub App
   token on `nycu-life/landing` with **Contents: read & write**, which is the
   permission `repository_dispatch` requires. A Cloudflare Worker is enough:

   ```js
   export default {
   	async fetch(request, env) {
   		const body = await request.text();
   		// X-Ghost-Signature: "sha256=<hex>, t=<ms>"; HMAC-SHA256(secret, body + t)
   		const header = request.headers.get('x-ghost-signature') ?? '';
   		const [, sig, t] = /sha256=([0-9a-f]+),\s*t=(\d+)/.exec(header) ?? [];
   		const key = await crypto.subtle.importKey(
   			'raw',
   			new TextEncoder().encode(env.GHOST_WEBHOOK_SECRET),
   			{ name: 'HMAC', hash: 'SHA-256' },
   			false,
   			['sign']
   		);
   		const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body + t));
   		const hex = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
   		if (!sig || hex !== sig) return new Response('bad signature', { status: 401 });
   		const res = await fetch('https://api.github.com/repos/nycu-life/landing/dispatches', {
   			method: 'POST',
   			headers: {
   				Authorization: `Bearer ${env.GITHUB_TOKEN}`,
   				Accept: 'application/vnd.github+json',
   				'User-Agent': 'nycu-life-ghost-relay'
   			},
   			body: JSON.stringify({ event_type: 'ghost-publish' })
   		});
   		return new Response(null, { status: res.ok ? 202 : 502 });
   	}
   };
   ```

   The signature format and the four event names (`post.published`,
   `post.published.edited`, `post.unpublished`, `post.deleted`) were checked
   against Ghost 6.75's `core/server/services/webhooks/webhook-trigger.js`.
   Check again after a Ghost major upgrade.

2. **Scheduled rebuild.** Add `schedule: - cron: '17 * * * *'` to the
   workflow triggers. No relay is needed, at the cost of up to an hour of
   delay and some idle builds. This also makes a good safety net next to
   option 1.
3. **Manual.** Actions → "Docker Build and Push" → _Run workflow_.

Deployment caveat: a rebuild pushes `:latest`. It reaches nycu.life only if the
prod overlay in `nycu-life/k8s-manifests` tracks that tag, e.g. through ArgoCD
Image Updater. A pinned `vX.Y.Z` tag needs a promotion.
