import codeLicense from "../LICENSE?raw";
import { NOTE_ROWS, type NotationState } from "./core/notation";
import { type FrameSign, type FrameState, notationFrame } from "./core/notation-frame";
import { NOTATION_READINGS } from "./notation-content";
import { ne, nn, signPaths } from "./notation-shapes";

const hypolydianBands: Record<FrameSign, readonly (readonly [number, number])[]> = {
  // Pixel bounds in the retained 2200px page, normalized only for display.
  sigma: [[955 / 2200, 1001 / 2200]],
  iota: [
    [1151 / 2200, 1256 / 2200],
    [1410 / 2200, 1505 / 2200],
  ],
  zeta: [[1505 / 2200, 1599 / 2200]],
  "square-u": [[1701 / 2200, 1800 / 2200]],
};
export function frameBands(s: FrameState, page: string): readonly (readonly [number, number])[] {
  if (page === "370") return hypolydianBands[s.frameSign];
  if (page === "369")
    return NOTE_ROWS.filter((row) => row.vocal === s.frameSign).map((row) => row.band);
  return [];
}
export function framePlot(s: FrameState, context: "lydian" | "hypolydian"): string {
  const frame = notationFrame(s),
    table = frame[context];
  const all = [
    frame.lydian.meseHz,
    frame.lydian.signHz,
    frame.hypolydian.meseHz,
    frame.hypolydian.signHz,
  ];
  const low = Math.log2(Math.min(...all)) - 0.18,
    high = Math.log2(Math.max(...all)) + 0.18;
  const y = (hz: number) => 220 - ((Math.log2(hz) - low) / (high - low)) * 170;
  const signY = y(table.signHz),
    meseY = y(table.meseHz);
  return `<svg xmlns="http://www.w3.org/2000/svg" class="nt-frame-plot" width="460" height="270" viewBox="0 0 460 270" role="img" aria-label="${ne(table.table)}: selected sign ${nn(table.signHz)} Hz, mesē ${nn(table.meseHz)} Hz; both tables use one logarithmic pitch scale"><rect width="460" height="270" fill="#f0edf9"/><path d="M49 226 V42 L43 53 M49 42 L55 53" fill="none" stroke="#626070" stroke-width="1.5"/><path d="M80 ${meseY} H395" stroke="#626070" stroke-width="1.3" stroke-dasharray="5 5"/><path d="M80 ${signY} H395" stroke="#51419b" stroke-width="1.4"/><circle data-frame-mese-hz="${table.meseHz}" cx="137" cy="${meseY}" r="7" fill="#25223b"/><g data-frame-sign-hz="${table.signHz}" transform="translate(284 ${signY - 29})" fill="#f0edf9"><rect x="-10" y="-7" width="78" height="72"/><g fill="none" stroke="#51419b" stroke-width="4" stroke-linecap="square" stroke-linejoin="miter">${signPaths(s.frameSign)}</g></g><text x="85" y="251" font-family="Plex,sans-serif" font-size="14" fill="#25223b">mesē / dot</text><text x="255" y="251" font-family="Plex,sans-serif" font-size="14" fill="#51419b">selected vocal sign</text></svg>`;
}
export function frameReading(s: FrameState): string {
  const frame = notationFrame(s);
  return `<div class="nt-frame-views">${(["lydian", "hypolydian"] as const)
    .map((context) => {
      const t = frame[context];
      return `<article class="nt-frame-context" data-frame-context="${context}"><h3>${t.table}</h3><p lang="grc">${t.greek.map(ne).join(" / ")}</p><p class="nt-note">${t.names.map(ne).join(" or ")} · printed row${t.rows.length > 1 ? "s" : ""} ${t.rows.join(" / ")}, p${t.page}</p>${framePlot(s, context)}<dl><dt>Mesē in this context</dt><dd>${nn(t.meseHz)} Hz</dd><dt>Selected sign</dt><dd>${nn(t.signHz)} Hz · ${ne(t.signRatio)} × this mesē</dd></dl></article>`;
    })
    .join("")}</div>`;
}
export function frameResult(s: FrameState): string {
  const f = notationFrame(s);
  return `${f.anchorDescription} Hypolydian/Lydian mesē ratio: ${f.meseRelation}; selected-sign ratio: ${f.signRelation}. Lydian mesē ${nn(f.lydian.meseHz)} Hz; Hypolydian mesē ${nn(f.hypolydian.meseHz)} Hz. These ratios and hertz values belong to the chosen modern model.`;
}
export function notationFrameSheet(s: NotationState, font: string, fontLicense: string): string {
  const frame = notationFrame(s);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1120" height="820" viewBox="0 0 1120 820" role="img" aria-labelledby="frame-title frame-desc"><title id="frame-title">One pair, two tables: ${ne(frame.pair.label)}</title><desc id="frame-desc">${ne(frameResult(s))}</desc><metadata>${ne(JSON.stringify({ format: "pyknon-notation-tables", state: s, codeLicense, fontLicense }))}</metadata><defs><style>@font-face{font-family:Plex;src:url('${font}') format('woff2')}text{font-family:Plex,sans-serif;fill:#25223b}</style></defs><rect width="1120" height="820" fill="#fff"/><text x="42" y="42" font-size="13">PYKNON / ALYPIUS, JAN 1895 pp369–370 / MODERN COMPARISON</text><text x="42" y="94" font-size="37">One pair. Two tables.</text><text x="42" y="131" font-size="17">${ne(frame.pair.label)} · ${s.frameAnchor === "sign" ? "hold the selected sign’s pitch" : "hold both mesai at the reference"} · ${ne(s.tuning)} model</text>${(
    ["lydian", "hypolydian"] as const
  )
    .map((context, i) => {
      const table = frame[context],
        x = 42 + i * 540;
      return `<g data-table="${context}" data-source-rows="${table.rows.join(" ")}"><text x="${x}" y="188" font-size="27">${table.table}</text><text x="${x}" y="220" font-size="14">${ne(table.names.join(" or "))}</text><text x="${x}" y="245" font-size="13">Printed row${table.rows.length > 1 ? "s" : ""} ${table.rows.join(" / ")}, p${table.page}</text><g transform="translate(${x} 270)">${framePlot(s, context)}</g><text x="${x}" y="580" font-size="16">Mesē: ${nn(table.meseHz)} Hz</text><text x="${x}" y="611" font-size="16">Selected sign: ${nn(table.signHz)} Hz · ${ne(table.signRatio)} × mesē</text></g>`;
    })
    .join(
      "",
    )}<text x="42" y="661" font-size="16">${ne(frame.anchorDescription)}</text><text x="42" y="694" font-size="15">Hypolydian / Lydian mesē: ${ne(frame.meseRelation)}; selected sign: ${ne(frame.signRelation)}.</text><text x="42" y="730" font-size="13">One common current logarithmic pitch scale. Chosen Lydian mesē: ${s.reference} Hz. No ancient hertz is measured.</text><text x="42" y="759" font-size="13">Inspect both complete source pages for their actual forms and apparatus. Two possible functions remain where printed.</text><text x="42" y="793" font-size="12">New diagrams and code: MIT, Anton Soloviev 2026. Plex: SIL OFL 1.1. Full notices and editable state in metadata.</text></svg>`;
}
export function currentSourceBands(s: NotationState): readonly (readonly [number, number])[] {
  if (s.sourceContext === "frame") return frameBands(s, s.page);
  if (s.sourceContext === "reading") {
    if (s.page !== NOTATION_READINGS[s.reading]?.page) return [];
    const ids =
      s.reading === 2
        ? ["mese"]
        : s.reading === 3
          ? ["hypate-meson", "parhypate-meson"]
          : s.reading === 4
            ? ["nete-synemmenon", "diatonos-diezeugmenon"]
            : [];
    if (s.reading === 5) return [...hypolydianBands.sigma, ...hypolydianBands.iota.slice(0, 1)];
    return NOTE_ROWS.filter((row) => ids.includes(row.id)).map((row) => row.band);
  }
  const row = NOTE_ROWS.find((r) => r.id === s.row);
  return s.page === "369" && row ? [row.band] : [];
}
