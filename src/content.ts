export const ARCHIVE =
  "https://archive.org/details/bim_early-english-books-1641-1700_-harmonicor_ptolomaeus-claudius_1682/page/n83/mode/2up";
export const WORDS = [
  {
    greek: "πυκνόν",
    roman: "pyknon",
    label: "close-packed",
    meaning:
      "Two adjacent intervals together occupy less of the fourth than the remaining interval. Here that means the lower three notes cluster together.",
    action:
      "Watch the bracket under the lower intervals. It appears in the enharmonic and chromatic divisions, and disappears in the diatonic.",
    href: "./sources/macran-182.jpg",
    source: "Aristoxenus, Harmonics I.24; Macran’s English translation (1902), p. 182",
  },
  {
    greek: "ἐναρμόνιον",
    roman: "enarmonion",
    label: "enharmonic",
    meaning:
      "One of the ancient genera: in this division, two small intervals lead to a much larger one. This differs from the modern use of ‘enharmonic’ for names such as C-sharp and D-flat.",
    action:
      "Choose Enharmonic, then hear the two inner notes. This division has two different small intervals, not two identical quarter-tones.",
    href: ARCHIVE,
    source: "Ptolemy, Harmonics I.13, Wallis p. 62",
  },
  {
    greek: "χρωματικόν",
    roman: "chrōmatikon",
    label: "chromatic",
    meaning:
      "Another genus. Here the middle interval widens while the lower one stays at 28/27. This is a four-note division, not the modern twelve-note chromatic scale.",
    action:
      "Choose Chromatic. The third note moves up; the other three remain fixed in Archytas’s scheme.",
    href: ARCHIVE,
    source: "Ptolemy, Harmonics I.13, Wallis p. 62",
  },
  {
    greek: "διατονικόν",
    roman: "diatonikon",
    label: "diatonic",
    meaning:
      "The third genus. In this scheme the lower interval is followed by two larger intervals, 8/7 and 9/8. These are unequal.",
    action: "Choose Diatonic. Compare the lengths of the two upper intervals on the ruler.",
    href: ARCHIVE,
    source: "Ptolemy, Harmonics I.13, Wallis p. 62",
  },
] as const;
export const SOURCE_NUMBERS = [
  ["1 · lower", 2016, 2016, 2016],
  ["2", 1944, 1944, 1944],
  ["3", 1890, 1792, 1701],
  ["4 · upper", 1512, 1512, 1512],
] as const;
