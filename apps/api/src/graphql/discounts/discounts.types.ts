import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Paginated } from '../common/pagination';
import { DiscountType, DiscountScope } from '@prisma/client';

// Register enums for GraphQL
export { DiscountType, DiscountScope };

registerEnumType(DiscountType, {
  name: 'DiscountType',
  description: 'Type of discount calculation',
});

registerEnumType(DiscountScope, {
  name: 'DiscountScope',
  description: 'Scope of discount application',
});

@ObjectType()
export class DiscountConditionsType {
  @Field({ nullable: true })
  minimumAmount?: string;

  @Field({ nullable: true })
  maximumDiscount?: string;

  @Field(() => [String], { nullable: true })
  membershipTypeIds?: string[];

  @Field(() => [String], { nullable: true })
  playerTypes?: string[];
}

@ObjectType()
export class DiscountValidityType {
  @Field({ nullable: true })
  validFrom?: Date;

  @Field({ nullable: true })
  validTo?: Date;

  @Field({ nullable: true })
  usageLimit?: number;

  @Field()
  usageCount: number;
}

@ObjectType()
export class DiscountApprovalType {
  @Field()
  requiresApproval: boolean;

  @Field({ nullable: true })
  approvalThreshold?: string;
}

@ObjectType()
export class DiscountGraphQLType {
  @Field(() => ID)
  id: string;

  @Field()
  clubId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  code?: string;

  @Field(() => DiscountType)
  type: DiscountType;

  @Field()
  value: string;

  @Field(() => DiscountScope)
  scope: DiscountScope;

  @Field(() => DiscountConditionsType)
  conditions: DiscountConditionsType;

  @Field(() => DiscountValidityType)
  validity: DiscountValidityType;

  @Field(() => DiscountApprovalType)
  approval: DiscountApprovalType;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class DiscountConnection extends Paginated(DiscountGraphQLType) {}

@ObjectType()
export class AppliedDiscountType {
  @Field(() => ID)
  id: string;

  @Field()
  discountId: string;

  @Field({ nullable: true })
  lineItemId?: string;

  @Field({ nullable: true })
  transactionId?: string;

  @Field(() => DiscountType)
  discountType: DiscountType;

  @Field()
  discountValue: string;

  @Field()
  calculatedAmount: string;

  @Field()
  appliedBy: string;

  @Field({ nullable: true })
  approvedBy?: string;

  @Field({ nullable: true })
  approvalNote?: string;

  @Field()
  createdAt: Date;

  @Field(() => DiscountGraphQLType, { nullable: true })
  discount?: DiscountGraphQLType;
}

@ObjectType()
export class ApplyDiscountResultType {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => AppliedDiscountType, { nullable: true })
  appliedDiscount?: AppliedDiscountType;

  @Field({ nullable: true })
  requiresApproval?: boolean;

  @Field({ nullable: true })
  originalAmount?: string;

  @Field({ nullable: true })
  discountedAmount?: string;

  @Field({ nullable: true })
  savings?: string;
}

@ObjectType()
export class DiscountValidationResultType {
  @Field()
  isValid: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field({ nullable: true })
  calculatedAmount?: string;

  @Field({ nullable: true })
  requiresApproval?: boolean;
}
