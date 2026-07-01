# Video Brief: Stabilize Noisy CLI Output

## Promise

Show how `clisnapshot` turns terminal output with changing IDs, timestamps, durations, and paths into reviewable snapshots.

## Demo Path

1. Open `examples/noisy-cli.mjs` and `examples/noisy-demo.config.json`.
2. Run `bash demo/run-noisy-cli-demo.sh`.
3. Open `.tmp/demo-noisy-cli/__snapshots__/noisy-report.snap`.
4. Open `.tmp/demo-noisy-cli/scrubbed.txt`.
5. Rerun `node dist/cli.js run --config .tmp/demo-noisy-cli/clisnapshot.config.json` from the repo root.

## On-Screen Commands

```sh
npm install
bash demo/run-noisy-cli-demo.sh
```

## Talk Track

- "The update pass intentionally writes snapshots."
- "The compare pass fails if normalized output drifts."
- "The scrub command is useful when you want to inspect normalization directly."

## Boundaries

- `clisnapshot` executes the commands listed in config; keep fixtures safe and local.
- Scrubbers are deterministic text replacements, not a secret manager.
- Snapshot files should still be reviewed like any other test fixture.
