import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { DiscountService } from './discounts.service';
import { encodeCursor } from '../common/pagination';
import {
  DiscountGraphQLType,
  DiscountConnection,
  AppliedDiscountType,
  ApplyDiscountResultType,
  DiscountValidationResultType,
} from './discounts.types';
import {
  CreateDiscountInput,
  UpdateDiscountInput,
  ApplyDiscountInput,
  ApplyDiscountByCodeInput,
  ApproveDiscountInput,
  ValidateDiscountInput,
  DiscountsQueryArgs,
} from './discounts.input';

/**
 * Resolver for Discount management and application
 */
@Resolver()
@UseGuards(GqlAuthGuard)
export class DiscountResolver {
  constructor(private readonly discountService: DiscountService) {}

  // ============================================================================
  // DISCOUNT QUERIES
  // ============================================================================

  @Query(() => DiscountConnection, {
    name: 'discounts',
    description: 'Get all discounts for the current club with filtering and pagination',
  })
  async getDiscounts(
    @GqlCurrentUser() user: JwtPayload,
    @Args() args: DiscountsQueryArgs,
  ): Promise<DiscountConnection> {
    const { discounts, total } = await this.discountService.getDiscounts(
      user.tenantId,
      args,
    );

    const edges = discounts.map((discount) => ({
      node: this.mapDiscountToGraphQL(discount),
      cursor: encodeCursor(discount.id),
    }));

    return {
      edges,
      pageInfo: {
        hasNextPage: args.offset + discounts.length < total,
        hasPreviousPage: args.offset > 0,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      },
      totalCount: total,
    };
  }

  @Query(() => [DiscountGraphQLType], {
    name: 'activeDiscounts',
    description: 'Get all active discounts for POS use',
  })
  async getActiveDiscounts(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<DiscountGraphQLType[]> {
    const discounts = await this.discountService.getActiveDiscounts(user.tenantId);
    return discounts.map(this.mapDiscountToGraphQL);
  }

  @Query(() => DiscountGraphQLType, {
    name: 'discount',
    description: 'Get a single discount by ID',
    nullable: true,
  })
  async getDiscount(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DiscountGraphQLType | null> {
    const discount = await this.discountService.getDiscount(user.tenantId, id);
    return discount ? this.mapDiscountToGraphQL(discount) : null;
  }

  @Query(() => DiscountGraphQLType, {
    name: 'discountByCode',
    description: 'Find a discount by its code',
    nullable: true,
  })
  async getDiscountByCode(
    @GqlCurrentUser() user: JwtPayload,
    @Args('code') code: string,
  ): Promise<DiscountGraphQLType | null> {
    const discount = await this.discountService.getDiscountByCode(
      user.tenantId,
      code,
    );
    return discount ? this.mapDiscountToGraphQL(discount) : null;
  }

  @Query(() => DiscountValidationResultType, {
    name: 'validateDiscount',
    description: 'Validate if a discount can be applied',
  })
  async validateDiscount(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: ValidateDiscountInput,
  ): Promise<DiscountValidationResultType> {
    const result = await this.discountService.validateDiscount(user.tenantId, input);
    return {
      isValid: result.isValid,
      message: result.message,
      calculatedAmount: result.calculatedAmount?.toString(),
      requiresApproval: result.requiresApproval,
    };
  }

  @Query(() => [AppliedDiscountType], {
    name: 'lineItemDiscounts',
    description: 'Get discounts applied to a line item',
  })
  async getLineItemDiscounts(
    @Args('lineItemId', { type: () => ID }) lineItemId: string,
  ): Promise<AppliedDiscountType[]> {
    const discounts = await this.discountService.getLineItemDiscounts(lineItemId);
    return discounts.map(this.mapAppliedDiscountToGraphQL);
  }

  @Query(() => [AppliedDiscountType], {
    name: 'transactionDiscounts',
    description: 'Get discounts applied to a transaction',
  })
  async getTransactionDiscounts(
    @Args('transactionId', { type: () => ID }) transactionId: string,
  ): Promise<AppliedDiscountType[]> {
    const discounts = await this.discountService.getTransactionDiscounts(transactionId);
    return discounts.map(this.mapAppliedDiscountToGraphQL);
  }

  // ============================================================================
  // DISCOUNT MUTATIONS
  // ============================================================================

  @Mutation(() => DiscountGraphQLType, {
    name: 'createDiscount',
    description: 'Create a new discount',
  })
  async createDiscount(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateDiscountInput,
  ): Promise<DiscountGraphQLType> {
    const discount = await this.discountService.createDiscount(user.tenantId, input);
    return this.mapDiscountToGraphQL(discount);
  }

  @Mutation(() => DiscountGraphQLType, {
    name: 'updateDiscount',
    description: 'Update an existing discount',
  })
  async updateDiscount(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateDiscountInput,
  ): Promise<DiscountGraphQLType> {
    const discount = await this.discountService.updateDiscount(
      user.tenantId,
      id,
      input,
    );
    return this.mapDiscountToGraphQL(discount);
  }

  @Mutation(() => Boolean, {
    name: 'deleteDiscount',
    description: 'Delete a discount (soft delete)',
  })
  async deleteDiscount(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.discountService.deleteDiscount(user.tenantId, id);
  }

  // ============================================================================
  // APPLY DISCOUNT MUTATIONS
  // ============================================================================

  @Mutation(() => ApplyDiscountResultType, {
    name: 'applyDiscount',
    description: 'Apply a discount to a line item or transaction',
  })
  async applyDiscount(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: ApplyDiscountInput,
  ): Promise<ApplyDiscountResultType> {
    const result = await this.discountService.applyDiscount(
      user.tenantId,
      input,
      user.sub,
    );
    return {
      success: result.success,
      message: result.message,
      requiresApproval: result.requiresApproval,
      originalAmount: result.originalAmount?.toString(),
      discountedAmount: result.discountedAmount?.toString(),
      savings: result.savings?.toString(),
    };
  }

  @Mutation(() => ApplyDiscountResultType, {
    name: 'applyDiscountByCode',
    description: 'Apply a discount using a promo code',
  })
  async applyDiscountByCode(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: ApplyDiscountByCodeInput,
  ): Promise<ApplyDiscountResultType> {
    const result = await this.discountService.applyDiscountByCode(
      user.tenantId,
      input,
      user.sub,
    );
    return {
      success: result.success,
      message: result.message,
      requiresApproval: result.requiresApproval,
      originalAmount: result.originalAmount?.toString(),
      discountedAmount: result.discountedAmount?.toString(),
      savings: result.savings?.toString(),
    };
  }

  @Mutation(() => AppliedDiscountType, {
    name: 'approveDiscount',
    description: 'Approve a pending discount that requires manager approval',
  })
  async approveDiscount(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: ApproveDiscountInput,
  ): Promise<AppliedDiscountType> {
    const appliedDiscount = await this.discountService.approveDiscount(
      user.tenantId,
      input.appliedDiscountId,
      user.sub,
      input.approvalNote,
    );
    return this.mapAppliedDiscountToGraphQL(appliedDiscount);
  }

  @Mutation(() => Boolean, {
    name: 'removeAppliedDiscount',
    description: 'Remove an applied discount',
  })
  async removeAppliedDiscount(
    @GqlCurrentUser() user: JwtPayload,
    @Args('appliedDiscountId', { type: () => ID }) appliedDiscountId: string,
  ): Promise<boolean> {
    return this.discountService.removeAppliedDiscount(user.tenantId, appliedDiscountId);
  }

  // ============================================================================
  // MAPPING HELPERS
  // ============================================================================

  private mapDiscountToGraphQL = (discount: any): DiscountGraphQLType => ({
    id: discount.id,
    clubId: discount.clubId,
    name: discount.name,
    code: discount.code,
    type: discount.type,
    value: discount.value.toString(),
    scope: discount.scope,
    conditions: {
      minimumAmount: discount.minimumAmount?.toString(),
      maximumDiscount: discount.maximumDiscount?.toString(),
      membershipTypeIds: discount.membershipTypeIds,
      playerTypes: discount.playerTypes,
    },
    validity: {
      validFrom: discount.validFrom,
      validTo: discount.validTo,
      usageLimit: discount.usageLimit,
      usageCount: discount.usageCount,
    },
    approval: {
      requiresApproval: discount.requiresApproval,
      approvalThreshold: discount.approvalThreshold?.toString(),
    },
    isActive: discount.isActive,
    createdAt: discount.createdAt,
    updatedAt: discount.updatedAt,
  });

  private mapAppliedDiscountToGraphQL = (applied: any): AppliedDiscountType => ({
    id: applied.id,
    discountId: applied.discountId,
    lineItemId: applied.lineItemId,
    transactionId: applied.transactionId,
    discountType: applied.discountType,
    discountValue: applied.discountValue.toString(),
    calculatedAmount: applied.calculatedAmount.toString(),
    appliedBy: applied.appliedBy,
    approvedBy: applied.approvedBy,
    approvalNote: applied.approvalNote,
    createdAt: applied.createdAt,
    discount: applied.discount ? this.mapDiscountToGraphQL(applied.discount) : undefined,
  });
}
