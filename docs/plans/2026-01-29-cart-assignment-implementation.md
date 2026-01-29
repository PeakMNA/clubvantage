# Per-Player Cart Assignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add cart assignment dropdown to player rows in BookingModal so staff can assign specific carts to individual players.

**Architecture:** Extend the existing `CartSelector` component in `player-slot.tsx` to show a cart dropdown when cart toggle is ON. Wire through BookingModal to pass available carts and handle assignment.

**Tech Stack:** React, TypeScript, Tailwind CSS, @clubvantage/ui

---

## Task 1: Extend PlayerSlot with Cart Assignment Dropdown

**Goal:** Add cart dropdown that appears when cart toggle is ON.

**Files:**
- Modify: `apps/application/src/components/golf/player-slot.tsx`

### Step 1: Update types and props

Add new props to `PlayerSlotProps`:

```tsx
// Add to imports
import type { Cart } from './types'

// Update types at top of file
type CartValue = 'NONE' | 'REQUEST'

// Add to PlayerSlotProps interface (after line 37)
interface PlayerSlotProps {
  // ... existing props ...

  // Cart assignment (NEW)
  availableCarts?: Cart[]
  assignedCartId?: string | null
  onCartAssign?: (cartId: string | null) => void
}
```

### Step 2: Create CartAssignmentDropdown component

Add new component after `CartSelector` (around line 164):

```tsx
// Cart assignment dropdown (appears when cart is requested)
function CartAssignmentDropdown({
  availableCarts,
  assignedCartId,
  onAssign,
  disabled,
}: {
  availableCarts: Cart[]
  assignedCartId: string | null
  onAssign: (cartId: string | null) => void
  disabled?: boolean
}) {
  const selectedCart = availableCarts.find(c => c.id === assignedCartId)

  return (
    <div className="relative">
      <select
        value={assignedCartId || ''}
        onChange={(e) => onAssign(e.target.value || null)}
        disabled={disabled}
        className={cn(
          'h-9 pl-3 pr-8 rounded-lg border text-sm font-medium appearance-none cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-blue-500',
          assignedCartId
            ? 'bg-blue-50 border-blue-200 text-blue-700'
            : 'bg-stone-100 border-stone-200 text-stone-600',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        aria-label="Assign cart"
      >
        <option value="">Not assigned</option>
        {availableCarts.length === 0 ? (
          <option disabled>No carts available</option>
        ) : (
          availableCarts.map((cart) => (
            <option key={cart.id} value={cart.id}>
              Cart #{cart.number} ({cart.type})
            </option>
          ))
        )}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
    </div>
  )
}
```

### Step 3: Update CartSelector to show dropdown when active

Modify `CartSelector` to accept and render the assignment dropdown:

```tsx
function CartSelector({
  value,
  onChange,
  policy,
  disabled,
  // NEW props
  availableCarts,
  assignedCartId,
  onCartAssign,
}: {
  value: CartValue
  onChange: (value: CartValue) => void
  policy: 'OPTIONAL' | 'REQUIRED'
  disabled?: boolean
  // NEW
  availableCarts?: Cart[]
  assignedCartId?: string | null
  onCartAssign?: (cartId: string | null) => void
}) {
  const isRequired = policy === 'REQUIRED'
  const isActive = value === 'REQUEST' || isRequired
  const showAssignment = isActive && availableCarts && onCartAssign

  // ... existing required case stays the same ...

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          const newValue = value === 'REQUEST' ? 'NONE' : 'REQUEST'
          onChange(newValue)
          // Clear assignment when turning off
          if (newValue === 'NONE' && onCartAssign) {
            onCartAssign(null)
          }
        }}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all',
          isActive
            ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
            : 'bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className={cn(
          'flex h-6 w-6 items-center justify-center rounded-md transition-colors',
          isActive ? 'bg-blue-100' : 'bg-stone-200'
        )}>
          <Car className={cn('h-3.5 w-3.5', isActive ? 'text-blue-600' : 'text-stone-500')} />
        </div>
        <span>{isActive ? 'Cart' : 'Walking'}</span>
      </button>

      {showAssignment && (
        <CartAssignmentDropdown
          availableCarts={availableCarts}
          assignedCartId={assignedCartId ?? null}
          onAssign={onCartAssign}
          disabled={disabled}
        />
      )}
    </div>
  )
}
```

### Step 4: Wire props through PlayerSlot

Update the `PlayerSlot` component to pass cart props to `CartSelector`:

```tsx
export function PlayerSlot({
  // ... existing props ...
  availableCarts,
  assignedCartId,
  onCartAssign,
}: PlayerSlotProps) {
  // ... in the filled state render, update CartSelector:

  <CartSelector
    value={cartValue}
    onChange={onCartChange}
    policy={cartPolicy}
    disabled={disabled}
    availableCarts={availableCarts}
    assignedCartId={assignedCartId}
    onCartAssign={onCartAssign}
  />
}
```

### Step 5: Update exports

Add Cart to the type exports:

```tsx
export type {
  PlayerSlotProps,
  Player as PlayerSlotPlayer,
  CaddyValue,
  CartValue,
  RentalValue,
}
```

### Step 6: Verify component compiles

Run: `cd /Users/peak/development/vantage/clubvantage && pnpm typecheck`
Expected: No errors related to player-slot.tsx

### Step 7: Commit

```bash
git add apps/application/src/components/golf/player-slot.tsx
git commit -m "feat(golf): add cart assignment dropdown to PlayerSlot

When cart toggle is ON, show dropdown to select specific cart from
available inventory. Includes:
- CartAssignmentDropdown component
- Updated CartSelector to show dropdown when active
- Props for availableCarts, assignedCartId, onCartAssign

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Wire Cart Assignment in BookingModal

**Goal:** Pass available carts to PlayerSlot and track cart assignments in form state.

**Files:**
- Modify: `apps/application/src/components/golf/booking-modal.tsx`

### Step 1: Update props interface

Add `availableCarts` prop:

```tsx
export interface BookingModalProps {
  // ... existing props ...

  // Data
  availableCaddies: CaddyPickerCaddy[]
  availableCarts?: Cart[]  // NEW
  clubSettings: ClubSettings
}
```

### Step 2: Update PlayerSlotData interface

Add `cartId` to track assignment:

```tsx
interface PlayerSlotData {
  player: PlayerData | null
  caddyRequest: CaddyValue
  cartRequest: CartValue
  rentalRequest: RentalValue
  cartId?: string | null  // NEW - assigned cart ID
}
```

### Step 3: Add cart assignment handler

Add handler function (after other handlers around line 540):

```tsx
const handleCartAssign = (position: number, cartId: string | null) => {
  setSlots((prev) => {
    const newSlots = [...prev]
    const slot = newSlots[position]
    if (slot) {
      newSlots[position] = { ...slot, cartId }
    }
    return newSlots
  })
}
```

### Step 4: Update save payload

In `handleSave`, include cartId in player payload:

```tsx
// Around line 595, in the player mapping
if (slot.player) {
  players.push({
    position: i + 1,
    playerType: playerTypeToPayloadType(slot.player.type),
    // ... existing fields ...
    cartRequest: slot.cartRequest,
    cartId: slot.cartId || undefined,  // NEW
    // ... rest of fields ...
  })
}
```

### Step 5: Update PlayerPayload interface

```tsx
interface PlayerPayload {
  // ... existing fields ...
  cartRequest: 'NONE' | 'REQUEST' | string
  cartId?: string  // NEW
  // ... rest of fields ...
}
```

### Step 6: Initialize cartId from existing booking

Update `bookingPlayerToSlotData` to include cartId:

```tsx
function bookingPlayerToSlotData(player: BookingPlayer, clubSettings: ClubSettings): PlayerSlotData {
  return {
    player: {
      id: player.memberUuid || player.playerId || '',
      name: player.name || 'Unknown',
      type: (player.playerType?.toLowerCase() as PlayerType) || 'member',
      memberId: player.memberId,
    },
    caddyRequest: (player.caddyRequest as CaddyValue) || 'NONE',
    cartRequest: (player.cartRequest as CartValue) || (clubSettings.cartPolicy === 'REQUIRED' ? 'REQUEST' : 'NONE'),
    rentalRequest: (player.rentalRequest as RentalValue) || (clubSettings.rentalPolicy === 'REQUIRED' ? 'REQUEST' : 'NONE'),
    cartId: player.cartId || null,  // NEW
  }
}
```

### Step 7: Pass props to PlayerSlot

In the PlayerSlot render (around line 830):

```tsx
<PlayerSlot
  key={index}
  position={index + 1}
  player={slot.player ? { ... } : null}
  caddyValue={slot.caddyRequest}
  cartValue={slot.cartRequest}
  rentalValue={slot.rentalRequest}
  onCaddyChange={(v) => handleCaddyChange(index, v)}
  onCartChange={(v) => handleCartChange(index, v)}
  onRentalChange={(v) => handleRentalChange(index, v)}
  onAddPlayer={() => setAddingPlayerPosition(index)}
  onRemovePlayer={() => handleRemovePlayer(index)}
  availableCaddies={availableCaddies}
  availableCarts={availableCarts}  // NEW
  assignedCartId={slot.cartId}      // NEW
  onCartAssign={(id) => handleCartAssign(index, id)}  // NEW
  cartPolicy={clubSettings.cartPolicy}
  rentalPolicy={clubSettings.rentalPolicy}
  state={state}
  disabled={isSubmitting}
/>
```

### Step 8: Verify component compiles

Run: `cd /Users/peak/development/vantage/clubvantage && pnpm typecheck`
Expected: No errors

### Step 9: Commit

```bash
git add apps/application/src/components/golf/booking-modal.tsx
git commit -m "feat(golf): wire cart assignment through BookingModal

Track cart assignments per player slot:
- Add availableCarts prop
- Track cartId in PlayerSlotData form state
- Include cartId in save payload
- Initialize from existing booking data

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 3: Pass Available Carts from Golf Page

**Goal:** Fetch and pass available carts to BookingModal.

**Files:**
- Modify: `apps/application/src/app/(dashboard)/golf/page.tsx`

### Step 1: Filter available carts

The golf page already has cart data (used in carts tab). Add filtered list:

```tsx
// Near other data definitions (around line 1350)
const availableCarts = useMemo(() => {
  return carts.filter(cart => cart.status === 'available')
}, [carts])
```

### Step 2: Pass to BookingModal

Update BookingModal render to include availableCarts:

```tsx
<BookingModal
  // ... existing props ...
  availableCaddies={mockCaddies}
  availableCarts={availableCarts}  // NEW
  clubSettings={mockClubSettings}
  // ... rest of props ...
/>
```

### Step 3: Verify page compiles

Run: `cd /Users/peak/development/vantage/clubvantage && pnpm typecheck`
Expected: No errors

### Step 4: Test manually

Run: `cd /Users/peak/development/vantage/clubvantage && pnpm dev`

Test:
1. Open BookingModal for existing booking
2. Toggle cart ON for a player
3. Verify cart dropdown appears with available carts
4. Select a cart, verify it shows as selected
5. Toggle cart OFF, verify assignment clears
6. Save booking, verify cartId is in payload (check network tab)

### Step 5: Commit

```bash
git add apps/application/src/app/(dashboard)/golf/page.tsx
git commit -m "feat(golf): pass available carts to BookingModal

Filter carts by status='available' and pass to BookingModal
for per-player cart assignment.

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Update Cart Status on Assignment (Optional Enhancement)

**Goal:** When a cart is assigned, update its status to "in-use". When unassigned, return to "available".

**Note:** This requires API integration. If the API already handles this, skip this task. If cart status needs to be updated client-side for now, implement below.

**Files:**
- Modify: `apps/application/src/app/(dashboard)/golf/page.tsx`

### Step 1: Add cart status update logic

In the `onSave` handler of BookingModal:

```tsx
onSave={async (payload) => {
  // ... existing save logic ...

  // After successful save, update local cart status
  // (This is a temporary client-side solution until API handles it)
  payload.players.forEach(player => {
    if (player.cartId) {
      setCarts(prev => prev.map(cart =>
        cart.id === player.cartId
          ? { ...cart, status: 'in-use' as const, currentAssignment: `Booking #${bookingNumber}` }
          : cart
      ))
    }
  })
}}
```

### Step 2: Commit if implemented

```bash
git add apps/application/src/app/(dashboard)/golf/page.tsx
git commit -m "feat(golf): update cart status on assignment

Mark carts as 'in-use' when assigned to a player.
(Client-side until API integration complete)

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add cart assignment dropdown to PlayerSlot | player-slot.tsx |
| 2 | Wire cart assignment through BookingModal | booking-modal.tsx |
| 3 | Pass available carts from golf page | golf/page.tsx |
| 4 | Update cart status on assignment (optional) | golf/page.tsx |

Total: 3-4 commits, ~150 lines of new code.

## Verification Checklist

- [ ] Cart toggle ON shows dropdown
- [ ] Dropdown lists only available carts
- [ ] Selecting cart updates UI immediately
- [ ] Toggle OFF clears assignment
- [ ] Save includes cartId in payload
- [ ] Existing bookings show assigned cart
- [ ] Empty dropdown shows "No carts available"
