# clisnapshot Social Hooks

Grounded post drafts for the noisy CLI fixture.

## Short Posts

1. `clisnapshot` snapshots CLI output after normalizing noisy fields like UUIDs, timestamps, durations, temp paths, home paths, and ANSI color.
2. The noisy CLI demo runs a fixture command, writes snapshots, reruns them, and shows the same scrubber logic on stdin.
3. Snapshot updates are explicit: `clisnapshot run --update` writes fixtures, while `clisnapshot run` compares them.
4. Everything stays local: config, fixture commands, and `.snap` files are plain repo files.

## Demo Angle

Run:

```sh
npm install
bash demo/run-noisy-cli-demo.sh
```

Show `.tmp/demo-noisy-cli/__snapshots__/noisy-report.snap` and point out the normalized UUID, timestamp, duration, and home path.

## Guardrails

- Do not claim scrubbers make secrets safe to snapshot.
- Keep the story on deterministic terminal-output fixtures.
- Mention that fixture commands are executed by the local developer or CI job.
