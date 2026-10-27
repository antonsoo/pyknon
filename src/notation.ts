import "./style.css";
import "./notation.css";
import { Player, renderWav } from "./audio";
import {
  type Alphabet,
  EXERCISES,
  type Exercise,
  importNotationJSON,
  NOTATION_DEFAULT,
  NOTATION_LIMITS,
  type NotationState,
  notationCSV,
  notationFromURL,
  notationJSON,
  notationPlan,
  notationURL,
  noteFrequency,
  noteRow,
  otherAlphabet,
  readSign,
  SIGNS,
  type Sign,
  signPalette,
  signPitch,
  translation,
  validNotationState,
} from "./core/notation";
import {
  NOTATION_SOURCES,
  notationAsset,
  notationBytes,
  notationPage,
  notationText,
} from "./notation-assets";
import { NOTATION_READINGS } from "./notation-content";
import {
  ne,
  nn,
  notationResult,
  notationSheet,
  notationTable,
  signDescription,
  signSVG,
  translationDetail,
} from "./notation-drawing";
import { notationStudy } from "./notation-study";
import { offline } from "./offline";

function get<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing ${id}`);
  return el as T;
}
const restored = notationFromURL(location.href);
let state = restored.state,
  revision = 0,
  sourceRevision = 0,
  sourceURL = "",
  sourceVerified = false;
let paletteAlphabet: Alphabet | undefined;
const player = new Player();
get("app").innerHTML = `<a class="skip" href="#translation">Skip to the translation desk</a>
<header class="site-header"><a href="./" class="brand">PYKNON<span lang="grc">πυκνόν</span></a><nav aria-label="Main"><a href="./">Greek intervals</a><a href="./song.html">A song in stone</a><a href="./halves.html">Three middles</a><a href="./vina.html">Two vinas</a><a href="#translation" aria-current="page">Musical signs</a></nav></header>
<main class="nt-main"><section class="nt-intro" aria-labelledby="nt-title"><div><p class="eyebrow">ALYPIUS / TWO MUSICAL ALPHABETS</p><h1 id="nt-title">Keep the notes.<br>Change the signs.</h1></div><div><p>You recognize the letter. Have you recognized the note?</p><p>Alypius’s tables pair vocal and instrumental signs. A <strong>matching shape can mean a different note</strong>; a matching note can keep two different names. Translate a short line, and check the Greek that describes its marks.</p><a class="text-link" href="#translation">Write the other alphabet ↓</a></div></section>
<p id="nt-link-notice" role="status"></p>
<section class="nt-sign-bench" id="nt-sign-bench" aria-labelledby="nt-sign-title"><div class="nt-specimen"><p class="eyebrow" id="nt-sign-title">ONE SHAPE / CHOOSE HOW TO READ IT</p><div id="nt-large-sign"></div><div class="nt-sign-choices" role="group" aria-label="Shape to investigate">${(["zeta", "square-u", "sigma"] as const).map((sign) => `<button type="button" data-nt-sign="${sign}" aria-pressed="false">${signSVG(sign)}<span>${sign === "square-u" ? "Square sign" : sign === "sigma" ? "Sigma control" : "Zeta"}</span></button>`).join("")}</div></div><div class="nt-interpretation"><div class="nt-alphabets" role="group" aria-label="Reading alphabet"><button type="button" data-nt-alphabet="vocal" aria-pressed="false">Read as vocal</button><button type="button" data-nt-alphabet="instrumental" aria-pressed="false">Read as instrumental</button></div><div id="nt-meaning" aria-live="polite"></div><p class="nt-note">The two readings use the same modern reference and tuning. The shape, alphabet and named function are separate pieces of information.</p><button type="button" id="nt-hear-sign">Hear this sign in both alphabets</button></div></section>
<section id="translation" class="nt-section" aria-labelledby="nt-translation-title"><div class="nt-heading"><div><p class="eyebrow">THE WORKING LINE</p><h2 id="nt-translation-title" tabindex="-1">Preserve the note.<br>Choose another mark.</h2></div><p>A newly composed practice line.<br>No lost ancient melody is being filled in.</p></div>
<div class="nt-exercise-controls"><label>Practice line<select id="nt-exercise">${Object.entries(
  EXERCISES,
)
  .map(([id, e]) => `<option value="${id}">${ne(e.title)}</option>`)
  .join(
    "",
  )}</select></label><p id="nt-direction"></p><button type="button" id="nt-reverse">Reverse translation & clear line</button></div>
<p id="nt-starting-note" class="nt-note">The starting example supplies two correct signs and two copied shapes. Replace any sign; the line keeps your actual choices.</p>
<div class="nt-line" id="nt-given-line"><strong id="nt-given-label"></strong>${[0, 1, 2, 3].map((i) => `<button type="button" id="nt-given-${i}" data-nt-slot="${i}" aria-pressed="false"></button>`).join("")}</div>
<div class="nt-line" id="nt-written-line"><strong id="nt-written-label"></strong>${[0, 1, 2, 3].map((i) => `<button type="button" id="nt-written-${i}" data-nt-slot="${i}" aria-pressed="false"></button>`).join("")}</div>
<p class="nt-write-instruction" id="nt-write-instruction"></p><div id="nt-palette" class="nt-palette" role="group" aria-label="Signs available to write"></div><div class="nt-line-actions"><button type="button" id="nt-erase">Erase selected slot</button><button type="button" id="nt-clear">Clear all four slots</button><button type="button" id="nt-use-table">Write the table’s pairs</button><button type="button" id="nt-starter">Restore the two copied shapes</button></div>
<div class="nt-verdict"><p id="nt-result" role="status"></p><p id="nt-slot-detail"></p><button type="button" id="nt-find-slot">Inspect the selected note’s printed row</button></div>
<div class="nt-audio"><label>Listening comparison<select id="nt-sound"><option value="sign">Same shape / vocal then instrumental</option><option value="line">Given line / actual written line</option></select></label><label>Instructional tuning<select id="nt-tuning"><option value="pythagorean">Rational / Pythagorean intervals</option><option value="equal">Twelve equal steps per octave</option></select></label><label>Lydian mesē reference<select id="nt-reference"><option value="220">220 Hz</option><option value="330">330 Hz</option><option value="440">440 Hz</option></select></label><button id="nt-play" type="button" class="primary">Play comparison</button><button id="nt-stop" type="button" disabled>Stop</button></div><p id="nt-audio-status" role="status">Ready. Finite sine tones; choose a comfortable volume.</p><p id="nt-audio-detail" class="nt-note"></p><details class="nt-details"><summary>What the sound does and does not establish</summary><p>The rational model uses a 9:8 tone, a 256:243 limma and a 4:3 fourth. The other model uses equal semitones. Neither is a measured ancient performance or a tuning recipe supplied by this table. A changed modern reference scales every frequency together.</p><p>Each written note lasts 0.6 s, with short silent gaps. A blank slot remains silent. In the line comparison the given phrase starts at 0 s and the written phrase at 3.6 s. No instrument timbre, ancient tempo, absolute pitch or hearing score is claimed.</p></details>
</section>
<section class="nt-section" id="nt-evidence" aria-labelledby="nt-evidence-title"><div class="nt-heading"><div><p class="eyebrow">A PAIR IS A RELATION</p><h2 id="nt-evidence-title">Keep the table<br>within reach.</h2></div><p>Nine selected functions from the Lydian diatonic table.<br>The whole print includes its other rows and apparatus.</p></div><div class="nt-reference-layout"><div><div class="nt-table-scroll" tabindex="0" role="region" aria-label="Paired notation lookup; scroll horizontally on a narrow screen" id="nt-lookup">${notationTable(state, true)}</div><p class="nt-note">The printed row numbers are counted positions in the complete table. Two rows may share the same pair. Use a row button to inspect its description; choosing a sign in the palette writes it into the line.</p></div><div class="nt-inspector"><p class="eyebrow" id="nt-row-label"></p><div id="nt-row-pair" class="nt-row-pair"></div><p id="nt-row-greek" lang="grc"></p><p id="nt-row-english"></p><p id="nt-row-pitch" class="nt-note"></p><label>Complete source page<select id="nt-page">${NOTATION_SOURCES.pages.map((p) => `<option value="${p.id}">${p.id === "title" ? "Title / 1895" : `Printed p${p.printedPage}`} · PDF p${p.pdfPage}</option>`).join("")}</select></label><figure class="nt-source"><button type="button" id="nt-enlarge" disabled aria-label="Enlarge verified whole source page"><span class="nt-page-frame"><img id="nt-source-image" alt="" hidden><span id="nt-source-band" hidden aria-hidden="true"></span></span></button><figcaption id="nt-caption"></figcaption></figure><p id="nt-source-status" role="status"></p><div class="nt-source-actions"><button type="button" id="nt-retry">Verify page again</button><a id="nt-open-source" target="_blank" rel="noopener" hidden>Open complete verified image</a></div></div></div></section>
<section class="nt-section" aria-labelledby="nt-reading-title"><div class="nt-heading"><div><p class="eyebrow">READ THE SHAPE DESCRIPTIONS</p><h2 id="nt-reading-title">Sideways.<br>Upright. Turned.</h2></div><p>Greek / new English / contextual words.<br>The print’s small differences stay visible.</p></div><label>Reading<select id="nt-reading">${NOTATION_READINGS.map((p, i) => `<option value="${i}">${i + 1} · ${ne(p.title)}</option>`).join("")}</select></label><article id="nt-reading-body" class="nt-reading"></article><div class="nt-reading-actions"><button type="button" id="nt-reading-previous">Previous reading</button><button type="button" id="nt-reading-next">Next reading</button><button type="button" id="nt-reading-source">Inspect this whole page</button></div><details class="nt-details"><summary>Edition, transcription and scope</summary><p>Karl von Jan, <cite>Musici scriptores graeci</cite>, Leipzig, 1895, Alypius, <cite>Eisagoge mousike</cite>, pp367–370. The complete title prints MDCCCXCV. Greek theta forms, line breaks and end-of-line hyphens are normalized; middle dots join selected entries where stated. Brackets and variant letter-name spellings remain. The new English and grammar are instructional and have not received independent philological review.</p><p>The regular vector signs follow the selected printed forms. They are teaching diagrams, not ancient handwriting or an extracted font. Jan’s staff transcriptions are his modern editorial work. <a href="${NOTATION_SOURCES.original.catalogue}">Inspect the complete scanned edition</a>.</p></details></section>
<section class="nt-section" aria-labelledby="nt-keep-title"><div class="nt-heading"><div><p class="eyebrow">KEEP THE WORKING LINE</p><h2 id="nt-keep-title">Read it beyond<br>this tab.</h2></div><p>Keep blanks and mistakes.<br>Keep the printed evidence too.</p></div><div class="nt-save"><button type="button" id="nt-share">Copy translation link</button>${(
  [
    ["json", "Save editable JSON"],
    ["csv", "Save translation CSV"],
    ["svg", "Save sign sheet SVG"],
    ["wav", "Save comparison WAV"],
    ["html", "Save illustrated reading · HTML"],
  ] as const
)
  .map(([id, text]) => `<button type="button" data-nt-save="${id}">${text}</button>`)
  .join(
    "",
  )}<label class="nt-import">Open a saved JSON<input type="file" accept="application/json,.json" id="nt-import"></label></div><label id="nt-share-label" hidden>Translation link · ready to copy<input type="url" readonly id="nt-share-link"></label><p id="nt-save-status" role="status"></p><p class="nt-prose">The illustrated HTML retains this line, native downloads, the complete paired lookup, all six readings, five whole source pages, sound, fonts and full licenses. It opens, plays and prints without scripts or a connection. The JSON is editable; it does not claim a uniquely resolved function where the sign is ambiguous.</p><p class="nt-prose">${ne(NOTATION_LIMITS)}</p><p><a href="./song.html">Continue: read the Seikilos inscription →</a><br><a href="./halves.html">Compare numerical and continuous pitch intervals →</a><br><a href="https://github.com/antonsoo/pyknon/blob/main/docs/notation-model.md">Read the source and model decisions →</a></p></section></main><footer><p><strong>PYKNON</strong> · One sign, two alphabets.</p><p id="offline-status">Checking offline availability…</p><p><a href="https://github.com/antonsoo/pyknon">Open source / MIT</a> · <a href="https://github.com/antonsoo/pyknon/blob/main/THIRD_PARTY.md">Sources & credits</a></p></footer>
<dialog id="nt-dialog" aria-labelledby="nt-dialog-title"><div class="nt-dialog-bar"><h2 id="nt-dialog-title">Complete source page</h2><button type="button" id="nt-zoom-out">− Zoom out</button><button type="button" id="nt-zoom-in">+ Zoom in</button><button type="button" id="nt-close">Close</button></div><p>Arrow keys pan the complete image. Escape closes it.</p><div id="nt-pan" tabindex="0" role="region" aria-label="Enlarged complete page; use arrow keys to pan"><img id="nt-zoom-image" alt=""></div></dialog>`;
get("nt-link-notice").textContent = restored.notice;

function stop() {
  player.stop();
  get<HTMLButtonElement>("nt-stop").disabled = true;
  document.querySelectorAll(".nt-playing").forEach((el) => {
    el.classList.remove("nt-playing");
  });
}
function set(next: NotationState) {
  if (!validNotationState(next)) throw new Error("Invalid notation desk state.");
  const changedPage = next.page !== state.page;
  stop();
  state = structuredClone(next);
  revision++;
  render();
  get("nt-audio-status").textContent =
    "Ready. The comparison follows the current signs and settings.";
  if (changedPage) void showSource();
}
function inspectRow(id: string) {
  set({ ...state, row: id, page: "369" });
}
function render() {
  get("nt-large-sign").innerHTML = signSVG(
    state.sign,
    `${SIGNS[state.sign]}; same shape, two reading alphabets`,
  );
  get("nt-large-sign").className = `nt-${state.alphabet}`;
  const candidates = readSign(state.sign, state.alphabet);
  const first = signPitch(state.sign, state.alphabet, state);
  get("nt-meaning").innerHTML =
    `<p class="nt-meaning-alphabet">${state.alphabet} notation</p><h3>${candidates.map((r) => ne(r.roman)).join('<span class="nt-or">or</span>')}</h3><p>${first ? `${nn(noteFrequency(first, state))} Hz in this model` : "No selected reading"}</p><p>${candidates.length > 1 ? "Two printed functions remain possible. Their modeled pitch agrees." : "One function in this desk’s selected span. Other tables and genera are outside this reading."}</p>`;
  document.querySelectorAll<HTMLButtonElement>("[data-nt-sign]").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.ntSign === state.sign));
  });
  document.querySelectorAll<HTMLButtonElement>("[data-nt-alphabet]").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.ntAlphabet === state.alphabet));
  });
  get<HTMLSelectElement>("nt-exercise").value = state.exercise;
  const written = otherAlphabet(state.given);
  get("nt-direction").textContent = `Given ${state.given} → write ${written}`;
  get("nt-given-label").textContent = `Given / ${state.given}`;
  get("nt-written-label").textContent = `Written / ${written}`;
  get("nt-given-line").className = `nt-line nt-${state.given}`;
  get("nt-written-line").className = `nt-line nt-${written}`;
  get("nt-starting-note").hidden = state.exercise !== "bridge" || state.given !== "vocal";
  for (const t of translation(state)) {
    const givenButton = get<HTMLButtonElement>(`nt-given-${t.index}`),
      writtenButton = get<HTMLButtonElement>(`nt-written-${t.index}`);
    givenButton.innerHTML = `${signSVG(t.target[state.given])}<span>Row ${t.target.number}</span>`;
    givenButton.setAttribute(
      "aria-label",
      `Select slot ${t.index + 1}, given ${SIGNS[t.target[state.given]]}: ${t.target.roman}`,
    );
    writtenButton.innerHTML = `${signSVG(t.answer)}<span>${t.answer ? (t.samePitch ? "same pitch" : "different pitch") : "blank / rest"}</span>`;
    writtenButton.setAttribute(
      "aria-label",
      `Select written slot ${t.index + 1}: ${t.answer ? SIGNS[t.answer] : "blank"}`,
    );
    givenButton.setAttribute("aria-pressed", String(state.cursor === t.index));
    writtenButton.setAttribute("aria-pressed", String(state.cursor === t.index));
  }
  get("nt-write-instruction").textContent =
    `Write slot ${state.cursor + 1} with a ${written} sign. The paired lookup below stays available.`;
  if (paletteAlphabet !== written) {
    get("nt-palette").innerHTML = signPalette(written)
      .map(
        (sign) =>
          `<button type="button" data-nt-write="${sign}" aria-label="Write ${signDescription(sign, written)}">${signSVG(sign)}<span>${ne(SIGNS[sign])}</span></button>`,
      )
      .join("");
    paletteAlphabet = written;
  }
  get("nt-palette").className = `nt-palette nt-${written}`;
  document.querySelectorAll<HTMLButtonElement>("[data-nt-write]").forEach((b) => {
    b.setAttribute("aria-pressed", String(b.dataset.ntWrite === state.answers[state.cursor]));
  });
  get("nt-result").textContent = notationResult(state);
  get("nt-slot-detail").textContent = translationDetail(state);
  get<HTMLSelectElement>("nt-sound").value = state.sound;
  get<HTMLSelectElement>("nt-tuning").value = state.tuning;
  get<HTMLSelectElement>("nt-reference").value = String(state.reference);
  const plan = notationPlan(state);
  get("nt-audio-detail").textContent =
    `${state.sound === "sign" ? "Vocal reading first, instrumental second." : "Given line first, then the actual written line; blanks remain silent."} ${plan.tones.map((t) => `${nn(t.hz)} Hz at ${nn(t.start)} s`).join("; ")}. All durations are modern choices.`;
  const row = noteRow(state.row);
  get("nt-row-label").textContent = `LYDIAN DIATONIC / PRINTED ROW ${row.number}`;
  get("nt-row-pair").innerHTML =
    `<span class="nt-vocal">${signSVG(row.vocal, `Vocal: ${SIGNS[row.vocal]}`)}<small>Vocal</small></span><span class="nt-instrumental">${signSVG(row.instrumental, `Instrumental: ${SIGNS[row.instrumental]}`)}<small>Instrumental</small></span>`;
  get("nt-row-greek").textContent = row.description;
  get("nt-row-english").textContent = row.translation;
  get("nt-row-pitch").textContent =
    `${nn(noteFrequency(row, state))} Hz in the ${state.tuning} model; ratio to mesē ${state.tuning === "pythagorean" ? row.ratio.join(":") : `2^(${row.semitones}/12)`}. The print gives the named pair, not this modern frequency.`;
  document.querySelectorAll<HTMLElement>("[data-note-row]").forEach((el) => {
    el.classList.toggle("nt-selected-row", el.dataset.noteRow === state.row);
  });
  get<HTMLSelectElement>("nt-page").value = state.page;
  const reading = NOTATION_READINGS[state.reading];
  if (!reading) throw new Error("Missing reading");
  get<HTMLSelectElement>("nt-reading").value = String(state.reading);
  get("nt-reading-body").innerHTML =
    `<p class="eyebrow">PRINTED p${reading.page}</p><h3>${ne(reading.title)}</h3><p lang="grc">${ne(reading.greek)}</p><p class="nt-english">${ne(reading.english)}</p><p>${ne(reading.note)}</p><dl>${reading.words.map((w) => `<dt><span lang="grc">${ne(w.greek)}</span> · ${ne(w.meaning)}</dt><dd>${ne(w.note)}</dd>`).join("")}</dl>`;
  get<HTMLButtonElement>("nt-reading-previous").disabled = state.reading === 0;
  get<HTMLButtonElement>("nt-reading-next").disabled =
    state.reading === NOTATION_READINGS.length - 1;
  updateBand();
}
function updateBand() {
  const band = get("nt-source-band"),
    row = noteRow(state.row);
  band.hidden = !sourceVerified || state.page !== "369";
  band.style.top = `${row.band[0] * 100}%`;
  band.style.height = `${(row.band[1] - row.band[0]) * 100}%`;
}
async function showSource() {
  const token = ++sourceRevision,
    page = notationPage(state.page);
  sourceVerified = false;
  get<HTMLImageElement>("nt-source-image").hidden = true;
  get<HTMLImageElement>("nt-source-image").removeAttribute("src");
  get<HTMLImageElement>("nt-zoom-image").removeAttribute("src");
  get<HTMLButtonElement>("nt-enlarge").disabled = true;
  get("nt-open-source").hidden = true;
  get("nt-caption").textContent =
    `${page.id === "title" ? "Title" : `Printed p${page.printedPage}`} · PDF p${page.pdfPage} · Jan 1895 · complete page`;
  get("nt-source-status").textContent = "Verifying the complete page…";
  updateBand();
  if (sourceURL) {
    URL.revokeObjectURL(sourceURL);
    sourceURL = "";
  }
  let candidate = "";
  try {
    candidate = URL.createObjectURL(
      new Blob([await notationBytes(page.file)], { type: "image/jpeg" }),
    );
    const decoded = new Image();
    decoded.src = candidate;
    await decoded.decode();
    if (token !== sourceRevision) {
      URL.revokeObjectURL(candidate);
      return;
    }
    if (decoded.naturalWidth !== page.width || decoded.naturalHeight !== page.height)
      throw new Error("The decoded image dimensions differ from this edition.");
    sourceURL = candidate;
    const image = get<HTMLImageElement>("nt-source-image");
    image.src = candidate;
    image.alt = `Complete ${page.id === "title" ? "title page" : `printed page ${page.printedPage}`} of Jan’s 1895 edition; ${page.note}`;
    image.hidden = false;
    sourceVerified = true;
    get<HTMLButtonElement>("nt-enlarge").disabled = false;
    get("nt-open-source").hidden = false;
    get<HTMLAnchorElement>("nt-open-source").href = candidate;
    get("nt-source-status").textContent =
      `Verified complete page · ${page.width} × ${page.height} · ${page.note}`;
    updateBand();
  } catch (error) {
    if (candidate) URL.revokeObjectURL(candidate);
    if (token !== sourceRevision) return;
    get("nt-source-status").textContent =
      error instanceof Error
        ? error.message
        : "The source page could not be verified. Reconnect and retry.";
  }
}
document.querySelectorAll<HTMLButtonElement>("[data-nt-sign]").forEach((button) => {
  button.addEventListener("click", () =>
    set({ ...state, sign: button.dataset.ntSign as NotationState["sign"] }),
  );
});
document.querySelectorAll<HTMLButtonElement>("[data-nt-alphabet]").forEach((button) => {
  button.addEventListener("click", () =>
    set({ ...state, alphabet: button.dataset.ntAlphabet as Alphabet }),
  );
});
document.querySelectorAll<HTMLButtonElement>("[data-nt-slot]").forEach((button) => {
  button.addEventListener("click", () => {
    const cursor = Number(button.dataset.ntSlot),
      row = translation(state)[cursor]?.target;
    if (row) set({ ...state, cursor, row: row.id, page: "369" });
  });
});
get("nt-palette").addEventListener("click", (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>("[data-nt-write]");
  if (!button) return;
  const answers = [...state.answers];
  answers[state.cursor] = button.dataset.ntWrite as Sign;
  set({ ...state, answers });
});
get("nt-lookup").addEventListener("click", (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>("[data-nt-row]");
  if (button?.dataset.ntRow) inspectRow(button.dataset.ntRow);
});
get("nt-exercise").addEventListener("change", () => {
  const exercise = get<HTMLSelectElement>("nt-exercise").value as Exercise;
  const row = EXERCISES[exercise].rows[0];
  set({ ...state, exercise, answers: [null, null, null, null], cursor: 0, row, page: "369" });
});
get("nt-reverse").addEventListener("click", () =>
  set({ ...state, given: otherAlphabet(state.given), answers: [null, null, null, null] }),
);
get("nt-erase").addEventListener("click", () => {
  const answers = [...state.answers];
  answers[state.cursor] = null;
  set({ ...state, answers });
});
get("nt-clear").addEventListener("click", () =>
  set({ ...state, answers: [null, null, null, null] }),
);
get("nt-use-table").addEventListener("click", () =>
  set({ ...state, answers: translation(state).map((t) => t.target[otherAlphabet(state.given)]) }),
);
get("nt-starter").addEventListener("click", () =>
  set({
    ...state,
    exercise: "bridge",
    given: "vocal",
    answers: [...NOTATION_DEFAULT.answers],
    cursor: 1,
    row: "paramese",
    page: "369",
  }),
);
get("nt-find-slot").addEventListener("click", () => {
  const target = translation(state)[state.cursor]?.target;
  if (target) inspectRow(target.id);
  get("nt-evidence").scrollIntoView({ block: "start" });
  get<HTMLSelectElement>("nt-page").focus({ preventScroll: true });
});
for (const id of ["sound", "tuning", "reference"] as const)
  get(`nt-${id}`).addEventListener("change", () => {
    const value = get<HTMLSelectElement>(`nt-${id}`).value;
    set({ ...state, [id]: id === "reference" ? Number(value) : value });
  });
async function play() {
  stop();
  get<HTMLButtonElement>("nt-stop").disabled = false;
  const snapshot = structuredClone(state),
    current = revision;
  get("nt-audio-status").textContent = "Starting the comparison…";
  try {
    await player.play(
      notationPlan(snapshot),
      (tone) => {
        document.querySelectorAll(".nt-playing").forEach((el) => {
          el.classList.remove("nt-playing");
        });
        if (!tone) return;
        const phase =
          snapshot.sound === "sign"
            ? tone.note === 0
              ? "Vocal reading"
              : "Instrumental reading"
            : tone.note < 4
              ? `Given slot ${tone.note + 1}`
              : `Written slot ${tone.note - 3}`;
        get("nt-audio-status").textContent = `${phase} · ${nn(tone.hz)} Hz in this model.`;
        if (snapshot.sound === "line")
          get(`nt-${tone.note < 4 ? "given" : "written"}-${tone.note % 4}`).classList.add(
            "nt-playing",
          );
        else get("nt-sign-bench").classList.add("nt-playing");
      },
      () => {
        get<HTMLButtonElement>("nt-stop").disabled = true;
        get("nt-audio-status").textContent =
          "Comparison finished. The written evidence remains available without listening.";
      },
    );
  } catch (error) {
    if (current !== revision) return;
    stop();
    get("nt-audio-status").textContent =
      error instanceof Error
        ? `Sound could not start: ${error.message}`
        : "Sound could not start. You can still compare the written signs.";
  }
}
get("nt-play").addEventListener("click", () => void play());
get("nt-hear-sign").addEventListener("click", () => {
  set({ ...state, sound: "sign" });
  void play();
});
get("nt-stop").addEventListener("click", () => {
  stop();
  get("nt-audio-status").textContent = "Stopped.";
});
get("nt-page").addEventListener("change", () =>
  set({ ...state, page: get<HTMLSelectElement>("nt-page").value as NotationState["page"] }),
);
get("nt-retry").addEventListener("click", () => void showSource());
get("nt-reading").addEventListener("change", () =>
  set({ ...state, reading: Number(get<HTMLSelectElement>("nt-reading").value) }),
);
get("nt-reading-previous").addEventListener("click", () =>
  set({ ...state, reading: Math.max(0, state.reading - 1) }),
);
get("nt-reading-next").addEventListener("click", () =>
  set({ ...state, reading: Math.min(5, state.reading + 1) }),
);
get("nt-reading-source").addEventListener("click", () => {
  set({ ...state, page: NOTATION_READINGS[state.reading]?.page as NotationState["page"] });
  get("nt-evidence").scrollIntoView({ block: "start" });
  get<HTMLSelectElement>("nt-page").focus({ preventScroll: true });
});
const dialog = get<HTMLDialogElement>("nt-dialog");
let zoom = 1;
function setZoom(next: number) {
  zoom = Math.min(3, Math.max(0.5, next));
  get<HTMLImageElement>("nt-zoom-image").style.width = `${notationPage(state.page).width * zoom}px`;
  get<HTMLButtonElement>("nt-zoom-out").disabled = zoom <= 0.5;
  get<HTMLButtonElement>("nt-zoom-in").disabled = zoom >= 3;
}
get("nt-enlarge").addEventListener("click", () => {
  if (!sourceVerified) return;
  const p = notationPage(state.page),
    image = get<HTMLImageElement>("nt-zoom-image");
  image.src = sourceURL;
  image.alt = get<HTMLImageElement>("nt-source-image").alt;
  get("nt-dialog-title").textContent =
    `${p.id === "title" ? "Title" : `Printed p${p.printedPage}`} · complete 1895 page`;
  dialog.showModal();
  setZoom(1);
  get("nt-pan").scrollTop =
    state.page === "369" ? Math.max(0, noteRow(state.row).band[0] * p.height - 45) : 0;
  get("nt-pan").scrollLeft = 0;
  get("nt-pan").focus();
});
get("nt-zoom-out").addEventListener("click", () => setZoom(zoom / 1.25));
get("nt-zoom-in").addEventListener("click", () => setZoom(zoom * 1.25));
get("nt-close").addEventListener("click", () => dialog.close());
get("nt-pan").addEventListener("keydown", (event) => {
  const amounts: Record<string, readonly [number, number]> = {
    ArrowLeft: [-110, 0],
    ArrowRight: [110, 0],
    ArrowUp: [0, -110],
    ArrowDown: [0, 110],
  };
  const delta = amounts[event.key];
  if (!delta) return;
  event.preventDefault();
  get("nt-pan").scrollBy({ left: delta[0], top: delta[1], behavior: "instant" });
});
get("nt-share").addEventListener("click", async () => {
  const url = notationURL(state, location.href);
  get<HTMLInputElement>("nt-share-link").value = url;
  get("nt-share-label").hidden = false;
  try {
    await navigator.clipboard.writeText(url);
    get("nt-save-status").textContent =
      "Translation link copied. The address of this tab has not changed.";
  } catch {
    get<HTMLInputElement>("nt-share-link").focus();
    get<HTMLInputElement>("nt-share-link").select();
    get("nt-save-status").textContent = "Copy the selected translation link.";
  }
});
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
document.querySelectorAll<HTMLButtonElement>("[data-nt-save]").forEach((button) => {
  button.addEventListener("click", async () => {
    const format = button.dataset.ntSave,
      snapshot = structuredClone(state),
      current = revision;
    button.disabled = true;
    get("nt-save-status").textContent =
      "Preparing the actual translation and verifying retained assets…";
    try {
      let blob: Blob;
      if (format === "json")
        blob = new Blob([notationJSON(snapshot)], { type: "application/json" });
      else if (format === "csv")
        blob = new Blob([notationCSV(snapshot)], { type: "text/csv;charset=utf-8" });
      else if (format === "svg")
        blob = new Blob(
          [
            notationSheet(
              snapshot,
              await notationAsset("fonts/IBMPlexSans-Regular.woff2", "font/woff2"),
              await notationText("fonts/IBMPlex-OFL.txt"),
            ),
          ],
          { type: "image/svg+xml" },
        );
      else if (format === "wav") blob = await renderWav(notationPlan(snapshot));
      else if (format === "html")
        blob = new Blob(
          [await notationStudy(snapshot, await renderWav(notationPlan(snapshot)), location.href)],
          { type: "text/html;charset=utf-8" },
        );
      else throw new Error("Unknown download format.");
      if (current !== revision) {
        get("nt-save-status").textContent =
          "The translation or settings changed while preparing the file. Save again to keep the current line.";
        return;
      }
      download(blob, `pyknon-notation.${format}`);
      get("nt-save-status").textContent = `Saved the current ${format?.toUpperCase()} file.`;
    } catch (error) {
      get("nt-save-status").textContent =
        error instanceof Error
          ? error.message
          : "The file could not be prepared. Reconnect and retry.";
    } finally {
      button.disabled = false;
    }
  });
});
let importRevision = 0;
get("nt-import").addEventListener("change", async () => {
  const input = get<HTMLInputElement>("nt-import"),
    file = input.files?.[0],
    current = revision,
    token = ++importRevision;
  if (!file) return;
  try {
    if (file.size > 16000)
      throw new Error("This translation record is too large. Choose a desk JSON file.");
    const next = importNotationJSON(await file.text());
    if (token !== importRevision) return;
    if (current !== revision)
      throw new Error(
        "The working line changed while the record was opening. Reopen it to replace the current line.",
      );
    set(next);
    get("nt-save-status").textContent =
      "Saved translation reopened, including blanks and mistaken signs.";
  } catch (error) {
    if (token !== importRevision) return;
    get("nt-save-status").textContent =
      error instanceof Error ? error.message : "The record could not be reopened.";
  } finally {
    input.value = "";
  }
});
window.addEventListener("pagehide", (event) => {
  stop();
  if (!event.persisted && sourceURL) URL.revokeObjectURL(sourceURL);
});
render();
void showSource();
void offline(get("offline-status"));
if (location.hash)
  requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
