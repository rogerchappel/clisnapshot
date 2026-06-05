#!/usr/bin/env node

const command = process.argv[2] ?? "report";

if (command === "--help" || command === "help") {
  console.log("Usage: noisy-cli report");
  console.log("Prints a tiny report with intentionally noisy fields.");
  process.exit(0);
}

if (command !== "report") {
  console.error(`Unknown command: ${command}`);
  process.exit(2);
}

console.log("Noisy CLI report");
console.log("run_id=1f8f5f7e-9a1b-4f6a-a5af-3f9a0b9a2c01");
console.log("generated_at=2026-06-05T03:15:00Z");
console.log("duration=42ms");
console.log(`home_path=${process.env.HOME}/demo-workspace`);
