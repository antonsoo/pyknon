import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { chromium, firefox } from "playwright";

const [oldDirectory, outputFile] = process.argv.slice(2);
assert(oldDirectory && outputFile);
const output = path.resolve(outputFile);
await mkdir(path.dirname(output), { recursive: true });

async function inventory(root) {
  const files = new Map();
  async function visit(folder) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      if (entry.name.startsWith(".")) continue;
      const file = path.join(folder, entry.name);
      if (entry.isDirectory()) await visit(file);
      else if (entry.isFile())
        files.set(path.relative(root, file).split(path.sep).join("/"), await readFile(file));
    }
  }
  await visit(root);
  assert(files.has("index.html") && files.has("sw.js"));
  return files;
}

const oldFiles = await inventory(path.resolve(oldDirectory));
const newFiles = await inventory(path.resolve("dist"));
assert(!oldFiles.has("vina.html") && newFiles.has("vina.html"));
const oldEdition = /const EDITION = "([a-f0-9]+)"/.exec(oldFiles.get("sw.js").toString())[1];
const newEdition = /const EDITION = "([a-f0-9]+)"/.exec(newFiles.get("sw.js").toString())[1];
let served = oldFiles;
let networkAvailable = true;
let workerFiles = oldFiles;
let fault = "none";
let pending = [];
let badResponses = [];
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
};
function send(response, name, bytes) {
  response.writeHead(200, {
    "content-type": mime[path.extname(name)] ?? "application/octet-stream",
    "cache-control": "no-store",
  });
  response.end(bytes);
}
const server = http.createServer((request, response) => {
  if (!networkAvailable) {
    request.socket.destroy();
    return;
  }
  const url = new URL(request.url, "http://localhost");
  if (!url.pathname.startsWith("/pyknon/")) {
    response.writeHead(404).end();
    return;
  }
  const name = decodeURIComponent(url.pathname.slice("/pyknon/".length)) || "index.html";
  const bytes = (name === "sw.js" ? workerFiles : served).get(name);
  if (!bytes) {
    response.writeHead(404).end();
    return;
  }
  if (
    served === newFiles &&
    name === "vina.html" &&
    request.headers["sec-fetch-dest"] !== "document"
  ) {
    if (fault === "hold") {
      pending.push({ response, name, bytes });
      return;
    }
    if (fault === "wrong") {
      badResponses.push({ url: url.pathname, status: 200, oldEntryInsteadOfNewRoom: true });
      send(response, name, oldFiles.get("index.html"));
      return;
    }
  }
  send(response, name, bytes);
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const base = `http://127.0.0.1:${server.address().port}/pyknon/`;
const records = [];
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitUntil(predicate, message) {
  const started = Date.now();
  while (!(await predicate())) {
    if (Date.now() - started > 30000) throw new Error(message);
    await pause(250);
  }
}

async function inspect(page) {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const worker = navigator.serviceWorker.controller;
        if (!worker) {
          resolve(null);
          return;
        }
        const channel = new MessageChannel();
        const timeout = setTimeout(() => {
          channel.port1.close();
          reject(new Error("inspector timeout"));
        }, 1500);
        channel.port1.onmessage = (event) => {
          clearTimeout(timeout);
          channel.port1.close();
          resolve(event.data);
        };
        worker.postMessage({ type: "PYKNON_INSPECT" }, [channel.port2]);
      }),
  );
}

async function triggerUpdate(page) {
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    window.__workerStates ??= [];
    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      worker?.addEventListener("statechange", () => window.__workerStates.push(worker.state));
    });
    void registration.update().catch(() => {});
  });
}

try {
  for (const [engine, launcher] of [
    ["chromium", chromium],
    ["firefox", firefox],
  ]) {
    if (process.env.VINA_ENGINE && process.env.VINA_ENGINE !== engine) continue;
    const browser = await launcher.launch();
    try {
      // Firefox may load this previously unknown entry without an old
      // controller. There is then no old controller inspection to delay.
      for (const mode of engine === "firefox" ? ["hold", "wrong"] : ["hold", "wrong", "late"]) {
        if (process.env.VINA_UPGRADE_MODE && process.env.VINA_UPGRADE_MODE !== mode) continue;
        served = oldFiles;
        workerFiles = oldFiles;
        fault = "none";
        pending = [];
        badResponses = [];
        const context = await browser.newContext({ viewport: { width: 375, height: 1000 } });
        try {
          const oldPage = await context.newPage();
          await oldPage.goto(base);
          await oldPage.waitForFunction(() =>
            document.getElementById("offline-status").textContent.startsWith("Ready offline"),
          );
          await oldPage.waitForFunction(() => navigator.serviceWorker.controller !== null);
          assert.equal((await inspect(oldPage)).edition, oldEdition);
          served = newFiles;
          // A new entry can arrive before the matching worker becomes available.
          // Let it inspect the actual complete older edition first.
          const current = await context.newPage();
          const consoleErrors = [];
          current.on("console", (message) => {
            if (message.type() === "error") consoleErrors.push(message.text());
          });
          if (mode === "late") {
            // Delay an actual old-worker reply without changing either its data
            // or cache behavior. The next worker reply follows the real channel.
            await current.addInitScript(() => {
              const post = ServiceWorker.prototype.postMessage;
              ServiceWorker.prototype.postMessage = function (message, transfer) {
                window.__postSeen ??= [];
                window.__postSeen.push(message?.type);
                if (
                  message?.type !== "PYKNON_INSPECT" ||
                  sessionStorage.getItem("pyknon-vina-review-held")
                )
                  return post.call(this, message, transfer);
                sessionStorage.setItem("pyknon-vina-review-held", "1");
                const relay = new MessageChannel();
                relay.port1.onmessage = (event) => {
                  relay.port1.close();
                  window.__heldReply = event.data;
                  window.__heldAt = performance.now();
                  window.__deliverOldReply = () => {
                    transfer[0].postMessage(event.data);
                    transfer[0].close();
                  };
                };
                return post.call(this, message, [relay.port2]);
              };
            });
          }
          await current.goto(
            `${base}vina.html?tuning=quarter&tenth=215&position=4000&root=110&selected=0&sound=compare&reading=5&page=29#vn-bench`,
          );
          await current.waitForFunction(() =>
            document.getElementById("vn-pair")?.textContent.includes("97.7778 Hz"),
          );
          if (mode === "late")
            await current
              .waitForFunction((edition) => window.__heldReply?.edition === edition, oldEdition)
              .catch(async (error) => {
                console.error(
                  "Late-reply diagnostics",
                  engine,
                  await current.evaluate(() => ({
                    seen: window.__postSeen,
                    held: window.__heldReply,
                    stored: sessionStorage.getItem("pyknon-vina-review-held"),
                    controller: navigator.serviceWorker.controller?.state,
                    status: document.querySelector("#offline-status")?.textContent,
                  })),
                );
                throw error;
              });
          else
            await current.waitForFunction(
              () => !document.getElementById("offline-status").textContent.startsWith("Checking"),
            );
          const before = await current.locator("#offline-status").textContent();
          assert(
            !before.startsWith("Ready offline"),
            "The new page claimed readiness before its edition was complete.",
          );
          workerFiles = newFiles;
          fault = mode === "wrong" ? "wrong" : "hold";
          await triggerUpdate(oldPage);
          await waitUntil(
            () => (mode === "wrong" ? badResponses.length > 0 : pending.length > 0),
            "The new vina page was not requested by precaching.",
          );
          if (mode === "hold") {
            await pause(8500);
            assert(
              !(await current.locator("#offline-status").textContent()).startsWith("Ready offline"),
            );
            assert.equal((await inspect(oldPage)).edition, oldEdition);
          }
          if (mode === "wrong")
            await oldPage.waitForFunction(() => window.__workerStates?.includes("redundant"));
          let oldStatusDuringUpdate = await oldPage.locator("#offline-status").textContent();
          if (process.env.VINA_OLD_ORIGIN_OUTAGE) {
            // Refuse actual HTTP requests while the older installation still
            // controls the old tab. The held request stays pending; all new
            // requests are destroyed, so navigation must use the older cache.
            networkAvailable = false;
            await assert.rejects(fetch(base));
            const cachedOldTab = await context.newPage();
            await cachedOldTab.goto(base);
            await cachedOldTab.locator("#listen-title").waitFor();
            assert.equal((await inspect(cachedOldTab)).edition, oldEdition);
            assert.equal((await inspect(cachedOldTab)).complete, true);
            await cachedOldTab.locator('[data-genus="chromatic"]').click();
            assert.equal(new URL(cachedOldTab.url()).searchParams.get("g"), "chromatic");
            oldStatusDuringUpdate = await cachedOldTab.locator("#offline-status").textContent();
            await cachedOldTab.close();
            networkAvailable = true;
          }
          // Stop any additional precache request from inheriting the failure.
          fault = "none";
          if (mode === "wrong") {
            await triggerUpdate(oldPage);
          } else {
            for (const item of pending.splice(0))
              if (!item.response.destroyed) send(item.response, item.name, item.bytes);
          }
          await pause(250);
          await waitUntil(async () => {
            const value = await inspect(current);
            return value?.edition === newEdition && value.complete === true;
          }, "The complete new worker never controlled the page.").catch(async (error) => {
            console.error(
              engine,
              mode,
              await current.evaluate(async () => {
                const r = await navigator.serviceWorker.getRegistration();
                return {
                  status: document.querySelector("#offline-status")?.textContent,
                  controller: navigator.serviceWorker.controller?.state,
                  active: r?.active?.state,
                  installing: r?.installing?.state,
                  waiting: r?.waiting?.state,
                  keys: await caches.keys(),
                };
              }),
              consoleErrors,
            );
            throw error;
          });
          const readyWorker = await inspect(current);
          await current.waitForFunction(() =>
            document.getElementById("offline-status").textContent.startsWith("Ready offline"),
          );
          const after = await current.locator("#offline-status").textContent();
          assert.equal(after.startsWith("Ready offline"), true);
          if (mode === "late") {
            assert(await current.evaluate(() => performance.now() - window.__heldAt < 1800));
            await current.evaluate(async () => {
              window.__deliverOldReply();
              await new Promise(requestAnimationFrame);
              await new Promise(requestAnimationFrame);
            });
            assert(
              (await current.locator("#offline-status").textContent()).startsWith("Ready offline"),
              "An older reply overwrote readiness for the current edition.",
            );
          }
          await oldPage
            .locator("#offline-status")
            .filter({ hasText: /different edition/ })
            .waitFor();
          await oldPage.getByRole("button", { name: "Reload saved edition" }).click();
          await oldPage
            .locator("#offline-status")
            .filter({ hasText: /Ready offline.*seven rooms/ })
            .waitFor();
          await oldPage.getByRole("link", { name: "Rhythm", exact: true }).waitFor();
          await context.setOffline(true);
          await current.reload();
          await current
            .locator("#offline-status")
            .filter({ hasText: /Ready offline.*seven rooms/ })
            .waitFor();
          assert.equal(await current.locator("#vn-tuning").inputValue(), "quarter");
          await current.locator("#vn-play").click();
          await current.waitForFunction(() => document.querySelector(".vn-sounding"));
          await current.locator("#vn-stop").click();
          const waiting = current.waitForEvent("download");
          await current.locator("#vn-save-html").click();
          const worksheet = await waiting;
          await worksheet.saveAs(
            path.join(path.dirname(output), `${engine}-${mode}-vina-offline.html`),
          );
          assert.equal(await worksheet.failure(), null);
          const visited = [];
          for (const room of [
            "index.html",
            "song.html",
            "canon.html",
            "trial.html",
            "rhythm.html",
            "tension.html",
            "vina.html",
          ]) {
            await current.goto(base + room);
            await current
              .locator("#offline-status")
              .filter({ hasText: /Ready offline.*seven rooms/ })
              .waitFor();
            visited.push(room);
          }
          await current.locator("#vn-fail").click();
          assert.match(await current.locator("#vn-validity").textContent(), /reverses direction/);
          // Read-only inspection must not recreate a cache that has been removed.
          await current.evaluate(async (edition) => {
            await caches.delete(`pyknon-${edition}`);
          }, newEdition);
          assert.equal((await inspect(current)).complete, false);
          assert.equal(
            await current.evaluate(
              async (edition) => (await caches.keys()).includes(`pyknon-${edition}`),
              newEdition,
            ),
            false,
          );
          records.push({
            engine,
            mode,
            oldEdition,
            newEdition,
            before,
            workerAfter: readyWorker,
            after,
            automaticallyAcknowledged: true,
            staleReplyIgnored: mode === "late",
            wrongHttp200Responses: [...badResponses],
            expectedIntegrityConsoleErrors: consoleErrors,
            offlineSevenRooms: visited,
            oldRoomUsedWithOriginRefusingRequests: Boolean(process.env.VINA_OLD_ORIGIN_OUTAGE),
            oldStatusDuringUpdate,
            oldOpenTabAcknowledgedThenReloaded: true,
            inspectionAfterDeletionDidNotCreateCache: true,
            offlineIllustratedReadingSaved: true,
          });
          process.stdout.write(`${engine}/${mode}: readiness and offline upgrade verified.\n`);
        } finally {
          await context.close();
        }
      }
    } finally {
      await browser.close();
    }
  }
} finally {
  for (const item of pending.splice(0)) item.response.destroy();
  server.closeAllConnections();
  await new Promise((resolve) => server.close(resolve));
  await writeFile(
    output,
    `${JSON.stringify({ scope: "Controlled six-to-seven-room upgrade at 375 px; Chromium authentic late reply before inspector timeout, plus held/substituted precache in both engines; browser offline while local origin remains available", currentWorkerSha256: createHash("sha256").update(newFiles.get("sw.js")).digest("hex"), oldFileCount: oldFiles.size, newFileCount: newFiles.size, records }, null, 2)}\n`,
  );
}
