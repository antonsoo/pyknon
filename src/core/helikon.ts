import { type GenusId, genus, multiply, type Plan, type Ratio } from "./tetrachord";

export type Fraction = Ratio;
export const fraction = (n: number, d = 1): Fraction => {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d) || d === 0)
    throw new RangeError("A fraction needs safe integers and a nonzero denominator.");
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
  const g = gcd(Math.abs(n), Math.abs(d)) * Math.sign(d);
  return [n / g, d / g];
};
export const add = (a: Fraction, b: Fraction): Fraction =>
  fraction(a[0] * b[1] + b[0] * a[1], a[1] * b[1]);
export const sub = (a: Fraction, b: Fraction): Fraction => add(a, [-b[0], b[1]]);
export const mul = (a: Fraction, b: Fraction): Fraction => fraction(a[0] * b[0], a[1] * b[1]);
export const div = (a: Fraction, b: Fraction): Fraction => mul(a, [b[1], b[0]]);
export const value = (a: Fraction): number => a[0] / a[1];
export const ft = (a: Fraction): string => (a[1] === 1 ? `${a[0]}` : `${a[0]}/${a[1]}`);
export const equal = (a: Fraction, b: Fraction): boolean => a[0] * b[1] === b[0] * a[1];
const one: Fraction = [1, 1];

export const HELIKON_SCOPE =
  "An ideal geometric and listening experiment after Ptolemy, Harmonics II.2. Uniform strings share the same full-length pitch; a zero-width bridge sets their sounding lengths. Tension, material, bridge height and coupling are held outside this model. Sine tones, absolute reference pitch and the four-string retuning exercise are modern choices. This is not a reconstruction or a measurement of an ancient instrument.";

export const HELIKON_STEPS = [
  ["Square", "Start with the square ABCD. Each full string will have the same length."],
  ["Two halves", "Halve AB at E and BD at F. The halves measure different directions."],
  ["Two lines", "Join A to F and B to C. Their crossing is G; G is not the square’s centre."],
  [
    "Four strings",
    "Through E and G draw parallels to AC. Their lateral positions are 1/2 and 2/3 of the width.",
  ],
  [
    "Seven lengths",
    "Place one common bridge along AF. Read and hear the nonzero lengths on both sides.",
  ],
] as const;
export const SEGMENT_IDS = ["AC", "HK", "GM", "FD", "BF", "LG", "EH"] as const;
export type SegmentId = (typeof SEGMENT_IDS)[number];
export const INTERVALS = [
  { label: "Fourth", greek: "διὰ τεσσάρων", a: "AC", b: "HK", ratio: [4, 3] },
  { label: "Fifth", greek: "διὰ πέντε", a: "AC", b: "GM", ratio: [3, 2] },
  { label: "Octave", greek: "διὰ πασῶν", a: "AC", b: "FD", ratio: [2, 1] },
  { label: "Whole tone", greek: "τόνος", a: "HK", b: "GM", ratio: [9, 8] },
  {
    label: "Octave + fourth",
    greek: "διὰ πασῶν καὶ διὰ τεσσάρων",
    a: "GM",
    b: "EH",
    ratio: [8, 3],
  },
  { label: "Two octaves", greek: "δὶς διὰ πασῶν", a: "AC", b: "EH", ratio: [4, 1] },
  { label: "Octave + fifth", greek: "διὰ πασῶν καὶ διὰ πέντε", a: "AC", b: "LG", ratio: [3, 1] },
] as const satisfies readonly {
  label: string;
  greek: string;
  a: SegmentId;
  b: SegmentId;
  ratio: Fraction;
}[];

export interface HelikonState {
  stage: number;
  bridge: number;
  pair: number;
  target: GenusId;
  x1: number;
  x2: number;
  scale: number;
  reference: 110 | 220;
  reading: number;
  page: string;
}
export const HELIKON_PAGES = ["title", "97", "98", "99", "100", "101", "62", "63"] as const;
export const HELIKON_DEFAULT: Readonly<HelikonState> = {
  stage: 4,
  bridge: 12,
  pair: 3,
  target: "enharmonic",
  x1: 252,
  x2: 336,
  scale: 12,
  reference: 220,
  reading: 0,
  page: "98",
};
export function validateHelikon(input: unknown): HelikonState {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("The helikon experiment must be a record.");
  const s = input as Record<string, unknown>;
  if (Object.keys(s).sort().join(",") !== Object.keys(HELIKON_DEFAULT).sort().join(","))
    throw new Error("The experiment has missing or unknown fields.");
  for (const [key, lo, hi] of [
    ["stage", 0, 4],
    ["bridge", 3, 18],
    ["pair", 0, INTERVALS.length - 1],
    ["x1", 1, 502],
    ["x2", 2, 503],
    ["scale", 6, 12],
    ["reading", 0, 5],
  ] as const) {
    const n = s[key];
    if (typeof n !== "number" || !Number.isInteger(n) || n < lo || n > hi)
      throw new Error(`Choose a whole ${key} value from ${lo} to ${hi}.`);
  }
  if (Number(s.x1) >= Number(s.x2))
    throw new Error("Keep the first inner string to the left of the second.");
  if (s.stage !== 4 && s.bridge !== 12)
    throw new Error(
      "The construction steps use the source’s bridge. Choose the final step to alter it.",
    );
  if (!["enharmonic", "chromatic", "diatonic"].includes(String(s.target)))
    throw new Error("Choose one of the three reported divisions.");
  if (s.reference !== 110 && s.reference !== 220)
    throw new Error("Choose a 110 or 220 Hz reference.");
  if (!HELIKON_PAGES.includes(s.page as (typeof HELIKON_PAGES)[number]))
    throw new Error("Choose a retained source page.");
  return { ...s } as unknown as HelikonState;
}
export function sourceSegments(s: HelikonState) {
  const h = fraction(s.bridge, 24);
  const lengths: Record<SegmentId, Fraction> = {
    AC: one,
    HK: sub(one, mul(h, [1, 2])),
    GM: sub(one, mul(h, [2, 3])),
    FD: sub(one, h),
    BF: h,
    LG: mul(h, [2, 3]),
    EH: mul(h, [1, 2]),
  };
  return SEGMENT_IDS.map((id) => ({
    id,
    length: lengths[id],
    units: mul(lengths[id], [12, 1]),
    ratio: div(one, lengths[id]),
    hz: s.reference / value(lengths[id]),
  }));
}
export function sourceInterval(s: HelikonState) {
  const pair = INTERVALS[s.pair];
  if (!pair) throw new RangeError("Unknown interval.");
  const segments = sourceSegments(s);
  const a = segments.find((p) => p.id === pair.a),
    b = segments.find((p) => p.id === pair.b);
  if (!a || !b) throw new RangeError("Missing sounding segment.");
  const ratio = div(a.length, b.length);
  return {
    ...pair,
    a,
    b,
    actual: ratio,
    agrees: equal(ratio, pair.ratio),
    cents: 1200 * Math.log2(value(ratio)),
  };
}
export function targetRatios(target: GenusId): Fraction[] {
  let current: Fraction = one;
  return [
    one,
    ...genus(target).intervals.map((r) => {
      current = multiply(current, r);
      return current;
    }),
  ];
}
export function requiredLanes(target: GenusId): number[] {
  return targetRatios(target).map((r) => {
    const x = mul(sub(one, div(one, r)), [4 * 504, 1]);
    if (x[1] !== 1) throw new Error("This target cannot be represented on this ruler.");
    return x[0];
  });
}
export function retuning(s: HelikonState) {
  const q = fraction(s.scale, 12),
    ratios = targetRatios(s.target),
    needed = requiredLanes(s.target);
  return [0, s.x1, s.x2, 504].map((tick, i) => {
    const target = ratios[i],
      required = needed[i];
    if (!target || required === undefined) throw new RangeError("Missing target note.");
    const x = fraction(tick, 504),
      length = mul(q, sub(one, div(x, [4, 1])));
    const actual = div(q, length),
      targetLength = div(q, target);
    return {
      index: i,
      tick,
      x,
      length,
      actual,
      target,
      targetLength,
      required: fraction(required, 504),
      hz: s.reference / value(length),
      targetHz: s.reference / value(targetLength),
      centsError: 1200 * Math.log2(value(div(actual, target))),
      matches: equal(actual, target),
    };
  });
}
export function helikonPlan(s: HelikonState, sound: "pair" | "segments" | "retuning"): Plan {
  const groups =
    sound === "pair"
      ? [[sourceInterval(s).a.hz, sourceInterval(s).b.hz]]
      : sound === "segments"
        ? [sourceSegments(s).map((p) => p.hz)]
        : [retuning(s).map((p) => p.hz), retuning(s).map((p) => p.targetHz)];
  const tones: Plan["tones"] = [];
  let time = 0.12;
  groups.forEach((group, g) => {
    group.forEach((hz, note) => {
      tones.push({ hz, note, start: time, duration: 0.56, tuning: g ? "keyboard" : "ratios" });
      time += 0.74;
    });
    time += 0.5;
  });
  return { tones, duration: time - 0.5 + 0.12 };
}
export function helikonJSON(s: HelikonState): string {
  return `${JSON.stringify({ format: "pyknon-helikon", version: 1, state: validateHelikon(s) }, null, 2)}\n`;
}
export function importHelikon(text: string): HelikonState {
  if (text.length > 12000) throw new Error("Choose a helikon JSON record smaller than 12 KB.");
  let v: unknown;
  try {
    v = JSON.parse(text);
  } catch {
    throw new Error("This file is not valid JSON.");
  }
  if (
    !v ||
    typeof v !== "object" ||
    Array.isArray(v) ||
    Object.keys(v).sort().join(",") !== "format,state,version" ||
    !("format" in v) ||
    v.format !== "pyknon-helikon" ||
    !("version" in v) ||
    v.version !== 1 ||
    !("state" in v)
  )
    throw new Error("Choose a version 1 Pyknon helikon record.");
  return validateHelikon(v.state);
}
export function helikonURL(s: HelikonState, base: string): string {
  const url = new URL(base);
  url.search = new URLSearchParams(
    Object.entries(validateHelikon(s)).map(([k, v]) => [k, String(v)]),
  ).toString();
  url.hash = "hk-bench";
  return url.href;
}
export function helikonFromURL(input: string): { state: HelikonState; notice: string } {
  const q = new URL(input).searchParams;
  if (!q.size) return { state: { ...HELIKON_DEFAULT }, notice: "" };
  try {
    const s: Record<string, unknown> = { ...HELIKON_DEFAULT };
    for (const key of Object.keys(s)) {
      if (q.getAll(key).length > 1) throw new Error("Repeated setting.");
      if (q.has(key))
        s[key] =
          key === "target" || key === "page"
            ? q.get(key)
            : /^\d+$/.test(q.get(key) ?? "")
              ? Number(q.get(key))
              : Number.NaN;
    }
    return { state: validateHelikon(s), notice: "Experiment restored from the link." };
  } catch {
    return {
      state: { ...HELIKON_DEFAULT },
      notice: "The link has invalid experiment settings. The source example is shown.",
    };
  }
}
export function helikonCSV(s: HelikonState): string {
  const rows: (string | number)[][] = [
    [
      "experiment",
      "segment_or_note",
      "lateral_position",
      "sounding_length_fraction",
      "length_in_12_units",
      "actual_frequency_ratio",
      "target_frequency_ratio",
      "hertz",
      "target_hertz",
      "cents_error",
      "scope",
    ],
  ];
  for (const p of sourceSegments(s))
    rows.push([
      "source_geometry",
      p.id,
      "",
      ft(p.length),
      ft(p.units),
      ft(p.ratio),
      "",
      p.hz,
      "",
      "",
      HELIKON_SCOPE,
    ]);
  for (const p of retuning(s))
    rows.push([
      `retuning_${s.target}`,
      p.index + 1,
      ft(p.x),
      ft(p.length),
      ft(mul(p.length, [12, 1])),
      ft(p.actual),
      ft(p.target),
      p.hz,
      p.targetHz,
      p.centsError,
      HELIKON_SCOPE,
    ]);
  return `${rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\r\n")}\r\n`;
}
