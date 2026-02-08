# Member Portal — Feature Flags Reference

**Audience**: Technical reference for developers and platform operators
**Purpose**: Complete list of feature flags controlling member portal behavior

---

## Flag Resolution

Feature flags are stored in the Control Plane (Supabase) per tenant and cached in Redis (5min TTL).

```typescript
// Server-side flag resolution
import { getTenantConfig } from '@/lib/tenant'

const { features } = await getTenantConfig()

if (features.golf.enabled) {
  // Render golf module
}
```

```typescript
// Client-side flag access (via context provider)
import { useFeatureFlags } from '@/hooks/useFeatureFlags'

const { golf, bookings, billing, portal } = useFeatureFlags()
```

---

## Flag Definitions

### Golf Module

| Flag | Key | Type | Default | Scope | Description |
|------|-----|------|---------|-------|-------------|
| Golf Enabled | `golf.enabled` | boolean | `true` | Tenant | Shows/hides Golf tab in bottom navigation. When disabled, all golf-related pages return 404. |
| Guest Booking | `golf.guestBooking` | boolean | `true` | Tenant | Allows members to add guest players when booking tee times. When disabled, only members and dependents can be added. |
| Cart Request | `golf.cartRequest` | boolean | `true` | Tenant | Members can request golf carts during the booking flow. When disabled, cart assignment is staff-only via the admin panel. |
| Caddy Request | `golf.caddyRequest` | boolean | `false` | Tenant | Members can request caddies during the booking flow. When disabled, caddy assignment is staff-only. Default off because not all clubs offer caddy service. |

### Bookings Module

| Flag | Key | Type | Default | Scope | Description |
|------|-----|------|---------|-------|-------------|
| Bookings Enabled | `bookings.enabled` | boolean | `true` | Tenant | Shows/hides Bookings tab in bottom navigation. When disabled, all facility booking pages return 404. |
| Auto-Approve | `bookings.autoApprove` | boolean | `false` | Facility | When enabled, facility bookings are immediately confirmed. When disabled, bookings go to "Pending" status and require staff approval. Can be set per individual facility. |
| Equipment Add-on | `bookings.equipmentAddon` | boolean | `true` | Tenant | Allows members to add equipment (rackets, balls, etc.) to facility bookings. |
| Service Add-on | `bookings.serviceAddon` | boolean | `false` | Tenant | Allows members to add services (coaching, training) to facility bookings. |

### Billing Module

| Flag | Key | Type | Default | Scope | Description |
|------|-----|------|---------|-------|-------------|
| Billing Enabled | `billing.enabled` | boolean | `true` | Tenant | Shows/hides Statements section. When disabled, balance cards and statement pages are hidden. |
| Online Payments | `billing.onlinePayments` | boolean | `false` | Tenant | Enables the "Pay Now" button on statements and balance cards. Requires payment gateway configuration (Stripe/Omise). Default off — must be explicitly enabled after gateway setup. |
| Show Balance | `billing.showBalance` | boolean | `true` | Tenant | Shows current balance on the dashboard. Some clubs prefer members check statements directly rather than seeing balance prominently. |
| PDF Download | `billing.pdfDownload` | boolean | `true` | Tenant | Allows members to download monthly statement PDFs. |

### Portal Module

| Flag | Key | Type | Default | Scope | Description |
|------|-----|------|---------|-------|-------------|
| Member ID QR | `portal.memberIdQr` | boolean | `true` | Tenant | Shows/hides the Member ID tab with QR code. Core feature for check-in and POS identification. |
| Push Notifications | `portal.pushNotifications` | boolean | `true` | Tenant | Enables push notification subscription. Members see a toggle in their profile preferences. Requires HTTPS (always true on clubvantage.app domains). |
| Dark Mode | `portal.darkMode` | boolean | `false` | Tenant | Shows dark mode toggle in member profile settings. When disabled, portal always uses light mode. |
| Language Switcher | `portal.languageSwitcher` | boolean | `true` | Tenant | Shows EN/TH language toggle in profile. Disable for single-language clubs. |
| Dependent Access | `portal.dependentAccess` | boolean | `true` | Tenant | Allows dependents to have their own portal login. Dependents have limited access (no billing, no payments). |
| Install Prompt | `portal.installPrompt` | boolean | `true` | Tenant | Shows the "Add to Home Screen" bottom sheet on 2nd visit. Can be disabled if club doesn't want PWA promotion. |
| Announcements | `portal.announcements` | boolean | `true` | Tenant | Shows club news/announcements section on dashboard. |
| Weather Widget | `portal.weatherWidget` | boolean | `false` | Tenant | Shows weather widget on dashboard. Requires location configuration. |

---

## Flag Interactions

Some flags have dependencies or interactions:

| If This Is Off | Then This Is Also Hidden | Reason |
|---------------|------------------------|--------|
| `golf.enabled` | `golf.guestBooking`, `golf.cartRequest`, `golf.caddyRequest` | Child flags of golf module |
| `bookings.enabled` | `bookings.autoApprove`, `bookings.equipmentAddon`, `bookings.serviceAddon` | Child flags of bookings module |
| `billing.enabled` | `billing.onlinePayments`, `billing.showBalance`, `billing.pdfDownload` | Child flags of billing module |
| `portal.dependentAccess` = off | Dependent login blocked | No dependent accounts |
| `billing.onlinePayments` = on | Requires payment gateway config | Flag alone isn't sufficient |

---

## Scope Levels

| Scope | Meaning | Example |
|-------|---------|---------|
| **Tenant** | Applies to entire club | `golf.enabled` — affects all members |
| **Facility** | Per facility override | `bookings.autoApprove` — tennis auto-approves, dining requires approval |
| **Tier** | Per membership tier | (Future) `golf.advanceBookingDays` — Premium: 14, Standard: 7 |

---

## Default Configurations by Club Type

### Full-Service Golf & Country Club (Default)

```json
{
  "golf": { "enabled": true, "guestBooking": true, "cartRequest": true, "caddyRequest": true },
  "bookings": { "enabled": true, "autoApprove": false },
  "billing": { "enabled": true, "onlinePayments": false, "showBalance": true },
  "portal": { "memberIdQr": true, "pushNotifications": true, "darkMode": false, "languageSwitcher": true, "dependentAccess": true }
}
```

### City Club (No Golf)

```json
{
  "golf": { "enabled": false },
  "bookings": { "enabled": true, "autoApprove": true },
  "billing": { "enabled": true, "onlinePayments": true, "showBalance": true },
  "portal": { "memberIdQr": true, "pushNotifications": true, "darkMode": true, "languageSwitcher": false, "dependentAccess": true }
}
```

### Golf-Only Club (No Facilities)

```json
{
  "golf": { "enabled": true, "guestBooking": true, "cartRequest": true, "caddyRequest": false },
  "bookings": { "enabled": false },
  "billing": { "enabled": true, "onlinePayments": false, "showBalance": true },
  "portal": { "memberIdQr": true, "pushNotifications": true, "darkMode": false, "languageSwitcher": true, "dependentAccess": false }
}
```

---

## Admin UI

Feature flags are managed in two places:

### Platform Manager (ClubVantage Staff)
- Full access to all flags
- Can enable/disable any flag for any tenant
- Can set facility-level overrides
- Navigate: Platform Manager → Tenants → Select Tenant → Feature Flags

### Staff Application (Club Staff)
- Limited access to operational flags only
- Can toggle: module visibility, golf settings, facility auto-approve, notification channels
- Cannot toggle: technical flags (install prompt, weather widget)
- Navigate: Settings → Member Portal → Features

---

## API Access

Feature flags can also be queried via GraphQL:

```graphql
query TenantFeatureFlags {
  tenantConfig {
    features {
      golf {
        enabled
        guestBooking
        cartRequest
        caddyRequest
      }
      bookings {
        enabled
        autoApprove
      }
      billing {
        enabled
        onlinePayments
        showBalance
      }
      portal {
        memberIdQr
        pushNotifications
        darkMode
        languageSwitcher
        dependentAccess
      }
    }
  }
}
```

This query is tenant-scoped — it returns flags for the authenticated user's tenant only.
