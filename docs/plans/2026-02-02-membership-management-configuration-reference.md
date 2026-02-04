# Membership Management Configuration Reference

**Date:** 2026-02-02
**Purpose:** Comprehensive reference of all membership management configuration options for club operations

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Membership Types & Categories](#2-membership-types--categories)
3. [Membership Tiers & Benefits](#3-membership-tiers--benefits)
4. [Member Lifecycle Management](#4-member-lifecycle-management)
5. [Family & Household Management](#5-family--household-management)
6. [Membership Applications](#6-membership-applications)
7. [Prospect Management & Lead Nurturing](#7-prospect-management--lead-nurturing)
8. [Content Management System](#8-content-management-system)
9. [Marketing & Campaign Automation](#9-marketing--campaign-automation)
10. [Social Media & Digital Presence](#10-social-media--digital-presence)
11. [Implementation Priority Matrix](#11-implementation-priority-matrix)

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
| Member | Primary account holder | Household, MembershipType, Tier |
| MembershipType | Category (Individual, Family, Corporate) | Tiers, Members |
| MembershipTier | Sub-level (Gold, Silver, Bronze) | MembershipType, Benefits |
| Household | Family grouping | Members, Dependents |
| Application | Prospective member request | Sponsors, Documents |

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

  // Financial (linked to AR)
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

## 6. Membership Applications

### 6.1 Application Workflow

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

### 6.2 Application Configuration

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

### 6.3 Application Data Model

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

## 7. Prospect Management & Lead Nurturing

### 7.1 Prospect Pipeline Configuration

```typescript
interface ProspectPipelineConfig {
  clubId: string;

  // Pipeline Stages
  stages: ProspectStage[];

  // Lead Sources
  leadSources: LeadSource[];

  // Scoring
  leadScoringEnabled: boolean;
  scoringRules: LeadScoringRule[];

  // Assignment
  autoAssignEnabled: boolean;
  assignmentRules: AssignmentRule[];
  roundRobinEnabled: boolean;

  // SLA
  responseTimeTarget: number;      // Hours to first contact
  followUpFrequency: number;       // Days between touches
}

interface ProspectStage {
  id: string;
  name: string;                    // "New Lead", "Contacted", "Tour Scheduled"
  order: number;
  color: string;

  // Automation
  autoAdvanceAfterDays?: number;
  autoAdvanceToStage?: string;
  sendEmailOnEntry?: string;       // Template ID
  createTaskOnEntry?: boolean;
  taskAssignee?: string;

  // Exit Criteria
  conversionStage: boolean;        // Converts to Application
  lostStage: boolean;              // Mark as lost
}

enum LeadSource {
  WEBSITE_INQUIRY = 'WEBSITE_INQUIRY',
  REFERRAL = 'REFERRAL',
  EVENT = 'EVENT',
  ADVERTISEMENT = 'ADVERTISEMENT',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  WALK_IN = 'WALK_IN',
  PHONE_CALL = 'PHONE_CALL',
  PARTNER = 'PARTNER',
  REAL_ESTATE = 'REAL_ESTATE',
  CORPORATE = 'CORPORATE',
  OTHER = 'OTHER',
}
```

### 7.2 Prospect Data Model

```typescript
interface Prospect {
  id: string;
  clubId: string;

  // Identity
  prospectNumber: string;          // PRO-2026-00001
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mobilePhone?: string;

  // Demographics
  dateOfBirth?: Date;
  occupation?: string;
  company?: string;
  income?: string;                 // Range bracket

  // Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;

  // Source
  source: LeadSource;
  sourceDetail?: string;           // "Google Ads Campaign Q1"
  referredBy?: string;             // Member ID if referral
  campaignId?: string;             // Marketing campaign

  // Interest
  membershipTypeInterest?: string[];
  facilitiesInterest?: string[];   // Golf, Tennis, Pool
  budgetRange?: string;
  timeframe?: string;              // "Immediate", "3-6 months"

  // Pipeline
  currentStage: string;
  stageEnteredAt: Date;
  assignedTo?: string;             // Staff ID

  // Scoring
  leadScore: number;               // 0-100
  scoreBreakdown: ScoreComponent[];
  qualificationStatus: 'UNQUALIFIED' | 'MQL' | 'SQL' | 'OPPORTUNITY';

  // Engagement
  lastContactedAt?: Date;
  lastContactMethod?: string;
  nextFollowUpAt?: Date;
  totalTouchpoints: number;

  // Tours
  tourScheduledAt?: Date;
  tourCompletedAt?: Date;
  tourNotes?: string;
  tourGuide?: string;

  // Outcome
  status: ProspectStatus;
  convertedToApplicationId?: string;
  lostReason?: string;
  lostAt?: Date;

  // Notes
  notes: ProspectNote[];
  tags: string[];

  // Audit
  createdAt: Date;
  updatedAt: Date;
}

enum ProspectStatus {
  ACTIVE = 'ACTIVE',
  NURTURING = 'NURTURING',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST',
  DISQUALIFIED = 'DISQUALIFIED',
}

interface ScoreComponent {
  factor: string;                  // "Email Opens", "Tour Completed"
  points: number;
  reason: string;
}

interface ProspectNote {
  id: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  type: 'CALL' | 'EMAIL' | 'MEETING' | 'TOUR' | 'NOTE';
}
```

### 7.3 Lead Scoring Rules

```typescript
interface LeadScoringRule {
  id: string;
  name: string;
  category: 'DEMOGRAPHIC' | 'BEHAVIORAL' | 'ENGAGEMENT' | 'FIT';

  // Condition
  condition: {
    field: string;
    operator: 'EQUALS' | 'CONTAINS' | 'GT' | 'LT' | 'IN' | 'EXISTS';
    value: any;
  };

  // Score Impact
  points: number;                  // +10, -5, etc.
  maxPoints?: number;              // Cap for repeating actions

  // Active
  isActive: boolean;
}

// Default Scoring Rules
const defaultScoringRules: LeadScoringRule[] = [
  // Demographic Fit
  { name: 'Local Resident', category: 'DEMOGRAPHIC', points: 15 },
  { name: 'Income Match', category: 'DEMOGRAPHIC', points: 20 },
  { name: 'Referred by Member', category: 'DEMOGRAPHIC', points: 25 },

  // Behavioral
  { name: 'Tour Completed', category: 'BEHAVIORAL', points: 30 },
  { name: 'Pricing Requested', category: 'BEHAVIORAL', points: 20 },
  { name: 'Application Started', category: 'BEHAVIORAL', points: 25 },

  // Engagement
  { name: 'Email Opened', category: 'ENGAGEMENT', points: 2, maxPoints: 10 },
  { name: 'Link Clicked', category: 'ENGAGEMENT', points: 5, maxPoints: 15 },
  { name: 'Website Visit', category: 'ENGAGEMENT', points: 3, maxPoints: 15 },
  { name: 'Event Attended', category: 'ENGAGEMENT', points: 15 },

  // Negative Signals
  { name: 'Email Bounced', category: 'ENGAGEMENT', points: -10 },
  { name: 'Unsubscribed', category: 'ENGAGEMENT', points: -25 },
  { name: 'No Response 30 Days', category: 'ENGAGEMENT', points: -15 },
];
```

### 7.4 Automated Nurture Sequences

```typescript
interface NurtureSequence {
  id: string;
  name: string;                    // "New Lead Welcome Series"
  description: string;

  // Trigger
  trigger: SequenceTrigger;

  // Target
  targetSegment?: string;          // Segment ID
  targetStages?: string[];         // Pipeline stages

  // Steps
  steps: NurtureStep[];

  // Settings
  businessHoursOnly: boolean;
  timezone: string;
  maxEnrollments?: number;

  // Exit Conditions
  exitOnReply: boolean;
  exitOnConversion: boolean;
  exitOnUnsubscribe: boolean;
  exitStages?: string[];           // Exit when moves to these stages

  // Status
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED';

  // Analytics
  totalEnrolled: number;
  currentlyActive: number;
  completed: number;
  converted: number;
}

interface SequenceTrigger {
  type: 'STAGE_ENTERED' | 'LEAD_CREATED' | 'FORM_SUBMITTED' |
        'EVENT_ATTENDED' | 'TOUR_SCHEDULED' | 'MANUAL';
  conditions?: Record<string, any>;
}

interface NurtureStep {
  stepNumber: number;
  type: 'EMAIL' | 'SMS' | 'TASK' | 'WAIT' | 'CONDITION';

  // Delay
  delayDays: number;
  delayHours?: number;

  // Email Step
  emailTemplateId?: string;
  emailSubject?: string;

  // SMS Step
  smsTemplateId?: string;

  // Task Step
  taskTitle?: string;
  taskAssignee?: string;
  taskDueDays?: number;

  // Condition Step (branching)
  condition?: {
    field: string;
    operator: string;
    value: any;
    trueNextStep: number;
    falseNextStep: number;
  };
}
```

### 7.5 Pre-Built Nurture Sequences

| Sequence | Trigger | Duration | Steps |
|----------|---------|----------|-------|
| **New Lead Welcome** | Lead created | 14 days | Email (Day 0) → Wait 3 days → Email (Day 3) → Wait 4 days → Task: Call → Email (Day 10) |
| **Tour Follow-Up** | Tour completed | 21 days | Email thank you (Day 0) → Wait 3 days → Email benefits → Wait 7 days → Task: Call → Email special offer |
| **Re-Engagement** | No activity 30 days | 30 days | Email "Miss You" → Wait 7 days → Email exclusive offer → Wait 14 days → Final email |
| **Event Attendee** | Event attended | 14 days | Email thank you → Wait 2 days → Email membership info → Wait 5 days → Task: Follow-up call |
| **Referral Lead** | Referral source | 7 days | Email warm intro → Wait 1 day → Task: Personal call → Wait 3 days → Email tour invite |

### 7.6 Prospect Activity Tracking

```typescript
interface ProspectActivity {
  id: string;
  prospectId: string;

  // Activity Type
  type: ActivityType;
  channel: 'EMAIL' | 'WEB' | 'PHONE' | 'IN_PERSON' | 'SMS' | 'SOCIAL';

  // Details
  description: string;
  metadata: Record<string, any>;

  // Reference
  campaignId?: string;
  emailId?: string;
  contentId?: string;
  eventId?: string;

  // Attribution
  source?: string;
  medium?: string;
  utmCampaign?: string;

  // Engagement
  engagementScore: number;

  // Timestamp
  occurredAt: Date;
}

enum ActivityType {
  // Email
  EMAIL_SENT = 'EMAIL_SENT',
  EMAIL_OPENED = 'EMAIL_OPENED',
  EMAIL_CLICKED = 'EMAIL_CLICKED',
  EMAIL_REPLIED = 'EMAIL_REPLIED',
  EMAIL_BOUNCED = 'EMAIL_BOUNCED',
  EMAIL_UNSUBSCRIBED = 'EMAIL_UNSUBSCRIBED',

  // Web
  PAGE_VIEWED = 'PAGE_VIEWED',
  FORM_SUBMITTED = 'FORM_SUBMITTED',
  CONTENT_DOWNLOADED = 'CONTENT_DOWNLOADED',
  VIDEO_WATCHED = 'VIDEO_WATCHED',

  // Phone
  CALL_MADE = 'CALL_MADE',
  CALL_RECEIVED = 'CALL_RECEIVED',
  VOICEMAIL_LEFT = 'VOICEMAIL_LEFT',

  // In-Person
  TOUR_SCHEDULED = 'TOUR_SCHEDULED',
  TOUR_COMPLETED = 'TOUR_COMPLETED',
  TOUR_CANCELLED = 'TOUR_CANCELLED',
  EVENT_REGISTERED = 'EVENT_REGISTERED',
  EVENT_ATTENDED = 'EVENT_ATTENDED',

  // Pipeline
  STAGE_CHANGED = 'STAGE_CHANGED',
  ASSIGNED = 'ASSIGNED',
  NOTE_ADDED = 'NOTE_ADDED',
  TASK_CREATED = 'TASK_CREATED',
  TASK_COMPLETED = 'TASK_COMPLETED',
}
```

---

## 8. Content Management System

### 8.1 Content Management Overview

A digital agency-style CMS for managing all club communications including articles, newsletters, blogs, and social media content.

```typescript
interface CMSConfig {
  clubId: string;

  // Content Types
  enabledContentTypes: ContentType[];

  // Publishing
  requireApproval: boolean;
  approverRoles: string[];
  schedulingEnabled: boolean;

  // Media
  mediaStorageProvider: 'S3' | 'CLOUDINARY' | 'GCS';
  maxMediaSizeMB: number;
  allowedMediaTypes: string[];     // ['image/jpeg', 'image/png', 'video/mp4']

  // SEO
  seoEnabled: boolean;
  defaultOgImage: string;
  siteName: string;

  // Analytics
  trackingEnabled: boolean;
  googleAnalyticsId?: string;
}

enum ContentType {
  ARTICLE = 'ARTICLE',
  NEWSLETTER = 'NEWSLETTER',
  BLOG_POST = 'BLOG_POST',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
  EVENT_RECAP = 'EVENT_RECAP',
  MEMBER_SPOTLIGHT = 'MEMBER_SPOTLIGHT',
  COURSE_UPDATE = 'COURSE_UPDATE',
  MENU_UPDATE = 'MENU_UPDATE',
  PRESS_RELEASE = 'PRESS_RELEASE',
}
```

### 8.2 Content Data Model

```typescript
interface Content {
  id: string;
  clubId: string;

  // Identity
  contentType: ContentType;
  title: string;
  slug: string;                    // URL-friendly identifier
  excerpt?: string;                // Short summary

  // Content
  body: string;                    // Rich text / Markdown / HTML
  bodyFormat: 'MARKDOWN' | 'HTML' | 'RICH_TEXT';

  // Media
  featuredImage?: MediaAsset;
  gallery?: MediaAsset[];
  attachments?: MediaAsset[];

  // Categorization
  categories: string[];
  tags: string[];

  // Author
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  byline?: string;                 // "By John Smith, Golf Pro"

  // Publishing
  status: ContentStatus;
  visibility: 'PUBLIC' | 'MEMBERS_ONLY' | 'SPECIFIC_TIERS';
  allowedTiers?: string[];
  publishedAt?: Date;
  scheduledAt?: Date;
  expiresAt?: Date;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;

  // Engagement
  viewCount: number;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  commentsEnabled: boolean;

  // Related
  relatedContentIds?: string[];

  // Audit
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
  publishedBy?: string;
}

enum ContentStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  SCHEDULED = 'SCHEDULED',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

interface MediaAsset {
  id: string;
  url: string;
  thumbnailUrl?: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO';
  mimeType: string;
  filename: string;
  fileSize: number;
  width?: number;
  height?: number;
  duration?: number;               // For video/audio
  altText?: string;
  caption?: string;
}
```

### 8.3 Newsletter Management

```typescript
interface Newsletter {
  id: string;
  clubId: string;

  // Identity
  name: string;                    // "Weekly Update"
  description: string;
  frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

  // Template
  templateId: string;
  headerImage?: string;
  footerContent?: string;

  // Sections
  sections: NewsletterSection[];

  // Scheduling
  scheduledSendDay?: number;       // 1 = Monday, 7 = Sunday
  scheduledSendTime?: string;      // "09:00"
  timezone: string;

  // Audience
  defaultAudienceSegment?: string;
  excludeSegments?: string[];

  // Settings
  trackOpens: boolean;
  trackClicks: boolean;
  includeUnsubscribeLink: boolean;

  // Stats
  totalIssues: number;
  totalSubscribers: number;
  averageOpenRate: number;
  averageClickRate: number;

  // Status
  status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED';
}

interface NewsletterSection {
  id: string;
  name: string;                    // "Featured Article", "Upcoming Events"
  type: 'CONTENT' | 'EVENTS' | 'PROMOTIONS' | 'CUSTOM';
  order: number;

  // Content Selection
  contentSource: 'MANUAL' | 'AUTOMATIC';
  contentIds?: string[];           // Manual selection
  autoSelectCriteria?: {
    contentTypes?: ContentType[];
    categories?: string[];
    maxItems: number;
    sortBy: 'PUBLISHED_DATE' | 'POPULARITY';
  };

  // Display
  layout: 'FULL_WIDTH' | 'TWO_COLUMN' | 'CARDS' | 'LIST';
  showImages: boolean;
  showExcerpts: boolean;
  excerptLength?: number;
}

interface NewsletterIssue {
  id: string;
  newsletterId: string;

  // Identity
  issueNumber: number;
  title: string;                   // "Weekly Update - January 15, 2026"
  subject: string;                 // Email subject line
  previewText: string;

  // Content
  sections: NewsletterIssueSection[];
  customHtml?: string;

  // Audience
  segmentId?: string;
  recipientCount: number;

  // Status
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT';
  scheduledAt?: Date;
  sentAt?: Date;

  // Analytics
  delivered: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  bounced: number;
}
```

### 8.4 Blog Management

```typescript
interface BlogConfig {
  clubId: string;

  // Display
  postsPerPage: number;
  showAuthorBio: boolean;
  showRelatedPosts: boolean;
  relatedPostsCount: number;

  // Comments
  commentsEnabled: boolean;
  commentModeration: 'NONE' | 'PRE_MODERATION' | 'POST_MODERATION';
  commentNotifyAuthor: boolean;

  // Social Sharing
  enableSocialSharing: boolean;
  shareButtons: ('FACEBOOK' | 'TWITTER' | 'LINKEDIN' | 'EMAIL')[];

  // Categories
  categories: BlogCategory[];

  // Authors
  authors: BlogAuthor[];
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;               // For nested categories
  color?: string;
  featuredImage?: string;
  postCount: number;
}

interface BlogAuthor {
  id: string;
  userId?: string;                 // Link to staff user
  name: string;
  title: string;                   // "Head Golf Professional"
  bio: string;
  avatar: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
  postCount: number;
}

interface BlogComment {
  id: string;
  contentId: string;

  // Author
  authorType: 'MEMBER' | 'GUEST';
  memberId?: string;
  guestName?: string;
  guestEmail?: string;

  // Content
  body: string;
  parentCommentId?: string;        // For replies

  // Moderation
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
  moderatedBy?: string;
  moderatedAt?: Date;

  // Engagement
  likeCount: number;

  // Audit
  createdAt: Date;
  updatedAt?: Date;
  ipAddress?: string;
}
```

### 8.5 Editorial Calendar

```typescript
interface EditorialCalendar {
  clubId: string;

  // Calendar Items
  items: CalendarItem[];

  // Views
  defaultView: 'MONTH' | 'WEEK' | 'LIST';
}

interface CalendarItem {
  id: string;

  // Content Reference
  contentId?: string;              // Existing content
  contentType: ContentType;
  title: string;

  // Scheduling
  plannedDate: Date;
  deadline?: Date;
  publishDate?: Date;

  // Assignment
  assignedTo: string;
  reviewers?: string[];

  // Status
  status: 'IDEA' | 'ASSIGNED' | 'IN_PROGRESS' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED';

  // Notes
  notes?: string;
  briefUrl?: string;               // Link to content brief

  // Campaign
  campaignId?: string;             // Part of marketing campaign
}

interface ContentBrief {
  id: string;
  contentType: ContentType;
  title: string;

  // Objectives
  objective: string;
  targetAudience: string;
  keyMessages: string[];

  // SEO
  targetKeywords: string[];
  competitorUrls?: string[];

  // Requirements
  wordCount?: { min: number; max: number };
  mediaRequirements?: string;
  cta?: string;                    // Call to action

  // References
  referenceUrls?: string[];
  styleGuideUrl?: string;

  // Assignment
  writer: string;
  editor?: string;
  deadline: Date;
}
```

### 8.6 Content Templates

```typescript
interface ContentTemplate {
  id: string;
  clubId: string;

  name: string;
  description: string;
  contentType: ContentType;

  // Template Structure
  structure: TemplateSection[];

  // Defaults
  defaultCategories?: string[];
  defaultTags?: string[];
  defaultVisibility: 'PUBLIC' | 'MEMBERS_ONLY';

  // Media
  suggestedImageDimensions?: { width: number; height: number };

  // SEO
  metaTitleTemplate?: string;      // "{title} | Royal Club"
  metaDescriptionTemplate?: string;

  // Status
  isActive: boolean;
}

interface TemplateSection {
  id: string;
  name: string;
  type: 'HEADING' | 'PARAGRAPH' | 'IMAGE' | 'GALLERY' | 'VIDEO' | 'QUOTE' | 'CTA' | 'CUSTOM';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  order: number;
}
```

### 8.7 Media Library

```typescript
interface MediaLibraryConfig {
  clubId: string;

  // Storage
  storageProvider: 'S3' | 'CLOUDINARY' | 'GCS';
  bucketName: string;
  cdnUrl: string;

  // Upload Limits
  maxFileSizeMB: number;
  allowedTypes: string[];

  // Processing
  autoOptimize: boolean;
  generateThumbnails: boolean;
  thumbnailSizes: { name: string; width: number; height: number }[];

  // Organization
  folderStructure: 'FLAT' | 'DATE_BASED' | 'CATEGORY_BASED';
}

interface MediaFolder {
  id: string;
  name: string;
  parentId?: string;
  path: string;                    // "/events/2026/golf-tournament"
  assetCount: number;
  createdAt: Date;
}

interface MediaAssetExtended extends MediaAsset {
  folderId?: string;

  // Metadata
  title?: string;
  description?: string;
  copyright?: string;
  photographer?: string;

  // Usage
  usedInContentIds: string[];
  usageCount: number;

  // AI-Generated
  autoTags?: string[];
  autoDescription?: string;

  // Audit
  uploadedBy: string;
  uploadedAt: Date;
}
```

---

## 9. Marketing & Campaign Automation

### 9.1 Batch Email Manager Integration

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

### 9.2 Campaign Types

| Campaign Type | Purpose | Trigger |
|---------------|---------|---------|
| **Promotional** | Events, offers, club news | Manual/scheduled |
| **Renewal** | Membership renewal campaigns | Before expiry |
| **Re-engagement** | Win back inactive members | Inactivity threshold |
| **Welcome Series** | Onboarding new members | New member approval |
| **Survey/Feedback** | Member satisfaction surveys | After events/visits |
| **Anniversary** | Member anniversary celebration | Annual date |
| **Birthday** | Birthday greetings | Member birthdate |

### 9.3 Audience Segmentation

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

  // Engagement Filters
  lastVisitRange?: { start: Date; end: Date };
  facilityUsage?: string[];       // Golf, Tennis, Pool, etc.
  eventAttendance?: number;       // Min events attended

  // Communication Preferences
  emailOptIn: boolean;

  // Calculated
  memberCount: number;
  lastUpdated: DateTime;
}
```

### 9.4 Pre-Built Segments

| Segment | Criteria | Use Case |
|---------|----------|----------|
| **All Active Members** | Status = ACTIVE | General announcements |
| **New Members (90 days)** | Join date within 90 days | Onboarding campaigns |
| **Renewing Soon** | Renewal within 60 days | Renewal reminders |
| **Lapsed Members** | Status = RESIGNED, < 2 years | Win-back campaigns |
| **VIP Members** | Tier = PLATINUM or GOLD | Exclusive offers |
| **Inactive (90 days)** | No facility visits 90 days | Re-engagement |
| **Golf Members** | Membership type includes golf | Golf events/offers |

### 9.5 Pre-Built Automation Workflows

| Workflow | Trigger | Steps |
|----------|---------|-------|
| **Welcome Series** | New member approved | Day 0: Welcome → Day 3: Getting Started → Day 7: Benefits Overview → Day 14: First Visit Tips |
| **Renewal Reminder** | 60 days before renewal | Day -60: First notice → Day -30: Reminder → Day -14: Urgent → Day -7: Final |
| **Re-engagement** | 90 days inactive | Day 0: Miss you → Day 14: Special offer → Day 30: Final outreach |
| **Birthday** | Member birthday | Day of: Birthday greeting email |
| **Anniversary** | Membership anniversary | Day of: Thank you + special offer |

---

## 10. Social Media & Digital Presence

### 10.1 Social Media Integration

```typescript
interface SocialMediaConfig {
  clubId: string;

  // Connected Accounts
  accounts: SocialAccount[];

  // Publishing
  defaultPublishToAccounts: string[];  // Account IDs
  requireApprovalBeforePost: boolean;
  approverRoles: string[];

  // Scheduling
  schedulingEnabled: boolean;
  optimalPostingEnabled: boolean;     // AI-suggested times

  // Content
  autoHashtagsEnabled: boolean;
  brandHashtags: string[];            // #RoyalClub #GolfLife
  shortenerEnabled: boolean;
  shortenerDomain?: string;
}

interface SocialAccount {
  id: string;
  platform: SocialPlatform;
  accountName: string;
  accountId: string;                  // Platform-specific ID
  accessToken: string;                // Encrypted
  refreshToken?: string;

  // Status
  status: 'CONNECTED' | 'EXPIRED' | 'ERROR';
  lastSyncAt?: Date;

  // Permissions
  canPublish: boolean;
  canReadAnalytics: boolean;
  canReadMessages: boolean;

  // Settings
  autoPublishContent: boolean;
  contentTypes: ContentType[];        // What to auto-publish
}

enum SocialPlatform {
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM',
  TWITTER = 'TWITTER',
  LINKEDIN = 'LINKEDIN',
  YOUTUBE = 'YOUTUBE',
  TIKTOK = 'TIKTOK',
}
```

### 10.2 Social Post Management

```typescript
interface SocialPost {
  id: string;
  clubId: string;

  // Content
  message: string;
  mediaUrls: string[];
  linkUrl?: string;
  linkPreview?: {
    title: string;
    description: string;
    image: string;
  };

  // Targeting
  targetPlatforms: SocialPlatform[];
  platformVariants?: {
    platform: SocialPlatform;
    message: string;                  // Platform-specific version
    hashtags: string[];
  }[];

  // Scheduling
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHING' | 'PUBLISHED' | 'FAILED';
  scheduledAt?: Date;
  publishedAt?: Date;

  // Campaign
  campaignId?: string;
  contentId?: string;                 // Link to CMS content

  // Results
  publishResults: {
    platform: SocialPlatform;
    accountId: string;
    postId?: string;                  // Platform's post ID
    postUrl?: string;
    status: 'SUCCESS' | 'FAILED';
    error?: string;
  }[];

  // Audit
  createdBy: string;
  createdAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}
```

### 10.3 Social Analytics

```typescript
interface SocialAnalytics {
  accountId: string;
  platform: SocialPlatform;
  period: 'DAY' | 'WEEK' | 'MONTH';
  startDate: Date;
  endDate: Date;

  // Audience
  followers: number;
  followerGrowth: number;
  followerGrowthPercent: number;

  // Reach
  impressions: number;
  reach: number;
  profileViews: number;

  // Engagement
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagementRate: number;

  // Content Performance
  topPosts: {
    postId: string;
    postUrl: string;
    impressions: number;
    engagement: number;
    engagementRate: number;
  }[];

  // Demographics (if available)
  audienceDemographics?: {
    ageRanges: { range: string; percent: number }[];
    genderSplit: { gender: string; percent: number }[];
    topLocations: { location: string; percent: number }[];
  };
}
```

### 10.4 Content Calendar Integration

```typescript
interface SocialCalendarIntegration {
  // Sync CMS content to social
  autoCreateSocialPosts: boolean;
  defaultDelay: number;              // Minutes after CMS publish

  // Platform-specific formatting
  formatRules: {
    platform: SocialPlatform;
    useExcerpt: boolean;
    maxLength: number;
    includeLink: boolean;
    addHashtags: boolean;
    hashtagSource: 'CONTENT_TAGS' | 'CATEGORY' | 'CUSTOM';
  }[];

  // Image handling
  autoResizeImages: boolean;
  platformImageSizes: {
    platform: SocialPlatform;
    width: number;
    height: number;
    aspectRatio: string;
  }[];
}
```

### 10.5 User-Generated Content (UGC)

```typescript
interface UGCConfig {
  clubId: string;

  // Hashtag Monitoring
  monitoredHashtags: string[];
  monitorPlatforms: SocialPlatform[];

  // Approval
  autoApprove: boolean;
  moderationEnabled: boolean;
  moderatorRoles: string[];

  // Rights Management
  requirePermission: boolean;
  permissionRequestTemplate: string;

  // Display
  displayOnWebsite: boolean;
  displayLocations: string[];        // "homepage", "gallery", "member-portal"
  maxDisplayCount: number;
}

interface UGCPost {
  id: string;

  // Source
  platform: SocialPlatform;
  platformPostId: string;
  platformPostUrl: string;
  authorUsername: string;
  authorProfileUrl: string;

  // Content
  message?: string;
  mediaUrls: string[];
  hashtags: string[];

  // Moderation
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PERMISSION_REQUESTED' | 'PERMISSION_GRANTED';
  moderatedBy?: string;
  moderatedAt?: Date;
  rejectionReason?: string;

  // Permission
  permissionRequestedAt?: Date;
  permissionGrantedAt?: Date;
  permissionProof?: string;          // Screenshot or message

  // Display
  featured: boolean;
  displayOrder?: number;

  // Metrics
  originalLikes: number;
  originalComments: number;

  createdAt: Date;
}
```

### 10.6 Social Listening & Mentions

```typescript
interface SocialListeningConfig {
  clubId: string;

  // Keywords to Monitor
  keywords: string[];
  competitors: string[];
  industryTerms: string[];

  // Alert Rules
  alertRules: MentionAlertRule[];

  // Sentiment Analysis
  sentimentAnalysisEnabled: boolean;
}

interface MentionAlertRule {
  id: string;
  name: string;

  // Trigger
  triggerType: 'KEYWORD' | 'MENTION' | 'NEGATIVE_SENTIMENT' | 'VOLUME_SPIKE';
  keywords?: string[];
  sentimentThreshold?: number;       // -0.5 for negative
  volumeThreshold?: number;          // 5x normal

  // Action
  notifyEmails: string[];
  notifySlack: boolean;
  slackChannel?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
}

interface SocialMention {
  id: string;

  // Source
  platform: SocialPlatform;
  postUrl: string;
  authorUsername: string;
  authorFollowers: number;

  // Content
  message: string;
  matchedKeywords: string[];

  // Analysis
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  sentimentScore: number;            // -1 to 1
  reach: number;
  engagement: number;

  // Response
  responded: boolean;
  responseUrl?: string;
  respondedBy?: string;
  respondedAt?: Date;

  createdAt: Date;
}
```

### 10.7 Influencer & Ambassador Program

```typescript
interface AmbassadorProgram {
  clubId: string;

  // Program Settings
  programName: string;
  description: string;
  applicationEnabled: boolean;

  // Tiers
  tiers: AmbassadorTier[];

  // Benefits
  defaultBenefits: string[];
  referralCommission?: number;       // Percentage

  // Content Requirements
  monthlyPostRequirement: number;
  requiredHashtags: string[];
  contentGuidelines: string;
}

interface AmbassadorTier {
  id: string;
  name: string;                      // "Bronze", "Silver", "Gold"
  followerMinimum: number;
  benefits: string[];
  monthlyPostRequirement: number;
  perks: {
    type: string;
    value: string;
  }[];
}

interface Ambassador {
  id: string;
  memberId?: string;                 // If also a member

  // Profile
  firstName: string;
  lastName: string;
  email: string;

  // Social Presence
  socialAccounts: {
    platform: SocialPlatform;
    username: string;
    followers: number;
    engagementRate: number;
    verified: boolean;
  }[];

  // Program
  tier: string;
  status: 'APPLIED' | 'APPROVED' | 'ACTIVE' | 'PAUSED' | 'TERMINATED';
  joinedAt?: Date;

  // Performance
  totalPosts: number;
  totalReach: number;
  totalEngagement: number;
  referralsGenerated: number;
  revenueGenerated: number;

  // Tracking
  uniqueReferralCode: string;
  trackingLink: string;
}
```

### 10.8 Digital Advertising Integration

```typescript
interface DigitalAdvertisingConfig {
  clubId: string;

  // Ad Platforms
  platforms: AdPlatformConnection[];

  // Audiences
  customAudiences: CustomAudience[];

  // Conversion Tracking
  conversionEvents: ConversionEvent[];
}

interface AdPlatformConnection {
  platform: 'META_ADS' | 'GOOGLE_ADS' | 'LINKEDIN_ADS' | 'TIKTOK_ADS';
  accountId: string;
  accessToken: string;
  status: 'CONNECTED' | 'ERROR';

  // Pixel/Tag
  pixelId?: string;
  conversionApiEnabled: boolean;
}

interface CustomAudience {
  id: string;
  name: string;
  platform: string;
  platformAudienceId: string;

  // Source
  sourceType: 'MEMBER_LIST' | 'PROSPECT_LIST' | 'WEBSITE_VISITORS' | 'ENGAGEMENT' | 'LOOKALIKE';
  sourceSegmentId?: string;

  // Sync
  autoSync: boolean;
  syncFrequency: 'DAILY' | 'WEEKLY';
  lastSyncAt?: Date;
  memberCount: number;
}

interface ConversionEvent {
  name: string;                      // "MembershipInquiry", "TourScheduled"
  platforms: string[];
  eventType: string;
  value?: number;
}
```

---

## 11. Implementation Priority Matrix

### Phase 1: Core Membership (Critical)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Member CRUD | Critical | Low |
| Membership types | Critical | Low |
| Member status management | Critical | Medium |
| Member directory/search | Critical | Low |

### Phase 2: Family & Applications (High)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Household management | High | Medium |
| Dependent management | High | Medium |
| Membership applications | High | High |
| Board approval workflow | Medium | High |

### Phase 3: Tiers & Benefits (Medium)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Membership tiers | Medium | Medium |
| Tier benefits engine | Medium | Medium |
| Upgrade/downgrade workflow | Medium | Medium |

### Phase 4: Prospect Management (Medium-High)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Prospect pipeline | High | Medium |
| Lead scoring | Medium | Medium |
| Nurture sequences | Medium | High |
| Activity tracking | Medium | Medium |
| Tour scheduling | High | Low |

### Phase 5: Content Management System (Medium)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Article/blog management | Medium | Medium |
| Newsletter builder | Medium | High |
| Media library | Medium | Medium |
| Editorial calendar | Low | Medium |
| Content templates | Low | Low |

### Phase 6: Marketing & Campaign Automation (Medium)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Email campaign builder | Medium | High |
| Audience segmentation | Medium | Medium |
| Automation workflows | Medium | High |
| Campaign analytics | Medium | Medium |

### Phase 7: Social Media & Digital (Low-Medium)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Social account connection | Medium | Medium |
| Post scheduling | Medium | Medium |
| Social analytics | Low | Medium |
| UGC management | Low | Medium |
| Influencer/ambassador program | Low | High |
| Digital advertising integration | Low | High |

---

## Sources

This document incorporates industry research from:

- [WildApricot](https://www.wildapricot.com/blog/club-management-software) - Club management software features
- [Clubessential](https://www.clubessential.com/club-management-software/) - Private club management
- [Cobalt Software](https://www.mycobaltsoftware.com/) - Country club software
- [Alpine Country Club](https://www.alpinecc.com/membership/membership-categories) - Membership categories
- [Columbus Country Club](https://www.columbuscc.com/membership/membership-categories) - Membership types
- [Neon One](https://neonone.com/resources/blog/membership-dues/) - Membership dues guide
- [MemberClicks](https://memberclicks.com/blog/membership-dues/) - Dues management
