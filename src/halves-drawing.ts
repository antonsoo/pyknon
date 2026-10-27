import {
  HALF_SOUNDS,
  type HalfState,
  halfAnalysis,
  halfCSV,
  halfJSON,
  halfPlan,
  METHODS,
  rat,
  ratText,
} from "./core/halves";
export const he = (x: unknown): string =>
  String(x).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );
const text = (x: number, y: number, t: string, cls = "") =>
  `<text x="${x}" y="${y}" text-anchor="middle" class="${cls}">${he(t)}</text>`;
const line = (x1: number, y1: number, x2: number, y2: number, cls = "") =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`;
const svg = (box: string, title: string, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" role="img" aria-label="${he(title)}" class="hf-drawing"><title>${he(title)}</title>${body}</svg>`;
export function halfPhoneIntervals(s: HalfState): string {
  const a = halfAnalysis(s),
    x0 = 24,
    w = 312,
    mid = x0 + (w * a.firstCents) / a.totalCents;
  return svg(
    "0 0 360 285",
    `First interval ${a.first}; second ${a.second}. Modern logarithmic pitch scale.`,
    `${text(180, 25, `${a.a}:${a.b} · ${a.totalCents.toFixed(4)} modern cents`, "caption")}${line(180, 55, 180, 181, "target")}<rect x="${x0}" y="80" width="${Math.max(0, mid - x0)}" height="56" class="first"/><rect x="${mid}" y="80" width="${Math.max(0, x0 + w - mid)}" height="56" class="second"/>${line(mid, 64, mid, 153, "selected")}${text(24, 166, "Low", "small")}${text(336, 166, "High", "small")}${text(180, 207, "Dashed: equal frequency ratios", "caption")}${text(90, 243, `First ${a.first}`, "phone-ratio")}${text(270, 243, `Second ${a.second}`, "phone-ratio")}${text(180, 279, "Logarithmic pitch spacing", "caption")}`,
  );
}
export function halfPhoneRuler(s: HalfState): string {
  const a = halfAnalysis(s),
    m =
      a.middle.kind === "root"
        ? Math.sqrt(Number(a.middle.square))
        : Number(a.middle.value.n) / Number(a.middle.value.d),
    pos = (n: number) => 24 + (312 * (n - a.A)) / (a.B - a.A),
    root = Math.sqrt(Number(a.product));
  let ticks = "";
  const step = Math.max(1, Math.ceil((a.B - a.A) / 6));
  for (let n = a.A; n <= a.B; n += step)
    ticks += line(pos(n), 91, pos(n), 101) + text(pos(n), 125, String(n), "small");
  if ((a.B - a.A) % step !== 0)
    ticks += line(336, 91, 336, 101) + text(336, 125, String(a.B), "small");
  return svg(
    "0 0 360 260",
    `Linear numerical ruler from ${a.A} to ${a.B}; selected middle ${a.middleText}.`,
    `${text(180, 25, `Numerical weights: ${a.A} to ${a.B}`, "caption")}${line(24, 96, 336, 96)}${ticks}${line(pos(root), 55, pos(root), 150, "target")}${line(pos(m), 63, pos(m), 112, "selected")}<circle cx="${pos(m)}" cy="63" r="4" class="marker"/>${text(180, 183, `Selected M = ${a.middleText}`, "phone-ratio")}${text(180, 216, `Equal-ratio target = √${a.product}`, "phone-ratio")}${text(180, 253, "Linear numerical spacing", "caption")}`,
  );
}
export function halfResponsiveIntervals(s: HalfState): string {
  return `<div class="hf-desktop">${halfIntervals(s)}</div><div class="hf-phone">${halfPhoneIntervals(s)}</div>`;
}
export function halfResponsiveRuler(s: HalfState): string {
  return `<div class="hf-desktop">${halfRuler(s)}</div><div class="hf-phone">${halfPhoneRuler(s)}</div>`;
}
export function halfIntervals(s: HalfState): string {
  const a = halfAnalysis(s),
    x0 = 70,
    w = 760,
    mid = x0 + (w * a.firstCents) / a.totalCents,
    target = x0 + w / 2;
  return svg(
    "0 0 900 330",
    `Outer interval ${a.a}:${a.b}. First interval ${a.first}; second ${a.second}. ${a.comparison === 0 ? "Equal ratios." : a.comparison > 0 ? "The first is larger." : "The first is smaller."}`,
    `${text(450, 30, `${a.a}:${a.b} · ${a.totalCents.toFixed(6)} modern cents`, "caption")}${line(target, 70, target, 225, "target")}<rect x="${x0}" y="100" width="${Math.max(0, mid - x0)}" height="60" class="first"/><rect x="${mid}" y="100" width="${Math.max(0, x0 + w - mid)}" height="60" class="second"/>${line(x0, 95, x0, 170)}${line(x0 + w, 95, x0 + w, 170)}${line(mid, 80, mid, 185, "selected")}${text(x0, 205, "Low")}${text(x0 + w, 205, "High")}${text(target, 249, "Dashed: the equal-ratio division", "caption")}${text(230, 295, `First · ${a.first}`)}${text(670, 295, `Second · ${a.second}`)}${text(450, 322, "Spacing is logarithmic in pitch. Exact signs below do not depend on drawing pixels.", "caption")}`,
  );
}
export function halfRuler(s: HalfState): string {
  const a = halfAnalysis(s),
    m =
      a.middle.kind === "root"
        ? Math.sqrt(Number(a.middle.square))
        : Number(a.middle.value.n) / Number(a.middle.value.d),
    x0 = 70,
    w = 760;
  const pos = (n: number) => x0 + (w * (n - a.A)) / (a.B - a.A);
  let ticks = "";
  const gap = a.B - a.A,
    step = Math.max(1, Math.ceil(gap / 12));
  for (let n = a.A; n <= a.B; n += step)
    ticks += line(pos(n), 104, pos(n), 116) + text(pos(n), 143, String(n), "small");
  if (gap % step !== 0)
    ticks += line(pos(a.B), 104, pos(a.B), 116) + text(pos(a.B), 143, String(a.B), "small");
  const root = Math.sqrt(Number(a.product));
  return svg(
    "0 0 900 245",
    `Linear number ruler from ${a.A} through ${a.B}; selected middle ${a.middleText}; geometric mean ${String(a.product)} under a square root.`,
    `${text(450, 30, `Numerical weights: ${a.A} to ${a.B}`, "caption")}${line(x0, 110, x0 + w, 110)}${ticks}${line(pos(root), 64, pos(root), 173, "target")}${line(pos(m), 73, pos(m), 128, "selected")}<circle cx="${pos(m)}" cy="73" r="5" class="marker"/>${text(450, 197, `Selected M = ${a.middleText}; equal-ratio target = √${a.product}`)}${text(450, 231, "This ruler is linear in the numbers. Scaling its labels does not change the outer ratio.", "caption")}`,
  );
}
export function halfTable(s: HalfState): string {
  const a = halfAnalysis(s);
  return `<table class="hf-table"><caption>The proposed split, with a modern ${s.reference} Hz starting pitch</caption><thead><tr><th>Part</th><th>Exact frequency ratio</th><th>Approx. ending Hz</th><th>Modern cents</th></tr></thead><tbody><tr><th>First interval</th><td>${he(a.first)}</td><td>${a.firstHz.toFixed(6)}</td><td>${a.firstCents.toFixed(6)}</td></tr><tr><th>Second, moved to the same starting pitch</th><td>${he(a.second)}</td><td>${a.secondHz.toFixed(6)}</td><td>${a.secondCents.toFixed(6)}</td></tr></tbody></table>`;
}
export function halfProof(s: HalfState): string {
  const a = halfAnalysis(s);
  return `<p>One proportional middle requires M/A = B/M. Multiplying through gives M² = AB. The midpoint on a linear numerical ruler instead satisfies 2M = A+B. Equal ideal string-length increments give 2/M = 1/A + 1/B.</p><p>The equal-ratio choice is M = √(AB). For ${a.a}:${a.b}, the first ratio is ${he(a.middle.kind === "root" && s.method === "ratio" ? a.first : `√(${a.a}/${a.b})`)}.</p>${a.superparticular ? `<p>In least terms this ratio is (${a.b}+1):${a.b}. If its square root were a ratio of whole numbers in lowest terms, both ${a.b + 1} and ${a.b} would have to be perfect squares. Two positive consecutive integers cannot both be squares: the gap between k² and (k+1)² is 2k+1, at least three.</p><p>This modern square argument covers bisection. The printed source uses least terms and a proportional-means lemma, and states the result for more means as well. Trying finitely many scales is an illustration, not a substitute for either argument.</p>` : `<p>9:4 is not a whole-plus-one-part ratio in least terms. Its endpoints 4 and 9 have the whole-number proportional mean 6: 6/4 = 9/6 = 3/2. This is outside III’s premise.</p>`}<p>A continuously chosen root and its finite oscillator approximation do not produce a proportional whole number where the numerical theorem excludes one.</p>`;
}
export async function halfSVG(
  s: HalfState,
  font: string,
  fontLicense: string,
  mit: string,
): Promise<string> {
  const a = halfAnalysis(s),
    strip = halfIntervals(s).replace(/<svg[^>]*>|<\/svg>/g, ""),
    ruler = halfRuler(s).replace(/<svg[^>]*>|<\/svg>/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="890" viewBox="0 0 1000 890"><title>Pyknon · three middles in one interval</title><desc>Modern numerical and acoustic illustration of Sectio canonis III and XVI. Exact squared values decide equality; coordinates and audio frequencies are approximate.</desc><metadata>${he(fontLicense)}\n${he(mit)}</metadata><style>@font-face{font-family:Plex;src:url('${font}') format('woff2')}text{font:18px Plex,sans-serif;fill:#36275e}.caption,.small{font-size:13px}line{stroke:#766b87;stroke-width:1}.target{stroke:#766b87;stroke-dasharray:5 4}.selected{stroke:#a94116;stroke-width:3}.first{fill:#d7cbe9;stroke:#75618f}.second{fill:#f1d1bb;stroke:#b3683b}.marker{fill:#a94116}</style><rect width="1000" height="890" fill="#faf9f5"/><text x="55" y="42" style="font-size:28px">Three middles. One interval.</text><g transform="translate(50 62)">${strip}</g><g transform="translate(50 412)">${ruler}</g><text x="65" y="720">${he(METHODS[s.method])}: M = ${he(a.middleText)}; endpoints ${a.A}, ${a.B}.</text><text x="65" y="755">M² = ${he(ratText(a.middleSquare))}; AB = ${a.product}. ${a.comparison === 0 ? "The ratios are equal." : a.comparison > 0 ? "The first ratio is larger." : "The first ratio is smaller."}</text><text x="65" y="795">Source: Sectio canonis III, XII–XIII, XVI · Menge, 1916 · new diagram, 2026.</text><text x="65" y="835">Numerical weights map to modern frequencies; this does not reconstruct a performance.</text><text x="65" y="868" class="caption">MIT · Anton Soloviev · https://antonsoo.github.io/pyknon/halves.html</text></svg>`;
}
export function halfNativeLinks(s: HalfState, svgData: string, wavData: string): string {
  return `<a download="pyknon-halves.json" href="data:application/json;charset=utf-8,${encodeURIComponent(halfJSON(s))}">Save editable JSON</a> · <a download="pyknon-halves.csv" href="data:text/csv;charset=utf-8,${encodeURIComponent(halfCSV(s))}">Save exact CSV</a> · <a download="pyknon-halves.svg" href="${svgData}">Save diagram SVG</a> · <a download="pyknon-halves.wav" href="${wavData}">Save listening WAV</a>`;
}
export function halfScheduleText(s: HalfState): string {
  const p = halfPlan(s);
  return `${HALF_SOUNDS[s.sound]}. ${p.tones.length} finite sine tones; total ${p.duration.toFixed(2)} seconds, with 20 ms attack and 60 ms release. This is a modern listening graph.`;
}
export function halfSquaredRatio(s: HalfState): string {
  const a = halfAnalysis(s);
  return ratText(rat(a.middleSquare.n, a.middleSquare.d * BigInt(a.A) * BigInt(a.A)));
}
