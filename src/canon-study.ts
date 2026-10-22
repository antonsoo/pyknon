import canonCss from "./canon.css?raw";
import {
  CANON_ARCHIVE,
  CANON_PAGES,
  CANON_PASSAGE,
  CANON_WORDS,
  SOUND_LABELS,
} from "./canon-content";
import { canonDetail, canonRoute } from "./canon-drawing";
import { type CanonState, canonComparison, canonQuery, canonSteps } from "./core/canon";
import { at } from "./core/tetrachord";

async function dataUrl(path: string, mime: string): Promise<string> {
  const response = await fetch(`${import.meta.env.BASE_URL}${path}`);
  if (!response.ok) throw new Error(`Could not load ${path}`);
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000)
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return `data:${mime};base64,${btoa(binary)}`;
}
export async function canonStudy(s: CanonState): Promise<string> {
  const [font, ...images] = await Promise.all([
    dataUrl("fonts/NotoSerif-Regular.ttf", "font/ttf"),
    ...CANON_PAGES.map((p) => dataUrl(`sources/canon/menge-${p}.jpg`, "image/jpeg")),
  ]);
  const steps = canonSteps(s.root),
    v = at(steps, s.step),
    end = canonComparison(s.root);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pyknon · Six tones · step ${s.step} · ${s.root} Hz</title><style>
@font-face{font-family:Noto;src:url('${font}') format('truetype')} :root{--ink:#36275e;--muted:#675e72;--line:#d9d2df;--paper:#fff}*{box-sizing:border-box}body{max-width:1000px;padding:24px;margin:auto;color:#2c2538;font:16px/1.6 system-ui,sans-serif}h1,h2,h3{line-height:1.2;color:var(--ink);font-weight:400}h1{font-size:42px}[lang=grc]{font-family:Noto,Georgia,serif}a{color:var(--ink)}table{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums}th,td{text-align:left;padding:8px;border-bottom:1px solid var(--line);font-size:13px}figure{margin:0}.table-scroll{overflow:auto}.eyebrow,.quiet{color:var(--muted);font-size:13px}.study-passage{margin:24px 0;padding-top:18px;border-top:1px solid var(--line)}.study-passage p{margin:12px 0}.study-scan img{width:100%;height:auto}.study-scan{margin:28px auto;max-width:700px}.study-scan figcaption{font-size:13px}dt{font-weight:600}dd{margin:5px 0 20px}.selected{background:#eee9f5}footer{font-size:13px;border-top:1px solid var(--line);padding-top:16px}
${canonCss}
@page{size:A4;margin:14mm}@media print{body{padding:0;font-size:11pt}h1{font-size:30pt}h2,h3{break-after:avoid}.study-scan{break-before:page;break-inside:avoid;max-width:none;margin:0}.study-scan img{max-height:235mm;width:auto;max-width:100%;display:block;margin:auto}.study-passage,table{break-inside:avoid}.table-scroll{overflow:visible}.route-wide{display:block}.route-phone{display:none}a{color:inherit;text-decoration:none}}
</style></head><body><header><p class="eyebrow">PYKNON / SAVED ILLUSTRATED READING</p><h1>Six tones and an octave</h1><p>Selected step ${s.step} (${v.letter}), modern starting reference ${s.root} Hz. Selected sound: ${SOUND_LABELS[s.sound]}. The audio is available as a separate WAV.</p></header>
<figure class="canon-route"><div class="route-wide">${canonRoute(s)}</div><div class="route-phone">${canonRoute(s, true)}</div><figcaption>Purple: successive 9:8 tones. Outlined: six equal divisions of a 2:1 octave. Numbers count intervals from zero.</figcaption></figure>
<div class="canon-readout"><div class="canon-detail"><p>Selected pair · enlarged scale</p>${canonDetail(s)}</div><div><p>9:8 route: <strong>${v.ratioHz.toFixed(6)} Hz</strong>; equal route: <strong>${v.equalHz.toFixed(6)} Hz</strong>.</p><p>Difference: ${v.differenceCents.toFixed(6)} cents and ${v.beatHz.toFixed(6)} Hz. Simultaneous sine tones give this many amplitude beats per second in the generated signal; the control uses two identical equal-route tones.</p></div></div>
<h2>Seven numbers, six multiplications</h2><p>Α–Η label the proof’s numbers. They form a progression, each 9:8 of its predecessor. We realize their ratios as increasing frequencies. They are not labeled as string lengths. Frequencies and cents below are rounded modern calculations.</p><div class="table-scroll"><table><caption>Menge 1916, printed p. 171, proposition IX; selected row highlighted</caption><thead><tr><th>Step / letter</th><th>Source integer</th><th>Exact ratio to Α</th><th>9:8 Hz</th><th>Equal Hz</th><th>Difference (¢)</th></tr></thead><tbody>${steps.map((r) => `<tr class="${r.step === s.step ? "selected" : ""}"><th>${r.step} / ${r.letter}</th><td>${r.source}</td><td>${r.ratio.join("/")}</td><td>${r.ratioHz.toFixed(6)}</td><td>${r.equalHz.toFixed(6)}</td><td>${r.differenceCents.toFixed(6)}</td></tr>`).join("")}</tbody></table></div><p><strong>531441 &gt; 2 × 262144 = ${end.octaveInteger}.</strong> The excess is ${end.excessInteger}. Dividing by the octave gives ${end.comma.join("/")}, or ${end.differenceCents.toFixed(6)} cents, commonly called the Pythagorean comma.</p><p>Six modern 200-cent steps close the octave by changing each step to 2^(1/6), approximately 1.122462. The source's 9/8 is 1.125. Modern algebra also gives the same comma from twelve 3:2 fifths compared with seven octaves: (3/2)^12 ÷ 2^7 = ${end.fifthsComma.join("/")}. This connection is an explanation added here, not a quotation from IX.</p>
<h2>Read proposition XIV</h2><p>The work is transmitted under Euclid's name; authorship is not settled here. Greek text and Latin translation: Heinrich Menge, <i>Euclidis opera omnia</i> VIII (Leipzig, 1916), pp. 174–175. English translations and notes are new. The selected app sentence was ${s.passage + 1}; every sentence is included below.</p>${CANON_PASSAGE.map((p, i) => `<article class="study-passage ${i === s.passage ? "selected" : ""}"><h3>${p.label}</h3><p lang="grc">${p.greek}</p><p lang="la">${p.latin}</p><p>${p.english}</p><p class="quiet">${p.note}</p></article>`).join("")}<h2>Four words in the argument</h2><dl>${CANON_WORDS.map((w) => `<dt><span lang="grc">${w.greek}</span> · ${w.roman} · <span lang="la">${w.latin}</span> · ${w.english}</dt><dd>${w.note}</dd>`).join("")}</dl>
<footer><p><a href="https://antonsoo.github.io/pyknon/canon.html${canonQuery(s)}#canon">Open this comparison</a> · <a href="${CANON_ARCHIVE}">Complete scanned edition</a> · <a href="https://github.com/antonsoo/pyknon">Code and source credits</a>.</p><p>Ratios multiply and cents add. Equal octave divisions are a modern comparison; no ancient absolute pitch, performance or instrument timbre is reconstructed. The six complete source pages and Greek font below are embedded in this document. It opens and prints offline.</p></footer>
${CANON_PAGES.map((p, i) => `<figure class="study-scan"><img src="${at(images, i)}" alt="Menge 1916, complete printed page ${p}"/><figcaption>Menge 1916, printed p. ${p}; ${p % 2 ? "Latin translation" : "Greek text"}. Public-domain edition, Internet Archive California scan, PDF p. ${p + 58}.</figcaption></figure>`).join("")}</body></html>`;
}
