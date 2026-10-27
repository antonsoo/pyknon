import {
  HELIKON_DEFAULT,
  INTERVALS,
  requiredLanes,
  retuning,
  sourceInterval,
  sourceSegments,
} from "../src/core/helikon";

for (const reference of [110, 220] as const)
  for (let bridge = 3; bridge <= 18; bridge++) {
    const state = { ...HELIKON_DEFAULT, reference, bridge };
    console.log(
      JSON.stringify({
        kind: "source",
        state,
        segments: sourceSegments(state),
        pairs: Array.from({ length: INTERVALS.length }, (_, pair) =>
          sourceInterval({ ...state, pair }),
        ),
      }),
    );
  }
for (const target of ["enharmonic", "chromatic", "diatonic"] as const)
  for (let scale = 6; scale <= 12; scale++) {
    for (let n = 1; n <= 502; n++) {
      for (const [x1, x2] of [
        [n, 503],
        [1, n + 1],
      ]) {
        const state = { ...HELIKON_DEFAULT, target, scale, x1: x1 ?? 1, x2: x2 ?? 503 };
        console.log(JSON.stringify({ kind: "retuning", state, rows: retuning(state) }));
      }
    }
    const required = requiredLanes(target),
      state = { ...HELIKON_DEFAULT, target, scale, x1: required[1] ?? 1, x2: required[2] ?? 503 };
    console.log(JSON.stringify({ kind: "fit", state, required, rows: retuning(state) }));
  }
