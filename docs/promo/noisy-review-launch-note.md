# Launch Note Draft: Noisy Review Pack

`clisnapshot` now has a runnable review pack for demonstrating stable CLI
snapshots without modifying checked-in example files.

## What is included

- `demo/run-noisy-review-pack.sh` builds the CLI and runs the noisy fixture in a
  temporary workspace.
- The script creates snapshots, verifies them read-only, writes config
  inspection JSON, and checks for scrubbed placeholders.
- `docs/tutorials/noisy-review-pack.md` explains what to review in the generated
  artifacts.

## Suggested post

CLI snapshot tests get noisy when output includes UUIDs, dates, durations,
and local paths. `clisnapshot` now has a temp-directory demo that shows the full
update-and-verify loop without touching your checked-in snapshots:

```sh
bash demo/run-noisy-review-pack.sh
```

## Guardrails

- Do not call scrubbers secret scanning.
- Do not claim the tool runs in a sandbox.
- Keep the proof grounded in the noisy fixture and generated snapshot artifacts.
