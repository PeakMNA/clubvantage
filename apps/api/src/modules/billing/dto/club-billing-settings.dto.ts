import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  Max,
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
}
