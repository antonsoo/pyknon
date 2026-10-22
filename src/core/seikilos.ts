import type { Plan, Tone } from "./tetrachord";
import { at } from "./tetrachord";

export const PITCHES = {
  C: { sign: "Ϲ", name: "lunate sigma", semitones: 0, modern: "A" },
  Z: { sign: "Ζ", name: "zeta", semitones: 7, modern: "E" },
  K: { sign: "Κ", name: "kappa", semitones: 4, modern: "C♯" },
  I: { sign: "Ι", name: "iota", semitones: 5, modern: "D" },
  O: { sign: "Ο", name: "omicron", semitones: 2, modern: "B" },
  F: { sign: "Φ", name: "phi", semitones: -2, modern: "G" },
  X: { sign: "Χ", name: "chi", semitones: -3, modern: "F♯" },
  R: { sign: "reversed gamma", name: "reversed gamma", semitones: -5, modern: "E" },
} as const;
export type Pitch = keyof typeof PITCHES;
export type SongState = { syllable: number; root: 220 | 440; pace: 90 | 120 | 150 | 180 };
export type SongScope = "syllable" | "verse" | "song";
export const SONG_DEFAULT: SongState = { syllable: 0, root: 220, pace: 150 };
export type Syllable = {
  greek: string;
  roman: string;
  word: number;
  verse: number;
  stoneLine: number;
  // Pixel bounds in the unchanged 902 x 1280 museum photograph, including signs.
  box: readonly [number, number, number, number];
  notes: readonly (readonly [Pitch, 1 | 2 | 3])[];
};

// A normalized reading, not a diplomatic transcription. D'Angour (2021),
// modern stave transcription, checked against the museum's AS-10006 photograph.
// A group duration is divided among its pitches: do not apply it to every sign.
export const SYLLABLES: readonly Syllable[] = [
  {
    greek: "ὅ",
    roman: "ho",
    word: 0,
    verse: 0,
    stoneLine: 0,
    box: [75, 497, 70, 140],
    notes: [["C", 1]],
  },
  {
    greek: "σον",
    roman: "son",
    word: 0,
    verse: 0,
    stoneLine: 0,
    box: [145, 497, 175, 140],
    notes: [["Z", 2]],
  },
  {
    greek: "ζῇς",
    roman: "zēis",
    word: 1,
    verse: 0,
    stoneLine: 0,
    box: [308, 490, 170, 147],
    notes: [["Z", 3]],
  },
  {
    greek: "φαί",
    roman: "phai",
    word: 2,
    verse: 0,
    stoneLine: 0,
    box: [477, 492, 162, 145],
    notes: [
      ["K", 1],
      ["I", 1],
      ["Z", 1],
    ],
  },
  {
    greek: "νου",
    roman: "nou",
    word: 2,
    verse: 0,
    stoneLine: 0,
    box: [636, 488, 151, 149],
    notes: [["I", 3]],
  },
  {
    greek: "μη",
    roman: "mē",
    word: 3,
    verse: 1,
    stoneLine: 1,
    box: [76, 617, 117, 127],
    notes: [["K", 2]],
  },
  {
    greek: "δὲν",
    roman: "den",
    word: 3,
    verse: 1,
    stoneLine: 1,
    box: [193, 617, 142, 127],
    notes: [["I", 1]],
  },
  {
    greek: "ὅ",
    roman: "ho",
    word: 4,
    verse: 1,
    stoneLine: 1,
    box: [335, 614, 56, 130],
    notes: [["Z", 1]],
  },
  {
    greek: "λως",
    roman: "lōs",
    word: 4,
    verse: 1,
    stoneLine: 1,
    box: [391, 617, 212, 127],
    notes: [
      ["I", 1],
      ["K", 1],
    ],
  },
  {
    greek: "σὺ",
    roman: "sy",
    word: 5,
    verse: 1,
    stoneLine: 1,
    box: [603, 617, 135, 127],
    notes: [["O", 1]],
  },
  {
    greek: "λυ",
    roman: "ly",
    word: 6,
    verse: 1,
    stoneLine: 2,
    box: [81, 733, 132, 113],
    notes: [["C", 2]],
  },
  {
    greek: "ποῦ",
    roman: "pou",
    word: 6,
    verse: 1,
    stoneLine: 2,
    box: [213, 730, 182, 116],
    notes: [
      ["O", 1],
      ["F", 2],
    ],
  },
  {
    greek: "πρὸς",
    roman: "pros",
    word: 7,
    verse: 2,
    stoneLine: 2,
    box: [395, 730, 247, 116],
    notes: [["C", 1]],
  },
  {
    greek: "ὀ",
    roman: "o",
    word: 8,
    verse: 2,
    stoneLine: 2,
    box: [642, 730, 50, 116],
    notes: [["K", 1]],
  },
  {
    greek: "λί",
    roman: "li",
    word: 8,
    verse: 2,
    stoneLine: 2,
    box: [692, 730, 102, 116],
    notes: [["Z", 1]],
  },
  {
    greek: "γον",
    roman: "gon",
    word: 8,
    verse: 2,
    stoneLine: 3,
    box: [69, 821, 185, 129],
    notes: [["I", 1]],
  },
  {
    greek: "ἔσ",
    roman: "es",
    word: 9,
    verse: 2,
    stoneLine: 3,
    box: [251, 813, 99, 137],
    notes: [
      ["K", 1],
      ["I", 1],
    ],
  },
  {
    greek: "τι",
    roman: "ti",
    word: 9,
    verse: 2,
    stoneLine: 3,
    box: [350, 813, 105, 137],
    notes: [["K", 1]],
  },
  {
    greek: "τὸ",
    roman: "to",
    word: 10,
    verse: 2,
    stoneLine: 3,
    box: [455, 813, 142, 137],
    notes: [["C", 2]],
  },
  {
    greek: "ζῆν",
    roman: "zēn",
    word: 11,
    verse: 2,
    stoneLine: 3,
    box: [597, 813, 135, 137],
    notes: [
      ["O", 1],
      ["F", 2],
    ],
  },
  {
    greek: "τὸ",
    roman: "to",
    word: 12,
    verse: 3,
    stoneLine: 4,
    box: [76, 910, 126, 133],
    notes: [["C", 1]],
  },
  {
    greek: "τέ",
    roman: "te",
    word: 13,
    verse: 3,
    stoneLine: 4,
    box: [202, 910, 100, 133],
    notes: [["K", 1]],
  },
  {
    greek: "λος",
    roman: "los",
    word: 13,
    verse: 3,
    stoneLine: 4,
    box: [302, 910, 150, 133],
    notes: [["O", 1]],
  },
  {
    greek: "ὁ",
    roman: "ho",
    word: 14,
    verse: 3,
    stoneLine: 4,
    box: [452, 910, 55, 133],
    notes: [["I", 1]],
  },
  {
    greek: "χρό",
    roman: "chro",
    word: 15,
    verse: 3,
    stoneLine: 4,
    box: [507, 910, 155, 133],
    notes: [["Z", 1]],
  },
  {
    greek: "νος",
    roman: "nos",
    word: 15,
    verse: 3,
    stoneLine: 5,
    box: [80, 1011, 209, 135],
    notes: [["K", 1]],
  },
  {
    greek: "ἀ",
    roman: "a",
    word: 16,
    verse: 3,
    stoneLine: 5,
    box: [289, 1011, 55, 135],
    notes: [["C", 1]],
  },
  {
    greek: "παι",
    roman: "pai",
    word: 16,
    verse: 3,
    stoneLine: 5,
    box: [344, 1011, 140, 135],
    notes: [["C", 2]],
  },
  {
    greek: "τεῖ",
    roman: "tei",
    word: 16,
    verse: 3,
    stoneLine: 5,
    box: [482, 1013, 180, 133],
    notes: [
      ["C", 1],
      ["X", 1],
      ["R", 1],
    ],
  },
];

export function songState(search: string): SongState {
  const query = new URLSearchParams(search);
  const syllable = Number(query.get("s"));
  const root = Number(query.get("a"));
  const pace = Number(query.get("pace"));
  return {
    syllable:
      Number.isInteger(syllable) && syllable >= 0 && syllable < SYLLABLES.length
        ? syllable
        : SONG_DEFAULT.syllable,
    root: root === 220 || root === 440 ? root : SONG_DEFAULT.root,
    pace: pace === 90 || pace === 120 || pace === 150 || pace === 180 ? pace : SONG_DEFAULT.pace,
  };
}
export function songQuery(state: SongState): string {
  return `?s=${state.syllable}&a=${state.root}&pace=${state.pace}`;
}
export function pitchHz(pitch: Pitch, root: number): number {
  return root * 2 ** (PITCHES[pitch].semitones / 12);
}
export function modernPitch(pitch: Pitch, root: 220 | 440): string {
  const value = PITCHES[pitch];
  const octave = (root === 220 ? 3 : 4) + (value.semitones >= 3 ? 1 : 0);
  return `${value.modern}${octave}`;
}
export function selectedSyllables(state: SongState, scope: SongScope): number[] {
  const selected = at(SYLLABLES, state.syllable);
  return SYLLABLES.flatMap((s, i) =>
    scope === "song" || (scope === "verse" ? s.verse === selected.verse : i === state.syllable)
      ? [i]
      : [],
  );
}
export type SongEvent = {
  syllable: number;
  pitch: Pitch;
  units: number;
  unitStart: number;
  tone: Tone;
};
export function songEvents(state: SongState, scope: SongScope): SongEvent[] {
  const unit = 60 / state.pace;
  let elapsed = 0;
  return selectedSyllables(state, scope).flatMap((syllable) =>
    at(SYLLABLES, syllable).notes.map(([pitch, units]) => {
      const unitStart = elapsed;
      elapsed += units;
      return {
        syllable,
        pitch,
        units,
        unitStart,
        tone: {
          start: 0.12 + unitStart * unit,
          duration: units * unit - 0.025,
          hz: pitchHz(pitch, state.root),
          note: syllable,
          tuning: "keyboard",
        },
      };
    }),
  );
}
export function songPlan(state: SongState, scope: SongScope): Plan {
  const tones = songEvents(state, scope).map((e) => e.tone);
  const last = at(tones, tones.length - 1);
  return { tones, duration: last.start + last.duration + 0.2 };
}
