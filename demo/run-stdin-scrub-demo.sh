#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/.tmp/demo-stdin-scrub"

rm -rf "$OUT"
mkdir -p "$OUT"

npm run build

cat > "$OUT/noisy-output.txt" <<'TEXT'
run_id=1f8f5f7e-9a1b-4f6a-a5af-3f9a0b9a2c01
started_at=2026-07-13T08:08:00Z
workspace=/tmp/clisnapshot-demo-12345
home=/Users/example/project
duration=42ms
TEXT

node "$ROOT/dist/cli.js" scrub < "$OUT/noisy-output.txt" > "$OUT/scrubbed-output.txt"

grep -q "<UUID>" "$OUT/scrubbed-output.txt"
grep -q "<DATE>" "$OUT/scrubbed-output.txt"
grep -q "<TMP>" "$OUT/scrubbed-output.txt"
grep -q "<DURATION>" "$OUT/scrubbed-output.txt"

echo "Stdin scrub artifacts written to $OUT"
echo "  $OUT/noisy-output.txt"
echo "  $OUT/scrubbed-output.txt"
