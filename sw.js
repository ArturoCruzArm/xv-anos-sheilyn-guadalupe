// Service Worker — Foro 7 · xv-anos-sheilyn-guadalupe
const IMAGE_CACHE = 'foro7-sheilyn-guadalupe-images-v1';
const APP_CACHE   = 'foro7-sheilyn-guadalupe-app-v1';

async function cacheFirstImage(request) {
    const cache  = await caches.open(IMAGE_CACHE);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
}

async function networkFirst(request) {
    const cache = await caches.open(APP_CACHE);
    try {
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
    } catch {
        const cached = await cache.match(request);
        return cached || new Response('Sin conexión', { status: 503 });
    }
}

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;
    const path = url.pathname;
    if (path.includes('/img/') || path.includes('/fotos/')) {
        event.respondWith(cacheFirstImage(event.request));
    } else {
        event.respondWith(networkFirst(event.request));
    }
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== IMAGE_CACHE && k !== APP_CACHE).map(k => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});
