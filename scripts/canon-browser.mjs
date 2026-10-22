// biome-ignore-all lint/performance/useDomNodeTextContent: Review visible learner-facing output.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const output = process.argv[2] ?? "/tmp/claude-1000/pyknon-canon/browser.json";
const directory = path.dirname(output);
await mkdir(path.join(directory, "audio"), { recursive: true });
await mkdir(path.join(directory, "assets"), { recursive: true });
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
let available = true,
  rejected = 0;
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
    const bytes = await readFile(path.join("dist", relative));
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
      .end(bytes);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}/pyknon/`;
const pages = [170, 171, 172, 173, 174, 175];
const sourceHashes = await Promise.all(
  pages.map(async (p) => hash(await readFile(`dist/sources/canon/menge-${p}.jpg`))),
);
const report = {
  checkedAt: new Date().toISOString(),
  scope:
    "Local production build. Actual browser selections, SVG coordinates, generated WAVs and standalone HTML. Origin disabled for offline navigation. Physical listening and hosted deployment not claimed.",
  configurations: [],
  audio: [],
};
try {
  for (const [engineName, engine] of Object.entries({ chromium, firefox })) {
    const browser = await engine.launch({ headless: true });
    try {
      for (const width of [1440, 375]) {
        const context = await browser.newContext({
          viewport: { width, height: 1100 },
          acceptDownloads: true,
        });
        await context.addInitScript(() => {
          window.audioAudit = [];
          window.delayResume = false;
          const resume = AudioContext.prototype.resume;
          AudioContext.prototype.resume = async function () {
            if (window.delayResume) await new Promise((r) => setTimeout(r, 350));
            return resume.call(this);
          };
          const create = AudioContext.prototype.createOscillator;
          AudioContext.prototype.createOscillator = function () {
            const node = create.call(this),
              record = { hz: null, start: null, stops: [] };
            window.audioAudit.push(record);
            const setFrequency = node.frequency.setValueAtTime.bind(node.frequency);
            node.frequency.setValueAtTime = (value, time) => {
              record.hz = value;
              return setFrequency(value, time);
            };
            const start = node.start.bind(node),
              stop = node.stop.bind(node);
            node.start = (time) => {
              record.start = time;
              return start(time);
            };
            node.stop = (time) => {
              record.stops.push(time);
              return stop(time);
            };
            return node;
          };
        });
        const page = await context.newPage(),
          errors = [],
          external = [],
          audits = [];
        page.on("pageerror", (e) => errors.push(e.message));
        page.on("request", (r) => {
          if (!r.url().startsWith(base) && !r.url().startsWith("data:")) external.push(r.url());
        });
        await page.goto(`${base}canon.html?n=6&a=220&sound=compare&p=2&page=171#canon`);
        await page.waitForFunction(() =>
          document.querySelector("#offline-status").textContent.startsWith("Ready offline"),
        );
        await page.evaluate(() => document.fonts.ready);
        assert((await page.locator("#ratio-hz").innerText()).includes("446.003"));
        assert((await page.locator("#passage").innerText()).includes("ἐστι"));
        assert.equal(await page.locator("#source-page").inputValue(), "171");
        const landing = await page.locator("#canon").boundingBox();
        assert(landing.y >= 0 && landing.y < 40);
        async function audit(label) {
          assert(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
            `Page fits at ${label}`,
          );
          const a = await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze();
          assert.deepEqual(
            a.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
            [],
            label,
          );
          audits.push({ label, violations: 0 });
        }
        await audit("shared landing");
        const playBounds = await page.locator("#play").boundingBox();
        assert(
          playBounds.y >= 0 && playBounds.y + playBounds.height < 650,
          "Listening controls precede the long diagram",
        );
        const rendered = [];
        for (let n = 0; n <= 6; n++) {
          const button = page.locator(`.step-buttons [data-step="${n}"]`);
          await button.focus();
          await page.keyboard.press("Space");
          assert.equal(await button.getAttribute("aria-pressed"), "true");
          assert.equal(await page.evaluate(() => document.activeElement.dataset.step), String(n));
          assert((await page.locator("#integer-title").innerText()).includes(`Step ${n}`));
          assert.equal(await page.locator(`tr[data-row="${n}"]`).getAttribute("class"), "selected");
          const pair = await page
            .locator(width === 375 ? "#route-phone" : "#route-wide")
            .evaluate((el) => {
              const center = (q) => {
                const r = q.querySelector("circle:not(.selection-ring)").getBoundingClientRect();
                return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
              };
              return [...el.querySelectorAll(".route-note")].map((g) => ({
                key: g.dataset.note,
                ...center(g),
              }));
            });
          const axis = width === 375 ? "y" : "x";
          const origin = pair.find((p) => p.key === "keyboard-0")[axis];
          const scale = (pair.find((p) => p.key === "keyboard-6")[axis] - origin) / 1200;
          for (const p of pair) {
            const [route, k] = p.key.split("-");
            const cents =
              route === "ratios" ? 1200 * Math.log2((9 / 8) ** Number(k)) : 200 * Number(k);
            assert(Math.abs(p[axis] - (origin + cents * scale)) < 0.05, `Rendered pitch ${p.key}`);
          }
          rendered.push({ step: n, pitchPoints: pair.length });
        }
        await page.locator('.step-buttons [data-step="6"]').click();
        for (const sound of ["compare", "beat", "walk", "control"]) {
          await page.selectOption("#sound", sound);
          await page.locator("#play").focus();
          const before = await page.evaluate(() => window.audioAudit.length);
          await page.keyboard.press("Space");
          await page.waitForFunction((count) => window.audioAudit.length > count, before);
          await page.waitForFunction(() => document.querySelectorAll(".sounding").length > 0);
          assert.equal(
            await page.evaluate(() => document.activeElement.id),
            "play",
            "Playback preserves focus",
          );
          await page.locator("#stop").click();
          const tones = await page.evaluate((start) => window.audioAudit.slice(start), before);
          assert.equal(tones.length, sound === "walk" ? 14 : 2);
          assert(
            tones.every((t) => t.stops.length === 2),
            "Stop cancels every scheduled oscillator",
          );
          if (sound === "control") assert.equal(tones[0].hz, tones[1].hz);
          if (sound === "beat") assert.notEqual(tones[0].hz, tones[1].hz);
          assert.equal(await page.locator(".sounding").count(), 0);
        }
        await page.evaluate(() => {
          window.delayResume = true;
        });
        const pendingBefore = await page.evaluate(() => window.audioAudit.length);
        await page.locator("#play").click();
        await page.locator("#stop").click();
        await page.waitForTimeout(500);
        assert.equal(await page.evaluate(() => window.audioAudit.length), pendingBefore);
        await page.evaluate(() => {
          window.delayResume = false;
        });
        await page.selectOption("#sound", "beat");
        await page.locator("#play").click();
        await page.waitForFunction(() =>
          document.querySelector("#play-status").textContent.startsWith("Finished"),
        );
        assert.equal(await page.locator(".sounding").count(), 0);
        assert(await page.locator("#stop").isDisabled());
        for (let p = 0; p < 4; p++) {
          await page.locator(`[data-passage="${p}"]`).focus();
          await page.keyboard.press("Space");
          assert.equal(
            await page.locator(`[data-passage="${p}"]`).getAttribute("aria-pressed"),
            "true",
          );
          assert((await page.locator(".greek-line").innerText()).length > 20);
        }
        for (const p of pages) {
          await page.selectOption("#source-page", String(p));
          await page.locator("#source-image").evaluate((img) => img.decode());
          assert(
            (await page.locator("#source-link").getAttribute("href")).endsWith(`menge-${p}.jpg`),
          );
        }
        for (let w = 0; w < 4; w++) await page.locator(`[data-word="${w}"]`).click();
        await page.locator("#inspect-number").click();
        assert.equal(await page.locator("#source-page").inputValue(), "171");
        assert.equal(await page.evaluate(() => document.activeElement.id), "reading-title");
        await audit("source reader and vocabulary");
        await page.locator(".canon-packet summary").click();
        for (const img of await page.locator(".canon-packet img").all()) {
          await img.scrollIntoViewIfNeeded();
          await img.evaluate((i) => i.decode());
        }
        await audit("complete source packet");
        await page.locator(".canon-packet summary").click();
        for (const root of width === 1440 ? [110, 220, 440] : [220])
          for (const step of width === 1440 ? [0, 1, 2, 3, 4, 5, 6] : [6])
            for (const sound of width === 1440
              ? ["compare", "beat", "walk", "control"]
              : ["beat"]) {
              await page.selectOption("#root", String(root));
              await page.locator(`.step-buttons [data-step="${step}"]`).click();
              await page.selectOption("#sound", sound);
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
                root,
                step,
                sound,
                file,
                bytes: bytes.length,
                sha256: hash(bytes),
              });
            }
        await page.selectOption("#root", "220");
        await page.locator('.step-buttons [data-step="6"]').click();
        await page.selectOption("#sound", "beat");
        await page.locator('[data-passage="2"]').click();
        await page.selectOption("#source-page", "174");
        const [csvDownload] = await Promise.all([
          page.waitForEvent("download"),
          page.locator("#csv").click(),
        ]);
        const csvPath = path.join(directory, `${engineName}-${width}-numbers.csv`);
        await csvDownload.saveAs(csvPath);
        const csv = (await readFile(csvPath, "utf8")).trim().split("\n");
        assert.equal(csv.length, 8);
        assert(csv[7].startsWith("6,Η,531441,531441/262144,446.00303649902344,440,"));
        const [saved] = await Promise.all([
          page.waitForEvent("download"),
          page.locator("#study").click(),
        ]);
        const studyPath = path.resolve(directory, `${engineName}-${width}-reading.html`);
        await saved.saveAs(studyPath);
        await page.locator("#share").click();
        await page.waitForFunction(() =>
          /Copied|Copy this reading link/.test(document.querySelector("#save-status").textContent),
        );
        const sharedUrl = page.url();
        await page.goto(sharedUrl);
        assert.equal(await page.locator("#sound").inputValue(), "beat");
        assert.equal(await page.locator("#source-page").inputValue(), "174");
        assert.equal(await page.locator('[data-passage="2"]').getAttribute("aria-pressed"), "true");
        if (engineName === "chromium") {
          await page.locator("#canon").scrollIntoViewIfNeeded();
          await page
            .locator("#canon")
            .screenshot({ path: path.join(directory, `assets/canon-${width}.png`) });
          await page.locator("#reading").evaluate((el) => el.scrollIntoView({ block: "start" }));
          await page.screenshot({
            path: path.join(directory, `assets/canon-reading-${width}.png`),
          });
        }
        const before = rejected;
        available = false;
        await page.reload();
        await page.waitForFunction(() =>
          document.querySelector("#offline-status").textContent.startsWith("Ready offline"),
        );
        assert(rejected > before, "Origin rejected navigation");
        const cachedHashes = await page.evaluate(async () =>
          Promise.all(
            [170, 171, 172, 173, 174, 175].map(async (p) => {
              const b = await (await fetch(`./sources/canon/menge-${p}.jpg`)).arrayBuffer();
              return [...new Uint8Array(await crypto.subtle.digest("SHA-256", b))]
                .map((n) => n.toString(16).padStart(2, "0"))
                .join("");
            }),
          ),
        );
        assert.deepEqual(cachedHashes, sourceHashes);
        await page.goto(base);
        await page.locator("[data-genus=enharmonic]").click();
        assert.equal(
          await page.locator("[data-genus=enharmonic]").getAttribute("aria-pressed"),
          "true",
        );
        const sixLink = page.locator('nav a[href="./canon.html"]');
        await sixLink.focus();
        await page.keyboard.press("Enter");
        await page.locator("#play").click();
        await page.waitForFunction(() => document.querySelectorAll(".sounding").length > 0);
        await page.locator("#stop").click();
        await page.locator('nav a[href="./song.html"]').click();
        await page.waitForSelector("[data-syllable]");
        assert.equal(await page.locator("[data-syllable]").count(), 5);
        await page.locator('[data-verse="3"]').click();
        await page.locator('[data-syllable="28"]').click();
        assert.equal(await page.locator("#syllable-table tr").count(), 3);
        await page.locator('nav a[href="./canon.html"]').click();
        const [offlineSaved] = await Promise.all([
          page.waitForEvent("download"),
          page.locator("#study").click(),
        ]);
        const offlineStudyPath = path.join(directory, `${engineName}-${width}-offline.html`);
        await offlineSaved.saveAs(offlineStudyPath);
        assert((await readFile(offlineStudyPath, "utf8")).includes("data:font/ttf;base64,"));
        assert.deepEqual(errors, []);
        assert.deepEqual(external, []);
        const standalone = await context.newPage(),
          requests = [];
        standalone.on("request", (r) => {
          if (!r.url().startsWith("file:") && !r.url().startsWith("data:")) requests.push(r.url());
        });
        await standalone.goto(`file://${studyPath}`);
        await standalone.evaluate(() => document.fonts.ready);
        const embeddedHashes = await standalone
          .locator(".study-scan img")
          .evaluateAll(async (imgs) =>
            Promise.all(
              imgs.map(async (img) => {
                await img.decode();
                const b = Uint8Array.from(atob(img.src.split(",")[1]), (s) => s.charCodeAt(0));
                return [...new Uint8Array(await crypto.subtle.digest("SHA-256", b))]
                  .map((n) => n.toString(16).padStart(2, "0"))
                  .join("");
              }),
            ),
          );
        assert.deepEqual(embeddedHashes, sourceHashes);
        assert.deepEqual(requests, []);
        assert(
          await standalone.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        );
        assert.equal(await standalone.locator(".study-passage").count(), 4);
        assert((await standalone.locator("body").innerText()).includes("446.003036"));
        if (engineName === "chromium" && width === 1440)
          await standalone.pdf({
            path: path.join(directory, "canon-reading.pdf"),
            format: "A4",
            printBackground: true,
          });
        report.configurations.push({
          browser: engineName,
          version: browser.version(),
          width,
          sharedLandingY: landing.y,
          accessibility: audits,
          renderedPitchChecks: rendered,
          allFourSoundsCancelled: true,
          pendingResumeCancelled: true,
          playbackFinishes: true,
          sourcePageHashes: cachedHashes,
          standaloneSourceHashes: embeddedHashes,
          standaloneSha256: hash(await readFile(studyPath)),
          offlineThreeRoomNavigation: true,
          offlineIllustratedExport: true,
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
    `Reviewed ${report.configurations.length} browser/viewport workflows and ${report.audio.length} native WAV exports.`,
  );
} catch (error) {
  await writeFile(
    path.join(directory, "partial.json"),
    `${JSON.stringify({ ...report, incomplete: true }, null, 2)}\n`,
  );
  throw error;
} finally {
  server.close();
}
