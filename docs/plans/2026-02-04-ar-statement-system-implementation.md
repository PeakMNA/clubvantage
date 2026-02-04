# AR Statement System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Use nextjs-backend-engineer skill for backend tasks. Use frontend-design skill for UI tasks.

**Goal:** Implement bulk AR statement generation with configurable billing periods, multi-profile AR support (Members, City Ledger, Staff), and controlled AR closing workflow.

**Architecture:** Polymorphic ARProfile model linking to Member/CityLedger. Batch statement runs with preview/audit before finalization. Hard period locks with controlled re-open.

**Tech Stack:** NestJS/GraphQL, Prisma ORM, Supabase Storage (PDFs), Next.js/React, shadcn/ui, TanStack Query

**Reference:** Design document at `docs/plans/2026-02-04-ar-statement-system-design.md`

---

## Phase 1: Database Schema

### Task 1: Add Enums to Prisma Schema

**Files:**
- Modify: `database/prisma/schema.prisma`

**Step 1: Add the new enums**

Add after existing enums (around line 200):

```prisma
// ==================== AR STATEMENT ENUMS ====================

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

enum PeriodStatus {
  OPEN
  CLOSED
  REOPENED
}

enum StatementRunType {
  PREVIEW
  FINAL
}

enum StatementRunStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  FAILED
  CANCELLED
}

enum DeliveryStatus {
  PENDING
  SENT
  DELIVERED
  FAILED
  NOT_APPLICABLE
}
```

**Step 2: Verify schema is valid**

Run: `cd database && npx prisma format`
Expected: Schema formatted successfully

**Step 3: Commit**

```bash
git add database/prisma/schema.prisma
git commit -m "feat(schema): add AR statement system enums"
```

---

### Task 2: Add HOUSE to CityLedgerType Enum

**Files:**
- Modify: `database/prisma/schema.prisma`

**Step 1: Find and update CityLedgerType enum**

Change from:
```prisma
enum CityLedgerType {
  CORPORATE
  HOUSE_ACCOUNT
  VENDOR
  OTHER
}
```

To:
```prisma
enum CityLedgerType {
  CORPORATE
  VENDOR
  HOUSE
  OTHER
}
```

Note: `HOUSE_ACCOUNT` renamed to `HOUSE` for consistency.

**Step 2: Verify schema**

Run: `cd database && npx prisma format`

**Step 3: Commit**

```bash
git add database/prisma/schema.prisma
git commit -m "feat(schema): rename HOUSE_ACCOUNT to HOUSE in CityLedgerType"
```

---

### Task 3: Add AR Fields to MemberBillingProfile

**Files:**
- Modify: `database/prisma/schema.prisma`

**Step 1: Find MemberBillingProfile model and add AR fields**

Add these fields before the closing brace:

```prisma
  // AR Configuration (for staff billing scenarios)
  arEnabled              Boolean           @default(true)
  arStatementDelivery    StatementDelivery?
  arPaymentTermsDays     Int?
  arCreditLimit          Decimal?          @db.Decimal(12,2)
  arAutoChargeToMember   Boolean           @default(false)
  arSeparateStatement    Boolean           @default(false)
  arBillingContact       String?           @db.VarChar(255)
```

**Step 2: Verify schema**

Run: `cd database && npx prisma format`

**Step 3: Commit**

```bash
git add database/prisma/schema.prisma
git commit -m "feat(schema): add AR fields to MemberBillingProfile"
```

---

### Task 4: Create ARProfile Model

**Files:**
- Modify: `database/prisma/schema.prisma`

**Step 1: Add ARProfile model**

Add after MemberBillingProfile model:

```prisma
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
  club                  Club                @relation(fields: [clubId], references: [id], onDelete: Cascade)
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

**Step 2: Add relation to Club model**

Find Club model and add:
```prisma
  arProfiles            ARProfile[]
```

**Step 3: Add relation to Member model**

Find Member model and add:
```prisma
  arProfile             ARProfile?
```

**Step 4: Add relation to CityLedger model**

Find CityLedger model and add:
```prisma
  arProfile             ARProfile?
```

**Step 5: Verify schema**

Run: `cd database && npx prisma format`

**Step 6: Commit**

```bash
git add database/prisma/schema.prisma
git commit -m "feat(schema): add ARProfile model with polymorphic relations"
```

---

### Task 5: Create StatementPeriod Model

**Files:**
- Modify: `database/prisma/schema.prisma`

**Step 1: Add StatementPeriod model**

```prisma
model StatementPeriod {
  id                    String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId                String              @db.Uuid

  // Period identification
  periodYear            Int
  periodNumber          Int
  periodLabel           String              @db.VarChar(50)

  // Date range
  periodStart           DateTime            @db.Date
  periodEnd             DateTime            @db.Date
  cutoffDate            DateTime            @db.Date

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
  club                  Club                @relation(fields: [clubId], references: [id], onDelete: Cascade)
  closedByUser          User?               @relation("PeriodClosedBy", fields: [closedBy], references: [id])
  reopenedByUser        User?               @relation("PeriodReopenedBy", fields: [reopenedBy], references: [id])
  reopenApprovedByUser  User?               @relation("PeriodReopenApprovedBy", fields: [reopenApprovedBy], references: [id])
  statementRuns         StatementRun[]

  @@unique([clubId, periodYear, periodNumber])
  @@index([clubId, status])
  @@map("statement_periods")
}
```

**Step 2: Add relation to Club model**

```prisma
  statementPeriods      StatementPeriod[]
```

**Step 3: Add relations to User model**

```prisma
  periodsClosed         StatementPeriod[]   @relation("PeriodClosedBy")
  periodsReopened       StatementPeriod[]   @relation("PeriodReopenedBy")
  periodsReopenApproved StatementPeriod[]   @relation("PeriodReopenApprovedBy")
```

**Step 4: Verify schema**

Run: `cd database && npx prisma format`

**Step 5: Commit**

```bash
git add database/prisma/schema.prisma
git commit -m "feat(schema): add StatementPeriod model with audit relations"
```

---

### Task 6: Create StatementRun Model

**Files:**
- Modify: `database/prisma/schema.prisma`

**Step 1: Add StatementRun model**

```prisma
model StatementRun {
  id                    String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId                String              @db.Uuid
  statementPeriodId     String              @db.Uuid

  // Run identification
  runType               StatementRunType
  runNumber             Int

  // Status tracking
  status                StatementRunStatus  @default(PENDING)
  startedAt             DateTime?
  completedAt           DateTime?

  // Progress
  totalProfiles         Int                 @default(0)
  processedCount        Int                 @default(0)
  generatedCount        Int                 @default(0)
  skippedCount          Int                 @default(0)
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
  club                  Club                @relation(fields: [clubId], references: [id], onDelete: Cascade)
  statementPeriod       StatementPeriod     @relation(fields: [statementPeriodId], references: [id])
  createdByUser         User?               @relation("StatementRunCreatedBy", fields: [createdBy], references: [id])
  statements            Statement[]

  @@index([clubId, statementPeriodId])
  @@index([status])
  @@map("statement_runs")
}
```

**Step 2: Add relation to Club model**

```prisma
  statementRuns         StatementRun[]
```

**Step 3: Add relation to User model**

```prisma
  statementRunsCreated  StatementRun[]      @relation("StatementRunCreatedBy")
```

**Step 4: Verify schema**

Run: `cd database && npx prisma format`

**Step 5: Commit**

```bash
git add database/prisma/schema.prisma
git commit -m "feat(schema): add StatementRun model for batch processing"
```

---

### Task 7: Create Statement Model

**Files:**
- Modify: `database/prisma/schema.prisma`

**Step 1: Add Statement model**

```prisma
model Statement {
  id                    String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId                String              @db.Uuid
  statementRunId        String              @db.Uuid
  arProfileId           String              @db.Uuid

  // Statement identification (null until FINAL run)
  statementNumber       String?             @db.VarChar(20)

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

  // Transactions
  transactionCount      Int                 @default(0)
  transactions          Json?

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
  club                  Club                @relation(fields: [clubId], references: [id], onDelete: Cascade)
  statementRun          StatementRun        @relation(fields: [statementRunId], references: [id])
  arProfile             ARProfile           @relation(fields: [arProfileId], references: [id])

  @@unique([clubId, statementNumber])
  @@index([clubId, arProfileId])
  @@index([statementRunId])
  @@index([closingBalance])
  @@map("statements")
}
```

**Step 2: Add relation to Club model**

```prisma
  statements            Statement[]
```

**Step 3: Verify schema**

Run: `cd database && npx prisma format`

**Step 4: Commit**

```bash
git add database/prisma/schema.prisma
git commit -m "feat(schema): add Statement model with delivery tracking"
```

---

### Task 8: Run Database Migration

**Files:**
- Create: `database/prisma/migrations/YYYYMMDDHHMMSS_ar_statement_system/migration.sql`

**Step 1: Generate migration**

Run: `cd database && npx prisma migrate dev --name ar_statement_system`

Expected: Migration created and applied successfully

**Step 2: Verify migration**

Run: `cd database && npx prisma migrate status`

Expected: All migrations applied

**Step 3: Generate Prisma client**

Run: `cd database && npx prisma generate`

**Step 4: Commit**

```bash
git add database/prisma/migrations/
git commit -m "feat(db): run ar_statement_system migration"
```

---

## Phase 2: Backend Services (NestJS)

> **For Claude:** Use nextjs-backend-engineer skill for all Phase 2 tasks.

### Task 9: Create AR Profile GraphQL Types

**Files:**
- Create: `apps/api/src/graphql/ar-statements/ar-profile.types.ts`

**Step 1: Create the types file**

```typescript
import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';

// Register enums with GraphQL
export enum ARProfileType {
  MEMBER = 'MEMBER',
  CITY_LEDGER = 'CITY_LEDGER',
}

export enum ARProfileStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

export enum StatementDelivery {
  EMAIL = 'EMAIL',
  PRINT = 'PRINT',
  PORTAL = 'PORTAL',
  SMS = 'SMS',
  EMAIL_AND_PRINT = 'EMAIL_AND_PRINT',
  ALL = 'ALL',
}

registerEnumType(ARProfileType, {
  name: 'ARProfileType',
  description: 'Type of AR profile',
});

registerEnumType(ARProfileStatus, {
  name: 'ARProfileStatus',
  description: 'Status of AR profile',
});

registerEnumType(StatementDelivery, {
  name: 'StatementDelivery',
  description: 'Statement delivery method',
});

@ObjectType()
export class ARProfileType_ {
  @Field(() => ID)
  id: string;

  @Field()
  accountNumber: string;

  @Field(() => ARProfileType)
  profileType: ARProfileType;

  @Field(() => ID, { nullable: true })
  memberId?: string;

  @Field(() => ID, { nullable: true })
  cityLedgerId?: string;

  @Field(() => StatementDelivery)
  statementDelivery: StatementDelivery;

  @Field(() => Int)
  paymentTermsDays: number;

  @Field(() => Float, { nullable: true })
  creditLimit?: number;

  @Field(() => Float)
  currentBalance: number;

  @Field(() => GraphQLDateTime, { nullable: true })
  lastStatementDate?: Date;

  @Field(() => Float, { nullable: true })
  lastStatementBalance?: number;

  @Field(() => ARProfileStatus)
  status: ARProfileStatus;

  @Field(() => GraphQLDateTime)
  createdAt: Date;

  @Field(() => GraphQLDateTime)
  updatedAt: Date;
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/ar-statements/
git commit -m "feat(api): add AR profile GraphQL types"
```

---

### Task 10: Create Statement Period GraphQL Types

**Files:**
- Create: `apps/api/src/graphql/ar-statements/statement-period.types.ts`

**Step 1: Create the types file**

```typescript
import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';

export enum PeriodStatus {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED',
}

registerEnumType(PeriodStatus, {
  name: 'PeriodStatus',
  description: 'Status of statement period',
});

@ObjectType()
export class StatementPeriodType {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  periodYear: number;

  @Field(() => Int)
  periodNumber: number;

  @Field()
  periodLabel: string;

  @Field(() => GraphQLDateTime)
  periodStart: Date;

  @Field(() => GraphQLDateTime)
  periodEnd: Date;

  @Field(() => GraphQLDateTime)
  cutoffDate: Date;

  @Field(() => PeriodStatus)
  status: PeriodStatus;

  @Field(() => GraphQLDateTime, { nullable: true })
  closedAt?: Date;

  @Field(() => ID, { nullable: true })
  closedBy?: string;

  @Field(() => GraphQLDateTime, { nullable: true })
  reopenedAt?: Date;

  @Field({ nullable: true })
  reopenReason?: string;

  @Field(() => Int, { nullable: true })
  totalProfiles?: number;

  @Field(() => Int, { nullable: true })
  totalStatements?: number;

  @Field(() => Float, { nullable: true })
  totalOpeningBalance?: number;

  @Field(() => Float, { nullable: true })
  totalClosingBalance?: number;

  @Field(() => GraphQLDateTime)
  createdAt: Date;
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/ar-statements/statement-period.types.ts
git commit -m "feat(api): add StatementPeriod GraphQL types"
```

---

### Task 11: Create Statement Run GraphQL Types

**Files:**
- Create: `apps/api/src/graphql/ar-statements/statement-run.types.ts`

**Step 1: Create the types file**

```typescript
import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';
import { GraphQLDateTime } from 'graphql-scalars';

export enum StatementRunType {
  PREVIEW = 'PREVIEW',
  FINAL = 'FINAL',
}

export enum StatementRunStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(StatementRunType, {
  name: 'StatementRunType',
  description: 'Type of statement run',
});

registerEnumType(StatementRunStatus, {
  name: 'StatementRunStatus',
  description: 'Status of statement run',
});

@ObjectType()
export class StatementRunType_ {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  statementPeriodId: string;

  @Field(() => StatementRunType)
  runType: StatementRunType;

  @Field(() => Int)
  runNumber: number;

  @Field(() => StatementRunStatus)
  status: StatementRunStatus;

  @Field(() => GraphQLDateTime, { nullable: true })
  startedAt?: Date;

  @Field(() => GraphQLDateTime, { nullable: true })
  completedAt?: Date;

  @Field(() => Int)
  totalProfiles: number;

  @Field(() => Int)
  processedCount: number;

  @Field(() => Int)
  generatedCount: number;

  @Field(() => Int)
  skippedCount: number;

  @Field(() => Int)
  errorCount: number;

  @Field(() => Float)
  totalOpeningBalance: number;

  @Field(() => Float)
  totalDebits: number;

  @Field(() => Float)
  totalCredits: number;

  @Field(() => Float)
  totalClosingBalance: number;

  @Field(() => GraphQLDateTime)
  createdAt: Date;
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/ar-statements/statement-run.types.ts
git commit -m "feat(api): add StatementRun GraphQL types"
```

---

### Task 12: Create Statement GraphQL Types

**Files:**
- Create: `apps/api/src/graphql/ar-statements/statement.types.ts`

**Step 1: Create the types file**

```typescript
import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';
import { GraphQLDateTime, GraphQLJSON } from 'graphql-scalars';
import { StatementDelivery } from './ar-profile.types';

export enum DeliveryStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
}

registerEnumType(DeliveryStatus, {
  name: 'DeliveryStatus',
  description: 'Delivery status for statement',
});

@ObjectType()
export class StatementType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  statementRunId: string;

  @Field(() => ID)
  arProfileId: string;

  @Field({ nullable: true })
  statementNumber?: string;

  @Field(() => GraphQLDateTime)
  periodStart: Date;

  @Field(() => GraphQLDateTime)
  periodEnd: Date;

  @Field(() => GraphQLDateTime)
  dueDate: Date;

  @Field(() => Float)
  openingBalance: number;

  @Field(() => Float)
  totalDebits: number;

  @Field(() => Float)
  totalCredits: number;

  @Field(() => Float)
  closingBalance: number;

  @Field(() => Float)
  agingCurrent: number;

  @Field(() => Float)
  aging1to30: number;

  @Field(() => Float)
  aging31to60: number;

  @Field(() => Float)
  aging61to90: number;

  @Field(() => Float)
  aging90Plus: number;

  @Field(() => GraphQLJSON)
  profileSnapshot: any;

  @Field(() => Int)
  transactionCount: number;

  @Field(() => GraphQLJSON, { nullable: true })
  transactions?: any;

  @Field({ nullable: true })
  pdfUrl?: string;

  @Field(() => StatementDelivery)
  deliveryMethod: StatementDelivery;

  @Field(() => DeliveryStatus)
  emailStatus: DeliveryStatus;

  @Field(() => DeliveryStatus)
  printStatus: DeliveryStatus;

  @Field(() => DeliveryStatus)
  portalStatus: DeliveryStatus;

  @Field(() => DeliveryStatus)
  smsStatus: DeliveryStatus;

  @Field(() => GraphQLDateTime)
  createdAt: Date;
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/ar-statements/statement.types.ts
git commit -m "feat(api): add Statement GraphQL types"
```

---

### Task 13: Create AR Profile Input Types

**Files:**
- Create: `apps/api/src/graphql/ar-statements/ar-profile.input.ts`

**Step 1: Create the input types file**

```typescript
import { InputType, Field, ID, Int, Float } from '@nestjs/graphql';
import { IsOptional, IsUUID, IsEnum, IsInt, IsNumber, Min, Max, IsString, MaxLength } from 'class-validator';
import { ARProfileType, ARProfileStatus, StatementDelivery } from './ar-profile.types';

@InputType()
export class CreateARProfileInput {
  @Field(() => ARProfileType)
  @IsEnum(ARProfileType)
  profileType: ARProfileType;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  memberId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  cityLedgerId?: string;

  @Field(() => StatementDelivery, { nullable: true })
  @IsOptional()
  @IsEnum(StatementDelivery)
  statementDelivery?: StatementDelivery;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  paymentTermsDays?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;
}

@InputType()
export class UpdateARProfileInput {
  @Field(() => StatementDelivery, { nullable: true })
  @IsOptional()
  @IsEnum(StatementDelivery)
  statementDelivery?: StatementDelivery;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(90)
  paymentTermsDays?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditLimit?: number;
}

@InputType()
export class ARProfileFilterInput {
  @Field(() => ARProfileType, { nullable: true })
  @IsOptional()
  @IsEnum(ARProfileType)
  profileType?: ARProfileType;

  @Field(() => ARProfileStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ARProfileStatus)
  status?: ARProfileStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/ar-statements/ar-profile.input.ts
git commit -m "feat(api): add AR profile GraphQL input types"
```

---

### Task 14: Create Statement Period Input Types

**Files:**
- Create: `apps/api/src/graphql/ar-statements/statement-period.input.ts`

**Step 1: Create the input types file**

```typescript
import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsString, IsDateString, MaxLength, Min, Max } from 'class-validator';

@InputType()
export class CreateStatementPeriodInput {
  @Field(() => Int)
  @IsInt()
  @Min(2020)
  @Max(2100)
  periodYear: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  @Max(52)
  periodNumber: number;

  @Field()
  @IsString()
  @MaxLength(50)
  periodLabel: string;

  @Field()
  @IsDateString()
  periodStart: string;

  @Field()
  @IsDateString()
  periodEnd: string;

  @Field()
  @IsDateString()
  cutoffDate: string;
}

@InputType()
export class ReopenStatementPeriodInput {
  @Field()
  @IsString()
  @MaxLength(500)
  reason: string;
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/ar-statements/statement-period.input.ts
git commit -m "feat(api): add StatementPeriod GraphQL input types"
```

---

### Task 15: Create Statement Run Input Types

**Files:**
- Create: `apps/api/src/graphql/ar-statements/statement-run.input.ts`

**Step 1: Create the input types file**

```typescript
import { InputType, Field, ID } from '@nestjs/graphql';
import { IsUUID, IsEnum } from 'class-validator';
import { StatementRunType } from './statement-run.types';

@InputType()
export class StartStatementRunInput {
  @Field(() => ID)
  @IsUUID()
  statementPeriodId: string;

  @Field(() => StatementRunType)
  @IsEnum(StatementRunType)
  runType: StatementRunType;
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/ar-statements/statement-run.input.ts
git commit -m "feat(api): add StatementRun GraphQL input types"
```

---

### Task 16: Create AR Profile Service

**Files:**
- Create: `apps/api/src/graphql/ar-statements/ar-profile.service.ts`

**Step 1: Create the service file**

```typescript
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ARProfileType, ARProfileStatus, StatementDelivery } from '@prisma/client';

@Injectable()
export class ARProfileService {
  private readonly logger = new Logger(ARProfileService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Generate next account number for club
   */
  private async generateAccountNumber(clubId: string, profileType: ARProfileType): Promise<string> {
    const prefix = profileType === 'MEMBER' ? 'M' : 'C';

    const lastProfile = await this.prisma.aRProfile.findFirst({
      where: { clubId, profileType },
      orderBy: { accountNumber: 'desc' },
      select: { accountNumber: true },
    });

    let nextNum = 1;
    if (lastProfile?.accountNumber) {
      const match = lastProfile.accountNumber.match(/\d+$/);
      if (match) {
        nextNum = parseInt(match[0], 10) + 1;
      }
    }

    return `${prefix}${nextNum.toString().padStart(6, '0')}`;
  }

  /**
   * Create AR profile for a member
   */
  async createForMember(
    clubId: string,
    memberId: string,
    options?: {
      statementDelivery?: StatementDelivery;
      paymentTermsDays?: number;
      creditLimit?: number;
    },
    userId?: string,
  ) {
    // Verify member exists and belongs to club
    const member = await this.prisma.member.findFirst({
      where: { id: memberId, clubId },
    });
    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Check if profile already exists
    const existing = await this.prisma.aRProfile.findFirst({
      where: { clubId, profileType: 'MEMBER', memberId },
    });
    if (existing) {
      throw new BadRequestException('AR profile already exists for this member');
    }

    const accountNumber = await this.generateAccountNumber(clubId, 'MEMBER');

    return this.prisma.aRProfile.create({
      data: {
        clubId,
        accountNumber,
        profileType: 'MEMBER',
        memberId,
        statementDelivery: options?.statementDelivery ?? 'EMAIL',
        paymentTermsDays: options?.paymentTermsDays ?? 15,
        creditLimit: options?.creditLimit,
        createdBy: userId,
      },
    });
  }

  /**
   * Create AR profile for a city ledger
   */
  async createForCityLedger(
    clubId: string,
    cityLedgerId: string,
    options?: {
      statementDelivery?: StatementDelivery;
      paymentTermsDays?: number;
      creditLimit?: number;
    },
    userId?: string,
  ) {
    // Verify city ledger exists and belongs to club
    const cityLedger = await this.prisma.cityLedger.findFirst({
      where: { id: cityLedgerId, clubId },
    });
    if (!cityLedger) {
      throw new NotFoundException('City ledger not found');
    }

    // Check if profile already exists
    const existing = await this.prisma.aRProfile.findFirst({
      where: { clubId, profileType: 'CITY_LEDGER', cityLedgerId },
    });
    if (existing) {
      throw new BadRequestException('AR profile already exists for this city ledger');
    }

    const accountNumber = await this.generateAccountNumber(clubId, 'CITY_LEDGER');

    return this.prisma.aRProfile.create({
      data: {
        clubId,
        accountNumber,
        profileType: 'CITY_LEDGER',
        cityLedgerId,
        statementDelivery: options?.statementDelivery ?? 'EMAIL',
        paymentTermsDays: options?.paymentTermsDays ?? 30,
        creditLimit: options?.creditLimit,
        createdBy: userId,
      },
    });
  }

  /**
   * Find all AR profiles for a club
   */
  async findAll(
    clubId: string,
    filter?: {
      profileType?: ARProfileType;
      status?: ARProfileStatus;
      search?: string;
    },
  ) {
    const where: any = { clubId };

    if (filter?.profileType) {
      where.profileType = filter.profileType;
    }
    if (filter?.status) {
      where.status = filter.status;
    }
    if (filter?.search) {
      where.OR = [
        { accountNumber: { contains: filter.search, mode: 'insensitive' } },
        { member: { firstName: { contains: filter.search, mode: 'insensitive' } } },
        { member: { lastName: { contains: filter.search, mode: 'insensitive' } } },
        { cityLedger: { name: { contains: filter.search, mode: 'insensitive' } } },
      ];
    }

    return this.prisma.aRProfile.findMany({
      where,
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            memberNumber: true,
            email: true,
          },
        },
        cityLedger: {
          select: {
            id: true,
            name: true,
            type: true,
            contactEmail: true,
          },
        },
      },
      orderBy: { accountNumber: 'asc' },
    });
  }

  /**
   * Find AR profile by ID
   */
  async findById(id: string) {
    const profile = await this.prisma.aRProfile.findUnique({
      where: { id },
      include: {
        member: true,
        cityLedger: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('AR profile not found');
    }

    return profile;
  }

  /**
   * Update AR profile
   */
  async update(
    id: string,
    data: {
      statementDelivery?: StatementDelivery;
      paymentTermsDays?: number;
      creditLimit?: number;
    },
    userId?: string,
  ) {
    return this.prisma.aRProfile.update({
      where: { id },
      data: {
        ...data,
        updatedBy: userId,
      },
    });
  }

  /**
   * Suspend AR profile
   */
  async suspend(id: string, reason: string, userId?: string) {
    return this.prisma.aRProfile.update({
      where: { id },
      data: {
        status: 'SUSPENDED',
        suspendedAt: new Date(),
        suspendedReason: reason,
        updatedBy: userId,
      },
    });
  }

  /**
   * Close AR profile
   */
  async close(id: string, reason: string, userId?: string) {
    const profile = await this.findById(id);

    if (profile.currentBalance !== 0) {
      throw new BadRequestException('Cannot close profile with non-zero balance');
    }

    return this.prisma.aRProfile.update({
      where: { id },
      data: {
        status: 'CLOSED',
        closedAt: new Date(),
        closedReason: reason,
        updatedBy: userId,
      },
    });
  }

  /**
   * Update balance after transactions
   */
  async updateBalance(id: string, newBalance: number) {
    return this.prisma.aRProfile.update({
      where: { id },
      data: { currentBalance: newBalance },
    });
  }

  /**
   * Get all active profiles for statement generation
   */
  async getActiveProfiles(clubId: string) {
    return this.prisma.aRProfile.findMany({
      where: {
        clubId,
        status: 'ACTIVE',
      },
      include: {
        member: true,
        cityLedger: true,
      },
    });
  }
}
```

**Step 2: Commit**

```bash
git add apps/api/src/graphql/ar-statements/ar-profile.service.ts
git commit -m "feat(api): add ARProfileService with CRUD operations"
```

---

I'll continue with the remaining tasks in the next part. The plan continues with:
- Task 17-20: Statement Period, Statement Run, and Statement services
- Task 21-24: GraphQL resolvers
- Task 25: Module registration
- Phase 3: Frontend components (Tasks 26-35)
