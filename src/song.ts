import { Player, renderWav } from "./audio";
import {
  modernPitch,
  PITCHES,
  pitchHz,
  type SongScope,
  SYLLABLES,
  selectedSyllables,
  songPlan,
  songQuery,
  songState,
} from "./core/seikilos";
import { at, type Tone } from "./core/tetrachord";
import { offline } from "./offline";
import { DANGOUR, MONRO, MUSEUM, OBSERVATIONS, SONG_WORDS, VERSES } from "./song-content";
import { pitchSign, songDiagram, sourceLens } from "./song-drawing";
import { songStudy } from "./song-study";

function get<T extends HTMLElement = HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing element ${selector}`);
  return element;
}
let state = songState(location.search);
const player = new Player();
let request = 0;
let renderedVerse = -1;
get("#app").innerHTML = `
<a class="skip" href="#reader">Skip to song reader</a>
<header class="site-header"><a class="brand" href="./">PYKNON<span lang="grc">πυκνόν</span></a><nav aria-label="Main"><a href="./#listen">Tetrachords</a><a href="./song.html" aria-current="page">Read a song</a><a href="./canon.html">Six tones</a><a href="./trial.html">String trial</a><a href="./rhythm.html">Rhythm</a><a href="./tension.html">Weighted strings</a><a href="#song-sources">Sources</a></nav></header>
<main class="song-main">
<section class="song-intro" aria-labelledby="song-title"><div><p class="song-context">Seikilos · Greek song from Roman-period Asia Minor</p><h1 id="song-title">A song you can<br>read in stone.</h1><p>Small signs above the Greek words preserve a melody. Follow a syllable, find its signs in the photograph, then hear a modern reading of its notes.</p><a class="text-link" href="#reader">Read and listen</a></div><figure><a href="./sources/seikilos/stele.jpg"><img src="./sources/seikilos/stele.jpg" alt="The Seikilos marble stele, with Greek text and smaller musical signs between the lines" width="851" height="1280"></a><figcaption>National Museum of Denmark, object 14897.<br>John Lee / Nationalmuseet, <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. <a href="https://samlinger.natmus.dk/as/asset/28501">Original photograph</a>.</figcaption></figure></section>
<section id="reader" class="song-reader" aria-labelledby="reader-title"><h2 id="reader-title" tabindex="-1">Follow the song.</h2>
<p class="reader-intro">Choose a verse, then a syllable. The signs above it are pitches; one syllable can carry several notes.</p>
<div class="song-transport"><div class="play-buttons"><button type="button" class="primary" data-song-play="verse">Play verse</button><button type="button" data-song-play="song">Play whole song</button><button type="button" id="song-stop" disabled>Stop</button></div><div class="song-settings"><label>Starting A<select id="song-root"><option value="220">220 Hz · A3</option><option value="440">440 Hz · A4</option></select></label><label>Short units / min<select id="song-pace"><option value="90">90 · slow</option><option value="120">120</option><option value="150">150</option><option value="180">180 · quick</option></select></label></div></div>
<p id="song-status" class="song-status" role="status">Ready. Simple tones; choose a comfortable volume.</p>
<p class="playback-note">Playback uses modern equal temperament and sine tones. Starting pitch and pace are choices here; the stone specifies neither.</p>
<div class="verse-tabs" role="group" aria-label="Verse">${VERSES.map((v, i) => `<button type="button" data-verse="${i}" aria-pressed="false"><span>Verse ${i + 1}</span><span lang="grc">${v.greek.split(" ")[0]}</span></button>`).join("")}</div>
<div class="verse-heading"><h3 id="verse-greek" lang="grc"></h3><p id="verse-english"></p></div>
<div class="reading-layout"><div class="reading-score"><div id="syllable-buttons" class="syllable-buttons" role="group" aria-label="Syllables in this verse"></div><p class="quiet signs-note">Newly typeset pitch signs; the photograph retains the original rhythm marks.</p><figure class="song-contour"><div id="song-diagram"></div><figcaption>Each stroke is a note. Its length shows duration; its height shows pitch. The selected syllable is purple.</figcaption></figure></div>
<article class="syllable-reading" aria-labelledby="selected-title"><div class="selected-heading"><h3 id="selected-title"></h3><button type="button" data-song-play="syllable">Hear syllable</button></div><p id="word-gloss"></p><p id="word-note"></p><div id="source-lens"></div><p id="source-position" class="source-caption"></p><p class="source-caption">Lennart Larsen / Nationalmuseet, <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. <a href="${MUSEUM}">AS-10006</a>. Photograph unchanged; viewport and highlight added.</p><div class="table-scroll" tabindex="0" role="region" aria-label="Selected syllable pitches"><table><caption>Our playback reading</caption><thead><tr><th>Sign</th><th>Pitch</th><th>Units</th><th>Hz</th></tr></thead><tbody id="syllable-table"></tbody></table></div><div class="syllable-navigation"><button type="button" id="previous-syllable">Previous syllable</button><button type="button" id="next-syllable">Next syllable</button></div></article></div>
<div class="song-save"><button type="button" id="song-share">Copy reading link</button><button type="button" id="song-wav">Download verse · WAV</button><button type="button" id="song-study">Save reading · HTML</button><p id="song-save-status" role="status"></p></div>
</section>
<section class="song-observations" aria-labelledby="observations-title"><h2 id="observations-title">Look, then listen.</h2><div class="observations">${OBSERVATIONS.map((o) => `<article><h3>${o.title}</h3><p>${o.text}</p><button type="button" data-observation="${o.syllable}">Inspect <span lang="grc">${at(SYLLABLES, o.syllable).greek}</span></button></article>`).join("")}</div></section>
<section class="song-text" aria-labelledby="poem-title"><div><h2 id="poem-title">Four verses.<br>Six lines on stone.</h2><p>The song wraps around a column. Its physical line breaks cut through words such as <span lang="grc">ὀλίγον</span> and <span lang="grc">χρόνος</span>. Our reader groups the text into four verses and adds accents, breathing marks and word divisions.</p><p>Roman letters below are reading aids, not a claim about the pronunciation of a particular ancient singer. The English is a new translation. There is no Latin translation on this object.</p></div><div class="parallel-poem">${VERSES.map((v, i) => `<article><a href="${songQuery({ ...state, syllable: v.first })}#reader" data-poem="${v.first}" lang="grc">${v.greek}</a><p class="roman">${v.roman}</p><p>${v.english}</p><span class="quiet">Verse ${i + 1}</span></article>`).join("")}</div></section>
<section id="song-sources" class="song-sources" aria-labelledby="song-sources-title"><h2 id="song-sources-title">What the evidence preserves.</h2><div class="source-columns"><div><p>The stele is held by the National Museum of Denmark, <strong>inventory 14897</strong>. It comes from the area of ancient Tralles, near modern Aydın in Turkey. A Roman-period date is appropriate; exact dating and the damaged dedication have been interpreted differently.</p><p>The sung words and pitch signs survive. Our note durations follow the modern transcription in <a href="${DANGOUR}">Armand D’Angour’s “The Song of Seikilos” (2021)</a>. We use its sequence without adding stress accents, accompaniment or modern bar lines. The short gaps between tones help separate them; they are not written rests.</p><p>The <a href="${MUSEUM}">museum photograph</a> lets you inspect the evidence. This is a guided reading, not a new critical edition. The app does not establish an ancient tuning, absolute pitch, tempo, pronunciation or instrument.</p></div><div><h3>The ending was corrected.</h3><p>In an 1894 addendum, D. B. Monro reports a fresh examination of the inscription. The last angular sign is a reversed gamma. The underline had made it look like a different shape. In the modern transposition used here, it is the lower E.</p><a href="./sources/seikilos/monro-ending.jpg"><img class="ending-image" src="./sources/seikilos/monro-ending.jpg" alt="Monro’s printed correction: the three signs over the final syllable include a reversed gamma above an underline" width="437" height="200" loading="lazy"></a><p class="source-caption"><a href="${MONRO}">Monro, The Modes of Ancient Greek Music (1894), p. 145</a>. Public-domain image. His <a href="./sources/seikilos/monro-correction.jpg">corrected stave transcription</a> uses a different rhythm from the modern reading played here.</p><button type="button" data-observation="28">Inspect the ending</button></div></div>
<details class="full-inscription"><summary>Inspect the complete inscription photograph</summary><p>Smaller pitch and duration signs sit between the large letters. The six physical song lines begin below the dedicatory text. Open the image for full-size inspection.</p><a href="./sources/seikilos/inscription.jpg"><img src="./sources/seikilos/inscription.jpg" alt="Unrolled photograph of the full Seikilos inscription, including all six physical song lines" width="902" height="1280" loading="lazy"></a><p class="source-caption">Lennart Larsen / National Museum of Denmark, AS-10006. <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. Unchanged museum JPEG.</p></details>
</section></main><footer><p><a href="./">Pyknon · the tetrachord experiment</a></p><p id="offline-status">Checking offline availability…</p><p><a href="https://github.com/antonsoo/pyknon">Source code</a> · <a href="https://github.com/antonsoo/pyknon/blob/main/THIRD_PARTY.md">Sources &amp; credits</a></p></footer>`;

function clearMarks() {
  document.querySelectorAll(".song-sounding").forEach((el) => {
    el.classList.remove("song-sounding");
  });
}
function stop(message = "Stopped.") {
  request++;
  player.stop();
  clearMarks();
  get<HTMLButtonElement>("#song-stop").disabled = true;
  get("#song-status").textContent = message;
}
function update() {
  const s = at(SYLLABLES, state.syllable);
  const v = at(VERSES, s.verse);
  const word = at(SONG_WORDS, s.word);
  get<HTMLSelectElement>("#song-root").value = String(state.root);
  get<HTMLSelectElement>("#song-pace").value = String(state.pace);
  document.querySelectorAll<HTMLButtonElement>("[data-verse]").forEach((b) => {
    b.setAttribute("aria-pressed", String(Number(b.dataset.verse) === s.verse));
  });
  get("#verse-greek").textContent = v.greek;
  get("#verse-english").textContent = v.english;
  if (renderedVerse !== s.verse) {
    get("#syllable-buttons").innerHTML = selectedSyllables(state, "verse")
      .map((i) => {
        const item = at(SYLLABLES, i);
        return `<button type="button" data-syllable="${i}" aria-pressed="false" aria-label="${item.greek}, ${item.roman}, ${item.notes.length} ${item.notes.length === 1 ? "note" : "notes"}"><span class="syllable-signs">${item.notes.map(([pitch]) => pitchSign(pitch)).join("")}</span><span class="syllable-greek" lang="grc">${item.greek}</span><span class="syllable-roman">${item.roman}</span></button>`;
      })
      .join("");
    renderedVerse = s.verse;
  }
  document.querySelectorAll<HTMLButtonElement>("[data-syllable]").forEach((b) => {
    b.setAttribute("aria-pressed", String(Number(b.dataset.syllable) === state.syllable));
  });
  get("#song-diagram").innerHTML = songDiagram(state);
  get("#selected-title").innerHTML =
    `<span lang="grc">${s.greek}</span><span class="roman">${s.roman}</span>`;
  get("#word-gloss").innerHTML = `<span lang="grc">${word.greek}</span> · ${word.gloss}`;
  get("#word-note").textContent = word.note;
  get("#source-lens").innerHTML = sourceLens(state.syllable);
  get("#source-position").textContent =
    `Highlighted: ${s.greek}, physical song line ${s.stoneLine + 1} of 6. Context on either side is retained.`;
  get("#syllable-table").innerHTML = s.notes
    .map(
      ([p, units]) =>
        `<tr><th>${PITCHES[p].sign}</th><td>${modernPitch(p, state.root)}</td><td>${units}</td><td>${pitchHz(p, state.root).toFixed(2)}</td></tr>`,
    )
    .join("");
  get<HTMLButtonElement>("#previous-syllable").disabled = state.syllable === 0;
  get<HTMLButtonElement>("#next-syllable").disabled = state.syllable === SYLLABLES.length - 1;
  history.replaceState(null, "", `${location.pathname}${songQuery(state)}${location.hash}`);
  document.querySelectorAll<HTMLAnchorElement>("[data-poem]").forEach((a) => {
    a.href = `${songQuery({ ...state, syllable: Number(a.dataset.poem) })}#reader`;
  });
}
function select(index: number) {
  stop("Ready. Hear the selected syllable or its whole verse.");
  state = { ...state, syllable: index };
  update();
}
function mark(tone: Tone | null) {
  clearMarks();
  if (!tone) return;
  if (state.syllable !== tone.note) {
    state = { ...state, syllable: tone.note };
    update();
  }
  document.querySelector(`[data-syllable="${tone.note}"]`)?.classList.add("song-sounding");
  document.querySelectorAll<SVGElement>("[data-tone-syllable]").forEach((el) => {
    if (Number(el.dataset.toneSyllable) === tone.note && Number(el.dataset.toneHz) === tone.hz)
      el.classList.add("song-sounding");
  });
  get("#song-status").textContent =
    `Playing verse ${at(SYLLABLES, tone.note).verse + 1} · ${at(SYLLABLES, tone.note).greek} · ${tone.hz.toFixed(2)} Hz`;
}
async function play(scope: SongScope) {
  stop("Starting audio…");
  const current = request;
  get<HTMLButtonElement>("#song-stop").disabled = false;
  try {
    await player.play(songPlan(state, scope), mark, () => {
      clearMarks();
      get<HTMLButtonElement>("#song-stop").disabled = true;
      get("#song-status").textContent = "Finished. Select a syllable to inspect its signs.";
    });
  } catch {
    if (current === request) stop("Audio could not start. Try Play again, or save the reading.");
  }
}
document.addEventListener("click", (event) => {
  const target =
    event.target instanceof Element ? event.target.closest<HTMLElement>("button, a") : null;
  if (!target) return;
  if (target.dataset.songPlay) void play(target.dataset.songPlay as SongScope);
  else if (target.dataset.syllable) select(Number(target.dataset.syllable));
  else if (target.dataset.verse) select(at(VERSES, Number(target.dataset.verse)).first);
  else if (target.dataset.observation || target.dataset.poem) {
    event.preventDefault();
    select(Number(target.dataset.observation ?? target.dataset.poem));
    get("#reader-title").focus();
    get("#reader").scrollIntoView({ block: "start" });
    history.replaceState(null, "", `${location.pathname}${songQuery(state)}#reader`);
  }
});
get("#song-stop").addEventListener("click", () => stop());
get("#previous-syllable").addEventListener("click", () => select(Math.max(0, state.syllable - 1)));
get("#next-syllable").addEventListener("click", () =>
  select(Math.min(SYLLABLES.length - 1, state.syllable + 1)),
);
get("#song-root").addEventListener("change", () => {
  stop();
  state = songState(
    `?s=${state.syllable}&a=${get<HTMLSelectElement>("#song-root").value}&pace=${state.pace}`,
  );
  update();
});
get("#song-pace").addEventListener("change", () => {
  stop();
  state = songState(
    `?s=${state.syllable}&a=${state.root}&pace=${get<HTMLSelectElement>("#song-pace").value}`,
  );
  update();
});
window.addEventListener("pagehide", () => player.stop());
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
get("#song-share").addEventListener("click", async () => {
  const url = `${location.origin}${location.pathname}${songQuery(state)}#reader`;
  try {
    await navigator.clipboard.writeText(url);
    get("#song-save-status").textContent =
      "Reading link copied, including syllable, pitch and pace.";
  } catch {
    get("#song-save-status").textContent = `Copy this reading link: ${url}`;
  }
});
get("#song-wav").addEventListener("click", async () => {
  const button = get<HTMLButtonElement>("#song-wav");
  const selected = { ...state };
  const verse = at(SYLLABLES, selected.syllable).verse + 1;
  button.disabled = true;
  get("#song-save-status").textContent = "Rendering this verse…";
  try {
    download(
      await renderWav(songPlan(selected, "verse")),
      `seikilos-verse-${verse}-A${selected.root}-${selected.pace}upm.wav`,
    );
    get("#song-save-status").textContent =
      `Saved verse ${verse}, starting A ${selected.root} Hz, ${selected.pace} short units per minute. Modern equal temperament and sine tones.`;
  } catch {
    get("#song-save-status").textContent =
      "Audio export failed. You can still save the illustrated reading.";
  } finally {
    button.disabled = false;
  }
});
get("#song-study").addEventListener("click", async () => {
  const button = get<HTMLButtonElement>("#song-study");
  const selected = { ...state };
  button.disabled = true;
  get("#song-save-status").textContent = "Preparing the reading and source photograph…";
  try {
    const response = await fetch("./sources/seikilos/inscription.jpg");
    if (!response.ok || !response.headers.get("content-type")?.startsWith("image/jpeg"))
      throw new Error("Source image unavailable");
    const blob = await response.blob();
    // Decode before certifying that a saved study includes the actual readable image.
    const bitmap = await createImageBitmap(blob);
    if (bitmap.width !== 902 || bitmap.height !== 1280) {
      bitmap.close();
      throw new Error("Unexpected source image");
    }
    bitmap.close();
    const encoded = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(blob);
    });
    download(
      new Blob([songStudy(selected, encoded)], { type: "text/html;charset=utf-8" }),
      `seikilos-verse-${at(SYLLABLES, selected.syllable).verse + 1}-reading.html`,
    );
    get("#song-save-status").textContent =
      "Saved all four verses, word notes, pitch tables and the selected source photograph. Open offline or print.";
  } catch {
    get("#song-save-status").textContent =
      "The source photograph could not be saved. Reconnect and try again.";
  } finally {
    button.disabled = false;
  }
});
update();
void offline(get("#offline-status"));
