import fs from "node:fs/promises";
import path from "node:path";
import type { CliSnapshotConfig } from "./types.js";
import { CliSnapshotError } from "./errors.js";

export const DEFAULT_CONFIG_NAME = "clisnapshot.config.json";

export function defaultConfig(): CliSnapshotConfig {
  return {
    snapshotDir: "__snapshots__",
    fixturesDir: "fixtures",
    defaultTimeoutMs: 5000,
    scrubbers: [],
    cases: {
      "help-output": {
        command: "node",
        args: ["fixtures/bin/example-cli.mjs", "--help"],
        snapshot: "help-output.snap"
      }
    }
  };
}

export async function loadConfig(configPath = DEFAULT_CONFIG_NAME): Promise<{ config: CliSnapshotConfig; path: string; root: string }> {
  const resolved = path.resolve(configPath);
  let raw: string;
  try {
    raw = await fs.readFile(resolved, "utf8");
  } catch (error) {
    throw new CliSnapshotError(`Could not read config at ${resolved}. Run 'clisnapshot init' first.`, "CONFIG_NOT_FOUND");
  }
  let config: CliSnapshotConfig;
  try {
    config = JSON.parse(raw) as CliSnapshotConfig;
  } catch (error) {
    throw new CliSnapshotError(`Invalid JSON config at ${resolved}`, "CONFIG_INVALID_JSON");
  }
  validateConfig(config);
  return { config, path: resolved, root: path.dirname(resolved) };
}

export function validateConfig(config: CliSnapshotConfig): void {
  if (!config || typeof config !== "object") throw new CliSnapshotError("Config must be an object", "CONFIG_INVALID");
  if (!config.cases || typeof config.cases !== "object" || Array.isArray(config.cases)) {
    throw new CliSnapshotError("Config must include a cases object", "CONFIG_INVALID");
  }
  for (const [name, testCase] of Object.entries(config.cases)) {
    if (!name.trim()) throw new CliSnapshotError("Case names cannot be empty", "CONFIG_INVALID");
    if (!testCase.command || typeof testCase.command !== "string") {
      throw new CliSnapshotError(`Case '${name}' must include a string command`, "CONFIG_INVALID");
    }
    if (testCase.args && !Array.isArray(testCase.args)) throw new CliSnapshotError(`Case '${name}' args must be an array`, "CONFIG_INVALID");
  }
}
