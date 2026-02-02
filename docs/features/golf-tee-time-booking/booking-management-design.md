# Booking-Centric Golf Tee Sheet Management - Design Document

## Executive Summary

Transform the golf tee sheet from a flight-centric (time slot) model to a booking-centric model where bookings are first-class entities with independent lifecycle, actions, and management capabilities. This enables staff to manage individual bookings when multiple reservations share the same tee time.

---

## Problem Statement

**Current State:**
- Tee sheet displays time slots (flights) with players aggregated together
- Actions like Check In, Cancel operate at the flight level
- When two different members book players in the same time slot, they appear merged
- No easy way to search/find bookings by booking number or member

**User Pain Points:**
- Cannot cancel one booking without affecting others in the same slot
- Cannot move/copy individual bookings
- Cannot search for a specific booking
- Cart/caddy resources appear at flight level, not per-player
- No audit trail for individual booking changes

---

## Design Decisions

### 1. Data Model: Booking as First-Class Entity

**Decision:** Each booking is an independent entity with its own ID, status, and lifecycle.

**Rationale:** Members expect their reservation to be independent of strangers who happen to book the same tee time.

**Structure:**
```
Flight (time slot: 06:00, 06:08, etc.)
  └── Booking 1 (id, status, booker, players[], notes...)
  │     └── Player 1 (cart, caddy)
  │     └── Player 2 (cart, caddy)
  └── Booking 2 (id, status, booker, players[], notes...)
        └── Player 3 (cart, caddy)
        └── Player 4 (cart, caddy)
```

### 2. Resource Assignment: Per-Player

**Decision:** Cart and caddy assignments are per individual player, not per booking or per flight.

**Rationale:** Different players may want different caddies, or choose to share/not share carts.

### 2.1 Rental Preferences (Booking Time)

**Decision:** Capture rental preferences at booking time for cart, caddy, and equipment rentals.

**Rationale:** Members indicate their preferences when booking, allowing staff to prepare resources in advance.

**Fields:**
- `cartRequest`: 'NONE' | 'REQUEST' - Member wants a golf cart
- `caddyRequest`: 'NONE' | 'REQUEST' | caddyId - Member wants a caddy (optionally a specific one)
- `rentalRequest`: 'NONE' | 'REQUEST' - Member wants equipment rental

**Note:** These preferences are captured at booking time and persist with the booking. They are separate from operational status tracking.

### 2.2 Rental Status Tracking (Operations)

**Decision:** Track rental lifecycle status (None → Requested → Paid → Assigned → Returned) per player for both carts and caddies.

**Rationale:** Staff need to track the operational flow of rentals - from member request through payment, assignment to specific resources, and return. This enables better resource management and billing reconciliation.

**Status Flow:**
```
NONE → REQUESTED → PAID → ASSIGNED → RETURNED
         ↓           ↓
       (declined)  (cancelled)
```

**Key Distinction:**
- **Preferences** (`*Request` fields): Set at booking time, indicate what the member wants
- **Status** (`*Status` fields): Updated during operations, track fulfillment progress

### 3. Flight Status: Derived from Bookings

**Decision:** Flight status is automatically derived from the statuses of its bookings.

**Rationale:** Handles scenarios where one booking checks in but another is a no-show.

| Booking Statuses | Flight Shows |
|------------------|--------------|
| All booked | Booked |
| Any checked-in | Checked-in |
| Any on-course | On Course |
| All completed | Finished |
| Mix of statuses | Most recent active status |
| All cancelled | Available (slot reopens) |

### 4. Booking Discovery: Two Paths

**Decision:** Staff can find bookings via tee sheet browsing OR dedicated search.

**Paths:**
1. **Visual browse:** Tee sheet → Click booking chip → Booking modal
2. **Search:** Bookings tab → Search/filter → Click result → Same booking modal

### 5. Move/Copy: Placement Mode

**Decision:** Use copy/cut-paste paradigm with visual placement mode.

**Rationale:** More intuitive than drag-drop for precise operations, works on touch devices.

**Flow:**
1. Click "Move" or "Copy" in booking modal
2. Modal minimizes, placement banner appears
3. Valid destination slots highlight green, full slots show red
4. Click destination to confirm, Escape to cancel

### 6. Party Bookings: Linked but Independent

**Decision:** Party bookings link multiple bookings but each maintains independence.

**Rationale:** Operations may need to handle individual slots while understanding the party context.

**Features:**
- Visual connector between party slots on tee sheet
- Party name displayed on chips
- Billing: Green fees to organizer, other fees per player
- Can manage party as whole OR individual bookings

### 7. Operational Blocks: Dynamic Controls

**Decision:** Starter blocks are real-time operational tools, not just scheduled closures.

**Use Cases:**
- Speed up play: Insert block to create gap
- Slow down play: Block to space out groups
- Weather delay: Temporarily block upcoming slots
- VIP buffer: Block slots around VIP groups

---

## Features

### Core Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Booking Chip | Clickable booking on tee sheet showing players and status | P0 |
| Booking Detail Modal | Full booking info with actions | P0 |
| Booking Actions | Check In, Cancel, Edit, Move, Copy | P0 |
| Per-Player Resources | Cart/caddy dropdowns per player | P0 |
| Rental Status Tracking | Track cart/caddy status (None/Requested/Paid/Assigned/Returned) | P0 |
| Bookings Tab | Searchable list of all bookings | P0 |
| Booking Number | Unique identifier (CV-YYMMDD-NNN) | P0 |

### Enhanced Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Placement Mode | Visual move/copy with slot highlighting | P1 |
| Derived Flight Status | Auto-calculate from booking statuses | P1 |
| Cancellation Tracking | Reason, who cancelled, late flag | P1 |
| Audit Trail | History of all booking changes | P1 |

### Advanced Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Party Bookings | Multi-slot linked reservations | P2 |
| Starter Blocks | Dynamic operational holds | P2 |
| Maintenance Blocks | Recurring course closures | P2 |
| Waitlist | Queue for full time slots | P3 |
| Batch Operations | Bulk cancel, resend confirmations | P3 |

---

## User Flows

### Flow 1: Find and Check In a Booking

```
Staff opens Golf page
  → Tee Sheet tab (default)
  → Scans time slots
  → Clicks booking chip for 06:00 "John, Mary"
  → Booking Detail Modal opens
  → Reviews booking #CV-240128-001
  → Clicks [Check In]
  → Booking status changes to "Checked-in"
  → Chip turns green on tee sheet
```

### Flow 2: Search for a Booking

```
Staff opens Golf page
  → Clicks "Bookings" tab
  → Types "John Smith" in search
  → Results filter to show John's bookings
  → Clicks row for CV-240128-001
  → Same Booking Detail Modal opens
  → Takes action as needed
```

### Flow 3: Move a Booking

```
Staff has booking modal open for 06:00
  → Clicks [Move]
  → Modal closes, placement mode activates
  → Blue banner: "Moving from 06:00 AM: John, Mary (2 players) → Click a green slot to place"
  → Source slot (06:00) shows amber highlight
  → 06:08 shows green highlight (valid - has room)
  → 06:16 shows red/dimmed (full - 4 players)
  → Staff clicks 06:08 (green slot)
  → Confirmation dialog: "Move Booking - Move 2 players from 06:00 AM to 06:08 AM?"
  → Staff clicks [Move Booking]
  → API call persists the move
  → Tee sheet refetches, booking now at 06:08
  → Placement mode exits

Alternative: Copy a Booking
  → Staff clicks [Copy] instead of [Move]
  → Purple banner: "Copying from 06:00 AM: John, Mary (2 players)"
  → Same slot highlighting behavior
  → Click destination → Confirmation dialog shows "Copy Booking"
  → Creates new tee time with same players at destination
  → Original booking remains at source

Cancel placement mode:
  → Press Escape key, or
  → Click [Cancel] in the banner
```

### Flow 4: Cancel One Booking in Multi-Booking Slot

```
06:00 has two bookings: "John, Mary" and "Bob, Sue"
  → Staff clicks "John, Mary" chip
  → Modal shows Booking #CV-240128-001
  → Clicks [Cancel]
  → Dialog: "Cancel booking for John Smith, Mary Lee?"
  → Selects reason: "Member request"
  → Confirms
  → John/Mary booking cancelled
  → Bob/Sue booking unaffected
  → 06:00 slot now shows only "Bob, Sue"
```

### Flow 5: Create Starter Block

```
Course is backing up, need to create gap
  → Staff right-clicks on 12:00 slot
  → Context menu: "Add Block"
  → Enters reason: "Pace adjustment"
  → Selects duration: 2 slots (12:00, 12:08)
  → Block created
  → Slots show 🔒 "Pace Adjustment" [Release]
  → When pace clears, staff clicks [Release]
  → Slots return to available
```

---

## UI Components

### Tee Sheet (Modified)

```
┌────────┬─────────────────────────────────────────────┬───────┐
│ Time   │ Bookings                                    │ Cap   │
├────────┼─────────────────────────────────────────────┼───────┤
│ 06:00  │ [John, Mary] [Bob, Sue]                    │ 4/4   │
│ 06:08  │ [Alice]                                     │ 1/4   │
│ 06:16  │ ┌ ─ ─ ─ + Add Booking ─ ─ ─ ┐             │ 0/4   │
│ 06:24  │ 🔒 Greens Maintenance         [Release]    │  -    │
└────────┴─────────────────────────────────────────────┴───────┘
```

### Booking Detail Modal

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Booking #CV-240128-001                                           [X]     │
│  [Booked] 06:00 AM · Championship Course · Jan 28, 2026                   │
├────────────────────────────────────────────────────────────────────────────┤
│  BOOKED BY                                                                 │
│  John Smith (M-1234)                                   [View Profile]     │
│  Created: Jan 27, 2026 3:30 PM                                            │
│                                                                            │
│  PLAYERS (2/4)                                         [+ Add Player]     │
│  1. John Smith [M] Cart: [#12] [Paid▾] Caddy: [Somchai] [Assigned▾]  [X] │
│  2. Mary Lee   [G] Cart: [#12] [Paid▾] Caddy: [None]    [None▾]      [X] │
│                                                                            │
│  [Details] [History]                                                       │
│  Notes: Celebrating birthday, please arrange cake                          │
├────────────────────────────────────────────────────────────────────────────┤
│  [Check In]  [Move]  [Copy]  [Edit]  [Cancel]                             │
└────────────────────────────────────────────────────────────────────────────┘
```

**Rental Status Dropdown Colors:**
| Status | Color | Meaning |
|--------|-------|---------|
| None | Stone | No rental requested |
| Requested | Amber | Member requested, pending payment |
| Paid | Emerald | Payment received |
| Assigned | Blue | Resource assigned to player |
| Returned | Purple | Rental completed |

### Bookings Tab

```
┌──────────────────────────────────────────────────────────┐
│  🔍 Search by booking #, member, or name...             │
│  Filters: [Date Range] [Status] [Course]  [Clear]       │
├──────────────────────────────────────────────────────────┤
│  Booking #     │ Date   │ Time  │ Booker     │ Status   │
│  CV-240128-001 │ Jan 28 │ 06:00 │ John Smith │ [Booked] │
│  CV-240128-002 │ Jan 28 │ 06:00 │ Bob Chen   │ [Booked] │
│  CV-240128-003 │ Jan 28 │ 14:00 │ Alice Wong │ [Checked]│
└──────────────────────────────────────────────────────────┘
```

### Placement Mode

**Move Mode Banner (Blue theme):**
```
┌───────────────────────────────────────────────────────────────────────────────────┐
│ 📋 Moving from 06:00 AM: John Smith, Mary Lee (2 players) → Click a green slot   │
│    to place                                                           [Cancel]    │
└───────────────────────────────────────────────────────────────────────────────────┘
```

**Copy Mode Banner (Purple theme):**
```
┌───────────────────────────────────────────────────────────────────────────────────┐
│ 📄 Copying from 06:00 AM: John Smith, Mary Lee (2 players) → Click a green slot  │
│    to place                                                           [Cancel]    │
└───────────────────────────────────────────────────────────────────────────────────┘
```

**Slot Highlighting:**
| Slot State | Visual Style | Cursor |
|------------|--------------|--------|
| Source (original booking) | Amber ring + amber background | Default |
| Valid target (has room) | Emerald ring + green background | Pointer |
| Invalid target (full/blocked) | Dimmed + red tint | Not-allowed |

**Confirmation Dialog:**
```
┌────────────────────────────────────────────┐
│  Move Booking                        [X]   │
├────────────────────────────────────────────┤
│  Move 2 players from 06:00 AM to 06:08 AM  │
│  on Jan 30, 2026?                          │
│                                            │
│  Players: John Smith, Mary Lee             │
├────────────────────────────────────────────┤
│                    [Cancel] [Move Booking] │
└────────────────────────────────────────────┘
```

**Keyboard Shortcuts:**
- `Escape` - Cancel placement mode

---

## Data Model

### Booking

```typescript
interface Booking {
  id: string
  bookingNumber: string          // CV-YYMMDD-NNN
  status: BookingStatus

  // Time reference
  flightId: string
  teeTime: string                // "06:00"
  teeDate: Date
  courseId: string

  // Booker
  bookerId: string
  bookerType: 'member' | 'staff'

  // Players
  players: BookingPlayer[]

  // Party (optional)
  partyId?: string
  partyName?: string

  // Metadata
  notes?: string
  preferences?: BookingPreferences

  // Timestamps
  createdAt: Date
  createdBy: string
  modifiedAt: Date
  modifiedBy: string

  // Cancellation
  cancelledAt?: Date
  cancelledBy?: string
  cancelReason?: string
  lateCancellation?: boolean
}

type BookingStatus =
  | 'booked'
  | 'checked-in'
  | 'on-course'
  | 'completed'
  | 'cancelled'
  | 'no-show'
```

### BookingPlayer

```typescript
type RentalStatus = 'NONE' | 'REQUESTED' | 'PAID' | 'ASSIGNED' | 'RETURNED'
type RentalRequest = 'NONE' | 'REQUEST'

interface BookingPlayer {
  id: string
  playerId: string
  playerType: 'member' | 'guest' | 'dependent' | 'walkup'
  position: 1 | 2 | 3 | 4

  // Resources (per player)
  cartId?: string
  caddyId?: string

  // Booking-time rental preferences (set when booking)
  cartRequest: RentalRequest   // Member's cart preference at booking time
  caddyRequest: RentalRequest  // Member's caddy preference at booking time
  rentalRequest: RentalRequest // Member's rental preference at booking time

  // Rental status tracking (updated during operations)
  cartStatus: RentalStatus   // Tracks cart rental lifecycle
  caddyStatus: RentalStatus  // Tracks caddy assignment lifecycle

  // Guest info
  guestName?: string
  guestPhone?: string
}
```

### Party

```typescript
interface Party {
  id: string
  name: string                   // "Smith Wedding"
  organizerId: string
  bookingIds: string[]
  totalPlayers: number

  // Billing
  greenFeesPaidBy: 'organizer' | 'individual'
}
```

### Block

```typescript
interface Block {
  id: string
  type: 'starter' | 'maintenance'
  reason: string

  courseId: string
  startTime: string
  endTime: string
  date?: Date                    // One-time blocks

  // Recurrence
  recurring?: boolean
  recurrencePattern?: string     // "WEEKLY:MON"
  recurrenceEndDate?: Date

  // Metadata
  createdAt: Date
  createdBy: string
  releasedAt?: Date
  releasedBy?: string
}
```

### AuditEntry

```typescript
interface AuditEntry {
  id: string
  bookingId: string
  action: AuditAction
  timestamp: Date
  userId: string
  userName: string
  details: Record<string, any>
}

type AuditAction =
  | 'created'
  | 'modified'
  | 'cancelled'
  | 'checked-in'
  | 'moved'
  | 'player-added'
  | 'player-removed'
  | 'cart-status-updated'
  | 'caddy-status-updated'
  | 'players-updated'
```

---

## API Requirements

### New Queries

```graphql
# Get bookings with filters
query getBookings(
  courseId: ID
  dateRange: DateRangeInput
  statuses: [BookingStatus]
  search: String
): BookingConnection

# Get single booking detail
query getBooking(id: ID!): Booking

# Get booking history
query getBookingHistory(bookingId: ID!): [AuditEntry]

# Get waitlist for a time slot
query getWaitlist(flightId: ID!): [WaitlistEntry]
```

### New Mutations

```graphql
# Booking lifecycle
mutation checkInBooking(bookingId: ID!): Booking
mutation cancelBooking(bookingId: ID!, reason: String!, notes: String): Booking
mutation markBookingOnCourse(bookingId: ID!): Booking
mutation markBookingFinished(bookingId: ID!): Booking
mutation markBookingNoShow(bookingId: ID!): Booking

# Booking modifications
mutation moveBooking(bookingId: ID!, targetTeeTime: String!): Booking
mutation copyBooking(bookingId: ID!, targetTeeTime: String!): Booking
mutation updateBooking(bookingId: ID!, input: UpdateBookingInput!): Booking

# Player management
mutation addPlayerToBooking(bookingId: ID!, input: AddPlayerInput!): Booking
mutation removePlayerFromBooking(bookingId: ID!, playerId: ID!): Booking
mutation assignCartToPlayer(playerId: ID!, cartId: ID): BookingPlayer
mutation assignCaddyToPlayer(playerId: ID!, caddyId: ID): BookingPlayer

# Rental status tracking
mutation updateTeeTimePlayers(id: ID!, players: [TeeTimePlayerInput!]!): TeeTime
mutation updatePlayerCartStatus(playerId: ID!, status: RentalStatus!): BookingPlayer
mutation updatePlayerCaddyStatus(playerId: ID!, status: RentalStatus!): BookingPlayer

# Blocks
mutation createBlock(input: CreateBlockInput!): Block
mutation releaseBlock(blockId: ID!): Boolean

# Party
mutation createParty(input: CreatePartyInput!): Party
mutation addBookingToParty(partyId: ID!, bookingId: ID!): Party
```

### Modified Queries

```graphql
# Modify getTeeSheet to return bookings nested under flights
query getTeeSheet(courseId: ID!, date: Date!): TeeSheet

type TeeSheet {
  flights: [Flight]
}

type Flight {
  id: ID!
  teeTime: String!
  status: FlightStatus        # Derived from bookings
  bookings: [Booking]         # NEW: Nested bookings
  totalPlayers: Int
  capacity: Int
  block: Block                # If blocked
}

type TeeTimePlayer {
  id: ID!
  position: Int!
  playerType: PlayerType!
  member: Member
  guestName: String
  guestEmail: String
  guestPhone: String
  cartType: CartType
  sharedWithPosition: Int
  caddy: Caddy
  checkedInAt: DateTime

  # Booking-time rental preferences
  caddyRequest: String        # 'NONE' | 'REQUEST' | caddyId
  cartRequest: String         # 'NONE' | 'REQUEST'
  rentalRequest: String       # 'NONE' | 'REQUEST'

  # Operational rental status
  cartStatus: RentalStatus    # NONE | REQUESTED | PAID | ASSIGNED | RETURNED
  caddyStatus: RentalStatus   # NONE | REQUESTED | PAID | ASSIGNED | RETURNED
}
```

---

## Implementation Plan

### Phase 1: Foundation (Week 1-2) ✅ COMPLETE

1. **Database schema updates** ✅
   - Add `booking_number` column with generation logic
   - Add audit trail table
   - Add block table

2. **API updates** ✅
   - Modify `getTeeSheet` to return nested bookings
   - Add `getBooking`, `getBookings` queries
   - Add booking lifecycle mutations

3. **Core UI components** ✅
   - BookingStatusBadge
   - BookingChip
   - TimeSlotRow (modified)

### Phase 2: Booking Management (Week 3-4) ✅ COMPLETE

1. **Booking Detail Modal** ✅
   - Modal structure
   - Players section with cart/caddy
   - Action buttons

2. **Bookings Tab** ✅
   - List view
   - Search and filters

3. **Booking actions** ✅
   - Check In, Cancel with confirmation
   - Edit booking modal

### Phase 3: Advanced Features (Week 5-6) ✅ COMPLETE

1. **Placement Mode** ✅
   - Move/Copy workflow with confirmation dialog
   - Visual slot highlighting (green=valid, red=invalid, amber=source)
   - Escape key to cancel, banner with booking info
   - Database persistence via `moveTeeTime` and `createTeeTime` mutations

2. **Audit Trail**
   - History tab in modal
   - Logging all changes

3. **Blocks**
   - Starter block creation
   - Release functionality

### Phase 4: Party & Polish (Week 7-8)

1. **Party Bookings**
   - Party creation flow
   - Visual connectors
   - Party management

2. **Context menus** ✅
   - Right-click actions on bookings and time slots
   - Move/Copy available from context menu

3. **Refinements**
   - Performance optimization
   - Error handling
   - Edge cases

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Time to find specific booking | < 10 seconds |
| Time to check in a booking | < 3 clicks |
| Time to cancel a booking | < 5 clicks |
| Time to move a booking | < 5 clicks |
| Staff adoption of Bookings tab | > 50% use within 1 month |
| Reduction in booking-related support tickets | > 30% |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data migration complexity | High | Test with production data copy, rollback plan |
| Staff learning curve | Medium | Training materials, gradual rollout |
| Performance with many bookings | Medium | Pagination, virtual scrolling, indexing |
| Edge cases with party bookings | Low | Comprehensive testing, clear UX constraints |

---

## Related Documents

- [UX Specification](../golf-booking-management/booking-management-ux-spec.md)
- [Build Prompts](../golf-booking-management/booking-management-build-prompts.md)
- [Golf Module PRD](/docs/product/sections/golf/spec.md)
- [Schedule Configuration Spec](schedule-configuration-ux-spec.md)
