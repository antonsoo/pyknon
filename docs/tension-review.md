# Weighted strings: direct review

Reviewed 2026-10-25. The local source, independently installed build, native files,
and browser experiments are recorded here. Publication is a separate step.

## What a learner can do

In `tension.html`, hear the claim in Nicomachus's _Harmonic Manual_ 6, compare
its four hanging weights with an ideal string model, and replace the weights
without overwriting the source numbers. At equal loaded vibrating length and
linear density, 12 against 6 yields a √2 frequency ratio: 600 cents, while the
account calls it an octave. Exact repairs use 32/3, 27/2 and 24 against 6.

Eight Greek/Latin/English readings and ten word notes put the equality
conditions, participles, named ratios and source inference beside the experiment.
Eight complete printed pages preserve Jan's apparatus and Meibom's own Latin.
The difference between Greek “equally twisted” and Latin “equally heavy” remains
visible. The model is not a reconstruction of the shared peg, free hanging
endpoints, hammer sound or an ancient performance. No physical instrument was
measured. See [the model and source decisions](tension-model.md).

Actual screenshots: [desktop](assets/tension-desktop.png) and
[375 px phone](assets/tension-phone.png). The first shows a repaired octave load
24 while retaining source 12; the phone shows the original loads. Both were
visually inspected. The light listening desk keeps the orange selected string,
equal vibrating lengths, original-load outlines and nearby playback controls
legible. The header wraps without losing the sixth room. The full source viewer,
word controls and independent reading were also reviewed directly.

## Fresh source and installed build

A new local clone at `65540c0` was independently installed with Node **24.22.0**:

```sh
npm ci
npm run check
npm run verify:tension
```

Lint, strict TypeScript, **25 tests** and the production build passed. All **65
output files** matched the checkout byte for byte, including the generated worker.
The build command is `npm run build`, output `dist/`, base `/pyknon/`.
[Complete identity receipt](tension-review/build-identity.json).
Documentation and review programs do not participate in the input edition hash.
No CI result is asserted by these local commands.

The exact original PDFs were independently downloaded, hashed and mechanically
rendered with Poppler 24.02.0. All eight bundled JPEGs reproduced byte for byte:

```sh
npm run verify:tension-sources -- --jan /path/to/musiciscriptores01jank.pdf --meibom /path/to/bub_gb_JgtAAAAAcAAJ.pdf
```

Omit both arguments to download the identified originals. The manifest retains
both PDF hashes, byte counts, exact page mappings and JPEG identities. The
rendering includes complete printed pages and does not retouch scan defects.

## Independent mathematical and audio checks

`npm run verify:tension` pipes generated cases to a Python oracle that imports
no application code. It requires all **250 cases** to arrive, so an interrupted
generator cannot yield a successful partial review. Its **21,000 checks** cover
exact `Fraction` load/target ratios, 60-digit `Decimal` square roots and logarithms,
all five sound plans, both pitch references, the three repairs and boundary loads.
A separately assembled 256-cell string's Rayleigh quotient also checks the
frequency scaling. This checks the implementation of the stated ideal model;
it does not measure a physical string or establish the literary story.

```sh
npm run test:tension -- /tmp/pyknon-tension-review
uv run --python 3.12 --with numpy==2.4.4 python3 scripts/tension-wave-oracle.py /tmp/pyknon-tension-review/review.json
```

The second command checks the **actual PCM samples in 24 downloaded WAV files**,
not only the application's planned frequencies. It independently predicts the
sine frequencies and complete attack/release envelopes, fits phase in 100 ms
windows and checks phase drift, amplitude, initial/final silence and recorded
live oscillator frequencies. Browser phase and finite accumulator precision are
allowed; the observed maximum frequency offset was **0.000636 Hz** (rounded up),
within the explicit 0.005 Hz numerical tolerance. Maximum sample-fit RMS residual
was **0.0000453**, below 0.00006 on the normalized amplitude scale. Those are
numerical signal checks, not perceptual thresholds or historical measurements.
[Complete audio receipt](tension-review/audio.json).

## Actual browser operations

The production build was exercised in **Chromium 153.0.8010.12 and Firefox 155.0**,
each at **1440 px and 375 px**. [Complete browser receipt](tension-review/browser.json).
Each configuration completed:
- Native keyboard range changes, exact fraction entry, all original/repair
  actions, invalid-weight retention and browser Back restoration.
- Fixed source targets while replacement loads changed; all five listening
  choices, actual live scheduling and immediate Stop; native WAV downloads.
- All eight selected passages, both witness buttons, all ten word notes,
  every full page, 400% zoom and keyboard scrolling. Each actually displayed
  blob's JPEG bytes matched its manifest identity.
- Real JSON, CSV, font-embedded SVG and complete HTML downloads; JSON reopening;
  malformed input retaining the prior experiment; share/reopen behavior.
- Independently opened disk HTML with all exact embedded JPEGs, fonts, playable
  embedded audio and **no HTTP rendering requests or script**.
- Zero page errors, zero axe violations and no horizontal page overflow.

Repeated Firefox source history exposed an intermittent native `img.decode()`
rejection while a live image's source was being replaced. The viewer now decodes
a separate image for each request and commits only the current verified page.
**40 subsequent Firefox Back/Forward source cycles** passed, followed by the full
four-configuration review. A superseded decode never replaces the current page.

The actual SVG review additionally operated both repair buttons and reset in all
four browser configurations, then checked 20 displayed views at original, repaired,
minimal, maximal and fractional loads. An independent Python calculation checked
480 actual load-bar heights, pitch positions and fixed string lengths.
[Rendered coordinates](tension-review/rendered.json).

The complete inventory contains **64 cached resources**, including all six entry
pages, sources and fonts. The worker itself is the 65th build file. With the local
origin destroying connections and browser networking disabled, each configuration
visited all six rooms, changed and reloaded an exact fractional load, opened a
Latin source page and saved another complete illustrated reading.

The sixth header link was separately checked at **375, 621, 768, 820, 1024 and
1440 px**, in both browsers, from all six rooms: **72 configurations**. Each used
an actual keyboard route to Weighted strings. This layout review blocked workers;
its claim is separate from the cache lifecycle experiments.
[Navigation receipt](tension-review/navigation.json).

The existing Aristoxenus rhythm reader was rerun in both engines and sizes on
the six-room build: real rhythmic operations, scheduled audio, its Greek/Latin
readings, native files and origin-disabled six-room navigation passed. Its
original historical review remains a record of the earlier five-room edition.

## Incomplete and existing editions

```sh
node scripts/tension-integrity.mjs /tmp/pyknon-tension-integrity.json
npm run test:tension-upgrade -- /path/to/old-five-room/dist /tmp/pyknon-tension-upgrade.json
```

Both browsers received a held source page for **8.5 seconds**, and separately a
valid JPEG of a different printed page under the expected URL. The incomplete
edition never became ready; the substituted page stayed hidden, its standalone
reading was refused and no incomplete worker claimed the page. Correct bytes
and an online retry recovered the page and the complete edition.
[Integrity receipt](tension-review/integrity.json).

The upgrade review used an actual separately built five-room source at
`e7238f1`, keeping old tabs and controllers open. It held the new entry beyond
8.5 seconds, then separately returned a valid old entry with HTTP 200 in place
of the new entry. Neither was accepted as a complete new edition. The failed
update retained the old complete worker until retry succeeded. Existing tabs
acknowledged the newer edition and used the actual reload button. The new room,
all six entry pages, audio and an illustrated reading worked browser-offline.
Read-only inspection after cache deletion did not recreate that cache.
Chromium additionally delayed an authentic old-worker inspection reply until
after new readiness; it did not overwrite the current state. Firefox's different
navigation/controller behavior is not represented as having run that case.
[Five-to-six-room receipt](tension-review/upgrade.json).

## Retained native artifacts

The demonstration packet captures **Mesē at 32/3, root 110 Hz**, with the other
loads still 9 and 12, simultaneous target/user sound, first excerpt and Meibom
p.11. The separate original-weights WAV captures **6,8,9,12 at 220 Hz**, selected
Nētē, in claim/original/user pair order. They are deliberately distinct examples.
[Exact settings and native file identities](tension-review/examples.json).
- [Complete illustrated reading, gzip-compressed HTML](../examples/tension-reading.html.gz).
  Decompress before opening. All source bytes, selected audio, diagrams, word
  notes, fonts and full notices remain in the file.
- [Actual 15-page PDF](../examples/tension-reading.pdf), printed from that saved
  HTML with Chromium's A4 rules. Other print settings may change pagination.
- [Original-weights comparison WAV](../examples/tension-original-weights.wav),
  [font-embedded SVG](../examples/tension-diagram.svg),
  [exact quantities CSV](../examples/tension-quantities.csv) and
  [editable settings JSON](../examples/tension-settings.json).

```sh
python3 scripts/tension-print.py examples/tension-reading.pdf
```

Poppler recovered **all eight original JPEGs byte for byte** from the actual PDF.
Text extraction retained the claim, square-root distinction, exact repairs,
translation discrepancy and source/model boundaries. Printed reading pages and
full original source pages were visually inspected. The retained PDF has no
JavaScript; audio is playable in the HTML rather than the printed PDF.

The new source is in `9d0ff9f`, `6c724fb` and `65540c0`, followed by the review
artifacts. The existing Pyknon context supplied the listening desk, common audio
graph, font notices and complete-edition worker behavior.
