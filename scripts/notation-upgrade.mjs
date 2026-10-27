import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { chromium, firefox } from "playwright";

const [oldDirectory, newDirectory, outputFile] = process.argv.slice(2);
assert(oldDirectory && newDirectory && outputFile);
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
const newFiles = await inventory(path.resolve(newDirectory));
assert(
  oldFiles.has("halves.html") && !oldFiles.has("notation.html") && newFiles.has("notation.html"),
);
const oldEdition = /const EDITION = "([a-f0-9]+)"/.exec(oldFiles.get("sw.js").toString())[1];
const newEdition = /const EDITION = "([a-f0-9]+)"/.exec(newFiles.get("sw.js").toString())[1];
let served = oldFiles;
let networkAvailable = true;
let workerFiles = oldFiles;
let fault = "none";
let pending = [];
let badResponses = [];
let requestLog = [];
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
  requestLog.push({ name, fault, worker: workerFiles === newFiles ? "new" : "old" });
  const bytes = (name === "sw.js" ? workerFiles : served).get(name);
  if (!bytes) {
    response.writeHead(404).end();
    return;
  }
  if (served === newFiles && name === "sources/notation/jan-370.jpg") {
    if (fault === "hold") {
      pending.push({ response, name, bytes });
      return;
    }
    if (fault === "wrong") {
      badResponses.push({ url: url.pathname, status: 200, wrongSourcePage: true });
      send(response, name, newFiles.get("sources/notation/jan-369.jpg"));
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
    const browser = await launcher.launch();
    try {
      for (const mode of ["hold", "wrong"]) {
        served = oldFiles;
        workerFiles = oldFiles;
        networkAvailable = true;
        fault = "none";
        pending = [];
        badResponses = [];
        requestLog = [];
        const context = await browser.newContext({ viewport: { width: 375, height: 1000 } });
        try {
          const old = await context.newPage();
          await old.goto(base);
          await old
            .locator("#offline-status")
            .filter({ hasText: /Ready offline/ })
            .waitFor();
          assert.equal((await inspect(old)).edition, oldEdition);
          served = newFiles;
          const current = await context.newPage();
          await current.goto(`${base}notation.html`);
          await current.locator("#nt-result").waitFor();
          await waitUntil(
            async () =>
              !(await current.locator("#offline-status").textContent()).startsWith("Checking"),
            "new edition inspected",
          );
          const before = await current.locator("#offline-status").textContent();
          assert(!before.startsWith("Ready offline"));
          workerFiles = newFiles;
          fault = mode;
          await triggerUpdate(old);
          await waitUntil(
            () => (mode === "hold" ? pending.length > 0 : badResponses.length > 0),
            "precache source reached",
          );
          if (mode === "hold") await pause(2500);
          else await old.waitForFunction(() => window.__workerStates?.includes("redundant"));
          assert.equal((await inspect(old)).edition, oldEdition);
          assert(
            !(await current.locator("#offline-status").textContent()).startsWith("Ready offline"),
          );
          // An old lesson remains usable while actual origin requests fail.
          networkAvailable = false;
          await assert.rejects(fetch(base));
          const cached = await context.newPage();
          await cached.goto(base);
          await cached.locator("#listen-title").waitFor();
          await cached.locator('[data-genus="chromatic"]').click();
          assert.equal((await inspect(cached)).edition, oldEdition);
          await cached.close();
          networkAvailable = true;
          fault = "none";
          if (mode === "wrong") await triggerUpdate(old);
          else
            for (const item of pending.splice(0))
              if (!item.response.destroyed) send(item.response, item.name, item.bytes);
          try {
            await waitUntil(async () => {
              const reply = await inspect(current);
              return reply?.edition === newEdition && reply.complete;
            }, "new complete worker controls");
          } catch (error) {
            const diagnostic = await current.evaluate(async () => {
              const registration = await navigator.serviceWorker.getRegistration();
              return {
                status: document.getElementById("offline-status").textContent,
                states: window.__workerStates,
                controller: navigator.serviceWorker.controller?.state,
                installing: registration?.installing?.state,
                waiting: registration?.waiting?.state,
                active: registration?.active?.state,
                caches: await Promise.all(
                  (await caches.keys()).map(async (name) => ({
                    name,
                    files: (await (await caches.open(name)).keys()).length,
                  })),
                ),
              };
            });
            await writeFile(
              path.join(path.dirname(output), `${engine}-${mode}-failure.json`),
              JSON.stringify({ diagnostic, requests: requestLog }, null, 2),
            );
            throw error;
          }
          await current
            .locator("#offline-status")
            .filter({ hasText: /Ready offline.*nine rooms/ })
            .waitFor();
          await old
            .locator("#offline-status")
            .filter({ hasText: /different edition/ })
            .waitFor();
          await old.getByRole("button", { name: "Reload saved edition" }).click();
          await old
            .locator("#offline-status")
            .filter({ hasText: /Ready offline.*nine rooms/ })
            .waitFor();
          networkAvailable = false;
          server.closeAllConnections();
          await assert.rejects(fetch(base));
          await context.setOffline(true);
          const rooms = [];
          for (const room of [
            "index.html",
            "song.html",
            "canon.html",
            "trial.html",
            "rhythm.html",
            "tension.html",
            "vina.html",
            "notation.html",
            "halves.html",
          ]) {
            await current.goto(base + room);
            await current
              .locator("#offline-status")
              .filter({ hasText: /Ready offline.*nine rooms/ })
              .waitFor();
            rooms.push(room);
          }
          await current.goto(`${base}notation.html`);
          await current.locator("#nt-use-table").click();
          assert.match(await current.locator("#nt-result").textContent(), /^4 of 4 notes/);
          await current.locator('[data-nt-frame-source="370"]').click();
          await current
            .locator("#nt-source-status")
            .filter({ hasText: "Verified complete page" })
            .waitFor();
          assert.equal(await current.locator("#nt-source-band-secondary").isVisible(), true);
          await current.locator("#nt-frame-play").click();
          await current.locator("#nt-frame-stop").click();
          const [d] = await Promise.all([
            current.waitForEvent("download"),
            current.locator('[data-nt-save="html"]').click(),
          ]);
          await d.saveAs(path.join(path.dirname(output), `${engine}-${mode}-offline.html`));
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
            oldOriginRefusedRequests: true,
            oldTabReloaded: true,
            wrongHttp200Responses: badResponses,
            offlineNineRooms: rooms,
            offlineHTMLSaved: true,
            readOnlyInspectorDidNotRecreateDeletedCache: true,
          });
          console.log(`${engine}/${mode} actual eight-to-nine-room upgrade passed`);
        } finally {
          networkAvailable = true;
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
  await new Promise((r) => server.close(r));
  await writeFile(
    output,
    `${JSON.stringify({ scope: "Authentic previously published eight-room worker to the new nine-room build; held and substituted source page in both browsers; old and new use with actual origin refusing requests", oldEdition, newEdition, oldFileCount: oldFiles.size, newFileCount: newFiles.size, currentWorkerSha256: createHash("sha256").update(newFiles.get("sw.js")).digest("hex"), records }, null, 2)}\n`,
  );
}
