/* Service worker Journia
   Role : installation sur l'ecran d'accueil et consultation hors ligne.
   Aucune donnee Firestore n'est mise en cache : les requetes vers Google
   passent toujours par le reseau.

   IMPORTANT : a chaque nouvelle livraison de index.html, incrementer
   CACHE_VERSION. C'est ce qui force les telephones a prendre la nouvelle
   version au lieu de servir l'ancienne indefiniment. */

const CACHE_VERSION = "2026-08-01-j";
const CACHE = `journia-${CACHE_VERSION}`;

const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./logo-journia.png",
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
   base de donnees et modules Firebase restent en temps reel. */
function isLiveRequest(url) {
  return url.hostname.endsWith("googleapis.com")
    || url.hostname.endsWith("google.com")
    || url.hostname.endsWith("gstatic.com")
    || url.hostname.endsWith("firebaseio.com")
    || url.hostname.endsWith("firebaseapp.com");
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (isLiveRequest(url)) return;

  /* La page elle-meme est toujours demandee au reseau en premier, avec repli
     sur la copie locale si le telephone n'a pas de connexion. */
  const isPage = request.mode === "navigate"
    || url.pathname.endsWith("/")
    || url.pathname.endsWith("/index.html");

  if (isPage) {
    event.respondWith(
      fetch(request, { cache: "no-store" })
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
