# Unified Booking Platform Implementation Plan

> **For Claude:** REQUIRED SUB-SKILLS:
> - Use `superpowers:executing-plans` to implement this plan task-by-task
> - Use `frontend-design` skill for all new UI components
> - Follow NestJS best practices for all backend code

**Goal:** Implement equipment management and nested resources for the unified booking platform, enabling equipment add-ons and divisible space configurations.

**Architecture:** Add Prisma models for equipment tracking, create NestJS modules following existing patterns, build React components matching the ClubVantage design system.

**Tech Stack:** Prisma 7.x, NestJS, GraphQL (code-first), React, Next.js, TypeScript, TailwindCSS

---

## Phase 1: Database Schema

### Task 1: Add Equipment Enums to Prisma Schema

**Files:**
- Modify: `database/prisma/schema.prisma`

**Step 1: Add enums after existing enums (around line 1500)**

Add these enums to the schema:

```prisma
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
```

**Step 2: Verify schema is valid**

Run: `cd database && npx prisma validate`
Expected: "The schema is valid!"

**Step 3: Commit**

```bash
git add database/prisma/schema.prisma
git commit -m "feat(schema): add equipment enums"
```

---

### Task 2: Add EquipmentCategory Model

**Files:**
- Modify: `database/prisma/schema.prisma`

**Step 1: Add EquipmentCategory model after the enums**

```prisma
/// Equipment category for grouping similar equipment types
model EquipmentCategory {
  id                String                  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId            String                  @db.Uuid
  code              String                  @db.VarChar(50)
  name              String                  @db.VarChar(100)
  description       String?
  icon              String?                 @db.VarChar(50)
  color             String?                 @db.VarChar(20)
  attachmentType    EquipmentAttachmentType @default(OPTIONAL_ADDON)
  defaultRentalRate Decimal?                @db.Decimal(10, 2)
  requiresDeposit   Boolean                 @default(false)
  depositAmount     Decimal?                @db.Decimal(10, 2)
  sortOrder         Int                     @default(0)
  isActive          Boolean                 @default(true)
  createdAt         DateTime                @default(now())
  updatedAt         DateTime                @updatedAt

  club                Club                          @relation(fields: [clubId], references: [id], onDelete: Cascade)
  equipment           Equipment[]
  serviceRequirements ServiceEquipmentRequirement[]
  facilityOptions     FacilityEquipmentOption[]

  @@unique([clubId, code])
  @@index([clubId])
  @@map("equipment_categories")
}
```

**Step 2: Add relation to Club model**

Find the Club model and add to its relations list:
```prisma
  equipmentCategories  EquipmentCategory[]
```

**Step 3: Verify schema**

Run: `cd database && npx prisma validate`
Expected: "The schema is valid!"

**Step 4: Commit**

```bash
git add database/prisma/schema.prisma
git commit -m "feat(schema): add EquipmentCategory model"
```

---

### Task 3: Add Equipment Model

**Files:**
- Modify: `database/prisma/schema.prisma`

**Step 1: Add Equipment model after EquipmentCategory**

```prisma
/// Individual equipment item that can be assigned to bookings
model Equipment {
  id                String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId            String             @db.Uuid
  categoryId        String             @db.Uuid
  assetNumber       String             @db.VarChar(50)
  name              String             @db.VarChar(100)
  serialNumber      String?            @db.VarChar(100)
  manufacturer      String?            @db.VarChar(100)
  model             String?            @db.VarChar(100)
  purchaseDate      DateTime?
  warrantyExpiry    DateTime?
  condition         EquipmentCondition @default(GOOD)
  status            EquipmentStatus    @default(AVAILABLE)
  location          String?            @db.VarChar(100)
  notes             String?
  lastMaintenanceAt DateTime?
  nextMaintenanceAt DateTime?
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  club        Club                  @relation(fields: [clubId], references: [id], onDelete: Cascade)
  category    EquipmentCategory     @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  assignments EquipmentAssignment[]

  @@unique([clubId, assetNumber])
  @@index([clubId])
  @@index([categoryId])
  @@index([status])
  @@map("equipment")
}
```

**Step 2: Add relation to Club model**

Add to Club relations:
```prisma
  equipment            Equipment[]
```

**Step 3: Verify and commit**

Run: `cd database && npx prisma validate`

```bash
git add database/prisma/schema.prisma
git commit -m "feat(schema): add Equipment model"
```

---

### Task 4: Add EquipmentAssignment Model

**Files:**
- Modify: `database/prisma/schema.prisma`

**Step 1: Add EquipmentAssignment model**

```prisma
/// Tracks equipment assigned to bookings or tee time players
model EquipmentAssignment {
  id                  String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId              String              @db.Uuid
  equipmentId         String              @db.Uuid
  bookingId           String?             @db.Uuid
  teeTimePlayerId     String?             @db.Uuid
  assignedAt          DateTime            @default(now())
  returnedAt          DateTime?
  assignedById        String?             @db.Uuid
  rentalFee           Decimal?            @db.Decimal(10, 2)
  conditionAtCheckout EquipmentCondition?
  conditionAtReturn   EquipmentCondition?
  notes               String?
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  club          Club           @relation(fields: [clubId], references: [id], onDelete: Cascade)
  equipment     Equipment      @relation(fields: [equipmentId], references: [id], onDelete: Cascade)
  booking       Booking?       @relation(fields: [bookingId], references: [id], onDelete: SetNull)
  teeTimePlayer TeeTimePlayer? @relation(fields: [teeTimePlayerId], references: [id], onDelete: SetNull)
  assignedBy    User?          @relation(fields: [assignedById], references: [id], onDelete: SetNull)

  @@index([clubId])
  @@index([equipmentId])
  @@index([bookingId])
  @@index([teeTimePlayerId])
  @@map("equipment_assignments")
}
```

**Step 2: Add relations to Club, Booking, TeeTimePlayer, and User models**

Add to Club:
```prisma
  equipmentAssignments EquipmentAssignment[]
```

Add to Booking model:
```prisma
  equipmentAssignments EquipmentAssignment[]
```

Add to TeeTimePlayer model:
```prisma
  equipmentAssignments EquipmentAssignment[]
```

Add to User model (for assignedBy relation):
```prisma
  equipmentAssignments EquipmentAssignment[]
```

**Step 3: Verify and commit**

Run: `cd database && npx prisma validate`

```bash
git add database/prisma/schema.prisma
git commit -m "feat(schema): add EquipmentAssignment model"
```

---

### Task 5: Add Service and Facility Equipment Linking Models

**Files:**
- Modify: `database/prisma/schema.prisma`

**Step 1: Add ServiceEquipmentRequirement model**

```prisma
/// Links equipment categories to services as required or suggested
model ServiceEquipmentRequirement {
  id                  String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  serviceId           String            @db.Uuid
  equipmentCategoryId String            @db.Uuid
  quantity            Int               @default(1)
  isRequired          Boolean           @default(true)
  notes               String?
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt

  service           Service           @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  equipmentCategory EquipmentCategory @relation(fields: [equipmentCategoryId], references: [id], onDelete: Cascade)

  @@unique([serviceId, equipmentCategoryId])
  @@map("service_equipment_requirements")
}
```

**Step 2: Add FacilityEquipmentOption model**

```prisma
/// Links equipment categories to facilities as optional rentals
model FacilityEquipmentOption {
  id                  String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  facilityId          String            @db.Uuid
  equipmentCategoryId String            @db.Uuid
  isIncluded          Boolean           @default(false)
  rentalRate          Decimal?          @db.Decimal(10, 2)
  maxQuantity         Int               @default(1)
  createdAt           DateTime          @default(now())
  updatedAt           DateTime          @updatedAt

  facility          Facility          @relation(fields: [facilityId], references: [id], onDelete: Cascade)
  equipmentCategory EquipmentCategory @relation(fields: [equipmentCategoryId], references: [id], onDelete: Cascade)

  @@unique([facilityId, equipmentCategoryId])
  @@map("facility_equipment_options")
}
```

**Step 3: Add relations to Service and Facility models**

Add to Service model:
```prisma
  equipmentRequirements ServiceEquipmentRequirement[]
```

Add to Facility model:
```prisma
  equipmentOptions FacilityEquipmentOption[]
```

**Step 4: Verify and commit**

Run: `cd database && npx prisma validate`

```bash
git add database/prisma/schema.prisma
git commit -m "feat(schema): add ServiceEquipmentRequirement and FacilityEquipmentOption models"
```

---

### Task 6: Add Nested Resource Fields to Resource Model

**Files:**
- Modify: `database/prisma/schema.prisma`

**Step 1: Find the Resource model and add new fields**

Add these fields to the existing Resource model:

```prisma
  parentResourceId  String?   @db.Uuid
  isBookable        Boolean   @default(true)
  configuration     Json?

  parent   Resource?  @relation("ResourceHierarchy", fields: [parentResourceId], references: [id])
  children Resource[] @relation("ResourceHierarchy")
```

**Step 2: Add index for parentResourceId**

Add to the Resource model's indexes:
```prisma
  @@index([parentResourceId])
```

**Step 3: Verify and commit**

Run: `cd database && npx prisma validate`

```bash
git add database/prisma/schema.prisma
git commit -m "feat(schema): add nested resource support with parentResourceId"
```

---

### Task 7: Run Prisma Migration

**Files:**
- Creates: `database/prisma/migrations/[timestamp]_add_equipment_and_nested_resources/migration.sql`

**Step 1: Generate and apply migration**

Run:
```bash
cd database && npx prisma migrate dev --name add_equipment_and_nested_resources
```

Expected: Migration created and applied successfully.

**Step 2: Generate Prisma client**

Run:
```bash
npx prisma generate
```

**Step 3: Commit migration**

```bash
git add database/prisma/migrations
git commit -m "feat(db): add equipment and nested resources migration"
```

---

## Phase 2: Backend Services (NestJS)

### Task 8: Create Equipment Module Structure

**Files:**
- Create: `apps/api/src/modules/equipment/equipment.module.ts`
- Create: `apps/api/src/modules/equipment/equipment.service.ts`
- Create: `apps/api/src/modules/equipment/dto/create-equipment-category.dto.ts`
- Create: `apps/api/src/modules/equipment/dto/create-equipment.dto.ts`
- Create: `apps/api/src/modules/equipment/dto/assign-equipment.dto.ts`

**Step 1: Create the module file**

Create `apps/api/src/modules/equipment/equipment.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { EquipmentService } from './equipment.service';

@Module({
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule {}
```

**Step 2: Create DTOs**

Create `apps/api/src/modules/equipment/dto/create-equipment-category.dto.ts`:

```typescript
import { EquipmentAttachmentType } from '@prisma/client';

export class CreateEquipmentCategoryDto {
  code: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  attachmentType?: EquipmentAttachmentType;
  defaultRentalRate?: number;
  requiresDeposit?: boolean;
  depositAmount?: number;
}

export class UpdateEquipmentCategoryDto {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  attachmentType?: EquipmentAttachmentType;
  defaultRentalRate?: number;
  requiresDeposit?: boolean;
  depositAmount?: number;
  isActive?: boolean;
  sortOrder?: number;
}
```

Create `apps/api/src/modules/equipment/dto/create-equipment.dto.ts`:

```typescript
import { EquipmentCondition, EquipmentStatus } from '@prisma/client';

export class CreateEquipmentDto {
  categoryId: string;
  assetNumber: string;
  name: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  condition?: EquipmentCondition;
  location?: string;
  notes?: string;
}

export class UpdateEquipmentDto {
  name?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  condition?: EquipmentCondition;
  status?: EquipmentStatus;
  location?: string;
  notes?: string;
  lastMaintenanceAt?: Date;
  nextMaintenanceAt?: Date;
}
```

Create `apps/api/src/modules/equipment/dto/assign-equipment.dto.ts`:

```typescript
import { EquipmentCondition } from '@prisma/client';

export class AssignEquipmentDto {
  equipmentId: string;
  bookingId?: string;
  teeTimePlayerId?: string;
  rentalFee?: number;
  conditionAtCheckout?: EquipmentCondition;
  notes?: string;
}

export class ReturnEquipmentDto {
  conditionAtReturn: EquipmentCondition;
  notes?: string;
}
```

**Step 3: Commit**

```bash
git add apps/api/src/modules/equipment
git commit -m "feat(api): create equipment module structure with DTOs"
```

---

### Task 9: Implement EquipmentService

**Files:**
- Create: `apps/api/src/modules/equipment/equipment.service.ts`

**Step 1: Create the service**

```typescript
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { EventStoreService } from '@/shared/events/event-store.service';
import { EquipmentStatus, EquipmentCondition } from '@prisma/client';
import {
  CreateEquipmentCategoryDto,
  UpdateEquipmentCategoryDto,
} from './dto/create-equipment-category.dto';
import {
  CreateEquipmentDto,
  UpdateEquipmentDto,
} from './dto/create-equipment.dto';
import { AssignEquipmentDto, ReturnEquipmentDto } from './dto/assign-equipment.dto';

@Injectable()
export class EquipmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventStore: EventStoreService,
  ) {}

  // ============================================================================
  // Category Operations
  // ============================================================================

  async findAllCategories(clubId: string) {
    return this.prisma.equipmentCategory.findMany({
      where: { clubId },
      include: {
        _count: { select: { equipment: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findCategoryById(clubId: string, id: string) {
    const category = await this.prisma.equipmentCategory.findFirst({
      where: { id, clubId },
      include: { equipment: true },
    });

    if (!category) {
      throw new NotFoundException('Equipment category not found');
    }

    return category;
  }

  async createCategory(clubId: string, dto: CreateEquipmentCategoryDto) {
    return this.prisma.equipmentCategory.create({
      data: {
        clubId,
        ...dto,
      },
    });
  }

  async updateCategory(clubId: string, id: string, dto: UpdateEquipmentCategoryDto) {
    await this.findCategoryById(clubId, id);

    return this.prisma.equipmentCategory.update({
      where: { id },
      data: dto,
    });
  }

  async deleteCategory(clubId: string, id: string) {
    const category = await this.findCategoryById(clubId, id);

    // Check for active equipment
    const activeEquipment = await this.prisma.equipment.count({
      where: {
        categoryId: id,
        status: { not: EquipmentStatus.RETIRED },
      },
    });

    if (activeEquipment > 0) {
      throw new BadRequestException(
        `Cannot delete category with ${activeEquipment} active equipment items`,
      );
    }

    await this.prisma.equipmentCategory.delete({ where: { id } });
    return { success: true, message: 'Category deleted' };
  }

  // ============================================================================
  // Equipment Operations
  // ============================================================================

  async findAllEquipment(
    clubId: string,
    filters?: {
      categoryId?: string;
      status?: EquipmentStatus;
      condition?: EquipmentCondition;
    },
  ) {
    const where: any = { clubId };

    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.status) where.status = filters.status;
    if (filters?.condition) where.condition = filters.condition;

    return this.prisma.equipment.findMany({
      where,
      include: {
        category: true,
        assignments: {
          where: { returnedAt: null },
          include: {
            booking: { include: { member: true } },
            teeTimePlayer: { include: { member: true } },
          },
          take: 1,
        },
      },
      orderBy: [{ category: { sortOrder: 'asc' } }, { assetNumber: 'asc' }],
    });
  }

  async findEquipmentById(clubId: string, id: string) {
    const equipment = await this.prisma.equipment.findFirst({
      where: { id, clubId },
      include: {
        category: true,
        assignments: {
          orderBy: { assignedAt: 'desc' },
          take: 10,
          include: {
            booking: { include: { member: true } },
            teeTimePlayer: { include: { member: true } },
            assignedBy: true,
          },
        },
      },
    });

    if (!equipment) {
      throw new NotFoundException('Equipment not found');
    }

    return equipment;
  }

  async createEquipment(clubId: string, dto: CreateEquipmentDto) {
    // Verify category exists
    await this.findCategoryById(clubId, dto.categoryId);

    return this.prisma.equipment.create({
      data: {
        clubId,
        ...dto,
      },
      include: { category: true },
    });
  }

  async updateEquipment(clubId: string, id: string, dto: UpdateEquipmentDto) {
    await this.findEquipmentById(clubId, id);

    return this.prisma.equipment.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async updateEquipmentStatus(
    clubId: string,
    id: string,
    status: EquipmentStatus,
    userId: string,
    userEmail: string,
  ) {
    const equipment = await this.findEquipmentById(clubId, id);

    // If setting to AVAILABLE, check for active assignments
    if (status === EquipmentStatus.AVAILABLE) {
      const activeAssignment = await this.prisma.equipmentAssignment.findFirst({
        where: { equipmentId: id, returnedAt: null },
      });

      if (activeAssignment) {
        throw new BadRequestException(
          'Cannot set to available while equipment is assigned',
        );
      }
    }

    const updated = await this.prisma.equipment.update({
      where: { id },
      data: { status },
      include: { category: true },
    });

    await this.eventStore.append({
      tenantId: clubId,
      aggregateType: 'Equipment',
      aggregateId: id,
      type: 'STATUS_CHANGED',
      data: { oldStatus: equipment.status, newStatus: status },
      userId,
      userEmail,
    });

    return updated;
  }

  async deleteEquipment(clubId: string, id: string) {
    await this.findEquipmentById(clubId, id);

    // Check for assignments
    const assignments = await this.prisma.equipmentAssignment.count({
      where: { equipmentId: id },
    });

    if (assignments > 0) {
      throw new BadRequestException(
        'Cannot delete equipment with assignment history. Set to RETIRED instead.',
      );
    }

    await this.prisma.equipment.delete({ where: { id } });
    return { success: true, message: 'Equipment deleted' };
  }

  // ============================================================================
  // Availability Operations
  // ============================================================================

  async findAvailable(
    clubId: string,
    categoryId: string,
    startTime: Date,
    endTime: Date,
  ) {
    // Get all equipment in category that's not retired/maintenance
    const available = await this.prisma.equipment.findMany({
      where: {
        clubId,
        categoryId,
        status: { in: [EquipmentStatus.AVAILABLE, EquipmentStatus.RESERVED] },
        condition: { not: EquipmentCondition.OUT_OF_SERVICE },
      },
      include: { category: true },
    });

    // Filter out equipment with overlapping assignments
    const assignedIds = await this.prisma.equipmentAssignment.findMany({
      where: {
        equipmentId: { in: available.map((e) => e.id) },
        returnedAt: null,
        OR: [
          {
            booking: {
              startTime: { lt: endTime },
              endTime: { gt: startTime },
              status: { not: 'CANCELLED' },
            },
          },
          {
            teeTimePlayer: {
              teeTime: {
                teeDate: {
                  gte: new Date(startTime.toDateString()),
                  lte: new Date(endTime.toDateString()),
                },
              },
            },
          },
        ],
      },
      select: { equipmentId: true },
    });

    const assignedSet = new Set(assignedIds.map((a) => a.equipmentId));

    return available.filter((e) => !assignedSet.has(e.id));
  }

  // ============================================================================
  // Assignment Operations
  // ============================================================================

  async assignEquipment(
    clubId: string,
    dto: AssignEquipmentDto,
    userId: string,
    userEmail: string,
  ) {
    const equipment = await this.findEquipmentById(clubId, dto.equipmentId);

    // Verify equipment is available
    if (equipment.status !== EquipmentStatus.AVAILABLE) {
      throw new ConflictException('Equipment is not available for assignment');
    }

    // Verify either bookingId or teeTimePlayerId is provided
    if (!dto.bookingId && !dto.teeTimePlayerId) {
      throw new BadRequestException(
        'Either bookingId or teeTimePlayerId must be provided',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Create assignment
      const assignment = await tx.equipmentAssignment.create({
        data: {
          clubId,
          equipmentId: dto.equipmentId,
          bookingId: dto.bookingId,
          teeTimePlayerId: dto.teeTimePlayerId,
          assignedById: userId,
          rentalFee: dto.rentalFee,
          conditionAtCheckout: dto.conditionAtCheckout || equipment.condition,
          notes: dto.notes,
        },
        include: {
          equipment: { include: { category: true } },
          booking: { include: { member: true } },
          teeTimePlayer: { include: { member: true } },
        },
      });

      // Update equipment status
      await tx.equipment.update({
        where: { id: dto.equipmentId },
        data: { status: EquipmentStatus.IN_USE },
      });

      // Log event
      await this.eventStore.append({
        tenantId: clubId,
        aggregateType: 'EquipmentAssignment',
        aggregateId: assignment.id,
        type: 'ASSIGNED',
        data: {
          equipmentId: dto.equipmentId,
          bookingId: dto.bookingId,
          teeTimePlayerId: dto.teeTimePlayerId,
        },
        userId,
        userEmail,
      });

      return assignment;
    });
  }

  async returnEquipment(
    clubId: string,
    assignmentId: string,
    dto: ReturnEquipmentDto,
    userId: string,
    userEmail: string,
  ) {
    const assignment = await this.prisma.equipmentAssignment.findFirst({
      where: { id: assignmentId, clubId },
      include: { equipment: true },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment not found');
    }

    if (assignment.returnedAt) {
      throw new BadRequestException('Equipment already returned');
    }

    return this.prisma.$transaction(async (tx) => {
      // Update assignment
      const updated = await tx.equipmentAssignment.update({
        where: { id: assignmentId },
        data: {
          returnedAt: new Date(),
          conditionAtReturn: dto.conditionAtReturn,
          notes: dto.notes ? `${assignment.notes || ''}\n${dto.notes}` : assignment.notes,
        },
        include: {
          equipment: { include: { category: true } },
          booking: { include: { member: true } },
          teeTimePlayer: { include: { member: true } },
        },
      });

      // Update equipment status and condition
      const newStatus =
        dto.conditionAtReturn === EquipmentCondition.NEEDS_REPAIR ||
        dto.conditionAtReturn === EquipmentCondition.OUT_OF_SERVICE
          ? EquipmentStatus.MAINTENANCE
          : EquipmentStatus.AVAILABLE;

      await tx.equipment.update({
        where: { id: assignment.equipmentId },
        data: {
          status: newStatus,
          condition: dto.conditionAtReturn,
        },
      });

      // Log event
      await this.eventStore.append({
        tenantId: clubId,
        aggregateType: 'EquipmentAssignment',
        aggregateId: assignmentId,
        type: 'RETURNED',
        data: {
          conditionAtReturn: dto.conditionAtReturn,
          newEquipmentStatus: newStatus,
        },
        userId,
        userEmail,
      });

      return updated;
    });
  }

  async releaseEquipmentForBooking(
    clubId: string,
    bookingId: string,
    userId: string,
    userEmail: string,
  ) {
    // Find all active assignments for this booking
    const assignments = await this.prisma.equipmentAssignment.findMany({
      where: { clubId, bookingId, returnedAt: null },
    });

    for (const assignment of assignments) {
      await this.returnEquipment(
        clubId,
        assignment.id,
        { conditionAtReturn: assignment.conditionAtCheckout || EquipmentCondition.GOOD },
        userId,
        userEmail,
      );
    }

    return { success: true, releasedCount: assignments.length };
  }
}
```

**Step 2: Update module to include dependencies**

Update `apps/api/src/modules/equipment/equipment.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { SharedModule } from '@/shared/shared.module';

@Module({
  imports: [SharedModule],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule {}
```

**Step 3: Commit**

```bash
git add apps/api/src/modules/equipment
git commit -m "feat(api): implement EquipmentService with CRUD and assignment operations"
```

---

### Task 10: Create Equipment GraphQL Types

**Files:**
- Create: `apps/api/src/graphql/equipment/equipment.types.ts`

**Step 1: Create GraphQL types file**

```typescript
import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import {
  EquipmentAttachmentType,
  EquipmentCondition,
  EquipmentStatus,
} from '@prisma/client';

// Register enums
registerEnumType(EquipmentAttachmentType, {
  name: 'EquipmentAttachmentType',
  description: 'Type of equipment attachment to bookings',
});

registerEnumType(EquipmentCondition, {
  name: 'EquipmentCondition',
  description: 'Physical condition of equipment',
});

registerEnumType(EquipmentStatus, {
  name: 'EquipmentStatus',
  description: 'Availability status of equipment',
});

@ObjectType('EquipmentCategory')
export class EquipmentCategoryType {
  @Field(() => ID)
  id: string;

  @Field()
  code: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  color?: string;

  @Field(() => EquipmentAttachmentType)
  attachmentType: EquipmentAttachmentType;

  @Field(() => Float, { nullable: true })
  defaultRentalRate?: number;

  @Field()
  requiresDeposit: boolean;

  @Field(() => Float, { nullable: true })
  depositAmount?: number;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  isActive: boolean;

  @Field(() => Int)
  equipmentCount: number;

  @Field(() => Int)
  availableCount: number;
}

@ObjectType('Equipment')
export class EquipmentType {
  @Field(() => ID)
  id: string;

  @Field()
  assetNumber: string;

  @Field()
  name: string;

  @Field(() => EquipmentCategoryType)
  category: EquipmentCategoryType;

  @Field({ nullable: true })
  serialNumber?: string;

  @Field({ nullable: true })
  manufacturer?: string;

  @Field({ nullable: true })
  model?: string;

  @Field(() => EquipmentCondition)
  condition: EquipmentCondition;

  @Field(() => EquipmentStatus)
  status: EquipmentStatus;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => EquipmentAssignmentType, { nullable: true })
  currentAssignment?: EquipmentAssignmentType;
}

@ObjectType('EquipmentAssignmentMember')
export class EquipmentAssignmentMemberType {
  @Field(() => ID)
  id: string;

  @Field()
  memberId: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  avatarUrl?: string;
}

@ObjectType('EquipmentAssignment')
export class EquipmentAssignmentType {
  @Field(() => ID)
  id: string;

  @Field(() => EquipmentType)
  equipment: EquipmentType;

  @Field(() => EquipmentAssignmentMemberType, { nullable: true })
  member?: EquipmentAssignmentMemberType;

  @Field({ nullable: true })
  bookingNumber?: string;

  @Field()
  assignedAt: Date;

  @Field({ nullable: true })
  returnedAt?: Date;

  @Field(() => Float, { nullable: true })
  rentalFee?: number;

  @Field(() => EquipmentCondition, { nullable: true })
  conditionAtCheckout?: EquipmentCondition;

  @Field(() => EquipmentCondition, { nullable: true })
  conditionAtReturn?: EquipmentCondition;

  @Field({ nullable: true })
  notes?: string;
}

// Response Types
@ObjectType('EquipmentCategoryResponse')
export class EquipmentCategoryResponseType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field(() => EquipmentCategoryType, { nullable: true })
  category?: EquipmentCategoryType;
}

@ObjectType('EquipmentResponse')
export class EquipmentResponseType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field(() => EquipmentType, { nullable: true })
  equipment?: EquipmentType;
}

@ObjectType('EquipmentAssignmentResponse')
export class EquipmentAssignmentResponseType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field(() => EquipmentAssignmentType, { nullable: true })
  assignment?: EquipmentAssignmentType;
}

@ObjectType('EquipmentDeleteResponse')
export class EquipmentDeleteResponseType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  message?: string;
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/equipment
git commit -m "feat(api): add Equipment GraphQL types"
```

---

### Task 11: Create Equipment GraphQL Inputs

**Files:**
- Create: `apps/api/src/graphql/equipment/equipment.inputs.ts`

**Step 1: Create GraphQL inputs file**

```typescript
import { InputType, Field, ID, Float, Int } from '@nestjs/graphql';
import {
  EquipmentAttachmentType,
  EquipmentCondition,
  EquipmentStatus,
} from '@prisma/client';

// Category Inputs
@InputType()
export class CreateEquipmentCategoryInput {
  @Field()
  code: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  color?: string;

  @Field(() => EquipmentAttachmentType, { nullable: true })
  attachmentType?: EquipmentAttachmentType;

  @Field(() => Float, { nullable: true })
  defaultRentalRate?: number;

  @Field({ nullable: true })
  requiresDeposit?: boolean;

  @Field(() => Float, { nullable: true })
  depositAmount?: number;
}

@InputType()
export class UpdateEquipmentCategoryInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field({ nullable: true })
  color?: string;

  @Field(() => EquipmentAttachmentType, { nullable: true })
  attachmentType?: EquipmentAttachmentType;

  @Field(() => Float, { nullable: true })
  defaultRentalRate?: number;

  @Field({ nullable: true })
  requiresDeposit?: boolean;

  @Field(() => Float, { nullable: true })
  depositAmount?: number;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;
}

// Equipment Inputs
@InputType()
export class CreateEquipmentInput {
  @Field(() => ID)
  categoryId: string;

  @Field()
  assetNumber: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  serialNumber?: string;

  @Field({ nullable: true })
  manufacturer?: string;

  @Field({ nullable: true })
  model?: string;

  @Field({ nullable: true })
  purchaseDate?: Date;

  @Field({ nullable: true })
  warrantyExpiry?: Date;

  @Field(() => EquipmentCondition, { nullable: true })
  condition?: EquipmentCondition;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class UpdateEquipmentInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  serialNumber?: string;

  @Field({ nullable: true })
  manufacturer?: string;

  @Field({ nullable: true })
  model?: string;

  @Field({ nullable: true })
  purchaseDate?: Date;

  @Field({ nullable: true })
  warrantyExpiry?: Date;

  @Field(() => EquipmentCondition, { nullable: true })
  condition?: EquipmentCondition;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  lastMaintenanceAt?: Date;

  @Field({ nullable: true })
  nextMaintenanceAt?: Date;
}

@InputType()
export class UpdateEquipmentStatusInput {
  @Field(() => ID)
  id: string;

  @Field(() => EquipmentStatus)
  status: EquipmentStatus;
}

// Filter Inputs
@InputType()
export class EquipmentFilterInput {
  @Field(() => ID, { nullable: true })
  categoryId?: string;

  @Field(() => EquipmentStatus, { nullable: true })
  status?: EquipmentStatus;

  @Field(() => EquipmentCondition, { nullable: true })
  condition?: EquipmentCondition;
}

// Assignment Inputs
@InputType()
export class AssignEquipmentInput {
  @Field(() => ID)
  equipmentId: string;

  @Field(() => ID, { nullable: true })
  bookingId?: string;

  @Field(() => ID, { nullable: true })
  teeTimePlayerId?: string;

  @Field(() => Float, { nullable: true })
  rentalFee?: number;

  @Field(() => EquipmentCondition, { nullable: true })
  conditionAtCheckout?: EquipmentCondition;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class ReturnEquipmentInput {
  @Field(() => ID)
  assignmentId: string;

  @Field(() => EquipmentCondition)
  conditionAtReturn: EquipmentCondition;

  @Field({ nullable: true })
  notes?: string;
}

// Availability Query Args
@InputType()
export class EquipmentAvailabilityInput {
  @Field(() => ID)
  categoryId: string;

  @Field()
  startTime: Date;

  @Field()
  endTime: Date;
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/equipment/equipment.inputs.ts
git commit -m "feat(api): add Equipment GraphQL input types"
```

---

### Task 12: Create Equipment GraphQL Resolver

**Files:**
- Create: `apps/api/src/graphql/equipment/equipment.resolver.ts`

**Step 1: Create the resolver**

```typescript
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { EquipmentService } from '@/modules/equipment/equipment.service';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { EquipmentStatus } from '@prisma/client';
import {
  EquipmentCategoryType,
  EquipmentType,
  EquipmentAssignmentType,
  EquipmentCategoryResponseType,
  EquipmentResponseType,
  EquipmentAssignmentResponseType,
  EquipmentDeleteResponseType,
} from './equipment.types';
import {
  CreateEquipmentCategoryInput,
  UpdateEquipmentCategoryInput,
  CreateEquipmentInput,
  UpdateEquipmentInput,
  UpdateEquipmentStatusInput,
  EquipmentFilterInput,
  AssignEquipmentInput,
  ReturnEquipmentInput,
  EquipmentAvailabilityInput,
} from './equipment.inputs';

@Resolver()
@UseGuards(GqlAuthGuard)
export class EquipmentResolver {
  private readonly logger = new Logger(EquipmentResolver.name);

  constructor(private readonly equipmentService: EquipmentService) {}

  // ============================================================================
  // Category Queries
  // ============================================================================

  @Query(() => [EquipmentCategoryType], { name: 'equipmentCategories' })
  async getEquipmentCategories(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<EquipmentCategoryType[]> {
    const categories = await this.equipmentService.findAllCategories(user.tenantId);

    return categories.map((cat) => ({
      ...cat,
      defaultRentalRate: cat.defaultRentalRate?.toNumber(),
      depositAmount: cat.depositAmount?.toNumber(),
      equipmentCount: cat._count.equipment,
      availableCount: 0, // Will be computed if needed
    }));
  }

  @Query(() => EquipmentCategoryType, { name: 'equipmentCategory', nullable: true })
  async getEquipmentCategory(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<EquipmentCategoryType | null> {
    try {
      const cat = await this.equipmentService.findCategoryById(user.tenantId, id);
      return {
        ...cat,
        defaultRentalRate: cat.defaultRentalRate?.toNumber(),
        depositAmount: cat.depositAmount?.toNumber(),
        equipmentCount: cat.equipment.length,
        availableCount: cat.equipment.filter((e) => e.status === EquipmentStatus.AVAILABLE).length,
      };
    } catch {
      return null;
    }
  }

  // ============================================================================
  // Equipment Queries
  // ============================================================================

  @Query(() => [EquipmentType], { name: 'equipment' })
  async getEquipment(
    @GqlCurrentUser() user: JwtPayload,
    @Args('filter', { type: () => EquipmentFilterInput, nullable: true })
    filter?: EquipmentFilterInput,
  ): Promise<EquipmentType[]> {
    const equipment = await this.equipmentService.findAllEquipment(user.tenantId, filter);

    return equipment.map((e) => this.transformEquipment(e));
  }

  @Query(() => EquipmentType, { name: 'equipmentItem', nullable: true })
  async getEquipmentItem(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<EquipmentType | null> {
    try {
      const e = await this.equipmentService.findEquipmentById(user.tenantId, id);
      return this.transformEquipment(e);
    } catch {
      return null;
    }
  }

  @Query(() => [EquipmentType], { name: 'equipmentAvailability' })
  async getEquipmentAvailability(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: EquipmentAvailabilityInput,
  ): Promise<EquipmentType[]> {
    const equipment = await this.equipmentService.findAvailable(
      user.tenantId,
      input.categoryId,
      input.startTime,
      input.endTime,
    );

    return equipment.map((e) => this.transformEquipment(e));
  }

  // ============================================================================
  // Category Mutations
  // ============================================================================

  @Mutation(() => EquipmentCategoryResponseType, { name: 'createEquipmentCategory' })
  async createEquipmentCategory(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateEquipmentCategoryInput,
  ): Promise<EquipmentCategoryResponseType> {
    try {
      const category = await this.equipmentService.createCategory(user.tenantId, input);
      return {
        success: true,
        category: {
          ...category,
          defaultRentalRate: category.defaultRentalRate?.toNumber(),
          depositAmount: category.depositAmount?.toNumber(),
          equipmentCount: 0,
          availableCount: 0,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to create equipment category: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @Mutation(() => EquipmentCategoryResponseType, { name: 'updateEquipmentCategory' })
  async updateEquipmentCategory(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: UpdateEquipmentCategoryInput,
  ): Promise<EquipmentCategoryResponseType> {
    try {
      const { id, ...data } = input;
      const category = await this.equipmentService.updateCategory(user.tenantId, id, data);
      return {
        success: true,
        category: {
          ...category,
          defaultRentalRate: category.defaultRentalRate?.toNumber(),
          depositAmount: category.depositAmount?.toNumber(),
          equipmentCount: 0,
          availableCount: 0,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to update equipment category: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @Mutation(() => EquipmentDeleteResponseType, { name: 'deleteEquipmentCategory' })
  async deleteEquipmentCategory(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<EquipmentDeleteResponseType> {
    try {
      const result = await this.equipmentService.deleteCategory(user.tenantId, id);
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete equipment category: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // ============================================================================
  // Equipment Mutations
  // ============================================================================

  @Mutation(() => EquipmentResponseType, { name: 'createEquipment' })
  async createEquipment(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateEquipmentInput,
  ): Promise<EquipmentResponseType> {
    try {
      const equipment = await this.equipmentService.createEquipment(user.tenantId, input);
      return { success: true, equipment: this.transformEquipment(equipment) };
    } catch (error) {
      this.logger.error(`Failed to create equipment: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @Mutation(() => EquipmentResponseType, { name: 'updateEquipment' })
  async updateEquipment(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: UpdateEquipmentInput,
  ): Promise<EquipmentResponseType> {
    try {
      const { id, ...data } = input;
      const equipment = await this.equipmentService.updateEquipment(user.tenantId, id, data);
      return { success: true, equipment: this.transformEquipment(equipment) };
    } catch (error) {
      this.logger.error(`Failed to update equipment: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @Mutation(() => EquipmentResponseType, { name: 'updateEquipmentStatus' })
  async updateEquipmentStatus(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: UpdateEquipmentStatusInput,
  ): Promise<EquipmentResponseType> {
    try {
      const equipment = await this.equipmentService.updateEquipmentStatus(
        user.tenantId,
        input.id,
        input.status,
        user.sub,
        user.email,
      );
      return { success: true, equipment: this.transformEquipment(equipment) };
    } catch (error) {
      this.logger.error(`Failed to update equipment status: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @Mutation(() => EquipmentDeleteResponseType, { name: 'deleteEquipment' })
  async deleteEquipment(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<EquipmentDeleteResponseType> {
    try {
      const result = await this.equipmentService.deleteEquipment(user.tenantId, id);
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete equipment: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // ============================================================================
  // Assignment Mutations
  // ============================================================================

  @Mutation(() => EquipmentAssignmentResponseType, { name: 'assignEquipment' })
  async assignEquipment(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: AssignEquipmentInput,
  ): Promise<EquipmentAssignmentResponseType> {
    try {
      const assignment = await this.equipmentService.assignEquipment(
        user.tenantId,
        input,
        user.sub,
        user.email,
      );
      return { success: true, assignment: this.transformAssignment(assignment) };
    } catch (error) {
      this.logger.error(`Failed to assign equipment: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  @Mutation(() => EquipmentAssignmentResponseType, { name: 'returnEquipment' })
  async returnEquipment(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: ReturnEquipmentInput,
  ): Promise<EquipmentAssignmentResponseType> {
    try {
      const assignment = await this.equipmentService.returnEquipment(
        user.tenantId,
        input.assignmentId,
        { conditionAtReturn: input.conditionAtReturn, notes: input.notes },
        user.sub,
        user.email,
      );
      return { success: true, assignment: this.transformAssignment(assignment) };
    } catch (error) {
      this.logger.error(`Failed to return equipment: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  private transformEquipment(e: any): EquipmentType {
    const currentAssignment = e.assignments?.find((a: any) => !a.returnedAt);

    return {
      id: e.id,
      assetNumber: e.assetNumber,
      name: e.name,
      category: {
        id: e.category.id,
        code: e.category.code,
        name: e.category.name,
        description: e.category.description,
        icon: e.category.icon,
        color: e.category.color,
        attachmentType: e.category.attachmentType,
        defaultRentalRate: e.category.defaultRentalRate?.toNumber(),
        requiresDeposit: e.category.requiresDeposit,
        depositAmount: e.category.depositAmount?.toNumber(),
        sortOrder: e.category.sortOrder,
        isActive: e.category.isActive,
        equipmentCount: 0,
        availableCount: 0,
      },
      serialNumber: e.serialNumber,
      manufacturer: e.manufacturer,
      model: e.model,
      condition: e.condition,
      status: e.status,
      location: e.location,
      notes: e.notes,
      currentAssignment: currentAssignment
        ? this.transformAssignment(currentAssignment)
        : undefined,
    };
  }

  private transformAssignment(a: any): EquipmentAssignmentType {
    const member = a.booking?.member || a.teeTimePlayer?.member;

    return {
      id: a.id,
      equipment: this.transformEquipment(a.equipment),
      member: member
        ? {
            id: member.id,
            memberId: member.memberId,
            firstName: member.firstName,
            lastName: member.lastName,
            avatarUrl: member.avatarUrl,
          }
        : undefined,
      bookingNumber: a.booking?.bookingNumber,
      assignedAt: a.assignedAt,
      returnedAt: a.returnedAt,
      rentalFee: a.rentalFee?.toNumber(),
      conditionAtCheckout: a.conditionAtCheckout,
      conditionAtReturn: a.conditionAtReturn,
      notes: a.notes,
    };
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/equipment/equipment.resolver.ts
git commit -m "feat(api): add Equipment GraphQL resolver with CRUD and assignment operations"
```

---

### Task 13: Create Equipment GraphQL Module and Register

**Files:**
- Create: `apps/api/src/graphql/equipment/equipment.module.ts`
- Modify: `apps/api/src/app.module.ts`

**Step 1: Create the GraphQL module**

Create `apps/api/src/graphql/equipment/equipment.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { EquipmentResolver } from './equipment.resolver';
import { EquipmentModule as EquipmentServiceModule } from '@/modules/equipment/equipment.module';
import { SharedModule } from '@/shared/shared.module';

@Module({
  imports: [EquipmentServiceModule, SharedModule],
  providers: [EquipmentResolver],
  exports: [EquipmentResolver],
})
export class EquipmentGraphQLModule {}
```

**Step 2: Register in app.module.ts**

Find `apps/api/src/app.module.ts` and add the import:

```typescript
import { EquipmentGraphQLModule } from './graphql/equipment/equipment.module';
```

Add `EquipmentGraphQLModule` to the imports array.

**Step 3: Verify API starts**

Run: `cd apps/api && pnpm run dev`
Expected: API starts without errors, GraphQL schema includes equipment types

**Step 4: Commit**

```bash
git add apps/api/src/graphql/equipment/equipment.module.ts apps/api/src/app.module.ts
git commit -m "feat(api): register EquipmentGraphQLModule in app"
```

---

### Task 14: Create Nested Resource Availability Service

**Files:**
- Create: `apps/api/src/modules/bookings/resource-availability.service.ts`

**Step 1: Create the service**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

export interface ResourceAvailabilityResult {
  available: boolean;
  conflicts: Array<{
    bookingId: string;
    bookingNumber: string;
    resourceId: string;
    resourceName: string;
    startTime: Date;
    endTime: Date;
    conflictType: 'self' | 'ancestor' | 'descendant';
  }>;
}

@Injectable()
export class ResourceAvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check availability for a resource, considering nested hierarchy.
   * - If resource has a booking → blocked
   * - If any ancestor has a booking → blocked (parent booked = children unavailable)
   * - If any descendant has a booking → blocked (child booked = parent unavailable)
   */
  async checkAvailability(
    clubId: string,
    resourceId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string,
  ): Promise<ResourceAvailabilityResult> {
    const conflicts: ResourceAvailabilityResult['conflicts'] = [];

    // Get the resource with its hierarchy
    const resource = await this.prisma.resource.findFirst({
      where: { id: resourceId, facility: { clubId } },
    });

    if (!resource) {
      return { available: false, conflicts: [] };
    }

    // Get all ancestor IDs
    const ancestors = await this.getAncestors(resourceId);

    // Get all descendant IDs
    const descendants = await this.getDescendants(resourceId);

    // All resource IDs to check (self + ancestors + descendants)
    const allResourceIds = [resourceId, ...ancestors.map((a) => a.id), ...descendants.map((d) => d.id)];

    // Find conflicting bookings
    const bookingWhere: any = {
      resourceId: { in: allResourceIds },
      status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      OR: [
        { startTime: { lt: endTime }, endTime: { gt: startTime } },
      ],
    };

    if (excludeBookingId) {
      bookingWhere.id = { not: excludeBookingId };
    }

    const conflictingBookings = await this.prisma.booking.findMany({
      where: bookingWhere,
      include: {
        resource: true,
      },
    });

    for (const booking of conflictingBookings) {
      let conflictType: 'self' | 'ancestor' | 'descendant' = 'self';

      if (booking.resourceId === resourceId) {
        conflictType = 'self';
      } else if (ancestors.some((a) => a.id === booking.resourceId)) {
        conflictType = 'ancestor';
      } else if (descendants.some((d) => d.id === booking.resourceId)) {
        conflictType = 'descendant';
      }

      conflicts.push({
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        resourceId: booking.resourceId || '',
        resourceName: booking.resource?.name || '',
        startTime: booking.startTime,
        endTime: booking.endTime,
        conflictType,
      });
    }

    return {
      available: conflicts.length === 0,
      conflicts,
    };
  }

  /**
   * Get all ancestors (parent chain) of a resource
   */
  async getAncestors(resourceId: string): Promise<Array<{ id: string; name: string }>> {
    const ancestors: Array<{ id: string; name: string }> = [];
    let currentId: string | null = resourceId;

    while (currentId) {
      const resource = await this.prisma.resource.findUnique({
        where: { id: currentId },
        select: { parentResourceId: true, id: true, name: true },
      });

      if (!resource || !resource.parentResourceId) break;

      const parent = await this.prisma.resource.findUnique({
        where: { id: resource.parentResourceId },
        select: { id: true, name: true, parentResourceId: true },
      });

      if (parent) {
        ancestors.push({ id: parent.id, name: parent.name });
        currentId = parent.id;
      } else {
        break;
      }
    }

    return ancestors;
  }

  /**
   * Get all descendants (all children recursively) of a resource
   */
  async getDescendants(resourceId: string): Promise<Array<{ id: string; name: string }>> {
    const descendants: Array<{ id: string; name: string }> = [];
    const queue = [resourceId];

    while (queue.length > 0) {
      const currentId = queue.shift()!;

      const children = await this.prisma.resource.findMany({
        where: { parentResourceId: currentId },
        select: { id: true, name: true },
      });

      for (const child of children) {
        descendants.push({ id: child.id, name: child.name });
        queue.push(child.id);
      }
    }

    return descendants;
  }

  /**
   * Get the full resource tree for a facility
   */
  async getResourceTree(facilityId: string): Promise<any[]> {
    const resources = await this.prisma.resource.findMany({
      where: { facilityId },
      orderBy: { sortOrder: 'asc' },
    });

    // Build tree structure
    const resourceMap = new Map(resources.map((r) => [r.id, { ...r, children: [] as any[] }]));
    const rootResources: any[] = [];

    for (const resource of resources) {
      const node = resourceMap.get(resource.id)!;

      if (resource.parentResourceId) {
        const parent = resourceMap.get(resource.parentResourceId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        rootResources.push(node);
      }
    }

    return rootResources;
  }
}
```

**Step 2: Register in BookingsModule**

Update `apps/api/src/modules/bookings/bookings.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { ResourceAvailabilityService } from './resource-availability.service';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService, ResourceAvailabilityService],
  exports: [BookingsService, ResourceAvailabilityService],
})
export class BookingsModule {}
```

**Step 3: Commit**

```bash
git add apps/api/src/modules/bookings/resource-availability.service.ts apps/api/src/modules/bookings/bookings.module.ts
git commit -m "feat(api): add ResourceAvailabilityService for nested resource conflict detection"
```

---

## Phase 3: Seed Data

### Task 15: Create Equipment Seed Data

**Files:**
- Create: `database/prisma/seed-equipment.ts`

**Step 1: Create the seed file**

```typescript
/**
 * ClubVantage Equipment Seed Script
 * Seeds equipment categories and equipment items for testing
 *
 * Run with: pnpm exec tsx prisma/seed-equipment.ts
 */

import { PrismaClient, EquipmentAttachmentType, EquipmentCondition, EquipmentStatus } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔧 Starting equipment seed...');

  // Get the demo club
  const club = await prisma.club.findFirst({
    where: { slug: 'royal-bangkok-club' },
  });

  if (!club) {
    console.error('❌ Demo club not found. Run the main seed first.');
    process.exit(1);
  }

  console.log(`📍 Found club: ${club.name}`);

  // ============================================================================
  // EQUIPMENT CATEGORIES
  // ============================================================================
  console.log('📦 Creating equipment categories...');

  const categories = [
    {
      code: 'GOLF_CART',
      name: 'Golf Cart',
      description: 'Electric golf carts for course navigation',
      icon: 'Car',
      color: '#10B981',
      attachmentType: EquipmentAttachmentType.OPTIONAL_ADDON,
      defaultRentalRate: 800,
      requiresDeposit: false,
    },
    {
      code: 'GOLF_CLUBS',
      name: 'Golf Clubs',
      description: 'Rental golf club sets',
      icon: 'Flag',
      color: '#3B82F6',
      attachmentType: EquipmentAttachmentType.OPTIONAL_ADDON,
      defaultRentalRate: 500,
      requiresDeposit: true,
      depositAmount: 2000,
    },
    {
      code: 'BALL_MACHINE',
      name: 'Ball Machine',
      description: 'Tennis ball machines for practice',
      icon: 'CircleDot',
      color: '#F59E0B',
      attachmentType: EquipmentAttachmentType.OPTIONAL_ADDON,
      defaultRentalRate: 300,
      requiresDeposit: false,
    },
    {
      code: 'TENNIS_RACKET',
      name: 'Tennis Racket',
      description: 'Rental tennis rackets',
      icon: 'Circle',
      color: '#EF4444',
      attachmentType: EquipmentAttachmentType.OPTIONAL_ADDON,
      defaultRentalRate: 150,
      requiresDeposit: true,
      depositAmount: 500,
    },
    {
      code: 'G5_MACHINE',
      name: 'G5 Treatment Machine',
      description: 'G5 massage machine for spa treatments',
      icon: 'Sparkles',
      color: '#EC4899',
      attachmentType: EquipmentAttachmentType.REQUIRED_RESOURCE,
      defaultRentalRate: 0, // Included in service price
      requiresDeposit: false,
    },
    {
      code: 'BIKE',
      name: 'Electric Bike',
      description: 'Electric bikes for resort exploration',
      icon: 'Bike',
      color: '#8B5CF6',
      attachmentType: EquipmentAttachmentType.OPTIONAL_ADDON,
      defaultRentalRate: 400,
      requiresDeposit: true,
      depositAmount: 1000,
    },
  ];

  const createdCategories: any[] = [];

  for (let i = 0; i < categories.length; i++) {
    const catData = categories[i];

    const existing = await prisma.equipmentCategory.findUnique({
      where: { clubId_code: { clubId: club.id, code: catData.code } },
    });

    if (existing) {
      console.log(`  ⏭️  Skipping ${catData.name} (already exists)`);
      createdCategories.push(existing);
      continue;
    }

    const category = await prisma.equipmentCategory.create({
      data: {
        clubId: club.id,
        ...catData,
        sortOrder: i,
      },
    });

    console.log(`  ✅ Created ${catData.name}`);
    createdCategories.push(category);
  }

  // ============================================================================
  // EQUIPMENT ITEMS
  // ============================================================================
  console.log('🔧 Creating equipment items...');

  const categoryMap = new Map(createdCategories.map((c) => [c.code, c]));

  const equipmentItems = [
    // Golf Carts
    ...Array.from({ length: 10 }, (_, i) => ({
      categoryCode: 'GOLF_CART',
      assetNumber: `GC-${String(i + 1).padStart(3, '0')}`,
      name: `Golf Cart #${i + 1}`,
      manufacturer: 'Club Car',
      model: 'Tempo',
      condition: i < 7 ? EquipmentCondition.GOOD : i < 9 ? EquipmentCondition.FAIR : EquipmentCondition.NEEDS_REPAIR,
      status: i < 9 ? EquipmentStatus.AVAILABLE : EquipmentStatus.MAINTENANCE,
      location: i < 9 ? 'Golf Cart Station' : 'Maintenance Bay',
    })),

    // Golf Clubs
    ...Array.from({ length: 6 }, (_, i) => ({
      categoryCode: 'GOLF_CLUBS',
      assetNumber: `GCS-${String(i + 1).padStart(3, '0')}`,
      name: `Golf Club Set #${i + 1}`,
      manufacturer: i % 2 === 0 ? 'Titleist' : 'Callaway',
      model: i % 2 === 0 ? 'T-Series' : 'Apex',
      condition: i < 4 ? EquipmentCondition.EXCELLENT : EquipmentCondition.GOOD,
      status: EquipmentStatus.AVAILABLE,
      location: 'Pro Shop',
    })),

    // Ball Machines
    ...Array.from({ length: 3 }, (_, i) => ({
      categoryCode: 'BALL_MACHINE',
      assetNumber: `BM-${String(i + 1).padStart(3, '0')}`,
      name: `Ball Machine #${i + 1}`,
      manufacturer: 'Lobster',
      model: 'Elite Grand V',
      condition: EquipmentCondition.EXCELLENT,
      status: EquipmentStatus.AVAILABLE,
      location: 'Tennis Pro Shop',
    })),

    // Tennis Rackets
    ...Array.from({ length: 8 }, (_, i) => ({
      categoryCode: 'TENNIS_RACKET',
      assetNumber: `TR-${String(i + 1).padStart(3, '0')}`,
      name: `Tennis Racket Set ${String.fromCharCode(65 + i)}`,
      manufacturer: i % 2 === 0 ? 'Wilson' : 'Babolat',
      model: i % 2 === 0 ? 'Pro Staff' : 'Pure Aero',
      condition: i < 6 ? EquipmentCondition.GOOD : EquipmentCondition.FAIR,
      status: EquipmentStatus.AVAILABLE,
      location: 'Tennis Pro Shop',
    })),

    // G5 Machines
    ...Array.from({ length: 2 }, (_, i) => ({
      categoryCode: 'G5_MACHINE',
      assetNumber: `G5-${String(i + 1).padStart(3, '0')}`,
      name: `G5 Machine #${i + 1}`,
      manufacturer: 'G5',
      model: 'Pro Series',
      condition: EquipmentCondition.EXCELLENT,
      status: EquipmentStatus.AVAILABLE,
      location: 'Spa Treatment Room',
    })),

    // Electric Bikes
    ...Array.from({ length: 5 }, (_, i) => ({
      categoryCode: 'BIKE',
      assetNumber: `EB-${String(i + 1).padStart(3, '0')}`,
      name: `Electric Bike #${i + 1}`,
      manufacturer: 'Specialized',
      model: 'Turbo Vado',
      condition: i < 4 ? EquipmentCondition.EXCELLENT : EquipmentCondition.GOOD,
      status: EquipmentStatus.AVAILABLE,
      location: 'Bike Station',
    })),
  ];

  let created = 0;
  let skipped = 0;

  for (const item of equipmentItems) {
    const category = categoryMap.get(item.categoryCode);
    if (!category) continue;

    const existing = await prisma.equipment.findUnique({
      where: { clubId_assetNumber: { clubId: club.id, assetNumber: item.assetNumber } },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.equipment.create({
      data: {
        clubId: club.id,
        categoryId: category.id,
        assetNumber: item.assetNumber,
        name: item.name,
        manufacturer: item.manufacturer,
        model: item.model,
        condition: item.condition,
        status: item.status,
        location: item.location,
      },
    });

    created++;
  }

  console.log(`  ✅ Created ${created} equipment items (${skipped} skipped)`);

  // ============================================================================
  // SUMMARY
  // ============================================================================
  const totalCategories = await prisma.equipmentCategory.count({ where: { clubId: club.id } });
  const totalEquipment = await prisma.equipment.count({ where: { clubId: club.id } });
  const availableEquipment = await prisma.equipment.count({
    where: { clubId: club.id, status: EquipmentStatus.AVAILABLE },
  });

  console.log('\n📈 Equipment Summary:');
  console.log(`   Categories: ${totalCategories}`);
  console.log(`   Total Equipment: ${totalEquipment}`);
  console.log(`   Available: ${availableEquipment}`);

  console.log('\n✨ Equipment seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Step 2: Run the seed**

Run: `cd database && pnpm exec tsx prisma/seed-equipment.ts`

**Step 3: Commit**

```bash
git add database/prisma/seed-equipment.ts
git commit -m "feat(db): add equipment seed data"
```

---

## Phase 4: Frontend Components

> **Note:** Use the `frontend-design` skill for all UI components in this phase.
> Follow ClubVantage design system: Amber primary, Emerald secondary, Stone neutral.

### Task 16: Update Equipment Tab with Real Data

**Files:**
- Modify: `apps/application/src/components/bookings/equipment-tab.tsx`

The existing equipment-tab.tsx has mock data. Update it to:

1. Fetch real data from the GraphQL API using the new equipment queries
2. Add CRUD operations for equipment categories and items
3. Add assignment/return functionality
4. Keep the existing UI patterns but connect to real data

**Step 1: Create GraphQL queries/mutations**

Add to `apps/application/src/lib/graphql/equipment.ts`:

```typescript
import { gql } from '@apollo/client';

export const GET_EQUIPMENT_CATEGORIES = gql`
  query GetEquipmentCategories {
    equipmentCategories {
      id
      code
      name
      description
      icon
      color
      attachmentType
      defaultRentalRate
      requiresDeposit
      depositAmount
      sortOrder
      isActive
      equipmentCount
      availableCount
    }
  }
`;

export const GET_EQUIPMENT = gql`
  query GetEquipment($filter: EquipmentFilterInput) {
    equipment(filter: $filter) {
      id
      assetNumber
      name
      category {
        id
        code
        name
        icon
        color
      }
      serialNumber
      manufacturer
      model
      condition
      status
      location
      notes
      currentAssignment {
        id
        member {
          id
          memberId
          firstName
          lastName
          avatarUrl
        }
        bookingNumber
        assignedAt
        rentalFee
      }
    }
  }
`;

export const CREATE_EQUIPMENT_CATEGORY = gql`
  mutation CreateEquipmentCategory($input: CreateEquipmentCategoryInput!) {
    createEquipmentCategory(input: $input) {
      success
      error
      category {
        id
        code
        name
      }
    }
  }
`;

export const CREATE_EQUIPMENT = gql`
  mutation CreateEquipment($input: CreateEquipmentInput!) {
    createEquipment(input: $input) {
      success
      error
      equipment {
        id
        assetNumber
        name
      }
    }
  }
`;

export const UPDATE_EQUIPMENT_STATUS = gql`
  mutation UpdateEquipmentStatus($input: UpdateEquipmentStatusInput!) {
    updateEquipmentStatus(input: $input) {
      success
      error
      equipment {
        id
        status
      }
    }
  }
`;

export const ASSIGN_EQUIPMENT = gql`
  mutation AssignEquipment($input: AssignEquipmentInput!) {
    assignEquipment(input: $input) {
      success
      error
      assignment {
        id
        equipment {
          id
          status
        }
      }
    }
  }
`;

export const RETURN_EQUIPMENT = gql`
  mutation ReturnEquipment($input: ReturnEquipmentInput!) {
    returnEquipment(input: $input) {
      success
      error
      assignment {
        id
        returnedAt
      }
    }
  }
`;
```

**Step 2: Update equipment-tab.tsx to use real data**

(This is a large update - the component should fetch from API instead of using mockEquipment)

Key changes:
- Replace `mockEquipment` with `useQuery(GET_EQUIPMENT)`
- Add mutation hooks for status updates, assignments, returns
- Add loading and error states
- Keep existing UI structure

**Step 3: Commit**

```bash
git add apps/application/src/lib/graphql/equipment.ts apps/application/src/components/bookings/equipment-tab.tsx
git commit -m "feat(ui): connect equipment tab to GraphQL API"
```

---

### Task 17: Create Equipment Category Modal

**Files:**
- Create: `apps/application/src/components/bookings/equipment-category-modal.tsx`

> Use `frontend-design` skill for this component

Create a modal for adding/editing equipment categories with:
- Code, name, description fields
- Icon picker (using Lucide icons)
- Color picker
- Attachment type selector (optional addon vs required resource)
- Rental rate and deposit fields
- Active toggle

Follow the pattern from `facility-modal.tsx`.

**Step 1: Create the component**

**Step 2: Commit**

```bash
git add apps/application/src/components/bookings/equipment-category-modal.tsx
git commit -m "feat(ui): add equipment category modal"
```

---

### Task 18: Create Equipment Item Modal

**Files:**
- Create: `apps/application/src/components/bookings/equipment-modal.tsx`

> Use `frontend-design` skill for this component

Create a modal for adding/editing equipment items with:
- Category selector
- Asset number, name
- Serial number, manufacturer, model
- Condition selector
- Location field
- Purchase date, warranty expiry
- Notes

Follow the pattern from `facility-modal.tsx`.

**Step 1: Create the component**

**Step 2: Commit**

```bash
git add apps/application/src/components/bookings/equipment-modal.tsx
git commit -m "feat(ui): add equipment item modal"
```

---

### Task 19: Create Equipment Assignment Modal

**Files:**
- Create: `apps/application/src/components/bookings/equipment-assign-modal.tsx`

> Use `frontend-design` skill for this component

Create a modal for assigning equipment to a booking with:
- Member search (if assigning standalone)
- Booking reference display
- Equipment condition at checkout
- Rental fee override
- Notes field

**Step 1: Create the component**

**Step 2: Commit**

```bash
git add apps/application/src/components/bookings/equipment-assign-modal.tsx
git commit -m "feat(ui): add equipment assignment modal"
```

---

### Task 20: Create Equipment Return Modal

**Files:**
- Create: `apps/application/src/components/bookings/equipment-return-modal.tsx`

> Use `frontend-design` skill for this component

Create a modal for returning equipment with:
- Equipment details display
- Assigned member display
- Condition at return selector
- Damage notes field
- Confirm return button

**Step 1: Create the component**

**Step 2: Commit**

```bash
git add apps/application/src/components/bookings/equipment-return-modal.tsx
git commit -m "feat(ui): add equipment return modal"
```

---

## Verification Checklist

After completing all tasks, verify:

- [ ] Database migration applied successfully
- [ ] API starts without errors
- [ ] GraphQL playground shows equipment types and queries
- [ ] Equipment categories can be created, updated, deleted
- [ ] Equipment items can be created, updated, deleted
- [ ] Equipment status can be changed
- [ ] Equipment can be assigned to bookings
- [ ] Equipment can be returned with condition update
- [ ] UI shows equipment list with filters
- [ ] UI shows category management
- [ ] Assignment modal works with member search
- [ ] Return modal captures condition

---

## Summary

**20 Tasks Total:**
- Phase 1 (Schema): Tasks 1-7
- Phase 2 (Backend): Tasks 8-14
- Phase 3 (Seed): Task 15
- Phase 4 (Frontend): Tasks 16-20

**Key Files Created/Modified:**
- `database/prisma/schema.prisma` - Equipment models
- `apps/api/src/modules/equipment/*` - Equipment service module
- `apps/api/src/graphql/equipment/*` - GraphQL types, inputs, resolver
- `apps/api/src/modules/bookings/resource-availability.service.ts` - Nested resource logic
- `apps/application/src/components/bookings/equipment-*.tsx` - UI components

**Next Phase:** Nested resources UI (resource tree view, service equipment requirements)
