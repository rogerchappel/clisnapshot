import type { SnapshotRecord } from "./types.js";

export function formatSnapshot(record: SnapshotRecord): string {
  return [
    `# clisnapshot v1`,
    `case: ${record.case}`,
    `command: ${record.command} ${record.args.join(" ")}`.trimEnd(),
    `exitCode: ${record.exitCode ?? "null"}`,
    `signal: ${record.signal ?? "null"}`,
    `--- stdout ---`,
    record.stdout.trimEnd(),
    `--- stderr ---`,
    record.stderr.trimEnd(),
    ""
  ].join("\n");
}
