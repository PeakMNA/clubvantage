# POS / Cash Management / Cash Drawer Operations

## Overview

Tracks physical cash drawer operations including opening/closing shifts, cash counts, and cash movements (deposits, withdrawals, pay-ins, pay-outs). Each POS station can have a named cash drawer that staff open at the start of a shift with a counted float, record cash movements throughout the day, and close with a final count to determine any variance. This provides full auditability of physical cash at every outlet.

## Status

Schema implemented, UI not yet built.

## Capabilities

- Register and manage named cash drawers per club, each with an optional location label
- Open a cash drawer shift with a counted opening float and optional denomination breakdown
- Record individual cash movements during a shift: sales, refunds, pay-ins, pay-outs, drops, and adjustments
- Close a shift with a closing count and denomination breakdown, automatically calculating expected vs. actual cash and variance
- Suspend a drawer (e.g., during shift handoff or investigation)
- Track total sales, refunds, paid-in, paid-out, and drops per shift
- Record variance notes for over/short explanations
- Require approval for pay-in and pay-out movements
- Link cash movements to POS transactions via reference IDs

## Dependencies

### Interface Dependencies

- **POS Terminal UI** -- Cash drawer operations are initiated from the POS terminal interface
- **Staff Authentication** -- `openedBy`, `closedBy`, `performedBy`, and `approvedBy` fields reference authenticated staff user IDs
- **POS Transaction System** -- Cash sale and refund movements link to POS transactions via `transactionId`

### Settings Dependencies

- **Club Configuration** -- Cash drawers are scoped to a club via `clubId`
- **Denomination Configuration** -- The denomination JSON structure (e.g., `{ "1000": 5, "500": 10 }`) must match the club's configured currency denominations

### Data Dependencies

- **Club** -- `CashDrawer.clubId` references the `Club` model
- **CashDrawer** -- `CashDrawerShift.cashDrawerId` references the parent drawer
- **CashDrawerShift** -- `CashMovement.shiftId` references the parent shift

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| Cash drawer name | String (100) | -- | Club Admin | Display name for the drawer (e.g., "Main Bar Register") |
| Cash drawer location | String (200) | null | Club Admin | Physical location description |
| Cash drawer active status | Boolean | true | Club Admin | Whether the drawer is available for use |
| Opening float requirement | Decimal | -- | Club Admin | Expected opening float amount for the drawer |
| Denomination tracking | Boolean | false | Club Admin | Whether to require denomination-level counts at open/close |
| Pay-in/pay-out approval required | Boolean | true | Club Admin | Whether pay-in and pay-out movements require manager approval |
| Variance threshold | Decimal | 0.00 | Club Admin | Maximum acceptable variance before flagging for review |

## Data Model

```typescript
type CashDrawerStatus = 'OPEN' | 'CLOSED' | 'SUSPENDED';

type CashMovementType =
  | 'OPENING_FLOAT'
  | 'CASH_SALE'
  | 'CASH_REFUND'
  | 'PAID_IN'
  | 'PAID_OUT'
  | 'DROP'
  | 'ADJUSTMENT'
  | 'CLOSING_COUNT';

interface CashDrawer {
  id: string;         // UUID, primary key
  clubId: string;     // UUID, FK to Club
  name: string;       // VarChar(100)
  location: string | null;  // VarChar(200)
  isActive: boolean;  // default: true
  createdAt: Date;
  updatedAt: Date;

  // Relations
  club: Club;
  shifts: CashDrawerShift[];
}

interface CashDrawerShift {
  id: string;              // UUID, primary key
  cashDrawerId: string;    // UUID, FK to CashDrawer
  status: CashDrawerStatus; // default: OPEN

  // Opening
  openedBy: string;        // UUID, staff user ID
  openedAt: Date;          // default: now()
  openingFloat: number;    // Decimal(12,2)
  openingDenominations: Record<string, number> | null; // JSON, e.g. { "1000": 5, "500": 10 }

  // Closing
  closedBy: string | null;   // UUID, staff user ID
  closedAt: Date | null;
  closingCount: number | null; // Decimal(12,2)
  closingDenominations: Record<string, number> | null; // JSON

  // Calculated totals
  expectedCash: number | null; // Decimal(12,2)
  actualCash: number | null;   // Decimal(12,2)
  variance: number | null;     // Decimal(12,2)
  varianceNote: string | null; // VarChar(500)

  // Summary
  totalSales: number;    // Decimal(12,2), default: 0
  totalRefunds: number;  // Decimal(12,2), default: 0
  totalPaidIn: number;   // Decimal(12,2), default: 0
  totalPaidOut: number;  // Decimal(12,2), default: 0
  totalDrops: number;    // Decimal(12,2), default: 0

  createdAt: Date;
  updatedAt: Date;

  // Relations
  cashDrawer: CashDrawer;
  movements: CashMovement[];
}

interface CashMovement {
  id: string;              // UUID, primary key
  shiftId: string;         // UUID, FK to CashDrawerShift
  type: CashMovementType;
  amount: number;          // Decimal(12,2)
  description: string | null; // VarChar(500)
  reference: string | null;   // VarChar(100)

  // For PAID_IN/PAID_OUT
  reason: string | null;     // VarChar(200)
  approvedBy: string | null; // UUID, manager user ID

  // For CASH_SALE/CASH_REFUND
  transactionId: string | null; // UUID, FK to POS transaction

  performedBy: string;  // UUID, staff user ID
  performedAt: Date;    // default: now()

  // Relations
  shift: CashDrawerShift;
}
```

## Business Rules

1. **One open shift per drawer** -- A cash drawer may only have one shift with status `OPEN` at any time. A new shift cannot be opened until the current shift is closed.
2. **Opening float required** -- Every shift must be opened with a non-negative `openingFloat` value. Zero is allowed (empty drawer).
3. **Shift closure calculates variance** -- When a shift is closed, `expectedCash` is computed as: `openingFloat + totalSales - totalRefunds + totalPaidIn - totalPaidOut - totalDrops`. The `variance` is `actualCash - expectedCash`.
4. **Movement types update shift totals** -- Each `CashMovement` of type `CASH_SALE`, `CASH_REFUND`, `PAID_IN`, `PAID_OUT`, or `DROP` must update the corresponding summary field on the parent shift.
5. **Pay-in/pay-out approval** -- Movements of type `PAID_IN` or `PAID_OUT` should require an `approvedBy` value (manager authorization) when the club setting requires it.
6. **Suspended drawers block movements** -- No new movements can be recorded on a shift with status `SUSPENDED`. The shift must be reopened first.
7. **Immutable closed shifts** -- Once a shift reaches `CLOSED` status, no further movements can be added. Corrections must be made via the settlement/exception process.
8. **Audit trail** -- Every movement records `performedBy` and `performedAt` for complete traceability.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Staff attempts to open a second shift on an already-open drawer | Reject with error: "Drawer already has an open shift. Close the current shift first." |
| Closing count results in a large variance (exceeds threshold) | Allow closure but flag the shift for manager review; create a SettlementException if EOD settlement is active |
| Cash movement recorded after shift was suspended | Reject with error: "Shift is suspended. Resume the shift before recording movements." |
| Denomination JSON contains invalid keys or negative values | Validate denomination keys against club currency configuration; reject negative quantities |
| Network failure during shift close | The closing count should be saved as a pending state; allow retry without losing the count data |
| Multiple staff members sharing a single drawer | Each movement tracks its own `performedBy`; the shift tracks `openedBy` and `closedBy` separately |
| Cash drop reduces drawer balance to zero mid-shift | Permitted; `totalDrops` accumulates and is factored into the expected cash calculation |
| Shift opened but never closed (e.g., forgotten) | System should flag stale open shifts (open > 24 hours) for manager attention |
