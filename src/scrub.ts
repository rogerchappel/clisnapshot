import os from "node:os";
import path from "node:path";
import type { ScrubberConfig } from "./types.js";

const ANSI_PATTERN = /[\u001b\u009b][[\]()#;?]*(?:(?:(?:[a-zA-Z\d]*(?:;[a-zA-Z\d]*)*)?\u0007)|(?:(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g;
const UUID_PATTERN = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi;
const ISO_DATE_PATTERN = /\b\d{4}-\d{2}-\d{2}(?:[ T]\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:?\d{2})?)?\b/g;
const DURATION_PATTERN = /\b\d+(?:\.\d+)?\s?(?:ms|s|sec|secs|seconds|m|minutes)\b/gi;
const TEMP_PATH_PATTERN = /(?:\/private)?\/tmp\/[\w./-]+|[A-Z]:\\Users\\[^\\\s]+\\AppData\\Local\\Temp\\[^\s]+/g;

export function scrubText(input: string, customScrubbers: ScrubberConfig[] = []): string {
  let output = input.replace(/\r\n/g, "\n").replace(ANSI_PATTERN, "");
  output = output.replaceAll(os.homedir(), "<HOME>");
  output = output.replaceAll(path.resolve("."), "<CWD>");
  output = output.replace(TEMP_PATH_PATTERN, "<TMP>");
  output = output.replace(UUID_PATTERN, "<UUID>");
  output = output.replace(ISO_DATE_PATTERN, "<DATE>");
  output = output.replace(DURATION_PATTERN, "<DURATION>");
  for (const scrubber of customScrubbers) {
    output = output.replace(new RegExp(scrubber.pattern, scrubber.flags ?? "g"), scrubber.replacement);
  }
  return output.replace(/[ \t]+$/gm, "").trimEnd() + (output.length > 0 ? "\n" : "");
}
