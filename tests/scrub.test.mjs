import test from "node:test";
import assert from "node:assert/strict";
import { scrubText } from "../dist/index.js";

test("scrubText removes ANSI and normalizes dynamic tokens", () => {
  const actual = scrubText("\u001b[31mred\u001b[0m 123e4567-e89b-12d3-a456-426614174000 at 2026-05-16T06:00:00Z took 42ms");
  assert.equal(actual, "red <UUID> at <DATE> took <DURATION>\n");
});

test("scrubText applies custom regex scrubbers", () => {
  assert.equal(scrubText("token abc123", [{ pattern: "abc\\d+", replacement: "<TOKEN>" }]), "token <TOKEN>\n");
});
