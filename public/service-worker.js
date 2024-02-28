self.skipWaiting();

self.addEventListener("fetch", function (_event) {
  //nothing for now
});

// self.addEventListener('install', function (e) {
//   console.log('[ServiceWorker] Install');
//   self.skipWaiting();
// });

// self.addEventListener('activate', function (e) {
//   console.log('[ServiceWorker] Activate');
//   return self.clients.claim();
// });

// self.addEventListener('fetch', function (e) {
//   // console.log('[Service Worker] Fetch', e.request.url);
//   // e.respondWith(fetch(e.request));
// });