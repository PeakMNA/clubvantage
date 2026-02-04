import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { MinimumSpendPeriod, ShortfallAction, MemberSpendStatus } from '@prisma/client';

@InputType()
export class CreateRequirementInput {
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

  @Field({ nullable: true, defaultValue: true })
  includeFoodBeverage?: boolean;

  @Field({ nullable: true, defaultValue: true })
  includeGolf?: boolean;

  @Field({ nullable: true, defaultValue: false })
  includeSpa?: boolean;

  @Field({ nullable: true, defaultValue: false })
  includeRetail?: boolean;

  @Field({ nullable: true, defaultValue: false })
  includeEvents?: boolean;

  @Field(() => [String], { nullable: true })
  includedCategories?: string[];

  @Field(() => [String], { nullable: true })
  excludedCategories?: string[];

  @Field(() => ShortfallAction, { nullable: true })
  defaultShortfallAction?: ShortfallAction;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  gracePeriodDays?: number;

  @Field({ nullable: true, defaultValue: false })
  allowPartialCredit?: boolean;

  @Field(() => [Int], { nullable: true })
  notifyAtPercent?: number[];

  @Field(() => [Int], { nullable: true })
  notifyDaysBeforeEnd?: number[];

  @Field({ nullable: true })
  effectiveFrom?: Date;

  @Field({ nullable: true })
  effectiveTo?: Date;
}

@InputType()
export class UpdateRequirementInput {
  @Field()
  requirementId: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => [String], { nullable: true })
  membershipTypes?: string[];

  @Field(() => Float, { nullable: true })
  minimumAmount?: number;

  @Field(() => MinimumSpendPeriod, { nullable: true })
  period?: MinimumSpendPeriod;

  @Field({ nullable: true })
  includeFoodBeverage?: boolean;

  @Field({ nullable: true })
  includeGolf?: boolean;

  @Field({ nullable: true })
  includeSpa?: boolean;

  @Field({ nullable: true })
  includeRetail?: boolean;

  @Field({ nullable: true })
  includeEvents?: boolean;

  @Field(() => [String], { nullable: true })
  includedCategories?: string[];

  @Field(() => [String], { nullable: true })
  excludedCategories?: string[];

  @Field(() => ShortfallAction, { nullable: true })
  defaultShortfallAction?: ShortfallAction;

  @Field(() => Int, { nullable: true })
  gracePeriodDays?: number;

  @Field({ nullable: true })
  allowPartialCredit?: boolean;

  @Field(() => [Int], { nullable: true })
  notifyAtPercent?: number[];

  @Field(() => [Int], { nullable: true })
  notifyDaysBeforeEnd?: number[];

  @Field({ nullable: true })
  effectiveTo?: Date;

  @Field({ nullable: true })
  isActive?: boolean;
}

@InputType()
export class RecordSpendInput {
  @Field()
  memberId: string;

  @Field()
  requirementId: string;

  @Field(() => Float)
  amount: number;

  @Field({ nullable: true })
  category?: string;
}

@InputType()
export class ResolveShortfallInput {
  @Field()
  memberSpendId: string;

  @Field(() => ShortfallAction)
  action: ShortfallAction;

  @Field({ nullable: true })
  note?: string;
}

@InputType()
export class ExemptMemberInput {
  @Field()
  memberSpendId: string;

  @Field()
  reason: string;
}

@InputType()
export class GetMemberSpendsInput {
  @Field({ nullable: true })
  memberId?: string;

  @Field(() => MemberSpendStatus, { nullable: true })
  status?: MemberSpendStatus;

  @Field({ nullable: true })
  periodStart?: Date;

  @Field({ nullable: true })
  periodEnd?: Date;
}

@InputType()
export class ClosePeriodInput {
  @Field()
  periodEnd: Date;
}
