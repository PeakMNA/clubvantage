# Members / Profiles / Member Profiles & Contacts

## Overview

Member Profiles encompasses the personal information, contact details, address management, communication preferences, guest management, and dependent (family) management for each club member. This is the identity and relationship layer that supports personalized service delivery, billing accuracy, and regulatory compliance across all club operations.

## Status

**Partially Implemented.** The profile tab (`apps/application/src/components/members/profile-tab.tsx`) displays personal information (first name, last name, date of birth, nationality, join date), contact information (email, phone), and a full address management UI with add/edit/remove/set-primary capabilities. The dependent management tab (`dependents-tab.tsx`) and dependent card (`dependent-card.tsx`) are built with relationship types imported from `@clubvantage/types`. The member detail view (`member-detail-view.tsx`) shows household information with linked household members.

**Not yet implemented:** Communication preferences UI, dietary/lifestyle preferences, guest pass management, handicap tracking, photo upload workflow (camera overlay exists in UI but not wired), emergency contact fields, preferred language selection, custom fields configuration, and the full member edit modal.

## Capabilities

- View and edit personal information: name, preferred name, salutation, suffix, date of birth, nationality, gender, national ID, passport number
- Manage multiple addresses per member with types (Billing, Mailing, Both), primary designation, and Thai address format (sub-district, district, province)
- Manage contact information: email, phone, mobile phone, work phone
- Configure communication preferences: email marketing opt-in/out, email statements, email events, SMS notifications, paper statements, preferred language
- Upload and manage member photos with avatar fallback to initials
- Track member preferences: dietary restrictions, shirt size, handicap index
- Manage dependents with relationship types (Spouse, Child, Parent, Sibling, Grandchild, Domestic Partner, Other)
- Configure dependent privileges: golf, dining, pool, fitness, spa access per dependent
- Track dependent age-out status and conversion eligibility
- Manage guest passes: track guest visits per member against monthly/per-visit limits
- Store custom fields as key-value pairs for club-specific data
- Tag members for segmentation and filtering

## Dependencies

### Interface Dependencies

| Component | Path | Purpose |
|-----------|------|---------|
| ProfileTab | `apps/application/src/components/members/profile-tab.tsx` | Personal info, contact, addresses display |
| DependentsTab | `apps/application/src/components/members/dependents-tab.tsx` | Dependent listing |
| DependentCard | `apps/application/src/components/members/dependent-card.tsx` | Individual dependent display with actions |
| DependentModal | `apps/application/src/components/members/dependent-modal.tsx` | Add/edit dependent form |
| AddressModal | `apps/application/src/components/members/address-modal.tsx` | Add/edit address form |
| MemberDetailHeader | `apps/application/src/components/members/member-detail-header.tsx` | Header with status, photo, key info |
| MemberDetailView | `apps/application/src/components/members/member-detail-view.tsx` | Tabbed detail container |
| AutoPayModal | `apps/application/src/components/members/auto-pay-modal.tsx` | Auto-pay enrollment |

### Settings Dependencies

| Setting | Source | Purpose |
|---------|--------|---------|
| Address format | Club Settings | Thai vs international address field layout |
| Required profile fields | Club Settings | Which fields are mandatory for member records |
| Custom field definitions | Club Settings | Club-specific additional fields |
| Photo upload limits | System Settings | Max file size, allowed formats |
| Guest pass limits | Membership Type | Monthly and per-visit guest caps |
| Dependent age rules | Membership Type | Max age, calculation method, grace period |
| Communication channels | Club Settings | Which communication channels are available |

### Data Dependencies

| Entity | Relationship | Notes |
|--------|-------------|-------|
| Member | Parent | Profile data belongs to a member record |
| Address | One-to-Many | Multiple addresses per member |
| Dependent | One-to-Many | Children, spouse, etc. linked to primary member |
| Household | Optional FK | Groups family members for shared profile data |
| MembershipType | FK | Determines guest limits, dependent rules |
| MembershipTier | Optional FK | May override guest limits via tier benefits |
| GuestVisit | One-to-Many | Track individual guest visits against member quota |

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| requiredFields | string[] | `['firstName', 'lastName', 'email']` | Club Admin | Fields that must be filled before saving a member |
| addressFormat | enum | `THAI` | Club Admin | Address field layout: THAI (sub-district/district/province) or INTERNATIONAL (city/state/postal) |
| maxAddressesPerMember | number | `5` | System | Maximum number of addresses a member can have |
| photoMaxSizeMB | number | `5` | System | Maximum photo upload file size |
| photoAllowedFormats | string[] | `['image/jpeg', 'image/png', 'image/webp']` | System | Allowed photo MIME types |
| photoStorageProvider | enum | `S3` | System | Where photos are stored: S3, CLOUDINARY, GCS |
| genderOptions | string[] | `['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_SAY']` | System | Available gender selections |
| defaultPreferredLanguage | string | `en` | Club Admin | Default language for new members |
| availableLanguages | string[] | `['en', 'th']` | System | Languages available for member communication |
| enableSmsNotifications | boolean | `true` | Club Admin | Whether SMS channel is available |
| enablePaperStatements | boolean | `false` | Club Admin | Whether paper statement option is shown |
| customFieldDefinitions | CustomFieldDef[] | `[]` | Club Admin | Array of custom field configurations with name, type, required flag |
| maxDependentsPerMember | number | `6` | Membership Type | Maximum dependents (overridden by membership type) |
| dependentPhotoRequired | boolean | `false` | Club Admin | Whether dependents must have a photo |
| guestRegistrationFields | string[] | `['firstName', 'lastName']` | Club Admin | Required fields when registering a guest |
| maxTagsPerMember | number | `20` | System | Maximum tags assignable to a single member |
| emergencyContactRequired | boolean | `false` | Club Admin | Whether emergency contact is mandatory |

## Data Model

### Address (as implemented)

```typescript
// apps/application/src/components/members/types.ts
interface Address {
  id: string;
  type: 'BILLING' | 'MAILING' | 'BOTH';
  isPrimary: boolean;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  country: string;
}
```

### Address (canonical / packages/types)

```typescript
// packages/types/src/entities/member.ts
interface Address {
  id: string;
  memberId: string;
  type: 'HOME' | 'WORK' | 'MAILING';
  line1: string;
  line2?: string;
  city: string;
  stateProvince?: string;
  postalCode?: string;
  country: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Reconciliation note:** The app-level Address type uses Thai format fields (subDistrict, district, province) while the canonical type uses international format (city, stateProvince). These should be unified by adding Thai-specific fields to the canonical type while keeping international fields for non-Thai clubs.

### Dependent

```typescript
// packages/types/src/entities/member.ts
interface Dependent {
  id: string;
  tenantId: string;
  memberId: string;
  firstName: string;
  lastName: string;
  relationship: DependentRelationship;
  dateOfBirth?: Date;
  email?: string;
  phone?: string;
  photoUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
}

// App-level extension (apps/application)
interface DependentExtended extends Dependent {
  memberNumber: string;
  hasClubAccess: boolean;
  accessCardNumber?: string;
  accessStartDate?: Date;
  accessEndDate?: Date;
  golfPrivileges: boolean;
  diningPrivileges: boolean;
  poolPrivileges: boolean;
  fitnessPrivileges: boolean;
  spaPrivileges: boolean;
  chargesGoToParent: boolean;
  ownCreditLimit?: number;
}
```

### CommunicationPreferences

```typescript
interface CommunicationPreferences {
  emailMarketing: boolean;
  emailStatements: boolean;
  emailEvents: boolean;
  smsNotifications: boolean;
  paperStatements: boolean;
  preferredLanguage: string;
}
```

### GuestVisit

```typescript
interface GuestVisit {
  id: string;
  memberId: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail?: string;
  guestPhone?: string;
  visitDate: Date;
  facility?: string;
  feeCharged: number;
  feeWaived: boolean;
  createdAt: Date;
}
```

### DependentRelationship enum (canonical)

```typescript
// packages/types/src/entities/member.ts
export const DependentRelationship = {
  SPOUSE: 'SPOUSE',
  CHILD: 'CHILD',
  PARENT: 'PARENT',
  SIBLING: 'SIBLING',
  OTHER: 'OTHER',
} as const;
export type DependentRelationship = (typeof DependentRelationship)[keyof typeof DependentRelationship];
```

**Reconciliation note:** The membership management plan defines additional relationships (GRANDCHILD, DOMESTIC_PARTNER) not yet in the canonical type. These should be added to `packages/types`.

## Business Rules

1. Every member must have at least one address marked as primary. Removing the only primary address is blocked.
2. When a member has multiple addresses, exactly one must be `isPrimary: true` at any time.
3. The `type` field on addresses determines which address appears on invoices (BILLING or BOTH) and which on correspondence (MAILING or BOTH).
4. Dependent status automatically changes to `AGED_OUT` when the dependent exceeds the `dependentMaxAge` for the membership type, calculated per the `ageCalculation` method.
5. Guest visits are tracked against the member's `maxGuestsPerVisit` and `maxGuestsPerMonth` limits from their membership type. Tier benefits may increase these limits via `guestPassesPerMonth`.
6. Communication preferences default to all email channels enabled and SMS enabled. Paper statements default to disabled.
7. Photo uploads are processed to generate a thumbnail (150x150) and a display size (400x400) stored alongside the original.
8. Tags are free-text strings, trimmed and deduplicated. They are used for segmentation in marketing campaigns.
9. Custom fields are stored as JSON. The club admin defines the schema; the system validates values against the schema on save.
10. Dependent privileges default to matching the parent member's access level but can be individually overridden.
11. When a dependent's `chargesGoToParent` is true, all POS and facility charges are posted to the parent member's AR account.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Member has no email but club requires email for billing | Allow save with warning; flag in member record as "incomplete profile" |
| Address deletion when only one address exists | Block deletion; show error "At least one address is required" |
| Photo upload exceeds size limit | Reject with clear error message showing limit; offer to compress |
| Dependent added with future date of birth | Reject; date of birth must be in the past |
| Guest limit reached mid-visit (e.g., 3/3 used, staff tries to add 4th) | Block addition with message showing current usage and limit; allow override with manager approval |
| Dependent email matches an existing member email | Allow; dependents and members are separate entities. Show informational notice. |
| Thai address with missing sub-district/district | Allow save if addressFormat is INTERNATIONAL; require if THAI |
| Communication preference change during active campaign | Apply immediately; any in-flight emails/SMS for current campaign still deliver |
| Custom field schema changed after data exists | Existing data preserved; new required fields show as "missing" until member profile is updated |
| Dependent with own credit limit exceeds it | Block charges to dependent; do not fall back to parent's credit limit unless explicitly configured |
| Member marked as TERMINATED still has active dependents | All dependents automatically set to INACTIVE when parent member is terminated |
| Household dissolved (primary member removed) | All members in household become standalone; billing reverts to individual |
