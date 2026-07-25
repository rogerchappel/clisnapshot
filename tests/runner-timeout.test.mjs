import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { executeCase } from "../dist/index.js";

const parentSource = `
  const { spawn } = require("node:child_process");
  spawn(process.execPath, ["-e", ${JSON.stringify(`
    const fs = require("node:fs");
    process.on("SIGTERM", () => {});
    setTimeout(() => fs.writeFileSync(process.env.MARKER, "survived"), 600);
    setTimeout(() => {}, 2_000);
  `)}], { env: process.env });
  process.on("SIGTERM", () => {});
  setTimeout(() => {}, 2_000);
`;

test("a timeout cleans up stubborn descendants before rejecting", async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "clisnapshot-timeout-"));
  const marker = path.join(dir, "descendant-finished");

  await assert.rejects(
    executeCase("timeout-tree", {
      command: process.execPath,
      args: ["-e", parentSource],
      env: { MARKER: marker },
      timeoutMs: 100
    }, dir),
    error => error?.code === "CASE_TIMEOUT"
      && error.message === "Case 'timeout-tree' timed out after 100ms"
  );

  await new Promise(resolve => setTimeout(resolve, 700));
  await assert.rejects(fs.access(marker), error => error?.code === "ENOENT");
});
