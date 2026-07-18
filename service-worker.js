const APP_CACHE = "dnd-character-sheet-v3";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./online-table.css",
  "./online-table-utils.js",
  "./app-utils.js",
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

    event.respondWith(
        caches.match(event.request).then(cached => {
            const networkRequest = fetch(event.request)
                .then(response => {
                    if (response.ok) {
                        const copy = response.clone();
                        caches.open(APP_CACHE).then(cache => cache.put(event.request, copy));
                    }
                    return response;
                })
                .catch(() => cached);

            return cached || networkRequest;
        })
    );
});
