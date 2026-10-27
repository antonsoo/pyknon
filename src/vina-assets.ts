import manifest from "virtual:vina-sources";

export { manifest as VINA_SOURCES };
export const VINA_FONTS = [
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
export function vinaPage(id: string) {
  const p = manifest.pages.find((p) => p.id === id);
  if (!p) throw Error("Unknown source page.");
  return p;
}
export function vinaCaption(id: string): string {
  const p = vinaPage(id);
  return `Grosset 1888 · ${p.printedPage === "title" ? "music study title" : `printed p.${p.printedPage}`} · PDF p.${p.pdfPage}. Complete public-domain page; apparatus and scan marks retained.`;
}
export function vinaOriginal(id: string): string {
  return `${manifest.sourcePdf.url}#page=${vinaPage(id).pdfPage}`;
}
export async function vinaBytes(file: string): Promise<ArrayBuffer> {
  const a = [...manifest.pages, ...VINA_FONTS].find((a) => a.file === file);
  if (!a) throw Error("Unknown source asset.");
  const r = await fetch(`${import.meta.env.BASE_URL}${file}`);
  if (!r.ok) throw Error("This source page or font could not be loaded. Retry when available.");
  const bytes = await r.arrayBuffer();
  const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
  if (hash !== a.sha256)
    throw Error(
      "These bytes do not match the retained source page or font. The unverified asset was refused.",
    );
  return bytes;
}
export async function vinaData(bytes: ArrayBuffer | Blob, mime: string): Promise<string> {
  const a = new Uint8Array(bytes instanceof Blob ? await bytes.arrayBuffer() : bytes);
  let text = "";
  for (let i = 0; i < a.length; i += 32768)
    text += String.fromCharCode(...a.subarray(i, i + 32768));
  return `data:${mime};base64,${btoa(text)}`;
}
