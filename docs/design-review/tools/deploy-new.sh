#!/usr/bin/env bash
# Rebuild this checkout for the review stack and (re)start it on :14192 / :18292.
#   deploy-new.sh theme      theme only (Ghost serves it immediately)
#   deploy-new.sh all        theme + SvelteKit build + restart Node and gateway
# Waits for load ≤ 10 and builds with nice/ionice; the Ghost owner session comes
# from review-ghost.mjs session.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
root=$(cd "$here/../../.." && pwd)
dir=${REVIEW_DIR:-/tmp/nycu-hc}
cd "$root"
"$here/wait-load.sh" 10
nice -n 15 ionice -c3 node scripts/build-ghost-theme.mjs | tail -1
GHOST_ADMIN_URL=http://127.0.0.1:2379 GHOST_ADMIN_SESSION_FILE="$dir/session.json" \
	node scripts/install-ghost-theme.mjs --apply | tail -1
if [ "${1:-theme}" = all ]; then
	"$here/wait-load.sh" 10
	nice -n 15 ionice -c3 pnpm build >"$dir/new-build.log" 2>&1 || { tail -20 "$dir/new-build.log"; exit 1; }
	for name in new-node new-gateway; do
		[ -f "$dir/$name.pid" ] && kill "$(cat "$dir/$name.pid")" 2>/dev/null || true
	done
	sleep 1
	rm -rf "$dir/new-build" && cp -r build "$dir/new-build"
	"$here/serve.sh" site new "$dir/new-build" 14192 18292
	sleep 2
fi
echo deployed
