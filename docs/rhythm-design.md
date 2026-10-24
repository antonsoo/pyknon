# Rhythm room: design before implementation

The existing Pyknon site gives pitched experiments and a song reading. This
room adds two levels of temporal organization: a foot's fixed division and the
smaller attacks supplied by rhythmic composition. The primary job is to hear
and see how six primary times can remain six while their genus changes.

| Role                  | Token                                  |
| --------------------- | -------------------------------------- |
| Page                  | existing Pyknon light ground `#faf9f5` |
| Score                 | white `#ffffff`                        |
| Up portion            | existing ink violet `#36275e`          |
| Down portion          | deep teal `#176477`                    |
| Source/secondary text | existing muted `#675e72`               |
| Rules and unit grid   | existing grey violet `#d9d2df`         |

Plex carries controls and measurements; Noto Serif carries the Greek reading.
Keep the site's fonts and navigation identity. Let the two coloured lengths,
their shared duration grid and the moving division carry the memorable visual.
No decorative waveform, reconstructed dancer, invented instrument or facsimile
texture. Do not turn arsis/thesis into unqualified modern strong/weak beats.

```text
Six times. Two different rhythms.
[ Six / Five / Seven source experiments ]
[ whole count ] [ up count ] [ reverse portions ] [ unit duration ]
Reference  0 |--- up ---|--- down ---| 6
Chosen     0 |-- up --|---- down ----| 6
             same outer duration; different division
[ inner attacks: each unit / join within each portion ]
[ hear chosen ] [ compare reference and chosen ] [ stop ]
[ exact genus and duration statements ]

An intermediate foot: keep down fixed at two
2 down + 1 up / 2 down + 1.5 up / 2 down + 2 up
Greek reading + word notes | full printed page with zoom
Save diagram / timing CSV / WAV / complete reading / JSON
```

At 375 px both scores remain full-width, with ordinary text for exact ratios.
Controls precede the figures. The source viewer supports real zoom and keyboard
scrolling; the complete page remains available. Diagrams animate only in response
to playback and use the audio clock. Reduced-motion users retain a textual
playback state without moving highlights.

Critique: adding another pitch-like horizontal slider would conceal the
hierarchy between a foot and its internal divisions. The score therefore has
separate portion bars, fixed unit ticks and optional attack marks. The second
experiment uses three finite examples, avoiding an automatic classifier for
all possible 'irrational' rhythms that the source does not establish.
