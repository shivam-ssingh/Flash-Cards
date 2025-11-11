const CACHE_NAME = "flashcards-pwa-v1";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/app.js",
  "/manifest.json",
  "https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js",
  "https://cdn.tailwindcss.com",
];

self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evt) => {
  evt.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((resp) => resp || fetch(evt.request))
  );
});
