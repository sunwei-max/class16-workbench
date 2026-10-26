// 高三16班工作台 Service Worker —— 网络优先 + 离线兜底
const CACHE = 'g16-workbench-v1-24c6215e';
const ASSETS = ['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./sw.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  e.respondWith((async () => {
    try {
      const net = await fetch(e.request);
      if (net && net.status === 200) {
        const cp = net.clone();
        caches.open(CACHE).then(c => c.put(e.request, cp)).catch(() => {});
        return net;
      }
    } catch (_) {}
    const cached = await caches.match(e.request);
    if (cached) return cached;
    if (e.request.mode === 'navigate') return caches.match('./index.html');
    return new Response('', { status: 504 });
  })());
});
