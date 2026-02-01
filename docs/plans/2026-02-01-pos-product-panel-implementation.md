# POS Product Panel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a complete Micros-style POS product panel with unified product catalog, outlet-specific layouts, conditional visibility, and smart suggestions.

**Architecture:** Unified Product model supporting retail/F&B/services, hierarchical configuration (templates → outlets → products), real-time visibility rules, analytics-driven suggestions. Uses existing Prisma/NestJS/GraphQL patterns.

**Tech Stack:** Prisma (PostgreSQL), NestJS GraphQL API, React/Next.js, @clubvantage/ui components

**Design Doc:** `docs/plans/2026-02-01-pos-product-panel-design.md`

---

## Task 1: Prisma Schema - Core Product Models

**Files:**
- Modify: `database/prisma/schema.prisma`

**Step 1: Add ProductType enum after existing enums (around line 2090)**

Add after the `DiscountScope` enum:

```prisma
// =============================================================================
// PRODUCT CATALOG
// =============================================================================

enum ProductType {
  SIMPLE      // Add to cart immediately
  VARIABLE    // Show variant picker
  SERVICE     // May trigger booking flow
  COMPOSITE   // Bundle/combo
}
```

**Step 2: Add ProductCategory model**

Add after the enum:

```prisma
model ProductCategory {
  id          String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId      String            @db.Uuid
  parentId    String?           @db.Uuid

  name        String            @db.VarChar(100)
  description String?           @db.VarChar(500)
  color       String?           @db.VarChar(7)  // Hex color for POS button
  iconName    String?           @db.VarChar(50) // Lucide icon name

  sortOrder   Int               @default(0)
  isActive    Boolean           @default(true)
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  club        Club              @relation(fields: [clubId], references: [id], onDelete: Cascade)
  parent      ProductCategory?  @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    ProductCategory[] @relation("CategoryHierarchy")
  products    Product[]
  outletCategoryConfigs OutletCategoryConfig[]

  @@index([clubId])
  @@index([clubId, parentId])
  @@index([clubId, isActive])
  @@map("product_categories")
}
```

**Step 3: Add Product model**

```prisma
model Product {
  id                   String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId               String           @db.Uuid
  categoryId           String           @db.Uuid

  name                 String           @db.VarChar(200)
  description          String?          @db.VarChar(1000)
  sku                  String?          @db.VarChar(50)
  productType          ProductType      @default(SIMPLE)

  // Pricing
  basePrice            Decimal          @db.Decimal(10, 2)
  costPrice            Decimal?         @db.Decimal(10, 2)
  taxRate              Decimal          @default(0) @db.Decimal(5, 2)
  taxType              TaxType          @default(ADD)

  // Service-specific (null for retail)
  durationMinutes      Int?
  bufferMinutes        Int?             @default(0)
  requiredCapabilities String[]         @default([])

  // Inventory (null for services)
  trackInventory       Boolean          @default(false)
  stockQuantity        Int?
  lowStockThreshold    Int?

  // Display
  imageUrl             String?          @db.VarChar(500)
  thumbnailUrl         String?          @db.VarChar(500)
  sortPriority         Int              @default(50)

  // Status
  isActive             Boolean          @default(true)
  createdAt            DateTime         @default(now())
  updatedAt            DateTime         @updatedAt

  // Relations
  club                 Club             @relation(fields: [clubId], references: [id], onDelete: Cascade)
  category             ProductCategory  @relation(fields: [categoryId], references: [id])
  variants             ProductVariant[]
  modifierGroups       ProductModifierGroup[]
  outletConfigs        OutletProductConfig[]
  salesMetrics         ProductSalesMetric[]
  staffUsage           StaffProductUsage[]

  @@unique([clubId, sku])
  @@index([clubId])
  @@index([clubId, categoryId])
  @@index([clubId, isActive])
  @@index([clubId, productType])
  @@map("products")
}
```

**Step 4: Add ProductVariant model**

```prisma
model ProductVariant {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  productId       String   @db.Uuid

  name            String   @db.VarChar(100)
  sku             String?  @db.VarChar(50)
  priceAdjustment Decimal  @default(0) @db.Decimal(10, 2)
  attributes      Json     @default("{}")

  stockQuantity   Int?
  imageUrl        String?  @db.VarChar(500)
  sortOrder       Int      @default(0)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  product         Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
  @@map("product_variants")
}
```

**Step 5: Add relation to Club model**

Find the Club model (around line 14) and add these relations:

```prisma
  // Add to Club model relations section
  productCategories    ProductCategory[]
  products             Product[]
  modifierGroups       ModifierGroup[]
```

**Step 6: Run migration**

```bash
cd database
npx prisma migrate dev --name add_unified_product_models
```

Expected: Migration creates `product_categories`, `products`, `product_variants` tables.

**Step 7: Generate Prisma client**

```bash
npx prisma generate
```

**Step 8: Commit**

```bash
git add database/prisma/schema.prisma database/prisma/migrations/
git commit -m "feat(schema): add unified Product, ProductCategory, ProductVariant models"
```

---

## Task 2: Prisma Schema - Modifiers

**Files:**
- Modify: `database/prisma/schema.prisma`

**Step 1: Add ModifierSelectionType enum**

Add after `ProductType` enum:

```prisma
enum ModifierSelectionType {
  SINGLE    // Pick one (cooking temperature)
  MULTIPLE  // Pick many (toppings)
}
```

**Step 2: Add ModifierGroup model**

```prisma
model ModifierGroup {
  id            String                @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId        String                @db.Uuid

  name          String                @db.VarChar(100)
  selectionType ModifierSelectionType @default(SINGLE)
  minSelections Int                   @default(0)
  maxSelections Int?

  sortOrder     Int                   @default(0)
  isActive      Boolean               @default(true)
  createdAt     DateTime              @default(now())
  updatedAt     DateTime              @updatedAt

  club          Club                  @relation(fields: [clubId], references: [id], onDelete: Cascade)
  modifiers     Modifier[]
  productLinks  ProductModifierGroup[]

  @@index([clubId])
  @@map("modifier_groups")
}
```

**Step 3: Add Modifier model**

```prisma
model Modifier {
  id              String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  groupId         String        @db.Uuid

  name            String        @db.VarChar(100)
  priceAdjustment Decimal       @default(0) @db.Decimal(10, 2)
  isDefault       Boolean       @default(false)

  sortOrder       Int           @default(0)
  isActive        Boolean       @default(true)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  group           ModifierGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@index([groupId])
  @@map("modifiers")
}
```

**Step 4: Add ProductModifierGroup junction model**

```prisma
model ProductModifierGroup {
  id              String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  productId       String        @db.Uuid
  modifierGroupId String        @db.Uuid

  isRequired      Boolean       @default(false)
  sortOrder       Int           @default(0)

  product         Product       @relation(fields: [productId], references: [id], onDelete: Cascade)
  modifierGroup   ModifierGroup @relation(fields: [modifierGroupId], references: [id], onDelete: Cascade)

  @@unique([productId, modifierGroupId])
  @@index([productId])
  @@map("product_modifier_groups")
}
```

**Step 5: Run migration**

```bash
cd database
npx prisma migrate dev --name add_modifier_models
```

**Step 6: Generate Prisma client**

```bash
npx prisma generate
```

**Step 7: Commit**

```bash
git add database/prisma/schema.prisma database/prisma/migrations/
git commit -m "feat(schema): add ModifierGroup, Modifier, ProductModifierGroup models"
```

---

## Task 3: Prisma Schema - Outlet Configuration

**Files:**
- Modify: `database/prisma/schema.prisma`

**Step 1: Add grid config enums**

Add after `ModifierSelectionType`:

```prisma
enum TileSize {
  SMALL
  MEDIUM
  LARGE
}

enum CategoryDisplayStyle {
  TABS
  SIDEBAR
  DROPDOWN
}

enum QuickKeysPosition {
  TOP
  LEFT
}

enum SuggestionPosition {
  TOP_ROW
  SIDEBAR
  FLOATING
}

enum InventoryVisibilityRule {
  ALWAYS_SHOW
  HIDE_WHEN_ZERO
  SHOW_DISABLED
}
```

**Step 2: Add OutletProductConfig model**

```prisma
model OutletProductConfig {
  id           String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  outletId     String    @db.Uuid
  productId    String    @db.Uuid
  categoryId   String?   @db.Uuid

  displayName  String?   @db.VarChar(100)
  buttonColor  String?   @db.VarChar(7)
  sortPriority Int?
  gridPosition Json?

  isVisible       Boolean @default(true)
  visibilityRules Json    @default("{}")

  isQuickKey       Boolean @default(false)
  quickKeyPosition Int?

  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  outlet       POSOutlet @relation(fields: [outletId], references: [id], onDelete: Cascade)
  product      Product   @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([outletId, productId])
  @@index([outletId])
  @@index([outletId, isVisible])
  @@index([outletId, isQuickKey])
  @@map("outlet_product_configs")
}
```

**Step 3: Add OutletCategoryConfig model**

```prisma
model OutletCategoryConfig {
  id            String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  outletId      String          @db.Uuid
  categoryId    String          @db.Uuid

  isVisible     Boolean         @default(true)
  sortOrder     Int?
  colorOverride String?         @db.VarChar(7)

  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  outlet        POSOutlet       @relation(fields: [outletId], references: [id], onDelete: Cascade)
  category      ProductCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@unique([outletId, categoryId])
  @@index([outletId])
  @@map("outlet_category_configs")
}
```

**Step 4: Add OutletGridConfig model**

```prisma
model OutletGridConfig {
  id                String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  outletId          String               @unique @db.Uuid

  gridColumns       Int                  @default(6)
  gridRows          Int                  @default(4)
  tileSize          TileSize             @default(MEDIUM)
  showImages        Boolean              @default(true)
  showPrices        Boolean              @default(true)

  categoryStyle     CategoryDisplayStyle @default(TABS)
  showAllCategory   Boolean              @default(true)

  quickKeysEnabled  Boolean              @default(true)
  quickKeysCount    Int                  @default(8)
  quickKeysPosition QuickKeysPosition    @default(TOP)

  createdAt         DateTime             @default(now())
  updatedAt         DateTime             @updatedAt

  outlet            POSOutlet            @relation(fields: [outletId], references: [id], onDelete: Cascade)

  @@map("outlet_grid_configs")
}
```

**Step 5: Update POSOutlet model relations**

Find the `POSOutlet` model and add these relations:

```prisma
  // Add to POSOutlet model
  productConfigs    OutletProductConfig[]
  categoryConfigs   OutletCategoryConfig[]
  gridConfig        OutletGridConfig?
  salesMetrics      ProductSalesMetric[]
  staffUsage        StaffProductUsage[]
  suggestionConfig  SmartSuggestionConfig?
```

**Step 6: Run migration**

```bash
cd database
npx prisma migrate dev --name add_outlet_config_models
```

**Step 7: Generate Prisma client**

```bash
npx prisma generate
```

**Step 8: Commit**

```bash
git add database/prisma/schema.prisma database/prisma/migrations/
git commit -m "feat(schema): add OutletProductConfig, OutletCategoryConfig, OutletGridConfig"
```

---

## Task 4: Prisma Schema - Smart Suggestions

**Files:**
- Modify: `database/prisma/schema.prisma`

**Step 1: Add ProductSalesMetric model**

```prisma
model ProductSalesMetric {
  id               String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  productId        String    @db.Uuid
  outletId         String    @db.Uuid
  date             DateTime  @db.Date

  quantitySold     Int       @default(0)
  revenue          Decimal   @default(0) @db.Decimal(12, 2)
  transactionCount Int       @default(0)
  salesByHour      Json      @default("{}")

  updatedAt        DateTime  @updatedAt

  product          Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  outlet           POSOutlet @relation(fields: [outletId], references: [id], onDelete: Cascade)

  @@unique([productId, outletId, date])
  @@index([outletId, date])
  @@index([productId, date])
  @@map("product_sales_metrics")
}
```

**Step 2: Add StaffProductUsage model**

```prisma
model StaffProductUsage {
  id         String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  staffId    String    @db.Uuid
  productId  String    @db.Uuid
  outletId   String    @db.Uuid

  usageCount Int       @default(0)
  lastUsedAt DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  staff      Staff     @relation(fields: [staffId], references: [id], onDelete: Cascade)
  product    Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  outlet     POSOutlet @relation(fields: [outletId], references: [id], onDelete: Cascade)

  @@unique([staffId, productId, outletId])
  @@index([staffId, outletId])
  @@index([outletId])
  @@map("staff_product_usage")
}
```

**Step 3: Add SmartSuggestionConfig model**

```prisma
model SmartSuggestionConfig {
  id                     String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  outletId               String             @unique @db.Uuid

  enabled                Boolean            @default(true)
  suggestionCount        Int                @default(6)
  position               SuggestionPosition @default(TOP_ROW)

  timeOfDayWeight        Int                @default(40)
  salesVelocityWeight    Int                @default(35)
  staffHistoryWeight     Int                @default(25)

  refreshIntervalMinutes Int                @default(30)

  createdAt              DateTime           @default(now())
  updatedAt              DateTime           @updatedAt

  outlet                 POSOutlet          @relation(fields: [outletId], references: [id], onDelete: Cascade)

  @@map("smart_suggestion_configs")
}
```

**Step 4: Add relation to Staff model**

Find the `Staff` model and add:

```prisma
  // Add to Staff model
  productUsage      StaffProductUsage[]
```

**Step 5: Run migration**

```bash
cd database
npx prisma migrate dev --name add_smart_suggestion_models
```

**Step 6: Generate Prisma client**

```bash
npx prisma generate
```

**Step 7: Commit**

```bash
git add database/prisma/schema.prisma database/prisma/migrations/
git commit -m "feat(schema): add ProductSalesMetric, StaffProductUsage, SmartSuggestionConfig"
```

---

## Task 5: Data Migration Script

**Files:**
- Create: `database/prisma/migrations/migrate-proshop-to-products.ts`

**Step 1: Create migration script**

```typescript
/**
 * Data migration: ProshopProduct -> Product
 *
 * Run with: npx ts-node database/prisma/migrations/migrate-proshop-to-products.ts
 */

import { PrismaClient, ProductType, TaxType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration: ProshopProduct -> Product');

  // Get all clubs
  const clubs = await prisma.club.findMany();

  for (const club of clubs) {
    console.log(`\nMigrating club: ${club.name}`);

    // 1. Migrate ProshopCategory -> ProductCategory
    const oldCategories = await prisma.proshopCategory.findMany({
      where: { clubId: club.id },
    });

    const categoryIdMap = new Map<string, string>();

    for (const oldCat of oldCategories) {
      const newCat = await prisma.productCategory.create({
        data: {
          clubId: oldCat.clubId,
          name: oldCat.name,
          description: oldCat.description,
          sortOrder: oldCat.sortOrder,
          isActive: oldCat.isActive,
        },
      });
      categoryIdMap.set(oldCat.id, newCat.id);
      console.log(`  Category: ${oldCat.name} -> ${newCat.id}`);
    }

    // 2. Migrate ProshopProduct -> Product
    const oldProducts = await prisma.proshopProduct.findMany({
      where: { clubId: club.id },
      include: { variants: true },
    });

    for (const oldProd of oldProducts) {
      const newCategoryId = categoryIdMap.get(oldProd.categoryId);
      if (!newCategoryId) {
        console.warn(`  Skipping product ${oldProd.name}: category not found`);
        continue;
      }

      const hasVariants = oldProd.variants.length > 0;

      const newProd = await prisma.product.create({
        data: {
          clubId: oldProd.clubId,
          categoryId: newCategoryId,
          name: oldProd.name,
          description: oldProd.description,
          sku: oldProd.sku,
          productType: hasVariants ? ProductType.VARIABLE : ProductType.SIMPLE,
          basePrice: oldProd.price,
          taxRate: oldProd.taxRate,
          taxType: oldProd.taxType,
          isActive: oldProd.isActive,
          sortPriority: oldProd.isQuickAdd ? 10 : 50,
        },
      });

      console.log(`  Product: ${oldProd.name} -> ${newProd.id}`);

      // 3. Migrate variants
      for (const oldVar of oldProd.variants) {
        await prisma.productVariant.create({
          data: {
            productId: newProd.id,
            name: oldVar.name,
            sku: oldVar.sku,
            priceAdjustment: oldVar.priceAdjustment,
          },
        });
      }
    }

    // 4. Create default OutletProductConfig for each outlet
    const outlets = await prisma.pOSOutlet.findMany({
      where: { clubId: club.id },
    });

    const products = await prisma.product.findMany({
      where: { clubId: club.id },
    });

    for (const outlet of outlets) {
      for (const product of products) {
        await prisma.outletProductConfig.create({
          data: {
            outletId: outlet.id,
            productId: product.id,
            isVisible: true,
            isQuickKey: product.sortPriority <= 10,
          },
        });
      }

      // Create default grid config
      await prisma.outletGridConfig.create({
        data: {
          outletId: outlet.id,
        },
      });

      // Create default suggestion config
      await prisma.smartSuggestionConfig.create({
        data: {
          outletId: outlet.id,
        },
      });
    }
  }

  console.log('\nMigration complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Step 2: Run migration script (optional - only if data exists)**

```bash
cd database
npx ts-node prisma/migrations/migrate-proshop-to-products.ts
```

**Step 3: Commit**

```bash
git add database/prisma/migrations/migrate-proshop-to-products.ts
git commit -m "feat(migration): add script to migrate ProshopProduct to unified Product"
```

---

## Task 6: GraphQL Types - Products

**Files:**
- Create: `apps/api/src/graphql/products/product.types.ts`

**Step 1: Create the types file**

```typescript
import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { ProductType, TaxType, ModifierSelectionType } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';

// Register enums
registerEnumType(ProductType, { name: 'ProductType' });
registerEnumType(ModifierSelectionType, { name: 'ModifierSelectionType' });

@ObjectType('ProductCategory')
export class ProductCategoryType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  iconName?: string;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  isActive: boolean;

  @Field(() => ID, { nullable: true })
  parentId?: string;

  @Field(() => [ProductCategoryType], { nullable: true })
  children?: ProductCategoryType[];

  @Field(() => Int, { nullable: true })
  productCount?: number;
}

@ObjectType('ProductVariant')
export class ProductVariantType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  sku?: string;

  @Field(() => Float)
  priceAdjustment: number;

  @Field(() => GraphQLJSON, { nullable: true })
  attributes?: Record<string, string>;

  @Field(() => Int, { nullable: true })
  stockQuantity?: number;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  isActive: boolean;
}

@ObjectType('Modifier')
export class ModifierType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Float)
  priceAdjustment: number;

  @Field()
  isDefault: boolean;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  isActive: boolean;
}

@ObjectType('ModifierGroup')
export class ModifierGroupType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => ModifierSelectionType)
  selectionType: ModifierSelectionType;

  @Field(() => Int)
  minSelections: number;

  @Field(() => Int, { nullable: true })
  maxSelections?: number;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  isActive: boolean;

  @Field(() => [ModifierType])
  modifiers: ModifierType[];
}

@ObjectType('Product')
export class ProductTypeGql {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  sku?: string;

  @Field(() => ProductType)
  productType: ProductType;

  @Field(() => Float)
  basePrice: number;

  @Field(() => Float, { nullable: true })
  costPrice?: number;

  @Field(() => Float)
  taxRate: number;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field(() => Int)
  sortPriority: number;

  @Field()
  isActive: boolean;

  // Service-specific
  @Field(() => Int, { nullable: true })
  durationMinutes?: number;

  @Field(() => Int, { nullable: true })
  bufferMinutes?: number;

  // Inventory
  @Field()
  trackInventory: boolean;

  @Field(() => Int, { nullable: true })
  stockQuantity?: number;

  @Field(() => Int, { nullable: true })
  lowStockThreshold?: number;

  // Relations
  @Field(() => ProductCategoryType)
  category: ProductCategoryType;

  @Field(() => [ProductVariantType])
  variants: ProductVariantType[];

  @Field(() => [ModifierGroupType])
  modifierGroups: ModifierGroupType[];

  // Computed
  @Field()
  hasVariants: boolean;

  @Field()
  hasModifiers: boolean;

  @Field()
  isInStock: boolean;
}

@ObjectType('ProductEdge')
export class ProductEdgeType {
  @Field(() => ProductTypeGql)
  node: ProductTypeGql;

  @Field()
  cursor: string;
}

@ObjectType('ProductConnection')
export class ProductConnectionType {
  @Field(() => [ProductEdgeType])
  edges: ProductEdgeType[];

  @Field(() => Int)
  totalCount: number;

  @Field()
  hasNextPage: boolean;

  @Field()
  hasPreviousPage: boolean;
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/products/
git commit -m "feat(api): add GraphQL types for Product, ProductCategory, Modifiers"
```

---

## Task 7: GraphQL Types - Outlet Config

**Files:**
- Create: `apps/api/src/graphql/products/outlet-config.types.ts`

**Step 1: Create outlet config types**

```typescript
import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import {
  TileSize,
  CategoryDisplayStyle,
  QuickKeysPosition,
  SuggestionPosition,
} from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';
import { ProductTypeGql } from './product.types';

// Register enums
registerEnumType(TileSize, { name: 'TileSize' });
registerEnumType(CategoryDisplayStyle, { name: 'CategoryDisplayStyle' });
registerEnumType(QuickKeysPosition, { name: 'QuickKeysPosition' });
registerEnumType(SuggestionPosition, { name: 'SuggestionPosition' });

@ObjectType('OutletProductConfig')
export class OutletProductConfigType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  outletId: string;

  @Field(() => ID)
  productId: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  buttonColor?: string;

  @Field(() => Int, { nullable: true })
  sortPriority?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  gridPosition?: { row: number; col: number };

  @Field()
  isVisible: boolean;

  @Field(() => GraphQLJSON)
  visibilityRules: Record<string, any>;

  @Field()
  isQuickKey: boolean;

  @Field(() => Int, { nullable: true })
  quickKeyPosition?: number;

  @Field(() => ProductTypeGql, { nullable: true })
  product?: ProductTypeGql;
}

@ObjectType('OutletCategoryConfig')
export class OutletCategoryConfigType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  outletId: string;

  @Field(() => ID)
  categoryId: string;

  @Field()
  isVisible: boolean;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;

  @Field({ nullable: true })
  colorOverride?: string;
}

@ObjectType('OutletGridConfig')
export class OutletGridConfigType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  outletId: string;

  @Field(() => Int)
  gridColumns: number;

  @Field(() => Int)
  gridRows: number;

  @Field(() => TileSize)
  tileSize: TileSize;

  @Field()
  showImages: boolean;

  @Field()
  showPrices: boolean;

  @Field(() => CategoryDisplayStyle)
  categoryStyle: CategoryDisplayStyle;

  @Field()
  showAllCategory: boolean;

  @Field()
  quickKeysEnabled: boolean;

  @Field(() => Int)
  quickKeysCount: number;

  @Field(() => QuickKeysPosition)
  quickKeysPosition: QuickKeysPosition;
}

@ObjectType('SmartSuggestionConfig')
export class SmartSuggestionConfigType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  outletId: string;

  @Field()
  enabled: boolean;

  @Field(() => Int)
  suggestionCount: number;

  @Field(() => SuggestionPosition)
  position: SuggestionPosition;

  @Field(() => Int)
  timeOfDayWeight: number;

  @Field(() => Int)
  salesVelocityWeight: number;

  @Field(() => Int)
  staffHistoryWeight: number;

  @Field(() => Int)
  refreshIntervalMinutes: number;
}

@ObjectType('OutletProductPanel')
export class OutletProductPanelType {
  @Field(() => OutletGridConfigType)
  gridConfig: OutletGridConfigType;

  @Field(() => SmartSuggestionConfigType, { nullable: true })
  suggestionConfig?: SmartSuggestionConfigType;

  @Field(() => [ProductTypeGql])
  quickKeys: ProductTypeGql[];

  @Field(() => [ProductTypeGql])
  suggestions: ProductTypeGql[];
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/products/outlet-config.types.ts
git commit -m "feat(api): add GraphQL types for OutletProductConfig, GridConfig, SuggestionConfig"
```

---

## Task 8: GraphQL Inputs - Products

**Files:**
- Create: `apps/api/src/graphql/products/product.input.ts`

**Step 1: Create input types**

```typescript
import { InputType, Field, ID, Float, Int, PartialType } from '@nestjs/graphql';
import { ProductType, ModifierSelectionType } from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';

// ============================================================================
// CATEGORY INPUTS
// ============================================================================

@InputType()
export class CreateProductCategoryInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  color?: string;

  @Field({ nullable: true })
  iconName?: string;

  @Field(() => ID, { nullable: true })
  parentId?: string;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;
}

@InputType()
export class UpdateProductCategoryInput extends PartialType(CreateProductCategoryInput) {
  @Field({ nullable: true })
  isActive?: boolean;
}

// ============================================================================
// PRODUCT INPUTS
// ============================================================================

@InputType()
export class CreateProductVariantInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  sku?: string;

  @Field(() => Float, { nullable: true })
  priceAdjustment?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  attributes?: Record<string, string>;

  @Field(() => Int, { nullable: true })
  stockQuantity?: number;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;
}

@InputType()
export class CreateProductInput {
  @Field(() => ID)
  categoryId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  sku?: string;

  @Field(() => ProductType, { nullable: true })
  productType?: ProductType;

  @Field(() => Float)
  basePrice: number;

  @Field(() => Float, { nullable: true })
  costPrice?: number;

  @Field(() => Float, { nullable: true })
  taxRate?: number;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field({ nullable: true })
  thumbnailUrl?: string;

  @Field(() => Int, { nullable: true })
  sortPriority?: number;

  // Service-specific
  @Field(() => Int, { nullable: true })
  durationMinutes?: number;

  @Field(() => Int, { nullable: true })
  bufferMinutes?: number;

  @Field(() => [String], { nullable: true })
  requiredCapabilities?: string[];

  // Inventory
  @Field({ nullable: true })
  trackInventory?: boolean;

  @Field(() => Int, { nullable: true })
  stockQuantity?: number;

  @Field(() => Int, { nullable: true })
  lowStockThreshold?: number;

  // Variants (for VARIABLE products)
  @Field(() => [CreateProductVariantInput], { nullable: true })
  variants?: CreateProductVariantInput[];

  // Modifier group IDs to link
  @Field(() => [ID], { nullable: true })
  modifierGroupIds?: string[];
}

@InputType()
export class UpdateProductInput extends PartialType(CreateProductInput) {
  @Field({ nullable: true })
  isActive?: boolean;
}

@InputType()
export class ProductFilterInput {
  @Field(() => ID, { nullable: true })
  categoryId?: string;

  @Field({ nullable: true })
  search?: string;

  @Field(() => ProductType, { nullable: true })
  productType?: ProductType;

  @Field({ nullable: true })
  isActive?: boolean;

  @Field({ nullable: true })
  trackInventory?: boolean;

  @Field(() => Int, { nullable: true })
  first?: number;

  @Field({ nullable: true })
  after?: string;
}

// ============================================================================
// MODIFIER INPUTS
// ============================================================================

@InputType()
export class CreateModifierInput {
  @Field()
  name: string;

  @Field(() => Float, { nullable: true })
  priceAdjustment?: number;

  @Field({ nullable: true })
  isDefault?: boolean;

  @Field(() => Int, { nullable: true })
  sortOrder?: number;
}

@InputType()
export class CreateModifierGroupInput {
  @Field()
  name: string;

  @Field(() => ModifierSelectionType, { nullable: true })
  selectionType?: ModifierSelectionType;

  @Field(() => Int, { nullable: true })
  minSelections?: number;

  @Field(() => Int, { nullable: true })
  maxSelections?: number;

  @Field(() => [CreateModifierInput], { nullable: true })
  modifiers?: CreateModifierInput[];
}

@InputType()
export class UpdateModifierGroupInput extends PartialType(CreateModifierGroupInput) {
  @Field({ nullable: true })
  isActive?: boolean;
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/products/product.input.ts
git commit -m "feat(api): add GraphQL input types for Products, Categories, Modifiers"
```

---

## Task 9: GraphQL Inputs - Outlet Config

**Files:**
- Create: `apps/api/src/graphql/products/outlet-config.input.ts`

**Step 1: Create outlet config inputs**

```typescript
import { InputType, Field, ID, Int, PartialType } from '@nestjs/graphql';
import {
  TileSize,
  CategoryDisplayStyle,
  QuickKeysPosition,
  SuggestionPosition,
} from '@prisma/client';
import GraphQLJSON from 'graphql-type-json';

// ============================================================================
// OUTLET PRODUCT CONFIG
// ============================================================================

@InputType()
export class VisibilityRulesInput {
  @Field(() => [TimeRuleInput], { nullable: true })
  timeRules?: TimeRuleInput[];

  @Field(() => RoleRulesInput, { nullable: true })
  roleRules?: RoleRulesInput;

  @Field({ nullable: true })
  inventoryRule?: string;

  @Field({ nullable: true })
  memberOnly?: boolean;
}

@InputType()
export class TimeRuleInput {
  @Field()
  startTime: string;

  @Field()
  endTime: string;

  @Field(() => [Int])
  daysOfWeek: number[];
}

@InputType()
export class RoleRulesInput {
  @Field(() => [String], { nullable: true })
  allowedRoles?: string[];

  @Field(() => [String], { nullable: true })
  deniedRoles?: string[];
}

@InputType()
export class UpdateOutletProductConfigInput {
  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  buttonColor?: string;

  @Field(() => Int, { nullable: true })
  sortPriority?: number;

  @Field(() => GraphQLJSON, { nullable: true })
  gridPosition?: { row: number; col: number };

  @Field({ nullable: true })
  isVisible?: boolean;

  @Field(() => VisibilityRulesInput, { nullable: true })
  visibilityRules?: VisibilityRulesInput;

  @Field({ nullable: true })
  isQuickKey?: boolean;

  @Field(() => Int, { nullable: true })
  quickKeyPosition?: number;
}

@InputType()
export class BulkOutletProductConfigInput {
  @Field(() => [ID])
  productIds: string[];

  @Field({ nullable: true })
  isVisible?: boolean;

  @Field({ nullable: true })
  isQuickKey?: boolean;

  @Field(() => ID, { nullable: true })
  categoryId?: string;
}

// ============================================================================
// OUTLET GRID CONFIG
// ============================================================================

@InputType()
export class UpdateOutletGridConfigInput {
  @Field(() => Int, { nullable: true })
  gridColumns?: number;

  @Field(() => Int, { nullable: true })
  gridRows?: number;

  @Field(() => TileSize, { nullable: true })
  tileSize?: TileSize;

  @Field({ nullable: true })
  showImages?: boolean;

  @Field({ nullable: true })
  showPrices?: boolean;

  @Field(() => CategoryDisplayStyle, { nullable: true })
  categoryStyle?: CategoryDisplayStyle;

  @Field({ nullable: true })
  showAllCategory?: boolean;

  @Field({ nullable: true })
  quickKeysEnabled?: boolean;

  @Field(() => Int, { nullable: true })
  quickKeysCount?: number;

  @Field(() => QuickKeysPosition, { nullable: true })
  quickKeysPosition?: QuickKeysPosition;
}

// ============================================================================
// SMART SUGGESTIONS
// ============================================================================

@InputType()
export class UpdateSmartSuggestionConfigInput {
  @Field({ nullable: true })
  enabled?: boolean;

  @Field(() => Int, { nullable: true })
  suggestionCount?: number;

  @Field(() => SuggestionPosition, { nullable: true })
  position?: SuggestionPosition;

  @Field(() => Int, { nullable: true })
  timeOfDayWeight?: number;

  @Field(() => Int, { nullable: true })
  salesVelocityWeight?: number;

  @Field(() => Int, { nullable: true })
  staffHistoryWeight?: number;

  @Field(() => Int, { nullable: true })
  refreshIntervalMinutes?: number;
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/products/outlet-config.input.ts
git commit -m "feat(api): add GraphQL input types for Outlet configs"
```

---

## Task 10: Product Service

**Files:**
- Create: `apps/api/src/graphql/products/product.service.ts`

**Step 1: Create the service**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { Prisma, ProductType } from '@prisma/client';
import {
  CreateProductInput,
  UpdateProductInput,
  ProductFilterInput,
  CreateProductCategoryInput,
  UpdateProductCategoryInput,
  CreateModifierGroupInput,
  UpdateModifierGroupInput,
} from './product.input';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // CATEGORIES
  // ============================================================================

  async getCategories(clubId: string, includeInactive = false) {
    return this.prisma.productCategory.findMany({
      where: {
        clubId,
        ...(includeInactive ? {} : { isActive: true }),
      },
      include: {
        children: true,
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async getCategory(id: string) {
    return this.prisma.productCategory.findUnique({
      where: { id },
      include: {
        children: true,
        _count: { select: { products: true } },
      },
    });
  }

  async createCategory(clubId: string, input: CreateProductCategoryInput) {
    return this.prisma.productCategory.create({
      data: {
        clubId,
        ...input,
      },
    });
  }

  async updateCategory(id: string, input: UpdateProductCategoryInput) {
    return this.prisma.productCategory.update({
      where: { id },
      data: input,
    });
  }

  async deleteCategory(id: string, moveProductsTo?: string) {
    if (moveProductsTo) {
      await this.prisma.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: moveProductsTo },
      });
    }
    await this.prisma.productCategory.delete({ where: { id } });
    return true;
  }

  // ============================================================================
  // PRODUCTS
  // ============================================================================

  async getProducts(clubId: string, filter?: ProductFilterInput) {
    const where: Prisma.ProductWhereInput = {
      clubId,
      ...(filter?.categoryId && { categoryId: filter.categoryId }),
      ...(filter?.productType && { productType: filter.productType }),
      ...(filter?.isActive !== undefined && { isActive: filter.isActive }),
      ...(filter?.search && {
        OR: [
          { name: { contains: filter.search, mode: 'insensitive' } },
          { sku: { contains: filter.search, mode: 'insensitive' } },
          { description: { contains: filter.search, mode: 'insensitive' } },
        ],
      }),
    };

    const take = filter?.first || 50;

    const [products, totalCount] = await Promise.all([
      this.prisma.product.findMany({
        where,
        take: take + 1,
        ...(filter?.after && { cursor: { id: filter.after }, skip: 1 }),
        include: {
          category: true,
          variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
          modifierGroups: {
            include: {
              modifierGroup: {
                include: {
                  modifiers: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
                },
              },
            },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: [{ sortPriority: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.product.count({ where }),
    ]);

    const hasNextPage = products.length > take;
    const edges = products.slice(0, take).map((product) => ({
      node: this.mapProduct(product),
      cursor: product.id,
    }));

    return {
      edges,
      totalCount,
      hasNextPage,
      hasPreviousPage: !!filter?.after,
    };
  }

  async getProduct(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        variants: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
        modifierGroups: {
          include: {
            modifierGroup: {
              include: {
                modifiers: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
              },
            },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return product ? this.mapProduct(product) : null;
  }

  async createProduct(clubId: string, input: CreateProductInput) {
    const { variants, modifierGroupIds, ...productData } = input;

    // Determine product type based on variants
    const productType = variants?.length
      ? ProductType.VARIABLE
      : input.productType || ProductType.SIMPLE;

    const product = await this.prisma.product.create({
      data: {
        clubId,
        ...productData,
        productType,
        variants: variants?.length
          ? {
              create: variants.map((v, i) => ({
                ...v,
                sortOrder: v.sortOrder ?? i,
              })),
            }
          : undefined,
        modifierGroups: modifierGroupIds?.length
          ? {
              create: modifierGroupIds.map((groupId, i) => ({
                modifierGroupId: groupId,
                sortOrder: i,
              })),
            }
          : undefined,
      },
      include: {
        category: true,
        variants: true,
        modifierGroups: {
          include: {
            modifierGroup: { include: { modifiers: true } },
          },
        },
      },
    });

    return this.mapProduct(product);
  }

  async updateProduct(id: string, input: UpdateProductInput) {
    const { variants, modifierGroupIds, ...productData } = input;

    const product = await this.prisma.product.update({
      where: { id },
      data: productData,
      include: {
        category: true,
        variants: true,
        modifierGroups: {
          include: {
            modifierGroup: { include: { modifiers: true } },
          },
        },
      },
    });

    return this.mapProduct(product);
  }

  async deleteProduct(id: string) {
    await this.prisma.product.delete({ where: { id } });
    return true;
  }

  // ============================================================================
  // MODIFIER GROUPS
  // ============================================================================

  async getModifierGroups(clubId: string) {
    return this.prisma.modifierGroup.findMany({
      where: { clubId, isActive: true },
      include: {
        modifiers: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createModifierGroup(clubId: string, input: CreateModifierGroupInput) {
    const { modifiers, ...groupData } = input;

    return this.prisma.modifierGroup.create({
      data: {
        clubId,
        ...groupData,
        modifiers: modifiers?.length
          ? {
              create: modifiers.map((m, i) => ({
                ...m,
                sortOrder: m.sortOrder ?? i,
              })),
            }
          : undefined,
      },
      include: { modifiers: true },
    });
  }

  async updateModifierGroup(id: string, input: UpdateModifierGroupInput) {
    const { modifiers, ...groupData } = input;

    return this.prisma.modifierGroup.update({
      where: { id },
      data: groupData,
      include: { modifiers: true },
    });
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private mapProduct(product: any) {
    return {
      ...product,
      basePrice: Number(product.basePrice),
      costPrice: product.costPrice ? Number(product.costPrice) : null,
      taxRate: Number(product.taxRate),
      hasVariants: product.variants?.length > 0,
      hasModifiers: product.modifierGroups?.length > 0,
      isInStock: !product.trackInventory || (product.stockQuantity ?? 0) > 0,
      modifierGroups: product.modifierGroups?.map((pmg: any) => ({
        ...pmg.modifierGroup,
        modifiers: pmg.modifierGroup.modifiers.map((m: any) => ({
          ...m,
          priceAdjustment: Number(m.priceAdjustment),
        })),
      })),
      variants: product.variants?.map((v: any) => ({
        ...v,
        priceAdjustment: Number(v.priceAdjustment),
      })),
    };
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/products/product.service.ts
git commit -m "feat(api): add ProductService with CRUD for products, categories, modifiers"
```

---

## Task 11: Product Resolver

**Files:**
- Create: `apps/api/src/graphql/products/product.resolver.ts`

**Step 1: Create the resolver**

```typescript
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { ProductService } from './product.service';
import {
  ProductTypeGql,
  ProductConnectionType,
  ProductCategoryType,
  ModifierGroupType,
} from './product.types';
import {
  CreateProductInput,
  UpdateProductInput,
  ProductFilterInput,
  CreateProductCategoryInput,
  UpdateProductCategoryInput,
  CreateModifierGroupInput,
  UpdateModifierGroupInput,
} from './product.input';

@Resolver()
@UseGuards(GqlAuthGuard)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  // ============================================================================
  // CATEGORY QUERIES
  // ============================================================================

  @Query(() => [ProductCategoryType], {
    name: 'productCategories',
    description: 'Get all product categories',
  })
  async getCategories(
    @GqlCurrentUser() user: JwtPayload,
    @Args('includeInactive', { nullable: true }) includeInactive?: boolean,
  ) {
    const categories = await this.productService.getCategories(
      user.tenantId,
      includeInactive,
    );
    return categories.map((c) => ({
      ...c,
      productCount: c._count?.products ?? 0,
    }));
  }

  @Query(() => ProductCategoryType, {
    name: 'productCategory',
    nullable: true,
  })
  async getCategory(@Args('id', { type: () => ID }) id: string) {
    return this.productService.getCategory(id);
  }

  // ============================================================================
  // CATEGORY MUTATIONS
  // ============================================================================

  @Mutation(() => ProductCategoryType, { name: 'createProductCategory' })
  async createCategory(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateProductCategoryInput,
  ) {
    return this.productService.createCategory(user.tenantId, input);
  }

  @Mutation(() => ProductCategoryType, { name: 'updateProductCategory' })
  async updateCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateProductCategoryInput,
  ) {
    return this.productService.updateCategory(id, input);
  }

  @Mutation(() => Boolean, { name: 'deleteProductCategory' })
  async deleteCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('moveProductsTo', { type: () => ID, nullable: true }) moveProductsTo?: string,
  ) {
    return this.productService.deleteCategory(id, moveProductsTo);
  }

  // ============================================================================
  // PRODUCT QUERIES
  // ============================================================================

  @Query(() => ProductConnectionType, {
    name: 'products',
    description: 'Get products with filtering and pagination',
  })
  async getProducts(
    @GqlCurrentUser() user: JwtPayload,
    @Args('filter', { nullable: true }) filter?: ProductFilterInput,
  ) {
    return this.productService.getProducts(user.tenantId, filter);
  }

  @Query(() => ProductTypeGql, {
    name: 'product',
    nullable: true,
  })
  async getProduct(@Args('id', { type: () => ID }) id: string) {
    return this.productService.getProduct(id);
  }

  // ============================================================================
  // PRODUCT MUTATIONS
  // ============================================================================

  @Mutation(() => ProductTypeGql, { name: 'createProduct' })
  async createProduct(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateProductInput,
  ) {
    return this.productService.createProduct(user.tenantId, input);
  }

  @Mutation(() => ProductTypeGql, { name: 'updateProduct' })
  async updateProduct(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateProductInput,
  ) {
    return this.productService.updateProduct(id, input);
  }

  @Mutation(() => Boolean, { name: 'deleteProduct' })
  async deleteProduct(@Args('id', { type: () => ID }) id: string) {
    return this.productService.deleteProduct(id);
  }

  // ============================================================================
  // MODIFIER GROUP QUERIES & MUTATIONS
  // ============================================================================

  @Query(() => [ModifierGroupType], { name: 'modifierGroups' })
  async getModifierGroups(@GqlCurrentUser() user: JwtPayload) {
    return this.productService.getModifierGroups(user.tenantId);
  }

  @Mutation(() => ModifierGroupType, { name: 'createModifierGroup' })
  async createModifierGroup(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateModifierGroupInput,
  ) {
    return this.productService.createModifierGroup(user.tenantId, input);
  }

  @Mutation(() => ModifierGroupType, { name: 'updateModifierGroup' })
  async updateModifierGroup(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateModifierGroupInput,
  ) {
    return this.productService.updateModifierGroup(id, input);
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/products/product.resolver.ts
git commit -m "feat(api): add ProductResolver with queries and mutations"
```

---

## Task 12: Outlet Config Service

**Files:**
- Create: `apps/api/src/graphql/products/outlet-config.service.ts`

**Step 1: Create the service**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  UpdateOutletProductConfigInput,
  BulkOutletProductConfigInput,
  UpdateOutletGridConfigInput,
  UpdateSmartSuggestionConfigInput,
} from './outlet-config.input';

@Injectable()
export class OutletConfigService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // OUTLET PRODUCT CONFIG
  // ============================================================================

  async getOutletProductConfigs(outletId: string) {
    return this.prisma.outletProductConfig.findMany({
      where: { outletId },
      include: {
        product: {
          include: {
            category: true,
            variants: { where: { isActive: true } },
          },
        },
      },
      orderBy: [{ sortPriority: 'asc' }, { product: { name: 'asc' } }],
    });
  }

  async getOutletProductConfig(outletId: string, productId: string) {
    return this.prisma.outletProductConfig.findUnique({
      where: { outletId_productId: { outletId, productId } },
    });
  }

  async updateOutletProductConfig(
    outletId: string,
    productId: string,
    input: UpdateOutletProductConfigInput,
  ) {
    return this.prisma.outletProductConfig.upsert({
      where: { outletId_productId: { outletId, productId } },
      create: {
        outletId,
        productId,
        ...input,
        visibilityRules: input.visibilityRules || {},
      },
      update: {
        ...input,
        ...(input.visibilityRules && { visibilityRules: input.visibilityRules }),
      },
    });
  }

  async bulkUpdateOutletProductConfigs(
    outletId: string,
    input: BulkOutletProductConfigInput,
  ) {
    const { productIds, ...updates } = input;

    // Ensure all configs exist
    await Promise.all(
      productIds.map((productId) =>
        this.prisma.outletProductConfig.upsert({
          where: { outletId_productId: { outletId, productId } },
          create: { outletId, productId, ...updates },
          update: updates,
        }),
      ),
    );

    return this.prisma.outletProductConfig.findMany({
      where: { outletId, productId: { in: productIds } },
    });
  }

  async getQuickKeys(outletId: string) {
    const configs = await this.prisma.outletProductConfig.findMany({
      where: { outletId, isQuickKey: true, isVisible: true },
      include: {
        product: {
          include: { category: true, variants: true },
        },
      },
      orderBy: { quickKeyPosition: 'asc' },
    });

    return configs.map((c) => c.product);
  }

  // ============================================================================
  // OUTLET GRID CONFIG
  // ============================================================================

  async getOutletGridConfig(outletId: string) {
    return this.prisma.outletGridConfig.findUnique({
      where: { outletId },
    });
  }

  async updateOutletGridConfig(outletId: string, input: UpdateOutletGridConfigInput) {
    return this.prisma.outletGridConfig.upsert({
      where: { outletId },
      create: { outletId, ...input },
      update: input,
    });
  }

  // ============================================================================
  // SMART SUGGESTIONS
  // ============================================================================

  async getSmartSuggestionConfig(outletId: string) {
    return this.prisma.smartSuggestionConfig.findUnique({
      where: { outletId },
    });
  }

  async updateSmartSuggestionConfig(
    outletId: string,
    input: UpdateSmartSuggestionConfigInput,
  ) {
    return this.prisma.smartSuggestionConfig.upsert({
      where: { outletId },
      create: { outletId, ...input },
      update: input,
    });
  }

  // ============================================================================
  // VISIBILITY EVALUATION
  // ============================================================================

  evaluateVisibility(
    config: { visibilityRules: any; isVisible: boolean },
    context: { currentTime: Date; userRole: string; staffId?: string },
  ): boolean {
    if (!config.isVisible) return false;

    const rules = config.visibilityRules as any;
    if (!rules || Object.keys(rules).length === 0) return true;

    // Time-based rules
    if (rules.timeRules?.length) {
      const currentHour = context.currentTime.getHours();
      const currentMinutes = context.currentTime.getMinutes();
      const currentTimeMinutes = currentHour * 60 + currentMinutes;
      const currentDay = context.currentTime.getDay() || 7; // Convert 0 (Sunday) to 7

      const timeMatch = rules.timeRules.some((rule: any) => {
        const [startH, startM] = rule.startTime.split(':').map(Number);
        const [endH, endM] = rule.endTime.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        const dayMatch = rule.daysOfWeek.includes(currentDay);
        const timeMatch =
          currentTimeMinutes >= startMinutes && currentTimeMinutes < endMinutes;

        return dayMatch && timeMatch;
      });

      if (!timeMatch) return false;
    }

    // Role-based rules
    if (rules.roleRules) {
      const { allowedRoles, deniedRoles } = rules.roleRules;

      if (deniedRoles?.includes(context.userRole)) return false;
      if (allowedRoles?.length && !allowedRoles.includes(context.userRole)) return false;
    }

    return true;
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/products/outlet-config.service.ts
git commit -m "feat(api): add OutletConfigService for product configs and grid settings"
```

---

## Task 13: Smart Suggestion Service

**Files:**
- Create: `apps/api/src/graphql/products/suggestion.service.ts`

**Step 1: Create the service**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

interface SuggestionScore {
  productId: string;
  score: number;
}

@Injectable()
export class SuggestionService {
  constructor(private readonly prisma: PrismaService) {}

  async getSuggestions(
    outletId: string,
    staffId?: string,
    limit = 6,
  ) {
    const config = await this.prisma.smartSuggestionConfig.findUnique({
      where: { outletId },
    });

    if (!config?.enabled) return [];

    const currentHour = new Date().getHours();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get visible products for this outlet
    const productConfigs = await this.prisma.outletProductConfig.findMany({
      where: { outletId, isVisible: true },
      include: { product: true },
    });

    const productIds = productConfigs.map((pc) => pc.productId);

    // Get sales metrics for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [salesMetrics, staffUsage] = await Promise.all([
      this.prisma.productSalesMetric.findMany({
        where: {
          outletId,
          productId: { in: productIds },
          date: { gte: sevenDaysAgo },
        },
      }),
      staffId
        ? this.prisma.staffProductUsage.findMany({
            where: {
              outletId,
              staffId,
              productId: { in: productIds },
            },
          })
        : [],
    ]);

    // Calculate scores
    const scores = this.calculateScores(
      productIds,
      salesMetrics,
      staffUsage,
      currentHour,
      config,
    );

    // Get top products
    const topProductIds = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.productId);

    // Fetch full product data
    const products = await this.prisma.product.findMany({
      where: { id: { in: topProductIds } },
      include: {
        category: true,
        variants: { where: { isActive: true } },
      },
    });

    // Maintain score order
    return topProductIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean);
  }

  private calculateScores(
    productIds: string[],
    salesMetrics: any[],
    staffUsage: any[],
    currentHour: number,
    config: any,
  ): SuggestionScore[] {
    // Aggregate metrics by product
    const productMetrics = new Map<
      string,
      { totalSales: number; hourlySum: number; maxHourly: number }
    >();

    const staffUsageMap = new Map<string, number>();

    for (const id of productIds) {
      productMetrics.set(id, { totalSales: 0, hourlySum: 0, maxHourly: 0 });
    }

    for (const metric of salesMetrics) {
      const existing = productMetrics.get(metric.productId)!;
      existing.totalSales += metric.quantitySold;

      const hourlyData = metric.salesByHour as Record<string, number>;
      const currentHourSales = hourlyData[currentHour.toString()] || 0;
      existing.hourlySum += currentHourSales;

      const maxHourly = Math.max(...Object.values(hourlyData), 0);
      if (maxHourly > existing.maxHourly) existing.maxHourly = maxHourly;
    }

    for (const usage of staffUsage) {
      staffUsageMap.set(usage.productId, usage.usageCount);
    }

    // Find max values for normalization
    let maxTotalSales = 0;
    let maxHourlySum = 0;
    let maxStaffUsage = 0;

    for (const [, metrics] of productMetrics) {
      if (metrics.totalSales > maxTotalSales) maxTotalSales = metrics.totalSales;
      if (metrics.hourlySum > maxHourlySum) maxHourlySum = metrics.hourlySum;
    }

    for (const [, count] of staffUsageMap) {
      if (count > maxStaffUsage) maxStaffUsage = count;
    }

    // Calculate normalized scores
    return productIds.map((productId) => {
      const metrics = productMetrics.get(productId)!;
      const staffCount = staffUsageMap.get(productId) || 0;

      const timeScore = maxHourlySum > 0 ? metrics.hourlySum / maxHourlySum : 0;
      const velocityScore = maxTotalSales > 0 ? metrics.totalSales / maxTotalSales : 0;
      const staffScore = maxStaffUsage > 0 ? staffCount / maxStaffUsage : 0;

      const score =
        (timeScore * config.timeOfDayWeight +
          velocityScore * config.salesVelocityWeight +
          staffScore * config.staffHistoryWeight) /
        100;

      return { productId, score };
    });
  }

  // ============================================================================
  // METRICS COLLECTION
  // ============================================================================

  async recordSale(
    outletId: string,
    productId: string,
    quantity: number,
    revenue: number,
    staffId?: string,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentHour = new Date().getHours().toString();

    // Update or create sales metric
    await this.prisma.productSalesMetric.upsert({
      where: {
        productId_outletId_date: { productId, outletId, date: today },
      },
      create: {
        productId,
        outletId,
        date: today,
        quantitySold: quantity,
        revenue,
        transactionCount: 1,
        salesByHour: { [currentHour]: quantity },
      },
      update: {
        quantitySold: { increment: quantity },
        revenue: { increment: revenue },
        transactionCount: { increment: 1 },
        // Note: salesByHour JSON update requires raw query
      },
    });

    // Update staff usage if staffId provided
    if (staffId) {
      await this.prisma.staffProductUsage.upsert({
        where: {
          staffId_productId_outletId: { staffId, productId, outletId },
        },
        create: {
          staffId,
          productId,
          outletId,
          usageCount: 1,
        },
        update: {
          usageCount: { increment: 1 },
          lastUsedAt: new Date(),
        },
      });
    }
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/products/suggestion.service.ts
git commit -m "feat(api): add SuggestionService with smart suggestion algorithm"
```

---

## Task 14: Products Module

**Files:**
- Create: `apps/api/src/graphql/products/products.module.ts`
- Create: `apps/api/src/graphql/products/index.ts`
- Modify: `apps/api/src/graphql/graphql.module.ts`

**Step 1: Create the module**

```typescript
// apps/api/src/graphql/products/products.module.ts
import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductResolver } from './product.resolver';
import { OutletConfigService } from './outlet-config.service';
import { OutletConfigResolver } from './outlet-config.resolver';
import { SuggestionService } from './suggestion.service';

@Module({
  providers: [
    ProductService,
    ProductResolver,
    OutletConfigService,
    OutletConfigResolver,
    SuggestionService,
  ],
  exports: [ProductService, OutletConfigService, SuggestionService],
})
export class ProductsModule {}
```

**Step 2: Create index file**

```typescript
// apps/api/src/graphql/products/index.ts
export * from './product.types';
export * from './outlet-config.types';
export * from './product.input';
export * from './outlet-config.input';
export * from './product.service';
export * from './outlet-config.service';
export * from './suggestion.service';
export * from './products.module';
```

**Step 3: Create OutletConfigResolver**

```typescript
// apps/api/src/graphql/products/outlet-config.resolver.ts
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { OutletConfigService } from './outlet-config.service';
import { SuggestionService } from './suggestion.service';
import {
  OutletProductConfigType,
  OutletGridConfigType,
  SmartSuggestionConfigType,
  OutletProductPanelType,
} from './outlet-config.types';
import { ProductTypeGql } from './product.types';
import {
  UpdateOutletProductConfigInput,
  BulkOutletProductConfigInput,
  UpdateOutletGridConfigInput,
  UpdateSmartSuggestionConfigInput,
} from './outlet-config.input';

@Resolver()
@UseGuards(GqlAuthGuard)
export class OutletConfigResolver {
  constructor(
    private readonly outletConfigService: OutletConfigService,
    private readonly suggestionService: SuggestionService,
  ) {}

  // ============================================================================
  // QUERIES
  // ============================================================================

  @Query(() => [OutletProductConfigType], { name: 'outletProductConfigs' })
  async getOutletProductConfigs(
    @Args('outletId', { type: () => ID }) outletId: string,
  ) {
    return this.outletConfigService.getOutletProductConfigs(outletId);
  }

  @Query(() => OutletGridConfigType, { name: 'outletGridConfig', nullable: true })
  async getOutletGridConfig(
    @Args('outletId', { type: () => ID }) outletId: string,
  ) {
    return this.outletConfigService.getOutletGridConfig(outletId);
  }

  @Query(() => SmartSuggestionConfigType, { name: 'smartSuggestionConfig', nullable: true })
  async getSmartSuggestionConfig(
    @Args('outletId', { type: () => ID }) outletId: string,
  ) {
    return this.outletConfigService.getSmartSuggestionConfig(outletId);
  }

  @Query(() => [ProductTypeGql], { name: 'quickKeyProducts' })
  async getQuickKeys(
    @Args('outletId', { type: () => ID }) outletId: string,
  ) {
    return this.outletConfigService.getQuickKeys(outletId);
  }

  @Query(() => [ProductTypeGql], { name: 'smartSuggestions' })
  async getSuggestions(
    @GqlCurrentUser() user: JwtPayload,
    @Args('outletId', { type: () => ID }) outletId: string,
  ) {
    return this.suggestionService.getSuggestions(outletId, user.sub);
  }

  @Query(() => OutletProductPanelType, { name: 'outletProductPanel' })
  async getOutletProductPanel(
    @GqlCurrentUser() user: JwtPayload,
    @Args('outletId', { type: () => ID }) outletId: string,
  ) {
    const [gridConfig, suggestionConfig, quickKeys, suggestions] = await Promise.all([
      this.outletConfigService.getOutletGridConfig(outletId),
      this.outletConfigService.getSmartSuggestionConfig(outletId),
      this.outletConfigService.getQuickKeys(outletId),
      this.suggestionService.getSuggestions(outletId, user.sub),
    ]);

    return {
      gridConfig: gridConfig || {
        gridColumns: 6,
        gridRows: 4,
        tileSize: 'MEDIUM',
        showImages: true,
        showPrices: true,
        categoryStyle: 'TABS',
        showAllCategory: true,
        quickKeysEnabled: true,
        quickKeysCount: 8,
        quickKeysPosition: 'TOP',
      },
      suggestionConfig,
      quickKeys,
      suggestions,
    };
  }

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  @Mutation(() => OutletProductConfigType, { name: 'updateOutletProductConfig' })
  async updateOutletProductConfig(
    @Args('outletId', { type: () => ID }) outletId: string,
    @Args('productId', { type: () => ID }) productId: string,
    @Args('input') input: UpdateOutletProductConfigInput,
  ) {
    return this.outletConfigService.updateOutletProductConfig(outletId, productId, input);
  }

  @Mutation(() => [OutletProductConfigType], { name: 'bulkUpdateOutletProductConfigs' })
  async bulkUpdateOutletProductConfigs(
    @Args('outletId', { type: () => ID }) outletId: string,
    @Args('input') input: BulkOutletProductConfigInput,
  ) {
    return this.outletConfigService.bulkUpdateOutletProductConfigs(outletId, input);
  }

  @Mutation(() => OutletGridConfigType, { name: 'updateOutletGridConfig' })
  async updateOutletGridConfig(
    @Args('outletId', { type: () => ID }) outletId: string,
    @Args('input') input: UpdateOutletGridConfigInput,
  ) {
    return this.outletConfigService.updateOutletGridConfig(outletId, input);
  }

  @Mutation(() => SmartSuggestionConfigType, { name: 'updateSmartSuggestionConfig' })
  async updateSmartSuggestionConfig(
    @Args('outletId', { type: () => ID }) outletId: string,
    @Args('input') input: UpdateSmartSuggestionConfigInput,
  ) {
    return this.outletConfigService.updateSmartSuggestionConfig(outletId, input);
  }
}
```

**Step 4: Update GraphQL module**

Add to `apps/api/src/graphql/graphql.module.ts` imports:

```typescript
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    // ... existing imports
    ProductsModule,
  ],
})
export class GraphQLModule {}
```

**Step 5: Generate GraphQL schema**

```bash
cd apps/api
pnpm run dev &
sleep 10
kill %1
```

**Step 6: Commit**

```bash
git add apps/api/src/graphql/products/ apps/api/src/graphql/graphql.module.ts
git commit -m "feat(api): add ProductsModule with resolvers and wire up to GraphQL"
```

---

## Task 15: Seed Data for Products

**Files:**
- Modify: `database/prisma/seed.ts`

**Step 1: Add product seed data**

Add after existing seed data (find a good insertion point):

```typescript
// ============================================================================
// PRODUCT CATEGORIES & PRODUCTS
// ============================================================================

async function seedProducts(clubId: string) {
  console.log('Seeding product categories and products...');

  // Create categories
  const categories = await Promise.all([
    prisma.productCategory.create({
      data: {
        clubId,
        name: 'Apparel',
        color: '#3B82F6',
        iconName: 'shirt',
        sortOrder: 1,
      },
    }),
    prisma.productCategory.create({
      data: {
        clubId,
        name: 'Equipment',
        color: '#10B981',
        iconName: 'golf',
        sortOrder: 2,
      },
    }),
    prisma.productCategory.create({
      data: {
        clubId,
        name: 'Accessories',
        color: '#8B5CF6',
        iconName: 'package',
        sortOrder: 3,
      },
    }),
    prisma.productCategory.create({
      data: {
        clubId,
        name: 'Food & Beverage',
        color: '#F59E0B',
        iconName: 'utensils',
        sortOrder: 4,
      },
    }),
    prisma.productCategory.create({
      data: {
        clubId,
        name: 'Golf Balls',
        color: '#14B8A6',
        iconName: 'circle',
        sortOrder: 5,
      },
    }),
  ]);

  const [apparel, equipment, accessories, fnb, balls] = categories;

  // Create products
  const products = [
    // Apparel - with variants
    {
      clubId,
      categoryId: apparel.id,
      name: 'Club Logo Polo Shirt',
      sku: 'APP-001',
      productType: 'VARIABLE' as const,
      basePrice: 85.0,
      trackInventory: true,
      stockQuantity: 50,
      sortPriority: 10,
    },
    {
      clubId,
      categoryId: apparel.id,
      name: 'Golf Shorts - Navy',
      sku: 'APP-002',
      productType: 'SIMPLE' as const,
      basePrice: 65.0,
      trackInventory: true,
      stockQuantity: 30,
      sortPriority: 20,
    },
    // Equipment
    {
      clubId,
      categoryId: equipment.id,
      name: 'Titleist TSR3 Driver',
      sku: 'EQP-001',
      productType: 'SIMPLE' as const,
      basePrice: 599.0,
      trackInventory: true,
      stockQuantity: 4,
      sortPriority: 30,
    },
    // Accessories
    {
      clubId,
      categoryId: accessories.id,
      name: 'Golf Bag - Stand',
      sku: 'ACC-001',
      productType: 'SIMPLE' as const,
      basePrice: 289.0,
      trackInventory: true,
      stockQuantity: 7,
      sortPriority: 40,
    },
    // F&B - with modifiers (will be linked later)
    {
      clubId,
      categoryId: fnb.id,
      name: 'Club Burger',
      sku: 'FNB-001',
      productType: 'SIMPLE' as const,
      basePrice: 18.0,
      trackInventory: false,
      sortPriority: 10,
    },
    {
      clubId,
      categoryId: fnb.id,
      name: 'Bottled Water',
      sku: 'FNB-002',
      productType: 'SIMPLE' as const,
      basePrice: 3.5,
      trackInventory: true,
      stockQuantity: 200,
      sortPriority: 5,
    },
    // Golf Balls
    {
      clubId,
      categoryId: balls.id,
      name: 'Titleist Pro V1 (Dozen)',
      sku: 'BALL-001',
      productType: 'SIMPLE' as const,
      basePrice: 54.99,
      trackInventory: true,
      stockQuantity: 30,
      sortPriority: 10,
    },
  ];

  const createdProducts = await Promise.all(
    products.map((p) => prisma.product.create({ data: p })),
  );

  // Add variants to polo shirt
  const poloShirt = createdProducts[0];
  await prisma.productVariant.createMany({
    data: [
      { productId: poloShirt.id, name: 'Small', sku: 'APP-001-S', priceAdjustment: 0, stockQuantity: 10, sortOrder: 1 },
      { productId: poloShirt.id, name: 'Medium', sku: 'APP-001-M', priceAdjustment: 0, stockQuantity: 15, sortOrder: 2 },
      { productId: poloShirt.id, name: 'Large', sku: 'APP-001-L', priceAdjustment: 0, stockQuantity: 15, sortOrder: 3 },
      { productId: poloShirt.id, name: 'XL', sku: 'APP-001-XL', priceAdjustment: 5, stockQuantity: 10, sortOrder: 4 },
    ],
  });

  // Create modifier groups for F&B
  const cookingTempGroup = await prisma.modifierGroup.create({
    data: {
      clubId,
      name: 'Cooking Temperature',
      selectionType: 'SINGLE',
      minSelections: 1,
      maxSelections: 1,
    },
  });

  await prisma.modifier.createMany({
    data: [
      { groupId: cookingTempGroup.id, name: 'Rare', priceAdjustment: 0, sortOrder: 1 },
      { groupId: cookingTempGroup.id, name: 'Medium Rare', priceAdjustment: 0, isDefault: true, sortOrder: 2 },
      { groupId: cookingTempGroup.id, name: 'Medium', priceAdjustment: 0, sortOrder: 3 },
      { groupId: cookingTempGroup.id, name: 'Medium Well', priceAdjustment: 0, sortOrder: 4 },
      { groupId: cookingTempGroup.id, name: 'Well Done', priceAdjustment: 0, sortOrder: 5 },
    ],
  });

  const toppingsGroup = await prisma.modifierGroup.create({
    data: {
      clubId,
      name: 'Burger Toppings',
      selectionType: 'MULTIPLE',
      minSelections: 0,
      maxSelections: null,
    },
  });

  await prisma.modifier.createMany({
    data: [
      { groupId: toppingsGroup.id, name: 'Add Bacon', priceAdjustment: 3, sortOrder: 1 },
      { groupId: toppingsGroup.id, name: 'Add Cheese', priceAdjustment: 2, sortOrder: 2 },
      { groupId: toppingsGroup.id, name: 'Add Avocado', priceAdjustment: 2.5, sortOrder: 3 },
      { groupId: toppingsGroup.id, name: 'No Onions', priceAdjustment: 0, sortOrder: 4 },
      { groupId: toppingsGroup.id, name: 'No Pickles', priceAdjustment: 0, sortOrder: 5 },
    ],
  });

  // Link burger to modifier groups
  const burger = createdProducts.find((p) => p.name === 'Club Burger')!;
  await prisma.productModifierGroup.createMany({
    data: [
      { productId: burger.id, modifierGroupId: cookingTempGroup.id, isRequired: true, sortOrder: 1 },
      { productId: burger.id, modifierGroupId: toppingsGroup.id, isRequired: false, sortOrder: 2 },
    ],
  });

  console.log(`Created ${createdProducts.length} products`);
  return createdProducts;
}
```

**Step 2: Call seedProducts from main seed function**

Add call to `seedProducts(club.id)` in the main seed function after club creation.

**Step 3: Run seed**

```bash
cd database
npx prisma db seed
```

**Step 4: Commit**

```bash
git add database/prisma/seed.ts
git commit -m "feat(seed): add product categories, products, variants, and modifiers"
```

---

## Summary

This plan creates the complete backend infrastructure for the POS Product Panel:

| Task | Component | Files |
|------|-----------|-------|
| 1-4 | Prisma Schema | Product, Category, Variant, Modifiers, Outlet configs |
| 5 | Migration Script | Data migration from ProshopProduct |
| 6-9 | GraphQL Types & Inputs | All type definitions |
| 10-13 | Services | Product, OutletConfig, Suggestion services |
| 14 | Module & Resolvers | Wire everything together |
| 15 | Seed Data | Demo products for testing |

**Next Phase (UI):** After this backend is complete, the next plan will cover:
- Admin UI: Template editor, outlet config pages
- Staff UI: POSProductPanel component with all sub-components
- Integration: Wire POS sales page to new API
