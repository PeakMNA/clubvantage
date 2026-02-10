# Bookings Tab Redesign — Entry-Point-Driven Flows

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current wizard-based booking system with 4 tabs (Facility, Service, Staff, Bookings), each providing a different entry point into booking creation using shared, reusable page-level components.

**Architecture:** Entry-point-driven flows. Three booking tabs (Facility, Service, Staff) each start from a different view but share the same underlying components — the facility picker, service picker, and staff picker are identical everywhere. A fourth Bookings tab provides multi-view read access to all bookings. The old wizard modal and Quick Book sheet are removed.

**Tech Stack:** Next.js App Router, React, TanStack Query, shadcn/ui Sheet/Dialog, Tailwind CSS, existing GraphQL API (8 queries, 17 mutations — all backend is production-ready)

---

## Current State

### What Exists (Keep/Reuse)
- `CalendarDayView` — time grid with resources as columns, 15-min slots, drag-drop support
- `BookingBlock` — booking card with status styling
- `BookingDetailPanel` — sidebar panel for viewing booking details
- `booking-provider.tsx` — context provider (needs refactoring)
- All GraphQL hooks — `useGetCalendarDayQuery`, `useGetFacilitiesQuery`, `useGetServicesQuery`, `useGetBookingStaffQuery`, `useGetBookingsQuery`, `useCreateBookingMutation`, etc.
- Server actions — `searchMembers`, `getAvailableSlots`, `validateBooking`, `calculateBookingPrice`, `prepareQuickBooking`
- CRUD modals — `FacilityModal`, `ServiceModal`, `StaffModal`, `EquipmentModal`

### What Gets Removed
- `create-booking-wizard.tsx` — multi-step wizard
- `create-booking-modal.tsx` — wizard modal wrapper
- `booking-picker-step.tsx`, `booking-facility-step.tsx`, `booking-service-by-staff-step.tsx`, `booking-staff-step.tsx`, `booking-time-step.tsx`, `booking-addons-step.tsx`, `booking-confirmation-step.tsx` — all wizard steps
- `quick-booking-popover.tsx` → replaced by new booking sheet
- Wizard state in `BookingProvider` (currentStep, bookingType, isStaffFlow, needsFacility)

### What Gets Created
- 4 new tab pages under `/bookings/`
- 3 shared picker components (facility, service, staff)
- Unified search bar component
- POS-style service panel
- Staff schedule sheet
- Booking creation sheet (replaces wizard)
- Bookings list/card/calendar views

---

## Tab Structure

```
/bookings/
├── facility/page.tsx     ← Facility tab (calendar grid by facility type)
├── service/page.tsx      ← Service tab (POS panel + staff schedule)
├── staff/page.tsx        ← Staff tab (staff schedule + time selection)
├── list/page.tsx         ← Bookings tab (all bookings, multi-view)
├── layout.tsx            ← Shared layout with tab bar
└── actions.ts            ← Server actions (existing, extend)
```

### Tab Bar
```
[ Facility ]  [ Service ]  [ Staff ]  [ Bookings ]
```

---

## Shared Components

These 3 components are **identical** regardless of which tab uses them:

### 1. Unified Facility Picker (`shared/facility-picker.tsx`)
- Grid of facilities grouped by type (sub-tabs: Courts, Pools, Rooms, Studios)
- Each facility shows: name, capacity, status indicator, availability for selected time
- Click to select → highlights → passes selection up
- Used by: Facility tab (primary view), Service tab (step 3), Staff tab (step 4)

### 2. Unified Service Picker (`shared/service-picker.tsx`)
- POS-style configurable panel with service cards
- Search bar with keyboard shortcut support (focus with `/` or `Ctrl+K`)
- Services grouped by category with visual icons
- Shows: name, duration, price, availability count
- Click to select → highlights → passes selection up
- Used by: Service tab (primary view), Facility tab (step 2 optional), Staff tab (step 3)

### 3. Unified Staff Picker (`shared/staff-picker.tsx`)
- Staff schedule sheet showing all qualified staff for the day
- Each staff row: avatar, name, role, capabilities, timeline of bookings
- Search bar to filter staff
- Click open slot on timeline to select staff + time
- Auto-suggest: highlights best available staff based on skills and load
- Used by: Staff tab (primary view), Facility tab (step 3 optional), Service tab (step 2)

### 4. Unified Search Bar (`shared/booking-search-bar.tsx`)
- Single search component used within each picker
- Searches the relevant entity (facilities, services, or staff)
- Keyboard-navigable results list
- Focus shortcut: `/` key
- Consistent design across all pickers

### 5. Booking Creation Sheet (`shared/booking-creation-sheet.tsx`)
- Slide-in Sheet (right side) for confirming a new booking
- Pre-filled with selections from the active flow
- Member search (existing `searchMembers` server action)
- Shows pricing breakdown (existing `calculateBookingPrice`)
- Optional equipment add-ons
- Notes field
- Confirm button → `useCreateBookingMutation`

---

## Flow Details

### Facility Tab

**URL:** `/bookings/facility`

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ [ Courts ] [ Pools ] [ Rooms ] [ Studios ]    ← facility type  │
│                                                sub-tabs         │
├──────┬──────────┬──────────┬──────────┬──────────┬─────────────┤
│ Time │ Court 1  │ Court 2  │ Court 3  │ Court 4  │             │
├──────┼──────────┼──────────┼──────────┼──────────┤             │
│ 9:00 │          │ ████████ │          │          │  Detail     │
│ 9:15 │          │ Tennis   │          │ ████████ │  Panel      │
│ 9:30 │          │ M-042    │          │ Yoga     │  (right)    │
│ 9:45 │ ████████ │          │          │ M-108    │             │
│10:00 │ Lesson   │          │          │          │             │
│10:15 │ M-221    │          │          │          │             │
└──────┴──────────┴──────────┴──────────┴──────────┴─────────────┘
```

**Click behavior:**
- **Occupied slot** → `BookingDetailPanel` opens on right (existing component)
- **Empty slot** → Opens `BookingCreationSheet` pre-filled with facility + time
  - Optional: add a service (opens Service Picker inline)
  - Optional: add a trainer/staff (opens Staff Picker inline or auto-suggest)
  - Optional: add equipment (ball machine, etc.)
  - Select member → confirm

**Data source:** `useGetCalendarDayQuery` filtered by facility type sub-tab

---

### Service Tab

**URL:** `/bookings/service`

**Layout:**
```
┌────────────────────────────────────────────────────────────────┐
│ [  🔍 Search services...  (/)  ]     [ Day ▾ ]  [ ◀ Feb 10 ▶ ]│
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │  💆     │  │  🎾     │  │  🏋️     │  │  🏊     │          │
│  │ Thai    │  │ Tennis  │  │ PT      │  │ Swim    │          │
│  │ Massage │  │ Lesson  │  │ Session │  │ Lesson  │          │
│  │ 60min   │  │ 60min   │  │ 45min   │  │ 30min   │          │
│  │ ฿1,500  │  │ ฿800    │  │ ฿1,200  │  │ ฿600    │          │
│  │ 3 avail │  │ 5 avail │  │ 2 avail │  │ 4 avail │          │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘          │
│                                                                │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│  │  💆     │  │  🧘     │  │  💅     │  │  🎱     │          │
│  │ Swedish │  │ Yoga    │  │ Mani    │  │ Billiard│          │
│  │ Massage │  │ Private │  │ Pedi    │  │ Lesson  │          │
│  │ 90min   │  │ 60min   │  │ 45min   │  │ 60min   │          │
│  │ ฿2,000  │  │ ฿900    │  │ ฿800    │  │ ฿500    │          │
│  │ 1 avail │  │ 4 avail │  │ 3 avail │  │ 6 avail │          │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘          │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Click a service card** → Staff Schedule Sheet slides in:
```
┌────────────────────────────────────────────────────────────────┐
│ Thai Massage — Available Staff for Feb 10                      │
│ [  🔍 Search staff...  ]                                       │
├────────────────────────────────────────────────────────────────┤
│ 👤 Nari S.    │ 9:00  10:00  11:00  12:00  1:00  2:00  3:00  │
│   Expert      │ ░░░░  ████   ████   lunch  ░░░░  ░░░░  ████  │
│               │ avail Thai   Thai         avail avail  Swed. │
├───────────────┤                                                │
│ 👤 Somchai T. │ 9:00  10:00  11:00  12:00  1:00  2:00  3:00  │
│   Expert      │ ████  ░░░░   ░░░░   lunch  ████  ░░░░  ░░░░  │
│               │ Thai  avail  avail        Thai  avail  avail │
├───────────────┤                                                │
│ 👤 Ploy K.   │ 9:00  10:00  11:00  12:00  1:00  2:00  3:00  │
│   Intermediate│ ░░░░  ░░░░   ████   lunch  ░░░░  ████  ░░░░  │
│               │ avail avail  Aroma        avail Thai   avail │
└────────────────────────────────────────────────────────────────┘
```

**Click an available slot** → Facility/equipment popup:
- Auto-assigns best available facility for the service
- Shows required equipment (auto-reserved) and optional equipment
- Opens `BookingCreationSheet` pre-filled with service + staff + time + facility

**Data sources:**
- `useGetServicesQuery` — service catalog
- `useGetBookingStaffQuery` — staff filtered by service capabilities
- `useGetCalendarDayQuery` — staff bookings for the day

---

### Staff Tab

**URL:** `/bookings/staff`

**Layout:**
```
┌────────────────────────────────────────────────────────────────┐
│ [  🔍 Search staff...  ]                      [ ◀ Feb 10 ▶ ]  │
├────────────────────────────────────────────────────────────────┤
│ 👤 Nari S.        │ 9:00  10:00  11:00  12:00  1:00  2:00    │
│   Spa Therapist   │ ░░░░  ████   ████   lunch  ░░░░  ░░░░    │
│   Thai, Swedish   │ avail Thai   Thai         avail avail    │
│                   │       M-042  M-108               █auto   │
├───────────────────┤                                            │
│ 👤 Coach John     │ 9:00  10:00  11:00  12:00  1:00  2:00    │
│   Tennis Coach    │ ████  ░░░░   ████   lunch  ░░░░  ████    │
│   Tennis, Fitness │ Lesson avail Lesson       avail  Lesson  │
│                   │ M-221       M-042               M-108    │
├───────────────────┤                                            │
│ 👤 Ploy K.       │ 9:00  10:00  11:00  12:00  1:00  2:00    │
│   Fitness Trainer │ ░░░░  ░░░░   ████   lunch  ░░░░  ████    │
│   PT, Yoga, Swim  │ avail avail  PT          avail  Yoga     │
│                   │              M-177              M-042    │
└────────────────────────────────────────────────────────────────┘
```

**Click an available slot on a staff row:**
1. Service Picker opens — filtered to services this staff can perform
2. After selecting service → Facility popup (auto-assign or manual pick)
3. Optional equipment selection
4. `BookingCreationSheet` opens pre-filled with staff + time + service + facility

**Data sources:**
- `useGetBookingStaffQuery` — all staff
- `useGetCalendarDayQuery` — bookings for the day (per staff)
- `useGetServicesQuery` — filtered by staff capabilities

---

### Bookings Tab

**URL:** `/bookings/list`

**Views:** Cards | List | Day | Week | Month

**Cards View:**
```
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│ BK-001 │  │ BK-002 │  │ BK-003 │  │ BK-004 │
│ Tennis  │  │ Thai   │  │ PT Ses │  │ Yoga   │
│ Court 1 │  │ Spa 1  │  │ Gym    │  │ Studio │
│ 9:00   │  │ 10:00  │  │ 11:00  │  │ 14:00  │
│ M-042  │  │ M-108  │  │ M-221  │  │ M-177  │
│ ●Conf  │  │ ●Chk'd │  │ ●Pend  │  │ ●Conf  │
└────────┘  └────────┘  └────────┘  └────────┘
```

**List View:** Table with columns: Booking #, Member, Service, Facility, Staff, Time, Status, Actions

**Day/Week/Month Views:** Calendar-style views showing all bookings across all resources

**Filters:** Status, date range, facility, service, staff, member search

**Data source:** `useGetBookingsQuery` with pagination

---

## Implementation Batches

### Batch 1: Foundation & Shared Components (Tasks 1-5)

Restructure the tab layout and build the reusable components that all tabs share.

### Batch 2: Facility Tab (Tasks 6-8)

The most similar to what exists — extend CalendarDayView with facility type sub-tabs and the new booking creation flow.

### Batch 3: Service Tab (Tasks 9-11)

POS-style panel with service cards, staff schedule sheet, and facility/equipment assignment.

### Batch 4: Staff Tab (Tasks 12-13)

Staff schedule view with service and facility selection flow.

### Batch 5: Bookings Tab (Tasks 14-15)

Multi-view bookings list with filters.

### Batch 6: Cleanup (Task 16)

Remove old wizard components and unused code.

---

## Tasks

### Task 1: Restructure Tab Layout & Routes

**Files:**
- Modify: `apps/application/src/app/(dashboard)/bookings/layout.tsx`
- Modify: `apps/application/src/app/(dashboard)/bookings/page.tsx`
- Modify: `apps/application/src/components/bookings/tabs.ts`
- Create: `apps/application/src/app/(dashboard)/bookings/facility/page.tsx`
- Create: `apps/application/src/app/(dashboard)/bookings/service/page.tsx`
- Create: `apps/application/src/app/(dashboard)/bookings/staff/page.tsx`
- Create: `apps/application/src/app/(dashboard)/bookings/list/page.tsx`

**Steps:**

**Step 1:** Update `tabs.ts` to define the new 4-tab structure:
```typescript
export const bookingTabs = [
  { id: 'facility', label: 'Facility', href: '/bookings/facility' },
  { id: 'service', label: 'Service', href: '/bookings/service' },
  { id: 'staff', label: 'Staff', href: '/bookings/staff' },
  { id: 'bookings', label: 'Bookings', href: '/bookings/list' },
] as const;
```

**Step 2:** Update `layout.tsx`:
- Keep `BookingProvider` wrapper
- Replace tab navigation with new 4-tab bar
- Remove "New Booking" button (booking happens within each tab)

**Step 3:** Update `page.tsx` redirect from `/bookings` → `/bookings/facility` (default tab)

**Step 4:** Create stub pages for each new route (skeleton with tab title for now)

**Step 5:** Verify navigation works between all 4 tabs

---

### Task 2: Refactor BookingProvider

**Files:**
- Modify: `apps/application/src/components/bookings/booking-provider.tsx`

**Steps:**

**Step 1:** Remove wizard state and actions:
- Remove: `wizard` state (currentStep, bookingType, isStaffFlow, needsFacility, all selections)
- Remove: `openWizard`, `closeWizard`, `setWizardStep`, `goToNextStep`, `goToPreviousStep`, `resetWizard`
- Remove: `setBookingType`, `selectFacility`, `selectService`, `selectStaff`, `setWizardDate`, `setWizardTime`, `toggleAddOn`, `selectVariation`, `selectMember`, `setNeedsFacility`

**Step 2:** Add booking creation sheet state:
```typescript
interface BookingCreationState {
  isOpen: boolean;
  prefilled: {
    facilityId?: string;
    facilityName?: string;
    serviceId?: string;
    serviceName?: string;
    staffId?: string;
    staffName?: string;
    date?: Date;
    startTime?: string;
    endTime?: string;
  };
}
```

**Step 3:** Add actions:
```typescript
openBookingSheet(prefilled: BookingCreationState['prefilled']): void;
closeBookingSheet(): void;
```

**Step 4:** Keep existing state that's still needed:
- `activeTab`, `setActiveTab`
- `selectedDate`, `viewMode`
- `detail` (BookingDetailPanel state)
- `checkInModal`

**Step 5:** Verify TypeScript compiles with updated interface

---

### Task 3: Build Unified Search Bar

**Files:**
- Create: `apps/application/src/components/bookings/shared/booking-search-bar.tsx`

**Steps:**

**Step 1:** Create `BookingSearchBar` component:
```typescript
interface BookingSearchBarProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (item: SearchResult) => void;
  results?: SearchResult[];
  isLoading?: boolean;
  className?: string;
}
```

**Step 2:** Implement features:
- Input with search icon and clear button
- Keyboard shortcut: `/` focuses the search bar (when not in another input)
- Arrow key navigation through results
- Enter to select highlighted result
- Escape to close results dropdown
- Debounced search (300ms)

**Step 3:** Style with shadcn/ui `Input` + `Command` palette pattern (Tailwind, stone/amber palette)

---

### Task 4: Build Booking Creation Sheet

**Files:**
- Create: `apps/application/src/components/bookings/shared/booking-creation-sheet.tsx`

**Steps:**

**Step 1:** Create sheet component that replaces both the wizard modal and the quick-booking popover:
```typescript
interface BookingCreationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilled: {
    facilityId?: string;
    facilityName?: string;
    serviceId?: string;
    serviceName?: string;
    staffId?: string;
    staffName?: string;
    date?: Date;
    startTime?: string;
    endTime?: string;
  };
}
```

**Step 2:** Sheet layout (right side, ~400px wide):
- **Header:** "New Booking" with pre-filled context summary
- **Member Section:** Search bar using existing `searchMembers` server action
- **Selections Summary:** Shows facility, service, staff, time (with edit buttons to change)
- **Optional Add-ons:** Service picker (if no service selected), staff picker (if no staff), equipment
- **Pricing:** Auto-calculated via `calculateBookingPrice` server action
- **Notes:** Optional text area
- **Actions:** Cancel / Confirm button

**Step 3:** Wire to `useCreateBookingMutation` on confirm

**Step 4:** On success: close sheet, show toast, invalidate calendar queries

---

### Task 5: Build Staff Schedule Component

**Files:**
- Create: `apps/application/src/components/bookings/shared/staff-schedule.tsx`

**Steps:**

**Step 1:** Create reusable staff schedule component:
```typescript
interface StaffScheduleProps {
  date: Date;
  /** Filter to staff who can perform this service */
  serviceId?: string;
  /** Operating hours for the day */
  operatingHours: { start: string; end: string };
  /** Callback when user clicks an available slot */
  onSlotSelect: (staffId: string, staffName: string, time: string) => void;
  className?: string;
}
```

**Step 2:** Layout — each staff member is a row:
- Left column: avatar, name, role, capabilities (or skill level for filtered service)
- Right side: horizontal timeline with 30-min or 15-min slots
- Booked slots: filled with service name + member ID
- Available slots: clickable with hover highlight
- Blocked time: grey (lunch, off-hours from `workingSchedule`)

**Step 3:** Data fetching:
- `useGetBookingStaffQuery` with filter for service capabilities when `serviceId` provided
- `useGetCalendarDayQuery` for each staff member's bookings on the date
- Show loading skeleton while data loads

**Step 4:** Include `BookingSearchBar` at top for filtering staff by name

**Step 5:** Auto-suggest: staff sorted by skill level (EXPERT first), then by availability (least booked first)

---

### Task 6: Build Facility Tab Page

**Files:**
- Modify: `apps/application/src/app/(dashboard)/bookings/facility/page.tsx`

**Steps:**

**Step 1:** Layout structure:
- **Facility type sub-tabs** at top: "All", then one per facility category (Courts, Spa, Studio, Pool, Room)
- **Date picker** + day/week toggle
- **CalendarDayView** grid filtered by selected facility type
- **BookingDetailPanel** on right (existing component)
- **BookingCreationSheet** (from Task 4)

**Step 2:** Fetch facilities with `useGetFacilitiesQuery`, group by category for sub-tabs

**Step 3:** Fetch calendar data with `useGetCalendarDayQuery` filtered by selected facility type

**Step 4:** Click handlers:
- **Empty slot** → `openBookingSheet({ facilityId, facilityName, date, startTime })`
- **Occupied slot** → `openBookingDetail(booking)`

**Step 5:** Apply `max-h-[calc(100vh-220px)]` for scrollable grid area

---

### Task 7: Add Optional Service/Staff/Equipment to Booking Sheet

**Files:**
- Modify: `apps/application/src/components/bookings/shared/booking-creation-sheet.tsx`

**Steps:**

**Step 1:** Add collapsible "Add Service" section:
- When expanded, shows `ServicePicker` inline (compact grid of service cards)
- Search bar for quick find
- Selecting a service auto-suggests qualified staff

**Step 2:** Add collapsible "Add Staff" section:
- When expanded, shows filtered staff list (qualified for selected service)
- Auto-suggest from available staff sorted by skill + load
- Or "Auto-assign" toggle to let system pick

**Step 3:** Add collapsible "Equipment" section:
- Shows required equipment for the service (auto-reserved, read-only)
- Shows optional equipment (ball machine, etc.) as checkboxes
- Uses existing `equipment-tab.tsx` patterns

**Step 4:** Pricing updates dynamically as selections change

---

### Task 8: Wire Facility Tab to Real API

**Files:**
- Modify: `apps/application/src/app/(dashboard)/bookings/facility/page.tsx`

**Steps:**

**Step 1:** Replace any mock data with real GraphQL queries

**Step 2:** Wire `useCreateBookingMutation` through the booking sheet

**Step 3:** Wire `useRescheduleBookingMutation` for drag-drop (existing from calendar audit)

**Step 4:** Wire real-time subscription via `useBookingSubscription` for live updates

**Step 5:** TypeScript check: `cd apps/application && npx tsc --noEmit`

---

### Task 9: Build Service Tab — POS Panel

**Files:**
- Modify: `apps/application/src/app/(dashboard)/bookings/service/page.tsx`
- Create: `apps/application/src/components/bookings/shared/service-pos-panel.tsx`

**Steps:**

**Step 1:** Create `ServicePosPanel` — configurable grid of service cards:
```typescript
interface ServicePosPanelProps {
  date: Date;
  onServiceSelect: (service: { id: string; name: string; duration: number; price: number }) => void;
  className?: string;
}
```

**Step 2:** Card design:
- Icon (by category), service name, duration, price
- Availability count for selected date (number of possible slots)
- Amber highlight on hover, selected state
- Responsive grid: 4 columns on desktop, 2 on mobile

**Step 3:** Features:
- `BookingSearchBar` at top — filters services in real-time
- Category filter chips (Spa, Tennis, Fitness, Swimming, etc.)
- Keyboard support: arrow keys to navigate cards, Enter to select
- Date selector with day/week/month toggle

**Step 4:** Data: `useGetServicesQuery` with category filter

---

### Task 10: Build Service Tab — Staff Schedule Flow

**Files:**
- Modify: `apps/application/src/app/(dashboard)/bookings/service/page.tsx`

**Steps:**

**Step 1:** When a service is selected in the POS panel, show the `StaffSchedule` component (from Task 5) filtered to staff qualified for that service

**Step 2:** Layout transition: POS panel slides left or shrinks, Staff Schedule appears alongside or replaces (responsive)

**Step 3:** When user clicks an available slot on a staff row:
- Auto-assign best facility for the service (query available facilities for that time)
- Show facility confirmation popup if multiple options, or auto-assign if only one
- Open `BookingCreationSheet` pre-filled with: service + staff + time + facility

**Step 4:** "Back" button to return to POS panel and pick a different service

---

### Task 11: Wire Service Tab to Real API

**Files:**
- Modify: `apps/application/src/app/(dashboard)/bookings/service/page.tsx`

**Steps:**

**Step 1:** Wire `useGetServicesQuery` for the POS panel

**Step 2:** Wire `useGetBookingStaffQuery` filtered by service capabilities

**Step 3:** Wire `useGetCalendarDayQuery` for staff bookings on the date

**Step 4:** Wire `useGetFacilitiesQuery` for facility auto-assignment

**Step 5:** TypeScript check: `cd apps/application && npx tsc --noEmit`

---

### Task 12: Build Staff Tab Page

**Files:**
- Modify: `apps/application/src/app/(dashboard)/bookings/staff/page.tsx`

**Steps:**

**Step 1:** Layout:
- Date picker at top right
- `BookingSearchBar` for staff search
- `StaffSchedule` component (from Task 5) — shows ALL staff (no service filter)

**Step 2:** Click an available slot on a staff row:
- Opens a service picker popup/sheet — filtered to services this staff can perform
- `useGetServicesQuery` filtered by staff capabilities (use `getServicesForStaff` server action)

**Step 3:** After selecting service:
- Auto-assign facility (or show facility picker if multiple options)
- Optional equipment selection
- Open `BookingCreationSheet` pre-filled with: staff + time + service + facility

---

### Task 13: Wire Staff Tab to Real API

**Files:**
- Modify: `apps/application/src/app/(dashboard)/bookings/staff/page.tsx`

**Steps:**

**Step 1:** Wire `useGetBookingStaffQuery` for all active staff

**Step 2:** Wire calendar data per staff member

**Step 3:** Wire `getServicesForStaff` server action for service filtering

**Step 4:** Wire facility auto-assignment queries

**Step 5:** TypeScript check: `cd apps/application && npx tsc --noEmit`

---

### Task 14: Build Bookings Tab — Multi-View

**Files:**
- Modify: `apps/application/src/app/(dashboard)/bookings/list/page.tsx`
- Create: `apps/application/src/components/bookings/views/booking-card-view.tsx`
- Create: `apps/application/src/components/bookings/views/booking-list-view.tsx`
- Create: `apps/application/src/components/bookings/views/booking-calendar-views.tsx`

**Steps:**

**Step 1:** Create view toggle: Cards | List | Day | Week | Month

**Step 2:** **Cards View** — grid of booking cards:
- Booking number, service name, facility, staff, time, member, status badge
- Click card → `BookingDetailPanel`
- Responsive: 4 columns desktop, 2 tablet, 1 mobile

**Step 3:** **List View** — data table:
- Columns: #, Member, Service, Facility, Staff, Date/Time, Status, Actions
- Sortable columns, pagination
- Row click → `BookingDetailPanel`
- Use existing table patterns from billing/members

**Step 4:** **Day/Week/Month Views** — calendar displays:
- Reuse `CalendarDayView` for day view (all resources)
- Week view: 7 columns, compact booking blocks
- Month view: date cells with booking count dots

**Step 5:** Filters bar:
- Status filter (multi-select chips)
- Date range picker
- Facility filter dropdown
- Service filter dropdown
- Staff filter dropdown
- Member search

---

### Task 15: Wire Bookings Tab to Real API

**Files:**
- Modify: `apps/application/src/app/(dashboard)/bookings/list/page.tsx`

**Steps:**

**Step 1:** Wire `useGetBookingsQuery` with all filter parameters

**Step 2:** Implement pagination (cursor-based, matching API)

**Step 3:** Wire `useGetBookingStatsQuery` for summary cards at top

**Step 4:** Wire `useGetCalendarDayQuery` for day/week/month calendar views

**Step 5:** TypeScript check: `cd apps/application && npx tsc --noEmit`

---

### Task 16: Cleanup — Remove Old Wizard

**Files:**
- Delete: `apps/application/src/components/bookings/create-booking-wizard.tsx`
- Delete: `apps/application/src/components/bookings/create-booking-modal.tsx`
- Delete: `apps/application/src/components/bookings/booking-picker-step.tsx`
- Delete: `apps/application/src/components/bookings/booking-facility-step.tsx`
- Delete: `apps/application/src/components/bookings/booking-service-by-staff-step.tsx`
- Delete: `apps/application/src/components/bookings/booking-staff-step.tsx`
- Delete: `apps/application/src/components/bookings/booking-time-step.tsx`
- Delete: `apps/application/src/components/bookings/booking-addons-step.tsx`
- Delete: `apps/application/src/components/bookings/booking-confirmation-step.tsx`
- Delete: `apps/application/src/components/bookings/calendar/quick-booking-popover.tsx`
- Modify: `apps/application/src/components/bookings/index.ts` — remove wizard exports
- Modify: `apps/application/src/components/bookings/dynamic-modals.tsx` — remove wizard modal

**Steps:**

**Step 1:** Remove all wizard component files

**Step 2:** Update barrel exports in `index.ts`

**Step 3:** Remove wizard modal from `dynamic-modals.tsx`

**Step 4:** Remove old calendar route: `apps/application/src/app/(dashboard)/bookings/calendar/page.tsx` (replaced by facility tab)

**Step 5:** Remove old management tab routes if they were standalone pages and are now integrated:
- Check if `/bookings/facilities/page.tsx`, `/bookings/services/page.tsx`, `/bookings/staff/page.tsx` should move to settings or remain as admin CRUD pages under a different path

**Step 6:** TypeScript check: `cd apps/application && npx tsc --noEmit`

**Step 7:** Commit

---

## Verification Plan

After each batch:
1. `cd apps/application && npx tsc --noEmit` — zero new type errors
2. Manual verification: navigate between all 4 tabs, test core flow
3. Commit the batch

Final verification:
1. All 4 tabs render and navigate correctly
2. Facility tab: click empty slot → booking sheet → create booking → appears on grid
3. Service tab: search/click service → staff schedule → click slot → facility auto-assign → confirm
4. Staff tab: click staff slot → pick service → facility → confirm
5. Bookings tab: all 5 views render, filters work, pagination works
6. Drag-drop rescheduling still works on facility tab
7. Booking detail panel opens from all entry points
8. Old wizard is completely removed with no dead imports

---

## Files Modified Summary

| Batch | Files Created | Files Modified | Files Deleted |
|-------|--------------|----------------|---------------|
| 1 (Foundation) | 6 | 4 | 0 |
| 2 (Facility) | 0 | 2 | 0 |
| 3 (Service) | 1 | 1 | 0 |
| 4 (Staff) | 0 | 1 | 0 |
| 5 (Bookings) | 3 | 1 | 0 |
| 6 (Cleanup) | 0 | 2 | 11 |
| **Total** | **10** | **11** | **11** |
