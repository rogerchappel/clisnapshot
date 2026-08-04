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

type ParsedOptions = { update?: boolean; caseName?: string; configPath?: string; positionals: string[] };

const commandUsage: Record<string, string> = {
  init: "clisnapshot init [dir]",
  run: "clisnapshot run [--update] [--case <name>] [--config <path>]",
  list: "clisnapshot list [--config <path>]",
  inspect: "clisnapshot inspect [--config <path>]",
  scrub: "clisnapshot scrub [text]"
};

function usageError(command: string, message: string): never {
  throw new CliSnapshotError(`${message}\nUsage: ${commandUsage[command]}`, "INVALID_ARGUMENTS");
}

function parseCommand(command: string, args: string[]): ParsedOptions {
  const parsed: ParsedOptions = { positionals: [] };
  const valueFlags = command === "run"
    ? new Map([["--case", "caseName"], ["-c", "caseName"], ["--config", "configPath"]] as const)
    : command === "list" || command === "inspect"
      ? new Map([["--config", "configPath"]] as const)
      : new Map<string, "caseName" | "configPath">();

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const key = valueFlags.get(arg);
    if (key) {
      const value = args[i + 1];
      if (!value || value.startsWith("-")) usageError(command, `Option '${arg}' requires a value.`);
      if (parsed[key] !== undefined) usageError(command, `Option '${arg}' may only be specified once.`);
      parsed[key] = value;
      i += 1;
      continue;
    }
    if (command === "run" && (arg === "--update" || arg === "-u")) {
      if (parsed.update) usageError(command, `Option '${arg}' may only be specified once.`);
      parsed.update = true;
      continue;
    }
    if (arg.startsWith("-")) usageError(command, `Unknown option '${arg}'.`);
    parsed.positionals.push(arg);
  }

  const maxPositionals = command === "init" ? 1 : command === "scrub" ? Infinity : 0;
  if (parsed.positionals.length > maxPositionals) {
    usageError(command, `Unexpected argument '${parsed.positionals[maxPositionals]}'.`);
  }
  return parsed;
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
    const options = parseCommand(command, argv.slice(1));
    const written = await initProject(options.positionals[0] ?? ".");
    console.log(written.length ? `Created ${written.length} file(s):\n${written.join("\n")}` : "Nothing to create; clisnapshot files already exist.");
    return 0;
  }
  if (command === "run") {
    const options = parseCommand(command, argv.slice(1));
    const summary = await runSnapshots({
      update: options.update,
      caseName: options.caseName,
      configPath: options.configPath
    });
    for (const result of summary.results) {
      console.log(`${symbol(result.status)} ${result.name} (${result.status})`);
      if (result.diff) console.log(result.diff);
    }
    console.log(`Summary: ${summary.passed} passed, ${summary.failed} failed, ${summary.updated} updated`);
    return summary.failed ? 1 : 0;
  }
  if (command === "list") {
    const options = parseCommand(command, argv.slice(1));
    const cases = await listCases(options.configPath);
    console.log(cases.join("\n"));
    return 0;
  }
  if (command === "inspect") {
    const options = parseCommand(command, argv.slice(1));
    console.log(JSON.stringify(await inspectConfig(options.configPath), null, 2));
    return 0;
  }
  if (command === "scrub") {
    const options = parseCommand(command, argv.slice(1));
    const text = options.positionals.join(" ") || await readStdin();
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
