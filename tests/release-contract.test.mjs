import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

test("documented npm installation is backed by the release workflow", async () => {
  const [readme, packageJson, releaseWorkflow] = await Promise.all([
    fs.readFile("README.md", "utf8"),
    fs.readFile("package.json", "utf8").then(JSON.parse),
    fs.readFile(".github/workflows/release.yml", "utf8")
  ]);

  assert.match(readme, /npm install --save-dev clisnapshot/);
  assert.equal(packageJson.name, "clisnapshot");
  assert.equal(packageJson.publishConfig?.access, "public");
  assert.match(releaseWorkflow, /id-token: write/);
  assert.match(
    releaseWorkflow,
    /npm publish "\$\{PACKAGE_TARBALL\}" --provenance --access public/,
    "the tag workflow must publish the same packed tarball with npm provenance"
  );
});

test("CI and release dry runs exercise a disposable tarball install", async () => {
  const [packageJson, ciWorkflow, dryRunWorkflow] = await Promise.all([
    fs.readFile("package.json", "utf8").then(JSON.parse),
    fs.readFile(".github/workflows/ci.yml", "utf8"),
    fs.readFile(".github/workflows/release-dry-run.yml", "utf8")
  ]);

  assert.equal(packageJson.scripts["package:smoke"], "bash scripts/package-smoke.sh");
  assert.match(ciWorkflow, /npm run package:smoke/);
  assert.match(dryRunWorkflow, /npm run package:smoke/);
});
