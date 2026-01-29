# Per-Player Cart Assignment Design

**Date:** 2026-01-29
**Status:** Approved
**Goal:** Staff can assign specific carts to individual players in the BookingModal

---

## Problem

Currently, cart assignment is limited:
- Flight-level only: One cart assigned to entire flight
- No per-player tracking: `cartStatus` exists but no `cartId` field
- Manual inventory: Cart status must be toggled manually

Staff need to know exactly which cart each player has.

## Solution

Add cart assignment dropdown to each player row in BookingModal. When cart toggle is ON, staff can select a specific cart from available inventory.

---

## UI Design

### Player Row Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ [M] John Smith                                           [Remove]   │
│     Member #1234                                                    │
│                                                                     │
│  Caddy: [None ▾]    Cart: [Cart ✓]  → [Cart #12 ▾]    Rental: [—]  │
└─────────────────────────────────────────────────────────────────────┘
```

- Cart assignment dropdown only appears when cart toggle is ON
- Dropdown shows only available carts
- Format: "Cart #[number] ([type])" — e.g., "Cart #12 (2-seater)"

### Cart Dropdown Contents

```
┌─────────────────────┐
│ Not assigned        │
│ ─────────────────── │
│ Cart #3 (2-seater)  │
│ Cart #7 (4-seater)  │
│ Cart #12 (2-seater) │
│ Cart #15 (4-seater) │
└─────────────────────┘
```

- First option: "Not assigned" to clear assignment
- Only carts with status "available" shown
- Sorted by cart number
- Empty state: "No carts available" (disabled)

---

## Data Model Changes

### TeeTimePlayer (Prisma)

```prisma
model TeeTimePlayer {
  // Existing fields...
  cartRequest: String?
  cartStatus: RentalStatus

  // NEW
  cartId: String?
  cart: Cart? @relation(fields: [cartId], references: [id])
}
```

### Cart Status Automation

| Action | Cart Status | Player cartStatus |
|--------|-------------|-------------------|
| Assign cart to player | → "in-use" | → "ASSIGNED" |
| Unassign cart | → "available" | → "REQUESTED" or "NONE" |
| Turn cart toggle OFF | → "available" | → "NONE" |
| Remove player from booking | → "available" | (player removed) |
| Cancel booking | → "available" (all) | (booking cancelled) |

---

## Component Changes

### player-slot.tsx

New props:
- `availableCarts: Cart[]`
- `assignedCartId: string | null`
- `onCartAssign: (cartId: string | null) => void`

When cart toggle is ON, render dropdown that calls `onCartAssign`.

### booking-modal.tsx

- Add `availableCarts` prop (alongside existing `availableCaddies`)
- Track `cartId` per player slot in form state
- Pass cart props to each `PlayerSlot`
- Include `cartId` in save payload

### types.ts

- Add `cartId?: string` to player interfaces

---

## Workflow

### Typical Flow

1. Player books tee time, requests cart (toggle ON, no cart assigned)
2. At check-in or pre-assignment, staff opens BookingModal
3. Staff sees cart toggle ON, clicks cart dropdown
4. Staff selects "Cart #12 (2-seater)"
5. Cart #12 marked "in-use" in inventory
6. Staff saves — player has Cart #12 assigned

### Edge Cases

| Scenario | Behavior |
|----------|----------|
| Toggle OFF after assigning | Cart released, assignment cleared |
| Player removed | Cart released if assigned |
| Booking cancelled | All carts released |
| Cart goes to maintenance | Must unassign first (or warn) |
| No carts available | Dropdown disabled, can still mark request |

---

## Out of Scope (YAGNI)

- Cart sharing tracking between players
- Cart return workflow
- Cart fee calculation changes
- Billing integration
- Cart optimization/suggestions

---

## Files Summary

| Action | File |
|--------|------|
| Modify | `apps/application/src/components/golf/player-slot.tsx` |
| Modify | `apps/application/src/components/golf/booking-modal.tsx` |
| Modify | `apps/application/src/components/golf/types.ts` |
| Modify | `database/prisma/schema.prisma` (TeeTimePlayer) |
| Modify | API mutations for player updates |
