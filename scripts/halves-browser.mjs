import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const out = path.resolve(process.argv[2] ?? "/tmp/pyknon-halves-review"),
  hosted = process.argv[3];
if (hosted) assert.match(hosted, /^https:\/\/.+\/$/);
await mkdir(out, { recursive: true });
const sha = (b) => createHash("sha256").update(b).digest("hex");
const manifest = JSON.parse(await readFile("public/sources/halves/manifest.json", "utf8"));
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
        .locator("#hf-save-status")
        .textContent()
        .catch(() => "local file")}; ${error}`,
    );
  }
  assert.equal(await d.failure(), null);
  await d.saveAs(file);
  return readFile(file);
}
const instrumentation = () => {
  window.__blobs = new Map();
  const create = URL.createObjectURL.bind(URL);
  URL.createObjectURL = (b) => {
    const u = create(b);
    window.__blobs.set(u, b);
    return u;
  };
  window.__starts = [];
  const start = OscillatorNode.prototype.start;
  OscillatorNode.prototype.start = function (t) {
    window.__starts.push({
      hz: this.frequency.value,
      start: t,
      context: this.context.constructor.name,
    });
    return start.call(this, t);
  };
  const resume = AudioContext.prototype.resume;
  window.__hold = false;
  AudioContext.prototype.resume = function () {
    return window.__hold
      ? new Promise((resolve, reject) => {
          window.__release = () => resume.call(this).then(resolve, reject);
        })
      : resume.call(this);
  };
};
async function verified(page, pdf) {
  await page.locator("#hf-page").selectOption(String(pdf));
  await poll(
    async () => /Verified complete/.test(await page.locator("#hf-source-status").textContent()),
    "Complete source verified",
  );
  const data = await page
    .locator("#hf-source-image")
    .evaluate(async (im) => [
      ...new Uint8Array(await window.__blobs.get(im.currentSrc).arrayBuffer()),
    ]);
  assert.equal(sha(Buffer.from(data)), manifest.pages.find((p) => p.pdfPage === pdf).sha256);
  assert.match(
    await page.locator("#hf-source-image").getAttribute("alt"),
    new RegExp(`PDF p.${pdf}`),
  );
}
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const width of [1440, 375]) {
      const local = hosted ? null : await serve(),
        base = hosted ?? local.base,
        context = await browser.newContext({
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
        console.log(`${prefix} begin`);
        await page.goto(base);
        await page.getByRole("link", { name: "Three middles", exact: true }).click();
        await page.locator("#bench-title").waitFor();
        await verified(page, 220);
        assert.match(await page.locator("#hf-result").textContent(), /First 17\/16; second 18\/17/);
        async function sample(label) {
          const json = await save(
              page,
              '[data-hf-save="json"]',
              path.join(folder, `${label}.json`),
            ),
            state = JSON.parse(json).state;
          await save(page, '[data-hf-save="csv"]', path.join(folder, `${label}.csv`));
          record.samples.push({
            label,
            state,
            csv: `${prefix}/${label}.csv`,
            result: await page.locator("#hf-result").textContent(),
            equation: await page.locator("#hf-equation").textContent(),
          });
        }
        await sample("initial");
        for (const method of ["frequency", "length", "ratio"]) {
          await page.locator(`[data-hf-method="${method}"]`).focus();
          await page.keyboard.press("Enter");
          assert.equal(
            await page.locator(`[data-hf-method="${method}"]`).getAttribute("aria-pressed"),
            "true",
          );
          await sample(method);
        }
        assert.match(await page.locator("#hf-result").textContent(), /ratios are equal/);
        await page.locator("#hf-reset").click();
        await page.locator("#hf-double").click();
        assert.equal(await page.locator("#hf-middle").inputValue(), "34");
        assert.match(await page.locator("#hf-result").textContent(), /First 17\/16; second 18\/17/);
        await sample("doubled");
        await page.locator("#hf-lower").click();
        await sample("below");
        await page.locator("#hf-upper").click();
        await sample("above");
        await page.locator("#hf-control").click();
        assert.match(await page.locator("#hf-result").textContent(), /ratios are equal/);
        await sample("control-469");
        await page.locator("#hf-source-example").click();
        assert.equal(await page.locator("#hf-middle").inputValue(), "10");
        assert.match(
          await page.locator("#hf-proof").textContent(),
          /least terms this ratio is \(3\+1\):3/,
        );
        await sample("source-9-12");
        await page.locator("#hf-interval").selectOption("custom");
        await page.locator("#hf-n").fill("64");
        await page.locator("#hf-n").press("Tab");
        await page.locator("#hf-scale").fill("256");
        await page.locator("#hf-scale").press("Tab");
        await page.locator("#hf-range").focus();
        await page.keyboard.press("ArrowLeft");
        assert.equal(
          await page.locator('[data-hf-method="integer"]').getAttribute("aria-pressed"),
          "true",
        );
        await sample("largest-scale");
        await page.locator("#hf-reset").click();
        for (let i = 0; i < 7; i++) {
          await page.locator("#hf-reading").selectOption(String(i));
          assert((await page.locator('#hf-passage [lang="grc"]').textContent()).length > 50);
          const words = page.locator("[data-hf-word]");
          for (let j = 0; j < (await words.count()); j++) {
            await words.nth(j).click();
            assert((await page.locator("#hf-word").textContent()).length > 20);
          }
          await page.locator("#hf-latin").click();
          await verified(
            page,
            manifest.pages.find((p) => p.pdfPage === [221, 221, 221, 221, 231, 233, 235][i])
              .pdfPage,
          );
        }
        for (const p of manifest.pages) await verified(page, p.pdfPage);
        await page.locator("#hf-enlarge").focus();
        await page.keyboard.press("Enter");
        await page.locator("#hf-zoom-in").click();
        await page.locator("#hf-zoom-in").click();
        await page.locator("#hf-pan").focus();
        await page.keyboard.press("ArrowRight");
        assert(await page.locator("#hf-pan").evaluate((e) => e.scrollLeft > 0));
        await page.keyboard.press("Escape");
        assert.equal(await page.locator("#hf-dialog").evaluate((e) => e.open), false);
        await page.locator("#hf-reset").click();
        await page.locator("#hf-play").click();
        await poll(
          () => page.evaluate(() => window.__starts.some((t) => t.context === "AudioContext")),
          "Live oscillator starts",
        );
        await page.locator("#hf-stop").click();
        assert.match(await page.locator("#hf-play-status").textContent(), /Stopped/);
        const starts = await page.evaluate(() => window.__starts.length);
        await page.evaluate(() => {
          window.__hold = true;
        });
        await page.locator("#hf-play").click();
        await poll(() => page.evaluate(() => !!window.__release), "Held resume");
        await page.locator('[data-hf-method="ratio"]').click();
        await page.evaluate(() => {
          window.__hold = false;
          window.__release();
        });
        await page.waitForTimeout(130);
        assert.equal(await page.evaluate(() => window.__starts.length), starts);
        await page.locator("#hf-reset").click();
        for (const sound of ["halves", "path", "together", "control"]) {
          await page.locator("#hf-sound").selectOption(sound);
          const state = JSON.parse(
            await save(page, '[data-hf-save="json"]', path.join(folder, `sound-${sound}.json`)),
          ).state;
          const raw = await save(page, '[data-hf-save="wav"]', path.join(folder, `${sound}.wav`));
          record.sounds.push({
            mode: sound,
            state,
            file: `${prefix}/${sound}.wav`,
            bytes: raw.length,
            sha256: sha(raw),
          });
        }
        await page.locator("#hf-sound").selectOption("halves");
        await sample("final");
        await save(page, '[data-hf-save="json"]', path.join(folder, "record.json"));
        await save(page, '[data-hf-save="svg"]', path.join(folder, "plate.svg"));
        await save(page, '[data-hf-save="html"]', path.join(folder, "reading.html"));
        const address = page.url();
        await page.locator("#hf-share").click();
        const link = await page.locator("#hf-share-link").inputValue();
        assert.match(link, /middle=17/);
        assert.equal(page.url(), address);
        const linked = await context.newPage();
        await linked.goto(link);
        assert.match(await linked.locator("#hf-result").textContent(), /First 17\/16/);
        await linked.close();
        await page.locator("#hf-control").click();
        await page.locator("#hf-import").setInputFiles(path.join(folder, "record.json"));
        await poll(
          async () => /experiment opened/.test(await page.locator("#hf-save-status").textContent()),
          "Import complete",
        );
        assert.match(await page.locator("#hf-result").textContent(), /First 17\/16/);
        await page.locator("#hf-import").setInputFiles({
          name: "bad.json",
          mimeType: "application/json",
          buffer: Buffer.from('{"format":"pyknon-halves","version":0}'),
        });
        await poll(
          async () => /Open failed/.test(await page.locator("#hf-save-status").textContent()),
          "Invalid import refused",
        );
        assert.match(await page.locator("#hf-result").textContent(), /First 17\/16/);
        await page.evaluate(async () => {
          await document.fonts.ready;
          scrollTo(0, 0);
          await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        });
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          false,
        );
        const axe = await new AxeBuilder({ page }).analyze();
        assert.deepEqual(
          axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
          [],
        );
        await page.screenshot({ path: path.join(folder, "workshop.png"), fullPage: true });
        await poll(
          async () => /Ready offline/.test(await page.locator("#offline-status").textContent()),
          "Matching controller and complete cache",
          60000,
        );
        const inventory = await page.evaluate(async () => {
          const k = (await caches.keys()).find((k) => k.startsWith("pyknon-"));
          return {
            key: k,
            paths: (await (await caches.open(k)).keys()).map((r) => new URL(r.url).pathname),
          };
        });
        assert.equal(inventory.key, `pyknon-${edition}`);
        assert.deepEqual(inventory.paths.sort(), [...files].sort());
        record.offlineEntries = inventory.paths.length;
        if (local) {
          local.offline();
          await assert.rejects(fetch(base));
        }
        await context.setOffline(true);
        await page.reload();
        await page.locator("#hf-result").waitFor();
        await verified(page, 220);
        await page.locator('[data-hf-method="length"]').click();
        assert.match(
          await page.locator("#hf-result").textContent(),
          /first frequency ratio is smaller/,
        );
        await verified(page, 235);
        await save(page, '[data-hf-save="html"]', path.join(folder, "offline-reading.html"));
        record.originStopped = !!local;
        record.browserOffline = true;
        assert.deepEqual(errors, []);
        assert.deepEqual(csp, []);
        const nativeContext = await browser.newContext({
          viewport: { width, height: 1000 },
          javaScriptEnabled: false,
          acceptDownloads: true,
        });
        await nativeContext.setOffline(true);
        const native = await nativeContext.newPage(),
          remote = [];
        native.on("request", (r) => {
          if (/^https?:/.test(r.url())) remote.push(r.url());
        });
        await native.goto(pathToFileURL(path.join(folder, "reading.html")).href);
        await poll(
          () => native.evaluate(() => [...document.fonts].every((f) => f.status === "loaded")),
          "Native embedded fonts",
        );
        assert.equal(await native.locator("script").count(), 0);
        assert.equal(await native.locator("img").count(), 9);
        assert(
          await native
            .locator("img")
            .evaluateAll((ims) => ims.every((i) => i.complete && i.naturalWidth > 1000)),
        );
        await native.locator("audio").evaluate((a) => a.load());
        await poll(
          () =>
            native.locator("audio").evaluate((a) => Number.isFinite(a.duration) && a.duration > 4),
          "Native audio metadata",
        );
        await native.screenshot({ path: path.join(folder, "reading.png"), fullPage: true });
        for (const ext of ["json", "csv", "svg", "wav"])
          await save(
            native,
            `a[download="pyknon-halves.${ext}"]`,
            path.join(folder, `native.${ext}`),
          );
        if (name === "chromium" && width === 1440)
          await native.pdf({ path: path.join(folder, "reading.pdf"), printBackground: true });
        assert.deepEqual(remote, []);
        await nativeContext.close();
        record.nativeJavaScript = false;
        record.accessibilityViolations = 0;
        record.pageErrors = errors;
        record.cspErrors = csp;
        report.configurations.push(record);
        console.log(`${prefix} complete`);
      } finally {
        await context.close();
        if (local) await local.close();
      }
    }
  } finally {
    await browser.close();
  }
}
assert.equal(report.configurations.length, 4);
await writeFile(path.join(out, "review.json"), `${JSON.stringify(report, null, 2)}\n`);
console.log(`Complete review: ${out}/review.json`);
