// يحفظ شكل التطبيق على الموبايل عشان يفتح بسرعة. مفيش بيانات بتتخزن هنا.
const CACHE = 'shop-v2-shell-6';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', 'index.html', 'manifest.webmanifest', 'icon.svg'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const ok = u.origin === location.origin || u.hostname === 'cdn.jsdelivr.net' || u.hostname.endsWith('gstatic.com') || u.hostname.endsWith('googleapis.com');
  if (!ok) return; // طلبات Supabase تروح للنت مباشرة
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(r);
    const net = fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone()); return res; }).catch(() => hit);
    return hit || net;
  }));
});
