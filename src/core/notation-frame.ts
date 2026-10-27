// The shared pairs are visible in Jan 1895 pp369–370. Their relative pitches
// below are two disclosed modern realizations, not ancient absolute pitches.
export const FRAME_PAIRS = {
  sigma: {
    label: "Sigma",
    instrumental: "sigma",
    lydian: {
      rows: [5],
      names: ["hypatē mesōn"],
      greek: ["ὑπάτη μέσων"],
      ratio: [3, 4],
      semitones: -5,
    },
    hypolydian: { rows: [8], names: ["mesē"], greek: ["μέση"], ratio: [1, 1], semitones: 0 },
  },
  iota: {
    label: "Iota",
    instrumental: "side-lambda",
    lydian: { rows: [8], names: ["mesē"], greek: ["μέση"], ratio: [1, 1], semitones: 0 },
    hypolydian: {
      rows: [11, 14],
      names: ["nētē synēmmenōn", "diezeugmenōn diatonos"],
      greek: ["νήτη συνημμένων", "διεζευγμένων διάτονος"],
      ratio: [4, 3],
      semitones: 5,
    },
  },
  zeta: {
    label: "Zeta",
    instrumental: "bracket",
    lydian: { rows: [12], names: ["paramesē"], greek: ["παραμέση"], ratio: [9, 8], semitones: 2 },
    hypolydian: {
      rows: [15],
      names: ["nētē diezeugmenōn"],
      greek: ["νήτη διεζευγμένων"],
      ratio: [3, 2],
      semitones: 7,
    },
  },
  "square-u": {
    label: "Square omega",
    instrumental: "zeta",
    lydian: {
      rows: [11, 14],
      names: ["nētē synēmmenōn", "diezeugmenōn diatonos"],
      greek: ["νήτη συνημμένων", "διεζευγμένων διάτονος"],
      ratio: [4, 3],
      semitones: 5,
    },
    hypolydian: {
      rows: [17],
      names: ["hyperbolaiōn diatonos"],
      greek: ["ὑπερβολαίων διάτονος"],
      ratio: [16, 9],
      semitones: 10,
    },
  },
} as const;
export type FrameSign = keyof typeof FRAME_PAIRS;
export type FrameAnchor = "sign" | "mese";
export type FrameState = {
  frameSign: FrameSign;
  frameAnchor: FrameAnchor;
  reference: number;
  tuning: "equal" | "pythagorean";
};
function fraction(n: number, d: number) {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const common = gcd(n, d);
  return `${n / common}/${d / common}`;
}
export function notationFrame(s: FrameState) {
  const pair = FRAME_PAIRS[s.frameSign],
    a = pair.lydian,
    b = pair.hypolydian;
  const lydianRatio =
    s.tuning === "pythagorean" ? a.ratio[0] / a.ratio[1] : 2 ** (a.semitones / 12);
  const hypolydianRatio =
    s.tuning === "pythagorean" ? b.ratio[0] / b.ratio[1] : 2 ** (b.semitones / 12);
  const hypolydianMeseRatio =
    s.frameAnchor === "sign"
      ? s.tuning === "pythagorean"
        ? (a.ratio[0] * b.ratio[1]) / (a.ratio[1] * b.ratio[0])
        : lydianRatio / hypolydianRatio
      : 1;
  const ratioSymbol = (n: readonly [number, number], steps: number) =>
    s.tuning === "pythagorean" ? n.join("/") : `2^(${steps}/12)`;
  const meseRelation =
    s.frameAnchor === "mese"
      ? "1/1"
      : s.tuning === "pythagorean"
        ? fraction(a.ratio[0] * b.ratio[1], a.ratio[1] * b.ratio[0])
        : `2^(${a.semitones - b.semitones}/12)`;
  const signRelation =
    s.frameAnchor === "sign"
      ? "1/1"
      : s.tuning === "pythagorean"
        ? fraction(b.ratio[0] * a.ratio[1], b.ratio[1] * a.ratio[0])
        : `2^(${b.semitones - a.semitones}/12)`;
  return {
    pair,
    meseRelation,
    signRelation,
    anchorDescription:
      s.frameAnchor === "sign"
        ? "The selected sign keeps its Lydian modeled pitch. The Hypolydian mesē moves."
        : "Both mesai keep the chosen reference pitch. The selected Hypolydian sign moves.",
    lydian: {
      table: "Lydian",
      page: "369",
      ...a,
      meseHz: s.reference,
      signHz: s.reference * lydianRatio,
      meseRatio: "1/1",
      signRatio: ratioSymbol(a.ratio, a.semitones),
    },
    hypolydian: {
      table: "Hypolydian",
      page: "370",
      ...b,
      meseHz: s.reference * hypolydianMeseRatio,
      signHz: s.frameAnchor === "sign" ? s.reference * lydianRatio : s.reference * hypolydianRatio,
      meseRatio: meseRelation,
      signRatio: ratioSymbol(b.ratio, b.semitones),
    },
  };
}
export function notationFrameCSV(s: FrameState): string {
  const frame = notationFrame(s),
    lines: (string | number)[][] = [
      [
        "table_context",
        "vocal_sign",
        "instrumental_sign",
        "possible_functions",
        "printed_rows",
        "source_printed_page",
        "anchor_choice",
        "lydian_mese_reference_hz",
        "context_mese_ratio_to_lydian_mese",
        "context_mese_hz_approx",
        "sign_ratio_to_context_mese",
        "sign_hz_approx",
        "tuning_model",
      ],
    ];
  for (const table of [frame.lydian, frame.hypolydian])
    lines.push([
      table.table,
      s.frameSign,
      frame.pair.instrumental,
      table.names.join(" | "),
      table.rows.join(" | "),
      table.page,
      s.frameAnchor,
      s.reference,
      table.meseRatio,
      table.meseHz,
      table.signRatio,
      table.signHz,
      s.tuning,
    ]);
  return `${lines.map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\r\n")}\r\n`;
}
