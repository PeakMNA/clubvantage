const CACHE_NAME = 'clubvantage-v3'

// Install — activate immediately, no pre-caching
self.addEventListener('install', () => {
  self.skipWaiting()
})

// Activate — clean ALL old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch — network-first for everything, cache as offline fallback only
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip API/auth routes entirely
  if (url.pathname.startsWith('/api')) return

  // Skip HMR and dev resources
  if (url.pathname.includes('_next/webpack') || url.pathname.includes('__nextjs')) return

  // Cache-first ONLY for truly immutable assets (hashed filenames)
  if (url.pathname.startsWith('/_next/static') || url.pathname.startsWith('/icons')) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        const clone = res.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        return res
      }))
    )
    return
  }

  // Everything else (pages, JS, CSS) — network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((res) => {
        const clone = res.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        return res
      })
      .catch(() => caches.match(request))
  )
})
