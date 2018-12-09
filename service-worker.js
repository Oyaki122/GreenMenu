

const CACHE_NAME = 'cache-v7';
const urlsToCache = [
	'./',
	'src/main.js',
	'src/style.css',
];

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME)
			.then((cache) => {
				console.log('Opened cache');

				// 指定されたリソースをキャッシュに追加する
				return cache.addAll(urlsToCache);
			})
	);
});

self.addEventListener('activate', (event) => {
	var cacheWhitelist = [CACHE_NAME];

	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					// ホワイトリストにないキャッシュ(古いキャッシュ)は削除する
					if (cacheWhitelist.indexOf(cacheName) === -1) {
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});

self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request)
			.then((response) => {
				if (response) {
					return response;
				}

				// 重要：リクエストを clone する。リクエストは Stream なので
				// 一度しか処理できない。ここではキャッシュ用、fetch 用と2回
				// 必要なので、リクエストは clone しないといけない
				let fetchRequest = event.request.clone();

				return fetch(fetchRequest)
					.then((response) => {
						if (!response || response.status !== 200 || response.type !== 'basic') {
							return response;
						}


						return response;
					});
			})
	);
});