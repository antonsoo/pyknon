/* Offline edition e40699b2305d63292ce60d2cc27bd1da6204706d3c771b8487834c6b94f52c9d. Generated from the complete build. */
const CACHE = "pyknon-e40699b2305d63292ce60d2cc27bd1da6204706d3c771b8487834c6b94f52c9d";
const EDITION = "e40699b2305d63292ce60d2cc27bd1da6204706d3c771b8487834c6b94f52c9d";
const BASE = "/pyknon/";
const FILES = ["/pyknon/assets/main-GNOxR6ro.js","/pyknon/assets/offline-C1ECznnP.js","/pyknon/assets/offline-CyYOenOT.css","/pyknon/assets/song-B07dX343.js","/pyknon/assets/song-DU6C71Tm.css","/pyknon/fonts/IBMPlex-OFL.txt","/pyknon/fonts/IBMPlexSans-Regular.woff2","/pyknon/fonts/IBMPlexSans-SemiBold.woff2","/pyknon/fonts/NotoSerif-OFL.txt","/pyknon/fonts/NotoSerif-Regular.ttf","/pyknon/index.html","/pyknon/song.html","/pyknon/sources/macran-182.jpg","/pyknon/sources/seikilos/inscription.jpg","/pyknon/sources/seikilos/monro-correction.jpg","/pyknon/sources/seikilos/monro-ending.jpg","/pyknon/sources/seikilos/stele.jpg","/pyknon/sources/wallis-62.jpg","/pyknon/sources/wallis-63.jpg"];
const INTEGRITY = {"/pyknon/assets/main-GNOxR6ro.js":"sha256-XAPlpIUc5+e3qkHAkbVQfIlg9oWBJlt+yWDokkgp1nQ=","/pyknon/assets/offline-C1ECznnP.js":"sha256-AcaYGgkemRj+yhTtzIGkcyF+NuzNAutHl/Ob1a6S05M=","/pyknon/assets/offline-CyYOenOT.css":"sha256-izwPuZV08w6dJKUE0hVPNo5xa2tt6r8dlZgDkMyi0vE=","/pyknon/assets/song-B07dX343.js":"sha256-vTOsl4pE0oNse1GMf6a/7DKCkId3c1HCVhmfsq/llHU=","/pyknon/assets/song-DU6C71Tm.css":"sha256-6H2hjZuZX0R3IO9HbKIdVNdWKh1wU+SNO3BwX374m2A=","/pyknon/fonts/IBMPlex-OFL.txt":"sha256-fmsoGO29j2oBroBkHMjxalEIDQj7TlMr46C290rbB9o=","/pyknon/fonts/IBMPlexSans-Regular.woff2":"sha256-unEaMIX/nydEC2ucRVDPxHyXvzZZHV2pWLl1uzrdjBo=","/pyknon/fonts/IBMPlexSans-SemiBold.woff2":"sha256-94BIAw6rYuhg76OaDfeeLlWBvxIuuVubxCwLikmI0gU=","/pyknon/fonts/NotoSerif-OFL.txt":"sha256-zumJL58MyP6ILJ6VN+5qiWIdhu586vcLAuKyscJcBho=","/pyknon/fonts/NotoSerif-Regular.ttf":"sha256-VHPS5DvdAY7hJKSt26gJH9CimJSxIcu3QQI69lSWYrY=","/pyknon/index.html":"sha256-83pqV5k7x+4cD04Vz9UsraG+Df5/D2Hn03qfW0ofVeQ=","/pyknon/song.html":"sha256-pLGr6hk8fhXzs5wVBkBu/HmSFjg4CosS2a6dk6VEdTY=","/pyknon/sources/macran-182.jpg":"sha256-hw7ceLftPgjji/vkWHIqd0YjViIoFSstnAftdMgWVpc=","/pyknon/sources/seikilos/inscription.jpg":"sha256-2ndDBrs/BYc+cSZZZhLltiO9klWwVks20Rv7G+SCZyk=","/pyknon/sources/seikilos/monro-correction.jpg":"sha256-bfQnaKcoEfoZnH2JvUxOu8n7RtDR1j5BOmtMhFpgw00=","/pyknon/sources/seikilos/monro-ending.jpg":"sha256-wqitPb8v6uveG1HyWu5BVpDsMlTF9l102vJ0BaDRCsM=","/pyknon/sources/seikilos/stele.jpg":"sha256-nduAXxE821Vd3mKLQMjB78Pp+2wLE9QpBat9+3JrgFA=","/pyknon/sources/wallis-62.jpg":"sha256-u06OtS0gzCPLuRtOH/aoMZ6L0KgJKri4mdKXAIfUJ8I=","/pyknon/sources/wallis-63.jpg":"sha256-6ddO850Cst0SR5K46/8iYIBc7urWveajvgrbGpBNuv0="};
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
    const page = url.pathname === BASE || url.pathname === BASE + "index.html" ? BASE + "index.html" : url.pathname;
    if (FILES.includes(page)) event.respondWith(fetch(event.request).catch(() => caches.open(CACHE).then(cache => cache.match(page))));
  } else if (FILES.includes(url.pathname)) {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(url.pathname)).then(cached => cached || fetch(event.request)));
  }
});
