# Noisy Review Pack

This demo packages the noisy-output example into a temporary workspace so you
can show the update-and-verify loop without changing checked-in snapshots.

## Run it

```sh
bash demo/run-noisy-review-pack.sh
```

The script copies `examples/noisy-cli.mjs` and
`examples/noisy-demo.config.json` into a temporary directory, then:

- runs `clisnapshot run --update` to create snapshots,
- runs `clisnapshot run` to verify them read-only,
- writes `inspect.json` for config metadata, and
- writes a scrubbed source sample for review.

## What to show

Open the generated `noisy-report.snap` and point out that UUIDs, dates,
durations, and home-directory paths are normalized before comparison.

## Review guidance

Use this as a local proof loop for CLI output stability. Keep `--update` as an
intentional maintainer action, and use the read-only run in normal verification.
