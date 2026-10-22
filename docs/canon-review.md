# Six tones and an octave: review

The new room connects a specific ancient numerical proof to listening and
language reading. It follows _Sectio canonis_ IX and XIV, transmitted under
Euclid's name. It extends the existing tetrachord and song workbenches without
changing either musical reading.

```text
Select interval count, modern reference and sound
              |
              +--> Two pitch routes and an enlarged detail
              +--> Original integer and its one-eighth increase
              +--> Successive tones, beating, walking or unison control
              +--> Greek / Latin proof with a complete printed page
              +--> Shared link, numerical CSV, PCM WAV or illustrated reading
```

## Try the result

From this checkout, `npm ci` then `npm run dev`. Open
`http://127.0.0.1:4329/pyknon/canon.html?n=6&a=220&sound=beat#canon`.

Press Play. Switch Sound to the identical-tone control, then compare the
selected pair one after another. Step back through the seven source numbers.
At step zero both routes coincide; the discrepancy accumulates with each
9:8 interval. Change the starting reference: the cents difference stays the
same, while the beat rate in hertz changes.

| Route at step six, starting at 220 Hz |        Frequency | Cents above start |
| ------------------------------------- | ---------------: | ----------------: |
| Six 9:8 tones                         | 446.003036499 Hz |    1223.460010385 |
| Six equal octave divisions            |           440 Hz |              1200 |

The source's final integer, 531441, exceeds twice 262144 by 7153. The ratio
to the octave is 531441/524288, commonly called the Pythagorean comma. Equal
200-cent steps change the interval premise; they do not refute this proof.

The reading presents all of XIV in four aligned Greek, Latin and English
steps. The bracketed Greek `[ἐστι]` remains bracketed. Source-page selection
and reading-sentence selection are independent and retained in shared URLs.
Four word notes explain the ratios and comparison language. Complete pages
170–175 include the numerical proof and its musical premises, XII and XIII.
[Source decisions and hashes](../THIRD_PARTY.md#sectio-canonis-edited-and-translated-by-menge-1916).

## What was actually checked

Implementation: `745cf81`; listening-control refinement: `4fd04e5`.
The final build was made from a fresh archive of `4fd04e5` with a fresh
`npm ci`, using Node v26.7.0 and npm 12.0.1. Documentation added after that
commit does not change the runtime inputs. `npm run build` produces `dist/`.

| Check                             | Result                                                                                                                                             | Evidence                                      |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Clean install and `npm run check` | Lint, strict typecheck, 11 tests and production build passed                                                                                       | [Build receipt](canon-build.json)             |
| Independent exact arithmetic      | 21 progression rows and 84 sound plans; 60-digit Decimal roots for equal steps; exact comma and integer excess                                     | [Mathematics](canon-mathematics.json)         |
| Actual browser controls           | Chromium and Firefox, each at 1440 and 375 px; all steps, reading sentences, word notes and source pages exercised                                 | [Browser receipt](canon-browser.json)         |
| Rendered pitch positions          | Four workflows, seven selections each, fourteen points checked against an independently calculated pitch axis; screen-coordinate tolerance 0.05 px | [Browser receipt](canon-browser.json)         |
| Accessibility and layout          | Twelve WCAG A/AA audits with zero violations; no horizontal document overflow; keyboard focus preserved during playback                            | [Browser receipt](canon-browser.json)         |
| Cancellation                      | All scheduled voices cancelled in every sound mode; Stop also wins during a delayed asynchronous audio resume                                      | [Browser receipt](canon-browser.json)         |
| Native exported PCM               | 170 WAVs; 462 pure-tone measurements; maximum error 0.007062 cents, tolerance 0.02 cents                                                           | [Signal analysis](canon-audio.json)           |
| Simultaneous tones                | Both independently measured frequency components present at expected amplitudes; maximum fit residual RMS 0.000019366                              | [Signal analysis](canon-audio.json)           |
| Final-step beats                  | Analytic-envelope maxima measured independently; maximum beat-rate error 0.001272 Hz, tolerance 0.02 Hz                                            | [Signal analysis](canon-audio.json)           |
| Offline                           | HTTP origin disabled; all three rooms navigated, six scan hashes checked, audio played and a complete illustrated reading exported                 | [Browser receipt](canon-browser.json)         |
| Standalone reading                | Embedded scan hashes match source files; no external requests; all four proof steps; phone layout checked                                          | [Browser receipt](canon-browser.json)         |
| Documented development server     | All three pages, both browsers, both widths; styles, controls and CSP checked                                                                      | [Development receipt](canon-development.json) |
| Local served bytes                | All 29 clean-build files match workspace and local preview bytes; directory entry matches index.html                                               | [Build receipt](canon-build.json)             |

The simultaneous-tone fit uses frequencies measured from each browser's
separate successive-tone export, after those frequencies pass the source
comparison. This accommodates Firefox's small native oscillator frequency
offset without confusing it with waveform distortion. The beat-rate check
independently measures envelope maxima; it is not a readback of scheduling
parameters. Signal analysis was repeated in a fresh Python 3.12 environment
with the pinned NumPy requirement, producing identical results.

The existing workbenches also underwent their real browser journeys after
the new navigation and offline edition were introduced. The tetrachord
review exported 38 WAVs and measured 304 tones, with maximum error 0.008146
cents. The song review exported 72 verses and measured 666 tones, with
maximum error 0.004898 cents. Both retained their original independent source
oracles. These regressions used `745cf81`; the subsequent control placement
change affects only the new room's layout.
- [Tetrachord browser receipt](canon-tetrachord-browser.json) and
  [PCM analysis](canon-tetrachord-audio.json).
- [Song browser receipt](canon-song-browser.json) and
  [score/PCM analysis](canon-song-audio.json).

## Inspect and keep the result

The actual Chromium downloads are retained:
- [Illustrated HTML reading](../examples/canon-six-tones-reading.html), with
  all six unchanged JPEGs and the Greek font embedded.
- [Ten-page A4 PDF](../examples/canon-six-tones-reading.pdf), printed from
  that download; each complete scan stays on its own page.
- [Seven-row numerical CSV](../examples/canon-220-numbers.csv).
- [Beating pair](../examples/canon-220-beating.wav),
  [identical-tone control](../examples/canon-220-control.wav), and
  [successive pair](../examples/canon-220-successive.wav), all at the
  220 Hz reference and selected step six.

[Artifact hashes](canon-artifacts.json) identify the retained native downloads
and screenshots. The full generated WAV corpus is reproducible with the
commands below; the receipts retain every measured result and hash rather
than adding all 170 WAVs to the repository.

Screenshots were opened and visually inspected:
[desktop experiment](assets/canon-1440.png),
[phone experiment](assets/canon-375.png),
[desktop source reading](assets/canon-reading-1440.png), and
[phone source reading](assets/canon-reading-375.png).
The diagram turns vertical on phones. Listening controls precede it, so
Play and Stop stay within reach at the shared entry. The source image can
be opened at full size; the phone version does not pretend a whole scanned
page remains legible at thumbnail scale. Printed pages 1–3 and the final
source page were inspected for wrapping, clipping and missing content.

## Reproduce

```sh
npm ci
npm run check
npm run verify:ratios
npm run verify:song
npm run verify:canon
npm run test:canon -- /tmp/pyknon-canon-review/browser.json
python3 -m pip install -r scripts/requirements-audio.txt
python3 scripts/canon-audio-oracle.py /tmp/pyknon-canon-review/browser.json
```

Install the Python requirement in a virtual environment if the system Python
requires one. The browser script serves the existing `dist/`; do not rebuild
it during a run. It requires Playwright's Chromium and Firefox binaries, as
used by the existing project checks. The website itself has no Python or
runtime package dependency.

## Limits and publication

This is a modern sine-tone realization of a transmitted theoretical argument.
It does not establish authorship, an ancient absolute pitch, instrument timbre
or historical performance. The twelve-fifths connection, cents and beating
are modern explanations added here. No physical speaker or human hearing
measurement is claimed. The service worker cannot guarantee that a browser
will never evict its cache; saved HTML and WAV files provide separate copies.

The work is committed locally. **It has not been pushed or deployed.**
The byte comparison above concerns the local production preview, not the
public Pages site. The deployable static site is built with `npm run build` into `dist/`,
with the existing `/pyknon/` base path. No new runtime dependency or
package release is needed.

Suggested repository description: “Hear ancient Greek music theory, read its
Greek and Latin sources, and inspect a surviving song.” Topics:
`ancient-greek`, `music-theory`, `microtonal`, `web-audio`, `education`,
`euclid`, `digital-humanities`.
