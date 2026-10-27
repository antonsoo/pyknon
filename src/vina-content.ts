export const VINA_BEL = "https://bolprocessor.org/wp-content/uploads/Bharata-paper.pdf";
export const VINA_SOURCE = "https://archive.org/details/dli.ministry.04243";
export const VINA_LIMITS =
  "The source gives note names, counts and matching relations. This workshop follows Bernard Bel's algebraic reading and adds exact modern 4:3 fourths and 3:2 fifths. The remaining offset is a chosen parameter. Cents, 110/220 Hz references and sine tones are modern; no ancient melody, vīṇā shape, timbre or twenty-two-pitch frequency table is reconstructed. The layered Nāṭyaśāstra is attributed to Bharata; this is not a securely dated laboratory report by one identified experimenter.";
export const VINA_NORMALIZATION =
  "Sanskrit is transcribed from Grosset's 1888 romanized edition, not from a later English translation. Old ç is normalized to ś; diacritics, spacing, joined line breaks and punctuation are normalized. Internal omissions use … . The editor's square brackets remain marked. The printed target-list order in the second lowering is retained and discussed. The numerical model pairs notes by pitch under the stated modern interpretation.";
export const VINA_READINGS = [
  {
    title: "Two grāmas, twenty-two counts",
    page: "28",
    language: "sa-Latn",
    original: "atha grāmau. ṣaḍjagrāmo madhyamagrāmaś ceti. tatra vā dvāviṃśatiśrutayaḥ.",
    english:
      "Now the two grāmas: the ṣaḍja-grāma and the madhyama-grāma. There are twenty-two śrutis in them.",
    note: "Grāmau is a dual: two pitch systems. The passage does not provide a frequency table in hertz or assign 1200/22 cents to each śruti. Grosset's verse numbers differ from later editions; this room cites his actual pages.",
  },
  {
    title: "Lower the fifth note",
    page: "28",
    language: "sa-Latn",
    original:
      "madhyamagrāme tu śrutyapakṛṣṭaḥ pañcamaḥ kāryaḥ. pañcamaśrutyutkarṣād apakarṣād vā yad antaraṃ mārdavād āyatatvād vā tat pramāṇaśrutiḥ.",
    english:
      "In the madhyama-grāma, Pa should be lowered by a śruti. The interval involved in raising or lowering Pa, with its slackening or tightening, is the reference śruti.",
    note: "Pañcama names Pa, the fifth note. This defines a relation between the two systems; it does not state the ratio 81/80. The dashed Pa marker in the workshop is the lowered Pa of the other grāma, not an eighth principal note.",
  },
  {
    title: "Prepare two instruments",
    page: "28",
    language: "sa-Latn",
    original: "[dve vīṇe … ṣaḍjagrāme kṛte kārye.",
    english: "Prepare two vīṇās in the ṣaḍja-grāma.",
    note: "The ellipsis omits Grosset's long compound about comparable dimensions, strings, playing/adjustment and daṇḍa. Read the complete printed clause. Vīṇe is a dual form; the name does not identify the shape of a modern fretted vīṇā. The opening square bracket is the 1888 editor's. The model treats the subsequent retuning as a shift of the whole pitch system, following Bel; the drawn rails are comparison rulers, not physical instruments.",
  },
  {
    title: "Two names are not a pairing rule",
    page: "29",
    language: "sa-Latn",
    original:
      "punar api tadvad evāpakarṣād gāndhāraniṣādavantāv itarasyāṃ dhaivatarṣabhau praviśato dviśrutyadhikatvāt.",
    english:
      "With a further lowering, the Ga and Ni notes of one enter Dha and Ri on the other, through the two-śruti difference.",
    note: "The printed target order is Dha–Ri. The Sanskrit does not add our English word 'respectively'. Our model pairs Ga→Ri and Ni→Dha, following Bel's pitch interpretation. Pairing both lists in their written order instead fails in this model. That conditional comparison does not prove the text corrupt: a list of two targets is not necessarily an instruction to pair them in order. Grosset's French preserves the order; his broader doubt about the demonstration appears in note 36.",
  },
  {
    title: "The next two notes",
    page: "29",
    language: "sa-Latn",
    original:
      "punas tadvad evāpakarṣād dhaivatarṣabhāv itarasyāṃ pañcamaṣaḍjau praviśataḥ śrutyadhikatvāt.",
    english:
      "On another lowering, Dha and Ri of one enter Pa and Sa of the other, through the śruti difference.",
    note: "The third-stage model gives Ri→Sa and Dha→Pa. Grosset's main prose here says śruti without printing tri-, 'three'; his following verses explicitly assign three to Ri and Dha, and his apparatus retains variants. The display's three-count label is tied to those verses and the stated interpretation.",
  },
  {
    title: "Three matches at four counts",
    page: "29",
    language: "sa-Latn",
    original:
      "tadvat punarapakṛṣṭāyāṃ tasyāṃ pañcamamadhyamaṣaḍjā itarasyāṃ madhyamagāndhāraniṣādavantaḥ pravekṣyanti catuḥśrutyadhikatvāt.]",
    english:
      "When it is lowered again, Pa, Ma and Sa will enter Ma, Ga and Ni on the other, through the four-śruti difference.",
    note: "The order Pa→Ma, Ma→Ga, Sa→Ni is retained. In the last pair, moving Sa meets Ni in the lower octave: their absolute sounding frequencies agree only when that octave is respected. The closing bracket belongs to Grosset's edition, not a missing word supplied by this workshop.",
  },
  {
    title: "Which side of a note owns the count?",
    page: "29",
    language: "sa-Latn",
    original:
      "ṣaḍjaś catuḥśrutir jñeya ṛṣabhas triśrutis tathā | dviśrutiś caiva gāndhāro madhyamaś ca catuḥśrutiḥ || 26 || catuḥśrutiḥ pañcamaḥ syād dhaivatas triśrutis tathā | niṣādo dviśrutiś caiva ṣaḍjagrāme bhavanti hi || 27 ||",
    english:
      "In the ṣaḍja-grāma, Sa has four śrutis, Ri three, Ga two, Ma four, Pa four, Dha three and Ni two.",
    note: "The count is attached to the interval BELOW its named note. Thus Sa→Ri has three, Ri→Ga two, and the final Ni→upper Sa four. The ascending sequence from Sa is 3–2–4–4–3–2–4; reading 4–3–2–4–4–3–2 as intervals above those same names moves the counts to the wrong places.",
  },
  {
    title: "Move Pa; exchange the neighbouring counts",
    page: "29",
    language: "sa-Latn",
    original:
      "catuḥśrutis tu vijñeyo madhyamaḥ pañcamaḥ punaḥ | triśrutir dhaivatas tu syāc catuḥśrutika eva hi || 28 ||",
    english: "Ma is four-count; Pa is three-count; Dha is four-count.",
    note: "These are the changed neighbouring counts in the madhyama-grāma. Lowering Pa shortens Ma→Pa and enlarges Pa→Dha. It does not move every principal note or turn the system into a modern major/minor scale. The two whole systems are shifted only in the separate successive-lowering demonstration.",
  },
  {
    title: "The early translator marks his uncertainty",
    page: "86",
    language: "fr",
    original:
      "Nous donnons, en suivant pas à pas le texte, une traduction approximative de cette démonstration obscure, dont nous n'avons pu dégager un sens satisfaisant.",
    english:
      "Following the text step by step, we give an approximate translation of this obscure demonstration, from which we could not extract a satisfactory sense.",
    note: "Grosset 1888, note 36. His doubt belongs to this early edition and translation. Whole pages retain his apparatus and commentary; their nineteenth-century historical and etymological claims are not adopted here. Our numerical family is a separately attributed modern analysis, not a recovery of one uniquely determined ancient tuning.",
  },
] as const;
export const VINA_WORDS = [
  [
    "dve vīṇe",
    "two vīṇās",
    "Both words are dual forms. The source asks for two comparably prepared instruments; their name alone does not recover a modern instrument's construction.",
  ],
  [
    "śruti",
    "an audible interval or unit in this argument",
    "Related to hearing. Retain its source-specific role: one count is not automatically one equal division of an octave.",
  ],
  [
    "grāma",
    "pitch system",
    "Literally a grouping or village; here a technical arrangement of notes. Do not replace the two grāmas with modern European major and minor.",
  ],
  [
    "pañcama",
    "Pa, the fifth note",
    "The note altered between the two grāmas. Its absolute frequency still depends on the chosen reference.",
  ],
  [
    "apakarṣa",
    "lowering",
    "The action changes pitch. Four successive lowerings in our model have different sizes in cents.",
  ],
  [
    "utkarṣa",
    "raising",
    "Pa can be raised back to the other grāma. This is a relation between pitches, not a surviving tuning-machine setting.",
  ],
  [
    "pramāṇa",
    "measure or reference",
    "Pramāṇaśruti identifies the reference difference at Pa. Setting it to the syntonic comma is an additional modern choice.",
  ],
  [
    "saṃvādin",
    "mutually consonant",
    "The source identifies nine- and thirteen-count relations. Modeling them as exact 4:3 and 3:2 is the disclosed extra acoustic assumption.",
  ],
  [
    "dviśruti",
    "two-count",
    "Dvi- is two. Ga and Ni receive this count below them in the stated ṣaḍja-grāma.",
  ],
  [
    "triśruti",
    "three-count",
    "Tri- is three. The relevant notes are Ri and Dha, not every third written note.",
  ],
  ["catuḥśruti", "four-count", "Catuḥ- is four. Sa, Ma and Pa make the final three matches."],
  [
    "praviśato",
    "the two enter or meet",
    "A dual verb in the printed second-lowering sentence. Matching note names is central; it does not supply the sizes of all twenty-two microintervals.",
  ],
] as const;
