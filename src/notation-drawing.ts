import codeLicense from "../LICENSE?raw";
import {
  type Alphabet,
  EXERCISES,
  NOTATION_LIMITS,
  NOTE_ROWS,
  type NotationState,
  notationJSON,
  noteFrequency,
  otherAlphabet,
  readSign,
  SIGNS,
  type Sign,
  translation,
} from "./core/notation";

export const ne = (value: string | number) =>
  String(value).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );
export const nn = (n: number) => Number(n.toFixed(6)).toString();

// Regularized new strokes checked against the retained print. Keeping these
// paths explicit avoids substituting Latin letters or extracting a chart font.
export function signPaths(sign: Sign): string {
  switch (sign) {
    case "sigma":
      return '<path d="M46 10 C4 0 4 56 46 46"/>';
    case "rho":
      return '<path d="M14 50 V8 H29 C55 8 55 32 29 32 H14"/>';
    case "mu":
      return '<path d="M10 50 V8 L29 33 L48 8 V50"/>';
    case "iota":
      return '<path d="M29 8 V50"/>';
    case "square-u":
      return '<path d="M12 8 V50 H46 V8"/>';
    case "zeta":
      return '<path d="M10 8 H48 L10 50 H48"/>';
    case "epsilon":
      return '<path d="M47 8 H12 V50 H47 M12 29 H40"/>';
    case "side-phi":
      return '<circle cx="29" cy="29" r="17"/><path d="M4 29 H54"/>';
    case "turned-sigma":
      return '<path d="M10 13 C0 55 56 55 46 13"/>';
    case "pi":
      return '<path d="M12 50 V8 H46 V50"/>';
    case "side-lambda":
      return '<path d="M47 8 L10 29 L47 50"/>';
    case "bracket":
      return '<path d="M47 8 H12 V50 H47"/>';
    case "slant-eta":
      return '<path d="M10 10 L26 35 L44 8 V50"/>';
  }
}
export function signSVG(sign: Sign | null, label?: string): string {
  const accessible = label ? `role="img" aria-label="${ne(label)}"` : 'aria-hidden="true"';
  return `<svg class="nt-sign" viewBox="0 0 58 58" ${accessible}><g fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="square" stroke-linejoin="miter">${sign ? signPaths(sign) : '<path stroke-dasharray="2 6" d="M12 46 H46"/>'}</g></svg>`;
}
export function signDescription(sign: Sign, alphabet: Alphabet): string {
  return `${SIGNS[sign]} · ${alphabet}: ${readSign(sign, alphabet)
    .map((r) => r.roman)
    .join(" or ")}`;
}
export function notationResult(s: NotationState): string {
  const line = translation(s),
    filled = line.filter((t) => t.answer).length,
    preserved = line.filter((t) => t.samePitch).length;
  if (!filled)
    return "The written line is empty. Choose a slot, then write a sign from the other alphabet. A blank slot remains a rest in the comparison.";
  return `${preserved} of ${line.length} notes preserve the given pitch in this model; ${line.length - filled} slots are blank. ${preserved === line.length ? "The notes agree. The sign pair at rows 11 and 14 still does not uniquely name a table function." : "A matching shape alone does not establish a matching note. Inspect the selected slot and the printed pair."}`;
}
export function translationDetail(s: NotationState): string {
  const t = translation(s)[s.cursor];
  if (!t) return "Choose a slot.";
  const lead = `Slot ${t.index + 1} asks for ${t.target.roman} (printed row ${t.target.number}).`;
  if (!t.answer) return `${lead} Nothing is written in the ${otherAlphabet(s.given)} line yet.`;
  const roles = t.candidates.map((r) => r.roman).join(" or ");
  return `${lead} The written ${SIGNS[t.answer]} reads ${roles}. ${t.samePitch ? "Its pitch agrees in the chosen model." : `Its pitch differs by ${nn(t.centsDifference ?? 0)} cents in the chosen model.`} ${t.candidates.length > 1 ? "Both possible functions remain listed; the sign alone does not choose one." : ""}`;
}
export function notationTable(s: NotationState, operable = false): string {
  return `<table class="nt-lookup"><caption>Selected Lydian diatonic rows · Jan 1895 p369. First sign vocal, second instrumental.</caption><thead><tr><th scope="col">Printed row / function</th><th scope="col">Vocal</th><th scope="col">Instrumental</th><th scope="col">${operable ? "Inspect" : "Modern model"}</th></tr></thead><tbody>${NOTE_ROWS.map((r) => `<tr${r.id === s.row ? ' class="nt-selected-row"' : ""} data-note-row="${r.id}"><th scope="row"><span class="nt-row-number">${r.number}</span><span lang="grc">${ne(r.greek)}</span><small>${ne(r.roman)}</small></th><td class="nt-vocal">${signSVG(r.vocal, signDescription(r.vocal, "vocal"))}</td><td class="nt-instrumental">${signSVG(r.instrumental, signDescription(r.instrumental, "instrumental"))}</td><td>${operable ? `<button type="button" data-nt-row="${r.id}" aria-label="Inspect printed row ${r.number}: ${ne(r.roman)}">Row ${r.number}</button>` : `${nn(noteFrequency(r, s))} Hz`}</td></tr>`).join("")}</tbody></table>`;
}
function svgSign(sign: Sign | null, x: number, y: number, size = 48) {
  return `<g transform="translate(${x} ${y}) scale(${size / 58})" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="square" stroke-linejoin="miter">${sign ? signPaths(sign) : '<path stroke-dasharray="2 6" d="M12 46 H46"/>'}</g>`;
}
export function notationSheet(s: NotationState, font: string, fontLicense: string): string {
  const line = translation(s),
    written = otherAlphabet(s.given);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="1220" viewBox="0 0 1120 1220" role="img" aria-labelledby="title desc"><title id="title">Pyknon: one sign, two alphabets</title><desc id="desc">${ne(notationResult(s))} ${ne(NOTATION_LIMITS)}</desc><metadata>${ne(JSON.stringify({ format: "pyknon-notation-sheet", native: JSON.parse(notationJSON(s)), codeLicense, fontLicense }))}</metadata><defs><style>@font-face{font-family:Plex;src:url('${font}') format('woff2')}text{font-family:Plex,sans-serif;fill:#25223b;font-size:17px}.small{font-size:13px}.vocal{color:#51419b}.instrumental{color:#ad4a19}</style></defs><rect width="1120" height="1220" fill="#fff"/><text x="42" y="45" class="small">PYKNON / ALYPIUS, JAN 1895 pp368–369 / NEW TEACHING DIAGRAMS</text><text x="42" y="97" style="font-size:38px">Keep the notes. Change the signs.</text><text x="42" y="132">${ne(EXERCISES[s.exercise].title)} · newly composed exercise · ${ne(s.given)} to ${ne(written)}</text><text x="42" y="190">Given / ${ne(s.given)}</text><text x="42" y="280">Written / ${ne(written)}</text>${line.map((t, i) => `<g data-slot="${i + 1}" data-target-function="${t.target.id}" data-written-sign="${t.answer ?? "blank"}" data-pitch-preserved="${t.samePitch}"><g class="${s.given}">${svgSign(t.target[s.given], 340 + i * 165, 150, 56)}</g><g class="${written}">${svgSign(t.answer, 340 + i * 165, 240, 56)}</g><text x="${325 + i * 165}" y="225" class="small">${nn(noteFrequency(t.target, s))} Hz</text><text x="${325 + i * 165}" y="320" class="small">${t.pitchRow ? `${nn(noteFrequency(t.pitchRow, s))} Hz` : "rest / blank"}</text></g>`).join("")}<text x="42" y="365" class="small">${ne(s.tuning)} instructional tuning; Lydian mese = ${s.reference} Hz; finite displayed approximations.</text><text x="42" y="397">The paired lookup / selected functions, not a universal shape-to-frequency code</text><text x="565" y="435">Vocal</text><text x="705" y="435">Instrumental</text><text x="884" y="435">Model ratio to mese</text>${NOTE_ROWS.map((r, i) => `<g data-printed-row="${r.number}"><path d="M42 ${455 + i * 67} H1078" stroke="#d9d2df"/><text x="42" y="${494 + i * 67}">${r.number}. ${ne(r.roman)}</text><g class="vocal">${svgSign(r.vocal, 571, 462 + i * 67, 46)}</g><g class="instrumental">${svgSign(r.instrumental, 740, 462 + i * 67, 46)}</g><text x="902" y="${494 + i * 67}" class="small">${s.tuning === "pythagorean" ? r.ratio.join("/") : `2^(${r.semitones}/12)`}</text></g>`).join("")}<text x="42" y="1104" class="small">Rows 11 and 14 retain different function names despite sharing both signs and the modeled pitch.</text><text x="42" y="1130" class="small">Original strokes are regularized; inspect the retained whole pages for their printed forms and apparatus.</text><text x="42" y="1156" class="small">No ancient concert pitch, instrument timbre, absolute duration or performance is recovered.</text><text x="42" y="1190" class="small">New code, English and diagrams: MIT, Anton Soloviev 2026. Plex: SIL OFL 1.1. Full notices in metadata.</text></svg>`;
}
