import { at, type Plan, type Ratio, type Tone } from "./tetrachord";

export const SOURCE_WEIGHTS = [6, 8, 9, 12] as const;
export const NOTE_NAMES = ["Hypatē", "Mesē", "Paramesē", "Nētē"] as const;
export const REPAIRED: readonly Ratio[] = [
  [6, 1],
  [32, 3],
  [27, 2],
  [24, 1],
];
export const SOUND_NAMES = {
  compare: "Selected pair: claim, original model, your model",
  claim: "Four notes claimed by the account",
  original: "Four notes from the original weights, ideal model",
  yours: "Four notes from your weights, ideal model",
  together: "Selected target and your model together",
} as const;
export type TensionSound = keyof typeof SOUND_NAMES;
export type TensionState = {
  weights: [Ratio, Ratio, Ratio, Ratio];
  selected: 1 | 2 | 3;
  root: 110 | 220;
  sound: TensionSound;
  passage: number;
  page: string;
};
export const PAGE_IDS = [
  "jan-245",
  "jan-246",
  "jan-247",
  "jan-248",
  "meibom-10",
  "meibom-11",
  "meibom-12",
  "meibom-13",
] as const;
export function tensionDefault(): TensionState {
  return {
    weights: [
      [6, 1],
      [8, 1],
      [9, 1],
      [12, 1],
    ],
    selected: 3,
    root: 220,
    sound: "compare",
    passage: 0,
    page: "jan-247",
  };
}
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
export function ratio(n: number, d: number): Ratio {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d) || d <= 0)
    throw new Error("An exact ratio needs finite integers and a positive denominator.");
  const g = gcd(Math.abs(n), d);
  return [n / g, d / g];
}
export function ratioText(r: Ratio): string {
  return r[1] === 1 ? String(r[0]) : `${r[0]}/${r[1]}`;
}
export function value(r: Ratio): number {
  return r[0] / r[1];
}
export function weight(text: string): Ratio {
  const s = text.trim();
  if (s.length > 22)
    throw new Error(
      "Use a weight from 6 to 30, with at most four decimal places or a denominator up to 10000.",
    );
  let n: number, d: number;
  if (/^\d{1,6}\/\d{1,5}$/.test(s)) {
    const parts = s.split("/");
    n = Number(parts[0]);
    d = Number(parts[1]);
  } else if (/^\d{1,2}(\.\d{1,4})?$/.test(s)) {
    d = 10 ** (s.split(".")[1]?.length ?? 0);
    n = Math.round(Number(s) * d);
  } else throw new Error("Enter a number such as 12, 13.5 or 32/3.");
  if (d < 1 || d > 10000 || n / d < 6 || n / d > 30)
    throw new Error("Keep the weight from 6 to 30; use a denominator from 1 to 10000.");
  return ratio(n, d);
}
export function tensionRows(s: TensionState) {
  return SOURCE_WEIGHTS.map((original, i) => {
    const claimed = ratio(original, 6),
      idealSquared = ratio(original, 6),
      chosen = at(s.weights, i),
      chosenSquared = ratio(chosen[0], chosen[1] * 6),
      repaired = at(REPAIRED, i);
    const claimHz = s.root * value(claimed),
      originalHz = s.root * Math.sqrt(value(idealSquared)),
      yoursHz = s.root * Math.sqrt(value(chosenSquared));
    return {
      index: i,
      name: at(NOTE_NAMES, i),
      original,
      claimed,
      idealSquared,
      chosen,
      chosenSquared,
      repaired,
      claimHz,
      originalHz,
      yoursHz,
      claimCents: 1200 * Math.log2(value(claimed)),
      originalCents: 600 * Math.log2(value(idealSquared)),
      yoursCents: 600 * Math.log2(value(chosenSquared)),
      errorCents:
        chosen[0] * repaired[1] === repaired[0] * chosen[1]
          ? 0
          : 600 * Math.log2(value(chosenSquared)) - 1200 * Math.log2(value(claimed)),
      exact: chosen[0] * repaired[1] === repaired[0] * chosen[1],
    };
  });
}
export function tensionQuery(s: TensionState): string {
  const p = new URLSearchParams({
    w: s.weights.slice(1).map(ratioText).join(","),
    n: String(s.selected),
    a: String(s.root),
    sound: s.sound,
    p: String(s.passage),
    page: s.page,
  });
  return `?${p}`;
}
export function tensionFromQuery(search: string): { state: TensionState; notice: string } {
  const p = new URLSearchParams(search),
    s = tensionDefault();
  const notice = "";
  try {
    if (p.has("w")) {
      const weights = p.get("w")?.split(",") ?? [];
      if (weights.length !== 3)
        throw new Error("A saved experiment needs exactly three adjustable weights.");
      s.weights = [[6, 1], weight(at(weights, 0)), weight(at(weights, 1)), weight(at(weights, 2))];
    }
    const n = Number(p.get("n"));
    if (n === 1 || n === 2 || n === 3) s.selected = n;
    if (p.get("a") === "110") s.root = 110;
    const sound = p.get("sound");
    if (sound && Object.hasOwn(SOUND_NAMES, sound)) s.sound = sound as TensionSound;
    const passage = Number(p.get("p"));
    if (Number.isInteger(passage) && passage >= 0 && passage < 8) s.passage = passage;
    const page = p.get("page");
    if (PAGE_IDS.some((x) => x === page) && page) s.page = page;
  } catch (e) {
    return {
      state: tensionDefault(),
      notice: `${e instanceof Error ? e.message : "Invalid saved settings."} Original weights restored.`,
    };
  }
  return { state: s, notice };
}
export function tensionJSON(s: TensionState): string {
  return `${JSON.stringify({ format: "pyknon-weighted-strings", version: 1, weights: s.weights.slice(1).map(ratioText), selected: s.selected, root: s.root, sound: s.sound, passage: s.passage, page: s.page }, null, 2)}\n`;
}
export function tensionImport(text: string): TensionState {
  if (text.length > 65536) throw new Error("Use a settings file below 64 KB.");
  const v: unknown = JSON.parse(text);
  if (!v || typeof v !== "object" || Array.isArray(v))
    throw new Error("Expected weighted-string settings.");
  const obj = v as Record<string, unknown>;
  const keys = ["format", "version", "weights", "selected", "root", "sound", "passage", "page"];
  if (
    Object.keys(obj).length !== keys.length ||
    keys.some((k) => !Object.hasOwn(obj, k)) ||
    obj.format !== "pyknon-weighted-strings" ||
    obj.version !== 1 ||
    !Array.isArray(obj.weights) ||
    obj.weights.length !== 3 ||
    !obj.weights.every((x) => typeof x === "string") ||
    ![1, 2, 3].includes(Number(obj.selected)) ||
    typeof obj.selected !== "number" ||
    (obj.root !== 110 && obj.root !== 220) ||
    typeof obj.sound !== "string" ||
    !Object.hasOwn(SOUND_NAMES, obj.sound) ||
    !Number.isInteger(obj.passage) ||
    Number(obj.passage) < 0 ||
    Number(obj.passage) > 7 ||
    typeof obj.page !== "string" ||
    !PAGE_IDS.some((x) => x === obj.page)
  )
    throw new Error("This file does not match the weighted-string settings format.");
  const parsed = tensionFromQuery(
    new URLSearchParams({
      w: obj.weights.join(","),
      n: String(obj.selected),
      a: String(obj.root),
      sound: obj.sound,
      p: String(obj.passage),
      page: obj.page,
    }).toString(),
  );
  if (parsed.notice) throw new Error(parsed.notice);
  return parsed.state;
}
export type TensionTone = Tone & { role: "claim" | "original" | "yours" };
export type TensionPlan = Omit<Plan, "tones"> & { tones: TensionTone[] };
export function tensionPlan(s: TensionState, sound: TensionSound = s.sound): TensionPlan {
  const rows = tensionRows(s),
    selected = at(rows, s.selected),
    tones: TensionTone[] = [];
  const tone = (
    start: number,
    hz: number,
    note: number,
    role: TensionTone["role"],
    duration = 0.75,
  ) => tones.push({ start, duration, hz, note, role, tuning: "ratios" });
  if (sound === "together") {
    tone(0.12, selected.claimHz, s.selected, "claim", 2.5);
    tone(0.12, selected.yoursHz, s.selected, "yours", 2.5);
  } else if (sound === "compare") {
    const roles: TensionTone["role"][] = ["claim", "original", "yours"];
    roles.forEach((role, group) => {
      tone(0.12 + group * 2.1, s.root, 0, role);
      tone(
        1.02 + group * 2.1,
        role === "claim"
          ? selected.claimHz
          : role === "original"
            ? selected.originalHz
            : selected.yoursHz,
        s.selected,
        role,
      );
    });
  } else
    rows.forEach((row, i) => {
      tone(
        0.12 + i * 0.9,
        sound === "claim" ? row.claimHz : sound === "original" ? row.originalHz : row.yoursHz,
        i,
        sound === "claim" ? "claim" : sound === "original" ? "original" : "yours",
      );
    });
  return { tones, duration: Math.max(...tones.map((t) => t.start + t.duration)) + 0.18 };
}
export function tensionCSV(s: TensionState): string {
  const rows = tensionRows(s);
  return `# Pyknon: Nicomachus chapter 6; modern ideal fixed-length uniform-string model\n# Baseline weight 6; reference ${s.root} Hz; no ancient unit in kilograms or absolute pitch inferred\nname,source_weight,claimed_frequency_ratio,original_squared_frequency_ratio,chosen_weight,chosen_squared_frequency_ratio,repair_weight,claimed_hz,original_ideal_hz,chosen_ideal_hz,chosen_minus_claim_cents,exact_repair\n${rows.map((r) => [r.name, r.original, ratioText(r.claimed), ratioText(r.idealSquared), ratioText(r.chosen), ratioText(r.chosenSquared), ratioText(r.repaired), r.claimHz.toFixed(9), r.originalHz.toFixed(9), r.yoursHz.toFixed(9), r.errorCents.toFixed(9), r.exact].join(",")).join("\n")}\n`;
}
