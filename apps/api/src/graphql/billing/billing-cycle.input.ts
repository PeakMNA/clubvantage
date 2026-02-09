import { InputType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import {
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsString,
  IsArray,
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
  TaxMethod,
  BillingCycleMode,
  FinancialPeriodType,
  StatementDelivery,
} from '@/modules/billing/dto/club-billing-settings.dto';
import GraphQLJSON from 'graphql-type-json';

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
  TaxMethod,
  BillingCycleMode,
  FinancialPeriodType,
  StatementDelivery,
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

  // Billing Defaults
  @Field(() => Int, { nullable: true, description: 'Default payment terms in days' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(90)
  defaultPaymentTermsDays?: number;

  @Field({ nullable: true, description: 'Invoice number prefix' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  invoicePrefix?: string;

  @Field(() => Int, { nullable: true, description: 'Invoice starting number' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  invoiceStartNumber?: number;

  @Field(() => Int, { nullable: true, description: 'Day of month for auto-generation (1-28)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(28)
  invoiceAutoGenerationDay?: number;

  @Field(() => Float, { nullable: true, description: 'Default VAT rate percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defaultVatRate?: number;

  @Field(() => TaxMethod, { nullable: true, description: 'Tax calculation method' })
  @IsOptional()
  @IsEnum(TaxMethod)
  taxMethod?: TaxMethod;

  @Field({ nullable: true, description: 'Enable WHT for applicable members' })
  @IsOptional()
  @IsBoolean()
  whtEnabled?: boolean;

  @Field(() => GraphQLJSON, { nullable: true, description: 'Applicable WHT rates' })
  @IsOptional()
  @IsArray()
  whtRates?: number[];

  @Field({ nullable: true, description: 'Enable auto-suspension for overdue balances' })
  @IsOptional()
  @IsBoolean()
  autoSuspendEnabled?: boolean;

  @Field(() => Int, { nullable: true, description: 'Days overdue before auto-suspension' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  autoSuspendDays?: number;

  // Credit Limit Management
  @Field(() => Float, { nullable: true, description: 'Default credit limit (null = unlimited)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  defaultCreditLimit?: number;

  @Field(() => GraphQLJSON, { nullable: true, description: 'Credit limits per membership type' })
  @IsOptional()
  creditLimitByMembershipType?: Record<string, number>;

  @Field(() => Int, { nullable: true, description: 'Credit alert threshold percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  creditAlertThreshold?: number;

  @Field(() => Int, { nullable: true, description: 'Credit block threshold percentage' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(200)
  creditBlockThreshold?: number;

  @Field({ nullable: true, description: 'Send credit alert to member' })
  @IsOptional()
  @IsBoolean()
  sendCreditAlertToMember?: boolean;

  @Field({ nullable: true, description: 'Send credit alert to staff' })
  @IsOptional()
  @IsBoolean()
  sendCreditAlertToStaff?: boolean;

  @Field({ nullable: true, description: 'Allow manager to override credit limit block' })
  @IsOptional()
  @IsBoolean()
  allowManagerCreditOverride?: boolean;

  @Field(() => Float, { nullable: true, description: 'Max temporary credit override amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  creditOverrideMaxAmount?: number;

  @Field({ nullable: true, description: 'Auto-suspend AR when credit exceeded 30+ days' })
  @IsOptional()
  @IsBoolean()
  autoSuspendOnCreditExceeded?: boolean;

  // Statement Configuration
  @Field(() => StatementDelivery, { nullable: true, description: 'Default statement delivery method' })
  @IsOptional()
  @IsEnum(StatementDelivery)
  defaultStatementDelivery?: StatementDelivery;

  @Field({ nullable: true, description: 'AR account number prefix' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  accountNumberPrefix?: string;

  @Field({ nullable: true, description: 'AR account number format pattern' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  accountNumberFormat?: string;

  @Field({ nullable: true, description: 'Auto-create AR profile on member activation' })
  @IsOptional()
  @IsBoolean()
  autoCreateProfileOnActivation?: boolean;

  @Field({ nullable: true, description: 'Require zero balance before closing AR profile' })
  @IsOptional()
  @IsBoolean()
  requireZeroBalanceForClosure?: boolean;

  @Field({ nullable: true, description: 'Statement number prefix' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  statementNumberPrefix?: string;

  // Billing Cycle Mode
  @Field(() => BillingCycleMode, { nullable: true, description: 'Billing cycle mode' })
  @IsOptional()
  @IsEnum(BillingCycleMode)
  billingCycleMode?: BillingCycleMode;

  @Field(() => Int, { nullable: true, description: 'Closing day for Club Cycle mode (1-28)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(28)
  clubCycleClosingDay?: number;

  @Field(() => FinancialPeriodType, { nullable: true, description: 'Financial period type' })
  @IsOptional()
  @IsEnum(FinancialPeriodType)
  financialPeriodType?: FinancialPeriodType;

  // Close Checklist Configuration
  @Field(() => GraphQLJSON, { nullable: true, description: 'Close checklist step template' })
  @IsOptional()
  @IsArray()
  closeChecklistTemplate?: any[];
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

  // AR Configuration
  @Field({ nullable: true, description: 'Enable AR for this member' })
  @IsOptional()
  @IsBoolean()
  arEnabled?: boolean;

  @Field(() => StatementDelivery, { nullable: true, description: 'Statement delivery method override' })
  @IsOptional()
  @IsEnum(StatementDelivery)
  arStatementDelivery?: StatementDelivery;

  @Field(() => Int, { nullable: true, description: 'Payment terms override in days' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(90)
  arPaymentTermsDays?: number;

  @Field(() => Float, { nullable: true, description: 'Member-specific credit limit' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  arCreditLimit?: number;

  @Field({ nullable: true, description: 'Auto-charge AR balance to member' })
  @IsOptional()
  @IsBoolean()
  arAutoChargeToMember?: boolean;

  @Field({ nullable: true, description: 'Generate separate statement' })
  @IsOptional()
  @IsBoolean()
  arSeparateStatement?: boolean;

  @Field({ nullable: true, description: 'AR billing contact override' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  arBillingContact?: string;
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

  // AR Configuration
  @Field({ nullable: true, description: 'Enable AR for this member' })
  @IsOptional()
  @IsBoolean()
  arEnabled?: boolean;

  @Field(() => StatementDelivery, { nullable: true, description: 'Statement delivery method override' })
  @IsOptional()
  @IsEnum(StatementDelivery)
  arStatementDelivery?: StatementDelivery;

  @Field(() => Int, { nullable: true, description: 'Payment terms override in days' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(90)
  arPaymentTermsDays?: number;

  @Field(() => Float, { nullable: true, description: 'Member-specific credit limit' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  arCreditLimit?: number;

  @Field({ nullable: true, description: 'Auto-charge AR balance to member' })
  @IsOptional()
  @IsBoolean()
  arAutoChargeToMember?: boolean;

  @Field({ nullable: true, description: 'Generate separate statement' })
  @IsOptional()
  @IsBoolean()
  arSeparateStatement?: boolean;

  @Field({ nullable: true, description: 'AR billing contact override' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  arBillingContact?: string;
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
