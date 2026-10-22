import { type CanonState, canonSteps } from "./core/canon";
import { at } from "./core/tetrachord";

export function canonRoute(s: CanonState, phone = false): string {
  const steps = canonSteps(s.root);
  const size = phone ? "0 0 320 410" : "0 0 960 235";
  const id = phone ? "phone" : "wide";
  const position = (cents: number) =>
    phone ? 360 - (cents / 1245) * 300 : 80 + (cents / 1245) * 800;
  const point = (cents: number, tuning: string) =>
    phone
      ? { x: tuning === "ratios" ? 94 : 226, y: position(cents) }
      : { x: position(cents), y: tuning === "ratios" ? 75 : 157 };
  const lines = steps
    .map((v) => {
      const p = point(v.equalCents, "keyboard");
      return phone
        ? `<line class="route-grid" x1="55" x2="265" y1="${p.y}" y2="${p.y}"/><text class="route-axis" x="280" y="${p.y + 4}" text-anchor="middle">${v.equalCents}</text>`
        : `<line class="route-grid" x1="${p.x}" x2="${p.x}" y1="45" y2="181"/><text class="route-axis" x="${p.x}" y="212" text-anchor="middle">${v.equalCents}</text>`;
    })
    .join("");
  const routes = (["ratios", "keyboard"] as const)
    .map((tuning) => {
      const first = point(0, tuning);
      const last = point(at(steps, 6)[tuning === "ratios" ? "ratioCents" : "equalCents"], tuning);
      return `<g class="route-${tuning}"><line class="route-line" x1="${first.x}" y1="${first.y}" x2="${last.x}" y2="${last.y}"/>${steps
        .map((v) => {
          const p = point(v[tuning === "ratios" ? "ratioCents" : "equalCents"], tuning);
          return `<g data-note="${tuning}-${v.step}" class="route-note ${s.step === v.step ? "selected" : ""}" data-step="${v.step}" data-cents="${v[tuning === "ratios" ? "ratioCents" : "equalCents"]}"><circle class="selection-ring" cx="${p.x}" cy="${p.y}" r="19"/><circle cx="${p.x}" cy="${p.y}" r="13"/><text x="${p.x}" y="${p.y + 5}" text-anchor="middle">${v.step}</text></g>`;
        })
        .join("")}</g>`;
    })
    .join("");
  return `<svg viewBox="${size}" role="img" aria-labelledby="route-${id}-title route-${id}-desc"><title id="route-${id}-title">Six 9:8 tones and six equal octave divisions, on one pitch scale</title><desc id="route-${id}-desc">Purple filled circles: 9:8 intervals. Outlined circles: modern 200-cent intervals. The numbers count intervals from zero. At six the first route reaches 1223.46 cents, past the octave at 1200 cents. Selected step ${s.step} is ringed. ${phone ? "Pitch rises vertically;" : "Pitch rises to the right;"} the axis is in cents.</desc>${lines}${routes}${phone ? '<text class="route-label" x="94" y="25" text-anchor="middle">9:8 tones</text><text class="route-label" x="226" y="25" text-anchor="middle">Equal steps</text><text class="route-axis" x="280" y="395" text-anchor="middle">cents</text>' : '<text class="route-label" x="3" y="80">9:8</text><text class="route-label" x="3" y="162">Equal</text><text class="route-axis" x="944" y="212" text-anchor="end">cents</text>'}</svg>`;
}

export function canonDetail(s: CanonState): string {
  const v = at(canonSteps(s.root), s.step);
  const low = v.equalCents - 4;
  const high = v.ratioCents + 4;
  const x = (c: number) => 32 + ((c - low) / (high - low)) * 296;
  const equal = x(v.equalCents),
    ratio = x(v.ratioCents);
  return `<svg viewBox="0 0 360 116" role="img" aria-labelledby="detail-title detail-desc"><title id="detail-title">Enlarged comparison at step ${s.step}</title><desc id="detail-desc">Equal-step position ${v.equalCents.toFixed(3)} cents; 9:8 position ${v.ratioCents.toFixed(3)} cents. Difference ${v.differenceCents.toFixed(3)} cents. This has its own enlarged scale.</desc><line class="route-grid" x1="20" x2="340" y1="54" y2="54"/><line class="detail-link" x1="${equal}" x2="${ratio}" y1="54" y2="54"/><g class="route-keyboard"><circle cx="${equal}" cy="54" r="7"/></g><g class="route-ratios"><circle cx="${ratio}" cy="54" r="7"/></g><text class="route-axis" x="${equal}" y="25" text-anchor="${s.step ? "start" : "middle"}">${v.equalCents.toFixed(2)}¢ · equal</text><text class="route-axis" x="${ratio}" y="94" text-anchor="${s.step ? "end" : "middle"}">${v.ratioCents.toFixed(2)}¢ · 9:8</text></svg>`;
}
