import assert from "node:assert/strict";
import test from "node:test";
import {
  SONG_DEFAULT,
  SYLLABLES,
  selectedSyllables,
  songEvents,
  songPlan,
  songQuery,
  songState,
} from "../src/core/seikilos";
import { songStudy } from "../src/song-study";

test("selection controls scope without changing the melody or scheduling outside it", () => {
  for (let syllable = 0; syllable < SYLLABLES.length; syllable++) {
    const state = { ...SONG_DEFAULT, syllable };
    const full = songEvents(state, "song");
    const single = songEvents(state, "syllable");
    assert.deepEqual(
      single.map((e) => [e.pitch, e.units]),
      full.filter((e) => e.syllable === syllable).map((e) => [e.pitch, e.units]),
    );
    assert.equal(single[0]?.unitStart, 0);
    assert.equal(new Set(single.map((e) => e.syllable)).size, 1);
    const verse = songEvents(state, "verse");
    assert(verse.every((e) => SYLLABLES[e.syllable]?.verse === SYLLABLES[syllable]?.verse));
    assert.deepEqual([...new Set(verse.map((e) => e.syllable))], selectedSyllables(state, "verse"));
  }
});

test("all supported settings produce finite nonoverlapping tones and a complete tail", () => {
  for (const root of [220, 440] as const)
    for (const pace of [90, 120, 150, 180] as const) {
      const state = { syllable: 28, root, pace };
      assert.deepEqual(songState(songQuery(state)), state);
      for (const scope of ["syllable", "verse", "song"] as const) {
        const plan = songPlan(state, scope);
        let end = 0;
        for (const tone of plan.tones) {
          assert(Number.isFinite(tone.hz) && tone.hz > 0);
          assert(tone.start > end);
          assert(tone.duration > 0.08);
          end = tone.start + tone.duration;
        }
        assert(plan.duration > end);
      }
    }
});

test("malformed shared state cannot schedule unbounded or invalid audio", () => {
  for (const value of ["-1", "29", "NaN", "Infinity", "1.5", "1e309", "<script>"]) {
    assert.deepEqual(songState(`?s=${value}&a=${value}&pace=${value}`), SONG_DEFAULT);
  }
  assert.deepEqual(songState("?s=28&a=440&pace=90"), { syllable: 28, root: 440, pace: 90 });
});

test("saved reading includes the actual selected source and distinct syllable spellings", () => {
  const study = songStudy({ syllable: 28, root: 440, pace: 90 }, "data:image/jpeg;base64,AQID");
  assert(study.includes('href="data:image/jpeg;base64,AQID"'));
  assert(study.includes("?s=28&a=440&pace=90#reader"));
  assert(study.includes("reversed gamma"));
  assert(study.includes("CC BY-SA 4.0"));
  assert(study.includes("Lennart Larsen"));
  assert(!study.includes("<script"));
});
