# Contributing

Use Node.js 24 or later and Python 3. Clone the repository, run `npm ci`, then
`npm run dev`. The local URL is printed by Vite.

Keep historical claims traceable to a primary text or original research. New
ratios need a source, an explicit interval direction and an independent check.
Do not label synthesized audio as a reconstructed ancient performance.

Run `npm run check` and `npm run verify:ratios`. For changes to playback,
rendering or controls, install Chromium and Firefox with
`npx playwright install chromium firefox`, run `npm run test:browser --
/tmp/pyknon-review/browser.json`, then
`python3 scripts/audio-oracle.py /tmp/pyknon-review/browser.json`.
The browser script serves the built `dist` itself and disables that origin to
check offline operation. Inspect any screenshots it produces. Do not rebuild
`dist` during its run.

Small fixes with a reproduced user-facing problem are welcome. Include the
observed behavior and what changed. Preserve source and font notices.

For the Seikilos reader, also run `npm run verify:song`,
`npm run test:song -- /tmp/pyknon-song-review/browser.json`, and
`python3 scripts/song-oracle.py /tmp/pyknon-song-review/browser.json`.
Inspect the contact sheet of all source selections as well as the page views.
The museum photographs and annotated presentations are CC BY-SA 4.0; preserve
those credits and terms independently of the MIT code license.

For the two-vīṇā room, keep the source count list, a modern acoustic assumption
and a proposed historical interpretation separate. The reference difference
is a free modern parameter; do not describe the presets as frequencies
specified by Bharata. Primary-language list order alone does not add the
English word “respectively”. Read `docs/vina-model.md` before changing pairings.

```sh
npm run verify:vina
npm run test:vina -- /tmp/pyknon-vina-review
python3 scripts/vina-oracle.py --browser /tmp/pyknon-vina-review/review.json
npm run verify:vina-files -- /tmp/pyknon-vina-review
uv run --python 3.12 --with numpy==2.4.4 python3 scripts/vina-wave-oracle.py /tmp/pyknon-vina-review/review.json
```

With `npm run preview` serving the production build, also run
`npm run test:vina-integrity -- http://127.0.0.1:4329/pyknon/ /tmp/pyknon-vina-integrity`.
It completes an older response, substitutes valid but wrong page/font files,
checks verified retry, edits a pending export and delays a real file import.
For upgrades, pass the previous build and receipt path to
`npm run test:vina-upgrade -- "$PREVIOUS_DIST" /tmp/vina-upgrade.json`.
Keep local, clean-build, public-hosting, browser and generated-PCM evidence
separate. Physical speakers and historical instrument performance are not
measured by the WAV oracle.
