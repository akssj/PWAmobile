const CACHE_NAME = 'pwa-cache-v1';
const CACHE_NAME_EXCHANGE = 'exchange-rates-cache-v1';

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(async cache => {
            const urlsToCache = [
                '/index.html',
                '/src/index.css',
                '/src/App.jsx',
                '/src/main.jsx',
                '/src/Components/CurrencyDetails/CurrencyDetails.jsx',
                '/src/Components/Account/Account.jsx',
                '/src/Components/Home/Home.jsx',
            ];
            const cachePromises = urlsToCache.map(async url => {
                try {
                    await cache.add(url);
                } catch (error) {
                    console.error(`Failed to cache ${url}:`, error);
                }
            });
            await Promise.all(cachePromises);
        })
    );
});


// Obsługa fetch
self.addEventListener('fetch', event => {
    if (event.request.url.includes('/api/data/getCurrencyHistory')) {
        // Obsługa zapytań do API kursów walut
        event.respondWith(
            caches.match(event.request).then(async response => {
                try {
                    return (
                        response ||
                        fetch(event.request).then(networkResponse => {
                            return caches.open(CACHE_NAME_EXCHANGE).then(cache => {
                                cache.put(event.request, networkResponse.clone());
                                return networkResponse;
                            });
                        })
                    );
                } catch (error) {
                    console.error('Fetch failed for API data:', error);
                    return response || new Response('Offline data not available.', { status: 503 });
                }
            })
        );
    } else {
        // Obsługa zapytań dla plików statycznych
        event.respondWith(
            caches.match(event.request).then(async response => {
                try {
                    return (
                        response ||
                        fetch(event.request).catch(error => {
                            console.error('Fetch failed for static files:', error);
                            console.error('event.request: ', event.request);
                            return new Response('Unable to fetch the resource.', { status: 503 });
                        })
                    );
                } catch (error) {
                    console.error('Unexpected error during fetch:', error);
                    return new Response('Unexpected error occurred.', { status: 500 });
                }
            })
        );
    }
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME, CACHE_NAME_EXCHANGE];
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            )
        )
    );
});


