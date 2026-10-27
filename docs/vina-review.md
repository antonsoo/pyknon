# Two vinas: direct review

Reviewed 2026-10-26 in Los Angeles. Source, local production, a fresh installation
and portable files are recorded here; the [publication record](vina-publication.md)
separately identifies the public clone, hosted bytes and public browser journeys.

## What changed for the learner

Open `vina.html`. Keep the named matches in the Nāṭyaśāstra's two-instrument
argument, change the preparation, and hear different pitches satisfy them.
At a modern Sa of 220 Hz, the second-stage Ga→Ri match moves from
244.4444 Hz to 240.3184 Hz. Both preparations retain the successive matches.
At the upper parameter boundary, stages two and three merge; beyond it the
nominal third lowering raises pitch. The source count list still sums to 22.

This enacts a disclosed modern interpretation of the longer matching argument.
The separate [Grāma bench](https://antonsoo.github.io/grama/) teaches the
single-note lowering and starting-note distinction. Its equal-division
counterexample is not asserted to satisfy this room's additional consonance
and successive-match assumptions.

Nine readings in the source edition's romanized Sanskrit and new English,
twelve word notes and eight complete 1888 pages accompany the controls.
The second clause names Ga–Ni and Dha–Ri without adding “respectively”.
Testing an ordered pairing is kept distinct from asserting a corrupt text.
Bel's pitch pairing, exact modern fourths/fifths and the remaining freely
chosen parameter are identified explicitly. No ancient melody, instrument
shape, timbre or twenty-two-pitch frequency table is reconstructed.
[Source and derivation](vina-model.md).

[Desktop](assets/vina-desktop.png) and [375 px phone](assets/vina-phone.png)
show the actual final workshop. Both were visually reviewed, along with the
complete printed reading. The phone uses two vertical rulers sharing one
physical cents scale; the table remains keyboard-scrollable. Orange selection,
actual lower-octave Ni, full source pages and the matching lines remain visible.

## Source and independently installed build

Runtime source commit: `ba3d833073678404a7e032cd61f96eaaa65755ab`.
A clean `git archive` of that commit received a fresh `npm ci` and
`npm run check` under Node **24.21.0**. Lint, strict types, **28 tests** and
the build pass. All **78 file paths and bytes** match the Node **26.7.0**
checkout build. [Full build identity](vina-review/build-identity.json).
This is an independently installed archive, not a public remote clone or CI run.

The exact Grosset PDF is identified by length, SHA-256 and Archive MD5.
Poppler **24.02.0** re-rendered all eight complete pages byte for byte,
without cropping or retouching. [Source receipt](vina-review/sources.json).
The original PDF has malformed metadata that produces Poppler syntax warnings;
its identified pages nevertheless render reproducibly. All whole pages were
visually read. Bernard Bel's modern paper is linked and credited, not bundled.

```sh
python3 scripts/vina-sources.py --pdf /path/to/original.pdf
npm run verify:vina
```

The numerical oracle uses **70-digit Python Decimal frequency-ratio chains**,
imports no application model, and requires all **18,330 cases**. It covers
701 free preparations and four named preparations, two roots and thirteen
positions, including boundaries and intermediate lowerings. Repeated or missing
cases fail. This verifies the specified family, not the historical interpretation.

## Actual browser and portable-file review

Chromium **153.0.8010.12** and Firefox **155.0**, each at **1440 and 375 px**,
completed the full production journey. [Browser receipt](vina-review/browser.json).
The independent oracle also read **364 actual downloaded CSV rows** and
**728 actual rendered SVG groups** across 52 states, checking physical
coordinates as well as data attributes. [Geometry receipt](vina-review/geometry.json).
The corresponding CSV files are retained beside the receipt.

Each context operated preparations, all stages, intermediate and invalid
values, keyboard controls, history, real file reopening and malformed-input
refusal. It read every passage and word note, hashed all eight displayed source
blobs, panned an enlarged page with the keyboard, and played/stopped sound.
Actual native JSON, CSV, SVG, WAV and HTML downloads were saved. The standalone
HTML and SVG opened with JavaScript disabled. Embedded audio actually played;
the reading made no HTTP rendering requests. The selected comparison survived
reload and sharing. No page errors, CSP errors, document overflow or serious/
critical axe findings were recorded; this is not a complete accessibility audit.

The matching controller and complete **77-resource cache** preceded readiness.
The local origin then refused requests and browser networking was disabled.
All seven rooms reloaded, a source page was verified, and the new room saved
another complete illustrated reading. This establishes more than a warm-page
offline screenshot.

The independent artifact inspection checks the actual exported bytes:
eight original JPEGs, three original fonts and complete notices; embedded
JSON/CSV/WAV equal their native downloads; SVG metadata and coordinates agree.
The saved reading prints to **15 pages**. All eight original JPEGs are
recoverable byte for byte from the PDF, fonts are embedded, Sanskrit words
remain searchable, and 2,033 extracted words stay inside 25 pt page margins.
All pages were visually reviewed. Physical printing and tagged-PDF accessibility
are not established. [Artifact receipt](vina-review/artifacts.json).

```sh
npm run test:vina -- /tmp/pyknon-vina-review
python3 scripts/vina-oracle.py --browser /tmp/pyknon-vina-review/review.json
npm run verify:vina-files -- /tmp/pyknon-vina-review
uv run --python 3.12 --with numpy==2.4.4 python3 scripts/vina-wave-oracle.py /tmp/pyknon-vina-review/review.json
```

The WAV oracle measures **16 actual browser downloads** at 48 kHz, independently
predicting ratio-chain pitches and measuring interpolated zero crossings,
amplitude, fades and silence. Maximum observed frequency error is
**0.006493 cents** rounded up, within a 0.025-cent numerical tolerance.
Maximum full-PCM fit RMS outside 128-frame automation-edge windows is
**0.00001163** rounded up. Edge disagreement is separately bounded by one
render quantum's attack slope; whole-tone constant-phase residuals are retained
as diagnostics. Sample-exact cross-browser automation is not claimed.
[Audio receipt](vina-review/audio.json). No speakers or physical instrument were measured.

## Failure, recovery and upgrades

Both browsers completed these separate controlled-response checks:
- An actual completed older image response cannot replace the newly selected page.
- A valid but wrong JPEG is refused before display or illustrated export.
- A valid but wrong font blocks portable SVG/HTML; verified retries recover.
- Editing the comparison cancels a pending export and protects it against a delayed real file read.
- Pressing Stop changes no comparison settings and preserves a pending export.

[Integrity receipt](vina-review/integrity.json). These checks found and corrected
an image `hidden` override and a playback counter that wrongly canceled downloads.
The ordinary browser journey also holds and cancels an actual audio-resume promise.

An isolated Node 24 Vite fixture changed the authoritative manifest's page digest.
Both browsers received the watched virtual module's exact new JSON, refused
the page and export, then recovered an actual native reading after the original
bytes were restored. No direct public-JSON import or source warning occurred.
[Development receipt](vina-review/development.json).

Five controlled upgrades start from the actual six-room `b49326e` build:
held precache and wrong-but-HTTP-200 entry in both engines, plus a genuine late
old-worker reply in Chromium. The held request lasts 8.5 seconds. Existing
cached rooms remain operable while the origin refuses requests. After recovery,
the new matching complete controller is acknowledged automatically; an already
open old tab acknowledges the different edition and reloads explicitly.
All seven rooms work with browser networking disabled, and an illustrated
reading saves. Inspecting the retired worker does not recreate its cache.
[Upgrade receipt](vina-review/upgrade.json).

The worker now accepts an edition-specific activation retry after a complete
waiting-worker inspection. This addresses a reproduced complete-but-waiting
upgrade; no manual worker activation is part of the passing review.
Readiness continues to require the actual controlling edition and full cache.

## Retained examples

[Illustrated HTML, gzip](../examples/two-vinas-reading.html.gz) ·
[Fifteen-page PDF](../examples/two-vinas-reading.pdf) ·
[Editable JSON](../examples/two-vinas-comparison.json) ·
[Pitch CSV](../examples/two-vinas-pitches.csv) ·
[Font-embedded SVG](../examples/two-vinas-plate.svg) ·
[Modern comparison WAV](../examples/two-vinas-modern-comparison.wav).
[Exact example identities](vina-review/examples.json).

The HTML is compressed only for repository storage; decompress it to open it.
The app's native button saves uncompressed HTML. Review commands regenerate
the complete per-browser native file set; receipts preserve their identities.
Code and new educational content are MIT. Source print is public domain;
embedded fonts retain their complete OFL notices.
