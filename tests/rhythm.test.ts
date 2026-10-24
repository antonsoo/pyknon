import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BETWEEN_FEET,
  betweenFoot,
  chosen,
  foot,
  parseRhythm,
  RHYTHM_DEFAULT,
  reference,
  rhythmCsv,
  rhythmFromQuery,
  rhythmImport,
  rhythmJSON,
  rhythmPlan,
  rhythmQuery,
} from "../src/core/rhythm";

test("the three stated genera agree with literal allowed integer partitions, including seven's exclusion", () => {
  const allowed: Record<number, Record<number, string>> = {
    3: { 1: "iambic", 2: "iambic" },
    4: { 2: "dactylic" },
    5: { 2: "paeonic", 3: "paeonic" },
    6: { 2: "iambic", 3: "dactylic", 4: "iambic" },
    7: {},
    8: { 4: "dactylic" },
  };
  let count = 0;
  for (let total = 3; total <= 8; total++)
    for (let up = 1; up < total; up++) {
      const f = foot(total, up);
      assert.equal(f.genus, allowed[total]?.[up] ?? "outside");
      assert.equal(f.up + f.down, total);
      count++;
    }
  assert.equal(count, 27);
  assert.deepEqual(foot(7, 3).ratio, [4, 3]);
});
test("six can preserve size while changing genus, and reversal preserves that genus", () => {
  const s = { ...RHYTHM_DEFAULT };
  const a = reference(s),
    b = chosen(s);
  assert.equal(a.total, b.total);
  assert.deepEqual([a.up, a.down], [3, 3]);
  assert.deepEqual([b.up, b.down], [2, 4]);
  assert.equal(a.genus, "dactylic");
  assert.equal(b.genus, "iambic");
  const reversed = chosen({ ...s, up: s.total - s.up });
  assert.deepEqual([reversed.up, reversed.down], [4, 2]);
  assert.equal(reversed.genus, b.genus);
  assert.equal(a.total * s.unitMs, 1800);
  assert.equal(b.total * s.unitMs, 1800);
});
test("inner attacks can change while the defining two portions and genus stay fixed", () => {
  const full = rhythmPlan(RHYTHM_DEFAULT, "chosen"),
    joined = rhythmPlan({ ...RHYTHM_DEFAULT, texture: "joined" }, "chosen");
  assert.equal(full.tones.length, 12);
  assert.equal(joined.tones.length, 4);
  assert.equal(full.duration, joined.duration);
  assert.deepEqual(
    joined.tones.map((t) => t.kind),
    ["up", "down", "up", "down"],
  );
  [0.12, 0.72, 1.92, 2.52].forEach((expected, i) => {
    assert.ok(Math.abs((joined.tones[i]?.start ?? 0) - expected) < 1e-12);
  });
  assert.deepEqual(
    joined.tones.map((t) => t.hz),
    [720, 480, 720, 480],
  );
});
test("all integer bench clock choices keep finite clicks separate and preserve exact boundaries", () => {
  for (let total = 3; total <= 8; total++)
    for (let up = 1; up < total; up++)
      for (const unitMs of [180, 300, 600])
        for (const texture of ["units", "joined"] as const) {
          const p = rhythmPlan({ ...RHYTHM_DEFAULT, total, up, unitMs, texture }, "compare");
          for (let i = 0; i < p.tones.length; i++) {
            const tone = p.tones[i];
            assert(tone);
            assert.ok([tone.start, tone.duration, tone.hz].every(Number.isFinite));
            assert.ok(tone.start >= 0 && tone.duration >= 0.08);
            assert.ok(tone.start + tone.duration <= p.duration);
            if (i)
              assert.ok(
                tone.start + 1e-12 >=
                  (p.tones[i - 1]?.start ?? 0) + (p.tones[i - 1]?.duration ?? 0),
              );
          }
          const firstB = p.tones.find((t) => t.row === 1);
          assert.ok(
            Math.abs((firstB?.start ?? 0) - (0.12 + (2 * total * unitMs) / 1000 + 0.45)) < 1e-12,
          );
        }
});
test("the intermediate illustration keeps down fixed, uses a chosen midpoint and avoids integer classification", () => {
  assert.deepEqual(
    BETWEEN_FEET.map((f) => [f.up, f.down, f.total]),
    [
      [1, 2, 3],
      [1.5, 2, 3.5],
      [2, 2, 4],
    ],
  );
  assert.equal(betweenFoot("middle").upDown, "3:4");
  assert.equal(1.5 / 2, 3 / 4);
  assert.throws(() => foot(3.5, 1.5));
  const p = rhythmPlan(RHYTHM_DEFAULT, "between");
  assert.deepEqual(
    p.tones.map((t) => t.kind),
    ["down", "up", "down", "up"],
  );
  [0.12, 0.72, 1.17, 1.77].forEach((expected, i) => {
    assert.ok(Math.abs((p.tones[i]?.start ?? 0) - expected) < 1e-12);
  });
});
test("saved state and URL retain the stated unit, texture and intermediate example", () => {
  const s = {
    total: 5,
    up: 3,
    unitMs: 600,
    texture: "joined",
    between: "one",
    sound: "chosen",
  } as const;
  assert.deepEqual(rhythmImport(rhythmJSON(s)), s);
  assert.deepEqual(rhythmFromQuery(rhythmQuery(s)), { state: s, notice: "" });
  for (const invalid of [
    null,
    [],
    { ...s, total: 9 },
    { ...s, up: 0 },
    { ...s, up: 1.5 },
    { ...s, up: NaN },
    { ...s, unitMs: 301 },
    { ...s, unitMs: Infinity },
    { ...s, texture: "ancient" },
    { ...s, between: "thirds" },
    { ...s, onsets: [0, 1] },
  ])
    assert.throws(() => parseRhythm(invalid));
  assert.throws(() =>
    rhythmImport(JSON.stringify({ format: "pyknon-rhythm-v1", state: s, frequencies: [] })),
  );
  assert.throws(() => rhythmImport(" ".repeat(65537)));
  assert.match(rhythmFromQuery("?total=7&up=1").notice, /unsupported rhythm/);
});
test("the numeric table separates the integer bench from unclassified intermediate examples", () => {
  const rows = rhythmCsv(RHYTHM_DEFAULT).trim().split("\n");
  assert.equal(rows.length, 8);
  assert.ok(rows.includes("reference,3,3,6,1:1,dactylic,300,1800"));
  assert.ok(rows.includes("chosen,2,4,6,2:1,iambic,300,1800"));
  assert.ok(
    rows.includes("intermediate_middle,1.5,2,3.5,4:3,not_classified_by_integer_bench,300,1050"),
  );
});
