const LEGACY_CACHE_PREFIX = "dnd-character-sheet-";
const APP_CACHE_PREFIX = "dnd-character-sheet-shell-";
const APP_CACHE = `${APP_CACHE_PREFIX}v96`;
const ASSET_CACHE = "dnd-character-sheet-assets-v1";
const VENDOR_CACHE = "dnd-character-sheet-vendor-v1";
const WARM_OPTIONAL_ASSETS = "warm-optional-assets";
const OFFLINE_PROGRESS_MESSAGE = "offline-cache-progress";
const OPTIONAL_ASSETS_READY_URL = new URL("./.offline-assets-ready", self.registration.scope).toString();
const APP_SHELL = [
    "./",
    "./index.html",
    "./src/styles/app.css",
    "./src/styles/online-table.css",
    "./src/styles/dice.css",
    "./src/features/dice/dice-engine.js",
    "./src/features/dice/dice-3d.js",
    "./src/features/online-table/utils/initiative.js",
    "./src/features/online-table/utils/online-table-utils.js",
    "./src/shared/utils/app-utils.js",
    "./src/data/spell-library-srd51-es.js",
    "./src/data/spell-icon-registry.js",
    "./src/data/srd-spellcasting-profiles.js",
    "./src/data/srd-character-rules.js",
    "./src/data/phb2014-expansion.js",
    "./src/data/eberron-character-expansion.js",
    "./src/data/feat-compendium.js",
    "./src/data/monster-compendium-srd51.js",
    "./src/data/monster-icon-registry.js",
    "./src/data/magic-item-compendium-srd51-es.js",
    "./src/data/equipment-compendium-srd51-es.js",
    "./src/services/character-storage.js",
    "./src/shared/utils/development-checks.js",
    "./firebase-config.js",
    "./src/services/firebase.js",
    "./dist/features/dice/DiceRoller.js",
    "./dist/features/online-table/OnlineTableComponents.js",
    "./dist/features/character/CharacterBuilder.js",
    "./dist/features/bestiary/Bestiary.js",
    "./dist/shared/components/LocalModals.js",
    "./dist/features/spellbook/Spellbook.js",
    "./dist/shared/components/CharacterPrimitives.js",
    "./dist/features/companions/CompanionManager.js",
    "./dist/features/combat/SessionMode.js",
    "./dist/features/inventory/InventoryView.js",
    "./dist/features/character/CharacterFooter.js",
    "./dist/features/online-table/OnlineTable.js",
    "./dist/features/combat/CombatDashboard.js",
    "./dist/features/character/CharacterHeader.js",
    "./dist/features/character/CharacterSheet.js",
    "./dist/features/online-table/useOnlineRoom.js",
    "./dist/shared/components/dialogs/CompendiumDialogs.js",
    "./dist/shared/components/dialogs/ActionDialogs.js",
    "./dist/shared/components/dialogs/EditorDialogs.js",
    "./dist/app/CharacterSheetApp.js",
    "./dist/App.js",
    "./manifest.json",
    "./icon-192.png",
    "./icon-512.png"
];

const IMAGE_REGISTRIES = [
    "./src/data/spell-icon-registry.js",
    "./src/data/monster-icon-registry.js"
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
const PERSISTENT_EXTERNAL_HOSTS = new Set(["fonts.googleapis.com", "fonts.gstatic.com"]);
const isRegisteredImageUrl = url => {
    const parsed = typeof url === "string" ? new URL(url, self.registration.scope) : url;
    return parsed.origin === self.location.origin
        && /\/assets\/(?:spell-icons|monster-icons)\/[^/]+\.webp$/i.test(parsed.pathname);
};

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
    let downloaded = false;
    const stylesheetRequest = new Request(GOOGLE_FONTS_STYLESHEET, { mode: "cors", credentials: "omit" });
    let response = await cache.match(stylesheetRequest);
    if (!response) {
        response = await cacheExternalResource(cache, GOOGLE_FONTS_STYLESHEET, "cors");
        downloaded = true;
    }
    const css = await response.text();
    const fontUrls = [...new Set([...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map(match => match[1]))];
    await Promise.all(fontUrls.map(async url => {
        if (await cache.match(url)) return;
        await cacheExternalResource(cache, url, "cors");
        downloaded = true;
    }));
    return { downloaded };
};

const notifyOfflineProgress = async detail => {
    const windowClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    windowClients.forEach(client => client.postMessage({ type: OFFLINE_PROGRESS_MESSAGE, ...detail }));
};

const readRegisteredImageUrls = async () => {
    const imageUrls = new Set();
    for (const registryPath of IMAGE_REGISTRIES) {
        const response = await caches.match(registryPath, { ignoreSearch: true }) || await fetch(registryPath, { cache: "no-store" });
        if (!response.ok) throw new Error(`No se pudo leer ${registryPath}`);
        const source = await response.text();
        for (const match of source.matchAll(/assets\/(?:spell-icons|monster-icons)\/[^"'\\\s]+\.webp/g)) {
            imageUrls.add(new URL(match[0], self.registration.scope).toString());
        }
    }
    return imageUrls;
};

const pruneRemovedRegisteredImages = async (cache, imageUrls) => {
    const cachedRequests = await cache.keys();
    await Promise.all(cachedRequests
        .filter(request => isRegisteredImageUrl(request.url) && !imageUrls.has(new URL(request.url).toString()))
        .map(request => cache.delete(request)));
};

const cacheRegisteredImages = async (cache, onProgress) => {
    const imageUrls = await readRegisteredImageUrls();
    const allImages = [...imageUrls];
    const missing = [];
    const lookupBatchSize = 48;
    for (let index = 0; index < allImages.length; index += lookupBatchSize) {
        const batch = allImages.slice(index, index + lookupBatchSize);
        const matches = await Promise.all(batch.map(url => cache.match(url, { ignoreSearch: true })));
        batch.forEach((url, matchIndex) => { if (!matches[matchIndex]) missing.push(url); });
    }

    const batchSize = 16;
    let completed = allImages.length - missing.length;
    if (missing.length) await onProgress({ state: "progress", completed, total: allImages.length });
    for (let index = 0; index < missing.length; index += batchSize) {
        const batch = missing.slice(index, index + batchSize);
        await Promise.all(batch.map(async url => {
            const response = await fetch(url, { cache: "reload" });
            if (!response.ok) throw new Error(`No se pudo precargar ${url}`);
            await cache.put(url, response);
        }));
        completed += batch.length;
        await onProgress({ state: "progress", completed, total: allImages.length });
    }
    await pruneRemovedRegisteredImages(cache, imageUrls);
    return { total: allImages.length, downloaded: missing.length };
};

let optionalAssetsWarmup = null;
let optionalAssetsProgress = { completed: 0, total: 0 };
const warmOptionalAssets = () => {
    if (!optionalAssetsWarmup) {
        optionalAssetsWarmup = caches.open(ASSET_CACHE)
            .then(async cache => {
                optionalAssetsProgress = { completed: 0, total: 0 };
                const fontsWarmup = cacheGoogleFonts(cache);
                const imagesWarmup = cacheRegisteredImages(cache, async progress => {
                    optionalAssetsProgress = { completed: progress.completed, total: progress.total };
                    await notifyOfflineProgress(progress);
                });
                const [fontsResult, imagesResult] = await Promise.allSettled([fontsWarmup, imagesWarmup]);
                if (imagesResult.status === "rejected") throw imagesResult.reason;
                if (fontsResult.status === "rejected") throw fontsResult.reason;
                const total = imagesResult.value.total;
                const alreadyReady = imagesResult.value.downloaded === 0 && fontsResult.value.downloaded === false;
                optionalAssetsProgress = { completed: total, total };
                await cache.put(OPTIONAL_ASSETS_READY_URL, new Response(JSON.stringify({ total, checkedAt: new Date().toISOString() }), {
                    headers: { "Content-Type": "application/json" }
                }));
                await notifyOfflineProgress({ state: "complete", ...optionalAssetsProgress, alreadyReady });
            })
            .finally(() => { optionalAssetsWarmup = null; });
    }
    return optionalAssetsWarmup;
};

const migratePersistentAssets = async cacheNames => {
    const assetCache = await caches.open(ASSET_CACHE);
    const vendorCache = await caches.open(VENDOR_CACHE);
    for (const cacheName of cacheNames) {
        if (cacheName === ASSET_CACHE || cacheName === VENDOR_CACHE || cacheName === APP_CACHE) continue;
        if (!cacheName.startsWith(LEGACY_CACHE_PREFIX)) continue;
        const sourceCache = await caches.open(cacheName);
        const requests = await sourceCache.keys();
        const reusable = requests.filter(request => {
            const url = new URL(request.url);
            return isRegisteredImageUrl(url) || STATIC_EXTERNAL_HOSTS.has(url.hostname);
        });
        for (let index = 0; index < reusable.length; index += 24) {
            await Promise.all(reusable.slice(index, index + 24).map(async request => {
                const url = new URL(request.url);
                const targetCache = isRegisteredImageUrl(url) || PERSISTENT_EXTERNAL_HOSTS.has(url.hostname) ? assetCache : vendorCache;
                if (await targetCache.match(request, { ignoreSearch: true })) return;
                const response = await sourceCache.match(request);
                if (response) await targetCache.put(request, response);
            }));
        }
    }
};

self.addEventListener("install", event => {
    event.waitUntil((async () => {
        await migratePersistentAssets(await caches.keys());
        const cache = await caches.open(APP_CACHE);
        await cache.addAll(APP_SHELL);
        const vendorCache = await caches.open(VENDOR_CACHE);
        await Promise.all(EXTERNAL_SHELL.map(async resource => {
            if (await vendorCache.match(resource.url)) return;
            await cacheExternalResource(vendorCache, resource.url, resource.mode);
        }));
        await self.skipWaiting();
    })());
});

self.addEventListener("activate", event => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await migratePersistentAssets(keys);
        await Promise.all(keys
            .filter(key => key !== APP_CACHE && key !== ASSET_CACHE && key !== VENDOR_CACHE && key.startsWith(LEGACY_CACHE_PREFIX))
            .map(key => caches.delete(key)));
        await clients.claim();
    })());
});

self.addEventListener("message", event => {
    if (event.data?.type !== WARM_OPTIONAL_ASSETS) return;
    event.waitUntil(warmOptionalAssets().catch(async error => {
        await notifyOfflineProgress({ state: "error", ...optionalAssetsProgress });
        console.warn("[ServiceWorker] La precarga opcional queda pendiente de reintento.", error);
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
            caches.open(PERSISTENT_EXTERNAL_HOSTS.has(requestUrl.hostname) ? ASSET_CACHE : VENDOR_CACHE).then(async cache => {
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

    // Los iconos pesados viven en una cache estable: una actualizacion de la app no los duplica ni invalida.
    if (isRegisteredImageUrl(requestUrl)) {
        event.respondWith(
            caches.open(ASSET_CACHE).then(async cache => {
                const cached = await cache.match(event.request, { ignoreSearch: true });
                if (cached) return cached;
                try {
                    const response = await fetch(event.request);
                    if (response.ok) await cache.put(event.request, response.clone());
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
            .catch(() => caches.open(APP_CACHE).then(cache => cache.match(event.request, { ignoreSearch: true })).then(cached => {
                if (cached) return cached;
                if (event.request.mode === "navigate") return caches.open(APP_CACHE).then(cache => cache.match("./index.html"));
                return Response.error();
            }))
    );
});
