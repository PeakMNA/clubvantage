# Bookings / Equipment / Equipment Inventory & Assignment

## Overview

The Equipment system manages physical equipment items that can be attached to bookings as optional add-ons (member requests, staff assigns) or required resources (service requires them, auto-reserved). Equipment is unified across the entire platform through an `operationType` field on `EquipmentCategory`, which scopes visibility: Golf operations see carts, clubs, and pull carts; Facility operations see tennis rackets, yoga mats, and ball machines; Spa operations see robes and towels; Event operations see projectors and AV systems. Each equipment category defines its attachment type, rental rates, and deposit requirements. Individual equipment items track condition, status, location, maintenance history, and serial numbers. Equipment is assigned to bookings (facility bookings) or tee-time players (golf bookings) at check-in time, not during booking creation. The assignment lifecycle tracks condition at checkout and return, supports rental fee recording, and auto-transitions equipment to maintenance when returned in poor condition.

## Status

| Aspect | State | Notes |
|--------|-------|-------|
| Equipment list (grid/list views) | Implemented | Card-based display with category icons, status badges, condition |
| Equipment search | Implemented | Text search on name, code, location |
| Equipment category filter | Implemented | Filter by cart, bike, sports, fitness, apparel, other |
| Equipment status filter | Implemented | Filter by available, in_use, reserved, maintenance |
| Equipment condition display | Implemented | Color-coded condition badges |
| Assignment display | Implemented | Shows assigned member with avatar, name, and timing |
| Check Out (assign) flow | Implemented | `equipment-assign-modal.tsx` with member search |
| Check In (return) flow | Implemented | `equipment-return-modal.tsx` with condition selection |
| Maintenance toggle | Implemented | Status update via `useEquipmentMutations` hook |
| Operation type filtering | Implemented | `operationType` prop on EquipmentTab; hook passes to API |
| useEquipment hook | Implemented | Fetches from GraphQL, transforms API data to UI format |
| useEquipmentMutations hook | Implemented | Status update, assign, return mutations |
| GraphQL CRUD (categories) | Implemented | `equipmentCategories` query, create/update/delete mutations |
| GraphQL CRUD (items) | Implemented | `equipment` query, create/update/delete mutations |
| GraphQL assignment | Implemented | `assignEquipment`, `returnEquipment` mutations |
| Equipment availability query | Implemented | `equipmentAvailability` query by category and time range |
| Equipment category modal | Implemented | `equipment-category-modal.tsx` |
| Equipment item modal | Implemented | `equipment-modal.tsx` |
| Seed data | Implemented | `seed-equipment.ts` with golf carts, clubs, rackets, bikes, G5 machines |
| Backend service | Implemented | `EquipmentService` with CRUD, availability, assign/return in NestJS |
| Event store logging | Implemented | Status changes and assignments logged via `EventStoreService` |
| Nested resource integration | Schema Designed | `FacilityEquipmentOption` model links categories to facilities |
| Service equipment requirements | Schema Designed | `ServiceEquipmentRequirement` model links categories to services |
| Equipment auto-reserve for services | Not Implemented | Planned: services with required equipment auto-reserve on booking |
| Equipment release on booking cancel | Designed | `releaseEquipmentForBooking` method exists in service |
| Asset tracking (serial, warranty) | Schema Implemented | Fields in Equipment model but not surfaced in main list UI |
| Maintenance scheduling | Partially Implemented | `nextMaintenanceAt` field exists; no scheduler or alerts |
| Equipment images | Not Implemented | No image upload for equipment |
| Barcode/QR scanning | Not Implemented | Asset numbers exist but no scanning integration |

## Capabilities

- Display all equipment in responsive grid or list layout with category-specific icons
- Search equipment by name, asset number, or location
- Filter equipment by category (cart, bike, sports, fitness, apparel, other) and status (available, in_use, reserved, maintenance)
- Scope equipment visibility by operation type (Golf, Facility, Spa, Event)
- Create equipment categories with attachment type, rental rate, deposit requirements, icon, and color
- Create individual equipment items with asset number, serial number, manufacturer, model, condition, and location
- Assign equipment to bookings or tee-time players with condition tracking and rental fee
- Return equipment with condition assessment and automatic status transition
- Toggle maintenance mode on equipment items
- Display assignment details including member name, assignment time, and expected return
- Track equipment condition lifecycle: checkout condition recorded, return condition recorded
- Auto-transition equipment to maintenance when returned in NEEDS_REPAIR or OUT_OF_SERVICE condition
- Query equipment availability for a specific category within a date/time range
- Release all equipment assignments when a booking is cancelled

## Dependencies

### Interface Dependencies

| Module | Dependency | Usage |
|--------|-----------|-------|
| Calendar | Booking reference | Equipment assigned to bookings links to calendar booking blocks |
| Facilities | Facility equipment options | Equipment categories can be linked to facilities as available add-ons |
| Services | Equipment requirements | Services can require specific equipment categories |
| Golf | Tee time player assignment | Equipment can be assigned to golf tee-time players (carts, clubs) |
| Members | Member identification | Equipment assignments reference member for checkout/return tracking |
| Billing | Rental fees | Equipment rental fees can be added to member invoices |
| Settings | Operation types | Equipment categories scoped by operation type |

### Settings Dependencies

| Setting | Usage |
|---------|-------|
| Operation types | Which operation types are enabled for equipment scoping |
| Default rental rates | Pre-populates rental rate on new categories |
| Deposit requirements | Whether deposits are required for certain equipment types |
| Maintenance alerts | Configuring when maintenance alerts are triggered |

### Data Dependencies

| Data Source | Query/Mutation | Description |
|-------------|---------------|-------------|
| `equipmentCategories` | GraphQL Query | Fetches categories with count and availability |
| `equipment` | GraphQL Query | Fetches items with category, status, current assignment |
| `equipmentAvailability` | GraphQL Query | Finds available items by category and time range |
| `createEquipmentCategory` | GraphQL Mutation | Creates a new category |
| `updateEquipmentCategory` | GraphQL Mutation | Updates category details |
| `deleteEquipmentCategory` | GraphQL Mutation | Deletes category (blocked if active items exist) |
| `createEquipment` | GraphQL Mutation | Creates a new equipment item |
| `updateEquipment` | GraphQL Mutation | Updates equipment details |
| `updateEquipmentStatus` | GraphQL Mutation | Changes status with event logging |
| `deleteEquipment` | GraphQL Mutation | Deletes item (blocked if assignment history exists) |
| `assignEquipment` | GraphQL Mutation | Assigns to booking or tee-time player |
| `returnEquipment` | GraphQL Mutation | Records return with condition |

## Settings Requirements

| Setting | Type | Default | Configured By | Description |
|---------|------|---------|---------------|-------------|
| `equipment.operationTypes` | `string[]` | `["GOLF","FACILITY","SPA","EVENT"]` | Platform Admin | Available operation types for equipment scoping |
| `equipment.defaultAttachmentType` | `string` | `"OPTIONAL_ADDON"` | Club Admin | Default attachment type for new categories |
| `equipment.requireDeposit` | `boolean` | `false` | Club Admin | Default deposit requirement for new categories |
| `equipment.defaultDepositAmount` | `number` | `0` | Club Admin | Default deposit amount (in club currency) |
| `equipment.conditionOptions` | `string[]` | `["EXCELLENT","GOOD","FAIR","NEEDS_REPAIR","OUT_OF_SERVICE"]` | Platform Admin | Available condition options |
| `equipment.autoMaintenanceOnReturn` | `boolean` | `true` | Club Admin | Auto-set to maintenance when returned in NEEDS_REPAIR/OUT_OF_SERVICE |
| `equipment.maintenanceAlertDays` | `number` | `7` | Club Admin | Days before scheduled maintenance to show alert |
| `equipment.maxRentalDurationHours` | `number` | `24` | Club Admin | Maximum rental duration before auto-alert |
| `equipment.trackSerialNumbers` | `boolean` | `true` | Club Admin | Whether serial number is required for new items |
| `equipment.trackWarranty` | `boolean` | `true` | Club Admin | Whether warranty tracking is enabled |
| `equipment.allowRetiredDeletion` | `boolean` | `false` | Club Admin | Whether retired equipment can be deleted permanently |
| `equipment.releaseOnBookingCancel` | `boolean` | `true` | Club Admin | Auto-release assigned equipment when booking is cancelled |
| `equipment.releaseOnNoShow` | `boolean` | `true` | Club Admin | Auto-release equipment after no-show grace period |
| `equipment.noShowReleaseDelayMinutes` | `number` | `30` | Club Admin | Minutes after no-show to auto-release equipment |

## Data Model

```typescript
// Prisma-aligned model types

interface EquipmentCategory {
  id: string;
  clubId: string;
  code: string;                         // e.g., "GOLF_CART", "TENNIS_RACKET"
  name: string;
  description?: string;
  icon?: string;                        // Lucide icon name
  color?: string;                       // Hex color for UI
  attachmentType: EquipmentAttachmentType;
  operationType: OperationType;
  defaultRentalRate?: number;
  requiresDeposit: boolean;
  depositAmount?: number;
  sortOrder: number;
  isActive: boolean;
  equipment: Equipment[];
  serviceRequirements: ServiceEquipmentRequirement[];
  facilityOptions: FacilityEquipmentOption[];
  createdAt: Date;
  updatedAt: Date;
}

type EquipmentAttachmentType = 'OPTIONAL_ADDON' | 'REQUIRED_RESOURCE';
type OperationType = 'GOLF' | 'FACILITY' | 'SPA' | 'EVENT';

interface Equipment {
  id: string;
  clubId: string;
  categoryId: string;
  assetNumber: string;                  // Unique within club, e.g., "GC-001"
  name: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  condition: EquipmentCondition;
  status: EquipmentStatus;
  location?: string;
  notes?: string;
  lastMaintenanceAt?: Date;
  nextMaintenanceAt?: Date;
  category: EquipmentCategory;
  assignments: EquipmentAssignment[];
  createdAt: Date;
  updatedAt: Date;
}

type EquipmentCondition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_REPAIR' | 'OUT_OF_SERVICE';
type EquipmentStatus = 'AVAILABLE' | 'IN_USE' | 'RESERVED' | 'MAINTENANCE' | 'RETIRED';

interface EquipmentAssignment {
  id: string;
  clubId: string;
  equipmentId: string;
  bookingId?: string;                   // For facility bookings
  teeTimePlayerId?: string;            // For golf bookings
  assignedAt: Date;
  returnedAt?: Date;
  assignedById?: string;               // Staff user who assigned
  rentalFee?: number;
  conditionAtCheckout?: EquipmentCondition;
  conditionAtReturn?: EquipmentCondition;
  notes?: string;
  equipment: Equipment;
  booking?: Booking;
  teeTimePlayer?: TeeTimePlayer;
  assignedBy?: User;
  createdAt: Date;
  updatedAt: Date;
}

interface ServiceEquipmentRequirement {
  id: string;
  serviceId: string;
  equipmentCategoryId: string;
  quantity: number;
  isRequired: boolean;                  // true = auto-reserve, false = optional
  notes?: string;
}

interface FacilityEquipmentOption {
  id: string;
  facilityId: string;
  equipmentCategoryId: string;
  isIncluded: boolean;                  // true = included in booking price
  rentalRate?: number;                  // Override rate
  maxQuantity: number;
}

// Frontend display type (transformed from API)
interface EquipmentDisplayItem {
  id: string;
  name: string;
  code: string;                         // assetNumber
  category: 'cart' | 'bike' | 'sports' | 'fitness' | 'apparel' | 'other';
  categoryId?: string;
  categoryIcon?: string;
  categoryColor?: string;
  status: 'available' | 'in_use' | 'reserved' | 'maintenance';
  condition: 'excellent' | 'good' | 'fair' | 'needs_repair';
  location?: string;
  dailyRate?: number;
  maintenanceNote?: string;
  assignment?: {
    assignmentId: string;
    memberId: string;
    memberName: string;
    memberNumber: string;
    memberPhoto?: string;
    assignedAt: string;
    assignedAtRaw: string;
    expectedReturn?: string;
  };
}
```

## Business Rules

1. **Equipment Is Not a Booking Type**: Equipment is an attachment to existing bookings, not a standalone bookable entity. Equipment is assigned at check-in time, not during booking creation.

2. **Two Attachment Patterns**:
   - `OPTIONAL_ADDON`: Member requests or staff assigns at check-in. Examples: golf clubs, ball machine, tennis rackets.
   - `REQUIRED_RESOURCE`: Service requires it, system auto-reserves. Examples: G5 machine for G5 facial.

3. **Operation Type Scoping**: Equipment categories are filtered by `operationType` at the query level. Golf pages see only `GOLF` equipment. Facility pages see only `FACILITY` equipment. The backend filter is applied in `findAllCategories` and `findAllEquipment`.

4. **Status Transitions**:
   - `AVAILABLE` -> `IN_USE` (via assignment)
   - `AVAILABLE` -> `RESERVED` (via advance reservation)
   - `AVAILABLE` -> `MAINTENANCE` (via manual toggle)
   - `IN_USE` -> `AVAILABLE` (via return with good condition)
   - `IN_USE` -> `MAINTENANCE` (via return with bad condition)
   - `MAINTENANCE` -> `AVAILABLE` (via manual toggle)
   - Any -> `RETIRED` (permanent decommission)

5. **Condition-Based Auto-Maintenance**: When equipment is returned with condition `NEEDS_REPAIR` or `OUT_OF_SERVICE`, the system automatically sets the equipment status to `MAINTENANCE` instead of `AVAILABLE`.

6. **Availability Check**: Available equipment excludes items with status `MAINTENANCE`, `RETIRED`, or `OUT_OF_SERVICE` condition, and items with overlapping assignments for the requested time window.

7. **Assignment Transactional**: Equipment assignment is wrapped in a database transaction that creates the assignment record and updates the equipment status atomically.

8. **Deletion Protection**:
   - Categories with active (non-retired) equipment items cannot be deleted.
   - Equipment items with any assignment history cannot be deleted. They should be set to `RETIRED` instead.

9. **Release on Cancel**: When a booking is cancelled, all equipment assignments for that booking are auto-released via `releaseEquipmentForBooking`, which returns equipment with its checkout condition.

10. **Unique Asset Numbers**: Asset numbers must be unique within a club. The database enforces a unique constraint on `(clubId, assetNumber)`.

11. **Event Logging**: All status changes and assignments are logged to the event store with aggregate type `Equipment` or `EquipmentAssignment`, enabling audit trail queries.

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Required equipment unavailable when booking service | Planned: Block booking and show warning "Required equipment unavailable." Currently not enforced as equipment is assigned at check-in. |
| Equipment assigned to booking, then booking cancelled | `releaseEquipmentForBooking` auto-returns all assigned equipment with original checkout condition. |
| Equipment marked for maintenance while currently assigned | Status update blocked with error "Cannot set to available while equipment is assigned." Equipment must be returned first. |
| Double-assignment attempt (two staff assign same item) | Transactional assignment checks status within the transaction. Second attempt gets `ConflictException: Equipment is not available for assignment`. |
| Delete category with active equipment | Blocked with error showing count of active items. |
| Delete equipment with assignment history | Blocked with error directing staff to set status to RETIRED instead. |
| Equipment returned in OUT_OF_SERVICE condition | Auto-set to MAINTENANCE status. Condition updated to OUT_OF_SERVICE. Requires manual intervention before becoming available again. |
| No-show booking with assigned equipment | Planned: Auto-release after `noShowReleaseDelayMinutes`. Currently requires manual return. |
| Equipment condition degrades from EXCELLENT to NEEDS_REPAIR between checkout and return | Condition at checkout and return are both recorded. Delta is visible in assignment history for damage tracking. |
| Rental fee override at assignment time | Supported. `rentalFee` on assignment can differ from category's `defaultRentalRate`. |
| Equipment with expired warranty | Warranty expiry is informational only. No automatic action. Displayed in equipment detail view. |
| Equipment search with no results | Empty state message: "No equipment found. Try adjusting your filters." |
| Golf page accessing facility equipment | Prevented by `operationType` filter. Golf page passes `operationType="GOLF"` to the hook. |
| Creating equipment without a category | Not possible. `categoryId` is required. Category must exist and be active. |
| Equipment with no location set | Allowed. Location is optional. Cards display without location indicator. |
