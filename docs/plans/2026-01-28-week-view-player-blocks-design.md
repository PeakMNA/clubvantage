# Week View Player Blocks Design

## Overview

Enhance the Golf Week view to show individual player position blocks instead of single colored bars, enabling direct booking interactions without switching to Day view.

## Current vs New Behavior

| Current | New |
|---------|-----|
| Single colored bar per time slot | 4 player blocks per flight |
| Click day header → Day view | Click day header → Day view (unchanged) |
| Click slot → nothing useful | Click empty block → New Booking modal |
| No per-position visibility | Click booked block → Player popover |

---

## Frontend Design

### Grid Structure

Each time slot shows 4 horizontal player blocks. For courses with crossover enabled, two rows display (Front 9 and Back 9):

```
         │    WED 28     │    THU 29     │    FRI 30     │
─────────┼───────────────┼───────────────┼───────────────┤
         │ F [M][G][ ][ ] │ F [ ][ ][ ][ ] │ F [M][M][D][ ] │
6:00 AM  ├───────────────┼───────────────┼───────────────┤
         │ B [ ][ ][ ][ ] │ B [M][ ][ ][ ] │ B [ ][G][ ][ ] │
─────────┼───────────────┼───────────────┼───────────────┤
         │ F [ ][ ][ ][ ] │ F [M][M][ ][ ] │ F [ ][ ][ ][ ] │
6:08 AM  ├───────────────┼───────────────┼───────────────┤
         │ B [ ][ ][ ][ ] │ B [ ][ ][ ][ ] │ B [M][G][G][ ] │
```

**Row indicators:**
- F = Front 9 (starting hole 1)
- B = Back 9 (starting hole 10)
- When crossover disabled: single row per time slot

### Block States and Colors

| Status | Background | Badge | Clickable |
|--------|------------|-------|-----------|
| Available | `bg-stone-100` | none | Yes |
| Member | `bg-blue-500` | white "M" | Yes |
| Guest | `bg-amber-500` | white "G" | Yes |
| Dependent | `bg-teal-500` | white "D" | Yes |
| Walk-up | `bg-stone-300` | "W" | Yes |
| Blocked | `bg-gray-200` striped | none | No |

Block size: ~20-24px wide to fit 4 comfortably in each cell.

### Click Interactions

**Empty block (available position):**
1. Opens full "New Booking" modal for that time slot
2. Modal shows all 4 positions for that flight (Front 9 or Back 9)
3. Clicked position is highlighted (subtle amber border/glow)
4. User can add player to any available position

**Booked block (has player):**
1. Shows anchored popover with:
   - Player name (e.g., "Somchai Tanaka")
   - Player type badge (M/G/D/W)
   - Member ID if applicable
2. Action buttons:
   - **Edit Booking** → opens full booking modal
   - **View Member** → navigates to member profile
   - **Remove** → removes player with confirmation

**Day header (e.g., "THU 29"):**
- Switches to Day view for that date (existing behavior)

**Time label (e.g., "6:00 AM"):**
- No action (label only)

### Component Structure

```
TeeSheetWeekView (modified)
├── WeekViewHeader
│   └── DayHeader (clickable → Day view)
│
├── WeekViewGrid
│   └── WeekViewTimeRow (per time slot)
│       └── WeekViewCell (per day)
│           ├── WeekViewFlight (Front 9 row)
│           │   └── PlayerBlock × 4
│           └── WeekViewFlight (Back 9 row, if crossover)
│               └── PlayerBlock × 4
│
├── PlayerBlockPopover (new)
│   └── Player details + Edit/View/Remove actions
│
└── Uses existing: UnifiedBookingModal
```

### New Components

**PlayerBlock** (`player-block.tsx`)
```typescript
interface PlayerBlockProps {
  status: 'available' | 'booked' | 'blocked'
  playerType?: 'M' | 'G' | 'D' | 'W'
  onClick: () => void
  isHighlighted?: boolean
  disabled?: boolean
}
```

**PlayerBlockPopover** (`player-block-popover.tsx`)
```typescript
interface PlayerBlockPopoverProps {
  player: {
    id: string
    name: string
    type: 'M' | 'G' | 'D' | 'W'
    memberId?: string
  }
  onEdit: () => void
  onViewMember: () => void
  onRemove: () => void
  onClose: () => void
}
```

### Booking Modal Integration

Opening modal from Week view passes additional context:

```typescript
openBookingModal({
  date: "2026-01-29",
  time: "06:00",
  nine: "FRONT",           // Which flight
  highlightPosition: 2,    // 0-indexed clicked position
  existingBooking: null    // or booking data for edit
})
```

After booking completes:
- Modal closes
- Week view refetches cell data
- User stays in Week view

---

## Backend Design

### New GraphQL Query

```graphql
query GetWeekViewOccupancy($input: WeekViewOccupancyInput!) {
  weekViewOccupancy(input: $input) {
    slots {
      date
      time
      nine
      isBlocked
      positions {
        position
        status
        player {
          id
          name
          type
          memberId
        }
      }
    }
  }
}

input WeekViewOccupancyInput {
  courseId: ID!
  startDate: Date!
  endDate: Date!
}
```

### Response Type

```graphql
type WeekViewSlot {
  date: Date!
  time: String!
  nine: NineType!
  isBlocked: Boolean!
  positions: [WeekViewPosition!]!
}

type WeekViewPosition {
  position: Int!
  status: PositionStatus!
  player: WeekViewPlayer
}

type WeekViewPlayer {
  id: ID!
  name: String!
  type: PlayerType!
  memberId: String
}

enum PositionStatus {
  AVAILABLE
  BOOKED
  BLOCKED
}

enum NineType {
  FRONT
  BACK
}

enum PlayerType {
  MEMBER
  GUEST
  DEPENDENT
  WALKUP
}
```

### Service Implementation

**File:** `apps/api/src/modules/golf/week-view.service.ts`

```typescript
async getWeekViewOccupancy(
  courseId: string,
  startDate: Date,
  endDate: Date
): Promise<WeekViewSlot[]> {
  // 1. Get course schedule config (operating hours, interval)
  const config = await this.getScheduleConfig(courseId)

  // 2. Generate all time slots for date range
  const slots = this.generateTimeSlots(startDate, endDate, config)

  // 3. Fetch all bookings in date range
  const bookings = await this.prisma.golfBooking.findMany({
    where: {
      courseId,
      date: { gte: startDate, lte: endDate },
      status: { not: 'CANCELLED' }
    },
    include: {
      players: {
        include: { member: true }
      }
    }
  })

  // 4. Fetch blocked slots
  const blockedSlots = await this.getBlockedSlots(courseId, startDate, endDate)

  // 5. Map bookings to slot positions
  return this.mapBookingsToSlots(slots, bookings, blockedSlots)
}
```

### Performance Considerations

- Week view: 7 days × ~80 slots × 2 nines = ~1,120 cells × 4 positions = ~4,480 states
- Single query fetches all data for the week
- Index on `(courseId, date, status)` for efficient booking lookup
- Consider caching for frequently viewed weeks

### Resolver

**File:** `apps/api/src/graphql/golf/golf.resolver.ts`

```typescript
@Query(() => WeekViewOccupancyResponse)
async weekViewOccupancy(
  @Args('input') input: WeekViewOccupancyInput,
  @CurrentUser() user: User
): Promise<WeekViewOccupancyResponse> {
  await this.authService.requirePermission(user, 'golf:view')

  const slots = await this.weekViewService.getWeekViewOccupancy(
    input.courseId,
    input.startDate,
    input.endDate
  )

  return { slots }
}
```

---

## Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `apps/application/src/components/golf/player-block.tsx` | Clickable position block |
| `apps/application/src/components/golf/player-block-popover.tsx` | Player details popover |
| `apps/api/src/modules/golf/week-view.service.ts` | Week view data service |
| `apps/api/src/graphql/golf/week-view.types.ts` | GraphQL types |

### Modified Files
| File | Changes |
|------|---------|
| `apps/application/src/components/golf/tee-sheet-week-view.tsx` | New grid structure with player blocks |
| `apps/application/src/components/golf/unified-booking-modal.tsx` | Add highlight position support |
| `apps/application/src/app/(dashboard)/golf/page.tsx` | Pass new props, handle week view booking |
| `apps/api/src/graphql/golf/golf.resolver.ts` | Add weekViewOccupancy query |
| `database/prisma/schema.prisma` | No changes needed (uses existing models) |

---

## Testing

### E2E Test Cases

1. **Week view displays player blocks**
   - Navigate to Week view
   - Verify 4 blocks per cell
   - Verify crossover shows 2 rows when enabled

2. **Click empty block opens booking modal**
   - Click available position
   - Verify modal opens with correct date/time/nine
   - Verify clicked position is highlighted

3. **Click booked block shows popover**
   - Click booked position
   - Verify popover shows player name and type
   - Verify Edit/View/Remove actions work

4. **Complete booking from Week view**
   - Click empty block
   - Add player
   - Confirm booking
   - Verify block updates to show booked status

---

## Migration Notes

- No database migrations required
- Feature can be rolled out incrementally
- Existing Day view bookings work unchanged
- Week view query is additive (doesn't change existing queries)
