# Golf / Tee Sheet / Check-in

## Overview

Check-in handles player arrival, payment settlement, and transition from "Booked" to "Checked-in" status. Uses a shopping cart model where each player has their own cart of line items (green fees, cart rental, caddy fees). Supports pre-paid (online) and pay-at-check-in flows. Includes starter ticket generation for on-course operations.

## Status

Partially implemented. API complete for check-in mutations and settlement. UI components built: FlightCheckInPanel, SettlementPanel, LineItemManager, StarterTicketPreview. Shopping cart model designed, batch operations designed. QR code check-in from member portal designed (see `docs/plans/2026-02-06-member-portal-pwa-design.md`).

## Capabilities

- Individual player check-in (not flight-level)
- Per-player shopping cart with line items
- Pre-paid item tracking (show as settled in cart)
- Multiple payment methods: Cash, Card, Transfer, Member Account, Custom
- Per-item tax support (ADD, INCLUDE, NONE tax types)
- Batch operations: select multiple players, pay together, check in together
- Item transfer between player carts
- Cart draft persistence (resume interrupted check-in)
- Pro shop item addition at check-in
- Starter ticket generation (auto or manual trigger)
- Starter ticket printing with QR code
- Quantity management for line items (add/remove/adjust)
- Undo support for item removal (5-second window)
- Settlement modes: individual, group, split

## Dependencies

### Interface Dependencies

- **Members** - Member status (active/suspended), member account balance
- **Billing** - Charge posting, member account debit, invoice generation
- **POS** - Terminal integration for card payments, pro shop inventory
- **Golf / Tee Sheet / Booking** - Booking data, player list, status transitions
- **Golf / Carts** - Cart assignment at check-in, cart status updates
- **Golf / Caddies** - Caddy assignment confirmation

### Settings Dependencies

- `golf/tee-sheet/booking` - booking data feeds check-in
- `golf/carts` - cart inventory and availability
- `golf/caddies` - caddy roster and availability
- `billing/ar-profiles` - member account billing
- `pos/stations` - POS terminal config (if enabled)

### Data Dependencies

- Reads: Booking, BookingPlayer, Cart, Caddy, Member (status, account), ProShopInventory
- Writes: PlayerCart, CartLineItem, CartDraft, StarterTicket, Payment
- Events: player.checkedIn, settlement.completed, starterTicket.generated

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| `allowPartialPayment` | Boolean | true | Golf Ops Manager | Allow check-in with partial balance |
| `blockSuspendedMembers` | Boolean | true | Golf Ops Manager | Prevent check-in for suspended members |
| `showSuspensionReason` | Boolean | false | Golf Ops Manager | Display suspension reason to staff |
| `defaultTaxType` | Enum | ADD | Golf Ops Manager | ADD (on top), INCLUDE (within), NONE |
| `defaultTaxRate` | Decimal | 0.07 | Golf Ops Manager | Default tax rate (7%) |
| `perItemTaxOverride` | Boolean | true | Golf Ops Manager | Allow different tax per line item type |
| `starterTicketTrigger` | Enum | CHECK_IN | Golf Ops Manager | CHECK_IN, SETTLEMENT, MANUAL |
| `autoGenerateTicket` | Boolean | true | Golf Ops Manager | Auto-generate on trigger |
| `ticketIncludeQR` | Boolean | true | Golf Ops Manager | Include QR code on ticket |
| `enableProShopAtCheckIn` | Boolean | true | Golf Ops Manager | Allow adding pro shop items |
| `quickAddProducts` | Array | [] | Golf Ops Manager | Pre-configured quick-add items |
| `cartAutoReleaseHours` | Integer | 5 | Golf Ops Manager | Hours before auto-releasing cart assignment |
| `paymentMethods` | Array | [CASH, CARD, MEMBER_ACCOUNT] | Golf Ops Manager | Enabled payment methods |
| `requirePaymentReference` | Boolean | false | Golf Ops Manager | Require ref number for card/transfer |
| `posTerminalEnabled` | Boolean | false | Golf Ops Manager | Enable POS terminal integration |

## Data Model

```typescript
interface PlayerCart {
  id: string
  teeTimeId: string
  slotId: string
  playerId: string
  playerName: string
  playerType: 'MEMBER' | 'GUEST' | 'DEPENDENT' | 'WALK_UP'
  items: CartLineItem[]
  transferredIn: TransferredItem[]
  transferredOut: TransferredItem[]
  subtotal: number
  taxTotal: number
  grandTotal: number
  paidAmount: number
  balanceDue: number
  isDraft: boolean
  isSettled: boolean
  isCheckedIn: boolean
}

interface CartLineItem {
  id: string
  type: 'GREEN_FEE' | 'CART' | 'CADDY' | 'RENTAL' | 'PRO_SHOP'
  description: string
  quantity: number
  baseAmount: number
  taxType: 'ADD' | 'INCLUDE' | 'NONE'
  taxRate: number
  taxAmount: number
  totalAmount: number
  isPaid: boolean
  paidAt?: Date
  paidVia?: string
  reference?: string
}

interface TransferredItem {
  lineItemId: string
  description: string
  amount: number
  fromSlotId: string
  fromPlayerName: string
  toSlotId: string
  toPlayerName: string
  transferredAt: Date
}

interface CartDraft {
  id: string
  teeTimeId: string
  slots: { slotId: string; playerId: string; selectedItems: string[]; addedItems: string[] }[]
  pendingTransfers: TransferredItem[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

interface StarterTicket {
  id: string
  flightId: string
  ticketNumber: string
  teeTime: string
  course: string
  startingHole: 1 | 10
  players: { name: string; playerType: string; cartNumber?: string; caddyName?: string }[]
  cartNumber?: string
  rentalItems: string[]
  specialRequests?: string
  qrCodeData: string
  generatedAt: Date
  generatedBy: string
  printedAt?: Date
  reprintCount: number
}
```

## Business Rules

- Check-in is per-player, not per-booking or per-flight
- Pre-paid items appear in cart as already settled (isPaid: true)
- Payment must cover balance (or allowPartialPayment enabled) before check-in
- Suspended members blocked from check-in if blockSuspendedMembers enabled
- Cart drafts persist across sessions; indicated by cart icon on flight
- Item transfer moves line item between player carts; adjusts both balances
- Starter ticket auto-generates based on configured trigger
- Quantity stepper: decrement to 0 shows removal confirmation with 3s auto-dismiss
- Removed items have 5-second undo window via toast
- Paid items cannot be modified (quantity locked, no remove)
- Batch select enables: pay selected, check in selected, transfer items

## Member Portal Integration

**Plan**: `docs/plans/2026-02-06-member-portal-pwa-design.md`

- Member ID tab displays a QR code that staff scan for check-in at the pro shop
- QR payload: encrypted member ID, name, tier, expiry timestamp
- QR code cached in IndexedDB for offline display (24h TTL)
- Staff scanner verifies member identity and triggers check-in workflow
- On check-in, member receives push notification confirmation
- QR code can be regenerated by staff if compromised

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Suspended member at check-in | Blocked with reason (if showSuspensionReason on) |
| Partial payment | Allowed if setting enabled; balance tracked |
| All pre-paid, no balance | "Check In" available immediately |
| Cart draft from different staff | Any staff can resume draft |
| Item transfer then cancellation | Transferred items stay with recipient |
| Pro shop item out of stock | Greyed out in quick-add; manual add still possible |
| Network failure during settlement | Draft preserved; retry available |
| Starter ticket reprint | Allowed; reprintCount incremented |
| Check-in after tee time passed | Allowed with warning; common for late arrivals |
| Group settlement disagreement | Switch to individual mode mid-settlement |
