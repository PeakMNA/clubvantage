import { Field, ID, ObjectType, registerEnumType, Float, Int } from '@nestjs/graphql';
import {
  SettlementStatus,
  ExceptionType,
  ExceptionSeverity,
  ExceptionResolution,
} from '@prisma/client';

registerEnumType(SettlementStatus, {
  name: 'SettlementStatus',
  description: 'Status of a daily settlement',
});

registerEnumType(ExceptionType, {
  name: 'ExceptionType',
  description: 'Type of settlement exception',
});

registerEnumType(ExceptionSeverity, {
  name: 'ExceptionSeverity',
  description: 'Severity level of an exception',
});

registerEnumType(ExceptionResolution, {
  name: 'ExceptionResolution',
  description: 'Resolution status of an exception',
});

@ObjectType()
export class SettlementExceptionGraphQLType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  settlementId: string;

  @Field(() => ExceptionType)
  type: ExceptionType;

  @Field(() => ExceptionSeverity)
  severity: ExceptionSeverity;

  @Field(() => ExceptionResolution)
  resolution: ExceptionResolution;

  @Field()
  description: string;

  @Field(() => Float, { nullable: true })
  amount?: number;

  @Field(() => ID, { nullable: true })
  transactionId?: string;

  @Field(() => ID, { nullable: true })
  shiftId?: string;

  @Field(() => ID, { nullable: true })
  lineItemId?: string;

  @Field(() => ID, { nullable: true })
  resolvedBy?: string;

  @Field({ nullable: true })
  resolvedAt?: Date;

  @Field({ nullable: true })
  resolutionNote?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class DailySettlementGraphQLType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  clubId: string;

  @Field()
  businessDate: Date;

  @Field(() => SettlementStatus)
  status: SettlementStatus;

  // Sales totals
  @Field(() => Float)
  totalGrossSales: number;

  @Field(() => Float)
  totalDiscounts: number;

  @Field(() => Float)
  totalNetSales: number;

  @Field(() => Float)
  totalTax: number;

  @Field(() => Float)
  totalServiceCharge: number;

  // Payment breakdown
  @Field(() => Float)
  totalCash: number;

  @Field(() => Float)
  totalCard: number;

  @Field(() => Float)
  totalMemberAccount: number;

  @Field(() => Float)
  totalOther: number;

  // Refunds and voids
  @Field(() => Float)
  totalRefunds: number;

  @Field(() => Float)
  totalVoids: number;

  // Cash reconciliation
  @Field(() => Float)
  expectedCash: number;

  @Field(() => Float, { nullable: true })
  actualCash?: number;

  @Field(() => Float, { nullable: true })
  cashVariance?: number;

  // Transaction counts
  @Field(() => Int)
  transactionCount: number;

  @Field(() => Int)
  refundCount: number;

  @Field(() => Int)
  voidCount: number;

  // Workflow
  @Field(() => ID, { nullable: true })
  openedBy?: string;

  @Field({ nullable: true })
  openedAt?: Date;

  @Field(() => ID, { nullable: true })
  reviewedBy?: string;

  @Field({ nullable: true })
  reviewedAt?: Date;

  @Field(() => ID, { nullable: true })
  closedBy?: string;

  @Field({ nullable: true })
  closedAt?: Date;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [SettlementExceptionGraphQLType], { nullable: true })
  exceptions?: SettlementExceptionGraphQLType[];
}

@ObjectType()
export class SettlementSummaryGraphQLType {
  @Field(() => ID)
  settlementId: string;

  @Field()
  businessDate: Date;

  @Field(() => SettlementStatus)
  status: SettlementStatus;

  @Field(() => Float)
  totalGrossSales: number;

  @Field(() => Float)
  totalNetSales: number;

  @Field(() => Float)
  totalCash: number;

  @Field(() => Float)
  totalCard: number;

  @Field(() => Float)
  totalMemberAccount: number;

  @Field(() => Float)
  expectedCash: number;

  @Field(() => Float, { nullable: true })
  actualCash?: number;

  @Field(() => Float, { nullable: true })
  cashVariance?: number;

  @Field(() => Int)
  exceptionCount: number;

  @Field(() => Int)
  unresolvedExceptionCount: number;
}
