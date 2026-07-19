const APP_CACHE = "dnd-character-sheet-v7";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./online-table.css",
  "./online-table-utils.js",
  "./app-utils.js",
  "./spell-library-srd51-es.js",
  "./character-manager.js",
  "./development-checks.js",
  "./firebase-config.js",
  "./firebase-client.js",
  "./online-table-components.compiled.js",
  "./app.compiled.js",
  "./manifest.json",
    "./online-initiative-utils.js",
    "./icon-192.png",
    "./icon-512.png"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(APP_CACHE)
            .then(cache => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(key => key.startsWith("dnd-character-sheet-") && key !== APP_CACHE)
                    .map(key => caches.delete(key))
            ))
            .then(() => clients.claim())
    );
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    const requestUrl = new URL(event.request.url);
    const isSameOrigin = requestUrl.origin === self.location.origin;
    const isFirebaseRequest = requestUrl.hostname.endsWith("firebaseio.com")
        || requestUrl.hostname.endsWith("googleapis.com")
        || requestUrl.hostname.endsWith("firebaseapp.com")
        || requestUrl.hostname.endsWith("gstatic.com");

    // Auth y Firestore nunca pasan por caché; el resto de dominios externos queda a cargo del navegador.
    if (!isSameOrigin || isFirebaseRequest) return;

    // Prioriza la red para que una PWA instalada reciba los despliegues recientes.
    // La caché solo se usa como respaldo cuando el dispositivo está sin conexión.
    event.respondWith(
        fetch(event.request, { cache: 'no-store' })
            .then(response => {
                if (response.ok) {
                    const copy = response.clone();
                    caches.open(APP_CACHE).then(cache => cache.put(event.request, copy));
                }
                return response;
            })
            .catch(() => caches.match(event.request, { ignoreSearch: true }).then(cached => {
                if (cached) return cached;
                if (event.request.mode === 'navigate') return caches.match('./index.html');
                return Response.error();
            }))
    );
});
