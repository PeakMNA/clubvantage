# Billing / AR Profiles / Account Balances and Payment History

## Overview

The AR Profiles system provides a unified accounts receivable identity for all billable entities in ClubVantage. Using a polymorphic design, a single ARProfile model links to either a Member or a CityLedger entity, enabling consistent statement generation, balance tracking, credit management, and collections across all profile types.

Each AR profile maintains a running current balance, tracks last statement and payment dates, enforces credit limits, and supports configurable statement delivery preferences. The profile serves as the central hub connecting invoices, payments, credit notes, and statements to a billable account.

## Status

- **Backend schema**: Designed (ARProfile model specified in Prisma with polymorphic profileType + memberId/cityLedgerId)
- **Backend services**: Planned (ARProfileService for CRUD, balance updates, status management)
- **Frontend pages**: Partially implemented (`/billing/profiles/page.tsx` with profile listing; `/billing/profiles/[id]/page.tsx` for detail view; `/billing/profiles/new/page.tsx` for creation)
- **Frontend components**: Partially implemented (`create-ar-profile-modal.tsx`, `ar-profile-header.tsx`, `ar-profile-badge.tsx`, `ar-account-search.tsx` exist)
- **GraphQL API**: Designed (queries and mutations specified in AR Statement System Design)
- **CityLedger integration**: Partially implemented (`city-ledger.service.ts` exists in API; HOUSE type addition to CityLedgerType enum planned)
- **MemberBillingProfile AR fields**: Designed (arEnabled, arStatementDelivery, arPaymentTermsDays, arCreditLimit, arAutoChargeToMember, arSeparateStatement, arBillingContact planned)

## Capabilities

1. **Polymorphic Profile Creation** -- Create AR profiles for Members (type MEMBER) or City Ledger entities (type CITY_LEDGER), including corporate accounts, vendor accounts, and house accounts.
2. **Account Number Assignment** -- Each AR profile receives a unique account number within the club, used for identification on statements and in accounting integrations.
3. **Balance Tracking** -- Maintain real-time currentBalance reflecting the net of all invoices, payments, and credits. Track lastStatementDate, lastStatementBalance, lastPaymentDate, and lastPaymentAmount.
4. **Credit Limit Management** -- Set optional credit limits per profile. System blocks new charges when the limit is reached (configurable threshold for alerts vs. blocking).
5. **Statement Delivery Preferences** -- Configure per-profile delivery method: EMAIL, PRINT, PORTAL, SMS, EMAIL_AND_PRINT, or ALL.
6. **Payment Terms Configuration** -- Set per-profile payment terms (days from statement date to due date), defaulting to club settings.
7. **Profile Status Management** -- Manage profile lifecycle through ACTIVE, SUSPENDED, and CLOSED statuses with reason tracking and timestamps.
8. **Profile Suspension** -- Suspend AR profiles to block new charges and flag accounts for review. Tracks suspension reason and date.
9. **Profile Closure** -- Close AR profiles when the associated member resigns or the city ledger account is terminated. Tracks closure reason and date. Requires zero balance or write-off.
10. **Aging Calculation** -- Calculate per-profile aging breakdown (current, 1-30, 31-60, 61-90, 90+) based on invoice due dates for statements and the AR aging dashboard.
11. **Staff AR Configuration** -- Staff members (members with staff membership type) can have AR-specific settings on their MemberBillingProfile, including separate statements, charge-to-member routing, and billing contact overrides.
12. **House Account Support** -- City Ledger entries with type HOUSE serve as internal charge accounts (e.g., bar tab, pro shop account) with dedicated AR profiles.
13. **Profile Search** -- Search AR profiles by account number, member name, member number, or city ledger company name.

## Dependencies

### Interface Dependencies

| System | Dependency | Direction | Description |
|--------|-----------|-----------|-------------|
| Members | Member data | Reads | Reads member name, contact info, membership type, status for profile creation and snapshot |
| Members | Member status | Reads | Member status changes (SUSPENDED, RESIGNED, TERMINATED) may trigger AR profile status changes |
| Members | Member billing profile | Reads | Reads AR-specific fields (arEnabled, arCreditLimit, arPaymentTermsDays) from MemberBillingProfile |
| City Ledger | City ledger data | Reads | Reads company name, contact info, type (CORPORATE, VENDOR, HOUSE) for CITY_LEDGER profiles |
| Invoices | Charge posting | Writes | New invoice line items are posted against AR profiles, increasing currentBalance |
| Payments | Payment recording | Writes | Payment allocations reduce AR profile currentBalance |
| Credit Notes | Credit application | Writes | Applied credit notes reduce AR profile currentBalance |
| AR Statements | Statement generation | Reads | Statements are generated per AR profile; reads delivery preferences, balance, payment terms |
| Billing Cycles | Billing configuration | Reads | Reads billing frequency and due date settings that affect AR profile payment terms |
| POS | Charge to account | Writes | POS "charge to member account" transactions create invoices against the member's AR profile |
| Golf | Booking charges | Writes | Tee time fees, guest fees charged to member accounts post against AR profiles |
| Bookings | Facility charges | Writes | Facility booking charges posted to member accounts post against AR profiles |
| Collections | Collection actions | Reads | Collections workflow reads AR profile aging and status to determine escalation actions |
| Settings | Club defaults | Reads | Reads default credit limit, payment terms, delivery method from club settings |

### Settings Dependencies

| Setting | Location | Required |
|---------|----------|----------|
| Default credit limit | Club Settings > Billing > Credit Management | No -- null means no limit |
| Default payment terms | Club Settings > Billing > Invoice Configuration | Yes -- used when profile-level terms not set |
| Default statement delivery | Club Settings > Billing > Statements | Yes -- used when profile-level delivery not set |
| Credit alert threshold percentage | Club Settings > Billing > Credit Management | No -- defaults to 80% |
| Credit block threshold percentage | Club Settings > Billing > Credit Management | No -- defaults to 100% |
| Account number format | Club Settings > Billing | No -- defaults to sequential numbering |

### Data Dependencies

| Data | Source | Required |
|------|--------|----------|
| Member record (for MEMBER profiles) | members table | Yes -- member must exist and be ACTIVE or SUSPENDED |
| CityLedger record (for CITY_LEDGER profiles) | city_ledger table | Yes -- city ledger entry must exist |
| Club record | clubs table | Yes -- AR profiles are scoped to a club |
| Invoices linked to profile | invoices table | No -- new profiles start with zero balance |

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| defaultCreditLimit | decimal(12,2) | null | Club Admin | Default credit limit for new AR profiles; null means unlimited |
| creditLimitByMembershipType | JSON | {} | Club Admin | Credit limits per membership type (overrides default) |
| creditAlertThreshold | int | 80 | Club Admin | Percentage of credit limit that triggers alert notification |
| creditBlockThreshold | int | 100 | Club Admin | Percentage of credit limit that blocks new charges |
| sendAlertToMember | boolean | true | Club Admin | Send email alert to member when credit threshold reached |
| sendAlertToStaff | boolean | true | Club Admin | Send notification to staff when member credit threshold reached |
| allowManagerOverride | boolean | true | Club Admin | Allow managers to override credit limit block temporarily |
| overrideLimit | decimal(12,2) | null | Club Admin | Maximum temporary credit limit increase allowed via override |
| defaultPaymentTermsDays | int | 15 | Club Admin | Default days from statement date to payment due date |
| defaultStatementDelivery | enum | EMAIL | Club Admin | Default delivery method for new AR profiles |
| accountNumberPrefix | string | AR | Club Admin | Prefix for auto-generated account numbers |
| accountNumberFormat | string | {PREFIX}-{SEQ:6} | Club Admin | Format pattern for account numbers |
| autoCreateProfileOnMemberActivation | boolean | true | Club Admin | Automatically create AR profile when member status changes to ACTIVE |
| autoSuspendOnCreditExceeded | boolean | false | Club Admin | Automatically suspend AR profile when credit limit exceeded for 30+ days |
| requireZeroBalanceForClosure | boolean | true | Club Admin | Require zero balance or write-off before closing an AR profile |
| arEnabled (member) | boolean | true | Club Admin | Whether this member participates in AR (on MemberBillingProfile) |
| arStatementDelivery (member) | enum | null | Club Admin | Override statement delivery for this member |
| arPaymentTermsDays (member) | int | null | Club Admin | Override payment terms for this member |
| arCreditLimit (member) | decimal(12,2) | null | Club Admin | Override credit limit for this member |
| arAutoChargeToMember (member) | boolean | false | Club Admin | Staff-specific: route charges to their member account |
| arSeparateStatement (member) | boolean | false | Club Admin | Staff-specific: generate separate statement for staff charges |
| arBillingContact (member) | string | null | Club Admin | Override billing contact email/address |

## Data Model

### ARProfile

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| clubId | UUID | FK to Club |
| accountNumber | string(30) | Unique account identifier within club |
| profileType | enum | MEMBER or CITY_LEDGER |
| memberId | UUID | FK to Member (nullable, set for MEMBER type) |
| cityLedgerId | UUID | FK to CityLedger (nullable, set for CITY_LEDGER type) |
| statementDelivery | enum | EMAIL, PRINT, PORTAL, SMS, EMAIL_AND_PRINT, ALL |
| paymentTermsDays | int | Days from statement date to due date |
| creditLimit | decimal(12,2) | Credit limit (nullable = unlimited) |
| currentBalance | decimal(12,2) | Current outstanding balance |
| lastStatementDate | date | Date of most recent statement |
| lastStatementBalance | decimal(12,2) | Balance on most recent statement |
| lastPaymentDate | date | Date of most recent payment |
| lastPaymentAmount | decimal(12,2) | Amount of most recent payment |
| status | enum | ACTIVE, SUSPENDED, CLOSED |
| suspendedAt | datetime | When profile was suspended |
| suspendedReason | string | Reason for suspension |
| closedAt | datetime | When profile was closed |
| closedReason | string | Reason for closure |
| createdAt | datetime | Record creation timestamp |
| updatedAt | datetime | Last update timestamp |
| createdBy | UUID | FK to User who created |
| updatedBy | UUID | FK to User who last updated |

Unique constraints:
- (clubId, accountNumber)
- (clubId, profileType, memberId) -- prevents duplicate member profiles
- (clubId, profileType, cityLedgerId) -- prevents duplicate city ledger profiles

Indexes:
- (clubId, status) -- for filtering active profiles
- (clubId, profileType) -- for filtering by type

### ARProfileType Enum

| Value | Description |
|-------|-------------|
| MEMBER | Profile linked to a Member record |
| CITY_LEDGER | Profile linked to a CityLedger record (CORPORATE, VENDOR, or HOUSE) |

### ARProfileStatus Enum

| Value | Description |
|-------|-------------|
| ACTIVE | Profile is active; charges can be posted, statements generated |
| SUSPENDED | Profile is suspended; new charges blocked, existing balance remains |
| CLOSED | Profile is closed; no activity allowed, balance must be zero |

### StatementDelivery Enum

| Value | Description |
|-------|-------------|
| EMAIL | Deliver statement via email with PDF attachment |
| PRINT | Add statement to print batch for physical mailing |
| PORTAL | Publish statement to member portal |
| SMS | Send SMS notification with link to statement |
| EMAIL_AND_PRINT | Both email and print delivery |
| ALL | All delivery channels |

### ProfileSnapshot (JSON stored on Statement)

| Field | Type | Description |
|-------|------|-------------|
| name | string | Account holder name at time of statement |
| accountNumber | string | AR profile account number |
| profileType | enum | MEMBER or CITY_LEDGER |
| memberNumber | string | Member number (MEMBER profiles only) |
| membershipType | string | Membership type name (MEMBER profiles only) |
| companyName | string | Company name (CITY_LEDGER profiles only) |
| cityLedgerType | enum | CORPORATE, VENDOR, or HOUSE (CITY_LEDGER profiles only) |
| email | string | Contact email |
| phone | string | Contact phone |
| address | object | Billing address (line1, line2, city, state, postalCode, country) |
| paymentTermsDays | int | Payment terms at time of statement |
| creditLimit | decimal | Credit limit at time of statement |

## Business Rules

1. **Polymorphic Type Enforcement** -- A MEMBER profile must have memberId set and cityLedgerId null. A CITY_LEDGER profile must have cityLedgerId set and memberId null.
2. **One Profile Per Entity** -- Each member can have at most one AR profile per club. Each city ledger entry can have at most one AR profile per club. Enforced by unique constraints.
3. **Auto-Creation on Activation** -- When autoCreateProfileOnMemberActivation is enabled, an AR profile is automatically created when a member's status changes to ACTIVE, using club defaults for delivery, terms, and credit limit.
4. **Account Number Generation** -- Account numbers are auto-generated using the configured format (default: AR-NNNNNN). Numbers are sequential within a club and never reused.
5. **Balance Updates Are Transactional** -- All currentBalance updates occur within database transactions alongside the invoice/payment/credit note that caused the change.
6. **Credit Limit Checking** -- Before posting a new charge, the system checks: (currentBalance + chargeAmount) <= creditLimit. If exceeded and blocking is enabled, the charge is rejected.
7. **Credit Alert at Threshold** -- When utilization reaches creditAlertThreshold percentage, notifications are sent to member and/or staff based on configuration.
8. **Suspension Blocks Charges** -- When an AR profile is SUSPENDED, new charges are blocked. Existing invoices remain payable. Payments can still be recorded.
9. **Closure Requires Zero Balance** -- When requireZeroBalanceForClosure is true, an AR profile cannot be closed unless currentBalance is zero. Outstanding balances must be paid or written off first.
10. **Staff Dual AR** -- Staff members (members with staff membership type) can have charges routed to their personal member AR profile (arAutoChargeToMember) or receive a separate statement (arSeparateStatement).
11. **House Accounts** -- City Ledger entries with type HOUSE function as internal charge accounts. They have AR profiles like any other city ledger entry but are managed by staff, not external companies.
12. **Profile Status Cascading** -- When a member's status changes to RESIGNED or TERMINATED, the system should prompt (not auto-change) the AR profile to be closed if balance is zero, or flagged for collections if balance remains.
13. **Payment Terms Inheritance** -- Payment terms follow the same three-tier hierarchy as billing settings: profile-level overrides type-level overrides club defaults.
14. **Statement Delivery Inheritance** -- If the AR profile has a statementDelivery value, use it. Otherwise fall back to the member's communication preferences. Otherwise use club default.
15. **Balance Recalculation** -- The currentBalance field is maintained incrementally with each transaction. A periodic reconciliation job can verify the balance against the sum of all transactions.
16. **Aging Is Calculated, Not Stored** -- Per-profile aging is calculated on-demand from invoice due dates. Only the statement-level aging snapshot is persisted (on the Statement model).

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Member has both a personal AR profile and is a designee on a corporate account | Two separate AR profiles exist; personal charges go to the member profile, corporate charges go to the corporate city ledger profile |
| AR profile is created for a member who already has one | Rejected by unique constraint (clubId, profileType, memberId); return error to user |
| CityLedger entry is deleted while AR profile has outstanding balance | Block deletion; city ledger entry cannot be removed while linked AR profile has non-zero balance |
| Member status changes to SUSPENDED | AR profile is not automatically suspended; staff must decide whether to suspend AR separately |
| Credit limit is set to zero | Effectively blocks all new charges since any charge would exceed the limit |
| Credit limit is set to null after previously having a value | Removes the limit; member can charge without restriction |
| Payment exceeds current balance (overpayment) | currentBalance goes negative (credit balance); the negative amount represents a prepaid credit |
| Profile with negative balance (credit) receives new charge | Charge reduces the credit; if charge exceeds credit, balance becomes positive (amount owed) |
| Two staff users attempt to update the same profile simultaneously | Optimistic locking via updatedAt; second update receives conflict error |
| Account number format changed after profiles already exist | Existing account numbers are not changed; new format applies only to newly created profiles |
| AR profile CLOSED but subsequent refund is needed | Re-open the profile (change status to ACTIVE), process the refund, then close again |
| Member has arEnabled=false on billing profile | Skip this member during auto-creation of AR profiles; do not generate statements |
| Bulk import of AR profiles for new club setup | Support batch creation via API; validate all members/city ledger entries exist; assign sequential account numbers |
| Profile has charges in multiple currencies | Not supported in current design; each club operates in a single base currency |
| Large club with 5000+ AR profiles | Statement generation uses batch processing (configurable batch_size); AR profile listing uses cursor-based pagination |
| City ledger HOUSE account used by multiple departments | Single AR profile per house account; departments post charges with department codes on line items for tracking |
| Statement delivery bounces (email invalid) | Mark emailStatus as FAILED; profile remains active; staff reviews failed deliveries in delivery status report |
| Member requests portal-only delivery but has no portal account | Fall back to EMAIL delivery; log a warning; prompt staff to set up portal access |
