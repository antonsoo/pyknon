# Sources and third-party material

Pyknon's code, original diagrams and new English explanations are MIT licensed.
The following material retains its own provenance and terms.

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
