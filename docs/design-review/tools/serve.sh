#!/usr/bin/env bash
# Start one review stack in the background (local only).
#   serve.sh api                      Wish API on :13011 (Postgres nycu-hc-pg :55441)
#   serve.sh site NAME BUILD_DIR NODE_PORT GATEWAY_PORT [GHOST_URL]
# Logs and pids go to $REVIEW_DIR (default /tmp/nycu-hc).
set -euo pipefail
dir=${REVIEW_DIR:-/tmp/nycu-hc}
here=$(cd "$(dirname "$0")" && pwd)
case "$1" in
api)
	# The API binds every interface, so it runs in a container published on loopback only.
	(cd "$here/../../../api" && CGO_ENABLED=0 nice go build -o "$dir/wish-api" ./cmd/wish-api)
	docker network inspect nycu-hc-net >/dev/null 2>&1 || docker network create nycu-hc-net >/dev/null
	docker network connect nycu-hc-net nycu-hc-pg 2>/dev/null || true
	docker rm -f nycu-hc-api >/dev/null 2>&1 || true
	docker run -d --name nycu-hc-api --network nycu-hc-net -v "$dir/wish-api:/wish-api:ro" \
		-e "DATABASE_URL=postgres://wishes:wishes@nycu-hc-pg:5432/wishes?sslmode=disable" -e PORT=3001 \
		-e "WISH_COOKIE_SECRET=$(cat "$dir/cookie-secret")" -e "WISH_ADMIN_TOKEN=$(cat "$dir/admin-token")" \
		-p 127.0.0.1:13011:3001 alpine:3 /wish-api >/dev/null
	;;
site)
	name=$2 build=$3 nodePort=$4 gatewayPort=$5 ghost=${6:-http://127.0.0.1:2379}
	key=$(grep "^GHOST_CONTENT_API_KEY=" "$dir/env" | cut -d= -f2-)
	PUBLIC_SITE_ENGINE=ghost GHOST_THEME_URL=$ghost GHOST_URL=$ghost GHOST_PUBLIC_URL=http://127.0.0.1:2379 GHOST_CONTENT_API_KEY=$key \
		ORIGIN=http://127.0.0.1:$gatewayPort HOST=127.0.0.1 PORT=$nodePort \
		setsid nohup nice -n 5 node "$build/index.js" >"$dir/$name-node.log" 2>&1 &
	echo $! >"$dir/$name-node.pid"
	PORT=$gatewayPort NODE_URL=http://127.0.0.1:$nodePort GHOST_URL=http://127.0.0.1:2379 WISH_URL=http://127.0.0.1:13011 \
		setsid nohup node "$here/gateway.mjs" >"$dir/$name-gateway.log" 2>&1 &
	echo $! >"$dir/$name-gateway.pid"
	;;
*)
	echo "usage: serve.sh api | site NAME BUILD_DIR NODE_PORT GATEWAY_PORT [GHOST_URL]" >&2
	exit 2
	;;
esac
