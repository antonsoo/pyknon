# From transmitted numbers to audible intervals

## The source and its limits

Ptolemy, _Harmonics_ I.13, reports Archytas's divisions. Wallis's Greek/Latin
edition of 1682 prints the interval discussion on p. 62 and the proportional
numbers on p. 63. Both pages are bundled in the app and credited in
[THIRD_PARTY.md](../THIRD_PARTY.md).

This is a report of a theory, transmitted centuries after Archytas. Ptolemy
also criticizes it. We do not infer its prevalence, a particular melody,
regional practice, instrument timbre, or an absolute ancient reference pitch.
The explanatory tables themselves have a transmission history: see Tolsa
2024, pp. 495–497, rather than attributing every part of their layout to Ptolemy.

## Source numbers and direction

| Note, low to high | Enharmonic | Chromatic | Diatonic |
| ----------------- | ---------: | --------: | -------: |
| 1                 |       2016 |      2016 |     2016 |
| 2                 |       1944 |      1944 |     1944 |
| 3                 |       1890 |      1792 |     1701 |
| 4                 |       1512 |      1512 |     1512 |

The printed table runs high to low. In the app we realize each number `L` as
a proportional string length, so frequency is `root × 2016 / L`. This is an
inverse relationship: smaller numbers yield higher pitches. The app's core
instead multiplies the adjacent **ascending frequency ratios** below. These
two representations provide an independent check on interval order.

| Genus      | Adjacent ascending frequency ratios | Cumulative frequency ratios |
| ---------- | ----------------------------------- | --------------------------- |
| Enharmonic | 28/27, 36/35, 5/4                   | 1, 28/27, 16/15, 4/3        |
| Chromatic  | 28/27, 243/224, 32/27               | 1, 28/27, 9/8, 4/3          |
| Diatonic   | 28/27, 8/7, 9/8                     | 1, 28/27, 32/27, 4/3        |

All products are exactly 4/3. The three fixed pitches in **this scheme** are
notes 1, 2 and 4. Other ancient theorists and divisions need not share that
property. Choosing downward playback reverses the notes, not their meaning or
the data table's low-to-high order.

## What modern rounding removes

Cents are `1200 × log₂(frequency ratio)`. A modern equal-tempered semitone is
100 cents; the model's pure fourth is 498.044... cents. Modern key comparison
rounds the cumulative position of **each note** to the nearest multiple of 100,
relative to the selected A reference. The output frequency is
`root × 2^(rounded semitones / 12)`.

In the enharmonic division the two interior pitches lie at 62.960... and
111.731... cents. Both round to 100. Their actual 48.770... cent difference
vanishes. The four-event sequence now contains only three distinct pitches.
We display both numbered events at the same pitch coordinate. It would be
misleading to call the rounded result a four-distinct-note ancient tetrachord.

This comparison uses A2=110, A3=220 or A4=440 Hz. These are modern listening
references. The key labels A, B-flat, B, C, C-sharp and D name the modern
comparison only. No tuning system is declared universally superior; rounding
is useful here precisely because it demonstrates a loss.

The close-note button always alternates 2,3,2,3, first in ratios, then rounded.
It isolates that pair even if the full-sequence direction is set downward.

## Pyknon

A pyknon is the close group formed when two adjacent intervals together are
smaller than the remaining interval of the fourth. Here the relevant intervals
are the lower two. They span 111.731... cents in the enharmonic and 203.910...
in the chromatic division; the respective remaining intervals are larger.
The diatonic lower pair spans 294.134... cents and exceeds the remaining
203.910... cents, so it has no pyknon. We multiply ratios or add cents, never
add the ratios themselves.

## Audio and cancellation

Both live audio and OfflineAudioContext WAV rendering schedule finite sine
oscillators through identical gain envelopes: 20 ms linear attack, 60 ms linear
release, peak amplitude 0.16. Each note lasts 0.48 seconds, successive starts
are 0.65 seconds apart, and the A/B groups have a further 0.6-second separation.
An A/B export is 5.95 seconds, mono, 48 kHz, 16-bit PCM.

The visual note indicator follows the AudioContext clock. Stop cancels future
gain events, computes the value of the known envelope at the current audio
time, fades it out over 15 ms, and stops every scheduled oscillator after
20 ms. This does not depend on `cancelAndHoldAtTime`, which is absent in the
reviewed Firefox version. A generation counter prevents a pending `resume()`
from scheduling tones after Stop or after another Play. Hiding the page also
stops playback. Exports snapshot the selected state before rendering.

A PCM measurement proves the generated signal, not a person's hearing,
a sound card's calibration or historical authenticity.

## Interface, sharing and offline state

The desktop diagram plots pitch horizontally. The phone diagram uses height
so all four notes remain visible without scrolling the pitch axis. Both are
calculated from the same cumulative cents, with equivalent accessible text
and a detailed table. Playback highlights the current note in its tuning row.

Shared state uses bounded query parameters `g`, `a`, and `d`; section anchors
remain ordinary page navigation. Saved HTML contains its own SVG and styles
and can be opened or printed without the application. WAV contains the tones
only; its filename records genus, reference pitch, direction and group order.

The build hashes every production input into an edition ID. The service worker
saves the full edition with SHA-256 integrity on each asset, including fonts and
all bundled source scans. The interface declares offline readiness only after asking
the active worker to verify this edition's complete cache. Cache eviction is
still controlled by the browser; a saved HTML/WAV is a separate durable file.

## Six tones and an octave

`src/core/canon.ts` holds the separate _Sectio canonis_ comparison. It uses
9:8 whole tones, without changing Archytas's tetrachords or applying this
progression to the Seikilos song. Seven exact ratios start at 1 and multiply
by 9/8 six times. The printed progression starts at 8^6 = 262144; its
nth integer is `9^n × 8^(6-n)`. All integers and reduced fractions here
are exactly representable within JavaScript's safe integer range.

The modern comparison uses `root × 2^(n/6)`, at `200n` cents. Its sixth
step reaches `2 × root`. The other reaches `531441/262144 × root`,
leaving relative ratio `531441/524288`. This is 23.460010384649 cents,
independent of modern root. Frequency difference, and hence the generated
pair's amplitude beat rate, scales with root instead.

Source numbers are realized as proportional frequencies. Unlike the
Ptolemy room's inverse source numbers, they are an increasing numerical
progression of ratios. Α–Η identify the proof's numbers. The exact final
inequality is `531441 > 2 × 262144`; floating-point cents are unnecessary
to establish it.

Successive-pair audio uses two 1.6-second tones; together/control uses
two four-second tones beginning at the same instant. The control changes
only the second frequency to match the first; both use the same sine phase,
amplitude and gain envelope. Walking plays steps zero through the selection
in each route, first 9:8 then equal. All modes use the existing live/PCM
scheduler and cancellation logic, and every sound is finite.

Query parameters `n`, `a`, `sound`, `p` and `page` retain the selected
interval count, modern reference, audio mode, proof sentence and source
page. Settings and export operations snapshot these values. All three
rooms and all their fonts and source pages join one integrity-checked
offline edition. The saved octave HTML embeds six unchanged JPEG scans
and the Greek font; the separate PCM export captures the chosen sound.
