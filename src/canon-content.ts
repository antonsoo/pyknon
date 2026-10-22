export const CANON_ARCHIVE = "https://archive.org/details/euclidisoperaomn08eucl/page/174/mode/2up";
export const CANON_PAGES = [170, 171, 172, 173, 174, 175];
export const SOUND_LABELS = {
  compare: "Selected pair, one after another",
  beat: "Selected pair, together",
  walk: "Climb both routes to the selected step",
  control: "Control: two identical equal-step tones",
} as const;
export const CANON_PASSAGE = [
  {
    label: "The claim · XIV",
    greek: "Τὸ διὰ πασῶν ἔλαττον ἢ ἓξ τόνων.",
    latin: "diapason minus est quam sex tonorum.",
    english: "The octave is smaller than six tones.",
    note: "ἔλαττον / minus means ‘smaller’; ἢ / quam introduces the comparison. ‘Tone’ here has the 9:8 ratio established in XIII. A modern 200-cent whole tone changes that premise.",
  },
  {
    label: "The musical premises · XII and XIII",
    greek: "δέδεικται γὰρ τὸ μὲν διὰ πασῶν διπλάσιον, ὁ δὲ τόνος ἐπόγδοος·",
    latin:
      "nam demonstratum est, diapason duplum esse [prop. XII], tonum vero sesqueoctavum [prop. XIII].",
    english:
      "For it has been shown that the octave is double, while the tone is a whole and an eighth.",
    note: "δέδεικται / demonstratum est points back to earlier proofs. διπλάσιον / duplum names 2:1; ἐπόγδοος / sesqueoctavum names 9:8. Menge adds the proposition references in square brackets to the Latin.",
  },
  {
    label: "The numerical premise · IX",
    greek: "τὰ δὲ ἓξ ἐπόγδοα διαστήματα μείζονα διαστήματός [ἐστι] διπλασίου.",
    latin: "verum sex intervalla sesqueoctava intervallo duplo sunt maiora [prop. IX].",
    english: "But six intervals of a whole and an eighth are greater than a double interval.",
    note: "μείζονα / maiora means ‘greater’. The seven source integers supply six successive ratios, each 9:8. The Greek bracketed [ἐστι] is retained from this edition; it is not silently promoted to certain text.",
  },
  {
    label: "The conclusion · XIV",
    greek: "τὸ ἄρα διὰ πασῶν ἔλαττόν ἐστιν ἓξ τόνων.",
    latin: "ergo diapason minus est sex tonis.",
    english: "Therefore the octave is smaller than six tones.",
    note: "ἄρα / ergo carries the inference. Greek ἓξ τόνων and Latin sex tonis express the comparison. The numerical contradiction belongs to these ratios; it does not make modern equal temperament impossible.",
  },
] as const;
export const CANON_WORDS = [
  {
    greek: "διὰ πασῶν",
    roman: "dia pasōn",
    latin: "diapason",
    english: "octave",
    note: "Literally ‘through all’. Here it names the consonance with ratio 2:1. The phrase is quoted in its printed form, not translated as ‘all notes’ in the proof.",
  },
  {
    greek: "τόνος",
    roman: "tonos",
    latin: "tonus",
    english: "tone",
    note: "The tone in XIII is the interval left when a 4:3 fourth is removed from a 3:2 fifth: (3/2) ÷ (4/3) = 9/8. Removing a musical interval divides ratios; it does not subtract their numerical values.",
  },
  {
    greek: "ἐπόγδοος",
    roman: "epogdoos",
    latin: "sesqueoctavus",
    english: "a whole and an eighth",
    note: "A quantity contains the other plus one eighth of it: 1 + 1/8 = 9/8. Each selected source row after Α adds one eighth of the preceding integer.",
  },
  {
    greek: "διπλάσιον",
    roman: "diplasion",
    latin: "duplum",
    english: "double",
    note: "An octave doubles frequency in this modern realization. At step six the source's target is twice 262144, or 524288. Compare that with Η = 531441.",
  },
] as const;
