import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { spawnSync } from "node:child_process";
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

test("README does not claim registry availability before the first publication", async () => {
  const readme = await fs.readFile("README.md", "utf8");

  assert.match(
    readme,
    /Until\s+`npm view clisnapshot version` succeeds/,
    "pre-publication guidance must name the registry check"
  );
  assert.match(readme, /npm pack --pack-destination/);
  assert.match(readme, /npm install --save-dev \/absolute\/path\/to\/clisnapshot-0\.1\.0\.tgz/);
  assert.match(
    readme,
    /Once `npm view clisnapshot version` succeeds[\s\S]*npm install --save-dev clisnapshot/
  );
  assert.match(
    readme,
    /Once the package is published[\s\S]*npx clisnapshot init[\s\S]*npx clisnapshot run --update[\s\S]*npx clisnapshot run/
  );
  assert.doesNotMatch(
    readme,
    /The supported end-user distribution is the public `clisnapshot` package on\s+npm\./
  );
});

test("release workflow verifies the tag before packing or publishing", async () => {
  const { workflow } = await readReleaseWorkflow();
  const steps = workflow.jobs.release.steps;
  const guardIndex = steps.findIndex(
    (step) => step.name === "Verify release tag matches package version"
  );
  const packIndex = steps.findIndex((step) => step.name === "Pack release artifact");
  const publishIndex = steps.findIndex((step) => step.name === "Publish package to npm");

  assert.notEqual(guardIndex, -1, "release workflow must verify its tag");
  assert.equal(steps[guardIndex].run, "node scripts/verify-release-tag.mjs");
  assert.ok(guardIndex < packIndex, "tag guard must run before npm pack");
  assert.ok(guardIndex < publishIndex, "tag guard must run before npm publish");
});

test("release tag guard accepts only v plus the package version", async () => {
  const packageJson = JSON.parse(await fs.readFile("package.json", "utf8"));
  const runGuard = (tag) =>
    spawnSync(process.execPath, ["scripts/verify-release-tag.mjs"], {
      encoding: "utf8",
      env: { ...process.env, GITHUB_REF_NAME: tag }
    });

  const matching = runGuard(`v${packageJson.version}`);
  assert.equal(matching.status, 0, matching.stderr);
  assert.match(matching.stdout, /release tag verified/);

  const mismatching = runGuard(`v${packageJson.version}-wrong`);
  assert.notEqual(mismatching.status, 0);
  assert.match(mismatching.stderr, /release tag mismatch/);
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
