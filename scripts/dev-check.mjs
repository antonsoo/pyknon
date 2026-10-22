// biome-ignore-all lint/performance/useDomNodeTextContent: Review visible learner-facing output.
import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { chromium, firefox } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4329/pyknon/";
const output = process.argv[3] ?? "/tmp/pyknon-dev-review.json";
const configurations = [];
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const width of [1440, 375])
      for (const file of ["", "song.html", "canon.html"]) {
        const page = await browser.newPage({ viewport: { width, height: 1000 } });
        const errors = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.addInitScript(() => {
          window.violations = [];
          document.addEventListener("securitypolicyviolation", (e) =>
            window.violations.push({ directive: e.violatedDirective, uri: e.blockedURI }),
          );
        });
        await page.goto(base + file);
        await page.evaluate(() => document.fonts.ready);
        const style = await page.evaluate(() => ({
          font: getComputedStyle(document.body).fontFamily,
          color: getComputedStyle(document.body).color,
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          violations: window.violations,
        }));
        assert(style.font.startsWith("Plex"));
        assert.equal(style.color, "rgb(44, 37, 56)");
        assert.equal(style.overflow, false);
        assert.deepEqual(style.violations, []);
        assert.deepEqual(errors, []);
        if (file === "canon.html") {
          await page.locator('.step-buttons [data-step="3"]').click();
          assert((await page.locator("#integer-title").innerText()).includes("373248"));
          await page.locator('[data-passage="2"]').click();
          assert((await page.locator(".greek-line").innerText()).includes("[ἐστι]"));
        } else if (file) {
          await page.locator('[data-verse="3"]').click();
          await page.locator('[data-syllable="28"]').click();
          assert.equal(await page.locator("#syllable-table tr").count(), 3);
        } else {
          await page.locator('[data-genus="diatonic"]').click();
          assert.equal(
            await page.locator('[data-genus="diatonic"]').getAttribute("aria-pressed"),
            "true",
          );
        }
        configurations.push({
          browser: name,
          version: browser.version(),
          width,
          file: file || "index.html",
          ...style,
          pageErrors: errors,
        });
        await page.close();
      }
  } finally {
    await browser.close();
  }
}
await writeFile(
  output,
  `${JSON.stringify({ checkedAt: new Date().toISOString(), scope: "Documented Vite development server; all three pages with their actual Content Security Policy", configurations }, null, 2)}\n`,
);
console.log(
  `Verified ${configurations.length} styled development workflows with no CSP violations.`,
);
