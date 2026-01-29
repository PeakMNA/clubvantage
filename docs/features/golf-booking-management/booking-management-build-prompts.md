# Build-Order Prompts: Golf Booking Management

## Overview

Sequential UI prompts to transform the golf tee sheet from flight-centric to booking-centric, where bookings are first-class entities with independent lifecycle and actions.

## Build Sequence

1. **Booking Status Badge** - Reusable status indicator component
2. **Player Type Badge** - Member/Guest/Dependent/Walk-up indicator
3. **Booking Chip** - Clickable booking representation on tee sheet
4. **Time Slot Row** - Container showing time + booking chips + capacity
5. **Block Element** - Starter/maintenance block display
6. **Booking Detail Modal - Structure** - Modal shell and layout
7. **Booking Detail Modal - Players Section** - Player list with cart/caddy assignment
8. **Booking Detail Modal - Actions** - Action buttons and handlers
9. **Booking Detail Modal - History Tab** - Audit trail display
10. **Placement Mode Overlay** - Move/copy booking interface
11. **Bookings Tab - List View** - Searchable booking table
12. **Bookings Tab - Filters** - Date/status/course filters
13. **Party Booking Indicators** - Linked booking visuals
14. **Context Menus** - Right-click menus for bookings and slots
15. **Confirmation Dialogs** - Cancel/destructive action confirmations

---

## Prompt 1: Booking Status Badge

### Context

A small badge component that displays the current status of a golf booking. Used in booking chips on the tee sheet and in the booking detail modal header. Part of the ClubVantage golf management system.

### Requirements

- Small pill/badge shape displaying booking status text
- Six status variants: Booked, Checked-in, On-course, Completed, Cancelled, No-show
- Each status has distinct background color for instant recognition
- Optional icon prefix for certain statuses

### Visual Specifications

| Status | Background | Text | Icon |
|--------|------------|------|------|
| Booked | bg-blue-500 | text-white | none |
| Checked-in | bg-emerald-500 | text-white | ✓ checkmark |
| On-course | bg-amber-500 | text-white | ⛳ golf flag |
| Completed | bg-stone-100 | text-stone-600 | none |
| Cancelled | bg-stone-100 | text-stone-500 | none, strikethrough text |
| No-show | bg-red-500 | text-white | ⚠ warning |

**Dimensions:**
- Padding: px-2 py-0.5
- Border radius: rounded-full
- Font: text-xs font-medium
- Icon size: 12px, mr-1 spacing from text

### States

- Default: Standard badge appearance per status
- No interactive states (display only)

### Constraints

- Component only - receives status as prop
- Must work in both light chip backgrounds and modal headers
- Do not include any click handlers

---

## Prompt 2: Player Type Badge

### Context

A small badge indicating whether a player is a Member, Guest, Dependent, or Walk-up. Used in player lists within the booking detail modal and potentially on player cards. Part of ClubVantage design system.

### Requirements

- Single letter indicator (M, G, D, W) with colored background
- Compact size to fit inline with player names
- Four variants with distinct colors per player type

### Visual Specifications

| Type | Letter | Background | Text |
|------|--------|------------|------|
| Member | M | bg-blue-500 | text-white |
| Guest | G | bg-amber-500 | text-white |
| Dependent | D | bg-teal-500 | text-white |
| Walk-up | W | bg-stone-200 | text-stone-700 |

**Dimensions:**
- Size: h-5 w-5 (20px square)
- Border radius: rounded-full (circle)
- Font: text-xs font-bold
- Center letter vertically and horizontally

### States

- Default: Standard badge per type
- No interactive states

### Constraints

- Display component only
- Receives playerType prop: 'member' | 'guest' | 'dependent' | 'walkup'

---

## Prompt 3: Booking Chip

### Context

A clickable chip representing a single booking on the tee sheet. Multiple booking chips can appear in one time slot when different groups booked the same tee time. Clicking opens the Booking Detail Modal.

### Requirements

- Displays player names (comma-separated, truncated if long)
- Shows player count badge on right
- Status-aware styling (different colors per booking status)
- Multi-booking differentiation: first booking uses blue scheme, second uses purple
- Clickable with hover state
- Supports right-click for context menu (emit event, don't implement menu)

### Visual Specifications

**Structure:**
```
┌─────────────────────────────────────┐
│ John, Mary                    [2]  │
└─────────────────────────────────────┘
```

**Size:**
- Min-width: 120px
- Height: 36px
- Padding: px-3 py-2
- Border-radius: rounded-lg
- Gap between name and count: flex justify-between

**Status Colors (background/border/text):**
| Status | Background | Border | Text |
|--------|------------|--------|------|
| Booked | bg-blue-50 | border-blue-200 | text-blue-700 |
| Checked-in | bg-emerald-50 | border-emerald-200 | text-emerald-700 |
| On-course | bg-amber-50 | border-amber-200 | text-amber-700 |
| Completed | bg-stone-100 | border-stone-200 | text-stone-500 |
| Cancelled | bg-stone-50 | border-stone-200 | text-stone-400 line-through |
| No-show | bg-red-50 | border-red-200 | text-red-600 |

**Multi-booking colors:**
- Booking index 0 (first): Blue scheme as above
- Booking index 1 (second): Purple scheme (bg-purple-50, border-purple-200, text-purple-700)

**Player count badge:**
- Background: slightly darker than chip (e.g., bg-blue-100 on blue chip)
- Text: same as chip text color
- Size: text-xs, px-1.5 rounded

### States

- Default: Standard chip per status
- Hover: Slight elevation (shadow-md), cursor-pointer
- Selected: Ring outline (ring-2 ring-blue-400) - for keyboard navigation
- Dragging (future): opacity-50 with ghost following cursor

### Interactions

- Click: Emit 'onSelect' event with booking ID
- Right-click: Emit 'onContextMenu' event with booking ID and mouse position
- Keyboard: Enter/Space when focused triggers onSelect

### Props

```typescript
interface BookingChipProps {
  booking: {
    id: string
    playerNames: string[] // ["John Smith", "Mary Lee"]
    playerCount: number
    status: BookingStatus
  }
  bookingIndex: 0 | 1 // For color differentiation
  isSelected?: boolean
  onSelect: (bookingId: string) => void
  onContextMenu: (bookingId: string, position: { x: number, y: number }) => void
}
```

### Constraints

- Does not implement context menu - just emits event
- Does not implement modal - just emits selection
- Truncate player names with ellipsis if exceeds chip width

---

## Prompt 4: Time Slot Row

### Context

A row in the tee sheet grid representing a single tee time (e.g., 06:00, 06:08). Contains the time label, booking chips (0-2 bookings), and capacity indicator. Can also display blocks instead of bookings.

### Requirements

- Time label on left (fixed width)
- Booking area in center (flexible, contains chips or block)
- Capacity indicator on right (X/4 format)
- Available state shows dashed border placeholder
- Blocked state shows lock icon and reason

### Visual Specifications

**Layout:**
```
┌────────┬─────────────────────────────────────────────┬───────┐
│ 06:00  │ [Chip 1] [Chip 2]                          │ 2/4   │
└────────┴─────────────────────────────────────────────┴───────┘
```

**Dimensions:**
- Row height: min-h-[52px]
- Time column: w-20, text-sm font-medium text-stone-600
- Booking area: flex-1, flex gap-2, items-center
- Capacity: w-12, text-xs text-stone-500, text-right

**Available slot (no bookings):**
```
┌────────┬─────────────────────────────────────────────┬───────┐
│ 06:08  │ ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐             │ 0/4   │
│        │   + Add Booking              │             │       │
│        │ └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘             │       │
└────────┴─────────────────────────────────────────────┴───────┘
```
- Dashed border: border-2 border-dashed border-stone-300
- "+ Add Booking" text: text-stone-400, visible on hover

**Blocked slot:**
```
┌────────┬─────────────────────────────────────────────┬───────┐
│ 06:16  │ 🔒 Greens Maintenance         [Release]    │  -    │
└────────┴─────────────────────────────────────────────┴───────┘
```
- Background: bg-gray-100
- Lock icon + reason text: text-gray-600
- Release button: text-sm text-blue-600 hover:underline
- Capacity shows "-" when blocked

**Row styling:**
- Border bottom: border-b border-stone-200
- Hover: bg-stone-50 (subtle highlight)
- Alternating rows: optional zebra striping

### States

- Empty: Dashed placeholder, 0/4 capacity
- Partially filled: 1-2 booking chips, X/4 capacity
- Full: 2 booking chips, 4/4 capacity (or 4 players total), capacity text turns amber
- Blocked: Lock icon, reason, release button
- Placement mode - valid: Green glow border, shows "+N players" preview
- Placement mode - invalid: Red tint, shows "Full" indicator

### Interactions

- Click on empty area: Emit 'onAddBooking' with tee time
- Right-click on empty area: Emit 'onSlotContextMenu'
- Release button click: Emit 'onReleaseBlock' with block ID
- Booking chip interactions delegated to BookingChip component

### Props

```typescript
interface TimeSlotRowProps {
  teeTime: string // "06:00"
  bookings: BookingChipData[]
  totalPlayers: number
  capacity: number // Usually 4
  block?: {
    id: string
    reason: string
    type: 'starter' | 'maintenance'
  }
  placementMode?: {
    active: boolean
    canAccept: boolean
    incomingPlayers: number
  }
  onAddBooking: (teeTime: string) => void
  onSlotContextMenu: (teeTime: string, position: { x: number, y: number }) => void
  onReleaseBlock: (blockId: string) => void
}
```

### Constraints

- Does not manage booking chip state - receives booking data
- Does not implement modals or context menus - emits events
- Maximum 2 booking chips displayed (club policy)

---

## Prompt 5: Block Element

### Context

A visual element representing a blocked time slot on the tee sheet. Used for starter blocks (dynamic operational holds) and maintenance blocks (recurring closures). Replaces booking chips when a slot is blocked.

### Requirements

- Displays lock/wrench icon based on block type
- Shows block reason text
- Shows metadata (created by, time, recurrence info)
- Release button for operational staff
- Different styling for starter vs maintenance blocks

### Visual Specifications

**Starter Block:**
```
┌────────────────────────────────────────────────────────┐
│ 🔒 Pace Adjustment                        [Release]   │
│    Staff: Sarah · Created: 11:45 AM                   │
└────────────────────────────────────────────────────────┘
```
- Icon: Lock (🔒) or Lucide Lock icon
- Background: bg-gray-100
- Border: border border-gray-300
- Text: text-gray-700

**Maintenance Block (recurring):**
```
┌────────────────────────────────────────────────────────┐
│ 🔧 Greens Maintenance (Recurring)                     │
│    Every Monday · Until Dec 31, 2026   [Release Today]│
└────────────────────────────────────────────────────────┘
```
- Icon: Wrench (🔧) or Lucide Wrench icon
- Background: bg-amber-50
- Border: border border-amber-200
- Text: text-amber-800
- "Release Today" for recurring (only releases this instance)

**Dimensions:**
- Height: auto (min 48px)
- Padding: p-3
- Border-radius: rounded-lg
- Icon size: 16px
- Reason text: text-sm font-medium
- Metadata: text-xs text-muted

### States

- Active: Standard block display
- Hover: Subtle shadow elevation
- Released: Block disappears (handled by parent)

### Interactions

- Click Release/Release Today: Emit 'onRelease' with block ID

### Props

```typescript
interface BlockElementProps {
  block: {
    id: string
    type: 'starter' | 'maintenance'
    reason: string
    createdBy?: string
    createdAt?: Date
    recurring?: boolean
    recurrencePattern?: string // "Every Monday"
    recurrenceEndDate?: Date
  }
  onRelease: (blockId: string) => void
}
```

### Constraints

- Display component with release action only
- Does not handle release confirmation - parent should confirm
- Spans full width of booking area in TimeSlotRow

---

## Prompt 6: Booking Detail Modal - Structure

### Context

A centered modal that opens when clicking a booking chip. Displays complete booking information and provides actions for managing the booking. This prompt covers the modal shell and header; subsequent prompts add content sections.

### Requirements

- Centered modal with backdrop blur
- Header shows booking number, status badge, time/course info
- Close button in header
- Scrollable content area
- Fixed action footer
- Keyboard accessible (Escape to close)

### Visual Specifications

**Modal Container:**
- Width: 600px (max-w-[600px])
- Max height: 80vh
- Background: bg-white rounded-2xl
- Shadow: shadow-2xl
- Backdrop: bg-black/30 backdrop-blur-sm

**Header:**
```
┌──────────────────────────────────────────────────────────┐
│  Booking #CV-240128-001                         [X]     │
│  ─────────────────────────────────────────────────────  │
│  [Booked] 06:00 AM · Championship Course · Jan 28, 2026 │
└──────────────────────────────────────────────────────────┘
```
- Booking number: text-lg font-bold
- Close button: absolute top-4 right-4, hover:bg-stone-100 rounded-lg p-2
- Divider: border-b border-stone-200
- Sub-header: flex items-center gap-2
  - Status badge (BookingStatusBadge component)
  - Time: text-sm
  - Separator: · (middle dot)
  - Course: text-sm
  - Date: text-sm text-stone-500

**Content Area:**
- Padding: p-6
- Overflow: overflow-y-auto
- Flex: flex-1

**Footer:**
- Border top: border-t border-stone-200
- Padding: p-4
- Background: bg-stone-50
- Flex: flex gap-3

### States

- Loading: Spinner centered in content area, "Loading booking details..."
- Success: Full content displayed
- Error: Error message with retry button

### Interactions

- Click backdrop: Close modal
- Press Escape: Close modal
- Click close button: Close modal

### Props

```typescript
interface BookingDetailModalProps {
  isOpen: boolean
  bookingId: string | null
  onClose: () => void
  // Content and actions passed as children or separate props
}
```

### Constraints

- This prompt is modal structure only
- Content sections (booker, players, history) are separate prompts
- Actions footer content is a separate prompt
- Must prevent body scroll when open

---

## Prompt 7: Booking Detail Modal - Players Section

### Context

The players section within the Booking Detail Modal. Displays all players in the booking with their type, and allows cart/caddy assignment per player. Also supports adding/removing players.

### Requirements

- Section header with player count (e.g., "PLAYERS (2/4)")
- Add Player button in header (if under capacity)
- Player rows with: position number, name, type badge, cart dropdown, caddy dropdown, rental status dropdowns, remove button
- Cart and caddy are assigned per individual player
- Cart and caddy rental status tracking with dropdowns (None, Requested, Paid, Assigned, Returned)
- Remove requires confirmation

### Visual Specifications

**Section Header:**
```
PLAYERS (2/4)                                [+ Add Player]
```
- Label: text-xs font-semibold text-stone-500 uppercase tracking-wide
- Count: text-stone-400
- Add button: text-sm text-emerald-600 hover:text-emerald-700, flex items-center gap-1

**Player Row:**
```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ 1. John Smith  [M]  Cart: [#12 ▾] [Paid ▾]  Caddy: [Somchai ▾] [Assigned ▾]  [X] │
└──────────────────────────────────────────────────────────────────────────────────┘
```
- Container: p-3 bg-stone-50 rounded-lg border border-stone-200, mb-2
- Position: text-sm font-medium text-stone-600, w-6
- Name: text-sm font-medium text-stone-900, flex-1
- Type badge: PlayerTypeBadge component
- Dropdowns: text-sm, w-24, border border-stone-300 rounded-md
- Remove button: text-stone-400 hover:text-red-500, p-1

**Dropdown options:**
- Cart: List available carts by number, "None" option
- Caddy: List available caddies by name, "None" option
- Rental Status (Cart/Caddy): None, Requested, Paid, Assigned, Returned

**Rental Status Colors:**
| Status | Background | Text |
|--------|------------|------|
| None | bg-stone-100 | text-stone-600 |
| Requested | bg-amber-100 | text-amber-700 |
| Paid | bg-emerald-100 | text-emerald-700 |
| Assigned | bg-blue-100 | text-blue-700 |
| Returned | bg-purple-100 | text-purple-700 |

**Empty state (no players):**
- "No players added yet" message
- Prominent Add Player button

### States

- Default: Player list with assignments
- Editing: Dropdowns open for selection
- Removing: Confirmation tooltip/popover before removal

### Interactions

- Click Add Player: Emit 'onAddPlayer'
- Change cart dropdown: Emit 'onAssignCart' with playerId, cartId
- Change caddy dropdown: Emit 'onAssignCaddy' with playerId, caddyId
- Change cart status dropdown: Emit 'onUpdateCartStatus' with playerId, status
- Change caddy status dropdown: Emit 'onUpdateCaddyStatus' with playerId, status
- Click remove: Show confirmation, then emit 'onRemovePlayer' with playerId

### Props

```typescript
type RentalStatus = 'NONE' | 'REQUESTED' | 'PAID' | 'ASSIGNED' | 'RETURNED'

interface PlayersSectionProps {
  players: Array<{
    id: string
    position: 1 | 2 | 3 | 4
    name: string
    playerType: 'member' | 'guest' | 'dependent' | 'walkup'
    cartId?: string
    caddyId?: string
    cartStatus?: RentalStatus
    caddyStatus?: RentalStatus
  }>
  maxPlayers: number // Usually 4
  availableCarts: Array<{ id: string; number: string }>
  availableCaddies: Array<{ id: string; name: string }>
  onAddPlayer: () => void
  onRemovePlayer: (playerId: string) => void
  onAssignCart: (playerId: string, cartId: string | null) => void
  onAssignCaddy: (playerId: string, caddyId: string | null) => void
  onUpdateCartStatus: (playerId: string, status: RentalStatus) => void
  onUpdateCaddyStatus: (playerId: string, status: RentalStatus) => void
}
```

### Constraints

- Does not implement add player modal - emits event
- Confirmation for remove can be inline popover or separate modal
- Cart/caddy lists should show "None" as first option

---

## Prompt 8: Booking Detail Modal - Actions

### Context

The action buttons in the footer of the Booking Detail Modal. Actions vary based on booking status. This is the primary interface for staff to manage booking lifecycle.

### Requirements

- Actions change based on booking status
- Primary action is visually prominent
- Destructive actions (Cancel) styled as danger
- Move and Copy enter placement mode
- All actions emit events (handled by parent)

### Visual Specifications

**Button Styles:**
| Style | Classes |
|-------|---------|
| Primary | bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl |
| Secondary | border border-stone-300 text-stone-700 hover:bg-stone-50 |
| Danger | border border-red-200 text-red-600 hover:bg-red-50 |

**Actions by Status:**

| Status | Actions |
|--------|---------|
| Booked | [Check In - Primary] [Move] [Copy] [Edit] [Cancel - Danger] |
| Checked-in | [Mark On Course - Primary] [Settle] [Move] [Edit] [Cancel - Danger] |
| On-course | [Mark Finished - Primary] [Settle] [Edit] |
| Completed | [View Receipt] [Copy] |
| Cancelled | [View Details] |
| No-show | [Override Penalty] [View Details] |

**Layout:**
- Flex container with gap-3
- Primary action first (left)
- Danger action last (right)
- Button size: py-2.5 px-4 rounded-xl text-sm font-medium

**Additional Actions (always visible for non-terminal statuses):**
- Resend Confirmation: text button, not in main row, below or in dropdown

### States

- Default: Buttons per status
- Loading: Specific button shows spinner while action processes
- Disabled: Buttons disabled during action processing

### Interactions

- Click Check In: Emit 'onCheckIn'
- Click Mark On Course: Emit 'onMarkOnCourse'
- Click Mark Finished: Emit 'onMarkFinished'
- Click Settle: Emit 'onSettle'
- Click Move: Emit 'onMove' (triggers placement mode)
- Click Copy: Emit 'onCopy' (triggers placement mode)
- Click Edit: Emit 'onEdit'
- Click Cancel: Show confirmation dialog, then emit 'onCancel'
- Click View Receipt: Emit 'onViewReceipt'
- Click Override Penalty: Emit 'onOverridePenalty'
- Click Resend Confirmation: Emit 'onResendConfirmation'

### Props

```typescript
interface BookingActionsProps {
  status: BookingStatus
  isProcessing?: boolean
  processingAction?: string
  onCheckIn: () => void
  onMarkOnCourse: () => void
  onMarkFinished: () => void
  onSettle: () => void
  onMove: () => void
  onCopy: () => void
  onEdit: () => void
  onCancel: () => void
  onViewReceipt: () => void
  onOverridePenalty: () => void
  onResendConfirmation: () => void
}
```

### Constraints

- Does not implement confirmation dialogs - separate component
- Does not implement placement mode - emits event for parent to handle
- Loading state shows spinner on the specific button being processed

---

## Prompt 9: Booking Detail Modal - History Tab

### Context

A tab within the Booking Detail Modal that shows the audit trail for the booking. Records all modifications, status changes, and actions taken on the booking.

### Requirements

- Tab interface: [Details] [History]
- Chronological list of audit entries (newest first)
- Each entry shows: action, user, timestamp, details
- Visual differentiation by action type

### Visual Specifications

**Tab Bar:**
```
[Details] [History]
──────────────────
```
- Tabs: flex gap-4
- Active tab: text-stone-900 font-medium border-b-2 border-emerald-500
- Inactive tab: text-stone-500 hover:text-stone-700

**Audit Entry:**
```
┌─────────────────────────────────────────────────────────┐
│ ● Created                              Jan 27, 3:30 PM │
│   by John Smith (Member Portal)                        │
├─────────────────────────────────────────────────────────┤
│ ● Player added                         Jan 27, 4:15 PM │
│   by Sarah (Staff)                                     │
│   Added: Mary Lee (Guest)                              │
├─────────────────────────────────────────────────────────┤
│ ● Moved                                Jan 28, 9:00 AM │
│   by Sarah (Staff)                                     │
│   From: 06:00 → To: 06:16                              │
└─────────────────────────────────────────────────────────┘
```

**Entry styling:**
- Container: border-l-2 border-stone-200 pl-4 py-3
- Action indicator dot: absolute left, colored by action type
- Action name: text-sm font-medium text-stone-900
- Timestamp: text-xs text-stone-500, float right
- User: text-sm text-stone-600
- Details: text-xs text-stone-500, mt-1

**Action type colors (dot):**
| Action | Dot Color |
|--------|-----------|
| Created | bg-emerald-500 |
| Modified | bg-blue-500 |
| Moved | bg-purple-500 |
| Player added | bg-teal-500 |
| Player removed | bg-orange-500 |
| Checked-in | bg-emerald-500 |
| Cancelled | bg-red-500 |

### States

- Loading: Skeleton entries
- Empty: "No history available" (shouldn't happen - at least "Created")
- Success: List of entries

### Props

```typescript
interface HistoryTabProps {
  entries: Array<{
    id: string
    action: 'created' | 'modified' | 'moved' | 'player-added' | 'player-removed' | 'checked-in' | 'cancelled'
    timestamp: Date
    userName: string
    userRole: string // "Member Portal" | "Staff" | etc.
    details?: Record<string, any>
  }>
  isLoading?: boolean
}
```

### Constraints

- Read-only display
- Entries provided by parent (fetched via API)
- Does not implement filtering or search

---

## Prompt 10: Placement Mode Overlay

### Context

An overlay state activated when user clicks "Move" or "Copy" on a booking. Dims the modal, shows a banner indicating the action, and highlights valid/invalid destination slots on the tee sheet.

### Requirements

- Persistent banner at top of tee sheet
- Shows what's being moved/copied (player names, count)
- Cancel button to exit placement mode
- Tee sheet slots visually indicate valid (green) vs invalid (red)
- Clicking valid slot confirms the action
- Escape key cancels

### Visual Specifications

**Banner:**
```
┌──────────────────────────────────────────────────────────────────┐
│ 📋 Moving: John Smith, Mary Lee (2 players)           [Cancel]  │
└──────────────────────────────────────────────────────────────────┘
```
- Background: bg-blue-50 border-b border-blue-200
- Icon: 📋 or Lucide Clipboard icon
- Text: text-blue-800, font-medium
- Cancel button: text-blue-600 hover:text-blue-800, underline

**For Copy action:**
- Icon: 📄 or Lucide Copy icon
- Text: "Copying: ..."
- Background: bg-purple-50 border-purple-200, text-purple-800

**Slot highlighting during placement mode:**

| Slot State | Visual |
|------------|--------|
| Valid (can accept) | ring-2 ring-emerald-400, bg-emerald-50/50 |
| Invalid (full) | opacity-50, bg-red-50/30 |
| Source slot | ring-2 ring-amber-400, bg-amber-50/50, "Original" label |

**Hover on valid slot:**
- Shows floating indicator: "+2 players" in emerald badge
- Slot border intensifies

**Hover on invalid slot:**
- Shows "Full" indicator in red

### States

- Active: Banner visible, slots highlighted
- Hovering valid: Enhanced glow on slot, preview text
- Hovering invalid: "Full" indicator
- Processing: After click, show spinner on banner, disable interactions
- Success: Toast message, mode exits, tee sheet updates
- Cancelled: Mode exits silently

### Interactions

- Click Cancel: Exit placement mode
- Press Escape: Exit placement mode
- Click valid slot: Confirm placement, trigger mutation
- Click invalid slot: Nothing happens (or subtle shake)

### Props

```typescript
interface PlacementModeProps {
  active: boolean
  action: 'move' | 'copy'
  sourceBooking: {
    id: string
    playerNames: string[]
    playerCount: number
    sourceTeeTime: string
  }
  validSlots: string[] // Tee times that can accept
  onConfirm: (targetTeeTime: string) => void
  onCancel: () => void
  isProcessing?: boolean
}
```

### Constraints

- Parent manages which slots are valid based on capacity
- Does not make API calls - emits events
- Must work with keyboard navigation

---

## Prompt 11: Bookings Tab - List View

### Context

A new tab on the Golf page alongside "Tee Sheet". Shows a searchable, filterable table of all bookings. Useful for finding bookings by booking number, member name, or ID without browsing the tee sheet.

### Requirements

- Prominent search bar at top
- Filters below search (covered in next prompt)
- Data table with sortable columns
- Clicking row opens same Booking Detail Modal
- Default view: Upcoming bookings (today + future)

### Visual Specifications

**Search Bar:**
```
┌──────────────────────────────────────────────────────────────────┐
│ 🔍 Search by booking #, member, or name...                      │
└──────────────────────────────────────────────────────────────────┘
```
- Width: full width
- Height: h-12
- Border: border border-stone-300 rounded-xl
- Icon: text-stone-400, mr-2
- Placeholder: text-stone-400
- Focus: ring-2 ring-emerald-500

**Table:**
```
┌─────────────┬──────────┬───────┬─────────┬───────────┬─────────┬───────────┐
│ Booking #   │ Date     │ Time  │ Course  │ Booker    │ Players │ Status    │
├─────────────┼──────────┼───────┼─────────┼───────────┼─────────┼───────────┤
│ CV-240128-001│ Jan 28   │ 06:00 │ Champ.  │ John Smith│ 2       │ [Booked]  │
│ CV-240128-002│ Jan 28   │ 06:00 │ Champ.  │ Bob Chen  │ 2       │ [Booked]  │
│ CV-240128-003│ Jan 28   │ 14:00 │ Champ.  │ Alice Wong│ 1       │ [Checked] │
└─────────────┴──────────┴───────┴─────────┴───────────┴─────────┴───────────┘
```

**Column specifications:**
| Column | Width | Sortable | Format |
|--------|-------|----------|--------|
| Booking # | 140px | Yes | CV-YYMMDD-NNN |
| Date | 80px | Yes | MMM DD |
| Time | 60px | Yes | HH:MM |
| Course | 100px | Yes | Abbreviated |
| Booker | flex-1 | Yes | Full name |
| Players | 60px | Yes | Number |
| Status | 100px | Yes | Badge |

**Row styling:**
- Hover: bg-stone-50, cursor-pointer
- Border: border-b border-stone-200
- Padding: py-3 px-4

**Empty state:**
```
No upcoming bookings
Create a booking from the Tee Sheet tab
```

**Filtered empty:**
```
No bookings match your search
Try adjusting your filters or search terms
[Clear Filters]
```

### States

- Loading: Skeleton rows (5-6 rows)
- Empty: Empty state message
- Success: Populated table
- Filtered empty: No results message with clear button

### Interactions

- Type in search: Debounced search (300ms)
- Click column header: Sort by column
- Click row: Open Booking Detail Modal for that booking
- Press Enter in search: Immediate search

### Props

```typescript
interface BookingsListProps {
  bookings: Array<{
    id: string
    bookingNumber: string
    date: Date
    teeTime: string
    courseName: string
    bookerName: string
    playerCount: number
    status: BookingStatus
  }>
  isLoading?: boolean
  searchQuery: string
  onSearchChange: (query: string) => void
  onBookingSelect: (bookingId: string) => void
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  onSort: (column: string) => void
}
```

### Constraints

- Does not manage modal state - emits selection event
- Search filtering done by parent (API or local)
- Pagination not required for v1 (can add later)

---

## Prompt 12: Bookings Tab - Filters

### Context

Filter controls for the Bookings Tab list view. Allow staff to narrow down bookings by date range, status, and course.

### Requirements

- Horizontal filter bar below search
- Date range picker
- Status dropdown (multi-select)
- Course dropdown
- Clear all filters button
- Active filters shown as pills

### Visual Specifications

**Filter Bar:**
```
Filters: [Date Range ▾] [Status ▾] [Course ▾]  [Clear]
```
- Container: flex items-center gap-3, py-3
- Label: text-sm text-stone-500
- Dropdowns: border border-stone-300 rounded-lg px-3 py-2

**Date Range Picker:**
- Presets: Today, This Week, This Month, Custom
- Custom shows date inputs
- Display: "Jan 28 - Feb 28" when range selected

**Status Dropdown (multi-select):**
- Options: All, Booked, Checked-in, On-course, Completed, Cancelled, No-show
- Checkboxes for each option
- "All" selected by default
- Display: "2 statuses" when multiple selected

**Course Dropdown:**
- Options: All Courses, [Course 1], [Course 2], ...
- Single select
- Display: Course name or "All Courses"

**Active Filter Pills:**
```
[Jan 28 - Feb 4 ×] [Booked, Checked-in ×] [Championship ×]
```
- Shown when non-default filters active
- Click X to remove that filter
- bg-stone-100 text-stone-700 px-2 py-1 rounded-full text-sm

**Clear All:**
- Only visible when any filter is active
- Text button: text-sm text-blue-600 hover:underline

### States

- Default: All filters at default (upcoming, all statuses, all courses)
- Filtered: Active filters shown as pills
- Dropdown open: Standard dropdown behavior

### Interactions

- Click dropdown: Open filter options
- Select option: Apply filter immediately
- Click pill X: Remove that filter
- Click Clear: Reset all filters to default

### Props

```typescript
interface BookingsFiltersProps {
  filters: {
    dateRange: { start: Date; end: Date } | null
    statuses: BookingStatus[]
    courseId: string | null
  }
  courses: Array<{ id: string; name: string }>
  onFilterChange: (filters: BookingsFilters) => void
  onClear: () => void
}
```

### Constraints

- Does not fetch data - emits filter changes
- Parent handles applying filters to query/data
- Date range uses native date inputs or simple picker (not complex calendar)

---

## Prompt 13: Party Booking Indicators

### Context

Visual indicators showing when multiple bookings across different time slots are part of the same party (group event). Helps staff understand that slots are connected.

### Requirements

- Chain link icon on party booking chips
- Party name prefix on chips
- Vertical connector line between consecutive party slots
- Same color scheme across linked bookings
- "Part of Party" indicator in Booking Detail Modal

### Visual Specifications

**On Tee Sheet - Party Chip:**
```
┌─────────────────────────────────────────────────────────┐
│ 🔗 Smith Wedding: John, Mary, Tom, Sue            [4]  │
└─────────────────────────────────────────────────────────┘
```
- Chain icon: 🔗 or Lucide Link icon, mr-1
- Party name: font-medium, followed by colon
- Player names: normal weight
- Background: Consistent color for all party slots (e.g., all use indigo scheme)

**Vertical Connector:**
```
│ 06:00  │ [🔗 Smith Wedding: ...]          │
│        ├──── (vertical line on left edge)
│ 06:08  │ [🔗 Smith Wedding: ...]          │
│        ├────
│ 06:16  │ [🔗 Smith Wedding: ...]          │
```
- Connector: 3px wide bar on left side of booking area
- Color: indigo-400 or matching party color
- Spans from first to last party slot

**In Booking Detail Modal:**
```
┌──────────────────────────────────────────────────────────┐
│  Booking #CV-240128-001                         [X]     │
│  ─────────────────────────────────────────────────────  │
│  🔗 Part of: Smith Wedding (3 slots, 12 players)       │
│     [View Entire Party]                                 │
├──────────────────────────────────────────────────────────┤
```
- Party banner: bg-indigo-50 border border-indigo-200 rounded-lg p-3, mb-4
- View Entire Party: text-indigo-600 hover:underline

**Party color scheme:**
- Background: bg-indigo-50
- Border: border-indigo-200
- Text: text-indigo-700
- Consistent across all party bookings

### States

- Single booking (no party): No chain icon or connector
- Party booking: Chain icon, party name, connector
- Party modal view: Would show all slots in party (future enhancement)

### Interactions

- Click "View Entire Party": Opens party overview (or scrolls tee sheet to show all party slots)

### Props

```typescript
interface PartyIndicatorProps {
  party: {
    id: string
    name: string
    slotCount: number
    totalPlayers: number
  } | null
  onViewParty?: (partyId: string) => void
}
```

### Constraints

- Connector line only shown when party slots are consecutive
- If party slots are non-consecutive, show chain icon but no connector
- Party overview modal is future enhancement - for now, just indicate linkage

---

## Prompt 14: Context Menus

### Context

Right-click context menus for quick actions on bookings and empty slots. Provides keyboard-accessible alternative to opening the full modal for common actions.

### Requirements

- Booking context menu: Check In, Move, Copy, Edit, Resend Confirm, Cancel
- Empty slot context menu: New Booking, Add Block, Paste (if clipboard)
- Keyboard accessible (arrow keys, Enter, Escape)
- Positioned near click point

### Visual Specifications

**Booking Context Menu:**
```
┌────────────────────────┐
│ ✓ Check In            │
│ ────────────────────── │
│ ✂ Move                │
│ 📋 Copy               │
│ ────────────────────── │
│ ✏ Edit               │
│ 🔔 Resend Confirm     │
│ ────────────────────── │
│ ✕ Cancel              │
└────────────────────────┘
```

**Empty Slot Context Menu:**
```
┌────────────────────────┐
│ + New Booking         │
│ 🔒 Add Block          │
│ ────────────────────── │
│ 📋 Paste              │  ← Only if clipboard has booking
└────────────────────────┘
```

**Styling:**
- Background: bg-white
- Border: border border-stone-200
- Shadow: shadow-xl
- Border-radius: rounded-xl
- Min-width: 180px

**Menu Item:**
- Padding: py-2 px-3
- Hover: bg-stone-100
- Focus: bg-stone-100 outline-none
- Icon: mr-2, text-stone-500
- Text: text-sm text-stone-700
- Cancel: text-red-600

**Divider:**
- border-t border-stone-200, my-1

### States

- Closed: Not visible
- Open: Visible at position
- Item hover/focus: Highlighted
- Disabled item: opacity-50, cursor-not-allowed

### Interactions

- Right-click: Open at cursor position
- Click outside: Close
- Press Escape: Close
- Arrow Up/Down: Navigate items
- Enter: Select focused item
- Click item: Execute action, close menu

### Props

```typescript
interface ContextMenuProps {
  isOpen: boolean
  position: { x: number; y: number }
  type: 'booking' | 'slot'
  bookingStatus?: BookingStatus // For booking menu
  hasClipboard?: boolean // For slot menu
  onClose: () => void
  onAction: (action: string) => void
}
```

### Constraints

- Does not execute actions - emits action name
- Parent handles action execution
- Position adjusts to stay in viewport

---

## Prompt 15: Confirmation Dialogs

### Context

Modal dialogs for confirming destructive or significant actions. Used for Cancel Booking, Remove Player, and Release Block confirmations.

### Requirements

- Centered small modal
- Clear consequence statement
- Input for reason (Cancel Booking)
- Confirm and Cancel buttons
- Supports loading state

### Visual Specifications

**Cancel Booking Dialog:**
```
┌──────────────────────────────────────────────────────────┐
│  Cancel Booking                                   [X]   │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  Are you sure you want to cancel the booking for:       │
│                                                          │
│  • John Smith                                           │
│  • Mary Lee                                             │
│                                                          │
│  06:00 AM · Championship Course · Jan 28, 2026          │
│                                                          │
│  Reason (required):                                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Member request                               ▾ │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  Notes (optional):                                      │
│  ┌─────────────────────────────────────────────────┐    │
│  │                                                 │    │
│  └─────────────────────────────────────────────────┘    │
│                                                          │
│  ⚠️ This will notify the member and may incur a         │
│     late cancellation penalty.                          │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                        [Keep Booking]  [Cancel Booking] │
└──────────────────────────────────────────────────────────┘
```

**Reason Dropdown Options:**
- Member request
- Weather conditions
- Course maintenance
- Staff cancellation
- No show conversion
- Other

**Remove Player Dialog:**
```
┌──────────────────────────────────────────────────────────┐
│  Remove Player                                    [X]   │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  Remove Mary Lee from this booking?                     │
│                                                          │
│  This will reduce the booking to 1 player.              │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                              [Keep Player]  [Remove]    │
└──────────────────────────────────────────────────────────┘
```

**Release Block Dialog:**
```
┌──────────────────────────────────────────────────────────┐
│  Release Block                                    [X]   │
│  ─────────────────────────────────────────────────────  │
│                                                          │
│  Release this time block?                               │
│                                                          │
│  🔒 Pace Adjustment                                     │
│  06:00 - 06:16 · Created by Sarah at 11:45 AM          │
│                                                          │
│  This will make these time slots available for booking. │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                             [Keep Block]  [Release]     │
└──────────────────────────────────────────────────────────┘
```

**Styling:**
- Width: max-w-md (448px)
- Background: bg-white rounded-2xl
- Shadow: shadow-2xl
- Backdrop: bg-black/30 backdrop-blur-sm

**Buttons:**
- Cancel/Keep: Secondary style (border, text-stone-700)
- Confirm (destructive): Danger style (bg-red-600 text-white hover:bg-red-700)
- Confirm (release): Primary style

**Warning text:**
- Icon: ⚠️
- Color: text-amber-700
- Background: bg-amber-50 border border-amber-200 rounded-lg p-3

### States

- Open: Dialog visible
- Processing: Confirm button shows spinner, inputs disabled
- Error: Error message shown above buttons

### Interactions

- Click backdrop: Close (unless processing)
- Press Escape: Close (unless processing)
- Click Keep/Cancel: Close
- Click Confirm: Validate inputs, emit confirm with data

### Props

```typescript
interface ConfirmationDialogProps {
  type: 'cancel-booking' | 'remove-player' | 'release-block'
  isOpen: boolean
  isProcessing?: boolean
  data: {
    // For cancel-booking
    playerNames?: string[]
    teeTime?: string
    courseName?: string
    date?: string
    // For remove-player
    playerName?: string
    remainingPlayers?: number
    // For release-block
    blockReason?: string
    blockTimeRange?: string
    createdBy?: string
    createdAt?: string
  }
  onClose: () => void
  onConfirm: (data: { reason?: string; notes?: string }) => void
}
```

### Constraints

- Reason is required for Cancel Booking
- No required inputs for Remove Player or Release Block
- Error handling shown inline

---

## Implementation Notes

### Build Dependencies

```
Prompt 1 (Status Badge) ─┐
Prompt 2 (Player Badge) ─┼─► Prompt 3 (Booking Chip)
                         │
Prompt 3 (Booking Chip) ─┼─► Prompt 4 (Time Slot Row)
Prompt 5 (Block Element) ┘

Prompt 4 (Time Slot Row) ─► Prompt 10 (Placement Mode)

Prompt 6 (Modal Structure) ─┬─► Prompt 7 (Players Section)
                            ├─► Prompt 8 (Actions)
                            └─► Prompt 9 (History Tab)

Prompt 11 (List View) ─► Prompt 12 (Filters)

Prompt 14 (Context Menus) - Independent
Prompt 15 (Confirmations) - Independent
Prompt 13 (Party Indicators) - Enhancement, can be added last
```

### Suggested Build Order

1. Status Badge, Player Badge (foundations)
2. Booking Chip (core tee sheet element)
3. Time Slot Row, Block Element (tee sheet structure)
4. Modal Structure (container for detail view)
5. Modal Players Section, Actions, History Tab (modal content)
6. Placement Mode (move/copy interaction)
7. Bookings Tab List + Filters (alternate view)
8. Context Menus, Confirmation Dialogs (interactions)
9. Party Booking Indicators (enhancement)

### Design Token Reference

Use ClubVantage design system from CLAUDE.md:
- Primary: Amber (CTAs, active states)
- Secondary: Emerald (success states)
- Neutral: Stone (backgrounds, text)
- Error: Red
- Consistent rounded-xl for cards, rounded-lg for inputs
