import { at, type Plan, type Tone } from "./tetrachord";

export const STRINGS = ["uniform", "outer", "repeat", "left"] as const;
export type StringKind = (typeof STRINGS)[number];
export const TRIAL_SOUNDS = ["compare", "together", "control"] as const;
export type TrialSound = (typeof TRIAL_SOUNDS)[number];
export type TrialState = {
  string: StringKind;
  contrast: number;
  test: number;
  root: 110 | 220;
  sound: TrialSound;
  passage: number;
  page: number;
};
export const TRIAL_DEFAULT: TrialState = {
  string: "outer",
  contrast: 2.25,
  test: 0,
  root: 220,
  sound: "compare",
  passage: 0,
  page: 37,
};
export const STRING_NAMES: Record<StringKind, string> = {
  uniform: "Uniform string",
  outer: "Heavy outer quarters",
  repeat: "Repeating hidden variation",
  left: "Heavy left half",
};
export const TRIAL_TESTS = [
  { name: "Equal halves", a: [0, 0.5], b: [0.5, 1], labels: ["ΕΚ", "ΚΗ"], source: true },
  { name: "Right-hand quarters", a: [0.5, 0.75], b: [0.75, 1], labels: ["ΚΛ", "ΛΗ"], source: true },
  {
    name: "One more test: eighths",
    a: [0.75, 0.875],
    b: [0.875, 1],
    labels: ["6/8–7/8", "7/8–1"],
    source: false,
  },
] as const;

export type Piece = { start: number; end: number; density: number };
export function stringPieces(kind: StringKind, contrast: number): Piece[] {
  if (!STRINGS.includes(kind) || !Number.isFinite(contrast) || contrast < 1 || contrast > 4)
    throw new RangeError("String model outside the supported range");
  const heavy = {
    uniform: [false, false, false, false, false, false, false, false],
    outer: [true, true, false, false, false, false, true, true],
    repeat: [false, true, true, false, false, true, true, false],
    left: [true, true, true, true, false, false, false, false],
  }[kind];
  return heavy.map((h, i) => ({ start: i / 8, end: (i + 1) / 8, density: h ? contrast : 1 }));
}
function slice(pieces: readonly Piece[], start: number, end: number): Piece[] {
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end > 1 || start >= end)
    throw new RangeError("Invalid vibrating segment");
  return pieces
    .filter((p) => p.end > start && p.start < end)
    .map((p) => ({ ...p, start: Math.max(start, p.start), end: Math.min(end, p.end) }));
}
// Rescale atan2's first coordinate, keeping the unwrapped half-turn count.
// The phase of (u, u'/lambda) increases strictly along a vibrating segment.
function rescalePhase(phase: number, scale: number): number {
  const turns = Math.floor(phase / Math.PI),
    local = phase - turns * Math.PI;
  return turns * Math.PI + Math.atan2(scale * Math.sin(local), Math.cos(local));
}
function endPhase(pieces: readonly Piece[], lambda: number): number {
  let phase = 0;
  for (const p of pieces) {
    const rho = Math.sqrt(p.density);
    const local = rescalePhase(phase, rho) + lambda * rho * (p.end - p.start);
    phase = rescalePhase(local, 1 / rho);
  }
  return phase;
}
export function fundamental(pieces: readonly Piece[], start: number, end: number): number {
  const selected = slice(pieces, start, end);
  const densities = selected.map((p) => p.density);
  let lo = Math.PI / ((end - start) * Math.sqrt(Math.max(...densities)));
  let hi = Math.PI / ((end - start) * Math.sqrt(Math.min(...densities)));
  // Sturm comparison bounds; unwrap the phase so a higher root cannot be
  // mistaken for the fundamental when density changes inside a segment.
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (endPhase(selected, mid) < Math.PI) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / (4 * Math.PI);
}
export function trialResult(s: TrialState, test = s.test) {
  const spec = at(TRIAL_TESTS, test),
    pieces = stringPieces(s.string, s.contrast);
  // T/mu0 = (2*f0)^2 for a unit-length uniform reference string.
  const aHz = 2 * s.root * fundamental(pieces, spec.a[0], spec.a[1]);
  const bHz = 2 * s.root * fundamental(pieces, spec.b[0], spec.b[1]);
  const differenceCents = 1200 * Math.log2(bHz / aHz);
  return {
    test,
    spec,
    aHz,
    bHz,
    differenceCents,
    differenceHz: Math.abs(bHz - aHz),
    same: Math.abs(differenceCents) < 1e-7,
  };
}
export function modeShape(pieces: readonly Piece[], start: number, end: number) {
  const selected = slice(pieces, start, end);
  const lambda = 2 * Math.PI * fundamental(pieces, start, end);
  let u = 0,
    derivative = 1;
  const values: { x: number; y: number }[] = [{ x: start, y: 0 }];
  for (const p of selected) {
    const k = lambda * Math.sqrt(p.density),
      length = p.end - p.start;
    for (let j = 1; j <= 16; j++) {
      const d = (length * j) / 16;
      values.push({ x: p.start + d, y: u * Math.cos(k * d) + (derivative * Math.sin(k * d)) / k });
    }
    const next = u * Math.cos(k * length) + (derivative * Math.sin(k * length)) / k;
    derivative = -u * k * Math.sin(k * length) + derivative * Math.cos(k * length);
    u = next;
  }
  const peak = Math.max(...values.map((p) => Math.abs(p.y)));
  return values.map((p) => ({ x: p.x, y: p.y / peak }));
}
export function trialPlan(s: TrialState): Plan {
  const r = trialResult(s);
  const make = (note: number, hz: number, start: number, duration: number): Tone => ({
    note,
    hz,
    start,
    duration,
    tuning: note === 0 ? "ratios" : "keyboard",
  });
  const tones =
    s.sound === "compare"
      ? [make(0, r.aHz, 0.12, 1.4), make(1, r.bHz, 1.92, 1.4)]
      : [make(0, r.aHz, 0.12, 4), make(1, s.sound === "control" ? r.aHz : r.bHz, 0.12, 4)];
  return { tones, duration: Math.max(...tones.map((t) => t.start + t.duration)) + 0.2 };
}
export function trialCsv(s: TrialState): string {
  const rows = TRIAL_TESTS.map((_, test) => {
    const r = trialResult(s, test);
    return [
      s.string,
      s.contrast,
      s.root,
      test,
      r.spec.a.join(":"),
      r.spec.b.join(":"),
      r.aHz,
      r.bHz,
      r.differenceCents,
      r.differenceHz,
      r.same,
      test === s.test,
    ].join(",");
  });
  return `string,relative_heavy_density,uniform_full_string_hz,test,a_segment,b_segment,a_hz,b_hz,b_minus_a_cents,absolute_difference_hz,equal_in_model,selected\n${rows.join("\n")}\n`;
}
export function trialQuery(s: TrialState): string {
  return `?string=${s.string}&density=${s.contrast}&test=${s.test}&a=${s.root}&sound=${s.sound}&p=${s.passage}&page=${s.page}`;
}
export function trialState(search: string): { state: TrialState; reset: boolean } {
  const q = new URLSearchParams(search),
    s = { ...TRIAL_DEFAULT };
  let reset = false;
  for (const [key, target, allowed] of [
    ["string", "string", STRINGS],
    ["sound", "sound", TRIAL_SOUNDS],
  ] as const)
    if (q.has(key)) {
      const v = q.get(key);
      if (q.getAll(key).length !== 1 || !allowed.some((a) => a === v)) reset = true;
      else Object.assign(s, { [target]: v });
    }
  for (const [key, target, min, max, step] of [
    ["density", "contrast", 1, 4, 0.25],
    ["test", "test", 0, 2, 1],
    ["p", "passage", 0, 5, 1],
    ["page", "page", 33, 38, 1],
    ["a", "root", 110, 220, 110],
  ] as const)
    if (q.has(key)) {
      const raw = q.get(key) ?? "",
        v = Number(raw);
      if (
        q.getAll(key).length !== 1 ||
        !/^\d+(?:\.\d+)?$/.test(raw) ||
        !Number.isFinite(v) ||
        v < min ||
        v > max ||
        !Number.isInteger((v - min) / step)
      )
        reset = true;
      else Object.assign(s, { [target]: v });
    }
  return { state: s, reset };
}
