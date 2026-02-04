import { InputType, Field, Float } from '@nestjs/graphql';
import { SubAccountStatus, SubAccountPermission } from '@prisma/client';

@InputType()
export class CreateSubAccountInput {
  @Field()
  memberId: string;

  @Field()
  name: string;

  @Field()
  relationship: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  pin: string;

  @Field(() => [SubAccountPermission], { nullable: true })
  permissions?: SubAccountPermission[];

  @Field(() => Float, { nullable: true })
  dailyLimit?: number;

  @Field(() => Float, { nullable: true })
  weeklyLimit?: number;

  @Field(() => Float, { nullable: true })
  monthlyLimit?: number;

  @Field(() => Float, { nullable: true })
  perTransactionLimit?: number;

  @Field({ nullable: true })
  validFrom?: Date;

  @Field({ nullable: true })
  validUntil?: Date;

  @Field({ nullable: true, defaultValue: false })
  notifyPrimaryOnUse?: boolean;

  @Field({ nullable: true, defaultValue: true })
  notifyOnLimitReached?: boolean;
}

@InputType()
export class UpdateSubAccountInput {
  @Field()
  subAccountId: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  relationship?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field(() => [SubAccountPermission], { nullable: true })
  permissions?: SubAccountPermission[];

  @Field(() => Float, { nullable: true })
  dailyLimit?: number;

  @Field(() => Float, { nullable: true })
  weeklyLimit?: number;

  @Field(() => Float, { nullable: true })
  monthlyLimit?: number;

  @Field(() => Float, { nullable: true })
  perTransactionLimit?: number;

  @Field({ nullable: true })
  validUntil?: Date;

  @Field({ nullable: true })
  notifyPrimaryOnUse?: boolean;

  @Field({ nullable: true })
  notifyOnLimitReached?: boolean;
}

@InputType()
export class VerifyPinInput {
  @Field()
  subAccountId: string;

  @Field()
  pin: string;
}

@InputType()
export class ChangePinInput {
  @Field()
  subAccountId: string;

  @Field()
  newPin: string;
}

@InputType()
export class ChangeSubAccountStatusInput {
  @Field()
  subAccountId: string;

  @Field(() => SubAccountStatus)
  status: SubAccountStatus;
}

@InputType()
export class RecordTransactionInput {
  @Field()
  subAccountId: string;

  @Field(() => Float)
  amount: number;

  @Field()
  description: string;

  @Field(() => SubAccountPermission)
  category: SubAccountPermission;

  @Field({ nullable: true })
  paymentTransactionId?: string;

  @Field({ nullable: true })
  lineItemId?: string;

  @Field({ nullable: true })
  teeTimeId?: string;

  @Field({ nullable: true })
  locationName?: string;

  @Field({ nullable: true })
  notes?: string;
}

@InputType()
export class CheckLimitInput {
  @Field()
  subAccountId: string;

  @Field(() => Float)
  amount: number;

  @Field(() => SubAccountPermission)
  category: SubAccountPermission;
}

@InputType()
export class GetTransactionsInput {
  @Field({ nullable: true })
  subAccountId?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;
}
