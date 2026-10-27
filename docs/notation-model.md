# One shape, two musical alphabets

The desk asks a concrete reading question: can a learner preserve the notes of
a short line while writing the other alphabet? The opening example intentionally
copies two shapes. It retains two changed pitches until the learner replaces
them. There is no random question generator, hearing score or recovered melody.

## The source, and what was selected

The primary evidence is Alypius, _Eisagoge mousike_, in Karl von Jan,
_Musici scriptores graeci_ (Teubner, Leipzig, 1895), pp367–370.
The [complete scanned volume](https://archive.org/details/musiciscriptoresjank)
has its title at PDF page 7; printed pp367–370 are PDF pages 469–472.
The five complete pages retain the print's margins, staff transcriptions,
brackets and apparatus. They are not ancient manuscript photographs.

The [source manifest](../public/sources/notation/manifest.json) records the
original 41,700,417-byte PDF's SHA-256 identity and every retained image, font
and full license. [The preparation script](../scripts/notation-sources.py)
requires the identified original PDF and derives whole pages with Poppler,
longest side 2200 px, JPEG quality 88. It performs no cropping, recolouring,
OCR repair or reconstruction. Builds check retained identities; normal builds
do not need the preparation tools.

The operated span selects these nine functions from the Lydian diatonic table.
The printed row is its counted position among the full eighteen entries. The
desk does not relabel this selection as the complete ancient scale.

| Printed row | Function              | Vocal teaching sign      | Instrumental teaching sign |
| ----------- | --------------------- | ------------------------ | -------------------------- |
| 5           | hypatē mesōn          | lunate sigma             | lunate sigma               |
| 6           | parypatē mesōn        | rho                      | upturned sigma             |
| 7           | mesōn diatonos        | mu                       | drawn-down pi              |
| 8           | mesē                  | iota                     | sideways lambda            |
| 11          | nētē synēmmenōn       | open-topped square omega | zeta                       |
| 12          | paramesē              | zeta                     | sideways pi                |
| 13          | tritē diezeugmenōn    | square epsilon           | upturned pi                |
| 14          | diezeugmenōn diatonos | open-topped square omega | zeta                       |
| 15          | nētē diezeugmenōn     | sideways phi             | drawn-down slanting eta    |

The square omega and upturned pi share one regularized drawing ID but retain
their different Greek descriptions. The SVG strokes are new teaching diagrams,
visually checked against the print. They are neither Latin-letter substitutions
nor font outlines extracted from the Unicode chart. The p368 apparatus records
rounder variants and other textual details; our regular strokes do not erase
those variants from the retained page.

## Three distinctions the learner can operate

**Alphabet.** The vocal zeta is paramesē in this span; instrumental zeta reads
nētē synēmmenōn or diezeugmenōn diatonos. The open-topped square changes in the
opposite direction: vocal square omega versus instrumental upturned pi. The
sigma control retains both identical tones so that agreement remains audible.

**Function.** Rows 11 and 14 share a pair. The translator lists both possible
functions and accepts their shared pitch in the disclosed model. It does not
turn an array's first entry into the uniquely identified ancient note name.
A pitch representative is used for sound only when all retained readings agree
in the selected model. The CSV keeps the entire candidate list.

**Table.** The Hypolydian entries on p370 give sigma the function mesē and
iota/sideways-lambda the function nētē synēmmenōn. The preceding Lydian entries
gave those pairs other functions. The source comparison establishes the written
relationships; this desk does not infer a cross-table absolute-pitch standard.
The ethnic table names do not establish a modern piano mode or a timeless
regional performance style.

## Choose what stays fixed across the two tables

Four shared pairs make the p369/p370 comparison operable. Their functional
names and counted source positions are retained independently of the model.

| Shared pair            | Lydian p369                                            | Hypolydian p370                                        |
| ---------------------- | ------------------------------------------------------ | ------------------------------------------------------ |
| sigma / sigma          | hypatē mesōn, row 5                                    | mesē, row 8                                            |
| iota / sideways lambda | mesē, row 8                                            | nētē synēmmenōn or diezeugmenōn diatonos, rows 11 / 14 |
| zeta / sideways pi     | paramesē, row 12                                       | nētē diezeugmenōn, row 15                              |
| square omega / zeta    | nētē synēmmenōn or diezeugmenōn diatonos, rows 11 / 14 | hyperbolaiōn diatonos, row 17                          |

Lydian mesē always stays at the chosen reference. **Keep the selected sign's
pitch** sets the Hypolydian mesē to three quarters of that reference in the
rational model. **Keep both mesai at the reference** instead moves the selected
Hypolydian sign up by four thirds relative to its Lydian modeled pitch. The
equal-step model substitutes a five-semitone relation. These are alternative
modern constraints, not a recovered ancient concert-pitch convention.

For iota at a Lydian mesē of 330 Hz:

```text
Keep sign pitch:     Lydian mesē 330   / iota 330
                     Hypo   mesē 247.5 / iota 330

Keep both mesai:     Lydian mesē 330   / iota 330
                     Hypo   mesē 330   / iota 440
```

The two plots share one current logarithmic pitch scale. A dot identifies each
context's mesē; the vocal sign identifies the selected note. Coincident pitches
remain two explicitly identified marks. The pitch representative never removes
a second possible function from a caption, source view or CSV.

The comparison has its own two-row CSV and readable SVG sheet. Its selected
pair, reference constraint and source focus are retained in the editable JSON,
copied link and both SVG sheets' native metadata. The illustrated reading
includes the comparison, both native vector downloads and the chosen sound.
Keeping separate vector sheets avoids shrinking both activities into one tall
page. The third listening mode compares the selected sign in the two contexts.

Source inspection follows the actual selected activity. A lookup row, a shared
pair or a Greek reading establishes which entry or two entries should be
highlighted. The two Hypolydian iota entries remain separate bands. The retained
image dimensions reserve its page geometry before bytes arrive, so lower
workshops keep their positions while a page is being verified.

The continuation link selects the Seikilos syllable σον within ὅσον, with vocal
zeta visible in that reader's retained museum photograph. The song has its own
modern transposition and duration reading. The desk does not transfer its
Lydian functional labels onto the song's entire musical context.

## A modern realization, separately stated

Every frequency is relative to a chosen Lydian mesē of 220, 330 or 440 Hz.
No ancient hertz value, tempo, tuning recipe or instrument timbre is measured
by the notation table. Jan's modern staves were inspected as an editorial
relative-pitch cross-check, not treated as ancient music paper.

The rational model uses conventional Pythagorean diatonic intervals: a 9:8 tone,
256:243 limma, 4:3 fourth and 3:2 fifth. The alternative uses twelve equal
semitones per octave. These are two disclosed teaching realizations, not two
tunings attributed to Alypius. The same-glyph discrepancy survives both choices.

| Function(s)                             | Rational ratio to mesē | Equal-tempered exponent |
| --------------------------------------- | ---------------------- | ----------------------- |
| hypatē mesōn                            | 3/4                    | -5/12                   |
| parypatē mesōn                          | 64/81                  | -4/12                   |
| mesōn diatonos                          | 8/9                    | -2/12                   |
| mesē                                    | 1/1                    | 0                       |
| paramesē                                | 9/8                    | 2/12                    |
| tritē diezeugmenōn                      | 32/27                  | 3/12                    |
| nētē synēmmenōn / diezeugmenōn diatonos | 4/3                    | 5/12                    |
| nētē diezeugmenōn                       | 3/2                    | 7/12                    |

Thus zeta's two readings differ by 32:27, about 294.135 cents, in the rational
model, and by 300 cents in the equal model. The square sign's two readings
differ by a tone. A same-shape comparison always plays the vocal reading first,
then the instrumental reading, using the same reference and oscillator level.

The line comparison plays the given phrase at 0 s, then the actual written
phrase at 3.6 s. Four slots remain four time positions, including silence at
blanks. Notes last 0.6 s with 0.75 s between starts. These durations and the
gaps are modern lesson choices. The live player and downloadable 48 kHz,
16-bit mono PCM WAV use the same finite sine/envelope graph. Numerical model
equality uses rational cross-products or integer semitone positions; rounded
hertz and cents do not decide it.

## Reading and retaining evidence

Six selected Greek readings have new English and twelve contextual word notes.
They distinguish upper/lower notation, fixed/movable notes, letter names,
sideways and inverted forms, two shared functions, and the Hypolydian comparison.
Theta forms, line breaks and end-of-line hyphens are normalized; a middle dot
joins separately selected entries where stated. The original brackets and the
λάβδα/λάμβδα difference remain visible. New English and grammatical explanation
have not received independent philological review.

The editable JSON retains the working signs, blanks, chosen alphabet, selected
row, reading and modern sound settings. Unknown state fields, unavailable signs,
invalid types, repeated/missing URL settings and oversized files are rejected.
An invalid import does not replace the line. A delayed import or export cannot
overwrite or mislabel newer work. Copying a link is an explicit action; normal
operation leaves the address unchanged.

The portable SVG embeds its Plex font, full font notice, MIT notice and native
state. The illustrated HTML embeds all five complete page images, three fonts,
both full font licenses, six readings, the full selected lookup, current sound
and native JSON/CSV/SVG/WAV/manifest downloads. It contains no script or automatic
remote resource requests. Its external references still require a connection.
Source files are identity-checked before presentation and export; a late image
cannot replace a later selected page. Failed identities can be retried.

Local build, actual browser behavior, saved artifact bytes, controlled offline
upgrade, public source and public publication are recorded as separate claims.
