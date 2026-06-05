# Stabilize Noisy CLI Output

This recipe shows how to snapshot a command that prints values that normally drift between runs. The fixture in `examples/noisy-cli.mjs` prints a UUID, ISO timestamp, duration, and home-directory path so the built-in scrubbers have visible work to do.

## Run The Demo

From the repository root:

```sh
npm install
npm run build
rm -rf examples/__snapshots__
node dist/cli.js run --config examples/noisy-demo.config.json --update
node dist/cli.js run --config examples/noisy-demo.config.json
```

The first `run --update` writes snapshots under `examples/__snapshots__` because the config lives in `examples/`. The second run verifies the same command output against those snapshots.

## What To Look For

- `run_id` is normalized from a UUID-like value.
- `generated_at` is normalized from an ISO timestamp.
- `duration` is normalized from a millisecond value.
- `home_path` is normalized from the local home directory.

Those scrubbers are built in, so the demo does not need custom replacement rules. Add project-specific scrubbers only for application-specific values such as internal IDs or token-shaped placeholders.

## CI Shape

After committing the generated snapshots, CI can run the read-only check:

```sh
node dist/cli.js run --config examples/noisy-demo.config.json
```

Keep `--update` out of normal CI jobs. Use it only when intentionally accepting a CLI output change.
