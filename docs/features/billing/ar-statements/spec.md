# Billing / AR Statements / Statement Generation and Delivery

## Overview

The AR Statement system manages periodic statement generation for all AR profile types (Members, City Ledger, Staff). Statements are generated through batch runs within configurable billing periods, with a preview/audit workflow before finalization. The system supports multi-channel delivery (email, print, portal, SMS) and enforces hard period locks with controlled re-open requiring approval and audit trail.

Statement periods are configured once in Club Settings and auto-managed thereafter. Only one period can be OPEN at any time. When a period closes, the next period is auto-generated based on the configured cycle type.

## Status

- **Backend schema**: Designed (StatementPeriod, StatementRun, Statement models specified in Prisma)
- **Backend services**: Not yet implemented (ARProfileService, StatementPeriodService, StatementRunService, StatementService, StatementDeliveryService planned)
- **Frontend pages**: Partially implemented (`/billing/statements/page.tsx` exists with period management UI; `CreatePeriodModal`, `EditPeriodModal`, `PeriodInitWizard` components exist)
- **Frontend components**: Partially implemented (`member-statement.tsx`, `statement-modal.tsx`, `aging-dashboard-tab.tsx`, `aging-summary-card.tsx` exist)
- **GraphQL API**: Not yet implemented (queries and mutations specified in design)
- **AR Period Settings**: Designed (settings to be added to `club_billing_settings` table)
- **Member Portal**: Member portal statement viewing and payment designed (see `docs/plans/2026-02-06-member-portal-pwa-design.md`).

## Capabilities

1. **Period Configuration** -- Define billing cycle type (Calendar Month, Rolling 30, Custom), cutoff days, close behavior, and auto-generation of next period via Club Settings.
2. **Period Lifecycle** -- Open, close, and re-open statement periods with audit trail. Only one OPEN period at a time.
3. **Preview Runs** -- Generate preview statements for audit/review without assigning statement numbers. Multiple preview runs can be created within a single period.
4. **Final Runs** -- Generate final statements that assign sequential statement numbers (STMT-YY-PP-NNNNNN format), lock the period, generate PDFs, and update AR profile balances.
5. **Statement Generation** -- Calculate opening balance, total debits, total credits, closing balance, and aging breakdown (current, 1-30, 31-60, 61-90, 90+) per AR profile.
6. **Profile Snapshot** -- Capture member/city ledger billing info at generation time (name, account number, address, payment terms) for historical accuracy.
7. **Multi-Channel Delivery** -- Deliver statements via email (PDF attachment), print (batch), member portal (publish), and SMS (notification with link).
8. **Aging Dashboard** -- Display five aging bucket cards at the top of the Statements page showing total amounts and account counts per bucket with trend indicators.
9. **Period Re-Open** -- Controlled re-open of closed periods requiring approval, reason, and audit trail. Status changes to REOPENED.
10. **Aging Import Wizard** -- First-time setup flow for clubs migrating with existing outstanding balances via CSV upload.

## Dependencies

### Interface Dependencies

| System | Dependency | Direction | Description |
|--------|-----------|-----------|-------------|
| Members | Member data | Reads | Statement generation reads member name, address, email, membership type for profile snapshot |
| Members | Member billing profile | Reads | Reads payment terms, delivery preferences, credit limit from MemberBillingProfile |
| AR Profiles | AR Profile data | Reads | Statements are generated per ARProfile; reads account number, current balance, status |
| Invoices | Transaction data | Reads | Pulls all invoice line items within the period date range for statement transaction detail |
| Payments | Payment data | Reads | Pulls all payments within the period date range for statement transaction detail |
| Credit Notes | Adjustment data | Reads | Pulls credit notes and adjustments within the period for statement transaction detail |
| City Ledger | City ledger data | Reads | For CITY_LEDGER profile types, reads company name, contact info for profile snapshot |
| Billing Cycles | Billing settings | Reads | Reads ClubBillingSettings for default period configuration, invoice due days |
| POS | POS transactions | Reads | POS charges posted to member accounts appear as line items on statements |
| Golf / Bookings | Booking charges | Reads | Tee time fees, guest fees, cart fees posted to member accounts appear on statements |
| Email Service | Delivery | Writes | Sends statement emails with PDF attachments via configured email provider |
| PDF Engine | Document generation | Writes | Generates statement PDFs using configured template engine (Puppeteer/React PDF) |
| Supabase Storage | File storage | Writes | Stores generated PDF files; pdfUrl on Statement model points to storage |

### Settings Dependencies

| Setting | Location | Required |
|---------|----------|----------|
| AR Period Settings (cycleType, cutoffDays, closeBehavior, autoGenerateNext) | Club Settings > Billing | Yes -- must be configured before first period creation |
| Statement delivery defaults | Club Settings > Billing | Yes -- default delivery method per club |
| PDF branding (logo, colors, templates) | Club Settings > Documents | Yes -- used for PDF generation |
| Email templates | Club Settings > Communications | Yes -- statement email template |

### Data Dependencies

| Data | Source | Required |
|------|--------|----------|
| At least one ACTIVE AR Profile | ar_profiles table | Yes -- no statements generated without active profiles |
| Transactions within period | invoices, payments, credit_notes tables | No -- zero-activity profiles can be skipped or included based on config |
| Club billing settings record | club_billing_settings table | Yes -- must exist for period auto-generation |

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| ar_cycle_type | enum | CALENDAR_MONTH | Club Admin | Period cycle type: CALENDAR_MONTH, ROLLING_30, CUSTOM |
| ar_custom_cycle_start_day | int | 1 | Club Admin | Start day for CUSTOM cycle (1-28) |
| ar_cutoff_days | int | 5 | Club Admin | Days after period end before cutoff date |
| ar_close_behavior | enum | MANUAL | Club Admin | How periods close: MANUAL, AUTO_AFTER_FINAL_RUN, AUTO_ON_CUTOFF |
| ar_auto_generate_next | boolean | true | Club Admin | Auto-create next period when current period closes |
| statement_delivery_default | enum | EMAIL | Club Admin | Default delivery method for new AR profiles |
| skip_zero_activity_profiles | boolean | true | Club Admin | Skip profiles with zero balance and no transactions during run |
| statement_number_prefix | string | STMT | Club Admin | Prefix for statement numbers |
| statement_due_days | int | 15 | Club Admin | Days after statement date for payment due date |
| pdf_paper_size | enum | A4 | Club Admin | Paper size for generated statement PDFs |
| include_aging_on_statement | boolean | true | Club Admin | Show aging breakdown on individual statements |
| include_payment_link | boolean | true | Club Admin | Include online payment link on statements |
| payment_link_expires_days | int | 30 | Club Admin | Days before payment link expires |
| email_send_time | string | 08:00 | Club Admin | Time of day to send statement emails |
| batch_size | int | 100 | System | Statements processed per batch during run |

## Data Model

### StatementPeriod

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| clubId | UUID | FK to Club |
| periodYear | int | Year (e.g. 2026) |
| periodNumber | int | Period within year (1-12 monthly, 1-52 weekly) |
| periodLabel | string(50) | Display label (e.g. "January 2026") |
| periodStart | date | Period start date |
| periodEnd | date | Period end date |
| cutoffDate | date | Transaction cutoff date (periodEnd + cutoffDays) |
| status | enum | OPEN, CLOSED, REOPENED |
| closedAt | datetime | When period was closed |
| closedBy | UUID | FK to User who closed |
| reopenedAt | datetime | When period was re-opened |
| reopenedBy | UUID | FK to User who re-opened |
| reopenReason | string | Reason for re-opening |
| reopenApprovedBy | UUID | FK to User who approved re-open |
| totalProfiles | int | Count of profiles at close |
| totalStatements | int | Count of generated statements at close |
| totalOpeningBalance | decimal(14,2) | Sum of opening balances at close |
| totalDebits | decimal(14,2) | Sum of debits at close |
| totalCredits | decimal(14,2) | Sum of credits at close |
| totalClosingBalance | decimal(14,2) | Sum of closing balances at close |
| agingCurrent | decimal(12,2) | Aging snapshot: current bucket |
| aging1to30 | decimal(12,2) | Aging snapshot: 1-30 days |
| aging31to60 | decimal(12,2) | Aging snapshot: 31-60 days |
| aging61to90 | decimal(12,2) | Aging snapshot: 61-90 days |
| aging90Plus | decimal(12,2) | Aging snapshot: 90+ days |

Unique constraint: (clubId, periodYear, periodNumber).

### StatementRun

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| clubId | UUID | FK to Club |
| statementPeriodId | UUID | FK to StatementPeriod |
| runType | enum | PREVIEW or FINAL |
| runNumber | int | Sequential within period |
| status | enum | PENDING, IN_PROGRESS, COMPLETED, FAILED, CANCELLED |
| startedAt | datetime | When processing started |
| completedAt | datetime | When processing completed |
| totalProfiles | int | Total profiles to process |
| processedCount | int | Profiles processed so far |
| generatedCount | int | Statements with activity generated |
| skippedCount | int | Zero balance profiles skipped |
| errorCount | int | Profiles that errored |
| totalOpeningBalance | decimal(14,2) | Sum of opening balances |
| totalDebits | decimal(14,2) | Sum of debits |
| totalCredits | decimal(14,2) | Sum of credits |
| totalClosingBalance | decimal(14,2) | Sum of closing balances |
| errorLog | JSON | Structured error details |
| createdBy | UUID | FK to User who initiated run |

### Statement

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| clubId | UUID | FK to Club |
| statementRunId | UUID | FK to StatementRun |
| arProfileId | UUID | FK to ARProfile |
| statementNumber | string(20) | Null until FINAL run; format STMT-YY-PP-NNNNNN |
| periodStart | date | Statement period start |
| periodEnd | date | Statement period end |
| dueDate | date | Payment due date |
| openingBalance | decimal(12,2) | Balance brought forward |
| totalDebits | decimal(12,2) | Total charges in period |
| totalCredits | decimal(12,2) | Total payments/credits in period |
| closingBalance | decimal(12,2) | Ending balance |
| agingCurrent | decimal(12,2) | Current bucket amount |
| aging1to30 | decimal(12,2) | 1-30 days overdue |
| aging31to60 | decimal(12,2) | 31-60 days overdue |
| aging61to90 | decimal(12,2) | 61-90 days overdue |
| aging90Plus | decimal(12,2) | 90+ days overdue |
| profileSnapshot | JSON | Billing info at generation time (name, account, address, terms) |
| transactionCount | int | Number of transactions |
| transactions | JSON | Array of transaction details |
| pdfUrl | string(500) | URL to generated PDF in storage |
| pdfGeneratedAt | datetime | When PDF was generated |
| deliveryMethod | enum | EMAIL, PRINT, PORTAL, SMS, EMAIL_AND_PRINT, ALL |
| emailStatus | enum | PENDING, SENT, DELIVERED, FAILED, NOT_APPLICABLE |
| emailSentAt | datetime | When email was sent |
| emailDeliveredAt | datetime | When email was delivered |
| emailError | string | Error message if email failed |
| printStatus | enum | PENDING, SENT, DELIVERED, FAILED, NOT_APPLICABLE |
| printedAt | datetime | When statement was printed |
| printBatchId | UUID | FK to print batch |
| portalStatus | enum | PENDING, SENT, DELIVERED, FAILED, NOT_APPLICABLE |
| portalPublishedAt | datetime | When published to member portal |
| portalViewedAt | datetime | When member viewed in portal |
| smsStatus | enum | PENDING, SENT, DELIVERED, FAILED, NOT_APPLICABLE |
| smsSentAt | datetime | When SMS was sent |
| smsDeliveredAt | datetime | When SMS was delivered |
| smsError | string | Error message if SMS failed |

Unique constraint: (clubId, statementNumber).

## Business Rules

1. **Single Open Period** -- Only one StatementPeriod can have status OPEN per club at any time. System enforces this on creation and status change.
2. **Statement Numbers at Close Only** -- Statement numbers (STMT-YY-PP-NNNNNN) are assigned only during FINAL runs, never during PREVIEW runs.
3. **Preview Runs Are Disposable** -- Preview run statements carry no statement numbers and are replaced by subsequent preview or final runs.
4. **Final Run Locks Period** -- When a FINAL run completes, the period status changes to CLOSED and aging snapshots are stored on both the period and individual statements.
5. **Re-Open Requires Approval** -- Reopening a closed period requires a different user to approve, with a mandatory reason. Status changes to REOPENED.
6. **Cutoff Date Enforcement** -- Transactions posted after the cutoff date are excluded from the current period and roll into the next period.
7. **Profile Snapshot Immutability** -- The profileSnapshot JSON captures billing info at generation time. Even if the member's address or name changes later, the statement retains the original data.
8. **Delivery Method Inheritance** -- Statement delivery method defaults from the ARProfile's statementDelivery preference. Can be overridden per statement or per run.
9. **Zero Activity Handling** -- Profiles with zero opening balance and no transactions within the period can be skipped (configurable via skip_zero_activity_profiles setting).
10. **Aging Calculation** -- Aging buckets are calculated based on invoice due dates, not invoice dates. Payments reduce the oldest outstanding amounts first.
11. **Auto-Generate Next Period** -- When autoGenerateNext is true, closing a period automatically creates the next period with dates calculated from the cycle type.
12. **Period Date Validation** -- Period start must be the day after the previous period's end. No gaps or overlaps between consecutive periods.
13. **Run Progress Tracking** -- StatementRun tracks progress (processedCount / totalProfiles) for UI progress indicators during batch generation.
14. **PDF Generation Timing** -- PDFs are generated only for FINAL run statements, not for PREVIEW runs.
15. **Concurrent Run Prevention** -- Only one run (PENDING or IN_PROGRESS) can exist per period at a time.

## Member Portal Integration

**Plan**: `docs/plans/2026-02-06-member-portal-pwa-design.md`

- Members can view current balance on the dashboard (controlled by `billing.showBalance` flag)
- Statements section shows recent transactions with category icons and amounts
- Monthly statement list with PDF download capability (controlled by `billing.pdfDownload` flag)
- Statement detail view shows all line items for a billing period
- "Pay Now" flow enabled by `billing.onlinePayments` flag — requires payment gateway (Stripe/Omise)
- Payment flow: select payment method → enter amount → review → confirm → receipt
- Push notification on payment receipt and statement due date reminders
- Balance and transactions cached via stale-while-revalidate for fast loading

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Club has no AR profiles when run is initiated | Run completes immediately with zero statements; status set to COMPLETED with generatedCount=0 |
| AR profile is SUSPENDED during statement generation | Include in statement generation but flag on statement; do not send delivery |
| AR profile is CLOSED during statement generation | Skip closed profiles entirely; increment skippedCount |
| Member changes address between preview and final run | Final run captures fresh profile snapshot; preview data is discarded |
| Period re-opened after statements already delivered | Statements from the closed FINAL run remain; new FINAL run generates replacement statements with new statement numbers |
| Transaction posted exactly on cutoff date | Include in current period (cutoff is inclusive) |
| Transaction posted one day after cutoff date | Exclude from current period; rolls to next period |
| Email delivery fails for a statement | Set emailStatus to FAILED with error message; do not retry automatically; staff can manually re-send |
| PDF generation fails for one profile in batch | Log error on StatementRun.errorLog; increment errorCount; continue processing remaining profiles |
| Two users attempt to close the same period simultaneously | Use database-level optimistic locking; second request receives conflict error |
| Club changes cycle type while a period is OPEN | Existing open period is unaffected; new settings apply starting from the next auto-generated period |
| First-time setup with no historical data | PeriodInitWizard offers "Start Fresh" to create current period only |
| First-time setup with existing aging data | PeriodInitWizard offers "Import Historical Aging" via CSV upload; creates historical closed periods for aging buckets |
| Statement run cancelled mid-progress | Set status to CANCELLED; partially generated statements from this run are discarded; no statement numbers assigned |
| Member has credit balance (negative closing balance) | Display as negative on statement; aging buckets show zero for this member |
| Period with no final run is attempted to be closed | Block close; at least one FINAL run must complete before period can be closed |
