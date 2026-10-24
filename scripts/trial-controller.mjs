import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { chromium, firefox } from "playwright";

const [before, outputName] = process.argv.slice(2);
assert(before && outputName);
const output = path.resolve(outputName);
await mkdir(path.dirname(output), { recursive: true });
const report = {
  scope:
    "Controlled missed initial activation claim; actual worker messages, complete cache and offline saved-reading attempts",
  intervention:
    "Suppress only the activation event's clients.claim call in served sw.js; leave the new matching-edition CLAIM message intact. sw.js is not precached.",
  cases: [],
};
async function until(fn) {
  const deadline = Date.now() + 15000;
  while (!(await fn())) {
    assert(Date.now() < deadline, "Timed out");
    await new Promise((r) => setTimeout(r, 30));
  }
}
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const [phase, directory] of [
      ["before", before],
      ["after", "dist"],
    ]) {
      const server = createServer(async (req, res) => {
        try {
          const file =
            new URL(req.url, "http://local").pathname.replace(/^\/pyknon\//, "") || "index.html";
          let bytes = await readFile(path.join(directory, file));
          if (file === "sw.js") {
            const text = bytes.toString();
            assert(text.includes(".then(() => self.clients.claim())"));
            bytes = Buffer.from(
              text.replace(".then(() => self.clients.claim())", ".then(() => {})"),
            );
          }
          res
            .writeHead(200, {
              "Content-Type":
                {
                  ".html": "text/html",
                  ".js": "text/javascript",
                  ".css": "text/css",
                  ".jpg": "image/jpeg",
                  ".ttf": "font/ttf",
                  ".woff2": "font/woff2",
                }[path.extname(file)] ?? "application/octet-stream",
              "Cache-Control": "no-store",
            })
            .end(bytes);
        } catch {
          res.writeHead(404).end();
        }
      });
      await new Promise((r) => server.listen(0, "127.0.0.1", r));
      const context = await browser.newContext({ acceptDownloads: true });
      try {
        const page = await context.newPage();
        await page.goto(`http://127.0.0.1:${server.address().port}/pyknon/trial.html`);
        await until(() =>
          page.evaluate(
            async () =>
              (await navigator.serviceWorker.getRegistration())?.active?.state === "activated",
          ),
        );
        await page
          .locator("#offline-status")
          .filter({ hasText: /^Ready offline/ })
          .waitFor();
        const controlled = await page.evaluate(() => !!navigator.serviceWorker.controller);
        assert.equal(controlled, phase === "after");
        const beforeStatus = await page.locator("#offline-status").textContent();
        await context.setOffline(true);
        let downloaded = false;
        if (phase === "before") {
          page.on("download", () => {
            downloaded = true;
          });
          await page.locator("#tr-save").click();
          await page
            .locator("#tr-save-status")
            .filter({ hasText: /could not be prepared/ })
            .waitFor();
          assert.equal(downloaded, false);
        } else {
          const waiting = page.waitForEvent("download");
          await page.locator("#tr-save").click();
          await (await waiting).saveAs(
            path.join(path.dirname(output), `${name}-claimed-reading.html`),
          );
          downloaded = true;
        }
        report.cases.push({
          browser: name,
          phase,
          activatedWorker: true,
          controlled,
          status: beforeStatus,
          offlineReadingDownloaded: downloaded,
        });
        console.log(`${name} ${phase}: controlled=${controlled}, offline reading=${downloaded}`);
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
await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
