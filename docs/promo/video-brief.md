# Video Brief: Snapshot Noisy CLI Output

## Angle

Show a command-line tool whose output changes for harmless reasons, then use `clisnapshot` to turn that output into a stable reviewable snapshot.

## Grounded Demo Assets

- Demo CLI: `examples/noisy-cli.mjs`
- Demo config: `examples/noisy-demo.config.json`
- Tutorial: `docs/tutorials/stabilize-noisy-cli-output.md`
- Existing fixture CLI: `fixtures/bin/example-cli.mjs`

## 60-Second Flow

1. Run `node examples/noisy-cli.mjs report` and point out the UUID, timestamp, duration, and home-directory path.
2. Build the local package with `npm run build`.
3. Run `node dist/cli.js run --config examples/noisy-demo.config.json --update`.
4. Open the generated snapshot and show the scrubbed placeholders.
5. Run `node dist/cli.js run --config examples/noisy-demo.config.json` to show the read-only pass.

## Claims To Avoid

- Do not claim benchmarks or adoption numbers.
- Do not imply secret scanning. The README says scrubbers are a guardrail, not a vault.
- Do not claim hosted service features; the tool is local-first.

## Short Hooks

- "Snapshot tests for CLIs, without UUIDs and timestamps wrecking every diff."
- "Turn a noisy terminal command into a stable git-reviewed fixture."
- "A local-first way to keep README and CLI output changes honest."
