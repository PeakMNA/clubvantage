# Billing / Minimum Spend / Requirements & Tracking

## Overview

Tracks minimum spending requirements per membership type and individual member progress toward meeting those requirements. Clubs can define named spending requirements with configurable periods (monthly, quarterly, annually), specify which spending categories count, and configure how shortfalls are handled. Each member's progress is tracked per period with projected spend calculations, carry-forward amounts, exemption handling, and detailed category breakdowns.

## Status

Schema implemented, UI not yet built.

## Capabilities

- Define named minimum spend requirements per club with configurable minimum amounts and periods
- Target requirements to specific membership types
- Configure which spending categories count: food & beverage, golf, spa, retail, events, plus specific category include/exclude lists
- Choose shortfall handling: charge the difference, carry forward, waive, or apply to credit balance
- Set grace periods for shortfall resolution
- Configure progress notifications at percentage milestones and days-before-end alerts
- Track individual member spend per period with required amount, current spend, projected spend, and shortfall
- Support carry-forward of partial credits from prior periods
- Exempt individual members with documented reasons and approver tracking
- Resolve shortfalls with multiple action options and full audit trail
- Link shortfall charges to invoices
- Track spend breakdown by category in JSON format
- Calculate projected spend based on current pace

## Dependencies

### Interface Dependencies

- **Member Management** -- `MemberMinimumSpend.memberId` links to the member whose spending is tracked
- **POS Transaction System** -- Qualifying transactions update `currentSpend` on the member's minimum spend record
- **Invoice System** -- Shortfall charges link to invoices via `shortfallInvoiceId`
- **Notification System** -- Progress alerts and shortfall notifications are sent based on configured thresholds

### Settings Dependencies

- **Club Configuration** -- Requirements are scoped to a club via `clubId`
- **Membership Types** -- `membershipTypes` array determines which members the requirement applies to
- **Category Configuration** -- `includedCategories` and `excludedCategories` reference the club's POS category IDs

### Data Dependencies

- **MinimumSpendRequirement** -- `MemberMinimumSpend.requirementId` references the parent requirement definition
- **Member** -- `MemberMinimumSpend.memberId` references the member
- **Invoice** -- `shortfallInvoiceId` references the invoice created for a shortfall charge

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| Requirement name | String (100) | -- | Club Admin | Display name for the requirement (e.g., "Quarterly F&B Minimum") |
| Description | Text | null | Club Admin | Detailed description of the requirement |
| Membership types | String[] | -- | Club Admin | Array of membership type IDs this requirement applies to |
| Minimum amount | Decimal | -- | Club Admin | Required minimum spend amount per period |
| Period | Enum | QUARTERLY | Club Admin | Spend tracking period: MONTHLY, QUARTERLY, or ANNUALLY |
| Include food & beverage | Boolean | true | Club Admin | Count F&B spending toward minimum |
| Include golf | Boolean | true | Club Admin | Count golf spending toward minimum |
| Include spa | Boolean | false | Club Admin | Count spa spending toward minimum |
| Include retail | Boolean | false | Club Admin | Count retail spending toward minimum |
| Include events | Boolean | false | Club Admin | Count event spending toward minimum |
| Included categories | String[] | [] | Club Admin | Specific category IDs to include (overrides general flags) |
| Excluded categories | String[] | [] | Club Admin | Specific category IDs to exclude |
| Default shortfall action | Enum | CHARGE_DIFFERENCE | Club Admin | Default action when a member falls short: CHARGE_DIFFERENCE, CARRY_FORWARD, WAIVE, CREDIT_BALANCE |
| Grace period days | Int | 0 | Club Admin | Days after period end before shortfall action is taken |
| Allow partial credit | Boolean | false | Club Admin | Whether partial spend can roll over to the next period |
| Notify at percent | Int[] | [50, 75, 90] | Club Admin | Send alerts at these percentage thresholds of the period |
| Notify days before end | Int[] | [30, 14, 7] | Club Admin | Send alerts this many days before the period ends |
| Is active | Boolean | true | Club Admin | Whether this requirement is currently in effect |
| Effective from | DateTime | now() | Club Admin | Start date for the requirement |
| Effective to | DateTime | null | Club Admin | Optional end date for the requirement |

## Data Model

```typescript
type MinimumSpendPeriod = 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';

type ShortfallAction =
  | 'CHARGE_DIFFERENCE'  // Bill member for the shortfall amount
  | 'CARRY_FORWARD'      // Carry shortfall to next period
  | 'WAIVE'              // Waive the shortfall (manual override)
  | 'CREDIT_BALANCE';    // Apply to member credit balance

type MemberSpendStatus =
  | 'ON_TRACK'        // Current spending is on pace to meet minimum
  | 'AT_RISK'         // Spending is below pace, may not meet minimum
  | 'MET'             // Minimum has been met for the period
  | 'SHORTFALL'       // Period ended below minimum
  | 'EXEMPT'          // Member is exempt from minimum spend
  | 'PENDING_ACTION'  // Shortfall pending action
  | 'RESOLVED';       // Shortfall has been resolved

interface MinimumSpendRequirement {
  id: string;     // UUID, primary key
  clubId: string; // UUID

  name: string;        // VarChar(100)
  description: string | null; // Text

  // Requirement configuration
  membershipTypes: string[];     // Array of membership type IDs
  minimumAmount: number;         // Decimal(12,2)
  period: MinimumSpendPeriod;    // default: QUARTERLY

  // What counts toward minimum spend
  includeFoodBeverage: boolean;  // default: true
  includeGolf: boolean;          // default: true
  includeSpa: boolean;           // default: false
  includeRetail: boolean;        // default: false
  includeEvents: boolean;        // default: false
  includedCategories: string[];  // Specific category IDs to include
  excludedCategories: string[];  // Specific category IDs to exclude

  // Shortfall handling
  defaultShortfallAction: ShortfallAction; // default: CHARGE_DIFFERENCE
  gracePeriodDays: number;                 // Int, default: 0
  allowPartialCredit: boolean;             // default: false

  // Notifications
  notifyAtPercent: number[];     // default: [50, 75, 90]
  notifyDaysBeforeEnd: number[]; // default: [30, 14, 7]

  isActive: boolean;       // default: true
  effectiveFrom: Date;     // default: now()
  effectiveTo: Date | null;

  createdAt: Date;
  updatedAt: Date;

  // Relations
  memberSpends: MemberMinimumSpend[];
}

interface MemberMinimumSpend {
  id: string;            // UUID, primary key
  clubId: string;        // UUID
  memberId: string;      // UUID, FK to Member
  requirementId: string; // UUID, FK to MinimumSpendRequirement

  // Period tracking
  periodStart: Date;   // Date
  periodEnd: Date;     // Date
  periodLabel: string; // VarChar(50), e.g. "Q1 2024", "January 2024"

  // Spend tracking
  requiredAmount: number;            // Decimal(12,2)
  currentSpend: number;              // Decimal(12,2), default: 0
  projectedSpend: number | null;     // Decimal(12,2), based on current pace
  shortfallAmount: number | null;    // Decimal(12,2), requiredAmount - currentSpend (if negative)
  carryForwardAmount: number;        // Decimal(12,2), default: 0, from previous period

  // Status and resolution
  status: MemberSpendStatus;     // default: ON_TRACK
  isExempt: boolean;             // default: false
  exemptReason: string | null;   // Text
  exemptBy: string | null;       // UUID, staff user ID
  exemptAt: Date | null;

  // Shortfall resolution
  shortfallAction: ShortfallAction | null;
  shortfallResolvedBy: string | null;  // UUID, staff user ID
  shortfallResolvedAt: Date | null;
  shortfallNote: string | null;        // Text
  shortfallInvoiceId: string | null;   // UUID, FK to Invoice (if billed)

  // Spend breakdown by category
  spendByCategory: Record<string, number> | null; // JSON, e.g. { "food": 500, "golf": 300 }

  lastCalculatedAt: Date; // default: now()
  createdAt: Date;
  updatedAt: Date;

  // Relations
  requirement: MinimumSpendRequirement;
  member: Member;
}
```

## Business Rules

1. **Unique member-period tracking** -- Enforced by a unique constraint on `[memberId, requirementId, periodStart]`. A member can only have one tracking record per requirement per period.
2. **Requirement applies by membership type** -- When a requirement is active, `MemberMinimumSpend` records are automatically created for all members whose membership type is in the `membershipTypes` array.
3. **Qualifying spend calculation** -- Only transactions in categories matching the requirement's include/exclude configuration count toward `currentSpend`. The boolean flags (`includeFoodBeverage`, `includeGolf`, etc.) provide broad category control, while `includedCategories` and `excludedCategories` offer fine-grained overrides.
4. **Projected spend calculation** -- `projectedSpend` is calculated as: `(currentSpend / daysPassed) * totalDaysInPeriod`. This helps identify at-risk members early.
5. **Status transitions** -- `ON_TRACK` when projected to meet minimum. `AT_RISK` when projected to fall short. `MET` when `currentSpend >= requiredAmount`. `SHORTFALL` when period ends and `currentSpend < requiredAmount`. `PENDING_ACTION` when shortfall is identified and awaiting resolution. `RESOLVED` when shortfall action has been taken.
6. **Carry-forward logic** -- When `allowPartialCredit` is true and the shortfall action is `CARRY_FORWARD`, the overage from the current period (if any) is set as `carryForwardAmount` on the next period's record. Carry-forward counts toward the next period's `requiredAmount`.
7. **Shortfall actions** -- `CHARGE_DIFFERENCE`: Creates an invoice for `requiredAmount - currentSpend` and links it via `shortfallInvoiceId`. `CARRY_FORWARD`: Adds the shortfall to the next period's required amount. `WAIVE`: Sets status to `RESOLVED` with a note. `CREDIT_BALANCE`: Deducts shortfall from member credit balance.
8. **Grace period** -- Shortfall actions are not executed until `gracePeriodDays` after the period end, giving members time to make additional qualifying purchases.
9. **Exemption handling** -- Individual members can be exempted by setting `isExempt: true` with a documented `exemptReason` and `exemptBy` for audit. Exempt members have status `EXEMPT` regardless of spend.
10. **Notification scheduling** -- Notifications are sent when `currentSpend` crosses the percentages defined in `notifyAtPercent` (relative to `requiredAmount`) and at `notifyDaysBeforeEnd` days before `periodEnd`.
11. **Inactive requirements** -- Setting `isActive: false` or passing `effectiveTo` stops new period records from being created but does not affect existing tracking records.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Member joins mid-period | Pro-rate the `requiredAmount` based on days remaining in the period; set `periodStart` to the member's join date |
| Member changes membership type mid-period | If the new type is not in `membershipTypes`, set status to `EXEMPT` with reason "Membership type changed". If the new type is included in a different requirement, create a new tracking record pro-rated |
| Transaction is refunded after counting toward minimum | Subtract the refunded amount from `currentSpend`; recalculate status. If this drops below MET, revert to ON_TRACK or AT_RISK |
| Multiple requirements apply to the same member | Each requirement gets its own `MemberMinimumSpend` record; a single transaction may count toward multiple requirements if it matches their category configurations |
| Requirement amount is changed mid-period | Existing tracking records retain their original `requiredAmount`; the new amount applies to future periods only |
| Period ends with zero spend | `shortfallAmount` equals the full `requiredAmount`; handle according to `defaultShortfallAction` |
| Carry-forward from previous period exceeds current period requirement | `currentSpend` starts at `carryForwardAmount`; if this alone meets the requirement, status is immediately `MET` |
| Member is exempted after shortfall invoice is generated | Mark the shortfall as `RESOLVED` with action `WAIVE`; the generated invoice should be voided separately |
| Club deactivates a requirement with active tracking records | Existing records remain for reporting; no new shortfall actions are taken; records in `ON_TRACK` or `AT_RISK` status are set to `RESOLVED` |
| `spendByCategory` JSON grows large due to many categories | Cap the breakdown at top-level categories only (food, golf, spa, retail, events, other); individual sub-category detail is available from transaction records |
