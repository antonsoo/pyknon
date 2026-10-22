// biome-ignore-all lint/performance/useDomNodeTextContent: Audit visible learner-facing text.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const output = process.argv[2] ?? "/tmp/claude-1000/pyknon-review/browser.json";
const directory = path.dirname(output);
await mkdir(path.join(directory, "audio"), { recursive: true });
await mkdir(path.join(directory, "assets"), { recursive: true });
let available = true;
let rejected = 0;
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
const report = {
  checkedAt: new Date().toISOString(),
  scope:
    "Native browser controls, live scheduling and cancellation, exported PCM audio, saved study and actual origin failure. No claim about physical speaker output or ancient performance.",
  configurations: [],
  audio: [],
};
const sourceHashes = await Promise.all(
  ["wallis-62", "wallis-63", "macran-182"].map(async (p) =>
    createHash("sha256")
      .update(await readFile(`dist/sources/${p}.jpg`))
      .digest("hex"),
  ),
);
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
        // Transparent instrumentation: native contexts, oscillators and rendering
        // remain in use. Record schedules; delay one resume to exercise cancellation.
        await context.addInitScript(() => {
          window.audioAudit = [];
          window.delayResume = false;
          const nativeResume = AudioContext.prototype.resume;
          AudioContext.prototype.resume = async function () {
            await nativeResume.call(this);
            if (window.delayResume) await new Promise((r) => setTimeout(r, 350));
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
          audits = [];
        page.on("pageerror", (e) => errors.push(e.message));
        page.on("request", (req) => {
          if (!req.url().startsWith(base) && !req.url().startsWith("blob:"))
            external.push(req.url());
        });
        await page.goto(`${base}?g=enharmonic&a=220&d=up#listen`);
        await page.waitForFunction(() =>
          document.querySelector("#offline-status").textContent.startsWith("Ready offline"),
        );
        await page.evaluate(() => document.fonts.ready);
        const landing = await page.locator("#listen-title").boundingBox();
        assert(landing.y >= 0 && landing.y < 180, `Shared landing ${landing.y}`);
        const audit = async (label) => {
          const a = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze();
          assert.deepEqual(
            a.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
            [],
            label,
          );
          assert(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
            "No document overflow",
          );
          audits.push(label);
        };
        await audit("enharmonic listening view");
        await page.locator('[data-play="compare"]').focus();
        await page.keyboard.press("Enter");
        await page.waitForFunction(() => window.audioAudit.length === 8);
        await page.waitForFunction(() => document.querySelectorAll(".sounding").length === 1);
        await page.locator("#stop").click();
        assert.equal(await page.locator("#play-status").innerText(), "Stopped.");
        assert.equal(await page.locator(".sounding").count(), 0);
        const cancelled = await page.evaluate(() =>
          window.audioAudit.every((t) => t.stops.length === 2),
        );
        assert(cancelled, "All eight scheduled oscillators cancelled");
        // Stop during a pending asynchronous resume must not schedule new tones.
        await page.evaluate(() => {
          window.delayResume = true;
        });
        await page.locator('[data-play="ratios"]').click();
        await page.locator("#stop").click();
        await page.waitForTimeout(500);
        assert.equal(await page.evaluate(() => window.audioAudit.length), 8);
        await page.evaluate(() => {
          window.delayResume = false;
        });
        await page.locator('[data-play="close"]').click();
        await page.waitForFunction(
          () => document.querySelector("#play-status").textContent.startsWith("Finished"),
          null,
          { timeout: 30000 },
        );
        assert(await page.locator("#stop").isDisabled());
        assert.equal(await page.locator(".sounding").count(), 0);
        const live = await page.evaluate(() => window.audioAudit.slice(8));
        assert.equal(live.length, 8);
        assert.notEqual(live[0].hz, live[1].hz);
        assert.equal(live[4].hz, live[5].hz);
        for (const id of ["diatonic", "chromatic", "enharmonic"]) {
          await page.locator(`[data-genus=${id}]`).focus();
          await page.keyboard.press("Space");
          assert.equal(
            await page.locator(`[data-genus=${id}]`).getAttribute("aria-pressed"),
            "true",
          );
          await audit(id);
        }
        await page.locator(".measurements summary").click();
        assert.equal(await page.locator("#note-table tr").count(), 4);
        assert((await page.locator("#note-table").innerText()).includes("234.667 Hz"));
        await audit("open measurements");
        await page.locator('[data-single="2"]').click();
        await page.waitForFunction(
          () => document.querySelector(".sounding")?.getAttribute("data-note") === "ratios-2",
        );
        await page.locator("#stop").click();
        await page.locator(".measurements summary").click();
        for (const index of [0, 1, 2, 3]) {
          await page.locator(`[data-word="${index}"]`).click();
          assert((await page.locator("#word-detail").innerText()).length > 120);
        }
        await page.locator('[data-try="diatonic"]').click();
        assert.equal(
          await page.locator("[data-genus=diatonic]").getAttribute("aria-pressed"),
          "true",
        );
        const tryLanding = await page.locator("#listen-title").boundingBox();
        assert(tryLanding.y >= 0 && tryLanding.y < 180);
        await page.locator(".scan summary").click();
        for (const image of await page.locator(".scan img").all()) {
          await image.scrollIntoViewIfNeeded();
          await image.evaluate((el) => el.decode());
        }
        await audit("source and scans");
        await page.locator(".scan summary").click();
        const genera = width === 1440 ? ["enharmonic", "chromatic", "diatonic"] : ["enharmonic"];
        const roots = width === 1440 ? [110, 220, 440] : [220];
        const directions = width === 1440 ? ["up", "down"] : ["up"];
        for (const genus of genera)
          for (const root of roots)
            for (const direction of directions) {
              await page.locator(`[data-genus=${genus}]`).click();
              await page.selectOption("#root", String(root));
              await page.selectOption("#direction", direction);
              const [download] = await Promise.all([
                page.waitForEvent("download"),
                page.locator("#wav").click(),
              ]);
              const file = `audio/${engineName}-${width}-${download.suggestedFilename()}`;
              await download.saveAs(path.join(directory, file));
              const bytes = await readFile(path.join(directory, file));
              report.audio.push({
                browser: engineName,
                width,
                genus,
                root,
                direction,
                file,
                bytes: bytes.length,
                sha256: createHash("sha256").update(bytes).digest("hex"),
              });
            }
        await page.locator("[data-genus=enharmonic]").click();
        await page.selectOption("#root", "220");
        await page.selectOption("#direction", "up");
        const [saved] = await Promise.all([
          page.waitForEvent("download"),
          page.locator("#study").click(),
        ]);
        const studyFile = path.resolve(directory, `${engineName}-${width}-study.html`);
        await saved.saveAs(studyFile);
        await page.locator("#share").click();
        assert(
          (await page.locator("#save-status").innerText()).match(/copied|Copy this study link/),
        );
        if (engineName === "chromium") {
          await page.locator("[data-genus=enharmonic]").click();
          await page.locator("#listen-title").focus();
          await page
            .locator("#listen")
            .screenshot({ path: path.join(directory, `assets/listening-${width}.png`) });
        }
        // Origin becomes unreachable, rather than merely toggling a browser flag.
        const before = rejected;
        available = false;
        await page.reload();
        await page.waitForFunction(() =>
          document.querySelector("#offline-status").textContent.startsWith("Ready offline"),
        );
        assert(rejected > before, "Navigation attempted and failed at origin");
        const cachedHashes = await page.evaluate(async () =>
          Promise.all(
            ["wallis-62", "wallis-63", "macran-182"].map(async (p) => {
              const bytes = await (await fetch(`./sources/${p}.jpg`)).arrayBuffer();
              const hash = await crypto.subtle.digest("SHA-256", bytes);
              return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
            }),
          ),
        );
        assert.deepEqual(cachedHashes, sourceHashes);
        await page.locator("[data-play=ratios]").click();
        await page.waitForFunction(() => document.querySelectorAll(".sounding").length === 1);
        await page.locator("#stop").click();
        assert.deepEqual(errors, []);
        assert.deepEqual(external, []);
        const savedPage = await context.newPage();
        const savedRequests = [];
        savedPage.on("request", (req) => {
          if (!req.url().startsWith("file:")) savedRequests.push(req.url());
        });
        await savedPage.goto(`file://${studyFile}`);
        assert((await savedPage.locator("h1").innerText()).includes("Enharmonic"));
        assert((await savedPage.locator("body").innerText()).includes("234.667"));
        assert.deepEqual(savedRequests, []);
        if (engineName === "chromium" && width === 1440) {
          await savedPage.pdf({
            path: path.join(directory, "saved-study.pdf"),
            format: "A4",
            printBackground: true,
          });
        }
        report.configurations.push({
          browser: engineName,
          version: browser.version(),
          width,
          sharedLanding: landing.y,
          sourceToListeningLanding: tryLanding.y,
          accessibility: audits,
          liveStopCancelsEightTones: cancelled,
          pendingResumeCancelled: true,
          closeNoteSequenceFinishes: true,
          offlineSourceHashes: cachedHashes,
          savedStudySha256: createHash("sha256")
            .update(await readFile(studyFile))
            .digest("hex"),
          pageErrors: errors,
          externalRequests: external,
        });
        await context.close();
        available = true;
      }
    } finally {
      await browser.close();
    }
  }
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
  console.log(
    `Verified ${report.configurations.length} browser workflows; exported ${report.audio.length} WAV files for independent analysis.`,
  );
} finally {
  server.close();
}
