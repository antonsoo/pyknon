// biome-ignore-all lint/performance/useDomNodeTextContent: Review visible learner-facing output.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const output = process.argv[2] ?? "/tmp/claude-1000/pyknon-song-review/browser.json";
const directory = path.dirname(output);
await mkdir(path.join(directory, "audio"), { recursive: true });
await mkdir(path.join(directory, "assets"), { recursive: true });
let available = true;
let rejected = 0;
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const server = http.createServer(async (req, res) => {
  if (!available) {
    rejected++;
    req.socket.destroy();
    return;
  }
  const url = new URL(req.url, "http://localhost");
  const relative = decodeURIComponent(url.pathname).replace(/^\/pyknon\//, "") || "index.html";
  if (relative.includes("..") || !url.pathname.startsWith("/pyknon/")) {
    res.writeHead(404).end();
    return;
  }
  try {
    const body = await readFile(path.join("dist", relative));
    const types = {
      ".html": "text/html",
      ".js": "text/javascript",
      ".css": "text/css",
      ".jpg": "image/jpeg",
      ".woff2": "font/woff2",
      ".ttf": "font/ttf",
    };
    res
      .writeHead(200, {
        "Content-Type": types[path.extname(relative)] ?? "text/plain",
        "Cache-Control": "no-cache",
      })
      .end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}/pyknon/`;
const sourceHash = hash(await readFile("dist/sources/seikilos/inscription.jpg"));
const report = {
  checkedAt: new Date().toISOString(),
  scope:
    "Actual Chromium/Firefox controls and audio scheduling; standalone studies; origin-disabled multipage reloads. Native WAVs measured separately against an independently authored score. No physical speaker or historical-performance claim.",
  configurations: [],
  audio: [],
};
const syllables = [
  "ὅ",
  "σον",
  "ζῇς",
  "φαί",
  "νου",
  "μη",
  "δὲν",
  "ὅ",
  "λως",
  "σὺ",
  "λυ",
  "ποῦ",
  "πρὸς",
  "ὀ",
  "λί",
  "γον",
  "ἔσ",
  "τι",
  "τὸ",
  "ζῆν",
  "τὸ",
  "τέ",
  "λος",
  "ὁ",
  "χρό",
  "νος",
  "ἀ",
  "παι",
  "τεῖ",
];
try {
  for (const [engineName, engine] of [
    ["chromium", chromium],
    ["firefox", firefox],
  ]) {
    const browser = await engine.launch();
    try {
      for (const width of [1440, 375]) {
        available = true;
        const context = await browser.newContext({
          viewport: { width, height: 1100 },
          acceptDownloads: true,
        });
        await context.addInitScript(() => {
          window.audioAudit = [];
          window.delayResume = false;
          window.rejectResume = false;
          const nativeResume = AudioContext.prototype.resume;
          AudioContext.prototype.resume = async function () {
            if (window.rejectResume) throw new Error("Simulated browser audio denial");
            await nativeResume.call(this);
            if (window.delayResume) await new Promise((r) => setTimeout(r, 400));
          };
          const nativeOscillator = AudioContext.prototype.createOscillator;
          AudioContext.prototype.createOscillator = function () {
            const oscillator = nativeOscillator.call(this);
            const record = { hz: null, start: null, stops: [] };
            window.audioAudit.push(record);
            const set = oscillator.frequency.setValueAtTime.bind(oscillator.frequency);
            oscillator.frequency.setValueAtTime = (value, time) => {
              record.hz = value;
              return set(value, time);
            };
            const start = oscillator.start.bind(oscillator);
            oscillator.start = (time) => {
              record.start = time;
              return start(time);
            };
            const stop = oscillator.stop.bind(oscillator);
            oscillator.stop = (time) => {
              record.stops.push(time);
              return stop(time);
            };
            return oscillator;
          };
        });
        const page = await context.newPage();
        const errors = [],
          external = [],
          audits = [],
          lenses = [];
        page.on("pageerror", (e) => errors.push(e.message));
        page.on("request", (req) => {
          if (!req.url().startsWith(base) && !req.url().startsWith("blob:"))
            external.push(req.url());
        });
        await page.goto(`${base}song.html?s=3&a=220&pace=150#reader`);
        await page.waitForFunction(() =>
          document.querySelector("#offline-status").textContent.startsWith("Ready offline"),
        );
        await page.evaluate(() => document.fonts.ready);
        const landing = await page.locator("#reader-title").boundingBox();
        assert(landing.y >= 0 && landing.y < 120, `Deep-link landing ${landing.y}`);
        assert.equal(await page.locator("#selected-title [lang]").innerText(), "φαί");
        const audit = async (label) => {
          const result = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze();
          assert.deepEqual(
            result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
            [],
            label,
          );
          assert(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
            "No document overflow",
          );
          audits.push(label);
        };
        await audit("shared syllable reading");
        // Each syllable is selected through actual navigation controls, including
        // transitions across verses and across the physical lines on the stone.
        await page.locator('[data-verse="0"]').click();
        for (let i = 0; i < syllables.length; i++) {
          assert.equal(await page.locator("#selected-title [lang]").innerText(), syllables[i]);
          assert.equal(new URL(page.url()).searchParams.get("s"), String(i));
          assert.equal(
            await page.locator(`[data-syllable="${i}"]`).getAttribute("aria-pressed"),
            "true",
          );
          const lens = await page.locator("#source-lens").innerHTML();
          assert(lens.includes(`Inscribed ${syllables[i]}`));
          lenses.push(lens);
          if (i < 28) {
            await page.locator("#next-syllable").focus();
            await page.keyboard.press("Enter");
          }
        }
        assert(await page.locator("#next-syllable").isDisabled());
        assert.equal(await page.locator("#syllable-table tr").count(), 3);
        assert((await page.locator("#syllable-table").innerText()).includes("164.81"));
        await audit("final sign and three pitches");
        if (engineName === "chromium") {
          await page
            .locator("#reader")
            .screenshot({ path: path.join(directory, `assets/reader-${width}.png`) });
          if (width === 1440) {
            const contact = await context.newPage();
            await contact.setContent(
              `<base href="${base}"><style>body{margin:20px;font:18px Georgia;background:white}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:20px}figure{margin:0}svg{width:100%;display:block}figcaption{padding:5px}</style><div class="grid">${lenses.map((lens, i) => `<figure>${lens}<figcaption>${i + 1}. ${syllables[i]}</figcaption></figure>`).join("")}</div>`,
            );
            await contact.waitForFunction(() =>
              [...document.querySelectorAll("image")].every(
                (el) => el.getBoundingClientRect().height > 0,
              ),
            );
            await contact.waitForTimeout(500);
            await contact.screenshot({
              path: path.join(directory, "assets/all-source-selections.png"),
              fullPage: true,
            });
            await contact.close();
          }
        }
        // Native audio schedules and cancellation, including async permission races.
        await page.locator('[data-song-play="syllable"]').click();
        await page.waitForFunction(() => window.audioAudit.length === 3);
        await page.waitForFunction(() => document.querySelector(".song-sounding"));
        await page.locator("#song-stop").click();
        assert(await page.evaluate(() => window.audioAudit.every((n) => n.stops.length === 2)));
        assert.equal(await page.locator(".song-sounding").count(), 0);
        await page.evaluate(() => {
          window.delayResume = true;
        });
        await page.locator('[data-song-play="song"]').click();
        await page.locator("#song-stop").click();
        await page.waitForTimeout(500);
        assert.equal(await page.evaluate(() => window.audioAudit.length), 3);
        await page.evaluate(() => {
          window.delayResume = false;
          window.rejectResume = true;
        });
        await page.locator('[data-song-play="verse"]').click();
        await page.waitForFunction(() =>
          document.querySelector("#song-status").textContent.includes("could not start"),
        );
        assert(await page.locator("#song-stop").isDisabled());
        await page.evaluate(() => {
          window.rejectResume = false;
        });
        // Full song crosses all four verses; animation must not steal focus or scroll.
        await page.locator('[data-verse="0"]').click();
        await page.selectOption("#song-pace", "180");
        await page.locator('[data-song-play="song"]').focus();
        const initialScroll = await page.evaluate(() => scrollY);
        await page.keyboard.press("Enter");
        await page.waitForFunction(() => window.audioAudit.length === 40);
        await page.waitForFunction(
          () => document.querySelector("#song-status").textContent.startsWith("Finished"),
          null,
          { timeout: 25000 },
        );
        assert.equal(await page.locator("#selected-title [lang]").innerText(), "τεῖ");
        assert.equal(
          await page.evaluate(() => document.activeElement?.getAttribute("data-song-play")),
          "song",
        );
        assert(
          Math.abs((await page.evaluate(() => scrollY)) - initialScroll) < 2,
          "Playback does not scroll",
        );
        const live = await page.evaluate(() => window.audioAudit.slice(3));
        assert.equal(live.length, 37);
        assert(live.every((n) => n.stops.length === 1));
        assert.equal(await page.locator(".song-sounding").count(), 0);
        // Export every pitch/pace/verse setting on desktop, all verses on phone.
        for (let verse = 0; verse < 4; verse++)
          for (const root of width === 1440 ? [220, 440] : [220])
            for (const pace of width === 1440 ? [90, 120, 150, 180] : [150]) {
              await page.locator(`[data-verse="${verse}"]`).click();
              await page.selectOption("#song-root", String(root));
              await page.selectOption("#song-pace", String(pace));
              const [download] = await Promise.all([
                page.waitForEvent("download"),
                page.locator("#song-wav").click(),
              ]);
              const file = `audio/${engineName}-${width}-${download.suggestedFilename()}`;
              await download.saveAs(path.join(directory, file));
              report.audio.push({
                browser: engineName,
                width,
                verse,
                root,
                pace,
                file,
                sha256: hash(await readFile(path.join(directory, file))),
              });
            }
        // Guided links select the source, land at the reader and move focus on request.
        await page.locator('[data-observation="3"]').click();
        assert.equal(await page.locator("#selected-title [lang]").innerText(), "φαί");
        assert.equal(await page.evaluate(() => document.activeElement.id), "reader-title");
        await page.locator("#song-share").click();
        await page.waitForFunction(() =>
          /copied|Copy this reading link/.test(
            document.querySelector("#song-save-status").textContent,
          ),
        );
        const [saved] = await Promise.all([
          page.waitForEvent("download"),
          page.locator("#song-study").click(),
        ]);
        const studyFile = path.resolve(directory, `${engineName}-${width}-study.html`);
        await saved.saveAs(studyFile);
        const savedBytes = await readFile(studyFile, "utf8");
        const embedded = savedBytes.match(/data:image\/jpeg;base64,([^"\s]+)/)?.[1];
        assert(embedded, "Saved study embeds photograph");
        assert.equal(hash(Buffer.from(embedded, "base64")), sourceHash);
        await page.locator(".full-inscription summary").click();
        for (const img of await page.locator("img").all()) {
          await img.scrollIntoViewIfNeeded();
          await img.evaluate((el) => el.decode());
        }
        await audit("complete source photograph");
        await page.locator(".full-inscription summary").click();
        // Both entry points, including a cold visit from the other page's cache.
        const before = rejected;
        available = false;
        await page.reload();
        assert.equal(await page.locator("#selected-title [lang]").innerText(), "φαί");
        assert(rejected > before, "Origin actually failed");
        await page.goto(base);
        assert.equal(
          await page.locator("#intro-title").innerText(),
          "Two ancient notes.\nOne piano key.",
        );
        await page.locator('nav a[href="./song.html"]').click();
        assert.equal(
          await page.locator("#song-title").innerText(),
          "A song you can\nread in stone.",
        );
        const imageHash = await page.evaluate(async () => {
          const bytes = await (await fetch("./sources/seikilos/inscription.jpg")).arrayBuffer();
          const digest = await crypto.subtle.digest("SHA-256", bytes);
          return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
        });
        assert.equal(imageHash, sourceHash);
        await page.locator('[data-song-play="syllable"]').click();
        await page.waitForFunction(() => document.querySelector(".song-sounding"));
        await page.locator("#song-stop").click();
        const [offlineStudy] = await Promise.all([
          page.waitForEvent("download"),
          page.locator("#song-study").click(),
        ]);
        await offlineStudy.saveAs(path.join(directory, `${engineName}-${width}-offline.html`));
        const savedPage = await context.newPage();
        const savedRequests = [];
        savedPage.on("request", (req) => {
          if (!req.url().startsWith("file:") && !req.url().startsWith("data:"))
            savedRequests.push(req.url());
        });
        await savedPage.goto(`file://${studyFile}`);
        assert.equal(await savedPage.locator(".verse").count(), 4);
        assert.equal(await savedPage.locator("tbody tr").count(), 29);
        assert(
          await savedPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        );
        assert.deepEqual(savedRequests, []);
        if (engineName === "chromium" && width === 1440)
          await savedPage.pdf({
            path: path.join(directory, "saved-reading.pdf"),
            format: "A4",
            printBackground: true,
          });
        assert.deepEqual(errors, []);
        assert.deepEqual(external, []);
        report.configurations.push({
          browser: engineName,
          version: browser.version(),
          width,
          landingY: landing.y,
          reviewedSyllables: syllables.length,
          accessibility: audits,
          nativeLiveTones: live,
          stopAndResumeCancellation: true,
          audioDenialRecovery: true,
          offlineBothPages: true,
          offlinePhotoHash: imageHash,
          standaloneStudyHash: hash(savedBytes),
          pageErrors: errors,
          externalRequests: external,
        });
        await context.close();
        available = true;
        console.log(`${engineName} ${width}: source, song, exports and offline workflows passed`);
      }
    } finally {
      await browser.close();
    }
  }
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    `Verified ${report.configurations.length} workflows and ${report.audio.length} exported verses.`,
  );
} finally {
  server.close();
}
