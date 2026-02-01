# POS Phase 2: Spa Module - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the Spa Module with 9 MVP features: Service Menu, Online Booking, Staff Scheduling, Resource Booking, Appointment Reminders, Treatment Packages, Package Redemption, Product Sales, and Combined Checkout.

**Architecture:** Each feature follows a layered approach: Prisma schema → GraphQL types/inputs → Service layer → Resolvers → API Client codegen → React components. The Spa module reuses core POS infrastructure (PaymentService, BookingLineItem, Member accounts, Tax engine) while adding spa-specific entities (SpaService, SpaAppointment, SpaPackage, SpaRoom, SpaStaff).

**Tech Stack:** Prisma ORM, NestJS GraphQL, TanStack Query, React, Tailwind CSS, Radix UI primitives, Twilio (SMS reminders), SendGrid (email reminders).

---

## Prerequisites

Before starting implementation:
1. Ensure Phase 1 POS features are complete (discounts, payments infrastructure)
2. Create feature branch: `git checkout -b feature/pos-phase2-spa`
3. Verify dev environment: `pnpm dev`

---

## Part 1: Spa Database Models

### Task 1.1: Add Spa Enums to Prisma Schema

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Step 1: Add spa-related enums at the end of the enums section**

```prisma
// ─────────────────────────────────────────────────────────────
// SPA MODULE ENUMS
// ─────────────────────────────────────────────────────────────

enum SpaServiceCategory {
  MASSAGE
  FACIAL
  BODY_TREATMENT
  NAIL
  HAIR
  WELLNESS
  PACKAGE
}

enum SpaAppointmentStatus {
  PENDING
  CONFIRMED
  CHECKED_IN
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}

enum SpaRoomType {
  TREATMENT_ROOM
  MASSAGE_ROOM
  FACIAL_ROOM
  NAIL_STATION
  HAIR_STATION
  SAUNA
  STEAM_ROOM
  RELAXATION_LOUNGE
}

enum SpaResourceStatus {
  AVAILABLE
  IN_USE
  MAINTENANCE
  OUT_OF_SERVICE
}

enum ReminderChannel {
  SMS
  EMAIL
  BOTH
}

enum ReminderStatus {
  PENDING
  SENT
  FAILED
  CANCELLED
}

enum SpaPackageStatus {
  ACTIVE
  EXPIRED
  FULLY_REDEEMED
  CANCELLED
}
```

**Step 2: Commit**

```bash
git add database/prisma/schema.prisma
git commit -m "feat(db): add Spa module enums

- Add SpaServiceCategory for treatment classification
- Add SpaAppointmentStatus for booking lifecycle
- Add SpaRoomType and SpaResourceStatus for resources
- Add ReminderChannel and ReminderStatus for notifications
- Add SpaPackageStatus for package tracking"
```

---

### Task 1.2: Add Spa Service Model

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Step 1: Add SpaService and SpaServiceCategory models**

```prisma
// ─────────────────────────────────────────────────────────────
// SPA SERVICES
// ─────────────────────────────────────────────────────────────

model SpaServiceCategory {
  id            String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId        String       @db.Uuid
  name          String       @db.VarChar(100)
  description   String?
  sortOrder     Int          @default(0)
  isActive      Boolean      @default(true)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  club          Club         @relation(fields: [clubId], references: [id], onDelete: Cascade)
  services      SpaService[]

  @@unique([clubId, name])
  @@index([clubId])
  @@map("spa_service_categories")
}

model SpaService {
  id                  String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId              String              @db.Uuid
  categoryId          String              @db.Uuid
  name                String              @db.VarChar(200)
  description         String?
  durationMinutes     Int                 // Treatment duration
  bufferMinutes       Int                 @default(15) // Cleanup/prep time between appointments
  price               Decimal             @db.Decimal(10, 2)
  memberPrice         Decimal?            @db.Decimal(10, 2) // Optional member discount price
  taxType             TaxType             @default(ADD)
  taxRate             Decimal             @default(7) @db.Decimal(5, 2)
  requiredRoomTypes   SpaRoomType[]       // Which room types can host this service
  requiredSkills      String[]            @default([]) // Staff skills required
  maxConcurrent       Int                 @default(1) // How many can run simultaneously
  imageUrl            String?             @db.VarChar(500)
  isOnlineBookable    Boolean             @default(true)
  advanceBookingDays  Int                 @default(30) // How far ahead members can book
  cancellationHours   Int                 @default(24) // Cancellation policy
  sortOrder           Int                 @default(0)
  isActive            Boolean             @default(true)
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  club                Club                @relation(fields: [clubId], references: [id], onDelete: Cascade)
  category            SpaServiceCategory  @relation(fields: [categoryId], references: [id])
  appointments        SpaAppointment[]
  packageServices     SpaPackageService[]
  staffServices       SpaStaffService[]

  @@index([clubId])
  @@index([clubId, categoryId])
  @@index([clubId, isActive])
  @@map("spa_services")
}
```

**Step 2: Add relation to Club model**

Find the `Club` model and add:

```prisma
model Club {
  // ... existing fields ...

  spaServiceCategories  SpaServiceCategory[]
  spaServices           SpaService[]
}
```

**Step 3: Commit**

```bash
git add database/prisma/schema.prisma
git commit -m "feat(db): add SpaServiceCategory and SpaService models

- Add SpaServiceCategory for organizing treatments
- Add SpaService with duration, pricing, room requirements
- Add member pricing, online booking settings
- Add cancellation policy configuration"
```

---

### Task 1.3: Add Spa Staff Models

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Step 1: Add SpaStaff and related models**

```prisma
// ─────────────────────────────────────────────────────────────
// SPA STAFF
// ─────────────────────────────────────────────────────────────

model SpaStaff {
  id                String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId            String              @db.Uuid
visibleNickname           String              @db.VarChar(100) // Display name for booking
  firstName         String              @db.VarChar(100)
  lastName          String              @db.VarChar(100)
  email             String?             @db.VarChar(255)
  phone             String?             @db.VarChar(50)
  avatarUrl         String?             @db.VarChar(500)
  bio               String?             // Staff bio for member-facing pages
  isOnlineBookable  Boolean             @default(true)
  sortOrder         Int                 @default(0)
  isActive          Boolean             @default(true)
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  club              Club                @relation(fields: [clubId], references: [id], onDelete: Cascade)
  services          SpaStaffService[]
  schedules         SpaStaffSchedule[]
  appointments      SpaAppointment[]
  timeOffRequests   SpaStaffTimeOff[]

  @@index([clubId])
  @@index([clubId, isActive])
  @@map("spa_staff")
}

model SpaStaffService {
  id          String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  staffId     String      @db.Uuid
  serviceId   String      @db.Uuid
  skillLevel  SkillLevel  @default(INTERMEDIATE)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  staff       SpaStaff    @relation(fields: [staffId], references: [id], onDelete: Cascade)
  service     SpaService  @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@unique([staffId, serviceId])
  @@index([staffId])
  @@index([serviceId])
  @@map("spa_staff_services")
}

model SpaStaffSchedule {
  id            String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  staffId       String    @db.Uuid
  dayOfWeek     Int       // 0 = Sunday, 6 = Saturday
  startTime     String    @db.VarChar(5) // HH:MM format
  endTime       String    @db.VarChar(5)
  isWorkingDay  Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  staff         SpaStaff  @relation(fields: [staffId], references: [id], onDelete: Cascade)

  @@unique([staffId, dayOfWeek])
  @@index([staffId])
  @@map("spa_staff_schedules")
}

model SpaStaffTimeOff {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  staffId     String    @db.Uuid
  startDate   DateTime  @db.Date
  endDate     DateTime  @db.Date
  reason      String?   @db.VarChar(255)
  isApproved  Boolean   @default(false)
  approvedBy  String?   @db.Uuid
  approvedAt  DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  staff       SpaStaff  @relation(fields: [staffId], references: [id], onDelete: Cascade)

  @@index([staffId])
  @@index([staffId, startDate, endDate])
  @@map("spa_staff_time_off")
}
```

**Step 2: Add relation to Club model**

```prisma
model Club {
  // ... existing fields ...

  spaStaff              SpaStaff[]
}
```

**Step 3: Commit**

```bash
git add database/prisma/schema.prisma
git commit -m "feat(db): add SpaStaff models

- Add SpaStaff with profile, bio, online booking flag
- Add SpaStaffService for skill/service mapping
- Add SpaStaffSchedule for weekly availability
- Add SpaStaffTimeOff for vacation/leave tracking"
```

---

### Task 1.4: Add Spa Room/Resource Models

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Step 1: Add SpaRoom and SpaEquipment models**

```prisma
// ─────────────────────────────────────────────────────────────
// SPA ROOMS & RESOURCES
// ─────────────────────────────────────────────────────────────

model SpaRoom {
  id            String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId        String            @db.Uuid
  name          String            @db.VarChar(100)
  code          String            @db.VarChar(20)
  roomType      SpaRoomType
  description   String?
  capacity      Int               @default(1) // Number of guests/beds
  amenities     String[]          @default([])
  imageUrl      String?           @db.VarChar(500)
  status        SpaResourceStatus @default(AVAILABLE)
  sortOrder     Int               @default(0)
  isActive      Boolean           @default(true)
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  club          Club              @relation(fields: [clubId], references: [id], onDelete: Cascade)
  appointments  SpaAppointment[]
  equipment     SpaRoomEquipment[]

  @@unique([clubId, code])
  @@index([clubId])
  @@index([clubId, roomType])
  @@index([clubId, status])
  @@map("spa_rooms")
}

model SpaEquipment {
  id            String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId        String              @db.Uuid
  name          String              @db.VarChar(100)
  code          String              @db.VarChar(20)
  description   String?
  quantity      Int                 @default(1)
  status        SpaResourceStatus   @default(AVAILABLE)
  maintenanceDate DateTime?         @db.Date
  isActive      Boolean             @default(true)
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  club          Club                @relation(fields: [clubId], references: [id], onDelete: Cascade)
  rooms         SpaRoomEquipment[]

  @@unique([clubId, code])
  @@index([clubId])
  @@map("spa_equipment")
}

model SpaRoomEquipment {
  id          String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  roomId      String        @db.Uuid
  equipmentId String        @db.Uuid
  createdAt   DateTime      @default(now())

  room        SpaRoom       @relation(fields: [roomId], references: [id], onDelete: Cascade)
  equipment   SpaEquipment  @relation(fields: [equipmentId], references: [id], onDelete: Cascade)

  @@unique([roomId, equipmentId])
  @@index([roomId])
  @@index([equipmentId])
  @@map("spa_room_equipment")
}
```

**Step 2: Add relations to Club model**

```prisma
model Club {
  // ... existing fields ...

  spaRooms              SpaRoom[]
  spaEquipment          SpaEquipment[]
}
```

**Step 3: Commit**

```bash
git add database/prisma/schema.prisma
git commit -m "feat(db): add SpaRoom and SpaEquipment models

- Add SpaRoom with type, capacity, amenities
- Add SpaEquipment for portable equipment tracking
- Add SpaRoomEquipment junction table
- Add status tracking for maintenance"
```

---

### Task 1.5: Add Spa Appointment Model

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Step 1: Add SpaAppointment model**

```prisma
// ─────────────────────────────────────────────────────────────
// SPA APPOINTMENTS
// ─────────────────────────────────────────────────────────────

model SpaAppointment {
  id                  String                @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId              String                @db.Uuid
  appointmentNumber   String                @db.VarChar(30)
  serviceId           String                @db.Uuid
  memberId            String?               @db.Uuid
  guestName           String?               @db.VarChar(200)
  guestEmail          String?               @db.VarChar(255)
  guestPhone          String?               @db.VarChar(50)
  staffId             String                @db.Uuid
  roomId              String?               @db.Uuid

  // Timing
  appointmentDate     DateTime              @db.Date
  startTime           String                @db.VarChar(5) // HH:MM
  endTime             String                @db.VarChar(5)
  durationMinutes     Int

  // Status
  status              SpaAppointmentStatus  @default(PENDING)
  confirmedAt         DateTime?
  checkedInAt         DateTime?
  startedAt           DateTime?
  completedAt         DateTime?
  cancelledAt         DateTime?
  cancelledBy         String?               @db.Uuid
  cancelReason        String?               @db.VarChar(500)
  noShowMarkedAt      DateTime?

  // Pricing (snapshot at booking time)
  originalPrice       Decimal               @db.Decimal(10, 2)
  finalPrice          Decimal               @db.Decimal(10, 2)
  taxType             TaxType
  taxRate             Decimal               @db.Decimal(5, 2)
  taxAmount           Decimal               @db.Decimal(10, 2)
  totalAmount         Decimal               @db.Decimal(10, 2)

  // Package redemption
  packageRedemptionId String?               @db.Uuid

  // Payment
  isPaid              Boolean               @default(false)
  paidAt              DateTime?
  paymentMethodId     String?               @db.Uuid

  // Booking source
  bookedOnline        Boolean               @default(false)
  bookedBy            String?               @db.Uuid // Staff who made booking
  specialRequests     String?

  createdAt           DateTime              @default(now())
  updatedAt           DateTime              @updatedAt

  club                Club                  @relation(fields: [clubId], references: [id], onDelete: Cascade)
  service             SpaService            @relation(fields: [serviceId], references: [id])
  member              Member?               @relation(fields: [memberId], references: [id])
  staff               SpaStaff              @relation(fields: [staffId], references: [id])
  room                SpaRoom?              @relation(fields: [roomId], references: [id])
  packageRedemption   SpaPackageRedemption? @relation(fields: [packageRedemptionId], references: [id])
  reminders           SpaAppointmentReminder[]
  lineItems           SpaAppointmentLineItem[]

  @@unique([clubId, appointmentNumber])
  @@index([clubId])
  @@index([clubId, appointmentDate])
  @@index([staffId, appointmentDate])
  @@index([roomId, appointmentDate])
  @@index([memberId])
  @@index([status])
  @@map("spa_appointments")
}

model SpaAppointmentLineItem {
  id              String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  appointmentId   String          @db.Uuid
  type            LineItemType    // SERVICE or PROSHOP (retail)
  description     String          @db.VarChar(200)
  productId       String?         @db.Uuid // For retail products
  quantity        Int             @default(1)
  unitPrice       Decimal         @db.Decimal(10, 2)
  taxType         TaxType
  taxRate         Decimal         @db.Decimal(5, 2)
  taxAmount       Decimal         @db.Decimal(10, 2)
  totalAmount     Decimal         @db.Decimal(10, 2)
  isPaid          Boolean         @default(false)
  paidAt          DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  appointment     SpaAppointment  @relation(fields: [appointmentId], references: [id], onDelete: Cascade)

  @@index([appointmentId])
  @@map("spa_appointment_line_items")
}
```

**Step 2: Add relations to Club and Member models**

```prisma
model Club {
  // ... existing fields ...

  spaAppointments       SpaAppointment[]
}

model Member {
  // ... existing fields ...

  spaAppointments       SpaAppointment[]
  spaPackages           SpaPackagePurchase[]
}
```

**Step 3: Commit**

```bash
git add database/prisma/schema.prisma
git commit -m "feat(db): add SpaAppointment model

- Add SpaAppointment with service, staff, room assignment
- Add timing, status lifecycle, pricing snapshot
- Add package redemption link
- Add SpaAppointmentLineItem for service + retail charges
- Add booking source tracking (online vs staff)"
```

---

### Task 1.6: Add Spa Reminder Model

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Step 1: Add SpaAppointmentReminder model**

```prisma
// ─────────────────────────────────────────────────────────────
// SPA REMINDERS
// ─────────────────────────────────────────────────────────────

model SpaAppointmentReminder {
  id              String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  appointmentId   String          @db.Uuid
  channel         ReminderChannel
  scheduledFor    DateTime        // When to send
  sentAt          DateTime?
  status          ReminderStatus  @default(PENDING)
  errorMessage    String?
  messageId       String?         @db.VarChar(100) // External provider message ID
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  appointment     SpaAppointment  @relation(fields: [appointmentId], references: [id], onDelete: Cascade)

  @@index([appointmentId])
  @@index([status, scheduledFor])
  @@map("spa_appointment_reminders")
}

model SpaReminderConfig {
  id                    String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId                String          @unique @db.Uuid
  enabled               Boolean         @default(true)
  defaultChannel        ReminderChannel @default(BOTH)
  reminderHoursBefore   Int[]           @default([24, 2]) // Send 24h and 2h before
  smsTemplate           String?         // SMS message template
  emailSubject          String?         // Email subject template
  emailTemplate         String?         // Email body template
  createdAt             DateTime        @default(now())
  updatedAt             DateTime        @updatedAt

  club                  Club            @relation(fields: [clubId], references: [id], onDelete: Cascade)

  @@index([clubId])
  @@map("spa_reminder_configs")
}
```

**Step 2: Add relation to Club model**

```prisma
model Club {
  // ... existing fields ...

  spaReminderConfig     SpaReminderConfig?
}
```

**Step 3: Commit**

```bash
git add database/prisma/schema.prisma
git commit -m "feat(db): add Spa reminder models

- Add SpaAppointmentReminder for SMS/email tracking
- Add SpaReminderConfig for club-level settings
- Support multiple reminder times (24h, 2h before)
- Add message templates for customization"
```

---

### Task 1.7: Add Spa Package Models

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Step 1: Add SpaPackage and related models**

```prisma
// ─────────────────────────────────────────────────────────────
// SPA PACKAGES (PREPAID BUNDLES)
// ─────────────────────────────────────────────────────────────

model SpaPackage {
  id                  String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId              String              @db.Uuid
  name                String              @db.VarChar(200)
  description         String?
  price               Decimal             @db.Decimal(10, 2)
  memberPrice         Decimal?            @db.Decimal(10, 2)
  taxType             TaxType             @default(ADD)
  taxRate             Decimal             @default(7) @db.Decimal(5, 2)
  validityDays        Int                 @default(365) // How long package is valid after purchase
  isTransferable      Boolean             @default(false) // Can be used by other members
  imageUrl            String?             @db.VarChar(500)
  sortOrder           Int                 @default(0)
  isActive            Boolean             @default(true)
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  club                Club                @relation(fields: [clubId], references: [id], onDelete: Cascade)
  services            SpaPackageService[]
  purchases           SpaPackagePurchase[]

  @@index([clubId])
  @@index([clubId, isActive])
  @@map("spa_packages")
}

model SpaPackageService {
  id          String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  packageId   String      @db.Uuid
  serviceId   String      @db.Uuid
  quantity    Int         @default(1) // How many of this service included
  createdAt   DateTime    @default(now())

  package     SpaPackage  @relation(fields: [packageId], references: [id], onDelete: Cascade)
  service     SpaService  @relation(fields: [serviceId], references: [id], onDelete: Cascade)

  @@unique([packageId, serviceId])
  @@index([packageId])
  @@index([serviceId])
  @@map("spa_package_services")
}

model SpaPackagePurchase {
  id                  String                  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId              String                  @db.Uuid
  packageId           String                  @db.Uuid
  memberId            String                  @db.Uuid
  purchaseNumber      String                  @db.VarChar(30)
  purchaseDate        DateTime                @default(now())
  expiryDate          DateTime                @db.Date
  purchasePrice       Decimal                 @db.Decimal(10, 2)
  taxAmount           Decimal                 @db.Decimal(10, 2)
  totalAmount         Decimal                 @db.Decimal(10, 2)
  status              SpaPackageStatus        @default(ACTIVE)
  isPaid              Boolean                 @default(false)
  paidAt              DateTime?
  paymentMethodId     String?                 @db.Uuid
  notes               String?
  createdAt           DateTime                @default(now())
  updatedAt           DateTime                @updatedAt

  package             SpaPackage              @relation(fields: [packageId], references: [id])
  member              Member                  @relation(fields: [memberId], references: [id])
  redemptions         SpaPackageRedemption[]

  @@unique([clubId, purchaseNumber])
  @@index([clubId])
  @@index([memberId])
  @@index([memberId, status])
  @@map("spa_package_purchases")
}

model SpaPackageRedemption {
  id                  String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  purchaseId          String              @db.Uuid
  serviceId           String              @db.Uuid
  redeemedAt          DateTime            @default(now())
  redeemedBy          String?             @db.Uuid // Staff who processed
  notes               String?
  createdAt           DateTime            @default(now())

  purchase            SpaPackagePurchase  @relation(fields: [purchaseId], references: [id], onDelete: Cascade)
  appointments        SpaAppointment[]

  @@index([purchaseId])
  @@index([serviceId])
  @@map("spa_package_redemptions")
}
```

**Step 2: Add relation to Club model**

```prisma
model Club {
  // ... existing fields ...

  spaPackages           SpaPackage[]
}
```

**Step 3: Commit**

```bash
git add database/prisma/schema.prisma
git commit -m "feat(db): add Spa package models

- Add SpaPackage for prepaid treatment bundles
- Add SpaPackageService for included services
- Add SpaPackagePurchase for member purchases
- Add SpaPackageRedemption for usage tracking
- Support validity periods and transferability"
```

---

### Task 1.8: Add Spa Retail Products Extension

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Step 1: Add SpaProductCategory for retail**

```prisma
// ─────────────────────────────────────────────────────────────
// SPA RETAIL PRODUCTS
// ─────────────────────────────────────────────────────────────

model SpaProductCategory {
  id            String        @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId        String        @db.Uuid
  name          String        @db.VarChar(100)
  description   String?
  sortOrder     Int           @default(0)
  isActive      Boolean       @default(true)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  club          Club          @relation(fields: [clubId], references: [id], onDelete: Cascade)
  products      SpaProduct[]

  @@unique([clubId, name])
  @@index([clubId])
  @@map("spa_product_categories")
}

model SpaProduct {
  id              String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId          String              @db.Uuid
  categoryId      String              @db.Uuid
  name            String              @db.VarChar(200)
  description     String?
  sku             String?             @db.VarChar(50)
  barcode         String?             @db.VarChar(50)
  price           Decimal             @db.Decimal(10, 2)
  costPrice       Decimal?            @db.Decimal(10, 2)
  taxType         TaxType             @default(ADD)
  taxRate         Decimal             @default(7) @db.Decimal(5, 2)
  stockQuantity   Int                 @default(0)
  reorderLevel    Int?
  imageUrl        String?             @db.VarChar(500)
  brand           String?             @db.VarChar(100)
  isActive        Boolean             @default(true)
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt

  club            Club                @relation(fields: [clubId], references: [id], onDelete: Cascade)
  category        SpaProductCategory  @relation(fields: [categoryId], references: [id])

  @@unique([clubId, sku])
  @@index([clubId])
  @@index([clubId, categoryId])
  @@index([clubId, isActive])
  @@map("spa_products")
}
```

**Step 2: Add relation to Club model**

```prisma
model Club {
  // ... existing fields ...

  spaProductCategories  SpaProductCategory[]
  spaProducts           SpaProduct[]
}
```

**Step 3: Commit**

```bash
git add database/prisma/schema.prisma
git commit -m "feat(db): add Spa retail product models

- Add SpaProductCategory for skincare/retail categories
- Add SpaProduct with inventory tracking
- Support SKU, barcode, cost price
- Add stock quantity and reorder levels"
```

---

### Task 1.9: Generate Prisma Client and Create Migration

**Step 1: Generate Prisma client**

```bash
cd database && pnpm prisma generate
```

**Step 2: Create migration**

```bash
cd database && pnpm prisma migrate dev --name add_spa_module
```

Expected: Migration applied successfully with all Spa models created

**Step 3: Commit**

```bash
git add database/prisma/
git commit -m "feat(db): generate Spa module migration

- Create all Spa tables
- Add indexes for common queries
- Add foreign key relationships"
```

---

## Part 2: Spa GraphQL Types

### Task 2.1: Create Spa Types File

**Files:**
- Create: `/apps/api/src/graphql/spa/spa.types.ts`

**Step 1: Create the types file**

```typescript
import { Field, ID, ObjectType, Int, registerEnumType } from '@nestjs/graphql';

// ─────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────

export enum SpaServiceCategoryEnum {
  MASSAGE = 'MASSAGE',
  FACIAL = 'FACIAL',
  BODY_TREATMENT = 'BODY_TREATMENT',
  NAIL = 'NAIL',
  HAIR = 'HAIR',
  WELLNESS = 'WELLNESS',
  PACKAGE = 'PACKAGE',
}

export enum SpaAppointmentStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CHECKED_IN = 'CHECKED_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum SpaRoomType {
  TREATMENT_ROOM = 'TREATMENT_ROOM',
  MASSAGE_ROOM = 'MASSAGE_ROOM',
  FACIAL_ROOM = 'FACIAL_ROOM',
  NAIL_STATION = 'NAIL_STATION',
  HAIR_STATION = 'HAIR_STATION',
  SAUNA = 'SAUNA',
  STEAM_ROOM = 'STEAM_ROOM',
  RELAXATION_LOUNGE = 'RELAXATION_LOUNGE',
}

export enum SpaResourceStatus {
  AVAILABLE = 'AVAILABLE',
  IN_USE = 'IN_USE',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE',
}

export enum SpaPackageStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  FULLY_REDEEMED = 'FULLY_REDEEMED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(SpaServiceCategoryEnum, {
  name: 'SpaServiceCategoryEnum',
  description: 'Spa service category types',
});

registerEnumType(SpaAppointmentStatus, {
  name: 'SpaAppointmentStatus',
  description: 'Spa appointment status',
});

registerEnumType(SpaRoomType, {
  name: 'SpaRoomType',
  description: 'Spa room types',
});

registerEnumType(SpaResourceStatus, {
  name: 'SpaResourceStatus',
  description: 'Spa resource availability status',
});

registerEnumType(SpaPackageStatus, {
  name: 'SpaPackageStatus',
  description: 'Spa package purchase status',
});

// ─────────────────────────────────────────────────────────────
// SERVICE TYPES
// ─────────────────────────────────────────────────────────────

@ObjectType()
export class SpaServiceCategoryType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  isActive: boolean;

  @Field(() => Int, { nullable: true })
  serviceCount?: number;
}

@ObjectType()
export class SpaServiceType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  categoryId: string;

  @Field(() => SpaServiceCategoryType, { nullable: true })
  category?: SpaServiceCategoryType;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  durationMinutes: number;

  @Field(() => Int)
  bufferMinutes: number;

  @Field()
  price: number;

  @Field({ nullable: true })
  memberPrice?: number;

  @Field()
  taxRate: number;

  @Field(() => [String])
  requiredRoomTypes: string[];

  @Field(() => [String])
  requiredSkills: string[];

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  isOnlineBookable: boolean;

  @Field(() => Int)
  advanceBookingDays: number;

  @Field(() => Int)
  cancellationHours: number;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  isActive: boolean;

  @Field(() => [SpaStaffType], { nullable: true })
  availableStaff?: SpaStaffType[];
}

// ─────────────────────────────────────────────────────────────
// STAFF TYPES
// ─────────────────────────────────────────────────────────────

@ObjectType()
export class SpaStaffType {
  @Field(() => ID)
  id: string;

  @Field()
  displayName: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  avatarUrl?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field()
  isOnlineBookable: boolean;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  isActive: boolean;

  @Field(() => [SpaServiceType], { nullable: true })
  services?: SpaServiceType[];
}

@ObjectType()
export class SpaStaffScheduleType {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  dayOfWeek: number;

  @Field()
  startTime: string;

  @Field()
  endTime: string;

  @Field()
  isWorkingDay: boolean;
}

@ObjectType()
export class SpaStaffAvailabilityType {
  @Field(() => ID)
  staffId: string;

  @Field()
  staffName: string;

  @Field()
  date: string;

  @Field(() => [String])
  availableSlots: string[]; // Array of HH:MM time slots
}

// ─────────────────────────────────────────────────────────────
// ROOM TYPES
// ─────────────────────────────────────────────────────────────

@ObjectType()
export class SpaRoomType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  code: string;

  @Field(() => SpaRoomType)
  roomType: SpaRoomType;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  capacity: number;

  @Field(() => [String])
  amenities: string[];

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => SpaResourceStatus)
  status: SpaResourceStatus;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  isActive: boolean;
}

// ─────────────────────────────────────────────────────────────
// APPOINTMENT TYPES
// ─────────────────────────────────────────────────────────────

@ObjectType()
export class SpaAppointmentType {
  @Field(() => ID)
  id: string;

  @Field()
  appointmentNumber: string;

  @Field(() => SpaServiceType)
  service: SpaServiceType;

  @Field(() => ID, { nullable: true })
  memberId?: string;

  @Field({ nullable: true })
  memberName?: string;

  @Field({ nullable: true })
  memberNumber?: string;

  @Field({ nullable: true })
  guestName?: string;

  @Field({ nullable: true })
  guestEmail?: string;

  @Field({ nullable: true })
  guestPhone?: string;

  @Field(() => SpaStaffType)
  staff: SpaStaffType;

  @Field(() => SpaRoomType, { nullable: true })
  room?: SpaRoomType;

  @Field()
  appointmentDate: Date;

  @Field()
  startTime: string;

  @Field()
  endTime: string;

  @Field(() => Int)
  durationMinutes: number;

  @Field(() => SpaAppointmentStatus)
  status: SpaAppointmentStatus;

  @Field()
  totalAmount: number;

  @Field()
  isPaid: boolean;

  @Field({ nullable: true })
  paidAt?: Date;

  @Field()
  bookedOnline: boolean;

  @Field({ nullable: true })
  specialRequests?: string;

  @Field({ nullable: true })
  packageRedemptionId?: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class SpaAppointmentSlotType {
  @Field()
  time: string; // HH:MM

  @Field()
  available: boolean;

  @Field(() => [SpaStaffType], { nullable: true })
  availableStaff?: SpaStaffType[];

  @Field(() => [SpaRoomType], { nullable: true })
  availableRooms?: SpaRoomType[];
}

@ObjectType()
export class SpaAppointmentDayType {
  @Field()
  date: string; // YYYY-MM-DD

  @Field(() => [SpaAppointmentSlotType])
  slots: SpaAppointmentSlotType[];
}

// ─────────────────────────────────────────────────────────────
// PACKAGE TYPES
// ─────────────────────────────────────────────────────────────

@ObjectType()
export class SpaPackageServiceType {
  @Field(() => ID)
  serviceId: string;

  @Field()
  serviceName: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Int)
  remainingQuantity: number;
}

@ObjectType()
export class SpaPackageType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  price: number;

  @Field({ nullable: true })
  memberPrice?: number;

  @Field(() => Int)
  validityDays: number;

  @Field()
  isTransferable: boolean;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  isActive: boolean;

  @Field(() => [SpaPackageServiceType])
  includedServices: SpaPackageServiceType[];
}

@ObjectType()
export class SpaPackagePurchaseType {
  @Field(() => ID)
  id: string;

  @Field()
  purchaseNumber: string;

  @Field(() => SpaPackageType)
  package: SpaPackageType;

  @Field(() => ID)
  memberId: string;

  @Field({ nullable: true })
  memberName?: string;

  @Field()
  purchaseDate: Date;

  @Field()
  expiryDate: Date;

  @Field()
  totalAmount: number;

  @Field(() => SpaPackageStatus)
  status: SpaPackageStatus;

  @Field()
  isPaid: boolean;

  @Field(() => [SpaPackageServiceType])
  servicesRemaining: SpaPackageServiceType[];

  @Field(() => Int)
  totalRedemptions: number;
}

// ─────────────────────────────────────────────────────────────
// CHECKOUT TYPES
// ─────────────────────────────────────────────────────────────

@ObjectType()
export class SpaCheckoutLineItemType {
  @Field(() => ID)
  id: string;

  @Field()
  type: string; // 'SERVICE' | 'PRODUCT' | 'PACKAGE'

  @Field()
  description: string;

  @Field(() => Int)
  quantity: number;

  @Field()
  unitPrice: number;

  @Field()
  taxAmount: number;

  @Field()
  totalAmount: number;

  @Field()
  isPaid: boolean;
}

@ObjectType()
export class SpaCheckoutType {
  @Field(() => ID)
  appointmentId: string;

  @Field({ nullable: true })
  memberName?: string;

  @Field({ nullable: true })
  guestName?: string;

  @Field(() => [SpaCheckoutLineItemType])
  lineItems: SpaCheckoutLineItemType[];

  @Field()
  subtotal: number;

  @Field()
  taxTotal: number;

  @Field()
  grandTotal: number;

  @Field()
  paidAmount: number;

  @Field()
  balanceDue: number;
}

// ─────────────────────────────────────────────────────────────
// MUTATION RESPONSE TYPES
// ─────────────────────────────────────────────────────────────

@ObjectType()
export class SpaBookingResultType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field(() => SpaAppointmentType, { nullable: true })
  appointment?: SpaAppointmentType;

  @Field({ nullable: true })
  confirmationNumber?: string;
}

@ObjectType()
export class SpaPaymentResultType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  transactionId?: string;

  @Field()
  amountPaid: number;

  @Field()
  remainingBalance: number;
}

@ObjectType()
export class SpaPackageRedemptionResultType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field(() => SpaAppointmentType, { nullable: true })
  appointment?: SpaAppointmentType;

  @Field(() => Int, { nullable: true })
  remainingUses?: number;
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/spa/
git commit -m "feat(api): add Spa GraphQL types

- Add service, staff, room types
- Add appointment and slot types
- Add package and redemption types
- Add checkout and payment result types
- Register all enums for GraphQL"
```

---

### Task 2.2: Create Spa Input Types

**Files:**
- Create: `/apps/api/src/graphql/spa/spa.input.ts`

**Step 1: Create the input file**

```typescript
import { Field, ID, InputType, Int, ArgsType } from '@nestjs/graphql';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  IsUUID,
  IsEmail,
  Min,
  Max,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SpaAppointmentStatus, SpaRoomType, SpaResourceStatus, SpaPackageStatus } from './spa.types';

// ─────────────────────────────────────────────────────────────
// SERVICE INPUTS
// ─────────────────────────────────────────────────────────────

@InputType()
export class CreateSpaServiceCategoryInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

@InputType()
export class CreateSpaServiceInput {
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

  @Field(() => Int)
  @IsNumber()
  @Min(15)
  @Max(480)
  durationMinutes: number;

  @Field(() => Int, { nullable: true, defaultValue: 15 })
  @IsOptional()
  @IsNumber()
  bufferMinutes?: number;

  @Field()
  @IsNumber()
  @Min(0)
  price: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  memberPrice?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  requiredRoomTypes?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  requiredSkills?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isOnlineBookable?: boolean;

  @Field(() => Int, { nullable: true, defaultValue: 30 })
  @IsOptional()
  @IsNumber()
  advanceBookingDays?: number;

  @Field(() => Int, { nullable: true, defaultValue: 24 })
  @IsOptional()
  @IsNumber()
  cancellationHours?: number;
}

@InputType()
export class UpdateSpaServiceInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  price?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  memberPrice?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isOnlineBookable?: boolean;
}

// ─────────────────────────────────────────────────────────────
// STAFF INPUTS
// ─────────────────────────────────────────────────────────────

@InputType()
export class CreateSpaStaffInput {
  @Field()
  @IsString()
  displayName: string;

  @Field()
  @IsString()
  firstName: string;

  @Field()
  @IsString()
  lastName: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bio?: string;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  @IsArray()
  serviceIds?: string[];

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isOnlineBookable?: boolean;
}

@InputType()
export class SpaStaffScheduleInput {
  @Field(() => Int)
  @IsNumber()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @Field()
  @IsString()
  startTime: string;

  @Field()
  @IsString()
  endTime: string;

  @Field({ defaultValue: true })
  @IsBoolean()
  isWorkingDay: boolean;
}

@InputType()
export class UpdateSpaStaffScheduleInput {
  @Field(() => ID)
  @IsUUID()
  staffId: string;

  @Field(() => [SpaStaffScheduleInput])
  @IsArray()
  schedule: SpaStaffScheduleInput[];
}

// ─────────────────────────────────────────────────────────────
// ROOM INPUTS
// ─────────────────────────────────────────────────────────────

@InputType()
export class CreateSpaRoomInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  code: string;

  @Field(() => String)
  @IsString()
  roomType: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  amenities?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

@InputType()
export class UpdateSpaRoomStatusInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => SpaResourceStatus)
  @IsEnum(SpaResourceStatus)
  status: SpaResourceStatus;
}

// ─────────────────────────────────────────────────────────────
// APPOINTMENT INPUTS
// ─────────────────────────────────────────────────────────────

@InputType()
export class CreateSpaAppointmentInput {
  @Field(() => ID)
  @IsUUID()
  serviceId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  guestName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  guestEmail?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  guestPhone?: string;

  @Field(() => ID)
  @IsUUID()
  staffId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @Field()
  @IsDate()
  @Type(() => Date)
  appointmentDate: Date;

  @Field()
  @IsString()
  startTime: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  specialRequests?: string;

  @Field(() => ID, { nullable: true, description: 'Package purchase ID for redemption' })
  @IsOptional()
  @IsUUID()
  packagePurchaseId?: string;
}

@InputType()
export class UpdateSpaAppointmentInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  staffId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  appointmentDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  startTime?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  specialRequests?: string;
}

@InputType()
export class CancelSpaAppointmentInput {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field()
  @IsString()
  reason: string;
}

@InputType()
export class CheckInSpaAppointmentInput {
  @Field(() => ID)
  @IsUUID()
  id: string;
}

// ─────────────────────────────────────────────────────────────
// AVAILABILITY QUERY INPUTS
// ─────────────────────────────────────────────────────────────

@ArgsType()
export class SpaAvailabilityArgs {
  @Field(() => ID)
  @IsUUID()
  serviceId: string;

  @Field()
  @IsDate()
  @Type(() => Date)
  date: Date;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  preferredStaffId?: string;
}

@ArgsType()
export class SpaAppointmentsQueryArgs {
  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  staffId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field(() => SpaAppointmentStatus, { nullable: true })
  @IsOptional()
  @IsEnum(SpaAppointmentStatus)
  status?: SpaAppointmentStatus;

  @Field(() => Int, { nullable: true, defaultValue: 50 })
  @IsOptional()
  @IsNumber()
  limit?: number;
}

// ─────────────────────────────────────────────────────────────
// PACKAGE INPUTS
// ─────────────────────────────────────────────────────────────

@InputType()
export class SpaPackageServiceInput {
  @Field(() => ID)
  @IsUUID()
  serviceId: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  quantity: number;
}

@InputType()
export class CreateSpaPackageInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsNumber()
  @Min(0)
  price: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  memberPrice?: number;

  @Field(() => Int, { nullable: true, defaultValue: 365 })
  @IsOptional()
  @IsNumber()
  validityDays?: number;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isTransferable?: boolean;

  @Field(() => [SpaPackageServiceInput])
  @IsArray()
  services: SpaPackageServiceInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

@InputType()
export class PurchaseSpaPackageInput {
  @Field(() => ID)
  @IsUUID()
  packageId: string;

  @Field(() => ID)
  @IsUUID()
  memberId: string;

  @Field(() => ID)
  @IsUUID()
  paymentMethodId: string;
}

// ─────────────────────────────────────────────────────────────
// CHECKOUT INPUTS
// ─────────────────────────────────────────────────────────────

@InputType()
export class AddSpaRetailItemInput {
  @Field(() => ID)
  @IsUUID()
  appointmentId: string;

  @Field(() => ID)
  @IsUUID()
  productId: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;
}

@InputType()
export class SpaCheckoutPaymentInput {
  @Field(() => ID)
  @IsUUID()
  appointmentId: string;

  @Field(() => ID)
  @IsUUID()
  paymentMethodId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number; // If not provided, pay full balance

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reference?: string;
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/spa/spa.input.ts
git commit -m "feat(api): add Spa GraphQL inputs

- Add service and category inputs
- Add staff and schedule inputs
- Add room and resource inputs
- Add appointment booking inputs
- Add availability query args
- Add package and purchase inputs
- Add checkout and payment inputs"
```

---

### Task 2.3: Create Spa Service Layer

**Files:**
- Create: `/apps/api/src/graphql/spa/spa.service.ts`

**Step 1: Create the service file**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { TaxService } from '@/shared/tax/tax.service';
import { Prisma, SpaAppointmentStatus, TaxType } from '@prisma/client';
import {
  CreateSpaServiceInput,
  CreateSpaServiceCategoryInput,
  CreateSpaStaffInput,
  CreateSpaRoomInput,
  CreateSpaAppointmentInput,
  CreateSpaPackageInput,
  SpaAvailabilityArgs,
} from './spa.input';

@Injectable()
export class SpaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly taxService: TaxService,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // SERVICE CATEGORIES
  // ─────────────────────────────────────────────────────────────

  async getServiceCategories(clubId: string, activeOnly = true) {
    const where: Prisma.SpaServiceCategoryWhereInput = { clubId };
    if (activeOnly) where.isActive = true;

    return this.prisma.spaServiceCategory.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { services: true } },
      },
    });
  }

  async createServiceCategory(clubId: string, input: CreateSpaServiceCategoryInput) {
    return this.prisma.spaServiceCategory.create({
      data: {
        clubId,
        ...input,
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // SERVICES
  // ─────────────────────────────────────────────────────────────

  async getServices(clubId: string, categoryId?: string, activeOnly = true) {
    const where: Prisma.SpaServiceWhereInput = { clubId };
    if (categoryId) where.categoryId = categoryId;
    if (activeOnly) where.isActive = true;

    return this.prisma.spaService.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        category: true,
        staffServices: {
          include: { staff: true },
          where: { staff: { isActive: true } },
        },
      },
    });
  }

  async getService(id: string) {
    return this.prisma.spaService.findUnique({
      where: { id },
      include: {
        category: true,
        staffServices: {
          include: { staff: true },
        },
      },
    });
  }

  async createService(clubId: string, input: CreateSpaServiceInput) {
    return this.prisma.spaService.create({
      data: {
        clubId,
        ...input,
      },
      include: { category: true },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // STAFF
  // ─────────────────────────────────────────────────────────────

  async getStaff(clubId: string, activeOnly = true) {
    const where: Prisma.SpaStaffWhereInput = { clubId };
    if (activeOnly) where.isActive = true;

    return this.prisma.spaStaff.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { displayName: 'asc' }],
      include: {
        services: { include: { service: true } },
        schedules: true,
      },
    });
  }

  async getStaffMember(id: string) {
    return this.prisma.spaStaff.findUnique({
      where: { id },
      include: {
        services: { include: { service: true } },
        schedules: { orderBy: { dayOfWeek: 'asc' } },
      },
    });
  }

  async createStaff(clubId: string, input: CreateSpaStaffInput) {
    const { serviceIds, ...staffData } = input;

    return this.prisma.spaStaff.create({
      data: {
        clubId,
        ...staffData,
        services: serviceIds
          ? {
              create: serviceIds.map((serviceId) => ({
                serviceId,
                skillLevel: 'INTERMEDIATE',
              })),
            }
          : undefined,
      },
      include: {
        services: { include: { service: true } },
      },
    });
  }

  async updateStaffSchedule(staffId: string, schedule: Array<{ dayOfWeek: number; startTime: string; endTime: string; isWorkingDay: boolean }>) {
    // Delete existing schedules and create new ones
    await this.prisma.spaStaffSchedule.deleteMany({
      where: { staffId },
    });

    await this.prisma.spaStaffSchedule.createMany({
      data: schedule.map((s) => ({
        staffId,
        ...s,
      })),
    });

    return this.getStaffMember(staffId);
  }

  // ─────────────────────────────────────────────────────────────
  // ROOMS
  // ─────────────────────────────────────────────────────────────

  async getRooms(clubId: string, roomType?: string, activeOnly = true) {
    const where: Prisma.SpaRoomWhereInput = { clubId };
    if (roomType) where.roomType = roomType as any;
    if (activeOnly) where.isActive = true;

    return this.prisma.spaRoom.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  async createRoom(clubId: string, input: CreateSpaRoomInput) {
    return this.prisma.spaRoom.create({
      data: {
        clubId,
        ...input,
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // AVAILABILITY
  // ─────────────────────────────────────────────────────────────

  async getAvailability(clubId: string, args: SpaAvailabilityArgs) {
    const service = await this.prisma.spaService.findUnique({
      where: { id: args.serviceId },
      include: {
        staffServices: {
          include: {
            staff: {
              include: { schedules: true },
            },
          },
          where: {
            staff: { isActive: true, isOnlineBookable: true },
          },
        },
      },
    });

    if (!service) {
      return { date: args.date.toISOString().split('T')[0], slots: [] };
    }

    const dateStr = args.date.toISOString().split('T')[0];
    const dayOfWeek = args.date.getDay();

    // Get existing appointments for this date
    const existingAppointments = await this.prisma.spaAppointment.findMany({
      where: {
        clubId,
        appointmentDate: args.date,
        status: { notIn: ['CANCELLED', 'NO_SHOW'] },
      },
    });

    // Build available slots based on staff schedules
    const slots: Array<{ time: string; available: boolean; availableStaff: any[] }> = [];

    // Generate time slots (every 30 minutes from 9 AM to 6 PM)
    for (let hour = 9; hour < 18; hour++) {
      for (const minute of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const availableStaff: any[] = [];

        for (const staffService of service.staffServices) {
          const staff = staffService.staff;
          const schedule = staff.schedules.find((s) => s.dayOfWeek === dayOfWeek);

          if (!schedule || !schedule.isWorkingDay) continue;
          if (time < schedule.startTime || time >= schedule.endTime) continue;

          // Check if staff has conflicting appointment
          const hasConflict = existingAppointments.some((apt) => {
            if (apt.staffId !== staff.id) return false;
            // Simple overlap check
            return apt.startTime <= time && apt.endTime > time;
          });

          if (!hasConflict) {
            availableStaff.push(staff);
          }
        }

        slots.push({
          time,
          available: availableStaff.length > 0,
          availableStaff,
        });
      }
    }

    return { date: dateStr, slots };
  }

  // ─────────────────────────────────────────────────────────────
  // APPOINTMENTS
  // ─────────────────────────────────────────────────────────────

  async getAppointments(clubId: string, filters: {
    startDate?: Date;
    endDate?: Date;
    staffId?: string;
    memberId?: string;
    status?: SpaAppointmentStatus;
    limit?: number;
  }) {
    const where: Prisma.SpaAppointmentWhereInput = { clubId };

    if (filters.startDate) {
      where.appointmentDate = { gte: filters.startDate };
    }
    if (filters.endDate) {
      where.appointmentDate = { ...where.appointmentDate as any, lte: filters.endDate };
    }
    if (filters.staffId) where.staffId = filters.staffId;
    if (filters.memberId) where.memberId = filters.memberId;
    if (filters.status) where.status = filters.status;

    return this.prisma.spaAppointment.findMany({
      where,
      take: filters.limit || 50,
      orderBy: [{ appointmentDate: 'asc' }, { startTime: 'asc' }],
      include: {
        service: { include: { category: true } },
        staff: true,
        room: true,
        member: true,
      },
    });
  }

  async getAppointment(id: string) {
    return this.prisma.spaAppointment.findUnique({
      where: { id },
      include: {
        service: { include: { category: true } },
        staff: true,
        room: true,
        member: true,
        lineItems: true,
        reminders: true,
      },
    });
  }

  async createAppointment(clubId: string, input: CreateSpaAppointmentInput, bookedBy?: string) {
    const service = await this.prisma.spaService.findUnique({
      where: { id: input.serviceId },
    });

    if (!service) {
      return { success: false, error: 'Service not found' };
    }

    // Calculate end time
    const [hours, minutes] = input.startTime.split(':').map(Number);
    const endMinutes = hours * 60 + minutes + service.durationMinutes;
    const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;

    // Calculate pricing
    const isMember = !!input.memberId;
    const price = isMember && service.memberPrice ? Number(service.memberPrice) : Number(service.price);
    const taxAmount = this.taxService.calculateTax(price, service.taxType as TaxType, Number(service.taxRate));
    const totalAmount = service.taxType === 'INCLUDE' ? price : price + taxAmount;

    // Generate appointment number
    const appointmentNumber = `SPA-${Date.now().toString(36).toUpperCase()}`;

    const appointment = await this.prisma.spaAppointment.create({
      data: {
        clubId,
        appointmentNumber,
        serviceId: input.serviceId,
        memberId: input.memberId,
        guestName: input.guestName,
        guestEmail: input.guestEmail,
        guestPhone: input.guestPhone,
        staffId: input.staffId,
        roomId: input.roomId,
        appointmentDate: input.appointmentDate,
        startTime: input.startTime,
        endTime,
        durationMinutes: service.durationMinutes,
        originalPrice: price,
        finalPrice: price,
        taxType: service.taxType,
        taxRate: service.taxRate,
        taxAmount,
        totalAmount,
        bookedOnline: !bookedBy,
        bookedBy,
        specialRequests: input.specialRequests,
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
      include: {
        service: { include: { category: true } },
        staff: true,
        room: true,
        member: true,
      },
    });

    // Create service line item
    await this.prisma.spaAppointmentLineItem.create({
      data: {
        appointmentId: appointment.id,
        type: 'SERVICE',
        description: service.name,
        quantity: 1,
        unitPrice: price,
        taxType: service.taxType,
        taxRate: service.taxRate,
        taxAmount,
        totalAmount,
      },
    });

    return {
      success: true,
      appointment,
      confirmationNumber: appointmentNumber,
    };
  }

  async cancelAppointment(id: string, reason: string, cancelledBy: string) {
    const appointment = await this.prisma.spaAppointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelledBy,
        cancelReason: reason,
      },
    });

    // Cancel any pending reminders
    await this.prisma.spaAppointmentReminder.updateMany({
      where: {
        appointmentId: id,
        status: 'PENDING',
      },
      data: {
        status: 'CANCELLED',
      },
    });

    return { success: true, appointment };
  }

  async checkInAppointment(id: string) {
    const appointment = await this.prisma.spaAppointment.update({
      where: { id },
      data: {
        status: 'CHECKED_IN',
        checkedInAt: new Date(),
      },
      include: {
        service: true,
        staff: true,
        member: true,
      },
    });

    return { success: true, appointment };
  }

  async completeAppointment(id: string) {
    const appointment = await this.prisma.spaAppointment.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return { success: true, appointment };
  }

  // ─────────────────────────────────────────────────────────────
  // PACKAGES
  // ─────────────────────────────────────────────────────────────

  async getPackages(clubId: string, activeOnly = true) {
    const where: Prisma.SpaPackageWhereInput = { clubId };
    if (activeOnly) where.isActive = true;

    return this.prisma.spaPackage.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        services: {
          include: { service: true },
        },
      },
    });
  }

  async createPackage(clubId: string, input: CreateSpaPackageInput) {
    const { services, ...packageData } = input;

    return this.prisma.spaPackage.create({
      data: {
        clubId,
        ...packageData,
        services: {
          create: services.map((s) => ({
            serviceId: s.serviceId,
            quantity: s.quantity,
          })),
        },
      },
      include: {
        services: { include: { service: true } },
      },
    });
  }

  async getMemberPackages(memberId: string, activeOnly = true) {
    const where: Prisma.SpaPackagePurchaseWhereInput = { memberId };
    if (activeOnly) {
      where.status = 'ACTIVE';
      where.expiryDate = { gte: new Date() };
    }

    return this.prisma.spaPackagePurchase.findMany({
      where,
      include: {
        package: {
          include: {
            services: { include: { service: true } },
          },
        },
        redemptions: true,
      },
    });
  }

  async purchasePackage(clubId: string, packageId: string, memberId: string, paymentMethodId: string) {
    const pkg = await this.prisma.spaPackage.findUnique({
      where: { id: packageId },
    });

    if (!pkg) {
      return { success: false, error: 'Package not found' };
    }

    const price = Number(pkg.memberPrice || pkg.price);
    const taxAmount = this.taxService.calculateTax(price, pkg.taxType as TaxType, Number(pkg.taxRate));
    const totalAmount = pkg.taxType === 'INCLUDE' ? price : price + taxAmount;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + pkg.validityDays);

    const purchaseNumber = `PKG-${Date.now().toString(36).toUpperCase()}`;

    const purchase = await this.prisma.spaPackagePurchase.create({
      data: {
        clubId,
        packageId,
        memberId,
        purchaseNumber,
        expiryDate,
        purchasePrice: price,
        taxAmount,
        totalAmount,
        isPaid: true,
        paidAt: new Date(),
        paymentMethodId,
      },
      include: {
        package: {
          include: {
            services: { include: { service: true } },
          },
        },
      },
    });

    return { success: true, purchase };
  }

  // ─────────────────────────────────────────────────────────────
  // CHECKOUT
  // ─────────────────────────────────────────────────────────────

  async getCheckout(appointmentId: string) {
    const appointment = await this.prisma.spaAppointment.findUnique({
      where: { id: appointmentId },
      include: {
        member: true,
        lineItems: true,
      },
    });

    if (!appointment) {
      return null;
    }

    const lineItems = appointment.lineItems.map((item) => ({
      id: item.id,
      type: item.type,
      description: item.description,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      taxAmount: Number(item.taxAmount),
      totalAmount: Number(item.totalAmount),
      isPaid: item.isPaid,
    }));

    const subtotal = lineItems.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);
    const taxTotal = lineItems.reduce((sum, item) => sum + Number(item.taxAmount), 0);
    const grandTotal = lineItems.reduce((sum, item) => sum + Number(item.totalAmount), 0);
    const paidAmount = lineItems.filter((i) => i.isPaid).reduce((sum, item) => sum + Number(item.totalAmount), 0);

    return {
      appointmentId,
      memberName: appointment.member ? `${appointment.member.firstName} ${appointment.member.lastName}` : undefined,
      guestName: appointment.guestName,
      lineItems,
      subtotal,
      taxTotal,
      grandTotal,
      paidAmount,
      balanceDue: grandTotal - paidAmount,
    };
  }

  async addRetailItem(appointmentId: string, productId: string, quantity: number) {
    const product = await this.prisma.spaProduct.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    const unitPrice = Number(product.price);
    const taxAmount = this.taxService.calculateTax(unitPrice * quantity, product.taxType as TaxType, Number(product.taxRate));
    const totalAmount = product.taxType === 'INCLUDE' ? unitPrice * quantity : unitPrice * quantity + taxAmount;

    const lineItem = await this.prisma.spaAppointmentLineItem.create({
      data: {
        appointmentId,
        type: 'PROSHOP',
        description: product.name,
        productId,
        quantity,
        unitPrice,
        taxType: product.taxType,
        taxRate: product.taxRate,
        taxAmount,
        totalAmount,
      },
    });

    return { success: true, lineItem };
  }

  async processPayment(appointmentId: string, paymentMethodId: string, amount?: number) {
    const appointment = await this.prisma.spaAppointment.findUnique({
      where: { id: appointmentId },
      include: { lineItems: { where: { isPaid: false } } },
    });

    if (!appointment) {
      return { success: false, error: 'Appointment not found' };
    }

    const unpaidTotal = appointment.lineItems.reduce((sum, item) => sum + Number(item.totalAmount), 0);
    const paymentAmount = amount ?? unpaidTotal;

    if (paymentAmount > unpaidTotal) {
      return { success: false, error: 'Payment amount exceeds balance due' };
    }

    // Mark line items as paid
    let remainingPayment = paymentAmount;
    for (const item of appointment.lineItems) {
      if (remainingPayment <= 0) break;

      const itemAmount = Number(item.totalAmount);
      if (remainingPayment >= itemAmount) {
        await this.prisma.spaAppointmentLineItem.update({
          where: { id: item.id },
          data: { isPaid: true, paidAt: new Date() },
        });
        remainingPayment -= itemAmount;
      }
    }

    // Check if fully paid
    const remainingItems = await this.prisma.spaAppointmentLineItem.count({
      where: { appointmentId, isPaid: false },
    });

    if (remainingItems === 0) {
      await this.prisma.spaAppointment.update({
        where: { id: appointmentId },
        data: {
          isPaid: true,
          paidAt: new Date(),
          paymentMethodId,
        },
      });
    }

    return {
      success: true,
      transactionId: `TXN-${Date.now()}`,
      amountPaid: paymentAmount,
      remainingBalance: unpaidTotal - paymentAmount,
    };
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/spa/spa.service.ts
git commit -m "feat(api): add SpaService

- Add service category and service management
- Add staff management with schedules
- Add room management
- Add availability calculation
- Add appointment CRUD operations
- Add package management and purchase
- Add checkout with retail items
- Add payment processing"
```

---

I'll continue with the remaining tasks in a follow-up message due to length. The plan continues with:

- Task 2.4: Create Spa Resolver
- Task 2.5: Create Spa Module
- Part 3: GraphQL Operations and API Client
- Part 4: React Components (Service Menu, Booking Calendar, Staff Schedule, Package Manager, Checkout)
- Part 5: Reminder Service Integration
- Part 6: Testing and Final Tasks

---

### Task 2.4: Create Spa Resolver

**Files:**
- Create: `/apps/api/src/graphql/spa/spa.resolver.ts`

**Step 1: Create the resolver file**

```typescript
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '@/auth/gql-auth.guard';
import { GqlCurrentUser } from '@/auth/gql-current-user.decorator';
import { SpaService } from './spa.service';
import {
  SpaServiceCategoryType,
  SpaServiceType,
  SpaStaffType,
  SpaRoomType,
  SpaAppointmentType,
  SpaAppointmentDayType,
  SpaPackageType,
  SpaPackagePurchaseType,
  SpaCheckoutType,
  SpaBookingResultType,
  SpaPaymentResultType,
} from './spa.types';
import {
  CreateSpaServiceCategoryInput,
  CreateSpaServiceInput,
  UpdateSpaServiceInput,
  CreateSpaStaffInput,
  UpdateSpaStaffScheduleInput,
  CreateSpaRoomInput,
  CreateSpaAppointmentInput,
  UpdateSpaAppointmentInput,
  CancelSpaAppointmentInput,
  CheckInSpaAppointmentInput,
  CreateSpaPackageInput,
  PurchaseSpaPackageInput,
  AddSpaRetailItemInput,
  SpaCheckoutPaymentInput,
  SpaAvailabilityArgs,
  SpaAppointmentsQueryArgs,
} from './spa.input';

interface CurrentUser {
  id: string;
  clubId: string;
}

@Resolver()
@UseGuards(GqlAuthGuard)
export class SpaResolver {
  constructor(private readonly spaService: SpaService) {}

  // ─────────────────────────────────────────────────────────────
  // SERVICE QUERIES
  // ─────────────────────────────────────────────────────────────

  @Query(() => [SpaServiceCategoryType])
  async spaServiceCategories(
    @GqlCurrentUser() user: CurrentUser,
    @Args('activeOnly', { nullable: true, defaultValue: true }) activeOnly: boolean,
  ) {
    return this.spaService.getServiceCategories(user.clubId, activeOnly);
  }

  @Query(() => [SpaServiceType])
  async spaServices(
    @GqlCurrentUser() user: CurrentUser,
    @Args('categoryId', { type: () => ID, nullable: true }) categoryId?: string,
    @Args('activeOnly', { nullable: true, defaultValue: true }) activeOnly?: boolean,
  ) {
    return this.spaService.getServices(user.clubId, categoryId, activeOnly);
  }

  @Query(() => SpaServiceType, { nullable: true })
  async spaService(@Args('id', { type: () => ID }) id: string) {
    return this.spaService.getService(id);
  }

  // ─────────────────────────────────────────────────────────────
  // STAFF QUERIES
  // ─────────────────────────────────────────────────────────────

  @Query(() => [SpaStaffType])
  async spaStaff(
    @GqlCurrentUser() user: CurrentUser,
    @Args('activeOnly', { nullable: true, defaultValue: true }) activeOnly: boolean,
  ) {
    return this.spaService.getStaff(user.clubId, activeOnly);
  }

  @Query(() => SpaStaffType, { nullable: true })
  async spaStaffMember(@Args('id', { type: () => ID }) id: string) {
    return this.spaService.getStaffMember(id);
  }

  // ─────────────────────────────────────────────────────────────
  // ROOM QUERIES
  // ─────────────────────────────────────────────────────────────

  @Query(() => [SpaRoomType])
  async spaRooms(
    @GqlCurrentUser() user: CurrentUser,
    @Args('roomType', { nullable: true }) roomType?: string,
    @Args('activeOnly', { nullable: true, defaultValue: true }) activeOnly?: boolean,
  ) {
    return this.spaService.getRooms(user.clubId, roomType, activeOnly);
  }

  // ─────────────────────────────────────────────────────────────
  // AVAILABILITY QUERIES
  // ─────────────────────────────────────────────────────────────

  @Query(() => SpaAppointmentDayType)
  async spaAvailability(
    @GqlCurrentUser() user: CurrentUser,
    @Args() args: SpaAvailabilityArgs,
  ) {
    return this.spaService.getAvailability(user.clubId, args);
  }

  // ─────────────────────────────────────────────────────────────
  // APPOINTMENT QUERIES
  // ─────────────────────────────────────────────────────────────

  @Query(() => [SpaAppointmentType])
  async spaAppointments(
    @GqlCurrentUser() user: CurrentUser,
    @Args() args: SpaAppointmentsQueryArgs,
  ) {
    return this.spaService.getAppointments(user.clubId, args);
  }

  @Query(() => SpaAppointmentType, { nullable: true })
  async spaAppointment(@Args('id', { type: () => ID }) id: string) {
    return this.spaService.getAppointment(id);
  }

  // ─────────────────────────────────────────────────────────────
  // PACKAGE QUERIES
  // ─────────────────────────────────────────────────────────────

  @Query(() => [SpaPackageType])
  async spaPackages(
    @GqlCurrentUser() user: CurrentUser,
    @Args('activeOnly', { nullable: true, defaultValue: true }) activeOnly: boolean,
  ) {
    return this.spaService.getPackages(user.clubId, activeOnly);
  }

  @Query(() => [SpaPackagePurchaseType])
  async memberSpaPackages(
    @Args('memberId', { type: () => ID }) memberId: string,
    @Args('activeOnly', { nullable: true, defaultValue: true }) activeOnly: boolean,
  ) {
    return this.spaService.getMemberPackages(memberId, activeOnly);
  }

  // ─────────────────────────────────────────────────────────────
  // CHECKOUT QUERIES
  // ─────────────────────────────────────────────────────────────

  @Query(() => SpaCheckoutType, { nullable: true })
  async spaCheckout(@Args('appointmentId', { type: () => ID }) appointmentId: string) {
    return this.spaService.getCheckout(appointmentId);
  }

  // ─────────────────────────────────────────────────────────────
  // SERVICE MUTATIONS
  // ─────────────────────────────────────────────────────────────

  @Mutation(() => SpaServiceCategoryType)
  async createSpaServiceCategory(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: CreateSpaServiceCategoryInput,
  ) {
    return this.spaService.createServiceCategory(user.clubId, input);
  }

  @Mutation(() => SpaServiceType)
  async createSpaService(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: CreateSpaServiceInput,
  ) {
    return this.spaService.createService(user.clubId, input);
  }

  // ─────────────────────────────────────────────────────────────
  // STAFF MUTATIONS
  // ─────────────────────────────────────────────────────────────

  @Mutation(() => SpaStaffType)
  async createSpaStaff(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: CreateSpaStaffInput,
  ) {
    return this.spaService.createStaff(user.clubId, input);
  }

  @Mutation(() => SpaStaffType)
  async updateSpaStaffSchedule(@Args('input') input: UpdateSpaStaffScheduleInput) {
    return this.spaService.updateStaffSchedule(input.staffId, input.schedule);
  }

  // ─────────────────────────────────────────────────────────────
  // ROOM MUTATIONS
  // ─────────────────────────────────────────────────────────────

  @Mutation(() => SpaRoomType)
  async createSpaRoom(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: CreateSpaRoomInput,
  ) {
    return this.spaService.createRoom(user.clubId, input);
  }

  // ─────────────────────────────────────────────────────────────
  // APPOINTMENT MUTATIONS
  // ─────────────────────────────────────────────────────────────

  @Mutation(() => SpaBookingResultType)
  async createSpaAppointment(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: CreateSpaAppointmentInput,
  ) {
    return this.spaService.createAppointment(user.clubId, input, user.id);
  }

  @Mutation(() => SpaBookingResultType)
  async cancelSpaAppointment(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: CancelSpaAppointmentInput,
  ) {
    return this.spaService.cancelAppointment(input.id, input.reason, user.id);
  }

  @Mutation(() => SpaBookingResultType)
  async checkInSpaAppointment(@Args('input') input: CheckInSpaAppointmentInput) {
    return this.spaService.checkInAppointment(input.id);
  }

  @Mutation(() => SpaBookingResultType)
  async completeSpaAppointment(@Args('id', { type: () => ID }) id: string) {
    return this.spaService.completeAppointment(id);
  }

  // ─────────────────────────────────────────────────────────────
  // PACKAGE MUTATIONS
  // ─────────────────────────────────────────────────────────────

  @Mutation(() => SpaPackageType)
  async createSpaPackage(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: CreateSpaPackageInput,
  ) {
    return this.spaService.createPackage(user.clubId, input);
  }

  @Mutation(() => SpaPackagePurchaseType)
  async purchaseSpaPackage(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: PurchaseSpaPackageInput,
  ) {
    const result = await this.spaService.purchasePackage(
      user.clubId,
      input.packageId,
      input.memberId,
      input.paymentMethodId,
    );
    if (!result.success) throw new Error(result.error);
    return result.purchase;
  }

  // ─────────────────────────────────────────────────────────────
  // CHECKOUT MUTATIONS
  // ─────────────────────────────────────────────────────────────

  @Mutation(() => Boolean)
  async addSpaRetailItem(@Args('input') input: AddSpaRetailItemInput) {
    const result = await this.spaService.addRetailItem(
      input.appointmentId,
      input.productId,
      input.quantity,
    );
    return result.success;
  }

  @Mutation(() => SpaPaymentResultType)
  async processSpaPayment(@Args('input') input: SpaCheckoutPaymentInput) {
    return this.spaService.processPayment(
      input.appointmentId,
      input.paymentMethodId,
      input.amount,
    );
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/spa/spa.resolver.ts
git commit -m "feat(api): add SpaResolver

- Add service and category queries/mutations
- Add staff queries and schedule mutations
- Add room queries/mutations
- Add availability query
- Add appointment CRUD mutations
- Add package queries and purchase mutation
- Add checkout and payment mutations"
```

---

### Task 2.5: Create Spa Module

**Files:**
- Create: `/apps/api/src/graphql/spa/spa.module.ts`
- Create: `/apps/api/src/graphql/spa/index.ts`

**Step 1: Create the module file**

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { TaxModule } from '@/shared/tax/tax.module';
import { SpaService } from './spa.service';
import { SpaResolver } from './spa.resolver';

@Module({
  imports: [PrismaModule, TaxModule],
  providers: [SpaService, SpaResolver],
  exports: [SpaService],
})
export class SpaGraphqlModule {}
```

**Step 2: Create index file**

```typescript
export * from './spa.module';
export * from './spa.service';
export * from './spa.resolver';
export * from './spa.types';
export * from './spa.input';
```

**Step 3: Register in GraphQL module**

Modify `/apps/api/src/graphql/graphql.module.ts`:

```typescript
import { SpaGraphqlModule } from './spa/spa.module';

@Module({
  imports: [
    // ... existing imports ...
    SpaGraphqlModule,
  ],
})
export class GraphqlModule {}
```

**Step 4: Commit**

```bash
git add apps/api/src/graphql/spa/
git commit -m "feat(api): add SpaGraphqlModule

- Create SpaGraphqlModule with service and resolver
- Export all spa types and inputs
- Register in main GraphQL module"
```

---

## Part 3: GraphQL Operations and API Client

### Task 3.1: Create Spa GraphQL Operations

**Files:**
- Create: `/packages/api-client/src/operations/spa.graphql`

**Step 1: Create the operations file**

```graphql
# ─────────────────────────────────────────────────────────────
# SERVICE QUERIES
# ─────────────────────────────────────────────────────────────

query GetSpaServiceCategories($activeOnly: Boolean) {
  spaServiceCategories(activeOnly: $activeOnly) {
    id
    name
    description
    sortOrder
    isActive
    serviceCount
  }
}

query GetSpaServices($categoryId: ID, $activeOnly: Boolean) {
  spaServices(categoryId: $categoryId, activeOnly: $activeOnly) {
    id
    categoryId
    category {
      id
      name
    }
    name
    description
    durationMinutes
    bufferMinutes
    price
    memberPrice
    taxRate
    requiredRoomTypes
    requiredSkills
    imageUrl
    isOnlineBookable
    advanceBookingDays
    cancellationHours
    sortOrder
    isActive
  }
}

query GetSpaService($id: ID!) {
  spaService(id: $id) {
    id
    name
    description
    durationMinutes
    price
    memberPrice
    isOnlineBookable
    availableStaff {
      id
      displayName
      avatarUrl
    }
  }
}

# ─────────────────────────────────────────────────────────────
# STAFF QUERIES
# ─────────────────────────────────────────────────────────────

query GetSpaStaff($activeOnly: Boolean) {
  spaStaff(activeOnly: $activeOnly) {
    id
    displayName
    firstName
    lastName
    email
    phone
    avatarUrl
    bio
    isOnlineBookable
    sortOrder
    isActive
  }
}

query GetSpaStaffMember($id: ID!) {
  spaStaffMember(id: $id) {
    id
    displayName
    firstName
    lastName
    avatarUrl
    bio
    services {
      id
      name
      durationMinutes
      price
    }
  }
}

# ─────────────────────────────────────────────────────────────
# ROOM QUERIES
# ─────────────────────────────────────────────────────────────

query GetSpaRooms($roomType: String, $activeOnly: Boolean) {
  spaRooms(roomType: $roomType, activeOnly: $activeOnly) {
    id
    name
    code
    roomType
    description
    capacity
    amenities
    status
    sortOrder
    isActive
  }
}

# ─────────────────────────────────────────────────────────────
# AVAILABILITY QUERIES
# ─────────────────────────────────────────────────────────────

query GetSpaAvailability($serviceId: ID!, $date: DateTime!, $preferredStaffId: ID) {
  spaAvailability(serviceId: $serviceId, date: $date, preferredStaffId: $preferredStaffId) {
    date
    slots {
      time
      available
      availableStaff {
        id
        displayName
        avatarUrl
      }
    }
  }
}

# ─────────────────────────────────────────────────────────────
# APPOINTMENT QUERIES
# ─────────────────────────────────────────────────────────────

query GetSpaAppointments(
  $startDate: DateTime
  $endDate: DateTime
  $staffId: ID
  $memberId: ID
  $status: SpaAppointmentStatus
  $limit: Int
) {
  spaAppointments(
    startDate: $startDate
    endDate: $endDate
    staffId: $staffId
    memberId: $memberId
    status: $status
    limit: $limit
  ) {
    id
    appointmentNumber
    service {
      id
      name
      durationMinutes
    }
    memberId
    memberName
    guestName
    staff {
      id
      displayName
    }
    room {
      id
      name
    }
    appointmentDate
    startTime
    endTime
    durationMinutes
    status
    totalAmount
    isPaid
    bookedOnline
    specialRequests
    createdAt
  }
}

query GetSpaAppointment($id: ID!) {
  spaAppointment(id: $id) {
    id
    appointmentNumber
    service {
      id
      name
      durationMinutes
      price
    }
    memberId
    memberName
    memberNumber
    guestName
    guestEmail
    guestPhone
    staff {
      id
      displayName
      avatarUrl
    }
    room {
      id
      name
      code
    }
    appointmentDate
    startTime
    endTime
    status
    totalAmount
    isPaid
    paidAt
    specialRequests
    packageRedemptionId
  }
}

# ─────────────────────────────────────────────────────────────
# PACKAGE QUERIES
# ─────────────────────────────────────────────────────────────

query GetSpaPackages($activeOnly: Boolean) {
  spaPackages(activeOnly: $activeOnly) {
    id
    name
    description
    price
    memberPrice
    validityDays
    isTransferable
    imageUrl
    sortOrder
    isActive
    includedServices {
      serviceId
      serviceName
      quantity
      remainingQuantity
    }
  }
}

query GetMemberSpaPackages($memberId: ID!, $activeOnly: Boolean) {
  memberSpaPackages(memberId: $memberId, activeOnly: $activeOnly) {
    id
    purchaseNumber
    package {
      id
      name
    }
    purchaseDate
    expiryDate
    totalAmount
    status
    isPaid
    servicesRemaining {
      serviceId
      serviceName
      quantity
      remainingQuantity
    }
    totalRedemptions
  }
}

# ─────────────────────────────────────────────────────────────
# CHECKOUT QUERIES
# ─────────────────────────────────────────────────────────────

query GetSpaCheckout($appointmentId: ID!) {
  spaCheckout(appointmentId: $appointmentId) {
    appointmentId
    memberName
    guestName
    lineItems {
      id
      type
      description
      quantity
      unitPrice
      taxAmount
      totalAmount
      isPaid
    }
    subtotal
    taxTotal
    grandTotal
    paidAmount
    balanceDue
  }
}

# ─────────────────────────────────────────────────────────────
# SERVICE MUTATIONS
# ─────────────────────────────────────────────────────────────

mutation CreateSpaServiceCategory($input: CreateSpaServiceCategoryInput!) {
  createSpaServiceCategory(input: $input) {
    id
    name
    description
    sortOrder
    isActive
  }
}

mutation CreateSpaService($input: CreateSpaServiceInput!) {
  createSpaService(input: $input) {
    id
    name
    description
    durationMinutes
    price
    memberPrice
    isActive
  }
}

# ─────────────────────────────────────────────────────────────
# STAFF MUTATIONS
# ─────────────────────────────────────────────────────────────

mutation CreateSpaStaff($input: CreateSpaStaffInput!) {
  createSpaStaff(input: $input) {
    id
    displayName
    firstName
    lastName
    isActive
  }
}

mutation UpdateSpaStaffSchedule($input: UpdateSpaStaffScheduleInput!) {
  updateSpaStaffSchedule(input: $input) {
    id
    displayName
  }
}

# ─────────────────────────────────────────────────────────────
# ROOM MUTATIONS
# ─────────────────────────────────────────────────────────────

mutation CreateSpaRoom($input: CreateSpaRoomInput!) {
  createSpaRoom(input: $input) {
    id
    name
    code
    roomType
    isActive
  }
}

# ─────────────────────────────────────────────────────────────
# APPOINTMENT MUTATIONS
# ─────────────────────────────────────────────────────────────

mutation CreateSpaAppointment($input: CreateSpaAppointmentInput!) {
  createSpaAppointment(input: $input) {
    success
    error
    appointment {
      id
      appointmentNumber
      appointmentDate
      startTime
      status
    }
    confirmationNumber
  }
}

mutation CancelSpaAppointment($input: CancelSpaAppointmentInput!) {
  cancelSpaAppointment(input: $input) {
    success
    error
  }
}

mutation CheckInSpaAppointment($input: CheckInSpaAppointmentInput!) {
  checkInSpaAppointment(input: $input) {
    success
    error
    appointment {
      id
      status
    }
  }
}

mutation CompleteSpaAppointment($id: ID!) {
  completeSpaAppointment(id: $id) {
    success
    error
  }
}

# ─────────────────────────────────────────────────────────────
# PACKAGE MUTATIONS
# ─────────────────────────────────────────────────────────────

mutation CreateSpaPackage($input: CreateSpaPackageInput!) {
  createSpaPackage(input: $input) {
    id
    name
    price
    isActive
  }
}

mutation PurchaseSpaPackage($input: PurchaseSpaPackageInput!) {
  purchaseSpaPackage(input: $input) {
    id
    purchaseNumber
    expiryDate
    status
  }
}

# ─────────────────────────────────────────────────────────────
# CHECKOUT MUTATIONS
# ─────────────────────────────────────────────────────────────

mutation AddSpaRetailItem($input: AddSpaRetailItemInput!) {
  addSpaRetailItem(input: $input)
}

mutation ProcessSpaPayment($input: SpaCheckoutPaymentInput!) {
  processSpaPayment(input: $input) {
    success
    error
    transactionId
    amountPaid
    remainingBalance
  }
}
```

**Step 2: Run codegen**

```bash
cd packages/api-client && pnpm codegen
```

**Step 3: Export new hooks in index.ts**

Add to `/packages/api-client/src/index.ts`:

```typescript
// Spa hooks
export {
  useGetSpaServiceCategoriesQuery,
  useGetSpaServicesQuery,
  useGetSpaServiceQuery,
  useGetSpaStaffQuery,
  useGetSpaStaffMemberQuery,
  useGetSpaRoomsQuery,
  useGetSpaAvailabilityQuery,
  useGetSpaAppointmentsQuery,
  useGetSpaAppointmentQuery,
  useGetSpaPackagesQuery,
  useGetMemberSpaPackagesQuery,
  useGetSpaCheckoutQuery,
  useCreateSpaServiceCategoryMutation,
  useCreateSpaServiceMutation,
  useCreateSpaStaffMutation,
  useUpdateSpaStaffScheduleMutation,
  useCreateSpaRoomMutation,
  useCreateSpaAppointmentMutation,
  useCancelSpaAppointmentMutation,
  useCheckInSpaAppointmentMutation,
  useCompleteSpaAppointmentMutation,
  useCreateSpaPackageMutation,
  usePurchaseSpaPackageMutation,
  useAddSpaRetailItemMutation,
  useProcessSpaPaymentMutation,
} from './hooks/generated';
```

**Step 4: Commit**

```bash
git add packages/api-client/
git commit -m "feat(api-client): add Spa GraphQL operations

- Add service, staff, room queries
- Add availability and appointment queries
- Add package queries
- Add checkout query
- Add all CRUD mutations
- Generate and export TanStack Query hooks"
```

---

## Part 4: React Components

### Task 4.1: Create Spa Service Menu Component

**Files:**
- Create: `/apps/application/src/components/spa/service-menu.tsx`

**Step 1: Create the component**

```typescript
'use client';

import { useState } from 'react';
import { useGetSpaServiceCategoriesQuery, useGetSpaServicesQuery } from '@clubvantage/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@clubvantage/ui/primitives/card';
import { Button } from '@clubvantage/ui/primitives/button';
import { Badge } from '@clubvantage/ui/primitives/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@clubvantage/ui/primitives/tabs';
import { Clock, DollarSign, Users } from 'lucide-react';
import { cn } from '@clubvantage/ui';

interface ServiceMenuProps {
  onSelectService?: (serviceId: string) => void;
  showBookButton?: boolean;
}

export function ServiceMenu({ onSelectService, showBookButton = true }: ServiceMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categoriesData, isLoading: categoriesLoading } = useGetSpaServiceCategoriesQuery({});
  const { data: servicesData, isLoading: servicesLoading } = useGetSpaServicesQuery({
    categoryId: selectedCategory ?? undefined,
  });

  const categories = categoriesData?.spaServiceCategories ?? [];
  const services = servicesData?.spaServices ?? [];

  if (categoriesLoading) {
    return <div className="p-4 text-center text-muted-foreground">Loading services...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <Tabs
        value={selectedCategory ?? 'all'}
        onValueChange={(v) => setSelectedCategory(v === 'all' ? null : v)}
      >
        <TabsList className="flex-wrap h-auto gap-2 bg-transparent p-0">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
          >
            All Services
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
            >
              {category.name}
              {category.serviceCount && (
                <Badge variant="secondary" className="ml-2">
                  {category.serviceCount}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Service Grid */}
      {servicesLoading ? (
        <div className="p-4 text-center text-muted-foreground">Loading...</div>
      ) : services.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No services found in this category.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card
              key={service.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-lg hover:border-amber-300',
                !service.isActive && 'opacity-50'
              )}
              onClick={() => onSelectService?.(service.id)}
            >
              {service.imageUrl && (
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  {!service.isOnlineBookable && (
                    <Badge variant="secondary">Call to Book</Badge>
                  )}
                </div>
                {service.category && (
                  <Badge variant="outline" className="w-fit">
                    {service.category.name}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {service.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {service.durationMinutes} min
                  </div>
                  <div className="flex items-center gap-1 font-medium">
                    <DollarSign className="h-4 w-4" />
                    {service.memberPrice ? (
                      <>
                        <span className="text-emerald-600">
                          {service.memberPrice.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground line-through text-xs ml-1">
                          {service.price.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      service.price.toLocaleString()
                    )}
                  </div>
                </div>

                {showBookButton && service.isOnlineBookable && (
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectService?.(service.id);
                    }}
                  >
                    Book Now
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/application/src/components/spa/
git commit -m "feat(ui): add ServiceMenu component

- Display service categories as tabs
- Show service cards with pricing and duration
- Support member pricing display
- Add book button with callback"
```

---

### Task 4.2: Create Spa Booking Calendar Component

**Files:**
- Create: `/apps/application/src/components/spa/booking-calendar.tsx`

**Step 1: Create the component**

```typescript
'use client';

import { useState, useMemo } from 'react';
import {
  useGetSpaServiceQuery,
  useGetSpaAvailabilityQuery,
  useCreateSpaAppointmentMutation,
} from '@clubvantage/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@clubvantage/ui/primitives/card';
import { Button } from '@clubvantage/ui/primitives/button';
import { Calendar } from '@clubvantage/ui/primitives/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@clubvantage/ui/primitives/avatar';
import { Textarea } from '@clubvantage/ui/primitives/textarea';
import { Label } from '@clubvantage/ui/primitives/label';
import { useToast } from '@clubvantage/ui/primitives/use-toast';
import { cn } from '@clubvantage/ui';
import { format, addDays } from 'date-fns';
import { Clock, User, CalendarIcon, Check, Loader2 } from 'lucide-react';

interface BookingCalendarProps {
  serviceId: string;
  memberId?: string;
  onBookingComplete?: (appointmentId: string, confirmationNumber: string) => void;
  onCancel?: () => void;
}

export function BookingCalendar({
  serviceId,
  memberId,
  onBookingComplete,
  onCancel,
}: BookingCalendarProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [specialRequests, setSpecialRequests] = useState('');
  const [step, setStep] = useState<'date' | 'time' | 'confirm'>('date');

  const { data: serviceData } = useGetSpaServiceQuery({ id: serviceId });
  const service = serviceData?.spaService;

  const { data: availabilityData, isLoading: loadingAvailability } = useGetSpaAvailabilityQuery(
    {
      serviceId,
      date: selectedDate,
      preferredStaffId: selectedStaffId ?? undefined,
    },
    { enabled: !!selectedDate }
  );

  const createAppointment = useCreateSpaAppointmentMutation();

  const availableSlots = useMemo(() => {
    return availabilityData?.spaAvailability?.slots?.filter((s) => s.available) ?? [];
  }, [availabilityData]);

  const selectedSlot = useMemo(() => {
    return availableSlots.find((s) => s.time === selectedTime);
  }, [availableSlots, selectedTime]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setSelectedTime(null);
      setStep('time');
    }
  };

  const handleTimeSelect = (time: string, staffId?: string) => {
    setSelectedTime(time);
    if (staffId) setSelectedStaffId(staffId);
    setStep('confirm');
  };

  const handleConfirmBooking = async () => {
    if (!selectedTime || !selectedStaffId) return;

    try {
      const result = await createAppointment.mutateAsync({
        input: {
          serviceId,
          memberId,
          staffId: selectedStaffId,
          appointmentDate: selectedDate,
          startTime: selectedTime,
          specialRequests: specialRequests || undefined,
        },
      });

      if (result.createSpaAppointment.success) {
        toast({
          title: 'Booking Confirmed',
          description: `Confirmation: ${result.createSpaAppointment.confirmationNumber}`,
        });
        onBookingComplete?.(
          result.createSpaAppointment.appointment!.id,
          result.createSpaAppointment.confirmationNumber!
        );
      } else {
        toast({
          title: 'Booking Failed',
          description: result.createSpaAppointment.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create booking. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (!service) {
    return <div className="p-4 text-center">Loading service...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Service Summary */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center gap-4">
            {service.imageUrl && (
              <img
                src={service.imageUrl}
                alt={service.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
            )}
            <div>
              <h3 className="font-semibold text-lg">{service.name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {service.durationMinutes} min
                </span>
                <span className="font-medium text-foreground">
                  {(service.memberPrice ?? service.price).toLocaleString()} THB
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {['date', 'time', 'confirm'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                step === s
                  ? 'bg-amber-500 text-white'
                  : i < ['date', 'time', 'confirm'].indexOf(step)
                  ? 'bg-emerald-500 text-white'
                  : 'bg-stone-200 text-stone-600'
              )}
            >
              {i < ['date', 'time', 'confirm'].indexOf(step) ? (
                <Check className="h-4 w-4" />
              ) : (
                i + 1
              )}
            </div>
            {i < 2 && <div className="w-12 h-0.5 bg-stone-200" />}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {step === 'date' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) =>
                date < new Date() || date > addDays(new Date(), service.advanceBookingDays)
              }
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      )}

      {step === 'time' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Select Time - {format(selectedDate, 'EEEE, MMMM d')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAvailability ? (
              <div className="p-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No available times on this date. Please select another date.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? 'default' : 'outline'}
                    className={cn(
                      selectedTime === slot.time && 'bg-amber-500 hover:bg-amber-600'
                    )}
                    onClick={() => {
                      const staffId = slot.availableStaff?.[0]?.id;
                      if (staffId) handleTimeSelect(slot.time, staffId);
                    }}
                  >
                    {slot.time}
                  </Button>
                ))}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => setStep('date')}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'confirm' && selectedSlot && (
        <Card>
          <CardHeader>
            <CardTitle>Confirm Booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-stone-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service</span>
                <span className="font-medium">{service.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{service.durationMinutes} minutes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Therapist</span>
                <span className="font-medium">
                  {selectedSlot.availableStaff?.find((s) => s.id === selectedStaffId)?.displayName}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-semibold text-lg">
                  {(service.memberPrice ?? service.price).toLocaleString()} THB
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Special Requests (optional)</Label>
              <Textarea
                placeholder="Any special requests or notes..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep('time')}>
                Back
              </Button>
              <Button
                className="flex-1 bg-amber-500 hover:bg-amber-600"
                onClick={handleConfirmBooking}
                disabled={createAppointment.isPending}
              >
                {createAppointment.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {onCancel && (
        <Button variant="ghost" onClick={onCancel} className="w-full">
          Cancel
        </Button>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/application/src/components/spa/booking-calendar.tsx
git commit -m "feat(ui): add BookingCalendar component

- Multi-step booking flow (date, time, confirm)
- Show available time slots with staff
- Display booking summary before confirm
- Support special requests"
```

---

### Task 4.3: Create Spa Appointment List Component

**Files:**
- Create: `/apps/application/src/components/spa/appointment-list.tsx`

**Step 1: Create the component**

```typescript
'use client';

import { useState } from 'react';
import {
  useGetSpaAppointmentsQuery,
  useCancelSpaAppointmentMutation,
  useCheckInSpaAppointmentMutation,
  useCompleteSpaAppointmentMutation,
} from '@clubvantage/api-client';
import { Card, CardContent } from '@clubvantage/ui/primitives/card';
import { Button } from '@clubvantage/ui/primitives/button';
import { Badge } from '@clubvantage/ui/primitives/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@clubvantage/ui/primitives/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@clubvantage/ui/primitives/dialog';
import { Textarea } from '@clubvantage/ui/primitives/textarea';
import { useToast } from '@clubvantage/ui/primitives/use-toast';
import { format } from 'date-fns';
import {
  Clock,
  User,
  MoreVertical,
  CheckCircle,
  XCircle,
  Play,
  DollarSign,
} from 'lucide-react';
import { cn } from '@clubvantage/ui';

const statusColors: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  CHECKED_IN: 'bg-emerald-100 text-emerald-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-stone-100 text-stone-600',
  CANCELLED: 'bg-red-100 text-red-700',
  NO_SHOW: 'bg-red-100 text-red-700',
};

interface AppointmentListProps {
  startDate?: Date;
  endDate?: Date;
  staffId?: string;
  memberId?: string;
  onSelectAppointment?: (id: string) => void;
}

export function AppointmentList({
  startDate,
  endDate,
  staffId,
  memberId,
  onSelectAppointment,
}: AppointmentListProps) {
  const { toast } = useToast();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const { data, isLoading, refetch } = useGetSpaAppointmentsQuery({
    startDate,
    endDate,
    staffId,
    memberId,
  });

  const cancelMutation = useCancelSpaAppointmentMutation();
  const checkInMutation = useCheckInSpaAppointmentMutation();
  const completeMutation = useCompleteSpaAppointmentMutation();

  const appointments = data?.spaAppointments ?? [];

  const handleCheckIn = async (id: string) => {
    try {
      await checkInMutation.mutateAsync({ input: { id } });
      toast({ title: 'Checked in successfully' });
      refetch();
    } catch (error) {
      toast({ title: 'Check-in failed', variant: 'destructive' });
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeMutation.mutateAsync({ id });
      toast({ title: 'Appointment completed' });
      refetch();
    } catch (error) {
      toast({ title: 'Failed to complete', variant: 'destructive' });
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancellingId || !cancelReason) return;

    try {
      await cancelMutation.mutateAsync({
        input: { id: cancellingId, reason: cancelReason },
      });
      toast({ title: 'Appointment cancelled' });
      setCancelDialogOpen(false);
      setCancellingId(null);
      setCancelReason('');
      refetch();
    } catch (error) {
      toast({ title: 'Cancellation failed', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground">Loading appointments...</div>;
  }

  if (appointments.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No appointments found for the selected criteria.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {appointments.map((apt) => (
          <Card
            key={apt.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onSelectAppointment?.(apt.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{apt.service.name}</span>
                    <Badge className={cn('text-xs', statusColors[apt.status])}>
                      {apt.status.replace('_', ' ')}
                    </Badge>
                    {apt.isPaid && (
                      <Badge className="bg-emerald-100 text-emerald-700">
                        <DollarSign className="h-3 w-3 mr-1" />
                        Paid
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(new Date(apt.appointmentDate), 'MMM d')} at {apt.startTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {apt.staff.displayName}
                    </span>
                  </div>

                  <div className="text-sm">
                    {apt.memberName || apt.guestName}
                    {apt.bookedOnline && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        Online Booking
                      </Badge>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {apt.status === 'CONFIRMED' && (
                      <DropdownMenuItem onClick={() => handleCheckIn(apt.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Check In
                      </DropdownMenuItem>
                    )}
                    {apt.status === 'CHECKED_IN' && (
                      <DropdownMenuItem onClick={() => handleComplete(apt.id)}>
                        <Play className="h-4 w-4 mr-2" />
                        Complete
                      </DropdownMenuItem>
                    )}
                    {['PENDING', 'CONFIRMED'].includes(apt.status) && (
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => {
                          setCancellingId(apt.id);
                          setCancelDialogOpen(true);
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for cancellation.
            </p>
            <Textarea
              placeholder="Cancellation reason..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              Keep Appointment
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={!cancelReason || cancelMutation.isPending}
            >
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

**Step 2: Commit**

```bash
git add apps/application/src/components/spa/appointment-list.tsx
git commit -m "feat(ui): add AppointmentList component

- Display appointments with status badges
- Quick actions (check-in, complete, cancel)
- Cancel dialog with reason
- Filter by date, staff, member"
```

---

### Task 4.4: Create Spa Checkout Panel Component

**Files:**
- Create: `/apps/application/src/components/spa/checkout-panel.tsx`

**Step 1: Create the component**

```typescript
'use client';

import { useState } from 'react';
import {
  useGetSpaCheckoutQuery,
  useGetSpaAppointmentQuery,
  useAddSpaRetailItemMutation,
  useProcessSpaPaymentMutation,
} from '@clubvantage/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@clubvantage/ui/primitives/card';
import { Button } from '@clubvantage/ui/primitives/button';
import { Badge } from '@clubvantage/ui/primitives/badge';
import { Separator } from '@clubvantage/ui/primitives/separator';
import { useToast } from '@clubvantage/ui/primitives/use-toast';
import { Plus, CreditCard, Loader2, Check, ShoppingBag } from 'lucide-react';
import { cn } from '@clubvantage/ui';

interface CheckoutPanelProps {
  appointmentId: string;
  onComplete?: () => void;
}

export function CheckoutPanel({ appointmentId, onComplete }: CheckoutPanelProps) {
  const { toast } = useToast();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  const { data: checkoutData, isLoading, refetch } = useGetSpaCheckoutQuery({ appointmentId });
  const { data: appointmentData } = useGetSpaAppointmentQuery({ id: appointmentId });

  const processPayment = useProcessSpaPaymentMutation();

  const checkout = checkoutData?.spaCheckout;
  const appointment = appointmentData?.spaAppointment;

  const handlePayment = async () => {
    if (!selectedPaymentMethod || !checkout) return;

    try {
      const result = await processPayment.mutateAsync({
        input: {
          appointmentId,
          paymentMethodId: selectedPaymentMethod,
        },
      });

      if (result.processSpaPayment.success) {
        toast({
          title: 'Payment Successful',
          description: `Transaction: ${result.processSpaPayment.transactionId}`,
        });
        refetch();
        if (result.processSpaPayment.remainingBalance === 0) {
          onComplete?.();
        }
      } else {
        toast({
          title: 'Payment Failed',
          description: result.processSpaPayment.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Payment Error',
        description: 'Failed to process payment',
        variant: 'destructive',
      });
    }
  };

  if (isLoading || !checkout) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Customer Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-medium">{checkout.memberName || checkout.guestName}</p>
          {appointment && (
            <p className="text-sm text-muted-foreground">
              {appointment.service.name} - {appointment.startTime}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Items</CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {checkout.lineItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {item.type === 'SERVICE' ? 'Service' : 'Product'}
                </Badge>
                <span className="text-sm">
                  {item.description}
                  {item.quantity > 1 && ` x${item.quantity}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.totalAmount.toLocaleString()}</span>
                {item.isPaid && (
                  <Badge className="bg-emerald-100 text-emerald-700">
                    <Check className="h-3 w-3" />
                  </Badge>
                )}
              </div>
            </div>
          ))}

          <Separator className="my-3" />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{checkout.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{checkout.taxTotal.toLocaleString()}</span>
            </div>
            {checkout.paidAmount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Paid</span>
                <span>-{checkout.paidAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-semibold pt-2 border-t">
              <span>Balance Due</span>
              <span>{checkout.balanceDue.toLocaleString()} THB</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment */}
      {checkout.balanceDue > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {['cash', 'card', 'transfer', 'account'].map((method) => (
                <Button
                  key={method}
                  variant={selectedPaymentMethod === method ? 'default' : 'outline'}
                  className={cn(
                    selectedPaymentMethod === method && 'bg-amber-500 hover:bg-amber-600'
                  )}
                  onClick={() => setSelectedPaymentMethod(method)}
                >
                  {method === 'cash' && 'Cash'}
                  {method === 'card' && 'Card'}
                  {method === 'transfer' && 'Transfer'}
                  {method === 'account' && 'Member Account'}
                </Button>
              ))}
            </div>

            <Button
              className="w-full bg-emerald-500 hover:bg-emerald-600"
              size="lg"
              disabled={!selectedPaymentMethod || processPayment.isPending}
              onClick={handlePayment}
            >
              {processPayment.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Pay {checkout.balanceDue.toLocaleString()} THB
            </Button>
          </CardContent>
        </Card>
      )}

      {checkout.balanceDue === 0 && (
        <div className="p-4 bg-emerald-50 rounded-lg text-center">
          <Check className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          <p className="font-medium text-emerald-700">Fully Paid</p>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/application/src/components/spa/checkout-panel.tsx
git commit -m "feat(ui): add CheckoutPanel component

- Display line items (services + products)
- Show totals with tax breakdown
- Payment method selection
- Process payment with mutation"
```

---

### Task 4.5: Create Spa Package Manager Component

**Files:**
- Create: `/apps/application/src/components/spa/package-manager.tsx`

**Step 1: Create the component**

```typescript
'use client';

import { useState } from 'react';
import {
  useGetSpaPackagesQuery,
  useGetMemberSpaPackagesQuery,
  usePurchaseSpaPackageMutation,
} from '@clubvantage/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@clubvantage/ui/primitives/card';
import { Button } from '@clubvantage/ui/primitives/button';
import { Badge } from '@clubvantage/ui/primitives/badge';
import { Progress } from '@clubvantage/ui/primitives/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@clubvantage/ui/primitives/dialog';
import { useToast } from '@clubvantage/ui/primitives/use-toast';
import { format, differenceInDays } from 'date-fns';
import { Package, Gift, Calendar, Loader2 } from 'lucide-react';
import { cn } from '@clubvantage/ui';

interface PackageManagerProps {
  memberId?: string;
  mode: 'browse' | 'member';
  onRedeemPackage?: (purchaseId: string, serviceId: string) => void;
}

export function PackageManager({ memberId, mode, onRedeemPackage }: PackageManagerProps) {
  const { toast } = useToast();
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  const { data: packagesData, isLoading: loadingPackages } = useGetSpaPackagesQuery({});
  const { data: memberPackagesData, isLoading: loadingMemberPackages } = useGetMemberSpaPackagesQuery(
    { memberId: memberId!, activeOnly: true },
    { enabled: mode === 'member' && !!memberId }
  );

  const purchaseMutation = usePurchaseSpaPackageMutation();

  const packages = packagesData?.spaPackages ?? [];
  const memberPackages = memberPackagesData?.memberSpaPackages ?? [];

  const handlePurchase = async () => {
    if (!selectedPackage || !memberId) return;

    try {
      await purchaseMutation.mutateAsync({
        input: {
          packageId: selectedPackage.id,
          memberId,
          paymentMethodId: 'default', // Would come from payment selection
        },
      });
      toast({ title: 'Package purchased successfully!' });
      setPurchaseDialogOpen(false);
      setSelectedPackage(null);
    } catch (error) {
      toast({ title: 'Purchase failed', variant: 'destructive' });
    }
  };

  if (loadingPackages || loadingMemberPackages) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
      </div>
    );
  }

  // Browse Mode - Show available packages
  if (mode === 'browse') {
    return (
      <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
              {pkg.imageUrl && (
                <div className="aspect-video relative overflow-hidden rounded-t-lg">
                  <img
                    src={pkg.imageUrl}
                    alt={pkg.name}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-amber-500" />
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {pkg.description && (
                  <p className="text-sm text-muted-foreground">{pkg.description}</p>
                )}

                <div className="space-y-2">
                  <p className="text-sm font-medium">Includes:</p>
                  {pkg.includedServices.map((svc) => (
                    <div key={svc.serviceId} className="flex justify-between text-sm">
                      <span>{svc.serviceName}</span>
                      <Badge variant="secondary">x{svc.quantity}</Badge>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <span className="text-2xl font-bold">
                      {(pkg.memberPrice ?? pkg.price).toLocaleString()}
                    </span>
                    <span className="text-muted-foreground ml-1">THB</span>
                  </div>
                  <Badge variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    Valid {pkg.validityDays} days
                  </Badge>
                </div>

                {memberId && (
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600"
                    onClick={() => {
                      setSelectedPackage(pkg);
                      setPurchaseDialogOpen(true);
                    }}
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    Purchase Package
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Purchase Dialog */}
        <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Purchase Package</DialogTitle>
            </DialogHeader>
            {selectedPackage && (
              <div className="space-y-4 py-4">
                <p className="font-medium">{selectedPackage.name}</p>
                <div className="bg-stone-50 rounded-lg p-4">
                  <div className="flex justify-between">
                    <span>Package Price</span>
                    <span className="font-bold">
                      {(selectedPackage.memberPrice ?? selectedPackage.price).toLocaleString()} THB
                    </span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-amber-500 hover:bg-amber-600"
                onClick={handlePurchase}
                disabled={purchaseMutation.isPending}
              >
                {purchaseMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Confirm Purchase
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Member Mode - Show member's packages with redemption
  return (
    <div className="space-y-4">
      {memberPackages.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No active packages</p>
        </div>
      ) : (
        memberPackages.map((purchase) => {
          const daysRemaining = differenceInDays(new Date(purchase.expiryDate), new Date());
          const isExpiringSoon = daysRemaining <= 30 && daysRemaining > 0;

          return (
            <Card key={purchase.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{purchase.package.name}</CardTitle>
                  <Badge
                    className={cn(
                      purchase.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-stone-100 text-stone-600'
                    )}
                  >
                    {purchase.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Purchased: {format(new Date(purchase.purchaseDate), 'MMM d, yyyy')}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Expiry Warning */}
                {isExpiringSoon && (
                  <div className="p-2 bg-amber-50 rounded text-amber-700 text-sm">
                    Expires in {daysRemaining} days
                  </div>
                )}

                {/* Services Remaining */}
                <div className="space-y-3">
                  {purchase.servicesRemaining.map((svc) => {
                    const used = svc.quantity - svc.remainingQuantity;
                    const progress = (used / svc.quantity) * 100;

                    return (
                      <div key={svc.serviceId} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{svc.serviceName}</span>
                          <span className="text-muted-foreground">
                            {svc.remainingQuantity}/{svc.quantity} remaining
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        {svc.remainingQuantity > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="mt-1"
                            onClick={() => onRedeemPackage?.(purchase.id, svc.serviceId)}
                          >
                            Book This Service
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add apps/application/src/components/spa/package-manager.tsx
git commit -m "feat(ui): add PackageManager component

- Browse mode: display available packages
- Member mode: show purchased packages
- Track redemption progress
- Package purchase dialog"
```

---

## Part 5: Reminder Service

### Task 5.1: Create Reminder Service

**Files:**
- Create: `/apps/api/src/graphql/spa/reminder.service.ts`

**Step 1: Create the service**

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ReminderStatus, ReminderChannel } from '@prisma/client';

@Injectable()
export class SpaReminderService {
  private readonly logger = new Logger(SpaReminderService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Schedule reminders when appointment is created
   */
  async scheduleReminders(appointmentId: string) {
    const appointment = await this.prisma.spaAppointment.findUnique({
      where: { id: appointmentId },
      include: {
        club: {
          include: { spaReminderConfig: true },
        },
        member: true,
      },
    });

    if (!appointment) return;

    const config = appointment.club.spaReminderConfig;
    if (!config?.enabled) return;

    const email = appointment.member?.email || appointment.guestEmail;
    const phone = appointment.member?.phone || appointment.guestPhone;

    // Get appointment datetime
    const [hours, minutes] = appointment.startTime.split(':').map(Number);
    const appointmentDateTime = new Date(appointment.appointmentDate);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    // Create reminders for each configured time
    const reminders = [];
    for (const hoursBefore of config.reminderHoursBefore) {
      const scheduledFor = new Date(appointmentDateTime);
      scheduledFor.setHours(scheduledFor.getHours() - hoursBefore);

      // Don't schedule reminders in the past
      if (scheduledFor <= new Date()) continue;

      // Determine channel based on available contact info
      let channel = config.defaultChannel;
      if (channel === 'BOTH') {
        if (email && phone) channel = 'BOTH';
        else if (email) channel = 'EMAIL';
        else if (phone) channel = 'SMS';
        else continue; // No contact info
      } else if (channel === 'EMAIL' && !email) continue;
      else if (channel === 'SMS' && !phone) continue;

      reminders.push({
        appointmentId,
        channel,
        scheduledFor,
        status: 'PENDING' as ReminderStatus,
      });
    }

    if (reminders.length > 0) {
      await this.prisma.spaAppointmentReminder.createMany({
        data: reminders,
      });
    }

    this.logger.log(`Scheduled ${reminders.length} reminders for appointment ${appointmentId}`);
  }

  /**
   * Process pending reminders every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async processPendingReminders() {
    const now = new Date();

    const reminders = await this.prisma.spaAppointmentReminder.findMany({
      where: {
        status: 'PENDING',
        scheduledFor: { lte: now },
      },
      include: {
        appointment: {
          include: {
            service: true,
            staff: true,
            member: true,
            club: { include: { spaReminderConfig: true } },
          },
        },
      },
      take: 50, // Process in batches
    });

    for (const reminder of reminders) {
      try {
        await this.sendReminder(reminder);
      } catch (error) {
        this.logger.error(`Failed to send reminder ${reminder.id}:`, error);
        await this.prisma.spaAppointmentReminder.update({
          where: { id: reminder.id },
          data: {
            status: 'FAILED',
            errorMessage: error.message,
          },
        });
      }
    }
  }

  private async sendReminder(reminder: any) {
    const { appointment, channel } = reminder;
    const config = appointment.club.spaReminderConfig;

    const email = appointment.member?.email || appointment.guestEmail;
    const phone = appointment.member?.phone || appointment.guestPhone;
    const name = appointment.member
      ? `${appointment.member.firstName} ${appointment.member.lastName}`
      : appointment.guestName;

    const appointmentDate = new Date(appointment.appointmentDate).toLocaleDateString();
    const appointmentTime = appointment.startTime;
    const serviceName = appointment.service.name;
    const staffName = appointment.staff.displayName;

    // Send SMS
    if ((channel === 'SMS' || channel === 'BOTH') && phone) {
      await this.sendSMS(phone, {
        name,
        serviceName,
        date: appointmentDate,
        time: appointmentTime,
        staffName,
        template: config.smsTemplate,
      });
    }

    // Send Email
    if ((channel === 'EMAIL' || channel === 'BOTH') && email) {
      await this.sendEmail(email, {
        name,
        serviceName,
        date: appointmentDate,
        time: appointmentTime,
        staffName,
        subject: config.emailSubject,
        template: config.emailTemplate,
      });
    }

    // Mark as sent
    await this.prisma.spaAppointmentReminder.update({
      where: { id: reminder.id },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });
  }

  private async sendSMS(phone: string, data: any) {
    // TODO: Integrate with Twilio or other SMS provider
    this.logger.log(`[SMS] Would send to ${phone}: Reminder for ${data.serviceName}`);
  }

  private async sendEmail(email: string, data: any) {
    // TODO: Integrate with SendGrid or other email provider
    this.logger.log(`[Email] Would send to ${email}: ${data.subject}`);
  }
}
```

**Step 2: Add to Spa module**

Update `/apps/api/src/graphql/spa/spa.module.ts`:

```typescript
import { SpaReminderService } from './reminder.service';

@Module({
  imports: [PrismaModule, TaxModule],
  providers: [SpaService, SpaResolver, SpaReminderService],
  exports: [SpaService, SpaReminderService],
})
export class SpaGraphqlModule {}
```

**Step 3: Commit**

```bash
git add apps/api/src/graphql/spa/
git commit -m "feat(api): add SpaReminderService

- Schedule reminders on appointment creation
- Cron job to process pending reminders
- Support SMS and email channels
- Configurable reminder times"
```

---

## Part 6: Final Integration and Testing

### Task 6.1: Create Spa Page Layout

**Files:**
- Create: `/apps/application/src/app/(dashboard)/spa/page.tsx`
- Create: `/apps/application/src/app/(dashboard)/spa/layout.tsx`

**Step 1: Create the layout**

```typescript
// /apps/application/src/app/(dashboard)/spa/layout.tsx
import { ReactNode } from 'react';

export default function SpaLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      {children}
    </div>
  );
}
```

**Step 2: Create the main page**

```typescript
// /apps/application/src/app/(dashboard)/spa/page.tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@clubvantage/ui/primitives/tabs';
import { ServiceMenu } from '@/components/spa/service-menu';
import { AppointmentList } from '@/components/spa/appointment-list';
import { PackageManager } from '@/components/spa/package-manager';
import { BookingCalendar } from '@/components/spa/booking-calendar';
import {
  Dialog,
  DialogContent,
} from '@clubvantage/ui/primitives/dialog';
import { Calendar, ClipboardList, Package, Sparkles } from 'lucide-react';

export default function SpaPage() {
  const [activeTab, setActiveTab] = useState('appointments');
  const [bookingServiceId, setBookingServiceId] = useState<string | null>(null);

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Spa & Wellness</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="appointments" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="packages" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Packages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          <AppointmentList
            startDate={new Date()}
            onSelectAppointment={(id) => console.log('Selected:', id)}
          />
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <ServiceMenu
            onSelectService={(id) => setBookingServiceId(id)}
            showBookButton={true}
          />
        </TabsContent>

        <TabsContent value="packages" className="space-y-4">
          <PackageManager mode="browse" />
        </TabsContent>
      </Tabs>

      {/* Booking Dialog */}
      <Dialog open={!!bookingServiceId} onOpenChange={() => setBookingServiceId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {bookingServiceId && (
            <BookingCalendar
              serviceId={bookingServiceId}
              onBookingComplete={() => {
                setBookingServiceId(null);
                setActiveTab('appointments');
              }}
              onCancel={() => setBookingServiceId(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
```

**Step 3: Commit**

```bash
git add apps/application/src/app/\(dashboard\)/spa/
git commit -m "feat(ui): add Spa page with tabs

- Appointments tab with list view
- Services tab with booking flow
- Packages tab with browse mode
- Booking dialog integration"
```

---

### Task 6.2: Add Spa to Navigation

**Files:**
- Modify: `/apps/application/src/components/layouts/sidebar.tsx`

**Step 1: Add spa navigation item**

Add to the navigation items array:

```typescript
{
  name: 'Spa',
  href: '/spa',
  icon: Sparkles,
}
```

**Step 2: Commit**

```bash
git add apps/application/src/components/layouts/sidebar.tsx
git commit -m "feat(ui): add Spa to sidebar navigation"
```

---

### Task 6.3: Verify and Test

**Step 1: Run type check**

```bash
pnpm typecheck
```

**Step 2: Run tests**

```bash
pnpm test
```

**Step 3: Start dev server and verify**

```bash
pnpm dev
```

Verify:
1. Navigate to `/spa`
2. View service categories and services
3. Click "Book Now" on a service
4. Complete booking flow
5. View appointments list
6. Browse packages

**Step 4: Final commit**

```bash
git add .
git commit -m "chore: complete POS Phase 2 Spa Module

- All Prisma models and migrations
- GraphQL types, inputs, services, resolvers
- API Client operations and hooks
- React components for booking flow
- Reminder service with SMS/email
- Spa page with full navigation"
```

---

## Summary

| Part | Feature | Tasks | Estimated Effort |
|------|---------|-------|------------------|
| 1 | Database Models | 1.1-1.9 | 3-4 hours |
| 2 | GraphQL Types & Service | 2.1-2.5 | 4-5 hours |
| 3 | API Client | 3.1 | 1-2 hours |
| 4 | React Components | 4.1-4.5 | 6-8 hours |
| 5 | Reminder Service | 5.1 | 2-3 hours |
| 6 | Integration & Testing | 6.1-6.3 | 2-3 hours |

**Total: ~18-25 hours across 20 tasks**

---

## Appendix: File Reference

| Layer | Location Pattern |
|-------|------------------|
| Prisma Schema | `/database/prisma/schema.prisma` |
| GraphQL Types | `/apps/api/src/graphql/spa/spa.types.ts` |
| GraphQL Inputs | `/apps/api/src/graphql/spa/spa.input.ts` |
| Services | `/apps/api/src/graphql/spa/spa.service.ts` |
| Resolvers | `/apps/api/src/graphql/spa/spa.resolver.ts` |
| Module | `/apps/api/src/graphql/spa/spa.module.ts` |
| Reminder Service | `/apps/api/src/graphql/spa/reminder.service.ts` |
| Operations | `/packages/api-client/src/operations/spa.graphql` |
| Generated Hooks | `/packages/api-client/src/hooks/generated.ts` |
| UI Components | `/apps/application/src/components/spa/*.tsx` |
| Page | `/apps/application/src/app/(dashboard)/spa/page.tsx` |
