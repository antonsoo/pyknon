# Seikilos reading review

This checkout adds a complete song-reading workflow to Pyknon's existing
tetrachord experiment. The earlier page demonstrated theoretical intervals;
it had no surviving melody, syllable-to-note reading or inscription viewer.
The new `song.html` connects all four verses to the actual museum photograph,
modern playback and saved reading material.

```text
Choose a Greek syllable
          |
          +--> Locate its letters and pitch signs in the photograph
          +--> Read its word, English meaning and language note
          +--> Hear its notes alone or within the verse
          +--> Save the reading and source image together
```

The distinctive cases are three ascending notes on **φαί**, the duration marks
over **σον** and **ζῇς**, and the final reversed gamma over **τεῖ**. The last case
includes Monro's 1894 correction, while explicitly distinguishing his rhythm
from the modern transcription played here. The source record is
[THIRD_PARTY.md](../THIRD_PARTY.md); it identifies every photograph, interpretation,
license and bundled-image hash.

## Try the reviewed implementation

Run the README quickstart, then open:
- `http://127.0.0.1:4329/pyknon/song.html?s=3&a=220&pace=150#reader`
- `http://127.0.0.1:4329/pyknon/song.html?s=28&a=220&pace=150#reader`

The first selects the three-note syllable. The second selects the corrected
ending. Use **Hear syllable**, **Play verse** or **Play whole song**. Changing
selection, pitch or pace cancels the current playback. Stop also wins over an
audio permission request that has not yet completed.

The [saved HTML reading](../examples/seikilos-reading.html) is a real browser
download with all four verses, their pitch tables, seventeen word entries and
the selected photograph embedded. It opens without network requests. The
[four-page PDF](../examples/seikilos-reading.pdf) is an actual Chromium print
of that download. The [fourth-verse WAV](../examples/seikilos-verse-4.wav) is a
real export at starting A = 220 Hz and 150 short units per minute.

## Reviewed source and build

Implementation: `339df12`; source-selection refinement: `92c09d9`;
phone contour refinements: `d7aa33a` and `6e386d3`.
The final checks used a fresh archive of `6e386d3` and a fresh `npm ci`, with
Node `v26.7.0` and npm `12.0.1`. Subsequent documentation commits do not change
the runtime inputs. The [build receipt](seikilos-build.json) records all twenty
file hashes. Every clean-build file matched both the workspace build and bytes
served by `npm run preview`; the directory entry URL also matched `index.html`.

| Check                                                                               | Result                                                                                        | Evidence                                                                             |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `npm ci` and `npm run check`                                                        | Clean install, lint, strict typecheck, 7 tests and build passed                               | [Build record](seikilos-build.json)                                                  |
| `npm run verify:song`                                                               | 8 pitch/pace settings, 1,480 comparisons to a separately authored score                       | [Score record](seikilos-score.json)                                                  |
| `npm run test:song -- /tmp/pyknon-song-review/browser.json`                         | Chromium and Firefox, each at 1440 and 375 px; every syllable selected                        | [Browser record](seikilos-browser.json)                                              |
| `python3 scripts/song-oracle.py /tmp/pyknon-song-review/browser.json`               | 72 WAVs, 666 measured tones; maximum error 0.004898 cents, tolerance 0.02 cents               | [Audio record](seikilos-audio.json)                                                  |
| Existing `npm run verify:ratios`                                                    | 18 settings and 288 comparisons passed                                                        | Existing oracle rerun on the final source                                            |
| Existing `npm run test:browser` and `scripts/audio-oracle.py`                       | 4 original-workbench workflows at `92c09d9`; 38 WAVs, 304 tones; maximum error 0.008146 cents | [Browser](seikilos-tetrachord-browser.json), [audio](seikilos-tetrachord-audio.json) |
| `node scripts/dev-check.mjs http://127.0.0.1:4329/pyknon/` while `npm run dev` runs | Both pages in both browsers at both widths; no CSP violations                                 | [Development record](seikilos-development.json)                                      |

The audio checker independently reads Chinasaur's public-domain LilyPond score,
including its relative pitch notation, inherited durations and slurs. Its
syllable groups and timings agree with the app's sign-based model and with
D'Angour's transcription as visually inspected. The PCM checker measures
interpolated zero crossings and checks duration, amplitude, attack/release
edges and silent gaps. It does not obtain expected frequencies from app code.
This establishes the implemented modern realization; it does not certify a
historical performance.

The original tetrachord browser/audio receipts precede two song-contour layout
changes. The tetrachord and audio implementation did not change between those
receipts and the final source. The new song browser/audio receipts, development
checks and byte comparisons cover the final source.

The browser checks also exercise a rejected audio resume, cancellation during
a delayed resume, automatic advancement across all four verses, keyboard
focus retention, shared-link landing, no horizontal document overflow,
accessibility audits and standalone HTML. They disable the actual HTTP origin
and then navigate between the two pages, play notes and export another reading.
The saved image's hash must match the bundled museum JPEG exactly. There were
no page exceptions or external requests.

The full sets of WAVs and intermediate studies are generated under the chosen
output directory when the scripts run. Their hashes remain in the receipts;
only the representative exports linked above are committed. A Poppler
`pdftotext` inspection recovered all sixteen distinct Greek words (the article
τὸ occurs twice in the seventeen-word song), the photographer and the license
from the four-page PDF.

## Visual inspection

- [Desktop reading](assets/seikilos-desktop.png)
- [375px reading](assets/seikilos-phone.png)
- [Landing page](assets/seikilos-landing.png)
- [All 29 photograph selections](assets/seikilos-source-selections.png)

These are actual browser screenshots and were opened for visual review.
Desktop keeps the pitch contour beside the source; the phone stacks them and
wraps the syllable controls. The source-selection contact sheet caught several
initial rectangles that were shifted into neighboring letters; those were
corrected, and the rhythm marks and complete final sign are included in the
reviewed regions. The pale rectangle is an approximate teaching region, not an
epigraphic character boundary. The final selection sheet and reader screenshots
show the corrected placements. The photographed material and its annotated
presentations retain the museum's CC BY-SA 4.0 license; see the source credits.
The phone contour uses larger labels with enough vertical space between tick
numbers and the axis title; both browser engines were checked for overlap.

## Development-server correction

During the documented quickstart, the original tetrachord page appeared in the
browser's default serif font with black text. Chromium and Firefox both
reported a `style-src-elem` violation for inline styles: Vite's injected CSS was
blocked by the page's `style-src 'self'` policy. The song page already used an
HTML stylesheet link and did not have that failure.

Commit `21a10ee` moves the main page's stylesheet to an HTML link too. Its policy
is unchanged. The final eight development checks show the intended Plex font,
`rgb(44, 37, 56)` body text, functioning controls and no CSP violations.

## Limits and handoff

This is one sourced song, not a survey of ancient world music. The existing
Archytas experiment remains a separate theory lesson. There is no inferred
instrument, sung pronunciation, regional attribution or Latin source for this
inscription. Pitch reference, equal temperament, pace and tone articulation
are explicitly modern choices. Source-image regions and language notes merit
specialist review; the app supplies the original evidence so they can be checked.
Mobile tests use desktop browser engines at a phone width; they do not certify
physical iOS devices or physical speaker output.

**Published:** source `764377c`, Pages `e236d25`. All twenty canonical public
files and the directory entry matched the reviewed build byte for byte;
see [the publication receipt](seikilos-publication.json). The earlier hashed
assets remain available for existing tabs. Earlier publication receipts in
this repository still describe the earlier tetrachord edition.

The [hosted browser receipt](seikilos-hosted.json) covers Chromium and Firefox
at 1440 and 375 pixels. It verifies the final-sign shared link, keyboard playback
and stop, a fourth-verse WAV byte-identical to the locally measured export,
and an HTML reading byte-identical to the reviewed example. After disconnecting
the browser, both app pages, the source photograph and playback still work.
No page exceptions or external requests occurred.

Reproduce with `node scripts/song-hosted.mjs`. The static build command is
`npm run build`, output directory `dist/`; it includes both `index.html` and
`song.html` and the integrity-checked offline worker. The public reader is at
<https://antonsoo.github.io/pyknon/song.html?s=3&a=220&pace=150#reader>.

Suggested repository description: **Hear ancient Greek tuning and read the
Seikilos song against its surviving inscription.**

Suggested topics: `ancient-greek`, `music-theory`, `epigraphy`, `web-audio`,
`education`, `digital-humanities`, `offline-first`.

Implementation commits:

```text
6e386d3 fix: separate the contour axis labels on phones
d7aa33a fix: keep contour labels readable on narrow screens
92c09d9 fix: include the complete rhythm marks in source selections
d7818af test: verify the song against a separate score and native audio
339df12 feat: read and hear Seikilos against the surviving inscription
21a10ee fix: load development styles under the site security policy
```
