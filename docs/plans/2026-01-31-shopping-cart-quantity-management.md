# Shopping Cart Quantity Management Design

**Date:** 2026-01-31
**Status:** Approved

## Overview

Add quantity management and bulk actions to the shopping cart check-in flow, enabling staff to adjust item quantities, remove items, and perform bulk operations on line items.

---

## 1. Data Model Changes

### BookingLineItem - Add quantity field

```prisma
model BookingLineItem {
  // ... existing fields ...
  quantity  Int  @default(1)
}
```

**Notes:**
- `baseAmount`, `taxAmount`, `totalAmount` store **per-unit** values
- Line total = `totalAmount × quantity`
- Minimum quantity: 1 (enforced by API)
- Maximum quantity: 99 (prevent accidental high values)

---

## 2. GraphQL API Changes

### New Mutations

```graphql
# Update line item quantity
updateLineItemQuantity(
  lineItemId: ID!
  quantity: Int!
): LineItemResult!

# Remove line item
removeLineItem(
  lineItemId: ID!
): RemoveLineItemResult!

# Bulk remove line items
removeLineItems(
  lineItemIds: [ID!]!
): BulkRemoveResult!

# Bulk transfer line items
transferLineItems(
  lineItemIds: [ID!]!
  toPlayerId: ID!
): BulkTransferResult!

# Pay specific line items
payLineItems(
  lineItemIds: [ID!]!
  paymentMethodId: ID!
): BulkPaymentResult!
```

### Validation Rules

- Cannot modify paid items
- Cannot modify transferred items
- Quantity must be 1-99
- Remove returns item data for undo functionality

---

## 3. UI Components

### 3.1 Line Item Row (Updated)

```
┌─────────────────────────────────────────────────────────┐
│ ☐ Golf Balls (sleeve)         ฿180 × 3 = ฿540.00       │
│   [−] [3] [+]                            [↔️] [🗑️]     │
└─────────────────────────────────────────────────────────┘
```

**Elements:**
- Checkbox (for bulk selection)
- Description
- Quantity stepper: `[−]` `[qty]` `[+]`
- Tappable quantity for direct input
- Line total: `฿{unit} × {qty} = ฿{total}`
- Transfer button (existing)
- Remove button (trash icon)

**Display Rules:**
- When qty = 1: Show `฿180.00` (no multiplication)
- When qty > 1: Show `฿180 × 3 = ฿540.00`

**Disabled States:**
- Paid items: No controls, checkbox hidden, show "Paid" badge
- Transferred items: No controls, show "from {Player}" badge

### 3.2 Direct Quantity Input

When user taps the quantity number:
1. Number becomes editable input field
2. Auto-select all text
3. Enter confirms, Escape cancels
4. Blur confirms value
5. Invalid input reverts to previous value

### 3.3 Remove Confirmation

**Trigger:** Click remove button OR decrement when qty = 1

**Inline confirmation:**
```
┌─────────────────────────────────────────────────────────┐
│ Golf Balls (sleeve)         Remove item? [Yes] [No]    │
└─────────────────────────────────────────────────────────┘
```

- Auto-dismisses after 3 seconds (reverts to normal state)
- "Yes" removes item
- "No" cancels

### 3.4 Undo Toast

After successful removal:
```
┌─────────────────────────────────────────────────────────┐
│ Item removed                                    [Undo]  │
└─────────────────────────────────────────────────────────┘
```

- Appears at bottom of panel
- 5 second timeout
- "Undo" re-adds the item with original data
- Multiple removes queue toasts

### 3.5 Bulk Actions Bar

**Appears when any items selected:**
```
┌─────────────────────────────────────────────────────────┐
│ ☑ Select All   3 selected   [Transfer] [Pay] [Remove]  │
└─────────────────────────────────────────────────────────┘
```

**Position:** Sticky at bottom of line items section

**Actions:**
- **Select All**: Toggle select/deselect all unpaid items
- **Transfer**: Opens player picker → transfers all selected
- **Pay**: Opens payment method picker → pays selected items
- **Remove**: Confirmation "Remove 3 items?" → bulk delete

**Exit Selection Mode:**
- Click "Cancel" or
- Press Escape or
- Deselect all items

### 3.6 Loading States

**Optimistic updates** for quantity changes:
1. UI updates immediately
2. API call in background
3. Revert on error with toast: "Failed to update. Try again."

**Spinner** for destructive/bulk actions:
- Remove, Transfer, Pay show loading state
- Disable buttons during operation

---

## 4. Implementation Tasks

1. **Database**: Add `quantity` field to BookingLineItem
2. **API**: Add mutations for qty update, remove, bulk operations
3. **SlotCard**: Update line item row with qty stepper, checkbox
4. **DirectInput**: Add tappable quantity with inline editing
5. **RemoveConfirm**: Add inline confirmation component
6. **UndoToast**: Add toast with undo capability
7. **BulkActionsBar**: Add selection mode and bulk action bar
8. **Integration**: Wire up to ShoppingCartCheckInPanel

---

## 5. Edge Cases

| Scenario | Behavior |
|----------|----------|
| Decrement qty=1 | Show remove confirmation |
| Direct input "0" | Show remove confirmation |
| Direct input > 99 | Cap at 99, show toast |
| Direct input invalid | Revert to previous value |
| Bulk remove with undo | Single undo restores all items |
| Transfer during selection | Clear selection after transfer |
| Network error on qty change | Revert UI, show error toast |
| Select paid item | Not allowed (checkbox hidden) |

---

## 6. Future Considerations

- Keyboard shortcuts for power users (↑/↓ for qty)
- Swipe gestures for mobile (swipe left to remove)
- Batch quantity edit ("Set all to qty X")
