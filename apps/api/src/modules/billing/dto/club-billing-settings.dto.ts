import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsString,
  IsArray,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

// Enums matching Prisma schema definitions
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

// AR Period Settings Enums
export enum ARCycleType {
  CALENDAR_MONTH = 'CALENDAR_MONTH',
  ROLLING_30 = 'ROLLING_30',
  CUSTOM = 'CUSTOM',
}

export enum ARCloseBehavior {
  MANUAL = 'MANUAL',
  AUTO_AFTER_FINAL_RUN = 'AUTO_AFTER_FINAL_RUN',
  AUTO_ON_CUTOFF = 'AUTO_ON_CUTOFF',
}

export enum TaxMethod {
  ADDON = 'ADDON',
  INCLUDED = 'INCLUDED',
  EXEMPT = 'EXEMPT',
}

export enum BillingCycleMode {
  CLUB_CYCLE = 'CLUB_CYCLE',
  MEMBER_CYCLE = 'MEMBER_CYCLE',
}

export enum FinancialPeriodType {
  CALENDAR_MONTH = 'CALENDAR_MONTH',
  CUSTOM = 'CUSTOM',
}

export enum StatementDelivery {
  EMAIL = 'EMAIL',
  PRINT = 'PRINT',
  PORTAL = 'PORTAL',
  SMS = 'SMS',
  EMAIL_AND_PRINT = 'EMAIL_AND_PRINT',
  ALL = 'ALL',
}

export class UpdateClubBillingSettingsDto {
  @ApiPropertyOptional({
    enum: BillingFrequency,
    description: 'Default billing frequency for new members',
    example: BillingFrequency.MONTHLY,
  })
  @IsOptional()
  @IsEnum(BillingFrequency)
  defaultFrequency?: BillingFrequency;

  @ApiPropertyOptional({
    enum: BillingTiming,
    description: 'Whether to bill in advance or arrears',
    example: BillingTiming.ADVANCE,
  })
  @IsOptional()
  @IsEnum(BillingTiming)
  defaultTiming?: BillingTiming;

  @ApiPropertyOptional({
    enum: CycleAlignment,
    description: 'Billing cycle alignment (calendar or anniversary)',
    example: CycleAlignment.CALENDAR,
  })
  @IsOptional()
  @IsEnum(CycleAlignment)
  defaultAlignment?: CycleAlignment;

  @ApiPropertyOptional({
    description: 'Default day of month for billing (1-28)',
    example: 1,
    minimum: 1,
    maximum: 28,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(28)
  defaultBillingDay?: number;

  @ApiPropertyOptional({
    description: 'Days before billing cycle to generate invoices (0-30)',
    example: 7,
    minimum: 0,
    maximum: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
  invoiceGenerationLead?: number;

  @ApiPropertyOptional({
    description: 'Days after invoice date when payment is due (1-60)',
    example: 30,
    minimum: 1,
    maximum: 60,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  invoiceDueDays?: number;

  @ApiPropertyOptional({
    description: 'Grace period days after due date before late fees (0-60)',
    example: 15,
    minimum: 0,
    maximum: 60,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(60)
  gracePeriodDays?: number;

  @ApiPropertyOptional({
    enum: LateFeeType,
    description: 'Type of late fee to apply',
    example: LateFeeType.PERCENTAGE,
  })
  @IsOptional()
  @IsEnum(LateFeeType)
  lateFeeType?: LateFeeType;

  @ApiPropertyOptional({
    description: 'Fixed late fee amount (when lateFeeType is FIXED)',
    example: 2500,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lateFeeAmount?: number;

  @ApiPropertyOptional({
    description: 'Late fee percentage (0-100, when lateFeeType is PERCENTAGE)',
    example: 1.5,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  lateFeePercentage?: number;

  @ApiPropertyOptional({
    description: 'Maximum late fee cap amount',
    example: 10000,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxLateFee?: number;

  @ApiPropertyOptional({
    description: 'Automatically apply late fees when due',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  autoApplyLateFee?: boolean;

  @ApiPropertyOptional({
    description: 'Prorate charges for new members mid-cycle',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  prorateNewMembers?: boolean;

  @ApiPropertyOptional({
    description: 'Prorate charges for membership changes mid-cycle',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  prorateChanges?: boolean;

  @ApiPropertyOptional({
    enum: ProrationMethod,
    description: 'Method used for calculating prorated amounts',
    example: ProrationMethod.DAILY,
  })
  @IsOptional()
  @IsEnum(ProrationMethod)
  prorationMethod?: ProrationMethod;

  // AR Period Settings
  @ApiPropertyOptional({
    enum: ARCycleType,
    description: 'AR billing cycle type for period generation',
    example: ARCycleType.CALENDAR_MONTH,
  })
  @IsOptional()
  @IsEnum(ARCycleType)
  arCycleType?: ARCycleType;

  @ApiPropertyOptional({
    description: 'Day of month for CUSTOM cycle (1-28)',
    example: 25,
    minimum: 1,
    maximum: 28,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(28)
  arCustomCycleStartDay?: number;

  @ApiPropertyOptional({
    description: 'Days after period end to include transactions (0-15)',
    example: 5,
    minimum: 0,
    maximum: 15,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(15)
  arCutoffDays?: number;

  @ApiPropertyOptional({
    enum: ARCloseBehavior,
    description: 'How AR periods are closed',
    example: ARCloseBehavior.MANUAL,
  })
  @IsOptional()
  @IsEnum(ARCloseBehavior)
  arCloseBehavior?: ARCloseBehavior;

  @ApiPropertyOptional({
    description: 'Automatically create next period when current closes',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  arAutoGenerateNext?: boolean;

  // Billing Defaults
  @ApiPropertyOptional({ description: 'Default payment terms in days', example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(90)
  defaultPaymentTermsDays?: number;

  @ApiPropertyOptional({ description: 'Invoice number prefix', example: 'INV-' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  invoicePrefix?: string;

  @ApiPropertyOptional({ description: 'Invoice starting number', example: 1001 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  invoiceStartNumber?: number;

  @ApiPropertyOptional({ description: 'Day of month for auto-generation (1-28)', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(28)
  invoiceAutoGenerationDay?: number;

  @ApiPropertyOptional({ description: 'Default VAT rate percentage', example: 7 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defaultVatRate?: number;

  @ApiPropertyOptional({ enum: TaxMethod, description: 'Tax calculation method' })
  @IsOptional()
  @IsEnum(TaxMethod)
  taxMethod?: TaxMethod;

  @ApiPropertyOptional({ description: 'Enable WHT for applicable members' })
  @IsOptional()
  @IsBoolean()
  whtEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Applicable WHT rates', example: [1, 2, 3, 5] })
  @IsOptional()
  @IsArray()
  whtRates?: number[];

  @ApiPropertyOptional({ description: 'Enable auto-suspension for overdue balances' })
  @IsOptional()
  @IsBoolean()
  autoSuspendEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Days overdue before auto-suspension', example: 91 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  autoSuspendDays?: number;

  // Credit Limit Management
  @ApiPropertyOptional({ description: 'Default credit limit (null = unlimited)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultCreditLimit?: number | null;

  @ApiPropertyOptional({ description: 'Credit limits per membership type as JSON object' })
  @IsOptional()
  creditLimitByMembershipType?: Record<string, number>;

  @ApiPropertyOptional({ description: 'Credit alert threshold percentage', example: 80 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  creditAlertThreshold?: number;

  @ApiPropertyOptional({ description: 'Credit block threshold percentage', example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  creditBlockThreshold?: number;

  @ApiPropertyOptional({ description: 'Send credit alert to member' })
  @IsOptional()
  @IsBoolean()
  sendCreditAlertToMember?: boolean;

  @ApiPropertyOptional({ description: 'Send credit alert to staff' })
  @IsOptional()
  @IsBoolean()
  sendCreditAlertToStaff?: boolean;

  @ApiPropertyOptional({ description: 'Allow manager to override credit limit block' })
  @IsOptional()
  @IsBoolean()
  allowManagerCreditOverride?: boolean;

  @ApiPropertyOptional({ description: 'Maximum temporary credit override amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditOverrideMaxAmount?: number | null;

  @ApiPropertyOptional({ description: 'Auto-suspend AR when credit exceeded 30+ days' })
  @IsOptional()
  @IsBoolean()
  autoSuspendOnCreditExceeded?: boolean;

  // Statement Configuration
  @ApiPropertyOptional({ enum: StatementDelivery, description: 'Default statement delivery method' })
  @IsOptional()
  @IsEnum(StatementDelivery)
  defaultStatementDelivery?: StatementDelivery;

  @ApiPropertyOptional({ description: 'AR account number prefix', example: 'AR' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  accountNumberPrefix?: string;

  @ApiPropertyOptional({ description: 'AR account number format pattern' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  accountNumberFormat?: string;

  @ApiPropertyOptional({ description: 'Auto-create AR profile on member activation' })
  @IsOptional()
  @IsBoolean()
  autoCreateProfileOnActivation?: boolean;

  @ApiPropertyOptional({ description: 'Require zero balance before closing AR profile' })
  @IsOptional()
  @IsBoolean()
  requireZeroBalanceForClosure?: boolean;

  @ApiPropertyOptional({ description: 'Statement number prefix', example: 'STMT' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  statementNumberPrefix?: string;

  // Billing Cycle Mode
  @ApiPropertyOptional({ enum: BillingCycleMode, description: 'Billing cycle mode (Club or Member)' })
  @IsOptional()
  @IsEnum(BillingCycleMode)
  billingCycleMode?: BillingCycleMode;

  @ApiPropertyOptional({ description: 'Closing day for Club Cycle mode (1-28)', example: 28 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(28)
  clubCycleClosingDay?: number;

  @ApiPropertyOptional({ enum: FinancialPeriodType, description: 'Financial period type for Member Cycle mode' })
  @IsOptional()
  @IsEnum(FinancialPeriodType)
  financialPeriodType?: FinancialPeriodType;

  // Close Checklist Configuration
  @ApiPropertyOptional({ description: 'Close checklist step template as JSON array' })
  @IsOptional()
  @IsArray()
  closeChecklistTemplate?: any[];
}
