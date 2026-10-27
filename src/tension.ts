import "./style.css";
import "./tension.css";
import { Player, renderWav } from "./audio";
import {
  NOTE_NAMES,
  REPAIRED,
  ratioText,
  SOUND_NAMES,
  SOURCE_WEIGHTS,
  type TensionSound,
  tensionCSV,
  tensionDefault,
  tensionFromQuery,
  tensionImport,
  tensionJSON,
  tensionPlan,
  tensionQuery,
  tensionRows,
  value,
  weight,
} from "./core/tension";
import { at } from "./core/tetrachord";
import { offline } from "./offline";
import {
  dataUrl,
  sourceArchive,
  sourceCaption,
  sourcePage,
  TENSION_SOURCES,
  verifiedBytes,
} from "./tension-assets";
import { TENSION_LIMITS, TENSION_PASSAGES, TENSION_WORDS } from "./tension-content";
import { te, tensionDrawing, tensionRuler, tensionSvg, tensionTable } from "./tension-drawing";
import { tensionStudy } from "./tension-study";

function get<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing ${id}`);
  return el as T;
}
const initial = tensionFromQuery(location.search);
let state = initial.state,
  sourceRevision = 0,
  sourceUrl = "",
  shownPage = "",
  playing = false;
const player = new Player();
get("app").innerHTML =
  `<a class="skip" href="#weights">Skip to the weights</a><header class="site-header"><a class="brand" href="./">PYKNON<span lang="grc">πυκνόν</span></a><nav aria-label="Main"><a href="./#listen">Tetrachords</a><a href="./song.html">Read a song</a><a href="./canon.html">Six tones</a><a href="./trial.html">String trial</a><a href="./rhythm.html">Rhythm</a><a href="#weights" aria-current="page">Weighted strings</a><a href="./vina.html">Two vinas</a></nav></header>
<main class="ts-main"><section class="ts-intro"><h1>Double the weight.<br/>Half the octave.</h1><div><p>Nicomachus’s account of Pythagoras calls weights <strong>12 and 6</strong> an octave. His strings have equal length. Does the inference survive an ideal string model?</p><p>Hear the claim. Keep the lengths fixed. Find the loads that would actually give those frequency ratios.</p><a href="#ts-reading">Read the Greek and Meibom’s Latin ↓</a></div></section><p id="ts-notice" class="ts-notice" role="status" ${initial.notice ? "" : "hidden"}>${te(initial.notice)}</p>
<section id="weights" class="ts-section" aria-labelledby="ts-title"><div class="ts-heading"><h2 id="ts-title">Keep the strings equal.</h2><p>Source numbers stay fixed.<br/>Your replacement loads are separate.</p></div><div class="ts-bench"><div class="ts-desk"><div id="ts-drawing"></div><p class="ts-caption">Solid bars: your loads. Hollow outlines: original loads. Bar height encodes relative weight. Every vibrating length stays equal; dashed curves mark an arbitrary first-mode shape. These separate columns compare strings, rather than reconstructing the account’s common peg.</p></div><div class="ts-adjust"><p class="ts-label">CHOOSE A STRING TO INVESTIGATE</p><div class="ts-notes" role="group" aria-label="Adjustable strings">${[1, 2, 3].map((i) => `<button type="button" data-ts-note="${i}">${at(NOTE_NAMES, i)}<span>Source ${at(SOURCE_WEIGHTS, i)}</span></button>`).join("")}</div><p id="ts-target"></p><label for="ts-weight">Your hanging load</label><input id="ts-weight" type="range" min="6" max="30" step="any"/><form id="ts-weight-form"><label for="ts-exact">Exact weight <span>(6–30 units)</span></label><div class="ts-input-row"><input id="ts-exact" type="text" inputmode="decimal" required maxlength="22" autocomplete="off" spellcheck="false" aria-describedby="ts-input-help ts-input-error"/><button type="submit">Apply</button></div><p id="ts-input-help" class="ts-caption">A number such as 12, 13.5 or 32/3. Load 6 stays fixed. No conversion to kilograms is implied.</p><p id="ts-input-error" role="alert"></p></form><div id="ts-result" class="ts-result" aria-live="polite"></div><div class="ts-small-actions"><button type="button" id="ts-restore">Restore this source load</button><button type="button" id="ts-reset">Restore all source loads</button></div><details><summary>Show the exact repair</summary><p id="ts-repair-explanation"></p><button type="button" id="ts-repair">Apply this repair</button><button type="button" id="ts-repair-all">Apply all three repairs</button><p class="ts-caption">Modern replacement weights. The ancient text is retained unchanged.</p></details></div></div>
<div class="ts-listening"><label>Listening choice<select id="ts-sound">${Object.entries(SOUND_NAMES)
    .map(([key, name]) => `<option value="${key}">${te(name)}</option>`)
    .join(
      "",
    )}</select></label><label>Modern low reference<select id="ts-root"><option value="220">220 Hz</option><option value="110">110 Hz</option></select></label></div><div class="ts-transport"><button type="button" id="ts-play">Hear comparison</button><button type="button" id="ts-stop" disabled>Stop sound</button><p id="ts-playing" role="status">No autoplay. Synthetic sine fundamentals.</p></div><p id="ts-sequence-note" class="ts-caption"></p><div id="ts-ruler" class="ts-ruler"></div><p class="ts-caption">One octave = 1200 cents. Original source numbers label the pitches in every row. Orange marks the selected note. Only the third row changes with your replacement loads.</p><details><summary>All frequencies and exact load ratios</summary><div id="ts-table" class="table-scroll" tabindex="0" role="region" aria-label="Source and modern string comparisons"></div></details></section>
<section class="ts-section ts-explanation" aria-labelledby="ts-why"><div><h2 id="ts-why">A square root hides<br/>inside the experiment.</h2><p>The wave speed of an ideal string is √(T/μ). A wave’s round-trip time along vibrating length L is 2L / √(T/μ), so the fundamental has f = √(T/μ) / 2L.</p><p>Hold L and mass per length μ fixed; let tension T be proportional to the hanging load W. Against the six-unit string:</p><p class="ts-equation">f/f₀ = √(W/6)</p></div><div><h3>For an octave, quadruple the load.</h3><p>To obtain a desired frequency ratio r, solve W = 6r². An octave needs 24 against 6, rather than 12 against 6. A fourth needs 32/3; a fifth, 27/2.</p><p>With the original weights, the ideal intervals are half the claimed intervals <em>in cents</em>: log₂√r = ½ log₂r. This does not halve the frequency itself.</p><p>The ancient ratio arithmetic still works: (3/2) ÷ (4/3) = 9/8. The difficulty is the passage from those loads to the claimed pitches under its stated equal-length condition.</p></div><details class="ts-full"><summary>Where the modern comparison stops</summary><p>${TENSION_LIMITS}</p><p>This is a computed test under stated assumptions. It does not measure a physical instrument or reconstruct a free hanging string’s boundary conditions. Changing loaded length or density would change the result. The source’s hammer story is visible on the full pages, but hammer spectra are not modeled here.</p><p><a href="https://openstax.org/books/university-physics-volume-1/pages/16-3-wave-speed-on-a-stretched-string">OpenStax: the force derivation</a> · <a href="https://sciencedemonstrations.fas.harvard.edu/presentations/sonometer">Harvard: a sonometer’s load experiment</a> · <a href="./trial.html">Ptolemy’s separate test of string uniformity</a>.</p></details></section>
<section id="ts-reading" class="ts-section" aria-labelledby="ts-reading-title"><div class="ts-heading"><h2 id="ts-reading-title">Read the conditions.<br/>Then question the inference.</h2><p>Greek: Jan, 1895.<br/>Latin: Meibom, 1652.<br/>English and word notes: new.</p></div><p class="ts-reading-intro">Nicomachus’s <cite>Harmonic Manual</cite>, chapter 6, presents a later account of Pythagoras, rather than a surviving laboratory report by him. These selected excerpts keep the literary claim distinct from the modern model.</p><div class="ts-reading-layout"><article><label for="ts-passage">Read a passage</label><select id="ts-passage">${TENSION_PASSAGES.map((p, i) => `<option value="${i}">${i + 1}. ${p.title}</option>`).join("")}</select><div id="ts-passage-text"></div><div class="ts-small-actions"><button type="button" id="ts-greek-page">Inspect its Greek page</button><button type="button" id="ts-latin-page">Inspect its Latin page</button></div></article><figure class="ts-source"><div class="ts-source-tools"><label>Printed page<select id="ts-page">${TENSION_SOURCES.pages.map((p) => `<option value="${p.id}">${p.edition === "jan" ? "Jan" : "Meibom"} · p.${p.printedPage}</option>`).join("")}</select></label><label>Zoom<select id="ts-zoom"><option value="1">Fit width</option><option value="2">200%</option><option value="4">400%</option></select></label><a id="ts-original" href="./sources/tension/jan-247.jpg" target="_blank" rel="noreferrer">Original scan</a></div><p id="ts-source-status" role="status"></p><div id="ts-source-window" tabindex="0" role="region" aria-label="Complete printed page; zoom and scroll to inspect"><img id="ts-scan" alt="" hidden/></div><figcaption id="ts-source-caption"></figcaption><a id="ts-archive" href="https://archive.org/details/musiciscriptores01jank">Full volume at this leaf</a></figure></div><details><summary>Edition and transcription decisions</summary><p>Jan, <cite>Musici scriptores Graeci</cite> (Leipzig, 1895), pp.245–248, supplies the Greek critical text. Meibom, <cite>Antiquae musicae auctores septem</cite>, volume I (Amsterdam, 1652), Nicomachus pp.10–13, supplies his own Latin translation. Do not read the Latin as a translation commissioned for Jan’s edition.</p><p>Greek ligatures, line-wrap hyphens, spacing and quotation punctuation are normalized. Latin long-s and ae/oe ligatures are normalized; &amp; is retained. Ellipses mark internal omissions. All complete pages retain apparatus, surrounding text and scan marks. The Latin “equally heavy” is preserved beside Greek “equally twisted”. Both are worth reading.</p><p><a href="https://github.com/antonsoo/pyknon/blob/main/src/tension-sources.json">Exact source identities</a> · <a href="./sources/tension/NOTICES.txt">Source notices</a> · <a href="https://github.com/antonsoo/pyknon/blob/main/docs/tension-model.md">Model and source decisions</a>.</p></details></section>
<section class="ts-section" aria-labelledby="ts-words-title"><div class="ts-heading"><h2 id="ts-words-title">Words that carry<br/>the experiment.</h2><p>Choose a word to read its form<br/>and its role in the argument.</p></div><div class="ts-word-layout"><div class="ts-word-list" role="group" aria-label="Greek words">${TENSION_WORDS.map((w, i) => `<button type="button" data-ts-word="${i}" lang="grc">${w[0]}</button>`).join("")}</div><div id="ts-word" aria-live="polite"></div></div></section>
<section class="ts-section ts-save" aria-labelledby="ts-save-title"><h2 id="ts-save-title">Keep the evidence<br/>with the sound.</h2><p>Save one illustrated reading with your experiment, selected audio, exact table, all eight excerpts, ten word notes, eight full printed pages and embedded fonts. The HTML opens independently and prints; it contains no script.</p><div class="ts-save-actions"><button type="button" id="ts-save-html">Save illustrated reading</button><button type="button" id="ts-save-wav">Save selected WAV</button><button type="button" id="ts-save-csv">Save exact CSV</button><button type="button" id="ts-save-svg">Save diagram SVG</button><button type="button" id="ts-save-json">Save editable JSON</button><button type="button" id="ts-share">Copy experiment link</button><label class="ts-file">Open saved settings<input type="file" id="ts-open" accept=".json,application/json"/></label></div><p id="ts-save-status" role="status"></p></section></main><footer class="ts-footer"><p id="offline-status">Saving this edition for offline reading…</p><p>Original editions: public domain. Modern teaching text and code: MIT, © 2026 Anton Soloviev. Font notices accompany saved readings. <a href="https://github.com/antonsoo/pyknon">Source code</a>.</p></footer>`;
function stop() {
  player.stop();
  playing = false;
  get<HTMLButtonElement>("ts-stop").disabled = true;
  get("ts-playing").textContent = "Sound stopped.";
  document.querySelectorAll("[data-ts-tone]").forEach((e) => {
    e.setAttribute("r", "4");
  });
}
function persist(replace = false) {
  history[replace ? "replaceState" : "pushState"](
    null,
    "",
    `${location.pathname}${tensionQuery(state)}${location.hash}`,
  );
}
function render(push = false, replace = false) {
  if (playing) stop();
  const selected = at(tensionRows(state), state.selected),
    width = Math.max(320, Math.floor(get("ts-drawing").clientWidth));
  get("ts-drawing").innerHTML = tensionDrawing(state, width);
  get("ts-ruler").innerHTML = tensionRuler(
    state,
    Math.max(320, Math.floor(get("ts-ruler").clientWidth)),
  );
  get("ts-table").innerHTML = tensionTable(state);
  document.querySelectorAll<HTMLButtonElement>("[data-ts-note]").forEach((b) => {
    b.setAttribute("aria-pressed", String(Number(b.dataset.tsNote) === state.selected));
  });
  get("ts-target").innerHTML =
    `<strong>${selected.name}</strong>: source ${selected.original} against 6.<br/>Claimed frequency ratio <strong>${ratioText(selected.claimed)}</strong> (${selected.claimCents.toFixed(2)} cents).`;
  get<HTMLInputElement>("ts-weight").value = String(value(selected.chosen));
  get("ts-weight").setAttribute(
    "aria-valuetext",
    `${ratioText(selected.chosen)} relative load units`,
  );
  get<HTMLInputElement>("ts-exact").value = ratioText(selected.chosen);
  get("ts-result").innerHTML =
    `<p>Your ideal note: <strong>${selected.yoursHz.toFixed(3)} Hz</strong></p><p>${selected.exact ? "Exact ratio reached with this replacement load." : `${Math.abs(selected.errorCents).toFixed(2)} cents ${selected.errorCents < 0 ? "below" : "above"} the claimed target.`}</p>`;
  get("ts-repair-explanation").textContent =
    `The target ratio is ${ratioText(selected.claimed)}. Square it, then multiply by the fixed load 6: 6 × (${ratioText(selected.claimed)})² = ${ratioText(selected.repaired)}.`;
  get<HTMLSelectElement>("ts-sound").value = state.sound;
  get<HTMLSelectElement>("ts-root").value = String(state.root);
  get("ts-play").textContent =
    state.sound === "compare"
      ? "Hear comparison"
      : state.sound === "together"
        ? "Hear target and yours"
        : "Hear four notes";
  get("ts-sequence-note").textContent =
    state.sound === "compare"
      ? "Three pairs in order: claim, original ideal model, your ideal model. Each starts with the same low note. At the original weights, the last two pairs agree."
      : state.sound === "together"
        ? "Two simultaneous sine tones: selected target and your ideal note. They agree at the exact repair; nearby values can beat. No human hearing threshold is assumed."
        : `${SOUND_NAMES[state.sound]}. The four named source pitches form a numerical skeleton, not the complete eight-note system or a tune.`;
  get<HTMLSelectElement>("ts-passage").value = String(state.passage);
  const p = at(TENSION_PASSAGES, state.passage);
  get("ts-passage-text").innerHTML =
    `<h3>${p.title}</h3><p lang="grc">${p.greek}</p><p lang="la">${te(p.latin)}</p><p>${p.english}</p><p class="ts-word-note">${p.note}</p>`;
  get<HTMLSelectElement>("ts-page").value = state.page;
  if (shownPage !== state.page) void showSource();
  if (push) persist(replace);
}
async function showSource() {
  const revision = ++sourceRevision,
    id = state.page,
    p = sourcePage(id);
  shownPage = id;
  const img = get<HTMLImageElement>("ts-scan");
  img.hidden = true;
  get("ts-source-status").textContent = "Verifying the complete printed page…";
  get("ts-source-caption").textContent = sourceCaption(id);
  get<HTMLAnchorElement>("ts-original").href = `${import.meta.env.BASE_URL}${p.file}`;
  get<HTMLAnchorElement>("ts-archive").href = sourceArchive(id);
  let pendingUrl = "";
  try {
    const bytes = await verifiedBytes(p.file);
    if (revision !== sourceRevision) return;
    pendingUrl = URL.createObjectURL(new Blob([bytes], { type: "image/jpeg" }));
    // Decode each request independently. Reusing a live image while history
    // replaces its source can reject a newer Firefox decode as "Invalid image
    // request", even when that image is complete. Commit only the current page.
    const next = new Image();
    next.id = "ts-scan";
    next.alt = sourceCaption(id);
    next.style.width = `${Number(get<HTMLSelectElement>("ts-zoom").value) * 100}%`;
    next.src = pendingUrl;
    await next.decode();
    if (revision !== sourceRevision) {
      URL.revokeObjectURL(pendingUrl);
      return;
    }
    const old = sourceUrl;
    sourceUrl = pendingUrl;
    get("ts-scan").replaceWith(next);
    if (old) URL.revokeObjectURL(old);
    get("ts-source-status").textContent =
      "Complete printed page verified against this edition’s SHA-256.";
  } catch (e) {
    if (pendingUrl) URL.revokeObjectURL(pendingUrl);
    if (revision !== sourceRevision) return;
    get("ts-scan").hidden = true;
    get("ts-source-status").textContent =
      `Source unavailable: ${e instanceof Error ? e.message : "verification failed"}`;
  }
}
function change(action: () => void, replace = false) {
  get("ts-input-error").textContent = "";
  action();
  render(true, replace);
}
document.querySelectorAll<HTMLButtonElement>("[data-ts-note]").forEach((b) => {
  b.addEventListener("click", () =>
    change(() => {
      state.selected = Number(b.dataset.tsNote) as 1 | 2 | 3;
    }),
  );
});
let rangeGesture = false;
const slider = get<HTMLInputElement>("ts-weight");
slider.addEventListener("input", () => {
  change(() => {
    state.weights[state.selected] = weight(Number(slider.value).toFixed(4));
  }, rangeGesture);
  rangeGesture = true;
});
slider.addEventListener("change", () => {
  rangeGesture = false;
});
slider.addEventListener("keydown", (e) => {
  const delta =
    e.key === "ArrowRight" || e.key === "ArrowUp"
      ? 0.25
      : e.key === "ArrowLeft" || e.key === "ArrowDown"
        ? -0.25
        : 0;
  if (!delta && e.key !== "Home" && e.key !== "End") return;
  e.preventDefault();
  change(() => {
    const n =
      e.key === "Home"
        ? 6
        : e.key === "End"
          ? 30
          : Math.max(
              6,
              Math.min(30, value(at(state.weights, state.selected)) + delta * (e.shiftKey ? 4 : 1)),
            );
    state.weights[state.selected] = weight(n.toFixed(4));
  });
});
get("ts-weight-form").addEventListener("submit", (e) => {
  e.preventDefault();
  try {
    const next = weight(get<HTMLInputElement>("ts-exact").value);
    change(() => {
      state.weights[state.selected] = next;
    });
  } catch (error) {
    get("ts-input-error").textContent = error instanceof Error ? error.message : "Invalid weight.";
  }
});
get("ts-restore").addEventListener("click", () =>
  change(() => {
    state.weights[state.selected] = [at(SOURCE_WEIGHTS, state.selected), 1];
  }),
);
get("ts-reset").addEventListener("click", () =>
  change(() => {
    state.weights = tensionDefault().weights;
  }),
);
get("ts-repair").addEventListener("click", () =>
  change(() => {
    state.weights[state.selected] = at(REPAIRED, state.selected);
  }),
);
get("ts-repair-all").addEventListener("click", () =>
  change(() => {
    state.weights = [at(REPAIRED, 0), at(REPAIRED, 1), at(REPAIRED, 2), at(REPAIRED, 3)];
  }),
);
get("ts-sound").addEventListener("change", () =>
  change(() => {
    state.sound = get<HTMLSelectElement>("ts-sound").value as TensionSound;
  }),
);
get("ts-root").addEventListener("change", () =>
  change(() => {
    state.root = Number(get<HTMLSelectElement>("ts-root").value) as 110 | 220;
  }),
);
get("ts-passage").addEventListener("change", () =>
  change(() => {
    state.passage = Number(get<HTMLSelectElement>("ts-passage").value);
    state.page = at(TENSION_PASSAGES, state.passage).greekPage;
  }),
);
get("ts-page").addEventListener("change", () =>
  change(() => {
    state.page = get<HTMLSelectElement>("ts-page").value;
  }),
);
get("ts-greek-page").addEventListener("click", () =>
  change(() => {
    state.page = at(TENSION_PASSAGES, state.passage).greekPage;
  }),
);
get("ts-latin-page").addEventListener("click", () =>
  change(() => {
    state.page = at(TENSION_PASSAGES, state.passage).latinPage;
  }),
);
get("ts-zoom").addEventListener("change", () => {
  get("ts-scan").style.width = `${Number(get<HTMLSelectElement>("ts-zoom").value) * 100}%`;
});
get("ts-stop").addEventListener("click", stop);
get("ts-play").addEventListener("click", async () => {
  const captured = structuredClone(state);
  playing = true;
  get<HTMLButtonElement>("ts-stop").disabled = false;
  try {
    await player.play(
      tensionPlan(captured),
      (tone) => {
        document.querySelectorAll("[data-ts-tone]").forEach((e) => {
          e.setAttribute("r", "4");
        });
        if (tone) {
          get("ts-playing").textContent =
            `${(tone as { role?: string }).role ?? "Tone"} · ${at(NOTE_NAMES, tone.note)} · ${tone.hz.toFixed(3)} Hz`;
          document.querySelector(`[data-ts-tone="${tone.note}"]`)?.setAttribute("r", "8");
        }
      },
      () => {
        playing = false;
        get<HTMLButtonElement>("ts-stop").disabled = true;
        get("ts-playing").textContent = "Playback complete.";
      },
    );
  } catch {
    stop();
    get("ts-playing").textContent =
      "Audio could not start. Try another listening choice or save the reading.";
  }
});
function wordNote(i: number) {
  const w = at(TENSION_WORDS, i);
  get("ts-word").innerHTML =
    `<h3 lang="grc">${w[0]}</h3><p>${w[1]} · <strong>${w[2]}</strong></p><p>${w[3]}</p>`;
  document.querySelectorAll<HTMLButtonElement>("[data-ts-word]").forEach((b) => {
    b.setAttribute("aria-pressed", String(Number(b.dataset.tsWord) === i));
  });
}
document.querySelectorAll<HTMLButtonElement>("[data-ts-word]").forEach((b) => {
  b.addEventListener("click", () => wordNote(Number(b.dataset.tsWord)));
});
function save(name: string, body: string | Blob, mime = "text/plain") {
  const blob = body instanceof Blob ? body : new Blob([body], { type: mime });
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
get("ts-save-json").addEventListener("click", () =>
  save("pyknon-weighted-strings.json", tensionJSON(state), "application/json"),
);
get("ts-save-csv").addEventListener("click", () =>
  save("pyknon-weighted-strings.csv", tensionCSV(state), "text/csv;charset=utf-8"),
);
let saving = false;
async function exportFile(kind: "html" | "wav" | "svg") {
  if (saving) return;
  saving = true;
  const captured = structuredClone(state);
  get("ts-save-status").textContent =
    kind === "html"
      ? "Rendering audio and verifying all eight printed pages and fonts…"
      : "Preparing your file…";
  try {
    if (kind === "svg") {
      const font = await dataUrl(
        await verifiedBytes("fonts/IBMPlexSans-Regular.woff2"),
        "font/woff2",
      );
      save("pyknon-weighted-strings.svg", tensionSvg(captured, font), "image/svg+xml");
    } else {
      const wav = await renderWav(tensionPlan(captured));
      if (kind === "wav") save("pyknon-weighted-strings.wav", wav);
      else
        save(
          "pyknon-weighted-strings-reading.html",
          await tensionStudy(captured, wav),
          "text/html",
        );
    }
    get("ts-save-status").textContent =
      "Saved the captured experiment. Subsequent changes do not alter this file.";
  } catch (error) {
    get("ts-save-status").textContent =
      `Nothing saved: ${error instanceof Error ? error.message : "file unavailable"}`;
  } finally {
    saving = false;
  }
}
get("ts-save-html").addEventListener("click", () => void exportFile("html"));
get("ts-save-wav").addEventListener("click", () => void exportFile("wav"));
get("ts-save-svg").addEventListener("click", () => void exportFile("svg"));
get("ts-open").addEventListener("change", async () => {
  const input = get<HTMLInputElement>("ts-open"),
    file = input.files?.[0];
  if (!file) return;
  try {
    if (file.size > 65536) throw new Error("Use a settings file below 64 KB.");
    const next = tensionImport(await file.text());
    change(() => {
      state = next;
    });
    get("ts-save-status").textContent = "Opened your saved experiment.";
  } catch (error) {
    get("ts-save-status").textContent =
      `Settings retained: ${error instanceof Error ? error.message : "invalid file"}`;
  } finally {
    input.value = "";
  }
});
get("ts-share").addEventListener("click", async () => {
  const link = `${location.origin}${location.pathname}${tensionQuery(state)}#weights`;
  try {
    await navigator.clipboard.writeText(link);
    get("ts-save-status").textContent = "Experiment link copied.";
  } catch {
    get("ts-save-status").textContent = `Copy this experiment link: ${link}`;
  }
});
window.addEventListener("popstate", () => {
  const restored = tensionFromQuery(location.search);
  state = restored.state;
  get("ts-notice").hidden = !restored.notice;
  get("ts-notice").textContent = restored.notice;
  render();
});
let resizeFrame = 0;
new ResizeObserver(() => {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(() => {
    get("ts-drawing").innerHTML = tensionDrawing(
      state,
      Math.max(320, Math.floor(get("ts-drawing").clientWidth)),
    );
    get("ts-ruler").innerHTML = tensionRuler(
      state,
      Math.max(320, Math.floor(get("ts-ruler").clientWidth)),
    );
  });
}).observe(get("ts-drawing"));
window.addEventListener("pagehide", () => {
  stop();
  if (sourceUrl) URL.revokeObjectURL(sourceUrl);
  shownPage = "";
  sourceRevision++;
});
window.addEventListener("pageshow", (e) => {
  if (e.persisted) render();
});
render();
wordNote(3);
void offline(get("offline-status"));
