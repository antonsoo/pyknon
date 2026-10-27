import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4362/pyknon/";
const out = path.resolve(process.argv[3] ?? "/tmp/claude-1000/helikon-review");
await mkdir(out, { recursive: true });
const records = [];
async function keyboard(page, selector, key = "Enter") {
  await page.locator(selector).focus();
  await page.keyboard.press(key);
}
async function range(page, selector, steps) {
  await keyboard(page, selector, "Home");
  for (let i = 0; i < steps; i++) await page.keyboard.press("ArrowRight");
}
async function save(page, selector, file) {
  const pending = page.waitForEvent("download");
  await page.locator(selector).click();
  const d = await pending;
  assert.equal(await d.failure(), null);
  await d.saveAs(file);
  await page.waitForTimeout(150);
}
async function verified(page, id) {
  await page.waitForFunction((id) => {
    const img = document.getElementById("hk-source-image");
    return (
      document.getElementById("hk-page").value === id &&
      document
        .getElementById("hk-source-status")
        .textContent.startsWith("Verified complete page") &&
      img.complete &&
      img.naturalHeight === 2200
    );
  }, id);
}
async function review(engine, browser, width) {
  console.log(`${engine} ${width}: construction, retuning, sound, saved documents, offline`);
  const dir = path.join(out, `${engine}-${width}`);
  await mkdir(dir, { recursive: true });
  const context = await browser.newContext({
    viewport: { width, height: 1000 },
    acceptDownloads: true,
  });
  if (engine === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await context.addInitScript(() => {
    window.__helikonTones = [];
    window.__helikonStops = 0;
    const create = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function () {
      const o = create.call(this),
        set = o.frequency.setValueAtTime.bind(o.frequency),
        stop = o.stop.bind(o);
      o.frequency.setValueAtTime = (v, t) => {
        window.__helikonTones.push({ hz: v, time: t });
        return set(v, t);
      };
      o.stop = (t) => {
        window.__helikonStops++;
        return stop(t);
      };
      return o;
    };
  });
  const page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(base);
  await page.locator("#root").waitFor();
  await keyboard(page, 'header a[href="./helikon.html"]');
  await page.locator("#hk-title").waitFor();
  await verified(page, "98");
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  assert.match(await page.locator("#hk-interval-result").textContent(), /9\/8/);
  for (let step = 0; step < 5; step++) {
    await keyboard(page, `[data-hk-stage="${step}"]`);
    assert.equal(
      await page.locator(`[data-hk-stage="${step}"]`).getAttribute("aria-pressed"),
      "true",
    );
  }
  const ratios = ["4/3", "3/2", "2", "9/8", "8/3", "4", "3"];
  for (let i = 0; i < ratios.length; i++) {
    await keyboard(page, `[data-hk-pair="${i}"]`);
    assert(
      (await page.locator("#hk-interval-result").textContent()).includes(
        `frequency ratio ${ratios[i]} ·`,
      ),
    );
  }
  await keyboard(page, '[data-hk-pair="3"]');
  await keyboard(page, "#hk-bridge", "ArrowRight");
  assert.match(await page.locator("#hk-interval-result").textContent(), /105\/92/);
  assert.match(await page.locator("#hk-bridge-note").textContent(), /no longer lies/);
  await keyboard(page, "#hk-source-reset");
  await keyboard(page, '[data-hk-play="pair"]');
  await page.waitForFunction(() => window.__helikonTones.length === 2);
  const pair = await page.evaluate(() => window.__helikonTones.slice());
  assert(Math.abs(pair[0].hz - (220 * 4) / 3) < 0.0001);
  assert.equal(pair[1].hz, 330);
  await keyboard(page, "#hk-stop");
  assert.equal(await page.locator("#hk-stop").isDisabled(), true);
  await keyboard(page, '[data-hk-play="segments"]');
  await page.waitForFunction(() => window.__helikonTones.length === 9);
  const segmentHz = await page.evaluate(() => window.__helikonTones.slice(-7).map((x) => x.hz));
  [220, (220 * 4) / 3, 330, 440, 440, 660, 880].forEach((v, i) => {
    assert(Math.abs(segmentHz[i] - v) < 0.0001);
  });
  await keyboard(page, "#hk-bridge", "ArrowLeft");
  assert.equal(await page.locator("#hk-stop").isDisabled(), true);
  await keyboard(page, "#hk-source-reset");
  await page.locator("#hk-bench").screenshot({ path: path.join(dir, "source-board.png") });
  await page
    .locator("#hk-source-table")
    .locator("..")
    .evaluate((el) => (el.open = true));
  const lengths = await page
    .locator("#hk-source-table tbody tr td:first-of-type")
    .allTextContents();
  assert.deepEqual(lengths, ["12", "9", "8", "6", "6", "4", "3"]);
  await page
    .locator("#hk-source-table")
    .locator("..")
    .evaluate((el) => (el.open = false));
  const targets = {
    enharmonic: ["1/7", "1/4"],
    chromatic: ["1/7", "4/9"],
    diatonic: ["1/7", "5/8"],
  };
  const waves = [];
  for (const [target, positions] of Object.entries(targets)) {
    await keyboard(page, `[data-hk-target="${target}"]`);
    await keyboard(page, "#hk-fixed");
    assert.match(await page.locator("#hk-retuning-result").textContent(), /2 of 4/);
    await range(page, "#hk-scale", 6);
    const errorsBefore = await page
      .locator("#hk-retuning-table tbody tr td:last-child")
      .allTextContents();
    await range(page, "#hk-scale", 3);
    assert.deepEqual(
      await page.locator("#hk-retuning-table tbody tr td:last-child").allTextContents(),
      errorsBefore,
    );
    await save(page, '[data-hk-save="wav"]', path.join(dir, `${target}.wav`));
    waves.push({ file: `${target}.wav`, target, scale: 9, reference: 220, x1: 252, x2: 336 });
    await keyboard(page, "#hk-fit");
    assert.match(await page.locator("#hk-retuning-result").textContent(), /All four/);
    assert.equal(await page.locator("#hk-x1-value").textContent(), positions[0]);
    assert.equal(await page.locator("#hk-x2-value").textContent(), positions[1]);
    assert.deepEqual(
      await page.locator("#hk-retuning-table tbody tr td:last-child").allTextContents(),
      ["0 · exact", "0 · exact", "0 · exact", "0 · exact"],
    );
  }
  await page.locator("#hk-retuning").screenshot({ path: path.join(dir, "fitted-strings.png") });
  await keyboard(page, '[data-hk-target="enharmonic"]');
  assert.match(await page.locator("#hk-retuning-result").textContent(), /3 of 4/);
  await keyboard(page, "#hk-fixed");
  await range(page, "#hk-scale", 6);
  await keyboard(page, "#hk-x1", "ArrowRight");
  assert.equal(await page.locator("#hk-x1-value").textContent(), "253/504");
  await keyboard(page, "#hk-fixed");
  for (let i = 0; i < 6; i++) {
    await page.locator("#hk-reading").selectOption(String(i));
    assert((await page.locator('#hk-reading-body [lang="grc"]').first().textContent()).length > 10);
    await keyboard(page, "#hk-reading-source");
    await verified(page, ["97", "97", "98", "99", "100", "101"][i]);
  }
  for (const id of ["title", "97", "98", "99", "100", "101", "62", "63"]) {
    await page.locator("#hk-page").selectOption(id);
    await verified(page, id);
  }
  await page.locator("#hk-page").selectOption("98");
  await verified(page, "98");
  await keyboard(page, "#hk-enlarge");
  await page.locator("#hk-dialog").waitFor({ state: "visible" });
  await keyboard(page, "#hk-pan", "ArrowDown");
  assert(await page.locator("#hk-pan").evaluate((el) => el.scrollTop > 0));
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#hk-dialog").isVisible(), false);
  for (const format of ["json", "csv", "svg", "wav", "html"])
    await save(page, `[data-hk-save="${format}"]`, path.join(dir, `study.${format}`));
  const saved = JSON.parse(await readFile(path.join(dir, "study.json"), "utf8"));
  assert.equal(saved.state.x1, 252);
  assert.equal(saved.state.x2, 336);
  assert.equal(saved.state.target, "enharmonic");
  await keyboard(page, "#hk-fit");
  await page.locator("#hk-import").setInputFiles(path.join(dir, "study.json"));
  await page.waitForFunction(
    () => document.getElementById("hk-save-status").textContent === "Saved experiment reopened.",
  );
  assert.match(await page.locator("#hk-retuning-result").textContent(), /2 of 4/);
  await page.locator("#hk-import").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ ...saved, state: { ...saved.state, x1: NaN } })),
  });
  await page.waitForFunction(() =>
    document.getElementById("hk-save-status").textContent.includes("whole x1"),
  );
  assert.match(await page.locator("#hk-retuning-result").textContent(), /2 of 4/);
  await keyboard(page, "#hk-share");
  const link = await page.locator("#hk-share-link").inputValue();
  const shared = await context.newPage();
  await shared.goto(link);
  await shared.locator("#hk-title").waitFor();
  assert.match(await shared.locator("#hk-retuning-result").textContent(), /2 of 4/);
  await shared.close();
  const restoredURL = page.url();
  await keyboard(page, "#hk-fit");
  const fittedURL = page.url();
  assert.notEqual(restoredURL, fittedURL);
  await page.goBack();
  // Same-document navigation can resolve before popstate updates the controls.
  // Require the intended history entry and its actual rendered experiment.
  await page.waitForFunction(
    (expected) =>
      location.href === expected &&
      document.getElementById("hk-retuning-result").textContent.includes("2 of 4"),
    restoredURL,
  );
  await page.goForward();
  await page.waitForFunction(
    (expected) =>
      location.href === expected &&
      document.getElementById("hk-retuning-result").textContent.includes("All four"),
    fittedURL,
  );
  const axe = await new AxeBuilder({ page }).analyze();
  assert.deepEqual(
    axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
    [],
  );
  await page.waitForFunction(
    () => document.getElementById("offline-status").textContent.startsWith("Ready offline"),
    {},
    { timeout: 60000 },
  );
  const cache = await page.evaluate(async () => {
    const names = await caches.keys();
    return Promise.all(
      names
        .filter((n) => n.startsWith("pyknon-"))
        .map(async (name) => ({
          name,
          files: (await (await caches.open(name)).keys()).map((r) => new URL(r.url).pathname),
        })),
    );
  });
  assert.equal(cache.length, 1);
  await context.setOffline(true);
  await page.reload();
  await page.locator("#hk-title").waitFor();
  await verified(page, "98");
  await keyboard(page, "#hk-fixed");
  await keyboard(page, "#hk-fit");
  assert.match(await page.locator("#hk-retuning-result").textContent(), /All four/);
  await save(page, '[data-hk-save="html"]', path.join(dir, "offline.html"));
  for (const room of [
    "index.html",
    "song.html",
    "canon.html",
    "trial.html",
    "rhythm.html",
    "tension.html",
    "vina.html",
    "halves.html",
    "notation.html",
    "helikon.html",
  ]) {
    await page.goto(new URL(room, base).href);
    await page.locator("h1").waitFor();
    assert.equal(await page.locator("h1").count(), 1);
  }
  assert.deepEqual(errors, []);
  await context.close();
  const portable = await browser.newContext({
    javaScriptEnabled: false,
    acceptDownloads: true,
    viewport: { width, height: 1000 },
  });
  const document = await portable.newPage(),
    remote = [];
  document.on("request", (r) => {
    if (/^https?:/.test(r.url())) remote.push(r.url());
  });
  await document.goto(pathToFileURL(path.join(dir, "study.html")).href);
  await document.locator("h1").waitFor();
  assert.equal(await document.locator("script").count(), 0);
  assert.equal(await document.locator(".source img").count(), 8);
  // Firefox suppresses page Promise continuations with JavaScript disabled.
  // Read native readiness from the driver; the retained file runs no script.
  let assetsReady = false;
  for (let attempt = 0; attempt < 100 && !assetsReady; attempt++) {
    assetsReady = await document.evaluate(
      () =>
        window.document.fonts.status === "loaded" &&
        [...window.document.images].every((i) => i.complete && i.naturalWidth > 0),
    );
    if (!assetsReady) await document.waitForTimeout(100);
  }
  assert(assetsReady, "The script-disabled reading must finish its local fonts and images.");
  assert.equal(
    await document.evaluate(() => window.document.documentElement.scrollWidth <= innerWidth),
    true,
  );
  assert.deepEqual(remote, []);
  await save(document, 'a[download="pyknon-helikon.json"]', path.join(dir, "reopened.json"));
  assert.deepEqual(JSON.parse(await readFile(path.join(dir, "reopened.json"), "utf8")), saved);
  await save(document, 'a[download="pyknon-helikon.csv"]', path.join(dir, "reopened.csv"));
  assert.equal(
    await readFile(path.join(dir, "reopened.csv"), "utf8"),
    await readFile(path.join(dir, "study.csv"), "utf8"),
  );
  await save(document, 'a[download="pyknon-helikon-interval.wav"]', path.join(dir, "interval.wav"));
  await save(document, 'a[download="pyknon-helikon.svg"]', path.join(dir, "reopened.svg"));
  await document.bringToFront();
  await document
    .locator("audio")
    .first()
    .click({ position: { x: 18, y: 25 } });
  // With scripts disabled, inspect media progress from the driver instead of
  // installing an in-document polling loop. A short clip can finish before a
  // later observation; a positive playhead still establishes native progress.
  let nativeProgress = 0;
  for (let attempt = 0; attempt < 50 && nativeProgress === 0; attempt++) {
    nativeProgress = await document
      .locator("audio")
      .first()
      .evaluate((a) => a.currentTime);
    if (nativeProgress === 0) await document.waitForTimeout(100);
  }
  assert(nativeProgress > 0, "The script-disabled native audio control must advance playback.");
  await document.evaluate(() => window.document.querySelector("audio").pause());
  if (engine === "chromium" && width === 1440) {
    await document.pdf({
      path: path.join(dir, "reading.pdf"),
      printBackground: true,
      preferCSSPageSize: true,
      tagged: true,
      outline: true,
    });
    await document.screenshot({ path: path.join(dir, "portable-opening.png") });
  }
  await portable.close();
  records.push({
    engine,
    width,
    sourceLengths: lengths,
    segments: segmentHz,
    intervalPair: pair.map((t) => t.hz),
    waves,
    cache: cache[0],
    historyRestoration: { restoredURL, fittedURL, matchingRenderedSettings: true },
    portableRemoteRequests: remote,
    axeViolations: axe.violations.length,
    errors,
  });
  await writeFile(path.join(out, "review.json"), JSON.stringify({ base, records }, null, 2));
}
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch({ headless: true });
  try {
    for (const width of [1440, 375]) await review(name, browser, width);
  } finally {
    await browser.close();
  }
}
console.log(`Completed ${records.length} complete browser journeys; receipts in ${out}`);
