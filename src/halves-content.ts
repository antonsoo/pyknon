export interface HalfPassage {
  title: string;
  greekPage: number;
  latinPage: number;
  greek: string;
  latin: string;
  english: string;
  note: string;
  words: { greek: string; latin: string; meaning: string; job: string }[];
}
export const HALF_PASSAGES: HalfPassage[] = [
  {
    title: "Not any middle: a proportional middle",
    greekPage: 220,
    latinPage: 221,
    greek:
      "Ἐπιμορίου διαστήματος οὐδεὶς μέσος, οὔτε εἷς οὔτε πλείους, ἀνάλογον ἐμπεσεῖται ἀριθμός.",
    latin:
      "Superparticularis intervalli nullus medius numerus neque unus proportionaliter incidet neque plures.",
    english:
      "In a superparticular interval no middle number, neither one nor more, will fall proportionally.",
    note: "III is an assertion about proportional means in a numerical ratio. “Number” belongs to the argument’s whole-unit arithmetic. It does not mean that there are no ordinary integers between scaled endpoints. The modern bench illustrates one middle; the source also rules out more proportional means under this premise.",
    words: [
      {
        greek: "ἐπιμορίου",
        latin: "superparticularis",
        meaning: "of a whole-plus-one-part ratio",
        job: "In least terms the larger number exceeds the smaller by one: (n+1):n.",
      },
      {
        greek: "μέσος … ἀριθμός",
        latin: "medius numerus",
        meaning: "a middle number",
        job: "The argument counts whole units. It is not classifying arbitrary real-valued oscillator settings.",
      },
      {
        greek: "ἀνάλογον",
        latin: "proportionaliter",
        meaning: "in proportion",
        job: "For one middle M between A and B, M:A must equal B:M. Being halfway by addition is a different condition.",
      },
    ],
  },
  {
    title: "Begin with the least terms",
    greekPage: 220,
    latinPage: 221,
    greek:
      "ἐλάχιστοι δὲ ἐν τῷ αὐτῷ λόγῳ τοῖς Β, Γ ἔστωσαν οἱ ΔΖ, Θ. οὗτοι οὖν ὑπὸ μονάδος μόνης μετροῦνται κοινοῦ μέτρου.",
    latin:
      "minimi autem in eadem ratione ac Β, Γ sint ΔΖ, Θ. hos igitur unitas sola communis mensura metitur.",
    english:
      "Let ΔΖ and Θ be the least numbers in the same ratio as Β and Γ. These, then, have only the unit as their common measure.",
    note: "Least terms remove a common integer factor. The printed figure supplies 4 and 3 for the least pair, with 12 and 9 for a larger pair. Our tone example instead uses 9:8. The model’s A, M, B are new labels; the page retains the original letters and apparatus.",
    words: [
      {
        greek: "ἐλάχιστοι",
        latin: "minimi",
        meaning: "least; smallest",
        job: "Read the ratio in its lowest whole-number terms.",
      },
      {
        greek: "τῷ αὐτῷ λόγῳ",
        latin: "in eadem ratione",
        meaning: "in the same ratio",
        job: "Multiplying both endpoints by the same scale keeps their ratio.",
      },
      {
        greek: "μονάδος μόνης",
        latin: "unitas sola",
        meaning: "of the unit alone",
        job: "The least pair has no larger common integer measure.",
      },
    ],
  },
  {
    title: "A unit cannot contain another whole unit",
    greekPage: 220,
    latinPage: 221,
    greek:
      "μονὰς ἄρα ὁ ΔΗ· οὐκ ἄρα ἐμπεσεῖται εἰς τοὺς ΔΖ, Θ μέσος οὐδείς. ἔσται γὰρ ὁ ἐμπίπτων τοῦ ΔΖ ἐλάττων, τοῦ δὲ Θ μείζων, ὥστε τὴν μονάδα διαιρεῖσθαι, ὅπερ ἀδύνατον.",
    latin:
      "unitas igitur ΔΗ; itaque incidet in ΔΖ, Θ nullus numerus medius. nam erit is, qui incidit, minor quam ΔΖ, maior vero quam Θ, ita ut unitas dividatur, quod fieri non potest.",
    english:
      "Therefore ΔΗ is a unit; so no middle number falls between ΔΖ and Θ. It would be smaller than ΔΖ and larger than Θ, so that the unit would be divided, which is impossible.",
    note: "This is the step for the least whole-number pair. It is not a claim that a continuous drawn segment cannot be cut. The following scaling step carries the proportional-mean conclusion to pairs in the same ratio. The modern square argument below is a separate explanation of the bisecting case.",
    words: [
      {
        greek: "μονάς",
        latin: "unitas",
        meaning: "a unit",
        job: "The indivisible counting unit of this numerical argument.",
      },
      {
        greek: "ἐλάττων … μείζων",
        latin: "minor … maior",
        meaning: "smaller … larger",
        job: "The proposed integer would have to lie strictly between consecutive whole numbers.",
      },
      {
        greek: "ἀδύνατον",
        latin: "quod fieri non potest",
        meaning: "impossible",
        job: "The impossibility is inside the stated whole-number framework.",
      },
    ],
  },
  {
    title: "The same ratio carries the same means",
    greekPage: 220,
    latinPage: 221,
    greek:
      "ὅσοι δὲ εἰς τοὺς ἐλαχίστους μέσοι ἀνάλογον ἐμπίπτουσι, τοσοῦτοι καὶ εἰς τοὺς τὸν αὐτὸν λόγον ἔχοντας ἀνάλογον ἐμπεσοῦνται.",
    latin:
      "quot autem in minimos medii proportionaliter incidunt, totidem etiam in eos, qui eandem rationem habent, proportionaliter incident.",
    english:
      "As many proportional means fall between the least numbers, so many will also fall between numbers having the same ratio.",
    note: "This is a statement about numbers in continued proportion. It is not counting every ordinary integer between the endpoints. Scaling 16 and 18 to 32 and 36 creates more integer candidates, but does not make 34 a proportional mean.",
    words: [
      {
        greek: "ὅσοι … τοσοῦτοι",
        latin: "quot … totidem",
        meaning: "as many … so many",
        job: "The lemma transfers the number of proportional means, not the number of all integers in the gap.",
      },
      {
        greek: "τὸν αὐτὸν λόγον",
        latin: "eandem rationem",
        meaning: "the same ratio",
        job: "Doubling every number preserves the two interval ratios and their inequality.",
      },
    ],
  },
  {
    title: "The musical ratio premises",
    greekPage: 230,
    latinPage: 231,
    greek:
      "Τὸ διὰ πασῶν διάστημά ἐστι διπλάσιον. … τὸ μὲν ἄρα διὰ πέντε, ἐπειδὴ μεῖζόν ἐστιν, ἡμιόλιον ἂν εἴη, τὸ δὲ διὰ τεσσάρων ἐπίτριτον.",
    latin:
      "Diapason intervallum duplum est. … ergo diapente, quia est maius, sesquialterum est, diatessaron vero sesquetertium.",
    english:
      "The octave interval is double. … Therefore the fifth, since it is larger, would be in a ratio of one and a half, and the fourth in a whole-and-a-third ratio.",
    note: "Two selected excerpts from XII; the visible ellipsis omits the intervening proof. The octave is 2:1, fifth 3:2 and fourth 4:3 in this account. Our frequency realization is modern. The source figure’s lines are numerical witnesses, not measurements of performed ancient hertz.",
    words: [
      {
        greek: "διπλάσιον",
        latin: "duplum",
        meaning: "double",
        job: "The octave premise supplies 2:1.",
      },
      {
        greek: "ἡμιόλιον",
        latin: "sesquialterum",
        meaning: "a whole and a half",
        job: "The fifth supplies 3:2.",
      },
      {
        greek: "ἐπίτριτον",
        latin: "sesquetertium",
        meaning: "a whole and a third",
        job: "The fourth supplies 4:3.",
      },
    ],
  },
  {
    title: "The tone is a whole and an eighth",
    greekPage: 232,
    latinPage: 233,
    greek: "Λοιπὸν δὴ περὶ τοῦ τονιαίου διαστήματος διελθεῖν, ὅτι ἐστὶν ἐπόγδοον.",
    latin: "Iam restat, ut de toniaeo intervallo disseramus, esse sesqueoctavum.",
    english: "It remains, then, to discuss the tone interval: that it is a whole and an eighth.",
    note: "The selected enunciation of XIII. The tone left by removing a fourth from a fifth has ratio (3/2)/(4/3) = 9/8. Musical removal divides these ratios; it does not subtract their numerical values. The full page retains the proof and its references.",
    words: [
      {
        greek: "ἐπόγδοον",
        latin: "sesqueoctavum",
        meaning: "a whole and an eighth",
        job: "The resulting ratio is 9:8.",
      },
      {
        greek: "διάστημα",
        latin: "intervallum",
        meaning: "interval",
        job: "Here compare multiplicative pitch ratios rather than equal increments in hertz.",
      },
    ],
  },
  {
    title: "Why the source says the tone will not divide equally",
    greekPage: 234,
    latinPage: 235,
    greek:
      "Ὁ τόνος οὐ διαιρεθήσεται εἰς δύο ἴσα οὔτε εἰς πλείω. ἐδείχθη γὰρ ὢν ἐπιμόριος· ἐπιμορίου δὲ διαστήματος μέσοι οὔτε πλείους οὔτε εἷς ἀνάλογον ἐμπίπτουσιν. οὐκ ἄρα διαιρεθήσεται ὁ τόνος εἰς ἴσα.",
    latin:
      "Tonus non dividetur in duas partes aequales neque in plures. nam demonstratum est, eum esse superparticularem. verum superparticularis intervalli medii numeri neque plures neque unus proportionaliter incidunt [prop. III]. ergo tonus in partes aequales non dividetur.",
    english:
      "The tone will not be divided into two equal parts, nor into more. For it has been shown to be superparticular; and in a superparticular interval neither several middle numbers nor one falls proportionally. Therefore the tone will not be divided into equal parts.",
    note: "XVI carries III’s numerical premise into the musical claim. Menge’s Latin makes “numbers” explicit and adds the reference [prop. III]. The model’s continuous geometric split is a different domain, realized with finite oscillator settings; it is not a counterexample made of proportional whole numbers. The Greek text’s authorship and history are not settled by this workshop.",
    words: [
      {
        greek: "οὐ διαιρεθήσεται",
        latin: "non dividetur",
        meaning: "will not be divided",
        job: "Read the claim together with its numerical premise, not as a prohibition on modern sound synthesis.",
      },
      {
        greek: "εἰς δύο ἴσα",
        latin: "in duas partes aequales",
        meaning: "into two equal parts",
        job: "For one middle, equality means the same ratio on both sides.",
      },
      {
        greek: "οὐκ ἄρα",
        latin: "ergo … non",
        meaning: "therefore not",
        job: "The conclusion depends on the superparticular premise and the proportional-number result.",
      },
    ],
  },
];
export const HALF_LIMITS =
  "This workshop illustrates bisection. The source also asserts a result for more proportional means. Numerical weights are mapped to modern frequencies; no ancient absolute pitch, instrument, performance or hearing threshold is reconstructed. Equal string-length increments use an ideal uniform string with wave speed held fixed. Drawings, audio and displayed hertz approximate continuous values; exact squared quantities decide the comparison.";
