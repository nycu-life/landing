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
# Content is fetched at runtime; no CMS secrets enter the image build.
docker build -t landing-preview-web:latest .

docker compose -f docker/preview/compose.yml --env-file docker/preview/.env up -d --build --remove-orphans
