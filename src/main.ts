import { at } from "./core/tetrachord";
import "./style.css";
import { Player, renderWav } from "./audio";
import { ARCHIVE, SOURCE_NUMBERS, WORDS } from "./content";
import {
  cents,
  GENERA,
  type GenusId,
  genus,
  hasPyknon,
  notes,
  plan,
  queryFor,
  readState,
  type Sound,
  type Tone,
} from "./core/tetrachord";
import { phoneRuler, ruler } from "./drawing";
import { study } from "./study";

let state = readState(location.search);
const player = new Player();
const app = get<HTMLDivElement>("#app");
app.innerHTML = `
<a href="#listen" class="skip">Skip to listening workbench</a>
<header class="site-header"><a href="#" class="brand" aria-label="Pyknon home">PYKNON<span lang="grc">πυκνόν</span></a><nav aria-label="Main"><a href="#listen">Listen</a><a href="#source">Read the source</a><a href="https://github.com/antonsoo/pyknon">Code ↗</a></nav></header>
<main>
<section class="intro" aria-labelledby="intro-title"><div><p class="eyebrow">ANCIENT GREEK MUSIC / A LISTENING EXPERIMENT</p><h1 id="intro-title">Two ancient notes.<br>One piano key.</h1></div><div class="intro-copy"><p>A tiny interval can carry a big idea. Hear the four-note divisions attributed to <strong>Archytas</strong>—then hear what happens when their pitches are rounded to modern keys.</p><p class="quiet">Four notes span a fourth. Three intervals separate them. Change one inner note and a different musical genus emerges.</p><a class="text-link" href="#listen">Start with the enharmonic ↓</a></div></section>
<section id="listen" class="workbench" aria-labelledby="listen-title"><div class="section-heading"><div><p class="eyebrow">01 / LISTEN CLOSELY</p><h2 id="listen-title" tabindex="-1">A fourth, closely heard.</h2></div><p class="section-aside">Archytas’s three divisions<br>reported by Ptolemy, <i>Harmonics</i> I.13</p></div>
<div class="genus-switch" role="group" aria-label="Tetrachord genus">${GENERA.map((g, i) => `<button type="button" data-genus="${g.id}" aria-pressed="false"><span class="genus-number">0${i + 1}</span><span><strong>${g.name}</strong><span lang="grc">${g.greek}</span></span><span class="chosen" aria-hidden="true">●</span></button>`).join("")}</div>
<div class="settings"><p id="genus-description"></p><div class="selects"><label>Starting pitch<select id="root"><option value="110">A2 · 110 Hz</option><option value="220">A3 · 220 Hz</option><option value="440">A4 · 440 Hz</option></select></label><label>Direction<select id="direction"><option value="up">Low → high</option><option value="down">High → low</option></select></label></div></div>
<figure class="ruler"><div id="diagram"></div><figcaption><span>Each numbered circle is a note. Lines connect it to the nearest modern key.</span><span>100 cents = one modern semitone.</span></figcaption></figure>
<div class="transport"><div class="play-buttons"><button class="primary" type="button" data-play="compare">▶ Compare both</button><button type="button" data-play="ratios">Hear ratios</button><button type="button" data-play="keyboard">Hear keys</button><button type="button" id="stop" disabled>■ Stop</button></div><p id="play-status" role="status" aria-live="polite">Ready. Simple tones; start at a comfortable volume.</p></div>
<div class="finding"><div><p class="eyebrow">WHAT TO LISTEN FOR</p><h3 id="finding-title"></h3><p id="finding-copy"></p></div><button type="button" data-play="close">Hear just notes 2 &amp; 3 →</button></div>
<details class="measurements"><summary>Follow the numbers <span>Ratios, frequencies &amp; rounding</span></summary><div class="table-scroll" tabindex="0" role="region" aria-label="Pitch measurements"><table><caption id="table-caption"></caption><thead><tr><th>Note</th><th>Ratio to base</th><th>Frequency</th><th>Cents</th><th>Nearest key</th><th>Shift</th><th>Listen</th></tr></thead><tbody id="note-table"></tbody></table></div><p id="intervals"></p><p class="quiet">Pitch distance is logarithmic: 1200 × log₂(frequency ratio). Ratios multiply; cents add. The fourth is 498.04 cents. The modern D above A is 500 cents.</p></details>
<div class="save-row"><p>Keep this comparison.</p><button type="button" id="share">Copy study link</button><button type="button" id="wav">Download A/B audio · WAV</button><button type="button" id="study">Save illustrated study · HTML</button><p id="save-status" role="status"></p></div>
<p class="boundary">A modern reference pitch and sine tones make the mathematics audible. They do not recreate an ancient instrument or performance. These are theoretical divisions transmitted by Ptolemy, not a recovered song.</p>
</section>
<section class="language" aria-labelledby="language-title"><div class="section-heading"><div><p class="eyebrow">02 / A WORD YOU CAN HEAR</p><h2 id="language-title">Close-packed: <span lang="grc">πυκνόν</span></h2></div><p class="section-aside">Greek words, tied to the experiment.</p></div><div class="word-layout"><div class="word-tabs" role="group" aria-label="Greek vocabulary">${WORDS.map((w, i) => `<button type="button" data-word="${i}" aria-pressed="${i === 0}"><span lang="grc">${w.greek}</span><span>${w.label}</span></button>`).join("")}</div><article id="word-detail" aria-live="polite"></article></div></section>
<section id="source" class="source" aria-labelledby="source-title"><div class="section-heading"><div><p class="eyebrow">03 / READ THE SOURCE</p><h2 id="source-title">A theory, handed down.</h2></div><p class="section-aside">Ptolemy → Wallis’s edition → this experiment</p></div><div class="source-columns"><div><p>Archytas lived in the fourth century BCE. Ptolemy, writing centuries later, reports—and criticizes—his three divisions. Our ratios follow that report in <i>Harmonics</i> I.13.</p><blockquote lang="la">Tria nimirum constituit ille Genera; Enarmonium, Chromaticum, &amp; Diatonicum.</blockquote><p>“He established three genera: enharmonic, chromatic and diatonic.” <span class="quiet">Our English translation.</span></p><p class="source-caption">Latin translation by John Wallis, Oxford, 1682, p. 62. The Greek text is printed alongside it. Latin here is an early modern translation of an ancient Greek treatise.</p><a class="text-link" href="${ARCHIVE}">Read the complete scanned edition ↗</a></div><div><div class="table-scroll" tabindex="0" role="region" aria-label="Source numbers"><table><caption>Source pitch numbers, ordered here from low to high</caption><thead><tr><th>Note</th><th>Enh.</th><th>Chr.</th><th>Diat.</th></tr></thead><tbody>${SOURCE_NUMBERS.map(
  (r) =>
    `<tr><th>${r[0]}</th>${r
      .slice(1)
      .map((n) => `<td>${n}</td>`)
      .join("")}</tr>`,
).join(
  "",
)}</tbody></table></div><p class="source-caption">Wallis p. 63. The numbers decrease as pitch rises. We realize them as proportional string lengths: frequency = starting frequency × 2016 ÷ source number. Only the third row changes between genera in this scheme.</p><p class="source-caption">The transmitted table has its own editorial history; its layout is not proof of an original table drawn by Ptolemy. <a href="https://doi.org/10.1515/apeiron-2024-0006">Tolsa’s study of Greek tables (2024)</a>.</p></div></div><details class="scan"><summary>Inspect the Greek &amp; Latin pages <span>Bundled for offline reading</span></summary><p>Printed pages 62–63. Open either scan to zoom. The source lists its upper intervals first; the experiment displays and measures from low pitch to high pitch.</p><div class="scan-grid"><a href="./sources/wallis-62.jpg"><img loading="lazy" src="./sources/wallis-62.jpg" alt="Wallis 1682, printed page 62: Ptolemy’s report of Archytas, Latin at left and Greek at right" width="1609" height="2200"></a><a href="./sources/wallis-63.jpg"><img loading="lazy" src="./sources/wallis-63.jpg" alt="Wallis 1682, printed page 63: numbers and tables for the three divisions" width="1609" height="2200"></a></div></details></section>
</main><footer><p><strong>PYKNON</strong> · A fourth, closely heard.</p><p id="offline-status">Checking offline availability…</p><p><a href="https://github.com/antonsoo/pyknon">Open source / MIT</a> · <a href="https://github.com/antonsoo/pyknon/blob/main/THIRD_PARTY.md">Sources &amp; credits</a></p></footer>`;

function get<T extends HTMLElement = HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element ${selector}`);
  return element;
}
function mark(tone: Tone | null) {
  document.querySelectorAll("[data-note]").forEach((el) => {
    el.classList.toggle(
      "sounding",
      tone !== null && el.getAttribute("data-note") === `${tone.tuning}-${tone.note}`,
    );
  });
  if (tone)
    get("#play-status").textContent =
      `${tone.tuning === "ratios" ? "Ancient ratios" : "Modern keys"} · note ${tone.note + 1} · ${tone.hz.toFixed(2)} Hz`;
}
function stop(message = "Stopped.") {
  player.stop();
  mark(null);
  get<HTMLButtonElement>("#stop").disabled = true;
  get("#play-status").textContent = message;
}
function update(push = true) {
  stop("Ready. Simple tones; start at a comfortable volume.");
  const g = genus(state.genus);
  const values = notes(state);
  document.querySelectorAll<HTMLButtonElement>("[data-genus]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.genus === state.genus));
  });
  get<HTMLSelectElement>("#root").value = String(state.root);
  get<HTMLSelectElement>("#direction").value = state.direction;
  get("#genus-description").textContent = g.description;
  get("#diagram").innerHTML = window.matchMedia("(max-width: 620px)").matches
    ? phoneRuler(state)
    : ruler(state);
  get("#finding-title").textContent =
    state.genus === "enharmonic"
      ? "One small step disappears."
      : state.genus === "chromatic"
        ? "The cluster opens up."
        : "The close-packed group is gone.";
  const lower = at(values, 2).cents;
  const upper = at(values, 3).cents - lower;
  get("#finding-copy").textContent =
    state.genus === "enharmonic"
      ? `Notes 2 and 3 are ${(at(values, 2).cents - at(values, 1).cents).toFixed(2)} cents apart. Both round to B♭, leaving three distinct pitches instead of four. Compare the small upward step with the repeated modern key.`
      : `${hasPyknon(state.genus) ? "A pyknon remains" : "There is no pyknon here"}: the lower two intervals span ${lower.toFixed(2)} cents, ${hasPyknon(state.genus) ? "less" : "more"} than the remaining ${upper.toFixed(2)}. Rounding preserves four pitches here, but changes their intervals.`;
  get("#table-caption").textContent =
    `${g.name} · modern starting reference ${state.root} Hz · rows always ordered low to high`;
  const names = ["A", "B♭", "B", "C", "C♯", "D"];
  get("#note-table").innerHTML = values
    .map(
      (n) =>
        `<tr><th>${n.index + 1}</th><td>${n.ratio.join("/")}</td><td>${n.hz.toFixed(3)} Hz</td><td>${n.cents.toFixed(2)}¢</td><td>${names[n.key]} · ${n.keyboardHz.toFixed(3)} Hz</td><td>${n.error > 0 ? "+" : ""}${n.error.toFixed(2)}¢</td><td><button type="button" data-single="${n.index}" aria-label="Hear original note ${n.index + 1}">▶ ${n.index + 1}</button></td></tr>`,
    )
    .join("");
  get("#intervals").textContent =
    `Adjacent ascending intervals: ${g.intervals.map((r) => `${r.join("/")} = ${cents(r).toFixed(2)}¢`).join("; ")}.`;
  if (push) {
    history.replaceState(null, "", `${location.pathname}${queryFor(state)}${location.hash}`);
    get("#save-status").textContent = "";
  }
}
async function play(sound: Sound, note?: number) {
  const sequence =
    note === undefined
      ? plan(state, sound)
      : {
          tones: [
            {
              start: 0.12,
              duration: 0.48,
              hz: at(notes(state), note).hz,
              note,
              tuning: "ratios" as const,
            },
          ],
          duration: 0.8,
        };
  get<HTMLButtonElement>("#stop").disabled = false;
  get("#play-status").textContent = "Starting audio…";
  try {
    await player.play(sequence, mark, () => {
      get<HTMLButtonElement>("#stop").disabled = true;
      get("#play-status").textContent = "Finished. Listen again or try another division.";
    });
  } catch {
    stop("Audio could not start in this browser. The diagram and measurements remain available.");
  }
}
function word(index: number) {
  const w = at(WORDS, index);
  document.querySelectorAll<HTMLButtonElement>("[data-word]").forEach((button) => {
    button.setAttribute("aria-pressed", String(Number(button.dataset.word) === index));
  });
  get("#word-detail").innerHTML =
    `<p class="word-title"><span lang="grc">${w.greek}</span> <span>${w.roman}</span></p><h3>${w.label}</h3><p>${w.meaning}</p><p class="word-action">${w.action}</p>${index > 0 ? `<button type="button" data-try="${at(GENERA, index - 1).id}">Try this division ↑</button>` : `<button type="button" data-try="enharmonic">Find the pyknon ↑</button>`}<p class="source-caption"><a href="${w.href}">${w.source}</a>. ${index === 0 ? "Pyknon is the neuter form of the adjective pyknos, ‘close-packed’. The scan gives an English translation of the ancient definition; our ratios come from Ptolemy’s report of Archytas." : "Greek genus names shown in their neuter form, agreeing with ‘genus’; transliterations are reading aids, not audio pronunciation."}</p>`;
}
document.addEventListener("click", (event) => {
  const target = (event.target as Element).closest<HTMLButtonElement>("button");
  if (!target) return;
  if (target.dataset.genus) {
    state.genus = target.dataset.genus as GenusId;
    update();
  }
  if (target.dataset.play) void play(target.dataset.play as Sound);
  if (target.dataset.single) void play("ratios", Number(target.dataset.single));
  if (target.dataset.word) word(Number(target.dataset.word));
  if (target.dataset.try) {
    state.genus = target.dataset.try as GenusId;
    update();
    location.hash = "listen";
    get("#listen-title").focus({ preventScroll: true });
    get("#listen").scrollIntoView({ block: "start" });
  }
});
get("#root").addEventListener("change", () => {
  state = readState(
    `?g=${state.genus}&a=${get<HTMLSelectElement>("#root").value}&d=${state.direction}`,
  );
  update();
});
get("#direction").addEventListener("change", () => {
  state.direction = get<HTMLSelectElement>("#direction").value === "down" ? "down" : "up";
  update();
});
get("#stop").addEventListener("click", () => stop());
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stop("Paused when the page was hidden. Press play to listen again.");
});
window.addEventListener("pagehide", () => stop());
window.addEventListener("popstate", () => {
  state = readState(location.search);
  update(false);
});
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
get("#study").addEventListener("click", () => {
  download(
    new Blob([study(state)], { type: "text/html;charset=utf-8" }),
    `pyknon-${state.genus}-${state.root}.html`,
  );
  get("#save-status").textContent =
    "Saved study includes the diagram, measurements and source link. Open it offline or print it.";
});
get("#wav").addEventListener("click", async () => {
  const button = get<HTMLButtonElement>("#wav");
  const selected = { ...state };
  button.disabled = true;
  get("#save-status").textContent = "Rendering the comparison…";
  try {
    const wav = await renderWav(plan(selected, "compare"));
    download(
      wav,
      `pyknon-${selected.genus}-${selected.root}-${selected.direction}-ratios-then-keys.wav`,
    );
    get("#save-status").textContent =
      `Saved ${genus(selected.genus).name}, ${selected.root} Hz, ${selected.direction === "up" ? "ascending" : "descending"}: four ratio notes, a pause, then four rounded notes.`;
  } catch {
    get("#save-status").textContent =
      "Audio export failed in this browser. You can still save the illustrated study.";
  } finally {
    button.disabled = false;
  }
});
get("#share").addEventListener("click", async () => {
  const url = `${location.origin}${location.pathname}${queryFor(state)}#listen`;
  try {
    await navigator.clipboard.writeText(url);
    get("#save-status").textContent =
      "Study link copied, including division, starting pitch and direction.";
  } catch {
    get("#save-status").textContent = `Copy this study link: ${url}`;
  }
});
window.matchMedia("(max-width: 620px)").addEventListener("change", () => update(false));
update(false);
word(0);
async function offline() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) {
    get("#offline-status").textContent = "Offline saving is available in the published build.";
    return;
  }
  try {
    await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
    const registration = await navigator.serviceWorker.ready;
    const channel = new MessageChannel();
    const response = new Promise<{ edition: string; complete: boolean }>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("timeout")), 8000);
      channel.port1.onmessage = (event) => {
        clearTimeout(timer);
        channel.port1.close();
        resolve(event.data);
      };
    });
    registration.active?.postMessage({ type: "PYKNON_INSPECT" }, [channel.port2]);
    const saved = await response;
    get("#offline-status").textContent =
      saved.edition === __PYKNON_EDITION__ && saved.complete
        ? "Ready offline · audio, diagrams & source scans saved."
        : "Offline edition is updating. Reload online to finish.";
  } catch {
    get("#offline-status").textContent =
      "Offline saving was unavailable. Keep this tab open or save a study.";
  }
}
void offline();
