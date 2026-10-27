import manifest from "virtual:notation-sources";

export { manifest as NOTATION_SOURCES };

const pending = new Map<string, Promise<ArrayBuffer>>();
export async function notationBytes(file: string): Promise<ArrayBuffer> {
  const expected = [...manifest.pages, ...manifest.assets].find((a) => a.file === file);
  if (!expected) throw new Error("This edition has no identity for that page, font or license.");
  const existing = pending.get(file);
  if (existing) return existing;
  const task = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}${file}`, {
        signal: controller.signal,
      });
      if (!response.ok)
        throw new Error("The complete page, font or license is unavailable. Reconnect and retry.");
      const bytes = await response.arrayBuffer();
      const sha = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
        .map((n) => n.toString(16).padStart(2, "0"))
        .join("");
      if (bytes.byteLength !== expected.bytes || sha !== expected.sha256)
        throw new Error(
          "These bytes do not match this edition’s page, font or license. Reconnect and retry.",
        );
      return bytes;
    } catch (error) {
      if (controller.signal.aborted)
        throw new Error("Source verification timed out. Reconnect and retry.");
      throw error;
    } finally {
      clearTimeout(timeout);
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
export async function notationData(bytes: ArrayBuffer | Blob, mime: string): Promise<string> {
  const data = new Uint8Array(bytes instanceof Blob ? await bytes.arrayBuffer() : bytes);
  let text = "";
  for (let i = 0; i < data.length; i += 8192)
    text += String.fromCharCode(...data.subarray(i, i + 8192));
  return `data:${mime};base64,${btoa(text)}`;
}
export async function notationAsset(file: string, mime: string) {
  return notationData(await notationBytes(file), mime);
}
export async function notationText(file: string) {
  return new TextDecoder().decode(await notationBytes(file));
}
export function notationPage(id: string) {
  const page = manifest.pages.find((p) => p.id === id);
  if (!page) throw new Error("Unknown complete source page.");
  return page;
}
