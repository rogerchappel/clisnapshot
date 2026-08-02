import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";
import { parseDocument } from "yaml";

async function readReleaseWorkflow() {
  const source = await fs.readFile(".github/workflows/release.yml", "utf8");
  const document = parseDocument(source, { uniqueKeys: true });

  assert.deepEqual(
    document.errors,
    [],
    `release workflow must be valid YAML:\n${document.errors.join("\n")}`
  );

  return { source, workflow: document.toJS() };
}

test("release workflow is valid YAML and passes both release variables", async () => {
  const { workflow } = await readReleaseWorkflow();
  const createRelease = workflow.jobs.release.steps.find(
    (step) => step.name === "Create GitHub release"
  );

  assert.ok(createRelease, "release workflow must create a GitHub release");
  assert.deepEqual(createRelease.env, {
    GH_TOKEN: "${{ github.token }}",
    PACKAGE_TARBALL: "${{ steps.package.outputs.tarball }}"
  });
  assert.match(createRelease.run, /gh release create/);
  assert.match(createRelease.run, /"\$\{PACKAGE_TARBALL\}"/);
});

test("documented npm installation is backed by the release workflow", async () => {
  const [readme, packageJson, releaseWorkflow] = await Promise.all([
    fs.readFile("README.md", "utf8"),
    fs.readFile("package.json", "utf8").then(JSON.parse),
    readReleaseWorkflow().then(({ source }) => source)
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
