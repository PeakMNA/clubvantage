# Shared Types & i18n Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Consolidate all duplicated enums across the ClubVantage monorepo into `packages/types` using const object + type union pattern, create `packages/i18n` with `next-intl` for multi-language display labels, and migrate all apps to use shared types.

**Architecture:** All enums live in `packages/types` as const objects with UPPER_CASE values. Display text lives in `packages/i18n` with `next-intl` integration. Apps import types from `@clubvantage/types` and use `useTranslations()` for display labels. The API returns raw UPPER_CASE values only.

**Tech Stack:** TypeScript const objects, next-intl, pnpm workspaces, Turbo monorepo

---

### Task 16 Research Findings: API Enum Migration Strategy

**Current API Pattern:**
- The NestJS API uses TypeScript `enum` keyword (e.g., `export enum MemberStatus { ... }`)
- Enums are registered with `registerEnumType(EnumName, { name, description })` for GraphQL schema
- Enums are defined in DTOs (`apps/api/src/modules/*/dto/*.dto.ts`) and re-exported in GraphQL types (`apps/api/src/graphql/*/types.ts`)
- ~20+ enum registrations across billing, bookings, golf, members modules

**Proposed Migration Pattern:**
```typescript
// In apps/api — keep TS enum for GraphQL but derive values from packages/types
import { MemberStatus as MemberStatusValues } from '@clubvantage/types';

export enum MemberStatus {
  PROSPECT = MemberStatusValues.PROSPECT,   // 'PROSPECT'
  LEAD = MemberStatusValues.LEAD,           // 'LEAD'
  ACTIVE = MemberStatusValues.ACTIVE,       // 'ACTIVE'
  // ... all values derived from const object
}

registerEnumType(MemberStatus, { name: 'MemberStatus' });
```

**Key Findings:**
1. `registerEnumType` requires a real TypeScript `enum` — it does NOT work with const objects
2. Values in the TS enum must be string-assignable, which const object values are (they're string literals)
3. This pattern ensures API enum values always match packages/types (single source of truth)
4. If packages/types adds a new value, the API enum will get a TS error until updated (enforced consistency)
5. Prisma schema enums must also stay aligned — they're the ultimate source for the database

**Risk Assessment:**
- Low risk: Values are already UPPER_CASE in both places, so no data migration needed
- Medium complexity: ~20 enum definitions to update, but each is a mechanical change
- Requires: GraphQL schema regeneration + API client codegen after changes

**Recommendation:** Defer to a separate plan (Phase 5). Mechanical change but touches the data contract — needs careful testing with existing data.

---

## Current State

### packages/types — Uses plain type unions (NOT const objects yet)
- `entities/member.ts` — `MemberStatus`, `MembershipCategory`, `DependentRelationship`, `ReferralSource`, `LeadStage` as type unions
- `entities/billing.ts` — `InvoiceStatus`, `PaymentMethod`, `PaymentStatus` (missing PARTIALLY_REFUNDED), `TaxType`, `ChargeCategory`
- `entities/booking.ts` — `BookingStatus` (missing IN_PROGRESS), `BookingType`, `FacilityType`
- `entities/golf.ts` — `TeeTimeStatus`, `PlayerType` (missing DEPENDENT, WALK_UP), `CartType`
- `entities/golf-checkin.ts` — `CheckInPlayerType` (lowercase!), check-in-specific `PaymentStatus` (conflicts with billing), `RentalStatus` (lowercase!)
- `entities/common.ts` — `Region`, `UserRole` as type unions
- `platform/index.ts` — `TenantStatus`, `SubscriptionTier`, `SubscriptionStatus`, `BillingCycle`, `PlatformUserRole`

### apps/application — Massive local duplication
- `components/members/types.ts` — local `MemberStatus` with DIFFERENT values (PENDING/INACTIVE/CANCELLED vs packages/types)
- `components/golf/types.ts` — local `BookingStatus` lowercase (booked/checked-in/on-course), `RentalStatus` lowercase, `BackendPlayerType`
- `components/bookings/types.ts` — local `BookingStatus` with 9 values (includes maintenance/outside_hours)
- `components/pos/types.ts` — local POS-specific types

### apps/api — TypeScript enums (not const objects)
- `modules/members/dto/create-member.dto.ts` — TS enum `MemberStatus`
- `modules/billing/dto/invoice-query.dto.ts` — TS enum `InvoiceStatus`
- `modules/golf/golf.types.ts` — TS enum `BookingStatus`
- `registerEnumType()` calls across 24+ files

### packages/i18n — Does NOT exist yet
### next-intl — NOT installed in any app

---

## Phase 1: Convert packages/types to Const Object Pattern

### Task 1: Convert member.ts enums to const objects

**Files:**
- Modify: `clubvantage/packages/types/src/entities/member.ts`

**Step 1: Replace MemberStatus type union with const object**

Replace lines 6-15 in `member.ts`:
```typescript
// Before:
export type MemberStatus =
  | 'PROSPECT'
  | 'LEAD'
  | 'APPLICANT'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'LAPSED'
  | 'RESIGNED'
  | 'TERMINATED'
  | 'REACTIVATED';

// After:
export const MemberStatus = {
  PROSPECT: 'PROSPECT',
  LEAD: 'LEAD',
  APPLICANT: 'APPLICANT',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  LAPSED: 'LAPSED',
  RESIGNED: 'RESIGNED',
  TERMINATED: 'TERMINATED',
  REACTIVATED: 'REACTIVATED',
} as const;
export type MemberStatus = (typeof MemberStatus)[keyof typeof MemberStatus];
```

**Step 2: Convert MembershipCategory**

```typescript
// Before:
export type MembershipCategory = 'REGULAR' | 'PREMIUM' | 'CORPORATE' | 'SENIOR' | 'JUNIOR' | 'FAMILY';

// After:
export const MembershipCategory = {
  REGULAR: 'REGULAR',
  PREMIUM: 'PREMIUM',
  CORPORATE: 'CORPORATE',
  SENIOR: 'SENIOR',
  JUNIOR: 'JUNIOR',
  FAMILY: 'FAMILY',
} as const;
export type MembershipCategory = (typeof MembershipCategory)[keyof typeof MembershipCategory];
```

**Step 3: Convert DependentRelationship**

```typescript
export const DependentRelationship = {
  SPOUSE: 'SPOUSE',
  CHILD: 'CHILD',
  PARENT: 'PARENT',
  SIBLING: 'SIBLING',
  OTHER: 'OTHER',
} as const;
export type DependentRelationship = (typeof DependentRelationship)[keyof typeof DependentRelationship];
```

**Step 4: Convert ReferralSource**

```typescript
export const ReferralSource = {
  WEBSITE: 'WEBSITE',
  MEMBER_REFERRAL: 'MEMBER_REFERRAL',
  WALK_IN: 'WALK_IN',
  GUEST_CONVERSION: 'GUEST_CONVERSION',
  CORPORATE: 'CORPORATE',
  EVENT: 'EVENT',
  ADVERTISEMENT: 'ADVERTISEMENT',
  OTHER: 'OTHER',
} as const;
export type ReferralSource = (typeof ReferralSource)[keyof typeof ReferralSource];
```

**Step 5: Convert LeadStage**

```typescript
export const LeadStage = {
  NEW: 'NEW',
  CONTACTED: 'CONTACTED',
  QUALIFIED: 'QUALIFIED',
  CONVERTED: 'CONVERTED',
  LOST: 'LOST',
} as const;
export type LeadStage = (typeof LeadStage)[keyof typeof LeadStage];
```

**Step 6: Verify TypeScript compiles**

Run: `cd clubvantage && pnpm exec tsc --noEmit --project packages/types/tsconfig.json`
Expected: No errors (const object + type union is backwards-compatible with type union consumers)

**Step 7: Commit**

```bash
git add packages/types/src/entities/member.ts
git commit -m "refactor: convert member.ts enums to const object pattern"
```

---

### Task 2: Convert billing.ts enums to const objects + add missing values

**Files:**
- Modify: `clubvantage/packages/types/src/entities/billing.ts`

**Step 1: Convert InvoiceStatus**

```typescript
export const InvoiceStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  PAID: 'PAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  OVERDUE: 'OVERDUE',
  VOID: 'VOID',
  CANCELLED: 'CANCELLED',
} as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];
```

**Step 2: Convert PaymentMethod**

```typescript
export const PaymentMethod = {
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CREDIT_CARD: 'CREDIT_CARD',
  QR_PROMPTPAY: 'QR_PROMPTPAY',
  QR_PAYNOW: 'QR_PAYNOW',
  QR_DUITNOW: 'QR_DUITNOW',
  CHECK: 'CHECK',
  DIRECT_DEBIT: 'DIRECT_DEBIT',
  CREDIT: 'CREDIT',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
```

**Step 3: Convert PaymentStatus + add PARTIALLY_REFUNDED**

```typescript
// Before: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
// After (adds PARTIALLY_REFUNDED per design doc):
export const PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
```

**Step 4: Convert BillingTaxType (rename from TaxType to avoid conflict with golf-checkin.ts)**

The existing `TaxType` in billing.ts (`'VAT' | 'GST' | 'SST' | 'EXEMPT'`) conflicts with the `TaxType` in golf-checkin.ts (`'add' | 'include' | 'none'`). These are different concepts:
- Billing: government tax jurisdiction type
- Golf check-in: how tax is calculated on a line item

Keep both but rename billing's to `BillingTaxType`:

```typescript
export const BillingTaxType = {
  VAT: 'VAT',
  GST: 'GST',
  SST: 'SST',
  EXEMPT: 'EXEMPT',
} as const;
export type BillingTaxType = (typeof BillingTaxType)[keyof typeof BillingTaxType];
```

Then update the `TaxType` references in billing.ts interfaces to `BillingTaxType`:
- `Invoice.taxType: BillingTaxType`
- `InvoiceLineItem.taxType: BillingTaxType`
- `ChargeType.taxType: BillingTaxType`

**Step 5: Convert ChargeCategory**

```typescript
export const ChargeCategory = {
  MEMBERSHIP_DUES: 'MEMBERSHIP_DUES',
  FACILITY_BOOKING: 'FACILITY_BOOKING',
  GOLF_GREEN_FEE: 'GOLF_GREEN_FEE',
  GOLF_CADDY: 'GOLF_CADDY',
  GOLF_CART: 'GOLF_CART',
  GUEST_FEE: 'GUEST_FEE',
  F_AND_B: 'F_AND_B',
  PRO_SHOP: 'PRO_SHOP',
  SERVICE: 'SERVICE',
  PENALTY: 'PENALTY',
  OTHER: 'OTHER',
} as const;
export type ChargeCategory = (typeof ChargeCategory)[keyof typeof ChargeCategory];
```

**Step 6: Verify TypeScript compiles**

Run: `cd clubvantage && pnpm exec tsc --noEmit --project packages/types/tsconfig.json`
Expected: No errors

**Step 7: Commit**

```bash
git add packages/types/src/entities/billing.ts
git commit -m "refactor: convert billing.ts enums to const object pattern, add PARTIALLY_REFUNDED, rename TaxType to BillingTaxType"
```

---

### Task 3: Convert booking.ts enums to const objects + add missing values

**Files:**
- Modify: `clubvantage/packages/types/src/entities/booking.ts`

**Step 1: Convert BookingStatus + add IN_PROGRESS**

```typescript
// Before: missing IN_PROGRESS
export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CHECKED_IN: 'CHECKED_IN',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];
```

**Step 2: Convert BookingType**

```typescript
export const BookingType = {
  RESOURCE: 'RESOURCE',
  SERVICE: 'SERVICE',
} as const;
export type BookingType = (typeof BookingType)[keyof typeof BookingType];
```

**Step 3: Convert FacilityType**

```typescript
export const FacilityType = {
  TENNIS_COURT: 'TENNIS_COURT',
  SQUASH_COURT: 'SQUASH_COURT',
  BADMINTON_COURT: 'BADMINTON_COURT',
  SWIMMING_POOL: 'SWIMMING_POOL',
  GYM: 'GYM',
  FUNCTION_ROOM: 'FUNCTION_ROOM',
  MEETING_ROOM: 'MEETING_ROOM',
  SPA: 'SPA',
  RESTAURANT: 'RESTAURANT',
  OTHER: 'OTHER',
} as const;
export type FacilityType = (typeof FacilityType)[keyof typeof FacilityType];
```

**Step 4: Verify TypeScript compiles**

Run: `cd clubvantage && pnpm exec tsc --noEmit --project packages/types/tsconfig.json`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/types/src/entities/booking.ts
git commit -m "refactor: convert booking.ts enums to const object pattern, add IN_PROGRESS"
```

---

### Task 4: Convert golf.ts enums to const objects + add missing values

**Files:**
- Modify: `clubvantage/packages/types/src/entities/golf.ts`

**Step 1: Convert TeeTimeStatus**

```typescript
export const TeeTimeStatus = {
  AVAILABLE: 'AVAILABLE',
  BOOKED: 'BOOKED',
  CHECKED_IN: 'CHECKED_IN',
  STARTED: 'STARTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
  BLOCKED: 'BLOCKED',
} as const;
export type TeeTimeStatus = (typeof TeeTimeStatus)[keyof typeof TeeTimeStatus];
```

**Step 2: Convert PlayerType + add DEPENDENT and WALK_UP**

```typescript
// Before: only MEMBER | GUEST
export const PlayerType = {
  MEMBER: 'MEMBER',
  GUEST: 'GUEST',
  DEPENDENT: 'DEPENDENT',
  WALK_UP: 'WALK_UP',
} as const;
export type PlayerType = (typeof PlayerType)[keyof typeof PlayerType];
```

**Step 3: Convert CartType**

```typescript
export const CartType = {
  SINGLE: 'SINGLE',
  SHARED: 'SHARED',
  WALKING: 'WALKING',
} as const;
export type CartType = (typeof CartType)[keyof typeof CartType];
```

**Step 4: Verify TypeScript compiles**

Run: `cd clubvantage && pnpm exec tsc --noEmit --project packages/types/tsconfig.json`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/types/src/entities/golf.ts
git commit -m "refactor: convert golf.ts enums to const object pattern, add DEPENDENT and WALK_UP to PlayerType"
```

---

### Task 5: Convert golf-checkin.ts enums to UPPER_CASE const objects

**Files:**
- Modify: `clubvantage/packages/types/src/entities/golf-checkin.ts`

**Step 1: Convert CheckInTaxType (rename from TaxType to avoid conflicts)**

The golf check-in `TaxType` is a calculation method, different from billing's `BillingTaxType`. Rename to `CheckInTaxType`:

```typescript
export const CheckInTaxType = {
  ADD: 'ADD',
  INCLUDE: 'INCLUDE',
  NONE: 'NONE',
} as const;
export type CheckInTaxType = (typeof CheckInTaxType)[keyof typeof CheckInTaxType];
```

Then update all references in the file from `TaxType` to `CheckInTaxType` (in interfaces: `TaxOverride.taxType`, `TaxConfig.defaultType`, `TaxOverrideFormData.taxType`, `ProShopCategory.defaultTaxType`, `ProShopCategoryFormData.defaultTaxType`, `ProShopProduct.taxType`, `ProShopProduct.effectiveTaxType`, `ProShopProductFormData.taxType`, `BookingLineItem.taxType`).

**Step 2: Convert PaymentMethodType**

```typescript
export const PaymentMethodType = {
  CASH: 'CASH',
  CARD: 'CARD',
  TRANSFER: 'TRANSFER',
  ACCOUNT: 'ACCOUNT',
  CUSTOM: 'CUSTOM',
} as const;
export type PaymentMethodType = (typeof PaymentMethodType)[keyof typeof PaymentMethodType];
```

**Step 3: Convert LineItemType**

```typescript
export const LineItemType = {
  GREEN_FEE: 'GREEN_FEE',
  CART: 'CART',
  CADDY: 'CADDY',
  RENTAL: 'RENTAL',
  PROSHOP: 'PROSHOP',
} as const;
export type LineItemType = (typeof LineItemType)[keyof typeof LineItemType];
```

**Step 4: Convert TicketGenerateOn**

```typescript
export const TicketGenerateOn = {
  CHECK_IN: 'CHECK_IN',
  SETTLEMENT: 'SETTLEMENT',
  MANUAL: 'MANUAL',
} as const;
export type TicketGenerateOn = (typeof TicketGenerateOn)[keyof typeof TicketGenerateOn];
```

**Step 5: Convert PrintOption**

```typescript
export const PrintOption = {
  TICKET: 'TICKET',
  RECEIPT: 'RECEIPT',
  COMBINED: 'COMBINED',
  NONE: 'NONE',
} as const;
export type PrintOption = (typeof PrintOption)[keyof typeof PrintOption];
```

**Step 6: Convert CheckInPlayerType to UPPER_CASE**

```typescript
export const CheckInPlayerType = {
  MEMBER: 'MEMBER',
  GUEST: 'GUEST',
  DEPENDENT: 'DEPENDENT',
  WALKUP: 'WALKUP',
} as const;
export type CheckInPlayerType = (typeof CheckInPlayerType)[keyof typeof CheckInPlayerType];
```

**Step 7: Convert CheckInPaymentStatus (rename from PaymentStatus to avoid conflict with billing)**

```typescript
export const CheckInPaymentStatus = {
  PREPAID: 'PREPAID',
  PARTIAL: 'PARTIAL',
  UNPAID: 'UNPAID',
} as const;
export type CheckInPaymentStatus = (typeof CheckInPaymentStatus)[keyof typeof CheckInPaymentStatus];
```

Then update the interface references:
- `CheckInPlayer.paymentStatus: CheckInPaymentStatus`

**Step 8: Add RentalStatus const object**

Currently not in golf-checkin.ts but referenced in design doc. Add:

```typescript
export const RentalStatus = {
  NONE: 'NONE',
  REQUESTED: 'REQUESTED',
  PAID: 'PAID',
  ASSIGNED: 'ASSIGNED',
  RETURNED: 'RETURNED',
} as const;
export type RentalStatus = (typeof RentalStatus)[keyof typeof RentalStatus];
```

**Step 9: Verify TypeScript compiles**

Run: `cd clubvantage && pnpm exec tsc --noEmit --project packages/types/tsconfig.json`
Expected: No errors

**Step 10: Commit**

```bash
git add packages/types/src/entities/golf-checkin.ts
git commit -m "refactor: convert golf-checkin.ts enums to UPPER_CASE const objects, rename conflicting types"
```

---

### Task 6: Convert common.ts and platform/index.ts enums

**Files:**
- Modify: `clubvantage/packages/types/src/entities/common.ts`
- Modify: `clubvantage/packages/types/src/platform/index.ts`

**Step 1: Convert Region in common.ts**

```typescript
export const Region = {
  TH: 'TH',
  SG: 'SG',
  MY: 'MY',
} as const;
export type Region = (typeof Region)[keyof typeof Region];
```

Then update `REGION_CONFIGS` type: `Record<Region, RegionConfig>` still works.

**Step 2: Convert UserRole in common.ts**

```typescript
export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CLUB_MANAGER: 'CLUB_MANAGER',
  FINANCE_STAFF: 'FINANCE_STAFF',
  FRONT_DESK: 'FRONT_DESK',
  GOLF_OPERATIONS: 'GOLF_OPERATIONS',
  F_AND_B_STAFF: 'F_AND_B_STAFF',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
```

**Step 3: Convert platform enums in platform/index.ts**

```typescript
export const TenantStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type TenantStatus = (typeof TenantStatus)[keyof typeof TenantStatus];

export const SubscriptionTier = {
  STARTER: 'STARTER',
  PROFESSIONAL: 'PROFESSIONAL',
  ENTERPRISE: 'ENTERPRISE',
} as const;
export type SubscriptionTier = (typeof SubscriptionTier)[keyof typeof SubscriptionTier];

export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  PAST_DUE: 'PAST_DUE',
  CANCELLED: 'CANCELLED',
  TRIAL: 'TRIAL',
} as const;
export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const BillingCycle = {
  MONTHLY: 'MONTHLY',
  ANNUAL: 'ANNUAL',
} as const;
export type BillingCycle = (typeof BillingCycle)[keyof typeof BillingCycle];

export const PlatformUserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CSM: 'CSM',
  SUPPORT: 'SUPPORT',
  FINANCE: 'FINANCE',
} as const;
export type PlatformUserRole = (typeof PlatformUserRole)[keyof typeof PlatformUserRole];
```

**Step 4: Verify TypeScript compiles**

Run: `cd clubvantage && pnpm exec tsc --noEmit --project packages/types/tsconfig.json`
Expected: No errors

**Step 5: Commit**

```bash
git add packages/types/src/entities/common.ts packages/types/src/platform/index.ts
git commit -m "refactor: convert common.ts and platform enums to const object pattern"
```

---

## Phase 2: Create packages/i18n

### Task 7: Create packages/i18n package scaffolding

**Files:**
- Create: `clubvantage/packages/i18n/package.json`
- Create: `clubvantage/packages/i18n/tsconfig.json`
- Create: `clubvantage/packages/i18n/src/index.ts`

**Step 1: Create package.json**

```json
{
  "name": "@clubvantage/i18n",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./locales/en": "./src/locales/en.json",
    "./locales/th": "./src/locales/th.json"
  },
  "devDependencies": {
    "typescript": "^5.6.0"
  }
}
```

**Step 2: Create tsconfig.json**

```json
{
  "extends": "@clubvantage/config/typescript/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "resolveJsonModule": true
  },
  "include": ["src/**/*.ts", "src/**/*.json"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create src/index.ts**

```typescript
// Re-export locale data for convenience
export { default as en } from './locales/en.json';
export { default as th } from './locales/th.json';
```

**Step 4: Run pnpm install to register the new package**

Run: `cd clubvantage && pnpm install`

**Step 5: Commit**

```bash
git add packages/i18n/package.json packages/i18n/tsconfig.json packages/i18n/src/index.ts
git commit -m "feat: scaffold packages/i18n package"
```

---

### Task 8: Create English locale file (en.json)

**Files:**
- Create: `clubvantage/packages/i18n/src/locales/en.json`

**Step 1: Create en.json with all enum translations**

```json
{
  "memberStatus": {
    "PROSPECT": "Prospect",
    "LEAD": "Lead",
    "APPLICANT": "Applicant",
    "ACTIVE": "Active",
    "SUSPENDED": "Suspended",
    "LAPSED": "Lapsed",
    "RESIGNED": "Resigned",
    "TERMINATED": "Terminated",
    "REACTIVATED": "Reactivated"
  },
  "membershipCategory": {
    "REGULAR": "Regular",
    "PREMIUM": "Premium",
    "CORPORATE": "Corporate",
    "SENIOR": "Senior",
    "JUNIOR": "Junior",
    "FAMILY": "Family"
  },
  "dependentRelationship": {
    "SPOUSE": "Spouse",
    "CHILD": "Child",
    "PARENT": "Parent",
    "SIBLING": "Sibling",
    "OTHER": "Other"
  },
  "referralSource": {
    "WEBSITE": "Website",
    "MEMBER_REFERRAL": "Member Referral",
    "WALK_IN": "Walk-in",
    "GUEST_CONVERSION": "Guest Conversion",
    "CORPORATE": "Corporate",
    "EVENT": "Event",
    "ADVERTISEMENT": "Advertisement",
    "OTHER": "Other"
  },
  "leadStage": {
    "NEW": "New",
    "CONTACTED": "Contacted",
    "QUALIFIED": "Qualified",
    "CONVERTED": "Converted",
    "LOST": "Lost"
  },
  "bookingStatus": {
    "PENDING": "Pending",
    "CONFIRMED": "Confirmed",
    "CHECKED_IN": "Checked In",
    "IN_PROGRESS": "In Progress",
    "COMPLETED": "Completed",
    "CANCELLED": "Cancelled",
    "NO_SHOW": "No Show"
  },
  "bookingType": {
    "RESOURCE": "Resource",
    "SERVICE": "Service"
  },
  "facilityType": {
    "TENNIS_COURT": "Tennis Court",
    "SQUASH_COURT": "Squash Court",
    "BADMINTON_COURT": "Badminton Court",
    "SWIMMING_POOL": "Swimming Pool",
    "GYM": "Gym",
    "FUNCTION_ROOM": "Function Room",
    "MEETING_ROOM": "Meeting Room",
    "SPA": "Spa",
    "RESTAURANT": "Restaurant",
    "OTHER": "Other"
  },
  "teeTimeStatus": {
    "AVAILABLE": "Available",
    "BOOKED": "Booked",
    "CHECKED_IN": "Checked In",
    "STARTED": "Started",
    "COMPLETED": "Completed",
    "CANCELLED": "Cancelled",
    "NO_SHOW": "No Show",
    "BLOCKED": "Blocked"
  },
  "playerType": {
    "MEMBER": "Member",
    "GUEST": "Guest",
    "DEPENDENT": "Dependent",
    "WALK_UP": "Walk-up"
  },
  "cartType": {
    "SINGLE": "Single",
    "SHARED": "Shared",
    "WALKING": "Walking"
  },
  "invoiceStatus": {
    "DRAFT": "Draft",
    "SENT": "Sent",
    "PAID": "Paid",
    "PARTIALLY_PAID": "Partially Paid",
    "OVERDUE": "Overdue",
    "VOID": "Void",
    "CANCELLED": "Cancelled"
  },
  "paymentMethod": {
    "CASH": "Cash",
    "BANK_TRANSFER": "Bank Transfer",
    "CREDIT_CARD": "Credit Card",
    "QR_PROMPTPAY": "PromptPay QR",
    "QR_PAYNOW": "PayNow QR",
    "QR_DUITNOW": "DuitNow QR",
    "CHECK": "Check",
    "DIRECT_DEBIT": "Direct Debit",
    "CREDIT": "Credit"
  },
  "paymentStatus": {
    "PENDING": "Pending",
    "COMPLETED": "Completed",
    "FAILED": "Failed",
    "REFUNDED": "Refunded",
    "PARTIALLY_REFUNDED": "Partially Refunded"
  },
  "billingTaxType": {
    "VAT": "VAT",
    "GST": "GST",
    "SST": "SST",
    "EXEMPT": "Exempt"
  },
  "chargeCategory": {
    "MEMBERSHIP_DUES": "Membership Dues",
    "FACILITY_BOOKING": "Facility Booking",
    "GOLF_GREEN_FEE": "Green Fee",
    "GOLF_CADDY": "Caddy Fee",
    "GOLF_CART": "Cart Fee",
    "GUEST_FEE": "Guest Fee",
    "F_AND_B": "F&B",
    "PRO_SHOP": "Pro Shop",
    "SERVICE": "Service",
    "PENALTY": "Penalty",
    "OTHER": "Other"
  },
  "rentalStatus": {
    "NONE": "None",
    "REQUESTED": "Requested",
    "PAID": "Paid",
    "ASSIGNED": "Assigned",
    "RETURNED": "Returned"
  },
  "region": {
    "TH": "Thailand",
    "SG": "Singapore",
    "MY": "Malaysia"
  },
  "userRole": {
    "SUPER_ADMIN": "Super Admin",
    "CLUB_MANAGER": "Club Manager",
    "FINANCE_STAFF": "Finance Staff",
    "FRONT_DESK": "Front Desk",
    "GOLF_OPERATIONS": "Golf Operations",
    "F_AND_B_STAFF": "F&B Staff"
  },
  "tenantStatus": {
    "PENDING": "Pending",
    "ACTIVE": "Active",
    "SUSPENDED": "Suspended",
    "ARCHIVED": "Archived"
  },
  "subscriptionTier": {
    "STARTER": "Starter",
    "PROFESSIONAL": "Professional",
    "ENTERPRISE": "Enterprise"
  },
  "subscriptionStatus": {
    "ACTIVE": "Active",
    "PAST_DUE": "Past Due",
    "CANCELLED": "Cancelled",
    "TRIAL": "Trial"
  },
  "billingCycle": {
    "MONTHLY": "Monthly",
    "ANNUAL": "Annual"
  },
  "platformUserRole": {
    "SUPER_ADMIN": "Super Admin",
    "CSM": "Customer Success Manager",
    "SUPPORT": "Support",
    "FINANCE": "Finance"
  }
}
```

**Step 2: Commit**

```bash
git add packages/i18n/src/locales/en.json
git commit -m "feat: add English locale file with all enum translations"
```

---

### Task 9: Create Thai locale file (th.json) stub

**Files:**
- Create: `clubvantage/packages/i18n/src/locales/th.json`

**Step 1: Create th.json with Thai translations**

```json
{
  "memberStatus": {
    "PROSPECT": "ผู้สนใจ",
    "LEAD": "ลูกค้าเป้าหมาย",
    "APPLICANT": "ผู้สมัคร",
    "ACTIVE": "ใช้งาน",
    "SUSPENDED": "ระงับ",
    "LAPSED": "หมดอายุ",
    "RESIGNED": "ลาออก",
    "TERMINATED": "ยกเลิก",
    "REACTIVATED": "เปิดใช้งานอีกครั้ง"
  },
  "membershipCategory": {
    "REGULAR": "ปกติ",
    "PREMIUM": "พรีเมียม",
    "CORPORATE": "องค์กร",
    "SENIOR": "อาวุโส",
    "JUNIOR": "จูเนียร์",
    "FAMILY": "ครอบครัว"
  },
  "dependentRelationship": {
    "SPOUSE": "คู่สมรส",
    "CHILD": "บุตร",
    "PARENT": "บิดา/มารดา",
    "SIBLING": "พี่น้อง",
    "OTHER": "อื่นๆ"
  },
  "referralSource": {
    "WEBSITE": "เว็บไซต์",
    "MEMBER_REFERRAL": "สมาชิกแนะนำ",
    "WALK_IN": "เดินเข้ามา",
    "GUEST_CONVERSION": "แขกเปลี่ยนสถานะ",
    "CORPORATE": "องค์กร",
    "EVENT": "กิจกรรม",
    "ADVERTISEMENT": "โฆษณา",
    "OTHER": "อื่นๆ"
  },
  "leadStage": {
    "NEW": "ใหม่",
    "CONTACTED": "ติดต่อแล้ว",
    "QUALIFIED": "ผ่านเกณฑ์",
    "CONVERTED": "แปลงแล้ว",
    "LOST": "สูญเสีย"
  },
  "bookingStatus": {
    "PENDING": "รอดำเนินการ",
    "CONFIRMED": "ยืนยันแล้ว",
    "CHECKED_IN": "เช็คอินแล้ว",
    "IN_PROGRESS": "กำลังดำเนินการ",
    "COMPLETED": "เสร็จสิ้น",
    "CANCELLED": "ยกเลิก",
    "NO_SHOW": "ไม่มาตามนัด"
  },
  "bookingType": {
    "RESOURCE": "สถานที่",
    "SERVICE": "บริการ"
  },
  "facilityType": {
    "TENNIS_COURT": "สนามเทนนิส",
    "SQUASH_COURT": "สนามสควอช",
    "BADMINTON_COURT": "สนามแบดมินตัน",
    "SWIMMING_POOL": "สระว่ายน้ำ",
    "GYM": "ฟิตเนส",
    "FUNCTION_ROOM": "ห้องจัดเลี้ยง",
    "MEETING_ROOM": "ห้องประชุม",
    "SPA": "สปา",
    "RESTAURANT": "ร้านอาหาร",
    "OTHER": "อื่นๆ"
  },
  "teeTimeStatus": {
    "AVAILABLE": "ว่าง",
    "BOOKED": "จองแล้ว",
    "CHECKED_IN": "เช็คอินแล้ว",
    "STARTED": "เริ่มแล้ว",
    "COMPLETED": "เสร็จสิ้น",
    "CANCELLED": "ยกเลิก",
    "NO_SHOW": "ไม่มาตามนัด",
    "BLOCKED": "บล็อค"
  },
  "playerType": {
    "MEMBER": "สมาชิก",
    "GUEST": "แขก",
    "DEPENDENT": "ผู้ติดตาม",
    "WALK_UP": "วอล์คอัพ"
  },
  "cartType": {
    "SINGLE": "คันเดียว",
    "SHARED": "ร่วมกัน",
    "WALKING": "เดิน"
  },
  "invoiceStatus": {
    "DRAFT": "ร่าง",
    "SENT": "ส่งแล้ว",
    "PAID": "ชำระแล้ว",
    "PARTIALLY_PAID": "ชำระบางส่วน",
    "OVERDUE": "เกินกำหนด",
    "VOID": "เป็นโมฆะ",
    "CANCELLED": "ยกเลิก"
  },
  "paymentMethod": {
    "CASH": "เงินสด",
    "BANK_TRANSFER": "โอนเงิน",
    "CREDIT_CARD": "บัตรเครดิต",
    "QR_PROMPTPAY": "พร้อมเพย์ QR",
    "QR_PAYNOW": "PayNow QR",
    "QR_DUITNOW": "DuitNow QR",
    "CHECK": "เช็ค",
    "DIRECT_DEBIT": "หักบัญชีอัตโนมัติ",
    "CREDIT": "เครดิต"
  },
  "paymentStatus": {
    "PENDING": "รอดำเนินการ",
    "COMPLETED": "สำเร็จ",
    "FAILED": "ล้มเหลว",
    "REFUNDED": "คืนเงินแล้ว",
    "PARTIALLY_REFUNDED": "คืนเงินบางส่วน"
  },
  "billingTaxType": {
    "VAT": "ภาษีมูลค่าเพิ่ม",
    "GST": "GST",
    "SST": "SST",
    "EXEMPT": "ยกเว้น"
  },
  "chargeCategory": {
    "MEMBERSHIP_DUES": "ค่าสมาชิก",
    "FACILITY_BOOKING": "ค่าจองสถานที่",
    "GOLF_GREEN_FEE": "ค่ากรีนฟี",
    "GOLF_CADDY": "ค่าแคดดี้",
    "GOLF_CART": "ค่ารถกอล์ฟ",
    "GUEST_FEE": "ค่าแขก",
    "F_AND_B": "อาหารและเครื่องดื่ม",
    "PRO_SHOP": "โปรช็อป",
    "SERVICE": "บริการ",
    "PENALTY": "ค่าปรับ",
    "OTHER": "อื่นๆ"
  },
  "rentalStatus": {
    "NONE": "ไม่มี",
    "REQUESTED": "ร้องขอ",
    "PAID": "ชำระแล้ว",
    "ASSIGNED": "มอบหมายแล้ว",
    "RETURNED": "คืนแล้ว"
  },
  "region": {
    "TH": "ไทย",
    "SG": "สิงคโปร์",
    "MY": "มาเลเซีย"
  },
  "userRole": {
    "SUPER_ADMIN": "ผู้ดูแลระบบ",
    "CLUB_MANAGER": "ผู้จัดการสโมสร",
    "FINANCE_STAFF": "เจ้าหน้าที่การเงิน",
    "FRONT_DESK": "เจ้าหน้าที่ต้อนรับ",
    "GOLF_OPERATIONS": "เจ้าหน้าที่กอล์ฟ",
    "F_AND_B_STAFF": "เจ้าหน้าที่อาหารและเครื่องดื่ม"
  },
  "tenantStatus": {
    "PENDING": "รอดำเนินการ",
    "ACTIVE": "ใช้งาน",
    "SUSPENDED": "ระงับ",
    "ARCHIVED": "เก็บถาวร"
  },
  "subscriptionTier": {
    "STARTER": "เริ่มต้น",
    "PROFESSIONAL": "มืออาชีพ",
    "ENTERPRISE": "องค์กร"
  },
  "subscriptionStatus": {
    "ACTIVE": "ใช้งาน",
    "PAST_DUE": "เกินกำหนด",
    "CANCELLED": "ยกเลิก",
    "TRIAL": "ทดลองใช้"
  },
  "billingCycle": {
    "MONTHLY": "รายเดือน",
    "ANNUAL": "รายปี"
  },
  "platformUserRole": {
    "SUPER_ADMIN": "ผู้ดูแลระบบ",
    "CSM": "ผู้จัดการความสำเร็จลูกค้า",
    "SUPPORT": "ฝ่ายสนับสนุน",
    "FINANCE": "ฝ่ายการเงิน"
  }
}
```

**Step 2: Commit**

```bash
git add packages/i18n/src/locales/th.json
git commit -m "feat: add Thai locale file with all enum translations"
```

---

## Phase 3: Install & Configure next-intl in apps/application

### Task 10: Install next-intl in apps/application

**Files:**
- Modify: `clubvantage/apps/application/package.json`

**Step 1: Install next-intl**

Run: `cd clubvantage && pnpm --filter @clubvantage/application add next-intl`

**Step 2: Add @clubvantage/i18n dependency**

Run: `cd clubvantage && pnpm --filter @clubvantage/application add @clubvantage/i18n@workspace:*`

**Step 3: Verify installation**

Run: `cd clubvantage/apps/application && cat package.json | grep -E "next-intl|i18n"`
Expected: Both dependencies listed

**Step 4: Commit**

```bash
git add apps/application/package.json pnpm-lock.yaml
git commit -m "feat: install next-intl and @clubvantage/i18n in apps/application"
```

---

### Task 11: Configure next-intl provider in apps/application

**Files:**
- Create: `clubvantage/apps/application/src/i18n/request.ts`
- Create: `clubvantage/apps/application/src/i18n/config.ts`
- Modify: `clubvantage/apps/application/src/app/layout.tsx` (wrap with NextIntlClientProvider)

**Step 1: Create i18n config**

Create `apps/application/src/i18n/config.ts`:

```typescript
export const defaultLocale = 'en' as const;
export const locales = ['en', 'th'] as const;
export type Locale = (typeof locales)[number];
```

**Step 2: Create i18n request handler**

Create `apps/application/src/i18n/request.ts`:

```typescript
import { getRequestConfig } from 'next-intl/server';
import { defaultLocale } from './config';

export default getRequestConfig(async () => {
  // For now, use a simple approach: default locale
  // Later can be enhanced with cookie/header-based detection
  const locale = defaultLocale;

  return {
    locale,
    messages: (await import(`@clubvantage/i18n/locales/${locale}`)).default,
  };
});
```

**Step 3: Create next-intl plugin config**

Create or modify `apps/application/next.config.ts` (or `.mjs`) to include:

```typescript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

// ... rest of config
export default withNextIntl(nextConfig);
```

Note: Check the existing next.config file first and integrate accordingly.

**Step 4: Wrap layout with NextIntlClientProvider**

In `apps/application/src/app/layout.tsx`, add:

```tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();

  return (
    <html lang="en">
      <body>
        <NextIntlClientProvider messages={messages}>
          {/* existing providers/layout */}
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

Note: Integrate into the existing layout structure. Don't replace existing providers — wrap them.

**Step 5: Verify the app still starts**

Run: `cd clubvantage && pnpm --filter @clubvantage/application run dev`
Expected: App starts without errors. Stop with Ctrl+C.

**Step 6: Commit**

```bash
git add apps/application/src/i18n/ apps/application/next.config.* apps/application/src/app/layout.tsx
git commit -m "feat: configure next-intl provider in apps/application"
```

---

## Phase 4: Migrate apps/application to Shared Types

> **Important:** This phase is the biggest and most impactful. Each task targets one local types file and replaces its local definitions with imports from `@clubvantage/types`. Components that use these types will need updating to match UPPER_CASE values.

### Task 12: Migrate apps/application/src/components/members/types.ts

**Files:**
- Modify: `clubvantage/apps/application/src/components/members/types.ts`

**Step 1: Audit current local types**

The file defines:
- `MemberStatus` = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' | 'CANCELLED' (WRONG — doesn't match packages/types)
- `ApplicationStatus`, `DocumentStatus`, `ContractStatus`, etc. (not in packages/types — keep as local for now)
- `DependentRelationship` = 'SPOUSE' | 'CHILD' | 'PARENT' | 'SIBLING' (missing OTHER — WRONG)
- `PersonType`, `ChargeType`, `ChargeStatus`, etc.

**Step 2: Replace overlapping types with imports**

Replace only the types that exist in `@clubvantage/types`:

```typescript
// Replace local definitions with imports
import { MemberStatus, DependentRelationship } from '@clubvantage/types';

// Re-export for backwards compat within this module
export { MemberStatus, DependentRelationship };

// Keep types NOT in packages/types as local (for now)
export type ApplicationStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'PENDING_BOARD' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN';
// ... keep other local-only types
```

**Step 3: Find and fix component references**

Search for components using the old MemberStatus values ('PENDING', 'INACTIVE', 'CANCELLED') and update to use the canonical values. Map:
- `'PENDING'` → use `MemberStatus.PROSPECT` or `MemberStatus.APPLICANT` depending on context
- `'INACTIVE'` → use `MemberStatus.LAPSED`
- `'CANCELLED'` → use `MemberStatus.TERMINATED`

Use `grep -r "MemberStatus" apps/application/src/` to find all references.

**Step 4: Verify TypeScript compiles**

Run: `cd clubvantage && pnpm --filter @clubvantage/application run typecheck`
Expected: No errors

**Step 5: Commit**

```bash
git add apps/application/src/components/members/
git commit -m "refactor: migrate members types to @clubvantage/types"
```

---

### Task 13: Migrate apps/application/src/components/golf/types.ts

**Files:**
- Modify: `clubvantage/apps/application/src/components/golf/types.ts`

**Step 1: Audit current local types**

The file defines many types with lowercase/kebab-case values:
- `RentalStatus` = 'none' | 'requested' | ... (lowercase — WRONG)
- `BookingStatus` = 'booked' | 'checked-in' | 'on-course' | ... (lowercase/kebab — WRONG)
- `BackendPlayerType` = 'MEMBER' | 'GUEST' | 'DEPENDENT' | 'WALK_UP' (matches!)
- Many golf-specific types not in packages/types (keep as local)

**Step 2: Replace overlapping types with imports**

```typescript
import {
  TeeTimeStatus,
  PlayerType,
  CartType,
  RentalStatus,
  BookingStatus,
} from '@clubvantage/types';

export { TeeTimeStatus, PlayerType, CartType, RentalStatus, BookingStatus };

// Remove local definitions of these types
// Keep golf-specific types that don't overlap (BookingMode, CancellationReason, BlockType, etc.)
```

**Step 3: Update component references**

Components using lowercase values need updating. Search and replace:
- `'booked'` → `BookingStatus.CONFIRMED` (or `TeeTimeStatus.BOOKED` depending on context)
- `'checked-in'` → `TeeTimeStatus.CHECKED_IN`
- `'on-course'` → `TeeTimeStatus.STARTED`
- `'completed'` → `TeeTimeStatus.COMPLETED`
- `'cancelled'` → `TeeTimeStatus.CANCELLED`
- `'no-show'` → `TeeTimeStatus.NO_SHOW`
- `'none'` (rental) → `RentalStatus.NONE`
- `'requested'` (rental) → `RentalStatus.REQUESTED`
- etc.

This is the largest migration. Use `grep -rn` to find all usages and update them.

**Step 4: Verify TypeScript compiles**

Run: `cd clubvantage && pnpm --filter @clubvantage/application run typecheck`
Expected: No errors

**Step 5: Commit**

```bash
git add apps/application/src/components/golf/
git commit -m "refactor: migrate golf types to @clubvantage/types with UPPER_CASE values"
```

---

### Task 14: Migrate apps/application/src/components/bookings/types.ts

**Files:**
- Modify: `clubvantage/apps/application/src/components/bookings/types.ts`

**Step 1: Replace BookingStatus import**

Replace the local BookingStatus definition (9 values including lowercase 'available', 'maintenance', etc.) with the canonical import.

**Note:** The local definition includes 'maintenance' and 'outside_hours' which are NOT in the canonical BookingStatus. These are display-only states for the facility calendar UI. Keep them as separate type:

```typescript
import { BookingStatus } from '@clubvantage/types';
export { BookingStatus };

// Calendar-specific display states (not real booking statuses)
export type CalendarSlotStatus = BookingStatus | 'MAINTENANCE' | 'OUTSIDE_HOURS';
```

**Step 2: Update component references to UPPER_CASE**

**Step 3: Verify TypeScript compiles**

Run: `cd clubvantage && pnpm --filter @clubvantage/application run typecheck`

**Step 4: Commit**

```bash
git add apps/application/src/components/bookings/
git commit -m "refactor: migrate bookings types to @clubvantage/types"
```

---

### Task 15: Add useTranslations() usage to one component as reference pattern

**Files:**
- Modify: One component in apps/application that displays a status badge (pick the simplest one)

**Step 1: Find a simple status badge component**

Search: `grep -rn "status.*badge\|StatusBadge\|statusBadge" apps/application/src/`

**Step 2: Update it to use useTranslations**

```tsx
import { MemberStatus } from '@clubvantage/types';
import { useTranslations } from 'next-intl';

function StatusBadge({ status }: { status: MemberStatus }) {
  const t = useTranslations('memberStatus');
  return <span className={getBadgeClasses(status)}>{t(status)}</span>;
}
```

**Step 3: Verify it renders correctly**

Run: `cd clubvantage && pnpm --filter @clubvantage/application run dev`
Check the component displays "Active" for ACTIVE, etc.

**Step 4: Commit**

```bash
git add apps/application/src/
git commit -m "feat: add useTranslations() reference pattern for status badges"
```

---

## Phase 5: Migrate apps/api to Shared Types (Future)

> **Note:** The API uses TypeScript `enum` keyword + `registerEnumType()` for GraphQL. This requires a different approach since GraphQL needs real enums, not const objects. The const objects in packages/types can be used as the VALUES for the TS enums, but the TS enums must remain for GraphQL schema generation.

### Task 16: Plan API enum migration strategy

**This task is research-only. Do not modify code yet.**

**Step 1: Investigate NestJS + GraphQL enum registration**

Check how `registerEnumType` works with const objects. The pattern would be:

```typescript
// In apps/api, keep TS enum for GraphQL but derive values from packages/types
import { MemberStatus as MemberStatusValues } from '@clubvantage/types';

// GraphQL requires actual enum, but values must match
export enum MemberStatus {
  PROSPECT = MemberStatusValues.PROSPECT,
  LEAD = MemberStatusValues.LEAD,
  // ... etc
}

registerEnumType(MemberStatus, { name: 'MemberStatus' });
```

**Step 2: Document findings in a comment at the top of the plan**

This is deferred to a separate plan since it touches the GraphQL schema and requires careful testing.

**Step 3: Commit a note**

No code changes — this is research for a future plan.

---

## Summary

| Phase | Tasks | What Changes |
|-------|-------|-------------|
| 1 | Tasks 1-6 | Convert all packages/types to const object pattern, add missing values, resolve name conflicts |
| 2 | Tasks 7-9 | Create packages/i18n with en.json and th.json |
| 3 | Tasks 10-11 | Install next-intl in apps/application, configure provider |
| 4 | Tasks 12-15 | Migrate apps/application local types to shared imports, add reference i18n usage |
| 5 | Task 16 | Research API enum migration (deferred to separate plan) |

### Key Decisions
- `TaxType` in billing renamed to `BillingTaxType` (government tax jurisdiction)
- `TaxType` in golf-checkin renamed to `CheckInTaxType` (calculation method)
- `PaymentStatus` in golf-checkin renamed to `CheckInPaymentStatus` (to avoid conflict with billing)
- `PlayerType` expanded from 2 to 4 values (added DEPENDENT, WALK_UP)
- `BookingStatus` expanded with IN_PROGRESS
- `PaymentStatus` expanded with PARTIALLY_REFUNDED
- Apps/application local types that don't exist in packages/types (ApplicationStatus, DocumentStatus, etc.) are kept local for now
- API migration deferred — requires separate plan for GraphQL compatibility
