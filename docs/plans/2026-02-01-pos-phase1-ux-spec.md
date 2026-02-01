# POS Phase 1: Core Foundation - UX Specification

**Date:** 2026-02-01
**Status:** Approved
**Purpose:** Detailed UX flows for Phase 1 POS features

---

## Overview

This document covers the UX flows for all Phase 1 (Core POS Foundation) features:

1. Discounts System
2. Member Credit Limits
3. Member Minimum Spend
4. Sub-Account Charging
5. Cash Drawer Management
6. End-of-Day Settlement
7. Stored Payment Methods

---

## Feature 1: Discounts System

### Discount Types

| Type | Description | Example |
|------|-------------|---------|
| Line item % | Percentage off single item | 10% off polo shirt |
| Line item fixed | Fixed amount off item | ฿50 off green fee |
| Order % | Percentage off entire order | 15% member discount |
| Order fixed | Fixed amount off order | ฿200 off total |
| Member auto-apply | Based on membership tier | Gold = 10% all purchases |

### Data Model

```prisma
model Discount {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  name            String    // "Staff Courtesy", "Member Loyalty"
  code            String?   // Optional promo code
  type            DiscountType  // PERCENTAGE, FIXED_AMOUNT
  value           Decimal   // 10 for 10%, or 50 for ฿50
  scope           DiscountScope // LINE_ITEM, ORDER

  // Conditions
  minOrderAmount  Decimal?  // Minimum order to apply
  maxDiscount     Decimal?  // Cap for percentage discounts
  memberTiers     String[]  // ["GOLD", "PLATINUM"] or empty for all
  outlets         String[]  // ["PROSHOP", "SPA"] or empty for all

  // Validity
  startDate       DateTime?
  endDate         DateTime?
  isActive        Boolean   @default(true)

  // Approval
  requiresApproval Boolean  @default(false)
  approvalThreshold Decimal? // Require approval if discount > this

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum DiscountType {
  PERCENTAGE
  FIXED_AMOUNT
}

enum DiscountScope {
  LINE_ITEM
  ORDER
}

model AppliedDiscount {
  id              String    @id @default(uuid())

  // Can apply to line item OR order
  lineItemId      String?
  lineItem        BookingLineItem? @relation(fields: [lineItemId], references: [id])
  transactionId   String?
  transaction     PaymentTransaction? @relation(fields: [transactionId], references: [id])

  discountId      String?   // Reference to preset discount
  discount        Discount? @relation(fields: [discountId], references: [id])

  type            DiscountType
  value           Decimal   // Actual value applied
  amount          Decimal   // Calculated discount amount
  reason          String    // "Staff courtesy", "Price match", etc.

  // Approval tracking
  requiresApproval Boolean  @default(false)
  approvedBy      String?
  approvedAt      DateTime?

  appliedBy       String
  appliedAt       DateTime  @default(now())
}
```

### UX Flow: Apply Line Item Discount

**Trigger:** Click discount icon [%] on line item

```
┌─────────────────────────────────────────────────────────┐
│ Golf Balls (sleeve)              ฿180 × 2 = ฿360.00    │
│ [−] [2] [+]                         [%] [↔️] [🗑️]      │
└─────────────────────────────────────────────────────────┘
```

**Dialog:**

```
┌─────────────────────────────────────────────────────────┐
│ Apply Discount                                     [X]  │
├─────────────────────────────────────────────────────────┤
│ ○ Percentage    ○ Fixed Amount                          │
│                                                         │
│ Value: [____10___] %                                    │
│                                                         │
│ Reason: [Staff courtesy_______▼]                        │
│   • Staff courtesy                                      │
│   • Member loyalty                                      │
│   • Price match                                         │
│   • Manager discretion                                  │
│   • Damaged item                                        │
│   • Other: [________________]                           │
│                                                         │
│ Preview: ฿360.00 → ฿324.00 (−฿36.00)                   │
│                                                         │
│                          [Cancel]  [Apply Discount]     │
└─────────────────────────────────────────────────────────┘
```

**After Applied:**

```
┌─────────────────────────────────────────────────────────┐
│ Golf Balls (sleeve)              ฿180 × 2 = ฿360.00    │
│   💰 10% off (Staff courtesy)            −฿36.00       │
│ [−] [2] [+]                    Line total: ฿324.00     │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Order-Level Discount

**Location:** Bottom of cart summary

```
┌─────────────────────────────────────────────────────────┐
│ Subtotal                                    ฿1,240.00   │
│ Tax (7%)                                       ฿86.80   │
│ [+ Add Order Discount]                                  │
├─────────────────────────────────────────────────────────┤
│ Total                                       ฿1,326.80   │
└─────────────────────────────────────────────────────────┘
```

**After Applied:**

```
┌─────────────────────────────────────────────────────────┐
│ Subtotal                                    ฿1,240.00   │
│ Discount (15% Member loyalty)                −฿186.00   │
│ Tax (7% on ฿1,054.00)                          ฿73.78   │
│                                      [Edit] [Remove]    │
├─────────────────────────────────────────────────────────┤
│ Total                                       ฿1,127.78   │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Discount Approval

**Trigger:** Discount exceeds 20% or ฿500

```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ Approval Required                               [X]  │
├─────────────────────────────────────────────────────────┤
│ This discount exceeds authorization limits.             │
│                                                         │
│ Discount: 25% (฿330.00)                                 │
│ Your limit: 20% or ฿500                                 │
│                                                         │
│ Manager PIN: [••••____]                                 │
│                                                         │
│                          [Cancel]  [Authorize]          │
└─────────────────────────────────────────────────────────┘
```

---

## Feature 2: Member Credit Limits

### Data Model

```prisma
// Add to Member model
model Member {
  // ... existing fields ...

  creditLimit       Decimal?  @default(0)
  creditLimitEnabled Boolean  @default(false)
  creditAlertThreshold Decimal? @default(80) // Alert at 80%
  creditBlockEnabled Boolean  @default(true) // Block when exceeded
  creditOverrideAllowed Boolean @default(false) // Allow manager override
}

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
}
```

### UX Flow: Member Profile Settings

```
┌─────────────────────────────────────────────────────────┐
│ Credit Settings                                         │
├─────────────────────────────────────────────────────────┤
│ Credit Limit:        ฿ [50,000____]                     │
│ Current Balance:       ฿12,450.00                       │
│ Available Credit:      ฿37,550.00                       │
│                                                         │
│ ☑ Enable credit limit alerts                            │
│ ☑ Block charges when limit exceeded                     │
│ ☐ Allow override with manager approval                  │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: POS - Approaching Limit (>80%)

```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ Credit Limit Warning                                 │
├─────────────────────────────────────────────────────────┤
│ Member: John Smith (#M-1234)                            │
│                                                         │
│ Credit Limit:      ฿50,000.00                           │
│ Current Balance:   ฿38,000.00                           │
│ This Charge:        ฿5,200.00                           │
│ New Balance:       ฿43,200.00 (86% of limit)            │
│                                                         │
│ Available after:    ฿6,800.00                           │
│                                                         │
│                          [Cancel]  [Proceed Anyway]     │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: POS - Limit Exceeded (Block)

```
┌─────────────────────────────────────────────────────────┐
│ 🚫 Credit Limit Exceeded                                │
├─────────────────────────────────────────────────────────┤
│ Member: John Smith (#M-1234)                            │
│                                                         │
│ Credit Limit:      ฿50,000.00                           │
│ Current Balance:   ฿48,000.00                           │
│ This Charge:        ฿5,200.00                           │
│ Would Exceed By:    ฿3,200.00                           │
│                                                         │
│ Options:                                                │
│ ○ Reduce charge amount                                  │
│ ○ Split payment (฿2,000 to account, ฿3,200 card)       │
│ ○ Pay full amount by card                               │
│ ○ Request manager override                              │
│                                                         │
│                              [Cancel]  [Continue]       │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Manager Override

```
┌─────────────────────────────────────────────────────────┐
│ 🔐 Manager Override Required                            │
├─────────────────────────────────────────────────────────┤
│ Charge ฿5,200.00 exceeds credit limit by ฿3,200.00     │
│                                                         │
│ Manager PIN: [••••____]                                 │
│                                                         │
│ Override Reason: [________________________]             │
│                                                         │
│ ☐ Temporarily increase limit to ฿55,000                 │
│                                                         │
│                          [Cancel]  [Authorize]          │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Cart Header Indicator

```
┌─────────────────────────────────────────────────────────┐
│ 👤 John Smith (M-1234)                     [Gold Tier]  │
│    Credit: ฿37,550 available of ฿50,000                 │
│    ████████████░░░░ 75%                                 │
└─────────────────────────────────────────────────────────┘
```

---

## Feature 3: Member Minimum Spend

### Data Model

```prisma
model MemberMinimum {
  id              String    @id @default(uuid())
  memberId        String
  member          Member    @relation(fields: [memberId], references: [id])

  amount          Decimal   // Monthly minimum amount
  period          MinimumPeriod @default(MONTHLY)

  // What counts toward minimum
  includesFB      Boolean   @default(true)
  includesProShop Boolean   @default(true)
  includesSpa     Boolean   @default(false)
  includesSports  Boolean   @default(false)

  // Shortfall handling
  shortfallAction ShortfallAction @default(CHARGE_FULL)
  carryForwardPct Decimal   @default(0) // 0-100%

  // Auto-charge
  autoChargeEnabled Boolean @default(false)
  autoChargeCardId String?

  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum MinimumPeriod {
  MONTHLY
  QUARTERLY
  YEARLY
}

enum ShortfallAction {
  CHARGE_FULL       // Charge entire shortfall
  CARRY_FORWARD     // Carry to next period
  CHARGE_AND_CARRY  // Charge %, carry rest
  WAIVE             // No action
}

model MinimumSpendPeriod {
  id              String    @id @default(uuid())
  memberId        String
  member          Member    @relation(fields: [memberId], references: [id])

  periodStart     DateTime
  periodEnd       DateTime

  requiredAmount  Decimal   // Base minimum
  carriedForward  Decimal   @default(0) // From previous period
  totalRequired   Decimal   // required + carried

  spentAmount     Decimal   @default(0)
  shortfall       Decimal   @default(0)

  // End of period processing
  chargedAmount   Decimal?  // Amount charged for shortfall
  carriedToNext   Decimal?  // Amount carried forward
  processedAt     DateTime?
  processedBy     String?

  status          MinimumStatus @default(ACTIVE)
}

enum MinimumStatus {
  ACTIVE
  MET
  SHORTFALL
  PROCESSED
}
```

### UX Flow: Member Settings

```
┌─────────────────────────────────────────────────────────┐
│ Minimum Spend Requirements                              │
├─────────────────────────────────────────────────────────┤
│ Monthly Minimum:     ฿ [5,000_____]                     │
│ Period:              [Monthly_____▼]                    │
│                                                         │
│ Applies to:                                             │
│ ☑ F&B                                                   │
│ ☑ Pro Shop                                              │
│ ☐ Spa                                                   │
│ ☐ Sports/Courts                                         │
│                                                         │
│ Shortfall Handling:                                     │
│ ○ Charge shortfall at period end                        │
│ ○ Carry forward to next period                          │
│ ● Charge 50%, carry 50%                                 │
│                                                         │
│ Auto-charge card on file: ☑ Enabled                     │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Spending Dashboard

```
┌─────────────────────────────────────────────────────────┐
│ January 2026 Spending                                   │
├─────────────────────────────────────────────────────────┤
│ Monthly Minimum:                           ฿5,000.00    │
│ Carried Forward:                           ฿1,200.00    │
│ Total Required:                            ฿6,200.00    │
│                                                         │
│ Current Spend:         ████████████░░░░    ฿4,850.00    │
│                                            (78%)        │
│                                                         │
│ Remaining:                                 ฿1,350.00    │
│ Days Left:                                 12 days      │
│                                                         │
│ Breakdown:                                              │
│   F&B              ฿2,400.00   ████████░░               │
│   Pro Shop         ฿1,950.00   ██████░░░░               │
│   Golf Fees        ฿  500.00   ██░░░░░░░░  (excluded)   │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: POS Header Indicator

```
┌─────────────────────────────────────────────────────────┐
│ 👤 John Smith (M-1234)                     [Gold Tier]  │
│    Minimum: ฿1,350 remaining of ฿6,200 this month       │
│    ████████████░░░░ 78%              12 days left       │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Month-End Processing

```
┌─────────────────────────────────────────────────────────┐
│ 📅 Month-End Minimum Reconciliation                     │
├─────────────────────────────────────────────────────────┤
│ Period: January 2026                                    │
│ Members with shortfall: 23                              │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Member          Required   Spent    Shortfall       │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ John Smith      ฿6,200    ฿4,850    ฿1,350         │ │
│ │ Jane Doe        ฿5,000    ฿3,200    ฿1,800         │ │
│ │ Bob Wilson      ฿5,000    ฿4,900    ฿  100         │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ [Preview Charges]  [Process All]  [Export Report]       │
└─────────────────────────────────────────────────────────┘
```

---

## Feature 4: Sub-Account Charging

### Data Model

```prisma
model SubAccount {
  id              String    @id @default(uuid())
  primaryMemberId String
  primaryMember   Member    @relation("PrimaryMember", fields: [primaryMemberId], references: [id])

  // Sub-account holder
  name            String
  relationship    SubAccountType
  dateOfBirth     DateTime?

  // Authentication
  pin             String    // Hashed 4-digit PIN

  // Permissions
  dailyLimit      Decimal?
  allowedOutlets  String[]  // ["FB", "PROSHOP", "SPA"]

  // Restrictions
  noAlcohol       Boolean   @default(false)
  noTobacco       Boolean   @default(false)
  requiresPrimaryPresent Boolean @default(false)

  // Validity
  validFrom       DateTime  @default(now())
  validUntil      DateTime?
  isActive        Boolean   @default(true)

  // Tracking
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Usage
  transactions    SubAccountTransaction[]
}

enum SubAccountType {
  SPOUSE
  DEPENDENT
  PARENT
  GUEST_PASS
}

model SubAccountTransaction {
  id              String    @id @default(uuid())
  subAccountId    String
  subAccount      SubAccount @relation(fields: [subAccountId], references: [id])

  transactionId   String
  transaction     PaymentTransaction @relation(fields: [transactionId], references: [id])

  amount          Decimal
  date            DateTime  @default(now())
}
```

### UX Flow: Sub-Account Settings

```
┌─────────────────────────────────────────────────────────┐
│ Authorized Sub-Accounts                     [+ Add New] │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 👤 Sarah Smith (Spouse)                    [Edit]   │ │
│ │    Status: ✅ Active                                │ │
│ │    Daily Limit: ฿10,000                             │ │
│ │    Allowed: F&B, Pro Shop, Spa                      │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 👤 Tommy Smith (Dependent - Age 16)        [Edit]   │ │
│ │    Status: ✅ Active                                │ │
│ │    Daily Limit: ฿2,000                              │ │
│ │    Allowed: F&B only                                │ │
│ │    Restricted: No alcohol                           │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Add Sub-Account

```
┌─────────────────────────────────────────────────────────┐
│ Add Sub-Account                                    [X]  │
├─────────────────────────────────────────────────────────┤
│ Relationship: [Dependent_________▼]                     │
│                                                         │
│ Name: [Tommy Smith___________]                          │
│ Date of Birth: [15/03/2010____]  (Age: 15)             │
│                                                         │
│ Charging PIN: [____] (4 digits)                         │
│ Confirm PIN:  [____]                                    │
│                                                         │
│ ─────────────── Permissions ───────────────             │
│                                                         │
│ Daily Limit: ฿ [2,000_____]                             │
│                                                         │
│ Allowed Outlets:                                        │
│ ☑ F&B                                                   │
│ ☐ Pro Shop                                              │
│ ☐ Spa                                                   │
│ ☐ Sports/Courts                                         │
│                                                         │
│ Restrictions:                                           │
│ ☑ No alcohol purchases                                  │
│ ☐ No tobacco                                            │
│ ☐ Require primary member present                        │
│                                                         │
│ Validity:                                               │
│ ○ Permanent (until revoked)                             │
│ ● Until: [31/12/2026__]                                 │
│                                                         │
│                          [Cancel]  [Save Sub-Account]   │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: POS - Select Sub-Account

```
┌─────────────────────────────────────────────────────────┐
│ Charge to Member Account                           [X]  │
├─────────────────────────────────────────────────────────┤
│ Search: [Smith____________] 🔍                          │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ John Smith (M-1234)              Primary Member     │ │
│ │   └─ Sarah Smith                 Spouse             │ │
│ │   └─ Tommy Smith                 Dependent          │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Who is making this purchase?                            │
│ ○ John Smith (Primary)                                  │
│ ○ Sarah Smith (Spouse)                                  │
│ ● Tommy Smith (Dependent)                               │
│                                                         │
│                              [Cancel]  [Continue]       │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: PIN Verification

```
┌─────────────────────────────────────────────────────────┐
│ Verify Sub-Account                                 [X]  │
├─────────────────────────────────────────────────────────┤
│ Charging as: Tommy Smith                                │
│ To account:  John Smith (M-1234)                        │
│                                                         │
│ Enter Tommy's PIN: [••••]                               │
│                                                         │
│ Amount: ฿850.00                                         │
│ Daily limit remaining: ฿1,450.00                        │
│                                                         │
│                              [Cancel]  [Verify]         │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Restriction Violation

```
┌─────────────────────────────────────────────────────────┐
│ 🚫 Purchase Restricted                                  │
├─────────────────────────────────────────────────────────┤
│ Tommy Smith cannot purchase:                            │
│   • Beer (Chang) - Alcohol restricted                   │
│                                                         │
│ Options:                                                │
│ ○ Remove restricted items                               │
│ ○ Primary member authorization                          │
│                                                         │
│ Primary Member PIN: [____]                              │
│                                                         │
│                              [Cancel]  [Authorize]      │
└─────────────────────────────────────────────────────────┘
```

---

## Feature 5: Cash Drawer Management

### Data Model

```prisma
model CashDrawer {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  name            String    // "Pro Shop Register #1"
  terminalId      String?
  location        String?

  expectedFloat   Decimal   @default(5000)

  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())

  shifts          CashDrawerShift[]
}

model CashDrawerShift {
  id              String    @id @default(uuid())
  drawerId        String
  drawer          CashDrawer @relation(fields: [drawerId], references: [id])

  // Staff
  openedBy        String
  closedBy        String?

  // Timing
  openedAt        DateTime  @default(now())
  closedAt        DateTime?

  // Opening
  expectedFloat   Decimal
  openingCount    Decimal
  openingVariance Decimal   @default(0)
  openingNote     String?
  openingApprovedBy String?

  // Closing
  expectedClose   Decimal?  // Calculated
  closingCount    Decimal?
  closingVariance Decimal?
  closingNote     String?
  closingApprovedBy String?

  // Drop
  floatRetained   Decimal?
  dropAmount      Decimal?

  status          ShiftStatus @default(OPEN)

  // Transactions
  cashMovements   CashMovement[]
}

enum ShiftStatus {
  OPEN
  CLOSED
  RECONCILED
}

model CashMovement {
  id              String    @id @default(uuid())
  shiftId         String
  shift           CashDrawerShift @relation(fields: [shiftId], references: [id])

  type            CashMovementType
  amount          Decimal
  reason          String
  reference       String?

  createdBy       String
  createdAt       DateTime  @default(now())

  approvedBy      String?
  approvedAt      DateTime?
}

enum CashMovementType {
  SALE
  REFUND
  PAID_IN
  PAID_OUT
}
```

### UX Flow: Open Drawer

```
┌─────────────────────────────────────────────────────────┐
│ 💵 Open Cash Drawer                                     │
├─────────────────────────────────────────────────────────┤
│ Terminal: Pro Shop Register #1                          │
│ Staff: Somchai P.                                       │
│ Date: 01/02/2026 08:55                                  │
│                                                         │
│ ─────────────── Opening Float ───────────────           │
│                                                         │
│ Expected Float: ฿5,000.00                               │
│                                                         │
│ Count Cash:                                             │
│ ฿1,000 × [__2__] = ฿2,000.00                           │
│ ฿500   × [__4__] = ฿2,000.00                           │
│ ฿100   × [__8__] = ฿  800.00                           │
│ ฿50    × [__2__] = ฿  100.00                           │
│ ฿20    × [__5__] = ฿  100.00                           │
│ ฿10    × [__0__] = ฿    0.00                           │
│ ฿5     × [__0__] = ฿    0.00                           │
│ ฿1     × [__0__] = ฿    0.00                           │
│ ─────────────────────────────────────────────           │
│ Total Counted:                  ฿5,000.00               │
│ Variance:                       ฿    0.00  ✅           │
│                                                         │
│                              [Cancel]  [Open Drawer]    │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Cash Payment

```
┌─────────────────────────────────────────────────────────┐
│ 💵 Cash Payment                                         │
├─────────────────────────────────────────────────────────┤
│ Total Due:                                 ฿1,280.00    │
│                                                         │
│ Amount Tendered: ฿ [1,500_____]                         │
│                                                         │
│ Quick amounts:                                          │
│ [฿1,280] [฿1,300] [฿1,500] [฿2,000]                    │
│                                                         │
│ Change Due:                                ฿  220.00    │
│                                                         │
│                              [Cancel]  [Complete Sale]  │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Paid Out / Paid In

```
┌─────────────────────────────────────────────────────────┐
│ 💵 Cash Movement                                        │
├─────────────────────────────────────────────────────────┤
│ Type:  ○ Paid In (add cash)                             │
│        ● Paid Out (remove cash)                         │
│                                                         │
│ Amount: ฿ [500_______]                                  │
│                                                         │
│ Reason: [Petty cash - supplies___▼]                     │
│                                                         │
│ Reference: [Receipt #452_____]                          │
│                                                         │
│                              [Cancel]  [Record]         │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Close Drawer

```
┌─────────────────────────────────────────────────────────┐
│ 💵 Close Cash Drawer                                    │
├─────────────────────────────────────────────────────────┤
│ Terminal: Pro Shop Register #1                          │
│ Shift: 08:55 - 17:05 (8h 10m)                          │
│                                                         │
│ ─────────────── Shift Summary ───────────────           │
│                                                         │
│ Opening Float:                             ฿5,000.00    │
│ Cash Sales (23 transactions):            +฿12,450.00    │
│ Cash Refunds (1):                          −฿  280.00   │
│ Paid Outs (2):                             −฿  750.00   │
│ ─────────────────────────────────────────────           │
│ Expected in Drawer:                       ฿16,420.00    │
│                                                         │
│ [Count Cash...]                                         │
│                                                         │
│ Total Counted:                            ฿16,420.00    │
│ Variance:                                 ฿     0.00 ✅ │
│                                                         │
│ ─────────────── Next Shift ───────────────              │
│                                                         │
│ Leave as float:    ฿ [5,000_____]                       │
│ Drop to safe:         ฿11,420.00                        │
│                                                         │
│                          [Print Report]  [Close Shift]  │
└─────────────────────────────────────────────────────────┘
```

---

## Feature 6: End-of-Day Settlement

### Data Model

```prisma
model DailySettlement {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  date            DateTime  @db.Date

  // Totals
  totalRevenue    Decimal
  totalTransactions Int

  // By payment method
  cashTotal       Decimal
  cardTotal       Decimal
  accountTotal    Decimal
  otherTotal      Decimal

  // Cash reconciliation
  expectedCash    Decimal
  countedCash     Decimal
  cashVariance    Decimal

  // Tips
  cardTips        Decimal

  // Discounts
  totalDiscounts  Decimal

  // Status
  status          SettlementStatus @default(PENDING)
  closedBy        String?
  closedAt        DateTime?

  // Exceptions
  exceptions      SettlementException[]
}

enum SettlementStatus {
  PENDING       // Registers still open
  READY         // All registers closed
  REVIEWED      // Exceptions acknowledged
  CLOSED        // Day finalized
}

model SettlementException {
  id              String    @id @default(uuid())
  settlementId    String
  settlement      DailySettlement @relation(fields: [settlementId], references: [id])

  type            ExceptionType
  description     String
  amount          Decimal?
  reference       String?   // Transaction ID, etc.

  acknowledgedBy  String?
  acknowledgedAt  DateTime?
  notes           String?
}

enum ExceptionType {
  CASH_VARIANCE
  LARGE_DISCOUNT
  VOIDED_TRANSACTION
  REFUND
  CREDIT_LIMIT_OVERRIDE
}
```

### UX Flow: EOD Dashboard

```
┌─────────────────────────────────────────────────────────┐
│ 📊 End of Day Settlement                    01/02/2026  │
├─────────────────────────────────────────────────────────┤
│ Status: ⏳ 2 of 4 registers closed                      │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Register             Status      Variance    Staff  │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Pro Shop #1          ✅ Closed   ฿0.00      Somchai │ │
│ │ Pro Shop #2          ✅ Closed  −฿50.00     Nisa    │ │
│ │ Golf Check-in        🔴 Open     —          Prem    │ │
│ │ Spa Reception        🔴 Open     —          Mali    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│                    [Remind Open Registers]  [Continue]  │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Revenue Summary

```
┌─────────────────────────────────────────────────────────┐
│ 📊 Daily Revenue Summary                    01/02/2026  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Outlet              Trans    Gross       Net            │
│ ───────────────────────────────────────────────         │
│ Golf Green Fees       45    ฿67,500    ฿63,084          │
│ Golf Cart Rental      38    ฿22,800    ฿21,308          │
│ Pro Shop              67    ฿48,250    ฿45,093          │
│ Spa Services          12    ฿18,600    ฿17,383          │
│ Spa Retail             8    ฿ 4,200    ฿ 3,925          │
│ ───────────────────────────────────────────────         │
│ TOTAL                170   ฿161,350   ฿150,793          │
│                                                         │
│ Discounts Given:                         −฿ 6,420       │
│ Tax Collected:                           +฿10,557       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Payment Summary

```
┌─────────────────────────────────────────────────────────┐
│ 💳 Payment Method Summary                   01/02/2026  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Method              Trans    Amount      Tips           │
│ ───────────────────────────────────────────────         │
│ Cash                  52    ฿ 38,450    ฿    —          │
│ Credit Card           48    ฿ 52,800    ฿2,640          │
│ Member Account        58    ฿ 65,200    ฿    —          │
│ Package Redemption    12    ฿  4,900    ฿    —          │
│ ───────────────────────────────────────────────         │
│ TOTAL                170   ฿161,350    ฿2,640          │
│                                                         │
│ ─────────────── Cash Reconciliation ───────────────     │
│                                                         │
│ Cash Sales:                              ฿38,450        │
│ Cash Refunds:                            −฿   280       │
│ Paid Outs:                               −฿ 1,250       │
│ Net Cash:                                ฿36,920        │
│                                                         │
│ Counted (all drawers):                   ฿36,870        │
│ Variance:                                −฿    50 ⚠️    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Exceptions Review

```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ Exceptions Requiring Review              01/02/2026  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🔴 Cash Variance −฿50.00                            │ │
│ │    Register: Pro Shop #2 | Staff: Nisa             │ │
│ │    Reason: Counting error                          │ │
│ │    [View Shift Report]  [Acknowledge]              │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🟡 Large Discount (25%)                             │ │
│ │    Amount: ฿1,250.00 | Approved by: Manager Lek    │ │
│ │    Reason: VIP member complaint                    │ │
│ │    [View Transaction]  [Acknowledge]               │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│                    [Acknowledge All]  [Generate Report] │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Close Day

```
┌─────────────────────────────────────────────────────────┐
│ ✅ Close Business Day                       01/02/2026  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ All registers closed:                     ✅            │
│ All exceptions acknowledged:              ✅            │
│ Cash deposited to safe:                   ✅            │
│                                                         │
│ ─────────────── Day Summary ───────────────             │
│                                                         │
│ Total Revenue:                           ฿150,793.00    │
│ Total Transactions:                      170            │
│ Cash Variance:                           −฿    50.00    │
│                                                         │
│ Manager: [______________▼]                              │
│ PIN: [••••]                                             │
│                                                         │
│ ☐ Send summary email to management                      │
│ ☐ Print settlement report                               │
│                                                         │
│                              [Cancel]  [Close Day]      │
└─────────────────────────────────────────────────────────┘
```

---

## Feature 7: Stored Payment Methods

### Data Model

```prisma
model StoredPaymentMethod {
  id              String    @id @default(uuid())
  memberId        String
  member          Member    @relation(fields: [memberId], references: [id])

  // Card details (tokenized via Stripe/payment provider)
  stripePaymentMethodId String
  brand           String    // "visa", "mastercard"
  last4           String
  expiryMonth     Int
  expiryYear      Int

  // Settings
  isDefault       Boolean   @default(false)
  nickname        String?   // "Personal Visa"

  // Auto-pay
  useForAutoPay   Boolean   @default(false)

  // Status
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model AutoPaySetting {
  id              String    @id @default(uuid())
  memberId        String    @unique
  member          Member    @relation(fields: [memberId], references: [id])

  // Monthly statement
  autoPayStatement Boolean  @default(false)
  statementCardId String?
  statementDayOfMonth Int?  @default(5)

  // Minimum shortfall
  autoPayMinimum  Boolean   @default(false)
  minimumCardId   String?

  // Checkout
  autoPayCheckout Boolean   @default(false) // Skip payment selection
}

model AutoPayAttempt {
  id              String    @id @default(uuid())
  memberId        String
  member          Member    @relation(fields: [memberId], references: [id])

  type            AutoPayType
  amount          Decimal
  cardId          String

  attemptNumber   Int       @default(1)
  scheduledAt     DateTime
  processedAt     DateTime?

  status          AutoPayStatus
  failureReason   String?

  transactionId   String?   // If successful
}

enum AutoPayType {
  STATEMENT
  MINIMUM_SHORTFALL
}

enum AutoPayStatus {
  PENDING
  SUCCESS
  FAILED
  CANCELLED
}
```

### UX Flow: Payment Methods List

```
┌─────────────────────────────────────────────────────────┐
│ 💳 Payment Methods                          [+ Add New] │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 💳 Visa ****4521                          ⭐ Default │ │
│ │    Expires: 08/2027                                 │ │
│ │    Added: 15/01/2025                                │ │
│ │                              [Set Default] [Remove] │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 💳 Mastercard ****8832                              │ │
│ │    Expires: 03/2026                                 │ │
│ │                              [Set Default] [Remove] │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ─────────────── Auto-Pay Settings ───────────────       │
│                                                         │
│ ☑ Auto-pay monthly statement                            │
│   Card: [Visa ****4521_______▼]                         │
│   Day: [5th of month_________▼]                         │
│                                                         │
│ ☑ Auto-charge minimum spend shortfall                   │
│                                                         │
│ ☐ Auto-pay at checkout (skip payment selection)         │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Add Card

```
┌─────────────────────────────────────────────────────────┐
│ 💳 Add Payment Method                              [X]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Card Number:                                            │
│ [4532 •••• •••• ••••_______________]                   │
│                                                         │
│ Expiry:          CVV:                                   │
│ [08/27___]       [•••__]                               │
│                                                         │
│ Cardholder Name:                                        │
│ [John Smith____________________]                        │
│                                                         │
│ ☐ Set as default payment method                         │
│ ☐ Use for auto-pay                                      │
│                                                         │
│ 🔒 Securely stored via Stripe                           │
│                                                         │
│                              [Cancel]  [Add Card]       │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: POS Checkout with Stored Card

```
┌─────────────────────────────────────────────────────────┐
│ 💳 Payment                                              │
├─────────────────────────────────────────────────────────┤
│ Total Due:                                 ฿2,450.00    │
│                                                         │
│ Member: John Smith (M-1234)                             │
│                                                         │
│ Payment Method:                                         │
│                                                         │
│ ● Charge to Account                                     │
│ ○ Visa ****4521 (default) ⭐                            │
│ ○ Mastercard ****8832                                   │
│ ○ Cash                                                  │
│ ○ Other Card (swipe/tap)                                │
│                                                         │
│                              [Cancel]  [Pay ฿2,450.00]  │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Quick Checkout

For members with auto-pay checkout enabled:

```
┌─────────────────────────────────────────────────────────┐
│ ⚡ Quick Checkout                                       │
├─────────────────────────────────────────────────────────┤
│ Member: John Smith (M-1234)                             │
│ Total: ฿2,450.00                                        │
│                                                         │
│ Pay with: Visa ****4521                                 │
│                                                         │
│      [Pay ฿2,450.00]        [Other Payment Method]      │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Failed Auto-Pay

```
┌─────────────────────────────────────────────────────────┐
│ 🔄 Auto-Pay Failed                          05/02/2026  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Member: Jane Doe (M-2345)                               │
│ Amount: ฿15,200.00                                      │
│ Card: Mastercard ****8832                               │
│ Reason: Card declined - insufficient funds              │
│                                                         │
│ Retry Schedule:                                         │
│   Attempt 1: 05/02 - Failed ❌                          │
│   Attempt 2: 07/02 - Pending                            │
│   Attempt 3: 10/02 - Pending                            │
│                                                         │
│ [Retry Now]  [Use Different Card]  [Mark for Follow-up] │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Expiring Cards Alert

```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ Expiring Payment Methods                             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 12 members have cards expiring in the next 30 days:     │
│                                                         │
│ Member              Card             Expires   Auto-Pay │
│ ─────────────────────────────────────────────────────── │
│ Jane Doe            MC ****8832      03/2026   Yes ⚠️   │
│ Bob Wilson          Visa ****1234    03/2026   No       │
│ Sarah Lee           Visa ****5678    03/2026   Yes ⚠️   │
│                                                         │
│ [Send Reminder Emails]  [Export List]                   │
└─────────────────────────────────────────────────────────┘
```

---

## Summary

| Feature | Priority | Complexity |
|---------|----------|------------|
| 1. Discounts System | Critical | Medium |
| 2. Credit Limits | Critical | Low |
| 3. Minimum Spend | Critical | Medium |
| 4. Sub-Accounts | Medium | Medium |
| 5. Cash Drawer | Critical | Medium |
| 6. EOD Settlement | Critical | High |
| 7. Stored Payments | Medium | Medium |

**Recommended Implementation Order:**
1. Discounts (foundational for all transactions)
2. Credit Limits (simple, high value)
3. Cash Drawer (required for POS operations)
4. EOD Settlement (depends on cash drawer)
5. Minimum Spend (month-end processing)
6. Sub-Accounts (member experience)
7. Stored Payments (convenience, requires payment provider integration)
