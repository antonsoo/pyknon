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
