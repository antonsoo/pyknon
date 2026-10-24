export const TRIAL_ARCHIVE =
  "https://archive.org/details/bim_early-english-books-1641-1700_-harmonicor_ptolomaeus-claudius_1682/page/n58/mode/2up";
export const TRIAL_PAGES = [33, 34, 35, 36, 37, 38] as const;
export const TRIAL_PASSAGES = [
  {
    label: "First, halve the whole",
    page: 37,
    greek: "Πρῶτον μὲν ἐπὶ τὴν γινομένην τοῦ ὅλου μήκους διχοτομίαν",
    latin: "Primo quidem, ad factam totius longitudinis bisectionem",
    english: "First, at the bisection of the whole length",
    note: "An excerpt from the construction instruction. διχοτομίαν / bisectionem means division into two. τοῦ ὅλου μήκους / totius longitudinis is ‘of the whole length’: the genitive names what is being divided. The midpoint is Κ in Greek and K in Wallis’s Latin diagram.",
  },
  {
    label: "Then halve the half",
    page: 37,
    greek: "καὶ ἐπὶ τὴν τῆς ἡμισείας διχοτομίαν",
    latin: "deinde, ad semissis bisectionem",
    english: "and at the bisection of the half",
    note: "Another construction excerpt. The half from Κ to Η is divided at Λ. The two new parts are quarters of the whole string. ἡμισείας / semissis means ‘of the half’. These are the source’s second comparison, rather than a second comparison of the original halves.",
  },
  {
    label: "Equal in pitch?",
    page: 37,
    greek: "τὸ ΕΚ τῆς χορδῆς μέρος, ἰσότονον εὑρίσκηται τῷ ΚΗ· καὶ ἔτι τὸ ΚΛ, τῷ ΛΗ",
    latin: "si chordae pars EK comperiatur ipsi KG aequitona; & KL, ipsi LG",
    english: "if the string’s part ΕΚ is found equal in pitch to ΚΗ, and also ΚΛ to ΛΗ",
    note: "Selected condition, not a complete sentence. ἰσότονον / aequitona means ‘equal in pitch’; it does not mean ‘equal in physical tension’. The print uses barred lowercase segment letters, normalized here to capitals. Greek Η (eta) corresponds to Wallis’s Latin G, and Λ to L. The text continues by treating the string’s constitution as unvarying; the modern counterexample below explores the limit of that inference.",
  },
  {
    label: "When the trial fails",
    page: 37,
    greek: "Ἐὰν δὲ μή· μεταφέρωμεν τὴν δοκιμασίαν ἐπ’ ἄλλο μέρος, ἤτοι χορδίῳ ἄλλῳ",
    latin:
      "sin minus; transferendam esse probationem ad aliam chordae partem, aut etiam ad chordam aliam",
    english: "But if not, let us transfer the trial to another part, or to another string",
    note: "An excerpt of the instruction following failure. ἐὰν δὲ μή / sin minus means ‘but if not’. μεταφέρωμεν is a ‘let us’ subjunctive; δοκιμασίαν / probationem is the trial or examination. Wallis casts the instruction as ‘the trial is to be transferred’. The instruction gives a concrete response to a failed instrument check.",
  },
  {
    label: "What must stay comparable",
    page: 38,
    greek: "τὸ ἐν τοῖς ὁμοίοις καὶ ἀναλόγοις καὶ ἰσομήκεσι καὶ μίαν ἔχουσι τάσιν, ὁμότονον",
    latin:
      "ut in similibus, proportionalibus, longitudine aequalibus, eandemque tensionem habentibus, sit tonus correspondens",
    english: "sameness of pitch in like, corresponding, equal-length parts under one tension",
    note: "The Greek clause crosses from p. 37 to p. 38. ἰσομήκεσι / longitudine aequalibus concerns equal lengths. μίαν ἔχουσι τάσιν / eandem tensionem habentibus concerns a single tension. ὁμότονον concerns pitch. Those are three different conditions. Our model fixes length and tension and varies mass per unit length.",
  },
  {
    label: "An instrument for testing",
    page: 35,
    greek: "Κανὼν ἁρμονικός",
    latin: "Canon Harmonicus",
    english: "Harmonic canon",
    note: "The heading of the instrument diagram on p. 35. κανών can mean a straight rod, rule or measuring instrument. The diagram is part of Wallis’s 1682 edition, not an ancient blueprint. His long note on p. 36 discusses and changes the drawn bridge surfaces; the complete pages retain that editorial evidence.",
  },
] as const;
export const TRIAL_QUESTIONS = [
  {
    question: "The two halves agree. What follows?",
    answers: [
      "The string must be uniform everywhere.",
      "These two measured pitches agree; try the quarters too.",
      "Both halves have the same mass.",
    ],
    correct: 1,
    why: "A mirrored mass profile gives the halves the same spectrum even when neither half is uniform.",
  },
  {
    question: "What does ἰσότονον mean in this trial?",
    answers: ["Equal in pitch.", "Equal in tension.", "Equal in length."],
    correct: 0,
    why: "Ptolemy names pitch, length and tension separately. Agreement in one quantity does not establish the others.",
  },
  {
    question:
      "The repeating profile passes both ancient comparisons. What does the eighths test show?",
    answers: [
      "Ptolemy described an eighths test here.",
      "The generated sound is an ancient recording.",
      "These two comparisons can miss a smaller pattern of variation.",
    ],
    correct: 2,
    why: "Eighths are our additional diagnostic. This chosen repeating profile is a counterexample to proving uniformity from only these two equal-pitch comparisons.",
  },
] as const;
