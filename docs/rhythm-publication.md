# Rhythm room: public edition

The reviewed five-room edition is available at
[Pyknon / Rhythm](https://antonsoo.github.io/pyknon/rhythm.html).

| Boundary                | Observed identity or result                                                                                                                                                                                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reviewed implementation | `c91cdc576af85baf113fba182fe89e8d44c9340f`                                                                                                                                                                                |
| Published Pages branch  | `6a36cd6cb2f83f7b6b88175b02e231897186a34d`                                                                                                                                                                                |
| Pages build             | API reports `built` for that exact Pages commit                                                                                                                                                                           |
| Canonical hosted bytes  | All 53 current build files match their local SHA-256 identities; the directory URL matches the entry page before and after the inventory                                                                                  |
| Public browser          | Chromium 153 and Firefox 155 at 1440 and 375 px: actual rhythmic controls, live audio scheduling, Greek reading, native JSON/SVG/CSV/WAV/HTML files, portable source packet and five-room browser-offline navigation pass |
| Fresh public clone      | HTTPS clone of the reviewed source, Node 24.22.0, `npm ci`, `npm run check`; all 53 output files byte identical to the reviewed build                                                                                     |

[Hosted files](rhythm-hosted-files.json) ·
[Hosted browser operations](rhythm-hosted-browser.json) ·
[Public clone](rhythm-public-clone.json) ·
[Local review and stronger origin-disabled experiment](rhythm-review.md).

The hosted browser review disables browser networking after installation. It
does not shut down the public server. The separate local review destroys its
origin connections as well. Historical hashed assets are retained on the Pages
branch for already-open tabs; they are outside the current 53-file inventory.
A later documentation-only commit retains these observations without changing
the production inputs. This is a branch-based Pages publication, not a registry
release or a claim that hosted CI jobs executed.
