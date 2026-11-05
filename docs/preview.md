# Full-stack local preview

Runs the production shape on one machine: the Node site (reading a local Ghost at runtime), the Go Wish API with Postgres, and a gateway that mirrors the
production Traefik split (`/api/wishes` → API, everything else → Node site).

```
browser ──> gateway :18090 ──/api/wishes──> wish-api ──> postgres
                         └──────/──────────> web (Node + prerendered fixed pages)
Ghost :2368 (docker/ghost/compose.yml) ──read at runtime──> web service
```

## One-time setup

1. Start and seed Ghost (see `docs/ghost.md`); this writes `.env.ghost.local`.
2. Create `docker/preview/.env` (git-ignored):

   ```sh
   PREVIEW_PORT=18090
   WISH_COOKIE_SECRET=<openssl rand -hex 32>
   WISH_ADMIN_TOKEN=<openssl rand -hex 24>
   WISH_SERVICE_CLIENTS=superapp:<openssl rand -hex 24>
   # Optional: admin sign-in through auth.nycu.one. The redirect URL must be
   # registered on the Authentik provider, otherwise Authentik rejects it.
   WISH_OIDC_ISSUER=https://auth.nycu.one/application/o/wishpool-admin-dev/
   WISH_OIDC_CLIENT_ID=wishpool-admin-dev
   WISH_OIDC_REDIRECT_URL=https://<preview host>/api/wishes/auth/callback
   # Ghost URL reachable from the web container (shared external Docker network).
   PREVIEW_GHOST_URL=http://ghost:2368
   # Use the shared HTTPS origin when sharing over Tailscale.
   PREVIEW_ORIGIN=http://127.0.0.1:18090
   GHOST_PUBLIC_URL=http://127.0.0.1:2368
   ```

## Run

```sh
./docker/preview/up.sh        # builds the site image, then compose up
docker compose -f docker/preview/compose.yml --env-file docker/preview/.env down
```

Publishing in Ghost appears on the next request after the 30-second catalog
cache expires. No rebuild is needed. Start the Ghost compose stack before the
preview: its external `nycu-life-ghost_default` network must exist.

## Sharing over Tailscale

```sh
sudo tailscale serve --bg --https=12443 http://127.0.0.1:18090   # site + API
sudo tailscale serve --bg --https=12444 http://127.0.0.1:2368    # Ghost Admin
```

When Ghost is served over HTTPS this way, start it with
`GHOST_PUBLIC_URL=https://<host>:12444` so Ghost Admin links and image URLs use
the public origin. Remove the shares with `sudo tailscale serve --https=<port> off`.
