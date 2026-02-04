import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { SubAccountStatus, SubAccountPermission } from '@prisma/client';

// Register enums for GraphQL
registerEnumType(SubAccountStatus, {
  name: 'SubAccountStatus',
  description: 'Status of a sub-account',
});

registerEnumType(SubAccountPermission, {
  name: 'SubAccountPermission',
  description: 'Permission categories for sub-accounts',
});

@ObjectType('SubAccount')
export class SubAccountGraphQLType {
  @Field(() => ID)
  id: string;

  @Field()
  clubId: string;

  @Field()
  memberId: string;

  @Field()
  name: string;

  @Field()
  relationship: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field(() => SubAccountStatus)
  status: SubAccountStatus;

  @Field()
  validFrom: Date;

  @Field({ nullable: true })
  validUntil?: Date;

  @Field(() => [SubAccountPermission])
  permissions: SubAccountPermission[];

  @Field(() => Float, { nullable: true })
  dailyLimit?: number;

  @Field(() => Float, { nullable: true })
  weeklyLimit?: number;

  @Field(() => Float, { nullable: true })
  monthlyLimit?: number;

  @Field(() => Float, { nullable: true })
  perTransactionLimit?: number;

  @Field(() => Float)
  dailySpend: number;

  @Field(() => Float)
  weeklySpend: number;

  @Field(() => Float)
  monthlySpend: number;

  @Field()
  lastResetDaily: Date;

  @Field()
  lastResetWeekly: Date;

  @Field()
  lastResetMonthly: Date;

  @Field()
  notifyPrimaryOnUse: boolean;

  @Field()
  notifyOnLimitReached: boolean;

  @Field(() => Int)
  pinAttempts: number;

  @Field({ nullable: true })
  pinLockedUntil?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType('SubAccountTransaction')
export class SubAccountTransactionGraphQLType {
  @Field(() => ID)
  id: string;

  @Field()
  clubId: string;

  @Field()
  subAccountId: string;

  @Field(() => Float)
  amount: number;

  @Field()
  description: string;

  @Field(() => SubAccountPermission)
  category: SubAccountPermission;

  @Field({ nullable: true })
  paymentTransactionId?: string;

  @Field({ nullable: true })
  lineItemId?: string;

  @Field({ nullable: true })
  teeTimeId?: string;

  @Field()
  verifiedAt: Date;

  @Field({ nullable: true })
  verifiedBy?: string;

  @Field({ nullable: true })
  locationName?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  createdAt: Date;

  @Field(() => SubAccountGraphQLType, { nullable: true })
  subAccount?: SubAccountGraphQLType;
}

@ObjectType('SubAccountLimitCheck')
export class SubAccountLimitCheckGraphQLType {
  @Field()
  allowed: boolean;

  @Field({ nullable: true })
  reason?: string;

  @Field(() => Float)
  currentDaily: number;

  @Field(() => Float)
  currentWeekly: number;

  @Field(() => Float)
  currentMonthly: number;

  @Field(() => Float, { nullable: true })
  dailyLimit?: number;

  @Field(() => Float, { nullable: true })
  weeklyLimit?: number;

  @Field(() => Float, { nullable: true })
  monthlyLimit?: number;

  @Field(() => Float, { nullable: true })
  perTransactionLimit?: number;
}

@ObjectType('PinVerificationResult')
export class PinVerificationResultGraphQLType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  remainingAttempts?: number;
}
