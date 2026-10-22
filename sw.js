/* Offline edition c21b6a69464ad1598e85a755411ded6db7fc961a1fd8263f2da907d3322dc70d. Generated from the complete build. */
const CACHE = "pyknon-c21b6a69464ad1598e85a755411ded6db7fc961a1fd8263f2da907d3322dc70d";
const EDITION = "c21b6a69464ad1598e85a755411ded6db7fc961a1fd8263f2da907d3322dc70d";
const BASE = "/pyknon/";
const FILES = ["/pyknon/assets/index-BeXHMmpl.js","/pyknon/assets/index-DCEa5ftA.css","/pyknon/fonts/IBMPlex-OFL.txt","/pyknon/fonts/IBMPlexSans-Regular.woff2","/pyknon/fonts/IBMPlexSans-SemiBold.woff2","/pyknon/fonts/NotoSerif-OFL.txt","/pyknon/fonts/NotoSerif-Regular.ttf","/pyknon/index.html","/pyknon/sources/macran-182.jpg","/pyknon/sources/wallis-62.jpg","/pyknon/sources/wallis-63.jpg"];
const INTEGRITY = {"/pyknon/assets/index-BeXHMmpl.js":"sha256-X8l1DQ1+U4xOCtd3qvaQBk61qO808PNH+Dcy8jzwfkY=","/pyknon/assets/index-DCEa5ftA.css":"sha256-8FKeJYNIVvJ9MBFwnd1tJoTMQu+wTO+x9ah97t1MsJI=","/pyknon/fonts/IBMPlex-OFL.txt":"sha256-fmsoGO29j2oBroBkHMjxalEIDQj7TlMr46C290rbB9o=","/pyknon/fonts/IBMPlexSans-Regular.woff2":"sha256-unEaMIX/nydEC2ucRVDPxHyXvzZZHV2pWLl1uzrdjBo=","/pyknon/fonts/IBMPlexSans-SemiBold.woff2":"sha256-94BIAw6rYuhg76OaDfeeLlWBvxIuuVubxCwLikmI0gU=","/pyknon/fonts/NotoSerif-OFL.txt":"sha256-zumJL58MyP6ILJ6VN+5qiWIdhu586vcLAuKyscJcBho=","/pyknon/fonts/NotoSerif-Regular.ttf":"sha256-VHPS5DvdAY7hJKSt26gJH9CimJSxIcu3QQI69lSWYrY=","/pyknon/index.html":"sha256-Md/HLcZML3EZA3MmQy5hPik41HAiz/eEUCp+5YZKhaA=","/pyknon/sources/macran-182.jpg":"sha256-hw7ceLftPgjji/vkWHIqd0YjViIoFSstnAftdMgWVpc=","/pyknon/sources/wallis-62.jpg":"sha256-u06OtS0gzCPLuRtOH/aoMZ6L0KgJKri4mdKXAIfUJ8I=","/pyknon/sources/wallis-63.jpg":"sha256-6ddO850Cst0SR5K46/8iYIBc7urWveajvgrbGpBNuv0="};
self.addEventListener("install", event => {
  // HTTP success does not establish edition identity. A stale entry page or
  // substituted scan must fail the complete install before this worker activates.
  const requests = FILES.map(url => new Request(url, { cache: "reload", integrity: INTEGRITY[url] }));
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(requests)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("pyknon-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("message", event => {
  if (event.data?.type !== "PYKNON_INSPECT" || !event.ports[0]) return;
  event.waitUntil(caches.open(CACHE).then(cache => cache.keys()).then(keys => {
    const saved = new Set(keys.map(request => new URL(request.url).pathname));
    event.ports[0].postMessage({ type: "PYKNON_EDITION", edition: EDITION, complete: FILES.every(file => saved.has(file)) });
  }).catch(() => event.ports[0].postMessage({ type: "PYKNON_EDITION", edition: EDITION, complete: false })));
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.open(CACHE).then(cache => cache.match(BASE + "index.html"))));
  } else if (FILES.includes(url.pathname)) {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(url.pathname)).then(cached => cached || fetch(event.request)));
  }
});
