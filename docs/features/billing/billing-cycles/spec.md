# Billing / Billing Cycles / Cycle Configuration and Recurring Charges

## Overview

The Billing Cycles system manages configurable billing frequencies, recurring charge generation, proration calculations, late fee management, and due date computation for ClubVantage clubs. Configuration follows a three-tier hierarchy: Club defaults establish baseline settings, Membership Type overrides allow category-specific adjustments, and individual Member Billing Profiles enable per-member exceptions.

The system supports Monthly, Quarterly, Semi-Annual, and Annual billing frequencies with either advance (bill before service period) or arrears (bill after service period) timing. Date alignment can be calendar-based (fixed day of month) or anniversary-based (relative to member join date). Proration handles mid-cycle enrollments and membership changes.

## Status

- **Backend schema**: Implemented (ClubBillingSettings and MemberBillingProfile models in Prisma; BillingFrequency, BillingTiming, CycleAlignment, ProrationMethod, LateFeeType enums)
- **Backend DTOs**: Implemented (`club-billing-settings.dto.ts`, `member-billing-profile.dto.ts` with validation)
- **Backend utilities**: Implemented (`billing-cycle.util.ts` for period calculations, `proration.util.ts` for mid-cycle calculations, `late-fee.util.ts` for fee calculations)
- **Backend service**: Implemented (`billing-cycle-settings.service.ts` with CRUD operations)
- **GraphQL layer**: Implemented (`billing-cycle.types.ts`, `billing-cycle.input.ts`, `billing-cycle.resolver.ts`)
- **Frontend hook**: Implemented (`use-billing-settings.ts`)
- **Frontend components**: Planned (`billing-cycle-section.tsx` for settings, `member-billing-profile-modal.tsx` for overrides, `billing-preview-card.tsx` for inline preview)
- **Settings page integration**: Not yet integrated into `/settings` page
- **AR Cycle Mode**: Redesigned — two modes: Club Cycle (shared AR period with configurable closing day) and Member Cycle (per-member cycle from join date, close checklist on financial period). See `docs/plans/2026-02-09-ar-period-close-redesign.md`.
- **Billing Defaults backend**: Billing Defaults section currently uses mock data. Backend persistence and settings migration planned. See `docs/plans/2026-02-09-billing-settings-implementation.md`.
- **Billing Cycle Mode settings**: Club Cycle / Member Cycle toggle and closing day configuration planned for AR Period settings section. See `docs/plans/2026-02-09-billing-settings-implementation.md` Task 10.

## Capabilities

1. **Club-Level Defaults** -- Configure default billing frequency, timing, alignment, billing day, invoice generation lead days, due days, grace period, late fee settings, and proration method at the club level.
2. **Membership Type Overrides** -- Override club defaults per membership type (e.g., Corporate members billed quarterly, Junior members billed monthly with no late fees).
3. **Member-Level Overrides** -- Override any billing setting for individual members including frequency, timing, billing day, grace period, late fee exemption, and proration method.
4. **Billing Period Calculation** -- Compute next billing period start/end dates based on frequency, alignment, and billing day. Supports calendar alignment (fixed day) and anniversary alignment (relative to join date).
5. **Proration** -- Calculate prorated amounts for mid-cycle enrollments and membership type changes using daily or monthly proration methods. Configurable to be disabled entirely.
6. **Late Fee Calculation** -- Apply late fees after grace period expiration using percentage-based, fixed, or tiered calculation methods. Supports maximum fee caps.
7. **Invoice Generation Lead** -- Generate invoices a configurable number of days before the billing date to give members advance notice.
8. **Billing Hold** -- Place individual member accounts on billing hold with reason and optional expiration date, pausing all recurring charge generation.
9. **Due Date Computation** -- Calculate invoice due dates based on configurable days-from-billing-date, with grace period before late fee application.
10. **Billing Preview** -- Preview next billing period, proration amounts, and late fee calculations before they take effect.

## Dependencies

### Interface Dependencies

| System | Dependency | Direction | Description |
|--------|-----------|-----------|-------------|
| Members | Member data | Reads | Reads member join date (for anniversary alignment), membership type, status |
| Members | Member billing profile | Reads/Writes | Reads and writes MemberBillingProfile for per-member overrides |
| Membership Types | Type configuration | Reads | Reads membership type billing overrides (frequency, timing, fees) |
| Invoices | Invoice generation | Writes | Creates invoices when billing cycle triggers; writes line items for recurring dues |
| Payments | Payment status | Reads | Checks payment status to determine if late fees should be applied |
| AR Profiles | Balance data | Reads | Reads current balance for late fee percentage calculations |
| AR Statements | Period alignment | Reads | Statement periods should align with billing cycle periods. In Club Cycle mode, AR period uses the configured closing day. In Member Cycle mode, per-member AR cycles are anchored to join date; close checklist aligns with financial period. |
| Settings | Club settings | Reads/Writes | Reads and writes ClubBillingSettings for club-level defaults |
| Golf | Recurring charges | Reads | Reads recurring golf-related charges (locker fees, bag storage) to include in billing cycle |
| Bookings | Facility charges | Reads | Reads recurring facility booking charges |

### Settings Dependencies

| Setting | Location | Required |
|---------|----------|----------|
| ClubBillingSettings record | club_billing_settings table | Yes -- auto-created with defaults on first access |
| Membership type billing overrides | Membership type configuration | No -- falls back to club defaults |
| Charge types for recurring items | charge_types table | Yes -- must have charge types for DUES, LATE_FEES categories |

### Data Dependencies

| Data | Source | Required |
|------|--------|----------|
| Active members with membership type | members table | Yes -- billing cycles only apply to ACTIVE members |
| Charge type for membership dues | charge_types table | Yes -- recurring dues charge type must exist |
| Member join date | members table | Required only for ANNIVERSARY alignment |

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| defaultFrequency | enum | MONTHLY | Club Admin | Default billing frequency: MONTHLY, QUARTERLY, SEMI_ANNUAL, ANNUAL |
| defaultTiming | enum | ADVANCE | Club Admin | When to bill relative to service period: ADVANCE or ARREARS |
| defaultAlignment | enum | CALENDAR | Club Admin | Date alignment method: CALENDAR (fixed day) or ANNIVERSARY (join date) |
| defaultBillingDay | int (1-28) | 1 | Club Admin | Day of month for billing when using CALENDAR alignment |
| invoiceGenerationLead | int (0-30) | 5 | Club Admin | Days before billing date to generate invoices |
| invoiceDueDays | int (1-60) | 15 | Club Admin | Days after billing date that payment is due |
| gracePeriodDays | int (0-60) | 15 | Club Admin | Days after due date before late fees apply |
| lateFeeType | enum | PERCENTAGE | Club Admin | Late fee calculation method: PERCENTAGE, FIXED, TIERED |
| lateFeeAmount | decimal(12,2) | 0.00 | Club Admin | Fixed late fee amount (used when type is FIXED) |
| lateFeePercentage | decimal(5,2) | 1.50 | Club Admin | Percentage of outstanding balance (used when type is PERCENTAGE or TIERED) |
| maxLateFee | decimal(12,2) | null | Club Admin | Maximum late fee cap; null means no cap |
| autoApplyLateFee | boolean | false | Club Admin | Automatically apply late fees without manual review |
| prorateNewMembers | boolean | true | Club Admin | Prorate first billing cycle for new members joining mid-cycle |
| prorateChanges | boolean | true | Club Admin | Prorate when member changes membership type mid-cycle |
| prorationMethod | enum | DAILY | Club Admin | Proration calculation method: DAILY, MONTHLY, NONE |
| billingFrequency (member) | enum | null | Club Admin | Member-level frequency override; null inherits from type/club |
| billingTiming (member) | enum | null | Club Admin | Member-level timing override |
| billingAlignment (member) | enum | null | Club Admin | Member-level alignment override |
| customBillingDay (member) | int | null | Club Admin | Member-level billing day override |
| billingHold (member) | boolean | false | Club Admin | Whether member's billing is on hold |
| billingHoldReason (member) | string | null | Club Admin | Reason for billing hold |
| billingHoldUntil (member) | datetime | null | Club Admin | When billing hold expires (null = indefinite) |
| prorationOverride (member) | enum | null | Club Admin | Member-level proration method override |
| customGracePeriod (member) | int | null | Club Admin | Member-level grace period override in days |
| customLateFeeExempt (member) | boolean | false | Club Admin | Whether member is exempt from late fees |

## Data Model

### ClubBillingSettings

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| clubId | UUID | FK to Club (unique) |
| defaultFrequency | enum | MONTHLY, QUARTERLY, SEMI_ANNUAL, ANNUAL |
| defaultTiming | enum | ADVANCE, ARREARS |
| defaultAlignment | enum | CALENDAR, ANNIVERSARY |
| defaultBillingDay | int | Day of month (1-28) |
| invoiceGenerationLead | int | Days before billing to generate invoice |
| invoiceDueDays | int | Days after billing for due date |
| gracePeriodDays | int | Days after due date before late fees |
| lateFeeType | enum | PERCENTAGE, FIXED, TIERED |
| lateFeeAmount | decimal(12,2) | Fixed late fee amount |
| lateFeePercentage | decimal(5,2) | Percentage rate for late fees |
| maxLateFee | decimal(12,2) | Maximum late fee cap (nullable) |
| autoApplyLateFee | boolean | Auto-apply late fees |
| prorateNewMembers | boolean | Prorate first cycle for new members |
| prorateChanges | boolean | Prorate on membership type change |
| prorationMethod | enum | DAILY, MONTHLY, NONE |
| createdAt | datetime | Record creation timestamp |
| updatedAt | datetime | Last update timestamp |

One record per club. Auto-created with defaults on first access.

### MemberBillingProfile

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| memberId | UUID | FK to Member (unique) |
| billingFrequency | enum | Override frequency (nullable) |
| billingTiming | enum | Override timing (nullable) |
| billingAlignment | enum | Override alignment (nullable) |
| customBillingDay | int | Override billing day (nullable) |
| nextBillingDate | datetime | Computed next billing date |
| lastBillingDate | datetime | Last successful billing date |
| currentPeriodStart | datetime | Current billing period start |
| currentPeriodEnd | datetime | Current billing period end |
| billingHold | boolean | Whether billing is on hold |
| billingHoldReason | string | Reason for hold |
| billingHoldUntil | datetime | Hold expiration (nullable) |
| prorationOverride | enum | Override proration method (nullable) |
| customGracePeriod | int | Override grace period days (nullable) |
| customLateFeeExempt | boolean | Exempt from late fees |
| notes | string | Free-text notes |
| createdAt | datetime | Record creation timestamp |
| updatedAt | datetime | Last update timestamp |

One record per member. Created on-demand when overrides are needed. Null fields inherit from membership type or club defaults.

### Effective Settings Resolution

The system resolves settings using this priority chain:

1. **MemberBillingProfile** (highest) -- if the field is non-null, use it
2. **Membership Type configuration** -- if the type has billing overrides, use them
3. **ClubBillingSettings** (lowest) -- club-wide defaults

## Business Rules

1. **Three-Tier Hierarchy** -- Member profile overrides membership type overrides, which override club defaults. Null values fall through to the next level.
2. **Billing Day Range** -- Billing day is restricted to 1-28 to avoid end-of-month ambiguity across months with different lengths.
3. **Frequency Period Lengths** -- Monthly = 1 month, Quarterly = 3 months, Semi-Annual = 6 months, Annual = 12 months.
4. **Advance vs Arrears** -- Advance timing generates the invoice at period start for the upcoming period. Arrears timing generates the invoice at period end for the completed period.
5. **Calendar vs Anniversary** -- Calendar alignment uses a fixed day of each month/quarter. Anniversary alignment calculates periods relative to the member's join date.
6. **Proration Daily Method** -- Prorated amount = (full amount) * (remaining days / total days in period). Rounded to 2 decimal places.
7. **Proration Monthly Method** -- Prorated amount = (full amount) * (ceil(remaining months) / total months in period). Rounded to 2 decimal places.
8. **Late Fee Grace Period** -- Late fees are not assessed until gracePeriodDays after the invoice due date has passed.
9. **Late Fee Tiered Escalation** -- Tiered late fees multiply the base percentage by a factor: 1x for 1-30 days overdue, 1.5x for 31-60, 2x for 61-90, 2.5x for 91+ days.
10. **Late Fee Cap** -- When maxLateFee is set, the calculated late fee is capped at that amount regardless of calculation method.
11. **Billing Hold Prevents Generation** -- Members with billingHold=true are skipped during automatic invoice generation. No recurring charges are created.
12. **Billing Hold Expiration** -- When billingHoldUntil is set and the date passes, the system automatically sets billingHold to false and resumes billing.
13. **No Retroactive Billing** -- When a billing hold expires, the system does not retroactively bill for the held period. Billing resumes from the current period forward.
14. **Invoice Generation Lead Time** -- Invoices are generated invoiceGenerationLead days before the billing date to allow time for member review.
15. **Active Members Only** -- Recurring billing only generates invoices for members with ACTIVE status. Suspended, resigned, and terminated members are skipped.
16. **Proration on Type Change** -- When a member changes membership type mid-cycle, the system credits the prorated unused portion of the old type and charges the prorated amount of the new type.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Member joins on the billing day itself | No proration needed; first full cycle begins immediately |
| Member joins one day before billing day | Prorate for one day of the current period; next full cycle begins on billing day |
| Billing day is 28 and month has 28 days (February non-leap) | Bill on the 28th as configured; no adjustment needed |
| Billing day is 15 but member is on anniversary alignment | Billing day setting is ignored; period calculated from join date |
| Member changes from monthly to quarterly mid-cycle | Complete current monthly cycle, then switch to quarterly starting from next period |
| Late fee calculation results in amount less than $0.01 | Round up to $0.01 minimum if late fee is applicable |
| Member is on billing hold but hold expires on billing day | Resume billing starting with the current period; do not bill for held periods |
| Member has no MemberBillingProfile record | All settings inherit from membership type and club defaults; no override record needed |
| Club changes default frequency while members have active cycles | Existing member cycles complete under old frequency; new frequency applies from next period unless member has override |
| Two members in same household with different billing frequencies | Each member has independent billing profile; household consolidated billing uses primary member's cycle |
| Member on annual billing pays quarterly installment | Installment plans are tracked separately from billing frequency; billing frequency determines charge generation, not payment schedule |
| Late fee would exceed the outstanding invoice balance | Cap late fee at the outstanding balance amount (or maxLateFee, whichever is lower) |
| Proration calculation for a leap year February | Daily proration uses actual days (29 for leap year); monthly proration unaffected |
| Auto-apply late fee is enabled but member is exempt | Member exemption takes priority; no late fee is applied regardless of auto-apply setting |
| Club billing settings record does not exist | Auto-create with all defaults on first access (lazy initialization) |
| Member has customBillingDay=15 but frequency is ANNUAL | Billing day applies to the start month of the annual cycle; bill on the 15th of the anniversary/calendar month |
