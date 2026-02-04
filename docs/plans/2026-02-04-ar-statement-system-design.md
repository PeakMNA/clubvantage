# AR Statement System Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:writing-plans to create the implementation plan from this design.

**Goal:** Build a comprehensive AR statement system supporting bulk statement generation with configurable billing periods, multi-profile AR support (Members, City Ledger, Staff), and controlled AR closing workflow.

**Architecture:** Polymorphic AR Profile model linking to Member or CityLedger entities. Statement generation via batch runs with preview/audit capability before finalization. Hard period locks with controlled re-open requiring approval and audit trail.

**Tech Stack:** NestJS/GraphQL backend, Prisma ORM, Supabase Storage for PDFs, Next.js/React frontend

---

## 1. Data Model Overview

### New Models

| Model | Purpose |
|-------|---------|
| **ARProfile** | Unified AR account linking to Member or CityLedger (polymorphic via profileType + profileId) |
| **StatementPeriod** | Billing period configuration per club with OPEN/CLOSED/REOPENED status |
| **StatementRun** | Batch statement generation tracking (PREVIEW for audit, FINAL for AR close) |
| **Statement** | Individual statement with balances, aging, transactions, and delivery tracking |

### Existing Model Updates

| Model | Changes |
|-------|---------|
| **CityLedger** | Add `HOUSE` to CityLedgerType enum for house accounts |
| **MemberBillingProfile** | Add AR-specific fields for staff billing configuration |

### Key Design Decisions

1. **Polymorphic AR Profile** - Single ARProfile model with profileType (MEMBER/CITY_LEDGER) and profileId, avoiding separate tables
2. **House Accounts as CityLedger** - House accounts are CityLedger entries with type HOUSE, not separate model
3. **Staff as Members** - Staff are members with staff membership type; AR settings on MemberBillingProfile
4. **Statement Numbers at Close Only** - STMT-YY-PP-NNNNNN format assigned only at AR closing, not during previews
5. **Hard Lock with Controlled Re-open** - Closed periods require approval + audit trail to reopen

---

## 2. Existing Model Updates

### CityLedger - Add HOUSE Type

```prisma
enum CityLedgerType {
  CORPORATE
  VENDOR
  HOUSE      // NEW - for house accounts (internal charge accounts)
}
```

### MemberBillingProfile - Add AR Fields

```prisma
model MemberBillingProfile {
  // ... existing fields ...

  // AR Configuration (for staff billing scenarios)
  arEnabled              Boolean   @default(true)
  arStatementDelivery    StatementDelivery?
  arPaymentTermsDays     Int?
  arCreditLimit          Decimal?  @db.Decimal(12,2)
  arAutoChargeToMember   Boolean   @default(false)  // Staff charges to their member account
  arSeparateStatement    Boolean   @default(false)  // Staff gets separate statement
  arBillingContact       String?   @db.VarChar(255) // Override contact for AR
}
```

---

## 3. AR Profile Model

```prisma
enum ARProfileType {
  MEMBER
  CITY_LEDGER
}

enum ARProfileStatus {
  ACTIVE
  SUSPENDED
  CLOSED
}

enum StatementDelivery {
  EMAIL
  PRINT
  PORTAL
  SMS
  EMAIL_AND_PRINT
  ALL
}

model ARProfile {
  id                    String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId                String              @db.Uuid

  // Account identification
  accountNumber         String              @db.VarChar(30)

  // Polymorphic link
  profileType           ARProfileType
  memberId              String?             @db.Uuid
  cityLedgerId          String?             @db.Uuid

  // Billing configuration
  statementDelivery     StatementDelivery   @default(EMAIL)
  paymentTermsDays      Int                 @default(15)
  creditLimit           Decimal?            @db.Decimal(12,2)

  // Current state
  currentBalance        Decimal             @default(0) @db.Decimal(12,2)
  lastStatementDate     DateTime?           @db.Date
  lastStatementBalance  Decimal?            @db.Decimal(12,2)
  lastPaymentDate       DateTime?           @db.Date
  lastPaymentAmount     Decimal?            @db.Decimal(12,2)

  // Status
  status                ARProfileStatus     @default(ACTIVE)
  suspendedAt           DateTime?
  suspendedReason       String?
  closedAt              DateTime?
  closedReason          String?

  // Audit
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  createdBy             String?             @db.Uuid
  updatedBy             String?             @db.Uuid

  // Relations
  club                  Club                @relation(fields: [clubId], references: [id])
  member                Member?             @relation(fields: [memberId], references: [id])
  cityLedger            CityLedger?         @relation(fields: [cityLedgerId], references: [id])
  statements            Statement[]

  @@unique([clubId, accountNumber])
  @@unique([clubId, profileType, memberId], name: "unique_member_profile")
  @@unique([clubId, profileType, cityLedgerId], name: "unique_cityledger_profile")
  @@index([clubId, status])
  @@index([clubId, profileType])
  @@map("ar_profiles")
}
```

---

## 4. Statement Period & Run Models

### Statement Period

```prisma
enum PeriodStatus {
  OPEN
  CLOSED
  REOPENED
}

model StatementPeriod {
  id                    String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId                String              @db.Uuid

  // Period identification
  periodYear            Int
  periodNumber          Int                 // 1-12 for monthly, 1-52 for weekly, etc.
  periodLabel           String              @db.VarChar(50)  // "January 2026", "Week 5 2026"

  // Date range
  periodStart           DateTime            @db.Date
  periodEnd             DateTime            @db.Date
  cutoffDate            DateTime            @db.Date         // Transaction cutoff

  // Status & locking
  status                PeriodStatus        @default(OPEN)
  closedAt              DateTime?
  closedBy              String?             @db.Uuid
  reopenedAt            DateTime?
  reopenedBy            String?             @db.Uuid
  reopenReason          String?
  reopenApprovedBy      String?             @db.Uuid

  // Totals (populated at close)
  totalProfiles         Int?
  totalStatements       Int?
  totalOpeningBalance   Decimal?            @db.Decimal(14,2)
  totalDebits           Decimal?            @db.Decimal(14,2)
  totalCredits          Decimal?            @db.Decimal(14,2)
  totalClosingBalance   Decimal?            @db.Decimal(14,2)

  // Audit
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  // Relations
  club                  Club                @relation(fields: [clubId], references: [id])
  closedByUser          User?               @relation("PeriodClosedBy", fields: [closedBy], references: [id])
  reopenedByUser        User?               @relation("PeriodReopenedBy", fields: [reopenedBy], references: [id])
  reopenApprovedByUser  User?               @relation("PeriodReopenApprovedBy", fields: [reopenApprovedBy], references: [id])
  statementRuns         StatementRun[]

  @@unique([clubId, periodYear, periodNumber])
  @@index([clubId, status])
  @@map("statement_periods")
}
```

### Statement Run

```prisma
enum StatementRunType {
  PREVIEW     // For audit/review before AR close
  FINAL       // At AR close - assigns statement numbers
}

enum StatementRunStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FAILED
  CANCELLED
}

model StatementRun {
  id                    String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId                String              @db.Uuid
  statementPeriodId     String              @db.Uuid

  // Run identification
  runType               StatementRunType
  runNumber             Int                 // Sequential within period

  // Status tracking
  status                StatementRunStatus  @default(PENDING)
  startedAt             DateTime?
  completedAt           DateTime?

  // Progress
  totalProfiles         Int                 @default(0)
  processedCount        Int                 @default(0)
  generatedCount        Int                 @default(0)  // Statements with activity
  skippedCount          Int                 @default(0)  // Zero balance, no activity
  errorCount            Int                 @default(0)

  // Totals
  totalOpeningBalance   Decimal             @default(0) @db.Decimal(14,2)
  totalDebits           Decimal             @default(0) @db.Decimal(14,2)
  totalCredits          Decimal             @default(0) @db.Decimal(14,2)
  totalClosingBalance   Decimal             @default(0) @db.Decimal(14,2)

  // Error tracking
  errorLog              Json?

  // Audit
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt
  createdBy             String?             @db.Uuid

  // Relations
  club                  Club                @relation(fields: [clubId], references: [id])
  statementPeriod       StatementPeriod     @relation(fields: [statementPeriodId], references: [id])
  createdByUser         User?               @relation(fields: [createdBy], references: [id])
  statements            Statement[]

  @@index([clubId, statementPeriodId])
  @@index([status])
  @@map("statement_runs")
}
```

---

## 5. Statement Model

```prisma
enum DeliveryStatus {
  PENDING
  SENT
  DELIVERED
  FAILED
  NOT_APPLICABLE
}

model Statement {
  id                    String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId                String              @db.Uuid
  statementRunId        String              @db.Uuid
  arProfileId           String              @db.Uuid

  // Statement identification (null until FINAL run)
  statementNumber       String?             @db.VarChar(20)  // STMT-YY-PP-NNNNNN

  // Period
  periodStart           DateTime            @db.Date
  periodEnd             DateTime            @db.Date
  dueDate               DateTime            @db.Date

  // Balances
  openingBalance        Decimal             @db.Decimal(12,2)
  totalDebits           Decimal             @db.Decimal(12,2)
  totalCredits          Decimal             @db.Decimal(12,2)
  closingBalance        Decimal             @db.Decimal(12,2)

  // Aging breakdown
  agingCurrent          Decimal             @default(0) @db.Decimal(12,2)
  aging1to30            Decimal             @default(0) @db.Decimal(12,2)
  aging31to60           Decimal             @default(0) @db.Decimal(12,2)
  aging61to90           Decimal             @default(0) @db.Decimal(12,2)
  aging90Plus           Decimal             @default(0) @db.Decimal(12,2)

  // Profile snapshot (billing info at generation time)
  profileSnapshot       Json
  // Contains: name, accountNumber, memberNumber, membershipType,
  //           email, phone, address, paymentTermsDays

  // Transactions
  transactionCount      Int                 @default(0)
  transactions          Json?               // Array of transaction details

  // PDF storage
  pdfUrl                String?             @db.VarChar(500)
  pdfGeneratedAt        DateTime?

  // Delivery configuration
  deliveryMethod        StatementDelivery

  // Delivery status tracking
  emailStatus           DeliveryStatus      @default(PENDING)
  emailSentAt           DateTime?
  emailDeliveredAt      DateTime?
  emailError            String?

  printStatus           DeliveryStatus      @default(PENDING)
  printedAt             DateTime?
  printBatchId          String?             @db.Uuid

  portalStatus          DeliveryStatus      @default(PENDING)
  portalPublishedAt     DateTime?
  portalViewedAt        DateTime?

  smsStatus             DeliveryStatus      @default(PENDING)
  smsSentAt             DateTime?
  smsDeliveredAt        DateTime?
  smsError              String?

  // Audit
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  // Relations
  club                  Club                @relation(fields: [clubId], references: [id])
  statementRun          StatementRun        @relation(fields: [statementRunId], references: [id])
  arProfile             ARProfile           @relation(fields: [arProfileId], references: [id])

  @@unique([clubId, statementNumber])
  @@index([clubId, arProfileId])
  @@index([statementRunId])
  @@index([closingBalance])  // For filtering non-zero statements
  @@map("statements")
}
```

---

## 6. Workflow & Process Flow

### AR Statement Generation Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AR STATEMENT WORKFLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. CONFIGURE PERIOD                                                        │
│     └─> Create/verify StatementPeriod for billing cycle                     │
│         └─> Set periodStart, periodEnd, cutoffDate                          │
│                                                                             │
│  2. PRE-RUN (PREVIEW)                                                       │
│     └─> Create StatementRun (type: PREVIEW)                                 │
│         └─> Generate preview statements for all active AR profiles          │
│             └─> No statement numbers assigned                               │
│             └─> Statements marked as preview                                │
│                                                                             │
│  3. AUDIT LOOP (Manual, Repeatable)                                         │
│     ┌─────────────────────────────────────────────────────────────────┐     │
│     │  Review preview statements                                      │     │
│     │  └─> Check totals, balances, exceptions                         │     │
│     │  └─> Make corrections to source transactions if needed          │     │
│     │  └─> Re-run preview (creates new StatementRun)                  │     │
│     │  └─> Repeat until satisfied                                     │     │
│     └─────────────────────────────────────────────────────────────────┘     │
│                                                                             │
│  4. AR CLOSE / FINALIZE                                                     │
│     └─> Create StatementRun (type: FINAL)                                   │
│         └─> Generate final statements                                       │
│         └─> Assign statement numbers (STMT-YY-PP-NNNNNN)                    │
│         └─> Lock StatementPeriod (status: CLOSED)                           │
│         └─> Generate PDFs                                                   │
│         └─> Update AR profile balances                                      │
│                                                                             │
│  5. DELIVERY                                                                │
│     └─> Queue statements for delivery based on profile preferences          │
│         └─> Email: Send with PDF attachment                                 │
│         └─> Print: Add to print batch                                       │
│         └─> Portal: Publish to member portal                                │
│         └─> SMS: Send notification with link                                │
│                                                                             │
│  6. PERIOD RE-OPEN (Exception Only)                                         │
│     └─> Requires approval (reopenApprovedBy)                                │
│     └─> Records reopenReason and audit trail                                │
│     └─> Status changes to REOPENED                                          │
│     └─> Allows corrections, then re-close                                   │
│                                                                             │
│  7. REPORTING                                                               │
│     └─> AR Aging Report                                                     │
│     └─> Statement Delivery Status                                           │
│     └─> Period Summary                                                      │
│     └─> Exception Report                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Statement Number Format

- Format: `STMT-YY-PP-NNNNNN`
- YY: 2-digit year
- PP: 2-digit period number (01-12 for monthly)
- NNNNNN: 6-digit sequential number within period
- Example: `STMT-26-01-000001` (First statement of January 2026)
- Assigned ONLY at AR close (FINAL run), never during preview

---

## 7. Service Layer & API

### Services

| Service | Responsibilities |
|---------|-----------------|
| **ARProfileService** | Create/manage AR profiles, link to Member/CityLedger, balance updates |
| **StatementPeriodService** | Period CRUD, open/close/reopen with audit trail |
| **StatementRunService** | Execute batch runs, progress tracking, error handling |
| **StatementService** | Generate individual statements, PDF generation, number assignment |
| **StatementDeliveryService** | Email, print batch, portal publish, SMS notification |

### GraphQL Queries

```graphql
# AR Profiles
arProfiles(clubId: ID!, filter: ARProfileFilterInput): ARProfileConnection!
arProfile(id: ID!): ARProfile

# Statement Periods
statementPeriods(clubId: ID!, year: Int): [StatementPeriod!]!
statementPeriod(id: ID!): StatementPeriod

# Statement Runs
statementRuns(periodId: ID!): [StatementRun!]!
statementRun(id: ID!): StatementRun

# Statements
statements(runId: ID!, filter: StatementFilterInput): StatementConnection!
statement(id: ID!): Statement
memberStatements(memberId: ID!): [Statement!]!
```

### GraphQL Mutations

```graphql
# AR Profiles
createARProfile(input: CreateARProfileInput!): ARProfile!
updateARProfile(id: ID!, input: UpdateARProfileInput!): ARProfile!
suspendARProfile(id: ID!, reason: String!): ARProfile!
closeARProfile(id: ID!, reason: String!): ARProfile!

# Statement Periods
createStatementPeriod(input: CreateStatementPeriodInput!): StatementPeriod!
closeStatementPeriod(id: ID!): StatementPeriod!
reopenStatementPeriod(id: ID!, reason: String!, approvedBy: ID!): StatementPeriod!

# Statement Runs
startStatementRun(input: StartStatementRunInput!): StatementRun!
cancelStatementRun(id: ID!): StatementRun!

# Statements
regenerateStatementPdf(id: ID!): Statement!
sendStatement(id: ID!, method: StatementDelivery!): Statement!
bulkSendStatements(runId: ID!, method: StatementDelivery!): BulkSendResult!
```

---

## 8. Implementation Phases

### Phase 1: Foundation
- Prisma schema changes (new models, enum updates)
- Database migration
- ARProfileService with basic CRUD
- StatementPeriodService with open/close

### Phase 2: Statement Generation
- StatementRunService batch processing
- StatementService individual generation
- Preview vs Final run logic
- Statement number assignment

### Phase 3: Delivery
- PDF generation with profile snapshot
- Email delivery with templates
- Print batch management
- Portal publishing
- SMS notifications

### Phase 4: UI Components
- AR Profile management screen
- Statement period dashboard
- Run progress monitoring
- Statement viewer with delivery status
- Audit/review interface

### Phase 5: Reporting
- AR Aging dashboard updates
- Statement delivery tracking
- Period summary reports
- Exception handling

---

## Appendix: Profile Snapshot Schema

The `profileSnapshot` JSON field stores billing info at statement generation time:

```typescript
interface ProfileSnapshot {
  // Identity
  name: string;
  accountNumber: string;
  profileType: 'MEMBER' | 'CITY_LEDGER';

  // For members
  memberNumber?: string;
  membershipType?: string;

  // For city ledger
  companyName?: string;
  cityLedgerType?: 'CORPORATE' | 'VENDOR' | 'HOUSE';

  // Contact
  email?: string;
  phone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  // Billing
  paymentTermsDays: number;
  creditLimit?: number;
}
```
