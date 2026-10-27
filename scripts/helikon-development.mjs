import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, firefox } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4364/pyknon/",
  out = process.argv[3] ?? "/tmp/claude-1000/helikon-development";
await mkdir(out, { recursive: true });
const records = [];
for (const [engine, launcher] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const b = await launcher.launch();
  try {
    for (const width of [1440, 375]) {
      const p = await b.newPage({ viewport: { width, height: 900 } }),
        errors = [],
        violations = [];
      p.on("pageerror", (e) => errors.push(String(e)));
      p.on("console", (m) => {
        if (m.type() === "error" && /Content Security Policy|violates|Refused/.test(m.text()))
          violations.push(m.text());
      });
      for (const room of [
        "index",
        "song",
        "canon",
        "trial",
        "rhythm",
        "tension",
        "vina",
        "halves",
        "notation",
        "helikon",
      ]) {
        const original = await readFile(`${room}.html`, "utf8"),
          policy = /<meta[^>]+http-equiv="Content-Security-Policy"[^>]+content="([^"]+)"/.exec(
            original,
          )[1];
        await p.goto(new URL(`${room}.html`, base).href);
        await p.locator("h1").waitFor();
        await p.evaluate(() => document.fonts.ready);
        const s = await p.evaluate(() => ({
          room: location.pathname,
          font: getComputedStyle(document.body).fontFamily,
          overflow: document.documentElement.scrollWidth > innerWidth,
          nonce: document.querySelector('meta[property="csp-nonce"]')?.nonce,
          policy: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content,
          injectedStyles: [...document.querySelectorAll("style[data-vite-dev-id]")].map(
            (s) => s.nonce,
          ),
        }));
        assert(s.nonce);
        assert(s.font.includes("Plex"));
        assert.equal(s.overflow, false, `${engine}/${width}/${room} overflow`);
        assert.equal(
          s.policy,
          policy.replace("style-src 'self';", `style-src 'self' 'nonce-${s.nonce}';`),
        );
        assert(s.injectedStyles.every((n) => n === s.nonce));
        if (room === "helikon") assert(s.injectedStyles.length > 0);
        records.push({
          engine,
          width,
          room: s.room,
          nonceStyles: s.injectedStyles.length,
          styled: true,
          overflow: false,
          originalPolicyPreservedExceptMatchingDevNonce: true,
        });
      }
      await p.locator("#hk-fit").click();
      await p.locator("#hk-source-status").filter({ hasText: "Verified complete page" }).waitFor();
      assert.match(await p.locator("#hk-retuning-result").textContent(), /All four/);
      if (width === 375) await p.screenshot({ path: path.join(out, `${engine}-helikon.png`) });
      assert.deepEqual(errors, []);
      assert.deepEqual(violations, []);
      await p.close();
      console.log(`${engine} ${width}: all ten development rooms styled`);
    }
  } finally {
    await b.close();
  }
}
await writeFile(
  path.join(out, "review.json"),
  `${JSON.stringify({ scope: "All ten actual Vite development pages; verified nonce styles and preserved original policies; both browsers and widths", records }, null, 2)}\n`,
);
