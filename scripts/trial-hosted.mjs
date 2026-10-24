import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [outName, previousDist] = process.argv.slice(2);
assert(outName && previousDist, "Supply evidence directory and previous three-room dist");
const out = path.resolve(outName),
  base = "https://antonsoo.github.io/pyknon/";
await mkdir(out, { recursive: true });
const expected = JSON.parse(await readFile("docs/trial-browser.json", "utf8"));
const digest = (b) => createHash("sha256").update(b).digest("hex");
async function verify(file, sha256) {
  const response = await fetch(base + file, { cache: "no-store" });
  assert.equal(response.status, 200, file);
  assert.equal(digest(Buffer.from(await response.arrayBuffer())), sha256, file);
  return { file, sha256 };
}
const root = expected.build.find((f) => f.file === "index.html");
await verify(root.file, root.sha256);
const report = {
  checkedAt: new Date().toISOString(),
  base,
  method: "Canonical URLs without query strings; root checked before and after the file inventory",
  files: [],
};
for (let i = 0; i < expected.build.length; i += 5)
  report.files.push(
    ...(await Promise.all(expected.build.slice(i, i + 5).map((f) => verify(f.file, f.sha256)))),
  );
await verify(root.file, root.sha256);
report.preservedEarlierAssets = [];
for (const file of (await readdir(path.join(previousDist, "assets"))).sort()) {
  const rel = `assets/${file}`;
  report.preservedEarlierAssets.push(
    await verify(rel, digest(await readFile(path.join(previousDist, rel)))),
  );
}
await writeFile(path.join(out, "files.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(
  `${report.files.length} canonical files match; ${report.preservedEarlierAssets.length} earlier assets preserved`,
);
const result = spawnSync(
  process.execPath,
  ["scripts/trial-browser.mjs", path.join(out, "browser"), base],
  { stdio: "inherit" },
);
assert.equal(result.status, 0, "Public browser review failed");
