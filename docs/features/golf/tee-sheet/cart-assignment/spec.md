# Golf / Tee Sheet / Cart Assignment

## Overview

Per-player cart assignment within bookings. Each player in a booking can be assigned a specific cart. Cart assignment happens at booking time or at check-in. When a caddy is assigned, the caddy drives (1 cart per player in Asian golf mode).

## Status

Designed. Cart dropdown in booking modal per player exists in design.

## Capabilities

- Assign specific cart to individual player (not flight-level)
- Cart dropdown shows only available carts
- Toggle cart request on/off per player
- Auto-update cart status on assign (available -> in-use) and unassign (in-use -> available)
- Caddy-drives-cart mode: when caddy assigned, one cart per player automatically
- Cart sharing between players in same booking
- Cart status tracking per player: NONE, REQUESTED, ASSIGNED, RETURNED

## Dependencies

### Interface Dependencies

- Golf / Carts - Cart inventory, availability, status updates
- Golf / Caddies - Caddy assignment triggers cart behavior in caddyDrivesCart mode
- Golf / Tee Sheet / Booking - Player context for assignment
- Billing - Cart rental fee line item

### Settings Dependencies

- `caddyDrivesCart` from Golf / Caddies settings controls automatic cart assignment behavior
- `cartPolicy` determines whether cart assignment is optional or required during booking

### Data Dependencies

- Cart inventory must be populated before assignment is possible
- Booking must have at least one player before cart assignment

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| cartPolicy | Enum | OPTIONAL | Golf Ops Manager | OPTIONAL or REQUIRED - whether cart is mandatory |
| caddyDrivesCart | Boolean | true | Golf Ops Manager | Asian golf mode: caddy assignment triggers 1 cart per player |
| cartAutoRelease | Integer (hours) | 5 | Golf Ops Manager | Hours after assignment before auto-release |
| defaultCartType | String | 2-seater | Golf Ops Manager | Default cart type for new assignments |

## Data Model

```typescript
// Extension on BookingPlayer
interface BookingPlayer {
  cartId?: string
  cartNumber?: string
  cartStatus: 'NONE' | 'REQUESTED' | 'ASSIGNED' | 'RETURNED'
  cartSharedWith?: string[] // other player IDs sharing cart
}
```

## Business Rules

- Only carts with status "available" appear in dropdown
- Assigning cart sets cart status to "in-use" and player cartStatus to "ASSIGNED"
- Unassigning returns cart to "available"
- Format in dropdown: "Cart #[number] ([type])" e.g., "Cart #12 (2-seater)"
- Carts in CHARGING or MAINTENANCE cannot be assigned
- When caddyDrivesCart enabled and caddy assigned: auto-request cart, 1 cart per player

## Edge Cases

| Scenario | Handling |
|----------|----------|
| All carts in use | Dropdown shows "No carts available" (disabled) |
| Cart breaks mid-round | Staff changes cart status; player shown as "needs reassignment" |
| Player declines cart at check-in | Unassign; cart returns to available |
| Shared cart, one player cancels | Cart stays with remaining player |
| Auto-release triggered | Cart returns to available; player cartStatus -> RETURNED |
