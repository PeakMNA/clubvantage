# Member Portal — PWA Configuration Reference

**Audience**: Technical reference for developers and DevOps
**Purpose**: Configuration details for Progressive Web App setup per tenant

---

## Dynamic Manifest

Each tenant gets a unique `manifest.json` generated at runtime.

**Endpoint**: `GET /api/manifest.json`

The manifest is generated based on the requesting hostname's tenant configuration.

### Manifest Fields

| Field | Source | Example |
|-------|--------|---------|
| `name` | `tenant.branding.appName` | "Royal Club" |
| `short_name` | `tenant.branding.shortName` | "Royal" |
| `description` | `tenant.branding.description` | "Your membership at your fingertips" |
| `start_url` | Static | `/portal` |
| `display` | Static | `standalone` |
| `orientation` | Static | `portrait` |
| `background_color` | `tenant.theme.backgroundColor` or `#fafaf9` | "#fafaf9" |
| `theme_color` | `tenant.theme.primaryColor` | "#f59e0b" |
| `icons` | `tenant.branding.faviconUrl` | Array of 192×192 and 512×512 |
| `categories` | Static | `["lifestyle", "sports"]` |

### Icon Requirements

| Size | Purpose | Format |
|------|---------|--------|
| 32×32 | Browser favicon | PNG |
| 192×192 | Android home screen | PNG |
| 512×512 | Android splash, install prompt | PNG |
| 512×512 (maskable) | Android adaptive icon | PNG with safe zone |

Upload via Platform Manager → Tenant → Branding. System auto-generates required sizes from the 512×512 source.

---

## Service Worker

### Registration

Service worker registers from the root layout:

```typescript
// app/portal/layout.tsx
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js', { scope: '/portal' })
  }
}, [])
```

### Caching Strategies

| Resource Type | Strategy | Cache Name | TTL |
|--------------|----------|------------|-----|
| App shell (HTML) | Network-first | `app-shell-v1` | 24h fallback |
| Static assets (JS/CSS/fonts) | Cache-first | `static-v1` | Immutable (hashed filenames) |
| API GET responses | Stale-while-revalidate | `api-cache-v1` | 5min |
| API mutations (POST) | Network-only + Background Sync | `sync-queue` | Queued until online |
| Images (logos, facility photos) | Cache-first | `images-v1` | 7 days |
| Fonts (DM Sans, IBM Plex Mono) | Cache-first | `fonts-v1` | 30 days |
| QR code payload | Network-first → IndexedDB | `member-data` | 24h |

### Cache Key Namespacing

Cache keys include tenant slug to prevent cross-tenant cache leakage:

```
{tenantSlug}-{cacheName}-v{version}
// e.g., "royal-club-app-shell-v1"
```

### Cache Versioning

When deploying updates, increment the version suffix. The service worker `activate` event cleans old caches:

```javascript
const CACHE_VERSION = 'v2'

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => !key.endsWith(CACHE_VERSION))
          .map(key => caches.delete(key))
      )
    )
  )
})
```

---

## Offline Support

### IndexedDB Schema

Database name: `portal-{tenantSlug}`

| Store | Key | Data | Purpose |
|-------|-----|------|---------|
| `member-profile` | `current` | Member profile JSON | Offline profile display |
| `qr-payload` | `current` | Encrypted QR string + metadata | Offline QR code |
| `sync-queue` | Auto-increment | Queued mutations | Background sync |
| `cached-bookings` | Booking ID | Booking details | Offline booking list |

### Background Sync

Registration:
```javascript
// When a mutation fails due to offline
await navigator.serviceWorker.ready
  .then(sw => sw.sync.register('sync-mutations'))
```

Processing:
```javascript
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-mutations') {
    event.waitUntil(replayMutationQueue())
  }
})
```

Sync queue items are processed FIFO. If an item fails (still offline), processing stops and retries on next sync event.

---

## Push Notifications

### VAPID Keys

VAPID keys are platform-wide (shared across all tenants):

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public_key>
VAPID_PRIVATE_KEY=<private_key>
VAPID_SUBJECT=mailto:notifications@clubvantage.app
```

### Subscription Flow

1. Member enables notifications in profile preferences
2. Client requests push permission from browser
3. On grant, client sends subscription to `/api/push/subscribe`
4. Server stores subscription with `{ tenantId, memberId, endpoint, keys }`
5. When an event occurs (booking confirmed, etc.), server sends push via subscription

### Notification Payload

```json
{
  "title": "Tee Time Confirmed",
  "body": "Championship Course · Tomorrow 7:30 AM",
  "icon": "/icon-192.png",
  "badge": "/badge-72.png",
  "tag": "booking-confirmed-abc123",
  "data": {
    "url": "/portal/golf/my-times",
    "type": "booking.confirmed",
    "tenantId": "uuid"
  }
}
```

### Click Handling

```javascript
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/portal'
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      // Focus existing window or open new
      for (const client of windowClients) {
        if (client.url.includes('/portal') && 'focus' in client) {
          return client.focus().then(c => c.navigate(url))
        }
      }
      return clients.openWindow(url)
    })
  )
})
```

---

## Install Prompt

### Trigger Logic

- Do NOT show on first visit
- Show on 2nd visit (tracked via `localStorage.visitCount`)
- If dismissed ("Maybe Later"), don't show again for 7 days
- If installed, never show again (detect via `display-mode: standalone` media query)

### Detection

```typescript
// Check if already installed as PWA
const isInstalled = window.matchMedia('(display-mode: standalone)').matches
  || window.navigator.standalone === true // iOS Safari

// Listen for install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  setInstallPrompt(e) // Store for later use
})
```

---

## Platform-Specific Notes

### iOS Safari

- PWA support via "Add to Home Screen" (no `beforeinstallprompt` event)
- Must show manual instructions: "Tap Share → Add to Home Screen"
- Push notifications supported since iOS 16.4+ (Safari)
- `standalone` mode supported
- No background sync — fallback to checking on app resume

### Android Chrome

- Full PWA support: install prompt, push, background sync, badges
- `beforeinstallprompt` event fires when criteria met
- Service worker background sync works reliably
- Maskable icons recommended for adaptive icon support

### Desktop Browsers

- Supported but not primary target
- Install prompt available in Chrome, Edge
- Full-width layout adapts (max-width container, centered content)
