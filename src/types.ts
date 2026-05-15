export type StreamName = "stdout" | "stderr";

export interface CliSnapshotCase {
  command: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  snapshot?: string;
  stdin?: string;
  timeoutMs?: number;
  scrubbers?: ScrubberConfig[];
}

export interface ScrubberConfig {
  pattern: string;
  replacement: string;
  flags?: string;
}

export interface CliSnapshotConfig {
  $schema?: string;
  snapshotDir?: string;
  fixturesDir?: string;
  defaultTimeoutMs?: number;
  scrubbers?: ScrubberConfig[];
  cases: Record<string, CliSnapshotCase>;
}

export interface SnapshotRecord {
  case: string;
  command: string;
  args: string[];
  exitCode: number | null;
  signal: NodeJS.Signals | null;
  stdout: string;
  stderr: string;
}

export interface RunOptions {
  caseName?: string;
  update?: boolean;
  configPath?: string;
}

export interface RunSummary {
  passed: number;
  failed: number;
  updated: number;
  results: CaseResult[];
}

export interface CaseResult {
  name: string;
  status: "passed" | "failed" | "updated";
  snapshotPath: string;
  diff?: string;
  actual: SnapshotRecord;
}
