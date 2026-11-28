// App shell cache so the app opens with no internet. No shop data is stored here.
const CACHE = 'shop-v2-shell-13';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'zxing.min.js'];
const CDN = ['https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2', 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(SHELL);
    await Promise.all(CDN.map(u => fetch(new Request(u, { mode: 'no-cors' })).then(r => c.put(u, r)).catch(() => { })));
  }).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const ok = u.origin === location.origin || u.hostname === 'cdn.jsdelivr.net' || u.hostname.endsWith('gstatic.com') || u.hostname.endsWith('googleapis.com');
  if (!ok) return; // Supabase requests go straight to the network
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(r) || (r.mode === 'navigate' ? await c.match('./', { ignoreSearch: true }) || await c.match('index.html', { ignoreSearch: true }) : undefined);
    const net = fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone()); return res; }).catch(() => hit || Response.error());
    return hit || net;
  }));
});
