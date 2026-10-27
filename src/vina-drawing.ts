import codeNotice from "../LICENSE?raw";
import plexNotice from "../public/fonts/IBMPlex-OFL.txt?raw";
import { at } from "./core/tetrachord";
import {
  VINA_COUNTS,
  VINA_LONG,
  VINA_NAMES,
  type VinaState,
  vinaJSON,
  vinaMatches,
  vinaModel,
  vinaNearest,
} from "./core/vina";
export function ve(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
export const vn = (value: number, places = 2) =>
  Math.abs(value) < 1e-9 ? "0" : value.toFixed(places);
const ink = "#36275e",
  teal = "#176477",
  orange = "#a94116",
  muted = "#675e72";
export function vinaDrawing(s: VinaState, phone = false): string {
  const m = vinaModel(s),
    pairs = vinaMatches(s),
    w = phone ? 340 : 1040,
    h = phone ? 580 : 300;
  const nearest = vinaNearest(s);
  const axis = (c: number) => (phone ? 522 - (c + 250) * 0.29 : 64 + (c + 250) * 0.61);
  const xFixed = phone ? 116 : 0,
    xMoving = phone ? 242 : 0;
  let body = `<title>Two prepared pitch systems during a lowering</title><desc>Reference notes are violet; lowered notes are teal. Both use the same cents ruler. ${ve(`Total lowering ${vn(m.shift)} cents; chosen reference difference ${vn(m.p)} cents. Changing the preparation retunes both rows. The lower Ni is an octave copy. These are modern comparison rulers, not pictures of ancient instruments.`)}</desc>`;
  for (let c = -200; c <= 1200; c += 200) {
    const z = axis(c);
    body += phone
      ? `<path d="M65 ${z}H295" stroke="#e4dfeb"/><text x="54" y="${z + 4}" text-anchor="end" fill="${muted}" font-size="11">${c}</text>`
      : `<path d="M${z} 65V231" stroke="#e4dfeb"/><text x="${z}" y="269" text-anchor="middle" fill="${muted}" font-size="13">${c}</text>`;
  }
  body += phone
    ? `<text x="22" y="25" fill="${muted}" font-size="12">cents</text><text x="116" y="25" text-anchor="middle" fill="${ink}" font-size="13">Reference</text><text x="242" y="25" text-anchor="middle" fill="${teal}" font-size="13">Moving</text>`
    : `<text x="24" y="32" fill="${ink}" font-size="15">Reference instrument · your preparation</text><text x="24" y="185" fill="${teal}" font-size="15">Moving instrument · lowered ${vn(m.shift)} cents</text><text x="1015" y="291" text-anchor="end" fill="${muted}" font-size="12">modern cents</text>`;
  // Lower Ni is explicitly a copy in another octave, not another note category.
  const lowerNi = at(m.fixed, 6) - 1200,
    z = axis(lowerNi);
  body += phone
    ? `<circle cx="${xFixed}" cy="${z}" r="5" fill="white" stroke="${muted}"/><text x="${xFixed - 12}" y="${z + 4}" text-anchor="end" fill="${muted}" font-size="12">Ni↓</text>`
    : `<circle cx="${z}" cy="94" r="5" fill="white" stroke="${muted}"/><text x="${z}" y="76" text-anchor="middle" fill="${muted}" font-size="12">Ni↓</text>`;
  for (const p of pairs) {
    const c = at(m.moving, p.moving),
      q = axis(c);
    body += phone
      ? `<path data-vn-match="${p.moving}-${p.fixed}" d="M${xFixed} ${q}H${xMoving}" stroke="${teal}" stroke-width="2" stroke-dasharray="4 4"/>`
      : `<path data-vn-match="${p.moving}-${p.fixed}" d="M${q} 94V220" stroke="${teal}" stroke-width="2" stroke-dasharray="4 4"/>`;
  }
  const pa = axis(m.loweredPa);
  body += phone
    ? `<path d="M${xFixed - 6} ${pa}h12" stroke="${orange}" stroke-width="2"/><text x="${xFixed - 14}" y="${pa + 4}" text-anchor="end" fill="${orange}" font-size="11">Pa↓</text>`
    : `<path d="M${pa} 101v25" stroke="${orange}" stroke-width="2"/><text x="${pa}" y="146" text-anchor="middle" fill="${orange}" font-size="12">Pa↓</text>`;
  for (const [row, pitches] of [
    ["fixed", m.fixed],
    ["moving", m.moving],
  ] as const)
    for (const [i, c] of pitches.entries()) {
      const q = axis(c),
        selected = row === "moving" ? i === s.selected : i === nearest.fixed,
        colour = selected ? orange : row === "fixed" ? ink : teal;
      body += phone
        ? `<g data-vn-note="${row}-${i}" data-cents="${c}" data-hz="${at(row === "fixed" ? m.fixedHz : m.movingHz, i)}"><circle cx="${row === "fixed" ? xFixed : xMoving}" cy="${q}" r="${selected ? 7 : 5}" fill="${colour}"/><text x="${row === "fixed" ? xFixed + 13 : xMoving + 13}" y="${q + 4}" fill="${colour}" font-size="13">${at(VINA_NAMES, i)}</text></g>`
        : `<g data-vn-note="${row}-${i}" data-cents="${c}" data-hz="${at(row === "fixed" ? m.fixedHz : m.movingHz, i)}"><circle cx="${q}" cy="${row === "fixed" ? 94 : 220}" r="${selected ? 7 : 5}" fill="${colour}"/><text x="${q}" y="${row === "fixed" ? 76 : 246}" text-anchor="middle" fill="${colour}" font-size="15">${at(VINA_NAMES, i)}</text></g>`;
    }
  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" style="max-width:100%;height:auto;font-family:Plex,system-ui,sans-serif">${body}</svg>`;
}
export function vinaTable(s: VinaState): string {
  const m = vinaModel(s);
  return `<table><caption>Counts lie below their note. Hz and cents are modern model results.</caption><thead><tr><th scope="col">Note</th><th scope="col">Count below</th><th scope="col">Interval below · cents</th><th scope="col">Reference · Hz</th><th scope="col">Moving · Hz</th></tr></thead><tbody>${VINA_NAMES.map((name, i) => `<tr${s.selected === i ? ' class="vn-selected"' : ""}><th scope="row">${name} · <span lang="sa-Latn">${at(VINA_LONG, i)}</span></th><td>${at(VINA_COUNTS, i)}</td><td>${vn(at(m.gaps, i))}</td><td>${vn(at(m.fixedHz, i), 4)}</td><td>${vn(at(m.movingHz, i), 4)}</td></tr>`).join("")}</tbody></table>`;
}
export function vinaSvg(s: VinaState, font: string): string {
  const m = vinaModel(s);
  const drawing = vinaDrawing(s)
    .replace(/<svg[^>]*>/, '<g transform="translate(0,106)">')
    .replace(/<\/svg>$/, "</g>");
  return `<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 1040 520" width="1040" height="520"><title>Twenty-two counts, more than one tuning</title><metadata>${ve(vinaJSON(s))}\n${ve(codeNotice)}\n${ve(plexNotice)}</metadata><style>@font-face{font-family:Plex;src:url('${font}')}text{font-family:Plex,sans-serif}</style><rect width="1040" height="520" fill="#faf9f5"/><text x="24" y="43" fill="${ink}" font-size="28">Same matches. Different pitches.</text><text x="24" y="73" fill="${muted}" font-size="14">Chosen reference difference ${vn(m.p)} cents · lowering ${vn(m.shift)} cents · ${m.valid ? "ordered four-stage model" : "ordering fails"}</text>${drawing}<text x="24" y="440" fill="${ink}" font-size="15">Modern pure-fourth/fifth model, after Bernard Bel. Source counts: 4–3–2–4–4–3–2 below Sa–Ri–Ga–Ma–Pa–Dha–Ni.</text><text x="24" y="468" fill="${muted}" font-size="14">These rulers do not specify all twenty-two pitches, reconstruct an instrument or recover ancient performance.</text><text x="24" y="496" fill="${muted}" font-size="12">Sanskrit music theory / chapter 28 · Grosset 1888 pp.27–29 · Pyknon / MIT · font / OFL 1.1 · complete notices in metadata</text></svg>`;
}
