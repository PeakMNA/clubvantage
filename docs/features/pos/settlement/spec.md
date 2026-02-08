# POS / Settlement / End-of-Day Reconciliation

## Overview

End-of-day settlement process reconciling POS transactions against expected totals, tracking exceptions and variances. Each business day gets a single settlement record per club that aggregates all sales, refunds, voids, and payment method breakdowns. The settlement workflow moves through open, in-review, and closed stages, with exceptions automatically flagged for cash variances, missing receipts, unapproved voids, and other discrepancies.

## Status

Schema implemented, UI not yet built.

## Capabilities

- Create a daily settlement record for each business date per club
- Aggregate gross sales, discounts, net sales, tax, and service charges across all POS transactions for the day
- Break down payments by method: cash, card, member account, and other
- Track refund and void totals with individual counts
- Reconcile expected vs. actual cash with variance calculation
- Support a multi-step workflow: open, in-review, closed, and reopened states
- Automatically generate settlement exceptions for discrepancies
- Classify exceptions by type (cash variance, card variance, missing receipt, duplicate transaction, unapproved void/refund/discount, system error, other)
- Assign severity levels (low, medium, high, critical) to exceptions
- Track exception resolution through pending, acknowledged, adjusted, written-off, escalated, and resolved states
- Link exceptions to specific transactions, shifts, or line items
- Record reviewer and closer identity with timestamps for audit trail
- Allow reopening a closed settlement for corrections

## Dependencies

### Interface Dependencies

- **POS Transaction System** -- Settlement totals are derived from completed POS transactions for the business date
- **Cash Drawer Operations** -- Cash reconciliation depends on cash drawer shift data (expected vs. actual cash)
- **Staff Authentication** -- `openedBy`, `reviewedBy`, `closedBy`, and `resolvedBy` fields reference authenticated staff user IDs

### Settings Dependencies

- **Club Configuration** -- Settlements are scoped to a club via `clubId`; one settlement per club per business date
- **Exception Thresholds** -- Configurable variance thresholds to determine when exceptions are auto-generated and at what severity

### Data Dependencies

- **Club** -- `DailySettlement.clubId` references the `Club` model
- **DailySettlement** -- `SettlementException.settlementId` references the parent settlement
- **POS Transactions** -- Exception `transactionId` references individual POS transactions
- **Cash Drawer Shifts** -- Exception `shiftId` references cash drawer shifts
- **Line Items** -- Exception `lineItemId` references individual transaction line items

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| Auto-generate settlement | Boolean | true | Club Admin | Automatically create a settlement record at end of business day |
| Business day cutoff time | Time | 02:00 | Club Admin | Time at which the business day rolls over (for late-night operations) |
| Cash variance threshold (low) | Decimal | 5.00 | Club Admin | Variance below this is severity LOW |
| Cash variance threshold (medium) | Decimal | 25.00 | Club Admin | Variance below this is severity MEDIUM |
| Cash variance threshold (high) | Decimal | 100.00 | Club Admin | Variance below this is severity HIGH; above is CRITICAL |
| Auto-flag unapproved voids | Boolean | true | Club Admin | Automatically create exceptions for voids without manager approval |
| Auto-flag unapproved refunds | Boolean | true | Club Admin | Automatically create exceptions for refunds without manager approval |
| Auto-flag unapproved discounts | Boolean | true | Club Admin | Automatically create exceptions for discounts without manager approval |
| Require review before close | Boolean | true | Club Admin | Settlement must be reviewed before it can be closed |
| Settlement reopen allowed | Boolean | true | Club Admin | Whether closed settlements can be reopened for corrections |

## Data Model

```typescript
type SettlementStatus = 'OPEN' | 'IN_REVIEW' | 'CLOSED' | 'REOPENED';

type ExceptionType =
  | 'CASH_VARIANCE'
  | 'CARD_VARIANCE'
  | 'MISSING_RECEIPT'
  | 'DUPLICATE_TRANSACTION'
  | 'VOID_WITHOUT_APPROVAL'
  | 'REFUND_WITHOUT_APPROVAL'
  | 'DISCOUNT_WITHOUT_APPROVAL'
  | 'SYSTEM_ERROR'
  | 'OTHER';

type ExceptionSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

type ExceptionResolution =
  | 'PENDING'
  | 'ACKNOWLEDGED'
  | 'ADJUSTED'
  | 'WRITTEN_OFF'
  | 'ESCALATED'
  | 'RESOLVED';

interface DailySettlement {
  id: string;            // UUID, primary key
  clubId: string;        // UUID, FK to Club
  businessDate: Date;    // Date (no time component)

  status: SettlementStatus; // default: OPEN

  // Sales totals
  totalGrossSales: number;    // Decimal(12,2), default: 0
  totalDiscounts: number;     // Decimal(12,2), default: 0
  totalNetSales: number;      // Decimal(12,2), default: 0
  totalTax: number;           // Decimal(12,2), default: 0
  totalServiceCharge: number; // Decimal(12,2), default: 0

  // Payment breakdown
  totalCash: number;          // Decimal(12,2), default: 0
  totalCard: number;          // Decimal(12,2), default: 0
  totalMemberAccount: number; // Decimal(12,2), default: 0
  totalOther: number;         // Decimal(12,2), default: 0

  // Refunds and voids
  totalRefunds: number; // Decimal(12,2), default: 0
  totalVoids: number;   // Decimal(12,2), default: 0

  // Cash reconciliation
  expectedCash: number;        // Decimal(12,2), default: 0
  actualCash: number | null;   // Decimal(12,2)
  cashVariance: number | null; // Decimal(12,2)

  // Transaction counts
  transactionCount: number; // Int, default: 0
  refundCount: number;      // Int, default: 0
  voidCount: number;        // Int, default: 0

  // Workflow
  openedBy: string | null;    // UUID, staff user ID
  openedAt: Date | null;
  reviewedBy: string | null;  // UUID, staff user ID
  reviewedAt: Date | null;
  closedBy: string | null;    // UUID, staff user ID
  closedAt: Date | null;

  notes: string | null; // Text

  createdAt: Date;
  updatedAt: Date;

  // Relations
  club: Club;
  exceptions: SettlementException[];
}

interface SettlementException {
  id: string;            // UUID, primary key
  settlementId: string;  // UUID, FK to DailySettlement

  type: ExceptionType;
  severity: ExceptionSeverity;     // default: MEDIUM
  resolution: ExceptionResolution; // default: PENDING

  description: string;          // Text
  amount: number | null;        // Decimal(12,2)

  // Reference to related entities
  transactionId: string | null; // UUID, FK to POS transaction
  shiftId: string | null;       // UUID, FK to CashDrawerShift
  lineItemId: string | null;    // UUID, FK to transaction line item

  // Resolution tracking
  resolvedBy: string | null;     // UUID, staff user ID
  resolvedAt: Date | null;
  resolutionNote: string | null; // Text

  createdAt: Date;
  updatedAt: Date;

  // Relations
  settlement: DailySettlement;
}
```

## Business Rules

1. **One settlement per club per business date** -- Enforced by a unique constraint on `[clubId, businessDate]`. Attempting to create a duplicate returns an error.
2. **Settlement status flow** -- Valid transitions: `OPEN -> IN_REVIEW -> CLOSED` and `CLOSED -> REOPENED -> IN_REVIEW -> CLOSED`. Direct jumps (e.g., `OPEN -> CLOSED` without review) are only allowed if the "require review before close" setting is disabled.
3. **Totals derived from transactions** -- `totalGrossSales`, `totalDiscounts`, `totalNetSales`, `totalTax`, `totalServiceCharge`, payment breakdowns, and counts are computed from the POS transactions for that business date. They are stored as denormalized values for performance but should be recalculable.
4. **Cash variance computation** -- `cashVariance = actualCash - expectedCash`. This is computed when `actualCash` is entered (from cash drawer shift closing counts).
5. **Exception auto-generation** -- The system should automatically create `SettlementException` records for: cash variances exceeding threshold, voids without approval, refunds without approval, discounts without approval, and duplicate transaction detection.
6. **Exception severity assignment** -- Cash and card variances are assigned severity based on the configured threshold ranges. Unapproved actions default to `MEDIUM` severity. System errors default to `HIGH`.
7. **All exceptions must be resolved before closing** -- A settlement cannot move to `CLOSED` status if any exceptions have resolution `PENDING`. All exceptions must be at least `ACKNOWLEDGED`.
8. **Reopened settlements reset review** -- When a settlement is reopened, `reviewedBy` and `reviewedAt` are cleared, requiring a fresh review cycle.
9. **Closed settlements are read-only** -- No totals or exceptions can be modified on a `CLOSED` settlement without first reopening it.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| No transactions for a business date | Settlement can still be created with all zero totals; useful for documenting that the day was reviewed |
| Settlement created before all registers are closed | Allow creation in `OPEN` status; totals update as registers close and final counts come in |
| Exception linked to a voided transaction | The exception remains valid; resolution note should document that the underlying transaction was voided |
| Large negative variance (more cash than expected) | Still flagged as a `CASH_VARIANCE` exception; staff must explain the overage (e.g., prior-day correction) |
| Settlement reopened after end-of-month reporting | Allow reopening but log a warning; downstream reports that already consumed the closed data may need re-run |
| Multiple cash drawers contributing to a single settlement | `expectedCash` and `actualCash` aggregate across all drawer shifts for that business date; individual shift variances link via `shiftId` on exceptions |
| Business date spans midnight (late-night operations) | The business day cutoff time setting determines which calendar date a transaction belongs to |
| Exception references a deleted transaction | `transactionId` is nullable; if the referenced transaction is removed, the exception retains its description and amount for historical record |
