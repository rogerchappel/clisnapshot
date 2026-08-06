import fs from "node:fs/promises";
import path from "node:path";
import type { CliSnapshotConfig } from "./types.js";
import { CliSnapshotError } from "./errors.js";
import { slugifyCaseName } from "./path-safety.js";

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
  if (config.defaultTimeoutMs !== undefined) validateTimeout(config.defaultTimeoutMs, "defaultTimeoutMs");
  if (config.snapshotDir !== undefined && typeof config.snapshotDir !== "string") invalid("snapshotDir must be a string");
  if (config.fixturesDir !== undefined && typeof config.fixturesDir !== "string") invalid("fixturesDir must be a string");
  if (config.scrubbers !== undefined) validateScrubbers(config.scrubbers, "Config scrubbers");

  const snapshotOwners = new Map<string, string>();
  for (const [name, testCase] of Object.entries(config.cases)) {
    if (!name.trim()) throw new CliSnapshotError("Case names cannot be empty", "CONFIG_INVALID");
    if (!testCase || typeof testCase !== "object" || Array.isArray(testCase)) invalid(`Case '${name}' must be an object`);
    if (!testCase.command || typeof testCase.command !== "string") {
      throw new CliSnapshotError(`Case '${name}' must include a string command`, "CONFIG_INVALID");
    }
    if (testCase.args !== undefined && (!Array.isArray(testCase.args) || testCase.args.some(arg => typeof arg !== "string"))) {
      invalid(`Case '${name}' args must be an array of strings`);
    }
    if (testCase.env !== undefined && (!testCase.env || typeof testCase.env !== "object" || Array.isArray(testCase.env) || Object.values(testCase.env).some(value => typeof value !== "string"))) {
      invalid(`Case '${name}' env must be an object with string values`);
    }
    if (testCase.timeoutMs !== undefined) validateTimeout(testCase.timeoutMs, `Case '${name}' timeoutMs`);
    for (const field of ["cwd", "snapshot", "stdin"] as const) {
      if (testCase[field] !== undefined && typeof testCase[field] !== "string") invalid(`Case '${name}' ${field} must be a string`);
    }
    if (testCase.scrubbers !== undefined) validateScrubbers(testCase.scrubbers, `Case '${name}' scrubbers`);

    const snapshot = testCase.snapshot ?? `${slugifyCaseName(name)}.snap`;
    const destination = path.resolve("/snapshots", snapshot);
    const owner = snapshotOwners.get(destination);
    if (owner !== undefined) invalid(`Cases '${owner}' and '${name}' resolve to the same snapshot path: ${snapshot}`);
    snapshotOwners.set(destination, name);
  }
}

function invalid(message: string): never {
  throw new CliSnapshotError(message, "CONFIG_INVALID");
}

function validateTimeout(value: unknown, label: string): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) invalid(`${label} must be a finite positive number`);
}

function validateScrubbers(value: unknown, label: string): void {
  if (!Array.isArray(value)) invalid(`${label} must be an array`);
  for (let index = 0; index < value.length; index += 1) {
    const scrubber = value[index];
    if (!scrubber || typeof scrubber !== "object" || Array.isArray(scrubber)) invalid(`${label}[${index}] must be an object`);
    if (typeof scrubber.pattern !== "string") invalid(`${label}[${index}] pattern must be a string`);
    if (typeof scrubber.replacement !== "string") invalid(`${label}[${index}] replacement must be a string`);
    if (scrubber.flags !== undefined && typeof scrubber.flags !== "string") invalid(`${label}[${index}] flags must be a string`);
  }
}
