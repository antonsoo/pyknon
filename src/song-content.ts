export const MUSEUM = "https://samlinger.natmus.dk/as/asset/10006";
export const MONRO = "https://www.gutenberg.org/files/40288/40288-h/40288-h.htm#Page_145";
export const DANGOUR = "https://antigonejournal.com/2021/12/song-of-seikilos/";
export const VERSES = [
  {
    greek: "ὅσον ζῇς φαίνου",
    roman: "hoson zēis phainou",
    english: "As long as you live, shine.",
    first: 0,
  },
  {
    greek: "μηδὲν ὅλως σὺ λυποῦ",
    roman: "mēden holōs sy lypou",
    english: "Do not grieve at all.",
    first: 5,
  },
  {
    greek: "πρὸς ὀλίγον ἔστι τὸ ζῆν",
    roman: "pros oligon esti to zēn",
    english: "Living lasts a little while.",
    first: 12,
  },
  {
    greek: "τὸ τέλος ὁ χρόνος ἀπαιτεῖ",
    roman: "to telos ho chronos apaitei",
    english: "Time demands the end.",
    first: 20,
  },
] as const;
export const SONG_WORDS = [
  {
    greek: "ὅσον",
    gloss: "as long as",
    note: "A time expression introducing the clause ‘as long as you live’.",
  },
  {
    greek: "ζῇς",
    gloss: "you live",
    note: "From ζάω, to live: present indicative, second person singular. Compare the infinitive ζῆν in verse 3.",
  },
  {
    greek: "φαίνου",
    gloss: "shine; show yourself",
    note: "An imperative addressed to one person. Its first syllable, φαί, carries three rising pitches.",
  },
  {
    greek: "μηδὲν",
    gloss: "not at all",
    note: "Literally ‘nothing’, used here with the prohibition. The negative belongs with λυποῦ, ‘grieve’.",
  },
  {
    greek: "ὅλως",
    gloss: "at all; entirely",
    note: "An adverb strengthening the negative expression. The syllable λως carries two pitches.",
  },
  {
    greek: "σὺ",
    gloss: "you",
    note: "The singular pronoun explicitly addresses the listener. Greek can leave this subject implicit, so its presence is emphatic.",
  },
  {
    greek: "λυποῦ",
    gloss: "grieve; be distressed",
    note: "A present middle/passive imperative from λυπέω, used here with a negative. Two falling pitches share ποῦ, the syllable with a circumflex.",
  },
  {
    greek: "πρὸς",
    gloss: "for",
    note: "With ὀλίγον it forms a time expression: ‘for a little while’.",
  },
  {
    greek: "ὀλίγον",
    gloss: "a little",
    note: "Here, a short amount of time. The word crosses a physical line on the stone between λί and γον.",
  },
  {
    greek: "ἔστι",
    gloss: "is; exists",
    note: "From εἰμί, to be. The subject is τὸ ζῆν, ‘living’. The accented reading is editorial; the stone has capital letters.",
  },
  {
    greek: "τὸ",
    gloss: "the",
    note: "The neuter singular article turns the infinitive ζῆν, ‘to live’, into the noun-like expression ‘living’.",
  },
  {
    greek: "ζῆν",
    gloss: "to live; living",
    note: "The infinitive of ζάω. With τὸ it names the activity of living. Its circumflex syllable has a falling pair of pitches.",
  },
  {
    greek: "τὸ",
    gloss: "the",
    note: "Here the neuter article belongs to τέλος, the object of ‘demands’.",
  },
  {
    greek: "τέλος",
    gloss: "end; completion",
    note: "The object is placed before the subject: ‘the end, time demands’. English normally reverses that order.",
  },
  {
    greek: "ὁ",
    gloss: "the",
    note: "The masculine singular article belongs to χρόνος, the subject of the final clause.",
  },
  {
    greek: "χρόνος",
    gloss: "time",
    note: "The subject of ἀπαιτεῖ. Follow the word across two physical lines: χρό at the end of one, νος at the start of the next.",
  },
  {
    greek: "ἀπαιτεῖ",
    gloss: "demands; claims as due",
    note: "From ἀπαιτέω, present indicative, third person singular. The last syllable has three falling pitches. Its final sign is a reversed gamma, not a square bracket.",
  },
] as const;
export const OBSERVATIONS = [
  {
    syllable: 3,
    title: "Three notes on one syllable",
    text: "Choose φαί. The signs Κ Ι Ζ rise through three pitches while one vowel sound continues. A Greek letter above the text is a pitch sign, not another sung syllable.",
  },
  {
    syllable: 2,
    title: "Read a duration mark",
    text: "Compare σον and ζῇς in the photograph. The straight bar gives two short units; the hooked bar gives three. The dot is a separate rhythmic sign, not an extra unit.",
  },
  {
    syllable: 28,
    title: "Read the last sign",
    text: "In τεῖ, the final angular pitch sign meets an underlining mark. An early reader mistook the combination. The corrected reversed gamma makes the ending fall to the bottom of the melody’s octave.",
  },
] as const;
