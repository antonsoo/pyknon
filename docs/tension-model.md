# Nicomachus's weighted strings

A listening experiment for English-speaking readers of ancient Greek music.
It asks whether the four loads specified in a literary account yield its
claimed intervals when put into an explicit modern ideal string model.
The learner can change the loads and hear the resulting distinction.

## The source is unusually specific

Nicomachus, _Harmonic Manual_, chapter 6, tells how Pythagoras went from a
blacksmith's sounds to four suspended strings. This is a later account, not a
surviving laboratory report by Pythagoras. No exact date for either episode is
inferred here. The room models only the weighted-string comparison; it does
not model hammer spectra or endorse the chapter's extension to other instruments.

The Greek excerpts were transcribed and visually checked against the complete
printed pages of Carl von Jan, _Musici scriptores Graeci_ (Leipzig: Teubner,
1895), pp.245–248. Meibom's own Latin comes from _Antiquae musicae auctores
septem_, volume I (Amsterdam: Elzevir, 1652), Nicomachus pp.10–13. The Latin
belongs to its older edition; it is not silently presented as Jan's translation.
Eight complete original pages, including apparatus, are retained locally.

| Witness     | Original file                | Printed pages | PDF pages | Archive leaves |
| ----------- | ---------------------------- | ------------- | --------- | -------------- |
| Jan 1895    | `musiciscriptores01jank.pdf` | 245–248       | 343–346   | 343–346        |
| Meibom 1652 | `bub_gb_JgtAAAAAcAAJ.pdf`    | 10–13         | 288–291   | 287–290        |

The Jan PDF excludes a front leaf. Its PDF page minus one would identify the
wrong Archive leaf. The downloadable file, rendered page and Archive leaf were
checked separately. PDF identities, JPEG identities and rendering parameters
are in `src/tension-sources.json`; rights and normalization are in
`public/sources/tension/NOTICES.txt`. Both original editions are public domain.
The page images are mechanical full-page renderings, without retouching.

The central phrase on Jan p.247 calls the strings of the same material, equal
in length and thickness, and equally twisted. A second clause explicitly makes
their lengths entirely equal. Jan's apparatus records an alternative reading
for “equal in thickness”; the room uses his main text. Meibom p.11 retains
Greek “equally twisted” but translates it _aeque graves_, “equally heavy”.
The room preserves this discrepancy. It does not repair either text to make
the modern physics work. A short note teaches the participles and adjective
agreement that carry the controlled-variable claim.

The chapter attaches the following names to four numbers, then goes on to say
that the intervening diatonic notes are supplied:

| Source load | Name     | Claimed ratio to 6 |
| ----------- | -------- | ------------------ |
| 6           | Hypatē   | 1                  |
| 8           | Mesē     | 4/3                |
| 9           | Paramesē | 3/2                |
| 12          | Nētē     | 2                  |

These four notes form a numerical skeleton. They are not the complete eight-note
system, a surviving tune or a reconstruction of an ancient performance. The
text's unspecified weight unit is not converted into kilograms; Meibom's
_librarum_ is retained as his translation choice.

## An explicit ideal model

For a uniform flexible string with fixed vibrating endpoints, small transverse
motion obeys `mu * y_tt = T * y_xx`. Its first spatial mode has wavelength `2L`,
so its fundamental frequency is `f = sqrt(T/mu)/(2L)`.

Hold the loaded vibrating length `L` and linear density `mu` fixed, and take
tension `T` proportional to the hanging load `W`. The fixed six-unit string
provides a modern 110 or 220 Hz reference. All physical constants cancel in
relative pitch:

```
f(W) / f(6) = sqrt(W/6)
```

Thus 12 against 6 gives `sqrt(2)`, or 600 cents. The account calls it an octave,
a 2:1 ratio and 1200 cents. Every interval between the original strings is
halved **in cents**, since `log2(sqrt(r)) = log2(r)/2`. This does not halve the
frequency itself. Cents and the absolute pitch reference are modern choices.
The [OpenStax force derivation](https://openstax.org/books/university-physics-volume-1/pages/16-3-wave-speed-on-a-stretched-string)
and [Harvard sonometer demonstration](https://sciencedemonstrations.fas.harvard.edu/presentations/sonometer)
provide modern physical references. No historical claims on those pages are
used to date or authenticate this ancient account.

To obtain a desired frequency ratio `r`, solve `W = 6r^2`:

| Target ratio | Source load | Replacement load for the ideal model |
| ------------ | ----------- | ------------------------------------ |
| 4/3          | 8           | 32/3                                 |
| 3/2          | 9           | 27/2                                 |
| 2            | 12          | 24                                   |

The replacement loads are a modern experiment, not proposed textual emendations.
Source numbers and claimed ratios stay fixed while the user changes a separate
set of loads. Exact fractions use bounded integer numerators and denominators;
all products stay within safe integer precision. Frequencies containing square
roots and logarithmic intervals are floating approximations. “Exact ratio
reached” compares the load fractions algebraically, without an invented human
hearing threshold. The simultaneous playback makes near-target beating audible;
it does not measure a listener's perception.

The idealization excludes elastic stretching, density changes, stiffness,
friction, damping, support motion and the string's weight relative to its load.
It imposes fixed vibrating endpoints and does not solve the free-load boundary
problem of a hanging string. The equal-length columns do not reconstruct the
source's single diagonal peg. The source states its equality conditions; the
room shows a mathematical consequence within a declared ideal model. No
physical instrument has been built or measured for this work.

## Drawings, sound and portable evidence

The drawing holds vibrating lengths fixed and scales rectangle height with
load. Hollow outlines retain the original loads. The sine-shaped first mode
has arbitrary amplitude. The pitch ruler always spans 0–1500 cents, so repair
cannot create an apparent match by rescaling the axis. Orange marks the selected
note; exact ratios and all frequencies are available in the table and CSV.

All audio is synthetic sine fundamentals, with the same finite attack/release
graph used for live playback and WAV rendering. Claim and ideal-model sounds
are never labeled as historical timbre. The comparison plays three successive
low/high pairs: claim, original ideal model, user ideal model. Quartet modes
play the four numerical skeleton notes. The simultaneous mode plays selected
target and user's ideal note together. Playback requires a gesture; Stop and
state changes cancel scheduled tones, including an asynchronous resume.

URLs and editable JSON retain all three replacement loads, selected note,
reference, sound choice, excerpt and source page. Malformed input keeps the
prior experiment with a readable error. A range gesture is one history entry;
exact form submissions and discrete actions remain independently reversible.

The script-free HTML captures a state snapshot before asynchronous rendering.
It embeds the selected WAV, both diagram sizes, pitch rulers, full exact table,
all eight Greek/Latin/English readings, all ten word notes, eight full source
JPEGs, three fonts and full font licenses. Embedded links also save WAV, CSV,
editable JSON and a font-embedded SVG. No remote rendering asset or script is
required. Source images and fonts must match their SHA-256 identities before
they are displayed or embedded. A valid JPEG belonging to the wrong page must
fail, rather than masquerade as source evidence.

All six rooms and every source asset share one integrity-checked worker edition.
Readiness requires the matching controller and complete resource inventory.
An older or partly installed edition is insufficient. The local review and
public hosted verification are recorded separately in `tension-review.md`.
