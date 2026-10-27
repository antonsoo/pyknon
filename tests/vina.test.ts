import assert from "node:assert/strict";
import test from "node:test";
import {
  parseVina,
  VINA_DEFAULT,
  vinaFromQuery,
  vinaImport,
  vinaJSON,
  vinaMatches,
  vinaModel,
  vinaPlan,
  vinaQuery,
} from "../src/core/vina";

test("different preparations preserve the named matches without preserving all frequencies", () => {
  for (const tuning of ["comma", "quarter"] as const) {
    const s = { ...VINA_DEFAULT, tuning };
    assert.equal(vinaModel(s).valid, true);
    for (const [position, expected] of [
      [
        2000,
        [
          [2, 1, 0],
          [6, 5, 0],
        ],
      ],
      [
        3000,
        [
          [1, 0, 0],
          [5, 4, 0],
        ],
      ],
      [
        4000,
        [
          [0, 6, -1],
          [3, 2, 0],
          [4, 3, 0],
        ],
      ],
    ] as const)
      assert.deepEqual(
        vinaMatches({ ...s, position }).map((p) => [p.moving, p.fixed, p.octave]),
        expected,
      );
  }
  const a = vinaModel(VINA_DEFAULT),
    b = vinaModel({ ...VINA_DEFAULT, tuning: "quarter" });
  assert.notEqual(a.fixedHz[1], b.fixedHz[1]);
  assert.equal(a.fixedHz[2], b.fixedHz[2]);
  const final = { ...VINA_DEFAULT, position: 4000, selected: 0 };
  const plan = vinaPlan(final);
  assert.ok(Math.abs((plan.tones[0]?.hz ?? 0) - (plan.tones[1]?.hz ?? 1)) < 1e-10);
  assert.ok((plan.tones[0]?.hz ?? Infinity) < final.root);
});
test("collapsed and reversed stages are invalid even though the source count list still sums to 22", () => {
  assert.equal(vinaModel({ ...VINA_DEFAULT, tuning: "zero" }).valid, false);
  const boundary = vinaModel({ ...VINA_DEFAULT, tuning: "boundary" });
  assert.equal(boundary.valid, false);
  assert.ok(Math.abs(boundary.increments[2] ?? 1) < 1e-10);
  const reversed = vinaModel({ ...VINA_DEFAULT, tuning: "free", tenth: 700 });
  assert.equal(reversed.valid, false);
  assert.ok((reversed.increments[2] ?? 1) < 0);
  assert.equal(vinaMatches({ ...VINA_DEFAULT, tuning: "boundary", position: 2000 }).length, 4);
});
test("portable records preserve all reading settings and reject ambiguous or malformed values", () => {
  const s = {
    ...VINA_DEFAULT,
    tuning: "quarter" as const,
    tenth: 678,
    position: 1234,
    root: 110 as const,
    selected: 6,
    sound: "compare" as const,
    reading: 8,
    page: "86" as const,
  };
  assert.deepEqual(vinaImport(vinaJSON(s)), s);
  assert.deepEqual(vinaFromQuery(vinaQuery(s)).state, s);
  for (const change of [
    { root: "220" },
    { selected: 7 },
    { position: NaN },
    { position: 4001 },
    { reading: 9 },
    { tenth: -1 },
    { page: "999" },
    { sound: ["pair"] },
    { tuning: ["comma"] },
    { extra: true },
  ])
    assert.throws(() => parseVina({ ...s, ...change }));
  for (const q of [
    `${vinaQuery(s)}&root=220`,
    `${vinaQuery(s)}&extra=1`,
    vinaQuery(s).replace("position=1234", "position=1e3"),
    "?root=220",
  ])
    assert.ok(vinaFromQuery(q).notice);
  assert.throws(() => vinaImport(JSON.stringify({ format: "other", state: s })));
});
