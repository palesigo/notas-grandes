const base = new URL('./', self.location.href);
const prefix = `notas-grandes:${base.pathname}:`;
const cacheName = `${prefix}v1`;
const files = ['index.html','styles.css','app.js','core.js','manifest.webmanifest','icons/icon-180.png','icons/icon-192.png','icons/icon-512.png'];
const urls = new Set(files.map(file => new URL(file, base).href));
self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll([...urls].map(url => new Request(url, {cache:'reload'})))));
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const old = (await caches.keys()).filter(key => key.startsWith(prefix) && key !== cacheName);
    await Promise.all(old.map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const {request} = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const navigation = request.mode === 'navigate' && url.origin === base.origin &&
    (url.pathname === base.pathname || url.pathname === `${base.pathname}index.html`);
  if (!navigation && !urls.has(url.href)) return;
  const key = navigation ? new URL('index.html', base).href : url.href;
  event.respondWith(caches.open(cacheName).then(async cache => (await cache.match(key)) ?? fetch(request)));
});
