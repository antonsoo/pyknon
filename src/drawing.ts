import { at, genus, hasPyknon, notes, type State } from "./core/tetrachord";

export function ruler(state: State): string {
  const values = notes(state);
  const x = (c: number) => 76 + c * 1.62;
  const positions = values.map((note) => x(note.cents));
  const keyNames = ["A", "B♭", "B", "C", "C♯", "D"];
  const intervals = genus(state.genus).intervals;
  return `<svg viewBox="0 0 962 363" role="img" aria-labelledby="ruler-title ruler-desc" xmlns="http://www.w3.org/2000/svg">
    <title id="ruler-title">${genus(state.genus).name}: ancient ratios and nearest modern keys</title>
    <desc id="ruler-desc">Four notes at ${values.map((n) => n.cents.toFixed(2)).join(", ")} cents. Rounded to ${values.map((n) => n.key * 100).join(", ")} cents. ${new Set(values.map((n) => n.key)).size === 3 ? "Notes 2 and 3 become the same key." : "Four distinct keys remain."} The table below gives the same measurements.</desc>
    <text x="76" y="24" class="svg-heading">ARCHYTAS’S RATIOS</text><text x="886" y="24" text-anchor="end" class="svg-small">LOWER PITCH → HIGHER PITCH</text>
    ${Array.from({ length: 6 }, (_, i) => `<line x1="${x(i * 100)}" x2="${x(i * 100)}" y1="45" y2="333" class="grid"/><text x="${x(i * 100)}" y="354" text-anchor="middle" class="svg-small">${i * 100}</text>`).join("")}
    <line x1="76" x2="${x(at(values, 3).cents)}" y1="99" y2="99" class="pitch-line"/>
    ${intervals.map((r, i) => `<path d="M${positions[i]},139v7H${positions[i + 1]}v-7" class="interval"/><text x="${(at(positions, i) + at(positions, i + 1)) / 2}" y="169" text-anchor="middle" class="svg-ratio">${r[0]}/${r[1]}</text>`).join("")}
    ${values.map((note) => `<path d="M${x(note.cents)},117 C${x(note.cents)},190 ${x(note.key * 100)},190 ${x(note.key * 100)},${note.index === 2 && at(values, 1).key === note.key ? 272 : 244}" class="rounding"/><text x="${x(note.cents)}" y="62" text-anchor="middle" class="svg-small">${note.cents.toFixed(1)}¢</text><g class="note original" data-note="ratios-${note.index}"><circle cx="${x(note.cents)}" cy="99" r="18"/><text x="${x(note.cents)}" y="105" text-anchor="middle">${note.index + 1}</text></g>`).join("")}
    ${hasPyknon(state.genus) ? `<path d="M76,185v8H${positions[2]}v-8" class="pyknon"/><text x="${(76 + at(positions, 2)) / 2}" y="214" text-anchor="middle" class="svg-small pyknon-label">pyknon</text>` : ""}
    <text x="886" y="219" text-anchor="end" class="svg-heading">NEAREST MODERN KEYS</text>
    ${values
      .map((note) => {
        const y = note.index === 2 && at(values, 1).key === note.key ? 274 : 246;
        return `<g class="note rounded" data-note="keyboard-${note.index}"><circle cx="${x(note.key * 100)}" cy="${y}" r="13"/><text x="${x(note.key * 100)}" y="${y + 5}" text-anchor="middle">${note.index + 1}</text></g>`;
      })
      .join("")}
    ${keyNames.map((name, i) => `<rect x="${x(i * 100) - 38}" y="299" width="76" height="32" rx="3" class="key ${i === 1 || i === 4 ? "accidental" : ""}"/><text x="${x(i * 100)}" y="321" text-anchor="middle" class="key-label ${i === 1 || i === 4 ? "on-dark" : ""}">${name}</text>`).join("")}
    <text x="943" y="354" text-anchor="end" class="svg-small">cents</text>
  </svg>`;
}

// A vertical ruler keeps all four pitches visible on a phone. Pitch is height;
// the two rounded enharmonic notes share a height, with labels side by side.
export function phoneRuler(state: State): string {
  const values = notes(state);
  const y = (c: number) => 414 - c * 0.65;
  const keyNames = ["A", "B♭", "B", "C", "C♯", "D"];
  return `<svg viewBox="0 0 330 460" role="img" aria-labelledby="ruler-title ruler-desc" xmlns="http://www.w3.org/2000/svg">
    <title id="ruler-title">${genus(state.genus).name}: ancient ratios and nearest modern keys</title>
    <desc id="ruler-desc">Pitch rises vertically. Four notes at ${values.map((n) => n.cents.toFixed(2)).join(", ")} cents round to ${values.map((n) => n.key * 100).join(", ")} cents. Notes 2 and 3 ${state.genus === "enharmonic" ? "share a modern key" : "remain distinct"}. See the measurements below for all frequencies.</desc>
    <text x="92" y="24" text-anchor="middle" class="svg-heading">RATIOS</text><text x="246" y="24" text-anchor="middle" class="svg-heading">MODERN KEYS</text>
    <text x="92" y="45" text-anchor="middle" class="svg-small">pitch rises ↑</text><text x="246" y="45" text-anchor="middle" class="svg-small">nearest 100¢</text>
    ${keyNames.map((name, i) => `<line x1="42" x2="298" y1="${y(i * 100)}" y2="${y(i * 100)}" class="grid"/><text x="30" y="${y(i * 100) + 4}" text-anchor="end" class="svg-small">${i * 100}</text><text x="310" y="${y(i * 100) + 5}" text-anchor="middle" class="svg-small">${name}</text>`).join("")}
    <line x1="92" x2="92" y1="${y(0)}" y2="${y(at(values, 3).cents)}" class="pitch-line"/>
    ${values
      .map((n) => {
        const split = state.genus === "enharmonic" && (n.index === 1 || n.index === 2);
        const rx = split ? (n.index === 1 ? 232 : 260) : 246;
        return `<path d="M110,${y(n.cents)}C167,${y(n.cents)} 180,${y(n.key * 100)} ${rx - 13},${y(n.key * 100)}" class="rounding"/><g class="note original" data-note="ratios-${n.index}"><circle cx="92" cy="${y(n.cents)}" r="14"/><text x="92" y="${y(n.cents) + 5}" text-anchor="middle">${n.index + 1}</text></g><g class="note rounded" data-note="keyboard-${n.index}"><circle cx="${rx}" cy="${y(n.key * 100)}" r="13"/><text x="${rx}" y="${y(n.key * 100) + 5}" text-anchor="middle">${n.index + 1}</text></g>`;
      })
      .join("")}
    ${hasPyknon(state.genus) ? `<path d="M67,${y(at(values, 2).cents)}h-8V${y(0)}h8" class="pyknon"/>` : ""}
    <text x="12" y="70" class="svg-small">cents</text><text x="92" y="452" text-anchor="middle" class="svg-small">${hasPyknon(state.genus) ? "bracket = pyknon" : "no pyknon"}</text>${state.genus === "enharmonic" ? '<text x="246" y="452" text-anchor="middle" class="svg-small">2 &amp; 3 → same key</text>' : ""}
  </svg>`;
}
