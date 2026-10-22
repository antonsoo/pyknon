# Six tones and an octave

This room serves the English-speaking learner in the project brief: someone
curious about ancient Greek music who wants to hear a mathematical claim and
learn the Greek and Latin that express it. Use Pyknon's existing quiet reading
desk, Plex controls, Noto Greek and purple ink. The distinctive object is a
seven-number ancient proof, connected to two audible routes through an octave.

The question is narrower than a survey of temperaments: can six 9:8 intervals
make a 2:1 octave? The answer in the _Sectio canonis_ is no. Proposition IX
constructs seven whole numbers; XIV uses that arithmetic to make the musical
claim. Attribute the work as transmitted under Euclid's name, without resolving
authorship or dating it to a particular year. Do not import Archytas's distinct
tetrachord divisions into this argument.

```text
Tetrachords / Read a song / Six tones

Six whole tones. An octave. A small disagreement.

Select a step: 0 1 2 3 4 5 6       Modern reference
Two routes on the same cents axis: 9:8 / six equal octave divisions
An explicitly enlarged detail of the selected pair
Choose sound / Play / Stop         Current frequencies and beat rate

Seven numbers, six multiplications
Selected integer and its one-eighth increase / exact comparison

Read XIV in Greek, Latin and a new English translation
Select a proof sentence or a word / inspect the complete printed page
Source packet / saved illustrated reading / CSV / generated WAV
```

Both routes share one pitch scale; the enlarged detail has its own labeled
scale. On phones the full route turns vertical. Every selection has a native
button or select; no dragging, hover, or sound is necessary to understand it.
Playback highlights points but never moves focus or scrolls the document.

The modern comparison uses six equal intervals of 200 cents, each with ratio
2^(1/6). It is a deliberately changed premise, not the source's 9:8 tone or a
recovered ancient temperament. At step six it reaches exactly an octave. The
other route reaches 531441/262144 of its starting frequency. Their relative
ratio is 531441/524288, commonly called the Pythagorean comma.

Simultaneous tones make the frequency difference audible as beats. Include a
same-frequency two-tone control so amplitude changes do not masquerade as the
effect. Use the same finite sine oscillator graph for live sound and WAV.
State that this is a modern acoustic demonstration, not an ancient description
of beating or an instrument reconstruction.

Source: Heinrich Menge's 1916 Greek/Latin edition, _Euclidis opera omnia_ VIII,
printed pp. 170–175, PDF pp. 228–233 in the California copy. The Toronto copy
clips right edges on some Greek pages and its OCR corrupts several integers;
use complete California scans and visually check every transcribed integer.
Bundle all six pages, including XII and XIII, so XIV's musical premises can be
inspected. The selected passages are public-domain text, normalized only for
Unicode, line breaks and the edition's theta letterform; editorial brackets
remain visible. Latin is Menge's translation, not an ancient Latin original.

Validate exact products independently with Python fractions, actual browser
controls and exported PCM against the source progression. Inspect desktop,
375px and printed pages; prove all three rooms and six new scans load with the
origin unavailable. Keep local build evidence separate from publication.
