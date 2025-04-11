// sw.js - Service Worker File

const CACHE_NAME = 'my-site-cache-v2'; // Update version when files change
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
    // Force the waiting service worker to become active
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => {
            // Tell all clients to reload
            self.clients.claim();
            console.log('Service worker activated and old caches cleaned');
        })
    );
});

// Fetch event with network-first strategy
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // For HTML documents, try network first
    if (event.request.headers.get('accept').includes('text/html')) {
        event.respondWith(
            fetch(event.request)
                .then(networkResponse => {
                    // Update cache with fresh response
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, responseToCache));
                    return networkResponse;
                })
                .catch(() => {
                    return caches.match(event.request)
                        .then(cachedResponse => cachedResponse || caches.match('/EBOOK/index.html'));
                })
        );
        return;
    }
    
    // For other assets (CSS, JS, images), use cache-first with network update
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Always make network request to update cache
                const fetchPromise = fetch(event.request)
                    .then(networkResponse => {
                        // Only update cache if response is valid
                        if (networkResponse.status === 200) {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then(cache => cache.put(event.request, responseToCache));
                        }
                        return networkResponse;
                    })
                    .catch(() => {}); // Silent fail if network request fails
                
                // Return cached response if available, otherwise wait for network
                return cachedResponse || fetchPromise;
            })
    );
});