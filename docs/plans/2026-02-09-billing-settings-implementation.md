# Billing Settings — Configuration & Backend Persistence Implementation

## Parent Design
`docs/plans/2026-02-09-ar-period-close-redesign.md`

## Scope
Settings configuration for all billing features: migrate Billing Defaults from mock to backend, add Credit Limit Management settings, Statement Configuration, Billing Cycle Mode (Club/Member), Close Checklist step configuration, Account Numbering, and AR Profile auto-creation settings.

## Prerequisites
- Billing Cycle settings fully implemented (backend + UI)
- AR Period settings fully implemented (backend + UI)
- `ClubBillingSettings` model in Prisma with billing cycle + AR period fields
- Billing Defaults section exists with mock data only (`billing-defaults-section.tsx` uses `mockBillingDefaults`)
- Settings page (`/settings`) with scrollable sections and navigation sidebar

## Current State

### What Exists — Live Backend
- **Billing Cycle Section** (`billing-cycle-section.tsx`): Fully implemented with `useClubBillingSettings` hook. Saves to `ClubBillingSettings` model. Fields: defaultFrequency, defaultTiming, defaultAlignment, defaultBillingDay, invoiceGenerationLead, invoiceDueDays, gracePeriodDays, lateFeeType/Amount/Percentage, maxLateFee, autoApplyLateFee, prorateNewMembers/Changes/Method.
- **AR Period Section** (`ar-period-section.tsx`): Fully implemented with `useARPeriodSettings` / `useUpdateARPeriodSettings` hooks. Saves to `ClubBillingSettings`. Fields: arCycleType, arCustomCycleStartDay, arCutoffDays, arCloseBehavior, arAutoGenerateNext.

### What Exists — Mock Only
- **Billing Defaults Section** (`billing-defaults-section.tsx`): UI exists for payment terms, invoice prefix/numbering, VAT rate, tax method, WHT, late fees, auto-suspension. Uses `useState(mockBillingDefaults)` with a fake save handler (`setTimeout 1000ms`). No backend persistence.

### What's Missing — No UI or Backend
- **Billing Cycle Mode** (Club Cycle / Member Cycle): `billingCycleMode` not in Prisma schema. No UI to switch modes or configure `clubCycleClosingDay`.
- **Credit Limit Management** (club-level): `defaultCreditLimit`, `creditLimitByMembershipType`, `creditAlertThreshold`, `creditBlockThreshold`, `sendAlertToMember`, `sendAlertToStaff`, `allowManagerOverride`, `overrideLimit`, `autoSuspendOnCreditExceeded` — all specified in AR Profiles spec but not in schema or UI.
- **Statement Configuration**: `defaultPaymentTermsDays`, `defaultStatementDelivery`, `accountNumberPrefix`, `accountNumberFormat`, `autoCreateProfileOnMemberActivation`, `requireZeroBalanceForClosure` — specified in AR Profiles spec but not in schema or UI.
- **Close Checklist Configuration**: Admin ability to configure which checklist steps are required vs optional, and which phases are enabled per club — not in schema or UI.
- **MemberBillingProfile AR Fields**: `arEnabled`, `arStatementDelivery`, `arPaymentTermsDays`, `arCreditLimit`, `arAutoChargeToMember`, `arSeparateStatement`, `arBillingContact` — specified in AR Profiles spec but not in MemberBillingProfile model.

---

## Implementation Tasks

### Task 1: Schema — Add Billing Defaults Fields to ClubBillingSettings

**Files:**
- MODIFY: `database/prisma/schema.prisma`

**Changes:**
Add to `ClubBillingSettings` model (these overlap with Billing Defaults mock data and need real persistence):

```prisma
  // Billing Defaults (currently mock-only in frontend)
  defaultPaymentTermsDays   Int              @default(30)
  defaultGracePeriodDays    Int              @default(7)
  invoicePrefix             String           @default("INV-") @db.VarChar(20)
  invoiceStartNumber        Int              @default(1001)
  invoiceAutoGenerationDay  Int              @default(1)  // Day of month for auto-generation
  defaultVatRate            Decimal          @default(7) @db.Decimal(5, 2)
  taxMethod                 TaxMethod        @default(INCLUDED)
  whtEnabled                Boolean          @default(false)
  whtRates                  Json             @default("[]")  // Array of applicable WHT rates
  autoSuspendEnabled        Boolean          @default(false)
  autoSuspendDays           Int              @default(91)
```

Add new enum:
```prisma
enum TaxMethod {
  ADDON
  INCLUDED
  EXEMPT
}
```

**Note:** Some fields overlap with existing billing cycle fields (gracePeriodDays, lateFee*). The Billing Defaults section manages a different subset — payment terms, invoice numbering, tax config, and auto-suspension. Late fees are already managed by the Billing Cycle section and should NOT be duplicated.

**Verification:** `npx prisma validate`

---

### Task 2: Schema — Add Credit Limit & Statement Settings to ClubBillingSettings

**Files:**
- MODIFY: `database/prisma/schema.prisma`

**Changes:**
Add to `ClubBillingSettings`:

```prisma
  // Credit Limit Management (club-level defaults)
  defaultCreditLimit            Decimal?         @db.Decimal(12, 2)  // null = unlimited
  creditLimitByMembershipType   Json             @default("{}")       // { typeId: limitAmount }
  creditAlertThreshold          Int              @default(80)         // % of limit triggers alert
  creditBlockThreshold          Int              @default(100)        // % of limit blocks charges
  sendCreditAlertToMember       Boolean          @default(true)
  sendCreditAlertToStaff        Boolean          @default(true)
  allowManagerCreditOverride    Boolean          @default(true)
  creditOverrideMaxAmount       Decimal?         @db.Decimal(12, 2)  // Max temporary increase
  autoSuspendOnCreditExceeded   Boolean          @default(false)

  // Statement Configuration
  defaultStatementDelivery      StatementDelivery @default(EMAIL)
  accountNumberPrefix           String            @default("AR") @db.VarChar(10)
  accountNumberFormat           String            @default("{PREFIX}-{SEQ:6}") @db.VarChar(50)
  autoCreateProfileOnActivation Boolean           @default(true)
  requireZeroBalanceForClosure  Boolean           @default(true)
  statementNumberPrefix         String            @default("STMT") @db.VarChar(10)
```

**Verification:** `npx prisma validate`

---

### Task 3: Schema — Add Billing Cycle Mode Fields

**Files:**
- MODIFY: `database/prisma/schema.prisma`

**Changes:**
Add to `ClubBillingSettings`:

```prisma
  // Billing Cycle Mode (Club Cycle vs Member Cycle)
  billingCycleMode              BillingCycleMode    @default(CLUB_CYCLE)
  clubCycleClosingDay           Int                 @default(28)  // 1-28, used in CLUB_CYCLE mode
  financialPeriodType           FinancialPeriodType @default(CALENDAR_MONTH)
```

Add new enums:
```prisma
enum BillingCycleMode {
  CLUB_CYCLE
  MEMBER_CYCLE
}

enum FinancialPeriodType {
  CALENDAR_MONTH
  CUSTOM
}
```

**Verification:** `npx prisma validate`

---

### Task 4: Schema — Add AR Fields to MemberBillingProfile

**Files:**
- MODIFY: `database/prisma/schema.prisma`

**Changes:**
Add to `MemberBillingProfile`:

```prisma
  // AR Profile Settings (per-member overrides)
  arEnabled               Boolean               @default(true)
  arStatementDelivery     StatementDelivery?
  arPaymentTermsDays      Int?
  arCreditLimit           Decimal?              @db.Decimal(12, 2)
  arAutoChargeToMember    Boolean               @default(false)  // Staff: route charges to member
  arSeparateStatement     Boolean               @default(false)  // Staff: separate statement
  arBillingContact        String?               @db.VarChar(255) // Override billing contact
```

**Verification:** `npx prisma validate`

---

### Task 5: Backend — Billing Defaults Service & Resolver

**Files:**
- MODIFY: `apps/api/src/graphql/billing-cycle/billing-cycle.types.ts`
- MODIFY: `apps/api/src/graphql/billing-cycle/billing-cycle.input.ts`
- MODIFY: `apps/api/src/graphql/billing-cycle/billing-cycle.resolver.ts`
- MODIFY: `apps/api/src/modules/billing/billing-cycle-settings.service.ts`

**Changes:**
1. Add new GraphQL fields to the `ClubBillingSettings` type for all fields from Tasks 1-3
2. Add corresponding input fields to `UpdateClubBillingSettingsInput`
3. Add class-validator decorators to all new input fields (`@IsOptional`, `@IsInt`, `@IsEnum`, etc.)
4. Update the service to handle reading/writing the new fields
5. No new queries/mutations needed — existing `getClubBillingSettings` and `updateClubBillingSettings` already work; just need to expose the new fields

**GraphQL type additions:**
```graphql
type ClubBillingSettings {
  # ... existing fields ...

  # Billing Defaults
  defaultPaymentTermsDays: Int!
  defaultGracePeriodDays: Int!
  invoicePrefix: String!
  invoiceStartNumber: Int!
  invoiceAutoGenerationDay: Int!
  defaultVatRate: Float!
  taxMethod: TaxMethod!
  whtEnabled: Boolean!
  whtRates: [Int!]!
  autoSuspendEnabled: Boolean!
  autoSuspendDays: Int!

  # Credit Limit Management
  defaultCreditLimit: Float
  creditLimitByMembershipType: JSON
  creditAlertThreshold: Int!
  creditBlockThreshold: Int!
  sendCreditAlertToMember: Boolean!
  sendCreditAlertToStaff: Boolean!
  allowManagerCreditOverride: Boolean!
  creditOverrideMaxAmount: Float
  autoSuspendOnCreditExceeded: Boolean!

  # Statement Configuration
  defaultStatementDelivery: StatementDelivery!
  accountNumberPrefix: String!
  accountNumberFormat: String!
  autoCreateProfileOnActivation: Boolean!
  requireZeroBalanceForClosure: Boolean!
  statementNumberPrefix: String!

  # Billing Cycle Mode
  billingCycleMode: BillingCycleMode!
  clubCycleClosingDay: Int!
  financialPeriodType: FinancialPeriodType!
}
```

---

### Task 6: Backend — Member AR Fields in MemberBillingProfile Resolver

**Files:**
- MODIFY: `apps/api/src/graphql/billing-cycle/billing-cycle.types.ts` (or member-billing-profile types)
- MODIFY: `apps/api/src/graphql/billing-cycle/billing-cycle.input.ts`

**Changes:**
1. Add AR fields to `MemberBillingProfile` GraphQL type
2. Add corresponding input fields to `UpdateMemberBillingProfileInput`
3. These are used when editing individual member AR settings from the member detail page

**Type additions:**
```graphql
type MemberBillingProfile {
  # ... existing fields ...
  arEnabled: Boolean!
  arStatementDelivery: StatementDelivery
  arPaymentTermsDays: Int
  arCreditLimit: Float
  arAutoChargeToMember: Boolean!
  arSeparateStatement: Boolean!
  arBillingContact: String
}
```

---

### Task 7: Frontend — Migrate Billing Defaults Section to Backend

**Files:**
- MODIFY: `apps/application/src/components/settings/billing-defaults-section.tsx`
- MODIFY: `apps/application/src/hooks/use-billing-settings.ts`

**Changes to hook (`use-billing-settings.ts`):**
1. Add new fields to the `ClubBillingSettings` type returned by `useClubBillingSettings`
2. Add new fields to `UpdateClubBillingSettingsInput`
3. No new hook needed — extend the existing one

**Changes to component (`billing-defaults-section.tsx`):**
1. Remove `import { mockBillingDefaults }` and `import type { BillingDefaults }` from `./types`
2. Import `useClubBillingSettings` from `@/hooks/use-billing-settings`
3. Replace `useState<BillingDefaults>(mockBillingDefaults)` with live settings from hook
4. Replace fake `handleSave` (setTimeout) with `updateSettings()` from hook
5. Add loading state (Loader2 spinner while fetching)
6. Remove late fee section (already managed by Billing Cycle section — avoid duplication)
7. Keep: payment terms, invoice prefix/numbering, auto-generation day, VAT rate, tax method, WHT, auto-suspension

**Layout matches existing Billing Cycle section pattern:**
- Card style: `border rounded-xl p-6 space-y-6 scroll-mt-24 shadow-lg shadow-stone-200/30`
- Save button: amber gradient with loading/success states
- Section headers with icons
- `useEffect` to initialize local state from remote settings

---

### Task 8: Frontend — Credit Limit Management Section

**Files:**
- NEW: `apps/application/src/components/settings/credit-limit-section.tsx`

**Component: `CreditLimitSection`**

Props:
```typescript
interface CreditLimitSectionProps {
  id: string
}
```

**UI Structure:**
```
┌─ Credit Limit Management ──────────────────────────────┐
│ 🔒 Credit Limit Management                              │
│ Configure default credit limits, alerts, and overrides   │
│                                                          │
│ ── Default Credit Limit ────────────────────────────     │
│ Default Limit: [________] THB  ☑ No limit (unlimited)   │
│                                                          │
│ ── Per Membership Type ──────────────────────────────    │
│ Individual: [50,000] THB                                 │
│ Family:     [100,000] THB                                │
│ Corporate:  [500,000] THB                                │
│                                                          │
│ ── Alert & Block Thresholds ─────────────────────────    │
│ Alert at: [80]%    Block at: [100]%                      │
│ ☑ Send alert to member   ☑ Send alert to staff           │
│                                                          │
│ ── Manager Override ─────────────────────────────────    │
│ ☑ Allow manager override                                 │
│ Maximum override increase: [50,000] THB                  │
│                                                          │
│ ── Auto-Suspension ──────────────────────────────────    │
│ ☐ Auto-suspend AR profile when credit exceeded 30+ days  │
│                                                          │
│                                          [Save Settings] │
└──────────────────────────────────────────────────────────┘
```

**Data fetching:**
- Uses `useClubBillingSettings()` for reading credit limit settings
- Uses `updateSettings()` for saving
- Membership type list fetched from existing membership types hook/data

**Per Membership Type configuration:**
- List all active membership types
- Each row has a credit limit input field
- Stored as JSON in `creditLimitByMembershipType` field: `{ "typeId": 50000, "typeId2": 100000 }`
- Empty/null = inherit club default

---

### Task 9: Frontend — Statement Configuration Section

**Files:**
- NEW: `apps/application/src/components/settings/statement-config-section.tsx`

**Component: `StatementConfigSection`**

Props:
```typescript
interface StatementConfigSectionProps {
  id: string
}
```

**UI Structure:**
```
┌─ Statement Configuration ──────────────────────────────┐
│ 📄 Statement Configuration                              │
│ Configure statement numbering, delivery, and AR profiles │
│                                                          │
│ ── Account Numbering ────────────────────────────────    │
│ Prefix: [AR]     Format: [{PREFIX}-{SEQ:6}]              │
│ Preview: AR-000001                                       │
│                                                          │
│ ── Statement Numbering ──────────────────────────────    │
│ Prefix: [STMT]                                           │
│ Preview: STMT-26-01-000001                               │
│                                                          │
│ ── Default Delivery Method ──────────────────────────    │
│ ● Email  ○ Print  ○ Portal  ○ Email+Print  ○ All        │
│                                                          │
│ ── Default Payment Terms ────────────────────────────    │
│ Days from statement to due: [15]                         │
│                                                          │
│ ── AR Profile Settings ──────────────────────────────    │
│ ☑ Auto-create AR profile when member becomes ACTIVE      │
│ ☑ Require zero balance before closing AR profile         │
│                                                          │
│                                          [Save Settings] │
└──────────────────────────────────────────────────────────┘
```

**Data fetching:**
- Uses `useClubBillingSettings()` for all statement config fields
- Account number preview dynamically generated from prefix + format

---

### Task 10: Frontend — Billing Cycle Mode in AR Period Section

**Files:**
- MODIFY: `apps/application/src/components/settings/ar-period-section.tsx`
- MODIFY: `apps/application/src/hooks/use-ar-statements.ts` (or `use-billing-settings.ts`)

**Changes to AR Period Section:**
1. Add Billing Cycle Mode toggle at the top of the section (before existing cycle type):
   ```
   ── Billing Cycle Mode ─────────────────────────────────
   ● Club Cycle    ○ Member Cycle

   Club Cycle: All members share the same AR period dates.
   Member Cycle: Each member's cycle is based on their join date.
   ```
2. When **Club Cycle** is selected:
   - Show `clubCycleClosingDay` selector (1-28): "Closing Day: [24] of each month"
   - Period example: "Period: 25th to 24th (based on closing day 24th)"
   - Existing cycle type options (CALENDAR_MONTH, ROLLING_30, CUSTOM) remain relevant
3. When **Member Cycle** is selected:
   - Show `financialPeriodType` selector: Calendar Month / Custom
   - Explanation: "Each member's AR cycle is computed from their join date. The financial period is for accounting/close checklist purposes only."
   - Hide the standard cycle type options (not applicable in Member Cycle)
4. Add warning banner: "Changing billing cycle mode affects all future periods. Existing periods and statements are not affected."

**Hook changes:**
- Add `billingCycleMode`, `clubCycleClosingDay`, `financialPeriodType` to `ARPeriodSettings` type
- Add to `UpdateARPeriodSettingsInput`

---

### Task 11: Frontend — Register New Sections in Settings Page

**Files:**
- MODIFY: `apps/application/src/app/(dashboard)/settings/page.tsx`
- MODIFY: `apps/application/src/components/settings/settings-nav.tsx`

**Changes:**
1. Import new sections: `CreditLimitSection`, `StatementConfigSection`
2. Add to the settings sidebar navigation:
   - Under "Billing" group: Billing Cycle, Billing Defaults, AR Periods, **Credit Limits** (new), **Statement Config** (new)
3. Render new sections in the scrollable content area with matching `id` props
4. Ensure section anchors match nav items for scroll-to-section behavior

---

### Task 12: Frontend — Close Checklist Configuration

**Files:**
- NEW: `apps/application/src/components/settings/checklist-config-section.tsx`

**Component: `ChecklistConfigSection`**

This is a lower-priority settings section for configuring which close checklist steps are required vs optional per club.

**UI Structure:**
```
┌─ Close Checklist Configuration ────────────────────────┐
│ ✅ Close Checklist Configuration                         │
│ Configure required and optional steps for AR close       │
│                                                          │
│ ▼ Phase 1: Pre-Closing                                   │
│   ☑ Review all member invoices          [Required ▼]     │
│   ☑ Reconcile POS transactions          [Required ▼]     │
│   ☑ Follow up on disputed charges       [Optional ▼]     │
│   ☑ Send final reminders                [Optional ▼]     │
│                                                          │
│ ▼ Phase 2: Period-End Cut-Off                             │
│   ☑ Set transaction cut-off time        [Required ▼]     │
│   ☑ Process final transactions          [Required ▼]     │
│   ☑ Lock transaction posting            [Auto ▼]         │
│                                                          │
│ ... (phases 3-8)                                         │
│                                                          │
│ ☑ Enable close checklist for this club                   │
│ ☑ Require all mandatory steps before period close        │
│                                                          │
│                                          [Save Settings] │
└──────────────────────────────────────────────────────────┘
```

**Storage:**
- Default checklist template stored as JSON in a new `ClubBillingSettings` field:
  ```prisma
  closeChecklistTemplate Json @default("[]")  // Default step definitions per club
  ```
- Each step has: `stepKey`, `phase`, `label`, `description`, `enforcement` (REQUIRED/OPTIONAL), `verification` (AUTO/MANUAL/SYSTEM_ACTION), `sortOrder`
- When a new checklist is created for a period, it copies from this template

**Backend:**
- Add `closeChecklistTemplate` JSON field to `ClubBillingSettings` in schema
- Expose via existing settings query/mutation
- `CloseChecklist.createChecklistForPeriod()` reads template from settings when creating steps

---

### Task 13: Database Migration

**Files:**
- Run after Tasks 1-4 are complete

**Steps:**
1. Run `npx prisma validate` to ensure schema is valid
2. Run `npx prisma migrate dev --name add_billing_settings_fields` to create migration
3. Run `npx prisma generate` to regenerate client
4. Verify existing data is preserved (all new fields have defaults)

**Migration safety:**
- All new fields have `@default()` values → additive, non-destructive
- No existing fields are modified or removed
- JSON fields default to `"{}"` or `"[]"`
- Nullable fields (`Decimal?`, `String?`) default to null

---

## Settings Inventory — Full Cross-Reference

### ClubBillingSettings Fields After Implementation

| Field | Source Spec | Current State | Implementation Task |
|-------|-----------|---------------|---------------------|
| defaultFrequency | Billing Cycles | ✅ Live | — |
| defaultTiming | Billing Cycles | ✅ Live | — |
| defaultAlignment | Billing Cycles | ✅ Live | — |
| defaultBillingDay | Billing Cycles | ✅ Live | — |
| invoiceGenerationLead | Billing Cycles | ✅ Live | — |
| invoiceDueDays | Billing Cycles | ✅ Live | — |
| gracePeriodDays | Billing Cycles | ✅ Live | — |
| lateFeeType/Amount/Percentage | Billing Cycles | ✅ Live | — |
| maxLateFee | Billing Cycles | ✅ Live | — |
| autoApplyLateFee | Billing Cycles | ✅ Live | — |
| prorateNewMembers/Changes | Billing Cycles | ✅ Live | — |
| prorationMethod | Billing Cycles | ✅ Live | — |
| arCycleType | AR Statements | ✅ Live | — |
| arCustomCycleStartDay | AR Statements | ✅ Live | — |
| arCutoffDays | AR Statements | ✅ Live | — |
| arCloseBehavior | AR Statements | ✅ Live | — |
| arAutoGenerateNext | AR Statements | ✅ Live | — |
| defaultPaymentTermsDays | AR Profiles | ❌ Missing | Task 1 |
| defaultGracePeriodDays | AR Profiles | ❌ Missing | Task 1 |
| invoicePrefix | AR Profiles | ❌ Missing | Task 1 |
| invoiceStartNumber | AR Profiles | ❌ Missing | Task 1 |
| invoiceAutoGenerationDay | AR Profiles | ❌ Missing | Task 1 |
| defaultVatRate | AR Profiles | ❌ Missing | Task 1 |
| taxMethod | AR Profiles | ❌ Missing | Task 1 |
| whtEnabled | AR Profiles | ❌ Missing | Task 1 |
| whtRates | AR Profiles | ❌ Missing | Task 1 |
| autoSuspendEnabled | AR Profiles | ❌ Missing | Task 1 |
| autoSuspendDays | AR Profiles | ❌ Missing | Task 1 |
| defaultCreditLimit | AR Profiles | ❌ Missing | Task 2 |
| creditLimitByMembershipType | AR Profiles | ❌ Missing | Task 2 |
| creditAlertThreshold | AR Profiles | ❌ Missing | Task 2 |
| creditBlockThreshold | AR Profiles | ❌ Missing | Task 2 |
| sendCreditAlertToMember | AR Profiles | ❌ Missing | Task 2 |
| sendCreditAlertToStaff | AR Profiles | ❌ Missing | Task 2 |
| allowManagerCreditOverride | AR Profiles | ❌ Missing | Task 2 |
| creditOverrideMaxAmount | AR Profiles | ❌ Missing | Task 2 |
| autoSuspendOnCreditExceeded | AR Profiles | ❌ Missing | Task 2 |
| defaultStatementDelivery | AR Profiles | ❌ Missing | Task 2 |
| accountNumberPrefix | AR Profiles | ❌ Missing | Task 2 |
| accountNumberFormat | AR Profiles | ❌ Missing | Task 2 |
| autoCreateProfileOnActivation | AR Profiles | ❌ Missing | Task 2 |
| requireZeroBalanceForClosure | AR Profiles | ❌ Missing | Task 2 |
| statementNumberPrefix | AR Statements | ❌ Missing | Task 2 |
| billingCycleMode | AR Statements | ❌ Missing | Task 3 |
| clubCycleClosingDay | AR Statements | ❌ Missing | Task 3 |
| financialPeriodType | AR Statements | ❌ Missing | Task 3 |
| closeChecklistTemplate | AR Statements | ❌ Missing | Task 12 |

### MemberBillingProfile AR Fields After Implementation

| Field | Source Spec | Current State | Implementation Task |
|-------|-----------|---------------|---------------------|
| arEnabled | AR Profiles | ❌ Missing | Task 4 |
| arStatementDelivery | AR Profiles | ❌ Missing | Task 4 |
| arPaymentTermsDays | AR Profiles | ❌ Missing | Task 4 |
| arCreditLimit | AR Profiles | ❌ Missing | Task 4 |
| arAutoChargeToMember | AR Profiles | ❌ Missing | Task 4 |
| arSeparateStatement | AR Profiles | ❌ Missing | Task 4 |
| arBillingContact | AR Profiles | ❌ Missing | Task 4 |

---

## Verification Checklist

- [ ] Prisma schema validates with all new fields
- [ ] Migration runs without data loss
- [ ] Billing Defaults section loads from backend (no mock data)
- [ ] Billing Defaults section saves to backend successfully
- [ ] Credit Limit section displays and saves all fields
- [ ] Per-membership-type credit limits render from active types
- [ ] Statement Config section saves account/statement number settings
- [ ] Account number preview updates dynamically
- [ ] Billing Cycle Mode toggle shows in AR Period section
- [ ] Club Cycle shows closing day selector
- [ ] Member Cycle shows financial period type selector
- [ ] Warning banner shows when changing cycle mode
- [ ] New sections appear in settings navigation sidebar
- [ ] Scroll-to-section works for new sections
- [ ] Close checklist configuration saves step enforcement settings
- [ ] All settings follow existing section patterns (amber gradient save button, loading states, success indicators)
