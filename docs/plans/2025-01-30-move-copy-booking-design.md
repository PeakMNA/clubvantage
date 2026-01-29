# Move/Copy Booking Functions Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Move/Copy buttons to Booking Detail Modal and enhance placement mode with smart slot validation.

**Architecture:** Modal triggers placement mode → Smart validation highlights valid slots → User clicks to place → Confirmation for partial fits.

**Tech Stack:** React hooks (usePlacementMode), Tailwind CSS for slot highlighting, existing tee sheet infrastructure.

---

## Overview

Users need to move or copy bookings between time slots on the tee sheet. The current workflow requires closing the booking modal, right-clicking on the tee sheet, and selecting move/copy from a context menu. Additionally, users struggle to identify which slots can accept a booking.

### Solution

1. Add Move/Copy buttons directly to the Booking Detail Modal
2. Enhance placement mode with smart validation that highlights valid target slots
3. Support partial-fit scenarios where only some players can move

---

## Design Specification

### 1. Modal Action Buttons

**Location:** Actions section of Booking Detail Modal

**Button Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Actions                                            │
├─────────────────────────────────────────────────────┤
│  [✓ Check In All]  [📝 Edit]  [↔ Move]  [📋 Copy]  │
│                                                     │
│  [🔔 Resend Confirmation]  [✕ Cancel Booking]      │
└─────────────────────────────────────────────────────┘
```

**Behavior:**
- Click "Move" → Close modal → Activate placement mode (moving)
- Click "Copy" → Close modal → Activate placement mode (copying)

---

### 2. Smart Slot Validation

**Validation Criteria:**

| Criterion | Check |
|-----------|-------|
| Player Capacity | Target slot has enough empty positions for all/some players |
| Conflicts | None of the source booking's players have bookings at target time |
| Availability | Target slot is not blocked or closed |

**Validation Results:**

| Result | Meaning | Visual |
|--------|---------|--------|
| `valid` | All players fit, no conflicts | Green highlight |
| `partial` | Some players fit, no conflicts | Amber highlight |
| `invalid` | No space, blocked, or has conflicts | Dimmed/grey |

**Example Validation:**
```
Moving 3-player booking from 8:00 AM:

✅ 8:30 AM (4 empty positions) → VALID
✅ 9:00 AM (3 empty positions) → VALID
⚠️ 9:30 AM (2 empty positions) → PARTIAL (2 of 3 fit)
❌ 10:00 AM (blocked) → INVALID
❌ 10:30 AM (full) → INVALID
❌ 11:00 AM (player already booked here) → CONFLICT
```

---

### 3. Visual Slot States

**CSS Classes for Placement Mode:**

```typescript
const placementSlotClasses = {
  source: 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20',
  valid: 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/40',
  partial: 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-900/20 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/40',
  invalid: 'opacity-50 cursor-not-allowed',
}
```

---

### 4. Enhanced Banner

**Banner Content:**
```
┌─────────────────────────────────────────────────────────────────┐
│ ↔ Moving booking from 8:00 AM (3 players)                       │
│ Click a green slot to place • ESC to cancel                     │
│                                              [Cancel Move]      │
└─────────────────────────────────────────────────────────────────┘
```

**For Copy:**
```
┌─────────────────────────────────────────────────────────────────┐
│ 📋 Copying booking from 8:00 AM (3 players)                     │
│ Click a green slot to place • ESC to cancel                     │
│                                              [Cancel Copy]      │
└─────────────────────────────────────────────────────────────────┘
```

---

### 5. Interaction Flow

```
User opens Booking Detail Modal
         │
         ▼
Clicks "Move" or "Copy" button
         │
         ▼
Modal closes automatically
         │
         ▼
Placement mode activates:
├── Banner appears at top
├── Source slot highlighted (blue)
├── Valid slots highlighted (green)
├── Partial-fit slots highlighted (amber)
└── Invalid slots dimmed (grey)
         │
         ▼
User hovers over slots:
├── Valid → brighter green, cursor:pointer
├── Partial → brighter amber, tooltip "Only 2 of 3 players fit"
└── Invalid → no change, cursor:not-allowed
         │
         ▼
User clicks slot:
├── Valid slot → Execute move/copy immediately
├── Partial slot → Show PartialFitDialog
└── Invalid slot → No action
         │
         ▼
Success → Toast "Booking moved to 9:30 AM"
         │
         ▼
Placement mode exits, tee sheet refreshes
```

---

### 6. Partial Fit Dialog

**When user clicks an amber (partial) slot:**

```
┌─────────────────────────────────────────────────┐
│  Partial Move                                   │
├─────────────────────────────────────────────────┤
│                                                 │
│  Only 2 of 3 players can fit in this slot.     │
│                                                 │
│  Move 2 players to 9:30 AM and leave           │
│  1 player at 8:00 AM?                          │
│                                                 │
│  Players to move:                              │
│  ☑ John Smith                                  │
│  ☑ Jane Doe                                    │
│  ☐ Bob Wilson (stays at 8:00 AM)               │
│                                                 │
├─────────────────────────────────────────────────┤
│           [Cancel]    [Move 2 Players]          │
└─────────────────────────────────────────────────┘
```

---

### 7. Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `ESC` | Cancel placement mode |
| `Enter` | Confirm placement (when hovering valid slot) |

---

### 8. Constraints

- **Same day only:** Placement restricted to currently viewed day
- **No cross-course:** Can only move within the same course
- **Existing context menu retained:** Right-click workflow still works as alternative

---

## File Changes Summary

### Modified Files

| File | Changes |
|------|---------|
| `booking-modal.tsx` | Add Move/Copy buttons to Actions section |
| `placement-mode-overlay.tsx` | Enhance banner with player count, source time |
| `tee-sheet-booking-view.tsx` | Apply validation-based slot classes |
| `context-menus.tsx` | Update to use shared placement mode |

### New Files

| File | Purpose |
|------|---------|
| `usePlacementMode.ts` | Enhanced hook with smart validation |
| `partial-fit-dialog.tsx` | Confirmation dialog for partial moves |
| `placement-utils.ts` | Validation functions (validateSlot, etc.) |

---

## Implementation Tasks

### Task 1: Create placement-utils.ts
Create utility functions for slot validation logic.

### Task 2: Enhance usePlacementMode hook
Add smart validation state: validSlots, partialSlots, invalidSlots.

### Task 3: Update PlacementModeOverlay
Enhanced banner with player count and source time info.

### Task 4: Add Move/Copy buttons to booking-modal
Buttons in Actions section that trigger placement mode.

### Task 5: Update tee-sheet slot rendering
Apply validation-based CSS classes during placement mode.

### Task 6: Create PartialFitDialog
Confirmation dialog for partial-fit scenarios.

### Task 7: Integration and testing
Wire everything together, test move/copy flows.
