# POS Phase 2: Spa Module - UX Specification

**Date:** 2026-02-01
**Status:** Draft
**Purpose:** Detailed UX flows for Phase 2 Spa Module features

---

## Overview

This document covers the UX flows for all Phase 2 (Spa Module) features:

1. Service Menu
2. Online Booking
3. Staff Scheduling
4. Resource Booking
5. Appointment Reminders
6. Treatment Packages
7. Package Redemption
8. Product Sales
9. Combined Checkout

---

## Feature 1: Service Menu

### Description

Centralized catalog of all spa treatments and services with duration, pricing, staff assignment, and categories.

### Service Types

| Type | Description | Example |
|------|-------------|---------|
| Treatment | Hands-on service | Thai massage, facial |
| Add-on | Enhancement to base service | Hot stones, aromatherapy |
| Consultation | Assessment/planning | Skin analysis |
| Package | Bundled services | Spa day package |

### Data Model

```prisma
model SpaServiceCategory {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  name            String    // "Massage", "Facial", "Body Treatment"
  description     String?
  displayOrder    Int       @default(0)
  icon            String?   // Icon identifier
  color           String?   // Category color for UI

  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  services        SpaService[]
}

model SpaService {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  categoryId      String
  category        SpaServiceCategory @relation(fields: [categoryId], references: [id])

  name            String    // "Thai Traditional Massage"
  description     String?
  shortDescription String?  // For menus/lists

  // Timing
  duration        Int       // Minutes (60, 90, 120)
  bufferBefore    Int       @default(0)  // Prep time
  bufferAfter     Int       @default(15) // Cleanup time

  // Pricing
  price           Decimal
  memberPrice     Decimal?  // Optional member discount price
  taxType         TaxType   @default(ADD) // ADD, INCLUDE, NONE

  // Requirements
  requiredSkills  String[]  // ["MASSAGE_THAI", "MASSAGE_OIL"]
  requiredRooms   String[]  // ["MASSAGE_ROOM", "COUPLES_SUITE"]
  requiredEquipment String[] // ["HOT_STONES", "STEAM_CABINET"]

  // Settings
  serviceType     SpaServiceType @default(TREATMENT)
  isOnlineBookable Boolean  @default(true)
  maxAdvanceBooking Int     @default(30) // Days in advance
  minAdvanceBooking Int     @default(2)  // Hours in advance
  requiresDeposit Boolean   @default(false)
  depositAmount   Decimal?

  // Display
  displayOrder    Int       @default(0)
  featuredImage   String?
  galleryImages   String[]

  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  staffAssignments SpaServiceStaff[]
  appointments    SpaAppointment[]
  packageItems    SpaPackageItem[]
  addOns          SpaServiceAddOn[] @relation("BaseService")
  availableAddOns SpaServiceAddOn[] @relation("AddOnService")
}

enum SpaServiceType {
  TREATMENT
  ADD_ON
  CONSULTATION
  PACKAGE
}

model SpaServiceStaff {
  id              String    @id @default(uuid())
  serviceId       String
  service         SpaService @relation(fields: [serviceId], references: [id])
  staffId         String
  staff           Staff     @relation(fields: [staffId], references: [id])

  // Staff-specific pricing override
  priceOverride   Decimal?

  isActive        Boolean   @default(true)
}

model SpaServiceAddOn {
  id              String    @id @default(uuid())

  baseServiceId   String
  baseService     SpaService @relation("BaseService", fields: [baseServiceId], references: [id])

  addOnServiceId  String
  addOnService    SpaService @relation("AddOnService", fields: [addOnServiceId], references: [id])

  additionalTime  Int       @default(0) // Extra minutes
  additionalPrice Decimal   // Price when added to base

  isActive        Boolean   @default(true)
}
```

### UX Flow: Service Menu List

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Spa Services                                      [+ Add Service]       │
├─────────────────────────────────────────────────────────────────────────┤
│ Categories: [All ▼]  Status: [Active ▼]  Search: [____________] 🔍     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─ Massage ─────────────────────────────────────────────────────────┐  │
│ │                                                                    │  │
│ │ Service                  Duration   Price      Staff    Status    │  │
│ │ ────────────────────────────────────────────────────────────────  │  │
│ │ Thai Traditional         60 min     ฿1,200     5        ✅ Active │  │
│ │ Thai Traditional         90 min     ฿1,600     5        ✅ Active │  │
│ │ Aromatherapy Oil         60 min     ฿1,400     4        ✅ Active │  │
│ │ Deep Tissue              60 min     ฿1,600     3        ✅ Active │  │
│ │ Hot Stone                90 min     ฿2,200     2        ✅ Active │  │
│ │ Couples Massage          90 min     ฿3,200     —        ⏸ Paused  │  │
│ │                                                                    │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌─ Facial ──────────────────────────────────────────────────────────┐  │
│ │                                                                    │  │
│ │ Service                  Duration   Price      Staff    Status    │  │
│ │ ────────────────────────────────────────────────────────────────  │  │
│ │ Express Facial           30 min     ฿  800     3        ✅ Active │  │
│ │ Deep Cleansing           60 min     ฿1,500     3        ✅ Active │  │
│ │ Anti-Aging Premium       90 min     ฿2,800     2        ✅ Active │  │
│ │                                                                    │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Add/Edit Service

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Add Spa Service                                                    [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ─────────────── Basic Information ───────────────                       │
│                                                                         │
│ Service Name: [Thai Traditional Massage_____]                           │
│                                                                         │
│ Category: [Massage_______________▼]                                     │
│                                                                         │
│ Type: ● Treatment  ○ Add-on  ○ Consultation                            │
│                                                                         │
│ Short Description:                                                      │
│ [Ancient healing technique using pressure points____]                   │
│                                                                         │
│ Full Description:                                                       │
│ ┌─────────────────────────────────────────────────────────────────┐    │
│ │ Traditional Thai massage combines acupressure, stretching,      │    │
│ │ and assisted yoga postures to restore energy flow...            │    │
│ └─────────────────────────────────────────────────────────────────┘    │
│                                                                         │
│ ─────────────── Duration & Pricing ───────────────                      │
│                                                                         │
│ Duration:      [60___] minutes                                          │
│ Buffer Before: [0____] minutes (prep time)                              │
│ Buffer After:  [15___] minutes (cleanup)                                │
│                                                                         │
│ Total Block:   75 minutes                                               │
│                                                                         │
│ Regular Price: ฿ [1,200____]                                            │
│ Member Price:  ฿ [1,080____] (optional)                                 │
│                                                                         │
│ Tax: ○ Add 7%  ● Included  ○ No Tax                                    │
│                                                                         │
│ ─────────────── Requirements ───────────────                            │
│                                                                         │
│ Required Skills:                                                        │
│ ☑ Thai Massage                                                          │
│ ☐ Oil Massage                                                           │
│ ☐ Facial Treatment                                                      │
│ ☐ Body Scrub                                                            │
│                                                                         │
│ Room Types:                                                             │
│ ☑ Single Massage Room                                                   │
│ ☐ Couples Suite                                                         │
│ ☐ Facial Room                                                           │
│                                                                         │
│ Equipment:                                                              │
│ ☐ Hot Stones                                                            │
│ ☐ Steam Cabinet                                                         │
│                                                                         │
│ ─────────────── Booking Settings ───────────────                        │
│                                                                         │
│ ☑ Available for online booking                                          │
│                                                                         │
│ Advance Booking: [2] hours to [30] days                                 │
│                                                                         │
│ ☐ Require deposit                                                       │
│   Deposit Amount: ฿ [________]                                          │
│                                                                         │
│                                         [Cancel]  [Save Service]        │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Assign Staff to Service

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Staff Assignment: Thai Traditional Massage                         [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Qualified Staff (with Thai Massage skill):                              │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ ☑ Somjai P.         Senior Therapist      ฿1,200 (standard)      │  │
│ │ ☑ Nisa K.           Therapist             ฿1,200 (standard)      │  │
│ │ ☑ Ploy S.           Therapist             ฿1,200 (standard)      │  │
│ │ ☑ Mali W.           Junior Therapist      ฿1,080 [custom]        │  │
│ │ ☑ Lek T.            Senior Therapist      ฿1,400 [custom]        │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ Staff without required skill:                                           │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ ☐ Dao R.            Aesthetician          Missing: Thai Massage  │  │
│ │ ☐ Fern C.           Aesthetician          Missing: Thai Massage  │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│                                         [Cancel]  [Save Assignments]    │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Service Add-Ons Configuration

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Add-Ons: Thai Traditional Massage (60 min)                         [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Available add-ons that can enhance this service:                        │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ ☑ Aromatherapy Upgrade                                            │  │
│ │   +15 min    +฿300                                                │  │
│ │                                                                    │  │
│ │ ☑ Hot Stone Enhancement                                           │  │
│ │   +20 min    +฿400                                                │  │
│ │                                                                    │  │
│ │ ☑ Foot Scrub                                                      │  │
│ │   +15 min    +฿250                                                │  │
│ │                                                                    │  │
│ │ ☐ Scalp Massage                                                   │  │
│ │   +10 min    +฿200                                                │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│                                         [Cancel]  [Save Add-Ons]        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Feature 2: Online Booking

### Description

Member self-service booking flow enabling 24/7 appointment scheduling with available slots, therapist selection, and instant confirmation.

### Booking States

| State | Description | Actions |
|-------|-------------|---------|
| Available | Open slot | Book |
| Held | Temporarily reserved | Release after 10 min |
| Booked | Confirmed appointment | Cancel, Reschedule |
| Checked-in | Member arrived | Start service |
| In-Progress | Service underway | Complete |
| Completed | Service finished | Checkout |
| Cancelled | Member cancelled | — |
| No-Show | Member did not arrive | — |

### Data Model

```prisma
model SpaAppointment {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  // Who
  memberId        String?
  member          Member?   @relation(fields: [memberId], references: [id])
  guestName       String?
  guestPhone      String?
  guestEmail      String?

  // What
  serviceId       String
  service         SpaService @relation(fields: [serviceId], references: [id])

  // Who performs
  staffId         String?
  staff           Staff?    @relation(fields: [staffId], references: [id])
  staffPreference StaffPreference @default(NO_PREFERENCE)

  // Where
  roomId          String?
  room            SpaRoom?  @relation(fields: [roomId], references: [id])

  // When
  date            DateTime  @db.Date
  startTime       DateTime  @db.Time
  endTime         DateTime  @db.Time
  duration        Int       // Actual service minutes

  // Pricing
  price           Decimal
  depositPaid     Decimal   @default(0)
  depositRefunded Boolean   @default(false)

  // Status
  status          AppointmentStatus @default(BOOKED)
  bookingSource   BookingSource @default(STAFF)

  // Confirmation
  confirmationCode String   @unique
  confirmedAt     DateTime?
  reminderSentAt  DateTime?

  // Check-in
  checkedInAt     DateTime?
  checkedInBy     String?

  // Completion
  startedAt       DateTime?
  completedAt     DateTime?
  completedBy     String?

  // Cancellation
  cancelledAt     DateTime?
  cancelledBy     String?
  cancellationReason String?
  cancellationFee Decimal   @default(0)

  // Notes
  memberNotes     String?   // Special requests
  staffNotes      String?   // Internal notes

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  addOns          SpaAppointmentAddOn[]
  packageRedemption SpaPackageRedemption?
  lineItems       BookingLineItem[]
}

enum AppointmentStatus {
  HELD          // Temporary hold during booking
  BOOKED        // Confirmed
  CHECKED_IN    // Member arrived
  IN_PROGRESS   // Service started
  COMPLETED     // Service finished
  CANCELLED     // Cancelled
  NO_SHOW       // Did not arrive
}

enum BookingSource {
  ONLINE        // Member portal
  STAFF         // Staff booked
  PHONE         // Phone booking
  WALK_IN       // Walk-in
}

enum StaffPreference {
  NO_PREFERENCE
  SPECIFIC_STAFF
  ANY_FEMALE
  ANY_MALE
}

model SpaAppointmentAddOn {
  id              String    @id @default(uuid())
  appointmentId   String
  appointment     SpaAppointment @relation(fields: [appointmentId], references: [id])

  addOnId         String
  addOn           SpaService @relation(fields: [addOnId], references: [id])

  price           Decimal
  duration        Int
}

model SpaBookingHold {
  id              String    @id @default(uuid())

  memberId        String
  serviceId       String
  staffId         String?
  roomId          String?

  date            DateTime
  startTime       DateTime
  endTime         DateTime

  expiresAt       DateTime  // 10 minutes from creation

  createdAt       DateTime  @default(now())
}
```

### UX Flow: Member Portal - Service Selection

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🧘 Book Spa Appointment                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Step 1 of 4: Select Service                                             │
│ ════════════════════════════════════════════                            │
│                                                                         │
│ ┌─ Massage ─────────────────────────────────────────────────────────┐  │
│ │                                                                    │  │
│ │ ┌───────────────────────────────────────────────────────────────┐ │  │
│ │ │ Thai Traditional Massage                              60 min  │ │  │
│ │ │ Ancient healing technique using pressure points               │ │  │
│ │ │ ฿1,080 (member price)                          [Select]      │ │  │
│ │ └───────────────────────────────────────────────────────────────┘ │  │
│ │                                                                    │  │
│ │ ┌───────────────────────────────────────────────────────────────┐ │  │
│ │ │ Thai Traditional Massage                              90 min  │ │  │
│ │ │ Extended session for deeper relaxation                        │ │  │
│ │ │ ฿1,440 (member price)                          [Select]      │ │  │
│ │ └───────────────────────────────────────────────────────────────┘ │  │
│ │                                                                    │  │
│ │ ┌───────────────────────────────────────────────────────────────┐ │  │
│ │ │ Aromatherapy Oil Massage                              60 min  │ │  │
│ │ │ Soothing massage with essential oils                          │ │  │
│ │ │ ฿1,260 (member price)                          [Select]      │ │  │
│ │ └───────────────────────────────────────────────────────────────┘ │  │
│ │                                                                    │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌─ Facial ──────────────────────────────────────────────────────────┐  │
│ │ [Show 3 services...]                                               │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Member Portal - Date & Time Selection

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🧘 Book Spa Appointment                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Step 2 of 4: Select Date & Time                                         │
│ ════════════════════════════════════════════                            │
│                                                                         │
│ Selected: Thai Traditional Massage (60 min) - ฿1,080                    │
│                                                                         │
│ Therapist Preference:                                                   │
│ ○ No preference  ○ Female  ○ Male  ● Specific: [Somjai P.____▼]        │
│                                                                         │
│ ┌─────────────────── February 2026 ───────────────────┐                │
│ │ Su   Mo   Tu   We   Th   Fr   Sa                    │                │
│ │                               1                      │                │
│ │  2    3    4    5    6    7    8                    │                │
│ │  9   10   11   12   13   14   15                    │                │
│ │ 16   17   18   19   20   21   22                    │                │
│ │ 23   24   25   26   27   28                         │                │
│ │                                                      │                │
│ │ [●] Available  [○] Limited  [—] Unavailable         │                │
│ └──────────────────────────────────────────────────────┘                │
│                                                                         │
│ Selected Date: Saturday, February 15, 2026                              │
│                                                                         │
│ Available Times (Somjai P.):                                            │
│                                                                         │
│ Morning:   [09:00] [10:30]  ░░░░░   ░░░░░                               │
│ Afternoon: [13:00] [14:30] [16:00]  ░░░░░                               │
│ Evening:    ░░░░░   ░░░░░   ░░░░░                                       │
│                                                                         │
│ ░░░░░ = Booked                                                          │
│                                                                         │
│ Selected: 10:30 AM                                                      │
│                                                                         │
│                                          [Back]  [Continue]             │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Member Portal - Add-Ons

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🧘 Book Spa Appointment                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Step 3 of 4: Enhance Your Experience                                    │
│ ════════════════════════════════════════════                            │
│                                                                         │
│ Would you like to add any enhancements?                                 │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ ☐ Aromatherapy Upgrade                                            │  │
│ │   Essential oils for enhanced relaxation                          │  │
│ │   +15 min    +฿270 (member)                                       │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ ☑ Hot Stone Enhancement                                           │  │
│ │   Heated basalt stones for deeper muscle relief                   │  │
│ │   +20 min    +฿360 (member)                                       │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ ☐ Foot Scrub                                                      │  │
│ │   Exfoliating treatment for tired feet                            │  │
│ │   +15 min    +฿225 (member)                                       │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ─────────────────────────────────────────────────────────────────────  │
│                                                                         │
│ Your Appointment:                                                       │
│ Thai Traditional Massage (60 min)              ฿1,080                   │
│ + Hot Stone Enhancement (+20 min)              ฿  360                   │
│ ───────────────────────────────────────────────────────                 │
│ Total Duration: 80 min                                                  │
│ Total Price:    ฿1,440                                                  │
│                                                                         │
│                                          [Back]  [Continue]             │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Member Portal - Confirmation

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🧘 Book Spa Appointment                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Step 4 of 4: Confirm Booking                                            │
│ ════════════════════════════════════════════                            │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ 📅 Saturday, February 15, 2026                                    │  │
│ │ ⏰ 10:30 AM - 11:50 AM (80 min)                                   │  │
│ │                                                                    │  │
│ │ Service:   Thai Traditional Massage                               │  │
│ │ Add-on:    Hot Stone Enhancement                                  │  │
│ │ Therapist: Somjai P.                                              │  │
│ │                                                                    │  │
│ │ Total:     ฿1,440                                                 │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ Special Requests (optional):                                            │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ Prefer firm pressure. Allergic to lavender.                       │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ Payment:                                                                │
│ ○ Pay at spa                                                            │
│ ● Charge to member account                                              │
│ ○ Pay with saved card (Visa ****4521)                                   │
│                                                                         │
│ ☑ I understand the cancellation policy (24 hours notice required)       │
│                                                                         │
│                                          [Back]  [Confirm Booking]      │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Booking Confirmation Success

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                           ✅ Booking Confirmed!                         │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                    Confirmation Code: SPA-2026-0215-001                 │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │                                                                    │  │
│ │ 📅 Saturday, February 15, 2026                                    │  │
│ │ ⏰ 10:30 AM - 11:50 AM                                            │  │
│ │                                                                    │  │
│ │ Thai Traditional Massage                                          │  │
│ │ + Hot Stone Enhancement                                           │  │
│ │                                                                    │  │
│ │ Therapist: Somjai P.                                              │  │
│ │ Duration:  80 minutes                                             │  │
│ │ Total:     ฿1,440                                                 │  │
│ │                                                                    │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ A confirmation email has been sent to john@email.com                    │
│                                                                         │
│ Please arrive 10 minutes before your appointment.                       │
│                                                                         │
│         [Add to Calendar]     [View My Appointments]                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Staff View - Appointment Calendar

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Spa Appointments                    [Day] [Week]    📅 Feb 15, 2026     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Filter: [All Staff ▼]  [All Services ▼]  [All Rooms ▼]                 │
│                                                                         │
│        │ Somjai P.    │ Nisa K.      │ Ploy S.      │ Mali W.     │    │
│ ───────┼──────────────┼──────────────┼──────────────┼─────────────┼    │
│  09:00 │ ░░░░░░░░░░░░ │              │ ░░░░░░░░░░░░ │             │    │
│        │ Thai 60min   │              │ Facial 60min │             │    │
│        │ John S. (M)  │              │ Jane D. (M)  │             │    │
│ ───────┤              │              │              │             │    │
│  09:30 │              │              │              │             │    │
│ ───────┤              ├──────────────┤              │             │    │
│  10:00 │              │ ░░░░░░░░░░░░ │              │             │    │
│        │              │ Oil 90min    │              │             │    │
│        │              │ Bob W. (G)   │              │             │    │
│ ───────┤──────────────┤              ├──────────────┤─────────────│    │
│  10:30 │ ████████████ │              │              │ ░░░░░░░░░░░ │    │
│        │ Thai+Stones  │              │              │ Thai 60min  │    │
│        │ John S. (M)  │              │              │ Sarah L.(M) │    │
│        │ ✓ CHECKED-IN │              │              │             │    │
│ ───────┤              │              │              │             │    │
│  11:00 │              │              │              │             │    │
│        │              │              │              │             │    │
│ ───────┼──────────────┼──────────────┼──────────────┼─────────────┼    │
│                                                                         │
│ Legend: ░░░ Booked  ███ Checked-in  ▓▓▓ In Progress  (M)ember (G)uest  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Check-in Appointment

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Check-in: John Smith                                               [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Confirmation: SPA-2026-0215-001                                         │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ 📅 Today at 10:30 AM                                              │  │
│ │                                                                    │  │
│ │ Service:   Thai Traditional Massage (60 min)                      │  │
│ │ Add-on:    Hot Stone Enhancement (+20 min)                        │  │
│ │ Therapist: Somjai P.                                              │  │
│ │ Room:      Massage Room 3                                         │  │
│ │                                                                    │  │
│ │ Total:     ฿1,440                                                 │  │
│ │                                                                    │  │
│ │ Notes: Prefer firm pressure. Allergic to lavender.                │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ☑ Member has arrived                                                    │
│ ☐ Waiver signed (if first visit)                                        │
│                                                                         │
│ Room Assignment: [Massage Room 3__▼]  ✅ Available                      │
│                                                                         │
│ Internal Notes:                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ VIP member - ensure extra attention                               │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│                                          [Cancel]  [Check In]           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Feature 3: Staff Scheduling

### Description

Availability management for spa therapists including work schedules, skills matrix, and room assignments.

### Staff Skill Types

| Skill | Description |
|-------|-------------|
| MASSAGE_THAI | Thai traditional massage |
| MASSAGE_OIL | Oil/aromatherapy massage |
| MASSAGE_DEEP | Deep tissue massage |
| MASSAGE_HOT_STONE | Hot stone therapy |
| FACIAL_BASIC | Basic facial treatments |
| FACIAL_ADVANCED | Advanced facial procedures |
| BODY_SCRUB | Body scrub treatments |
| BODY_WRAP | Body wrap treatments |

### Data Model

```prisma
model SpaStaff {
  id              String    @id @default(uuid())
  staffId         String    @unique
  staff           Staff     @relation(fields: [staffId], references: [id])

  // Profile
  displayName     String
  title           String    // "Senior Therapist", "Aesthetician"
  bio             String?
  photo           String?

  // Skills
  skills          SpaStaffSkill[]

  // Scheduling
  defaultSchedule SpaStaffSchedule[]
  scheduleOverrides SpaScheduleOverride[]

  // Preferences
  preferredRooms  String[]  // Room IDs
  maxDailyHours   Decimal   @default(8)
  minBreakMinutes Int       @default(30)

  // Settings
  acceptsOnlineBooking Boolean @default(true)
  displayOrder    Int       @default(0)

  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  appointments    SpaAppointment[]
}

model SpaStaffSkill {
  id              String    @id @default(uuid())
  spaStaffId      String
  spaStaff        SpaStaff  @relation(fields: [spaStaffId], references: [id])

  skill           String    // Skill code
  level           SkillLevel @default(PROFICIENT)
  certifiedDate   DateTime?
  expiryDate      DateTime?

  isActive        Boolean   @default(true)
}

enum SkillLevel {
  LEARNING
  PROFICIENT
  EXPERT
  MASTER
}

model SpaStaffSchedule {
  id              String    @id @default(uuid())
  spaStaffId      String
  spaStaff        SpaStaff  @relation(fields: [spaStaffId], references: [id])

  dayOfWeek       Int       // 0=Sunday, 6=Saturday
  startTime       DateTime  @db.Time
  endTime         DateTime  @db.Time

  // Breaks
  breakStart      DateTime? @db.Time
  breakEnd        DateTime? @db.Time

  isActive        Boolean   @default(true)
}

model SpaScheduleOverride {
  id              String    @id @default(uuid())
  spaStaffId      String
  spaStaff        SpaStaff  @relation(fields: [spaStaffId], references: [id])

  date            DateTime  @db.Date
  type            ScheduleOverrideType

  // For modified schedule
  startTime       DateTime? @db.Time
  endTime         DateTime? @db.Time

  reason          String?

  createdBy       String
  createdAt       DateTime  @default(now())
}

enum ScheduleOverrideType {
  DAY_OFF         // Not working
  MODIFIED        // Different hours
  BLOCKED         // Blocked for training, etc.
}
```

### UX Flow: Staff Schedule Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Staff Scheduling                                   Week of Feb 10, 2026 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ [< Prev Week]  [This Week]  [Next Week >]     [+ Add Staff]            │
│                                                                         │
│        │ Mon 10  │ Tue 11  │ Wed 12  │ Thu 13  │ Fri 14  │ Sat 15  │   │
│ ───────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤   │
│ Somjai │ 09-18   │ 09-18   │ OFF     │ 09-18   │ 09-18   │ 10-19   │   │
│ P.     │ 8 hrs   │ 8 hrs   │         │ 8 hrs   │ 8 hrs   │ 8 hrs   │   │
│        │ 4 appts │ 6 appts │         │ 5 appts │ 3 appts │ 7 appts │   │
│ ───────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤   │
│ Nisa   │ 09-18   │ OFF     │ 09-18   │ 09-18   │ 09-18   │ 10-19   │   │
│ K.     │ 8 hrs   │         │ 8 hrs   │ 8 hrs   │ 8 hrs   │ 8 hrs   │   │
│        │ 5 appts │         │ 4 appts │ 6 appts │ 4 appts │ 8 appts │   │
│ ───────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤   │
│ Ploy   │ 12-20   │ 12-20   │ 12-20   │ OFF     │ OFF     │ 10-19   │   │
│ S.     │ 7 hrs   │ 7 hrs   │ 7 hrs   │         │         │ 8 hrs   │   │
│        │ 3 appts │ 4 appts │ 5 appts │         │         │ 6 appts │   │
│ ───────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤   │
│ Mali   │ 09-17   │ 09-17   │ 09-17   │ 09-17   │ OFF     │ OFF     │   │
│ W.     │ 7 hrs   │ 7 hrs   │ 7 hrs   │ TRAIN   │         │         │   │
│        │ 4 appts │ 3 appts │ 4 appts │ Blocked │         │         │   │
│ ───────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘   │
│                                                                         │
│ Click a cell to edit schedule                                           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Edit Daily Schedule

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Edit Schedule: Somjai P.                                           [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Date: Monday, February 10, 2026                                         │
│                                                                         │
│ Status:                                                                 │
│ ● Working                                                               │
│ ○ Day Off                                                               │
│ ○ Blocked (training, meeting, etc.)                                     │
│                                                                         │
│ ─────────────── Working Hours ───────────────                           │
│                                                                         │
│ Start Time: [09:00__▼]                                                  │
│ End Time:   [18:00__▼]                                                  │
│                                                                         │
│ ☑ Include lunch break                                                   │
│ Break: [12:00__▼] to [13:00__▼]                                        │
│                                                                         │
│ ─────────────── Current Appointments ───────────────                    │
│                                                                         │
│ 4 appointments scheduled:                                               │
│                                                                         │
│  09:00 - 10:00  Thai Massage (John S.)                                 │
│  10:30 - 12:00  Deep Tissue (Jane D.)                                  │
│  14:00 - 15:30  Hot Stone (Bob W.)                                     │
│  16:00 - 17:00  Thai Massage (Sarah L.)                                │
│                                                                         │
│ ⚠️ Changing to "Day Off" will require rescheduling 4 appointments      │
│                                                                         │
│                                          [Cancel]  [Save Changes]       │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Staff Skills Matrix

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Staff Skills Matrix                                      [+ Add Skill]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│           │ Thai  │ Oil   │ Deep  │ Stone │ Facial│ Facial│ Body  │    │
│           │ Mass. │ Mass. │ Tiss. │       │ Basic │ Adv.  │ Scrub │    │
│ ──────────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┤    │
│ Somjai P. │  ★★★  │  ★★★  │  ★★☆  │  ★★★  │       │       │  ★☆☆  │    │
│ ──────────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┤    │
│ Nisa K.   │  ★★☆  │  ★★★  │  ★★☆  │       │       │       │  ★★☆  │    │
│ ──────────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┤    │
│ Ploy S.   │  ★★☆  │  ★★☆  │       │       │  ★★★  │  ★★☆  │       │    │
│ ──────────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┤    │
│ Mali W.   │  ★☆☆  │  ★★☆  │       │       │  ★★☆  │  ★☆☆  │  ★★★  │    │
│ ──────────┼───────┼───────┼───────┼───────┼───────┼───────┼───────┤    │
│ Dao R.    │       │       │       │       │  ★★★  │  ★★★  │  ★★☆  │    │
│ ──────────┴───────┴───────┴───────┴───────┴───────┴───────┴───────┘    │
│                                                                         │
│ Legend: ★★★ Expert  ★★☆ Proficient  ★☆☆ Learning  (blank) Not trained  │
│                                                                         │
│ Click a cell to update skill level                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Add/Edit Staff Skill

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Update Skill: Somjai P.                                            [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Skill: Deep Tissue Massage                                              │
│                                                                         │
│ Proficiency Level:                                                      │
│ ○ Learning (★☆☆) - Can perform with supervision                        │
│ ● Proficient (★★☆) - Can perform independently                         │
│ ○ Expert (★★★) - Can train others                                       │
│ ○ Master - Senior expert, develops techniques                          │
│                                                                         │
│ Certification:                                                          │
│ ☑ Certified                                                             │
│ Certified Date: [15/01/2024__]                                          │
│ Expiry Date:    [15/01/2027__] (optional)                               │
│                                                                         │
│ Notes:                                                                  │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ Completed advanced training at Thai Spa Academy                   │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│                                          [Remove Skill]  [Save]         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Feature 4: Resource Booking

### Description

Management of spa rooms, treatment beds, and equipment allocation to ensure optimal resource utilization.

### Resource Types

| Type | Description | Example |
|------|-------------|---------|
| Room | Treatment space | Massage room, facial suite |
| Bed | Treatment surface | Massage bed, facial bed |
| Equipment | Specialized tools | Hot stone set, steam cabinet |

### Data Model

```prisma
model SpaRoom {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  name            String    // "Massage Room 1", "Couples Suite"
  roomType        SpaRoomType
  description     String?

  // Capacity
  capacity        Int       @default(1) // 1 for single, 2 for couples

  // Features
  features        String[]  // ["SHOWER", "JACUZZI", "STEAM"]

  // Equipment in room
  equipment       SpaRoomEquipment[]

  // Scheduling
  isBookable      Boolean   @default(true)
  bufferMinutes   Int       @default(15) // Cleanup between appointments

  // Display
  displayOrder    Int       @default(0)
  color           String?   // Calendar color

  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  appointments    SpaAppointment[]
}

enum SpaRoomType {
  MASSAGE_SINGLE
  MASSAGE_COUPLES
  FACIAL
  BODY_TREATMENT
  STEAM_SAUNA
  CONSULTATION
  MULTI_PURPOSE
}

model SpaEquipment {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  name            String    // "Hot Stone Set A"
  equipmentType   String    // "HOT_STONES", "STEAM_CABINET"
  description     String?

  // Inventory
  quantity        Int       @default(1)
  availableQty    Int       @default(1)

  // Scheduling
  isBookable      Boolean   @default(true)
  requiresBooking Boolean   @default(false) // Must be pre-booked

  // Maintenance
  lastMaintenance DateTime?
  nextMaintenance DateTime?

  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  roomAssignments SpaRoomEquipment[]
  bookings        SpaEquipmentBooking[]
}

model SpaRoomEquipment {
  id              String    @id @default(uuid())
  roomId          String
  room            SpaRoom   @relation(fields: [roomId], references: [id])
  equipmentId     String
  equipment       SpaEquipment @relation(fields: [equipmentId], references: [id])

  isPermanent     Boolean   @default(true) // Fixed in room vs movable
}

model SpaEquipmentBooking {
  id              String    @id @default(uuid())
  equipmentId     String
  equipment       SpaEquipment @relation(fields: [equipmentId], references: [id])

  appointmentId   String?
  appointment     SpaAppointment? @relation(fields: [appointmentId], references: [id])

  date            DateTime  @db.Date
  startTime       DateTime  @db.Time
  endTime         DateTime  @db.Time

  bookedBy        String
  bookedAt        DateTime  @default(now())

  status          EquipmentBookingStatus @default(RESERVED)
}

enum EquipmentBookingStatus {
  RESERVED
  IN_USE
  RETURNED
  CANCELLED
}
```

### UX Flow: Room Management

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Spa Rooms                                               [+ Add Room]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ 🚪 Massage Room 1                                    ✅ Available │  │
│ │    Type: Single Massage Room                                      │  │
│ │    Capacity: 1 | Buffer: 15 min                                   │  │
│ │    Equipment: Massage bed, Hot stones                             │  │
│ │    Today: 6 appointments                                          │  │
│ │                                        [View Schedule]  [Edit]    │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ 🚪 Massage Room 2                                    🔴 Occupied  │  │
│ │    Type: Single Massage Room                                      │  │
│ │    Capacity: 1 | Buffer: 15 min                                   │  │
│ │    Equipment: Massage bed                                         │  │
│ │    Current: Thai Massage - ends 11:30                             │  │
│ │                                        [View Schedule]  [Edit]    │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ 🚪 Couples Suite                                     ✅ Available │  │
│ │    Type: Couples Room                                             │  │
│ │    Capacity: 2 | Buffer: 20 min                                   │  │
│ │    Equipment: 2x Massage beds, Hot stones, Jacuzzi               │  │
│ │    Features: Shower, Steam, Jacuzzi                               │  │
│ │    Today: 2 appointments                                          │  │
│ │                                        [View Schedule]  [Edit]    │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ 🚪 Facial Room 1                                     🔧 Cleaning  │  │
│ │    Type: Facial Room                                              │  │
│ │    Capacity: 1 | Buffer: 15 min                                   │  │
│ │    Equipment: Facial bed, Steamer, Magnifying lamp               │  │
│ │    Available at: 11:45                                            │  │
│ │                                        [View Schedule]  [Edit]    │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Room Schedule View

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Room Schedule: Massage Room 1                          📅 Feb 15, 2026  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ [< Prev Day]  [Today]  [Next Day >]                                     │
│                                                                         │
│  08:00 │                                                                │
│  ──────┤                                                                │
│  09:00 │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                          │
│        │ Thai Massage (60 min)                                          │
│        │ John Smith | Somjai P.                                         │
│  ──────┤░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                          │
│  10:00 │                                                                │
│  ──────┤──────────────────────────────────                              │
│  10:30 │ ████████████████████████████████████████                      │
│        │ Thai + Hot Stone (80 min)                                      │
│        │ Jane Doe | Somjai P.          ✓ CHECKED IN                    │
│  ──────┤████████████████████████████████████████                      │
│  11:00 │████████████████████████████████████████                      │
│  ──────┤████████████████████████████████████████                      │
│  11:30 │████████████████████████████████████████                      │
│  ──────┤──────── 🧹 Cleanup (15 min) ────────                          │
│  12:00 │                                                                │
│  ──────┤                                                                │
│  12:30 │                                                                │
│  ──────┤                                                                │
│  13:00 │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         │
│        │ Deep Tissue (90 min)                                           │
│        │ Bob Wilson | Nisa K.                                           │
│  ──────┴────────────────────────────────────────────────────────────    │
│                                                                         │
│ Legend: ░░░ Booked  ███ In Progress  ─── Cleanup                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Add/Edit Room

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Add Spa Room                                                       [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ─────────────── Basic Information ───────────────                       │
│                                                                         │
│ Room Name: [Massage Room 3________]                                     │
│                                                                         │
│ Room Type: [Single Massage Room__▼]                                     │
│                                                                         │
│ Capacity: [1__] person(s)                                               │
│                                                                         │
│ Description:                                                            │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ Quiet room with garden view, ideal for relaxation treatments     │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ─────────────── Scheduling ───────────────                              │
│                                                                         │
│ Buffer Time: [15__] minutes (cleanup between appointments)              │
│                                                                         │
│ ☑ Available for booking                                                 │
│                                                                         │
│ ─────────────── Features ───────────────                                │
│                                                                         │
│ ☑ Private Shower        ☐ Jacuzzi                                       │
│ ☐ Steam Room            ☐ Sound System                                  │
│ ☑ Dimmable Lighting     ☑ Garden View                                   │
│                                                                         │
│ ─────────────── Equipment ───────────────                               │
│                                                                         │
│ Permanent Equipment (always in room):                                   │
│ ☑ Massage Bed                                                           │
│ ☑ Towel Warmer                                                          │
│ ☐ Facial Steamer                                                        │
│                                                                         │
│ Calendar Color: [🟦 Blue_______▼]                                       │
│                                                                         │
│                                          [Cancel]  [Save Room]          │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Equipment Inventory

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Spa Equipment                                       [+ Add Equipment]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Equipment           Type          Qty    Available   Location           │
│ ─────────────────────────────────────────────────────────────────────── │
│ Hot Stone Set A     Hot Stones    1      ✅ Yes      Massage Room 1    │
│ Hot Stone Set B     Hot Stones    1      🔴 In Use   Couples Suite     │
│ Hot Stone Set C     Hot Stones    1      ✅ Yes      Storage           │
│ Steam Cabinet       Steam         1      ✅ Yes      Body Treatment    │
│ Facial Steamer A    Facial        1      ✅ Yes      Facial Room 1     │
│ Facial Steamer B    Facial        1      🔧 Maint.   Storage           │
│ Aromatherapy Kit    Aromatherapy  3      2 avail    Various           │
│ Massage Chair       Portable      2      ✅ 2 Yes    Storage           │
│                                                                         │
│ [View Maintenance Schedule]                                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Feature 5: Appointment Reminders

### Description

Automated SMS and email notifications for upcoming appointments with configurable timing and templates.

### Reminder Types

| Type | Timing | Channel |
|------|--------|---------|
| Confirmation | Immediate | Email |
| Reminder | 24 hours before | Email + SMS |
| Day-of | 2 hours before | SMS |
| Follow-up | 24 hours after | Email |

### Data Model

```prisma
model SpaReminderTemplate {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  name            String    // "24hr Reminder"
  type            ReminderType
  channel         ReminderChannel

  // Timing
  triggerType     TriggerType
  triggerValue    Int       // Hours before/after

  // Content
  subject         String?   // For email
  bodyTemplate    String    // With placeholders

  // Placeholders: {{member_name}}, {{service_name}}, {{date}}, {{time}},
  //               {{therapist}}, {{confirmation_code}}, {{cancel_link}}

  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  sentReminders   SpaSentReminder[]
}

enum ReminderType {
  CONFIRMATION
  REMINDER
  DAY_OF
  FOLLOW_UP
  CANCELLATION
  RESCHEDULE
}

enum ReminderChannel {
  EMAIL
  SMS
  BOTH
}

enum TriggerType {
  IMMEDIATE       // On booking
  HOURS_BEFORE    // Before appointment
  HOURS_AFTER     // After appointment
}

model SpaSentReminder {
  id              String    @id @default(uuid())
  templateId      String
  template        SpaReminderTemplate @relation(fields: [templateId], references: [id])

  appointmentId   String
  appointment     SpaAppointment @relation(fields: [appointmentId], references: [id])

  channel         ReminderChannel
  recipient       String    // Email or phone

  subject         String?
  body            String

  sentAt          DateTime  @default(now())
  status          ReminderStatus @default(SENT)

  // Delivery tracking
  deliveredAt     DateTime?
  openedAt        DateTime?
  clickedAt       DateTime?
  failureReason   String?
}

enum ReminderStatus {
  PENDING
  SENT
  DELIVERED
  OPENED
  CLICKED
  FAILED
  BOUNCED
}
```

### UX Flow: Reminder Templates List

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Appointment Reminders                            [+ Create Template]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ 📧 Booking Confirmation                              ✅ Active    │  │
│ │    Trigger: Immediately after booking                             │  │
│ │    Channel: Email                                                  │  │
│ │    Last sent: 15 minutes ago                                      │  │
│ │                                              [Preview]  [Edit]    │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ 📧📱 24-Hour Reminder                                ✅ Active    │  │
│ │    Trigger: 24 hours before appointment                           │  │
│ │    Channel: Email + SMS                                            │  │
│ │    Last sent: 2 hours ago                                         │  │
│ │                                              [Preview]  [Edit]    │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ 📱 Day-of Reminder                                   ✅ Active    │  │
│ │    Trigger: 2 hours before appointment                            │  │
│ │    Channel: SMS                                                    │  │
│ │    Last sent: 1 hour ago                                          │  │
│ │                                              [Preview]  [Edit]    │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ 📧 Post-Visit Follow-up                              ⏸ Paused    │  │
│ │    Trigger: 24 hours after appointment                            │  │
│ │    Channel: Email                                                  │  │
│ │    Last sent: 3 days ago                                          │  │
│ │                                              [Preview]  [Edit]    │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Create/Edit Reminder Template

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Edit Reminder Template                                             [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Template Name: [24-Hour Reminder_____]                                  │
│                                                                         │
│ ─────────────── Trigger ───────────────                                 │
│                                                                         │
│ Type: [Reminder__________▼]                                             │
│                                                                         │
│ Send: [24__] hours [before ▼] appointment                               │
│                                                                         │
│ ─────────────── Channel ───────────────                                 │
│                                                                         │
│ ☑ Email                                                                 │
│ ☑ SMS                                                                   │
│                                                                         │
│ ─────────────── Email Content ───────────────                           │
│                                                                         │
│ Subject:                                                                │
│ [Reminder: Your spa appointment tomorrow at {{time}}___]                │
│                                                                         │
│ Body:                                                                   │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ Dear {{member_name}},                                             │  │
│ │                                                                    │  │
│ │ This is a friendly reminder of your upcoming appointment:         │  │
│ │                                                                    │  │
│ │ Service: {{service_name}}                                         │  │
│ │ Date: {{date}}                                                    │  │
│ │ Time: {{time}}                                                    │  │
│ │ Therapist: {{therapist}}                                          │  │
│ │                                                                    │  │
│ │ Confirmation Code: {{confirmation_code}}                          │  │
│ │                                                                    │  │
│ │ Please arrive 10 minutes early. If you need to reschedule,        │  │
│ │ click here: {{cancel_link}}                                       │  │
│ │                                                                    │  │
│ │ We look forward to seeing you!                                    │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ─────────────── SMS Content ───────────────                             │
│                                                                         │
│ Message (160 chars max):                                                │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ Reminder: {{service_name}} tomorrow at {{time}} with              │  │
│ │ {{therapist}}. Reply CANCEL to cancel. - ClubVantage Spa         │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│ Characters: 142/160                                                     │
│                                                                         │
│ Available placeholders:                                                 │
│ {{member_name}} {{service_name}} {{date}} {{time}} {{therapist}}       │
│ {{confirmation_code}} {{cancel_link}} {{club_name}}                    │
│                                                                         │
│ ☑ Template is active                                                    │
│                                                                         │
│                          [Send Test]  [Cancel]  [Save Template]         │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Preview Reminder

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Preview: 24-Hour Reminder                                          [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Using sample data:                                                      │
│ Member: John Smith | Service: Thai Massage | Date: Feb 16, 2026        │
│                                                                         │
│ ─────────────── Email Preview ───────────────                           │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ From: ClubVantage Spa <spa@clubvantage.com>                       │  │
│ │ To: john.smith@email.com                                          │  │
│ │ Subject: Reminder: Your spa appointment tomorrow at 10:30 AM     │  │
│ │ ─────────────────────────────────────────────────────────────     │  │
│ │                                                                    │  │
│ │ Dear John,                                                        │  │
│ │                                                                    │  │
│ │ This is a friendly reminder of your upcoming appointment:         │  │
│ │                                                                    │  │
│ │ Service: Thai Traditional Massage                                 │  │
│ │ Date: February 16, 2026                                           │  │
│ │ Time: 10:30 AM                                                    │  │
│ │ Therapist: Somjai P.                                              │  │
│ │                                                                    │  │
│ │ Confirmation Code: SPA-2026-0216-001                              │  │
│ │                                                                    │  │
│ │ Please arrive 10 minutes early.                                   │  │
│ │                                                                    │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ─────────────── SMS Preview ───────────────                             │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ Reminder: Thai Traditional Massage tomorrow at 10:30 AM with     │  │
│ │ Somjai P. Reply CANCEL to cancel. - ClubVantage Spa              │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│                                                         [Close]         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Feature 6: Treatment Packages

### Description

Prepaid bundles allowing members to purchase multiple services at a discount.

### Package Types

| Type | Description | Example |
|------|-------------|---------|
| Fixed | Specific services included | "5 Thai Massages" |
| Flexible | Credit-based, any service | "฿5,000 Spa Credit" |
| Mixed | Combination | "3 Massages + 2 Facials" |

### Data Model

```prisma
model SpaPackage {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  name            String    // "Relaxation Package"
  description     String?

  // Type
  packageType     SpaPackageType @default(FIXED)

  // Pricing
  regularPrice    Decimal   // Sum of individual services
  packagePrice    Decimal   // Discounted package price
  memberPrice     Decimal?  // Member-specific price

  // Validity
  validityDays    Int       @default(365) // Days from purchase

  // Restrictions
  transferable    Boolean   @default(false)
  shareable       Boolean   @default(false) // Can family use?
  memberOnly      Boolean   @default(true)

  // Display
  displayOrder    Int       @default(0)
  featuredImage   String?
  isPromoted      Boolean   @default(false)

  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Contents
  items           SpaPackageItem[]
  purchases       SpaPackagePurchase[]
}

enum SpaPackageType {
  FIXED           // Specific services
  FLEXIBLE        // Credit-based
  MIXED           // Combination
}

model SpaPackageItem {
  id              String    @id @default(uuid())
  packageId       String
  package         SpaPackage @relation(fields: [packageId], references: [id])

  // For FIXED packages
  serviceId       String?
  service         SpaService? @relation(fields: [serviceId], references: [id])
  quantity        Int       @default(1)

  // For FLEXIBLE packages
  creditAmount    Decimal?  // ฿ value

  // For category-restricted flexible
  allowedCategories String[] // Empty = all categories
}

model SpaPackagePurchase {
  id              String    @id @default(uuid())
  packageId       String
  package         SpaPackage @relation(fields: [packageId], references: [id])

  memberId        String
  member          Member    @relation(fields: [memberId], references: [id])

  // Purchase details
  purchasePrice   Decimal
  purchasedAt     DateTime  @default(now())
  purchasedBy     String    // Staff who sold

  // Payment
  paymentMethod   String
  transactionId   String?

  // Validity
  validFrom       DateTime  @default(now())
  expiresAt       DateTime

  // Status
  status          PackageStatus @default(ACTIVE)

  // Tracking (for FIXED)
  totalSessions   Int       @default(0)
  usedSessions    Int       @default(0)
  remainingSessions Int     @default(0)

  // Tracking (for FLEXIBLE)
  totalCredit     Decimal   @default(0)
  usedCredit      Decimal   @default(0)
  remainingCredit Decimal   @default(0)

  // Notes
  notes           String?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  redemptions     SpaPackageRedemption[]
}

enum PackageStatus {
  ACTIVE
  EXHAUSTED       // All sessions/credit used
  EXPIRED
  CANCELLED
  REFUNDED
}
```

### UX Flow: Package Catalog

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Spa Packages                                        [+ Create Package]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ 🎁 Relaxation Package                               ⭐ Featured   │  │
│ │    5x Thai Traditional Massage (60 min)                           │  │
│ │                                                                    │  │
│ │    Regular: ฿6,000  →  Package: ฿5,000  (Save 17%)                │  │
│ │    Member:  ฿5,400  →  Package: ฿4,500  (Save 17%)                │  │
│ │                                                                    │  │
│ │    Valid: 12 months from purchase                                 │  │
│ │    Sold: 45 packages | Active: 32                                 │  │
│ │                                           [View Details]  [Edit]  │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ 🎁 Spa Day Experience                               ✅ Active     │  │
│ │    1x Thai Massage (60 min) + 1x Facial (60 min) + 1x Body Scrub │  │
│ │                                                                    │  │
│ │    Regular: ฿4,500  →  Package: ฿3,800  (Save 16%)                │  │
│ │                                                                    │  │
│ │    Valid: 6 months from purchase                                  │  │
│ │    Sold: 28 packages | Active: 15                                 │  │
│ │                                           [View Details]  [Edit]  │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ 🎁 Spa Credit (฿5,000)                              ✅ Active     │  │
│ │    ฿5,000 credit for any spa service                              │  │
│ │                                                                    │  │
│ │    Price: ฿5,000 (no discount - gift card style)                  │  │
│ │                                                                    │  │
│ │    Valid: 24 months from purchase                                 │  │
│ │    Sold: 12 packages | Active: 8                                  │  │
│ │                                           [View Details]  [Edit]  │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Create/Edit Package

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Create Spa Package                                                 [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ─────────────── Basic Information ───────────────                       │
│                                                                         │
│ Package Name: [Relaxation Package_____]                                 │
│                                                                         │
│ Description:                                                            │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ Perfect for regular spa-goers. Save on your favorite massage.    │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ Package Type: ● Fixed (specific services)                               │
│               ○ Flexible (credit-based)                                 │
│               ○ Mixed                                                   │
│                                                                         │
│ ─────────────── Package Contents ───────────────                        │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ Service                          Qty    Unit Price    Subtotal    │  │
│ │ ─────────────────────────────────────────────────────────────────  │  │
│ │ Thai Traditional Massage 60min   [5_]   ฿1,200       ฿6,000       │  │
│ │                                                         [Remove]  │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ [+ Add Service]                                                         │
│                                                                         │
│ ─────────────── Pricing ───────────────                                 │
│                                                                         │
│ Regular Value:           ฿6,000                                         │
│ Package Price:      ฿ [5,000____]  (17% discount)                       │
│ Member Package:     ฿ [4,500____]  (optional)                           │
│                                                                         │
│ ─────────────── Validity ───────────────                                │
│                                                                         │
│ Valid for: [12__] months from purchase                                  │
│                                                                         │
│ ─────────────── Restrictions ───────────────                            │
│                                                                         │
│ ☑ Members only                                                          │
│ ☐ Transferable to another member                                        │
│ ☐ Shareable with family members                                         │
│                                                                         │
│ ─────────────── Display ───────────────                                 │
│                                                                         │
│ ☑ Active                                                                │
│ ☑ Featured package (show prominently)                                   │
│                                                                         │
│                                          [Cancel]  [Save Package]       │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Sell Package (POS)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Sell Spa Package                                                   [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Member: John Smith (M-1234)                              [Gold Tier]    │
│                                                                         │
│ ─────────────── Select Package ───────────────                          │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ ● Relaxation Package                                              │  │
│ │   5x Thai Traditional Massage (60 min)                            │  │
│ │   Member Price: ฿4,500 (Save ฿900)                                │  │
│ │   Valid: 12 months                                                │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ ○ Spa Day Experience                                              │  │
│ │   Massage + Facial + Body Scrub                                   │  │
│ │   Member Price: ฿3,420 (Save ฿380)                                │  │
│ │   Valid: 6 months                                                 │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ─────────────── Package Details ───────────────                         │
│                                                                         │
│ Start Date: [Today_________▼]                                           │
│ Expires:    February 1, 2027                                            │
│                                                                         │
│ ─────────────── Summary ───────────────                                 │
│                                                                         │
│ Relaxation Package                               ฿4,500                 │
│ Tax (7%)                                         ฿  315                 │
│ ─────────────────────────────────────────────────────────              │
│ Total                                            ฿4,815                 │
│                                                                         │
│ Payment: ○ Charge to account  ● Credit card  ○ Cash                    │
│                                                                         │
│                                          [Cancel]  [Complete Sale]      │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Feature 7: Package Redemption

### Description

Track package usage, remaining sessions, and handle redemptions during booking and checkout.

### Data Model

```prisma
model SpaPackageRedemption {
  id              String    @id @default(uuid())
  purchaseId      String
  purchase        SpaPackagePurchase @relation(fields: [purchaseId], references: [id])

  appointmentId   String?   @unique
  appointment     SpaAppointment? @relation(fields: [appointmentId], references: [id])

  // What was redeemed
  serviceId       String?
  service         SpaService? @relation(fields: [serviceId], references: [id])

  // For fixed packages
  sessionsUsed    Int       @default(1)

  // For flexible packages
  creditUsed      Decimal   @default(0)

  // Value
  retailValue     Decimal   // What service would normally cost

  // Status
  status          RedemptionStatus @default(PENDING)

  redeemedAt      DateTime?
  redeemedBy      String?   // Staff who processed

  // Reversal
  reversedAt      DateTime?
  reversedBy      String?
  reversalReason  String?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum RedemptionStatus {
  PENDING         // Booked but not completed
  REDEEMED        // Service completed
  REVERSED        // Redemption cancelled
  EXPIRED         // Package expired before use
}
```

### UX Flow: Member Package Status

```
┌─────────────────────────────────────────────────────────────────────────┐
│ My Spa Packages                                      John Smith (M-1234)│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ 🎁 Relaxation Package                              ✅ Active      │  │
│ │                                                                    │  │
│ │ Thai Traditional Massage (60 min)                                 │  │
│ │                                                                    │  │
│ │ Sessions:  ████████░░ 4 of 5 remaining                           │  │
│ │                                                                    │  │
│ │ Purchased: Jan 15, 2026                                           │  │
│ │ Expires:   Jan 14, 2027 (347 days left)                          │  │
│ │                                                                    │  │
│ │ Usage History:                                                    │  │
│ │   • Feb 1, 2026 - Thai Massage with Somjai P.                    │  │
│ │                                                                    │  │
│ │                                              [Book Appointment]   │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ 🎁 Spa Credit                                      ✅ Active      │  │
│ │                                                                    │  │
│ │ Credit Balance:  ฿3,200 of ฿5,000 remaining                       │  │
│ │                  ████████████░░░░░░ 64%                           │  │
│ │                                                                    │  │
│ │ Expires: Dec 31, 2027                                             │  │
│ │                                                                    │  │
│ │ Recent Usage:                                                     │  │
│ │   • Jan 20, 2026 - Deep Tissue Massage (-฿1,800)                 │  │
│ │                                                                    │  │
│ │                                              [Book Appointment]   │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Redeem Package During Booking

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Payment Options                                                    [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Service: Thai Traditional Massage (60 min)                              │
│ Regular Price: ฿1,200  |  Member Price: ฿1,080                          │
│                                                                         │
│ ─────────────── Available Packages ───────────────                      │
│                                                                         │
│ ● Use Package: Relaxation Package                                       │
│   4 sessions remaining (expires Jan 14, 2027)                           │
│   Value: ฿1,200 → Package covers full amount                            │
│                                                                         │
│ ● Use Credit: Spa Credit                                                │
│   ฿3,200 remaining                                                      │
│   Will use: ฿1,080 (member price)                                       │
│   Remaining after: ฿2,120                                               │
│                                                                         │
│ ─────────────── Or Pay Now ───────────────                              │
│                                                                         │
│ ○ Charge to member account                                              │
│ ○ Credit card                                                           │
│ ○ Cash                                                                  │
│                                                                         │
│ ─────────────── Summary ───────────────                                 │
│                                                                         │
│ Thai Traditional Massage (60 min)                ฿1,080                 │
│ Package Redemption (Relaxation Package)         −฿1,080                 │
│ ─────────────────────────────────────────────────────────              │
│ Amount Due                                       ฿    0                 │
│                                                                         │
│                                          [Cancel]  [Confirm Booking]    │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Staff View - Package Redemption at Checkout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Checkout: John Smith                                               [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Appointment: Thai Traditional Massage (60 min) with Somjai P.           │
│ Status: ✅ Completed                                                    │
│                                                                         │
│ ─────────────── Payment ───────────────                                 │
│                                                                         │
│ 🎁 Package Redemption Applied                                           │
│                                                                         │
│ Package: Relaxation Package                                             │
│ Sessions Before: 4 remaining                                            │
│ Sessions Used:   1                                                      │
│ Sessions After:  3 remaining                                            │
│                                                                         │
│ Service Value:               ฿1,200                                     │
│ Package Coverage:           −฿1,200                                     │
│ ─────────────────────────────────────────────────────────              │
│ Amount Due:                  ฿    0                                     │
│                                                                         │
│ ─────────────── Add Products? ───────────────                           │
│                                                                         │
│ [+ Add Retail Products]                                                 │
│                                                                         │
│                                          [Print Receipt]  [Complete]    │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Package Expiring Soon Alert

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ⚠️ Expiring Packages                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ 8 packages expiring in the next 30 days:                                │
│                                                                         │
│ Member          Package              Remaining  Expires    Value        │
│ ─────────────────────────────────────────────────────────────────────── │
│ Jane Doe        Relaxation (5x)      2 sessions Feb 15    ฿2,400       │
│ Bob Wilson      Spa Day              1 session  Feb 20    ฿3,800       │
│ Sarah Lee       Spa Credit           ฿800       Feb 28    ฿  800       │
│ Tom Brown       Relaxation (5x)      3 sessions Mar 1     ฿3,600       │
│                                                                         │
│ [Send Reminder Emails]  [Export List]  [View All]                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Feature 8: Product Sales

### Description

Retail sales of skincare products, spa accessories, and other merchandise at the spa reception.

### Product Categories

| Category | Examples |
|----------|----------|
| Skincare | Moisturizers, serums, masks |
| Body Care | Lotions, oils, scrubs |
| Aromatherapy | Essential oils, diffusers |
| Accessories | Robes, slippers, candles |
| Gift Items | Gift sets, vouchers |

### Data Model

```prisma
model SpaProduct {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  // Basic info
  name            String
  description     String?
  brand           String?

  // Categorization
  categoryId      String
  category        SpaProductCategory @relation(fields: [categoryId], references: [id])

  // SKU & Barcode
  sku             String    @unique
  barcode         String?

  // Pricing
  costPrice       Decimal   // Purchase cost
  retailPrice     Decimal
  memberPrice     Decimal?
  taxType         TaxType   @default(ADD)

  // Inventory
  trackInventory  Boolean   @default(true)
  stockQuantity   Int       @default(0)
  lowStockAlert   Int       @default(5)
  reorderPoint    Int       @default(10)

  // Display
  displayOrder    Int       @default(0)
  image           String?
  isPromoted      Boolean   @default(false)

  // Status
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  variants        SpaProductVariant[]
  sales           SpaProductSale[]
  recommendations SpaServiceProductRec[]
}

model SpaProductCategory {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  name            String
  description     String?
  displayOrder    Int       @default(0)

  isActive        Boolean   @default(true)

  products        SpaProduct[]
}

model SpaProductVariant {
  id              String    @id @default(uuid())
  productId       String
  product         SpaProduct @relation(fields: [productId], references: [id])

  name            String    // "50ml", "100ml", "Travel Size"
  sku             String    @unique
  barcode         String?

  // Pricing (overrides base)
  retailPrice     Decimal?
  memberPrice     Decimal?
  costPrice       Decimal?

  // Inventory
  stockQuantity   Int       @default(0)

  isActive        Boolean   @default(true)
}

model SpaServiceProductRec {
  id              String    @id @default(uuid())
  serviceId       String
  service         SpaService @relation(fields: [serviceId], references: [id])
  productId       String
  product         SpaProduct @relation(fields: [productId], references: [id])

  // Recommendation strength
  priority        Int       @default(0) // Higher = show first
  reason          String?   // "Recommended after facial"

  isActive        Boolean   @default(true)
}

model SpaProductSale {
  id              String    @id @default(uuid())
  productId       String
  product         SpaProduct @relation(fields: [productId], references: [id])
  variantId       String?
  variant         SpaProductVariant? @relation(fields: [variantId], references: [id])

  // Transaction
  lineItemId      String
  lineItem        BookingLineItem @relation(fields: [lineItemId], references: [id])

  quantity        Int
  unitPrice       Decimal
  totalPrice      Decimal

  soldAt          DateTime  @default(now())
  soldBy          String
}
```

### UX Flow: Product Catalog

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Spa Products                                         [+ Add Product]    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Category: [All______▼]  Brand: [All____▼]  Search: [__________] 🔍     │
│                                                                         │
│ ┌─ Skincare ────────────────────────────────────────────────────────┐  │
│ │                                                                    │  │
│ │ Product               Brand      Price     Stock    Status        │  │
│ │ ─────────────────────────────────────────────────────────────────  │  │
│ │ Hydrating Serum       Elemis     ฿2,400    12       ✅ In Stock   │  │
│ │ Anti-Aging Cream      Elemis     ฿3,200    5        ⚠️ Low Stock  │  │
│ │ Cleansing Gel         Dermalog.  ฿1,100    18       ✅ In Stock   │  │
│ │ Eye Contour           Elemis     ฿1,800    0        🔴 Out        │  │
│ │                                                                    │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌─ Body Care ───────────────────────────────────────────────────────┐  │
│ │                                                                    │  │
│ │ Product               Brand      Price     Stock    Status        │  │
│ │ ─────────────────────────────────────────────────────────────────  │  │
│ │ Body Lotion 200ml     Aromather. ฿  650    24       ✅ In Stock   │  │
│ │ Massage Oil           House      ฿  450    30       ✅ In Stock   │  │
│ │ Salt Scrub            Aromather. ฿  780    8        ✅ In Stock   │  │
│ │                                                                    │  │
│ └────────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ [Low Stock Report]  [Reorder List]                                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Add Product to Cart (POS)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Add Product                                                        [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Search: [Hydrating____] 🔍          Or scan barcode: [________]        │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │                                                                    │  │
│ │ 🧴 Elemis Hydrating Serum                                         │  │
│ │    SKU: SPA-ELE-001                                               │  │
│ │    Regular: ฿2,400  |  Member: ฿2,160                             │  │
│ │    Stock: 12 available                                            │  │
│ │                                                                    │  │
│ │    Variants:                                                      │  │
│ │    ○ 30ml - ฿1,400  (8 in stock)                                 │  │
│ │    ● 50ml - ฿2,400  (12 in stock)                                │  │
│ │    ○ 100ml - ฿4,200  (4 in stock)                                │  │
│ │                                                                    │  │
│ │    Quantity: [−] [1] [+]                                          │  │
│ │                                                                    │  │
│ │                                               [Add to Cart]       │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ Recently Sold:                                                          │
│ • Body Lotion 200ml (฿650)                                             │
│ • Massage Oil (฿450)                                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Product Recommendations (Post-Service)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Checkout: Jane Doe - Deep Cleansing Facial                         [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Service Complete ✅                                                     │
│                                                                         │
│ ─────────────── Recommended Products ───────────────                    │
│                                                                         │
│ Based on today's Deep Cleansing Facial:                                 │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ ☐ Elemis Hydrating Serum (50ml)                      ฿2,160      │  │
│ │   Continue hydration at home                                      │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ ☐ Dermalogica Daily Cleanser                         ฿  990      │  │
│ │   Maintain your results with daily cleansing                      │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ ☑ Sheet Mask Set (5 pack)                            ฿  720      │  │
│ │   Weekly maintenance masks                                        │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ [Skip Products]                          [Add Selected to Cart]         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Feature 9: Combined Checkout

### Description

Single transaction combining spa services and retail products with package redemptions, discounts, and multiple payment methods.

### Data Model

```prisma
// Uses existing BookingLineItem with spa-specific types

enum LineItemType {
  // Existing types...
  SPA_SERVICE
  SPA_ADD_ON
  SPA_PRODUCT
  SPA_PACKAGE
  SPA_PACKAGE_REDEMPTION // Negative amount for package use
}

// Checkout session for spa
model SpaCheckoutSession {
  id              String    @id @default(uuid())
  clubId          String

  // Customer
  memberId        String?
  member          Member?   @relation(fields: [memberId], references: [id])
  guestName       String?

  // Appointments being checked out
  appointmentIds  String[]

  // Status
  status          CheckoutStatus @default(IN_PROGRESS)

  // Totals
  servicesTotal   Decimal   @default(0)
  productsTotal   Decimal   @default(0)
  packagesApplied Decimal   @default(0) // Negative (package redemptions)
  discountsApplied Decimal  @default(0) // Negative
  taxTotal        Decimal   @default(0)
  grandTotal      Decimal   @default(0)

  // Line items
  lineItems       BookingLineItem[]

  // Payments
  payments        PaymentTransaction[]

  // Staff
  processedBy     String
  processedAt     DateTime?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum CheckoutStatus {
  IN_PROGRESS
  PENDING_PAYMENT
  COMPLETED
  CANCELLED
}
```

### UX Flow: Combined Checkout Screen

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Spa Checkout                                                       [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Customer: Jane Doe (M-2345)                              [Gold Tier]    │
│                                                                         │
│ ─────────────── Services ───────────────                                │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ Deep Cleansing Facial (60 min)                       ฿1,350      │  │
│ │   Therapist: Dao R.  |  Completed at 11:30                       │  │
│ │                                                                    │  │
│ │ + Aromatherapy Add-on                                ฿  270      │  │
│ │   ─────────────────────────────────────────────────────────       │  │
│ │   Subtotal                                           ฿1,620   [%] │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ─────────────── Products ───────────────                                │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ Elemis Hydrating Serum (50ml)           × 1          ฿2,160      │  │
│ │ Sheet Mask Set (5 pack)                 × 1          ฿  720      │  │
│ │   ─────────────────────────────────────────────────────────       │  │
│ │   Subtotal                                           ฿2,880   [%] │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ [+ Add Product]                                                         │
│                                                                         │
│ ═══════════════════════════════════════════════════════════════════════ │
│                                                                         │
│ Services Subtotal                                      ฿1,620           │
│ Products Subtotal                                      ฿2,880           │
│ ───────────────────────────────────────────────────────────────         │
│ Subtotal                                               ฿4,500           │
│                                                                         │
│ 💰 Gold Member Discount (10%)                          −฿  450          │
│ ───────────────────────────────────────────────────────────────         │
│ Subtotal after discount                                ฿4,050           │
│ Tax (7%)                                               ฿  284           │
│ ═══════════════════════════════════════════════════════════════════════ │
│ TOTAL                                                  ฿4,334           │
│                                                                         │
│                                    [Add Discount]  [Proceed to Payment] │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Payment Selection

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Payment                                                            [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Total Due: ฿4,334.00                                                    │
│                                                                         │
│ ─────────────── Payment Method ───────────────                          │
│                                                                         │
│ ● Single Payment                                                        │
│ ○ Split Payment                                                         │
│                                                                         │
│ Method:                                                                 │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ ○ Charge to Member Account                                        │  │
│ │   Available Credit: ฿45,666                                       │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ ● Saved Card: Visa ****4521                                       │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ ○ Other Credit Card                                               │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ ○ Cash                                                            │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│ ─────────────── Add Tip? ───────────────                                │
│                                                                         │
│ [No Tip]  [10%]  [15%]  [20%]  [Custom: ฿_____]                        │
│                                                                         │
│ Tip: ฿650 (15%)                                                         │
│ ───────────────────────────────────────────────────────────────         │
│ Total with Tip: ฿4,984.00                                               │
│                                                                         │
│                                          [Back]  [Complete Payment]     │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Split Payment

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Split Payment                                                      [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Total Due: ฿4,984.00                                                    │
│                                                                         │
│ ─────────────── Payment 1 ───────────────                               │
│                                                                         │
│ Method: [Member Account_____▼]                                          │
│ Amount: ฿ [3,000____]                                                   │
│                                                   Status: ✅ Ready      │
│                                                                         │
│ ─────────────── Payment 2 ───────────────                               │
│                                                                         │
│ Method: [Cash_____________▼]                                            │
│ Amount: ฿ [1,984____]                                                   │
│                                                   Status: ✅ Ready      │
│                                                                         │
│ [+ Add Another Payment]                                                 │
│                                                                         │
│ ═══════════════════════════════════════════════════════════════════════ │
│                                                                         │
│ Total Due:                                             ฿4,984.00        │
│ Payments:                                             −฿4,984.00        │
│ ───────────────────────────────────────────────────────────────         │
│ Remaining:                                             ฿    0.00        │
│                                                                         │
│                                          [Back]  [Process Payments]     │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Payment Complete

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                           ✅ Payment Complete                           │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                    Receipt #: SPA-2026-0215-0042                        │
│                                                                         │
│ ┌───────────────────────────────────────────────────────────────────┐  │
│ │ Customer: Jane Doe (M-2345)                                       │  │
│ │ Date: February 15, 2026 at 11:45 AM                               │  │
│ │                                                                    │  │
│ │ Services:                                                         │  │
│ │   Deep Cleansing Facial                           ฿1,350          │  │
│ │   + Aromatherapy Add-on                           ฿  270          │  │
│ │                                                                    │  │
│ │ Products:                                                         │  │
│ │   Elemis Hydrating Serum (50ml)                   ฿2,160          │  │
│ │   Sheet Mask Set (5 pack)                         ฿  720          │  │
│ │                                                                    │  │
│ │ Subtotal                                          ฿4,500          │  │
│ │ Member Discount (10%)                            −฿  450          │  │
│ │ Tax (7%)                                          ฿  284          │  │
│ │ Tip                                               ฿  650          │  │
│ │ ─────────────────────────────────────────────────                 │  │
│ │ Total Paid                                        ฿4,984          │  │
│ │                                                                    │  │
│ │ Payments:                                                         │  │
│ │   Member Account                                  ฿3,000          │  │
│ │   Cash                                            ฿1,984          │  │
│ │                                                                    │  │
│ └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│     [Print Receipt]     [Email Receipt]     [New Transaction]           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### UX Flow: Error State - Insufficient Credit

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ⚠️ Payment Cannot Be Processed                                     [X]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ Insufficient credit on member account.                                  │
│                                                                         │
│ Total Due:           ฿4,984.00                                          │
│ Available Credit:    ฿2,500.00                                          │
│ Shortfall:           ฿2,484.00                                          │
│                                                                         │
│ Options:                                                                │
│                                                                         │
│ ○ Pay shortfall with different method                                   │
│   [Credit Card ▼]  Amount: ฿2,484.00                                   │
│                                                                         │
│ ○ Reduce charge to member account                                       │
│   Charge: ฿2,500.00  |  Pay remainder: ฿2,484.00 by [Card ▼]           │
│                                                                         │
│ ○ Use different payment method for full amount                          │
│                                                                         │
│                                          [Cancel]  [Continue]           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Summary

| Feature | Priority | Complexity |
|---------|----------|------------|
| 1. Service Menu | Critical | Medium |
| 2. Online Booking | Critical | High |
| 3. Staff Scheduling | Critical | Medium |
| 4. Resource Booking | Critical | Medium |
| 5. Appointment Reminders | Medium | Low |
| 6. Treatment Packages | Critical | Medium |
| 7. Package Redemption | Critical | Medium |
| 8. Product Sales | Critical | Low |
| 9. Combined Checkout | Critical | High |

**Recommended Implementation Order:**

1. Service Menu (foundation for all booking)
2. Staff Scheduling (required for availability)
3. Resource Booking (rooms/equipment allocation)
4. Online Booking (member-facing, depends on 1-3)
5. Treatment Packages (sales feature)
6. Package Redemption (depends on packages)
7. Product Sales (retail catalog)
8. Combined Checkout (ties everything together)
9. Appointment Reminders (enhancement, can be parallel)
