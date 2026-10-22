export function at<T>(items: readonly T[], index: number): T {
  const value = items[index];
  if (value === undefined) throw new RangeError(`Missing item ${index}`);
  return value;
}
export type GenusId = "enharmonic" | "chromatic" | "diatonic";
export type Direction = "up" | "down";
export type Sound = "ratios" | "keyboard" | "compare" | "close";
export type Ratio = readonly [number, number];
export type State = { genus: GenusId; root: 110 | 220 | 440; direction: Direction };
export type Genus = {
  id: GenusId;
  name: string;
  greek: string;
  roman: string;
  intervals: readonly [Ratio, Ratio, Ratio];
  description: string;
};

// Ascending frequency ratios. Ptolemy, Harmonics I.13, reporting Archytas;
// Wallis 1682 pp. 62–63. The source's pitch numbers run in the inverse direction.
export const GENERA: readonly Genus[] = [
  {
    id: "enharmonic",
    name: "Enharmonic",
    greek: "ἐναρμόνιον",
    roman: "enarmonion",
    intervals: [
      [28, 27],
      [36, 35],
      [5, 4],
    ],
    description:
      "Two very small steps below a large leap. The two inner notes round to the same modern key.",
  },
  {
    id: "chromatic",
    name: "Chromatic",
    greek: "χρωματικόν",
    roman: "chrōmatikon",
    intervals: [
      [28, 27],
      [243, 224],
      [32, 27],
    ],
    description: "The third note rises. The two lower intervals still form a close-packed group.",
  },
  {
    id: "diatonic",
    name: "Diatonic",
    greek: "διατονικόν",
    roman: "diatonikon",
    intervals: [
      [28, 27],
      [8, 7],
      [9, 8],
    ],
    description:
      "The third note rises again. The lower pair of intervals now spans more than the upper interval.",
  },
];
export const DEFAULT: State = { genus: "enharmonic", root: 220, direction: "up" };
export function genus(id: GenusId): Genus {
  return GENERA.find((item) => item.id === id) ?? at(GENERA, 0);
}
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
export function multiply(a: Ratio, b: Ratio): Ratio {
  const n = a[0] * b[0];
  const d = a[1] * b[1];
  const divisor = gcd(n, d);
  return [n / divisor, d / divisor];
}
export function cents(ratio: Ratio): number {
  return 1200 * Math.log2(ratio[0] / ratio[1]);
}
export function notes(state: State) {
  let ratio: Ratio = [1, 1];
  return [[1, 1] as Ratio, ...genus(state.genus).intervals].map((interval, index) => {
    if (index > 0) ratio = multiply(ratio, interval);
    const position = cents(ratio);
    const key = Math.round(position / 100);
    return {
      index,
      ratio,
      cents: position,
      hz: (state.root * ratio[0]) / ratio[1],
      key,
      keyboardHz: state.root * 2 ** (key / 12),
      error: key * 100 - position,
    };
  });
}
export function hasPyknon(id: GenusId): boolean {
  const [a, b, c] = genus(id).intervals;
  return cents(multiply(a, b)) < cents(c);
}
export function readState(search: string): State {
  const query = new URLSearchParams(search);
  const g = query.get("g");
  const root = Number(query.get("a"));
  return {
    genus: GENERA.some((item) => item.id === g) ? (g as GenusId) : DEFAULT.genus,
    root: root === 110 || root === 220 || root === 440 ? root : DEFAULT.root,
    direction: query.get("d") === "down" ? "down" : "up",
  };
}
export function queryFor(state: State): string {
  return `?g=${state.genus}&a=${state.root}&d=${state.direction}`;
}
export type Tone = {
  start: number;
  duration: number;
  hz: number;
  note: number;
  tuning: "ratios" | "keyboard";
};
export type Plan = { tones: Tone[]; duration: number };
export const STEP = 0.65;
export const TONE_DURATION = 0.48;
export function plan(state: State, sound: Sound): Plan {
  const values = notes(state);
  const order =
    sound === "close" ? [1, 2, 1, 2] : state.direction === "up" ? [0, 1, 2, 3] : [3, 2, 1, 0];
  const tunings: ("ratios" | "keyboard")[] =
    sound === "compare" || sound === "close" ? ["ratios", "keyboard"] : [sound];
  const tones: Tone[] = [];
  for (const [group, tuning] of tunings.entries()) {
    for (const [i, note] of order.entries()) {
      const value = at(values, note);
      tones.push({
        start: 0.12 + group * (order.length * STEP + 0.6) + i * STEP,
        duration: TONE_DURATION,
        hz: tuning === "ratios" ? value.hz : value.keyboardHz,
        note,
        tuning,
      });
    }
  }
  const last = at(tones, tones.length - 1);
  return { tones, duration: last.start + last.duration + 0.2 };
}
