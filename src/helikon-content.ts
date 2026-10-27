export const HELIKON_READINGS = [
  {
    title: "Start with a square",
    page: "97",
    greek: "Ἐκτίθενται τετράγωνον, ὡς τὸ αβγδ.",
    latin: "Exponunt utique quadratum, ut ABCD.",
    english: "They set out a square, such as ABCD.",
    note: "Ptolemy describes a construction attributed to mathematicians. This is a selected complete sentence. The workshop uses Wallis’s Latin diagram letters. Greek barred lowercase segment labels are normalized to ordinary lowercase here.",
    words: [
      [
        "Ἐκτίθενται",
        "Exponunt",
        "They set out",
        "A present-tense construction instruction. It introduces a proposed geometrical figure, rather than an excavated object.",
      ],
      [
        "τετράγωνον",
        "quadratum",
        "a square",
        "The figure has equal sides and right angles. The later extension on p.99 allows a more general parallelogram.",
      ],
    ],
  },
  {
    title: "Halve two different sides",
    page: "97",
    greek: "διελόντες δίχα τὰς αβ καὶ βδ",
    latin: "bisectis AB & BD",
    english: "having divided AB and BD in half",
    note: "An excerpt of the next instruction, stopping before the named division points. The Greek participle διελόντες gives an action completed before joining the lines. Wallis uses a Latin ablative absolute. The E midpoint runs across the board; the F midpoint runs along a string. Neither instruction places G at the centre.",
    words: [
      [
        "δίχα",
        "bisectis",
        "in two equal parts",
        "The Latin puts the division into the participle ‘having been bisected’. In the diagram, AE = EB and BF = FD.",
      ],
      [
        "διελόντες",
        "bisectis",
        "having divided",
        "Greek describes what the constructors do. Latin describes what has been done to AB and BD.",
      ],
    ],
  },
  {
    title: "One board, many intervals",
    page: "98",
    greek: "πάσας τὰς συμφωνίας, καὶ τὸν τόνον",
    latin: "Consonantiae omnes, & Tonus",
    english: "all the consonances, and the tone",
    note: "A selected noun phrase from the result, not a full sentence. Greek uses the accusative after ‘producing’; Wallis’s corresponding result makes the consonances and tone its grammatical subject. His spelling Consonantiae is normalized from the printed ligature. The list includes octave + fourth (8:3), octave + fifth (3:1) and two octaves (4:1). ‘All’ belongs to that theoretical list; it is not a claim about every musical interval or every culture’s consonance judgments.",
    words: [
      [
        "συμφωνίας",
        "Consonantiae",
        "consonances",
        "The named interval relations. In this model, a ratio of lengths becomes an inverse ratio of frequencies.",
      ],
      [
        "τόνον",
        "Tonus",
        "tone",
        "Here the whole-tone interval 9:8, produced by lengths 9 and 8. It is a relation between pitches, not the absolute reference frequency.",
      ],
    ],
  },
  {
    title: "Place the strings, then the bridge",
    page: "99",
    greek: "τὰς χορδὰς παραλλήλους τε τῇ αγ, καὶ ἰσοτόνους ἀλλήλαις",
    latin: "chordas ipsi AC parallelas, atque inter se aequitonas",
    english: "the strings parallel to AC and equal in pitch to one another",
    note: "A noun-phrase excerpt from Ptolemy’s instruction to stretch the strings in his extension of the instrument. The shared bridge follows this initial setup. ἰσοτόνους means equal in pitch; it does not establish equal physical tension by itself. Our uniform strings additionally hold material and tension fixed. The retuning bench is a reduced four-string analogy, not the full extended octachord drawn in the source.",
    words: [
      [
        "παραλλήλους",
        "parallelas",
        "parallel",
        "The strings keep a common direction. Their distances across the board can change independently of that direction.",
      ],
      [
        "ἰσοτόνους ἀλλήλαις",
        "inter se aequitonas",
        "equal in pitch to one another",
        "An initial condition before dividing their sounding lengths. A real moved string would have to be checked again.",
      ],
    ],
  },
  {
    title: "One common support",
    page: "100",
    greek: "τὸ κοινὸν ἔχειν ὑπαγωγέα, καὶ ἕνα, καὶ ἐπὶ μίαν θέσιν",
    latin: "quod commune habeat subductorium, unicumque, & eodem situ positum",
    english: "having one common movable support, in a single position",
    note: "An excerpt of the advantage Ptolemy assigns to this method. The Greek infinitive phrase names the advantage; Wallis uses a ‘that’ clause. ὑπαγωγέα is the under-sliding support or bridge. The source then changes the common bridge’s position while preserving a genus. Our scaled bridge illustrates the similar-triangle principle with four chosen strings.",
    words: [
      [
        "κοινὸν",
        "commune",
        "common",
        "One support crosses all the strings. Moving a single crossing independently would require a different support.",
      ],
      [
        "μίαν θέσιν",
        "eodem situ",
        "one position",
        "This concerns the bridge’s shared placement at a given setting. It does not promise that its placement never changes.",
      ],
    ],
  },
  {
    title: "The practical price",
    page: "101",
    greek: "τὰς χορδὰς ὅλας παραφέρειν",
    latin: "quod chordas integras transferre oporteat",
    english: "moving the strings as wholes",
    note: "A Greek infinitive excerpt from Ptolemy’s comparison of the two methods. Wallis’s selected clause expands it to ‘that it is necessary to move the whole strings’. Ptolemy also discusses changing string separations, sometimes by a large amount, in altering a tuning. The bench shows lateral geometry; it does not calculate finger reach, retensioning or practical playability.",
    words: [
      [
        "ὅλας",
        "integras",
        "whole",
        "The strings move across the board as wholes, rather than acquiring an independently moved contact under one string.",
      ],
      [
        "παραφέρειν",
        "transferre",
        "to move across",
        "An infinitive describing the operation that this method requires. Our two inner string controls make that operation visible.",
      ],
    ],
  },
] as const;

export const HELIKON_LETTERS = [
  ["α", "A"],
  ["β", "B"],
  ["γ", "C"],
  ["δ", "D"],
  ["ε", "E"],
  ["ζ", "F"],
  ["η", "G"],
  ["θ", "H"],
  ["κ", "K"],
  ["λ", "L"],
  ["μ", "M"],
] as const;
