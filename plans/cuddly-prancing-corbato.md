# Tee Sheet + Schedule Configuration Integration Plan

## Overview
Connect the live tee sheet to the new schedule configuration system so that operating hours, time periods, and twilight settings are respected when generating tee time slots.

**Problem**: The tee sheet currently uses hardcoded values (6am-5pm, 8-minute intervals) and ignores the schedule configuration.

**Solution**: Full-stack integration with GraphQL queries, frontend slot generation from config, and a time period filter.

---

## Implementation Plan

### Phase 1: Backend - GraphQL for Schedule Config

**1.1 Create Schedule Config Resolver**

File: `apps/api/src/graphql/schedule-config/schedule-config.resolver.ts` (NEW)

```graphql
type Query {
  getScheduleConfig(courseId: ID!): GolfScheduleConfig
  getEffectiveScheduleForDate(courseId: ID!, date: Date!): EffectiveSchedule
}

type Mutation {
  updateScheduleConfig(id: ID!, input: ScheduleConfigInput!): GolfScheduleConfig
  createTimePeriod(scheduleId: ID!, input: TimePeriodInput!): GolfScheduleTimePeriod
  updateTimePeriod(id: ID!, input: TimePeriodInput!): GolfScheduleTimePeriod
  deleteTimePeriod(id: ID!): Boolean
  createSeason(scheduleId: ID!, input: SeasonInput!): GolfScheduleSeason
  updateSeason(id: ID!, input: SeasonInput!): GolfScheduleSeason
  deleteSeason(id: ID!): Boolean
  createSpecialDay(scheduleId: ID!, input: SpecialDayInput!): GolfScheduleSpecialDay
  updateSpecialDay(id: ID!, input: SpecialDayInput!): GolfScheduleSpecialDay
  deleteSpecialDay(id: ID!): Boolean
}
```

**1.2 Create Schedule Config Service**

File: `apps/api/src/modules/schedule-config/schedule-config.service.ts` (NEW)

Key method - `getEffectiveScheduleForDate(courseId, date)`:
1. Fetch base `GolfScheduleConfig` for course
2. Check if `date` falls within any `GolfScheduleSeason` → apply overrides
3. Check if `date` matches any `GolfScheduleSpecialDay` → apply overrides
4. Return effective operating hours, time periods, twilight time

**1.3 Auto-create Config on Course Creation**

File: `apps/api/src/modules/golf/golf.service.ts` (MODIFY)

In `createCourse()`:
```typescript
// After creating course, create default schedule config
const scheduleConfig = await this.prisma.golfScheduleConfig.create({
  data: {
    courseId: course.id,
    weekdayFirstTee: '06:00',
    weekdayLastTee: '17:00',
    weekendFirstTee: '05:30',
    weekendLastTee: '17:30',
    twilightMode: 'FIXED',
    twilightMinutesBeforeSunset: 90,
    twilightFixedDefault: '16:00',
    defaultBookingWindowDays: 7,
    timePeriods: {
      create: DEFAULT_TIME_PERIODS // 5 default periods
    }
  }
})
```

---

### Phase 2: Frontend - Shared Slot Generation

**2.1 Extract Slot Generator to Utility**

File: `apps/application/src/lib/golf/schedule-utils.ts` (NEW)

Move `generateTeeTimeSlots()` from `schedule-preview.tsx` to shared utility:
```typescript
export function generateTeeTimeSlots(
  config: ScheduleConfig,
  date: Date,
  options?: { season?: Season; specialDay?: SpecialDay }
): TeeTimeSlot[]

export function convertSlotsToFlights(
  slots: TeeTimeSlot[],
  existingBookings?: GolfBooking[]
): Flight[]
```

**2.2 Update Schedule Preview**

File: `apps/application/src/components/golf/schedule-config/schedule-preview.tsx` (MODIFY)

Import and use shared utility instead of local function.

---

### Phase 3: Frontend - Tee Sheet Integration

**3.1 Update Golf Page**

File: `apps/application/src/app/(dashboard)/golf/page.tsx` (MODIFY)

Changes:
- Add `useGetScheduleConfigQuery(courseId)` hook
- Replace `generateMockTeeSheetData()` with config-aware generator
- Pass schedule config to tee sheet components

```typescript
// Before
const data = generateMockTeeSheetData(selectedDate)

// After
const { data: scheduleConfig } = useGetScheduleConfigQuery(selectedCourseId)
const slots = generateTeeTimeSlots(scheduleConfig, selectedDate)
const data = convertSlotsToFlights(slots, existingBookings)
```

**3.2 Add Time Period Filter**

File: `apps/application/src/components/golf/time-period-filter.tsx` (NEW)

Horizontal filter bar showing available time periods:
```
┌──────────────────────────────────────────────────────────────┐
│ Filter: [All] [Early Bird] [Prime AM] [Midday] [Prime PM] [Twilight] │
└──────────────────────────────────────────────────────────────┘
```

Features:
- "All" selected by default
- Prime time periods have amber highlight
- Clicking a period scrolls tee sheet to that time range
- Filter persists across date changes

**3.3 Integrate Filter into Tee Sheet Header**

File: `apps/application/src/app/(dashboard)/golf/page.tsx` (MODIFY)

Add `TimePeriodFilter` component below the view selector:
```tsx
<div className="flex items-center justify-between">
  <CourseSelector />
  <ViewSelector />
</div>
<TimePeriodFilter
  periods={scheduleConfig?.timePeriods}
  selectedPeriod={selectedPeriod}
  onSelect={setSelectedPeriod}
/>
<TeeSheetGrid
  flights={filteredFlights}
  highlightPeriod={selectedPeriod}
/>
```

---

### Phase 4: Connect Settings Tab

**4.1 Update Golf Settings Tab**

File: `apps/application/src/components/golf/settings-tab.tsx` (MODIFY)

Replace inline time settings with link to Schedule Config page:
```tsx
// Remove old interval/hours inputs
// Add button to open Schedule Config
<Button onClick={() => setShowScheduleConfig(true)}>
  Configure Schedule
</Button>

{showScheduleConfig && (
  <ScheduleConfigPage
    courseId={courseId}
    courseName={courseName}
    onBack={() => setShowScheduleConfig(false)}
    onSave={handleSaveConfig}
  />
)}
```

---

## Files Summary

### New Files
| File | Purpose |
|------|---------|
| `apps/api/src/graphql/schedule-config/schedule-config.resolver.ts` | GraphQL queries/mutations |
| `apps/api/src/modules/schedule-config/schedule-config.service.ts` | Business logic for configs |
| `apps/application/src/lib/golf/schedule-utils.ts` | Shared slot generation |
| `apps/application/src/components/golf/time-period-filter.tsx` | Period filter component |

### Modified Files
| File | Changes |
|------|---------|
| `apps/api/src/modules/golf/golf.service.ts` | Auto-create config on course creation |
| `apps/application/src/app/(dashboard)/golf/page.tsx` | Use config for slot generation, add filter |
| `apps/application/src/components/golf/schedule-config/schedule-preview.tsx` | Use shared utility |
| `apps/application/src/components/golf/settings-tab.tsx` | Link to schedule config page |

---

## Verification Steps

1. **Backend**: Run GraphQL playground, query `getScheduleConfig` for a course
2. **Default config**: Create new course, verify schedule config auto-created
3. **Slot generation**: Change time periods in config, verify preview updates
4. **Live tee sheet**: Navigate to golf page, verify slots match config
5. **Time filter**: Click period filter, verify tee sheet filters/scrolls
6. **Seasons**: Add season with different hours, select date in season, verify tee sheet uses season hours
7. **Special days**: Add holiday closure, select that date, verify tee sheet shows closed

---

## Test Commands

```bash
# Start dev server
pnpm dev

# Run GraphQL codegen (after adding new operations)
pnpm codegen

# Test backend
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "query { getScheduleConfig(courseId: \"course-1\") { id weekdayFirstTee timePeriods { name intervalMinutes } } }"}'
```

---

---
# ARCHIVE: Previous Audit Plan (Reference Only)
---

# Frontend-to-API Connection Audit & Implementation Plan

## Overview
Comprehensive audit of all frontend sections to verify API wiring and database connectivity. Plan to replace mock data with real Supabase/PostgreSQL connections.

---

## Audit Results Summary

### Backend Status: ✅ 100% Real Database
- All GraphQL resolvers connect to real PostgreSQL via Prisma
- 49 operations fully implemented (queries + mutations)
- No mock data in backend layer
- Seed data exists at `/database/prisma/seed.ts`
- Supabase used for authentication only (not business data)

### Admin Application Status

| Module | Status | Details |
|--------|--------|---------|
| **Dashboard** | ❌ Mock | KPIs, activity feed, insights all hardcoded |
| **Members** | ⚠️ Partial | Directory uses real API; applications/contracts mock |
| **Billing** | ⚠️ Partial | Invoices real; payment tabs mock |
| **Golf** | ⚠️ Partial | Courses real; tee sheet uses mock bookings |
| **Facility Bookings** | ✅ Real | Full API integration |
| **Bookings Admin** | ✅ Real | Facilities/Services/Staff tabs wired |
| **Reports** | ❌ Mock | UI only, no data fetching |
| **Settings** | ❌ Mock | Not implemented |
| **Users** | ❌ Mock | Not implemented |

### Member Portal Status

| Module | Status | Details |
|--------|--------|---------|
| **Bookings** | ⚠️ Partial | ~70% real; some mock fallbacks |
| **Golf** | ❌ Mock | Course data hardcoded |
| **Profile** | ❌ Mock | All member data hardcoded |
| **Statements** | ❌ Mock | Invoice list hardcoded |
| **Dining** | ❌ Mock | Not connected |

---

## Implementation Plan

### Phase 1: Quick Wins (Low Effort, High Impact)

**1.1 Dashboard KPIs**
Connect dashboard stats to existing aggregation queries.

Files to modify:
- `apps/application/src/app/(dashboard)/page.tsx`
- `apps/application/src/components/dashboard/stats-cards.tsx`

Backend queries needed:
- `getDashboardStats` - member count, revenue, bookings today
- Already exists or simple to add via Prisma count/aggregate

**1.2 Member Portal Profile**
Wire profile page to member context.

Files to modify:
- `apps/member-portal/src/app/portal/profile/page.tsx`
- `apps/member-portal/src/components/portal/profile-card.tsx`

API: Use existing `getMember` query with auth context

**1.3 Member Portal Statements**
Connect statements to billing API.

Files to modify:
- `apps/member-portal/src/app/portal/statements/page.tsx`

API: Use existing `getMemberInvoices` query

---

### Phase 2: Golf Module Connections

**2.1 Tee Sheet Real Data**
Replace mock tee times with real golf bookings.

Files to modify:
- `apps/application/src/app/(dashboard)/golf/page.tsx`
- `apps/application/src/components/golf/tee-sheet.tsx`

Backend:
- Add `getGolfBookings` query filtered by date/course
- Add `getTeeTimeAvailability` query

**2.2 Member Portal Golf**
Wire golf booking to real courses/tee times.

Files to modify:
- `apps/member-portal/src/app/portal/golf/page.tsx`
- `apps/member-portal/src/components/portal/golf-booking-wizard.tsx`

API: Use same queries as admin tee sheet

---

### Phase 3: Availability Queries (Backend Extension)

**3.1 Add Availability Query**
Currently missing from backend.

Files to create/modify:
- `apps/api/src/graphql/bookings/bookings.resolver.ts`
- `apps/api/src/modules/bookings/availability.service.ts`

New query:
```graphql
query getAvailability($input: AvailabilityInput!) {
  availability(input: $input) {
    date
    slots {
      startTime
      endTime
      available
      resourceId
    }
  }
}
```

**3.2 Wire to Frontend**
- Generate hooks via codegen
- Update booking wizards to use real availability

---

### Phase 4: Member Applications Module

**4.1 Connect Applications List**
Wire application pipeline to real data.

Files to modify:
- `apps/application/src/app/(dashboard)/members/applications/page.tsx`
- `apps/application/src/components/members/applications-table.tsx`

API: Use existing `getMemberApplications` query

**4.2 Application Detail/Edit**
Wire application forms to mutations.

Backend mutations needed:
- `updateMemberApplication`
- `approveMemberApplication`
- `rejectMemberApplication`

---

### Phase 5: Reports Module

**5.1 Add Report Queries**
Create aggregation queries for reports.

Files to create:
- `apps/api/src/graphql/reports/reports.resolver.ts`
- `apps/api/src/modules/reports/reports.service.ts`

Queries needed:
- `getRevenueReport(dateRange, groupBy)`
- `getMembershipReport(dateRange)`
- `getBookingReport(dateRange, facilityType)`
- `getUtilizationReport(dateRange, resourceIds)`

**5.2 Wire Reports UI**
Connect report components to queries.

Files to modify:
- `apps/application/src/app/(dashboard)/reports/page.tsx`
- `apps/application/src/components/reports/*.tsx`

---

### Phase 6: Billing Extended Features

**6.1 Payment Tabs**
Wire payment methods and history tabs.

Files to modify:
- `apps/application/src/components/billing/payments-tab.tsx`
- `apps/application/src/components/billing/payment-history.tsx`

API: Use existing `getPayments`, `getMemberPaymentMethods`

**6.2 AR Aging**
Connect accounts receivable aging.

Backend:
- Add `getARAgingReport` query

---

### Phase 7: Settings & Users Module

**7.1 Users Management**
Wire users table to auth/user queries.

Files to modify:
- `apps/application/src/app/(dashboard)/settings/users/page.tsx`

Backend:
- Add `getUsers`, `createUser`, `updateUser` via Supabase Auth Admin

**7.2 Settings Sections**
Connect club settings to database.

Backend:
- Add `getClubSettings`, `updateClubSettings` mutations
- Create `ClubSettings` Prisma model if not exists

---

## Seed Data Verification

Existing seed data at `/database/prisma/seed.ts` includes:
- Club configuration
- Members with various statuses
- Facilities (courts, pools, studios)
- Services with pricing
- Staff profiles
- Sample bookings
- Invoices and payments

**Action needed:** Verify seed data covers all modules being connected.

---

## Implementation Order (Priority)

| Order | Phase | Effort | Impact | Files |
|-------|-------|--------|--------|-------|
| 1 | 1.1 Dashboard KPIs | Low | High | 2 files |
| 2 | 1.2 Portal Profile | Low | Medium | 2 files |
| 3 | 1.3 Portal Statements | Low | Medium | 1 file |
| 4 | 4.1 Applications List | Medium | High | 2 files |
| 5 | 6.1 Payment Tabs | Medium | Medium | 2 files |
| 6 | 2.1 Golf Tee Sheet | Medium | High | 2 files + backend |
| 7 | 3.1-3.2 Availability | High | High | New resolver + service |
| 8 | 5.1-5.2 Reports | High | Medium | New module |
| 9 | 7.1-7.2 Settings/Users | High | Medium | New module |

---

## Key Files to Modify

### Admin Application
```
apps/application/src/
├── app/(dashboard)/
│   ├── page.tsx                    # Dashboard
│   ├── members/applications/       # Applications
│   ├── golf/page.tsx               # Tee sheet
│   └── reports/page.tsx            # Reports
├── components/
│   ├── dashboard/stats-cards.tsx   # KPI cards
│   ├── billing/payments-tab.tsx    # Payments
│   └── golf/tee-sheet.tsx          # Tee times
```

### Member Portal
```
apps/member-portal/src/
├── app/portal/
│   ├── profile/page.tsx            # Profile
│   ├── statements/page.tsx         # Statements
│   └── golf/page.tsx               # Golf booking
```

### API (Backend Extensions)
```
apps/api/src/
├── graphql/
│   ├── bookings/bookings.resolver.ts   # Add availability
│   └── reports/                        # New reports module
└── modules/
    ├── bookings/availability.service.ts
    └── reports/reports.service.ts
```

---

## Verification Steps

### Per Phase
1. **Dashboard**: Load dashboard, verify KPIs show real counts from DB
2. **Portal Profile**: Log in as member, verify profile shows their data
3. **Portal Statements**: Verify invoices list matches billing records
4. **Applications**: Create test application, verify in list
5. **Golf**: Book tee time, verify appears on tee sheet
6. **Reports**: Run report, verify data matches raw DB queries
7. **Settings**: Change setting, verify persists after refresh

### End-to-End
1. Run `pnpm db:seed` to populate test data
2. Start dev servers: `pnpm dev`
3. Log into admin app, verify all modules show real data
4. Log into member portal, verify member-specific data
5. Create booking in portal, verify appears in admin
6. Run billing report, verify totals match

---

## Dependencies

- Existing: Prisma, GraphQL codegen, React Query
- No new packages required
- Seed data already in place

## Notes

- Supabase is used for **authentication only**
- Business data stored in PostgreSQL via Prisma
- All backend resolvers already connect to real DB
- This plan focuses on wiring frontend to existing/new queries
