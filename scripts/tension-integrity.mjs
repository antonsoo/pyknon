import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { chromium, firefox } from "playwright";

const output = path.resolve(process.argv[2] ?? "/tmp/pyknon-tension-integrity.json");
await mkdir(path.dirname(output), { recursive: true });
const results = [];
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const mode of ["hold", "substitute"]) {
      let fault = mode,
        pending = [],
        servedBad = 0;
      const server = http.createServer(async (req, res) => {
        try {
          const file =
            new URL(req.url, "http://local").pathname.replace(/^\/pyknon\//, "") || "index.html";
          assert(!file.includes(".."));
          let bytes = await readFile(path.join("dist", file));
          const send = () =>
            res
              .writeHead(200, {
                "cache-control": "no-store",
                "content-type":
                  {
                    ".html": "text/html",
                    ".js": "text/javascript",
                    ".css": "text/css",
                    ".jpg": "image/jpeg",
                    ".woff2": "font/woff2",
                    ".ttf": "font/ttf",
                  }[path.extname(file)] ?? "application/octet-stream",
              })
              .end(bytes);
          if (file === "sources/tension/meibom-13.jpg" && fault === "hold") {
            pending.push(send);
            return;
          }
          if (file === "sources/tension/meibom-13.jpg" && fault === "substitute") {
            bytes = await readFile("dist/sources/tension/jan-247.jpg");
            servedBad++;
          }
          send();
        } catch {
          res.writeHead(404).end();
        }
      });
      await new Promise((r) => server.listen(0, "127.0.0.1", r));
      const base = `http://127.0.0.1:${server.address().port}/pyknon/`,
        context = await browser.newContext({
          viewport: { width: 375, height: 1000 },
          acceptDownloads: true,
        });
      try {
        const page = await context.newPage();
        let downloads = 0;
        page.on("download", () => {
          downloads++;
        });
        await page.goto(`${base}tension.html?page=meibom-13`);
        if (mode === "hold") {
          for (let i = 0; i < 80 && pending.length < 2; i++)
            await new Promise((r) => setTimeout(r, 100));
          assert(pending.length >= 2);
          await new Promise((r) => setTimeout(r, 8500));
          assert(
            !(await page.locator("#offline-status").textContent()).startsWith("Ready offline"),
          );
          assert.equal(await page.locator("#ts-scan").isVisible(), false);
          fault = "none";
          for (const send of pending.splice(0)) send();
        } else {
          await page
            .locator("#ts-source-status")
            .filter({ hasText: /do not match/ })
            .waitFor();
          await page
            .locator("#offline-status")
            .filter({ hasText: /could not be saved|not saved/ })
            .waitFor();
          assert.equal(await page.locator("#ts-scan").isVisible(), false);
          await page.locator("#ts-save-html").click();
          await page
            .locator("#ts-save-status")
            .filter({ hasText: /Nothing saved/ })
            .waitFor();
          assert.equal(downloads, 0);
          assert.equal(await page.evaluate(() => navigator.serviceWorker.controller), null);
          assert(servedBad >= 3);
          fault = "none";
          await page.evaluate(() => window.dispatchEvent(new Event("online")));
          await page.locator("#ts-page").selectOption("jan-247");
          await page
            .locator("#ts-source-status")
            .filter({ hasText: /page verified/ })
            .waitFor();
          await page.locator("#ts-page").selectOption("meibom-13");
        }
        await page
          .locator("#ts-source-status")
          .filter({ hasText: /page verified/ })
          .waitFor();
        await page
          .locator("#offline-status")
          .filter({ hasText: /Ready offline.*six rooms/ })
          .waitFor({ timeout: 60000 });
        results.push({
          browser: name,
          version: browser.version(),
          mode,
          heldMilliseconds: mode === "hold" ? 8500 : 0,
          validWrongJpegResponses: servedBad,
          incompleteNeverReady: true,
          badReadingNotDownloaded: mode === "substitute",
          recovered: true,
        });
        console.log(
          `${name}/${mode}: incomplete edition refused; original page and complete cache recovered.`,
        );
      } finally {
        await context.close();
        server.closeAllConnections();
        await new Promise((r) => server.close(r));
      }
    }
  } finally {
    await browser.close();
  }
}
await writeFile(
  output,
  `${JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2)}\n`,
);
