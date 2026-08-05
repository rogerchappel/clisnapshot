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

test("CLI rejects unknown command options with usage guidance", () => {
  const result = spawnSync("node", [...cli, "run", "--updte"], { encoding: "utf8" });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Unknown option '--updte'/);
  assert.match(result.stderr, /Usage: clisnapshot run/);
});

test("CLI rejects missing option values", () => {
  for (const args of [["run", "--case"], ["run", "-c"], ["run", "--config"], ["list", "--config"], ["inspect", "--config"]]) {
    const result = spawnSync("node", [...cli, ...args], { encoding: "utf8" });
    assert.equal(result.status, 2, args.join(" "));
    assert.match(result.stderr, /requires a value/);
    assert.match(result.stderr, new RegExp(`Usage: clisnapshot ${args[0]}`));
  }
});

test("CLI rejects values attached to boolean flags", () => {
  for (const flag of ["--update=true", "-u=true"]) {
    const result = spawnSync("node", [...cli, "run", flag], { encoding: "utf8" });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /Unknown option/);
  }
});

test("CLI rejects extra positionals", () => {
  for (const args of [["init", "one", "two"], ["run", "extra"], ["list", "extra"], ["inspect", "extra"]]) {
    const result = spawnSync("node", [...cli, ...args], { encoding: "utf8" });
    assert.equal(result.status, 2, args.join(" "));
    assert.match(result.stderr, /Unexpected argument/);
  }
});

test("CLI accepts documented short run flags", () => {
  const result = spawnSync("node", [...cli, "run", "-u", "-c", "help-output"], { encoding: "utf8" });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /help-output \(updated\)/);
});

test("CLI scrub retains argument and stdin forms", () => {
  const argument = spawnSync("node", [...cli, "scrub", "took", "42ms"], { encoding: "utf8" });
  assert.equal(argument.status, 0);
  assert.equal(argument.stdout, "took <DURATION>\n");

  const stdin = spawnSync("node", [...cli, "scrub"], { encoding: "utf8", input: "took 42ms" });
  assert.equal(stdin.status, 0);
  assert.equal(stdin.stdout, "took <DURATION>\n");
});
