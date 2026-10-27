# Sources and third-party material

Pyknon's code, original diagrams and new English explanations are MIT licensed.
The following material retains its own provenance and terms.

## Seikilos song and photographs

The song reader uses the ancient, public-domain inscription on National Museum
of Denmark object **14897**, from Tralles (near modern Aydın, Turkey). Greek text
is normalized with accents, word divisions and four verse lines; the photograph
has six physical song lines. Our English translations, glosses, typeset pitch
signs and diagrams are new. The romanization is an unaccented reading aid, not
a phonetic transcription. The selected syllable boxes were located by visual
inspection of the photograph; they are teaching annotations, not a new epigraphic
edition or inferred OCR output.

The following files are the **unchanged JPEG downloads** provided by the museum,
retrieved 2026-10-21. Credit and license links accompany the images in the app
and in saved readings. The app adds a viewport and a yellow selection rectangle;
those annotated presentations retain CC BY-SA 4.0. The underlying photograph is
embedded byte-for-byte in saved HTML. The stele image is cropped by CSS for its
introductory display; opening it shows the complete downloaded image.

| Bundled file, under `public/sources/seikilos/` | Photographer                    | Museum record                                          | License                                                         |
| ---------------------------------------------- | ------------------------------- | ------------------------------------------------------ | --------------------------------------------------------------- |
| `inscription.jpg`                              | Lennart Larsen / Nationalmuseet | [AS-10006](https://samlinger.natmus.dk/as/asset/10006) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |
| `stele.jpg`                                    | John Lee / Nationalmuseet       | [AS-28501](https://samlinger.natmus.dk/as/asset/28501) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) |

These two records explicitly offer CC BY-SA; other photographs of the same
object in the museum use different licenses and are not bundled here.

### Pitch, duration and language reading

- Armand D'Angour, [“The Song of Seikilos: a Musically Notated Ancient Greek
  Poem”](https://antigonejournal.com/2021/12/song-of-seikilos/) (7 December 2021),
  especially its Greek notation and modern stave transcription. The app's
  factual pitch/duration sequence follows this transcription, visually checked
  against the museum image. We do not redistribute D'Angour's figures, English
  verse translation or recordings. We do not adopt his conjectures about the
  dedication or Seikilos's identity as established facts.
- D. B. Monro, _The Modes of Ancient Greek Music_ (Oxford: Clarendon Press,
  1894), [addendum, p. 145](https://www.gutenberg.org/files/40288/40288-h/40288-h.htm#Page_145).
  The public-domain illustrations `monro-ending.jpg` and
  `monro-correction.jpg` reproduce the corrected final sign and stave line.
  Retrieved from the digitization's `images/p_145a.jpg` and `images/p_145b.jpg`,
  without alteration. Digitization credited to Linda Cantoni, Paul Marshall,
  Bryan Ness and the Online Distributed Proofreading Team. Only the 1894 images
  are redistributed; no branded ebook wrapper is included. Monro's rhythmic
  reading differs from the modern one used in playback; his correction is
  evidence for the final **pitch sign**, not our duration oracle.
- Chinasaur, [public-domain LilyPond transcription](https://commons.wikimedia.org/wiki/File:Seikilos_score.png)
  (2005). `tests/fixtures/seikilos-reference.ly` retains the posted score code,
  with attribution comments added. This is a separately authored control for
  pitch, duration and multi-note syllable grouping. The checker interprets its
  native relative-note and duration notation; it does not use the app's sign
  mapping. Agreement is also checked against D'Angour's scholarly transcription;
  this contributor's score is not used to establish historical context.
- [PHI, Tralles 150 / ITralles 219](https://epigraphy.packhum.org/text/263000)
  supplies an additional check of the text, physical line breaks and reference
  bibliography. Its compressed text-only musical transcription omits the final
  reversed gamma; that rendering is not used as the pitch oracle.

The realization uses modern equal temperament and starting A = 220 or 440 Hz.
Durations are counted in short units, with a selectable pace. There are no
invented rests, stress accents, instrument reconstructions or sung vocals; a
25 ms articulation gap separates generated tones. The course does not apply
Archytas's theoretical tetrachord ratios to this Roman-period song. The museum
record and modern scholarship differ in precision about date and dedication;
the app keeps the date broad and the damaged dedication unresolved.

| File                                   | SHA-256                                                            |
| -------------------------------------- | ------------------------------------------------------------------ |
| `inscription.jpg`                      | `da774306bb3f05873e7126596612e5b623bd9255b0564b36d11bfb1be4826729` |
| `stele.jpg`                            | `9ddb805f113cdb555dde628b40c8c1efc3e9fb6c0b13d42905ab7dfb726b8050` |
| `monro-ending.jpg`                     | `c2a8ad3dbf2feaebde1b51f25aee415690ec3254c5f65d74daf27405a0d10ac3` |
| `monro-correction.jpg`                 | `6df42768a72811fa199c7d89bd4c4ebbc9fb46d0d1d63e413a6b4c845a60c34d` |
| `tests/fixtures/seikilos-reference.ly` | `7dfdd71bf817ae7ea6d4c226ce4090455cd19bf6509bb9c362efc6e39f98d187` |

## Ptolemy, edited and translated by Wallis (1682)

The ratios, Greek genus names and short Latin quotation were checked visually in
_Claudii Ptolemaei Harmonicorum libri tres_, Greek text and Latin translation by
John Wallis, Oxford: Sheldonian Theatre, 1682, Book I, chapter 13, printed
pages 62–63. The ancient text and this edition are public domain.

[Internet Archive's complete scan](https://archive.org/details/bim_early-english-books-1641-1700_-harmonicor_ptolomaeus-claudius_1682/page/n83/mode/2up).
PDF pages 84–85 correspond to printed pages 62–63. The two bundled JPEGs were
rendered from those PDF pages using Poppler `pdftoppm -scale-to 2200 -jpeg
-jpegopt quality=85`. No page content was removed, redrawn or reconstructed.
Both scans were inspected on 2026-10-21.

| File                           | SHA-256                                                            |
| ------------------------------ | ------------------------------------------------------------------ |
| Original Archive PDF           | `862839d2cd52dfc62004d0f68da4d8381417e8be69e3901db0d5f73568931884` |
| `public/sources/wallis-62.jpg` | `bb4e8eb52d20cc23cbb91b4e1ff6a8319e8bd0a8092ab8b899d2970087d427c2` |
| `public/sources/wallis-63.jpg` | `e9d74ef39d02b2dd124792b8ebff2260805ceeead6bde6a3be0adb1a904dbafd` |

The Latin sentence normalizes long-s and joins line breaks; its English
translation is new. The Greek genus labels use normalized Unicode and accents,
not the edition's typographic ligatures. We do not silently transcribe uncertain
Greek prose from OCR. Wallis's Latin is an early modern translation, not an
ancient Latin original. The source numbers in the interface reverse the printed
table's vertical order so that rows run from low pitch to high pitch.

## Interpretation and vocabulary

- Cristian Tolsa, “Surveying the Types of Tables in Ancient Greek Texts,”
  _Apeiron_ 57.4 (2024), 479–517, especially 495–497,
  [DOI 10.1515/apeiron-2024-0006](https://doi.org/10.1515/apeiron-2024-0006).
  This original research distinguishes the transmitted explanatory tables from
  Ptolemy's own text and discusses their possible passage from Porphyry's
  commentary. The app's table is newly typeset from Wallis's numbers; Tolsa's
  figures are not redistributed.
- Liddell–Scott–Jones, **πυκνός**, III.2, via the
  [Classical Language Dictionary of the Berlin-Brandenburg Academy](https://cld.bbaw.de/lemma/grc/%CF%80%CF%85%CE%BA%CE%BD%CF%8C%CF%82).
  The musical definition cites Aristoxenus, _Harmonics_ I, p. 24 in Meibom's
  pagination. Our explanation is a new paraphrase, not a dictionary quotation.
  The neuter **πυκνόν** is the musical term; the adjective's dictionary headword
  is **πυκνός**. The project uses the LSJ entry, not the separate modern Bailly
  translation on that page.
- The three neuter genus labels are directly attested on Wallis pp. 62–63.
  Their transliterations are reading aids, not claims about historical
  pronunciation. The app does not assign modern key names to ancient note names.

## Fonts

- IBM Plex Sans Regular and SemiBold WOFF2, from
  [IBM/plex](https://github.com/IBM/plex/tree/master/packages/plex-sans/fonts/complete/woff2).
  SIL Open Font License 1.1: `public/fonts/IBMPlex-OFL.txt`.
- Noto Serif Regular TTF, from
  [Noto Serif](https://github.com/notofonts/latin-greek-cyrillic).
  SIL Open Font License 1.1: `public/fonts/NotoSerif-OFL.txt`.

Font bytes match those already attributed in Gonia. They are self-hosted; the
application makes no requests to font services.

## Aristoxenus, translated by Macran (1902)

`public/sources/macran-182.jpg` is printed p. 182 of _The Harmonics of
Aristoxenus_, edited with translation, notes, introduction and index by Henry
S. Macran, Oxford: Clarendon Press, 1902. The page gives the definition of
pycnum at the traditional I.24 reference. It was visually checked against PDF
page 192 of [this Internet Archive scan](https://archive.org/details/aristoxenouharmo00arisuoft/page/n191/mode/1up),
then rendered with Poppler at 1800 pixels, JPEG quality 85, without changing
page content. Both the ancient text and this 1902 translation are public domain.

| File                 | SHA-256                                                            |
| -------------------- | ------------------------------------------------------------------ |
| Original Archive PDF | `8da7d88a8e5e2ccfcc82e7a768425f0f068df139d4e3cdecb18a7cd8b2a87a22` |
| Bundled page         | `870edc78b7ed3e08e38bfbe458722a774623562228152b2d9c07ed74c8165697` |

We use this passage for the **definition** of the close-packed group. It does
not supply Archytas's ratios. Aristoxenus's discussion of the fourth's apparent
size should not be silently substituted for the 4/3 ratio in our model.

## Sectio canonis, edited and translated by Menge (1916)

The octave room uses _Sectio canonis_ IX, XII–XIV, in Heinrich Menge's
Greek text and Latin translation, _Euclidis opera omnia_, volume VIII,
_Phaenomena et scripta musica_ (Leipzig: B. G. Teubner, 1916), printed
pp. 170–175. The edition's title pages print MCMXVI; the archive's broad
series metadata date is not used as this volume's date.

[Complete California scan](https://archive.org/details/euclidisoperaomn08eucl/page/174/mode/2up).
The original file is `euclidisoperaomn08eucl.pdf`, SHA-256
`eecde1f0c7164eae8497c17566746e9c4d38e3e09878a0a9d11caf0753fcddb8`.
PDF pp. 228–233 correspond to printed pp. 170–175. Six complete JPEG pages
were rendered with Poppler `pdftoppm -f 228 -l 233 -scale-to 1800 -jpeg
-jpegopt quality=85`. No page content was cropped, redrawn or reconstructed.
Every page was visually inspected on 2026-10-22.

The ancient Greek text and Menge's 1916 Latin translation are public domain.
The Greek reading normalizes Unicode and the edition's theta letterform,
joins line breaks and retains the bracketed `[ἐστι]`. Menge's Latin
proposition references in brackets remain identified as editorial additions.
The English translations, word notes, SVGs and explanations are new. Latin
is a modern scholarly translation of the Greek, not an ancient Latin original.
Romanization is an unaccented reading aid, not a reconstructed pronunciation.

The seven source integers on p. 171 were read from the photograph:
262144, 294912, 331776, 373248, 419904, 472392, 531441. OCR in another
copy corrupts several of these; the source images, exact arithmetic and
independent Python control are retained together. The integers form a ratio
proof. Treating their ratios as frequencies is an explicitly modern
realization, not a claim that the printed numbers measure string lengths.

| File under `public/sources/canon/` | Printed page / PDF page | SHA-256                                                            |
| ---------------------------------- | ----------------------- | ------------------------------------------------------------------ |
| `menge-170.jpg`                    | 170 / 228               | `dcc5aa0766a580e2a3d6e10a4bbccc5bb03042a845ea8263ca2ba47fccc27817` |
| `menge-171.jpg`                    | 171 / 229               | `72d4dc1d525c9b2cbb3e1af95e1656dc46f3eca4edd18f56bbf39f75e98bd57d` |
| `menge-172.jpg`                    | 172 / 230               | `0262cfa2cb42c56e93a16a32a8f445bd31206a7fcf1216bfd53aaf98a577e522` |
| `menge-173.jpg`                    | 173 / 231               | `ce0f45cb57a71a92ed2dacde8677d7979383bfc57c4eb85b4e6ad669c8c5844e` |
| `menge-174.jpg`                    | 174 / 232               | `df0a0f90048b46f60fadf024e8248789f87d2ece67cc344f94df2a739e8da130` |
| `menge-175.jpg`                    | 175 / 233               | `2edd6567bbf8f54e95fac83d6a2fc84077129dd9d2ec11fef07918129c44d1fc` |

Authorship is deliberately described as transmission under Euclid's name.
For the manuscript attribution and its difficulties, see Andrew Barker,
[“The Euclidean Sectio Canonis,” _Greek Musical Writings_, volume II, chapter 8](https://www.cambridge.org/core/books/abs/greek-musical-writings/euclidean-sectio-canonis/BB386D8812D97E70453550F83CE7C110).
No modern translation from this chapter is redistributed.

The label “Pythagorean comma,” modern cents, selectable A references,
equal 200-cent steps, twelve-fifths algebra and sine-tone beating are added
explanations and comparisons. They are not attributed to the wording of IX
or XIV. The work's 9:8 tone must not be silently replaced with a modern
200-cent tone, nor this argument substituted for Archytas's different
tetrachord divisions or the Seikilos song's modern realization.

## Ptolemy’s instrument examination, Wallis 1682

The string trial uses _Harmonics_ I.8 in the same identified 1682 PDF as the
Archytas room (SHA-256 `862839d2cd52dfc62004d0f68da4d8381417e8be69e3901db0d5f73568931884`).
Printed pp. **33–38** are PDF pp. **55–60**. Six full JPEGs in
`public/sources/trial/` were rendered with Poppler at 1800 pixels, JPEG quality
82. The [manifest](public/sources/trial/manifest.json) records every identity
and the [complete scan](https://archive.org/details/bim_early-english-books-1641-1700_-harmonicor_ptolomaeus-claudius_1682/page/n58/mode/2up).
Ancient text, Wallis’s Latin and these complete edition pages are public domain.

All six pages and selected phrases were visually inspected. Greek ligatures
and Unicode are normalized, line breaks joined, and barred lowercase segment
letters printed as capitals. Latin long-s is normalized; the ampersand is
retained where quoted. These are six selected phrases, not a continuous chapter
translation. English translations and grammar notes are new, without adopting
a modern copyrighted English translation. Greek Η is Latin G in Wallis’s
diagram, and Greek Λ is Latin L. The selected condition continues with an
inference about the string’s unvarying constitution, identified explicitly
in the notes rather than silently treated as a sufficient modern proof.

The two examination comparisons are the whole string’s halves, then the
right-hand half’s halves. The eighths test, stepwise mass profiles and
repeating counterexample are our additions. The modern flexible-string wave
equation, frequency values, arbitrary-amplitude mode shapes and synthesized
sines are not attributed to Ptolemy. No string material or ancient instrument
precision is inferred. Wallis’s long bridge-surface note on p. 36 remains
included; the printed diagram is editorial evidence, not an ancient blueprint.

Before embedding scans and font in a saved reading, the exporter verifies
their SHA-256 identities. The complete Noto Serif OFL notice is embedded too.
The selected generated audio, exact CSV and native SVG accompany that packet.

## Nicomachus weighted-string source pages

Jan, _Musici scriptores Graeci_ (1895), pp.245–248, and Meibom,
_Antiquae musicae auctores septem_, volume I (1652), Nicomachus pp.10–13.
Both original editions and their mechanically rendered full pages are public
domain. The exact original PDF and JPEG identities, correct PDF/Archive leaf
mappings, and Poppler rendering parameters are in `src/tension-sources.json`.
Full provenance, normalization and rights: `public/sources/tension/NOTICES.txt`.
No contemporary translation is reproduced. The new English translations,
notes and diagrams are MIT. Meibom's Latin is retained as his translation,
including its difference from Greek “equally twisted”. The saved reading
embeds IBM Plex Sans and Noto Serif with their complete SIL OFL notices.

## Two vīṇās: Sanskrit counts and a modern interpretation

Grosset's _Contribution à l'étude de la musique hindoue_ (1888), in _Mélanges
de philologie indo-européenne_, Bibliothèque de la Faculté des Lettres de Lyon 6,
is public domain. Eight whole page renderings, original PDF identity and exact
rendering parameters are retained in `public/sources/vina/manifest.json`.
The source is the National Library of India scan at
[Internet Archive](https://archive.org/details/dli.ministry.04243).
New transcriptions normalize the printed romanization to IAST; the editorial
brackets, target-list order and omissions are explained. English and contextual
word notes are new. No later English translation is bundled.

The numerical family is credited to
[Bernard Bel's mathematical discussion](https://bolprocessor.org/wp-content/uploads/Bharata-paper.pdf)
(1984; revised 1988 and December 2020), pp.4–11. It is linked, not bundled.
The implementation derives its own ratio chains and identifies the pure fourths,
fifths, free parameter and modern sound as extra assumptions. It does not claim
a scholarly consensus, a recovered twenty-two-frequency table or a rule for
present-day Indian performance. Details are in [the model note](docs/vina-model.md).

The portable reading verifies and embeds the existing IBM Plex Sans and Noto
Serif files and their complete OFL notices. Noto supplies whole Sanskrit words
in prose and reading text; typography does not depend on host-installed fonts.
The standalone SVG's visible text uses its embedded Plex font. Source pages
retain their historical commentary without adopting its wider claims.
