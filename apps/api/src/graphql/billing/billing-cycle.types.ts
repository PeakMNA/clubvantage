import {
  ObjectType,
  Field,
  ID,
  Int,
  Float,
  registerEnumType,
} from '@nestjs/graphql';
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
  description: 'Billing frequency options (MONTHLY, QUARTERLY, SEMI_ANNUAL, ANNUAL)',
});

registerEnumType(BillingTiming, {
  name: 'BillingTiming',
  description: 'Billing timing options (ADVANCE, ARREARS)',
});

registerEnumType(CycleAlignment, {
  name: 'CycleAlignment',
  description: 'Billing cycle alignment options (CALENDAR, ANNIVERSARY)',
});

registerEnumType(ProrationMethod, {
  name: 'ProrationMethod',
  description: 'Proration calculation method (DAILY, MONTHLY, NONE)',
});

registerEnumType(LateFeeType, {
  name: 'LateFeeType',
  description: 'Late fee type options (PERCENTAGE, FIXED, TIERED)',
});

registerEnumType(TaxMethod, {
  name: 'TaxMethod',
  description: 'Tax calculation method (ADDON, INCLUDED, EXEMPT)',
});

registerEnumType(BillingCycleMode, {
  name: 'BillingCycleMode',
  description: 'Billing cycle mode (CLUB_CYCLE, MEMBER_CYCLE)',
});

registerEnumType(FinancialPeriodType, {
  name: 'FinancialPeriodType',
  description: 'Financial period type (CALENDAR_MONTH, CUSTOM)',
});

registerEnumType(StatementDelivery, {
  name: 'BillingStatementDelivery',
  description: 'Statement delivery method (EMAIL, PRINT, PORTAL, SMS, EMAIL_AND_PRINT, ALL)',
});

// Re-export enums for convenience
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
 * Club-level billing configuration settings
 */
@ObjectType({ description: 'Club billing configuration settings' })
export class ClubBillingSettingsType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  clubId: string;

  @Field(() => BillingFrequency, { description: 'Default billing frequency for new members' })
  defaultFrequency: BillingFrequency;

  @Field(() => BillingTiming, { description: 'Whether to bill in advance or arrears' })
  defaultTiming: BillingTiming;

  @Field(() => CycleAlignment, { description: 'Billing cycle alignment (calendar or anniversary)' })
  defaultAlignment: CycleAlignment;

  @Field(() => Int, { description: 'Default day of month for billing (1-28)' })
  defaultBillingDay: number;

  @Field(() => Int, { description: 'Days before billing cycle to generate invoices' })
  invoiceGenerationLead: number;

  @Field(() => Int, { description: 'Days after invoice date when payment is due' })
  invoiceDueDays: number;

  @Field(() => Int, { description: 'Grace period days after due date before late fees' })
  gracePeriodDays: number;

  @Field(() => LateFeeType, { description: 'Type of late fee to apply' })
  lateFeeType: LateFeeType;

  @Field(() => Float, { description: 'Fixed late fee amount (in cents)' })
  lateFeeAmount: number;

  @Field(() => Float, { description: 'Late fee percentage (0-100)' })
  lateFeePercentage: number;

  @Field(() => Float, { nullable: true, description: 'Maximum late fee cap amount (in cents)' })
  maxLateFee?: number;

  @Field({ description: 'Whether to automatically apply late fees when due' })
  autoApplyLateFee: boolean;

  @Field({ description: 'Whether to prorate charges for new members mid-cycle' })
  prorateNewMembers: boolean;

  @Field({ description: 'Whether to prorate charges for membership changes mid-cycle' })
  prorateChanges: boolean;

  @Field(() => ProrationMethod, { description: 'Method used for calculating prorated amounts' })
  prorationMethod: ProrationMethod;

  // Billing Defaults
  @Field(() => Int, { description: 'Default payment terms in days from statement date' })
  defaultPaymentTermsDays: number;

  @Field({ description: 'Invoice number prefix' })
  invoicePrefix: string;

  @Field(() => Int, { description: 'Invoice starting number' })
  invoiceStartNumber: number;

  @Field(() => Int, { description: 'Day of month for auto-generation (1-28)' })
  invoiceAutoGenerationDay: number;

  @Field(() => Float, { description: 'Default VAT rate percentage' })
  defaultVatRate: number;

  @Field(() => TaxMethod, { description: 'Tax calculation method' })
  taxMethod: TaxMethod;

  @Field({ description: 'Whether WHT is enabled for applicable members' })
  whtEnabled: boolean;

  @Field(() => GraphQLJSON, { description: 'Applicable WHT rates as JSON array' })
  whtRates: number[];

  @Field({ description: 'Whether auto-suspension is enabled for overdue balances' })
  autoSuspendEnabled: boolean;

  @Field(() => Int, { description: 'Days overdue before auto-suspension' })
  autoSuspendDays: number;

  // Credit Limit Management
  @Field(() => Float, { nullable: true, description: 'Default credit limit (null = unlimited)' })
  defaultCreditLimit?: number;

  @Field(() => GraphQLJSON, { description: 'Credit limits per membership type' })
  creditLimitByMembershipType: Record<string, number>;

  @Field(() => Int, { description: 'Credit alert threshold percentage' })
  creditAlertThreshold: number;

  @Field(() => Int, { description: 'Credit block threshold percentage' })
  creditBlockThreshold: number;

  @Field({ description: 'Send credit alert to member' })
  sendCreditAlertToMember: boolean;

  @Field({ description: 'Send credit alert to staff' })
  sendCreditAlertToStaff: boolean;

  @Field({ description: 'Allow manager to override credit limit block' })
  allowManagerCreditOverride: boolean;

  @Field(() => Float, { nullable: true, description: 'Max temporary credit override amount' })
  creditOverrideMaxAmount?: number;

  @Field({ description: 'Auto-suspend AR when credit exceeded 30+ days' })
  autoSuspendOnCreditExceeded: boolean;

  // Statement Configuration
  @Field(() => StatementDelivery, { description: 'Default statement delivery method' })
  defaultStatementDelivery: StatementDelivery;

  @Field({ description: 'AR account number prefix' })
  accountNumberPrefix: string;

  @Field({ description: 'AR account number format pattern' })
  accountNumberFormat: string;

  @Field({ description: 'Auto-create AR profile on member activation' })
  autoCreateProfileOnActivation: boolean;

  @Field({ description: 'Require zero balance before closing AR profile' })
  requireZeroBalanceForClosure: boolean;

  @Field({ description: 'Statement number prefix' })
  statementNumberPrefix: string;

  // Billing Cycle Mode
  @Field(() => BillingCycleMode, { description: 'Billing cycle mode (Club or Member)' })
  billingCycleMode: BillingCycleMode;

  @Field(() => Int, { description: 'Closing day for Club Cycle mode (1-28)' })
  clubCycleClosingDay: number;

  @Field(() => FinancialPeriodType, { description: 'Financial period type for Member Cycle mode' })
  financialPeriodType: FinancialPeriodType;

  // Close Checklist
  @Field(() => GraphQLJSON, { description: 'Close checklist step template' })
  closeChecklistTemplate: any[];

  @Field({ description: 'When the settings were created' })
  createdAt: Date;

  @Field({ description: 'When the settings were last updated' })
  updatedAt: Date;
}

/**
 * Minimal member summary for billing contexts
 */
@ObjectType({ description: 'Minimal member summary for billing contexts' })
export class MemberBillingSummary {
  @Field(() => ID)
  id: string;

  @Field({ description: 'Member ID number' })
  memberId: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;
}

/**
 * Member-specific billing profile with overrides
 */
@ObjectType({ description: 'Member-specific billing profile with optional overrides' })
export class MemberBillingProfileType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  memberId: string;

  @Field(() => BillingFrequency, { nullable: true, description: 'Override billing frequency for this member' })
  billingFrequency?: BillingFrequency;

  @Field(() => BillingTiming, { nullable: true, description: 'Override billing timing for this member' })
  billingTiming?: BillingTiming;

  @Field(() => CycleAlignment, { nullable: true, description: 'Override cycle alignment for this member' })
  billingAlignment?: CycleAlignment;

  @Field(() => Int, { nullable: true, description: 'Custom billing day of month (1-28)' })
  customBillingDay?: number;

  @Field({ nullable: true, description: 'Next scheduled billing date' })
  nextBillingDate?: Date;

  @Field({ nullable: true, description: 'Last billing date processed' })
  lastBillingDate?: Date;

  @Field({ nullable: true, description: 'Current billing period start date' })
  currentPeriodStart?: Date;

  @Field({ nullable: true, description: 'Current billing period end date' })
  currentPeriodEnd?: Date;

  @Field({ description: 'Whether billing is on hold for this member' })
  billingHold: boolean;

  @Field({ nullable: true, description: 'Reason for placing billing on hold' })
  billingHoldReason?: string;

  @Field({ nullable: true, description: 'Date until which billing is on hold' })
  billingHoldUntil?: Date;

  @Field(() => ProrationMethod, { nullable: true, description: 'Override proration method for this member' })
  prorationOverride?: ProrationMethod;

  @Field(() => Int, { nullable: true, description: 'Custom grace period in days' })
  customGracePeriod?: number;

  @Field({ description: 'Whether this member is exempt from late fees' })
  customLateFeeExempt: boolean;

  @Field({ nullable: true, description: 'Internal notes about this billing profile' })
  notes?: string;

  // AR Configuration
  @Field({ description: 'Whether AR is enabled for this member' })
  arEnabled: boolean;

  @Field(() => StatementDelivery, { nullable: true, description: 'Override statement delivery method' })
  arStatementDelivery?: StatementDelivery;

  @Field(() => Int, { nullable: true, description: 'Override payment terms in days' })
  arPaymentTermsDays?: number;

  @Field(() => Float, { nullable: true, description: 'Member-specific credit limit' })
  arCreditLimit?: number;

  @Field({ description: 'Auto-charge AR balance to member payment method' })
  arAutoChargeToMember: boolean;

  @Field({ description: 'Generate separate statement for this member' })
  arSeparateStatement: boolean;

  @Field({ nullable: true, description: 'AR billing contact override' })
  arBillingContact?: string;

  @Field({ description: 'When the profile was created' })
  createdAt: Date;

  @Field({ description: 'When the profile was last updated' })
  updatedAt: Date;

  @Field(() => MemberBillingSummary, { nullable: true, description: 'Associated member information' })
  member?: MemberBillingSummary;
}

/**
 * Preview of an upcoming billing period
 */
@ObjectType({ description: 'Preview of an upcoming billing period' })
export class BillingPeriodPreview {
  @Field({ description: 'Start date of the billing period' })
  periodStart: Date;

  @Field({ description: 'End date of the billing period' })
  periodEnd: Date;

  @Field({ description: 'Date when the invoice will be generated/billed' })
  billingDate: Date;

  @Field({ description: 'Due date for payment' })
  dueDate: Date;

  @Field({ description: 'Human-readable description of the period' })
  description: string;
}

/**
 * Preview of proration calculation
 */
@ObjectType({ description: 'Preview of proration calculation' })
export class ProrationPreview {
  @Field(() => Float, { description: 'Prorated amount in cents' })
  proratedAmount: number;

  @Field(() => Int, { description: 'Total days in the billing period' })
  daysInPeriod: number;

  @Field(() => Int, { description: 'Number of days being prorated' })
  daysProrated: number;

  @Field(() => Float, { description: 'Proration factor (0-1)' })
  prorationFactor: number;

  @Field({ description: 'Human-readable description of the proration' })
  description: string;
}

/**
 * Preview of late fee calculation
 */
@ObjectType({ description: 'Preview of late fee calculation' })
export class LateFeePreview {
  @Field(() => Float, { description: 'Late fee amount in cents' })
  feeAmount: number;

  @Field(() => Int, { description: 'Number of days overdue' })
  daysOverdue: number;

  @Field({ description: 'Date when late fee would be applied' })
  appliedDate: Date;

  @Field({ description: 'Human-readable description of the late fee' })
  description: string;

  @Field({ description: 'Whether the invoice is still within grace period' })
  isWithinGracePeriod: boolean;
}
