# Billing Cycle Configuration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement configurable billing cycles for ClubVantage with support for Monthly, Quarterly, Semi-Annual, and Annual billing frequencies, proration, and late fee management.

**Architecture:** Three-tier configuration hierarchy (Club defaults → Membership Type overrides → Member profile overrides) with utility functions for billing period, proration, and late fee calculations.

**Tech Stack:** Prisma ORM, NestJS (DTOs, Services, GraphQL), React/Next.js, TanStack Query

---

## Phase 1: Database Schema (Prisma)

### Task 1.1: Add Billing Enums to Schema
**Files:**
- Modify: `/Users/peak/development/vantage/clubvantage/database/prisma/schema.prisma`

**Step 1: Add billing cycle enums after existing enums (around line 1100)**

```prisma
enum BillingFrequency {
  MONTHLY
  QUARTERLY
  SEMI_ANNUAL
  ANNUAL
}

enum BillingTiming {
  ADVANCE
  ARREARS
}

enum CycleAlignment {
  CALENDAR
  ANNIVERSARY
}

enum ProrationMethod {
  DAILY
  MONTHLY
  NONE
}

enum LateFeeType {
  PERCENTAGE
  FIXED
  TIERED
}
```

**Step 2: Verify schema**
Run: `cd /Users/peak/development/vantage/clubvantage/database && npx prisma validate`
Expected: "The Prisma schema is valid"

---

### Task 1.2: Add ClubBillingSettings Model
**Files:**
- Modify: `/Users/peak/development/vantage/clubvantage/database/prisma/schema.prisma`

**Step 1: Add ClubBillingSettings model after ClubGolfSettings (around line 130)**

```prisma
/// Club billing settings for cycle configuration
model ClubBillingSettings {
  id                    String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  clubId                String           @unique @db.Uuid
  defaultFrequency      BillingFrequency @default(MONTHLY)
  defaultTiming         BillingTiming    @default(ADVANCE)
  defaultAlignment      CycleAlignment   @default(CALENDAR)
  defaultBillingDay     Int              @default(1)
  invoiceGenerationLead Int              @default(5)
  invoiceDueDays        Int              @default(15)
  gracePeriodDays       Int              @default(15)
  lateFeeType           LateFeeType      @default(PERCENTAGE)
  lateFeeAmount         Decimal          @default(0) @db.Decimal(12, 2)
  lateFeePercentage     Decimal          @default(1.5) @db.Decimal(5, 2)
  maxLateFee            Decimal?         @db.Decimal(12, 2)
  autoApplyLateFee      Boolean          @default(false)
  prorateNewMembers     Boolean          @default(true)
  prorateChanges        Boolean          @default(true)
  prorationMethod       ProrationMethod  @default(DAILY)
  createdAt             DateTime         @default(now())
  updatedAt             DateTime         @updatedAt
  club                  Club             @relation(fields: [clubId], references: [id], onDelete: Cascade)

  @@index([clubId])
  @@map("club_billing_settings")
}
```

**Step 2: Verify schema**
Run: `npx prisma validate`
Expected: "The Prisma schema is valid"

---

### Task 1.3: Add MemberBillingProfile Model
**Files:**
- Modify: `/Users/peak/development/vantage/clubvantage/database/prisma/schema.prisma`

**Step 1: Add MemberBillingProfile model after ClubBillingSettings**

```prisma
/// Member-specific billing profile overrides
model MemberBillingProfile {
  id                    String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  memberId              String           @unique @db.Uuid
  billingFrequency      BillingFrequency?
  billingTiming         BillingTiming?
  billingAlignment      CycleAlignment?
  customBillingDay      Int?
  nextBillingDate       DateTime?
  lastBillingDate       DateTime?
  currentPeriodStart    DateTime?
  currentPeriodEnd      DateTime?
  billingHold           Boolean          @default(false)
  billingHoldReason     String?
  billingHoldUntil      DateTime?
  prorationOverride     ProrationMethod?
  customGracePeriod     Int?
  customLateFeeExempt   Boolean          @default(false)
  notes                 String?
  createdAt             DateTime         @default(now())
  updatedAt             DateTime         @updatedAt
  member                Member           @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@index([memberId])
  @@index([nextBillingDate])
  @@map("member_billing_profiles")
}
```

**Step 2: Verify schema**
Run: `npx prisma validate`
Expected: "The Prisma schema is valid"

---

### Task 1.4: Update Club and Member Model Relations
**Files:**
- Modify: `/Users/peak/development/vantage/clubvantage/database/prisma/schema.prisma`

**Step 1: Add billingSettings relation to Club model (around line 78)**

Add to Club model relations:
```prisma
  billingSettings        ClubBillingSettings?
```

**Step 2: Add billingProfile relation to Member model (around line 266)**

Add to Member model relations:
```prisma
  billingProfile         MemberBillingProfile?
```

**Step 3: Verify schema**
Run: `npx prisma validate`
Expected: "The Prisma schema is valid"

---

### Task 1.5: Run Prisma Migration
**Step 1: Create and run migration**
```bash
cd /Users/peak/development/vantage/clubvantage/database
npx prisma migrate dev --name add_billing_cycle_configuration
```

**Step 2: Regenerate Prisma client**
```bash
npx prisma generate
```

**Step 3: Verify migration**
Check that migration file exists in `prisma/migrations/` directory

**Step 4: Commit**
```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(billing): add billing cycle configuration schema

- Add BillingFrequency, BillingTiming, CycleAlignment enums
- Add ClubBillingSettings model for club-level defaults
- Add MemberBillingProfile model for member-level overrides
- Add relations to Club and Member models

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 2: Backend DTOs (NestJS)

### Task 2.1: Create Club Billing Settings DTOs
**Files:**
- Create: `/Users/peak/development/vantage/clubvantage/apps/api/src/modules/billing/dto/club-billing-settings.dto.ts`

**Step 1: Create the DTO file with enums and validation**

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  Min,
  Max,
} from 'class-validator';

export enum BillingFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  ANNUAL = 'ANNUAL',
}

export enum BillingTiming {
  ADVANCE = 'ADVANCE',
  ARREARS = 'ARREARS',
}

export enum CycleAlignment {
  CALENDAR = 'CALENDAR',
  ANNIVERSARY = 'ANNIVERSARY',
}

export enum ProrationMethod {
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY',
  NONE = 'NONE',
}

export enum LateFeeType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
  TIERED = 'TIERED',
}

export class UpdateClubBillingSettingsDto {
  @ApiPropertyOptional({ enum: BillingFrequency })
  @IsOptional()
  @IsEnum(BillingFrequency)
  defaultFrequency?: BillingFrequency;

  @ApiPropertyOptional({ enum: BillingTiming })
  @IsOptional()
  @IsEnum(BillingTiming)
  defaultTiming?: BillingTiming;

  @ApiPropertyOptional({ enum: CycleAlignment })
  @IsOptional()
  @IsEnum(CycleAlignment)
  defaultAlignment?: CycleAlignment;

  @ApiPropertyOptional({ example: 1, minimum: 1, maximum: 28 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(28)
  defaultBillingDay?: number;

  @ApiPropertyOptional({ example: 5, minimum: 0, maximum: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
  invoiceGenerationLead?: number;

  @ApiPropertyOptional({ example: 15, minimum: 1, maximum: 60 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  invoiceDueDays?: number;

  @ApiPropertyOptional({ example: 15, minimum: 0, maximum: 60 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(60)
  gracePeriodDays?: number;

  @ApiPropertyOptional({ enum: LateFeeType })
  @IsOptional()
  @IsEnum(LateFeeType)
  lateFeeType?: LateFeeType;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lateFeeAmount?: number;

  @ApiPropertyOptional({ example: 1.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  lateFeePercentage?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxLateFee?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoApplyLateFee?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  prorateNewMembers?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  prorateChanges?: boolean;

  @ApiPropertyOptional({ enum: ProrationMethod })
  @IsOptional()
  @IsEnum(ProrationMethod)
  prorationMethod?: ProrationMethod;
}
```

**Step 2: Verify TypeScript compilation**
Run: `cd /Users/peak/development/vantage/clubvantage/apps/api && npx tsc --noEmit`
Expected: No errors

---

### Task 2.2: Create Member Billing Profile DTOs
**Files:**
- Create: `/Users/peak/development/vantage/clubvantage/apps/api/src/modules/billing/dto/member-billing-profile.dto.ts`

**Step 1: Create the DTO file**

```typescript
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsEnum,
  IsDateString,
  IsString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import {
  BillingFrequency,
  BillingTiming,
  CycleAlignment,
  ProrationMethod,
} from './club-billing-settings.dto';

export class CreateMemberBillingProfileDto {
  @ApiProperty({ description: 'Member ID' })
  @IsUUID()
  memberId: string;

  @ApiPropertyOptional({ enum: BillingFrequency })
  @IsOptional()
  @IsEnum(BillingFrequency)
  billingFrequency?: BillingFrequency;

  @ApiPropertyOptional({ enum: BillingTiming })
  @IsOptional()
  @IsEnum(BillingTiming)
  billingTiming?: BillingTiming;

  @ApiPropertyOptional({ enum: CycleAlignment })
  @IsOptional()
  @IsEnum(CycleAlignment)
  billingAlignment?: CycleAlignment;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(28)
  customBillingDay?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  nextBillingDate?: string;

  @ApiPropertyOptional({ enum: ProrationMethod })
  @IsOptional()
  @IsEnum(ProrationMethod)
  prorationOverride?: ProrationMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  customGracePeriod?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  customLateFeeExempt?: boolean;
}

export class UpdateMemberBillingProfileDto {
  @ApiPropertyOptional({ enum: BillingFrequency })
  @IsOptional()
  @IsEnum(BillingFrequency)
  billingFrequency?: BillingFrequency;

  @ApiPropertyOptional({ enum: BillingTiming })
  @IsOptional()
  @IsEnum(BillingTiming)
  billingTiming?: BillingTiming;

  @ApiPropertyOptional({ enum: CycleAlignment })
  @IsOptional()
  @IsEnum(CycleAlignment)
  billingAlignment?: CycleAlignment;

  @ApiPropertyOptional({ example: 15 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(28)
  customBillingDay?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  nextBillingDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  billingHold?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  billingHoldReason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  billingHoldUntil?: string;

  @ApiPropertyOptional({ enum: ProrationMethod })
  @IsOptional()
  @IsEnum(ProrationMethod)
  prorationOverride?: ProrationMethod;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  customGracePeriod?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  customLateFeeExempt?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
```

**Step 2: Verify TypeScript compilation**
Run: `npx tsc --noEmit`
Expected: No errors

---

### Task 2.3: Export DTOs from Index
**Files:**
- Modify: `/Users/peak/development/vantage/clubvantage/apps/api/src/modules/billing/dto/index.ts`

**Step 1: Add exports**

```typescript
export * from './club-billing-settings.dto';
export * from './member-billing-profile.dto';
```

**Step 2: Verify TypeScript compilation**
Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**
```bash
git add apps/api/src/modules/billing/dto/
git commit -m "feat(billing): add DTOs for billing cycle configuration

- Add BillingFrequency, BillingTiming, CycleAlignment enums
- Add UpdateClubBillingSettingsDto with validation
- Add Create/UpdateMemberBillingProfileDto

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 3: Backend Utilities (NestJS)

### Task 3.1: Create Billing Cycle Calculation Utility
**Files:**
- Create: `/Users/peak/development/vantage/clubvantage/apps/api/src/modules/billing/utils/billing-cycle.util.ts`

**Step 1: Create the utility file**

```typescript
import {
  BillingFrequency,
  BillingTiming,
  CycleAlignment,
} from '../dto/club-billing-settings.dto';

export interface BillingCycleConfig {
  frequency: BillingFrequency;
  timing: BillingTiming;
  alignment: CycleAlignment;
  billingDay: number;
  joinDate?: Date;
}

export interface BillingPeriod {
  periodStart: Date;
  periodEnd: Date;
  billingDate: Date;
  dueDate: Date;
  description: string;
}

export function calculateNextBillingPeriod(
  config: BillingCycleConfig,
  referenceDate: Date = new Date(),
  invoiceDueDays: number = 15,
): BillingPeriod {
  const { frequency, timing, alignment, billingDay, joinDate } = config;

  let periodStart: Date;

  if (alignment === CycleAlignment.CALENDAR) {
    periodStart = getCalendarPeriodStart(referenceDate, frequency, billingDay);
  } else {
    const anniversary = joinDate || referenceDate;
    periodStart = getAnniversaryPeriodStart(referenceDate, anniversary, frequency);
  }

  const periodEnd = calculatePeriodEnd(periodStart, frequency);

  const billingDate = timing === BillingTiming.ADVANCE
    ? periodStart
    : periodEnd;

  const dueDate = new Date(billingDate);
  dueDate.setDate(dueDate.getDate() + invoiceDueDays);

  return {
    periodStart,
    periodEnd,
    billingDate,
    dueDate,
    description: formatPeriodDescription(periodStart, periodEnd, frequency),
  };
}

function getCalendarPeriodStart(
  referenceDate: Date,
  frequency: BillingFrequency,
  billingDay: number,
): Date {
  const date = new Date(referenceDate);
  date.setDate(billingDay);
  date.setHours(0, 0, 0, 0);

  if (referenceDate.getDate() >= billingDay) {
    advancePeriod(date, frequency);
  }

  return date;
}

function getAnniversaryPeriodStart(
  referenceDate: Date,
  joinDate: Date,
  frequency: BillingFrequency,
): Date {
  const periodStart = new Date(joinDate);
  periodStart.setHours(0, 0, 0, 0);

  while (periodStart < referenceDate) {
    advancePeriod(periodStart, frequency);
  }

  return periodStart;
}

function advancePeriod(date: Date, frequency: BillingFrequency): void {
  switch (frequency) {
    case BillingFrequency.MONTHLY:
      date.setMonth(date.getMonth() + 1);
      break;
    case BillingFrequency.QUARTERLY:
      date.setMonth(date.getMonth() + 3);
      break;
    case BillingFrequency.SEMI_ANNUAL:
      date.setMonth(date.getMonth() + 6);
      break;
    case BillingFrequency.ANNUAL:
      date.setFullYear(date.getFullYear() + 1);
      break;
  }
}

function calculatePeriodEnd(periodStart: Date, frequency: BillingFrequency): Date {
  const periodEnd = new Date(periodStart);
  advancePeriod(periodEnd, frequency);
  periodEnd.setDate(periodEnd.getDate() - 1);
  return periodEnd;
}

function formatPeriodDescription(
  start: Date,
  end: Date,
  frequency: BillingFrequency,
): string {
  const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' });

  if (frequency === BillingFrequency.MONTHLY) {
    return formatter.format(start);
  }

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

export function getFrequencyMultiplier(frequency: BillingFrequency): number {
  switch (frequency) {
    case BillingFrequency.MONTHLY: return 12;
    case BillingFrequency.QUARTERLY: return 4;
    case BillingFrequency.SEMI_ANNUAL: return 2;
    case BillingFrequency.ANNUAL: return 1;
  }
}

export function getMonthsPerCycle(frequency: BillingFrequency): number {
  switch (frequency) {
    case BillingFrequency.MONTHLY: return 1;
    case BillingFrequency.QUARTERLY: return 3;
    case BillingFrequency.SEMI_ANNUAL: return 6;
    case BillingFrequency.ANNUAL: return 12;
  }
}
```

**Step 2: Verify TypeScript compilation**
Run: `npx tsc --noEmit`
Expected: No errors

---

### Task 3.2: Create Proration Calculation Utility
**Files:**
- Create: `/Users/peak/development/vantage/clubvantage/apps/api/src/modules/billing/utils/proration.util.ts`

**Step 1: Create the utility file**

```typescript
import { ProrationMethod } from '../dto/club-billing-settings.dto';

export interface ProrationConfig {
  method: ProrationMethod;
  periodStart: Date;
  periodEnd: Date;
  effectiveDate: Date;
  fullPeriodAmount: number;
}

export interface ProrationResult {
  proratedAmount: number;
  daysInPeriod: number;
  daysProrated: number;
  prorationFactor: number;
  description: string;
}

export function calculateProration(config: ProrationConfig): ProrationResult {
  const { method, periodStart, periodEnd, effectiveDate, fullPeriodAmount } = config;

  if (method === ProrationMethod.NONE) {
    return {
      proratedAmount: fullPeriodAmount,
      daysInPeriod: getDaysBetween(periodStart, periodEnd) + 1,
      daysProrated: getDaysBetween(periodStart, periodEnd) + 1,
      prorationFactor: 1,
      description: 'Full period (no proration)',
    };
  }

  if (method === ProrationMethod.MONTHLY) {
    return calculateMonthlyProration(periodStart, periodEnd, effectiveDate, fullPeriodAmount);
  }

  return calculateDailyProration(periodStart, periodEnd, effectiveDate, fullPeriodAmount);
}

function calculateDailyProration(
  periodStart: Date,
  periodEnd: Date,
  effectiveDate: Date,
  fullPeriodAmount: number,
): ProrationResult {
  const totalDays = getDaysBetween(periodStart, periodEnd) + 1;
  const proratedDays = getDaysBetween(effectiveDate, periodEnd) + 1;
  const factor = proratedDays / totalDays;
  const proratedAmount = Math.round(fullPeriodAmount * factor * 100) / 100;

  return {
    proratedAmount,
    daysInPeriod: totalDays,
    daysProrated: proratedDays,
    prorationFactor: Math.round(factor * 10000) / 10000,
    description: `${proratedDays} of ${totalDays} days (daily proration)`,
  };
}

function calculateMonthlyProration(
  periodStart: Date,
  periodEnd: Date,
  effectiveDate: Date,
  fullPeriodAmount: number,
): ProrationResult {
  const totalMonths = getMonthsBetween(periodStart, periodEnd);
  const proratedMonths = getMonthsBetween(effectiveDate, periodEnd);

  const effectiveMonths = Math.ceil(proratedMonths);
  const factor = effectiveMonths / Math.ceil(totalMonths);
  const proratedAmount = Math.round(fullPeriodAmount * factor * 100) / 100;

  return {
    proratedAmount,
    daysInPeriod: getDaysBetween(periodStart, periodEnd) + 1,
    daysProrated: getDaysBetween(effectiveDate, periodEnd) + 1,
    prorationFactor: Math.round(factor * 10000) / 10000,
    description: `${effectiveMonths} of ${Math.ceil(totalMonths)} months (monthly proration)`,
  };
}

function getDaysBetween(start: Date, end: Date): number {
  const startTime = new Date(start).setHours(0, 0, 0, 0);
  const endTime = new Date(end).setHours(0, 0, 0, 0);
  return Math.floor((endTime - startTime) / (1000 * 60 * 60 * 24));
}

function getMonthsBetween(start: Date, end: Date): number {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const yearDiff = endDate.getFullYear() - startDate.getFullYear();
  const monthDiff = endDate.getMonth() - startDate.getMonth();
  const dayDiff = endDate.getDate() - startDate.getDate();

  let months = yearDiff * 12 + monthDiff;
  if (dayDiff > 0) {
    months += dayDiff / 30;
  }

  return months;
}
```

**Step 2: Verify TypeScript compilation**
Run: `npx tsc --noEmit`
Expected: No errors

---

### Task 3.3: Create Late Fee Calculation Utility
**Files:**
- Create: `/Users/peak/development/vantage/clubvantage/apps/api/src/modules/billing/utils/late-fee.util.ts`

**Step 1: Create the utility file**

```typescript
import { LateFeeType } from '../dto/club-billing-settings.dto';

export interface LateFeeConfig {
  type: LateFeeType;
  amount: number;
  percentage: number;
  maxFee?: number;
  gracePeriodDays: number;
}

export interface LateFeeResult {
  feeAmount: number;
  daysOverdue: number;
  appliedDate: Date;
  description: string;
  isWithinGracePeriod: boolean;
}

export function calculateLateFee(
  invoiceBalance: number,
  dueDate: Date,
  config: LateFeeConfig,
  calculationDate: Date = new Date(),
): LateFeeResult {
  const daysOverdue = getDaysOverdue(dueDate, calculationDate);
  const isWithinGracePeriod = daysOverdue <= config.gracePeriodDays;

  if (isWithinGracePeriod || daysOverdue <= 0) {
    return {
      feeAmount: 0,
      daysOverdue: Math.max(0, daysOverdue),
      appliedDate: calculationDate,
      description: isWithinGracePeriod
        ? `Within grace period (${config.gracePeriodDays} days)`
        : 'Not overdue',
      isWithinGracePeriod: true,
    };
  }

  let feeAmount: number;
  let description: string;

  switch (config.type) {
    case LateFeeType.PERCENTAGE:
      feeAmount = invoiceBalance * (config.percentage / 100);
      description = `${config.percentage}% of outstanding balance`;
      break;

    case LateFeeType.FIXED:
      feeAmount = config.amount;
      description = `Fixed late fee`;
      break;

    case LateFeeType.TIERED:
      feeAmount = calculateTieredLateFee(invoiceBalance, daysOverdue, config);
      description = `Tiered late fee (${daysOverdue} days overdue)`;
      break;

    default:
      feeAmount = 0;
      description = 'No late fee configured';
  }

  if (config.maxFee && feeAmount > config.maxFee) {
    feeAmount = config.maxFee;
    description += ` (capped at max)`;
  }

  feeAmount = Math.round(feeAmount * 100) / 100;

  return {
    feeAmount,
    daysOverdue,
    appliedDate: calculationDate,
    description,
    isWithinGracePeriod: false,
  };
}

function getDaysOverdue(dueDate: Date, calculationDate: Date): number {
  const due = new Date(dueDate).setHours(0, 0, 0, 0);
  const calc = new Date(calculationDate).setHours(0, 0, 0, 0);
  return Math.floor((calc - due) / (1000 * 60 * 60 * 24));
}

function calculateTieredLateFee(
  invoiceBalance: number,
  daysOverdue: number,
  config: LateFeeConfig,
): number {
  let multiplier = 1;
  if (daysOverdue > 90) {
    multiplier = 2.5;
  } else if (daysOverdue > 60) {
    multiplier = 2;
  } else if (daysOverdue > 30) {
    multiplier = 1.5;
  }

  return invoiceBalance * (config.percentage / 100) * multiplier;
}

export function shouldApplyLateFee(
  dueDate: Date,
  gracePeriodDays: number,
  calculationDate: Date = new Date(),
): boolean {
  const daysOverdue = getDaysOverdue(dueDate, calculationDate);
  return daysOverdue > gracePeriodDays;
}
```

**Step 2: Verify TypeScript compilation**
Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**
```bash
git add apps/api/src/modules/billing/utils/
git commit -m "feat(billing): add billing cycle calculation utilities

- Add billing-cycle.util.ts for period calculations
- Add proration.util.ts for mid-cycle enrollment
- Add late-fee.util.ts for fee calculations

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 4: Backend Service (NestJS)

### Task 4.1: Create Billing Cycle Settings Service
**Files:**
- Create: `/Users/peak/development/vantage/clubvantage/apps/api/src/modules/billing/billing-cycle-settings.service.ts`

**Step 1: Create the service file**

[Full service implementation as shown in the exploration above - see Task 3.4]

**Step 2: Verify TypeScript compilation**
Run: `npx tsc --noEmit`
Expected: No errors

---

### Task 4.2: Update Billing Module
**Files:**
- Modify: `/Users/peak/development/vantage/clubvantage/apps/api/src/modules/billing/billing.module.ts`

**Step 1: Add BillingCycleSettingsService to providers and exports**

**Step 2: Verify TypeScript compilation**
Run: `npx tsc --noEmit`
Expected: No errors

**Step 3: Commit**
```bash
git add apps/api/src/modules/billing/
git commit -m "feat(billing): add billing cycle settings service

- Add BillingCycleSettingsService with CRUD operations
- Support club-level and member-level billing configuration
- Integrate with EventStore for audit logging

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 5: GraphQL Layer (NestJS)

### Task 5.1: Create Billing Cycle GraphQL Types
**Files:**
- Create: `/Users/peak/development/vantage/clubvantage/apps/api/src/graphql/billing/billing-cycle.types.ts`

[Full implementation as shown in the exploration above - see Task 4.1]

---

### Task 5.2: Create Billing Cycle GraphQL Inputs
**Files:**
- Create: `/Users/peak/development/vantage/clubvantage/apps/api/src/graphql/billing/billing-cycle.input.ts`

[Full implementation as shown in the exploration above - see Task 4.2]

---

### Task 5.3: Create Billing Cycle Resolver
**Files:**
- Create: `/Users/peak/development/vantage/clubvantage/apps/api/src/graphql/billing/billing-cycle.resolver.ts`

[Full implementation as shown in the exploration above - see Task 4.3]

---

### Task 5.4: Update GraphQL Module
**Files:**
- Modify: `/Users/peak/development/vantage/clubvantage/apps/api/src/graphql/billing/billing.module.ts`

**Step 1: Add BillingCycleResolver**

**Step 2: Build and verify**
Run: `cd /Users/peak/development/vantage/clubvantage/apps/api && pnpm run build`
Expected: Build successful

**Step 3: Commit**
```bash
git add apps/api/src/graphql/billing/
git commit -m "feat(billing): add GraphQL API for billing cycle configuration

- Add ClubBillingSettingsType and MemberBillingProfileType
- Add queries: clubBillingSettings, memberBillingProfile
- Add mutations: updateClubBillingSettings, create/updateMemberBillingProfile
- Add preview queries for billing period, proration, and late fees

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 6: Frontend Implementation

### Task 6.1: Create Billing Settings Hook
**Files:**
- Create: `/Users/peak/development/vantage/clubvantage/apps/application/src/hooks/use-billing-settings.ts`

**Note:** Use **frontend-design skill** for this implementation

[Full implementation as shown in the exploration above - see Task 5.1]

---

### Task 6.2: Create Billing Cycle Settings Component
**Files:**
- Create: `/Users/peak/development/vantage/clubvantage/apps/application/src/components/settings/billing-cycle-section.tsx`

**Note:** Use **frontend-design skill** for this implementation

Design requirements:
- Follow ClubVantage design system (Amber primary, Emerald secondary, Stone neutral)
- DM Sans typography
- rounded-xl cards with shadow-lg shadow-stone-200/30
- Glassmorphism: bg-white/80 backdrop-blur-sm for overlays

Component should include:
- Frequency selector with visual cards (Monthly/Quarterly/Semi-Annual/Annual)
- Timing toggle (Advance/Arrears)
- Alignment selector (Calendar/Anniversary)
- Billing day input (1-28)
- Invoice generation lead days
- Due days configuration
- Grace period configuration
- Late fee configuration section
- Proration settings section

---

### Task 6.3: Create Member Billing Profile Modal
**Files:**
- Create: `/Users/peak/development/vantage/clubvantage/apps/application/src/components/billing/member-billing-profile-modal.tsx`

**Note:** Use **frontend-design skill** for this implementation

Modal should allow:
- Override frequency/timing/alignment
- Custom billing day
- Billing hold toggle with reason and date
- Proration method override
- Custom grace period
- Late fee exemption
- Notes field
- Next billing date preview

---

### Task 6.4: Create Billing Preview Card
**Files:**
- Create: `/Users/peak/development/vantage/clubvantage/apps/application/src/components/billing/billing-preview-card.tsx`

**Note:** Use **frontend-design skill** for this implementation

Card showing:
- Next billing date
- Current period (start - end)
- Billing frequency badge
- Billing timing badge

---

### Task 6.5: Update Settings Page
**Files:**
- Modify: `/Users/peak/development/vantage/clubvantage/apps/application/src/app/(dashboard)/settings/page.tsx`

**Step 1: Import and add BillingCycleSection to the settings layout**

**Step 2: Verify frontend builds**
Run: `cd /Users/peak/development/vantage/clubvantage/apps/application && pnpm run build`
Expected: Build successful

**Step 3: Commit**
```bash
git add apps/application/src/
git commit -m "feat(billing): add billing cycle configuration UI

- Add useBillingSettings hook for data fetching
- Add BillingCycleSection settings component
- Add MemberBillingProfileModal for member overrides
- Add BillingPreviewCard for inline billing info
- Integrate with settings page

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

## Phase 7: Testing and Verification

### Task 7.1: Regenerate GraphQL Schema
```bash
cd /Users/peak/development/vantage/clubvantage/apps/api
pnpm run dev
# Wait for schema.gql to generate, then Ctrl+C
```

### Task 7.2: Run API Client Codegen
```bash
cd /Users/peak/development/vantage/clubvantage
pnpm --filter @clubvantage/api-client run codegen
```

### Task 7.3: Final Build Verification
```bash
cd /Users/peak/development/vantage/clubvantage
pnpm run build
```

### Task 7.4: Run Tests
```bash
cd /Users/peak/development/vantage/clubvantage/apps/api
pnpm test
```

---

## Summary

**Files Created:**
- `database/prisma/schema.prisma` (modified)
- `apps/api/src/modules/billing/dto/club-billing-settings.dto.ts`
- `apps/api/src/modules/billing/dto/member-billing-profile.dto.ts`
- `apps/api/src/modules/billing/utils/billing-cycle.util.ts`
- `apps/api/src/modules/billing/utils/proration.util.ts`
- `apps/api/src/modules/billing/utils/late-fee.util.ts`
- `apps/api/src/modules/billing/billing-cycle-settings.service.ts`
- `apps/api/src/graphql/billing/billing-cycle.types.ts`
- `apps/api/src/graphql/billing/billing-cycle.input.ts`
- `apps/api/src/graphql/billing/billing-cycle.resolver.ts`
- `apps/application/src/hooks/use-billing-settings.ts`
- `apps/application/src/components/settings/billing-cycle-section.tsx`
- `apps/application/src/components/billing/member-billing-profile-modal.tsx`
- `apps/application/src/components/billing/billing-preview-card.tsx`

**Key Features:**
- Configurable billing cycles (Monthly, Quarterly, Semi-Annual, Annual)
- Advance/Arrears billing timing
- Calendar/Anniversary date alignment
- Pro-rated invoice generation
- Late fee calculation with grace periods
- Three-tier configuration hierarchy
