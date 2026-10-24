import "./style.css";
import "./rhythm.css";
import { Player, renderWav } from "./audio";
import {
  betweenFoot,
  chosen,
  GENUS_NAMES,
  parseRhythm,
  type RhythmListening,
  type RhythmState,
  type RhythmTone,
  reference,
  rhythmFromQuery,
  rhythmImport,
  rhythmJSON,
  rhythmOnsetsCsv,
  rhythmPlan,
  rhythmQuery,
} from "./core/rhythm";
import type { Tone } from "./core/tetrachord";
import { offline } from "./offline";
import { RHYTHM_ARCHIVE, RHYTHM_PAGES, RHYTHM_PASSAGES, RHYTHM_WORDS } from "./rhythm-content";
import {
  betweenDrawing,
  betweenTable,
  rhEscape,
  rhythmDrawing,
  rhythmTable,
} from "./rhythm-drawing";
import { RHYTHM_SOUND_NAMES, rhythmStudy } from "./rhythm-study";

const get = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing ${id}`);
  return el as T;
};
const initial = rhythmFromQuery(location.search);
let state = initial.state,
  passageIndex = 4,
  zoom = 1,
  revision = 0;
const player = new Player();
get("app").innerHTML =
  `<a class="skip" href="#rhythm">Skip to the rhythm bench</a><header class="site-header"><a class="brand" href="./">PYKNON<span lang="grc">πυκνόν</span></a><nav aria-label="Main"><a href="./#listen">Tetrachords</a><a href="./song.html">Read a song</a><a href="./canon.html">Six tones</a><a href="./trial.html">String trial</a><a href="#rhythm" aria-current="page">Rhythm</a></nav></header>
<main class="rh-main"><section class="rh-intro"><h1>Six times.<br/>Two different rhythms.</h1><div><p>Keep a foot at six primary times. Divide it 3+3, then 2+4. The whole stays equal; its rhythmic genus changes.</p><p>Make and hear the distinction in Aristoxenus’s <cite>Rhythmic Elements</cite>. His Greek also asks why an ordinary numerical fraction does not settle a musical question.</p></div></section><p id="rh-notice" role="status" hidden></p>
<section id="rhythm" class="rh-section" aria-labelledby="rh-title"><div class="rh-section-heading"><h2 id="rh-title">A whole, and its division.</h2><p>Violet is the up portion.<br/>Teal is the down portion.</p></div><div class="rh-presets" role="group" aria-label="Source experiments"><button type="button" data-rh-case="6">Six: equal or double?</button><button type="button" data-rh-case="5">Five: find 3:2</button><button type="button" data-rh-case="7">Seven: test 4:3</button></div>
<div class="rh-controls"><label>Whole foot<select id="rh-total">${[3, 4, 5, 6, 7, 8].map((n) => `<option value="${n}">${n} primary times</option>`).join("")}</select></label><label>Up portion<select id="rh-up"></select></label><button id="rh-reverse" type="button">Reverse up and down</button><label>Modern unit: <output id="rh-unit-value"></output><input id="rh-unit" type="range" min="180" max="600" step="30" value="300"/></label><label>Smaller attacks<select id="rh-texture"><option value="units">Each primary time</option><option value="joined">Join within each portion</option></select></label></div>
<div class="rh-score"><div id="rh-drawing"></div><p id="rh-score-caption"></p></div><div class="rh-play"><button type="button" id="rh-play-chosen">Hear your foot</button><button type="button" id="rh-play-compare">Compare reference and yours</button><button type="button" id="rh-stop" disabled>Stop sound</button></div><p id="rh-play-state" role="status">Modern sine markers; no sound plays until requested.</p><p id="rh-position" aria-hidden="true"></p><div id="rh-result" class="rh-result" aria-live="polite"></div><details><summary>Exact durations and the scope of the classification</summary><div id="rh-table" class="table-scroll" tabindex="0" role="region" aria-label="Exact foot durations"></div><p>This bench recognizes the equal, double and 3:2 families admitted for continuous rhythmic composition in this fragment. A result outside them is not a verdict on every ancient author or on rhythm in general. The seven-time experiment makes that boundary visible.</p><p>The reference uses the whole-number division nearest the middle. With an odd total it may be unequal, and at seven it too lies outside the admitted families. Both rows use the same chosen modern unit duration.</p></details><p class="rh-note">Sine clicks mark positions; their short decay is not a sung note’s duration. Their pitches distinguish up, down and inner attacks. They illustrate temporal roles without reconstructing an ancient accent pattern, instrument or bodily movement. Changing smaller attacks keeps the foot’s defining division in place.</p></section>
<section id="rh-between" class="rh-section" aria-labelledby="rh-between-title"><div class="rh-section-heading"><h2 id="rh-between-title">An intermediate foot.</h2><p>Hold down at two times.<br/>Change the up portion.</p></div><p>Aristoxenus compares up portions of one and two times, then an intermediate size. Our exact 1½ is a chosen illustration. Its up:down ratio is 3:4, an ordinary rational fraction.</p><div class="rh-controls"><label>Example<select id="rh-between-choice"><option value="one">Up 1, down 2: endpoint</option><option value="middle">Up 1½, down 2: our illustration</option><option value="two">Up 2, down 2: endpoint</option></select></label><button type="button" id="rh-play-between">Hear this example</button></div><div class="rh-score"><div id="rh-between-drawing"></div><p>All three rows start with the fixed down portion for comparison. Here one unit stays 300 ms, so the whole foot’s duration changes.</p></div><p class="rh-between-argument">The fragment calls an intermediate foot <span lang="grc">ἄλογος</span>. Its argument asks for a common measure that is itself rhythmically admissible. A numerical rescaling alone does not establish that musical condition.</p><p id="rh-between-result"></p><details><summary>Compare the three examples</summary><div class="table-scroll" tabindex="0" role="region" aria-label="Three intermediate-example durations">${betweenTable()}</div><p>This finite illustration does not classify every intervening ratio, set a modern threshold of perception, or claim to test what a listener recognizes. The source says “intermediate”; it does not give the number 1½.</p></details></section>
<section id="rh-reading" class="rh-section" aria-labelledby="rh-reading-title"><div class="rh-section-heading"><h2 id="rh-reading-title">Read the distinctions.</h2><p>Aristoxenus’s Greek.<br/>New English and word notes.</p></div><p>These ten passages are selected from the main text of <cite>Rhythmic Elements</cite> II in Westphal’s 1861 edition. Later parallel witnesses printed below its rules remain separate. One short Latin parallel is identified in the reading.</p><div class="rh-reading"><article><label>Passage<select id="rh-passage">${RHYTHM_PASSAGES.map((p, i) => `<option value="${i}">${i + 1}. ${rhEscape(p.title)}</option>`).join("")}</select></label><div id="rh-passage-text"></div></article><figure class="rh-source"><div class="rh-source-tools"><label>Printed page<select id="rh-page">${RHYTHM_PAGES.map((p) => `<option value="${p}">${p === "title" ? "1861 title page" : `Page ${p}`}</option>`).join("")}</select></label><label>Zoom<select id="rh-zoom"><option value="1">Fit width</option><option value="2">200%</option><option value="4">400%</option></select></label><a id="rh-scan-link" href="./sources/rhythm/westphal-37.jpg" target="_blank" rel="noreferrer">Open full scan</a></div><div id="rh-source-window" tabindex="0" role="region" aria-label="Printed source page; zoom then use arrows or scroll"><img id="rh-scan" src="./sources/rhythm/westphal-37.jpg" alt="Westphal 1861, full printed page 37"/></div><figcaption id="rh-source-caption"></figcaption></figure></div><details><summary>Edition and what the text leaves open</summary><p>Rudolf Westphal, <cite>Die Fragmente und die Lehrsätze der griechischen Rhythmiker</cite>, supplement to A. Rossbach’s <cite>Griechische Rhythmik</cite> (Leipzig: B. G. Teubner, 1861), printed pp.28,31,33–37. Greek ligatures, line wrapping, spacing and punctuation are normalized; footnote calls are omitted. Full pages retain the apparatus and parallel witnesses.</p><p>The Aristoxenus fragment breaks off during its eight-time explanation, after “because”. We preserve the break. Psellus’s additional ratios, printed separately in this edition, are not silently combined with this passage’s three-genus classification.</p><p><a href="${RHYTHM_ARCHIVE}">Complete scanned edition</a> · <a href="./sources/rhythm/manifest.json">Page identities</a> · <a href="https://github.com/antonsoo/pyknon/blob/main/docs/rhythm-model.md">Source and model notes</a></p></details></section>
<section id="rh-save" class="rh-section" aria-labelledby="rh-save-title"><div class="rh-section-heading"><h2 id="rh-save-title">Keep a foot and its sources.</h2><p>Drawing, reading and sound.<br/>One complete HTML file.</p></div><p>The illustrated reading preserves both experiments, exact tables, all ten passages, word notes, eight full source pages, the Greek font, editable comparison JSON and the selected synthetic WAV. It opens from disk and executes no scripts.</p><label class="rh-save-sound">Selected sound for the saved reading and WAV<select id="rh-sound">${Object.entries(
    RHYTHM_SOUND_NAMES,
  )
    .map(([key, label]) => `<option value="${key}">${label}</option>`)
    .join(
      "",
    )}</select></label><div class="rh-save-actions"><button id="rh-save-reading" type="button">Save illustrated reading · HTML</button><button id="rh-save-wav" type="button">Save selected sound · WAV</button><button id="rh-save-csv" type="button">Save marker onsets · CSV</button><button id="rh-save-svg" type="button">Save score diagram · SVG</button><button id="rh-save-json" type="button">Save comparison · JSON</button><button id="rh-share" type="button">Copy comparison link</button></div><label class="rh-import">Reopen comparison JSON<input id="rh-import" type="file" accept="application/json,.json"/></label><p id="rh-save-status" role="status">WAV and onset CSV preserve the selected modern sound schedule, not measured ancient timings.</p></section><p class="rh-connections"><a href="./canon.html">Compare time ratios with the six-tone pitch argument</a> · <a href="./song.html">Read the Seikilos song and its written durations</a></p></main><footer><p id="offline-status" role="status">Checking the offline edition…</p><p><a href="https://github.com/antonsoo/pyknon">Source code</a> · Public-domain printed source; new code and teaching text MIT.</p></footer>`;
const total = get<HTMLSelectElement>("rh-total"),
  up = get<HTMLSelectElement>("rh-up"),
  unit = get<HTMLInputElement>("rh-unit"),
  texture = get<HTMLSelectElement>("rh-texture");
const between = get<HTMLSelectElement>("rh-between-choice"),
  sound = get<HTMLSelectElement>("rh-sound"),
  passage = get<HTMLSelectElement>("rh-passage"),
  page = get<HTMLSelectElement>("rh-page");
function clearMarkers() {
  for (const node of document.querySelectorAll(".rh-sounding"))
    node.classList.remove("rh-sounding");
  get("rh-position").textContent = "";
}
function stop(message = "Sound stopped.") {
  revision++;
  player.stop();
  clearMarkers();
  get<HTMLButtonElement>("rh-stop").disabled = true;
  get("rh-play-state").textContent = message;
}
function draw() {
  const width = get("rh-drawing").clientWidth;
  get("rh-drawing").innerHTML = rhythmDrawing(state, width);
  get("rh-between-drawing").innerHTML = betweenDrawing(state, width);
}
function render() {
  total.value = String(state.total);
  if (up.options.length !== state.total - 1)
    up.innerHTML = Array.from(
      { length: state.total - 1 },
      (_, i) => `<option value="${i + 1}">${i + 1} up; ${state.total - i - 1} down</option>`,
    ).join("");
  up.value = String(state.up);
  unit.value = String(state.unitMs);
  texture.value = state.texture;
  between.value = state.between;
  sound.value = state.sound;
  get("rh-unit-value").textContent = `${state.unitMs} ms`;
  const a = reference(state),
    b = chosen(state);
  get("rh-score-caption").textContent =
    `Both feet span ${state.total} primary times = ${state.total * state.unitMs} ms. The unit ticks stay fixed; dots are ${state.texture === "units" ? "modern attacks on each unit" : "modern attacks only at the start of each portion"}.`;
  get("rh-table").innerHTML = rhythmTable(state);
  get("rh-result").innerHTML =
    b.genus === "outside"
      ? `<strong>${b.up}+${b.down} gives ${b.ratio.join(":")}.</strong> This division falls outside the three genera admitted in the selected fragment. The ${a.up}+${a.down} reference ${a.genus === "outside" ? "also falls outside them" : `belongs to the ${a.genus} genus`}.`
      : `<strong>${b.up}+${b.down}: ${GENUS_NAMES[b.genus]}.</strong> Its whole is ${state.total} times, just like the ${a.up}+${a.down} reference. ${a.genus === b.genus ? "These divisions share a genus; unequal up/down assignments can still reverse." : "The same total can contain different ratios."}`;
  const f = betweenFoot(state.between);
  get("rh-between-result").textContent =
    `Selected up:down ${f.upDown}; whole ${f.total} times = ${f.total * 300} ms. ${f.id === "middle" ? "The exact midpoint is our illustrative choice. It is not an automatic classification of every intermediate ratio." : "This is one of the two endpoints used in the source’s comparison."}`;
  draw();
}
function update(next: RhythmState, scope?: "main" | "between") {
  if (scope === "between") next = { ...next, sound: "between" };
  else if (scope === "main" && next.sound === "between") next = { ...next, sound: "compare" };
  const valid = parseRhythm(next);
  stop("Sound stopped because the comparison changed.");
  state = valid;
  history.replaceState(null, "", `${location.pathname}${rhythmQuery(state)}${location.hash}`);
  render();
}
async function play(kind: RhythmListening) {
  update({ ...state, sound: kind });
  const id = revision,
    plan = rhythmPlan(state, kind);
  get<HTMLButtonElement>("rh-stop").disabled = false;
  get("rh-play-state").textContent =
    `Playing: ${RHYTHM_SOUND_NAMES[kind]}. Marker pitches are modern teaching signals.`;
  try {
    await player.play(
      plan,
      (tone: Tone | null) => {
        clearMarkers();
        if (!tone) return;
        const t = tone as RhythmTone,
          root = kind === "between" ? "rh-between-drawing" : "rh-drawing";
        if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
          get(root)
            .querySelector(`[data-rh-row="${t.row}"] [data-unit="${t.unit}"]`)
            ?.classList.add("rh-sounding");
        get("rh-position").textContent =
          `${kind === "between" ? "Intermediate example" : t.row === 0 ? "Reference" : "Your foot"}: ${t.kind} marker.`;
      },
      () => {
        if (id !== revision) return;
        clearMarkers();
        get<HTMLButtonElement>("rh-stop").disabled = true;
        get("rh-play-state").textContent =
          "Finished. Change the division or smaller attacks and compare again.";
      },
    );
  } catch {
    if (id === revision)
      stop(
        "Audio could not start. Try a listening button again, or save the WAV for another player.",
      );
  }
}
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-rh-case]"))
  button.addEventListener("click", () => {
    const n = Number(button.dataset.rhCase);
    update({ ...state, total: n, up: n === 7 ? 3 : 2, sound: "compare" }, "main");
  });
total.addEventListener("change", () => {
  const n = Number(total.value);
  update({ ...state, total: n, up: Math.min(state.up, n - 1) }, "main");
});
up.addEventListener("change", () => update({ ...state, up: Number(up.value) }, "main"));
unit.addEventListener("input", () => update({ ...state, unitMs: Number(unit.value) }, "main"));
texture.addEventListener("change", () =>
  update({ ...state, texture: texture.value as RhythmState["texture"] }, "main"),
);
get("rh-reverse").addEventListener("click", () =>
  update({ ...state, up: state.total - state.up }, "main"),
);
between.addEventListener("change", () =>
  update({ ...state, between: between.value as RhythmState["between"] }, "between"),
);
sound.addEventListener("change", () => update({ ...state, sound: sound.value as RhythmListening }));
for (const kind of ["chosen", "compare", "between"] as const)
  get(`rh-play-${kind}`).addEventListener("click", () => {
    void play(kind);
  });
get("rh-stop").addEventListener("click", () => stop());
function showPage() {
  const p = page.value,
    img = get<HTMLImageElement>("rh-scan");
  img.src = `${import.meta.env.BASE_URL}sources/rhythm/westphal-${p}.jpg`;
  img.alt = `Westphal 1861, full ${p === "title" ? "title page" : `printed page ${p}`}`;
  img.style.width = `${zoom * 100}%`;
  get<HTMLAnchorElement>("rh-scan-link").href = img.src;
  get("rh-source-caption").textContent =
    p === "title"
      ? "Rudolf Westphal, Leipzig: B. G. Teubner, 1861. Full title page."
      : `Westphal 1861, printed p.${p}. Main Aristoxenus text above the apparatus; separately printed parallels remain visible. Open or zoom the full image to inspect it.`;
}
function showPassage() {
  const p = RHYTHM_PASSAGES[passageIndex];
  if (!p) return;
  passage.value = String(passageIndex);
  get("rh-passage-text").innerHTML =
    `<h3>${rhEscape(p.title)}</h3><p class="rh-reference">Printed p.${p.page}, lines ${p.lines}.</p><p lang="grc">${rhEscape(p.greek)}</p><p class="rh-translation">${rhEscape(p.english)}</p><p class="rh-note">${rhEscape(p.note)}</p>${p.latin ? `<h4>Latin parallel in the apparatus</h4><p lang="la">${rhEscape(p.latin)}</p><p>${rhEscape(p.latinEnglish ?? "")}</p><p class="rh-note">${rhEscape(p.latinNote ?? "")}</p>` : ""}<div class="rh-words" aria-label="Words in this passage">${p.words.map((key) => `<button type="button" lang="grc" data-rh-word="${rhEscape(key)}" aria-expanded="false" aria-controls="rh-word-note">${rhEscape(key)}</button>`).join("")}</div><div id="rh-word-note" hidden></div>`;
  page.value = String(p.page);
  showPage();
}
passage.addEventListener("change", () => {
  stop();
  passageIndex = Number(passage.value);
  showPassage();
});
page.addEventListener("change", showPage);
get<HTMLSelectElement>("rh-zoom").addEventListener("change", (e) => {
  zoom = Number((e.target as HTMLSelectElement).value);
  get<HTMLImageElement>("rh-scan").style.width = `${zoom * 100}%`;
});
get("rh-passage-text").addEventListener("click", (e) => {
  const button = (e.target as Element).closest<HTMLButtonElement>("button[data-rh-word]");
  if (!button) return;
  const key = button.dataset.rhWord ?? "",
    word = RHYTHM_WORDS[key];
  if (!word) return;
  const opened = button.getAttribute("aria-expanded") === "true";
  for (const b of get("rh-passage-text").querySelectorAll("button[data-rh-word]"))
    b.setAttribute("aria-expanded", "false");
  get("rh-word-note").hidden = opened;
  if (!opened) {
    button.setAttribute("aria-expanded", "true");
    get("rh-word-note").innerHTML =
      `<p><strong lang="grc">${rhEscape(key)}</strong> (${rhEscape(word.roman)}): ${rhEscape(word.meaning)}.</p><p>${rhEscape(word.note)}</p>`;
  }
});
function save(name: string, body: string | Blob, type = "text/plain") {
  const blob = body instanceof Blob ? body : new Blob([body], { type });
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
get("rh-save-json").addEventListener("click", () =>
  save("pyknon-rhythm.json", rhythmJSON(state), "application/json"),
);
get("rh-save-svg").addEventListener("click", () =>
  save("pyknon-rhythm-score.svg", rhythmDrawing(state), "image/svg+xml"),
);
get("rh-save-csv").addEventListener("click", () =>
  save("pyknon-rhythm-onsets.csv", rhythmOnsetsCsv(state, state.sound), "text/csv;charset=utf-8"),
);
for (const kind of ["reading", "wav"] as const)
  get(`rh-save-${kind}`).addEventListener("click", async () => {
    const captured = { ...state },
      button = get<HTMLButtonElement>(`rh-save-${kind}`);
    button.disabled = true;
    get("rh-save-status").textContent =
      kind === "reading"
        ? "Rendering the selected sound and verifying every source image and the Greek font…"
        : "Rendering the selected sound…";
    try {
      const audio = await renderWav(rhythmPlan(captured, captured.sound));
      if (kind === "reading")
        save(
          "pyknon-rhythm-reading.html",
          await rhythmStudy(captured, audio),
          "text/html;charset=utf-8",
        );
      else save("pyknon-rhythm.wav", audio);
      get("rh-save-status").textContent =
        `Saved ${kind === "reading" ? "the complete reading" : "the WAV"} with the settings at your Save click. Selected sound: ${RHYTHM_SOUND_NAMES[captured.sound]}.`;
    } catch (e) {
      get("rh-save-status").textContent =
        e instanceof Error
          ? e.message
          : "The file could not be saved. Try again with the complete edition available.";
    } finally {
      button.disabled = false;
    }
  });
get<HTMLInputElement>("rh-import").addEventListener("change", async (e) => {
  const input = e.target as HTMLInputElement,
    file = input.files?.[0];
  if (!file) return;
  try {
    if (file.size > 65536) throw new Error("The rhythm file must be under 64 KB.");
    const next = rhythmImport(await file.text());
    update(next);
    get("rh-save-status").textContent =
      "Reopened the comparison, including its unit, smaller attacks, intermediate example and selected sound.";
  } catch (e) {
    get("rh-save-status").textContent =
      `The current comparison was kept. ${e instanceof Error ? e.message : "Could not read that file."}`;
  } finally {
    input.value = "";
  }
});
get("rh-share").addEventListener("click", async () => {
  const link = `${location.origin}${location.pathname}${rhythmQuery(state)}#rhythm`;
  try {
    await navigator.clipboard.writeText(link);
    get("rh-save-status").textContent = "Copied the comparison link.";
  } catch {
    get("rh-save-status").replaceChildren(document.createTextNode("Copy the comparison link: "));
    const input = document.createElement("input");
    input.type = "text";
    input.value = link;
    input.setAttribute("aria-label", "Comparison link");
    get("rh-save-status").append(input);
    input.focus();
    input.select();
  }
});
for (const a of document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'))
  a.addEventListener("click", () => stop());
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stop();
});
window.addEventListener("pagehide", () => stop());
window.addEventListener("popstate", () => {
  const restored = rhythmFromQuery(location.search);
  update(restored.state);
});
new ResizeObserver(draw).observe(get("rh-drawing"));
render();
showPassage();
if (initial.notice) {
  get("rh-notice").textContent = initial.notice;
  get("rh-notice").hidden = false;
}
void offline(get("offline-status"));
