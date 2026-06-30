# clisnapshot

Stable snapshots for terminal output without the confetti drift 📸

`clisnapshot` is a local-first CLI snapshot runner for people who build command-line tools. It runs named fixture commands, scrubs noisy output, and compares stdout, stderr, and exit codes against plain text snapshots you can review in git.

## Why it exists

CLI output drifts for boring reasons: ANSI color, UUIDs, dates, temp paths, home directories, durations, and platform-specific paths. `clisnapshot` keeps the useful signal while sanding down the confetti.

## Install

```sh
npm install --save-dev clisnapshot
```

Or try the repo locally:

```sh
npm install
npm run build
node dist/cli.js --help
```

## Quick start

```sh
npx clisnapshot init
npx clisnapshot run --update
npx clisnapshot run
```

A minimal `clisnapshot.config.json`:

```json
{
  "snapshotDir": "__snapshots__",
  "cases": {
    "help-output": {
      "command": "node",
      "args": ["fixtures/bin/example-cli.mjs", "--help"],
      "snapshot": "help-output.snap"
    }
  }
}
```

## Commands

- `clisnapshot init [dir]` — create a starter config, fixture CLI, and snapshot directory.
- `clisnapshot run [--update] [--case name]` — compare configured cases or intentionally rewrite snapshots.
- `clisnapshot list` — print configured case names.
- `clisnapshot inspect` — show resolved config metadata as JSON.
- `clisnapshot scrub [text]` — normalize noisy terminal text from an argument or stdin.

## Scrubbing

Built-in scrubbers normalize:

- ANSI escape codes
- CRLF line endings
- home and current working directories
- temp paths
- ISO-like dates/timestamps
- UUIDs
- common durations such as `42ms` or `1.2s`

Add project-specific scrubbers:

```json
{
  "scrubbers": [
    { "pattern": "api_[A-Za-z0-9]+", "replacement": "api_<TOKEN>" }
  ],
  "cases": {}
}
```

## Local-first safety

`clisnapshot run` is read-only unless you pass `--update`. Snapshot writes are constrained to the configured snapshot directory, and unsafe path traversal is rejected. There is no hosted service, telemetry, or account requirement.

Avoid snapshotting secrets. Scrubbers are a guardrail, not a vault.

## Developer workflow

```sh
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
```

For a real fixture smoke:

```sh
node dist/cli.js run --update --case help-output
node dist/cli.js run --case help-output
```

## Examples

See [`examples/clisnapshot.config.json`](examples/clisnapshot.config.json) and [`fixtures/bin/example-cli.mjs`](fixtures/bin/example-cli.mjs).

For a focused noisy-output walkthrough, see [`docs/tutorials/stabilize-noisy-cli-output.md`](docs/tutorials/stabilize-noisy-cli-output.md) and the runnable config in [`examples/noisy-demo.config.json`](examples/noisy-demo.config.json).

For a temp-directory review pack that generates and verifies noisy-output
snapshots without changing checked-in examples, run:

```sh
bash demo/run-noisy-review-pack.sh
```

See [`docs/tutorials/noisy-review-pack.md`](docs/tutorials/noisy-review-pack.md)
and [`docs/promo/noisy-review-launch-note.md`](docs/promo/noisy-review-launch-note.md).

## Contributing and security

Small, atomic PRs are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Development

Use Node.js 20 or newer. Run the same checks locally before opening a PR:

```sh
npm run build
npm run check
npm test
npm run smoke
npm run package:smoke
npm run release:check
```

## License

MIT
