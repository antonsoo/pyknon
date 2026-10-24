# The instrument must earn its ruler

Audience: the owner’s fluent English-speaking learner, curious about ancient
Greek musical thought, with no prior Greek or physics required. The object is
a string under examination, not a catalogue of instruments. Keep Pyknon’s
violet ink, warm paper, readable Greek and immediate play/stop controls.

Ptolemy, *Harmonics* I.8, describes testing a string before using its divisions
to investigate musical ratios. Compare the whole string’s halves, then the
right half’s halves. If the required agreement fails, move the trial to another
part or another string. The selected Greek, Wallis’s Latin and new English
explanations lead directly to six complete source pages (1682, pp. 33–38).

The modern lesson asks what these comparisons establish. Mirrored nonuniform
halves have identical fundamental frequencies. A second, finer comparison can
find their variation. A repeated mirrored pattern can pass both comparisons
and fail a still finer test. This last test and all mass profiles are modern
counterexamples, not patterns or an eighths test attributed to Ptolemy.

## Fixed assumptions and normalization

Small transverse displacements of a perfectly flexible string obey
`mu(x) * u_tt = T * u_xx`. Tension is constant and equal in every segment.
Supports are exact, immovable boundaries with zero displacement. Mass per unit
length is positive and piecewise constant in eight chosen cells. The chosen
relative density is between 1 and 4. We do not infer material thickness from
the diagram’s mass bars.

For the modern wave equation, see the [MIT 18.303 derivation](https://ocw.mit.edu/courses/18-303-linear-partial-differential-equations-fall-2006/22ead9d70b36836a68d13c7393e19649_waveeqni.pdf).
This physics is not attributed to Ptolemy. We omit string stiffness, bending,
stretch-induced changes of tension and density, damping, bridge compliance,
friction, finite bridge width, temperature and real gut manufacture. Inserting
a support in this model does not change tension or mass distribution. That is
an ideal comparison, not a physical reconstruction of his apparatus.

Set full length to 1 and reference density to 1. Choose tension so a completely
uniform whole string would sound at 110 or 220 modern Hz. Thus
`sqrt(T/mu0) = 2*f0`. A segment’s dimensionless frequency is calculated from its
actual distribution; its mean density is not substituted into the uniform
string formula. The selected tones are sine waves at the computed fundamental
frequencies, not simulated plucks, historical tuning or instrument timbre.

| Profile | Eight relative-density cells (h is the selected heavy density) |
| --- | --- |
| Uniform | 1, 1, 1, 1, 1, 1, 1, 1 |
| Heavy outer quarters | h, h, 1, 1, 1, 1, h, h |
| Repeating hidden variation | 1, h, h, 1, 1, h, h, 1 |
| Heavy left half | h, h, h, h, 1, 1, 1, 1 |

## Eigenvalue calculation

Write `u(x,t) = y(x) cos(omega*t)`. On a cell of relative density rho,
`y'' + lambda^2*rho*y = 0`, where `lambda = omega/(2*f0)`. Displacement and
slope are continuous across density changes because tension is the same.

The application propagates an unwrapped phase of `(y,y'/lambda)`. Within a
cell, rescaling to `(sqrt(rho)*y,y'/lambda)` gives a phase advancing by
`lambda*sqrt(rho)*cell_length`; rescale back at the boundary. The first fixed-end
mode ends at phase pi. Sturm comparison bounds it between
`pi/(L*sqrt(max rho))` and `pi/(L*sqrt(min rho))`. Sixty bisections isolate that
root without jumping to a higher mode. The dimensional frequency is
`f0*lambda/pi`. This also gives the uniform formula `f0/(L*sqrt(rho))`.

The drawn mode uses the exact sine/cosine transfer solution in each cell,
normalized to unit maximum displacement. Its vertical amplitude is arbitrary;
it is a stationary first-mode shape, not real-time string motion. Different
segments use equal horizontal scales. A separate pitch ruler uses log-frequency
position. A same-frequency audio control duplicates the first segment’s tone.

## Evidence and inference

Equal pitch means a numerical difference below 1e-7 cents in this exact model;
that threshold is floating-point bookkeeping, not a claim about human hearing.
No hearing threshold, historical precision or real material measurement is
inferred. The output always shows the two frequencies and their signed difference.

Ptolemy’s inference about unvarying constitution remains visible in the source
and notes. The app does not silently turn his test into a modern sufficient
condition. Passing two comparisons cannot prove an arbitrary density function
constant; even perfect agreement of every mode of two reflected pieces cannot
distinguish their orientation. The repeating example demonstrates that limit
within this stated, bounded model.

Greek excerpts retain Wallis’s wording, with Unicode/ligature normalization,
joined lines and capital segment letters in place of barred lowercase letters.
They are explicitly excerpts, not a continuous translation of I.8. Greek Η is
Wallis’s Latin G, and Greek Λ is Latin L. The 1682 Latin is Wallis’s translation,
not an ancient Latin original. The Greek text’s apparatus and Wallis’s diagram
discussion are included in the complete scans.
