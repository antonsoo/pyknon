# Two vīṇās: counts, note matches and an unchosen tuning

This room lets an English-speaking learner operate the successive matching
relations in Nāṭyaśāstra 28, then change the preparation and hear different
pitches preserve the same relations. It also preserves an awkward reading in
the retained Sanskrit edition. A moving diagram does not settle that reading
or establish one recovered ancient tuning.

## The printed witness

The primary witness is Joanny Grosset, _Contribution à l'étude de la musique
hindoue_, in _Mélanges de philologie indo-européenne_, Bibliothèque de la Faculté
des Lettres de Lyon 6 (Paris: Ernest Leroux, 1888), pp.1–91. The scanned volume
is [Internet Archive dli.ministry.04243](https://archive.org/details/dli.ministry.04243),
from the National Library of India, Kolkata. Eight complete pages are retained:

| Retained page     | PDF page | Purpose                                                                     |
| ----------------- | -------: | --------------------------------------------------------------------------- |
| Music study title |      163 | Identifies Grosset's contribution within the collected volume               |
| 27                |      189 | Note names, consonant relations and source variants                         |
| 28                |      190 | Two grāmas, Pa difference, beginning of two-instrument demonstration        |
| 29                |      191 | Successive matches, two grāmas' count lists, apparatus                      |
| 57                |      219 | Early French translation, including the start of the difficult second match |
| 58                |      220 | French continuation and count diagram                                       |
| 85                |      247 | Historical commentary and start of the note on lowered Pa                   |
| 86                |      248 | Note 36 explicitly describes the translation as uncertain                   |

The [public manifest](../public/sources/vina/manifest.json) retains the complete
PDF's length, MD5 and SHA-256, every rendered page identity and the exact Poppler
parameters. PDF page numbers refer to the downloadable PDF, not an assumed
Archive leaf offset. Whole pages retain apparatus, scan marks and surrounding
commentary. They are printed editions, not photographs of an ancient manuscript.
The original 1888 edition and mechanical page renderings are public domain.

The new transcription starts from those printed pages. Old **ç** becomes **ś**;
spacing, joined line breaks, punctuation and diacritics are normalized. Internal
omissions use ellipses. The two-instrument paragraph's editorial brackets remain
identified. This is Sanskrit in the source edition's romanization; no later
English translation or restricted volunteer transcription is bundled. New
English, contextual word notes, code and diagrams are MIT licensed.

Grosset's verse numbers differ from those in later editions. The room therefore
cites actual printed pages. His wider historical and etymological commentary
is a historical witness, not adopted as modern fact. The composite Sanskrit
treatise is attributed to Bharata; no single author, exact date, physical
experiment or instrument construction is inferred from this activity.

## Preserve the difficult list

The second-lowering clause on p.29 lists Ga–Ni entering Dha–Ri. The French
translation on pp.57–58 follows this order and marks doubt. Pairing those lists
literally in their written order does not produce the model's coincidences.
The workshop shows the resulting mismatches explicitly. The Sanskrit does not
add the English word "respectively": this test of a possible ordered pairing
does not prove a corrupt text or disagreement about the two target names.

Our model instead pairs Ga→Ri and Ni→Dha, following Bernard Bel's modern
algebraic interpretation. This is a disclosed interpretive choice, not a silent
replacement of the retained Sanskrit. The next clause's main text says _śruti_
without _tri-_; the following verses explicitly give three to Ri and Dha.
The stage's three-count label is tied to those verses and the interpretation.
At the final stage, Sa meets Ni in the **lower octave**. Folding note names into
one octave must not make their actual sounding frequencies different.

Counts are assigned to the interval **below** each named note:

| Note | Name     | Count below |
| ---- | -------- | ----------: |
| Sa   | ṣaḍja    |           4 |
| Ri   | ṛṣabha   |           3 |
| Ga   | gāndhāra |           2 |
| Ma   | madhyama |           4 |
| Pa   | pañcama  |           4 |
| Dha  | dhaivata |           3 |
| Ni   | niṣāda   |           2 |

From Sa upwards, the intervening counts are therefore 3–2–4–4–3–2–4. The final
four belongs to Ni→upper Sa. Lowering Pa for the madhyama-grāma changes the
adjacent below-Pa and below-Dha counts from 4,3 to 3,4; it does not move every
note. The separate successive-lowering experiment re-prepares a whole grāma
at a shifted pitch level.

## A modern one-parameter family

The numerical interpretation is credited to
[Bernard Bel, _A mathematical discussion of the ancient theory of scales
according to Natyashastra_](https://bolprocessor.org/wp-content/uploads/Bharata-paper.pdf)
(1984; revised March 1988 and December 2020), especially pp.4–11. The paper is
linked, not bundled. Our implementation recomputes from ratios rather than
copying its rounded tables. This is one mathematical interpretation, not a
claim of scholarly consensus or a prescription for contemporary Indian music.

Add a **modern exact acoustic assumption**: interpret the relevant consonant
relations as 4:3 fourths and 3:2 fifths. An octave is 2:1. They fix one chain
of principal pitches but leave the Ri–Dha chain's position free.

Take a chosen Pa reference difference `p` in modern cents, and define:

```text
A = 1200 log2(9/8)
L = 1200 log2(256/243)
B = A - p
C = L + p
```

The frequency ratios to Sa are:

| Note | Modern ratio under these assumptions |
| ---- | ------------------------------------ |
| Sa   | 1                                    |
| Ri   | (9/8) / 2^(p/1200)                   |
| Ga   | 32/27                                |
| Ma   | 4/3                                  |
| Pa   | 3/2                                  |
| Dha  | (3/2) × Ri                           |
| Ni   | 16/9                                 |

The other grāma's Pa is `(4/3) × Ri`, lower than Pa by `p`. The principal
intervals below Sa, Ri, Ga, Ma, Pa, Dha and Ni are `A,B,C,A,A,B,C`. Their
sum is `3A + 2B + 2C = 1200` for every chosen `p`, because `B+C=A+L`.
This identity does not determine `p` or the twenty-two individual microintervals.

For the moving system, divide **every** frequency by `2^(d/1200)`, where the
successive total lowerings `d` are:

| Stage          | Total down | New down from preceding stage | Match                                   |
| -------------- | ---------- | ----------------------------- | --------------------------------------- |
| Prepared alike | 0          | —                             | All seven principal notes               |
| First          | p          | p                             | Moving Pa reaches the other grāma's Pa↓ |
| Second         | C          | L                             | Ga→Ri; Ni→Dha                           |
| Third          | B          | A−L−2p                        | Ri→Sa; Dha→Pa                           |
| Fourth         | A          | p                             | Sa→lower Ni; Ma→Ga; Pa→Ma               |

The ordering requires `0 < p < C < B < A`. Here `C−p=L` is positive, so
the remaining strict boundary is `0 < p < (A−L)/2`, about 56.842503 cents.
At zero the first stage disappears; at the upper boundary stages two and
three coincide. Above it, the nominal third lowering raises pitch. The UI
allows these failures but does not label them successful twenty-two-count
demonstrations. The source's arithmetic `2×2 + 2×3 + 3×4 = 22` remains a
statement of its count list.

The default takes `p = 1200 log2(81/80)`, about 21.506290 cents. This yields
Ri = 10/9 and Dha = 5/3. The other preset takes `p=A/4`, about 50.977500
cents. It preserves the same ordered named matches with different Ri and Dha
frequencies. Neither choice is attributed to Bharata. Neither is 22 equal
divisions of the octave.

## What the learner manipulates

Preparing a different `p` retunes **both** systems. During each subsequent
lowering, the reference stays fixed. One physical cents scale is shared by the
two desktop rulers and the two phone columns. The orange target is the nearest
reference note to the selected moving note; actual coincidence links require
algebraic equality within floating-point arithmetic, not an invented hearing
tolerance. Source count, model interval in cents and actual model Hz stay
separate in the table and native CSV.

The continuous position control interpolates between adjacent named stages.
Equal movement of that slider is explicitly **not** equal pitch movement.
The UI displays the actual total and incremental lowering sizes. A narrow
epsilon resolves constructed floating equalities and is not used as a claim
about human consonance or perception.

The comparison adds no unobserved melody, instrument dimensions or performance
practice. It does not claim that twenty-two counts imply twenty-two specified
equally spaced frequencies. Cents, Sa = 110/220 Hz, sine fundamentals, timing
and amplitude envelopes are modern teaching choices.

## Sound and portable evidence

The existing shared Web Audio player and offline renderer use the same sine
graph. The pair choice sounds the nearest fixed note, the selected moving note,
then both together. Lower Ni keeps its actual lower-octave frequency. Fixed and
moving scale choices each sound eight notes including upper Sa. Compare-tunings
plays the default comma preparation first and the current preparation second.
Stop or any comparison edit cancels queued sound, including an outstanding
audio-resume operation. Measuring generated PCM is separate from measuring
speakers, hearing or a physical instrument.

Native JSON and the shared URL preserve all eight settings, including the
inactive free-value control, selected note, listening selection, reading and
source page. Unknown values, extra fields and duplicated query settings are
refused. A script-free illustrated HTML embeds the chosen WAV, rulers, numerical
CSV, editable JSON, all readings, eight complete verified pages, three fonts
and full notices. The SVG embeds its font, record and complete code/font notices.
Physical printing and tagged-PDF accessibility need separate evidence.

The watched Vite module parses the original authoritative public manifest JSON;
the downloadable JSON and bundled verifier therefore stay aligned. Source pages are checked before display; source and
font bytes are checked before illustrated export. Viewer revisions
prevent a late response from replacing the newly selected page.

The independent numerical oracle uses 70-digit Python Decimal frequency-ratio
chains, rather than importing this application's additive-cent construction.
It checks the full preparation inventory and the actual geometry/downloads
when a browser receipt is supplied. Browser and native audio evidence are
retained separately when the complete review is finished.
