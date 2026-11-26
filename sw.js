// Beginner English Studio — service worker: makes the website open fast on phones (and offline)
const CACHE='bs-2026.11.27a';
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url);
  const same = u.origin === self.location.origin, sdk = u.host === 'www.gstatic.com' && u.pathname.startsWith('/firebasejs/');
  if (!same && !sdk) return;
  if (u.pathname.endsWith('.mp3')) return;                       // audio: let the browser stream it (range requests)                                   // Firestore / auth traffic goes straight to the network
  if (same && (req.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('.html'))) {
    // page: network first (to pick up new versions), cache as fallback (offline)
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); return r; }).catch(() => caches.match(req, {ignoreSearch: true})));
    return;
  }
  // scripts / styles / fonts / images / Firebase SDK: cache first (files are versioned with ?v=)
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return r; })));
});
