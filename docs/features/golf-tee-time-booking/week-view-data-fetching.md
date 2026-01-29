# Week & Month View Data Fetching Architecture

## Overview

This document describes the optimized approach for fetching tee sheet data in the Golf module's week and month views. The solution uses **parallel data fetching** with a **unified data source** to ensure reliability and performance.

## Problem Statement

### Original Approach (Problematic)

The initial implementation used a separate GraphQL endpoint for week view data:

```typescript
// Old approach - separate API endpoint
const { weekViewSlots } = useWeekViewOccupancy({
  courseId,
  startDate,
  enabled: viewMode === 'week',
})
```

**Issues:**
1. **Unreliable data** - The `GetWeekViewOccupancy` API returned empty or stale data
2. **Data inconsistency** - Day view and week view used different APIs, leading to mismatched data
3. **Cache fragmentation** - Two separate caches that didn't share data
4. **Manual sync required** - Had to manually invalidate week view cache on mutations

### Symptoms
- Week view showed all slots as "available" even when bookings existed
- Metrics (showing 11 players) didn't match week view (showing 0 booked)
- Data visible in day view wasn't appearing in week view

## Solution Architecture

### Core Principle: Unified Data Source

**Reuse the working `GetTeeSheet` API** that powers the day view, fetching 7 days of data in parallel.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Week View                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│    ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│    │  Day 1  │  │  Day 2  │  │  Day 3  │  │  Day 4  │  ...     │
│    └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘          │
│         │            │            │            │                 │
│         ▼            ▼            ▼            ▼                 │
│    ┌─────────────────────────────────────────────────┐          │
│    │         GetTeeSheet API (PARALLEL)              │          │
│    │    All 7 requests start simultaneously          │          │
│    └─────────────────────────────────────────────────┘          │
│                           │                                      │
│                           ▼                                      │
│    ┌─────────────────────────────────────────────────┐          │
│    │         React Query Cache (SHARED)              │          │
│    │    Same cache used by Day View                  │          │
│    └─────────────────────────────────────────────────┘          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User switches to Week View
         │
         ▼
┌─────────────────────────┐
│   useWeekTeeSheet()     │
│   Hook initializes      │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PARALLEL FETCH (Promise.all pattern)          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Day 0 ──► useGetTeeSheetQuery({ date: '2026-01-28' }) ──┐     │
│   Day 1 ──► useGetTeeSheetQuery({ date: '2026-01-29' }) ──┤     │
│   Day 2 ──► useGetTeeSheetQuery({ date: '2026-01-30' }) ──┤     │
│   Day 3 ──► useGetTeeSheetQuery({ date: '2026-01-31' }) ──┼──►  │
│   Day 4 ──► useGetTeeSheetQuery({ date: '2026-02-01' }) ──┤     │
│   Day 5 ──► useGetTeeSheetQuery({ date: '2026-02-02' }) ──┤     │
│   Day 6 ──► useGetTeeSheetQuery({ date: '2026-02-03' }) ──┘     │
│                                                                  │
│   Total time = MAX(individual request times)                     │
│   NOT: SUM(individual request times)                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────┐
│   Transform to          │
│   WeekViewSlot[]        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Render Week Grid      │
└─────────────────────────┘
```

## Implementation Details

### 1. The `useWeekTeeSheet` Hook

Location: `/apps/application/src/hooks/use-golf.ts`

```typescript
export interface UseWeekTeeSheetOptions {
  courseId: string;
  startDate: Date;
  enabled?: boolean;
}

export function useWeekTeeSheet(options: UseWeekTeeSheetOptions) {
  const { courseId, startDate, enabled = true } = options;

  // Generate 7 dates for the week
  const weekDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      return date;
    });
  }, [startDate]);

  // Fetch all 7 days in PARALLEL using React Query
  const day0 = useGetTeeSheetQuery(
    { courseId, date: weekDates[0]!.toISOString() },
    { enabled: enabled && !!courseId, staleTime: 30 * 1000 }
  );
  const day1 = useGetTeeSheetQuery(
    { courseId, date: weekDates[1]!.toISOString() },
    { enabled: enabled && !!courseId, staleTime: 30 * 1000 }
  );
  // ... days 2-6

  const dayQueries = [day0, day1, day2, day3, day4, day5, day6];

  // Transform to week view format
  const weekViewSlots = useMemo(() => {
    // ... transformation logic
  }, [dayQueries, weekDates]);

  return {
    weekViewSlots,
    isLoading: dayQueries.some(q => q.isLoading),
    error: dayQueries.find(q => q.error)?.error,
    refetch: () => dayQueries.forEach(q => q.refetch()),
  };
}
```

### 2. Data Transformation

Each tee sheet slot is transformed to the week view format:

```typescript
// Input: TeeTimeSlot from GetTeeSheet API
interface TeeTimeSlot {
  time: string;
  available: boolean;
  booking?: {
    id: string;
    players: Array<{
      id: string;
      position: number;
      playerType: string;
      member?: { firstName: string; lastName: string; memberId: string };
      guestName?: string;
    }>;
  };
}

// Output: WeekViewSlot for week grid
interface WeekViewSlot {
  date: string;        // "2026-01-28"
  time: string;        // "07:00"
  nine: 'FRONT' | 'BACK';
  isBlocked: boolean;
  positions: Array<{
    position: number;  // 1-4
    status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
    player?: {
      id: string;
      name: string;
      type: 'MEMBER' | 'GUEST' | 'DEPENDENT' | 'WALK_UP';
      memberId?: string;
    };
  }>;
}
```

### 3. Integration in Golf Page

Location: `/apps/application/src/app/(dashboard)/golf/page.tsx`

```typescript
// Primary: Use tee sheet API (reliable, parallel)
const { weekViewSlots: weekTeeSheetSlots, isLoading: isWeekTeeSheetLoading } =
  useWeekTeeSheet({
    courseId: selectedCourse,
    startDate: currentDate,
    enabled: !!selectedCourse && viewMode === 'week',
  });

// Fallback: Old API (if needed for backwards compatibility)
const { weekViewSlots: weekViewApiSlots, isLoading: isWeekViewApiLoading } =
  useWeekViewOccupancy({
    courseId: selectedCourse,
    startDate: currentDate,
    enabled: !!selectedCourse && viewMode === 'week' && weekTeeSheetSlots.length === 0,
  });

// Use tee sheet data first, fall back to API
const weekViewSlots = weekTeeSheetSlots.length > 0
  ? weekTeeSheetSlots
  : weekViewApiSlots;
```

## Performance Optimizations

### 1. Parallel Fetching (async-parallel pattern)

**Before (Sequential - Waterfall):**
```
Request 1: |████████| 200ms
Request 2:          |████████| 200ms
Request 3:                    |████████| 200ms
...
Total: 1400ms (7 × 200ms)
```

**After (Parallel):**
```
Request 1: |████████| 200ms
Request 2: |████████| 200ms
Request 3: |████████| 200ms
Request 4: |████████| 200ms
Request 5: |████████| 200ms
Request 6: |████████| 200ms
Request 7: |████████| 200ms
Total: 200ms (max of all)
```

**Improvement: 7× faster initial load**

### 2. Prefetch on Hover (bundle-preload pattern)

```typescript
// Prefetch week data when user hovers over "Week" button
const prefetchWeekView = usePrefetchWeekView();

<button
  onMouseEnter={() => {
    if (mode === 'week' && viewMode !== 'week') {
      prefetchWeekView(selectedCourse, currentDate);
    }
  }}
  onClick={() => setViewMode(mode)}
>
  Week
</button>
```

### 3. Shared Cache (client-swr-dedup pattern)

Since week view uses the same `GetTeeSheet` query as day view:

- **Cache hit**: If user viewed Day 1 in day view, switching to week view gets Day 1 from cache
- **Automatic invalidation**: Mutations invalidate `GetTeeSheet` cache, both views update
- **No duplicate requests**: React Query deduplicates identical queries

### 4. Stale-While-Revalidate

```typescript
{
  staleTime: 30 * 1000,  // Data fresh for 30 seconds
  gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
}
```

## Query Invalidation

When mutations occur (create/update/cancel booking), all related queries are invalidated:

```typescript
// In useGolfMutations hook
const createMutation = useCreateTeeTimeMutation({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['GetTeeSheet'] });
    queryClient.invalidateQueries({ queryKey: ['GetWeekViewOccupancy'] });
  },
});
```

This ensures both day view and week view stay in sync after any booking changes.

## Benefits Summary

| Aspect | Before | After |
|--------|--------|-------|
| **Data Source** | Separate API (unreliable) | Same API as day view (reliable) |
| **Load Time** | Sequential (slow) | Parallel (7× faster) |
| **Data Consistency** | Mismatched between views | Always in sync |
| **Cache Efficiency** | Fragmented | Shared cache |
| **Mutation Sync** | Manual, error-prone | Automatic |
| **Code Complexity** | Two data paths | Unified data path |

---

## Month View Data Fetching

The month view follows the same unified data source pattern as the week view, fetching availability data for calendar display.

### The `useMonthAvailability` Hook

Location: `/apps/application/src/hooks/use-golf.ts`

```typescript
export function useMonthAvailability(options: UseMonthAvailabilityOptions) {
  const { courseId, month, enabled = true } = options;

  // Calculate all dates in the month
  const monthDates = useMemo(() => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    const dates: Date[] = [];
    const current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [month]);

  // Fetch in weekly batches (5 batches × 7 days = 35 max days)
  const weekBatches = useMemo(() => {
    const batches: Date[][] = [];
    for (let i = 0; i < monthDates.length; i += 7) {
      batches.push(monthDates.slice(i, i + 7));
    }
    return batches;
  }, [monthDates]);

  // Parallel fetch each week batch
  // ...transforms to DayAvailability[] format
}
```

### Data Flow

```
User switches to Month View
         │
         ▼
┌─────────────────────────┐
│ useMonthAvailability()  │
│ Hook initializes        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│              BATCHED PARALLEL FETCH (5 week batches)            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Week 1 (Days 1-7)   ──► useWeekBatchQuery() ──┐               │
│   Week 2 (Days 8-14)  ──► useWeekBatchQuery() ──┤               │
│   Week 3 (Days 15-21) ──► useWeekBatchQuery() ──┼──►            │
│   Week 4 (Days 22-28) ──► useWeekBatchQuery() ──┤               │
│   Week 5 (Days 29-31) ──► useWeekBatchQuery() ──┘               │
│                                                                  │
│   Each batch fetches 7 days in parallel                         │
│   Total: up to 35 parallel requests                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────┐
│   Transform to          │
│   DayAvailability[]     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Render Month Grid     │
│   with occupancy bars   │
└─────────────────────────┘
```

### Availability Calculation

For each day, the hook calculates tee time slot usage (not player positions):

```typescript
const totalSlots = teeSheet.length;  // Count of tee time slots

let bookedSlots = 0;
let blockedSlots = 0;
let playerCount = 0;

teeSheet.forEach((slot) => {
  if (!slot.available && !slot.booking) blockedSlots++;
  if (slot.booking) {
    bookedSlots++;
    if (slot.booking.players) playerCount += slot.booking.players.length;
  }
});

const availableSlots = totalSlots - bookedSlots - blockedSlots;
const bookedRatio = bookedSlots / totalSlots;

// Determine level based on booked percentage
let level: AvailabilityLevel = 'open';
if (blockedSlots === totalSlots) level = 'blocked';
else if (bookedRatio >= 0.85) level = 'full';
else if (bookedRatio >= 0.5) level = 'limited';
```

### Month View Display

Each day cell in the month calendar shows:

| Element | Description |
|---------|-------------|
| **Player count** | "X players" or "No bookings" |
| **Slots usage** | "X/Y slots" (booked/total) |
| **Percentage** | Occupancy percentage |
| **Progress bar** | Color-coded by occupancy level |

**Color Coding:**
- 🟢 Empty (0%) - Stone/gray
- 🟢 Low (<30%) - Emerald/green
- 🔵 Moderate (30-60%) - Blue
- 🟡 Busy (60-85%) - Amber/yellow
- 🔴 Full (>85%) - Red

### Prefetch on Hover

```typescript
const prefetchMonthView = usePrefetchMonthView();

<button
  onMouseEnter={() => {
    if (mode === 'month' && viewMode !== 'month') {
      prefetchMonthView(selectedCourse, currentDate);
    }
  }}
  onClick={() => setViewMode(mode)}
>
  Month
</button>
```

### Cache Benefits

Since month view uses the same `GetTeeSheet` API:

- **Shared cache**: Days already viewed in day/week mode are instant
- **Automatic invalidation**: Mutations invalidate all views automatically
- **No extra backend work**: Uses existing reliable API

---

## Day View: Player Rental Icons

The day view tee sheet displays rental/resource icons inline with each player's name for quick visibility.

### Visual Indicators

| Icon | Color | Meaning |
|------|-------|---------|
| 🚗 Car | Blue | Player has a cart rental |
| 👥 Users | Amber | Player has a caddy assigned |

### Player Interface

```typescript
export interface Player {
  id: string
  name: string
  type: PlayerType
  memberId?: string
  handicap?: number
  checkedIn?: boolean
  noShow?: boolean
  groupId?: 1 | 2
  // Resource indicators
  hasCart?: boolean       // Player has a cart rental
  hasCaddy?: boolean      // Player has a caddy assigned
  cartSharedWith?: number // Position of player sharing cart (1-4)
}
```

### Data Transformation

The API provides cart and caddy info per player, which is mapped during tee sheet data transformation:

```typescript
// In golf/page.tsx - transform API data
players: booking.players.map(p => p ? {
  id: p.id,
  name: p.member
    ? `${p.member.firstName} ${p.member.lastName}`
    : p.guestName || 'Guest',
  type: mapPlayerType(p.playerType),
  memberId: p.member?.memberId,
  checkedIn: !!p.checkedInAt,
  // Cart and caddy info from API
  hasCart: !!(p.cartType && p.cartType !== 'NONE' && p.cartType !== 'WALKING'),
  hasCaddy: !!p.caddy,
  cartSharedWith: p.sharedWithPosition,
} : null)
```

### Display in Tee Sheet Row

```tsx
// In PlayerCell component (tee-sheet-row.tsx)
<div className="flex items-center gap-1.5">
  <span className="font-medium text-sm truncate max-w-[100px]">
    {player.name}
  </span>
  {player.hasCart && (
    <span title={player.cartSharedWith
      ? `Cart (shared with P${player.cartSharedWith})`
      : 'Cart rental'}>
      <Car className="h-3.5 w-3.5 text-blue-500" />
    </span>
  )}
  {player.hasCaddy && (
    <span title="Caddy assigned">
      <Users className="h-3.5 w-3.5 text-amber-500" />
    </span>
  )}
</div>
```

### Hover Tooltips

- **Cart icon**: Shows "Cart rental" or "Cart (shared with P#)" if sharing
- **Caddy icon**: Shows "Caddy assigned"

---

## Flight Detail Panel: Per-Player Rental Toggles

Staff can toggle cart and caddy rentals for individual players from the flight detail panel.

### Toggle Buttons

Each player card in the detail panel displays toggle buttons for cart and caddy:

```tsx
// In PlayerCard component (player-card.tsx)
{showRentalToggles && (
  <div className="flex items-center gap-2">
    {/* Cart Toggle */}
    <button
      onClick={() => onToggleCart?.(!player.hasCart)}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium',
        player.hasCart
          ? 'bg-blue-100 text-blue-700'
          : 'bg-muted text-muted-foreground'
      )}
    >
      <Car className="h-3.5 w-3.5" />
      <span>Cart</span>
    </button>

    {/* Caddy Toggle */}
    <button
      onClick={() => onToggleCaddy?.(!player.hasCaddy)}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium',
        player.hasCaddy
          ? 'bg-amber-100 text-amber-700'
          : 'bg-muted text-muted-foreground'
      )}
    >
      <Users className="h-3.5 w-3.5" />
      <span>Caddy</span>
    </button>
  </div>
)}
```

### Visual States

| State | Cart | Caddy |
|-------|------|-------|
| **Active** | Blue background, blue text | Amber background, amber text |
| **Inactive** | Muted background, gray text | Muted background, gray text |

### Handler Implementation

```typescript
// In golf/page.tsx
const handleTogglePlayerCart = useCallback(async (player: Player, hasCart: boolean) => {
  if (!selectedFlight) return

  const updatePlayers = (players: Flight['players']) =>
    players.map((p: Player | null) =>
      p?.id === player.id ? { ...p, hasCart } : p
    ) as Flight['players']

  setFlights((prev: Flight[]) => prev.map((flight: Flight) =>
    flight.id === selectedFlight.id
      ? { ...flight, players: updatePlayers(flight.players) }
      : flight
  ))

  setSelectedFlight((prev: Flight | null) =>
    prev ? { ...prev, players: updatePlayers(prev.players) } : prev
  )
}, [selectedFlight])
```

### Props Flow

```
FlightDetailPanel
  └── onTogglePlayerCart?: (player: Player, hasCart: boolean) => void
  └── onTogglePlayerCaddy?: (player: Player, hasCaddy: boolean) => void
        │
        ▼
    PlayerCard
      └── showRentalToggles?: boolean
      └── onToggleCart?: (hasCart: boolean) => void
      └── onToggleCaddy?: (hasCaddy: boolean) => void
```

---

## File References (Updated)

| File | Purpose |
|------|---------|
| `/apps/application/src/hooks/use-golf.ts` | `useWeekTeeSheet`, `useMonthAvailability` hooks |
| `/apps/application/src/app/(dashboard)/golf/page.tsx` | Hook integration, data transformation, rental toggle handlers |
| `/apps/application/src/components/golf/tee-sheet-row.tsx` | Day view row with player rental icons |
| `/apps/application/src/components/golf/tee-sheet-week-view.tsx` | Week view rendering |
| `/apps/application/src/components/golf/tee-sheet-month-view.tsx` | Month view calendar with occupancy |
| `/apps/application/src/components/golf/player-card.tsx` | Player card with per-player rental toggles |
| `/apps/application/src/components/golf/flight-detail-panel.tsx` | Flight detail panel with rental toggle props |
| `/apps/application/src/components/golf/types.ts` | TypeScript interfaces (Player, DayAvailability) |
| `/apps/application/src/lib/golf/schedule-utils.ts` | `convertSlotsToFlights` transformation |

---

## Future Improvements

1. **Server-side rendering**: Fetch initial week data on the server for faster first paint
2. **Suspense boundaries**: Stream each day's data as it arrives
3. **WebSocket subscriptions**: Real-time updates without polling
4. **Virtual scrolling**: For tee sheets with many time slots
5. **Lightweight month summary API**: Backend endpoint that returns only availability summaries (30 records vs 30 × 85 slots)
