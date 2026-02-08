# Bookings / Calendar / Booking Calendar View

## Overview

The Calendar view is the primary interface for staff to visualize and manage bookings across all facility resources. It renders a resource-column grid with time rows (15-minute increments), showing bookings as colored blocks positioned on the appropriate resource column and time range. Staff can navigate between days, toggle day/week views, click empty slots to initiate quick bookings, and click existing bookings to open a detail panel with check-in, cancel, and reschedule actions. The calendar fetches data from the `calendarDay` GraphQL query, supports real-time updates via WebSocket subscriptions, and integrates a quick-booking popover for rapid slot-to-booking conversion.

## Status

| Aspect | State | Notes |
|--------|-------|-------|
| Day view grid | Implemented | Resource columns, 15-min time slots, booking blocks |
| Week view grid | Implemented | `week-view-grid.tsx` component exists |
| Date navigation | Implemented | Previous/next day, Today button |
| Day/Week toggle | Implemented | View mode stored in BookingProvider context |
| Booking block rendering | Implemented | Color-coded by status, member avatar, service name |
| Booking detail panel | Implemented | Slide-out panel with check-in, cancel, modify actions |
| Quick booking popover | Implemented | Click empty slot, select service/member, confirm |
| Real-time subscription | Implemented | `useBookingSubscription` hook with WebSocket |
| Current time indicator | Implemented | Red line showing current time on the grid |
| Drag-and-drop reschedule | Partially Implemented | `drag-drop.tsx` exists but not wired to mutations |
| Mobile agenda view | Implemented | `mobile-agenda-view.tsx` for small screens |
| Buffer block rendering | Implemented | `buffer-block.tsx` for pre/post service buffers |
| Month view | Not Implemented | Planned but no component exists |
| Keyboard navigation | Implemented | Arrow key navigation between time slots |
| Status legend | Implemented | Color legend for booking statuses |
| GraphQL data fetching | Implemented | `useGetCalendarDayQuery` with staleTime of 30s |
| Booking creation mutation | Implemented | `useCreateBookingMutation` in calendar page |
| Check-in mutation | Implemented | `useCheckInBookingMutation` in calendar page |
| Cancel mutation | Implemented | `useCancelBookingMutation` in calendar page |
| Reschedule mutation | Implemented | `useRescheduleBookingMutation` in calendar page |
| Server actions (validation) | Partially Implemented | `actions.ts` uses mock data for members, services, staff |

Member portal facility booking flow designed (see `docs/plans/2026-02-06-member-portal-pwa-design.md`).

## Capabilities

- Render a resource-by-time grid for a single day with configurable operating hours
- Display bookings as positioned blocks with status coloring, member name, service name, and optional staff name
- Navigate between dates (previous/next day, jump to today)
- Toggle between day view and week view display modes
- Click empty time slots to open a quick-booking popover
- Click booking blocks to open a detail panel with full booking information
- Check in members directly from the detail panel
- Cancel bookings with reason from the detail panel
- Subscribe to real-time booking updates via WebSocket
- Show buffer time blocks before and after service bookings
- Display a current time indicator line across the grid
- Support keyboard navigation between time slots for accessibility
- Perform server-side validation and price calculation before booking creation
- Search members by name or member number for quick booking
- Display resource type icons (court, spa, studio, pool, room) in column headers

## Dependencies

### Interface Dependencies

| Module | Dependency | Usage |
|--------|-----------|-------|
| Members | Member search API | Quick booking member selection; member details in booking panel |
| Billing | Price calculation | Service pricing with tier discounts, variations, add-ons |
| Facilities | Facility/Resource data | Resource columns in calendar grid; operating hours |
| Services | Service catalog | Service selection in quick booking; duration and buffer time |
| Staff | Staff availability | Staff assignment in bookings; staff display in booking blocks |
| Golf | Tee time data | Not directly used but booking model shared with tee time players |
| Settings | Club operating hours | Default operating hours for calendar display range |
| Notifications | Booking notifications | Not yet integrated; planned for real-time alerts |

### Settings Dependencies

| Setting | Usage |
|---------|-------|
| Club operating hours | Determines start/end hours for calendar grid (currently hardcoded to 06:00-22:00) |
| Default slot interval | Time slot granularity (currently hardcoded to 15 minutes) |
| Calendar default view | Whether to start in day or week mode |
| Auto-refresh interval | How often to refetch calendar data (currently 30s staleTime) |
| Booking confirmation mode | Instant confirmation vs approval required (currently instant) |

### Data Dependencies

| Data Source | Query/Mutation | Description |
|-------------|---------------|-------------|
| `calendarDay` | GraphQL Query | Fetches resources and bookings for a given date |
| `booking` | GraphQL Query | Fetches full booking details for the detail panel |
| `facilities` | GraphQL Query | Fetches facility list for resource mapping |
| `createBooking` | GraphQL Mutation | Creates a new booking from quick-book or wizard |
| `checkInBooking` | GraphQL Mutation | Marks a booking as checked in |
| `cancelBooking` | GraphQL Mutation | Cancels a booking with reason |
| `rescheduleBooking` | GraphQL Mutation | Moves a booking to a new time/resource |

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| `calendar.operatingHoursStart` | `string` (HH:mm) | `"06:00"` | Club Admin | Start time for calendar grid display |
| `calendar.operatingHoursEnd` | `string` (HH:mm) | `"22:00"` | Club Admin | End time for calendar grid display |
| `calendar.slotIntervalMinutes` | `number` | `15` | Club Admin | Time slot granularity in minutes (15, 30, or 60) |
| `calendar.defaultView` | `"day" \| "week"` | `"day"` | User Preference | Default calendar view mode |
| `calendar.autoRefreshSeconds` | `number` | `30` | Club Admin | How often to auto-refresh calendar data |
| `calendar.showBufferBlocks` | `boolean` | `true` | Club Admin | Whether to display buffer time blocks on the calendar |
| `calendar.allowQuickBooking` | `boolean` | `true` | Club Admin | Whether staff can use the quick-booking popover |
| `calendar.quickBookingDefaultPayment` | `string` | `"ON_ACCOUNT"` | Club Admin | Default payment method for quick bookings |
| `calendar.dragDropReschedule` | `boolean` | `false` | Club Admin | Whether drag-and-drop rescheduling is enabled |
| `booking.confirmationMode` | `"instant" \| "approval"` | `"instant"` | Club Admin | Whether bookings are auto-confirmed or require approval |
| `booking.maxAdvanceBookingDays` | `number` | `30` | Club Admin | Maximum days in advance a booking can be made |
| `booking.cancellationPolicyHours` | `number` | `24` | Club Admin | Hours before booking start when cancellation fee applies |
| `booking.cancellationFeePercent` | `number` | `50` | Club Admin | Percentage of booking price charged for late cancellation |
| `booking.noShowGraceMinutes` | `number` | `15` | Club Admin | Minutes after start time before marking as no-show |

## Data Model

```typescript
interface CalendarResource {
  id: string;
  name: string;
  type: 'court' | 'spa' | 'studio' | 'pool' | 'room';
  subtitle?: string;
}

interface CalendarBooking {
  id: string;
  resourceId: string;
  startTime: string;          // ISO 8601 datetime
  endTime: string;            // ISO 8601 datetime
  status: BookingStatus;
  serviceName: string;
  memberName: string;
  memberPhotoUrl?: string;
  staffName?: string;
  bufferBefore?: number;      // minutes
  bufferAfter?: number;       // minutes
}

type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

type CalendarSlotStatus = BookingStatus | 'AVAILABLE' | 'MAINTENANCE' | 'OUTSIDE_HOURS';

interface BookingStatusConfig {
  label: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  dotColor: string;
  strikethrough?: boolean;
  pulse?: boolean;
  stripes?: boolean;
}

interface BookingDetailPanelData {
  id: string;
  member: {
    name: string;
    number: string;
    status: 'ACTIVE' | 'SUSPENDED';
  };
  service: {
    name: string;
    duration: number;
  };
  date: Date;
  startTime: string;
  endTime: string;
  staff?: { name: string };
  facility: { name: string };
  pricing: {
    base: number;
    modifiers: Array<{ label: string; amount: number; isPercentage: boolean }>;
    total: number;
  };
  status: BookingStatus;
  createdAt: Date;
  createdBy: string;
  checkedInAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
}

interface QuickBookingContext {
  date: Date;
  time: string;               // HH:mm
  facilityId: string;
  facilityName: string;
  resourceType: string;
}

interface QuickBookingResult {
  memberId: string;
  serviceId: string;
  staffId?: string;
  facilityId?: string;
  date: Date;
  duration: number;
}

interface QuickBookingService {
  id: string;
  name: string;
  duration: number;
  price: number;
  category: string;
}

interface BookingWizardState {
  isOpen: boolean;
  currentStep: WizardStep;
  bookingType: BookingType | null;
  selectedFacility: SelectedFacility | null;
  selectedService: SelectedService | null;
  selectedDate: Date;
  selectedTime: string | null;
  selectedStaff: SelectedStaff | null;
  selectedAddOns: SelectedAddOn[];
  selectedVariation: SelectedVariation | null;
  selectedMember: MemberInfo | null;
  isStaffFlow: boolean;
  needsFacility: boolean;
}

type WizardStep = 'type' | 'select' | 'staff' | 'facility' | 'time' | 'options' | 'confirm';
type BookingType = 'facility' | 'service' | 'staff';
```

## Business Rules

1. **Operating Hours**: The calendar grid only shows time slots within the configured operating hours. Slots outside operating hours are rendered as `OUTSIDE_HOURS` and are not clickable.

2. **Conflict Detection**: Before creating a booking, the system validates that neither the selected resource nor the assigned staff has an overlapping booking for the requested time window including buffer periods.

3. **Member Eligibility**: Members with status `SUSPENDED` can still be selected for bookings but a warning banner is displayed. Members with status `LAPSED` or `TERMINATED` cannot be booked.

4. **Status Transitions**: Bookings follow a strict state machine:
   - `PENDING` -> `CONFIRMED` (auto or manual)
   - `CONFIRMED` -> `CHECKED_IN` | `CANCELLED` | `NO_SHOW`
   - `CHECKED_IN` -> `IN_PROGRESS` | `CANCELLED`
   - `IN_PROGRESS` -> `COMPLETED`
   - Terminal states: `COMPLETED`, `CANCELLED`, `NO_SHOW`

5. **Buffer Time**: When a service has buffer minutes configured, the calendar renders buffer blocks before and after the booking block. Buffer time blocks conflict checking to prevent back-to-back bookings.

6. **Real-time Updates**: The calendar subscribes to booking changes via WebSocket. When another staff member creates, modifies, or cancels a booking, the calendar updates without requiring a page refresh.

7. **Price Calculation**: Prices are calculated server-side using the `calculateBookingPrice` action, which applies member tier discounts, selected variations, and add-on pricing.

8. **Cancellation Policy**: Cancellations within the configured `cancellationPolicyHours` window incur a fee calculated as `cancellationFeePercent` of the booking total. Staff can waive the fee.

9. **No-Show Handling**: Bookings not checked in within `noShowGraceMinutes` after the start time can be marked as NO_SHOW. This increments the member's no-show counter.

10. **Booking Number Generation**: Each booking receives a unique booking number with the prefix `BK` followed by a sequential identifier, generated server-side.

## Member Portal Integration

**Plan**: `docs/plans/2026-02-06-member-portal-pwa-design.md`

- Members can browse facilities by category and view calendar availability in the portal Bookings tab
- Booking flow: select facility → pick date on calendar → select time slot → set duration → add services/equipment → review → confirm
- Auto-approve controlled by `bookings.autoApprove` feature flag (per facility)
- When auto-approve is off, booking goes to Pending status — staff must approve in admin panel
- Push notification sent when staff approves/rejects a pending booking
- My Bookings view shows upcoming and past facility bookings
- Offline: bookings queued in IndexedDB with "Pending Sync" badge

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Two staff create bookings for same slot simultaneously | Server-side conflict detection rejects the second booking with a `ConflictException`. Client shows toast error and re-fetches calendar data. |
| Booking spans across midnight | Not currently supported. Bookings must start and end within the same calendar day. |
| Resource removed while bookings exist | Existing bookings remain visible on the calendar with a warning indicator. New bookings cannot be created for the deleted resource. |
| WebSocket connection drops | Client falls back to polling via `staleTime` (30s). Reconnection is attempted automatically. |
| Calendar loaded for a date with no resources | Empty state shown with message "No resources configured for this facility." |
| Quick booking submitted while member search is still loading | Submit button is disabled until member selection is confirmed. |
| Booking created for a suspended member | Booking is allowed but a `SuspendedMemberWarning` banner is displayed in the confirmation step and on the booking detail panel. |
| Staff selects a time slot during another staff member's lunch break | Validation fails with error "Staff member is not available at the requested time." |
| Drag-and-drop to a slot with insufficient duration | Currently not validated on drop. Planned: validate availability on drop and reject with conflict details if blocked. |
| Facility under maintenance | Slots for that resource are rendered with the `MAINTENANCE` status style and are not clickable. Quick-book popover does not appear. |
| Concurrent modification of booking in detail panel | Optimistic UI not implemented. Panel refetches booking data on open. If booking was cancelled, panel shows updated status. |
| Booking with zero-price service | Booking proceeds normally. Price breakdown shows base price of 0 and total of 0. Payment step is skipped. |
| Network timeout during booking creation | Client shows error toast. Booking is not created. No retry is attempted automatically. |
| Calendar data exceeds 100 bookings for one day | All bookings are rendered. Performance may degrade on lower-end devices. Virtualization is not currently implemented. |
