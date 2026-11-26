// Accalmie : garde la page et ses icônes en mémoire pour qu'elle s'ouvre comme une application.
// Le réseau passe d'abord (la page reste à jour) ; la copie ne sert que hors connexion.
// L'audio n'est jamais mis en mémoire : il est lu chez l'auteur de chaque séance.
const CACHE = 'accalmie-v1';
const COQUE = ['./', 'manifest.webmanifest', 'icone-192.png', 'icone-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(COQUE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then((rep) => {
        if (rep.ok) {
          const copie = rep.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copie));
        }
        return rep;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((rep) => rep || caches.match('./')))
  );
});
