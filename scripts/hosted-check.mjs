// biome-ignore-all lint/performance/useDomNodeTextContent: Check the visible hosted workflow.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { chromium, firefox } from "playwright";

const base = process.argv[2] ?? "https://antonsoo.github.io/pyknon/";
const output = process.argv[3] ?? "docs/hosted-review.json";
const reference = await readFile("examples/enharmonic-220.html");
const local = JSON.parse(await readFile("docs/browser-review.json", "utf8"));
const report = { checkedAt: new Date().toISOString(), base, configurations: [] };
async function bytes(download) {
  const chunks = [];
  for await (const chunk of await download.createReadStream()) chunks.push(chunk);
  return Buffer.concat(chunks);
}
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const width of [1440, 375]) {
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        acceptDownloads: true,
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      const response = await page.goto(`${base}?g=chromatic&a=110&d=down#listen`);
      assert.equal(response.status(), 200);
      await page.waitForFunction(() =>
        document.querySelector("#offline-status").textContent.startsWith("Ready offline"),
      );
      assert.equal(
        await page.locator("[data-genus=chromatic]").getAttribute("aria-pressed"),
        "true",
      );
      assert.equal(await page.locator("#root").inputValue(), "110");
      assert.equal(await page.locator("#direction").inputValue(), "down");
      const landing = await page.locator("#listen-title").boundingBox();
      assert(landing.y >= 0 && landing.y < 180);
      await page.locator("[data-genus=enharmonic]").focus();
      await page.keyboard.press("Space");
      await page.selectOption("#root", "220");
      await page.selectOption("#direction", "up");
      await page.locator("[data-play=compare]").click();
      await page.waitForFunction(() => document.querySelectorAll(".sounding").length === 1);
      await page.locator("#stop").click();
      assert.equal(await page.locator("#play-status").innerText(), "Stopped.");
      const [html] = await Promise.all([
        page.waitForEvent("download"),
        page.locator("#study").click(),
      ]);
      assert.deepEqual(await bytes(html), reference);
      const [wav] = await Promise.all([
        page.waitForEvent("download"),
        page.locator("#wav").click(),
      ]);
      const wavBytes = await bytes(wav);
      const sha = createHash("sha256").update(wavBytes).digest("hex");
      const expected = local.audio.find(
        (a) =>
          a.browser === name &&
          a.width === width &&
          a.genus === "enharmonic" &&
          a.root === 220 &&
          a.direction === "up",
      );
      assert.equal(sha, expected.sha256);
      await page.locator('[data-word="0"]').click();
      assert((await page.locator("#word-detail").innerText()).includes("Macran"));
      assert(
        (await page.locator("#word-detail a").getAttribute("href")).endsWith("macran-182.jpg"),
      );
      await page.locator("[data-try=enharmonic]").click();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.deepEqual(errors, []);
      report.configurations.push({
        browser: name,
        version: browser.version(),
        width,
        sharedLanding: landing.y,
        nativeKeyboard: true,
        playAndStop: true,
        htmlMatchesReviewedStudy: true,
        wavMatchesMeasuredLocalExport: true,
        wavSha256: sha,
        sourceToListening: true,
        pageErrors: errors,
      });
      await context.close();
    }
  } finally {
    await browser.close();
  }
}
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(
  `Verified ${report.configurations.length} hosted listening workflows and exact HTML/WAV exports.`,
);
