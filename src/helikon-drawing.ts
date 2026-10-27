import {
  fraction,
  ft,
  HELIKON_SCOPE,
  type HelikonState,
  retuning,
  sourceInterval,
  sourceSegments,
  value,
} from "./core/helikon";

export const he = (text: unknown): string =>
  String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
export const hn = (n: number, digits = 3): string =>
  n.toLocaleString("en-US", { maximumFractionDigits: digits });
const ink = "#36275e",
  orange = "#a94116",
  line = "#afa3bc",
  pale = "#e3deeb";
const tx = (x: number, y: number, text: string, size = 20, fill = ink, anchor = "start") =>
  `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" text-anchor="${anchor}">${he(text)}</text>`;
const ln = (x: number, y: number, xx: number, yy: number, color = line, width = 1.5, dash = "") =>
  `<line x1="${x}" y1="${y}" x2="${xx}" y2="${yy}" stroke="${color}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ""}/>`;
const circle = (x: number, y: number, r = 4, fill = ink) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const start = (id: string, title: string, height = 580) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 ${height}" role="img" aria-labelledby="${id}"><title id="${id}">${he(title)}</title><g font-family="Plex, system-ui, sans-serif">`;
const end = "</g></svg>";
export function sourceBoard(s: HelikonState): string {
  const x = (t: number) => 100 + 400 * t,
    y = (t: number) => 70 + 400 * t;
  const h = (s.stage < 4 ? 12 : s.bridge) / 24,
    original = h === 0.5;
  const pair = sourceInterval(s),
    segments = sourceSegments({ ...s, bridge: h * 24 });
  let svg = start(
    "hk-source-title",
    `Helikon construction, stage ${s.stage + 1}. ${original ? "Source bridge" : "Altered bridge; fixed strings"}.`,
  );
  svg += `<rect x="100" y="70" width="400" height="400" fill="#fcfbf7" stroke="${line}"/>`;
  svg +=
    tx(100, 40, "A") +
    tx(500, 40, "B", 20, ink, "end") +
    tx(100, 505, "C") +
    tx(500, 505, "D", 20, ink, "end");
  if (s.stage >= 1) {
    svg += circle(x(0.5), y(0)) + tx(x(0.5), 40, "E", 20, ink, "middle");
    if (s.stage < 3 || !original)
      svg +=
        circle(x(1), y(0.5), 4, original ? ink : line) +
        tx(535, y(0.5) + 7, original ? "F" : "source F", original ? 20 : 14);
  }
  if (s.stage >= 2) {
    svg += ln(x(1), y(0), x(0), y(1), pale, 2, "7 6");
    svg += ln(x(0), y(0), x(1), y(h), orange, 4);
    if (s.stage === 2)
      svg += circle(x(2 / 3), y(1 / 3), 6, orange) + tx(x(2 / 3) + 12, y(1 / 3) + 24, "G");
  }
  if (s.stage >= 3) {
    for (const p of [0, 0.5, 2 / 3, 1]) svg += ln(x(p), y(0), x(p), y(1), ink, 2);
    svg +=
      tx(x(2 / 3) + 6, 40, "L") +
      tx(x(0.5), 505, "K", 20, ink, "middle") +
      tx(x(2 / 3) + 6, 505, "M");
    for (const [p, label] of [
      [0.5, "H"],
      [2 / 3, "G"],
      [1, "F"],
    ] as const)
      svg += circle(x(p), y(p * h), 5, orange) + tx(x(p) + 12, y(p * h) + 21, label, 18, orange);
  }
  if (s.stage === 4) {
    const geometries: Record<string, readonly [number, number, number]> = {
      AC: [0, 0, 1],
      HK: [0.5, h / 2, 1],
      GM: [2 / 3, (2 * h) / 3, 1],
      FD: [1, h, 1],
      BF: [1, 0, h],
      LG: [2 / 3, 0, (2 * h) / 3],
      EH: [0.5, 0, h / 2],
    };
    for (const p of segments) {
      const g = geometries[p.id];
      if (!g) continue;
      const [xx, lo, hi] = g,
        color = p.id === pair.a.id ? ink : p.id === pair.b.id ? orange : line;
      svg += `<g data-hk-segment="${p.id}">${ln(x(xx), y(lo), x(xx), y(hi), color, p.id === pair.a.id || p.id === pair.b.id ? 7 : 2.5)}${tx(x(xx) + (xx === 0 ? -18 : xx === 1 ? 35 : -13), y((lo + hi) / 2) + 6, ft(p.units), 21, color === line ? "#675e72" : color, xx === 1 ? "start" : "end")}</g>`;
    }
    svg += ln(x(0), y(0), x(1), y(h), orange, 3);
  }
  svg += tx(
    100,
    548,
    s.stage === 4
      ? original
        ? "Length units: AC = 12. One shared bridge: AF."
        : "Your alteration. Contact labels follow the bridge."
      : "Construction after Harmonics II.2; Latin diagram letters.",
    16,
  );
  return svg + end;
}
export function retuningBoard(s: HelikonState): string {
  const q = s.scale / 12,
    x = (t: number) => 100 + 400 * t,
    y = (t: number) => 70 + 400 * t;
  const points = retuning(s);
  let svg = start(
    "hk-retuning-title",
    `Four-string ${s.target} retuning experiment. ${points.filter((p) => p.matches).length} of four target notes agree.`,
  );
  svg += `<rect x="100" y="70" width="400" height="400" fill="#fcfbf7" stroke="${line}"/>`;
  for (const p of points) {
    const xx = x(value(p.x)),
      contact = 1 - value(p.length);
    svg +=
      ln(xx, y(0), xx, y(1), pale, 2) +
      ln(xx, y(contact), xx, y(1), p.matches ? ink : orange, 4) +
      circle(xx, y(contact), 5, p.matches ? ink : orange);
  }
  svg += ln(x(0), y(1 - q), x(1), y(1 - (3 * q) / 4), orange, 4);
  svg += tx(84, y(1 - q) + 6, "1", 18, ink, "end") + tx(518, y(1 - (3 * q) / 4) + 6, "4", 18);
  // Separate tracks preserve readable exact positions even when the strings nearly coincide.
  for (const p of points.slice(1, 3)) {
    const yy = p.index === 1 ? 515 : 552;
    svg += ln(100, yy, 500, yy, pale) + circle(x(value(p.x)), yy, 5, p.matches ? ink : orange);
    svg += ln(x(value(p.required)), yy - 9, x(value(p.required)), yy + 9, ink, 2);
    svg += tx(520, yy + 5, `${p.index + 1}: ${ft(p.x)}`, 15);
  }
  svg += tx(
    100,
    35,
    `Sounding length at left: ${ft(fraction(s.scale, 12))} of the full string`,
    16,
  );
  return svg + end;
}
export function sourceTable(s: HelikonState): string {
  const p = sourceInterval(s);
  return `<table><caption>Sounding lengths on both sides of the bridge · full string = 12</caption><thead><tr><th>Segment</th><th>Length</th><th>Pitch / full string</th><th>Hz</th></tr></thead><tbody>${sourceSegments(
    s,
  )
    .map(
      (r) =>
        `<tr${r.id === p.a.id || r.id === p.b.id ? ' class="hk-chosen"' : ""}><th>${r.id}</th><td>${ft(r.units)}</td><td>${ft(r.ratio)}</td><td>${hn(r.hz)}</td></tr>`,
    )
    .join("")}</tbody></table>`;
}
export function retuningTable(s: HelikonState): string {
  return `<table><caption>Actual and target frequency ratios share the current leftmost note as 1</caption><thead><tr><th>String</th><th>Position / width</th><th>Actual</th><th>Target</th><th>Error, cents</th></tr></thead><tbody>${retuning(
    s,
  )
    .map(
      (p) =>
        `<tr><th>${p.index + 1}${p.index === 0 || p.index === 3 ? " · end" : " · inner"}</th><td>${ft(p.x)}</td><td>${ft(p.actual)}</td><td>${ft(p.target)}</td><td>${p.matches ? "0 · exact" : `${p.centsError > 0 ? "+" : ""}${hn(p.centsError, 2)}`}</td></tr>`,
    )
    .join("")}</tbody></table>`;
}
export function retuningResult(s: HelikonState): string {
  const points = retuning(s),
    matches = points.filter((p) => p.matches).length;
  return matches === 4
    ? "All four notes agree exactly with the chosen ratios. The strings have moved; the bridge stays straight."
    : `${matches} of 4 target notes agree. The end notes fix the bridge line. Its two inner pitches still depend on where their strings cross it.`;
}
export function intervalResult(s: HelikonState): string {
  const p = sourceInterval(s);
  return `${p.a.id} → ${p.b.id}: frequency ratio ${ft(p.actual)} · ${hn(p.cents, 2)} cents. ${p.agrees ? `Agrees with the source’s ${ft(p.ratio)} ${p.label.toLowerCase()}.` : `The source’s ${p.label.toLowerCase()} is ${ft(p.ratio)}. This altered bridge gives a different interval.`}`;
}
export function helikonPlate(s: HelikonState, font: string, license: string): string {
  const source = sourceBoard(s).replace(
    '<svg xmlns="http://www.w3.org/2000/svg"',
    '<svg x="30" y="135" width="780" height="550" xmlns="http://www.w3.org/2000/svg"',
  );
  const target = retuningBoard(s).replace(
    '<svg xmlns="http://www.w3.org/2000/svg"',
    '<svg x="30" y="785" width="780" height="550" xmlns="http://www.w3.org/2000/svg"',
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="1440" viewBox="0 0 840 1440" role="img" aria-labelledby="hk-plate-title"><title id="hk-plate-title">Helikon: source geometry and the four-string retuning experiment</title><metadata>${he(HELIKON_SCOPE)}\n${he(license)}</metadata><style>@font-face{font-family:Plex;src:url('${font}') format('woff2')}text{font-family:Plex,sans-serif}</style><rect width="840" height="1440" fill="#faf9f5"/>${tx(40, 40, "PYKNON / PTOLEMY’S HELIKON", 16)}${tx(40, 85, "One bridge. Four strings.", 38)}${tx(40, 117, `${sourceInterval(s).a.id} → ${sourceInterval(s).b.id}: frequency ratio ${ft(sourceInterval(s).actual)} · ${hn(sourceInterval(s).cents, 2)} cents.`, 16)}${tx(40, 142, sourceInterval(s).agrees ? "Agrees with the source interval." : `Your alteration differs from the source ratio ${ft(sourceInterval(s).ratio)}.`, 14)}${source}${tx(40, 730, `Retuning: ${s.target}. ${retuning(s).filter((p) => p.matches).length} of 4 target notes agree.`, 23)}${tx(40, 766, `Inner positions ${ft(fraction(s.x1, 504))}, ${ft(fraction(s.x2, 504))}. Sounding scale ${ft(fraction(s.scale, 12))}. Reference ${s.reference} Hz.`, 16)}${target}${tx(40, 1380, "Source: Wallis 1682, pp.97–101; Archytas ratios: pp.62–63.", 16)}${tx(40, 1410, "Ideal geometry and sine tones; no ancient instrument or performance is reconstructed.", 15)}</svg>`;
}
