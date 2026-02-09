# Billing History: Transaction View + Statement View

## Context

The staff application's member detail page has a single "Billing History" (AR History) tab at `apps/application/src/components/members/ar-history-tab.tsx` (625 lines). It shows an account summary card, optional auto-pay history, and a transaction list with date range + type filters. There is no search, no pagination, and no statement view.

## Goal

Split the Billing History tab into two sub-views:
1. **Transaction View** — enhanced transaction list with search and pagination
2. **Statement View** — monthly statement list linking to a detail page

## Design

### Overall Structure

The Billing History tab keeps its position as one of the 6 main tabs on the member detail page. Inside it:

```
┌─────────────────────────────────────────────────┐
│  Account Summary Card (unchanged)               │
│  [Balance]  [Aging Badge]  [Oldest Unpaid Date] │
├─────────────────────────────────────────────────┤
│  Auto-Pay History (if member.autoPay — unchanged)│
├─────────────────────────────────────────────────┤
│  [ Transactions ]  [ Statements ]  ← pill toggle│
├─────────────────────────────────────────────────┤
│  (selected view content)                        │
└─────────────────────────────────────────────────┘
```

- Account summary card and auto-pay history stay pinned above both views (no changes)
- Pill toggle switches views with client-side state (no route change)
- Default view: **Transactions**

### Transaction View

Enhanced version of the current transaction list.

```
┌─────────────────────────────────────────────────┐
│  🔍 Search transactions...                      │
├─────────────────────────────────────────────────┤
│  [All Time] [30d] [90d] [180d] [365d]          │
│  [All Types] [Invoices] [Payments] [Credits]    │
├─────────────────────────────────────────────────┤
│  Transaction cards (same as today)              │
│  ...                                            │
│  ─── Showing 25 of 156 ── [Load More] ────────  │
└─────────────────────────────────────────────────┘
```

**Search:**
- Search bar above the existing date range + type filters
- Client-side filter over the already-fetched transaction list
- Matches against `description` and `invoiceNumber` (case-insensitive substring)
- All filters combine: search AND date range AND type
- Debounced 300ms, results update instantly

**Pagination:**
- Show 25 transactions at a time
- "Load More" button at the bottom
- Counter: "Showing X of Y transactions"
- Resets to first page when search/filters change

**Everything else unchanged:** transaction cards, icons, running balance, amount formatting, color coding.

### Statement View

New sub-view showing monthly billing statements.

```
┌─────────────────────────────────────────────────┐
│  Period         Opening   Charges   Payments    │
│                 Balance             & Credits   │
│                                     Closing  ▸  │
├─────────────────────────────────────────────────┤
│  January 2026   ฿9,000   ฿12,500   -฿8,000    │
│  Jan 1 – Jan 31          Closing: ฿13,500   ▸  │
│  ● Due                                         │
├─────────────────────────────────────────────────┤
│  December 2025  ฿4,200   ฿11,300   -฿6,500    │
│  Dec 1 – Dec 31          Closing: ฿9,000    ▸  │
│  ● Paid                                        │
└─────────────────────────────────────────────────┘
```

**Each row shows:**
- Period label (month + year) and date range
- Opening balance, total charges, total payments/credits
- Closing balance (bold)
- Status badge: "Paid" (emerald) if closing ≤ 0, "Due" (amber) if outstanding
- Chevron — click navigates to statement detail page

**Data source:** Existing `Statement` table via the member's AR profile. Ordered newest first.

### Statement Detail Page

New route: `/members/[id]/statements/[statementId]`

```
┌─────────────────────────────────────────────────┐
│  ← Back to Member                [Download PDF] │
├─────────────────────────────────────────────────┤
│  Statement: January 2026                        │
│  #STM-2026-00012  ·  Jan 1 – Jan 31  ·  ● Due  │
├─────────────────────────────────────────────────┤
│  Balance Summary                                │
│  Opening Balance          ฿9,000                │
│  Charges                 +฿12,500               │
│  Payments & Credits       -฿8,000               │
│  Closing Balance          ฿13,500  (bold)       │
│  Due Date                 Feb 15   (amber)      │
├─────────────────────────────────────────────────┤
│  Aging Breakdown                                │
│  Current  ████████████████░░░░  ฿8,500  (63%)   │
│  1-30d    ████████░░░░░░░░░░░░  ฿3,500  (26%)   │
│  31-60d   ███░░░░░░░░░░░░░░░░░  ฿1,500  (11%)   │
│  61-90d                              ฿0  (0%)   │
│  90d+                                ฿0  (0%)   │
├─────────────────────────────────────────────────┤
│  Transactions (18)                              │
│  Jan 28  Green Fee (18h)              ฿3,500    │
│  Jan 25  F&B - The Verandah          ฿1,200    │
│  Jan 20  Payment - Visa 4242        -฿5,000    │
│  ...                                            │
└─────────────────────────────────────────────────┘
```

**Sections:**
- Back link → returns to member detail Billing History tab
- Statement header: period, number, date range, status badge
- Balance summary: opening, charges, payments, closing, due date
- Aging breakdown: 5-bucket horizontal bars (current, 1-30, 31-60, 61-90, 90+)
- Transactions: all transactions within the statement period, sorted chronologically
- Download PDF button linking to `statement.pdfUrl`

## Files to Create/Modify

| File | Change |
|------|--------|
| `components/members/ar-history-tab.tsx` | Refactor: extract transaction list into `TransactionView`, add pill toggle, add `StatementView` |
| `components/members/billing/transaction-view.tsx` | **NEW** — search bar, filters, paginated transaction list |
| `components/members/billing/statement-view.tsx` | **NEW** — monthly statement list with summary columns |
| `app/(dashboard)/members/[id]/statements/[statementId]/page.tsx` | **NEW** — statement detail page |
| `components/members/billing/statement-detail.tsx` | **NEW** — balance summary, aging bars, transaction list |
| `hooks/use-billing.ts` | Add `useMemberStatements(memberId)` hook |
| `apps/api/src/graphql/billing/billing.resolver.ts` | Add `getMemberStatements` and `getStatementById` queries |

## Data Requirements

### Existing (no changes needed)
- `getMemberTransactions` GraphQL query — returns all transactions with running balance
- `MemberTransaction` type — id, date, type, description, invoiceNumber, amount, runningBalance
- Account summary data (balance, aging, oldest unpaid)

### New GraphQL Queries

**`getMemberStatements(memberId: ID!): [MemberStatement!]!`**
- Fetches statements via member's AR profile
- Returns: id, statementNumber, periodStart, periodEnd, dueDate, openingBalance, closingBalance, totalDebits, totalCredits, pdfUrl

**`getStatementById(id: ID!): StatementDetail`**
- Returns full statement with aging breakdown and transactions
- Aging: current, days30, days60, days90, days90Plus
- Transactions: parsed from statement's `transactions` JSON column
- Member info: name, memberId, membershipType, accountNumber
