# ClubVantage Member Portal — Full Deployable Implementation Plan

> Generated: 2026-02-07 | Based on PRD-02, codebase analysis, database schema review, and industry research

---

## Executive Summary

The ClubVantage Member Portal is a mobile-first PWA for country club members. **12 UI mockup screens** are already built with mock/seed data. This plan covers the full implementation to make every feature **production-ready and deployable** — wiring real data, adding missing features, implementing auth, payments, notifications, and PWA capabilities.

---

## Current State Assessment

### What's Already Built (UI Mockups with Seed Data)

| Route | Description | Data Source | Status |
|-------|-------------|-------------|--------|
| `/portal` | Dashboard — balance, quick actions, tee times | Mock JSON | UI Complete |
| `/portal/member-id` | QR code member card | Mock user | UI Complete |
| `/portal/golf` | Golf hub — upcoming tee times | Mock data | UI Complete |
| `/portal/golf/browse` | Course browsing | **Real DB** (Prisma) | UI + Data |
| `/portal/golf/book` | Multi-step tee time booking | **Real DB** (server actions) | UI + Data |
| `/portal/golf/my-times` | My tee times list | Mock data | UI Complete |
| `/portal/golf/bookings/[id]` | Tee time detail + cancel | Mock data | UI Complete |
| `/portal/book` | Facility browse | **Real DB** (Prisma) | UI + Data |
| `/portal/book/facilities/[id]` | Facility detail | **Real DB** | UI + Data |
| `/portal/book/services/[id]` | Service detail | **Real DB** | UI + Data |
| `/portal/book/calendar` | Booking calendar | Mock data | UI Complete |
| `/portal/bookings` | My facility bookings | Mock data | UI Complete |
| `/portal/bookings/[id]` | Facility booking detail | Mock data | UI Complete |
| `/portal/notifications` | Notification center | Mock JSON | UI Complete |
| `/portal/profile` | Member profile | Mock user | UI Complete |
| `/portal/statements` | Statements list | Placeholder | Stub |
| `/login` | Login page | Mock auth | UI Complete |

### Infrastructure Already In Place

- **Prisma schema**: 119 models, 4,274 lines — comprehensive (Member, TeeTime, Booking, Invoice, Payment, etc.)
- **NestJS GraphQL API**: Full resolvers for golf, bookings, billing, members
- **Tenant middleware**: Subdomain-based multi-tenancy
- **Feature flags**: Golf, bookings, billing, portal toggles
- **PWA manifest**: Dynamic `/api/manifest.json` route
- **Design system**: Stone/Amber/Emerald palette, glass morphism, gold accents
- **React Query + Mock Auth Provider**: State management scaffolded
- **Server Actions**: Golf booking flow already uses real server actions
- **Seed data**: Full club setup with members, courses, facilities, tee times

### What's Missing for Production

1. **Real Authentication** — Currently mock; needs JWT + session management
2. **Real Data Wiring** — 8 pages still use mock/hardcoded data
3. **Billing & Payments** — Not built (statements, invoices, online payment)
4. **Push Notifications** — Not implemented
5. **Profile Editing** — Read-only placeholder
6. **Offline/PWA** — Service worker not configured
7. **Event Calendar & Dining** — Not in PRD scope yet but high-value
8. **AI Concierge (Aura)** — Phase 2

---

## Implementation Phases

### Phase 1: Core Infrastructure (Sprint 1-2)
*Goal: Authentication, real data, deployable foundation*

### Phase 2: Financial Module (Sprint 3-4)
*Goal: Statements, payments, billing — the #1 member utility*

### Phase 3: Booking Completion (Sprint 5-6)
*Goal: Complete all booking flows with real data*

### Phase 4: Engagement & PWA (Sprint 7-8)
*Goal: Notifications, offline, events, member engagement*

### Phase 5: Premium Features (Sprint 9-10)
*Goal: AI concierge, digital wallet, advanced analytics*

---

## Phase 1: Core Infrastructure

### 1.1 Real Authentication System

**Files to create/modify:**

| File | Action | Description |
|------|--------|-------------|
| `src/lib/auth/session.ts` | CREATE | Server-side session management using `iron-session` |
| `src/lib/auth/middleware.ts` | CREATE | Auth middleware for protected routes |
| `src/app/api/auth/login/route.ts` | CREATE | Login API route (email/password) |
| `src/app/api/auth/logout/route.ts` | CREATE | Logout API route |
| `src/app/api/auth/session/route.ts` | CREATE | Session check/refresh route |
| `src/app/(auth)/login/page.tsx` | MODIFY | Wire to real auth API |
| `src/components/providers.tsx` | MODIFY | Replace MockAuthProvider with real auth |
| `src/middleware.ts` | MODIFY | Add auth check to portal routes |
| `src/lib/auth/password.ts` | CREATE | bcrypt password hashing utilities |

**Implementation approach:**
- Use `iron-session` for encrypted cookie-based sessions (no external session store needed)
- Server components read session directly; client components use auth context
- Login validates against `User` table in Prisma (already has password hash fields)
- JWT not needed initially — session cookies are simpler and more secure for a monolith
- Add `memberId` and `clubId` to session for data scoping

**Database:** No schema changes needed — `User` and `Member` models already exist with auth fields.

### 1.2 Wire Dashboard to Real Data

**Files to modify:**

| File | Action | Description |
|------|--------|-------------|
| `src/lib/data/dashboard.ts` | CREATE | Dashboard data fetching (balance, upcoming bookings, activity) |
| `src/app/portal/page.tsx` | MODIFY | Fetch real data via server component |
| `src/lib/data/billing.ts` | CREATE | Member billing data (balance, statements) |

**Data queries:**
```
Dashboard data = {
  balance: SELECT SUM(balance) FROM Invoice WHERE memberId = ? AND status IN ('SENT', 'OVERDUE')
  upcomingTeeTimes: SELECT * FROM TeeTime WHERE bookedByMemberId = ? AND date >= NOW() ORDER BY date LIMIT 3
  upcomingBookings: SELECT * FROM Booking WHERE memberId = ? AND startTime >= NOW() LIMIT 3
  recentActivity: UNION of recent invoices, payments, bookings ORDER BY date DESC LIMIT 5
}
```

### 1.3 Wire Profile to Real Data

**Files to modify:**

| File | Action | Description |
|------|--------|-------------|
| `src/lib/data/member.ts` | CREATE | Member profile data fetching |
| `src/app/portal/profile/page.tsx` | MODIFY | Server component with real member data |
| `src/app/portal/profile/edit/page.tsx` | MODIFY | Editable profile form with server action |
| `src/app/portal/profile/dependents/page.tsx` | MODIFY | Real dependent data from Household model |

### 1.4 Wire Member ID to Real Data

**Files to modify:**

| File | Action | Description |
|------|--------|-------------|
| `src/app/portal/member-id/page.tsx` | MODIFY | Pass real member data from session |
| `src/app/portal/member-id/member-id-content.tsx` | MODIFY | Use real member name, number, type |

### 1.5 Wire Notifications to Real Data

**Files to modify:**

| File | Action | Description |
|------|--------|-------------|
| `src/lib/data/notifications.ts` | CREATE | Fetch from Notification model |
| `src/app/portal/notifications/page.tsx` | MODIFY | Server component with real notifications |

**Database:** `Notification` model already exists in schema.

---

## Phase 2: Financial Module

### 2.1 Statements List & Detail

**Files to create/modify:**

| File | Action | Description |
|------|--------|-------------|
| `src/lib/data/statements.ts` | CREATE | Statement data from Statement + StatementPeriod models |
| `src/app/portal/statements/page.tsx` | MODIFY | Real statement list with year filter |
| `src/app/portal/statements/statements-content.tsx` | CREATE | Client component for statement browsing |
| `src/app/portal/statements/[id]/page.tsx` | MODIFY | Full statement detail view |
| `src/app/portal/statements/[id]/statement-detail.tsx` | CREATE | Line items, payments, aging breakdown |

**Data models available:** `Statement`, `StatementPeriod`, `StatementRun`, `Invoice`, `InvoiceLineItem`, `Payment`, `PaymentAllocation` — all exist in schema.

**Key features:**
- Monthly statement list with year navigation
- Statement detail: opening balance, charges (grouped by category), payments, closing balance
- PDF download (generate server-side with `@react-pdf/renderer` or similar)
- Aging buckets display (current, 30, 60, 90+)

### 2.2 Online Payments

**Files to create:**

| File | Action | Description |
|------|--------|-------------|
| `src/app/portal/statements/pay/page.tsx` | CREATE | Payment flow page |
| `src/app/portal/statements/pay/payment-content.tsx` | CREATE | Payment form (amount, method selection) |
| `src/app/api/payments/create-intent/route.ts` | CREATE | Stripe PaymentIntent creation |
| `src/app/api/payments/webhook/route.ts` | CREATE | Stripe webhook handler |
| `src/lib/payments/stripe.ts` | CREATE | Stripe SDK configuration |
| `src/components/portal/payment-form.tsx` | CREATE | Card input using Stripe Elements |
| `src/components/portal/payment-method-card.tsx` | CREATE | Saved payment method display |

**Payment methods (by region):**
- **All regions**: Credit/debit card (Stripe Elements)
- **Thailand**: PromptPay QR (Stripe local payment methods)
- **Singapore**: PayNow QR
- **Malaysia**: DuitNow QR

**Database models available:** `Payment`, `PaymentTransaction`, `StoredPaymentMethod`, `AutoPaySetting` — all exist.

### 2.3 Payment History

**Files to create:**

| File | Action | Description |
|------|--------|-------------|
| `src/app/portal/statements/payments/page.tsx` | CREATE | Payment history list |
| `src/lib/data/payments.ts` | CREATE | Payment data fetching |

### 2.4 WHT Certificate Management (Thailand)

**Files to create:**

| File | Action | Description |
|------|--------|-------------|
| `src/app/portal/statements/wht/page.tsx` | CREATE | WHT certificate list |
| `src/app/portal/statements/wht/upload/page.tsx` | CREATE | Upload form |
| `src/app/api/wht/upload/route.ts` | CREATE | File upload handler |

**Feature-flagged:** Only shown when `billing.whtEnabled` is true (Thailand clubs).

---

## Phase 3: Booking Completion

### 3.1 Wire Golf Tee Times to Real Data

**Files to modify:**

| File | Action | Description |
|------|--------|-------------|
| `src/lib/data/golf.ts` | MODIFY | Add getMyTeeTimes(), getTeeTimeById() |
| `src/app/portal/golf/page.tsx` | MODIFY | Fetch real upcoming tee times |
| `src/app/portal/golf/my-times/page.tsx` | MODIFY | Real past/upcoming with filters |
| `src/app/portal/golf/bookings/[id]/page.tsx` | MODIFY | Real tee time detail from DB |
| `src/app/portal/golf/actions.ts` | MODIFY | Add cancelTeeTime server action |

**Server actions to add:**
- `cancelTeeTime(teeTimeId)` — Update status to CANCELLED, apply cancellation policy
- `modifyTeeTime(teeTimeId, changes)` — Update players/resources

### 3.2 Wire Facility Bookings to Real Data

**Files to modify:**

| File | Action | Description |
|------|--------|-------------|
| `src/lib/data/bookings.ts` | CREATE | Facility booking data layer |
| `src/app/portal/bookings/page.tsx` | MODIFY | Real booking list from Booking model |
| `src/app/portal/bookings/[id]/page.tsx` | MODIFY | Real booking detail |
| `src/app/portal/book/calendar/page.tsx` | MODIFY | Real calendar from Booking + Resource |

**Server actions to create:**
- `createFacilityBooking(input)` — Book a resource/service
- `cancelFacilityBooking(bookingId)` — Cancel with policy enforcement

### 3.3 Booking Calendar with Real Availability

**Files to modify:**

| File | Action | Description |
|------|--------|-------------|
| `src/app/portal/book/calendar/calendar-content.tsx` | MODIFY | Real availability from Resource schedule |
| `src/lib/data/availability.ts` | CREATE | Availability checking logic |

### 3.4 Guest Management

**Files to create:**

| File | Action | Description |
|------|--------|-------------|
| `src/app/portal/golf/guests/page.tsx` | CREATE | Previous guests list |
| `src/lib/data/guests.ts` | CREATE | Guest data from Guest model |

**Database:** `Guest` model already exists with name, email, phone, and visit history.

---

## Phase 4: Engagement & PWA

### 4.1 Push Notifications (Web Push)

**Files to create:**

| File | Action | Description |
|------|--------|-------------|
| `src/lib/notifications/web-push.ts` | CREATE | Web Push API integration |
| `src/app/api/notifications/subscribe/route.ts` | CREATE | Save push subscription |
| `src/app/api/notifications/send/route.ts` | CREATE | Send push notification |
| `public/service-worker.js` | CREATE | Service worker for push + caching |
| `src/components/portal/notification-permission.tsx` | CREATE | Permission request prompt |

**Notification types:**
- Booking confirmations & reminders (24h, 1h before)
- Statement ready / payment due
- Club announcements
- Tee time cancellation alerts

### 4.2 PWA Offline Support

**Files to create/modify:**

| File | Action | Description |
|------|--------|-------------|
| `public/service-worker.js` | MODIFY | Add offline caching strategies |
| `src/app/layout.tsx` | MODIFY | Register service worker |
| `src/components/portal/offline-banner.tsx` | CREATE | Offline status indicator |

**Caching strategy:**
- **Cache-first**: Static assets, member card QR, profile data
- **Network-first**: Tee times, bookings, statements
- **Network-only**: Payments, booking creation

### 4.3 Event Calendar & Registration

**Files to create:**

| File | Action | Description |
|------|--------|-------------|
| `src/app/portal/events/page.tsx` | CREATE | Event calendar view |
| `src/app/portal/events/[id]/page.tsx` | CREATE | Event detail + registration |
| `src/lib/data/events.ts` | CREATE | Event data layer |
| `src/components/portal/event-card.tsx` | CREATE | Event display card |

**Database:** Would need new `Event`, `EventRegistration` models. Not yet in schema — requires migration.

### 4.4 Dining Reservations

**Files to create:**

| File | Action | Description |
|------|--------|-------------|
| `src/app/portal/dining/page.tsx` | CREATE | Restaurant listing |
| `src/app/portal/dining/reserve/page.tsx` | CREATE | Reservation flow |
| `src/lib/data/dining.ts` | CREATE | Dining data layer |

**Database:** Can leverage existing `Facility` + `Resource` models (restaurant type). May need `DiningReservation` model.

### 4.5 News & Announcements Feed

**Files to create:**

| File | Action | Description |
|------|--------|-------------|
| `src/app/portal/news/page.tsx` | CREATE | News feed |
| `src/app/portal/news/[id]/page.tsx` | CREATE | Article detail |
| `src/lib/data/news.ts` | CREATE | News data layer |

**Database:** Would need `Announcement` or `Post` model. Not yet in schema.

### 4.6 Notification Preferences

**Files to modify:**

| File | Action | Description |
|------|--------|-------------|
| `src/app/portal/profile/preferences/page.tsx` | MODIFY | Real notification preference toggles |
| `src/lib/data/preferences.ts` | CREATE | Preference data layer |

**Database:** `MemberCommunicationPrefs` model already exists in schema.

---

## Phase 5: Premium Features

### 5.1 Apple Wallet / Google Wallet Integration

**Files to create:**

| File | Action | Description |
|------|--------|-------------|
| `src/app/api/wallet/apple/route.ts` | CREATE | Generate Apple Wallet pass (.pkpass) |
| `src/app/api/wallet/google/route.ts` | CREATE | Generate Google Wallet pass |
| `src/components/portal/add-to-wallet.tsx` | CREATE | Add to Wallet buttons |

**Dependencies:** `passkit-generator` (Apple), Google Wallet API

### 5.2 AI Concierge (Aura)

**Files to create:**

| File | Action | Description |
|------|--------|-------------|
| `src/app/portal/aura/page.tsx` | CREATE | Chat interface |
| `src/app/api/aura/chat/route.ts` | CREATE | AI chat endpoint |
| `src/lib/aura/rag.ts` | CREATE | RAG pipeline with club knowledge base |
| `src/components/portal/aura-fab.tsx` | CREATE | Floating action button for Aura |

**Approach:** RAG with club-specific data (hours, rules, menus, facilities) using Llama 3.1 locally or Claude API.

### 5.3 Digital Scorecard

**Files to create:**

| File | Action | Description |
|------|--------|-------------|
| `src/app/portal/golf/scorecard/page.tsx` | CREATE | Active round scoring |
| `src/app/portal/golf/scorecard/[id]/page.tsx` | CREATE | Past round detail |
| `src/lib/data/scorecards.ts` | CREATE | Scorecard data layer |

**Database:** Would need `Scorecard`, `ScoreHole` models.

### 5.4 Spending Dashboard

**Files to create:**

| File | Action | Description |
|------|--------|-------------|
| `src/app/portal/spending/page.tsx` | CREATE | Spending analytics |
| `src/components/portal/spending-chart.tsx` | CREATE | Category breakdown chart |

**Data:** Aggregate from `InvoiceLineItem` grouped by `ChargeType`.

### 5.5 Member Directory

**Files to create:**

| File | Action | Description |
|------|--------|-------------|
| `src/app/portal/directory/page.tsx` | CREATE | Searchable member list |
| `src/app/portal/directory/[id]/page.tsx` | CREATE | Member profile (privacy-controlled) |

---

## Database Migrations Required

### Phase 1-3: No Migrations Needed
All required models exist: Member, User, TeeTime, Booking, Invoice, Payment, Statement, Notification, Guest, Facility, Resource, etc.

### Phase 4: New Models

```prisma
model Event {
  id          String   @id @default(cuid())
  tenantId    String
  clubId      String
  title       String
  description String?
  imageUrl    String?
  category    String   // SOCIAL, GOLF, DINING, FITNESS, KIDS
  startDate   DateTime
  endDate     DateTime
  location    String?
  capacity    Int?
  price       Decimal?
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  club          Club              @relation(fields: [clubId], references: [id])
  registrations EventRegistration[]
}

model EventRegistration {
  id        String   @id @default(cuid())
  eventId   String
  memberId  String
  guestCount Int     @default(0)
  status    String   // REGISTERED, WAITLISTED, CANCELLED
  notes     String?
  createdAt DateTime @default(now())

  event  Event  @relation(fields: [eventId], references: [id])
  member Member @relation(fields: [memberId], references: [id])
}

model Announcement {
  id          String   @id @default(cuid())
  tenantId    String
  clubId      String
  title       String
  body        String
  imageUrl    String?
  category    String   // GENERAL, GOLF, DINING, SOCIAL, MAINTENANCE
  isPinned    Boolean  @default(false)
  publishedAt DateTime?
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  club Club @relation(fields: [clubId], references: [id])
}
```

### Phase 5: New Models

```prisma
model Scorecard {
  id        String   @id @default(cuid())
  memberId  String
  courseId   String
  teeTimeId String?
  date      DateTime
  totalScore Int?
  holesPlayed Int    @default(18)
  createdAt DateTime @default(now())

  member Member     @relation(fields: [memberId], references: [id])
  course GolfCourse @relation(fields: [courseId], references: [id])
  holes  ScoreHole[]
}

model ScoreHole {
  id          String @id @default(cuid())
  scorecardId String
  holeNumber  Int
  par         Int
  score       Int?
  putts       Int?
  fairwayHit  Boolean?
  gir         Boolean?

  scorecard Scorecard @relation(fields: [scorecardId], references: [id])
}
```

---

## External Dependencies to Add

| Package | Purpose | Phase |
|---------|---------|-------|
| `iron-session` | Encrypted cookie sessions | 1 |
| `bcryptjs` | Password hashing | 1 |
| `stripe` | Payment processing | 2 |
| `@stripe/stripe-js` | Stripe Elements (client) | 2 |
| `@stripe/react-stripe-js` | React Stripe components | 2 |
| `web-push` | Web Push notifications | 4 |
| `passkit-generator` | Apple Wallet passes | 5 |
| `@react-pdf/renderer` | PDF statement generation | 2 |

---

## Deployment Architecture

```
┌─────────────────────────────────────────────┐
│                  Vercel                       │
│  ┌──────────────────────────────────────┐    │
│  │     Member Portal (Next.js 15)       │    │
│  │  - Server Components (data fetching) │    │
│  │  - Server Actions (mutations)        │    │
│  │  - API Routes (auth, payments, push) │    │
│  │  - Static pages (login, forgot-pw)   │    │
│  └──────────┬───────────────────────────┘    │
│             │ Direct Prisma connection        │
│             ▼                                 │
│  ┌──────────────────────────────────────┐    │
│  │     Supabase PostgreSQL               │    │
│  │  - 119 models                         │    │
│  │  - Row-Level Security (per tenant)    │    │
│  └──────────────────────────────────────┘    │
│                                               │
│  External Services:                           │
│  - Stripe (payments)                          │
│  - Web Push (notifications)                   │
│  - S3/R2 (file uploads)                       │
└─────────────────────────────────────────────┘
```

**Key decisions:**
- **Direct Prisma** from server components/actions (no separate BFF needed for MVP)
- **Vercel deployment** with Edge middleware for tenant routing
- **Supabase** PostgreSQL (already running in Docker for dev)

---

## Sprint-by-Sprint Task Breakdown

### Sprint 1 (Week 1-2): Auth + Dashboard Data
1. Implement `iron-session` auth system
2. Create login/logout API routes
3. Wire login page to real auth
4. Add auth middleware to portal routes
5. Replace MockAuthProvider with real session
6. Create `dashboard.ts` data layer
7. Wire dashboard to real balance + upcoming bookings
8. Wire member-id to real member data

### Sprint 2 (Week 3-4): Profile + Notifications Data
9. Create `member.ts` data layer (profile, dependents, household)
10. Wire profile page to real data
11. Implement profile edit with server actions
12. Wire dependents page to real Household data
13. Wire notifications page to Notification model
14. Add notification read/dismiss actions
15. Wire preferences page to MemberCommunicationPrefs

### Sprint 3 (Week 5-6): Statements + Billing
16. Create `statements.ts` data layer
17. Build statements list page with year filter
18. Build statement detail page (line items, payments, aging)
19. Add PDF statement download
20. Create `payments.ts` data layer
21. Build payment history page

### Sprint 4 (Week 7-8): Online Payments
22. Set up Stripe integration
23. Build payment flow page (amount selection, card input)
24. Implement Stripe PaymentIntent API route
25. Build Stripe webhook handler
26. Add saved payment methods management
27. Add PromptPay QR generation (Thailand)
28. Build WHT certificate upload (Thailand, feature-flagged)

### Sprint 5 (Week 9-10): Golf Bookings Completion
29. Wire golf hub to real upcoming tee times
30. Wire my-times to real tee time history
31. Wire tee time detail to real data
32. Implement cancel tee time server action
33. Add success toast after booking creation
34. Wire golf booking review page to real pricing

### Sprint 6 (Week 11-12): Facility Bookings Completion
35. Create facility booking data layer
36. Wire bookings list to real data
37. Wire booking detail to real data
38. Implement facility booking creation flow
39. Wire booking calendar to real availability
40. Implement cancel booking server action

### Sprint 7 (Week 13-14): Push Notifications + PWA
41. Create service worker with Workbox
42. Implement web push subscription API
43. Add notification permission prompt component
44. Implement push notification sending for bookings
45. Add offline caching for key pages
46. Add offline status banner
47. Test PWA install flow on iOS/Android

### Sprint 8 (Week 15-16): Events + News
48. Create Event/EventRegistration migrations
49. Build event calendar page (monthly/list view)
50. Build event detail + registration
51. Create Announcement migration
52. Build news feed page
53. Build announcement detail page
54. Add event/announcement push notifications

### Sprint 9 (Week 17-18): Premium - Wallet + Scorecard
55. Implement Apple Wallet pass generation
56. Implement Google Wallet pass generation
57. Add "Add to Wallet" buttons on member-id page
58. Create Scorecard migration
59. Build digital scorecard entry page
60. Build round history page with stats

### Sprint 10 (Week 19-20): Premium - AI + Analytics
61. Build spending dashboard with category charts
62. Add F&B minimum spending tracker
63. Build member directory with search
64. Set up AI concierge RAG pipeline
65. Build Aura chat interface
66. Add floating Aura button to portal

---

## Feature Priority Matrix

| Feature | User Value | Technical Complexity | Phase | Priority |
|---------|-----------|---------------------|-------|----------|
| Real Authentication | Critical | Medium | 1 | P0 |
| Dashboard Real Data | High | Low | 1 | P0 |
| Profile Real Data | High | Low | 1 | P0 |
| Member ID Real Data | High | Low | 1 | P0 |
| Statements Viewing | Critical | Medium | 2 | P0 |
| Online Payments | Critical | High | 2 | P0 |
| Golf Tee Time Real Data | High | Low | 3 | P0 |
| Facility Booking Real Data | High | Low | 3 | P0 |
| Cancel/Modify Actions | High | Medium | 3 | P0 |
| Push Notifications | High | Medium | 4 | P1 |
| PWA Offline | Medium | Medium | 4 | P1 |
| Event Calendar | High | Medium | 4 | P1 |
| News Feed | Medium | Low | 4 | P1 |
| Digital Wallet | Medium | Medium | 5 | P2 |
| Digital Scorecard | Medium | Medium | 5 | P2 |
| Spending Dashboard | Medium | Medium | 5 | P2 |
| AI Concierge | High | High | 5 | P2 |
| Member Directory | Low | Low | 5 | P3 |

---

## Quality Gates

Each phase must pass these gates before moving to the next:

1. **Build passes** — `pnpm --filter member-portal run build` succeeds
2. **No TypeScript errors** — `pnpm exec tsc --noEmit`
3. **Core flows work** — Manual testing of all new pages/actions
4. **Mobile responsive** — Tested on iPhone/Android viewport sizes
5. **Loading/error states** — Every page has loading skeleton + error boundary
6. **Accessibility** — Focus management, ARIA labels, color contrast

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| Stripe integration complexity | Start with card-only; add regional methods later |
| Service worker caching issues | Use Workbox with well-tested strategies |
| Auth session management | Use battle-tested `iron-session` library |
| Database performance | Add indexes for common portal queries |
| PWA on iOS limitations | Test early; accept PWA push only works iOS 16.4+ |
| Scope creep | Strict phase gates; no Phase N+1 work until Phase N is complete |

---

## Competitive Feature Comparison

| Feature | Cobalt Engage | ForeTees | Northstar | **ClubVantage** |
|---------|-------------|----------|-----------|----------------|
| Tee Time Booking | Yes | Yes | Yes | **Yes (Phase 1)** |
| Facility Booking | Yes | No | Yes | **Yes (Phase 3)** |
| Online Payments | Yes | Limited | Yes | **Yes (Phase 2)** |
| Digital Member Card | QR | No | Yes | **QR + Wallet (Phase 5)** |
| Push Notifications | Yes | Yes | Yes | **Yes (Phase 4)** |
| AI Concierge | No | No | No | **Yes (Phase 5)** |
| Event Calendar | Yes | No | Yes | **Yes (Phase 4)** |
| GPS Course Map | No | Yes | No | **Phase 6+** |
| Scorecard | No | Yes | No | **Yes (Phase 5)** |
| F&B Ordering | Yes | No | Yes | **Phase 6+** |
| Geofencing | No | No | Yes | **Phase 6+** |
| WHT Support (Thailand) | No | No | No | **Yes (Phase 2)** |
| Multi-language | Limited | No | Yes | **Yes (i18n ready)** |
