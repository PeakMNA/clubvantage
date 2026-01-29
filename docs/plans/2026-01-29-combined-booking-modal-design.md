# Combined Booking Modal Design

**Date:** 2026-01-29
**Status:** Approved
**Goal:** Combine BookingDetailModal and UnifiedBookingModal into a single inline-editable modal

---

## Problem

Staff expect to view and edit bookings in the same place. Currently:
1. Click booking → BookingDetailModal opens (view-only)
2. Click Edit → Modal closes, UnifiedBookingModal opens (edit mode)

This context switch is jarring and the two modals have divergent designs.

## Solution

Single `BookingModal` component with inline editing. Opens showing booking details, all fields directly editable without mode switching.

---

## Architecture

### Component: `BookingModal`

Replaces both `BookingDetailModal` and `UnifiedBookingModal`.

**Modes:**
- `new` - Empty state, all fields editable, "Confirm Booking" footer
- `existing` - Pre-populated, inline-editable, workflow actions + Save/Discard footer

**File changes:**
| Action | File |
|--------|------|
| Create | `components/golf/booking-modal.tsx` |
| Delete | `components/golf/booking-detail-modal.tsx` |
| Delete | `components/golf/unified-booking-modal.tsx` |
| Delete | `components/golf/booking-players-section.tsx` |
| Modify | `app/(dashboard)/golf/page.tsx` |

---

## Header Design

**New booking:**
```
┌─────────────────────────────────────────────────────────────┐
│  New Booking                                            [X] │
│  🕐 10:30 AM · 📍 Mountain Course · 📅 Jan 29, 2026         │
└─────────────────────────────────────────────────────────────┘
```

**Existing booking:**
```
┌─────────────────────────────────────────────────────────────┐
│  Booking #1042                                          [X] │
│  [Booked]  🕐 10:30 AM · 📍 Mountain Course · 📅 Jan 29     │
└─────────────────────────────────────────────────────────────┘
```

**Elements:**
- Title: "New Booking" or "Booking #{number}"
- Status badge (existing only): Booked, Checked-in, On Course, etc.
- Context line: Time, course, date (read-only - use Move to change)
- Starting hole indicator: "· Hole 10 Start" if cross-over mode
- Close button: Confirms if unsaved changes

---

## Player Section

Uses existing `PlayerSlot` component with three states:
- `filled` - Player card with name, badge, service toggles, remove button
- `empty` - Dashed border, "Add Player" click target
- `available` - Grayed out (beyond golfer count)

**Inline add player flow:**
1. Click empty slot → expands AddPlayerFlow
2. Select player type (Member / Guest / Dependent / Walk-up)
3. Search or fill form
4. Player added, slot becomes filled

**Service toggles per player:**
- Caddy: CaddyPicker dropdown (None / Request / specific caddy)
- Cart: Toggle button (Walking ↔ Cart)
- Rental: Toggle button (No Rental ↔ Rental)

---

## Other Editable Fields

**Golfer Count + Holes (side by side):**
- New booking: Both visible
- Existing booking: Only Holes (golfer count derived from players)

**Booked By (existing only):**
- Read-only display of booking creator
- Avatar, name, member ID, creation timestamp
- "View Profile" link

**Booking Notes:**
- Collapsible section
- Textarea input
- Auto-expands if notes exist

**Section order:**
1. Golfer Count + Holes (new) or just Holes (existing)
2. Players
3. Booked By (existing only)
4. Booking Notes

---

## Footer Design

**Split layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Workflow Actions...]              [Discard] [Save Changes]│
└─────────────────────────────────────────────────────────────┘
```

**Left side - Workflow actions (existing only):**

| Status | Actions |
|--------|---------|
| Booked | Check In, Move, Copy, Cancel |
| Checked-in | Mark On Course, Settle, Move, Cancel |
| On Course | Mark Finished, Settle |
| Finished | View Receipt, Settle |
| No-show | Override Penalty, Resend Confirmation |
| Cancelled | (none) |

**Right side - Edit actions:**

| State | Buttons |
|-------|---------|
| New booking | Cancel, Confirm Booking |
| Existing, no changes | (empty) |
| Existing, has changes | Discard, Save Changes |

**Behavior:**
- Save disabled until ≥1 player exists
- Save shows spinner during API call
- Discard resets form to original state
- Close (X) confirms if unsaved changes

---

## State Management

**Form state:**
```typescript
interface BookingFormState {
  holes: 9 | 18
  slots: PlayerSlotData[]  // 4 slots
  notes: string
}
```

**Change detection:**
```typescript
const hasUnsavedChanges = useMemo(() => {
  if (!originalState) return false
  return JSON.stringify(formState) !== JSON.stringify(originalState)
}, [formState, originalState])
```

**API integration:**
- Save → `updateGolfBooking` mutation
- Workflow actions → existing mutations (checkIn, cancel, etc.)
- Move/Copy → triggers placement mode, closes modal

---

## Props Interface

```typescript
interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'new' | 'existing'

  // Context
  courseId: string
  courseName: string
  date: Date
  time: string
  startingHole?: 1 | 10

  // Existing booking (required when mode='existing')
  booking?: Booking

  // Data
  availableCaddies: Caddy[]
  clubSettings: ClubSettings

  // Callbacks
  onSave: (payload: BookingPayload) => Promise<void>
  onCheckIn?: () => Promise<void>
  onCancel?: (reason?: string) => Promise<void>
  onMove?: () => void
  onCopy?: () => void
  onMarkOnCourse?: () => Promise<void>
  onMarkFinished?: () => Promise<void>
  onSettle?: () => void
}
```

---

## Reused Components

- `PlayerSlot` - Player cards with service toggles
- `CaddyPicker` - Caddy selection dropdown
- `GolferCountSelector` - 1-4 button group
- `HoleSelector` - 9/18 button group
- `BookingNotes` - Collapsible textarea
- `AddPlayerFlow` - Player type selection + search/forms
- `FlightStatusBadge` - Status indicator
- `PlayerTypeBadge` - M/G/D/W badges
- `Modal` - Base modal wrapper

## Deleted Components

- `BookingDetailModal` - Replaced by BookingModal
- `UnifiedBookingModal` - Replaced by BookingModal
- `BookingPlayersSection` - Replaced by PlayerSlot array
- `BookingActions` - Moved inline to BookingModal footer
