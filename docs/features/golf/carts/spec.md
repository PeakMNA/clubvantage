# Golf / Carts

## Overview

Cart inventory management for the golf operation. Tracks cart fleet including status, maintenance, charging, and real-time availability. Provides operational views for staging area and maintenance tracking.

## Status

Partially implemented. Basic cart CRUD exists in UI with mock data. API cart model exists. Staging and maintenance views designed. Member portal cart request flow designed (see `docs/plans/2026-02-06-member-portal-pwa-design.md`).

## Capabilities

- Manage cart inventory: add, edit, remove carts
- Track cart status: Available, In Use, Charging, Maintenance
- Real-time availability dashboard
- Staging area view: upcoming flights, cart pre-staging
- Maintenance view: service history, charging status, repair tracking
- Cart number management
- Cart type tracking (2-seater, 4-seater, single-rider)
- Electric vs gas tracking
- Auto-release after configurable time

## Dependencies

### Interface Dependencies

- Golf / Tee Sheet / Cart Assignment - Cart selection from inventory
- Golf / Tee Sheet / Check-in - Cart assignment at check-in, return tracking
- Billing - Cart rental charges

### Settings Dependencies

- `autoReleaseEnabled` and `autoReleaseHours` control automatic cart return behavior
- `chargingTimeHours` determines when charging carts become available again
- `maintenanceIntervalDays` drives scheduled maintenance alerts

### Data Dependencies

- Course must exist before carts can be added to inventory
- Cart assignments reference booking and player records

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| totalCartInventory | Integer | 0 | Golf Ops Manager | Total carts in fleet (informational) |
| autoReleaseEnabled | Boolean | true | Golf Ops Manager | Enable auto-release timer |
| autoReleaseHours | Integer | 5 | Golf Ops Manager | Hours before auto-release |
| chargingTimeHours | Integer | 8 | Golf Ops Manager | Expected charging duration |
| maintenanceIntervalDays | Integer | 30 | Golf Ops Manager | Days between scheduled maintenance |
| stagingLeadMinutes | Integer | 30 | Golf Ops Manager | Minutes before tee time to stage cart |

## Data Model

```typescript
interface Cart {
  id: string
  courseId: string
  cartNumber: string
  type: '2_SEATER' | '4_SEATER' | 'SINGLE_RIDER'
  isElectric: boolean
  status: 'AVAILABLE' | 'IN_USE' | 'CHARGING' | 'MAINTENANCE'
  lastMaintenanceDate?: Date
  nextMaintenanceDate?: Date
  stagingPosition?: number
  assignedToPlayerId?: string
  assignedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

## Business Rules

- Cart numbers must be unique within a course
- Only carts with status AVAILABLE can be assigned to players
- Changing status to MAINTENANCE or CHARGING removes cart from available pool
- Auto-release timer starts from `assignedAt` timestamp
- Staging position determines physical cart staging order for upcoming flights
- Deleting a cart requires no active assignments
- Charging carts automatically return to AVAILABLE after `chargingTimeHours`

## Member Portal Integration

**Plan**: `docs/plans/2026-02-06-member-portal-pwa-design.md`

- Members can request a golf cart during the tee time booking flow in the portal
- Cart request toggle shown on booking review screen
- Controlled by `golf.cartRequest` feature flag — when disabled, cart assignment is staff-only
- Cart request creates a rental record with status REQUESTED
- Staff sees cart requests in the tee sheet and assigns specific carts
- Pricing displayed during booking: shared cart vs. individual cart rate

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Cart not returned | Auto-release after configured hours |
| Cart breakdown mid-round | Mark as MAINTENANCE; flag for reassignment |
| All electric carts charging | Only gas/available shown in assignment |
| Duplicate cart numbers | Validation prevents |
| Cart deleted with active assignment | Blocked; must unassign first |
