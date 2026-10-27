# Three middles: numbers, strings and sound

Open [the workshop](https://antonsoo.github.io/pyknon/halves.html).
The ancient numerical claim and the modern sound model have different domains.

## Try the actual work

Start with **16, 17, 18**. The additive differences agree, but 17/16 and 18/17
do not: 17² = 289, while 16×18 = 288. Play both half-intervals from the same
220 Hz starting pitch. Their endings are approximately 233.750000 and
232.941176 Hz. Sound illustrates the difference; it does not decide equality.

Select **Equal ideal string-length increments**. The middle becomes 288/17,
and the imbalance reverses. Select **Equal frequency ratios**. The exact
middle is 12√2 and both frequency ratios are 3√2/4. The continuously chosen
root is outside a theorem about whole-number proportional means.

Return to the integer candidate, double its numerical scale, and try the two
integers around the root. Scaling 16,17,18 to 32,34,36 preserves both interval
ratios. A larger gap contains more ordinary integers without supplying a
proportional integer. Trying finitely many scales illustrates this fact;
it does not prove the general claim.

**Try a boundary: 4, 6, 9**. Both ratios are 3/2. The outer ratio 9/4 is not
superparticular in least terms. This control tests the premise rather than
presenting the ancient assertion as a ban on all integer means.

**Use the printed pair: 9 and 12** returns to the figure in III. Its least
pair is 3 and 4; a unit separates them. The source's letters ΔΖ and Θ are
retained in the transcription. Our A, M, B are new model labels.

## Exact and approximate quantities

| Choice                               | Middle M between numerical weights A and B | Condition                                        |
| ------------------------------------ | ------------------------------------------ | ------------------------------------------------ |
| Integer candidate                    | chosen whole number                        | compare M² with AB                               |
| Equal frequency increments           | (A+B)/2                                    | equal additive differences                       |
| Equal ideal string-length increments | 2AB/(A+B)                                  | equal differences between reciprocal frequencies |
| Equal frequency ratios               | √(AB)                                      | M/A = B/M, equivalently M² = AB                  |

Integer arithmetic and reduced BigInt fractions decide the comparison.
The geometric choice stores its square exactly, simplifies square factors
for display, and gives both half-interval endings the same finite frequency
when they are symbolically equal. No rounded hertz, cents or drawing coordinate
is fed back into the equality test.

For a superparticular ratio (n+1):n in least terms, a rational square root would
require both coprime consecutive positive integers to be squares. Consecutive
positive squares differ by at least three. This modern square argument proves
the bisecting case. It is distinguished from III's least-terms/means argument
and its assertion about one **or more** proportional means. This bench models
one middle and does not implement every possible continued proportion.

Numerical weights are realized as modern frequencies relative to A. They are
not source measurements in hertz. The string comparison uses the ideal relation
f = v/(2L), with wave speed fixed; see
[OpenStax's standing-wave account](https://openstax.org/books/university-physics-volume-1/pages/16-6-standing-waves-and-resonance).
It does not claim that tension and stiffness stay fixed on any particular real
instrument when a string is stopped.

## Read the words beside the pages

Seven selected Greek passages, Menge's Latin, new English, and nineteen word
notes connect III to XII, XIII and XVI. The title page prints **MCMXVI**.
The edition is Heinrich Menge, _Euclidis opera omnia_ VIII, Teubner, Leipzig,
1916; the University of California copy is at
[Internet Archive](https://archive.org/details/euclidisoperaomn08eucl).
The text is transmitted under Euclid's name; this lesson does not settle its
authorship or establish that all Greek musical traditions used its premises.

| Printed page | PDF page (one based) | Retained evidence                                       |
| ------------ | -------------------- | ------------------------------------------------------- |
| Title        | 7                    | editor, imprint, 1916                                   |
| 162–163      | 220–221              | III, Greek and Latin, complete figure and apparatus     |
| 172–173      | 230–231              | XI–XII, musical ratio premises                          |
| 174–175      | 232–233              | XIII tone enunciation and its proof; XIV–XV also remain |
| 176–177      | 234–235              | XVI tone division argument; following material remains  |

Greek theta forms and initial capitalization are normalized, line wraps and
line-end hyphens joined. The visible ellipsis in reading five joins two
selections from XII. In XIII, the selected enunciation says the tone is
superparticular in the ratio 9/8; the fifth/fourth relation is explained in
our note and retained proof, not invented as a quotation. Menge's Latin
reference `[prop. III]` is identified as editorial. English and contextual
word notes are new and have not received independent philological review.
The ancient numerical “unit” premise does not say a continuously drawn line
cannot be cut. “Proportional” must not disappear from the reading of “middle.”

The manifest identifies the original PDF (19,695,338 bytes, SHA-256
`eecde1f0c7164eae8497c17566746e9c4d38e3e09878a0a9d11caf0753fcddb8`),
nine complete JPEGs, fonts and licenses. Poppler 24.02.0, `-scale-to 2200
-jpeg -jpegopt quality=88`, reproduces the retained images byte for byte.
The manifest is a watched Vite virtual module; production loading validates
all identified assets. Runtime verification rejects substituted successful
responses. A separate decoded image per request prevents late decode races.

## Sound and portable records

All live and saved audio uses the existing finite Web Audio sine graph:
48 kHz mono PCM for WAV, gain 0.16 per voice, 20 ms attack and 60 ms release.
There is no autoplay, instrument timbre, hearing test or historical reference
pitch. Both endings together have a frequency difference; the same-ending
control keeps voice count, gain and starting phase the same. Finite AudioParam
precision and engine phase accumulation are part of the realization.
Changing settings or hiding the page stops playback; a delayed resume cannot
start an obsolete experiment after a stop.

JSON has a strict version, scope and nine-field state. Invalid records leave
settings unchanged. A late file read cannot replace newer user settings.
The CSV records each of low/middle/high, exact number squares and exact relative
frequency squares as rational numerator/denominator pairs, settings and scope
on every row, and explicitly approximate frequency/cents columns. The SVG
embeds Plex and its complete license. The HTML includes all seven readings,
all nineteen word notes, nine whole pages, three fonts, full MIT/OFL licenses,
current diagrams, chosen WAV, editable JSON and exact CSV. Its four native
downloads work with scripts disabled. External references require a connection;
no remote asset request is automatic. Every asynchronous save captures its
initial settings.

A complete current-worker cache is required for the eight-room readiness
message. An older worker's cache is not evidence that this lesson is saved.
See [the review](halves-review.md) for observed operation and its limits.
