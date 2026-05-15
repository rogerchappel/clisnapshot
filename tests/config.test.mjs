import test from "node:test";
import assert from "node:assert/strict";
import { validateConfig, defaultConfig } from "../dist/index.js";

test("default config is valid", () => {
  assert.doesNotThrow(() => validateConfig(defaultConfig()));
});

test("validation fails without cases", () => {
  assert.throws(() => validateConfig({}), /cases object/);
});
