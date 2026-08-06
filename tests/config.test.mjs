import test from "node:test";
import assert from "node:assert/strict";
import { validateConfig, defaultConfig } from "../dist/index.js";

test("default config is valid", () => {
  assert.doesNotThrow(() => validateConfig(defaultConfig()));
});

test("validation fails without cases", () => {
  assert.throws(() => validateConfig({}), /cases object/);
});

function assertConfigInvalid(config, message) {
  assert.throws(
    () => validateConfig(config),
    error => error.code === "CONFIG_INVALID" && message.test(error.message)
  );
}

test("validation rejects invalid timeout values", () => {
  for (const value of ["5000", 0, -1, Infinity, NaN]) {
    assertConfigInvalid({ defaultTimeoutMs: value, cases: {} }, /defaultTimeoutMs must be a finite positive number/);
    assertConfigInvalid({ cases: { example: { command: "node", timeoutMs: value } } }, /timeoutMs must be a finite positive number/);
  }
});

test("validation rejects non-string args and env values", () => {
  assertConfigInvalid({ cases: { example: { command: "node", args: [42] } } }, /args must be an array of strings/);
  assertConfigInvalid({ cases: { example: { command: "node", env: { PORT: 3000 } } } }, /env must be an object with string values/);
});

test("validation rejects malformed global and case scrubbers", () => {
  assertConfigInvalid({ scrubbers: [{ pattern: 42, replacement: "x" }], cases: {} }, /pattern must be a string/);
  assertConfigInvalid({ cases: { example: { command: "node", scrubbers: [{ pattern: "x", replacement: false }] } } }, /replacement must be a string/);
  assertConfigInvalid({ cases: { example: { command: "node", scrubbers: [{ pattern: "x", replacement: "y", flags: 1 }] } } }, /flags must be a string/);
});

test("validation rejects duplicate explicit snapshot destinations", () => {
  assertConfigInvalid({ cases: {
    first: { command: "node", snapshot: "nested/../same.snap" },
    second: { command: "node", snapshot: "same.snap" }
  } }, /Cases 'first' and 'second' resolve to the same snapshot path/);
});

test("validation rejects duplicate slug-derived snapshot destinations", () => {
  assertConfigInvalid({ cases: {
    "hello world": { command: "node" },
    "hello-world": { command: "node" }
  } }, /Cases 'hello world' and 'hello-world' resolve to the same snapshot path/);
});
