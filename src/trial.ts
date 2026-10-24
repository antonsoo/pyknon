import "./style.css";
import "./trial.css";
import { Player, renderWav } from "./audio";
import { at, type Tone } from "./core/tetrachord";
import {
  STRING_NAMES,
  STRINGS,
  TRIAL_SOUNDS,
  TRIAL_TESTS,
  type TrialState,
  trialCsv,
  trialPlan,
  trialQuery,
  trialResult,
  trialState,
} from "./core/trial";
import { offline } from "./offline";
import { TRIAL_ARCHIVE, TRIAL_PAGES, TRIAL_PASSAGES, TRIAL_QUESTIONS } from "./trial-content";
import { trialDrawing, trialSvg, trialTable } from "./trial-drawing";
import { trialStudy } from "./trial-study";

const get = <T extends Element = HTMLElement>(s: string): T => {
  const el = document.querySelector<T>(s);
  if (!el) throw new Error(`Missing ${s}`);
  return el;
};
let parsed = trialState(location.search),
  state: TrialState = parsed.state;
const player = new Player();
let question = 0,
  exportBusy = false;
const soundNames = {
  compare: "A, then B",
  together: "A & B together",
  control: "Control: A twice together",
};

get("#app").innerHTML = `<a class="skip" href="#trial">Skip to the string trial</a>
<header class="site-header"><a href="./" class="brand">PYKNON<span lang="grc">πυκνόν</span></a><nav aria-label="Main"><a href="./#listen">Tetrachords</a><a href="./song.html">Read a song</a><a href="./canon.html">Six tones</a><a href="#trial" aria-current="page">String trial</a><a href="./rhythm.html">Rhythm</a></nav></header>
<main class="tr-main"><section class="tr-intro"><div><p class="eyebrow">PTOLEMY / HARMONICS I.8</p><h1>Equal lengths.<br>Unequal notes.</h1></div><div><p>Before trusting a musical ruler, test its string. Ptolemy compares two equal halves, then two equal quarters. What if the first test passes—and the next fails?</p><a class="text-link" href="#trial">Put the string on trial ↓</a><p class="source-caption">An ancient instrument check, explored with a modern string model. Greek, Latin and new English readings follow the experiment.</p></div></section>
<p id="tr-notice" class="tr-notice" role="status" hidden></p>
<section id="trial" class="tr-section" aria-labelledby="tr-title"><div class="section-heading"><div><p class="eyebrow">01 / LISTEN BEFORE YOU TRUST</p><h2 id="tr-title">One string. Two equal pieces.</h2></div><p class="section-aside">Length held equal.<br>Tension held fixed.</p></div>
<div class="tr-path" role="group" aria-label="Guided experiments"><button type="button" data-experiment="first">1 · A convincing first test</button><button type="button" data-experiment="second">2 · Check the quarters</button><button type="button" data-experiment="hidden">3 · Can both tests miss?</button></div>
<div class="tr-bench"><div class="tr-object"><figure class="tr-machine"><div id="tr-drawing"></div><figcaption id="tr-caption"></figcaption></figure><div class="tr-segments" aria-label="Selected segment frequencies"><p><span class="tr-a-label">A</span><span id="tr-a-name"></span><strong id="tr-a-hz"></strong></p><p><span class="tr-b-label">B</span><span id="tr-b-name"></span><strong id="tr-b-hz"></strong></p></div></div>
<div class="tr-controls"><label>Chosen mass profile<select id="tr-string">${STRINGS.map((k) => `<option value="${k}">${STRING_NAMES[k]}</option>`).join("")}</select></label><label for="tr-density">Heavy cells: <output id="tr-density-output"></output> × reference mass per length</label><input id="tr-density" type="range" min="1" max="4" step="0.25" value="2.25" aria-describedby="tr-density-note"><p id="tr-density-note" class="source-caption">Eight invented cells make variation visible. The bar height shows mass per length, not string diameter.</p>
<fieldset class="tr-tests"><legend>Which equal lengths?</legend>${TRIAL_TESTS.map((t, i) => `<label><input type="radio" name="tr-test" value="${i}"><span>${i + 1} · ${t.name}<small>${t.source ? "Ptolemy’s comparison" : "Our added diagnostic"}</small></span></label>`).join("")}</fieldset>
<label>Modern reference<select id="tr-root"><option value="110">Uniform whole string = 110 Hz</option><option value="220">Uniform whole string = 220 Hz</option></select></label><label>Selected sound<select id="tr-sound">${TRIAL_SOUNDS.map((s) => `<option value="${s}">${soundNames[s]}</option>`).join("")}</select></label><div class="tr-play"><button type="button" id="tr-play">Hear selected pair</button><button type="button" id="tr-stop" disabled>Stop</button></div><p id="tr-play-status" role="status">Ready.</p><p class="source-caption">Finite sine tones at the calculated fundamentals. No recovered instrument sound or ancient absolute pitch is claimed.</p></div>
<div class="tr-result" aria-live="polite"><h3 id="tr-verdict"></h3><p id="tr-difference"></p><p id="tr-implication"></p></div></div>
<details class="tr-working"><summary>Compare all three tests & follow the physics</summary><div id="tr-table" class="table-scroll" tabindex="0" role="region" aria-label="Comparison measurements"></div><p>The uniform-string rule is <strong>frequency = (1 / 2 length) × √(tension / mass per length)</strong>. For a string whose mass changes within a segment, averaging the mass is insufficient. This model solves the fixed-end wave equation through every cell.</p><p>Reflected mass profiles have the same frequencies. Repeating the same reflected pattern can hide variation from both ancient comparisons. Passing those tests establishes agreement at those divisions, rather than proving the whole string uniform.</p><p><a href="https://github.com/antonsoo/pyknon/blob/main/docs/trial-model.md">Derivation, source decisions and model limits ↗</a>. The displayed mode is a stationary first-mode shape with arbitrary amplitude, not a pluck animation. Supports do not alter tension in this model.</p></details></section>
<section id="trial-reading" class="tr-section" aria-labelledby="tr-reading-title"><div class="section-heading"><div><p class="eyebrow">02 / READ THE EXAMINATION</p><h2 id="tr-reading-title">“Transfer the trial.”</h2></div><p class="section-aside">Ptolemy’s Greek / Wallis’s Latin<br>New English translations & word notes</p></div><p>These six selected phrases come from the instrument examination in <i>Harmonics</i> I.8, in John Wallis’s 1682 edition. They are excerpts, not a continuous chapter translation. Latin is Wallis’s early modern translation. The full pages retain the surrounding argument and editorial notes.</p>
<div class="tr-reading"><article><label>Phrase from the examination<select id="tr-passage">${TRIAL_PASSAGES.map((p, i) => `<option value="${i}">${i + 1} · ${p.label}</option>`).join("")}</select></label><div id="tr-passage-text"></div><p class="tr-letter-note">Letters matter: Greek <strong lang="grc">Η</strong> is eta, represented by <strong>G</strong> in Wallis’s Latin diagram. Greek <span lang="grc">Λ</span> is Latin L. The instrument graphic here uses the Greek labels.</p><a id="tr-inspect" class="text-link" href="#tr-source">Inspect this phrase’s full printed page ↓</a></article>
<figure id="tr-source" class="tr-source"><div class="tr-source-tools"><label>Printed page<select id="tr-page">${TRIAL_PAGES.map((p) => `<option value="${p}">${p}${p === 35 ? " · instrument" : p === 37 ? " · examination" : ""}</option>`).join("")}</select></label><label>Source zoom<select id="tr-zoom"><option value="1">Fit width</option><option value="2">200%</option><option value="4">400%</option></select></label><a id="tr-original" href="./sources/trial/wallis-37.jpg">Open scan ↗</a></div><div id="tr-source-viewport" tabindex="0" role="region" aria-label="Printed source page; zoom then use arrow keys or scroll to inspect"><img id="tr-source-image" width="1316" height="1800" alt="" src="./sources/trial/wallis-37.jpg"></div><figcaption id="tr-source-caption"></figcaption></figure></div>
<details class="tr-source-context"><summary>What belongs to the source, and what is our experiment?</summary><p>Ptolemy asks for like, corresponding parts of equal length under one tension, and checks that they agree in pitch. If the test fails, he changes the tested part or string. He then uses the divided canon to investigate concords.</p><p>The stepwise mass profiles, the repeating counterexample, eighths test, modern frequencies, wave equation and sine sounds are additions here. They do not describe measurements made on a surviving ancient string. They illustrate both the use and the limits of this particular instrument check.</p><p>Wallis discusses the bridge surfaces and changes the drawing on p. 36. His printed diagram is editorial evidence, not an ancient blueprint. <a href="${TRIAL_ARCHIVE}">Read the complete edition ↗</a>.</p></details>
<form id="tr-question" class="tr-question"><p class="eyebrow">A READING CHECK / <span id="tr-question-count"></span></p><h3 id="tr-question-title"></h3><fieldset id="tr-answers"><legend class="sr-only">Choose an answer</legend></fieldset><button type="submit">Check reading</button><p id="tr-feedback" role="status"></p><button type="button" id="tr-next">Next question</button></form></section>
<section class="tr-section tr-keep" aria-labelledby="tr-keep-title"><div><p class="eyebrow">03 / KEEP THE EXAMINATION</p><h2 id="tr-keep-title">A source packet with a sound.</h2><p>Save your string, all three comparisons, all six readings, the six complete scans, Greek font, exact CSV and selected WAV in one HTML document. Open it from disk, listen, or print it.</p></div><div><div class="save-row"><button type="button" id="tr-save">Save illustrated reading · HTML</button><button type="button" id="tr-wav">Save selected sound · WAV</button><button type="button" id="tr-csv">Save measurements · CSV</button><button type="button" id="tr-svg">Save string diagram · SVG</button><button type="button" id="tr-share">Copy experiment link</button></div><label id="tr-share-box" hidden>Experiment link<input id="tr-share-url" type="url" readonly></label><p id="tr-save-status" role="status"></p></div></section>
<div class="tr-connections"><a href="./canon.html">Can six whole tones fill an octave? →</a><a href="./song.html">Read the Seikilos inscription →</a></div></main>
<footer><p><strong>PYKNON</strong> · The instrument must earn its ruler.</p><p id="offline-status">Checking offline availability…</p><p><a href="https://github.com/antonsoo/pyknon">Open source / MIT</a> · <a href="https://github.com/antonsoo/pyknon/blob/main/THIRD_PARTY.md">Sources & credits</a></p></footer>`;

function stop(message = "Stopped.") {
  player.stop();
  get<HTMLButtonElement>("#tr-stop").disabled = true;
  get("#tr-play-status").textContent = message;
  get("#tr-drawing").removeAttribute("data-sounding");
}
function update(push = true) {
  stop("Ready. Start at a comfortable volume.");
  const r = trialResult(state),
    p = at(TRIAL_PASSAGES, state.passage);
  get<HTMLSelectElement>("#tr-string").value = state.string;
  get<HTMLInputElement>("#tr-density").value = String(state.contrast);
  get<HTMLOutputElement>("#tr-density-output").value = state.contrast.toFixed(2);
  get<HTMLSelectElement>("#tr-root").value = String(state.root);
  get<HTMLSelectElement>("#tr-sound").value = state.sound;
  get<HTMLInputElement>(`input[name=tr-test][value="${state.test}"]`).checked = true;
  get("#tr-drawing").innerHTML = trialDrawing(state, matchMedia("(max-width: 600px)").matches);
  get("#tr-caption").textContent =
    state.test < 2
      ? "Ε–Η is the whole vibrating length. Κ bisects it; Λ bisects the right half. Triangles are active supports; short ticks are ruler marks. Tension stays fixed."
      : "The extra division at 7/8 is a modern diagnostic, beyond the two comparisons in the selected ancient text. Triangles mark the supports actually used.";
  get("#tr-a-name").textContent = `${r.spec.labels[0]} · length ${r.spec.a[1] - r.spec.a[0]}`;
  get("#tr-b-name").textContent = `${r.spec.labels[1]} · length ${r.spec.b[1] - r.spec.b[0]}`;
  get("#tr-a-hz").setAttribute("data-hz", String(r.aHz));
  get("#tr-b-hz").setAttribute("data-hz", String(r.bHz));
  get("#tr-a-hz").textContent = `${r.aHz.toFixed(3)} Hz`;
  get("#tr-b-hz").textContent = `${r.bHz.toFixed(3)} Hz`;
  get("#tr-verdict").textContent = r.same
    ? "Same pitch. What have we established?"
    : "Equal lengths. Different pitches.";
  get("#tr-difference").textContent = r.same
    ? "The two calculated fundamentals agree in this model."
    : `B is ${Math.abs(r.differenceCents).toFixed(3)} cents ${r.differenceCents > 0 ? "higher" : "lower"} than A. Their frequencies differ by ${r.differenceHz.toFixed(3)} Hz.`;
  get("#tr-implication").textContent =
    state.contrast === 1 || state.string === "uniform"
      ? "Every cell has the same mass per length. Equal lengths under equal tension agree at all three chosen divisions."
      : state.string === "outer"
        ? state.test === 0
          ? "The halves contain reflected mass patterns. They agree even though each is nonuniform. Continue to the right-hand quarters."
          : state.test === 1
            ? "The inner quarter is light; the outer quarter is heavy. The second comparison catches what the first missed."
            : "Both extra eighths lie inside the heavy outer quarter. Their agreement does not erase the failed quarter comparison."
        : state.string === "repeat"
          ? state.test < 2
            ? "This repeating profile passes both comparisons in Ptolemy’s examination. Try the additional eighths: agreement has not proved uniformity."
            : "The extra test reveals the repeating variation. The last two eighths have different mass per length, despite both earlier comparisons agreeing."
          : state.test === 0
            ? "The heavy left half sounds lower. This string fails the first comparison."
            : "These parts both lie in the light right half. Their agreement does not inspect the heavy left half.";
  get("#tr-table").innerHTML = trialTable(state);
  get<HTMLSelectElement>("#tr-passage").value = String(state.passage);
  get("#tr-passage-text").innerHTML =
    `<h3>${p.label}</h3><p class="tr-greek" lang="grc">${p.greek}</p><p class="tr-latin" lang="la">${p.latin}</p><p class="tr-english">${p.english}</p><p class="tr-word-note">${p.note}</p>`;
  get<HTMLSelectElement>("#tr-page").value = String(state.page);
  const url = `./sources/trial/wallis-${state.page}.jpg`;
  const image = get<HTMLImageElement>("#tr-source-image");
  if (!image.src.endsWith(`/wallis-${state.page}.jpg`)) image.src = url;
  image.alt = `Wallis 1682, complete printed page ${state.page}, Greek text and Latin translation of Ptolemy’s Harmonics I.8 with editorial apparatus`;
  get<HTMLAnchorElement>("#tr-original").href = url;
  get("#tr-source-caption").textContent =
    `Wallis, Oxford 1682 · printed p. ${state.page}, PDF p. ${state.page + 22}. Full public-domain page. Zoom and scroll to inspect the type and notes.`;
  if (push) history.pushState(null, "", `${location.pathname}${trialQuery(state)}${location.hash}`);
  get("#tr-save-status").textContent = "";
}
function showQuestion() {
  const q = at(TRIAL_QUESTIONS, question);
  get("#tr-question-count").textContent = `${question + 1} OF ${TRIAL_QUESTIONS.length}`;
  get("#tr-question-title").textContent = q.question;
  get("#tr-answers").innerHTML =
    `<legend class="sr-only">Choose an answer</legend>${q.answers.map((a, i) => `<label><input type="radio" name="tr-answer" value="${i}" required><span>${a}</span></label>`).join("")}`;
  get("#tr-feedback").textContent = "";
}
for (const id of ["tr-string", "tr-density", "tr-root", "tr-sound", "tr-passage", "tr-page"]) {
  get(`#${id}`).addEventListener(id === "tr-density" ? "input" : "change", () => {
    const q = new URLSearchParams(trialQuery(state));
    const mapping = {
      "tr-string": "string",
      "tr-density": "density",
      "tr-root": "a",
      "tr-sound": "sound",
      "tr-passage": "p",
      "tr-page": "page",
    };
    q.set(
      at(Object.entries(mapping).find(([k]) => k === id) ?? [], 1),
      get<HTMLInputElement>(`#${id}`).value,
    );
    state = trialState(q.toString()).state;
    if (id === "tr-passage") state.page = at(TRIAL_PASSAGES, state.passage).page;
    update();
  });
}
document.querySelectorAll<HTMLInputElement>('input[name="tr-test"]').forEach((e) => {
  e.addEventListener("change", () => {
    state.test = Number(e.value);
    update();
  });
});
document.querySelectorAll<HTMLButtonElement>("[data-experiment]").forEach((b) => {
  b.addEventListener("click", () => {
    state.string = b.dataset.experiment === "hidden" ? "repeat" : "outer";
    state.contrast = 2.25;
    state.test = b.dataset.experiment === "second" ? 1 : 0;
    update();
  });
});
get("#tr-play").addEventListener("click", async () => {
  stop("Starting sound…");
  get<HTMLButtonElement>("#tr-stop").disabled = false;
  try {
    await player.play(
      trialPlan(state),
      (tone: Tone | null) => {
        if (tone)
          get("#tr-drawing").setAttribute(
            "data-sounding",
            state.sound === "control"
              ? "0"
              : state.sound === "compare"
                ? String(tone.note)
                : "both",
          );
        else get("#tr-drawing").removeAttribute("data-sounding");
        get("#tr-play-status").textContent = tone
          ? state.sound === "compare"
            ? `${tone.note ? "B" : "A"} · ${tone.hz.toFixed(3)} Hz`
            : soundNames[state.sound]
          : "Between tones…";
      },
      () => stop("Finished."),
    );
  } catch {
    stop("Audio could not start. The diagrams and measurements remain available.");
  }
});
get("#tr-stop").addEventListener("click", () => stop());
get<HTMLSelectElement>("#tr-zoom").addEventListener("change", () => {
  get<HTMLImageElement>("#tr-source-image").style.width =
    `${Number(get<HTMLSelectElement>("#tr-zoom").value) * 100}%`;
});
get("#tr-inspect").addEventListener("click", (event) => {
  event.preventDefault();
  state.page = at(TRIAL_PASSAGES, state.passage).page;
  update();
  get("#tr-source").scrollIntoView({ block: "start" });
  history.replaceState(null, "", "#tr-source");
  get<HTMLElement>("#tr-source-viewport").focus({ preventScroll: true });
});
get("#tr-question").addEventListener("submit", (e) => {
  e.preventDefault();
  const a = get<HTMLInputElement>('input[name="tr-answer"]:checked'),
    q = at(TRIAL_QUESTIONS, question);
  get("#tr-feedback").textContent =
    `${Number(a.value) === q.correct ? "Yes." : "Try that distinction again."} ${q.why}`;
});
get("#tr-next").addEventListener("click", () => {
  question = (question + 1) % TRIAL_QUESTIONS.length;
  showQuestion();
  get<HTMLHeadingElement>("#tr-question-title").tabIndex = -1;
  get<HTMLElement>("#tr-question-title").focus({ preventScroll: true });
});
function download(bytes: BlobPart, name: string, type: string) {
  const url = URL.createObjectURL(bytes instanceof Blob ? bytes : new Blob([bytes], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
for (const kind of ["csv", "svg", "wav", "save"] as const)
  get(`#tr-${kind}`).addEventListener("click", async () => {
    if (exportBusy) return;
    const snapshot = { ...state };
    exportBusy = true;
    const button = get<HTMLButtonElement>(`#tr-${kind}`);
    button.disabled = true;
    get("#tr-save-status").textContent = "Preparing your selected experiment…";
    try {
      if (kind === "csv")
        download(trialCsv(snapshot), "pyknon-string-trial.csv", "text/csv;charset=utf-8");
      else if (kind === "svg")
        download(trialSvg(snapshot), "pyknon-string-trial.svg", "image/svg+xml");
      else {
        const wav = await renderWav(trialPlan(snapshot));
        if (kind === "wav") download(wav, "pyknon-string-trial.wav", "audio/wav");
        else
          download(
            await trialStudy(snapshot, wav),
            "pyknon-string-trial.html",
            "text/html;charset=utf-8",
          );
      }
      get("#tr-save-status").textContent =
        `Saved ${STRING_NAMES[snapshot.string]}, test ${snapshot.test + 1}.`;
    } catch {
      get("#tr-save-status").textContent =
        "The complete file could not be prepared. Check the connection and retry; source bytes must match this edition.";
    } finally {
      exportBusy = false;
      button.disabled = false;
    }
  });
get("#tr-share").addEventListener("click", async () => {
  const url = new URL(`trial.html${trialQuery(state)}#trial`, location.href).href;
  get<HTMLLabelElement>("#tr-share-box").hidden = false;
  get<HTMLInputElement>("#tr-share-url").value = url;
  try {
    await navigator.clipboard.writeText(url);
    get("#tr-save-status").textContent = "Experiment link copied.";
  } catch {
    get("#tr-save-status").textContent = "Copy the experiment link from the field.";
  }
});
addEventListener("popstate", () => {
  parsed = trialState(location.search);
  state = parsed.state;
  update(false);
});
matchMedia("(max-width: 600px)").addEventListener("change", () => {
  get("#tr-drawing").innerHTML = trialDrawing(state, matchMedia("(max-width: 600px)").matches);
});
addEventListener("pagehide", () => player.stop());
if (parsed.reset) {
  get<HTMLElement>("#tr-notice").hidden = false;
  get("#tr-notice").textContent =
    "Some shared settings were invalid and have been reset. Valid settings were kept.";
}
update(false);
showQuestion();
void offline(get("#offline-status"));
