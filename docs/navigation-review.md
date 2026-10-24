# Four rooms on a phone

Reviewed 2026-10-24 after publishing the string examination. Final visual
inspection found that the inherited narrow-header rule hid the last link.
On the fourth room that link is **String trial**, so the current room vanished
from its own navigation. The 320-pixel inspection also reproduced whole-page
horizontal overflow in the song and octave rooms; the octave arithmetic grid
expanded to its table's minimum width.

The shared phone header now places the brand above wrapping links and retains
every room, the source/code link where present, and the Greek brand. Room links
have a 32-pixel minimum height. The tetrachord room now also identifies its
current link with `aria-current="page"`. The arithmetic grid lets its children
shrink, so its wide number table scrolls inside its focusable region instead
of expanding the document.

[Before](assets/trial-navigation-before.png) / [after](assets/trial-navigation-phone.png)
phone headers. [320-pixel number table](assets/canon-integers-phone.png),
scrolled to the exact ratios with the keyboard-focus outline retained.

## Real navigation and portable readings

[Navigation receipt](navigation-review.json): the actual frozen preceding
four-room build is inspected at 320 and 375 pixels in Chromium and Firefox.
Both reproduce the missing trial link and the 320-pixel page overflows.
The revised build is inspected at **320, 375 and 1440 pixels** in both engines:
all four room links fit within the viewport, every room has exactly one current
link, and no page overflows horizontally. Every directed room-to-room route
is reached with native **Tab then Enter**: 12 routes per configuration,
**72 in total**. No page errors were observed. Header screenshots from all
four rooms and the arithmetic table were inspected visually.

At 320 pixels both engines focus the integer table, move it with ArrowRight,
scroll to its last column and confirm that the document remains 320 pixels
wide. Each actually saves the octave HTML, opens it from disk with browser
networking disabled, decodes the Greek font and all six complete source pages,
and compares the embedded JPEG bytes with the build. The saved octave HTML
includes the small CSS correction; its content and model are unchanged.

[Workflow receipt](navigation-workflows.json): the complete trial reading,
source, keyboard, export and offline workflow passes again in both engines at
1440 and 375 pixels. All four native trial formats and the **16 selected WAVs**
are byte-identical to the earlier independently measured corpus. The trial
model, source text, source assets and sound synthesis are unchanged. The earlier
[148-WAV signal inspection](trial-audio.json) remains the measurement evidence;
no new physical listening or instrument claim is made. All four app rooms are
usable offline. The controlled wrong-source rejection and correct retry also
pass in both engines. Automated accessibility scans find zero violations.

`npm run check` passes lint, strict typecheck, 15 existing unit checks and the
production build. The browser reviewer below checks the frozen build itself;
do not rebuild while it runs. Native trial parity is compared by exact SHA-256
with `docs/trial-browser.json`, separately for each browser and width.

```sh
node scripts/navigation-review.mjs /path/to/preceding-four-room/dist /tmp/music-navigation
node scripts/trial-browser.mjs /tmp/music-navigation-workflows '' production --quick
```

## Publication

A fresh local Git clone of `3340ee9`, installed with `npm ci` under
**Node.js 24.21.0**, passes lint, strict typecheck, 15 existing checks and the
production build. All **39 output files** match the browser-reviewed bytes,
and the fresh tree remains clean; [clean-build receipt](navigation-clean-build.json).
Public publication is recorded below after the hosted files are verified.
