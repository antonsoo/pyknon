export const NOTATION_READINGS = [
  {
    title: "Two alphabets above one table",
    page: "367",
    greek: "[λυδίου τρόπου σημεῖα. τὰ μὲν ἄνω τῆς λέξεως. τὰ δὲ κάτω τῆς κρούσεως.]",
    english:
      "[Signs of the Lydian tonos. The upper ones are for words; the lower ones for instrumental playing.]",
    note: "The conventional labels here are ‘vocal’ and ‘instrumental’. λέξις concerns verbal delivery; κροῦσις concerns striking or instrumental playing. This is a key to two notations, not an instruction to play the upper and lower rows as two simultaneous parts. Jan prints the whole heading in square brackets and proposes moving it after p368 line 18. Those brackets and his note remain in the scan.",
    words: [
      {
        greek: "σημεῖα",
        meaning: "signs; marks",
        note: "Neuter plural of σημεῖον. The shape on the page is a sign; its alphabet and table determine the reading.",
      },
      {
        greek: "τὰ μὲν ἄνω … τὰ δὲ κάτω",
        meaning: "the upper ones … the lower ones",
        note: "The μέν … δέ pair organizes a contrast. On p368 the two notation rows are literally above and below each other; on p369 each prose entry writes the two signs side by side.",
      },
    ],
  },
  {
    title: "Fixed is not a measured number of hertz",
    page: "368",
    greek:
      "ἑστῶτες μὲν οὖν λέγονται, ὅτι ἐν ταῖς τῶν γενῶν διαφοραῖς οὐ μεταπίπτουσιν. κινούμενοι δέ, ὅτι ἐν ταῖς τῶν γενῶν διαφοραῖς μεταπίπτουσιν εἰς ἑτέρας τάσεις.",
    english:
      "They are called fixed because, in changes of genus, they do not shift; movable because, in changes of genus, they shift to other pitch levels.",
    note: "The distinction concerns changes of genus, not a recovered concert-pitch standard. The desk uses only selected diatonic rows. Its 330 Hz mesē and two tuning models are explicit modern choices. A sign shape alone is not a universal frequency measurement.",
    words: [
      {
        greek: "ἑστῶτες",
        meaning: "standing; fixed",
        note: "A masculine plural participle of ἵστημι, agreeing with the notes. Its contrast with κινούμενοι makes a technical category out of a physical verb.",
      },
      {
        greek: "κινούμενοι",
        meaning: "moving; movable",
        note: "Present middle/passive participle of κινέω. The next clause states the relevant movement: a shift in pitch when the genus changes.",
      },
    ],
  },
  {
    title: "Iota becomes a sideways lambda",
    page: "369",
    greek: "μέση ἰῶτα καὶ λάβδα πλάγιον",
    english: "Mesē: iota and sideways lambda.",
    note: "The vocal sign comes first, the instrumental sign second. The sentence has no written ‘is’: its compact list gives the note name, then a pair of shape descriptions. Keep the note when translating; copying the shape would change or lose the reading. λάβδα is the spelling printed here, rather than silently changing it to λάμβδα.",
    words: [
      {
        greek: "μέση",
        meaning: "middle",
        note: "Feminine singular, the conventional name of the middle note. It is not automatically the modern tonic, nor the halfway point between every pair of pitches.",
      },
      {
        greek: "πλάγιον",
        meaning: "sideways; oblique",
        note: "Neuter singular, agreeing with the letter name. Compare the sideways lambda at mesē with the sideways pi at paramesē. The diagrams follow the printed results; the adjective does not specify a universal numeric rotation rule.",
      },
    ],
  },
  {
    title: "Sigma can agree, then turn",
    page: "369",
    greek: "ὑπάτη μέσων σίγμα καὶ σίγμα · παρυπάτη μέσων ῥῶ καὶ σίγμα ἀνεστραμμένον",
    english:
      "Hypatē of the middle tetrachord: sigma and sigma. Parhypatē of the middle tetrachord: rho and upturned sigma.",
    note: "Two adjacent entries are joined here with a middle dot; the printed line breaks are not retained. The first is a same-shape, same-note control. The next changes the vocal sign to rho and the instrumental sign to an upturned form. Our regular strokes are teaching drawings; they do not reproduce a particular ancient hand.",
    words: [
      {
        greek: "μέσων",
        meaning: "of the middle ones",
        note: "Genitive plural. In these note names it locates the middle tetrachord; it is not the singular note μέση.",
      },
      {
        greek: "ἀνεστραμμένον",
        meaning: "turned up; inverted",
        note: "Perfect middle/passive participle from ἀναστρέφω, neuter to match the letter name. Identify the printed resulting shape rather than applying one modern 180-degree rule to every ancient use of ‘inverted’.",
      },
    ],
  },
  {
    title: "The pair does not uniquely name the function",
    page: "369",
    greek:
      "νήτη συνημμένων ὦ τετράγωνον ὕπτιον καὶ ζῆτα · διεζευγμένων διάτονος ὦ τετράγωνον ὕπτιον καὶ ζῆτα",
    english:
      "Nētē of the conjunct tetrachord: square omega lying on its back, and zeta. Diatonic [paranētē] of the disjunct tetrachord: square omega lying on its back, and zeta.",
    note: "Rows 11 and 14 have the same pair but different functional names. The desk accepts their shared pitch while listing both functions. It does not choose the first name and pretend the ambiguity disappeared. The word paranētē in English is explanatory; it is not printed in that Greek entry.",
    words: [
      {
        greek: "συνημμένων · διεζευγμένων",
        meaning: "of the joined ones · of the separated ones",
        note: "Genitive plural participles naming conjunct and disjunct tetrachords. The written distinction survives even where the sign pair coincides.",
      },
      {
        greek: "τετράγωνον ὕπτιον",
        meaning: "square; lying on its back",
        note: "Two descriptions of omega’s form. The open-topped square here is a musical sign. Calling it the Latin letter U would hide why the vocal and instrumental descriptions differ.",
      },
    ],
  },
  {
    title: "Change the table, change the function",
    page: "370",
    greek: "μέση σίγμα καὶ σίγμα · νήτη συνημμένων ἰῶτα καὶ λάμβδα πλάγιον",
    english: "Mesē: sigma and sigma. Nētē of the conjunct tetrachord: iota and sideways lambda.",
    note: "These selected entries now belong to the Hypolydian table. Sigma’s Lydian function was hypatē mesōn; iota’s was mesē. Compare the two complete pages. ‘Lydian’ and ‘Hypolydian’ here name table contexts, not a modern piano mode or evidence for one timeless regional performance style. No cross-table Hz reconstruction is inferred from this comparison.",
    words: [
      {
        greek: "Ὑπολυδίου",
        meaning: "of the Hypolydian",
        note: "Genitive in the table heading. The prefix ὑπο- changes which named table is being read; it does not tell you how a modern Lydian scale should be played.",
      },
      {
        greek: "λάμβδα",
        meaning: "lambda",
        note: "This page prints λάμβδα where the preceding Lydian entry prints λάβδα. The readings retain that small difference rather than presenting a silently uniform ancient text.",
      },
    ],
  },
] as const;
