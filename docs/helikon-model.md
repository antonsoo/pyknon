# Helikon: source, geometry and the retuning constraint

The lesson follows Ptolemy, _Harmonics_ II.2, in John Wallis’s Greek/Latin
edition (Oxford, 1682), printed pp.97–101. His first construction displays
consonance ratios with four equal-pitch strings and one common support.
The following extension places strings for other divisions and moves the
common support. Ptolemy also compares the practical burdens of the methods.

The room asks two different questions. What does the original construction
produce? What must change when a modern four-string challenge fixes two end
notes but asks for different inner notes? The challenge is a reduced analogy
of the source’s movable-string principle. It is not the source’s full extended
octachord, an archaeological reconstruction or a measured instrument.

## Build the original geometry

Use a unit square in modern coordinates, with y increasing down the page:

```text
A -------- E -- L ------- B
| \\        |   |      / |
|    \\     H   |   /   |
|       \\  |   G       |
|          \\   |  \\   F
|           |   |       |
C --------- K - M ----- D
```

The schematic above is not to scale. The live diagrams use equal horizontal
and vertical units. A=(0,0), B=(1,0), C=(0,1), D=(1,1). E=(1/2,0) and
F=(1,1/2). The straight lines AF and BC meet at G=(2/3,1/3), not at the
centre. Parallels to AC through E and G become strings EK and LM.
The other two strings run along AC and BD. The common bridge lies on AF.

| Latin segment | Full-string fraction | Length when AC=12 | Frequency / full string |
| ------------- | -------------------- | ----------------- | ----------------------- |
| AC            | 1                    | 12                | 1                       |
| HK            | 3/4                  | 9                 | 4/3                     |
| GM            | 2/3                  | 8                 | 3/2                     |
| FD            | 1/2                  | 6                 | 2                       |
| BF            | 1/2                  | 6                 | 2                       |
| LG            | 1/3                  | 4                 | 3                       |
| EH            | 1/4                  | 3                 | 4                       |

This preserves seven sounding segments with six distinct lengths. The source
assigns these integer numbers on p.98. They are proportional numbers, not a
claim about a physical length unit. The workshop exposes a representative
pair for every interval class in the source’s list:

| Interval        | First, longer segment | Second, shorter segment | Frequency ratio |
| --------------- | --------------------- | ----------------------- | --------------- |
| Fourth          | AC                    | HK                      | 4/3             |
| Fifth           | AC                    | GM                      | 3/2             |
| Octave          | AC                    | FD                      | 2               |
| Whole tone      | HK                    | GM                      | 9/8             |
| Octave + fourth | GM                    | EH                      | 8/3             |
| Two octaves     | AC                    | EH                      | 4               |
| Octave + fifth  | AC                    | LG                      | 3               |

A longer first segment produces the lower first pitch. Frequency ratios are
therefore obtained by dividing the first _length_ by the second. The displayed
frequency ratio always means second pitch / first pitch. This does not make
an auditory consonance judgment on behalf of a learner.

After the construction, the user can alter the right bridge contact to
h=r/24, for integer r from 3 through 18. The four string positions stay fixed.
The lower lengths become 1, 1−h/2, 1−2h/3 and 1−h; upper nonzero lengths are
h/2, 2h/3 and h. The derived fractions stay exact. H, G and F follow the altered
contacts, so the altered G is explicitly no longer the diagonal intersection.
Earlier construction stages restore the source bridge; invalid imported
combinations of an earlier stage and an altered bridge are rejected.

## Why the end notes fix the inner notes

This second bench uses a fourth at its ends. Let x be a string’s lateral
position across a unit width and q the leftmost sounding length, divided by
the whole string length. The two end sounding lengths are q and 3q/4.
Their fixed end contacts determine a unique straight bridge. Thus:

```text
L(x) / full length = q(1 - x/4)
f(x) / left note   = 1/(1 - x/4)
required x         = 4(1 - 1/desired frequency ratio)
```

The original x=1/2 and x=2/3 necessarily produce 8/7 and 6/5, independent of q.
Moving the bridge while retaining those end ratios cannot independently tune
the two inner notes. In this bench q takes exact twelfths from 1/2 through 1.
Shortening q raises every frequency by 1/q and preserves every interval error.
The bridge lines meet outside the displayed board at (4,1); their similar
triangles explain the invariant ratios. No mechanical pivot is reconstructed.

The three targets use the report of Archytas in I.13, pp.62–63. The source’s
proportional string numbers are read from low pitch to high here:

| Target     | Source numbers         | Frequency ratios to low note | Required inner x positions |
| ---------- | ---------------------- | ---------------------------- | -------------------------- |
| Enharmonic | 2016, 1944, 1890, 1512 | 1, 28/27, 16/15, 4/3         | 1/7, 1/4                   |
| Chromatic  | 2016, 1944, 1792, 1512 | 1, 28/27, 9/8, 4/3           | 1/7, 4/9                   |
| Diatonic   | 2016, 1944, 1701, 1512 | 1, 28/27, 32/27, 4/3         | 1/7, 5/8                   |

The modern ruler has 504 equal parts so every required lateral position is
representable exactly. That subdivision is not attributed to Ptolemy.
The first inner string stays to the left of the second. Changing the target
retains the user’s positions, so a previously correct setting can cease to
agree. Fitting is an explicit action; existing choices are not silently repaired.

The text’s extended instrument places an octave at its ends and extends a side
by an equal amount. Our smaller fourth-span challenge changes that geometry.
It illustrates one constraint, rather than claiming a historical prescription
for tuning these four particular strings to Archytas’s genera.

## Greek, Latin and the edition

The eight whole retained images are the title, pp.97–101 and pp.62–63.
`public/sources/helikon/manifest.json` identifies the complete original PDF,
page numbers, dimensions, byte lengths and SHA-256 values. Poppler 24.02.0,
`-scale-to 2200 -jpeg -jpegopt quality=88`, reproduces all eight JPEGs byte
for byte. The two I.13 copies were freshly rendered; the older root-room
JPEGs remain unchanged and have their own identities.

Six selected Greek readings have Wallis’s Latin, new English and twelve word
notes. A noun phrase is identified as a noun phrase; a selected excerpt is
not presented as a complete sentence. Barred lowercase Greek segment letters
remain lowercase with their bars omitted. Line breaks, end-of-line hyphens,
Latin ligatures and long s are normalized. Apparatus and surrounding context
remain visible in each whole image. English and grammatical notes have not
received independent philological review.

| Greek diagram letter | Wallis’s Latin |
| -------------------- | -------------- |
| α                    | A              |
| β                    | B              |
| γ                    | C              |
| δ                    | D              |
| ε                    | E              |
| ζ                    | F              |
| η                    | G              |
| θ                    | H              |
| κ                    | K              |
| λ                    | L              |
| μ                    | M              |

ἰσοτόνους / aequitonas means equal in pitch, not equal in physical tension.
The model additionally stipulates uniform, comparable strings with common
wave speed. A real moved string would need to be checked and tuned again.
Ptolemy’s practical comments about whole-string movement and spacing remain
separate from the ideal geometry’s results.

## Sound and scope

With common wave speed v, a fixed-end uniform string has fundamental
f=v/(2L). Here the modern full-string reference is 110 or 220 Hz. The length
fractions are exact; hertz and cents are floating-point evaluations. The
browser’s actual oscillator frequency parameter has its own finite precision.

Live playback and WAV rendering use the existing finite sine-oscillator graph:
48 kHz mono, amplitude 0.16, 20 ms attack and 60 ms release. Tones last 0.56 s
and start 0.74 s apart. A two-tuning comparison inserts 0.5 s between groups.
The saved selected interval plays first segment then second. The retuning
sound plays the four actual notes, then the four target notes at the same
current leftmost pitch. No simultaneous resonance, timbre, bridge coupling,
friction, retensioning, three-dimensional deflection, finger reach or ancient
absolute pitch is modeled. Neither listening discrimination nor a physical
instrument was measured.

Stop, a setting change, history navigation and a hidden tab cancel playback.
A delayed AudioContext resume cannot start tones after Stop.

## Retention and edition behavior

Source images, export fonts and complete licenses are checked against the
manifest before use. A wrong HTTP 200 response is rejected. The selected source
has a generation counter; a late earlier response cannot replace a newer page.
An asynchronous file import also checks whether the learner has changed
settings or chosen a newer file. Saving captures a state snapshot before
asynchronous audio rendering and asset acquisition.

JSON uses a versioned format and strict field/range validation. CSV contains
exact fractions and explicitly scoped floating evaluations. SVG embeds its
font and complete MIT/OFL notices. The independent HTML includes current
boards, tables, both WAVs, all readings, whole source pages, native downloads,
local fonts and full licenses; it uses no scripts or automatic remote assets.
Printing that HTML creates an untagged browser PDF. Physical printer behavior
is unverified.

The complete ten-room production edition uses the existing integrity-checked
service worker. Ready means the current page’s matching controller confirms
its complete inventory. The development server does not install the edition.
A previous edition is distinct from the added room’s new source and build.
Public source, hosted bytes, deployment and public browser behavior require
separate publication evidence; this addition is prepared locally.
