// Edit only an isolated temporary checkout. The public JSON, watched module,
// displayed source verifier and illustrated export must change together.
import assert from "node:assert/strict";
import { mkdir, readFile, realpath, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { chromium, firefox } from "playwright";

const [base, fixture, output] = process.argv.slice(2);
assert(
  base && fixture && output,
  "Usage: node scripts/vina-development.mjs BASE ISOLATED_CHECKOUT OUTPUT_DIR",
);
const root = await realpath(fixture),
  relative = path.relative(await realpath(tmpdir()), root);
assert(
  relative && !relative.startsWith("..") && !path.isAbsolute(relative),
  "Only edit an isolated temporary checkout",
);
assert(["127.0.0.1", "localhost"].includes(new URL(base).hostname));
const file = path.join(root, "public/sources/vina/manifest.json"),
  original = await readFile(file, "utf8"),
  originalData = JSON.parse(original),
  digest = originalData.pages.find((p) => p.id === "29").sha256;
assert.equal(original, await readFile("public/sources/vina/manifest.json", "utf8"));
await mkdir(output, { recursive: true });
async function poll(fn, message) {
  let last;
  const until = Date.now() + 30000;
  while (Date.now() < until) {
    try {
      if (await fn()) return;
    } catch (e) {
      last = e;
    }
    await new Promise((r) => setTimeout(r, 60));
  }
  throw Error(`${message}: ${last ?? "not observed"}`);
}
const rows = [];
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch(),
    context = await browser.newContext({
      acceptDownloads: true,
      viewport: { width: 375, height: 1000 },
    }),
    page = await context.newPage(),
    errors = [],
    publicImports = [],
    warnings = [];
  let moduleUrl = "";
  page.on("request", (r) => {
    if (r.url().includes("retained-source-json:vina.js")) moduleUrl = r.url();
    if (
      r.resourceType() === "script" &&
      (r.url().includes("/public/sources/") || r.url().includes("manifest.json"))
    )
      publicImports.push(r.url());
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "warning" && /public|source-json|import/.test(m.text()))
      warnings.push(m.text());
  });
  const snapshot = () =>
    page.evaluate(
      async ({ base, moduleUrl }) => ({
        raw: await (await fetch(`${base}sources/vina/manifest.json`, { cache: "no-store" })).json(),
        module: (await import(moduleUrl)).default,
      }),
      { base, moduleUrl },
    );
  try {
    await page.goto(`${base}vina.html`);
    await poll(
      () =>
        page
          .locator("#vn-source-status")
          .textContent()
          .then((t) => t.startsWith("Verified")),
      "Initial verified source",
    );
    assert(moduleUrl);
    let pair = await snapshot();
    assert.deepEqual(pair.raw, originalData);
    assert.deepEqual(pair.module, pair.raw);
    await writeFile(file, original.replace(digest, "0".repeat(64)));
    await poll(async () => {
      const pair = await snapshot();
      return (
        pair.module.pages.find((p) => p.id === "29").sha256 === "0".repeat(64) &&
        (await page.locator("#vn-source-status").textContent()).includes("do not match")
      );
    }, "Watched edit reaches real verifier");
    pair = await snapshot();
    assert.deepEqual(pair.module, pair.raw);
    assert(await page.locator("#vn-source-image").isHidden());
    let downloads = 0;
    page.on("download", () => downloads++);
    await page.locator("#vn-save-html").click();
    await poll(
      () =>
        page
          .locator("#vn-save-status")
          .textContent()
          .then((t) => t.includes("do not match")),
      "Edited manifest refuses illustrated export",
    );
    assert.equal(downloads, 0);
    await writeFile(file, original);
    await poll(async () => {
      const pair = await snapshot();
      return (
        pair.module.pages.find((p) => p.id === "29").sha256 === digest &&
        (await page.locator("#vn-source-status").textContent()).startsWith("Verified")
      );
    }, "Byte restoration recovers source");
    pair = await snapshot();
    assert.deepEqual(pair.module, originalData);
    assert.deepEqual(pair.module, pair.raw);
    const pending = page.waitForEvent("download");
    await page.locator("#vn-save-html").click();
    const d = await pending;
    assert.equal(await d.failure(), null);
    await d.saveAs(path.join(output, `${name}-development.html`));
    assert.deepEqual(errors, []);
    assert.deepEqual(publicImports, []);
    assert.deepEqual(warnings, []);
    rows.push({
      engine: name,
      version: browser.version(),
      virtualModuleEqualsPublicJson: true,
      sourceDigestEditRefusesImageAndExport: true,
      restorationRecoversActualNativeReading: true,
      directPublicImports: publicImports,
      sourceWarnings: warnings,
      pageErrors: errors,
    });
    console.log(`${name}: watched JSON edit, actual verifier and restored native reading pass`);
  } finally {
    await writeFile(file, original);
    await context.close();
    await browser.close();
  }
}
await writeFile(
  path.join(output, "development.json"),
  `${JSON.stringify({ base, fixture: root, scope: "Native Vite development; controlled digest change, original bytes restored", configurations: rows }, null, 2)}\n`,
);
