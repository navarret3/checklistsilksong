// Cache version bump (v5) para forzar clientes a actualizar tras cambios críticos (webhook, estilos, lógica).
// Incrementa CACHE_VERSION con modificaciones de recursos esenciales.
// Futuro: usar nombres con hash y estrategia de caché más granular.
const CACHE_VERSION='v5';
const CACHE_NAME=`sschecklist-${CACHE_VERSION}`;
const CORE_ASSETS=[
  '/',
  // Excluimos index.html del precache para forzar siempre la versión de red (meta webhook dinámica)
  '/assets/app.css',
  '/src/js/main.js',
  '/src/js/ui.js',
  '/src/js/progress.js',
  '/src/js/dataLoader.js',
  '/src/js/storage.js',
  '/src/js/i18n.js',
  '/data/silksong_items.json',
  '/src/i18n/en.json'
];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(CORE_ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e=>{
  const req=e.request;
  if(req.method!=='GET') return;
  const url = new URL(req.url);
  // Nunca cachear index.html para que la meta del webhook refleje el último deploy
  if(url.pathname==='/' || url.pathname==='/index.html'){
    e.respondWith(fetch(req).catch(()=>caches.match('/assets/app.css')));
    return;
  }
  e.respondWith(
    caches.match(req).then(cached=>cached||fetch(req).then(res=>{
      const copy=res.clone();
      if(copy.ok && copy.type==='basic'){
        caches.open(CACHE_NAME).then(c=>c.put(req, copy)).catch(()=>{});
      }
      return res;
    }).catch(()=>cached))
  );
});
