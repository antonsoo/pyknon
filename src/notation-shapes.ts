import type { Sign } from "./core/notation";

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
