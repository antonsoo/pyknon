# Public structured reading verification

Checked 2026-10-27. This records the structured-reading edition after the initial
workshop publication. It is separate from the original receipts and from any
later worker or content edition.

| Boundary                         | Observed result                                                                                                           |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Clean source build               | Node 24.21.0 / npm 11.19.0; [all 115 files reproduced](helikon-pdf-clean-build.json)                                      |
| Canonical hosted build           | 115 of 115 files match; directory index before and after; no query cache-busting                                          |
| Complete hosted browser journeys | Chromium / Firefox, 1440 / 375 px; controls, sources, downloads, script-free native files, complete-cache offline reloads |
| Public discovery                 | Four catalogue search -> actual workshop -> pinned review journeys                                                        |
| Pinned retained files            | PDF, compressed HTML and both PDF-render PNGs match their source bytes                                                    |
| Actual hosted-export PDF         | 25 pages, 18 correctly bound main language paragraphs, 13 heading bookmarks                                               |
| Whole historical JPEGs           | 8 originals remain bound to their own descriptions                                                                        |
| Pages service                    | Branch build reports `built` for `fcf3288f08fbc774bd992fa3830e73dd0b52fa9d`                                               |
| Source workflows                 | CI and source Pages jobs report failure with empty step lists; these are not passing checks                               |

[Canonical file receipts](helikon-pdf-hosted-files.json) ·
[Browser work](helikon-pdf-hosted-browser.json) ·
[Native artifacts](helikon-pdf-hosted-artifacts.json) ·
[Actual export structure](helikon-pdf-hosted-structure.json) ·
[Pinned source artifact bytes](helikon-pdf-hosted-retained.json) ·
[Catalogue journeys](helikon-pdf-hosted-discovery.json) ·
[Separate deployment/workflow status](helikon-pdf-hosted-delivery.json).

The runtime was deployed from source `231f43afe54eeffa133ba4b9f4150ef1069358ab`. Source
synchronization and a Pages build are not substituted for browser operation or
hosted-file identity. The four public native readings are independently audited
against the source manifests, fonts, licenses and actual model outputs.

The committed PDF and decompressed HTML were downloaded from immutable raw
source URLs and inspected again. Their paragraph texts/languages, table scopes,
figure descriptions/original image identities, bookmark hierarchy and page
assignments match the new PDF generated from the public app. The bounded content
profile SHA-256 is `710eebd4e74e4e9824f79f478c25113847246863941c9c190d60a4c5f25e9711`. The PDFs have separate file hashes because a new
browser print has its own metadata; no byte-equivalence claim is made between
two separate print operations.

An earlier hosted attempt read the controls immediately after a history
navigation and failed. The driver now requires the intended history URL and its
rendered settings together; all four public configurations retain those two
URLs. A separate forty-cycle Chromium/Firefox check restored both states. No
production history handler changed in this phase.

The original page images remain facsimiles, with selected passages available
as structured text. PDF/UA certification, screen-reader playback, physical
printing and independent philological review remain unverified. See the
[structure review and repeatable commands](helikon-pdf-review.md).
