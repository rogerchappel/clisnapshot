#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

npm run build >/dev/null

cp "$ROOT/examples/noisy-cli.mjs" "$TMP/noisy-cli.mjs"
cp "$ROOT/examples/noisy-demo.config.json" "$TMP/clisnapshot.config.json"

cd "$TMP"

node "$ROOT/dist/cli.js" run --config clisnapshot.config.json --update >/dev/null
node "$ROOT/dist/cli.js" run --config clisnapshot.config.json >/dev/null
node "$ROOT/dist/cli.js" inspect --config clisnapshot.config.json > inspect.json
node "$ROOT/dist/cli.js" scrub < noisy-cli.mjs > scrubbed-source.txt

grep -q "<UUID>" __snapshots__/noisy-report.snap
grep -q "<DATE>" __snapshots__/noisy-report.snap
grep -q "<DURATION>" __snapshots__/noisy-report.snap
grep -q "noisy-report" inspect.json
grep -q "run_id=" scrubbed-source.txt

echo "Snapshot report: $TMP/__snapshots__/noisy-report.snap"
echo "Config inspection: $TMP/inspect.json"
echo "Scrubbed source sample: $TMP/scrubbed-source.txt"
