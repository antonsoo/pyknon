import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, firefox } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4357/pyknon/",
  out = process.argv[3] ?? "/tmp/pyknon-halves-integrity";
await mkdir(out, { recursive: true });
const records = [];
async function wait(p, selector, text) {
  await p.locator(selector).filter({ hasText: text }).waitFor();
}
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const b = await engine.launch();
  try {
    // A late, valid earlier image cannot replace the user's newer page selection.
    const c = await b.newContext({ serviceWorkers: "block" }),
      p = await c.newPage();
    let release;
    await p.route("**/sources/halves/menge-162.jpg", async (route) => {
      await new Promise((r) => {
        release = r;
      });
      await route.continue();
    });
    await p.goto(`${base}halves.html`);
    await p.waitForFunction(() =>
      document.querySelector("#hf-result")?.textContent.includes("17/16"),
    );
    while (!release) await p.waitForTimeout(25);
    await p.locator("#hf-page").selectOption("221");
    await wait(p, "#hf-source-status", /Verified/);
    release();
    await p.waitForTimeout(250);
    assert.match(await p.locator("#hf-source-image").getAttribute("alt"), /PDF p.221/);
    await c.close();
    const d = await b.newContext({ serviceWorkers: "block" }),
      q = await d.newPage();
    let wrong = true;
    const substitute = await readFile("public/sources/halves/menge-163.jpg");
    await q.route("**/sources/halves/menge-162.jpg", (r) =>
      wrong
        ? r.fulfill({ status: 200, contentType: "image/jpeg", body: substitute })
        : r.continue(),
    );
    await q.goto(`${base}halves.html`);
    await wait(q, "#hf-source-status", /do not match/);
    assert(await q.locator("#hf-enlarge").isDisabled());
    await q.locator('[data-hf-save="html"]').click();
    await wait(q, "#hf-save-status", /Save failed/);
    wrong = false;
    await q.locator("#hf-retry").click();
    await wait(q, "#hf-source-status", /Verified/);
    const [recovered] = await Promise.all([
      q.waitForEvent("download"),
      q.locator('[data-hf-save="html"]').click(),
    ]);
    await recovered.saveAs(path.join(out, `${name}-recovered.html`));
    await d.close();
    const e = await b.newContext({ serviceWorkers: "block" }),
      r = await e.newPage();
    let saveRelease;
    await r.route("**/sources/halves/menge-176.jpg", async (route) => {
      await new Promise((done) => {
        saveRelease = done;
      });
      await route.continue();
    });
    await r.goto(`${base}halves.html`);
    await wait(r, "#hf-source-status", /Verified/);
    const download = r.waitForEvent("download");
    await r.locator('[data-hf-save="html"]').click();
    while (!saveRelease) await r.waitForTimeout(25);
    await r.locator("#hf-control").click();
    assert.match(await r.locator("#hf-result").textContent(), /ratios are equal/);
    saveRelease();
    const saved = await download;
    const file = path.join(out, `${name}-snapshot.html`);
    await saved.saveAs(file);
    const html = await readFile(file, "utf8");
    assert.match(html, /M = 17, between 16 and 18/);
    assert.match(await r.locator("#hf-save-status").textContent(), /M = 17, ratio 9:8/);
    // Delay the actual File.text call, then change the lesson before it resolves.
    await r.addInitScript(() => {});
    await r.evaluate(() => {
      const text = File.prototype.text;
      File.prototype.text = function () {
        return new Promise((resolve, reject) => {
          window.__openFile = () => text.call(this).then(resolve, reject);
        });
      };
    });
    const imported = {
      format: "pyknon-halves",
      version: 1,
      scope: "numerical-mean-and-modern-sound",
      state: {
        interval: "tone",
        n: 8,
        scale: 2,
        middle: 17,
        method: "integer",
        reference: 220,
        sound: "halves",
        reading: 0,
        page: 220,
      },
    };
    await r.locator("#hf-import").setInputFiles({
      name: "record.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(imported)),
    });
    await r.waitForFunction(() => !!window.__openFile);
    await r.locator('[data-hf-method="length"]').click();
    await r.evaluate(() => window.__openFile());
    await wait(r, "#hf-save-status", /Settings changed/);
    assert.equal(await r.locator('[data-hf-method="length"]').getAttribute("aria-pressed"), "true");
    await e.close();
    records.push({
      engine: name,
      lateSourceIgnored: true,
      wrongHttp200ImageRejected: true,
      exportRefusedWrongBytes: true,
      recovery: true,
      saveRetainedCapturedSettings: true,
      lateFileDidNotReplaceNewSettings: true,
    });
    console.log(`${name} source/export/import faults passed`);
  } finally {
    await b.close();
  }
}
await writeFile(path.join(out, "review.json"), `${JSON.stringify({ base, records }, null, 2)}\n`);
