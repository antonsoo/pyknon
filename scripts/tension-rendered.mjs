import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { chromium, firefox } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4430/pyknon/",
  output = process.argv[3] ?? "/tmp/pyknon-tension-rendered.json",
  cases = [];
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const width of [1440, 375]) {
      const context = await browser.newContext({
          viewport: { width, height: 1000 },
          serviceWorkers: "block",
        }),
        page = await context.newPage();
      try {
        await page.goto(`${base}tension.html`);
        await page.locator(".ts-adjust summary").click();
        await page.locator("#ts-repair").click();
        assert.equal(await page.locator("#ts-exact").inputValue(), "24");
        await page.locator("#ts-repair-all").click();
        assert.match(await page.locator("#ts-table").textContent(), /32\/3/);
        await page.locator("#ts-reset").click();
        assert.equal(await page.locator("#ts-exact").inputValue(), "12");
        for (const weights of [
          "8,9,12",
          "32/3,27/2,24",
          "6,6,6",
          "30,30,30",
          "6.0001,29.9999,13.5",
        ]) {
          await page.goto(`${base}tension.html?w=${encodeURIComponent(weights)}&n=3`);
          await page.locator("#ts-drawing svg").waitFor();
          await page.evaluate(() => new Promise(requestAnimationFrame));
          const actual = await page.evaluate(() => {
            const drawing = document.querySelector("#ts-drawing svg"),
              ruler = document.querySelector("#ts-ruler svg");
            return {
              drawingWidth: drawing.viewBox.baseVal.width,
              rulerWidth: ruler.viewBox.baseVal.width,
              masses: [...drawing.querySelectorAll("[data-ts-mass]")].map((e) => ({
                index: Number(e.dataset.tsMass),
                height: e.height.baseVal.value,
                y: e.y.baseVal.value,
              })),
              pitch: [...ruler.querySelectorAll("[data-ts-pitch]")].map((e) => ({
                id: e.dataset.tsPitch,
                x: e.cx.baseVal.value,
                y: e.cy.baseVal.value,
              })),
              wires: [...drawing.querySelectorAll("[data-ts-string]")].map((g) =>
                g.querySelector("path").getAttribute("d"),
              ),
            };
          });
          cases.push({ browser: name, width, weights: ["6", ...weights.split(",")], ...actual });
        }
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
}
await writeFile(
  output,
  `${JSON.stringify({ checkedAt: new Date().toISOString(), cases }, null, 2)}\n`,
);
console.log(
  `${cases.length} actual SVG views retained; repair controls passed in all four configurations.`,
);
