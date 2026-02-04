import { InputType, Field, ID, Float, Int } from '@nestjs/graphql';
import { AutoPaySchedule } from '@prisma/client';

@InputType()
export class AddStoredPaymentInput {
  @Field()
  memberId: string;

  @Field({ nullable: true })
  stripeCustomerId?: string;

  @Field()
  stripePaymentMethodId: string;

  @Field()
  brand: string;

  @Field()
  last4: string;

  @Field(() => Int, { nullable: true })
  expiryMonth?: number;

  @Field(() => Int, { nullable: true })
  expiryYear?: number;

  @Field({ nullable: true })
  cardholderName?: string;

  @Field({ nullable: true, defaultValue: false })
  isDefault?: boolean;
}

@InputType()
export class UpdateStoredPaymentInput {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  isDefault?: boolean;

  @Field({ nullable: true })
  isAutoPayEnabled?: boolean;
}

@InputType()
export class AutoPaySettingInput {
  @Field()
  memberId: string;

  @Field(() => ID)
  paymentMethodId: string;

  @Field({ nullable: true, defaultValue: true })
  isEnabled?: boolean;

  @Field(() => AutoPaySchedule, { nullable: true })
  schedule?: AutoPaySchedule;

  @Field(() => Int, { nullable: true })
  paymentDayOfMonth?: number;

  @Field(() => Float, { nullable: true })
  maxPaymentAmount?: number;

  @Field(() => Float, { nullable: true })
  monthlyMaxAmount?: number;

  @Field(() => Float, { nullable: true })
  requireApprovalAbove?: number;

  @Field({ nullable: true, defaultValue: false })
  payDuesOnly?: boolean;

  @Field(() => [String], { nullable: true })
  excludeCategories?: string[];

  @Field({ nullable: true, defaultValue: true })
  notifyBeforePayment?: boolean;

  @Field(() => Int, { nullable: true, defaultValue: 3 })
  notifyDaysBefore?: number;

  @Field({ nullable: true, defaultValue: true })
  notifyOnSuccess?: boolean;

  @Field({ nullable: true, defaultValue: true })
  notifyOnFailure?: boolean;

  @Field(() => Int, { nullable: true, defaultValue: 3 })
  maxRetryAttempts?: number;

  @Field(() => Int, { nullable: true, defaultValue: 3 })
  retryIntervalDays?: number;
}

@InputType()
export class ProcessAutoPayInput {
  @Field()
  invoiceId: string;

  @Field(() => ID)
  paymentMethodId: string;

  @Field(() => Float)
  amount: number;
}

@InputType()
export class GetAutoPayHistoryInput {
  @Field()
  memberId: string;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  limit?: number;
}
