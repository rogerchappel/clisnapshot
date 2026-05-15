import test from "node:test";
import assert from "node:assert/strict";
import { unifiedDiff } from "../dist/index.js";

test("unifiedDiff returns empty string for equal text", () => {
  assert.equal(unifiedDiff("same\n", "same\n"), "");
});

test("unifiedDiff highlights changed lines", () => {
  const diff = unifiedDiff("a\nb\n", "a\nc\n", "demo.snap");
  assert.match(diff, /--- demo\.snap/);
  assert.match(diff, /-b/);
  assert.match(diff, /\+c/);
});
