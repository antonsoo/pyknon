import fontNotice from "../public/fonts/NotoSerif-OFL.txt?raw";
import { at } from "./core/tetrachord";
import { STRING_NAMES, type TrialState, trialCsv, trialQuery, trialResult } from "./core/trial";
import { TRIAL_ASSETS } from "./trial-assets";
import { TRIAL_ARCHIVE, TRIAL_PAGES, TRIAL_PASSAGES, TRIAL_QUESTIONS } from "./trial-content";
import { TRIAL_SVG_CSS, trialDrawing, trialSvg, trialTable } from "./trial-drawing";

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
async function dataUrl(bytes: ArrayBuffer | Blob, mime: string): Promise<string> {
  const data = new Uint8Array(bytes instanceof Blob ? await bytes.arrayBuffer() : bytes);
  let text = "";
  for (let i = 0; i < data.length; i += 0x8000)
    text += String.fromCharCode(...data.subarray(i, i + 0x8000));
  return `data:${mime};base64,${btoa(text)}`;
}
async function verifiedAsset(file: string, mime: string): Promise<string> {
  const asset = TRIAL_ASSETS.find((a) => a.file === file);
  if (!asset) throw new Error("Unknown source asset");
  const response = await fetch(`${import.meta.env.BASE_URL}${file}`);
  if (!response.ok) throw new Error("Source asset unavailable");
  const bytes = await response.arrayBuffer();
  const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  if (hash !== asset.sha256) throw new Error("Source asset does not match this edition");
  return dataUrl(bytes, mime);
}
export async function trialStudy(s: TrialState, wav: Blob): Promise<string> {
  const [font, sound, ...images] = await Promise.all([
    verifiedAsset("fonts/NotoSerif-Regular.ttf", "font/ttf"),
    dataUrl(wav, "audio/wav"),
    ...TRIAL_PAGES.map((p) => verifiedAsset(`sources/trial/wallis-${p}.jpg`, "image/jpeg")),
  ]);
  const r = trialResult(s),
    csv = `data:text/csv;charset=utf-8,${encodeURIComponent(trialCsv(s))}`;
  const diagram = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(trialSvg(s))}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; font-src data:; img-src data:; media-src data:; base-uri 'none'"><title>Pyknon · ${STRING_NAMES[s.string]} · string trial</title><style>
@font-face{font-family:Noto;src:url('${font}') format('truetype')}*{box-sizing:border-box}body{max-width:980px;padding:28px;margin:auto;color:#2c2538;background:#faf9f5;font:16px/1.6 system-ui,sans-serif}h1,h2,h3{color:#36275e;line-height:1.2;font-weight:400}h1{font-size:clamp(30px,6vw,48px)}h2{margin-top:40px}a{color:#36275e}svg{width:100%;height:auto}figure{margin:20px 0}figcaption,.quiet{font-size:13px;color:#675e72}table{border-collapse:collapse;width:100%;font-size:13px;font-variant-numeric:tabular-nums}caption{text-align:left}td,th{text-align:left;padding:8px;border-bottom:1px solid #d9d2df}.table-scroll{overflow:auto}.tr-current{background:#eee9f5}.tr-full-passage{border-top:1px solid #d9d2df;padding-top:15px;margin:28px 0}[lang=grc]{font-family:Noto,Georgia,serif;font-size:1.25em}[lang=la]{font-style:italic}.tr-phone{display:none}.tr-links{display:flex;gap:20px;flex-wrap:wrap}.tr-scan img{width:100%;height:auto}.tr-scan{max-width:700px;margin:35px auto}audio{width:100%;max-width:480px}.tr-hash{font-size:10px;overflow-wrap:anywhere}pre{white-space:pre-wrap;font-size:11px}footer{border-top:1px solid #d9d2df;margin-top:32px;font-size:13px}.tr-equation{font-size:18px}dt{font-weight:600}dd{margin:8px 0 24px}
${TRIAL_SVG_CSS}
@media(max-width:600px){body{padding:18px}.tr-wide{display:none}.tr-phone{display:block}}
@page{size:A4;margin:14mm}@media print{body{padding:0;background:#fff;font-size:11pt}h1{font-size:30pt}h2,h3{break-after:avoid}.tr-wide{display:block}.tr-phone{display:none}.tr-scan{break-before:page;break-inside:avoid;max-width:none;margin:0}.tr-scan img{display:block;max-height:223mm;max-width:100%;width:auto;margin:auto}.tr-full-passage,table{break-inside:avoid}.table-scroll{overflow:visible}.tr-links,audio,.tr-font-license{display:none}a{color:inherit;text-decoration:none}svg{max-height:100mm}}
</style></head><body><header><p class="quiet">PYKNON / SAVED SOURCE & LISTENING PACKET</p><h1>Equal lengths. Unequal notes.</h1><p>${STRING_NAMES[s.string]} · heavy density ${s.contrast.toFixed(2)} · uniform whole-string reference ${s.root} Hz · selected test ${s.test + 1}: ${r.spec.name}.</p></header>
<figure><div class="tr-wide">${trialDrawing(s)}</div><div class="tr-phone">${trialDrawing(s, true)}</div><figcaption>Eight chosen mass-density cells. The selected parts have equal length and fixed ideal tension. Triangles mark active supports; ticks mark unused ruler positions. First-mode amplitudes are arbitrary. Greek Η (eta) corresponds to G in Wallis’s Latin diagram; Λ to L.</figcaption></figure>
<h2>${r.same ? "These two fundamentals agree." : "These equal lengths sound different."}</h2><p>A: <strong>${r.aHz.toFixed(6)} Hz</strong>; B: <strong>${r.bHz.toFixed(6)} Hz</strong>. B minus A: ${r.same ? "0.000000" : r.differenceCents.toFixed(6)} cents. A computed agreement at one division does not prove uniform mass everywhere.</p><audio controls preload="none" src="${sound}"></audio><p class="quiet">Embedded sound: ${s.sound === "compare" ? "A, then B" : s.sound === "control" ? "two identical A tones together" : "A and B together"}. Generated sine fundamentals; no recovered ancient performance or timbre. The control duplicates A even when the selected B has a different frequency.</p><div class="tr-links"><a download="pyknon-string-trial.wav" href="${sound}">Save WAV</a><a download="pyknon-string-trial.csv" href="${csv}">Save exact CSV</a><a download="pyknon-string-trial.svg" href="${diagram}">Save diagram SVG</a></div>
<h2>What each test establishes</h2><div class="table-scroll">${trialTable(s)}</div><p>The halves and right-hand quarters are Ptolemy’s comparisons. The eighths are our extra diagnostic. The uniform profile passes all three. Heavy outer quarters give matching halves but unequal right-hand quarters. A repeating mirrored pattern passes both ancient comparisons, but fails the extra eighths test. A heavy left half fails the first comparison while its light right-hand quarters agree.</p>
<p class="tr-equation">Uniform segment: frequency = (1 / 2 length) × √(tension / mass per length).</p><p>Nonuniform segments require the wave equation through their actual mass distribution. This model uses eight piecewise-constant cells, ideal fixed boundaries and constant tension. A 110 or 220 Hz completely uniform full string sets the modern reference. It does not assign an ancient absolute pitch. The wave equation, mass profiles and additional eighths test are modern teaching choices. String stiffness, damping, bridge width, support compliance and changes of tension caused by a real bridge are omitted.</p><p>Equal pitch here means numerical agreement within 1e-7 cents, a computational tolerance rather than a human hearing threshold. Reflected mass distributions have matching spectra. Passing a finite set of comparisons cannot establish arbitrary material uniformity.</p>
<h2>Read the examination</h2><p>Ptolemy, <i>Harmonics</i> I.8, selected phrases from John Wallis’s Greek text and Latin translation (Oxford, 1682), pp. 35, 37–38. These are excerpts, not a continuous chapter translation. Greek ligatures and Unicode are normalized; segment letters are capitalized instead of barred lowercase. Latin long-s is normalized; &amp; is retained. English translations and grammar notes are new.</p>
${TRIAL_PASSAGES.map((p, i) => `<article class="tr-full-passage"><h3>${i + 1} · ${p.label}</h3><p lang="grc">${p.greek}</p><p lang="la">${p.latin}</p><p>${p.english}</p><p class="quiet">${p.note} Printed p. ${p.page}.</p></article>`).join("")}
<h2>Three reading checks</h2><dl>${TRIAL_QUESTIONS.map((q) => `<dt>${q.question}</dt><dd>${at(q.answers, q.correct)} ${q.why}</dd>`).join("")}</dl>
<footer><p><a href="https://antonsoo.github.io/pyknon/trial.html${escapeHtml(trialQuery(s))}#trial">Reopen this experiment</a> · <a href="${TRIAL_ARCHIVE}">Complete scanned edition</a> · <a href="https://github.com/antonsoo/pyknon/blob/main/docs/trial-model.md">Derivation and source decisions</a>.</p><p>Ptolemy’s instrument examination precedes his use of string divisions to test concords. The selected wording treats the string’s constitution as unvarying after agreement. The repeating modern example makes the limit of that inference explicit. Wallis discusses and changes the bridge drawing in his note on p. 36; the full scans retain it. No claim is made about the precision of a physical ancient instrument.</p><p>The six full JPEG pages below and Greek font were verified against edition SHA-256 identities before embedding. All images, audio and downloadable data are in this document. Ancient text, 1682 Latin and page images: public domain. New code, diagrams and teaching text: MIT, © 2026 Anton Soloviev. Noto Serif: SIL Open Font License 1.1.</p><details class="tr-font-license"><summary>Embedded font license</summary><pre>${escapeHtml(fontNotice)}</pre></details></footer>
${TRIAL_PAGES.map((p, i) => `<figure class="tr-scan"><img src="${at(images, i)}" alt="Complete Wallis 1682 printed page ${p}, Greek and Latin, with editorial apparatus"><figcaption>Wallis 1682 · printed p. ${p}, PDF p. ${p + 22}. Public-domain complete page.</figcaption><p class="tr-hash">JPEG SHA-256: ${TRIAL_ASSETS.find((a) => a.file === `sources/trial/wallis-${p}.jpg`)?.sha256}</p></figure>`).join("")}</body></html>`;
}
