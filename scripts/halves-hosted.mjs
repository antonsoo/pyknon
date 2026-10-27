import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.argv[2],
  out = process.argv[3];
assert(
  base && /^https:\/\/.+\/$/.test(base) && out,
  "Supply HTTPS base with trailing slash and output JSON.",
);
const files = [];
async function visit(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) await visit(f);
    else if (e.isFile()) files.push(f);
  }
}
await visit("dist");
files.sort();
const sha = (b) => createHash("sha256").update(b).digest("hex"),
  results = [];
for (let i = 0; i < files.length; i += 4)
  results.push(
    ...(await Promise.all(
      files.slice(i, i + 4).map(async (file) => {
        const name = path.relative("dist", file).split(path.sep).join("/"),
          expected = await readFile(file),
          response = await fetch(new URL(name, base), {
            cache: "no-store",
            signal: AbortSignal.timeout(30000),
          });
        assert.equal(response.status, 200, name);
        const actual = Buffer.from(await response.arrayBuffer());
        assert.equal(sha(actual), sha(expected), name);
        return { file: name, bytes: actual.length, sha256: sha(actual) };
      }),
    )),
  );
await writeFile(
  out,
  `${JSON.stringify({ checkedAt: new Date().toISOString(), base, scope: "Every canonical current build file, including worker, compared byte for byte; older retained assets outside this build are not counted", files: results }, null, 2)}\n`,
);
console.log(`${results.length} hosted files match reviewed bytes.`);
