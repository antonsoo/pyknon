import manifest from "virtual:helikon-sources";

export { manifest as HELIKON_SOURCES };

const pending = new Map<string, Promise<ArrayBuffer>>();
export async function helikonBytes(file: string): Promise<ArrayBuffer> {
  const expected = [...manifest.pages, ...manifest.assets].find((a) => a.file === file);
  if (!expected) throw new Error("This edition has no identity for that source asset.");
  const found = pending.get(file);
  if (found) return found;
  const task = (async () => {
    const controller = new AbortController(),
      timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}${file}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("The source asset is unavailable. Reconnect and retry.");
      const bytes = await response.arrayBuffer();
      const sha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("");
      if (bytes.byteLength !== expected.bytes || sha !== expected.sha256)
        throw new Error("The received page, font or license does not match this edition.");
      return bytes;
    } catch (error) {
      if (controller.signal.aborted)
        throw new Error("Source verification timed out. Reconnect and retry.");
      throw error;
    } finally {
      clearTimeout(timer);
    }
  })();
  pending.set(file, task);
  try {
    return await task;
  } catch (error) {
    pending.delete(file);
    throw error;
  }
}
export async function helikonData(input: ArrayBuffer | Blob, mime: string): Promise<string> {
  const bytes = new Uint8Array(input instanceof Blob ? await input.arrayBuffer() : input);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return `data:${mime};base64,${btoa(binary)}`;
}
export function helikonPage(id: string) {
  const page = manifest.pages.find((p) => p.id === id);
  if (!page) throw new RangeError("Unknown source page.");
  return page;
}
export const helikonCaption = (id: string): string => {
  const p = helikonPage(id);
  return `Wallis, 1682 · ${id === "title" ? "title" : `printed p.${id}`} · PDF p.${p.pdfPage} · complete page`;
};
