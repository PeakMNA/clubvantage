# POS Phase 4: F&B Module - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement full-service Food & Beverage dining operations with floor plans, table management, order modifiers, course firing, KDS, split/merge checks, server assignment, tips, and dining reservations.

**Architecture:** The F&B module extends the existing POS infrastructure with restaurant-specific features. Core entities (DiningArea, DiningTable, FnbOrder, KitchenStation) are managed through dedicated services. Real-time updates for KDS use the existing PubSub infrastructure. Orders link to the existing BookingLineItem model for unified billing.

**Tech Stack:** Prisma ORM, NestJS GraphQL, TanStack Query, React, Tailwind CSS, Radix UI primitives, WebSockets (via existing PubSub).

---

## Prerequisites

Before starting implementation:
1. Ensure POS Phase 1-3 features are complete
2. Create feature branch: `git checkout -b feature/pos-phase4-fnb`
3. Verify dev environment: `pnpm dev`

---

## Part 1: Floor Plan & Table Management

### Task 1: Add F&B Prisma Models (Core Tables)

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Step 1: Add F&B enums**

Add after the existing enums:

```prisma
// ─────────────────────────────────────────────────────────────
// F&B MODULE ENUMS
// ─────────────────────────────────────────────────────────────

enum DiningTableStatus {
  AVAILABLE
  OCCUPIED
  RESERVED
  BLOCKED
  CLEANING
}

enum DiningTableShape {
  ROUND
  SQUARE
  RECTANGLE
  OVAL
  CUSTOM
}

enum FnbOrderStatus {
  DRAFT
  OPEN
  SENT_TO_KITCHEN
  IN_PROGRESS
  READY
  SERVED
  PAID
  CANCELLED
}

enum CourseType {
  APPETIZER
  SOUP
  SALAD
  MAIN
  DESSERT
  BEVERAGE
  OTHER
}

enum CourseFiringStatus {
  WAITING
  FIRED
  IN_PROGRESS
  READY
  SERVED
}

enum KitchenOrderStatus {
  PENDING
  IN_PROGRESS
  READY
  SERVED
  CANCELLED
  EIGHTY_SIXED
}

enum ModifierType {
  SINGLE_SELECT
  MULTI_SELECT
  TEXT_INPUT
  QUANTITY
}

enum DietaryFlag {
  VEGETARIAN
  VEGAN
  GLUTEN_FREE
  DAIRY_FREE
  NUT_FREE
  HALAL
  KOSHER
  SPICY
  SHELLFISH_FREE
}

enum ReservationStatus {
  PENDING
  CONFIRMED
  SEATED
  COMPLETED
  CANCELLED
  NO_SHOW
}

enum TipDistributionMethod {
  EQUAL
  PERCENTAGE
  POINTS
  CUSTOM
}
```

**Step 2: Add DiningArea model**

```prisma
// ─────────────────────────────────────────────────────────────
// F&B FLOOR PLAN & TABLE MANAGEMENT
// ─────────────────────────────────────────────────────────────

/// Dining area (e.g., Main Dining, Patio, Bar)
model DiningArea {
  id              String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId          String         @db.Uuid
  name            String         @db.VarChar(100)
  code            String         @db.VarChar(20)
  description     String?
  floorPlanSvg    String?        // SVG data for floor plan layout
  floorPlanImage  String?        @db.VarChar(500) // URL to floor plan image
  displayOrder    Int            @default(0)
  isActive        Boolean        @default(true)
  operatingHours  Json           @default("{}")
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  club            Club           @relation(fields: [clubId], references: [id], onDelete: Cascade)
  tables          DiningTable[]
  reservations    DiningReservation[]

  @@unique([clubId, code])
  @@index([clubId])
  @@map("dining_areas")
}

/// Dining table within an area
model DiningTable {
  id              String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  areaId          String             @db.Uuid
  tableNumber     String             @db.VarChar(20)
  name            String?            @db.VarChar(100)
  capacity        Int                @default(4)
  minCapacity     Int                @default(1)
  shape           DiningTableShape   @default(RECTANGLE)
  status          DiningTableStatus  @default(AVAILABLE)

  // Position on floor plan (percentage-based for responsiveness)
  positionX       Decimal            @default(0) @db.Decimal(5, 2)
  positionY       Decimal            @default(0) @db.Decimal(5, 2)
  width           Decimal            @default(10) @db.Decimal(5, 2)
  height          Decimal            @default(10) @db.Decimal(5, 2)
  rotation        Int                @default(0)

  // Combinable tables
  isCombined      Boolean            @default(false)
  combinedWith    String[]           @default([]) // Array of table IDs
  parentTableId   String?            @db.Uuid

  isActive        Boolean            @default(true)
  sortOrder       Int                @default(0)
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  area            DiningArea         @relation(fields: [areaId], references: [id], onDelete: Cascade)
  parentTable     DiningTable?       @relation("CombinedTables", fields: [parentTableId], references: [id])
  childTables     DiningTable[]      @relation("CombinedTables")
  orders          FnbOrder[]
  reservations    DiningReservation[]
  sessions        TableSession[]

  @@unique([areaId, tableNumber])
  @@index([areaId])
  @@index([status])
  @@map("dining_tables")
}

/// Table session (tracks one seating from sit to pay)
model TableSession {
  id              String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tableId         String         @db.Uuid
  serverId        String         @db.Uuid
  guestCount      Int            @default(1)
  startedAt       DateTime       @default(now())
  endedAt         DateTime?
  reservationId   String?        @db.Uuid
  notes           String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  table           DiningTable    @relation(fields: [tableId], references: [id])
  server          FnbServer      @relation(fields: [serverId], references: [id])
  reservation     DiningReservation? @relation(fields: [reservationId], references: [id])
  orders          FnbOrder[]

  @@index([tableId])
  @@index([serverId])
  @@map("table_sessions")
}
```

**Step 3: Generate Prisma client**

```bash
cd database && pnpm prisma generate
```

**Step 4: Create migration**

```bash
cd database && pnpm prisma migrate dev --name add_fnb_floor_plan_tables
```

**Step 5: Commit**

```bash
git add database/prisma/
git commit -m "feat(db): add F&B floor plan and table management models

- Add DiningTableStatus, DiningTableShape enums
- Add DiningArea model for floor plan sections
- Add DiningTable model with position/layout data
- Add TableSession model for tracking seatings"
```

---

### Task 2: Add F&B Order and Menu Models

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Step 1: Add menu and order models**

```prisma
// ─────────────────────────────────────────────────────────────
// F&B MENU & MODIFIERS
// ─────────────────────────────────────────────────────────────

/// F&B Menu category
model FnbMenuCategory {
  id              String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId          String         @db.Uuid
  name            String         @db.VarChar(100)
  description     String?
  imageUrl        String?        @db.VarChar(500)
  courseType      CourseType     @default(OTHER)
  sortOrder       Int            @default(0)
  isActive        Boolean        @default(true)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  club            Club           @relation(fields: [clubId], references: [id], onDelete: Cascade)
  items           FnbMenuItem[]

  @@index([clubId])
  @@map("fnb_menu_categories")
}

/// F&B Menu item
model FnbMenuItem {
  id              String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  categoryId      String             @db.Uuid
  name            String             @db.VarChar(200)
  description     String?
  imageUrl        String?            @db.VarChar(500)
  price           Decimal            @db.Decimal(10, 2)
  taxRate         Decimal            @default(7) @db.Decimal(5, 2)
  taxType         TaxType            @default(ADD)
  courseType      CourseType         @default(OTHER)
  prepTimeMinutes Int                @default(15)
  dietaryFlags    DietaryFlag[]      @default([])
  allergens       String[]           @default([])
  calories        Int?
  isAvailable     Boolean            @default(true)
  isEightySixed   Boolean            @default(false) // 86'd - out of stock
  eightySixedAt   DateTime?
  eightySixedBy   String?            @db.Uuid
  sortOrder       Int                @default(0)
  isActive        Boolean            @default(true)
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  category        FnbMenuCategory    @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  modifierGroups  FnbModifierGroup[]
  orderItems      FnbOrderItem[]
  stationRouting  KitchenStationItem[]

  @@index([categoryId])
  @@index([isAvailable, isActive])
  @@map("fnb_menu_items")
}

/// Modifier group (e.g., "Choose your protein", "Add toppings")
model FnbModifierGroup {
  id              String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId          String         @db.Uuid
  name            String         @db.VarChar(100)
  description     String?
  modifierType    ModifierType   @default(SINGLE_SELECT)
  isRequired      Boolean        @default(false)
  minSelections   Int            @default(0)
  maxSelections   Int            @default(1)
  sortOrder       Int            @default(0)
  isActive        Boolean        @default(true)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  club            Club           @relation(fields: [clubId], references: [id], onDelete: Cascade)
  menuItems       FnbMenuItem[]
  modifiers       FnbModifier[]

  @@index([clubId])
  @@map("fnb_modifier_groups")
}

/// Individual modifier option
model FnbModifier {
  id              String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  groupId         String             @db.Uuid
  name            String             @db.VarChar(100)
  priceAdjustment Decimal            @default(0) @db.Decimal(10, 2)
  isDefault       Boolean            @default(false)
  sortOrder       Int                @default(0)
  isActive        Boolean            @default(true)
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  group           FnbModifierGroup   @relation(fields: [groupId], references: [id], onDelete: Cascade)
  orderItemMods   FnbOrderItemModifier[]

  @@index([groupId])
  @@map("fnb_modifiers")
}

// ─────────────────────────────────────────────────────────────
// F&B ORDERS
// ─────────────────────────────────────────────────────────────

/// F&B Order (check)
model FnbOrder {
  id              String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId          String         @db.Uuid
  orderNumber     String         @db.VarChar(30)
  tableId         String?        @db.Uuid
  sessionId       String?        @db.Uuid
  serverId        String         @db.Uuid
  memberId        String?        @db.Uuid
  guestName       String?        @db.VarChar(200)
  guestCount      Int            @default(1)
  status          FnbOrderStatus @default(DRAFT)

  // Order type
  isTabOrder      Boolean        @default(false) // Running tab
  isTakeout       Boolean        @default(false)
  isDelivery      Boolean        @default(false)

  // Totals
  subtotal        Decimal        @default(0) @db.Decimal(12, 2)
  taxAmount       Decimal        @default(0) @db.Decimal(12, 2)
  discountAmount  Decimal        @default(0) @db.Decimal(12, 2)
  tipAmount       Decimal        @default(0) @db.Decimal(12, 2)
  totalAmount     Decimal        @default(0) @db.Decimal(12, 2)
  paidAmount      Decimal        @default(0) @db.Decimal(12, 2)

  // Split check reference
  parentOrderId   String?        @db.Uuid
  splitFromId     String?        @db.Uuid

  notes           String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  openedAt        DateTime       @default(now())
  closedAt        DateTime?

  club            Club           @relation(fields: [clubId], references: [id], onDelete: Cascade)
  table           DiningTable?   @relation(fields: [tableId], references: [id])
  session         TableSession?  @relation(fields: [sessionId], references: [id])
  server          FnbServer      @relation(fields: [serverId], references: [id])
  member          Member?        @relation(fields: [memberId], references: [id])
  parentOrder     FnbOrder?      @relation("SplitOrders", fields: [parentOrderId], references: [id])
  splitOrders     FnbOrder[]     @relation("SplitOrders")
  items           FnbOrderItem[]
  courseFirings   CourseFiring[]
  payments        FnbPayment[]
  tipAllocations  TipAllocation[]

  @@unique([clubId, orderNumber])
  @@index([clubId])
  @@index([tableId])
  @@index([serverId])
  @@index([status])
  @@map("fnb_orders")
}

/// F&B Order item
model FnbOrderItem {
  id              String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  orderId         String               @db.Uuid
  menuItemId      String               @db.Uuid
  seatNumber      Int?                 // For split by seat
  courseNumber    Int                  @default(1)
  quantity        Int                  @default(1)
  unitPrice       Decimal              @db.Decimal(10, 2)
  modifierTotal   Decimal              @default(0) @db.Decimal(10, 2)
  subtotal        Decimal              @db.Decimal(10, 2)
  taxAmount       Decimal              @db.Decimal(10, 2)
  totalAmount     Decimal              @db.Decimal(10, 2)
  specialRequests String?
  dietaryNotes    String?
  status          KitchenOrderStatus   @default(PENDING)
  firedAt         DateTime?
  readyAt         DateTime?
  servedAt        DateTime?
  voidedAt        DateTime?
  voidReason      String?
  voidedBy        String?              @db.Uuid
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt

  order           FnbOrder             @relation(fields: [orderId], references: [id], onDelete: Cascade)
  menuItem        FnbMenuItem          @relation(fields: [menuItemId], references: [id])
  modifiers       FnbOrderItemModifier[]
  kitchenTickets  KitchenTicketItem[]

  @@index([orderId])
  @@index([menuItemId])
  @@index([status])
  @@map("fnb_order_items")
}

/// Applied modifier on order item
model FnbOrderItemModifier {
  id              String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  orderItemId     String         @db.Uuid
  modifierId      String         @db.Uuid
  quantity        Int            @default(1)
  priceAdjustment Decimal        @db.Decimal(10, 2)
  createdAt       DateTime       @default(now())

  orderItem       FnbOrderItem   @relation(fields: [orderItemId], references: [id], onDelete: Cascade)
  modifier        FnbModifier    @relation(fields: [modifierId], references: [id])

  @@index([orderItemId])
  @@map("fnb_order_item_modifiers")
}
```

**Step 2: Generate and migrate**

```bash
cd database && pnpm prisma generate && pnpm prisma migrate dev --name add_fnb_menu_order_models
```

**Step 3: Commit**

```bash
git add database/prisma/
git commit -m "feat(db): add F&B menu and order models

- Add FnbMenuCategory, FnbMenuItem with dietary flags
- Add FnbModifierGroup, FnbModifier for order customization
- Add FnbOrder with split/merge support
- Add FnbOrderItem with seat and course tracking"
```

---

### Task 3: Add Kitchen Display System (KDS) Models

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Step 1: Add KDS models**

```prisma
// ─────────────────────────────────────────────────────────────
// F&B KITCHEN DISPLAY SYSTEM (KDS)
// ─────────────────────────────────────────────────────────────

/// Kitchen station (e.g., Grill, Sauté, Pastry)
model KitchenStation {
  id              String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId          String               @db.Uuid
  name            String               @db.VarChar(100)
  code            String               @db.VarChar(20)
  displayOrder    Int                  @default(0)
  color           String               @default("#3B82F6") @db.VarChar(7)
  isExpeditor     Boolean              @default(false) // Expo station sees all
  isActive        Boolean              @default(true)
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt

  club            Club                 @relation(fields: [clubId], references: [id], onDelete: Cascade)
  menuItems       KitchenStationItem[]
  tickets         KitchenTicket[]

  @@unique([clubId, code])
  @@index([clubId])
  @@map("kitchen_stations")
}

/// Links menu items to their prep station
model KitchenStationItem {
  id              String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  stationId       String         @db.Uuid
  menuItemId      String         @db.Uuid
  prepTimeMinutes Int?           // Override item default
  priority        Int            @default(0)
  createdAt       DateTime       @default(now())

  station         KitchenStation @relation(fields: [stationId], references: [id], onDelete: Cascade)
  menuItem        FnbMenuItem    @relation(fields: [menuItemId], references: [id], onDelete: Cascade)

  @@unique([stationId, menuItemId])
  @@map("kitchen_station_items")
}

/// Kitchen ticket (groups items for a station)
model KitchenTicket {
  id              String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  stationId       String               @db.Uuid
  ticketNumber    String               @db.VarChar(30)
  tableNumber     String?              @db.VarChar(20)
  serverName      String?              @db.VarChar(100)
  courseNumber    Int                  @default(1)
  status          KitchenOrderStatus   @default(PENDING)
  priority        Int                  @default(0) // 0=normal, 1=rush, 2=VIP
  firedAt         DateTime?
  startedAt       DateTime?
  readyAt         DateTime?
  bumpedAt        DateTime?            // When bumped off screen
  bumpedBy        String?              @db.Uuid
  estimatedReady  DateTime?
  notes           String?
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt

  station         KitchenStation       @relation(fields: [stationId], references: [id])
  items           KitchenTicketItem[]

  @@index([stationId])
  @@index([status])
  @@index([createdAt])
  @@map("kitchen_tickets")
}

/// Individual item on a kitchen ticket
model KitchenTicketItem {
  id              String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  ticketId        String             @db.Uuid
  orderItemId     String             @db.Uuid
  quantity        Int                @default(1)
  itemName        String             @db.VarChar(200)
  modifiers       String?            // Denormalized modifier text
  specialRequests String?
  status          KitchenOrderStatus @default(PENDING)
  startedAt       DateTime?
  readyAt         DateTime?
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  ticket          KitchenTicket      @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  orderItem       FnbOrderItem       @relation(fields: [orderItemId], references: [id])

  @@index([ticketId])
  @@index([orderItemId])
  @@map("kitchen_ticket_items")
}

/// Course firing control
model CourseFiring {
  id              String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  orderId         String             @db.Uuid
  courseNumber    Int
  courseType      CourseType         @default(OTHER)
  status          CourseFiringStatus @default(WAITING)
  scheduledFor    DateTime?          // Optional scheduled fire time
  firedAt         DateTime?
  firedBy         String?            @db.Uuid
  readyAt         DateTime?
  servedAt        DateTime?
  notes           String?
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  order           FnbOrder           @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@unique([orderId, courseNumber])
  @@index([orderId])
  @@index([status])
  @@map("course_firings")
}
```

**Step 2: Generate and migrate**

```bash
cd database && pnpm prisma generate && pnpm prisma migrate dev --name add_fnb_kds_models
```

**Step 3: Commit**

```bash
git add database/prisma/
git commit -m "feat(db): add Kitchen Display System models

- Add KitchenStation with expeditor support
- Add KitchenStationItem for menu routing
- Add KitchenTicket for station order management
- Add CourseFiring for course timing control"
```

---

### Task 4: Add Server, Tips, and Reservation Models

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Step 1: Add remaining F&B models**

```prisma
// ─────────────────────────────────────────────────────────────
// F&B SERVERS & TIPS
// ─────────────────────────────────────────────────────────────

/// F&B Server (linked to User)
model FnbServer {
  id              String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId          String           @db.Uuid
  userId          String?          @db.Uuid
  employeeNumber  String           @db.VarChar(20)
  firstName       String           @db.VarChar(100)
  lastName        String           @db.VarChar(100)
  pin             String?          @db.VarChar(6) // Quick login PIN
  isOnDuty        Boolean          @default(false)
  clockedInAt     DateTime?
  clockedOutAt    DateTime?
  defaultAreaId   String?          @db.Uuid
  isActive        Boolean          @default(true)
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  club            Club             @relation(fields: [clubId], references: [id], onDelete: Cascade)
  user            User?            @relation(fields: [userId], references: [id])
  orders          FnbOrder[]
  sessions        TableSession[]
  tipAllocations  TipAllocation[]
  serverSections  ServerSection[]

  @@unique([clubId, employeeNumber])
  @@index([clubId])
  @@index([userId])
  @@map("fnb_servers")
}

/// Server section assignment
model ServerSection {
  id              String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  serverId        String         @db.Uuid
  areaId          String         @db.Uuid
  tableNumbers    String[]       @default([])
  shiftDate       DateTime       @db.Date
  shiftStart      String         @db.VarChar(5)
  shiftEnd        String         @db.VarChar(5)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  server          FnbServer      @relation(fields: [serverId], references: [id], onDelete: Cascade)

  @@index([serverId])
  @@index([shiftDate])
  @@map("server_sections")
}

/// F&B Payment
model FnbPayment {
  id              String         @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  orderId         String         @db.Uuid
  amount          Decimal        @db.Decimal(12, 2)
  tipAmount       Decimal        @default(0) @db.Decimal(12, 2)
  paymentMethodId String         @db.Uuid
  reference       String?        @db.VarChar(100)
  status          String         @default("COMPLETED") @db.VarChar(20)
  paidAt          DateTime       @default(now())
  paidBy          String         @db.Uuid
  voidedAt        DateTime?
  voidedBy        String?        @db.Uuid
  voidReason      String?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  order           FnbOrder       @relation(fields: [orderId], references: [id], onDelete: Cascade)
  paymentMethod   CheckInPaymentMethod @relation(fields: [paymentMethodId], references: [id])
  tipAllocations  TipAllocation[]

  @@index([orderId])
  @@map("fnb_payments")
}

/// Tip allocation to servers
model TipAllocation {
  id              String                 @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  orderId         String                 @db.Uuid
  paymentId       String?                @db.Uuid
  serverId        String                 @db.Uuid
  amount          Decimal                @db.Decimal(12, 2)
  percentage      Decimal?               @db.Decimal(5, 2)
  distributionMethod TipDistributionMethod @default(EQUAL)
  allocatedAt     DateTime               @default(now())
  allocatedBy     String                 @db.Uuid
  createdAt       DateTime               @default(now())

  order           FnbOrder               @relation(fields: [orderId], references: [id], onDelete: Cascade)
  payment         FnbPayment?            @relation(fields: [paymentId], references: [id])
  server          FnbServer              @relation(fields: [serverId], references: [id])

  @@index([orderId])
  @@index([serverId])
  @@map("tip_allocations")
}

// ─────────────────────────────────────────────────────────────
// F&B RESERVATIONS
// ─────────────────────────────────────────────────────────────

/// Dining reservation
model DiningReservation {
  id              String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId          String            @db.Uuid
  confirmationNumber String         @db.VarChar(20)
  areaId          String?           @db.Uuid
  tableId         String?           @db.Uuid
  memberId        String?           @db.Uuid
  guestName       String            @db.VarChar(200)
  guestPhone      String?           @db.VarChar(50)
  guestEmail      String?           @db.VarChar(255)
  partySize       Int               @default(2)
  reservationDate DateTime          @db.Date
  reservationTime String            @db.VarChar(5)
  durationMinutes Int               @default(90)
  status          ReservationStatus @default(PENDING)
  specialRequests String?
  dietaryNotes    String?
  occasion        String?           @db.VarChar(100)
  confirmedAt     DateTime?
  seatedAt        DateTime?
  completedAt     DateTime?
  cancelledAt     DateTime?
  cancelReason    String?
  noShowMarkedAt  DateTime?
  reminderSentAt  DateTime?
  notes           String?
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  club            Club              @relation(fields: [clubId], references: [id], onDelete: Cascade)
  area            DiningArea?       @relation(fields: [areaId], references: [id])
  table           DiningTable?      @relation(fields: [tableId], references: [id])
  member          Member?           @relation(fields: [memberId], references: [id])
  sessions        TableSession[]

  @@unique([clubId, confirmationNumber])
  @@index([clubId])
  @@index([reservationDate])
  @@index([status])
  @@index([memberId])
  @@map("dining_reservations")
}
```

**Step 2: Add relations to existing models**

Add to the `Club` model:

```prisma
model Club {
  // ... existing fields ...

  // F&B relations
  diningAreas       DiningArea[]
  fnbMenuCategories FnbMenuCategory[]
  fnbModifierGroups FnbModifierGroup[]
  fnbOrders         FnbOrder[]
  kitchenStations   KitchenStation[]
  fnbServers        FnbServer[]
  diningReservations DiningReservation[]
}
```

Add to the `Member` model:

```prisma
model Member {
  // ... existing fields ...

  fnbOrders         FnbOrder[]
  diningReservations DiningReservation[]
}
```

Add to the `User` model:

```prisma
model User {
  // ... existing fields ...

  fnbServer         FnbServer?
}
```

Add to `CheckInPaymentMethod` model:

```prisma
model CheckInPaymentMethod {
  // ... existing fields ...

  fnbPayments       FnbPayment[]
}
```

**Step 3: Generate and migrate**

```bash
cd database && pnpm prisma generate && pnpm prisma migrate dev --name add_fnb_server_tips_reservations
```

**Step 4: Commit**

```bash
git add database/prisma/
git commit -m "feat(db): add F&B server, tips, and reservation models

- Add FnbServer with PIN login and sections
- Add TipAllocation with distribution methods
- Add FnbPayment linked to orders
- Add DiningReservation with full workflow
- Add relations to Club, Member, User models"
```

---

### Task 5: Add Floor Plan GraphQL Types

**Files:**
- Create: `/apps/api/src/graphql/fnb/fnb.types.ts`

**Step 1: Create the types file**

```typescript
import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';
import {
  DiningTableStatus,
  DiningTableShape,
  FnbOrderStatus,
  CourseType,
  CourseFiringStatus,
  KitchenOrderStatus,
  ModifierType,
  DietaryFlag,
  ReservationStatus,
  TipDistributionMethod,
} from '@prisma/client';

// ─────────────────────────────────────────────────────────────
// ENUM REGISTRATIONS
// ─────────────────────────────────────────────────────────────

registerEnumType(DiningTableStatus, {
  name: 'DiningTableStatus',
  description: 'Status of a dining table',
});

registerEnumType(DiningTableShape, {
  name: 'DiningTableShape',
  description: 'Shape of a dining table',
});

registerEnumType(FnbOrderStatus, {
  name: 'FnbOrderStatus',
  description: 'Status of an F&B order',
});

registerEnumType(CourseType, {
  name: 'CourseType',
  description: 'Type of course in a meal',
});

registerEnumType(CourseFiringStatus, {
  name: 'CourseFiringStatus',
  description: 'Status of course firing',
});

registerEnumType(KitchenOrderStatus, {
  name: 'KitchenOrderStatus',
  description: 'Status of kitchen order item',
});

registerEnumType(ModifierType, {
  name: 'ModifierType',
  description: 'Type of modifier selection',
});

registerEnumType(DietaryFlag, {
  name: 'DietaryFlag',
  description: 'Dietary restriction flags',
});

registerEnumType(ReservationStatus, {
  name: 'ReservationStatus',
  description: 'Status of a dining reservation',
});

registerEnumType(TipDistributionMethod, {
  name: 'TipDistributionMethod',
  description: 'Method for distributing tips',
});

// ─────────────────────────────────────────────────────────────
// FLOOR PLAN & TABLE TYPES
// ─────────────────────────────────────────────────────────────

@ObjectType()
export class DiningAreaType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  code: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  floorPlanSvg?: string;

  @Field({ nullable: true })
  floorPlanImage?: string;

  @Field(() => Int)
  displayOrder: number;

  @Field()
  isActive: boolean;

  @Field(() => [DiningTableType])
  tables: DiningTableType[];

  @Field(() => Int)
  availableTableCount: number;

  @Field(() => Int)
  occupiedTableCount: number;
}

@ObjectType()
export class DiningTableType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  areaId: string;

  @Field()
  tableNumber: string;

  @Field({ nullable: true })
  name?: string;

  @Field(() => Int)
  capacity: number;

  @Field(() => Int)
  minCapacity: number;

  @Field(() => DiningTableShape)
  shape: DiningTableShape;

  @Field(() => DiningTableStatus)
  status: DiningTableStatus;

  @Field(() => Float)
  positionX: number;

  @Field(() => Float)
  positionY: number;

  @Field(() => Float)
  width: number;

  @Field(() => Float)
  height: number;

  @Field(() => Int)
  rotation: number;

  @Field()
  isCombined: boolean;

  @Field(() => [String])
  combinedWith: string[];

  @Field()
  isActive: boolean;

  @Field(() => TableSessionType, { nullable: true })
  currentSession?: TableSessionType;

  @Field(() => FnbOrderType, { nullable: true })
  currentOrder?: FnbOrderType;

  @Field(() => DiningReservationType, { nullable: true })
  upcomingReservation?: DiningReservationType;
}

@ObjectType()
export class TableSessionType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  tableId: string;

  @Field(() => ID)
  serverId: string;

  @Field(() => Int)
  guestCount: number;

  @Field()
  startedAt: Date;

  @Field({ nullable: true })
  endedAt?: Date;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => FnbServerType)
  server: FnbServerType;

  @Field(() => [FnbOrderType])
  orders: FnbOrderType[];

  @Field(() => Float)
  duration: number; // Minutes since started
}

// ─────────────────────────────────────────────────────────────
// MENU TYPES
// ─────────────────────────────────────────────────────────────

@ObjectType()
export class FnbMenuCategoryType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => CourseType)
  courseType: CourseType;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  isActive: boolean;

  @Field(() => [FnbMenuItemType])
  items: FnbMenuItemType[];
}

@ObjectType()
export class FnbMenuItemType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  categoryId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => Float)
  price: number;

  @Field(() => Float)
  taxRate: number;

  @Field()
  taxType: string;

  @Field(() => CourseType)
  courseType: CourseType;

  @Field(() => Int)
  prepTimeMinutes: number;

  @Field(() => [DietaryFlag])
  dietaryFlags: DietaryFlag[];

  @Field(() => [String])
  allergens: string[];

  @Field(() => Int, { nullable: true })
  calories?: number;

  @Field()
  isAvailable: boolean;

  @Field()
  isEightySixed: boolean;

  @Field(() => [FnbModifierGroupType])
  modifierGroups: FnbModifierGroupType[];
}

@ObjectType()
export class FnbModifierGroupType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => ModifierType)
  modifierType: ModifierType;

  @Field()
  isRequired: boolean;

  @Field(() => Int)
  minSelections: number;

  @Field(() => Int)
  maxSelections: number;

  @Field(() => [FnbModifierType])
  modifiers: FnbModifierType[];
}

@ObjectType()
export class FnbModifierType {
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
}

// ─────────────────────────────────────────────────────────────
// ORDER TYPES
// ─────────────────────────────────────────────────────────────

@ObjectType()
export class FnbOrderType {
  @Field(() => ID)
  id: string;

  @Field()
  orderNumber: string;

  @Field(() => ID, { nullable: true })
  tableId?: string;

  @Field({ nullable: true })
  tableNumber?: string;

  @Field(() => ID)
  serverId: string;

  @Field({ nullable: true })
  serverName?: string;

  @Field(() => ID, { nullable: true })
  memberId?: string;

  @Field({ nullable: true })
  guestName?: string;

  @Field(() => Int)
  guestCount: number;

  @Field(() => FnbOrderStatus)
  status: FnbOrderStatus;

  @Field()
  isTabOrder: boolean;

  @Field()
  isTakeout: boolean;

  @Field()
  isDelivery: boolean;

  @Field(() => Float)
  subtotal: number;

  @Field(() => Float)
  taxAmount: number;

  @Field(() => Float)
  discountAmount: number;

  @Field(() => Float)
  tipAmount: number;

  @Field(() => Float)
  totalAmount: number;

  @Field(() => Float)
  paidAmount: number;

  @Field(() => Float)
  balanceDue: number;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  openedAt: Date;

  @Field({ nullable: true })
  closedAt?: Date;

  @Field(() => [FnbOrderItemType])
  items: FnbOrderItemType[];

  @Field(() => [CourseFiringType])
  courseFirings: CourseFiringType[];

  @Field(() => [FnbPaymentType])
  payments: FnbPaymentType[];

  @Field(() => [FnbOrderType], { nullable: true })
  splitOrders?: FnbOrderType[];
}

@ObjectType()
export class FnbOrderItemType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  orderId: string;

  @Field(() => ID)
  menuItemId: string;

  @Field()
  itemName: string;

  @Field(() => Int, { nullable: true })
  seatNumber?: number;

  @Field(() => Int)
  courseNumber: number;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  unitPrice: number;

  @Field(() => Float)
  modifierTotal: number;

  @Field(() => Float)
  subtotal: number;

  @Field(() => Float)
  taxAmount: number;

  @Field(() => Float)
  totalAmount: number;

  @Field({ nullable: true })
  specialRequests?: string;

  @Field({ nullable: true })
  dietaryNotes?: string;

  @Field(() => KitchenOrderStatus)
  status: KitchenOrderStatus;

  @Field({ nullable: true })
  firedAt?: Date;

  @Field({ nullable: true })
  readyAt?: Date;

  @Field({ nullable: true })
  servedAt?: Date;

  @Field(() => [FnbOrderItemModifierType])
  modifiers: FnbOrderItemModifierType[];
}

@ObjectType()
export class FnbOrderItemModifierType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  priceAdjustment: number;
}

@ObjectType()
export class CourseFiringType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  orderId: string;

  @Field(() => Int)
  courseNumber: number;

  @Field(() => CourseType)
  courseType: CourseType;

  @Field(() => CourseFiringStatus)
  status: CourseFiringStatus;

  @Field({ nullable: true })
  scheduledFor?: Date;

  @Field({ nullable: true })
  firedAt?: Date;

  @Field({ nullable: true })
  readyAt?: Date;

  @Field({ nullable: true })
  servedAt?: Date;

  @Field(() => Int)
  itemCount: number;
}

// ─────────────────────────────────────────────────────────────
// KDS TYPES
// ─────────────────────────────────────────────────────────────

@ObjectType()
export class KitchenStationType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  code: string;

  @Field(() => Int)
  displayOrder: number;

  @Field()
  color: string;

  @Field()
  isExpeditor: boolean;

  @Field()
  isActive: boolean;

  @Field(() => Int)
  pendingTicketCount: number;

  @Field(() => Int)
  inProgressTicketCount: number;
}

@ObjectType()
export class KitchenTicketType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  stationId: string;

  @Field()
  ticketNumber: string;

  @Field({ nullable: true })
  tableNumber?: string;

  @Field({ nullable: true })
  serverName?: string;

  @Field(() => Int)
  courseNumber: number;

  @Field(() => KitchenOrderStatus)
  status: KitchenOrderStatus;

  @Field(() => Int)
  priority: number;

  @Field({ nullable: true })
  firedAt?: Date;

  @Field({ nullable: true })
  startedAt?: Date;

  @Field({ nullable: true })
  readyAt?: Date;

  @Field({ nullable: true })
  estimatedReady?: Date;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => Int)
  elapsedMinutes: number;

  @Field(() => [KitchenTicketItemType])
  items: KitchenTicketItemType[];
}

@ObjectType()
export class KitchenTicketItemType {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  quantity: number;

  @Field()
  itemName: string;

  @Field({ nullable: true })
  modifiers?: string;

  @Field({ nullable: true })
  specialRequests?: string;

  @Field(() => KitchenOrderStatus)
  status: KitchenOrderStatus;
}

// ─────────────────────────────────────────────────────────────
// SERVER & TIPS TYPES
// ─────────────────────────────────────────────────────────────

@ObjectType()
export class FnbServerType {
  @Field(() => ID)
  id: string;

  @Field()
  employeeNumber: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  fullName: string;

  @Field()
  isOnDuty: boolean;

  @Field({ nullable: true })
  clockedInAt?: Date;

  @Field(() => Int)
  activeTableCount: number;

  @Field(() => Float)
  todayTips: number;

  @Field(() => Float)
  todaySales: number;
}

@ObjectType()
export class TipAllocationResultType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field(() => Float)
  totalTips: number;

  @Field(() => [ServerTipType])
  allocations: ServerTipType[];
}

@ObjectType()
export class ServerTipType {
  @Field(() => ID)
  serverId: string;

  @Field()
  serverName: string;

  @Field(() => Float)
  amount: number;

  @Field(() => Float, { nullable: true })
  percentage?: number;
}

@ObjectType()
export class FnbPaymentType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  orderId: string;

  @Field(() => Float)
  amount: number;

  @Field(() => Float)
  tipAmount: number;

  @Field()
  paymentMethodName: string;

  @Field({ nullable: true })
  reference?: string;

  @Field()
  status: string;

  @Field()
  paidAt: Date;
}

// ─────────────────────────────────────────────────────────────
// RESERVATION TYPES
// ─────────────────────────────────────────────────────────────

@ObjectType()
export class DiningReservationType {
  @Field(() => ID)
  id: string;

  @Field()
  confirmationNumber: string;

  @Field(() => ID, { nullable: true })
  areaId?: string;

  @Field({ nullable: true })
  areaName?: string;

  @Field(() => ID, { nullable: true })
  tableId?: string;

  @Field({ nullable: true })
  tableNumber?: string;

  @Field(() => ID, { nullable: true })
  memberId?: string;

  @Field({ nullable: true })
  memberName?: string;

  @Field()
  guestName: string;

  @Field({ nullable: true })
  guestPhone?: string;

  @Field({ nullable: true })
  guestEmail?: string;

  @Field(() => Int)
  partySize: number;

  @Field()
  reservationDate: Date;

  @Field()
  reservationTime: string;

  @Field(() => Int)
  durationMinutes: number;

  @Field(() => ReservationStatus)
  status: ReservationStatus;

  @Field({ nullable: true })
  specialRequests?: string;

  @Field({ nullable: true })
  dietaryNotes?: string;

  @Field({ nullable: true })
  occasion?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  createdAt: Date;
}

// ─────────────────────────────────────────────────────────────
// MUTATION RESPONSE TYPES
// ─────────────────────────────────────────────────────────────

@ObjectType()
export class FnbMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;
}

@ObjectType()
export class TableMutationResponse extends FnbMutationResponse {
  @Field(() => DiningTableType, { nullable: true })
  table?: DiningTableType;
}

@ObjectType()
export class OrderMutationResponse extends FnbMutationResponse {
  @Field(() => FnbOrderType, { nullable: true })
  order?: FnbOrderType;
}

@ObjectType()
export class SplitCheckResponse extends FnbMutationResponse {
  @Field(() => FnbOrderType, { nullable: true })
  originalOrder?: FnbOrderType;

  @Field(() => [FnbOrderType], { nullable: true })
  splitOrders?: FnbOrderType[];
}

@ObjectType()
export class MergeCheckResponse extends FnbMutationResponse {
  @Field(() => FnbOrderType, { nullable: true })
  mergedOrder?: FnbOrderType;
}

@ObjectType()
export class ReservationMutationResponse extends FnbMutationResponse {
  @Field(() => DiningReservationType, { nullable: true })
  reservation?: DiningReservationType;
}

@ObjectType()
export class KitchenTicketMutationResponse extends FnbMutationResponse {
  @Field(() => KitchenTicketType, { nullable: true })
  ticket?: KitchenTicketType;
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/fnb/
git commit -m "feat(api): add F&B GraphQL types

- Add floor plan types (DiningArea, DiningTable, TableSession)
- Add menu types with modifiers and dietary flags
- Add order types with course firing support
- Add KDS types for kitchen tickets
- Add server and tip allocation types
- Add reservation types
- Add mutation response types"
```

---

### Task 6: Add F&B GraphQL Inputs

**Files:**
- Create: `/apps/api/src/graphql/fnb/fnb.input.ts`

**Step 1: Create the inputs file**

```typescript
import { InputType, Field, ID, Int, Float } from '@nestjs/graphql';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  IsEnum,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import {
  DiningTableStatus,
  DiningTableShape,
  CourseType,
  FnbOrderStatus,
  KitchenOrderStatus,
  ModifierType,
  DietaryFlag,
  ReservationStatus,
  TipDistributionMethod,
} from '@prisma/client';

// ─────────────────────────────────────────────────────────────
// FLOOR PLAN INPUTS
// ─────────────────────────────────────────────────────────────

@InputType()
export class CreateDiningAreaInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  code: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  floorPlanSvg?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  floorPlanImage?: string;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

@InputType()
export class UpdateDiningAreaInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  floorPlanSvg?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  floorPlanImage?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class CreateDiningTableInput {
  @Field(() => ID)
  @IsUUID()
  areaId: string;

  @Field()
  @IsString()
  tableNumber: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => Int, { defaultValue: 4 })
  @IsNumber()
  @Min(1)
  @Max(20)
  capacity: number;

  @Field(() => Int, { defaultValue: 1 })
  @IsNumber()
  @Min(1)
  minCapacity: number;

  @Field(() => DiningTableShape, { defaultValue: DiningTableShape.RECTANGLE })
  @IsEnum(DiningTableShape)
  shape: DiningTableShape;

  @Field(() => Float, { defaultValue: 0 })
  @IsNumber()
  positionX: number;

  @Field(() => Float, { defaultValue: 0 })
  @IsNumber()
  positionY: number;

  @Field(() => Float, { defaultValue: 10 })
  @IsNumber()
  width: number;

  @Field(() => Float, { defaultValue: 10 })
  @IsNumber()
  height: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsNumber()
  rotation: number;
}

@InputType()
export class UpdateDiningTableInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @Field(() => DiningTableShape, { nullable: true })
  @IsOptional()
  @IsEnum(DiningTableShape)
  shape?: DiningTableShape;

  @Field(() => DiningTableStatus, { nullable: true })
  @IsOptional()
  @IsEnum(DiningTableStatus)
  status?: DiningTableStatus;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  positionX?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  positionY?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  width?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  height?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  rotation?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

@InputType()
export class CombineTablesInput {
  @Field(() => [ID])
  @IsArray()
  tableIds: string[];
}

@InputType()
export class StartTableSessionInput {
  @Field(() => ID)
  @IsUUID()
  tableId: string;

  @Field(() => ID)
  @IsUUID()
  serverId: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsNumber()
  @Min(1)
  guestCount: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  reservationId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

// ─────────────────────────────────────────────────────────────
// MENU INPUTS
// ─────────────────────────────────────────────────────────────

@InputType()
export class CreateMenuCategoryInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Field(() => CourseType, { defaultValue: CourseType.OTHER })
  @IsEnum(CourseType)
  courseType: CourseType;

  @Field(() => Int, { defaultValue: 0 })
  @IsNumber()
  sortOrder: number;
}

@InputType()
export class CreateMenuItemInput {
  @Field(() => ID)
  @IsUUID()
  categoryId: string;

  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  price: number;

  @Field(() => Float, { defaultValue: 7 })
  @IsNumber()
  taxRate: number;

  @Field(() => CourseType, { defaultValue: CourseType.OTHER })
  @IsEnum(CourseType)
  courseType: CourseType;

  @Field(() => Int, { defaultValue: 15 })
  @IsNumber()
  prepTimeMinutes: number;

  @Field(() => [DietaryFlag], { nullable: true })
  @IsOptional()
  @IsArray()
  dietaryFlags?: DietaryFlag[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  allergens?: string[];

  @Field(() => [ID], { nullable: true, description: 'Modifier group IDs to link' })
  @IsOptional()
  @IsArray()
  modifierGroupIds?: string[];
}

@InputType()
export class UpdateMenuItemInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  price?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isEightySixed?: boolean;

  @Field(() => [DietaryFlag], { nullable: true })
  @IsOptional()
  @IsArray()
  dietaryFlags?: DietaryFlag[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  allergens?: string[];
}

@InputType()
export class CreateModifierGroupInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => ModifierType, { defaultValue: ModifierType.SINGLE_SELECT })
  @IsEnum(ModifierType)
  modifierType: ModifierType;

  @Field({ defaultValue: false })
  @IsBoolean()
  isRequired: boolean;

  @Field(() => Int, { defaultValue: 0 })
  @IsNumber()
  minSelections: number;

  @Field(() => Int, { defaultValue: 1 })
  @IsNumber()
  maxSelections: number;

  @Field(() => [CreateModifierInput], { nullable: true })
  @IsOptional()
  @IsArray()
  modifiers?: CreateModifierInput[];
}

@InputType()
export class CreateModifierInput {
  @Field()
  @IsString()
  name: string;

  @Field(() => Float, { defaultValue: 0 })
  @IsNumber()
  priceAdjustment: number;

  @Field({ defaultValue: false })
  @IsBoolean()
  isDefault: boolean;

  @Field(() => Int, { defaultValue: 0 })
  @IsNumber()
  sortOrder: number;
}

// ─────────────────────────────────────────────────────────────
// ORDER INPUTS
// ─────────────────────────────────────────────────────────────

@InputType()
export class CreateFnbOrderInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  tableId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @Field(() => ID)
  @IsUUID()
  serverId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  guestName?: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsNumber()
  guestCount: number;

  @Field({ defaultValue: false })
  @IsBoolean()
  isTabOrder: boolean;

  @Field({ defaultValue: false })
  @IsBoolean()
  isTakeout: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class AddOrderItemInput {
  @Field(() => ID)
  @IsUUID()
  orderId: string;

  @Field(() => ID)
  @IsUUID()
  menuItemId: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  seatNumber?: number;

  @Field(() => Int, { defaultValue: 1 })
  @IsNumber()
  courseNumber: number;

  @Field(() => Int, { defaultValue: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @Field(() => [OrderItemModifierInput], { nullable: true })
  @IsOptional()
  @IsArray()
  modifiers?: OrderItemModifierInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  specialRequests?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  dietaryNotes?: string;
}

@InputType()
export class OrderItemModifierInput {
  @Field(() => ID)
  @IsUUID()
  modifierId: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsNumber()
  quantity: number;
}

@InputType()
export class UpdateOrderItemInput {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  specialRequests?: string;

  @Field(() => KitchenOrderStatus, { nullable: true })
  @IsOptional()
  @IsEnum(KitchenOrderStatus)
  status?: KitchenOrderStatus;
}

@InputType()
export class VoidOrderItemInput {
  @Field(() => ID)
  @IsUUID()
  orderItemId: string;

  @Field()
  @IsString()
  reason: string;
}

@InputType()
export class FireCourseInput {
  @Field(() => ID)
  @IsUUID()
  orderId: string;

  @Field(() => Int)
  @IsNumber()
  courseNumber: number;
}

@InputType()
export class SendToKitchenInput {
  @Field(() => ID)
  @IsUUID()
  orderId: string;

  @Field(() => [Int], { nullable: true, description: 'Optional specific course numbers to send' })
  @IsOptional()
  @IsArray()
  courseNumbers?: number[];
}

// ─────────────────────────────────────────────────────────────
// SPLIT/MERGE INPUTS
// ─────────────────────────────────────────────────────────────

@InputType()
export class SplitCheckInput {
  @Field(() => ID)
  @IsUUID()
  orderId: string;

  @Field(() => Int)
  @IsNumber()
  @Min(2)
  numberOfChecks: number;
}

@InputType()
export class SplitCheckBySeatInput {
  @Field(() => ID)
  @IsUUID()
  orderId: string;
}

@InputType()
export class SplitCheckByItemsInput {
  @Field(() => ID)
  @IsUUID()
  orderId: string;

  @Field(() => [[ID]], { description: 'Array of item ID arrays for each new check' })
  @IsArray()
  itemGroups: string[][];
}

@InputType()
export class MergeChecksInput {
  @Field(() => [ID])
  @IsArray()
  orderIds: string[];
}

@InputType()
export class TransferItemsInput {
  @Field(() => ID)
  @IsUUID()
  fromOrderId: string;

  @Field(() => ID)
  @IsUUID()
  toOrderId: string;

  @Field(() => [ID])
  @IsArray()
  itemIds: string[];
}

// ─────────────────────────────────────────────────────────────
// KDS INPUTS
// ─────────────────────────────────────────────────────────────

@InputType()
export class CreateKitchenStationInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  code: string;

  @Field(() => Int, { defaultValue: 0 })
  @IsNumber()
  displayOrder: number;

  @Field({ defaultValue: '#3B82F6' })
  @IsString()
  color: string;

  @Field({ defaultValue: false })
  @IsBoolean()
  isExpeditor: boolean;
}

@InputType()
export class BumpTicketInput {
  @Field(() => ID)
  @IsUUID()
  ticketId: string;

  @Field(() => KitchenOrderStatus, { nullable: true })
  @IsOptional()
  @IsEnum(KitchenOrderStatus)
  newStatus?: KitchenOrderStatus;
}

@InputType()
export class UpdateTicketItemStatusInput {
  @Field(() => ID)
  @IsUUID()
  ticketItemId: string;

  @Field(() => KitchenOrderStatus)
  @IsEnum(KitchenOrderStatus)
  status: KitchenOrderStatus;
}

// ─────────────────────────────────────────────────────────────
// SERVER & TIPS INPUTS
// ─────────────────────────────────────────────────────────────

@InputType()
export class CreateServerInput {
  @Field()
  @IsString()
  employeeNumber: string;

  @Field()
  @IsString()
  firstName: string;

  @Field()
  @IsString()
  lastName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  pin?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  defaultAreaId?: string;
}

@InputType()
export class ClockInOutInput {
  @Field(() => ID)
  @IsUUID()
  serverId: string;

  @Field()
  @IsBoolean()
  clockIn: boolean;
}

@InputType()
export class AllocateTipsInput {
  @Field(() => ID)
  @IsUUID()
  orderId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  totalTipAmount: number;

  @Field(() => TipDistributionMethod, { defaultValue: TipDistributionMethod.EQUAL })
  @IsEnum(TipDistributionMethod)
  distributionMethod: TipDistributionMethod;

  @Field(() => [ServerTipInput], { nullable: true })
  @IsOptional()
  @IsArray()
  customAllocations?: ServerTipInput[];
}

@InputType()
export class ServerTipInput {
  @Field(() => ID)
  @IsUUID()
  serverId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  percentage?: number;
}

// ─────────────────────────────────────────────────────────────
// PAYMENT INPUTS
// ─────────────────────────────────────────────────────────────

@InputType()
export class ProcessFnbPaymentInput {
  @Field(() => ID)
  @IsUUID()
  orderId: string;

  @Field(() => Float)
  @IsNumber()
  @Min(0)
  amount: number;

  @Field(() => Float, { defaultValue: 0 })
  @IsNumber()
  tipAmount: number;

  @Field(() => ID)
  @IsUUID()
  paymentMethodId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reference?: string;
}

// ─────────────────────────────────────────────────────────────
// RESERVATION INPUTS
// ─────────────────────────────────────────────────────────────

@InputType()
export class CreateReservationInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  areaId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  tableId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field()
  @IsString()
  guestName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  guestPhone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  guestEmail?: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  @Max(20)
  partySize: number;

  @Field()
  reservationDate: Date;

  @Field()
  @IsString()
  reservationTime: string;

  @Field(() => Int, { defaultValue: 90 })
  @IsNumber()
  durationMinutes: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  specialRequests?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  dietaryNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  occasion?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class UpdateReservationInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  tableId?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  partySize?: number;

  @Field({ nullable: true })
  @IsOptional()
  reservationDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reservationTime?: string;

  @Field(() => ReservationStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  specialRequests?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class CancelReservationInput {
  @Field(() => ID)
  @IsUUID()
  reservationId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;
}

@InputType()
export class SeatReservationInput {
  @Field(() => ID)
  @IsUUID()
  reservationId: string;

  @Field(() => ID)
  @IsUUID()
  tableId: string;

  @Field(() => ID)
  @IsUUID()
  serverId: string;
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/fnb/fnb.input.ts
git commit -m "feat(api): add F&B GraphQL inputs

- Add floor plan inputs (areas, tables, sessions)
- Add menu inputs (categories, items, modifiers)
- Add order inputs with modifier support
- Add split/merge check inputs
- Add KDS inputs (stations, tickets, bumping)
- Add server and tip allocation inputs
- Add payment and reservation inputs"
```

---

I'll continue with the remaining tasks in the next sections. The implementation plan is quite extensive. Would you like me to continue with:

- **Task 7-12**: Service layer implementations (FloorPlanService, MenuService, OrderService, KDSService, etc.)
- **Task 13-18**: Resolver implementations
- **Task 19-24**: GraphQL operations and API client codegen
- **Task 25-35**: React components (floor plan editor, order entry, KDS display, etc.)
- **Task 36-42**: Final integration, testing, and documentation

---

## Part 2: Service Layer

### Task 7: Create Floor Plan Service

**Files:**
- Create: `/apps/api/src/graphql/fnb/floor-plan.service.ts`

**Step 1: Create the service**

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { DiningTableStatus } from '@prisma/client';
import {
  CreateDiningAreaInput,
  UpdateDiningAreaInput,
  CreateDiningTableInput,
  UpdateDiningTableInput,
  CombineTablesInput,
  StartTableSessionInput,
} from './fnb.input';

@Injectable()
export class FloorPlanService {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────────
  // DINING AREAS
  // ─────────────────────────────────────────────────────────────

  async getDiningAreas(clubId: string, includeInactive = false) {
    const where: any = { clubId };
    if (!includeInactive) {
      where.isActive = true;
    }

    return this.prisma.diningArea.findMany({
      where,
      include: {
        tables: {
          where: includeInactive ? {} : { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async getDiningArea(clubId: string, areaId: string) {
    const area = await this.prisma.diningArea.findFirst({
      where: { id: areaId, clubId },
      include: {
        tables: {
          orderBy: { sortOrder: 'asc' },
          include: {
            orders: {
              where: { status: { notIn: ['PAID', 'CANCELLED'] } },
              take: 1,
            },
          },
        },
      },
    });

    if (!area) {
      throw new NotFoundException('Dining area not found');
    }

    return area;
  }

  async createDiningArea(clubId: string, input: CreateDiningAreaInput) {
    return this.prisma.diningArea.create({
      data: {
        clubId,
        ...input,
      },
      include: { tables: true },
    });
  }

  async updateDiningArea(clubId: string, areaId: string, input: UpdateDiningAreaInput) {
    const area = await this.prisma.diningArea.findFirst({
      where: { id: areaId, clubId },
    });

    if (!area) {
      throw new NotFoundException('Dining area not found');
    }

    return this.prisma.diningArea.update({
      where: { id: areaId },
      data: input,
      include: { tables: true },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // DINING TABLES
  // ─────────────────────────────────────────────────────────────

  async getTable(tableId: string) {
    const table = await this.prisma.diningTable.findUnique({
      where: { id: tableId },
      include: {
        area: true,
        orders: {
          where: { status: { notIn: ['PAID', 'CANCELLED'] } },
          include: { items: true, server: true },
        },
        sessions: {
          where: { endedAt: null },
          include: { server: true },
          take: 1,
        },
        reservations: {
          where: {
            status: { in: ['PENDING', 'CONFIRMED'] },
            reservationDate: { gte: new Date() },
          },
          orderBy: { reservationDate: 'asc' },
          take: 1,
        },
      },
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    return table;
  }

  async createTable(clubId: string, input: CreateDiningTableInput) {
    // Verify area belongs to club
    const area = await this.prisma.diningArea.findFirst({
      where: { id: input.areaId, clubId },
    });

    if (!area) {
      throw new NotFoundException('Dining area not found');
    }

    return this.prisma.diningTable.create({
      data: input,
      include: { area: true },
    });
  }

  async updateTable(clubId: string, tableId: string, input: UpdateDiningTableInput) {
    const table = await this.prisma.diningTable.findFirst({
      where: { id: tableId, area: { clubId } },
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    return this.prisma.diningTable.update({
      where: { id: tableId },
      data: input,
      include: { area: true },
    });
  }

  async updateTableStatus(tableId: string, status: DiningTableStatus) {
    return this.prisma.diningTable.update({
      where: { id: tableId },
      data: { status },
    });
  }

  async combineTables(clubId: string, input: CombineTablesInput) {
    if (input.tableIds.length < 2) {
      throw new BadRequestException('Need at least 2 tables to combine');
    }

    // Verify all tables belong to same area and club
    const tables = await this.prisma.diningTable.findMany({
      where: {
        id: { in: input.tableIds },
        area: { clubId },
      },
    });

    if (tables.length !== input.tableIds.length) {
      throw new BadRequestException('One or more tables not found');
    }

    const areaIds = [...new Set(tables.map(t => t.areaId))];
    if (areaIds.length > 1) {
      throw new BadRequestException('All tables must be in the same area');
    }

    // Use first table as parent
    const parentTableId = input.tableIds[0];
    const childTableIds = input.tableIds.slice(1);

    // Update parent table
    await this.prisma.diningTable.update({
      where: { id: parentTableId },
      data: {
        isCombined: true,
        combinedWith: childTableIds,
        capacity: tables.reduce((sum, t) => sum + t.capacity, 0),
      },
    });

    // Update child tables
    await this.prisma.diningTable.updateMany({
      where: { id: { in: childTableIds } },
      data: {
        isCombined: true,
        parentTableId,
        status: DiningTableStatus.BLOCKED,
      },
    });

    return this.getTable(parentTableId);
  }

  async uncombineTables(tableId: string) {
    const table = await this.prisma.diningTable.findUnique({
      where: { id: tableId },
      include: { childTables: true },
    });

    if (!table || !table.isCombined) {
      throw new BadRequestException('Table is not combined');
    }

    // Reset parent table
    const originalCapacity = table.capacity / (1 + table.childTables.length);
    await this.prisma.diningTable.update({
      where: { id: tableId },
      data: {
        isCombined: false,
        combinedWith: [],
        capacity: Math.round(originalCapacity),
      },
    });

    // Reset child tables
    await this.prisma.diningTable.updateMany({
      where: { parentTableId: tableId },
      data: {
        isCombined: false,
        parentTableId: null,
        status: DiningTableStatus.AVAILABLE,
      },
    });

    return this.getTable(tableId);
  }

  // ─────────────────────────────────────────────────────────────
  // TABLE SESSIONS
  // ─────────────────────────────────────────────────────────────

  async startSession(clubId: string, input: StartTableSessionInput) {
    const table = await this.prisma.diningTable.findFirst({
      where: { id: input.tableId, area: { clubId } },
    });

    if (!table) {
      throw new NotFoundException('Table not found');
    }

    if (table.status === DiningTableStatus.OCCUPIED) {
      throw new BadRequestException('Table is already occupied');
    }

    // Create session and update table status
    const [session] = await this.prisma.$transaction([
      this.prisma.tableSession.create({
        data: {
          tableId: input.tableId,
          serverId: input.serverId,
          guestCount: input.guestCount,
          reservationId: input.reservationId,
          notes: input.notes,
        },
        include: { server: true, table: true },
      }),
      this.prisma.diningTable.update({
        where: { id: input.tableId },
        data: { status: DiningTableStatus.OCCUPIED },
      }),
    ]);

    return session;
  }

  async endSession(sessionId: string) {
    const session = await this.prisma.tableSession.findUnique({
      where: { id: sessionId },
      include: { orders: { where: { status: { notIn: ['PAID', 'CANCELLED'] } } } },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.orders.length > 0) {
      throw new BadRequestException('Cannot end session with open orders');
    }

    await this.prisma.$transaction([
      this.prisma.tableSession.update({
        where: { id: sessionId },
        data: { endedAt: new Date() },
      }),
      this.prisma.diningTable.update({
        where: { id: session.tableId },
        data: { status: DiningTableStatus.CLEANING },
      }),
    ]);

    return { success: true };
  }

  async getFloorPlanStatus(clubId: string) {
    const areas = await this.getDiningAreas(clubId);

    return areas.map(area => ({
      ...area,
      availableTableCount: area.tables.filter(t => t.status === DiningTableStatus.AVAILABLE).length,
      occupiedTableCount: area.tables.filter(t => t.status === DiningTableStatus.OCCUPIED).length,
    }));
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/fnb/floor-plan.service.ts
git commit -m "feat(api): add FloorPlanService

- Add dining area CRUD operations
- Add table management with status tracking
- Add table combining/uncombining logic
- Add session management for seatings
- Add floor plan status summary"
```

---

### Task 8: Create Order Service

**Files:**
- Create: `/apps/api/src/graphql/fnb/order.service.ts`

**Step 1: Create the service**

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { TaxCalculatorService } from '@/shared/tax';
import { FnbOrderStatus, KitchenOrderStatus, DiningTableStatus } from '@prisma/client';
import {
  CreateFnbOrderInput,
  AddOrderItemInput,
  UpdateOrderItemInput,
  VoidOrderItemInput,
  FireCourseInput,
  SendToKitchenInput,
  SplitCheckInput,
  SplitCheckBySeatInput,
  SplitCheckByItemsInput,
  MergeChecksInput,
  TransferItemsInput,
} from './fnb.input';

@Injectable()
export class FnbOrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly taxCalculator: TaxCalculatorService,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // ORDER MANAGEMENT
  // ─────────────────────────────────────────────────────────────

  async createOrder(clubId: string, input: CreateFnbOrderInput) {
    const orderNumber = await this.generateOrderNumber(clubId);

    const order = await this.prisma.fnbOrder.create({
      data: {
        clubId,
        orderNumber,
        tableId: input.tableId,
        sessionId: input.sessionId,
        serverId: input.serverId,
        memberId: input.memberId,
        guestName: input.guestName,
        guestCount: input.guestCount,
        isTabOrder: input.isTabOrder,
        isTakeout: input.isTakeout,
        notes: input.notes,
        status: FnbOrderStatus.OPEN,
      },
      include: {
        items: { include: { menuItem: true, modifiers: { include: { modifier: true } } } },
        server: true,
        table: true,
      },
    });

    return order;
  }

  async getOrder(orderId: string) {
    const order = await this.prisma.fnbOrder.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            menuItem: true,
            modifiers: { include: { modifier: true } },
          },
          orderBy: [{ courseNumber: 'asc' }, { createdAt: 'asc' }],
        },
        server: true,
        table: true,
        member: true,
        courseFirings: { orderBy: { courseNumber: 'asc' } },
        payments: { include: { paymentMethod: true } },
        splitOrders: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getOrdersByTable(tableId: string, activeOnly = true) {
    const where: any = { tableId };
    if (activeOnly) {
      where.status = { notIn: [FnbOrderStatus.PAID, FnbOrderStatus.CANCELLED] };
    }

    return this.prisma.fnbOrder.findMany({
      where,
      include: {
        items: { include: { menuItem: true } },
        server: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // ORDER ITEMS
  // ─────────────────────────────────────────────────────────────

  async addOrderItem(clubId: string, input: AddOrderItemInput) {
    const order = await this.prisma.fnbOrder.findFirst({
      where: { id: input.orderId, clubId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status === FnbOrderStatus.PAID || order.status === FnbOrderStatus.CANCELLED) {
      throw new BadRequestException('Cannot add items to closed order');
    }

    const menuItem = await this.prisma.fnbMenuItem.findUnique({
      where: { id: input.menuItemId },
    });

    if (!menuItem || !menuItem.isAvailable || menuItem.isEightySixed) {
      throw new BadRequestException('Menu item not available');
    }

    // Calculate modifiers total
    let modifierTotal = 0;
    if (input.modifiers && input.modifiers.length > 0) {
      const modifierIds = input.modifiers.map(m => m.modifierId);
      const modifiers = await this.prisma.fnbModifier.findMany({
        where: { id: { in: modifierIds } },
      });

      modifierTotal = input.modifiers.reduce((total, mod) => {
        const modifier = modifiers.find(m => m.id === mod.modifierId);
        return total + (modifier ? Number(modifier.priceAdjustment) * mod.quantity : 0);
      }, 0);
    }

    const unitPrice = Number(menuItem.price);
    const subtotal = (unitPrice + modifierTotal) * input.quantity;
    const { taxAmount, totalAmount } = this.taxCalculator.calculateTax(
      subtotal,
      menuItem.taxType as any,
      Number(menuItem.taxRate),
    );

    const orderItem = await this.prisma.fnbOrderItem.create({
      data: {
        orderId: input.orderId,
        menuItemId: input.menuItemId,
        seatNumber: input.seatNumber,
        courseNumber: input.courseNumber,
        quantity: input.quantity,
        unitPrice,
        modifierTotal,
        subtotal,
        taxAmount,
        totalAmount,
        specialRequests: input.specialRequests,
        dietaryNotes: input.dietaryNotes,
        modifiers: input.modifiers ? {
          create: input.modifiers.map(mod => ({
            modifierId: mod.modifierId,
            quantity: mod.quantity,
            priceAdjustment: 0, // Will be set from lookup
          })),
        } : undefined,
      },
      include: {
        menuItem: true,
        modifiers: { include: { modifier: true } },
      },
    });

    // Update order totals
    await this.recalculateOrderTotals(input.orderId);

    // Ensure course firing record exists
    await this.prisma.courseFiring.upsert({
      where: {
        orderId_courseNumber: {
          orderId: input.orderId,
          courseNumber: input.courseNumber,
        },
      },
      create: {
        orderId: input.orderId,
        courseNumber: input.courseNumber,
        courseType: menuItem.courseType,
      },
      update: {},
    });

    return orderItem;
  }

  async updateOrderItem(orderItemId: string, input: UpdateOrderItemInput) {
    const item = await this.prisma.fnbOrderItem.findUnique({
      where: { id: orderItemId },
      include: { menuItem: true },
    });

    if (!item) {
      throw new NotFoundException('Order item not found');
    }

    if (item.status !== KitchenOrderStatus.PENDING) {
      throw new BadRequestException('Cannot modify item already sent to kitchen');
    }

    let updateData: any = { ...input };

    if (input.quantity) {
      const subtotal = (Number(item.unitPrice) + Number(item.modifierTotal)) * input.quantity;
      const { taxAmount, totalAmount } = this.taxCalculator.calculateTax(
        subtotal,
        item.menuItem.taxType as any,
        Number(item.menuItem.taxRate),
      );
      updateData = { ...updateData, subtotal, taxAmount, totalAmount };
    }

    const updatedItem = await this.prisma.fnbOrderItem.update({
      where: { id: orderItemId },
      data: updateData,
      include: { menuItem: true, modifiers: { include: { modifier: true } } },
    });

    await this.recalculateOrderTotals(item.orderId);

    return updatedItem;
  }

  async voidOrderItem(userId: string, input: VoidOrderItemInput) {
    const item = await this.prisma.fnbOrderItem.findUnique({
      where: { id: input.orderItemId },
    });

    if (!item) {
      throw new NotFoundException('Order item not found');
    }

    await this.prisma.fnbOrderItem.update({
      where: { id: input.orderItemId },
      data: {
        status: KitchenOrderStatus.CANCELLED,
        voidedAt: new Date(),
        voidReason: input.reason,
        voidedBy: userId,
      },
    });

    await this.recalculateOrderTotals(item.orderId);

    return { success: true };
  }

  // ─────────────────────────────────────────────────────────────
  // COURSE FIRING
  // ─────────────────────────────────────────────────────────────

  async fireCourse(userId: string, input: FireCourseInput) {
    const courseFiring = await this.prisma.courseFiring.findUnique({
      where: {
        orderId_courseNumber: {
          orderId: input.orderId,
          courseNumber: input.courseNumber,
        },
      },
    });

    if (!courseFiring) {
      throw new NotFoundException('Course not found');
    }

    // Update course firing
    await this.prisma.courseFiring.update({
      where: { id: courseFiring.id },
      data: {
        status: 'FIRED',
        firedAt: new Date(),
        firedBy: userId,
      },
    });

    // Update all items in this course
    await this.prisma.fnbOrderItem.updateMany({
      where: {
        orderId: input.orderId,
        courseNumber: input.courseNumber,
        status: KitchenOrderStatus.PENDING,
      },
      data: {
        firedAt: new Date(),
      },
    });

    // Create kitchen tickets for this course
    await this.createKitchenTicketsForCourse(input.orderId, input.courseNumber);

    return { success: true };
  }

  async sendToKitchen(userId: string, input: SendToKitchenInput) {
    const order = await this.getOrder(input.orderId);

    if (order.status === FnbOrderStatus.DRAFT) {
      await this.prisma.fnbOrder.update({
        where: { id: input.orderId },
        data: { status: FnbOrderStatus.SENT_TO_KITCHEN },
      });
    }

    // Fire specified courses or course 1 if none specified
    const courseNumbers = input.courseNumbers || [1];

    for (const courseNumber of courseNumbers) {
      await this.fireCourse(userId, { orderId: input.orderId, courseNumber });
    }

    return this.getOrder(input.orderId);
  }

  // ─────────────────────────────────────────────────────────────
  // SPLIT / MERGE CHECKS
  // ─────────────────────────────────────────────────────────────

  async splitCheckEvenly(clubId: string, input: SplitCheckInput) {
    const order = await this.getOrder(input.orderId);

    if (order.status === FnbOrderStatus.PAID) {
      throw new BadRequestException('Cannot split a paid order');
    }

    const splitOrders: any[] = [];
    const itemsPerCheck = Math.ceil(order.items.length / input.numberOfChecks);

    for (let i = 0; i < input.numberOfChecks; i++) {
      const orderNumber = await this.generateOrderNumber(clubId);
      const itemsForCheck = order.items.slice(i * itemsPerCheck, (i + 1) * itemsPerCheck);

      if (itemsForCheck.length === 0) continue;

      const splitOrder = await this.prisma.fnbOrder.create({
        data: {
          clubId,
          orderNumber,
          tableId: order.tableId,
          sessionId: order.sessionId,
          serverId: order.serverId,
          guestCount: Math.ceil(order.guestCount / input.numberOfChecks),
          parentOrderId: order.id,
          splitFromId: order.id,
          status: FnbOrderStatus.OPEN,
        },
      });

      // Move items to split order
      await this.prisma.fnbOrderItem.updateMany({
        where: { id: { in: itemsForCheck.map(i => i.id) } },
        data: { orderId: splitOrder.id },
      });

      await this.recalculateOrderTotals(splitOrder.id);
      splitOrders.push(await this.getOrder(splitOrder.id));
    }

    // Update original order
    await this.recalculateOrderTotals(order.id);

    return {
      success: true,
      originalOrder: await this.getOrder(order.id),
      splitOrders,
    };
  }

  async splitCheckBySeat(clubId: string, input: SplitCheckBySeatInput) {
    const order = await this.getOrder(input.orderId);

    const seatNumbers = [...new Set(order.items.map(i => i.seatNumber).filter(s => s !== null))];

    if (seatNumbers.length < 2) {
      throw new BadRequestException('Need items on multiple seats to split by seat');
    }

    const splitOrders: any[] = [];

    for (const seatNumber of seatNumbers) {
      const itemsForSeat = order.items.filter(i => i.seatNumber === seatNumber);
      if (itemsForSeat.length === 0) continue;

      const orderNumber = await this.generateOrderNumber(clubId);

      const splitOrder = await this.prisma.fnbOrder.create({
        data: {
          clubId,
          orderNumber,
          tableId: order.tableId,
          sessionId: order.sessionId,
          serverId: order.serverId,
          guestCount: 1,
          parentOrderId: order.id,
          splitFromId: order.id,
          status: FnbOrderStatus.OPEN,
        },
      });

      await this.prisma.fnbOrderItem.updateMany({
        where: { id: { in: itemsForSeat.map(i => i.id) } },
        data: { orderId: splitOrder.id },
      });

      await this.recalculateOrderTotals(splitOrder.id);
      splitOrders.push(await this.getOrder(splitOrder.id));
    }

    await this.recalculateOrderTotals(order.id);

    return {
      success: true,
      originalOrder: await this.getOrder(order.id),
      splitOrders,
    };
  }

  async mergeChecks(clubId: string, input: MergeChecksInput) {
    if (input.orderIds.length < 2) {
      throw new BadRequestException('Need at least 2 orders to merge');
    }

    const orders = await this.prisma.fnbOrder.findMany({
      where: { id: { in: input.orderIds }, clubId },
      include: { items: true },
    });

    if (orders.length !== input.orderIds.length) {
      throw new BadRequestException('One or more orders not found');
    }

    // Use first order as target
    const targetOrderId = input.orderIds[0];
    const sourceOrderIds = input.orderIds.slice(1);

    // Move all items to target order
    for (const sourceId of sourceOrderIds) {
      await this.prisma.fnbOrderItem.updateMany({
        where: { orderId: sourceId },
        data: { orderId: targetOrderId },
      });

      // Cancel source order
      await this.prisma.fnbOrder.update({
        where: { id: sourceId },
        data: { status: FnbOrderStatus.CANCELLED },
      });
    }

    // Update guest count
    const totalGuests = orders.reduce((sum, o) => sum + o.guestCount, 0);
    await this.prisma.fnbOrder.update({
      where: { id: targetOrderId },
      data: { guestCount: totalGuests },
    });

    await this.recalculateOrderTotals(targetOrderId);

    return {
      success: true,
      mergedOrder: await this.getOrder(targetOrderId),
    };
  }

  async transferItems(input: TransferItemsInput) {
    await this.prisma.fnbOrderItem.updateMany({
      where: { id: { in: input.itemIds } },
      data: { orderId: input.toOrderId },
    });

    await this.recalculateOrderTotals(input.fromOrderId);
    await this.recalculateOrderTotals(input.toOrderId);

    return { success: true };
  }

  // ─────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────

  private async generateOrderNumber(clubId: string): Promise<string> {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.prisma.fnbOrder.count({
      where: {
        clubId,
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    });
    return `FNB-${today}-${String(count + 1).padStart(4, '0')}`;
  }

  private async recalculateOrderTotals(orderId: string) {
    const items = await this.prisma.fnbOrderItem.findMany({
      where: { orderId, status: { not: KitchenOrderStatus.CANCELLED } },
    });

    const subtotal = items.reduce((sum, i) => sum + Number(i.subtotal), 0);
    const taxAmount = items.reduce((sum, i) => sum + Number(i.taxAmount), 0);
    const totalAmount = items.reduce((sum, i) => sum + Number(i.totalAmount), 0);

    await this.prisma.fnbOrder.update({
      where: { id: orderId },
      data: { subtotal, taxAmount, totalAmount },
    });
  }

  private async createKitchenTicketsForCourse(orderId: string, courseNumber: number) {
    // Implementation for kitchen ticket creation
    // Groups items by station and creates tickets
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/fnb/order.service.ts
git commit -m "feat(api): add FnbOrderService

- Add order CRUD with item management
- Add modifier support for order items
- Add course firing control
- Add split check (even, by seat, by items)
- Add merge checks functionality
- Add order total recalculation"
```

---

### Task 9: Create KDS Service

**Files:**
- Create: `/apps/api/src/graphql/fnb/kds.service.ts`

**Step 1: Create the service**

```typescript
import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { KitchenOrderStatus } from '@prisma/client';
import { PUBSUB_TOKEN } from '../common/pubsub';
import {
  CreateKitchenStationInput,
  BumpTicketInput,
  UpdateTicketItemStatusInput,
} from './fnb.input';

@Injectable()
export class KdsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PUBSUB_TOKEN) private readonly pubSub: any,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // KITCHEN STATIONS
  // ─────────────────────────────────────────────────────────────

  async getStations(clubId: string) {
    const stations = await this.prisma.kitchenStation.findMany({
      where: { clubId, isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    // Get ticket counts for each station
    const stationsWithCounts = await Promise.all(
      stations.map(async (station) => {
        const [pending, inProgress] = await Promise.all([
          this.prisma.kitchenTicket.count({
            where: { stationId: station.id, status: KitchenOrderStatus.PENDING },
          }),
          this.prisma.kitchenTicket.count({
            where: { stationId: station.id, status: KitchenOrderStatus.IN_PROGRESS },
          }),
        ]);

        return {
          ...station,
          pendingTicketCount: pending,
          inProgressTicketCount: inProgress,
        };
      }),
    );

    return stationsWithCounts;
  }

  async createStation(clubId: string, input: CreateKitchenStationInput) {
    return this.prisma.kitchenStation.create({
      data: { clubId, ...input },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // KITCHEN TICKETS
  // ─────────────────────────────────────────────────────────────

  async getTicketsForStation(stationId: string, includeCompleted = false) {
    const where: any = { stationId };
    if (!includeCompleted) {
      where.status = { notIn: [KitchenOrderStatus.SERVED, KitchenOrderStatus.CANCELLED] };
    }

    const tickets = await this.prisma.kitchenTicket.findMany({
      where,
      include: {
        items: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });

    return tickets.map(ticket => ({
      ...ticket,
      elapsedMinutes: ticket.firedAt
        ? Math.floor((Date.now() - ticket.firedAt.getTime()) / 60000)
        : 0,
    }));
  }

  async getExpoView(clubId: string) {
    // Expeditor sees all tickets across stations
    return this.prisma.kitchenTicket.findMany({
      where: {
        station: { clubId },
        status: { notIn: [KitchenOrderStatus.SERVED, KitchenOrderStatus.CANCELLED] },
      },
      include: {
        station: true,
        items: true,
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async createTicket(data: {
    stationId: string;
    ticketNumber: string;
    tableNumber?: string;
    serverName?: string;
    courseNumber: number;
    priority?: number;
    notes?: string;
    items: Array<{
      orderItemId: string;
      quantity: number;
      itemName: string;
      modifiers?: string;
      specialRequests?: string;
    }>;
  }) {
    const ticket = await this.prisma.kitchenTicket.create({
      data: {
        stationId: data.stationId,
        ticketNumber: data.ticketNumber,
        tableNumber: data.tableNumber,
        serverName: data.serverName,
        courseNumber: data.courseNumber,
        priority: data.priority || 0,
        notes: data.notes,
        firedAt: new Date(),
        items: {
          create: data.items.map(item => ({
            orderItemId: item.orderItemId,
            quantity: item.quantity,
            itemName: item.itemName,
            modifiers: item.modifiers,
            specialRequests: item.specialRequests,
          })),
        },
      },
      include: { items: true, station: true },
    });

    // Publish to KDS subscribers
    await this.pubSub.publish('KITCHEN_TICKET_CREATED', {
      kitchenTicketCreated: ticket,
    });

    return ticket;
  }

  async bumpTicket(userId: string, input: BumpTicketInput) {
    const ticket = await this.prisma.kitchenTicket.findUnique({
      where: { id: input.ticketId },
      include: { items: true },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const newStatus = input.newStatus || this.getNextStatus(ticket.status);

    const updatedTicket = await this.prisma.kitchenTicket.update({
      where: { id: input.ticketId },
      data: {
        status: newStatus,
        ...(newStatus === KitchenOrderStatus.IN_PROGRESS && { startedAt: new Date() }),
        ...(newStatus === KitchenOrderStatus.READY && { readyAt: new Date() }),
        ...(newStatus === KitchenOrderStatus.SERVED && {
          bumpedAt: new Date(),
          bumpedBy: userId,
        }),
      },
      include: { items: true, station: true },
    });

    // Update all items to same status
    await this.prisma.kitchenTicketItem.updateMany({
      where: { ticketId: input.ticketId },
      data: { status: newStatus },
    });

    // If ready, update order items
    if (newStatus === KitchenOrderStatus.READY) {
      const orderItemIds = ticket.items.map(i => i.orderItemId);
      await this.prisma.fnbOrderItem.updateMany({
        where: { id: { in: orderItemIds } },
        data: { status: KitchenOrderStatus.READY, readyAt: new Date() },
      });
    }

    // Publish update
    await this.pubSub.publish('KITCHEN_TICKET_UPDATED', {
      kitchenTicketUpdated: updatedTicket,
    });

    return { success: true, ticket: updatedTicket };
  }

  async updateItemStatus(input: UpdateTicketItemStatusInput) {
    const item = await this.prisma.kitchenTicketItem.update({
      where: { id: input.ticketItemId },
      data: {
        status: input.status,
        ...(input.status === KitchenOrderStatus.IN_PROGRESS && { startedAt: new Date() }),
        ...(input.status === KitchenOrderStatus.READY && { readyAt: new Date() }),
      },
    });

    // Check if all items on ticket are ready
    const ticket = await this.prisma.kitchenTicket.findUnique({
      where: { id: item.ticketId },
      include: { items: true },
    });

    if (ticket && ticket.items.every(i => i.status === KitchenOrderStatus.READY)) {
      await this.prisma.kitchenTicket.update({
        where: { id: ticket.id },
        data: { status: KitchenOrderStatus.READY, readyAt: new Date() },
      });
    }

    return { success: true };
  }

  async markItemEightySixed(menuItemId: string, userId: string) {
    await this.prisma.fnbMenuItem.update({
      where: { id: menuItemId },
      data: {
        isEightySixed: true,
        eightySixedAt: new Date(),
        eightySixedBy: userId,
      },
    });

    // Publish 86 notification
    await this.pubSub.publish('MENU_ITEM_86D', { menuItemId });

    return { success: true };
  }

  private getNextStatus(currentStatus: KitchenOrderStatus): KitchenOrderStatus {
    const statusFlow: Record<KitchenOrderStatus, KitchenOrderStatus> = {
      [KitchenOrderStatus.PENDING]: KitchenOrderStatus.IN_PROGRESS,
      [KitchenOrderStatus.IN_PROGRESS]: KitchenOrderStatus.READY,
      [KitchenOrderStatus.READY]: KitchenOrderStatus.SERVED,
      [KitchenOrderStatus.SERVED]: KitchenOrderStatus.SERVED,
      [KitchenOrderStatus.CANCELLED]: KitchenOrderStatus.CANCELLED,
      [KitchenOrderStatus.EIGHTY_SIXED]: KitchenOrderStatus.EIGHTY_SIXED,
    };
    return statusFlow[currentStatus];
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/fnb/kds.service.ts
git commit -m "feat(api): add KdsService for Kitchen Display System

- Add station management with ticket counts
- Add ticket creation and routing
- Add bump functionality with status progression
- Add expeditor view across all stations
- Add 86'd item notification
- Add real-time PubSub integration"
```

---

### Task 10: Create Reservation Service

**Files:**
- Create: `/apps/api/src/graphql/fnb/reservation.service.ts`

**Step 1: Create the service**

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ReservationStatus, DiningTableStatus } from '@prisma/client';
import {
  CreateReservationInput,
  UpdateReservationInput,
  CancelReservationInput,
  SeatReservationInput,
} from './fnb.input';

@Injectable()
export class ReservationService {
  constructor(private readonly prisma: PrismaService) {}

  async getReservations(
    clubId: string,
    date: Date,
    areaId?: string,
    status?: ReservationStatus,
  ) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const where: any = {
      clubId,
      reservationDate: { gte: startOfDay, lte: endOfDay },
    };

    if (areaId) where.areaId = areaId;
    if (status) where.status = status;

    return this.prisma.diningReservation.findMany({
      where,
      include: {
        area: true,
        table: true,
        member: true,
      },
      orderBy: { reservationTime: 'asc' },
    });
  }

  async getReservation(reservationId: string) {
    const reservation = await this.prisma.diningReservation.findUnique({
      where: { id: reservationId },
      include: {
        area: true,
        table: true,
        member: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return reservation;
  }

  async createReservation(clubId: string, input: CreateReservationInput) {
    const confirmationNumber = await this.generateConfirmationNumber(clubId);

    // Check table availability if specified
    if (input.tableId) {
      const isAvailable = await this.checkTableAvailability(
        input.tableId,
        input.reservationDate,
        input.reservationTime,
        input.durationMinutes,
      );

      if (!isAvailable) {
        throw new BadRequestException('Table is not available for this time');
      }
    }

    const reservation = await this.prisma.diningReservation.create({
      data: {
        clubId,
        confirmationNumber,
        ...input,
        status: ReservationStatus.PENDING,
      },
      include: {
        area: true,
        table: true,
        member: true,
      },
    });

    return reservation;
  }

  async updateReservation(reservationId: string, input: UpdateReservationInput) {
    const existing = await this.getReservation(reservationId);

    if (existing.status === ReservationStatus.CANCELLED) {
      throw new BadRequestException('Cannot update cancelled reservation');
    }

    // If changing table or time, check availability
    if (input.tableId || input.reservationDate || input.reservationTime) {
      const tableId = input.tableId || existing.tableId;
      const date = input.reservationDate || existing.reservationDate;
      const time = input.reservationTime || existing.reservationTime;

      if (tableId) {
        const isAvailable = await this.checkTableAvailability(
          tableId,
          date,
          time,
          existing.durationMinutes,
          reservationId,
        );

        if (!isAvailable) {
          throw new BadRequestException('Table is not available for this time');
        }
      }
    }

    return this.prisma.diningReservation.update({
      where: { id: reservationId },
      data: {
        ...input,
        ...(input.status === ReservationStatus.CONFIRMED && { confirmedAt: new Date() }),
      },
      include: { area: true, table: true, member: true },
    });
  }

  async confirmReservation(reservationId: string) {
    return this.prisma.diningReservation.update({
      where: { id: reservationId },
      data: {
        status: ReservationStatus.CONFIRMED,
        confirmedAt: new Date(),
      },
      include: { area: true, table: true, member: true },
    });
  }

  async cancelReservation(input: CancelReservationInput) {
    return this.prisma.diningReservation.update({
      where: { id: input.reservationId },
      data: {
        status: ReservationStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: input.reason,
      },
      include: { area: true, table: true, member: true },
    });
  }

  async markNoShow(reservationId: string) {
    return this.prisma.diningReservation.update({
      where: { id: reservationId },
      data: {
        status: ReservationStatus.NO_SHOW,
        noShowMarkedAt: new Date(),
      },
    });
  }

  async seatReservation(clubId: string, input: SeatReservationInput) {
    const reservation = await this.getReservation(input.reservationId);

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new BadRequestException('Reservation must be confirmed before seating');
    }

    // Start table session
    const session = await this.prisma.tableSession.create({
      data: {
        tableId: input.tableId,
        serverId: input.serverId,
        guestCount: reservation.partySize,
        reservationId: input.reservationId,
      },
    });

    // Update reservation and table
    await this.prisma.$transaction([
      this.prisma.diningReservation.update({
        where: { id: input.reservationId },
        data: {
          status: ReservationStatus.SEATED,
          seatedAt: new Date(),
          tableId: input.tableId,
        },
      }),
      this.prisma.diningTable.update({
        where: { id: input.tableId },
        data: { status: DiningTableStatus.OCCUPIED },
      }),
    ]);

    return {
      success: true,
      reservation: await this.getReservation(input.reservationId),
      session,
    };
  }

  async getAvailableTables(
    clubId: string,
    date: Date,
    time: string,
    partySize: number,
    durationMinutes: number = 90,
  ) {
    // Get all tables that can accommodate the party
    const tables = await this.prisma.diningTable.findMany({
      where: {
        area: { clubId },
        isActive: true,
        capacity: { gte: partySize },
        minCapacity: { lte: partySize },
      },
      include: { area: true },
    });

    // Filter out tables with conflicting reservations
    const availableTables: any[] = [];

    for (const table of tables) {
      const isAvailable = await this.checkTableAvailability(
        table.id,
        date,
        time,
        durationMinutes,
      );

      if (isAvailable) {
        availableTables.push(table);
      }
    }

    return availableTables;
  }

  private async checkTableAvailability(
    tableId: string,
    date: Date,
    time: string,
    durationMinutes: number,
    excludeReservationId?: string,
  ): Promise<boolean> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [hours, minutes] = time.split(':').map(Number);
    const requestStart = new Date(date);
    requestStart.setHours(hours, minutes, 0, 0);
    const requestEnd = new Date(requestStart.getTime() + durationMinutes * 60000);

    const conflicting = await this.prisma.diningReservation.findFirst({
      where: {
        tableId,
        reservationDate: { gte: startOfDay, lte: endOfDay },
        status: { in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED, ReservationStatus.SEATED] },
        ...(excludeReservationId && { id: { not: excludeReservationId } }),
      },
    });

    if (!conflicting) return true;

    // Check for time overlap
    const [confHours, confMinutes] = conflicting.reservationTime.split(':').map(Number);
    const confStart = new Date(conflicting.reservationDate);
    confStart.setHours(confHours, confMinutes, 0, 0);
    const confEnd = new Date(confStart.getTime() + conflicting.durationMinutes * 60000);

    // No overlap if request ends before conflict starts or starts after conflict ends
    return requestEnd <= confStart || requestStart >= confEnd;
  }

  private async generateConfirmationNumber(clubId: string): Promise<string> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/fnb/reservation.service.ts
git commit -m "feat(api): add ReservationService

- Add reservation CRUD operations
- Add table availability checking
- Add seating workflow with session creation
- Add no-show and cancellation handling
- Add available table search by party size"
```

---

## Part 3: Resolvers and Module

### Task 11: Create F&B Resolver

**Files:**
- Create: `/apps/api/src/graphql/fnb/fnb.resolver.ts`

**Step 1: Create the resolver**

```typescript
import { Resolver, Query, Mutation, Subscription, Args, ID } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { PUBSUB_TOKEN } from '../common/pubsub';

import { FloorPlanService } from './floor-plan.service';
import { FnbOrderService } from './order.service';
import { KdsService } from './kds.service';
import { ReservationService } from './reservation.service';

import {
  DiningAreaType,
  DiningTableType,
  TableSessionType,
  FnbOrderType,
  FnbOrderItemType,
  KitchenStationType,
  KitchenTicketType,
  FnbServerType,
  DiningReservationType,
  TableMutationResponse,
  OrderMutationResponse,
  SplitCheckResponse,
  MergeCheckResponse,
  ReservationMutationResponse,
  KitchenTicketMutationResponse,
  FnbMutationResponse,
} from './fnb.types';

import {
  CreateDiningAreaInput,
  UpdateDiningAreaInput,
  CreateDiningTableInput,
  UpdateDiningTableInput,
  CombineTablesInput,
  StartTableSessionInput,
  CreateFnbOrderInput,
  AddOrderItemInput,
  UpdateOrderItemInput,
  VoidOrderItemInput,
  FireCourseInput,
  SendToKitchenInput,
  SplitCheckInput,
  SplitCheckBySeatInput,
  MergeChecksInput,
  CreateKitchenStationInput,
  BumpTicketInput,
  CreateReservationInput,
  UpdateReservationInput,
  CancelReservationInput,
  SeatReservationInput,
} from './fnb.input';

@Resolver()
@UseGuards(GqlAuthGuard)
export class FnbResolver {
  constructor(
    private readonly floorPlanService: FloorPlanService,
    private readonly orderService: FnbOrderService,
    private readonly kdsService: KdsService,
    private readonly reservationService: ReservationService,
    @Inject(PUBSUB_TOKEN) private readonly pubSub: any,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // FLOOR PLAN QUERIES
  // ─────────────────────────────────────────────────────────────

  @Query(() => [DiningAreaType], { name: 'diningAreas' })
  async getDiningAreas(@GqlCurrentUser() user: JwtPayload) {
    return this.floorPlanService.getDiningAreas(user.tenantId);
  }

  @Query(() => DiningAreaType, { name: 'diningArea' })
  async getDiningArea(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.floorPlanService.getDiningArea(user.tenantId, id);
  }

  @Query(() => DiningTableType, { name: 'diningTable' })
  async getDiningTable(@Args('id', { type: () => ID }) id: string) {
    return this.floorPlanService.getTable(id);
  }

  // ─────────────────────────────────────────────────────────────
  // FLOOR PLAN MUTATIONS
  // ─────────────────────────────────────────────────────────────

  @Mutation(() => DiningAreaType)
  async createDiningArea(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateDiningAreaInput,
  ) {
    return this.floorPlanService.createDiningArea(user.tenantId, input);
  }

  @Mutation(() => TableMutationResponse)
  async createDiningTable(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateDiningTableInput,
  ) {
    const table = await this.floorPlanService.createTable(user.tenantId, input);
    return { success: true, table };
  }

  @Mutation(() => TableMutationResponse)
  async updateDiningTable(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateDiningTableInput,
  ) {
    const table = await this.floorPlanService.updateTable(user.tenantId, id, input);
    return { success: true, table };
  }

  @Mutation(() => TableMutationResponse)
  async combineTables(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CombineTablesInput,
  ) {
    const table = await this.floorPlanService.combineTables(user.tenantId, input);
    return { success: true, table };
  }

  @Mutation(() => TableSessionType)
  async startTableSession(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: StartTableSessionInput,
  ) {
    return this.floorPlanService.startSession(user.tenantId, input);
  }

  // ─────────────────────────────────────────────────────────────
  // ORDER QUERIES
  // ─────────────────────────────────────────────────────────────

  @Query(() => FnbOrderType, { name: 'fnbOrder' })
  async getFnbOrder(@Args('id', { type: () => ID }) id: string) {
    return this.orderService.getOrder(id);
  }

  @Query(() => [FnbOrderType], { name: 'tableOrders' })
  async getTableOrders(@Args('tableId', { type: () => ID }) tableId: string) {
    return this.orderService.getOrdersByTable(tableId);
  }

  // ─────────────────────────────────────────────────────────────
  // ORDER MUTATIONS
  // ─────────────────────────────────────────────────────────────

  @Mutation(() => OrderMutationResponse)
  async createFnbOrder(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateFnbOrderInput,
  ) {
    const order = await this.orderService.createOrder(user.tenantId, input);
    return { success: true, order };
  }

  @Mutation(() => FnbOrderItemType)
  async addOrderItem(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: AddOrderItemInput,
  ) {
    return this.orderService.addOrderItem(user.tenantId, input);
  }

  @Mutation(() => FnbOrderItemType)
  async updateOrderItem(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateOrderItemInput,
  ) {
    return this.orderService.updateOrderItem(id, input);
  }

  @Mutation(() => FnbMutationResponse)
  async voidOrderItem(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: VoidOrderItemInput,
  ) {
    return this.orderService.voidOrderItem(user.sub, input);
  }

  @Mutation(() => FnbMutationResponse)
  async fireCourse(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: FireCourseInput,
  ) {
    return this.orderService.fireCourse(user.sub, input);
  }

  @Mutation(() => OrderMutationResponse)
  async sendToKitchen(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: SendToKitchenInput,
  ) {
    const order = await this.orderService.sendToKitchen(user.sub, input);
    return { success: true, order };
  }

  @Mutation(() => SplitCheckResponse)
  async splitCheck(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: SplitCheckInput,
  ) {
    return this.orderService.splitCheckEvenly(user.tenantId, input);
  }

  @Mutation(() => SplitCheckResponse)
  async splitCheckBySeat(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: SplitCheckBySeatInput,
  ) {
    return this.orderService.splitCheckBySeat(user.tenantId, input);
  }

  @Mutation(() => MergeCheckResponse)
  async mergeChecks(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: MergeChecksInput,
  ) {
    return this.orderService.mergeChecks(user.tenantId, input);
  }

  // ─────────────────────────────────────────────────────────────
  // KDS QUERIES
  // ─────────────────────────────────────────────────────────────

  @Query(() => [KitchenStationType], { name: 'kitchenStations' })
  async getKitchenStations(@GqlCurrentUser() user: JwtPayload) {
    return this.kdsService.getStations(user.tenantId);
  }

  @Query(() => [KitchenTicketType], { name: 'stationTickets' })
  async getStationTickets(@Args('stationId', { type: () => ID }) stationId: string) {
    return this.kdsService.getTicketsForStation(stationId);
  }

  @Query(() => [KitchenTicketType], { name: 'expoView' })
  async getExpoView(@GqlCurrentUser() user: JwtPayload) {
    return this.kdsService.getExpoView(user.tenantId);
  }

  // ─────────────────────────────────────────────────────────────
  // KDS MUTATIONS
  // ─────────────────────────────────────────────────────────────

  @Mutation(() => KitchenStationType)
  async createKitchenStation(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateKitchenStationInput,
  ) {
    return this.kdsService.createStation(user.tenantId, input);
  }

  @Mutation(() => KitchenTicketMutationResponse)
  async bumpTicket(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: BumpTicketInput,
  ) {
    return this.kdsService.bumpTicket(user.sub, input);
  }

  @Mutation(() => FnbMutationResponse)
  async markItem86(@Args('menuItemId', { type: () => ID }) menuItemId: string, @GqlCurrentUser() user: JwtPayload) {
    return this.kdsService.markItemEightySixed(menuItemId, user.sub);
  }

  // ─────────────────────────────────────────────────────────────
  // RESERVATION QUERIES
  // ─────────────────────────────────────────────────────────────

  @Query(() => [DiningReservationType], { name: 'diningReservations' })
  async getDiningReservations(
    @GqlCurrentUser() user: JwtPayload,
    @Args('date') date: Date,
    @Args('areaId', { type: () => ID, nullable: true }) areaId?: string,
  ) {
    return this.reservationService.getReservations(user.tenantId, date, areaId);
  }

  @Query(() => DiningReservationType, { name: 'diningReservation' })
  async getDiningReservation(@Args('id', { type: () => ID }) id: string) {
    return this.reservationService.getReservation(id);
  }

  @Query(() => [DiningTableType], { name: 'availableTables' })
  async getAvailableTables(
    @GqlCurrentUser() user: JwtPayload,
    @Args('date') date: Date,
    @Args('time') time: string,
    @Args('partySize') partySize: number,
  ) {
    return this.reservationService.getAvailableTables(user.tenantId, date, time, partySize);
  }

  // ─────────────────────────────────────────────────────────────
  // RESERVATION MUTATIONS
  // ─────────────────────────────────────────────────────────────

  @Mutation(() => ReservationMutationResponse)
  async createReservation(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateReservationInput,
  ) {
    const reservation = await this.reservationService.createReservation(user.tenantId, input);
    return { success: true, reservation };
  }

  @Mutation(() => ReservationMutationResponse)
  async updateReservation(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateReservationInput,
  ) {
    const reservation = await this.reservationService.updateReservation(id, input);
    return { success: true, reservation };
  }

  @Mutation(() => ReservationMutationResponse)
  async confirmReservation(@Args('id', { type: () => ID }) id: string) {
    const reservation = await this.reservationService.confirmReservation(id);
    return { success: true, reservation };
  }

  @Mutation(() => ReservationMutationResponse)
  async cancelReservation(@Args('input') input: CancelReservationInput) {
    const reservation = await this.reservationService.cancelReservation(input);
    return { success: true, reservation };
  }

  @Mutation(() => FnbMutationResponse)
  async seatReservation(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: SeatReservationInput,
  ) {
    return this.reservationService.seatReservation(user.tenantId, input);
  }

  // ─────────────────────────────────────────────────────────────
  // SUBSCRIPTIONS
  // ─────────────────────────────────────────────────────────────

  @Subscription(() => KitchenTicketType, { name: 'kitchenTicketCreated' })
  kitchenTicketCreated(@Args('stationId', { type: () => ID, nullable: true }) stationId?: string) {
    return this.pubSub.asyncIterator('KITCHEN_TICKET_CREATED');
  }

  @Subscription(() => KitchenTicketType, { name: 'kitchenTicketUpdated' })
  kitchenTicketUpdated(@Args('stationId', { type: () => ID, nullable: true }) stationId?: string) {
    return this.pubSub.asyncIterator('KITCHEN_TICKET_UPDATED');
  }

  @Subscription(() => ID, { name: 'menuItem86d' })
  menuItem86d() {
    return this.pubSub.asyncIterator('MENU_ITEM_86D');
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/fnb/fnb.resolver.ts
git commit -m "feat(api): add FnbResolver

- Add floor plan queries and mutations
- Add order management operations
- Add KDS queries and bump operations
- Add reservation management
- Add real-time subscriptions for KDS"
```

---

### Task 12: Create F&B Module

**Files:**
- Create: `/apps/api/src/graphql/fnb/fnb.module.ts`

**Step 1: Create the module**

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { TaxModule } from '@/shared/tax/tax.module';

import { FloorPlanService } from './floor-plan.service';
import { FnbOrderService } from './order.service';
import { KdsService } from './kds.service';
import { ReservationService } from './reservation.service';
import { FnbResolver } from './fnb.resolver';

@Module({
  imports: [PrismaModule, TaxModule],
  providers: [
    FloorPlanService,
    FnbOrderService,
    KdsService,
    ReservationService,
    FnbResolver,
  ],
  exports: [
    FloorPlanService,
    FnbOrderService,
    KdsService,
    ReservationService,
  ],
})
export class FnbModule {}
```

**Step 2: Register in GraphQL module**

Modify `/apps/api/src/graphql/graphql.module.ts`:

```typescript
import { FnbModule } from './fnb/fnb.module';

@Module({
  imports: [
    // ... existing imports ...
    FnbModule,
  ],
})
export class GraphqlModule {}
```

**Step 3: Commit**

```bash
git add apps/api/src/graphql/fnb/fnb.module.ts apps/api/src/graphql/graphql.module.ts
git commit -m "feat(api): add FnbModule and register in GraphQL

- Create FnbModule with all services and resolver
- Register FnbModule in main GraphQL module
- Export services for use by other modules"
```

---

## Part 4: Summary and Remaining Tasks

The implementation plan continues with the following sections that follow the same detailed pattern:

### Tasks 13-18: GraphQL Operations & API Client
- Create `/packages/api-client/src/operations/fnb.graphql` with all queries/mutations
- Run codegen to generate hooks
- Export hooks from api-client package

### Tasks 19-28: React Components

**Floor Plan Components:**
- `/apps/application/src/components/fnb/floor-plan-editor.tsx` - Drag-and-drop table layout
- `/apps/application/src/components/fnb/table-card.tsx` - Table status display
- `/apps/application/src/components/fnb/table-status-dialog.tsx` - Table details modal

**Order Entry Components:**
- `/apps/application/src/components/fnb/order-entry.tsx` - POS order screen
- `/apps/application/src/components/fnb/menu-grid.tsx` - Menu item selection
- `/apps/application/src/components/fnb/modifier-dialog.tsx` - Modifier selection
- `/apps/application/src/components/fnb/order-summary.tsx` - Current order display
- `/apps/application/src/components/fnb/split-check-dialog.tsx` - Check splitting

**KDS Components:**
- `/apps/application/src/components/fnb/kds-display.tsx` - Kitchen display screen
- `/apps/application/src/components/fnb/kds-ticket.tsx` - Individual ticket card
- `/apps/application/src/components/fnb/expo-view.tsx` - Expeditor overview

**Server & Reservation Components:**
- `/apps/application/src/components/fnb/server-assignment.tsx` - Server section setup
- `/apps/application/src/components/fnb/reservation-calendar.tsx` - Reservation timeline
- `/apps/application/src/components/fnb/reservation-dialog.tsx` - Create/edit reservation

### Tasks 29-35: Pages & Integration
- Create F&B section pages under `/apps/application/src/app/(dashboard)/fnb/`
- Add navigation to sidebar
- Integrate with existing POS payment flow
- Add tip allocation to checkout

### Tasks 36-42: Testing & Documentation
- Create seed data for F&B entities
- Write E2E tests for critical flows
- Update API documentation
- Create user guide for F&B operations

---

## File Reference

| Layer | Location Pattern |
|-------|------------------|
| Prisma Schema | `/database/prisma/schema.prisma` |
| GraphQL Types | `/apps/api/src/graphql/fnb/fnb.types.ts` |
| GraphQL Inputs | `/apps/api/src/graphql/fnb/fnb.input.ts` |
| Services | `/apps/api/src/graphql/fnb/*.service.ts` |
| Resolvers | `/apps/api/src/graphql/fnb/fnb.resolver.ts` |
| Module | `/apps/api/src/graphql/fnb/fnb.module.ts` |
| Operations | `/packages/api-client/src/operations/fnb.graphql` |
| UI Components | `/apps/application/src/components/fnb/*.tsx` |
| Pages | `/apps/application/src/app/(dashboard)/fnb/**` |

---

## Estimated Effort

| Part | Features | Tasks | Estimated Hours |
|------|----------|-------|-----------------|
| 1 | Prisma Models | 1-4 | 4-5 |
| 2 | GraphQL Types/Inputs | 5-6 | 3-4 |
| 3 | Services | 7-10 | 8-10 |
| 4 | Resolvers/Module | 11-12 | 3-4 |
| 5 | API Client | 13-18 | 4-5 |
| 6 | React Components | 19-28 | 16-20 |
| 7 | Pages/Integration | 29-35 | 8-10 |
| 8 | Testing/Docs | 36-42 | 6-8 |

**Total: ~52-66 hours across 42 tasks**