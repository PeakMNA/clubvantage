# UX Specification: Booking-Centric Golf Tee Sheet Management

## Overview

Transform the golf tee sheet from a flight-centric (time slot) view to a booking-centric view where bookings are first-class entities with their own lifecycle, actions, and management capabilities.

---

## Pass 1: Mental Model

**Primary user intent:** Staff wants to quickly find, view, and manage individual golf bookings to serve members efficiently.

**Likely misconceptions:**

1. **"A tee time IS a booking"** - Users may conflate the time slot (flight) with the booking. Reality: A single tee time can contain multiple independent bookings from different members.

2. **"Cancelling a time slot cancels everyone"** - Users may expect flight-level actions affect all players. Reality: Each booking is independent; cancelling one doesn't affect others in the same slot.

3. **"Players in the same slot are together"** - Users may assume all players at 06:00 are one group. Reality: Two strangers may have booked separately and been paired.

4. **"Check-in is per person"** - Users may try to check in individual players. Reality: Check-in is per booking (all players in a booking check in together).

5. **"Cart/caddy is per booking"** - Users may expect to assign cart to entire booking. Reality: Cart and caddy are assigned per individual player.

**UX principle to reinforce/correct:**
- **Booking as the unit of management** - Visual hierarchy must make clear: Time Slot → Booking(s) → Player(s)
- **Independence of bookings** - Bookings in the same slot should look visually distinct and actionable separately
- **Per-player resources** - Cart/caddy assignment UI must be at player level within booking

---

## Pass 2: Information Architecture

**All user-visible concepts:**

- Tee Sheet (daily schedule grid)
- Time Slot / Flight (06:00, 06:08, etc.)
- Booking (reservation entity)
- Booking Number
- Booking Status (Booked, Checked-in, On-course, Completed, Cancelled, No-show)
- Player (member, guest, dependent)
- Player Type Badge (M, G, D, W)
- Booker / Organizer
- Party Booking (multi-slot group)
- Cart Assignment (per player)
- Caddy Assignment (per player)
- Starter Block (operational hold)
- Maintenance Block (recurring closure)
- Waitlist Entry
- Course
- Date
- Audit Trail / History
- Cancellation Reason

**Grouped structure:**

### Time & Schedule (Primary)
- **Time Slot**: Primary - The backbone of the tee sheet grid
- **Date**: Primary - Navigation and context
- **Course**: Primary - Filter/selector for multi-course clubs
- Rationale: These form the primary navigation frame for finding bookings

### Booking Management (Primary)
- **Booking**: Primary - The core entity users manage
- **Booking Number**: Primary - Unique identifier for search/reference
- **Booking Status**: Primary - Critical for operations workflow
- **Booker/Organizer**: Primary - Who to contact, who pays
- **Players**: Primary - Who is playing
- Rationale: These are the main objects staff interact with daily

### Party & Group (Secondary)
- **Party Booking**: Secondary - Shown when applicable (multi-slot reservations)
- **Linked Bookings**: Secondary - Visual indicator of related bookings
- Rationale: Not every booking is a party; show only when relevant

### Player Resources (Secondary)
- **Cart Assignment**: Secondary - Visible within booking detail
- **Caddy Assignment**: Secondary - Visible within booking detail
- **Cart Rental Status**: Secondary - Tracks rental lifecycle (None → Requested → Paid → Assigned → Returned)
- **Caddy Rental Status**: Secondary - Tracks caddy booking lifecycle (None → Requested → Paid → Assigned → Returned)
- **Player Type**: Secondary - Badge indicator, not primary info
- Rationale: Important but not the first thing staff looks for

### Operational Blocks (Secondary)
- **Starter Block**: Secondary - Visible on tee sheet when present
- **Maintenance Block**: Secondary - Visible on tee sheet when present
- Rationale: Operational controls, not daily booking workflow

### History & Compliance (Hidden/Progressive)
- **Audit Trail**: Hidden - Available in booking detail, not shown by default
- **Cancellation Reason**: Hidden - Shown only for cancelled bookings
- **Waitlist**: Hidden - Accessed via specific action, not always visible
- Rationale: Important for accountability but not primary workflow

---

## Pass 3: Affordances

| Action | Visual/Interaction Signal |
|--------|---------------------------|
| View booking details | Booking chip is clickable (hover state, cursor pointer) |
| Check in a booking | Primary action button in booking modal, prominent position |
| Cancel a booking | Danger-styled button, requires confirmation |
| Move a booking | "Move" button triggers placement mode with visual slot highlighting |
| Copy a booking | "Copy" button, similar to move but creates duplicate |
| Add player to booking | "+" button or "Add Player" in players section |
| Remove player | "X" or trash icon on player row, requires confirmation |
| Assign cart to player | Dropdown selector on player row |
| Assign caddy to player | Dropdown selector on player row |
| Update cart rental status | Color-coded dropdown showing status (None/Requested/Paid/Assigned/Returned) |
| Update caddy rental status | Color-coded dropdown showing status (None/Requested/Paid/Assigned/Returned) |
| Create starter block | Right-click on empty slot, or toolbar action |
| Release block | "Release" button visible on block element |
| Search bookings | Search input field with placeholder text explaining searchable fields |
| Filter bookings | Filter dropdowns/pills clearly labeled |
| Select booking for cut/copy | Click highlights booking, visual selection state |
| Paste booking | Available slots glow/highlight when in placement mode |

**Affordance rules:**
- If user sees a **colored chip** on tee sheet row, they should assume it's a **clickable booking**
- If user sees a **lock icon** on a slot, they should assume it's **blocked/unavailable**
- If user sees a **dashed border slot**, they should assume it's **available for booking**
- If user sees **highlighted green slots**, they should assume **valid paste targets**
- If user sees **red/dimmed slots**, they should assume **cannot paste here (full)**
- If user sees a **badge with initials (M/G/D)**, they should assume **player type indicator**
- If user sees **linked chain icon**, they should assume **part of a party booking**
- If user sees **color-coded rental status badge** (amber=requested, green=paid, blue=assigned, purple=returned), they should assume **cart/caddy rental lifecycle status**

---

## Pass 4: Cognitive Load

**Friction points:**

| Moment | Type | Simplification |
|--------|------|----------------|
| Finding a specific booking | Uncertainty | Prominent search bar with placeholder: "Search by booking #, member name, or ID" |
| Understanding who is in which booking | Uncertainty | Color-coded booking chips (blue for booking 1, purple for booking 2 in same slot) |
| Knowing if a slot can accept more players | Choice | Show player count on slot (e.g., "2/4") and visual capacity indicator |
| Deciding where to move a booking | Choice | Placement mode highlights only valid destinations, dims invalid ones |
| Confirming destructive action (cancel) | Choice | Confirmation modal with clear consequence statement |
| Understanding party booking scope | Uncertainty | Visual connector between linked slots, "Party: [name]" label |
| Checking booking history | Choice | Single "History" tab in modal, chronological list |
| Knowing booking status at a glance | Uncertainty | Status badge with distinct colors on each booking chip |

**Defaults introduced:**
- **Bookings tab shows "Upcoming"**: Staff typically looks for future bookings, not past (reduces date range decision)
- **Tee sheet defaults to "Today"**: Most common operational view
- **Search matches all fields**: No need to specify "search by name" vs "search by ID"
- **Placement mode auto-selects same course**: When moving, default to same course unless changed
- **Cart/caddy default to "None"**: No pre-selection, explicit assignment required

---

## Pass 5: State Design

### Tee Sheet Grid

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Empty (no bookings) | Grid with time slots, all showing dashed borders and "Available" | No bookings for this date/course | Create new booking by clicking slot |
| Loading | Skeleton grid with shimmer animation | Data is being fetched | Wait |
| Success | Populated grid with booking chips | Bookings exist for this date | Click bookings to view/manage |
| Partial (some times blocked) | Mix of booking chips, blocks, and available slots | Some times available, some booked/blocked | Interact with available slots or existing bookings |
| Error | Error message with retry button | Failed to load tee sheet | Retry or contact support |

### Booking Chip (on Tee Sheet)

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Booked | Blue/purple chip with player names, "Booked" badge | Reservation confirmed, not yet arrived | Click to check in, cancel, or edit |
| Checked-in | Green chip with checkmark, "Checked-in" badge | Players have arrived | Click to mark on-course or settle |
| On-course | Amber chip with golf icon, "On Course" badge | Players are playing | Click to mark finished or settle |
| Completed | Gray chip, "Finished" badge | Round complete | Click to view receipt/details |
| Cancelled | Strikethrough text, muted colors | Booking was cancelled | Click to view cancellation details |
| No-show | Red chip with warning icon | Players didn't arrive | Click to override penalty or view details |

### Booking Detail Modal

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Empty | N/A (modal doesn't open without booking) | N/A | N/A |
| Loading | Modal shell with spinner | Fetching booking details | Wait |
| Success | Full booking details, players, actions | Viewing complete booking info | Take any available action |
| Partial (missing player info) | Booking details with "Unknown" for some players | Some player data unavailable | Still manage booking, contact member for info |
| Error | Error message in modal | Failed to load details | Retry or close |

### Placement Mode (Move/Copy)

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Active | Banner "Moving: [players]", green/red slot highlighting | In process of selecting destination | Click valid slot or press Escape |
| Hovering valid slot | Slot glows brighter, shows "+2 players" preview | This slot can accept the booking | Click to confirm |
| Hovering invalid slot | Slot shows red, "Full" indicator | Cannot place here | Choose different slot |
| Success | Brief success toast, modal closes, tee sheet updates | Move/copy completed | Continue working |
| Error | Error toast with reason | Move failed (conflict, etc.) | Try different slot or cancel |

### Bookings Tab (List View)

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Empty | "No upcoming bookings" message | No future bookings exist | Create new booking |
| Loading | Skeleton table rows | Fetching bookings | Wait |
| Success | Table with booking rows | Viewing booking list | Click row to open modal, use filters/search |
| Filtered empty | "No bookings match filters" | Filter too restrictive | Clear or adjust filters |
| Error | Error message with retry | Failed to load | Retry |

### Starter/Maintenance Block

| State | User Sees | User Understands | User Can Do |
|-------|-----------|------------------|-------------|
| Active | Lock icon, reason text, "Release" button | Time is blocked | Release early if needed |
| Released | Slot returns to available state | Block removed | Book the slot |

---

## Pass 6: Flow Integrity

**Flow risks:**

| Risk | Where | Mitigation |
|------|-------|------------|
| User clicks booking expecting flight actions | Booking chip click | Modal title clearly shows "Booking #XXXX" not "Tee Time 06:00" |
| User cancels wrong booking in multi-booking slot | Cancel action | Confirmation shows specific booking details: "Cancel booking for John, Mary?" |
| User doesn't realize they're in placement mode | After clicking Move | Persistent banner at top, Escape to cancel, click outside to cancel |
| User pastes to wrong slot | Placement mode | Require click confirmation, show preview of result before committing |
| User can't find booking, doesn't know to use search | Bookings tab | Prominent search bar with helpful placeholder text |
| User doesn't realize party bookings are linked | Tee sheet view | Visual connector line between party slots, chain icon on chips |
| User tries to check in individual player | Booking modal | No per-player check-in button; only booking-level "Check In" |
| User assigns cart to wrong player | Player resource dropdowns | Player name visible next to each dropdown |
| User doesn't see audit trail | Booking modal | "History" tab clearly visible in modal tabs |
| User creates block but can't remove it | Tee sheet | "Release" button always visible on block elements |

**Visibility decisions:**

**Must be visible:**
- Booking status (badge on chip and in modal header)
- Player count per slot (capacity indicator)
- Booking number (in modal, in search results)
- Action buttons (Check In, Cancel, Move, etc. in modal)
- Placement mode indicator (banner when active)
- Block reason (on starter/maintenance blocks)
- Party linkage (visual connector for multi-slot parties)

**Can be implied:**
- Booking ID format (users don't need to know structure)
- Audit trail entries (hidden in History tab)
- Cancellation policy details (shown only when cancelling)
- Exact timestamps (shown in History, not main view)
- Per-player billing split (handled in billing module)

**UX constraints for visual phase:**
1. Booking chips must be visually distinct from flight/slot containers
2. Multi-booking slots must show bookings as separate elements, not merged
3. Status colors must be consistent between tee sheet chips and modal badges
4. Placement mode must dim/disable all non-placement interactions
5. Modal must have fixed action footer visible without scrolling
6. Search results must be clickable to open same modal as tee sheet
7. Block elements must look different from bookings (lock icon, different shape)
8. Party bookings must have visual connector visible at tee sheet zoom level

---

## Visual Specifications

### Screen Inventory

1. **Golf Page - Tee Sheet Tab** (modified)
2. **Golf Page - Bookings Tab** (new)
3. **Booking Detail Modal** (new)
4. **Placement Mode Overlay** (new state)
5. **Block Management** (enhancement to existing)
6. **Party Booking Indicators** (new component)

### Component Specifications

#### 1. Booking Chip (Tee Sheet)

```
┌─────────────────────────────────────┐
│ [Status] John, Mary        [2]     │
│          └── Player names  └── Count
└─────────────────────────────────────┘
```

**Variants by status:**
| Status | Background | Border | Text | Icon |
|--------|------------|--------|------|------|
| Booked | bg-blue-50 | border-blue-200 | text-blue-700 | none |
| Checked-in | bg-emerald-50 | border-emerald-200 | text-emerald-700 | ✓ |
| On-course | bg-amber-50 | border-amber-200 | text-amber-700 | ⛳ |
| Completed | bg-stone-100 | border-stone-200 | text-stone-500 | none |
| Cancelled | bg-stone-50 | border-stone-200 | text-stone-400 | line-through |
| No-show | bg-red-50 | border-red-200 | text-red-600 | ⚠ |

**Multi-booking in same slot:**
- Booking 1: Blue color scheme
- Booking 2: Purple color scheme
- Visual gap between chips

**Interactions:**
- Hover: Slight elevation, cursor pointer
- Click: Opens Booking Detail Modal
- Right-click: Context menu (Check In, Cancel, Move, Copy)

#### 2. Time Slot Row (Tee Sheet)

```
┌────────┬─────────────────────────────────────────────┐
│ 06:00  │ [Booking Chip 1] [Booking Chip 2]    [2/4] │
│        │                                      └── Capacity
└────────┴─────────────────────────────────────────────┘
```

**Available slot:**
```
┌────────┬─────────────────────────────────────────────┐
│ 06:08  │ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  [0/4]     │
│        │   + Add Booking              │             │
│        │ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘             │
└────────┴─────────────────────────────────────────────┘
```

**Blocked slot:**
```
┌────────┬─────────────────────────────────────────────┐
│ 06:16  │ 🔒 Greens Maintenance         [Release]    │
└────────┴─────────────────────────────────────────────┘
```

#### 3. Booking Detail Modal

**Size:** 600px wide, max 80vh height
**Position:** Centered with backdrop blur

```
┌──────────────────────────────────────────────────────────┐
│  Booking #CV-240128-001                    [X]          │
│  ────────────────────────────────────────────────────── │
│  [Booked] 06:00 AM · Championship Course · Jan 28, 2026 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  BOOKED BY                                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 👤 John Smith (M-1234)              [View Profile]│    │
│  │    Created: Jan 27, 2026 3:30 PM                 │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  PLAYERS (2/4)                           [+ Add Player] │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 1. John Smith      [M]    Cart: [#12 ▾] Caddy: [Somchai ▾] [X] │
│  │ 2. Mary Lee        [G]    Cart: [#12 ▾] Caddy: [None ▾]    [X] │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ─────────────────────────────────────────────────────  │
│  [Details] [History]                                     │
│                                                          │
│  Notes: Celebrating birthday, please arrange cake        │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  [Check In]  [Move]  [Copy]  [Edit]  [Cancel]           │
└──────────────────────────────────────────────────────────┘
```

**Action Button Styles:**
| Button | Style | Position |
|--------|-------|----------|
| Check In | Primary (emerald gradient) | First |
| Move | Secondary (outline) | Middle |
| Copy | Secondary (outline) | Middle |
| Edit | Secondary (outline) | Middle |
| Cancel | Danger (red outline) | Last |

#### 4. Placement Mode Overlay

**Banner (top of tee sheet):**
```
┌──────────────────────────────────────────────────────────┐
│ 📋 Moving: John Smith, Mary Lee (2 players)    [Cancel] │
└──────────────────────────────────────────────────────────┘
```

**Slot highlighting:**
- Valid slots: Green glow, shows "+2 players" on hover
- Invalid slots: Red tint, shows "Full" on hover
- Original slot: Yellow border (where booking came from)

#### 5. Bookings Tab (List View)

```
┌──────────────────────────────────────────────────────────┐
│  🔍 Search by booking #, member, or name...             │
│  ────────────────────────────────────────────────────── │
│  Filters: [Date Range ▾] [Status ▾] [Course ▾]  [Clear] │
├──────────────────────────────────────────────────────────┤
│  Booking #    │ Date     │ Time  │ Course  │ Booker    │ Players │ Status    │
│  ─────────────┼──────────┼───────┼─────────┼───────────┼─────────┼───────────│
│  CV-240128-001│ Jan 28   │ 06:00 │ Champ.  │ John Smith│ 2       │ [Booked]  │
│  CV-240128-002│ Jan 28   │ 06:00 │ Champ.  │ Bob Chen  │ 2       │ [Booked]  │
│  CV-240128-003│ Jan 28   │ 14:00 │ Champ.  │ Alice Wong│ 1       │ [Checked-in]│
└──────────────────────────────────────────────────────────┘
```

**Row interactions:**
- Hover: Background highlight
- Click: Opens same Booking Detail Modal

#### 6. Party Booking Indicator

**On Tee Sheet:**
```
┌────────┬─────────────────────────────────────────────┐
│ 06:00  │ [🔗 Smith Wedding: John, Mary, Tom, Sue]    │
├────────┼─────────────────────────────────────────────┤
│ 06:08  │ [🔗 Smith Wedding: Bob, Alice, Eve, Dan]    │ ← Visual connector
├────────┼─────────────────────────────────────────────┤
│ 06:16  │ [🔗 Smith Wedding: Chris, Pat, Sam, Jo]     │
└────────┴─────────────────────────────────────────────┘
```

**Party chips have:**
- Chain link icon (🔗)
- Party name prefix
- Same color scheme across all linked bookings
- Vertical connector line on left edge

**In Booking Modal:**
- "Part of: Smith Wedding (3 slots, 12 players)"
- "View Entire Party" button
- Option to manage party or individual booking

#### 7. Block Element

```
┌────────┬─────────────────────────────────────────────┐
│ 12:00  │ 🔒 Pace Adjustment            [Release]    │
│        │    Staff: Sarah · Created: 11:45 AM        │
└────────┴─────────────────────────────────────────────┘
```

**Maintenance block (recurring):**
```
┌────────┬─────────────────────────────────────────────┐
│ 06:00  │ 🔧 Greens Maintenance (Recurring)          │
│        │    Every Monday · Until Dec 31, 2026       │
│ 06:08  │ 🔧                              [Release Today] │
└────────┴─────────────────────────────────────────────┘
```

### Interaction Specifications

#### Keyboard Shortcuts

| Shortcut | Context | Action |
|----------|---------|--------|
| `Escape` | Placement mode | Cancel move/copy |
| `Escape` | Modal open | Close modal |
| `Ctrl/Cmd + F` | Tee sheet | Focus search (if Bookings tab) |
| `Ctrl/Cmd + X` | Booking selected | Cut (enter move mode) |
| `Ctrl/Cmd + C` | Booking selected | Copy (enter copy mode) |
| `Ctrl/Cmd + V` | Slot focused + clipboard | Paste booking |

#### Context Menu (Right-click on Booking)

```
┌────────────────────┐
│ ✓ Check In        │
│ ────────────────── │
│ ✂ Move            │
│ 📋 Copy           │
│ ────────────────── │
│ ✏ Edit           │
│ 🔔 Resend Confirm │
│ ────────────────── │
│ ✕ Cancel          │
└────────────────────┘
```

#### Context Menu (Right-click on Empty Slot)

```
┌────────────────────┐
│ + New Booking     │
│ 🔒 Add Block      │
│ ────────────────── │
│ 📋 Paste          │ ← Only if clipboard has booking
└────────────────────┘
```

### Responsive Considerations

**Desktop (1200px+):** Full tee sheet grid with all columns visible
**Tablet (768-1199px):** Condensed chip view, modal becomes full-width slide-in
**Mobile (< 768px):** Single-column time list, tap to expand slot, bottom sheet modal

### Design System Alignment

Per CLAUDE.md design system:

**Status Colors:**
| Status | Background | Text |
|--------|------------|------|
| Booked | bg-blue-500 | text-white |
| Checked-in | bg-emerald-500 | text-white |
| On-course | bg-amber-500 | text-white |
| Completed | bg-stone-100 | text-stone-600 |
| Cancelled | bg-stone-100 | text-stone-500 (strikethrough) |
| No-show | bg-red-500 | text-white |
| Blocked | bg-gray-200 | text-gray-600 |

**Player Type Badges:**
| Type | Background | Text |
|------|------------|------|
| Member (M) | bg-blue-500 | text-white |
| Guest (G) | bg-amber-500 | text-white |
| Dependent (D) | bg-teal-500 | text-white |
| Walk-up (W) | bg-stone-200 | text-stone-700 |

**Visual Patterns:**
- Card: `bg-white/80 backdrop-blur-sm shadow-lg shadow-stone-200/30 rounded-xl`
- Modal backdrop: `bg-black/30 backdrop-blur-sm`
- Primary button: `bg-gradient-to-br from-amber-500 to-amber-600 text-white`
- Danger button: `border border-red-200 text-red-600 hover:bg-red-50`

---

## Data Model Reference

```typescript
interface Booking {
  id: string
  bookingNumber: string // CV-YYMMDD-NNN
  status: 'booked' | 'checked-in' | 'on-course' | 'completed' | 'cancelled' | 'no-show'

  // Time slot reference
  flightId: string
  teeTime: string // "06:00"
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
  preferences?: {
    stayTogether?: boolean
    openToPairing?: boolean
  }

  // Timestamps
  createdAt: Date
  createdBy: string
  modifiedAt: Date
  modifiedBy: string

  // Cancellation (if cancelled)
  cancelledAt?: Date
  cancelledBy?: string
  cancelReason?: string
  lateCancellation?: boolean
}

interface BookingPlayer {
  id: string
  playerId: string
  playerType: 'member' | 'guest' | 'dependent' | 'walkup'
  position: 1 | 2 | 3 | 4

  // Resources (per player)
  cartId?: string
  caddyId?: string

  // Guest info (if guest)
  guestName?: string
  guestPhone?: string
}

interface Flight {
  id: string
  teeTime: string
  teeDate: Date
  courseId: string

  // Derived from bookings
  status: DerivedFlightStatus
  bookings: Booking[]
  totalPlayers: number
  capacity: 4

  // Blocks
  blockId?: string
  blockType?: 'starter' | 'maintenance'
  blockReason?: string
}

interface Party {
  id: string
  name: string
  organizerId: string
  bookingIds: string[]
  totalPlayers: number

  // Billing
  greenFeesPaidBy: 'organizer' | 'individual'
}

interface Block {
  id: string
  type: 'starter' | 'maintenance'
  reason: string

  // Time range
  courseId: string
  startTime: string
  endTime: string
  date?: Date // For one-time blocks

  // Recurrence (for maintenance)
  recurring?: boolean
  recurrencePattern?: string // "WEEKLY:MON"
  recurrenceEndDate?: Date

  // Metadata
  createdAt: Date
  createdBy: string
  releasedAt?: Date
  releasedBy?: string
}

interface AuditEntry {
  id: string
  bookingId: string
  action: 'created' | 'modified' | 'cancelled' | 'checked-in' | 'moved' | 'player-added' | 'player-removed'
  timestamp: Date
  userId: string
  userName: string
  details: Record<string, any>
}
```

---

## Implementation Notes

### Tab Addition
Add "Bookings" tab to existing golf page tabs:
```
Tee Sheet | Bookings | Courses | Carts | Caddies
```

### API Changes Required
1. Refactor `getTeeSheet` to return bookings nested under flights
2. Add `getBookings` query with filters for Bookings tab
3. Add `moveBooking`, `copyBooking` mutations
4. Add `createBlock`, `releaseBlock` mutations
5. Add `getBookingHistory` query for audit trail
6. Add booking number generation logic

### State Management
- Clipboard state for move/copy (booking ID, action type)
- Placement mode state (active, source booking, valid targets)
- Selected booking for modal

### Migration
- Existing booking data structure may need migration
- Booking numbers need to be backfilled or generated on-demand
