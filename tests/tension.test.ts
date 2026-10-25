import assert from "node:assert/strict";
import test from "node:test";
import {
  REPAIRED,
  tensionDefault,
  tensionFromQuery,
  tensionImport,
  tensionJSON,
  tensionPlan,
  tensionQuery,
  tensionRows,
  weight,
} from "../src/core/tension";
import { at } from "../src/core/tetrachord";

test("replacement loads never replace the recorded claim and all three exact repairs reach it", () => {
  const s = tensionDefault(),
    original = tensionRows(s);
  assert.equal(original[3]?.originalCents, 600);
  assert.equal(original[3]?.claimCents, 1200);
  s.weights = [at(REPAIRED, 0), at(REPAIRED, 1), at(REPAIRED, 2), at(REPAIRED, 3)];
  const repaired = tensionRows(s);
  assert.ok(repaired.every((r) => r.exact));
  assert.deepEqual(
    repaired.map((r) => r.original),
    [6, 8, 9, 12],
  );
  assert.deepEqual(
    repaired.map((r) => r.claimed),
    original.map((r) => r.claimed),
  );
  for (const r of repaired) assert.ok(Math.abs(r.yoursHz - r.claimHz) < 1e-10);
});
test("native settings round trip; malformed files do not become plausible default experiments", () => {
  const s = tensionDefault();
  s.weights[1] = weight("32/3");
  s.selected = 1;
  s.passage = 6;
  s.page = "meibom-13";
  s.sound = "together";
  s.root = 110;
  assert.deepEqual(tensionImport(tensionJSON(s)), s);
  assert.deepEqual(tensionFromQuery(tensionQuery(s)).state, s);
  for (const change of [
    { weights: ["6", "7"] },
    { weights: ["6", "7", "Infinity"] },
    { weights: ["6", "7", "1/0"] },
    { selected: "1" },
    { passage: 8 },
    { root: 440 },
    { sound: "toString" },
    { page: "jan-999" },
    { extra: true },
  ])
    assert.throws(() =>
      tensionImport(JSON.stringify({ ...JSON.parse(tensionJSON(s)), ...change })),
    );
  for (const invalid of [
    "NaN",
    "6e0",
    "Infinity",
    "5.99",
    "30.01",
    "12/0",
    "6/10001",
    "1/2/3",
    "99999999999999999999",
  ])
    assert.throws(() => weight(invalid));
  assert.deepEqual(weight("13.5000"), [27, 2]);
  assert.ok(tensionFromQuery("?w=12,9,no").notice);
});
test("comparison, simultaneous and quartet plans retain their declared targets and modern ideal predictions", () => {
  const s = tensionDefault(),
    p = tensionPlan(s);
  assert.deepEqual(
    p.tones.map((t) => t.role),
    ["claim", "claim", "original", "original", "yours", "yours"],
  );
  assert.equal(p.tones[1]?.hz, 440);
  assert.equal(p.tones[3]?.hz, 220 * Math.sqrt(2));
  assert.equal(p.tones[5]?.hz, p.tones[3]?.hz);
  s.weights[3] = [24, 1];
  const q = tensionPlan(s, "together");
  assert.equal(q.tones.length, 2);
  assert.equal(q.tones[0]?.hz, q.tones[1]?.hz);
  assert.equal(q.tones[0]?.start, q.tones[1]?.start);
  assert.equal(tensionPlan(s, "claim").tones.length, 4);
  assert.equal(tensionPlan(s, "original").tones.length, 4);
  assert.equal(tensionPlan(s, "yours").tones.length, 4);
});
