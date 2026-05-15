import { spawn } from "node:child_process";
import path from "node:path";
import type { CliSnapshotCase, ScrubberConfig, SnapshotRecord } from "./types.js";
import { scrubText } from "./scrub.js";
import { CliSnapshotError } from "./errors.js";

export async function executeCase(name: string, testCase: CliSnapshotCase, root: string, globalScrubbers: ScrubberConfig[] = [], defaultTimeoutMs = 5000): Promise<SnapshotRecord> {
  const cwd = path.resolve(root, testCase.cwd ?? ".");
  const timeoutMs = testCase.timeoutMs ?? defaultTimeoutMs;
  const args = testCase.args ?? [];
  const scrubbers = [...globalScrubbers, ...(testCase.scrubbers ?? [])];

  return await new Promise((resolve, reject) => {
    const child = spawn(testCase.command, args, {
      cwd,
      env: { ...process.env, ...(testCase.env ?? {}) },
      stdio: [testCase.stdin ? "pipe" : "ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new CliSnapshotError(`Case '${name}' timed out after ${timeoutMs}ms`, "CASE_TIMEOUT"));
    }, timeoutMs);
    child.stdout?.setEncoding("utf8");
    child.stderr?.setEncoding("utf8");
    child.stdout?.on("data", chunk => { stdout += chunk; });
    child.stderr?.on("data", chunk => { stderr += chunk; });
    child.on("error", error => {
      clearTimeout(timer);
      reject(new CliSnapshotError(`Could not start case '${name}': ${error.message}`, "CASE_SPAWN_FAILED"));
    });
    child.on("close", (exitCode, signal) => {
      clearTimeout(timer);
      resolve({
        case: name,
        command: testCase.command,
        args,
        exitCode,
        signal,
        stdout: scrubText(stdout, scrubbers),
        stderr: scrubText(stderr, scrubbers)
      });
    });
    if (testCase.stdin && child.stdin) child.stdin.end(testCase.stdin);
  });
}
