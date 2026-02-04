import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';

// Period status enum
export enum PeriodStatusEnum {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED',
}

registerEnumType(PeriodStatusEnum, {
  name: 'PeriodStatus',
  description: 'Status of statement period',
});

@ObjectType()
export class StatementPeriodGQLType {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  periodYear: number;

  @Field(() => Int)
  periodNumber: number;

  @Field()
  periodLabel: string;

  @Field()
  periodStart: Date;

  @Field()
  periodEnd: Date;

  @Field()
  cutoffDate: Date;

  @Field(() => PeriodStatusEnum)
  status: PeriodStatusEnum;

  @Field({ nullable: true })
  closedAt?: Date;

  @Field(() => ID, { nullable: true })
  closedBy?: string;

  @Field({ nullable: true })
  reopenedAt?: Date;

  @Field(() => ID, { nullable: true })
  reopenedBy?: string;

  @Field({ nullable: true })
  reopenReason?: string;

  @Field(() => ID, { nullable: true })
  reopenApprovedBy?: string;

  // Totals (populated at close)
  @Field(() => Int, { nullable: true })
  totalProfiles?: number;

  @Field(() => Int, { nullable: true })
  totalStatements?: number;

  @Field(() => Float, { nullable: true })
  totalOpeningBalance?: number;

  @Field(() => Float, { nullable: true })
  totalDebits?: number;

  @Field(() => Float, { nullable: true })
  totalCredits?: number;

  @Field(() => Float, { nullable: true })
  totalClosingBalance?: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
