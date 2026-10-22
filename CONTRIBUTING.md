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
