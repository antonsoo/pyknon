import "./style.css";
import "./vina.css";
import { Player, renderWav } from "./audio";
import { at } from "./core/tetrachord";
import {
  parseVina,
  VINA_LONG,
  VINA_MAX,
  VINA_NAMES,
  VINA_PAGES,
  type VinaSound,
  type VinaState,
  vinaCSV,
  vinaFromQuery,
  vinaImport,
  vinaJSON,
  vinaMatches,
  vinaModel,
  vinaNearest,
  vinaPlan,
  vinaQuery,
} from "./core/vina";
import { offline } from "./offline";
import {
  VINA_SOURCES,
  vinaBytes,
  vinaCaption,
  vinaData,
  vinaOriginal,
  vinaPage,
} from "./vina-assets";
import {
  VINA_BEL,
  VINA_LIMITS,
  VINA_NORMALIZATION,
  VINA_READINGS,
  VINA_WORDS,
} from "./vina-content";
import { ve, vinaDrawing, vinaSvg, vinaTable, vn } from "./vina-drawing";
import { vinaStudy } from "./vina-study";

function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const e = document.getElementById(id);
  if (!e) throw Error(`Missing ${id}`);
  return e as T;
}
const initial = vinaFromQuery(location.search);
let state = initial.state,
  revision = 0,
  comparisonRevision = 0,
  sourceRevision = 0,
  sourceId = "",
  sourceUrl = "",
  busy = false;
const player = new Player();
const stages = [
  "Prepared alike",
  "First lowering",
  "Two-count matches",
  "Three-count matches",
  "Four-count matches",
];
el("app").innerHTML =
  `<a class="skip" href="#vn-bench">Skip to the two-vīṇā comparison</a><header class="site-header"><a class="brand" href="./">PYKNON<span lang="grc">πυκνόν</span></a><nav aria-label="Main"><a href="./#listen">Tetrachords</a><a href="./song.html">Read a song</a><a href="./canon.html">Six tones</a><a href="./trial.html">String trial</a><a href="./rhythm.html">Rhythm</a><a href="./tension.html">Weighted strings</a><a href="#vn-bench" aria-current="page">Two vīṇās</a></nav></header><main class="vn-main"><section class="vn-intro"><div><p class="vn-kicker">Early Sanskrit music theory / a matching experiment</p><h1>Same matches.<br>Different pitches.</h1></div><div><p>Two instruments begin alike. Lower one, and named notes meet: first two, then two, then three. The <cite>Nāṭyaśāstra</cite> counts <strong>twenty-two śrutis</strong> through these relations.</p><p>Does that tell us one exact tuning? Keep the matches, change one assumption, and listen to the difference.</p><a href="#vn-reading">Read the Sanskrit and its two named targets</a></div></section><p id="vn-notice" class="vn-notice" role="status" ${initial.notice ? "" : "hidden"}>${ve(initial.notice)}</p>
<section class="vn-section" id="vn-bench" aria-labelledby="vn-title"><div class="vn-heading"><h2 id="vn-title">Move one system<br>against the other.</h2><p>Violet: reference instrument.<br>Teal: moving instrument.<br>Both use the same modern cents ruler.</p></div><p class="vn-note">These rails compare pitches; they do not reconstruct an ancient vīṇā. The current preparation adds exact 4:3 fourths and 3:2 fifths to a modern reading of the source.</p><div class="vn-stages" role="group" aria-label="Successive matching stages">${stages.map((label, i) => `<button type="button" data-vn-stage="${i}" aria-controls="vn-verdict">${i === 0 ? "Start" : i}. ${label}<small id="vn-stage-${i}"></small></button>`).join("")}</div><div class="vn-play"><label for="vn-sound">Listening selection<select id="vn-sound"><option value="pair">Selected moving note and nearest reference</option><option value="fixed">Your reference system, low to high</option><option value="moving">The lowered system, low to high</option><option value="compare">Compare 21.51-cent preparation with yours</option></select></label><button type="button" id="vn-play" class="vn-primary">Hear the comparison</button><button type="button" id="vn-stop" disabled>Stop</button></div><p id="vn-play-status" class="vn-note" role="status">No autoplay. Modern sine tones; use your own comfortable volume.</p><div class="vn-board"><div class="vn-wide" id="vn-drawing"></div><div class="vn-phone" id="vn-phone-drawing"></div></div><p class="vn-note">Ni↓ is Ni in the lower octave. The small orange Pa↓ marks Pa in the other grāma. It is not an extra principal note.</p><fieldset class="vn-controls"><legend>Slide between the named stages</legend><label for="vn-position">Lower the moving system <output id="vn-position-value" for="vn-position"></output></label><input type="range" id="vn-position" min="0" max="4000" step="1"><p class="vn-note">Each section of this control interpolates between adjacent matching stages. Equal slider travel does not represent equal pitch changes.</p></fieldset><div id="vn-verdict" class="vn-verdict" aria-live="polite"></div><div class="vn-note-buttons" role="group" aria-label="Select a principal note">${VINA_NAMES.map((n, i) => `<button type="button" data-vn-select="${i}" aria-controls="vn-pair">${n}</button>`).join("")}</div><p id="vn-pair" class="vn-parameter-note" aria-live="polite"></p><button type="button" id="vn-read-stage">Read this stage in the source</button>
<div class="vn-control-grid"><fieldset class="vn-controls"><legend>Prepare both systems before comparing</legend><label for="vn-tuning">Reference difference at Pa<select id="vn-tuning"><option value="comma">81/80 comma · about 21.51 cents</option><option value="quarter">Quarter of the 9:8 interval · about 50.98 cents</option><option value="free">Your modern value</option><option value="boundary">Merge stages 2 and 3 · boundary</option><option value="zero">Zero difference · collapsed first stage</option></select></label><label for="vn-p">Your difference in cents <output id="vn-p-value" for="vn-p"></output></label><input type="range" id="vn-p" min="0" max="700" step="1"><div class="vn-actions"><button type="button" id="vn-change">Try the other valid preparation</button><button type="button" id="vn-fail">Try 70 cents</button></div><p class="vn-note">Changing this preparation retunes BOTH instruments. During a lowering, the reference stays fixed. The source does not prescribe either modern preset.</p></fieldset><fieldset class="vn-controls"><legend>What the extra assumption leaves free</legend><p id="vn-validity" class="vn-parameter-note" role="status"></p><label for="vn-root">Arbitrary modern Sa reference<select id="vn-root"><option value="110">110 Hz</option><option value="220">220 Hz</option></select></label><p class="vn-note">The 21.51-cent option is a familiar modern just-intonation solution. It is not a claim that Bharata specified 81/80. The other valid preparation preserves the same note matches while changing Ri and Dha.</p></fieldset></div><div id="vn-table" class="vn-table" tabindex="0" role="region" aria-label="Principal notes and model frequencies"></div><details><summary>See the actual four lowering sizes</summary><div class="vn-table" id="vn-lowerings" tabindex="0" role="region" aria-label="Successive pitch changes"></div><p>The model is after <a href="${VINA_BEL}">Bernard Bel's mathematical discussion</a> (1984; revised 1988 and December 2020), especially pp.4–11. The source supplies matching relations; the exact pure intervals and the remaining parameter are modern assumptions. The model does not assign frequencies to all twenty-two individual śrutis.</p></details></section>
<section class="vn-section" aria-labelledby="vn-count-title"><div class="vn-heading"><h2 id="vn-count-title">Count below the note.</h2><p>Two notes × two.<br>Two × three. Three × four.</p></div><p>The source's list is <strong>4–3–2–4–4–3–2 below Sa–Ri–Ga–Ma–Pa–Dha–Ni</strong>. Starting from Sa and climbing to the next Sa, the intervening counts are <strong>3–2–4–4–3–2–4</strong>. Sa's four-count interval is the last one, from lower Ni.</p><p>Thus 2×2 + 2×3 + 3×4 = 22. This arithmetic remains the same for both valid modern preparations, while their frequencies differ. Dividing 1200 cents by 22 would add a separate equal-temperament assumption.</p><p class="vn-note">This is a source-specific pitch-system argument, not a rule for the intonation of present-day Indian music or a claim that every śruti has one universally fixed size.</p></section>
<section class="vn-section vn-focus" id="vn-reading" aria-labelledby="vn-reading-title"><div class="vn-heading"><h2 id="vn-reading-title" tabindex="-1">Read the words.<br>Keep the uncertainty.</h2><p>Romanized Sanskrit, new English,<br>and complete 1888 printed pages.</p></div><div class="vn-reading"><div><label for="vn-reading-choice">Source passage<select id="vn-reading-choice">${VINA_READINGS.map((p, i) => `<option value="${i}">${i + 1}. ${ve(p.title)}</option>`).join("")}</select></label><article id="vn-reading-text" class="vn-reading-text"></article><button type="button" id="vn-find-reading">Find this passage on the full page</button><div class="vn-words" role="group" aria-label="Sanskrit word notes">${VINA_WORDS.map((w, i) => `<button type="button" data-vn-word="${i}" aria-controls="vn-word-note" lang="sa-Latn">${ve(w[0])}</button>`).join("")}</div><div id="vn-word-note" class="vn-word-note" aria-live="polite"></div></div><div><div class="vn-source-controls"><label for="vn-page">Complete page<select id="vn-page">${VINA_PAGES.map((p) => `<option value="${p}">${p === "title" ? "Study title" : `Grosset p.${p}`}</option>`).join("")}</select></label><button type="button" id="vn-retry">Reload source</button></div><p id="vn-source-status" class="vn-note" role="status"></p><label class="vn-source-zoom" for="vn-zoom">Enlarge page <input id="vn-zoom" type="range" min="100" max="400" step="25" value="100"><output id="vn-zoom-value" for="vn-zoom">100%</output></label><div id="vn-pan" class="vn-pan" tabindex="0" role="region" aria-label="Complete source page; enlarge then use arrows to pan"><img id="vn-source-image" hidden alt=""></div><p id="vn-source-caption" class="vn-note"></p><div class="vn-actions"><a id="vn-original">Original PDF at this page</a><a href="./sources/vina/manifest.json">Source identities and normalization</a></div></div></div><div class="vn-literal"><h3>Two targets do not specify their pairing.</h3><p>Grosset p.29 prints Ga–Ni entering Dha–Ri. Our model's pitch-ordered pairing is Ga→Ri and Ni→Dha. Pairing the printed lists literally in their order, in the same initial octave, gives a large mismatch:</p><div class="vn-table" id="vn-literal-table" tabindex="0" role="region" aria-label="Printed list order compared with pitch pairing"></div><button type="button" id="vn-check-order">Inspect the second lowering and this clause</button><p class="vn-note">The Sanskrit does not say 'respectively'. This test of a possible ordered pairing does not prove a corrupt text. The two target names are unchanged. Grosset's broader uncertainty about the demonstration is retained in note 36, p.86; the modern pitch model stays separately attributed.</p></div><details><summary>Edition, transcription and model boundaries</summary><p>${ve(VINA_NORMALIZATION)}</p><p>${ve(VINA_LIMITS)}</p><p>${ve(VINA_SOURCES.edition)} The retained edition includes historical commentary whose wider claims are not endorsed by this activity. Modern analysis: <a href="${VINA_BEL}">Bernard Bel</a>. The new English is ours; no later English translation is bundled.</p></details></section>
<section class="vn-section" id="vn-save"><div class="vn-heading"><h2>Keep your counterexample.</h2><p>One independent reading edition,<br>with its sound and printed witnesses.</p></div><p>The HTML includes the current rulers, all nine readings, eight full source pages, the selected synthetic audio, editable JSON, pitch CSV, fonts and licenses. It opens with scripts disabled. The saved sound is static; reopen JSON here to change the experiment.</p><div class="vn-save-actions"><button type="button" id="vn-save-html" class="vn-primary">Save illustrated reading · HTML</button><button type="button" id="vn-save-wav">Save selected sound · WAV</button><button type="button" id="vn-save-csv">Save pitch comparison · CSV</button><button type="button" id="vn-save-svg">Save comparison plate · SVG</button><button type="button" id="vn-save-json">Save editable settings · JSON</button><button type="button" id="vn-share">Copy comparison link</button></div><label class="vn-import" for="vn-import">Reopen comparison JSON<input id="vn-import" type="file" accept=".json,application/json"></label><p id="vn-save-status" role="status">Source and font identities are checked before the illustrated reading or font-embedded SVG is saved.</p></section><p class="vn-connections"><a href="./#listen">Compare with Archytas's tetrachord divisions</a> · <a href="./tension.html">Test the weighted-string story</a></p></main><footer><p id="offline-status" role="status">Checking the offline edition…</p><p><a href="https://github.com/antonsoo/pyknon">Code / MIT</a> · Public-domain 1888 printed source · New English and diagrams by Anton Soloviev</p></footer>`;
function stop(message = "Sound stopped.") {
  revision++;
  player.stop();
  el<HTMLButtonElement>("vn-stop").disabled = true;
  el("vn-play-status").textContent = message;
  for (const e of document.querySelectorAll(".vn-sounding")) e.classList.remove("vn-sounding");
}
function renderReading() {
  const p = at(VINA_READINGS, state.reading);
  el<HTMLSelectElement>("vn-reading-choice").value = String(state.reading);
  el("vn-reading-text").innerHTML =
    `<h3>${ve(p.title)}</h3><p lang="${p.language}">${ve(p.original)}</p><p>${ve(p.english)}</p><p class="vn-note">${ve(p.note)} Grosset p.${p.page}.</p>`;
}
async function showSource(force = false) {
  if (!force && sourceId === state.page) return;
  sourceId = state.page;
  const ticket = ++sourceRevision,
    id = state.page,
    p = vinaPage(id),
    im = el<HTMLImageElement>("vn-source-image");
  im.hidden = true;
  el("vn-source-status").textContent = "Verifying the complete printed page…";
  el("vn-source-caption").textContent = vinaCaption(id);
  el<HTMLAnchorElement>("vn-original").href = vinaOriginal(id);
  let url = "";
  try {
    const bytes = await vinaBytes(p.file);
    url = URL.createObjectURL(new Blob([bytes], { type: "image/jpeg" }));
    const fresh = new Image();
    fresh.src = url;
    await fresh.decode();
    if (ticket !== sourceRevision) {
      URL.revokeObjectURL(url);
      return;
    }
    const previous = sourceUrl;
    sourceUrl = url;
    fresh.id = "vn-source-image";
    fresh.alt = vinaCaption(id);
    fresh.hidden = false;
    fresh.style.width = `${el<HTMLInputElement>("vn-zoom").value}%`;
    im.replaceWith(fresh);
    if (previous) URL.revokeObjectURL(previous);
    el("vn-source-status").textContent =
      `Verified complete source page · ${p.bytes.toLocaleString("en-US")} bytes · SHA-256 identity matches.`;
  } catch (error) {
    if (url) URL.revokeObjectURL(url);
    if (ticket === sourceRevision)
      el("vn-source-status").textContent =
        error instanceof Error ? error.message : "Source unavailable. Retry when available.";
  }
}
function render() {
  const m = vinaModel(state),
    pairs = vinaMatches(state),
    n = vinaNearest(state);
  el("vn-drawing").innerHTML = vinaDrawing(state);
  el("vn-phone-drawing").innerHTML = vinaDrawing(state, true);
  el<HTMLInputElement>("vn-position").value = String(state.position);
  el("vn-position-value").textContent = `${vn(m.shift)} cents`;
  el<HTMLSelectElement>("vn-tuning").value = state.tuning;
  el<HTMLInputElement>("vn-p").value = String(state.tenth);
  el("vn-p-value").textContent =
    `${vn(state.tenth / 10, 1)}${state.tuning !== "free" ? " · inactive until moved" : ""}`;
  el<HTMLSelectElement>("vn-root").value = String(state.root);
  el<HTMLSelectElement>("vn-sound").value = state.sound;
  el<HTMLSelectElement>("vn-page").value = state.page;
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-vn-stage]")) {
    const i = Number(b.dataset.vnStage);
    b.setAttribute("aria-pressed", String(state.position === i * 1000));
    el(`vn-stage-${i}`).textContent = `${vn(at(m.lowerings, i))} cents total`;
  }
  for (const b of document.querySelectorAll<HTMLButtonElement>("[data-vn-select]"))
    b.setAttribute("aria-pressed", String(Number(b.dataset.vnSelect) === state.selected));
  const exact = state.position % 1000 === 0,
    heading = exact ? at(stages, m.stage) : `Between stages ${m.stage} and ${m.stage + 1}`;
  el("vn-read-stage").textContent = exact
    ? "Read this stage in the source"
    : "Read the nearest named stage in the source";
  const principal = pairs
    .map(
      (p) => `${at(VINA_NAMES, p.moving)} → ${at(VINA_NAMES, p.fixed)}${p.octave < 0 ? "↓" : ""}`,
    )
    .join("; ");
  el("vn-verdict").innerHTML =
    `<strong>${ve(heading)} · ${vn(m.shift)} cents down</strong><p>${principal ? `Principal-note matches: ${principal}.` : "No principal-note match at this position."}</p><p>${state.position === 1000 ? "Moving Pa meets the lower Pa↓ of the other grāma. The seven principal notes have not yet met another reference note." : state.position === 4000 ? "Two notes × 2 + two × 3 + three × 4 = 22 source counts. The last three matches respect the lower octave of Ni." : "Move through the four named stages, then change the initial preparation and repeat."}${m.valid ? "" : " This preparation fails the ordered four-stage model; the arithmetic 22 is not a successful demonstration here."}</p>`;
  el("vn-pair").innerHTML =
    `<strong>${at(VINA_NAMES, state.selected)} · <span lang="sa-Latn">${at(VINA_LONG, state.selected)}</span></strong>Moving ${vn(at(m.movingHz, state.selected), 4)} Hz; nearest reference ${at(VINA_NAMES, n.fixed)}${n.octave < 0 ? " in the lower octave" : ""} at ${vn(at(m.fixedHz, n.fixed) * 2 ** n.octave, 4)} Hz. ${Math.abs(n.delta) < 1e-8 ? "Exact model coincidence." : `${vn(n.delta)} cents from that reference; no exact coincidence.`}`;
  const valid = el("vn-validity");
  valid.dataset.valid = String(m.valid);
  valid.innerHTML = m.valid
    ? `<strong>The ordered matches survive.</strong>Chosen difference ${vn(m.p)} cents. Two-count ${vn(m.c)} &lt; three-count ${vn(m.b)} &lt; four-count ${vn(m.a)} cents. The count is still 22; the pitches need not be the same.`
    : `<strong>${m.p === 0 ? "The first lowering vanishes." : Math.abs(m.b - m.c) < 1e-9 ? "Stages two and three merge." : "The third stage reverses direction."}</strong>Two-count ${vn(m.c)} and three-count ${vn(m.b)} cents. Distinct ordered stages require 0 &lt; p &lt; ${vn(VINA_MAX, 6)} cents under these modern assumptions.`;
  el("vn-table").innerHTML = vinaTable(state);
  el("vn-lowerings").innerHTML =
    `<table><thead><tr><th>Stage</th><th>Total down · cents</th><th>New change down · cents</th></tr></thead><tbody>${m.lowerings.map((v, i) => `<tr><th>${i}</th><td>${vn(v, 6)}</td><td>${i ? vn(at(m.increments, i - 1), 6) : "—"}</td></tr>`).join("")}</tbody></table>`;
  const second = vinaModel({ ...state, position: 2000 }),
    literal = [
      [2, 5],
      [6, 1],
    ],
    ordered = [
      [2, 1],
      [6, 5],
    ];
  el("vn-literal-table").innerHTML =
    `<table><thead><tr><th>Pairing</th><th>Ga target / mismatch</th><th>Ni target / mismatch</th></tr></thead><tbody>${[
      ["Printed lists, paired in order", literal],
      ["Modern pitch-ordered model", ordered],
    ]
      .map(
        ([label, p]) =>
          `<tr><th>${label}</th>${(p as number[][]).map((pair) => `<td>${at(VINA_NAMES, at(pair, 1))} / ${vn(at(second.moving, at(pair, 0)) - at(second.fixed, at(pair, 1)))} cents</td>`).join("")}</tr>`,
      )
      .join("")}</tbody></table>`;
  renderReading();
  void showSource();
}
function update(next: VinaState, push = true) {
  const valid = parseVina(next);
  comparisonRevision++;
  stop("Sound stopped because the comparison changed.");
  state = valid;
  render();
  if (push) history.pushState(null, "", `${vinaQuery(state)}${location.hash}`);
}
const stageReadings = [2, 1, 3, 4, 5],
  stageNotes = [0, 4, 2, 1, 0];
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-vn-stage]"))
  b.addEventListener("click", () => {
    const i = Number(b.dataset.vnStage);
    update({ ...state, position: i * 1000, selected: at(stageNotes, i) });
  });
el<HTMLInputElement>("vn-position").addEventListener("input", (e) =>
  update({ ...state, position: Number((e.target as HTMLInputElement).value) }),
);
el<HTMLSelectElement>("vn-tuning").addEventListener("change", (e) =>
  update({ ...state, tuning: (e.target as HTMLSelectElement).value as VinaState["tuning"] }),
);
el<HTMLInputElement>("vn-p").addEventListener("input", (e) =>
  update({ ...state, tuning: "free", tenth: Number((e.target as HTMLInputElement).value) }),
);
el("vn-change").addEventListener("click", () =>
  update({ ...state, tuning: state.tuning === "quarter" ? "comma" : "quarter" }),
);
el("vn-fail").addEventListener("click", () => update({ ...state, tuning: "free", tenth: 700 }));
el<HTMLSelectElement>("vn-root").addEventListener("change", (e) =>
  update({ ...state, root: Number((e.target as HTMLSelectElement).value) as 110 | 220 }),
);
el<HTMLSelectElement>("vn-sound").addEventListener("change", (e) =>
  update({ ...state, sound: (e.target as HTMLSelectElement).value as VinaSound }),
);
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-vn-select]"))
  b.addEventListener("click", () => update({ ...state, selected: Number(b.dataset.vnSelect) }));
el<HTMLSelectElement>("vn-reading-choice").addEventListener("change", (e) =>
  update({ ...state, reading: Number((e.target as HTMLSelectElement).value) }),
);
el("vn-find-reading").addEventListener("click", () =>
  update({ ...state, page: at(VINA_READINGS, state.reading).page }),
);
el("vn-read-stage").addEventListener("click", () => {
  const reading = at(stageReadings, Math.round(state.position / 1000));
  update({ ...state, reading, page: at(VINA_READINGS, reading).page });
  el("vn-reading-title").focus();
});
el("vn-check-order").addEventListener("click", () => {
  update({ ...state, position: 2000, selected: 2, reading: 3, page: "29" });
  el("vn-reading-title").focus();
});
el<HTMLSelectElement>("vn-page").addEventListener("change", (e) =>
  update({ ...state, page: (e.target as HTMLSelectElement).value as VinaState["page"] }),
);
el("vn-retry").addEventListener("click", () => void showSource(true));
el<HTMLInputElement>("vn-zoom").addEventListener("input", (e) => {
  const v = (e.target as HTMLInputElement).value;
  el<HTMLImageElement>("vn-source-image").style.width = `${v}%`;
  el("vn-zoom-value").textContent = `${v}%`;
});
for (const b of document.querySelectorAll<HTMLButtonElement>("[data-vn-word]"))
  b.addEventListener("click", () => {
    const w = at(VINA_WORDS, Number(b.dataset.vnWord));
    el("vn-word-note").innerHTML =
      `<strong><span lang="sa-Latn">${ve(w[0])}</span> · ${ve(w[1])}</strong>${ve(w[2])}`;
  });
el("vn-stop").addEventListener("click", () => stop());
el("vn-play").addEventListener("click", async () => {
  stop();
  const ticket = revision;
  el<HTMLButtonElement>("vn-stop").disabled = false;
  el("vn-play-status").textContent = "Preparing the selected sine comparison…";
  try {
    const plan = vinaPlan(state);
    await player.play(
      plan,
      (tone) => {
        if (ticket !== revision) return;
        for (const e of document.querySelectorAll(".vn-sounding"))
          e.classList.remove("vn-sounding");
        if (tone) {
          const actual = plan.tones.find((t) => t === tone);
          el("vn-play-status").textContent = actual?.label ?? "Sounding selected comparison.";
          const row = actual?.row === "moving" ? "moving" : "fixed";
          for (const e of document.querySelectorAll(`[data-vn-note="${row}-${tone.note}"]`))
            e.classList.add("vn-sounding");
        }
      },
      () => {
        if (ticket === revision) stop("Comparison finished. The tones are a modern illustration.");
      },
    );
  } catch (error) {
    if (ticket === revision) stop(error instanceof Error ? error.message : "Audio unavailable.");
  }
});
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
for (const type of ["json", "csv", "svg", "wav", "html"] as const)
  el(`vn-save-${type}`).addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    const ticket = comparisonRevision,
      s = { ...state };
    el("vn-save-status").textContent =
      type === "html"
        ? "Verifying eight whole source pages, fonts and the selected sound…"
        : "Preparing the selected file…";
    try {
      let blob: Blob;
      if (type === "json") blob = new Blob([vinaJSON(s)], { type: "application/json" });
      else if (type === "csv") blob = new Blob([vinaCSV(s)], { type: "text/csv;charset=utf-8" });
      else if (type === "svg")
        blob = new Blob(
          [
            vinaSvg(
              s,
              await vinaData(await vinaBytes("fonts/IBMPlexSans-Regular.woff2"), "font/woff2"),
            ),
          ],
          { type: "image/svg+xml" },
        );
      else {
        const wav = await renderWav(vinaPlan(s));
        blob =
          type === "wav"
            ? wav
            : new Blob([await vinaStudy(s, wav)], { type: "text/html;charset=utf-8" });
      }
      if (ticket !== comparisonRevision) {
        el("vn-save-status").textContent =
          "The comparison changed while the file was prepared. Save the current version again.";
        return;
      }
      download(blob, `pyknon-two-vinas.${type}`);
      el("vn-save-status").textContent =
        `Prepared ${type.toUpperCase()} for download with the selected comparison${type === "html" ? ", all eight verified pages, fonts and static audio" : ""}.`;
    } catch (error) {
      el("vn-save-status").textContent =
        error instanceof Error ? error.message : "The file could not be prepared.";
    } finally {
      busy = false;
    }
  });
el("vn-share").addEventListener("click", async () => {
  const url = new URL(location.href);
  url.search = vinaQuery(state);
  url.hash = "vn-bench";
  try {
    await navigator.clipboard.writeText(url.href);
    el("vn-save-status").textContent = "Comparison link copied.";
  } catch {
    el("vn-save-status").textContent = `Copy this comparison link: ${url.href}`;
  }
});
el<HTMLInputElement>("vn-import").addEventListener("change", async (e) => {
  const input = e.target as HTMLInputElement,
    file = input.files?.[0];
  if (!file) return;
  const ticket = comparisonRevision;
  try {
    if (file.size > 65536) throw Error("Use a comparison file smaller than 64 KB.");
    const raw = await file.text();
    if (ticket !== comparisonRevision)
      throw Error(
        "The comparison changed while the file was opened. Reopen it again to replace the current settings.",
      );
    update(vinaImport(raw));
    el("vn-save-status").textContent = "Saved comparison reopened.";
  } catch (error) {
    el("vn-save-status").textContent =
      error instanceof Error ? error.message : "Unsupported comparison file.";
  } finally {
    input.value = "";
  }
});
window.addEventListener("popstate", () => {
  const result = vinaFromQuery(location.search);
  update(result.state, false);
  el("vn-notice").textContent = result.notice;
  el("vn-notice").hidden = !result.notice;
});
window.addEventListener("pagehide", () => {
  comparisonRevision++;
  stop();
  sourceRevision++;
  if (sourceUrl) URL.revokeObjectURL(sourceUrl);
});
render();
void offline(el("offline-status"));
