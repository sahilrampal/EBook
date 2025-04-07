// sw.js - Service Worker File

const CACHE_NAME = 'my-site-cache-v1';
const ASSETS_TO_CACHE = [
    '/EBook/',
    '/EBook/index.html',
    '/EBook/css/bootstrap-icons.css',
    '/EBook/css/bootstrap.min.css',
    '/EBook/css/templatemo-ebook-landing.min.css',  
    '/EBook/js/bootstrap.bundle.min.js',
    '/EBook/js/click-scroll.js',
    '/EBook/js/custom.js',
    '/EBook/js/jquery.min.js',
    '/EBook/js/jquery.sticky.js',
    '/EBook/images/avatar/businessman-sitting-by-table-cafe.jpg',
    '/EBook/images/avatar/circle-scatter-haikei.png',
    '/EBook/images/avatar/education-online-books.png',
    '/EBook/images/avatar/portrait-mature-smiling-authoress-sitting-desk.jpg',
    '/EBook/images/avatar/tablet-screen-contents.jpg'
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