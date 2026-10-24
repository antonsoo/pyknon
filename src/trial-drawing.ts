import { at } from "./core/tetrachord";
import { modeShape, STRING_NAMES, stringPieces, type TrialState, trialResult } from "./core/trial";

export function trialDrawing(s: TrialState, narrow = false): string {
  const width = narrow ? 360 : 860,
    left = narrow ? 28 : 45,
    span = width - left * 2;
  const x = (v: number) => left + span * v;
  const r = trialResult(s),
    pieces = stringPieces(s.string, s.contrast);
  const font = narrow ? 12 : 17;
  const suffix = narrow ? "-phone" : "";
  const supports = new Set<number>([0, 1, ...r.spec.a, ...r.spec.b]);
  const marks: [number, string, string][] = [
    [0, "Ε", "0"],
    [0.5, "Κ", "½"],
    [0.75, "Λ", "¾"],
    [1, "Η", "1"],
  ];
  if (s.test === 2) marks.splice(3, 0, [0.875, "", "⅞"]);
  const line = (points: { x: number; y: number }[], base: number) =>
    points
      .map((p, i) => `${i ? "L" : "M"}${x(p.x).toFixed(4)},${(base - p.y * 30).toFixed(4)}`)
      .join(" ");
  const mode = (segment: readonly [number, number], base: number, name: string) => {
    const values = modeShape(pieces, ...segment);
    return `<g class="tr-mode tr-${name}" data-segment="${segment.join(":")}"><line x1="${x(segment[0])}" x2="${x(segment[1])}" y1="${base}" y2="${base}" class="tr-axis"/><path d="${line(values, base)}" data-points="${values.map((v) => `${v.x},${v.y}`).join(";")}"/><circle cx="${x(segment[0])}" cy="${base}" r="3"/><circle cx="${x(segment[1])}" cy="${base}" r="3"/></g>`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 395" role="img" aria-labelledby="tr-figure-title${suffix} tr-figure-desc${suffix}" data-narrow="${narrow}">
<title id="tr-figure-title${suffix}">${STRING_NAMES[s.string]}: ${r.spec.name}</title><desc id="tr-figure-desc${suffix}">Eight chosen mass-density cells. The selected equal-length sections A and B are marked on the same string. Below: calculated first-mode shapes, at an arbitrary vertical amplitude. ${r.same ? "The fundamentals agree." : "The fundamentals differ."}</desc>
<text x="${left}" y="22" font-size="${font}">Mass per unit length · relative to 1</text>
${pieces.map((p, i) => `<g data-cell="${i}" data-density="${p.density}"><rect x="${x(p.start) + 1}" y="${112 - p.density * 15}" width="${span / 8 - 2}" height="${p.density * 15}" class="${p.density > 1 ? "tr-heavy" : "tr-light"}"/><text x="${x((p.start + p.end) / 2)}" y="${101 - p.density * 15}" text-anchor="middle" font-size="${font - 1}">${p.density.toFixed(2).replace(/\.00$/, "")}</text></g>`).join("")}
<line x1="${left}" x2="${left + span}" y1="112" y2="112" class="tr-axis"/>
<text x="${left}" y="148" font-size="${font}">One string · fixed tension</text><line x1="${left}" x2="${left + span}" y1="181" y2="181" class="tr-whole"/>
${([r.spec.a, r.spec.b] as const).map((seg, i) => `<line x1="${x(seg[0])}" x2="${x(seg[1])}" y1="${i ? 189 : 175}" y2="${i ? 189 : 175}" class="tr-selected tr-${i ? "b" : "a"}"/><text x="${x((seg[0] + seg[1]) / 2)}" y="${i ? 210 : 168}" text-anchor="middle" font-size="${font}">${i ? "B" : "A"}</text>`).join("")}
${marks
  .map(
    ([pos, letter, fraction]) =>
      `${supports.has(pos) ? `<path d="M${x(pos)},179 l-5,15 h10 Z" class="tr-support" data-support="${pos}"/>` : `<line x1="${x(pos)}" x2="${x(pos)}" y1="195" y2="201" class="tr-axis" data-ruler-mark="${pos}"/>`}<text x="${x(pos)}" y="233" text-anchor="middle" font-size="${font}">${letter ? `${letter} · ` : ""}${fraction}</text>`,
  )
  .join("")}
<text x="${left}" y="273" font-size="${font}">First modes · arbitrary amplitude</text>
${mode(r.spec.a, 315, "a")}${mode(r.spec.b, 365, "b")}
<text x="${left - 13}" y="316" font-size="${font}">A</text><text x="${left - 13}" y="366" font-size="${font}">B</text></svg>`;
}

export function trialSvg(s: TrialState): string {
  return trialDrawing(s).replace("<title", `<style>${TRIAL_SVG_CSS}</style><title`);
}
export const TRIAL_SVG_CSS = `svg{font-family:Arial,sans-serif;color:#2c2538;background:#faf9f5}text{fill:#2c2538}.tr-light{fill:#d9d2df}.tr-heavy{fill:#9786ad}.tr-axis{stroke:#afa3bc;stroke-width:1}.tr-whole{stroke:#6d6478;stroke-width:2}.tr-a{stroke:#49336f;fill:#49336f}.tr-b{stroke:#a94116;fill:#a94116}.tr-selected{stroke-width:5}.tr-support{fill:#6d6478}.tr-mode path{fill:none;stroke-width:2.5}`;

export function trialTable(s: TrialState): string {
  return `<table><caption>All three comparisons · ${STRING_NAMES[s.string]}, heavy density ${s.contrast.toFixed(2)}</caption><thead><tr><th>Test</th><th>A · Hz</th><th>B · Hz</th><th>B − A · cents</th><th>Result</th></tr></thead><tbody>${[
    0, 1, 2,
  ]
    .map((i) => {
      const r = trialResult(s, i);
      return `<tr class="${s.test === i ? "tr-current" : ""}"><th>${at(["Halves", "Quarters", "Extra eighths"], i)}</th><td>${r.aHz.toFixed(6)}</td><td>${r.bHz.toFixed(6)}</td><td>${Math.abs(r.differenceCents) < 1e-7 ? "0.000000" : r.differenceCents.toFixed(6)}</td><td>${r.same ? "Same pitch" : "Different pitch"}</td></tr>`;
    })
    .join("")}</tbody></table>`;
}
