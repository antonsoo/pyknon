import {
  modernPitch,
  PITCHES,
  type Pitch,
  type SongState,
  SYLLABLES,
  songEvents,
} from "./core/seikilos";
import { at } from "./core/tetrachord";

export function pitchSign(pitch: Pitch): string {
  return pitch === "R"
    ? '<svg class="pitch-sign reversed-gamma" viewBox="0 0 24 28" aria-hidden="true"><path d="M4 5H20V25" fill="none" stroke="currentColor" stroke-width="3"/></svg>'
    : `<span class="pitch-sign" lang="grc" aria-hidden="true">${PITCHES[pitch].sign}</span>`;
}
export function sourceLens(index: number, image = "./sources/seikilos/inscription.jpg"): string {
  const s = at(SYLLABLES, index);
  const [x, y, width, height] = s.box;
  // Context is preserved on either side; no resampling or retouching of the source.
  const left = Math.max(0, x - 85);
  const right = Math.min(902, x + width + 85);
  return `<svg class="source-lens" viewBox="${left} ${y - 10} ${right - left} ${height + 20}" role="img" aria-label="Inscribed ${s.greek} and its pitch signs, highlighted in physical song line ${s.stoneLine + 1}"><image href="${image}" width="902" height="1280"/><rect x="${x}" y="${y}" width="${width}" height="${height}" fill="#ffe3a1" fill-opacity="0.12" stroke="#ffe3a1" stroke-width="4"/></svg>`;
}
export function songDiagram(state: SongState): string {
  const events = songEvents(state, "verse");
  const x = (unit: number) => 48 + unit * 42;
  const y = (pitch: Pitch) => 148 - (PITCHES[pitch].semitones + 5) * 8;
  const ticks = Array.from(
    { length: 13 },
    (_, i) =>
      `<line x1="${x(i)}" x2="${x(i)}" y1="32" y2="170" class="song-grid"/><text x="${x(i)}" y="195" text-anchor="middle">${i}</text>`,
  ).join("");
  return `<svg class="song-diagram" viewBox="0 0 585 248" role="img" aria-label="Verse pitch contour. Horizontal distance is duration in short units; vertical height is modern playback pitch."><text x="18" y="19">Higher pitch</text>${ticks}${events.map((e, i) => `<g data-event="${e.syllable}-${e.pitch}-${i}" data-tone-syllable="${e.syllable}" data-tone-hz="${e.tone.hz}" class="song-tone ${e.syllable === state.syllable ? "selected-tone" : ""}"><line x1="${x(e.unitStart)}" x2="${x(e.unitStart + e.units) - 4}" y1="${y(e.pitch)}" y2="${y(e.pitch)}"/><circle cx="${x(e.unitStart)}" cy="${y(e.pitch)}" r="4"/><title>${at(SYLLABLES, e.syllable).greek}: ${modernPitch(e.pitch, state.root)}, ${e.units} short ${e.units === 1 ? "unit" : "units"}</title></g>`).join("")}<text x="300" y="235" text-anchor="middle">Elapsed short units</text></svg>`;
}
