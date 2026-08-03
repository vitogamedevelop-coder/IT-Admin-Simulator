const CACHE_NAME = 'cyberlearn-v4';
// self.registration.scope is the deployment base ('/' locally, '/IT-Admin-Simulator/'
// on GitHub Pages), so precached URLs stay correct on every target.
const BASE = new URL(self.registration.scope).pathname;
const PRECACHE = ['', 'index.html', 'offline.html', 'manifest.json', 'favicon.svg', 'icon.svg', 'icons.svg'].map((p) => BASE + p);

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('cyberlearn-') && key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) return;
  event.respondWith(fetch(event.request).then((response) => {
    if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
    return response;
  }).catch(async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    if (event.request.mode === 'navigate') return caches.match(`${BASE}offline.html`);
    return new Response('', { status: 503 });
  }));
});
