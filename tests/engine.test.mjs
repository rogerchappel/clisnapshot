import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { runSnapshots } from "../dist/index.js";

async function fixtureProject() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "clisnapshot-test-"));
  await fs.mkdir(path.join(dir, "fixtures", "bin"), { recursive: true });
  await fs.writeFile(path.join(dir, "fixtures", "bin", "cli.mjs"), "console.log('hello fixture')\n");
  await fs.writeFile(path.join(dir, "clisnapshot.config.json"), JSON.stringify({ snapshotDir: "snaps", cases: { hello: { command: "node", args: ["fixtures/bin/cli.mjs"] } } }, null, 2));
  return dir;
}

test("runSnapshots updates then passes a fixture-backed case", async () => {
  const dir = await fixtureProject();
  const configPath = path.join(dir, "clisnapshot.config.json");
  const updated = await runSnapshots({ configPath, update: true });
  assert.equal(updated.updated, 1);
  const checked = await runSnapshots({ configPath });
  assert.equal(checked.passed, 1);
  assert.equal(checked.failed, 0);
});

test("runSnapshots reports missing snapshots as validation failure", async () => {
  const dir = await fixtureProject();
  const summary = await runSnapshots({ configPath: path.join(dir, "clisnapshot.config.json") });
  assert.equal(summary.failed, 1);
  assert.match(summary.results[0].diff, /Missing snapshot/);
});
