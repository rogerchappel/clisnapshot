#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
smoke_root="$(mktemp -d "${TMPDIR:-/tmp}/clisnapshot-package-smoke.XXXXXX")"
trap 'rm -rf "$smoke_root"' EXIT

install_dir="$smoke_root/install"
mkdir -p "$install_dir"

package_tarball="${1:-}"
if [[ -z "$package_tarball" ]]; then
  package_dir="$smoke_root/package"
  mkdir -p "$package_dir"
  cd "$project_root"
  npm pack --pack-destination "$package_dir" >/dev/null
  package_tarball="$(find "$package_dir" -maxdepth 1 -type f -name '*.tgz' -print -quit)"
else
  package_tarball="$(cd "$(dirname "$package_tarball")" && pwd)/$(basename "$package_tarball")"
fi

if [[ -z "$package_tarball" || ! -f "$package_tarball" ]]; then
  echo "package smoke: npm pack did not create a tarball" >&2
  exit 1
fi

cd "$install_dir"
npm init --yes >/dev/null
npm install --ignore-scripts --no-audit --no-fund "$package_tarball" >/dev/null
help_output="$(./node_modules/.bin/clisnapshot --help)"

if [[ "$help_output" != *"Usage:"* || "$help_output" != *"clisnapshot run"* ]]; then
  echo "package smoke: installed clisnapshot --help output was incomplete" >&2
  exit 1
fi

echo "package smoke: installed $(basename "$package_tarball") and ran clisnapshot --help"
