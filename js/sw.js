// sw.js - Service Worker File

const CACHE_NAME = 'my-site-cache-v1';
const ASSETS_TO_CACHE = [
    '/EBOOK/',
    '/EBOOK/index.html',
    '/EBOOK/css/bootstrap-icons.css',
    '/EBOOK/css/bootstrap.min.css',
    '/EBOOK/css/templatemo-ebook-landing.min.css',  
    '/EBOOK/js/bootstrap.bundle.min.js',
    '/EBOOK/js/click-scroll.js',
    '/EBOOK/js/custom.js',
    '/EBOOK/js/jquery.min.js',
    '/EBOOK/js/jquery.sticky.js',
    '/EBOOK/images/avatar/businessman-sitting-by-table-cafe.jpg',
    '/EBOOK/images/avatar/circle-scatter-haikei.png',
    '/EBOOK/images/avatar/education-online-books.png',
    '/EBOOK/images/avatar/portrait-mature-smiling-authoress-sitting-desk.jpg',
    '/EBOOK/images/avatar/tablet-screen-contents.jpg'
  ];

// Install event - caches important files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Fetch event - serves cached content when available
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        // Not in cache - fetch from network
        return fetch(event.request);
      })
  );
});