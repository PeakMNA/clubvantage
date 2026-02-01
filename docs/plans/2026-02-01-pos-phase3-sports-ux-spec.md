# POS Phase 3: Sports/Courts Module - UX Specification

**Date:** 2026-02-01
**Status:** Draft
**Purpose:** Detailed UX flows for Phase 3 Sports/Courts Module features

---

## Overview

This document covers the UX flows for all Phase 3 (Sports/Courts Module) features:

1. Court Calendar
2. Online Booking
3. Booking Rules
4. Resource Types
5. Guest Booking
6. Class Scheduling
7. Class Registration
8. Rental Items
9. Rental Checkout

---

## Feature 1: Court Calendar

### Description

Visual grid view displaying court availability by time slot. Supports day and week views with drag-and-drop booking capabilities.

### Calendar View Types

| View | Description | Use Case |
|------|-------------|----------|
| Day View | Single day, all courts as columns | Staff booking, check-ins |
| Week View | 7 days, single court or all courts | Member planning, utilization review |
| Resource View | Grouped by resource type | Multi-sport facility management |

### Data Model

```prisma
model Facility {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  name            String    // "Tennis Center", "Aquatic Center"
  description     String?

  operatingHours  Json      // {"mon": {"open": "06:00", "close": "22:00"}, ...}

  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  resources       Resource[]
}

model Resource {
  id              String    @id @default(uuid())
  facilityId      String
  facility        Facility  @relation(fields: [facilityId], references: [id])

  name            String    // "Court 1", "Lane 3", "Treadmill 5"
  resourceTypeId  String
  resourceType    ResourceType @relation(fields: [resourceTypeId], references: [id])

  description     String?
  capacity        Int       @default(4)   // Max players/users

  // Location
  floor           String?
  building        String?

  // Availability
  isActive        Boolean   @default(true)
  isBookable      Boolean   @default(true)

  // Display
  sortOrder       Int       @default(0)
  color           String?   // Hex color for calendar display

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  bookings        ResourceBooking[]
  blockedSlots    ResourceBlockedSlot[]
}

model ResourceBooking {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  resourceId      String
  resource        Resource  @relation(fields: [resourceId], references: [id])

  // Timing
  startTime       DateTime
  endTime         DateTime
  duration        Int       // Minutes

  // Booker
  memberId        String?
  member          Member?   @relation(fields: [memberId], references: [id])
  bookedById      String    // Staff or member who made booking

  // Booking details
  bookingType     BookingType @default(MEMBER)
  playerCount     Int       @default(1)
  notes           String?

  // Pricing
  basePrice       Decimal
  discountAmount  Decimal   @default(0)
  totalPrice      Decimal
  isPaid          Boolean   @default(false)

  // Status
  status          BookingStatus @default(CONFIRMED)
  checkedInAt     DateTime?
  checkedInBy     String?
  completedAt     DateTime?
  cancelledAt     DateTime?
  cancelledBy     String?
  cancellationReason String?

  // Guest info
  guests          BookingGuest[]

  // Linked items
  rentalCheckouts RentalCheckout[]
  classId         String?   // If booked for a class
  class           FacilityClass? @relation(fields: [classId], references: [id])

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum BookingType {
  MEMBER        // Member booking
  GUEST         // Guest booking (with member sponsor)
  CLASS         // Reserved for class
  MAINTENANCE   // Blocked for maintenance
  TOURNAMENT    // Tournament block
  PRIVATE_EVENT // Private event
}

enum BookingStatus {
  PENDING       // Awaiting confirmation
  CONFIRMED     // Booking confirmed
  CHECKED_IN    // Player checked in
  IN_PROGRESS   // Currently using court
  COMPLETED     // Session finished
  NO_SHOW       // Did not arrive
  CANCELLED     // Booking cancelled
}

model ResourceBlockedSlot {
  id              String    @id @default(uuid())
  resourceId      String
  resource        Resource  @relation(fields: [resourceId], references: [id])

  startTime       DateTime
  endTime         DateTime

  reason          BlockedReason
  notes           String?

  // Recurring blocks
  isRecurring     Boolean   @default(false)
  recurrenceRule  String?   // RRULE format

  createdBy       String
  createdAt       DateTime  @default(now())
}

enum BlockedReason {
  MAINTENANCE
  TOURNAMENT
  PRIVATE_EVENT
  WEATHER
  STAFF_TRAINING
  OTHER
}
```

### UX Flow: Day View Calendar

**Default view showing all courts for a single day**

```
+---------------------------------------------------------------------------------+
| Court Calendar                                              [Day] [Week] [List] |
+---------------------------------------------------------------------------------+
| < 01 Feb 2026 (Today) >                    [Tennis ▼] [All Courts ▼] [+ Block]  |
+---------------------------------------------------------------------------------+
|         | Court 1    | Court 2    | Court 3    | Court 4    | Court 5    |
+---------+------------+------------+------------+------------+------------+
| 06:00   | Available  | Available  | Available  |            |            |
+---------+------------+------------+------------+ MAINTENANCE|            |
| 06:30   | Available  | Available  | Available  |            | TOURNAMENT |
+---------+------------+------------+------------+            |            |
| 07:00   |+---------+| Available  | Available  |            |   Block    |
|         || J.Smith ||            |            |            |   Until    |
| 07:30   || 2 players|+----------+|+---------+|            |   12:00    |
|         || Tennis   || B.Wilson || Class:   ||            |            |
| 08:00   |+---------+|| Singles  || Morning  ||+---------+|            |
|         | Available ||          || Cardio   ||| S.Lee   ||            |
| 08:30   | Available |+----------+|| 8/12    ||| + 1 Guest|+------------+
|         |            | Available |+---------+|+---------+| Available  |
| 09:00   | Available  | Available  | Available  | Available  | Available  |
+---------+------------+------------+------------+------------+------------+

Legend: [Member] [Class] [Guest] [Blocked] [Available]

Status Bar:
Today's Bookings: 23/48 (48%)  |  Check-ins: 12  |  No-shows: 2  |  Revenue: B12,450
```

### UX Flow: Week View Calendar

**Week view for a single court**

```
+---------------------------------------------------------------------------------+
| Court Calendar - Court 1                                    [Day] [Week] [List] |
+---------------------------------------------------------------------------------+
| < Week of 01 Feb 2026 >                             [Tennis ▼] [Court 1 ▼]      |
+---------------------------------------------------------------------------------+
|         | Sat 01   | Sun 02   | Mon 03   | Tue 04   | Wed 05   | Thu 06   | Fri |
+---------+----------+----------+----------+----------+----------+----------+-----+
| 06:00   |          |          |+--------+|          |+--------+|          |     |
|         |          |          || Weekly ||          || Weekly ||          |     |
| 07:00   |+--------+|          ||Standing||+--------+||Standing||+--------+|     |
|         || J.Smith||          ||J.Smith |||A.Kumar |||J.Smith |||M.Patel ||     |
| 08:00   |+--------+|+--------+|+--------+|+--------+|+--------+|+--------+|     |
|         |          || Family ||          |          |          |          |     |
| 09:00   |+--------+|| Booking||          |          |          |          |     |
|         || Class: ||+--------+|+--------+|+--------+|          |+--------+|     |
| 10:00   || Junior ||          ||Coaching|||Class:  ||          ||Coaching||     |
|         || Tennis||          || Lesson |||Ladies  ||          || Lesson ||     |
| 11:00   |+--------+|          |+--------+||Tennis  ||          |+--------+|     |
+---------+----------+----------+----------+----------+----------+----------+-----+

[ ] Show only available slots   [ ] Show classes   [ ] Show recurring
```

### UX Flow: Create Booking Modal

**Triggered by clicking empty slot or [+ New Booking] button**

```
+---------------------------------------------------------------------------------+
| New Court Booking                                                          [X]  |
+---------------------------------------------------------------------------------+
| Resource:         [Court 1 - Tennis ▼]                                          |
|                                                                                 |
| Date:             [01 Feb 2026 ▼]                                               |
|                                                                                 |
| Start Time:       [08:00 ▼]        Duration: [60 min ▼]                         |
| End Time:         08:00 - 09:00                                                 |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Booking Type:     ( ) Member    ( ) Guest    ( ) Block                          |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Member:           [Search member...____________] [Scan Card]                    |
|                                                                                 |
|                   +------------------------------------------------------+      |
|                   | John Smith (M-1234)                        [Select] |      |
|                   |   Gold Member | Credit: B45,000 available           |      |
|                   +------------------------------------------------------+      |
|                                                                                 |
| Players:          [2 ▼]  (Max: 4)                                               |
|                                                                                 |
| Additional Players:                                        [+ Add Player]       |
|                   +------------------------------------------------------+      |
|                   | Player 2: [Search member or enter guest...] [X]     |      |
|                   +------------------------------------------------------+      |
|                                                                                 |
| Notes:            [_________________________________________________]          |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Pricing                                                                         |
+---------------------------------------------------------------------------------+
| Court Fee (60 min peak):                                    B600.00             |
| Member Discount (10%):                                     -B 60.00             |
|                                                            -----------          |
| Total:                                                      B540.00             |
|                                                                                 |
| Payment:          ( ) Charge to Account    ( ) Pay Now    ( ) Pay at Check-in   |
+---------------------------------------------------------------------------------+
|                                             [Cancel]    [Book Court]            |
+---------------------------------------------------------------------------------+
```

### UX Flow: Booking Details / Check-in

**Click on existing booking to view/manage**

```
+---------------------------------------------------------------------------------+
| Court Booking Details                                                      [X]  |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Status:           [CONFIRMED]  -->  [Check In]  [Mark No-Show]                  |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Booking Information                                                             |
+---------------------------------------------------------------------------------+
| Court:            Court 1 - Tennis                                              |
| Date:             Saturday, 01 Feb 2026                                         |
| Time:             08:00 - 09:00 (60 min)                                        |
| Booked:           29 Jan 2026 by John Smith (Online)                            |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Players                                                                         |
+---------------------------------------------------------------------------------+
| 1. John Smith (M-1234)         Primary     [x] Checked In    08:02              |
| 2. Sarah Smith (M-1234-D1)     Dependent   [ ] Pending                          |
|                                                                                 |
|                                                            [+ Add Player]       |
+---------------------------------------------------------------------------------+
| Equipment Rentals                                          [+ Add Rental]       |
+---------------------------------------------------------------------------------+
| Tennis Racquet x2              B100.00/hr     [Checked Out] [Return]            |
| Ball Hopper                    B 50.00/hr     [Reserved]    [Check Out]         |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Payment Summary                                                                 |
+---------------------------------------------------------------------------------+
| Court Fee:                                                  B600.00             |
| Member Discount:                                           -B 60.00             |
| Equipment Rental:                                           B200.00             |
|                                                            -----------          |
| Total:                                                      B740.00             |
| Status:           Charged to Account                                            |
|                                                                                 |
+---------------------------------------------------------------------------------+
|                    [Cancel Booking]  [Edit]  [Print Confirmation]  [Close]      |
+---------------------------------------------------------------------------------+
```

### UX Flow: Drag-and-Drop Reschedule

**Staff drags booking to new time slot**

```
+---------------------------------------------------------------------------------+
| Reschedule Booking                                                         [X]  |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Moving booking for: John Smith                                                  |
|                                                                                 |
| From:             Court 1  |  08:00 - 09:00  |  01 Feb 2026                     |
| To:               Court 2  |  10:00 - 11:00  |  01 Feb 2026                     |
|                                                                                 |
| Price Change:     B600.00 --> B600.00 (no change)                               |
|                                                                                 |
| [ ] Notify member via email                                                     |
| [ ] Notify member via SMS                                                       |
|                                                                                 |
| Reason:           [Court preference_______________________▼]                    |
|                                                                                 |
|                                             [Cancel]    [Confirm Move]          |
+---------------------------------------------------------------------------------+
```

---

## Feature 2: Online Booking

### Description

Member self-service portal for court reservations. Includes availability search, booking flow, and confirmation.

### Online Booking Features

| Feature | Description | Example |
|---------|-------------|---------|
| Availability Search | View open slots by date/time/court | Find tennis courts available Saturday morning |
| Quick Book | Book next available slot | "Book now" for current time |
| Recurring Booking | Weekly standing reservations | Every Tuesday 7am |
| Favorite Courts | Save preferred courts | Always show Court 1 first |
| Booking History | View past and upcoming | Last 12 months + future |

### Data Model

```prisma
model MemberBookingPreference {
  id              String    @id @default(uuid())
  memberId        String    @unique
  member          Member    @relation(fields: [memberId], references: [id])

  // Favorites
  favoriteCourts  String[]  // Resource IDs
  favoritePartners String[] // Member IDs for frequent playing partners

  // Defaults
  defaultDuration Int       @default(60)
  defaultPlayers  Int       @default(2)

  // Notifications
  reminderHours   Int       @default(24)  // Hours before booking
  enableEmail     Boolean   @default(true)
  enableSms       Boolean   @default(false)
  enablePush      Boolean   @default(true)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model RecurringBooking {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  memberId        String
  member          Member    @relation(fields: [memberId], references: [id])

  resourceId      String
  resource        Resource  @relation(fields: [resourceId], references: [id])

  // Schedule
  dayOfWeek       Int       // 0-6 (Sunday-Saturday)
  startTime       String    // "07:00"
  duration        Int       // Minutes

  // Validity
  startDate       DateTime
  endDate         DateTime?

  // Booking details
  playerCount     Int       @default(2)
  notes           String?

  // Pricing
  pricePerSession Decimal
  isPrepaid       Boolean   @default(false)

  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Generated bookings
  bookings        ResourceBooking[]
}

model BookingReminder {
  id              String    @id @default(uuid())
  bookingId       String
  booking         ResourceBooking @relation(fields: [bookingId], references: [id])

  type            ReminderType
  scheduledFor    DateTime
  sentAt          DateTime?

  status          ReminderStatus @default(PENDING)
}

enum ReminderType {
  EMAIL
  SMS
  PUSH
}

enum ReminderStatus {
  PENDING
  SENT
  FAILED
  CANCELLED
}
```

### UX Flow: Member Portal - Court Availability

**Member searches for available courts**

```
+---------------------------------------------------------------------------------+
| Book a Court                                                                    |
+---------------------------------------------------------------------------------+
| Find Available Courts                                                           |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Sport:            [Tennis ▼]                                                    |
|                                                                                 |
| Date:             [Sat, 01 Feb 2026 ▼]     [Today] [Tomorrow] [This Weekend]    |
|                                                                                 |
| Time:             [08:00 ▼]  to  [12:00 ▼]   or  [ ] Any time                   |
|                                                                                 |
| Duration:         [60 min ▼]                                                    |
|                                                                                 |
| Players:          [2 ▼]                                                         |
|                                                                                 |
|                                                            [Search]             |
+---------------------------------------------------------------------------------+

Available Courts - Saturday, 01 Feb 2026
+---------------------------------------------------------------------------------+
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | 08:00 - 09:00                                                               | |
| |   Court 1  [Available]   Court 2  [Available]   Court 3  [Class]            | |
| |   B540.00  [Book]        B540.00  [Book]        --                          | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | 09:00 - 10:00                                                               | |
| |   Court 1  [Booked]      Court 2  [Available]   Court 3  [Available]        | |
| |   --                     B540.00  [Book]        B540.00  [Book]             | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | 10:00 - 11:00  (Peak Hours)                                                 | |
| |   Court 1  [Available]   Court 2  [Available]   Court 3  [Available]        | |
| |   B720.00  [Book]        B720.00  [Book]        B720.00  [Book]             | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
+---------------------------------------------------------------------------------+

Your Preferences: Court 1 (Favorite)    Partner: Sarah Smith (Frequent)
```

### UX Flow: Member Portal - Booking Confirmation

**Member completes booking**

```
+---------------------------------------------------------------------------------+
| Confirm Your Booking                                                            |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Court:            Court 1 - Tennis Center                                       |
| Date:             Saturday, 01 Feb 2026                                         |
| Time:             08:00 - 09:00 (60 minutes)                                    |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Players                                                                         |
+---------------------------------------------------------------------------------+
| 1. John Smith (You)                                  Primary Booker             |
|                                                                                 |
| Add Another Player:                                                             |
| [Search by name or member number...________]                                    |
|                                                                                 |
| Recent Partners:                                                                |
| +---------------------+  +---------------------+  +---------------------+       |
| | Sarah Smith         |  | Bob Wilson          |  | + Add Guest         |       |
| | Dependent           |  | Member              |  |                     |       |
| +---------------------+  +---------------------+  +---------------------+       |
|                                                                                 |
| Selected: Sarah Smith (Dependent)                                               |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Equipment Rental (Optional)                                                     |
+---------------------------------------------------------------------------------+
| [ ] Tennis Racquet        B100.00/hr   x [1 ▼]                                  |
| [ ] Ball Hopper           B 50.00/hr   x [1 ▼]                                  |
| [ ] Ball Machine          B200.00/hr   x [1 ▼]                                  |
+---------------------------------------------------------------------------------+
| Payment Summary                                                                 |
+---------------------------------------------------------------------------------+
| Court Fee (1 hour, peak):                                   B720.00             |
| Member Discount (10%):                                     -B 72.00             |
|                                                            -----------          |
| Total:                                                      B648.00             |
|                                                                                 |
| Payment Method:                                                                 |
| (x) Charge to Member Account (Balance: B45,000)                                 |
| ( ) Visa ****4521                                                               |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Reminders                                                                       |
+---------------------------------------------------------------------------------+
| [x] Email reminder 24 hours before                                              |
| [ ] SMS reminder 2 hours before                                                 |
+---------------------------------------------------------------------------------+
| Cancellation Policy                                                             |
| Free cancellation up to 4 hours before. After that, 50% charge applies.         |
+---------------------------------------------------------------------------------+
|                                                                                 |
|                                              [Back]    [Confirm Booking]        |
+---------------------------------------------------------------------------------+
```

### UX Flow: Member Portal - My Bookings

**Member views their bookings**

```
+---------------------------------------------------------------------------------+
| My Court Bookings                                             [+ New Booking]   |
+---------------------------------------------------------------------------------+
| [Upcoming]  [Past]  [Recurring]                                                 |
+---------------------------------------------------------------------------------+

Upcoming Bookings
+---------------------------------------------------------------------------------+
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | TOMORROW                                                                    | |
| | +-------------------------------------------------------------------------+ | |
| | | Court 1 - Tennis               Sun, 02 Feb 2026    08:00 - 09:00        | | |
| | | Players: John Smith, Sarah Smith                                        | | |
| | | Status: [CONFIRMED]            Total: B648.00                           | | |
| | |                                                                         | | |
| | |                      [View Details]  [Reschedule]  [Cancel]             | | |
| | +-------------------------------------------------------------------------+ | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | NEXT WEEK                                                                   | |
| | +-------------------------------------------------------------------------+ | |
| | | Court 2 - Tennis               Sat, 08 Feb 2026    10:00 - 11:00        | | |
| | | Players: John Smith, Bob Wilson                                         | | |
| | | Status: [CONFIRMED]            Total: B720.00                           | | |
| | |                                                                         | | |
| | |                      [View Details]  [Reschedule]  [Cancel]             | | |
| | +-------------------------------------------------------------------------+ | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
+---------------------------------------------------------------------------------+

Recurring Bookings (Standing Reservations)
+---------------------------------------------------------------------------------+
| +-----------------------------------------------------------------------------+ |
| | Weekly Standing - Court 1                                                   | |
| | Every Tuesday at 07:00 - 08:00                                              | |
| | Valid: 01 Jan 2026 - 31 Dec 2026                                            | |
| | Price: B540.00/week  |  Status: [ACTIVE]                                    | |
| |                                                                             | |
| |               [View Schedule]  [Skip Next]  [Modify]  [Cancel Series]       | |
| +-----------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------+
```

---

## Feature 3: Booking Rules

### Description

Configurable rules governing court reservations including advance booking limits, duration constraints, peak/off-peak pricing, and member-only time slots.

### Rule Types

| Rule Type | Description | Example |
|-----------|-------------|---------|
| Advance Limit | How far ahead members can book | Members: 7 days, Gold: 14 days |
| Duration | Min/max booking length | Min 30 min, max 2 hours |
| Same-Day Limit | Max bookings per day | 2 courts per member per day |
| Peak Hours | Premium pricing times | Weekends + evenings |
| Member-Only | Restricted time slots | 6-9am weekdays members only |
| Cancellation | When free cancellation ends | 4 hours before = full refund |

### Data Model

```prisma
model BookingRule {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  name            String    // "Peak Hours Pricing", "Member Advance Booking"
  description     String?

  // Scope
  resourceTypeId  String?   // Apply to specific type (null = all)
  resourceType    ResourceType? @relation(fields: [resourceTypeId], references: [id])
  resourceIds     String[]  // Apply to specific resources (empty = all of type)

  // Rule type
  ruleType        BookingRuleType

  // Conditions - when this rule applies
  memberTiers     String[]  // ["GOLD", "PLATINUM"] or empty for all
  daysOfWeek      Int[]     // [0,6] for weekends, empty for all
  startTime       String?   // "18:00" for evening
  endTime         String?   // "21:00"

  // Rule values (JSON for flexibility)
  ruleConfig      Json
  // Examples:
  // ADVANCE_LIMIT: {"days": 7}
  // DURATION: {"minMinutes": 30, "maxMinutes": 120, "increment": 30}
  // PEAK_PRICING: {"multiplier": 1.5, "fixedAdd": 0}
  // MEMBER_ONLY: {"requireMembership": true}
  // SAME_DAY_LIMIT: {"maxBookings": 2}
  // CANCELLATION: {"freeHoursBefore": 4, "lateCancelPercent": 50}

  priority        Int       @default(0) // Higher = evaluated first
  isActive        Boolean   @default(true)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum BookingRuleType {
  ADVANCE_LIMIT
  DURATION
  PEAK_PRICING
  OFF_PEAK_PRICING
  MEMBER_ONLY
  SAME_DAY_LIMIT
  WEEKLY_LIMIT
  CANCELLATION
  MINIMUM_NOTICE
  GUEST_ALLOWED
  MAINTENANCE_WINDOW
}

model BookingPricing {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  resourceTypeId  String
  resourceType    ResourceType @relation(fields: [resourceTypeId], references: [id])

  name            String    // "Standard Rate", "Peak Rate", "Member Rate"

  // Time-based pricing
  pricePerHour    Decimal   // Base hourly rate
  pricePerHalfHour Decimal? // Optional half-hour rate

  // Conditions
  memberTiers     String[]  // Which member tiers get this rate
  daysOfWeek      Int[]     // When this rate applies
  startTime       String?   // Start of time window
  endTime         String?   // End of time window

  // Seasonal
  validFrom       DateTime?
  validUntil      DateTime?

  priority        Int       @default(0)
  isActive        Boolean   @default(true)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

### UX Flow: Booking Rules Configuration

**Admin configures booking rules**

```
+---------------------------------------------------------------------------------+
| Booking Rules Configuration                                      [+ Add Rule]  |
+---------------------------------------------------------------------------------+
| [All Resources ▼]  [All Rule Types ▼]                            [Search...]   |
+---------------------------------------------------------------------------------+

Active Rules
+---------------------------------------------------------------------------------+
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | ADVANCE_LIMIT          Priority: 10          [ACTIVE]        [Edit] [x]     | |
| | Gold Member Advance Booking                                                 | |
| | Gold/Platinum members can book 14 days in advance                           | |
| | Applies to: All Courts  |  Members: Gold, Platinum                          | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | ADVANCE_LIMIT          Priority: 5           [ACTIVE]        [Edit] [x]     | |
| | Standard Member Advance Booking                                             | |
| | Standard members can book 7 days in advance                                 | |
| | Applies to: All Courts  |  Members: Standard, Social                        | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | PEAK_PRICING           Priority: 10          [ACTIVE]        [Edit] [x]     | |
| | Weekend Peak Pricing                                                        | |
| | 1.5x price multiplier on weekends                                           | |
| | Applies to: Tennis Courts  |  Days: Sat, Sun  |  Time: All day              | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | MEMBER_ONLY            Priority: 15          [ACTIVE]        [Edit] [x]     | |
| | Morning Member Priority                                                     | |
| | 6:00-9:00 weekdays reserved for members only                                | |
| | Applies to: All Courts  |  Days: Mon-Fri  |  Time: 06:00-09:00              | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | DURATION               Priority: 1           [ACTIVE]        [Edit] [x]     | |
| | Court Booking Duration                                                      | |
| | Minimum 30 min, Maximum 2 hours, 30 min increments                          | |
| | Applies to: Tennis Courts                                                   | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
+---------------------------------------------------------------------------------+
```

### UX Flow: Add/Edit Booking Rule

**Admin creates or edits a rule**

```
+---------------------------------------------------------------------------------+
| Add Booking Rule                                                           [X]  |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Rule Type:        [Advance Booking Limit ▼]                                     |
|                                                                                 |
| Name:             [Premium Member Advance Booking_____]                         |
|                                                                                 |
| Description:      [Platinum members can book up to 21 days ahead___]            |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Applies To                                                                      |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Resource Type:    [Tennis Courts ▼]                                             |
|                                                                                 |
| Specific Courts:  ( ) All tennis courts                                         |
|                   (x) Selected courts:                                          |
|                       [x] Court 1   [x] Court 2   [x] Court 3                   |
|                       [ ] Court 4   [ ] Court 5                                 |
|                                                                                 |
| Member Tiers:     ( ) All members                                               |
|                   (x) Selected tiers:                                           |
|                       [ ] Standard  [ ] Social  [ ] Gold  [x] Platinum          |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Time Conditions (Optional)                                                      |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Days of Week:     ( ) All days                                                  |
|                   ( ) Selected: [ ]Su [x]Mo [x]Tu [x]We [x]Th [x]Fr [ ]Sa       |
|                                                                                 |
| Time Window:      [ ] Apply to specific hours                                   |
|                       Start: [______]   End: [______]                           |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Rule Configuration                                                              |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Days in Advance:  [21____]                                                      |
|                                                                                 |
| Note: Higher priority rules are evaluated first. If multiple rules match,       |
|       the highest priority rule takes precedence.                               |
|                                                                                 |
| Priority:         [15____]                                                      |
|                                                                                 |
+---------------------------------------------------------------------------------+
|                                                                                 |
|                                              [Cancel]    [Save Rule]            |
+---------------------------------------------------------------------------------+
```

### UX Flow: Pricing Configuration

**Admin sets up time-based pricing**

```
+---------------------------------------------------------------------------------+
| Court Pricing - Tennis Courts                                     [+ Add Rate] |
+---------------------------------------------------------------------------------+

Price Rates
+---------------------------------------------------------------------------------+
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | BASE RATE                                                    [Edit] [x]     | |
| | Standard Member Rate                                                        | |
| | B600.00/hour  |  B350.00/30min                                              | |
| | Applies: All members, All days, All times                                   | |
| | Priority: 1                                                                 | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | PEAK RATE                                                    [Edit] [x]     | |
| | Weekend Peak                                                                | |
| | B720.00/hour  (1.2x base)                                                   | |
| | Applies: All members, Sat-Sun, All times                                    | |
| | Priority: 5                                                                 | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | PEAK RATE                                                    [Edit] [x]     | |
| | Evening Peak                                                                | |
| | B720.00/hour  (1.2x base)                                                   | |
| | Applies: All members, Mon-Fri, 18:00-21:00                                  | |
| | Priority: 5                                                                 | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | DISCOUNT RATE                                                [Edit] [x]     | |
| | Gold Member Discount                                                        | |
| | B540.00/hour  (10% off base)                                                | |
| | Applies: Gold/Platinum members, All days, All times                         | |
| | Priority: 10                                                                | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
+---------------------------------------------------------------------------------+

Rate Calculator (Preview)
+---------------------------------------------------------------------------------+
| Member Tier:    [Gold ▼]    Day: [Saturday ▼]    Time: [10:00 ▼]                |
|                                                                                 |
| Calculated Rate: B648.00/hour                                                   |
| Applied Rules:   Weekend Peak (B720) + Gold Discount (10% off) = B648           |
+---------------------------------------------------------------------------------+
```

---

## Feature 4: Resource Types

### Description

Configuration of different bookable resource types including tennis courts, squash courts, badminton courts, swimming pool lanes, gym equipment, and more.

### Supported Resource Types

| Type | Description | Typical Capacity |
|------|-------------|------------------|
| Tennis Court | Outdoor/indoor tennis | 2-4 players |
| Squash Court | Indoor squash court | 2 players |
| Badminton Court | Indoor badminton | 2-4 players |
| Pool Lane | Swimming lane | 1-2 swimmers |
| Gym Equipment | Cardio/weight machines | 1 user |
| Studio | Fitness/yoga studio | 10-30 participants |
| Multi-Purpose Room | Flexible space | Variable |

### Data Model

```prisma
model ResourceType {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  name            String    // "Tennis Court", "Pool Lane", "Gym Equipment"
  code            String    // "TENNIS", "POOL", "GYM"
  category        ResourceCategory
  description     String?

  // Default settings
  defaultDuration Int       @default(60)   // Default booking minutes
  minDuration     Int       @default(30)
  maxDuration     Int       @default(120)
  durationIncrement Int     @default(30)

  defaultCapacity Int       @default(2)
  maxCapacity     Int       @default(4)

  // Pricing defaults
  baseHourlyRate  Decimal

  // Features
  requiresCheckIn Boolean   @default(true)
  allowsGuests    Boolean   @default(true)
  requiresWaiver  Boolean   @default(false)

  // Equipment associations
  associatedRentals String[] // Rental item type IDs commonly used

  // Display
  icon            String?   // Icon identifier
  color           String?   // Default calendar color
  sortOrder       Int       @default(0)

  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  resources       Resource[]
  pricingRules    BookingPricing[]
  bookingRules    BookingRule[]
}

enum ResourceCategory {
  COURT           // Tennis, squash, badminton
  POOL            // Swimming lanes
  GYM             // Equipment, machines
  STUDIO          // Group fitness rooms
  OUTDOOR         // Fields, tracks
  EQUIPMENT       // Individual equipment
  ROOM            // Meeting rooms, party rooms
}

model ResourceAmenity {
  id              String    @id @default(uuid())
  resourceId      String
  resource        Resource  @relation(fields: [resourceId], references: [id])

  amenity         String    // "lighting", "aircon", "covered", "heated"
  details         String?
}

model ResourceMaintenance {
  id              String    @id @default(uuid())
  resourceId      String
  resource        Resource  @relation(fields: [resourceId], references: [id])

  type            MaintenanceType
  description     String

  scheduledStart  DateTime
  scheduledEnd    DateTime?
  actualStart     DateTime?
  actualEnd       DateTime?

  status          MaintenanceStatus @default(SCHEDULED)
  notes           String?

  createdBy       String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum MaintenanceType {
  ROUTINE         // Regular maintenance
  REPAIR          // Fix issue
  UPGRADE         // Improvement
  CLEANING        // Deep clean
  INSPECTION      // Safety check
}

enum MaintenanceStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

### UX Flow: Resource Type Management

**Admin configures resource types**

```
+---------------------------------------------------------------------------------+
| Resource Types                                                  [+ Add Type]    |
+---------------------------------------------------------------------------------+
| Manage the different types of bookable facilities and equipment                 |
+---------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------+
| Courts                                                                          |
+---------------------------------------------------------------------------------+
| +-----------------------------------------------------------------------------+ |
| | [Tennis Icon] Tennis Court                                 [ACTIVE]          | |
| | 5 courts configured  |  Base Rate: B600/hr  |  30-120 min bookings          | |
| | Capacity: 2-4 players  |  Guests: Allowed  |  Check-in: Required            | |
| |                                                                              | |
| |           [View Courts]  [Pricing]  [Rules]  [Edit]  [Disable]              | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | [Squash Icon] Squash Court                                 [ACTIVE]          | |
| | 3 courts configured  |  Base Rate: B400/hr  |  30-60 min bookings           | |
| | Capacity: 2 players  |  Guests: Allowed  |  Check-in: Required              | |
| |                                                                              | |
| |           [View Courts]  [Pricing]  [Rules]  [Edit]  [Disable]              | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | [Badminton Icon] Badminton Court                           [ACTIVE]          | |
| | 4 courts configured  |  Base Rate: B300/hr  |  30-90 min bookings           | |
| | Capacity: 2-4 players  |  Guests: Allowed  |  Check-in: Required            | |
| |                                                                              | |
| |           [View Courts]  [Pricing]  [Rules]  [Edit]  [Disable]              | |
| +-----------------------------------------------------------------------------+ |

+---------------------------------------------------------------------------------+
| Pool & Fitness                                                                  |
+---------------------------------------------------------------------------------+
| +-----------------------------------------------------------------------------+ |
| | [Pool Icon] Pool Lane                                      [ACTIVE]          | |
| | 8 lanes configured  |  Base Rate: B200/hr  |  30-60 min bookings            | |
| | Capacity: 1-2 swimmers  |  Guests: Allowed  |  Waiver: Required             | |
| |                                                                              | |
| |           [View Lanes]  [Pricing]  [Rules]  [Edit]  [Disable]               | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | [Gym Icon] Gym Equipment                                   [ACTIVE]          | |
| | 15 machines configured  |  Base Rate: B0 (included)  |  30-60 min slots     | |
| | Capacity: 1 user  |  Guests: Not Allowed  |  Check-in: Required             | |
| |                                                                              | |
| |           [View Equipment]  [Pricing]  [Rules]  [Edit]  [Disable]           | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
+---------------------------------------------------------------------------------+
```

### UX Flow: Add/Edit Resource Type

**Admin creates or edits resource type**

```
+---------------------------------------------------------------------------------+
| Edit Resource Type - Tennis Court                                          [X]  |
+---------------------------------------------------------------------------------+
|                                                                                 |
| +---------------------------+   +--------------------------------------------+  |
| | General                   |   |                                            |  |
| | Booking Settings          |   | Name:           [Tennis Court_____]        |  |
| | Pricing                   |   | Code:           [TENNIS_________]          |  |
| | Rules                     |   | Category:       [Court ▼]                  |  |
| | Resources                 |   |                                            |  |
| +---------------------------+   | Description:                               |  |
|                                 | [Outdoor hard courts with lighting___]     |  |
|                                 |                                            |  |
|                                 | Icon:           [Tennis Ball ▼]            |  |
|                                 | Calendar Color: [#4CAF50___] [Color Picker]|  |
|                                 |                                            |  |
|                                 +--------------------------------------------+  |
|                                                                                 |
| +---------------------------+   +--------------------------------------------+  |
| | Booking Settings          |   |                                            |  |
| +---------------------------+   | Default Duration:                          |  |
|                                 | [60___] minutes                            |  |
|                                 |                                            |  |
|                                 | Duration Range:                            |  |
|                                 | Min: [30___]  Max: [120___]  Inc: [30___]  |  |
|                                 |                                            |  |
|                                 | Capacity:                                  |  |
|                                 | Default: [2___]  Maximum: [4___]           |  |
|                                 |                                            |  |
|                                 | Options:                                   |  |
|                                 | [x] Require check-in                       |  |
|                                 | [x] Allow guest bookings                   |  |
|                                 | [ ] Require waiver signature               |  |
|                                 |                                            |  |
|                                 +--------------------------------------------+  |
|                                                                                 |
| +---------------------------+   +--------------------------------------------+  |
| | Associated Rentals        |   |                                            |  |
| +---------------------------+   | Commonly rented with this resource type:   |  |
|                                 |                                            |  |
|                                 | [x] Tennis Racquet                         |  |
|                                 | [x] Tennis Balls                           |  |
|                                 | [x] Ball Hopper                            |  |
|                                 | [ ] Ball Machine                           |  |
|                                 |                                            |  |
|                                 | These will be suggested during booking.    |  |
|                                 |                                            |  |
|                                 +--------------------------------------------+  |
|                                                                                 |
+---------------------------------------------------------------------------------+
|                                              [Cancel]    [Save Changes]         |
+---------------------------------------------------------------------------------+
```

### UX Flow: Resource List for Type

**View/manage individual resources of a type**

```
+---------------------------------------------------------------------------------+
| Tennis Courts                                    [+ Add Court]  [Bulk Import]   |
+---------------------------------------------------------------------------------+
| 5 courts  |  4 active  |  1 maintenance                                         |
+---------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------+
| +-----------------------------------------------------------------------------+ |
| | Court 1                                      [ACTIVE] [AVAILABLE]            | |
| | Location: Tennis Center, Ground Floor                                        | |
| | Amenities: Lighting, Covered, Hard Surface                                   | |
| | Today: 8 bookings  |  This week: 42 bookings  |  Utilization: 78%           | |
| |                                                                              | |
| |    [View Schedule]  [Block Time]  [Maintenance]  [Edit]  [Disable]          | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | Court 2                                      [ACTIVE] [BOOKED UNTIL 11:00]   | |
| | Location: Tennis Center, Ground Floor                                        | |
| | Amenities: Lighting, Covered, Hard Surface                                   | |
| | Today: 6 bookings  |  This week: 38 bookings  |  Utilization: 72%           | |
| |                                                                              | |
| |    [View Schedule]  [Block Time]  [Maintenance]  [Edit]  [Disable]          | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | Court 3                                      [ACTIVE] [IN CLASS]             | |
| | Location: Tennis Center, Ground Floor                                        | |
| | Amenities: Lighting, Covered, Hard Surface                                   | |
| | Today: 5 bookings  |  This week: 35 bookings  |  Utilization: 65%           | |
| | Current: Junior Tennis Class (ends 10:00)                                    | |
| |                                                                              | |
| |    [View Schedule]  [Block Time]  [Maintenance]  [Edit]  [Disable]          | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | Court 5                                      [MAINTENANCE]                   | |
| | Location: Tennis Center, Upper Level                                         | |
| | Amenities: Lighting, Outdoor, Hard Surface                                   | |
| | Status: Resurfacing in progress (until 05 Feb)                               | |
| |                                                                              | |
| |    [View Details]  [End Maintenance]  [Edit]                                | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
+---------------------------------------------------------------------------------+
```

---

## Feature 5: Guest Booking

### Description

Members can book courts for guests, with guest fees, guest limits per booking, and guest waiver requirements.

### Guest Booking Types

| Type | Description | Fee Structure |
|------|-------------|---------------|
| Member Guest | Member brings unregistered guest | Per-visit fee |
| Guest Pass Holder | Pre-purchased guest passes | Deduct from pass |
| Reciprocal Club | Visiting member from partner club | May have fee waiver |
| Day Pass | Purchased day access | Flat daily fee |

### Data Model

```prisma
model BookingGuest {
  id              String    @id @default(uuid())
  bookingId       String
  booking         ResourceBooking @relation(fields: [bookingId], references: [id])

  // Guest info
  name            String
  email           String?
  phone           String?

  // Relationship to sponsoring member
  sponsorMemberId String
  sponsorMember   Member    @relation(fields: [sponsorMemberId], references: [id])
  relationship    String?   // "Friend", "Business Associate", "Family"

  // Guest type
  guestType       GuestType @default(MEMBER_GUEST)
  guestPassId     String?   // If using guest pass
  guestPass       GuestPass? @relation(fields: [guestPassId], references: [id])

  // Fees
  guestFee        Decimal
  feeWaived       Boolean   @default(false)
  waivedReason    String?

  // Waiver
  waiverRequired  Boolean   @default(true)
  waiverSignedAt  DateTime?
  waiverSignature String?

  // Status
  checkedInAt     DateTime?

  createdAt       DateTime  @default(now())
}

enum GuestType {
  MEMBER_GUEST      // Regular guest of member
  GUEST_PASS        // Using prepaid guest pass
  RECIPROCAL        // From partner/reciprocal club
  DAY_PASS          // Purchased day access
  COMPLIMENTARY     // Free guest (manager approved)
}

model GuestPass {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  memberId        String
  member          Member    @relation(fields: [memberId], references: [id])

  // Pass details
  passType        String    // "10-Visit Pass", "Annual Guest Pass"
  totalVisits     Int
  remainingVisits Int

  // Value
  purchasePrice   Decimal
  purchaseDate    DateTime

  // Validity
  expiresAt       DateTime?

  isActive        Boolean   @default(true)

  // Usage
  usages          BookingGuest[]
}

model GuestPolicy {
  id              String    @id @default(uuid())
  clubId          String    @unique
  club            Club      @relation(fields: [clubId], references: [id])

  // Per-booking limits
  maxGuestsPerBooking   Int       @default(2)
  maxGuestsPerMemberPerDay Int    @default(4)
  maxGuestsPerMemberPerMonth Int  @default(10)

  // Fees
  defaultGuestFee       Decimal   @default(0)
  peakGuestFee          Decimal?

  // Restrictions
  sameGuestFrequency    Int       @default(4) // Same guest max visits per month
  guestBlackoutDays     Int[]     // Days when guests not allowed
  guestBlackoutTimes    Json?     // Time windows when guests not allowed

  // Waiver
  requireWaiver         Boolean   @default(true)
  waiverText            String?

  // Approval
  requireApproval       Boolean   @default(false)
  autoApproveUpTo       Int       @default(2) // Auto-approve up to N guests

  updatedAt             DateTime  @updatedAt
}

model GuestVisitHistory {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  // Guest identification (for tracking repeat visits)
  guestEmail      String?
  guestPhone      String?
  guestName       String

  // Visit details
  visitDate       DateTime
  sponsorMemberId String
  sponsorMember   Member    @relation(fields: [sponsorMemberId], references: [id])

  resourceType    String
  bookingId       String

  createdAt       DateTime  @default(now())

  @@index([guestEmail, clubId])
  @@index([guestPhone, clubId])
}
```

### UX Flow: Add Guest to Booking

**During booking creation, member adds guest**

```
+---------------------------------------------------------------------------------+
| Add Guest to Booking                                                       [X]  |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Booking: Court 1 - Tennis  |  Sat, 01 Feb 2026  |  08:00-09:00                  |
| Primary: John Smith (M-1234)                                                    |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Guest Information                                                               |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Guest Name:       [Michael Johnson____________]                                 |
| Email:            [michael@email.com__________]                                 |
| Phone:            [+66 81 234 5678____________]                                 |
| Relationship:     [Friend ▼]                                                    |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Guest Type                                                                      |
+---------------------------------------------------------------------------------+
|                                                                                 |
| (x) Regular Guest (B300 guest fee)                                              |
| ( ) Use Guest Pass (3 visits remaining)                                         |
| ( ) Reciprocal Club Member                                                      |
| ( ) Complimentary (requires approval)                                           |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Guest History                                                                   |
+---------------------------------------------------------------------------------+
|                                                                                 |
| This guest has visited 2 times this month (limit: 4)                            |
| Last visit: 15 Jan 2026 (sponsored by John Smith)                               |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Waiver                                                                          |
+---------------------------------------------------------------------------------+
|                                                                                 |
| [ ] Guest acknowledges liability waiver                                         |
|                                                                                 |
| By checking this box, the guest acknowledges that they have read and agree to   |
| the club's liability waiver and rules of conduct. [View Waiver]                 |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Fee Summary                                                                     |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Guest Fee:                                                      B300.00         |
| Charged to:     John Smith account                                              |
|                                                                                 |
+---------------------------------------------------------------------------------+
|                                              [Cancel]    [Add Guest]            |
+---------------------------------------------------------------------------------+
```

### UX Flow: Guest Limits Warning

**When guest limits are approaching or exceeded**

```
+---------------------------------------------------------------------------------+
| Guest Limit Warning                                                        [X]  |
+---------------------------------------------------------------------------------+
|                                                                                 |
| +---------------------------------------------------------------------------+   |
| | ! John Smith has reached guest limits for this period                     |   |
| +---------------------------------------------------------------------------+   |
|                                                                                 |
| Current Month Usage:                                                            |
|                                                                                 |
| Total guest visits:         8 of 10                                             |
| Visits by Michael Johnson:  3 of 4 (same guest limit)                           |
|                                                                                 |
| Adding this guest will:                                                         |
| - Use 9 of 10 monthly guest visits                                              |
| - Use 4 of 4 visits for Michael Johnson (max reached after this)                |
|                                                                                 |
+---------------------------------------------------------------------------------+
|                                                                                 |
| ( ) Proceed with booking                                                        |
| ( ) Request manager exception                                                   |
| ( ) Cancel and choose different guest                                           |
|                                                                                 |
+---------------------------------------------------------------------------------+
|                                              [Cancel]    [Continue]             |
+---------------------------------------------------------------------------------+
```

### UX Flow: Guest Pass Management

**Member views their guest passes**

```
+---------------------------------------------------------------------------------+
| Guest Passes                                                  [+ Purchase Pass] |
+---------------------------------------------------------------------------------+

Active Passes
+---------------------------------------------------------------------------------+
| +-----------------------------------------------------------------------------+ |
| | 10-Visit Guest Pass                                                         | |
| | Purchased: 01 Jan 2026  |  Expires: 31 Dec 2026                             | |
| |                                                                             | |
| | Remaining:  [|||||||   ] 7 of 10 visits                                     | |
| |                                                                             | |
| | Recent Usage:                                                               | |
| |   15 Jan - Michael Johnson (Tennis)                                         | |
| |   08 Jan - Sarah Lee (Squash)                                               | |
| |   03 Jan - Michael Johnson (Tennis)                                         | |
| |                                                                             | |
| |                                            [View History]  [Gift to Member] | |
| +-----------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------+

Purchase Options
+---------------------------------------------------------------------------------+
| +-------------------------+  +-------------------------+  +---------------------+|
| | 5-Visit Pass            |  | 10-Visit Pass           |  | Annual Unlimited   ||
| | B1,200                  |  | B2,000                  |  | B8,000             ||
| | B240/visit              |  | B200/visit              |  | Unlimited guests   ||
| | Valid 6 months          |  | Valid 12 months         |  | Valid 12 months    ||
| |                         |  |                         |  |                    ||
| | [Purchase]              |  | [Purchase]              |  | [Purchase]         ||
| +-------------------------+  +-------------------------+  +---------------------+|
+---------------------------------------------------------------------------------+
```

### UX Flow: Guest Waiver Digital Signature

**Guest signs waiver on tablet/device**

```
+---------------------------------------------------------------------------------+
|                         Club Vantage Guest Waiver                               |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Guest Name:       Michael Johnson                                               |
| Sponsor:          John Smith (M-1234)                                           |
| Date:             01 Feb 2026                                                   |
| Facility:         Tennis Court                                                  |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Liability Waiver and Release                                                    |
+---------------------------------------------------------------------------------+
|                                                                                 |
| I, the undersigned guest, hereby acknowledge and agree:                         |
|                                                                                 |
| 1. I understand that participation in sports and recreational activities        |
|    involves inherent risks of injury.                                           |
|                                                                                 |
| 2. I voluntarily assume all risks associated with my use of club facilities.    |
|                                                                                 |
| 3. I release and hold harmless Club Vantage, its officers, employees, and       |
|    members from any claims arising from my participation.                       |
|                                                                                 |
| 4. I agree to abide by all club rules and regulations.                          |
|                                                                                 |
| 5. I confirm I am physically able to participate in the planned activity.       |
|                                                                                 |
|                                              [Read Full Waiver]                 |
+---------------------------------------------------------------------------------+
| Signature                                                                       |
+---------------------------------------------------------------------------------+
|                                                                                 |
| +-------------------------------------------------------------------------+     |
| |                                                                         |     |
| |                    [Sign Here with Finger/Stylus]                       |     |
| |                                                                         |     |
| |                         ~~~~~~~~~~~~~~~~~~~~~~                          |     |
| |                                                                         |     |
| +-------------------------------------------------------------------------+     |
|                                                                                 |
| [x] I have read and agree to the terms above                                    |
|                                                                                 |
+---------------------------------------------------------------------------------+
|                                [Clear]              [Accept & Continue]         |
+---------------------------------------------------------------------------------+
```

---

## Feature 6: Class Scheduling

### Description

Group fitness and sports classes with capacity limits, instructor assignment, recurring schedules, and resource allocation.

### Class Types

| Type | Description | Example |
|------|-------------|---------|
| Group Fitness | Gym/studio classes | Yoga, Spin, HIIT |
| Sports Instruction | Group lessons | Tennis clinic, Golf lesson |
| Aquatic | Pool-based classes | Aqua aerobics, Swim lesson |
| Specialty | Special programs | Kids camp, Senior fitness |

### Data Model

```prisma
model FacilityClass {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  // Class info
  name            String    // "Morning Yoga", "Tennis Clinic"
  description     String?
  classTypeId     String
  classType       ClassType @relation(fields: [classTypeId], references: [id])

  // Instructor
  instructorId    String?
  instructor      Instructor? @relation(fields: [instructorId], references: [id])

  // Resource allocation
  resourceId      String?
  resource        Resource? @relation(fields: [resourceId], references: [id])

  // Scheduling
  startTime       DateTime
  endTime         DateTime
  duration        Int       // Minutes

  // Recurring
  isRecurring     Boolean   @default(false)
  recurrenceRule  String?   // RRULE format
  seriesId        String?   // Groups recurring instances

  // Capacity
  capacity        Int
  minParticipants Int       @default(1)
  waitlistEnabled Boolean   @default(true)
  waitlistCapacity Int      @default(5)

  // Pricing
  memberPrice     Decimal
  guestPrice      Decimal?
  dropInPrice     Decimal?  // Non-registered attendance

  // Booking
  bookingOpensAt  DateTime? // When registration opens
  bookingClosesAt DateTime? // When registration closes
  cancellationDeadline DateTime? // Last free cancellation

  // Status
  status          ClassStatus @default(SCHEDULED)
  cancelledAt     DateTime?
  cancelledBy     String?
  cancellationReason String?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  registrations   ClassRegistration[]
  bookings        ResourceBooking[]
}

enum ClassStatus {
  SCHEDULED       // Upcoming
  OPEN            // Registration open
  FULL            // Capacity reached, waitlist may be open
  IN_PROGRESS     // Currently running
  COMPLETED       // Finished
  CANCELLED       // Class cancelled
}

model ClassType {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  name            String    // "Yoga", "Tennis Clinic", "Aqua Aerobics"
  category        ClassCategory
  description     String?

  // Defaults
  defaultDuration Int       @default(60)
  defaultCapacity Int       @default(20)
  defaultPrice    Decimal

  // Requirements
  requiredEquipment String[]
  fitnessLevel    FitnessLevel @default(ALL_LEVELS)
  ageRestriction  String?   // "18+", "Kids 8-12", etc.

  // Display
  color           String?
  icon            String?

  isActive        Boolean   @default(true)

  classes         FacilityClass[]
}

enum ClassCategory {
  FITNESS         // General fitness classes
  YOGA            // Yoga and stretching
  CARDIO          // Cardio-focused
  STRENGTH        // Weight/resistance training
  AQUATIC         // Pool-based
  SPORTS          // Sports lessons/clinics
  KIDS            // Children's programs
  SENIOR          // Senior programs
  SPECIALTY       // Special programs
}

enum FitnessLevel {
  ALL_LEVELS
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

model Instructor {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  // Basic info
  name            String
  email           String
  phone           String?
  photo           String?
  bio             String?

  // Qualifications
  certifications  String[]
  specialties     String[]  // Class type IDs

  // Availability
  availability    Json      // Weekly availability pattern

  // Employment
  employmentType  EmploymentType
  hourlyRate      Decimal?

  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  classes         FacilityClass[]
}

enum EmploymentType {
  STAFF           // Full-time employee
  CONTRACTOR      // Independent contractor
  GUEST           // Guest instructor
}

model ClassTemplate {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  name            String
  classTypeId     String
  classType       ClassType @relation(fields: [classTypeId], references: [id])

  // Default instructor
  defaultInstructorId String?

  // Schedule template
  dayOfWeek       Int       // 0-6
  startTime       String    // "09:00"
  duration        Int

  // Default resource
  defaultResourceId String?

  // Capacity and pricing
  capacity        Int
  memberPrice     Decimal
  guestPrice      Decimal?

  isActive        Boolean   @default(true)
}
```

### UX Flow: Class Schedule Calendar

**View classes by day/week**

```
+---------------------------------------------------------------------------------+
| Class Schedule                                              [Day] [Week] [List] |
+---------------------------------------------------------------------------------+
| < Week of 01 Feb 2026 >                [All Classes ▼]  [All Instructors ▼]     |
+---------------------------------------------------------------------------------+

          | Saturday       | Sunday         | Monday         | Tuesday        |
+---------------------------------------------------------------------------------+
| 06:00   |                |                | Morning Yoga   | Spin Class     |
|         |                |                | Studio A       | Spin Room      |
|         |                |                | 8/15 [Open]    | 12/12 [Full]   |
+---------------------------------------------------------------------------------+
| 07:00   | Sunrise Yoga   |                | HIIT Training  | Morning Yoga   |
|         | Pool Deck      |                | Gym Floor      | Studio A       |
|         | 10/20 [Open]   |                | 6/15 [Open]    | 14/15 [Open]   |
+---------------------------------------------------------------------------------+
| 08:00   | Junior Tennis  | Family Swim    | Aqua Aerobics  | Tennis Clinic  |
|         | Court 1-2      | Pool           | Pool           | Courts 3-4     |
|         | 6/8 [Open]     | 12/15 [Open]   | 8/12 [Open]    | 4/8 [Open]     |
+---------------------------------------------------------------------------------+
| 09:00   | Tennis Clinic  | Yoga Flow      | Senior Fitness | Pilates        |
|         | Courts 3-4     | Studio A       | Studio B       | Studio A       |
|         | 5/8 [Open]     | 18/20 [Open]   | 10/12 [Open]   | 15/15 [Full]   |
+---------------------------------------------------------------------------------+
| 10:00   | Kids Swim      |                |                | Body Pump      |
|         | Pool           |                |                | Gym Floor      |
|         | 6/10 [Open]    |                |                | 12/20 [Open]   |
+---------------------------------------------------------------------------------+

Legend: [Open] = Registration Open  [Full] = Waitlist Only  [Closed] = Completed
        Numbers show: Registered/Capacity

                                                           [+ Add Class]
```

### UX Flow: Create Class

**Staff creates new class**

```
+---------------------------------------------------------------------------------+
| Create New Class                                                           [X]  |
+---------------------------------------------------------------------------------+
|                                                                                 |
| +---------------------------+   +--------------------------------------------+  |
| | Class Details             |   |                                            |  |
| | Schedule                  |   | Class Type:     [Yoga ▼]                   |  |
| | Pricing                   |   |                                            |  |
| | Settings                  |   | Class Name:     [Morning Yoga Flow____]    |  |
| +---------------------------+   |                                            |  |
|                                 | Description:                               |  |
|                                 | [Start your day with an energizing flow   |  |
|                                 |  suitable for all levels. Mats provided.] |  |
|                                 |                                            |  |
|                                 | Instructor:     [Sarah Chen ▼]             |  |
|                                 | Fitness Level:  [All Levels ▼]            |  |
|                                 |                                            |  |
|                                 +--------------------------------------------+  |
|                                                                                 |
| +---------------------------+   +--------------------------------------------+  |
| | Schedule                  |   |                                            |  |
| +---------------------------+   | Date:           [01 Feb 2026 ▼]            |  |
|                                 | Start Time:     [07:00 ▼]                  |  |
|                                 | Duration:       [60 ▼] minutes             |  |
|                                 |                                            |  |
|                                 | Location:       [Studio A ▼]               |  |
|                                 |                                            |  |
|                                 | [ ] Make this a recurring class            |  |
|                                 |     Repeat: [Weekly ▼]                     |  |
|                                 |     Days: [x]Sa [ ]Su [x]Mo [ ]Tu [x]We... |  |
|                                 |     Until: [31 Mar 2026 ▼]                 |  |
|                                 |                                            |  |
|                                 +--------------------------------------------+  |
|                                                                                 |
| +---------------------------+   +--------------------------------------------+  |
| | Capacity & Pricing        |   |                                            |  |
| +---------------------------+   | Capacity:       [20___]                    |  |
|                                 | Min Participants: [5___]                   |  |
|                                 |                                            |  |
|                                 | [x] Enable waitlist                        |  |
|                                 |     Waitlist size: [10___]                 |  |
|                                 |                                            |  |
|                                 | Member Price:   B [200___]                 |  |
|                                 | Guest Price:    B [400___]                 |  |
|                                 | Drop-in Price:  B [250___]                 |  |
|                                 |                                            |  |
|                                 +--------------------------------------------+  |
|                                                                                 |
| +---------------------------+   +--------------------------------------------+  |
| | Registration Settings     |   |                                            |  |
| +---------------------------+   | Registration Opens:                        |  |
|                                 |   [7___] days before class                 |  |
|                                 |                                            |  |
|                                 | Registration Closes:                       |  |
|                                 |   [1___] hour before class                 |  |
|                                 |                                            |  |
|                                 | Free Cancellation Until:                   |  |
|                                 |   [4___] hours before class                |  |
|                                 |                                            |  |
|                                 | Late Cancellation Fee:                     |  |
|                                 |   [50___] % of class price                 |  |
|                                 |                                            |  |
|                                 +--------------------------------------------+  |
|                                                                                 |
+---------------------------------------------------------------------------------+
|                                              [Cancel]    [Create Class]         |
+---------------------------------------------------------------------------------+
```

### UX Flow: Class Details (Staff View)

**Staff views class with registration list**

```
+---------------------------------------------------------------------------------+
| Morning Yoga Flow                                          [Edit] [Cancel Class]|
+---------------------------------------------------------------------------------+
| Saturday, 01 Feb 2026  |  07:00 - 08:00  |  Studio A                            |
| Instructor: Sarah Chen                                                          |
+---------------------------------------------------------------------------------+

Status: [OPEN]    Registered: 12/20    Waitlist: 2/10

+---------------------------------------------------------------------------------+
| Registered Participants                                      [+ Add Participant]|
+---------------------------------------------------------------------------------+
| | # | Name                | Type     | Status      | Actions                   |
| +---+---------------------+----------+-------------+---------------------------+
| | 1 | John Smith          | Member   | Confirmed   | [Check-in] [Remove]       |
| | 2 | Sarah Lee           | Member   | Confirmed   | [Check-in] [Remove]       |
| | 3 | Bob Wilson          | Member   | Confirmed   | [Checked In] 06:45        |
| | 4 | Lisa Chen           | Guest    | Confirmed   | [Check-in] [Remove]       |
| | 5 | Michael Johnson     | Drop-in  | Pending Pay | [Process Payment] [Remove]|
| | ...                                                                           |
| |12 | Emma Davis          | Member   | Confirmed   | [Check-in] [Remove]       |
+---------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------+
| Waitlist                                                                        |
+---------------------------------------------------------------------------------+
| | # | Name                | Type     | Added       | Actions                   |
| +---+---------------------+----------+-------------+---------------------------+
| | 1 | Tom Brown           | Member   | 28 Jan 2026 | [Move to Registered]      |
| | 2 | Amy White           | Member   | 30 Jan 2026 | [Move to Registered]      |
+---------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------+
| Quick Actions                                                                   |
+---------------------------------------------------------------------------------+
| [Send Reminder to All]  [Export Roster]  [Print Sign-in Sheet]  [Start Class]  |
+---------------------------------------------------------------------------------+

Revenue Summary:
  Member Registrations: 10 x B200 = B2,000
  Guest Registrations:   1 x B400 = B  400
  Drop-ins:              1 x B250 = B  250
  Total:                           B2,650
```

---

## Feature 7: Class Registration

### Description

Member registration for classes including sign-up, waitlist management, cancellation policies, and attendance tracking.

### Registration Features

| Feature | Description | Example |
|---------|-------------|---------|
| Online Registration | Book via portal/app | Reserve spot in yoga class |
| Waitlist | Auto-promote when spot opens | Notified + auto-register option |
| Package Booking | Use class package credits | 10-class yoga package |
| Cancellation | Self-service with policies | Free until 4 hours before |

### Data Model

```prisma
model ClassRegistration {
  id              String    @id @default(uuid())
  classId         String
  class           FacilityClass @relation(fields: [classId], references: [id])

  // Participant
  memberId        String?
  member          Member?   @relation(fields: [memberId], references: [id])

  // For guests/drop-ins
  guestName       String?
  guestEmail      String?
  guestPhone      String?
  sponsorMemberId String?   // Member who brought guest

  // Registration type
  registrationType RegistrationType @default(MEMBER)

  // Package usage
  packageId       String?
  classPackage    ClassPackage? @relation(fields: [packageId], references: [id])

  // Status
  status          RegistrationStatus @default(CONFIRMED)
  waitlistPosition Int?

  // Attendance
  checkedInAt     DateTime?
  checkedInBy     String?
  attendanceStatus AttendanceStatus?

  // Payment
  amount          Decimal
  isPaid          Boolean   @default(false)
  paidAt          DateTime?
  paymentMethod   String?

  // Cancellation
  cancelledAt     DateTime?
  cancelledBy     String?
  cancellationReason String?
  refundAmount    Decimal?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum RegistrationType {
  MEMBER          // Regular member
  GUEST           // Guest of member
  DROP_IN         // Walk-in/day pass
  PACKAGE         // Using class package
  COMPLIMENTARY   // Free/comped
}

enum RegistrationStatus {
  PENDING         // Awaiting confirmation/payment
  CONFIRMED       // Registered and confirmed
  WAITLISTED      // On waitlist
  CHECKED_IN      // Attended
  CANCELLED       // Registration cancelled
  NO_SHOW         // Did not attend
}

enum AttendanceStatus {
  PRESENT         // Attended class
  LATE            // Arrived late
  LEFT_EARLY      // Left before end
  NO_SHOW         // Did not attend
}

model ClassPackage {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  memberId        String
  member          Member    @relation(fields: [memberId], references: [id])

  // Package details
  packageTypeId   String
  packageType     ClassPackageType @relation(fields: [packageTypeId], references: [id])

  // Credits
  totalCredits    Int
  remainingCredits Int

  // Validity
  purchaseDate    DateTime
  expiresAt       DateTime?

  // Value
  purchasePrice   Decimal

  isActive        Boolean   @default(true)

  usages          ClassRegistration[]
}

model ClassPackageType {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  name            String    // "10-Class Yoga Pass", "Monthly Unlimited"
  description     String?

  // Credits
  credits         Int?      // Null = unlimited

  // Valid for which class types
  validClassTypes String[]  // Empty = all classes

  // Pricing
  price           Decimal

  // Validity
  validDays       Int?      // Days from purchase until expiry

  isActive        Boolean   @default(true)

  packages        ClassPackage[]
}

model CancellationPolicy {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  name            String

  // Time windows and refund percentages
  rules           Json
  // Example: [
  //   {"hoursBeforeClass": 24, "refundPercent": 100},
  //   {"hoursBeforeClass": 4, "refundPercent": 50},
  //   {"hoursBeforeClass": 0, "refundPercent": 0}
  // ]

  // No-show handling
  noShowPenalty   Decimal?  // Fixed penalty amount
  noShowCountsTowardsPackage Boolean @default(true)

  // Applies to
  classTypeIds    String[]  // Empty = all

  isActive        Boolean   @default(true)
}
```

### UX Flow: Member Class Registration

**Member signs up for class**

```
+---------------------------------------------------------------------------------+
| Register for Class                                                         [X]  |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Morning Yoga Flow                                                               |
| Saturday, 01 Feb 2026  |  07:00 - 08:00                                         |
| Studio A  |  Instructor: Sarah Chen                                             |
|                                                                                 |
| Spots Available: 8 of 20                                                        |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Registration                                                                    |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Registering:  John Smith (M-1234)                                               |
|                                                                                 |
| Payment Method:                                                                 |
|                                                                                 |
| (x) Charge to Member Account (B200)                                             |
| ( ) Use Class Package (8 credits remaining)                                     |
| ( ) Visa ****4521 (B200)                                                        |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Add to Calendar                                                                 |
+---------------------------------------------------------------------------------+
|                                                                                 |
| [x] Add to my Google Calendar                                                   |
| [x] Send confirmation email                                                     |
| [x] Send reminder 24 hours before                                               |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Cancellation Policy                                                             |
+---------------------------------------------------------------------------------+
|                                                                                 |
| - Free cancellation until 4 hours before class                                  |
| - 50% charge for cancellation within 4 hours                                    |
| - No-shows will be charged full amount                                          |
|                                                                                 |
+---------------------------------------------------------------------------------+
|                                                                                 |
|                                              [Cancel]    [Register - B200]      |
+---------------------------------------------------------------------------------+
```

### UX Flow: Waitlist Registration

**Class is full, member joins waitlist**

```
+---------------------------------------------------------------------------------+
| Join Waitlist                                                              [X]  |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Morning Yoga Flow                                                               |
| Saturday, 01 Feb 2026  |  07:00 - 08:00                                         |
|                                                                                 |
| This class is currently full.                                                   |
| Current waitlist: 2 people                                                      |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Waitlist Options                                                                |
+---------------------------------------------------------------------------------+
|                                                                                 |
| (x) Auto-register if spot opens                                                 |
|     You will be automatically registered and charged if a spot becomes          |
|     available. You can cancel within the regular cancellation window.           |
|                                                                                 |
| ( ) Notify me when spot opens                                                   |
|     You will receive a notification but will need to manually register.         |
|     Spot is not guaranteed.                                                     |
|                                                                                 |
| Notification preference:                                                        |
| [x] Email  [x] SMS  [x] Push notification                                       |
|                                                                                 |
+---------------------------------------------------------------------------------+
|                                                                                 |
|                                              [Cancel]    [Join Waitlist]        |
+---------------------------------------------------------------------------------+
```

### UX Flow: Waitlist Promotion Notification

**Spot opens, member is promoted**

```
+---------------------------------------------------------------------------------+
| Spot Available - Auto-Registered!                                          [X]  |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Great news! A spot has opened up.                                               |
|                                                                                 |
| You have been automatically registered for:                                     |
|                                                                                 |
| Morning Yoga Flow                                                               |
| Saturday, 01 Feb 2026  |  07:00 - 08:00                                         |
| Studio A                                                                        |
|                                                                                 |
| Amount Charged: B200 to your member account                                     |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Important                                                                       |
+---------------------------------------------------------------------------------+
|                                                                                 |
| You can cancel for free until:                                                  |
| Friday, 31 Jan 2026 at 03:00                                                    |
|                                                                                 |
| After this time, 50% cancellation fee applies.                                  |
|                                                                                 |
+---------------------------------------------------------------------------------+
|                                                                                 |
|                              [Cancel Registration]    [Keep Registration]       |
+---------------------------------------------------------------------------------+
```

### UX Flow: Class Cancellation (Member)

**Member cancels registration**

```
+---------------------------------------------------------------------------------+
| Cancel Class Registration                                                  [X]  |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Are you sure you want to cancel your registration?                              |
|                                                                                 |
| Class:        Morning Yoga Flow                                                 |
| Date:         Saturday, 01 Feb 2026                                             |
| Time:         07:00 - 08:00                                                     |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Cancellation Details                                                            |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Current Time:         Friday, 31 Jan 2026  14:30                                |
| Class Starts In:      16 hours 30 minutes                                       |
| Free Cancel Deadline: 03:00 (already passed)                                    |
|                                                                                 |
| Cancellation Fee:     B100 (50% of B200)                                        |
| Refund Amount:        B100 (credited to account)                                |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Reason for Cancellation                                                         |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Reason: [Schedule conflict ▼]                                                   |
|                                                                                 |
| [x] Automatically add me to waitlist for next class                             |
|                                                                                 |
+---------------------------------------------------------------------------------+
|                                                                                 |
|          [Keep Registration]           [Cancel & Accept B100 Fee]               |
+---------------------------------------------------------------------------------+
```

### UX Flow: My Classes (Member Portal)

**Member views their class registrations**

```
+---------------------------------------------------------------------------------+
| My Classes                                                                      |
+---------------------------------------------------------------------------------+
| [Upcoming]  [Past]  [Packages]  [Waitlist]                                      |
+---------------------------------------------------------------------------------+

This Week
+---------------------------------------------------------------------------------+
| +-----------------------------------------------------------------------------+ |
| | TOMORROW                                                                    | |
| | +-------------------------------------------------------------------------+ | |
| | | Morning Yoga Flow                 Sat, 01 Feb   07:00 - 08:00           | | |
| | | Studio A  |  Sarah Chen           Status: [CONFIRMED]                   | | |
| | |                                                                         | | |
| | |                    [Add to Calendar]  [Get Directions]  [Cancel]        | | |
| | +-------------------------------------------------------------------------+ | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | TUESDAY                                                                     | |
| | +-------------------------------------------------------------------------+ | |
| | | Spin Class                        Tue, 04 Feb   18:00 - 19:00           | | |
| | | Spin Room  |  Mike Johnson        Status: [WAITLISTED #2]               | | |
| | |                                   Auto-register: Yes                    | | |
| | |                                                                         | | |
| | |                    [View Waitlist Position]  [Leave Waitlist]           | | |
| | +-------------------------------------------------------------------------+ | |
| +-----------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------+

My Class Packages
+---------------------------------------------------------------------------------+
| +-----------------------------------------------------------------------------+ |
| | 10-Class Yoga Pass                                                          | |
| | Remaining: [||||||||  ] 8 of 10 classes                                     | |
| | Expires: 15 Mar 2026 (43 days)                                              | |
| |                                                                             | |
| | Valid for: All Yoga classes                                                 | |
| | Used: 2 classes this month                                                  | |
| |                                                                             | |
| |                                    [View History]  [Find Classes to Book]   | |
| +-----------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------+
```

---

## Feature 8: Rental Items

### Description

Equipment rental inventory including racquets, balls, towels, and other items with pricing and availability tracking.

### Rental Categories

| Category | Items | Pricing Model |
|----------|-------|---------------|
| Sports Equipment | Racquets, balls, shoes | Per hour or per session |
| Pool Equipment | Kickboards, fins, goggles | Per session |
| Gym Accessories | Mats, towels, lockers | Per visit or daily |
| General | Umbrellas, carts | Per use |

### Data Model

```prisma
model RentalItemType {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  name            String    // "Tennis Racquet", "Yoga Mat", "Pool Towel"
  category        RentalCategory
  description     String?

  // Pricing
  pricePerHour    Decimal?
  pricePerSession Decimal?  // Per booking session
  pricePerDay     Decimal?

  // Deposit
  depositRequired Boolean   @default(false)
  depositAmount   Decimal?

  // Replacement
  replacementCost Decimal?

  // Late fee
  lateFeePerHour  Decimal?

  // Association
  forResourceTypes String[] // Which resource types this is for

  // Display
  photo           String?
  sortOrder       Int       @default(0)

  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  items           RentalItem[]
}

enum RentalCategory {
  SPORTS          // Racquets, balls, shoes
  POOL            // Swim gear
  GYM             // Mats, towels
  GENERAL         // Misc items
}

model RentalItem {
  id              String    @id @default(uuid())
  itemTypeId      String
  itemType        RentalItemType @relation(fields: [itemTypeId], references: [id])

  // Identification
  code            String    // "TR-001", "YM-015"
  barcode         String?

  // Status
  status          RentalItemStatus @default(AVAILABLE)
  condition       ItemCondition @default(GOOD)

  // Location
  location        String?   // "Pro Shop Rack 1", "Pool Desk"

  // Tracking
  purchaseDate    DateTime?
  lastMaintenance DateTime?
  nextMaintenance DateTime?

  // Notes
  notes           String?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  checkouts       RentalCheckout[]
}

enum RentalItemStatus {
  AVAILABLE       // Ready to rent
  RENTED          // Currently checked out
  RESERVED        // Reserved for booking
  MAINTENANCE     // Being serviced
  DAMAGED         // Needs repair
  RETIRED         // No longer available
}

enum ItemCondition {
  NEW
  EXCELLENT
  GOOD
  FAIR
  POOR
}

model RentalInventory {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  date            DateTime  @db.Date
  itemTypeId      String

  // Counts
  totalItems      Int
  availableItems  Int
  rentedItems     Int
  reservedItems   Int
  maintenanceItems Int

  createdAt       DateTime  @default(now())

  @@unique([clubId, date, itemTypeId])
}
```

### UX Flow: Rental Inventory Management

**Staff manages rental items**

```
+---------------------------------------------------------------------------------+
| Rental Items                                              [+ Add Item Type]     |
+---------------------------------------------------------------------------------+
| [All Categories ▼]  [All Status ▼]                            [Search...]      |
+---------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------+
| Sports Equipment                                                                |
+---------------------------------------------------------------------------------+
| +-----------------------------------------------------------------------------+ |
| | [Racquet Icon] Tennis Racquet                                               | |
| | B100/hour  |  B200/session  |  Deposit: B500                                | |
| |                                                                             | |
| | Available: 12  |  Rented: 5  |  Reserved: 2  |  Maintenance: 1              | |
| | Total Inventory: 20 items                                                   | |
| |                                                                             | |
| |         [View Items]  [Add Stock]  [Pricing]  [Edit]                        | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | [Ball Icon] Tennis Balls (Sleeve of 3)                                      | |
| | B50/session (consumable)  |  No deposit                                     | |
| |                                                                             | |
| | In Stock: 45 sleeves  |  Low Stock Alert: < 10                              | |
| |                                                                             | |
| |         [View Stock]  [Add Stock]  [Pricing]  [Edit]                        | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Pool Equipment                                                                  |
+---------------------------------------------------------------------------------+
| +-----------------------------------------------------------------------------+ |
| | [Towel Icon] Pool Towel                                                     | |
| | B30/visit  |  No deposit                                                    | |
| |                                                                             | |
| | Available: 85  |  In Use: 15  |  Laundry: 20                                | |
| | Total Inventory: 120 towels                                                 | |
| |                                                                             | |
| |         [View Status]  [Mark Returned]  [Pricing]  [Edit]                   | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
+---------------------------------------------------------------------------------+
```

### UX Flow: Individual Item Management

**View items within a type**

```
+---------------------------------------------------------------------------------+
| Tennis Racquets                                               [+ Add Racquet]   |
+---------------------------------------------------------------------------------+
| 20 total  |  12 available  |  5 rented  |  2 reserved  |  1 maintenance        |
+---------------------------------------------------------------------------------+
| [All Status ▼]  [All Locations ▼]                            [Search by code]  |
+---------------------------------------------------------------------------------+

| Code    | Condition | Status      | Location        | Current Holder          |
+---------+-----------+-------------+-----------------+-------------------------+
| TR-001  | Good      | Available   | Pro Shop Rack 1 | --                      |
| TR-002  | Excellent | Rented      | --              | John Smith (M-1234)     |
|         |           |             |                 | Return: 12:00 today     |
| TR-003  | Good      | Rented      | --              | Sarah Lee (M-2345)      |
|         |           |             |                 | Return: 10:30 today     |
| TR-004  | New       | Reserved    | Pro Shop Rack 1 | Booking: 14:00-15:00    |
|         |           |             |                 | Bob Wilson (M-3456)     |
| TR-005  | Fair      | Maintenance | Workshop        | Restringing             |
|         |           |             |                 | Est. return: Tomorrow   |
| ...     |           |             |                 |                         |
+---------+-----------+-------------+-----------------+-------------------------+

Quick Actions: [Mark All Returned]  [Print Barcodes]  [Export Inventory]
```

### UX Flow: Add Rental Item Type

**Create new rental item category**

```
+---------------------------------------------------------------------------------+
| Add Rental Item Type                                                       [X]  |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Item Name:        [Ball Machine______________]                                  |
| Category:         [Sports Equipment ▼]                                          |
|                                                                                 |
| Description:      [Automatic ball machine for tennis practice________]          |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Pricing                                                                         |
+---------------------------------------------------------------------------------+
|                                                                                 |
| [x] Hourly Rate        B [200___]                                               |
| [x] Per Session Rate   B [300___]                                               |
| [ ] Daily Rate         B [______]                                               |
|                                                                                 |
| Deposit:                                                                        |
| [x] Require deposit    B [2,000__]                                              |
|                                                                                 |
| Late Fee:              B [100___] per hour                                      |
|                                                                                 |
| Replacement Cost:      B [15,000_] (for damage assessment)                      |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Availability                                                                    |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Available for:                                                                  |
| [x] Tennis Courts                                                               |
| [ ] Squash Courts                                                               |
| [ ] Badminton Courts                                                            |
|                                                                                 |
| Minimum rental duration:  [30___] minutes                                       |
| Maximum rental duration:  [4___] hours                                          |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Initial Inventory                                                               |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Starting quantity:    [3___] units                                              |
| Code prefix:          [BM-___]                                                  |
|                                                                                 |
| Auto-generate codes:  [x] BM-001, BM-002, BM-003                               |
|                                                                                 |
+---------------------------------------------------------------------------------+
|                                              [Cancel]    [Create Item Type]     |
+---------------------------------------------------------------------------------+
```

---

## Feature 9: Rental Checkout

### Description

Check-out tracking for rental items including return processing, automatic charging for late returns, and damage assessment.

### Checkout Features

| Feature | Description | Example |
|---------|-------------|---------|
| Checkout | Issue items to member | Scan barcode, log issue time |
| Return | Process item return | Check condition, calculate fees |
| Auto-Charge | Bill for late returns | Charge per-hour after grace |
| Damage | Assess and charge damage | Full or partial replacement cost |

### Data Model

```prisma
model RentalCheckout {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  // Item
  itemId          String
  item            RentalItem @relation(fields: [itemId], references: [id])

  // Renter
  memberId        String
  member          Member    @relation(fields: [memberId], references: [id])

  // Associated booking (optional)
  bookingId       String?
  booking         ResourceBooking? @relation(fields: [bookingId], references: [id])

  // Timing
  checkoutTime    DateTime  @default(now())
  expectedReturn  DateTime
  actualReturn    DateTime?

  // Staff
  checkedOutBy    String
  returnedTo      String?

  // Deposit
  depositCollected Decimal?
  depositReturned  Decimal?
  depositRetained  Decimal?
  depositRetainedReason String?

  // Fees
  rentalFee       Decimal
  lateFee         Decimal   @default(0)
  damageFee       Decimal   @default(0)
  totalCharge     Decimal

  // Return condition
  returnCondition ItemCondition?
  conditionNotes  String?
  damagePhotos    String[]

  // Payment
  isPaid          Boolean   @default(false)
  paidAt          DateTime?
  paymentMethod   String?

  // Status
  status          CheckoutStatus @default(ACTIVE)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum CheckoutStatus {
  ACTIVE          // Item is checked out
  RETURNED        // Item returned normally
  OVERDUE         // Past expected return
  LATE_RETURNED   // Returned after expected time
  DAMAGED         // Returned with damage
  LOST            // Item not returned / lost
}

model RentalTransaction {
  id              String    @id @default(uuid())
  checkoutId      String
  checkout        RentalCheckout @relation(fields: [checkoutId], references: [id])

  type            RentalTransactionType
  amount          Decimal
  description     String

  createdAt       DateTime  @default(now())
}

enum RentalTransactionType {
  RENTAL_FEE
  DEPOSIT_COLLECTED
  DEPOSIT_REFUNDED
  DEPOSIT_RETAINED
  LATE_FEE
  DAMAGE_FEE
  REPLACEMENT_CHARGE
}

model LateRentalAlert {
  id              String    @id @default(uuid())
  checkoutId      String
  checkout        RentalCheckout @relation(fields: [checkoutId], references: [id])

  alertType       LateAlertType
  sentAt          DateTime  @default(now())
  sentTo          String    // Email or phone

  acknowledged    Boolean   @default(false)
  acknowledgedAt  DateTime?
}

enum LateAlertType {
  APPROACHING_DUE     // 30 min before
  OVERDUE             // At expected return time
  OVERDUE_1_HOUR      // 1 hour past
  OVERDUE_2_HOURS     // 2 hours past
  FINAL_WARNING       // Before charging
}
```

### UX Flow: Checkout Item

**Staff checks out rental item to member**

```
+---------------------------------------------------------------------------------+
| Rental Checkout                                                            [X]  |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Scan Item or Enter Code: [TR-002_______] [Scan Barcode]                         |
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | Item Found: Tennis Racquet (TR-002)                                         | |
| | Condition: Excellent  |  Location: Pro Shop Rack 1                          | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Member                                                                          |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Member: [Search or scan card...________] [Scan Member Card]                     |
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | John Smith (M-1234)                                       [Gold Member]     | |
| | Account Balance: B45,000  |  Credit Available: B50,000                      | |
| | Active Booking: Court 1  |  08:00 - 09:00 (current)                         | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Rental Details                                                                  |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Duration:          ( ) Hourly    (x) Per Session (booking)   ( ) Full Day       |
|                                                                                 |
| Link to Booking:   [x] Court 1 - 08:00 to 09:00                                 |
|                                                                                 |
| Expected Return:   09:00 today (1 hour)                                         |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Pricing                                                                         |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Rental Fee (per session):                                   B200.00             |
| Deposit (refundable):                                       B500.00             |
|                                                            -----------          |
| Total at Checkout:                                          B700.00             |
|                                                                                 |
| Deposit will be refunded upon return in good condition.                         |
|                                                                                 |
| Payment Method:                                                                 |
| (x) Charge to Member Account                                                    |
| ( ) Cash (collect deposit)                                                      |
| ( ) Card                                                                        |
|                                                                                 |
+---------------------------------------------------------------------------------+
|                                                                                 |
|                                              [Cancel]    [Complete Checkout]    |
+---------------------------------------------------------------------------------+
```

### UX Flow: Return Item

**Staff processes item return**

```
+---------------------------------------------------------------------------------+
| Return Rental Item                                                         [X]  |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Scan Item or Enter Code: [TR-002_______] [Scan Barcode]                         |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Checkout Details                                                                |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Item:             Tennis Racquet (TR-002)                                       |
| Renter:           John Smith (M-1234)                                           |
| Checked Out:      08:05 today                                                   |
| Expected Return:  09:00 today                                                   |
| Current Time:     09:15 today                                                   |
| Status:           [OVERDUE - 15 min]                                            |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Return Condition                                                                |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Condition at Return:                                                            |
| ( ) Excellent - No issues                                                       |
| (x) Good - Normal wear                                                          |
| ( ) Fair - Minor damage                                                         |
| ( ) Damaged - Significant damage                                                |
|                                                                                 |
| Condition Notes:  [Minor scuff on frame, normal use_______]                     |
|                                                                                 |
| [ ] Add photos of condition                [Upload]                             |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Fee Calculation                                                                 |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Rental Fee (already charged):                               B200.00             |
| Late Fee (15 min - within grace period):                    B  0.00             |
| Damage Fee:                                                 B  0.00             |
|                                                            -----------          |
| Additional Charges:                                         B  0.00             |
|                                                                                 |
| Deposit Collected:                                          B500.00             |
| Deposit to Return:                                          B500.00             |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Deposit Return Method                                                           |
+---------------------------------------------------------------------------------+
|                                                                                 |
| (x) Credit to Member Account                                                    |
| ( ) Cash                                                                        |
| ( ) Retain (specify reason)                                                     |
|                                                                                 |
+---------------------------------------------------------------------------------+
|                                                                                 |
|                                              [Cancel]    [Complete Return]      |
+---------------------------------------------------------------------------------+
```

### UX Flow: Overdue Rentals Dashboard

**Staff monitors overdue items**

```
+---------------------------------------------------------------------------------+
| Overdue Rentals                                              [Refresh]          |
+---------------------------------------------------------------------------------+
| 5 items currently overdue  |  Auto-charge in: 2 hours                           |
+---------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------+
| CRITICAL - Over 2 Hours                                                         |
+---------------------------------------------------------------------------------+
| +-----------------------------------------------------------------------------+ |
| | Tennis Racquet (TR-005)              Overdue: 2h 45min          [!]         | |
| | Member: Bob Wilson (M-3456)  |  Phone: 081-234-5678                         | |
| | Expected: 07:00  |  Late Fee Accrued: B250                                  | |
| |                                                                             | |
| |         [Call Member]  [Send SMS]  [Mark Returned]  [Mark Lost]             | |
| +-----------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------+
| WARNING - Over 1 Hour                                                           |
+---------------------------------------------------------------------------------+
| +-----------------------------------------------------------------------------+ |
| | Pool Towel (PT-042)                  Overdue: 1h 20min                      | |
| | Member: Sarah Lee (M-2345)  |  Phone: 081-345-6789                          | |
| | Expected: 08:00  |  Late Fee Accrued: B40                                   | |
| |                                                                             | |
| |         [Call Member]  [Send SMS]  [Mark Returned]                          | |
| +-----------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------+

+---------------------------------------------------------------------------------+
| APPROACHING - Under 1 Hour                                                      |
+---------------------------------------------------------------------------------+
| +-----------------------------------------------------------------------------+ |
| | Tennis Racquet (TR-002)              Overdue: 15min             [Grace]     | |
| | Member: John Smith (M-1234)  |  Still at Court 1                            | |
| | Expected: 09:00  |  Grace period: 30min                                     | |
| |                                                                             | |
| |         [Send Reminder]  [Extend Time]  [Mark Returned]                     | |
| +-----------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------+

Auto-Charge Settings:
[x] Auto-charge late fees after 2 hour grace period
[x] Send SMS reminder at 30 min overdue
[x] Notify duty manager for items overdue > 2 hours
```

### UX Flow: Damage Assessment

**Processing damaged return**

```
+---------------------------------------------------------------------------------+
| Damage Assessment                                                          [X]  |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Item:             Tennis Racquet (TR-005)                                       |
| Renter:           Bob Wilson (M-3456)                                           |
| Condition at Checkout: Excellent                                                |
| Condition at Return:   Damaged                                                  |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Damage Description                                                              |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Type of Damage:   [x] Structural   [ ] Cosmetic   [ ] Missing parts             |
|                                                                                 |
| Description:                                                                    |
| [Cracked frame at the throat. Racquet is unusable and needs___]                 |
| [replacement._________________________________________________]                 |
|                                                                                 |
| Photos:                                                                         |
| +--------+  +--------+  +--------+                                              |
| | [IMG1] |  | [IMG2] |  | [+Add] |                                              |
| +--------+  +--------+  +--------+                                              |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Fee Assessment                                                                  |
+---------------------------------------------------------------------------------+
|                                                                                 |
| Damage Level:                                                                   |
| ( ) Minor - Repair possible                      B [_______]                    |
| ( ) Moderate - Significant repair needed         B [_______]                    |
| (x) Severe - Replacement required                B [3,500___]                   |
|                                                                                 |
| Replacement Cost:                                           B3,500.00           |
|                                                                                 |
| Deposit Held:                                              -B  500.00           |
|                                                            -----------          |
| Additional Charge to Member:                                B3,000.00           |
|                                                                                 |
+---------------------------------------------------------------------------------+
| Member Notification                                                             |
+---------------------------------------------------------------------------------+
|                                                                                 |
| [x] Send damage report to member via email                                      |
| [x] Include photos in report                                                    |
| [ ] Request member acknowledgment before charging                               |
|                                                                                 |
+---------------------------------------------------------------------------------+
|                                                                                 |
| [Cancel]  [Waive Fee (Manager)]  [Apply Charge - B3,000]                        |
+---------------------------------------------------------------------------------+
```

### UX Flow: Rental History (Member View)

**Member views their rental history**

```
+---------------------------------------------------------------------------------+
| My Rental History                                                               |
+---------------------------------------------------------------------------------+
| [Active]  [Completed]  [All]                                                    |
+---------------------------------------------------------------------------------+

Active Rentals
+---------------------------------------------------------------------------------+
| +-----------------------------------------------------------------------------+ |
| | Tennis Racquet (TR-002)                                   [ACTIVE]          | |
| | Checked Out: Today 08:05  |  Due Back: 09:00                                | |
| | Court Booking: Court 1  |  08:00 - 09:00                                    | |
| |                                                                             | |
| | Rental Fee: B200  |  Deposit: B500 (refundable)                             | |
| |                                                                             | |
| | Time Remaining: 45 minutes                                                  | |
| |                                                                             | |
| | [Extend Rental]  [Report Issue]                                             | |
| +-----------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------+

Recent Completed Rentals
+---------------------------------------------------------------------------------+
| +-----------------------------------------------------------------------------+ |
| | Tennis Balls (Sleeve)                                     [COMPLETED]       | |
| | 28 Jan 2026  |  08:00 - 09:00                                               | |
| | Charge: B50                                                                 | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | Tennis Racquet (TR-007)                                   [COMPLETED]       | |
| | 25 Jan 2026  |  10:00 - 11:30  |  Returned on time                          | |
| | Charge: B200  |  Deposit: B500 returned                                     | |
| +-----------------------------------------------------------------------------+ |
|                                                                                 |
| +-----------------------------------------------------------------------------+ |
| | Ball Machine (BM-001)                                     [LATE RETURN]     | |
| | 20 Jan 2026  |  14:00 - 15:00  |  Returned 15:45                            | |
| | Charge: B300  |  Late Fee: B100  |  Total: B400                             | |
| +-----------------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------+
```

---

## Summary

| Feature | Priority | Complexity | Dependencies |
|---------|----------|------------|--------------|
| 1. Court Calendar | Critical | High | Resource Types |
| 2. Online Booking | Critical | High | Court Calendar, Booking Rules |
| 3. Booking Rules | Critical | Medium | Resource Types |
| 4. Resource Types | Critical | Medium | None (foundational) |
| 5. Guest Booking | Medium | Medium | Online Booking |
| 6. Class Scheduling | Critical | High | Resource Types |
| 7. Class Registration | Critical | Medium | Class Scheduling |
| 8. Rental Items | Medium | Low | Resource Types |
| 9. Rental Checkout | Medium | Medium | Rental Items |

**Recommended Implementation Order:**

1. **Resource Types** (foundational - defines courts, pools, equipment)
2. **Booking Rules** (needed for all booking logic)
3. **Court Calendar** (core staff interface)
4. **Online Booking** (member self-service)
5. **Guest Booking** (extends booking capabilities)
6. **Class Scheduling** (separate but parallel track)
7. **Class Registration** (depends on scheduling)
8. **Rental Items** (inventory foundation)
9. **Rental Checkout** (depends on inventory)

---

## References

- [Phase 1 UX Spec](/Users/peak/development/vantage/clubvantage/docs/plans/2026-02-01-pos-phase1-ux-spec.md)
- [POS Roadmap](/Users/peak/development/vantage/clubvantage/docs/plans/2026-02-01-pos-roadmap-design.md)
- [CourtReserve](https://courtreserve.com/)
- [EZFacility](https://www.ezfacility.com/)
- [ClubAutomation](https://www.clubautomation.com/)
