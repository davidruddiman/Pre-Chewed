// Pre-Chewed Service Worker
// Caches the app shell for offline use and fast subsequent loads
var CACHE_NAME = 'precchewed-v3';
// Core app files to cache on install (relative to service worker scope,
// so this works whether the app sits at a domain root or a subpath like /Pre-Chewed/)
var APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];
// External CDN resources to cache when first fetched
var CDN_URLS = [
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.0.4/tesseract.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];
// Install: cache app shell immediately
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(APP_SHELL).catch(function(err) {
        // Non-fatal if some files miss during install
        console.warn('Pre-Chewed SW: cache install partial', err);
      });
    }).then(function() {
      return self.skipWaiting();
    })
  );
});
// Activate: remove old caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});
// Fetch: cache-first for app shell and CDN, network-first for everything else
self.addEventListener('fetch', function(event) {
  var url = event.request.url;
  // Only handle GET requests
  if (event.request.method !== 'GET') return;
  // Skip non-http(s) requests
  if (!url.startsWith('http')) return;
  // Build absolute URLs for app shell paths relative to this worker's scope,
  // so the comparison below works correctly at any subpath
  var scope = self.registration.scope; // e.g. https://davidruddiman.github.io/Pre-Chewed/
  var appShellAbsolute = APP_SHELL.map(function(path) {
    return new URL(path, scope).href;
  });
  // Cache-first strategy for app shell and CDN resources
  var isCacheable = appShellAbsolute.indexOf(url) !== -1 ||
    CDN_URLS.some(function(cdnUrl) { return url === cdnUrl; });
  if (isCacheable) {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        // Not in cache yet — fetch and store
        return fetch(event.request).then(function(response) {
          if (!response || response.status !== 200) return response;
          var toCache = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, toCache);
          });
          return response;
        }).catch(function() {
          // Offline fallback — return cached index if available
          return caches.match(new URL('./index.html', scope).href);
        });
      })
    );
    return;
  }
  // Network-first for everything else (e.g. Tesseract worker fetch)
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});
