# Member Portal — Billing & Statements Implementation

## Parent Design
`docs/plans/2026-02-09-ar-period-close-redesign.md`

## Scope
Member-facing portal billing features: closed statement view with per-member dates, unbilled activity summary, 3-month rolling history, payment flow (Stripe/Adyen), WHT certificate upload, dashboard billing widgets, billing notifications.

## Prerequisites
- Backend statement generation produces per-member dates (from billing staff plan)
- AR profile with `lastStatementDate` maintained
- Existing portal architecture: Server Components + Prisma, iron-session auth, mobile-first design

## Current State

### What Exists
- **Dashboard** (`/portal/page.tsx`): Balance card with due date, "Pay Now" button (UI only), recent activity (flat list, not categorized), suspension banner, quick actions
- **Statements List** (`/portal/statements/page.tsx`): Balance card, recent transactions, monthly statement list (all statements, no 3-month limit), click-through to detail
- **Statement Detail** (`/portal/statements/[id]/`): Full statement view with aging bars, transactions, PDF download, sticky "Pay Now" bar
- **Statement PDF** (`/api/statements/[id]/pdf/`): React PDF generation with aging, transactions, balances
- **Navigation** (`bottom-nav.tsx`): Home, Golf, Bookings, Member ID, Profile — no dedicated Statements icon
- **Notifications** (`/portal/notifications/`): List with filters (All, Bookings, Billing, Club News), read/unread tracking
- **Payment Methods** (`/portal/profile/payment-methods/`): Empty state page — "Online Payments Coming Soon"
- **Data Layer** (`lib/data/billing.ts`): `getAccountBalance()`, `getRecentTransactions()`, `getStatements()`, `getStatementById()` — all via Prisma
- **Types** (`lib/types.ts`): `PaymentMethod`, `WHTCertificate`, `PortalNotification` interfaces defined but not used
- **Feature Flags**: `billing.onlinePayments: false`, `billing.showBalance: true`

### What's Missing
- Payment gateway integration (no Stripe/Adyen SDK)
- Payment checkout flow
- Payment method CRUD
- WHT certificate upload and management
- Unbilled activity grouped by category
- 3-month rolling statement limit
- Cycle-mode-aware statement dates
- Dashboard billing widgets (next due date calculation for cycle mode)
- Billing-specific notification triggers

---

## Implementation Tasks

### Task 1: Statement List — 3-Month Rolling + Cycle Dates

**Files:**
- MODIFY: `apps/member-portal/src/app/portal/statements/page.tsx`
- MODIFY: `apps/member-portal/src/lib/data/billing.ts`

**Changes to `getStatements()`:**
1. Limit to last 3 closed statements (not all 12):
   ```typescript
   const statements = await prisma.statement.findMany({
     where: { arProfile: { memberId }, runType: 'FINAL' },
     orderBy: { periodEnd: 'desc' },
     take: 3,
   })
   ```
2. Add "Older statements are archived" note at bottom of list

**Changes to page:**
1. Show per-member period dates on each statement card:
   ```
   ┌─ Statement ──────────────────────────────────────┐
   │ 15 Jan — 14 Feb 2026                    ฿45,200 │
   │ Statement #STMT-26-01-000142     Status: Due     │
   └──────────────────────────────────────────────────┘
   ```
2. Period dates come from `statement.periodStart` / `statement.periodEnd` (per-member in Member Cycle mode)
3. Add "Paid" (emerald) / "Due" (amber) / "Overdue" (red) badge

---

### Task 2: Unbilled Activity Summary Page

**Files:**
- NEW: `apps/member-portal/src/app/portal/statements/unbilled/page.tsx`
- NEW: `apps/member-portal/src/lib/data/billing.ts` → add `getUnbilledActivity()`

**Data function `getUnbilledActivity()`:**
```typescript
export const getUnbilledActivity = cache(async () => {
  const memberId = await getMemberId()

  // Get member's last statement close date
  const arProfile = await prisma.aRProfile.findFirst({
    where: { memberId },
    select: { lastStatementDate: true }
  })

  const sinceDate = arProfile?.lastStatementDate ?? new Date(0)

  // Get charges since last close, grouped by category
  const charges = await prisma.invoiceLineItem.groupBy({
    by: ['chargeTypeId'],
    where: {
      invoice: { memberId, createdAt: { gt: sinceDate } },
      invoice: { status: { notIn: ['DRAFT', 'VOID', 'CANCELLED'] } },
    },
    _sum: { lineTotal: true },
  })

  // Get individual line items per category for expansion
  const lineItems = await prisma.invoiceLineItem.findMany({
    where: {
      invoice: { memberId, createdAt: { gt: sinceDate } },
    },
    include: {
      chargeType: { select: { name: true, category: true } },
      invoice: { select: { invoiceNumber: true, createdAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Get payments since last close
  const payments = await prisma.payment.findMany({
    where: { memberId, createdAt: { gt: sinceDate } },
    orderBy: { createdAt: 'desc' },
  })

  // Group by category
  // Return: { sinceDate, categories: [{ name, subtotal, items[] }], payments: [], netUnbilled }
})
```

**Page UI:**
```
┌─ Unbilled Activity ─────────────────────────────────┐
│ Since last close: 15 Jan 2026                        │
│                                                       │
│ ▼ Food & Beverage                    ฿12,400.00      │
│   Restaurant — 18 Jan                  ฿3,200.00     │
│   Bar — 22 Jan                         ฿1,800.00     │
│   Dining event — 25 Jan               ฿7,400.00     │
│                                                       │
│ ▶ Golf                               ฿8,500.00      │
│ ▶ Monthly Dues                       ฿15,000.00     │
│ ▶ Other                              ฿2,100.00      │
│                                                       │
│ Payments Received                    -฿10,000.00     │
│ ─────────────────────────────────────────────────── │
│ Net Unbilled                          ฿28,000.00     │
│                                                       │
│ [Pay Now]                                             │
└──────────────────────────────────────────────────────┘
```

- Categories collapsed by default (show subtotal)
- Tap to expand and see individual items
- "Pay Now" button at bottom → links to payment flow (Task 5)
- Pull-to-refresh

---

### Task 3: Statements Navigation Update

**Files:**
- MODIFY: `apps/member-portal/src/app/portal/statements/page.tsx`

**Changes:**
Add tab/segment control at top of statements page:
```
[Closed Statements] [Unbilled Activity]
```
- "Closed Statements" → shows 3-month rolling list (current page)
- "Unbilled Activity" → shows grouped unbilled charges (Task 2 page, or inline)

Alternative: Make unbilled activity a section on the same page (above the statement list):
```
┌─ Current Activity (since 15 Jan) ───────────────────┐
│ F&B: ฿12,400 | Golf: ฿8,500 | Dues: ฿15,000       │
│ Net Unbilled: ฿28,000.00  [View Details]            │
└──────────────────────────────────────────────────────┘

┌─ Closed Statements ─────────────────────────────────┐
│ 15 Jan — 14 Feb 2026       ฿45,200  [Due]          │
│ 15 Dec — 14 Jan 2026       ฿0       [Paid]         │
│ 15 Nov — 14 Dec 2025       ฿0       [Paid]         │
│                                                       │
│ Older statements are archived                        │
└──────────────────────────────────────────────────────┘
```

---

### Task 4: Dashboard Billing Widgets Update

**Files:**
- MODIFY: `apps/member-portal/src/app/portal/page.tsx`
- MODIFY: `apps/member-portal/src/lib/data/billing.ts`

**Changes to `getAccountBalance()`:**
1. Add `nextDueDate` calculation based on cycle mode:
   - Club Cycle: next closing day + payment terms days
   - Member Cycle: next cycle anniversary + payment terms days
2. Add `unbilledTotal` field — sum of charges since last close
3. Return aging bucket for dashboard display

**Changes to dashboard:**
1. Enhanced balance card:
   ```
   ┌─ Account Balance ────────────────────────────────┐
   │ Outstanding                            ฿45,200   │
   │ Unbilled charges                       ฿28,000   │
   │ Due by: 28 Feb 2026                              │
   │ [Pay Now]                    [View Statements]   │
   └──────────────────────────────────────────────────┘
   ```
2. If 91+ days overdue → suspension banner (already exists, verify it works)
3. Quick actions: ensure "Statements" link goes to `/portal/statements`

---

### Task 5: Payment Gateway Integration — Stripe

**Files:**
- NEW: `apps/member-portal/src/lib/stripe.ts` — Stripe client setup
- NEW: `apps/member-portal/src/app/portal/pay/page.tsx` — payment page
- NEW: `apps/member-portal/src/app/portal/pay/success/page.tsx` — confirmation
- NEW: `apps/member-portal/src/app/api/payments/create-intent/route.ts` — create payment intent
- NEW: `apps/member-portal/src/app/api/payments/webhook/route.ts` — Stripe webhook handler
- MODIFY: `apps/member-portal/package.json` — add `@stripe/stripe-js`, `@stripe/react-stripe-js`
- MODIFY: `apps/member-portal/src/lib/tenant.ts` — set `billing.onlinePayments: true`

**Payment Intent API Route:**
```typescript
// POST /api/payments/create-intent
// Body: { amount, statementId? }
// Returns: { clientSecret, paymentIntentId }

export async function POST(request: Request) {
  const session = await getSession()
  const { amount, statementId } = await request.json()

  // Validate member exists and amount is positive
  // Create Stripe PaymentIntent
  // Record pending payment in database
  // Return clientSecret for frontend
}
```

**Payment Page:**
```
┌─ Make Payment ──────────────────────────────────────┐
│ Pay to: Royal Bangkok Sports Club                    │
│                                                       │
│ Amount: [฿45,200.00]  (editable for partial)        │
│                                                       │
│ Payment Method:                                       │
│ ○ Visa •••• 4242 (default)                           │
│ ○ Mastercard •••• 8888                               │
│ ○ New card                                            │
│                                                       │
│ [Pay ฿45,200.00]                                     │
└──────────────────────────────────────────────────────┘
```

**Webhook Handler:**
- Handles `payment_intent.succeeded` → create receipt, allocate to invoices (FIFO), update AR profile balance
- Handles `payment_intent.payment_failed` → update payment status, notify member

**Confirmation Page:**
```
✅ Payment Successful

Amount: ฿45,200.00
Date: 9 Feb 2026
Receipt #: RCP-26-000042

[Download Receipt]  [Back to Statements]
```

---

### Task 6: Payment Method Management

**Files:**
- MODIFY: `apps/member-portal/src/app/portal/profile/payment-methods/payment-methods-content.tsx`
- NEW: `apps/member-portal/src/app/api/payments/methods/route.ts` — list/add/delete payment methods
- NEW: `apps/member-portal/src/components/portal/add-card-modal.tsx`

**Features:**
- List saved cards (Stripe customer payment methods)
- Add new card via Stripe SetupIntent
- Set default payment method
- Delete saved card
- Card expiry warning (if expiring within 30 days)
- Auto-pay toggle per card

**Card Display:**
```
┌─ Visa •••• 4242 ──────── DEFAULT ───────────────────┐
│ Expires 12/27                                        │
│ [Set Default]  [Remove]                              │
└──────────────────────────────────────────────────────┘
```

---

### Task 7: WHT Certificate Upload

**Files:**
- NEW: `apps/member-portal/src/app/portal/statements/wht/page.tsx` — WHT certificate list
- NEW: `apps/member-portal/src/app/portal/statements/wht/upload/page.tsx` — upload form
- NEW: `apps/member-portal/src/app/api/wht/upload/route.ts` — file upload handler
- NEW: `apps/member-portal/src/lib/data/wht.ts` — WHT data functions

**WHT Certificate List Page:**
```
┌─ WHT Certificates ──────────────────────────────────┐
│                                                       │
│ ┌─ WHT-2026-001 ─────── ✅ Verified ───────────────┐│
│ │ Amount: ฿4,520  Date: 15 Jan 2026                ││
│ │ Applied to: INV-26-000042                         ││
│ └───────────────────────────────────────────────────┘│
│                                                       │
│ ┌─ WHT-2026-002 ─────── ⏳ Submitted ──────────────┐│
│ │ Amount: ฿2,100  Date: 8 Feb 2026                 ││
│ │ Awaiting review                                   ││
│ └───────────────────────────────────────────────────┘│
│                                                       │
│ [Upload Certificate]                                  │
└──────────────────────────────────────────────────────┘
```

**Upload Form:**
```
┌─ Upload WHT Certificate ────────────────────────────┐
│                                                       │
│ Certificate Number: [WHT-2026-003]                   │
│ Certificate Date:   [2026-02-09]                     │
│ WHT Amount:         [฿3,000.00]                      │
│                                                       │
│ Document: [Browse / Drag & Drop]                     │
│           Accepted: PDF, JPG, PNG (max 10MB)         │
│                                                       │
│ Apply to Invoice(s):                                  │
│ ☑ INV-26-000055  ฿25,000  Due: 28 Feb               │
│ ☐ INV-26-000048  ฿18,000  Due: 28 Jan               │
│                                                       │
│ [Submit Certificate]                                  │
└──────────────────────────────────────────────────────┘
```

**Status badges:**
- Submitted (blue) — awaiting review
- Verified (emerald) — applied to account
- Rejected (red) — needs resubmission with reason shown

**File upload:**
- Use Supabase Storage or S3 for document storage
- Store URL on `WHTCertificate` record
- Validate file type and size

---

### Task 8: Billing Notifications — Server-Side Triggers

**Files:**
- NEW: `apps/member-portal/src/lib/notifications/billing.ts` — billing notification helpers
- MODIFY: `apps/api/` — wherever invoice/payment/statement events fire

**Notification triggers to implement:**

| Event | Notification Type | Channel |
|-------|-------------------|---------|
| Invoice generated | `INVOICE` | In-app, Email |
| Payment due reminder (60d) | `BILLING` | In-app, Email |
| Payment due reminder (30d) | `BILLING` | In-app, Email |
| Payment due reminder (7d) | `BILLING` | In-app, Email, SMS |
| Payment due reminder (1d) | `BILLING` | In-app, Email, SMS |
| Payment received | `PAYMENT` | In-app, Email |
| WHT certificate verified | `BILLING` | In-app, Email |
| WHT certificate rejected | `BILLING` | In-app, Email |
| Account suspension warning (60d) | `BILLING` | In-app, Email |
| Account suspended (91d) | `BILLING` | In-app, Email, SMS |
| Statement generated | `STATEMENT` | In-app, Email |

**Due date reminder logic:**
- In Club Cycle: reminders based on statement due date (statement close + payment terms)
- In Member Cycle: per-member due dates from their cycle close + payment terms
- Cron job or scheduled function that runs daily, checks upcoming due dates

**Database:**
- Use existing `Notification` table
- Create notifications in bulk when events fire
- Respect member notification preferences (from profile settings)

---

### Task 9: Statement Detail — Cycle Mode Enhancements

**Files:**
- MODIFY: `apps/member-portal/src/app/portal/statements/[id]/statement-detail-content.tsx`

**Changes:**
1. Show cycle mode label in statement header:
   - "Statement Period: 15 Jan — 14 Feb 2026 (Member Cycle)"
   - "Statement Period: 1 Jan — 31 Jan 2026 (Club Cycle)"
2. For first partial statement (Club Cycle new member): show "Partial Period" badge
3. Ensure aging breakdown uses per-member dates (already stored on statement)
4. Add "View Unbilled Activity" link to see current charges since this statement

---

### Task 10: Documents — PDF Access & Sharing

**Files:**
- MODIFY: `apps/member-portal/src/app/portal/statements/[id]/statement-detail-content.tsx`
- MODIFY: `apps/member-portal/src/app/api/statements/[id]/pdf/route.tsx`

**Changes:**
1. PDF generation already works — verify it uses per-member dates from the statement record
2. Add share button functionality:
   - Generate a public share URL with a token (time-limited, 7 days)
   - Store share token on statement record
   - Public route: `/api/statements/share/{token}` → returns PDF without auth
3. Add "Add to Files" option for mobile (uses Web Share API)
4. Invoice PDF download — if not already linked, add links to individual invoice PDFs from statement transaction list

---

### Task 11: Navigation — Add Statements to Bottom Nav

**Files:**
- MODIFY: `apps/member-portal/src/components/portal/bottom-nav.tsx`

**Changes:**
Consider adding Statements to bottom nav for direct access:
- Option A: Replace one existing icon (Profile → moved to hamburger menu)
- Option B: Add as 6th icon (may be too many for mobile)
- Option C: Keep current nav, add "Statements" to quick actions on dashboard (already exists)

**Recommendation:** Keep current 5-icon nav. Statements is accessible via:
1. Dashboard quick actions → "Statements"
2. Dashboard balance card → "View Statement"
3. Profile → "Billing" section

No nav change needed — the current flow is sufficient.

---

## Verification Checklist

- [ ] Statement list shows only 3 most recent closed statements
- [ ] Statement dates are per-member (Member Cycle mode shows different dates per member)
- [ ] Unbilled activity page groups charges by category with expandable line items
- [ ] Dashboard shows outstanding balance + unbilled charges + next due date
- [ ] "Pay Now" button opens payment flow with Stripe checkout
- [ ] Partial payment amount is editable
- [ ] Payment confirmation shows receipt with download option
- [ ] Payment methods page shows saved cards with add/remove/default
- [ ] WHT certificate upload accepts PDF/image, validates fields
- [ ] WHT certificate list shows status badges (Submitted/Verified/Rejected)
- [ ] Billing notifications fire on correct events
- [ ] Due date reminders calculate correctly per cycle mode
- [ ] Statement PDF uses per-member dates
- [ ] Share link generates time-limited public URL
- [ ] Suspension banner shows when 91+ days overdue
- [ ] Feature flag `billing.onlinePayments` gates payment features
