# Members / Management / Member Lifecycle & Tiers

## Overview

Member Management covers the full lifecycle of a club member from prospect intake through active membership, suspension, resignation, termination, and potential reactivation. It encompasses membership type and category configuration, tier-based benefits, status transitions with approval workflows, and household/family grouping. This is the foundational entity model upon which billing, bookings, golf, and all other modules depend.

## Status

**Partially Implemented.** The members directory page (`apps/application/src/app/(dashboard)/members/page.tsx`) is fully built with table view, search, quick filters, advanced filters, bulk selection, and an add-member modal. The member detail view (`member-detail-view.tsx`) provides overview, billing, bookings, engagement, and activity tabs. Member types are defined in `packages/types/src/entities/member.ts` with `MemberStatus`, `MembershipCategory`, `DependentRelationship`, and `ReferralSource` const objects. The `packages/i18n/src/locales/en.json` file includes translations for all member-related enums.

**Not yet implemented:** Membership tier configuration UI, tier benefit engine, status transition approval workflows, automated status transitions (e.g., AR aging triggers), corporate membership designee management, prospect pipeline kanban, and lead scoring.

Member portal invitation and activation workflow designed (see `docs/plans/2026-02-06-member-portal-pwa-design.md`).

## Capabilities

- Create, read, update, and soft-delete members with unique member IDs (M-XXXX format)
- Assign members to configurable membership types (Individual, Family, Corporate, Junior, Senior, Social, Sports, Legacy, Honorary, Non-Resident, Seasonal, Probationary)
- Configure membership tiers within each type (Platinum, Gold, Silver, Bronze) with price multipliers and benefit packages
- Manage member status through a defined state machine: PROSPECT > LEAD > APPLICANT > ACTIVE > SUSPENDED/LAPSED/RESIGNED/TERMINATED > REACTIVATED
- Configure status transition rules with approval requirements, waiting periods, fees, and notification triggers
- Automate status transitions based on business conditions (e.g., DAYS_OVERDUE >= 91 triggers ACTIVE > SUSPENDED)
- Group members into households with consolidated billing options
- Track member financial summary: credit balance, outstanding balance, credit limit, aging bucket
- Bulk operations: status change, invoice send, export, delete with confirmation dialogs
- Application workflow for new members: SUBMITTED > UNDER_REVIEW > PENDING_BOARD > APPROVED/REJECTED/WITHDRAWN
- Sponsor and seconder tracking for applications
- Corporate membership management with designee pools and transfer rules

## Dependencies

### Interface Dependencies

| Component | Path | Purpose |
|-----------|------|---------|
| MembersPage | `apps/application/src/app/(dashboard)/members/page.tsx` | Member directory with table, search, filters |
| MemberDetailView | `apps/application/src/components/members/member-detail-view.tsx` | Detail view with tabbed layout |
| AddMemberModal | `apps/application/src/components/members/add-member-modal.tsx` | New member creation form |
| StatusBadge | `apps/application/src/components/members/status-badge.tsx` | Status display badge |
| MemberDetailHeader | `apps/application/src/components/members/member-detail-header.tsx` | Detail page header with actions |
| AdvancedFiltersPanel | `apps/application/src/components/members/advanced-filters-panel.tsx` | Slide-out filter panel |
| BulkSelectionBar | `apps/application/src/components/members/bulk-selection-bar.tsx` | Bottom bar for bulk actions |
| ConfirmationDialog | `apps/application/src/components/members/confirmation-dialog.tsx` | Status change and bulk action confirmation |
| ProfileTab | `apps/application/src/components/members/profile-tab.tsx` | Personal info, contact, addresses |
| ContractTab | `apps/application/src/components/members/contract-tab.tsx` | Membership contract and charges |
| DependentsTab | `apps/application/src/components/members/dependents-tab.tsx` | Dependent management |
| ARHistoryTab | `apps/application/src/components/members/ar-history-tab.tsx` | Account receivable history |
| EngagementTab | `apps/application/src/components/members/engagement-tab.tsx` | Member engagement metrics |

### Settings Dependencies

| Setting | Source | Purpose |
|---------|--------|---------|
| Club membership types | Club Settings | Available membership categories for the club |
| Tier configuration | Membership Type Settings | Tier names, multipliers, benefits per type |
| Status transition rules | System Settings | Approval requirements, auto-transition triggers |
| Application workflow | Club Settings | Sponsor requirements, document requirements, review stages |
| Age-out rules | Membership Type Settings | Dependent aging thresholds and conversion offers |
| Credit limit defaults | Club Settings | Default credit limits by membership type |
| AR aging thresholds | Club Settings | Days overdue triggers for suspension |

### Data Dependencies

| Entity | Relationship | Notes |
|--------|-------------|-------|
| Club | Parent | Every member belongs to a club (tenantId + clubId) |
| MembershipType | Required FK | Every member must have a membership type |
| MembershipTier | Optional FK | Members may optionally be assigned to a tier within their type |
| Household | Optional FK | Family members share a household for consolidated billing |
| Contract | One-to-One | Active membership contract with charges |
| Invoice | One-to-Many | Generated from contract charges |
| TeeTime/TeeTimePlayer | One-to-Many | Golf bookings reference member |
| FacilityBooking | One-to-Many | Facility reservations reference member |

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| memberIdFormat | string | `M-{0000}` | Club Admin | Member ID display format with zero-padded sequence |
| defaultMemberStatus | MemberStatus | `PROSPECT` | System | Initial status for manually created members |
| applicationMemberStatus | MemberStatus | `APPLICANT` | System | Status assigned when application is submitted |
| requireSponsor | boolean | `false` | Club Admin | Whether new applications require a sponsor |
| sponsorCount | number | `1` | Club Admin | Number of sponsors required per application |
| requireBoardApproval | boolean | `false` | Club Admin | Whether applications require board vote |
| boardApprovalQuorum | number | `3` | Club Admin | Minimum board votes for approval |
| applicationFee | number | `0` | Club Admin | Non-refundable application processing fee |
| suspensionTriggerDays | number | `91` | Club Admin | Days overdue before auto-suspension |
| reinstatementFee | number | `0` | Club Admin | Fee charged to reactivate a suspended member |
| resignationNoticeDays | number | `30` | Club Admin | Required notice period for resignation |
| resignationEffectiveDate | enum | `END_OF_BILLING` | Club Admin | When resignation takes effect: IMMEDIATE, END_OF_MONTH, END_OF_BILLING |
| maxFamilyMembers | number | `6` | Membership Type | Maximum dependents per household |
| dependentMaxAge | number | `23` | Membership Type | Age limit for child dependents |
| ageCalculation | enum | `BIRTHDAY` | Membership Type | How age-out is calculated: BIRTHDAY, YEAR_END, MEMBERSHIP_ANNIVERSARY |
| gracePeriodMonths | number | `6` | Membership Type | Months after age-out before removal |
| conversionOfferEnabled | boolean | `true` | Membership Type | Offer aged-out dependents a conversion to individual membership |
| conversionDiscount | number | `50` | Membership Type | Percentage discount on joining fee for aged-out conversion |
| creditLimitDefault | number | `50000` | Membership Type | Default credit limit in THB |
| creditAlertThreshold | number | `80` | Club Admin | Percentage of credit limit that triggers an alert |
| creditBlockEnabled | boolean | `true` | Club Admin | Block charges when credit limit is reached |
| guestMaxPerVisit | number | `3` | Membership Type | Maximum guests per member visit |
| guestMaxPerMonth | number | `12` | Membership Type | Maximum guest visits per month |
| bookingAdvanceDays | number | `14` | Membership Type / Tier | How far in advance members can book |

## Data Model

### Member (primary entity)

```typescript
// Canonical: packages/types/src/entities/member.ts
interface Member {
  id: string;
  tenantId: string;
  clubId: string;
  memberId: string;             // Display ID: M-0001
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  photoUrl?: string;
  membershipTypeId: string;
  membershipTierId?: string;
  status: MemberStatus;
  joinDate?: Date;
  renewalDate?: Date;
  expiryDate?: Date;
  householdId?: string;
  isPrimaryMember: boolean;
  referredById?: string;
  referralSource?: ReferralSource;
  creditBalance: number;
  outstandingBalance: number;
  creditLimit: number;
  creditLimitEnabled: boolean;
  tags: string[];
  customFields: Record<string, unknown>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
```

### MembershipType

```typescript
interface MembershipType {
  id: string;
  clubId: string;
  name: string;
  code: string;                  // e.g., FAM-GOLF
  category: MembershipCategory;  // INDIVIDUAL, FAMILY, CORPORATE, etc.
  description?: string;
  joiningFee: number;
  monthlyDues: number;
  annualDues?: number;
  minimumCommitmentMonths: number;
  minAge?: number;
  maxAge?: number;
  ageAsOfDate: 'JOIN_DATE' | 'YEAR_START' | 'BIRTHDAY';
  allowFamilyMembers: boolean;
  maxFamilyMembers: number;
  dependentMaxAge: number;
  spouseIncluded: boolean;
  allowGuests: boolean;
  maxGuestsPerVisit: number;
  maxGuestsPerMonth: number;
  guestFeeRequired: boolean;
  bookingAdvanceDays: number;
  priorityBooking: boolean;
  maxActiveBookings: number;
  hasVotingRights: boolean;
  canHoldOffice: boolean;
  isActive: boolean;
  acceptingApplications: boolean;
  waitlistEnabled: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### MembershipTier

```typescript
interface MembershipTier {
  id: string;
  membershipTypeId: string;
  name: string;
  code: string;
  description?: string;
  priceMultiplier: number;
  additionalMonthlyFee?: number;
  benefits: TierBenefits;
  canUpgradeTo: string[];
  canDowngradeTo: string[];
  upgradeWaitingPeriod: number;
  isActive: boolean;
  sortOrder: number;
}
```

### StatusTransitionConfig

```typescript
interface StatusTransitionConfig {
  fromStatus: MemberStatus;
  toStatus: MemberStatus;
  requiresApproval: boolean;
  approverRoles: string[];
  requiresPayment: boolean;
  requiresDocumentation: boolean;
  autoTransition: boolean;
  triggerCondition?: string;
  reinstatementFee?: number;
  prorationRules?: 'FULL' | 'PRORATED' | 'WAIVED';
  notifyMember: boolean;
  notifyStaff: boolean;
  notifyBoard: boolean;
  waitingPeriodDays: number;
  effectiveDate: 'IMMEDIATE' | 'END_OF_MONTH' | 'END_OF_BILLING';
}
```

### MemberStatus enum (canonical)

```typescript
// packages/types/src/entities/member.ts
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

## Business Rules

1. A member must always have exactly one membership type. Tier is optional.
2. MemberStatus transitions follow the defined state machine. Invalid transitions (e.g., PROSPECT directly to TERMINATED) must be rejected.
3. Auto-suspension triggers when `DAYS_OVERDUE >= suspensionTriggerDays` (default 91). The system checks nightly.
4. Reactivation from SUSPENDED requires full payment of outstanding balance plus reinstatement fee.
5. Resignation requires written notice (resignationNoticeDays), and the effective date is determined by `resignationEffectiveDate`.
6. Termination requires board action and is irreversible (no direct path back to ACTIVE; must go through REACTIVATED).
7. Corporate memberships have a pool of designees. Transfers are limited to `transfersPerYear` changes annually.
8. Household billing: when `consolidatedBilling` is true, all charges for household members roll up to the primary member's invoice.
9. Tier upgrades require the member to have been at the current tier for at least `upgradeWaitingPeriod` months.
10. Tier price multiplier applies to the base monthlyDues of the membership type (e.g., Gold 1.25x of Family base dues).
11. All enum values are UPPER_CASE, imported from `@clubvantage/types`. Display labels come from `packages/i18n`.
12. Member ID sequences are scoped per club (each club starts from M-0001).

## Member Portal Integration

**Plan**: `docs/plans/2026-02-06-member-portal-pwa-design.md`

- Bulk member import via CSV for initial portal provisioning
- Invitation email flow: staff triggers → member receives branded email → clicks to set password → onboarding walkthrough
- First-login onboarding: set notification preferences, add-to-home-screen prompt
- Portal account statuses: Invited, Active, Suspended, Deactivated
- Account suspension mirrors membership status changes automatically
- Staff can resend invitations, reset passwords, suspend/deactivate portal access
- Dependent accounts can be provisioned with limited access (no billing)
- Portal activation metrics tracked in Platform Manager (sent, opened, activated)

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Duplicate email during member creation | Return validation error; email must be unique per club |
| Member with outstanding balance attempts resignation | Allow resignation but flag outstanding balance; final invoice generated |
| Dependent reaches age-out threshold | System sends notifications at configured intervals (6, 3, 1 months before). After grace period, status changes to AGED_OUT. If conversionOfferEnabled, send conversion offer email. |
| Corporate designee leaves company | Primary contact can remove/replace designee. Replacement counts toward transfersPerYear limit. |
| Household primary member is terminated | System prompts to reassign primary to another household member or dissolve household |
| Member status changed while offline/concurrent edit | Use optimistic locking with `updatedAt` timestamp; reject if stale |
| Bulk status change includes members in invalid source states | Skip invalid members; return partial success report listing skipped members and reasons |
| Application approved but membership type at capacity | Place on waitlist if waitlistEnabled; notify applicant with position |
| Credit limit reached during POS transaction | Block transaction if creditBlockEnabled; show alert with current balance and limit |
| Tier downgrade with tier-specific perks already consumed | Allow downgrade; prorate benefits for remaining billing period; revoke future perks |
| Member re-applies after termination | Allow new application but flag previous termination; requires board review regardless of normal workflow |
| Multiple members claim same email across clubs | Allowed; email uniqueness is per-club, not global |
