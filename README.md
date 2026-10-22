# Pyknon

**Hear the ancient interval that disappears between modern piano keys.**

Archytas's enharmonic tetrachord places two notes about 49 cents apart. Round
both to the nearest modern key and the interval vanishes. Pyknon makes that
loss audible, visible and traceable to a source: Ptolemy's report of Archytas,
with Greek and Latin pages from a 1682 edition.

[Open the listening workbench](https://antonsoo.github.io/pyknon/?g=enharmonic&a=220&d=up#listen)
· [MIT license](LICENSE)
· [Source and model](docs/model.md)

![The enharmonic pitch ruler: two ancient notes converge on the same modern key](docs/assets/listening-desktop.png)

## Try it

1. Press **Compare both**: four ratio-based tones, a pause, four rounded tones.
2. Press **Hear just notes 2 & 3**. The small step becomes a repeated key.
3. Switch to **Chromatic** and **Diatonic**. In this particular scheme, only the
   third pitch moves. Watch when the close-packed group—the *pyknon*—disappears.

Three modern A references and either playback direction are available. Open
**Follow the numbers** for frequencies, cumulative ratios, cents and rounding
errors; each original note can be played separately. Greek vocabulary points
back to the experiment. The source panel includes a short Latin sentence with
a new English translation and the actual scanned pages.

**Download A/B audio** saves the generated WAV. **Save illustrated study** saves
an HTML document with the diagram, measurements and citations; it opens offline
and can be printed. Shared URLs preserve genus, reference pitch and direction.
The published app works offline once its footer confirms the complete edition
has been saved, including all three source scans. No account or external font
service is used.

## Run locally

Requires Node.js 24 or later. Python 3 is used only for independent verification.

```bash
git clone https://github.com/antonsoo/pyknon.git && cd pyknon
npm ci
npm run dev
```

Open `http://127.0.0.1:4329/pyknon/`. `npm run build` creates `dist`;
`npm run preview` serves the production build on the same port. Offline saving
is enabled in the production build, not the development server.

## How the comparison works

Four pitches span a pure fourth, with frequency ratio 4/3. The core multiplies
three exact rational intervals. The independent checker derives each frequency
from the source's proportional numbers instead.

| Division | Adjacent ascending ratios | Distinct pitches after modern rounding |
| --- | --- | ---: |
| Enharmonic | 28/27, 36/35, 5/4 | 3 |
| Chromatic | 28/27, 243/224, 32/27 | 4 |
| Diatonic | 28/27, 8/7, 9/8 | 4 |

At A3 = 220 Hz, the enharmonic inner notes are **228.148 Hz** and
**234.667 Hz**, at **62.96** and **111.73 cents** above the base. Rounding to
100-cent steps maps both to **233.082 Hz**, modern B-flat. The original
**48.77-cent** difference disappears. These figures are produced by the model
and independently checked against Wallis p. 63.

The desktop ruler plots cents horizontally; the phone ruler uses height to
keep every note visible. Sine oscillators with short attack/release envelopes
make the ratios audible. Live playback and WAV export use the same Web Audio
graph. Stop cancels every queued tone, and a pending audio resume cannot restart
playback after cancellation. [Detailed model and implementation](docs/model.md).

## Accuracy and limits

This is a listening experiment about transmitted theory. It does not reconstruct
an ancient performance, melody or instrument timbre. The chosen A frequencies
and equal-tempered piano comparison are modern. These three divisions do not
represent every ancient Greek tuning; no inference about regional practice or
musical prevalence follows from them.

Ptolemy reports **and criticizes** Archytas. Wallis's Latin is a 1682 translation
of a Greek text. The table's layout has a transmission history of its own.
Aristoxenus supplies the definition of *pyknon* used here, not these numerical
ratios. Sources, editions, scan hashes and font notices are in
[THIRD_PARTY.md](THIRD_PARTY.md).

The fourth is about 498.04 cents, not exactly 500. Rounding is applied to
cumulative note positions; it can merge distinct pitches. The rounded
sequence should not be mistaken for an ancient four-distinct-note division.
The close-note button always alternates notes 2 and 3, independently of the
full sequence's direction.

## Verification

The checks exercise the model, actual controls and actual audio files:

- A Python `Fraction` oracle derives frequencies from the printed source
  numbers, checking all 18 supported genus/reference/direction settings and
  288 numeric comparisons, plus exact rational results and playback order.
- Chromium and Firefox at desktop and 375 px use keyboard controls, stop
  scheduled tones, cancel a delayed audio resume, follow vocabulary links,
  export studies and continue after the HTTP origin becomes unreachable.
- Independent sample analysis of 38 browser-exported WAVs measures 304 tones
  through zero crossings, checks their frequency against source-derived
  values, and verifies silence, duration, amplitude and attack/release edges.
  The measured maximum frequency error was below 0.009 cents; the acceptance
  tolerance is 0.02 cents. This measures generated PCM, not physical speakers.

[Verification record](docs/verification.md) separates local source/build
review from public hosting. [A saved study](examples/enharmonic-220.html) and
[its A/B WAV](examples/enharmonic-220.wav) are real browser exports.

```bash
npm run check
npm run verify:ratios
npx playwright install chromium firefox
npm run test:browser -- /tmp/pyknon-review/browser.json
python3 scripts/audio-oracle.py /tmp/pyknon-review/browser.json
```

The browser script serves the existing build itself. Do not rebuild `dist`
during the run. Its screenshots should be inspected, not treated as proof
merely because a file was produced.

## Contributing and license

See [CONTRIBUTING.md](CONTRIBUTING.md). Changes to historical claims need a
source; changes to audio need signal-level evidence. Code and original diagrams
are MIT © 2026 Anton Soloviev. Public-domain scans and OFL fonts retain the
notices in [THIRD_PARTY.md](THIRD_PARTY.md).
