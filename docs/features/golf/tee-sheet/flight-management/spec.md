# Golf / Tee Sheet / Flight Management

## Overview

Flight management covers the tee sheet grid display, time slot management, view modes (day/week/month), operational blocks (starter, maintenance), and the visual representation of bookings on the tee sheet. A "flight" is a single tee time slot with capacity for up to 4 players across one or more bookings. This is the primary operational view for golf staff.

## Status

Implemented. Day view, week view (parallel data fetching), and month view functional. Block management partially implemented. Starter and maintenance views designed.

## Capabilities

- **Day view**: Full tee sheet grid with time slots, booking chips, capacity indicators
- **Week view**: 7-day grid with per-position player blocks (4 blocks per slot)
- **Month view**: Calendar with occupancy bars per day
- **Cross-tee display**: Dual rows per time slot (Front 9 / Back 9) in cross mode
- **Starter blocks**: Staff can block time slots for pace management
- **Maintenance blocks**: Recurring or one-time blocks for course maintenance
- **Block creation** via right-click or toolbar
- **Block release** (early removal)
- **Real-time updates** via subscription
- **Visual status**: Booking chips colored by status (blue=booked, green=checked-in, amber=on-course, grey=completed, red=no-show, strikethrough=cancelled)
- **Capacity indicator** per slot (e.g., "2/4")
- **Available slots** shown with dashed border and "+ Add Booking" affordance
- **Player type badges**: M (member/blue), G (guest/amber), D (dependent/teal), W (walk-up/stone)
- **Party booking** visual connector between linked slots

## Dependencies

### Interface Dependencies

- **Golf / Tee Sheet / Schedule** - Generates time slots from schedule config
- **Golf / Tee Sheet / Booking** - Populates slots with booking data
- **Golf / Courses / Configuration** - Course selection, cross-tee mode

### Settings Dependencies

- `golf/tee-sheet/schedule` - time slot generation
- `golf/courses/configuration` - play format (cross-tee), course list

### Data Dependencies

- **Reads**: ScheduleConfig, Flight, Booking, Block, Course
- **Writes**: Block
- **Events**: flight.updated, block.created, block.released
- **Subscriptions**: teeSheet.updated (real-time)

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| defaultView | Enum | DAY | Golf Ops Manager | Default tee sheet view: DAY, WEEK, MONTH |
| refreshInterval | Integer (sec) | 30 | Golf Ops Manager | Auto-refresh interval for real-time updates |
| showCapacityIndicator | Boolean | true | Golf Ops Manager | Show player count on slots |
| showPlayerNames | Boolean | true | Golf Ops Manager | Show names on booking chips |
| compactMode | Boolean | false | Golf Ops Manager | Condensed display for smaller screens |
| weekViewStartDay | Enum | MONDAY | Golf Ops Manager | First day of week in week view |
| monthViewOccupancyThresholds | Object | {low: 25, medium: 50, high: 75} | Golf Ops Manager | Color thresholds for month view bars |

## Data Model

```typescript
interface Flight {
  id: string
  teeTime: string
  teeDate: Date
  courseId: string
  nine: 'FRONT' | 'BACK' // for cross-tee mode
  status: DerivedFlightStatus // derived from bookings
  bookings: Booking[]
  totalPlayers: number
  capacity: number // typically 4
  blockId?: string
  blockType?: 'STARTER' | 'MAINTENANCE'
  blockReason?: string
}

type DerivedFlightStatus =
  | 'AVAILABLE'    // no bookings
  | 'PARTIAL'      // some positions filled
  | 'FULL'         // all positions filled
  | 'BLOCKED'      // blocked by starter/maintenance
  | 'IN_PROGRESS'  // has checked-in players
  | 'COMPLETED'    // all bookings completed

interface Block {
  id: string
  type: 'STARTER' | 'MAINTENANCE'
  reason: string
  courseId: string
  startTime: string
  endTime: string
  date?: Date // one-time blocks
  recurring?: boolean
  recurrencePattern?: string // "WEEKLY:MON"
  recurrenceEndDate?: Date
  createdAt: Date
  createdBy: string
  releasedAt?: Date
  releasedBy?: string
}

interface WeekViewSlot {
  date: Date
  time: string
  nine: 'FRONT' | 'BACK'
  isBlocked: boolean
  positions: {
    position: 1 | 2 | 3 | 4
    status: 'AVAILABLE' | 'MEMBER' | 'GUEST' | 'DEPENDENT' | 'WALK_UP' | 'BLOCKED'
    player?: { name: string; bookingId: string }
  }[]
}
```

## Business Rules

- Flight status is derived from aggregate booking statuses (not stored directly).
- Week view fetches 7 days in parallel using the same query as day view (shared cache).
- Month view fetches in batches of 5 weeks (up to 35 parallel requests).
- Blocked slots cannot accept new bookings.
- Starter blocks are temporary (pace management); maintenance blocks can be recurring.
- Recurring maintenance blocks can be released for a single day without affecting the pattern.
- Day header click in week view switches to day view for that date.
- Empty position click in week view opens booking modal pre-filled with date/time.

### Week View Performance

- **Parallel fetch**: 7 x GetTeeSheet queries simultaneously
- **Result**: max(200ms) vs sequential 7 x 200ms = 1400ms (7x faster)
- **Shared React Query cache** with day view ensures consistency

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Block overlaps existing booking | Block creation prevented; must cancel booking first |
| Recurring block on holiday | Special day takes priority; block skipped |
| Release recurring block single day | Only that day released; pattern continues |
| Very long day (5am-7pm) | Scrollable grid; time column sticky |
| Cross-tee mid-day switch | Not supported; entire day uses one format |
| Real-time conflict | Optimistic update with server reconciliation |
| Month view high traffic day | Occupancy bar red; click opens day view |
| No schedule config | Fallback to default 10-min intervals |
