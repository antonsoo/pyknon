import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium, firefox } from "playwright";

const [beforeDirectory, outputDirectory, hostedBase] = process.argv.slice(2);
assert(beforeDirectory && outputDirectory);
const out = path.resolve(outputDirectory);
await mkdir(out, { recursive: true });
const rooms = [
  { file: "index.html", name: "Tetrachords", marker: "#listen" },
  { file: "song.html", name: "Read a song", marker: "#reader" },
  { file: "canon.html", name: "Six tones", marker: "#canon" },
  { file: "trial.html", name: "String trial", marker: "#trial" },
];
async function inventory(root) {
  const files = new Map();
  async function visit(dir) {
    for (const e of await readdir(dir, { withFileTypes: true })) {
      const file = path.join(dir, e.name);
      if (e.isDirectory()) await visit(file);
      else files.set(path.relative(root, file).split(path.sep).join("/"), await readFile(file));
    }
  }
  await visit(root);
  return files;
}
const previous = await inventory(beforeDirectory),
  current = await inventory("dist");
const report = {
  checkedAt: new Date().toISOString(),
  scope: hostedBase
    ? "Public navigation; canonical current build verified separately"
    : "Frozen local before/after production builds",
  configurations: [],
  build: [...current].map(([file, b]) => ({
    file,
    sha256: createHash("sha256").update(b).digest("hex"),
  })),
};
async function serve(files) {
  const server = createServer((req, res) => {
    const file =
      new URL(req.url, "http://local").pathname.replace(/^\/pyknon\//, "") || "index.html";
    const bytes = files.get(file);
    if (!bytes) {
      res.writeHead(404).end();
      return;
    }
    res
      .writeHead(200, {
        "Content-Type":
          {
            ".js": "text/javascript",
            ".css": "text/css",
            ".html": "text/html",
            ".jpg": "image/jpeg",
            ".ttf": "font/ttf",
            ".woff2": "font/woff2",
          }[path.extname(file)] ?? "application/octet-stream",
        "Cache-Control": "no-store",
      })
      .end(bytes);
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return {
    base: `http://127.0.0.1:${server.address().port}/pyknon/`,
    close: async () => {
      server.closeAllConnections();
      await new Promise((r) => server.close(r));
    },
  };
}
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await engine.launch();
  try {
    for (const [phase, widths, files] of hostedBase
      ? [["hosted", [320, 375, 1440], current]]
      : [
          ["before", [320, 375], previous],
          ["after", [320, 375, 1440], current],
        ]) {
      const origin = await serve(files),
        base = hostedBase ?? origin.base;
      try {
        for (const width of widths) {
          const context = await browser.newContext({ viewport: { width, height: 1000 } });
          const page = await context.newPage(),
            errors = [],
            item = { browser: name, width, phase, rooms: [], keyboardRoutes: [] };
          page.on("pageerror", (e) => errors.push(String(e)));
          try {
            for (const room of rooms) {
              await page.goto(base + room.file);
              await page.locator(room.marker).waitFor();
              await page.evaluate(() => document.fonts.ready);
              const nav = page.locator("header nav"),
                links = [];
              for (const target of rooms) {
                const link = nav.getByRole("link", {
                  name: target.name,
                  exact: true,
                  includeHidden: true,
                });
                const visible = await link.isVisible(),
                  box = await link.boundingBox();
                const withinWidth = box !== null && box.x >= 0 && box.x + box.width <= width + 1;
                links.push({ name: target.name, visible, withinWidth, box });
                if (phase !== "before") {
                  assert(
                    visible && withinWidth,
                    `${phase}/${name}/${width}/${room.file}: ${target.name}`,
                  );
                  if (width < 621) {
                    assert(
                      box.height >= 31.99,
                      `${phase}/${name}/${width}/${room.file}: ${target.name} height ${box.height}`,
                    );
                    assert.equal(
                      await link.evaluate((el) => getComputedStyle(el).minHeight),
                      "32px",
                    );
                  }
                }
              }
              const currentLink = await nav.locator('[aria-current="page"]').allTextContents();
              const overflow = await page.evaluate(
                () => document.documentElement.scrollWidth > innerWidth + 1,
              );
              if (phase !== "before") {
                assert.deepEqual(currentLink, [room.name]);
                assert.equal(
                  overflow,
                  false,
                  `${phase}/${name}/${width}/${room.file}: page overflow`,
                );
              }
              if (phase === "before" && room.file === "trial.html")
                assert.equal(links.find((l) => l.name === "String trial").visible, false);
              const file = `${phase}-${name}-${width}-${room.file.replace(".html", "")}.png`;
              await page.locator(".site-header").screenshot({ path: path.join(out, file) });
              if (phase !== "before" && width === 320 && room.file === "canon.html") {
                const table = page.locator("#numbers .table-scroll");
                assert(await table.evaluate((el) => el.scrollWidth > el.clientWidth));
                await table.focus();
                await page.keyboard.press("ArrowRight");
                await page.waitForFunction(
                  () => document.querySelector("#numbers .table-scroll").scrollLeft > 0,
                );
                await table.evaluate((el) => {
                  el.scrollLeft = el.scrollWidth;
                });
                const tableScroll = await table.evaluate((el) => ({
                  clientWidth: el.clientWidth,
                  scrollWidth: el.scrollWidth,
                  scrollLeft: el.scrollLeft,
                  pageWidth: document.documentElement.scrollWidth,
                }));
                assert.equal(tableScroll.pageWidth, width);
                const tableShot = `${phase}-${name}-${width}-integers.png`;
                await page.locator("#numbers").screenshot({ path: path.join(out, tableShot) });
                const downloadPending = page.waitForEvent("download");
                await page.locator("#study").click();
                const download = await downloadPending;
                const nativeFile = `${phase}-${name}-${width}-six-tones.html`;
                await download.saveAs(path.join(out, nativeFile));
                const bytes = await readFile(path.join(out, nativeFile));
                const nativeContext = await browser.newContext({
                  viewport: { width, height: 1000 },
                  offline: true,
                });
                try {
                  const native = await nativeContext.newPage();
                  await native.goto(pathToFileURL(path.join(out, nativeFile)).href);
                  await native.evaluate(() => document.fonts.ready);
                  const sources = await native.locator(".study-scan img").evaluateAll((imgs) =>
                    imgs.map((img) => ({
                      src: img.src,
                      decoded: img.complete && img.naturalWidth > 0,
                    })),
                  );
                  assert.equal(sources.length, 6);
                  for (let i = 0; i < sources.length; i++) {
                    assert(sources[i].decoded);
                    const embedded = Buffer.from(sources[i].src.split(",")[1], "base64");
                    assert.deepEqual(embedded, current.get(`sources/canon/menge-${170 + i}.jpg`));
                  }
                  assert(await native.evaluate(() => document.fonts.check("16px Noto")));
                  assert(
                    await native
                      .getByRole("heading", { name: "Six tones and an octave", exact: true })
                      .isVisible(),
                  );
                  assert.equal(
                    await native.evaluate(() => document.documentElement.scrollWidth),
                    width,
                  );
                  item.sixTonesSmallScreen = {
                    tableScroll,
                    tableScreenshot: tableShot,
                    savedHtml: nativeFile,
                    sha256: createHash("sha256").update(bytes).digest("hex"),
                    sixSourceImagesMatch: true,
                    nativeFontReady: true,
                    nativeOffline: true,
                  };
                } finally {
                  await nativeContext.close();
                }
              }
              item.rooms.push({
                file: room.file,
                links,
                currentLink,
                pageOverflows: overflow,
                screenshot: file,
              });
            }
            if (phase !== "before") {
              for (const from of rooms)
                for (const target of rooms.filter((r) => r !== from)) {
                  await page.goto(base + from.file);
                  const link = page
                    .locator("header nav")
                    .getByRole("link", { name: target.name, exact: true });
                  await page.locator(".skip").focus();
                  let tabs = 0;
                  for (; tabs < 10; tabs++) {
                    await page.keyboard.press("Tab");
                    if (await link.evaluate((el) => document.activeElement === el)) break;
                  }
                  assert(tabs < 10, `Tab cannot reach ${from.file} -> ${target.file}`);
                  await page.keyboard.press("Enter");
                  await page.locator(target.marker).waitFor();
                  assert(
                    new URL(page.url()).pathname.endsWith(`/${target.file}`) ||
                      (target.file === "index.html" &&
                        new URL(page.url()).pathname.endsWith("/pyknon/")),
                  );
                  item.keyboardRoutes.push({ from: from.file, to: target.file, tabs: tabs + 1 });
                }
            }
            assert.deepEqual(errors, []);
            item.pageErrors = errors;
            report.configurations.push(item);
            console.log(
              `${phase} ${name} ${width}: four headers, ${item.keyboardRoutes.length} keyboard routes`,
            );
          } finally {
            await context.close();
          }
        }
      } finally {
        await origin.close();
      }
    }
  } finally {
    await browser.close();
  }
}
await writeFile(path.join(out, "navigation.json"), `${JSON.stringify(report, null, 2)}\n`);
