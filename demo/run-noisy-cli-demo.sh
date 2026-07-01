#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/.tmp/demo-noisy-cli"

rm -rf "$OUT"
mkdir -p "$OUT"

npm run build

cp "$ROOT/examples/noisy-demo.config.json" "$OUT/clisnapshot.config.json"
cp "$ROOT/examples/noisy-cli.mjs" "$OUT/noisy-cli.mjs"

cd "$OUT"
node "$ROOT/dist/cli.js" list | grep -q "noisy-report"
node "$ROOT/dist/cli.js" run --update
node "$ROOT/dist/cli.js" run

printf 'run_id=1f8f5f7e-9a1b-4f6a-a5af-3f9a0b9a2c01 duration=42ms\n' \
  | node "$ROOT/dist/cli.js" scrub \
  | tee scrubbed.txt

grep -q "<UUID>" scrubbed.txt
grep -q "<DURATION>" scrubbed.txt
grep -q "<DATE>" "__snapshots__/noisy-report.snap"

echo
echo "Demo artifacts written to $OUT"
echo "  $OUT/__snapshots__/noisy-report.snap"
echo "  $OUT/scrubbed.txt"
