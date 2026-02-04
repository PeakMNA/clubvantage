# POS Configuration Reference by Outlet Type

**Date:** 2026-02-02
**Purpose:** Comprehensive reference of all POS functions and configuration options for each club outlet type

---

## Table of Contents

1. [Configuration Overview](#1-configuration-overview)
2. [Membership Services](#2-membership-services)
3. [Fine Dining Restaurant](#3-fine-dining-restaurant)
4. [Fast Food / Quick Service](#4-fast-food--quick-service)
5. [Spa & Wellness](#5-spa--wellness)
6. [Sports Facility](#6-sports-facility)
7. [Golf Pro Shop](#7-golf-pro-shop)
8. [Golf Check-in / Starter Desk](#8-golf-check-in--starter-desk)
9. [Packages & Session-Based Services](#9-packages--session-based-services)
10. [Shared Configuration Components](#10-shared-configuration-components)
11. [Implementation Priority Matrix](#11-implementation-priority-matrix)

---

## 1. Configuration Overview

### Configuration Hierarchy

```
Club Settings (global defaults)
└── Template (outlet type defaults)
    └── Outlet (location overrides)
        └── Role (permission-based overrides)
```

### Zone-Based Toolbar Layout

All outlet types use a three-zone toolbar:

| Zone | Purpose | Example Items |
|------|---------|---------------|
| Left | Primary navigation | Search, Floor Plan, Tee Sheet |
| Center | Context actions | Member Lookup, Table Status, Court Status |
| Right | Transaction actions | Payment, Hold, New Ticket |

---

## 2. Membership Services

**Outlet Type:** `MEMBERSHIP`

### Primary Use Cases
- New member enrollment
- Membership renewals
- Membership upgrades/downgrades
- Dependent additions
- Membership fee collection
- Document processing

### Toolbar Configuration

| Zone | Items | Description |
|------|-------|-------------|
| Left | `search`, `memberDirectory` | Member lookup and directory access |
| Center | `memberProfile`, `membershipStatus`, `dependentList` | Member context display |
| Right | `processPayment`, `printReceipt`, `newEnrollment` | Transaction actions |

### Recommended Toolbar Items

```typescript
const membershipToolbarItems = [
  // Left Zone - Navigation
  { id: 'search', label: 'Search Members', icon: 'Search' },
  { id: 'memberDirectory', label: 'Directory', icon: 'Users' },
  { id: 'pendingApplications', label: 'Applications', icon: 'FileText' },

  // Center Zone - Member Context
  { id: 'memberProfile', label: 'Profile', icon: 'User' },
  { id: 'membershipTier', label: 'Tier Info', icon: 'Award' },
  { id: 'accountBalance', label: 'Balance', icon: 'Wallet' },
  { id: 'creditLimit', label: 'Credit Limit', icon: 'CreditCard' },
  { id: 'dependentList', label: 'Dependents', icon: 'Users' },

  // Right Zone - Actions
  { id: 'newEnrollment', label: 'New Member', icon: 'UserPlus' },
  { id: 'renewMembership', label: 'Renew', icon: 'RefreshCw' },
  { id: 'upgradeTier', label: 'Upgrade', icon: 'ArrowUp' },
  { id: 'processPayment', label: 'Payment', icon: 'DollarSign' },
];
```

### Action Bar Configuration

| Button | Action | Color | Shortcut |
|--------|--------|-------|----------|
| Process Payment | `PROCESS_PAYMENT` | primary | F1 |
| New Enrollment | `NEW_ENROLLMENT` | success | F2 |
| Renew Membership | `RENEW_MEMBERSHIP` | success | F3 |
| Add Dependent | `ADD_DEPENDENT` | neutral | F4 |
| Print Statement | `PRINT_STATEMENT` | neutral | F5 |
| Account History | `VIEW_HISTORY` | neutral | F6 |

### Product Panel Configuration

| Setting | Recommended Value |
|---------|-------------------|
| Grid Columns | 4 |
| Grid Rows | 3 |
| Tile Size | Large |
| Show Images | No |
| Show Prices | Yes |
| Category Style | Sidebar |
| Quick Keys | Disabled |

### Unique Features

- **Credit limit display**: Show member's credit limit and current balance
- **Tier benefits panel**: Display membership tier perks
- **Payment plan support**: Installment payment options
- **Document checklist**: Required documents for enrollment
- **Approval workflow**: Manager approval for tier upgrades

---

## 3. Fine Dining Restaurant

**Outlet Type:** `FNB_RESTAURANT`

### Primary Use Cases
- Table reservations and seating
- Multi-course meal service
- Wine/beverage pairings
- Split checks for parties
- VIP guest preferences
- Dietary requirement tracking

### Toolbar Configuration

| Zone | Items | Description |
|------|-------|-------------|
| Left | `floorPlan`, `reservations`, `waitlist` | Table and guest management |
| Center | `tableStatus`, `courseStatus`, `serverSection` | Service context |
| Right | `splitCheck`, `transferTable`, `printCheck` | Transaction actions |

### Recommended Toolbar Items

```typescript
const fineDiningToolbarItems = [
  // Left Zone - Floor Management
  { id: 'floorPlan', label: 'Floor Plan', icon: 'LayoutGrid' },
  { id: 'reservations', label: 'Reservations', icon: 'Calendar' },
  { id: 'waitlist', label: 'Waitlist', icon: 'Clock' },
  { id: 'guestHistory', label: 'Guest History', icon: 'History' },

  // Center Zone - Service Context
  { id: 'tableStatus', label: 'Table Status', icon: 'Table' },
  { id: 'courseStatus', label: 'Courses', icon: 'UtensilsCrossed' },
  { id: 'wineService', label: 'Wine', icon: 'Wine' },
  { id: 'dietaryAlerts', label: 'Dietary', icon: 'AlertCircle' },
  { id: 'memberLookup', label: 'Member', icon: 'UserCheck' },

  // Right Zone - Actions
  { id: 'sendToKitchen', label: 'Fire Course', icon: 'Flame' },
  { id: 'splitCheck', label: 'Split Check', icon: 'Scissors' },
  { id: 'transferTable', label: 'Transfer', icon: 'ArrowRightLeft' },
  { id: 'printCheck', label: 'Print Check', icon: 'Receipt' },
  { id: 'chargeToMember', label: 'Charge Member', icon: 'CreditCard' },
];
```

### Action Bar Configuration

| Button | Action | Color | Shortcut |
|--------|--------|-------|----------|
| Fire Next Course | `FIRE_COURSE` | warning | F1 |
| Hold Course | `HOLD_COURSE` | neutral | F2 |
| Print Check | `PRINT_CHECK` | primary | F3 |
| Split Check | `SPLIT_CHECK` | neutral | F4 |
| Charge to Member | `CHARGE_TO_MEMBER` | success | F5 |
| Transfer Table | `TRANSFER_TABLE` | neutral | F6 |
| Merge Tables | `MERGE_TABLES` | neutral | F7 |
| Manager Override | `MANAGER_OVERRIDE` | danger | F8 |
| Void Item | `VOID_ITEM` | danger | F9 |
| Add Comp | `ADD_COMP` | warning | F10 |
| Guest Profile | `GUEST_PROFILE` | neutral | F11 |
| Close Table | `CLOSE_TABLE` | success | F12 |

### Product Panel Configuration

| Setting | Recommended Value |
|---------|-------------------|
| Grid Columns | 5 |
| Grid Rows | 4 |
| Tile Size | Medium |
| Show Images | Yes |
| Show Prices | Yes |
| Category Style | Tabs |
| Quick Keys | Enabled (8 items) |

### Unique Features

- **Course sequencing**: Fire courses in proper order with timing controls
- **Wine pairing suggestions**: Recommend wines based on ordered dishes
- **Guest preferences**: Remember VIP preferences and allergies
- **Table merge/split**: Combine or divide tables dynamically
- **Server sections**: Assign servers to floor sections
- **Real-time table status**: Visual floor plan with status colors
- **Pre-authorization**: Hold card for payment guarantee

### Course Fire Status

| Status | Color | Description |
|--------|-------|-------------|
| Not Sent | Gray | Order not sent to kitchen |
| Fired | Orange | Currently being prepared |
| Ready | Green | Ready for pickup |
| Served | Blue | Delivered to table |
| Held | Yellow | Held by server request |

---

## 4. Fast Food / Quick Service

**Outlet Type:** `FNB_QSR`

### Primary Use Cases
- High-speed order entry
- Combo/meal building
- Kitchen display integration
- Drive-thru management
- Self-service kiosk
- Order status display

### Toolbar Configuration

| Zone | Items | Description |
|------|-------|-------------|
| Left | `search`, `orderQueue` | Order lookup and queue |
| Center | `orderType`, `currentOrder` | Order context (Dine-in/Takeout) |
| Right | `payment`, `clearOrder`, `repeatOrder` | Quick transaction actions |

### Recommended Toolbar Items

```typescript
const qsrToolbarItems = [
  // Left Zone - Quick Access
  { id: 'search', label: 'Search', icon: 'Search' },
  { id: 'orderQueue', label: 'Queue', icon: 'List' },
  { id: 'heldOrders', label: 'Held', icon: 'Pause' },

  // Center Zone - Order Type
  { id: 'dineIn', label: 'Dine In', icon: 'Utensils' },
  { id: 'takeout', label: 'Takeout', icon: 'ShoppingBag' },
  { id: 'delivery', label: 'Delivery', icon: 'Truck' },
  { id: 'memberLookup', label: 'Member', icon: 'UserCheck' },

  // Right Zone - Speed Actions
  { id: 'quickPay', label: 'Quick Pay', icon: 'Zap' },
  { id: 'clearOrder', label: 'Clear', icon: 'Trash' },
  { id: 'repeatLast', label: 'Repeat', icon: 'RotateCcw' },
  { id: 'voidItem', label: 'Void', icon: 'X' },
];
```

### Action Bar Configuration

| Button | Action | Color | Shortcut |
|--------|--------|-------|----------|
| Cash | `PROCESS_CASH` | success | F1 |
| Card | `PROCESS_CARD` | primary | F2 |
| Member Charge | `CHARGE_TO_MEMBER` | primary | F3 |
| Clear Order | `CLEAR_ORDER` | danger | F4 |
| Void Last | `VOID_LAST_ITEM` | warning | F5 |
| Repeat Order | `REPEAT_LAST_ORDER` | neutral | F6 |
| Price Check | `PRICE_CHECK` | neutral | F7 |
| Open Drawer | `OPEN_DRAWER` | neutral | F8 |

### Product Panel Configuration

| Setting | Recommended Value |
|---------|-------------------|
| Grid Columns | 6 |
| Grid Rows | 4 |
| Tile Size | Large |
| Show Images | Yes |
| Show Prices | Yes |
| Category Style | Tabs |
| Quick Keys | Enabled (12 items) |
| Smart Suggestions | Enabled (Top Row) |

### Unique Features

- **Speed screen mode**: Large buttons, minimal taps
- **Combo builder**: Auto-suggest combo completions
- **Kitchen display system (KDS)**: Real-time order status
- **Order number display**: Customer-facing order status
- **Bump bar integration**: Kitchen order management
- **Drive-thru mode**: Headset integration, timer tracking
- **Prep time estimates**: Show estimated wait times
- **Upsize prompts**: Auto-suggest size upgrades

### Order Flow States

| State | Color | KDS Display |
|-------|-------|-------------|
| New | Blue | Flash on screen |
| In Progress | Orange | Solid display |
| Ready | Green | Bump to pickup |
| Picked Up | Gray | Archive |
| Canceled | Red | Remove |

---

## 5. Spa & Wellness

**Outlet Type:** `SPA`

### Primary Use Cases
- Treatment bookings
- Therapist scheduling
- Retail product sales
- Package sales
- Gift card/vouchers
- Room assignment

### Toolbar Configuration

| Zone | Items | Description |
|------|-------|-------------|
| Left | `appointments`, `therapistSchedule`, `roomStatus` | Scheduling views |
| Center | `clientProfile`, `treatmentHistory`, `preferences` | Client context |
| Right | `checkIn`, `checkout`, `bookNext` | Transaction actions |

### Recommended Toolbar Items

```typescript
const spaToolbarItems = [
  // Left Zone - Scheduling
  { id: 'appointments', label: 'Appointments', icon: 'Calendar' },
  { id: 'therapistView', label: 'Therapists', icon: 'Users' },
  { id: 'roomStatus', label: 'Rooms', icon: 'DoorOpen' },
  { id: 'waitlist', label: 'Waitlist', icon: 'Clock' },

  // Center Zone - Client Context
  { id: 'clientProfile', label: 'Client', icon: 'User' },
  { id: 'memberLookup', label: 'Member', icon: 'UserCheck' },
  { id: 'treatmentHistory', label: 'History', icon: 'History' },
  { id: 'allergies', label: 'Allergies', icon: 'AlertTriangle' },
  { id: 'preferences', label: 'Preferences', icon: 'Heart' },

  // Right Zone - Actions
  { id: 'checkIn', label: 'Check In', icon: 'LogIn' },
  { id: 'addTreatment', label: 'Add Service', icon: 'Plus' },
  { id: 'checkout', label: 'Checkout', icon: 'ShoppingCart' },
  { id: 'bookNext', label: 'Book Next', icon: 'CalendarPlus' },
  { id: 'giftCard', label: 'Gift Card', icon: 'Gift' },
];
```

### Action Bar Configuration

| Button | Action | Color | Shortcut |
|--------|--------|-------|----------|
| Check In | `SPA_CHECK_IN` | success | F1 |
| Start Treatment | `START_TREATMENT` | primary | F2 |
| Complete Treatment | `COMPLETE_TREATMENT` | success | F3 |
| Add Retail | `ADD_RETAIL_ITEM` | neutral | F4 |
| Checkout | `PROCESS_CHECKOUT` | primary | F5 |
| Book Follow-up | `BOOK_NEXT_APPOINTMENT` | neutral | F6 |
| Sell Package | `SELL_PACKAGE` | success | F7 |
| Redeem Voucher | `REDEEM_VOUCHER` | warning | F8 |
| Cancel Appointment | `CANCEL_APPOINTMENT` | danger | F9 |
| No-show | `MARK_NO_SHOW` | warning | F10 |
| Apply Discount | `APPLY_DISCOUNT` | warning | F11 |
| Charge Member | `CHARGE_TO_MEMBER` | primary | F12 |

### Product Panel Configuration

| Setting | Recommended Value |
|---------|-------------------|
| Grid Columns | 4 |
| Grid Rows | 4 |
| Tile Size | Medium |
| Show Images | Yes |
| Show Prices | Yes |
| Category Style | Sidebar |
| Quick Keys | Enabled (6 items) |

### Unique Features

- **Appointment integration**: See today's appointments, check-in from POS
- **Therapist availability**: Real-time schedule view
- **Treatment timer**: Track treatment duration
- **Room management**: Assign and track treatment rooms
- **Client intake forms**: Digital health questionnaires
- **Package management**: Sell and track multi-visit packages
- **Gratuity handling**: Automatic tip distribution to therapists
- **Product recommendations**: Suggest retail based on treatments
- **Allergy/preference alerts**: Pop-up warnings for known sensitivities

### Appointment Status

| Status | Color | Description |
|--------|-------|-------------|
| Booked | Blue | Confirmed appointment |
| Checked In | Green | Client arrived |
| In Treatment | Purple | Service in progress |
| Completed | Gray | Service finished |
| Checkout | Orange | Awaiting payment |
| No Show | Red | Client didn't arrive |

---

## 6. Sports Facility

**Outlet Type:** `SPORTS_FACILITY`

### Primary Use Cases
- Court/facility booking
- Equipment rental
- Lesson scheduling
- League management
- Member check-in
- Pro shop sales

### Toolbar Configuration

| Zone | Items | Description |
|------|-------|-------------|
| Left | `courtSchedule`, `facilityMap`, `equipmentInventory` | Facility views |
| Center | `memberStatus`, `bookingDetails`, `lessonInfo` | Booking context |
| Right | `checkIn`, `assignCourt`, `processPayment` | Transaction actions |

### Recommended Toolbar Items

```typescript
const sportsFacilityToolbarItems = [
  // Left Zone - Facility Management
  { id: 'courtSchedule', label: 'Courts', icon: 'LayoutGrid' },
  { id: 'facilityMap', label: 'Facility', icon: 'Map' },
  { id: 'equipmentRentals', label: 'Equipment', icon: 'Package' },
  { id: 'upcomingLessons', label: 'Lessons', icon: 'GraduationCap' },

  // Center Zone - Booking Context
  { id: 'memberLookup', label: 'Member', icon: 'UserCheck' },
  { id: 'bookingDetails', label: 'Booking', icon: 'Info' },
  { id: 'guestPass', label: 'Guest Pass', icon: 'Ticket' },
  { id: 'memberBalance', label: 'Balance', icon: 'Wallet' },

  // Right Zone - Actions
  { id: 'checkIn', label: 'Check In', icon: 'LogIn' },
  { id: 'newBooking', label: 'Book Court', icon: 'CalendarPlus' },
  { id: 'rentEquipment', label: 'Rent', icon: 'Package' },
  { id: 'processPayment', label: 'Payment', icon: 'DollarSign' },
  { id: 'chargeToMember', label: 'Charge Member', icon: 'CreditCard' },
];
```

### Action Bar Configuration

| Button | Action | Color | Shortcut |
|--------|--------|-------|----------|
| Check In | `FACILITY_CHECK_IN` | success | F1 |
| Book Court | `BOOK_COURT` | primary | F2 |
| Rent Equipment | `RENT_EQUIPMENT` | neutral | F3 |
| Return Equipment | `RETURN_EQUIPMENT` | warning | F4 |
| Guest Pass | `ISSUE_GUEST_PASS` | neutral | F5 |
| Book Lesson | `BOOK_LESSON` | primary | F6 |
| Process Payment | `PROCESS_PAYMENT` | success | F7 |
| Charge Member | `CHARGE_TO_MEMBER` | primary | F8 |
| Cancel Booking | `CANCEL_BOOKING` | danger | F9 |
| Extend Time | `EXTEND_BOOKING` | warning | F10 |
| Print Pass | `PRINT_PASS` | neutral | F11 |
| View Schedule | `VIEW_MEMBER_SCHEDULE` | neutral | F12 |

### Product Panel Configuration

| Setting | Recommended Value |
|---------|-------------------|
| Grid Columns | 5 |
| Grid Rows | 4 |
| Tile Size | Medium |
| Show Images | Yes |
| Show Prices | Yes |
| Category Style | Tabs |
| Quick Keys | Enabled (8 items) |

### Unique Features

- **Court/facility schedule**: Visual booking grid by facility
- **Equipment tracking**: Barcode/RFID equipment rental
- **Lesson packages**: Multi-lesson package tracking
- **League management**: Team and match scheduling
- **Guest passes**: Issue and track guest access
- **Light control integration**: Auto-on lights for booked courts
- **Member booking limits**: Enforce booking quotas
- **Prime time pricing**: Automatic rate adjustments

### Court/Facility Status

| Status | Color | Description |
|--------|-------|-------------|
| Available | Green | Open for booking |
| Booked | Blue | Reserved |
| In Use | Orange | Currently occupied |
| Maintenance | Gray | Under maintenance |
| Blocked | Red | Not available |

---

## 7. Golf Pro Shop

**Outlet Type:** `GOLF_PRO_SHOP`

### Primary Use Cases
- Merchandise sales
- Golf equipment
- Club rentals
- Cart/caddy reservations
- Bag storage
- Member discounts

### Toolbar Configuration

| Zone | Items | Description |
|------|-------|-------------|
| Left | `search`, `inventory`, `specialOrders` | Product management |
| Center | `memberLookup`, `memberDiscount`, `loyaltyPoints` | Member context |
| Right | `checkout`, `holdSale`, `returnItem` | Transaction actions |

### Recommended Toolbar Items

```typescript
const proShopToolbarItems = [
  // Left Zone - Product Management
  { id: 'search', label: 'Search', icon: 'Search' },
  { id: 'inventory', label: 'Inventory', icon: 'Package' },
  { id: 'specialOrders', label: 'Special Orders', icon: 'Clock' },
  { id: 'clubRentals', label: 'Club Rental', icon: 'Golf' },

  // Center Zone - Member Context
  { id: 'memberLookup', label: 'Member', icon: 'UserCheck' },
  { id: 'memberDiscount', label: 'Discount', icon: 'Percent' },
  { id: 'loyaltyPoints', label: 'Points', icon: 'Star' },
  { id: 'bagStorage', label: 'Bag Storage', icon: 'Briefcase' },

  // Right Zone - Transaction Actions
  { id: 'checkout', label: 'Checkout', icon: 'ShoppingCart' },
  { id: 'chargeToMember', label: 'Charge Member', icon: 'CreditCard' },
  { id: 'holdSale', label: 'Hold', icon: 'Pause' },
  { id: 'returnItem', label: 'Return', icon: 'RotateCcw' },
  { id: 'giftCard', label: 'Gift Card', icon: 'Gift' },
];
```

### Action Bar Configuration

| Button | Action | Color | Shortcut |
|--------|--------|-------|----------|
| Cash | `PROCESS_CASH` | success | F1 |
| Card | `PROCESS_CARD` | primary | F2 |
| Charge Member | `CHARGE_TO_MEMBER` | primary | F3 |
| Apply Discount | `APPLY_DISCOUNT` | warning | F4 |
| Hold Sale | `HOLD_SALE` | neutral | F5 |
| Recall Sale | `RECALL_SALE` | neutral | F6 |
| Return/Exchange | `PROCESS_RETURN` | danger | F7 |
| Price Override | `PRICE_OVERRIDE` | warning | F8 |
| Void Item | `VOID_ITEM` | danger | F9 |
| Print Receipt | `PRINT_RECEIPT` | neutral | F10 |
| Open Drawer | `OPEN_DRAWER` | neutral | F11 |
| Gift Card | `SELL_GIFT_CARD` | success | F12 |

### Product Panel Configuration

| Setting | Recommended Value |
|---------|-------------------|
| Grid Columns | 6 |
| Grid Rows | 4 |
| Tile Size | Medium |
| Show Images | Yes |
| Show Prices | Yes |
| Category Style | Tabs |
| Quick Keys | Enabled (10 items) |
| Smart Suggestions | Enabled |

### Unique Features

- **Member tier pricing**: Automatic member discounts by tier
- **Inventory with variants**: Size/color/handedness tracking
- **Special orders**: Track custom orders and notify when ready
- **Club fitting appointments**: Integration with fitting services
- **Demo club tracking**: Track demo equipment checkout
- **Gift registry**: Member gift wish lists
- **Bag storage management**: Locker assignment and billing
- **Consignment sales**: Track and pay consignment vendors

---

## 8. Golf Check-in / Starter Desk

**Outlet Type:** `GOLF_TEE_SHEET`

### Primary Use Cases
- Player check-in
- Tee time confirmation
- Cart/caddy assignment
- Green fee collection
- Starter sheet management
- Player marshaling

### Toolbar Configuration

| Zone | Items | Description |
|------|-------|-------------|
| Left | `teeSheet`, `starterSheet`, `courseStatus` | Course management |
| Center | `playerSearch`, `bookingDetails`, `cartStatus` | Booking context |
| Right | `checkIn`, `assignCart`, `collectFees` | Transaction actions |

### Recommended Toolbar Items

```typescript
const golfCheckInToolbarItems = [
  // Left Zone - Course Management
  { id: 'teeSheet', label: 'Tee Sheet', icon: 'Calendar' },
  { id: 'starterSheet', label: 'Starter', icon: 'PlayCircle' },
  { id: 'courseStatus', label: 'Course', icon: 'Flag' },
  { id: 'weather', label: 'Weather', icon: 'Cloud' },

  // Center Zone - Booking Context
  { id: 'playerSearch', label: 'Find Player', icon: 'Search' },
  { id: 'memberLookup', label: 'Member', icon: 'UserCheck' },
  { id: 'bookingDetails', label: 'Booking', icon: 'Info' },
  { id: 'cartInventory', label: 'Carts', icon: 'Car' },
  { id: 'caddyAvailability', label: 'Caddies', icon: 'Users' },

  // Right Zone - Actions
  { id: 'checkInPlayer', label: 'Check In', icon: 'LogIn' },
  { id: 'assignCart', label: 'Assign Cart', icon: 'Car' },
  { id: 'assignCaddy', label: 'Assign Caddy', icon: 'User' },
  { id: 'collectFees', label: 'Collect Fees', icon: 'DollarSign' },
  { id: 'sendToStarter', label: 'To Starter', icon: 'Send' },
];
```

### Action Bar Configuration

| Button | Action | Color | Shortcut |
|--------|--------|-------|----------|
| Check In All | `CHECK_IN_GROUP` | success | F1 |
| Check In Player | `CHECK_IN_SINGLE` | success | F2 |
| Assign Cart | `ASSIGN_CART` | primary | F3 |
| Assign Caddy | `ASSIGN_CADDY` | primary | F4 |
| Collect Fees | `COLLECT_FEES` | primary | F5 |
| Charge Member | `CHARGE_TO_MEMBER` | primary | F6 |
| Add Guest | `ADD_GUEST_PLAYER` | neutral | F7 |
| No Show | `MARK_NO_SHOW` | danger | F8 |
| Move Tee Time | `MOVE_TEE_TIME` | warning | F9 |
| Cancel Booking | `CANCEL_BOOKING` | danger | F10 |
| Print Ticket | `PRINT_TEE_TICKET` | neutral | F11 |
| Send to Starter | `SEND_TO_STARTER` | success | F12 |

### Product Panel Configuration

| Setting | Recommended Value |
|---------|-------------------|
| Grid Columns | 4 |
| Grid Rows | 3 |
| Tile Size | Large |
| Show Images | No |
| Show Prices | Yes |
| Category Style | Tabs |
| Quick Keys | Enabled (8 items) |

### Quick Key Suggestions

```typescript
const golfCheckInQuickKeys = [
  { id: 'greenFee18', label: '18 Holes', price: 'varies' },
  { id: 'greenFee9', label: '9 Holes', price: 'varies' },
  { id: 'cartRental', label: 'Cart', price: 'varies' },
  { id: 'caddyFee', label: 'Caddy', price: 'varies' },
  { id: 'guestFee', label: 'Guest Fee', price: 'varies' },
  { id: 'rangeBalls', label: 'Range Balls', price: 'fixed' },
  { id: 'clubRental', label: 'Club Rental', price: 'fixed' },
  { id: 'locker', label: 'Locker', price: 'fixed' },
];
```

### Unique Features

- **Tee sheet integration**: Direct access to tee sheet, click-to-check-in
- **Starter sheet**: Real-time view of groups at starter, tee-off status
- **Auto-populate fees**: Calculate fees based on member type, time, day
- **Cart assignment**: Assign specific cart numbers, track returns
- **Caddy assignment**: Match caddies to players, track preferences
- **Group check-in**: Check in entire foursome at once
- **Guest tracking**: Capture guest info, member sponsorship
- **Handicap verification**: Display/verify player handicaps
- **Course pace tracking**: Monitor round times, delays
- **Weather alerts**: Display conditions, lightning warnings

### Check-in Status

| Status | Color | Description |
|--------|-------|-------------|
| Expected | Blue | Booking confirmed, not arrived |
| Checked In | Green | Player arrived, fees pending |
| Paid | Purple | Fees collected |
| At Starter | Orange | Ready to tee off |
| On Course | Teal | Currently playing |
| Finished | Gray | Round complete |
| No Show | Red | Did not arrive |

### Starter Sheet View

```
┌─────────────────────────────────────────────────────────────┐
│ STARTER SHEET - Hole #1                    10:00 AM         │
├─────────────────────────────────────────────────────────────┤
│ 10:00  Smith, J (M) ✓   Johnson, B (M) ✓   Guest 1 ✓  [TEE] │
│        Cart #12         Cart #12           w/Smith          │
│                                                             │
│ 10:08  Williams, T (M) ✓  Brown, K (G) ⏳   Davis, L (M) ✓   │
│        Cart #14           Awaiting payment  Cart #15        │
│                                                             │
│ 10:16  [Available - 4 spots]                                │
└─────────────────────────────────────────────────────────────┘

Legend: (M) Member  (G) Guest  (D) Dependent
        ✓ Checked in  ⏳ Pending  [TEE] On tee
```

---

## 9. Packages & Session-Based Services

This section covers the configuration for selling and redeeming packages, lessons, courses, and session-based services across all outlet types.

---

### 9.1 Package Types Overview

| Package Type | Description | Typical Outlets | Examples |
|--------------|-------------|-----------------|----------|
| **Lesson Package** | Multiple individual lessons with a pro/instructor | Golf, Tennis, Fitness | 5 Golf Lessons, 10 Tennis Sessions |
| **Course Package** | Structured multi-session program | Golf, Fitness, Spa | Golf Academy 8-Week Course, Yoga Teacher Training |
| **Trainer Sessions** | Personal training sessions | Fitness, Sports | 10 PT Sessions, 20 Session Pack |
| **Spa Package** | Bundled treatments (same visit or multiple visits) | Spa | Relaxation Package, Bridal Package |
| **Class Pass** | Access to group classes | Fitness, Yoga, Pilates | 10-Class Pass, Monthly Unlimited |
| **Facility Pass** | Time-based access passes | Sports, Pool, Gym | 10 Court Hours, Pool Day Pass Pack |
| **Junior Program** | Youth training programs | Golf, Tennis, Swimming | Junior Golf Academy, Swim School Term |
| **Corporate Package** | Bulk sessions for corporate clients | All | Corporate Golf Day, Team Building Package |

---

### 9.2 Data Model for Packages

```typescript
interface ServicePackage {
  id: string;
  clubId: string;

  // Basic Info
  name: string;                    // "5 Golf Lessons with Pro"
  description: string;
  category: PackageCategory;       // LESSON | COURSE | TRAINER | SPA | CLASS | FACILITY
  outletTypes: string[];           // Which outlets can sell this

  // Session Configuration
  totalSessions: number;           // 5 lessons
  sessionDuration: number;         // 60 minutes per session
  sessionType: SessionType;        // INDIVIDUAL | GROUP | SELF_SERVICE

  // Validity
  validityDays: number;            // 90 days from purchase
  validityType: ValidityType;      // FROM_PURCHASE | FROM_FIRST_USE | FIXED_DATE
  expiryDate?: Date;               // For fixed date validity

  // Pricing
  basePrice: number;
  memberPrice?: number;            // Discounted member price
  tierPricing?: {                  // Different prices per tier
    [tierId: string]: number;
  };

  // Scheduling
  requiresBooking: boolean;        // Must book in advance
  advanceBookingDays: number;      // How far ahead can book
  cancellationHours: number;       // Minimum notice to cancel

  // Restrictions
  transferable: boolean;           // Can transfer to dependent/guest
  shareable: boolean;              // Can share sessions with others
  refundable: boolean;             // Can get refund for unused
  blackoutDates?: Date[];          // Not valid on these dates
  validDays?: number[];            // Only valid on certain days (1-7)
  validTimeStart?: string;         // "06:00"
  validTimeEnd?: string;           // "18:00"

  // Assignment
  assignedProfessional?: string;   // Specific pro/trainer
  assignedProfessionalType?: string; // Any pro of this type

  // Status
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum PackageCategory {
  LESSON = 'LESSON',           // Golf/Tennis/Swim lessons
  COURSE = 'COURSE',           // Multi-week structured program
  TRAINER = 'TRAINER',         // Personal training
  SPA = 'SPA',                 // Spa treatment packages
  CLASS = 'CLASS',             // Group fitness classes
  FACILITY = 'FACILITY',       // Court/pool/gym time
  PROGRAM = 'PROGRAM',         // Junior/adult programs
}

enum SessionType {
  INDIVIDUAL = 'INDIVIDUAL',   // One-on-one with instructor
  GROUP = 'GROUP',             // Group session
  SELF_SERVICE = 'SELF_SERVICE', // No instructor needed
}

enum ValidityType {
  FROM_PURCHASE = 'FROM_PURCHASE',     // 90 days from buy date
  FROM_FIRST_USE = 'FROM_FIRST_USE',   // 90 days from first session
  FIXED_DATE = 'FIXED_DATE',           // Expires on specific date
  TERM_BASED = 'TERM_BASED',           // School term/season
}
```

---

### 9.3 Member Package Tracking

```typescript
interface MemberPackage {
  id: string;
  memberId: string;
  packageId: string;

  // Purchase Info
  purchaseDate: Date;
  purchasePrice: number;
  purchasedAt: string;           // Outlet where purchased
  purchasedBy: string;           // Staff who sold it

  // Usage Tracking
  totalSessions: number;
  usedSessions: number;
  remainingSessions: number;

  // Session History
  sessions: PackageSession[];

  // Validity
  activatedDate?: Date;          // When first used
  expiryDate: Date;

  // Status
  status: PackageStatus;

  // Extensions/Modifications
  extensions: PackageExtension[];
  notes: string;
}

interface PackageSession {
  id: string;
  sessionNumber: number;         // 3 of 5
  date: Date;
  time: string;
  duration: number;

  // Provider
  professionalId?: string;
  professionalName?: string;

  // Location
  outletId: string;
  facilityId?: string;           // Court, room, etc.

  // Status
  status: SessionStatus;
  bookedAt?: Date;
  checkedInAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;

  // Notes
  notes?: string;
  rating?: number;               // Member feedback
}

enum PackageStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  EXHAUSTED = 'EXHAUSTED',       // All sessions used
  SUSPENDED = 'SUSPENDED',
  REFUNDED = 'REFUNDED',
}

enum SessionStatus {
  AVAILABLE = 'AVAILABLE',       // Not yet booked
  BOOKED = 'BOOKED',
  CHECKED_IN = 'CHECKED_IN',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  CANCELLED = 'CANCELLED',
  FORFEITED = 'FORFEITED',       // Expired without use
}
```

---

### 9.4 Golf Lesson Packages

**Outlet Types:** `GOLF_PRO_SHOP`, `GOLF_TEE_SHEET`

#### Package Examples

| Package | Sessions | Duration | Validity | Price |
|---------|----------|----------|----------|-------|
| Single Lesson | 1 | 45 min | 30 days | ฿2,500 |
| 5-Lesson Pack | 5 | 45 min | 90 days | ฿10,000 |
| 10-Lesson Pack | 10 | 45 min | 180 days | ฿18,000 |
| Junior Academy Term | 12 | 90 min | Term | ฿15,000 |
| Playing Lesson (9 holes) | 1 | 2.5 hrs | 30 days | ฿5,000 |
| Golf School Weekend | 4 | 3 hrs | 2 days | ฿12,000 |
| Club Fitting Session | 1 | 60 min | 30 days | ฿3,000 |

#### Toolbar Items

```typescript
const golfLessonToolbarItems = [
  { id: 'proSchedule', label: 'Pro Schedule', icon: 'Calendar' },
  { id: 'lessonBooking', label: 'Book Lesson', icon: 'CalendarPlus' },
  { id: 'memberPackages', label: 'Member Packages', icon: 'Package' },
  { id: 'redeemSession', label: 'Redeem Session', icon: 'CheckCircle' },
  { id: 'sellPackage', label: 'Sell Package', icon: 'ShoppingCart' },
];
```

#### Action Bar Buttons

| Button | Action | Color | Description |
|--------|--------|-------|-------------|
| Book Lesson | `BOOK_LESSON` | primary | Schedule a lesson from package |
| Redeem Session | `REDEEM_SESSION` | success | Use a session from package |
| Sell Package | `SELL_PACKAGE` | success | Sell new lesson package |
| View Packages | `VIEW_MEMBER_PACKAGES` | neutral | See member's packages |
| Cancel Lesson | `CANCEL_LESSON` | danger | Cancel booked lesson |
| Reschedule | `RESCHEDULE_LESSON` | warning | Move lesson to new time |
| Mark Complete | `COMPLETE_SESSION` | success | Mark lesson as done |
| Mark No-Show | `MARK_NO_SHOW` | danger | Member didn't attend |
| Extend Package | `EXTEND_PACKAGE` | warning | Add validity time |
| Add Sessions | `ADD_SESSIONS` | primary | Add more sessions |
| Transfer Session | `TRANSFER_SESSION` | neutral | Move to dependent |
| Refund Package | `REFUND_PACKAGE` | danger | Process refund |

---

### 9.5 Personal Trainer Sessions

**Outlet Types:** `SPORTS_FACILITY`, `FITNESS_CENTER`

#### Package Examples

| Package | Sessions | Duration | Validity | Includes |
|---------|----------|----------|----------|----------|
| Single PT Session | 1 | 60 min | 14 days | Assessment |
| 10-Session Pack | 10 | 60 min | 120 days | Initial assessment |
| 20-Session Pack | 20 | 60 min | 180 days | Monthly reassessment |
| Couples Training (10) | 10 | 60 min | 120 days | 2 people per session |
| Small Group (4 people) | 8 | 60 min | 60 days | 4 participants max |
| Body Transformation | 24 | 60 min | 90 days | Nutrition plan included |
| Senior Fitness Program | 12 | 45 min | 90 days | Low impact focus |

#### Toolbar Items

```typescript
const trainerSessionToolbarItems = [
  { id: 'trainerSchedule', label: 'Trainer Schedule', icon: 'Calendar' },
  { id: 'bookSession', label: 'Book Session', icon: 'CalendarPlus' },
  { id: 'memberPackages', label: 'Packages', icon: 'Package' },
  { id: 'assessmentDue', label: 'Assessments', icon: 'ClipboardCheck' },
  { id: 'clientProgress', label: 'Progress', icon: 'TrendingUp' },
];
```

#### Unique Features

- **Trainer assignment**: Sessions locked to specific trainer or any available
- **Progress tracking**: Body measurements, fitness tests, goals
- **Workout logging**: Record exercises, sets, reps per session
- **Nutrition integration**: Link to meal plans
- **Assessment scheduling**: Auto-schedule periodic assessments
- **Client handoff**: Transfer client to new trainer with history

---

### 9.6 Spa Treatment Packages

**Outlet Types:** `SPA`

#### Package Types

**Single-Visit Packages** (Multiple treatments, one visit):

| Package | Treatments | Duration | Price |
|---------|-----------|----------|-------|
| Relaxation Escape | Massage + Facial | 2 hrs | ฿4,500 |
| Full Day Spa | Massage + Facial + Body Wrap + Mani/Pedi | 5 hrs | ฿12,000 |
| Bridal Package | Full body treatment + Hair + Makeup | 6 hrs | ฿18,000 |
| Couples Retreat | 2× Massage + 2× Facial + Champagne | 3 hrs | ฿9,000 |

**Multi-Visit Packages** (Sessions over time):

| Package | Sessions | Validity | Includes |
|---------|----------|----------|----------|
| Massage Series (5) | 5 | 90 days | 60-min Swedish/Thai |
| Facial Course (6) | 6 | 120 days | Progressive treatment plan |
| Body Sculpting (10) | 10 | 60 days | Slimming treatments |
| Wellness Journey (12) | 12 | 180 days | Mix of treatments |

#### Toolbar Items

```typescript
const spaPackageToolbarItems = [
  { id: 'sellPackage', label: 'Sell Package', icon: 'Gift' },
  { id: 'redeemTreatment', label: 'Redeem', icon: 'CheckCircle' },
  { id: 'packageBalance', label: 'Balance', icon: 'Package' },
  { id: 'bookFromPackage', label: 'Book', icon: 'CalendarPlus' },
  { id: 'giftPackage', label: 'Gift Card', icon: 'Gift' },
  { id: 'upgradePackage', label: 'Upgrade', icon: 'ArrowUp' },
];
```

#### Action Bar Buttons

| Button | Action | Color | Description |
|--------|--------|-------|-------------|
| Sell Package | `SELL_SPA_PACKAGE` | success | New package sale |
| Redeem Treatment | `REDEEM_SPA_TREATMENT` | success | Use package treatment |
| Check Balance | `CHECK_PACKAGE_BALANCE` | neutral | View remaining |
| Book Treatment | `BOOK_FROM_PACKAGE` | primary | Schedule next treatment |
| Upgrade Package | `UPGRADE_PACKAGE` | primary | Add treatments/extend |
| Gift Package | `CREATE_GIFT_PACKAGE` | success | Create gift certificate |
| Transfer | `TRANSFER_PACKAGE` | neutral | Move to another member |
| Extend Validity | `EXTEND_VALIDITY` | warning | Add more time |
| Add Gratuity | `ADD_GRATUITY` | neutral | Tip for therapist |

#### Unique Features

- **Treatment substitution**: Swap equivalent treatments within package
- **Therapist preferences**: Book same therapist for series
- **Product credit**: Include retail credit in package
- **Add-on tracking**: Track add-ons used vs included
- **Gift certificate**: Sell as gift with recipient activation
- **Couple packages**: Track both participants' usage

---

### 9.7 Group Class Passes

**Outlet Types:** `FITNESS_CENTER`, `SPORTS_FACILITY`, `SPA`

#### Pass Types

| Pass Type | Classes | Validity | Restrictions |
|-----------|---------|----------|--------------|
| 10-Class Pass | 10 | 90 days | Any class |
| 20-Class Pass | 20 | 120 days | Any class |
| Monthly Unlimited | Unlimited | 30 days | Any class |
| Yoga Pass (10) | 10 | 60 days | Yoga classes only |
| Premium Pass (10) | 10 | 90 days | Includes specialty classes |
| Off-Peak Pass (20) | 20 | 90 days | Before 4pm only |

#### Toolbar Items

```typescript
const classPassToolbarItems = [
  { id: 'classSchedule', label: 'Class Schedule', icon: 'Calendar' },
  { id: 'bookClass', label: 'Book Class', icon: 'CalendarPlus' },
  { id: 'checkIn', label: 'Class Check-in', icon: 'LogIn' },
  { id: 'memberPasses', label: 'Passes', icon: 'Ticket' },
  { id: 'sellPass', label: 'Sell Pass', icon: 'ShoppingCart' },
  { id: 'waitlist', label: 'Waitlist', icon: 'Clock' },
];
```

#### Unique Features

- **Class categories**: Different passes for different class types
- **Waitlist management**: Auto-book when spot opens
- **Late cancel penalty**: Deduct extra class for late cancellation
- **Freeze option**: Pause pass validity (vacation)
- **Attendance tracking**: Track which classes member attends
- **Capacity management**: Real-time class availability

---

### 9.8 Course/Program Packages

**Outlet Types:** All (varies by program type)

#### Program Examples

| Program | Sessions | Duration | Schedule | Price |
|---------|----------|----------|----------|-------|
| Golf Academy Beginner | 8 weeks | 2 hrs/wk | Sat 9am | ฿16,000 |
| Junior Tennis Camp | 5 days | 4 hrs/day | Mon-Fri | ฿8,000 |
| Adult Swim Lessons | 10 | 45 min | Flex | ฿5,000 |
| Yoga Teacher Training | 200 hrs | 4 weeks | Full day | ฿80,000 |
| Triathlon Training | 12 weeks | 3 sessions/wk | Scheduled | ฿24,000 |
| Kids Summer Camp | 4 weeks | Full day | Daily | ฿40,000 |

#### Toolbar Items

```typescript
const programToolbarItems = [
  { id: 'programCalendar', label: 'Program Calendar', icon: 'Calendar' },
  { id: 'enrollment', label: 'Enroll', icon: 'UserPlus' },
  { id: 'attendance', label: 'Attendance', icon: 'ClipboardCheck' },
  { id: 'participants', label: 'Participants', icon: 'Users' },
  { id: 'progress', label: 'Progress', icon: 'TrendingUp' },
  { id: 'certificate', label: 'Certificate', icon: 'Award' },
];
```

#### Unique Features

- **Fixed schedule**: Pre-set dates/times for all sessions
- **Attendance tracking**: Mark attendance per session
- **Progress milestones**: Track skill development
- **Makeup sessions**: Allow missed session makeup
- **Prerequisites**: Require prior course completion
- **Certification**: Issue completion certificates
- **Group management**: Manage cohort together
- **Waitlist for next term**: Queue for future programs

---

### 9.9 POS Actions for Packages

#### Selling Packages

```typescript
const packageSaleActions = [
  {
    id: 'SELL_PACKAGE',
    label: 'Sell Package',
    icon: 'ShoppingCart',
    color: 'success',
    flow: [
      'Select package type',
      'Attach member (required)',
      'Select professional (if applicable)',
      'Apply member discount (auto)',
      'Process payment',
      'Print package card/receipt',
      'Schedule first session (optional)',
    ],
  },
];
```

#### Redeeming Sessions

```typescript
const packageRedemptionActions = [
  {
    id: 'REDEEM_SESSION',
    label: 'Redeem Session',
    icon: 'CheckCircle',
    color: 'success',
    flow: [
      'Lookup member',
      'Select active package',
      'Verify session available',
      'Check-in / Start session',
      'Complete session',
      'Record notes (optional)',
      'Print session slip',
    ],
  },
];
```

#### Package Management

```typescript
const packageManagementActions = [
  { id: 'VIEW_PACKAGES', label: 'View Member Packages', icon: 'Package' },
  { id: 'EXTEND_VALIDITY', label: 'Extend Validity', icon: 'Clock', requiresApproval: true },
  { id: 'ADD_SESSIONS', label: 'Add Sessions', icon: 'Plus', requiresApproval: true },
  { id: 'TRANSFER_PACKAGE', label: 'Transfer to Dependent', icon: 'ArrowRight' },
  { id: 'FREEZE_PACKAGE', label: 'Freeze Package', icon: 'Pause', requiresApproval: true },
  { id: 'UNFREEZE_PACKAGE', label: 'Unfreeze Package', icon: 'Play' },
  { id: 'REFUND_PACKAGE', label: 'Refund Package', icon: 'RotateCcw', requiresApproval: true },
  { id: 'CANCEL_PACKAGE', label: 'Cancel Package', icon: 'X', requiresApproval: true },
];
```

---

### 9.10 Package Display Panel

For outlets that sell/redeem packages, add a Package Panel component:

```typescript
interface PackagePanelProps {
  memberId: string;

  // Display Options
  showActiveOnly: boolean;        // Hide expired/exhausted
  showSessionHistory: boolean;    // Show past sessions
  groupByCategory: boolean;       // Group by package type

  // Actions
  onBookSession: (packageId: string) => void;
  onRedeemSession: (packageId: string) => void;
  onViewDetails: (packageId: string) => void;
  onExtend: (packageId: string) => void;
}
```

#### Package Card Display

```
┌─────────────────────────────────────────────────────────────┐
│ 🏌️ 10-Lesson Pack with Pro                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Sessions:  ████████░░  8/10 remaining                     │
│  Expires:   March 15, 2026 (42 days)                       │
│  Pro:       John Smith                                      │
│                                                             │
│  Next Booked: Feb 10, 2026 @ 10:00 AM                      │
│                                                             │
│  [Book Session]  [Redeem Now]  [View History]              │
└─────────────────────────────────────────────────────────────┘
```

---

### 9.11 Reporting & Analytics

| Report | Description | Metrics |
|--------|-------------|---------|
| Package Sales | Sales by type, period | Revenue, units sold, avg price |
| Redemption Rate | Usage vs purchased | % redeemed, forfeited value |
| Expiring Packages | Packages expiring soon | Count by days to expiry |
| Professional Utilization | Lessons by pro/trainer | Bookings, completions, revenue |
| Package Profitability | Revenue vs cost | Margin by package type |
| Member Package History | Per-member view | All packages, status, usage |

---

---

## 10. Shared Configuration Components

### 9.1 Member Operations (All Outlets)

All outlets that interact with members should include:

```typescript
const memberOperationsItems = [
  { id: 'memberLookup', label: 'Member Lookup', icon: 'Search', zone: 'center' },
  { id: 'attachMember', label: 'Attach Member', icon: 'UserPlus', zone: 'center' },
  { id: 'detachMember', label: 'Detach Member', icon: 'UserMinus', zone: 'center' },
  { id: 'memberInfo', label: 'Member Info', icon: 'Info', zone: 'center' },
  { id: 'chargeToMember', label: 'Charge to Member', icon: 'CreditCard', zone: 'right' },
  { id: 'memberBalance', label: 'View Balance', icon: 'Wallet', zone: 'center' },
];
```

### 9.2 Payment Operations (All Outlets)

```typescript
const paymentOperationsItems = [
  { id: 'processCash', action: 'PROCESS_CASH', color: 'success' },
  { id: 'processCard', action: 'PROCESS_CARD', color: 'primary' },
  { id: 'chargeToMember', action: 'CHARGE_TO_MEMBER', color: 'primary' },
  { id: 'splitPayment', action: 'SPLIT_PAYMENT', color: 'neutral' },
  { id: 'applyDiscount', action: 'APPLY_DISCOUNT', color: 'warning' },
  { id: 'voidTransaction', action: 'VOID_TRANSACTION', color: 'danger' },
  { id: 'refund', action: 'PROCESS_REFUND', color: 'danger' },
  { id: 'openDrawer', action: 'OPEN_DRAWER', color: 'neutral' },
];
```

### 9.3 Manager Operations (Role-Based)

```typescript
const managerOperationsItems = [
  { id: 'managerOverride', action: 'MANAGER_OVERRIDE', requiresApproval: true },
  { id: 'priceOverride', action: 'PRICE_OVERRIDE', requiresApproval: true },
  { id: 'voidTransaction', action: 'VOID_TRANSACTION', requiresApproval: true },
  { id: 'largeDiscount', action: 'APPLY_LARGE_DISCOUNT', requiresApproval: true },
  { id: 'noSale', action: 'NO_SALE', requiresApproval: true },
  { id: 'cashDrop', action: 'CASH_DROP', requiresApproval: false },
  { id: 'closeShift', action: 'CLOSE_SHIFT', requiresApproval: false },
];
```

### 9.4 Receipt/Document Operations

```typescript
const documentOperationsItems = [
  { id: 'printReceipt', action: 'PRINT_RECEIPT', icon: 'Printer' },
  { id: 'emailReceipt', action: 'EMAIL_RECEIPT', icon: 'Mail' },
  { id: 'reprintLast', action: 'REPRINT_LAST', icon: 'RotateCcw' },
  { id: 'giftReceipt', action: 'PRINT_GIFT_RECEIPT', icon: 'Gift' },
  { id: 'duplicateReceipt', action: 'PRINT_DUPLICATE', icon: 'Copy' },
];
```

---

## 11. Implementation Priority Matrix

### Phase 1: Core Functionality (All Outlets)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Member lookup | Critical | Low |
| Charge to member | Critical | Low |
| Basic payment processing | Critical | Medium |
| Receipt printing | Critical | Low |
| Basic discounts | High | Low |

### Phase 2: Outlet-Specific Features

| Outlet Type | Key Features | Priority | Complexity |
|-------------|--------------|----------|------------|
| Golf Check-in | Tee sheet integration, cart assignment | Critical | High |
| Fine Dining | Course firing, table management | Critical | High |
| Pro Shop | Inventory variants, member pricing | High | Medium |
| Spa | Appointment integration, therapist schedule | High | High |
| QSR | KDS integration, speed screen | High | Medium |
| Sports Facility | Court booking, equipment rental | Medium | Medium |
| Membership | Enrollment workflow, tier management | High | Medium |

### Phase 3: Package & Session Management

| Feature | Applicable Outlets | Priority | Complexity |
|---------|-------------------|----------|------------|
| Package data model | All | High | Medium |
| Sell packages | All | High | Low |
| Redeem sessions | All | High | Medium |
| Session booking | Golf, Spa, Sports, Fitness | High | High |
| Package validity tracking | All | High | Medium |
| Trainer/Pro assignment | Golf, Fitness, Sports | Medium | Medium |
| Package extensions | All | Medium | Low |
| Freeze/unfreeze | Fitness, Spa | Medium | Low |
| Transfer to dependent | All | Medium | Low |
| Refund handling | All | Medium | Medium |

### Phase 4: Advanced Features

| Feature | Applicable Outlets | Priority | Complexity |
|---------|-------------------|----------|------------|
| Smart suggestions | All retail | Medium | Medium |
| Loyalty/points | All | Medium | Medium |
| Kitchen display (KDS) | F&B | Medium | High |
| Equipment tracking | Sports, Golf | Medium | Medium |
| Course/program enrollment | Golf, Sports, Fitness | Medium | High |
| Progress tracking | Fitness, Golf lessons | Low | Medium |
| Certification/completion | Programs | Low | Low |
| Package analytics | All | Low | Medium |

---

## Sources

This document incorporates industry research from:

- [Lightspeed Golf](https://www.lightspeedhq.com/golf/) - Golf course management and POS
- [Clubessential](https://www.clubessential.com/mobile-pos/) - Country club mobile POS
- [Club Prophet](https://www.clubprophet.com/) - Golf and F&B solutions
- [Toast POS](https://pos.toasttab.com/restaurant-pos/fine-dining) - Fine dining features
- [SpotOn](https://www.spoton.com/restaurant-pos/fine-dining/) - Restaurant table management
- [Zenoti](https://www.zenoti.com/thecheckin/pos-system-for-salon-and-spa) - Spa POS systems
- [Mangomint](https://www.mangomint.com/) - Spa management software
- [Square QSR](https://squareup.com/us/en/restaurants/quick-service) - Quick service restaurant
- [Lightspeed QSR](https://www.lightspeedhq.com/pos/restaurant/quick-service-restaurant-pos/) - QSR POS features
- [Upper Hand](https://upperhand.com/sports-facility-booking-system/) - Sports facility booking
- [EZFacility](https://www.ezfacility.com/) - Club management software
- [foreUP Golf](https://www.foreupgolf.com/) - Golf course software
- [Teesnap](https://www.teesnap.com/) - Golf tee sheet and POS
- [GolfNow](https://golf.nbcsportsnext.com/capabilities/capabilities-point-of-sale/) - Golf POS systems
