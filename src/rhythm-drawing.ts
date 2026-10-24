import {
  BETWEEN_FEET,
  chosen,
  type Foot,
  GENUS_NAMES,
  type RhythmState,
  reference,
} from "./core/rhythm";
export function rhEscape(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
const f = (x: number) => x.toFixed(2);
const UP = "#36275e",
  DOWN = "#176477",
  MUTED = "#675e72";
export const RHYTHM_SVG_CSS = `.rh-marker{transition:r .05s}.rh-marker.rh-sounding{stroke:#a94116;stroke-width:4;r:7}@media(prefers-reduced-motion:reduce){.rh-marker.rh-sounding{stroke-width:2;r:4}}`;
function scoreRow(
  foot: Foot,
  s: RhythmState,
  width: number,
  y: number,
  row: number,
  title: string,
): string {
  const left = 16,
    unit = (width - 32) / s.total,
    x = (n: number) => left + unit * n;
  let b = `<g data-rh-row="${row}"><text x="16" y="${y}" font-size="17" fill="${UP}">${title}</text><text x="16" y="${y + 25}" font-size="13" fill="${MUTED}">${foot.up} up + ${foot.down} down · ${foot.genus === "outside" ? "Other ratio" : GENUS_NAMES[foot.genus]}</text>`;
  b += `<rect x="16" y="${y + 42}" width="${f(unit * foot.up)}" height="30" fill="${UP}"/><rect x="${f(x(foot.up))}" y="${y + 42}" width="${f(unit * foot.down)}" height="30" fill="${DOWN}"/><text x="${f(x(foot.up / 2))}" y="${y + 62}" font-size="17" text-anchor="middle" fill="white">${foot.up}</text><text x="${f(x(foot.up + foot.down / 2))}" y="${y + 62}" font-size="17" text-anchor="middle" fill="white">${foot.down}</text>`;
  for (let i = 0; i <= foot.total; i++) {
    b += `<path d="M${f(x(i))} ${y + 75} V${y + 88}" stroke="#a9a0b4"/><text x="${f(x(i))}" y="${y + 106}" font-size="12" text-anchor="middle" fill="${MUTED}">${i}</text>`;
    if (i < foot.total && (s.texture === "units" || i === 0 || i === foot.up))
      b += `<circle class="rh-marker" data-unit="${i}" cx="${f(x(i))}" cy="${y + 123}" r="${i === 0 || i === foot.up ? 5 : 3}" fill="${i === 0 ? UP : i === foot.up ? DOWN : MUTED}"/>`;
  }
  return `${b}</g>`;
}
export function rhythmDrawing(s: RhythmState, width = 920): string {
  const w = Math.max(300, width);
  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 ${w} 328" width="${w}" height="328" style="max-width:100%;height:auto;font-family:Plex,Arial,sans-serif;background:white"><title>Same total duration, independently chosen division</title><desc>Reference: ${reference(s).up} up and ${reference(s).down} down. Chosen: ${s.up} up and ${s.total - s.up} down. Both span ${s.total} primary times, ${s.total * s.unitMs} milliseconds. Violet is up; teal is down. Dot attacks are modern signals.</desc><style>${RHYTHM_SVG_CSS}</style>${scoreRow(reference(s), s, w, 24, 0, "Reference")}${scoreRow(chosen(s), s, w, 190, 1, "Your foot")}</svg>`;
}
export function betweenDrawing(s: RhythmState, width = 920): string {
  const w = Math.max(300, width),
    unit = (w - 32) / 4,
    x = (n: number) => 16 + n * unit;
  let body = `<title>Three feet with their down portion held at two</title><desc>The up portion is one, an illustrative one and a half, or two. Each row begins with the fixed down portion. The intermediate value is a modern choice, and its numerical up-to-down ratio is three to four.</desc>`;
  BETWEEN_FEET.forEach((foot, row) => {
    const y = 24 + row * 128,
      selected = foot.id === s.between;
    body += `<g data-rh-row="${row}">${selected ? `<rect x="1" y="${y - 19}" width="${w - 2}" height="120" rx="4" fill="#f3f0f8"/>` : ""}<text x="16" y="${y}" font-size="15" fill="${UP}">${foot.id === "middle" ? "Midpoint illustration" : foot.up === 1 ? "One-time up portion" : "Two-time up portion"}${selected ? " · selected" : ""}</text><rect x="16" y="${y + 18}" width="${f(2 * unit)}" height="28" fill="${DOWN}"/><rect x="${f(x(2))}" y="${y + 18}" width="${f(foot.up * unit)}" height="28" fill="${UP}"/><text x="${f(x(1))}" y="${y + 37}" text-anchor="middle" font-size="15" fill="white">Down 2</text><text x="${f(x(2 + foot.up / 2))}" y="${y + 37}" text-anchor="middle" font-size="15" fill="white">Up ${foot.up === 1.5 ? "1½" : foot.up}</text><text x="16" y="${y + 70}" font-size="13" fill="${MUTED}">Up:down ${foot.upDown}; total ${foot.total} times = ${foot.total * 300} ms</text><circle class="rh-marker" data-unit="0" cx="16" cy="${y + 86}" r="4" fill="${DOWN}"/><circle class="rh-marker" data-unit="2" cx="${f(x(2))}" cy="${y + 86}" r="4" fill="${UP}"/></g>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 ${w} 396" width="${w}" height="396" style="max-width:100%;height:auto;font-family:Plex,Arial,sans-serif;background:white"><style>${RHYTHM_SVG_CSS}</style>${body}</svg>`;
}
export function rhythmTable(s: RhythmState): string {
  return `<table><caption>Both feet share a ${s.unitMs} ms modern unit. Ratio compares the larger portion with the smaller.</caption><thead><tr><th scope="col">Foot</th><th scope="col">Up / down</th><th scope="col">Total</th><th scope="col">Ratio</th><th scope="col">Genus in this fragment</th></tr></thead><tbody>${(
    [
      ["Reference", reference(s)],
      ["Your foot", chosen(s)],
    ] as const
  )
    .map(
      ([name, foot]) =>
        `<tr><th scope="row">${name}</th><td>${foot.up} / ${foot.down}</td><td>${foot.total} times<br/>${foot.total * s.unitMs} ms</td><td>${foot.ratio.join(":")}</td><td>${GENUS_NAMES[foot.genus]}</td></tr>`,
    )
    .join("")}</tbody></table>`;
}
export function betweenTable(): string {
  return `<table><caption>The second example fixes down at 2 × 300 ms. It is separate from the integer genus classifier.</caption><thead><tr><th scope="col">Up</th><th scope="col">Down</th><th scope="col">Up:down</th><th scope="col">Whole foot</th><th scope="col">Status</th></tr></thead><tbody>${BETWEEN_FEET.map((f) => `<tr><td>${f.up}</td><td>2</td><td>${f.upDown}</td><td>${f.total} times / ${f.total * 300} ms</td><td>${f.id === "middle" ? "Our numerical illustration of an intermediate size" : "Endpoint in the source's example"}</td></tr>`).join("")}</tbody></table>`;
}
