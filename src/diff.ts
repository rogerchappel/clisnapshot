export function unifiedDiff(expected: string, actual: string, label = "snapshot"): string {
  if (expected === actual) return "";
  const a = expected.split("\n");
  const b = actual.split("\n");
  const lines = [`--- ${label}`, `+++ actual`];
  const max = Math.max(a.length, b.length);
  for (let i = 0; i < max; i += 1) {
    if (a[i] === b[i]) {
      if (a[i] !== undefined) lines.push(` ${a[i]}`);
      continue;
    }
    if (a[i] !== undefined) lines.push(`-${a[i]}`);
    if (b[i] !== undefined) lines.push(`+${b[i]}`);
  }
  return lines.join("\n");
}
