import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { StatementDeliveryEnum } from './ar-profile.types';

// Delivery status enum
export enum DeliveryStatusEnum {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  NOT_APPLICABLE = 'NOT_APPLICABLE',
}

registerEnumType(DeliveryStatusEnum, {
  name: 'DeliveryStatus',
  description: 'Delivery status for statement channel',
});

@ObjectType()
export class StatementGQLType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  statementRunId: string;

  @Field(() => ID)
  arProfileId: string;

  // Statement identification (null until FINAL run)
  @Field({ nullable: true })
  statementNumber?: string;

  // Period dates
  @Field()
  periodStart: Date;

  @Field()
  periodEnd: Date;

  @Field()
  dueDate: Date;

  // Balances
  @Field(() => Float)
  openingBalance: number;

  @Field(() => Float)
  totalDebits: number;

  @Field(() => Float)
  totalCredits: number;

  @Field(() => Float)
  closingBalance: number;

  // Aging breakdown
  @Field(() => Float)
  agingCurrent: number;

  @Field(() => Float)
  aging1to30: number;

  @Field(() => Float)
  aging31to60: number;

  @Field(() => Float)
  aging61to90: number;

  @Field(() => Float)
  aging90Plus: number;

  // Profile snapshot (billing info at generation time)
  @Field(() => GraphQLJSON)
  profileSnapshot: Record<string, unknown>;

  // Transactions
  @Field(() => Int)
  transactionCount: number;

  @Field(() => GraphQLJSON, { nullable: true })
  transactions?: Record<string, unknown>;

  // PDF storage
  @Field({ nullable: true })
  pdfUrl?: string;

  @Field({ nullable: true })
  pdfGeneratedAt?: Date;

  // Delivery configuration
  @Field(() => StatementDeliveryEnum)
  deliveryMethod: StatementDeliveryEnum;

  // Email delivery tracking
  @Field(() => DeliveryStatusEnum)
  emailStatus: DeliveryStatusEnum;

  @Field({ nullable: true })
  emailSentAt?: Date;

  @Field({ nullable: true })
  emailDeliveredAt?: Date;

  @Field({ nullable: true })
  emailError?: string;

  // Print delivery tracking
  @Field(() => DeliveryStatusEnum)
  printStatus: DeliveryStatusEnum;

  @Field({ nullable: true })
  printedAt?: Date;

  @Field(() => ID, { nullable: true })
  printBatchId?: string;

  // Portal delivery tracking
  @Field(() => DeliveryStatusEnum)
  portalStatus: DeliveryStatusEnum;

  @Field({ nullable: true })
  portalPublishedAt?: Date;

  @Field({ nullable: true })
  portalViewedAt?: Date;

  // SMS delivery tracking
  @Field(() => DeliveryStatusEnum)
  smsStatus: DeliveryStatusEnum;

  @Field({ nullable: true })
  smsSentAt?: Date;

  @Field({ nullable: true })
  smsDeliveredAt?: Date;

  @Field({ nullable: true })
  smsError?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// Statement summary for list views
@ObjectType()
export class StatementSummaryType {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  statementNumber?: string;

  @Field()
  accountNumber: string;

  @Field()
  accountName: string;

  @Field()
  periodEnd: Date;

  @Field(() => Float)
  closingBalance: number;

  @Field(() => StatementDeliveryEnum)
  deliveryMethod: StatementDeliveryEnum;

  @Field(() => DeliveryStatusEnum)
  primaryDeliveryStatus: DeliveryStatusEnum;
}
