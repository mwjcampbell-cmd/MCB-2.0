self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("mcb-cache").then((cache) =>
      cache.addAll([
        "./",
        "./index.html",
        "./style.css",
        "./main.js",
        "./offline.html"
      ])
    )
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request).then((resp) => resp || caches.match("./offline.html")))
  );
});
