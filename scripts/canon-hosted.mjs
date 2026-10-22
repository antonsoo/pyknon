// biome-ignore-all lint/performance/useDomNodeTextContent: Review the actual public lesson.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, firefox } from "playwright";

const base = process.argv[2] ?? "https://antonsoo.github.io/pyknon/";
const output = process.argv[3] ?? "/tmp/pyknon-hosted-canon/review.json";
const directory = path.dirname(output);
await mkdir(directory, { recursive: true });
const local = JSON.parse(await readFile("docs/canon-browser.json", "utf8"));
const expectedStudy = await readFile("examples/canon-six-tones-reading.html");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function downloadBytes(download) {
  const chunks = [];
  for await (const chunk of await download.createReadStream()) chunks.push(chunk);
  return Buffer.concat(chunks);
}
const sourceHashes = await Promise.all(
  [170, 171, 172, 173, 174, 175].map(async (p) =>
    hash(await readFile(`public/sources/canon/menge-${p}.jpg`)),
  ),
);
const report = {
  checkedAt: new Date().toISOString(),
  base,
  scope:
    "Canonical public site: keyboard listening, native downloads compared byte-for-byte with reviewed local outputs, all three rooms offline, and source scan integrity.",
  configurations: [],
};
for (const [name, engine] of Object.entries({ chromium, firefox })) {
  const browser = await engine.launch();
  try {
    for (const width of [1440, 375]) {
      const context = await browser.newContext({
        viewport: { width, height: 1100 },
        acceptDownloads: true,
      });
      const page = await context.newPage(),
        errors = [],
        external = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("request", (r) => {
        if (
          !r.url().startsWith(base) &&
          !r.url().startsWith("blob:") &&
          !r.url().startsWith("data:")
        )
          external.push(r.url());
      });
      const response = await page.goto(`${base}canon.html?n=6&a=220&sound=beat&p=2&page=174#canon`);
      assert.equal(response.status(), 200);
      await page.waitForFunction(() =>
        document.querySelector("#offline-status").textContent.startsWith("Ready offline"),
      );
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator("#ratio-hz").innerText(), "446.003 Hz");
      assert.equal(await page.locator("#equal-hz").innerText(), "440.000 Hz");
      assert((await page.locator(".greek-line").innerText()).includes("[ἐστι]"));
      const controls = await page.locator("#play").boundingBox();
      assert(controls.y >= 0 && controls.y + controls.height < 650);
      await page.locator("#play").focus();
      await page.keyboard.press("Space");
      await page.waitForFunction(() => document.querySelector(".sounding"));
      assert.equal(await page.evaluate(() => document.activeElement.id), "play");
      await page.locator("#stop").click();
      assert.equal(await page.locator(".sounding").count(), 0);
      const [wav] = await Promise.all([
        page.waitForEvent("download"),
        page.locator("#wav").click(),
      ]);
      const wavHash = hash(await downloadBytes(wav));
      const expected = local.audio.find(
        (a) =>
          a.browser === name &&
          a.width === width &&
          a.root === 220 &&
          a.step === 6 &&
          a.sound === "beat",
      );
      assert.equal(wavHash, expected.sha256);
      const [html] = await Promise.all([
        page.waitForEvent("download"),
        page.locator("#study").click(),
      ]);
      assert.deepEqual(await downloadBytes(html), expectedStudy);
      await page.locator('[data-passage="3"]').focus();
      await page.keyboard.press("Space");
      assert((await page.locator(".greek-line").innerText()).startsWith("τὸ ἄρα"));
      await page.locator("#inspect-number").click();
      assert.equal(await page.locator("#source-page").inputValue(), "171");
      await page.locator("#source-image").evaluate((img) => img.decode());
      if (name === "chromium") {
        await page
          .locator("#canon")
          .screenshot({ path: path.join(directory, `canon-${width}.png`) });
        await page.locator("#reading").evaluate((el) => el.scrollIntoView({ block: "start" }));
        await page.screenshot({ path: path.join(directory, `reading-${width}.png`) });
      }
      await context.setOffline(true);
      await page.reload();
      await page.waitForFunction(() =>
        document.querySelector("#offline-status").textContent.startsWith("Ready offline"),
      );
      const savedHashes = await page.evaluate(async () =>
        Promise.all(
          [170, 171, 172, 173, 174, 175].map(async (p) => {
            const b = await (await fetch(`./sources/canon/menge-${p}.jpg`)).arrayBuffer();
            return [...new Uint8Array(await crypto.subtle.digest("SHA-256", b))]
              .map((n) => n.toString(16).padStart(2, "0"))
              .join("");
          }),
        ),
      );
      assert.deepEqual(savedHashes, sourceHashes);
      await page.locator('nav a[href="./#listen"]').click();
      await page.locator('[data-genus="enharmonic"]').click();
      await page.locator('nav a[href="./song.html"]').click();
      await page.locator('[data-verse="3"]').click();
      await page.locator('[data-syllable="28"]').click();
      assert.equal(await page.locator("#syllable-table tr").count(), 3);
      await page.locator('nav a[href="./canon.html"]').click();
      await page.selectOption("#sound", "control");
      await page.locator("#play").click();
      await page.waitForFunction(() => document.querySelector(".sounding"));
      await page.locator("#stop").click();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.deepEqual(errors, []);
      assert.deepEqual(external, []);
      report.configurations.push({
        browser: name,
        version: browser.version(),
        width,
        playControlY: controls.y,
        keyboardPlaybackPreservesFocus: true,
        wavMatchesMeasuredLocalOutput: wavHash,
        illustratedReadingMatchesNativeDownload: true,
        offlineSourceHashes: savedHashes,
        offlineThreeRoomJourney: true,
        pageErrors: errors,
        externalRequests: external,
      });
      await context.close();
      console.log(`${name} ${width}: hosted octave reading, exports and offline journey passed`);
    }
  } finally {
    await browser.close();
  }
}
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
