# Member Portal — Tenant Onboarding Guide

**Audience**: ClubVantage operations staff
**Purpose**: Step-by-step guide to provision a new club on the member portal platform

---

## Prerequisites

- Access to Platform Manager admin panel
- Access to Supabase Control Plane (production)
- Club has signed contract and provided branding assets
- Club's membership data exported (CSV or API access)

---

## Phase 1: Provision Tenant

### 1.1 Create Tenant Record

1. Log in to **Platform Manager** → Tenants → New Tenant
2. Fill in required fields:
   - **Club Name**: Official name (e.g., "Royal Club")
   - **Slug**: URL-safe identifier (e.g., `royal-club`)
   - **Tier**: Starter / Professional / Enterprise
   - **Primary Contact**: Club GM or IT contact email
3. System auto-generates:
   - Tenant UUID
   - Default hostname: `{slug}.clubvantage.app`
   - API key for integration

### 1.2 Provision Database

Based on tier:

| Tier | Database | Provisioning |
|------|----------|-------------|
| Starter | Shared Neon branch | Automatic — branch created on tenant creation |
| Professional | Dedicated Neon branch | Automatic — isolated branch with higher limits |
| Enterprise | Dedicated Neon instance | Manual — requires infra team to provision |

Verify database is accessible:
```bash
cd database
DATABASE_URL="<tenant_db_url>" npx prisma db push --accept-data-loss
DATABASE_URL="<tenant_db_url>" npx prisma db seed
```

### 1.3 Configure Hostname Routing

**Default subdomain** (automatic):
- `{slug}.clubvantage.app` — created automatically

**Custom domain** (if requested):
1. Club provides their domain (e.g., `app.royalclub.com`)
2. Club creates CNAME record: `app.royalclub.com → portal.clubvantage.app`
3. Add hostname to tenant config in Platform Manager → Tenant → Hostnames
4. SSL certificate auto-provisions via Let's Encrypt (allow 5-10 minutes)

### 1.4 Verify Tenant Resolution

```bash
# Health check — should return tenant info
curl https://{hostname}/api/health
# Expected: { "tenantId": "uuid", "status": "ok", "club": "Royal Club" }

# Manifest check — should return club-branded manifest
curl https://{hostname}/api/manifest.json
# Expected: { "name": "Royal Club", "short_name": "Royal", ... }
```

---

## Phase 2: Configure Branding

### 2.1 Upload Club Assets

Navigate to **Platform Manager** → Tenant → Branding

| Asset | Requirements | Purpose |
|-------|-------------|---------|
| Logo (primary) | SVG preferred, PNG min 512×512, transparent bg | Nav bar, login screen, PWA icon |
| Favicon | PNG, 32×32 + 192×192 + 512×512 | Browser tab, PWA icon |
| Login background | JPG/PNG, 1920×1080, landscape | Login screen background |
| Splash screen | PNG, 512×512, centered logo on bg color | PWA splash on app launch |

### 2.2 Set Brand Colors

1. **Primary color**: Club's main brand color (hex)
   - System auto-generates HSL scale (50–950 shades)
   - Used for: CTAs, active states, navigation highlights
2. **Secondary color**: Complementary color
   - Used for: success states, secondary actions
3. **Preview**: Live preview panel shows buttons, cards, navigation with new colors

Defaults if not customized:
- Primary: `#f59e0b` (amber)
- Secondary: `#10b981` (emerald)
- Neutral: `#78716c` (stone)

### 2.3 Configure PWA Metadata

| Field | Example | Notes |
|-------|---------|-------|
| App Name | "Royal Club" | Shown in app switcher, install prompt |
| Short Name | "Royal" | ≤12 chars, shown under home screen icon |
| Description | "Your Royal Club membership at your fingertips" | Install prompt description |
| Theme Color | (auto from primary) | Status bar color on Android |
| Background Color | `#fafaf9` | Splash screen background |

### 2.4 Test Branding

1. Clear Redis cache:
   ```bash
   pnpm cache:clear --tenant=<tenant_id>
   ```
2. Open portal URL in incognito browser
3. Verify:
   - [ ] Logo appears on login screen
   - [ ] Colors match club's brand
   - [ ] PWA manifest shows correct name and icons
   - [ ] Install prompt shows club branding

---

## Phase 3: Configure Features

### 3.1 Enable/Disable Modules

Navigate to **Platform Manager** → Tenant → Feature Flags

| Flag | Default | Action |
|------|---------|--------|
| Golf tab | On | Disable if club has no golf course |
| Bookings tab | On | Disable if no facility booking needed |
| Statements tab | On | Disable if billing handled externally |
| Online payments | Off | Enable only if payment gateway configured |
| Member ID QR | On | Core feature — usually leave on |
| Push notifications | On | Requires HTTPS (always true on our domains) |
| Dark mode | Off | Enable for clubs that want it |
| Language switcher | On | Disable if club is single-language only |

### 3.2 Golf Configuration (if enabled)

1. Verify golf courses exist in staff application
2. Set advance booking windows per membership tier:
   - Premium: 14 days
   - Standard: 7 days
   - Social: 3 days
3. Configure guest policy:
   - Max guests per booking
   - Max guest rounds per month
   - Guest fee multiplier
4. Cart/caddy portal requests: enable or require staff-only assignment

### 3.3 Facility Configuration (if enabled)

1. Verify facilities exist in staff application
2. Per facility, set:
   - Visible in portal: yes/no
   - Auto-approve: yes/no (no = staff must approve each booking)
   - Min/max booking duration
   - Advance booking window

### 3.4 Billing Configuration (if enabled)

1. Verify billing integration is active
2. Balance display: show/hide on dashboard
3. Online payments: requires payment gateway credentials
   - Gateway: Stripe / Omise / bank transfer
   - Configure in Platform Manager → Tenant → Payments

---

## Phase 4: Import Member Data

### 4.1 Prepare Import File

CSV format with required columns:

| Column | Required | Example |
|--------|----------|---------|
| `email` | Yes | `james@example.com` |
| `firstName` | Yes | `James` |
| `lastName` | Yes | `Wilson` |
| `membershipType` | Yes | `PREMIUM` |
| `status` | Yes | `ACTIVE` |
| `phone` | No | `+66812345678` |
| `memberId` | No | `RC-2024-0847` |
| `memberSince` | No | `2019-03-15` |

### 4.2 Run Import

1. **Platform Manager** → Tenant → Members → Import
2. Upload CSV
3. Preview mapping (auto-maps common column names)
4. Review conflicts (duplicate emails, invalid data)
5. Execute import
6. Verify count: imported vs. expected

### 4.3 Send Invitation Emails

1. **Platform Manager** → Tenant → Members → Send Invitations
2. Choose: All members / Selected members / By tier
3. Email contains:
   - Welcome message with club branding
   - "Set Up Your Account" CTA button
   - Link to password creation page
4. Track: Sent / Opened / Activated metrics in Platform Manager

---

## Phase 5: Go-Live Checklist

### Technical Verification

- [ ] Tenant resolves on production hostname
- [ ] Custom domain SSL cert valid (if applicable)
- [ ] Dynamic manifest returns correct branding
- [ ] Service worker registers and caches app shell

### Branding Verification

- [ ] Logo displays correctly on login, nav, PWA icon
- [ ] Colors match club's brand guidelines
- [ ] PWA installs with correct name and icon on iOS + Android

### Feature Verification

- [ ] Login flow: email + password → dashboard
- [ ] Dashboard: balance, quick actions, upcoming bookings
- [ ] Member ID: QR code generates, displays offline
- [ ] Profile: edit info, view dependents, change language
- [ ] Golf booking: browse → select → confirm (if enabled)
- [ ] Facility booking: browse → calendar → confirm (if enabled)
- [ ] Statements: balance, transactions, PDF download (if enabled)
- [ ] Push notifications: test notification delivers
- [ ] Offline: QR code available, booking queues with pending badge

### Data Verification

- [ ] Member count matches import
- [ ] Member tiers display correctly
- [ ] Invitation emails deliverable
- [ ] At least 1 test member activated and logged in

### Handoff

1. Send club staff the **Club Staff Guide** (`club-staff-guide.md`)
2. Schedule 30-min training call with club's designated admin
3. Provide support contact: `support@clubvantage.app`
4. Set tenant status to **Live** in Platform Manager
