# POS Phase 1: Core Foundation - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement 7 POS foundation features: Discounts, Credit Limits, Cash Drawer, EOD Settlement, Minimum Spend, Sub-Accounts, and Stored Payments.

**Architecture:** Each feature follows a layered approach: Prisma schema → GraphQL types/inputs → Service layer → Resolvers → API Client codegen → React components. Features are independent and can be developed in parallel after the shared Prisma models are in place.

**Tech Stack:** Prisma ORM, NestJS GraphQL, TanStack Query, React, Tailwind CSS, Radix UI primitives, Stripe (stored payments).

---

## Prerequisites

Before starting implementation:
1. Read `/docs/plans/2026-02-01-pos-phase1-ux-spec.md` for detailed UX flows
2. Ensure you're on a feature branch: `git checkout -b feature/pos-phase1-foundation`
3. Verify the dev environment is running: `pnpm dev`

---

## Part 1: Discounts System

### Task 1: Add Discount Prisma Models

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Step 1: Add the Discount and AppliedDiscount models**

Add at the end of the schema file:

```prisma
// ─────────────────────────────────────────────────────────────
// DISCOUNTS SYSTEM
// ─────────────────────────────────────────────────────────────

enum DiscountType {
  PERCENTAGE
  FIXED_AMOUNT
}

enum DiscountScope {
  LINE_ITEM
  ORDER
}

model Discount {
  id                String        @id @default(uuid())
  clubId            String
  club              Club          @relation(fields: [clubId], references: [id])

  name              String        // "Staff Courtesy", "Member Loyalty"
  code              String?       // Optional promo code
  type              DiscountType  // PERCENTAGE or FIXED_AMOUNT
  value             Decimal       // 10 for 10%, or 50 for ฿50
  scope             DiscountScope // LINE_ITEM or ORDER

  // Conditions
  minOrderAmount    Decimal?      // Minimum order to apply
  maxDiscount       Decimal?      // Cap for percentage discounts
  memberTiers       String[]      // ["GOLD", "PLATINUM"] or empty for all
  outlets           String[]      // ["PROSHOP", "SPA"] or empty for all

  // Validity
  startDate         DateTime?
  endDate           DateTime?
  isActive          Boolean       @default(true)

  // Approval
  requiresApproval  Boolean       @default(false)
  approvalThreshold Decimal?      // Require approval if discount > this

  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt

  appliedDiscounts  AppliedDiscount[]

  @@map("discounts")
}

model AppliedDiscount {
  id                String              @id @default(uuid())

  // Can apply to line item OR transaction
  lineItemId        String?
  lineItem          BookingLineItem?    @relation(fields: [lineItemId], references: [id])
  transactionId     String?
  transaction       PaymentTransaction? @relation(fields: [transactionId], references: [id])

  discountId        String?             // Reference to preset discount
  discount          Discount?           @relation(fields: [discountId], references: [id])

  type              DiscountType
  value             Decimal             // Actual value applied (e.g., 10 for 10%)
  amount            Decimal             // Calculated discount amount in currency
  reason            String              // "Staff courtesy", "Price match", etc.

  // Approval tracking
  requiresApproval  Boolean             @default(false)
  approvedBy        String?
  approvedAt        DateTime?

  appliedBy         String
  appliedAt         DateTime            @default(now())

  @@map("applied_discounts")
}
```

**Step 2: Add relation to Club model**

Find the `Club` model and add the relation:

```prisma
model Club {
  // ... existing fields ...

  discounts         Discount[]
}
```

**Step 3: Add relation to BookingLineItem model**

Find the `BookingLineItem` model and add:

```prisma
model BookingLineItem {
  // ... existing fields ...

  appliedDiscounts  AppliedDiscount[]
}
```

**Step 4: Add relation to PaymentTransaction model**

Find the `PaymentTransaction` model and add:

```prisma
model PaymentTransaction {
  // ... existing fields ...

  appliedDiscounts  AppliedDiscount[]
}
```

**Step 5: Generate Prisma client**

Run:
```bash
cd database && pnpm prisma generate
```

**Step 6: Create migration**

Run:
```bash
cd database && pnpm prisma migrate dev --name add_discounts_system
```

Expected: Migration applied successfully

**Step 7: Commit**

```bash
git add database/prisma/schema.prisma database/prisma/migrations/
git commit -m "feat(db): add Discount and AppliedDiscount models

- Add DiscountType enum (PERCENTAGE, FIXED_AMOUNT)
- Add DiscountScope enum (LINE_ITEM, ORDER)
- Add Discount model with conditions, validity, approval settings
- Add AppliedDiscount model for tracking applied discounts
- Add relations to Club, BookingLineItem, PaymentTransaction"
```

---

### Task 2: Add Discount GraphQL Types

**Files:**
- Create: `/apps/api/src/graphql/pos/discount.types.ts`

**Step 1: Create the types file**

```typescript
import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';
import { DiscountType, DiscountScope } from '@prisma/client';

// Register enums
registerEnumType(DiscountType, {
  name: 'DiscountType',
  description: 'Type of discount calculation',
});

registerEnumType(DiscountScope, {
  name: 'DiscountScope',
  description: 'Scope of discount application',
});

@ObjectType()
export class DiscountObjectType {
  @Field(() => ID)
  id: string;

  @Field()
  clubId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  code?: string;

  @Field(() => DiscountType)
  type: DiscountType;

  @Field()
  value: number;

  @Field(() => DiscountScope)
  scope: DiscountScope;

  @Field({ nullable: true })
  minOrderAmount?: number;

  @Field({ nullable: true })
  maxDiscount?: number;

  @Field(() => [String])
  memberTiers: string[];

  @Field(() => [String])
  outlets: string[];

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field()
  isActive: boolean;

  @Field()
  requiresApproval: boolean;

  @Field({ nullable: true })
  approvalThreshold?: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class AppliedDiscountType {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  lineItemId?: string;

  @Field({ nullable: true })
  transactionId?: string;

  @Field({ nullable: true })
  discountId?: string;

  @Field(() => DiscountType)
  type: DiscountType;

  @Field()
  value: number;

  @Field()
  amount: number;

  @Field()
  reason: string;

  @Field()
  requiresApproval: boolean;

  @Field({ nullable: true })
  approvedBy?: string;

  @Field({ nullable: true })
  approvedAt?: Date;

  @Field()
  appliedBy: string;

  @Field()
  appliedAt: Date;
}

@ObjectType()
export class ApplyDiscountResult {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field(() => AppliedDiscountType, { nullable: true })
  appliedDiscount?: AppliedDiscountType;

  @Field({ nullable: true })
  newLineTotal?: number;

  @Field({ nullable: true })
  requiresApproval?: boolean;
}

@ObjectType()
export class DiscountPreview {
  @Field()
  originalAmount: number;

  @Field()
  discountAmount: number;

  @Field()
  newAmount: number;

  @Field()
  requiresApproval: boolean;

  @Field({ nullable: true })
  approvalReason?: string;
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/pos/
git commit -m "feat(api): add Discount GraphQL types

- Add DiscountObjectType for discount definitions
- Add AppliedDiscountType for tracking applied discounts
- Add ApplyDiscountResult for mutation responses
- Add DiscountPreview for discount calculations
- Register DiscountType and DiscountScope enums"
```

---

### Task 3: Add Discount GraphQL Inputs

**Files:**
- Create: `/apps/api/src/graphql/pos/discount.input.ts`

**Step 1: Create the inputs file**

```typescript
import { Field, ID, InputType } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsArray, Min, Max } from 'class-validator';
import { DiscountType, DiscountScope } from '@prisma/client';

@InputType()
export class CreateDiscountInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  code?: string;

  @Field(() => DiscountType)
  @IsEnum(DiscountType)
  type: DiscountType;

  @Field()
  @IsNumber()
  @Min(0)
  value: number;

  @Field(() => DiscountScope)
  @IsEnum(DiscountScope)
  scope: DiscountScope;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  memberTiers?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  outlets?: string[];

  @Field({ nullable: true })
  @IsOptional()
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  endDate?: Date;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  approvalThreshold?: number;
}

@InputType()
export class UpdateDiscountInput {
  @Field(() => ID)
  @IsString()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  code?: string;

  @Field(() => DiscountType, { nullable: true })
  @IsOptional()
  @IsEnum(DiscountType)
  type?: DiscountType;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  value?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  approvalThreshold?: number;
}

@InputType()
export class ApplyLineItemDiscountInput {
  @Field(() => ID)
  @IsString()
  lineItemId: string;

  @Field(() => DiscountType)
  @IsEnum(DiscountType)
  type: DiscountType;

  @Field()
  @IsNumber()
  @Min(0)
  value: number;

  @Field()
  @IsString()
  reason: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  discountId?: string;
}

@InputType()
export class ApplyOrderDiscountInput {
  @Field(() => ID)
  @IsString()
  teeTimePlayerId: string;

  @Field(() => DiscountType)
  @IsEnum(DiscountType)
  type: DiscountType;

  @Field()
  @IsNumber()
  @Min(0)
  value: number;

  @Field()
  @IsString()
  reason: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  discountId?: string;
}

@InputType()
export class ApproveDiscountInput {
  @Field(() => ID)
  @IsString()
  appliedDiscountId: string;

  @Field()
  @IsString()
  managerPin: string;
}

@InputType()
export class RemoveDiscountInput {
  @Field(() => ID)
  @IsString()
  appliedDiscountId: string;
}

@InputType()
export class PreviewDiscountInput {
  @Field()
  @IsNumber()
  @Min(0)
  originalAmount: number;

  @Field(() => DiscountType)
  @IsEnum(DiscountType)
  type: DiscountType;

  @Field()
  @IsNumber()
  @Min(0)
  value: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/pos/discount.input.ts
git commit -m "feat(api): add Discount GraphQL inputs

- Add CreateDiscountInput for creating preset discounts
- Add UpdateDiscountInput for modifying discounts
- Add ApplyLineItemDiscountInput for line item discounts
- Add ApplyOrderDiscountInput for order-level discounts
- Add ApproveDiscountInput for manager approval
- Add PreviewDiscountInput for calculating discount preview"
```

---

### Task 4: Create Discount Service

**Files:**
- Create: `/apps/api/src/graphql/pos/discount.service.ts`

**Step 1: Create the service**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DiscountType, DiscountScope, Prisma } from '@prisma/client';
import {
  CreateDiscountInput,
  UpdateDiscountInput,
  ApplyLineItemDiscountInput,
  ApplyOrderDiscountInput,
  PreviewDiscountInput,
} from './discount.input';

export interface DiscountCalculation {
  originalAmount: number;
  discountAmount: number;
  newAmount: number;
  requiresApproval: boolean;
  approvalReason?: string;
}

@Injectable()
export class DiscountService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Calculate discount amount based on type and value
   */
  calculateDiscount(
    originalAmount: number,
    type: DiscountType,
    value: number,
    maxDiscount?: number,
  ): DiscountCalculation {
    let discountAmount: number;

    if (type === DiscountType.PERCENTAGE) {
      discountAmount = (originalAmount * value) / 100;
    } else {
      discountAmount = value;
    }

    // Apply max discount cap if set
    if (maxDiscount && discountAmount > maxDiscount) {
      discountAmount = maxDiscount;
    }

    // Ensure discount doesn't exceed original amount
    if (discountAmount > originalAmount) {
      discountAmount = originalAmount;
    }

    const newAmount = originalAmount - discountAmount;

    // Check if approval is required (over 20% or over 500)
    const discountPercentage = (discountAmount / originalAmount) * 100;
    const requiresApproval = discountPercentage > 20 || discountAmount > 500;
    const approvalReason = requiresApproval
      ? `Discount exceeds ${discountPercentage > 20 ? '20%' : '฿500'} threshold`
      : undefined;

    return {
      originalAmount,
      discountAmount: Math.round(discountAmount * 100) / 100,
      newAmount: Math.round(newAmount * 100) / 100,
      requiresApproval,
      approvalReason,
    };
  }

  /**
   * Preview a discount without applying it
   */
  previewDiscount(input: PreviewDiscountInput): DiscountCalculation {
    return this.calculateDiscount(
      input.originalAmount,
      input.type,
      input.value,
      input.maxDiscount,
    );
  }

  /**
   * Get all discounts for a club
   */
  async getDiscounts(clubId: string, activeOnly = true) {
    const where: Prisma.DiscountWhereInput = { clubId };
    if (activeOnly) {
      where.isActive = true;
      where.OR = [
        { startDate: null },
        { startDate: { lte: new Date() } },
      ];
      where.AND = [
        {
          OR: [
            { endDate: null },
            { endDate: { gte: new Date() } },
          ],
        },
      ];
    }

    return this.prisma.discount.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get a single discount by ID
   */
  async getDiscount(id: string) {
    return this.prisma.discount.findUnique({ where: { id } });
  }

  /**
   * Create a new discount
   */
  async createDiscount(clubId: string, input: CreateDiscountInput) {
    return this.prisma.discount.create({
      data: {
        clubId,
        name: input.name,
        code: input.code,
        type: input.type,
        value: input.value,
        scope: input.scope,
        minOrderAmount: input.minOrderAmount,
        maxDiscount: input.maxDiscount,
        memberTiers: input.memberTiers || [],
        outlets: input.outlets || [],
        startDate: input.startDate,
        endDate: input.endDate,
        requiresApproval: input.requiresApproval || false,
        approvalThreshold: input.approvalThreshold,
      },
    });
  }

  /**
   * Update an existing discount
   */
  async updateDiscount(input: UpdateDiscountInput) {
    const { id, ...data } = input;
    return this.prisma.discount.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a discount (soft delete by setting isActive = false)
   */
  async deleteDiscount(id: string) {
    return this.prisma.discount.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Apply a discount to a line item
   */
  async applyLineItemDiscount(
    input: ApplyLineItemDiscountInput,
    appliedBy: string,
  ) {
    // Get the line item
    const lineItem = await this.prisma.bookingLineItem.findUnique({
      where: { id: input.lineItemId },
    });

    if (!lineItem) {
      return { success: false, error: 'Line item not found' };
    }

    // Calculate the discount
    const calculation = this.calculateDiscount(
      Number(lineItem.baseAmount),
      input.type,
      input.value,
    );

    // Create the applied discount
    const appliedDiscount = await this.prisma.appliedDiscount.create({
      data: {
        lineItemId: input.lineItemId,
        discountId: input.discountId,
        type: input.type,
        value: input.value,
        amount: calculation.discountAmount,
        reason: input.reason,
        requiresApproval: calculation.requiresApproval,
        appliedBy,
      },
    });

    return {
      success: true,
      appliedDiscount,
      newLineTotal: calculation.newAmount,
      requiresApproval: calculation.requiresApproval,
    };
  }

  /**
   * Remove an applied discount
   */
  async removeDiscount(appliedDiscountId: string) {
    await this.prisma.appliedDiscount.delete({
      where: { id: appliedDiscountId },
    });
    return { success: true };
  }

  /**
   * Approve a pending discount
   */
  async approveDiscount(appliedDiscountId: string, approvedBy: string) {
    const appliedDiscount = await this.prisma.appliedDiscount.update({
      where: { id: appliedDiscountId },
      data: {
        approvedBy,
        approvedAt: new Date(),
      },
    });
    return { success: true, appliedDiscount };
  }

  /**
   * Get applied discounts for a line item
   */
  async getLineItemDiscounts(lineItemId: string) {
    return this.prisma.appliedDiscount.findMany({
      where: { lineItemId },
      include: { discount: true },
    });
  }

  /**
   * Get applied discounts for a transaction
   */
  async getTransactionDiscounts(transactionId: string) {
    return this.prisma.appliedDiscount.findMany({
      where: { transactionId },
      include: { discount: true },
    });
  }

  /**
   * Get discount reasons (preset list)
   */
  getDiscountReasons(): string[] {
    return [
      'Staff courtesy',
      'Member loyalty',
      'Price match',
      'Manager discretion',
      'Damaged item',
      'Promotional offer',
      'Birthday discount',
      'VIP member',
      'Bulk purchase',
      'Other',
    ];
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/pos/discount.service.ts
git commit -m "feat(api): add DiscountService

- Add calculateDiscount for discount amount calculation
- Add previewDiscount for UI preview
- Add CRUD operations for preset discounts
- Add applyLineItemDiscount for applying discounts
- Add approval workflow for large discounts
- Add getDiscountReasons for preset reason list"
```

---

### Task 5: Create Discount Resolver

**Files:**
- Create: `/apps/api/src/graphql/pos/discount.resolver.ts`

**Step 1: Create the resolver**

```typescript
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { GqlCurrentUser } from '../../auth/gql-current-user.decorator';
import { DiscountService } from './discount.service';
import {
  DiscountObjectType,
  AppliedDiscountType,
  ApplyDiscountResult,
  DiscountPreview,
} from './discount.types';
import {
  CreateDiscountInput,
  UpdateDiscountInput,
  ApplyLineItemDiscountInput,
  ApproveDiscountInput,
  RemoveDiscountInput,
  PreviewDiscountInput,
} from './discount.input';

interface CurrentUser {
  id: string;
  clubId: string;
}

@Resolver()
@UseGuards(GqlAuthGuard)
export class DiscountResolver {
  constructor(private readonly discountService: DiscountService) {}

  // ─────────────────────────────────────────────────────────────
  // QUERIES
  // ─────────────────────────────────────────────────────────────

  @Query(() => [DiscountObjectType])
  async discounts(
    @GqlCurrentUser() user: CurrentUser,
    @Args('activeOnly', { nullable: true, defaultValue: true }) activeOnly: boolean,
  ) {
    return this.discountService.getDiscounts(user.clubId, activeOnly);
  }

  @Query(() => DiscountObjectType, { nullable: true })
  async discount(@Args('id') id: string) {
    return this.discountService.getDiscount(id);
  }

  @Query(() => [String])
  discountReasons() {
    return this.discountService.getDiscountReasons();
  }

  @Query(() => DiscountPreview)
  previewDiscount(@Args('input') input: PreviewDiscountInput) {
    return this.discountService.previewDiscount(input);
  }

  @Query(() => [AppliedDiscountType])
  async lineItemDiscounts(@Args('lineItemId') lineItemId: string) {
    return this.discountService.getLineItemDiscounts(lineItemId);
  }

  // ─────────────────────────────────────────────────────────────
  // MUTATIONS
  // ─────────────────────────────────────────────────────────────

  @Mutation(() => DiscountObjectType)
  async createDiscount(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: CreateDiscountInput,
  ) {
    return this.discountService.createDiscount(user.clubId, input);
  }

  @Mutation(() => DiscountObjectType)
  async updateDiscount(@Args('input') input: UpdateDiscountInput) {
    return this.discountService.updateDiscount(input);
  }

  @Mutation(() => DiscountObjectType)
  async deleteDiscount(@Args('id') id: string) {
    return this.discountService.deleteDiscount(id);
  }

  @Mutation(() => ApplyDiscountResult)
  async applyLineItemDiscount(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: ApplyLineItemDiscountInput,
  ) {
    return this.discountService.applyLineItemDiscount(input, user.id);
  }

  @Mutation(() => ApplyDiscountResult)
  async approveDiscount(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: ApproveDiscountInput,
  ) {
    // TODO: Verify manager PIN
    return this.discountService.approveDiscount(input.appliedDiscountId, user.id);
  }

  @Mutation(() => ApplyDiscountResult)
  async removeDiscount(@Args('input') input: RemoveDiscountInput) {
    return this.discountService.removeDiscount(input.appliedDiscountId);
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/pos/discount.resolver.ts
git commit -m "feat(api): add DiscountResolver

- Add discounts query for listing club discounts
- Add discount query for single discount
- Add discountReasons query for preset reasons
- Add previewDiscount query for calculation preview
- Add createDiscount mutation for preset discounts
- Add applyLineItemDiscount mutation
- Add approveDiscount mutation for manager approval
- Add removeDiscount mutation"
```

---

### Task 6: Create POS Module

**Files:**
- Create: `/apps/api/src/graphql/pos/pos.module.ts`

**Step 1: Create the module**

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { DiscountService } from './discount.service';
import { DiscountResolver } from './discount.resolver';

@Module({
  imports: [PrismaModule],
  providers: [
    DiscountService,
    DiscountResolver,
  ],
  exports: [DiscountService],
})
export class PosModule {}
```

**Step 2: Register in GraphQL module**

Modify `/apps/api/src/graphql/graphql.module.ts`:

Find the imports array and add:
```typescript
import { PosModule } from './pos/pos.module';

@Module({
  imports: [
    // ... existing imports ...
    PosModule,
  ],
})
```

**Step 3: Commit**

```bash
git add apps/api/src/graphql/pos/pos.module.ts apps/api/src/graphql/graphql.module.ts
git commit -m "feat(api): add PosModule and register in GraphQL

- Create PosModule with DiscountService and DiscountResolver
- Register PosModule in main GraphQL module"
```

---

### Task 7: Add Discount GraphQL Operations

**Files:**
- Create: `/packages/api-client/src/operations/pos.graphql`

**Step 1: Create the operations file**

```graphql
# ─────────────────────────────────────────────────────────────
# DISCOUNT QUERIES
# ─────────────────────────────────────────────────────────────

query GetDiscounts($activeOnly: Boolean) {
  discounts(activeOnly: $activeOnly) {
    id
    name
    code
    type
    value
    scope
    minOrderAmount
    maxDiscount
    memberTiers
    outlets
    startDate
    endDate
    isActive
    requiresApproval
    approvalThreshold
  }
}

query GetDiscount($id: String!) {
  discount(id: $id) {
    id
    name
    code
    type
    value
    scope
    minOrderAmount
    maxDiscount
    memberTiers
    outlets
    startDate
    endDate
    isActive
    requiresApproval
    approvalThreshold
  }
}

query GetDiscountReasons {
  discountReasons
}

query PreviewDiscount($input: PreviewDiscountInput!) {
  previewDiscount(input: $input) {
    originalAmount
    discountAmount
    newAmount
    requiresApproval
    approvalReason
  }
}

query GetLineItemDiscounts($lineItemId: String!) {
  lineItemDiscounts(lineItemId: $lineItemId) {
    id
    type
    value
    amount
    reason
    requiresApproval
    approvedBy
    approvedAt
    appliedBy
    appliedAt
  }
}

# ─────────────────────────────────────────────────────────────
# DISCOUNT MUTATIONS
# ─────────────────────────────────────────────────────────────

mutation CreateDiscount($input: CreateDiscountInput!) {
  createDiscount(input: $input) {
    id
    name
    code
    type
    value
    scope
    isActive
  }
}

mutation UpdateDiscount($input: UpdateDiscountInput!) {
  updateDiscount(input: $input) {
    id
    name
    code
    type
    value
    isActive
  }
}

mutation DeleteDiscount($id: String!) {
  deleteDiscount(id: $id) {
    id
    isActive
  }
}

mutation ApplyLineItemDiscount($input: ApplyLineItemDiscountInput!) {
  applyLineItemDiscount(input: $input) {
    success
    error
    appliedDiscount {
      id
      type
      value
      amount
      reason
      requiresApproval
    }
    newLineTotal
    requiresApproval
  }
}

mutation ApproveDiscount($input: ApproveDiscountInput!) {
  approveDiscount(input: $input) {
    success
    error
    appliedDiscount {
      id
      approvedBy
      approvedAt
    }
  }
}

mutation RemoveDiscount($input: RemoveDiscountInput!) {
  removeDiscount(input: $input) {
    success
    error
  }
}
```

**Step 2: Run codegen**

```bash
cd packages/api-client && pnpm codegen
```

Expected: Generated hooks in `src/hooks/generated.ts`

**Step 3: Export new hooks**

Modify `/packages/api-client/src/index.ts`, add to the hooks export section:

```typescript
// Discount hooks
useGetDiscountsQuery,
useInfiniteGetDiscountsQuery,
useGetDiscountQuery,
useInfiniteGetDiscountQuery,
useGetDiscountReasonsQuery,
useInfiniteGetDiscountReasonsQuery,
usePreviewDiscountQuery,
useInfinitePreviewDiscountQuery,
useGetLineItemDiscountsQuery,
useInfiniteGetLineItemDiscountsQuery,
useCreateDiscountMutation,
useUpdateDiscountMutation,
useDeleteDiscountMutation,
useApplyLineItemDiscountMutation,
useApproveDiscountMutation,
useRemoveDiscountMutation,
```

**Step 4: Commit**

```bash
git add packages/api-client/
git commit -m "feat(api-client): add Discount GraphQL operations

- Add GetDiscounts, GetDiscount, GetDiscountReasons queries
- Add PreviewDiscount, GetLineItemDiscounts queries
- Add CreateDiscount, UpdateDiscount, DeleteDiscount mutations
- Add ApplyLineItemDiscount, ApproveDiscount, RemoveDiscount mutations
- Generate and export TanStack Query hooks"
```

---

### Task 8: Create Discount Dialog Component

**Files:**
- Create: `/apps/application/src/components/golf/discount-dialog.tsx`

**Step 1: Create the component**

```typescript
'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@clubvantage/ui/primitives/dialog'
import { Button } from '@clubvantage/ui/primitives/button'
import { Input } from '@clubvantage/ui/primitives/input'
import { Label } from '@clubvantage/ui/primitives/label'
import { RadioGroup, RadioGroupItem } from '@clubvantage/ui/primitives/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@clubvantage/ui/primitives/select'
import { cn } from '@clubvantage/ui'
import { Percent, DollarSign, AlertTriangle, Loader2 } from 'lucide-react'
import {
  useGetDiscountReasonsQuery,
  usePreviewDiscountQuery,
  useApplyLineItemDiscountMutation,
} from '@clubvantage/api-client'
import { useQueryClient } from '@tanstack/react-query'

interface DiscountDialogProps {
  open: boolean
  onClose: () => void
  lineItemId: string
  lineItemDescription: string
  originalAmount: number
  onSuccess?: () => void
}

export function DiscountDialog({
  open,
  onClose,
  lineItemId,
  lineItemDescription,
  originalAmount,
  onSuccess,
}: DiscountDialogProps) {
  const queryClient = useQueryClient()
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE')
  const [value, setValue] = useState('')
  const [reason, setReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Fetch preset reasons
  const { data: reasonsData } = useGetDiscountReasonsQuery({})
  const reasons = reasonsData?.discountReasons || []

  // Calculate preview
  const numericValue = parseFloat(value) || 0
  const { data: previewData } = usePreviewDiscountQuery(
    {
      input: {
        originalAmount,
        type: discountType,
        value: numericValue,
      },
    },
    { enabled: numericValue > 0 }
  )
  const preview = previewData?.previewDiscount

  // Apply discount mutation
  const applyDiscount = useApplyLineItemDiscountMutation()

  const handleSubmit = useCallback(async () => {
    if (!value || !reason) {
      setError('Please enter a value and select a reason')
      return
    }

    const finalReason = reason === 'Other' ? customReason : reason

    try {
      setError(null)
      await applyDiscount.mutateAsync({
        input: {
          lineItemId,
          type: discountType,
          value: numericValue,
          reason: finalReason,
        },
      })

      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['teeTimeCarts'] })
      queryClient.invalidateQueries({ queryKey: ['slotCart'] })

      onSuccess?.()
      onClose()
    } catch (e: any) {
      setError(e.message || 'Failed to apply discount')
    }
  }, [
    lineItemId,
    discountType,
    value,
    numericValue,
    reason,
    customReason,
    applyDiscount,
    queryClient,
    onSuccess,
    onClose,
  ])

  const handleClose = useCallback(() => {
    setDiscountType('PERCENTAGE')
    setValue('')
    setReason('')
    setCustomReason('')
    setError(null)
    onClose()
  }, [onClose])

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Apply Discount</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Line item info */}
          <div className="text-sm text-muted-foreground">
            {lineItemDescription}
          </div>

          {/* Discount type */}
          <div className="space-y-2">
            <Label>Discount Type</Label>
            <RadioGroup
              value={discountType}
              onValueChange={(v) => setDiscountType(v as 'PERCENTAGE' | 'FIXED_AMOUNT')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="PERCENTAGE" id="percentage" />
                <Label htmlFor="percentage" className="flex items-center gap-1 cursor-pointer">
                  <Percent className="h-4 w-4" />
                  Percentage
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="FIXED_AMOUNT" id="fixed" />
                <Label htmlFor="fixed" className="flex items-center gap-1 cursor-pointer">
                  <DollarSign className="h-4 w-4" />
                  Fixed Amount
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Value input */}
          <div className="space-y-2">
            <Label htmlFor="value">Value</Label>
            <div className="relative">
              <Input
                id="value"
                type="number"
                min="0"
                max={discountType === 'PERCENTAGE' ? 100 : undefined}
                step={discountType === 'PERCENTAGE' ? 1 : 0.01}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="pr-8"
                placeholder={discountType === 'PERCENTAGE' ? '10' : '50.00'}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {discountType === 'PERCENTAGE' ? '%' : '฿'}
              </span>
            </div>
          </div>

          {/* Reason select */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom reason input */}
          {reason === 'Other' && (
            <div className="space-y-2">
              <Label htmlFor="customReason">Specify Reason</Label>
              <Input
                id="customReason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter custom reason"
              />
            </div>
          )}

          {/* Preview */}
          {preview && numericValue > 0 && (
            <div className="rounded-lg bg-muted p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Original:</span>
                <span>฿{originalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-red-600">
                <span>Discount:</span>
                <span>−฿{preview.discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t pt-1">
                <span>New Total:</span>
                <span>฿{preview.newAmount.toFixed(2)}</span>
              </div>

              {preview.requiresApproval && (
                <div className="flex items-center gap-2 text-amber-600 text-xs mt-2">
                  <AlertTriangle className="h-3 w-3" />
                  {preview.approvalReason}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!value || !reason || applyDiscount.isPending}
          >
            {applyDiscount.isPending && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            Apply Discount
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: Commit**

```bash
git add apps/application/src/components/golf/discount-dialog.tsx
git commit -m "feat(ui): add DiscountDialog component

- Add percentage and fixed amount discount types
- Add preset reason selection with custom option
- Add live preview with calculated amounts
- Add approval warning for large discounts
- Integrate with discount mutations"
```

---

### Task 9: Add Discount Button to Slot Card

**Files:**
- Modify: `/apps/application/src/components/golf/slot-card.tsx`

**Step 1: Add discount button to line items**

Import the discount dialog and icon:
```typescript
import { Percent } from 'lucide-react'
import { DiscountDialog } from './discount-dialog'
```

Add state for discount dialog:
```typescript
const [discountDialogOpen, setDiscountDialogOpen] = useState(false)
const [discountingItem, setDiscountingItem] = useState<{
  id: string
  description: string
  amount: number
} | null>(null)
```

Add handler:
```typescript
const handleOpenDiscount = useCallback((item: { id: string; description: string; totalAmount: number }) => {
  setDiscountingItem({
    id: item.id,
    description: item.description,
    amount: item.totalAmount,
  })
  setDiscountDialogOpen(true)
}, [])
```

Add discount button to line item row (next to transfer button):
```typescript
<button
  type="button"
  onClick={() => handleOpenDiscount(item)}
  disabled={item.isPaid}
  className="p-1 hover:bg-muted rounded disabled:opacity-50"
  title="Apply discount"
>
  <Percent className="h-4 w-4" />
</button>
```

Add dialog at component bottom:
```typescript
{discountDialogOpen && discountingItem && (
  <DiscountDialog
    open={discountDialogOpen}
    onClose={() => {
      setDiscountDialogOpen(false)
      setDiscountingItem(null)
    }}
    lineItemId={discountingItem.id}
    lineItemDescription={discountingItem.description}
    originalAmount={discountingItem.amount}
    onSuccess={() => {
      // Optionally trigger refresh
    }}
  />
)}
```

**Step 2: Commit**

```bash
git add apps/application/src/components/golf/slot-card.tsx
git commit -m "feat(ui): add discount button to slot card line items

- Add Percent icon button to line item actions
- Add discount dialog state management
- Integrate DiscountDialog component
- Disable discount for paid items"
```

---

### Task 10: Test Discounts System E2E

**Files:**
- No new files, just verification

**Step 1: Start the development server**

```bash
pnpm dev
```

**Step 2: Verify API is working**

Open GraphQL playground at `http://localhost:4000/graphql`

Run query:
```graphql
query {
  discountReasons
}
```

Expected: Returns list of discount reasons

**Step 3: Verify UI**

1. Navigate to Golf tee sheet
2. Click on a booked tee time
3. Open the shopping cart panel
4. Find a line item with the discount button (%)
5. Click the discount button
6. Verify the dialog opens with:
   - Percentage/Fixed Amount toggle
   - Value input
   - Reason dropdown
   - Preview calculation

**Step 4: Commit checkpoint**

```bash
git add .
git commit -m "chore: complete Discounts System (Part 1)

- Prisma models for Discount and AppliedDiscount
- GraphQL types, inputs, service, resolver
- API Client operations and generated hooks
- DiscountDialog UI component
- Integration with slot card"
```

---

## Part 2: Credit Limits

### Task 11: Add Credit Limit Fields to Member Model

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Step 1: Add credit limit fields to Member model**

Find the `Member` model and add:

```prisma
model Member {
  // ... existing fields ...

  // Credit Limit Settings
  creditLimit           Decimal?  @default(0)
  creditLimitEnabled    Boolean   @default(false)
  creditAlertThreshold  Int       @default(80)    // Alert at 80%
  creditBlockEnabled    Boolean   @default(true)  // Block when exceeded
  creditOverrideAllowed Boolean   @default(false) // Allow manager override

  creditLimitOverrides  CreditLimitOverride[]
}
```

**Step 2: Add CreditLimitOverride model**

```prisma
model CreditLimitOverride {
  id              String    @id @default(uuid())
  memberId        String
  member          Member    @relation(fields: [memberId], references: [id])

  previousLimit   Decimal
  newLimit        Decimal
  reason          String

  approvedBy      String
  approvedAt      DateTime  @default(now())
  expiresAt       DateTime? // Temporary increase

  isActive        Boolean   @default(true)

  @@map("credit_limit_overrides")
}
```

**Step 3: Generate and migrate**

```bash
cd database && pnpm prisma generate && pnpm prisma migrate dev --name add_credit_limits
```

**Step 4: Commit**

```bash
git add database/prisma/
git commit -m "feat(db): add credit limit fields to Member model

- Add creditLimit, creditLimitEnabled, creditAlertThreshold
- Add creditBlockEnabled, creditOverrideAllowed
- Add CreditLimitOverride model for temporary increases"
```

---

### Task 12: Add Credit Limit Service

**Files:**
- Create: `/apps/api/src/graphql/pos/credit-limit.service.ts`

**Step 1: Create the service**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface CreditCheckResult {
  allowed: boolean;
  currentBalance: number;
  creditLimit: number;
  availableCredit: number;
  chargeAmount: number;
  newBalance: number;
  usagePercent: number;
  warning?: 'APPROACHING_LIMIT' | 'EXCEEDED';
  shortfall?: number;
}

@Injectable()
export class CreditLimitService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check if a charge is allowed for a member
   */
  async checkCredit(memberId: string, chargeAmount: number): Promise<CreditCheckResult> {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      select: {
        creditLimit: true,
        creditLimitEnabled: true,
        creditAlertThreshold: true,
        creditBlockEnabled: true,
      },
    });

    if (!member || !member.creditLimitEnabled) {
      return {
        allowed: true,
        currentBalance: 0,
        creditLimit: 0,
        availableCredit: Infinity,
        chargeAmount,
        newBalance: chargeAmount,
        usagePercent: 0,
      };
    }

    // Get current balance from unpaid invoices
    const balanceResult = await this.prisma.invoice.aggregate({
      where: {
        memberId,
        status: { in: ['SENT', 'OVERDUE'] },
      },
      _sum: { totalAmount: true },
    });

    const currentBalance = Number(balanceResult._sum.totalAmount || 0);
    const creditLimit = Number(member.creditLimit || 0);
    const availableCredit = creditLimit - currentBalance;
    const newBalance = currentBalance + chargeAmount;
    const usagePercent = creditLimit > 0 ? (newBalance / creditLimit) * 100 : 0;

    const result: CreditCheckResult = {
      allowed: true,
      currentBalance,
      creditLimit,
      availableCredit,
      chargeAmount,
      newBalance,
      usagePercent: Math.round(usagePercent),
    };

    // Check if approaching limit
    if (usagePercent >= (member.creditAlertThreshold || 80) && usagePercent < 100) {
      result.warning = 'APPROACHING_LIMIT';
    }

    // Check if exceeded
    if (newBalance > creditLimit) {
      result.warning = 'EXCEEDED';
      result.shortfall = newBalance - creditLimit;

      if (member.creditBlockEnabled) {
        result.allowed = false;
      }
    }

    return result;
  }

  /**
   * Get credit status for a member (for display)
   */
  async getCreditStatus(memberId: string) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      select: {
        creditLimit: true,
        creditLimitEnabled: true,
        creditAlertThreshold: true,
        creditBlockEnabled: true,
        creditOverrideAllowed: true,
      },
    });

    if (!member || !member.creditLimitEnabled) {
      return null;
    }

    // Get current balance
    const balanceResult = await this.prisma.invoice.aggregate({
      where: {
        memberId,
        status: { in: ['SENT', 'OVERDUE'] },
      },
      _sum: { totalAmount: true },
    });

    const currentBalance = Number(balanceResult._sum.totalAmount || 0);
    const creditLimit = Number(member.creditLimit || 0);
    const availableCredit = creditLimit - currentBalance;
    const usagePercent = creditLimit > 0 ? (currentBalance / creditLimit) * 100 : 0;

    return {
      creditLimit,
      currentBalance,
      availableCredit,
      usagePercent: Math.round(usagePercent),
      alertThreshold: member.creditAlertThreshold,
      isBlocked: currentBalance >= creditLimit && member.creditBlockEnabled,
      overrideAllowed: member.creditOverrideAllowed,
    };
  }

  /**
   * Create a credit limit override
   */
  async createOverride(
    memberId: string,
    newLimit: number,
    reason: string,
    approvedBy: string,
    expiresAt?: Date,
  ) {
    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      select: { creditLimit: true },
    });

    if (!member) {
      throw new Error('Member not found');
    }

    // Create override record
    await this.prisma.creditLimitOverride.create({
      data: {
        memberId,
        previousLimit: member.creditLimit || 0,
        newLimit,
        reason,
        approvedBy,
        expiresAt,
      },
    });

    // Update member's credit limit
    await this.prisma.member.update({
      where: { id: memberId },
      data: { creditLimit: newLimit },
    });

    return { success: true };
  }

  /**
   * Update member credit settings
   */
  async updateCreditSettings(
    memberId: string,
    settings: {
      creditLimit?: number;
      creditLimitEnabled?: boolean;
      creditAlertThreshold?: number;
      creditBlockEnabled?: boolean;
      creditOverrideAllowed?: boolean;
    },
  ) {
    return this.prisma.member.update({
      where: { id: memberId },
      data: settings,
    });
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/pos/credit-limit.service.ts
git commit -m "feat(api): add CreditLimitService

- Add checkCredit for validating charges against limits
- Add getCreditStatus for displaying credit info
- Add createOverride for manager overrides
- Add updateCreditSettings for member settings"
```

---

### Task 13: Add Credit Limit Types and Resolver

**Files:**
- Create: `/apps/api/src/graphql/pos/credit-limit.types.ts`
- Create: `/apps/api/src/graphql/pos/credit-limit.resolver.ts`

**Step 1: Create types**

```typescript
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CreditCheckResultType {
  @Field()
  allowed: boolean;

  @Field()
  currentBalance: number;

  @Field()
  creditLimit: number;

  @Field()
  availableCredit: number;

  @Field()
  chargeAmount: number;

  @Field()
  newBalance: number;

  @Field()
  usagePercent: number;

  @Field({ nullable: true })
  warning?: string;

  @Field({ nullable: true })
  shortfall?: number;
}

@ObjectType()
export class CreditStatusType {
  @Field()
  creditLimit: number;

  @Field()
  currentBalance: number;

  @Field()
  availableCredit: number;

  @Field()
  usagePercent: number;

  @Field()
  alertThreshold: number;

  @Field()
  isBlocked: boolean;

  @Field()
  overrideAllowed: boolean;
}
```

**Step 2: Create resolver**

```typescript
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../auth/gql-auth.guard';
import { GqlCurrentUser } from '../../auth/gql-current-user.decorator';
import { CreditLimitService } from './credit-limit.service';
import { CreditCheckResultType, CreditStatusType } from './credit-limit.types';

@Resolver()
@UseGuards(GqlAuthGuard)
export class CreditLimitResolver {
  constructor(private readonly creditLimitService: CreditLimitService) {}

  @Query(() => CreditCheckResultType)
  async checkMemberCredit(
    @Args('memberId') memberId: string,
    @Args('chargeAmount') chargeAmount: number,
  ) {
    return this.creditLimitService.checkCredit(memberId, chargeAmount);
  }

  @Query(() => CreditStatusType, { nullable: true })
  async memberCreditStatus(@Args('memberId') memberId: string) {
    return this.creditLimitService.getCreditStatus(memberId);
  }

  @Mutation(() => Boolean)
  async createCreditOverride(
    @GqlCurrentUser() user: { id: string },
    @Args('memberId') memberId: string,
    @Args('newLimit') newLimit: number,
    @Args('reason') reason: string,
    @Args('expiresAt', { nullable: true }) expiresAt?: Date,
  ) {
    await this.creditLimitService.createOverride(
      memberId,
      newLimit,
      reason,
      user.id,
      expiresAt,
    );
    return true;
  }
}
```

**Step 3: Update POS module**

Add to `/apps/api/src/graphql/pos/pos.module.ts`:

```typescript
import { CreditLimitService } from './credit-limit.service';
import { CreditLimitResolver } from './credit-limit.resolver';

@Module({
  // ...
  providers: [
    // ... existing providers
    CreditLimitService,
    CreditLimitResolver,
  ],
  exports: [DiscountService, CreditLimitService],
})
```

**Step 4: Commit**

```bash
git add apps/api/src/graphql/pos/
git commit -m "feat(api): add CreditLimitResolver and types

- Add CreditCheckResultType for credit validation results
- Add CreditStatusType for member credit display
- Add checkMemberCredit query
- Add memberCreditStatus query
- Add createCreditOverride mutation
- Register in PosModule"
```

---

### Task 14: Add Credit Limit GraphQL Operations and Components

This follows the same pattern as discounts. Create operations in `pos.graphql`, run codegen, create UI components.

**Files to create:**
- Add to `/packages/api-client/src/operations/pos.graphql` - credit queries/mutations
- `/apps/application/src/components/golf/credit-limit-warning.tsx` - warning dialog
- `/apps/application/src/components/golf/credit-status-badge.tsx` - header indicator

**Step 1: Add operations to pos.graphql**

```graphql
# Credit Limit Queries
query CheckMemberCredit($memberId: String!, $chargeAmount: Float!) {
  checkMemberCredit(memberId: $memberId, chargeAmount: $chargeAmount) {
    allowed
    currentBalance
    creditLimit
    availableCredit
    chargeAmount
    newBalance
    usagePercent
    warning
    shortfall
  }
}

query GetMemberCreditStatus($memberId: String!) {
  memberCreditStatus(memberId: $memberId) {
    creditLimit
    currentBalance
    availableCredit
    usagePercent
    alertThreshold
    isBlocked
    overrideAllowed
  }
}

# Credit Limit Mutations
mutation CreateCreditOverride(
  $memberId: String!
  $newLimit: Float!
  $reason: String!
  $expiresAt: DateTime
) {
  createCreditOverride(
    memberId: $memberId
    newLimit: $newLimit
    reason: $reason
    expiresAt: $expiresAt
  )
}
```

**Step 2: Run codegen and export hooks**

```bash
cd packages/api-client && pnpm codegen
```

**Step 3: Commit**

```bash
git add packages/api-client/ apps/application/src/components/golf/
git commit -m "feat: add Credit Limits feature

- Add GraphQL operations for credit check and status
- Add credit override mutation
- Export generated hooks"
```

---

## Part 3-7: Remaining Features

The remaining features follow the same pattern:

1. **Cash Drawer** (Tasks 15-19)
   - Prisma: CashDrawer, CashDrawerShift, CashMovement models
   - Service: Open/close drawer, count cash, record movements
   - UI: Cash drawer panel, denomination counter

2. **EOD Settlement** (Tasks 20-24)
   - Prisma: DailySettlement, SettlementException models
   - Service: Calculate totals, process exceptions, close day
   - UI: Settlement dashboard, exception review

3. **Minimum Spend** (Tasks 25-29)
   - Prisma: MemberMinimum, MinimumSpendPeriod models
   - Service: Track spending, calculate shortfall, process month-end
   - UI: Spending progress, shortfall charges

4. **Sub-Accounts** (Tasks 30-34)
   - Prisma: SubAccount, SubAccountTransaction models
   - Service: PIN verification, permission checks, daily limits
   - UI: Sub-account selector, PIN dialog

5. **Stored Payments** (Tasks 35-39)
   - Prisma: StoredPaymentMethod, AutoPaySetting, AutoPayAttempt models
   - Service: Stripe integration, auto-pay processing
   - UI: Card management, auto-pay settings

Each feature will have approximately 5 tasks following the same structure:
1. Prisma models + migration
2. GraphQL types + inputs
3. Service layer
4. Resolver + module update
5. GraphQL operations + codegen + UI components

---

## Final Tasks

### Task 40: Verify All Features Work Together

**Step 1: Run full test suite**

```bash
pnpm test
```

**Step 2: Verify in development**

1. Start dev server: `pnpm dev`
2. Test each feature in the golf check-in flow
3. Verify credit limits trigger during member account charging
4. Verify discounts apply to line items
5. Verify cash drawer opens/closes
6. Verify EOD settlement calculates correctly

### Task 41: Create Seed Data

**Files:**
- Create: `/database/prisma/seeds/pos-seed.ts`

Add seed data for:
- Sample discounts (Staff courtesy, Member loyalty, etc.)
- Sample credit limits on test members
- Sample minimum spend requirements
- Sample sub-accounts

### Task 42: Documentation Update

**Files:**
- Update: `/docs/plans/2026-02-01-pos-phase1-ux-spec.md`

Mark implementation status for each feature.

---

## Summary

| Part | Feature | Tasks | Estimated Effort |
|------|---------|-------|------------------|
| 1 | Discounts System | 1-10 | 4-6 hours |
| 2 | Credit Limits | 11-14 | 2-3 hours |
| 3 | Cash Drawer | 15-19 | 3-4 hours |
| 4 | EOD Settlement | 20-24 | 4-5 hours |
| 5 | Minimum Spend | 25-29 | 3-4 hours |
| 6 | Sub-Accounts | 30-34 | 3-4 hours |
| 7 | Stored Payments | 35-39 | 4-5 hours |
| - | Final Tasks | 40-42 | 2-3 hours |

**Total: ~26-34 hours across 42 tasks**

---

## Appendix: File Reference

| Layer | Location Pattern |
|-------|------------------|
| Prisma Schema | `/database/prisma/schema.prisma` |
| GraphQL Types | `/apps/api/src/graphql/pos/*.types.ts` |
| GraphQL Inputs | `/apps/api/src/graphql/pos/*.input.ts` |
| Services | `/apps/api/src/graphql/pos/*.service.ts` |
| Resolvers | `/apps/api/src/graphql/pos/*.resolver.ts` |
| Module | `/apps/api/src/graphql/pos/pos.module.ts` |
| Operations | `/packages/api-client/src/operations/pos.graphql` |
| Generated Hooks | `/packages/api-client/src/hooks/generated.ts` |
| UI Components | `/apps/application/src/components/golf/*.tsx` |
