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
} from '@/modules/billing/dto/club-billing-settings.dto';

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

// Re-export enums for convenience
export {
  BillingFrequency,
  BillingTiming,
  CycleAlignment,
  ProrationMethod,
  LateFeeType,
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
