import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

// ============================================================================
// GREEN FEE RATE TYPE
// ============================================================================

@ObjectType()
export class GreenFeeRateType {
  @Field(() => ID)
  id: string;

  @Field()
  playerType: string;

  @Field(() => Int)
  holes: number;

  @Field()
  timeCategory: string;

  @Field(() => Float)
  amount: number;

  @Field()
  taxType: string;

  @Field(() => Float)
  taxRate: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// ============================================================================
// CART RATE TYPE
// ============================================================================

@ObjectType()
export class CartRateType {
  @Field(() => ID)
  id: string;

  @Field()
  cartType: string;

  @Field(() => Float)
  amount: number;

  @Field()
  taxType: string;

  @Field(() => Float)
  taxRate: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// ============================================================================
// CADDY RATE TYPE
// ============================================================================

@ObjectType()
export class CaddyRateType {
  @Field(() => ID)
  id: string;

  @Field()
  caddyType: string;

  @Field(() => Float)
  amount: number;

  @Field()
  taxType: string;

  @Field(() => Float)
  taxRate: number;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// ============================================================================
// RATE CONFIG TYPE
// ============================================================================

@ObjectType()
export class RateConfigType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  courseId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  isActive: boolean;

  @Field()
  effectiveFrom: Date;

  @Field({ nullable: true })
  effectiveTo?: Date;

  @Field(() => [GreenFeeRateType])
  greenFeeRates: GreenFeeRateType[];

  @Field(() => [CartRateType])
  cartRates: CartRateType[];

  @Field(() => [CaddyRateType])
  caddyRates: CaddyRateType[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

// ============================================================================
// MUTATION RESPONSES
// ============================================================================

@ObjectType()
export class RateConfigMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => RateConfigType, { nullable: true })
  rateConfig?: RateConfigType;
}

@ObjectType()
export class GreenFeeRateMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => GreenFeeRateType, { nullable: true })
  greenFeeRate?: GreenFeeRateType;
}

@ObjectType()
export class CartRateMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => CartRateType, { nullable: true })
  cartRate?: CartRateType;
}

@ObjectType()
export class CaddyRateMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;

  @Field(() => CaddyRateType, { nullable: true })
  caddyRate?: CaddyRateType;
}

@ObjectType()
export class DeleteRateMutationResponse {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;
}
