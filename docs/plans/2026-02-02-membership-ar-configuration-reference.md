# Membership Management & Accounts Receivable Configuration Reference

**Date:** 2026-02-02
**Purpose:** Comprehensive reference of all membership management and accounts receivable configuration options for club operations

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Membership Types & Categories](#2-membership-types--categories)
3. [Membership Tiers & Benefits](#3-membership-tiers--benefits)
4. [Member Lifecycle Management](#4-member-lifecycle-management)
5. [Family & Household Management](#5-family--household-management)
6. [Billing Configuration](#6-billing-configuration)
7. [Invoice Management](#7-invoice-management)
8. [Payment Processing](#8-payment-processing)
9. [Credit Card Surcharges & Convenience Fees](#9-credit-card-surcharges--convenience-fees)
10. [Tax Configuration & Withholding Tax](#10-tax-configuration--withholding-tax)
11. [Credit Management](#11-credit-management)
12. [Auto-Pay & Recurring Billing](#12-auto-pay--recurring-billing)
13. [Accounts Receivable & Collections](#13-accounts-receivable--collections)
14. [Minimum Spend Requirements](#14-minimum-spend-requirements)
15. [Sub-Accounts & Authorized Users](#15-sub-accounts--authorized-users)
16. [Membership Applications](#16-membership-applications)
17. [Statements & Document Generation](#17-statements--document-generation)
18. [Marketing & Email Campaign Integration](#18-marketing--email-campaign-integration)
19. [Reporting & Analytics](#19-reporting--analytics)
20. [Implementation Priority Matrix](#20-implementation-priority-matrix)

---

## 1. System Overview

### Configuration Hierarchy

```
Club Settings (global defaults)
└── Membership Type (category settings)
    └── Membership Tier (tier-specific benefits)
        └── Individual Member (personal overrides)
```

### Core Entities

| Entity | Purpose | Key Relationships |
|--------|---------|-------------------|
| Member | Primary account holder | Household, Invoices, Payments |
| MembershipType | Category (Individual, Family, Corporate) | Tiers, Members |
| MembershipTier | Sub-level (Gold, Silver, Bronze) | MembershipType, Benefits |
| Household | Family grouping | Members, Dependents |
| Invoice | Billing document | LineItems, Payments |
| Payment | Received funds | Allocations, Member |

---

## 2. Membership Types & Categories

### 2.1 Standard Membership Categories

| Category | Code | Description | Typical Features |
|----------|------|-------------|------------------|
| **Individual** | `IND` | Single person membership | Full access, 1 member |
| **Family** | `FAM` | Primary + spouse + children | Full access, dependents included |
| **Corporate** | `CORP` | Company-sponsored | 4-6 designated users, transferable |
| **Junior** | `JNR` | Young adult (18-39) | Reduced dues, age restrictions |
| **Senior** | `SNR` | Age 65/70+ | Reduced dues, time restrictions |
| **Social** | `SOC` | Non-golf/limited access | Dining, pool, tennis only |
| **Sports** | `SPT` | Tennis/fitness focus | No golf, full sports access |
| **Legacy** | `LEG` | Long-term member | Special pricing, grandfathered |
| **Honorary** | `HON` | Complimentary | Board-approved, no dues |
| **Non-Resident** | `NR` | Distance >50 miles | Reduced dues, visit limits |
| **Seasonal** | `SEA` | Part-year access | 6-month terms |
| **Probationary** | `PRB` | New member trial | 90-day evaluation |

### 2.2 Membership Type Configuration

```typescript
interface MembershipType {
  id: string;
  clubId: string;

  // Basic Info
  name: string;                    // "Family Golf Membership"
  code: string;                    // "FAM-GOLF"
  description: string;
  category: MembershipCategory;    // INDIVIDUAL, FAMILY, CORPORATE, etc.

  // Fees
  joiningFee: number;              // One-time initiation
  monthlyDues: number;             // Recurring monthly
  annualDues: number;              // If billed annually
  minimumCommitmentMonths: number; // 12, 24, etc.

  // Age Restrictions
  minAge?: number;                 // 18 for adult
  maxAge?: number;                 // 39 for junior
  ageAsOfDate: 'JOIN_DATE' | 'YEAR_START' | 'BIRTHDAY';

  // Family/Dependent Settings
  allowFamilyMembers: boolean;
  maxFamilyMembers: number;        // Spouse + 4 children
  dependentMaxAge: number;         // 23 or 26
  spouseIncluded: boolean;

  // Guest Privileges
  allowGuests: boolean;
  maxGuestsPerVisit: number;       // 3 guests per round
  maxGuestsPerMonth: number;       // 12 guests/month
  guestFeeRequired: boolean;

  // Booking Privileges
  bookingAdvanceDays: number;      // 14 days ahead
  priorityBooking: boolean;        // Early access
  maxActiveBookings: number;       // 2 tee times

  // Access Hours
  accessRestrictions?: {
    daysOfWeek: number[];          // [1,2,3,4,5] = Mon-Fri only
    startTime?: string;            // "14:00" = afternoon only
    endTime?: string;
    seasonStart?: string;          // "04-01" for seasonal
    seasonEnd?: string;            // "10-31"
  };

  // Voting Rights
  hasVotingRights: boolean;
  canHoldOffice: boolean;

  // Status
  isActive: boolean;
  acceptingApplications: boolean;
  waitlistEnabled: boolean;

  // Relationships
  tiers: MembershipTier[];
  minimumSpendRequirements: MinimumSpendRequirement[];
}

enum MembershipCategory {
  INDIVIDUAL = 'INDIVIDUAL',
  FAMILY = 'FAMILY',
  CORPORATE = 'CORPORATE',
  JUNIOR = 'JUNIOR',
  SENIOR = 'SENIOR',
  SOCIAL = 'SOCIAL',
  SPORTS = 'SPORTS',
  LEGACY = 'LEGACY',
  HONORARY = 'HONORARY',
  NON_RESIDENT = 'NON_RESIDENT',
  SEASONAL = 'SEASONAL',
  PROBATIONARY = 'PROBATIONARY',
}
```

### 2.3 Corporate Membership Configuration

```typescript
interface CorporateMembershipConfig {
  maxDesignees: number;            // 4-6 users
  designeeTransferAllowed: boolean;
  transfersPerYear: number;        // 2 changes/year
  primaryDesigneeRequired: boolean;

  // Billing
  billToCompany: boolean;
  companyName: string;
  billingContact: string;
  taxId?: string;

  // Access
  sharedBookingQuota: boolean;     // Pool bookings across designees
  individualQuotasPerDesignee: boolean;
}
```

---

## 3. Membership Tiers & Benefits

### 3.1 Tier Structure

| Tier | Price Multiplier | Typical Benefits |
|------|-----------------|------------------|
| **Platinum** | 1.5x | Priority everything, exclusive events |
| **Gold** | 1.25x | Early booking, locker included |
| **Silver** | 1.0x | Standard benefits |
| **Bronze** | 0.85x | Limited hours, no locker |

### 3.2 Tier Configuration

```typescript
interface MembershipTier {
  id: string;
  membershipTypeId: string;

  // Basic Info
  name: string;                    // "Gold"
  code: string;                    // "GOLD"
  description: string;

  // Pricing
  priceMultiplier: number;         // 1.25 = 25% more than base
  additionalMonthlyFee?: number;   // Fixed add-on

  // Benefits (JSON)
  benefits: TierBenefits;

  // Upgrade/Downgrade
  canUpgradeTo: string[];          // Tier IDs
  canDowngradeTo: string[];
  upgradeWaitingPeriod: number;    // Months before eligible

  // Status
  isActive: boolean;
  sortOrder: number;
}

interface TierBenefits {
  // Booking Benefits
  bookingAdvanceDays: number;      // Override type default
  priorityBookingWindow: number;   // Hours before general
  maxActiveBookings: number;

  // Guest Benefits
  guestPassesPerMonth: number;     // Complimentary
  guestFeeDiscount: number;        // 20% off

  // Discounts
  proShopDiscount: number;         // 15%
  diningDiscount: number;          // 10%
  spaDiscount: number;

  // Included Items
  lockerIncluded: boolean;
  lockerSize: 'SMALL' | 'MEDIUM' | 'LARGE';
  bagStorageIncluded: boolean;
  rangePassIncluded: boolean;      // Unlimited range balls

  // Events
  exclusiveEventAccess: boolean;
  eventPriorityBooking: boolean;
  complimentaryEventsPerYear: number;

  // Services
  vipParking: boolean;
  clubFitting: boolean;            // Annual club fitting
  lessonsIncluded: number;         // 2 lessons/year

  // Credit
  creditLimitMultiplier: number;   // 1.5x base limit
  extendedPaymentTerms: number;    // Extra days

  // Minimum Spend
  minimumSpendWaived: boolean;
  minimumSpendReduction: number;   // 25% less required
}
```

### 3.3 Benefit Display Configuration

```typescript
const tierBenefitDisplay = [
  { key: 'bookingAdvanceDays', label: 'Advance Booking', format: '{value} days' },
  { key: 'guestPassesPerMonth', label: 'Guest Passes', format: '{value}/month' },
  { key: 'proShopDiscount', label: 'Pro Shop Discount', format: '{value}%' },
  { key: 'diningDiscount', label: 'Dining Discount', format: '{value}%' },
  { key: 'lockerIncluded', label: 'Locker', format: 'Included' },
  { key: 'bagStorageIncluded', label: 'Bag Storage', format: 'Included' },
  { key: 'rangePassIncluded', label: 'Range Balls', format: 'Unlimited' },
];
```

---

## 4. Member Lifecycle Management

### 4.1 Member Status Workflow

```
┌──────────┐    ┌──────────┐    ┌───────────┐    ┌──────────┐
│ PROSPECT │───►│   LEAD   │───►│ APPLICANT │───►│  ACTIVE  │
└──────────┘    └──────────┘    └───────────┘    └────┬─────┘
                                                      │
     ┌────────────────────────────────────────────────┼────────────────┐
     │                                                │                │
     ▼                                                ▼                ▼
┌───────────┐    ┌──────────┐    ┌────────────┐  ┌─────────┐    ┌──────────┐
│ SUSPENDED │◄──►│  ACTIVE  │───►│   LAPSED   │  │RESIGNED │    │TERMINATED│
└───────────┘    └──────────┘    └────────────┘  └─────────┘    └──────────┘
     │                                                │
     │              ┌─────────────┐                   │
     └─────────────►│ REACTIVATED │◄──────────────────┘
                    └─────────────┘
```

### 4.2 Status Definitions

| Status | Description | Billing | Access | Triggers |
|--------|-------------|---------|--------|----------|
| **PROSPECT** | Initial contact | None | None | Lead form, referral |
| **LEAD** | Active sales lead | None | Tour only | Sales qualification |
| **APPLICANT** | Application submitted | Deposit | None | Application received |
| **ACTIVE** | Full member | Full | Full | Approval + payment |
| **SUSPENDED** | Temporary hold | Paused | Blocked | AR aging, violation |
| **LAPSED** | Missed renewal | None | Blocked | Non-renewal |
| **RESIGNED** | Voluntary exit | Final | Revoked | Resignation letter |
| **TERMINATED** | Involuntary exit | Final | Revoked | Board action |
| **REACTIVATED** | Returned member | Full | Full | Reinstatement |

### 4.3 Status Transition Rules

```typescript
interface StatusTransitionConfig {
  fromStatus: MemberStatus;
  toStatus: MemberStatus;

  // Requirements
  requiresApproval: boolean;
  approverRoles: string[];         // ['MANAGER', 'BOARD']
  requiresPayment: boolean;        // Outstanding balance
  requiresDocumentation: boolean;

  // Automation
  autoTransition: boolean;         // System-triggered
  triggerCondition?: string;       // 'AR_AGING > 90'

  // Fees
  reinstatementFee?: number;
  prorationRules?: 'FULL' | 'PRORATED' | 'WAIVED';

  // Notifications
  notifyMember: boolean;
  notifyStaff: boolean;
  notifyBoard: boolean;

  // Waiting Period
  waitingPeriodDays: number;       // 30 days notice
  effectiveDate: 'IMMEDIATE' | 'END_OF_MONTH' | 'END_OF_BILLING';
}

const statusTransitions: StatusTransitionConfig[] = [
  {
    fromStatus: 'ACTIVE',
    toStatus: 'SUSPENDED',
    requiresApproval: true,
    approverRoles: ['MANAGER'],
    autoTransition: true,
    triggerCondition: 'DAYS_OVERDUE >= 91',
    notifyMember: true,
    notifyStaff: true,
  },
  {
    fromStatus: 'SUSPENDED',
    toStatus: 'ACTIVE',
    requiresApproval: true,
    requiresPayment: true,
    reinstatementFee: 500,
    notifyMember: true,
  },
  // ... more transitions
];
```

### 4.4 Member Data Model

```typescript
interface Member {
  id: string;
  clubId: string;

  // Identity
  memberId: string;                // M-0001 format
  firstName: string;
  lastName: string;
  preferredName?: string;
  salutation?: string;             // Mr., Mrs., Dr.
  suffix?: string;                 // Jr., III

  // Contact
  email: string;
  phone: string;
  mobilePhone?: string;
  workPhone?: string;

  // Demographics
  dateOfBirth?: Date;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_SAY';
  nationality?: string;
  idNumber?: string;               // National ID
  passportNumber?: string;

  // Address
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;

  // Membership
  membershipTypeId: string;
  membershipTierId?: string;
  status: MemberStatus;
  joinDate: Date;
  expiryDate?: Date;
  renewalDate?: Date;
  sponsorId?: string;              // Referring member

  // Family
  householdId?: string;
  isPrimaryMember: boolean;

  // Financial
  creditBalance: number;           // Prepaid credit
  outstandingBalance: number;      // Amount owed
  creditLimit: number;
  creditLimitEnabled: boolean;
  creditAlertThreshold: number;    // 80%
  creditBlockEnabled: boolean;

  // Preferences
  communicationPreferences: CommunicationPrefs;
  dietaryRestrictions?: string[];
  handicapIndex?: number;
  shirtSize?: string;

  // Custom
  tags: string[];
  customFields: Record<string, any>;
  notes?: string;

  // Audit
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

interface CommunicationPrefs {
  emailMarketing: boolean;
  emailStatements: boolean;
  emailEvents: boolean;
  smsNotifications: boolean;
  paperStatements: boolean;
  preferredLanguage: string;
}
```

---

## 5. Family & Household Management

### 5.1 Household Structure

```typescript
interface Household {
  id: string;
  clubId: string;

  // Info
  name: string;                    // "The Smith Family"

  // Contact
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
  email?: string;

  // Billing
  consolidatedBilling: boolean;    // Single invoice for household
  billToMemberId: string;          // Primary member pays

  // Members
  members: Member[];               // All household members
  primaryMemberId: string;
}
```

### 5.2 Dependent Configuration

```typescript
interface Dependent {
  id: string;
  memberId: string;                // Parent member

  // Identity
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  relationship: DependentRelationship;

  // Contact
  email?: string;
  phone?: string;

  // Access
  hasClubAccess: boolean;
  accessCardNumber?: string;
  accessStartDate?: Date;
  accessEndDate?: Date;            // Auto-expire at age limit

  // Privileges (inherit or override)
  golfPrivileges: boolean;
  diningPrivileges: boolean;
  poolPrivileges: boolean;
  fitnessPrivileges: boolean;
  spaPrivileges: boolean;

  // Billing
  chargesGoToParent: boolean;
  ownCreditLimit?: number;

  // Status
  status: 'ACTIVE' | 'SUSPENDED' | 'AGED_OUT' | 'REMOVED';
}

enum DependentRelationship {
  SPOUSE = 'SPOUSE',
  CHILD = 'CHILD',
  GRANDCHILD = 'GRANDCHILD',
  PARENT = 'PARENT',
  SIBLING = 'SIBLING',
  DOMESTIC_PARTNER = 'DOMESTIC_PARTNER',
  OTHER = 'OTHER',
}
```

### 5.3 Age-Out Rules

```typescript
interface AgeOutConfig {
  membershipTypeId: string;
  dependentType: DependentRelationship;

  maxAge: number;                  // 23 or 26
  ageCalculation: 'BIRTHDAY' | 'YEAR_END' | 'MEMBERSHIP_ANNIVERSARY';

  // Grace Period
  gracePeriodMonths: number;       // 6 months after birthday

  // Conversion Options
  conversionOffer: boolean;
  conversionMembershipTypeId?: string;  // Junior Individual
  conversionDiscount?: number;     // 50% off joining fee

  // Notifications
  notifyMonthsBefore: number[];    // [6, 3, 1]
  notifyMember: boolean;
  notifyParent: boolean;
}
```

---

## 6. Billing Configuration

### 6.1 Billing Cycles

| Cycle | Description | Use Case |
|-------|-------------|----------|
| **Monthly** | Bill on same day each month | Steady cash flow |
| **Quarterly** | Bill every 3 months | Reduce processing |
| **Semi-Annual** | Bill twice yearly | Seasonal clubs |
| **Annual** | Bill once per year | Simplicity |
| **Custom** | Flexible schedule | Special arrangements |

### 6.2 Billing Schedule Configuration

```typescript
interface BillingScheduleConfig {
  id: string;
  clubId: string;
  name: string;                    // "Standard Monthly"

  // Frequency
  frequency: BillingFrequency;
  billingDayOfMonth: number;       // 1-28

  // For non-monthly
  billingMonths?: number[];        // [1, 4, 7, 10] for quarterly

  // Due Date
  paymentTermsDays: number;        // Net 30

  // Late Fees
  lateFeeEnabled: boolean;
  lateFeeType: 'FIXED' | 'PERCENTAGE';
  lateFeeAmount: number;           // $25 or 1.5%
  lateFeeGraceDays: number;        // 5 days
  lateFeeMaximum?: number;         // Cap at $100

  // Proration
  prorationEnabled: boolean;
  prorationMethod: 'DAILY' | 'HALF_MONTH' | 'FULL_MONTH';

  // Deferred Revenue
  deferredRevenueEnabled: boolean; // Recognize over period

  // Automation
  autoGenerateInvoices: boolean;
  generateDaysBefore: number;      // 7 days before billing date
  autoSendInvoices: boolean;
  sendMethod: 'EMAIL' | 'PAPER' | 'BOTH';
}

enum BillingFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  ANNUAL = 'ANNUAL',
  CUSTOM = 'CUSTOM',
}
```

### 6.3 Charge Types

```typescript
interface ChargeType {
  id: string;
  clubId: string;

  // Identity
  name: string;                    // "Monthly Dues"
  code: string;                    // "DUES-MTH"
  description?: string;
  category: ChargeCategory;

  // Pricing
  defaultPrice?: number;

  // Tax
  taxable: boolean;
  taxRate?: number;                // Override default
  taxType: 'INCLUSIVE' | 'EXCLUSIVE';

  // Accounting
  glCode: string;                  // General ledger code
  revenueAccountId?: string;

  // Behavior
  isRecurring: boolean;
  isRefundable: boolean;
  requiresApproval: boolean;
  approvalThreshold?: number;

  // Minimum Spend
  countsTowardMinimum: boolean;
  minimumSpendCategory?: string;

  // Status
  isActive: boolean;
  sortOrder: number;
}

enum ChargeCategory {
  DUES = 'DUES',
  INITIATION = 'INITIATION',
  FOOD_BEVERAGE = 'FOOD_BEVERAGE',
  GOLF = 'GOLF',
  SPA = 'SPA',
  RETAIL = 'RETAIL',
  EVENTS = 'EVENTS',
  LOCKER = 'LOCKER',
  STORAGE = 'STORAGE',
  LESSONS = 'LESSONS',
  GUEST_FEES = 'GUEST_FEES',
  LATE_FEES = 'LATE_FEES',
  OTHER = 'OTHER',
}
```

### 6.4 Fee Structures

```typescript
interface FeeStructure {
  membershipTypeId: string;

  // Initiation
  joiningFee: number;
  joiningFeePaymentOptions: PaymentOption[];

  // Recurring Dues
  monthlyDues: number;
  annualDues?: number;             // If paid upfront
  annualDiscountPercent?: number;  // 5% for annual

  // Quarterly Minimums
  quarterlyMinimumFood?: number;
  quarterlyMinimumTotal?: number;

  // Capital Assessments
  capitalAssessmentEnabled: boolean;
  capitalAssessmentAmount?: number;
  capitalAssessmentFrequency?: 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

  // Facility Fees
  lockerFeeMonthly?: number;
  bagStorageFeeMonthly?: number;
  trailFeePerRound?: number;

  // Guest Fees
  guestGreenFee?: number;
  guestCartFee?: number;
  guestDiningFee?: number;
}

interface PaymentOption {
  name: string;                    // "Pay in Full"
  type: 'FULL' | 'INSTALLMENT';
  installments?: number;           // 12 months
  interestRate?: number;           // 0% or 6%
  downPaymentPercent?: number;     // 25%
}
```

---

## 7. Invoice Management

### 7.1 Invoice Configuration

```typescript
interface InvoiceConfig {
  clubId: string;

  // Numbering
  invoicePrefix: string;           // "INV"
  invoiceNumberFormat: string;     // "{PREFIX}-{YEAR}-{SEQ:5}"
  nextSequence: number;

  // Defaults
  defaultPaymentTerms: number;     // 30 days
  defaultTaxRate: number;          // 7%

  // Display
  showMemberBalance: boolean;
  showPaymentHistory: boolean;
  showAgingBuckets: boolean;

  // Grouping
  groupChargesByCategory: boolean;
  groupChargesByDate: boolean;

  // Footer
  footerText: string;
  bankDetails: string;
  paymentInstructions: string;

  // Reminders
  reminderEnabled: boolean;
  reminderDaysBeforeDue: number[]; // [7, 3, 1]
  reminderDaysAfterDue: number[];  // [1, 7, 14, 30]
}
```

### 7.2 Invoice Status Workflow

```
┌───────┐    ┌────────┐    ┌───────────────┐    ┌──────┐
│ DRAFT │───►│  SENT  │───►│PARTIALLY_PAID │───►│ PAID │
└───────┘    └────┬───┘    └───────────────┘    └──────┘
                  │
                  ▼
             ┌─────────┐
             │ OVERDUE │
             └────┬────┘
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
    ┌──────┐  ┌──────┐  ┌───────────┐
    │ VOID │  │ PAID │  │ CANCELLED │
    └──────┘  └──────┘  └───────────┘
```

### 7.3 Invoice Line Item Types

| Type | Description | Example |
|------|-------------|---------|
| **DUES** | Recurring membership dues | Monthly dues - March 2026 |
| **INITIATION** | One-time joining fee | Family Initiation Fee |
| **CHARGE** | POS transaction charges | Pro Shop - Golf Balls |
| **ADJUSTMENT** | Manual adjustment | Credit adjustment |
| **CREDIT** | Applied credit | Applied credit balance |
| **LATE_FEE** | Late payment penalty | Late fee - Invoice #1234 |
| **INTEREST** | Finance charges | Interest on past due balance |
| **TAX** | Tax line | Sales Tax 7% |
| **MINIMUM_SPEND** | Shortfall billing | Q1 Minimum Spend Shortfall |

---

## 8. Payment Processing

### 8.1 Payment Methods

| Method | Code | Description | Processing |
|--------|------|-------------|------------|
| **Cash** | `CASH` | Physical currency | Manual entry |
| **Check** | `CHECK` | Paper check | Manual entry |
| **Credit Card** | `CREDIT_CARD` | Visa, MC, Amex | Stripe |
| **Bank Transfer** | `BANK_TRANSFER` | Wire/ACH | Manual or auto |
| **QR PromptPay** | `QR_PROMPTPAY` | Thailand QR | Auto confirm |
| **QR PayNow** | `QR_PAYNOW` | Singapore QR | Auto confirm |
| **QR DuitNow** | `QR_DUITNOW` | Malaysia QR | Auto confirm |
| **Direct Debit** | `DIRECT_DEBIT` | Bank account debit | Scheduled |
| **Credit Balance** | `CREDIT` | Apply account credit | Automatic |
| **Member Account** | `ACCOUNT` | Charge to account | Creates AR |

### 8.2 Payment Configuration

```typescript
interface PaymentConfig {
  clubId: string;

  // Receipt Numbering
  receiptPrefix: string;           // "RCP"
  receiptNumberFormat: string;

  // Accepted Methods
  acceptedMethods: PaymentMethod[];

  // Processing
  stripeEnabled: boolean;
  stripeAccountId?: string;

  // Surcharges
  creditCardSurchargeEnabled: boolean;
  creditCardSurchargePercent: number;  // 2.5%
  surchargeAppliesTo: PaymentMethod[];

  // Minimums
  minimumPaymentAmount: number;    // $10

  // Overpayment
  allowOverpayment: boolean;
  overpaymentAction: 'CREDIT_BALANCE' | 'REFUND' | 'ASK';

  // Partial Payments
  allowPartialPayments: boolean;

  // Allocation
  defaultAllocationMethod: 'OLDEST_FIRST' | 'NEWEST_FIRST' | 'MANUAL';

  // Withholding Tax (WHT)
  whtEnabled: boolean;             // Thailand, etc.
  whtDefaultRate: number;          // 3%
  whtRequiresCertificate: boolean;
}
```

### 8.3 Payment Allocation

```typescript
interface PaymentAllocation {
  id: string;
  paymentId: string;
  invoiceId: string;
  amount: number;

  // Auto or Manual
  allocationType: 'AUTO' | 'MANUAL';
  allocatedBy?: string;
  allocatedAt: Date;

  // Reversal
  reversedAt?: Date;
  reversedBy?: string;
  reversalReason?: string;
}

// Allocation Rules
interface AllocationRules {
  // Priority Order
  priorityOrder: ChargeCategory[];  // LATE_FEES, DUES, then others

  // Split Rules
  allowSplitAcrossInvoices: boolean;
  allowSplitWithinInvoice: boolean;

  // Restrictions
  requireFullInvoicePayment: boolean;
  applyToOldestFirst: boolean;
}
```

---

## 9. Credit Card Surcharges & Convenience Fees

### 9.1 Surcharge Configuration

Many clubs pass credit card processing fees to members. This section covers configuration for surcharges and convenience fees.

```typescript
interface CreditCardSurchargeConfig {
  clubId: string;

  // Enable/Disable
  surchargeEnabled: boolean;
  convenienceFeeEnabled: boolean;

  // Surcharge Settings (percentage of transaction)
  surchargeType: 'PERCENTAGE' | 'FIXED' | 'TIERED';
  surchargePercent?: number;         // 2.5% typical
  surchargeFixed?: number;           // $2.50 per transaction
  surchargeMinimum?: number;         // Minimum fee $1.00
  surchargeMaximum?: number;         // Cap at $50

  // Tiered Surcharges
  surchargeTiers?: SurchargeTier[];

  // Card Type Specific
  cardTypeSurcharges: {
    visa: number;                    // 2.3%
    mastercard: number;              // 2.3%
    amex: number;                    // 3.5%
    discover: number;                // 2.5%
    diners: number;                  // 3.0%
    jcb: number;                     // 3.0%
  };

  // Exemptions
  exemptMembershipTypes: string[];   // Honorary members exempt
  exemptPaymentTypes: string[];      // Dues payments exempt
  exemptAmountThreshold?: number;    // No surcharge under $10

  // Display
  showSurchargeOnInvoice: boolean;
  surchargeDescription: string;      // "Credit Card Processing Fee"
  surchargeGLCode: string;           // Accounting code

  // Auto-Pay
  applySurchargeToAutoPay: boolean;  // Often waived for auto-pay
  autoPaySurchargeDiscount?: number; // 50% off surcharge

  // Compliance
  disclosureText: string;            // Legal disclosure
  showDisclosureBeforePayment: boolean;
}

interface SurchargeTier {
  minAmount: number;
  maxAmount: number;
  surchargePercent: number;
  surchargeFixed?: number;
}
```

### 9.2 Surcharge Calculation Examples

| Transaction Amount | Surcharge Type | Rate | Surcharge | Total |
|-------------------|----------------|------|-----------|-------|
| $100 | Percentage | 2.5% | $2.50 | $102.50 |
| $500 | Percentage | 2.5% | $12.50 | $512.50 |
| $100 | Fixed | $2.50 | $2.50 | $102.50 |
| $500 | Fixed | $2.50 | $2.50 | $502.50 |
| $100 | Tiered | 3% < $200 | $3.00 | $103.00 |
| $500 | Tiered | 2.5% ≥ $200 | $12.50 | $512.50 |

### 9.3 Convenience Fee Configuration

```typescript
interface ConvenienceFeeConfig {
  // Per-Transaction Fees
  onlinePaymentFee: number;          // $2.00 for web payments
  phonePaymentFee: number;           // $3.00 for phone payments
  sameDay PaymentFee: number;        // $5.00 rush payment

  // Payment Method Fees
  achFee: number;                    // $0.50 for bank transfer
  eCheckFee: number;                 // $1.00 for e-check

  // Waiver Rules
  waiveForAutoPay: boolean;
  waiveForMemberTiers: string[];     // Gold+ members exempt
  waiveAboveAmount?: number;         // No fee for payments > $1000
}
```

### 9.4 Invoice Line Item for Surcharges

```typescript
// Surcharge appears as separate line item
interface SurchargeLineItem {
  type: 'CREDIT_CARD_SURCHARGE' | 'CONVENIENCE_FEE';
  description: string;               // "Credit Card Fee (2.5%)"
  amount: number;
  linkedPaymentId: string;           // Reference to payment

  // Breakdown
  baseAmount: number;                // Original payment amount
  surchargeRate: number;             // 2.5%
  cardType?: string;                 // "Visa"
}
```

---

## 10. Tax Configuration & Withholding Tax

### 10.1 Tax Configuration

```typescript
interface TaxConfig {
  clubId: string;

  // Default Tax Settings
  defaultTaxRate: number;            // 7% VAT
  taxCalculation: 'EXCLUSIVE' | 'INCLUSIVE';
  taxRoundingMethod: 'UP' | 'DOWN' | 'NEAREST';
  taxRoundingPrecision: number;      // 2 decimal places

  // Tax Types
  taxTypes: TaxType[];

  // Service Charge (common in clubs)
  serviceChargeEnabled: boolean;
  serviceChargeRate: number;         // 10%
  serviceChargeLabel: string;        // "Service Charge"
  serviceChargeIsTaxable: boolean;   // Tax on service charge
  serviceChargeDistribution?: ServiceChargeDistribution;

  // Tax Exemptions
  taxExemptMembershipTypes: string[];
  taxExemptChargeTypes: string[];
  taxExemptThreshold?: number;       // No tax under $X
}

interface TaxType {
  id: string;
  name: string;                      // "VAT", "Sales Tax", "GST"
  code: string;                      // "VAT7"
  rate: number;                      // 7%
  isDefault: boolean;
  isCompound: boolean;               // Tax on tax
  appliesTo: ChargeCategory[];       // Which categories
  glCode: string;                    // Accounting code
  taxAuthorityId?: string;
}

interface ServiceChargeDistribution {
  staffPool: number;                 // 80% to staff
  houseRetained: number;             // 20% to club
  distributionFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
}
```

### 10.2 Withholding Tax (WHT) Configuration

Withholding tax is common in Thailand, Singapore, and other countries where the payer withholds tax and remits to government.

```typescript
interface WithholdingTaxConfig {
  clubId: string;

  // Enable WHT
  whtEnabled: boolean;
  whtCountry: 'TH' | 'SG' | 'MY' | 'OTHER';

  // Default Rates by Country
  // Thailand: 3% for services, 1% for goods
  // Singapore: Various rates
  defaultWHTRate: number;            // 3%

  // WHT Categories
  whtCategories: WHTCategory[];

  // Certificate Requirements
  requireWHTCertificate: boolean;
  certificateUploadRequired: boolean;
  certificateVerificationRequired: boolean;
  certificateDueWithinDays: number;  // 7 days

  // Processing
  autoCreateWHTRecord: boolean;
  whtDeductFromPayment: boolean;     // Net payment = Gross - WHT
  whtReconciliationRequired: boolean;

  // Reporting
  monthlyWHTReport: boolean;
  annualWHTSummary: boolean;
  whtSubmissionDeadlineDay: number;  // 7th of following month
}

interface WHTCategory {
  id: string;
  code: string;                      // "40(8)" for Thailand services
  name: string;                      // "Professional Services"
  rate: number;                      // 3%
  appliesTo: ChargeCategory[];
  requiresFormType?: string;         // "PND 53" for Thailand
}
```

### 10.3 WHT Certificate Management

```typescript
interface WHTCertificate {
  id: string;
  clubId: string;
  memberId: string;

  // Certificate Details
  certificateNumber: string;
  certificateDate: Date;
  taxPeriod: string;                 // "2026-01" for January 2026

  // Amounts
  grossAmount: number;               // Before WHT
  whtRate: number;                   // 3%
  whtAmount: number;                 // Withheld amount
  netAmount: number;                 // Member paid this

  // Document
  documentUrl?: string;              // Uploaded certificate
  uploadedAt?: Date;
  uploadedBy?: string;

  // Verification
  status: WHTCertificateStatus;
  verifiedBy?: string;
  verifiedAt?: Date;
  verificationNotes?: string;

  // Linked Transactions
  paymentIds: string[];              // Payments this covers
  invoiceIds: string[];              // Invoices this covers

  // Submission
  submittedToAuthority: boolean;
  submissionDate?: Date;
  submissionReference?: string;
}

enum WHTCertificateStatus {
  PENDING = 'PENDING',               // Awaiting certificate
  RECEIVED = 'RECEIVED',             // Certificate uploaded
  VERIFIED = 'VERIFIED',             // Verified by staff
  REJECTED = 'REJECTED',             // Invalid certificate
  SUBMITTED = 'SUBMITTED',           // Sent to tax authority
}
```

### 10.4 WHT Dashboard & Tracking

```typescript
interface WHTDashboard {
  // Summary
  totalWHTCollected: number;
  totalCertificatesReceived: number;
  totalCertificatesPending: number;
  totalCertificatesOverdue: number;

  // By Period
  periodBreakdown: {
    period: string;                  // "2026-01"
    whtCollected: number;
    certificatesExpected: number;
    certificatesReceived: number;
    submitted: boolean;
    submissionDeadline: Date;
  }[];

  // Outstanding
  outstandingCertificates: {
    memberId: string;
    memberName: string;
    paymentDate: Date;
    grossAmount: number;
    whtAmount: number;
    daysSincePayment: number;
    remindersSent: number;
  }[];
}
```

### 10.5 Tax Invoice Requirements

```typescript
interface TaxInvoiceConfig {
  // Required Fields (varies by country)
  showTaxId: boolean;                // Club's tax ID
  showMemberTaxId: boolean;          // Member's tax ID
  taxIdLabel: string;                // "VAT Reg No" or "TIN"

  // Address Requirements
  requireFullAddress: boolean;
  requirePostalCode: boolean;

  // Line Item Requirements
  showTaxPerLine: boolean;           // Tax amount per item
  showTaxSummary: boolean;           // Total tax summary
  breakdownByTaxType: boolean;       // If multiple tax types

  // Invoice Numbering
  taxInvoicePrefix: string;          // "TAX-"
  sequentialNumbering: boolean;
  fiscalYearReset: boolean;

  // Document Requirements
  invoiceLanguage: string[];         // ["en", "th"]
  requireDigitalSignature: boolean;
  requireQRCode: boolean;            // E-invoice verification

  // Retention
  retentionYears: number;            // 7 years typical
}
```

---

## 11. Credit Management

### 11.1 Credit Limit Configuration

```typescript
interface CreditLimitConfig {
  clubId: string;

  // Default Limits by Membership Type
  defaultLimits: {
    membershipTypeId: string;
    limit: number;
  }[];

  // Tier Multipliers
  tierMultipliers: {
    tierId: string;
    multiplier: number;            // 1.5x for Gold
  }[];

  // Global Settings
  globalMaxLimit: number;          // $50,000 cap
  globalMinLimit: number;          // $500 minimum

  // Alerts
  alertThresholdPercent: number;   // 80%
  alertRecipients: string[];       // Email addresses

  // Blocking
  blockAtPercent: number;          // 100% = block at limit
  blockGracePeriodDays: number;    // 7 days grace

  // Exceptions
  allowOverrides: boolean;
  overrideRequiresApproval: boolean;
  overrideApproverRoles: string[];
}
```

### 9.2 Credit Limit Override

```typescript
interface CreditLimitOverride {
  id: string;
  memberId: string;

  // Amounts
  previousLimit: number;
  newLimit: number;

  // Reason
  reason: string;
  supportingDocuments?: string[];

  // Approval
  requestedBy: string;
  requestedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;

  // Validity
  effectiveFrom: Date;
  expiresAt?: Date;                // Temporary increase
  isActive: boolean;

  // Auto-Revert
  autoRevertEnabled: boolean;
  revertToLimit?: number;
}
```

### 9.3 Credit Balance Management

```typescript
interface CreditBalance {
  memberId: string;

  // Current Balance
  creditBalance: number;           // Positive = prepaid credit
  outstandingBalance: number;      // Positive = owes money

  // Net Position
  netBalance: number;              // credit - outstanding

  // Transactions
  transactions: CreditTransaction[];
}

interface CreditTransaction {
  id: string;
  memberId: string;

  type: 'CREDIT_ADD' | 'CREDIT_USE' | 'CHARGE' | 'PAYMENT' | 'ADJUSTMENT';
  amount: number;
  runningBalance: number;

  description: string;
  referenceType?: 'INVOICE' | 'PAYMENT' | 'ADJUSTMENT';
  referenceId?: string;

  createdBy: string;
  createdAt: Date;
}
```

---

## 12. Auto-Pay & Recurring Billing

### 10.1 Auto-Pay Configuration

```typescript
interface AutoPaySetting {
  id: string;
  memberId: string;
  paymentMethodId: string;

  // Enable/Disable
  isEnabled: boolean;

  // Schedule
  schedule: AutoPaySchedule;
  paymentDayOfMonth?: number;      // 1-28 for MONTHLY_FIXED

  // Limits
  maxPaymentAmount?: number;       // Per-payment cap
  monthlyMaxAmount?: number;       // Monthly total cap
  requireApprovalAbove?: number;   // Member confirms large payments

  // Filtering
  payDuesOnly: boolean;            // Only recurring dues
  excludeCategories: string[];     // Exclude charge types

  // Notifications
  notifyBeforePayment: boolean;
  notifyDaysBefore: number;        // 3 days
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;

  // Retry Logic
  maxRetryAttempts: number;        // 3
  retryIntervalDays: number;       // 3 days
}

enum AutoPaySchedule {
  INVOICE_DUE = 'INVOICE_DUE',           // When invoice is due
  STATEMENT_DATE = 'STATEMENT_DATE',     // Monthly statement date
  MONTHLY_FIXED = 'MONTHLY_FIXED',       // Fixed day each month
}
```

### 10.2 Stored Payment Methods

```typescript
interface StoredPaymentMethod {
  id: string;
  memberId: string;

  // Stripe Integration
  stripeCustomerId: string;        // cus_xxx
  stripePaymentMethodId: string;   // pm_xxx

  // Card Details (masked)
  type: 'CARD' | 'BANK_ACCOUNT';
  brand?: string;                  // Visa, Mastercard
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardholderName?: string;

  // Bank Account (if applicable)
  bankName?: string;
  accountType?: 'CHECKING' | 'SAVINGS';

  // Settings
  isDefault: boolean;
  isAutoPayEnabled: boolean;

  // Status
  status: StoredPaymentStatus;
  verifiedAt?: Date;
  lastUsedAt?: Date;

  // Failure Tracking
  failureCount: number;
  lastFailureReason?: string;
  lastFailureAt?: Date;
}

enum StoredPaymentStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED',
  REMOVED = 'REMOVED',
}
```

### 10.3 Auto-Pay Attempt Tracking

```typescript
interface AutoPayAttempt {
  id: string;
  memberId: string;
  paymentMethodId: string;
  invoiceId?: string;

  // Amount
  amount: number;

  // Attempt Info
  attemptNumber: number;           // 1, 2, 3
  scheduledAt: Date;
  processedAt?: Date;

  // Status
  status: AutoPayAttemptStatus;

  // Success
  succeededAt?: Date;
  paymentTransactionId?: string;   // Created payment record

  // Failure
  failedAt?: Date;
  failureCode?: string;            // Stripe error code
  failureMessage?: string;

  // Retry
  nextRetryAt?: Date;
  isManualRetry: boolean;

  // Stripe Details
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
}

enum AutoPayAttemptStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}
```

---

## 13. Accounts Receivable & Collections

### 11.1 AR Aging Buckets

| Bucket | Days Past Due | Risk Level | Action |
|--------|---------------|------------|--------|
| **Current** | 0 | Low | None |
| **30 Days** | 1-30 | Low | Reminder |
| **60 Days** | 31-60 | Medium | Phone call |
| **90 Days** | 61-90 | High | Warning letter |
| **91+ Days** | 91+ | Critical | Suspend/Terminate |

### 11.2 Collections Configuration

```typescript
interface CollectionsConfig {
  clubId: string;

  // Aging Buckets
  agingBuckets: AgingBucket[];

  // Automatic Actions
  autoReminders: boolean;
  autoSuspension: boolean;
  suspensionThresholdDays: number; // 91 days
  suspensionThresholdAmount?: number; // Or $1000+

  // Late Fees
  lateFeeEnabled: boolean;
  lateFeeStartDay: number;         // Day 31
  lateFeeType: 'FIXED' | 'PERCENTAGE';
  lateFeeAmount: number;
  lateFeeRecurring: boolean;       // Monthly late fee
  lateFeeMaximum?: number;

  // Interest
  interestEnabled: boolean;
  interestRate: number;            // 1.5% monthly
  interestCompounding: 'SIMPLE' | 'MONTHLY';
  interestStartDay: number;        // Day 31

  // Communications
  reminderSchedule: ReminderSchedule[];

  // Escalation
  escalationEnabled: boolean;
  escalationStages: EscalationStage[];

  // Write-Off
  writeOffThresholdDays: number;   // 365 days
  writeOffRequiresApproval: boolean;
  writeOffApproverRoles: string[];
}

interface AgingBucket {
  name: string;
  minDays: number;
  maxDays: number;
  color: string;                   // UI display
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface ReminderSchedule {
  daysFromDue: number;             // -7, 0, 7, 14, 30
  channel: 'EMAIL' | 'SMS' | 'LETTER';
  templateId: string;
  requiresApproval: boolean;
}

interface EscalationStage {
  stage: number;
  name: string;                    // "Collections Agency"
  daysOverdue: number;
  action: 'INTERNAL' | 'EXTERNAL_AGENCY' | 'LEGAL';
  agencyId?: string;
  notifyMember: boolean;
  notifyManagement: boolean;
}
```

### 11.3 AR Dashboard Metrics

```typescript
interface ARDashboardMetrics {
  // Summary
  totalOutstanding: number;
  totalMembers: number;
  averageBalance: number;

  // Aging Breakdown
  agingBreakdown: {
    bucket: string;
    amount: number;
    memberCount: number;
    percentOfTotal: number;
  }[];

  // KPIs
  dso: number;                     // Days Sales Outstanding
  collectionEffectiveness: number; // CEI percentage
  averageDaysDelinquent: number;   // ADD

  // Trends
  weekOverWeek: number;            // Change %
  monthOverMonth: number;
  yearOverYear: number;

  // At-Risk Accounts
  atRiskAccounts: {
    memberId: string;
    memberName: string;
    balance: number;
    daysOverdue: number;
    lastPaymentDate?: Date;
    lastContactDate?: Date;
  }[];
}
```

### 11.4 Collection Actions

| Action | Trigger | Description |
|--------|---------|-------------|
| **Send Reminder** | 7 days before due | Friendly payment reminder |
| **Past Due Notice** | 1 day after due | First overdue notice |
| **Phone Call** | 14 days overdue | Personal outreach |
| **Warning Letter** | 30 days overdue | Formal warning |
| **Suspension Notice** | 60 days overdue | Final warning before suspension |
| **Suspend Access** | 91 days overdue | Block facility access |
| **Termination Notice** | 120 days overdue | Membership termination warning |
| **Collections Referral** | 180 days overdue | External collections agency |
| **Legal Action** | 365 days overdue | Attorney referral |
| **Write-Off** | 365+ days | Bad debt write-off |

---

## 14. Minimum Spend Requirements

### 12.1 Minimum Spend Configuration

```typescript
interface MinimumSpendRequirement {
  id: string;
  clubId: string;
  name: string;

  // Scope
  membershipTypes: string[];       // Which types this applies to
  tiers?: string[];                // Optional tier filtering

  // Amount & Period
  minimumAmount: number;
  period: MinimumSpendPeriod;

  // Included Categories
  includeFoodBeverage: boolean;
  includeGolf: boolean;
  includeSpa: boolean;
  includeRetail: boolean;
  includeEvents: boolean;
  includedCategories?: string[];   // Specific charge types
  excludedCategories?: string[];   // Exclusions

  // Shortfall Handling
  defaultShortfallAction: ShortfallAction;
  gracePeriodDays: number;
  allowPartialCredit: boolean;     // Carry forward partial

  // Notifications
  notifyAtPercent: number[];       // [50, 75, 90]
  notifyDaysBeforeEnd: number[];   // [30, 14, 7]

  // Validity
  isActive: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
}

enum MinimumSpendPeriod {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
}

enum ShortfallAction {
  CHARGE_DIFFERENCE = 'CHARGE_DIFFERENCE',
  CARRY_FORWARD = 'CARRY_FORWARD',
  WAIVE = 'WAIVE',
  CREDIT_BALANCE = 'CREDIT_BALANCE',
}
```

### 12.2 Member Spend Tracking

```typescript
interface MemberMinimumSpend {
  id: string;
  memberId: string;
  requirementId: string;

  // Period
  periodStart: Date;
  periodEnd: Date;
  periodLabel: string;             // "Q1 2026"

  // Amounts
  requiredAmount: number;
  currentSpend: number;
  projectedSpend: number;
  shortfallAmount: number;
  carryForwardAmount: number;      // From previous period

  // Status
  status: MemberSpendStatus;

  // Exemption
  isExempt: boolean;
  exemptReason?: string;
  exemptBy?: string;
  exemptAt?: Date;

  // Resolution
  shortfallAction?: ShortfallAction;
  shortfallResolvedBy?: string;
  shortfallResolvedAt?: Date;
  shortfallNote?: string;
  shortfallInvoiceId?: string;

  // Breakdown
  spendByCategory: Record<string, number>;

  // Calculation
  lastCalculatedAt: Date;
}

enum MemberSpendStatus {
  ON_TRACK = 'ON_TRACK',
  AT_RISK = 'AT_RISK',
  MET = 'MET',
  SHORTFALL = 'SHORTFALL',
  EXEMPT = 'EXEMPT',
  PENDING_ACTION = 'PENDING_ACTION',
  RESOLVED = 'RESOLVED',
}
```

---

## 15. Sub-Accounts & Authorized Users

### 13.1 Sub-Account Configuration

```typescript
interface SubAccount {
  id: string;
  memberId: string;                // Parent member

  // Identity
  name: string;
  relationship: string;            // "Spouse", "Child", "Employee"
  email?: string;
  phone?: string;

  // Authentication
  pin: string;                     // Hashed 4-6 digit PIN
  pinAttempts: number;
  pinLockedUntil?: Date;

  // Validity
  status: SubAccountStatus;
  validFrom: Date;
  validUntil?: Date;

  // Permissions
  permissions: SubAccountPermission[];

  // Spending Limits
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  perTransactionLimit?: number;

  // Current Spend
  dailySpend: number;
  weeklySpend: number;
  monthlySpend: number;

  // Restrictions
  allowedOutlets?: string[];       // Specific outlets only
  blockedOutlets?: string[];
  allowedTimeStart?: string;       // "09:00"
  allowedTimeEnd?: string;         // "21:00"
}

enum SubAccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

enum SubAccountPermission {
  GOLF = 'GOLF',
  FOOD_BEVERAGE = 'FOOD_BEVERAGE',
  RETAIL = 'RETAIL',
  SPA = 'SPA',
  EVENTS = 'EVENTS',
  FITNESS = 'FITNESS',
  POOL = 'POOL',
  TENNIS = 'TENNIS',
  ALL = 'ALL',
}
```

### 13.2 Sub-Account Transaction

```typescript
interface SubAccountTransaction {
  id: string;
  subAccountId: string;

  // Transaction Details
  amount: number;
  description: string;
  category: SubAccountPermission;

  // References
  paymentTransactionId?: string;
  lineItemId?: string;
  teeTimeId?: string;

  // Verification
  verifiedAt: Date;
  verifiedBy: string;              // Staff who verified PIN

  // Location
  outletId: string;
  locationName: string;

  // Notes
  notes?: string;

  createdAt: Date;
}
```

---

## 16. Membership Applications

### 14.1 Application Workflow

```
┌───────────┐    ┌──────────────┐    ┌────────────────┐    ┌──────────┐
│ SUBMITTED │───►│ UNDER_REVIEW │───►│ PENDING_BOARD  │───►│ APPROVED │
└───────────┘    └──────────────┘    └────────────────┘    └────┬─────┘
                                              │                  │
                                              ▼                  ▼
                                         ┌──────────┐     ┌─────────────┐
                                         │ REJECTED │     │ CONVERTED   │
                                         └──────────┘     │ TO MEMBER   │
                                              ▲           └─────────────┘
                                              │
                                         ┌────────────┐
                                         │ WITHDRAWN  │
                                         └────────────┘
```

### 14.2 Application Configuration

```typescript
interface MembershipApplicationConfig {
  clubId: string;

  // Application Settings
  requireSponsor: boolean;
  sponsorCount: number;            // 1 or 2 sponsors
  requireSeconder: boolean;

  // Documents Required
  requiredDocuments: DocumentRequirement[];

  // Fees
  applicationFee: number;          // Non-refundable
  applicationFeeRefundable: boolean;

  // Review Process
  reviewStages: ReviewStage[];

  // Board Approval
  requiresBoardApproval: boolean;
  boardApprovalQuorum: number;     // Minimum votes

  // Waitlist
  waitlistEnabled: boolean;
  waitlistCapacity?: number;

  // Timeline
  reviewDeadlineDays: number;      // 30 days
  applicantNotificationEnabled: boolean;
}

interface DocumentRequirement {
  name: string;
  type: 'ID' | 'PHOTO' | 'REFERENCE' | 'FINANCIAL' | 'OTHER';
  required: boolean;
  description?: string;
}

interface ReviewStage {
  stage: number;
  name: string;                    // "Membership Committee"
  reviewerRoles: string[];
  requiresApproval: boolean;
  autoAdvance: boolean;            // Move to next stage automatically
}
```

### 14.3 Application Data Model

```typescript
interface MembershipApplication {
  id: string;
  clubId: string;

  // Applicant Info
  applicationNumber: string;       // APP-2026-00001
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Membership Requested
  membershipTypeId: string;
  membershipTierId?: string;

  // Sponsor
  sponsorId?: string;
  seconderId?: string;

  // Documents
  documents: ApplicationDocument[];

  // Status
  status: ApplicationStatus;
  submittedAt: Date;

  // Review
  currentStage: number;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;

  // Decision
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
  withdrawnAt?: Date;

  // Conversion
  convertedToMemberId?: string;
  convertedAt?: Date;
}

enum ApplicationStatus {
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  PENDING_BOARD = 'PENDING_BOARD',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}
```

---

## 17. Statements & Document Generation

### 17.1 Statement Configuration

```typescript
interface StatementConfig {
  clubId: string;

  // Schedule
  statementFrequency: 'WEEKLY' | 'MONTHLY';
  statementDayOfMonth: number;     // 1st of month
  statementCutoffDay: number;      // 25th (cutoff for current period)

  // Delivery
  deliveryMethod: 'EMAIL' | 'PAPER' | 'BOTH';
  emailTemplate: string;

  // Content
  showDetailedTransactions: boolean;
  showAgingBreakdown: boolean;
  showMinimumSpendProgress: boolean;
  showUpcomingCharges: boolean;
  showPaymentHistory: boolean;
  historyMonths: number;           // 3 months of history

  // Payment Link
  includePaymentLink: boolean;
  paymentLinkExpiresDays: number;  // 30 days

  // Reminders
  includeOutstandingReminder: boolean;
  reminderThreshold: number;       // Show if balance > $0
}
```

### 17.2 Communication Templates

| Template | Trigger | Channel |
|----------|---------|---------|
| **Welcome Email** | New member approved | Email |
| **Monthly Statement** | Statement date | Email/Paper |
| **Payment Reminder** | 7 days before due | Email |
| **Past Due Notice** | 1 day after due | Email |
| **Second Notice** | 14 days after due | Email |
| **Final Warning** | 30 days after due | Email + Paper |
| **Suspension Notice** | 60 days after due | Email + Paper |
| **Auto-Pay Success** | Payment processed | Email |
| **Auto-Pay Failed** | Payment failed | Email + SMS |
| **Card Expiring** | 30 days before expiry | Email |
| **Minimum Spend Alert** | Threshold reached | Email |
| **Renewal Reminder** | 60/30/7 days before | Email |

### 17.3 Communication Preferences

```typescript
interface MemberCommunicationPrefs {
  memberId: string;

  // Channels
  emailEnabled: boolean;
  smsEnabled: boolean;
  paperMailEnabled: boolean;
  pushNotificationsEnabled: boolean;

  // Categories
  billingNotifications: boolean;
  marketingEmails: boolean;
  eventInvitations: boolean;
  clubNews: boolean;

  // Frequency
  digestFrequency: 'IMMEDIATE' | 'DAILY' | 'WEEKLY';

  // Language
  preferredLanguage: string;

  // Do Not Disturb
  quietHoursStart?: string;        // "22:00"
  quietHoursEnd?: string;          // "08:00"
}
```

### 17.4 Document Generation Engine

```typescript
interface DocumentGenerationConfig {
  clubId: string;

  // PDF Generation
  pdfEngine: 'PUPPETEER' | 'REACT_PDF' | 'PRINCE';
  templateEngine: 'HANDLEBARS' | 'REACT' | 'MJML';

  // Branding
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  headerTemplate: string;
  footerTemplate: string;

  // Paper Settings
  paperSize: 'LETTER' | 'A4';
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

interface StatementBatchConfig {
  // Batch Processing
  batchSize: number;              // 100 statements per batch
  parallelBatches: number;        // 4 concurrent batches
  retryAttempts: number;          // 3 retries on failure

  // Scheduling
  generateTime: string;           // "02:00" (overnight)
  sendTime: string;               // "08:00" (morning delivery)

  // Grouping
  groupByMembershipType: boolean; // Separate batches by type
  prioritizeVIP: boolean;         // Process VIP members first
}
```

### 17.5 Statement Content Options

| Content Section | Description | Configurable |
|-----------------|-------------|--------------|
| **Header** | Club logo, statement date, member info | Template |
| **Account Summary** | Opening balance, charges, payments, closing | Always shown |
| **Transaction Detail** | Line-by-line charges and payments | Toggle |
| **Aging Summary** | Current, 30, 60, 90+ day breakdown | Toggle |
| **Minimum Spend** | Progress toward requirement | Toggle |
| **Payment Reminders** | Outstanding amount, due date | Toggle |
| **Upcoming Charges** | Scheduled recurring charges | Toggle |
| **Payment Methods** | Cards on file, auto-pay status | Toggle |
| **Credit Line** | Available credit, utilization | Toggle |
| **Recent Activity** | Last N months transaction history | Configurable |
| **Payment Stub** | Tear-off for mail payments | Paper only |
| **QR Code** | Quick pay link for mobile | Toggle |
| **Footer** | Club address, contact info, fine print | Template |

### 17.6 Document Archive & History

```typescript
interface DocumentArchive {
  memberId: string;
  documentType: 'STATEMENT' | 'INVOICE' | 'RECEIPT' | 'NOTICE' | 'LETTER' | 'CONTRACT';

  // Document Info
  documentId: string;
  generatedAt: DateTime;
  periodStart?: Date;
  periodEnd?: Date;

  // Storage
  pdfUrl: string;                 // S3/GCS URL
  thumbnailUrl?: string;
  fileSizeBytes: number;
  pageCount: number;

  // Delivery
  deliveryMethod: 'EMAIL' | 'PAPER' | 'PORTAL';
  deliveredAt?: DateTime;
  emailOpenedAt?: DateTime;
  portalViewedAt?: DateTime;

  // Retention
  retentionYears: number;         // 7 years default
  expiresAt: DateTime;
  archived: boolean;
}

interface DocumentRetentionPolicy {
  documentType: string;
  retentionYears: number;
  archiveAfterYears: number;      // Move to cold storage
  deleteAfterYears: number;
}
```

### 17.7 Document Types

| Document | Description | Generation Trigger |
|----------|-------------|-------------------|
| **Monthly Statement** | Comprehensive account summary | Monthly schedule |
| **Invoice** | Individual charge or dues invoice | On charge creation |
| **Receipt** | Payment confirmation | On payment |
| **Past Due Notice** | Collections letter, aging 1-4 | Collections workflow |
| **Suspension Notice** | Account suspension letter | Status change |
| **Welcome Letter** | New member welcome package | Approval |
| **Renewal Notice** | Annual membership renewal | 60 days before |
| **Termination Letter** | Membership termination | Status change |
| **Credit Limit Change** | Notification of credit adjustment | On change |
| **Contract** | Membership agreement PDF | Application approval |
| **Tax Receipt** | Annual dues paid for tax purposes | Year-end |

---

## 18. Marketing & Email Campaign Integration

### 18.1 Batch Email Manager Integration

```typescript
interface EmailCampaignConfig {
  clubId: string;

  // Email Service Provider
  provider: 'SENDGRID' | 'MAILCHIMP' | 'POSTMARK' | 'SES' | 'RESEND';
  apiKey: string;

  // Sender Configuration
  defaultFromEmail: string;       // "membership@royalclub.com"
  defaultFromName: string;        // "Royal Club Membership"
  replyToEmail: string;

  // Domain Settings
  sendingDomain: string;          // Verified domain
  trackingDomain?: string;        // Custom tracking domain

  // Rate Limiting
  maxEmailsPerHour: number;       // 5000
  maxEmailsPerDay: number;        // 50000

  // Batch Processing
  batchSize: number;              // 500 per batch
  delayBetweenBatches: number;    // 1000ms
}
```

### 18.2 Campaign Types

| Campaign Type | Purpose | Trigger |
|---------------|---------|---------|
| **Transactional** | Statements, receipts, notices | System events |
| **Promotional** | Events, offers, club news | Manual/scheduled |
| **Renewal** | Membership renewal campaigns | Before expiry |
| **Re-engagement** | Win back inactive members | Inactivity threshold |
| **Welcome Series** | Onboarding new members | New member approval |
| **Collections** | Past due reminders | AR workflow |
| **Survey/Feedback** | Member satisfaction surveys | After events/visits |
| **Anniversary** | Member anniversary celebration | Annual date |
| **Birthday** | Birthday greetings | Member birthdate |

### 18.3 Audience Segmentation

```typescript
interface MemberSegment {
  segmentId: string;
  name: string;
  description: string;

  // Dynamic Criteria
  criteria: SegmentCriteria[];
  logic: 'AND' | 'OR';

  // Membership Filters
  membershipTypes?: string[];
  membershipTiers?: string[];
  memberStatuses?: MemberStatus[];

  // Demographic Filters
  ageRange?: { min: number; max: number };
  gender?: string[];
  joinDateRange?: { start: Date; end: Date };

  // Financial Filters
  creditBalanceRange?: { min: number; max: number };
  minimumSpendAttainment?: { operator: 'GT' | 'LT' | 'EQ'; value: number };
  arStatus?: 'CURRENT' | 'PAST_DUE' | 'SUSPENDED';

  // Engagement Filters
  lastVisitRange?: { start: Date; end: Date };
  facilityUsage?: string[];       // Golf, Tennis, Pool, etc.
  eventAttendance?: number;       // Min events attended

  // Communication Preferences
  emailOptIn: boolean;
  smsOptIn?: boolean;

  // Calculated
  memberCount: number;
  lastUpdated: DateTime;
}

interface SegmentCriteria {
  field: string;                  // "membershipType", "age", "lastVisit"
  operator: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS' | 'GT' | 'LT' | 'BETWEEN' | 'IN' | 'NOT_IN';
  value: any;
}
```

### 18.4 Pre-Built Segments

| Segment | Criteria | Use Case |
|---------|----------|----------|
| **All Active Members** | Status = ACTIVE | General announcements |
| **New Members (90 days)** | Join date within 90 days | Onboarding campaigns |
| **Renewing Soon** | Renewal within 60 days | Renewal reminders |
| **Lapsed Members** | Status = RESIGNED, < 2 years | Win-back campaigns |
| **VIP Members** | Tier = PLATINUM or GOLD | Exclusive offers |
| **Past Due** | AR status = PAST_DUE | Collections |
| **High Spenders** | Monthly spend > threshold | Premium offers |
| **Inactive (90 days)** | No facility visits 90 days | Re-engagement |
| **Golf Members** | Membership type includes golf | Golf events/offers |
| **Auto-Pay Enabled** | Has active auto-pay | Billing communications |
| **Expiring Cards** | Card expires within 30 days | Payment update request |

### 18.5 Campaign Builder

```typescript
interface EmailCampaign {
  campaignId: string;
  clubId: string;

  // Campaign Info
  name: string;
  description: string;
  type: 'PROMOTIONAL' | 'TRANSACTIONAL' | 'AUTOMATED';
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'CANCELLED';

  // Audience
  segmentIds: string[];           // Target segments
  excludeSegmentIds: string[];    // Exclusion segments
  estimatedRecipients: number;

  // Content
  subject: string;
  previewText: string;
  templateId: string;
  templateVariables: Record<string, any>;

  // Personalization
  mergeFields: string[];          // {first_name}, {member_number}
  dynamicContent: DynamicContentBlock[];

  // Scheduling
  scheduledAt?: DateTime;
  timezone: string;

  // Sending Options
  trackOpens: boolean;
  trackClicks: boolean;
  useCustomTrackingDomain: boolean;

  // A/B Testing
  abTest?: {
    enabled: boolean;
    variants: CampaignVariant[];
    winnerCriteria: 'OPEN_RATE' | 'CLICK_RATE' | 'CONVERSION';
    testDuration: number;         // Hours
    testPercentage: number;       // % to test before sending winner
  };

  // Created/Modified
  createdBy: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface DynamicContentBlock {
  blockId: string;
  segmentId: string;              // Show this content to this segment
  content: string;                // HTML content
}
```

### 18.6 Email Templates

```typescript
interface EmailTemplate {
  templateId: string;
  clubId: string;

  // Template Info
  name: string;
  category: 'BILLING' | 'MARKETING' | 'TRANSACTIONAL' | 'SYSTEM';
  description: string;

  // Content
  subject: string;
  htmlContent: string;
  textContent: string;            // Plain text fallback

  // Design
  templateEngine: 'MJML' | 'HTML' | 'REACT_EMAIL';
  baseTemplateId?: string;        // Inherits from master template

  // Variables
  availableVariables: TemplateVariable[];

  // Preview
  previewData: Record<string, any>;
  thumbnailUrl: string;

  // Status
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  version: number;

  // Metadata
  createdBy: string;
  createdAt: DateTime;
  updatedAt: DateTime;
}

interface TemplateVariable {
  name: string;                   // "member.firstName"
  displayName: string;            // "First Name"
  type: 'STRING' | 'NUMBER' | 'DATE' | 'CURRENCY' | 'URL';
  required: boolean;
  defaultValue?: any;
  exampleValue: any;
}
```

### 18.7 Campaign Analytics & Tracking

```typescript
interface CampaignAnalytics {
  campaignId: string;

  // Delivery Metrics
  sent: number;
  delivered: number;
  bounced: number;
  bounceRate: number;

  // Engagement Metrics
  opened: number;
  openRate: number;
  uniqueOpens: number;

  clicked: number;
  clickRate: number;
  uniqueClicks: number;
  clickToOpenRate: number;

  // Link Breakdown
  linkClicks: {
    url: string;
    clicks: number;
    uniqueClicks: number;
  }[];

  // Negative Metrics
  unsubscribed: number;
  unsubscribeRate: number;
  spamComplaints: number;
  spamRate: number;

  // Conversion
  conversions?: number;
  conversionRate?: number;
  revenue?: number;

  // Timing
  sentAt: DateTime;
  lastUpdated: DateTime;

  // Device/Client
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  clientBreakdown: {
    client: string;              // "Gmail", "Apple Mail", etc.
    count: number;
  }[];
}
```

### 18.8 Automation Workflows

```typescript
interface AutomationWorkflow {
  workflowId: string;
  clubId: string;

  name: string;
  description: string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED';

  // Trigger
  trigger: AutomationTrigger;

  // Steps
  steps: AutomationStep[];

  // Exit Conditions
  exitConditions: ExitCondition[];

  // Performance
  totalEnrolled: number;
  currentlyActive: number;
  completed: number;

  createdAt: DateTime;
  updatedAt: DateTime;
}

interface AutomationTrigger {
  type: 'MEMBER_CREATED' | 'STATUS_CHANGE' | 'PAYMENT_RECEIVED' |
        'PAYMENT_FAILED' | 'RENEWAL_DUE' | 'BIRTHDAY' | 'ANNIVERSARY' |
        'SEGMENT_ENTERED' | 'SEGMENT_EXITED' | 'INACTIVITY' | 'CUSTOM_EVENT';

  conditions?: TriggerCondition[];
  delay?: number;                 // Minutes after trigger
}

interface AutomationStep {
  stepId: string;
  order: number;
  type: 'SEND_EMAIL' | 'WAIT' | 'CONDITION' | 'UPDATE_MEMBER' | 'ADD_TAG' | 'REMOVE_TAG' | 'NOTIFY_STAFF';

  // Email Step
  templateId?: string;
  subject?: string;

  // Wait Step
  waitDuration?: number;
  waitUnit?: 'MINUTES' | 'HOURS' | 'DAYS';
  waitUntilTime?: string;        // "09:00"

  // Condition Step (branching)
  condition?: {
    field: string;
    operator: string;
    value: any;
    trueStepId: string;
    falseStepId: string;
  };
}
```

### 18.9 Pre-Built Automation Workflows

| Workflow | Trigger | Steps |
|----------|---------|-------|
| **Welcome Series** | New member approved | Day 0: Welcome → Day 3: Getting Started → Day 7: Benefits Overview → Day 14: First Visit Tips |
| **Renewal Reminder** | 60 days before renewal | Day -60: First notice → Day -30: Reminder → Day -14: Urgent → Day -7: Final |
| **Payment Failed** | Auto-pay failure | Immediate: Alert → Day 3: Retry notice → Day 7: Update payment request |
| **Re-engagement** | 90 days inactive | Day 0: Miss you → Day 14: Special offer → Day 30: Final outreach |
| **Birthday** | Member birthday | Day of: Birthday greeting email |
| **Anniversary** | Membership anniversary | Day of: Thank you + special offer |
| **Collections** | Invoice past due | Day 1: Reminder → Day 14: Second notice → Day 30: Final warning |
| **Card Expiring** | Card expires in 30 days | Day -30: Notice → Day -14: Reminder → Day -7: Urgent |

### 18.10 Compliance & Unsubscribe Management

```typescript
interface EmailComplianceConfig {
  clubId: string;

  // Unsubscribe Handling
  unsubscribeUrl: string;
  unsubscribePageTemplate: string;

  // Required Footer Content
  includePhysicalAddress: boolean;
  physicalAddress: string;

  // Opt-in Settings
  doubleOptIn: boolean;
  optInConfirmationTemplate: string;

  // Categories for Preferences
  unsubscribeCategories: {
    id: string;
    name: string;                 // "Marketing", "Events", "Billing"
    description: string;
    required: boolean;            // Cannot unsubscribe (transactional)
  }[];

  // Suppression Lists
  globalSuppressionEnabled: boolean;
  honorGlobalUnsubscribes: boolean;

  // Data Retention
  trackingDataRetentionDays: number;  // 365

  // Compliance Standards
  gdprCompliant: boolean;
  canSpamCompliant: boolean;
  caslCompliant: boolean;
}
```

---

## 19. Reporting & Analytics

### 19.1 Standard Reports

| Report | Description | Frequency |
|--------|-------------|-----------|
| **Member Census** | Total members by type, tier, status | Monthly |
| **Dues Revenue** | Dues collected vs expected | Monthly |
| **AR Aging** | Outstanding balances by bucket | Weekly |
| **Collections Activity** | Actions taken, results | Weekly |
| **Membership Sales** | New members, revenue | Monthly |
| **Attrition Report** | Resignations, terminations | Monthly |
| **Credit Utilization** | Credit usage vs limits | Monthly |
| **Auto-Pay Summary** | Success/failure rates | Monthly |
| **Minimum Spend Compliance** | Members meeting requirements | Quarterly |
| **Payment Method Distribution** | Payments by method | Monthly |

### 19.2 Key Performance Indicators

```typescript
interface MembershipKPIs {
  // Membership Health
  totalActiveMembers: number;
  netMemberChange: number;         // Joins - Exits
  retentionRate: number;           // % retained YoY
  attritionRate: number;           // % lost

  // Financial
  totalDuesRevenue: number;
  averageRevenuePerMember: number;
  duesCollectionRate: number;      // % collected on time

  // AR
  totalOutstanding: number;
  dso: number;                     // Days Sales Outstanding
  overdue91PlusAmount: number;
  badDebtWriteOff: number;

  // Auto-Pay
  autoPayEnrollmentRate: number;   // % members enrolled
  autoPaySuccessRate: number;      // % successful charges

  // Engagement
  averageMinimumSpendAttainment: number;
  facilityUtilizationRate: number;
}
```

### 19.3 Dashboard Widgets

| Widget | Metrics | Visualization |
|--------|---------|---------------|
| **Member Count** | Total, by type, by status | Number cards |
| **AR Aging Chart** | Buckets, amounts, trends | Stacked bar |
| **Revenue Trend** | Monthly dues, other revenue | Line chart |
| **Collection Funnel** | Outstanding → Collected | Funnel |
| **Membership Pipeline** | Applications by stage | Pipeline |
| **Payment Methods** | Distribution by method | Pie chart |
| **Credit Utilization** | Members near limit | Gauge |
| **Attrition Trend** | Monthly exits, reasons | Line + bar |

---

## 20. Implementation Priority Matrix

### Phase 1: Core Membership (Critical)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Member CRUD | Critical | Low |
| Membership types | Critical | Low |
| Member status management | Critical | Medium |
| Basic invoicing | Critical | Medium |
| Payment recording | Critical | Medium |
| Member directory/search | Critical | Low |

### Phase 2: Financial Operations (High)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Credit management | High | Medium |
| AR aging tracking | High | Medium |
| Payment allocation | High | Medium |
| Late fee automation | High | Low |
| Member statements | High | Medium |
| Collections workflow | High | High |

### Phase 3: Advanced Billing (Medium-High)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Auto-pay (Stripe) | High | High |
| Stored payment methods | High | High |
| Recurring billing automation | Medium | High |
| Minimum spend tracking | Medium | Medium |
| Multi-currency support | Medium | Medium |

### Phase 4: Family & Sub-Accounts (Medium)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Household management | Medium | Medium |
| Dependent management | Medium | Medium |
| Sub-accounts with PIN | Medium | High |
| Spending limits | Medium | Medium |
| Age-out automation | Low | Medium |

### Phase 5: Applications & Advanced (Low-Medium)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Membership applications | Medium | High |
| Board approval workflow | Low | High |
| Tier benefits engine | Medium | Medium |
| Advanced analytics | Low | Medium |
| Write-off management | Low | Low |

---

## Sources

This document incorporates industry research from:

- [WildApricot](https://www.wildapricot.com/blog/club-management-software) - Club management software features
- [Clubessential](https://www.clubessential.com/club-management-software/) - Private club management
- [Cobalt Software](https://www.mycobaltsoftware.com/) - Country club software
- [Bill.com](https://www.bill.com/blog/accounts-receivable-best-practices) - AR best practices
- [Upflow](https://upflow.io/blog/ar-collections/accounts-receivable-management) - AR management
- [JP Morgan](https://www.jpmorgan.com/insights/treasury/receivables/accounts-receivable-management) - AR management guide
- [Invensis](https://www.invensis.net/blog/accounts-receivable-management-best-practices) - AR best practices 2025
- [Alpine Country Club](https://www.alpinecc.com/membership/membership-categories) - Membership categories
- [Columbus Country Club](https://www.columbuscc.com/membership/membership-categories) - Membership types
- [Neon One](https://neonone.com/resources/blog/membership-dues/) - Membership dues guide
- [MemberClicks](https://memberclicks.com/blog/membership-dues/) - Dues management
