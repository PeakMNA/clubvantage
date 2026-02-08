# Members / Sub-Accounts / Member Sub-Accounts

## Overview

Sub-accounts for members allowing prepaid balances, credits, and activity-specific spending tracking (e.g., dining credits, golf credits). A primary member can create sub-accounts for family members, dependents, or employees, each with their own PIN for authentication, configurable spending permissions by category, and daily/weekly/monthly/per-transaction spending limits. All transactions are recorded against the sub-account with full audit trail including staff verification and location context.

## Status

Schema implemented, UI not yet built.

## Capabilities

- Create named sub-accounts under a primary member with relationship type (child, spouse, employee, etc.)
- Authenticate sub-account holders via hashed PIN with lockout protection
- Assign granular permissions by category: golf, food & beverage, retail, spa, events, or all
- Set spending limits at daily, weekly, monthly, and per-transaction levels
- Track rolling spend against each limit period with automatic resets
- Record transactions with amount, description, category, and references to originating POS transactions, line items, or tee times
- Track staff verification for each transaction
- Capture location context (e.g., "Pro Shop", "Restaurant") on transactions
- Manage sub-account lifecycle: active, suspended, expired, revoked
- Set validity periods with start and optional end dates
- Notify primary member on sub-account usage and limit events
- Support unique sub-account names per member per club

## Dependencies

### Interface Dependencies

- **POS Terminal UI** -- Sub-account transactions are initiated at POS terminals where staff verify the PIN
- **Member Portal** -- Primary members manage sub-accounts, set limits, and view transaction history through the portal
- **Staff Authentication** -- `verifiedBy` on transactions references the staff member who verified the PIN
- **Tee Time Booking** -- `teeTimeId` on transactions references golf bookings made by sub-account holders

### Settings Dependencies

- **Club Configuration** -- Sub-accounts are scoped to a club via `clubId`
- **Category Configuration** -- `SubAccountPermission` categories must align with the club's active service categories

### Data Dependencies

- **Member** -- `SubAccount.memberId` references the primary member who owns the sub-account
- **SubAccount** -- `SubAccountTransaction.subAccountId` references the parent sub-account
- **POS Transactions** -- `paymentTransactionId` and `lineItemId` reference originating POS records
- **Tee Times** -- `teeTimeId` references golf bookings

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| Sub-account name | String (100) | -- | Primary Member | Display name for the sub-account holder |
| Relationship | String (50) | -- | Primary Member | Relationship to primary member (e.g., "Child", "Spouse", "Employee") |
| Email | String (255) | null | Primary Member | Contact email for the sub-account holder |
| Phone | String (50) | null | Primary Member | Contact phone for the sub-account holder |
| PIN | String (hashed) | -- | Primary Member | 4-6 digit PIN for transaction authentication (stored as bcrypt hash) |
| Status | Enum | ACTIVE | Primary Member / Club Admin | Account status: ACTIVE, SUSPENDED, EXPIRED, REVOKED |
| Valid from | DateTime | now() | Primary Member | Start of validity period |
| Valid until | DateTime | null | Primary Member | Optional end of validity period; null means no expiry |
| Permissions | Enum[] | [ALL] | Primary Member | Allowed spending categories: GOLF, FOOD_BEVERAGE, RETAIL, SPA, EVENTS, ALL |
| Daily limit | Decimal | null | Primary Member | Maximum daily spend; null means no limit |
| Weekly limit | Decimal | null | Primary Member | Maximum weekly spend; null means no limit |
| Monthly limit | Decimal | null | Primary Member | Maximum monthly spend; null means no limit |
| Per-transaction limit | Decimal | null | Primary Member | Maximum per single transaction; null means no limit |
| Notify primary on use | Boolean | false | Primary Member | Send notification to primary member for every transaction |
| Notify on limit reached | Boolean | true | Primary Member | Send notification when a spending limit is reached |

## Data Model

```typescript
type SubAccountStatus = 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'REVOKED';

type SubAccountPermission =
  | 'GOLF'           // Can book and pay for golf
  | 'FOOD_BEVERAGE'  // Can charge F&B
  | 'RETAIL'         // Can purchase pro shop items
  | 'SPA'            // Can book and pay for spa services
  | 'EVENTS'         // Can register and pay for events
  | 'ALL';           // Full access to all categories

interface SubAccount {
  id: string;       // UUID, primary key
  clubId: string;   // UUID
  memberId: string; // UUID, FK to Member

  // Sub-account holder info
  name: string;         // VarChar(100)
  relationship: string; // VarChar(50), e.g. "Child", "Spouse", "Employee"
  email: string | null; // VarChar(255)
  phone: string | null; // VarChar(50)

  // Authentication
  pin: string;                  // VarChar(60), bcrypt hashed PIN
  pinAttempts: number;          // Int, default: 0
  pinLockedUntil: Date | null;

  // Status and validity
  status: SubAccountStatus;  // default: ACTIVE
  validFrom: Date;           // default: now()
  validUntil: Date | null;

  // Permissions
  permissions: SubAccountPermission[]; // default: [ALL]

  // Spending limits
  dailyLimit: number | null;          // Decimal(12,2)
  weeklyLimit: number | null;         // Decimal(12,2)
  monthlyLimit: number | null;        // Decimal(12,2)
  perTransactionLimit: number | null; // Decimal(12,2)

  // Usage tracking
  dailySpend: number;        // Decimal(12,2), default: 0
  weeklySpend: number;       // Decimal(12,2), default: 0
  monthlySpend: number;      // Decimal(12,2), default: 0
  lastResetDaily: Date;      // default: now()
  lastResetWeekly: Date;     // default: now()
  lastResetMonthly: Date;    // default: now()

  // Notification preferences
  notifyPrimaryOnUse: boolean;   // default: false
  notifyOnLimitReached: boolean; // default: true

  createdAt: Date;
  updatedAt: Date;

  // Relations
  member: Member;
  transactions: SubAccountTransaction[];
}

interface SubAccountTransaction {
  id: string;           // UUID, primary key
  clubId: string;       // UUID
  subAccountId: string; // UUID, FK to SubAccount

  // Transaction details
  amount: number;                  // Decimal(12,2)
  description: string;             // VarChar(255)
  category: SubAccountPermission;  // Category of the transaction

  // Reference to original transaction
  paymentTransactionId: string | null; // UUID, FK to payment transaction
  lineItemId: string | null;           // UUID, FK to line item
  teeTimeId: string | null;            // UUID, FK to tee time

  // Approval/verification
  verifiedAt: Date;            // default: now()
  verifiedBy: string | null;   // UUID, staff user ID who verified the PIN

  // Location/context
  locationName: string | null; // VarChar(100), e.g. "Pro Shop", "Restaurant"
  notes: string | null;        // Text

  createdAt: Date;

  // Relations
  subAccount: SubAccount;
}
```

## Business Rules

1. **Unique name per member per club** -- Enforced by a unique constraint on `[clubId, memberId, name]`. A primary member cannot create two sub-accounts with the same name.
2. **PIN authentication required** -- Every sub-account transaction requires PIN verification. The PIN is stored as a bcrypt hash and compared at the POS terminal.
3. **PIN lockout** -- After a configurable number of failed PIN attempts (tracked by `pinAttempts`), the sub-account is locked until `pinLockedUntil`. The lockout duration increases with repeated failures (e.g., 5 min, 15 min, 1 hour).
4. **Permission enforcement** -- A transaction's `category` must match one of the sub-account's `permissions`. If the sub-account has `ALL`, any category is permitted. If it has `GOLF` only, only `GOLF` category transactions are allowed.
5. **Spending limit checks** -- Before processing a transaction, the system checks: (a) `amount <= perTransactionLimit`, (b) `dailySpend + amount <= dailyLimit`, (c) `weeklySpend + amount <= weeklyLimit`, (d) `monthlySpend + amount <= monthlyLimit`. All checks use the non-null limits only.
6. **Rolling spend tracking** -- `dailySpend`, `weeklySpend`, and `monthlySpend` accumulate transaction amounts. They are reset to 0 when the corresponding period rolls over (checked via `lastResetDaily`, `lastResetWeekly`, `lastResetMonthly`).
7. **Status enforcement** -- Only sub-accounts with status `ACTIVE` can process transactions. `SUSPENDED` accounts are temporarily blocked (can be reactivated). `EXPIRED` and `REVOKED` accounts are permanently blocked.
8. **Validity period enforcement** -- Transactions are only permitted when the current date is between `validFrom` and `validUntil` (if set). If `validUntil` is passed, status automatically transitions to `EXPIRED`.
9. **Primary member notifications** -- When `notifyPrimaryOnUse` is true, the primary member receives a real-time notification for every transaction. When `notifyOnLimitReached` is true, alerts are sent when any spending limit is reached or nearly reached (e.g., 90%).
10. **Cascade deletion** -- Sub-accounts are cascade-deleted when the parent member is deleted. Sub-account transactions are cascade-deleted when the sub-account is deleted.
11. **Charges billed to primary member** -- All sub-account transactions are ultimately charged to the primary member's account. The sub-account is an authorization and tracking mechanism, not a separate billing entity.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Sub-account holder enters wrong PIN repeatedly | Increment `pinAttempts`; after threshold (e.g., 5 attempts), set `pinLockedUntil` to a future timestamp; reject all further attempts until lockout expires |
| Transaction amount exceeds per-transaction limit | Reject the transaction immediately; notify sub-account holder and optionally the primary member |
| Daily limit reached mid-transaction | Reject the transaction; do not process partial amounts; notify primary member if `notifyOnLimitReached` is true |
| Spend reset happens between limit check and transaction commit | Use a transactional approach: re-check limits within the same database transaction as the spend update |
| Sub-account `validUntil` passes during an active POS session | Reject the transaction at processing time; POS should re-validate status before each charge |
| Primary member suspends sub-account while a transaction is in progress | Allow the in-flight transaction to complete; subsequent transactions will be rejected due to SUSPENDED status |
| Refund on a sub-account transaction | Subtract the refund amount from `dailySpend`/`weeklySpend`/`monthlySpend` as applicable; create a negative-amount SubAccountTransaction |
| Sub-account with ALL permission tries to use a category the club does not offer | The POS will only present categories the club has configured; ALL means all enabled categories, not literally every enum value |
| Multiple sub-accounts for the same dependent (e.g., "Child - Golf" and "Child - Dining") | Allowed since the unique constraint is on `[clubId, memberId, name]`; different names permit different permission/limit configurations for the same person |
| Primary member's own membership is suspended | Sub-accounts inherit the primary member's standing; if the member is suspended, all sub-accounts should also be blocked from transactions |
