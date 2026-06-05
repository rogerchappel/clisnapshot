# Social Hook Pack

Use these as draft prompts for human-edited posts. They are grounded in the README, examples, and `docs/tutorials/stabilize-noisy-cli-output.md`.

## Short Posts

- CLI snapshot tests are easy until timestamps, UUIDs, durations, and home paths make every run look different. `clisnapshot` includes built-in scrubbers for those common drifts.
- The new noisy-output demo shows the full loop: run a fixture CLI, update snapshots intentionally, then run the read-only check.
- `clisnapshot` writes plain text snapshots that can be reviewed in git. No hosted service, telemetry, or account requirement.

## Demo CTA

Try the local demo:

```sh
npm run build
node dist/cli.js run --config examples/noisy-demo.config.json --update
node dist/cli.js run --config examples/noisy-demo.config.json
```

## Guardrails

- Say "scrubbers are a guardrail" instead of "secret scanning."
- Do not claim adoption, benchmark, or hosted workflow numbers.
- Keep the focus on deterministic local CLI output review.
