const CACHE_NAME = 'clubvantage-v2'
const STATIC_ASSETS = [
  '/portal',
  '/portal/golf',
  '/portal/book',
  '/portal/statements',
  '/portal/profile',
  '/portal/member-id',
  '/manifest.json',
]

// Install — pre-cache key pages
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// Fetch — network-first for API/data, cache-first for static
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip API auth routes
  if (url.pathname.startsWith('/api/auth')) return

  // Skip HMR and dev resources
  if (url.pathname.includes('_next/webpack') || url.pathname.includes('__nextjs')) return

  // Static assets — cache-first
  if (
    url.pathname.startsWith('/_next/static') ||
    url.pathname.startsWith('/icons') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        const clone = res.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        return res
      }))
    )
    return
  }

  // Page navigations — network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return res
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/portal')))
    )
    return
  }
})
