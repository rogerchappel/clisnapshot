import { spawn } from "node:child_process";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import type { CliSnapshotCase, ScrubberConfig, SnapshotRecord } from "./types.js";
import { scrubText } from "./scrub.js";
import { CliSnapshotError } from "./errors.js";

const TERMINATION_GRACE_MS = 250;

async function terminateProcessTree(child: ReturnType<typeof spawn>): Promise<void> {
  if (child.pid === undefined) return;

  if (process.platform === "win32") {
    await new Promise<void>(resolve => {
      const killer = spawn("taskkill", ["/pid", String(child.pid), "/t"], { stdio: "ignore" });
      killer.once("error", () => resolve());
      killer.once("close", () => resolve());
    });
    await delay(TERMINATION_GRACE_MS);
    await new Promise<void>(resolve => {
      const killer = spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore" });
      killer.once("error", () => resolve());
      killer.once("close", () => resolve());
    });
    return;
  }

  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    return;
  }
  await delay(TERMINATION_GRACE_MS);
  try {
    process.kill(-child.pid, 0);
    process.kill(-child.pid, "SIGKILL");
  } catch {
    // The process group exited during the grace period.
  }
}

export async function executeCase(name: string, testCase: CliSnapshotCase, root: string, globalScrubbers: ScrubberConfig[] = [], defaultTimeoutMs = 5000): Promise<SnapshotRecord> {
  const cwd = path.resolve(root, testCase.cwd ?? ".");
  const timeoutMs = testCase.timeoutMs ?? defaultTimeoutMs;
  const args = testCase.args ?? [];
  const scrubbers = [...globalScrubbers, ...(testCase.scrubbers ?? [])];

  return await new Promise((resolve, reject) => {
    const child = spawn(testCase.command, args, {
      cwd,
      env: { ...process.env, ...(testCase.env ?? {}) },
      detached: process.platform !== "win32",
      stdio: [testCase.stdin ? "pipe" : "ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    let settled = false;
    let cleanup: Promise<void> | undefined;
    const timer = setTimeout(() => {
      timedOut = true;
      cleanup = terminateProcessTree(child);
    }, timeoutMs);
    child.stdout?.setEncoding("utf8");
    child.stderr?.setEncoding("utf8");
    child.stdout?.on("data", chunk => { stdout += chunk; });
    child.stderr?.on("data", chunk => { stderr += chunk; });
    child.on("error", error => {
      clearTimeout(timer);
      if (!settled && !timedOut) {
        settled = true;
        reject(new CliSnapshotError(`Could not start case '${name}': ${error.message}`, "CASE_SPAWN_FAILED"));
      }
    });
    child.on("close", async (exitCode, signal) => {
      clearTimeout(timer);
      if (settled) return;
      settled = true;
      if (timedOut) {
        await cleanup;
        reject(new CliSnapshotError(`Case '${name}' timed out after ${timeoutMs}ms`, "CASE_TIMEOUT"));
        return;
      }
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
