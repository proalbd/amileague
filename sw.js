const CACHE_NAME = 'i-am-awami-league';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './scripts.js',
  './assets/i-am-awami-league.png',
  './assets/i-am-awami-league-2.png',
  './fonts/Kalpurush.ttf',
  './assets/favicon.ico',
  './assets/icon-192.png',
  './assets/icon-512.png'
  ];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});