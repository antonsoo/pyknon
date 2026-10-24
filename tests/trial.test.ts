import assert from "node:assert/strict";
import { test } from "node:test";
import {
  fundamental,
  modeShape,
  STRINGS,
  stringPieces,
  TRIAL_DEFAULT,
  trialQuery,
  trialResult,
  trialState,
} from "../src/core/trial";

test("uniform strings agree with fixed-end wave equation, including absolute frequency", () => {
  for (const contrast of [1, 2.25, 4]) {
    const pieces = stringPieces("left", contrast);
    assert(Math.abs(fundamental(pieces, 0, 0.5) - 1 / Math.sqrt(contrast)) < 1e-12);
  }
  assert.equal(trialResult({ ...TRIAL_DEFAULT, string: "uniform" }).aHz, 440);
});
test("the two source comparisons and the extra diagnostic establish different things", () => {
  const outer = [0, 1, 2].map((test) => trialResult({ ...TRIAL_DEFAULT, test }));
  assert.deepEqual(
    outer.map((r) => r.same),
    [true, false, true],
  );
  const repeat = [0, 1, 2].map((test) => trialResult({ ...TRIAL_DEFAULT, string: "repeat", test }));
  assert.deepEqual(
    repeat.map((r) => r.same),
    [true, true, false],
  );
  assert(Math.abs((repeat[2]?.bHz ?? NaN) / (repeat[2]?.aHz ?? NaN) - 1.5) < 1e-12);
});
test("first modes meet both fixed boundaries without interior zeros", () => {
  for (const kind of STRINGS) {
    const shape = modeShape(stringPieces(kind, 4), 0, 0.5);
    assert(Math.abs(shape.at(-1)?.y ?? NaN) < 1e-12);
    assert(shape.slice(1, -1).every((p) => p.y > 0));
  }
});
test("shared state rejects duplicate, non-finite and off-grid fields", () => {
  assert.deepEqual(trialState(trialQuery(TRIAL_DEFAULT)), { state: TRIAL_DEFAULT, reset: false });
  for (const q of [
    "?density=NaN",
    "?density=2&density=3",
    "?density=2.1",
    "?a=165",
    "?test=",
    "?string=outer&string=uniform",
  ]) {
    const parsed = trialState(q);
    assert(parsed.reset, q);
    assert.deepEqual(parsed.state, TRIAL_DEFAULT, q);
  }
});
