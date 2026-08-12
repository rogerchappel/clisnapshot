import fs from "node:fs/promises";

const packageJson = JSON.parse(await fs.readFile("package.json", "utf8"));
const expectedTag = `v${packageJson.version}`;
const actualTag = process.env.GITHUB_REF_NAME;

if (actualTag !== expectedTag) {
  console.error(
    `release tag mismatch: expected ${expectedTag} from package.json, received ${actualTag ?? "<unset>"}`
  );
  process.exitCode = 1;
} else {
  console.log(`release tag verified: ${actualTag}`);
}
