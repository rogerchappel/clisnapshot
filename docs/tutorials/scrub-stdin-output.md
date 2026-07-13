# Scrub noisy stdin output

Use this recipe when a CLI already writes output somewhere else and you want to
check how `clisnapshot` will normalize the noisy parts before creating a full
snapshot case.

## Run the demo

```sh
bash demo/run-stdin-scrub-demo.sh
```

The script writes a temporary `noisy-output.txt`, pipes it through
`clisnapshot scrub`, and verifies that common unstable values are normalized.

## What changes

The demo covers:

- UUIDs, normalized to `<UUID>`;
- ISO-like dates, normalized to `<DATE>`;
- temp paths, normalized to `<TMP>`;
- durations, normalized to `<DURATION>`.

The output lands in `.tmp/demo-stdin-scrub/scrubbed-output.txt`, which makes it
easy to paste into an issue or compare before promoting the command into a
configured snapshot case.

## Verification

The demo only uses committed CLI code and temporary files. It does not update
checked-in snapshots and does not require `--update`.
