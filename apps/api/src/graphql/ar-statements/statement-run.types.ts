import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

// Statement run enums
export enum StatementRunTypeEnum {
  PREVIEW = 'PREVIEW',
  FINAL = 'FINAL',
}

export enum StatementRunStatusEnum {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(StatementRunTypeEnum, {
  name: 'StatementRunType',
  description: 'Type of statement run - preview or final',
});

registerEnumType(StatementRunStatusEnum, {
  name: 'StatementRunStatus',
  description: 'Status of statement generation run',
});

@ObjectType()
export class StatementRunGQLType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  statementPeriodId: string;

  @Field(() => StatementRunTypeEnum)
  runType: StatementRunTypeEnum;

  @Field(() => Int)
  runNumber: number;

  @Field(() => StatementRunStatusEnum)
  status: StatementRunStatusEnum;

  @Field({ nullable: true })
  startedAt?: Date;

  @Field({ nullable: true })
  completedAt?: Date;

  // Progress tracking
  @Field(() => Int)
  totalProfiles: number;

  @Field(() => Int)
  processedCount: number;

  @Field(() => Int)
  generatedCount: number;

  @Field(() => Int)
  skippedCount: number;

  @Field(() => Int)
  errorCount: number;

  // Financial totals
  @Field(() => Float)
  totalOpeningBalance: number;

  @Field(() => Float)
  totalDebits: number;

  @Field(() => Float)
  totalCredits: number;

  @Field(() => Float)
  totalClosingBalance: number;

  // Error log
  @Field(() => GraphQLJSON, { nullable: true })
  errorLog?: Record<string, unknown>;

  @Field(() => ID, { nullable: true })
  createdBy?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// Progress update type for real-time updates
@ObjectType()
export class StatementRunProgressType {
  @Field(() => ID)
  runId: string;

  @Field(() => StatementRunStatusEnum)
  status: StatementRunStatusEnum;

  @Field(() => Int)
  processedCount: number;

  @Field(() => Int)
  totalProfiles: number;

  @Field(() => Float)
  percentComplete: number;

  @Field({ nullable: true })
  currentProfileName?: string;

  @Field(() => Int)
  errorCount: number;
}
