# Three middles: publication record

Checked 2026-10-27 UTC. The [local direct review](halves-review.md) and
[model/source account](halves-model.md) describe different claims from publication.

| Layer                     | Evidence                                                                                                                                                                                                                                                             |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public source             | `35adb9fac29cfcda32c2334cfbd39004cc769481`, fetched through a fresh HTTPS GitHub clone                                                                                                                                                                               |
| Fresh install and check   | Node 24.21.0; `npm ci`, `npm run check`; lint, strict types, 30 unit checks, production build; all 92 built files identical to the reviewed build                                                                                                                    |
| Development quickstart    | documented dev command served both new and vīṇā rooms in both browsers; verified pages loaded without module errors; a temporary manifest edit was read by the watched virtual module, then restored with a clean tree                                               |
| Static publication        | fast-forward gh-pages commit `20effb5d92b4e09971af933685e6e9856a8c4b54`, retaining older hashed assets; Pages API reported legacy gh-pages root and a completed build                                                                                                |
| Hosted bytes              | every one of 92 canonical current files matched the reviewed build before and after the public browser replay, including the worker and complete source pages                                                                                                        |
| Public browser            | Chromium 153.0.8010.12 and Firefox 155.0, each at 1440 and 375 px; actual source bytes, controls, live audio, imports, explicit link, native downloads, complete 91-entry current cache and browser-offline reload/save                                              |
| Public portable artifacts | all four actual downloaded readings opened without scripts or browser networking; all nine original source images, three fonts, complete notices, seven complete trilingual readings and nineteen word notes; four native downloads matched their embedded originals |
| Public sound and print    | sixteen browser-exported WAVs independently measured; native reading printed to twenty pages with complete searchable passages/notes and nine byte-identical JPEGs recoverable; 2,389 words within 25-point margins                                                  |
| Remote workflow execution | CI run 40461316597 and Pages workflow run 40461316813 ended in failure before any job steps; neither is a passing check or evidence of deployment                                                                                                                    |

The actual public replay starts at Pyknon's home page and uses **Three middles**
to reach the lesson. It exercises the whole-number candidate, three continuous
middles, scale doubling, root neighbours, printed 9–12 pair, 4–6–9 control,
all readings/word notes and source pages, source zoom with keyboard panning,
strict imports, finite sound graph and native saves. Native HTML is then opened
with scripts and browser networking disabled. The remote GitHub server was not
stopped: **public offline evidence is a browser-networking test**. The local
review separately refused actual origin requests and tested the authentic
seven-room worker upgrade.

The prior static edition used for the upgrade was gh-pages
`0bd4b0e3e3bdfc435ab400fa9ff5a28dbb4ff29f`, before the new build was overlaid.
Source substitution and held-page failures never established early readiness.
An older open tab acknowledged the different edition and reloaded; all eight
rooms and the new reading save then worked with the origin refusing requests.

Receipts: [fresh build](halves-review/clean-build.json),
[development](halves-review/development.json),
[hosted before](halves-review/hosted-before.json),
[public browser](halves-review/public-browser.json),
[portable/print](halves-review/public-artifacts.json),
[measured PCM](halves-review/public-audio.json),
[hosted after](halves-review/hosted-after.json).

Reproduce the hosted layer with the retained checker and reviewed `dist/`:

```sh
node scripts/halves-hosted.mjs https://antonsoo.github.io/pyknon/ /tmp/pyknon-hosted.json
node scripts/halves-browser.mjs /tmp/pyknon-public https://antonsoo.github.io/pyknon/
python3 scripts/halves-artifacts.py /tmp/pyknon-public
python3 scripts/halves-wave-oracle.py /tmp/pyknon-public/review.json
```

Source copies, exact model results, artifact identities and browser behavior do
not settle authorship, philological interpretation, historical performance,
physical speaker output, listener thresholds or physical printing. Those
limits remain in the lesson and the retained reading.
