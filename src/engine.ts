import fs from "node:fs/promises";
import path from "node:path";
import { loadConfig } from "./config.js";
import { unifiedDiff } from "./diff.js";
import { formatSnapshot } from "./format.js";
import { executeCase } from "./runner.js";
import { safeJoin, slugifyCaseName } from "./path-safety.js";
import type { CaseResult, RunOptions, RunSummary } from "./types.js";
import { CliSnapshotError } from "./errors.js";

export async function runSnapshots(options: RunOptions = {}): Promise<RunSummary> {
  const loaded = await loadConfig(options.configPath);
  const { config, root } = loaded;
  const entries = Object.entries(config.cases).filter(([name]) => !options.caseName || name === options.caseName);
  if (options.caseName && entries.length === 0) throw new CliSnapshotError(`No snapshot case named '${options.caseName}'`, "CASE_NOT_FOUND");
  const results: CaseResult[] = [];
  for (const [name, testCase] of entries) {
    const actual = await executeCase(name, testCase, root, config.scrubbers ?? [], config.defaultTimeoutMs ?? 5000);
    const rendered = formatSnapshot(actual);
    const snapshotName = testCase.snapshot ?? `${slugifyCaseName(name)}.snap`;
    const snapshotPath = safeJoin(path.resolve(root, config.snapshotDir ?? "__snapshots__"), snapshotName);
    if (options.update) {
      await fs.mkdir(path.dirname(snapshotPath), { recursive: true });
      await fs.writeFile(snapshotPath, rendered, "utf8");
      results.push({ name, status: "updated", snapshotPath, actual });
      continue;
    }
    let expected: string;
    try {
      expected = await fs.readFile(snapshotPath, "utf8");
    } catch {
      const diff = `Missing snapshot: ${snapshotPath}\nRun clisnapshot run --update${options.caseName ? ` --case ${options.caseName}` : ""}`;
      results.push({ name, status: "failed", snapshotPath, diff, actual });
      continue;
    }
    if (expected === rendered) results.push({ name, status: "passed", snapshotPath, actual });
    else results.push({ name, status: "failed", snapshotPath, diff: unifiedDiff(expected, rendered, snapshotName), actual });
  }
  return {
    passed: results.filter(r => r.status === "passed").length,
    failed: results.filter(r => r.status === "failed").length,
    updated: results.filter(r => r.status === "updated").length,
    results
  };
}
