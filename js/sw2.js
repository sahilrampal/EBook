// sw.js - Complete Service Worker with Client Update Handling

const CACHE_NAME = 'my-site-cache-v2';
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

// ===== Service Worker Logic =====
self.addEventListener('install', event => {
  self.skipWaiting(); // Force immediate activation
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => 
      Promise.all(
        cacheNames.map(cache => 
          cache !== CACHE_NAME ? caches.delete(cache) : null
        )
      ).then(() => self.clients.claim())
    )
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  // Network-first for HTML
  if (event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Update cache
          const clone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request) || caches.match('/EBOOK/index.html'))
    );
    return;
  }
  
  // Cache-first with network update for assets
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        const fetched = fetch(event.request)
          .then(response => {
            if (response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, clone));
            }
            return response;
          })
          .catch(() => null);
        return cached || fetched;
      })
  );
});

// ===== Client Update Handling =====
if (typeof window !== 'undefined') {
  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/EBOOK/sw.js')
        .then(reg => {
          console.log('Service Worker registered');
          
          // Check for updates periodically
          setInterval(() => reg.update(), 60 * 60 * 1000);
          
          // Handle controller change
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
          });
          
          // Detect available update
          if (reg.waiting) notifyUpdate(reg);
          
          // Listen for new updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && reg.waiting) {
                notifyUpdate(reg);
              }
            });
          });
        })
        .catch(err => console.error('SW registration failed:', err));
    });
  }
  
  // Handle update notification
  function notifyUpdate(registration) {
    // Customize this UI as needed
    if (confirm('New version available! Reload to update?')) {
      registration.waiting.postMessage({action: 'skipWaiting'});
    }
  }
  
  // Listen for messages from service worker
  navigator.serviceWorker?.addEventListener('message', event => {
    if (event.data.action === 'reload') {
      window.location.reload();
    }
  });
}

// Handle skipWaiting message
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
    // Notify all clients to reload
    self.clients.matchAll().then(clients => {
      clients.forEach(client => client.postMessage({action: 'reload'}));
    });
  }
});