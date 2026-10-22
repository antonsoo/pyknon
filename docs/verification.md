# Verification record

## Clean local artifact

The production build came from source `7f72aa4cf619e7c78c239d7e761948b8bf61d502`
in a fresh exported checkout with Node 24.22.0 and `npm ci`. Lint, strict type
checking, the three behavioral tests, build and the independent source-number
oracle passed. The browser harness subsequently received one test-only fix in
`036e79a`: it waits for asynchronous clipboard feedback. Production inputs did
not change. The documented development command was also opened in Chromium;
keyboard selection, playback and Stop were exercised.

[Build inventory](build-review.json) records all production inputs and 12 output
files totaling 2,157,543 bytes. The input digest is
`c21b6a69464ad1598e85a755411ded6db7fc961a1fd8263f2da907d3322dc70d`.
This identifies the reviewed artifact independently of later documentation
commits.

## Numerical and signal checks

The [ratio oracle](ratio-review.json) independently derives frequencies from
Wallis's printed integers with Python `Fraction`; the TypeScript app multiplies
adjacent intervals. All 18 supported configurations and 288 floating-point
comparisons agree within 1e-10, with exact rational results and sequence order
also checked.

The [audio report](audio-review.json) analyzes 38 actual browser-downloaded WAV
files: all 18 configurations in each browser and one additional phone export
per browser. It measures 304 tones using interpolated positive zero crossings
in the steady part of each tone. Expected frequencies come from the printed
source integers, not from the app's audio plan. Maximum error was below 0.009
cents against a 0.02-cent threshold. Duration, peak amplitude, silent gaps, and
attack/release boundaries were checked separately.

The signal study covers generated PCM. It does not establish physical speaker
output, a listener's discrimination, or historical performance practice. The
reports retain each WAV's hash and measurements; the complete temporary WAV
corpus is reproducible with the browser script. One actual
[enharmonic export](../examples/enharmonic-220.wav) is retained in the repository.

## Browser and document review

The [browser record](browser-review.json) covers Chromium and Firefox at 1440
and 375 pixels. It checks native keyboard genus selection, individual notes,
all four vocabulary entries, source-to-listening navigation, sharing and HTML/WAV
downloads. Twenty-four axe checks cover six visible states per configuration.
No document-level overflow, page errors or external application requests were
observed. Automated accessibility checks are bounded checks, not certification.

The live player is instrumented transparently: native AudioContexts and
oscillators still execute. Stop cancels all eight queued oscillators; stopping
during a deliberately delayed native resume schedules no replacement tones.
The close-note lesson completes and resets its indicator. The review found and
fixed an actual Firefox Stop failure caused by an unsupported audio API.

For offline review, the test HTTP server destroys incoming connections. The
page is reloaded and playback is exercised; all three cached source scans must
match the build's SHA-256 hashes. This distinguishes a cached offline edition
from an online success or a browser-level network flag alone.

The [desktop](assets/listening-desktop.png) and
[phone](assets/listening-phone.png) screenshots were visually inspected. All
three bundled source images were also inspected. Saved HTML was opened as a
local file in both browsers at both widths, with no external requests or page
overflow. Its [one-page PDF](../examples/enharmonic-220.pdf) was inspected
visually, and its Greek label, source attribution and measurements were checked
with `pdftotext`. The [HTML example](../examples/enharmonic-220.html) is a direct
browser download, not a separately recreated document.

## Public hosting

A successful local review is separate from publication. The public byte receipt
and HTTPS workflow report will record the actual published artifact and its
exports after deployment.
