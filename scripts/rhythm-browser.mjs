import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const out = path.resolve(process.argv[2] ?? "/tmp/pyknon-rhythm-review"),
  hosted = process.argv[3];
if (hosted) assert.match(hosted, /^https:\/\/.+\/$/);
await mkdir(out, { recursive: true });
const hash = (b) => createHash("sha256").update(b).digest("hex");
const manifest = JSON.parse(await readFile("public/sources/rhythm/manifest.json", "utf8"));
const report = {
  checkedAt: new Date().toISOString(),
  scope: hosted
    ? "Public site, real browser operations and native files. Offline checks disable browser networking; the public origin remains available."
    : "Local production, real browser operations and native files. Offline checks destroy the local origin's connections and disable browser networking. No deployment claim.",
  base: hosted ?? null,
  workerSha256: hash(await readFile("dist/sw.js")),
  configurations: [],
};
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
          "Cache-Control": "no-store",
          "Content-Type":
            {
              ".html": "text/html",
              ".js": "text/javascript",
              ".css": "text/css",
              ".jpg": "image/jpeg",
              ".json": "application/json",
              ".ttf": "font/ttf",
              ".woff2": "font/woff2",
              ".svg": "image/svg+xml",
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
  await (await pending).saveAs(file);
  return readFile(file);
}
async function fits(page) {
  assert(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
    "document fits the viewport",
  );
}
for (const [name, type] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await type.launch();
  try {
    for (const width of [1440, 375]) {
      const directory = path.join(out, `${name}-${width}`);
      await mkdir(directory, { recursive: true });
      const server = await serve(),
        base = hosted ?? server.base;
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        acceptDownloads: true,
      });
      await context.addInitScript(() => {
        window.rhythmAudio = { nodes: [] };
        const create = AudioContext.prototype.createOscillator;
        AudioContext.prototype.createOscillator = function (...args) {
          const node = create.apply(this, args),
            r = { hz: null, start: null, stops: [] },
            start = node.start,
            stop = node.stop,
            set = node.frequency.setValueAtTime;
          node.frequency.setValueAtTime = function (...args) {
            r.hz = args[0];
            return set.apply(this, args);
          };
          node.start = function (...args) {
            r.start = args[0];
            window.rhythmAudio.nodes.push(r);
            return start.apply(this, args);
          };
          node.stop = function (...args) {
            r.stops.push(args[0]);
            return stop.apply(this, args);
          };
          return node;
        };
      });
      const page = await context.newPage(),
        errors = [],
        external = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("request", (r) => {
        if (/^https?:/.test(r.url()) && new URL(r.url()).origin !== new URL(base).origin)
          external.push(r.url());
      });
      try {
        await page.goto(`${base}rhythm.html`);
        await page.evaluate(() => document.fonts.ready);
        await page
          .locator("#offline-status")
          .filter({ hasText: /Ready offline/ })
          .waitFor({ timeout: 30000 });
        await fits(page);
        await page.screenshot({ path: path.join(directory, "opening.png") });
        await page.locator("#rh-up").selectOption("3");
        assert.match(await page.locator("#rh-result").textContent(), /3\+3: Equal/);
        await page.locator("#rh-up").selectOption("2");
        await page.locator("#rh-reverse").focus();
        await page.keyboard.press("Enter");
        assert.equal(await page.locator("#rh-up").inputValue(), "4");
        assert.match(await page.locator("#rh-result").textContent(), /4\+2: Double/);
        assert.equal(await page.evaluate(() => document.activeElement.id), "rh-reverse");
        await page.locator("#rh-up").selectOption("1");
        assert.match(await page.locator("#rh-result").textContent(), /outside the three genera/);
        await page.locator('[data-rh-case="5"]').click();
        assert.match(await page.locator("#rh-result").textContent(), /3:2.*paeonic/);
        await page.locator('[data-rh-case="7"]').click();
        assert.match(
          await page.locator("#rh-result").textContent(),
          /reference also falls outside/,
        );
        await page.locator("#rh-total").selectOption("8");
        await page.locator("#rh-up").selectOption("4");
        assert.match(await page.locator("#rh-result").textContent(), /4\+4: Equal/);
        await page.locator('[data-rh-case="6"]').click();
        await page.locator("#rh-texture").selectOption("joined");
        assert.match(await page.locator("#rh-result").textContent(), /2\+4: Double/);
        assert.equal(await page.locator('#rh-drawing [data-rh-row="1"] circle').count(), 2);
        // Change the modern clock by a real range-keyboard operation; the genus stays fixed.
        await page.locator("#rh-unit").focus();
        await page.keyboard.press("ArrowRight");
        assert.equal(await page.locator("#rh-unit").inputValue(), "330");
        assert.match(await page.locator("#rh-score-caption").textContent(), /1980 ms/);
        await page.keyboard.press("ArrowLeft");
        await page.locator("#rh-play-compare").focus();
        await page.keyboard.press("Enter");
        await page.waitForFunction(() => window.rhythmAudio.nodes.length === 8);
        const nodes = await page.evaluate(() => window.rhythmAudio.nodes);
        assert.deepEqual(
          nodes.map((n) => n.hz),
          [720, 480, 720, 480, 720, 480, 720, 480],
        );
        const relative = [0, 0.9, 1.8, 2.7, 4.05, 4.65, 5.85, 6.45];
        nodes.forEach((n, i) => {
          assert.ok(Math.abs(n.start - nodes[0].start - relative[i]) < 1e-9);
        });
        await page.locator("#rh-up").selectOption("3");
        assert(
          await page.evaluate(() => window.rhythmAudio.nodes.every((n) => n.stops.length >= 2)),
          "a control change cancels the actual scheduled oscillators",
        );
        await page.locator("#rh-up").selectOption("2");
        // Reduced-motion playback still exposes a text position and does not move highlights.
        await page.emulateMedia({ reducedMotion: "reduce" });
        await page.locator("#rh-play-chosen").click();
        await page
          .locator("#rh-position")
          .filter({ hasText: /Your foot/ })
          .waitFor();
        assert.equal(await page.locator(".rh-sounding").count(), 0);
        await page.locator("#rh-stop").click();
        await page.emulateMedia({ reducedMotion: "no-preference" });
        for (const choice of ["one", "two", "middle"]) {
          await page.locator("#rh-between-choice").selectOption(choice);
          assert.match(
            await page.locator("#rh-between-result").textContent(),
            choice === "middle"
              ? /3:4.*1050 ms/
              : choice === "one"
                ? /1:2.*900 ms/
                : /1:1.*1200 ms/,
          );
        }
        const betweenWav = await save(page, "#rh-save-wav", path.join(directory, "between.wav"));
        await page.locator("#rh-sound").selectOption("compare");
        const comparisonWav = await save(
          page,
          "#rh-save-wav",
          path.join(directory, "comparison.wav"),
        );
        assert.notEqual(hash(betweenWav), hash(comparisonWav));
        const onsets = await save(page, "#rh-save-csv", path.join(directory, "onsets.csv"));
        assert.match(onsets.toString(), /listening=compare/);
        assert.equal(onsets.toString().trim().split("\n").length, 10);
        const json = await save(page, "#rh-save-json", path.join(directory, "comparison.json")),
          snapshot = JSON.parse(json);
        assert.deepEqual(snapshot.state, {
          total: 6,
          up: 2,
          unitMs: 300,
          texture: "joined",
          between: "middle",
          sound: "compare",
        });
        await page.locator("#rh-import").setInputFiles({
          name: "bad.json",
          mimeType: "application/json",
          buffer: Buffer.from(JSON.stringify({ ...snapshot, onsets: [1, 2] })),
        });
        await page
          .locator("#rh-save-status")
          .filter({ hasText: /current comparison was kept/ })
          .waitFor();
        assert.equal(await page.locator("#rh-up").inputValue(), "2");
        await page.locator("#rh-up").selectOption("3");
        await page.locator("#rh-import").setInputFiles(path.join(directory, "comparison.json"));
        await page
          .locator("#rh-save-status")
          .filter({ hasText: /Reopened the comparison/ })
          .waitFor();
        assert.equal(await page.locator("#rh-up").inputValue(), "2");
        await page.locator("#rh-share").click();
        await page
          .locator("#rh-save-status")
          .filter({ hasText: /Copied the comparison link|Copy the comparison link/ })
          .waitFor();
        const url = page.url();
        await page.getByRole("link", { name: "Rhythm", exact: true }).click();
        assert.equal(new URL(page.url()).search, new URL(url).search);
        const shared = await context.newPage();
        await shared.goto(url);
        assert.equal(await shared.locator("#rh-up").inputValue(), "2");
        assert.equal(await shared.locator("#rh-texture").inputValue(), "joined");
        await shared.close();
        let words = 0;
        for (let i = 0; i < 10; i++) {
          await page.locator("#rh-passage").selectOption(String(i));
          assert(
            (await page.locator("#rh-passage-text [lang=grc]").first().textContent()).length > 20,
          );
          const buttons = page.locator("#rh-passage-text button[data-rh-word]");
          for (let j = 0; j < (await buttons.count()); j++) {
            await buttons.nth(j).focus();
            await page.keyboard.press("Enter");
            await page.locator("#rh-word-note").waitFor({ state: "visible" });
            assert.equal(
              await page.evaluate(() => document.activeElement.hasAttribute("data-rh-word")),
              true,
            );
            words++;
          }
        }
        assert.match(
          await page.locator("#rh-passage-text").textContent(),
          /fragment breaks off here/,
        );
        for (const asset of manifest.pages) {
          await page.locator("#rh-page").selectOption(String(asset.printedPage));
          await page.waitForFunction(() => {
            const img = document.querySelector("#rh-scan");
            return img.complete && img.naturalWidth > 0;
          });
          const actual = await page.evaluate(async (file) => {
            const bytes = await (await fetch(new URL(file, location.href))).arrayBuffer();
            return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), (b) =>
              b.toString(16).padStart(2, "0"),
            ).join("");
          }, asset.file);
          assert.equal(actual, asset.sha256);
        }
        await page.locator("#rh-page").selectOption("34");
        await page.locator("#rh-zoom").selectOption("2");
        await page.locator("#rh-source-window").focus();
        await page.keyboard.press("ArrowRight");
        await page.waitForFunction(
          () => document.querySelector("#rh-source-window").scrollLeft > 0,
        );
        await page.locator("#rh-zoom").selectOption("1");
        await fits(page);
        await page.locator("#rh-passage").selectOption("7");
        await page.locator("#rh-reading").scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(directory, "greek.png") });
        const axe = await new AxeBuilder({ page }).analyze();
        assert.deepEqual(
          axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
          [],
        );
        const svg = await save(page, "#rh-save-svg", path.join(directory, "score.svg"));
        assert.match(svg.toString(), /Both span 6 primary times, 1800 milliseconds/);
        const pending = page.waitForEvent("download");
        await page.locator("#rh-save-reading").click();
        await page.locator('[data-rh-case="7"]').click();
        await page.locator("#rh-between-choice").selectOption("one");
        const readingFile = path.join(directory, "reading.html");
        await (await pending).saveAs(readingFile);
        const html = await readFile(readingFile, "utf8");
        assert(!/<script\b|\son\w+=/i.test(html));
        assert.match(html, /Your foot: 2\+4/);
        assert.match(html, /Modern primary time: 300 ms/);
        assert.match(html, /Selected: An illustrative intermediate size/);
        const images = [...html.matchAll(/<img src="data:image\/jpeg;base64,([^"]+)"/g)];
        assert.equal(images.length, 8);
        images.forEach((m, i) => {
          assert.equal(hash(Buffer.from(m[1], "base64")), manifest.pages[i].sha256);
        });
        const editable =
          /download="pyknon-rhythm.json" href="data:application\/json;charset=utf-8,([^"]+)"/.exec(
            html,
          );
        assert(editable);
        assert.deepEqual(JSON.parse(decodeURIComponent(editable[1])), snapshot);
        const portableContext = await browser.newContext({ viewport: { width, height: 1000 } }),
          portable = await portableContext.newPage(),
          remote = [];
        portable.on("request", (r) => {
          if (/^https?:/.test(r.url())) remote.push(r.url());
        });
        await portable.goto(pathToFileURL(readingFile).href);
        await portable.evaluate(() => document.fonts.ready);
        await fits(portable);
        assert.equal(await portable.locator("article").count(), 10);
        assert.equal(await portable.locator("img").count(), 8);
        assert(
          await portable
            .locator("img")
            .evaluateAll((imgs) => imgs.every((i) => i.complete && i.naturalWidth > 0)),
        );
        const audio = await portable.locator("audio").getAttribute("src");
        assert.equal(hash(Buffer.from(audio.split(",")[1], "base64")), hash(comparisonWav));
        await portable.screenshot({ path: path.join(directory, "portable.png") });
        if (name === "chromium" && width === 1440)
          await portable.pdf({
            path: path.join(directory, "reading.pdf"),
            printBackground: true,
            preferCSSPageSize: true,
          });
        assert.deepEqual(remote, []);
        await portableContext.close();
        if (!hosted) server.offline();
        await context.setOffline(true);
        const rooms = [
          "index.html",
          "song.html",
          "canon.html",
          "trial.html",
          "tension.html",
          "rhythm.html",
        ];
        for (const room of rooms) {
          await page.goto(base + room);
          await page
            .locator("#offline-status")
            .filter({ hasText: /Ready offline.*rooms/ })
            .waitFor();
          await fits(page);
          if (room !== "rhythm.html")
            await page.getByRole("link", { name: "Rhythm", exact: true }).waitFor();
        }
        await page.locator('[data-rh-case="5"]').click();
        await page.locator("#rh-texture").selectOption("joined");
        await page.locator("#rh-sound").selectOption("chosen");
        await page.locator("#rh-passage").selectOption("3");
        assert.match(
          await page.locator("#rh-passage-text [lang=la]").textContent(),
          /tres partitiones/,
        );
        const offlineReading = await save(
          page,
          "#rh-save-reading",
          path.join(directory, "offline-reading.html"),
        );
        assert(offlineReading.length > 3000000);
        await page.locator("#rhythm").scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(directory, "bench.png") });
        await fits(page);
        assert.deepEqual(errors, []);
        assert.deepEqual(external, []);
        report.configurations.push({
          browser: name,
          version: browser.version(),
          width,
          sourcePartitionsOperated: ["3+3", "2+4", "4+2", "1+5", "2+3", "3+4", "4+4"],
          unitKeyboardChanged: true,
          liveScheduledOscillators: nodes,
          controlChangeStopsActualOscillators: true,
          reducedMotionRespected: true,
          passagesRead: 10,
          wordNotesByKeyboard: words,
          sourceHashesVerified: 8,
          sourceZoomByKeyboard: true,
          strictNativeJsonReopen: true,
          clickTimeSnapshot: true,
          comparisonWavSha256: hash(comparisonWav),
          betweenWavSha256: hash(betweenWav),
          readingSha256: hash(Buffer.from(html)),
          offlineOriginDisabled: !hosted,
          offlineRooms: rooms,
          offlineIllustratedReading: true,
          axeViolations: 0,
          portableRemoteRequests: remote,
          pageErrors: errors,
          externalRequests: external,
        });
        console.log(
          `${name} ${width}: actual rhythmic operations, audio schedule, Greek reading, native files and ${hosted ? "browser-offline" : "origin-disabled offline"} six-room edition passed`,
        );
      } finally {
        await context.close();
        await server.close();
      }
    }
  } finally {
    await browser.close();
  }
}
await writeFile(path.join(out, "review.json"), `${JSON.stringify(report, null, 2)}\n`);
