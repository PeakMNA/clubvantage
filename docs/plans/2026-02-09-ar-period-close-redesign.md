# AR Period Close — Redesign

## Problem

The current AR statement system uses a single global period model (fixed `periodStart`/`periodEnd`) with no close workflow. Staff click "Run Final" and statements are generated. There is no checklist, no per-member cycle support, and no distinction between the AR period and the financial period.

## Two Billing Cycle Modes

Club admin configures one of two modes in billing settings:

### Club Cycle

- All members share the **same AR period** with a configurable closing date (e.g., the 24th of each month)
- Member joins 15 Jan, club closing date is the 24th:
  - First statement: 15 Jan - 24 Feb (partial catch-up)
  - Second statement: 25 Feb - 24 Mar
  - Third statement: 25 Mar - 24 Apr
- The close checklist runs on the **AR period**
- After the first partial period, every member is on the same cycle

### Member Cycle

- Each member has their **own AR cycle** based on their membership start date
- Member joins 15 Jan:
  - First statement: 15 Jan - 14 Feb
  - Second statement: 15 Feb - 14 Mar
  - Third statement: 15 Mar - 14 Apr
  - The 15th is always their cycle date
- The close checklist runs on the **club's financial/accounting period** (not the AR period)
- The financial period is the umbrella that captures all member cycles whose closing date fell within it

### Key Distinction

| | Club Cycle | Member Cycle |
|---|---|---|
| AR period | Shared, configurable closing day | Per-member, based on join date |
| Checklist runs on | AR period | Financial period |
| Statement date range | Same for all members | Different per member |
| First statement | Partial (join date to period end) | Full month from join date |

## AR Close Checklist

The close process is a multi-day, multi-phase checklist. Each step is configurable by the club admin as `required` (blocks close) or `optional` (can skip). Steps are either auto-verified by the system or require manual staff sign-off.

### Phases & Steps

#### Phase 1: Pre-Closing (Days -3 to -1)

| Step | Verification | Default |
|---|---|---|
| Review all member invoices for accuracy | Manual | Required |
| Reconcile POS transactions with member ledgers | Manual | Required |
| Follow up on disputed charges | Manual | Optional |
| Send final reminders for pending charge approvals | Manual | Optional |

#### Phase 2: Period-End Cut-Off (Last Day)

| Step | Verification | Default |
|---|---|---|
| Set transaction cut-off time | Manual | Required |
| Process all final transactions and payments | Manual | Required |
| Lock transaction posting for closed period | Auto | Required |

#### Phase 3: Receivables & Payment Review (Day 1)

| Step | Verification | Default |
|---|---|---|
| Generate aged receivables report | Auto | Required |
| All payments posted and applied to correct invoices | Auto | Required |
| Batch settlement — all receipts matched to invoices (FIFO auto-apply) | Auto | Required |
| Unallocated amounts posted as member credit balances | Auto | Required |
| Reconcile payment batches with bank deposits | Manual | Required |
| Flag overdue accounts for collection | Auto | Optional |

#### Phase 4: Tax Compliance Verification (Day 1-2)

Country-specific steps enabled based on club jurisdiction.

**Thailand:**

| Step | Verification | Default |
|---|---|---|
| Tax Invoice/Receipts issued with VAT (7%) | Auto | Required |
| Sequential numbering — no gaps | Auto | Required |

**Singapore:**

| Step | Verification | Default |
|---|---|---|
| Tax invoices issued with GST (9%) | Auto | Required |
| Payment receipts reference original invoice numbers | Auto | Required |

**Malaysia:**

| Step | Verification | Default |
|---|---|---|
| Tax invoices with SST (6-10%) issued at point of sale | Auto | Required |
| Payment receipts cross-reference original invoices | Auto | Required |

#### Phase 5: Reconciliation (Day 2)

| Step | Verification | Default |
|---|---|---|
| AR subsidiary ledger matches GL control accounts | Auto | Required |
| Revenue categories match between AR and GL | Auto | Required |
| Tax invoice sequence integrity (no missing/duplicate) | Auto | Required |
| Tax collected reconciled with tax payable accounts | Auto | Required |
| All reconciling items resolved | Manual | Required |

#### Phase 6: Reporting (Day 2-3)

| Step | Verification | Default |
|---|---|---|
| AR aging summary generated | Auto | Required |
| Tax invoice register generated | Auto | Required |
| Tax summary report by type generated | Auto | Required |
| Significant AR issues documented | Manual | Optional |

#### Phase 7: Period Close (Day 3)

| Step | Verification | Default |
|---|---|---|
| All AR journals posted and approved | Auto | Required |
| Bad debt provisions reviewed | Manual | Required |
| Tax invoice sequences locked for period | Auto | Required |
| Close AR period | System action | Required |
| Archive documentation | Auto | Required |

#### Phase 8: Statement Generation & Distribution (Day 3-5)

| Step | Verification | Default |
|---|---|---|
| Generate statements (per-member date ranges based on cycle mode) | System action | Required |
| Review statements for accuracy | Manual | Required |
| Flag unusual activity | Manual | Optional |
| Distribute via member delivery preference | System action | Required |
| Update statement generation log | Auto | Required |
| Archive digital copies | Auto | Required |

### Gating Rules

- Phases must be completed in order
- A phase is complete when all `required` steps are done (auto-verified or manually signed off)
- `Optional` steps can be skipped without blocking
- The "Close Period" action is only available when all required steps in phases 1-7 are green
- Statement generation (phase 8) only available after period is closed

### Configuration

Club admin can:
- Toggle each step between `required` and `optional`
- Country-specific tax steps are shown/hidden based on club jurisdiction
- Steps cannot be deleted, only toggled

## Receipt-Invoice Settlement

Before closing, all receipts must be settled. The system:

1. Auto-applies payments to invoices using **FIFO** (oldest invoice first)
2. Any remaining unallocated amount is posted as **member credit balance**
3. The close checklist auto-verifies that zero orphan receipts exist

This is an auto-verified required step in Phase 3.

## Statement Content

Each generated statement includes:
- Opening balance and closing balance with aging breakdown (current, 30, 60, 90+ days)
- All charges, payments, adjustments, credits for the period
- Tax summary by type (VAT/GST/SST based on jurisdiction)
- Payment due date and accepted payment methods

### Country-Specific Requirements

**Thailand:** Reference Tax Invoice/Receipt numbers, VAT (7%) summary

**Singapore:** Reference tax invoice numbers, GST (9%) summary, separate payment receipts

**Malaysia:** Reference tax invoices, SST breakdown by category, service tax (6%) identified

## Member Portal

Members see their billing information on the portal:

### Closed Statement

- The most recent closed statement in full detail
- Browsable history of last **3 months** of statements (older archived)
- Shows: period dates, opening/closing balance, aging, full transaction detail, tax summary

### Unbilled Activity Summary

- Live view of all activity since last close
- Grouped by category with subtotals: F&B, Golf, Dues, Other, Payments Received
- Subtotals shown by default, expandable to see individual line items per category
- Running total of net unbilled amount

### Actions

- **Pay online** — members can make a payment directly from the statement view

## Data Model Changes

### Period Model

The `StatementPeriod` model shifts from representing a fixed date window to representing a **close cycle**:

- In **Club Cycle** mode: period has fixed `periodStart`/`periodEnd` shared by all members
- In **Member Cycle** mode: period represents the financial period umbrella; individual statement date ranges are computed per-member from their join date and cycle

### New: Close Checklist Model

```
CloseChecklist
  id
  periodId → StatementPeriod
  status: NOT_STARTED | IN_PROGRESS | COMPLETED
  startedAt, completedAt
  completedBy

CloseChecklistStep
  id
  checklistId → CloseChecklist
  stepDefinitionId → reference to configured step
  phase: PRE_CLOSE | CUT_OFF | RECONCILIATION | TAX | REPORTING | CLOSE | STATEMENTS
  enforcement: REQUIRED | OPTIONAL
  verification: AUTO | MANUAL
  status: PENDING | PASSED | FAILED | SKIPPED | SIGNED_OFF
  autoCheckResult: JSON (for auto-verified steps — what was checked, pass/fail details)
  signedOffBy: staff user (for manual steps)
  signedOffAt: timestamp
  notes: optional staff notes
```

### AR Profile Addition

```
ARProfile (existing, add field):
  memberStartDate: Date — membership start date, used for Member Cycle mode
```

### Settings Addition

```
ARSettings (existing, add fields):
  billingCycleMode: CLUB_CYCLE | MEMBER_CYCLE
  clubCycleClosingDay: number (1-28) — for Club Cycle mode
  financialPeriodType: CALENDAR_MONTH | CUSTOM — for Member Cycle checklist timing
```

## Implementation Impact

### What Changes

1. **Period creation** — In Club Cycle mode, dates computed from `clubCycleClosingDay`. In Member Cycle mode, period represents financial period.
2. **Statement generation** — Must compute per-member date ranges in Member Cycle mode (join date for first, then rolling monthly).
3. **Close workflow** — New checklist UI and backend. Phases gate progress. Auto-verification hooks into existing reconciliation/tax systems.
4. **Statement Register** — Already built (the component we just created). Needs period dropdown to work with new model.
5. **Member Portal** — New: unbilled activity summary, 3-month history, pay online.

### What Stays

- Statement content and delivery system
- Aging calculations
- PDF generation
- Delivery tracking (email/print/portal/SMS)
- Run concept (PREVIEW/FINAL)
- AR profile management
