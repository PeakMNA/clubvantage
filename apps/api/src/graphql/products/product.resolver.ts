import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { ProductService } from './product.service';
import {
  ProductTypeGql,
  ProductConnectionType,
  ProductCategoryType,
  ModifierGroupType,
} from './product.types';
import {
  CreateProductInput,
  UpdateProductInput,
  ProductFilterInput,
  CreateProductCategoryInput,
  UpdateProductCategoryInput,
  CreateModifierGroupInput,
  UpdateModifierGroupInput,
} from './product.input';

@Resolver()
@UseGuards(GqlAuthGuard)
export class ProductResolver {
  constructor(private readonly productService: ProductService) {}

  // ============================================================================
  // CATEGORY QUERIES
  // ============================================================================

  @Query(() => [ProductCategoryType], {
    name: 'productCategories',
    description: 'Get all product categories',
  })
  async getCategories(
    @GqlCurrentUser() user: JwtPayload,
    @Args('includeInactive', { nullable: true }) includeInactive?: boolean,
  ) {
    const categories = await this.productService.getCategories(
      user.tenantId,
      includeInactive,
    );
    return categories.map((c) => ({
      ...c,
      productCount: c._count?.products ?? 0,
    }));
  }

  @Query(() => ProductCategoryType, {
    name: 'productCategory',
    nullable: true,
  })
  async getCategory(@Args('id', { type: () => ID }) id: string) {
    return this.productService.getCategory(id);
  }

  // ============================================================================
  // CATEGORY MUTATIONS
  // ============================================================================

  @Mutation(() => ProductCategoryType, { name: 'createProductCategory' })
  async createCategory(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateProductCategoryInput,
  ) {
    return this.productService.createCategory(user.tenantId, input);
  }

  @Mutation(() => ProductCategoryType, { name: 'updateProductCategory' })
  async updateCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateProductCategoryInput,
  ) {
    return this.productService.updateCategory(id, input);
  }

  @Mutation(() => Boolean, { name: 'deleteProductCategory' })
  async deleteCategory(
    @Args('id', { type: () => ID }) id: string,
    @Args('moveProductsTo', { type: () => ID, nullable: true }) moveProductsTo?: string,
  ) {
    return this.productService.deleteCategory(id, moveProductsTo);
  }

  // ============================================================================
  // PRODUCT QUERIES
  // ============================================================================

  @Query(() => ProductConnectionType, {
    name: 'products',
    description: 'Get products with filtering and pagination',
  })
  async getProducts(
    @GqlCurrentUser() user: JwtPayload,
    @Args('filter', { nullable: true }) filter?: ProductFilterInput,
  ) {
    return this.productService.getProducts(user.tenantId, filter);
  }

  @Query(() => ProductTypeGql, {
    name: 'product',
    nullable: true,
  })
  async getProduct(@Args('id', { type: () => ID }) id: string) {
    return this.productService.getProduct(id);
  }

  // ============================================================================
  // PRODUCT MUTATIONS
  // ============================================================================

  @Mutation(() => ProductTypeGql, { name: 'createProduct' })
  async createProduct(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateProductInput,
  ) {
    return this.productService.createProduct(user.tenantId, input);
  }

  @Mutation(() => ProductTypeGql, { name: 'updateProduct' })
  async updateProduct(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateProductInput,
  ) {
    return this.productService.updateProduct(id, input);
  }

  @Mutation(() => Boolean, { name: 'deleteProduct' })
  async deleteProduct(@Args('id', { type: () => ID }) id: string) {
    return this.productService.deleteProduct(id);
  }

  // ============================================================================
  // MODIFIER GROUP QUERIES & MUTATIONS
  // ============================================================================

  @Query(() => [ModifierGroupType], { name: 'modifierGroups' })
  async getModifierGroups(@GqlCurrentUser() user: JwtPayload) {
    return this.productService.getModifierGroups(user.tenantId);
  }

  @Mutation(() => ModifierGroupType, { name: 'createModifierGroup' })
  async createModifierGroup(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateModifierGroupInput,
  ) {
    return this.productService.createModifierGroup(user.tenantId, input);
  }

  @Mutation(() => ModifierGroupType, { name: 'updateModifierGroup' })
  async updateModifierGroup(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateModifierGroupInput,
  ) {
    return this.productService.updateModifierGroup(id, input);
  }
}
