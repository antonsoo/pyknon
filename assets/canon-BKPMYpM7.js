import{n as e,r as t,t as n}from"./offline-DQU_9qEb.js";import{n as r,o as i,r as a}from"./tetrachord-BqvDPsjm.js";var o=`https://archive.org/details/euclidisoperaomn08eucl/page/174/mode/2up`,s=[170,171,172,173,174,175],c={compare:`Selected pair, one after another`,beat:`Selected pair, together`,walk:`Climb both routes to the selected step`,control:`Control: two identical equal-step tones`},l=[{label:`The claim · XIV`,greek:`Τὸ διὰ πασῶν ἔλαττον ἢ ἓξ τόνων.`,latin:`diapason minus est quam sex tonorum.`,english:`The octave is smaller than six tones.`,note:`ἔλαττον / minus means ‘smaller’; ἢ / quam introduces the comparison. ‘Tone’ here has the 9:8 ratio established in XIII. A modern 200-cent whole tone changes that premise.`},{label:`The musical premises · XII and XIII`,greek:`δέδεικται γὰρ τὸ μὲν διὰ πασῶν διπλάσιον, ὁ δὲ τόνος ἐπόγδοος·`,latin:`nam demonstratum est, diapason duplum esse [prop. XII], tonum vero sesqueoctavum [prop. XIII].`,english:`For it has been shown that the octave is double, while the tone is a whole and an eighth.`,note:`δέδεικται / demonstratum est points back to earlier proofs. διπλάσιον / duplum names 2:1; ἐπόγδοος / sesqueoctavum names 9:8. Menge adds the proposition references in square brackets to the Latin.`},{label:`The numerical premise · IX`,greek:`τὰ δὲ ἓξ ἐπόγδοα διαστήματα μείζονα διαστήματός [ἐστι] διπλασίου.`,latin:`verum sex intervalla sesqueoctava intervallo duplo sunt maiora [prop. IX].`,english:`But six intervals of a whole and an eighth are greater than a double interval.`,note:`μείζονα / maiora means ‘greater’. The seven source integers supply six successive ratios, each 9:8. The Greek bracketed [ἐστι] is retained from this edition; it is not silently promoted to certain text.`},{label:`The conclusion · XIV`,greek:`τὸ ἄρα διὰ πασῶν ἔλαττόν ἐστιν ἓξ τόνων.`,latin:`ergo diapason minus est sex tonis.`,english:`Therefore the octave is smaller than six tones.`,note:`ἄρα / ergo carries the inference. Greek ἓξ τόνων and Latin sex tonis express the comparison. The numerical contradiction belongs to these ratios; it does not make modern equal temperament impossible.`}],u=[{greek:`διὰ πασῶν`,roman:`dia pasōn`,latin:`diapason`,english:`octave`,note:`Literally ‘through all’. Here it names the consonance with ratio 2:1. The phrase is quoted in its printed form, not translated as ‘all notes’ in the proof.`},{greek:`τόνος`,roman:`tonos`,latin:`tonus`,english:`tone`,note:`The tone in XIII is the interval left when a 4:3 fourth is removed from a 3:2 fifth: (3/2) ÷ (4/3) = 9/8. Removing a musical interval divides ratios; it does not subtract their numerical values.`},{greek:`ἐπόγδοος`,roman:`epogdoos`,latin:`sesqueoctavus`,english:`a whole and an eighth`,note:`A quantity contains the other plus one eighth of it: 1 + 1/8 = 9/8. Each selected source row after Α adds one eighth of the preceding integer.`},{greek:`διπλάσιον`,roman:`diplasion`,latin:`duplum`,english:`double`,note:`An octave doubles frequency in this modern realization. At step six the source's target is twice 262144, or 524288. Compare that with Η = 531441.`}],d=[`compare`,`beat`,`walk`,`control`],f={step:6,root:220,sound:`compare`,passage:0,page:174},p=[`Α`,`Β`,`Γ`,`Δ`,`Ε`,`Ζ`,`Η`],m=[262144,294912,331776,373248,419904,472392,531441];function h(e){let t=new URLSearchParams(e),n=t.has(`n`)?Number(t.get(`n`)):NaN,r=Number(t.get(`a`)),i=t.get(`sound`),a=t.has(`p`)?Number(t.get(`p`)):NaN,o=Number(t.get(`page`));return{step:Number.isInteger(n)&&n>=0&&n<=6?n:f.step,root:r===110||r===220||r===440?r:f.root,sound:d.find(e=>e===i)??f.sound,passage:Number.isInteger(a)&&a>=0&&a<=3?a:f.passage,page:Number.isInteger(o)&&o>=170&&o<=175?o:f.page}}function g(e){return`?n=${e.step}&a=${e.root}&sound=${e.sound}&p=${e.passage}&page=${e.page}`}function _(e){let t=[1,1];return p.map((n,o)=>{o&&(t=i(t,[9,8]));let s=e*t[0]/t[1],c=e*2**(o/6);return{step:o,letter:n,source:r(m,o),ratio:t,ratioHz:s,equalHz:c,ratioCents:a(t),equalCents:o*200,differenceCents:a(t)-o*200,beatHz:s-c}})}function v(e){let t=r(_(e),6);return{...t,octaveInteger:r(m,0)*2,excessInteger:t.source-r(m,0)*2,comma:i(t.ratio,[1,2]),fifthsComma:i([3**12,4096],[1,128])}}function y(e){let t=_(e.root),n=r(t,e.step),i=[],a=(e,n,a,o)=>{let s=r(t,e);i.push({note:e,tuning:n,hz:n===`ratios`?s.ratioHz:s.equalHz,start:a,duration:o})};if(e.sound===`walk`)for(let[t,n]of[`ratios`,`keyboard`].entries())for(let r=0;r<=e.step;r++)a(r,n,.12+t*((e.step+1)*.65+.6)+r*.65,.48);else e.sound===`compare`?(a(e.step,`keyboard`,.12,1.6),a(e.step,`ratios`,2.12,1.6)):(a(e.step,`keyboard`,.12,4),a(e.step,`ratios`,.12,4),e.sound===`control`&&(r(i,1).hz=n.equalHz));return{tones:i,duration:Math.max(...i.map(e=>e.start+e.duration))+.2}}function b(e){return`step,source_letter,source_integer,frequency_ratio,ratio_hz,equal_hz,ratio_cents,equal_cents,difference_cents,frequency_difference_hz,selected\n${_(e.root).map(t=>[t.step,t.letter,t.source,t.ratio.join(`/`),t.ratioHz,t.equalHz,t.ratioCents,t.equalCents,t.differenceCents,t.beatHz,t.step===e.step].join(`,`)).join(`
`)}\n`}function x(e,t=!1){let n=_(e.root),i=t?`0 0 320 410`:`0 0 960 235`,a=t?`phone`:`wide`,o=e=>t?360-e/1245*300:80+e/1245*800,s=(e,n)=>t?{x:n===`ratios`?94:226,y:o(e)}:{x:o(e),y:n===`ratios`?75:157},c=n.map(e=>{let n=s(e.equalCents,`keyboard`);return t?`<line class="route-grid" x1="55" x2="265" y1="${n.y}" y2="${n.y}"/><text class="route-axis" x="280" y="${n.y+4}" text-anchor="middle">${e.equalCents}</text>`:`<line class="route-grid" x1="${n.x}" x2="${n.x}" y1="45" y2="181"/><text class="route-axis" x="${n.x}" y="212" text-anchor="middle">${e.equalCents}</text>`}).join(``),l=[`ratios`,`keyboard`].map(t=>{let i=s(0,t),a=s(r(n,6)[t===`ratios`?`ratioCents`:`equalCents`],t);return`<g class="route-${t}"><line class="route-line" x1="${i.x}" y1="${i.y}" x2="${a.x}" y2="${a.y}"/>${n.map(n=>{let r=s(n[t===`ratios`?`ratioCents`:`equalCents`],t);return`<g data-note="${t}-${n.step}" class="route-note ${e.step===n.step?`selected`:``}" data-step="${n.step}" data-cents="${n[t===`ratios`?`ratioCents`:`equalCents`]}"><circle class="selection-ring" cx="${r.x}" cy="${r.y}" r="19"/><circle cx="${r.x}" cy="${r.y}" r="13"/><text x="${r.x}" y="${r.y+5}" text-anchor="middle">${n.step}</text></g>`}).join(``)}</g>`}).join(``);return`<svg viewBox="${i}" role="img" aria-labelledby="route-${a}-title route-${a}-desc"><title id="route-${a}-title">Six 9:8 tones and six equal octave divisions, on one pitch scale</title><desc id="route-${a}-desc">Purple filled circles: 9:8 intervals. Outlined circles: modern 200-cent intervals. The numbers count intervals from zero. At six the first route reaches 1223.46 cents, past the octave at 1200 cents. Selected step ${e.step} is ringed. ${t?`Pitch rises vertically;`:`Pitch rises to the right;`} the axis is in cents.</desc>${c}${l}${t?`<text class="route-label" x="94" y="25" text-anchor="middle">9:8 tones</text><text class="route-label" x="226" y="25" text-anchor="middle">Equal steps</text><text class="route-axis" x="280" y="395" text-anchor="middle">cents</text>`:`<text class="route-label" x="3" y="80">9:8</text><text class="route-label" x="3" y="162">Equal</text><text class="route-axis" x="944" y="212" text-anchor="end">cents</text>`}</svg>`}function S(e){let t=r(_(e.root),e.step),n=t.equalCents-4,i=t.ratioCents+4,a=e=>32+(e-n)/(i-n)*296,o=a(t.equalCents),s=a(t.ratioCents);return`<svg viewBox="0 0 360 116" role="img" aria-labelledby="detail-title detail-desc"><title id="detail-title">Enlarged comparison at step ${e.step}</title><desc id="detail-desc">Equal-step position ${t.equalCents.toFixed(3)} cents; 9:8 position ${t.ratioCents.toFixed(3)} cents. Difference ${t.differenceCents.toFixed(3)} cents. This has its own enlarged scale.</desc><line class="route-grid" x1="20" x2="340" y1="54" y2="54"/><line class="detail-link" x1="${o}" x2="${s}" y1="54" y2="54"/><g class="route-keyboard"><circle cx="${o}" cy="54" r="7"/></g><g class="route-ratios"><circle cx="${s}" cy="54" r="7"/></g><text class="route-axis" x="${o}" y="25" text-anchor="${e.step?`start`:`middle`}">${t.equalCents.toFixed(2)}¢ · equal</text><text class="route-axis" x="${s}" y="94" text-anchor="${e.step?`end`:`middle`}">${t.ratioCents.toFixed(2)}¢ · 9:8</text></svg>`}var C=`.canon-intro {
  gap: 45px;
}
.canon-intro h1 {
  font-size: clamp(43px, 5.2vw, 67px);
}
.canon-workbench {
  padding-bottom: 28px;
}
.canon-controls {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 25px;
  margin-bottom: 24px;
}
.step-label {
  font-size: 13px;
  margin-bottom: 8px;
  color: var(--muted);
}
.step-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.step-buttons button {
  min-width: 43px;
  padding: 8px 12px;
}
.step-buttons button[aria-pressed="true"],
.passage-tabs button[aria-pressed="true"] {
  background: var(--ink);
  color: white;
  border-color: var(--ink);
}
.canon-controls label,
.sound-choice {
  display: grid;
  gap: 6px;
  font-size: 13px;
}
.canon-controls select,
.sound-choice select {
  max-width: 100%;
  border: 1px solid #afa3bc;
  padding: 9px;
  background: var(--paper);
  color: var(--ink);
  border-radius: 3px;
  font: inherit;
}
.canon-route {
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  margin: 0;
  padding: 14px 0;
}
.canon-route svg,
.canon-detail svg {
  width: 100%;
  display: block;
}
.route-label {
  fill: var(--ink);
  font:
    16px Plex,
    sans-serif;
}
.route-axis {
  fill: var(--muted);
  font:
    12px Plex,
    sans-serif;
}
.route-grid {
  stroke: var(--line);
  stroke-width: 1;
}
.route-line {
  stroke: #afa3bc;
  stroke-width: 2;
}
.route-ratios circle {
  fill: var(--ink);
  stroke: var(--ink);
  stroke-width: 2;
}
.route-keyboard circle {
  fill: var(--paper);
  stroke: var(--ink);
  stroke-width: 2;
}
.route-note text {
  font:
    14px Plex,
    sans-serif;
  fill: white;
}
.route-keyboard .route-note text {
  fill: var(--ink);
}
.route-note .selection-ring {
  fill: none;
  stroke: transparent;
  stroke-width: 2;
}
.route-note.selected .selection-ring {
  stroke: var(--ink);
}
.route-note.sounding .selection-ring {
  stroke: #a94116;
  stroke-width: 4;
}
.detail-link {
  stroke: var(--ink);
  stroke-width: 2;
}
.route-phone {
  display: none;
}
.canon-route figcaption {
  color: var(--muted);
  font-size: 13px;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 0 10px;
}
.canon-readout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 35px;
  padding: 22px 0;
  align-items: center;
}
.canon-detail {
  border-right: 1px solid var(--line);
  padding-right: 30px;
}
.canon-detail p {
  font-size: 12px;
  color: var(--muted);
}
.pair-values {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin: 0 0 12px;
}
.pair-values dt {
  font-size: 12px;
  color: var(--muted);
}
.pair-values dd {
  margin: 4px 0 0;
  font-size: 24px;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.beat-reading {
  font-size: 14px;
  color: var(--muted);
}
.canon-transport {
  display: flex;
  align-items: end;
  gap: 10px;
  flex-wrap: wrap;
}
.sound-choice {
  flex: 1 1 285px;
  max-width: 430px;
}
.canon-status {
  min-height: 27px;
  font-size: 13px;
  color: var(--muted);
  padding: 12px 0 0;
}
.canon-boundary {
  margin-top: 16px;
  max-width: 850px;
  color: var(--muted);
  font-size: 13px;
}
.canon-section {
  border-top: 1px solid var(--line);
  padding: 42px 0;
  scroll-margin-top: 24px;
}
.proof-layout {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 35px;
  align-items: start;
}
.proof-layout > * {
  min-width: 0;
}
.integer-table {
  font-variant-numeric: tabular-nums;
}
.integer-table button {
  padding: 5px 12px;
  min-width: 44px;
}
.integer-table th,
.integer-table td {
  padding: 9px 12px;
  font-size: 14px;
}
.integer-table tr.selected {
  background: #eee9f5;
}
.integer-table tr.selected button {
  color: white;
  background: var(--ink);
}
.integer-working {
  padding: 22px;
  background: #f1edf6;
}
.integer-working h3 {
  font-size: 20px;
  margin-bottom: 12px;
}
.integer-equation {
  font-size: clamp(20px, 2.3vw, 29px);
  line-height: 1.4;
  font-variant-numeric: tabular-nums;
  margin: 14px 0;
  overflow-wrap: anywhere;
}
.integer-proof {
  border-top: 1px solid #c9bfd7;
  margin-top: 24px;
  padding-top: 18px;
}
.integer-proof strong {
  color: var(--ink);
}
.canon-notes {
  margin-top: 24px;
  max-width: 850px;
}
.canon-notes summary {
  padding: 10px 0;
}
.canon-notes p {
  margin: 14px 0;
}
.canon-reading {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 35px;
  align-items: start;
}
.passage-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 18px;
}
.passage-tabs button {
  padding: 8px 11px;
}
.canon-passage h3 {
  font-size: 17px;
  margin-bottom: 14px;
}
.canon-passage .greek-line {
  font-size: 26px;
  line-height: 1.65;
}
.canon-passage .latin-line {
  font-family: Noto, Georgia, serif;
  font-size: 21px;
  margin-top: 17px;
}
.canon-passage .english-line {
  font-size: 18px;
  margin-top: 17px;
}
.canon-passage .reading-note {
  border-top: 1px solid var(--line);
  padding-top: 16px;
  margin-top: 20px;
  font-size: 14px;
}
.canon-source-view {
  margin: 0;
}
.canon-source-view a {
  display: block;
}
.canon-source-view img {
  width: 100%;
  display: block;
  height: auto;
}
.canon-source-view figcaption {
  font-size: 12px;
  color: var(--muted);
  padding-top: 10px;
}
.canon-source-view label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
  margin-bottom: 10px;
}
.canon-source-view select {
  font: inherit;
  padding: 6px;
  max-width: 65%;
}
.canon-vocabulary {
  margin-top: 34px;
}
.canon-vocabulary .word-layout {
  margin-top: 18px;
}
.canon-downloads {
  margin: 26px 0 0;
}
.canon-downloads .save-row {
  flex-wrap: wrap;
}
.canon-downloads p {
  font-size: 13px;
  color: var(--muted);
}
.canon-packet {
  margin-top: 24px;
}
.canon-packet summary {
  padding: 15px 0;
}
.canon-packet .scan-grid {
  grid-template-columns: repeat(3, 1fr);
  margin-top: 20px;
}
.canon-packet figure {
  margin: 0;
}
.canon-packet figcaption {
  font-size: 12px;
  margin-top: 8px;
}
.canon-connections {
  display: flex;
  gap: 25px;
  flex-wrap: wrap;
  font-size: 14px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
}
@media (max-width: 760px) {
  .canon-intro {
    gap: 24px;
  }
  .canon-controls {
    align-items: start;
    flex-direction: column;
    gap: 16px;
  }
  .canon-readout,
  .proof-layout,
  .canon-reading {
    grid-template-columns: 1fr;
    gap: 22px;
  }
  .canon-detail {
    border-right: 0;
    padding-right: 0;
  }
  .canon-readout {
    padding-top: 16px;
  }
  .canon-detail svg {
    max-width: 400px;
    margin: auto;
  }
  .canon-source-view {
    max-width: 520px;
  }
  .canon-packet .scan-grid {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 620px) {
  .route-wide {
    display: none;
  }
  .route-phone {
    display: block;
    max-width: 340px;
    margin: auto;
  }
  .canon-route figcaption {
    flex-direction: column;
    gap: 5px;
  }
  .step-buttons {
    gap: 4px;
  }
  .step-buttons button {
    min-width: 36px;
    padding: 8px 10px;
  }
  .pair-values dd {
    font-size: 22px;
  }
  .canon-transport {
    align-items: stretch;
  }
  .sound-choice {
    max-width: none;
  }
  .integer-table th,
  .integer-table td {
    font-size: 13px;
    padding: 8px;
  }
  .canon-packet .scan-grid {
    grid-template-columns: 1fr;
  }
  .canon-passage .greek-line {
    font-size: 23px;
  }
  .canon-section {
    padding: 30px 0;
  }
}
@media print {
  .canon-controls,
  .canon-transport,
  .canon-status,
  .canon-downloads,
  .passage-tabs {
    display: none;
  }
  .canon-readout,
  .proof-layout,
  .canon-reading {
    grid-template-columns: 1fr 1fr;
  }
  .canon-route,
  .integer-working,
  .canon-passage,
  .canon-source-view {
    break-inside: avoid;
  }
}

.canon-workbench > .canon-status {
  margin-bottom: 18px;
}
`;async function w(e,t){let n=await fetch(`/pyknon/${e}`);if(!n.ok)throw Error(`Could not load ${e}`);let r=new Uint8Array(await n.arrayBuffer()),i=``;for(let e=0;e<r.length;e+=32768)i+=String.fromCharCode(...r.subarray(e,e+32768));return`data:${t};base64,${btoa(i)}`}async function T(e){let[t,...n]=await Promise.all([w(`fonts/NotoSerif-Regular.ttf`,`font/ttf`),...s.map(e=>w(`sources/canon/menge-${e}.jpg`,`image/jpeg`))]),i=_(e.root),a=r(i,e.step),d=v(e.root);return`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pyknon · Six tones · step ${e.step} · ${e.root} Hz</title><style>
@font-face{font-family:Noto;src:url('${t}') format('truetype')} :root{--ink:#36275e;--muted:#675e72;--line:#d9d2df;--paper:#fff}*{box-sizing:border-box}body{max-width:1000px;padding:24px;margin:auto;color:#2c2538;font:16px/1.6 system-ui,sans-serif}h1,h2,h3{line-height:1.2;color:var(--ink);font-weight:400}h1{font-size:42px}[lang=grc]{font-family:Noto,Georgia,serif}a{color:var(--ink)}table{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums}th,td{text-align:left;padding:8px;border-bottom:1px solid var(--line);font-size:13px}figure{margin:0}.table-scroll{overflow:auto}.eyebrow,.quiet{color:var(--muted);font-size:13px}.study-passage{margin:24px 0;padding-top:18px;border-top:1px solid var(--line)}.study-passage p{margin:12px 0}.study-scan img{width:100%;height:auto}.study-scan{margin:28px auto;max-width:700px}.study-scan figcaption{font-size:13px}dt{font-weight:600}dd{margin:5px 0 20px}.selected{background:#eee9f5}footer{font-size:13px;border-top:1px solid var(--line);padding-top:16px}
${C}
@page{size:A4;margin:14mm}@media print{body{padding:0;font-size:11pt}h1{font-size:30pt}h2,h3{break-after:avoid}.study-scan{break-before:page;break-inside:avoid;max-width:none;margin:0}.study-scan img{max-height:235mm;width:auto;max-width:100%;display:block;margin:auto}.study-passage,table{break-inside:avoid}.table-scroll{overflow:visible}.route-wide{display:block}.route-phone{display:none}a{color:inherit;text-decoration:none}}
</style></head><body><header><p class="eyebrow">PYKNON / SAVED ILLUSTRATED READING</p><h1>Six tones and an octave</h1><p>Selected step ${e.step} (${a.letter}), modern starting reference ${e.root} Hz. Selected sound: ${c[e.sound]}. The audio is available as a separate WAV.</p></header>
<figure class="canon-route"><div class="route-wide">${x(e)}</div><div class="route-phone">${x(e,!0)}</div><figcaption>Purple: successive 9:8 tones. Outlined: six equal divisions of a 2:1 octave. Numbers count intervals from zero.</figcaption></figure>
<div class="canon-readout"><div class="canon-detail"><p>Selected pair · enlarged scale</p>${S(e)}</div><div><p>9:8 route: <strong>${a.ratioHz.toFixed(6)} Hz</strong>; equal route: <strong>${a.equalHz.toFixed(6)} Hz</strong>.</p><p>Difference: ${a.differenceCents.toFixed(6)} cents and ${a.beatHz.toFixed(6)} Hz. Simultaneous sine tones give this many amplitude beats per second in the generated signal; the control uses two identical equal-route tones.</p></div></div>
<h2>Seven numbers, six multiplications</h2><p>Α–Η label the proof’s numbers. They form a progression, each 9:8 of its predecessor. We realize their ratios as increasing frequencies. They are not labeled as string lengths. Frequencies and cents below are rounded modern calculations.</p><div class="table-scroll"><table><caption>Menge 1916, printed p. 171, proposition IX; selected row highlighted</caption><thead><tr><th>Step / letter</th><th>Source integer</th><th>Exact ratio to Α</th><th>9:8 Hz</th><th>Equal Hz</th><th>Difference (¢)</th></tr></thead><tbody>${i.map(t=>`<tr class="${t.step===e.step?`selected`:``}"><th>${t.step} / ${t.letter}</th><td>${t.source}</td><td>${t.ratio.join(`/`)}</td><td>${t.ratioHz.toFixed(6)}</td><td>${t.equalHz.toFixed(6)}</td><td>${t.differenceCents.toFixed(6)}</td></tr>`).join(``)}</tbody></table></div><p><strong>531441 &gt; 2 × 262144 = ${d.octaveInteger}.</strong> The excess is ${d.excessInteger}. Dividing by the octave gives ${d.comma.join(`/`)}, or ${d.differenceCents.toFixed(6)} cents, commonly called the Pythagorean comma.</p><p>Six modern 200-cent steps close the octave by changing each step to 2^(1/6), approximately 1.122462. The source's 9/8 is 1.125. Modern algebra also gives the same comma from twelve 3:2 fifths compared with seven octaves: (3/2)^12 ÷ 2^7 = ${d.fifthsComma.join(`/`)}. This connection is an explanation added here, not a quotation from IX.</p>
<h2>Read proposition XIV</h2><p>The work is transmitted under Euclid's name; authorship is not settled here. Greek text and Latin translation: Heinrich Menge, <i>Euclidis opera omnia</i> VIII (Leipzig, 1916), pp. 174–175. English translations and notes are new. The selected app sentence was ${e.passage+1}; every sentence is included below.</p>${l.map((t,n)=>`<article class="study-passage ${n===e.passage?`selected`:``}"><h3>${t.label}</h3><p lang="grc">${t.greek}</p><p lang="la">${t.latin}</p><p>${t.english}</p><p class="quiet">${t.note}</p></article>`).join(``)}<h2>Four words in the argument</h2><dl>${u.map(e=>`<dt><span lang="grc">${e.greek}</span> · ${e.roman} · <span lang="la">${e.latin}</span> · ${e.english}</dt><dd>${e.note}</dd>`).join(``)}</dl>
<footer><p><a href="https://antonsoo.github.io/pyknon/canon.html${g(e)}#canon">Open this comparison</a> · <a href="${o}">Complete scanned edition</a> · <a href="https://github.com/antonsoo/pyknon">Code and source credits</a>.</p><p>Ratios multiply and cents add. Equal octave divisions are a modern comparison; no ancient absolute pitch, performance or instrument timbre is reconstructed. The six complete source pages and Greek font below are embedded in this document. It opens and prints offline.</p></footer>
${s.map((e,t)=>`<figure class="study-scan"><img src="${r(n,t)}" alt="Menge 1916, complete printed page ${e}"/><figcaption>Menge 1916, printed p. ${e}; ${e%2?`Latin translation`:`Greek text`}. Public-domain edition, Internet Archive California scan, PDF p. ${e+58}.</figcaption></figure>`).join(``)}</body></html>`}function E(e){let t=document.querySelector(e);if(!t)throw Error(`Missing ${e}`);return t}var D=h(location.search),O=new e;E(`#app`).innerHTML=`
<a href="#canon" class="skip">Skip to the octave experiment</a>
<header class="site-header"><a href="./" class="brand" aria-label="Pyknon home">PYKNON<span lang="grc">πυκνόν</span></a><nav aria-label="Main"><a href="./#listen">Tetrachords</a><a href="./song.html">Read a song</a><a href="#canon" aria-current="page">Six tones</a><a href="./trial.html">String trial</a><a href="./rhythm.html">Rhythm</a><a href="./tension.html">Weighted strings</a><a href="https://github.com/antonsoo/pyknon">Code ↗</a></nav></header>
<main><section class="intro canon-intro" aria-labelledby="intro-title"><div><p class="eyebrow">ANCIENT GREEK MUSIC / A NUMERICAL PROOF</p><h1 id="intro-title">Six whole tones.<br>An octave.<br>A small disagreement.</h1></div><div class="intro-copy"><p>A modern piano can climb six whole tones and reach an octave. The <i>Sectio canonis</i>, transmitted under Euclid’s name, proves that six tones are <strong>too much</strong>.</p><p class="quiet">The word “tone” hides a choice. Keep the ancient 9:8 ratio, follow seven printed numbers, and hear why the two routes part company.</p><a href="#canon" class="text-link">Hear the disagreement ↓</a></div></section>
<section id="canon" class="workbench canon-workbench" aria-labelledby="canon-title"><div class="section-heading"><div><p class="eyebrow">01 / KEEP THE INTERVAL, OR CLOSE THE OCTAVE</p><h2 id="canon-title" tabindex="-1">One step makes a difference.</h2></div><p class="section-aside"><i>Sectio canonis</i> IX &amp; XIV<br>9:8 tones / equal octave divisions</p></div>
<div class="canon-controls"><div><p class="step-label">Select a step · zero is the starting note</p><div class="step-buttons" role="group" aria-label="Number of intervals">${p.map((e,t)=>`<button type="button" data-step="${t}" aria-pressed="false" aria-label="Step ${t}, source letter ${e}">${t}</button>`).join(``)}</div></div><label>Modern starting reference<select id="root"><option value="110">A2 · 110 Hz</option><option value="220">A3 · 220 Hz</option><option value="440">A4 · 440 Hz</option></select></label></div>
<div class="canon-transport"><label class="sound-choice">Sound<select id="sound">${Object.entries(c).map(([e,t])=>`<option value="${e}">${t}</option>`).join(``)}</select></label><button type="button" id="play" class="primary">▶ Play</button><button type="button" id="stop" disabled>■ Stop</button></div><p class="canon-status" id="play-status" role="status">Ready. Simple sine tones; start at a comfortable volume.</p>
<figure class="canon-route"><div id="route-wide" class="route-wide"></div><div id="route-phone" class="route-phone"></div><figcaption><span>● 9:8 tones &nbsp; ○ Six equal divisions of an octave</span><span>Shared pitch scale · 1200 cents = one octave</span></figcaption></figure>
<div class="canon-readout"><div class="canon-detail"><p>SELECTED PAIR / ENLARGED SCALE</p><div id="detail"></div></div><div><dl class="pair-values"><div><dt id="ratio-label">9:8 route</dt><dd id="ratio-hz"></dd></div><div><dt id="equal-label">Equal-step route</dt><dd id="equal-hz"></dd></div></dl><p id="beat-reading" class="beat-reading"></p></div></div>
<p class="canon-boundary">The equal-step route uses 200 cents per step, with ratio 2^(1/6). It changes the premise: a 9:8 tone is about 203.91 cents. The same-frequency control uses two identical tones so the number of oscillators stays the same.</p></section>
<section id="numbers" class="canon-section" aria-labelledby="numbers-title"><div class="section-heading"><div><p class="eyebrow">02 / READ THE ARITHMETIC</p><h2 id="numbers-title">Seven numbers. Six multiplications.</h2></div><p class="section-aside">Proposition IX<br>Menge, printed pp. 170–171</p></div><div class="proof-layout"><div><div class="table-scroll" role="region" aria-label="Source integer progression" tabindex="0"><table class="integer-table"><caption>The printed progression, with modern step counts</caption><thead><tr><th>Step</th><th>Letter</th><th>Source integer</th><th>Ratio to Α</th></tr></thead><tbody>${_(D.root).map(e=>`<tr data-row="${e.step}"><th><button type="button" data-step="${e.step}" aria-label="Inspect source row ${e.letter}, step ${e.step}" aria-pressed="false">${e.step}</button></th><td lang="grc">${e.letter}</td><td>${e.source}</td><td>${e.ratio.join(`/`)}</td></tr>`).join(``)}</tbody></table></div><p class="quiet">Α–Η label numbers in a ratio proof. Here they become proportional frequencies; they are not presented as measured string lengths.</p></div><article class="integer-working"><h3 id="integer-title"></h3><div id="integer-working"></div><div class="integer-proof"><p><strong>Η exceeds twice Α.</strong></p><p class="integer-equation">531441 &gt; 524288</p><p>Twice 262144 is 524288. The excess is <strong>7153</strong>. No rounded cents or listening judgment is needed for the inequality.</p></div><button type="button" id="inspect-number">Inspect the printed numbers ↓</button></article></div>
<details class="canon-notes"><summary>What is the small excess called?</summary><p>Relative to the octave, the excess has ratio <strong>531441/524288</strong>, about 23.46 cents. It is commonly called the <strong>Pythagorean comma</strong>. At a 220 Hz starting reference the final pair is 440 Hz and about 446.003 Hz: together, the generated signal has about 6.003 amplitude beats per second.</p><p>Modern algebra connects the same excess to twelve 3:2 fifths compared with seven octaves: (3/2)^12 ÷ 2^7 = 531441/524288. This connection is added here; proposition IX itself uses six 9:8 intervals. It is different from the 81/80 <i>syntonic</i> comma.</p><p>The two equal-step tones in the control have identical frequency, envelope and starting phase. They have no frequency-difference beating. Changing the starting reference changes the beat rate in hertz, while the interval in cents stays the same.</p></details></section>
<section id="reading" class="canon-section" aria-labelledby="reading-title"><div class="section-heading"><div><p class="eyebrow">03 / THE WORDS OF THE PROOF</p><h2 id="reading-title" tabindex="-1">“Smaller than six tones.”</h2></div><p class="section-aside">Greek text / Menge’s Latin<br>A new English translation</p></div><p>The <i>Sectio canonis</i> is transmitted under Euclid’s name; its authorship is not settled here. Proposition XIV joins the musical premises in XII and XIII to the numerical proof in IX. Read the complete short argument in four parts.</p><div class="canon-reading"><article class="canon-passage"><div class="passage-tabs" role="group" aria-label="Proposition XIV reading steps">${l.map((e,t)=>`<button type="button" data-passage="${t}" aria-pressed="false">${t+1} · ${[`Claim`,`Ratios`,`Numbers`,`Therefore`][t]}</button>`).join(``)}</div><div id="passage"></div></article><figure class="canon-source-view"><label>Complete printed page<select id="source-page">${s.map(e=>`<option value="${e}">${e} · ${e%2?`Latin`:`Greek`}</option>`).join(``)}</select></label><a id="source-link" href="./sources/canon/menge-174.jpg"><img id="source-image" src="./sources/canon/menge-174.jpg" width="1122" height="1800" alt="" loading="lazy"></a><figcaption>Heinrich Menge, <i>Euclidis opera omnia</i> VIII (1916). Select the image to open the full scan and zoom. XII is on 172–173; XIII and XIV on 174–175; IX on 170–171.</figcaption></figure></div>
<div class="canon-vocabulary"><h3>Four words carrying the argument</h3><div class="word-layout"><div class="word-tabs" role="group" aria-label="Vocabulary from the proof">${u.map((e,t)=>`<button type="button" data-word="${t}" aria-pressed="false"><span lang="grc">${e.greek}</span><span>${e.english}</span></button>`).join(``)}</div><article id="word-detail" aria-live="polite"></article></div></div>
<details class="scan canon-packet"><summary>Inspect all six source pages <span>Complete Greek and Latin pages, saved offline</span></summary><p>The 1916 edition is public domain. Greek uses normalized Unicode and joined line breaks; the bracketed [ἐστι] remains bracketed. The Latin is Menge’s translation. Our English notes and translations are new. <a href="${o}">Open the complete edition ↗</a>.</p><div class="scan-grid">${s.map(e=>`<figure><a href="./sources/canon/menge-${e}.jpg"><img loading="lazy" src="./sources/canon/menge-${e}.jpg" width="1122" height="1800" alt="Menge 1916, complete printed page ${e}, ${e%2?`Latin translation`:`Greek text`}"></a><figcaption>Printed p. ${e} · ${e%2?`Latin`:`Greek`}</figcaption></figure>`).join(``)}</div></details>
<div class="canon-downloads"><div class="save-row"><button type="button" id="share">Copy reading link</button><button type="button" id="wav">Save selected sound · WAV</button><button type="button" id="csv">Save numbers · CSV</button><button type="button" id="study">Save illustrated reading · HTML</button></div><p id="save-status" role="status"></p><p>The HTML includes all six scans and the Greek font. It opens and prints offline. WAV saves the selected step, reference and sound, without reconstructing an ancient instrument.</p></div></section>
<div class="canon-connections"><a href="./#listen">Hear Archytas’s different tetrachord divisions →</a><a href="./song.html">Read a surviving song in stone →</a></div></main>
<footer><p><strong>PYKNON</strong> · Six tones and an octave.</p><p id="offline-status">Checking offline availability…</p><p><a href="https://github.com/antonsoo/pyknon">Open source / MIT</a> · <a href="https://github.com/antonsoo/pyknon/blob/main/THIRD_PARTY.md">Sources &amp; credits</a></p></footer>`;function k(e){document.querySelectorAll(`[data-note]`).forEach(t=>{t.classList.toggle(`sounding`,e!==null&&(D.sound===`beat`||D.sound===`control`?t.dataset.step===String(D.step):t.dataset.note===`${e.tuning}-${e.note}`))}),e&&(E(`#play-status`).textContent=D.sound===`beat`||D.sound===`control`?`${c[D.sound]} · step ${D.step}`:`${e.tuning===`ratios`?`9:8 route`:`Equal-step route`} · step ${e.note} · ${e.hz.toFixed(3)} Hz`)}function A(e=`Stopped.`){O.stop(),k(null),E(`#stop`).disabled=!0,E(`#play-status`).textContent=e}function j(e=!0){A(`Ready. Simple sine tones; start at a comfortable volume.`);let t=_(D.root),n=r(t,D.step);document.querySelectorAll(`button[data-step]`).forEach(e=>{e.setAttribute(`aria-pressed`,String(Number(e.dataset.step)===D.step))}),document.querySelectorAll(`[data-row]`).forEach(e=>{e.classList.toggle(`selected`,Number(e.getAttribute(`data-row`))===D.step)}),E(`#root`).value=String(D.root),E(`#sound`).value=D.sound,E(`#route-wide`).innerHTML=x(D),E(`#route-phone`).innerHTML=x(D,!0),E(`#detail`).innerHTML=S(D),E(`#ratio-hz`).textContent=`${n.ratioHz.toFixed(3)} Hz`,E(`#equal-hz`).textContent=`${n.equalHz.toFixed(3)} Hz`,E(`#beat-reading`).textContent=`${n.differenceCents.toFixed(3)} cents apart. ${n.beatHz.toFixed(3)} amplitude beats per second when these two generated tones sound together.${D.step===0?` The starting notes coincide.`:``}`,E(`#integer-title`).textContent=`Step ${D.step} · ${n.letter} = ${n.source}`;let i=t[D.step-1];E(`#integer-working`).innerHTML=i?`<p>Add one eighth of the preceding number:</p><p class="integer-equation">${i.source} + ${i.source/8}<br>= ${n.source}</p><p>${i.source} × 9/8 = ${n.source}. From Α, the cumulative ratio is <strong>${n.ratio.join(`/`)}</strong>.</p>`:`<p>Α starts the progression at 262144, which is 8^6. This choice lets six successive multiplications by 9/8 remain whole numbers.</p><p class="integer-equation">262144 × 1 = 262144</p><p>There are seven numbers but six intervals. Both audible routes start here.</p>`,document.querySelectorAll(`[data-passage]`).forEach(e=>{e.setAttribute(`aria-pressed`,String(Number(e.dataset.passage)===D.passage))});let a=r(l,D.passage);E(`#passage`).innerHTML=`<h3>${a.label}</h3><p class="greek-line" lang="grc">${a.greek}</p><p class="latin-line" lang="la">${a.latin}</p><p class="english-line">${a.english}</p><p class="reading-note">${a.note}</p>`,E(`#source-page`).value=String(D.page);let o=`./sources/canon/menge-${D.page}.jpg`;E(`#source-image`).src=o,E(`#source-image`).alt=`Menge 1916, complete printed page ${D.page}, ${D.page%2?`Latin translation`:`Greek text`}`,E(`#source-link`).href=o,e&&(history.replaceState(null,``,`${location.pathname}${g(D)}${location.hash}`),E(`#save-status`).textContent=``)}function M(e){let t=r(u,e);document.querySelectorAll(`[data-word]`).forEach(t=>{t.setAttribute(`aria-pressed`,String(Number(t.dataset.word)===e))}),E(`#word-detail`).innerHTML=`<p class="word-title"><span lang="grc">${t.greek}</span> <span>${t.roman}</span></p><h3>${t.english}</h3><p lang="la">${t.latin}</p><p>${t.note}</p><p class="source-caption">Forms occur in the printed argument; Latin and Greek dictionary forms may have different endings. Romanization is a reading aid, not a pronunciation recording.</p>`}document.addEventListener(`click`,e=>{let t=e.target.closest(`button`);t&&(t.dataset.step!==void 0&&(D.step=Number(t.dataset.step),j()),t.dataset.passage!==void 0&&(D.passage=Number(t.dataset.passage),j()),t.dataset.word!==void 0&&M(Number(t.dataset.word)))});for(let e of[`root`,`sound`,`source-page`])E(`#${e}`).addEventListener(`change`,()=>{D=h(`?n=${D.step}&a=${E(`#root`).value}&sound=${E(`#sound`).value}&p=${D.passage}&page=${E(`#source-page`).value}`),j()});E(`#inspect-number`).addEventListener(`click`,()=>{D.page=171,j(),location.hash=`reading`,E(`#reading-title`).focus({preventScroll:!0}),E(`#reading`).scrollIntoView({block:`start`})}),E(`#play`).addEventListener(`click`,async()=>{E(`#stop`).disabled=!1,E(`#play-status`).textContent=`Starting audio…`;try{await O.play(y(D),k,()=>{E(`#stop`).disabled=!0,E(`#play-status`).textContent=`Finished. Change a step or try another sound.`})}catch{A(`Audio could not start. The diagram and arithmetic remain available.`)}}),E(`#stop`).addEventListener(`click`,()=>A()),document.addEventListener(`visibilitychange`,()=>{document.hidden&&A(`Paused when the page was hidden. Press play to listen again.`)}),window.addEventListener(`pagehide`,()=>A()),window.addEventListener(`popstate`,()=>{D=h(location.search),j(!1)});function N(e,t){let n=URL.createObjectURL(e),r=document.createElement(`a`);r.href=n,r.download=t,r.click(),setTimeout(()=>URL.revokeObjectURL(n),3e4)}E(`#csv`).addEventListener(`click`,()=>{N(new Blob([b(D)],{type:`text/csv;charset=utf-8`}),`pyknon-canon-${D.root}-step-${D.step}.csv`),E(`#save-status`).textContent=`Saved all seven source integers and both frequency routes; the selected row is identified.`});for(let e of[`wav`,`study`])E(e===`wav`?`#wav`:`#study`).addEventListener(`click`,async()=>{let n={...D},r=E(`#${e}`);r.disabled=!0,E(`#save-status`).textContent=e===`wav`?`Rendering the selected sound…`:`Embedding the source pages and Greek font…`;try{N(e===`wav`?await t(y(n)):new Blob([await T(n)],{type:`text/html;charset=utf-8`}),`pyknon-canon-${n.root}-step-${n.step}-${n.sound}.${e===`wav`?`wav`:`html`}`),E(`#save-status`).textContent=e===`wav`?`Saved step ${n.step}, ${n.root} Hz: ${c[n.sound]}.`:`Saved step ${n.step}, ${n.root} Hz, all four reading steps and six complete source pages. Open or print the HTML offline.`}catch{E(`#save-status`).textContent=`The export could not finish. Try again when the complete edition is available.`}finally{r.disabled=!1}});E(`#share`).addEventListener(`click`,async()=>{let e=`${location.origin}${location.pathname}${g(D)}#canon`;try{await navigator.clipboard.writeText(e),E(`#save-status`).textContent=`Copied the step, reference, sound, reading sentence and source page.`}catch{E(`#save-status`).textContent=`Copy this reading link: ${e}`}}),j(!1),M(2),n(E(`#offline-status`));