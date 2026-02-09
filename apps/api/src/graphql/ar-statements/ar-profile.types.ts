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
export class ARProfileSyncResultType {
  @Field(() => Int)
  created: number;

  @Field(() => Int)
  skipped: number;

  @Field(() => [String])
  errors: string[];
}

@ObjectType()
export class MemberWithoutARProfileType {
  @Field(() => ID)
  id: string;

  @Field()
  memberId: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  membershipTypeName?: string;
}

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

  // Standalone account info (for CITY_LEDGER without linked entity)
  @Field({ nullable: true, description: 'Account name for standalone city ledger profiles' })
  accountName?: string;

  @Field({ nullable: true, description: 'Contact email for standalone profiles' })
  contactEmail?: string;

  @Field({ nullable: true, description: 'Contact phone for standalone profiles' })
  contactPhone?: string;

  @Field({ nullable: true, description: 'Billing address for standalone profiles' })
  billingAddress?: string;

  // Business details (for CITY_LEDGER corporate accounts)
  @Field({ nullable: true, description: 'Tax ID for corporate accounts' })
  taxId?: string;

  @Field({ nullable: true, description: 'Business registration number' })
  businessRegistrationId?: string;

  @Field({ nullable: true, description: 'Branch name (e.g., Head Office, Bangkok Branch)' })
  branchName?: string;

  @Field({ nullable: true, description: 'Branch code (e.g., 00000 for head office)' })
  branchCode?: string;

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
