import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const out = path.resolve(process.argv[2] ?? "/tmp/pyknon-vina-review"),
  hosted = process.argv[3];
if (hosted) assert.match(hosted, /^https:\/\/.+\/$/);
await mkdir(out, { recursive: true });
const sha = (b) => createHash("sha256").update(b).digest("hex");
const manifest = JSON.parse(await readFile("public/sources/vina/manifest.json", "utf8"));
const worker = await readFile("dist/sw.js", "utf8"),
  edition = /const EDITION = "([a-f0-9]+)"/.exec(worker)[1];
const files = JSON.parse(/const FILES = (\[[^;]+\]);/.exec(worker)[1]);
const report = {
  checkedAt: new Date().toISOString(),
  edition,
  scope: hosted
    ? "Actual public origin; browser networking disabled for offline reload"
    : "Local production; actual origin stopped and browser networking disabled",
  base: hosted ?? null,
  configurations: [],
  adversarial: [],
};
async function serve() {
  let online = true;
  const server = createServer(async (req, res) => {
    if (!online) {
      req.socket.destroy();
      return;
    }
    try {
      const name =
        new URL(req.url, "http://localhost").pathname.replace(/^\/pyknon\//, "") || "index.html";
      assert(!name.includes(".."));
      const bytes = await readFile(path.join("dist", name));
      res
        .writeHead(200, {
          "cache-control": "no-store",
          "content-type":
            {
              ".html": "text/html",
              ".js": "text/javascript",
              ".css": "text/css",
              ".json": "application/json",
              ".jpg": "image/jpeg",
              ".woff2": "font/woff2",
              ".ttf": "font/ttf",
            }[path.extname(name)] ?? "application/octet-stream",
        })
        .end(bytes);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return {
    base: `http://127.0.0.1:${server.address().port}/pyknon/`,
    offline() {
      online = false;
      server.closeAllConnections();
    },
    async close() {
      server.closeAllConnections();
      await new Promise((r) => server.close(r));
    },
  };
}
async function poll(predicate, message, timeout = 30000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    if (await predicate()) return;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw Error(message);
}
let lastSaveAt = 0;
async function save(page, selector, file) {
  const delay = 220 - (Date.now() - lastSaveAt);
  if (delay > 0) await new Promise((r) => setTimeout(r, delay));
  lastSaveAt = Date.now();
  let d;
  try {
    [d] = await Promise.all([
      page.waitForEvent("download", { timeout: 20000 }),
      page.locator(selector).click(),
    ]);
  } catch (error) {
    await page.screenshot({ path: `${file}.failure.png` });
    throw Error(
      `Download ${selector} failed at ${page.url()}; status: ${await page
        .locator("#vn-save-status")
        .textContent()
        .catch(() => "local file")}; ${error}`,
    );
  }
  assert.equal(await d.failure(), null);
  await d.saveAs(file);
  return readFile(file);
}
async function verified(page, id) {
  await page.locator("#vn-page").selectOption(id);
  await poll(
    () =>
      page
        .locator("#vn-source-status")
        .textContent()
        .then((x) => x.startsWith("Verified")),
    `Source ${id} did not verify`,
  );
  const bytes = await page
    .locator("#vn-source-image")
    .evaluate(async (im) => [
      ...new Uint8Array(await window.__vinaBlobs.get(im.currentSrc).arrayBuffer()),
    ]);
  const expected = manifest.pages.find((p) => p.id === id);
  assert.equal(sha(Buffer.from(bytes)), expected.sha256);
  assert.equal(
    await page.locator("#vn-source-image").getAttribute("alt"),
    `Grosset 1888 · ${expected.printedPage === "title" ? "music study title" : `printed p.${expected.printedPage}`} · PDF p.${expected.pdfPage}. Complete public-domain page; apparatus and scan marks retained.`,
  );
}
const instrumentation = () => {
  window.__vinaBlobs = new Map();
  const create = URL.createObjectURL.bind(URL);
  URL.createObjectURL = (blob) => {
    const url = create(blob);
    window.__vinaBlobs.set(url, blob);
    return url;
  };
  window.__starts = [];
  const start = OscillatorNode.prototype.start;
  OscillatorNode.prototype.start = function (when) {
    window.__starts.push({
      hz: this.frequency.value,
      start: when,
      context: this.context.constructor.name,
    });
    return start.call(this, when);
  };
  const resume = AudioContext.prototype.resume;
  window.__holdResume = false;
  window.__releaseResume = undefined;
  AudioContext.prototype.resume = function () {
    return window.__holdResume
      ? new Promise((resolve, reject) => {
          window.__releaseResume = () => resume.call(this).then(resolve, reject);
        })
      : resume.call(this);
  };
};
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  if (process.env.VINA_ENGINE && process.env.VINA_ENGINE !== name) {
    report.partial = true;
    continue;
  }
  const browser = await engine.launch();
  try {
    for (const width of [1440, 375]) {
      if (process.env.VINA_WIDTH && Number(process.env.VINA_WIDTH) !== width) {
        report.partial = true;
        continue;
      }
      const local = hosted ? null : await serve(),
        base = hosted ?? local.base;
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        acceptDownloads: true,
      });
      await context.addInitScript(instrumentation);
      const page = await context.newPage(),
        errors = [],
        csp = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("console", (m) => {
        if (m.type() === "error" && /Content Security|violates.*directive/.test(m.text()))
          csp.push(m.text());
      });
      const prefix = `${name}-${width}`,
        folder = path.join(out, prefix);
      await mkdir(folder, { recursive: true });
      const record = { engine: name, version: browser.version(), width, samples: [], sounds: [] };
      try {
        await page.goto(base);
        await page.getByRole("link", { name: "Two vinas", exact: true }).click();
        await page.locator("#vn-title").waitFor();
        await verified(page, "29");
        async function sample(label) {
          console.log(`${prefix} ${label}`);
          const json = await save(page, "#vn-save-json", path.join(folder, `${label}.json`));
          const state = JSON.parse(json).state;
          const csv = await save(page, "#vn-save-csv", path.join(folder, `${label}.csv`));
          assert(csv.length > 100);
          const selector = width > 560 ? "#vn-drawing" : "#vn-phone-drawing";
          const geometry = await page.locator(`${selector} [data-vn-note]`).evaluateAll(
            (nodes, phone) =>
              nodes.map((g) => ({
                row: g.dataset.vnNote.split("-")[0],
                note: Number(g.dataset.vnNote.split("-")[1]),
                cents: Number(g.dataset.cents),
                hz: Number(g.dataset.hz),
                coordinate: Number(g.querySelector("circle").getAttribute(phone ? "cy" : "cx")),
                phone,
              })),
            width <= 560,
          );
          record.samples.push({ label, state, csv: `${prefix}/${label}.csv`, geometry });
        }
        await sample("initial");
        for (const i of [0, 1, 2, 3, 4]) {
          await page.locator(`[data-vn-stage="${i}"]`).focus();
          await page.keyboard.press("Enter");
          const expected = [7, 0, 2, 2, 3][i];
          assert.equal(
            await page
              .locator(`${width > 560 ? "#vn-drawing" : "#vn-phone-drawing"} [data-vn-match]`)
              .count(),
            expected,
          );
          await sample(`stage-${i}`);
          await page.locator("#vn-read-stage").click();
          assert(
            await page.locator("#vn-reading-title").evaluate((e) => e === document.activeElement),
          );
        }
        await page.locator("#vn-position").evaluate((e) => {
          e.value = "1500";
          e.dispatchEvent(new Event("input", { bubbles: true }));
        });
        await sample("between");
        await page.locator('[data-vn-stage="2"]').click();
        await page.locator("#vn-change").click();
        assert.match(await page.locator("#vn-validity").textContent(), /50\.98/);
        await sample("other-preparation");
        await page.locator("#vn-tuning").selectOption("boundary");
        assert.match(await page.locator("#vn-validity").textContent(), /merge/);
        await sample("boundary");
        await page.locator("#vn-tuning").selectOption("zero");
        assert.match(await page.locator("#vn-validity").textContent(), /vanishes/);
        await sample("zero");
        await page.locator("#vn-fail").click();
        assert.match(await page.locator("#vn-validity").textContent(), /reverses direction/);
        await sample("reversed");
        await page.locator('[data-vn-stage="3"]').click();
        await sample("reversed-third");
        await page.locator("#vn-tuning").selectOption("quarter");
        await page.locator('[data-vn-stage="4"]').click();
        await page.locator("#vn-root").selectOption("110");
        await page.locator("#vn-position").focus();
        await page.keyboard.press("ArrowLeft");
        assert.equal(await page.locator("#vn-position").inputValue(), "3999");
        await page.keyboard.press("ArrowRight");
        const before = page.url();
        await page.locator('[data-vn-select="6"]').click();
        await page.goBack();
        assert.equal(page.url(), before);
        assert.equal(
          await page.locator('[data-vn-select="0"]').getAttribute("aria-pressed"),
          "true",
        );
        for (let i = 0; i < 9; i++) {
          await page.locator("#vn-reading-choice").selectOption(String(i));
          assert((await page.locator("#vn-reading-text").textContent()).length > 100);
          await page.locator("#vn-find-reading").click();
          await poll(
            () =>
              page
                .locator("#vn-source-status")
                .textContent()
                .then((t) => t.startsWith("Verified")),
            "Reading source",
          );
        }
        for (const p of manifest.pages) await verified(page, p.id);
        for (let i = 0; i < 12; i++) {
          await page.locator(`[data-vn-word="${i}"]`).click();
          assert((await page.locator("#vn-word-note").textContent()).length > 60);
        }
        await page.locator("#vn-zoom").focus();
        await page.keyboard.press("End");
        assert.equal(await page.locator("#vn-zoom").inputValue(), "400");
        await page.locator("#vn-pan").focus();
        await page.keyboard.press("ArrowRight");
        await poll(
          () => page.locator("#vn-pan").evaluate((e) => e.scrollLeft > 0),
          "Keyboard source panning",
        );
        await page.locator("#vn-zoom").focus();
        await page.keyboard.press("Home");
        await page.locator("#vn-reading-choice").selectOption("5");
        await page.locator("#vn-find-reading").click();
        await page.locator("#vn-play").click();
        await poll(() => page.locator("#vn-stop").isEnabled(), "Stop enabled");
        await page.locator("#vn-stop").click();
        assert.match(await page.locator("#vn-play-status").textContent(), /stopped/);
        const started = await page.evaluate(() => window.__starts.length);
        await page.evaluate(() => {
          window.__holdResume = true;
        });
        await page.locator("#vn-play").click();
        await poll(() => page.evaluate(() => !!window.__releaseResume), "Pending resume reached");
        await page.locator("#vn-stop").click();
        await page.evaluate(() => {
          window.__holdResume = false;
          window.__releaseResume();
        });
        await page.waitForTimeout(130);
        assert.equal(await page.evaluate(() => window.__starts.length), started);
        for (const sound of ["pair", "fixed", "moving", "compare"]) {
          await page.locator("#vn-sound").selectOption(sound);
          const state = JSON.parse(
            await save(page, "#vn-save-json", path.join(folder, `sound-${sound}.json`)),
          ).state;
          const data = await save(page, "#vn-save-wav", path.join(folder, `${sound}.wav`));
          record.sounds.push({
            mode: sound,
            state,
            file: `${prefix}/${sound}.wav`,
            bytes: data.length,
            sha256: sha(data),
          });
        }
        await sample("final");
        const nativeRecord = await save(page, "#vn-save-json", path.join(folder, "record.json"));
        const nativeSvg = await save(page, "#vn-save-svg", path.join(folder, "plate.svg"));
        const nativeHtml = await save(page, "#vn-save-html", path.join(folder, "reading.html"));
        assert(!nativeHtml.includes(Buffer.from("<script")));
        await page.locator("#vn-import").setInputFiles({
          name: "comparison.json",
          mimeType: "application/json",
          buffer: nativeRecord,
        });
        await poll(
          () =>
            page
              .locator("#vn-save-status")
              .textContent()
              .then((t) => t.includes("reopened")),
          "Native JSON import completed",
        );
        assert.match(await page.locator("#vn-save-status").textContent(), /reopened/);
        const address = page.url();
        await page.locator("#vn-import").setInputFiles({
          name: "wrong.json",
          mimeType: "application/json",
          buffer: Buffer.from('{"format":"unknown","state":{}}'),
        });
        await poll(
          () =>
            page
              .locator("#vn-save-status")
              .textContent()
              .then((t) => t.includes("Unknown")),
          "Invalid JSON refused",
        );
        assert.equal(page.url(), address);
        assert.match(await page.locator("#vn-save-status").textContent(), /Unknown/);
        await page.locator("#vn-share").click();
        let shared = await page.locator("#vn-save-status").textContent();
        if (shared.startsWith("Copy this comparison link: "))
          shared = shared.slice("Copy this comparison link: ".length);
        else shared = `${page.url().split("#")[0]}#vn-bench`;
        const copy = await context.newPage();
        await copy.goto(shared);
        await copy.locator("#vn-title").waitFor();
        assert.match(await copy.locator("#vn-pair").textContent(), /97\.7778 Hz/);
        await copy.close();
        const violations = (
          await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()
        ).violations.filter((v) => ["serious", "critical"].includes(v.impact));
        assert.deepEqual(
          violations.map((v) => v.id),
          [],
        );
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        await page.locator("#vn-bench").scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(folder, "workshop.png"), fullPage: true });
        await page.locator("#vn-reading").scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(folder, "reading-source.png") });
        const localContext = await browser.newContext({
          viewport: { width, height: 1000 },
          javaScriptEnabled: false,
          acceptDownloads: true,
        });
        await localContext.setOffline(true);
        const saved = await localContext.newPage(),
          requests = [];
        saved.on("request", (r) => {
          if (/^https?:/.test(r.url())) requests.push(r.url());
        });
        await saved.goto(pathToFileURL(path.join(folder, "reading.html")).href);
        await poll(
          () =>
            saved.evaluate(
              () =>
                document.fonts.status === "loaded" &&
                [...document.images].every((i) => i.complete && i.naturalWidth > 0),
            ),
          "Local reading images/fonts",
        );
        assert.equal(await saved.locator("img").count(), 8);
        assert.equal(await saved.locator(".reading").count(), 9);
        const embeddedJson = await save(
          saved,
          'a[download="pyknon-two-vinas.json"]',
          path.join(folder, "embedded.json"),
        );
        assert.deepEqual(embeddedJson, nativeRecord);
        const embeddedCsv = await save(
          saved,
          'a[download="pyknon-two-vinas.csv"]',
          path.join(folder, "embedded.csv"),
        );
        assert.deepEqual(embeddedCsv, await readFile(path.join(folder, "final.csv")));
        const embeddedWav = await save(
          saved,
          'a[download="pyknon-two-vinas.wav"]',
          path.join(folder, "embedded.wav"),
        );
        assert.deepEqual(embeddedWav, await readFile(path.join(folder, "compare.wav")));
        await saved.locator("audio").click();
        await saved.evaluate(() => {
          document
            .querySelector("audio")
            .play()
            .catch(() => {});
        });
        await poll(
          () => saved.evaluate(() => !document.querySelector("audio").paused),
          "Native saved audio playback",
        );
        await saved.evaluate(() => {
          document.querySelector("audio").pause();
        });
        if (name === "chromium" && width === 1440)
          await saved.pdf({
            path: path.join(folder, "reading.pdf"),
            format: "A4",
            printBackground: true,
            preferCSSPageSize: true,
          });
        await saved.goto(pathToFileURL(path.join(folder, "plate.svg")).href);
        await poll(
          () => saved.evaluate(() => document.fonts.status === "loaded"),
          "Local SVG font",
        );
        assert.deepEqual(requests, []);
        await localContext.close();
        await poll(
          () =>
            page
              .locator("#offline-status")
              .textContent()
              .then((t) => t.startsWith("Ready offline")),
          "Complete edition ready",
          60000,
        );
        const cache = await page.evaluate(async () => {
          const keys = await caches.keys();
          const key = keys.find((k) => k.startsWith("pyknon-"));
          return {
            keys,
            urls: (await (await caches.open(key)).keys())
              .map((r) => new URL(r.url).pathname)
              .sort(),
          };
        });
        assert.deepEqual(cache.urls, files.toSorted());
        local?.offline();
        await context.setOffline(true);
        await page.reload();
        await poll(
          () =>
            page
              .locator("#offline-status")
              .textContent()
              .then((t) => t.startsWith("Ready offline")),
          "Offline reload",
        );
        await verified(page, "28");
        await page.locator('[data-vn-stage="2"]').click();
        const offlineHtml = await save(page, "#vn-save-html", path.join(folder, "offline.html"));
        assert(offlineHtml.length > 1000000);
        const visited = [];
        for (const room of [
          "index.html",
          "song.html",
          "canon.html",
          "trial.html",
          "rhythm.html",
          "tension.html",
          "vina.html",
        ]) {
          await page.goto(base + room);
          await poll(
            () =>
              page
                .locator("#offline-status")
                .textContent()
                .then((t) => t.startsWith("Ready offline")),
            `Offline room ${room}`,
          );
          visited.push(room);
        }
        assert.deepEqual(errors, []);
        assert.deepEqual(csp, []);
        Object.assign(record, {
          sourcePages: 8,
          readings: 9,
          wordNotes: 12,
          keyboardPanning: true,
          delayedResumeCancelled: true,
          actualMediaPlaybackFromSavedFile: true,
          nativeHtmlBytes: nativeHtml.length,
          nativeHtmlSha256: sha(nativeHtml),
          nativeSvgBytes: nativeSvg.length,
          scriptDisabledNativeFiles: true,
          completeCacheFiles: cache.urls.length,
          offlineRooms: visited,
          seriousOrCriticalAxe: violations.length,
          pageErrors: errors,
          cspErrors: csp,
        });
        report.configurations.push(record);
        console.log(
          `${name} ${width}: model controls, actual source bytes, sound/native files and seven rooms offline passed`,
        );
      } finally {
        await context.close();
        await local?.close();
      }
    }
  } finally {
    await browser.close();
  }
}
await writeFile(path.join(out, "review.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Review: ${path.join(out, "review.json")}`);
