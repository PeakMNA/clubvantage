import { ObjectType, Field, ID, Int, Float, registerEnumType } from '@nestjs/graphql';

// AR Profile enums
export enum ARProfileTypeEnum {
  MEMBER = 'MEMBER',
  CITY_LEDGER = 'CITY_LEDGER',
}

export enum ARProfileStatusEnum {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

export enum StatementDeliveryEnum {
  EMAIL = 'EMAIL',
  PRINT = 'PRINT',
  PORTAL = 'PORTAL',
  SMS = 'SMS',
  EMAIL_AND_PRINT = 'EMAIL_AND_PRINT',
  ALL = 'ALL',
}

registerEnumType(ARProfileTypeEnum, {
  name: 'ARProfileType',
  description: 'Type of AR profile - member or city ledger',
});

registerEnumType(ARProfileStatusEnum, {
  name: 'ARProfileStatus',
  description: 'Status of AR profile',
});

registerEnumType(StatementDeliveryEnum, {
  name: 'StatementDelivery',
  description: 'Statement delivery method preference',
});

@ObjectType()
export class ARProfileGQLType {
  @Field(() => ID)
  id: string;

  @Field()
  accountNumber: string;

  @Field(() => ARProfileTypeEnum)
  profileType: ARProfileTypeEnum;

  @Field(() => ID, { nullable: true })
  memberId?: string;

  @Field(() => ID, { nullable: true })
  cityLedgerId?: string;

  @Field(() => StatementDeliveryEnum)
  statementDelivery: StatementDeliveryEnum;

  @Field(() => Int)
  paymentTermsDays: number;

  @Field(() => Float, { nullable: true })
  creditLimit?: number;

  @Field(() => Float)
  currentBalance: number;

  @Field({ nullable: true })
  lastStatementDate?: Date;

  @Field(() => Float, { nullable: true })
  lastStatementBalance?: number;

  @Field({ nullable: true })
  lastPaymentDate?: Date;

  @Field(() => Float, { nullable: true })
  lastPaymentAmount?: number;

  @Field(() => ARProfileStatusEnum)
  status: ARProfileStatusEnum;

  @Field({ nullable: true })
  suspendedAt?: Date;

  @Field({ nullable: true })
  suspendedReason?: string;

  @Field({ nullable: true })
  closedAt?: Date;

  @Field({ nullable: true })
  closedReason?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
