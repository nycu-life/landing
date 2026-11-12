#!/usr/bin/env bash
# Block until the 1-minute load average is at or below LIMIT (default 10).
# Builds and screenshot runs call this first; the host is shared.
limit=${1:-10}
while :; do
	load=$(cut -d' ' -f1 /proc/loadavg)
	awk -v l="$load" -v m="$limit" 'BEGIN { exit !(l <= m) }' && exit 0
	echo "load $load > $limit, waiting" >&2
	sleep 20
done
