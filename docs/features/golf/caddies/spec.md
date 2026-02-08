# Golf / Caddies

## Overview

Caddy roster management and assignment. Tracks caddy availability, assigns caddies to players, and manages the caddy master's daily operations. In Asian golf mode (common in Thailand), caddy assignment automatically triggers individual cart assignment.

## Status

Partially implemented. Caddy CRUD exists in API. Caddy search query works. Caddy master view and schedule modal built in UI. Member portal caddy request flow designed (see `docs/plans/2026-02-06-member-portal-pwa-design.md`).

## Capabilities

- Manage caddy roster: add, edit, deactivate caddies
- Set daily availability per caddy
- Assign caddies to individual players in booking
- Search caddies by name or number
- Caddy master view: daily roster, assignments, availability
- View caddy's assigned flights for the day
- Track caddy status: Available, Assigned, On Course, Finished
- Navigate from caddy schedule to flight on tee sheet

## Dependencies

### Interface Dependencies

- Golf / Tee Sheet / Booking - Player context for caddy assignment
- Golf / Tee Sheet / Cart Assignment - caddyDrivesCart triggers cart auto-assignment
- Golf / Tee Sheet / Check-in - Caddy confirmation at check-in, caddy fee line item
- Billing - Caddy fee charges
- Members - Member caddy preferences (future)

### Settings Dependencies

- `caddyEnabled` gates the entire caddy management feature
- `caddyPolicy` determines whether caddy assignment is optional or required
- `caddyDrivesCart` shared with Cart Assignment to trigger automatic cart behavior

### Data Dependencies

- Course must exist before caddies can be added to roster
- Booking and player records must exist before caddy assignment
- Cart inventory required when caddyDrivesCart is enabled

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| caddyEnabled | Boolean | true | Golf Ops Manager | Enable caddy management |
| caddyPolicy | Enum | OPTIONAL | Golf Ops Manager | OPTIONAL or REQUIRED |
| caddyDrivesCart | Boolean | true | Golf Ops Manager | Caddy drives cart (Asian golf mode) |
| maxCaddyAssignmentsPerDay | Integer | 2 | Golf Ops Manager | Max rounds per caddy per day |
| caddyFeeDefault | Decimal | 0 | Golf Ops Manager | Default caddy fee amount |
| caddyRatingEnabled | Boolean | false | Golf Ops Manager | Allow member caddy ratings |

## Data Model

```typescript
interface Caddy {
  id: string
  courseId: string
  firstName: string
  lastName: string
  phone?: string
  status: 'ACTIVE' | 'INACTIVE'
  dailyAvailability: boolean
  currentAssignment?: string // bookingId
  totalAssignmentsToday: number
  rating?: number
  createdAt: Date
  updatedAt: Date
}

interface CaddyAssignment {
  id: string
  caddyId: string
  bookingId: string
  playerId: string
  teeTime: string
  teeDate: Date
  status: 'ASSIGNED' | 'ON_COURSE' | 'FINISHED'
  assignedAt: Date
  assignedBy: string
}
```

## Business Rules

- Only caddies with status ACTIVE and dailyAvailability true appear in assignment dropdown
- A caddy can only have one active assignment (ASSIGNED or ON_COURSE) at a time
- When caddyDrivesCart is enabled, assigning a caddy auto-requests a cart for that player
- Caddies who have reached maxCaddyAssignmentsPerDay are hidden from the dropdown
- Deactivating a caddy with future assignments is blocked; must reassign first
- Caddy search matches on firstName, lastName, or caddy number
- Assignment status transitions: ASSIGNED -> ON_COURSE -> FINISHED

## Member Portal Integration

**Plan**: `docs/plans/2026-02-06-member-portal-pwa-design.md`

- Members can request a caddy during the tee time booking flow in the portal
- Caddy request toggle shown on booking review screen
- Controlled by `golf.caddyRequest` feature flag — default OFF (not all clubs offer caddy service)
- Caddy request creates a rental record with status REQUESTED
- Staff sees caddy requests in the tee sheet and assigns specific caddies
- Pricing displayed during booking based on caddy fee configuration

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Caddy assigned to overlapping rounds | Blocked; max 1 active assignment at a time |
| Caddy calls in sick | Mark unavailable; affected bookings flagged |
| Max daily assignments reached | Caddy hidden from assignment dropdown |
| Caddy deleted with future assignments | Blocked; must reassign first |
| No caddies available | Dropdown shows "No caddies available" |
