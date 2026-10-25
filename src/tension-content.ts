export const TENSION_PASSAGES = [
  {
    title: "Four strings, four conditions",
    greek: "ἀπαρτήσας τέσσαρας χορδὰς ὁμοΰλους καὶ ἰσοκώλους, ἰσοπαχεῖς τε καὶ ἰσοστρόφους",
    latin:
      "adpendens quatuor chordas ejusdem materiae existentes, tum aeque longas, & aeque crassas, atque aeque graves",
    english:
      "Having suspended four strings of the same material and equal length, equal in thickness and equally twisted…",
    note: "ἀπαρτήσας is an aorist active participle: “having suspended”. The four accusative plural adjectives describe χορδάς. ἰσοστρόφους says “equally twisted”; Meibom’s aeque graves says “equally heavy”. Keep that translation difference visible. The ideal model assumes equal mass per vibrating length after loading.",
    greekPage: "jan-247",
    latinPage: "meibom-11",
  },
  {
    title: "Length is deliberately held equal",
    greek: "τὰ δὲ μήκη τῶν χορδῶν μηχανησάμενος ἐκ παντὸς ἰσαίτατα",
    latin: "Cumque ita chordarum longitudines omnino aequales effecisset",
    english: "And having contrived to make the lengths of the strings entirely equal…",
    note: "μήκη is the accusative plural of μῆκος, “length”; μηχανησάμενος is an aorist middle participle, “having arranged/contrived”. The repeated length condition matters: the comparison changes load, not vibrating length. Latin effecisset is pluperfect subjunctive after cum.",
    greekPage: "jan-247",
    latinPage: "meibom-11",
  },
  {
    title: "The largest and smallest load",
    greek:
      "τὴν μὲν γὰρ ὑπὸ τοῦ μεγίστου ἐξαρτήματος τεινομένην πρὸς τὴν ὑπὸ τοῦ μικροτάτου διὰ πασῶν φθεγγομένην κατελάμβανεν.",
    latin: "Namque a maximo pondere tensam, ad eam quae a minimo, dia pason sonantem deprehendit.",
    english:
      "For he found the string stretched by the greatest hanging load sounding an octave against the one stretched by the smallest.",
    note: "τεινομένην, a present passive participle of τείνω, describes the string being stretched. The repeated feminine article τήν supplies “string”. πρὸς marks comparison, not a direction of motion. The Latin sentence crosses printed pp.11–12; both complete pages are retained.",
    greekPage: "jan-247",
    latinPage: "meibom-12",
  },
  {
    title: "Twelve and six, called double",
    greek:
      "ἦν δὲ ἡ μὲν δώδεκά τινων ὁλκῶν, ἡ δὲ ἕξ. ἐν διπλασίῳ δὴ λόγῳ ἀπέφαινε τὴν διὰ πασῶν, ὅπερ καὶ αὐτὰ τὰ βάρη ὑπέφαινε.",
    latin:
      "Erat autem illa duodecim quarundam librarum; haec vero sex. Atque ita in dupla ratione constituebat dia pason consonantiam, quam & ipsae gravitates ostendebant.",
    english:
      "One was of twelve unspecified weight units, the other six. So he declared the octave to be in a double ratio, which the weights themselves also indicated.",
    note: "μέν … δέ balances the two quantities. λόγῳ is dative singular of λόγος, here “ratio”. ὁλκῶν specifies units of weight; τινων leaves them unspecified. Meibom chooses librarum. This lesson uses relative load units, without identifying an ancient pound or converting it into kilograms.",
    greekPage: "jan-247",
    latinPage: "meibom-12",
  },
  {
    title: "Twelve against eight, a fifth",
    greek:
      "τὴν δ’ αὖ μεγίστην πρὸς τὴν παρὰ τὴν μικροτάτην (οὖσαν ὀκτὼ ὁλκῶν) διὰ πέντε συμφωνοῦσαν, ἔνθεν ταύτην ἀπέφαινεν ἐν ἡμιολίῳ λόγῳ",
    latin:
      "Rursus maximam ad juxta minimam, quae octo librarum existebat, dia pente consonantem invenit. unde hanc in ratione sesquialtera constituit",
    english:
      "Again, the greatest against the one next to the smallest (of eight weight units) sounded a fifth; from this he assigned it the ratio of one and a half.",
    note: "ἡμιόλιος and Latin sesquialter describe 3:2: one whole and its half. At fixed length and linear density, a 3:2 load ratio produces √(3/2) as a frequency ratio. The ideal interval in cents is half the claimed fifth.",
    greekPage: "jan-247",
    latinPage: "meibom-12",
  },
  {
    title: "Nine against eight, a tone",
    greek:
      "τὸ ἄρα μεταξὺ τῆς διὰ πέντε καὶ τῆς διὰ τεσσάρων τουτέστιν ᾧ ὑπερέχει ἡ διὰ πέντε τῆς διὰ τεσσάρων, ἐβεβαιοῦτο ἐν ἐπογδόῳ λόγῳ ὑπάρχειν, ἐν ᾧπερ τὰ ἐννέα πρὸς τὰ ὀκτώ.",
    latin:
      "Quod itaque est inter dia pente & dia tessaron, hoc est, quo dia pente consonantia superat dia tessaron, confirmatum est in superoctava esse ratione, in qua novem ad octo.",
    english:
      "Thus the difference between the fifth and the fourth—that by which the fifth exceeds the fourth—was established as the ratio of one and an eighth, in which nine stands to eight.",
    note: "ἐπόγδοος and superoctavus mean a whole plus its eighth, 9:8. The interval argument is numerical: (3/2) ÷ (4/3) = 9/8. That arithmetic remains valid even though the stated string loads do not produce the claimed frequency ratios under the ideal law.",
    greekPage: "jan-247",
    latinPage: "meibom-12",
  },
  {
    title: "The story says there was one attachment",
    greek: "τὴν μὲν τῶν χορδῶν κοινὴν ἀπόδεσιν τὴν ἐκ τοῦ διαγωνίου πασσάλου",
    latin: "communem quidem chordarum adpensionem, quae ex palo erat ab angulo ad angulum infixo",
    english: "The common attachment of the strings from the diagonal peg…",
    note: "κοινήν means “common/shared”; πασσάλου is genitive, “of the peg”. This later phrase recalls the single peg introduced on p.246. Our four separate columns compare equal lengths; they do not reconstruct the ancient fixture. The modern ideal model treats loaded string tension as proportional to the hanging weight and uses fixed vibrating endpoints.",
    greekPage: "jan-248",
    latinPage: "meibom-13",
  },
  {
    title: "Four named pitches, not a complete scale",
    greek:
      "ὑπάτην μὲν τὸν τοῦ ἓξ ἀριθμοῦ κοινωνοῦντα φθόγγον, μέσην δὲ τὸν τοῦ ὀκτὼ … παραμέσην δὲ τὸν τοῦ ἐννέα … νήτην δὲ τὸν τοῦ δώδεκα",
    latin:
      "hypaten, numeri senarii participem sonum: mesen, octonarii … paramesen, novenarii participem … neten denique, duodenarii",
    english:
      "Hypatē, the note associated with six; mesē, with eight … paramesē, with nine … and nētē, with twelve.",
    note: "φθόγγον is the object “note/sound”. The names attach to the four source numbers. Ellipses here omit descriptions of their intervals; the page then says that the intervening diatonic notes were supplied. Our four tones are this numerical skeleton, not a recovered tune or the full eight-note system.",
    greekPage: "jan-248",
    latinPage: "meibom-13",
  },
] as const;
export const TENSION_WORDS = [
  [
    "χορδάς",
    "chordās",
    "strings",
    "Accusative plural of χορδή; the object of “having suspended”. Latin chordas.",
  ],
  [
    "ἰσοκώλους",
    "isokōlous",
    "equal in length",
    "ἰσο- (equal) + κῶλον (limb/member); one of the four adjectives agreeing with strings.",
  ],
  [
    "ἰσοπαχεῖς",
    "isopacheis",
    "equal in thickness",
    "Jan’s main text. His apparatus records ἰσοπαγεῖς in M and B; the complete scan preserves the variant.",
  ],
  [
    "ἰσοστρόφους",
    "isostrophous",
    "equally twisted",
    "ἰσο- + στρέφω (turn/twist). Compare the printed Latin aeque graves, “equally heavy”.",
  ],
  [
    "μήκη",
    "mēkē",
    "lengths",
    "Accusative plural of μῆκος. The explicit repeated condition is crucial to the physical comparison.",
  ],
  [
    "τεινομένην",
    "teinomenēn",
    "being stretched",
    "Present passive participle, feminine accusative, agreeing with the understood string. Latin tensam.",
  ],
  [
    "λόγῳ",
    "logōi",
    "in a ratio",
    "Dative of λόγος; in this context a ratio, rather than speech or an argument. Latin ratione.",
  ],
  [
    "ἡμιολίῳ",
    "hēmioliōi",
    "in a 3:2 ratio",
    "A whole plus its half. Latin sesquialtera, an adjective agreeing with ratione.",
  ],
  [
    "ἐπιτρίτῳ",
    "epitritōi",
    "in a 4:3 ratio",
    "A whole plus its third. Latin supertertia; the adjacent source also uses superquarta when describing 9 against 12.",
  ],
  [
    "ἐπογδόῳ",
    "epogdoōi",
    "in a 9:8 ratio",
    "A whole plus its eighth. Latin superoctava. The source’s musical tone is 9:8.",
  ],
] as const;
export const TENSION_LIMITS =
  "Modern ideal comparison: uniform flexible strings, fixed vibrating length and equal mass per length after loading, constant tension proportional to load, small transverse vibration and fixed endpoints. String mass compared with load, elastic stretching, changing density, friction, stiffness, support motion and damping are omitted. The diagram is a comparison, not a fixture reconstruction; the sound is synthetic sine fundamentals, not hammer timbre or an ancient performance.";
