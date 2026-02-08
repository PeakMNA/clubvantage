# Billing / Payments / Stored Payment Methods

## Overview

Securely stores member payment methods (credit cards, bank accounts) for recurring billing and one-click payments. Payment method tokens are stored via Stripe -- no raw card numbers are ever persisted. Each member can have multiple stored methods with one designated as default. The system tracks card brand, last four digits, expiry, verification status, and failure history to proactively manage payment method health.

## Status

Schema implemented, UI not yet built.

## Capabilities

- Store credit/debit cards and bank accounts (ACH) as payment methods via Stripe tokenization
- Display non-sensitive card details: brand, last 4 digits, expiry month/year, cardholder name
- Designate one payment method as the default for a member
- Flag a payment method for auto-pay usage
- Track payment method status: active, expired, failed, removed
- Record verification timestamps and last-used dates
- Track consecutive failure counts and last failure reasons for proactive card health monitoring
- Link stored payment methods to auto-pay settings and auto-pay attempts
- Support multiple payment methods per member with unique constraint on Stripe payment method ID

## Dependencies

### Interface Dependencies

- **Stripe Payment Gateway** -- All payment method tokenization and charging goes through Stripe; `stripeCustomerId` and `stripePaymentMethodId` are Stripe-issued identifiers
- **Member Portal** -- Members add, remove, and manage their stored payment methods through the member portal
- **Staff Billing UI** -- Staff can view member payment methods and initiate charges from the billing interface

### Settings Dependencies

- **Club Configuration** -- Payment methods are scoped to a club via `clubId`
- **Stripe Configuration** -- Club must have a valid Stripe account connected for payment method storage

### Data Dependencies

- **Member** -- `StoredPaymentMethod.memberId` references the `Member` model
- **AutoPaySetting** -- Auto-pay settings reference a stored payment method
- **AutoPayAttempt** -- Auto-pay attempts reference the payment method used

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| Max payment methods per member | Int | 5 | Club Admin | Maximum number of stored payment methods a member can have |
| Require default payment method | Boolean | false | Club Admin | Whether members are required to have a default payment method on file |
| Auto-expire cards | Boolean | true | System | Automatically set status to EXPIRED when card expiry date passes |
| Failure lockout threshold | Int | 5 | Club Admin | Number of consecutive failures before the payment method is marked FAILED |
| Accepted card brands | String[] | ["visa", "mastercard", "amex"] | Club Admin | Card brands the club accepts |
| Allow bank account (ACH) | Boolean | false | Club Admin | Whether direct debit / bank account payment methods are enabled |
| Notify member on expiry | Boolean | true | Club Admin | Send notification to member when a card is about to expire |
| Expiry warning days | Int | 30 | Club Admin | Days before expiry to send warning notification |

## Data Model

```typescript
type StoredPaymentMethodType = 'CARD' | 'BANK_ACCOUNT';

type StoredPaymentMethodStatus = 'ACTIVE' | 'EXPIRED' | 'FAILED' | 'REMOVED';

interface StoredPaymentMethod {
  id: string;       // UUID, primary key
  clubId: string;   // UUID, FK to Club (via index)
  memberId: string; // UUID, FK to Member

  // Stripe references
  stripeCustomerId: string | null;  // VarChar(255), Stripe customer ID (cus_xxx)
  stripePaymentMethodId: string;    // VarChar(255), Stripe payment method ID (pm_xxx)

  // Card details (non-sensitive)
  type: StoredPaymentMethodType;    // default: CARD
  brand: string;                    // VarChar(50), e.g. "visa", "mastercard", "amex"
  last4: string;                    // VarChar(4)
  expiryMonth: number | null;       // Int
  expiryYear: number | null;        // Int
  cardholderName: string | null;    // VarChar(200)

  // Status
  status: StoredPaymentMethodStatus; // default: ACTIVE
  isDefault: boolean;                // default: false
  isAutoPayEnabled: boolean;         // default: false

  // Verification
  verifiedAt: Date | null;
  lastUsedAt: Date | null;
  failureCount: number;              // Int, default: 0
  lastFailureReason: string | null;  // VarChar(500)

  createdAt: Date;
  updatedAt: Date;

  // Relations
  member: Member;
  autoPaySettings: AutoPaySetting[];
  autoPayAttempts: AutoPayAttempt[];
}
```

## Business Rules

1. **Stripe tokenization only** -- Raw card numbers and CVVs are never stored. Only Stripe-issued `stripePaymentMethodId` and `stripeCustomerId` tokens are persisted.
2. **Unique payment method per member** -- Enforced by a unique constraint on `[memberId, stripePaymentMethodId]`. A member cannot store the same Stripe payment method twice.
3. **One default per member** -- Only one payment method can have `isDefault: true` per member. Setting a new default must unset the previous default in a single transaction.
4. **Auto-expire on card expiry** -- When the current date passes the `expiryMonth`/`expiryYear`, the system automatically transitions status from `ACTIVE` to `EXPIRED`.
5. **Failure tracking** -- Each failed charge increments `failureCount` and records `lastFailureReason`. When `failureCount` reaches the lockout threshold, status transitions to `FAILED`.
6. **Successful charge resets failure count** -- A successful charge resets `failureCount` to 0, clears `lastFailureReason`, and updates `lastUsedAt`.
7. **Removal is a soft delete** -- When a member removes a payment method, status is set to `REMOVED` rather than deleting the record, preserving audit history. The Stripe payment method is detached from the customer.
8. **Cannot remove last default** -- If a member has auto-pay enabled and tries to remove their only active payment method, the operation is blocked until auto-pay is disabled or another method is added.
9. **Member cascade delete** -- If a member record is deleted, all stored payment methods are cascade-deleted (and Stripe payment methods should be detached via webhook/cleanup job).

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Member adds a card that is already expired | Reject during Stripe tokenization; if somehow stored, immediately mark as EXPIRED |
| Stripe webhook reports card updated (e.g., new expiry from card network) | Update `expiryMonth`, `expiryYear`, and `brand` from the Stripe webhook payload; reset status to ACTIVE if previously EXPIRED |
| Member removes their default payment method while others exist | Prompt the member to select a new default; if declined, the next most recently used ACTIVE method becomes default |
| Payment method used concurrently in auto-pay and manual charge | Both operations reference the same Stripe payment method; Stripe handles concurrency; both attempts are recorded |
| Stripe customer ID changes (e.g., account migration) | Update `stripeCustomerId` on all payment methods for that member |
| Club disables ACH after members have stored bank accounts | Existing BANK_ACCOUNT methods remain active but new ones cannot be added; existing ones can still be used until removed |
| Member has multiple cards from the same bank with different last4 | Each gets its own record; uniqueness is on `stripePaymentMethodId`, not on `last4` |
| Stripe API unavailable when member tries to add a card | Return an error to the member; no partial record is created in the database |
