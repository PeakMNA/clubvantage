import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

// Enums
export enum CloseChecklistStatusEnum {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum CloseChecklistPhaseEnum {
  PRE_CLOSE = 'PRE_CLOSE',
  CUT_OFF = 'CUT_OFF',
  RECEIVABLES = 'RECEIVABLES',
  TAX = 'TAX',
  RECONCILIATION = 'RECONCILIATION',
  REPORTING = 'REPORTING',
  CLOSE = 'CLOSE',
  STATEMENTS = 'STATEMENTS',
}

export enum StepEnforcementEnum {
  REQUIRED = 'REQUIRED',
  OPTIONAL = 'OPTIONAL',
}

export enum StepVerificationEnum {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
  SYSTEM_ACTION = 'SYSTEM_ACTION',
}

export enum StepStatusEnum {
  PENDING = 'PENDING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  SKIPPED = 'SKIPPED',
  SIGNED_OFF = 'SIGNED_OFF',
}

registerEnumType(CloseChecklistStatusEnum, {
  name: 'CloseChecklistStatus',
  description: 'Status of the AR close checklist',
});

registerEnumType(CloseChecklistPhaseEnum, {
  name: 'CloseChecklistPhase',
  description: 'Phase in the AR close process',
});

registerEnumType(StepEnforcementEnum, {
  name: 'StepEnforcement',
  description: 'Whether a step is required or optional',
});

registerEnumType(StepVerificationEnum, {
  name: 'StepVerification',
  description: 'How a step is verified',
});

registerEnumType(StepStatusEnum, {
  name: 'StepStatus',
  description: 'Status of a checklist step',
});

@ObjectType()
export class CloseChecklistStepGQLType {
  @Field(() => ID)
  id: string;

  @Field()
  stepKey: string;

  @Field(() => CloseChecklistPhaseEnum)
  phase: CloseChecklistPhaseEnum;

  @Field()
  label: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => StepEnforcementEnum)
  enforcement: StepEnforcementEnum;

  @Field(() => StepVerificationEnum)
  verification: StepVerificationEnum;

  @Field(() => StepStatusEnum)
  status: StepStatusEnum;

  @Field(() => GraphQLJSON, { nullable: true })
  autoCheckResult?: any;

  @Field(() => ID, { nullable: true })
  signedOffById?: string;

  @Field({ nullable: true })
  signedOffAt?: Date;

  @Field({ nullable: true })
  notes?: string;

  @Field(() => Int)
  sortOrder: number;
}

@ObjectType()
export class CloseChecklistGQLType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  periodId: string;

  @Field(() => CloseChecklistStatusEnum)
  status: CloseChecklistStatusEnum;

  @Field({ nullable: true })
  startedAt?: Date;

  @Field({ nullable: true })
  completedAt?: Date;

  @Field(() => ID, { nullable: true })
  completedById?: string;

  @Field(() => [CloseChecklistStepGQLType])
  steps: CloseChecklistStepGQLType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class CanClosePeriodResultType {
  @Field()
  canClose: boolean;

  @Field(() => [String])
  blockingSteps: string[];

  @Field(() => Int)
  completedRequired: number;

  @Field(() => Int)
  totalRequired: number;
}
