const APP_CACHE_PREFIX = "dnd-character-sheet-";
const APP_CACHE = `${APP_CACHE_PREFIX}v72`;
const WARM_OPTIONAL_ASSETS = "warm-optional-assets";
const OFFLINE_PROGRESS_MESSAGE = "offline-cache-progress";
const OPTIONAL_ASSETS_READY_URL = new URL("./.offline-assets-ready-v72", self.registration.scope).toString();
const APP_SHELL = [
    "./",
    "./index.html",
    "./styles.css",
    "./online-table.css",
    "./online-table-utils.js",
    "./app-utils.js",
    "./spell-library-srd51-es.js",
    "./spell-icon-registry.js",
    "./srd-spellcasting-profiles.js",
    "./srd-character-rules.js",
    "./phb2014-expansion.js",
    "./eberron-character-expansion.js",
    "./feat-compendium.js",
    "./monster-compendium-srd51.js",
    "./monster-icon-registry.js",
    "./magic-item-compendium-srd51-es.js",
    "./equipment-compendium-srd51-es.js",
    "./character-manager.js",
    "./development-checks.js",
    "./firebase-config.js",
    "./firebase-client.js",
    "./online-table-components.compiled.js",
    "./character-builder-components.compiled.js",
    "./bestiary-components.compiled.js",
    "./local-modal-components.compiled.js",
    "./spellbook-components.compiled.js",
    "./app.compiled.js",
    "./manifest.json",
    "./online-initiative-utils.js",
    "./icon-192.png",
    "./icon-512.png"
];

const IMAGE_REGISTRIES = [
    "./spell-icon-registry.js",
    "./monster-icon-registry.js"
];

const EXTERNAL_SHELL = [
    { url: "https://cdn.tailwindcss.com", mode: "no-cors" },
    { url: "https://unpkg.com/react@18/umd/react.production.min.js", mode: "no-cors" },
    { url: "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js", mode: "no-cors" },
    { url: "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js", mode: "cors" },
    { url: "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js", mode: "cors" },
    { url: "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js", mode: "cors" }
];

const GOOGLE_FONTS_STYLESHEET = "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800&family=Inter:wght@400;500;600&display=swap";
const STATIC_EXTERNAL_HOSTS = new Set([
    "cdn.tailwindcss.com",
    "unpkg.com",
    "www.gstatic.com",
    "fonts.googleapis.com",
    "fonts.gstatic.com"
]);

const cacheExternalResource = async (cache, url, mode = "no-cors") => {
    const request = new Request(url, { mode, credentials: "omit", cache: "reload" });
    const response = await fetch(request);
    if (!response || (!response.ok && response.type !== "opaque")) {
        throw new Error(`No se pudo precargar ${url}`);
    }
    await cache.put(request, response.clone());
    return response;
};

const cacheGoogleFonts = async cache => {
    const stylesheetRequest = new Request(GOOGLE_FONTS_STYLESHEET, { mode: "cors", credentials: "omit" });
    const response = await cache.match(stylesheetRequest)
        || await cacheExternalResource(cache, GOOGLE_FONTS_STYLESHEET, "cors");
    const css = await response.text();
    const fontUrls = [...new Set([...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map(match => match[1]))];
    await Promise.all(fontUrls.map(async url => {
        if (await cache.match(url)) return;
        await cacheExternalResource(cache, url, "cors");
    }));
};

const notifyOfflineProgress = async detail => {
    const windowClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    windowClients.forEach(client => client.postMessage({ type: OFFLINE_PROGRESS_MESSAGE, ...detail }));
};

const cacheRegisteredImages = async (cache, onProgress) => {
    const imageUrls = new Set();
    for (const registryPath of IMAGE_REGISTRIES) {
        const response = await cache.match(registryPath) || await fetch(registryPath, { cache: "no-store" });
        if (!response.ok) throw new Error(`No se pudo leer ${registryPath}`);
        const source = await response.text();
        for (const match of source.matchAll(/assets\/(?:spell-icons|monster-icons)\/[^"'\\\s]+\.webp/g)) {
            imageUrls.add(new URL(match[0], self.registration.scope).toString());
        }
    }

    const pending = [...imageUrls];
    const batchSize = 24;
    let completed = 0;
    await onProgress({ state: "progress", completed, total: pending.length });
    for (let index = 0; index < pending.length; index += batchSize) {
        const batch = pending.slice(index, index + batchSize);
        await Promise.all(batch.map(async url => {
            if (await cache.match(url)) return;
            const response = await fetch(url, { cache: "reload" });
            if (!response.ok) throw new Error(`No se pudo precargar ${url}`);
            await cache.put(url, response);
        }));
        completed += batch.length;
        await onProgress({ state: "progress", completed, total: pending.length });
    }
    return pending.length;
};

let optionalAssetsWarmup = null;
let optionalAssetsProgress = { completed: 0, total: 0 };
const warmOptionalAssets = () => {
    if (!optionalAssetsWarmup) {
        optionalAssetsWarmup = caches.open(APP_CACHE)
            .then(async cache => {
                const readyResponse = await cache.match(OPTIONAL_ASSETS_READY_URL);
                if (readyResponse) {
                    const ready = await readyResponse.json();
                    optionalAssetsProgress = { completed: ready.total, total: ready.total };
                    await notifyOfflineProgress({ state: "complete", ...optionalAssetsProgress, alreadyReady: true });
                    return;
                }

                optionalAssetsProgress = { completed: 0, total: 0 };
                await notifyOfflineProgress({ state: "starting", ...optionalAssetsProgress });
                const fontsWarmup = cacheGoogleFonts(cache);
                const imagesWarmup = cacheRegisteredImages(cache, async progress => {
                    optionalAssetsProgress = { completed: progress.completed, total: progress.total };
                    await notifyOfflineProgress(progress);
                });
                const [fontsResult, imagesResult] = await Promise.allSettled([fontsWarmup, imagesWarmup]);
                if (imagesResult.status === "rejected") throw imagesResult.reason;
                if (fontsResult.status === "rejected") throw fontsResult.reason;
                const total = imagesResult.value;
                optionalAssetsProgress = { completed: total, total };
                await cache.put(OPTIONAL_ASSETS_READY_URL, new Response(JSON.stringify({ total }), {
                    headers: { "Content-Type": "application/json" }
                }));
                await notifyOfflineProgress({ state: "complete", ...optionalAssetsProgress, alreadyReady: false });
            })
            .finally(() => { optionalAssetsWarmup = null; });
    }
    return optionalAssetsWarmup;
};

self.addEventListener("install", event => {
    event.waitUntil((async () => {
        const cache = await caches.open(APP_CACHE);
        await cache.addAll(APP_SHELL);
        await Promise.all(EXTERNAL_SHELL.map(resource => cacheExternalResource(cache, resource.url, resource.mode)));
        await self.skipWaiting();
    })());
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(key => key.startsWith(APP_CACHE_PREFIX) && key !== APP_CACHE)
                    .map(key => caches.delete(key))
            ))
            .then(() => clients.claim())
    );
});

self.addEventListener("message", event => {
    if (event.data?.type !== WARM_OPTIONAL_ASSETS) return;
    event.waitUntil(warmOptionalAssets().catch(async error => {
        await notifyOfflineProgress({ state: "error", ...optionalAssetsProgress });
        console.warn("[ServiceWorker] La precarga opcional se reanudara en la proxima apertura.", error);
    }));
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    const requestUrl = new URL(event.request.url);
    const isSameOrigin = requestUrl.origin === self.location.origin;
    const isFirebaseDataRequest = requestUrl.hostname.endsWith("firebaseio.com")
        || requestUrl.hostname.endsWith("firebaseapp.com")
        || requestUrl.hostname === "firestore.googleapis.com"
        || requestUrl.hostname === "identitytoolkit.googleapis.com"
        || requestUrl.hostname === "securetoken.googleapis.com";

    // Los datos de Auth y Firestore nunca pasan por Cache Storage.
    if (isFirebaseDataRequest) return;

    // Las librerias, hojas de estilo y fuentes externas son estaticas y se reutilizan offline.
    if (!isSameOrigin) {
        if (!STATIC_EXTERNAL_HOSTS.has(requestUrl.hostname)) return;
        event.respondWith(
            caches.open(APP_CACHE).then(async cache => {
                const cached = await cache.match(event.request);
                if (cached) return cached;
                try {
                    const response = await fetch(event.request);
                    if (response.ok || response.type === "opaque") await cache.put(event.request, response.clone());
                    return response;
                } catch (error) {
                    return Response.error();
                }
            })
        );
        return;
    }

    // La red tiene prioridad; la cache estatica es el respaldo offline.
    event.respondWith(
        fetch(event.request, { cache: "no-store" })
            .then(response => {
                if (response.ok) {
                    const copy = response.clone();
                    caches.open(APP_CACHE).then(cache => cache.put(event.request, copy));
                }
                return response;
            })
            .catch(() => caches.match(event.request, { ignoreSearch: true }).then(cached => {
                if (cached) return cached;
                if (event.request.mode === "navigate") return caches.match("./index.html");
                return Response.error();
            }))
    );
});
