export async function offline(status: HTMLElement) {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) {
    status.textContent = "Offline saving is available in the published build.";
    return;
  }
  try {
    await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`);
    const registration = await navigator.serviceWorker.ready;
    const channel = new MessageChannel();
    const response = new Promise<{ edition: string; complete: boolean }>((resolve, reject) => {
      const timer = setTimeout(() => {
        channel.port1.close();
        reject(new Error("timeout"));
      }, 8000);
      channel.port1.onmessage = (event) => {
        clearTimeout(timer);
        channel.port1.close();
        resolve(event.data);
      };
    });
    registration.active?.postMessage({ type: "PYKNON_INSPECT" }, [channel.port2]);
    const saved = await response;
    status.textContent =
      saved.edition === __PYKNON_EDITION__ && saved.complete
        ? "Ready offline · audio, diagrams & source scans saved."
        : "Offline edition is updating. Reload online to finish.";
  } catch {
    status.textContent = "Offline saving was unavailable. Keep this tab open or save a study.";
  }
}
