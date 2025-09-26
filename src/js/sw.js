// Basic service worker for offline shell & asset caching
const CACHE_NAME = 'silksong-checklist-v3';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/assets/images/favicon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if(request.method !== 'GET') return;
  event.respondWith(
    caches.match(request).then(cached => {
      if(cached) return cached;
      return fetch(request).then(resp => {
        const copy = resp.clone();
        // Only cache basic ok responses & same-origin
        if(resp.ok && request.url.startsWith(self.location.origin)){
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
        }
        return resp;
      }).catch(() => {
        // Optional: return fallback offline page if needed
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
