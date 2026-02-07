# Bookings / Staff / Staff & Provider Management

## Overview

The Staff tab manages service providers who deliver bookable services at the club: spa therapists, fitness trainers, sports coaches, and activity instructors. Each staff member has a profile with contact details, capabilities (services they can perform with proficiency levels), certifications with expiry tracking, working hours per day of week, and a default facility assignment. Staff members appear in the booking flow as available providers filtered by service capability and time availability. The tab supports CRUD operations via GraphQL mutations with permission-based server actions, and displays staff in grid or list views with schedule summaries showing daily bookings, hours booked, and hours available.

## Status

| Aspect | State | Notes |
|--------|-------|-------|
| Staff list (grid/list views) | Implemented | Card-based display with avatars and role badges |
| Staff search | Implemented | Text search on name, specialties |
| Staff role filter | Implemented | Filter by therapist, trainer, instructor, coach |
| Staff status filter | Implemented | Filter by available, busy, off_duty, on_leave |
| Create staff modal | Implemented | `staff-modal.tsx` with full form |
| Update staff modal | Implemented | Reuses create modal in edit mode |
| Delete staff | Implemented | Confirmation dialog before deletion |
| Working hours editor | Implemented | Per-day schedule in `operating-hours-editor.tsx` |
| Capabilities editor | Implemented | `capabilities-editor.tsx` with capability + level |
| Certifications editor | Implemented | `certifications-editor.tsx` with name + expiry |
| Contact details | Implemented | Phone and email display on cards |
| Rating display | Implemented | Star rating on staff cards |
| Schedule summary | Implemented | Start/end time, bookings today, hours booked/available |
| Default facility assignment | Implemented | Dropdown in staff modal |
| Avatar/photo display | Implemented | Avatar with initials fallback |
| GraphQL CRUD | Implemented | `createStaffMember`, `updateStaffMember`, `deleteStaffMember` |
| Server actions with auth | Implemented | `requirePermission('staff:create/update/delete')` |
| Staff-first booking flow | Designed | Plan exists in facility-booking-redesign; wizard has staff step |
| Staff timeline view | Designed | Planned horizontal timeline per staff member; not implemented |
| Staff availability calendar | Not Implemented | No per-staff calendar view |
| Leave management | Not Implemented | `on_leave` status exists but no leave date tracking |
| Break time configuration | Not Implemented | Lunch breaks shown in design but not configurable |
| Linked user account | Partially Implemented | `userId` field in modal but no user lookup |
| Staff performance metrics | Not Implemented | Rating is display-only; no booking-based analytics |

## Capabilities

- Display all staff members in responsive grid or list layout with role-based styling
- Search staff by name or specialties
- Filter staff by role (therapist, trainer, instructor, coach) and status (available, busy, off duty, on leave)
- Create new staff members with profile, capabilities, certifications, and working hours
- Edit existing staff member configurations
- Delete staff members with confirmation dialog
- Configure per-day working hours (start/end time, day-off toggle)
- Manage capabilities with proficiency levels (beginner, intermediate, advanced, expert)
- Track certifications with expiry dates and automatic expiry flagging
- Assign a default facility for the staff member's primary workspace
- Display daily schedule summary including bookings count, hours booked, and hours available
- Show contact information (phone, email) on staff cards
- Display star ratings for staff members

## Dependencies

### Interface Dependencies

| Module | Dependency | Usage |
|--------|-----------|-------|
| Calendar | Staff display | Staff names appear on booking blocks; staff availability affects slot generation |
| Services | Capability matching | Staff capabilities are matched against service `requiredCapabilities` |
| Facilities | Default facility | Staff members can have a default facility; availability checks include facility conflicts |
| Members | Booking history | Staff-member booking history for rating calculation (planned) |
| Users | User account link | Staff members can optionally link to a system user account for app access |
| Settings | Working hours template | Default working hours for new staff |

### Settings Dependencies

| Setting | Usage |
|---------|-------|
| Staff roles | Available role types for staff members |
| Default working hours | Pre-populates working hours for new staff |
| Capability levels | Available proficiency levels |
| Certification tracking | Whether certification expiry alerts are enabled |

### Data Dependencies

| Data Source | Query/Mutation | Description |
|-------------|---------------|-------------|
| `bookingStaff` | GraphQL Query | Fetches all staff with capabilities, certifications, and working hours |
| `createStaffMember` | GraphQL Mutation | Creates a new staff member with all configuration |
| `updateStaffMember` | GraphQL Mutation | Updates staff details |
| `deleteStaffMember` | GraphQL Mutation | Deletes a staff member |

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| `staff.roles` | `string[]` | `["THERAPIST","TRAINER","INSTRUCTOR","COACH"]` | Club Admin | Available staff roles |
| `staff.capabilityLevels` | `string[]` | `["BEGINNER","INTERMEDIATE","ADVANCED","EXPERT"]` | Platform Admin | Available proficiency levels for capabilities |
| `staff.defaultWorkingHours` | `WorkingHoursTemplate` | `{ start: "09:00", end: "18:00", closedDays: [0] }` | Club Admin | Default working hours for new staff (Sunday off) |
| `staff.breakDurationMinutes` | `number` | `60` | Club Admin | Standard break duration (lunch) |
| `staff.breakStartTime` | `string` | `"12:00"` | Club Admin | Default break start time |
| `staff.certificationExpiryWarningDays` | `number` | `30` | Club Admin | Days before expiry to show warning |
| `staff.maxSimultaneousBookings` | `number` | `1` | Club Admin | Max concurrent bookings per staff member |
| `staff.allowSelfBooking` | `boolean` | `false` | Club Admin | Whether staff can book their own services |
| `staff.requireLinkedUser` | `boolean` | `false` | Club Admin | Whether staff must be linked to a system user |
| `staff.showContactOnCalendar` | `boolean` | `false` | Club Admin | Whether staff phone/email shows on calendar bookings |
| `staff.enableRatings` | `boolean` | `true` | Club Admin | Whether staff ratings are tracked and displayed |
| `staff.leaveManagementEnabled` | `boolean` | `false` | Club Admin | Whether leave request workflow is available |

## Data Model

```typescript
interface StaffMember {
  id: string;
  clubId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
  userId?: string;            // Linked system user
  role: StaffRole;
  isActive: boolean;
  defaultFacilityId?: string;
  capabilities: StaffCapability[];
  certifications: StaffCertification[];
  workingHours: WorkingHoursEntry[];
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

type StaffRole = 'THERAPIST' | 'TRAINER' | 'INSTRUCTOR' | 'COACH';

interface StaffCapability {
  capability: string;         // e.g., "Thai Massage", "Personal Training"
  level: CapabilityLevel;
}

type CapabilityLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

interface StaffCertification {
  name: string;               // e.g., "CPR Certification", "Thai Massage Level 3"
  expiresAt?: string;         // ISO date string
}

interface WorkingHoursEntry {
  dayOfWeek: number;          // 0 = Sunday, 6 = Saturday
  isOpen: boolean;
  openTime?: string;          // HH:mm
  closeTime?: string;         // HH:mm
}

// Display types used in the UI
interface StaffScheduleSummary {
  startTime: string;
  endTime: string;
  bookingsToday: number;
  hoursBooked: number;
  hoursAvailable: number;
}

// Context type used during booking flow
interface StaffContext {
  id: string;
  firstName: string;
  lastName: string;
  capabilities?: string[];
  workingSchedule?: WeeklySchedule;
  defaultFacilityId?: string;
}

interface WeeklySchedule {
  monday?: WorkingHours;
  tuesday?: WorkingHours;
  wednesday?: WorkingHours;
  thursday?: WorkingHours;
  friday?: WorkingHours;
  saturday?: WorkingHours;
  sunday?: WorkingHours;
}

interface WorkingHours {
  start: string;              // HH:mm
  end: string;                // HH:mm
}

// Staff form data
interface StaffFormData {
  id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  userId?: string;
  defaultFacilityId?: string;
  isActive: boolean;
  capabilities: Array<{ capability: string; level: string }>;
  certifications: Array<{ name: string; expiresAt?: string }>;
  workingHours: Array<{
    dayOfWeek: number;
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
  }>;
}

// GraphQL input types
interface CreateStaffMemberInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  userId?: string;
  defaultFacilityId?: string;
  isActive?: boolean;
  capabilities?: Array<{ capability: string; level: string }>;
  certifications?: Array<{ name: string; expiresAt?: string }>;
  workingHours: Array<{
    dayOfWeek: number;
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
  }>;
}

interface UpdateStaffMemberInput {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  userId?: string;
  defaultFacilityId?: string;
  isActive?: boolean;
  capabilities?: Array<{ capability: string; level: string }>;
  certifications?: Array<{ name: string; expiresAt?: string }>;
  workingHours?: Array<{
    dayOfWeek: number;
    isOpen: boolean;
    openTime?: string;
    closeTime?: string;
  }>;
}
```

## Business Rules

1. **Capability Matching**: When a booking is being created for a service, only staff members whose capabilities array includes all entries from the service's `requiredCapabilities` list are shown as eligible providers.

2. **Working Hours**: Staff can only be booked during their configured working hours for the day. Booking attempts outside working hours are rejected with a validation error.

3. **Availability Conflict**: A staff member cannot be double-booked. The booking system checks for overlapping time ranges (including buffer time from the service) before confirming. The check is currently done server-side via `getExistingBookingsForDate`.

4. **Default Facility**: If a staff member has a `defaultFacilityId`, the booking wizard pre-selects that facility. Staff can still be booked at other facilities if they are available.

5. **Certification Expiry**: Certifications with `expiresAt` dates in the past are flagged with a warning badge. Expired certifications do not automatically prevent booking; this is an administrative alert only.

6. **Status Semantics**:
   - `available`: Staff is on shift and not currently in a booking
   - `busy`: Staff is currently serving a booked member
   - `off_duty`: Staff is not on shift today
   - `on_leave`: Staff is on approved leave (not bookable)

7. **Deletion Protection**: Staff members with future active bookings cannot be deleted. They must be set to inactive instead, which prevents new bookings while keeping existing ones.

8. **Single Booking Constraint**: By default, a staff member can only serve one booking at a time (`maxSimultaneousBookings: 1`). Group class instructors may have this set higher.

9. **Break Times**: Staff break periods (lunch, etc.) are designed as blocked time on the staff timeline view. During breaks, the staff member is not bookable. Break configuration is not yet implemented; currently relies on gaps in working hours.

10. **Permission Model**: Staff CRUD operations require specific permissions: `staff:create`, `staff:update`, `staff:delete`. These are enforced via `requirePermission()` in server actions.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Staff member deleted while booking wizard is open with them selected | Wizard submission fails with "Staff member not found" error. User is returned to staff selection step. |
| Certification expires during active service period | No automatic action. Expiry warning appears on the staff card. Admin must manually review and update capabilities. |
| Staff working hours overlap with facility operating hours mismatch | Staff can only be booked during the intersection of their working hours and the facility operating hours. |
| Staff with no capabilities assigned | Staff appears in the list but is not matched to any service during booking. They can still be booked for facility-only bookings without service. |
| Two staff with identical names | Allowed. Distinguished by role, photo, and internal ID. Consider displaying member number or email as disambiguator. |
| Staff assigned to a deleted facility as default | `defaultFacilityId` becomes stale. Staff modal shows "Unknown facility" or empty. No functional impact on bookings. |
| Working hours with close time before open time | Form validation prevents this. Close time must be after open time on the same day. Overnight shifts are not supported. |
| Staff member set to on_leave with active bookings | Staff status changes but existing bookings are not auto-cancelled. Admin receives a warning listing affected bookings. |
| Booking for a staff member at a facility they cannot physically access | System does not validate physical access. Relies on admin ensuring default facility and capabilities are consistent. |
| Staff with more than 10 capabilities | Allowed. No UI limit on capabilities count. Card display truncates to show first few with "+N more" indicator. |
| API timeout during staff creation | Error toast displayed. No partial record created due to transactional mutation. |
| Staff rating below threshold | No automatic action. Rating is informational only. No booking restrictions based on rating. |
| Linked user account deleted | `userId` becomes orphaned. Staff record continues to function. Admin can clear or re-link the user ID. |
| Concurrent bookings attempt for same staff at same time | Server-side conflict detection rejects the second booking. Client shows error toast and suggests alternative times. |
