import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const out = path.resolve(process.argv[2] ?? "/tmp/pyknon-tension-review"),
  hosted = process.argv[3];
if (hosted) assert.match(hosted, /^https:\/\/.+\/$/);
await mkdir(out, { recursive: true });
const hash = (b) => createHash("sha256").update(b).digest("hex"),
  manifest = JSON.parse(await readFile("src/tension-sources.json", "utf8"));
const worker = await readFile("dist/sw.js", "utf8"),
  edition = /const EDITION = "([a-f0-9]+)"/.exec(worker)[1],
  cachedFiles = JSON.parse(/const FILES = (\[[^;]+\]);/.exec(worker)[1]);
async function serve() {
  let online = true;
  const server = createServer(async (req, res) => {
    if (!online) {
      req.socket.destroy();
      return;
    }
    try {
      const file =
        new URL(req.url, "http://local").pathname.replace(/^\/pyknon\//, "") || "index.html";
      assert(!file.includes(".."));
      const bytes = await readFile(path.join("dist", file));
      res
        .writeHead(200, {
          "cache-control": "no-store",
          "content-type":
            {
              ".html": "text/html",
              ".js": "text/javascript",
              ".css": "text/css",
              ".jpg": "image/jpeg",
              ".json": "application/json",
              ".woff2": "font/woff2",
              ".ttf": "font/ttf",
            }[path.extname(file)] ?? "application/octet-stream",
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
async function save(page, selector, file) {
  const pending = page.waitForEvent("download");
  await page.locator(selector).click();
  const download = await pending;
  assert.equal(await download.failure(), null);
  await download.saveAs(file);
  return readFile(file);
}
async function ready(page) {
  await page
    .locator("#offline-status")
    .filter({ hasText: /Ready offline.*six rooms/ })
    .waitFor({ timeout: 60000 });
}
async function scan(page, id) {
  await page.locator("#ts-page").selectOption(id);
  await page
    .locator("#ts-source-status")
    .filter({ hasText: /page verified/ })
    .waitFor();
  assert.match(
    await page.locator("#ts-source-caption").textContent(),
    new RegExp(`p\\.${manifest.pages.find((p) => p.id === id).printedPage},`),
  );
  const actual = await page
    .locator("#ts-scan")
    .evaluate(async (img) => [
      ...new Uint8Array(await window.tensionBlobs.get(img.currentSrc).arrayBuffer()),
    ]);
  assert.equal(hash(Buffer.from(actual)), manifest.pages.find((p) => p.id === id).sha256);
}
async function fits(page) {
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    "No horizontal page overflow",
  );
}
const report = {
  checkedAt: new Date().toISOString(),
  scope: hosted
    ? "Actual public origin, browser-network offline checks; public origin remains running"
    : "Local production, disabled browser networking and stopped local origin",
  base: hosted ?? null,
  edition,
  workerSha256: hash(Buffer.from(worker)),
  cachedFiles: cachedFiles.length,
  configurations: [],
};
for (const [name, launcher] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await launcher.launch();
  try {
    for (const width of [1440, 375]) {
      const dir = path.join(out, `${name}-${width}`);
      await mkdir(dir, { recursive: true });
      const server = hosted ? null : await serve(),
        base = hosted ?? server.base;
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        acceptDownloads: true,
      });
      const errors = [];
      try {
        await context.addInitScript(() => {
          window.tensionBlobs = new Map();
          const makeUrl = URL.createObjectURL;
          URL.createObjectURL = (blob) => {
            const url = makeUrl.call(URL, blob);
            window.tensionBlobs.set(url, blob);
            return url;
          };
          const revokeUrl = URL.revokeObjectURL;
          URL.revokeObjectURL = (url) => {
            window.tensionBlobs.delete(url);
            return revokeUrl.call(URL, url);
          };
          window.tensionAudio = [];
          const create = AudioContext.prototype.createOscillator;
          AudioContext.prototype.createOscillator = function (...args) {
            const o = create.apply(this, args),
              r = { hz: null, start: null, stops: [] },
              set = o.frequency.setValueAtTime,
              start = o.start,
              stop = o.stop;
            o.frequency.setValueAtTime = function (...a) {
              r.hz = a[0];
              return set.apply(this, a);
            };
            o.start = function (...a) {
              r.start = a[0];
              return start.apply(this, a);
            };
            o.stop = function (...a) {
              r.stops.push(a[0]);
              return stop.apply(this, a);
            };
            window.tensionAudio.push(r);
            return o;
          };
        });
        const page = await context.newPage();
        page.on("pageerror", (e) => errors.push(e.message));
        await page.goto(`${base}tension.html#weights`);
        await ready(page);
        await scan(page, "jan-247");
        await fits(page);
        assert.match(await page.locator("#ts-result").textContent(), /600.00 cents below/);
        await page.locator("#ts-weight").focus();
        await page.keyboard.press("ArrowRight");
        assert.equal(await page.locator("#ts-exact").inputValue(), "49/4");
        await page.goBack();
        assert.equal(await page.locator("#ts-exact").inputValue(), "12");
        await page.locator("#ts-exact").fill("24");
        await page.locator("#ts-weight-form button").click();
        assert.match(await page.locator("#ts-result").textContent(), /Exact ratio reached/);
        assert.match(await page.locator("#ts-target").textContent(), /Source|source 12 against 6/);
        await page.locator("#ts-exact").fill("31");
        await page.locator("#ts-weight-form button").click();
        assert.match(await page.locator("#ts-input-error").textContent(), /6 to 30/);
        assert.match(await page.locator("#ts-result").textContent(), /Exact ratio reached/);
        await page.locator("#ts-restore").click();
        assert.equal(await page.locator("#ts-exact").inputValue(), "12");
        const sounds = [];
        for (const mode of ["claim", "original", "yours", "compare", "together"]) {
          await page.locator("#ts-sound").selectOption(mode);
          await page.evaluate(() => {
            window.tensionAudio = [];
          });
          await page.locator("#ts-play").click();
          await page.waitForFunction(() => window.tensionAudio.length >= 2);
          const nodes = await page.evaluate(() => window.tensionAudio);
          await page.locator("#ts-stop").click();
          assert(await page.locator("#ts-stop").isDisabled());
          const bytes = await save(page, "#ts-save-wav", path.join(dir, `${mode}.wav`));
          sounds.push({
            mode,
            root: 220,
            weights: [6, 8, 9, 12],
            selected: 3,
            nodes,
            file: `${mode}.wav`,
            bytes: bytes.length,
            sha256: hash(bytes),
          });
        }
        await page.locator('[data-ts-note="1"]').click();
        await page.locator("#ts-exact").fill("32/3");
        await page.locator("#ts-weight-form button").click();
        assert.match(await page.locator("#ts-result").textContent(), /Exact ratio reached/);
        assert.match(await page.locator("#ts-target").textContent(), /source 8 against 6/);
        await page.locator("#ts-sound").selectOption("together");
        await page.locator("#ts-root").selectOption("110");
        const repairWav = await save(page, "#ts-save-wav", path.join(dir, "repaired.wav"));
        sounds.push({
          mode: "together",
          root: 110,
          weights: [6, 32 / 3, 9, 12],
          selected: 1,
          file: "repaired.wav",
          bytes: repairWav.length,
          sha256: hash(repairWav),
        });
        for (let i = 0; i < 8; i++) {
          await page.locator("#ts-passage").selectOption(String(i));
          await page.locator("#ts-greek-page").click();
          await page
            .locator("#ts-source-status")
            .filter({ hasText: /page verified/ })
            .waitFor();
          await page.locator("#ts-latin-page").click();
          await page
            .locator("#ts-source-status")
            .filter({ hasText: /page verified/ })
            .waitFor();
        }
        for (const p of manifest.pages) await scan(page, p.id);
        await page.locator("#ts-zoom").selectOption("4");
        await page.locator("#ts-source-window").focus();
        await page.keyboard.press("ArrowRight");
        await page.waitForFunction(
          () => document.querySelector("#ts-source-window").scrollLeft > 0,
        );
        await fits(page);
        await page.locator("#ts-zoom").selectOption("1");
        for (let i = 0; i < 10; i++) {
          await page.locator(`[data-ts-word="${i}"]`).click();
          assert.equal(
            await page.locator(`[data-ts-word="${i}"]`).getAttribute("aria-pressed"),
            "true",
          );
        }
        await page.locator("#ts-passage").selectOption("0");
        await scan(page, "meibom-11");
        const downloads = [];
        for (const [kind, selector, filename] of [
          ["json", "#ts-save-json", "settings.json"],
          ["csv", "#ts-save-csv", "quantities.csv"],
          ["svg", "#ts-save-svg", "diagram.svg"],
          ["html", "#ts-save-html", "reading.html"],
        ]) {
          const bytes = await save(page, selector, path.join(dir, filename));
          downloads.push({ kind, file: filename, bytes: bytes.length, sha256: hash(bytes) });
        }
        await page.locator("#ts-reset").click();
        assert.equal(await page.locator("#ts-exact").inputValue(), "8");
        await page.locator("#ts-open").setInputFiles(path.join(dir, "settings.json"));
        await page
          .locator("#ts-save-status")
          .filter({ hasText: /Opened/ })
          .waitFor();
        assert.equal(await page.locator("#ts-exact").inputValue(), "32/3");
        const before = page.url();
        await page.locator("#ts-open").setInputFiles({
          name: "bad.json",
          mimeType: "application/json",
          buffer: Buffer.from('{"format":"pyknon-weighted-strings","version":1}'),
        });
        await page
          .locator("#ts-save-status")
          .filter({ hasText: /Settings retained/ })
          .waitFor();
        assert.equal(page.url(), before);
        await page.locator("#ts-share").click();
        await page
          .locator("#ts-save-status")
          .filter({ hasText: /copied|Copy this experiment link/ })
          .waitFor();
        const shared = await context.newPage();
        await shared.goto(page.url());
        assert.equal(await shared.locator("#ts-exact").inputValue(), "32/3");
        await shared.close();
        const local = await context.newPage(),
          requests = [];
        local.on("request", (r) => {
          if (/^https?:/.test(r.url())) requests.push(r.url());
        });
        await local.goto(pathToFileURL(path.join(dir, "reading.html")).href);
        await local.locator(".ts-scan").last().waitFor();
        await local.evaluate(() => document.fonts.ready);
        assert.equal(await local.locator("script").count(), 0);
        assert.equal(await local.locator("audio").count(), 1);
        const embedded = await local
          .locator(".ts-scan img")
          .evaluateAll((imgs) => imgs.map((img) => img.src));
        for (let i = 0; i < embedded.length; i++)
          assert.equal(
            hash(Buffer.from(embedded[i].split(",")[1], "base64")),
            manifest.pages[i].sha256,
          );
        assert.deepEqual(requests, []);
        await fits(local);
        await local.locator("audio").evaluate(async (a) => {
          await a.play();
        });
        await local.waitForFunction(() => document.querySelector("audio").currentTime > 0.1);
        await local.locator("audio").evaluate((a) => a.pause());
        if (name === "chromium" && width === 1440)
          await local.pdf({
            path: path.join(dir, "reading.pdf"),
            format: "A4",
            printBackground: true,
            preferCSSPageSize: true,
          });
        await local.close();
        await page.goto(base);
        await page.getByRole("link", { name: "Weighted strings", exact: true }).click();
        await page.locator("#ts-latin-page").click();
        await page
          .locator("#ts-source-status")
          .filter({ hasText: /page verified/ })
          .waitFor();
        await page.goBack();
        await page.waitForTimeout(150);
        await page.goForward();
        await page
          .locator("#ts-source-status")
          .filter({ hasText: /page verified/ })
          .waitFor();
        assert(
          await page.locator("#ts-scan").evaluate((img) => img.complete && img.naturalWidth > 0),
        );
        const axe = await new AxeBuilder({ page }).analyze();
        assert.deepEqual(
          axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.length })),
          [],
        );
        await fits(page);
        await page.screenshot({ path: path.join(dir, "desktop-top.png"), fullPage: false });
        await page.locator("#weights").scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(dir, "bench.png"), fullPage: false });
        const inventory = await page.evaluate(async () => {
          const names = await caches.keys(),
            entries = [];
          for (const name of names)
            if (name.startsWith("pyknon-")) {
              const c = await caches.open(name);
              entries.push({
                name,
                files: (await c.keys()).map((r) => new URL(r.url).pathname).sort(),
              });
            }
          return entries;
        });
        assert.equal(inventory.length, 1);
        assert.equal(inventory[0].name, `pyknon-${edition}`);
        assert.deepEqual(inventory[0].files, cachedFiles.slice().sort());
        server?.offline();
        await context.setOffline(true);
        const offlineRooms = [];
        for (const room of [
          "index.html",
          "song.html",
          "canon.html",
          "trial.html",
          "rhythm.html",
          "tension.html",
        ]) {
          await page.goto(base + room);
          await ready(page);
          offlineRooms.push(room);
        }
        await page.locator('[data-ts-note="1"]').click();
        await page.locator("#ts-exact").fill("32/3");
        await page.locator("#ts-weight-form button").click();
        await page.reload();
        assert.equal(await page.locator("#ts-exact").inputValue(), "32/3");
        await scan(page, "meibom-12");
        const offlineReading = await save(
          page,
          "#ts-save-html",
          path.join(dir, "offline-reading.html"),
        );
        assert(offlineReading.length > 7000000);
        assert.deepEqual(errors, []);
        report.configurations.push({
          browser: name,
          version: browser.version(),
          width,
          sounds,
          downloads,
          sourceImagesVerified: 8,
          passagesInspected: 8,
          wordNotes: 10,
          axeViolations: 0,
          pageErrors: errors,
          inventory,
          offlineRooms,
          offlineReloadAndNativeReading: true,
        });
        await writeFile(path.join(out, "review.json"), `${JSON.stringify(report, null, 2)}\n`);
        console.log(
          `${name}/${width}: controls, source pages, actual audio, native files, six rooms offline passed.`,
        );
      } finally {
        await context.close();
        await server?.close();
      }
    }
  } finally {
    await browser.close();
  }
}
