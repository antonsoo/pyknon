# Weighted-string publication, 2026-10-25

The [Nicomachus experiment](https://antonsoo.github.io/pyknon/tension.html#weights)
is published. The owner explicitly authorized pushing before publication.

| Boundary                                     | Independently recorded identity                                    |
| -------------------------------------------- | ------------------------------------------------------------------ |
| Product in the fresh Node 24.22 build        | `65540c0`                                                          |
| Reviewed source and artifacts pushed to main | `8e0ac2a9e8525a345582ffbbabaf29072e97b24c`                         |
| Pages branch deployment                      | `35fcaf969bebce770cdf70c88cbf2bad71afe34c`                         |
| Complete edition                             | `5849b27213ca5876f801c249e12d6b0317b35eaea176f464d2e67b39ebe0c926` |

`npm run build` produces `dist/`, base `/pyknon/`. The build was reproduced
byte for byte from a new Node 24.22 clone with a fresh `npm ci`. The existing
Pages branch was overlaid with that reviewed build, retaining old hashed
assets, then pushed normally. The Pages API identified `gh-pages` as the source.
No CI result or package registry release is claimed.

All **65 canonical production files**, without cache-busting queries, returned
HTTP 200 and the exact expected byte counts and SHA-256 hashes.
[Complete hosted file receipt](tension-review/hosted-files.json).
The [local build receipt](tension-review/build-identity.json) remains separate.

`node scripts/tension-browser.mjs /tmp/pyknon-public https://antonsoo.github.io/pyknon/`
then exercised the actual public origin in Chromium 153.0.8010.12 and Firefox
155.0, at **1440 and 375 px**. Exact load entry, both repair buttons, fixed
source targets, live audio and Stop, all source readings, all eight displayed
page hashes, native WAV/CSV/SVG/JSON/HTML downloads, JSON reopening and rejected
malformed settings passed. The independently opened HTML played its embedded
audio without HTTP rendering requests. Axe found no violations; page errors
and horizontal document overflow were absent.

The matching worker and complete **64-resource cache** preceded readiness.
With browser networking disabled, all six public room URLs were visited, a
fractional replacement load survived reload, the Latin source opened, and a
complete illustrated reading was saved. The public origin remained available;
the [local review](tension-review.md) separately stopped its origin and tested
held/substituted pages and genuine existing-tab upgrades.
[Complete public browser receipt](tension-review/public-browser.json).

The independent PCM oracle also checked **24 actual public-button WAV files**,
including phase drift, numerical amplitude, predicted frequency and complete
envelope. [Public audio receipt](tension-review/public-audio.json).
These observations establish the specified digital model and served product,
not an ancient performance or physical experiment.
