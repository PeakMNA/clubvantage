import { Field, ID, ObjectType, registerEnumType, Float, Int } from '@nestjs/graphql';
import {
  StoredPaymentMethodType,
  StoredPaymentMethodStatus,
  AutoPaySchedule,
  AutoPayAttemptStatus,
} from '@prisma/client';

// Register enums
registerEnumType(StoredPaymentMethodType, {
  name: 'StoredPaymentMethodType',
  description: 'Type of stored payment method',
});

registerEnumType(StoredPaymentMethodStatus, {
  name: 'StoredPaymentMethodStatus',
  description: 'Status of stored payment method',
});

registerEnumType(AutoPaySchedule, {
  name: 'AutoPaySchedule',
  description: 'Auto-pay schedule type',
});

registerEnumType(AutoPayAttemptStatus, {
  name: 'AutoPayAttemptStatus',
  description: 'Status of auto-pay attempt',
});

@ObjectType('StoredPaymentMethod')
export class StoredPaymentMethodGraphQLType {
  @Field(() => ID)
  id: string;

  @Field()
  clubId: string;

  @Field()
  memberId: string;

  @Field({ nullable: true })
  stripeCustomerId?: string;

  @Field()
  stripePaymentMethodId: string;

  @Field(() => StoredPaymentMethodType)
  type: StoredPaymentMethodType;

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

  @Field(() => StoredPaymentMethodStatus)
  status: StoredPaymentMethodStatus;

  @Field()
  isDefault: boolean;

  @Field()
  isAutoPayEnabled: boolean;

  @Field({ nullable: true })
  verifiedAt?: Date;

  @Field({ nullable: true })
  lastUsedAt?: Date;

  @Field(() => Int)
  failureCount: number;

  @Field({ nullable: true })
  lastFailureReason?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType('AutoPaySetting')
export class AutoPaySettingGraphQLType {
  @Field(() => ID)
  id: string;

  @Field()
  clubId: string;

  @Field()
  memberId: string;

  @Field()
  paymentMethodId: string;

  @Field()
  isEnabled: boolean;

  @Field(() => AutoPaySchedule)
  schedule: AutoPaySchedule;

  @Field(() => Int, { nullable: true })
  paymentDayOfMonth?: number;

  @Field(() => Float, { nullable: true })
  maxPaymentAmount?: number;

  @Field(() => Float, { nullable: true })
  monthlyMaxAmount?: number;

  @Field(() => Float, { nullable: true })
  requireApprovalAbove?: number;

  @Field()
  payDuesOnly: boolean;

  @Field(() => [String])
  excludeCategories: string[];

  @Field()
  notifyBeforePayment: boolean;

  @Field(() => Int)
  notifyDaysBefore: number;

  @Field()
  notifyOnSuccess: boolean;

  @Field()
  notifyOnFailure: boolean;

  @Field(() => Int)
  maxRetryAttempts: number;

  @Field(() => Int)
  retryIntervalDays: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => StoredPaymentMethodGraphQLType, { nullable: true })
  paymentMethod?: StoredPaymentMethodGraphQLType;
}

@ObjectType('AutoPayAttempt')
export class AutoPayAttemptGraphQLType {
  @Field(() => ID)
  id: string;

  @Field()
  clubId: string;

  @Field()
  memberId: string;

  @Field()
  paymentMethodId: string;

  @Field({ nullable: true })
  invoiceId?: string;

  @Field(() => Float)
  amount: number;

  @Field(() => Int)
  attemptNumber: number;

  @Field(() => AutoPayAttemptStatus)
  status: AutoPayAttemptStatus;

  @Field({ nullable: true })
  stripePaymentIntentId?: string;

  @Field({ nullable: true })
  stripeChargeId?: string;

  @Field({ nullable: true })
  processedAt?: Date;

  @Field({ nullable: true })
  succeededAt?: Date;

  @Field({ nullable: true })
  failedAt?: Date;

  @Field({ nullable: true })
  failureCode?: string;

  @Field({ nullable: true })
  failureMessage?: string;

  @Field({ nullable: true })
  nextRetryAt?: Date;

  @Field()
  isManualRetry: boolean;

  @Field({ nullable: true })
  paymentTransactionId?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => StoredPaymentMethodGraphQLType, { nullable: true })
  paymentMethod?: StoredPaymentMethodGraphQLType;
}

@ObjectType('AutoPayResult')
export class AutoPayResultGraphQLType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  attemptId?: string;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  stripePaymentIntentId?: string;

  @Field({ nullable: true })
  error?: string;
}

@ObjectType('RemovePaymentMethodResult')
export class RemovePaymentMethodResultGraphQLType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  error?: string;
}
