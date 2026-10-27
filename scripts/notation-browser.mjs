import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4444/pyknon/";
const out = path.resolve(process.argv[3] ?? "/tmp/claude-1000/pyknon-notation/browser");
await mkdir(out, { recursive: true });
const records = [];
async function save(page, selector, file) {
  const pending = page.waitForEvent("download");
  await page.locator(selector).click();
  const download = await pending;
  assert.equal(await download.failure(), null);
  await download.saveAs(file);
  // Exercise distinct save actions rather than an artificial burst of native
  // downloads, which the browser may throttle independently of the desk.
  await page.waitForTimeout(200);
}
async function verified(page, id) {
  await page.waitForFunction((wanted) => {
    const image = document.getElementById("nt-source-image");
    return (
      document.getElementById("nt-page").value === wanted &&
      document
        .getElementById("nt-source-status")
        .textContent.startsWith("Verified complete page") &&
      image.complete &&
      image.naturalHeight === 2200
    );
  }, id);
}
async function keyboard(page, selector, key = "Enter") {
  await page.locator(selector).focus();
  await page.keyboard.press(key);
}
async function review(engine, browser, width) {
  console.log(`Reviewing ${engine} ${width}: root, signs, live sound and native files`);
  const folder = path.join(out, `${engine}-${width}`);
  await mkdir(folder, { recursive: true });
  const context = await browser.newContext({
    viewport: { width, height: 1000 },
    acceptDownloads: true,
  });
  if (engine === "chromium") await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await context.addInitScript(() => {
    window.__notationAudio = [];
    window.__notationStops = 0;
    const create = AudioContext.prototype.createOscillator;
    AudioContext.prototype.createOscillator = function () {
      const oscillator = create.call(this),
        set = oscillator.frequency.setValueAtTime.bind(oscillator.frequency),
        stop = oscillator.stop.bind(oscillator);
      oscillator.frequency.setValueAtTime = (value, time) => {
        window.__notationAudio.push({ value, time });
        return set(value, time);
      };
      oscillator.stop = (time) => {
        window.__notationStops++;
        return stop(time);
      };
      return oscillator;
    };
  });
  const page = await context.newPage(),
    errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.goto(base);
  await page.locator("#root").waitFor();
  await keyboard(page, 'header a[href="./notation.html"]');
  await page.locator("#nt-title").waitFor();
  await verified(page, "369");
  assert.match(await page.locator("#nt-result").textContent(), /^2 of 4 notes/);
  assert.equal(await page.locator("#nt-share-label").isHidden(), true);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.screenshot({ path: path.join(folder, "opening.png") });
  await keyboard(page, '[data-nt-alphabet="instrumental"]');
  assert.match(
    await page.locator("#nt-meaning").textContent(),
    /nētē synēmmenōn.*diezeugmenōn diatonos/s,
  );
  assert.match(await page.locator("#nt-meaning").textContent(), /440 Hz/);
  await keyboard(page, '[data-nt-sign="square-u"]');
  assert.match(await page.locator("#nt-meaning").textContent(), /391\.111111 Hz/);
  await keyboard(page, '[data-nt-alphabet="vocal"]');
  assert.match(await page.locator("#nt-meaning").textContent(), /440 Hz/);
  await keyboard(page, '[data-nt-sign="sigma"]');
  const sigma = await page.locator("#nt-meaning").textContent();
  await keyboard(page, '[data-nt-alphabet="instrumental"]');
  assert.equal(
    await page
      .locator("#nt-meaning")
      .textContent()
      .then((t) => t.replace("instrumental", "vocal")),
    sigma,
  );
  await keyboard(page, '[data-nt-sign="zeta"]');
  await keyboard(page, '[data-nt-alphabet="vocal"]');
  await page.locator("#nt-sound").selectOption("line");
  await keyboard(page, "#nt-play");
  await page.waitForFunction(() => window.__notationAudio.length === 8);
  const audio = await page.evaluate(() => window.__notationAudio);
  const wanted = [330, 371.25, 440, 330, 330, 440, (330 * 32) / 27, 330];
  audio.forEach((tone, index) => {
    assert(Math.abs(tone.value - wanted[index]) < 0.0001);
  });
  await keyboard(page, "#nt-stop");
  assert.equal(await page.evaluate(() => window.__notationStops >= 16), true);
  await keyboard(page, '[data-nt-sign="sigma"]');
  await page.locator("#nt-sound").selectOption("sign");
  await keyboard(page, "#nt-hear-sign");
  await page.waitForFunction(() => window.__notationAudio.length === 10);
  const control = await page.evaluate(() => window.__notationAudio.slice(-2));
  assert.equal(control[0].value, 247.5);
  assert.equal(control[1].value, control[0].value);
  await keyboard(page, "#nt-sign-stop");
  await keyboard(page, '[data-nt-sign="zeta"]');
  await page.locator("#nt-sound").selectOption("line");
  const json = path.join(folder, "translation.json");
  for (const format of ["json", "csv", "svg", "wav", "html"])
    await save(
      page,
      `[data-nt-save="${format}"]`,
      path.join(folder, format === "json" ? "translation.json" : `translation.${format}`),
    );
  const native = JSON.parse(await readFile(json, "utf8"));
  assert.deepEqual(native.state.answers, ["side-lambda", "zeta", "square-u", "side-lambda"]);
  await save(page, '[data-nt-save="frames"]', path.join(folder, "tables.csv"));
  await save(page, '[data-nt-save="frame-svg"]', path.join(folder, "tables.svg"));
  await page.locator("#translation").screenshot({ path: path.join(folder, "working-line.png") });
  const frameSign =
    engine === "chromium"
      ? width === 1440
        ? "iota"
        : "zeta"
      : width === 1440
        ? "square-u"
        : "sigma";
  await keyboard(page, `[data-nt-frame-sign="${frameSign}"]`);
  await keyboard(page, '[data-nt-frame-anchor="sign"]');
  await keyboard(page, '[data-nt-frame-source="370"]');
  await verified(page, "370");
  assert.match(await page.locator("#nt-row-label").textContent(), /HYPOLYDIAN/);
  assert.equal(await page.locator("#nt-source-band-secondary").isVisible(), frameSign === "iota");
  await keyboard(page, '[data-nt-frame-source="369"]');
  await verified(page, "369");
  assert.equal(
    await page.locator("#nt-source-band-secondary").isVisible(),
    frameSign === "square-u",
  );
  const frameAudio = [];
  for (const [anchor, prefix] of [
    ["sign", "held"],
    ["mese", "moved"],
  ]) {
    await keyboard(page, `[data-nt-frame-anchor="${anchor}"]`);
    const before = await page.evaluate(() => window.__notationAudio.length);
    await keyboard(page, "#nt-frame-play");
    await page.waitForFunction((n) => window.__notationAudio.length === n + 2, before);
    const notes = await page.evaluate(() => window.__notationAudio.slice(-2));
    if (anchor === "sign") assert.equal(notes[0].value, notes[1].value);
    else assert(Math.abs(notes[1].value / notes[0].value - 4 / 3) < 1e-7);
    frameAudio.push({ anchor, notes });
    await keyboard(page, "#nt-frame-stop");
    for (const [format, extension] of [
      ["json", "json"],
      ["frames", "csv"],
      ["frame-svg", "svg"],
      ["wav", "wav"],
    ])
      await save(page, `[data-nt-save="${format}"]`, path.join(folder, `${prefix}.${extension}`));
  }
  await page.locator("#nt-context").screenshot({ path: path.join(folder, "two-tables.png") });
  await page.locator("#nt-import").setInputFiles(json);
  await page.locator("#nt-save-status").filter({ hasText: "Saved translation reopened" }).waitFor();
  // Replace each mistaken sign through the actual keyboard-operated palette.
  await keyboard(page, "#nt-written-1");
  await keyboard(page, '[data-nt-write="bracket"]');
  await keyboard(page, "#nt-written-2");
  await keyboard(page, '[data-nt-write="zeta"]');
  assert.match(await page.locator("#nt-result").textContent(), /^4 of 4 notes/);
  assert.match(
    await page.locator("#nt-slot-detail").textContent(),
    /Both possible functions remain/,
  );
  await save(page, '[data-nt-save="csv"]', path.join(folder, "corrected.csv"));
  await page.locator("#nt-tuning").selectOption("equal");
  await page.locator("#nt-reference").selectOption("440");
  for (const format of ["json", "csv", "wav"])
    await save(page, `[data-nt-save="${format}"]`, path.join(folder, `equal.${format}`));
  await keyboard(page, "#nt-clear");
  for (const format of ["json", "csv", "wav"])
    await save(page, `[data-nt-save="${format}"]`, path.join(folder, `blank.${format}`));
  await keyboard(page, "#nt-reverse");
  assert.match(await page.locator("#nt-direction").textContent(), /Given instrumental/);
  await keyboard(page, "#nt-use-table");
  assert.match(await page.locator("#nt-result").textContent(), /^4 of 4 notes/);
  await page.locator("#nt-import").setInputFiles(json);
  await page.locator("#nt-save-status").filter({ hasText: "Saved translation reopened" }).waitFor();
  assert.match(await page.locator("#nt-result").textContent(), /^2 of 4 notes/);
  const beforeBad = await page.locator("#nt-written-line").textContent();
  await page.locator("#nt-import").setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"format":"pyknon-notation","version":2}'),
  });
  await page.locator("#nt-save-status").filter({ hasText: "version 1" }).waitFor();
  assert.equal(await page.locator("#nt-written-line").textContent(), beforeBad);
  for (let i = 0; i < 6; i++) {
    await page.locator("#nt-reading").selectOption(String(i));
    assert((await page.locator("#nt-reading-body [lang=grc]").first().textContent()).length > 15);
    await keyboard(page, "#nt-reading-source");
    await verified(page, ["367", "368", "369", "369", "369", "370"][i]);
    assert.match(
      await page.locator("#nt-row-label").textContent(),
      new RegExp(`READING ${i + 1} /`),
    );
    const visibleBands = await page
      .locator("#nt-source-band:visible, #nt-source-band-secondary:visible")
      .count();
    assert.equal(visibleBands, [0, 0, 1, 2, 2, 2][i]);
  }
  await page.locator("#nt-page").selectOption("title");
  await verified(page, "title");
  await page.locator("#nt-page").selectOption("369");
  await verified(page, "369");
  for (const [id, number] of [
    ["hypate-meson", 5],
    ["parhypate-meson", 6],
    ["diatonos-meson", 7],
    ["mese", 8],
    ["nete-synemmenon", 11],
    ["paramese", 12],
    ["trite-diezeugmenon", 13],
    ["diatonos-diezeugmenon", 14],
    ["nete-diezeugmenon", 15],
  ]) {
    await keyboard(page, `[data-nt-row="${id}"]`);
    assert.match(await page.locator("#nt-row-label").textContent(), new RegExp(`ROW ${number}$`));
    assert.equal(await page.locator("#nt-source-band").isVisible(), true);
  }
  await keyboard(page, "#nt-enlarge");
  await page.locator("#nt-pan").focus();
  const panBefore = await page
    .locator("#nt-pan")
    .evaluate((e) => ({ left: e.scrollLeft, top: e.scrollTop }));
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  assert.equal(await page.locator("#nt-pan").evaluate((b) => b.scrollLeft > 0), true);
  assert.equal(
    await page.locator("#nt-pan").evaluate((e, before) => e.scrollTop > before, panBefore.top),
    true,
  );
  await page.keyboard.press("Escape");
  await page.locator("#nt-import").setInputFiles(json);
  await page.locator("#nt-save-status").filter({ hasText: "Saved translation reopened" }).waitFor();
  const originalAddress = page.url();
  await keyboard(page, "#nt-share");
  await page.locator("#nt-share-label").waitFor();
  assert.equal(page.url(), originalAddress);
  const link = await page.locator("#nt-share-link").inputValue();
  assert.equal(new URL(link).searchParams.get("answers"), native.state.answers.join("."));
  if (engine === "chromium")
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), link);
  const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  assert.deepEqual(
    axe.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
    [],
  );
  await page
    .locator("#offline-status")
    .filter({ hasText: "Ready offline" })
    .waitFor({ timeout: 60000 });
  const cache = await page.evaluate(async () => {
    const names = await caches.keys(),
      name = names.find((n) => n.startsWith("pyknon-")),
      stored = await caches.open(name);
    return {
      name,
      files: (await stored.keys()).map((r) => new URL(r.url).pathname),
      controller: !!navigator.serviceWorker.controller,
    };
  });
  assert(cache.controller);
  assert(cache.files.includes("/pyknon/notation.html"));
  assert.equal(cache.files.filter((p) => p.startsWith("/pyknon/sources/notation/")).length, 6);
  const portable = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width, height: 1000 },
    acceptDownloads: true,
  });
  const saved = await portable.newPage(),
    requests = [];
  saved.on("request", (request) => {
    if (/^https?:/.test(request.url())) requests.push(request.url());
  });
  await saved.goto(pathToFileURL(path.join(folder, "translation.html")).href);
  // Firefox suppresses page-Promise callbacks when scripts are disabled.
  // Observe the native font state through synchronous automation evaluations.
  const fontDeadline = Date.now() + 10000;
  while (await saved.evaluate(() => document.fonts.status !== "loaded")) {
    assert(Date.now() < fontDeadline, "The embedded fonts should finish loading");
    await saved.waitForTimeout(50);
  }
  assert.equal(await saved.locator("script").count(), 0);
  assert.equal(await saved.locator(".ns-source img").count(), 5);
  await save(saved, 'a[download="pyknon-notation.json"]', path.join(folder, "from-reading.json"));
  assert.deepEqual(
    JSON.parse(await readFile(path.join(folder, "from-reading.json"), "utf8")),
    native,
  );
  // The UA play button is inside a closed control tree. Click its actual
  // leftmost control rather than treating focus on the host as that button.
  await saved.bringToFront();
  await saved.locator("audio").click({ position: { x: 25, y: 25 } });
  try {
    // Page-side rAF polling is disabled along with page scripts. Observe the
    // native media clock through separate automation evaluations instead.
    const deadline = Date.now() + 5000;
    let played = false;
    while (Date.now() < deadline) {
      if (await saved.locator("audio").evaluate((e) => e.currentTime > 0.05)) {
        played = true;
        break;
      }
      await saved.waitForTimeout(50);
    }
    assert(played, "The native media clock should advance with page scripts disabled");
  } catch (error) {
    console.error(
      engine,
      width,
      "Native audio state",
      await saved.locator("audio").evaluate((e) => ({
        readyState: e.readyState,
        paused: e.paused,
        time: e.currentTime,
        error: e.error?.message,
      })),
    );
    await saved.screenshot({ path: path.join(folder, "native-audio-failure.png") });
    throw error;
  }
  const portableLink = await saved
    .getByRole("link", { name: "Reopen this translation", exact: true })
    .getAttribute("href");
  assert.equal(new URL(portableLink).search, new URL(link).search);
  if (engine === "chromium" && width === 1440) {
    await saved.emulateMedia({ media: "print" });
    const plotTops = await saved
      .locator(".ns-frame .nt-frame-plot")
      .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().top));
    assert.equal(plotTops.length, 2);
    assert(
      Math.abs(plotTops[0] - plotTops[1]) < 1,
      "Paired plots must share an origin even when captions wrap",
    );
    await saved.pdf({
      path: path.join(folder, "translation.pdf"),
      format: "A4",
      printBackground: true,
    });
    await saved.emulateMedia({ media: "screen" });
    await saved.screenshot({ path: path.join(folder, "portable.png") });
  }
  assert.deepEqual(requests, []);
  await portable.close();
  await context.setOffline(true);
  await page.goto(portableLink);
  await page.locator("#nt-written-line").waitFor();
  await verified(page, "369");
  assert.match(await page.locator("#nt-result").textContent(), /^2 of 4 notes/);
  await save(page, '[data-nt-save="html"]', path.join(folder, "offline.html"));
  for (const file of [
    "index.html",
    "song.html",
    "canon.html",
    "trial.html",
    "rhythm.html",
    "tension.html",
    "vina.html",
    "halves.html",
    "notation.html",
  ]) {
    await page.goto(new URL(file, base).href);
    await page.locator("h1").waitFor();
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    );
  }
  await page
    .getByRole("link", { name: "Find Ζ over σον in the Seikilos inscription", exact: false })
    .click();
  await page.locator("#song-title").waitFor();
  assert.equal(new URL(page.url()).searchParams.get("s"), "1");
  assert.match(await page.locator("#selected-title").textContent(), /σον/);
  assert.match(await page.locator("#syllable-table").textContent(), /Ζ/);
  assert.match(await page.locator("#source-position").textContent(), /Highlighted: σον/);
  await page.getByRole("link", { name: "Musical signs", exact: true }).click();
  await page.locator("#nt-title").waitFor();
  await verified(page, "369");
  assert.deepEqual(errors, []);
  records.push({
    engine,
    version: browser.version(),
    width,
    base,
    initialWrongChoicesRetained: true,
    keyboardReplacement: true,
    bothTranslationDirections: true,
    ambiguousFunctionsRetained: true,
    printedRowsInspected: 9,
    readingsInspected: 6,
    completePages: 5,
    sourceKeyboardPan: true,
    liveOscillators: audio,
    liveStopCancelsAll: true,
    localStopControls: true,
    primaryDownloads: 5,
    actualEqualTuningAndBlankExports: true,
    sameToneControl: control,
    sharedTablePair: frameSign,
    referenceConstraintAudio: frameAudio,
    sourceBandsFollowSelectedReading: true,
    scriptFreeReading: true,
    portableRequests: requests,
    portableAudioPlayedWithScriptsDisabled: true,
    nativeDownloadReopened: true,
    explicitCopyWithoutNavigation: true,
    cache,
    nineRoomsOffline: true,
    offlineExport: true,
    sourceNavigationOffline:
      "The actual native link selects the stone syllable σον and its vocal zeta, then returns through Musical signs",
    axeViolations: 0,
    applicationErrors: errors,
  });
  await context.close();
}
const chrome = await chromium.launch(),
  fox = await firefox.launch();
try {
  // Native media controls share browser focus. Each student journey owns
  // that focus until it closes, including the script-disabled reading.
  for (const [name, browser] of [
    ["chromium", chrome],
    ["firefox", fox],
  ])
    for (const width of [1440, 375]) await review(name, browser, width);
  const context = await chrome.newContext({ serviceWorkers: "block" }),
    page = await context.newPage();
  await context.route("**/sources/notation/jan-369.jpg", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    await route.continue();
  });
  await page.goto(new URL("notation.html", base).href);
  await page.locator("#nt-page").selectOption("370");
  await verified(page, "370");
  await page.waitForTimeout(900);
  assert.match(await page.locator("#nt-caption").textContent(), /Printed p370/);
  await context.route("**/sources/notation/jan-367.jpg", (route) =>
    route.fulfill({ status: 200, contentType: "image/jpeg", body: "wrong edition" }),
  );
  await page.locator("#nt-page").selectOption("367");
  await page.locator("#nt-source-status").filter({ hasText: "do not match" }).waitFor();
  assert.equal(await page.locator("#nt-source-image").getAttribute("src"), null);
  await context.unroute("**/sources/notation/jan-367.jpg");
  await page.locator("#nt-retry").click();
  await verified(page, "367");
  let downloaded = false;
  page.on("download", () => {
    downloaded = true;
  });
  await context.route("**/fonts/IBMPlexSans-Regular.woff2", (route) =>
    route.fulfill({ status: 200, contentType: "font/woff2", body: "wrong font" }),
  );
  await page.locator('[data-nt-save="svg"]').click();
  await page.locator("#nt-save-status").filter({ hasText: "do not match" }).waitFor();
  assert.equal(downloaded, false);
  await context.unroute("**/fonts/IBMPlexSans-Regular.woff2");
  await save(page, '[data-nt-save="svg"]', path.join(out, "retried.svg"));
  // File reads and export assembly are asynchronous. A newer manual choice
  // must win even if an earlier, otherwise valid record finishes later.
  await page.evaluate(() => {
    const text = File.prototype.text;
    File.prototype.text = async function () {
      const value = await text.call(this);
      if (this.name === "slow-translation.json")
        await new Promise((resolve) => {
          window.__releaseNotationImport = resolve;
        });
      return value;
    };
  });
  await page.locator("#nt-import").setInputFiles({
    name: "slow-translation.json",
    mimeType: "application/json",
    buffer: await readFile(path.join(out, "chromium-1440/translation.json")),
  });
  await page.waitForFunction(() => typeof window.__releaseNotationImport === "function");
  await keyboard(page, "#nt-written-1");
  await keyboard(page, '[data-nt-write="bracket"]');
  await page.evaluate(() => window.__releaseNotationImport());
  await page.locator("#nt-save-status").filter({ hasText: "working line changed" }).waitFor();
  assert.match(await page.locator("#nt-written-1").getAttribute("aria-label"), /sideways pi/);
  let releaseFont, noticeFont;
  const fontGate = new Promise((resolve) => {
      releaseFont = resolve;
    }),
    fontRequested = new Promise((resolve) => {
      noticeFont = resolve;
    });
  await context.route("**/fonts/NotoSerif-Regular.ttf", async (route) => {
    noticeFont();
    await fontGate;
    await route.continue();
  });
  downloaded = false;
  await page.locator('[data-nt-save="html"]').click();
  await Promise.race([
    fontRequested,
    new Promise((_, reject) =>
      setTimeout(() => reject(Error("Retained font fetch was not reached")), 10000),
    ),
  ]);
  await keyboard(page, "#nt-written-1");
  await keyboard(page, '[data-nt-write="zeta"]');
  releaseFont();
  await page.locator("#nt-save-status").filter({ hasText: "settings changed" }).waitFor();
  assert.equal(downloaded, false);
  await context.unroute("**/fonts/NotoSerif-Regular.ttf");
  const retried = path.join(out, "retried-reading.html");
  await save(page, '[data-nt-save="html"]', retried);
  const actual = await readFile(retried, "utf8"),
    encoded =
      /download="pyknon-notation.json" href="data:application\/json;base64,([A-Za-z0-9+/=]+)"/.exec(
        actual,
      );
  assert(encoded);
  assert.equal(JSON.parse(Buffer.from(encoded[1], "base64").toString()).state.answers[1], "zeta");
  records.push({
    sourceRace: "late default page cannot replace the selected Hypolydian page",
    substitutedSource: "withheld; no stale image",
    substitutedFont: "withholds export",
    retry: "same source and export succeed after expected bytes return",
    delayedImport: "newer manual sign remains; stale file cannot replace it",
    changedDuringExport: "download withheld, retry keeps the actual newer line",
  });
  await context.close();
  await writeFile(
    path.join(out, "review.json"),
    `${JSON.stringify({ checkedAtUtc: new Date().toISOString(), base, scope: "Actual browser operation and native downloads at the recorded URL. Script-disabled and network-disabled operation are observed; physical sound output and public-byte identity are separate claims.", records }, null, 2)}\n`,
  );
  console.log(JSON.stringify(records, null, 2));
} finally {
  await Promise.all([chrome.close(), fox.close()]);
}
