# Retained examples regenerated, 2026-11-25

The retained readings, drawings and PDFs of all eight rooms were regenerated on
2026-11-25 for the author-name and license change, by running each room's
browser review against a build of commit `011292f` (Chromium 153 and
Firefox 155, 1440 and 375 px). The retained files are the Chromium 1440 px
downloads; readings that were gzip-compressed before are stored with
`gzip -9 -n`. The musical-signs reading and PDF come from the public-site run,
as before, so that the reading's "open these settings" link names the public
lesson.

| Room          | Regenerated files                                                                      | Script                         |
| ------------- | -------------------------------------------------------------------------------------- | ------------------------------ |
| Seikilos song | `seikilos-reading.{html,pdf}`                                                          | `scripts/song-browser.mjs`     |
| String trial  | `string-trial-reading.{html,pdf}`                                                      | `scripts/trial-browser.mjs`    |
| Rhythm        | `rhythm-reading.{html,pdf}`                                                            | `scripts/rhythm-browser.mjs`   |
| Tension       | `tension-reading.{html.gz,pdf}`                                                        | `scripts/tension-browser.mjs`  |
| Two vinas     | `two-vinas-reading.{html.gz,pdf}`, `two-vinas-plate.svg`                               | `scripts/vina-browser.mjs`     |
| Halves        | `halves/16-17-18.svg`                                                                  | `scripts/halves-browser.mjs`   |
| Musical signs | `musical-signs-reading.{html.gz,pdf}`, `musical-signs.svg`, `musical-signs-tables.svg` | `scripts/notation-browser.mjs` |
| Helikon       | `helikon-reading.{html.gz,pdf}`, `helikon-diagrams.svg`                                | `scripts/helikon-browser.mjs`  |

What changed: the credit lines name Anthony Mercer, and the embedded code
license is the PolyForm Noncommercial text with its required notice instead of
the MIT text of the October captures. Nothing else in the saved HTML or SVG
changed. Every CSV, JSON record and WAV beside them came out byte-identical and
was left as it was. The PDFs keep their page counts except Helikon's, which grew
from 25 to 27 pages with the longer license.

Checks on the regenerated files: `helikon-artifacts.py`,
`notation-artifacts.py`, `vina-artifacts.py`, `halves-artifacts.py` and
`trial-print-review.py` passed. Public-site runs of the rhythm, tension, vina,
trial, notation and Helikon rooms saved the same files as the local build, byte
for byte (apart from the musical-signs reading's settings link).

Receipts replaced by that day's runs: `seikilos-browser.json`,
`rhythm-browser.json`, `rhythm-hosted-browser.json`, `trial-browser.json`,
`trial-hosted-browser.json`, `trial-print.json`, `helikon-artifacts.json`,
`helikon-pdf-artifacts.json`, `helikon-hosted-artifacts.json`,
`helikon-pdf-hosted-artifacts.json` (the current checker prints a summary
without per-file hashes), `tension-review/browser.json`,
`tension-review/public-browser.json`, `vina-review/browser.json`,
`vina-review/public-browser.json`, `vina-review/artifacts.json`,
`vina-review/public-artifacts.json`, `notation-review/artifacts.json` and
`notation-review/public-artifacts.json`. The retained-file manifests
(`rhythm-artifacts.json`, `tension-review/examples.json`,
`vina-review/examples.json`, `notation-review/examples.json`) list the new
sizes and hashes.

Left as October records, so their hashes describe the earlier captures:
`canon-song-browser.json`, `trial-development.json`,
`trial-clean-development.json`, `navigation-workflows.json`,
`navigation-hosted-workflows.json`, and the Helikon clean-build, PDF-structure,
hosted-retained, fault and offline-response receipts. They record checks of the
earlier builds.
