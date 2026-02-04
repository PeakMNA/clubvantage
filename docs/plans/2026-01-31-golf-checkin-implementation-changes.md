# Golf Check-in Shopping Cart: Implementation Changes

**Date:** January 31, 2026
**Related:** 2026-01-31-golf-checkin-shopping-cart-design.md

---

## Overview

This document identifies what needs to change from the current implementation to support the new Shopping Cart check-in model.

---

## Current State Analysis

### Existing Database Models

| Model | Purpose | Changes Needed |
|-------|---------|----------------|
| `TeeTime` | Tee time booking | No changes |
| `TeeTimePlayer` | Player in slot (has `position`) | Add cart/caddy fields, transfer tracking |
| `PlayerCheckInRecord` | Check-in tracking | Minor updates |
| `BookingLineItem` | Line items for charges | Add transfer fields |
| `PaymentTransaction` | Payment records | Add batch payment support |

### Existing UI Components

| Component | Purpose | Action |
|-----------|---------|--------|
| `flight-checkin-panel.tsx` | Current check-in panel | **Replace** with `SlotOverviewPanel` |
| `settlement-panel.tsx` | Current settlement view | **Replace** with `PlayerCartView` |
| `line-item-manager.tsx` | Line item display | **Update** - add transfer button |
| `pro-shop-item-picker.tsx` | Product selection | **Update** - add slot selector |
| `check-in-status-badge.tsx` | Status badges | **Update** - new states |
| `starter-ticket-preview.tsx` | Ticket display | **Keep** - no changes |
| `player-type-badge.tsx` | Player type badge | **Keep** - no changes |

### Existing API/GraphQL

| Query/Mutation | Purpose | Action |
|----------------|---------|--------|
| `flightCheckInInfo` | Get flight check-in data | **Update** to return slot structure |
| `playerPaymentInfo` | Get player payment info | **Keep** - use for cart view |
| `addLineItem` | Add line item | **Keep** |
| `removeLineItem` | Remove line item | **Keep** |
| `processSettlement` | Process payment | **Update** for batch support |
| `checkInFlight` | Check in players | **Update** to `checkInSlots` |

---

## Database Schema Changes

### 1. Update `TeeTimePlayer` Model

```prisma
model TeeTimePlayer {
  // Existing fields...
  id                 String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  teeTimeId          String               @db.Uuid
  position           Int                  // This is the slot number (1-4)

  // NEW: Golf cart assignment (per-slot)
  golfCartId         String?              @db.Uuid
  golfCart           GolfCart?            @relation(fields: [golfCartId], references: [id])

  // NEW: Caddy assignment (per-slot)
  caddyId            String?              @db.Uuid
  caddy              Caddy?               @relation(fields: [caddyId], references: [id])

  // Existing relations...
}
```

### 2. Update `BookingLineItem` Model

```prisma
model BookingLineItem {
  // Existing fields...

  // NEW: Transfer tracking
  isTransferred         Boolean           @default(false)
  transferredFromSlotId String?           @db.Uuid
  transferredToSlotId   String?           @db.Uuid
  transferredAt         DateTime?

  // NEW: Original owner (for transferred items)
  originalPlayerId      String?           @db.Uuid
}
```

### 3. Add `CartDraft` Model

```prisma
model CartDraft {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  teeTimeId     String   @db.Uuid @unique
  teeTime       TeeTime  @relation(fields: [teeTimeId], references: [id])

  // JSON blob for draft state
  draftData     Json     // { slots: [...], pendingTransfers: [...] }

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  createdBy     String   @db.Uuid

  @@map("cart_drafts")
}
```

### 4. Update `PaymentTransaction` Model

```prisma
model PaymentTransaction {
  // Existing fields...

  // NEW: Batch payment support
  isBatchPayment       Boolean           @default(false)
  batchSlotIds         String[]          // Array of slot IDs in batch

  // NEW: Who paid (for member account charges)
  paidByMemberId       String?           @db.Uuid
  paidByMember         Member?           @relation(fields: [paidByMemberId], references: [id])
}
```

---

## API Changes

### New Queries

```graphql
# Replace flightCheckInInfo with slot-based query
query GetTeeTimeSlots($teeTimeId: ID!) {
  teeTimeSlots(teeTimeId: $teeTimeId) {
    id
    slotNumber
    playerId
    playerName
    playerType
    memberId
    memberNumber
    isSuspended
    suspensionReason

    # Golf cart (per-slot)
    golfCartId
    golfCartNumber
    isCartShared
    sharedWithSlots

    # Caddy (per-slot)
    caddyId
    caddyName

    # Cart data
    lineItems {
      id
      type
      description
      baseAmount
      taxType
      taxRate
      taxAmount
      totalAmount
      isPaid
      paidAt
      paymentMethod
      isPrePaid
      isTransferred
      transferredFromSlotId
      transferredFromPlayerName
    }

    # Transfers
    transferredInItems {
      lineItemId
      description
      amount
      fromSlotId
      fromPlayerName
    }
    transferredOutItems {
      lineItemId
      description
      amount
      toSlotId
      toPlayerName
    }

    # Totals
    subtotal
    taxTotal
    grandTotal
    paidAmount
    balanceDue

    # Status
    isCheckedIn
    checkedInAt
    isSettled

    # Draft indicator
    hasDraftItems
  }
}

query GetCartDraft($teeTimeId: ID!) {
  cartDraft(teeTimeId: $teeTimeId) {
    id
    draftData
    updatedAt
    createdBy
  }
}
```

### New Mutations

```graphql
mutation TransferLineItem($input: TransferLineItemInput!) {
  transferLineItem(input: $input) {
    success
    error
    lineItem {
      id
      isTransferred
      transferredToSlotId
    }
  }
}

input TransferLineItemInput {
  lineItemId: ID!
  fromSlotId: ID!
  toSlotId: ID!
}

mutation UndoTransfer($input: UndoTransferInput!) {
  undoTransfer(input: $input) {
    success
    error
  }
}

input UndoTransferInput {
  lineItemId: ID!
}

mutation ProcessBatchPayment($input: BatchPaymentInput!) {
  processBatchPayment(input: $input) {
    success
    transactionId
    error
    processedSlots {
      slotId
      amountPaid
      newBalance
      isSettled
    }
  }
}

input BatchPaymentInput {
  teeTimeId: ID!
  slotIds: [ID!]!
  lineItemIds: [ID!]          # Optional: specific items only
  paymentMethodId: ID!
  reference: String
  chargeToMemberId: ID        # For member account charges
}

mutation CheckInSlots($input: CheckInSlotsInput!) {
  checkInSlots(input: $input) {
    success
    error
    checkedInSlots {
      slotId
      checkedInAt
      error
    }
    ticketId
    ticketNumber
  }
}

input CheckInSlotsInput {
  teeTimeId: ID!
  slotIds: [ID!]!
  notes: String
}

mutation SaveCartDraft($input: SaveCartDraftInput!) {
  saveCartDraft(input: $input) {
    id
    updatedAt
  }
}

input SaveCartDraftInput {
  teeTimeId: ID!
  draftData: JSON!
}

mutation ClearCartDraft($teeTimeId: ID!) {
  clearCartDraft(teeTimeId: $teeTimeId)
}
```

### Updated Mutations

```graphql
# Update addLineItem to support slot context
mutation AddLineItem($input: AddLineItemInput!) {
  addLineItem(input: $input) {
    id
    # ... existing fields
  }
}

input AddLineItemInput {
  slotId: ID!                 # Changed from playerId
  # ... rest same
}
```

---

## UI Component Changes

### Components to CREATE

| Component | File | Description |
|-----------|------|-------------|
| `SlotOverviewPanel` | `slot-overview-panel.tsx` | Main check-in panel with slot grid |
| `SlotCard` | `slot-card.tsx` | Individual slot display with all states |
| `BatchActionsBar` | `batch-actions-bar.tsx` | Selection and batch payment UI |
| `PlayerCartView` | `player-cart-view.tsx` | Individual cart detail view |
| `TransferItemDialog` | `transfer-item-dialog.tsx` | Transfer destination picker |
| `SlotStatusBadge` | `slot-status-badge.tsx` | Status badges for slots |
| `CartDraftIndicator` | `cart-draft-indicator.tsx` | 🛒 badge for tee sheet |

### Components to UPDATE

| Component | Changes |
|-----------|---------|
| `line-item-manager.tsx` | Add `[↗ Transfer]` button, show transferred items differently |
| `pro-shop-item-picker.tsx` | Add slot selector dropdown at top |
| `tee-sheet-row.tsx` | Add draft indicator (🛒) when cart draft exists |

### Components to DELETE (after migration)

| Component | Replaced By |
|-----------|-------------|
| `flight-checkin-panel.tsx` | `SlotOverviewPanel` |
| `settlement-panel.tsx` | `PlayerCartView` + `BatchActionsBar` |

---

## Service Layer Changes

### New Services

```typescript
// apps/api/src/graphql/golf/cart.service.ts
@Injectable()
export class CartService {
  // Transfer line item between slots
  async transferLineItem(input: TransferLineItemInput): Promise<TransferResult>

  // Undo a transfer
  async undoTransfer(lineItemId: string): Promise<boolean>

  // Get cart for a slot
  async getSlotCart(slotId: string): Promise<SlotCart>

  // Calculate totals for multiple slots
  async calculateBatchTotal(slotIds: string[]): Promise<BatchTotal>
}

// apps/api/src/graphql/golf/cart-draft.service.ts
@Injectable()
export class CartDraftService {
  // Save draft
  async saveDraft(teeTimeId: string, data: CartDraftData): Promise<CartDraft>

  // Get draft
  async getDraft(teeTimeId: string): Promise<CartDraft | null>

  // Clear draft
  async clearDraft(teeTimeId: string): Promise<boolean>

  // Check if tee time has draft
  async hasDraft(teeTimeId: string): Promise<boolean>
}
```

### Updated Services

```typescript
// apps/api/src/graphql/golf/checkin.service.ts
@Injectable()
export class CheckInService {
  // Update to support slot-based check-in
  async checkInSlots(input: CheckInSlotsInput): Promise<CheckInResult>

  // Update to support batch payment
  async processBatchPayment(input: BatchPaymentInput): Promise<PaymentResult>
}
```

---

## Migration Strategy

### Phase 1: Database (Non-breaking)
1. Add new columns to `TeeTimePlayer` (nullable)
2. Add new columns to `BookingLineItem` (nullable)
3. Create `CartDraft` table
4. Add new columns to `PaymentTransaction` (nullable)
5. Run migration

### Phase 2: API (Backward Compatible)
1. Add new queries alongside existing
2. Add new mutations alongside existing
3. Update existing mutations to handle new fields
4. Keep old queries working

### Phase 3: UI (Parallel Implementation)
1. Create new components in parallel
2. Add feature flag to switch between old/new
3. Test new flow thoroughly
4. Switch default to new flow

### Phase 4: Cleanup
1. Remove feature flag
2. Delete old components
3. Remove deprecated API endpoints
4. Clean up unused code

---

## Testing Requirements

### Unit Tests
- [ ] Transfer line item logic
- [ ] Batch payment calculation
- [ ] Cart total calculations with transfers
- [ ] Draft save/load/clear

### Integration Tests
- [ ] Full check-in flow with transfers
- [ ] Batch payment with multiple slots
- [ ] Draft persistence across page refresh
- [ ] Member account charging

### E2E Tests
- [ ] Scenario A: Member pays for guests
- [ ] Scenario B: Everyone pays themselves
- [ ] Scenario C: Partial pre-paid + pro shop
- [ ] Scenario D: Walk-up group, one pays all
- [ ] Scenario E: Transfer + mixed payment

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data migration issues | High | Non-breaking schema changes, parallel APIs |
| UI regression | Medium | Feature flag, thorough testing |
| Performance with drafts | Low | Index on `teeTimeId`, cleanup old drafts |
| Complex transfer logic | Medium | Comprehensive unit tests |

---

## Dependencies

### External
- None (all internal changes)

### Internal
- Prisma schema changes must happen first
- API changes before UI changes
- Feature flag system for gradual rollout
