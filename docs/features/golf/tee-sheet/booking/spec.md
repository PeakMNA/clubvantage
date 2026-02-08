# Golf / Tee Sheet / Booking

## Overview

Booking management covers the full lifecycle of tee time reservations: creating, viewing, editing, moving, copying, and cancelling bookings. The system uses a booking-centric model where each booking is an independent entity with its own ID, status, and lifecycle. Multiple independent bookings can exist in the same tee time slot. Includes party booking support for multi-slot linked reservations.

## Status

Partially implemented. Core booking CRUD works. Unified booking modal designed but partially built. Move/copy placement mode designed. Party bookings designed. Member portal tee time booking flow designed (see `docs/plans/2026-02-06-member-portal-pwa-design.md`).

## Capabilities

- Create bookings via click on empty slot or "New Booking" button
- Add 1-4 players per booking (Member, Guest, Dependent, Walk-up types)
- Edit booking details inline (players, notes, preferences)
- Move bookings between time slots with visual placement mode (same day, same course)
- Copy bookings to create duplicates in different slots
- Cancel bookings with reason tracking and late cancellation flag
- Party bookings linking multiple tee times for group events
- Booking number generation (CV-YYMMDD-NNN format)
- Booking status lifecycle: Booked -> Checked-in -> On-course -> Completed | Cancelled | No-show
- Context menu (right-click) for quick actions
- Keyboard shortcuts: Ctrl+X (move), Ctrl+C (copy), Ctrl+V (paste), Escape (cancel)
- Audit trail for all booking modifications
- Search bookings by number, member name, or ID

## Dependencies

### Interface Dependencies

- **Members** - Member search, profile lookup, membership status, guest sponsorship limits
- **Dependents** - Dependent relationships, booking on behalf of dependents
- **Guest Profiles** - Guest creation, search, contact info
- **Billing** - Charge posting for green fees, cart fees, caddy fees
- **Notifications** - Email confirmations, reminders, cancellation notices
- **Golf / Tee Sheet / Schedule** - Available slots, blocked times, operating hours
- **Golf / Courses / Configuration** - Course selection, max players per slot

### Settings Dependencies

- `golf/tee-sheet/schedule` - booking window, available slots
- `golf/courses/configuration` - courseId, maxPlayersPerSlot
- `platform/club` - club-level booking policies
- `members/management` - membership tier booking privileges

### Data Dependencies

- **Reads:** Members, Dependents, Guests, Courses, ScheduleConfig, Flights, Blocks
- **Writes:** Booking, BookingPlayer, Party, AuditEntry
- **Events:** booking.created, booking.updated, booking.cancelled, booking.moved, booking.checkedIn

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---|---|---|---|---|
| maxGuestsPerMember | Integer | - | Club | Limits guest invitations per member per booking |
| requireGuestContact | Boolean | false | Club | Whether guest email/phone is required |
| advanceBookingWindow | Integer (days) | 7 | Club | How far ahead members can book (inherits from schedule) |
| cancellationPolicy | Enum | FLEXIBLE | Club | FLEXIBLE / MODERATE / STRICT - affects late cancellation rules |
| lateCancellationWindow | Integer (hours) | 24 | Club | Hours before tee time considered "late" |
| bookingConfirmationEmail | Boolean | true | Club | Auto-send confirmation email on booking |
| bookingReminderEmail | Boolean | true | Club | Auto-send reminder before tee time |
| reminderHoursBefore | Integer (hours) | 24 | Club | How many hours before tee time to send reminder |
| allowWalkUps | Boolean | true | Club | Whether walk-up bookings are allowed |
| requireBookerForGuests | Boolean | true | Club | Guests must have a member booker |
| openToPairingDefault | Boolean | false | Club | Default value for "open to pairing" preference |

## Data Model

```typescript
interface Booking {
  id: string
  bookingNumber: string // CV-YYMMDD-NNN
  status: 'BOOKED' | 'CHECKED_IN' | 'ON_COURSE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  flightId: string
  teeTime: string
  teeDate: Date
  courseId: string
  bookerId: string
  bookerType: 'MEMBER' | 'STAFF'
  players: BookingPlayer[]
  partyId?: string
  partyName?: string
  notes?: string
  preferences?: { stayTogether?: boolean; openToPairing?: boolean }
  holes: 9 | 18
  startingHole: 1 | 10
  createdAt: Date
  createdBy: string
  modifiedAt: Date
  modifiedBy: string
  cancelledAt?: Date
  cancelledBy?: string
  cancelReason?: string
  lateCancellation?: boolean
}

interface BookingPlayer {
  id: string
  playerId: string
  playerType: 'MEMBER' | 'GUEST' | 'DEPENDENT' | 'WALK_UP'
  position: 1 | 2 | 3 | 4
  memberId?: string
  dependentId?: string
  guestName?: string
  guestEmail?: string
  guestPhone?: string
  cartId?: string
  caddyId?: string
}

interface Party {
  id: string
  name: string
  organizerId: string
  bookingIds: string[]
  totalPlayers: number
  greenFeesPaidBy: 'ORGANIZER' | 'INDIVIDUAL'
}

interface AuditEntry {
  id: string
  bookingId: string
  action: 'CREATED' | 'MODIFIED' | 'CANCELLED' | 'CHECKED_IN' | 'MOVED' | 'COPIED' | 'PLAYER_ADDED' | 'PLAYER_REMOVED'
  timestamp: Date
  userId: string
  userName: string
  details: Record<string, any>
}
```

## Business Rules

- A booking belongs to exactly one flight (tee time slot).
- Multiple independent bookings can share a flight up to maxPlayersPerSlot total.
- Cancelling a booking does not affect other bookings in the same slot.
- Move is restricted to same day, same course.
- Copy creates a new booking (new ID, new number) at the target slot.
- Placement mode validates: capacity (target has room), conflicts (no player already booked at target time), availability (not blocked).
- Valid targets show green highlight, partial-fit amber, invalid dimmed.
- Guest players require a member booker (configurable via requireBookerForGuests).
- Each booking player has mutually exclusive identity: memberId OR dependentId OR guestName.
- Audit trail records all modifications with before/after state.
- Party bookings are visually linked on the tee sheet with a chain icon and connector.

## Member Portal Integration

**Plan**: `docs/plans/2026-02-06-member-portal-pwa-design.md`

- Members can browse available tee times by date and course via the portal Golf tab
- Booking flow: select slot → add players (members, dependents, guests) → request cart/caddy → review pricing → confirm
- Guest booking controlled by `golf.guestBooking` feature flag
- Cart requests controlled by `golf.cartRequest` feature flag
- Caddy requests controlled by `golf.caddyRequest` feature flag
- Offline: bookings queued in IndexedDB with "Pending Sync" badge, replayed via Background Sync
- My Tee Times view shows upcoming and past bookings with status badges
- Members can cancel or modify bookings from the portal (subject to cancellation policy)
- Push notification sent on booking confirmation and 24h/2h reminders

## Edge Cases

| Scenario | Handling |
|---|---|
| Move to full slot | Placement mode prevents; slot shown as invalid |
| Cancel last booking in slot | Slot returns to available |
| Player already booked at target time | Conflict detected, target dimmed |
| Guest without member booker | Blocked if requireBookerForGuests enabled |
| Late cancellation | Flagged, may trigger penalty per club policy |
| Party booking partial cancel | Individual booking cancelled, party link maintained for remaining |
| Booking in past | Cannot modify; read-only |
| Player in multiple bookings same day | Allowed (different times) but warned if overlapping |
| Network failure during move | Source booking unchanged; atomic operation |
