/* global self, caches */
const CACHE_NAME = /* __CACHE_NAME__ */ 'conjumaster-v2.0.0';
const CACHE_PREFIX = 'conjumaster-';
const APP_SHELL = /* __PRECACHE_MANIFEST__ */ [];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => {
        if (!self.registration.active) self.skipWaiting();
      }),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestURL = new URL(event.request.url);
  if (requestURL.origin !== self.location.origin) return;
  if (requestURL.pathname.startsWith('/api/')) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const cacheControl = response?.headers?.get?.('cache-control') || '';
          if (response && response.status === 200 && !/no-store/i.test(cacheControl)) {
            const copy = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put('./index.html', copy))
              .catch(() => {});
          }
          return response;
        })
        .catch(() =>
          caches.match('./index.html').then((cachedIndex) => {
            if (cachedIndex) return cachedIndex;
            if (typeof globalThis.Response === 'function') {
              return new globalThis.Response('Offline', {
                status: 503,
                statusText: 'Offline',
                headers: { 'Content-Type': 'text/plain; charset=utf-8' },
              });
            }
            return undefined;
          }),
        ),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          const cacheControl = networkResponse?.headers?.get?.('cache-control') || '';
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic' &&
            !/no-store/i.test(cacheControl)
          ) {
            const copy = networkResponse.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, copy))
              .catch(() => {});
          }
          return networkResponse;
        })
        .catch(() => {
          if (cached) return cached;
          if (typeof globalThis.Response === 'function') {
            return new globalThis.Response('', { status: 503, statusText: 'Offline' });
          }
          return undefined;
        });

      return cached || fetchPromise;
    }),
  );
});
