import manifest from "./tension-sources.json";

export { manifest as TENSION_SOURCES };
export const TENSION_FONT_ASSETS = [
  {
    file: "fonts/IBMPlexSans-Regular.woff2",
    sha256: "ba711a3085ff9f27440b6b9c4550cfc47c97bf36591d5da958b975bb3add8c1a",
  },
  {
    file: "fonts/IBMPlexSans-SemiBold.woff2",
    sha256: "f78048030eab62e860efa39a0df79e2e5581bf122eb95b9bc42c0b8a4988d205",
  },
  {
    file: "fonts/NotoSerif-Regular.ttf",
    sha256: "5473d2e43bdd018ee124a4addba8091fd0a29894b121cbb741023af6549662b6",
  },
] as const;
export function sourcePage(id: string) {
  const p = manifest.pages.find((p) => p.id === id);
  if (!p) throw new Error("Unknown printed page.");
  return p;
}
export function sourceCaption(id: string): string {
  const p = sourcePage(id);
  return `${p.edition === "jan" ? "Jan 1895 · Greek critical edition" : "Meibom 1652 · Greek and Latin"} · printed p.${p.printedPage}, PDF p.${p.pdfPage}. Complete public-domain page; type, apparatus and scan marks retained.`;
}
export function sourceArchive(id: string): string {
  const p = sourcePage(id),
    edition = manifest.editions.find((e) => e.id === p.edition);
  return `https://archive.org/details/${edition?.archive}/page/n${p.archiveLeaf}/mode/1up`;
}
export async function verifiedBytes(file: string): Promise<ArrayBuffer> {
  const asset = [...manifest.pages, ...TENSION_FONT_ASSETS].find((a) => a.file === file);
  if (!asset) throw new Error("Unknown edition asset.");
  const response = await fetch(`${import.meta.env.BASE_URL}${file}`);
  if (!response.ok) throw new Error("The complete printed page or font is unavailable.");
  const bytes = await response.arrayBuffer();
  const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
  if (hash !== asset.sha256)
    throw new Error("These bytes do not match the selected printed page or font in this edition.");
  return bytes;
}
export async function dataUrl(bytes: ArrayBuffer | Blob, mime: string): Promise<string> {
  const a = new Uint8Array(bytes instanceof Blob ? await bytes.arrayBuffer() : bytes);
  let b = "";
  for (let i = 0; i < a.length; i += 32768) b += String.fromCharCode(...a.subarray(i, i + 32768));
  return `data:${mime};base64,${btoa(b)}`;
}
