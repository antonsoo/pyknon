import { FRAME_PAIRS, type FrameAnchor, type FrameSign, notationFrame } from "./notation-frame";
import type { Plan, Tone } from "./tetrachord";

// A selected span of Jan 1895 p369, retaining row functions as well as shapes.
// These are teaching-diagram IDs, not Unicode character or universal pitch IDs.
export const SIGNS = {
  sigma: "lunate sigma",
  rho: "rho",
  mu: "mu",
  iota: "iota",
  "square-u": "open-topped square sign",
  zeta: "zeta",
  epsilon: "square epsilon",
  "side-phi": "sideways phi",
  "turned-sigma": "upturned sigma",
  pi: "drawn-down pi",
  "side-lambda": "sideways lambda",
  bracket: "sideways pi",
  "slant-eta": "drawn-down slanting eta",
} as const;
export type Sign = keyof typeof SIGNS;
export type Alphabet = "vocal" | "instrumental";
export type NoteRow = {
  id: string;
  number: number;
  greek: string;
  roman: string;
  english: string;
  vocal: Sign;
  instrumental: Sign;
  description: string;
  translation: string;
  // Modern instructional realizations relative to Lydian mese, not ancient Hz.
  semitones: number;
  ratio: readonly [number, number];
  band: readonly [number, number];
};
export const NOTE_ROWS: readonly NoteRow[] = [
  {
    id: "hypate-meson",
    number: 5,
    greek: "ὑπάτη μέσων",
    roman: "hypatē mesōn",
    english: "Lower boundary of the middle tetrachord",
    vocal: "sigma",
    instrumental: "sigma",
    description: "ὑπάτη μέσων σίγμα καὶ σίγμα",
    translation: "Hypatē of the middle tetrachord: sigma and sigma.",
    semitones: -5,
    ratio: [3, 4],
    band: [0.226, 0.259],
  },
  {
    id: "parhypate-meson",
    number: 6,
    greek: "παρυπάτη μέσων",
    roman: "parypatē mesōn",
    english: "First inner note of the middle tetrachord",
    vocal: "rho",
    instrumental: "turned-sigma",
    description: "παρυπάτη μέσων ῥῶ καὶ σίγμα ἀνεστραμμένον",
    translation: "Parhypatē of the middle tetrachord: rho and upturned sigma.",
    semitones: -4,
    ratio: [64, 81],
    band: [0.261, 0.308],
  },
  {
    id: "diatonos-meson",
    number: 7,
    greek: "μέσων διάτονος",
    roman: "mesōn diatonos",
    english: "Diatonic second inner note of the middle tetrachord",
    vocal: "mu",
    instrumental: "pi",
    description: "μέσων διάτονος μῦ καὶ πῖ καθειλκυσμένον",
    translation: "Diatonic [lichanos] of the middle tetrachord: mu and drawn-down pi.",
    semitones: -2,
    ratio: [8, 9],
    band: [0.309, 0.357],
  },
  {
    id: "mese",
    number: 8,
    greek: "μέση",
    roman: "mesē",
    english: "Mesē, the middle note",
    vocal: "iota",
    instrumental: "side-lambda",
    description: "μέση ἰῶτα καὶ λάβδα πλάγιον",
    translation: "Mesē: iota and sideways lambda.",
    semitones: 0,
    ratio: [1, 1],
    band: [0.357, 0.384],
  },
  {
    id: "nete-synemmenon",
    number: 11,
    greek: "νήτη συνημμένων",
    roman: "nētē synēmmenōn",
    english: "Upper boundary of the conjunct tetrachord",
    vocal: "square-u",
    instrumental: "zeta",
    description: "νήτη συνημμένων ὦ τετράγωνον ὕπτιον καὶ ζῆτα",
    translation: "Nētē of the conjunct tetrachord: square omega lying on its back, and zeta.",
    semitones: 5,
    ratio: [4, 3],
    band: [0.465, 0.514],
  },
  {
    id: "paramese",
    number: 12,
    greek: "παραμέση",
    roman: "paramesē",
    english: "Paramesē, beside mesē",
    vocal: "zeta",
    instrumental: "bracket",
    description: "παραμέση ζῆτα καὶ πῖ πλάγιον",
    translation: "Paramesē: zeta and sideways pi.",
    semitones: 2,
    ratio: [9, 8],
    band: [0.513, 0.541],
  },
  {
    id: "trite-diezeugmenon",
    number: 13,
    greek: "τρίτη διεζευγμένων",
    roman: "tritē diezeugmenōn",
    english: "First inner note of the disjunct tetrachord",
    vocal: "epsilon",
    instrumental: "square-u",
    description: "τρίτη διεζευγμένων εἰ τετράγωνον καὶ πῖ ἀνεστραμμένον",
    translation: "Tritē of the disjunct tetrachord: square epsilon and upturned pi.",
    semitones: 3,
    ratio: [32, 27],
    band: [0.544, 0.585],
  },
  {
    id: "diatonos-diezeugmenon",
    number: 14,
    greek: "διεζευγμένων διάτονος",
    roman: "diezeugmenōn diatonos",
    english: "Diatonic second inner note of the disjunct tetrachord",
    vocal: "square-u",
    instrumental: "zeta",
    description: "διεζευγμένων διάτονος ὦ τετράγωνον ὕπτιον καὶ ζῆτα",
    translation:
      "Diatonic [paranētē] of the disjunct tetrachord: square omega lying on its back, and zeta.",
    semitones: 5,
    ratio: [4, 3],
    band: [0.587, 0.635],
  },
  {
    id: "nete-diezeugmenon",
    number: 15,
    greek: "νήτη διεζευγμένων",
    roman: "nētē diezeugmenōn",
    english: "Upper boundary of the disjunct tetrachord",
    vocal: "side-phi",
    instrumental: "slant-eta",
    description: "νήτη διεζευγμένων φῖ πλάγιον καὶ ἦτα ἀμελητικὸν καθειλκυσμένον",
    translation: "Nētē of the disjunct tetrachord: sideways phi and drawn-down slanting eta.",
    semitones: 7,
    ratio: [3, 2],
    band: [0.635, 0.681],
  },
];
export const EXERCISES = {
  bridge: {
    title: "Across the two alphabets",
    rows: ["mese", "paramese", "nete-synemmenon", "mese"],
  },
  steps: {
    title: "The middle tetrachord",
    rows: ["hypate-meson", "parhypate-meson", "diatonos-meson", "mese"],
  },
  functions: {
    title: "Two names, one sign pair",
    rows: ["nete-synemmenon", "diatonos-diezeugmenon", "paramese", "trite-diezeugmenon"],
  },
} as const;
export type Exercise = keyof typeof EXERCISES;
export type NotationState = {
  exercise: Exercise;
  given: Alphabet;
  answers: (Sign | null)[];
  cursor: number;
  row: string;
  sign: "zeta" | "square-u" | "sigma";
  alphabet: Alphabet;
  tuning: "equal" | "pythagorean";
  reference: 220 | 330 | 440;
  sound: "sign" | "line" | "frame";
  frameSign: FrameSign;
  frameAnchor: FrameAnchor;
  sourceContext: "lookup" | "frame" | "reading";
  reading: number;
  page: "title" | "367" | "368" | "369" | "370";
};
export const NOTATION_DEFAULT: NotationState = {
  exercise: "bridge",
  given: "vocal",
  answers: ["side-lambda", "zeta", "square-u", "side-lambda"],
  cursor: 1,
  row: "paramese",
  sign: "zeta",
  alphabet: "vocal",
  tuning: "pythagorean",
  reference: 330,
  sound: "sign",
  frameSign: "iota",
  frameAnchor: "sign",
  sourceContext: "lookup",
  reading: 0,
  page: "369",
};
export const NOTATION_LIMITS =
  "Selected diatonic Lydian sign pairs and four shared Lydian/Hypolydian pairs from Alypius, Jan 1895 pp368–370. Modern vector teaching signs, a newly composed practice line, chosen tuning and reference constraints, equal durations and synthetic sine tones. These are not a manuscript facsimile, a complete Greek notation decoder or a recovered ancient performance.";

export const otherAlphabet = (a: Alphabet): Alphabet => (a === "vocal" ? "instrumental" : "vocal");
export function noteRow(id: string): NoteRow {
  const row = NOTE_ROWS.find((r) => r.id === id);
  if (!row) throw new Error("That row is outside this desk’s retained span.");
  return row;
}
export function readSign(sign: Sign, alphabet: Alphabet): NoteRow[] {
  return NOTE_ROWS.filter((row) => row[alphabet] === sign);
}
export function signPalette(alphabet: Alphabet): Sign[] {
  return [...new Set(NOTE_ROWS.map((row) => row[alphabet]))];
}
export function noteRatio(row: NoteRow, s: NotationState): number {
  return s.tuning === "pythagorean" ? row.ratio[0] / row.ratio[1] : 2 ** (row.semitones / 12);
}
export function noteFrequency(row: NoteRow, s: NotationState): number {
  return s.reference * noteRatio(row, s);
}
function sameModelPitch(a: NoteRow, b: NoteRow, s: NotationState): boolean {
  return s.tuning === "pythagorean"
    ? a.ratio[0] * b.ratio[1] === b.ratio[0] * a.ratio[1]
    : a.semitones === b.semitones;
}
export function signPitch(sign: Sign, alphabet: Alphabet, s: NotationState): NoteRow | undefined {
  const candidates = readSign(sign, alphabet),
    first = candidates[0];
  // A representative for pitch is permitted only when every retained reading
  // agrees in the selected model. It never selects a unique table function.
  return first && candidates.every((row) => sameModelPitch(row, first, s)) ? first : undefined;
}
export function translation(s: NotationState) {
  return EXERCISES[s.exercise].rows.map((id, index) => {
    const target = noteRow(id),
      answer = s.answers[index] ?? null;
    const candidates = answer ? readSign(answer, otherAlphabet(s.given)) : [];
    const pitchRow = answer ? signPitch(answer, otherAlphabet(s.given), s) : undefined;
    return {
      index,
      target,
      answer,
      candidates,
      pitchRow,
      // Multiple functions can remain. Never turn the first row into a unique reading.
      samePitch: !!pitchRow && sameModelPitch(pitchRow, target, s),
      includesFunction: candidates.some((r) => r.id === id),
      centsDifference: pitchRow
        ? 1200 * Math.log2(noteRatio(pitchRow, s) / noteRatio(target, s))
        : null,
    };
  });
}
export function validNotationState(value: unknown): value is NotationState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const v = value as Record<string, unknown>;
  const keys = Object.keys(NOTATION_DEFAULT);
  if (Object.keys(v).length !== keys.length || keys.some((k) => !Object.hasOwn(v, k))) return false;
  return (
    typeof v.exercise === "string" &&
    Object.hasOwn(EXERCISES, v.exercise) &&
    (v.given === "vocal" || v.given === "instrumental") &&
    Array.isArray(v.answers) &&
    v.answers.length === 4 &&
    v.answers.every(
      (a) =>
        a === null ||
        (typeof a === "string" &&
          signPalette(otherAlphabet(v.given as Alphabet)).includes(a as Sign)),
    ) &&
    Number.isInteger(v.cursor) &&
    Number(v.cursor) >= 0 &&
    Number(v.cursor) < 4 &&
    NOTE_ROWS.some((r) => r.id === v.row) &&
    typeof v.sign === "string" &&
    ["zeta", "square-u", "sigma"].includes(v.sign) &&
    (v.alphabet === "vocal" || v.alphabet === "instrumental") &&
    (v.tuning === "equal" || v.tuning === "pythagorean") &&
    [220, 330, 440].includes(Number(v.reference)) &&
    typeof v.reference === "number" &&
    (v.sound === "sign" || v.sound === "line" || v.sound === "frame") &&
    typeof v.frameSign === "string" &&
    Object.hasOwn(FRAME_PAIRS, v.frameSign) &&
    (v.frameAnchor === "sign" || v.frameAnchor === "mese") &&
    (v.sourceContext === "lookup" ||
      v.sourceContext === "frame" ||
      v.sourceContext === "reading") &&
    Number.isInteger(v.reading) &&
    Number(v.reading) >= 0 &&
    Number(v.reading) < 6 &&
    typeof v.page === "string" &&
    ["title", "367", "368", "369", "370"].includes(v.page)
  );
}
export function notationJSON(s: NotationState): string {
  if (!validNotationState(s)) throw new Error("Invalid translation state.");
  return `${JSON.stringify(
    { format: "pyknon-notation", version: 1, scope: NOTATION_LIMITS, state: s },
    null,
    2,
  )}\n`;
}
export function importNotationJSON(text: string): NotationState {
  if (text.length > 16000)
    throw new Error("This translation record is too large. Choose a desk JSON file.");
  const record: unknown = JSON.parse(text);
  if (!record || typeof record !== "object" || Array.isArray(record))
    throw new Error("Choose a version 1 Pyknon notation record.");
  const r = record as Record<string, unknown>;
  if (r.format !== "pyknon-notation" || r.version !== 1 || !validNotationState(r.state))
    throw new Error("Choose a version 1 Pyknon notation record with valid signs and settings.");
  return structuredClone(r.state);
}
export function notationURL(s: NotationState, base: string): string {
  const url = new URL(base);
  url.search = "";
  url.hash = "translation";
  for (const [key, value] of Object.entries(s))
    url.searchParams.set(
      key,
      key === "answers" ? s.answers.map((a) => a ?? "_").join(".") : String(value),
    );
  return url.href;
}
export function notationFromURL(href: string): { state: NotationState; notice: string } {
  const fallback = () => structuredClone(NOTATION_DEFAULT);
  const q = new URL(href).searchParams;
  if (!q.size) return { state: fallback(), notice: "" };
  try {
    const keys = Object.keys(NOTATION_DEFAULT);
    if (q.size !== keys.length || keys.some((k) => q.getAll(k).length !== 1))
      throw new Error("missing or repeated settings");
    const value: Record<string, unknown> = Object.fromEntries(q);
    for (const key of ["cursor", "reading", "reference"]) {
      if (!/^\d{1,3}$/.test(q.get(key) ?? "")) throw new Error("invalid number");
      value[key] = Number(q.get(key));
    }
    value.answers = (q.get("answers") ?? "").split(".").map((a) => (a === "_" ? null : a));
    if (!validNotationState(value)) throw new Error("invalid signs or settings");
    return { state: value, notice: "The linked translation and settings are restored." };
  } catch {
    return {
      state: fallback(),
      notice:
        "This link has incomplete or invalid settings. The clearly labelled starting example is shown; no partial translation was restored.",
    };
  }
}
function csvCell(value: string | number | boolean | null) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}
export function notationCSV(s: NotationState): string {
  const rows: (string | number | boolean | null)[][] = [
    [
      "slot",
      "given_alphabet",
      "target_function",
      "target_printed_row",
      "given_sign",
      "written_alphabet",
      "written_sign",
      "possible_written_functions",
      "pitch_preserved_in_model",
      "target_ratio_symbol",
      "target_hz_approx",
      "written_hz_approx",
      "difference_cents_approx",
      "tuning_model",
      "reference_mese_hz",
      "source",
    ],
  ];
  for (const t of translation(s))
    rows.push([
      t.index + 1,
      s.given,
      t.target.id,
      t.target.number,
      t.target[s.given],
      otherAlphabet(s.given),
      t.answer,
      t.candidates.map((c) => c.id).join(" | "),
      t.samePitch,
      s.tuning === "pythagorean" ? t.target.ratio.join("/") : `2^(${t.target.semitones}/12)`,
      noteFrequency(t.target, s),
      t.pitchRow ? noteFrequency(t.pitchRow, s) : null,
      t.centsDifference,
      s.tuning,
      s.reference,
      "Jan 1895 p369",
    ]);
  return `${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
}
export function notationPlan(s: NotationState): Plan {
  const tones: Tone[] = [];
  const push = (row: NoteRow | undefined, start: number, index: number) => {
    if (row)
      tones.push({
        hz: noteFrequency(row, s),
        start,
        duration: 0.6,
        note: index,
        tuning: s.tuning === "pythagorean" ? "ratios" : "keyboard",
      });
  };
  if (s.sound === "sign") {
    push(signPitch(s.sign, "vocal", s), 0, 0);
    push(signPitch(s.sign, "instrumental", s), 0.9, 1);
    return { tones, duration: 1.7 };
  }
  if (s.sound === "frame") {
    const frame = notationFrame(s);
    return {
      tones: [frame.lydian.signHz, frame.hypolydian.signHz].map((hz, note) => ({
        hz,
        note,
        start: note * 0.9,
        duration: 0.6,
        tuning: s.tuning === "pythagorean" ? "ratios" : "keyboard",
      })),
      duration: 1.7,
    };
  }
  const line = translation(s);
  line.forEach((t, i) => {
    push(t.target, i * 0.75, i);
  });
  line.forEach((t, i) => {
    push(t.pitchRow, 3.6 + i * 0.75, i + 4);
  });
  return { tones, duration: 6.8 };
}
