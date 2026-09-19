const CACHE_NAME = "nex-box-v10";

self.addEventListener("install", event => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => {
        return Promise.all(
          keys.map(key => caches.delete(key))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {

  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  // Always get HTML directly from GitHub Pages.
  if (
    event.request.destination === "document" ||
    url.pathname.endsWith(".html")
  ) {
    event.respondWith(
      fetch(event.request, {
        cache: "no-store"
      })
      .catch(() => caches.match(event.request))
    );

    return;
  }

  // Network first for everything else.
  event.respondWith(
    fetch(event.request)
      .then(response => {

        if (response.ok) {
          const copy = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, copy);
            });
        }

        return response;

      })
      .catch(() => caches.match(event.request))
  );

});
