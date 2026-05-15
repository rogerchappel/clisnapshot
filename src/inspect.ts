import { loadConfig } from "./config.js";

export async function listCases(configPath?: string): Promise<string[]> {
  const { config } = await loadConfig(configPath);
  return Object.keys(config.cases).sort();
}

export async function inspectConfig(configPath?: string): Promise<object> {
  const { config, path, root } = await loadConfig(configPath);
  return {
    path,
    root,
    snapshotDir: config.snapshotDir ?? "__snapshots__",
    cases: Object.keys(config.cases).sort()
  };
}
