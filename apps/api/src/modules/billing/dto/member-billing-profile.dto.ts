import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsString,
  IsDateString,
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

/**
 * DTO for creating a new member billing profile
 */
export class CreateMemberBillingProfileDto {
  @ApiProperty({
    description: 'Member ID to create billing profile for',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  memberId: string;

  @ApiPropertyOptional({
    enum: BillingFrequency,
    description: 'Override billing frequency for this member',
    example: BillingFrequency.MONTHLY,
  })
  @IsOptional()
  @IsEnum(BillingFrequency)
  billingFrequency?: BillingFrequency;

  @ApiPropertyOptional({
    enum: BillingTiming,
    description: 'Override billing timing (advance/arrears) for this member',
    example: BillingTiming.ADVANCE,
  })
  @IsOptional()
  @IsEnum(BillingTiming)
  billingTiming?: BillingTiming;

  @ApiPropertyOptional({
    enum: CycleAlignment,
    description: 'Override billing cycle alignment for this member',
    example: CycleAlignment.CALENDAR,
  })
  @IsOptional()
  @IsEnum(CycleAlignment)
  billingAlignment?: CycleAlignment;

  @ApiPropertyOptional({
    description: 'Custom billing day of month (1-28)',
    example: 15,
    minimum: 1,
    maximum: 28,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(28)
  customBillingDay?: number;

  @ApiPropertyOptional({
    description: 'Next scheduled billing date',
    example: '2024-02-01',
  })
  @IsOptional()
  @IsDateString()
  nextBillingDate?: string;

  @ApiPropertyOptional({
    enum: ProrationMethod,
    description: 'Override proration method for this member',
    example: ProrationMethod.DAILY,
  })
  @IsOptional()
  @IsEnum(ProrationMethod)
  prorationOverride?: ProrationMethod;

  @ApiPropertyOptional({
    description: 'Custom grace period in days (overrides club default)',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customGracePeriod?: number;

  @ApiPropertyOptional({
    description: 'Exempt this member from late fees',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  customLateFeeExempt?: boolean;
}

/**
 * DTO for updating an existing member billing profile
 */
export class UpdateMemberBillingProfileDto {
  @ApiPropertyOptional({
    enum: BillingFrequency,
    description: 'Override billing frequency for this member',
    example: BillingFrequency.MONTHLY,
  })
  @IsOptional()
  @IsEnum(BillingFrequency)
  billingFrequency?: BillingFrequency;

  @ApiPropertyOptional({
    enum: BillingTiming,
    description: 'Override billing timing (advance/arrears) for this member',
    example: BillingTiming.ADVANCE,
  })
  @IsOptional()
  @IsEnum(BillingTiming)
  billingTiming?: BillingTiming;

  @ApiPropertyOptional({
    enum: CycleAlignment,
    description: 'Override billing cycle alignment for this member',
    example: CycleAlignment.CALENDAR,
  })
  @IsOptional()
  @IsEnum(CycleAlignment)
  billingAlignment?: CycleAlignment;

  @ApiPropertyOptional({
    description: 'Custom billing day of month (1-28)',
    example: 15,
    minimum: 1,
    maximum: 28,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(28)
  customBillingDay?: number;

  @ApiPropertyOptional({
    description: 'Next scheduled billing date',
    example: '2024-02-01',
  })
  @IsOptional()
  @IsDateString()
  nextBillingDate?: string;

  @ApiPropertyOptional({
    enum: ProrationMethod,
    description: 'Override proration method for this member',
    example: ProrationMethod.DAILY,
  })
  @IsOptional()
  @IsEnum(ProrationMethod)
  prorationOverride?: ProrationMethod;

  @ApiPropertyOptional({
    description: 'Custom grace period in days (overrides club default)',
    example: 10,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customGracePeriod?: number;

  @ApiPropertyOptional({
    description: 'Exempt this member from late fees',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  customLateFeeExempt?: boolean;

  @ApiPropertyOptional({
    description: 'Place billing on hold for this member',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  billingHold?: boolean;

  @ApiPropertyOptional({
    description: 'Reason for placing billing on hold',
    example: 'Member requested temporary hold during extended travel',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  billingHoldReason?: string;

  @ApiPropertyOptional({
    description: 'Date until which billing is on hold',
    example: '2024-06-01',
  })
  @IsOptional()
  @IsDateString()
  billingHoldUntil?: string;

  @ApiPropertyOptional({
    description: 'Internal notes about this member billing profile',
    example: 'VIP member - requires special handling',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
