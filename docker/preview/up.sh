#!/usr/bin/env bash
# Build and (re)start the full local preview: static site prerendered against the
# local Ghost, the Wish API, Postgres, and a gateway on 127.0.0.1:$PREVIEW_PORT.
# See docs/preview.md.
set -euo pipefail
cd "$(dirname "$0")/../.."

[[ -f docker/preview/.env ]] || { echo "missing docker/preview/.env (see docs/preview.md)" >&2; exit 1; }
[[ -f .env.ghost.local ]] || { echo "missing .env.ghost.local (run docker/ghost/seed.mjs)" >&2; exit 1; }
set -a
# shellcheck disable=SC1091
. ./.env.ghost.local
. docker/preview/.env
set +a
# Build-side Ghost URL; defaults to the seed's value.
GHOST_URL="${PREVIEW_GHOST_URL:-$GHOST_URL}"

docker build --network host \
	--build-arg GHOST_URL="$GHOST_URL" \
	--build-arg GHOST_REQUIRED="${GHOST_REQUIRED:-}" \
	--build-arg CONTENT_REVISION="$(date +%s)" \
	--secret id=ghost_content_api_key,env=GHOST_CONTENT_API_KEY \
	-t landing-preview-web:latest .

docker compose -f docker/preview/compose.yml --env-file docker/preview/.env up -d --build --remove-orphans
