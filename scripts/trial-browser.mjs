// biome-ignore-all lint/performance/useDomNodeTextContent: Read the rendered learner workflow.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const out = path.resolve(process.argv[2] ?? "/tmp/pyknon-trial-browser");
const external = process.argv[3] || undefined;
const development = process.argv[4] === "development";
const quick = process.argv.includes("--quick");
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
await mkdir(out, { recursive: true });
const report = {
  checkedAt: new Date().toISOString(),
  mode: development ? "development" : external ? "public hosting" : "local production",
  base: external ?? null,
  configurations: [],
};
async function filesIn(dir) {
  return (
    await Promise.all(
      (
        await readdir(dir, { withFileTypes: true })
      ).map((e) => (e.isDirectory() ? filesIn(path.join(dir, e.name)) : [path.join(dir, e.name)])),
    )
  ).flat();
}
report.build = await Promise.all(
  (await filesIn("dist"))
    .sort()
    .map(async (f) => ({ file: f.slice(5), sha256: hash(await readFile(f)) })),
);
async function serve() {
  let online = true;
  let sourceFault = false;
  const server = createServer(async (req, res) => {
    if (!online) {
      req.socket.destroy();
      return;
    }
    try {
      const rel =
        new URL(req.url, "http://local").pathname.replace(/^\/pyknon\//, "") || "index.html";
      assert(!rel.includes(".."));
      if (sourceFault && rel === "sw.js") {
        res.writeHead(503).end();
        return;
      }
      const bytes = await readFile(
        path.join(
          "dist",
          sourceFault && rel === "sources/trial/wallis-35.jpg"
            ? "sources/trial/wallis-34.jpg"
            : rel,
        ),
      );
      res
        .writeHead(200, {
          "Content-Type":
            {
              ".html": "text/html",
              ".js": "text/javascript",
              ".css": "text/css",
              ".jpg": "image/jpeg",
              ".svg": "image/svg+xml",
              ".ttf": "font/ttf",
              ".woff2": "font/woff2",
              ".json": "application/json",
            }[path.extname(rel)] ?? "application/octet-stream",
          "Cache-Control": "no-store",
        })
        .end(bytes);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return {
    base: `http://127.0.0.1:${server.address().port}/pyknon/`,
    sourceFault: (enabled) => {
      sourceFault = enabled;
    },
    offline: () => {
      online = false;
      server.closeAllConnections();
    },
    close: async () => {
      server.closeAllConnections();
      await new Promise((r) => server.close(r));
    },
  };
}
async function until(fn, description) {
  const deadline = Date.now() + 60000;
  while (Date.now() < deadline) {
    if (await fn()) return;
    await new Promise((r) => setTimeout(r, 80));
  }
  throw new Error(`Timed out: ${description}`);
}
let lastDownload = 0;
async function save(page, selector, filename) {
  // Chromium limits bursts of automatic downloads, even from clicked buttons.
  const delay = 1150 - (Date.now() - lastDownload);
  if (delay > 0) await new Promise((r) => setTimeout(r, delay));
  lastDownload = Date.now();
  const pending = page.waitForEvent("download");
  await page.locator(selector).click();
  const d = await pending;
  await d.saveAs(filename);
  return readFile(filename);
}
const rawManifest = JSON.parse(await readFile("public/sources/trial/manifest.json", "utf8"));
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  if (process.env.TRIAL_ENGINE && process.env.TRIAL_ENGINE !== name) continue;
  const browser = await engine.launch();
  try {
    for (const width of [1440, 375]) {
      const folder = path.join(out, `${name}-${width}`);
      await mkdir(folder, { recursive: true });
      const origin = await serve(),
        base = external ?? origin.base;
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        acceptDownloads: true,
      });
      const page = await context.newPage(),
        errors = [],
        requests = [];
      const item = {
        browser: name,
        version: browser.version(),
        width,
        measurements: [],
        drawnModes: [],
        waves: [],
        sourcePages: [],
        offlineRooms: [],
      };
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("request", (r) => {
        if (/^https?:/.test(r.url()) && !r.url().startsWith(base)) requests.push(r.url());
      });
      await page.addInitScript(() => {
        globalThis.__csp = [];
        addEventListener("securitypolicyviolation", (e) =>
          globalThis.__csp.push({ directive: e.violatedDirective, uri: e.blockedURI }),
        );
        // Capture the real live Web Audio graph at scheduling, not a fabricated
        // output from the model. The PCM checker validates exports separately.
        const Base = globalThis.AudioContext;
        globalThis.AudioContext = class extends Base {
          createOscillator() {
            const o = super.createOscillator(),
              start = o.start.bind(o),
              stop = o.stop.bind(o);
            let scheduledHz;
            const setFrequency = o.frequency.setValueAtTime.bind(o.frequency);
            o.frequency.setValueAtTime = (hz, t) => {
              scheduledHz = hz;
              return setFrequency(hz, t);
            };
            o.start = (t) => {
              globalThis.__live ??= [];
              globalThis.__live.push({ hz: scheduledHz, start: t });
              start(t);
            };
            o.stop = (t) => {
              globalThis.__stops ??= [];
              globalThis.__stops.push(t);
              stop(t);
            };
            return o;
          }
        };
      });
      try {
        await page.goto(`${base}index.html`);
        await page.getByRole("link", { name: "String trial", exact: true }).click();
        await page.locator("#tr-drawing svg").waitFor();
        await page.evaluate(() => document.fonts.ready);
        if (!development) {
          await page
            .locator("#offline-status")
            .filter({ hasText: /^Ready offline/ })
            .waitFor({ timeout: 60000 });
          assert(
            await page.evaluate(() => !!navigator.serviceWorker.controller),
            "Readiness requires a controller",
          );
        }
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        assert.match(await page.locator("#tr-verdict").innerText(), /Same pitch/);
        await page.locator("#tr-title").scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(folder, "halves.png"), fullPage: false });
        await page.locator(".tr-bench").screenshot({ path: path.join(folder, "halves-bench.png") });
        await page.locator("#tr-density").focus();
        await page.keyboard.press("ArrowRight");
        assert.equal(await page.locator("#tr-density").inputValue(), "2.5");
        assert.equal(await page.evaluate(() => document.activeElement.id), "tr-density");
        await page.keyboard.press("Home");
        assert.equal(await page.locator("#tr-density").inputValue(), "1");
        await page.locator('[data-experiment="second"]').click();
        assert.match(await page.locator("#tr-verdict").innerText(), /Different pitches/);
        assert.match(await page.locator("#tr-difference").innerText(), /701.955 cents lower/);
        await page.locator("#tr-title").scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(folder, "quarters.png"), fullPage: false });
        await page.locator('[data-experiment="hidden"]').click();
        await page.locator('input[name="tr-test"][value="1"]').check();
        assert.match(await page.locator("#tr-verdict").innerText(), /Same pitch/);
        await page.locator('input[name="tr-test"][value="2"]').check();
        assert.match(await page.locator("#tr-difference").innerText(), /701.955 cents higher/);

        await page.locator(".tr-working summary").click();
        await page.locator(".tr-working").screenshot({ path: path.join(folder, "all-tests.png") });
        for (const string of ["uniform", "outer", "repeat", "left"]) {
          await page.locator("#tr-string").selectOption(string);
          for (const test of [0, 1, 2]) {
            await page.locator(`input[name="tr-test"][value="${test}"]`).check();
            const modes = await page.locator("#tr-drawing").evaluate((el) =>
              [...el.querySelectorAll(".tr-mode")].map((g) =>
                g
                  .querySelector("path")
                  .dataset.points.split(";")
                  .map((pair) => {
                    const [x, y] = pair.split(",").map(Number);
                    return { x, y };
                  }),
              ),
            );
            item.drawnModes.push({
              string,
              contrast: 2.25,
              root: 220,
              test,
              aHz: Number(await page.locator("#tr-a-hz").getAttribute("data-hz")),
              bHz: Number(await page.locator("#tr-b-hz").getAttribute("data-hz")),
              aShape: modes[0],
              bShape: modes[1],
            });
            for (const sound of !quick || (string === "repeat" && test === 2)
              ? ["compare", "together", "control"]
              : []) {
              await page.locator("#tr-sound").selectOption(sound);
              const wavFile = path.join(folder, `${string}-${test}-${sound}.wav`);
              const bytes = await save(page, "#tr-wav", wavFile);
              item.waves.push({
                string,
                contrast: 2.25,
                root: 220,
                test,
                sound,
                file: path.relative(out, wavFile),
                sha256: hash(bytes),
              });
            }
          }
          const csvFile = path.join(folder, `${string}.csv`);
          await save(page, "#tr-csv", csvFile);
          item.measurements.push({ string, csv: path.relative(out, csvFile) });
        }
        await page.locator("#tr-root").selectOption("110");
        const lowCsv = path.join(folder, "left-110.csv");
        await save(page, "#tr-csv", lowCsv);
        item.measurements.push({ string: "left", csv: path.relative(out, lowCsv) });
        await page.locator("#tr-sound").selectOption("compare");
        const lowFile = path.join(folder, "left-2-110-compare.wav");
        const lowBytes = await save(page, "#tr-wav", lowFile);
        item.waves.push({
          string: "left",
          contrast: 2.25,
          root: 110,
          test: 2,
          sound: "compare",
          file: path.relative(out, lowFile),
          sha256: hash(lowBytes),
        });
        await page.locator("#tr-root").selectOption("220");
        await page.locator('[data-experiment="hidden"]').click();
        await page.locator('input[name="tr-test"][value="2"]').check();
        await page.locator("#tr-sound").selectOption("compare");
        await page.locator("#tr-play").click();
        await page.locator("#tr-play-status").filter({ hasText: /A ·/ }).waitFor();
        await page.locator("#tr-stop").click();
        assert.equal(await page.locator("#tr-play-status").innerText(), "Stopped.");
        item.liveOscillators = await page.evaluate(() => globalThis.__live);
        assert.equal(item.liveOscillators.length, 2);
        assert(Math.abs(item.liveOscillators[0].hz - 1173.3333333) < 0.001);
        assert.equal(item.liveOscillators[1].hz, 1760);
        for (let i = 0; i < 6; i++) {
          await page.locator("#tr-passage").selectOption(String(i));
          assert(await page.locator('#tr-passage-text [lang="grc"]').innerText());
          await page.locator("#tr-inspect").click();
          assert.equal(await page.evaluate(() => document.activeElement.id), "tr-source-viewport");
        }
        for (const f of rawManifest.files) {
          await page.locator("#tr-page").selectOption(String(f.printedPage));
          await until(
            () =>
              page.locator("#tr-source-image").evaluate((i) => i.complete && i.naturalWidth > 0),
            "source image decode",
          );
          const h = await page.locator("#tr-source-image").evaluate(async (i) => {
            const bytes = await (await fetch(i.src)).arrayBuffer();
            return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
              .map((b) => b.toString(16).padStart(2, "0"))
              .join("");
          });
          assert.equal(h, f.sha256);
          item.sourcePages.push({ page: f.printedPage, sha256: h });
        }
        await page.locator("#tr-passage").selectOption("2");
        await page.locator("#tr-zoom").selectOption("4");
        await page.locator("#tr-source-viewport").focus();
        await page.keyboard.press("ArrowRight");
        await until(
          () => page.locator("#tr-source-viewport").evaluate((e) => e.scrollLeft > 0),
          "keyboard scan pan",
        );
        await page.locator("#trial-reading").scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(folder, "reading.png"), fullPage: false });
        for (const answer of [1, 0, 2]) {
          await page.locator(`input[name="tr-answer"][value="${answer}"]`).check();
          await page.locator('#tr-question button[type="submit"]').click();
          assert.match(await page.locator("#tr-feedback").innerText(), /^Yes\./);
          await page.locator("#tr-next").click();
        }
        await page.locator("#tr-share").click();
        const shared = await page.locator("#tr-share-url").inputValue();
        await page.goto(shared);
        assert.equal(await page.locator("#tr-string").inputValue(), "repeat");
        assert.equal(await page.locator('input[name="tr-test"]:checked').inputValue(), "2");
        assert.equal(await page.locator("#tr-passage").inputValue(), "2");
        await page.locator('input[name="tr-test"][value="1"]').check();
        await page.goBack();
        assert.equal(await page.locator('input[name="tr-test"]:checked').inputValue(), "2");
        const csv = await save(page, "#tr-csv", path.join(folder, "measurements.csv"));
        const svg = await save(page, "#tr-svg", path.join(folder, "string.svg"));
        const wav = await save(page, "#tr-wav", path.join(folder, "selected.wav"));
        const html = await save(page, "#tr-save", path.join(folder, "reading.html"));
        const axe = await new AxeBuilder({ page }).analyze();
        assert.deepEqual(
          axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
          [],
        );
        item.axeViolations = 0;
        const nativeContext = await browser.newContext({
          viewport: { width, height: 1000 },
          offline: true,
          acceptDownloads: true,
        });
        const native = await nativeContext.newPage(),
          nativeErrors = [],
          nativeRequests = [];
        native.on("pageerror", (e) => nativeErrors.push(String(e)));
        native.on("request", (r) => {
          if (/^https?:/.test(r.url())) nativeRequests.push(r.url());
        });
        await native.goto(pathToFileURL(path.join(folder, "reading.html")).href);
        await native.evaluate(() => document.fonts.ready);
        assert(
          await native.evaluate(() =>
            [...document.images].every((i) => i.complete && i.naturalWidth > 0),
          ),
        );
        assert.equal(await native.locator(".tr-full-passage").count(), 6);
        for (const [extension, expected] of [
          ["csv", csv],
          ["wav", wav],
          ["svg", svg],
        ]) {
          const actual = await save(
            native,
            `a[download="pyknon-string-trial.${extension}"]`,
            path.join(folder, `embedded.${extension}`),
          );
          assert.equal(hash(actual), hash(expected), `embedded ${extension}`);
        }
        await native.locator("audio").focus();
        await native.keyboard.press("Space");
        await until(
          () => native.locator("audio").evaluate((a) => a.currentTime > 0 && !a.paused),
          "native saved audio playback",
        );
        await native.locator("audio").evaluate((a) => a.pause());
        if (name === "chromium" && width === 1440)
          await native.pdf({
            path: path.join(folder, "reading.pdf"),
            format: "A4",
            preferCSSPageSize: true,
            printBackground: true,
          });
        await native.screenshot({ path: path.join(folder, "native.png"), fullPage: false });
        assert.deepEqual(nativeErrors, []);
        assert.deepEqual(nativeRequests, []);
        item.native = {
          embeddedCsvMatches: true,
          embeddedWavMatches: true,
          embeddedSvgMatches: true,
          images: 6,
          audioTimeAdvanced: true,
          requests: nativeRequests,
        };
        await nativeContext.close();
        if (!external && width === 1440) {
          origin.sourceFault(true);
          const brokenContext = await browser.newContext({ acceptDownloads: true });
          const broken = await brokenContext.newPage();
          let partialDownloads = 0;
          broken.on("download", () => {
            partialDownloads++;
          });
          await broken.goto(`${base}trial.html`);
          await broken.locator("#tr-save").click();
          await broken
            .locator("#tr-save-status")
            .filter({ hasText: /could not be prepared/ })
            .waitFor();
          assert.equal(partialDownloads, 0, "Wrong source bytes must not produce a partial packet");
          assert.equal(await broken.locator("#tr-save").isDisabled(), false);
          origin.sourceFault(false);
          await save(broken, "#tr-save", path.join(folder, "source-retry.html"));
          item.sourceMismatch = {
            httpStatus: 200,
            substitutedPage: "34 for 35",
            rejected: true,
            partialDownloads: 0,
            retryDownloaded: true,
          };
          await brokenContext.close();
        }
        if (!development) {
          if (external) await context.setOffline(true);
          else origin.offline();
          await page.reload();
          await page.locator("#tr-drawing svg").waitFor();
          const offline = await save(page, "#tr-save", path.join(folder, "offline-reading.html"));
          assert.equal(hash(offline), hash(html));
          for (const room of ["index.html", "song.html", "canon.html", "trial.html"]) {
            await page.goto(base + room);
            await page.locator("main").waitFor();
            item.offlineRooms.push(room);
          }
          item.offlineMethod = external
            ? "Browser networking disabled"
            : "Origin destroys sockets while navigator.onLine stays true";
          assert.equal(await page.evaluate(() => navigator.onLine), !external);
        } else {
          assert.equal(
            await page.evaluate(
              async () => (await navigator.serviceWorker.getRegistrations()).length,
            ),
            0,
          );
        }
        await page.goto(`${base}trial.html?density=NaN&test=99&p=3`);
        assert.match(await page.locator("#tr-notice").innerText(), /reset/);
        assert.equal(await page.locator("#tr-passage").inputValue(), "3");
        assert.deepEqual(errors, []);
        assert.deepEqual(requests, []);
        item.pageErrors = errors;
        item.externalRequests = requests;
        item.cspViolations = await page.evaluate(() => globalThis.__csp);
        assert.deepEqual(item.cspViolations, []);
        item.downloadSha256 = { html: hash(html), csv: hash(csv), wav: hash(wav), svg: hash(svg) };
        report.configurations.push(item);
        await writeFile(path.join(out, "browser.json"), `${JSON.stringify(report, null, 2)}\n`);
        console.log(
          `${name} ${width}: actual controls, ${item.waves.length} WAVs, source pages, saved audio and ${development ? "development resources" : "offline journey"} verified`,
        );
      } catch (e) {
        await page.screenshot({ path: path.join(folder, "failure.png"), fullPage: true });
        console.error(
          "Failure at",
          page.url(),
          await page.locator("#offline-status").textContent().catch(String),
        );
        throw e;
      } finally {
        await context.close();
        await origin.close();
      }
    }
  } finally {
    await browser.close();
  }
}
