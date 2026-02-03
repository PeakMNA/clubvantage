# Equipment Unification - Phase 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `operationType` field to EquipmentCategory to scope equipment visibility by operation (Golf, Facility, Spa, Event).

**Architecture:** Single unified equipment backend with operation-based filtering at query time.

**Tech Stack:** Prisma, NestJS/GraphQL, React/TanStack Query

---

## Tasks

### Task 1: Add OperationType enum and field to Prisma schema

**Files:**
- Modify: `database/prisma/schema.prisma`

**Changes:**

Add enum after `EquipmentAttachmentType`:

```prisma
enum OperationType {
  GOLF      // Golf carts, clubs, pull carts, range balls
  FACILITY  // Tennis rackets, yoga mats, general facility equipment
  SPA       // Robes, towels, spa-specific equipment
  EVENT     // Projectors, AV systems, tables, chairs
}
```

Add field to `EquipmentCategory` model after `attachmentType`:

```prisma
model EquipmentCategory {
  // ... existing fields ...
  attachmentType    EquipmentAttachmentType @default(OPTIONAL_ADDON)
  operationType     OperationType           @default(FACILITY)  // NEW
  defaultRentalRate Decimal?                @db.Decimal(10, 2)
  // ... rest of fields ...
}
```

---

### Task 2: Run Prisma migration

**Commands:**

```bash
cd database
npx prisma migrate dev --name add_equipment_operation_type
```

**Expected output:** Migration created and applied, new column added with default value `FACILITY`.

---

### Task 3: Update seed-equipment.ts with operation types

**Files:**
- Modify: `database/prisma/seed-equipment.ts`

**Changes:**

Update `EquipmentCategorySeed` interface:

```typescript
interface EquipmentCategorySeed {
  code: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  operationType: 'GOLF' | 'FACILITY' | 'SPA' | 'EVENT';  // NEW
  attachmentType: EquipmentAttachmentType;
  defaultRentalRate?: number;
  requiresDeposit: boolean;
  depositAmount?: number;
}
```

Update `EQUIPMENT_CATEGORIES` array with operationType for each:

```typescript
const EQUIPMENT_CATEGORIES: EquipmentCategorySeed[] = [
  // Golf Equipment
  {
    code: 'GOLF_CARTS',
    name: 'Golf Carts',
    operationType: 'GOLF',  // NEW
    // ... rest
  },
  {
    code: 'GOLF_CLUBS',
    name: 'Golf Club Sets',
    operationType: 'GOLF',  // NEW
    // ... rest
  },
  {
    code: 'PULL_CARTS',
    name: 'Pull Carts',
    operationType: 'GOLF',  // NEW
    // ... rest
  },
  {
    code: 'RANGE_BALLS',
    name: 'Range Balls',
    operationType: 'GOLF',  // NEW
    // ... rest
  },
  // Facility Equipment
  {
    code: 'TENNIS_RACKETS',
    name: 'Tennis Rackets',
    operationType: 'FACILITY',  // NEW
    // ... rest
  },
  {
    code: 'TENNIS_BALLS',
    name: 'Tennis Ball Canisters',
    operationType: 'FACILITY',  // NEW
    // ... rest
  },
  // Event Equipment
  {
    code: 'PROJECTORS',
    name: 'Projectors',
    operationType: 'EVENT',  // NEW
    // ... rest
  },
  {
    code: 'AUDIO_SYSTEMS',
    name: 'Audio Systems',
    operationType: 'EVENT',  // NEW
    // ... rest
  },
  {
    code: 'TABLES',
    name: 'Event Tables',
    operationType: 'EVENT',  // NEW
    // ... rest
  },
  {
    code: 'CHAIRS',
    name: 'Event Chairs',
    operationType: 'EVENT',  // NEW
    // ... rest
  },
];
```

Update the create call in main() to include operationType:

```typescript
const created = await prisma.equipmentCategory.create({
  data: {
    clubId: club.id,
    code: cat.code,
    name: cat.name,
    description: cat.description,
    icon: cat.icon,
    color: cat.color,
    operationType: cat.operationType,  // NEW
    attachmentType: cat.attachmentType,
    defaultRentalRate: cat.defaultRentalRate,
    requiresDeposit: cat.requiresDeposit,
    depositAmount: cat.depositAmount,
    sortOrder: i,
    isActive: true,
  },
});
```

---

### Task 4: Update GraphQL types with operationType

**Files:**
- Modify: `apps/api/src/graphql/equipment/equipment.types.ts`

**Changes:**

Add OperationType enum:

```typescript
import { registerEnumType } from '@nestjs/graphql';

export enum OperationType {
  GOLF = 'GOLF',
  FACILITY = 'FACILITY',
  SPA = 'SPA',
  EVENT = 'EVENT',
}

registerEnumType(OperationType, {
  name: 'OperationType',
  description: 'Type of operation this equipment category belongs to',
});
```

Add field to EquipmentCategoryType:

```typescript
@ObjectType()
export class EquipmentCategoryType {
  // ... existing fields ...

  @Field(() => String)
  attachmentType: string;

  @Field(() => OperationType)  // NEW
  operationType: OperationType;

  @Field(() => Float, { nullable: true })
  defaultRentalRate?: number;

  // ... rest of fields ...
}
```

---

### Task 5: Update GraphQL inputs with operationType filter

**Files:**
- Modify: `apps/api/src/graphql/equipment/equipment.input.ts`

**Changes:**

Add operationType to CreateEquipmentCategoryInput:

```typescript
@InputType()
export class CreateEquipmentCategoryInput {
  // ... existing fields ...

  @Field(() => String, { nullable: true })
  attachmentType?: string;

  @Field(() => OperationType, { nullable: true, defaultValue: 'FACILITY' })  // NEW
  operationType?: OperationType;

  // ... rest of fields ...
}
```

Add operationType to UpdateEquipmentCategoryInput:

```typescript
@InputType()
export class UpdateEquipmentCategoryInput {
  // ... existing fields ...

  @Field(() => OperationType, { nullable: true })  // NEW
  operationType?: OperationType;

  // ... rest of fields ...
}
```

Add operationType filter to EquipmentFilterInput (or create new input):

```typescript
@InputType()
export class EquipmentCategoryFilterInput {
  @Field(() => OperationType, { nullable: true })
  operationType?: OperationType;

  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;
}
```

---

### Task 6: Update resolver to support operationType filter

**Files:**
- Modify: `apps/api/src/graphql/equipment/equipment.resolver.ts`

**Changes:**

Update getEquipmentCategories query to accept filter:

```typescript
@Query(() => [EquipmentCategoryType], { name: 'equipmentCategories' })
async getEquipmentCategories(
  @GqlCurrentUser() user: JwtPayload,
  @Args('filter', { type: () => EquipmentCategoryFilterInput, nullable: true })
  filter?: EquipmentCategoryFilterInput,
): Promise<EquipmentCategoryType[]> {
  const categories = await this.equipmentService.findAllCategories(
    user.tenantId,
    filter,  // Pass filter to service
  );

  return categories.map((cat) => this.transformCategory(cat, cat._count.equipment, 0));
}
```

Update transformCategory to include operationType:

```typescript
private transformCategory(
  cat: any,
  equipmentCount: number,
  availableCount: number,
): EquipmentCategoryType {
  return {
    id: cat.id,
    code: cat.code,
    name: cat.name,
    description: cat.description ?? undefined,
    icon: cat.icon ?? undefined,
    color: cat.color ?? undefined,
    attachmentType: cat.attachmentType,
    operationType: cat.operationType,  // NEW
    defaultRentalRate: cat.defaultRentalRate?.toNumber() ?? undefined,
    requiresDeposit: cat.requiresDeposit,
    depositAmount: cat.depositAmount?.toNumber() ?? undefined,
    sortOrder: cat.sortOrder,
    isActive: cat.isActive,
    equipmentCount,
    availableCount,
  };
}
```

---

### Task 7: Update equipment service to filter by operationType

**Files:**
- Modify: `apps/api/src/modules/equipment/equipment.service.ts`

**Changes:**

Update findAllCategories method:

```typescript
async findAllCategories(
  clubId: string,
  filter?: { operationType?: OperationType; isActive?: boolean },
) {
  return this.prisma.equipmentCategory.findMany({
    where: {
      clubId,
      ...(filter?.operationType && { operationType: filter.operationType }),
      ...(filter?.isActive !== undefined && { isActive: filter.isActive }),
    },
    include: {
      _count: { select: { equipment: true } },
    },
    orderBy: { sortOrder: 'asc' },
  });
}
```

Update findAllEquipment to optionally filter by category's operationType:

```typescript
async findAllEquipment(
  clubId: string,
  filter?: EquipmentFilterInput & { operationType?: OperationType },
) {
  return this.prisma.equipment.findMany({
    where: {
      clubId,
      ...(filter?.categoryId && { categoryId: filter.categoryId }),
      ...(filter?.status && { status: filter.status }),
      ...(filter?.condition && { condition: filter.condition }),
      ...(filter?.operationType && {
        category: { operationType: filter.operationType },
      }),
    },
    include: {
      category: true,
      assignments: {
        where: { returnedAt: null },
        include: {
          booking: { include: { member: true } },
          teeTimePlayer: { include: { member: true } },
        },
      },
    },
    orderBy: [{ category: { sortOrder: 'asc' } }, { assetNumber: 'asc' }],
  });
}
```

---

### Task 8: Regenerate GraphQL schema and run codegen

**Commands:**

```bash
# Start API briefly to regenerate schema.gql
cd apps/api
pnpm run dev &
sleep 10
kill %1

# Run codegen for api-client
pnpm --filter @clubvantage/api-client run codegen
```

---

### Task 9: Update frontend hook to pass operationType

**Files:**
- Modify: `apps/application/src/hooks/use-equipment.ts`

**Changes:**

Add operationType parameter to useEquipment:

```typescript
export function useEquipment(operationType?: 'GOLF' | 'FACILITY' | 'SPA' | 'EVENT') {
  const query = useGetEquipmentQuery(
    {
      filter: operationType ? { operationType } : undefined
    },
    { staleTime: 30000 }
  );
  // ... rest
}

export function useEquipmentCategories(operationType?: 'GOLF' | 'FACILITY' | 'SPA' | 'EVENT') {
  const query = useGetEquipmentCategoriesQuery(
    {
      filter: operationType ? { operationType } : undefined
    },
    { staleTime: 60000 }
  );
  // ... rest
}
```

---

### Task 10: Update EquipmentTab to accept operationType prop

**Files:**
- Modify: `apps/application/src/components/bookings/equipment-tab.tsx`

**Changes:**

Add operationType to props:

```typescript
export interface EquipmentTabProps {
  operationType?: 'GOLF' | 'FACILITY' | 'SPA' | 'EVENT';  // NEW
  initialEquipment?: Equipment[];
  onViewDetails?: (equipmentId: string) => void;
  onCheckOut?: (equipmentId: string) => void;
  onCheckIn?: (equipmentId: string) => void;
  onSetMaintenance?: (equipmentId: string) => void;
  className?: string;
}
```

Pass to hook:

```typescript
export function EquipmentTab({
  operationType,  // NEW
  initialEquipment,
  // ...
}: EquipmentTabProps) {
  // Fetch equipment filtered by operation type
  const { equipment: fetchedEquipment, counts, isLoading, error, refetch } =
    useEquipment(operationType);  // Pass operationType

  // ... rest
}
```

---

### Task 11: Update Facility page to pass operationType

**Files:**
- Modify: `apps/application/src/app/(dashboard)/facility/page.tsx`

**Changes:**

Pass operationType to EquipmentTab:

```typescript
case 'equipment':
  return (
    <EquipmentTab
      operationType="FACILITY"  // NEW - only show facility equipment
      onViewDetails={(id) => console.log('View equipment details:', id)}
    />
  );
```

---

### Task 12: Run seed and verify

**Commands:**

```bash
# Re-run equipment seed to update existing categories with operation types
cd database
npx ts-node prisma/seed-equipment.ts
```

**Verification:**

1. Start API: `cd apps/api && pnpm run dev`
2. Query categories with filter:
   ```graphql
   query {
     equipmentCategories(filter: { operationType: GOLF }) {
       id
       name
       operationType
     }
   }
   ```
3. Should only return golf-related categories

---

## Summary

| Task | File | Change |
|------|------|--------|
| 1 | schema.prisma | Add OperationType enum + field |
| 2 | - | Run migration |
| 3 | seed-equipment.ts | Add operationType to seed data |
| 4 | equipment.types.ts | Add operationType to GraphQL types |
| 5 | equipment.input.ts | Add filter input |
| 6 | equipment.resolver.ts | Accept filter, transform operationType |
| 7 | equipment.service.ts | Filter by operationType |
| 8 | - | Regenerate schema + codegen |
| 9 | use-equipment.ts | Accept operationType param |
| 10 | equipment-tab.tsx | Accept operationType prop |
| 11 | facility/page.tsx | Pass operationType="FACILITY" |
| 12 | - | Re-seed and verify |

---

## Verification Checklist

- [ ] Migration runs without errors
- [ ] Seed creates categories with correct operation types
- [ ] GraphQL query filters by operationType
- [ ] Golf page (when wired) shows only golf equipment
- [ ] Facility page shows only facility equipment
- [ ] Equipment CRUD still works
- [ ] Assignment/return still works
