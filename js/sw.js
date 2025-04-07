// sw.js - Service Worker File

const CACHE_NAME = 'my-site-cache-v1';
const ASSETS_TO_CACHE = [
  '/', // Cache the root route
  '/index.html',
  '/styles.css', // Adjust path if your CSS is in a different location
  '/script.js'  // Add if you have any JavaScript files
  // Add paths to other assets (images, fonts) you want to cache
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