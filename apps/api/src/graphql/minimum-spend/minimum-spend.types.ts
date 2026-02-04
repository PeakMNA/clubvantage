import { ObjectType, Field, ID, Float, Int, registerEnumType } from '@nestjs/graphql';
import { MinimumSpendPeriod, ShortfallAction, MemberSpendStatus } from '@prisma/client';

// Register enums for GraphQL
registerEnumType(MinimumSpendPeriod, {
  name: 'MinimumSpendPeriod',
  description: 'Period for minimum spend requirements',
});

registerEnumType(ShortfallAction, {
  name: 'ShortfallAction',
  description: 'Action to take when member has a shortfall',
});

registerEnumType(MemberSpendStatus, {
  name: 'MemberSpendStatus',
  description: 'Status of member spending against requirement',
});

@ObjectType('MinimumSpendRequirement')
export class MinimumSpendRequirementGraphQLType {
  @Field(() => ID)
  id: string;

  @Field()
  clubId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String])
  membershipTypes: string[];

  @Field(() => Float)
  minimumAmount: number;

  @Field(() => MinimumSpendPeriod)
  period: MinimumSpendPeriod;

  @Field()
  includeFoodBeverage: boolean;

  @Field()
  includeGolf: boolean;

  @Field()
  includeSpa: boolean;

  @Field()
  includeRetail: boolean;

  @Field()
  includeEvents: boolean;

  @Field(() => [String])
  includedCategories: string[];

  @Field(() => [String])
  excludedCategories: string[];

  @Field(() => ShortfallAction)
  defaultShortfallAction: ShortfallAction;

  @Field(() => Int)
  gracePeriodDays: number;

  @Field()
  allowPartialCredit: boolean;

  @Field(() => [Int])
  notifyAtPercent: number[];

  @Field(() => [Int])
  notifyDaysBeforeEnd: number[];

  @Field()
  isActive: boolean;

  @Field()
  effectiveFrom: Date;

  @Field({ nullable: true })
  effectiveTo?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType('MemberMinimumSpend')
export class MemberMinimumSpendGraphQLType {
  @Field(() => ID)
  id: string;

  @Field()
  clubId: string;

  @Field()
  memberId: string;

  @Field()
  requirementId: string;

  @Field()
  periodStart: Date;

  @Field()
  periodEnd: Date;

  @Field()
  periodLabel: string;

  @Field(() => Float)
  requiredAmount: number;

  @Field(() => Float)
  currentSpend: number;

  @Field(() => Float, { nullable: true })
  projectedSpend?: number;

  @Field(() => Float, { nullable: true })
  shortfallAmount?: number;

  @Field(() => Float)
  carryForwardAmount: number;

  @Field(() => MemberSpendStatus)
  status: MemberSpendStatus;

  @Field()
  isExempt: boolean;

  @Field({ nullable: true })
  exemptReason?: string;

  @Field({ nullable: true })
  exemptBy?: string;

  @Field({ nullable: true })
  exemptAt?: Date;

  @Field(() => ShortfallAction, { nullable: true })
  shortfallAction?: ShortfallAction;

  @Field({ nullable: true })
  shortfallResolvedBy?: string;

  @Field({ nullable: true })
  shortfallResolvedAt?: Date;

  @Field({ nullable: true })
  shortfallNote?: string;

  @Field({ nullable: true })
  shortfallInvoiceId?: string;

  @Field()
  lastCalculatedAt: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => MinimumSpendRequirementGraphQLType, { nullable: true })
  requirement?: MinimumSpendRequirementGraphQLType;
}

@ObjectType('MemberSpendProgress')
export class MemberSpendProgressGraphQLType {
  @Field(() => Float)
  percentComplete: number;

  @Field(() => Float)
  percentOfPeriodElapsed: number;

  @Field(() => Float)
  projectedSpend: number;

  @Field()
  isOnTrack: boolean;

  @Field(() => Float)
  amountRemaining: number;

  @Field(() => Int)
  daysRemaining: number;
}
