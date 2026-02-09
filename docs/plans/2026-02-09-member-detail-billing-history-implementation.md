# Member Detail — Billing History & AR Profile Implementation

## Parent Design
`docs/plans/2026-02-09-ar-period-close-redesign.md`

## Scope
Staff-facing member detail billing features: AR history tab updates for cycle mode, AR profile status display, credit limit management, billing hold, statement view per-member dates, auto-pay cycle awareness.

## Prerequisites
- Billing cycle mode settings implemented (from billing staff plan)
- Close checklist and per-member statement dates in place
- Existing hooks: `useARProfileByMember`, `useProfileStatements`, `useMemberTransactions`, `useARPeriodSettings`

## Current State

### What Exists
- **AR History Tab** (`ar-history-tab.tsx`): Balance summary card, aging bucket badge, auto-pay history, view toggle (Transactions / Statements)
- **Transaction View** (`billing/transaction-view.tsx`): Search, type filter, date range filter (30/90/180/365/all), pagination (25 per page), running balance
- **Statement View** (`billing/statement-view.tsx`): Fetches AR profile via `useARProfileByMember`, lists FINAL statements with balances, links to detail
- **Statement Detail** (`billing/statement-detail.tsx`): Balance summary, aging bars, transaction list, PDF download
- **AR Profile Header** (`ar-profile-header.tsx`): Shows profile status badge (ACTIVE/SUSPENDED/CLOSED), credit limit display, balance
- **Auto-Pay Modal** (`auto-pay-modal.tsx`): Enable/disable, payment method selection, schedule options, limits, notifications
- **Contract Tab** (`tabs/contract-tab.tsx`): Recurring charges with frequency display

### What's Missing
- Cycle mode indicator in billing tab
- Per-member cycle date range in statement view
- Credit limit display in AR history tab (only in AR profile header)
- Billing hold indicator and management
- AR profile status in member detail (not fetched currently)
- Cycle-aware transaction filtering
- Unbilled activity grouped by category
- Auto-pay cycle-aware scheduling

---

## Implementation Tasks

### Task 1: Fetch AR Profile in Member Detail Page

**Files:**
- MODIFY: `apps/application/src/app/(dashboard)/members/[id]/page.tsx`

**Changes:**
1. Import and call `useARProfileByMember(memberId)` to get the member's AR profile
2. Pass `arProfile` to `<ARHistoryTab>` as a new prop
3. This gives the billing tab access to: profile status, credit limit, cycle info, suspension/closure details

**New prop on ARHistoryTab:**
```typescript
interface ARHistoryTabProps {
  member: Member
  transactions: ARTransaction[]
  arProfile?: ARProfile | null  // NEW
  onViewInvoice?: (id: string) => void
  onViewStatement?: (id: string) => void
}
```

---

### Task 2: AR Profile Status & Credit Limit in AR History Tab

**Files:**
- MODIFY: `apps/application/src/components/members/ar-history-tab.tsx`

**Changes to Balance Summary Card:**

1. **AR Profile Status Badge** — show below member name:
   - ACTIVE → emerald badge
   - SUSPENDED → amber badge with reason tooltip
   - CLOSED → stone badge with reason tooltip
   - No AR profile → "No AR Profile" with "Create" link

2. **Credit Limit Display** — add below balance:
   ```
   Balance: ฿45,200.00
   Credit Limit: ฿100,000.00  (45% used)
   ├─ Available: ฿54,800.00
   ```
   - Progress bar: emerald (0-79%), amber (80-99%), red (100%+)
   - Only shown when `arProfile.creditLimit` is not null

3. **Billing Hold Banner** — show at top of tab when hold is active:
   ```
   ⚠️ Billing on hold: {reason} — Until {holdUntil}
   ```
   - Amber warning banner, dismissible by manager

4. **Cycle Mode Indicator** — show in header area:
   - Fetch `useARPeriodSettings()` for club cycle mode
   - Show: "Club Cycle (closing day: 24th)" or "Member Cycle (cycle date: 15th)"
   - In Member Cycle: show member's cycle date derived from join date

---

### Task 3: Statement View — Per-Member Date Ranges

**Files:**
- MODIFY: `apps/application/src/components/members/billing/statement-view.tsx`

**Changes:**
1. Each statement card already shows `periodStart` — `periodEnd` from the statement record
2. In Member Cycle mode, these are already per-member (if Task 4 from billing staff plan is done)
3. Add visual distinction for first partial statement:
   - If statement's `periodStart` differs from what the regular cycle would produce → show "Partial" badge
4. Add cycle mode label in section header:
   - "Statements (Member Cycle — 15th to 14th)" or "Statements (Club Cycle)"

---

### Task 4: Transaction View — Cycle Filter

**Files:**
- MODIFY: `apps/application/src/components/members/billing/transaction-view.tsx`

**Changes:**
1. Add new filter option: "Current Cycle" alongside existing date range filters
   - Current cycle computed from:
     - Club Cycle: current period's `periodStart` to `periodEnd`
     - Member Cycle: member's current cycle dates (join date anniversary to next)
2. Add "Previous Cycle" filter option
3. When cycle filter is active, show cycle date range label below filter bar:
   ```
   Showing: 15 Jan 2026 — 14 Feb 2026 (Current Cycle)
   ```
4. Running balance calculation should scope to the filtered cycle when cycle filter is active

**New helper function:**
```typescript
function getMemberCycleDates(joinDate: Date, cycleOffset: number = 0): { start: Date, end: Date }
```

---

### Task 5: Unbilled Activity Section

**Files:**
- NEW: `apps/application/src/components/members/billing/unbilled-activity.tsx`

**Component: `UnbilledActivity`**

Props:
```typescript
interface UnbilledActivityProps {
  memberId: string
  arProfile: ARProfile
  cycleMode: BillingCycleMode
}
```

**UI Structure:**
```
┌─ Unbilled Activity ─────────────────────────────────┐
│ Since last close: 15 Jan 2026                        │
│                                                       │
│ ▼ F&B                               ฿12,400.00      │
│   • Restaurant charge — 18 Jan        ฿3,200.00     │
│   • Bar tab — 22 Jan                  ฿1,800.00     │
│   • Dining event — 25 Jan             ฿7,400.00     │
│                                                       │
│ ▶ Golf                               ฿8,500.00      │
│ ▶ Dues                               ฿15,000.00     │
│ ▶ Other                              ฿2,100.00      │
│                                                       │
│ Payments Received                    -฿10,000.00     │
│ ─────────────────────────────────────────────────── │
│ Net Unbilled                          ฿28,000.00     │
└──────────────────────────────────────────────────────┘
```

**Data fetching:**
- Query invoices/line items where `date > lastStatementDate` for this member
- Group by `chargeType.category` (F&B, Golf, Dues, Other)
- Include payments since last close as a separate section
- Compute net unbilled = sum(charges) - sum(payments)

**Interaction:**
- Categories collapsed by default showing subtotal
- Click to expand and see individual line items
- "View Invoice" link on each line item

---

### Task 6: Add Unbilled Activity to AR History Tab

**Files:**
- MODIFY: `apps/application/src/components/members/ar-history-tab.tsx`

**Changes:**
1. Add third view option: "Transactions" | "Statements" | "Unbilled"
2. When "Unbilled" is selected, render `<UnbilledActivity>`
3. Also show unbilled summary in the Balance Summary Card:
   ```
   Balance: ฿45,200.00
   Unbilled: ฿28,000.00 (since 15 Jan)
   ```

---

### Task 7: Auto-Pay — Cycle-Aware Scheduling

**Files:**
- MODIFY: `apps/application/src/components/members/auto-pay-modal.tsx`

**Changes:**
1. Add schedule option: `CYCLE_CLOSE` — "Pay on cycle close date"
   - In Club Cycle: triggers on the club's closing day
   - In Member Cycle: triggers on the member's cycle date
2. Show "Next scheduled payment" based on current cycle:
   ```
   Next payment: 14 Feb 2026 (cycle close) — Estimated: ฿28,000.00
   ```
3. Add option: "Pay current cycle charges only" — limits auto-pay to charges within the current unbilled cycle (not historical balance)

---

### Task 8: Credit Limit Warnings

**Files:**
- MODIFY: `apps/application/src/components/members/ar-history-tab.tsx`
- MODIFY: `apps/application/src/components/members/charge-modal.tsx` (if exists)

**Changes:**
1. When posting a new charge to a member (charge modal):
   - Check `arProfile.creditLimit` vs `arProfile.currentBalance + chargeAmount`
   - If exceeds 80% threshold → show amber warning
   - If exceeds 100% → show red warning + block if `autoSuspendOnCreditExceeded` is enabled
   - Manager override option if `allowManagerOverride` is true

2. In AR History Tab credit limit display:
   - Update in real-time as transactions change
   - Show "Over limit" badge when exceeded

---

### Task 9: Billing Hold Management

**Files:**
- NEW: `apps/application/src/components/members/billing-hold-modal.tsx`
- MODIFY: `apps/application/src/components/members/ar-history-tab.tsx`

**Billing Hold Modal:**
```typescript
interface BillingHoldModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  arProfileId: string
  currentHold?: { reason: string, holdUntil: Date | null }
}
```

**UI:**
- Reason text field (required)
- Hold until date picker (optional — null = indefinite)
- "Place Hold" / "Remove Hold" button

**AR History Tab integration:**
- "Place Hold" / "Remove Hold" button in the balance summary actions
- Hold banner shown when active (from Task 2)
- Hold status shown in AR profile status area

**Backend:**
- Add `billingHold`, `billingHoldReason`, `billingHoldUntil` fields to ARProfile
- Hold prevents new invoice generation for this member
- Hold does NOT prevent payment receipt

---

### Task 10: Member Detail — Statements Sub-Page

**Files:**
- MODIFY: `apps/application/src/app/(dashboard)/members/[id]/statements/` (if exists, else create)

**Purpose:**
Deep-dive into a member's statement history with full detail — separate from the summary in the AR History tab.

**Features:**
- Full list of all statements for this member (not just 3 months)
- Click to view statement detail inline or navigate to run detail
- Filter by year, status (paid/unpaid)
- Show cycle information per statement
- Link back to AR History tab

**This may already exist** — verify and enhance if so, or create as a new sub-page.

---

## Verification Checklist

- [ ] AR profile status badge shows in AR History tab
- [ ] Credit limit display with utilization bar shows when limit is set
- [ ] Billing hold banner shows when hold is active
- [ ] Cycle mode indicator shows correct mode and dates
- [ ] Statement view shows per-member date ranges (Member Cycle mode)
- [ ] Transaction view has "Current Cycle" / "Previous Cycle" filter options
- [ ] Unbilled activity section groups charges by category with expandable line items
- [ ] Auto-pay modal has "Cycle Close" schedule option
- [ ] Credit limit warning appears when posting charges that exceed threshold
- [ ] Billing hold modal allows placing and removing holds
- [ ] All changes follow existing component patterns and design system
