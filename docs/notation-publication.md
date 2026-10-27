# Musical signs: public publication

The [paired-sign desk](https://antonsoo.github.io/pyknon/notation.html#translation)
was published on 2026-10-27 with the owner's explicit authorization.
Source, static deployment, canonical bytes, actual browser behavior and remote
CI are recorded separately.

## What a public reader can do

Translate the four-note line with the printed lookup in reach. Keep or replace
the two copied shapes; blanks retain their time positions. Compare the same
sign in two alphabets and across two named tables. Choose what stays fixed in
the modern pitch comparison, inspect the original Greek descriptions and
complete pages, then keep an operable illustrated reading beyond the site.
[Direct review](notation-review.md#try-the-translation) ·
[Source, model and limitations](notation-model.md).

The desk does not silently resolve two functional names that share a sign pair.
Its modern reference constraints, sine tones, relative tunings and exercise
durations remain distinct from the nineteenth-century print and ancient text.

## Source and hosted bytes

The pushed source is `ff79c6270ecec1b9adc570f429a0edf2ec05f5ef`.
Its runtime inputs are those independently installed and checked at
`8678e7240c47477f0609a4ee2347247153eab019`; the later source commit adds the
review, actual screenshots and diagnostic scripts.
The [immutable review](https://github.com/antonsoo/pyknon/blob/ff79c6270ecec1b9adc570f429a0edf2ec05f5ef/docs/notation-review.md#try-the-translation)
was fetched from its pinned raw URL and matched the reviewed file byte for byte.

Static revision `e2a4d2d` is a normal fast-forward of `gh-pages`, over the
previous eight-room revision `20effb5d92b4e09971af933685e6e9856a8c4b54`.
The deployment copied the reviewed build and preserved older static assets.
All **102 canonical public files** matched the independently installed build
both [before](notation-review/hosted-before.json) and
[after](notation-review/hosted-after.json) the browser review. That includes
the worker, all nine entry pages, five new source JPEGs, retained manifests,
fonts, licenses and other rooms' current assets. All **56 older public content
paths** outside the new build also matched their previous bytes:
[retained assets](notation-review/hosted-retained-assets.json).
The branch's `.nojekyll` control file was preserved separately.

The complete edition is
`501590e24f3498786c7e3ba9534a2cff02246c8fd53cd195afe45727518af968`.
Its matching controller and all **101 cached resources** precede readiness.
The local [fresh-install build inventory](notation-review/clean-build.json)
records Node 24.21.0, lint, strict types, 36 tests and byte equality with the
reviewed checkout output.

## Browser and actual saved files

The [public browser matrix](notation-review/public-browser.json) completed in
Chromium 153.0.8010.12 and Firefox 155.0 at 1440 and 375 px. It follows root
navigation, keyboard writing, wrong and corrected lines, reverse translation,
all nine lookup entries, six Greek readings, five complete pages, keyboard
source panning, explicit copied links, live playback and local stop controls.
All four shared cross-table pairs are operated across the four contexts.

Actual native files were downloaded from each public context. Independent
inspection checks the JSON, two CSVs, two SVGs, WAV and illustrated HTML,
including corrected, equal-tuned, blank and alternative-reference settings.
The oracle imports no application model: it predicts ratios independently,
reads actual PCM zero crossings and verifies finite schedules, silence and
envelopes. Both functions remain in source captions and exports when the
printed pair is ambiguous.
[Public artifact inspection](notation-review/public-artifacts.json).

The actual illustrated reading retains five byte-identical source images,
three fonts, three full notices and seven native downloads. With scripts
disabled it played the embedded sound, downloaded an editable JSON and made
zero HTTP rendering requests. The actual Chromium download printed to
**16 pages**, retaining all five JPEGs at original dimensions, searchable
Greek text and no JavaScript. The printed comparison and real desktop/phone
captures were visually reviewed.

After complete worker takeover, all nine rooms reloaded with browser
networking disabled. The native continuation selected **σον** and vocal zeta
in the Seikilos photo, then returned through **Musical signs**. A complete
illustrated reading was saved offline. No application errors, document
overflow or axe WCAG A/AA/2.1 AA violations were recorded. This is not a
complete accessibility or physical audio/printing audit.

The public controlled-response checks also exercised a late source response,
wrong source bytes, a wrong font, retry, a delayed import and settings changed
during export. After the late response, the actual displayed image blob's
SHA-256 matched p370; a caption alone was not accepted as source identity.
The authentic eight-room interrupted-upgrade cases and the one unreproduced
controller stall are retained in the [local review](notation-review.md#failure-and-recovery).
The public matrix does not claim to recreate every returning user's worker state.

```sh
node scripts/notation-browser.mjs https://antonsoo.github.io/pyknon/ /tmp/pyknon-public
python3 scripts/notation-artifacts.py /tmp/pyknon-public /tmp/pyknon-public-artifacts.json
```

## Retained public examples

These are the actual public Chromium downloads, with the initial two copied
shapes retained. The HTML is gzip-compressed without content edits; decompress
it to open the independent reading. The app itself saves ordinary HTML.
[Exact example identities](notation-review/examples.json).
- [Illustrated reading, gzip](../examples/musical-signs-reading.html.gz)
- [Sixteen-page printable PDF](../examples/musical-signs-reading.pdf)
- [Editable translation](../examples/musical-signs.json)
- [Translation CSV](../examples/musical-signs-translation.csv)
- [Sign sheet SVG](../examples/musical-signs.svg)
- [Two-table CSV](../examples/musical-signs-tables.csv)
- [Two-table SVG](../examples/musical-signs-tables.svg)
- [Finite modern comparison WAV](../examples/musical-signs-modern-comparison.wav)

## Publication boundary

The source CI and source Pages workflow completed with failure and no job
steps. They are not passing validation evidence. The separate legacy Pages
build for the static branch completed; the canonical public comparisons and
browser runs independently establish the observed hosted result.
[Filtered publication status](notation-review/publication-status.json).
No registry release, source CI success, physical speaker measurement,
physical printer result or independent philological review is claimed.
