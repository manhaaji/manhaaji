// Manhaaji PWA Service Worker - Offline Caching Implementation
const CACHE_NAME = 'manhaaji-v1';

// Install event - cache resources and skip waiting
self.addEventListener('install', (event) => {
    console.log('[Manhaaji PWA] Install');
    self.skipWaiting();
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
    console.log('[Manhaaji PWA] Activate');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Manhaaji PWA] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Fetch event - Network First, falling back to cache strategy
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // If network request succeeds, cache the response and return it
                if (response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Network failed, try to serve from cache
                return caches.match(event.request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            console.log('[Manhaaji PWA] Serving from cache:', event.request.url);
                            return cachedResponse;
                        }

                        // If not in cache and it's a navigation request, serve offline page
                        if (event.request.mode === 'navigate') {
                            return caches.match('/404.html');
                        }

                        // For other requests, return a basic offline response
                        return new Response('Offline - Content not available', {
                            status: 503,
                            statusText: 'Service Unavailable',
                            headers: { 'Content-Type': 'text/plain' }
                        });
                    });
            })
    );
});
