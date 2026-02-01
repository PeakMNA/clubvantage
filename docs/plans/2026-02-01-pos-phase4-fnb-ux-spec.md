# POS Phase 4: F&B (Food & Beverage) Module - UX Specification

**Date:** 2026-02-01
**Status:** Draft
**Purpose:** Detailed UX flows for Phase 4 F&B features

---

## Overview

This document covers the UX flows for all Phase 4 (F&B Module) features:

1. Floor Plan / Table Management
2. Order Modifiers
3. Course Firing Control
4. Kitchen Display System (KDS)
5. Split/Merge Checks
6. Server Assignment + Tips
7. Dining Reservations

---

## Feature 1: Floor Plan / Table Management

### Feature Types

| Type | Description | Example |
|------|-------------|---------|
| Floor plan | Visual layout of dining area | Main dining, patio, bar |
| Section | Grouping of tables for server assignment | Section A (tables 1-6) |
| Table | Individual seating unit | Table 5, 4-top |
| Table status | Current state of table | Available, Occupied, Reserved |
| Capacity | Number of seats at table | 2-top, 4-top, 8-top |

### Data Model

```prisma
model FloorPlan {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])
  outletId        String
  outlet          Outlet    @relation(fields: [outletId], references: [id])

  name            String    // "Main Dining", "Patio", "Bar Area"
  description     String?

  // Layout dimensions (for visual editor)
  width           Int       @default(800)  // pixels
  height          Int       @default(600)  // pixels
  backgroundImage String?   // Optional floor plan background

  // Settings
  isActive        Boolean   @default(true)
  displayOrder    Int       @default(0)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  tables          DiningTable[]
  sections        TableSection[]
}

model TableSection {
  id              String    @id @default(uuid())
  floorPlanId     String
  floorPlan       FloorPlan @relation(fields: [floorPlanId], references: [id])

  name            String    // "Section A", "Bar Section"
  color           String    @default("#6B7280") // For visual display

  // Visual bounds (optional - for highlighting on floor plan)
  x               Int?
  y               Int?
  width           Int?
  height          Int?

  isActive        Boolean   @default(true)

  tables          DiningTable[]
  assignments     ServerAssignment[]
}

model DiningTable {
  id              String    @id @default(uuid())
  floorPlanId     String
  floorPlan       FloorPlan @relation(fields: [floorPlanId], references: [id])
  sectionId       String?
  section         TableSection? @relation(fields: [sectionId], references: [id])

  // Identification
  tableNumber     String    // "5", "A1", "Bar-3"
  name            String?   // "Corner Booth", "Window Table"

  // Capacity
  minCapacity     Int       @default(1)
  maxCapacity     Int       // 2, 4, 6, 8

  // Visual position on floor plan
  x               Int
  y               Int
  width           Int       @default(60)
  height          Int       @default(60)
  shape           TableShape @default(RECTANGLE)
  rotation        Int       @default(0)  // degrees

  // Features
  isOutdoor       Boolean   @default(false)
  isPrivate       Boolean   @default(false)
  isAccessible    Boolean   @default(false)
  isHighTop       Boolean   @default(false)

  // Status
  status          TableStatus @default(AVAILABLE)
  isActive        Boolean   @default(true)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  checks          DiningCheck[]
  reservations    DiningReservation[]
}

enum TableShape {
  RECTANGLE
  SQUARE
  CIRCLE
  OVAL
  BOOTH
}

enum TableStatus {
  AVAILABLE       // Empty, ready for seating
  RESERVED        // Reservation coming soon
  OCCUPIED        // Currently dining
  ORDERING        // Has active order
  AWAITING_FOOD   // Food being prepared
  SERVED          // Food delivered
  AWAITING_CHECK  // Meal complete, check presented
  BUSSING         // Being cleared
  BLOCKED         // Temporarily unavailable
}

model TableStatusHistory {
  id              String    @id @default(uuid())
  tableId         String
  table           DiningTable @relation(fields: [tableId], references: [id])

  fromStatus      TableStatus
  toStatus        TableStatus
  changedBy       String
  changedAt       DateTime  @default(now())

  checkId         String?   // Associated check if applicable
  notes           String?
}
```

### UX Flow: Floor Plan Editor (Admin)

**Trigger:** Settings > F&B > Floor Plans > Edit

```
+---------------------------------------------------------------------+
| Floor Plan Editor - Main Dining                        [Save] [Exit] |
+---------------------------------------------------------------------+
| Toolbar:                                                             |
| [+ Table] [+ Section] [Grid: On] [Snap: On] [Zoom: 100%]           |
+---------------------------------------------------------------------+
|                                                                      |
|  +---------------+                          +---------------+        |
|  | Properties    |                          |  Table 5      |        |
|  +---------------+                          |  +-------+    |        |
|  | Table: 5      |     +-----+  +-----+    |  |       |    |        |
|  | Capacity: 4   |     | T1  |  | T2  |    |  | T5    |    |        |
|  | Shape: Rect   |     | 2   |  | 2   |    |  | 4     |    |        |
|  | Section: A    |     +-----+  +-----+    |  +-------+    |        |
|  | Features:     |                          |               |        |
|  | [ ] Outdoor   |     +-----+  +-----+    |  +-------+    |        |
|  | [ ] Private   |     | T3  |  | T4  |    |  | T6    |    |        |
|  | [x] Accessible|     | 4   |  | 4   |    |  | 6     |    |        |
|  |               |     +-----+  +-----+    |  +-------+    |        |
|  +---------------+                          +---------------+        |
|                                                                      |
|  Sections:                                                           |
|  [A] Section A (Tables 1-4)    [Edit] [Delete]                      |
|  [B] Section B (Tables 5-6)    [Edit] [Delete]                      |
|  [+ Add Section]                                                     |
|                                                                      |
+---------------------------------------------------------------------+
```

### UX Flow: Live Floor Plan View (Host Station)

**Trigger:** F&B > Host Station / Floor Plan

```
+---------------------------------------------------------------------+
| Main Dining - Live View                    12:45 PM    [Patio] [Bar] |
+---------------------------------------------------------------------+
| Legend: [Available] [Reserved] [Occupied] [Served] [Check]          |
+---------------------------------------------------------------------+
|                                                                      |
|      Section A (Server: Maria)          Section B (Server: Tom)     |
|                                                                      |
|    +--------+  +--------+              +------------+               |
|    | T1     |  | T2     |              | T5         |               |
|    | 2/2    |  | --     |              | 4/4        |               |
|    | SERVED |  | AVAIL  |              | ORDERING   |               |
|    | 45 min |  |        |              | 12 min     |               |
|    +--------+  +--------+              +------------+               |
|                                                                      |
|    +--------+  +--------+              +------------+               |
|    | T3     |  | T4     |              | T6         |               |
|    | 4/4    |  | 0/4    |              | 2/6        |               |
|    | CHECK  |  | 12:30  |              | AWAITING   |               |
|    | 72 min |  | RSRVD  |              | 28 min     |               |
|    +--------+  +--------+              +------------+               |
|                                                                      |
|   [ Walk-in Party: 4 ]  [ View Waitlist: 3 ]  [ Reservations: 8 ]   |
|                                                                      |
+---------------------------------------------------------------------+
| Quick Actions: [Seat Walk-in] [Merge Tables] [Block Table] [Refresh]|
+---------------------------------------------------------------------+
```

### UX Flow: Seat Party

**Trigger:** Click on available table or [Seat Walk-in]

```
+---------------------------------------------------------------------+
| Seat Party                                                     [X]  |
+---------------------------------------------------------------------+
| Party Size: [4_____]   [ ] From Waitlist: [Smith, John - 4 ppl___v] |
|                                                                      |
| Available Tables (capacity >= 4):                                    |
|                                                                      |
| +-------------------+  +-------------------+  +-------------------+  |
| | Table 2           |  | Table 4           |  | Table 6           |  |
| | Capacity: 2       |  | Capacity: 4       |  | Capacity: 6       |  |
| | Section: A        |  | Section: A        |  | Section: B        |  |
| | Server: Maria     |  | Server: Maria     |  | Server: Tom       |  |
| | [ ] Too small     |  | [Select]          |  | [Select]          |  |
| +-------------------+  +-------------------+  +-------------------+  |
|                                                                      |
| Selected: Table 4                                                    |
|                                                                      |
| Guest Details (Optional):                                            |
| Member: [Search member...___________] [Look Up]                     |
| Name:   [_________________________]                                  |
| Notes:  [Birthday celebration______]                                 |
|                                                                      |
|                                    [Cancel]  [Seat Party]           |
+---------------------------------------------------------------------+
```

### UX Flow: Table Detail Panel

**Trigger:** Click on occupied table

```
+---------------------------------------------------------------------+
| Table 5 - Detail                                               [X]  |
+---------------------------------------------------------------------+
| Status: ORDERING                              Time Seated: 12:33 PM |
| Server: Tom                                   Duration: 12 min      |
| Covers: 4                                                           |
+---------------------------------------------------------------------+
| Guest: John Smith (Member #M-1234)                                  |
| Notes: Birthday celebration, comp dessert                           |
+---------------------------------------------------------------------+
|                                                                      |
| Current Check: #CHK-2456                                            |
| +---------------------------------------------------------------+  |
| | 2x Club Burger           $24.00 x 2 = $48.00                  |  |
| | 1x Caesar Salad          $14.00                               |  |
| | 4x Iced Tea              $4.00 x 4 = $16.00                   |  |
| | Subtotal:                           $78.00                    |  |
| +---------------------------------------------------------------+  |
|                                                                      |
| Course Status:                                                       |
| [x] Drinks Served                                                   |
| [ ] Appetizers                                                      |
| [ ] Entrees (ORDERING)                                              |
|                                                                      |
| [View Full Check]  [Add Items]  [Fire Course]  [Print Check]        |
|                                                                      |
| Table Actions:                                                       |
| [Move Table]  [Merge Tables]  [Transfer Server]  [Close Table]      |
+---------------------------------------------------------------------+
```

### UX Flow: Table Status Change

**Trigger:** Status dropdown or action buttons

```
+---------------------------------------------------------------------+
| Change Table Status - Table 5                                  [X]  |
+---------------------------------------------------------------------+
| Current Status: ORDERING                                            |
|                                                                      |
| New Status:                                                          |
| +-------------------------------------------------------------------+
| | ( ) Available    - Table is empty and ready                       |
| | ( ) Reserved     - Reservation arriving soon                      |
| | ( ) Occupied     - Party just seated                              |
| | ( ) Ordering     - Taking order                                   |
| | (*) Awaiting Food - Order sent to kitchen                         |
| | ( ) Served       - Food delivered                                 |
| | ( ) Awaiting Check - Ready to pay                                 |
| | ( ) Bussing      - Clearing table                                 |
| | ( ) Blocked      - Temporarily unavailable                        |
| +-------------------------------------------------------------------+
|                                                                      |
| Notes: [Order fired to kitchen_______]                              |
|                                                                      |
|                                    [Cancel]  [Update Status]        |
+---------------------------------------------------------------------+
```

---

## Feature 2: Order Modifiers

### Feature Types

| Type | Description | Example |
|------|-------------|---------|
| Modifier group | Category of modifications | Temperature, Add-ons, Sides |
| Modifier item | Specific modification option | Medium rare, Extra cheese |
| Required modifier | Must select one | Burger temperature |
| Optional modifier | Can add/remove | No onions, add bacon |
| Priced modifier | Adds cost | Extra patty +$5 |
| Dietary flag | Allergen/diet info | GF, Vegan, Nut-free |

### Data Model

```prisma
model ModifierGroup {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])
  outletId        String?   // Null = applies to all outlets
  outlet          Outlet?   @relation(fields: [outletId], references: [id])

  name            String    // "Burger Temperature", "Salad Dressing"
  displayName     String?   // Customer-facing name
  description     String?

  // Selection rules
  selectionType   ModifierSelectionType @default(SINGLE)
  minSelections   Int       @default(0)
  maxSelections   Int?      // Null = unlimited
  isRequired      Boolean   @default(false)

  // Display
  displayOrder    Int       @default(0)
  isActive        Boolean   @default(true)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  modifiers       Modifier[]
  productGroups   ProductModifierGroup[]
}

enum ModifierSelectionType {
  SINGLE          // Select exactly one (radio buttons)
  MULTIPLE        // Select multiple (checkboxes)
  QUANTITY        // Select with quantity (e.g., 2x extra cheese)
}

model Modifier {
  id              String    @id @default(uuid())
  groupId         String
  group           ModifierGroup @relation(fields: [groupId], references: [id])

  name            String    // "Medium Rare", "No Onions"
  displayName     String?   // Customer-facing
  shortName       String?   // For KDS/tickets: "MR", "NO ONI"

  // Pricing
  priceAdjustment Decimal   @default(0)  // Can be positive or negative
  pricingType     ModifierPricingType @default(FIXED)

  // Kitchen
  kitchenNote     String?   // Special instruction for kitchen
  prepTimeAdjust  Int       @default(0)  // Additional prep time in minutes

  // Dietary/Allergen flags
  isDefault       Boolean   @default(false)
  isActive        Boolean   @default(true)
  displayOrder    Int       @default(0)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  appliedModifiers OrderItemModifier[]
}

enum ModifierPricingType {
  FIXED           // Flat amount adjustment
  PERCENTAGE      // Percentage of item price
  PER_UNIT        // Price per quantity selected
}

model ProductModifierGroup {
  id              String    @id @default(uuid())
  productId       String
  product         Product   @relation(fields: [productId], references: [id])
  modifierGroupId String
  modifierGroup   ModifierGroup @relation(fields: [modifierGroupId], references: [id])

  // Override group settings for this product
  isRequired      Boolean?  // Override group default
  minSelections   Int?
  maxSelections   Int?

  displayOrder    Int       @default(0)

  @@unique([productId, modifierGroupId])
}

model DietaryFlag {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  code            String    // "GF", "V", "VG", "DF", "NF"
  name            String    // "Gluten Free", "Vegetarian"
  description     String?
  icon            String?   // Icon name or emoji
  color           String    @default("#10B981") // Display color

  isAllergen      Boolean   @default(false) // True for allergens
  requiresWarning Boolean   @default(false)
  warningMessage  String?   // "Contains nuts"

  isActive        Boolean   @default(true)

  products        ProductDietaryFlag[]
}

model ProductDietaryFlag {
  id              String    @id @default(uuid())
  productId       String
  product         Product   @relation(fields: [productId], references: [id])
  flagId          String
  flag            DietaryFlag @relation(fields: [flagId], references: [id])

  // Can override at product level
  customWarning   String?

  @@unique([productId, flagId])
}

model OrderItemModifier {
  id              String    @id @default(uuid())
  orderItemId     String
  orderItem       OrderItem @relation(fields: [orderItemId], references: [id])
  modifierId      String
  modifier        Modifier  @relation(fields: [modifierId], references: [id])

  quantity        Int       @default(1)
  unitPrice       Decimal   // Price at time of order
  totalPrice      Decimal   // quantity * unitPrice

  // For "no" modifiers or special notes
  isRemoval       Boolean   @default(false)  // "NO onions"
  customNote      String?   // Free-text instruction

  createdAt       DateTime  @default(now())
}
```

### UX Flow: Modifier Group Setup (Admin)

**Trigger:** Menu > Modifier Groups > New

```
+---------------------------------------------------------------------+
| Create Modifier Group                                          [X]  |
+---------------------------------------------------------------------+
| Name: [Burger Temperature_____]                                      |
| Display Name: [How would you like it cooked?____]                   |
|                                                                      |
| Selection Type:                                                      |
| (*) Single selection (radio buttons)                                |
| ( ) Multiple selections (checkboxes)                                |
| ( ) Quantity selection (+ / -)                                      |
|                                                                      |
| [x] Required - customer must select                                  |
| Min selections: [1___]  Max selections: [1___]                      |
|                                                                      |
| Applies to outlet: [All Outlets_________v]                          |
+---------------------------------------------------------------------+
| Modifier Options:                                         [+ Add]   |
+---------------------------------------------------------------------+
| | Name         | Short | Price  | Kitchen Note        | Default |  |
| |--------------|-------|--------|---------------------|---------|  |
| | Rare         | R     | $0.00  | Red cold center     | [ ]     |  |
| | Medium Rare  | MR    | $0.00  | Warm red center     | [x]     |  |
| | Medium       | M     | $0.00  | Pink center         | [ ]     |  |
| | Medium Well  | MW    | $0.00  | Slightly pink       | [ ]     |  |
| | Well Done    | WD    | $0.00  | No pink             | [ ]     |  |
+---------------------------------------------------------------------+
|                                                                      |
|                                    [Cancel]  [Save Modifier Group]  |
+---------------------------------------------------------------------+
```

### UX Flow: Assign Modifiers to Product

**Trigger:** Product Edit > Modifiers Tab

```
+---------------------------------------------------------------------+
| Club Burger - Modifiers                                             |
+---------------------------------------------------------------------+
| Dietary Flags:                                                       |
| [x] GF Available  [ ] Vegetarian  [ ] Vegan  [ ] Dairy Free         |
| [x] Contains: Gluten, Dairy                                         |
+---------------------------------------------------------------------+
| Modifier Groups:                                       [+ Add Group] |
+---------------------------------------------------------------------+
| 1. Burger Temperature                         [Required] [Edit] [X] |
|    Options: Rare, Medium Rare, Medium, Medium Well, Well Done       |
|                                                                      |
| 2. Add-Ons                                    [Optional] [Edit] [X] |
|    Options: Extra Patty (+$5), Bacon (+$3), Avocado (+$2)          |
|    Max selections: 5                                                |
|                                                                      |
| 3. Remove Items                               [Optional] [Edit] [X] |
|    Options: No Onions, No Pickles, No Lettuce, No Tomato           |
|                                                                      |
| 4. Side Selection                             [Required] [Edit] [X] |
|    Options: Fries, Sweet Potato Fries (+$2), Side Salad (+$1)      |
+---------------------------------------------------------------------+
|                                                [Cancel]  [Save]     |
+---------------------------------------------------------------------+
```

### UX Flow: POS - Add Item with Modifiers

**Trigger:** Add item that has required modifiers

```
+---------------------------------------------------------------------+
| Club Burger - Customize                                        [X]  |
+---------------------------------------------------------------------+
| Base Price: $12.00                                                   |
| Dietary: [GF Available] [Contains: Gluten, Dairy]                   |
+---------------------------------------------------------------------+
|                                                                      |
| * How would you like it cooked? (Required)                          |
| +-------------------------------------------------------------------+
| | ( ) Rare    ( ) Medium Rare   (*) Medium                          |
| | ( ) Medium Well    ( ) Well Done                                   |
| +-------------------------------------------------------------------+
|                                                                      |
| Add-Ons (Optional)                                                   |
| +-------------------------------------------------------------------+
| | [ ] Extra Patty              +$5.00                               |
| | [x] Bacon                    +$3.00                               |
| | [ ] Avocado                  +$2.00                               |
| | [ ] Fried Egg                +$2.00                               |
| +-------------------------------------------------------------------+
|                                                                      |
| Remove Items (Optional)                                              |
| +-------------------------------------------------------------------+
| | [x] No Onions    [ ] No Pickles    [ ] No Lettuce                |
| | [ ] No Tomato    [ ] No Mayo                                      |
| +-------------------------------------------------------------------+
|                                                                      |
| * Choose a Side (Required)                                           |
| +-------------------------------------------------------------------+
| | (*) Fries                    +$0.00                               |
| | ( ) Sweet Potato Fries       +$2.00                               |
| | ( ) Side Salad               +$1.00                               |
| +-------------------------------------------------------------------+
|                                                                      |
| Special Instructions:                                                |
| [Allergy: shellfish - please note in kitchen_______________]       |
|                                                                      |
+---------------------------------------------------------------------+
| Item Total: $12.00 + $3.00 (Bacon) = $15.00                         |
|                                     [Cancel]  [Add to Order]        |
+---------------------------------------------------------------------+
```

### UX Flow: Order Summary with Modifiers

**Trigger:** View current order/check

```
+---------------------------------------------------------------------+
| Table 5 - Order                                                      |
+---------------------------------------------------------------------+
| +-------------------------------------------------------------------+
| | 1x Club Burger                                          $15.00   |
| |    - Medium                                                       |
| |    - + Bacon                                            +$3.00   |
| |    - NO Onions                                                    |
| |    - Fries                                                        |
| |    * Allergy: shellfish                                          |
| +-------------------------------------------------------------------+
| | 1x Caesar Salad [GF] [V]                                $14.00   |
| |    - Dressing on Side                                             |
| |    - + Grilled Chicken                                  +$6.00   |
| +-------------------------------------------------------------------+
| | 2x Iced Tea                                     $4.00 x 2 = $8.00|
| +-------------------------------------------------------------------+
|                                                                      |
| Subtotal:                                                   $43.00  |
| Tax:                                                         $3.01  |
| Total:                                                      $46.01  |
+---------------------------------------------------------------------+
```

### UX Flow: Kitchen Display - Modifiers View

**Trigger:** KDS ticket display

```
+---------------------------------------------------------------------+
| Table 5 - Grill Station                            Order #2456      |
+---------------------------------------------------------------------+
| +-------------------------------------------------------------------+
| | 1x CLUB BURGER                                         [WORKING] |
| |    >>> MEDIUM <<<                                                 |
| |    + BACON                                                        |
| |    NO ONI                                                         |
| |                                                                   |
| |    !! ALLERGY: SHELLFISH !!                                      |
| +-------------------------------------------------------------------+
| | Timer: 00:04:32                              [BUMP] [RECALL]     |
+---------------------------------------------------------------------+
```

---

## Feature 3: Course Firing Control

### Feature Types

| Type | Description | Example |
|------|-------------|---------|
| Course | Meal stage | Appetizer, Entree, Dessert |
| Fire command | Send to kitchen | Fire apps, Fire mains |
| Hold command | Delay preparation | Hold dessert |
| Rush order | Priority preparation | Rush table 5 |
| Course timing | Gap between courses | 15 min between app/main |

### Data Model

```prisma
model CourseType {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])
  outletId        String?
  outlet          Outlet?   @relation(fields: [outletId], references: [id])

  name            String    // "Appetizer", "Entree", "Dessert"
  shortName       String    // "APP", "MAIN", "DES"
  displayOrder    Int       // Sequence: 1, 2, 3

  // Default timing
  defaultHoldMinutes Int    @default(0)  // Auto-hold before firing
  expectedPrepTime   Int    @default(15) // Expected prep time in minutes

  color           String    @default("#3B82F6") // Display color
  isActive        Boolean   @default(true)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  orderItems      OrderItem[]
}

model OrderItem {
  id              String    @id @default(uuid())
  checkId         String
  check           DiningCheck @relation(fields: [checkId], references: [id])

  productId       String
  product         Product   @relation(fields: [productId], references: [id])

  // Course assignment
  courseId        String?
  course          CourseType? @relation(fields: [courseId], references: [id])
  seatNumber      Int?      // For seat-based ordering

  quantity        Int       @default(1)
  unitPrice       Decimal
  totalPrice      Decimal

  // Firing status
  fireStatus      FireStatus @default(HOLD)
  firedAt         DateTime?
  firedBy         String?

  // Kitchen status
  kitchenStatus   KitchenItemStatus @default(PENDING)
  startedAt       DateTime?
  completedAt     DateTime?

  // Timing
  holdUntil       DateTime? // Manual hold time
  rushOrder       Boolean   @default(false)

  // Notes
  kitchenNotes    String?
  serverNotes     String?

  voidedAt        DateTime?
  voidedBy        String?
  voidReason      String?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  modifiers       OrderItemModifier[]
  kitchenEvents   KitchenItemEvent[]
}

enum FireStatus {
  HOLD            // Not sent to kitchen
  FIRED           // Sent to kitchen
  RECALLED        // Pulled back from kitchen
}

enum KitchenItemStatus {
  PENDING         // Waiting to be started
  WORKING         // Being prepared
  READY           // Ready for pickup
  DELIVERED       // Sent to table
  VOID            // Cancelled
}

model KitchenItemEvent {
  id              String    @id @default(uuid())
  orderItemId     String
  orderItem       OrderItem @relation(fields: [orderItemId], references: [id])

  eventType       KitchenEventType
  stationId       String?
  station         KitchenStation? @relation(fields: [stationId], references: [id])

  createdBy       String
  createdAt       DateTime  @default(now())
  notes           String?
}

enum KitchenEventType {
  FIRED           // Sent to kitchen
  STARTED         // Prep started
  COMPLETED       // Item ready
  BUMPED          // Marked as picked up
  RECALLED        // Brought back
  VOIDED          // Cancelled
  RUSH_ADDED      // Rush flag added
  HOLD_ADDED      // Hold flag added
}

model CourseFireSettings {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])
  outletId        String?
  outlet          Outlet?   @relation(fields: [outletId], references: [id])

  // Auto-fire settings
  autoFireEnabled Boolean   @default(false)

  // Timing between courses (in minutes)
  appToMainGap    Int       @default(15)
  mainToDessertGap Int      @default(20)

  // Rush thresholds
  rushAlertMinutes Int      @default(30) // Alert if ticket > X minutes

  // Hold defaults
  defaultHoldCourses String[] // ["DESSERT"] - always hold these

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

### UX Flow: Course Assignment on Order

**Trigger:** Adding items to order

```
+---------------------------------------------------------------------+
| Table 5 - Order Entry                                               |
+---------------------------------------------------------------------+
| Course: [Appetizers v]                          Seat: [All v]       |
+---------------------------------------------------------------------+
| Search: [_____________] [Appetizers] [Entrees] [Sides] [Desserts]  |
+---------------------------------------------------------------------+
|                                                                      |
| +---------------+  +---------------+  +---------------+              |
| | Soup of Day   |  | Caesar Salad  |  | Calamari      |              |
| | $8.00         |  | $14.00        |  | $16.00        |              |
| | [Add]         |  | [Add]         |  | [Add]         |              |
| +---------------+  +---------------+  +---------------+              |
|                                                                      |
+---------------------------------------------------------------------+
| Current Order:                                                       |
+---------------------------------------------------------------------+
| APPETIZERS (Hold)                                          [FIRE]   |
|   1x Soup of Day                               $8.00                |
|   1x Caesar Salad                              $14.00               |
|                                                                      |
| ENTREES (Hold)                                             [FIRE]   |
|   2x Club Burger                               $24.00               |
|   1x Grilled Salmon                            $28.00               |
+---------------------------------------------------------------------+
| [Fire All Courses]  [Hold All]  [Rush Order]  [Send Order]          |
+---------------------------------------------------------------------+
```

### UX Flow: Fire Control Panel

**Trigger:** Server view of active table/check

```
+---------------------------------------------------------------------+
| Table 5 - Fire Control                                         [X]  |
+---------------------------------------------------------------------+
| Server: Tom                        Seated: 12:33 PM (32 min ago)    |
| Covers: 4                          Check #2456                      |
+---------------------------------------------------------------------+
|                                                                      |
| COURSE STATUS:                                                       |
|                                                                      |
| +-------------------------------------------------------------------+
| | APPETIZERS                                                        |
| | Status: [=====DELIVERED=====]                                     |
| | Fired: 12:35   Ready: 12:42   Delivered: 12:44                   |
| | Items: Soup of Day, Caesar Salad                                  |
| +-------------------------------------------------------------------+
|                                                                      |
| +-------------------------------------------------------------------+
| | ENTREES                                                           |
| | Status: [====WORKING====...........]                              |
| | Fired: 12:50   Est. Ready: 13:05                                 |
| | Items: 2x Club Burger, Grilled Salmon                             |
| |                                                                   |
| | [RUSH] [HOLD] [RECALL]                                           |
| +-------------------------------------------------------------------+
|                                                                      |
| +-------------------------------------------------------------------+
| | DESSERTS                                                          |
| | Status: [HOLD - Not Fired]                                        |
| | Items: (none ordered yet)                                         |
| |                                                                   |
| | [FIRE NOW]  [Fire in 15 min]  [Add Items]                        |
| +-------------------------------------------------------------------+
|                                                                      |
+---------------------------------------------------------------------+
| Table Actions: [Add Course] [Comp Item] [Manager]                   |
+---------------------------------------------------------------------+
```

### UX Flow: Fire Confirmation

**Trigger:** Click [FIRE] on course

```
+---------------------------------------------------------------------+
| Fire Course to Kitchen                                         [X]  |
+---------------------------------------------------------------------+
| Table 5 - ENTREES                                                   |
+---------------------------------------------------------------------+
|                                                                      |
| Items to Fire:                                                       |
| +-------------------------------------------------------------------+
| | 2x Club Burger (Medium, Medium Rare)         -> GRILL            |
| | 1x Grilled Salmon (No butter)                -> GRILL            |
| +-------------------------------------------------------------------+
|                                                                      |
| Estimated Prep Time: 12-15 minutes                                  |
|                                                                      |
| Options:                                                             |
| [ ] Rush order (priority preparation)                               |
| [ ] Fire with delay: [____] minutes                                 |
|                                                                      |
| Kitchen Notes:                                                       |
| [VIP table - birthday celebration_______________________]           |
|                                                                      |
|                                    [Cancel]  [Fire to Kitchen]      |
+---------------------------------------------------------------------+
```

### UX Flow: Rush Order Alert

**Trigger:** [RUSH] button or long ticket time

```
+---------------------------------------------------------------------+
| RUSH - Table 5                                                [X]  |
+---------------------------------------------------------------------+
| Current wait time: 28 minutes                                       |
| Target: 20 minutes                                                  |
+---------------------------------------------------------------------+
|                                                                      |
| Items in Kitchen:                                                    |
| +-------------------------------------------------------------------+
| | 2x Club Burger         GRILL       Working (8 min)               |
| | 1x Grilled Salmon      GRILL       Pending                       |
| +-------------------------------------------------------------------+
|                                                                      |
| Rush Reason:                                                         |
| ( ) Guest complaint                                                 |
| (*) Long wait time                                                  |
| ( ) VIP table                                                       |
| ( ) Manager request                                                 |
| ( ) Time constraint (reservation/event)                             |
|                                                                      |
| Note to Kitchen: [Need this ASAP - guest waiting____]              |
|                                                                      |
|                           [Cancel]  [Send Rush Alert]               |
+---------------------------------------------------------------------+
```

### UX Flow: Course Timing Overview (Expo View)

**Trigger:** Kitchen/Expo station display

```
+---------------------------------------------------------------------+
| Course Timing - All Tables                              1:05 PM     |
+---------------------------------------------------------------------+
| Table | Course    | Status     | Time   | Items              | Act |
+---------------------------------------------------------------------+
| T5    | Entrees   | WORKING    | 15 min | 2xBurg, 1xSalmon   | [B] |
| T8    | Appetizers| READY      | 3 min  | Calamari, Soup     | [P] |
| T3    | Entrees   | PENDING    | 0 min  | 4xSteak            | [S] |
| T12   | Desserts  | HOLD       | --     | Waiting for fire   | [F] |
| T2    | Entrees   | DELIVERED  | 22 min | Complete           | [-] |
+---------------------------------------------------------------------+
|                                                                      |
| [B] = Bump   [P] = Pickup Called   [S] = Start   [F] = Fire        |
|                                                                      |
| ALERTS:                                                              |
| [!] Table 5 - Entrees at 15 min (target: 12 min)                   |
| [!] Table 8 - Appetizers ready for pickup                          |
+---------------------------------------------------------------------+
| Legend: [PENDING] [WORKING] [READY] [DELIVERED]                     |
+---------------------------------------------------------------------+
```

---

## Feature 4: Kitchen Display System (KDS)

### Feature Types

| Type | Description | Example |
|------|-------------|---------|
| Kitchen station | Prep area with display | Grill, Saute, Salad |
| Order queue | List of pending items | Tickets waiting |
| Bump | Mark item complete | Bump when ready |
| Recall | Bring back bumped item | Recall for remake |
| Routing | Send to correct station | Burgers to Grill |
| Prep time | Duration tracking | 5:32 elapsed |

### Data Model

```prisma
model KitchenStation {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])
  outletId        String
  outlet          Outlet    @relation(fields: [outletId], references: [id])

  name            String    // "Grill", "Saute", "Salad", "Expo"
  shortName       String    // "GRL", "SAU", "SAL", "EXP"
  displayOrder    Int

  // Display settings
  color           String    @default("#3B82F6")
  displayColumns  Int       @default(4) // Tickets per row

  // Routing
  isExpo          Boolean   @default(false) // Final assembly station

  // Device
  deviceId        String?   // Associated display device

  isActive        Boolean   @default(true)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  routingRules    StationRoutingRule[]
  tickets         KitchenTicket[]
  events          KitchenItemEvent[]
}

model StationRoutingRule {
  id              String    @id @default(uuid())
  stationId       String
  station         KitchenStation @relation(fields: [stationId], references: [id])

  // Route by category or product
  categoryId      String?
  category        Category? @relation(fields: [categoryId], references: [id])
  productId       String?
  product         Product?  @relation(fields: [productId], references: [id])

  // Priority (lower = higher priority for matching)
  priority        Int       @default(0)

  isActive        Boolean   @default(true)

  @@unique([stationId, categoryId, productId])
}

model KitchenTicket {
  id              String    @id @default(uuid())
  checkId         String
  check           DiningCheck @relation(fields: [checkId], references: [id])
  stationId       String
  station         KitchenStation @relation(fields: [stationId], references: [id])

  // Ticket info
  ticketNumber    Int       // Sequential for the day
  tableNumber     String
  serverName      String
  covers          Int
  courseType      String?

  // Timing
  firedAt         DateTime
  startedAt       DateTime?
  completedAt     DateTime?
  bumpedAt        DateTime?

  // Status
  status          TicketStatus @default(PENDING)
  isRush          Boolean   @default(false)

  // Items for this station
  items           KitchenTicketItem[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum TicketStatus {
  PENDING         // Waiting to start
  WORKING         // In preparation
  READY           // Complete, waiting for pickup
  BUMPED          // Picked up/served
  RECALLED        // Brought back for correction
  VOID            // Cancelled
}

model KitchenTicketItem {
  id              String    @id @default(uuid())
  ticketId        String
  ticket          KitchenTicket @relation(fields: [ticketId], references: [id])
  orderItemId     String
  orderItem       OrderItem @relation(fields: [orderItemId], references: [id])

  quantity        Int
  productName     String
  modifiers       String    // Formatted modifier string
  seatNumber      Int?

  status          KitchenItemStatus @default(PENDING)

  // Individual item timing
  startedAt       DateTime?
  completedAt     DateTime?

  notes           String?
  isAllergy       Boolean   @default(false)
  allergyNote     String?
}

model KdsSettings {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])
  outletId        String
  outlet          Outlet    @relation(fields: [outletId], references: [id])

  // Display
  ticketFontSize  Int       @default(16)
  showSeatNumbers Boolean   @default(true)
  showModifiers   Boolean   @default(true)
  showAllergies   Boolean   @default(true)
  highlightAllergies Boolean @default(true)

  // Timing alerts (in minutes)
  warningTime     Int       @default(10)  // Yellow alert
  urgentTime      Int       @default(15)  // Red alert

  // Audio
  newOrderSound   Boolean   @default(true)
  rushOrderSound  Boolean   @default(true)
  urgentAlertSound Boolean  @default(true)

  // Auto-bump
  autoBumpEnabled Boolean   @default(false)
  autoBumpMinutes Int       @default(30)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model EightySixedItem {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])
  outletId        String
  outlet          Outlet    @relation(fields: [outletId], references: [id])

  productId       String
  product         Product   @relation(fields: [productId], references: [id])

  reason          String?
  eightySixedBy   String
  eightySixedAt   DateTime  @default(now())

  // Auto-restore
  restoreAt       DateTime? // Null = manual restore only
  restoredBy      String?
  restoredAt      DateTime?

  isActive        Boolean   @default(true)
}
```

### UX Flow: KDS - Main Station View

**Trigger:** Kitchen display screen for specific station

```
+---------------------------------------------------------------------+
| GRILL STATION                                        1:15 PM        |
+---------------------------------------------------------------------+
| Active: 4 tickets | Avg Time: 8:32 | Rush: 1 | 86'd: Lamb Chops   |
+---------------------------------------------------------------------+
|                                                                      |
| +---------------+ +---------------+ +---------------+ +----------+  |
| | T5    RUSH    | | T12           | | T8            | | T3       |  |
| | 4 covers      | | 2 covers      | | 6 covers      | | 4 covers |  |
| | Server: Tom   | | Server: Maria | | Server: Tom   | | Svr: Sam |  |
| +---------------+ +---------------+ +---------------+ +----------+  |
| | ENTREES       | | ENTREES       | | APPETIZERS    | | ENTREES  |  |
| |               | |               | |               | |          |  |
| | 2x BURGER     | | 1x RIBEYE     | | 1x CALAMARI   | | 4x STEAK |  |
| |   - MED       | |   - MR        | |               | |   - 2xMR |  |
| |   - MR +BCN   | |   - NO ONION  | | 2x WINGS      | |   - 1xM  |  |
| |               | |               | |   - EXTRA HOT | |   - 1xWD |  |
| | 1x SALMON     | | 1x CHICKEN    | |               | |          |  |
| |   - GF        | |   - PLAIN     | |               | |          |  |
| |   !! NUT !!   | |               | |               | |          |  |
| +---------------+ +---------------+ +---------------+ +----------+  |
| | 00:08:32      | | 00:05:45      | | 00:02:12      | | 00:00:45|  |
| | [WORKING]     | | [WORKING]     | | [PENDING]     | | [START] |  |
| | [BUMP]        | | [BUMP]        | | [START]       | |          |  |
| +---------------+ +---------------+ +---------------+ +----------+  |
|                                                                      |
| Color Key: [GREEN: <5min] [YELLOW: 5-10min] [RED: >10min] [RUSH]   |
+---------------------------------------------------------------------+
| [View All Stations] [86 Item] [Recall] [Settings]                   |
+---------------------------------------------------------------------+
```

### UX Flow: KDS - Ticket Detail

**Trigger:** Tap on ticket

```
+---------------------------------------------------------------------+
| Ticket Detail - Table 5                                        [X]  |
+---------------------------------------------------------------------+
| Order #2456                           Fired: 1:07 PM (8:32 ago)     |
| Server: Tom                           Covers: 4                     |
| Course: ENTREES                       Status: WORKING               |
+---------------------------------------------------------------------+
|                                                                      |
| Items:                                                               |
| +-------------------------------------------------------------------+
| | [x] 2x CLUB BURGER                                                |
| |     Seat 1: Medium                              [DONE]            |
| |     Seat 2: Medium Rare, + Bacon                [WORKING]         |
| +-------------------------------------------------------------------+
| | [ ] 1x GRILLED SALMON (GF)                                        |
| |     Seat 3: No butter                           [PENDING]         |
| |     !! ALLERGY: TREE NUTS - SEPARATE PREP !!                     |
| +-------------------------------------------------------------------+
|                                                                      |
| Special Notes:                                                       |
| VIP Table - Birthday celebration. Comp dessert approved.            |
|                                                                      |
| Timeline:                                                            |
| 1:07 PM - Fired to kitchen                                          |
| 1:08 PM - Started by Carlos                                         |
| 1:10 PM - Burger 1 complete                                         |
|                                                                      |
| Actions:                                                             |
| [Mark All Done]  [Bump Ticket]  [Recall]  [Add Note]  [Alert Expo] |
+---------------------------------------------------------------------+
```

### UX Flow: KDS - Expo Station

**Trigger:** Expo display (final assembly)

```
+---------------------------------------------------------------------+
| EXPO STATION                                         1:15 PM        |
+---------------------------------------------------------------------+
| Ready for Pickup: 3 | Awaiting Items: 2 | Avg Wait: 2:15           |
+---------------------------------------------------------------------+
|                                                                      |
| READY FOR PICKUP:                                                    |
| +-------------------------------------------------------------------+
| | T8 - APPETIZERS                           00:02:45 READY         |
| | Calamari, 2x Wings (Extra Hot)                                   |
| | Server: Tom                                      [CALL SERVER]   |
| +-------------------------------------------------------------------+
| | T12 - ENTREES                             00:01:12 READY         |
| | Ribeye (MR), Chicken (Plain)                                     |
| | Server: Maria                                    [CALL SERVER]   |
| +-------------------------------------------------------------------+
|                                                                      |
| AWAITING ITEMS:                                                      |
| +-------------------------------------------------------------------+
| | T5 - ENTREES                              Waiting: Salmon        |
| | [x] 2x Burger (complete)                                         |
| | [ ] 1x Salmon (Grill - 3 min)                                    |
| +-------------------------------------------------------------------+
|                                                                      |
| RECENTLY BUMPED (Last 15 min):                                       |
| +-------------------------------------------------------------------+
| | T2 - ENTREES   Bumped 1:12 PM   [RECALL]                         |
| | T7 - DESSERTS  Bumped 1:08 PM   [RECALL]                         |
| +-------------------------------------------------------------------+
|                                                                      |
+---------------------------------------------------------------------+
| [Bump All Ready] [View Kitchen Status] [Call All Servers]           |
+---------------------------------------------------------------------+
```

### UX Flow: 86'd Items Management

**Trigger:** [86 Item] button or Settings > 86'd Items

```
+---------------------------------------------------------------------+
| 86'd Items - Out of Stock                                      [X]  |
+---------------------------------------------------------------------+
| Currently 86'd:                                                      |
| +-------------------------------------------------------------------+
| | Lamb Chops                    Since: 12:30 PM    [Restore]       |
| | Reason: Sold out - delivery tomorrow                             |
| +-------------------------------------------------------------------+
| | Lobster Bisque               Since: 11:45 AM    [Restore]        |
| | Reason: Limited supply                                            |
| | Auto-restore: 6:00 PM                                            |
| +-------------------------------------------------------------------+
|                                                                      |
| Add Item to 86 List:                                                 |
| Search: [_______________] [Search]                                  |
|                                                                      |
| Recent Items:                                                        |
| [Ribeye Steak]  [NY Strip]  [Seafood Platter]  [Daily Special]     |
|                                                                      |
| Selected: [None]                                                     |
| Reason: [________________]                                          |
| Auto-restore: [ ] Enable  Time: [____]                             |
|                                                                      |
|                                              [Cancel]  [86 Item]    |
+---------------------------------------------------------------------+
```

### UX Flow: Station Routing Setup

**Trigger:** Settings > KDS > Station Routing

```
+---------------------------------------------------------------------+
| Kitchen Station Routing                                             |
+---------------------------------------------------------------------+
| Stations:                                          [+ Add Station]  |
+---------------------------------------------------------------------+
|                                                                      |
| +-------------------------------------------------------------------+
| | GRILL                                              [Edit] [X]    |
| | Categories: Burgers, Steaks, Grilled Seafood                     |
| | Specific Items: Grilled Chicken, BBQ Ribs                        |
| +-------------------------------------------------------------------+
| | SAUTE                                              [Edit] [X]    |
| | Categories: Pasta, Stir Fry                                      |
| | Specific Items: Risotto, Pan-Seared Fish                         |
| +-------------------------------------------------------------------+
| | FRY                                                [Edit] [X]    |
| | Categories: Appetizers - Fried, Sides - Fried                    |
| | Specific Items: French Fries, Onion Rings, Calamari              |
| +-------------------------------------------------------------------+
| | SALAD                                              [Edit] [X]    |
| | Categories: Salads, Cold Appetizers                              |
| +-------------------------------------------------------------------+
| | DESSERT                                            [Edit] [X]    |
| | Categories: Desserts, Ice Cream                                   |
| +-------------------------------------------------------------------+
| | EXPO (Assembly)                                    [Edit]        |
| | All items route here after station completion                    |
| +-------------------------------------------------------------------+
|                                                                      |
+---------------------------------------------------------------------+
```

---

## Feature 5: Split/Merge Checks

### Feature Types

| Type | Description | Example |
|------|-------------|---------|
| Split by item | Move items to new check | Apps on one, mains on another |
| Split by seat | Each seat is separate check | Seat 1: $45, Seat 2: $38 |
| Split evenly | Divide total equally | 4 ways = $25 each |
| Split by amount | Custom amount per check | $50 on one, rest on other |
| Merge checks | Combine multiple checks | Join tables 5 and 6 |
| Transfer items | Move items between checks | Move drink to bar tab |

### Data Model

```prisma
model DiningCheck {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])
  outletId        String
  outlet          Outlet    @relation(fields: [outletId], references: [id])

  checkNumber     String    // "CHK-2456"

  // Table assignment
  tableId         String?
  table           DiningTable? @relation(fields: [tableId], references: [id])

  // Guest info
  covers          Int       @default(1)
  guestName       String?
  memberId        String?
  member          Member?   @relation(fields: [memberId], references: [id])

  // Server
  serverId        String
  server          User      @relation(fields: [serverId], references: [id])

  // Timing
  openedAt        DateTime  @default(now())
  closedAt        DateTime?

  // Totals
  subtotal        Decimal   @default(0)
  discountTotal   Decimal   @default(0)
  taxTotal        Decimal   @default(0)
  tipAmount       Decimal   @default(0)
  grandTotal      Decimal   @default(0)

  // Status
  status          CheckStatus @default(OPEN)

  // Split/merge tracking
  parentCheckId   String?   // If this was split from another check
  parentCheck     DiningCheck? @relation("CheckSplits", fields: [parentCheckId], references: [id])
  splitChecks     DiningCheck[] @relation("CheckSplits")

  splitType       SplitType?
  splitDetails    Json?     // Store split configuration

  // Payment
  payments        CheckPayment[]
  items           OrderItem[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum CheckStatus {
  OPEN            // Active, items being added
  PRINTED         // Check printed for review
  SPLIT           // Has been split
  PAID            // Fully paid
  VOID            // Cancelled
  COMP            // Comped (free)
}

enum SplitType {
  BY_ITEM         // Items moved to separate checks
  BY_SEAT         // Each seat separate
  EQUAL           // Split evenly
  BY_AMOUNT       // Custom amounts
  MERGED          // Multiple checks combined
}

model CheckPayment {
  id              String    @id @default(uuid())
  checkId         String
  check           DiningCheck @relation(fields: [checkId], references: [id])

  paymentMethod   PaymentMethod
  amount          Decimal
  tipAmount       Decimal   @default(0)

  // Card details (if applicable)
  cardLast4       String?
  cardBrand       String?
  authCode        String?

  // Member account (if applicable)
  memberId        String?
  member          Member?   @relation(fields: [memberId], references: [id])

  // Reference
  transactionId   String?

  status          PaymentStatus @default(PENDING)
  processedAt     DateTime?
  processedBy     String

  createdAt       DateTime  @default(now())
}

enum PaymentMethod {
  CASH
  CREDIT_CARD
  DEBIT_CARD
  MEMBER_ACCOUNT
  GIFT_CARD
  COMP
  SPLIT_CASH_CARD
}

enum PaymentStatus {
  PENDING
  COMPLETED
  DECLINED
  REFUNDED
  VOID
}

model CheckTransfer {
  id              String    @id @default(uuid())

  fromCheckId     String
  fromCheck       DiningCheck @relation("TransferFrom", fields: [fromCheckId], references: [id])
  toCheckId       String
  toCheck         DiningCheck @relation("TransferTo", fields: [toCheckId], references: [id])

  // What was transferred
  itemIds         String[]  // Order item IDs
  amount          Decimal   // Total amount transferred

  reason          String?
  transferredBy   String
  transferredAt   DateTime  @default(now())
}
```

### UX Flow: Check Overview

**Trigger:** View table check

```
+---------------------------------------------------------------------+
| Check #2456 - Table 5                                          [X]  |
+---------------------------------------------------------------------+
| Server: Tom                        Covers: 4       Time: 45 min     |
| Member: John Smith (M-1234)                                         |
+---------------------------------------------------------------------+
|                                                                      |
| SEAT 1 - John                                                        |
|   1x Club Burger (Medium, Bacon)                           $15.00   |
|   1x Iced Tea                                               $4.00   |
|                                                                      |
| SEAT 2 - Sarah                                                       |
|   1x Caesar Salad (Chicken)                                $20.00   |
|   1x Glass White Wine                                      $12.00   |
|                                                                      |
| SEAT 3 - Mike                                                        |
|   1x Ribeye Steak (MR)                                     $38.00   |
|   1x Beer (IPA)                                             $8.00   |
|                                                                      |
| SEAT 4 - Lisa                                                        |
|   1x Grilled Salmon                                        $28.00   |
|   1x Sparkling Water                                        $5.00   |
|                                                                      |
+---------------------------------------------------------------------+
| Subtotal:                                                  $130.00  |
| Tax (7%):                                                    $9.10  |
| Total:                                                     $139.10  |
+---------------------------------------------------------------------+
| [Split Check]  [Transfer Items]  [Add Discount]  [Print]  [Pay]    |
+---------------------------------------------------------------------+
```

### UX Flow: Split Check - Method Selection

**Trigger:** [Split Check] button

```
+---------------------------------------------------------------------+
| Split Check #2456                                              [X]  |
+---------------------------------------------------------------------+
| Current Total: $139.10 (4 covers)                                   |
+---------------------------------------------------------------------+
|                                                                      |
| How would you like to split?                                         |
|                                                                      |
| +-------------------------------------------------------------------+
| | [Icon]  SPLIT BY SEAT                                            |
| |         Each guest gets their own check                          |
| |         4 checks: $19.00, $32.00, $46.00, $33.00                 |
| +-------------------------------------------------------------------+
|                                                                      |
| +-------------------------------------------------------------------+
| | [Icon]  SPLIT EVENLY                                             |
| |         Divide total equally                                      |
| |         4 ways = $34.78 each                                     |
| +-------------------------------------------------------------------+
|                                                                      |
| +-------------------------------------------------------------------+
| | [Icon]  SPLIT BY ITEM                                            |
| |         Choose which items go on each check                      |
| +-------------------------------------------------------------------+
|                                                                      |
| +-------------------------------------------------------------------+
| | [Icon]  SPLIT BY AMOUNT                                          |
| |         Enter custom amounts for each check                      |
| +-------------------------------------------------------------------+
|                                                                      |
| Number of checks: [2 v]  [3]  [4]  [Custom: __]                    |
|                                                                      |
|                                              [Cancel]  [Continue]   |
+---------------------------------------------------------------------+
```

### UX Flow: Split by Seat

**Trigger:** Select "Split by Seat"

```
+---------------------------------------------------------------------+
| Split by Seat - Preview                                        [X]  |
+---------------------------------------------------------------------+
|                                                                      |
| +---------------+ +---------------+ +---------------+ +----------+  |
| | CHECK A       | | CHECK B       | | CHECK C       | | CHECK D  |  |
| | Seat 1: John  | | Seat 2: Sarah | | Seat 3: Mike  | | Seat 4   |  |
| +---------------+ +---------------+ +---------------+ +----------+  |
| | Burger  $15   | | Salad   $20   | | Ribeye  $38   | | Salmon   |  |
| | Tea      $4   | | Wine    $12   | | Beer     $8   | |   $28    |  |
| |               | |               | |               | | Water $5 |  |
| +---------------+ +---------------+ +---------------+ +----------+  |
| | Sub:   $19.00 | | Sub:   $32.00 | | Sub:   $46.00 | | Sub:     |  |
| | Tax:    $1.33 | | Tax:    $2.24 | | Tax:    $3.22 | |  $33.00  |  |
| | Total: $20.33 | | Total: $34.24 | | Total: $49.22 | | Tax:     |  |
| |               | |               | |               | |   $2.31  |  |
| |               | |               | |               | | Tot:     |  |
| |               | |               | |               | |  $35.31  |  |
| +---------------+ +---------------+ +---------------+ +----------+  |
|                                                                      |
| [ ] Move shared items (apps) to one check                           |
| [ ] Split shared items evenly                                       |
|                                                                      |
|                            [Back]  [Create 4 Checks]                |
+---------------------------------------------------------------------+
```

### UX Flow: Split by Item

**Trigger:** Select "Split by Item"

```
+---------------------------------------------------------------------+
| Split by Item                                                  [X]  |
+---------------------------------------------------------------------+
|                                                                      |
| Drag items between checks or click to move:                          |
|                                                                      |
| CHECK A                          CHECK B                             |
| +---------------------------+    +---------------------------+       |
| | [ ] Burger        $15.00 |    | [ ] Caesar Salad   $20.00 |       |
| | [x] Iced Tea       $4.00 |    | [x] White Wine     $12.00 |       |
| | [ ] Ribeye        $38.00 |    | [ ] Salmon         $28.00 |       |
| | [ ] Beer           $8.00 |    | [x] Sparkling Wtr   $5.00 |       |
| |                          |    |                           |       |
| |     [<- Move] [Move ->]  |    |     [<- Move] [Move ->]   |       |
| +---------------------------+    +---------------------------+       |
| | Subtotal:        $65.00  |    | Subtotal:         $65.00  |       |
| | Tax:              $4.55  |    | Tax:               $4.55  |       |
| | Total:           $69.55  |    | Total:            $69.55  |       |
| +---------------------------+    +---------------------------+       |
|                                                                      |
| Selected: 2 items                                                    |
|                                                                      |
| [+ Add Check C]                                                      |
|                                                                      |
|                            [Back]  [Create 2 Checks]                |
+---------------------------------------------------------------------+
```

### UX Flow: Split Evenly

**Trigger:** Select "Split Evenly"

```
+---------------------------------------------------------------------+
| Split Evenly                                                   [X]  |
+---------------------------------------------------------------------+
| Total: $139.10                                                      |
+---------------------------------------------------------------------+
|                                                                      |
| Number of ways: [2] [3] [4] [5] [Custom: __]                       |
|                                                                      |
| Split 4 ways:                                                        |
|                                                                      |
| +---------------+ +---------------+ +---------------+ +----------+  |
| | CHECK A       | | CHECK B       | | CHECK C       | | CHECK D  |  |
| | Equal Share   | | Equal Share   | | Equal Share   | | Equal    |  |
| |               | |               | |               | |          |  |
| | Subtotal:     | | Subtotal:     | | Subtotal:     | | Subtotal:|  |
| |   $32.50      | |   $32.50      | |   $32.50      | |  $32.50  |  |
| | Tax: $2.28    | | Tax: $2.28    | | Tax: $2.28    | | Tax:     |  |
| | Tip: $___     | | Tip: $___     | | Tip: $___     | |   $2.26  |  |
| | Total:        | | Total:        | | Total:        | | Tip:$___ |  |
| |   $34.78      | |   $34.78      | |   $34.78      | | Total:   |  |
| |               | |               | |               | |  $34.76  |  |
| +---------------+ +---------------+ +---------------+ +----------+  |
|                                                                      |
| Rounding: Last check absorbs cents difference                       |
|                                                                      |
|                            [Back]  [Create 4 Checks]                |
+---------------------------------------------------------------------+
```

### UX Flow: Split by Amount

**Trigger:** Select "Split by Amount"

```
+---------------------------------------------------------------------+
| Split by Amount                                                [X]  |
+---------------------------------------------------------------------+
| Total to Split: $139.10                                             |
+---------------------------------------------------------------------+
|                                                                      |
| Enter amount for each check:                                         |
|                                                                      |
| +-------------------------------------------------------------------+
| | Check A:  $[50.00____]     Remaining: $89.10                     |
| | Check B:  $[89.10____]     Remaining: $0.00                      |
| +-------------------------------------------------------------------+
|                                                                      |
| [+ Add Another Check]                                               |
|                                                                      |
| Summary:                                                             |
| Check A: $50.00 + tax $3.50 = $53.50                               |
| Check B: $89.10 + tax $6.24 = $95.34                               |
|                                                                      |
| [ ] Calculate tax per check                                         |
| [x] Add tax proportionally                                          |
|                                                                      |
|                            [Back]  [Create 2 Checks]                |
+---------------------------------------------------------------------+
```

### UX Flow: Merge Tables/Checks

**Trigger:** [Merge Tables] from floor plan or check view

```
+---------------------------------------------------------------------+
| Merge Tables                                                   [X]  |
+---------------------------------------------------------------------+
|                                                                      |
| Select tables to merge:                                              |
|                                                                      |
| Currently occupied tables:                                           |
| +-------------------------------------------------------------------+
| | [x] Table 5 - 4 covers - Check #2456 - $139.10                   |
| |     Server: Tom | Time: 45 min                                    |
| +-------------------------------------------------------------------+
| | [x] Table 6 - 2 covers - Check #2457 - $68.00                    |
| |     Server: Tom | Time: 30 min                                    |
| +-------------------------------------------------------------------+
| | [ ] Table 8 - 6 covers - Check #2458 - $215.00                   |
| |     Server: Maria | Time: 1h 15min                               |
| +-------------------------------------------------------------------+
|                                                                      |
| Merge Options:                                                       |
| (*) Single check (combine all items)                                |
| ( ) Keep separate checks (tables only)                              |
|                                                                      |
| Primary table: [Table 5 v] (for table number)                       |
| Assign server: [Tom________v]                                       |
|                                                                      |
| New check total: $207.10 (6 covers)                                 |
|                                                                      |
|                                    [Cancel]  [Merge Tables]         |
+---------------------------------------------------------------------+
```

### UX Flow: Transfer Items Between Checks

**Trigger:** [Transfer Items] button

```
+---------------------------------------------------------------------+
| Transfer Items                                                 [X]  |
+---------------------------------------------------------------------+
|                                                                      |
| From: Check #2456 (Table 5)                                         |
| To:   [Select check or table...____________v]                       |
|       - Check #2457 (Table 6)                                       |
|       - Check #2458 (Table 8)                                       |
|       - Bar Tab: John Smith                                         |
|       - [New Check]                                                 |
|                                                                      |
| Select items to transfer:                                            |
| +-------------------------------------------------------------------+
| | [ ] 1x Club Burger                                   $15.00      |
| | [x] 1x Iced Tea                                       $4.00      |
| | [ ] 1x Caesar Salad                                  $20.00      |
| | [x] 1x Glass White Wine                              $12.00      |
| | [ ] 1x Ribeye Steak                                  $38.00      |
| | [x] 1x Beer                                           $8.00      |
| +-------------------------------------------------------------------+
|                                                                      |
| Transfer amount: $24.00                                             |
| Reason: [Moving drinks to bar tab____]                             |
|                                                                      |
|                                    [Cancel]  [Transfer Items]       |
+---------------------------------------------------------------------+
```

---

## Feature 6: Server Assignment + Tips

### Feature Types

| Type | Description | Example |
|------|-------------|---------|
| Server section | Assigned tables | Section A: Tables 1-6 |
| Server assignment | Who serves which table | Table 5: Tom |
| Tip entry | Record gratuity | $25 tip on $125 check |
| Tip pooling | Share tips across staff | Pool 20% for bussers |
| Tip distribution | Calculate shares | Server: $80, Busser: $20 |
| Tip reporting | Track for payroll | Daily/weekly tip totals |

### Data Model

```prisma
model ServerAssignment {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])
  outletId        String
  outlet          Outlet    @relation(fields: [outletId], references: [id])

  serverId        String
  server          User      @relation(fields: [serverId], references: [id])

  // Can assign to section or specific tables
  sectionId       String?
  section         TableSection? @relation(fields: [sectionId], references: [id])
  tableIds        String[]  // Specific table IDs if not using section

  // Shift timing
  shiftStart      DateTime
  shiftEnd        DateTime?

  // Support staff
  supportStaff    ServerSupportStaff[]

  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model ServerSupportStaff {
  id              String    @id @default(uuid())
  assignmentId    String
  assignment      ServerAssignment @relation(fields: [assignmentId], references: [id])

  staffId         String
  staff           User      @relation(fields: [staffId], references: [id])
  role            SupportRole

  tipSharePercent Decimal   // Their share from this server's tips
}

enum SupportRole {
  BUSSER
  FOOD_RUNNER
  BARTENDER
  HOST
  BARBACK
}

model TipPoolConfig {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])
  outletId        String
  outlet          Outlet    @relation(fields: [outletId], references: [id])

  name            String    // "Standard Pool", "Weekend Pool"
  description     String?

  // Pool configuration
  poolingType     TipPoolType @default(PERCENTAGE)

  // Distribution rules
  distributions   TipPoolDistribution[]

  // When to apply
  isDefault       Boolean   @default(false)
  daysOfWeek      Int[]     // 0-6 for Sun-Sat, empty = all days

  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum TipPoolType {
  PERCENTAGE      // Each role gets % of total pool
  POINTS          // Points-based distribution
  HOURS           // Based on hours worked
}

model TipPoolDistribution {
  id              String    @id @default(uuid())
  poolConfigId    String
  poolConfig      TipPoolConfig @relation(fields: [poolConfigId], references: [id])

  role            TipPoolRole
  percentage      Decimal?  // For PERCENTAGE type
  pointsPerHour   Decimal?  // For POINTS type
}

enum TipPoolRole {
  SERVER
  BARTENDER
  BUSSER
  FOOD_RUNNER
  HOST
  BARBACK
  KITCHEN       // Tip-out to BOH
}

model TipRecord {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])
  outletId        String
  outlet          Outlet    @relation(fields: [outletId], references: [id])

  // Source
  checkId         String
  check           DiningCheck @relation(fields: [checkId], references: [id])
  paymentId       String?
  payment         CheckPayment? @relation(fields: [paymentId], references: [id])

  // Original tip
  tipAmount       Decimal
  tipType         TipType

  // Server who received
  serverId        String
  server          User      @relation(fields: [serverId], references: [id])

  // Pool info
  pooledAmount    Decimal   @default(0)
  retainedAmount  Decimal   // Server keeps after pooling

  // Distribution
  distributions   TipDistribution[]

  // Status
  isDistributed   Boolean   @default(false)
  distributedAt   DateTime?

  shiftDate       DateTime  @db.Date
  createdAt       DateTime  @default(now())
}

enum TipType {
  CASH
  CREDIT_CARD
  MEMBER_ACCOUNT
  AUTO_GRATUITY
}

model TipDistribution {
  id              String    @id @default(uuid())
  tipRecordId     String
  tipRecord       TipRecord @relation(fields: [tipRecordId], references: [id])

  recipientId     String
  recipient       User      @relation(fields: [recipientId], references: [id])
  role            TipPoolRole

  amount          Decimal
  calculationNote String?   // "20% of $50 pool"

  // Payout tracking
  paidOut         Boolean   @default(false)
  paidOutAt       DateTime?
  paidOutBy       String?
}

model ShiftTipSummary {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])
  outletId        String
  outlet          Outlet    @relation(fields: [outletId], references: [id])

  shiftDate       DateTime  @db.Date

  // Totals
  totalTips       Decimal
  cashTips        Decimal
  cardTips        Decimal
  autoGratuity    Decimal

  // Pool totals
  totalPooled     Decimal

  // Staff summaries
  staffSummaries  Json      // Array of { staffId, role, grossTips, poolContribution, poolReceived, netTips }

  // Status
  isFinalized     Boolean   @default(false)
  finalizedBy     String?
  finalizedAt     DateTime?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

### UX Flow: Server Section Assignment

**Trigger:** F&B > Server Assignments

```
+---------------------------------------------------------------------+
| Server Assignments - Dinner Service                  Feb 1, 2026    |
+---------------------------------------------------------------------+
| Shift: 5:00 PM - 11:00 PM                       [Edit Assignments]  |
+---------------------------------------------------------------------+
|                                                                      |
| Floor Plan View:                                                     |
|                                                                      |
|      Section A (Maria)              Section B (Tom)                 |
|      [Blue]                         [Green]                         |
|    +--------+  +--------+         +------------+                    |
|    | T1     |  | T2     |         | T5         |                    |
|    +--------+  +--------+         +------------+                    |
|    +--------+  +--------+         +------------+                    |
|    | T3     |  | T4     |         | T6         |                    |
|    +--------+  +--------+         +------------+                    |
|                                                                      |
|      Section C (Sam)                Bar (Kim)                       |
|      [Yellow]                       [Purple]                        |
|    +--------+  +--------+         +------+------+                   |
|    | T7     |  | T8     |         | B1   | B2   |                   |
|    +--------+  +--------+         +------+------+                   |
|                                                                      |
| Support Staff:                                                       |
| Busser: Alex (Sections A, B) | David (Section C, Bar)              |
| Runner: Lisa (All sections)                                         |
|                                                                      |
+---------------------------------------------------------------------+
| [Modify Sections]  [Add Server]  [Transfer Table]  [Print]          |
+---------------------------------------------------------------------+
```

### UX Flow: Assign Server to Section

**Trigger:** [Edit Assignments] or drag server to section

```
+---------------------------------------------------------------------+
| Assign Server                                                  [X]  |
+---------------------------------------------------------------------+
| Available Servers:                                                   |
| +-------------------------------------------------------------------+
| | Maria Chen        Scheduled: 5pm-11pm    Experience: Senior      |
| | Tom Wilson        Scheduled: 5pm-11pm    Experience: Senior      |
| | Sam Rodriguez     Scheduled: 5pm-10pm    Experience: Mid         |
| | Kim Park          Scheduled: 6pm-11pm    Experience: Junior      |
| +-------------------------------------------------------------------+
|                                                                      |
| Assign to:                                                           |
| ( ) Section A (Tables 1-4)              Currently: Unassigned       |
| (*) Section B (Tables 5-6)              Currently: Unassigned       |
| ( ) Specific Tables: [____________]                                  |
|                                                                      |
| Server: [Tom Wilson________v]                                       |
|                                                                      |
| Support Staff:                                                       |
| [ ] Busser: [Alex________v]    Tip share: [15__]%                  |
| [ ] Runner: [Lisa________v]    Tip share: [5___]%                  |
|                                                                      |
|                                    [Cancel]  [Assign Server]        |
+---------------------------------------------------------------------+
```

### UX Flow: Enter Tip at Checkout

**Trigger:** Payment completion

```
+---------------------------------------------------------------------+
| Add Tip - Check #2456                                          [X]  |
+---------------------------------------------------------------------+
| Check Total: $139.10                           Server: Tom          |
| Payment: Visa ****4521                                              |
+---------------------------------------------------------------------+
|                                                                      |
| Suggested Tips:                                                      |
| +-------------------+ +-------------------+ +-------------------+    |
| | 18%               | | 20%               | | 22%               |    |
| | $25.04            | | $27.82            | | $30.60            |    |
| +-------------------+ +-------------------+ +-------------------+    |
|                                                                      |
| Custom tip: $[27.82_____]                                           |
|                                                                      |
| -OR-                                                                |
|                                                                      |
| [ ] No tip                                                          |
| [ ] Cash tip (record separately)                                    |
|                                                                      |
| Grand Total: $139.10 + $27.82 = $166.92                            |
|                                                                      |
|                                    [Cancel]  [Complete Payment]     |
+---------------------------------------------------------------------+
```

### UX Flow: Tip Pool Configuration

**Trigger:** Settings > F&B > Tip Pooling

```
+---------------------------------------------------------------------+
| Tip Pool Configuration                                              |
+---------------------------------------------------------------------+
| Active Pool: Standard Pool                         [+ Create New]   |
+---------------------------------------------------------------------+
|                                                                      |
| Pool Name: [Standard Pool_______]                                   |
| Description: [Default tip sharing arrangement______]                |
|                                                                      |
| Pooling Type:                                                        |
| (*) Percentage of tips                                              |
| ( ) Points-based (by hours)                                         |
|                                                                      |
| Distribution Rules:                                                  |
| +-------------------------------------------------------------------+
| | Role           | Pool Contribution | Receive From Pool          |
| |----------------|-------------------|---------------------------|  |
| | Server         | 20% of their tips | Direct tips - contrib     |  |
| | Bartender      | 10% of their tips | 15% of pool               |  |
| | Busser         | N/A               | 35% of pool               |  |
| | Food Runner    | N/A               | 25% of pool               |  |
| | Host           | N/A               | 15% of pool               |  |
| | Kitchen        | N/A               | 10% of pool               |  |
| +-------------------------------------------------------------------+
|                                                                      |
| Apply on: [x] Mon [x] Tue [x] Wed [x] Thu [x] Fri [x] Sat [x] Sun  |
|                                                                      |
| [ ] Set as default pool                                             |
|                                                                      |
|                                    [Cancel]  [Save Configuration]   |
+---------------------------------------------------------------------+
```

### UX Flow: Server Shift Summary

**Trigger:** End of shift or Reports > Server Tips

```
+---------------------------------------------------------------------+
| Shift Summary - Tom Wilson                          Feb 1, 2026     |
+---------------------------------------------------------------------+
| Shift: 5:00 PM - 11:00 PM                          Section B        |
+---------------------------------------------------------------------+
|                                                                      |
| SALES SUMMARY:                                                       |
| +-------------------------------------------------------------------+
| | Checks Closed:          12                                        |
| | Total Sales:            $1,842.00                                 |
| | Average Check:          $153.50                                   |
| | Covers Served:          38                                        |
| +-------------------------------------------------------------------+
|                                                                      |
| TIP SUMMARY:                                                         |
| +-------------------------------------------------------------------+
| | Cash Tips:              $85.00                                    |
| | Credit Card Tips:       $312.00                                   |
| | Auto-Gratuity:          $48.00                                    |
| | GROSS TIPS:             $445.00                                   |
| |                                                                   |
| | Pool Contribution (20%): -$89.00                                  |
| | Pool Received:           +$0.00                                   |
| | Support Tip-out:         -$22.50                                  |
| |   - Alex (Busser): $22.50                                        |
| | NET TIPS:               $333.50                                   |
| +-------------------------------------------------------------------+
|                                                                      |
| Cash to Deposit:          $85.00 (cash tips)                        |
| Card Tips (on paycheck):  $248.50                                   |
|                                                                      |
| [Print Summary]  [Email Summary]  [Manager Approval]                |
+---------------------------------------------------------------------+
```

### UX Flow: Daily Tip Distribution Report

**Trigger:** Manager > End of Day > Tip Distribution

```
+---------------------------------------------------------------------+
| Daily Tip Distribution                              Feb 1, 2026     |
+---------------------------------------------------------------------+
| Outlet: Main Dining                    Status: Pending Finalization |
+---------------------------------------------------------------------+
|                                                                      |
| POOL SUMMARY:                                                        |
| +-------------------------------------------------------------------+
| | Total Tips Collected:               $2,156.00                     |
| | Total Pool Contributions:           $431.20                       |
| | Kitchen Tip-out (10%):              $43.12                       |
| | Distributable Pool:                 $388.08                       |
| +-------------------------------------------------------------------+
|                                                                      |
| STAFF DISTRIBUTION:                                                  |
| +-------------------------------------------------------------------+
| | Staff           | Role      | Gross   | Contrib | Recv  | Net    |
| |-----------------|-----------|---------|---------|-------|--------|
| | Tom Wilson      | Server    | $445.00 | -$89.00 | $0    | $333.50|
| | Maria Chen      | Server    | $512.00 | -$102.40| $0    | $387.10|
| | Sam Rodriguez   | Server    | $328.00 | -$65.60 | $0    | $247.40|
| | Kim Park        | Bartender | $425.00 | -$42.50 | $58.21| $418.21|
| | Alex Davis      | Busser    | $0      | $0      | $135.83| $135.83|
| | David Lee       | Busser    | $0      | $0      | $135.83| $135.83|
| | Lisa Martinez   | Runner    | $0      | $0      | $97.02| $97.02 |
| | Host Pool       | Host      | $0      | $0      | $58.21| $58.21 |
| +-------------------------------------------------------------------+
|                                                                      |
| Kitchen Tip-out: $43.12 (to be added to BOH pool)                  |
|                                                                      |
| [Adjust Distribution]  [Print Report]  [Finalize & Lock]           |
+---------------------------------------------------------------------+
```

---

## Feature 7: Dining Reservations

### Feature Types

| Type | Description | Example |
|------|-------------|---------|
| Reservation | Table booking in advance | 7pm for 4 people |
| Party size | Number of guests | 4 guests |
| Special request | Guest notes | Birthday, dietary needs |
| Waitlist | No tables available | Add to wait |
| Confirmation | Verify booking | Email/SMS confirm |
| No-show | Guest didn't arrive | Mark as no-show |

### Data Model

```prisma
model DiningReservation {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])
  outletId        String
  outlet          Outlet    @relation(fields: [outletId], references: [id])

  // Reservation details
  reservationNumber String  @unique  // "RES-2456"

  // Guest info
  memberId        String?
  member          Member?   @relation(fields: [memberId], references: [id])
  guestName       String
  guestPhone      String?
  guestEmail      String?

  // Booking details
  partySize       Int
  date            DateTime  @db.Date
  time            DateTime  @db.Time
  duration        Int       @default(90)  // Minutes

  // Table assignment
  tableId         String?
  table           DiningTable? @relation(fields: [tableId], references: [id])
  preferredSection String?
  preferredTableType String?  // "booth", "window", "patio"

  // Special requests
  occasion        ReservationOccasion?
  specialRequests String?
  dietaryNotes    String?

  // Internal notes
  internalNotes   String?
  vipStatus       Boolean   @default(false)

  // Status tracking
  status          ReservationStatus @default(PENDING)
  confirmedAt     DateTime?
  confirmedBy     String?   // "EMAIL", "SMS", "PHONE"

  // Check-in
  arrivedAt       DateTime?
  seatedAt        DateTime?

  // No-show handling
  noShowAt        DateTime?
  noShowReason    String?
  noShowFee       Decimal?

  // Cancellation
  cancelledAt     DateTime?
  cancelledBy     String?
  cancellationReason String?

  // Source
  source          ReservationSource @default(PHONE)
  bookedBy        String?   // Staff ID if booked by staff

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  reminders       ReservationReminder[]
  check           DiningCheck?
}

enum ReservationStatus {
  PENDING         // Awaiting confirmation
  CONFIRMED       // Guest confirmed
  WAITLISTED      // No availability, on waitlist
  SEATED          // Guest has arrived and seated
  COMPLETED       // Meal finished
  NO_SHOW         // Guest didn't arrive
  CANCELLED       // Cancelled by guest or staff
}

enum ReservationOccasion {
  BIRTHDAY
  ANNIVERSARY
  BUSINESS
  DATE_NIGHT
  CELEBRATION
  HOLIDAY
  OTHER
}

enum ReservationSource {
  PHONE
  ONLINE_MEMBER_PORTAL
  ONLINE_WIDGET
  WALK_IN
  EMAIL
  THIRD_PARTY     // OpenTable, Resy, etc.
}

model ReservationReminder {
  id              String    @id @default(uuid())
  reservationId   String
  reservation     DiningReservation @relation(fields: [reservationId], references: [id])

  type            ReminderType
  scheduledFor    DateTime
  sentAt          DateTime?

  status          ReminderStatus @default(PENDING)
  responseAction  String?   // "CONFIRMED", "CANCELLED", "NO_RESPONSE"
}

enum ReminderType {
  EMAIL_24H
  SMS_24H
  EMAIL_2H
  SMS_2H
}

enum ReminderStatus {
  PENDING
  SENT
  DELIVERED
  FAILED
  RESPONDED
}

model Waitlist {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])
  outletId        String
  outlet          Outlet    @relation(fields: [outletId], references: [id])

  // Guest info
  guestName       String
  guestPhone      String
  memberId        String?
  member          Member?   @relation(fields: [memberId], references: [id])

  partySize       Int

  // Timing
  addedAt         DateTime  @default(now())
  estimatedWait   Int?      // Minutes
  quotedTime      DateTime?

  // Preferences
  preferredSection String?
  notes           String?

  // Status
  status          WaitlistStatus @default(WAITING)
  notifiedAt      DateTime?
  seatedAt        DateTime?
  leftAt          DateTime?

  // Conversion
  tableId         String?
  reservationId   String?   // If converted to reservation
}

enum WaitlistStatus {
  WAITING
  NOTIFIED        // Table ready, guest notified
  SEATED
  LEFT            // Left before being seated
  NO_SHOW         // Didn't respond to notification
}

model ReservationSettings {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])
  outletId        String    @unique
  outlet          Outlet    @relation(fields: [outletId], references: [id])

  // Online booking
  onlineBookingEnabled Boolean @default(true)
  advanceBookingDays Int     @default(30)
  minAdvanceHours    Int     @default(2)

  // Party size
  minPartySize    Int       @default(1)
  maxPartySize    Int       @default(10)
  largePartySize  Int       @default(8)  // Requires phone booking

  // Timing
  defaultDuration Int       @default(90)  // Minutes
  turnoverBuffer  Int       @default(15)  // Minutes between reservations

  // Reminders
  sendEmail24h    Boolean   @default(true)
  sendSms24h      Boolean   @default(false)
  sendEmail2h     Boolean   @default(false)
  sendSms2h       Boolean   @default(true)

  // No-show policy
  noShowFeeEnabled Boolean  @default(false)
  noShowFeeAmount  Decimal?
  noShowGracePeriod Int     @default(15) // Minutes

  // Cancellation
  cancellationCutoff Int    @default(24) // Hours before

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model ReservationBlackout {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])
  outletId        String
  outlet          Outlet    @relation(fields: [outletId], references: [id])

  name            String    // "Private Event", "Holiday Closure"
  date            DateTime  @db.Date

  // Time range (null = all day)
  startTime       DateTime? @db.Time
  endTime         DateTime? @db.Time

  // Scope
  affectedTables  String[]  // Empty = all tables
  reason          String?

  isActive        Boolean   @default(true)
  createdBy       String
  createdAt       DateTime  @default(now())
}
```

### UX Flow: Reservation Calendar View

**Trigger:** F&B > Reservations

```
+---------------------------------------------------------------------+
| Dining Reservations - Main Dining                   Feb 1, 2026     |
+---------------------------------------------------------------------+
| [< Prev Day] [Today] [Next Day >]     [Week View] [Day View] [List] |
+---------------------------------------------------------------------+
|                                                                      |
| Time    | Table 1 | Table 2 | Table 3 | Table 4 | Table 5 | Table 6 |
| --------|---------|---------|---------|---------|---------|---------|
| 5:00 PM |         |         |         |         |         |         |
| 5:30 PM | Smith   |         |         | Johnson | Chen    |         |
|         | 2 ppl   |         |         | 4 ppl   | 6 ppl   |         |
| 6:00 PM | [....cont...]     |         | [....cont...]     | Wilson  |
|         |         |         |         |         | 4 ppl   |         |
| 6:30 PM |         | Davis   |         |         | [...cont...]     |
|         |         | 2 ppl   |         |         |         |         |
| 7:00 PM | Lee     | [..cont..]       | Miller  |         | Kim     |
|         | 4 ppl   |         |         | 6 ppl   |         | 2 ppl   |
| 7:30 PM | [...cont...]      |         | [...cont...]      | [..cont]|
|                                                                      |
+---------------------------------------------------------------------+
| Today: 12 reservations | 48 covers | Waitlist: 3                    |
| [+ New Reservation]  [View Waitlist]  [Print Schedule]              |
+---------------------------------------------------------------------+
```

### UX Flow: Create Reservation

**Trigger:** [+ New Reservation] or click empty time slot

```
+---------------------------------------------------------------------+
| New Reservation                                                [X]  |
+---------------------------------------------------------------------+
|                                                                      |
| Guest Information:                                                   |
| Member: [Search member...___________] [Look Up]                     |
| Name:   [John Smith_________________]                                |
| Phone:  [555-123-4567_______________]                                |
| Email:  [john@email.com_____________]                                |
|                                                                      |
| Reservation Details:                                                 |
| Date:       [Feb 1, 2026_____] [calendar icon]                      |
| Time:       [7:00 PM_________v]                                     |
| Party Size: [-] [4] [+]                                             |
| Duration:   [90 minutes______v]                                     |
|                                                                      |
| Table Preference:                                                    |
| ( ) No preference                                                   |
| (*) Specific table: [Table 5__v]                                    |
| ( ) Section: [Patio__________v]                                     |
| ( ) Table type: [Booth_______v]                                     |
|                                                                      |
| Special Occasion:                                                    |
| [ ] Birthday  [ ] Anniversary  [ ] Business  [ ] Other: [____]     |
|                                                                      |
| Special Requests:                                                    |
| [Need high chair for infant. Allergies: shellfish___________]      |
|                                                                      |
| Internal Notes (staff only):                                         |
| [VIP member - GM's guest_____________________________________]     |
|                                                                      |
| [ ] Mark as VIP                                                     |
| [x] Send confirmation email                                         |
| [x] Send 24-hour reminder                                           |
|                                                                      |
|                          [Cancel]  [Check Availability]             |
+---------------------------------------------------------------------+
```

### UX Flow: Availability Check

**Trigger:** [Check Availability] after entering details

```
+---------------------------------------------------------------------+
| Availability - Feb 1, 2026 at 7:00 PM for 4                    [X]  |
+---------------------------------------------------------------------+
|                                                                      |
| AVAILABLE OPTIONS:                                                   |
|                                                                      |
| +-------------------------------------------------------------------+
| | 7:00 PM - Table 5 (4-top, Window)                    [Select]    |
| | Section B, Server: Tom                                            |
| +-------------------------------------------------------------------+
| | 7:00 PM - Table 3 (4-top, Main Floor)                [Select]    |
| | Section A, Server: Maria                                          |
| +-------------------------------------------------------------------+
| | 7:15 PM - Table 4 (4-top, Booth)                     [Select]    |
| | Section A, Server: Maria                                          |
| +-------------------------------------------------------------------+
|                                                                      |
| NEARBY TIMES ALSO AVAILABLE:                                         |
| [6:30 PM] [6:45 PM] [7:30 PM] [7:45 PM]                            |
|                                                                      |
| NOT AVAILABLE:                                                       |
| 7:00 PM - Table 6 (Reserved: Chen party)                           |
| 7:00 PM - Table 1 (Reserved: Lee party)                            |
|                                                                      |
| [ ] Add to waitlist if no tables available                          |
|                                                                      |
|                                    [Back]  [Confirm Reservation]    |
+---------------------------------------------------------------------+
```

### UX Flow: Reservation Confirmation

**Trigger:** Reservation created

```
+---------------------------------------------------------------------+
| Reservation Confirmed                                               |
+---------------------------------------------------------------------+
|                                                                      |
|                          [checkmark icon]                           |
|                                                                      |
| Reservation #RES-2456 has been created!                             |
|                                                                      |
| +-------------------------------------------------------------------+
| | Guest: John Smith                                                 |
| | Date: Saturday, February 1, 2026                                  |
| | Time: 7:00 PM                                                     |
| | Party: 4 guests                                                   |
| | Table: 5 (Window)                                                 |
| +-------------------------------------------------------------------+
|                                                                      |
| Confirmation sent to:                                                |
| [x] Email: john@email.com                                           |
| [ ] SMS: 555-123-4567                                               |
|                                                                      |
| Reminders scheduled:                                                 |
| - Email: Jan 31, 2026 at 7:00 PM (24 hours before)                 |
| - SMS: Feb 1, 2026 at 5:00 PM (2 hours before)                     |
|                                                                      |
| [View Reservation]  [New Reservation]  [Close]                      |
+---------------------------------------------------------------------+
```

### UX Flow: Waitlist Management

**Trigger:** [View Waitlist] or F&B > Waitlist

```
+---------------------------------------------------------------------+
| Waitlist - Main Dining                              Feb 1, 2026     |
+---------------------------------------------------------------------+
| Current Wait: ~25 minutes                                [+ Add]    |
+---------------------------------------------------------------------+
|                                                                      |
| WAITING:                                                             |
| +-------------------------------------------------------------------+
| | 1. Johnson Family        4 ppl      Added: 6:45 PM (15 min ago) |
| |    Phone: 555-234-5678   Quoted: 25 min    Pref: Any             |
| |                                             [Seat] [Notify] [X]  |
| +-------------------------------------------------------------------+
| | 2. Williams Party        2 ppl      Added: 6:52 PM (8 min ago)  |
| |    Phone: 555-345-6789   Quoted: 35 min    Pref: Bar area        |
| |                                             [Seat] [Notify] [X]  |
| +-------------------------------------------------------------------+
| | 3. Garcia                6 ppl      Added: 6:55 PM (5 min ago)  |
| |    Phone: 555-456-7890   Quoted: 45 min    Pref: Main dining     |
| |    Note: Birthday dinner - need cake timing                      |
| |                                             [Seat] [Notify] [X]  |
| +-------------------------------------------------------------------+
|                                                                      |
| RECENTLY SEATED:                                                     |
| +-------------------------------------------------------------------+
| | Brown (2 ppl) - Seated 6:40 PM at Table 2 - Wait was 18 min     |
| | Chen (4 ppl) - Seated 6:35 PM at Table 5 - Wait was 22 min      |
| +-------------------------------------------------------------------+
|                                                                      |
| Average wait tonight: 20 minutes                                    |
+---------------------------------------------------------------------+
```

### UX Flow: Add to Waitlist

**Trigger:** [+ Add] on waitlist

```
+---------------------------------------------------------------------+
| Add to Waitlist                                                [X]  |
+---------------------------------------------------------------------+
|                                                                      |
| Guest Name: [Garcia_______________]                                  |
| Phone:      [555-456-7890_________]                                  |
| Party Size: [-] [6] [+]                                             |
|                                                                      |
| [ ] Member: [Search...____________]                                  |
|                                                                      |
| Seating Preference:                                                  |
| ( ) No preference                                                   |
| ( ) Indoor only                                                     |
| (*) Main dining room                                                |
| ( ) Patio                                                           |
| ( ) Bar area                                                        |
|                                                                      |
| Notes: [Birthday dinner - need cake timing__________]              |
|                                                                      |
| Current estimated wait: 45 minutes                                  |
| Quote time: [45____] minutes                                        |
|                                                                      |
| [x] Send SMS when table ready                                       |
|                                                                      |
|                                    [Cancel]  [Add to Waitlist]      |
+---------------------------------------------------------------------+
```

### UX Flow: Seat from Waitlist

**Trigger:** [Seat] button or table becomes available

```
+---------------------------------------------------------------------+
| Seat Party - Johnson Family                                    [X]  |
+---------------------------------------------------------------------+
| Party: 4 guests                                                      |
| Wait time: 18 minutes                                               |
| Preference: Any                                                      |
+---------------------------------------------------------------------+
|                                                                      |
| Available Tables:                                                    |
| +-------------------------------------------------------------------+
| | [x] Table 4 (4-top, Main Floor)       Section A - Maria         |
| |     Status: Just cleared, ready                                   |
| +-------------------------------------------------------------------+
| | [ ] Table 7 (6-top, Main Floor)       Section C - Sam           |
| |     Status: Available                                             |
| +-------------------------------------------------------------------+
|                                                                      |
| Server: [Maria Chen_____v]                                          |
|                                                                      |
| Notes for server:                                                    |
| [Waited 18 min - prioritize greeting_____]                         |
|                                                                      |
|                                    [Cancel]  [Seat Party]           |
+---------------------------------------------------------------------+
```

### UX Flow: Reservation Check-In

**Trigger:** Guest arrives for reservation

```
+---------------------------------------------------------------------+
| Check-In: Smith Reservation                                    [X]  |
+---------------------------------------------------------------------+
| Reservation #RES-2456                                               |
+---------------------------------------------------------------------+
|                                                                      |
| Guest: John Smith (Member #M-1234)                                  |
| Party: 4 guests                                                      |
| Time: 7:00 PM (on time)                                             |
| Table: 5 (Window)                                                    |
|                                                                      |
| Special Requests:                                                    |
| - Need high chair for infant                                        |
| - Allergies: shellfish                                              |
|                                                                      |
| Occasion: Birthday                                                   |
| Internal Notes: VIP member - GM's guest                             |
|                                                                      |
| Arrival Status:                                                      |
| (*) Full party arrived                                              |
| ( ) Partial party (waiting for others)                              |
| ( ) Party size changed: [____] guests                               |
|                                                                      |
| Table Status: [Ready - proceed to seat v]                           |
|                                                                      |
| [ ] Table needs additional setup time: [____] min                   |
|                                                                      |
|                          [Cancel]  [Check In & Seat]                |
+---------------------------------------------------------------------+
```

### UX Flow: No-Show Handling

**Trigger:** Reservation time + grace period passed

```
+---------------------------------------------------------------------+
| No-Show Alert: Chen Reservation                               [X]  |
+---------------------------------------------------------------------+
| Reservation #RES-2455                                               |
+---------------------------------------------------------------------+
|                                                                      |
| Guest: David Chen                                                    |
| Time: 6:30 PM (32 minutes ago)                                      |
| Grace Period: 15 minutes (exceeded)                                 |
| Party: 6 guests                                                      |
| Table: 6 (currently held)                                           |
|                                                                      |
| Contact Attempts:                                                    |
| [ ] Called guest phone: 555-987-6543                               |
| [ ] Left voicemail                                                  |
| [ ] Sent SMS reminder                                               |
|                                                                      |
| Actions:                                                             |
| ( ) Continue waiting (extend hold)                                  |
| ( ) Mark as late arrival                                            |
| (*) Mark as no-show                                                 |
| ( ) Cancel reservation                                              |
|                                                                      |
| No-Show Fee: [ ] Apply $50 no-show fee                             |
| Reason: [Guest did not answer calls______]                         |
|                                                                      |
| [x] Release table for walk-ins                                      |
| [x] Log for member history                                          |
|                                                                      |
|                                    [Keep Waiting]  [Confirm Action] |
+---------------------------------------------------------------------+
```

### UX Flow: Reservation Settings

**Trigger:** Settings > F&B > Reservations

```
+---------------------------------------------------------------------+
| Reservation Settings - Main Dining                                   |
+---------------------------------------------------------------------+
|                                                                      |
| ONLINE BOOKING:                                                      |
| [x] Enable online reservations                                       |
| Advance booking: [30____] days                                       |
| Minimum notice: [2_____] hours                                       |
|                                                                      |
| PARTY SIZE:                                                          |
| Minimum: [1____]  Maximum: [10___]                                  |
| Large party (phone only): [8____]+ guests                           |
|                                                                      |
| TIMING:                                                              |
| Default reservation duration: [90____] minutes                       |
| Turnover buffer: [15____] minutes                                    |
|                                                                      |
| TIME SLOTS:                                                          |
| Available times: [5:00 PM] to [10:00 PM]                            |
| Interval: [15____] minutes                                           |
| Last seating: [9:30 PM_____]                                        |
|                                                                      |
| REMINDERS:                                                           |
| [x] Email 24 hours before                                           |
| [ ] SMS 24 hours before                                             |
| [ ] Email 2 hours before                                            |
| [x] SMS 2 hours before                                              |
|                                                                      |
| NO-SHOW POLICY:                                                      |
| [x] Enable no-show fee                                              |
| Fee amount: $[50.00____]                                            |
| Grace period: [15____] minutes                                       |
|                                                                      |
| CANCELLATION:                                                        |
| Cutoff: [24____] hours before reservation                           |
| [x] Allow member self-cancellation                                  |
|                                                                      |
|                                    [Cancel]  [Save Settings]        |
+---------------------------------------------------------------------+
```

---

## Summary

| Feature | Priority | Complexity |
|---------|----------|------------|
| 1. Floor Plan / Table Management | Critical | High |
| 2. Order Modifiers | Critical | Medium |
| 3. Course Firing Control | Critical | Medium |
| 4. Kitchen Display System (KDS) | Critical | High |
| 5. Split/Merge Checks | Critical | Medium |
| 6. Server Assignment + Tips | Medium | Medium |
| 7. Dining Reservations | Medium | Medium |

**Recommended Implementation Order:**

1. Floor Plan / Table Management (foundational for F&B)
2. Order Modifiers (required for food orders)
3. Course Firing Control (kitchen communication)
4. Kitchen Display System (depends on firing control)
5. Split/Merge Checks (payment flexibility)
6. Server Assignment + Tips (staff management)
7. Dining Reservations (guest experience)

**Integration Notes:**

- All F&B features integrate with existing POS infrastructure (payments, discounts, member accounts)
- KDS requires network connectivity to kitchen displays
- Reservations can integrate with member portal for self-service booking
- Tips integrate with payroll systems for reporting
- Floor plan data syncs across all host/server stations in real-time
