import { at, cents, multiply, type Plan, type Ratio, type Tone } from "./tetrachord";

export const CANON_SOUNDS = ["compare", "beat", "walk", "control"] as const;
export type CanonSound = (typeof CANON_SOUNDS)[number];
export type CanonState = {
  step: number;
  root: 110 | 220 | 440;
  sound: CanonSound;
  passage: number;
  page: number;
};
export const CANON_DEFAULT: CanonState = {
  step: 6,
  root: 220,
  sound: "compare",
  passage: 0,
  page: 174,
};
export const LETTERS = ["Α", "Β", "Γ", "Δ", "Ε", "Ζ", "Η"] as const;
// Menge 1916, printed p. 171, visually transcribed from the page, not its OCR.
export const SOURCE_INTEGERS = [262144, 294912, 331776, 373248, 419904, 472392, 531441] as const;

export function canonState(search: string): CanonState {
  const q = new URLSearchParams(search);
  const step = q.has("n") ? Number(q.get("n")) : Number.NaN;
  const root = Number(q.get("a"));
  const sound = q.get("sound");
  const passage = q.has("p") ? Number(q.get("p")) : Number.NaN;
  const page = Number(q.get("page"));
  return {
    step: Number.isInteger(step) && step >= 0 && step <= 6 ? step : CANON_DEFAULT.step,
    root: root === 110 || root === 220 || root === 440 ? root : CANON_DEFAULT.root,
    sound: CANON_SOUNDS.find((s) => s === sound) ?? CANON_DEFAULT.sound,
    passage:
      Number.isInteger(passage) && passage >= 0 && passage <= 3 ? passage : CANON_DEFAULT.passage,
    page: Number.isInteger(page) && page >= 170 && page <= 175 ? page : CANON_DEFAULT.page,
  };
}
export function canonQuery(s: CanonState): string {
  return `?n=${s.step}&a=${s.root}&sound=${s.sound}&p=${s.passage}&page=${s.page}`;
}
export function canonSteps(root: CanonState["root"]) {
  let ratio: Ratio = [1, 1];
  return LETTERS.map((letter, step) => {
    if (step) ratio = multiply(ratio, [9, 8]);
    const ratioHz = (root * ratio[0]) / ratio[1];
    const equalHz = root * 2 ** (step / 6);
    return {
      step,
      letter,
      source: at(SOURCE_INTEGERS, step),
      ratio,
      ratioHz,
      equalHz,
      ratioCents: cents(ratio),
      equalCents: step * 200,
      differenceCents: cents(ratio) - step * 200,
      beatHz: ratioHz - equalHz,
    };
  });
}
export function canonComparison(root: CanonState["root"]) {
  const end = at(canonSteps(root), 6);
  return {
    ...end,
    octaveInteger: at(SOURCE_INTEGERS, 0) * 2,
    excessInteger: end.source - at(SOURCE_INTEGERS, 0) * 2,
    comma: multiply(end.ratio, [1, 2]),
    // This is a modern algebraic connection, not a second passage from IX.
    fifthsComma: multiply([3 ** 12, 2 ** 12], [1, 2 ** 7]),
  };
}
export function canonPlan(s: CanonState): Plan {
  const values = canonSteps(s.root);
  const selected = at(values, s.step);
  const tones: Tone[] = [];
  const tone = (step: number, tuning: Tone["tuning"], start: number, duration: number) => {
    const value = at(values, step);
    tones.push({
      note: step,
      tuning,
      hz: tuning === "ratios" ? value.ratioHz : value.equalHz,
      start,
      duration,
    });
  };
  if (s.sound === "walk") {
    for (const [group, tuning] of (["ratios", "keyboard"] as const).entries())
      for (let step = 0; step <= s.step; step++)
        tone(step, tuning, 0.12 + group * ((s.step + 1) * 0.65 + 0.6) + step * 0.65, 0.48);
  } else if (s.sound === "compare") {
    tone(s.step, "keyboard", 0.12, 1.6);
    tone(s.step, "ratios", 2.12, 1.6);
  } else {
    tone(s.step, "keyboard", 0.12, 4);
    tone(s.step, "ratios", 0.12, 4);
    if (s.sound === "control") at(tones, 1).hz = selected.equalHz;
  }
  return { tones, duration: Math.max(...tones.map((t) => t.start + t.duration)) + 0.2 };
}

export function canonCsv(s: CanonState): string {
  const rows = canonSteps(s.root).map((v) =>
    [
      v.step,
      v.letter,
      v.source,
      v.ratio.join("/"),
      v.ratioHz,
      v.equalHz,
      v.ratioCents,
      v.equalCents,
      v.differenceCents,
      v.beatHz,
      v.step === s.step,
    ].join(","),
  );
  return `step,source_letter,source_integer,frequency_ratio,ratio_hz,equal_hz,ratio_cents,equal_cents,difference_cents,frequency_difference_hz,selected\n${rows.join("\n")}\n`;
}
