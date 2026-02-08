# Billing / Payments / Auto-Pay

## Overview

Configurable automatic payment processing for member balances, with attempt tracking and retry logic. Each member can enable auto-pay linked to a stored payment method, with configurable schedules (pay on invoice due date, statement date, or a fixed monthly date), spending limits, and category filters. Failed payments are automatically retried according to configurable intervals, and members receive notifications before, on success, and on failure.

## Status

Schema implemented, UI not yet built.

## Capabilities

- Enable/disable auto-pay per member with a single stored payment method
- Configure payment schedule: invoice due date, statement date, or fixed day of month
- Set per-payment and monthly maximum amounts to cap automatic charges
- Require member approval for charges above a configured threshold
- Filter auto-pay to dues-only or exclude specific charge categories
- Configure pre-payment notifications with adjustable lead time
- Track each payment attempt with status progression: pending, processing, succeeded, failed, cancelled
- Record Stripe payment intent and charge IDs for reconciliation
- Automatic retry on failure with configurable max attempts and interval
- Support manual retry triggering by staff
- Link successful auto-pay attempts to payment transaction records

## Dependencies

### Interface Dependencies

- **Stored Payment Methods** -- Auto-pay requires a valid, active `StoredPaymentMethod` linked via `paymentMethodId`
- **Invoice System** -- Auto-pay attempts reference invoices via `invoiceId` to determine what to pay
- **Stripe Payment Gateway** -- All charges processed through Stripe; `stripePaymentIntentId` and `stripeChargeId` track Stripe-side records
- **Member Portal** -- Members configure auto-pay settings through the portal
- **Notification System** -- Pre-payment, success, and failure notifications sent to members

### Settings Dependencies

- **Club Configuration** -- Auto-pay settings and attempts are scoped to a club via `clubId`
- **Stripe Configuration** -- Club must have Stripe connected for payment processing
- **Invoice Configuration** -- Invoice due dates and statement cycles drive the `INVOICE_DUE` and `STATEMENT_DATE` schedules

### Data Dependencies

- **StoredPaymentMethod** -- `AutoPaySetting.paymentMethodId` and `AutoPayAttempt.paymentMethodId` reference the stored payment method
- **Invoice** -- `AutoPayAttempt.invoiceId` references the invoice being paid
- **Member** -- Both models reference `memberId` for the member whose payments are automated

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| Auto-pay enabled | Boolean | true | Member | Master toggle for the member's auto-pay |
| Payment schedule | Enum | INVOICE_DUE | Member | When to trigger auto-pay: INVOICE_DUE, STATEMENT_DATE, or MONTHLY_FIXED |
| Payment day of month | Int (1-28) | null | Member | Day of month for MONTHLY_FIXED schedule |
| Max payment amount | Decimal | null | Member | Maximum amount per individual auto-pay charge; null means no limit |
| Monthly max amount | Decimal | null | Member | Maximum total auto-pay charges per month; null means no limit |
| Require approval above | Decimal | null | Member | Charges above this amount require explicit member approval before processing |
| Pay dues only | Boolean | false | Member | Only auto-pay dues invoices, skip other charges |
| Excluded categories | String[] | [] | Member | Category codes excluded from auto-pay processing |
| Notify before payment | Boolean | true | Member | Send notification before processing auto-pay |
| Notify days before | Int | 3 | Member | Days before scheduled payment to send advance notification |
| Notify on success | Boolean | true | Member | Send confirmation after successful payment |
| Notify on failure | Boolean | true | Member | Send alert after failed payment |
| Max retry attempts | Int | 3 | Club Admin | Maximum number of retry attempts for failed payments |
| Retry interval days | Int | 3 | Club Admin | Days between retry attempts |

## Data Model

```typescript
type AutoPaySchedule = 'INVOICE_DUE' | 'STATEMENT_DATE' | 'MONTHLY_FIXED';

type AutoPayAttemptStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'CANCELLED';

interface AutoPaySetting {
  id: string;              // UUID, primary key
  clubId: string;          // UUID
  memberId: string;        // UUID, unique (one setting per member)
  paymentMethodId: string; // UUID, FK to StoredPaymentMethod

  // Auto-pay configuration
  isEnabled: boolean;          // default: true
  schedule: AutoPaySchedule;   // default: INVOICE_DUE
  paymentDayOfMonth: number | null; // Int, for MONTHLY_FIXED schedule (1-28)

  // Limits
  maxPaymentAmount: number | null;     // Decimal(12,2), max per payment
  monthlyMaxAmount: number | null;     // Decimal(12,2), max per month
  requireApprovalAbove: number | null; // Decimal(12,2), require member approval above this

  // Invoice filtering
  payDuesOnly: boolean;        // default: false
  excludeCategories: string[]; // Category codes to exclude from auto-pay

  // Notifications
  notifyBeforePayment: boolean; // default: true
  notifyDaysBefore: number;     // Int, default: 3
  notifyOnSuccess: boolean;     // default: true
  notifyOnFailure: boolean;     // default: true

  // Retry settings
  maxRetryAttempts: number;  // Int, default: 3
  retryIntervalDays: number; // Int, default: 3

  createdAt: Date;
  updatedAt: Date;

  // Relations
  paymentMethod: StoredPaymentMethod;
}

interface AutoPayAttempt {
  id: string;              // UUID, primary key
  clubId: string;          // UUID
  memberId: string;        // UUID
  paymentMethodId: string; // UUID, FK to StoredPaymentMethod
  invoiceId: string | null; // UUID, FK to Invoice

  // Attempt details
  amount: number;                  // Decimal(12,2)
  attemptNumber: number;           // Int, default: 1 (1, 2, 3 for retries)
  status: AutoPayAttemptStatus;    // default: PENDING

  // Stripe references
  stripePaymentIntentId: string | null; // VarChar(255), pi_xxx
  stripeChargeId: string | null;        // VarChar(255), ch_xxx

  // Result
  processedAt: Date | null;
  succeededAt: Date | null;
  failedAt: Date | null;
  failureCode: string | null;    // VarChar(100), Stripe error code
  failureMessage: string | null; // VarChar(500)

  // Retry tracking
  nextRetryAt: Date | null;
  isManualRetry: boolean; // default: false

  // Reference to payment if successful
  paymentTransactionId: string | null; // UUID

  createdAt: Date;
  updatedAt: Date;

  // Relations
  paymentMethod: StoredPaymentMethod;
  invoice: Invoice | null;
}
```

## Business Rules

1. **One auto-pay setting per member** -- Enforced by a unique constraint on `memberId`. A member can only have one auto-pay configuration at a time.
2. **Payment method must be active** -- Auto-pay can only be enabled when the linked `StoredPaymentMethod` has status `ACTIVE`. If the payment method becomes `EXPIRED` or `FAILED`, auto-pay attempts are paused until the member updates their method.
3. **Schedule determines trigger timing** -- `INVOICE_DUE`: payment is triggered on the invoice due date. `STATEMENT_DATE`: payment is triggered when the billing statement is generated. `MONTHLY_FIXED`: payment is triggered on `paymentDayOfMonth` each month.
4. **Per-payment limit enforcement** -- If `maxPaymentAmount` is set and the invoice amount exceeds it, the auto-pay attempt is skipped and the member is notified to pay manually.
5. **Monthly limit enforcement** -- If `monthlyMaxAmount` is set, the system sums all successful auto-pay amounts for the current month. If the next payment would exceed the limit, it is skipped.
6. **Approval threshold** -- If `requireApprovalAbove` is set and the payment amount exceeds it, the attempt is created with status `PENDING` and the member is notified to approve or decline before processing.
7. **Category filtering** -- When `payDuesOnly` is true, only invoices categorized as membership dues are auto-paid. The `excludeCategories` array provides finer-grained control over which invoice categories are excluded.
8. **Retry logic** -- On failure, the system schedules a retry by setting `nextRetryAt` to `failedAt + retryIntervalDays`. Retries continue up to `maxRetryAttempts`. Each retry creates a new `AutoPayAttempt` with an incremented `attemptNumber`.
9. **Manual retry** -- Staff can trigger a manual retry at any time by creating a new attempt with `isManualRetry: true`. Manual retries do not count against `maxRetryAttempts`.
10. **Pre-payment notification** -- When `notifyBeforePayment` is true, a notification is sent `notifyDaysBefore` days before the scheduled payment date, giving the member time to adjust or cancel.
11. **Successful payment links to transaction** -- When an auto-pay attempt succeeds, `paymentTransactionId` is set to the resulting payment transaction record for reconciliation.
12. **Cascade from payment method** -- If a `StoredPaymentMethod` is deleted (cascade from member deletion), all associated `AutoPaySetting` records are also deleted.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Payment method expires between scheduling and processing | Check payment method status immediately before processing; if EXPIRED, mark attempt as FAILED with reason "Payment method expired" and notify member |
| Invoice is paid manually before auto-pay triggers | Check invoice status before processing; if already PAID, cancel the auto-pay attempt with status CANCELLED |
| Monthly limit partially remaining (e.g., $50 left of $500 limit) | If the invoice is $200 but only $50 remains under the monthly limit, skip the auto-pay entirely (do not partial-pay); notify member |
| MONTHLY_FIXED schedule on the 29th-31st | `paymentDayOfMonth` is capped at 28 in the schema to avoid month-length issues |
| Member disables auto-pay with pending attempts | Set `isEnabled` to false; cancel any PENDING attempts; do not cancel PROCESSING attempts (let them complete) |
| Stripe returns a "card_declined" error | Record `failureCode` and `failureMessage` from Stripe; schedule retry if under `maxRetryAttempts`; increment `failureCount` on the StoredPaymentMethod |
| All retry attempts exhausted | After the final failed attempt, notify the member and club staff; no further automatic retries; staff can still trigger manual retry |
| Concurrent auto-pay and manual payment for the same invoice | The auto-pay processor should acquire a lock on the invoice before charging; if invoice status changes to PAID during processing, cancel the attempt |
| Member changes payment method while an attempt is PROCESSING | The in-flight attempt continues with the original payment method; future attempts use the new method |
| Club changes retry settings after a failure | New settings apply to future retries; already-scheduled `nextRetryAt` values are not retroactively changed |
