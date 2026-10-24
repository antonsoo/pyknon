import { Player, renderWav } from "./audio";
import {
  CANON_ARCHIVE,
  CANON_PAGES,
  CANON_PASSAGE,
  CANON_WORDS,
  SOUND_LABELS,
} from "./canon-content";
import { canonDetail, canonRoute } from "./canon-drawing";
import { canonStudy } from "./canon-study";
import {
  type CanonState,
  canonCsv,
  canonPlan,
  canonQuery,
  canonState,
  canonSteps,
  LETTERS,
} from "./core/canon";
import { at, type Tone } from "./core/tetrachord";
import { offline } from "./offline";

function get<T extends HTMLElement = HTMLElement>(selector: string): T {
  const el = document.querySelector<T>(selector);
  if (!el) throw new Error(`Missing ${selector}`);
  return el;
}
let state = canonState(location.search);
const player = new Player();
get("#app").innerHTML = `
<a href="#canon" class="skip">Skip to the octave experiment</a>
<header class="site-header"><a href="./" class="brand" aria-label="Pyknon home">PYKNON<span lang="grc">πυκνόν</span></a><nav aria-label="Main"><a href="./#listen">Tetrachords</a><a href="./song.html">Read a song</a><a href="#canon" aria-current="page">Six tones</a><a href="./trial.html">String trial</a><a href="https://github.com/antonsoo/pyknon">Code ↗</a></nav></header>
<main><section class="intro canon-intro" aria-labelledby="intro-title"><div><p class="eyebrow">ANCIENT GREEK MUSIC / A NUMERICAL PROOF</p><h1 id="intro-title">Six whole tones.<br>An octave.<br>A small disagreement.</h1></div><div class="intro-copy"><p>A modern piano can climb six whole tones and reach an octave. The <i>Sectio canonis</i>, transmitted under Euclid’s name, proves that six tones are <strong>too much</strong>.</p><p class="quiet">The word “tone” hides a choice. Keep the ancient 9:8 ratio, follow seven printed numbers, and hear why the two routes part company.</p><a href="#canon" class="text-link">Hear the disagreement ↓</a></div></section>
<section id="canon" class="workbench canon-workbench" aria-labelledby="canon-title"><div class="section-heading"><div><p class="eyebrow">01 / KEEP THE INTERVAL, OR CLOSE THE OCTAVE</p><h2 id="canon-title" tabindex="-1">One step makes a difference.</h2></div><p class="section-aside"><i>Sectio canonis</i> IX &amp; XIV<br>9:8 tones / equal octave divisions</p></div>
<div class="canon-controls"><div><p class="step-label">Select a step · zero is the starting note</p><div class="step-buttons" role="group" aria-label="Number of intervals">${LETTERS.map((letter, n) => `<button type="button" data-step="${n}" aria-pressed="false" aria-label="Step ${n}, source letter ${letter}">${n}</button>`).join("")}</div></div><label>Modern starting reference<select id="root"><option value="110">A2 · 110 Hz</option><option value="220">A3 · 220 Hz</option><option value="440">A4 · 440 Hz</option></select></label></div>
<div class="canon-transport"><label class="sound-choice">Sound<select id="sound">${Object.entries(
  SOUND_LABELS,
)
  .map(([id, label]) => `<option value="${id}">${label}</option>`)
  .join(
    "",
  )}</select></label><button type="button" id="play" class="primary">▶ Play</button><button type="button" id="stop" disabled>■ Stop</button></div><p class="canon-status" id="play-status" role="status">Ready. Simple sine tones; start at a comfortable volume.</p>
<figure class="canon-route"><div id="route-wide" class="route-wide"></div><div id="route-phone" class="route-phone"></div><figcaption><span>● 9:8 tones &nbsp; ○ Six equal divisions of an octave</span><span>Shared pitch scale · 1200 cents = one octave</span></figcaption></figure>
<div class="canon-readout"><div class="canon-detail"><p>SELECTED PAIR / ENLARGED SCALE</p><div id="detail"></div></div><div><dl class="pair-values"><div><dt id="ratio-label">9:8 route</dt><dd id="ratio-hz"></dd></div><div><dt id="equal-label">Equal-step route</dt><dd id="equal-hz"></dd></div></dl><p id="beat-reading" class="beat-reading"></p></div></div>
<p class="canon-boundary">The equal-step route uses 200 cents per step, with ratio 2^(1/6). It changes the premise: a 9:8 tone is about 203.91 cents. The same-frequency control uses two identical tones so the number of oscillators stays the same.</p></section>
<section id="numbers" class="canon-section" aria-labelledby="numbers-title"><div class="section-heading"><div><p class="eyebrow">02 / READ THE ARITHMETIC</p><h2 id="numbers-title">Seven numbers. Six multiplications.</h2></div><p class="section-aside">Proposition IX<br>Menge, printed pp. 170–171</p></div><div class="proof-layout"><div><div class="table-scroll" role="region" aria-label="Source integer progression" tabindex="0"><table class="integer-table"><caption>The printed progression, with modern step counts</caption><thead><tr><th>Step</th><th>Letter</th><th>Source integer</th><th>Ratio to Α</th></tr></thead><tbody>${canonSteps(
  state.root,
)
  .map(
    (v) =>
      `<tr data-row="${v.step}"><th><button type="button" data-step="${v.step}" aria-label="Inspect source row ${v.letter}, step ${v.step}" aria-pressed="false">${v.step}</button></th><td lang="grc">${v.letter}</td><td>${v.source}</td><td>${v.ratio.join("/")}</td></tr>`,
  )
  .join(
    "",
  )}</tbody></table></div><p class="quiet">Α–Η label numbers in a ratio proof. Here they become proportional frequencies; they are not presented as measured string lengths.</p></div><article class="integer-working"><h3 id="integer-title"></h3><div id="integer-working"></div><div class="integer-proof"><p><strong>Η exceeds twice Α.</strong></p><p class="integer-equation">531441 &gt; 524288</p><p>Twice 262144 is 524288. The excess is <strong>7153</strong>. No rounded cents or listening judgment is needed for the inequality.</p></div><button type="button" id="inspect-number">Inspect the printed numbers ↓</button></article></div>
<details class="canon-notes"><summary>What is the small excess called?</summary><p>Relative to the octave, the excess has ratio <strong>531441/524288</strong>, about 23.46 cents. It is commonly called the <strong>Pythagorean comma</strong>. At a 220 Hz starting reference the final pair is 440 Hz and about 446.003 Hz: together, the generated signal has about 6.003 amplitude beats per second.</p><p>Modern algebra connects the same excess to twelve 3:2 fifths compared with seven octaves: (3/2)^12 ÷ 2^7 = 531441/524288. This connection is added here; proposition IX itself uses six 9:8 intervals. It is different from the 81/80 <i>syntonic</i> comma.</p><p>The two equal-step tones in the control have identical frequency, envelope and starting phase. They have no frequency-difference beating. Changing the starting reference changes the beat rate in hertz, while the interval in cents stays the same.</p></details></section>
<section id="reading" class="canon-section" aria-labelledby="reading-title"><div class="section-heading"><div><p class="eyebrow">03 / THE WORDS OF THE PROOF</p><h2 id="reading-title" tabindex="-1">“Smaller than six tones.”</h2></div><p class="section-aside">Greek text / Menge’s Latin<br>A new English translation</p></div><p>The <i>Sectio canonis</i> is transmitted under Euclid’s name; its authorship is not settled here. Proposition XIV joins the musical premises in XII and XIII to the numerical proof in IX. Read the complete short argument in four parts.</p><div class="canon-reading"><article class="canon-passage"><div class="passage-tabs" role="group" aria-label="Proposition XIV reading steps">${CANON_PASSAGE.map((_p, i) => `<button type="button" data-passage="${i}" aria-pressed="false">${i + 1} · ${["Claim", "Ratios", "Numbers", "Therefore"][i]}</button>`).join("")}</div><div id="passage"></div></article><figure class="canon-source-view"><label>Complete printed page<select id="source-page">${CANON_PAGES.map((p) => `<option value="${p}">${p} · ${p % 2 ? "Latin" : "Greek"}</option>`).join("")}</select></label><a id="source-link" href="./sources/canon/menge-174.jpg"><img id="source-image" src="./sources/canon/menge-174.jpg" width="1122" height="1800" alt="" loading="lazy"></a><figcaption>Heinrich Menge, <i>Euclidis opera omnia</i> VIII (1916). Select the image to open the full scan and zoom. XII is on 172–173; XIII and XIV on 174–175; IX on 170–171.</figcaption></figure></div>
<div class="canon-vocabulary"><h3>Four words carrying the argument</h3><div class="word-layout"><div class="word-tabs" role="group" aria-label="Vocabulary from the proof">${CANON_WORDS.map((w, i) => `<button type="button" data-word="${i}" aria-pressed="false"><span lang="grc">${w.greek}</span><span>${w.english}</span></button>`).join("")}</div><article id="word-detail" aria-live="polite"></article></div></div>
<details class="scan canon-packet"><summary>Inspect all six source pages <span>Complete Greek and Latin pages, saved offline</span></summary><p>The 1916 edition is public domain. Greek uses normalized Unicode and joined line breaks; the bracketed [ἐστι] remains bracketed. The Latin is Menge’s translation. Our English notes and translations are new. <a href="${CANON_ARCHIVE}">Open the complete edition ↗</a>.</p><div class="scan-grid">${CANON_PAGES.map((p) => `<figure><a href="./sources/canon/menge-${p}.jpg"><img loading="lazy" src="./sources/canon/menge-${p}.jpg" width="1122" height="1800" alt="Menge 1916, complete printed page ${p}, ${p % 2 ? "Latin translation" : "Greek text"}"></a><figcaption>Printed p. ${p} · ${p % 2 ? "Latin" : "Greek"}</figcaption></figure>`).join("")}</div></details>
<div class="canon-downloads"><div class="save-row"><button type="button" id="share">Copy reading link</button><button type="button" id="wav">Save selected sound · WAV</button><button type="button" id="csv">Save numbers · CSV</button><button type="button" id="study">Save illustrated reading · HTML</button></div><p id="save-status" role="status"></p><p>The HTML includes all six scans and the Greek font. It opens and prints offline. WAV saves the selected step, reference and sound, without reconstructing an ancient instrument.</p></div></section>
<div class="canon-connections"><a href="./#listen">Hear Archytas’s different tetrachord divisions →</a><a href="./song.html">Read a surviving song in stone →</a></div></main>
<footer><p><strong>PYKNON</strong> · Six tones and an octave.</p><p id="offline-status">Checking offline availability…</p><p><a href="https://github.com/antonsoo/pyknon">Open source / MIT</a> · <a href="https://github.com/antonsoo/pyknon/blob/main/THIRD_PARTY.md">Sources &amp; credits</a></p></footer>`;

function mark(tone: Tone | null) {
  document.querySelectorAll<SVGElement>("[data-note]").forEach((el) => {
    el.classList.toggle(
      "sounding",
      tone !== null &&
        (state.sound === "beat" || state.sound === "control"
          ? el.dataset.step === String(state.step)
          : el.dataset.note === `${tone.tuning}-${tone.note}`),
    );
  });
  if (tone)
    get("#play-status").textContent =
      state.sound === "beat" || state.sound === "control"
        ? `${SOUND_LABELS[state.sound]} · step ${state.step}`
        : `${tone.tuning === "ratios" ? "9:8 route" : "Equal-step route"} · step ${tone.note} · ${tone.hz.toFixed(3)} Hz`;
}
function stop(message = "Stopped.") {
  player.stop();
  mark(null);
  get<HTMLButtonElement>("#stop").disabled = true;
  get("#play-status").textContent = message;
}
function update(push = true) {
  stop("Ready. Simple sine tones; start at a comfortable volume.");
  const values = canonSteps(state.root),
    v = at(values, state.step);
  document.querySelectorAll<HTMLButtonElement>("button[data-step]").forEach((b) => {
    b.setAttribute("aria-pressed", String(Number(b.dataset.step) === state.step));
  });
  document.querySelectorAll("[data-row]").forEach((row) => {
    row.classList.toggle("selected", Number(row.getAttribute("data-row")) === state.step);
  });
  get<HTMLSelectElement>("#root").value = String(state.root);
  get<HTMLSelectElement>("#sound").value = state.sound;
  get("#route-wide").innerHTML = canonRoute(state);
  get("#route-phone").innerHTML = canonRoute(state, true);
  get("#detail").innerHTML = canonDetail(state);
  get("#ratio-hz").textContent = `${v.ratioHz.toFixed(3)} Hz`;
  get("#equal-hz").textContent = `${v.equalHz.toFixed(3)} Hz`;
  get("#beat-reading").textContent =
    `${v.differenceCents.toFixed(3)} cents apart. ${v.beatHz.toFixed(3)} amplitude beats per second when these two generated tones sound together.${state.step === 0 ? " The starting notes coincide." : ""}`;
  get("#integer-title").textContent = `Step ${state.step} · ${v.letter} = ${v.source}`;
  const prev = values[state.step - 1];
  get("#integer-working").innerHTML = prev
    ? `<p>Add one eighth of the preceding number:</p><p class="integer-equation">${prev.source} + ${prev.source / 8}<br>= ${v.source}</p><p>${prev.source} × 9/8 = ${v.source}. From Α, the cumulative ratio is <strong>${v.ratio.join("/")}</strong>.</p>`
    : `<p>Α starts the progression at 262144, which is 8^6. This choice lets six successive multiplications by 9/8 remain whole numbers.</p><p class="integer-equation">262144 × 1 = 262144</p><p>There are seven numbers but six intervals. Both audible routes start here.</p>`;
  document.querySelectorAll<HTMLButtonElement>("[data-passage]").forEach((b) => {
    b.setAttribute("aria-pressed", String(Number(b.dataset.passage) === state.passage));
  });
  const p = at(CANON_PASSAGE, state.passage);
  get("#passage").innerHTML =
    `<h3>${p.label}</h3><p class="greek-line" lang="grc">${p.greek}</p><p class="latin-line" lang="la">${p.latin}</p><p class="english-line">${p.english}</p><p class="reading-note">${p.note}</p>`;
  get<HTMLSelectElement>("#source-page").value = String(state.page);
  const source = `./sources/canon/menge-${state.page}.jpg`;
  get<HTMLImageElement>("#source-image").src = source;
  get<HTMLImageElement>("#source-image").alt =
    `Menge 1916, complete printed page ${state.page}, ${state.page % 2 ? "Latin translation" : "Greek text"}`;
  get<HTMLAnchorElement>("#source-link").href = source;
  if (push) {
    history.replaceState(null, "", `${location.pathname}${canonQuery(state)}${location.hash}`);
    get("#save-status").textContent = "";
  }
}
function word(index: number) {
  const w = at(CANON_WORDS, index);
  document.querySelectorAll<HTMLButtonElement>("[data-word]").forEach((b) => {
    b.setAttribute("aria-pressed", String(Number(b.dataset.word) === index));
  });
  get("#word-detail").innerHTML =
    `<p class="word-title"><span lang="grc">${w.greek}</span> <span>${w.roman}</span></p><h3>${w.english}</h3><p lang="la">${w.latin}</p><p>${w.note}</p><p class="source-caption">Forms occur in the printed argument; Latin and Greek dictionary forms may have different endings. Romanization is a reading aid, not a pronunciation recording.</p>`;
}
document.addEventListener("click", (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>("button");
  if (!button) return;
  if (button.dataset.step !== undefined) {
    state.step = Number(button.dataset.step);
    update();
  }
  if (button.dataset.passage !== undefined) {
    state.passage = Number(button.dataset.passage);
    update();
  }
  if (button.dataset.word !== undefined) word(Number(button.dataset.word));
});
for (const id of ["root", "sound", "source-page"])
  get(`#${id}`).addEventListener("change", () => {
    state = canonState(
      `?n=${state.step}&a=${get<HTMLSelectElement>("#root").value}&sound=${get<HTMLSelectElement>("#sound").value}&p=${state.passage}&page=${get<HTMLSelectElement>("#source-page").value}`,
    );
    update();
  });
get("#inspect-number").addEventListener("click", () => {
  state.page = 171;
  update();
  location.hash = "reading";
  get("#reading-title").focus({ preventScroll: true });
  get("#reading").scrollIntoView({ block: "start" });
});
get("#play").addEventListener("click", async () => {
  get<HTMLButtonElement>("#stop").disabled = false;
  get("#play-status").textContent = "Starting audio…";
  try {
    await player.play(canonPlan(state), mark, () => {
      get<HTMLButtonElement>("#stop").disabled = true;
      get("#play-status").textContent = "Finished. Change a step or try another sound.";
    });
  } catch {
    stop("Audio could not start. The diagram and arithmetic remain available.");
  }
});
get("#stop").addEventListener("click", () => stop());
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stop("Paused when the page was hidden. Press play to listen again.");
});
window.addEventListener("pagehide", () => stop());
window.addEventListener("popstate", () => {
  state = canonState(location.search);
  update(false);
});
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
get("#csv").addEventListener("click", () => {
  download(
    new Blob([canonCsv(state)], { type: "text/csv;charset=utf-8" }),
    `pyknon-canon-${state.root}-step-${state.step}.csv`,
  );
  get("#save-status").textContent =
    "Saved all seven source integers and both frequency routes; the selected row is identified.";
});
for (const id of ["wav", "study"])
  get(id === "wav" ? "#wav" : "#study").addEventListener("click", async () => {
    const selected: CanonState = { ...state },
      button = get<HTMLButtonElement>(`#${id}`);
    button.disabled = true;
    get("#save-status").textContent =
      id === "wav" ? "Rendering the selected sound…" : "Embedding the source pages and Greek font…";
    try {
      const blob =
        id === "wav"
          ? await renderWav(canonPlan(selected))
          : new Blob([await canonStudy(selected)], { type: "text/html;charset=utf-8" });
      download(
        blob,
        `pyknon-canon-${selected.root}-step-${selected.step}-${selected.sound}.${id === "wav" ? "wav" : "html"}`,
      );
      get("#save-status").textContent =
        id === "wav"
          ? `Saved step ${selected.step}, ${selected.root} Hz: ${SOUND_LABELS[selected.sound]}.`
          : `Saved step ${selected.step}, ${selected.root} Hz, all four reading steps and six complete source pages. Open or print the HTML offline.`;
    } catch {
      get("#save-status").textContent =
        "The export could not finish. Try again when the complete edition is available.";
    } finally {
      button.disabled = false;
    }
  });
get("#share").addEventListener("click", async () => {
  const url = `${location.origin}${location.pathname}${canonQuery(state)}#canon`;
  try {
    await navigator.clipboard.writeText(url);
    get("#save-status").textContent =
      "Copied the step, reference, sound, reading sentence and source page.";
  } catch {
    get("#save-status").textContent = `Copy this reading link: ${url}`;
  }
});
update(false);
word(2);
void offline(get("#offline-status"));
