import {
  modernPitch,
  PITCHES,
  pitchHz,
  type SongState,
  SYLLABLES,
  songQuery,
} from "./core/seikilos";
import { at } from "./core/tetrachord";
import { DANGOUR, MONRO, MUSEUM, SONG_WORDS, VERSES } from "./song-content";
import { songDiagram, sourceLens } from "./song-drawing";

export function songStudy(state: SongState, inscription: string): string {
  const selected = at(SYLLABLES, state.syllable);
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Seikilos · verse ${selected.verse + 1} · Pyknon</title>
<style>body{max-width:900px;margin:36px auto;padding:0 22px;font:17px/1.6 Georgia,serif;color:#2c2538;background:white}h1{line-height:1.1}h2{font-size:24px}a{color:#36275e}svg{width:100%;height:auto;font:14px system-ui}.source-lens{max-width:540px}.song-grid{stroke:#e2dde8}.song-tone{stroke:#9b91ab;stroke-width:5}.selected-tone{stroke:#36275e;stroke-width:7}table{border-collapse:collapse;width:100%;font:14px/1.5 system-ui}th,td{border-bottom:1px solid #ddd;padding:8px;text-align:left}.scroll{overflow:auto}.verse{margin:28px 0;break-inside:avoid}.greek{font-size:23px}footer{margin-top:35px;border-top:1px solid #ddd;font-size:14px}@media(max-width:620px){.song-diagram{font-size:24px}}@media print{body{margin:0;font-size:12px}.scroll{overflow:visible}svg{max-height:190px}tr{break-inside:avoid}}</style>
<h1>Read the Seikilos song</h1><p>Selected: verse ${selected.verse + 1}, <span lang="grc">${selected.greek}</span> in <span lang="grc">${at(SONG_WORDS, selected.word).greek}</span>. Starting A = ${state.root} Hz; ${state.pace} short units per minute.</p>
<p>This is a modern listening realization in equal temperament, using sine tones. The stone does not specify this reference pitch, tempo or timbre. The duration reading follows the modern transcription linked below.</p>
${songDiagram(state)}${sourceLens(state.syllable, inscription)}<p>Highlighted evidence in the unchanged photograph by Lennart Larsen / National Museum of Denmark, <a href="${MUSEUM}">AS-10006, object 14897</a>. <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>. The display crops the image and adds a selection rectangle; the embedded photograph is unchanged. This image and its annotated presentation retain that license.</p>
${VERSES.map(
  (verse, vi) =>
    `<section class="verse"><h2>Verse ${vi + 1}</h2><p class="greek" lang="grc">${verse.greek}</p><p>${verse.roman}</p><p>${verse.english}</p><div class="scroll"><table><caption>Syllables and our playback reading</caption><thead><tr><th>Syllable</th><th>Pitch signs</th><th>Modern pitches</th><th>Short units</th><th>Hz</th></tr></thead><tbody>${SYLLABLES.filter(
      (s) => s.verse === vi,
    )
      .map(
        (s) =>
          `<tr><th lang="grc">${s.greek}</th><td>${s.notes.map(([p]) => PITCHES[p].sign).join(" → ")}</td><td>${s.notes.map(([p]) => modernPitch(p, state.root)).join(" → ")}</td><td>${s.notes.map(([, u]) => u).join(" + ")}</td><td>${s.notes.map(([p]) => pitchHz(p, state.root).toFixed(3)).join(" → ")}</td></tr>`,
      )
      .join("")}</tbody></table></div></section>`,
).join("")}
<h2>Word by word</h2>${SONG_WORDS.map((w) => `<p><strong lang="grc">${w.greek}</strong> — ${w.gloss}. ${w.note}</p>`).join("")}
<footer><p>Greek is normalized with accents, breathing marks, word divisions and four verse lines. The photograph preserves six physical song lines. Roman letters are a reading aid, not recorded pronunciation. English and notes are new teaching translations; no Latin translation survives on this object.</p><p><a href="${DANGOUR}">Armand D’Angour, “The Song of Seikilos” (2021)</a>: the modern pitch/duration transcription used here. <a href="${MONRO}">D. B. Monro, The Modes of Ancient Greek Music (1894), p. 145</a>: correction of the final pitch sign; its rhythm differs from our playback. The museum catalogues the stele as Roman-period Greek; date and dedication have interpretive uncertainties.</p><p><a href="https://antonsoo.github.io/pyknon/song.html${songQuery(state)}#reader">Open this reading</a>. This saved document includes its image, diagrams and styles. Text and code: MIT, Anton Soloviev, 2026. Photograph: CC BY-SA 4.0 as credited above.</p></footer></html>`;
}
