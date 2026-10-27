import {
  HALF_DEFAULT,
  type HalfState,
  halfAnalysis,
  halfPlan,
  halfRatio,
} from "../src/core/halves";

function emit(s: HalfState) {
  const a = halfAnalysis(s);
  console.log(
    JSON.stringify(
      {
        state: s,
        ratio: halfRatio(s),
        A: a.A,
        B: a.B,
        middle: a.middle,
        ms: a.middleSquare,
        delta: a.delta,
        comparison: a.comparison,
        lower: a.lower,
        upper: a.upper,
        firstHz: a.firstHz,
        secondHz: a.secondHz,
        plan: halfPlan(s),
      },
      (_, v) => (typeof v === "bigint" ? String(v) : v),
    ),
  );
}
for (let n = 1; n <= 64; n++)
  for (let scale = 1; scale <= 256; scale++) {
    const A = n * scale,
      B = (n + 1) * scale,
      lower = Math.floor(Math.sqrt(A * B));
    for (const method of ["integer", "frequency", "length", "ratio"] as const)
      emit({ ...HALF_DEFAULT, interval: "custom", n, scale, middle: lower, method });
    emit({ ...HALF_DEFAULT, interval: "custom", n, scale, middle: lower + 1, method: "integer" });
  }
for (const interval of ["tone", "fourth", "fifth", "octave", "square"] as const)
  for (const scale of [1, 2, 3, 17, 128, 256])
    for (const method of ["integer", "frequency", "length", "ratio"] as const)
      for (const sound of ["halves", "path", "together", "control"] as const)
        for (const reference of [220, 330, 440] as const) {
          const s = { ...HALF_DEFAULT, interval, scale, method, sound, reference },
            r = halfRatio(s);
          s.middle = Math.floor(Math.sqrt(r.a * r.b) * scale);
          emit(s);
        }
