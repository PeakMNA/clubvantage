# Platform / i18n / Internationalization & Shared Types

## Overview

Internationalization (i18n) and Shared Types addresses the consolidation of all enums, status types, and display labels into two centralized packages: `packages/types` (canonical UPPER_CASE const objects and type unions) and `packages/i18n` (translation JSON files per locale). This eliminates type duplication across applications, enforces consistent casing (always UPPER_CASE), and provides multi-language display labels via next-intl. The API returns raw UPPER_CASE values only; translation is exclusively a frontend concern.

## Status

**Partially Implemented.** The foundational packages exist and are in use:

- `packages/types/src/entities/member.ts` defines MemberStatus, MembershipCategory, DependentRelationship, ReferralSource, LeadStage as const objects with type unions
- `packages/types/src/entities/golf.ts`, `booking.ts`, `billing.ts`, `common.ts`, `golf-checkin.ts` define golf, booking, billing, and common enums
- `packages/types/src/platform/index.ts` defines platform-level types
- `packages/i18n/src/locales/en.json` has translations for all currently defined enums (memberStatus, membershipCategory, dependentRelationship, referralSource, leadStage, bookingStatus, teeTimeStatus, playerType, invoiceStatus, paymentStatus, rentalStatus, and more)
- `packages/i18n/src/locales/th.json` exists as a stub (needs translations)
- `apps/application/src/components/members/types.ts` imports MemberStatus and DependentRelationship from `@clubvantage/types`
- `apps/marketing` uses next-intl with `[locale]` route segment for full i18n support

**Not yet implemented:** Some app-level components still have locally defined status types (e.g., ApplicationStatus, DocumentStatus, ContractStatus in members/types.ts). next-intl is not yet configured in `apps/application` or `apps/member-portal`. Thai translations (th.json) are stub/empty for the application. GraphQL enums in apps/api are not yet re-exported from @clubvantage/types.

## Capabilities

- Single source of truth for all status enums in `packages/types` using const object + type union pattern
- Translation files per locale in `packages/i18n` with namespace-based keys (e.g., `memberStatus.ACTIVE`)
- next-intl integration in Next.js apps for runtime locale switching
- Locale-prefixed routing in marketing site (`/en/...`, `/th/...`)
- Type-safe translation keys: TypeScript validates that translation keys match enum values
- API returns raw UPPER_CASE enum values; no i18n in API responses
- Support for English (en) and Thai (th) with extensible locale support
- Consistent enum casing enforcement: all values UPPER_CASE, all keys UPPER_CASE

## Dependencies

### Interface Dependencies

| Component | Path | Purpose |
|-----------|------|---------|
| packages/types | `packages/types/src/` | Canonical enum definitions |
| packages/i18n | `packages/i18n/src/` | Translation JSON files |
| member.ts | `packages/types/src/entities/member.ts` | MemberStatus, MembershipCategory, DependentRelationship, etc. |
| booking.ts | `packages/types/src/entities/booking.ts` | BookingStatus, FacilityType |
| golf.ts | `packages/types/src/entities/golf.ts` | TeeTimeStatus, PlayerType, CartType |
| billing.ts | `packages/types/src/entities/billing.ts` | InvoiceStatus, PaymentStatus, PaymentMethod |
| common.ts | `packages/types/src/entities/common.ts` | Shared utility types |
| platform/index.ts | `packages/types/src/platform/index.ts` | TenantStatus, SubscriptionTier, PlatformUserRole |
| en.json | `packages/i18n/src/locales/en.json` | English translations |
| th.json | `packages/i18n/src/locales/th.json` | Thai translations (stub) |

### Settings Dependencies

| Setting | Source | Purpose |
|---------|--------|---------|
| defaultLocale | next-intl config | Default language when no locale specified |
| supportedLocales | next-intl config | Available languages |
| NEXT_INTL_LOCALE_COOKIE | next-intl middleware | Cookie name for locale persistence |

### Data Dependencies

| Entity | Relationship | Notes |
|--------|-------------|-------|
| Member.status | Uses MemberStatus | Must match enum values exactly |
| TeeTime.status | Uses TeeTimeStatus | Must match enum values exactly |
| Invoice.status | Uses InvoiceStatus | Must match enum values exactly |
| Payment.status | Uses PaymentStatus | Must match enum values exactly |
| Booking.status | Uses BookingStatus | Must match enum values exactly |
| Dependent.relationship | Uses DependentRelationship | Must match enum values exactly |

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| defaultLocale | string | `en` | System | Default language for new users and fallback |
| supportedLocales | string[] | `['en', 'th']` | System | Languages available across all apps |
| localeDetection | boolean | `true` | System | Whether to auto-detect locale from browser Accept-Language header |
| localeCookieName | string | `NEXT_LOCALE` | System | Cookie name for persisting user's locale choice |
| localeCookieMaxAge | number | `31536000` | System | Cookie TTL in seconds (1 year) |
| fallbackLocale | string | `en` | System | Locale to use when a translation key is missing in the active locale |
| missingKeyBehavior | enum | `fallback` | Developer | What to do when a translation key is missing: 'fallback' (show en value), 'key' (show raw key), 'empty' (show nothing) |

## Data Model

### Canonical Enum Pattern

All enums follow the const object + type union pattern. TypeScript enums are not used.

```typescript
// packages/types - the ONLY place enums are defined
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

### Consolidated Enum Registry

| Enum | Package Path | Values |
|------|-------------|--------|
| MemberStatus | entities/member.ts | PROSPECT, LEAD, APPLICANT, ACTIVE, SUSPENDED, LAPSED, RESIGNED, TERMINATED, REACTIVATED |
| MembershipCategory | entities/member.ts | REGULAR, PREMIUM, CORPORATE, SENIOR, JUNIOR, FAMILY |
| DependentRelationship | entities/member.ts | SPOUSE, CHILD, PARENT, SIBLING, OTHER |
| ReferralSource | entities/member.ts | WEBSITE, MEMBER_REFERRAL, WALK_IN, GUEST_CONVERSION, CORPORATE, EVENT, ADVERTISEMENT, OTHER |
| LeadStage | entities/member.ts | NEW, CONTACTED, QUALIFIED, CONVERTED, LOST |
| BookingStatus | entities/booking.ts | PENDING, CONFIRMED, CHECKED_IN, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW |
| TeeTimeStatus | entities/golf.ts | AVAILABLE, BOOKED, CHECKED_IN, STARTED, COMPLETED, CANCELLED, NO_SHOW, BLOCKED |
| PlayerType | entities/golf.ts | MEMBER, GUEST, DEPENDENT, WALK_UP |
| RentalStatus | entities/golf.ts | NONE, REQUESTED, PAID, ASSIGNED, RETURNED |
| InvoiceStatus | entities/billing.ts | DRAFT, SENT, PAID, PARTIALLY_PAID, OVERDUE, VOID, CANCELLED |
| PaymentStatus | entities/billing.ts | PENDING, COMPLETED, FAILED, REFUNDED, PARTIALLY_REFUNDED |
| PaymentMethod | entities/billing.ts | CASH, BANK_TRANSFER, CREDIT_CARD, QR_PROMPTPAY, QR_PAYNOW, QR_DUITNOW, CHECK, DIRECT_DEBIT, CREDIT |

### Translation File Structure

```json
// packages/i18n/src/locales/en.json
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
  "bookingStatus": { ... },
  "invoiceStatus": { ... },
  // ... one namespace per enum
}
```

### Usage Pattern in Components

```tsx
// Correct pattern for displaying enum labels
import { MemberStatus } from '@clubvantage/types';
import { useTranslations } from 'next-intl';

function StatusBadge({ status }: { status: MemberStatus }) {
  const t = useTranslations('memberStatus');
  return <span>{t(status)}</span>;  // "Active" in en, "ใช้งาน" in th
}
```

### Enums Pending Migration to packages/types

These types are currently defined locally in `apps/application/src/components/members/types.ts` and should be moved to `packages/types`:

| Type | Current Location | Target Location |
|------|-----------------|----------------|
| ApplicationStatus | members/types.ts | entities/member.ts |
| DocumentStatus | members/types.ts | entities/member.ts |
| ContractStatus | members/types.ts | entities/billing.ts |
| ChargeStatus | members/types.ts | entities/billing.ts |
| ChargeType | members/types.ts | entities/billing.ts |
| RecurringFrequency | members/types.ts | entities/billing.ts |
| UsageType | members/types.ts | entities/billing.ts |
| TaxMethod | members/types.ts | entities/billing.ts |
| AgingBucket | members/types.ts | entities/billing.ts |
| TransactionType | members/types.ts | entities/billing.ts |
| PersonType | members/types.ts | entities/common.ts |

## Business Rules

1. All enum values are UPPER_CASE strings. No lowercase, camelCase, or kebab-case values are permitted in the type definitions.
2. The API (apps/api) returns raw UPPER_CASE values in GraphQL responses. The API never performs translation.
3. Translation is exclusively a frontend concern. Components use `useTranslations()` from next-intl to convert UPPER_CASE values to localized display text.
4. When a translation key is missing in the active locale, the system falls back to the English translation. If the English translation is also missing, the raw UPPER_CASE key is displayed.
5. GraphQL enums in apps/api should import values from `@clubvantage/types` and use `registerEnumType()` with those values.
6. Local type definitions in app code that duplicate `@clubvantage/types` enums are considered bugs and should be replaced with imports.
7. The `packages/types` package is the single source of truth. Any change to an enum value must be made there first, then propagated to `packages/i18n` translations and consuming apps.
8. NestJS `registerEnumType` can accept the const object values from `@clubvantage/types` directly.
9. Frontend components that display status strings must never hardcode display labels (e.g., `status === 'ACTIVE' ? 'Active' : ...`). They must always use `useTranslations()`.
10. The marketing site already fully uses next-intl. The application and member-portal apps need next-intl configuration added.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| API returns an enum value not yet in the translation file | Display the raw UPPER_CASE value; log a warning in development |
| Thai translation missing for a specific key | Fall back to English translation for that key |
| Component rendered outside next-intl provider | next-intl throws; ensure all app pages are wrapped in NextIntlClientProvider |
| Enum value added to packages/types but not to en.json | Build-time lint check should catch missing translations; development warning in console |
| Enum value removed from packages/types | Existing database records with old value display raw key; migration script needed to update records |
| Multiple apps import same enum with different expected casing | All apps must use UPPER_CASE as defined in packages/types; any lowercase usage is a bug to fix |
| GraphQL enum registration conflicts with packages/types values | Use the const object values directly in registerEnumType; no manual string arrays |
| Locale switch during active form submission | Form data is not re-translated; labels update on next render; submitted values remain UPPER_CASE |
| packages/i18n has keys not present in packages/types | Extra keys are harmless but should be cleaned up; they may be UI-specific labels (not enum translations) |
| Developer creates a new enum but forgets to add translations | TypeScript compilation succeeds (types are separate from translations); runtime displays raw key; caught by translation coverage report |
