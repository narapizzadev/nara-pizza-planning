/* Service worker Nara Pizza Planning
   Role : permettre l'installation sur l'ecran d'accueil et la consultation
   hors ligne. Aucune donnee Firestore n'est mise en cache ici : les requetes
   vers Google passent toujours par le reseau. */

const CACHE = "nara-pizza-v1";

const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./nara-pizza-logo-transparent.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.allSettled(SHELL.map(url => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

/* Domaines qui ne doivent jamais etre interceptes : authentification,
   base de donnees et modules Firebase doivent rester temps reel. */
function isLiveRequest(url) {
  return url.hostname.endsWith("googleapis.com")
    || url.hostname.endsWith("google.com")
    || url.hostname.endsWith("firebaseio.com")
    || url.hostname.endsWith("firebaseapp.com");
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (isLiveRequest(url)) return;

  /* Navigation : on privilegie le reseau pour recevoir les mises a jour,
     avec repli sur la version en cache si le telephone est hors ligne. */
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put("./index.html", copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match("./index.html").then(hit => hit || Response.error()))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(hit => {
      if (hit) return hit;
      return fetch(request).then(response => {
        if (response && response.status === 200 && url.origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {});
        }
        return response;
      });
    })
  );
});
