# Unified Booking Modal Design

**Date:** 2026-01-27
**Status:** Approved
**Replaces:** `AddPlayerModal`, portions of `BookTeeTimeModal`

## Overview

Consolidate "add player to flight" and "new booking" into a single context-aware modal that provides a consistent booking experience regardless of entry point.

## Goals

1. **Unified flow** - One modal for all booking scenarios
2. **Context-aware** - Adapts UI based on empty slot vs. existing flight
3. **Per-player options** - Caddy, cart, and rental assigned individually
4. **Reduced friction** - No redundant selections, smart defaults

## Entry Points

### Empty Slot (New Booking)
- User clicks "Book" on an available time slot
- Modal opens with time pre-selected
- Shows full booking form starting with golfer count
- Booker auto-assigned to position 1

### Existing Flight (Edit Booking)
- User clicks on a booked time slot
- Modal opens showing current players with their options
- Full control: add, modify, or remove players
- Can expand to see/edit booking notes

### Header Display

```
New Booking                              [X]
Championship Course • 6:00 AM • Jan 27
```

```
Edit Booking                             [X]
Championship Course • 6:00 AM • Jan 27
2 of 4 players
```

## Player Slots

### New Booking Flow

1. User selects golfer count (1-4)
2. Slots auto-populate:
   - Position 1: Booker (from logged-in user or member search)
   - Positions 2-N: Empty "Add Player" placeholders
   - Remaining: Grayed "Available" (not in this booking)

```
How many golfers?
[1] [2] [3] [4]

1. John Smith (M)        🏌️ Caddy ▾  🛒 Cart ▾  🏑 Rental ▾
2. + Add Player          ─────────   ─────────  ─────────
3. ░░░░ Available ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
4. ░░░░ Available ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

### Existing Flight View

```
1. Final Test (W)        🏌️ None     🛒 None    🏑 None   [✕]
2. + Add Player          ─────────   ─────────  ─────────
3. + Add Player          ─────────   ─────────  ─────────
4. + Add Player          ─────────   ─────────  ─────────
```

## Per-Player Options

### Caddy Assignment (Hybrid)

Searchable by name or caddy number:

```
🏌️ Caddy
┌────────────────────────────────────────┐
│ 🔍 Search by name or number...         │
└────────────────────────────────────────┘
○ None
○ Request Caddy (staff assigns)
────────────────────────────────────────
Recent/Available:
○ #12 Somchai P. ★★★
○ #08 Prasit C. ★★
○ #23 Wichai K. ★★★
```

### Cart Request (Club Policy Aware)

**Optional policy:**
```
○ Walking
○ Request Cart
  └ Paid at pro shop
```

**Required policy:**
```
○ Request Cart (Required)
  └ Paid at pro shop
```

### Rental Clubs (Club Policy Aware)

**Optional policy:**
```
○ None
○ Request Rental
  └ Paid at pro shop
```

**Required policy:**
```
○ Request Rental (Required)
  └ Paid at pro shop
```

### Compact Display (After Selection)

```
1. John Smith (M)                                    [✕]
   #12 Somchai + Cart + Rental
2. Jane Doe (G)                                      [✕]
   Request Caddy • Walking • No Rental
```

### Caddy Drives Cart (Asian Mode)

When club has `caddyDrivesCart: true` and player has both:

```
1. John Smith (M)                                    [✕]
   🏌️ #12 Somchai P. + 🛒 Cart
   └── Caddy will drive cart
```

## Adding Players

### Player Type Selection

```
Add Player to Position 2

┌─────────┐ ┌─────────┐ ┌─────────────┐ ┌─────────┐
│ Member  │ │  Guest  │ │ Dependent   │ │ Walk-up │
│   (M)   │ │   (G)   │ │    (D)      │ │   (W)   │
└─────────┘ └─────────┘ └─────────────┘ └─────────┘
```

### Member
- Search by name or member ID
- Shows handicap in results

### Guest
- "Guest of" auto-set to booker
- Name required, phone/email optional (unless club requires)

### Dependent
- Search dependents of booking member
- Shows relationship and age

### Walk-up
- Name and phone required
- Email optional

## Booking Notes

Collapsible section at bottom:

```
▼ Booking Notes
┌────────────────────────────────────────────────────┐
│ Special requests, group name, occasion...          │
│                                                    │
└────────────────────────────────────────────────────┘
```

## Modal Actions

### New Booking
```
                           [ Cancel ]  [ Confirm Booking ]
```

### Edit Booking
```
[ Cancel Booking ]         [ Discard ]  [ Save Changes ]
```

### Cancel Booking Confirmation
```
Cancel this booking?

6:00 AM • 2 players
John Smith, Jane Doe

┌────────────────────────────────────────┐
│ Reason (optional)                      │
└────────────────────────────────────────┘

          [ Keep Booking ]  [ Cancel Booking ]
```

## Data Structure

### Booking Payload

```typescript
interface BookingPayload {
  courseId: string
  teeDate: string          // "2026-01-27"
  teeTime: string          // "06:00"
  players: PlayerPayload[]
  notes?: string
}

interface PlayerPayload {
  position: number         // 1-4
  playerType: "MEMBER" | "GUEST" | "DEPENDENT" | "WALK_UP"

  // Identity
  memberId?: string              // MEMBER, DEPENDENT
  guestName?: string             // GUEST, WALK_UP
  guestPhone?: string            // GUEST, WALK_UP
  guestEmail?: string            // GUEST, WALK_UP
  sponsoringMemberId?: string    // GUEST (who invited them)

  // Per-player options
  caddyRequest: "NONE" | "REQUEST" | string  // string = caddyId
  cartRequest: "NONE" | "REQUEST"
  rentalRequest: "NONE" | "REQUEST"
}
```

### Club Settings

```typescript
interface ClubGolfSettings {
  cartPolicy: "OPTIONAL" | "REQUIRED"
  rentalPolicy: "OPTIONAL" | "REQUIRED"
  caddyDrivesCart: boolean
  maxGuestsPerMember: number
  requireGuestContact: boolean
}
```

## Files Affected

### Remove
- `apps/application/src/components/golf/add-player-modal.tsx`

### Create
- `apps/application/src/components/golf/unified-booking-modal.tsx`
- `apps/application/src/components/golf/player-slot.tsx`
- `apps/application/src/components/golf/caddy-picker.tsx`

### Modify
- `apps/application/src/app/(dashboard)/golf/page.tsx` - Update modal usage
- `apps/application/src/components/golf/tee-sheet-row.tsx` - Update click handlers
- `apps/application/src/hooks/use-golf.ts` - Add/update mutations

### Backend
- Add `ClubGolfSettings` to club configuration
- Update `CreateTeeTimeInput` to include per-player options
- Add caddy search query

## Implementation Order

1. Create `ClubGolfSettings` schema and seed defaults
2. Build `caddy-picker.tsx` with search
3. Build `player-slot.tsx` component
4. Build `unified-booking-modal.tsx`
5. Wire up to golf page, replacing old modals
6. Remove `add-player-modal.tsx`
7. Update API mutations for per-player options
