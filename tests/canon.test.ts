import assert from "node:assert/strict";
import { test } from "node:test";
import {
  CANON_DEFAULT,
  CANON_SOUNDS,
  canonComparison,
  canonPlan,
  canonQuery,
  canonState,
  canonSteps,
} from "../src/core/canon";

test("a modern octave closes only after changing the ancient tone premise", () => {
  for (const root of [110, 220, 440] as const) {
    const end = canonComparison(root);
    assert.deepEqual(end.ratio, [531441, 262144]);
    assert.deepEqual(end.comma, [531441, 524288]);
    assert.deepEqual(end.fifthsComma, end.comma);
    assert.equal(end.equalHz, 2 * root);
    assert(end.ratioHz > end.equalHz);
    assert.equal(end.excessInteger, 7153);
    assert(Math.abs(end.differenceCents - 23.460010384649) < 1e-10);
    assert.equal(canonSteps(root)[0]?.beatHz, 0);
  }
});

test("the beating control changes frequency identity and preserves oscillator count and envelope", () => {
  const beat = canonPlan({ ...CANON_DEFAULT, sound: "beat" });
  const control = canonPlan({ ...CANON_DEFAULT, sound: "control" });
  assert.equal(beat.tones.length, 2);
  assert.equal(control.tones.length, 2);
  assert.notEqual(beat.tones[0]?.hz, beat.tones[1]?.hz);
  assert.equal(control.tones[0]?.hz, control.tones[1]?.hz);
  for (let i = 0; i < 2; i++) {
    assert.equal(beat.tones[i]?.start, control.tones[i]?.start);
    assert.equal(beat.tones[i]?.duration, control.tones[i]?.duration);
  }
  const unison = canonPlan({ ...CANON_DEFAULT, step: 0, sound: "beat" });
  assert.equal(unison.tones[0]?.hz, unison.tones[1]?.hz);
});

test("walking stops at the chosen step and compares the same number of intervals", () => {
  for (let step = 0; step <= 6; step++) {
    const p = canonPlan({ ...CANON_DEFAULT, step, sound: "walk" });
    assert.equal(p.tones.length, (step + 1) * 2);
    assert.deepEqual(
      p.tones.map((t) => t.note),
      [...Array(step + 1).keys(), ...Array(step + 1).keys()],
    );
    assert(p.tones.every((t) => t.duration > 0 && t.start + t.duration <= p.duration));
    assert(
      p.tones.every(
        (t, i) => !i || t.start >= (p.tones[i - 1]?.start ?? 0) + (p.tones[i - 1]?.duration ?? 0),
      ),
    );
  }
});

test("shared readings preserve source and sound selections and bound malformed parameters", () => {
  assert.deepEqual(canonState(""), CANON_DEFAULT);
  assert.deepEqual(canonState("?n=Infinity&a=NaN&sound=<script>&p=4&page=169"), CANON_DEFAULT);
  assert.deepEqual(canonState("?n=-1&a=221&sound=else&p=-1&page=175.1"), CANON_DEFAULT);
  for (let step = 0; step <= 6; step++)
    for (const root of [110, 220, 440] as const)
      for (const sound of CANON_SOUNDS)
        for (let passage = 0; passage < 4; passage++)
          for (let page = 170; page <= 175; page++) {
            const s = { step, root, sound, passage, page };
            assert.deepEqual(canonState(canonQuery(s)), s);
          }
});
