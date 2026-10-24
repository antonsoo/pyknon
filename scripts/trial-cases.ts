import {
  modeShape,
  STRINGS,
  stringPieces,
  TRIAL_DEFAULT,
  TRIAL_TESTS,
  trialResult,
} from "../src/core/trial";

const cases = [];
for (const string of STRINGS)
  for (let contrast = 1; contrast <= 4; contrast += 0.25)
    for (const root of [110, 220] as const)
      for (let test = 0; test < TRIAL_TESTS.length; test++) {
        const s = { ...TRIAL_DEFAULT, string, contrast, root, test },
          r = trialResult(s);
        cases.push({
          ...s,
          aHz: r.aHz,
          bHz: r.bHz,
          same: r.same,
          aShape: modeShape(stringPieces(string, contrast), r.spec.a[0], r.spec.a[1]),
          bShape: modeShape(stringPieces(string, contrast), r.spec.b[0], r.spec.b[1]),
        });
      }
console.log(JSON.stringify(cases));
