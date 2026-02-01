import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum CreditWarningLevel {
  APPROACHING_LIMIT = 'APPROACHING_LIMIT',
  EXCEEDED = 'EXCEEDED',
}

registerEnumType(CreditWarningLevel, {
  name: 'CreditWarningLevel',
  description: 'Warning level for credit limit status',
});

@ObjectType()
export class CreditCheckResultType {
  @Field()
  allowed: boolean;

  @Field()
  currentBalance: number;

  @Field()
  creditLimit: number;

  @Field()
  availableCredit: number;

  @Field()
  chargeAmount: number;

  @Field()
  newBalance: number;

  @Field()
  usagePercent: number;

  @Field(() => CreditWarningLevel, { nullable: true })
  warning?: CreditWarningLevel;

  @Field({ nullable: true })
  shortfall?: number;
}

@ObjectType()
export class CreditStatusType {
  @Field()
  creditLimit: number;

  @Field()
  currentBalance: number;

  @Field()
  availableCredit: number;

  @Field()
  usagePercent: number;

  @Field()
  alertThreshold: number;

  @Field()
  isBlocked: boolean;

  @Field()
  overrideAllowed: boolean;
}

@ObjectType()
export class CreditLimitOverrideType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  memberId: string;

  @Field()
  previousLimit: number;

  @Field()
  newLimit: number;

  @Field()
  reason: string;

  @Field(() => ID)
  approvedBy: string;

  @Field()
  approvedAt: Date;

  @Field({ nullable: true })
  expiresAt?: Date;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class MemberAtRiskType {
  @Field(() => ID)
  id: string;

  @Field()
  memberId: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  creditLimit: number;

  @Field()
  outstandingBalance: number;

  @Field()
  usagePercent: number;

  @Field()
  isAtRisk: boolean;

  @Field()
  isExceeded: boolean;
}

@ObjectType()
export class CreditSettingsType {
  @Field({ nullable: true })
  creditLimit?: number;

  @Field()
  creditLimitEnabled: boolean;

  @Field()
  creditAlertThreshold: number;

  @Field()
  creditBlockEnabled: boolean;

  @Field()
  creditOverrideAllowed: boolean;
}
