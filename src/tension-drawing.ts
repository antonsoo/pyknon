import { ratioText, SOURCE_WEIGHTS, type TensionState, tensionRows, value } from "./core/tension";
import { at } from "./core/tetrachord";
export function te(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
const INK = "#36275e",
  ORANGE = "#a94116",
  TEAL = "#176477",
  MUTED = "#675e72";
export function tensionDrawing(s: TensionState, width = 720): string {
  const w = Math.max(320, width),
    rows = tensionRows(s),
    space = (w - 32) / 4;
  let body = `<title>Four equal-length strings with hanging loads</title><desc>The vibrating length stays equal in all four columns. Hollow outlines mark the original loads 6, 8, 9 and 12; solid bars show your chosen loads. Rectangle height encodes relative load, not a weight’s real shape. Separate columns are a schematic comparison, not the text’s shared-peg fixture.</desc>`;
  rows.forEach((r, i) => {
    const x = 16 + space * (i + 0.5),
      selected = i === s.selected,
      bw = Math.min(54, space * 0.62),
      h = value(r.chosen) * 4,
      originalH = r.original * 4;
    const modePath = Array.from(
      { length: 33 },
      (_, j) =>
        `${j === 0 ? "M" : "L"}${(x - 8 * Math.sin((Math.PI * j) / 32)).toFixed(3)} ${(42 + (160 * j) / 32).toFixed(3)}`,
    ).join(" ");
    body += `<g data-ts-string="${i}"><text x="${x}" y="24" text-anchor="middle" fill="${selected ? ORANGE : INK}" font-size="${w < 440 ? 12 : 17}">${r.name}</text><path d="M${x - 17} 42 H${x + 17} M${x} 42 V202 M${x - 17} 202 H${x + 17}" stroke="${selected ? ORANGE : INK}" stroke-width="2" fill="none"/><path d="${modePath}" stroke="${TEAL}" stroke-width="1.2" fill="none" stroke-dasharray="3 3"/><path d="M${x} 202 V218" stroke="${INK}"/><rect data-ts-mass="${i}" x="${x - bw / 2}" y="218" width="${bw}" height="${h}" fill="${selected ? ORANGE : INK}" opacity=".85"/><rect x="${x - bw / 2 - 3}" y="218" width="${bw + 6}" height="${originalH}" fill="none" stroke="${MUTED}" stroke-dasharray="3 3"/><text x="${x}" y="365" text-anchor="middle" font-size="18" fill="${INK}">${ratioText(r.chosen)}</text><text x="${x}" y="388" text-anchor="middle" font-size="${w < 440 ? 11 : 14}" fill="${MUTED}">${r.yoursHz.toFixed(2)} Hz</text><circle data-ts-tone="${i}" cx="${x}" cy="410" r="4" fill="${TEAL}"/></g>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 ${w} 428" width="${w}" height="428" style="max-width:100%;height:auto;font-family:Plex,system-ui,sans-serif">${body}</svg>`;
}
export function tensionRuler(s: TensionState, width = 920): string {
  const w = Math.max(320, width),
    left = 18,
    right = w - 18,
    span = right - left,
    x = (c: number) => left + (span * c) / 1500,
    small = w < 600;
  let body = `<title>Three pitch comparisons on a fixed cents ruler</title><desc>The claimed pitches remain fixed. The ideal original weights give half each claimed interval in cents. Your weights change only the third row. One octave is 1200 cents; the axis always spans 0 to 1500.</desc>`;
  const kinds = [
    { key: "claimCents", name: "Account’s claim", color: INK },
    { key: "originalCents", name: "Original loads · ideal", color: MUTED },
    { key: "yoursCents", name: "Your loads · ideal", color: TEAL },
  ] as const;
  kinds.forEach((kind, idx) => {
    const y = 35 + idx * (small ? 130 : 108);
    body += `<text x="18" y="${y}" font-size="${small ? 15 : 17}" fill="${kind.color}">${kind.name}</text><path d="M18 ${y + 25} H${right}" stroke="#d9d2df"/>`;
    for (const c of [0, 300, 600, 900, 1200, 1500])
      body += `<path d="M${x(c)} ${y + 20} v10" stroke="#bcb2c7"/>`;
    tensionRows(s).forEach((r, i) => {
      const pos = r[kind.key],
        selected = i === s.selected;
      body += `<circle data-ts-pitch="${idx}-${i}" data-cents="${pos}" cx="${x(pos)}" cy="${y + 25}" r="${selected ? 6 : 4}" fill="${selected ? ORANGE : kind.color}"/>`;
      if (i === 0 || selected)
        body += `<text x="${x(pos)}" y="${y + (i % 2 ? 68 : 48)}" text-anchor="${i === 0 ? "start" : "middle"}" font-size="13" fill="${selected ? ORANGE : kind.color}">${i === 0 ? "0" : `${at(SOURCE_WEIGHTS, i)}: ${pos.toFixed(2)}`}</text>`;
    });
  });
  const axis = small ? 414 : 347;
  for (const c of [0, 300, 600, 900, 1200, 1500])
    body += `<text x="${x(c)}" y="${axis}" font-size="${small ? 10 : 12}" text-anchor="${c === 0 ? "start" : c === 1500 ? "end" : "middle"}" fill="${MUTED}">${c}</text>`;
  body += `<text x="18" y="${axis + 24}" font-size="13" fill="${MUTED}">Cents above the fixed six-unit string</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" width="${w}" height="${axis + 38}" viewBox="0 0 ${w} ${axis + 38}" style="max-width:100%;height:auto;font-family:Plex,system-ui,sans-serif">${body}</svg>`;
}
export function tensionTable(s: TensionState): string {
  return `<table><caption>All ratios compare with the fixed load 6 and ${s.root} Hz reference. Irrational frequencies are rounded, not exact fractions.</caption><thead><tr><th scope="col">Note</th><th scope="col">Source load</th><th scope="col">Claimed f/f₀</th><th scope="col">Original ideal f/f₀</th><th scope="col">Your load</th><th scope="col">Your ideal Hz</th><th scope="col">From target</th><th scope="col">Exact repair load</th></tr></thead><tbody>${tensionRows(
    s,
  )
    .map(
      (r) =>
        `<tr${r.index === s.selected ? ' class="ts-current"' : ""}><th scope="row">${r.name}</th><td>${r.original}</td><td>${ratioText(r.claimed)}</td><td>${r.index === 0 ? "1" : `√(${ratioText(r.idealSquared)})`}</td><td>${ratioText(r.chosen)}</td><td>${r.yoursHz.toFixed(6)}</td><td>${r.errorCents.toFixed(6)} cents</td><td>${ratioText(r.repaired)}</td></tr>`,
    )
    .join("")}</tbody></table>`;
}
export function tensionSvg(s: TensionState, font?: string): string {
  const svg = tensionDrawing(s);
  return svg.replace(
    "</desc>",
    `</desc>${font ? `<style>@font-face{font-family:Plex;src:url('${font}') format('woff2')}</style>` : ""}`,
  );
}
