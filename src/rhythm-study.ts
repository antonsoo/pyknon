import fontNotice from "../public/fonts/NotoSerif-OFL.txt?raw";
import {
  BETWEEN_FEET,
  chosen,
  GENUS_NAMES,
  type RhythmState,
  reference,
  rhythmJSON,
  rhythmOnsetsCsv,
  rhythmQuery,
} from "./core/rhythm";
import { RHYTHM_ASSETS } from "./rhythm-assets";
import { RHYTHM_ARCHIVE, RHYTHM_PAGES, RHYTHM_PASSAGES, RHYTHM_WORDS } from "./rhythm-content";
import {
  betweenDrawing,
  betweenTable,
  rhEscape,
  rhythmDrawing,
  rhythmTable,
} from "./rhythm-drawing";
export const RHYTHM_SOUND_NAMES = {
  compare: "Reference twice, then your foot twice",
  chosen: "Your foot twice",
  between: "Selected intermediate example twice",
} as const;
export async function rhDataUrl(bytes: ArrayBuffer | Blob, mime: string): Promise<string> {
  const data = new Uint8Array(bytes instanceof Blob ? await bytes.arrayBuffer() : bytes);
  let text = "";
  for (let i = 0; i < data.length; i += 0x8000)
    text += String.fromCharCode(...data.subarray(i, i + 0x8000));
  return `data:${mime};base64,${btoa(text)}`;
}
async function verified(file: string, mime: string): Promise<string> {
  const asset = RHYTHM_ASSETS.find((a) => a.file === file);
  if (!asset) throw new Error("Unknown rhythm source asset.");
  const r = await fetch(`${import.meta.env.BASE_URL}${file}`);
  if (!r.ok)
    throw new Error(`Could not load ${file}. Keep the complete edition available and try again.`);
  const bytes = await r.arrayBuffer(),
    hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  if (hash !== asset.sha256)
    throw new Error(
      `The source asset ${file} differs from this edition. Reload the complete edition before saving.`,
    );
  return rhDataUrl(bytes, mime);
}
export async function rhythmStudy(captured: RhythmState, wav: Blob): Promise<string> {
  const s = { ...captured },
    a = reference(s),
    b = chosen(s);
  const [font, audio, ...images] = await Promise.all([
    verified("fonts/NotoSerif-Regular.ttf", "font/ttf"),
    rhDataUrl(wav, "audio/wav"),
    ...RHYTHM_PAGES.map((p) => verified(`sources/rhythm/westphal-${p}.jpg`, "image/jpeg")),
  ]);
  const json = `data:application/json;charset=utf-8,${encodeURIComponent(rhythmJSON(s))}`;
  const onsets = `data:text/csv;charset=utf-8,${encodeURIComponent(rhythmOnsetsCsv(s, s.sound))}`;
  const passages = RHYTHM_PASSAGES.map(
    (p, i) =>
      `<article><h3>${i + 1}. ${rhEscape(p.title)}</h3><p class="quiet">Westphal 1861, printed p.${p.page}, lines ${p.lines}.</p><p lang="grc">${rhEscape(p.greek)}</p><p>${rhEscape(p.english)}</p><p class="note">${rhEscape(p.note)}</p>${p.latin ? `<h4>Latin parallel in the apparatus</h4><p lang="la">${rhEscape(p.latin)}</p><p>${rhEscape(p.latinEnglish ?? "")}</p><p class="quiet">${rhEscape(p.latinNote ?? "")}</p>` : ""}<dl>${p.words
        .map((key) => {
          const w = RHYTHM_WORDS[key];
          return w
            ? `<dt><span lang="grc">${rhEscape(key)}</span> (${rhEscape(w.roman)})</dt><dd>${rhEscape(w.meaning)}. ${rhEscape(w.note)}</dd>`
            : "";
        })
        .join("")}</dl></article>`,
  ).join("");
  const scans = RHYTHM_PAGES.map((p, i) => {
    const asset = RHYTHM_ASSETS.find((a) => a.file === `sources/rhythm/westphal-${p}.jpg`);
    return `<figure class="scan"><img src="${images[i]}" alt="Full Westphal 1861 ${p === "title" ? "title page" : `printed page ${p}`}"/><figcaption>Westphal 1861, ${p === "title" ? "title page" : `printed p.${p}`}, physical PDF p.${asset && "pdfPage" in asset ? asset.pdfPage : ""}. Full public-domain page; apparatus and parallel witnesses retained.</figcaption><p class="hash">JPEG SHA-256: ${asset?.sha256}</p></figure>`;
  }).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; font-src data:; img-src data:; media-src data:; object-src 'none'; base-uri 'none'"/><title>Six times. Two different rhythms. · Saved Pyknon reading</title><style>
@font-face{font-family:Noto;src:url(${font})}body{max-width:960px;margin:32px auto;padding:0 24px;font:17px/1.65 system-ui,Arial,sans-serif;color:#2c2538;background:white}h1,h2,h3{line-height:1.18;color:#36275e}h1{font-size:40px}h2{font-size:28px;margin-top:2em}h3{font-size:23px}a{color:#36275e}p{max-width:74ch}svg{display:block;max-width:100%;height:auto}.phone{display:none}.legend{display:flex;gap:24px;flex-wrap:wrap}.up{color:#36275e}.down{color:#176477}.quiet,figcaption{font-size:13px;color:#675e72}table{width:100%;border-collapse:collapse;min-width:600px;font-size:14px}th,td{padding:10px;text-align:left;border-bottom:1px solid #d9d2df}caption{text-align:left;padding:12px 0}.table-scroll{overflow:auto;max-width:100%}[lang=grc]{font:1.18em/1.8 Noto,Georgia,serif}[lang=la]{font-style:italic}.note{background:#f3f0f8;padding:12px;font-size:15px}article{margin:32px 0;border-top:1px solid #d9d2df;padding-top:14px}dt{font-weight:600}dd{margin:4px 0 16px}.scan{margin:32px 0}.scan img{display:block;max-width:100%;height:auto}.hash{font-size:11px;overflow-wrap:anywhere}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px}audio{width:100%;max-width:480px}.links{display:flex;flex-wrap:wrap;gap:14px}figure{margin:18px 0}@media(max-width:600px){body{padding:0 18px}.wide{display:none}.phone{display:block}h1{font-size:32px}}@page{size:A4;margin:14mm}@media print{body{margin:0;padding:0;font-size:10pt}h1{font-size:27pt}h2,h3{break-after:avoid}.phone{display:none}.wide{display:block}.table-scroll{overflow:visible}table{min-width:0;font-size:9pt}audio,.links,.font-notice{display:none}.scan{break-before:page;break-inside:avoid;margin:0}.scan img{max-height:224mm;max-width:100%;width:auto;margin:auto}.scan figcaption{font-size:9pt}.scan .hash{font-size:7pt}svg{max-height:112mm}.note{font-size:9pt}}
</style></head><body><h1>Six times.<br/>Two different rhythms.</h1><p>A saved Pyknon reading of Aristoxenus, <cite>Rhythmic Elements</cite> II. Compare the same total duration with different divisions, then inspect an intermediate foot.</p><p><strong>Reference: ${a.up}+${a.down}, ${GENUS_NAMES[a.genus]}. Your foot: ${b.up}+${b.down}, ${GENUS_NAMES[b.genus]}. Modern primary time: ${s.unitMs} ms. Inner attacks: ${s.texture === "units" ? "every unit" : "joined within each portion"}.</strong></p><p class="links"><a href="https://antonsoo.github.io/pyknon/rhythm.html${rhEscape(rhythmQuery(s))}#rhythm">Continue this comparison</a><a download="pyknon-rhythm.json" href="${json}">Save editable comparison JSON</a></p><h2>The whole and its division</h2><p class="legend"><span class="up">Violet: up portion</span><span class="down">Teal: down portion</span></p><div class="wide">${rhythmDrawing(s)}</div><div class="phone">${rhythmDrawing(s, 320)}</div><p>The two bars share the same total primary-time count and modern unit duration. Their portion ratio determines membership in the three genera admitted in this fragment. Reversing up and down preserves the total and ratio family. Unit attacks or joined portions are modern illustrations of how rhythmic composition can vary within a foot.</p><div class="table-scroll">${rhythmTable(s)}</div><h3>Selected synthetic sound</h3><p>${RHYTHM_SOUND_NAMES[s.sound]}. Each foot repeats twice; the reference/chosen comparison has a 450 ms gap between its two pairs. Sine clicks mark temporal positions, rather than the duration of sung notes. Their modern marker pitches are up 720 Hz, down 480 Hz, inner attacks 960 Hz. No ancient absolute pitch, percussion timbre, melody, performed accent pattern or dancing motion is reconstructed.</p><audio controls preload="none" src="${audio}"></audio><p class="links"><a download="pyknon-rhythm.wav" href="${audio}">Save listening WAV</a><a download="pyknon-rhythm-onsets.csv" href="${onsets}">Save scheduled marker onsets</a></p><h2>An intermediate foot</h2><p>The down portion remains two times in all three examples. The up portion is one, two, or a size between them. Our exact 1½ is an illustrative choice; Aristoxenus does not prescribe a numerical midpoint. Up:down is then 3:4, an ordinary rational fraction. His argument asks for a common measure that is itself rhythmically admissible. Arithmetic alone does not establish that condition.</p><p>Selected: ${BETWEEN_FEET.find((f) => f.id === s.between)?.label}. Here a unit is fixed at 300 ms; the overall foot durations differ.</p><div class="wide">${betweenDrawing(s)}</div><div class="phone">${betweenDrawing(s, 320)}</div><div class="table-scroll">${betweenTable()}</div><p>This finite example does not classify every intermediate proportion or set a modern threshold of perception. The source's term <span lang="grc">ἄλογος</span> must be read within its rhythmic argument.</p><h2>Greek, new English and contextual reading notes</h2><p>The passages below come from the main Aristoxenus text in Rudolf Westphal's 1861 edition, above its apparatus rules. Greek ligatures, spacing, punctuation and printed line breaks are normalized; footnote calls are omitted. Later Psellus and Paris parallels remain distinguishable in the full scans. The Latin parallel is separately attributed.</p>${passages}<h2>Sources, method and limits</h2><p>Rudolf Westphal, <cite>Die Fragmente und die Lehrsätze der griechischen Rhythmiker</cite>, supplement to A. Rossbach's <cite>Griechische Rhythmik</cite> (Leipzig: B. G. Teubner, 1861), printed pp.28,31,33–37. <a href="${RHYTHM_ARCHIVE}">Complete scanned edition</a>. The fragment's eight-time explanation breaks off after 'because'. Its missing continuation is not supplied as recovered text.</p><p>The integer bench covers positive whole-number portions of totals 3 through 8 and recognizes equal, double and 3:2 ratio families. 'Outside' belongs to this narrow account of continuous rhythmic composition, not to every ancient writer or all music. The chosen tempo, marker pitches, diagram orientations, nearest-middle reference and smaller attacks are modern teaching choices. Up/down are not equated universally with modern weak/strong beats. A mathematical sound schedule is distinct from device output or a listener's recognition.</p><p>All eight full pages and the Greek font were verified by SHA-256 before embedding. This document executes no scripts and makes no automatic remote request. Its source images, font, sound and editable state are embedded. Outside links load only when followed.</p><p>New code, diagrams and educational text: MIT, Copyright (c) 2026 Anton Soloviev. Ancient Greek, historical Latin and the 1861 edition: public domain. Noto Serif: SIL Open Font License 1.1.</p><details class="font-notice"><summary>Embedded Greek-font license</summary><pre>${rhEscape(fontNotice)}</pre></details><h2>Full printed evidence</h2>${scans}</body></html>`;
}
