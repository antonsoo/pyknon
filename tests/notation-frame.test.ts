import assert from "node:assert/strict";
import { test } from "node:test";
import { NOTATION_DEFAULT, notationPlan } from "../src/core/notation";
import {
  FRAME_PAIRS,
  type FrameSign,
  notationFrame,
  notationFrameCSV,
} from "../src/core/notation-frame";

test("holding a shared sign and holding mese are distinct reference constraints", () => {
  for (const frameSign of Object.keys(FRAME_PAIRS) as FrameSign[])
    for (const tuning of ["pythagorean", "equal"] as const)
      for (const reference of [220, 330, 440] as const) {
        const s = {
          ...NOTATION_DEFAULT,
          frameSign,
          tuning,
          reference,
          frameAnchor: "sign" as const,
        };
        const sign = notationFrame(s),
          mese = notationFrame({ ...s, frameAnchor: "mese" });
        assert.equal(sign.lydian.signHz, sign.hypolydian.signHz);
        assert.equal(mese.lydian.meseHz, mese.hypolydian.meseHz);
        const fourth = tuning === "pythagorean" ? 4 / 3 : 2 ** (5 / 12);
        assert.ok(Math.abs(sign.lydian.meseHz / sign.hypolydian.meseHz - fourth) < 1e-12);
        assert.ok(Math.abs(mese.hypolydian.signHz / mese.lydian.signHz - fourth) < 1e-12);
        assert.notEqual(sign.lydian.names.join(), sign.hypolydian.names.join());
      }
});
test("the retained table pairs preserve two possible functions and actual source rows", () => {
  const iota = notationFrame({ ...NOTATION_DEFAULT, frameSign: "iota" });
  assert.deepEqual(iota.lydian.rows, [8]);
  assert.deepEqual(iota.hypolydian.rows, [11, 14]);
  assert.deepEqual(iota.hypolydian.names, ["nētē synēmmenōn", "diezeugmenōn diatonos"]);
  assert.equal(iota.meseRelation, "3/4");
  assert.equal(iota.signRelation, "1/1");
  assert.equal(notationFrame({ ...NOTATION_DEFAULT, frameAnchor: "mese" }).signRelation, "4/3");
  assert.equal(
    notationFrameCSV({ ...NOTATION_DEFAULT, frameSign: "square-u" }).split("\r\n").length,
    4,
  );
  const held = notationPlan({ ...NOTATION_DEFAULT, sound: "frame" });
  assert.deepEqual(
    held.tones.map((t) => t.hz),
    [330, 330],
  );
  const moved = notationPlan({ ...NOTATION_DEFAULT, sound: "frame", frameAnchor: "mese" });
  assert.deepEqual(
    moved.tones.map((t) => t.hz),
    [330, 440],
  );
});
