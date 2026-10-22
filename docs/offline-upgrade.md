# Offline editions acknowledge completion

When a new lesson entry arrives before its matching worker is available, the page initially has an older offline edition. The earlier implementation inspected that worker once. After a complete new worker took control, the footer still asked the visitor to reload online. This was reproduced in Chromium and Firefox with the actual pre-octave Pages build, `e236d25a108317bdcf2d359c0485a40578c98b39`.

The fix re-inspects on a controller change, requires the current page’s edition identity and a complete file inventory, and prevents a late older reply from replacing the current result. It also inspects an existing controller while registration waits behind an unfinished installation. Registration and inspection failures have bounded waits; a later controller change can still recover.

Runtime source: `2ce661dd89bab70e78210c3e6beb898b1cdefa2f`. The new offline helper is shared by the octave proof, Archytas bench and Seikilos reader. The tuning, historical readings, source scans and synthesis code are unchanged.

| Controlled case                                            | Before                                                                   | After                                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| New lesson precache delayed, then completed                | Footer stays stale after new worker takes control                        | Complete new edition acknowledged automatically                       |
| HTTP 200 with an older entry instead of the octave page    | Integrity rejects installation; status remains stale after correct retry | Wrong bytes rejected; readiness follows complete correct installation |
| Actual old inspection reply delivered after the new result | Not part of the before comparison                                        | Earlier reply cannot overwrite readiness                              |

The entry/worker publication gap is deliberately controlled by a local server. It is not a claim that the public host was observed in that state. Network bytes and an actual message-channel response are delayed; the script does not fabricate cache status. [Four before cases](offline-upgrade-before.json) and [six final cases](offline-upgrade-after.json).

Every completed upgrade then reloads the octave page offline, plays and stops sound, saves the illustrated Greek/Latin reading, visits Archytas’s enharmonic division and Seikilos’s final syllable, and returns to the octave proof. Source scans and fonts are part of the integrity-checked complete edition.

A fresh archive and `npm ci` under Node.js 24.21.0 / npm 11.19.0 passed lint, strict typecheck, eleven existing tests, the production build and all three independent mathematical oracles. All twenty-nine output files match the working Node.js 26.7.0 build byte for byte; [build inventory](offline-upgrade-build.json). The [initial octave review](canon-review.md) remains a historical receipt of the earlier edition.

Reproduce the controlled upgrade:

```sh
npm ci
npm run build
git fetch origin gh-pages
mkdir -p /tmp/pyknon-pre-octave
git archive e236d25a108317bdcf2d359c0485a40578c98b39 | tar -x -C /tmp/pyknon-pre-octave
node scripts/offline-upgrade.mjs /tmp/pyknon-pre-octave /tmp/pyknon-upgrade/after.json after
```

Install the matching Playwright Chromium and Firefox browsers first. The script owns a temporary HTTP origin, loads both builds into immutable inventories before starting, and closes its browsers and server. Each saved reading remains a real browser download.

The complete octave workflow was repeated in both engines at 1440 px and 375 px; [browser receipt](offline-upgrade-canon-browser.json). All 170 newly downloaded WAVs match the previously independently measured corpus by SHA-256. The new native illustrated reading is also byte-identical to the earlier reviewed source packet; [artifact comparison](offline-upgrade-artifacts.json). The change therefore preserves the existing numerical, source-image, font and audio artifacts.

## Published update

Source `5f31c9f3bf01cc007b9f5f3eb8fe0c5bff9df4d3` and Pages `dab0411fcfc4e7074a2560f3d278055f2da9f05c` publish this update. [All twenty-nine canonical public files](offline-upgrade-public-bytes.json) match the reviewed build; the root entry is checked before and after the inventory, with no query-string cache busting. [Twelve earlier public hashed assets](offline-upgrade-public-assets.json) remain byte-identical.

[Four hosted workflows](offline-upgrade-public-browser.json) repeat keyboard playback, actual WAV and HTML downloads, source-scan SHA-256 checks and the offline three-room journey in Chromium and Firefox at 1440 px and 375 px. Native reading bytes match the reviewed local packet, and selected WAVs match the independently measured corpus. [Publication receipt](offline-upgrade-publication.json). Later documentation-only commits do not alter this runtime edition.
