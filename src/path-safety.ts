import path from "node:path";
import { CliSnapshotError } from "./errors.js";

export function safeJoin(root: string, candidate: string): string {
  if (!candidate || candidate.includes("\0")) {
    throw new CliSnapshotError("Refusing an empty or binary-looking path", "UNSAFE_PATH");
  }
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, candidate);
  const relative = path.relative(resolvedRoot, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new CliSnapshotError(`Refusing to write outside ${resolvedRoot}: ${candidate}`, "UNSAFE_PATH");
  }
  return resolved;
}

export function slugifyCaseName(name: string): string {
  const slug = name.trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  if (!slug) throw new CliSnapshotError(`Invalid case name: ${name}`, "INVALID_CASE");
  return slug;
}
