export const RHYTHM_ARCHIVE = "https://archive.org/details/diefragmenteund00rossgoog";
export const RHYTHM_PAGES = ["title", 28, 31, 33, 34, 35, 36, 37] as const;
export interface RhythmPassage {
  title: string;
  page: number;
  lines: string;
  greek: string;
  english: string;
  note: string;
  words: string[];
  latin?: string;
  latinNote?: string;
  latinEnglish?: string;
}
export const RHYTHM_PASSAGES: RhythmPassage[] = [
  {
    title: "A primary time",
    page: 31,
    lines: "5–7",
    greek:
      "Καλείσθω δὲ πρῶτος μὲν τῶν χρόνων ὁ ὑπὸ μηδενὸς τῶν ῥυθμιζομένων δυνατὸς ὢν διαιρεθῆναι",
    english:
      "Let the primary time be the one that cannot be divided by any of the things being rhythmized.",
    note: "A selected definition, not the whole paragraph. The unit belongs to a rhythmic use of speech, melody or movement. Our modern milliseconds make examples playable; this definition does not prescribe one universal ancient tempo. πρῶτος means first or primary, χρόνος time or duration.",
    words: ["πρῶτος", "χρόνος", "ῥυθμιζόμενον"],
  },
  {
    title: "A foot's size",
    page: 35,
    lines: "16–18",
    greek:
      "Μεγέθει μὲν οὖν διαφέρει ποὺς ποδός, ὅταν τὰ μεγέθη τῶν ποδῶν, ἃ κατέχουσιν οἱ πόδες, ἄνισα ᾖ.",
    english:
      "One foot differs from another in size when the extents occupied by the feet are unequal.",
    note: "This is the first of seven differences listed in the fragment. Six units is a size; it does not yet say where the internal division goes. In our first bench both feet have the same unit duration and the same total count, so their sizes agree.",
    words: ["μέγεθος", "πούς", "ἄνισος"],
  },
  {
    title: "A foot's genus",
    page: 35,
    lines: "19–21",
    greek:
      "γένει δέ, ὅταν οἱ λόγοι διαφέρωσιν ἀλλήλων οἱ τῶν ποδῶν, οἷον ὅταν ὁ μὲν τὸν τοῦ ἴσου λόγον ἔχῃ, ὁ δὲ τὸν τοῦ διπλασίου, ὁ δ’ ἄλλον τινὰ τῶν ἐρρύθμων χρόνων.",
    english:
      "In genus, when the ratios of the feet differ from one another: for example, when one has the equal ratio, another the double, and another a different one among rhythmical durations.",
    note: "The sentence continues the preceding 'differs' construction. λόγος here is ratio or proportion. Equal outer lengths can still contain different ratios. Our labels reduce the larger portion to the smaller, while the bars preserve which portion is up and which down.",
    words: ["γένος", "λόγος", "ἴσος", "διπλάσιος"],
  },
  {
    title: "Three genera for continuous composition",
    page: 36,
    lines: "9–13",
    greek:
      "Τῶν δὲ ποδῶν τῶν καὶ συνεχῆ ῥυθμοποιίαν ἐπιδεχομένων τρία γένη ἐστί· τό τε δακτυλικὸν καὶ τὸ ἰαμβικὸν καὶ τὸ παιωνικόν. Δακτυλικὸν μὲν οὖν ἐστι τὸ ἐν ἴσῳ λόγῳ, ἰαμβικὸν δὲ τὸ ἐν τῷ διπλασίῳ, παιωνικὸν δὲ τὸ ἐν τῷ ἡμιολίῳ.",
    english:
      "There are three genera of feet that admit continuous rhythmic composition: dactylic, iambic and paeonic. Dactylic is in the equal ratio, iambic in the double, and paeonic in the ratio of one and a half.",
    note: "ἡμιόλιος is one-and-a-half: 3:2. 'Dactylic' names this ratio family here; it does not force every realization to have a long-short-short syllable pattern. The classifier reports membership in these three families, not a verdict on all possible music. Westphal's later parallel witnesses remain separate.",
    words: ["συνεχής", "ῥυθμοποιία", "δακτυλικός", "ἰαμβικός", "παιωνικός", "ἡμιόλιος"],
    latin: "Hae sunt tres partitiones quae continuam rhythmopoeian faciunt.",
    latinEnglish: "These are the three divisions that make continuous rhythmic composition.",
    latinNote:
      "A Latin parallel in Westphal's apparatus, cited as 'Mar. Victor. p.2485'. It is not a Latin translation of Aristoxenus. This room preserves Westphal's attribution without resolving the authorship of the grammatical tradition.",
  },
  {
    title: "Six admits two genera",
    page: 37,
    lines: "5–12",
    greek:
      "Τέταρτοι δέ εἰσιν οἱ ἐν ἑξασήμῳ μεγέθει· ἔστι δὲ τὸ μέγεθος τοῦτο δύο γενῶν κοινόν, τοῦ τε ἰαμβικοῦ καὶ τοῦ δακτυλικοῦ. ἐν γὰρ τοῖς ἓξ τριῶν λαμβανομένων λόγων, τοῦ τε ἴσου καὶ τοῦ διπλασίου καὶ τοῦ πενταπλασίου, ὁ μὲν τελευταῖος ῥηθεὶς οὐκ ἔρρυθμός ἐστιν, τῶν δὲ λοιπῶν ὁ μὲν τοῦ ἴσου λόγος εἰς τὸ δακτυλικὸν γένος ἐμπεσεῖται, ὁ δὲ τοῦ διπλασίου εἰς τὸ ἰαμβικόν.",
    english:
      "Fourth come the feet of six-time size. This size is common to two genera, iambic and dactylic. Of the three ratios obtained in six—the equal, the double and the fivefold—the last mentioned is not rhythmical. Of the remaining two, the equal ratio falls into the dactylic genus, and the double into the iambic.",
    note: "The possible positive integer divisions are 3+3, 2+4 and 1+5, with their reversals. The passage admits the first two ratio families. κοινόν means shared: the same total belongs to two genera. ῥηθεὶς means 'mentioned', from λέγω; do not confuse it with ῥητός in the later reading about rationality.",
    words: ["ἑξάσημος", "κοινός", "ἔρρυθμος", "λόγος"],
  },
  {
    title: "Reverse the assignments",
    page: 36,
    lines: "5–8",
    greek:
      "Ἀντιθέσει δὲ διαφέρουσιν ἀλλήλων οἱ τὸν ἄνω χρόνον πρὸς τὸν κάτω ἀντικείμενον ἔχοντες. Ἔσται δὲ ἡ διαφορὰ αὕτη ἐν τοῖς ἴσοις μὲν, ἀνίσως δὲ ἔχουσι τὸν ἄνω χρόνον καὶ τὸν κάτω τεταγμένους.",
    english:
      "Feet differ by antithesis when they have the up duration assigned oppositely to the down. This difference occurs in feet that are equal as wholes, but have their up and down durations arranged unequally.",
    note: "Reverse up and down exchanges the two durations while preserving the total and ratio family. With 3+3 the reversal has no effect. Up/down are temporal roles in this diagram; we do not identify them unconditionally with modern weak/strong accents or reconstruct a dancer's motion.",
    words: ["ἀντίθεσις", "ἄνω", "κάτω", "ἴσος"],
  },
  {
    title: "Keep the foot; vary the smaller divisions",
    page: 33,
    lines: "25–26, continuing p.34 lines 1–4",
    greek:
      "Νοητέον δὲ χωρὶς τά τε τὴν τοῦ ποδὸς δύναμιν φυλάττοντα σημεῖα καὶ τὰς ὑπὸ τῆς ῥυθμοποιίας γινομένας διαιρέσεις· καὶ προσθετέον δὲ τοῖς εἰρημένοις, ὅτι τὰ μὲν ἑκάστου ποδὸς σημεῖα διαμένει ἴσα ὄντα καὶ τῷ ἀριθμῷ καὶ τῷ μεγέθει, αἱ δ’ ὑπὸ τῆς ῥυθμοποιίας γινόμεναι διαιρέσεις πολλὴν λαμβάνουσι ποικιλίαν.",
    english:
      "Think separately of the markers that preserve the foot's function and the divisions made by rhythmic composition. Add to what has been said that the markers of each foot remain equal in number and size, while the divisions made by rhythmic composition take on great variety.",
    note: "This sentence crosses the printed page boundary. The bench's 'every unit' and 'join within each portion' attacks are modern illustrations: the defining up/down division stays in place while smaller attacks change. The passage does not limit a composition to one stereotyped two-note pattern.",
    words: ["χωρίς", "σημεῖον", "διαίρεσις", "ῥυθμοποιία"],
  },
  {
    title: "An intermediate foot",
    page: 34,
    lines: "6–16",
    greek:
      "Ὥρισται δὲ τῶν ποδῶν ἕκαστος ἤτοι λόγῳ τινὶ ἢ ἀλογίᾳ τοιαύτῃ, ἥτις δύο λόγων γνωρίμων τῇ αἰσθήσει ἀνὰ μέσον ἔσται. Γένοιτο δὲ τὸ εἰρημένον ἂν ὧδε καταφανές, εἰ ληφθείησαν δύο πόδες, ὁ μὲν ἴσον τὸ ἄνω τῷ κάτω ἔχων καὶ δίσημον ἑκάτερον, ὁ δὲ τὸ μὲν κάτω δίσημον, τὸ δὲ ἄνω ἥμισυ, τρίτος δέ τις ληφθείη ποὺς παρὰ τούτους, τὴν μὲν βάσιν ἴσην αὐτοῖς ἀμφοτέροις ἔχων, τὴν δὲ ἄρσιν μέσον μέγεθος ἔχουσαν τῶν ἄρσεων. Ὁ γὰρ τοιοῦτος ποὺς ἄλογον μὲν ἕξει τὸ ἄνω πρὸς τὸ κάτω· ἔσται δ’ ἡ ἀλογία μεταξὺ δύο λόγων γνωρίμων τῇ αἰσθήσει, τοῦ τε ἴσου καὶ τοῦ διπλασίου. Καλεῖται δ’ οὗτος χορεῖος ἄλογος.",
    english:
      "Each foot is determined either by a ratio or by an irrationality lying between two ratios recognizable to perception. This can be made clear as follows. Take two feet: one has its up duration equal to its down, each two times; the other has its down duration two times and its up half of that. Take a third beside these, with its down portion equal to both theirs and its up portion intermediate between their up portions. Such a foot has its up duration irrational in relation to its down. The irrationality lies between two ratios recognizable to perception, the equal and the double. This is called an irrational choreios.",
    note: "This is the passage's example, with the fixed down portion preserved. 'Intermediate' does not prescribe an exact midpoint: our 1½ is a chosen illustration. At that position up:down is 3:4, an ordinary rational fraction. The next reading explains why arithmetic alone does not settle what ἄλογος means in this rhythmic context.",
    words: ["ἄρσις", "βάσις", "αἴσθησις", "ἄλογος", "μεταξύ", "δίσημος", "ἥμισυ"],
  },
  {
    title: "A common measure must be rhythmical",
    page: 35,
    lines: "5–8",
    greek:
      "Φανερὸν δὲ διὰ τῶν εἰρημένων, ὅτι ἡ μέση ληφθεῖσα τῶν ἄρσεων οὐκ ἔσται σύμμετρος τῇ βάσει· οὐδὲν γὰρ αὐτῶν μέτρον ἐστὶ κοινὸν ἔρρυθμον.",
    english:
      "It is clear from what has been said that the intermediate up portion taken will not be commensurable with the down: they have no common measure that is rhythmically admissible.",
    note: "The qualification ἔρρυθμον matters. The intervening discussion on p.34 distinguishes ratios recognized in rhythmic use from ratios of numbers alone. Changing our numerical grid to half-units would not establish the source's musical condition. This model supplies no universal perception threshold or classifier for every intervening ratio.",
    words: ["σύμμετρος", "μέτρον", "κοινός", "ἔρρυθμος"],
  },
  {
    title: "Seven, then a broken explanation",
    page: 37,
    lines: "12–18",
    greek:
      "Τὸ δὲ ἑπτάσημον μέγεθος οὐκ ἔχει διαίρεσιν ποδικήν· τριῶν γὰρ λαμβανομένων λόγων ἐν τοῖς ἑπτὰ οὐδείς ἐστιν ἔρρυθμος· ὧν εἷς μέν ἐστιν ὁ τοῦ ἐπιτρίτου, δεύτερος δὲ ὁ τῶν πέντε πρὸς τὰ δύο, τρίτος δὲ ὁ τοῦ ἑξαπλασίου. Ὥστε πέμπτοι ἂν εἴησαν οἱ ἐν ὀκτασήμῳ μεγέθει. ἔσονται δ’ οὗτοι δακτυλικοὶ τῷ γένει, ἐπειδήπερ …",
    english:
      "The seven-time size has no division into a foot: none of the three ratios obtained in seven is rhythmical here. One is 4:3, the second 5:2, and the third sixfold. Thus fifth would come the feet of eight-time size. These will be dactylic in genus, because …",
    note: "The main Aristoxenus fragment breaks off here. The dots mark its missing continuation, rather than words we have reconstructed. 'Not rhythmical' belongs to this passage's admitted genera; it does not declare that every ancient author or all music rejects seven-unit patterns. The later Psellus material printed below is a separate witness.",
    words: ["ἑπτάσημος", "ὀκτάσημος", "ἐπίτριτος", "διαίρεσις"],
  },
];
export const RHYTHM_WORDS: Record<string, { roman: string; meaning: string; note: string }> = {
  πρῶτος: {
    roman: "prōtos",
    meaning: "first; primary",
    note: "The name of the chosen time unit, not a fixed number of milliseconds.",
  },
  χρόνος: {
    roman: "chronos",
    meaning: "time; duration",
    note: "Context can refer to the primary unit or a larger duration; the diagram labels which.",
  },
  ῥυθμιζόμενον: {
    roman: "rhythmizomenon",
    meaning: "what is being rhythmized",
    note: "The material given rhythmic form: speech, melody or movement in the surrounding argument.",
  },
  μέγεθος: {
    roman: "megethos",
    meaning: "size; extent",
    note: "The total span occupied by a foot, distinguished from its ratio.",
  },
  πούς: {
    roman: "pous",
    meaning: "foot",
    note: "A temporal organization in the argument, not merely a printed poetic syllable pattern.",
  },
  ἄνισος: {
    roman: "anisos",
    meaning: "unequal",
    note: "Compare ἴσος, equal. The alpha prefix reverses the sense.",
  },
  γένος: {
    roman: "genos",
    meaning: "kind; genus",
    note: "Here classified by the ratio of the portions, rather than their total duration.",
  },
  λόγος: {
    roman: "logos",
    meaning: "ratio; proportion",
    note: "The mathematical sense of a word also used for an account or argument.",
  },
  ἴσος: {
    roman: "isos",
    meaning: "equal",
    note: "The equal ratio gives the dactylic genus in this fragment.",
  },
  διπλάσιος: {
    roman: "diplasios",
    meaning: "double",
    note: "The larger portion is twice the smaller: 2:1.",
  },
  συνεχής: {
    roman: "synechēs",
    meaning: "continuous",
    note: "The restriction to continuous rhythmic composition qualifies the three-genus statement.",
  },
  ῥυθμοποιία: {
    roman: "rhythmopoiia",
    meaning: "rhythmic composition",
    note: "The practice that can introduce varied inner divisions while preserving a foot's function.",
  },
  δακτυλικός: {
    roman: "daktylikos",
    meaning: "dactylic",
    note: "A ratio family here: equal portions. 3+3 is dactylic in this sense too.",
  },
  ἰαμβικός: {
    roman: "iambikos",
    meaning: "iambic",
    note: "A ratio family here: one portion double the other. Reversing the assignments preserves this genus.",
  },
  παιωνικός: {
    roman: "paiōnikos",
    meaning: "paeonic",
    note: "The genus with a 3:2 relation, first possible at five primary times in the passage.",
  },
  ἡμιόλιος: {
    roman: "hēmiolios",
    meaning: "one and a half; 3:2",
    note: "The numerical adjective behind the term hemiolic.",
  },
  ἑξάσημος: {
    roman: "hexasēmos",
    meaning: "of six time-units",
    note: "The same six-time size can belong to equal or double genera.",
  },
  κοινός: {
    roman: "koinos",
    meaning: "common; shared",
    note: "Used both of a size shared by genera and of a common measure.",
  },
  ἔρρυθμος: {
    roman: "enrhythmos",
    meaning: "rhythmical; rhythmically admissible",
    note: "A context-sensitive musical qualification. A numerical common measure alone does not establish it.",
  },
  ἀντίθεσις: {
    roman: "antithesis",
    meaning: "opposition; opposite assignment",
    note: "The source's difference between equal feet with up/down durations assigned oppositely.",
  },
  ἄνω: {
    roman: "anō",
    meaning: "up; above",
    note: "Names one temporal role here, without equating it universally to modern weak accents.",
  },
  κάτω: {
    roman: "katō",
    meaning: "down; below",
    note: "Names the other temporal role; the second experiment holds it at two times.",
  },
  χωρίς: {
    roman: "chōris",
    meaning: "separately",
    note: "The instruction to keep foot-preserving markers distinct from composition's smaller divisions.",
  },
  σημεῖον: {
    roman: "sēmeion",
    meaning: "mark; signal",
    note: "A marker has a structural role, distinct from every little attack we may insert.",
  },
  διαίρεσις: {
    roman: "diairesis",
    meaning: "division",
    note: "Ask whether it is a foot's defining division or a subdivision made by composition.",
  },
  ἄρσις: {
    roman: "arsis",
    meaning: "raising; up portion",
    note: "One of the terms used when the intermediate example compares its two temporal portions.",
  },
  βάσις: {
    roman: "basis",
    meaning: "step; down portion",
    note: "It stays equal to two times in all three intermediate-example feet.",
  },
  αἴσθησις: {
    roman: "aisthēsis",
    meaning: "perception",
    note: "A condition of the rhythmic discussion, not a numerical hearing threshold measured by this app.",
  },
  ἄλογος: {
    roman: "alogos",
    meaning: "irrational; outside a recognized proportion in this context",
    note: "Read with the argument about rhythmically admissible measures. Our chosen 3:4 is arithmetically rational.",
  },
  μεταξύ: {
    roman: "metaxy",
    meaning: "between",
    note: "The source gives an intervening size; it does not state that it is exactly 1½.",
  },
  δίσημος: {
    roman: "disēmos",
    meaning: "of two time-units",
    note: "The down portion shared by the three feet in the intermediate example.",
  },
  σύμμετρος: {
    roman: "symmetros",
    meaning: "commensurable; sharing a measure",
    note: "The following qualification requires the shared measure to be rhythmically admissible.",
  },
  μέτρον: {
    roman: "metron",
    meaning: "measure",
    note: "A measure in the argument; not automatically a modern bar or time signature.",
  },
  ἑπτάσημος: {
    roman: "heptasēmos",
    meaning: "of seven time-units",
    note: "Its integer partitions fall outside the three genera admitted in this fragment.",
  },
  ὀκτάσημος: {
    roman: "oktasēmos",
    meaning: "of eight time-units",
    note: "The fragment identifies this size as dactylic, then breaks off in its explanation.",
  },
  ἐπίτριτος: {
    roman: "epitritos",
    meaning: "one and a third; 4:3",
    note: "The 4:3 division of seven is excluded in this passage; later witnesses can treat the ratio differently.",
  },
  ἥμισυ: {
    roman: "hēmisy",
    meaning: "half",
    note: "Here the short up portion is half the two-time down portion: one primary time, rather than half of the primary unit.",
  },
};
