# CliSnapshot PRD

Status: in-progress

## One-liner

Stable snapshots for terminal output without the confetti drift 📸

## Problem

Snapshotting CLI output is useful but noisy: ANSI color, paths, durations, dates, random IDs, and platform differences create churn.

## Proposed solution

A local snapshot runner for CLI commands with built-in scrubbers, fixture directories, update mode, and readable diffs.

## Primary users

TypeScript/Python CLI authors, release engineers, agents validating generated command UX.

## V1 scope

- Run named command snapshots from a declarative config
- Scrub ANSI, temp paths, home directories, timestamps, UUIDs, durations, and custom regexes
- Compare stdout/stderr/exit code snapshots with concise unified diffs
- Update snapshots explicitly with --update
- Provide a small JS API for tests and a standalone CLI for shell pipelines

## CLI shape

```bash
clisnapshot init
clisnapshot run
clisnapshot run --update --case help-output
```

## Non-goals

- No hosted service, hidden telemetry, or required account.
- No secret collection; fixture and metadata redaction should be conservative.
- No broad framework lock-in beyond a practical Node/TypeScript CLI MVP.

## Local-first safety

- Default to dry-run or read-only behavior for write/apply style commands.
- Keep generated artifacts deterministic and reviewable.
- Fail closed on suspicious paths, binary blobs, or likely secrets.

## Acceptance criteria

- Functional CLI with help text and at least three useful commands.
- Fixture-backed tests covering happy path, validation failure, and deterministic output.
- README with concise examples, safety notes, and practical developer workflow.
- `npm test`, `npm run check`, `npm run build`, `npm run smoke`, and `bash scripts/validate.sh` pass where present.
- Public GitHub repo under `rogerchappel/clisnapshot` with description and topics.

## Attribution / inspiration

Inspired by Jest/Vitest snapshot ergonomics, reframed as a lightweight standalone CLI-output snapshotter.
