# Ptolemy’s string examination

Reviewed 2026-10-24. **Equal lengths. Unequal notes.** is a fourth Pyknon
room, reading the instrument examination in _Harmonics_ I.8. The room is now [publicly hosted](https://antonsoo.github.io/pyknon/trial.html).
Local, source and public-host observations are recorded separately below.
The subsequent [phone navigation review](navigation-review.md) records the
header and narrow arithmetic-table correction, with its separate build inventory.

## What the learner can do

Compare equal halves, then the right-hand quarters of the same chosen string.
The heavy outer quarters pass the first test and fail the second. A repeating
mirrored mass pattern passes both, then fails our additional eighths test.
Change the mass contrast, inspect exact first-mode shapes, listen successively
or together, and compare a control made from two identical A tones.

Four explicit mass profiles, thirteen supported contrasts, two modern reference
pitches and three comparisons have bounded shareable state. The first two
comparisons belong to Ptolemy’s examination. The mass profiles, modern wave
equation, numerical frequencies, sine tones and extra eighths test are our
teaching experiments. The [model](trial-model.md) gives the derivation and limits.

Six Greek / Wallis Latin / new English excerpts explain bisection, equal pitch,
the response to a failed trial, comparable length and tension, and the instrument
heading. Word and grammar notes connect them to the experiment. Greek Η maps
to Latin G in Wallis’s diagram; Λ maps to L. The clauses are explicitly excerpts,
not a continuous chapter translation. Three questions check these distinctions.

Six complete 1682 edition pages retain the surrounding text, apparatus and
Wallis’s bridge-surface discussion. Source zoom and keyboard panning work
without opening another site. Opening a phrase’s source preserves focus on
the scrollable source viewport. The modern drawing shows only the supports
actually used; unused ruler marks remain ticks.

## Independent physics and actual audio

```sh
npm run check
npm run verify:trial
npm run test:trial -- /tmp/pyknon-trial
uv run --python 3.12 scripts/trial-oracle.py /tmp/pyknon-trial/browser.json
uv run --python 3.12 scripts/trial-audio-oracle.py /tmp/pyknon-trial/browser.json
```

The Python reviewers pin NumPy 2.4.2 and SciPy 1.17.1 in their script metadata.
They are optional development tools, with no runtime site dependency. Python
3.12 is selected explicitly to use supported binary wheels.

The application transfers the exact sinusoidal solution through each constant
density cell and bisects an unwrapped first-mode phase. The independent checker
instead solves a mass-lumped grid eigenproblem at 1,024 and 2,048 intervals,
then extrapolates frequency. It imports no app code or phase-transfer formula.

[Core receipt](trial-oracle.json): **312 settings**, **624 frequency comparisons**
and **23,920 mode points**. Maximum frequency difference is
`2.077811132039642e-7 Hz`; maximum normalized mode difference is
`7.737705498556124e-8`. [Drawn/downloaded receipt](trial-drawn-oracle.json):
**108 actual browser/CSV cases**, **216 frequency comparisons**, **3,680 drawn
mode points**; maximum frequency difference `1.7492720871814527e-7 Hz`.

[Signal receipt](trial-audio.json): **148 native downloaded WAVs** from four
browser configurations. Pure-tone PCM zero crossings are checked against the
independent eigenvalues. Simultaneous outputs are fitted against the frequencies
measured in that browser’s successive-tone PCM, after those frequencies have
passed the independent check. Both voice amplitudes, identical-tone controls,
finite durations, peak levels and silence outside the planned intervals are
checked. Maximum measured pitch error is **0.001730 cents**, below 0.025;
maximum simultaneous fit residual is **0.000028682 RMS**, below 0.0001.
This measures generated samples, not speakers, audibility thresholds or a
physical ancient instrument.

## Browser, source packet and print

[Browser receipt](trial-browser.json) retains the complete build inventory and
file hashes. Chromium and Firefox at **1440 and 375 pixels** exercise native
keyboard movement with retained focus, all profile/comparison choices, both
modern references, play/stop, all six readings and source pages, actual source
zoom and keyboard pan, three reading questions, browser history, shared state
and invalid settings. There are no observed page errors, CSP violations or
external subresource requests. Automated accessibility scans report zero
violations; this is not a complete assistive-technology audit.

Each configuration downloads actual HTML, CSV, WAV and SVG files, opens the
HTML from disk with networking disabled, decodes all source images and its
Greek font, and starts the embedded audio through a keyboard action. Embedded
CSV, WAV and SVG downloads match the separately downloaded bytes. The same
HTML saves after the origin destroys its sockets, with `navigator.onLine`
still true. All four rooms remain navigable and reloadable.

A fresh page with no working service worker receives **HTTP 200 with page 34
in place of page 35**. Both engines reject the source hash, restore the save
button and produce no partial download. Correct bytes then produce a complete
packet. This is a controlled local substitution, not an observed public-host
failure. The exporter verifies every included scan and font.

The retained real files are [HTML](../examples/string-trial-reading.html),
[eleven-page PDF](../examples/string-trial-reading.pdf),
[WAV](../examples/string-trial.wav), [CSV](../examples/string-trial.csv) and
[SVG](../examples/string-trial.svg). The saved selection is the repeating
profile’s extra eighths, heard successively at the 220 Hz modern reference.

```sh
uv run --python 3.12 scripts/trial-print-review.py /tmp/pyknon-trial/chromium-1440/reading.pdf
python3 scripts/trial-source-review.py --pdf /path/to/identified-wallis-1682.pdf
```

[Print inspection](trial-print.json) confirms all six original JPEGs are
unchanged inside the PDF, one per source sheet, with their captions and hashes
on the same sheet. There are no empty sheets, and selected Greek/Latin text
is extractable. The first five sheets contain the experiment and readings;
the last six are full edition pages. The PDF is a browser print, without a
claim of a tagged critical edition. All pages were also inspected visually.

[Source reproduction](trial-source-review.json) re-renders the identified
complete PDF and matches all six JPEGs. The full source and every selected
phrase were visually inspected against this print. See [rights and
normalizations](../THIRD_PARTY.md#ptolemys-instrument-examination-wallis-1682).

## Offline control and upgrades

[Controller receipt](trial-controller.json) reproduces the earlier false-ready
case in both engines: the matching complete worker is activated, but the
document has missed the initial activation claim. The old helper reports
readiness while an actual offline reading download fails. The current helper
requires the matching complete worker to control the page, requests another
claim when necessary, observes an already-activating worker, and then saves the
complete reading offline. The harness suppresses only the initial activation
claim to isolate that condition; its intervention is recorded explicitly.

[Upgrade receipt](trial-upgrade.json) starts from the actual previous
three-room source build, `5c711ab`. Both browsers hold the new entry’s precache,
and separately substitute an old entry with HTTP 200. Wrong bytes cannot
activate a new edition; readiness follows a complete valid retry. Chromium
also receives a genuine old-worker reply after the new result and retains
current readiness. Firefox can load the previously unknown entry uncontrolled,
so there is no old controller inspection to delay in that case; no Firefox
late-reply claim is made.

Each completed upgrade reloads offline, saves the new reading, visits all four
rooms, uses the enharmonic controls, inspects Seikilos’s final syllable and plays
the octave comparison. The octave’s actual offline HTML export remains
byte-identical to the earlier retained example. Pages publication preserves
older hashed assets for already-open entry documents.

```sh
node scripts/trial-controller.mjs /path/to/before-controller-fix/dist /tmp/trial-controller/report.json
node scripts/trial-upgrade.mjs /path/to/previous-three-room/dist /tmp/trial-upgrade/report.json
```

The browser reviewer serves a frozen `dist` itself. Do not rebuild it during
that review. It also accepts an external base URL; add `development` as the
next argument for the Vite development server. `--quick` omits most of the
bulk WAV corpus while retaining the learning, source, native-file and offline
workflows. Hosted offline checks disable browser networking, separately from
the local origin-disconnection check.

## Clean checkout and development

A fresh local Git clone of `99a2f15`, installed with `npm ci` under
**Node.js 24.21.0**, passes lint, strict typecheck, 15 tests and the production
build. All **39 output files** match the browser-reviewed production bytes,
and the fresh tree remains clean; [build receipt](trial-clean-build.json).

The complete learning/source/native-file workflow also runs against Vite
development in both browsers at both widths. All four native packet formats
and the sixteen selected WAVs match production; [development receipt](trial-development.json).
No service worker is installed in development. The clean clone’s documented
`npm run dev` command and default `http://127.0.0.1:4329/pyknon/` URL were
checked separately under Node 24 in all four configurations: styled SVG,
responsive mode, no worker registration, and actual saved HTML matching the
production packet; [clean quickstart receipt](trial-clean-development.json).

## Public publication

Source `872e046` and Pages `1e9d4ea` publish the reviewed four-room edition.
[All 39 canonical public files](trial-hosted-files.json) match the reviewed
build, including the worker. The directory entry is checked before and after
the inventory, without query-string cache busting. All seven earlier hashed
assets from the previous three-room build remain byte-identical.

[Four hosted browser workflows](trial-hosted-browser.json) repeat the learning
controls, readings, six source scans, playback, questions, history, shared
state, malformed fields, source zoom and keyboard pan. Actual HTML, CSV, SVG
and WAV exports match the local files. All **148 hosted WAVs** are byte-identical
to the independently measured local corpus. Native saved packets decode their
images and font and play embedded audio without networking. All four app rooms
remain usable with browser networking disabled. No page errors, external
subresource requests, CSP violations or automated accessibility violations
were observed. The controlled wrong-source and missed-controller cases remain
local experiments, rather than claims that the public origin served bad bytes.

```sh
node scripts/trial-hosted.mjs /tmp/pyknon-trial-hosted /path/to/previous-three-room/dist
```

No registry package release is made; this is a source and GitHub Pages update.
