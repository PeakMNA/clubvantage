# Bookings / Section Overview

## Overview

The Bookings section is a unified resource and service booking platform for country clubs. It manages facility reservations (courts, pools, rooms), service appointments (spa, fitness, wellness), staff scheduling, equipment inventory, and waitlist management. The system enforces a triple-constraint model: every service booking requires a valid **Staff + Room + Time** combination.

## Status

| Capability | UI | CRUD Mutations | Data Queries | Real-Time |
|---|---|---|---|---|
| Calendar | Done | Done | Done | Partial (subscription stubbed) |
| Facilities Management | Done | Done (GraphQL) | **Mock** | N/A |
| Services Management | Done | Done (GraphQL) | **Mock** | N/A |
| Staff Management | Done | Done (GraphQL) | **Mock** | N/A |
| Equipment | Done | Done (GraphQL) | Done (GraphQL) | N/A |
| Waitlist | Done | **Mock** | **Mock** | N/A |
| Booking Wizard | Done | Done (via calendar) | **Mock** (picker, facility steps) | N/A |

**Summary:** CRUD mutations for Facilities/Services/Staff are wired to real GraphQL. All list/read queries for these tabs still use hardcoded mock data. Equipment is fully wired. Waitlist has no API integration. Calendar is the most API-integrated page.

## Capabilities

### 1. Calendar / Day View (`calendar/spec.md`)
- Day grid with 15-min time slots, resource columns
- Quick-booking popover with member search
- Booking detail side panel (check-in, cancel, reschedule)
- Real-time WebSocket subscription (partial)
- Drag-and-drop reschedule (planned)

### 2. Facility Management (`facilities/spec.md`)
- Grid/list views with type icons and status badges
- CRUD operations via GraphQL mutations
- Operating hours per day of week
- Feature/amenity management, capacity tracking
- Maintenance mode toggle, revenue center assignment

### 3. Service Management (`services/spec.md`)
- Grid/list views with category filtering
- CRUD via GraphQL mutations
- Tier-based discounts per membership level
- Service variations (additive/multiplicative pricing)
- Required staff capabilities and facility features
- Duration and buffer time configuration

### 4. Staff & Provider Management (`staff/spec.md`)
- Grid/list views with role and status filtering
- CRUD via GraphQL mutations
- Capabilities with proficiency levels
- Certification tracking with expiry dates
- Working hours per day of week
- Default facility assignment

### 5. Equipment Inventory (`equipment/spec.md`)
- Fully wired to GraphQL (categories, items, assignments)
- Status lifecycle: AVAILABLE -> IN_USE -> AVAILABLE/MAINTENANCE
- Condition tracking, operation type filtering
- Assignment/return flow with condition assessment

### 6. Waitlist Management (`waitlist/spec.md`)
- Queue display with position, status, countdown timer
- Status lifecycle: waiting -> notified -> converted/expired/cancelled
- UI implemented, **no GraphQL integration yet**
- Planned: auto-notification on cancellation, priority ordering

### 7. Booking Wizard (embedded in calendar + modal)
- Multi-step flow: Type -> Staff/Service/Facility -> Time -> Add-ons -> Confirm
- Three entry flows: facility-first, service-first, staff-first
- Member search, availability checking, price calculation
- Currently uses mock data for picker steps

## Dependencies

### Interface Dependencies
| Dependency | Source | Used By |
|---|---|---|
| Member search | `searchMembers()` in actions.ts | Calendar quick-booking, wizard |
| Facility list | `useGetFacilitiesQuery` | Calendar, facilities tab, wizard |
| Service list | `useGetServicesQuery` | Services tab, wizard picker |
| Staff list | `useGetBookingStaffQuery` | Staff tab, wizard |
| Waitlist | `useGetWaitlistQuery` | Waitlist tab |
| Calendar day | `useGetCalendarDayQuery` | Calendar page |
| Booking detail | `useGetBookingQuery` | Detail panel |
| Equipment | `useEquipment()` custom hook | Equipment tab |

### Settings Dependencies
- Operating hours (per facility, per club)
- Cancellation policy (time-based refund rules)
- Buffer time between bookings
- Advance booking window (min/max days ahead)
- Waitlist response window (default 1 hour)
- Member booking limits (per day/week)

### Data Dependencies
- Members (for booking association)
- Membership tiers (for pricing discounts)
- Revenue centers (for facility/service billing)
- Charge types (for invoice line items)

## Data Model

### GraphQL Queries Available (api-client)
```graphql
GetBookings(first, skip, facilityId, memberId, status, startDate, endDate)
GetBooking(id)
GetBookingStats
GetCalendarDay(date)
GetFacilities
GetServices
GetBookingStaff
GetWaitlist(first, skip, status)
```

### GraphQL Mutations Available (api-client)
```graphql
# Bookings
CreateBooking(input), CancelBooking(id, input), RescheduleBooking(id, input), CheckInBooking(id)

# Facilities
CreateFacility(input), UpdateFacility(input), DeleteFacility(id)

# Services
CreateService(input), UpdateService(input), DeleteService(id)

# Staff
CreateStaffMember(input), UpdateStaffMember(input), DeleteStaffMember(id)

# Waitlist
JoinWaitlist(input), RemoveFromWaitlist(id), SendWaitlistOffer(id)
AcceptWaitlistOffer(id), DeclineWaitlistOffer(id)
```

### Server Actions (actions.ts)
| Action | Status | Notes |
|---|---|---|
| `createFacility/update/delete` | Real GraphQL | Lines 762-882 |
| `createService/update/delete` | Real GraphQL | Lines 908-1034 |
| `createStaffMember/update/delete` | Real GraphQL | Lines 1059-1183 |
| `getMemberContext()` | Mock | Line 264 - hardcoded member |
| `getServiceContext()` | Mock | Line 280 - 6 hardcoded services |
| `getStaffContext()` | Mock | Line 297 - 3 hardcoded staff |
| `getFacilityContext()` | Mock | Line 352 - 5 hardcoded facilities |
| `fetchExistingBookings()` | Mock | Line 402 - simulated bookings |
| `searchMembers()` | Mock | Line 673 - 8 hardcoded members |
| `getServicesForStaff()` | Mock | Line 709 - 7 hardcoded services |

## Business Rules

1. **Triple Constraint:** Service bookings require available Staff + Room + Time simultaneously
2. **Booking Lock:** Redis-based distributed lock prevents double-booking (backend implemented)
3. **Buffer Enforcement:** Configurable buffer time between consecutive bookings on same resource
4. **Cancellation Policy:** Time-based refund tiers (24h+ = full, 2-24h = 50%, <2h = no refund)
5. **Member Limits:** Configurable max bookings per member per day/week
6. **Advance Window:** Bookings must fall within min/max advance booking days
7. **Operating Hours:** Bookings constrained to facility operating hours per day of week
8. **Waitlist Priority:** First-come-first-served with configurable response window

## Edge Cases

| Scenario | Handling |
|---|---|
| Staff goes on leave with bookings | Notify affected members, offer reschedule or waitlist |
| Facility enters maintenance mid-day | Cancel remaining bookings, auto-refund, notify members |
| Concurrent booking attempts | Redis lock prevents; second request gets "slot taken" error |
| Member exceeds daily limit | Block creation with clear error message |
| Service requires unavailable capability | Show "No qualified staff available" in picker |
| Booking spans operating hours boundary | Reject with "Outside operating hours" validation |
| Waitlist offer expires | Auto-decline, offer to next in queue |
| Equipment needed for booking unavailable | Show warning, allow override by manager |

## Mock Data Locations (to be replaced)

| Component | File | Mock Variable | Line |
|---|---|---|---|
| FacilitiesTab | `components/bookings/facilities-tab.tsx` | `mockFacilities` | 70 |
| ServicesTab | `components/bookings/services-tab.tsx` | `mockServices` | 69 |
| StaffTab | `components/bookings/staff-tab.tsx` | `mockStaff` | 68 |
| WaitlistTab | `components/bookings/waitlist-tab.tsx` | `mockEntries` | 60 |
| BookingPickerStep | `components/bookings/booking-picker-step.tsx` | `mockFacilities`, `mockServices` | 83, 96 |
| BookingFacilityStep | `components/bookings/booking-facility-step.tsx` | `mockFacilities` | 84 |
| Calendar page | `app/(dashboard)/bookings/calendar/page.tsx` | `quickBookingServices` | 47 |
| actions.ts | `app/(dashboard)/bookings/actions.ts` | 7 mock functions | 264-738 |
