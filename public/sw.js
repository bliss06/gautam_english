const CACHE_NAME = 'gautam-english-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;

  // Navigations (index.html) must always come from the network so a new
  // deploy is picked up immediately — its hashed asset filenames change
  // every build, so a cached HTML can point at files that no longer exist.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() => caches.match(req).then(cached => cached || caches.match('/')))
    );
    return;
  }

  // Hashed build assets (JS/CSS/images) are content-addressed and safe to
  // cache-first, then updated in the background.
  e.respondWith(
    caches.match(req).then(cached => {
      const network = fetch(req).then(res => {
        if (res.ok) caches.open(CACHE_NAME).then(c => c.put(req, res.clone()));
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
