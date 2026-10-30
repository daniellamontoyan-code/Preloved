const CACHE_NAME = "pitucas-shell-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(["/", "/index.html"])));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(
    keys.filter((key) => /^(cherry|pitucas)-shell-/.test(key) && key !== CACHE_NAME).map((key) => caches.delete(key)),
  )));
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "CLEAR_CHERRY_PRIVATE_PHOTOS") {
    event.waitUntil(caches.delete("cherry-product-photos-v1"));
  }
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET") return;

  // Keep public product photos available in the browser cache for weak connections.
  if (request.destination === "image" && url.pathname.includes("/storage/v1/object/sign/")) {
    event.respondWith((async () => {
      const cache = await caches.open("cherry-product-photos-v1");
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const response = await fetch(request);
        if (response.ok || response.type === "opaque") cache.put(request, response.clone());
        return response;
      } catch {
        return (await cache.match(request)) || Response.error();
      }
    })());
    return;
  }

  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok && (request.mode === "navigate" || url.pathname.startsWith("/assets/"))) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone());
      }
      return response;
    } catch {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === "navigate") return (await caches.match("/index.html")) || Response.error();
      return Response.error();
    }
  })());
});
