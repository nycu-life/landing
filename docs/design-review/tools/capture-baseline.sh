#!/usr/bin/env bash
# Shoot the fixed baseline set from a `main` worktree (already built with
# `pnpm cms:theme-build && pnpm build`): install its theme, serve its Node build on
# :14191 / :18291 (+ a Ghost-down instance on :14194), capture, then reinstall the
# theme of this checkout (dist/nycu-life.zip must exist).
#   capture-baseline.sh /tmp/nycu-hc/baseline
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
root=$(cd "$here/../../.." && pwd)
dir=${REVIEW_DIR:-/tmp/nycu-hc}
baseline=$1
set -a
. "$dir/env"
set +a
export GHOST_ADMIN_URL=http://127.0.0.1:2379 GHOST_ADMIN_SESSION_FILE="$dir/session.json"
export WISH_ADMIN_TOKEN=$(cat "$dir/admin-token")
(cd "$baseline" && node scripts/install-ghost-theme.mjs --apply | tail -1)
"$here/serve.sh" site base "$baseline/build" 14191 18291
"$here/serve.sh" site basedown "$baseline/build" 14194 18294 http://127.0.0.1:9
sleep 3
"$here/wait-load.sh" 10
rm -rf "$dir/sets/baseline"
nice node "$here/capture.mjs" site http://127.0.0.1:18291 http://127.0.0.1:14194 "$dir/sets/baseline" | grep -v "^$dir" || true
for name in base-node base-gateway basedown-node basedown-gateway; do kill "$(cat "$dir/$name.pid")" 2>/dev/null || true; done
(cd "$root" && node scripts/install-ghost-theme.mjs --apply | tail -1)
ls "$dir/sets/baseline" | wc -l
