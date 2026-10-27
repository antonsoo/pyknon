import type { Plan, Tone } from "./tetrachord";
export type HalfInterval = "tone" | "fourth" | "fifth" | "octave" | "square" | "custom";
export type HalfMethod = "integer" | "frequency" | "length" | "ratio";
export type HalfSound = "halves" | "path" | "together" | "control";
export interface HalfState {
  interval: HalfInterval;
  n: number;
  scale: number;
  middle: number;
  method: HalfMethod;
  reference: 220 | 330 | 440;
  sound: HalfSound;
  reading: number;
  page: number;
}
export const HALF_DEFAULT: HalfState = {
  interval: "tone",
  n: 8,
  scale: 2,
  middle: 17,
  method: "integer",
  reference: 220,
  sound: "halves",
  reading: 0,
  page: 220,
};
export const INTERVALS: Record<HalfInterval, string> = {
  tone: "Tone · 9:8",
  fourth: "Fourth · 4:3",
  fifth: "Fifth · 3:2",
  octave: "Octave · 2:1",
  square: "Control · 9:4",
  custom: "A whole plus one part",
};
export const METHODS: Record<HalfMethod, string> = {
  integer: "Your whole-number candidate",
  frequency: "Equal frequency increments",
  length: "Equal ideal string-length increments",
  ratio: "Equal frequency ratios",
};
export const HALF_SOUNDS: Record<HalfSound, string> = {
  halves: "Two halves from the same starting pitch",
  path: "Low, middle, high",
  together: "Both half-interval endings together",
  control: "Control: the same first-half ending twice",
};
export interface Rat {
  n: bigint;
  d: bigint;
}
export type Middle = { kind: "rational"; value: Rat } | { kind: "root"; square: bigint };
const gcd = (a: bigint, b: bigint): bigint => (b === 0n ? (a < 0n ? -a : a) : gcd(b, a % b));
export function rat(n: bigint, d = 1n): Rat {
  if (d <= 0n) throw new Error("Positive denominator required.");
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}
export function ratText(r: Rat): string {
  return r.d === 1n ? String(r.n) : `${r.n}/${r.d}`;
}
export function floorRoot(n: bigint): bigint {
  if (n < 0n) throw new Error("Negative square.");
  if (n < 2n) return n;
  let x = n,
    y = (x + 1n) / 2n;
  while (y < x) {
    x = y;
    y = (x + n / x) / 2n;
  }
  return x;
}
export function rootText(square: bigint, denom = 1n): string {
  if (square < 1n || denom < 1n) throw new Error("A positive root and denominator are required.");
  let rest = square,
    coefficient = 1n;
  for (let p = 2n; p * p <= rest; p++)
    while (rest % (p * p) === 0n) {
      rest /= p * p;
      coefficient *= p;
    }
  const g = gcd(coefficient, denom);
  coefficient /= g;
  denom /= g;
  const top =
    rest === 1n ? String(coefficient) : `${coefficient === 1n ? "" : coefficient}√${rest}`;
  return denom === 1n ? top : `${top}/${denom}`;
}
export function halfRatio(s: Pick<HalfState, "interval" | "n">): { a: number; b: number } {
  const choices = {
    tone: [9, 8],
    fourth: [4, 3],
    fifth: [3, 2],
    octave: [2, 1],
    square: [9, 4],
  } as const;
  if (s.interval === "custom") return { a: s.n + 1, b: s.n };
  const [a, b] = choices[s.interval];
  return { a, b };
}
export function endpoints(s: HalfState) {
  const { a, b } = halfRatio(s);
  return { A: b * s.scale, B: a * s.scale, a, b };
}
export function validHalfState(v: unknown): v is HalfState {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const s = v as Record<string, unknown>,
    keys = ["interval", "n", "scale", "middle", "method", "reference", "sound", "reading", "page"];
  if (Object.keys(s).length !== keys.length || !keys.every((k) => Object.hasOwn(s, k)))
    return false;
  const integer = (k: string, min: number, max: number) =>
    typeof s[k] === "number" &&
    Number.isInteger(s[k]) &&
    Number(s[k]) >= min &&
    Number(s[k]) <= max;
  if (
    typeof s.interval !== "string" ||
    !Object.hasOwn(INTERVALS, s.interval) ||
    !integer("n", 1, 64) ||
    !integer("scale", 1, 256) ||
    !integer("middle", 1, 20000) ||
    typeof s.method !== "string" ||
    !Object.hasOwn(METHODS, s.method) ||
    typeof s.reference !== "number" ||
    ![220, 330, 440].includes(s.reference) ||
    typeof s.sound !== "string" ||
    !Object.hasOwn(HALF_SOUNDS, s.sound) ||
    !integer("reading", 0, 6) ||
    typeof s.page !== "number" ||
    ![7, 220, 221, 230, 231, 232, 233, 234, 235].includes(s.page)
  )
    return false;
  const { A, B } = endpoints(s as unknown as HalfState);
  return Number(s.middle) >= A && Number(s.middle) <= B;
}
export function middleValue(s: HalfState): Middle {
  const { A, B } = endpoints(s),
    a = BigInt(A),
    b = BigInt(B);
  if (s.method === "integer") return { kind: "rational", value: rat(BigInt(s.middle)) };
  if (s.method === "frequency") return { kind: "rational", value: rat(a + b, 2n) };
  if (s.method === "length") return { kind: "rational", value: rat(2n * a * b, a + b) };
  const square = a * b,
    r = floorRoot(square);
  return r * r === square ? { kind: "rational", value: rat(r) } : { kind: "root", square };
}
export function middleNumber(m: Middle): number {
  return m.kind === "root" ? Math.sqrt(Number(m.square)) : Number(m.value.n) / Number(m.value.d);
}
export function middleText(m: Middle): string {
  return m.kind === "root" ? rootText(m.square) : ratText(m.value);
}
export function squareOf(m: Middle): Rat {
  return m.kind === "root" ? rat(m.square) : rat(m.value.n * m.value.n, m.value.d * m.value.d);
}
export function halfAnalysis(s: HalfState) {
  const e = endpoints(s),
    m = middleValue(s),
    ms = squareOf(m),
    product = BigInt(e.A) * BigInt(e.B),
    delta = ms.n - product * ms.d;
  const comparison = delta === 0n ? 0 : delta < 0n ? -1 : 1;
  const first =
    m.kind === "root"
      ? rootText(BigInt(e.a) * BigInt(e.b), BigInt(e.b))
      : ratText(rat(m.value.n, m.value.d * BigInt(e.A)));
  const second = m.kind === "root" ? first : ratText(rat(BigInt(e.B) * m.value.d, m.value.n));
  const firstHz = (s.reference * middleNumber(m)) / e.A;
  // Symbolic equality is realized with the same finite frequency on both sides.
  const secondHz = comparison === 0 ? firstHz : (s.reference * e.B) / middleNumber(m);
  const lower = floorRoot(product),
    upper = lower * lower === product ? lower : lower + 1n;
  return {
    ...e,
    middle: m,
    middleText: middleText(m),
    middleSquare: ms,
    product,
    delta,
    comparison,
    first,
    second,
    firstHz,
    secondHz,
    beatHz: Math.abs(firstHz - secondHz),
    totalCents: 1200 * Math.log2(e.a / e.b),
    firstCents: 1200 * Math.log2(firstHz / s.reference),
    secondCents: 1200 * Math.log2(secondHz / s.reference),
    lower,
    upper,
    superparticular: e.a - e.b === 1,
  };
}
export function changeHalfScale(s: HalfState, scale: number, preserve = false): HalfState {
  const e = endpoints({ ...s, scale });
  let middle = preserve
    ? Math.round((s.middle * scale) / s.scale)
    : Number(floorRoot(BigInt(e.A) * BigInt(e.B)));
  middle = Math.max(e.A, Math.min(e.B, middle));
  return { ...s, scale, middle };
}
export function halfPlan(s: HalfState): Plan {
  const a = halfAnalysis(s),
    tones: Tone[] = [];
  const add = (start: number, duration: number, hz: number, note: number) => {
    tones.push({ start, duration, hz, note, tuning: "ratios" });
  };
  if (s.sound === "together" || s.sound === "control") {
    add(0.12, 5.4, a.firstHz, 1);
    add(0.12, 5.4, s.sound === "control" ? a.firstHz : a.secondHz, 2);
  } else if (s.sound === "path") {
    add(0.12, 0.8, s.reference, 0);
    add(1.12, 0.8, a.firstHz, 1);
    add(2.12, 0.8, (s.reference * a.a) / a.b, 2);
  } else {
    add(0.12, 0.8, s.reference, 0);
    add(1.12, 1, a.firstHz, 1);
    add(2.72, 0.8, s.reference, 0);
    add(3.72, 1, a.secondHz, 2);
  }
  const last = tones.at(-1);
  if (!last) throw new Error("Empty listening plan.");
  return { tones, duration: last.start + last.duration + 0.22 };
}
export function halfJSON(s: HalfState): string {
  if (!validHalfState(s)) throw new Error("Invalid comparison settings.");
  return `${JSON.stringify(
    { format: "pyknon-halves", version: 1, scope: "numerical-mean-and-modern-sound", state: s },
    null,
    2,
  )}\n`;
}
export function importHalfJSON(text: string): HalfState {
  const data: unknown = JSON.parse(text);
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw new Error("A versioned comparison record is required.");
  const r = data as Record<string, unknown>;
  if (
    Object.keys(r).sort().join(",") !== "format,scope,state,version" ||
    r.format !== "pyknon-halves" ||
    r.version !== 1 ||
    r.scope !== "numerical-mean-and-modern-sound" ||
    !validHalfState(r.state)
  )
    throw new Error("This is not a valid halves comparison. No settings were changed.");
  return { ...r.state };
}
export function halfURL(s: HalfState, url: string): string {
  const u = new URL(url);
  u.search = "";
  for (const [k, v] of Object.entries(s)) u.searchParams.set(k, String(v));
  return u.href;
}
export function halfFromURL(url: string): { state: HalfState; notice: string } {
  const q = new URL(url).searchParams;
  if (![...q.keys()].length) return { state: { ...HALF_DEFAULT }, notice: "" };
  const s: Record<string, unknown> = { ...HALF_DEFAULT };
  for (const [k, v] of q) {
    if (!Object.hasOwn(HALF_DEFAULT, k) || q.getAll(k).length !== 1)
      return {
        state: { ...HALF_DEFAULT },
        notice: "This link has unknown or repeated settings. The opening experiment is shown.",
      };
    s[k] = ["interval", "method", "sound"].includes(k) ? v : /^\d+$/.test(v) ? Number(v) : NaN;
  }
  return validHalfState(s)
    ? { state: s, notice: "" }
    : {
        state: { ...HALF_DEFAULT },
        notice: "This link is outside the workshop limits. The opening experiment is shown.",
      };
}
export function halfCSV(s: HalfState): string {
  const a = halfAnalysis(s);
  const values: [string, Middle][] = [
    ["low", { kind: "rational", value: rat(BigInt(a.A)) }],
    ["middle", a.middle],
    ["high", { kind: "rational", value: rat(BigInt(a.B)) }],
  ];
  const rows: (string | number)[][] = [
    [
      "scope",
      "interval",
      "n",
      "scale",
      "method",
      "chosen_integer",
      "reference_hz",
      "point",
      "number_exact",
      "number_squared_numerator",
      "number_squared_denominator",
      "frequency_ratio_squared_numerator",
      "frequency_ratio_squared_denominator",
      "approx_frequency_hz",
      "approx_cents_from_start",
      "comparison_of_halves",
    ],
  ];
  for (const [label, m] of values) {
    const sq = squareOf(m),
      relative = rat(sq.n, sq.d * BigInt(a.A) * BigInt(a.A)),
      f = (s.reference * middleNumber(m)) / a.A;
    rows.push([
      "numerical-mean-and-modern-sound",
      s.interval,
      s.n,
      s.scale,
      s.method,
      s.middle,
      s.reference,
      label,
      middleText(m),
      String(sq.n),
      String(sq.d),
      String(relative.n),
      String(relative.d),
      f.toFixed(9),
      (1200 * Math.log2(f / s.reference)).toFixed(9),
      a.comparison === 0 ? "equal" : a.comparison < 0 ? "first smaller" : "first larger",
    ]);
  }
  const quote = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`;
  return `${rows.map((r) => r.map(quote).join(",")).join("\r\n")}\r\n`;
}
