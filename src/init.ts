import fs from "node:fs/promises";
import path from "node:path";
import { defaultConfig, DEFAULT_CONFIG_NAME } from "./config.js";

export async function initProject(targetDir = "."): Promise<string[]> {
  const root = path.resolve(targetDir);
  const written: string[] = [];
  await fs.mkdir(path.join(root, "fixtures", "bin"), { recursive: true });
  await fs.mkdir(path.join(root, "__snapshots__"), { recursive: true });
  const configPath = path.join(root, DEFAULT_CONFIG_NAME);
  await writeNew(configPath, `${JSON.stringify(defaultConfig(), null, 2)}\n`, written);
  await writeNew(path.join(root, "fixtures", "bin", "example-cli.mjs"), `#!/usr/bin/env node\nif (process.argv.includes('--help')) {\n  console.log('example-cli <command>');\n  console.log('Commands: hello, version');\n} else {\n  console.log('hello from example-cli');\n}\n`, written, 0o755);
  return written;
}

async function writeNew(file: string, content: string, written: string[], mode?: number): Promise<void> {
  try {
    await fs.writeFile(file, content, { flag: "wx", mode });
    written.push(file);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
  }
}
