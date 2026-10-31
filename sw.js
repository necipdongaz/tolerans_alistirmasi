// Tolerans Alıştırması: internetsiz çalışma katmanı. Sürüm, index.html değiştikçe değişir.
const SURUM = "tolerans-aed8f57d83";
const DOSYALAR = ["./","index.html","manifest.webmanifest","ikon-192.png","ikon-512.png","ikon-maskable-512.png","apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(SURUM).then(c => c.addAll(DOSYALAR)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== SURUM).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  // Yazı tipleri: ilk açılışta önbelleğe alınır, sonra internetsiz kullanılır
  if (url.host.includes("fonts.googleapis.com") || url.host.includes("fonts.gstatic.com")) {
    e.respondWith(caches.open(SURUM).then(c => c.match(e.request).then(r => r || fetch(e.request).then(y => { c.put(e.request, y.clone()); return y; }).catch(() => r))));
    return;
  }
  if (url.origin !== location.origin) return;
  // Önce ağ, olmazsa önbellek: güncelleme yayınlanınca bir sonraki açılışta gelir
  e.respondWith(fetch(e.request).then(y => { const k = y.clone(); caches.open(SURUM).then(c => c.put(e.request, k)); return y; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
