# Safety model

`clisnapshot` is designed for local, reviewable snapshot updates.

- It never sends command output to a service.
- `run` compares snapshots without writing unless `--update` is present.
- Snapshot paths are resolved inside the configured snapshot directory.
- ANSI, timestamps, UUIDs, durations, home paths, cwd paths, and temp paths are scrubbed by default.
- Custom scrubbers can redact project-specific tokens before snapshots are written.

Do not intentionally snapshot secrets. If a secret lands in a snapshot, rotate it and remove it from git history using your normal incident process.
