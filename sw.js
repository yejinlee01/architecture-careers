// 건축 채용 지도 - 오프라인 캐시
// 항상 인터넷의 최신 파일을 먼저 받고, 연결이 없을 때만 마지막으로 받은 사본을 보여 줍니다.
// publish.ps1 이 배포할 때마다 아래 버전을 바꿔 새 파일이 바로 반영되게 합니다.
const CACHE = 'arch-careers-202611221648';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'apple-touch-icon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request).then((hit) => hit || caches.match('index.html')))
  );
});
