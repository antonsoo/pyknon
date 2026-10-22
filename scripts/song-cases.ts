import { songEvents } from "../src/core/seikilos";

const cases = [];
for (const root of [220, 440] as const)
  for (const pace of [90, 120, 150, 180] as const) {
    cases.push({ root, pace, events: songEvents({ root, pace, syllable: 0 }, "song") });
  }
console.log(JSON.stringify(cases));
