import assert from "node:assert/strict";
import { test } from "node:test";
import {
  changeHalfScale,
  HALF_DEFAULT,
  halfAnalysis,
  halfCSV,
  halfFromURL,
  halfJSON,
  halfURL,
  importHalfJSON,
  rootText,
  validHalfState,
} from "../src/core/halves";

test("16,17,18: addition is not proportion; three middles and domain control", () => {
  const s = { ...HALF_DEFAULT },
    a = halfAnalysis(s);
  assert.equal(a.first, "17/16");
  assert.equal(a.second, "18/17");
  assert.equal(a.delta, 1n);
  assert.equal(halfAnalysis({ ...s, method: "length" }).middleText, "288/17");
  assert.equal(halfAnalysis({ ...s, method: "length" }).comparison, -1);
  const g = halfAnalysis({ ...s, method: "ratio" });
  assert.equal(g.middleText, "12√2");
  assert.equal(g.first, "3√2/4");
  assert.equal(g.second, g.first);
  assert.equal(g.firstHz, g.secondHz);
  const doubled = changeHalfScale(s, 4, true);
  assert.equal(doubled.middle, 34);
  assert.equal(halfAnalysis(doubled).first, a.first);
  assert.equal(halfAnalysis(doubled).delta, 4n);
  const control = halfAnalysis({ ...s, interval: "square", scale: 1, middle: 6 });
  assert.equal(control.superparticular, false);
  assert.equal(control.first, "3/2");
  assert.equal(control.second, "3/2");
  assert.equal(control.comparison, 0);
});
test("portable records and links reject ambiguous/out-of-range evidence", () => {
  const s = { ...HALF_DEFAULT };
  assert.deepEqual(importHalfJSON(halfJSON(s)), s);
  assert.deepEqual(halfFromURL(halfURL(s, "https://example.org/halves.html")).state, s);
  for (const bad of [
    { ...s, scale: 0 },
    { ...s, middle: 15 },
    { ...s, reference: "220" },
    { ...s, page: 219 },
    { ...s, extra: true },
    { ...s, method: "constructor" },
  ])
    assert.equal(validHalfState(bad), false);
  assert.throws(() => importHalfJSON(halfJSON(s).replace('"version": 1', '"version": 2')));
  assert.ok(halfFromURL("https://example.org/?scale=2&scale=3").notice);
  assert.ok(halfFromURL("https://example.org/?scale=2.5").notice);
  assert.ok(halfFromURL("https://example.org/?other=1").notice);
  assert.match(halfCSV(s), /frequency_ratio_squared_numerator/);
  assert.equal(halfCSV(s).split("\r\n").length, 5);
  assert.equal(rootText(288n), "12√2");
  assert.throws(() => rootText(0n));
});
