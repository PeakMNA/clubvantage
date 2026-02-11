# Phase 1 (Closed Beta) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete all 9 Phase 1 features required for Closed Beta launch with 3-5 early adopter clubs.

**Architecture:** Wire existing backend services (Reports, Settings, Users) to GraphQL resolvers, create frontend hooks to replace mock data, add feature flags infrastructure, error boundaries, and verify multi-tenant isolation.

**Tech Stack:** NestJS GraphQL (API), Next.js 14 (Frontend), Prisma (ORM), Redis (Caching), TanStack React Query (Data fetching)

---

## Current State Assessment

| Feature | Backend | Frontend | Gap |
|---------|---------|----------|-----|
| Reports Dashboard | REST service (5 report types, 298 LOC) | 22 components, 9 pages (mock data) | Need GraphQL resolvers + hooks |
| Settings Module | REST service (6 areas, 203 LOC) | 16 components, 2 pages (mock data) | Need GraphQL resolvers + hooks |
| User Management | REST service (full CRUD, 326 LOC) | 9 components, 7 pages (mock data) | Need GraphQL resolvers + hooks |
| Feature Flags | Mock only in member portal | None in staff app | Need full system |
| Tier Limits | Club model has maxMembers/maxUsers | None | Need enforcement layer |
| Audit Logging | EventStore + AuditInterceptor exist | None | Need coverage audit |
| Multi-tenant | RLS + TenantContext exist | N/A | Need verification |
| Error Boundaries | 3 exist (global, dashboard, members) | 7+ routes missing | Need error.tsx files |
| Club Onboarding | None | None | Need full flow |

---

## Batch 1: GraphQL Resolvers for Reports, Settings, Users (Backend Wiring)

These three modules have complete REST services but no GraphQL resolvers. The frontend uses GraphQL exclusively. Follow the pattern established by existing resolvers (e.g., `graphql/billing/billing.resolver.ts`).

### Task 1: Create Reports GraphQL Module

**Files:**
- Create: `apps/api/src/graphql/reports/reports.module.ts`
- Create: `apps/api/src/graphql/reports/reports.resolver.ts`
- Create: `apps/api/src/graphql/reports/dto/report-filters.input.ts`
- Create: `apps/api/src/graphql/reports/dto/report-types.ts`
- Modify: `apps/api/src/graphql/graphql.module.ts` (register new module)

**Pattern:** Follow `graphql/billing/billing.resolver.ts` — use `@UseGuards(GqlAuthGuard)`, `@CurrentUser()` decorator, inject service from `modules/reports/reports.service.ts`.

**Queries to expose:**
- `reportsDashboard(clubId: ID!): DashboardStats` — wraps `getDashboardStats()`
- `financialReport(clubId: ID!, startDate: String!, endDate: String!): FinancialReport` — wraps `getFinancialReport()`
- `membershipReport(clubId: ID!): MembershipReport` — wraps `getMembershipReport()`
- `arAgingReport(clubId: ID!): ARAgingReport` — wraps `getARAgingReport()`
- `golfUtilizationReport(clubId: ID!, startDate: String!, endDate: String!): GolfUtilizationReport` — wraps `getGolfUtilizationReport()`

**GraphQL Object Types to create:**
```typescript
@ObjectType()
class DashboardStats {
  members: MemberStats
  financial: FinancialStats
  bookings: BookingStats
}

@ObjectType()
class FinancialReport {
  period: ReportPeriod
  invoices: InvoiceSummary
  payments: PaymentSummary
  byChargeType: [ChargeTypeBreakdown]
}

// ... similar for MembershipReport, ARAgingReport, GolfUtilizationReport
```

**Step 1:** Create the GraphQL object types in `dto/report-types.ts`
**Step 2:** Create the input types in `dto/report-filters.input.ts`
**Step 3:** Create the resolver in `reports.resolver.ts`
**Step 4:** Create the module in `reports.module.ts` (import ReportsModule from modules)
**Step 5:** Register in `graphql.module.ts`
**Step 6:** Verify: Start API briefly to regenerate schema.gql

### Task 2: Create Settings GraphQL Module

**Files:**
- Create: `apps/api/src/graphql/settings/settings.module.ts`
- Create: `apps/api/src/graphql/settings/settings.resolver.ts`
- Create: `apps/api/src/graphql/settings/dto/settings-types.ts`
- Create: `apps/api/src/graphql/settings/dto/update-settings.input.ts`
- Modify: `apps/api/src/graphql/graphql.module.ts` (register new module)

**Queries to expose:**
- `clubProfile(clubId: ID!): ClubProfile`
- `billingSettings(clubId: ID!): BillingSettings`
- `membershipTypes(clubId: ID!): [MembershipTypeWithTiers]`
- `chargeTypes(clubId: ID!): [ChargeType]`
- `settingsFacilities(clubId: ID!): [FacilityWithResources]`
- `settingsGolfCourses(clubId: ID!): [GolfCourseWithRates]`

**Mutations to expose:**
- `updateClubProfile(input: UpdateClubProfileInput!): ClubProfile`
- `updateBillingSettings(input: UpdateBillingSettingsInput!): BillingSettings`

**Step 1:** Create GraphQL object types in `dto/settings-types.ts`
**Step 2:** Create input types in `dto/update-settings.input.ts` (with class-validator decorators)
**Step 3:** Create resolver
**Step 4:** Create module
**Step 5:** Register in `graphql.module.ts`
**Step 6:** Verify: Start API briefly to regenerate schema.gql

### Task 3: Create Users GraphQL Module

**Files:**
- Create: `apps/api/src/graphql/users/users.module.ts`
- Create: `apps/api/src/graphql/users/users.resolver.ts`
- Create: `apps/api/src/graphql/users/dto/user-types.ts`
- Create: `apps/api/src/graphql/users/dto/user-inputs.ts`
- Modify: `apps/api/src/graphql/graphql.module.ts` (register new module)

**Queries to expose:**
- `users(clubId: ID!, search: String, role: String, page: Int, limit: Int): UserListResult`
- `user(clubId: ID!, id: ID!): User`
- `userActivityLog(clubId: ID!, page: Int, limit: Int): ActivityLogResult`

**Mutations to expose:**
- `createUser(input: CreateUserInput!): User`
- `updateUser(id: ID!, input: UpdateUserInput!): User`
- `lockUser(id: ID!, minutes: Int!): StatusMessage`
- `unlockUser(id: ID!): StatusMessage`
- `deleteUser(id: ID!): StatusMessage`

**Step 1:** Create GraphQL object types
**Step 2:** Create input types with validators
**Step 3:** Create resolver
**Step 4:** Create module
**Step 5:** Register in `graphql.module.ts`
**Step 6:** Verify schema regeneration

### Task 4: Run GraphQL Codegen

After all three GraphQL modules are registered:

**Step 1:** Start API to regenerate schema.gql
```bash
cd apps/api && pnpm run dev  # Let it start, then stop
```
**Step 2:** Run codegen for API client
```bash
pnpm --filter @clubvantage/api-client run codegen
```
**Step 3:** Verify generated types exist in `packages/api-client/`

---

## Batch 2: Frontend Hooks & Data Wiring

Replace mock data in all three modules with real GraphQL queries.

### Task 5: Create Reports Hooks & Wire Pages

**Files:**
- Create: `apps/application/src/hooks/use-reports.ts`
- Modify: `apps/application/src/app/(dashboard)/reports/dashboard/page.tsx`
- Modify: `apps/application/src/app/(dashboard)/reports/financial/page.tsx`
- Modify: `apps/application/src/app/(dashboard)/reports/membership/page.tsx`
- Modify: `apps/application/src/app/(dashboard)/reports/receivables/page.tsx`
- Modify: `apps/application/src/app/(dashboard)/reports/revenue/page.tsx`
- Modify: `apps/application/src/app/(dashboard)/reports/collections/page.tsx`
- Modify: `apps/application/src/app/(dashboard)/reports/wht/page.tsx`

**Step 1:** Create `use-reports.ts` with hooks:
- `useReportsDashboard(clubId)` — queries reportsDashboard
- `useFinancialReport(clubId, startDate, endDate)` — queries financialReport
- `useMembershipReport(clubId)` — queries membershipReport
- `useARAgingReport(clubId)` — queries arAgingReport
- `useGolfUtilizationReport(clubId, startDate, endDate)` — queries golfUtilizationReport

**Step 2:** Wire dashboard/page.tsx — replace `defaultKpis` with `useReportsDashboard`
**Step 3:** Wire financial/page.tsx — replace mock revenue centers with `useFinancialReport`
**Step 4:** Wire remaining pages one-by-one

**Note:** For reports that don't have a direct backend match (revenue breakdown, collections, WHT), keep mock data with a `// TODO: add backend endpoint` comment. Wire what maps directly.

### Task 6: Create Settings Hooks & Wire Pages

**Files:**
- Create: `apps/application/src/hooks/use-settings.ts`
- Modify: `apps/application/src/components/settings/club-profile-section.tsx`
- Modify: `apps/application/src/components/settings/billing-defaults-section.tsx`
- Modify other settings sections that map to existing API endpoints

**Step 1:** Create `use-settings.ts` with hooks:
- `useClubProfile(clubId)` — queries clubProfile
- `useBillingSettings(clubId)` — queries billingSettings
- `useUpdateClubProfile()` — mutation
- `useUpdateBillingSettings()` — mutation
- `useMembershipTypes(clubId)` — queries membershipTypes
- `useChargeTypes(clubId)` — queries chargeTypes

**Step 2:** Wire club-profile-section.tsx — replace mockClubProfile with useClubProfile
**Step 3:** Wire billing-defaults-section.tsx — replace mockBillingDefaults with useBillingSettings
**Step 4:** Wire save handlers with mutations (replace console.log)

**Note:** Sections without a backend match (localization, branding, notifications, integrations, GL mapping, audit trail config) keep mock data with TODO comments.

### Task 7: Create Users Hooks & Wire Pages

**Files:**
- Create: `apps/application/src/hooks/use-users.ts`
- Modify: `apps/application/src/components/users/users-tab.tsx`
- Modify: `apps/application/src/components/users/add-user-modal.tsx`
- Modify: `apps/application/src/components/users/user-detail-modal.tsx`
- Modify: `apps/application/src/components/users/activity-tab.tsx`

**Step 1:** Create `use-users.ts` with hooks:
- `useUsers(clubId, options)` — queries users list with search/filter/pagination
- `useUser(clubId, id)` — queries single user
- `useCreateUser()` — mutation
- `useUpdateUser()` — mutation
- `useLockUser()` — mutation
- `useUnlockUser()` — mutation
- `useDeleteUser()` — mutation
- `useActivityLog(clubId, options)` — queries userActivityLog

**Step 2:** Wire users-tab.tsx — replace mockUsers with useUsers, add real search/filter
**Step 3:** Wire add-user-modal.tsx — replace console.log with useCreateUser mutation
**Step 4:** Wire user-detail-modal.tsx — replace with useUser + useUpdateUser
**Step 5:** Wire activity-tab.tsx — replace mockActivityEntries with useActivityLog

**Note:** Roles and permissions tabs keep mock data (no backend RBAC endpoints yet). Security tab keeps mock data (no 2FA/session API yet).

---

## Batch 3: Error Boundaries

### Task 8: Add Error Boundaries to All Dashboard Routes

**Files to create:**
- `apps/application/src/app/(dashboard)/reports/error.tsx`
- `apps/application/src/app/(dashboard)/settings/error.tsx`
- `apps/application/src/app/(dashboard)/users/error.tsx`
- `apps/application/src/app/(dashboard)/billing/error.tsx`
- `apps/application/src/app/(dashboard)/bookings/error.tsx`
- `apps/application/src/app/(dashboard)/pos/error.tsx`
- `apps/application/src/app/(dashboard)/golf/error.tsx`
- `apps/application/src/app/(dashboard)/marketing/error.tsx`

**Pattern:** Copy from `apps/application/src/app/(dashboard)/members/error.tsx` and adjust section name/icon.

Each error.tsx should:
1. Be a `'use client'` component
2. Log error to console (placeholder for error reporting service)
3. Show error message with retry button
4. Show section-specific icon and "Go back" navigation
5. Show stack trace in development mode only

---

## Batch 4: Feature Flags Infrastructure

### Task 9: Create Feature Flags Service (API)

**Files:**
- Create: `apps/api/src/modules/feature-flags/feature-flags.service.ts`
- Create: `apps/api/src/modules/feature-flags/feature-flags.module.ts`
- Create: `apps/api/src/graphql/feature-flags/feature-flags.resolver.ts`
- Create: `apps/api/src/graphql/feature-flags/feature-flags.module.ts`
- Create: `apps/api/src/graphql/feature-flags/dto/feature-flag-types.ts`
- Modify: `apps/api/src/graphql/graphql.module.ts`

**Design:**
The Club model already has `features: Json @default("{}")`. Use this field to store feature flag configuration per club. Redis caches the resolved flags.

```typescript
// Feature flag categories aligned with subscription tiers
interface ClubFeatureFlags {
  // Module-level flags (controlled by subscription tier)
  modules: {
    golf: boolean;
    bookings: boolean;
    billing: boolean;
    marketing: boolean;
    pos: boolean;
    reports: boolean;
  };
  // Feature-level flags (controlled by tier + operational)
  features: {
    golfLottery: boolean;       // Growth+
    memberWindows: boolean;     // Growth+
    aiDynamicPricing: boolean;  // Scale
    automatedFlows: boolean;    // Growth+
    memberPricing: boolean;     // Growth+
    houseAccounts: boolean;     // Growth+
    whiteLabelApp: boolean;     // Scale
    customDomain: boolean;      // Scale
  };
  // Operational flags (togglable by staff)
  operational: {
    maintenanceMode: boolean;
    newMemberRegistration: boolean;
    onlineBooking: boolean;
    emailCampaigns: boolean;
  };
}
```

**Service methods:**
- `getFeatureFlags(clubId)` — Redis-cached (5min TTL), falls back to DB
- `isFeatureEnabled(clubId, featureKey)` — Single check
- `getDefaultFlagsForTier(tier)` — Returns tier defaults
- `updateOperationalFlag(clubId, key, value)` — Staff can toggle operational flags

**Resolver queries/mutations:**
- `featureFlags(clubId: ID!): FeatureFlags` — Query
- `updateOperationalFlag(clubId: ID!, key: String!, value: Boolean!): FeatureFlags` — Mutation

### Task 10: Create Tier Limits Enforcement

**Files:**
- Create: `apps/api/src/common/guards/tier-limits.guard.ts`
- Create: `apps/api/src/common/decorators/tier-limit.decorator.ts`
- Modify: `apps/api/src/graphql/members/members.resolver.ts` (add member limit check)
- Modify: `apps/api/src/graphql/users/users.resolver.ts` (add user limit check)

**Design:**
Club model already has `maxMembers: Int @default(500)` and `maxUsers: Int @default(10)`. Create a guard that checks current count vs limit before create operations.

```typescript
@Injectable()
export class TierLimitsGuard implements CanActivate {
  // Check current count vs Club.maxMembers or Club.maxUsers
  // Return 403 with upgrade message if limit reached
  // Check at 80% for warning, 90% for persistent banner
}

// Decorator usage:
@TierLimit('members')  // checks maxMembers
@Mutation(() => Member)
async createMember(...) { ... }
```

### Task 11: Create Frontend Feature Flag Hook

**Files:**
- Create: `apps/application/src/hooks/use-feature-flags.ts`
- Create: `apps/application/src/components/common/feature-gate.tsx`
- Create: `apps/application/src/components/common/upgrade-prompt.tsx`

**Design:**
```typescript
// Hook
export function useFeatureFlags() {
  // Query featureFlags from API
  // Cache in React Query
  // Return { flags, isFeatureEnabled(key), isLoading }
}

// Gate component
export function FeatureGate({ feature, children, fallback }: {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;  // defaults to UpgradePrompt
}) {
  const { isFeatureEnabled } = useFeatureFlags();
  return isFeatureEnabled(feature) ? children : (fallback || <UpgradePrompt feature={feature} />);
}
```

---

## Batch 5: Audit Logging & Multi-tenant Verification

### Task 12: Audit Coverage for Financial Operations

**Files:**
- Modify: `apps/api/src/graphql/billing/billing.resolver.ts` (add @Audit decorators)
- Modify: `apps/api/src/graphql/pos-config/pos-config.resolver.ts` (add @Audit decorators)
- Verify: `apps/api/src/common/interceptors/audit.interceptor.ts` captures mutations

**Step 1:** Add `@Audit({ action: 'CREATE_INVOICE', entityType: 'Invoice' })` to billing mutations
**Step 2:** Add `@Audit({ action: 'VOID_INVOICE', entityType: 'Invoice' })` to void/cancel operations
**Step 3:** Add `@Audit({ action: 'RECORD_PAYMENT', entityType: 'Payment' })` to payment mutations
**Step 4:** Add audit decorators to POS settlement operations
**Step 5:** Verify audit interceptor captures old/new values on updates

### Task 13: Multi-tenant Isolation Verification

**Verify existing isolation:**
- Check all GraphQL resolvers filter by `clubId` from `@CurrentUser().tenantId`
- Check RLS policies are applied to all tenant-scoped tables
- Verify no resolver accepts `clubId` as a user-provided parameter (must come from JWT)

**Files to audit:**
- All files in `apps/api/src/graphql/*/` resolvers
- `database/prisma/rls-policies.sql`

**Step 1:** Review each resolver's Query/Mutation methods for tenant scoping
**Step 2:** Create a checklist of tables and verify RLS coverage
**Step 3:** Document any gaps found

---

## Priority Order

| Priority | Task | Impact | Effort |
|----------|------|--------|--------|
| 1 | Task 1-3: GraphQL Resolvers | HIGH | Medium |
| 2 | Task 4: Codegen | HIGH | Low |
| 3 | Task 5-7: Frontend Hooks | HIGH | Medium |
| 4 | Task 8: Error Boundaries | MEDIUM | Low |
| 5 | Task 9: Feature Flags API | HIGH | Medium |
| 6 | Task 10: Tier Limits | MEDIUM | Low |
| 7 | Task 11: Feature Flags Frontend | MEDIUM | Low |
| 8 | Task 12: Audit Coverage | MEDIUM | Low |
| 9 | Task 13: Multi-tenant Verification | HIGH | Low |

---

## Verification Checklist

After all tasks complete:

- [ ] Reports dashboard loads with real data from API
- [ ] Settings page loads club profile from API, saves work
- [ ] Users list loads from API, create/edit/delete work
- [ ] All dashboard routes have error boundaries
- [ ] Feature flags resolve from Club.features JSON
- [ ] Member/user creation blocked when tier limit reached
- [ ] Financial operations create audit log entries
- [ ] No resolver allows cross-tenant data access
