# Cross Booking Mode Design

**Date:** 2026-01-27
**Status:** Approved

## Overview

Add configurable tee sheet mode (18 vs Cross) and always allow 9 or 18-hole booking selection.

- **Tee sheet mode** controls display: single column (18) or dual column with Hole 1 + Hole 10 starts (Cross)
- **Hole selection** (9 or 18) is ALWAYS available when booking, regardless of tee sheet mode

## Goals

1. **Flexible booking** - Players can always choose 9 or 18 holes
2. **Flexible scheduling** - Different tee sheet modes for weekdays vs weekends
3. **Season-aware** - Winter/summer can have different defaults
4. **Holiday overrides** - Special days can force a specific mode
5. **Capacity optimization** - Cross mode doubles tee time capacity with dual starts

---

## Data Model

### GolfScheduleConfig (modified)

```prisma
model GolfScheduleConfig {
  // ...existing fields

  weekdayBookingMode  BookingMode @default(EIGHTEEN)
  weekendBookingMode  BookingMode @default(EIGHTEEN)
}

enum BookingMode {
  EIGHTEEN  // Tee sheet: Single column (Hole 1 start only)
  CROSS     // Tee sheet: Dual columns (Hole 1 + Hole 10 starts)
}
// Note: 9 or 18-hole booking is ALWAYS available regardless of mode
```

### GolfScheduleSeason (modified)

```prisma
model GolfScheduleSeason {
  // ...existing fields

  weekdayBookingMode  BookingMode?  // Override base config
  weekendBookingMode  BookingMode?  // Override base config
}
```

### GolfScheduleSpecialDay (modified)

```prisma
model GolfScheduleSpecialDay {
  // ...existing fields

  bookingMode  BookingMode?  // Override everything for this day
}
```

### Resolution Priority

1. **Special Day** - If date matches, use its `bookingMode`
2. **Season** - If date falls within season, use season's weekday/weekend mode
3. **Base Config** - Use `weekdayBookingMode` or `weekendBookingMode`

---

## UI Changes

### Operating Hours Card

Add booking mode dropdown alongside existing time inputs:

```
Weekdays (Mon-Fri)
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ First Tee   │    │ Last Tee    │    │ Mode        │
│ [06:00]     │    │ [17:00]     │    │ [18 ▾]      │
└─────────────┘    └─────────────┘    └─────────────┘

Weekends (Sat-Sun)
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ First Tee   │    │ Last Tee    │    │ Mode        │
│ [05:30]     │    │ [17:30]     │    │ [Cross ▾]   │
└─────────────┘    └─────────────┘    └─────────────┘
```

**Mode options:**
- **18** - Single start (Hole 1), 18-hole bookings only
- **Cross** - Dual start (Hole 1 + Hole 10), 9 or 18-hole bookings

### Season Manager

Add booking mode fields to season edit form:

```
Booking Mode
Weekday: [18 ▾]        Weekend: [Cross ▾]
```

### Special Day Manager

Add single booking mode override:

```
Booking Mode: [18 ▾]
```

---

## Tee Sheet Display

### Cross Mode Layout

Two-column display showing both starting tees:

```
  Time    │      Hole 1 Start      │      Hole 10 Start
──────────┼────────────────────────┼───────────────────────
 6:00 AM  │ Smith (18) Jones (18)  │ Chen (9) Park (9)
 6:08 AM  │ + Book                 │ Miller (18) Lee (18)
 6:16 AM  │ Wilson (9) Brown (9)   │ + Book
```

**Key behaviors:**
- Each flight shows hole count badge: `(18)` or `(9)`
- Both columns are bookable independently
- 9-hole bookings calculate finish time for crossover conflict prevention

### 18 Mode Layout

Single column (current behavior), Hole 1 start only.

---

## Booking Modal Changes

### Hole Selector (Always Available)

The booking modal ALWAYS shows a hole selector, regardless of tee sheet mode:

```
How many holes?
┌─────────┐  ┌─────────┐
│    9    │  │   18    │  ← amber highlight on selected
└─────────┘  └─────────┘
```

**Behaviors:**
- **Always visible** in booking modal for both 18 and Cross modes
- Default selection: 18 holes
- In Cross mode: 9-hole bookings start from either Hole 1 or Hole 10
- In 18 mode: 9-hole bookings still allowed, but only Hole 1 start available

### Header Update

Show starting tee in modal header:

```
New Booking                                        [X]
Championship Course • 6:00 AM • Jan 27 • Hole 1 Start
```

### BookingPayload Update

```typescript
interface BookingPayload {
  courseId: string
  teeDate: string
  teeTime: string
  holes: 9 | 18          // NEW - number of holes
  startingHole: 1 | 10   // NEW - which tee
  players: PlayerPayload[]
  notes?: string
}
```

---

## Files Affected

### Schema
- `database/prisma/schema.prisma` - Add BookingMode enum and fields

### Backend
- `apps/api/src/graphql/golf/golf.types.ts` - Add BookingMode enum
- `apps/api/src/graphql/golf/golf.input.ts` - Add holes/startingHole to inputs
- `apps/api/src/modules/golf/golf.service.ts` - Handle booking mode in queries

### Frontend Components
- `apps/application/src/components/golf/schedule-config/operating-hours-card.tsx` - Add mode dropdown
- `apps/application/src/components/golf/schedule-config/season-manager.tsx` - Add mode fields
- `apps/application/src/components/golf/schedule-config/special-day-manager.tsx` - Add mode field
- `apps/application/src/components/golf/unified-booking-modal.tsx` - Add hole selector
- `apps/application/src/components/golf/tee-sheet-grid.tsx` - Support two-column Cross layout
- `apps/application/src/components/golf/tee-sheet-row.tsx` - Show hole count badge

### Utilities
- `apps/application/src/lib/golf/schedule-utils.ts` - Add mode to slot generation

---

## Implementation Order

1. **Schema** - Add BookingMode enum and fields to Prisma ✅
2. **Migration** - Create and run database migration ✅
3. **Backend** - Update GraphQL types and resolvers ✅
4. **Operating Hours UI** - Add mode dropdown to config ✅
5. **Season/Special Day UI** - Add mode override fields ✅
6. **Tee Sheet Grid** - Implement two-column Cross layout ✅
7. **Booking Modal** - Add hole selector and starting tee ✅
8. **Conflict Prevention** - Calculate 9-hole finish times for crossover
