# Shopping Cart Quantity Management Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add quantity management (+/-), remove functionality, and bulk actions to shopping cart line items.

**Architecture:** Extend existing BookingLineItem model with quantity field. Add new GraphQL mutations for quantity update, remove, and bulk operations. Update SlotCard UI with quantity stepper, remove button, selection checkboxes, and bulk action bar.

**Tech Stack:** Prisma, NestJS GraphQL, React, TanStack Query

---

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

---

# Implementation Tasks

## Task 1: Add quantity field to Prisma schema

**Files:**
- Modify: `database/prisma/schema.prisma` (BookingLineItem model ~line 1304)

**Step 1: Add quantity field**

In `database/prisma/schema.prisma`, find `model BookingLineItem` and add:

```prisma
quantity                 Int                   @default(1)
```

Add it after the `variantId` field (around line 1319).

**Step 2: Generate migration**

Run:
```bash
cd database && pnpm prisma migrate dev --name add_line_item_quantity
```

Expected: Migration created successfully

**Step 3: Commit**

```bash
git add database/prisma/schema.prisma database/prisma/migrations/
git commit -m "feat(db): add quantity field to BookingLineItem"
```

---

## Task 2: Add GraphQL types for quantity

**Files:**
- Modify: `apps/api/src/graphql/golf/golf.types.ts` (~line 2145 SlotLineItemType)

**Step 1: Add quantity to SlotLineItemType**

Find `export class SlotLineItemType` and add after `totalAmount`:

```typescript
  @Field(() => Int)
  quantity: number;
```

Also add `Int` to the imports at the top if not already there.

**Step 2: Commit**

```bash
git add apps/api/src/graphql/golf/golf.types.ts
git commit -m "feat(api): add quantity to SlotLineItemType"
```

---

## Task 3: Add GraphQL input types for quantity and remove mutations

**Files:**
- Modify: `apps/api/src/graphql/golf/cart.input.ts`

**Step 1: Add new input types**

Add at the end of the file:

```typescript
@InputType()
export class UpdateLineItemQuantityInput {
  @Field(() => ID)
  @IsUUID()
  lineItemId: string;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(99)
  quantity: number;
}

@InputType()
export class RemoveLineItemInput {
  @Field(() => ID)
  @IsUUID()
  lineItemId: string;
}

@InputType()
export class BulkRemoveLineItemsInput {
  @Field(() => [ID])
  @IsArray()
  @IsUUID('4', { each: true })
  lineItemIds: string[];
}

@InputType()
export class BulkTransferLineItemsInput {
  @Field(() => [ID])
  @IsArray()
  @IsUUID('4', { each: true })
  lineItemIds: string[];

  @Field(() => ID)
  @IsUUID()
  toPlayerId: string;
}

@InputType()
export class PayLineItemsInput {
  @Field(() => [ID])
  @IsArray()
  @IsUUID('4', { each: true })
  lineItemIds: string[];

  @Field(() => ID)
  @IsUUID()
  paymentMethodId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reference?: string;
}
```

**Step 2: Add imports**

Add to imports at top:

```typescript
import { IsInt, Min, Max, IsUUID } from 'class-validator';
import { Int } from '@nestjs/graphql';
```

**Step 3: Commit**

```bash
git add apps/api/src/graphql/golf/cart.input.ts
git commit -m "feat(api): add input types for quantity and bulk operations"
```

---

## Task 4: Add GraphQL result types

**Files:**
- Modify: `apps/api/src/graphql/golf/golf.types.ts`

**Step 1: Add result types**

Add after the existing `TransferResultType` (search for it):

```typescript
@ObjectType()
export class UpdateQuantityResultType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field(() => SlotLineItemType, { nullable: true })
  lineItem?: SlotLineItemType;
}

@ObjectType()
export class RemoveLineItemResultType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field(() => SlotLineItemType, { nullable: true })
  removedItem?: SlotLineItemType;
}

@ObjectType()
export class BulkRemoveResultType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field(() => Int)
  removedCount: number;

  @Field(() => [SlotLineItemType])
  removedItems: SlotLineItemType[];
}

@ObjectType()
export class BulkTransferResultType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field(() => Int)
  transferredCount: number;
}

@ObjectType()
export class PayLineItemsResultType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  transactionId?: string;

  @Field(() => Int)
  paidCount: number;

  @Field()
  totalPaid: number;
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/golf/golf.types.ts
git commit -m "feat(api): add result types for quantity and bulk operations"
```

---

## Task 5: Add CartService methods for quantity and remove

**Files:**
- Modify: `apps/api/src/graphql/golf/cart.service.ts`

**Step 1: Add updateQuantity method**

Add to CartService class:

```typescript
  /**
   * Update line item quantity
   */
  async updateLineItemQuantity(
    lineItemId: string,
    quantity: number,
  ): Promise<{ success: boolean; error?: string; lineItem?: any }> {
    if (quantity < 1 || quantity > 99) {
      return { success: false, error: 'Quantity must be between 1 and 99' };
    }

    const lineItem = await this.prisma.bookingLineItem.findUnique({
      where: { id: lineItemId },
    });

    if (!lineItem) {
      return { success: false, error: 'Line item not found' };
    }

    if (lineItem.isPaid) {
      return { success: false, error: 'Cannot modify paid item' };
    }

    if (lineItem.isTransferred) {
      return { success: false, error: 'Cannot modify transferred item' };
    }

    const updated = await this.prisma.bookingLineItem.update({
      where: { id: lineItemId },
      data: { quantity },
    });

    return {
      success: true,
      lineItem: {
        id: updated.id,
        type: updated.type,
        description: updated.description,
        baseAmount: Number(updated.baseAmount),
        taxType: updated.taxType,
        taxRate: Number(updated.taxRate),
        taxAmount: Number(updated.taxAmount),
        totalAmount: Number(updated.totalAmount),
        quantity: updated.quantity,
        isPaid: updated.isPaid,
        isTransferred: updated.isTransferred,
      },
    };
  }

  /**
   * Remove a line item
   */
  async removeLineItem(
    lineItemId: string,
  ): Promise<{ success: boolean; error?: string; removedItem?: any }> {
    const lineItem = await this.prisma.bookingLineItem.findUnique({
      where: { id: lineItemId },
    });

    if (!lineItem) {
      return { success: false, error: 'Line item not found' };
    }

    if (lineItem.isPaid) {
      return { success: false, error: 'Cannot remove paid item' };
    }

    if (lineItem.isTransferred) {
      return { success: false, error: 'Cannot remove transferred item' };
    }

    const removedItem = {
      id: lineItem.id,
      type: lineItem.type,
      description: lineItem.description,
      baseAmount: Number(lineItem.baseAmount),
      taxType: lineItem.taxType,
      taxRate: Number(lineItem.taxRate),
      taxAmount: Number(lineItem.taxAmount),
      totalAmount: Number(lineItem.totalAmount),
      quantity: lineItem.quantity,
      isPaid: lineItem.isPaid,
      isTransferred: lineItem.isTransferred,
    };

    await this.prisma.bookingLineItem.delete({
      where: { id: lineItemId },
    });

    return { success: true, removedItem };
  }

  /**
   * Bulk remove line items
   */
  async bulkRemoveLineItems(
    lineItemIds: string[],
  ): Promise<{ success: boolean; error?: string; removedCount: number; removedItems: any[] }> {
    const lineItems = await this.prisma.bookingLineItem.findMany({
      where: { id: { in: lineItemIds } },
    });

    // Check for paid or transferred items
    const invalidItems = lineItems.filter(item => item.isPaid || item.isTransferred);
    if (invalidItems.length > 0) {
      return {
        success: false,
        error: 'Cannot remove paid or transferred items',
        removedCount: 0,
        removedItems: [],
      };
    }

    const removedItems = lineItems.map(item => ({
      id: item.id,
      type: item.type,
      description: item.description,
      baseAmount: Number(item.baseAmount),
      taxType: item.taxType,
      taxRate: Number(item.taxRate),
      taxAmount: Number(item.taxAmount),
      totalAmount: Number(item.totalAmount),
      quantity: item.quantity,
      isPaid: item.isPaid,
      isTransferred: item.isTransferred,
    }));

    await this.prisma.bookingLineItem.deleteMany({
      where: { id: { in: lineItemIds } },
    });

    return {
      success: true,
      removedCount: lineItems.length,
      removedItems,
    };
  }

  /**
   * Bulk transfer line items
   */
  async bulkTransferLineItems(
    lineItemIds: string[],
    toPlayerId: string,
    transferredBy: string,
  ): Promise<{ success: boolean; error?: string; transferredCount: number }> {
    const lineItems = await this.prisma.bookingLineItem.findMany({
      where: { id: { in: lineItemIds } },
      include: { teeTimePlayer: true },
    });

    // Check for paid or already transferred items
    const invalidItems = lineItems.filter(item => item.isPaid || item.isTransferred);
    if (invalidItems.length > 0) {
      return {
        success: false,
        error: 'Cannot transfer paid or already transferred items',
        transferredCount: 0,
      };
    }

    // Verify target player exists and is in same tee time
    const toPlayer = await this.prisma.teeTimePlayer.findUnique({
      where: { id: toPlayerId },
    });

    if (!toPlayer) {
      return { success: false, error: 'Target player not found', transferredCount: 0 };
    }

    // All items should be from same tee time
    const teeTimeIds = new Set(lineItems.map(item => item.teeTimePlayer.teeTimeId));
    if (teeTimeIds.size > 1) {
      return { success: false, error: 'Items must be from same tee time', transferredCount: 0 };
    }

    const teeTimeId = lineItems[0]?.teeTimePlayer.teeTimeId;
    if (toPlayer.teeTimeId !== teeTimeId) {
      return { success: false, error: 'Target player must be in same tee time', transferredCount: 0 };
    }

    // Perform bulk transfer
    await this.prisma.bookingLineItem.updateMany({
      where: { id: { in: lineItemIds } },
      data: {
        isTransferred: true,
        transferredToPlayerId: toPlayerId,
        transferredAt: new Date(),
        teeTimePlayerId: toPlayerId,
      },
    });

    // Update originalPlayerId for each item individually
    for (const item of lineItems) {
      await this.prisma.bookingLineItem.update({
        where: { id: item.id },
        data: {
          transferredFromPlayerId: item.teeTimePlayerId,
          originalPlayerId: item.originalPlayerId || item.teeTimePlayerId,
        },
      });
    }

    return { success: true, transferredCount: lineItems.length };
  }
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/golf/cart.service.ts
git commit -m "feat(api): add CartService methods for quantity and bulk operations"
```

---

## Task 6: Add GraphQL mutations to CartResolver

**Files:**
- Modify: `apps/api/src/graphql/golf/cart.resolver.ts`

**Step 1: Import new types**

Add to imports:

```typescript
import {
  UpdateLineItemQuantityInput,
  RemoveLineItemInput,
  BulkRemoveLineItemsInput,
  BulkTransferLineItemsInput,
  PayLineItemsInput,
} from './cart.input';
import {
  UpdateQuantityResultType,
  RemoveLineItemResultType,
  BulkRemoveResultType,
  BulkTransferResultType,
  PayLineItemsResultType,
} from './golf.types';
```

**Step 2: Add mutations**

Add after existing mutations:

```typescript
  // ============================================================================
  // MUTATIONS - QUANTITY & REMOVE
  // ============================================================================

  @Mutation(() => UpdateQuantityResultType, {
    name: 'updateLineItemQuantity',
    description: 'Update line item quantity',
  })
  async updateLineItemQuantity(
    @Args('input') input: UpdateLineItemQuantityInput,
  ): Promise<UpdateQuantityResultType> {
    return this.cartService.updateLineItemQuantity(input.lineItemId, input.quantity);
  }

  @Mutation(() => RemoveLineItemResultType, {
    name: 'removeLineItem',
    description: 'Remove a line item from cart',
  })
  async removeLineItem(
    @Args('input') input: RemoveLineItemInput,
  ): Promise<RemoveLineItemResultType> {
    return this.cartService.removeLineItem(input.lineItemId);
  }

  @Mutation(() => BulkRemoveResultType, {
    name: 'bulkRemoveLineItems',
    description: 'Remove multiple line items',
  })
  async bulkRemoveLineItems(
    @Args('input') input: BulkRemoveLineItemsInput,
  ): Promise<BulkRemoveResultType> {
    return this.cartService.bulkRemoveLineItems(input.lineItemIds);
  }

  @Mutation(() => BulkTransferResultType, {
    name: 'bulkTransferLineItems',
    description: 'Transfer multiple line items to another player',
  })
  async bulkTransferLineItems(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: BulkTransferLineItemsInput,
  ): Promise<BulkTransferResultType> {
    return this.cartService.bulkTransferLineItems(
      input.lineItemIds,
      input.toPlayerId,
      user.sub,
    );
  }

  @Mutation(() => PayLineItemsResultType, {
    name: 'payLineItems',
    description: 'Pay specific line items',
  })
  async payLineItems(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: PayLineItemsInput,
  ): Promise<PayLineItemsResultType> {
    try {
      const lineItems = await this.cartService.getUnpaidLineItems([]);
      const selectedItems = lineItems.filter(item => input.lineItemIds.includes(item.id));

      if (selectedItems.length === 0) {
        return { success: false, error: 'No unpaid items found', paidCount: 0, totalPaid: 0 };
      }

      const totalAmount = selectedItems.reduce(
        (sum, item) => sum + Number(item.totalAmount) * (item.quantity || 1),
        0,
      );

      const teeTimeId = selectedItems[0].teeTimePlayer.teeTimeId;

      const paymentResult = await this.paymentService.processPayment({
        clubId: user.tenantId,
        teeTimeId,
        lineItemIds: input.lineItemIds,
        amount: totalAmount,
        paymentMethodId: input.paymentMethodId,
        reference: input.reference,
        paidBy: user.sub,
      });

      return {
        success: true,
        transactionId: paymentResult.transactionId,
        paidCount: selectedItems.length,
        totalPaid: totalAmount,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
        paidCount: 0,
        totalPaid: 0,
      };
    }
  }
```

**Step 3: Commit**

```bash
git add apps/api/src/graphql/golf/cart.resolver.ts
git commit -m "feat(api): add mutations for quantity, remove, and bulk operations"
```

---

## Task 7: Update CartService.getSlotCart to include quantity

**Files:**
- Modify: `apps/api/src/graphql/golf/cart.service.ts`

**Step 1: Update lineItems mapping in getSlotCart**

Find the `getSlotCart` method and update the lineItems mapping to include quantity:

```typescript
    // Process line items (items in this player's cart)
    const lineItems = player.lineItems.map(item => ({
      id: item.id,
      type: item.type,
      description: item.description,
      baseAmount: Number(item.baseAmount),
      taxType: item.taxType,
      taxRate: Number(item.taxRate),
      taxAmount: Number(item.taxAmount),
      totalAmount: Number(item.totalAmount),
      quantity: item.quantity,  // ADD THIS LINE
      isPaid: item.isPaid,
      paidAt: item.paidAt ?? undefined,
      paymentMethod: item.paymentMethod?.name,
      isTransferred: item.isTransferred,
      transferredFromPlayerName: item.transferredFromPlayer
        ? item.transferredFromPlayer.member
          ? `${item.transferredFromPlayer.member.firstName} ${item.transferredFromPlayer.member.lastName}`
          : item.transferredFromPlayer.guestName || 'Player'
        : undefined,
    }));
```

**Step 2: Update totals calculation to use quantity**

Update the totals calculation:

```typescript
    // Calculate totals (multiply by quantity)
    const subtotal = lineItems.reduce((sum, item) => sum + item.baseAmount * item.quantity, 0);
    const taxTotal = lineItems.reduce((sum, item) => sum + item.taxAmount * item.quantity, 0);
    const grandTotal = lineItems.reduce((sum, item) => sum + item.totalAmount * item.quantity, 0);
    const paidAmount = lineItems
      .filter(item => item.isPaid)
      .reduce((sum, item) => sum + item.totalAmount * item.quantity, 0);
```

**Step 3: Commit**

```bash
git add apps/api/src/graphql/golf/cart.service.ts
git commit -m "feat(api): include quantity in slot cart and totals calculation"
```

---

## Task 8: Add GraphQL operations to api-client

**Files:**
- Modify: `packages/api-client/src/operations/golf.graphql`

**Step 1: Add new mutations**

Add at the end of the file:

```graphql
# Quantity and Remove Operations
mutation UpdateLineItemQuantity($input: UpdateLineItemQuantityInput!) {
  updateLineItemQuantity(input: $input) {
    success
    error
    lineItem {
      id
      type
      description
      baseAmount
      taxType
      taxRate
      taxAmount
      totalAmount
      quantity
      isPaid
      isTransferred
    }
  }
}

mutation RemoveLineItem($input: RemoveLineItemInput!) {
  removeLineItem(input: $input) {
    success
    error
    removedItem {
      id
      type
      description
      baseAmount
      totalAmount
      quantity
    }
  }
}

mutation BulkRemoveLineItems($input: BulkRemoveLineItemsInput!) {
  bulkRemoveLineItems(input: $input) {
    success
    error
    removedCount
    removedItems {
      id
      description
      totalAmount
      quantity
    }
  }
}

mutation BulkTransferLineItems($input: BulkTransferLineItemsInput!) {
  bulkTransferLineItems(input: $input) {
    success
    error
    transferredCount
  }
}

mutation PayLineItems($input: PayLineItemsInput!) {
  payLineItems(input: $input) {
    success
    error
    transactionId
    paidCount
    totalPaid
  }
}
```

**Step 2: Update teeTimeCarts query to include quantity**

Find the `teeTimeCarts` query and add `quantity` to the lineItems selection:

```graphql
query GetTeeTimeCarts($teeTimeId: ID!) {
  teeTimeCarts(teeTimeId: $teeTimeId) {
    teeTimeId
    teeTime
    courseName
    courseId
    date
    slots {
      playerId
      playerName
      playerType
      memberId
      memberNumber
      lineItems {
        id
        type
        description
        baseAmount
        taxType
        taxRate
        taxAmount
        totalAmount
        quantity          # ADD THIS
        isPaid
        paidAt
        paymentMethod
        isTransferred
        transferredFromPlayerName
      }
      # ... rest unchanged
    }
  }
}
```

**Step 3: Regenerate types**

Run:
```bash
pnpm codegen
```

**Step 4: Commit**

```bash
git add packages/api-client/src/operations/golf.graphql packages/api-client/src/types/generated.ts packages/api-client/src/hooks/generated.ts
git commit -m "feat(api-client): add quantity and bulk operation mutations"
```

---

## Task 9: Update SlotCard line item interface

**Files:**
- Modify: `apps/application/src/components/golf/slot-card.tsx`

**Step 1: Add quantity to line item interface**

Update the `SlotCartData` interface lineItems array:

```typescript
  lineItems: Array<{
    id: string
    type: string
    description: string
    baseAmount: number
    taxType: string
    taxRate: number
    taxAmount: number
    totalAmount: number
    quantity: number  // ADD THIS
    isPaid: boolean
    paidAt?: Date
    paymentMethod?: string
    isTransferred: boolean
    transferredFromPlayerName?: string
  }>
```

**Step 2: Add props for new callbacks**

Update `SlotCardProps`:

```typescript
interface SlotCardProps {
  slot: SlotCartData
  position: 1 | 2 | 3 | 4
  isSelected?: boolean
  onSelect?: (selected: boolean) => void
  onTransferItem?: (lineItemId: string) => void
  onAddItem?: () => void
  onViewCart?: () => void
  onUpdateQuantity?: (lineItemId: string, quantity: number) => void  // ADD
  onRemoveItem?: (lineItemId: string) => void  // ADD
  onSelectItem?: (lineItemId: string, selected: boolean) => void  // ADD for bulk
  selectedItemIds?: Set<string>  // ADD for bulk selection
  className?: string
}
```

**Step 3: Commit**

```bash
git add apps/application/src/components/golf/slot-card.tsx
git commit -m "feat(ui): add quantity and selection to SlotCard interface"
```

---

## Task 10: Create QuantityStepper component

**Files:**
- Create: `apps/application/src/components/golf/quantity-stepper.tsx`

**Step 1: Create component**

```typescript
'use client'

import { useState, useRef, useEffect } from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@clubvantage/ui'

interface QuantityStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  size?: 'sm' | 'md'
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  size = 'sm',
}: QuantityStepperProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(value))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.select()
    }
  }, [isEditing])

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  const handleEditStart = () => {
    if (disabled) return
    setEditValue(String(value))
    setIsEditing(true)
  }

  const handleEditConfirm = () => {
    const newValue = parseInt(editValue, 10)
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue)
    }
    setIsEditing(false)
  }

  const handleEditCancel = () => {
    setEditValue(String(value))
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditConfirm()
    } else if (e.key === 'Escape') {
      handleEditCancel()
    }
  }

  const buttonClass = cn(
    'flex items-center justify-center rounded transition-colors',
    size === 'sm' ? 'w-6 h-6' : 'w-8 h-8',
    disabled
      ? 'text-muted-foreground/30 cursor-not-allowed'
      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
  )

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={buttonClass}
        title="Decrease quantity"
      >
        <Minus className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      </button>

      {isEditing ? (
        <input
          ref={inputRef}
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleEditConfirm}
          onKeyDown={handleKeyDown}
          min={min}
          max={max}
          className={cn(
            'text-center border rounded focus:outline-none focus:ring-1 focus:ring-primary',
            size === 'sm' ? 'w-8 h-6 text-xs' : 'w-10 h-8 text-sm'
          )}
        />
      ) : (
        <button
          type="button"
          onClick={handleEditStart}
          disabled={disabled}
          className={cn(
            'font-medium tabular-nums',
            size === 'sm' ? 'w-8 text-xs' : 'w-10 text-sm',
            disabled ? 'cursor-not-allowed' : 'cursor-text hover:bg-muted rounded'
          )}
          title="Click to edit quantity"
        >
          {value}
        </button>
      )}

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className={buttonClass}
        title="Increase quantity"
      >
        <Plus className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
      </button>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add apps/application/src/components/golf/quantity-stepper.tsx
git commit -m "feat(ui): create QuantityStepper component"
```

---

## Task 11: Create RemoveConfirmation component

**Files:**
- Create: `apps/application/src/components/golf/remove-confirmation.tsx`

**Step 1: Create component**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { cn } from '@clubvantage/ui'

interface RemoveConfirmationProps {
  onConfirm: () => void
  onCancel: () => void
  autoCloseMs?: number
}

export function RemoveConfirmation({
  onConfirm,
  onCancel,
  autoCloseMs = 3000,
}: RemoveConfirmationProps) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / autoCloseMs) * 100)
      setProgress(remaining)

      if (remaining === 0) {
        clearInterval(interval)
        onCancel()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [autoCloseMs, onCancel])

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">Remove item?</span>
      <button
        type="button"
        onClick={onConfirm}
        className="px-2 py-0.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded font-medium"
      >
        Yes
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-2 py-0.5 text-muted-foreground hover:bg-muted rounded"
      >
        No
      </button>
      <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-muted-foreground/30 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add apps/application/src/components/golf/remove-confirmation.tsx
git commit -m "feat(ui): create RemoveConfirmation component"
```

---

## Task 12: Create UndoToast component

**Files:**
- Create: `apps/application/src/components/golf/undo-toast.tsx`

**Step 1: Create component**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@clubvantage/ui'

interface UndoToastProps {
  message: string
  onUndo: () => void
  onDismiss: () => void
  autoCloseMs?: number
}

export function UndoToast({
  message,
  onUndo,
  onDismiss,
  autoCloseMs = 5000,
}: UndoToastProps) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / autoCloseMs) * 100)
      setProgress(remaining)

      if (remaining === 0) {
        clearInterval(interval)
        onDismiss()
      }
    }, 50)

    return () => clearInterval(interval)
  }, [autoCloseMs, onDismiss])

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div className="flex items-center gap-3 bg-card border shadow-lg rounded-lg px-4 py-3 min-w-[280px]">
        <span className="flex-1 text-sm">{message}</span>
        <button
          type="button"
          onClick={onUndo}
          className="px-3 py-1 text-sm font-medium text-primary hover:bg-primary/10 rounded"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted rounded-b-lg overflow-hidden">
        <div
          className="h-full bg-primary/30 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add apps/application/src/components/golf/undo-toast.tsx
git commit -m "feat(ui): create UndoToast component"
```

---

## Task 13: Create LineItemBulkActionBar component

**Files:**
- Create: `apps/application/src/components/golf/line-item-bulk-action-bar.tsx`

**Step 1: Create component**

```typescript
'use client'

import { ArrowRightLeft, CreditCard, Trash2, CheckSquare, Square } from 'lucide-react'
import { cn } from '@clubvantage/ui'

interface LineItemBulkActionBarProps {
  selectedCount: number
  totalSelectableCount: number
  isAllSelected: boolean
  onSelectAll: () => void
  onDeselectAll: () => void
  onTransfer: () => void
  onPay: () => void
  onRemove: () => void
  disabled?: boolean
}

export function LineItemBulkActionBar({
  selectedCount,
  totalSelectableCount,
  isAllSelected,
  onSelectAll,
  onDeselectAll,
  onTransfer,
  onPay,
  onRemove,
  disabled = false,
}: LineItemBulkActionBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="sticky bottom-0 bg-card border-t shadow-lg px-3 py-2 -mx-3 -mb-3 mt-3 flex items-center gap-3">
      <button
        type="button"
        onClick={isAllSelected ? onDeselectAll : onSelectAll}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        {isAllSelected ? (
          <CheckSquare className="h-4 w-4" />
        ) : (
          <Square className="h-4 w-4" />
        )}
        {isAllSelected ? 'Deselect All' : 'Select All'}
      </button>

      <span className="text-sm font-medium">
        {selectedCount} selected
      </span>

      <div className="flex-1" />

      <button
        type="button"
        onClick={onTransfer}
        disabled={disabled}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors',
          disabled
            ? 'text-muted-foreground bg-muted cursor-not-allowed'
            : 'text-primary hover:bg-primary/10'
        )}
      >
        <ArrowRightLeft className="h-4 w-4" />
        Transfer
      </button>

      <button
        type="button"
        onClick={onPay}
        disabled={disabled}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors',
          disabled
            ? 'text-muted-foreground bg-muted cursor-not-allowed'
            : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
        )}
      >
        <CreditCard className="h-4 w-4" />
        Pay
      </button>

      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors',
          disabled
            ? 'text-muted-foreground bg-muted cursor-not-allowed'
            : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
        )}
      >
        <Trash2 className="h-4 w-4" />
        Remove
      </button>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add apps/application/src/components/golf/line-item-bulk-action-bar.tsx
git commit -m "feat(ui): create LineItemBulkActionBar component"
```

---

## Task 14: Update SlotCard with quantity, remove, and selection

**Files:**
- Modify: `apps/application/src/components/golf/slot-card.tsx`

**Step 1: Import new components**

Add imports:

```typescript
import { Trash2 } from 'lucide-react'
import { QuantityStepper } from './quantity-stepper'
import { RemoveConfirmation } from './remove-confirmation'
import { LineItemBulkActionBar } from './line-item-bulk-action-bar'
```

**Step 2: Add state for remove confirmation**

Inside the component, add state:

```typescript
const [removingItemId, setRemovingItemId] = useState<string | null>(null)
```

**Step 3: Update line item rendering**

Replace the existing line items rendering (inside `{expanded && ...}`) with:

```typescript
{slot.lineItems.map(item => {
  const isRemoving = removingItemId === item.id
  const isSelected = selectedItemIds?.has(item.id) ?? false
  const lineTotal = item.totalAmount * item.quantity
  const canModify = !item.isPaid && !item.isTransferred

  return (
    <div
      key={item.id}
      className={cn(
        'flex flex-col gap-2 py-2 px-2 rounded text-sm',
        item.isPaid
          ? 'bg-emerald-50 dark:bg-emerald-500/10'
          : item.isTransferred
            ? 'bg-purple-50 dark:bg-purple-500/10'
            : isSelected
              ? 'bg-primary/10 ring-1 ring-primary'
              : 'bg-muted/50'
      )}
    >
      {isRemoving ? (
        <RemoveConfirmation
          onConfirm={() => {
            onRemoveItem?.(item.id)
            setRemovingItemId(null)
          }}
          onCancel={() => setRemovingItemId(null)}
        />
      ) : (
        <>
          {/* Row 1: Checkbox, Description, Price */}
          <div className="flex items-center gap-2">
            {canModify && onSelectItem && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelectItem(item.id, e.target.checked)}
                className="h-4 w-4 rounded border-muted-foreground/30"
              />
            )}
            <div className="flex-1 min-w-0">
              <span className="truncate">{item.description}</span>
            </div>
            <div className="text-right font-medium tabular-nums">
              {item.quantity > 1 ? (
                <span>
                  <span className="text-muted-foreground">฿{item.totalAmount.toFixed(0)} × {item.quantity} = </span>
                  ฿{lineTotal.toFixed(2)}
                </span>
              ) : (
                <span>฿{lineTotal.toFixed(2)}</span>
              )}
            </div>
          </div>

          {/* Row 2: Quantity stepper + Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {canModify && onUpdateQuantity ? (
                <QuantityStepper
                  value={item.quantity}
                  onChange={(qty) => {
                    if (qty < 1) {
                      setRemovingItemId(item.id)
                    } else {
                      onUpdateQuantity(item.id, qty)
                    }
                  }}
                  min={0}
                  max={99}
                />
              ) : (
                <>
                  {item.isPaid && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <Check className="h-3 w-3" />
                      Paid
                    </span>
                  )}
                  {item.isTransferred && item.transferredFromPlayerName && (
                    <span className="text-xs text-purple-600 dark:text-purple-400 flex items-center gap-0.5">
                      <ArrowRightLeft className="h-3 w-3" />
                      from {item.transferredFromPlayerName}
                    </span>
                  )}
                </>
              )}
            </div>

            {canModify && (
              <div className="flex items-center gap-1">
                {onTransferItem && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onTransferItem(item.id)
                    }}
                    className="p-1 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors"
                    title="Transfer to another player"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                  </button>
                )}
                {onRemoveItem && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setRemovingItemId(item.id)
                    }}
                    className="p-1 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
})}
```

**Step 4: Update totals display to use quantity**

Update the totals section to multiply by quantity:

```typescript
<div className="flex justify-between text-sm">
  <span className="text-muted-foreground">Subtotal</span>
  <span>฿{slot.lineItems.reduce((sum, item) => sum + item.baseAmount * item.quantity, 0).toFixed(2)}</span>
</div>
```

**Step 5: Commit**

```bash
git add apps/application/src/components/golf/slot-card.tsx
git commit -m "feat(ui): add quantity stepper, remove, and selection to SlotCard"
```

---

## Task 15: Update ShoppingCartCheckInPanel with mutation handlers

**Files:**
- Modify: `apps/application/src/components/golf/shopping-cart-checkin-panel.tsx`

**Step 1: Import new hooks and components**

Add imports:

```typescript
import {
  useUpdateLineItemQuantityMutation,
  useRemoveLineItemMutation,
  useBulkRemoveLineItemsMutation,
  useBulkTransferLineItemsMutation,
  usePayLineItemsMutation,
} from '@clubvantage/api-client'
import { UndoToast } from './undo-toast'
```

**Step 2: Add mutation hooks**

Inside the component, add:

```typescript
const updateQuantity = useUpdateLineItemQuantityMutation()
const removeLineItem = useRemoveLineItemMutation()
const bulkRemove = useBulkRemoveLineItemsMutation()
const bulkTransfer = useBulkTransferLineItemsMutation()
const payLineItems = usePayLineItemsMutation()

// Undo state
const [undoData, setUndoData] = useState<{
  message: string
  items: any[]
} | null>(null)
```

**Step 3: Add handlers**

```typescript
const handleUpdateQuantity = useCallback(async (lineItemId: string, quantity: number) => {
  try {
    setError(null)
    await updateQuantity.mutateAsync({
      input: { lineItemId, quantity }
    })
    refetch()
  } catch (e: any) {
    setError(e.message || 'Failed to update quantity')
  }
}, [updateQuantity, refetch])

const handleRemoveItem = useCallback(async (lineItemId: string) => {
  try {
    setError(null)
    const result = await removeLineItem.mutateAsync({
      input: { lineItemId }
    })
    if (result.removeLineItem.success && result.removeLineItem.removedItem) {
      setUndoData({
        message: 'Item removed',
        items: [result.removeLineItem.removedItem],
      })
    }
    refetch()
  } catch (e: any) {
    setError(e.message || 'Failed to remove item')
  }
}, [removeLineItem, refetch])

const handleUndoRemove = useCallback(async () => {
  if (!undoData) return
  // Re-add removed items
  for (const item of undoData.items) {
    await addLineItem.mutateAsync({
      input: {
        playerId: item.teeTimePlayerId,
        type: item.type,
        description: item.description,
        baseAmount: item.baseAmount,
        taxRate: item.taxRate,
        taxType: item.taxType,
      }
    })
  }
  setUndoData(null)
  refetch()
}, [undoData, addLineItem, refetch])
```

**Step 4: Pass handlers to SlotOverviewPanel**

Update the SlotOverviewPanel usage to pass new handlers.

**Step 5: Add UndoToast**

Add before the closing `</SheetContent>`:

```typescript
{undoData && (
  <UndoToast
    message={undoData.message}
    onUndo={handleUndoRemove}
    onDismiss={() => setUndoData(null)}
  />
)}
```

**Step 6: Commit**

```bash
git add apps/application/src/components/golf/shopping-cart-checkin-panel.tsx
git commit -m "feat(ui): add quantity and remove handlers to ShoppingCartCheckInPanel"
```

---

## Task 16: Update SlotOverviewPanel to support bulk actions

**Files:**
- Modify: `apps/application/src/components/golf/slot-overview-panel.tsx`

**Step 1: Add state for line item selection**

```typescript
const [selectedLineItemIds, setSelectedLineItemIds] = useState<Set<string>>(new Set())
```

**Step 2: Add props for new handlers**

Update interface and pass through to SlotCard.

**Step 3: Add bulk action bar**

Add the LineItemBulkActionBar component.

**Step 4: Commit**

```bash
git add apps/application/src/components/golf/slot-overview-panel.tsx
git commit -m "feat(ui): add bulk action support to SlotOverviewPanel"
```

---

## Task 17: Integration testing

**Step 1: Start dev servers**

```bash
pnpm dev
```

**Step 2: Test quantity stepper**

1. Open tee sheet, right-click a booking → Check In
2. Find a line item, click + to increase quantity
3. Verify total updates correctly
4. Click the quantity number, type "5", press Enter
5. Verify quantity updates

**Step 3: Test remove**

1. Click trash icon on an item
2. Verify confirmation appears
3. Click "No" - item remains
4. Click trash again, click "Yes"
5. Verify undo toast appears
6. Click "Undo" - item restored

**Step 4: Test bulk actions**

1. Check multiple items using checkboxes
2. Verify bulk action bar appears
3. Click "Select All" - all unpaid items selected
4. Click "Remove" - confirm removal
5. Verify all items removed

**Step 5: Commit final integration**

```bash
git add -A
git commit -m "feat: complete quantity management and bulk actions integration"
```
