#!/usr/bin/env node
const [, , command = "help"] = process.argv;
if (command === "--help" || command === "help") {
  console.log("\u001b[36mexample-cli\u001b[0m <command>");
  console.log("Commands: greet, noisy, fail");
} else if (command === "greet") {
  console.log("hello from fixture");
} else if (command === "noisy") {
  console.log(`run id 123e4567-e89b-12d3-a456-426614174000 at 2026-05-16T06:00:00Z in ${process.cwd()} took 42ms`);
} else if (command === "fail") {
  console.error("fixture failed clearly");
  process.exit(7);
} else {
  console.error(`unknown command: ${command}`);
  process.exit(2);
}
