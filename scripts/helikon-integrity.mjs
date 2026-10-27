import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, firefox } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4362/pyknon/",
  out = process.argv[3] ?? "/tmp/claude-1000/helikon-integrity";
await mkdir(out, { recursive: true });
const records = [];
const wrongPage = await readFile("public/sources/helikon/wallis-97.jpg");
const wait = (p, selector, text) => p.locator(selector).filter({ hasText: text }).waitFor();
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  console.log(
    `${name}: late sources, substituted bytes, captured exports, cancelled imports and sound`,
  );
  const b = await engine.launch();
  try {
    const c = await b.newContext({ serviceWorkers: "block" }),
      p = await c.newPage();
    let release;
    await p.route("**/sources/helikon/wallis-97.jpg", async (route) => {
      await new Promise((r) => {
        release = r;
      });
      await route.continue();
    });
    await p.goto(`${base}helikon.html?page=97`);
    await p.locator("#hk-title").waitFor();
    await p.waitForFunction(() =>
      document.getElementById("hk-source-status").textContent.startsWith("Verifying"),
    );
    while (!release) await p.waitForTimeout(20);
    await p.locator("#hk-page").selectOption("99");
    await wait(p, "#hk-source-status", /Verified/);
    release();
    await p.waitForTimeout(250);
    assert.match(await p.locator("#hk-source-image").getAttribute("alt"), /printed p\.99/);
    await c.close();
    const d = await b.newContext({ serviceWorkers: "block" }),
      q = await d.newPage();
    let wrong = true;
    await q.route("**/sources/helikon/wallis-98.jpg", (r) =>
      wrong ? r.fulfill({ status: 200, contentType: "image/jpeg", body: wrongPage }) : r.continue(),
    );
    await q.goto(`${base}helikon.html`);
    await wait(q, "#hk-source-status", /does not match/);
    assert(await q.locator("#hk-enlarge").isDisabled());
    await q.locator('[data-hk-save="html"]').click();
    await wait(q, "#hk-save-status", /does not match/);
    wrong = false;
    await q.locator("#hk-source-retry").click();
    await wait(q, "#hk-source-status", /Verified/);
    const recovered = q.waitForEvent("download");
    await q.locator('[data-hk-save="html"]').click();
    await (await recovered).saveAs(path.join(out, `${name}-recovered.html`));
    await d.close();
    const e = await b.newContext({ serviceWorkers: "block" }),
      r = await e.newPage();
    let saveRelease;
    await r.route("**/sources/helikon/wallis-100.jpg", async (route) => {
      await new Promise((done) => {
        saveRelease = done;
      });
      await route.continue();
    });
    await r.goto(`${base}helikon.html`);
    await wait(r, "#hk-source-status", /Verified/);
    const download = r.waitForEvent("download");
    await r.locator('[data-hk-save="html"]').click();
    while (!saveRelease) await r.waitForTimeout(20);
    await r.locator("#hk-fit").click();
    assert.match(await r.locator("#hk-retuning-result").textContent(), /All four/);
    saveRelease();
    const saved = await download,
      file = path.join(out, `${name}-snapshot.html`);
    await saved.saveAs(file);
    const html = await readFile(file, "utf8");
    assert.match(html, /2 of 4 target notes agree/);
    assert.match(html, /Inner positions 1\/2 and 2\/3/);
    await r.evaluate(() => {
      const text = File.prototype.text;
      File.prototype.text = function () {
        return new Promise((resolve, reject) => {
          window.__openFile = () => text.call(this).then(resolve, reject);
        });
      };
    });
    const imported = {
      format: "pyknon-helikon",
      version: 1,
      state: {
        stage: 4,
        bridge: 12,
        pair: 3,
        target: "enharmonic",
        x1: 252,
        x2: 336,
        scale: 12,
        reference: 220,
        reading: 0,
        page: "98",
      },
    };
    await r.locator("#hk-import").setInputFiles({
      name: "experiment.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(imported)),
    });
    await r.waitForFunction(() => !!window.__openFile);
    await r.locator('[data-hk-target="diatonic"]').click();
    await r.evaluate(() => window.__openFile());
    await wait(r, "#hk-save-status", /settings changed/);
    assert.equal(
      await r.locator('[data-hk-target="diatonic"]').getAttribute("aria-pressed"),
      "true",
    );
    await e.close();
    const f = await b.newContext({ serviceWorkers: "block" }),
      u = await f.newPage();
    let wrongFont = true;
    await u.route("**/fonts/IBMPlexSans-Regular.woff2", (route) =>
      wrongFont
        ? route.fulfill({
            status: 200,
            contentType: "font/woff2",
            body: Buffer.from("not the verified font"),
          })
        : route.continue(),
    );
    await u.goto(`${base}helikon.html`);
    await u.locator('[data-hk-save="html"]').click();
    await wait(u, "#hk-save-status", /does not match/);
    wrongFont = false;
    const good = u.waitForEvent("download");
    await u.locator('[data-hk-save="html"]').click();
    await (await good).saveAs(path.join(out, `${name}-font-recovered.html`));
    await f.close();
    const g = await b.newContext({ serviceWorkers: "block" });
    await g.addInitScript(() => {
      const resume = AudioContext.prototype.resume,
        create = AudioContext.prototype.createOscillator;
      window.__started = 0;
      AudioContext.prototype.resume = function () {
        return new Promise((resolve, reject) => {
          window.__resume = () => resume.call(this).then(resolve, reject);
        });
      };
      AudioContext.prototype.createOscillator = function () {
        window.__started++;
        return create.call(this);
      };
    });
    const v = await g.newPage();
    await v.goto(`${base}helikon.html`);
    await v.locator('[data-hk-play="retuning"]').click();
    await v.waitForFunction(() => !!window.__resume);
    await v.locator("#hk-retuning-stop").click();
    await v.evaluate(() => window.__resume());
    await v.waitForTimeout(100);
    assert.equal(await v.evaluate(() => window.__started), 0);
    assert(await v.locator("#hk-retuning-stop").isDisabled());
    await g.close();
    records.push({
      engine: name,
      lateSourceIgnored: true,
      wrongHttp200PageRejected: true,
      wrongHttp200FontRejected: true,
      sourceAndFontRecovery: true,
      saveRetainedCapturedSettings: true,
      lateImportDidNotReplaceCurrentSettings: true,
      stopCancelledPendingAudioResume: true,
    });
  } finally {
    await b.close();
  }
}
await writeFile(path.join(out, "review.json"), `${JSON.stringify({ records }, null, 2)}\n`);
console.log(`Completed ${records.length} source/export integrity journeys`);
