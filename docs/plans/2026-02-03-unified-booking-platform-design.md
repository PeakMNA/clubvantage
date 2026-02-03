# Unified Booking Platform Design

> **For Claude:** REQUIRED SUB-SKILLS:
> - Use `superpowers:executing-plans` to implement this plan task-by-task
> - Use `frontend-design` skill for all UI components (distinctive, production-grade interfaces)
> - Follow NestJS best practices for all backend implementation

**Goal:** Enhance the booking platform so any "bookable thing" (facilities, services, equipment, divisible spaces) works with consistent patterns.

**Architecture:** Add equipment management as booking add-ons, implement nested resources for divisible spaces, integrate equipment availability into booking flow.

**Tech Stack:** Prisma, NestJS/GraphQL, React/Next.js, TypeScript

---

## Overview

### What We're Building

| Concept | Examples | How It Works |
|---------|----------|--------------|
| **Facility** | Tennis court, Spa room, Pool | Book a space for a time slot |
| **Service** | Massage, Training session | Book a service (may require facility + staff) |
| **Equipment** | Ball machine, G5 machine, Golf clubs | Attaches to bookings as add-on or required resource |
| **Divisible Space** | Ballroom → Meeting rooms | Nested resources; booking parent blocks children |

### Key Decisions

1. **Equipment is not a booking type** - it's an attachment to existing bookings (like carts attach to tee times)

2. **Two equipment patterns:**
   - *Optional add-on*: Member requests, staff assigns (golf clubs, ball machine)
   - *Required resource*: Service requires it, auto-reserved (G5 machine for G5 facial)

3. **Nested resources for divisible spaces** - `parentResourceId` creates hierarchy; booking parent blocks all descendants

4. **Staff Application only** - Member Portal uses same engine later

5. **Instant confirmation** - No approval workflow for staff bookings

---

## Phase 1: Database Schema

### New Models

#### EquipmentCategory

```prisma
model EquipmentCategory {
  id                String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId            String              @db.Uuid
  code              String              @db.VarChar(50)
  name              String              @db.VarChar(100)
  description       String?
  icon              String?             @db.VarChar(50)
  color             String?             @db.VarChar(20)
  attachmentType    EquipmentAttachmentType @default(OPTIONAL_ADDON)
  defaultRentalRate Decimal?            @db.Decimal(10, 2)
  requiresDeposit   Boolean             @default(false)
  depositAmount     Decimal?            @db.Decimal(10, 2)
  sortOrder         Int                 @default(0)
  isActive          Boolean             @default(true)
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  club              Club                @relation(fields: [clubId], references: [id], onDelete: Cascade)
  equipment         Equipment[]
  serviceRequirements ServiceEquipmentRequirement[]
  facilityOptions   FacilityEquipmentOption[]

  @@unique([clubId, code])
  @@index([clubId])
  @@map("equipment_categories")
}

enum EquipmentAttachmentType {
  OPTIONAL_ADDON
  REQUIRED_RESOURCE
}
```

#### Equipment

```prisma
model Equipment {
  id                String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId            String              @db.Uuid
  categoryId        String              @db.Uuid
  assetNumber       String              @db.VarChar(50)
  name              String              @db.VarChar(100)
  serialNumber      String?             @db.VarChar(100)
  manufacturer      String?             @db.VarChar(100)
  model             String?             @db.VarChar(100)
  purchaseDate      DateTime?
  warrantyExpiry    DateTime?
  condition         EquipmentCondition  @default(GOOD)
  status            EquipmentStatus     @default(AVAILABLE)
  location          String?             @db.VarChar(100)
  notes             String?
  lastMaintenanceAt DateTime?
  nextMaintenanceAt DateTime?
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  club              Club                @relation(fields: [clubId], references: [id], onDelete: Cascade)
  category          EquipmentCategory   @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  assignments       EquipmentAssignment[]

  @@unique([clubId, assetNumber])
  @@index([clubId])
  @@index([categoryId])
  @@index([status])
  @@map("equipment")
}

enum EquipmentCondition {
  EXCELLENT
  GOOD
  FAIR
  NEEDS_REPAIR
  OUT_OF_SERVICE
}

enum EquipmentStatus {
  AVAILABLE
  IN_USE
  RESERVED
  MAINTENANCE
  RETIRED
}
```

#### EquipmentAssignment

```prisma
model EquipmentAssignment {
  id                String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId            String              @db.Uuid
  equipmentId       String              @db.Uuid
  bookingId         String?             @db.Uuid
  teeTimePlayerId   String?             @db.Uuid
  assignedAt        DateTime            @default(now())
  returnedAt        DateTime?
  assignedById      String?             @db.Uuid
  rentalFee         Decimal?            @db.Decimal(10, 2)
  conditionAtCheckout EquipmentCondition?
  conditionAtReturn EquipmentCondition?
  notes             String?
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  club              Club                @relation(fields: [clubId], references: [id], onDelete: Cascade)
  equipment         Equipment           @relation(fields: [equipmentId], references: [id], onDelete: Cascade)
  booking           Booking?            @relation(fields: [bookingId], references: [id], onDelete: SetNull)
  teeTimePlayer     TeeTimePlayer?      @relation(fields: [teeTimePlayerId], references: [id], onDelete: SetNull)
  assignedBy        User?               @relation(fields: [assignedById], references: [id], onDelete: SetNull)

  @@index([clubId])
  @@index([equipmentId])
  @@index([bookingId])
  @@index([teeTimePlayerId])
  @@map("equipment_assignments")
}
```

#### ServiceEquipmentRequirement

```prisma
model ServiceEquipmentRequirement {
  id                String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  serviceId         String              @db.Uuid
  equipmentCategoryId String            @db.Uuid
  quantity          Int                 @default(1)
  isRequired        Boolean             @default(true)
  notes             String?
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  service           Service             @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  equipmentCategory EquipmentCategory   @relation(fields: [equipmentCategoryId], references: [id], onDelete: Cascade)

  @@unique([serviceId, equipmentCategoryId])
  @@map("service_equipment_requirements")
}
```

#### FacilityEquipmentOption

```prisma
model FacilityEquipmentOption {
  id                String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  facilityId        String              @db.Uuid
  equipmentCategoryId String            @db.Uuid
  isIncluded        Boolean             @default(false)
  rentalRate        Decimal?            @db.Decimal(10, 2)
  maxQuantity       Int                 @default(1)
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  facility          Facility            @relation(fields: [facilityId], references: [id], onDelete: Cascade)
  equipmentCategory EquipmentCategory   @relation(fields: [equipmentCategoryId], references: [id], onDelete: Cascade)

  @@unique([facilityId, equipmentCategoryId])
  @@map("facility_equipment_options")
}
```

### Resource Model Enhancement

```prisma
model Resource {
  // ... existing fields ...

  parentResourceId  String?             @db.Uuid  // NEW: self-reference for nesting
  isBookable        Boolean             @default(true)  // NEW: false for container-only
  configuration     Json?               // NEW: room setup details

  parent            Resource?           @relation("ResourceHierarchy", fields: [parentResourceId], references: [id])
  children          Resource[]          @relation("ResourceHierarchy")

  @@index([parentResourceId])
}
```

### Booking Model Enhancement

```prisma
model Booking {
  // ... existing fields ...

  equipmentAssignments EquipmentAssignment[]  // NEW: linked equipment
}
```

---

## Phase 2: Backend Services (NestJS Best Practices)

### Module Structure

```
apps/api/src/
├── modules/
│   └── equipment/
│       ├── equipment.module.ts
│       ├── equipment.service.ts
│       ├── equipment-category.service.ts
│       ├── equipment-assignment.service.ts
│       ├── equipment-availability.service.ts
│       └── dto/
│           ├── create-equipment-category.dto.ts
│           ├── create-equipment.dto.ts
│           ├── assign-equipment.dto.ts
│           └── return-equipment.dto.ts
├── graphql/
│   └── equipment/
│       ├── equipment.module.ts
│       ├── equipment.resolver.ts
│       ├── equipment.types.ts
│       └── equipment.inputs.ts
```

### NestJS Best Practices to Follow

1. **Dependency Injection** - All services injectable, use constructor injection
2. **DTOs with class-validator** - Validate all inputs with decorators
3. **Repository Pattern** - PrismaService wrapped in domain-specific methods
4. **Error Handling** - Custom exceptions extending HttpException
5. **Guards** - ClubGuard for tenant isolation on all equipment endpoints
6. **Interceptors** - Logging, transformation, cache
7. **Event-driven** - EventEmitter for cross-module communication (equipment assigned → update booking)

### Equipment Service

```typescript
@Injectable()
export class EquipmentService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async findAvailable(
    clubId: string,
    categoryId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<Equipment[]> {
    // Find equipment not assigned during time window
    // Exclude MAINTENANCE, RETIRED, OUT_OF_SERVICE
  }

  async assignToBooking(dto: AssignEquipmentDto): Promise<EquipmentAssignment> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verify equipment available
      // 2. Create assignment
      // 3. Update equipment status to IN_USE
      // 4. Emit event for booking update
    });
  }

  async returnEquipment(assignmentId: string, condition: EquipmentCondition): Promise<EquipmentAssignment> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Update assignment with returnedAt, condition
      // 2. Update equipment status to AVAILABLE (or NEEDS_REPAIR)
      // 3. Emit event
    });
  }
}
```

### Nested Resource Availability Service

```typescript
@Injectable()
export class ResourceAvailabilityService {
  async checkAvailability(
    resourceId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<{ available: boolean; conflicts: Booking[] }> {
    // 1. Get resource with ancestors and descendants
    // 2. Check bookings on self
    // 3. Check bookings on all ancestors (parent booked = blocked)
    // 4. Check bookings on all descendants (child booked = blocked)
    // 5. Return availability with conflict details
  }

  private async getAncestors(resourceId: string): Promise<Resource[]> {
    // Recursive CTE query for parent chain
  }

  private async getDescendants(resourceId: string): Promise<Resource[]> {
    // Recursive CTE query for all children
  }
}
```

---

## Phase 3: GraphQL API

### Types

```graphql
enum EquipmentAttachmentType {
  OPTIONAL_ADDON
  REQUIRED_RESOURCE
}

enum EquipmentCondition {
  EXCELLENT
  GOOD
  FAIR
  NEEDS_REPAIR
  OUT_OF_SERVICE
}

enum EquipmentStatus {
  AVAILABLE
  IN_USE
  RESERVED
  MAINTENANCE
  RETIRED
}

type EquipmentCategory {
  id: ID!
  code: String!
  name: String!
  description: String
  icon: String
  color: String
  attachmentType: EquipmentAttachmentType!
  defaultRentalRate: Float
  requiresDeposit: Boolean!
  depositAmount: Float
  isActive: Boolean!
  equipment: [Equipment!]!
  availableCount: Int!
}

type Equipment {
  id: ID!
  assetNumber: String!
  name: String!
  category: EquipmentCategory!
  serialNumber: String
  manufacturer: String
  model: String
  condition: EquipmentCondition!
  status: EquipmentStatus!
  location: String
  currentAssignment: EquipmentAssignment
}

type EquipmentAssignment {
  id: ID!
  equipment: Equipment!
  booking: Booking
  teeTimePlayer: TeeTimePlayer
  assignedAt: DateTime!
  returnedAt: DateTime
  assignedBy: User
  rentalFee: Float
  conditionAtCheckout: EquipmentCondition
  conditionAtReturn: EquipmentCondition
}

type Resource {
  id: ID!
  name: String!
  code: String!
  parent: Resource
  children: [Resource!]!
  isBookable: Boolean!
  capacity: Int
  # ... existing fields
}
```

### Queries

```graphql
type Query {
  # Equipment
  equipmentCategories(clubId: ID!): [EquipmentCategory!]!
  equipmentCategory(id: ID!): EquipmentCategory
  equipment(clubId: ID!, categoryId: ID, status: EquipmentStatus): [Equipment!]!
  equipmentItem(id: ID!): Equipment
  equipmentAvailability(
    categoryId: ID!
    startTime: DateTime!
    endTime: DateTime!
  ): [Equipment!]!

  # Nested Resources
  resourceTree(facilityId: ID!): [Resource!]!
  resourceAvailability(
    resourceId: ID!
    startTime: DateTime!
    endTime: DateTime!
  ): ResourceAvailabilityResult!
}
```

### Mutations

```graphql
type Mutation {
  # Equipment Category CRUD
  createEquipmentCategory(input: CreateEquipmentCategoryInput!): EquipmentCategory!
  updateEquipmentCategory(id: ID!, input: UpdateEquipmentCategoryInput!): EquipmentCategory!
  deleteEquipmentCategory(id: ID!): DeleteResponse!

  # Equipment CRUD
  createEquipment(input: CreateEquipmentInput!): Equipment!
  updateEquipment(id: ID!, input: UpdateEquipmentInput!): Equipment!
  updateEquipmentStatus(id: ID!, status: EquipmentStatus!): Equipment!
  deleteEquipment(id: ID!): DeleteResponse!

  # Equipment Assignment
  assignEquipment(input: AssignEquipmentInput!): EquipmentAssignment!
  returnEquipment(assignmentId: ID!, condition: EquipmentCondition!, notes: String): EquipmentAssignment!

  # Nested Resources
  createResource(input: CreateResourceInput!): Resource!
  updateResource(id: ID!, input: UpdateResourceInput!): Resource!
  moveResource(id: ID!, newParentId: ID): Resource!
  deleteResource(id: ID!): DeleteResponse!
}
```

---

## Phase 4: Frontend Components

> **Use `frontend-design` skill for all UI components**

### Equipment Tab (New)

Location: `/apps/application/src/components/bookings/equipment/`

#### Components to Build

1. **equipment-tab.tsx** - Main tab with sub-navigation
2. **equipment-categories-list.tsx** - Category management table
3. **equipment-category-modal.tsx** - Create/edit category form
4. **equipment-inventory-table.tsx** - Equipment units table with filters
5. **equipment-modal.tsx** - Create/edit equipment unit form
6. **equipment-status-badge.tsx** - Status indicator (Available, In Use, etc.)
7. **equipment-condition-badge.tsx** - Condition indicator
8. **equipment-assignment-history.tsx** - Assignment audit trail
9. **equipment-quick-assign.tsx** - Dropdown for assigning to booking

#### Design Requirements

- Follow ClubVantage design system (Amber primary, Emerald secondary, Stone neutral)
- Status badges consistent with existing booking status badges
- Table patterns match existing facilities/services tabs
- Modal patterns match existing facility-modal.tsx

### Facilities Tab Enhancement

1. **resource-tree-view.tsx** - Collapsible tree for nested resources
2. **resource-tree-node.tsx** - Individual node with expand/collapse, actions
3. **add-child-resource-button.tsx** - Inline action to add child
4. **resource-conflict-indicator.tsx** - Shows when parent/child has booking

### Booking Detail Enhancement

1. **equipment-assignment-panel.tsx** - Show/manage assigned equipment
2. **equipment-assign-dropdown.tsx** - Quick-assign from available pool
3. **equipment-return-modal.tsx** - Return with condition selection

### Service Modal Enhancement

1. **service-equipment-requirements.tsx** - Configure required equipment
2. **equipment-category-select.tsx** - Dropdown with category + quantity

---

## Phase 5: Edge Cases & Business Rules

### Equipment Conflicts

| Scenario | Behavior |
|----------|----------|
| Required equipment unavailable | Block booking OR show warning |
| Equipment assigned, booking cancelled | Auto-release equipment |
| Equipment marked for maintenance | Exclude from availability |
| Double-assignment attempt | Reject with error |

### Nested Resource Conflicts

| Scenario | Behavior |
|----------|----------|
| Book Grand Ballroom 2-6pm | Block all children 2-6pm |
| Book Meeting Room 1 at 3pm | Block all ancestors at 3pm |
| Book East Wing when child booked | Reject - child has booking |
| Delete parent resource | Reject if has children |

### Equipment Return Tracking

| Scenario | Behavior |
|----------|----------|
| Check-in booking | Prompt to confirm equipment |
| Complete booking | Prompt to return equipment |
| No-show booking | Auto-release after grace period |

---

## Implementation Order

### Phase 1: Database (Tasks 1-3)
1. Add equipment models to schema
2. Add nested resource fields
3. Run migrations

### Phase 2: Backend Services (Tasks 4-8)
4. Create EquipmentModule with services
5. Create EquipmentGraphqlModule with resolvers
6. Enhance ResourceAvailabilityService for nesting
7. Integrate equipment into booking creation
8. Add equipment assignment/return mutations

### Phase 3: Frontend - Equipment Tab (Tasks 9-13)
9. Create equipment-tab with sub-navigation
10. Build equipment categories list + modal
11. Build equipment inventory table + modal
12. Add status/condition badges
13. Build assignment history component

### Phase 4: Frontend - Integration (Tasks 14-18)
14. Build resource tree view for facilities tab
15. Add equipment requirements to service modal
16. Build equipment assignment panel for bookings
17. Add equipment availability to calendar slots
18. Build equipment return modal

### Phase 5: Testing & Polish (Tasks 19-20)
19. E2E tests for equipment workflow
20. E2E tests for nested resource booking

---

## Verification Checklist

- [ ] Equipment categories CRUD works
- [ ] Equipment inventory CRUD works
- [ ] Equipment status transitions work
- [ ] Equipment assignment to booking works
- [ ] Equipment return with condition works
- [ ] Nested resources display in tree
- [ ] Booking parent blocks children
- [ ] Booking child blocks parent
- [ ] Service with required equipment checks availability
- [ ] Calendar shows equipment availability
- [ ] Assignment auto-releases on booking cancel
