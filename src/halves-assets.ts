import manifest from "virtual:halves-sources";

export { manifest as HALF_SOURCES };

const pending = new Map<string, Promise<ArrayBuffer>>();
export async function halfBytes(file: string): Promise<ArrayBuffer> {
  const expected = [...manifest.pages, ...manifest.assets].find((a) => a.file === file);
  if (!expected) throw new Error("This edition has no identity for the selected asset.");
  const found = pending.get(file);
  if (found) return found;
  const task = (async () => {
    const controller = new AbortController(),
      timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}${file}`, {
        signal: controller.signal,
      });
      if (!response.ok)
        throw new Error("The complete page or font is unavailable. Reconnect and retry.");
      const bytes = await response.arrayBuffer(),
        sha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
          .map((x) => x.toString(16).padStart(2, "0"))
          .join("");
      if (bytes.byteLength !== expected.bytes || sha !== expected.sha256)
        throw new Error("These bytes do not match this edition’s source page, font or license.");
      return bytes;
    } catch (e) {
      if (controller.signal.aborted)
        throw new Error("Source verification timed out. Reconnect and retry.");
      throw e;
    } finally {
      clearTimeout(timer);
    }
  })();
  pending.set(file, task);
  try {
    return await task;
  } catch (e) {
    pending.delete(file);
    throw e;
  }
}
export async function halfData(file: string, mime: string): Promise<string> {
  return halfDataFrom(await halfBytes(file), mime);
}
export async function halfDataFrom(input: ArrayBuffer | Blob, mime: string): Promise<string> {
  const bytes = new Uint8Array(input instanceof Blob ? await input.arrayBuffer() : input);
  let text = "";
  for (let i = 0; i < bytes.length; i += 8192)
    text += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return `data:${mime};base64,${btoa(text)}`;
}
export async function halfText(file: string): Promise<string> {
  return new TextDecoder().decode(await halfBytes(file));
}
export function halfPage(pdf: number) {
  const page = manifest.pages.find((p) => p.pdfPage === pdf);
  if (!page) throw new Error("Unknown source page.");
  return page;
}
export function halfCaption(pdf: number): string {
  const p = halfPage(pdf);
  return `${p.printedPage === "title" ? "Title" : `Printed p.${p.printedPage}`} · PDF p.${p.pdfPage} · Menge, 1916 · complete page`;
}
