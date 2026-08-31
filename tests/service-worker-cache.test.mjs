import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const root = resolve(import.meta.dirname, '..');
const scope = 'https://example.test/app/';
const requestUrl = value => new URL(typeof value === 'string' ? value : value.url, scope).toString();

class MemoryCache {
  constructor() { this.entries = new Map(); }
  async match(request, options = {}) {
    const target = new URL(requestUrl(request));
    for (const [key, response] of this.entries) {
      const candidate = new URL(key);
      if (options.ignoreSearch) { target.search = ''; candidate.search = ''; }
      if (candidate.toString() === target.toString()) return response.clone();
    }
    return undefined;
  }
  async put(request, response) { this.entries.set(requestUrl(request), response.clone()); }
  async delete(request) { return this.entries.delete(requestUrl(request)); }
  async keys() { return [...this.entries.keys()].map(url => new Request(url)); }
  async addAll(requests) {
    for (const request of requests) {
      const url = requestUrl(request);
      const body = url.endsWith('spell-icon-registry.js')
        ? 'assets/spell-icons/example.webp'
        : url.endsWith('monster-icon-registry.js') ? 'assets/monster-icons/example.webp' : `shell:${url}`;
      await this.put(url, new Response(body));
    }
  }
}

const createCacheStorage = () => {
  const stores = new Map();
  return {
    stores,
    async open(name) { if (!stores.has(name)) stores.set(name, new MemoryCache()); return stores.get(name); },
    async keys() { return [...stores.keys()]; },
    async delete(name) { return stores.delete(name); },
    async match(request, options) {
      for (const cache of stores.values()) {
        const response = await cache.match(request, options);
        if (response) return response;
      }
      return undefined;
    }
  };
};

test('service worker migrates images to a stable cache and keeps them out of the versioned shell', async () => {
  const caches = createCacheStorage();
  const legacy = await caches.open('dnd-character-sheet-v81');
  const image = `${scope}assets/spell-icons/example.webp`;
  const react = 'https://unpkg.com/react@18/umd/react.production.min.js';
  await legacy.put(image, new Response('legacy-image'));
  await legacy.put(react, new Response('legacy-react'));

  const listeners = {};
  let networkRequests = 0;
  const context = vm.createContext({
    self: {
      registration: { scope },
      location: new URL(scope),
      clients: { matchAll: async () => [] },
      skipWaiting: async () => {},
      addEventListener: (type, handler) => { listeners[type] = handler; }
    },
    clients: { claim: async () => {} },
    caches,
    fetch: async request => { networkRequests += 1; return new Response(`network:${requestUrl(request)}`); },
    Request,
    Response,
    URL,
    Set,
    Promise,
    Date,
    console
  });
  vm.runInContext(readFileSync(resolve(root, 'service-worker.js'), 'utf8'), context, { filename: 'service-worker.js' });

  let installPromise;
  listeners.install({ waitUntil: promise => { installPromise = promise; } });
  await installPromise;

  const assets = await caches.open('dnd-character-sheet-assets-v1');
  const vendors = await caches.open('dnd-character-sheet-vendor-v1');
  const shellName = (await caches.keys()).find(name => name.startsWith('dnd-character-sheet-shell-'));
  assert.ok(shellName, 'La caché versionada de la aplicación debe existir.');
  const shell = await caches.open(shellName);
  assert.equal(await (await assets.match(image)).text(), 'legacy-image');
  assert.equal(await (await vendors.match(react)).text(), 'legacy-react');
  assert.equal(await shell.match(image), undefined);

  let activatePromise;
  listeners.activate({ waitUntil: promise => { activatePromise = promise; } });
  await activatePromise;
  assert.equal(caches.stores.has('dnd-character-sheet-v81'), false);
  assert.equal(caches.stores.has('dnd-character-sheet-assets-v1'), true);

  const beforeImageRequest = networkRequests;
  let imageResponse;
  listeners.fetch({ request: new Request(image), respondWith: promise => { imageResponse = promise; } });
  assert.equal(await (await imageResponse).text(), 'legacy-image');
  assert.equal(networkRequests, beforeImageRequest);
});
