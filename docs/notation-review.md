# Musical signs: direct review

Reviewed 2026-10-27. This record covers the retained source, independently
installed production build, operated lesson and actual saved files. Public
source and hosted publication are separate claims.

## Try the translation

Open `notation.html`, also reached through **Musical signs** in the main
workbench and Seikilos reader. The initial four-note line deliberately copies
two shapes into the other alphabet. It changes two notes. Its wrong choices
remain visible and audible until the learner replaces them.
1. Select the second written slot. Compare its instrumental zeta with the
   printed pair for vocal zeta, then write sideways pi. The third slot still
   changes pitch; correct it independently or leave it as evidence.
2. Hear the given line followed by the actual written line. Erase a slot:
   the blank keeps its time position as silence. Reverse the translation
   while the paired lookup remains available.
3. In **One shape, two alphabets**, switch zeta between vocal and instrumental
   readings. The rational teaching model differs by 32:27, about 294.135 cents.
   Sigma supplies an identical-pitch control. Where two functions share a pair,
   both names remain; agreement does not identify a unique ancient function.
4. In **The sign stays. Does the middle?**, select iota. Hold its pitch, then
   hold both mesai at the reference. The source supplies named functions;
   the controls make the modern constraint explicit.

| Constraint at a Lydian mesē of 330 Hz | Lydian mesē / iota | Hypolydian mesē / iota |
| ------------------------------------- | ------------------ | ---------------------- |
| Keep the selected sign's pitch        | 330 / 330 Hz       | 247.5 / 330 Hz         |
| Keep both mesai at the reference      | 330 / 330 Hz       | 330 / 440 Hz           |

Four shared pairs are available across the two tables. Both plots use one
current logarithmic pitch scale. A dot identifies mesē; the actual regularized
vocal sign identifies the selected note. Coincident pitches remain separately
identified marks. Each context opens its own complete printed page; two source
bands remain when the selected pair has two functions.

Read six Greek selections with new English and twelve contextual word notes.
Inspect all five complete printed pages, including the title and apparatus.
The continuation selects **σον**, within **ὅσον**, and its vocal zeta in the
Seikilos reader's museum photograph. That reader retains its own modern pitch
and duration interpretation.

Keep the actual line in editable JSON, translation CSV, a font-embedded vector
sign sheet, finite WAV or one script-free illustrated reading. The cross-table
comparison has a separate CSV and readable SVG. Both vector sheets retain the
full editable state. Copying a link is explicit; ordinary editing leaves the
address unchanged.

[Desktop working line](assets/notation-desktop.png),
[375 px working line](assets/notation-phone.png),
[two-table comparison](assets/notation-tables.png),
[actual saved sign sheet](assets/notation-sheet.png) and
[printed comparison](assets/notation-printed-tables.png) were visually reviewed.
These show the operated production build and actual native downloads.

## Source and interpretation

The primary print is Alypius, _Eisagoge mousike_, in Karl von Jan,
_Musici scriptores graeci_ (Teubner, Leipzig, **1895**), pp367–370.
The title is PDF page 7; printed pp367–370 are PDF pages 469–472.
The [manifest](../public/sources/notation/manifest.json) identifies the original
41,700,417-byte PDF and every retained image, font and full license.
All five whole pages were visually read. The preparation uses Poppler at a
2200 px longest side and JPEG quality 88, without cropping or reconstruction.

The working span selects **nine** of the full table's eighteen entries.
Its regularized SVG strokes are new teaching diagrams, not extracted font
outlines or ancient manuscript facsimiles. The whole pages retain the printed
variants, square brackets, apparatus and Jan's editorial staff transcriptions.
The p367 bracketed heading and λάβδα/λάμβδα spelling difference remain visible.
The new English and contextual grammar have not received independent
philological review. No ancient Latin translation is invented.

The rational model uses conventional Pythagorean diatonic relations; the
alternative uses twelve equal semitones per octave. Modern 220/330/440 Hz
references, equal exercise durations, sine timbre and cross-table reference
constraints are disclosed teaching choices. They are not an ancient concert
pitch, tuning recipe, regional performance reconstruction or recovered melody.
The ethnic table names do not establish modern piano modes.
[Source, selected rows, derivation and limits](notation-model.md).

## Independently installed build

Runtime source commit: `8678e7240c47477f0609a4ee2347247153eab019`.
A clean archive received a fresh `npm ci` and `npm run check` under
**Node 24.21.0**. Lint, strict types, **36 tests** and the production build pass.
All **102 file paths and bytes** match the reviewed checkout build.
This is a fresh local installation, not a remote CI run.
[Build inventory](notation-review/clean-build.json).

The current complete offline edition is
`501590e24f3498786c7e3ba9534a2cff02246c8fd53cd195afe45727518af968`.
Its generated worker inventories **101 resources** across all **nine rooms**;
the worker itself is the remaining build file. The authoritative source JSON
is loaded through a watched Vite virtual module and its retained asset
identities are checked during the build.

```sh
npm ci
npm run check
npm exec vite preview -- --host 127.0.0.1 --port 4444 --strictPort
```

## Actual browser operation and portable files

Chromium **153.0.8010.12** and Firefox **155.0**, each at **1440 and 375 px**,
completed the lesson from root navigation through keyboard writing, correction,
reverse translation, all nine lookup rows, all six readings and all five
whole pages. The four contexts cover all four shared cross-table pairs.
Local stop controls cancel the shared finite player. Actual scheduled
oscillator pitches agree with the selected line and reference constraint.
[Browser receipt](notation-review/browser.json).

Each context saved actual JSON, both CSVs, both SVGs, WAV and illustrated HTML.
Further native files exercise corrected lines, equal tuning, blanks and both
cross-table constraints. The independent standard-library Python inspection
imports no application model. It checks source function lists, printed rows,
native state, SVG coordinates, full notices, actual PCM zero crossings, finite
duration, amplitude envelopes and timed silent slots.
[Artifact receipt](notation-review/artifacts.json).

Each saved reading contains the five byte-identical original JPEGs, three
identified fonts, three complete license texts and seven native downloads.
Its native JSON/CSV/SVG/WAV downloads agree with the separate saved files.
With JavaScript disabled, it made **zero HTTP rendering requests**, played
its embedded audio and saved an actual editable JSON file. The offline app's
reading matched the same native work saved online.

The actual Chromium download printed to **16 pages**. All five retained
JPEGs remain recoverable at their original dimensions; Greek text is
searchable and the PDF contains no JavaScript. The printed pitch plots have
equal vertical origins despite a wrapped functional-name caption. Screens and
the rendered printed comparison were visually inspected. Physical printing,
tagged-PDF accessibility and physical speaker output were not measured.

Both browsers reached the matching controller and complete cache before the
footer claimed readiness. With browser networking disabled, all nine rooms
reloaded, the native Seikilos continuation selected the actual syllable and
source photo, and the notation desk saved another complete illustrated reading.
No application errors, document overflow or axe WCAG A/AA/2.1 AA violations
were recorded. This is a bounded browser review, not a complete accessibility audit.

```sh
node scripts/notation-browser.mjs http://127.0.0.1:4444/pyknon/ /tmp/pyknon-notation
python3 scripts/notation-artifacts.py /tmp/pyknon-notation /tmp/pyknon-notation-artifacts.json
```

## Failure and recovery

A delayed default source response cannot replace a subsequently selected page.
A substituted source page is withheld and the stale image cleared. Wrong font
bytes withhold the portable export. Both source and export recover when the
expected bytes return. A delayed valid file import cannot overwrite a newer
manual choice; a changed line withholds an export already being assembled.
Retrying saves the actual newer line.

The interrupted upgrade uses an archive of the authentic eight-room public
static revision `20effb5d92b4e09971af933685e6e9856a8c4b54`.
Its entry and worker were compared with the canonical public bytes before
the upgrade exercise. [Previous-publication identity](notation-review/previous-publication.json).
The held-response and wrong-HTTP-200 cases are recorded separately from
ordinary first-install offline behavior.

In each browser, a held p370 response and a substituted valid p369 JPEG at the
p370 URL withheld new-edition readiness. The authentic old lesson remained
operable while the HTTP origin actually refused requests. After release or
retry, the complete new worker took control; the older tab offered an explicit
reload into the saved edition. All nine rooms then reloaded with both the
origin refusing requests and browser networking disabled. The new desk saved
an illustrated reading in that state. Its actual native tables, source images,
font/license identities and finite sound passed independent artifact inspection.
Deleting the current cache returned an incomplete inspector response without
recreating the deleted cache.
[Four upgrade cases](notation-review/upgrade.json) ·
[Actual offline downloads](notation-review/upgrade-artifacts.json).

One earlier repeat stalled waiting for the new controller after a rejected
source page. An instrumented repeat completed all four cases; the stall was
not reproduced or assigned a cause. The harness now retains registration,
cache and request diagnostics on that timeout. This record does not establish
that every possible browser scheduling failure is resolved.

```sh
node scripts/notation-upgrade.mjs /path/to/previous-static dist /tmp/pyknon-upgrade/review.json
python3 scripts/notation-artifacts.py --upgrade /tmp/pyknon-upgrade /tmp/pyknon-upgrade/artifacts.json
```
