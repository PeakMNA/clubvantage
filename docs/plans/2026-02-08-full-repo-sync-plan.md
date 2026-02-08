# Full Repository Sync Plan: Database, Backend, UI & Specs

**Date:** 2026-02-08
**Scope:** Complete audit-driven sync of ClubVantage member portal across all layers
**Auditors:** 4 parallel agent teams (Schema, UI Routes, Backend, Spec Documentation)

---

## Executive Summary

A comprehensive audit of the ClubVantage repository reveals:

- **124 Prisma models** — 12 undocumented, 1 unimplemented (POSStation)
- **33 portal routes** — 3 undocumented features, 8+ specified but unimplemented features
- **4 critical security vulnerabilities** in data access layer (missing ownership validation)
- **125+ spec files** — quality 7.1/10, but significant fragmentation and staleness
- **Mock data** still used in availability functions and Aura AI
- **Hardcoded pricing** in golf booking actions

---

## Phase 1: Critical Security Fixes (P0)

> Must be done before any feature work. These are data leakage vulnerabilities.

### 1.1 Add Ownership Validation to Data Queries

| File | Function | Fix |
|------|----------|-----|
| `lib/data/golf.ts` | `getTeeTimeById()` | Add `clubId` filter to where clause |
| `lib/data/billing.ts` | `getStatementById()` | Validate `arProfile.memberId === currentMemberId` |
| `lib/data/facilities.ts` | `getBookingById()` | Add `memberId` filter to where clause |
| `lib/data/facilities.ts` | `getFacilityBookings()` | Add `memberId` filter (currently returns ALL club bookings) |

### 1.2 Add Rate Limiting to Auth

| Route | Fix |
|-------|-----|
| `/api/auth/login` | Add rate limiting (5 attempts per 15 min per IP) |

### 1.3 Add Security Headers to Middleware

| Header | Value |
|--------|-------|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Content-Security-Policy` | Appropriate policy for Next.js |

---

## Phase 2: Spec Documentation Sync (P0)

> Update all specs to reflect what's actually built. No code changes.

### 2.1 Update PRD-02 (Member Portal)

**File:** `docs/clubvantage-prd-02-member-portal.md`

**Changes needed:**
- Add implementation status section showing all 33 built routes
- Mark Phase 5 features (Spending, Directory, Scorecard, Aura) as implemented
- Clarify which features use real data vs mock data
- Update feature priority matrix to reflect current state
- Add Phase 5 feature descriptions that are currently missing

### 2.2 Update Portal Section Spec

**File:** `docs/product/sections/portal/spec.md`

**Add sections for:**
- Spending Dashboard — data model, category aggregation logic, monthly trends
- Member Directory — privacy controls (firstName + lastInitial), search, profile view
- Digital Scorecard — score entry, hole-by-hole display, stats (best/avg/trend)
- Aura AI Concierge — chat interface, rule-based responses (current), future AI integration
- Feature flag dependencies for each portal feature

### 2.3 Update Golf Section Spec

**File:** `docs/product/sections/golf/spec.md`

**Add sections for:**
- Scorecard model (Scorecard + ScoreHole) data model documentation
- Scorecard stats computation (rounds played, best score, avg score, avg putts, trend)
- Member portal golf routes inventory

### 2.4 Update Master Index

**File:** `docs/clubvantage-prd-00-master-index.md`

**Changes:**
- Update implementation status table
- Add Phase 5 features to feature matrix
- Correct PRD-01 status inconsistency (marked "Draft" but appears complete)

### 2.5 Create New Feature Specs

| New Spec File | Subject | Models Covered |
|---------------|---------|----------------|
| `clubvantage/docs/features/golf/scoring/spec.md` | Digital Scorecard | Scorecard, ScoreHole |
| `clubvantage/docs/features/portal/spending-dashboard/spec.md` | Spending Analytics | InvoiceLineItem aggregation |
| `clubvantage/docs/features/portal/member-directory/spec.md` | Member Directory | Member (privacy-filtered) |
| `clubvantage/docs/features/portal/aura-concierge/spec.md` | AI Concierge | Chat interface, response engine |
| `clubvantage/docs/features/pos/cash-management/spec.md` | Cash Management | CashDrawer, CashDrawerShift, CashMovement |
| `clubvantage/docs/features/pos/settlement/spec.md` | EOD Settlement | DailySettlement, SettlementException |
| `clubvantage/docs/features/billing/payment-methods/spec.md` | Stored Payments | StoredPaymentMethod |
| `clubvantage/docs/features/billing/autopay/spec.md` | Auto-Pay | AutoPaySetting, AutoPayAttempt |
| `clubvantage/docs/features/billing/minimum-spend/spec.md` | Minimum Spend | MinimumSpendRequirement, MemberMinimumSpend |
| `clubvantage/docs/features/members/sub-accounts/spec.md` | Sub-Accounts | SubAccount, SubAccountTransaction |

### 2.6 Create Integration Specs (Cross-Feature)

| New Spec File | Subject |
|---------------|---------|
| `clubvantage/docs/features/golf-billing-integration/spec.md` | Golf charges to billing invoice flow |
| `clubvantage/docs/features/pos-golf-integration/spec.md` | POS settlement from golf check-in |
| `clubvantage/docs/features/platform-multi-outlet/spec.md` | Outlet context flow across modules |

---

## Phase 3: Backend Data Layer Fixes (P1)

> Fix data quality, remove mock data, optimize queries.

### 3.1 Replace Mock Data with Real Queries

| File | Function | Current State | Fix |
|------|----------|---------------|-----|
| `portal/bookings/actions.ts` | `fetchFacilityAvailability()` | Returns random `Math.random()` data | Query real booking conflicts against facility schedule |
| `portal/bookings/actions.ts` | `fetchServiceAvailability()` | Returns random mock data | Query staff schedules and existing bookings |

### 3.2 Implement Missing Backend Functions

| File | Function | Status | Action |
|------|----------|--------|--------|
| `portal/bookings/actions.ts` | `acceptWaitlistOffer()` | Returns `false` | Create booking from waitlist entry |
| `portal/bookings/actions.ts` | `declineWaitlistOffer()` | Returns `false` | Update waitlist status |

### 3.3 Move Hardcoded Values to Backend

| Current Location | Value | Move To |
|------------------|-------|---------|
| `portal/golf/actions.ts:397` | `greenFeePerPlayer = 3500` | Fetch from GreenFee model via API |
| `portal/golf/actions.ts:398` | `cartFee = 500` | Fetch from Cart rental pricing |
| `portal/golf/actions.ts:399` | `caddyFeeShared = 1500` | Fetch from Caddy rate config |
| `portal/bookings/actions.ts` | Operating hours (hardcoded) | Fetch from Facility.operatingHours |
| `portal/bookings/actions.ts` | Staff ratings (hardcoded) | Fetch from Caddy/Staff rating model |

### 3.4 Optimize Performance Issues

| Function | Issue | Fix |
|----------|-------|-----|
| `getAvailableTeeTimes()` | Deep nested include (players→member/dependent) | Use `select` instead of `include`, limit fields |
| `getSpendingSummary()` | JS aggregation of all year's data | Use Prisma `groupBy` + `_sum` |
| `getScorecardStats()` | JS computation for stats | Use database aggregation |
| `getRecentTransactions()` | Two separate queries | Combine or use Promise.all |
| `getFacilityBookings()` | No pagination | Add cursor-based pagination |

### 3.5 Resolve 12 TODO Comments in Bookings Actions

**File:** `portal/bookings/actions.ts`

All TODO comments need resolution — either implement the feature or document it as deferred with a tracking reference.

---

## Phase 4: Missing UI Features (P1-P2)

> Implement specified-but-unbuilt portal features in priority order.

### 4.1 P0 Missing Features (Should Have Been Built)

| Feature | Spec Section | Route Needed | Complexity |
|---------|--------------|--------------|------------|
| Payment Flow | PRD-02 3.3.2 | `/portal/payments` or modal | HIGH — needs payment gateway |
| Guest Management | PRD-02 3.5 | `/portal/guests` | MEDIUM |
| Booking Cancellation | PRD-02 3.4.1 | Modal on booking detail | LOW |

### 4.2 P1 Missing Features

| Feature | Spec Section | Route Needed | Complexity |
|---------|--------------|--------------|------------|
| Modify Booking | PRD-02 3.4.1 | Modal on booking detail | MEDIUM |
| Change Password | PRD-02 3.7 | `/portal/profile/security` | LOW |
| Notification Preferences | PRD-02 3.7 | `/portal/profile/notification-settings` | LOW |
| Payment Methods | PRD-02 3.3.2 | `/portal/profile/payment-methods` | MEDIUM |
| Event RSVP | PRD-02 3.6.2 | Button on event detail | LOW |
| Statement PDF Download | Portal Spec | Button on statement detail | LOW |
| Member ID Wallet Integration | Portal Spec | Button on member-id page | HIGH |

### 4.3 Dashboard Enhancements

| Feature | Spec Section | Status |
|---------|--------------|--------|
| Suspension Alert Banner | PRD-02 Section 1 | Missing — show red alert if 91+ days overdue |
| Aura Suggestion Widget | PRD-02 Section 4.2 | Missing — personalized AI suggestion card |
| Activity Feed | PRD-02 Section 4.2 | Missing — recent transaction types |

### 4.4 Profile Sub-Pages (Linked but Not Built)

These are referenced in the profile hub but pages don't exist:

| Page | Route | Status |
|------|-------|--------|
| Security Settings | `/portal/profile/security` | Not built |
| Payment Methods | `/portal/profile/payment-methods` | Not built |
| Billing Address | `/portal/profile/billing-address` | Not built |
| Help/Support | `/portal/help` | Not built |
| Contact Club | `/portal/contact` | Not built |

---

## Phase 5: Schema & Model Sync (P2)

### 5.1 Add Missing Planned Model

| Model | Status | Action |
|-------|--------|--------|
| `POSStation` | Designed in plan, not in schema | Add to `schema.prisma` per plan spec |

### 5.2 Consolidate Duplicate Product Models

| Current State | Action |
|---------------|--------|
| `ProshopProduct` (golf-specific) + `Product` (unified POS) | Deprecate ProshopProduct, migrate to unified Product model |
| `ProshopCategory` + `ProductCategory` | Consolidate to ProductCategory |
| `ProshopVariant` + `ProductVariant` | Consolidate to ProductVariant |

### 5.3 Fix Naming Inconsistency

| Spec Name | Schema Name | Action |
|-----------|-------------|--------|
| `GreenFeeRate` | `GreenFee` | Update spec to match schema name `GreenFee` |

---

## Phase 6: Remaining Items from 2026-02-07 Plans (P1-P2)

> These items come from `2026-02-07-member-portal-full-implementation.md` and
> `2026-02-07-facility-golf-marketing-images.md` and were not covered above.

### 6.1 Marketing Images for Browse Pages (Ready to Implement)

**Source:** `2026-02-07-facility-golf-marketing-images.md`
**Status:** Ready — no schema changes needed, `imageUrl` fields already exist.

| Task | File | Action |
|------|------|--------|
| Add Unsplash URLs to seed data | `database/prisma/seed.ts` | Add `imageUrl` to facility + golf course upserts |
| Pass imageUrl to browse components | `portal/book/page.tsx` | Include `imageUrl` in mapped props |
| Render hero images | `portal/book/browse-content.tsx` | Replace placeholder with `<img>` + gradient overlay |
| Render course images | `portal/golf/browse/browse-content.tsx` | Replace stone-200 placeholder with course imageUrl |

### 6.2 PWA Service Worker & Offline Support

**Source:** `2026-02-07-member-portal-full-implementation.md` Phase 4.2

| Task | File | Action |
|------|------|--------|
| Create service worker | `public/service-worker.js` | Workbox-based caching (cache-first: static; network-first: data) |
| Register SW in layout | `src/app/layout.tsx` | Add SW registration |
| Offline banner component | `src/components/portal/offline-banner.tsx` | Show offline status indicator |
| Cache member ID QR | Service worker config | Cache-first for member card data |

### 6.3 Web Push Notifications

**Source:** `2026-02-07-member-portal-full-implementation.md` Phase 4.1

| Task | File | Action |
|------|------|--------|
| Push subscription API | `src/app/api/notifications/subscribe/route.ts` | Save VAPID push subscription |
| Push send API | `src/app/api/notifications/send/route.ts` | Send push via `web-push` |
| Permission prompt | `src/components/portal/notification-permission.tsx` | Request push permission |
| Notification triggers | Server-side | Booking confirm/remind, statement ready, announcements |

### 6.4 Apple Wallet / Google Wallet Integration

**Source:** `2026-02-07-member-portal-full-implementation.md` Phase 5.1

| Task | File | Action |
|------|------|--------|
| Apple Wallet pass | `src/app/api/wallet/apple/route.ts` | Generate .pkpass with `passkit-generator` |
| Google Wallet pass | `src/app/api/wallet/google/route.ts` | Generate via Google Wallet API |
| Wallet buttons | `src/components/portal/add-to-wallet.tsx` | "Add to Wallet" on member-id page |

### 6.5 Payment Gateway Integration (Stripe + Regional)

**Source:** `2026-02-07-member-portal-full-implementation.md` Phase 2.2

| Task | File | Action |
|------|------|--------|
| Stripe setup | `src/lib/payments/stripe.ts` | Stripe SDK configuration |
| PaymentIntent API | `src/app/api/payments/create-intent/route.ts` | Create Stripe PaymentIntent |
| Webhook handler | `src/app/api/payments/webhook/route.ts` | Handle payment confirmation |
| Card input component | `src/components/portal/payment-form.tsx` | Stripe Elements card input |
| Saved payment methods | `src/components/portal/payment-method-card.tsx` | Display saved cards |
| PromptPay QR (Thailand) | Payment flow | Stripe local payment methods |
| PayNow QR (Singapore) | Payment flow | Stripe local payment methods |
| DuitNow QR (Malaysia) | Payment flow | Stripe local payment methods |

### 6.6 PDF Statement Generation

**Source:** `2026-02-07-member-portal-full-implementation.md` Phase 2.1

| Task | File | Action |
|------|------|--------|
| PDF generation | `src/app/api/statements/[id]/pdf/route.ts` | Generate PDF with `@react-pdf/renderer` |
| Download button | Statement detail page | Add "Download PDF" button |

### 6.7 Dining Reservations (Future)

**Source:** `2026-02-07-member-portal-full-implementation.md` Phase 4.4

| Task | File | Action |
|------|------|--------|
| Restaurant listing | `src/app/portal/dining/page.tsx` | List dining outlets |
| Reservation flow | `src/app/portal/dining/reserve/page.tsx` | Book dining table |
| Data layer | `src/lib/data/dining.ts` | Query Facility (restaurant type) |

**Note:** May need `DiningReservation` model or can leverage existing `Booking` model with facility type filter.

### 6.8 External Dependencies (from 2026-02-07 Plan)

| Package | Purpose | Phase |
|---------|---------|-------|
| `stripe` + `@stripe/stripe-js` + `@stripe/react-stripe-js` | Payment processing | 6.5 |
| `web-push` | Push notifications | 6.3 |
| `passkit-generator` | Apple Wallet passes | 6.4 |
| `@react-pdf/renderer` | PDF statement generation | 6.6 |

---

## Phase 7: Aura AI Concierge Upgrade (P2)

**Current state:** Hardcoded string-matching responses in `portal/aura/actions.ts`

| Step | Action |
|------|--------|
| 1 | Design AI integration spec (LLM provider, context injection, action capabilities) |
| 2 | Implement context-aware responses using member data (bookings, balance, preferences) |
| 3 | Add booking capability (natural language → booking flow) |
| 4 | Add bill explanation capability (parse invoice line items) |
| 5 | Add proactive reminders (upcoming tee times, overdue balance) |

---

## Implementation Priority Matrix

```
PRIORITY   PHASE   EFFORT   ITEMS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
P0-NOW     1       S        4 security fixes (ownership validation)
P0-NOW     1       S        Rate limiting on login
P0-NOW     1       S        Security headers in middleware
P0-WEEK    2       M        Update PRD-02 implementation status
P0-WEEK    2       M        Update portal section spec
P0-WEEK    2       L        Create 10 new feature specs
P1-SPRINT  3       M        Replace mock availability data
P1-SPRINT  3       S        Implement waitlist accept/decline
P1-SPRINT  3       M        Move hardcoded pricing to backend
P1-SPRINT  4       L        Payment flow UI
P1-SPRINT  4       M        Guest management UI
P1-SPRINT  4       S        Booking cancellation modal
P1-SPRINT  6.1     S        Marketing images for browse pages (ready)
P1-SPRINT  6.5     L        Stripe payment gateway integration
P1-SPRINT  6.6     M        PDF statement generation
P2-NEXT    3       M        Optimize N+1 queries
P2-NEXT    4       M        Remaining P1 UI features
P2-NEXT    5       S        Add POSStation model
P2-NEXT    5       L        Consolidate Product models
P2-NEXT    6.2     M        PWA service worker + offline support
P2-NEXT    6.3     M        Web push notifications
P2-NEXT    6.4     M        Apple/Google Wallet integration
P2-LATER   6.7     M        Dining reservations
P2-LATER   7       L        Aura AI real LLM integration
```

**Effort:** S = Small (< 1 day), M = Medium (1-3 days), L = Large (3+ days)

---

## Metrics Summary

| Category | Current | Target | Gap |
|----------|---------|--------|-----|
| Schema models documented | 90% (112/124) | 100% | 12 models |
| Portal routes with spec coverage | 76% (25/33) | 100% | 8 routes |
| Data queries with ownership validation | 73% | 100% | 4 functions |
| Features using real data | ~80% | 100% | Availability, pricing |
| Spec freshness (reflecting actual code) | ~60% | 95%+ | PRD-02, portal spec |
| Security headers present | 0/3 | 3/3 | All missing |
| TODO comments in codebase | 12+ | 0 | All need resolution |

---

## Recommended Execution Order

### Week 1: Security + Spec Sync
1. Fix 4 data access security vulnerabilities (Phase 1.1)
2. Add rate limiting and security headers (Phase 1.2-1.3)
3. Update PRD-02 and portal spec (Phase 2.1-2.2)
4. Create Phase 5 feature specs (Phase 2.5)

### Week 2: Backend Completion
5. Replace mock availability data (Phase 3.1)
6. Move hardcoded pricing to backend (Phase 3.3)
7. Implement waitlist actions (Phase 3.2)
8. Resolve TODO comments (Phase 3.5)

### Week 3: UI Gap Closure
9. Build booking cancellation modal (Phase 4.1)
10. Build profile sub-pages (Phase 4.4)
11. Add dashboard enhancements (Phase 4.3)
12. Build guest management (Phase 4.1)

### Week 3.5: Quick Wins from 2026-02-07 Plans
13. Wire marketing images to browse pages (Phase 6.1 — ready, no schema changes)
14. Add PDF statement download (Phase 6.6)

### Week 4: Payment Infrastructure
15. Stripe payment gateway setup (Phase 6.5)
16. Payment flow UI (Phase 4.1)
17. Regional payment methods — PromptPay, PayNow, DuitNow (Phase 6.5)

### Week 5: PWA & Notifications
18. Service worker + offline caching (Phase 6.2)
19. Web push notification system (Phase 6.3)
20. Optimize query performance (Phase 3.4)

### Week 6+: Premium Features
21. Apple/Google Wallet integration (Phase 6.4)
22. Schema consolidation — ProshopProduct → Product (Phase 5.2)
23. Dining reservations (Phase 6.7)
24. Aura AI real LLM integration (Phase 7)

---

## Files Referenced (Key Locations)

### Data Layer (Security Fixes Needed)
- `apps/member-portal/src/lib/data/golf.ts` — getTeeTimeById
- `apps/member-portal/src/lib/data/billing.ts` — getStatementById
- `apps/member-portal/src/lib/data/facilities.ts` — getBookingById, getFacilityBookings

### Server Actions (Mock Data + TODOs)
- `apps/member-portal/src/app/portal/bookings/actions.ts` — 12 TODOs, mock availability
- `apps/member-portal/src/app/portal/golf/actions.ts` — hardcoded pricing
- `apps/member-portal/src/app/portal/aura/actions.ts` — hardcoded responses

### Auth (Rate Limiting Needed)
- `apps/member-portal/src/app/api/auth/login/route.ts`
- `apps/member-portal/src/middleware.ts`

### Specs (Updates Needed)
- `docs/clubvantage-prd-02-member-portal.md`
- `docs/product/sections/portal/spec.md`
- `docs/product/sections/golf/spec.md`
- `docs/clubvantage-prd-00-master-index.md`

### Schema
- `packages/database/prisma/schema.prisma` — 124 models, POSStation missing

---

## Source Plans Referenced

This sync plan incorporates findings from and builds upon:

| Plan File | Date | Subject |
|-----------|------|---------|
| `2026-02-07-member-portal-full-implementation.md` | 2026-02-07 | Master 5-phase portal implementation (66 tasks, 10 sprints) |
| `2026-02-07-facility-golf-marketing-images.md` | 2026-02-07 | Wire imageUrl to browse pages (ready to implement) |

All 60 plans in `clubvantage/docs/plans/` were reviewed by the spec documentation audit agent. The two 2026-02-07 plans above had the most direct relevance to current portal work and are fully incorporated into this sync plan's Phases 1-7.
