import assert from "node:assert/strict";
import { test } from "node:test";
import {
  DEFAULT,
  GENERA,
  hasPyknon,
  notes,
  plan,
  queryFor,
  readState,
} from "../src/core/tetrachord";

test("only the enharmonic loses a distinct pitch to modern rounding", () => {
  for (const g of GENERA) {
    const pitches = notes({ ...DEFAULT, genus: g.id });
    assert.equal(new Set(pitches.map((n) => n.hz)).size, 4);
    assert.equal(new Set(pitches.map((n) => n.keyboardHz)).size, g.id === "enharmonic" ? 3 : 4);
    assert.equal(hasPyknon(g.id), g.id !== "diatonic");
  }
});
test("descending playback reverses the same pitches; the close-note lesson preserves its pair", () => {
  const ascending = plan(DEFAULT, "compare");
  const descending = plan({ ...DEFAULT, direction: "down" }, "compare");
  assert.deepEqual(
    descending.tones.slice(0, 4).map((t) => t.hz),
    ascending.tones
      .slice(0, 4)
      .map((t) => t.hz)
      .reverse(),
  );
  assert.deepEqual(
    plan(DEFAULT, "close").tones.map((t) => t.note),
    [1, 2, 1, 2, 1, 2, 1, 2],
  );
  assert(
    ascending.tones.every(
      (t, i) => i === 0 || t.start >= (ascending.tones[i - 1]?.start ?? 0) + 0.48,
    ),
  );
});
test("shared URLs admit only the supported genera, pitch references and directions", () => {
  assert.deepEqual(readState("?g=<script>&a=Infinity&d=sideways"), DEFAULT);
  assert.deepEqual(readState("?g=chromatic&a=441&d=down"), {
    genus: "chromatic",
    root: 220,
    direction: "down",
  });
  for (const g of GENERA)
    for (const root of [110, 220, 440] as const)
      for (const direction of ["up", "down"] as const) {
        const state = { genus: g.id, root, direction };
        assert.deepEqual(readState(queryFor(state)), state);
      }
});
