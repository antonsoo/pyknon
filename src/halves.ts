import "./style.css";
import "./halves.css";
import { Player, renderWav } from "./audio";
import {
  changeHalfScale,
  endpoints,
  HALF_DEFAULT,
  HALF_SOUNDS,
  type HalfInterval,
  type HalfMethod,
  type HalfSound,
  type HalfState,
  halfAnalysis,
  halfCSV,
  halfFromURL,
  halfJSON,
  halfPlan,
  halfURL,
  INTERVALS,
  importHalfJSON,
  METHODS,
  ratText,
  validHalfState,
} from "./core/halves";
import {
  HALF_SOURCES,
  halfBytes,
  halfCaption,
  halfData,
  halfPage,
  halfText,
} from "./halves-assets";
import { HALF_LIMITS, HALF_PASSAGES } from "./halves-content";
import {
  halfProof,
  halfResponsiveIntervals,
  halfResponsiveRuler,
  halfScheduleText,
  halfSVG,
  halfTable,
  he,
} from "./halves-drawing";
import { halvesStudy } from "./halves-study";
import { offline } from "./offline";

function get<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.querySelector<T>(id);
  if (!el) throw new Error(`Missing ${id}`);
  return el;
}
const initial = halfFromURL(location.href);
let state = { ...initial.state },
  revision = 0,
  sourceRevision = 0,
  sourceURL = "",
  word = 0;
const player = new Player();
get("#app").innerHTML = `<a href="#bench" class="skip">Skip to the middle experiment</a>
<header class="site-header"><a href="./" class="brand" title="Pyknon home">PYKNON<span lang="grc">πυκνόν</span></a><nav aria-label="Main"><a href="./canon.html">Six tones</a><a href="./trial.html">String trial</a><a href="./rhythm.html">Rhythm</a><a href="./tension.html">Weighted strings</a><a href="./vina.html">Two vinas</a><a href="#bench" aria-current="page">Three middles</a></nav></header>
<main class="hf-main"><section class="hf-intro" aria-labelledby="intro-title"><div><p class="eyebrow">SECTIO CANONIS III & XVI / NUMBERS, STRINGS, SOUND</p><h1 id="intro-title">Three middles.<br>One interval.</h1></div><div class="hf-intro-copy"><p>Seventeen is halfway between sixteen and eighteen. So why are <strong>17:16 and 18:17 unequal</strong>?</p><p>The ancient proof says a tone cannot divide equally. Operate three different middles, hear their consequences, and read the whole-number premise that makes the claim work.</p><a href="#bench" class="text-link">Try the split ↓</a></div></section>
<p id="hf-link-notice" role="status"></p>
<section id="bench" class="hf-section" aria-labelledby="bench-title"><div class="section-heading"><div><p class="eyebrow">01 / WHAT DO YOU MEAN BY MIDDLE?</p><h2 id="bench-title" tabindex="-1">Halfway by addition.<br>Unequal by ratio.</h2></div><p class="section-aside">The first interval is M:A.<br>The second is B:M.</p></div>
<div class="hf-outer"><label>Outer frequency ratio<select id="hf-interval">${Object.entries(
  INTERVALS,
)
  .map(([id, label]) => `<option value="${id}">${he(label)}</option>`)
  .join(
    "",
  )}</select></label><label id="hf-n-label" hidden>Whole plus 1/n · n<input id="hf-n" type="number" min="1" max="64" step="1"></label><label>Scale of the numerical weights<input id="hf-scale" type="number" min="1" max="256" step="1"></label><button id="hf-double" type="button">Double the numerical scale</button></div>
<div class="hf-methods" role="group" aria-label="How to choose the middle">${Object.entries(METHODS)
  .map(
    ([id, label], i) =>
      `<button type="button" data-hf-method="${id}" aria-pressed="false"><span class="hf-method-number">0${i + 1}</span><span>${he(label)}</span></button>`,
  )
  .join("")}</div>
<div class="hf-candidate"><label>Whole-number candidate M<input id="hf-middle" type="number" step="1"></label><label class="hf-range-label">Move the integer candidate<input id="hf-range" type="range" step="1"></label><div><button id="hf-lower" type="button">Integer below the root</button><button id="hf-upper" type="button">Integer above the root</button></div></div>
<figure class="hf-plate"><div id="hf-intervals"></div><figcaption>Two intervals on one logarithmic pitch scale. Violet is the first; orange is the second. The dashed line is an equal-ratio split.</figcaption></figure>
<div class="hf-result"><div><p class="eyebrow">EXACT COMPARISON / NO LISTENING JUDGMENT REQUIRED</p><p id="hf-equation" class="hf-equation"></p><p id="hf-result" role="status"></p></div><p id="hf-mid-description"></p></div>
<div class="hf-transport"><label>Listening experiment<select id="hf-sound">${Object.entries(
  HALF_SOUNDS,
)
  .map(([id, label]) => `<option value="${id}">${he(label)}</option>`)
  .join(
    "",
  )}</select></label><label>Modern reference<select id="hf-reference"><option value="220">220 Hz</option><option value="330">330 Hz</option><option value="440">440 Hz</option></select></label><button id="hf-play" type="button" class="primary">Play comparison</button><button id="hf-stop" type="button" disabled>Stop</button></div><p id="hf-play-status" role="status">Ready. Finite sine tones; choose a comfortable volume.</p><p id="hf-audio-detail" class="quiet"></p>
<details class="hf-details"><summary>Follow the ratios and modern frequencies</summary><div id="hf-table" class="hf-table-scroll" role="region" aria-label="Exact interval measurements" tabindex="0"></div><p id="hf-beat"></p><p>Each half-interval is moved to the same starting pitch for comparison. Hertz, cents, plotted coordinates and oscillator parameters are finite approximations. Exact squared values decide equality.</p></details>
<div class="hf-contrasts"><button id="hf-source-example" type="button">Use the printed pair: 9 and 12</button><button id="hf-control" type="button">Try a boundary: 4, 6, 9</button><button id="hf-reset" type="button">Return to 16, 17, 18</button></div>
</section>
<section class="hf-section" aria-labelledby="numbers-title"><div class="section-heading"><div><p class="eyebrow">02 / A NUMERICAL LIMIT HAS A DOMAIN</p><h2 id="numbers-title">More integers.<br>The same two ratios.</h2></div><p class="section-aside">A proportional middle requires<br>M² = AB.</p></div><figure class="hf-plate"><div id="hf-ruler"></div><figcaption>The ruler spaces the numerical weights linearly. It is a different scale from the pitch strip above.</figcaption></figure><div id="hf-proof" class="hf-prose"></div><details class="hf-details"><summary>Why equal string lengths give a third middle</summary><p>For an ideal uniform string with wave speed fixed, f = v/(2L). Halving the distance between two string lengths gives the arithmetic mean of lengths, hence the harmonic mean of their frequencies: M = 2AB/(A+B). It reverses the imbalance from equal frequency increments.</p><p>This idealized relation does not establish the behavior of a stretched real string whose tension changes as it is stopped. <a href="https://openstax.org/books/university-physics-volume-1/pages/16-6-standing-waves-and-resonance">Read the standing-wave relation in OpenStax</a>.</p></details><p class="boundary">${he(HALF_LIMITS)}</p></section>
<section id="reading" class="hf-section" aria-labelledby="reading-title"><div class="section-heading"><div><p class="eyebrow">03 / READ THE PREMISE BEFORE THE CONCLUSION</p><h2 id="reading-title">A middle <span lang="grc">ἀνάλογον</span>.</h2></div><p class="section-aside">Greek / Menge’s 1916 Latin<br>New English and contextual notes</p></div><p class="hf-prose">The <i>Sectio canonis</i> is transmitted under Euclid’s name; this lesson does not settle its authorship. III concerns proportional whole-number means. XII–XIII establish musical ratios; XVI applies the numerical claim to the tone. Read seven selections beside their complete pages.</p><label>Reading step<select id="hf-reading">${HALF_PASSAGES.map((p, i) => `<option value="${i}">${i + 1} · ${he(p.title)}</option>`).join("")}</select></label><div class="hf-reading-layout"><article><div id="hf-passage"></div><div class="hf-reading-buttons"><button type="button" id="hf-previous">Previous reading</button><button type="button" id="hf-next">Next reading</button></div><div id="hf-words" class="hf-words" role="group" aria-label="Words carrying the selected argument"></div><div id="hf-word" class="hf-word" aria-live="polite"></div><p><button type="button" id="hf-greek">Inspect this Greek page</button> <button type="button" id="hf-latin">Inspect this Latin page</button></p></article><figure class="hf-source"><label>Complete source page<select id="hf-page">${HALF_SOURCES.pages.map((p) => `<option value="${p.pdfPage}">${he(p.printedPage === "title" ? "Title · 1916" : `Printed ${p.printedPage} · ${p.pdfPage % 2 ? "Latin" : "Greek"}`)}</option>`).join("")}</select></label><button id="hf-enlarge" type="button" disabled aria-label="Enlarge verified source page"><img id="hf-source-image" alt="" hidden></button><figcaption id="hf-caption"></figcaption><p id="hf-source-status" role="status"></p><a id="hf-source-link" hidden target="_blank" rel="noopener">Open verified complete image</a><button type="button" id="hf-retry">Verify page again</button></figure></div><details class="hf-details"><summary>Transcription, edition and limits</summary><p>New transcriptions from Heinrich Menge’s <cite>Euclidis opera omnia</cite> VIII, Teubner, 1916, pp.162–163 and 172–177. The title prints MCMXVI. Greek theta forms and initial capitalization are normalized, line breaks and line-end hyphens joined. A visible ellipsis marks two excerpts from XII. Original diagram letters and apparatus remain in the whole-page images.</p><p>The Latin is Menge’s scholarly translation. English and word notes are new instructional work without independent philological review. The modern bench’s A, M, B labels are separate from the source’s letters. <a href="${HALF_SOURCES.catalogue}">Inspect the complete scanned edition</a>.</p></details></section>
<section class="hf-section" aria-labelledby="keep-title"><div class="section-heading"><div><p class="eyebrow">04 / KEEP THE ARGUMENT</p><h2 id="keep-title">Read it away<br>from this tab.</h2></div><p class="section-aside">Editable numbers / exact CSV<br>Portable diagrams / finite sound</p></div><div class="hf-save" id="hf-save"><button type="button" id="hf-share">Copy experiment link</button><button type="button" data-hf-save="json">Save editable JSON</button><button type="button" data-hf-save="csv">Save exact CSV</button><button type="button" data-hf-save="svg">Save diagram SVG</button><button type="button" data-hf-save="wav">Save listening WAV</button><button type="button" data-hf-save="html">Save illustrated reading · HTML</button><label class="hf-import">Open a saved JSON<input type="file" accept="application/json,.json" id="hf-import"></label></div><label id="hf-share-label" hidden>Experiment link · ready to copy<input id="hf-share-link" type="url" readonly></label><p id="hf-save-status" role="status"></p><p class="hf-prose">The HTML retains all seven Greek–Latin–English readings, vocabulary, nine whole pages, fonts, licenses, diagrams and the chosen listening experiment. It opens, plays and prints without scripts or a connection. JSON saves settings; CSV records exact squared quantities with explicit approximation columns.</p><p class="hf-prose"><a href="./canon.html">Continue: six tones exceed an octave →</a><br><a href="https://antonsoo.github.io/stoicheia/ratios.html">Compare Euclid V’s universal ratio condition →</a><br><a href="https://github.com/antonsoo/pyknon/blob/main/docs/halves-model.md">Read the numerical model and source account →</a></p></section></main>
<footer><p><strong>PYKNON</strong> · Three middles. One interval.</p><p id="offline-status">Checking offline availability…</p><p><a href="https://github.com/antonsoo/pyknon">Open source / MIT</a> · <a href="https://github.com/antonsoo/pyknon/blob/main/THIRD_PARTY.md">Sources & credits</a></p></footer>
<dialog id="hf-dialog" aria-labelledby="hf-dialog-title"><div class="hf-dialog-bar"><h2 id="hf-dialog-title">Complete source page</h2><button id="hf-zoom-out" type="button">− Zoom out</button><button id="hf-zoom-in" type="button">+ Zoom in</button><button id="hf-close" type="button">Close</button></div><p>Use arrow keys to pan the enlarged page. Escape closes it.</p><div id="hf-pan" tabindex="0" role="region" aria-label="Enlarged source image; arrow keys pan"><img id="hf-zoom-image" alt=""></div></dialog>`;
get("#hf-link-notice").textContent = initial.notice;
function stop() {
  player.stop();
  get<HTMLButtonElement>("#hf-stop").disabled = true;
  get("#hf-play-status").textContent = "Stopped. Change a middle or play another comparison.";
}
function set(next: HalfState) {
  if (!validHalfState(next)) return false;
  stop();
  const readingChanged = next.reading !== state.reading,
    pageChanged = next.page !== state.page;
  state = { ...next };
  revision++;
  if (readingChanged) word = 0;
  render();
  if (pageChanged) void showSource();
  return true;
}
function passage(index = state.reading) {
  const p = HALF_PASSAGES[index];
  if (!p) throw new Error("Missing reading");
  return p;
}
function renderWord() {
  const w = passage().words[word];
  if (!w) throw new Error("Missing word");
  get("#hf-word").innerHTML =
    `<p><strong>${he(w.meaning)}</strong></p><p>${he(w.job)}</p><p lang="la">${he(w.latin)}</p>`;
  document.querySelectorAll<HTMLButtonElement>("[data-hf-word]").forEach((b) => {
    b.setAttribute("aria-pressed", String(Number(b.dataset.hfWord) === word));
  });
}
function render() {
  const a = halfAnalysis(state);
  get<HTMLSelectElement>("#hf-interval").value = state.interval;
  get("#hf-n-label").hidden = state.interval !== "custom";
  get<HTMLInputElement>("#hf-n").value = String(state.n);
  get<HTMLInputElement>("#hf-scale").value = String(state.scale);
  get<HTMLButtonElement>("#hf-double").disabled = state.scale > 128;
  for (const id of ["#hf-middle", "#hf-range"]) {
    const el = get<HTMLInputElement>(id);
    el.min = String(a.A);
    el.max = String(a.B);
    el.value = String(state.middle);
  }
  document.querySelectorAll<HTMLButtonElement>("[data-hf-method]").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.hfMethod === state.method));
  });
  get<HTMLSelectElement>("#hf-sound").value = state.sound;
  get<HTMLSelectElement>("#hf-reference").value = String(state.reference);
  get("#hf-intervals").innerHTML = halfResponsiveIntervals(state);
  get("#hf-ruler").innerHTML = halfResponsiveRuler(state);
  get("#hf-table").innerHTML = halfTable(state);
  get("#hf-proof").innerHTML = halfProof(state);
  get("#hf-equation").textContent =
    `M² = ${ratText(a.middleSquare)} ${a.comparison === 0 ? "=" : a.comparison > 0 ? ">" : "<"} AB = ${a.product}`;
  get("#hf-result").textContent =
    `M = ${a.middleText}. ${a.comparison === 0 ? "The two frequency ratios are equal." : a.comparison > 0 ? "The first frequency ratio is larger." : "The first frequency ratio is smaller."} First ${a.first}; second ${a.second}.`;
  get("#hf-mid-description").textContent = {
    integer: `You selected the whole number ${state.middle}. Being an available integer between ${a.A} and ${a.B} does not make it proportional.`,
    frequency: `Equal additive frequency increments choose (${a.A}+${a.B})/2 = ${a.middleText}. Equal differences in hertz do not imply equal frequency ratios.`,
    length: `Equal ideal string-length increments choose 2×${a.A}×${a.B}/(${a.A}+${a.B}) = ${a.middleText}. This assumes a fixed wave speed.`,
    ratio: `The geometric mean √(${a.A}×${a.B}) = ${a.middleText} makes the two ratios equal. ${a.middle.kind === "root" ? "This root is not a whole number." : "This example has an exact whole-number mean."}`,
  }[state.method];
  get("#hf-audio-detail").textContent = halfScheduleText(state);
  get("#hf-beat").textContent =
    `Moved to the same ${state.reference} Hz start, the two endings differ by approximately ${a.beatHz.toFixed(6)} Hz. The same-ending control holds that difference at zero; no listener recognition threshold is inferred.`;
  get<HTMLSelectElement>("#hf-reading").value = String(state.reading);
  get<HTMLSelectElement>("#hf-page").value = String(state.page);
  const p = passage();
  get("#hf-passage").innerHTML =
    `<p class="eyebrow">READING ${state.reading + 1} / ${HALF_PASSAGES.length}</p><h3>${he(p.title)}</h3><p lang="grc">${he(p.greek)}</p><p lang="la">${he(p.latin)}</p><p class="hf-english">${he(p.english)}</p><p class="quiet">${he(p.note)}</p>`;
  get("#hf-words").innerHTML = p.words
    .map(
      (w, i) =>
        `<button type="button" data-hf-word="${i}" aria-pressed="${i === word}"><span lang="grc">${he(w.greek)}</span></button>`,
    )
    .join("");
  renderWord();
  get<HTMLButtonElement>("#hf-previous").disabled = state.reading === 0;
  get<HTMLButtonElement>("#hf-next").disabled = state.reading === HALF_PASSAGES.length - 1;
}
async function showSource() {
  const gen = ++sourceRevision,
    pdf = state.page;
  const image = get<HTMLImageElement>("#hf-source-image");
  image.hidden = true;
  get<HTMLButtonElement>("#hf-enlarge").disabled = true;
  get("#hf-source-link").hidden = true;
  get("#hf-caption").textContent = halfCaption(pdf);
  get("#hf-source-status").textContent = "Verifying the complete page…";
  get<HTMLDialogElement>("#hf-dialog").close();
  try {
    const bytes = await halfBytes(halfPage(pdf).file),
      url = URL.createObjectURL(new Blob([bytes], { type: "image/jpeg" }));
    const decoded = new Image();
    decoded.src = url;
    try {
      await decoded.decode();
    } catch (e) {
      URL.revokeObjectURL(url);
      throw e;
    }
    if (gen !== sourceRevision) {
      URL.revokeObjectURL(url);
      return;
    }
    if (sourceURL) URL.revokeObjectURL(sourceURL);
    sourceURL = url;
    image.src = url;
    image.alt = halfCaption(pdf);
    image.hidden = false;
    const link = get<HTMLAnchorElement>("#hf-source-link");
    link.href = url;
    link.hidden = false;
    get<HTMLButtonElement>("#hf-enlarge").disabled = false;
    get("#hf-source-status").textContent =
      "Verified complete page · bytes match the retained 1916 edition.";
  } catch (e) {
    if (gen === sourceRevision)
      get("#hf-source-status").textContent =
        `Page unavailable: ${e instanceof Error ? e.message : String(e)}`;
  }
}
function bounded(id: string, min: number, max: number): number | null {
  const el = get<HTMLInputElement>(id),
    n = el.valueAsNumber;
  if (!Number.isInteger(n) || n < min || n > max) {
    el.setCustomValidity(`Choose a whole number from ${min} through ${max}.`);
    el.reportValidity();
    return null;
  }
  el.setCustomValidity("");
  return n;
}
get("#hf-interval").addEventListener("change", () => {
  const interval = get<HTMLSelectElement>("#hf-interval").value as HalfInterval;
  set(changeHalfScale({ ...state, interval }, state.scale));
});
get("#hf-n").addEventListener("change", () => {
  const n = bounded("#hf-n", 1, 64);
  if (n !== null) set(changeHalfScale({ ...state, n }, state.scale));
});
get("#hf-scale").addEventListener("change", () => {
  const n = bounded("#hf-scale", 1, 256);
  if (n !== null) set(changeHalfScale(state, n));
});
get("#hf-double").addEventListener("click", () =>
  set(changeHalfScale(state, state.scale * 2, true)),
);
for (const id of ["#hf-middle", "#hf-range"])
  get(id).addEventListener(id === "#hf-range" ? "input" : "change", () => {
    const { A, B } = endpoints(state),
      n = bounded(id, A, B);
    if (n !== null) set({ ...state, middle: n, method: "integer" });
  });
get("#hf-lower").addEventListener("click", () =>
  set({ ...state, middle: Number(halfAnalysis(state).lower), method: "integer" }),
);
get("#hf-upper").addEventListener("click", () =>
  set({ ...state, middle: Number(halfAnalysis(state).upper), method: "integer" }),
);
get("#hf-sound").addEventListener("change", () =>
  set({ ...state, sound: get<HTMLSelectElement>("#hf-sound").value as HalfSound }),
);
get("#hf-reference").addEventListener("change", () =>
  set({
    ...state,
    reference: Number(get<HTMLSelectElement>("#hf-reference").value) as HalfState["reference"],
  }),
);
get("#hf-source-example").addEventListener("click", () =>
  set({
    ...state,
    interval: "fourth",
    scale: 3,
    middle: 10,
    method: "integer",
    reading: 1,
    page: 220,
  }),
);
get("#hf-control").addEventListener("click", () =>
  set({ ...state, interval: "square", scale: 1, middle: 6, method: "integer" }),
);
get("#hf-reset").addEventListener("click", () => set({ ...HALF_DEFAULT }));
get("#hf-reading").addEventListener("change", () => {
  const reading = Number(get<HTMLSelectElement>("#hf-reading").value);
  set({ ...state, reading, page: passage(reading).greekPage });
});
for (const [id, dir] of [
  ["#hf-previous", -1],
  ["#hf-next", 1],
] as const)
  get(id).addEventListener("click", () => {
    const reading = state.reading + dir;
    set({ ...state, reading, page: passage(reading).greekPage });
  });
get("#hf-words").addEventListener("click", (e) => {
  const b = (e.target as Element).closest<HTMLButtonElement>("[data-hf-word]");
  if (b) {
    word = Number(b.dataset.hfWord);
    renderWord();
  }
});
get("#app").addEventListener("click", (e) => {
  const b = (e.target as Element).closest<HTMLButtonElement>("[data-hf-method]");
  if (b) set({ ...state, method: b.dataset.hfMethod as HalfMethod });
});
get("#hf-page").addEventListener("change", () =>
  set({ ...state, page: Number(get<HTMLSelectElement>("#hf-page").value) }),
);
get("#hf-greek").addEventListener("click", () => {
  const page = passage().greekPage;
  if (page === state.page) void showSource();
  else set({ ...state, page });
});
get("#hf-latin").addEventListener("click", () => {
  const page = passage().latinPage;
  if (page === state.page) void showSource();
  else set({ ...state, page });
});
get("#hf-retry").addEventListener("click", () => void showSource());
get("#hf-play").addEventListener("click", () => {
  get<HTMLButtonElement>("#hf-stop").disabled = false;
  get("#hf-play-status").textContent = "Preparing the selected finite listening graph…";
  void player
    .play(
      halfPlan({ ...state }),
      (tone) => {
        if (tone)
          get("#hf-play-status").textContent =
            `Playing a modern sine tone at approximately ${tone.hz.toFixed(6)} Hz.`;
      },
      () => {
        get<HTMLButtonElement>("#hf-stop").disabled = true;
        get("#hf-play-status").textContent = "Comparison finished.";
      },
    )
    .catch((e) => {
      stop();
      get("#hf-play-status").textContent = `Sound unavailable: ${e.message}`;
    });
});
get("#hf-stop").addEventListener("click", stop);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stop();
});
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
get("#hf-save").addEventListener("click", (e) => {
  const b = (e.target as Element).closest<HTMLButtonElement>("[data-hf-save]");
  if (!b) return;
  const snapshot = { ...state },
    kind = b.dataset.hfSave;
  b.disabled = true;
  get("#hf-save-status").textContent =
    `Preparing ${kind?.toUpperCase()} for the captured experiment…`;
  void (async () => {
    let blob: Blob;
    if (kind === "json") blob = new Blob([halfJSON(snapshot)], { type: "application/json" });
    else if (kind === "csv") blob = new Blob([halfCSV(snapshot)], { type: "text/csv" });
    else if (kind === "wav") blob = await renderWav(halfPlan(snapshot));
    else if (kind === "html")
      blob = new Blob([await halvesStudy(snapshot, await renderWav(halfPlan(snapshot)))], {
        type: "text/html",
      });
    else
      blob = new Blob(
        [
          await halfSVG(
            snapshot,
            await halfData("fonts/IBMPlexSans-Regular.woff2", "font/woff2"),
            await halfText("fonts/IBMPlex-OFL.txt"),
            await halfText("halves-LICENSE.txt"),
          ),
        ],
        { type: "image/svg+xml" },
      );
    download(blob, `pyknon-halves.${kind}`);
    get("#hf-save-status").textContent =
      `Saved ${kind?.toUpperCase()} for M = ${halfAnalysis(snapshot).middleText}, ratio ${halfAnalysis(snapshot).a}:${halfAnalysis(snapshot).b}.`;
  })()
    .catch((e) => {
      get("#hf-save-status").textContent = `Save failed: ${e.message}`;
    })
    .finally(() => {
      b.disabled = false;
    });
});
get("#hf-share").addEventListener("click", () => {
  const link = halfURL({ ...state }, location.href);
  get<HTMLInputElement>("#hf-share-link").value = link;
  get("#hf-share-label").hidden = false;
  void navigator.clipboard
    .writeText(link)
    .then(() => {
      get("#hf-save-status").textContent =
        "Experiment link copied. The page address stays unchanged.";
    })
    .catch(() => {
      get("#hf-save-status").textContent = `Copy this experiment link: ${link}`;
    });
});
get("#hf-import").addEventListener("change", () => {
  const input = get<HTMLInputElement>("#hf-import"),
    file = input.files?.[0],
    at = revision;
  if (!file) return;
  if (file.size > 12000) {
    get("#hf-save-status").textContent = "This file is too large for a settings record.";
    input.value = "";
    return;
  }
  void file
    .text()
    .then((text) => {
      const next = importHalfJSON(text);
      if (at !== revision) {
        get("#hf-save-status").textContent =
          "Settings changed while this file was opening. Open it again to replace them.";
        return;
      }
      set(next);
      get("#hf-save-status").textContent = "Saved experiment opened.";
    })
    .catch((e) => {
      get("#hf-save-status").textContent = `Open failed: ${e.message}`;
    })
    .finally(() => {
      input.value = "";
    });
});
let zoom = 1;
function zoomImage() {
  get<HTMLImageElement>("#hf-zoom-image").style.width = `${zoom * 100}%`;
}
get("#hf-enlarge").addEventListener("click", () => {
  const img = get<HTMLImageElement>("#hf-zoom-image");
  img.src = sourceURL;
  img.alt = halfCaption(state.page);
  get("#hf-dialog-title").textContent = halfCaption(state.page);
  zoom = 1;
  zoomImage();
  get<HTMLDialogElement>("#hf-dialog").showModal();
  get("#hf-pan").focus();
});
get("#hf-close").addEventListener("click", () => get<HTMLDialogElement>("#hf-dialog").close());
get("#hf-zoom-in").addEventListener("click", () => {
  zoom = Math.min(4, zoom + 0.5);
  zoomImage();
});
get("#hf-zoom-out").addEventListener("click", () => {
  zoom = Math.max(1, zoom - 0.5);
  zoomImage();
});
get("#hf-pan").addEventListener("keydown", (e) => {
  const d: { [key: string]: [number, number] } = {
    ArrowLeft: [-100, 0],
    ArrowRight: [100, 0],
    ArrowUp: [0, -100],
    ArrowDown: [0, 100],
  };
  if (e instanceof KeyboardEvent && d[e.key]) {
    e.preventDefault();
    const [x, y] = d[e.key] ?? [0, 0];
    get("#hf-pan").scrollBy({ left: x, top: y });
  }
});
render();
void showSource();
void offline(get("#offline-status"));
