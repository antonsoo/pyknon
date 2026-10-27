import assert from "node:assert/strict";
import { test } from "node:test";
import {
  importNotationJSON,
  NOTATION_DEFAULT,
  notationFromURL,
  notationJSON,
  notationPlan,
  notationURL,
  otherAlphabet,
  readSign,
  translation,
  validNotationState,
} from "../src/core/notation";

test("a shared shape can change pitch, while a shared pair retains two functions", () => {
  const vocal = readSign("zeta", "vocal"),
    instrumental = readSign("zeta", "instrumental");
  assert.deepEqual(
    vocal.map((r) => r.id),
    ["paramese"],
  );
  assert.deepEqual(
    instrumental.map((r) => r.id),
    ["nete-synemmenon", "diatonos-diezeugmenon"],
  );
  const starter = translation(structuredClone(NOTATION_DEFAULT));
  assert.deepEqual(
    starter.map((t) => t.samePitch),
    [true, false, false, true],
  );
  assert.equal(starter[1]?.candidates.length, 2);
  assert.ok(Math.abs((starter[1]?.centsDifference ?? 0) - 1200 * Math.log2(32 / 27)) < 1e-10);
  assert.ok(Math.abs((starter[2]?.centsDifference ?? 0) + 1200 * Math.log2(9 / 8)) < 1e-10);
  const equal = translation({ ...structuredClone(NOTATION_DEFAULT), tuning: "equal" });
  assert.ok(Math.abs((equal[1]?.centsDifference ?? 0) - 300) < 1e-10);
  assert.ok(Math.abs((equal[2]?.centsDifference ?? 0) + 200) < 1e-10);
});
test("both translation directions preserve pitch without inventing a unique function", () => {
  for (const given of ["vocal", "instrumental"] as const) {
    const state = { ...structuredClone(NOTATION_DEFAULT), given, exercise: "functions" as const };
    state.answers = translation(state).map((t) => t.target[otherAlphabet(given)]);
    const result = translation(state);
    assert.ok(result.every((t) => t.samePitch && t.includesFunction));
    assert.equal(result[0]?.candidates.length, 2);
    assert.equal(result[1]?.candidates.length, 2);
    assert.notEqual(result[0]?.target.id, result[1]?.target.id);
  }
});
test("unwritten slots stay timed rests; the sigma control keeps both identical tones", () => {
  const empty = {
    ...structuredClone(NOTATION_DEFAULT),
    answers: [null, null, null, null],
    sound: "line" as const,
  };
  const plan = notationPlan(empty);
  assert.equal(plan.tones.length, 4);
  assert.equal(plan.duration, 6.8);
  assert.ok(plan.tones.every((t) => t.start < 3.6));
  const control = notationPlan({ ...structuredClone(NOTATION_DEFAULT), sign: "sigma" });
  assert.equal(control.tones.length, 2);
  assert.equal(control.tones[0]?.hz, 247.5);
  assert.equal(control.tones[0]?.hz, control.tones[1]?.hz);
  assert.notEqual(control.tones[0]?.start, control.tones[1]?.start);
});
test("portable records retain mistakes and reject invalid signs, alphabets and ambiguous links", () => {
  const s = structuredClone(NOTATION_DEFAULT);
  assert.deepEqual(importNotationJSON(notationJSON(s)), s);
  assert.deepEqual(notationFromURL(notationURL(s, "https://example.org/notation.html")).state, s);
  for (const bad of [
    { ...s, page: 369 },
    { ...s, reference: "330" },
    { ...s, answers: ["rho", null, null, null] },
    { ...s, answers: [] },
    { ...s, cursor: 4 },
    { ...s, exercise: "constructor" },
    { ...s, unknown: 1 },
  ])
    assert.equal(validNotationState(bad), false);
  assert.throws(() => importNotationJSON(notationJSON(s).replace('"version": 1', '"version": 2')));
  const duplicate = new URL(notationURL(s, "https://example.org/"));
  duplicate.searchParams.append("cursor", "2");
  assert.ok(notationFromURL(duplicate.href).notice.includes("invalid"));
  assert.ok(notationFromURL("https://example.org/?given=vocal").notice.includes("incomplete"));
});
