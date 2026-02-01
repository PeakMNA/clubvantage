import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { ProShopService } from './proshop.service';
import {
  ProShopCategoryType,
  ProShopProductType,
  ProShopProductConnectionType,
} from './golf.types';
import {
  CreateProShopCategoryInput,
  UpdateProShopCategoryInput,
  CreateProShopProductInput,
  UpdateProShopProductInput,
  BulkUpdateProShopProductInput,
  ProShopProductFilterInput,
} from './proshop.input';

/**
 * Resolver for Pro Shop categories and products
 */
@Resolver()
@UseGuards(GqlAuthGuard)
export class ProShopResolver {
  constructor(private readonly proShopService: ProShopService) {}

  // ============================================================================
  // CATEGORY QUERIES
  // ============================================================================

  @Query(() => [ProShopCategoryType], {
    name: 'proShopCategories',
    description: 'Get all pro shop categories for the current club',
  })
  async getCategories(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<ProShopCategoryType[]> {
    return this.proShopService.getCategories(user.tenantId);
  }

  @Query(() => ProShopCategoryType, {
    name: 'proShopCategory',
    description: 'Get a single pro shop category by ID',
    nullable: true,
  })
  async getCategory(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ProShopCategoryType | null> {
    return this.proShopService.getCategory(id);
  }

  // ============================================================================
  // CATEGORY MUTATIONS
  // ============================================================================

  @Mutation(() => ProShopCategoryType, {
    name: 'createProShopCategory',
    description: 'Create a new pro shop category',
  })
  async createCategory(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateProShopCategoryInput,
  ): Promise<ProShopCategoryType> {
    return this.proShopService.createCategory(user.tenantId, input);
  }

  @Mutation(() => ProShopCategoryType, {
    name: 'updateProShopCategory',
    description: 'Update an existing pro shop category',
  })
  async updateCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateProShopCategoryInput,
  ): Promise<ProShopCategoryType> {
    return this.proShopService.updateCategory(id, input);
  }

  @Mutation(() => Boolean, {
    name: 'deleteProShopCategory',
    description: 'Delete a pro shop category. If category has products, provide moveProductsTo.',
  })
  async deleteCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('moveProductsTo', { type: () => ID, nullable: true }) moveProductsTo?: string,
  ): Promise<boolean> {
    return this.proShopService.deleteCategory(id, moveProductsTo);
  }

  @Mutation(() => [ProShopCategoryType], {
    name: 'reorderProShopCategories',
    description: 'Reorder pro shop categories by providing ordered IDs',
  })
  async reorderCategories(
    @GqlCurrentUser() user: JwtPayload,
    @Args('orderedIds', { type: () => [ID] }) orderedIds: string[],
  ): Promise<ProShopCategoryType[]> {
    return this.proShopService.reorderCategories(user.tenantId, orderedIds);
  }

  // ============================================================================
  // PRODUCT QUERIES
  // ============================================================================

  @Query(() => ProShopProductConnectionType, {
    name: 'proShopProducts',
    description: 'Get pro shop products with filtering and pagination',
  })
  async getProducts(
    @GqlCurrentUser() user: JwtPayload,
    @Args('filter', { nullable: true }) filter?: ProShopProductFilterInput,
  ): Promise<ProShopProductConnectionType> {
    return this.proShopService.getProducts(user.tenantId, filter);
  }

  @Query(() => ProShopProductType, {
    name: 'proShopProduct',
    description: 'Get a single pro shop product by ID',
    nullable: true,
  })
  async getProduct(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<ProShopProductType | null> {
    return this.proShopService.getProduct(id);
  }

  @Query(() => [ProShopProductType], {
    name: 'quickAddProducts',
    description: 'Get products marked as quick add for check-in',
  })
  async getQuickAddProducts(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<ProShopProductType[]> {
    return this.proShopService.getQuickAddProducts(user.tenantId);
  }

  // ============================================================================
  // PRODUCT MUTATIONS
  // ============================================================================

  @Mutation(() => ProShopProductType, {
    name: 'createProShopProduct',
    description: 'Create a new pro shop product',
  })
  async createProduct(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateProShopProductInput,
  ): Promise<ProShopProductType> {
    return this.proShopService.createProduct(user.tenantId, input);
  }

  @Mutation(() => ProShopProductType, {
    name: 'updateProShopProduct',
    description: 'Update an existing pro shop product',
  })
  async updateProduct(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateProShopProductInput,
  ): Promise<ProShopProductType> {
    return this.proShopService.updateProduct(id, input);
  }

  @Mutation(() => Boolean, {
    name: 'deleteProShopProduct',
    description: 'Delete a pro shop product',
  })
  async deleteProduct(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.proShopService.deleteProduct(id);
  }

  @Mutation(() => [ProShopProductType], {
    name: 'bulkUpdateProShopProducts',
    description: 'Bulk update multiple pro shop products',
  })
  async bulkUpdateProducts(
    @GqlCurrentUser() user: JwtPayload,
    @Args('ids', { type: () => [ID] }) ids: string[],
    @Args('input') input: BulkUpdateProShopProductInput,
  ): Promise<ProShopProductType[]> {
    return this.proShopService.bulkUpdateProducts(ids, user.tenantId, input);
  }

  @Mutation(() => ProShopProductType, {
    name: 'toggleProductQuickAdd',
    description: 'Toggle quick add status for a product',
  })
  async toggleProductQuickAdd(
    @Args('id', { type: () => ID }) id: string,
    @Args('isQuickAdd') isQuickAdd: boolean,
  ): Promise<ProShopProductType> {
    return this.proShopService.toggleProductQuickAdd(id, isQuickAdd);
  }
}
