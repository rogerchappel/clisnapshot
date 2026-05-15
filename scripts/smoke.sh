#!/usr/bin/env bash
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"
npm run build >/dev/null
rm -rf .smoke-tmp
mkdir -p .smoke-tmp
node dist/cli.js init .smoke-tmp >/dev/null
cp fixtures/bin/example-cli.mjs .smoke-tmp/fixtures/bin/example-cli.mjs
(
  cd .smoke-tmp
  node ../dist/cli.js list | grep help-output >/dev/null
  node ../dist/cli.js run --update >/dev/null
  node ../dist/cli.js run >/dev/null
  printf 'id 123e4567-e89b-12d3-a456-426614174000 took 12ms\n' | node ../dist/cli.js scrub | grep '<UUID>' >/dev/null
)
echo "smoke passed"
