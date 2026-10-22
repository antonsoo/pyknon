// biome-ignore-all lint/performance/useDomNodeTextContent: Check the visible hosted reading.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, firefox } from "playwright";

const base = process.argv[2] ?? "https://antonsoo.github.io/pyknon/";
const output = process.argv[3] ?? "/tmp/pyknon-hosted-song/review.json";
const directory = path.dirname(output);
await mkdir(directory, { recursive: true });
const local = JSON.parse(await readFile("docs/seikilos-browser.json", "utf8"));
const study = await readFile("examples/seikilos-reading.html");
const sourceHash = createHash("sha256")
  .update(await readFile("public/sources/seikilos/inscription.jpg"))
  .digest("hex");
const hash = (data) => createHash("sha256").update(data).digest("hex");
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
      const external = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("request", (request) => {
        if (!request.url().startsWith(base) && !request.url().startsWith("blob:"))
          external.push(request.url());
      });
      const response = await page.goto(`${base}song.html?s=28&a=220&pace=150#reader`);
      assert.equal(response.status(), 200);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() =>
        document.querySelector("#offline-status").textContent.startsWith("Ready offline"),
      );
      assert.equal(await page.locator("#selected-title [lang]").innerText(), "τεῖ");
      assert.equal(await page.locator("#syllable-table tr").count(), 3);
      assert((await page.locator("#syllable-table").innerText()).includes("reversed gamma"));
      const landing = await page.locator("#reader-title").boundingBox();
      assert(landing.y >= 0 && landing.y < 180);
      if (name === "chromium")
        await page.locator("#reader").screenshot({
          path: path.join(directory, `reader-${width}.png`),
        });
      await page.locator('[data-song-play="syllable"]').focus();
      await page.keyboard.press("Space");
      await page.waitForFunction(() => document.querySelector(".song-sounding"));
      await page.locator("#song-stop").click();
      assert.equal(await page.locator("#song-status").innerText(), "Stopped.");
      const [wav] = await Promise.all([
        page.waitForEvent("download"),
        page.locator("#song-wav").click(),
      ]);
      const wavHash = hash(await bytes(wav));
      const expected = local.audio.find(
        (audio) =>
          audio.browser === name &&
          audio.width === width &&
          audio.verse === 3 &&
          audio.root === 220 &&
          audio.pace === 150,
      );
      assert.equal(wavHash, expected.sha256);
      await page.locator('[data-observation="3"]').click();
      await page.selectOption("#song-root", "440");
      await page.selectOption("#song-pace", "180");
      const [html] = await Promise.all([
        page.waitForEvent("download"),
        page.locator("#song-study").click(),
      ]);
      assert.deepEqual(await bytes(html), study);
      await context.setOffline(true);
      await page.reload();
      assert.equal(await page.locator("#selected-title [lang]").innerText(), "φαί");
      const savedSource = await page.evaluate(async () => {
        const buffer = await (await fetch("./sources/seikilos/inscription.jpg")).arrayBuffer();
        const digest = await crypto.subtle.digest("SHA-256", buffer);
        return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
      });
      assert.equal(savedSource, sourceHash);
      await page.locator('nav a[href="./#listen"]').click();
      assert((await page.locator("#intro-title").innerText()).includes("Two ancient notes."));
      await page.locator('nav a[href="./song.html"]').click();
      assert((await page.locator("#song-title").innerText()).includes("read in stone."));
      await page.locator('[data-song-play="syllable"]').click();
      await page.waitForFunction(() => document.querySelector(".song-sounding"));
      await page.locator("#song-stop").click();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.deepEqual(errors, []);
      assert.deepEqual(external, []);
      report.configurations.push({
        browser: name,
        version: browser.version(),
        width,
        sharedLanding: landing.y,
        keyboardPlaybackAndStop: true,
        wavMatchesMeasuredLocalExport: wavHash,
        studyMatchesReviewedExport: true,
        offlineSourceHash: savedSource,
        offlineBothPagesAndPlayback: true,
        pageErrors: errors,
        externalRequests: external,
      });
      await context.close();
      console.log(`${name} ${width}: hosted reading, exports and offline journey passed`);
    }
  } finally {
    await browser.close();
  }
}
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
