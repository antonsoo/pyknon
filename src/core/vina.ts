import { at, type Plan, type Tone } from "./tetrachord";

/** A modern family under pure-fourth/fifth assumptions, after Bel's analysis.
 * The ancient text supplies counts and matching relations, not these ratios.
 * No 22-note frequency table is invented from the seven principal notes.
 */
export const VINA_A = 1200 * Math.log2(9 / 8);
export const VINA_L = 1200 * Math.log2(256 / 243);
export const VINA_MAX = (VINA_A - VINA_L) / 2;
export const VINA_COMMA = 1200 * Math.log2(81 / 80);
export const VINA_NAMES = ["Sa", "Ri", "Ga", "Ma", "Pa", "Dha", "Ni"] as const;
export const VINA_LONG = [
  "ṣaḍja",
  "ṛṣabha",
  "gāndhāra",
  "madhyama",
  "pañcama",
  "dhaivata",
  "niṣāda",
] as const;
export const VINA_COUNTS = [4, 3, 2, 4, 4, 3, 2] as const;
export const VINA_PAGES = ["title", "27", "28", "29", "57", "58", "85", "86"] as const;
export type VinaPage = (typeof VINA_PAGES)[number];
export type VinaTuning = "comma" | "quarter" | "boundary" | "zero" | "free";
export type VinaSound = "pair" | "fixed" | "moving" | "compare";
export interface VinaState {
  tuning: VinaTuning;
  tenth: number;
  position: number;
  root: 110 | 220;
  selected: number;
  sound: VinaSound;
  reading: number;
  page: VinaPage;
}
export const VINA_DEFAULT: VinaState = {
  tuning: "comma",
  tenth: 215,
  position: 2000,
  root: 220,
  selected: 2,
  sound: "pair",
  reading: 3,
  page: "29",
};
export function vinaParameter(s: VinaState): number {
  return s.tuning === "comma"
    ? VINA_COMMA
    : s.tuning === "quarter"
      ? VINA_A / 4
      : s.tuning === "boundary"
        ? VINA_MAX
        : s.tuning === "zero"
          ? 0
          : s.tenth / 10;
}
export function vinaModel(s: VinaState) {
  const p = vinaParameter(s),
    a = VINA_A,
    b = a - p,
    c = VINA_L + p;
  const fixed = [
    0,
    b,
    1200 * Math.log2(32 / 27),
    1200 * Math.log2(4 / 3),
    1200 * Math.log2(3 / 2),
    b + 1200 * Math.log2(3 / 2),
    1200 * Math.log2(16 / 9),
  ];
  const lowerings = [0, p, c, b, a];
  const stage = Math.floor(s.position / 1000),
    fraction = (s.position % 1000) / 1000;
  const shift =
    at(lowerings, stage) +
    (stage < 4 ? fraction * (at(lowerings, stage + 1) - at(lowerings, stage)) : 0);
  const moving = fixed.map((x) => x - shift);
  // Epsilon resolves floating arithmetic at constructed equality only. It is
  // neither a psychoacoustic tolerance nor a criterion of human consonance.
  const valid = p > 1e-9 && b - c > 1e-9;
  const gaps = [a, b, c, a, a, b, c];
  const increments = lowerings.slice(1).map((x, i) => x - at(lowerings, i));
  return {
    p,
    a,
    b,
    c,
    fixed,
    moving,
    lowerings,
    increments,
    shift,
    stage,
    fraction,
    valid,
    gaps,
    loweredPa: at(fixed, 4) - p,
    fixedHz: fixed.map((x) => s.root * 2 ** (x / 1200)),
    movingHz: moving.map((x) => s.root * 2 ** (x / 1200)),
  };
}
export interface VinaMatch {
  moving: number;
  fixed: number;
  octave: number;
  delta: number;
}
export function vinaMatches(s: VinaState): VinaMatch[] {
  const m = vinaModel(s),
    pairs: VinaMatch[] = [];
  for (const [i, pitch] of m.moving.entries())
    for (const [j, target] of m.fixed.entries()) {
      const octave = Math.round((pitch - target) / 1200) || 0,
        delta = pitch - target - 1200 * octave;
      if (Math.abs(delta) < 1e-8) pairs.push({ moving: i, fixed: j, octave, delta });
    }
  return pairs;
}
export function vinaNearest(s: VinaState): VinaMatch {
  const m = vinaModel(s),
    x = at(m.moving, s.selected);
  const candidates = m.fixed.map((target, fixed) => {
    const octave = Math.round((x - target) / 1200) || 0;
    return { moving: s.selected, fixed, octave, delta: x - target - 1200 * octave };
  });
  candidates.sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta));
  return at(candidates, 0);
}
export function parseVina(input: unknown): VinaState {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw Error("Expected a two-vīṇā comparison object.");
  const d = input as Record<string, unknown>;
  if (Object.keys(d).sort().join(",") !== "page,position,reading,root,selected,sound,tenth,tuning")
    throw Error("Expected exactly the eight two-vīṇā settings.");
  const integer = (key: string, min: number, max: number): number => {
    const v = d[key];
    if (typeof v !== "number" || !Number.isInteger(v) || v < min || v > max)
      throw Error(`Unsupported ${key} setting.`);
    return v;
  };
  if (
    typeof d.tuning !== "string" ||
    !["comma", "quarter", "boundary", "zero", "free"].includes(d.tuning)
  )
    throw Error("Unknown tuning assumption.");
  if (typeof d.sound !== "string" || !["pair", "fixed", "moving", "compare"].includes(d.sound))
    throw Error("Unknown listening selection.");
  if (!VINA_PAGES.some((p) => p === d.page)) throw Error("Unknown source page.");
  if (d.root !== 110 && d.root !== 220) throw Error("Use a modern 110 or 220 Hz reference.");
  return {
    tuning: d.tuning as VinaTuning,
    tenth: integer("tenth", 0, 700),
    position: integer("position", 0, 4000),
    root: d.root,
    selected: integer("selected", 0, 6),
    sound: d.sound as VinaSound,
    reading: integer("reading", 0, 8),
    page: d.page as VinaPage,
  };
}
export function vinaQuery(s: VinaState): string {
  return `?tuning=${s.tuning}&tenth=${s.tenth}&position=${s.position}&root=${s.root}&selected=${s.selected}&sound=${s.sound}&reading=${s.reading}&page=${s.page}`;
}
export function vinaFromQuery(search: string): { state: VinaState; notice: string } {
  if (!search) return { state: { ...VINA_DEFAULT }, notice: "" };
  try {
    const p = new URLSearchParams(search),
      keys = ["tuning", "tenth", "position", "root", "selected", "sound", "reading", "page"];
    if ([...p.keys()].some((k) => !keys.includes(k)) || keys.some((k) => p.getAll(k).length !== 1))
      throw Error("Ambiguous settings.");
    const digits = (key: string) => {
      const raw = p.get(key) ?? "";
      if (!/^\d+$/.test(raw)) throw Error("Expected a whole-number setting.");
      return Number(raw);
    };
    return {
      state: parseVina({
        tuning: p.get("tuning"),
        tenth: digits("tenth"),
        position: digits("position"),
        root: digits("root"),
        selected: digits("selected"),
        sound: p.get("sound"),
        reading: digits("reading"),
        page: p.get("page"),
      }),
      notice: "",
    };
  } catch {
    return {
      state: { ...VINA_DEFAULT },
      notice:
        "This link has unsupported or ambiguous settings. The initial two-vīṇā comparison is shown.",
    };
  }
}
export function vinaJSON(s: VinaState): string {
  return `${JSON.stringify({ format: "pyknon-vina-v1", state: parseVina(s) }, null, 2)}\n`;
}
export function vinaImport(raw: string): VinaState {
  if (raw.length > 65536) throw Error("Use a comparison file smaller than 64 KB.");
  const d: unknown = JSON.parse(raw);
  if (!d || typeof d !== "object" || Array.isArray(d))
    throw Error("Expected a saved two-vīṇā comparison.");
  const o = d as Record<string, unknown>;
  if (Object.keys(o).sort().join(",") !== "format,state" || o.format !== "pyknon-vina-v1")
    throw Error("Unknown comparison format.");
  return parseVina(o.state);
}
export function vinaCSV(s: VinaState): string {
  const m = vinaModel(s);
  const rows = [
    "note,sanskrit,count_below,fixed_cents,moving_cents,fixed_hz,moving_hz,lowering_cents,pramana_cents,ordered_matches_valid",
  ];
  for (let i = 0; i < 7; i++)
    rows.push(
      [
        at(VINA_NAMES, i),
        at(VINA_LONG, i),
        at(VINA_COUNTS, i),
        at(m.fixed, i),
        at(m.moving, i),
        at(m.fixedHz, i),
        at(m.movingHz, i),
        m.shift,
        m.p,
        m.valid,
      ].join(","),
    );
  return `${rows.join("\r\n")}\r\n`;
}
export type VinaTone = Tone & { row: "fixed" | "moving" | "comma"; label: string };
export type VinaPlan = Omit<Plan, "tones"> & { tones: VinaTone[] };
export function vinaPlan(s: VinaState): VinaPlan {
  parseVina(s);
  const m = vinaModel(s),
    tones: VinaTone[] = [];
  const put = (
    start: number,
    duration: number,
    hz: number,
    note: number,
    row: VinaTone["row"],
    label: string,
  ) => tones.push({ start, duration, hz, note, row, label, tuning: "ratios" });
  if (s.sound === "pair") {
    const n = vinaNearest(s),
      fixed = at(m.fixedHz, n.fixed) * 2 ** n.octave,
      moving = at(m.movingHz, s.selected);
    put(
      0.12,
      1.1,
      fixed,
      n.fixed,
      "fixed",
      `${at(VINA_NAMES, n.fixed)}${n.octave ? " in the lower octave" : ""}, nearest fixed note`,
    );
    put(1.52, 1.1, moving, s.selected, "moving", `${at(VINA_NAMES, s.selected)}, moving note`);
    put(3, 2, fixed, n.fixed, "fixed", "Fixed and moving together");
    put(3, 2, moving, s.selected, "moving", "Fixed and moving together");
  } else {
    const comma = vinaModel({ ...s, tuning: "comma" });
    const groups: [number[], VinaTone["row"]][] =
      s.sound === "compare"
        ? [
            [comma.fixedHz, "comma"],
            [m.fixedHz, "fixed"],
          ]
        : [
            [
              s.sound === "fixed" ? m.fixedHz : m.movingHz,
              s.sound === "fixed" ? "fixed" : "moving",
            ],
          ];
    for (const [g, [values, row]] of groups.entries())
      for (let i = 0; i < 8; i++)
        put(
          0.12 + g * 5.8 + i * 0.65,
          0.48,
          i === 7 ? at(values, 0) * 2 : at(values, i),
          i % 7,
          row,
          `${i === 7 ? "Upper Sa" : at(VINA_NAMES, i)} · ${row === "comma" ? "21.51-cent assumption" : row === "fixed" ? "chosen tuning" : "lowered instrument"}`,
        );
  }
  return { tones, duration: Math.max(...tones.map((t) => t.start + t.duration)) + 0.2 };
}
