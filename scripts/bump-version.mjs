import { readFile, rename, writeFile } from "node:fs/promises";

const packageUrl = new URL("../packages/column-flow/package.json", import.meta.url);
const bump = process.argv.slice(2).find((arg) => arg !== "--");

if (!bump) {
  console.error("Usage: node scripts/bump-version.mjs <major|minor|patch|x.y.z>");
  process.exit(1);
}

const packageJson = JSON.parse(await readFile(packageUrl, "utf8"));
const nextVersion = getNextVersion(packageJson.version, bump);

packageJson.version = nextVersion;
const tempUrl = new URL(`./package.json.${process.pid}.tmp`, packageUrl);

await writeFile(tempUrl, `${JSON.stringify(packageJson, null, 2)}\n`);
await rename(tempUrl, packageUrl);

console.log(`${packageJson.name}@${nextVersion}`);

function getNextVersion(currentVersion, bumpType) {
  if (/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(bumpType)) {
    return bumpType;
  }

  const match = currentVersion.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    throw new Error(`Cannot bump unsupported current version: ${currentVersion}`);
  }

  const [, major, minor, patch] = match.map(Number);

  switch (bumpType) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    default:
      throw new Error(`Unsupported bump type: ${bumpType}`);
  }
}
