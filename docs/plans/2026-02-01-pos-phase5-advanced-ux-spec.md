# POS Phase 5: Advanced Features - UX Specification

**Date:** 2026-02-01
**Status:** Draft
**Purpose:** Detailed UX flows for Phase 5 Advanced Features - Cross-outlet integration and optimization

---

## Overview

This document covers the UX flows for all Phase 5 (Advanced Features):

1. Unified Ledger (Gift cards, credits, loyalty points across all outlets)
2. VIP Member Recognition (Alerts, preferences, special treatment flags)
3. Commission Tracking (Spa therapist/golf pro commissions, payout reports)
4. Barcode Scanning (Product lookup, inventory count, checkout scanning)
5. Advanced Inventory (Stock levels, reorder points, supplier management, receiving)
6. Offline Mode (Transaction queue, sync on reconnect, conflict resolution)

---

## Feature 1: Unified Ledger

### Ledger Types

| Type | Description | Example |
|------|-------------|---------|
| Gift Card | Prepaid balance, transferable | ฿5,000 Gift Card |
| Member Credit | Account credit, refunds | ฿1,200 store credit |
| Loyalty Points | Earn/redeem points | 5,000 points = ฿500 |
| Prepaid Package | Service credits | 10 Golf Round Package |
| Voucher | Promotional one-time use | 20% off spa voucher |

### Data Model

```prisma
model LedgerAccount {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  // Owner - can be member or standalone (gift cards)
  memberId        String?
  member          Member?   @relation(fields: [memberId], references: [id])

  type            LedgerType
  name            String    // "Birthday Gift Card", "Golf Package 2026"
  code            String    @unique  // "GC-A1B2C3D4", "PKG-12345"

  // Value
  originalValue   Decimal   // Initial load amount
  currentBalance  Decimal   // Remaining balance
  currency        String    @default("THB")

  // For loyalty points
  pointsBalance   Int?      @default(0)
  pointsRate      Decimal?  // Points per baht (e.g., 1 point = ฿1)
  redemptionRate  Decimal?  // Baht per point when redeeming (e.g., 10 points = ฿1)

  // Validity
  issueDate       DateTime  @default(now())
  expiryDate      DateTime?
  isActive        Boolean   @default(true)

  // Restrictions
  allowedOutlets  String[]  // Empty = all outlets
  minRedemption   Decimal?  // Minimum amount to redeem
  maxRedemption   Decimal?  // Per transaction limit

  // Transferability
  isTransferable  Boolean   @default(false)
  requiresPin     Boolean   @default(false)
  pin             String?   // Hashed 4-digit PIN

  // Source
  sourceType      LedgerSourceType
  sourceReference String?   // Order ID, promotion ID, etc.
  issuedBy        String?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  transactions    LedgerTransaction[]
}

enum LedgerType {
  GIFT_CARD
  MEMBER_CREDIT
  LOYALTY_POINTS
  PREPAID_PACKAGE
  VOUCHER
}

enum LedgerSourceType {
  PURCHASE         // Bought gift card
  REFUND           // Credit from refund
  PROMOTION        // Promotional credit
  LOYALTY_EARNED   // Points from purchases
  COMPENSATION     // Service recovery
  MANUAL           // Admin adjustment
}

model LedgerTransaction {
  id              String    @id @default(uuid())
  ledgerId        String
  ledger          LedgerAccount @relation(fields: [ledgerId], references: [id])

  type            LedgerTransactionType
  amount          Decimal   // Positive = credit, Negative = debit
  pointsAmount    Int?      // For loyalty points

  balanceBefore   Decimal
  balanceAfter    Decimal

  // Transaction reference
  transactionId   String?   // POS transaction ID
  transaction     PaymentTransaction? @relation(fields: [transactionId], references: [id])

  // Location
  outletId        String?
  outlet          Outlet?   @relation(fields: [outletId], references: [id])

  description     String
  performedBy     String
  performedAt     DateTime  @default(now())
}

enum LedgerTransactionType {
  LOAD           // Add balance
  REDEEM         // Use balance
  REFUND         // Return balance
  EXPIRE         // Balance expired
  TRANSFER_OUT   // Transferred to another card
  TRANSFER_IN    // Received from another card
  ADJUSTMENT     // Manual adjustment
}

model LoyaltyProgram {
  id              String    @id @default(uuid())
  clubId          String    @unique
  club            Club      @relation(fields: [clubId], references: [id])

  name            String    // "Vantage Rewards"
  isActive        Boolean   @default(true)

  // Earning rules
  earnRate        Decimal   // Points per ฿100 spent
  earnRounding    EarnRounding @default(FLOOR)

  // Earning multipliers by tier
  tierMultipliers Json      // {"GOLD": 1.5, "PLATINUM": 2.0}

  // Outlet-specific rates
  outletRates     Json      // {"SPA": 2.0, "PROSHOP": 1.0}

  // Redemption
  redemptionRate  Decimal   // Points needed for ฿1
  minRedemption   Int       // Minimum points to redeem

  // Expiry
  pointsExpiry    Int?      // Months until points expire (null = never)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  tiers           LoyaltyTier[]
}

enum EarnRounding {
  FLOOR
  ROUND
  CEILING
}

model LoyaltyTier {
  id              String    @id @default(uuid())
  programId       String
  program         LoyaltyProgram @relation(fields: [programId], references: [id])

  name            String    // "Silver", "Gold", "Platinum"
  minPoints       Int       // Points needed to reach tier
  maxPoints       Int?      // Upper bound (null for top tier)

  // Benefits
  earnMultiplier  Decimal   @default(1.0)
  birthdayBonus   Int?      // Bonus points on birthday
  welcomePoints   Int?      // Points when reaching tier

  color           String    // For badge display
  icon            String?   // Icon name

  sortOrder       Int       @default(0)
}
```

### UX Flow: Gift Card Purchase

**Trigger:** Select "Gift Cards" from product menu

```
┌─────────────────────────────────────────────────────────┐
│ 🎁 Purchase Gift Card                              [X]  │
├─────────────────────────────────────────────────────────┤
│ Gift Card Type:                                         │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│ │   ฿1,000    │ │   ฿2,500    │ │   ฿5,000    │        │
│ │   Standard  │ │   Premium   │ │   Platinum  │        │
│ └─────────────┘ └─────────────┘ └─────────────┘        │
│                                                         │
│ ○ Custom Amount: ฿ [__________]                         │
│                                                         │
│ ───────────── Recipient Details ─────────────          │
│                                                         │
│ ○ Physical Card (print now)                             │
│ ● Digital Card (email/SMS)                              │
│                                                         │
│ Recipient Name:  [_____________________]                │
│ Email:           [_____________________]                │
│ Phone:           [_____________________]                │
│                                                         │
│ Personal Message (optional):                            │
│ [___________________________________________]           │
│                                                         │
│ ☐ Set PIN protection (4 digits)                         │
│                                                         │
│ Valid Until: ○ 1 Year  ● 2 Years  ○ No Expiry          │
│                                                         │
│                          [Cancel]  [Add to Cart ฿5,000] │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Gift Card / Credit Lookup

**Trigger:** "Check Balance" or scan card

```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Lookup Gift Card / Credit                       [X]  │
├─────────────────────────────────────────────────────────┤
│ Card/Code: [GC-A1B2C3D4________] [Scan 📷]             │
│                                                         │
│ ─────────────── Card Found ───────────────             │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🎁 Birthday Gift Card                               │ │
│ │    Code: GC-A1B2C3D4                                │ │
│ │                                                     │ │
│ │    Original Value:    ฿5,000.00                     │ │
│ │    Current Balance:   ฿3,250.00                     │ │
│ │    ████████████░░░░░░ 65% remaining                 │ │
│ │                                                     │ │
│ │    Issued:    15/01/2026                            │ │
│ │    Expires:   15/01/2028                            │ │
│ │    Status:    ✅ Active                             │ │
│ │                                                     │ │
│ │    Allowed at: All outlets                          │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Recent Transactions:                                    │
│ 28/01  Pro Shop      −฿850.00   Balance: ฿3,250.00    │
│ 20/01  Spa           −฿900.00   Balance: ฿4,100.00    │
│ 15/01  Initial Load  +฿5,000.00 Balance: ฿5,000.00    │
│                                                         │
│          [Print Statement]  [Close]  [Use at Checkout]  │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Redeem at Checkout

**Trigger:** Select "Gift Card/Credit" as payment method

```
┌─────────────────────────────────────────────────────────┐
│ 💳 Payment - Redeem Credit                              │
├─────────────────────────────────────────────────────────┤
│ Order Total:                              ฿2,450.00     │
│                                                         │
│ Member: John Smith (M-1234)                             │
│                                                         │
│ Available Credits:                                      │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ☐ 🎁 Gift Card GC-A1B2C3D4          ฿3,250.00      │ │
│ │      Expires: 15/01/2028                            │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ ☐ 💰 Store Credit (Refund)          ฿  450.00      │ │
│ │      No expiry                                      │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ ☐ ⭐ Loyalty Points (2,500 pts)     ฿  250.00      │ │
│ │      Rate: 10 pts = ฿1                              │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Or enter code: [________________] [Apply]               │
│                                                         │
│ ─────────────── Payment Split ───────────────          │
│                                                         │
│ Gift Card (GC-A1B2):                      ฿2,000.00    │
│ Loyalty Points (2,000 pts):               ฿  200.00    │
│ Remaining to pay:                         ฿  250.00    │
│                                                         │
│                          [Cancel]  [Continue to Pay]    │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Loyalty Points Dashboard (Member View)

```
┌─────────────────────────────────────────────────────────┐
│ ⭐ Vantage Rewards                                      │
├─────────────────────────────────────────────────────────┤
│ Welcome back, John Smith!                               │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │     🏆 GOLD MEMBER                                  │ │
│ │                                                     │ │
│ │     12,450 Points                                   │ │
│ │     = ฿1,245.00 value                              │ │
│ │                                                     │ │
│ │     ████████████████░░░░ 2,550 pts to Platinum     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Your Benefits:                                          │
│ • 1.5x points on all purchases                          │
│ • Birthday bonus: 500 points                            │
│ • Priority booking                                      │
│                                                         │
│ Recent Activity:                                        │
│ ───────────────────────────────────────────────         │
│ 01/02  Pro Shop          +180 pts     12,450 pts       │
│ 28/01  Spa               +270 pts     12,270 pts       │
│ 25/01  Golf Green Fee    +450 pts     12,000 pts       │
│ 20/01  Redeemed          −500 pts     11,550 pts       │
│                                                         │
│ Points Expiring:                                        │
│ ⚠️ 1,200 points expire on 31/03/2026                   │
│                                                         │
│               [View Full History]  [Redeem Points]      │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Issue Member Credit (Refund/Compensation)

**Trigger:** Process refund or service recovery

```
┌─────────────────────────────────────────────────────────┐
│ 💰 Issue Member Credit                             [X]  │
├─────────────────────────────────────────────────────────┤
│ Member: John Smith (M-1234)                             │
│                                                         │
│ Credit Type:                                            │
│ ○ Refund (from transaction)                             │
│ ● Service Recovery / Compensation                       │
│ ○ Promotional Credit                                    │
│                                                         │
│ Amount: ฿ [1,500______]                                 │
│                                                         │
│ Reason: [Service complaint - delayed tee time__▼]      │
│                                                         │
│ Details:                                                │
│ [Member waited 45 minutes past booked tee time         │
│  due to tournament overrun. Compensation approved      │
│  by Golf Director.____________________________________] │
│                                                         │
│ Approved By: [Manager Lek________▼]                     │
│ Manager PIN: [••••]                                     │
│                                                         │
│ Validity:                                               │
│ ○ No expiry                                             │
│ ● Expires after: [6 months___▼]                         │
│                                                         │
│ Restrictions:                                           │
│ ☐ Specific outlet only: [____________▼]                 │
│                                                         │
│                          [Cancel]  [Issue ฿1,500.00]    │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Loyalty Program Admin

```
┌─────────────────────────────────────────────────────────┐
│ ⚙️ Loyalty Program Settings                             │
├─────────────────────────────────────────────────────────┤
│ Program: Vantage Rewards                 [✅ Active]    │
│                                                         │
│ ─────────────── Earning Rules ───────────────          │
│                                                         │
│ Base Rate: [1____] point per ฿ [100___] spent          │
│                                                         │
│ Tier Multipliers:                                       │
│   Silver:    1.0x                                       │
│   Gold:      1.5x                                       │
│   Platinum:  2.0x                                       │
│                                                         │
│ Outlet Bonuses:                                         │
│   Spa:       2.0x points                                │
│   Pro Shop:  1.0x points                                │
│   F&B:       1.5x points                                │
│                                                         │
│ ─────────────── Redemption ───────────────             │
│                                                         │
│ Redemption Rate: [10___] points = ฿1                    │
│ Minimum Redemption: [500__] points                      │
│                                                         │
│ ─────────────── Expiry ───────────────                 │
│                                                         │
│ Points Expire: [24___] months after earning             │
│ ☐ Send reminder 30 days before expiry                   │
│                                                         │
│                          [Cancel]  [Save Settings]      │
└─────────────────────────────────────────────────────────┘
```

---

## Feature 2: VIP Member Recognition

### VIP Types

| Type | Description | Example |
|------|-------------|---------|
| Tier-Based | Automatic from membership tier | Platinum member |
| Spend-Based | Lifetime or annual spend threshold | ฿500K+ lifetime |
| Manual | Designated by management | Board member, celebrity |
| Special Date | Birthday, anniversary | Member's birthday today |

### Data Model

```prisma
model MemberVIPProfile {
  id              String    @id @default(uuid())
  memberId        String    @unique
  member          Member    @relation(fields: [memberId], references: [id])

  // VIP Status
  vipLevel        VIPLevel  @default(NONE)
  vipReason       String?   // "Board Member", "Top Spender"
  vipSince        DateTime?
  isManualVIP     Boolean   @default(false)

  // Recognition
  displayAlert    Boolean   @default(true)
  alertPriority   AlertPriority @default(NORMAL)

  // Photo for recognition
  photoUrl        String?
  photoUpdatedAt  DateTime?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  preferences     MemberPreference[]
  specialFlags    MemberSpecialFlag[]
  notes           MemberVIPNote[]
}

enum VIPLevel {
  NONE
  SILVER
  GOLD
  PLATINUM
  DIAMOND
}

enum AlertPriority {
  LOW       // Info only
  NORMAL    // Standard popup
  HIGH      // Prominent alert
  CRITICAL  // Cannot dismiss without action
}

model MemberPreference {
  id              String    @id @default(uuid())
  vipProfileId    String
  vipProfile      MemberVIPProfile @relation(fields: [vipProfileId], references: [id])

  category        PreferenceCategory
  preference      String    // The actual preference text
  importance      PreferenceImportance @default(PREFERRED)

  // Context
  outlet          String?   // Specific outlet, or null for all
  notes           String?

  isActive        Boolean   @default(true)
  createdBy       String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum PreferenceCategory {
  GOLF_TEE_TIME     // Morning, afternoon preferences
  GOLF_CADDY        // Preferred caddy
  GOLF_CART         // Cart preferences
  GOLF_LOCKER       // Preferred locker number
  SPA_THERAPIST     // Preferred therapist
  SPA_ROOM          // Room preferences
  SPA_TREATMENT     // Treatment preferences
  FB_TABLE          // Preferred table/section
  FB_DIETARY        // Dietary restrictions
  FB_BEVERAGE       // Drink preferences
  COMMUNICATION     // Contact preferences
  GENERAL           // Other preferences
}

enum PreferenceImportance {
  REQUIRED          // Must be honored
  PREFERRED         // Try to honor
  NICE_TO_HAVE      // If available
}

model MemberSpecialFlag {
  id              String    @id @default(uuid())
  vipProfileId    String
  vipProfile      MemberVIPProfile @relation(fields: [vipProfileId], references: [id])

  type            SpecialFlagType
  description     String
  severity        FlagSeverity @default(INFO)

  // Display
  showOnPOS       Boolean   @default(true)
  showOnBooking   Boolean   @default(true)
  showOnCheckin   Boolean   @default(true)

  // Validity
  expiresAt       DateTime?
  isActive        Boolean   @default(true)

  createdBy       String
  createdAt       DateTime  @default(now())
}

enum SpecialFlagType {
  MEDICAL           // Allergies, conditions
  DIETARY           // Food restrictions
  ACCESSIBILITY     // Mobility needs
  BEHAVIORAL        // Service notes
  PAYMENT           // Payment issues
  LEGAL             // Legal matters
  POSITIVE          // Compliments, achievements
}

enum FlagSeverity {
  INFO              // Blue - informational
  WARNING           // Yellow - attention needed
  CRITICAL          // Red - must acknowledge
}

model MemberVIPNote {
  id              String    @id @default(uuid())
  vipProfileId    String
  vipProfile      MemberVIPProfile @relation(fields: [vipProfileId], references: [id])

  note            String
  category        String?   // "Service", "Personal", "Business"

  isPinned        Boolean   @default(false)
  isPrivate       Boolean   @default(false) // Only visible to managers

  createdBy       String
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model MemberRecognitionLog {
  id              String    @id @default(uuid())
  memberId        String
  member          Member    @relation(fields: [memberId], references: [id])

  // When/where recognized
  outlet          String
  terminal        String?
  recognizedBy    String
  recognizedAt    DateTime  @default(now())

  // What triggered
  triggerType     RecognitionTrigger
  alertShown      Boolean
  alertDismissed  Boolean   @default(false)
  profileViewed   Boolean   @default(false)

  // Actions taken
  actionsNoted    String?   // "Offered locker #42, declined"
}

enum RecognitionTrigger {
  MEMBER_LOOKUP
  BOOKING_CHECKIN
  POS_TRANSACTION
  MANUAL_SEARCH
}
```

### UX Flow: VIP Alert on Member Lookup

**Trigger:** Member selected at POS or check-in

```
┌─────────────────────────────────────────────────────────┐
│ 🌟 VIP Member Alert                                     │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │  [Photo]   John Smith (M-1234)                      │ │
│ │            💎 PLATINUM VIP                          │ │
│ │            Member since 2018                        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ⚠️ Flags:                                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🔴 ALLERGY: Shellfish - severe reaction             │ │
│ │ 🟡 Prefers not to be seated near kitchen            │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Preferences:                                            │
│ • Golf: Morning tee times (before 8am)                  │
│ • Golf: Always offer locker #42                         │
│ • Golf: Preferred caddy - Somchai (ID: C-012)          │
│ • F&B: Preferred table - Terrace #5                    │
│ • Spa: Prefers female therapists                        │
│                                                         │
│ 📝 Notes:                                               │
│ "Board member's business partner. Always greet by       │
│  name. Wife's name is Sarah."                           │
│                                                         │
│ Last Visit: 3 days ago (Golf + Lunch)                   │
│ Lifetime Spend: ฿2,450,000                              │
│ YTD Spend: ฿285,000                                     │
│                                                         │
│                   [Dismiss]  [View Full Profile]        │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: VIP Alert - Critical Flag

**Trigger:** Member with critical flag selected

```
┌─────────────────────────────────────────────────────────┐
│ 🚨 CRITICAL ALERT - Action Required                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Member: Sarah Thompson (M-2345)                         │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ⚠️ MEDICAL ALERT                                    │ │
│ │                                                     │ │
│ │ SEVERE NUT ALLERGY                                  │ │
│ │ Carries EpiPen - location in golf bag              │ │
│ │                                                     │ │
│ │ Emergency Contact: Dr. James Thompson              │ │
│ │ Phone: 081-234-5678                                │ │
│ │                                                     │ │
│ │ ☐ I have read and acknowledged this alert          │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ This alert requires acknowledgment before proceeding.   │
│                                                         │
│                              [Acknowledge and Continue] │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: VIP Profile Management

```
┌─────────────────────────────────────────────────────────┐
│ 👤 VIP Profile: John Smith                         [X]  │
├─────────────────────────────────────────────────────────┤
│ [Photo 📷]                                              │
│                                                         │
│ VIP Status: 💎 Platinum                                 │
│ ○ Automatic (based on tier)                             │
│ ● Manual override                                       │
│   Reason: [Board member's partner____]                  │
│                                                         │
│ Alert Settings:                                         │
│ ☑ Show VIP alert on POS                                 │
│ ☑ Show VIP alert on booking/check-in                    │
│ Priority: [Normal________▼]                             │
│                                                         │
│ ═══════════════════════════════════════════════════════ │
│  Preferences │ Flags │ Notes │ History                  │
│ ═══════════════════════════════════════════════════════ │
│                                                         │
│ Preferences:                                [+ Add New] │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🏌️ Golf - Tee Time         Required               │ │
│ │    "Morning tee times only (before 8am)"           │ │
│ │                                     [Edit] [Delete] │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ 🏌️ Golf - Locker            Preferred              │ │
│ │    "Always offer locker #42"                        │ │
│ │                                     [Edit] [Delete] │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ 🏌️ Golf - Caddy              Preferred              │ │
│ │    "Somchai (C-012) or Prasert (C-015)"            │ │
│ │                                     [Edit] [Delete] │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ 🍽️ F&B - Table                Preferred              │ │
│ │    "Terrace table #5, away from kitchen"            │ │
│ │                                     [Edit] [Delete] │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│                          [Cancel]  [Save Changes]       │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Add Preference

```
┌─────────────────────────────────────────────────────────┐
│ + Add Preference                                   [X]  │
├─────────────────────────────────────────────────────────┤
│ Category: [Golf - Caddy__________▼]                     │
│                                                         │
│ Preference:                                             │
│ [Prefers Somchai (C-012) or Prasert (C-015).           │
│  Always assigns morning rounds when available.______]   │
│                                                         │
│ Importance:                                             │
│ ○ Required (must be honored)                            │
│ ● Preferred (try to honor)                              │
│ ○ Nice to have (if available)                           │
│                                                         │
│ Applies to: ○ All outlets  ● Specific: [Golf____▼]     │
│                                                         │
│ Additional Notes:                                       │
│ [Tips Somchai very well - ฿500 minimum________________] │
│                                                         │
│                          [Cancel]  [Save Preference]    │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Add Special Flag

```
┌─────────────────────────────────────────────────────────┐
│ + Add Special Flag                                 [X]  │
├─────────────────────────────────────────────────────────┤
│ Flag Type: [Medical / Allergy_____▼]                    │
│                                                         │
│ Severity:                                               │
│ ○ Info (informational only)                             │
│ ○ Warning (needs attention)                             │
│ ● Critical (must acknowledge)                           │
│                                                         │
│ Description:                                            │
│ [SEVERE NUT ALLERGY - Carries EpiPen in golf bag.      │
│  Emergency contact: Dr. James Thompson 081-234-5678__] │
│                                                         │
│ Display Settings:                                       │
│ ☑ Show on POS transactions                              │
│ ☑ Show on bookings                                      │
│ ☑ Show at check-in                                      │
│                                                         │
│ Expires: ○ Never  ○ On date: [__/__/____]              │
│                                                         │
│                          [Cancel]  [Add Flag]           │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Birthday/Anniversary Alert

**Trigger:** Member with special date today

```
┌─────────────────────────────────────────────────────────┐
│ 🎂 Special Occasion Today!                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Member: John Smith (M-1234)                             │
│                                                         │
│ 🎉 TODAY IS JOHN'S BIRTHDAY! 🎉                        │
│                                                         │
│ Suggested Actions:                                      │
│ • Wish happy birthday by name                           │
│ • Offer complimentary birthday dessert (F&B)            │
│ • Birthday discount available: 15% off                  │
│                                                         │
│ Loyalty Bonus: +500 birthday points added               │
│                                                         │
│                              [Dismiss]  [Apply Discount]│
└─────────────────────────────────────────────────────────┘
```

### UX Flow: VIP List Dashboard

```
┌─────────────────────────────────────────────────────────┐
│ 👑 VIP Members Dashboard                                │
├─────────────────────────────────────────────────────────┤
│ Search: [________________] [Tier: All ▼] [Flags: All ▼] │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Member            Tier     Last Visit   Flags       │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ John Smith        💎 Plat  3 days ago   🔴 Medical  │ │
│ │ Sarah Thompson    💎 Plat  1 week ago   🔴 Allergy  │ │
│ │ Bob Wilson        🥇 Gold  Today        —           │ │
│ │ Jane Doe          🥇 Gold  2 days ago   🟡 Payment  │ │
│ │ Mike Chen         🥈 Silver Yesterday   —           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Today's Special Occasions:                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 🎂 John Smith - Birthday                            │ │
│ │ 💍 Bob & Mary Wilson - 25th Anniversary             │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│                              [Export List]  [Add VIP]   │
└─────────────────────────────────────────────────────────┘
```

---

## Feature 3: Commission Tracking

### Commission Types

| Type | Description | Example |
|------|-------------|---------|
| Spa Service | Therapist commission on treatments | 15% of service price |
| Product Sale | Staff commission on retail | 5% of product sales |
| Golf Lesson | Pro commission on lessons | 40% of lesson fee |
| Package Sale | Commission on package sales | ฿500 flat per package |
| Referral | Bonus for member referrals | ฿1,000 per referral |

### Data Model

```prisma
model CommissionRule {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  name            String    // "Spa Therapist Standard"
  type            CommissionType
  outlet          String?   // Specific outlet or null for all

  // Rate
  rateType        CommissionRateType
  rate            Decimal   // Percentage or fixed amount

  // Applicability
  staffRoles      String[]  // ["THERAPIST", "GOLF_PRO"]
  productCategories String[] // Product category IDs
  serviceTypes    String[]  // Service type IDs

  // Tier-based rates
  tieredRates     Json?     // {"0-10000": 10, "10001-50000": 12, "50001+": 15}

  // Conditions
  minTransactionAmount Decimal?
  maxCommission   Decimal?  // Cap per transaction

  isActive        Boolean   @default(true)
  validFrom       DateTime  @default(now())
  validUntil      DateTime?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  commissions     Commission[]
}

enum CommissionType {
  SERVICE
  PRODUCT
  PACKAGE_SALE
  REFERRAL
  BONUS
}

enum CommissionRateType {
  PERCENTAGE
  FIXED_AMOUNT
  TIERED
}

model Commission {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  // Staff member earning commission
  staffId         String
  staff           User      @relation(fields: [staffId], references: [id])

  // Rule applied
  ruleId          String?
  rule            CommissionRule? @relation(fields: [ruleId], references: [id])

  // Source
  transactionId   String
  transaction     PaymentTransaction @relation(fields: [transactionId], references: [id])
  lineItemId      String?
  lineItem        BookingLineItem? @relation(fields: [lineItemId], references: [id])

  // Service-specific
  appointmentId   String?   // For spa appointments
  lessonId        String?   // For golf lessons

  // Amounts
  saleAmount      Decimal   // Original sale/service amount
  commissionRate  Decimal   // Rate applied (% or fixed)
  commissionAmount Decimal  // Calculated commission

  // Status
  status          CommissionStatus @default(PENDING)

  // Payout
  payoutId        String?
  payout          CommissionPayout? @relation(fields: [payoutId], references: [id])

  // Tracking
  earnedAt        DateTime  @default(now())
  approvedBy      String?
  approvedAt      DateTime?
  notes           String?
}

enum CommissionStatus {
  PENDING         // Awaiting approval
  APPROVED        // Approved for payout
  PAID            // Included in payout
  VOIDED          // Cancelled (refund, etc.)
  DISPUTED        // Under review
}

model CommissionPayout {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  // Staff member
  staffId         String
  staff           User      @relation(fields: [staffId], references: [id])

  // Period
  periodStart     DateTime
  periodEnd       DateTime

  // Amounts
  grossAmount     Decimal   // Total before deductions
  deductions      Decimal   @default(0)
  netAmount       Decimal   // Amount to pay

  // Status
  status          PayoutStatus @default(DRAFT)

  // Processing
  processedBy     String?
  processedAt     DateTime?
  paymentMethod   String?   // "BANK_TRANSFER", "CASH", "PAYROLL"
  paymentReference String?

  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  commissions     Commission[]
}

enum PayoutStatus {
  DRAFT
  APPROVED
  PROCESSING
  PAID
  CANCELLED
}

model StaffCommissionProfile {
  id              String    @id @default(uuid())
  staffId         String    @unique
  staff           User      @relation(fields: [staffId], references: [id])

  // Default rates (can be overridden by rules)
  defaultServiceRate  Decimal?
  defaultProductRate  Decimal?

  // Bank details for payout
  bankName        String?
  bankAccount     String?
  accountName     String?

  // Tax info
  taxId           String?

  // Targets
  monthlyTarget   Decimal?
  quarterlyTarget Decimal?

  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

### UX Flow: Commission Dashboard (Staff View)

```
┌─────────────────────────────────────────────────────────┐
│ 💰 My Commissions                        February 2026  │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │     This Month                    Target Progress   │ │
│ │                                                     │ │
│ │     ฿12,450                      ████████░░ 83%    │ │
│ │                                  ฿15,000 target     │ │
│ │                                                     │ │
│ │     Pending: ฿2,100    Paid: ฿8,350               │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Recent Commissions:                                     │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Date     Service/Product    Sale     Commission    │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Today    Thai Massage (2h)  ฿2,400   ฿360   ⏳      │ │
│ │ Today    Facial Treatment   ฿1,800   ฿270   ⏳      │ │
│ │ Y'day    Body Scrub         ฿1,200   ฿180   ✅      │ │
│ │ Y'day    Massage Oil (Sale) ฿  450   ฿ 45   ✅      │ │
│ │ 29/01    Aromatherapy       ฿2,000   ฿300   ✅      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Legend: ⏳ Pending  ✅ Approved  💰 Paid               │
│                                                         │
│            [View Full History]  [Download Statement]    │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Commission Attribution (At Checkout)

**Trigger:** Complete service checkout

```
┌─────────────────────────────────────────────────────────┐
│ 💆 Service Checkout                                     │
├─────────────────────────────────────────────────────────┤
│ Guest: Sarah Johnson                                    │
│ Service: Thai Massage - 2 Hours                         │
│                                                         │
│ ─────────────── Commission Attribution ───────────────  │
│                                                         │
│ Therapist: [Natcha P._________▼]                        │
│ Commission Rate: 15%                                    │
│ Commission Amount: ฿360.00                              │
│                                                         │
│ Service Amount:                           ฿2,400.00     │
│ Tax (7%):                                 ฿  168.00     │
│ ─────────────────────────────────────────────           │
│ Total:                                    ฿2,568.00     │
│                                                         │
│                          [Cancel]  [Complete Checkout]  │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Commission Review (Manager)

```
┌─────────────────────────────────────────────────────────┐
│ ✅ Commission Review                   [January 2026]   │
├─────────────────────────────────────────────────────────┤
│ Outlet: [Spa___________▼]  Status: [Pending______▼]    │
│                                                         │
│ Pending Approval: 23 commissions (฿8,450.00)            │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ☐ Staff         Service          Sale    Commission │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ ☐ Natcha P.     Thai Massage     ฿2,400  ฿360.00   │ │
│ │ ☐ Natcha P.     Facial           ฿1,800  ฿270.00   │ │
│ │ ☐ Somchai K.    Deep Tissue      ฿3,000  ฿450.00   │ │
│ │ ☐ Somchai K.    Product Sale     ฿  800  ฿ 80.00   │ │
│ │ ☐ Mali S.       Aromatherapy     ฿2,200  ฿330.00   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ☐ Select All                                            │
│                                                         │
│            [Reject Selected]  [Approve Selected]        │
│                                                         │
│ Bulk Actions:                                           │
│ [Approve All Pending]                                   │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Payout Report

```
┌─────────────────────────────────────────────────────────┐
│ 💵 Commission Payout Report            January 2026     │
├─────────────────────────────────────────────────────────┤
│ Period: 01/01/2026 - 31/01/2026                         │
│ Outlet: All                              [Generate]     │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Staff Member     Services  Products  Total    Stat  │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Natcha P.        ฿4,250    ฿  320   ฿4,570   Ready │ │
│ │ Somchai K.       ฿3,800    ฿  180   ฿3,980   Ready │ │
│ │ Mali S.          ฿3,150    ฿  450   ฿3,600   Ready │ │
│ │ Prasert T.       ฿2,100    ฿    0   ฿2,100   Ready │ │
│ │ ─────────────────────────────────────────────────── │ │
│ │ TOTAL            ฿13,300   ฿  950   ฿14,250        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Payment Method: [Bank Transfer____▼]                    │
│ Process Date:   [05/02/2026______]                      │
│                                                         │
│     [Export to Excel]  [Print Slips]  [Process Payout]  │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Individual Payout Slip

```
┌─────────────────────────────────────────────────────────┐
│ 📄 Commission Payout Slip                               │
├─────────────────────────────────────────────────────────┤
│ Staff: Natcha Prasert                                   │
│ ID: EMP-0142                                            │
│ Period: January 2026                                    │
│                                                         │
│ ─────────────── Earnings ───────────────               │
│                                                         │
│ Services:                                               │
│   Thai Massage (12 sessions)              ฿2,160.00    │
│   Aromatherapy (8 sessions)               ฿1,200.00    │
│   Facial Treatment (6 sessions)           ฿  890.00    │
│   ─────────────────────────────────────────────        │
│   Subtotal Services:                      ฿4,250.00    │
│                                                         │
│ Product Sales:                                          │
│   Massage oils, skincare (5%)             ฿  320.00    │
│   ─────────────────────────────────────────────        │
│   Subtotal Products:                      ฿  320.00    │
│                                                         │
│ ─────────────────────────────────────────────           │
│ GROSS COMMISSION:                         ฿4,570.00    │
│                                                         │
│ Deductions:                                             │
│   Uniform advance                         −฿  500.00   │
│   ─────────────────────────────────────────────        │
│ NET PAYOUT:                               ฿4,070.00    │
│                                                         │
│ Payment: Bank Transfer to Kasikorn ****1234             │
│ Date: 05/02/2026                                        │
│                                                         │
│                              [Print]  [Send to Staff]   │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Commission Rules Setup

```
┌─────────────────────────────────────────────────────────┐
│ ⚙️ Commission Rules                         [+ Add New] │
├─────────────────────────────────────────────────────────┤
│ Outlet: [All___________▼]                               │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Rule Name              Type        Rate    Status   │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Spa Therapist Standard Service     15%     ✅ Active│ │
│ │ Spa Product Sales      Product      5%     ✅ Active│ │
│ │ Golf Pro Lessons       Service     40%     ✅ Active│ │
│ │ Pro Shop Sales         Product     3%      ✅ Active│ │
│ │ Package Sales Bonus    Package    ฿500     ✅ Active│ │
│ │ Member Referral        Referral  ฿1,000    ✅ Active│ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│                                     [Edit]  [Duplicate] │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Add Commission Rule

```
┌─────────────────────────────────────────────────────────┐
│ + New Commission Rule                              [X]  │
├─────────────────────────────────────────────────────────┤
│ Rule Name: [Spa Therapist Standard____]                 │
│                                                         │
│ Type: ● Service  ○ Product  ○ Package  ○ Referral      │
│                                                         │
│ Applies To:                                             │
│ Outlet: [Spa___________▼]                               │
│ Staff Roles: ☑ Therapist  ☐ Manager  ☐ All Staff       │
│ Service Types: ☑ All services                           │
│                                                         │
│ Rate Type:                                              │
│ ● Percentage: [15___] %                                 │
│ ○ Fixed Amount: ฿ [______]                              │
│ ○ Tiered (based on monthly sales)                       │
│                                                         │
│ Conditions:                                             │
│ Minimum transaction: ฿ [____] (optional)                │
│ Maximum commission: ฿ [____] per transaction            │
│                                                         │
│ Validity:                                               │
│ From: [01/02/2026] To: [No end date___]                │
│                                                         │
│                          [Cancel]  [Save Rule]          │
└─────────────────────────────────────────────────────────┘
```

---

## Feature 4: Barcode Scanning

### Scan Types

| Type | Description | Example |
|------|-------------|---------|
| Product Lookup | Scan to view product details | View golf balls info |
| Add to Cart | Scan to add item to POS | Quick checkout |
| Inventory Count | Scan for stocktake | Physical inventory |
| Receiving | Scan to receive shipment | Supplier delivery |
| Member Card | Scan member barcode | Quick member lookup |

### Data Model

```prisma
model ProductBarcode {
  id              String    @id @default(uuid())
  productId       String
  product         Product   @relation(fields: [productId], references: [id])

  barcode         String    @unique  // EAN-13, UPC, etc.
  barcodeType     BarcodeType @default(EAN13)

  // Variant association
  variantId       String?   // If barcode is for specific variant
  variant         ProductVariant? @relation(fields: [variantId], references: [id])

  isPrimary       Boolean   @default(false)
  isActive        Boolean   @default(true)

  createdAt       DateTime  @default(now())
}

enum BarcodeType {
  EAN13
  EAN8
  UPC_A
  UPC_E
  CODE128
  CODE39
  QR_CODE
  CUSTOM
}

model MemberBarcode {
  id              String    @id @default(uuid())
  memberId        String
  member          Member    @relation(fields: [memberId], references: [id])

  barcode         String    @unique
  barcodeType     BarcodeType @default(CODE128)

  // Usage
  useFor          MemberBarcodeUse[]

  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  expiresAt       DateTime?
}

enum MemberBarcodeUse {
  POS_CHECKOUT
  FACILITY_ACCESS
  LOCKER_ROOM
  GOLF_CHECKIN
}

model ScanLog {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  barcode         String
  scanType        ScanType
  scanResult      ScanResult

  // What was found
  productId       String?
  memberId        String?

  // Context
  outlet          String
  terminal        String?
  userId          String

  // Outcome
  actionTaken     String?   // "Added to cart", "Member lookup", etc.

  scannedAt       DateTime  @default(now())
}

enum ScanType {
  PRODUCT_LOOKUP
  ADD_TO_CART
  INVENTORY_COUNT
  RECEIVING
  MEMBER_LOOKUP
  UNKNOWN
}

enum ScanResult {
  SUCCESS
  NOT_FOUND
  INACTIVE
  ERROR
}
```

### UX Flow: Product Scan at POS

**Trigger:** Scan barcode at checkout

```
┌─────────────────────────────────────────────────────────┐
│ 🛒 Pro Shop POS                                         │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📷 Scan barcode or enter manually:                  │ │
│ │ [8851234567890_______] [Search 🔍]                  │ │
│ │                                                     │ │
│ │ 📱 Camera ready... or use USB scanner              │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Cart:                                                   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ✅ Titleist Pro V1 (Dozen)        ฿2,400 × 1       │ │
│ │    Barcode: 8851234567890                          │ │
│ │    [−] [1] [+]                    ฿2,400.00        │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ ✅ Golf Glove - M                  ฿850 × 1        │ │
│ │    Barcode: 8851234567891                          │ │
│ │    [−] [1] [+]                    ฿  850.00        │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Subtotal:                              ฿3,250.00        │
│ Tax (7%):                              ฿  227.50        │
│ Total:                                 ฿3,477.50        │
│                                                         │
│                              [Clear]  [Pay ฿3,477.50]   │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Barcode Not Found

```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ Barcode Not Found                               [X]  │
├─────────────────────────────────────────────────────────┤
│ Scanned: 8859999999999                                  │
│                                                         │
│ This barcode is not registered in the system.           │
│                                                         │
│ Options:                                                │
│                                                         │
│ [Search Products Manually]                              │
│                                                         │
│ [Register New Product with Barcode]                     │
│                                                         │
│ [Add Barcode to Existing Product]                       │
│                                                         │
│                                            [Cancel]     │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Quick Product Lookup

**Trigger:** Scan while not in checkout mode

```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Product Details                                 [X]  │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Product     Titleist Pro V1 Golf Balls            │ │
│ │  Image]      Dozen Pack                            │ │
│ │                                                     │ │
│ │              SKU: TIT-PV1-DZ                       │ │
│ │              Barcode: 8851234567890                │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Price: ฿2,400.00        Category: Golf Balls           │
│ Member Price: ฿2,160.00 (10% off)                       │
│                                                         │
│ ─────────────── Stock Levels ───────────────           │
│                                                         │
│ Location          In Stock    Reserved    Available    │
│ Pro Shop          24          2           22           │
│ Warehouse         48          0           48           │
│ ─────────────────────────────────────────────          │
│ Total             72          2           70           │
│                                                         │
│ Reorder Point: 20    Reorder Qty: 48                   │
│ Status: ✅ Stock OK                                     │
│                                                         │
│        [View History]  [Edit Product]  [Add to Cart]    │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Inventory Count (Stocktake)

```
┌─────────────────────────────────────────────────────────┐
│ 📦 Inventory Count - Pro Shop              01/02/2026   │
├─────────────────────────────────────────────────────────┤
│ Count Session: #INV-2026-015              [⏸️ Pause]   │
│ Category: [All Categories___▼]                          │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📷 Scan barcode to count:                           │ │
│ │ [________________________] [Manual Entry]           │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Items Counted: 45 of 128                                │
│ ████████████░░░░░░░░░░░░ 35%                           │
│                                                         │
│ Recent Scans:                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Product              Expected  Counted   Variance   │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Titleist Pro V1      24        24        ✅ 0       │ │
│ │ Callaway Chrome      18        17        ⚠️ -1      │ │
│ │ TaylorMade TP5       12        12        ✅ 0       │ │
│ │ Golf Glove - S       8         8         ✅ 0       │ │
│ │ Golf Glove - M       15        14        ⚠️ -1      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Variances Found: 2 items (−2 units)                     │
│                                                         │
│              [View All Items]  [Export]  [Complete]     │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Scan Count Entry

```
┌─────────────────────────────────────────────────────────┐
│ 📦 Count Item                                      [X]  │
├─────────────────────────────────────────────────────────┤
│ Product: Callaway Chrome Soft                           │
│ SKU: CAL-CS-DZ                                          │
│ Barcode: 8851234567892                                  │
│                                                         │
│ Location: Pro Shop - Shelf A3                           │
│                                                         │
│ System Quantity: 18                                     │
│                                                         │
│ Counted Quantity: [17___]                               │
│                                                         │
│ Variance: -1 ⚠️                                         │
│                                                         │
│ Note (optional):                                        │
│ [Possible theft - check camera footage_____]            │
│                                                         │
│                          [Cancel]  [Save Count]         │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Member Card Scan

```
┌─────────────────────────────────────────────────────────┐
│ 👤 Member Lookup                                   [X]  │
├─────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────┐ │
│ │ 📷 Scan member card or enter ID:                    │ │
│ │ [M-1234____________] [Search 🔍]                    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ─────────────── Member Found ───────────────           │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Photo]   John Smith                                │ │
│ │           M-1234                                    │ │
│ │           💎 Platinum Member                        │ │
│ │                                                     │ │
│ │           Credit Available: ฿37,550                 │ │
│ │           Loyalty Points: 12,450 pts                │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ ⚠️ 1 Alert: Shellfish allergy                          │
│                                                         │
│       [View Profile]  [Start Transaction]  [Close]      │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Register Barcode

```
┌─────────────────────────────────────────────────────────┐
│ + Register Barcode                                 [X]  │
├─────────────────────────────────────────────────────────┤
│ Barcode: 8859999999999                                  │
│ Type: [EAN-13__________▼]                               │
│                                                         │
│ ─────────────── Link to Product ───────────────        │
│                                                         │
│ Search Product: [callaway_________] [Search 🔍]        │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ○ Callaway Chrome Soft (Dozen)     SKU: CAL-CS-DZ  │ │
│ │ ● Callaway Supersoft (Dozen)       SKU: CAL-SS-DZ  │ │
│ │ ○ Callaway ERC Soft (Dozen)        SKU: CAL-ES-DZ  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Link to Variant (optional):                             │
│ [No variant (main product)__▼]                          │
│                                                         │
│ ☑ Set as primary barcode                                │
│                                                         │
│                          [Cancel]  [Register Barcode]   │
└─────────────────────────────────────────────────────────┘
```

---

## Feature 5: Advanced Inventory

### Inventory Features

| Feature | Description | Example |
|---------|-------------|---------|
| Stock Levels | Real-time quantity tracking | 24 in stock, 2 reserved |
| Reorder Points | Auto-alert when low | Alert at 20 units |
| Suppliers | Vendor management | Contact, lead time, pricing |
| Purchase Orders | Order from suppliers | PO-2026-0045 |
| Receiving | Check in shipments | Match PO, count items |
| Stock Transfers | Move between locations | Pro Shop to Warehouse |

### Data Model

```prisma
model InventoryLocation {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  name            String    // "Pro Shop", "Warehouse", "Spa Storage"
  code            String    // "PS", "WH", "SPA"
  type            LocationType

  address         String?
  isActive        Boolean   @default(true)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  stockLevels     StockLevel[]
  transfersFrom   StockTransfer[] @relation("FromLocation")
  transfersTo     StockTransfer[] @relation("ToLocation")
}

enum LocationType {
  RETAIL          // Selling location
  WAREHOUSE       // Storage only
  STORAGE         // Department storage
}

model StockLevel {
  id              String    @id @default(uuid())
  productId       String
  product         Product   @relation(fields: [productId], references: [id])
  locationId      String
  location        InventoryLocation @relation(fields: [locationId], references: [id])

  // Quantities
  quantityOnHand  Int       @default(0)
  quantityReserved Int      @default(0)  // Committed to orders
  quantityAvailable Int     @default(0)  // onHand - reserved

  // Reorder settings
  reorderPoint    Int?      // Alert when qty falls below
  reorderQuantity Int?      // Suggested order quantity
  maxStock        Int?      // Maximum stock level

  // Costing
  averageCost     Decimal?  // Weighted average cost
  lastCost        Decimal?  // Most recent purchase cost

  lastCountedAt   DateTime?
  lastReceivedAt  DateTime?

  @@unique([productId, locationId])
}

model Supplier {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  name            String
  code            String    // "SUP-001"

  // Contact
  contactName     String?
  email           String?
  phone           String?
  website         String?

  // Address
  address         String?
  city            String?
  country         String?

  // Terms
  paymentTerms    String?   // "Net 30", "COD"
  leadTimeDays    Int?      // Average delivery time
  minimumOrder    Decimal?  // Minimum order amount

  // Banking
  bankName        String?
  bankAccount     String?
  taxId           String?

  notes           String?
  isActive        Boolean   @default(true)

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  products        SupplierProduct[]
  purchaseOrders  PurchaseOrder[]
}

model SupplierProduct {
  id              String    @id @default(uuid())
  supplierId      String
  supplier        Supplier  @relation(fields: [supplierId], references: [id])
  productId       String
  product         Product   @relation(fields: [productId], references: [id])

  supplierSku     String?   // Supplier's product code
  supplierPrice   Decimal   // Supplier's unit price
  currency        String    @default("THB")

  minOrderQty     Int       @default(1)
  packSize        Int       @default(1)  // Units per pack
  leadTimeDays    Int?      // Product-specific lead time

  isPrimary       Boolean   @default(false) // Primary supplier for product
  isActive        Boolean   @default(true)

  @@unique([supplierId, productId])
}

model PurchaseOrder {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  orderNumber     String    @unique  // "PO-2026-0045"

  supplierId      String
  supplier        Supplier  @relation(fields: [supplierId], references: [id])

  // Delivery
  locationId      String    // Delivery location
  location        InventoryLocation @relation(fields: [locationId], references: [id])

  // Dates
  orderDate       DateTime  @default(now())
  expectedDate    DateTime?
  receivedDate    DateTime?

  // Amounts
  subtotal        Decimal
  tax             Decimal   @default(0)
  shipping        Decimal   @default(0)
  total           Decimal

  // Status
  status          POStatus  @default(DRAFT)

  // Reference
  reference       String?   // Supplier's reference
  notes           String?

  // Approval
  createdBy       String
  approvedBy      String?
  approvedAt      DateTime?

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  items           PurchaseOrderItem[]
  receipts        ReceivingRecord[]
}

enum POStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  ORDERED
  PARTIALLY_RECEIVED
  RECEIVED
  CANCELLED
}

model PurchaseOrderItem {
  id              String    @id @default(uuid())
  purchaseOrderId String
  purchaseOrder   PurchaseOrder @relation(fields: [purchaseOrderId], references: [id])

  productId       String
  product         Product   @relation(fields: [productId], references: [id])

  quantityOrdered Int
  quantityReceived Int      @default(0)
  unitCost        Decimal
  lineTotal       Decimal

  notes           String?
}

model ReceivingRecord {
  id              String    @id @default(uuid())
  purchaseOrderId String
  purchaseOrder   PurchaseOrder @relation(fields: [purchaseOrderId], references: [id])

  receivedDate    DateTime  @default(now())
  receivedBy      String

  // Delivery info
  deliveryNote    String?   // Supplier's delivery note number
  carrierName     String?

  notes           String?

  items           ReceivingItem[]
}

model ReceivingItem {
  id              String    @id @default(uuid())
  receivingId     String
  receiving       ReceivingRecord @relation(fields: [receivingId], references: [id])

  productId       String
  product         Product   @relation(fields: [productId], references: [id])

  quantityExpected Int
  quantityReceived Int
  quantityDamaged Int       @default(0)

  // Variance
  variance        Int       // received - expected
  varianceReason  String?

  // Location where items were placed
  locationId      String
  location        InventoryLocation @relation(fields: [locationId], references: [id])
}

model StockTransfer {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  transferNumber  String    @unique  // "TRF-2026-0012"

  fromLocationId  String
  fromLocation    InventoryLocation @relation("FromLocation", fields: [fromLocationId], references: [id])
  toLocationId    String
  toLocation      InventoryLocation @relation("ToLocation", fields: [toLocationId], references: [id])

  // Status
  status          TransferStatus @default(PENDING)

  // Dates
  requestedDate   DateTime  @default(now())
  shippedDate     DateTime?
  receivedDate    DateTime?

  // People
  requestedBy     String
  shippedBy       String?
  receivedBy      String?

  notes           String?

  items           StockTransferItem[]
}

enum TransferStatus {
  PENDING
  APPROVED
  IN_TRANSIT
  RECEIVED
  CANCELLED
}

model StockTransferItem {
  id              String    @id @default(uuid())
  transferId      String
  transfer        StockTransfer @relation(fields: [transferId], references: [id])

  productId       String
  product         Product   @relation(fields: [productId], references: [id])

  quantityRequested Int
  quantityShipped Int       @default(0)
  quantityReceived Int      @default(0)
}

model StockAdjustment {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  adjustmentNumber String   @unique  // "ADJ-2026-0008"

  locationId      String
  location        InventoryLocation @relation(fields: [locationId], references: [id])

  productId       String
  product         Product   @relation(fields: [productId], references: [id])

  // Quantities
  previousQuantity Int
  newQuantity     Int
  adjustment      Int       // new - previous

  // Reason
  reason          AdjustmentReason
  reasonDetail    String?

  // Approval
  createdBy       String
  approvedBy      String?
  approvedAt      DateTime?

  createdAt       DateTime  @default(now())
}

enum AdjustmentReason {
  STOCKTAKE
  DAMAGE
  THEFT
  EXPIRY
  RETURN_TO_SUPPLIER
  CORRECTION
  OTHER
}
```

### UX Flow: Stock Levels Overview

```
┌─────────────────────────────────────────────────────────┐
│ 📦 Inventory Overview                                   │
├─────────────────────────────────────────────────────────┤
│ Location: [Pro Shop_____▼]  Category: [All________▼]   │
│ Search: [_______________] [🔍]                          │
│                                                         │
│ ┌───────────────────────────────────────────────────────┐
│ │ Product           SKU        On Hand  Reserved  Avail │
│ ├───────────────────────────────────────────────────────┤
│ │ ⚠️ Titleist Pro V1 TIT-PV1    18       2        16   │
│ │    Reorder point: 20                                  │
│ │                                                       │
│ │ ✅ Callaway Chrome CAL-CS     24       0        24   │
│ │                                                       │
│ │ ✅ TaylorMade TP5  TM-TP5     36       4        32   │
│ │                                                       │
│ │ 🔴 Golf Glove - S  GLV-S       3       1         2   │
│ │    Reorder point: 10   CRITICAL                      │
│ │                                                       │
│ │ ✅ Golf Glove - M  GLV-M      15       0        15   │
│ └───────────────────────────────────────────────────────┘
│                                                         │
│ Summary:                                                │
│ 🔴 Critical (below reorder): 3 items                   │
│ ⚠️ Low (at/near reorder): 8 items                      │
│ ✅ OK: 117 items                                        │
│                                                         │
│        [Create PO from Low Stock]  [Export]  [Adjust]   │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Create Purchase Order

```
┌─────────────────────────────────────────────────────────┐
│ + New Purchase Order                               [X]  │
├─────────────────────────────────────────────────────────┤
│ PO Number: PO-2026-0046 (auto)                          │
│                                                         │
│ Supplier: [Titleist Thailand_____▼]                     │
│           Contact: Somchai P. | 081-234-5678            │
│                                                         │
│ Deliver To: [Pro Shop___________▼]                      │
│ Expected: [15/02/2026_____]                             │
│                                                         │
│ ─────────────── Order Items ─────────────── [+ Add]    │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Product              Qty    Unit Cost   Total       │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Titleist Pro V1      [48]   ฿1,800.00  ฿86,400.00  │ │
│ │ Current stock: 18 | Reorder qty: 48                 │ │
│ │                                        [Remove]     │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Titleist AVX         [24]   ฿1,950.00  ฿46,800.00  │ │
│ │ Current stock: 6 | Reorder qty: 24                  │ │
│ │                                        [Remove]     │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│                               Subtotal:   ฿133,200.00   │
│                               Tax (7%):   ฿  9,324.00   │
│                               Shipping:   ฿      0.00   │
│                               ─────────────────────     │
│                               Total:      ฿142,524.00   │
│                                                         │
│ Notes:                                                  │
│ [________________________________]                      │
│                                                         │
│            [Save as Draft]  [Submit for Approval]       │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Receive Shipment

```
┌─────────────────────────────────────────────────────────┐
│ 📥 Receive Shipment                                     │
├─────────────────────────────────────────────────────────┤
│ PO Number: [PO-2026-0045____] [Load 🔍]                 │
│                                                         │
│ ─────────────── Order Details ───────────────          │
│                                                         │
│ Supplier: Titleist Thailand                             │
│ Order Date: 01/02/2026                                  │
│ Expected: 15/02/2026                                    │
│                                                         │
│ Delivery Note #: [DN-45678_______]                      │
│ Carrier: [_______________]                              │
│                                                         │
│ ─────────────── Receive Items ───────────────          │
│                                                         │
│ 📷 Scan barcode or select:                              │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Product            Ordered  Received  Damaged       │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Titleist Pro V1    48       [48____]  [0___]  ✅    │ │
│ │ 8851234567890                                       │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Titleist AVX       24       [22____]  [2___]  ⚠️    │ │
│ │ 8851234567891                                       │ │
│ │ Note: [Box damaged in transit_______]               │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Receiving Summary:                                      │
│ Ordered: 72 units                                       │
│ Received: 70 units                                      │
│ Damaged: 2 units                                        │
│ Variance: -2 units ⚠️                                   │
│                                                         │
│              [Save Progress]  [Complete Receiving]      │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Stock Transfer Request

```
┌─────────────────────────────────────────────────────────┐
│ 📦 Stock Transfer Request                          [X]  │
├─────────────────────────────────────────────────────────┤
│ Transfer #: TRF-2026-0013 (auto)                        │
│                                                         │
│ From: [Warehouse_________▼]                             │
│ To:   [Pro Shop__________▼]                             │
│                                                         │
│ ─────────────── Items to Transfer ─────────────[+ Add] │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Product              From Stock   To Stock   Qty    │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Titleist Pro V1      48           18         [24__] │ │
│ │ Golf Glove - S       20            3         [12__] │ │
│ │ Golf Glove - M       15           15         [10__] │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Priority: ○ Normal  ● Urgent  ○ Critical               │
│                                                         │
│ Reason:                                                 │
│ [Restocking for weekend tournament____________]         │
│                                                         │
│                          [Cancel]  [Submit Request]     │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Supplier Management

```
┌─────────────────────────────────────────────────────────┐
│ 🏢 Suppliers                                 [+ Add New]│
├─────────────────────────────────────────────────────────┤
│ Search: [________________] [🔍]                         │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Supplier             Products   Open POs   Status   │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Titleist Thailand    24         1          ✅ Active│ │
│ │ Lead time: 7 days | Payment: Net 30                 │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Callaway Asia        18         0          ✅ Active│ │
│ │ Lead time: 10 days | Payment: Net 45                │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ TaylorMade Thailand  15         2          ✅ Active│ │
│ │ Lead time: 5 days | Payment: COD                    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│                              [View Details]  [New PO]   │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Low Stock Alerts Dashboard

```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ Low Stock Alerts                                     │
├─────────────────────────────────────────────────────────┤
│ 🔴 CRITICAL (3 items)                                   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Golf Glove - S     Stock: 3    Reorder: 10         │ │
│ │ Golf Glove - XL    Stock: 1    Reorder: 8          │ │
│ │ Sunscreen SPF50    Stock: 2    Reorder: 12         │ │
│ └─────────────────────────────────────────────────────┘ │
│                      [Create PO for Critical Items]     │
│                                                         │
│ ⚠️ LOW (8 items)                                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Titleist Pro V1    Stock: 18   Reorder: 20         │ │
│ │ Titleist AVX       Stock: 8    Reorder: 12         │ │
│ │ Golf Towel - White Stock: 15   Reorder: 20         │ │
│ │ ...and 5 more                                       │ │
│ └─────────────────────────────────────────────────────┘ │
│                      [View All Low Stock]  [Create PO]  │
│                                                         │
│ Incoming Stock:                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ PO-2026-0045  Titleist Thailand  72 units  Due 15/02│ │
│ │ PO-2026-0044  Callaway Asia      48 units  Due 18/02│ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Feature 6: Offline Mode

### Offline Capabilities

| Capability | Description | Sync Behavior |
|------------|-------------|---------------|
| View Products | Browse catalog offline | Cached data |
| Member Lookup | Basic member info | Last synced data |
| Create Transactions | Process sales | Queue for sync |
| Payment Types | Cash only when offline | Queue card payments |
| Inventory Updates | Track changes | Reconcile on sync |

### Data Model

```prisma
model OfflineQueue {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  // Device info
  deviceId        String
  terminalId      String?

  // Queue item
  queueType       QueueType
  payload         Json      // Full transaction data
  payloadHash     String    // For conflict detection

  // Priority
  priority        Int       @default(0)  // Higher = more urgent

  // Status
  status          QueueStatus @default(PENDING)
  retryCount      Int       @default(0)
  maxRetries      Int       @default(3)

  // Timestamps
  createdAt       DateTime  @default(now())
  createdOfflineAt DateTime // When originally created offline
  lastAttemptAt   DateTime?
  syncedAt        DateTime?

  // Errors
  errorMessage    String?
  errorDetails    Json?

  // Resolution
  resolvedBy      String?
  resolutionType  ResolutionType?
  resolutionNotes String?
}

enum QueueType {
  TRANSACTION
  INVENTORY_ADJUSTMENT
  MEMBER_UPDATE
  BOOKING
}

enum QueueStatus {
  PENDING
  SYNCING
  SYNCED
  FAILED
  CONFLICT
  RESOLVED
}

enum ResolutionType {
  AUTO_MERGED
  MANUAL_OVERRIDE
  DISCARDED
  RETRY_SUCCESS
}

model SyncSession {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])

  deviceId        String

  // Session info
  sessionStart    DateTime  @default(now())
  sessionEnd      DateTime?

  // Stats
  itemsQueued     Int       @default(0)
  itemsSynced     Int       @default(0)
  itemsFailed     Int       @default(0)
  itemsConflict   Int       @default(0)

  // Status
  status          SyncSessionStatus @default(IN_PROGRESS)

  // Network
  connectionType  String?   // "wifi", "cellular", "ethernet"
  avgLatency      Int?      // ms

  notes           String?
}

enum SyncSessionStatus {
  IN_PROGRESS
  COMPLETED
  PARTIAL
  FAILED
}

model ConflictLog {
  id              String    @id @default(uuid())
  queueId         String
  queue           OfflineQueue @relation(fields: [queueId], references: [id])

  // Conflict details
  conflictType    ConflictType
  localData       Json      // What device had
  serverData      Json      // What server had

  // Resolution
  resolution      ResolutionType?
  resolvedData    Json?     // Final merged data
  resolvedBy      String?
  resolvedAt      DateTime?

  detectedAt      DateTime  @default(now())
}

enum ConflictType {
  DUPLICATE_TRANSACTION  // Same transaction ID
  STALE_MEMBER_DATA      // Member updated while offline
  INVENTORY_MISMATCH     // Stock levels changed
  PRICE_CHANGE           // Product price changed
  PAYMENT_MISMATCH       // Payment amount discrepancy
}

model OfflineCache {
  id              String    @id @default(uuid())
  clubId          String
  club            Club      @relation(fields: [clubId], references: [id])
  deviceId        String

  cacheType       CacheType
  dataVersion     Int       // Version number for cache invalidation
  lastSyncedAt    DateTime

  // Cache contents
  data            Json

  @@unique([clubId, deviceId, cacheType])
}

enum CacheType {
  PRODUCTS
  MEMBERS
  PRICES
  TAX_RATES
  PAYMENT_METHODS
  DISCOUNTS
}
```

### UX Flow: Connection Status Indicator

**Always visible in header**

```
Online:
┌─────────────────────────────────────────────────────────┐
│ Pro Shop POS              [🟢 Online]      Somchai P.   │
└─────────────────────────────────────────────────────────┘

Weak Connection:
┌─────────────────────────────────────────────────────────┐
│ Pro Shop POS              [🟡 Weak Signal] Somchai P.   │
└─────────────────────────────────────────────────────────┘

Offline:
┌─────────────────────────────────────────────────────────┐
│ Pro Shop POS              [🔴 Offline] ⏳ 3 pending     │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Going Offline Alert

```
┌─────────────────────────────────────────────────────────┐
│ 🔴 Connection Lost                                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ You are now working offline.                            │
│                                                         │
│ Available Features:                                     │
│ ✅ View products and prices (last synced 5 min ago)    │
│ ✅ Basic member lookup                                  │
│ ✅ Process cash transactions                            │
│ ✅ Process account charges (queued)                     │
│                                                         │
│ Unavailable Features:                                   │
│ ❌ Card payments (use cash or member account)           │
│ ❌ Real-time inventory updates                          │
│ ❌ New member registration                              │
│ ❌ Loyalty points balance                               │
│                                                         │
│ Transactions will sync automatically when connected.    │
│                                                         │
│                          [Continue in Offline Mode]     │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Offline Transaction

```
┌─────────────────────────────────────────────────────────┐
│ 🛒 Pro Shop POS                    [🔴 Offline Mode]   │
├─────────────────────────────────────────────────────────┤
│ ⚠️ Working offline - transactions will sync when online │
│                                                         │
│ Cart:                                                   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Titleist Pro V1 (Dozen)            ฿2,400 × 1      │ │
│ │ Golf Glove - M                     ฿  850 × 1      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Subtotal:                              ฿3,250.00        │
│ Tax (7%):                              ฿  227.50        │
│ Total:                                 ฿3,477.50        │
│                                                         │
│ Payment Method:                                         │
│ ● Cash                                                  │
│ ○ Member Account (will queue)                           │
│ ○ Card Payment  [❌ Unavailable offline]                │
│                                                         │
│                              [Clear]  [Pay ฿3,477.50]   │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Transaction Queued Confirmation

```
┌─────────────────────────────────────────────────────────┐
│ ✅ Transaction Queued                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Transaction #: OFF-2026-0142                            │
│ Amount: ฿3,477.50                                       │
│ Payment: Cash                                           │
│                                                         │
│ ⏳ This transaction is queued for sync.                 │
│    It will be processed when connection is restored.    │
│                                                         │
│ Queue Status: 4 transactions pending                    │
│                                                         │
│ Receipt Options:                                        │
│ [Print Offline Receipt]  [Email Later]  [No Receipt]   │
│                                                         │
│                              [New Transaction]          │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Sync Queue Dashboard

```
┌─────────────────────────────────────────────────────────┐
│ 🔄 Sync Queue                            [🔴 Offline]   │
├─────────────────────────────────────────────────────────┤
│ Pending Transactions: 4                                 │
│ Last Sync: 2 hours ago                                  │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ # Transaction      Time         Amount    Status    │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ 1 OFF-2026-0142   14:35        ฿3,477    ⏳ Pending │ │
│ │ 2 OFF-2026-0141   14:22        ฿1,280    ⏳ Pending │ │
│ │ 3 OFF-2026-0140   14:10        ฿4,850    ⏳ Pending │ │
│ │ 4 OFF-2026-0139   13:55        ฿  650    ⏳ Pending │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Total Pending: ฿10,257.00                               │
│                                                         │
│ [Retry Sync Now]  [View Details]  [Export Pending]      │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Reconnection & Sync

```
┌─────────────────────────────────────────────────────────┐
│ 🟢 Connection Restored                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Syncing 4 pending transactions...                       │
│                                                         │
│ ████████████████░░░░░░░░ 3 of 4                        │
│                                                         │
│ ✅ OFF-2026-0139  ฿650     Synced                      │
│ ✅ OFF-2026-0140  ฿4,850   Synced                      │
│ ✅ OFF-2026-0141  ฿1,280   Synced                      │
│ ⏳ OFF-2026-0142  ฿3,477   Syncing...                  │
│                                                         │
│ Updating local cache...                                 │
│ • Products: Updating...                                 │
│ • Members: 1,245 records                                │
│ • Prices: Updated ✅                                    │
│                                                         │
│                                     [Sync in Background] │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Sync Complete

```
┌─────────────────────────────────────────────────────────┐
│ ✅ Sync Complete                                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ All 4 transactions synced successfully!                 │
│                                                         │
│ Summary:                                                │
│ • Transactions synced: 4                                │
│ • Total amount: ฿10,257.00                              │
│ • Time offline: 2h 15m                                  │
│                                                         │
│ Cache Updated:                                          │
│ • 12 product prices changed                             │
│ • 3 new products added                                  │
│ • 2 member records updated                              │
│                                                         │
│                                            [Dismiss]    │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Conflict Resolution

**Trigger:** Server data differs from offline data

```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ Sync Conflict Detected                               │
├─────────────────────────────────────────────────────────┤
│ Transaction: OFF-2026-0142                              │
│                                                         │
│ Conflict: Member account balance changed                │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Your Transaction (Offline):                         │ │
│ │ Member: John Smith (M-1234)                         │ │
│ │ Charge: ฿3,477.50                                   │ │
│ │ Balance at time: ฿37,550.00                         │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Current Server State:                               │ │
│ │ Member: John Smith (M-1234)                         │ │
│ │ Current Balance: ฿35,200.00                         │ │
│ │ (2 transactions processed while offline)            │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ New balance after this charge: ฿31,722.50               │
│ Credit available: ฿18,277.50 of ฿50,000                │
│                                                         │
│ Resolution:                                             │
│ ○ Apply charge with updated balance (recommended)       │
│ ○ Skip this transaction and review manually             │
│ ○ Convert to different payment method                   │
│                                                         │
│                          [Cancel]  [Apply Resolution]   │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Conflict - Credit Limit Exceeded

```
┌─────────────────────────────────────────────────────────┐
│ 🚫 Sync Conflict - Credit Limit                         │
├─────────────────────────────────────────────────────────┤
│ Transaction: OFF-2026-0143                              │
│                                                         │
│ Problem: Member's credit limit would be exceeded        │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ At time of offline transaction:                     │ │
│ │ Credit Limit: ฿50,000                               │ │
│ │ Balance: ฿37,550                                    │ │
│ │ Charge: ฿8,500                                      │ │
│ │ Would be: ฿46,050 ✅                                │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Current state:                                      │ │
│ │ Credit Limit: ฿50,000                               │ │
│ │ Current Balance: ฿48,200 (increased while offline) │ │
│ │ This Charge: ฿8,500                                 │ │
│ │ Would be: ฿56,700 🚫 EXCEEDS LIMIT                  │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Resolution Options:                                     │
│ ○ Request manager override                              │
│ ○ Convert to card payment (contact customer)            │
│ ○ Void transaction (will need to follow up)             │
│                                                         │
│ Manager PIN: [____] (for override)                      │
│                                                         │
│                          [Cancel]  [Apply Resolution]   │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Offline Data Stale Warning

```
┌─────────────────────────────────────────────────────────┐
│ ⚠️ Offline Data May Be Outdated                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ You have been offline for more than 4 hours.            │
│                                                         │
│ Cached data may be stale:                               │
│ • Product prices (last sync: 4h 15m ago)                │
│ • Member balances (last sync: 4h 15m ago)               │
│ • Inventory levels (last sync: 4h 15m ago)              │
│                                                         │
│ Recommendations:                                        │
│ • Verify prices with printed price list                 │
│ • Confirm member balances if charging large amounts     │
│ • Check physical stock for high-value items             │
│                                                         │
│ ☐ Don't show this again for current session             │
│                                                         │
│                          [Continue Offline]  [Try Sync] │
└─────────────────────────────────────────────────────────┘
```

### UX Flow: Sync Settings

```
┌─────────────────────────────────────────────────────────┐
│ ⚙️ Offline & Sync Settings                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Auto-Sync:                                              │
│ ☑ Sync automatically when connection restored           │
│ ☑ Background sync every [15__] minutes when online      │
│                                                         │
│ Offline Cache:                                          │
│ Products:        1,245 items     [Refresh Now]          │
│ Members:         3,456 records   [Refresh Now]          │
│ Prices:          Updated 15m ago                        │
│ Cache Size:      48 MB                                  │
│                                                         │
│ Offline Limits:                                         │
│ Max offline transaction amount: ฿ [50,000___]           │
│ Max pending transactions: [100___]                      │
│ Stale data warning after: [4___] hours                  │
│                                                         │
│ Conflict Resolution:                                    │
│ Default: [Ask for each conflict____▼]                   │
│   • Ask for each conflict                               │
│   • Auto-apply (use server data)                        │
│   • Auto-apply (use local data)                         │
│   • Queue for manual review                             │
│                                                         │
│                          [Cancel]  [Save Settings]      │
└─────────────────────────────────────────────────────────┘
```

---

## Summary

| Feature | Priority | Complexity |
|---------|----------|------------|
| 1. Unified Ledger | High | High |
| 2. VIP Member Recognition | High | Medium |
| 3. Commission Tracking | Medium | Medium |
| 4. Barcode Scanning | Medium | Low |
| 5. Advanced Inventory | High | High |
| 6. Offline Mode | Critical | High |

**Recommended Implementation Order:**

1. **Barcode Scanning** (foundation for inventory features, low complexity)
2. **VIP Member Recognition** (high value, medium complexity)
3. **Unified Ledger** (enables gift cards, loyalty - customer-facing value)
4. **Commission Tracking** (staff-facing, can run parallel)
5. **Advanced Inventory** (builds on barcode scanning)
6. **Offline Mode** (most complex, but critical for reliability)

**Dependencies:**

- Barcode Scanning should be implemented before Advanced Inventory
- Unified Ledger should integrate with existing payment flow
- VIP Recognition should tie into existing member profiles
- Offline Mode requires all other features to have proper sync logic
