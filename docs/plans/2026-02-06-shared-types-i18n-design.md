# Shared Types & i18n Design

**Date:** 2026-02-06
**Status:** Approved

## Problem

Enums and status types are duplicated across 3-6 locations with diverging values, casing, and naming. This causes bugs when one app expects `CHECKED_IN` and another uses `checked-in`.

## Architecture

```
packages/types     → UPPER_CASE const objects + type unions (single source of truth)
packages/i18n      → Translation JSON files per locale (en.json, th.json)
apps/*             → Import types from @clubvantage/types, use next-intl for display
apps/api           → Returns raw UPPER_CASE values only, no i18n
```

## Canonical Enums (packages/types)

All enums use the const object + type union pattern:

```ts
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

### Consolidated Enums

| Enum | Values |
|------|--------|
| MemberStatus | PROSPECT, LEAD, APPLICANT, ACTIVE, SUSPENDED, LAPSED, RESIGNED, TERMINATED, REACTIVATED |
| BookingStatus | PENDING, CONFIRMED, CHECKED_IN, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW |
| TeeTimeStatus | AVAILABLE, BOOKED, CHECKED_IN, STARTED, COMPLETED, CANCELLED, NO_SHOW, BLOCKED |
| InvoiceStatus | DRAFT, SENT, PAID, PARTIALLY_PAID, OVERDUE, VOID, CANCELLED |
| PaymentStatus | PENDING, COMPLETED, FAILED, REFUNDED, PARTIALLY_REFUNDED |
| PlayerType | MEMBER, GUEST, DEPENDENT, WALK_UP |
| RentalStatus | NONE, REQUESTED, PAID, ASSIGNED, RETURNED |

## Translation Package (packages/i18n)

### Structure

```
packages/i18n/
  src/
    locales/
      en.json
      th.json
    index.ts
  package.json
```

### Locale File Format

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
  "bookingStatus": {
    "PENDING": "Pending",
    "CONFIRMED": "Confirmed",
    "CHECKED_IN": "Checked In",
    "IN_PROGRESS": "In Progress",
    "COMPLETED": "Completed",
    "CANCELLED": "Cancelled",
    "NO_SHOW": "No Show"
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
  "paymentStatus": {
    "PENDING": "Pending",
    "COMPLETED": "Completed",
    "FAILED": "Failed",
    "REFUNDED": "Refunded",
    "PARTIALLY_REFUNDED": "Partially Refunded"
  },
  "playerType": {
    "MEMBER": "Member",
    "GUEST": "Guest",
    "DEPENDENT": "Dependent",
    "WALK_UP": "Walk-up"
  },
  "rentalStatus": {
    "NONE": "None",
    "REQUESTED": "Requested",
    "PAID": "Paid",
    "ASSIGNED": "Assigned",
    "RETURNED": "Returned"
  }
}
```

## App Integration (next-intl)

Each Next.js app (application, member-portal, marketing) configures next-intl:

```tsx
// Usage in components
import { MemberStatus } from '@clubvantage/types';
import { useTranslations } from 'next-intl';

function StatusBadge({ status }: { status: MemberStatus }) {
  const t = useTranslations('memberStatus');
  return <span>{t(status)}</span>;
}
```

## Implementation Order

1. Update `packages/types` - consolidate all enums to const object + type union pattern
2. Create `packages/i18n` - en.json with all enum labels, th.json stub
3. Install next-intl in `apps/application`
4. Configure next-intl provider + middleware in apps/application
5. Replace local type definitions in apps/application with imports from @clubvantage/types
6. Update components to use `useTranslations()` instead of hardcoded labels
7. Repeat for apps/member-portal
8. Update apps/api GraphQL enums to import from @clubvantage/types
9. Fill in th.json translations
10. Remove all dead local type definitions

## Migration Strategy

- Do NOT change API response values - they stay UPPER_CASE
- Frontend components that use lowercase/kebab-case need updating to match
- GraphQL enums in API should re-export from @clubvantage/types where possible
- NestJS registerEnumType can use the const object values
