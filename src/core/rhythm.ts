import type { Plan, Tone } from "./tetrachord";
export type RhythmGenus = "dactylic" | "iambic" | "paeonic" | "outside";
export type RhythmListening = "chosen" | "compare" | "between";
export type Texture = "units" | "joined";
export type Between = "one" | "middle" | "two";
export interface RhythmState {
  total: number;
  up: number;
  unitMs: number;
  texture: Texture;
  between: Between;
  sound: RhythmListening;
}
export const RHYTHM_DEFAULT: RhythmState = {
  total: 6,
  up: 2,
  unitMs: 300,
  texture: "units",
  between: "middle",
  sound: "compare",
};
export const GENUS_NAMES: Record<RhythmGenus, string> = {
  dactylic: "Equal · dactylic",
  iambic: "Double · iambic",
  paeonic: "3:2 · paeonic",
  outside: "Outside the three admitted genera",
};
export interface Foot {
  up: number;
  down: number;
  total: number;
  ratio: readonly [number, number];
  genus: RhythmGenus;
}
function gcd(a: number, b: number): number {
  while (b) {
    const r = a % b;
    a = b;
    b = r;
  }
  return a;
}
/** Integer primary-time portions only: not a classifier for the alogos passage. */
export function foot(total: number, up: number): Foot {
  if (
    !Number.isInteger(total) ||
    total < 3 ||
    total > 8 ||
    !Number.isInteger(up) ||
    up < 1 ||
    up >= total
  )
    throw new Error(
      "Use 3–8 total primary times and a positive whole-number portion on each side.",
    );
  const down = total - up,
    larger = Math.max(up, down),
    smaller = Math.min(up, down),
    d = gcd(larger, smaller);
  const ratio = [larger / d, smaller / d] as const;
  const genus: RhythmGenus =
    ratio[0] === 1 && ratio[1] === 1
      ? "dactylic"
      : ratio[0] === 2 && ratio[1] === 1
        ? "iambic"
        : ratio[0] === 3 && ratio[1] === 2
          ? "paeonic"
          : "outside";
  return { up, down, total, ratio, genus };
}
export function reference(s: RhythmState): Foot {
  return foot(s.total, Math.floor(s.total / 2));
}
export function chosen(s: RhythmState): Foot {
  return foot(s.total, s.up);
}
export function parseRhythm(input: unknown): RhythmState {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Expected a rhythm comparison object.");
  const d = input as Record<string, unknown>;
  if (Object.keys(d).sort().join(",") !== "between,sound,texture,total,unitMs,up")
    throw new Error("Expected exactly total, up, unitMs, texture, between and sound.");
  if (typeof d.total !== "number" || typeof d.up !== "number")
    throw new Error("Foot durations must be numbers.");
  foot(d.total, d.up);
  if (
    typeof d.unitMs !== "number" ||
    !Number.isInteger(d.unitMs) ||
    d.unitMs < 180 ||
    d.unitMs > 600 ||
    (d.unitMs - 180) % 30 !== 0
  )
    throw new Error("Choose a modern unit from 180 to 600 ms in 30 ms steps.");
  if (d.texture !== "units" && d.texture !== "joined")
    throw new Error("Choose unit attacks or joined portions.");
  if (d.between !== "one" && d.between !== "middle" && d.between !== "two")
    throw new Error("Choose one of the three intermediate-foot examples.");
  if (d.sound !== "chosen" && d.sound !== "compare" && d.sound !== "between")
    throw new Error("Choose a supported listening selection.");
  return {
    total: d.total,
    up: d.up,
    unitMs: d.unitMs,
    texture: d.texture,
    between: d.between,
    sound: d.sound,
  };
}
export function rhythmQuery(s: RhythmState): string {
  return `?total=${s.total}&up=${s.up}&unit=${s.unitMs}&texture=${s.texture}&between=${s.between}&sound=${s.sound}`;
}
export function rhythmFromQuery(search: string): { state: RhythmState; notice: string } {
  if (!search) return { state: { ...RHYTHM_DEFAULT }, notice: "" };
  const p = new URLSearchParams(search);
  try {
    const keys = ["total", "up", "unit", "texture", "between", "sound"];
    if (
      keys.some((key) => p.getAll(key).length !== 1) ||
      [...p.keys()].some((key) => !keys.includes(key))
    )
      throw new Error("Ambiguous rhythm settings.");
    return {
      state: parseRhythm({
        total: Number(p.get("total")),
        up: Number(p.get("up")),
        unitMs: Number(p.get("unit")),
        texture: p.get("texture"),
        between: p.get("between"),
        sound: p.get("sound"),
      }),
      notice: "",
    };
  } catch {
    return {
      state: { ...RHYTHM_DEFAULT },
      notice:
        "This link contains unsupported rhythm settings. The initial six-time comparison is shown.",
    };
  }
}
export function rhythmJSON(s: RhythmState): string {
  return `${JSON.stringify({ format: "pyknon-rhythm-v1", state: s }, null, 2)}\n`;
}
export function rhythmImport(raw: string): RhythmState {
  if (raw.length > 65536) throw new Error("The rhythm file must be under 64 KB.");
  const input: unknown = JSON.parse(raw);
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Expected a saved Pyknon rhythm comparison.");
  const d = input as Record<string, unknown>;
  if (Object.keys(d).sort().join(",") !== "format,state" || d.format !== "pyknon-rhythm-v1")
    throw new Error("Expected the pyknon-rhythm-v1 format and state.");
  return parseRhythm(d.state);
}
export interface BetweenFoot {
  id: Between;
  up: number;
  down: 2;
  total: number;
  upDown: string;
  label: string;
}
export const BETWEEN_FEET: readonly BetweenFoot[] = [
  { id: "one", up: 1, down: 2, total: 3, upDown: "1:2", label: "One up, two down: endpoint" },
  {
    id: "middle",
    up: 1.5,
    down: 2,
    total: 3.5,
    upDown: "3:4",
    label: "An illustrative intermediate size",
  },
  { id: "two", up: 2, down: 2, total: 4, upDown: "1:1", label: "Two up, two down: endpoint" },
];
export function betweenFoot(id: Between): BetweenFoot {
  const found = BETWEEN_FEET.find((f) => f.id === id);
  if (!found) throw new Error("Unknown intermediate example.");
  return found;
}

export type RhythmTone = Tone & { row: number; unit: number; kind: "up" | "down" | "inner" };
export interface RhythmPlan extends Plan {
  tones: RhythmTone[];
}
export const RHYTHM_CLICK = 0.12;
export const RHYTHM_GAP = 0.45;
export const BETWEEN_UNIT = 0.3;
/** Different pitches identify modern marker roles; no ancient percussion pitch is implied. */
export const MARKER_HZ = { up: 720, down: 480, inner: 960 } as const;
export function rhythmPlan(s: RhythmState, kind: RhythmListening): RhythmPlan {
  parseRhythm(s);
  const tones: RhythmTone[] = [];
  let offset = 0.12;
  const put = (
    up: number,
    down: number,
    unitSeconds: number,
    row: number,
    texture: Texture,
    downFirst = false,
  ) => {
    const total = up + down,
      first = downFirst ? down : up;
    for (let repeat = 0; repeat < 2; repeat++) {
      const boundary = offset + repeat * total * unitSeconds;
      const attacks = texture === "units" ? Array.from({ length: total }, (_, i) => i) : [0, first];
      for (const unit of attacks) {
        const role =
          unit === 0
            ? downFirst
              ? "down"
              : "up"
            : unit === first
              ? downFirst
                ? "up"
                : "down"
              : "inner";
        tones.push({
          start: boundary + unit * unitSeconds,
          duration: RHYTHM_CLICK,
          hz: MARKER_HZ[role],
          note: tones.length,
          tuning: "ratios",
          row,
          unit,
          kind: role,
        });
      }
    }
    offset += 2 * total * unitSeconds;
  };
  if (kind === "between") {
    const f = betweenFoot(s.between);
    put(
      f.up,
      f.down,
      BETWEEN_UNIT,
      BETWEEN_FEET.findIndex((f) => f.id === s.between),
      "joined",
      true,
    );
  } else {
    if (kind === "compare") {
      const a = reference(s);
      put(a.up, a.down, s.unitMs / 1000, 0, s.texture);
      offset += RHYTHM_GAP;
    }
    const b = chosen(s);
    put(b.up, b.down, s.unitMs / 1000, 1, s.texture);
  }
  return { tones, duration: offset + 0.12 };
}
export function rhythmCsv(s: RhythmState): string {
  const lines = [
    "# Pyknon rhythmic comparison; modern sine markers, not a recovered performance",
    `# primary unit=${s.unitMs} ms; inner attacks=${s.texture}; intermediate examples use a fixed 300 ms unit`,
    "example,up_times,down_times,total_times,larger_to_smaller,admitted_genus,unit_ms,foot_ms",
  ];
  for (const [name, f] of [
    ["reference", reference(s)],
    ["chosen", chosen(s)],
  ] as const)
    lines.push(
      [name, f.up, f.down, f.total, f.ratio.join(":"), f.genus, s.unitMs, f.total * s.unitMs].join(
        ",",
      ),
    );
  for (const f of BETWEEN_FEET)
    lines.push(
      [
        `intermediate_${f.id}`,
        f.up,
        f.down,
        f.total,
        f.id === "middle" ? "4:3" : f.id === "one" ? "2:1" : "1:1",
        "not_classified_by_integer_bench",
        300,
        f.total * 300,
      ].join(","),
    );
  return `${lines.join("\n")}\n`;
}
export function rhythmOnsetsCsv(s: RhythmState, kind: RhythmListening): string {
  const p = rhythmPlan(s, kind);
  return `# Modern marker onsets; listening=${kind}\nindex,row,unit,start_seconds,duration_seconds,marker_role,hz\n${p.tones.map((t, i) => [i, t.row, t.unit, t.start.toFixed(9), t.duration, t.kind, t.hz].join(",")).join("\n")}\n`;
}
