import { InputType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import {
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  IsBoolean,
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
  LateFeeType,
} from '@/modules/billing/dto/club-billing-settings.dto';

// Register enums for GraphQL
registerEnumType(BillingFrequency, {
  name: 'BillingFrequency',
  description: 'Billing frequency options',
});

registerEnumType(BillingTiming, {
  name: 'BillingTiming',
  description: 'Billing timing options (advance or arrears)',
});

registerEnumType(CycleAlignment, {
  name: 'CycleAlignment',
  description: 'Billing cycle alignment (calendar or anniversary)',
});

registerEnumType(ProrationMethod, {
  name: 'ProrationMethod',
  description: 'Proration calculation method',
});

registerEnumType(LateFeeType, {
  name: 'LateFeeType',
  description: 'Late fee type options',
});

// Re-export enums for use in other files
export {
  BillingFrequency,
  BillingTiming,
  CycleAlignment,
  ProrationMethod,
  LateFeeType,
};

/**
 * Input for updating club-level billing settings
 */
@InputType()
export class UpdateClubBillingSettingsInput {
  @Field(() => BillingFrequency, { nullable: true })
  @IsOptional()
  @IsEnum(BillingFrequency)
  defaultFrequency?: BillingFrequency;

  @Field(() => BillingTiming, { nullable: true })
  @IsOptional()
  @IsEnum(BillingTiming)
  defaultTiming?: BillingTiming;

  @Field(() => CycleAlignment, { nullable: true })
  @IsOptional()
  @IsEnum(CycleAlignment)
  defaultAlignment?: CycleAlignment;

  @Field(() => Int, { nullable: true, description: 'Default billing day (1-28)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(28)
  defaultBillingDay?: number;

  @Field(() => Int, { nullable: true, description: 'Days before billing to generate invoices (0-30)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
  invoiceGenerationLead?: number;

  @Field(() => Int, { nullable: true, description: 'Days after invoice for payment due (1-60)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(60)
  invoiceDueDays?: number;

  @Field(() => Int, { nullable: true, description: 'Grace period days after due date (0-60)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(60)
  gracePeriodDays?: number;

  @Field(() => LateFeeType, { nullable: true })
  @IsOptional()
  @IsEnum(LateFeeType)
  lateFeeType?: LateFeeType;

  @Field(() => Float, { nullable: true, description: 'Fixed late fee amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lateFeeAmount?: number;

  @Field(() => Float, { nullable: true, description: 'Late fee percentage (0-100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  lateFeePercentage?: number;

  @Field(() => Float, { nullable: true, description: 'Maximum late fee cap' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxLateFee?: number;

  @Field({ nullable: true, description: 'Automatically apply late fees when due' })
  @IsOptional()
  @IsBoolean()
  autoApplyLateFee?: boolean;

  @Field({ nullable: true, description: 'Prorate charges for new members mid-cycle' })
  @IsOptional()
  @IsBoolean()
  prorateNewMembers?: boolean;

  @Field({ nullable: true, description: 'Prorate charges for membership changes mid-cycle' })
  @IsOptional()
  @IsBoolean()
  prorateChanges?: boolean;

  @Field(() => ProrationMethod, { nullable: true })
  @IsOptional()
  @IsEnum(ProrationMethod)
  prorationMethod?: ProrationMethod;
}

/**
 * Input for creating a member billing profile
 */
@InputType()
export class CreateMemberBillingProfileInput {
  @Field(() => ID)
  @IsUUID()
  memberId: string;

  @Field(() => BillingFrequency, { nullable: true })
  @IsOptional()
  @IsEnum(BillingFrequency)
  billingFrequency?: BillingFrequency;

  @Field(() => BillingTiming, { nullable: true })
  @IsOptional()
  @IsEnum(BillingTiming)
  billingTiming?: BillingTiming;

  @Field(() => CycleAlignment, { nullable: true })
  @IsOptional()
  @IsEnum(CycleAlignment)
  billingAlignment?: CycleAlignment;

  @Field(() => Int, { nullable: true, description: 'Custom billing day (1-28)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(28)
  customBillingDay?: number;

  @Field({ nullable: true, description: 'Next scheduled billing date' })
  @IsOptional()
  nextBillingDate?: Date;

  @Field(() => ProrationMethod, { nullable: true })
  @IsOptional()
  @IsEnum(ProrationMethod)
  prorationOverride?: ProrationMethod;

  @Field(() => Int, { nullable: true, description: 'Custom grace period in days' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customGracePeriod?: number;

  @Field({ nullable: true, description: 'Exempt from late fees' })
  @IsOptional()
  @IsBoolean()
  customLateFeeExempt?: boolean;
}

/**
 * Input for updating a member billing profile
 */
@InputType()
export class UpdateMemberBillingProfileInput {
  @Field(() => BillingFrequency, { nullable: true })
  @IsOptional()
  @IsEnum(BillingFrequency)
  billingFrequency?: BillingFrequency;

  @Field(() => BillingTiming, { nullable: true })
  @IsOptional()
  @IsEnum(BillingTiming)
  billingTiming?: BillingTiming;

  @Field(() => CycleAlignment, { nullable: true })
  @IsOptional()
  @IsEnum(CycleAlignment)
  billingAlignment?: CycleAlignment;

  @Field(() => Int, { nullable: true, description: 'Custom billing day (1-28)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(28)
  customBillingDay?: number;

  @Field({ nullable: true, description: 'Next scheduled billing date' })
  @IsOptional()
  nextBillingDate?: Date;

  @Field(() => ProrationMethod, { nullable: true })
  @IsOptional()
  @IsEnum(ProrationMethod)
  prorationOverride?: ProrationMethod;

  @Field(() => Int, { nullable: true, description: 'Custom grace period in days' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customGracePeriod?: number;

  @Field({ nullable: true, description: 'Exempt from late fees' })
  @IsOptional()
  @IsBoolean()
  customLateFeeExempt?: boolean;

  @Field({ nullable: true, description: 'Put billing on hold' })
  @IsOptional()
  @IsBoolean()
  billingHold?: boolean;

  @Field({ nullable: true, description: 'Reason for billing hold' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  billingHoldReason?: string;

  @Field({ nullable: true, description: 'Date until billing hold expires' })
  @IsOptional()
  billingHoldUntil?: Date;

  @Field({ nullable: true, description: 'Internal notes about billing profile' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

/**
 * Input for calculating proration preview
 */
@InputType()
export class ProrationPreviewInput {
  @Field(() => ID)
  @IsUUID()
  memberId: string;

  @Field({ description: 'Effective date for the prorated period' })
  effectiveDate: Date;

  @Field(() => Float, { description: 'Full period amount before proration' })
  @IsNumber()
  @Min(0)
  fullPeriodAmount: number;
}

/**
 * Input for calculating late fee preview
 */
@InputType()
export class LateFeePreviewInput {
  @Field(() => ID)
  @IsUUID()
  invoiceId: string;

  @Field({ nullable: true, description: 'Date to calculate late fee as of (defaults to today)' })
  @IsOptional()
  calculationDate?: Date;
}
