# Stdin Scrub Social Pack

## Core angle

`clisnapshot scrub` lets CLI maintainers preview how noisy terminal output will
be normalized before they commit a snapshot fixture.

## Short posts

1. Snapshot diffs get noisy when output contains UUIDs, timestamps, temp paths,
   and durations. `clisnapshot scrub` can normalize that text directly from
   stdin before you create a full snapshot case.

2. New demo: `bash demo/run-stdin-scrub-demo.sh` writes noisy sample output,
   pipes it through `clisnapshot scrub`, and verifies placeholders like
   `<UUID>`, `<DATE>`, `<TMP>`, and `<DURATION>`.

3. The useful workflow is small: inspect the scrubbed output first, then decide
   whether the command deserves a committed snapshot case.

## Recording outline

- Show the generated `noisy-output.txt`.
- Run `bash demo/run-stdin-scrub-demo.sh`.
- Compare `noisy-output.txt` and `scrubbed-output.txt`.
- Point out that no checked-in snapshots were updated.

## Grounding notes

- Demo command: `bash demo/run-stdin-scrub-demo.sh`
- Output directory: `.tmp/demo-stdin-scrub/`
- Command under demo: `node dist/cli.js scrub`
- Limitation: scrubbers reduce common noise, but projects should still avoid
  snapshotting secrets.
