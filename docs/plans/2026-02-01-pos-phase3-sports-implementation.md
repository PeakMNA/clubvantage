# POS Phase 3: Sports/Courts Module - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement a comprehensive Sports/Courts module enabling court booking, class scheduling, equipment rentals, and guest management for tennis, squash, pool lanes, and other club facilities.

**Architecture:** The module follows ClubVantage's layered approach: Prisma schema extensions → GraphQL types/inputs → Service layer → Resolvers → API Client codegen → React components. It reuses existing infrastructure (PaymentService, Member accounts, Tax engine) while adding sports-specific models for courts, bookings, classes, and rentals.

**Tech Stack:** Prisma ORM, NestJS GraphQL, TanStack Query, React, Tailwind CSS, Radix UI primitives, date-fns for calendar logic.

---

## Prerequisites

Before starting implementation:
1. Ensure Phase 1 & 2 are complete (Discounts, Credit Limits, Spa Module)
2. Feature branch: `git checkout -b feature/pos-phase3-sports`
3. Dev environment running: `pnpm dev`

---

## Part 1: Court/Resource Configuration

### Task 1: Add Sports Prisma Models

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Step 1: Add SportsFacility and Court models**

Add at the end of the schema file:

```prisma
// ─────────────────────────────────────────────────────────────
// SPORTS/COURTS MODULE
// ─────────────────────────────────────────────────────────────

enum SportType {
  TENNIS
  SQUASH
  BADMINTON
  PICKLEBALL
  POOL
  GYM
  OTHER
}

enum CourtStatus {
  AVAILABLE
  BOOKED
  MAINTENANCE
  CLOSED
}

/// Sports facility configuration (courts, pools, etc.)
model SportsFacility {
  id                 String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId             String            @db.Uuid
  name               String            @db.VarChar(100)
  code               String            @db.VarChar(20)
  sportType          SportType
  description        String?
  location           String?           @db.VarChar(255)
  imageUrl           String?           @db.VarChar(500)

  // Operating hours
  openTime           String            @default("06:00") @db.VarChar(5)
  closeTime          String            @default("22:00") @db.VarChar(5)
  slotDurationMin    Int               @default(60)
  bufferMinutes      Int               @default(0)

  // Booking rules
  maxAdvanceDays     Int               @default(7)
  minAdvanceHours    Int               @default(1)
  cancellationHours  Int               @default(24)
  maxDurationMin     Int               @default(120)
  minDurationMin     Int               @default(30)

  // Access control
  memberOnly         Boolean           @default(true)
  allowGuests        Boolean           @default(true)
  maxGuestsPerBooking Int              @default(3)
  requiresApproval   Boolean           @default(false)

  isActive           Boolean           @default(true)
  sortOrder          Int               @default(0)
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  club               Club              @relation(fields: [clubId], references: [id], onDelete: Cascade)
  courts             Court[]
  bookingRules       CourtBookingRule[]
  classes            SportsClass[]

  @@unique([clubId, code])
  @@index([clubId])
  @@index([clubId, sportType])
  @@map("sports_facilities")
}

/// Individual court/lane within a facility
model Court {
  id                 String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  facilityId         String            @db.Uuid
  name               String            @db.VarChar(100)
  code               String            @db.VarChar(20)
  description        String?
  capacity           Int               @default(4)

  // Court-specific settings (override facility)
  memberRate         Decimal?          @db.Decimal(10, 2)
  guestRate          Decimal?          @db.Decimal(10, 2)
  peakRate           Decimal?          @db.Decimal(10, 2)

  // Features
  hasLighting        Boolean           @default(true)
  isIndoor           Boolean           @default(false)
  surfaceType        String?           @db.VarChar(50)
  amenities          String[]          @default([])

  status             CourtStatus       @default(AVAILABLE)
  maintenanceNote    String?
  isActive           Boolean           @default(true)
  sortOrder          Int               @default(0)
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  facility           SportsFacility    @relation(fields: [facilityId], references: [id], onDelete: Cascade)
  bookings           CourtBooking[]
  classSchedules     ClassSchedule[]

  @@unique([facilityId, code])
  @@index([facilityId])
  @@index([facilityId, status])
  @@map("courts")
}
```

**Step 2: Add CourtBooking and BookingRule models**

```prisma
/// Court booking reservation
model CourtBooking {
  id                 String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId             String            @db.Uuid
  bookingNumber      String            @db.VarChar(30)
  courtId            String            @db.Uuid
  memberId           String            @db.Uuid

  startTime          DateTime
  endTime            DateTime
  durationMinutes    Int

  // Players
  playerCount        Int               @default(1)
  guestCount         Int               @default(0)

  // Pricing
  courtFee           Decimal           @db.Decimal(10, 2)
  guestFees          Decimal           @default(0) @db.Decimal(10, 2)
  equipmentFees      Decimal           @default(0) @db.Decimal(10, 2)
  totalAmount        Decimal           @db.Decimal(10, 2)
  taxAmount          Decimal           @default(0) @db.Decimal(10, 2)

  // Status
  status             BookingStatus     @default(PENDING)
  isPaid             Boolean           @default(false)
  paidAt             DateTime?
  paymentMethodId    String?           @db.Uuid

  // Check-in
  checkedInAt        DateTime?
  checkedOutAt       DateTime?

  notes              String?
  internalNotes      String?
  cancelReason       String?           @db.VarChar(500)
  cancelledAt        DateTime?
  cancelledBy        String?           @db.Uuid

  createdBy          String            @db.Uuid
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  court              Court             @relation(fields: [courtId], references: [id])
  member             Member            @relation(fields: [memberId], references: [id])
  guests             CourtBookingGuest[]
  rentals            RentalCheckout[]

  @@unique([clubId, bookingNumber])
  @@index([clubId])
  @@index([courtId, startTime])
  @@index([memberId])
  @@index([status])
  @@map("court_bookings")
}

/// Guest attached to a court booking
model CourtBookingGuest {
  id                 String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  bookingId          String            @db.Uuid
  name               String            @db.VarChar(255)
  email              String?           @db.VarChar(255)
  phone              String?           @db.VarChar(50)
  guestFee           Decimal           @default(0) @db.Decimal(10, 2)
  isPaid             Boolean           @default(false)
  createdAt          DateTime          @default(now())

  booking            CourtBooking      @relation(fields: [bookingId], references: [id], onDelete: Cascade)

  @@index([bookingId])
  @@map("court_booking_guests")
}

/// Booking rules for facilities
model CourtBookingRule {
  id                 String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  facilityId         String            @db.Uuid
  name               String            @db.VarChar(100)

  // Time restrictions
  dayOfWeek          Int[]             @default([])  // 0=Sun, 1=Mon, etc. Empty = all days
  startTime          String?           @db.VarChar(5)
  endTime            String?           @db.VarChar(5)

  // Booking limits
  maxAdvanceDays     Int?
  maxDurationMin     Int?
  maxBookingsPerDay  Int?
  maxBookingsPerWeek Int?

  // Member restrictions
  memberTiers        String[]          @default([])  // Empty = all tiers
  memberOnly         Boolean           @default(false)

  // Pricing
  rateOverride       Decimal?          @db.Decimal(10, 2)
  isPeakTime         Boolean           @default(false)

  priority           Int               @default(0)
  isActive           Boolean           @default(true)
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  facility           SportsFacility    @relation(fields: [facilityId], references: [id], onDelete: Cascade)

  @@index([facilityId])
  @@map("court_booking_rules")
}
```

**Step 3: Add relation to Club model**

Find the `Club` model and add:

```prisma
model Club {
  // ... existing fields ...

  sportsFacilities   SportsFacility[]
}
```

**Step 4: Add relation to Member model**

Find the `Member` model and add:

```prisma
model Member {
  // ... existing fields ...

  courtBookings      CourtBooking[]
  classRegistrations ClassRegistration[]
  rentalCheckouts    RentalCheckout[]
}
```

**Step 5: Generate and migrate**

```bash
cd database && pnpm prisma generate && pnpm prisma migrate dev --name add_sports_courts_module
```

**Step 6: Commit**

```bash
git add database/prisma/
git commit -m "feat(db): add Sports/Courts module schema

- Add SportType enum and CourtStatus enum
- Add SportsFacility model for facility configuration
- Add Court model for individual courts/lanes
- Add CourtBooking model for reservations
- Add CourtBookingGuest for guest tracking
- Add CourtBookingRule for booking rules engine
- Add relations to Club and Member models"
```

---

### Task 2: Add Class and Rental Models

**Files:**
- Modify: `/database/prisma/schema.prisma`

**Step 1: Add SportsClass and ClassSchedule models**

```prisma
/// Sports class definition (e.g., Yoga, Tennis Clinic)
model SportsClass {
  id                 String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId             String            @db.Uuid
  facilityId         String?           @db.Uuid
  name               String            @db.VarChar(200)
  description        String?
  category           String            @db.VarChar(100)

  // Class settings
  durationMinutes    Int               @default(60)
  capacity           Int               @default(20)
  minParticipants    Int               @default(1)

  // Pricing
  memberPrice        Decimal           @db.Decimal(10, 2)
  guestPrice         Decimal?          @db.Decimal(10, 2)
  dropInPrice        Decimal?          @db.Decimal(10, 2)

  // Instructor
  instructorName     String?           @db.VarChar(200)
  instructorId       String?           @db.Uuid

  // Booking rules
  advanceBookingDays Int               @default(7)
  cancellationHours  Int               @default(24)
  waitlistEnabled    Boolean           @default(true)
  maxWaitlist        Int               @default(10)

  imageUrl           String?           @db.VarChar(500)
  isActive           Boolean           @default(true)
  sortOrder          Int               @default(0)
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  facility           SportsFacility?   @relation(fields: [facilityId], references: [id])
  schedules          ClassSchedule[]
  registrations      ClassRegistration[]

  @@index([clubId])
  @@index([clubId, category])
  @@index([facilityId])
  @@map("sports_classes")
}

/// Class schedule instance
model ClassSchedule {
  id                 String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  classId            String            @db.Uuid
  courtId            String?           @db.Uuid

  scheduledDate      DateTime          @db.Date
  startTime          String            @db.VarChar(5)
  endTime            String            @db.VarChar(5)

  // Override class settings
  instructorName     String?           @db.VarChar(200)
  capacity           Int?

  // Status
  status             ClassScheduleStatus @default(SCHEDULED)
  registeredCount    Int               @default(0)
  waitlistCount      Int               @default(0)

  cancelReason       String?
  cancelledAt        DateTime?
  cancelledBy        String?           @db.Uuid

  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  sportsClass        SportsClass       @relation(fields: [classId], references: [id], onDelete: Cascade)
  court              Court?            @relation(fields: [courtId], references: [id])
  registrations      ClassRegistration[]

  @@index([classId])
  @@index([classId, scheduledDate])
  @@index([courtId, scheduledDate])
  @@map("class_schedules")
}

enum ClassScheduleStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

/// Class registration (member signs up for a class)
model ClassRegistration {
  id                 String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  scheduleId         String            @db.Uuid
  classId            String            @db.Uuid
  memberId           String            @db.Uuid

  status             RegistrationStatus @default(REGISTERED)
  waitlistPosition   Int?

  // Payment
  amountPaid         Decimal           @default(0) @db.Decimal(10, 2)
  isPaid             Boolean           @default(false)
  paidAt             DateTime?

  // Attendance
  checkedInAt        DateTime?
  noShowMarkedAt     DateTime?

  registeredAt       DateTime          @default(now())
  cancelledAt        DateTime?
  cancelReason       String?

  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  schedule           ClassSchedule     @relation(fields: [scheduleId], references: [id], onDelete: Cascade)
  sportsClass        SportsClass       @relation(fields: [classId], references: [id])
  member             Member            @relation(fields: [memberId], references: [id])

  @@unique([scheduleId, memberId])
  @@index([scheduleId])
  @@index([memberId])
  @@index([classId])
  @@map("class_registrations")
}

enum RegistrationStatus {
  REGISTERED
  WAITLISTED
  CHECKED_IN
  CANCELLED
  NO_SHOW
}
```

**Step 2: Add RentalItem and RentalCheckout models**

```prisma
/// Rental equipment item (racquets, balls, towels)
model RentalItem {
  id                 String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId             String            @db.Uuid
  name               String            @db.VarChar(200)
  code               String            @db.VarChar(20)
  category           String            @db.VarChar(100)
  description        String?

  // Inventory
  totalQuantity      Int               @default(1)
  availableQuantity  Int               @default(1)

  // Pricing
  pricePerHour       Decimal?          @db.Decimal(10, 2)
  pricePerSession    Decimal?          @db.Decimal(10, 2)
  pricePerDay        Decimal?          @db.Decimal(10, 2)
  depositAmount      Decimal?          @db.Decimal(10, 2)

  // Settings
  requiresDeposit    Boolean           @default(false)
  autoChargeOnReturn Boolean           @default(true)
  maxRentalHours     Int?

  imageUrl           String?           @db.VarChar(500)
  isActive           Boolean           @default(true)
  sortOrder          Int               @default(0)
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  checkouts          RentalCheckout[]

  @@unique([clubId, code])
  @@index([clubId])
  @@index([clubId, category])
  @@map("rental_items")
}

/// Rental checkout transaction
model RentalCheckout {
  id                 String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId             String            @db.Uuid
  rentalItemId       String            @db.Uuid
  memberId           String            @db.Uuid
  courtBookingId     String?           @db.Uuid

  quantity           Int               @default(1)

  // Timing
  checkoutTime       DateTime          @default(now())
  expectedReturnTime DateTime?
  actualReturnTime   DateTime?

  // Pricing
  priceType          RentalPriceType   @default(SESSION)
  unitPrice          Decimal           @db.Decimal(10, 2)
  totalAmount        Decimal           @db.Decimal(10, 2)
  depositAmount      Decimal           @default(0) @db.Decimal(10, 2)

  // Status
  status             RentalCheckoutStatus @default(CHECKED_OUT)
  isPaid             Boolean           @default(false)
  paidAt             DateTime?
  depositReturned    Boolean           @default(false)

  notes              String?
  checkedOutBy       String            @db.Uuid
  returnedBy         String?           @db.Uuid

  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  rentalItem         RentalItem        @relation(fields: [rentalItemId], references: [id])
  member             Member            @relation(fields: [memberId], references: [id])
  courtBooking       CourtBooking?     @relation(fields: [courtBookingId], references: [id])

  @@index([clubId])
  @@index([rentalItemId])
  @@index([memberId])
  @@index([courtBookingId])
  @@index([status])
  @@map("rental_checkouts")
}

enum RentalPriceType {
  HOUR
  SESSION
  DAY
}

enum RentalCheckoutStatus {
  CHECKED_OUT
  RETURNED
  OVERDUE
  LOST
}
```

**Step 3: Generate and migrate**

```bash
cd database && pnpm prisma generate && pnpm prisma migrate dev --name add_classes_and_rentals
```

**Step 4: Commit**

```bash
git add database/prisma/
git commit -m "feat(db): add Class and Rental models

- Add SportsClass model for class definitions
- Add ClassSchedule for scheduled instances
- Add ClassRegistration for member signups
- Add ClassScheduleStatus and RegistrationStatus enums
- Add RentalItem for equipment inventory
- Add RentalCheckout for tracking rentals
- Add RentalPriceType and RentalCheckoutStatus enums"
```

---

### Task 3: Add Sports GraphQL Types

**Files:**
- Create: `/apps/api/src/graphql/sports/sports.types.ts`

**Step 1: Create the types file**

```typescript
import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { SportType, CourtStatus, BookingStatus, ClassScheduleStatus, RegistrationStatus, RentalPriceType, RentalCheckoutStatus } from '@prisma/client';

// Register enums
registerEnumType(SportType, {
  name: 'SportType',
  description: 'Type of sport facility',
});

registerEnumType(CourtStatus, {
  name: 'CourtStatus',
  description: 'Current status of a court',
});

registerEnumType(ClassScheduleStatus, {
  name: 'ClassScheduleStatus',
  description: 'Status of a scheduled class',
});

registerEnumType(RegistrationStatus, {
  name: 'RegistrationStatus',
  description: 'Status of class registration',
});

registerEnumType(RentalPriceType, {
  name: 'RentalPriceType',
  description: 'Rental pricing type',
});

registerEnumType(RentalCheckoutStatus, {
  name: 'RentalCheckoutStatus',
  description: 'Status of rental checkout',
});

// ─────────────────────────────────────────────────────────────
// FACILITY & COURT TYPES
// ─────────────────────────────────────────────────────────────

@ObjectType()
export class SportsFacilityType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  code: string;

  @Field(() => SportType)
  sportType: SportType;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  location?: string;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  openTime: string;

  @Field()
  closeTime: string;

  @Field(() => Int)
  slotDurationMin: number;

  @Field(() => Int)
  maxAdvanceDays: number;

  @Field(() => Int)
  cancellationHours: number;

  @Field()
  memberOnly: boolean;

  @Field()
  allowGuests: boolean;

  @Field(() => Int)
  maxGuestsPerBooking: number;

  @Field()
  isActive: boolean;

  @Field(() => [CourtType], { nullable: true })
  courts?: CourtType[];

  @Field(() => Int, { nullable: true })
  courtCount?: number;
}

@ObjectType()
export class CourtType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  facilityId: string;

  @Field()
  name: string;

  @Field()
  code: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  capacity: number;

  @Field({ nullable: true })
  memberRate?: number;

  @Field({ nullable: true })
  guestRate?: number;

  @Field({ nullable: true })
  peakRate?: number;

  @Field()
  hasLighting: boolean;

  @Field()
  isIndoor: boolean;

  @Field({ nullable: true })
  surfaceType?: string;

  @Field(() => [String])
  amenities: string[];

  @Field(() => CourtStatus)
  status: CourtStatus;

  @Field({ nullable: true })
  maintenanceNote?: string;

  @Field()
  isActive: boolean;

  @Field(() => SportsFacilityType, { nullable: true })
  facility?: SportsFacilityType;
}

// ─────────────────────────────────────────────────────────────
// BOOKING TYPES
// ─────────────────────────────────────────────────────────────

@ObjectType()
export class CourtBookingGuestType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  guestFee: number;

  @Field()
  isPaid: boolean;
}

@ObjectType()
export class CourtBookingType {
  @Field(() => ID)
  id: string;

  @Field()
  bookingNumber: string;

  @Field(() => ID)
  courtId: string;

  @Field(() => ID)
  memberId: string;

  @Field()
  startTime: Date;

  @Field()
  endTime: Date;

  @Field(() => Int)
  durationMinutes: number;

  @Field(() => Int)
  playerCount: number;

  @Field(() => Int)
  guestCount: number;

  @Field()
  courtFee: number;

  @Field()
  guestFees: number;

  @Field()
  equipmentFees: number;

  @Field()
  totalAmount: number;

  @Field()
  taxAmount: number;

  @Field(() => BookingStatus)
  status: BookingStatus;

  @Field()
  isPaid: boolean;

  @Field({ nullable: true })
  paidAt?: Date;

  @Field({ nullable: true })
  checkedInAt?: Date;

  @Field({ nullable: true })
  checkedOutAt?: Date;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  createdAt: Date;

  @Field(() => CourtType, { nullable: true })
  court?: CourtType;

  @Field(() => [CourtBookingGuestType])
  guests: CourtBookingGuestType[];
}

// ─────────────────────────────────────────────────────────────
// CALENDAR SLOT TYPES
// ─────────────────────────────────────────────────────────────

@ObjectType()
export class CourtSlotType {
  @Field()
  time: string;

  @Field()
  date: string;

  @Field(() => ID)
  courtId: string;

  @Field()
  available: boolean;

  @Field()
  isPeakTime: boolean;

  @Field({ nullable: true })
  rate?: number;

  @Field(() => CourtBookingType, { nullable: true })
  booking?: CourtBookingType;
}

@ObjectType()
export class CourtCalendarType {
  @Field(() => ID)
  courtId: string;

  @Field()
  courtName: string;

  @Field(() => [CourtSlotType])
  slots: CourtSlotType[];
}

@ObjectType()
export class FacilityCalendarType {
  @Field(() => ID)
  facilityId: string;

  @Field()
  facilityName: string;

  @Field()
  date: string;

  @Field(() => [CourtCalendarType])
  courts: CourtCalendarType[];
}

// ─────────────────────────────────────────────────────────────
// CLASS TYPES
// ─────────────────────────────────────────────────────────────

@ObjectType()
export class SportsClassType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  category: string;

  @Field(() => Int)
  durationMinutes: number;

  @Field(() => Int)
  capacity: number;

  @Field()
  memberPrice: number;

  @Field({ nullable: true })
  guestPrice?: number;

  @Field({ nullable: true })
  instructorName?: string;

  @Field(() => Int)
  advanceBookingDays: number;

  @Field(() => Int)
  cancellationHours: number;

  @Field()
  waitlistEnabled: boolean;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  isActive: boolean;

  @Field(() => SportsFacilityType, { nullable: true })
  facility?: SportsFacilityType;
}

@ObjectType()
export class ClassScheduleType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  classId: string;

  @Field()
  scheduledDate: Date;

  @Field()
  startTime: string;

  @Field()
  endTime: string;

  @Field({ nullable: true })
  instructorName?: string;

  @Field(() => Int)
  capacity: number;

  @Field(() => ClassScheduleStatus)
  status: ClassScheduleStatus;

  @Field(() => Int)
  registeredCount: number;

  @Field(() => Int)
  waitlistCount: number;

  @Field(() => Int)
  availableSpots: number;

  @Field(() => SportsClassType, { nullable: true })
  sportsClass?: SportsClassType;

  @Field(() => CourtType, { nullable: true })
  court?: CourtType;
}

@ObjectType()
export class ClassRegistrationType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  scheduleId: string;

  @Field(() => ID)
  memberId: string;

  @Field()
  memberName: string;

  @Field(() => RegistrationStatus)
  status: RegistrationStatus;

  @Field(() => Int, { nullable: true })
  waitlistPosition?: number;

  @Field()
  isPaid: boolean;

  @Field()
  amountPaid: number;

  @Field({ nullable: true })
  checkedInAt?: Date;

  @Field()
  registeredAt: Date;
}

// ─────────────────────────────────────────────────────────────
// RENTAL TYPES
// ─────────────────────────────────────────────────────────────

@ObjectType()
export class RentalItemType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  code: string;

  @Field()
  category: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  totalQuantity: number;

  @Field(() => Int)
  availableQuantity: number;

  @Field({ nullable: true })
  pricePerHour?: number;

  @Field({ nullable: true })
  pricePerSession?: number;

  @Field({ nullable: true })
  pricePerDay?: number;

  @Field({ nullable: true })
  depositAmount?: number;

  @Field()
  requiresDeposit: boolean;

  @Field({ nullable: true })
  imageUrl?: string;

  @Field()
  isActive: boolean;
}

@ObjectType()
export class RentalCheckoutType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  rentalItemId: string;

  @Field(() => ID)
  memberId: string;

  @Field()
  memberName: string;

  @Field(() => Int)
  quantity: number;

  @Field()
  checkoutTime: Date;

  @Field({ nullable: true })
  expectedReturnTime?: Date;

  @Field({ nullable: true })
  actualReturnTime?: Date;

  @Field(() => RentalPriceType)
  priceType: RentalPriceType;

  @Field()
  unitPrice: number;

  @Field()
  totalAmount: number;

  @Field()
  depositAmount: number;

  @Field(() => RentalCheckoutStatus)
  status: RentalCheckoutStatus;

  @Field()
  isPaid: boolean;

  @Field()
  depositReturned: boolean;

  @Field(() => RentalItemType, { nullable: true })
  rentalItem?: RentalItemType;
}

// ─────────────────────────────────────────────────────────────
// MUTATION RESPONSE TYPES
// ─────────────────────────────────────────────────────────────

@ObjectType()
export class BookingMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field(() => CourtBookingType, { nullable: true })
  booking?: CourtBookingType;
}

@ObjectType()
export class RegistrationMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field(() => ClassRegistrationType, { nullable: true })
  registration?: ClassRegistrationType;

  @Field(() => Int, { nullable: true })
  waitlistPosition?: number;
}

@ObjectType()
export class RentalMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;

  @Field(() => RentalCheckoutType, { nullable: true })
  checkout?: RentalCheckoutType;
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/sports/
git commit -m "feat(api): add Sports GraphQL types

- Add SportsFacilityType and CourtType
- Add CourtBookingType and CourtBookingGuestType
- Add CourtSlotType and calendar types
- Add SportsClassType and ClassScheduleType
- Add ClassRegistrationType for signups
- Add RentalItemType and RentalCheckoutType
- Add mutation response types
- Register all enums for GraphQL"
```

---

### Task 4: Add Sports GraphQL Inputs

**Files:**
- Create: `/apps/api/src/graphql/sports/sports.input.ts`

**Step 1: Create the inputs file**

```typescript
import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsString, IsNumber, IsOptional, IsBoolean, IsEnum, IsArray, IsDate, Min, Max } from 'class-validator';
import { SportType, CourtStatus, RentalPriceType } from '@prisma/client';

// ─────────────────────────────────────────────────────────────
// FACILITY & COURT INPUTS
// ─────────────────────────────────────────────────────────────

@InputType()
export class CreateSportsFacilityInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  code: string;

  @Field(() => SportType)
  @IsEnum(SportType)
  sportType: SportType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  location?: string;

  @Field({ nullable: true, defaultValue: '06:00' })
  @IsOptional()
  openTime?: string;

  @Field({ nullable: true, defaultValue: '22:00' })
  @IsOptional()
  closeTime?: string;

  @Field(() => Int, { nullable: true, defaultValue: 60 })
  @IsOptional()
  @IsNumber()
  slotDurationMin?: number;

  @Field(() => Int, { nullable: true, defaultValue: 7 })
  @IsOptional()
  @IsNumber()
  maxAdvanceDays?: number;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  memberOnly?: boolean;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  allowGuests?: boolean;
}

@InputType()
export class CreateCourtInput {
  @Field(() => ID)
  @IsString()
  facilityId: string;

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

  @Field(() => Int, { nullable: true, defaultValue: 4 })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  memberRate?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  guestRate?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  peakRate?: number;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  hasLighting?: boolean;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isIndoor?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  surfaceType?: string;
}

@InputType()
export class UpdateCourtStatusInput {
  @Field(() => ID)
  @IsString()
  courtId: string;

  @Field(() => CourtStatus)
  @IsEnum(CourtStatus)
  status: CourtStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  maintenanceNote?: string;
}

// ─────────────────────────────────────────────────────────────
// BOOKING INPUTS
// ─────────────────────────────────────────────────────────────

@InputType()
export class GuestInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;
}

@InputType()
export class CreateCourtBookingInput {
  @Field(() => ID)
  @IsString()
  courtId: string;

  @Field(() => ID)
  @IsString()
  memberId: string;

  @Field()
  startTime: Date;

  @Field(() => Int)
  @IsNumber()
  @Min(30)
  durationMinutes: number;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsNumber()
  playerCount?: number;

  @Field(() => [GuestInput], { nullable: true })
  @IsOptional()
  guests?: GuestInput[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class CancelBookingInput {
  @Field(() => ID)
  @IsString()
  bookingId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;
}

@InputType()
export class CourtCalendarInput {
  @Field(() => ID)
  @IsString()
  facilityId: string;

  @Field()
  @IsString()
  date: string; // YYYY-MM-DD

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  courtId?: string;
}

// ─────────────────────────────────────────────────────────────
// CLASS INPUTS
// ─────────────────────────────────────────────────────────────

@InputType()
export class CreateSportsClassInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  facilityId?: string;

  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field()
  @IsString()
  category: string;

  @Field(() => Int, { nullable: true, defaultValue: 60 })
  @IsOptional()
  @IsNumber()
  durationMinutes?: number;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @Field()
  @IsNumber()
  memberPrice: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  guestPrice?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  instructorName?: string;
}

@InputType()
export class CreateClassScheduleInput {
  @Field(() => ID)
  @IsString()
  classId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  courtId?: string;

  @Field()
  @IsString()
  scheduledDate: string; // YYYY-MM-DD

  @Field()
  @IsString()
  startTime: string; // HH:MM

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  instructorName?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  capacity?: number;
}

@InputType()
export class RegisterForClassInput {
  @Field(() => ID)
  @IsString()
  scheduleId: string;

  @Field(() => ID)
  @IsString()
  memberId: string;
}

@InputType()
export class CancelRegistrationInput {
  @Field(() => ID)
  @IsString()
  registrationId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;
}

// ─────────────────────────────────────────────────────────────
// RENTAL INPUTS
// ─────────────────────────────────────────────────────────────

@InputType()
export class CreateRentalItemInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  code: string;

  @Field()
  @IsString()
  category: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsNumber()
  totalQuantity?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  pricePerHour?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  pricePerSession?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  pricePerDay?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  depositAmount?: number;

  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  requiresDeposit?: boolean;
}

@InputType()
export class CheckoutRentalInput {
  @Field(() => ID)
  @IsString()
  rentalItemId: string;

  @Field(() => ID)
  @IsString()
  memberId: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  courtBookingId?: string;

  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @Field(() => RentalPriceType, { nullable: true, defaultValue: RentalPriceType.SESSION })
  @IsOptional()
  @IsEnum(RentalPriceType)
  priceType?: RentalPriceType;

  @Field({ nullable: true })
  @IsOptional()
  expectedReturnTime?: Date;
}

@InputType()
export class ReturnRentalInput {
  @Field(() => ID)
  @IsString()
  checkoutId: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/sports/sports.input.ts
git commit -m "feat(api): add Sports GraphQL inputs

- Add CreateSportsFacilityInput and CreateCourtInput
- Add UpdateCourtStatusInput for maintenance
- Add CreateCourtBookingInput with guest support
- Add CourtCalendarInput for calendar queries
- Add CreateSportsClassInput and CreateClassScheduleInput
- Add RegisterForClassInput and CancelRegistrationInput
- Add CreateRentalItemInput and CheckoutRentalInput
- Add ReturnRentalInput for equipment returns"
```

---

### Task 5: Create Court Booking Service

**Files:**
- Create: `/apps/api/src/graphql/sports/court-booking.service.ts`

**Step 1: Create the service**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { BookingStatus, Prisma } from '@prisma/client';
import { CreateCourtBookingInput, CancelBookingInput, CourtCalendarInput } from './sports.input';
import { addMinutes, format, parse, eachHourOfInterval, startOfDay, endOfDay } from 'date-fns';

interface BookingResult {
  success: boolean;
  error?: string;
  booking?: any;
}

@Injectable()
export class CourtBookingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate unique booking number
   */
  private async generateBookingNumber(clubId: string): Promise<string> {
    const today = format(new Date(), 'yyyyMMdd');
    const count = await this.prisma.courtBooking.count({
      where: {
        clubId,
        bookingNumber: { startsWith: `CB${today}` },
      },
    });
    return `CB${today}${String(count + 1).padStart(4, '0')}`;
  }

  /**
   * Check if a court slot is available
   */
  async checkAvailability(
    courtId: string,
    startTime: Date,
    durationMinutes: number,
    excludeBookingId?: string,
  ): Promise<{ available: boolean; conflicts: any[] }> {
    const endTime = addMinutes(startTime, durationMinutes);

    const conflicts = await this.prisma.courtBooking.findMany({
      where: {
        courtId,
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
        id: excludeBookingId ? { not: excludeBookingId } : undefined,
        OR: [
          { startTime: { lt: endTime }, endTime: { gt: startTime } },
        ],
      },
    });

    return {
      available: conflicts.length === 0,
      conflicts,
    };
  }

  /**
   * Calculate booking fees
   */
  async calculateFees(
    courtId: string,
    durationMinutes: number,
    guestCount: number,
    startTime: Date,
  ): Promise<{ courtFee: number; guestFees: number; totalAmount: number }> {
    const court = await this.prisma.court.findUnique({
      where: { id: courtId },
      include: { facility: true },
    });

    if (!court) {
      throw new Error('Court not found');
    }

    // Calculate court fee (per hour basis)
    const hours = durationMinutes / 60;
    const hourlyRate = Number(court.memberRate) || 500; // Default rate
    const courtFee = hours * hourlyRate;

    // Calculate guest fees
    const guestRate = Number(court.guestRate) || 200; // Default guest fee
    const guestFees = guestCount * guestRate;

    return {
      courtFee: Math.round(courtFee * 100) / 100,
      guestFees: Math.round(guestFees * 100) / 100,
      totalAmount: Math.round((courtFee + guestFees) * 100) / 100,
    };
  }

  /**
   * Create a court booking
   */
  async createBooking(clubId: string, input: CreateCourtBookingInput, createdBy: string): Promise<BookingResult> {
    // Check availability
    const { available, conflicts } = await this.checkAvailability(
      input.courtId,
      input.startTime,
      input.durationMinutes,
    );

    if (!available) {
      return {
        success: false,
        error: `Court is not available at this time. Conflicts with ${conflicts.length} existing booking(s).`,
      };
    }

    // Get court and facility for validation
    const court = await this.prisma.court.findUnique({
      where: { id: input.courtId },
      include: { facility: true },
    });

    if (!court || !court.facility) {
      return { success: false, error: 'Court not found' };
    }

    // Check guest limits
    const guestCount = input.guests?.length || 0;
    if (guestCount > court.facility.maxGuestsPerBooking) {
      return {
        success: false,
        error: `Maximum ${court.facility.maxGuestsPerBooking} guests allowed per booking`,
      };
    }

    // Calculate fees
    const fees = await this.calculateFees(
      input.courtId,
      input.durationMinutes,
      guestCount,
      input.startTime,
    );

    // Generate booking number
    const bookingNumber = await this.generateBookingNumber(clubId);

    // Create booking with guests
    const booking = await this.prisma.courtBooking.create({
      data: {
        clubId,
        bookingNumber,
        courtId: input.courtId,
        memberId: input.memberId,
        startTime: input.startTime,
        endTime: addMinutes(input.startTime, input.durationMinutes),
        durationMinutes: input.durationMinutes,
        playerCount: input.playerCount || 1,
        guestCount,
        courtFee: fees.courtFee,
        guestFees: fees.guestFees,
        totalAmount: fees.totalAmount,
        status: BookingStatus.CONFIRMED,
        notes: input.notes,
        createdBy,
        guests: {
          create: input.guests?.map(guest => ({
            name: guest.name,
            email: guest.email,
            phone: guest.phone,
            guestFee: Number(court.guestRate) || 200,
          })) || [],
        },
      },
      include: {
        court: { include: { facility: true } },
        guests: true,
      },
    });

    return { success: true, booking };
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(input: CancelBookingInput, cancelledBy: string): Promise<BookingResult> {
    const booking = await this.prisma.courtBooking.findUnique({
      where: { id: input.bookingId },
    });

    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }

    if (booking.status === BookingStatus.CANCELLED) {
      return { success: false, error: 'Booking is already cancelled' };
    }

    const updated = await this.prisma.courtBooking.update({
      where: { id: input.bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        cancelReason: input.reason,
        cancelledAt: new Date(),
        cancelledBy,
      },
      include: {
        court: { include: { facility: true } },
        guests: true,
      },
    });

    return { success: true, booking: updated };
  }

  /**
   * Get court calendar with slots and bookings
   */
  async getCourtCalendar(clubId: string, input: CourtCalendarInput) {
    const facility = await this.prisma.sportsFacility.findUnique({
      where: { id: input.facilityId },
      include: {
        courts: {
          where: input.courtId ? { id: input.courtId } : { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!facility) {
      throw new Error('Facility not found');
    }

    const date = parse(input.date, 'yyyy-MM-dd', new Date());
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    // Get all bookings for the day
    const bookings = await this.prisma.courtBooking.findMany({
      where: {
        clubId,
        courtId: { in: facility.courts.map(c => c.id) },
        startTime: { gte: dayStart, lt: dayEnd },
        status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN] },
      },
      include: {
        court: true,
        guests: true,
      },
    });

    // Generate time slots based on facility settings
    const openTime = parse(facility.openTime, 'HH:mm', date);
    const closeTime = parse(facility.closeTime, 'HH:mm', date);
    const slotDuration = facility.slotDurationMin;

    const courts = facility.courts.map(court => {
      const slots: any[] = [];
      let currentTime = openTime;

      while (currentTime < closeTime) {
        const timeStr = format(currentTime, 'HH:mm');
        const slotEnd = addMinutes(currentTime, slotDuration);

        // Find booking for this slot
        const booking = bookings.find(
          b => b.courtId === court.id &&
               b.startTime <= currentTime &&
               b.endTime > currentTime
        );

        slots.push({
          time: timeStr,
          date: input.date,
          courtId: court.id,
          available: !booking,
          isPeakTime: this.isPeakTime(currentTime),
          rate: booking ? null : Number(court.memberRate),
          booking: booking || null,
        });

        currentTime = slotEnd;
      }

      return {
        courtId: court.id,
        courtName: court.name,
        slots,
      };
    });

    return {
      facilityId: facility.id,
      facilityName: facility.name,
      date: input.date,
      courts,
    };
  }

  /**
   * Check if time is peak time (simplified logic)
   */
  private isPeakTime(time: Date): boolean {
    const hour = time.getHours();
    const day = time.getDay();

    // Weekend all day is peak
    if (day === 0 || day === 6) return true;

    // Weekday peak hours: 17:00-21:00
    return hour >= 17 && hour < 21;
  }

  /**
   * Check in a booking
   */
  async checkInBooking(bookingId: string): Promise<BookingResult> {
    const booking = await this.prisma.courtBooking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CHECKED_IN,
        checkedInAt: new Date(),
      },
      include: {
        court: { include: { facility: true } },
        guests: true,
      },
    });

    return { success: true, booking };
  }

  /**
   * Complete/check out a booking
   */
  async checkOutBooking(bookingId: string): Promise<BookingResult> {
    const booking = await this.prisma.courtBooking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.COMPLETED,
        checkedOutAt: new Date(),
      },
      include: {
        court: { include: { facility: true } },
        guests: true,
      },
    });

    return { success: true, booking };
  }

  /**
   * Get member's upcoming bookings
   */
  async getMemberBookings(memberId: string, includeHistory = false) {
    const where: Prisma.CourtBookingWhereInput = {
      memberId,
    };

    if (!includeHistory) {
      where.startTime = { gte: new Date() };
      where.status = { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] };
    }

    return this.prisma.courtBooking.findMany({
      where,
      include: {
        court: { include: { facility: true } },
        guests: true,
      },
      orderBy: { startTime: includeHistory ? 'desc' : 'asc' },
      take: 50,
    });
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/sports/court-booking.service.ts
git commit -m "feat(api): add CourtBookingService

- Add booking number generation
- Add availability checking with conflict detection
- Add fee calculation for court and guests
- Add createBooking with guest support
- Add cancelBooking with reason tracking
- Add getCourtCalendar with time slot generation
- Add checkInBooking and checkOutBooking
- Add getMemberBookings for member view"
```

---

### Task 6: Create Class Registration Service

**Files:**
- Create: `/apps/api/src/graphql/sports/class-registration.service.ts`

**Step 1: Create the service**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { ClassScheduleStatus, RegistrationStatus } from '@prisma/client';
import { RegisterForClassInput, CancelRegistrationInput, CreateClassScheduleInput } from './sports.input';
import { addMinutes, parse, format } from 'date-fns';

interface RegistrationResult {
  success: boolean;
  error?: string;
  registration?: any;
  waitlistPosition?: number;
}

@Injectable()
export class ClassRegistrationService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get class schedule with capacity info
   */
  async getScheduleWithCapacity(scheduleId: string) {
    const schedule = await this.prisma.classSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        sportsClass: true,
        court: true,
        registrations: {
          where: { status: { in: [RegistrationStatus.REGISTERED, RegistrationStatus.CHECKED_IN] } },
        },
      },
    });

    if (!schedule) return null;

    const capacity = schedule.capacity || schedule.sportsClass.capacity;
    const registeredCount = schedule.registrations.length;
    const availableSpots = Math.max(0, capacity - registeredCount);

    return {
      ...schedule,
      capacity,
      registeredCount,
      availableSpots,
    };
  }

  /**
   * Register a member for a class
   */
  async registerForClass(input: RegisterForClassInput): Promise<RegistrationResult> {
    const schedule = await this.getScheduleWithCapacity(input.scheduleId);

    if (!schedule) {
      return { success: false, error: 'Class schedule not found' };
    }

    if (schedule.status === ClassScheduleStatus.CANCELLED) {
      return { success: false, error: 'This class has been cancelled' };
    }

    // Check if already registered
    const existing = await this.prisma.classRegistration.findUnique({
      where: {
        scheduleId_memberId: {
          scheduleId: input.scheduleId,
          memberId: input.memberId,
        },
      },
    });

    if (existing) {
      if (existing.status === RegistrationStatus.CANCELLED) {
        // Re-register
        return this.reRegister(existing.id, schedule);
      }
      return { success: false, error: 'Already registered for this class' };
    }

    // Check capacity
    const isWaitlist = schedule.availableSpots === 0;

    if (isWaitlist && !schedule.sportsClass.waitlistEnabled) {
      return { success: false, error: 'Class is full and waitlist is not available' };
    }

    // Get waitlist position if needed
    let waitlistPosition: number | undefined;
    if (isWaitlist) {
      const waitlistCount = await this.prisma.classRegistration.count({
        where: {
          scheduleId: input.scheduleId,
          status: RegistrationStatus.WAITLISTED,
        },
      });

      if (waitlistCount >= schedule.sportsClass.maxWaitlist) {
        return { success: false, error: 'Waitlist is full' };
      }

      waitlistPosition = waitlistCount + 1;
    }

    // Create registration
    const registration = await this.prisma.classRegistration.create({
      data: {
        scheduleId: input.scheduleId,
        classId: schedule.classId,
        memberId: input.memberId,
        status: isWaitlist ? RegistrationStatus.WAITLISTED : RegistrationStatus.REGISTERED,
        waitlistPosition,
        amountPaid: 0,
        isPaid: false,
      },
      include: {
        schedule: {
          include: {
            sportsClass: true,
          },
        },
        member: true,
      },
    });

    // Update schedule counts
    await this.updateScheduleCounts(input.scheduleId);

    return {
      success: true,
      registration: {
        ...registration,
        memberName: `${registration.member.firstName} ${registration.member.lastName}`,
      },
      waitlistPosition,
    };
  }

  /**
   * Re-register a cancelled registration
   */
  private async reRegister(registrationId: string, schedule: any): Promise<RegistrationResult> {
    const isWaitlist = schedule.availableSpots === 0;

    let waitlistPosition: number | undefined;
    if (isWaitlist) {
      const waitlistCount = await this.prisma.classRegistration.count({
        where: {
          scheduleId: schedule.id,
          status: RegistrationStatus.WAITLISTED,
        },
      });
      waitlistPosition = waitlistCount + 1;
    }

    const registration = await this.prisma.classRegistration.update({
      where: { id: registrationId },
      data: {
        status: isWaitlist ? RegistrationStatus.WAITLISTED : RegistrationStatus.REGISTERED,
        waitlistPosition,
        cancelledAt: null,
        cancelReason: null,
      },
      include: {
        schedule: { include: { sportsClass: true } },
        member: true,
      },
    });

    await this.updateScheduleCounts(schedule.id);

    return {
      success: true,
      registration: {
        ...registration,
        memberName: `${registration.member.firstName} ${registration.member.lastName}`,
      },
      waitlistPosition,
    };
  }

  /**
   * Cancel a registration
   */
  async cancelRegistration(input: CancelRegistrationInput): Promise<RegistrationResult> {
    const registration = await this.prisma.classRegistration.findUnique({
      where: { id: input.registrationId },
      include: { schedule: true },
    });

    if (!registration) {
      return { success: false, error: 'Registration not found' };
    }

    if (registration.status === RegistrationStatus.CANCELLED) {
      return { success: false, error: 'Registration is already cancelled' };
    }

    const wasRegistered = registration.status === RegistrationStatus.REGISTERED;

    const updated = await this.prisma.classRegistration.update({
      where: { id: input.registrationId },
      data: {
        status: RegistrationStatus.CANCELLED,
        cancelledAt: new Date(),
        cancelReason: input.reason,
        waitlistPosition: null,
      },
      include: {
        schedule: { include: { sportsClass: true } },
        member: true,
      },
    });

    // Update schedule counts
    await this.updateScheduleCounts(registration.scheduleId);

    // If was registered (not waitlist), promote first waitlist person
    if (wasRegistered) {
      await this.promoteFromWaitlist(registration.scheduleId);
    }

    return {
      success: true,
      registration: {
        ...updated,
        memberName: `${updated.member.firstName} ${updated.member.lastName}`,
      },
    };
  }

  /**
   * Promote first person from waitlist to registered
   */
  private async promoteFromWaitlist(scheduleId: string): Promise<void> {
    const nextInLine = await this.prisma.classRegistration.findFirst({
      where: {
        scheduleId,
        status: RegistrationStatus.WAITLISTED,
      },
      orderBy: { waitlistPosition: 'asc' },
    });

    if (nextInLine) {
      await this.prisma.classRegistration.update({
        where: { id: nextInLine.id },
        data: {
          status: RegistrationStatus.REGISTERED,
          waitlistPosition: null,
        },
      });

      // Reorder remaining waitlist
      await this.reorderWaitlist(scheduleId);
      await this.updateScheduleCounts(scheduleId);

      // TODO: Send notification to promoted member
    }
  }

  /**
   * Reorder waitlist positions after changes
   */
  private async reorderWaitlist(scheduleId: string): Promise<void> {
    const waitlisted = await this.prisma.classRegistration.findMany({
      where: {
        scheduleId,
        status: RegistrationStatus.WAITLISTED,
      },
      orderBy: { waitlistPosition: 'asc' },
    });

    for (let i = 0; i < waitlisted.length; i++) {
      await this.prisma.classRegistration.update({
        where: { id: waitlisted[i].id },
        data: { waitlistPosition: i + 1 },
      });
    }
  }

  /**
   * Update schedule registration counts
   */
  private async updateScheduleCounts(scheduleId: string): Promise<void> {
    const registeredCount = await this.prisma.classRegistration.count({
      where: {
        scheduleId,
        status: { in: [RegistrationStatus.REGISTERED, RegistrationStatus.CHECKED_IN] },
      },
    });

    const waitlistCount = await this.prisma.classRegistration.count({
      where: {
        scheduleId,
        status: RegistrationStatus.WAITLISTED,
      },
    });

    await this.prisma.classSchedule.update({
      where: { id: scheduleId },
      data: { registeredCount, waitlistCount },
    });
  }

  /**
   * Check in a registration
   */
  async checkInRegistration(registrationId: string): Promise<RegistrationResult> {
    const registration = await this.prisma.classRegistration.update({
      where: { id: registrationId },
      data: {
        status: RegistrationStatus.CHECKED_IN,
        checkedInAt: new Date(),
      },
      include: {
        schedule: { include: { sportsClass: true } },
        member: true,
      },
    });

    return {
      success: true,
      registration: {
        ...registration,
        memberName: `${registration.member.firstName} ${registration.member.lastName}`,
      },
    };
  }

  /**
   * Create a class schedule
   */
  async createSchedule(clubId: string, input: CreateClassScheduleInput) {
    const sportsClass = await this.prisma.sportsClass.findUnique({
      where: { id: input.classId },
    });

    if (!sportsClass) {
      throw new Error('Class not found');
    }

    const scheduledDate = parse(input.scheduledDate, 'yyyy-MM-dd', new Date());
    const startTime = parse(input.startTime, 'HH:mm', scheduledDate);
    const endTime = addMinutes(startTime, sportsClass.durationMinutes);

    return this.prisma.classSchedule.create({
      data: {
        classId: input.classId,
        courtId: input.courtId,
        scheduledDate,
        startTime: input.startTime,
        endTime: format(endTime, 'HH:mm'),
        instructorName: input.instructorName || sportsClass.instructorName,
        capacity: input.capacity || sportsClass.capacity,
        status: ClassScheduleStatus.SCHEDULED,
      },
      include: {
        sportsClass: true,
        court: true,
      },
    });
  }

  /**
   * Get upcoming class schedules
   */
  async getUpcomingSchedules(clubId: string, facilityId?: string, limit = 20) {
    return this.prisma.classSchedule.findMany({
      where: {
        sportsClass: {
          clubId,
          facilityId: facilityId || undefined,
        },
        scheduledDate: { gte: new Date() },
        status: ClassScheduleStatus.SCHEDULED,
      },
      include: {
        sportsClass: { include: { facility: true } },
        court: true,
      },
      orderBy: [{ scheduledDate: 'asc' }, { startTime: 'asc' }],
      take: limit,
    });
  }

  /**
   * Get registrations for a schedule
   */
  async getScheduleRegistrations(scheduleId: string) {
    return this.prisma.classRegistration.findMany({
      where: { scheduleId },
      include: {
        member: true,
      },
      orderBy: [
        { status: 'asc' },
        { waitlistPosition: 'asc' },
        { registeredAt: 'asc' },
      ],
    });
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/sports/class-registration.service.ts
git commit -m "feat(api): add ClassRegistrationService

- Add getScheduleWithCapacity for availability info
- Add registerForClass with waitlist support
- Add cancelRegistration with waitlist promotion
- Add promoteFromWaitlist and reorderWaitlist helpers
- Add checkInRegistration for attendance
- Add createSchedule for scheduling classes
- Add getUpcomingSchedules and getScheduleRegistrations"
```

---

### Task 7: Create Rental Service

**Files:**
- Create: `/apps/api/src/graphql/sports/rental.service.ts`

**Step 1: Create the service**

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { RentalPriceType, RentalCheckoutStatus } from '@prisma/client';
import { CreateRentalItemInput, CheckoutRentalInput, ReturnRentalInput } from './sports.input';
import { addHours } from 'date-fns';

interface RentalResult {
  success: boolean;
  error?: string;
  checkout?: any;
}

@Injectable()
export class RentalService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get available rental items
   */
  async getAvailableItems(clubId: string, category?: string) {
    return this.prisma.rentalItem.findMany({
      where: {
        clubId,
        category: category || undefined,
        isActive: true,
        availableQuantity: { gt: 0 },
      },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Get all rental items for a club
   */
  async getAllItems(clubId: string) {
    return this.prisma.rentalItem.findMany({
      where: { clubId },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  /**
   * Create a rental item
   */
  async createItem(clubId: string, input: CreateRentalItemInput) {
    return this.prisma.rentalItem.create({
      data: {
        clubId,
        name: input.name,
        code: input.code,
        category: input.category,
        description: input.description,
        totalQuantity: input.totalQuantity || 1,
        availableQuantity: input.totalQuantity || 1,
        pricePerHour: input.pricePerHour,
        pricePerSession: input.pricePerSession,
        pricePerDay: input.pricePerDay,
        depositAmount: input.depositAmount,
        requiresDeposit: input.requiresDeposit || false,
      },
    });
  }

  /**
   * Calculate rental price
   */
  calculatePrice(item: any, priceType: RentalPriceType, quantity: number): number {
    let unitPrice = 0;

    switch (priceType) {
      case RentalPriceType.HOUR:
        unitPrice = Number(item.pricePerHour) || 0;
        break;
      case RentalPriceType.SESSION:
        unitPrice = Number(item.pricePerSession) || 0;
        break;
      case RentalPriceType.DAY:
        unitPrice = Number(item.pricePerDay) || 0;
        break;
    }

    return unitPrice * quantity;
  }

  /**
   * Checkout a rental item
   */
  async checkoutItem(clubId: string, input: CheckoutRentalInput, checkedOutBy: string): Promise<RentalResult> {
    const item = await this.prisma.rentalItem.findUnique({
      where: { id: input.rentalItemId },
    });

    if (!item) {
      return { success: false, error: 'Rental item not found' };
    }

    const quantity = input.quantity || 1;

    if (item.availableQuantity < quantity) {
      return {
        success: false,
        error: `Only ${item.availableQuantity} available. Requested ${quantity}.`,
      };
    }

    const priceType = input.priceType || RentalPriceType.SESSION;
    const unitPrice = this.getUnitPrice(item, priceType);
    const totalAmount = unitPrice * quantity;
    const depositAmount = item.requiresDeposit ? Number(item.depositAmount) || 0 : 0;

    // Calculate expected return time based on price type
    let expectedReturnTime = input.expectedReturnTime;
    if (!expectedReturnTime) {
      switch (priceType) {
        case RentalPriceType.HOUR:
          expectedReturnTime = addHours(new Date(), 1);
          break;
        case RentalPriceType.SESSION:
          expectedReturnTime = addHours(new Date(), 2);
          break;
        case RentalPriceType.DAY:
          expectedReturnTime = addHours(new Date(), 24);
          break;
      }
    }

    // Create checkout and update inventory in transaction
    const checkout = await this.prisma.$transaction(async (tx) => {
      // Decrease available quantity
      await tx.rentalItem.update({
        where: { id: input.rentalItemId },
        data: { availableQuantity: { decrement: quantity } },
      });

      // Create checkout record
      return tx.rentalCheckout.create({
        data: {
          clubId,
          rentalItemId: input.rentalItemId,
          memberId: input.memberId,
          courtBookingId: input.courtBookingId,
          quantity,
          priceType,
          unitPrice,
          totalAmount,
          depositAmount,
          expectedReturnTime,
          status: RentalCheckoutStatus.CHECKED_OUT,
          checkedOutBy,
        },
        include: {
          rentalItem: true,
          member: true,
        },
      });
    });

    return {
      success: true,
      checkout: {
        ...checkout,
        memberName: `${checkout.member.firstName} ${checkout.member.lastName}`,
      },
    };
  }

  /**
   * Get unit price based on price type
   */
  private getUnitPrice(item: any, priceType: RentalPriceType): number {
    switch (priceType) {
      case RentalPriceType.HOUR:
        return Number(item.pricePerHour) || 0;
      case RentalPriceType.SESSION:
        return Number(item.pricePerSession) || 0;
      case RentalPriceType.DAY:
        return Number(item.pricePerDay) || 0;
      default:
        return 0;
    }
  }

  /**
   * Return a rental item
   */
  async returnItem(input: ReturnRentalInput, returnedBy: string): Promise<RentalResult> {
    const checkout = await this.prisma.rentalCheckout.findUnique({
      where: { id: input.checkoutId },
      include: { rentalItem: true },
    });

    if (!checkout) {
      return { success: false, error: 'Checkout not found' };
    }

    if (checkout.status === RentalCheckoutStatus.RETURNED) {
      return { success: false, error: 'Item has already been returned' };
    }

    // Update checkout and inventory in transaction
    const updated = await this.prisma.$transaction(async (tx) => {
      // Increase available quantity
      await tx.rentalItem.update({
        where: { id: checkout.rentalItemId },
        data: { availableQuantity: { increment: checkout.quantity } },
      });

      // Update checkout record
      return tx.rentalCheckout.update({
        where: { id: input.checkoutId },
        data: {
          status: RentalCheckoutStatus.RETURNED,
          actualReturnTime: new Date(),
          returnedBy,
        },
        include: {
          rentalItem: true,
          member: true,
        },
      });
    });

    return {
      success: true,
      checkout: {
        ...updated,
        memberName: `${updated.member.firstName} ${updated.member.lastName}`,
      },
    };
  }

  /**
   * Get active checkouts for a member
   */
  async getMemberCheckouts(memberId: string) {
    return this.prisma.rentalCheckout.findMany({
      where: {
        memberId,
        status: RentalCheckoutStatus.CHECKED_OUT,
      },
      include: {
        rentalItem: true,
      },
      orderBy: { checkoutTime: 'desc' },
    });
  }

  /**
   * Get all active checkouts for a club
   */
  async getActiveCheckouts(clubId: string) {
    const checkouts = await this.prisma.rentalCheckout.findMany({
      where: {
        clubId,
        status: RentalCheckoutStatus.CHECKED_OUT,
      },
      include: {
        rentalItem: true,
        member: true,
        courtBooking: true,
      },
      orderBy: { checkoutTime: 'desc' },
    });

    return checkouts.map(c => ({
      ...c,
      memberName: `${c.member.firstName} ${c.member.lastName}`,
    }));
  }

  /**
   * Mark overdue rentals
   */
  async markOverdueRentals(clubId: string): Promise<number> {
    const result = await this.prisma.rentalCheckout.updateMany({
      where: {
        clubId,
        status: RentalCheckoutStatus.CHECKED_OUT,
        expectedReturnTime: { lt: new Date() },
      },
      data: {
        status: RentalCheckoutStatus.OVERDUE,
      },
    });

    return result.count;
  }

  /**
   * Get rental categories
   */
  async getCategories(clubId: string): Promise<string[]> {
    const items = await this.prisma.rentalItem.findMany({
      where: { clubId, isActive: true },
      select: { category: true },
      distinct: ['category'],
    });

    return items.map(i => i.category);
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/sports/rental.service.ts
git commit -m "feat(api): add RentalService

- Add getAvailableItems and getAllItems queries
- Add createItem for inventory management
- Add checkoutItem with quantity and price calculation
- Add returnItem with inventory restoration
- Add getMemberCheckouts and getActiveCheckouts
- Add markOverdueRentals for scheduled cleanup
- Add getCategories for filtering"
```

---

### Task 8: Create Sports Resolver

**Files:**
- Create: `/apps/api/src/graphql/sports/sports.resolver.ts`

**Step 1: Create the resolver**

```typescript
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { CourtBookingService } from './court-booking.service';
import { ClassRegistrationService } from './class-registration.service';
import { RentalService } from './rental.service';
import { PrismaService } from '@/shared/prisma/prisma.service';
import {
  SportsFacilityType,
  CourtType,
  CourtBookingType,
  FacilityCalendarType,
  SportsClassType,
  ClassScheduleType,
  ClassRegistrationType,
  RentalItemType,
  RentalCheckoutType,
  BookingMutationResponse,
  RegistrationMutationResponse,
  RentalMutationResponse,
} from './sports.types';
import {
  CreateSportsFacilityInput,
  CreateCourtInput,
  UpdateCourtStatusInput,
  CreateCourtBookingInput,
  CancelBookingInput,
  CourtCalendarInput,
  CreateSportsClassInput,
  CreateClassScheduleInput,
  RegisterForClassInput,
  CancelRegistrationInput,
  CreateRentalItemInput,
  CheckoutRentalInput,
  ReturnRentalInput,
} from './sports.input';

interface CurrentUser {
  id: string;
  clubId: string;
}

@Resolver()
@UseGuards(GqlAuthGuard)
export class SportsResolver {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingService: CourtBookingService,
    private readonly classService: ClassRegistrationService,
    private readonly rentalService: RentalService,
  ) {}

  // ─────────────────────────────────────────────────────────────
  // FACILITY & COURT QUERIES
  // ─────────────────────────────────────────────────────────────

  @Query(() => [SportsFacilityType])
  async sportsFacilities(@GqlCurrentUser() user: CurrentUser) {
    const facilities = await this.prisma.sportsFacility.findMany({
      where: { clubId: user.clubId, isActive: true },
      include: { courts: { where: { isActive: true } } },
      orderBy: { sortOrder: 'asc' },
    });

    return facilities.map(f => ({
      ...f,
      courtCount: f.courts.length,
    }));
  }

  @Query(() => SportsFacilityType, { nullable: true })
  async sportsFacility(@Args('id', { type: () => ID }) id: string) {
    return this.prisma.sportsFacility.findUnique({
      where: { id },
      include: { courts: { orderBy: { sortOrder: 'asc' } } },
    });
  }

  @Query(() => [CourtType])
  async courts(
    @Args('facilityId', { type: () => ID }) facilityId: string,
  ) {
    return this.prisma.court.findMany({
      where: { facilityId, isActive: true },
      include: { facility: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // BOOKING QUERIES
  // ─────────────────────────────────────────────────────────────

  @Query(() => FacilityCalendarType)
  async courtCalendar(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: CourtCalendarInput,
  ) {
    return this.bookingService.getCourtCalendar(user.clubId, input);
  }

  @Query(() => [CourtBookingType])
  async memberCourtBookings(
    @Args('memberId', { type: () => ID }) memberId: string,
    @Args('includeHistory', { nullable: true, defaultValue: false }) includeHistory: boolean,
  ) {
    return this.bookingService.getMemberBookings(memberId, includeHistory);
  }

  @Query(() => CourtBookingType, { nullable: true })
  async courtBooking(@Args('id', { type: () => ID }) id: string) {
    return this.prisma.courtBooking.findUnique({
      where: { id },
      include: {
        court: { include: { facility: true } },
        guests: true,
        rentals: { include: { rentalItem: true } },
      },
    });
  }

  // ─────────────────────────────────────────────────────────────
  // BOOKING MUTATIONS
  // ─────────────────────────────────────────────────────────────

  @Mutation(() => BookingMutationResponse)
  async createCourtBooking(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: CreateCourtBookingInput,
  ) {
    return this.bookingService.createBooking(user.clubId, input, user.id);
  }

  @Mutation(() => BookingMutationResponse)
  async cancelCourtBooking(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: CancelBookingInput,
  ) {
    return this.bookingService.cancelBooking(input, user.id);
  }

  @Mutation(() => BookingMutationResponse)
  async checkInCourtBooking(
    @Args('bookingId', { type: () => ID }) bookingId: string,
  ) {
    return this.bookingService.checkInBooking(bookingId);
  }

  @Mutation(() => BookingMutationResponse)
  async checkOutCourtBooking(
    @Args('bookingId', { type: () => ID }) bookingId: string,
  ) {
    return this.bookingService.checkOutBooking(bookingId);
  }

  // ─────────────────────────────────────────────────────────────
  // CLASS QUERIES
  // ─────────────────────────────────────────────────────────────

  @Query(() => [SportsClassType])
  async sportsClasses(
    @GqlCurrentUser() user: CurrentUser,
    @Args('facilityId', { type: () => ID, nullable: true }) facilityId?: string,
  ) {
    return this.prisma.sportsClass.findMany({
      where: {
        clubId: user.clubId,
        facilityId: facilityId || undefined,
        isActive: true,
      },
      include: { facility: true },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
    });
  }

  @Query(() => [ClassScheduleType])
  async upcomingClassSchedules(
    @GqlCurrentUser() user: CurrentUser,
    @Args('facilityId', { type: () => ID, nullable: true }) facilityId?: string,
    @Args('limit', { nullable: true, defaultValue: 20 }) limit?: number,
  ) {
    const schedules = await this.classService.getUpcomingSchedules(
      user.clubId,
      facilityId,
      limit,
    );

    return schedules.map(s => ({
      ...s,
      capacity: s.capacity || s.sportsClass.capacity,
      availableSpots: Math.max(0, (s.capacity || s.sportsClass.capacity) - s.registeredCount),
    }));
  }

  @Query(() => [ClassRegistrationType])
  async classRegistrations(
    @Args('scheduleId', { type: () => ID }) scheduleId: string,
  ) {
    const registrations = await this.classService.getScheduleRegistrations(scheduleId);
    return registrations.map(r => ({
      ...r,
      memberName: `${r.member.firstName} ${r.member.lastName}`,
    }));
  }

  // ─────────────────────────────────────────────────────────────
  // CLASS MUTATIONS
  // ─────────────────────────────────────────────────────────────

  @Mutation(() => ClassScheduleType)
  async createClassSchedule(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: CreateClassScheduleInput,
  ) {
    return this.classService.createSchedule(user.clubId, input);
  }

  @Mutation(() => RegistrationMutationResponse)
  async registerForClass(@Args('input') input: RegisterForClassInput) {
    return this.classService.registerForClass(input);
  }

  @Mutation(() => RegistrationMutationResponse)
  async cancelClassRegistration(@Args('input') input: CancelRegistrationInput) {
    return this.classService.cancelRegistration(input);
  }

  @Mutation(() => RegistrationMutationResponse)
  async checkInClassRegistration(
    @Args('registrationId', { type: () => ID }) registrationId: string,
  ) {
    return this.classService.checkInRegistration(registrationId);
  }

  // ─────────────────────────────────────────────────────────────
  // RENTAL QUERIES
  // ─────────────────────────────────────────────────────────────

  @Query(() => [RentalItemType])
  async rentalItems(
    @GqlCurrentUser() user: CurrentUser,
    @Args('category', { nullable: true }) category?: string,
    @Args('availableOnly', { nullable: true, defaultValue: false }) availableOnly?: boolean,
  ) {
    if (availableOnly) {
      return this.rentalService.getAvailableItems(user.clubId, category);
    }
    return this.rentalService.getAllItems(user.clubId);
  }

  @Query(() => [String])
  async rentalCategories(@GqlCurrentUser() user: CurrentUser) {
    return this.rentalService.getCategories(user.clubId);
  }

  @Query(() => [RentalCheckoutType])
  async activeRentalCheckouts(@GqlCurrentUser() user: CurrentUser) {
    return this.rentalService.getActiveCheckouts(user.clubId);
  }

  @Query(() => [RentalCheckoutType])
  async memberRentalCheckouts(
    @Args('memberId', { type: () => ID }) memberId: string,
  ) {
    const checkouts = await this.rentalService.getMemberCheckouts(memberId);
    return checkouts.map(c => ({
      ...c,
      memberName: '', // Will be filled by field resolver if needed
    }));
  }

  // ─────────────────────────────────────────────────────────────
  // RENTAL MUTATIONS
  // ─────────────────────────────────────────────────────────────

  @Mutation(() => RentalItemType)
  async createRentalItem(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: CreateRentalItemInput,
  ) {
    return this.rentalService.createItem(user.clubId, input);
  }

  @Mutation(() => RentalMutationResponse)
  async checkoutRental(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: CheckoutRentalInput,
  ) {
    return this.rentalService.checkoutItem(user.clubId, input, user.id);
  }

  @Mutation(() => RentalMutationResponse)
  async returnRental(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: ReturnRentalInput,
  ) {
    return this.rentalService.returnItem(input, user.id);
  }

  // ─────────────────────────────────────────────────────────────
  // FACILITY MUTATIONS
  // ─────────────────────────────────────────────────────────────

  @Mutation(() => SportsFacilityType)
  async createSportsFacility(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: CreateSportsFacilityInput,
  ) {
    return this.prisma.sportsFacility.create({
      data: {
        clubId: user.clubId,
        ...input,
      },
    });
  }

  @Mutation(() => CourtType)
  async createCourt(@Args('input') input: CreateCourtInput) {
    const facility = await this.prisma.sportsFacility.findUnique({
      where: { id: input.facilityId },
    });

    if (!facility) {
      throw new Error('Facility not found');
    }

    return this.prisma.court.create({
      data: {
        facilityId: input.facilityId,
        name: input.name,
        code: input.code,
        description: input.description,
        capacity: input.capacity || 4,
        memberRate: input.memberRate,
        guestRate: input.guestRate,
        peakRate: input.peakRate,
        hasLighting: input.hasLighting ?? true,
        isIndoor: input.isIndoor ?? false,
        surfaceType: input.surfaceType,
      },
      include: { facility: true },
    });
  }

  @Mutation(() => CourtType)
  async updateCourtStatus(@Args('input') input: UpdateCourtStatusInput) {
    return this.prisma.court.update({
      where: { id: input.courtId },
      data: {
        status: input.status,
        maintenanceNote: input.maintenanceNote,
      },
      include: { facility: true },
    });
  }

  @Mutation(() => SportsClassType)
  async createSportsClass(
    @GqlCurrentUser() user: CurrentUser,
    @Args('input') input: CreateSportsClassInput,
  ) {
    return this.prisma.sportsClass.create({
      data: {
        clubId: user.clubId,
        ...input,
      },
      include: { facility: true },
    });
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/sports/sports.resolver.ts
git commit -m "feat(api): add SportsResolver

- Add facility and court queries
- Add courtCalendar query for visual grid
- Add booking CRUD mutations
- Add class schedule and registration queries/mutations
- Add rental item and checkout queries/mutations
- Add facility/court/class creation mutations"
```

---

### Task 9: Create Sports Module

**Files:**
- Create: `/apps/api/src/graphql/sports/sports.module.ts`
- Create: `/apps/api/src/graphql/sports/index.ts`

**Step 1: Create the module**

```typescript
import { Module } from '@nestjs/common';
import { PrismaModule } from '@/shared/prisma/prisma.module';
import { SportsResolver } from './sports.resolver';
import { CourtBookingService } from './court-booking.service';
import { ClassRegistrationService } from './class-registration.service';
import { RentalService } from './rental.service';

@Module({
  imports: [PrismaModule],
  providers: [
    SportsResolver,
    CourtBookingService,
    ClassRegistrationService,
    RentalService,
  ],
  exports: [CourtBookingService, ClassRegistrationService, RentalService],
})
export class SportsModule {}
```

**Step 2: Create the index file**

```typescript
export * from './sports.module';
export * from './sports.types';
export * from './sports.input';
export * from './court-booking.service';
export * from './class-registration.service';
export * from './rental.service';
```

**Step 3: Register in GraphQL module**

Modify `/apps/api/src/graphql/graphql.module.ts` to import SportsModule.

**Step 4: Commit**

```bash
git add apps/api/src/graphql/sports/
git commit -m "feat(api): add SportsModule and register in GraphQL

- Create SportsModule with all services and resolver
- Create index.ts for clean exports
- Register in main GraphQL module"
```

---

### Task 10: Add Sports GraphQL Operations

**Files:**
- Create: `/packages/api-client/src/operations/sports.graphql`

**Step 1: Create the operations file**

```graphql
# ─────────────────────────────────────────────────────────────
# FACILITY & COURT QUERIES
# ─────────────────────────────────────────────────────────────

query GetSportsFacilities {
  sportsFacilities {
    id
    name
    code
    sportType
    description
    location
    openTime
    closeTime
    slotDurationMin
    maxAdvanceDays
    memberOnly
    allowGuests
    maxGuestsPerBooking
    isActive
    courtCount
  }
}

query GetSportsFacility($id: ID!) {
  sportsFacility(id: $id) {
    id
    name
    code
    sportType
    description
    openTime
    closeTime
    slotDurationMin
    courts {
      id
      name
      code
      capacity
      memberRate
      guestRate
      peakRate
      status
      isActive
    }
  }
}

query GetCourts($facilityId: ID!) {
  courts(facilityId: $facilityId) {
    id
    name
    code
    capacity
    memberRate
    guestRate
    peakRate
    hasLighting
    isIndoor
    surfaceType
    status
    maintenanceNote
    isActive
  }
}

# ─────────────────────────────────────────────────────────────
# BOOKING QUERIES
# ─────────────────────────────────────────────────────────────

query GetCourtCalendar($input: CourtCalendarInput!) {
  courtCalendar(input: $input) {
    facilityId
    facilityName
    date
    courts {
      courtId
      courtName
      slots {
        time
        date
        courtId
        available
        isPeakTime
        rate
        booking {
          id
          bookingNumber
          startTime
          endTime
          durationMinutes
          playerCount
          guestCount
          status
        }
      }
    }
  }
}

query GetMemberCourtBookings($memberId: ID!, $includeHistory: Boolean) {
  memberCourtBookings(memberId: $memberId, includeHistory: $includeHistory) {
    id
    bookingNumber
    startTime
    endTime
    durationMinutes
    playerCount
    guestCount
    courtFee
    totalAmount
    status
    isPaid
    court {
      id
      name
      facility {
        id
        name
        sportType
      }
    }
    guests {
      id
      name
      guestFee
      isPaid
    }
  }
}

# ─────────────────────────────────────────────────────────────
# BOOKING MUTATIONS
# ─────────────────────────────────────────────────────────────

mutation CreateCourtBooking($input: CreateCourtBookingInput!) {
  createCourtBooking(input: $input) {
    success
    error
    booking {
      id
      bookingNumber
      startTime
      endTime
      totalAmount
      status
    }
  }
}

mutation CancelCourtBooking($input: CancelBookingInput!) {
  cancelCourtBooking(input: $input) {
    success
    error
    booking {
      id
      status
    }
  }
}

mutation CheckInCourtBooking($bookingId: ID!) {
  checkInCourtBooking(bookingId: $bookingId) {
    success
    error
    booking {
      id
      status
      checkedInAt
    }
  }
}

# ─────────────────────────────────────────────────────────────
# CLASS QUERIES
# ─────────────────────────────────────────────────────────────

query GetSportsClasses($facilityId: ID) {
  sportsClasses(facilityId: $facilityId) {
    id
    name
    description
    category
    durationMinutes
    capacity
    memberPrice
    guestPrice
    instructorName
    isActive
    facility {
      id
      name
    }
  }
}

query GetUpcomingClassSchedules($facilityId: ID, $limit: Int) {
  upcomingClassSchedules(facilityId: $facilityId, limit: $limit) {
    id
    classId
    scheduledDate
    startTime
    endTime
    instructorName
    capacity
    status
    registeredCount
    waitlistCount
    availableSpots
    sportsClass {
      id
      name
      category
      memberPrice
    }
    court {
      id
      name
    }
  }
}

query GetClassRegistrations($scheduleId: ID!) {
  classRegistrations(scheduleId: $scheduleId) {
    id
    memberId
    memberName
    status
    waitlistPosition
    isPaid
    amountPaid
    checkedInAt
    registeredAt
  }
}

# ─────────────────────────────────────────────────────────────
# CLASS MUTATIONS
# ─────────────────────────────────────────────────────────────

mutation RegisterForClass($input: RegisterForClassInput!) {
  registerForClass(input: $input) {
    success
    error
    registration {
      id
      status
      waitlistPosition
    }
    waitlistPosition
  }
}

mutation CancelClassRegistration($input: CancelRegistrationInput!) {
  cancelClassRegistration(input: $input) {
    success
    error
    registration {
      id
      status
    }
  }
}

mutation CheckInClassRegistration($registrationId: ID!) {
  checkInClassRegistration(registrationId: $registrationId) {
    success
    error
    registration {
      id
      status
      checkedInAt
    }
  }
}

# ─────────────────────────────────────────────────────────────
# RENTAL QUERIES
# ─────────────────────────────────────────────────────────────

query GetRentalItems($category: String, $availableOnly: Boolean) {
  rentalItems(category: $category, availableOnly: $availableOnly) {
    id
    name
    code
    category
    description
    totalQuantity
    availableQuantity
    pricePerHour
    pricePerSession
    pricePerDay
    depositAmount
    requiresDeposit
    isActive
  }
}

query GetRentalCategories {
  rentalCategories
}

query GetActiveRentalCheckouts {
  activeRentalCheckouts {
    id
    rentalItemId
    memberId
    memberName
    quantity
    checkoutTime
    expectedReturnTime
    priceType
    totalAmount
    status
    rentalItem {
      id
      name
      code
    }
  }
}

# ─────────────────────────────────────────────────────────────
# RENTAL MUTATIONS
# ─────────────────────────────────────────────────────────────

mutation CheckoutRental($input: CheckoutRentalInput!) {
  checkoutRental(input: $input) {
    success
    error
    checkout {
      id
      quantity
      totalAmount
      status
    }
  }
}

mutation ReturnRental($input: ReturnRentalInput!) {
  returnRental(input: $input) {
    success
    error
    checkout {
      id
      status
      actualReturnTime
    }
  }
}

mutation CreateRentalItem($input: CreateRentalItemInput!) {
  createRentalItem(input: $input) {
    id
    name
    code
    category
    totalQuantity
    availableQuantity
  }
}
```

**Step 2: Run codegen**

```bash
cd packages/api-client && pnpm codegen
```

**Step 3: Export new hooks**

Update `/packages/api-client/src/index.ts` to export the new hooks.

**Step 4: Commit**

```bash
git add packages/api-client/
git commit -m "feat(api-client): add Sports GraphQL operations

- Add facility and court queries
- Add court calendar query for booking grid
- Add booking CRUD mutations
- Add class schedule and registration operations
- Add rental item and checkout operations
- Generate and export TanStack Query hooks"
```

---

## Part 2: React Components

### Task 11: Create Court Calendar Component

**Files:**
- Create: `/apps/application/src/components/sports/court-calendar.tsx`

This component displays a visual grid showing courts on the Y-axis and time slots on the X-axis. It allows clicking on available slots to create bookings.

### Task 12: Create Court Booking Modal

**Files:**
- Create: `/apps/application/src/components/sports/court-booking-modal.tsx`

Modal for creating court bookings with member selection, guest addition, and duration picker.

### Task 13: Create Class Schedule List

**Files:**
- Create: `/apps/application/src/components/sports/class-schedule-list.tsx`

Displays upcoming classes with registration counts and available spots.

### Task 14: Create Class Registration Modal

**Files:**
- Create: `/apps/application/src/components/sports/class-registration-modal.tsx`

Modal for registering members for classes, handling waitlist scenarios.

### Task 15: Create Rental Checkout Panel

**Files:**
- Create: `/apps/application/src/components/sports/rental-checkout-panel.tsx`

Panel for checking out rental equipment with quantity selection and return tracking.

### Task 16: Create Sports Tabs Layout

**Files:**
- Create: `/apps/application/src/components/sports/sports-tabs-layout.tsx`

Main layout component with tabs for Calendar, Classes, Rentals, and Settings.

---

## Summary

| Part | Feature | Tasks | Estimated Effort |
|------|---------|-------|------------------|
| 1 | Database & API | 1-10 | 8-10 hours |
| 2 | React Components | 11-16 | 6-8 hours |
| - | Testing & Polish | - | 2-3 hours |

**Total: ~16-21 hours across 16+ tasks**

---

## Appendix: File Reference

| Layer | Location Pattern |
|-------|------------------|
| Prisma Schema | `/database/prisma/schema.prisma` |
| GraphQL Types | `/apps/api/src/graphql/sports/sports.types.ts` |
| GraphQL Inputs | `/apps/api/src/graphql/sports/sports.input.ts` |
| Services | `/apps/api/src/graphql/sports/*.service.ts` |
| Resolver | `/apps/api/src/graphql/sports/sports.resolver.ts` |
| Module | `/apps/api/src/graphql/sports/sports.module.ts` |
| Operations | `/packages/api-client/src/operations/sports.graphql` |
| Generated Hooks | `/packages/api-client/src/hooks/generated.ts` |
| UI Components | `/apps/application/src/components/sports/*.tsx` |
