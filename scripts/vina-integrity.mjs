import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, firefox } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4329/pyknon/",
  out = path.resolve(process.argv[3] ?? "/tmp/pyknon-vina-integrity");
await mkdir(out, { recursive: true });
const manifest = JSON.parse(await readFile("public/sources/vina/manifest.json", "utf8"));
const sha = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function poll(fn, message) {
  const until = Date.now() + 20000;
  while (Date.now() < until) {
    if (await fn()) return;
    await new Promise((r) => setTimeout(r, 30));
  }
  throw Error(message);
}
async function status(page, fragment, id = "vn-save-status") {
  await poll(
    () =>
      page
        .locator(`#${id}`)
        .textContent()
        .then((t) => t.includes(fragment)),
    `Expected ${id}: ${fragment}`,
  );
}
async function imageHash(page) {
  return sha(
    Buffer.from(
      await page
        .locator("#vn-source-image")
        .evaluate(async (i) => [
          ...new Uint8Array(await window.__vinaBlobs.get(i.currentSrc).arrayBuffer()),
        ]),
    ),
  );
}
const rows = [];
for (const [engine, browserType] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await browserType.launch(),
    context = await browser.newContext({
      serviceWorkers: "block",
      acceptDownloads: true,
      viewport: { width: 375, height: 1000 },
    });
  await context.addInitScript(() => {
    window.__vinaBlobs = new Map();
    const create = URL.createObjectURL.bind(URL);
    URL.createObjectURL = (blob) => {
      const url = create(blob);
      window.__vinaBlobs.set(url, blob);
      return url;
    };
  });
  const page = await context.newPage(),
    errors = [],
    downloads = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("download", (d) => downloads.push(d));
  try {
    await page.goto(`${base}vina.html`);
    await status(page, "Verified", "vn-source-status");
    let held;
    const oldUrl = `${base}sources/vina/grosset-28.jpg`;
    await page.route(oldUrl, (route) => {
      held = route;
    });
    await page.locator("#vn-page").selectOption("28");
    await poll(() => !!held, "Older source request held");
    await page.locator("#vn-page").selectOption("57");
    await status(page, "Verified", "vn-source-status");
    const response = page.waitForResponse(oldUrl);
    await held.fulfill({
      status: 200,
      contentType: "image/jpeg",
      body: await readFile("public/sources/vina/grosset-28.jpg"),
    });
    await (await response).finished();
    await page.waitForTimeout(80);
    assert.equal(await imageHash(page), manifest.pages.find((p) => p.id === "57").sha256);
    assert.match(await page.locator("#vn-source-image").getAttribute("alt"), /p\.57/);
    await page.unroute(oldUrl);
    console.log(`${engine}: completed older image response cannot replace the new page`);
    const wrongUrl = `${base}sources/vina/grosset-29.jpg`;
    await page.route(wrongUrl, (route) =>
      route.fulfill({
        status: 200,
        contentType: "image/jpeg",
        path: "public/sources/vina/grosset-57.jpg",
      }),
    );
    await page.locator("#vn-page").selectOption("29");
    await status(page, "do not match", "vn-source-status");
    assert(await page.locator("#vn-source-image").isHidden());
    let count = downloads.length;
    await page.locator("#vn-save-html").click();
    await status(page, "do not match");
    assert.equal(downloads.length, count);
    await page.unroute(wrongUrl);
    await page.locator("#vn-retry").click();
    await status(page, "Verified", "vn-source-status");
    assert.equal(await imageHash(page), manifest.pages.find((p) => p.id === "29").sha256);
    const waiting = page.waitForEvent("download");
    await page.locator("#vn-save-html").click();
    const recovery = await waiting;
    assert.equal(await recovery.failure(), null);
    await recovery.saveAs(path.join(out, `${engine}-recovered.html`));
    console.log(`${engine}: wrong valid JPEG refuses display/export, then native export recovers`);
    const fontUrl = `${base}fonts/IBMPlexSans-Regular.woff2`;
    await page.route(fontUrl, (route) =>
      route.fulfill({
        status: 200,
        contentType: "font/woff2",
        path: "public/fonts/IBMPlexSans-SemiBold.woff2",
      }),
    );
    count = downloads.length;
    await page.locator("#vn-save-svg").click();
    await status(page, "do not match");
    assert.equal(downloads.length, count);
    await page.locator("#vn-save-html").click();
    await status(page, "do not match");
    assert.equal(downloads.length, count);
    await page.unroute(fontUrl);
    const fontRecovery = page.waitForEvent("download");
    await page.locator("#vn-save-svg").click();
    await (await fontRecovery).saveAs(path.join(out, `${engine}-recovered.svg`));
    console.log(`${engine}: wrong valid font refuses portable files, then SVG recovers`);
    held = undefined;
    await page.route(oldUrl, (route) => {
      held = route;
    });
    count = downloads.length;
    await page.locator("#vn-save-html").click();
    await poll(() => !!held, "Export source held");
    await page.locator("#vn-tuning").selectOption("quarter");
    await held.fulfill({
      status: 200,
      contentType: "image/jpeg",
      path: "public/sources/vina/grosset-28.jpg",
    });
    await status(page, "comparison changed");
    assert.equal(downloads.length, count);
    await page.unroute(oldUrl);
    // Stopping playback changes no comparison setting. A held export must
    // finish with its original state after the learner stops the sound.
    held = undefined;
    await page.route(oldUrl, (route) => {
      held = route;
    });
    await page.locator("#vn-save-html").click();
    await poll(() => !!held, "Playback-stop export source held");
    await page.locator("#vn-play").click();
    await page.waitForFunction(() => document.querySelector(".vn-sounding"));
    await page.locator("#vn-stop").click();
    const stoppedExport = page.waitForEvent("download");
    await held.fulfill({
      status: 200,
      contentType: "image/jpeg",
      path: "public/sources/vina/grosset-28.jpg",
    });
    const stoppedReading = await stoppedExport;
    await stoppedReading.saveAs(path.join(out, `${engine}-stopped-playback.html`));
    assert.equal(await stoppedReading.failure(), null);
    await page.unroute(oldUrl);
    console.log(`${engine}: stopping playback preserves the pending illustrated export`);
    const input = {
      format: "pyknon-vina-v1",
      state: {
        tuning: "comma",
        tenth: 215,
        position: 2000,
        root: 220,
        selected: 2,
        sound: "pair",
        reading: 3,
        page: "29",
      },
    };
    await page.evaluate(() => {
      const text = File.prototype.text;
      window.__releaseFile = undefined;
      File.prototype.text = function () {
        return new Promise((resolve, reject) => {
          window.__releaseFile = () => text.call(this).then(resolve, reject);
        });
      };
    });
    await page.locator("#vn-import").setInputFiles({
      name: "comparison.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(input)),
    });
    await poll(() => page.evaluate(() => !!window.__releaseFile), "File read held");
    await page.locator("#vn-tuning").selectOption("comma");
    await page.locator("#vn-fail").click();
    await page.evaluate(() => window.__releaseFile());
    await status(page, "comparison changed while the file");
    assert.equal(await page.locator("#vn-tuning").inputValue(), "free");
    assert.equal(await page.locator("#vn-p").inputValue(), "700");
    assert.deepEqual(errors, []);
    rows.push({
      engine,
      version: browser.version(),
      completedLateSourceResponseIgnored: true,
      validWrongJpegRefusedBeforeDisplay: true,
      wrongJpegPreventsIllustratedDownload: true,
      validWrongFontPreventsSvgAndHtml: true,
      verifiedRetriesRecoverNativeFiles: true,
      comparisonChangeCancelsPendingExport: true,
      playbackStopPreservesPendingExport: true,
      comparisonChangePreventsStaleImport: true,
      pageErrors: errors,
    });
    console.log(`${engine}: edited comparison survives pending export and delayed JSON import`);
  } finally {
    await context.close();
    await browser.close();
  }
}
await writeFile(
  path.join(out, "integrity.json"),
  `${JSON.stringify({ base, scope: "Production, service workers blocked; actual intercepted responses and native downloads", cases: rows }, null, 2)}\n`,
);
