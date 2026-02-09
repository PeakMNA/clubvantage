# Bookings Section: Wire Frontend to Real API

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace all mock data in the Bookings section with real GraphQL API queries, completing the data integration for facilities, services, staff, waitlist tabs and the booking wizard.

**Architecture:** Each tab component currently uses inline `const mock*` arrays as default props. We replace these with React Query hooks (`useGetFacilitiesQuery`, `useGetServicesQuery`, `useGetBookingStaffQuery`, `useGetWaitlistQuery`) called from page-level components, then pass real data as props. Server actions with mock context functions (`getMemberContext`, `getServiceContext`, etc.) get replaced with actual GraphQL queries via the server-side client.

**Tech Stack:** Next.js 15 App Router, React Query (TanStack Query), GraphQL (code-first NestJS), `@clubvantage/api-client` generated hooks, `@clubvantage/ui` component library.

**Reference:** Feature spec at `docs/features/bookings/spec.md`, GraphQL operations at `packages/api-client/src/operations/bookings.graphql`.

---

## Batch 1: Wire Tab Components (Facilities, Services, Staff)

These three tabs have identical patterns: CRUD mutations are already wired to real GraphQL, but the list display uses hardcoded mock arrays. We add query hooks to each page component and pass real data as props.

---

### Task 1: Wire Facilities Tab to Real API

**Files:**
- Modify: `apps/application/src/app/(dashboard)/bookings/facilities/page.tsx`
- Modify: `apps/application/src/components/bookings/facilities-tab.tsx`

**Step 1: Add useGetFacilitiesQuery to facilities page**

In `apps/application/src/app/(dashboard)/bookings/facilities/page.tsx`, add the query import and pass data to FacilitiesTab:

```tsx
'use client'

import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { FacilitiesTab } from '@/components/bookings'
import {
  useGetFacilitiesQuery,
} from '@clubvantage/api-client'
import {
  createFacility,
  updateFacility,
  deleteFacility,
} from '../actions'
import type { CreateFacilityInput, UpdateFacilityInput, ResourceTypeEnum } from '@clubvantage/api-client'

export default function BookingsFacilitiesPage() {
  const queryClient = useQueryClient()
  const { data: facilitiesData, isLoading } = useGetFacilitiesQuery()

  // Map API facilities to component format
  const facilities = facilitiesData?.facilities?.map((f) => ({
    id: f.id,
    name: f.name,
    type: (f.type?.toLowerCase() || 'room') as 'court' | 'spa' | 'studio' | 'pool' | 'room',
    location: f.location || '',
    status: (f.isActive ? 'available' : 'closed') as 'available' | 'partial' | 'maintenance' | 'closed',
    schedule: {
      openTime: f.operatingHours?.[0]?.openTime || '6:00 AM',
      closeTime: f.operatingHours?.[0]?.closeTime || '9:00 PM',
      bookingsToday: 0,
      capacityToday: f.capacity || 0,
    },
    amenities: f.features || [],
  }))

  return (
    <div className="p-4 sm:p-6">
      <FacilitiesTab
        facilities={facilities}
        isLoading={isLoading}
        onViewSchedule={...}  // keep existing handlers
        // ... rest of existing handlers unchanged
      />
    </div>
  )
}
```

**Step 2: Add isLoading prop to FacilitiesTab component**

In `apps/application/src/components/bookings/facilities-tab.tsx`:

- Add `isLoading?: boolean` to `FacilitiesTabProps` interface (line 58)
- Use `facilities` prop (already supported, defaults to `mockFacilities`) - the mock data stays as fallback
- Add a loading skeleton when `isLoading` is true, before the grid renders

```tsx
export interface FacilitiesTabProps {
  facilities?: Facility[];
  isLoading?: boolean;  // ADD THIS
  // ... rest unchanged
}
```

Add loading state near the top of the component body:

```tsx
if (isLoading) {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}
```

**Step 3: Verify the page renders with real data**

Run: `cd clubvantage && pnpm --filter @clubvantage/application run dev`

Navigate to `/bookings/facilities`. Verify:
- Facilities load from database (seed data should exist)
- If no seed data, the page shows empty state (not mock data)
- Create/edit/delete still works (mutations were already wired)
- Loading spinner shows while fetching

**Step 4: Commit**

```bash
git add apps/application/src/app/\(dashboard\)/bookings/facilities/page.tsx apps/application/src/components/bookings/facilities-tab.tsx
git commit -m "feat(bookings): wire facilities tab to real GraphQL API"
```

---

### Task 2: Wire Services Tab to Real API

**Files:**
- Modify: `apps/application/src/app/(dashboard)/bookings/services/page.tsx`
- Modify: `apps/application/src/components/bookings/services-tab.tsx`

**Step 1: Add useGetServicesQuery to services page**

In `apps/application/src/app/(dashboard)/bookings/services/page.tsx`:

```tsx
import {
  useGetServicesQuery,
} from '@clubvantage/api-client'

// Inside component:
const { data: servicesData, isLoading } = useGetServicesQuery()

const services = servicesData?.services?.map((s) => ({
  id: s.id,
  name: s.name,
  category: (s.category?.toLowerCase() || 'wellness') as 'spa' | 'fitness' | 'sports' | 'wellness',
  description: s.description || '',
  duration: s.duration || 60,
  pricing: {
    basePrice: parseFloat(s.basePrice || '0'),
    memberPrice: s.memberPrice ? parseFloat(s.memberPrice) : undefined,
    guestSurcharge: s.guestSurcharge ? parseFloat(s.guestSurcharge) : undefined,
  },
  status: (s.isActive ? 'active' : 'inactive') as 'active' | 'inactive' | 'seasonal',
  bookingsThisWeek: 0,
  requiresStaff: s.requiresStaff ?? true,
  maxParticipants: s.maxParticipants ?? undefined,
}))
```

Pass `services={services}` and `isLoading={isLoading}` to `<ServicesTab>`.

**Step 2: Add isLoading prop to ServicesTab**

Same pattern as Task 1 - add `isLoading?: boolean` to `ServicesTabProps`, add loading spinner.

**Step 3: Verify services load from real API**

Navigate to `/bookings/services`. Verify list populates from database.

**Step 4: Commit**

```bash
git add apps/application/src/app/\(dashboard\)/bookings/services/page.tsx apps/application/src/components/bookings/services-tab.tsx
git commit -m "feat(bookings): wire services tab to real GraphQL API"
```

---

### Task 3: Wire Staff Tab to Real API

**Files:**
- Modify: `apps/application/src/app/(dashboard)/bookings/staff/page.tsx`
- Modify: `apps/application/src/components/bookings/staff-tab.tsx`

**Step 1: Add useGetBookingStaffQuery to staff page**

In `apps/application/src/app/(dashboard)/bookings/staff/page.tsx`:

```tsx
import {
  useGetBookingStaffQuery,
} from '@clubvantage/api-client'

// Inside component:
const { data: staffData, isLoading } = useGetBookingStaffQuery()

const staff = staffData?.bookingStaff?.map((s) => ({
  id: s.id,
  name: `${s.firstName} ${s.lastName}`,
  photoUrl: s.avatarUrl || undefined,
  role: (s.capabilities?.[0]?.name?.toLowerCase() || 'therapist') as 'therapist' | 'trainer' | 'instructor' | 'coach',
  status: (s.isActive ? 'available' : 'off_duty') as 'available' | 'busy' | 'off_duty' | 'on_leave',
  specialties: s.capabilities?.map((c) => c.name) || [],
  services: [],
  schedule: {
    startTime: s.workingHours?.[0]?.openTime || '9:00 AM',
    endTime: s.workingHours?.[0]?.closeTime || '6:00 PM',
    bookingsToday: 0,
    hoursBooked: 0,
    hoursAvailable: 8,
  },
  rating: undefined,
  phone: s.phone || undefined,
  email: s.email || undefined,
}))
```

Pass `staff={staff}` and `isLoading={isLoading}` to `<StaffTab>`.

**Step 2: Add isLoading prop to StaffTab**

Same pattern. Add `isLoading?: boolean` to `StaffTabProps`, add loading spinner.

**Step 3: Verify staff load from real API**

Navigate to `/bookings/staff`. Verify list populates from database.

**Step 4: Commit**

```bash
git add apps/application/src/app/\(dashboard\)/bookings/staff/page.tsx apps/application/src/components/bookings/staff-tab.tsx
git commit -m "feat(bookings): wire staff tab to real GraphQL API"
```

---

## Batch 2: Wire Waitlist Tab and Calendar Quick-Booking Services

---

### Task 4: Wire Waitlist Tab to Real API

**Files:**
- Modify: `apps/application/src/app/(dashboard)/bookings/waitlist/page.tsx`
- Modify: `apps/application/src/components/bookings/waitlist-tab.tsx`

**Step 1: Add useGetWaitlistQuery to waitlist page**

In `apps/application/src/app/(dashboard)/bookings/waitlist/page.tsx`:

```tsx
import {
  useGetWaitlistQuery,
  useSendWaitlistOfferMutation,
  useRemoveFromWaitlistMutation,
} from '@clubvantage/api-client'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function BookingsWaitlistPage() {
  const queryClient = useQueryClient()
  const { data: waitlistData, isLoading } = useGetWaitlistQuery({ first: 50 })

  const sendOfferMutation = useSendWaitlistOfferMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetWaitlist'] })
      toast.success('Offer sent to member')
    },
  })

  const removeMutation = useRemoveFromWaitlistMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GetWaitlist'] })
      toast.success('Removed from waitlist')
    },
  })

  const entries = waitlistData?.waitlist?.edges?.map((e) => {
    const w = e.node
    return {
      id: w.id,
      member: {
        id: w.member?.id || '',
        name: w.member ? `${w.member.firstName} ${w.member.lastName}` : 'Unknown',
        memberNumber: w.member?.memberId || '',
        phone: w.member?.phone || undefined,
        email: w.member?.email || undefined,
      },
      serviceType: (w.serviceType?.toLowerCase() || 'service') as 'service' | 'facility',
      serviceName: w.serviceName || '',
      preferredDate: new Date(w.preferredDate),
      preferredTimeRange: w.preferredTimeRange || '',
      position: w.position || 0,
      status: (w.status?.toLowerCase() || 'waiting') as 'waiting' | 'notified' | 'converted' | 'expired' | 'cancelled',
      createdAt: new Date(w.createdAt),
      notifiedAt: w.notifiedAt ? new Date(w.notifiedAt) : undefined,
      expiresAt: w.expiresAt ? new Date(w.expiresAt) : undefined,
      notes: w.notes || undefined,
    }
  }) || []

  return (
    <div className="p-4 sm:p-6">
      <WaitlistTab
        entries={entries}
        isLoading={isLoading}
        onNotify={async (id) => {
          await sendOfferMutation.mutateAsync({ id })
        }}
        onConvert={(id) => console.log('Convert to booking:', id)}
        onRemove={async (id) => {
          await removeMutation.mutateAsync({ id })
        }}
      />
    </div>
  )
}
```

**Step 2: Add isLoading prop to WaitlistTab**

In `apps/application/src/components/bookings/waitlist-tab.tsx`:
- Add `isLoading?: boolean` to `WaitlistTabProps`
- Add loading spinner when `isLoading` is true

**Step 3: Verify waitlist loads from real API**

Navigate to `/bookings/waitlist`. If no waitlist entries in DB, should show empty state.

**Step 4: Commit**

```bash
git add apps/application/src/app/\(dashboard\)/bookings/waitlist/page.tsx apps/application/src/components/bookings/waitlist-tab.tsx
git commit -m "feat(bookings): wire waitlist tab to real GraphQL API"
```

---

### Task 5: Replace Calendar Quick-Booking Mock Services

**Files:**
- Modify: `apps/application/src/app/(dashboard)/bookings/calendar/page.tsx`

**Step 1: Replace quickBookingServices mock with real data**

The calendar page already imports `useGetFacilitiesQuery`. It also needs services for quick-booking. We derive `quickBookingServices` from the facilities query or add a services query.

In `apps/application/src/app/(dashboard)/bookings/calendar/page.tsx`:

Remove the hardcoded array at lines 47-54:
```tsx
// DELETE THIS:
const quickBookingServices: QuickBookingService[] = [
  { id: 's1', name: 'Thai Massage', ...},
  ...
]
```

Add `useGetServicesQuery` import and derive the services:

```tsx
import {
  useGetCalendarDayQuery,
  useGetBookingQuery,
  useGetFacilitiesQuery,
  useGetServicesQuery,       // ADD
  useCheckInBookingMutation,
  useCancelBookingMutation,
  useRescheduleBookingMutation,
  useCreateBookingMutation,
  queryKeys,
} from '@clubvantage/api-client'

// Inside component, after existing queries:
const { data: servicesData } = useGetServicesQuery()

// Derive quick booking services from real data
const quickBookingServices: QuickBookingService[] = useMemo(() => {
  if (!servicesData?.services) return []
  return servicesData.services
    .filter((s) => s.isActive)
    .map((s) => ({
      id: s.id,
      name: s.name,
      duration: s.duration || 60,
      price: parseFloat(s.basePrice || '0'),
      category: s.category || 'Other',
    }))
}, [servicesData])
```

**Step 2: Verify quick-booking popover shows real services**

Navigate to `/bookings/calendar`. Click a time slot to open quick-booking popover. Verify services list comes from the database.

**Step 3: Commit**

```bash
git add apps/application/src/app/\(dashboard\)/bookings/calendar/page.tsx
git commit -m "feat(bookings): replace calendar quick-booking mock with real services query"
```

---

## Batch 3: Wire Booking Wizard Picker Steps

---

### Task 6: Wire BookingPickerStep to Real Data

**Files:**
- Modify: `apps/application/src/components/bookings/booking-picker-step.tsx`
- Modify: parent component that renders BookingPickerStep (likely `create-booking-wizard.tsx` or `create-booking-modal.tsx`)

**Step 1: Identify the parent that renders BookingPickerStep**

Search for `<BookingPickerStep` to find where it's rendered and how props are passed. The parent should fetch real data and pass it as `facilities` and `services` props.

**Step 2: Keep mock data as fallback, add real data flow**

The component already accepts optional `facilities` and `services` props with mock defaults. The fix is in the **parent component** - it needs to fetch real data and pass it down.

Find the wizard/modal parent. Add queries:

```tsx
import { useGetFacilitiesQuery, useGetServicesQuery } from '@clubvantage/api-client'

// Inside parent:
const { data: facilitiesData } = useGetFacilitiesQuery()
const { data: servicesData } = useGetServicesQuery()

const facilities = facilitiesData?.facilities?.map((f) => ({
  id: f.id,
  name: f.name,
  type: (f.type?.toLowerCase() || 'room') as 'court' | 'spa' | 'studio' | 'pool' | 'room',
  location: f.location || '',
  status: (f.isActive ? 'available' : 'maintenance') as 'available' | 'partial' | 'maintenance',
}))

const services = servicesData?.services?.map((s) => ({
  id: s.id,
  name: s.name,
  category: s.category || 'Other',
  duration: s.duration || 60,
  price: parseFloat(s.basePrice || '0'),
  available: s.isActive ?? true,
}))

// Pass to BookingPickerStep:
<BookingPickerStep
  facilities={facilities}
  services={services}
  ...
/>
```

**Step 3: Verify wizard picker shows real data**

Open the booking wizard modal. In the picker step, verify facilities and services come from database.

**Step 4: Commit**

```bash
git add <parent-component> apps/application/src/components/bookings/booking-picker-step.tsx
git commit -m "feat(bookings): wire booking picker step to real facilities and services"
```

---

### Task 7: Wire BookingFacilityStep to Real Data

**Files:**
- Modify: `apps/application/src/components/bookings/booking-facility-step.tsx`
- Modify: parent component that renders BookingFacilityStep

**Step 1: Pass real facilities from parent**

Same approach as Task 6. The parent wizard component should pass fetched facilities to `BookingFacilityStep`:

```tsx
const facilitiesForBooking = facilitiesData?.facilities?.map((f) => ({
  id: f.id,
  name: f.name,
  type: (f.type?.toLowerCase() || 'room') as 'court' | 'spa' | 'studio' | 'pool' | 'room',
  location: f.location || '',
  status: (f.isActive ? 'available' : 'maintenance') as 'available' | 'partial' | 'maintenance',
  operatingHours: f.operatingHours?.[0] ? {
    start: f.operatingHours[0].openTime || '06:00',
    end: f.operatingHours[0].closeTime || '21:00',
  } : undefined,
  slotsAvailable: f.capacity || 0,
  totalSlots: f.capacity || 0,
}))

<BookingFacilityStep facilities={facilitiesForBooking} ... />
```

**Step 2: Verify facility selection step shows real data**

Open booking wizard, select a service-first flow, reach the facility selection step. Verify facilities are real.

**Step 3: Commit**

```bash
git add <parent-component> apps/application/src/components/bookings/booking-facility-step.tsx
git commit -m "feat(bookings): wire booking facility step to real data"
```

---

## Batch 4: Replace Server Action Mock Contexts

---

### Task 8: Replace searchMembers Mock in actions.ts

**Files:**
- Modify: `apps/application/src/app/(dashboard)/bookings/actions.ts`

**Step 1: Replace searchMembers() with real GraphQL query**

The function at line 673 searches 8 hardcoded mock members. Replace with a GraphQL query. First, check if a `SearchMembers` query exists in the API client. If not, use the existing `GetMembers` query with a search filter.

Replace lines 673-704 in actions.ts:

```typescript
export async function searchMembers(query: string): Promise<SearchMemberResult[]> {
  'use server'
  if (!query || query.length < 2) return []

  const client = getServerClient()
  const { data } = await client.request(SearchMembersDocument, { search: query, first: 10 })

  return (data?.members?.edges || []).map((e: { node: MemberNode }) => ({
    id: e.node.id,
    name: `${e.node.firstName} ${e.node.lastName}`,
    memberNumber: e.node.memberId || '',
    photoUrl: e.node.photoUrl || undefined,
    status: e.node.status || 'ACTIVE',
  }))
}
```

If `SearchMembersDocument` doesn't exist, define it inline (same pattern as existing mutations in the file):

```typescript
const SearchMembersDocument = `
  query SearchMembers($search: String, $first: Int) {
    members(search: $search, first: $first) {
      edges {
        node {
          id
          memberId
          firstName
          lastName
          photoUrl
          status
        }
      }
    }
  }
`
```

**Step 2: Verify member search works**

Open calendar, click a time slot for quick-booking. Type a member name. Verify real members appear from the database.

**Step 3: Commit**

```bash
git add apps/application/src/app/\(dashboard\)/bookings/actions.ts
git commit -m "feat(bookings): replace mock searchMembers with real GraphQL query"
```

---

### Task 9: Replace Context Mock Functions in actions.ts

**Files:**
- Modify: `apps/application/src/app/(dashboard)/bookings/actions.ts`

**Step 1: Replace getMemberContext() with real query (line 264)**

```typescript
export const getMemberContext = cache(async (memberId: string): Promise<MemberContext | null> => {
  const client = getServerClient()
  const { data } = await client.request(GetMemberContextDocument, { id: memberId })
  if (!data?.member) return null
  return {
    id: data.member.id,
    name: `${data.member.firstName} ${data.member.lastName}`,
    memberNumber: data.member.memberId,
    status: data.member.status,
    tierName: data.member.membershipType || 'Standard',
    discountPct: 0,
  }
})
```

Define `GetMemberContextDocument` inline if not importable.

**Step 2: Replace getServiceContext() with real query (line 280)**

```typescript
export const getServiceContext = cache(async (serviceId: string): Promise<ServiceContext | null> => {
  const client = getServerClient()
  const { data } = await client.request(GetServiceContextDocument, { id: serviceId })
  if (!data?.service) return null
  return {
    id: data.service.id,
    name: data.service.name,
    durationMinutes: data.service.duration || 60,
    bufferMinutes: data.service.bufferTime || 15,
    basePrice: parseFloat(data.service.basePrice || '0'),
    requiresStaff: data.service.requiresStaff ?? true,
  }
})
```

**Step 3: Replace getStaffContext() with real query (line 297)**

```typescript
export const getStaffContext = cache(async (staffId: string): Promise<StaffContext | null> => {
  const client = getServerClient()
  const { data } = await client.request(GetStaffContextDocument, { id: staffId })
  if (!data?.bookingStaffMember) return null
  return {
    id: data.bookingStaffMember.id,
    name: `${data.bookingStaffMember.firstName} ${data.bookingStaffMember.lastName}`,
    capabilities: (data.bookingStaffMember.capabilities || []).map((c: { name: string; level: string }) => ({
      name: c.name,
      level: c.level,
    })),
  }
})
```

**Step 4: Replace getFacilityContext() with real query (line 352)**

```typescript
export const getFacilityContext = cache(async (facilityId: string): Promise<FacilityContext | null> => {
  const client = getServerClient()
  const { data } = await client.request(GetFacilityContextDocument, { id: facilityId })
  if (!data?.facility) return null
  return {
    id: data.facility.id,
    name: data.facility.name,
    type: data.facility.type,
    operatingHours: (data.facility.operatingHours || []).map((h: OperatingHour) => ({
      dayOfWeek: h.dayOfWeek,
      openTime: h.openTime,
      closeTime: h.closeTime,
    })),
  }
})
```

**Step 5: Replace fetchExistingBookings() with real query (line 402)**

```typescript
export async function fetchExistingBookings(
  staffId: string,
  date: string
): Promise<ExistingBooking[]> {
  const client = getServerClient()
  const { data } = await client.request(GetStaffBookingsDocument, { staffId, date })
  return (data?.bookings?.edges || []).map((e: { node: BookingNode }) => ({
    id: e.node.id,
    startTime: e.node.startTime,
    endTime: e.node.endTime,
    status: e.node.status,
    serviceName: e.node.service?.name || '',
  }))
}
```

**Step 6: Replace getServicesForStaff() with real query (line 709)**

```typescript
export async function getServicesForStaff(staffId: string): Promise<StaffService[]> {
  const client = getServerClient()
  const { data } = await client.request(GetServicesForStaffDocument, { staffId })
  return (data?.services || []).map((s: ServiceNode) => ({
    id: s.id,
    name: s.name,
    category: s.category || 'Other',
    duration: s.duration || 60,
    price: parseFloat(s.basePrice || '0'),
  }))
}
```

**NOTE:** Some of these GraphQL documents may need to be added to `packages/api-client/src/operations/bookings.graphql` first (e.g., `GetServiceContext`, `GetStaffBookings`). Check what's available vs what needs to be created. If the backend resolvers support these queries, add the operations; if not, this task depends on backend additions.

**Step 7: Verify booking validation flow works end-to-end**

Test the full quick-booking flow:
1. Open calendar
2. Click time slot
3. Search for a member (real search)
4. Select a service
5. Confirm booking

**Step 8: Commit**

```bash
git add apps/application/src/app/\(dashboard\)/bookings/actions.ts
git commit -m "feat(bookings): replace all mock context functions with real GraphQL queries"
```

---

### Task 10: Final Verification and Cleanup

**Files:**
- Review: All files modified in Tasks 1-9

**Step 1: Search for remaining mock data**

```bash
cd apps/application/src
grep -rn "mockFacilities\|mockServices\|mockStaff\|mockEntries\|quickBookingServices" --include="*.tsx" --include="*.ts"
```

Verify all mock arrays are either:
- Removed entirely, OR
- Only used as default prop fallbacks (acceptable safety net)

**Step 2: Search for remaining TODO comments**

```bash
grep -rn "TODO.*Replace with actual\|TODO.*database query" app/\(dashboard\)/bookings/actions.ts
```

Verify all TODO comments from the original mock functions are resolved.

**Step 3: Type-check the bookings section**

```bash
cd clubvantage
pnpm --filter @clubvantage/application exec tsc --noEmit --project tsconfig.json
```

Fix any type errors.

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore(bookings): remove unused mock data and resolve TODO comments"
```

---

## Dependencies & Prerequisites

Before starting, verify:

1. **API is running** with seeded data:
   ```bash
   cd clubvantage/apps/api && pnpm run dev
   ```

2. **Database has booking seed data** (facilities, services, staff):
   ```bash
   cd clubvantage/database && npx prisma db seed
   ```

3. **API client hooks are generated** and exported:
   ```bash
   pnpm --filter @clubvantage/api-client run codegen
   ```

4. **Required hooks exist** in `@clubvantage/api-client`:
   - `useGetFacilitiesQuery` ✅
   - `useGetServicesQuery` ✅
   - `useGetBookingStaffQuery` ✅
   - `useGetWaitlistQuery` ✅
   - `useSendWaitlistOfferMutation` ✅
   - `useRemoveFromWaitlistMutation` ✅

## Risk Notes

- **GraphQL schema mismatch:** If the generated types don't match what the resolver returns, type errors will appear during Step 3 of Task 10. Fix by checking `apps/api/src/graphql/booking/` resolvers and regenerating.
- **Missing seed data:** If facilities/services/staff tables are empty, tabs will show empty states instead of mock data. This is correct behavior — seed data should exist.
- **Server action GraphQL documents:** The inline GraphQL documents in `actions.ts` (lines 55-191) define their own operation names. Ensure these don't conflict with the ones in `packages/api-client/src/operations/bookings.graphql`.
