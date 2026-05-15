import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

const cli = ["dist/cli.js"];

test("CLI prints help", () => {
  const result = spawnSync("node", [...cli, "--help"], { encoding: "utf8" });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /clisnapshot/);
  assert.match(result.stdout, /run/);
});

test("CLI rejects unknown command", () => {
  const result = spawnSync("node", [...cli, "wat"], { encoding: "utf8" });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Unknown command/);
});
