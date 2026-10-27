import {
  fraction,
  ft,
  HELIKON_SCOPE,
  type HelikonState,
  helikonCSV,
  helikonJSON,
  validateHelikon,
} from "./core/helikon";
import { HELIKON_SOURCES, helikonBytes, helikonCaption, helikonData } from "./helikon-assets";
import { HELIKON_LETTERS, HELIKON_READINGS } from "./helikon-content";
import {
  he,
  helikonPlate,
  intervalResult,
  retuningBoard,
  retuningResult,
  retuningTable,
  sourceBoard,
  sourceTable,
} from "./helikon-drawing";

export async function helikonStudy(
  input: HelikonState,
  pairSound: Blob,
  tuningSound: Blob,
): Promise<string> {
  const s = validateHelikon(input);
  const [fontBytes, semiBytes, greekBytes, plexLicense, notoLicense, mit, ...imageBytes] =
    await Promise.all([
      helikonBytes("fonts/IBMPlexSans-Regular.woff2"),
      helikonBytes("fonts/IBMPlexSans-SemiBold.woff2"),
      helikonBytes("fonts/NotoSerif-Regular.ttf"),
      helikonBytes("fonts/IBMPlex-OFL.txt"),
      helikonBytes("fonts/NotoSerif-OFL.txt"),
      helikonBytes("sources/helikon/LICENSE.txt"),
      ...HELIKON_SOURCES.pages.map((p) => helikonBytes(p.file)),
    ]);
  const font = await helikonData(fontBytes, "font/woff2"),
    semi = await helikonData(semiBytes, "font/woff2"),
    greek = await helikonData(greekBytes, "font/ttf");
  const decode = (b: ArrayBuffer) => new TextDecoder().decode(b);
  const [pair, target, ...images] = await Promise.all([
    helikonData(pairSound, "audio/wav"),
    helikonData(tuningSound, "audio/wav"),
    ...imageBytes.map((b) => helikonData(b, "image/jpeg")),
  ]);
  const svg = helikonPlate(s, font, `${decode(plexLicense)}\n${decode(mit)}`);
  const native = (text: string, mime: string) =>
    `data:${mime};charset=utf-8,${encodeURIComponent(text)}`;
  const passages = HELIKON_READINGS.map(
    (p, i) =>
      `<article class="reading"><p class="eyebrow">READING ${i + 1} / WALLIS 1682 / PRINTED P.${p.page}</p><h2>${he(p.title)}</h2><p lang="grc">${he(p.greek)}</p><p lang="la">${he(p.latin)}</p><p class="english">${he(p.english)}</p><p>${he(p.note)}</p><dl>${p.words.map(([g, l, meaning, job]) => `<dt><span lang="grc">${he(g)}</span> · <span lang="la">${he(l)}</span></dt><dd><strong>${he(meaning)}.</strong> ${he(job)}</dd>`).join("")}</dl><p><a href="#source-${p.page}">Whole printed page ${p.page}</a>.</p></article>`,
  ).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; media-src data:; base-uri 'none'"><title>Pyknon · helikon · retained experiment</title><style>
@font-face{font-family:Plex;src:url('${font}') format('woff2')}@font-face{font-family:Plex;font-weight:600;src:url('${semi}') format('woff2')}@font-face{font-family:Noto;src:url('${greek}') format('truetype')}*{box-sizing:border-box}body{max-width:980px;margin:auto;padding:35px;font:16px/1.65 Plex,sans-serif;background:#faf9f5;color:#2c2538}h1,h2,h3{font-weight:400;color:#36275e;line-height:1.12}h1{font-size:52px;letter-spacing:-.04em}h2{font-size:30px;margin-top:30px}h3{font-size:23px}a{color:#36275e}p{margin:0 0 1em}.eyebrow{font-size:11px;letter-spacing:.08em}svg{display:block;width:100%;height:auto;max-width:620px;margin:auto}.diagram{background:#f3efe6;margin:25px 0}.reading{border-top:1px solid #d9d2df;padding-top:22px;margin-top:40px}[lang=grc]{font-family:Noto,serif;font-size:22px;line-height:1.85}[lang=la]{font-family:Noto,serif;font-size:18px;font-style:italic;line-height:1.8}.english{font-size:20px}dt{margin-top:17px;font-weight:600}dd{margin:7px 0 20px}.table{overflow:auto}table{width:100%;border-collapse:collapse;font-size:14px}caption{text-align:left;font-size:13px;padding:12px 0}td,th{padding:10px;border-bottom:1px solid #d9d2df;text-align:left;white-space:nowrap}.hk-chosen{background:#eee8f7}.letters td,.letters th{white-space:normal;font-size:14px;padding:7px}.result{border-left:3px solid #a94116;padding:16px;background:#fcf5ef}.limits{font-size:13px;color:#675e72}.digest{overflow-wrap:anywhere}.links{display:flex;flex-wrap:wrap;gap:12px;font-size:14px;margin:25px 0}audio{width:100%;max-width:600px;display:block;margin:20px 0}.source{margin:35px 0}.source img{display:block;width:100%;height:auto}figcaption{font-size:12px}pre{font-size:11px;white-space:pre-wrap;overflow-wrap:anywhere}.proof{font:21px/1.8 Noto,serif}.licenses{margin-top:30px}@media(max-width:600px){body{padding:18px}h1{font-size:39px}h2{font-size:28px}table{font-size:12px}th,td{padding:9px 7px}[lang=grc]{font-size:20px}.letters{overflow:auto}.letters table{min-width:500px}.links{display:block}.links a{display:block;line-height:2}}@page{size:A4;margin:16mm}@media print{body{padding:0;background:white;font-size:10pt}h1{font-size:30pt}h2{font-size:19pt;break-after:avoid}h3{font-size:14pt}.diagram{break-inside:avoid}svg{max-height:150mm;width:100%}.plate,.reading,.source{break-before:page}.reading{border:0;padding-top:0;margin-top:0}.reading h2{margin-top:12px}[lang=grc]{font-size:13pt}[lang=la]{font-size:11pt}.english{font-size:12pt}.source{break-inside:avoid;margin:0}.source img{max-height:242mm;object-fit:contain}figcaption{font-size:8pt}.table{overflow:visible}table{font-size:8pt}th,td{padding:7px}.letters table{min-width:0}.limits{font-size:8pt}.proof{font-size:12pt}.links{font-size:8pt;display:block}.links a{margin-right:15px}.licenses,audio{display:none}a{color:inherit}}
</style></head><body><p class="eyebrow">PYKNON / PTOLEMY, HARMONICS II.2 / RETAINED EXPERIMENT</p><h1>One bridge.<br>Four strings.</h1><p>Build the source’s geometry, hear its network of consonances, then retune two inner strings while keeping the end interval fixed. This document retains the experiment captured when you pressed Save.</p><p class="limits">${he(HELIKON_SCOPE)}</p><nav class="links" aria-label="Native experiment files"><a download="pyknon-helikon.json" href="${native(helikonJSON(s), "application/json")}">Editable JSON</a><a download="pyknon-helikon.csv" href="${native(helikonCSV(s), "text/csv")}">Exact CSV</a><a download="pyknon-helikon.svg" href="${native(svg, "image/svg+xml")}">Diagram SVG</a><a download="pyknon-helikon.wav" href="${target}">Retuning WAV</a><a download="pyknon-helikon-interval.wav" href="${pair}">Interval WAV</a></nav>
<h2>The source board and your bridge</h2><p>Construction stage ${s.stage + 1}. Right bridge contact ${ft(fraction(s.bridge, 24))} of the full height. Full-string reference ${s.reference} Hz. The initial square and four string positions follow the source’s first figure; altered contacts keep those strings fixed.</p><div class="diagram">${sourceBoard(s)}</div><p class="result">${he(intervalResult(s))}</p><audio controls preload="none" src="${pair}"></audio><p>The interval sound plays the selected first segment, then the second, using their current modeled frequencies. No ancient timbre is inferred.</p><div class="table">${sourceTable(s)}</div><p>Seven nonzero segments have six distinct lengths at the source setting: BF and FD are both 6. The number labels use a full string of length 12, without choosing an ancient unit or a physical size.</p>
<section class="plate"><h2>Keep the ends; move the inner strings</h2><p>Target: ${s.target}. Inner positions ${ft(fraction(s.x1, 504))} and ${ft(fraction(s.x2, 504))} of the width. Leftmost sounding length q = ${ft(fraction(s.scale, 12))} of the full string.</p><div class="diagram">${retuningBoard(s)}</div><p class="result">${he(retuningResult(s))}</p><div class="table">${retuningTable(s)}</div><audio controls preload="none" src="${target}"></audio><p>The sound plays your four notes from left to right, pauses, then plays the four target notes. Both sequences use the same current leftmost pitch. The target ratios come from the Archytas report in I.13, retained here on pp.62–63. Sine oscillators make the ratios audible; they establish no ancient performance or physical instrument response.</p></section>
<section class="plate"><h2>The line fixes more than its ends</h2><p>With a fourth between the two end notes, their sounding lengths are q and 3q/4. A straight bridge between the fixed end contacts leaves no independent height for the two inner contacts.</p><p class="proof">Sounding length = q(1 − x/4)<br>Frequency / left note = 1/(1 − x/4)<br>Required x = 4(1 − 1/target ratio)</p><p>The original positions 1/2 and 2/3 necessarily give ratios 8/7 and 6/5. Shortening q raises every pitch by the same factor; interval ratios and errors stay fixed. Moving the two strings can change those ratios. Our exact ruler has 504 equal parts, chosen to represent all three targets’ required positions without rounding. It is a modern numerical convenience.</p><p>Ptolemy’s II.2 extension uses a longer construction and an octachord, with a common movable support. This is a reduced four-string analogy using a fourth as its end interval, rather than his full construction. His comparison on pp.100–101 also discusses the practical burden of moving strings and changing their separations. The model omits retensioning, coupling, support thickness and finger reach.</p><div class="letters"><table><caption>Greek printed letters and Wallis’s Latin diagram labels</caption><tbody><tr><th>Greek</th>${HELIKON_LETTERS.map(([g]) => `<td lang="grc">${g}</td>`).join("")}</tr><tr><th>Latin</th>${HELIKON_LETTERS.map(([, l]) => `<td>${l}</td>`).join("")}</tr></tbody></table></div><h2>Readings and transcription</h2><p>Six excerpts from Wallis’s 1682 edition, prepared against the retained images. Greek lowercase segment letters have their bars omitted. Line breaks, end-of-line hyphens, Latin ligatures and long s are normalized. Each reading identifies whether it is a sentence or a selected phrase. Wallis’s Latin is an early modern translation. New English and contextual notes have not received independent philological review.</p></section>${passages}
<h2>Whole printed evidence</h2><p>The pages retain their figures, notes and critical apparatus. The source PDF has ${HELIKON_SOURCES.pdfBytes} bytes; SHA-256 <span class="digest">${HELIKON_SOURCES.pdfSha256}</span>. These eight complete JPEGs and all fonts and licenses were verified by byte length and SHA-256 before embedding.</p>${HELIKON_SOURCES.pages.map((p, i) => `<figure class="source" id="source-${p.id}"><img src="${images[i]}" alt="${he(helikonCaption(p.id))}" width="${p.width}" height="${p.height}"><figcaption>${he(helikonCaption(p.id))}</figcaption></figure>`).join("")}
<section class="plate"><h2>Editable record and attribution</h2><pre id="saved-state">${he(helikonJSON(s))}</pre><p class="limits">${he(HELIKON_SCOPE)} The PDF produced from this document is untagged; physical printing and an instrument built from these dimensions have not been tested.</p><p><a href="${HELIKON_SOURCES.catalogue}">Complete source edition</a> · <a href="https://antonsoo.github.io/pyknon/helikon.html">Interactive workshop</a> · <a href="https://github.com/antonsoo/pyknon/blob/main/docs/helikon-model.md">Model and source decisions</a>.</p><p>This document has no scripts or automatic remote asset requests. Native downloads and embedded audio remain available without scripts. External links need a connection.</p><p>New code, diagrams and English: MIT, Copyright (c) 2026 Anton Soloviev. Ancient text and Wallis 1682 pages: public domain in the United States. IBM Plex Sans and Noto Serif: SIL OFL 1.1.</p><details class="licenses"><summary>Complete code and font licenses</summary><pre>${he(decode(mit))}\n${he(decode(plexLicense))}\n${he(decode(notoLicense))}</pre></details></section></body></html>`;
}
