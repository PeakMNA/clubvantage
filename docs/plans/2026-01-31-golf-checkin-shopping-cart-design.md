# Golf Check-in: Shopping Cart Model Design

**Version:** 2.0
**Date:** January 31, 2026
**Status:** Design Complete
**Replaces:** 2026-01-30-golf-checkin-design.md

---

## Overview

This document specifies the redesigned check-in process using a **Shopping Cart model** inspired by industry-standard golf POS systems (Lightspeed, foreUP, Cobalt). Each player slot has its own cart, items can be transferred between carts, and batch operations enable efficient processing.

## Key Design Decisions

| # | Decision | Choice |
|---|----------|--------|
| 1 | **Cart scope** | Per-slot (each player has own cart) |
| 2 | **Pre-paid handling** | Show in cart as settled items |
| 3 | **Check-in trigger** | Explicit button after payment |
| 4 | **Cart persistence** | Draft saves, can resume later |
| 5 | **Resume UX** | Indicator on tee sheet (🛒 badge) |
| 6 | **Multiple drafts** | Yes, one draft per tee time |
| 7 | **Post check-in** | Can still add items to checked-in players |
| 8 | **$0 balance flow** | Show "Check In" directly, skip payment |
| 9 | **Member pays for guest** | Transfer items to member's cart |
| 10 | **Batch operations** | Select multiple slots, pay together |

---

## Data Models

### Core Types (Unchanged)

```typescript
type TaxType = 'ADD' | 'INCLUDE' | 'NONE';
type LineItemType = 'GREEN_FEE' | 'CART' | 'CADDY' | 'RENTAL' | 'PROSHOP';
type PaymentMethodType = 'CASH' | 'CARD' | 'TRANSFER' | 'ACCOUNT' | 'CUSTOM';
```

### Slot (Player Position in Tee Time)

```typescript
interface TeeTimeSlot {
  id: string;
  teeTimeId: string;
  slotNumber: number;           // 1-4 typically
  playerId?: string;            // null if empty slot
  playerName?: string;
  playerType?: 'MEMBER' | 'GUEST' | 'DEPENDENT' | 'WALKUP';
  memberId?: string;

  // Golf cart & caddy (per-slot)
  golfCartId?: string;
  golfCartNumber?: string;
  golfCartSharedWith?: string[];  // Other slot IDs sharing this cart
  caddyId?: string;
  caddyName?: string;

  // Status
  isCheckedIn: boolean;
  checkedInAt?: Date;
  checkedInBy?: string;

  // Cart reference
  cartDraftId?: string;         // If draft exists
}
```

### Player Cart (Shopping Cart)

```typescript
interface PlayerCart {
  id: string;
  teeTimeId: string;
  slotId: string;
  playerId: string;
  playerName: string;
  playerType: string;

  // Line items in this cart
  items: CartLineItem[];

  // Transfers
  transferredIn: TransferredItem[];   // Items from other players
  transferredOut: TransferredItem[];  // Items moved to other players

  // Totals (calculated)
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;

  // Status
  isDraft: boolean;
  isSettled: boolean;
  isCheckedIn: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface CartLineItem {
  id: string;
  type: LineItemType;
  description: string;
  baseAmount: number;
  taxType: TaxType;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;

  // Payment status
  isPaid: boolean;
  paidAt?: Date;
  paidVia?: string;             // Payment method ID
  paidByPlayerId?: string;      // If paid by another player
  transactionId?: string;

  // Selection (for partial payment)
  isSelected: boolean;

  // Source tracking
  isPrePaid: boolean;           // Paid online during booking
  isTransferred: boolean;       // Transferred from another cart
  transferredFromSlotId?: string;

  // Product reference (for pro shop items)
  productId?: string;
  variantId?: string;
}

interface TransferredItem {
  lineItemId: string;
  description: string;
  amount: number;
  fromSlotId: string;
  fromPlayerName: string;
  toSlotId: string;
  toPlayerName: string;
  transferredAt: Date;
}
```

### Cart Draft (For Persistence)

```typescript
interface CartDraft {
  id: string;
  teeTimeId: string;

  // Slots with pending changes
  slots: {
    slotId: string;
    playerId: string;
    selectedItems: string[];    // Line item IDs selected for payment
    addedItems: CartLineItem[]; // Pro shop items added
  }[];

  // Pending transfers
  pendingTransfers: {
    lineItemId: string;
    fromSlotId: string;
    toSlotId: string;
  }[];

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

### Payment Transaction

```typescript
interface PaymentTransaction {
  id: string;
  teeTimeId: string;

  // What was paid
  lineItems: {
    lineItemId: string;
    slotId: string;
    playerId: string;
    amount: number;
  }[];

  // How it was paid
  paymentMethodId: string;
  paymentMethodName: string;
  totalAmount: number;
  reference?: string;

  // Who paid (for member account charges)
  paidBySlotId?: string;
  paidByPlayerId?: string;
  paidByMemberId?: string;

  // Metadata
  processedAt: Date;
  processedBy: string;
}
```

---

## UI Components

### 1. Tee Sheet Integration

**Draft indicator on tee sheet row:**

```
┌─────────────────────────────────────────────────────────────┐
│ TEE SHEET - January 31, 2026                                │
├─────────────────────────────────────────────────────────────┤
│ 8:00 AM  Lake #1   J.Wilson, S.Wilson, ...    [Checked In]  │
│ 8:10 AM  Lake #1   T.Harris, D.Park, ...      [Booked]      │
│ 8:20 AM  Lake #1   A.Roberts, B.Taylor  🛒    [Booked]      │
│                                         ↑                   │
│                                   Draft indicator           │
│                                   Tooltip: "2 items pending"│
│ 8:30 AM  Lake #1   Walk-up, Walk-up, ...      [Booked]      │
└─────────────────────────────────────────────────────────────┘
```

### 2. Slot Overview Panel (Primary View)

**Layout: Full flight view with all slots**

```
┌─────────────────────────────────────────────────────────────────┐
│ 8:00 AM · Lake Course · Hole 1                               X  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─ SLOT 1 ─────────────────────────────────────────────────┐   │
│  │ [☐] James Wilson (M)                        Cart #12     │   │
│  │     Green Fee $150 · Cart $20               Caddy: —     │   │
│  │     ✓ Paid online                                        │   │
│  │                                             Ready ✓      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─ SLOT 2 ─────────────────────────────────────────────────┐   │
│  │ [☐] Sarah Wilson (D)                        Cart #12     │   │
│  │     Green Fee $75 · Cart $20                (shared)     │   │
│  │     ✓ Paid online                                        │   │
│  │                                             Ready ✓      │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─ SLOT 3 ─────────────────────────────────────────────────┐   │
│  │ [☐] Mike Chen (G)                           Cart #14     │   │
│  │     Green Fee $180 · Cart $20                            │   │
│  │     $200.00 due                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─ SLOT 4 ─────────────────────────────────────────────────┐   │
│  │ [☐] Lisa Chen (G)                           Cart #14     │   │
│  │     Green Fee $180 · Cart $20               (shared)     │   │
│  │     $200.00 due                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  Flight: $570 total · $190 paid · $400 due                      │
│                                                                 │
│  BATCH ACTIONS (0 selected):                                    │
│  [Select All Due]  [Select All Ready]  [+ Add Pro Shop Item]   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Slot Card States

**State: Pre-paid, Ready to Check In**
```
┌─ SLOT 1 ─────────────────────────────────────────────────┐
│ [☐] James Wilson (M)                        Cart #12     │
│     Green Fee $150 · Cart $20               Caddy: Mike  │
│     ✓ Paid online                                        │
│                                             Ready ✓      │
└──────────────────────────────────────────────────────────┘
```

**State: Balance Due**
```
┌─ SLOT 3 ─────────────────────────────────────────────────┐
│ [☐] Mike Chen (G)                           Cart #14     │
│     Green Fee $180 · Cart $20                            │
│     $200.00 due                                          │
└──────────────────────────────────────────────────────────┘
```

**State: Selected for Batch Payment**
```
┌─ SLOT 3 ─────────────────────────────────────────────────┐
│ [☑] Mike Chen (G)                           Cart #14     │
│     Green Fee $180 · Cart $20                            │
│     $200.00 due                             ● Selected   │
└──────────────────────────────────────────────────────────┘
```

**State: Items Transferred Out**
```
┌─ SLOT 3 ─────────────────────────────────────────────────┐
│ [☐] Mike Chen (G)                           Cart #14     │
│     Green Fee $180 → James                               │
│     Cart $20 due                                         │
│     $20.00 due                                           │
└──────────────────────────────────────────────────────────┘
```

**State: Items Transferred In**
```
┌─ SLOT 1 ─────────────────────────────────────────────────┐
│ [☐] James Wilson (M)                        Cart #12     │
│     Own: $170 paid                                       │
│     + Mike's Green Fee: $180 due                         │
│     $180.00 due                                          │
└──────────────────────────────────────────────────────────┘
```

**State: Paid, Ready to Check In**
```
┌─ SLOT 3 ─────────────────────────────────────────────────┐
│ [☑] Mike Chen (G)                           Cart #14     │
│     $200.00 paid (Card ***4242)                          │
│                                             Ready ✓      │
└──────────────────────────────────────────────────────────┘
```

**State: Already Checked In**
```
┌─ SLOT 1 ─────────────────────────────────────────────────┐
│ [☐] James Wilson (M)                        ✓ Checked In │
│     Checked in 8:22 AM                      Cart #12     │
│     [+ Add Item]                                         │
└──────────────────────────────────────────────────────────┘
```

**State: Empty Slot**
```
┌─ SLOT 4 ─────────────────────────────────────────────────┐
│     (Empty)                                              │
└──────────────────────────────────────────────────────────┘
```

### 4. Batch Actions Bar

**No selection:**
```
─────────────────────────────────────────────────────────────
Flight: $570 total · $190 paid · $400 due

BATCH ACTIONS (0 selected):
[Select All Due]  [Select All Ready]  [+ Add Pro Shop Item]
```

**With selection (balance due):**
```
─────────────────────────────────────────────────────────────
SELECTED: 2 players · $400.00 due

[+ Add Pro Shop Item]

PAY WITH:
[💵 Cash] [💳 Card] [🏦 James Wilson Acct ▾]

[Pay $400.00]      [Transfer to Another Player]
```

**With selection (ready to check in):**
```
─────────────────────────────────────────────────────────────
SELECTED: 4 players · All paid

Assign Cart #: [____]    Notes: [____________________]

[✓ Check In All 4 Players]
```

### 5. Individual Cart View (Click on Slot)

**Accessed by:** Clicking a slot card

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Mike Chen (G) · Slot 3                                     X  │
│   8:00 AM · Cart #14                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MIKE'S CART                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │  [✓] Green Fee (Guest 18h)                    $180.00    │   │
│  │      Tax (7%)                                  $12.60    │   │
│  │                                           [↗ Transfer]   │   │
│  │                                                          │   │
│  │  [✓] Cart Rental (1/2 share)                   $20.00    │   │
│  │      Tax (7%)                                   $1.40    │   │
│  │                                           [↗ Transfer]   │   │
│  │                                                          │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  Subtotal                                     $200.00    │   │
│  │  Tax                                           $14.00    │   │
│  │  ─────────────────────────────────────────────────────   │   │
│  │  TOTAL DUE                                    $214.00    │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [+ Add Pro Shop Item]                                          │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  PAY WITH:                                                      │
│  [💵 Cash]  [💳 Card]  [🏦 Member Acct ▾]                      │
│                                                                 │
│  [Pay $214.00]                                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6. Cart with Pre-paid + New Items

```
┌─────────────────────────────────────────────────────────────────┐
│ ← Amy Roberts (M) · Slot 1                                   X  │
│   8:20 AM · Cart #18                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  AMY'S CART                                                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PRE-PAID ─────────────────────────────────────────────  │   │
│  │  ✓ Green Fee (Member 18h)                     $150.00    │   │
│  │    Paid online Jan 29                                    │   │
│  │                                                          │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  DUE NOW ──────────────────────────────────────────────  │   │
│  │  [✓] Cart Rental                               $20.00    │   │
│  │      Tax (7%)                                   $1.40    │   │
│  │                                                          │   │
│  │  [✓] Pro V1 Golf Balls                         $54.99    │   │
│  │      Tax (7%)                                   $3.85    │   │
│  │                                              [🗑 Remove]  │   │
│  │                                                          │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [+ Add Pro Shop Item]                                          │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│  Already Paid                                    $150.00        │
│  To Pay                                           $80.24        │
│                                                                 │
│  PAY WITH:                                                      │
│  [💵 Cash]  [💳 Card]  [🏦 Amy Roberts Acct]                   │
│                                                                 │
│  [Pay $80.24]                                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7. Transfer Item Flow

**Step 1: Click "Transfer" on item**
```
┌─────────────────────────────────────────────────────────────────┐
│ Transfer Item                                              X    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Moving: Green Fee (Guest 18h) - $180.00                        │
│  From:   Mike Chen (Slot 3)                                     │
│                                                                 │
│  Transfer to:                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ○ James Wilson (M) · Slot 1                             │    │
│  │ ○ Sarah Wilson (D) · Slot 2                             │    │
│  │ ○ Lisa Chen (G) · Slot 4                                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  [Cancel]                              [Transfer to James]      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Step 2: After transfer - Source cart updated**
```
│  MIKE'S CART                                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Green Fee (Guest 18h)        $180.00   → James Wilson   │   │
│  │                                          (transferred)   │   │
│  │                                                          │   │
│  │  [✓] Cart Rental (1/2)         $20.00   [↗ Transfer]     │   │
│  │      Tax (7%)                   $1.40                    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  To Pay                                           $21.40        │
```

### 8. Pro Shop Item Picker

```
┌─────────────────────────────────────────────────────────────────┐
│ Add Pro Shop Item                                          X    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Add to: [Mike Chen (Slot 3) ▾]                                 │
│                                                                 │
│  🔍 Search products...                                          │
│                                                                 │
│  QUICK ADD                                                      │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  │ Golf Balls │ │ Gloves     │ │ Tees       │ │ Water      │   │
│  │ $54        │ │ $32        │ │ $8         │ │ $4         │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
│                                                                 │
│  CATEGORIES                                                     │
│  [All] [Balls] [Gloves] [Accessories] [Apparel] [Beverages]    │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Pro V1 Golf Balls (Dozen)              $54.99       [+]  │   │
│  │ Titleist Tour Soft (Dozen)             $42.99       [+]  │   │
│  │ Callaway Chrome Soft (Dozen)           $49.99       [+]  │   │
│  │ FootJoy WeatherSof Glove               $18.00       [+]  │   │
│  │ Titleist Players Glove                 $28.00       [+]  │   │
│  │ Wooden Tees (100 pack)                  $8.00       [+]  │   │
│  │ Bottled Water                           $4.00       [+]  │   │
│  │ Gatorade                                $5.00       [+]  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 9. Check-in Completion

```
┌─────────────────────────────────────────────────────────────────┐
│ 8:00 AM · Lake Course · Hole 1                               X  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    ✓ CHECK-IN COMPLETE                    │  │
│  │                                                           │  │
│  │   4 players checked in at 8:22 AM                         │  │
│  │                                                           │  │
│  │   James Wilson · Sarah Wilson · Mike Chen · Lisa Chen     │  │
│  │   Carts: #12, #14                                         │  │
│  │                                                           │  │
│  │   Total: $570.00                                          │  │
│  │   • $190.00 pre-paid online                               │  │
│  │   • $380.00 paid via James Wilson Account                 │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  🎫 STARTER TICKET                                        │  │
│  │     ST-2026-0131-008                                      │  │
│  │                                                           │  │
│  │     8:00 AM · Lake Course · Hole 1                        │  │
│  │     Players: James, Sarah, Mike, Lisa                     │  │
│  │     Carts: #12, #14                                       │  │
│  │     Caddy: Mike (Forecaddy)                               │  │
│  │                                                           │  │
│  │     [Print Ticket]  [Print Receipt]  [Email]              │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [Done]                                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Sample Scenarios

### Scenario A: Member Pays for All Guests

**8:00 AM · Lake Course**

| Slot | Player | Type | Pre-paid | Due |
|------|--------|------|----------|-----|
| 1 | James Wilson | Member | ✓ $170 | $0 |
| 2 | Sarah Wilson | Dependent | ✓ $95 | $0 |
| 3 | Mike Chen | Guest | ✗ | $200 |
| 4 | Lisa Chen | Guest | ✗ | $200 |

**Flow:**
1. Open tee time panel
2. Select slots 3 & 4 (Mike & Lisa)
3. Choose "James Wilson Account" as payment method
4. Click "Pay $400.00"
5. All 4 show "Ready ✓"
6. Click "Check In All 4 Players"
7. Ticket generated

---

### Scenario B: Everyone Pays Themselves

**8:10 AM · Lake Course**

| Slot | Player | Type | Pre-paid | Due |
|------|--------|------|----------|-----|
| 1 | Tom Harris | Member | ✓ $170 | $0 |
| 2 | David Park | Member | ✓ $170 | $0 |
| 3 | Kevin Brooks | Member | ✗ | $170 |
| 4 | Ryan Scott | Member | ✗ | $170 |

**Flow:**
1. Open tee time panel
2. Slots 1 & 2 already show "Ready ✓"
3. Click on Slot 3 (Kevin) → Open cart → Pay with Card
4. Click on Slot 4 (Ryan) → Open cart → Pay with Cash
5. All 4 show "Ready ✓"
6. Select all → Check In

---

### Scenario C: Partial Pre-paid + Pro Shop

**8:20 AM · Lake Course**

| Slot | Player | Type | Pre-paid | Due |
|------|--------|------|----------|-----|
| 1 | Amy Roberts | Member | Green Fee only ($150) | $20 (cart) |
| 2 | Beth Taylor | Guest | ✗ | $200 |

**Flow:**
1. Open tee time panel
2. Click Slot 1 (Amy) → See cart with pre-paid green fee + cart due
3. Click "+ Add Pro Shop Item" → Add golf balls ($54.99)
4. Pay $76.39 total (cart + balls + tax)
5. Click Slot 2 (Beth) → Pay $214.00 cash
6. Check in both

---

### Scenario D: Walk-up Group, One Pays for All

**8:30 AM · Lake Course**

| Slot | Player | Type | Pre-paid | Due |
|------|--------|------|----------|-----|
| 1 | John (Walk-up) | Walk-up | ✗ | $225 |
| 2 | Jane (Walk-up) | Walk-up | ✗ | $225 |
| 3 | Bob (Walk-up) | Walk-up | ✗ | $225 |
| 4 | Sam (Walk-up) | Walk-up | ✗ | $225 |

**Flow:**
1. Open tee time panel
2. Click "Select All Due"
3. Choose Card payment
4. Pay $900.00
5. Assign cart numbers
6. Check In All 4
7. Print ticket

---

### Scenario E: Transfer + Mixed Payment

**8:40 AM · Lake Course**

| Slot | Player | Type | Pre-paid | Due |
|------|--------|------|----------|-----|
| 1 | Mr. Smith | Member | ✓ $170 | $0 |
| 2 | Mrs. Smith | Dependent | ✓ $95 | $0 |
| 3 | Guest A | Guest | ✗ | $200 |
| 4 | Guest B | Guest | ✗ | $200 |

**Flow:**
1. Open tee time panel
2. Click Slot 3 → Transfer Green Fee to Slot 1 (Mr. Smith)
3. Click Slot 4 → Transfer Green Fee to Slot 1 (Mr. Smith)
4. Mr. Smith's cart now shows $360 due (2 guest green fees)
5. Pay Mr. Smith's cart with Member Account
6. Guests still have cart rental due ($20 each)
7. Guests pay their own carts with cash
8. Check in all

---

## User Flows

### Flow 1: Quick Check-in (Pre-paid, No Additions)

```
Tee Sheet → Click Row → Panel Opens
    ↓
All slots show "Ready ✓"
    ↓
Click "Select All Ready"
    ↓
Click "Check In All"
    ↓
Ticket Generated → Print → Done
```

### Flow 2: Standard Payment + Check-in

```
Tee Sheet → Click Row → Panel Opens
    ↓
Select slots with balance due
    ↓
Choose payment method
    ↓
Click "Pay $X"
    ↓
Slots now show "Ready ✓"
    ↓
Click "Check In Selected"
    ↓
Ticket Generated → Print → Done
```

### Flow 3: Individual Cart with Additions

```
Panel Opens → Click specific slot
    ↓
Individual Cart View opens
    ↓
Click "+ Add Pro Shop Item"
    ↓
Select product → Added to cart
    ↓
Choose payment method
    ↓
Click "Pay $X"
    ↓
Back to Slot Overview
    ↓
Continue with other slots or Check In
```

### Flow 4: Transfer Items Between Players

```
Panel Opens → Click slot with items to transfer
    ↓
Click "Transfer" on line item
    ↓
Select destination slot
    ↓
Item moves to other player's cart
    ↓
Original cart balance reduced
    ↓
Destination cart balance increased
    ↓
Process payments per cart
```

### Flow 5: Resume Draft Cart

```
Tee Sheet shows 🛒 indicator on row
    ↓
Click row → Panel opens with draft restored
    ↓
See pending selections/items
    ↓
Continue where left off
```

---

## API Changes Required

### New Queries

```graphql
# Get slot overview for tee time
query GetTeeTimeSlots($teeTimeId: ID!) {
  teeTimeSlots(teeTimeId: $teeTimeId) {
    id
    slotNumber
    playerId
    playerName
    playerType
    memberId
    golfCartNumber
    golfCartSharedWith
    caddyName
    isCheckedIn
    checkedInAt
    cart {
      items { ... }
      subtotal
      taxTotal
      grandTotal
      paidAmount
      balanceDue
    }
    hasDraft
  }
}

# Get individual player cart
query GetPlayerCart($slotId: ID!) {
  playerCart(slotId: $slotId) {
    id
    items {
      id
      type
      description
      baseAmount
      taxAmount
      totalAmount
      isPaid
      isPrePaid
      isTransferred
      transferredFromSlotId
    }
    transferredIn { ... }
    transferredOut { ... }
    subtotal
    taxTotal
    grandTotal
    paidAmount
    balanceDue
  }
}

# Check for draft cart
query GetCartDraft($teeTimeId: ID!) {
  cartDraft(teeTimeId: $teeTimeId) {
    id
    slots { ... }
    pendingTransfers { ... }
    updatedAt
  }
}
```

### New Mutations

```graphql
# Transfer item between carts
mutation TransferLineItem($input: TransferLineItemInput!) {
  transferLineItem(input: $input) {
    success
    sourceCart { ... }
    destinationCart { ... }
  }
}

input TransferLineItemInput {
  lineItemId: ID!
  fromSlotId: ID!
  toSlotId: ID!
}

# Batch payment for multiple slots
mutation ProcessBatchPayment($input: BatchPaymentInput!) {
  processBatchPayment(input: $input) {
    success
    transactionId
    slots {
      slotId
      amountPaid
      newBalance
    }
  }
}

input BatchPaymentInput {
  teeTimeId: ID!
  slotIds: [ID!]!
  lineItemIds: [ID!]         # Optional: specific items (for partial)
  paymentMethodId: ID!
  reference: String
  chargeToMemberId: ID       # If charging to member account
}

# Save/update cart draft
mutation SaveCartDraft($input: SaveCartDraftInput!) {
  saveCartDraft(input: $input) {
    id
    updatedAt
  }
}

# Clear cart draft
mutation ClearCartDraft($teeTimeId: ID!) {
  clearCartDraft(teeTimeId: $teeTimeId)
}

# Batch check-in
mutation CheckInSlots($input: CheckInSlotsInput!) {
  checkInSlots(input: $input) {
    success
    slots {
      slotId
      checkedIn
      error
    }
    ticketId
    ticketNumber
  }
}

input CheckInSlotsInput {
  teeTimeId: ID!
  slotIds: [ID!]!
  cartNumbers: [CartAssignment!]
  notes: String
}
```

---

## Implementation Phases

### Phase 1: Data Model Updates
- [ ] Add `TeeTimeSlot` model to Prisma schema
- [ ] Add `CartDraft` model for persistence
- [ ] Update `BookingLineItem` with transfer fields
- [ ] Add slot-level cart/caddy fields
- [ ] Create migration (non-destructive)

### Phase 2: API Layer
- [ ] Create `GetTeeTimeSlots` query
- [ ] Create `GetPlayerCart` query
- [ ] Create `TransferLineItem` mutation
- [ ] Create `ProcessBatchPayment` mutation
- [ ] Create `SaveCartDraft` / `ClearCartDraft` mutations
- [ ] Create `CheckInSlots` mutation
- [ ] Update existing queries for backward compatibility

### Phase 3: UI Components - Slot Overview
- [ ] Create `SlotOverviewPanel` component
- [ ] Create `SlotCard` component with all states
- [ ] Create `BatchActionsBar` component
- [ ] Add draft indicator to tee sheet row
- [ ] Implement slot selection logic

### Phase 4: UI Components - Individual Cart
- [ ] Create `PlayerCartView` component
- [ ] Create `CartLineItem` component with transfer button
- [ ] Create `TransferItemDialog` component
- [ ] Update `ProShopItemPicker` with slot selector
- [ ] Implement payment processing in cart view

### Phase 5: Integration & Polish
- [ ] Wire up draft persistence (auto-save)
- [ ] Add draft resume flow
- [ ] Implement check-in completion flow
- [ ] Add ticket generation
- [ ] Add keyboard shortcuts
- [ ] Add loading/error states

### Phase 6: Migration & Cleanup
- [ ] Migrate existing check-in data to slot model
- [ ] Remove old `FlightCheckInPanel` component
- [ ] Remove old `SettlementPanel` component
- [ ] Update tee sheet integration
- [ ] End-to-end testing

---

## Component Mapping (Old → New)

| Old Component | New Component | Notes |
|---------------|---------------|-------|
| `FlightCheckInPanel` | `SlotOverviewPanel` | Complete rewrite |
| `SettlementPanel` | `PlayerCartView` + `BatchActionsBar` | Split into parts |
| `LineItemManager` | `CartLineItem` | Add transfer support |
| `ProShopItemPicker` | `ProShopItemPicker` | Add slot selector |
| `CheckInStatusBadge` | `SlotStatusBadge` | New states |
| (none) | `TransferItemDialog` | New |
| (none) | `SlotCard` | New |

---

## Design System Colors

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Ready ✓ | `bg-emerald-100 text-emerald-700` | `bg-emerald-500/20 text-emerald-400` |
| Due | `bg-amber-100 text-amber-700` | `bg-amber-500/20 text-amber-400` |
| Selected | `bg-blue-100 text-blue-700` | `bg-blue-500/20 text-blue-400` |
| Checked In | `bg-emerald-500 text-white` | same |
| Transferred | `text-muted-foreground italic` | same |
| Pre-paid | `text-emerald-600` | `text-emerald-400` |
| Draft indicator | `text-amber-500` | same |

---

## Appendix: Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `↑` / `↓` | Navigate between slots |
| `Space` | Toggle slot selection |
| `Enter` | Open selected slot cart |
| `A` | Select all due |
| `R` | Select all ready |
| `Esc` | Close panel / Back to overview |
| `P` | Open payment method selector |
| `C` | Check in selected |
