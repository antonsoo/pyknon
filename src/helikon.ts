import "./style.css";
import "./helikon.css";
import { Player, renderWav } from "./audio";
import {
  fraction,
  ft,
  HELIKON_SCOPE,
  HELIKON_STEPS,
  type HelikonState,
  helikonCSV,
  helikonFromURL,
  helikonJSON,
  helikonPlan,
  helikonURL,
  INTERVALS,
  importHelikon,
  requiredLanes,
  sourceInterval,
  validateHelikon,
} from "./core/helikon";
import {
  HELIKON_SOURCES,
  helikonBytes,
  helikonCaption,
  helikonData,
  helikonPage,
} from "./helikon-assets";
import { HELIKON_LETTERS, HELIKON_READINGS } from "./helikon-content";
import {
  he,
  helikonPlate,
  hn,
  intervalResult,
  retuningBoard,
  retuningResult,
  retuningTable,
  sourceBoard,
  sourceTable,
} from "./helikon-drawing";
import { helikonStudy } from "./helikon-study";
import { offline } from "./offline";

const get = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing ${id}`);
  return el as T;
};
const restored = helikonFromURL(location.href);
let state = restored.state,
  sourceRevision = 0,
  sourceURL = "",
  sourceVerified = false,
  zoom = 1,
  revision = 0,
  openRevision = 0;
const player = new Player();
get("app").innerHTML = `<a class="skip" href="#hk-bench">Skip to the helikon</a>
<header class="site-header"><a class="brand" href="./">PYKNON<span lang="grc">πυκνόν</span></a><nav aria-label="Main"><a href="./">Greek intervals</a><a href="./trial.html">String trial</a><a href="./notation.html">Musical signs</a><a href="./halves.html">Three middles</a><a href="./helikon.html" aria-current="page">Helikon</a></nav></header>
<main class="hk-main"><section class="hk-intro" aria-labelledby="hk-title"><div><p class="eyebrow">PTOLEMY / GEOMETRY YOU CAN HEAR</p><h1 id="hk-title">One bridge.<br>Four strings.</h1></div><div><p>Six different lengths, an entire network of consonances. Build the helikon and hear how one straight bridge divides four strings.</p><p>Then keep the end notes fixed and try another tuning. The two inner notes ask you to move something else.</p><p class="hk-small">Greek, Wallis’s Latin and new English, with every whole source page. No prior Greek or music theory needed.</p><a class="text-link" href="#hk-bench">Build, listen, retune ↓</a></div></section><p id="hk-notice" role="status"></p>
<section class="hk-bench" id="hk-bench" aria-labelledby="hk-source-heading"><div class="hk-bench-heading"><div><p class="eyebrow">01 / THE SOURCE CONSTRUCTION</p><h2 id="hk-source-heading">A square becomes a tuning.</h2></div><div class="hk-stage-buttons" role="group" aria-label="Construction step">${HELIKON_STEPS.map(([title], i) => `<button type="button" data-hk-stage="${i}" aria-pressed="false">${i + 1} · ${title}</button>`).join("")}</div></div>
<div class="hk-board-grid"><div class="hk-board"><div id="hk-source-board"></div><p class="hk-board-note">The pale diagonal locates G in the source construction. Purple and rust mark the selected sounding segments. The bridge has no width in this model.</p></div><div class="hk-controls"><p class="hk-step-copy" id="hk-step-copy"></p><div class="hk-actions"><button type="button" id="hk-previous">Previous step</button><button type="button" id="hk-next">Next step</button></div><div class="hk-intervals" role="group" aria-label="Interval to compare">${INTERVALS.map((p, i) => `<button type="button" data-hk-pair="${i}" aria-pressed="false">${p.label}<span lang="grc">${p.greek}</span></button>`).join("")}</div><p class="hk-result" id="hk-interval-result" role="status"></p><label class="hk-control"><span>Right bridge contact <output id="hk-bridge-value" for="hk-bridge"></output></span><input id="hk-bridge" type="range" min="3" max="18" step="1"><span class="hk-small">Your alteration: keep all four string positions.</span></label><div class="hk-actions"><button type="button" id="hk-source-reset">Restore the source’s bridge</button><button type="button" data-hk-source="98">Inspect its printed diagram</button></div><p class="hk-note" id="hk-bridge-note"></p></div></div>
<div class="hk-audio"><label class="hk-small">Full-string reference <select id="hk-reference"><option value="110">110 Hz</option><option value="220">220 Hz</option></select></label><button type="button" class="hk-primary" data-hk-play="pair">Hear selected interval</button><button type="button" data-hk-play="segments">Hear all seven segments</button><button type="button" id="hk-stop" disabled>Stop</button><p id="hk-audio-status" role="status">Ready. Simple tones; start at a comfortable volume.</p></div><details class="hk-proof"><summary>Inspect all seven lengths and pitches</summary><div class="hk-table" id="hk-source-table" tabindex="0" role="region" aria-label="Source segment measurements"></div><p>BF and FD are two separate six-unit segments in the original construction. The set therefore has seven segments but six distinct lengths. Frequency is inversely proportional to sounding length under the stated common-string assumptions.</p></details></section>
<section class="hk-section" id="hk-retuning" aria-labelledby="hk-retuning-heading"><div class="hk-section-heading"><div><p class="eyebrow">02 / A MODERN RETUNING CHALLENGE</p><h2 id="hk-retuning-heading">Keep the ends.<br>Find the inner notes.</h2></div><p>Give the two end strings a pure fourth, 4:3. Choose one of Archytas’s three divisions, reported by Ptolemy in I.13. Can the original inner string positions supply its other two notes?</p></div><div class="hk-bench"><div class="hk-board-grid"><div class="hk-board"><div id="hk-retuning-board"></div><p class="hk-board-note">Two tracks beneath the board show your inner positions as dots and their required positions as vertical ticks. The contacts, strings and bridge share one scale.</p></div><div class="hk-controls"><p class="eyebrow">CHOOSE THE TARGET / KEEP YOUR STRING POSITIONS</p><div class="hk-target" role="group" aria-label="Target division">${["enharmonic", "chromatic", "diatonic"].map((g) => `<button type="button" data-hk-target="${g}" aria-pressed="false">${g[0]?.toUpperCase()}${g.slice(1)}</button>`).join("")}</div><p class="hk-result" id="hk-retuning-result" role="status"></p>${[1, 2].map((n) => `<label class="hk-control"><span>Inner string ${n + 1} <output id="hk-x${n}-value" for="hk-x${n}"></output></span><input id="hk-x${n}" type="range" min="${n}" max="${501 + n}" step="1"><span class="hk-small">Position as a fraction of the board’s width.</span></label>`).join("")}<div class="hk-actions"><button type="button" id="hk-fit">Fit both inner strings to the target</button><button type="button" id="hk-fixed">Restore the original string positions</button></div><label class="hk-control"><span>Shorten all sounding lengths <output id="hk-scale-value" for="hk-scale"></output></span><input id="hk-scale" type="range" min="6" max="12" step="1"><span class="hk-small">Move the common bridge. Every pitch changes by the same ratio.</span></label><p class="hk-metric" id="hk-transposition"></p><div class="hk-actions"><button type="button" class="hk-primary" data-hk-play="retuning">Hear your tuning, then the target</button><button type="button" id="hk-retuning-stop" disabled>Stop</button></div></div></div><div class="hk-controls"><div class="hk-table" id="hk-retuning-table" tabindex="0" role="region" aria-label="Actual and target tuning"></div></div><details class="hk-proof"><summary>Why the bridge alone cannot fix the inner notes</summary><p>Between two fixed end contacts a straight line has only one height at each lateral position. Write x for a string’s position across the width, and q for the leftmost sounding length as a fraction of the full string.</p><p class="hk-equation">Sounding length = q(1 − x/4)<br>Frequency / left note = 1/(1 − x/4)<br>Required x = 4(1 − 1/target ratio)</p><p>The end lengths q and 3q/4 fix the entire line. At the original inner positions 1/2 and 2/3 the ratios must be 8/7 and 6/5. Shortening q transposes every note but leaves those ratios, and their errors against the target, unchanged. Moving the strings supplies the missing freedom.</p><p id="hk-required-positions"></p><p>This is our reduced four-string exercise. Ptolemy’s extension in II.2 uses an extended side and an octachord, and discusses moving strings and a common support. Its original end interval and full construction differ from this fourth-span bench. On pp.100–101 he compares the benefits and practical costs of the two methods.</p><button type="button" data-hk-source="99">Read the movable-string instruction</button></details></div></section>
<section class="hk-section" id="hk-readings" aria-labelledby="hk-language-heading"><div class="hk-section-heading"><div><p class="eyebrow">03 / READ WHAT THE GEOMETRY ASKS</p><h2 id="hk-language-heading">Halve. Stretch.<br>Move across.</h2></div><p>The verbs have consequences on the board. Six selected readings keep Ptolemy’s Greek beside Wallis’s 1682 Latin and new English. Whole pages retain the surrounding argument, figures and apparatus.</p></div><div class="hk-language-grid"><div><label class="hk-status-label" for="hk-reading">Selected reading</label><select id="hk-reading">${HELIKON_READINGS.map((r, i) => `<option value="${i}">${i + 1} · ${he(r.title)}</option>`).join("")}</select><article class="hk-reading" id="hk-reading-body"></article><div class="hk-actions"><button type="button" id="hk-reading-source">Inspect this whole page</button><button type="button" id="hk-reading-next">Next reading</button></div><details class="hk-note"><summary>How the excerpts were prepared</summary><p>Transcribed against the displayed pages. Barred lowercase Greek segment letters remain lowercase with their bars omitted; end-of-line hyphens, line breaks, ligatures and long Latin s are normalized. Each selected phrase is identified as an excerpt or a sentence. No excerpt silently joins separated parts of a passage. New English and grammar notes are instructional and have not received independent philological review.</p></details><div class="hk-letter-map"><table><caption>Diagram letters · Greek print → Wallis’s Latin</caption><tbody><tr><th scope="row">Greek</th>${HELIKON_LETTERS.map(([g]) => `<td lang="grc">${g}</td>`).join("")}</tr><tr><th scope="row">Latin</th>${HELIKON_LETTERS.map(([, l]) => `<td>${l}</td>`).join("")}</tr></tbody></table></div></div><aside class="hk-source" aria-label="Complete printed evidence"><label class="hk-status-label" for="hk-page">Whole source page</label><select id="hk-page">${HELIKON_SOURCES.pages.map((p) => `<option value="${p.id}">${p.id === "title" ? "Title · 1682" : `Printed p.${p.id}${p.id === "62" || p.id === "63" ? " · Archytas report" : " · helikon"}`}</option>`).join("")}</select><figure><button type="button" id="hk-enlarge" class="hk-source-image-button" disabled aria-label="Enlarge the verified whole page"><img id="hk-source-image" alt=""></button><figcaption id="hk-source-caption"></figcaption></figure><p id="hk-source-status" role="status"></p><div class="hk-actions"><button type="button" id="hk-source-retry">Retry this page</button></div><p><a id="hk-open-source" target="_blank" rel="noopener" hidden>Open verified whole image</a></p><p><a href="${HELIKON_SOURCES.catalogue}">Complete scanned edition ↗</a></p></aside></div></section>
<section class="hk-section" id="hk-keep" aria-labelledby="hk-keep-heading"><div class="hk-section-heading"><div><p class="eyebrow">04 / KEEP BOTH YOUR GEOMETRY AND ITS EVIDENCE</p><h2 id="hk-keep-heading">A working study,<br>beyond this tab.</h2></div><p>The illustrated reading retains your current construction, retuning, exact tables, two sound comparisons, all six readings, all eight whole source pages and the local fonts and licenses. It opens, plays and prints without scripts or a connection.</p></div><div class="hk-save"><button type="button" id="hk-share">Copy experiment link</button>${[
  ["json", "Save editable JSON"],
  ["csv", "Save exact CSV"],
  ["svg", "Save diagram SVG"],
  ["wav", "Save retuning WAV"],
  ["html", "Save illustrated HTML"],
]
  .map(([id, label]) => `<button type="button" data-hk-save="${id}">${label}</button>`)
  .join(
    "",
  )}</div><label class="hk-share-field" id="hk-share-label" hidden>Experiment link · ready to copy<input type="url" id="hk-share-link" readonly></label><label class="hk-import">Open a saved experiment<input type="file" id="hk-import" accept="application/json,.json"></label><p id="hk-save-status" role="status"></p><p class="hk-limits">${he(HELIKON_SCOPE)} Drawings and oscillator parameters approximate exact ratios. No physical instrument or listener response was measured.</p><p><a href="./trial.html">Test what a string’s equal pitches can establish →</a><br><a href="./">Hear Archytas’s three divisions and inspect I.13 →</a><br><a href="https://github.com/antonsoo/pyknon/blob/main/docs/helikon-model.md">Source and model decisions →</a></p></section></main><footer><p><strong>PYKNON</strong> · A straight bridge, a consequential constraint.</p><p id="offline-status">Checking offline availability…</p><p><a href="https://github.com/antonsoo/pyknon">Open source / MIT</a> · <a href="https://github.com/antonsoo/pyknon/blob/main/THIRD_PARTY.md">Sources & credits</a></p></footer>
<dialog id="hk-dialog" class="hk-dialog" aria-labelledby="hk-dialog-title"><div class="hk-dialog-bar"><h2 id="hk-dialog-title">Whole printed page</h2><button type="button" id="hk-zoom-out">− Zoom out</button><button type="button" id="hk-zoom-in">+ Zoom in</button><button type="button" id="hk-close">Close</button></div><p>Arrow keys pan the complete page. Escape closes it.</p><div class="hk-pan" id="hk-pan" tabindex="0" role="region" aria-label="Enlarged page; arrow keys pan"><img id="hk-zoom-image" alt=""></div></dialog>`;
get("hk-notice").textContent = restored.notice;

function stop(message = "Ready. Simple tones; start at a comfortable volume.") {
  player.stop();
  for (const id of ["hk-stop", "hk-retuning-stop"]) get<HTMLButtonElement>(id).disabled = true;
  document.querySelectorAll(".hk-playing").forEach((el) => {
    el.classList.remove("hk-playing");
  });
  get("hk-audio-status").textContent = message;
}
function set(next: HelikonState, push = true) {
  const pageChanged = state.page !== next.page;
  state = validateHelikon(next);
  revision++;
  stop();
  render();
  if (push) history.pushState({ helikon: state }, "", helikonURL(state, location.href));
  get("hk-share-label").hidden = true;
  if (pageChanged) void showSource();
}
function render() {
  get("hk-source-board").innerHTML = sourceBoard(state);
  get("hk-retuning-board").innerHTML = retuningBoard(state);
  get("hk-source-table").innerHTML = sourceTable(state);
  get("hk-retuning-table").innerHTML = retuningTable(state);
  get("hk-interval-result").textContent = intervalResult(state);
  get("hk-retuning-result").textContent = retuningResult(state);
  get("hk-step-copy").textContent = HELIKON_STEPS[state.stage]?.[1] ?? "";
  get<HTMLButtonElement>("hk-previous").disabled = state.stage === 0;
  get<HTMLButtonElement>("hk-next").disabled = state.stage === 4;
  for (const [attr, v] of [
    ["stage", state.stage],
    ["pair", state.pair],
    ["target", state.target],
  ])
    document.querySelectorAll<HTMLButtonElement>(`[data-hk-${attr}]`).forEach((b) => {
      b.setAttribute("aria-pressed", String(b.getAttribute(`data-hk-${attr}`) === String(v)));
    });
  get<HTMLInputElement>("hk-bridge").value = String(state.bridge);
  get("hk-bridge-value").textContent = `${ft(fraction(state.bridge, 24))} of the full height`;
  get("hk-bridge-note").textContent =
    state.bridge === 12
      ? "At this position, BF = FD = 6. Select a different pair to hear another relation without moving the bridge."
      : "H, G and F now label your altered contacts. G no longer lies on the source’s diagonal. The string positions stay fixed.";
  for (const key of ["x1", "x2", "scale"] as const) {
    get<HTMLInputElement>(`hk-${key}`).value = String(state[key]);
    get(`hk-${key}-value`).textContent = ft(fraction(state[key], key === "scale" ? 12 : 504));
  }
  get("hk-transposition").innerHTML =
    `Left note: <strong>${hn((state.reference * 12) / state.scale)} Hz</strong>. Interval ratios and cents errors stay the same when this scale changes.`;
  const required = requiredLanes(state.target);
  get("hk-required-positions").textContent =
    `For this ${state.target} target, the exact inner positions are ${ft(fraction(required[1] ?? 0, 504))} and ${ft(fraction(required[2] ?? 0, 504))} of the width. The end positions stay 0 and 1.`;
  get<HTMLSelectElement>("hk-reference").value = String(state.reference);
  get<HTMLSelectElement>("hk-reading").value = String(state.reading);
  get<HTMLSelectElement>("hk-page").value = state.page;
  const p = HELIKON_READINGS[state.reading];
  if (p)
    get("hk-reading-body").innerHTML =
      `<p class="eyebrow">WALLIS 1682 / PRINTED P.${p.page}</p><h3>${he(p.title)}</h3><p lang="grc">${he(p.greek)}</p><p lang="la">${he(p.latin)}</p><p class="hk-english">${he(p.english)}</p><p class="hk-reading-note">${he(p.note)}</p><dl>${p.words.map(([g, l, meaning, job]) => `<dt><span lang="grc">${he(g)}</span> · <span lang="la">${he(l)}</span></dt><dd><strong>${he(meaning)}.</strong> ${he(job)}</dd>`).join("")}</dl>`;
}
async function showSource() {
  const rev = ++sourceRevision,
    page = helikonPage(state.page),
    img = get<HTMLImageElement>("hk-source-image");
  sourceVerified = false;
  get<HTMLButtonElement>("hk-enlarge").disabled = true;
  get("hk-open-source").hidden = true;
  get<HTMLDialogElement>("hk-dialog").close();
  img.removeAttribute("src");
  img.width = page.width;
  img.height = page.height;
  img.alt = helikonCaption(page.id);
  get("hk-source-caption").textContent = helikonCaption(page.id);
  get("hk-source-status").textContent = "Verifying the complete page…";
  try {
    const bytes = await helikonBytes(page.file);
    if (rev !== sourceRevision) return;
    const next = URL.createObjectURL(new Blob([bytes], { type: "image/jpeg" }));
    if (sourceURL) URL.revokeObjectURL(sourceURL);
    sourceURL = next;
    img.src = next;
    await img.decode();
    if (rev !== sourceRevision) return;
    sourceVerified = true;
    get<HTMLButtonElement>("hk-enlarge").disabled = false;
    get<HTMLAnchorElement>("hk-open-source").href = next;
    get("hk-open-source").hidden = false;
    get("hk-source-status").textContent =
      "Verified complete page · length and SHA-256 match this edition.";
  } catch (error) {
    if (rev !== sourceRevision) return;
    get("hk-source-status").textContent =
      error instanceof Error ? error.message : "The page could not be verified.";
  }
}
document.querySelectorAll<HTMLButtonElement>("[data-hk-stage]").forEach((b) => {
  b.addEventListener("click", () =>
    set({ ...state, stage: Number(b.dataset.hkStage), bridge: 12 }),
  );
});
get("hk-previous").addEventListener("click", () =>
  set({ ...state, stage: Math.max(0, state.stage - 1), bridge: 12 }),
);
get("hk-next").addEventListener("click", () =>
  set({ ...state, stage: Math.min(4, state.stage + 1), bridge: 12 }),
);
document.querySelectorAll<HTMLButtonElement>("[data-hk-pair]").forEach((b) => {
  b.addEventListener("click", () => set({ ...state, pair: Number(b.dataset.hkPair), stage: 4 }));
});
document.querySelectorAll<HTMLButtonElement>("[data-hk-target]").forEach((b) => {
  b.addEventListener("click", () =>
    set({ ...state, target: b.dataset.hkTarget as HelikonState["target"] }),
  );
});
for (const key of ["bridge", "x1", "x2", "scale"] as const) {
  const input = get<HTMLInputElement>(`hk-${key}`);
  input.addEventListener("input", () => {
    let n = Number(input.value);
    if (key === "x1") n = Math.min(n, state.x2 - 1);
    if (key === "x2") n = Math.max(n, state.x1 + 1);
    set({ ...state, [key]: n, ...(key === "bridge" ? { stage: 4 } : {}) }, false);
  });
  input.addEventListener("change", () =>
    history.pushState({ helikon: state }, "", helikonURL(state, location.href)),
  );
}
get("hk-source-reset").addEventListener("click", () => set({ ...state, bridge: 12, stage: 4 }));
get("hk-reference").addEventListener("change", () =>
  set({ ...state, reference: Number(get<HTMLSelectElement>("hk-reference").value) as 110 | 220 }),
);
get("hk-fixed").addEventListener("click", () => set({ ...state, x1: 252, x2: 336 }));
get("hk-fit").addEventListener("click", () => {
  const x = requiredLanes(state.target);
  set({ ...state, x1: x[1] ?? 252, x2: x[2] ?? 336 });
});
get("hk-reading").addEventListener("change", () =>
  set({ ...state, reading: Number(get<HTMLSelectElement>("hk-reading").value) }),
);
get("hk-reading-next").addEventListener("click", () =>
  set({ ...state, reading: (state.reading + 1) % HELIKON_READINGS.length }),
);
const inspect = (id: string) => {
  set({ ...state, page: id });
  get("hk-page").scrollIntoView({ block: "start" });
  get("hk-page").focus({ preventScroll: true });
};
get("hk-reading-source").addEventListener("click", () =>
  inspect(HELIKON_READINGS[state.reading]?.page ?? "97"),
);
document.querySelectorAll<HTMLButtonElement>("[data-hk-source]").forEach((b) => {
  b.addEventListener("click", () => inspect(b.dataset.hkSource ?? "98"));
});
get("hk-page").addEventListener("change", () =>
  set({ ...state, page: get<HTMLSelectElement>("hk-page").value }),
);
get("hk-source-retry").addEventListener("click", () => void showSource());
function zoomPage() {
  get<HTMLImageElement>("hk-zoom-image").width = Math.round(helikonPage(state.page).width * zoom);
}
get("hk-enlarge").addEventListener("click", () => {
  if (!sourceVerified) return;
  const img = get<HTMLImageElement>("hk-zoom-image");
  img.src = sourceURL;
  img.alt = helikonCaption(state.page);
  zoom = 1;
  zoomPage();
  get<HTMLDialogElement>("hk-dialog").showModal();
  get("hk-pan").focus();
});
get("hk-close").addEventListener("click", () => get<HTMLDialogElement>("hk-dialog").close());
get("hk-zoom-in").addEventListener("click", () => {
  zoom = Math.min(3, zoom + 0.25);
  zoomPage();
});
get("hk-zoom-out").addEventListener("click", () => {
  zoom = Math.max(0.5, zoom - 0.25);
  zoomPage();
});
get("hk-pan").addEventListener("keydown", (event) => {
  const directions: Record<string, readonly [number, number]> = {
    ArrowDown: [0, 100],
    ArrowUp: [0, -100],
    ArrowLeft: [-100, 0],
    ArrowRight: [100, 0],
  };
  const d = directions[event.key];
  if (!d) return;
  event.preventDefault();
  get("hk-pan").scrollBy(d[0], d[1]);
});
for (const id of ["hk-stop", "hk-retuning-stop"])
  get(id).addEventListener("click", () => stop("Stopped."));
document.querySelectorAll<HTMLButtonElement>("[data-hk-play]").forEach((b) => {
  b.addEventListener("click", async () => {
    const sound = b.dataset.hkPlay as "pair" | "segments" | "retuning",
      snapshot = { ...state };
    stop();
    for (const id of ["hk-stop", "hk-retuning-stop"]) get<HTMLButtonElement>(id).disabled = false;
    const pair = sourceInterval(snapshot);
    try {
      await player.play(
        helikonPlan(snapshot, sound),
        (tone) => {
          document.querySelectorAll(".hk-playing").forEach((el) => {
            el.classList.remove("hk-playing");
          });
          if (tone) {
            get("hk-audio-status").textContent =
              `${sound === "retuning" ? (tone.tuning === "ratios" ? "Your tuning" : "Target tuning") : "Source geometry"} · ${hn(tone.hz)} Hz`;
            if (sound === "pair")
              document
                .querySelector(`[data-hk-segment="${tone.note === 0 ? pair.a.id : pair.b.id}"]`)
                ?.classList.add("hk-playing");
          }
        },
        () => stop("Finished. The tones are a modern realization of these ratios."),
      );
    } catch (error) {
      stop(error instanceof Error ? error.message : "Audio is unavailable.");
    }
  });
});
window.addEventListener("pagehide", () => stop());
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stop("Stopped while the tab is hidden.");
});
window.addEventListener("popstate", () => {
  const restored = helikonFromURL(location.href);
  set(restored.state, false);
  get("hk-notice").textContent = restored.notice;
});

function save(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
get("hk-share").addEventListener("click", async () => {
  const url = helikonURL(state, location.href);
  get<HTMLInputElement>("hk-share-link").value = url;
  get("hk-share-label").hidden = false;
  try {
    await navigator.clipboard.writeText(url);
    get("hk-save-status").textContent = "Experiment link copied.";
  } catch {
    get("hk-save-status").textContent = "The experiment link is ready to select and copy.";
    get<HTMLInputElement>("hk-share-link").select();
  }
});
get("hk-import").addEventListener("change", async () => {
  const input = get<HTMLInputElement>("hk-import"),
    file = input.files?.[0],
    capturedRevision = revision,
    operation = ++openRevision;
  if (!file) return;
  try {
    if (file.size > 12000) throw new Error("Choose a helikon JSON record smaller than 12 KB.");
    const next = importHelikon(await file.text());
    if (operation !== openRevision) return;
    if (revision !== capturedRevision)
      throw new Error(
        "The settings changed while opening this file. Choose the file again to replace them.",
      );
    set(next);
    get("hk-save-status").textContent = "Saved experiment reopened.";
  } catch (error) {
    get("hk-save-status").textContent =
      error instanceof Error ? error.message : "The file could not be reopened.";
  } finally {
    if (operation === openRevision) input.value = "";
  }
});
document.querySelectorAll<HTMLButtonElement>("[data-hk-save]").forEach((b) => {
  b.addEventListener("click", async () => {
    const snapshot = { ...state },
      format = b.dataset.hkSave;
    b.disabled = true;
    get("hk-save-status").textContent = "Preparing this experiment and its verified assets…";
    try {
      let content: Blob;
      if (format === "json")
        content = new Blob([helikonJSON(snapshot)], { type: "application/json" });
      else if (format === "csv") content = new Blob([helikonCSV(snapshot)], { type: "text/csv" });
      else if (format === "wav") content = await renderWav(helikonPlan(snapshot, "retuning"));
      else if (format === "svg") {
        const [font, license, mit] = await Promise.all([
          helikonBytes("fonts/IBMPlexSans-Regular.woff2"),
          helikonBytes("fonts/IBMPlex-OFL.txt"),
          helikonBytes("sources/helikon/LICENSE.txt"),
        ]);
        content = new Blob(
          [
            helikonPlate(
              snapshot,
              await helikonData(font, "font/woff2"),
              `${new TextDecoder().decode(license)}\n${new TextDecoder().decode(mit)}`,
            ),
          ],
          { type: "image/svg+xml" },
        );
      } else {
        const [pair, target] = await Promise.all([
          renderWav(helikonPlan(snapshot, "pair")),
          renderWav(helikonPlan(snapshot, "retuning")),
        ]);
        content = new Blob([await helikonStudy(snapshot, pair, target)], { type: "text/html" });
      }
      save(content, `pyknon-helikon.${format}`);
      get("hk-save-status").textContent = "Saved the experiment captured when you pressed Save.";
    } catch (error) {
      get("hk-save-status").textContent =
        error instanceof Error ? error.message : "The study could not be saved.";
    } finally {
      b.disabled = false;
    }
  });
});
render();
void showSource();
void offline(get("offline-status"));
