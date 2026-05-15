#!/usr/bin/env node
import { initProject, inspectConfig, listCases, runSnapshots, scrubText } from "./index.js";
import { CliSnapshotError } from "./errors.js";

const VERSION = "0.1.0";

function help(): string {
  return `clisnapshot ${VERSION}

Stable snapshots for terminal output without the confetti drift.

Usage:
  clisnapshot init [dir]
  clisnapshot run [--update] [--case <name>] [--config <path>]
  clisnapshot list [--config <path>]
  clisnapshot inspect [--config <path>]
  clisnapshot scrub [text]

Commands:
  init      Create a starter config, fixture CLI, and snapshot directory
  run       Execute configured cases and compare/update snapshots
  list      Print configured case names
  inspect   Print resolved config metadata as JSON
  scrub     Normalize ANSI, paths, timestamps, UUIDs, and durations from text

Options:
  -u, --update      Rewrite snapshots intentionally
  -c, --case NAME   Run one named case
  --config PATH     Use a non-default clisnapshot.config.json
  -h, --help        Show help
  -v, --version     Show version
`;
}

function parseFlag(args: string[], names: string[]): string | undefined {
  for (let i = 0; i < args.length; i += 1) {
    if (names.includes(args[i])) return args[i + 1];
  }
  return undefined;
}

async function main(argv = process.argv.slice(2)): Promise<number> {
  const command = argv[0];
  if (!command || command === "--help" || command === "-h") {
    console.log(help());
    return 0;
  }
  if (command === "--version" || command === "-v") {
    console.log(VERSION);
    return 0;
  }
  if (command === "init") {
    const written = await initProject(argv[1] ?? ".");
    console.log(written.length ? `Created ${written.length} file(s):\n${written.join("\n")}` : "Nothing to create; clisnapshot files already exist.");
    return 0;
  }
  if (command === "run") {
    const summary = await runSnapshots({
      update: argv.includes("--update") || argv.includes("-u"),
      caseName: parseFlag(argv, ["--case", "-c"]),
      configPath: parseFlag(argv, ["--config"])
    });
    for (const result of summary.results) {
      console.log(`${symbol(result.status)} ${result.name} (${result.status})`);
      if (result.diff) console.log(result.diff);
    }
    console.log(`Summary: ${summary.passed} passed, ${summary.failed} failed, ${summary.updated} updated`);
    return summary.failed ? 1 : 0;
  }
  if (command === "list") {
    const cases = await listCases(parseFlag(argv, ["--config"]));
    console.log(cases.join("\n"));
    return 0;
  }
  if (command === "inspect") {
    console.log(JSON.stringify(await inspectConfig(parseFlag(argv, ["--config"])), null, 2));
    return 0;
  }
  if (command === "scrub") {
    const text = argv.slice(1).join(" ") || await readStdin();
    process.stdout.write(scrubText(text));
    return 0;
  }
  throw new CliSnapshotError(`Unknown command '${command}'. Run clisnapshot --help.`, "UNKNOWN_COMMAND");
}

function symbol(status: string): string {
  return status === "passed" ? "✓" : status === "updated" ? "↻" : "✗";
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

main().then(code => { process.exitCode = code; }).catch(error => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`clisnapshot: ${message}`);
  process.exitCode = error instanceof CliSnapshotError ? 2 : 1;
});
