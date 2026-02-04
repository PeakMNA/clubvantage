# POS Product Panel Configuration Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete Micros-style POS product panel configuration system with unified product catalog, outlet-specific layouts, conditional visibility, and smart suggestions.

**Architecture:** Unified Product model supporting retail/F&B/services, hierarchical configuration (templates → outlets → products), real-time visibility rules, and analytics-driven suggestions.

**Tech Stack:** Prisma/PostgreSQL, NestJS GraphQL API, React/Next.js admin UI, shared UI components

---

## 1. Problem Statement

### Current Issues
1. **Staff can't find products fast enough** - Need better organization, search, favorites
2. **Managers need to customize layouts per outlet** - Pro shop vs F&B vs spa need different configs
3. **Products are hardcoded** - Mock data in POS sales page, not connected to database

### Requirements
- Support all club outlets: Pro shop, F&B, spa, fitness center, tennis shop
- Handle simple products, variants (size/color), and modifiers (add bacon)
- Hierarchical config: Central sets defaults, outlet managers can override
- Full Micros-style customization: grid layout, colors, sort priority, quick-keys, conditional visibility
- Outlet-level quick-keys (manager-curated) + smart suggestions (time/velocity/usage)
- Conditional visibility: time-based, role-based, inventory-based, custom rules

---

## 2. Data Model

### 2.1 Unified Product Model

Replaces `ProshopProduct` and extends to cover `Service`.

```prisma
enum ProductType {
  SIMPLE      // Add to cart immediately (water bottle)
  VARIABLE    // Show variant picker (polo shirt S/M/L)
  SERVICE     // May trigger booking flow (spa massage)
  COMPOSITE   // Bundle/combo (lunch special)
}

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
  sortPriority         Int              @default(50) // 1-99, lower = higher

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

  @@unique([clubId, sku])
  @@index([clubId])
  @@index([clubId, categoryId])
  @@index([clubId, isActive])
  @@index([clubId, productType])
  @@map("products")
}
```

### 2.2 Product Category

Hierarchical categories with visual styling.

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

### 2.3 Product Variants

For VARIABLE products (size, color options).

```prisma
model ProductVariant {
  id              String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  productId       String   @db.Uuid

  name            String   @db.VarChar(100) // "Large", "Navy / XL"
  sku             String?  @db.VarChar(50)
  priceAdjustment Decimal  @default(0) @db.Decimal(10, 2) // Can be negative
  attributes      Json     @default("{}") // { size: "L", color: "Navy" }

  stockQuantity   Int?     // If parent.trackInventory
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

### 2.4 Modifier Groups & Modifiers

Reusable customization options for F&B.

```prisma
enum ModifierSelectionType {
  SINGLE    // Pick one (cooking temperature)
  MULTIPLE  // Pick many (toppings)
}

model ModifierGroup {
  id            String                @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId        String                @db.Uuid

  name          String                @db.VarChar(100) // "Cooking Temperature"
  selectionType ModifierSelectionType @default(SINGLE)
  minSelections Int                   @default(0) // 0 = optional
  maxSelections Int?                  // null = unlimited

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

model Modifier {
  id              String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  groupId         String        @db.Uuid

  name            String        @db.VarChar(100) // "Medium Rare"
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

model ProductModifierGroup {
  id              String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  productId       String        @db.Uuid
  modifierGroupId String        @db.Uuid

  isRequired      Boolean       @default(false) // Override group default
  sortOrder       Int           @default(0)

  product         Product       @relation(fields: [productId], references: [id], onDelete: Cascade)
  modifierGroup   ModifierGroup @relation(fields: [modifierGroupId], references: [id], onDelete: Cascade)

  @@unique([productId, modifierGroupId])
  @@index([productId])
  @@map("product_modifier_groups")
}
```

### 2.5 Outlet Product Configuration

Per-outlet product display settings and visibility rules.

```prisma
enum InventoryVisibilityRule {
  ALWAYS_SHOW      // Show even when out of stock
  HIDE_WHEN_ZERO   // Hide when stockQuantity = 0
  SHOW_DISABLED    // Show but disable clicking
}

model OutletProductConfig {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  outletId    String    @db.Uuid
  productId   String    @db.Uuid
  categoryId  String?   @db.Uuid // Override category for this outlet

  // Display overrides
  displayName String?   @db.VarChar(100) // "Bud Light" → "Bud Lt"
  buttonColor String?   @db.VarChar(7)   // Hex, override category
  sortPriority Int?     // Outlet-specific ordering
  gridPosition Json?    // { row: 0, col: 2 } for fixed position

  // Visibility
  isVisible   Boolean   @default(true)
  visibilityRules Json  @default("{}") // See schema below

  // Quick keys
  isQuickKey  Boolean   @default(false)
  quickKeyPosition Int? // Order in quick keys bar

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  outlet      POSOutlet @relation(fields: [outletId], references: [id], onDelete: Cascade)
  product     Product   @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([outletId, productId])
  @@index([outletId])
  @@index([outletId, isVisible])
  @@index([outletId, isQuickKey])
  @@map("outlet_product_configs")
}
```

**Visibility Rules JSON Schema:**
```typescript
interface VisibilityRules {
  timeRules?: {
    startTime: string;  // "06:00"
    endTime: string;    // "11:00"
    daysOfWeek: number[]; // 1-7 (Mon-Sun)
  }[];
  roleRules?: {
    allowedRoles?: string[];
    deniedRoles?: string[];
  };
  inventoryRule?: 'ALWAYS_SHOW' | 'HIDE_WHEN_ZERO' | 'SHOW_DISABLED';
  memberOnly?: boolean;
  customRules?: {
    type: string;
    value: any;
  }[];
}
```

### 2.6 Outlet Category Configuration

Per-outlet category display settings.

```prisma
model OutletCategoryConfig {
  id          String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  outletId    String          @db.Uuid
  categoryId  String          @db.Uuid

  isVisible   Boolean         @default(true)
  sortOrder   Int?            // Override category.sortOrder
  colorOverride String?       @db.VarChar(7)

  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  outlet      POSOutlet       @relation(fields: [outletId], references: [id], onDelete: Cascade)
  category    ProductCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)

  @@unique([outletId, categoryId])
  @@index([outletId])
  @@map("outlet_category_configs")
}
```

### 2.7 Outlet Grid Configuration

Extends POSOutlet with grid layout settings.

```prisma
enum TileSize {
  SMALL   // More items visible
  MEDIUM  // Balanced
  LARGE   // Easier to tap
}

enum CategoryDisplayStyle {
  TABS     // Horizontal tabs above grid
  SIDEBAR  // Vertical list on left
  DROPDOWN // Compact dropdown selector
}

enum QuickKeysPosition {
  TOP   // Horizontal bar above categories
  LEFT  // Vertical bar on left side
}

model OutletGridConfig {
  id              String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  outletId        String               @unique @db.Uuid

  // Grid dimensions
  gridColumns     Int                  @default(6)  // 4-8
  gridRows        Int                  @default(4)  // 3-6
  tileSize        TileSize             @default(MEDIUM)
  showImages      Boolean              @default(true)
  showPrices      Boolean              @default(true)

  // Category display
  categoryStyle   CategoryDisplayStyle @default(TABS)
  showAllCategory Boolean              @default(true)

  // Quick keys
  quickKeysEnabled  Boolean            @default(true)
  quickKeysCount    Int                @default(8) // 6-12
  quickKeysPosition QuickKeysPosition  @default(TOP)

  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt

  outlet          POSOutlet            @relation(fields: [outletId], references: [id], onDelete: Cascade)

  @@map("outlet_grid_configs")
}
```

### 2.8 Smart Suggestions

Analytics and configuration for dynamic suggestions.

```prisma
model ProductSalesMetric {
  id               String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  productId        String    @db.Uuid
  outletId         String    @db.Uuid
  date             DateTime  @db.Date

  quantitySold     Int       @default(0)
  revenue          Decimal   @default(0) @db.Decimal(12, 2)
  transactionCount Int       @default(0)
  salesByHour      Json      @default("{}") // { "08": 12, "09": 45, ... }

  updatedAt        DateTime  @updatedAt

  product          Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  outlet           POSOutlet @relation(fields: [outletId], references: [id], onDelete: Cascade)

  @@unique([productId, outletId, date])
  @@index([outletId, date])
  @@index([productId, date])
  @@map("product_sales_metrics")
}

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

enum SuggestionPosition {
  TOP_ROW   // Above main grid
  SIDEBAR   // Right side panel
  FLOATING  // Overlay panel
}

model SmartSuggestionConfig {
  id                    String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  outletId              String             @unique @db.Uuid

  enabled               Boolean            @default(true)
  suggestionCount       Int                @default(6) // 4-8
  position              SuggestionPosition @default(TOP_ROW)

  // Algorithm weights (should sum to 100)
  timeOfDayWeight       Int                @default(40)
  salesVelocityWeight   Int                @default(35)
  staffHistoryWeight    Int                @default(25)

  refreshIntervalMinutes Int               @default(30) // 15-60

  createdAt             DateTime           @default(now())
  updatedAt             DateTime           @updatedAt

  outlet                POSOutlet          @relation(fields: [outletId], references: [id], onDelete: Cascade)

  @@map("smart_suggestion_configs")
}
```

---

## 3. Admin Configuration UI

### 3.1 Template Editor (Settings → POS → Templates)

Central admins create reusable templates.

**Tabs:**
1. **General** - Name, description, outlet type
2. **Grid Layout** - Live preview, columns/rows sliders, tile size, show images/prices, category style
3. **Quick Keys** - Enable toggle, position, count, product selector
4. **Smart Suggestions** - Enable toggle, position, count, weight sliders
5. **Action Bar** - Existing toolbar/action bar config

### 3.2 Outlet Config (Settings → POS → Outlets → [outlet])

Outlet managers override template defaults.

**Tabs:**
1. **General** - Name, template dropdown, "Use template defaults" toggles
2. **Products** - Category tree, draggable product grid, detail panel with overrides
3. **Categories** - Reorder, hide, override colors
4. **Grid Overrides** - Same as template (grayed if using defaults)
5. **Visibility Rules** - Bulk rule editor

### 3.3 Visibility Rules Builder (Modal)

Simple rule builder with checkboxes and inputs:
- Time-based: Start/end time, days of week
- Role-based: Multi-select allowed/denied roles
- Inventory-based: Dropdown (Always show / Hide when zero / Show disabled)
- Members only: Checkbox

---

## 4. Staff-Facing Product Grid Component

### 4.1 Component Structure

```
POSProductPanel
├── QuickKeysBar (conditional)
│   └── QuickKeyButton × N
├── SmartSuggestionsRow (conditional)
│   ├── "Suggested" label
│   └── ProductTile × N
├── CategoryNav (tabs | sidebar | dropdown)
│   ├── "All" button (conditional)
│   └── CategoryButton × N
├── ProductGrid
│   ├── ProductTile × (cols × rows)
│   └── Pagination
└── SearchOverlay (conditional)
    ├── SearchInput
    └── ResultsGrid
```

### 4.2 Product Tile States

| State | Appearance |
|-------|------------|
| Default | Category color bg, name, price, image |
| Out of stock | Grayed, "Out of Stock" badge, non-clickable |
| Has variants | Small options icon |
| Has modifiers | Small customize icon |
| Quick key | Subtle bookmark icon |
| Hidden by rule | Not rendered |

### 4.3 Click Behaviors

| Product Type | Has Modifiers | Action |
|--------------|---------------|--------|
| SIMPLE | No | Add to cart |
| SIMPLE | Yes | Open modifier modal → add to cart |
| VARIABLE | No | Open variant picker → add to cart |
| VARIABLE | Yes | Open variant picker → modifier modal → add to cart |
| SERVICE | - | Open service booking modal or add directly |
| COMPOSITE | - | Open bundle configurator |

### 4.4 Data Flow

1. Mount → fetch `OutletGridConfig` + `SmartSuggestionConfig`
2. Fetch products with `OutletProductConfig` for outlet
3. Apply visibility rules (time, role, inventory)
4. Fetch smart suggestions (separate call)
5. Render grid
6. Category change → filter locally
7. Search → filter locally + highlight
8. Product click → check type → add or open modal

---

## 5. Migration Strategy

### Phase 1: Create New Models
1. Add new Prisma models (keep old ones)
2. Run migration
3. Generate Prisma client

### Phase 2: Data Migration
1. Create migration script:
   - `ProshopCategory` → `ProductCategory`
   - `ProshopProduct` → `Product` (type=SIMPLE or VARIABLE)
   - `ProshopVariant` → `ProductVariant`
   - `Service` → `Product` (type=SERVICE)
   - `ServiceVariation` → `ProductVariant` or `Modifier`
2. Create default `OutletProductConfig` for each product-outlet pair
3. Verify data integrity

### Phase 3: API Updates
1. Create GraphQL resolvers for new models
2. Update existing POS queries to use new models
3. Add visibility rule evaluation logic
4. Add smart suggestion algorithm

### Phase 4: UI Updates
1. Build admin configuration screens
2. Replace `POSProductGrid` with `POSProductPanel`
3. Update POS sales page to use new component

### Phase 5: Deprecation
1. Mark old models as deprecated
2. Remove old model usage after verification
3. Drop old tables in future migration

---

## 6. API Endpoints

### GraphQL Queries

```graphql
# Fetch products for outlet (with visibility applied)
query OutletProducts($outletId: ID!, $categoryId: ID) {
  outletProducts(outletId: $outletId, categoryId: $categoryId) {
    id
    name
    displayName
    productType
    basePrice
    imageUrl
    buttonColor
    hasVariants
    hasModifiers
    isInStock
    category { id name color }
  }
}

# Fetch smart suggestions
query SmartSuggestions($outletId: ID!, $staffId: ID) {
  smartSuggestions(outletId: $outletId, staffId: $staffId) {
    products { id name basePrice imageUrl }
    refreshAt
  }
}

# Fetch outlet grid config
query OutletGridConfig($outletId: ID!) {
  outletGridConfig(outletId: $outletId) {
    gridColumns
    gridRows
    tileSize
    showImages
    showPrices
    categoryStyle
    quickKeysEnabled
    quickKeysCount
    quickKeysPosition
    quickKeyProducts { id name imageUrl }
  }
}
```

### GraphQL Mutations

```graphql
# Update outlet product config
mutation UpdateOutletProductConfig($input: UpdateOutletProductConfigInput!) {
  updateOutletProductConfig(input: $input) {
    id
    displayName
    buttonColor
    isVisible
    isQuickKey
  }
}

# Bulk update visibility
mutation BulkUpdateProductVisibility($outletId: ID!, $productIds: [ID!]!, $isVisible: Boolean!) {
  bulkUpdateProductVisibility(outletId: $outletId, productIds: $productIds, isVisible: $isVisible) {
    updatedCount
  }
}
```

---

## 7. Smart Suggestion Algorithm

```typescript
interface SuggestionScore {
  productId: string;
  score: number;
}

function calculateSuggestions(
  outletId: string,
  staffId: string | null,
  config: SmartSuggestionConfig,
  currentHour: number
): SuggestionScore[] {
  const products = getVisibleProducts(outletId);

  return products.map(product => {
    // Time-of-day score (0-1)
    const hourlyStats = getHourlySalesStats(product.id, outletId);
    const maxHourlySales = Math.max(...Object.values(hourlyStats));
    const currentHourSales = hourlyStats[currentHour] || 0;
    const timeScore = maxHourlySales > 0 ? currentHourSales / maxHourlySales : 0;

    // Sales velocity score (0-1)
    const weeklyAvg = getWeeklyAverageSales(product.id, outletId);
    const maxWeeklyAvg = getMaxWeeklyAverageAcrossProducts(outletId);
    const velocityScore = maxWeeklyAvg > 0 ? weeklyAvg / maxWeeklyAvg : 0;

    // Staff history score (0-1)
    let staffScore = 0;
    if (staffId) {
      const staffUsage = getStaffUsageCount(staffId, product.id, outletId);
      const maxStaffUsage = getMaxStaffUsageForStaff(staffId, outletId);
      staffScore = maxStaffUsage > 0 ? staffUsage / maxStaffUsage : 0;
    }

    // Weighted score
    const score =
      (timeScore * config.timeOfDayWeight / 100) +
      (velocityScore * config.salesVelocityWeight / 100) +
      (staffScore * config.staffHistoryWeight / 100);

    return { productId: product.id, score };
  })
  .sort((a, b) => b.score - a.score)
  .slice(0, config.suggestionCount);
}
```

---

## 8. Implementation Tasks

### Task 1: Prisma Schema - Core Product Models
- Add `ProductType` enum
- Add `Product` model
- Add `ProductCategory` model
- Add `ProductVariant` model
- Run migration

### Task 2: Prisma Schema - Modifiers
- Add `ModifierSelectionType` enum
- Add `ModifierGroup` model
- Add `Modifier` model
- Add `ProductModifierGroup` model
- Run migration

### Task 3: Prisma Schema - Outlet Configuration
- Add `OutletProductConfig` model
- Add `OutletCategoryConfig` model
- Add grid config enums
- Add `OutletGridConfig` model
- Run migration

### Task 4: Prisma Schema - Smart Suggestions
- Add `ProductSalesMetric` model
- Add `StaffProductUsage` model
- Add `SmartSuggestionConfig` model
- Run migration

### Task 5: Data Migration Script
- Create migration script for existing data
- Migrate ProshopCategory → ProductCategory
- Migrate ProshopProduct → Product
- Migrate ProshopVariant → ProductVariant
- Create default OutletProductConfigs

### Task 6: GraphQL API - Products
- Create Product resolver
- Create ProductCategory resolver
- Create ProductVariant resolver
- Add queries and mutations

### Task 7: GraphQL API - Modifiers
- Create ModifierGroup resolver
- Create Modifier resolver
- Add queries and mutations

### Task 8: GraphQL API - Outlet Config
- Create OutletProductConfig resolver
- Create OutletGridConfig resolver
- Add visibility rule evaluation
- Add queries and mutations

### Task 9: GraphQL API - Smart Suggestions
- Create suggestion algorithm service
- Create ProductSalesMetric resolver
- Add suggestion query
- Add metrics collection mutation

### Task 10: Admin UI - Template Editor
- Create template editor page
- Build grid layout tab
- Build quick keys tab
- Build smart suggestions tab

### Task 11: Admin UI - Outlet Config
- Create outlet config page
- Build products tab with drag-drop
- Build visibility rules modal
- Build category management

### Task 12: Staff UI - POSProductPanel Component
- Create POSProductPanel component
- Build QuickKeysBar component
- Build SmartSuggestionsRow component
- Build ProductGrid with tiles

### Task 13: Staff UI - Product Modals
- Create VariantPickerModal
- Create ModifierSelectionModal
- Create BundleConfiguratorModal

### Task 14: Integration
- Update POS sales page to use new component
- Wire up data fetching
- Add real-time inventory updates
- Test end-to-end flow

### Task 15: Analytics Collection
- Add transaction hook for metrics
- Implement async metrics update
- Add staff usage tracking
- Test suggestion algorithm

---

## 9. Toolbar Configuration System

### 9.1 Zone-Based Toolbar Layout

The POS toolbar uses a three-zone layout system for flexible customization:

| Zone | Purpose | Default Items |
|------|---------|---------------|
| Left | Table/floor operations | Open Table, Floor Plan, Search |
| Center | Member interactions | Member Lookup, Attach Member, Charge to Member |
| Right | Ticket management | Split Check, Merge Tables, Transfer, Hold Ticket, New Ticket |

### 9.2 Available Toolbar Items

**General:**
- `search` - Global product/member search
- `categoryTabs` - Category navigation (use only if not in product panel)

**Member Operations:**
- `memberLookup` - Open member search modal
- `attachMember` - Attach member to current ticket
- `detachMember` - Remove member from ticket
- `memberInfo` - View attached member details
- `chargeToMember` - Charge ticket to member account

**Ticket Actions:**
- `holdTicket` - Hold current ticket for later
- `newTicket` - Create a new ticket
- `splitCheck` - Split ticket across payments

**F&B Table Operations:**
- `openTable` - Quick access to open a table
- `floorPlan` - Visual floor plan view
- `transferTable` - Transfer table to another server
- `mergeTables` - Combine multiple tables

### 9.3 Template Toolbar Configuration

Toolbar groups are stored in the template's `toolbarConfig` field:

```typescript
interface TemplateToolbarConfig {
  toolbarGroups: ToolbarGroup[];
}

interface ToolbarGroup {
  id: string;           // Unique group identifier
  label: string;        // Display label for admin UI
  zone: 'left' | 'center' | 'right';
  items: string[];      // Array of item IDs
}
```

### 9.4 API Integration

```typescript
// Fetch POS config including toolbar
const { data } = useGetPosConfigQuery({
  outletId: selectedOutletId,
  userRole: 'staff',
  userPermissions: []
});

// Parse toolbar config
const toolbarConfig = data?.posConfig?.toolbarConfig;
const toolbarGroups = toolbarConfig?.toolbarGroups || defaultGroups;
```

---

## 10. Session Management

### 10.1 Activity-Based Timeout

POS sessions use activity-based timeout for security:

| Setting | Default Value | Description |
|---------|---------------|-------------|
| Inactivity Timeout | 15 minutes | Time without activity before logout |
| Activity Check Interval | 1 minute | How often to check for timeout |
| Warning Before Logout | 2 minutes | When to show "Stay logged in?" prompt |

### 10.2 Activity Events Tracked

- Mouse clicks and movements
- Keyboard input
- Touch events
- Scroll events

Activity updates are throttled to once per second to minimize performance impact.

### 10.3 Session Extension

When the warning modal appears, users can:

1. **Stay Logged In**: Resets timer and refreshes session tokens
2. **Log Out**: Immediately ends session

```typescript
interface AuthContextValue {
  extendSession: () => Promise<void>;      // Reset timer + refresh tokens
  getTimeUntilTimeout: () => number;       // Milliseconds until timeout
}
```

### 10.4 Visibility Change Handling

When a browser tab becomes visible again:
- Session validity is checked
- Tokens are refreshed if needed
- User is logged out if session has expired

---

## 11. Success Criteria

1. **Performance**: Product grid loads in <500ms with 500+ products
2. **Usability**: Staff can find any product in <3 seconds
3. **Flexibility**: Managers can configure layouts without developer help
4. **Accuracy**: Visibility rules apply correctly 100% of the time
5. **Suggestions**: Smart suggestions show relevant items >70% of the time
6. **Toolbar Customization**: Template changes reflect immediately on POS sales page
7. **Session Security**: Activity-based timeout prevents unauthorized access
8. **Member Operations**: All member functions accessible from toolbar center zone
