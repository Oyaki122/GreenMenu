const CACHE_NAME = 'cache-v1';
const urlsToCache = ['./', 'dist/main.js', 'src/style.css'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache');

            // 指定されたリソースをキャッシュに追加する
            return cache.addAll(urlsToCache);
        }),
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(cacheNames => Promise.all(
            cacheNames.map((cacheName) => {
                // ホワイトリストにないキャッシュ(古いキャッシュ)は削除する
                if (cacheWhitelist.indexOf(cacheName) === -1) {
                    return caches.delete(cacheName);
                }
            }),
        )),
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }

            // 重要：リクエストを clone する。リクエストは Stream なので
            // 一度しか処理できない。ここではキャッシュ用、fetch 用と2回
            // 必要なので、リクエストは clone しないといけない
            const fetchRequest = event.request.clone();

            return fetch(fetchRequest).then((response) => {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                return response;
            });
        }),
    );
});
