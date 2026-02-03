import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { LookupsService } from '@/modules/lookups/lookups.service';
import {
  LookupCategoryType,
  LookupValueType,
  LookupTranslationType,
  LookupMutationResultType,
} from './lookups.types';
import {
  LookupCategoryFilterInput,
  CreateLookupValueInput,
  UpdateLookupValueInput,
  AddLookupTranslationInput,
} from './lookups.input';

@Resolver()
@UseGuards(GqlAuthGuard)
export class LookupsResolver {
  constructor(private readonly lookupsService: LookupsService) {}

  // ============================================================================
  // Queries
  // ============================================================================

  @Query(() => [LookupCategoryType], { name: 'lookupCategories' })
  async getLookupCategories(
    @Args('filter', { type: () => LookupCategoryFilterInput, nullable: true })
    filter?: LookupCategoryFilterInput,
  ): Promise<LookupCategoryType[]> {
    const categories = await this.lookupsService.findAllCategories(filter);
    return categories.map((cat) => this.transformCategory(cat));
  }

  @Query(() => LookupCategoryType, { name: 'lookupCategory', nullable: true })
  async getLookupCategory(
    @Args('code') code: string,
  ): Promise<LookupCategoryType | null> {
    try {
      const category = await this.lookupsService.findCategoryByCode(code);
      return this.transformCategory(category);
    } catch {
      return null;
    }
  }

  @Query(() => [LookupValueType], { name: 'lookupValues' })
  async getLookupValues(
    @GqlCurrentUser() user: JwtPayload,
    @Args('categoryCode') categoryCode: string,
    @Args('includeInactive', { nullable: true }) includeInactive?: boolean,
  ): Promise<LookupValueType[]> {
    const values = await this.lookupsService.findValuesByCategory(
      categoryCode,
      user.tenantId,
      includeInactive ?? false,
    );
    return values.map((val) => this.transformValue(val));
  }

  @Query(() => LookupValueType, { name: 'lookupValue', nullable: true })
  async getLookupValue(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<LookupValueType | null> {
    try {
      const value = await this.lookupsService.findValueById(id);
      return this.transformValue(value);
    } catch {
      return null;
    }
  }

  // ============================================================================
  // Mutations
  // ============================================================================

  @Mutation(() => LookupMutationResultType)
  async createLookupValue(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateLookupValueInput,
  ): Promise<LookupMutationResultType> {
    try {
      const value = await this.lookupsService.createValue(user.tenantId, input);
      return {
        success: true,
        message: 'Lookup value created successfully',
        value: this.transformValue(value),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create lookup value',
      };
    }
  }

  @Mutation(() => LookupMutationResultType)
  async updateLookupValue(
    @Args('input') input: UpdateLookupValueInput,
  ): Promise<LookupMutationResultType> {
    try {
      const { id, ...updateData } = input;
      const value = await this.lookupsService.updateValue(id, updateData);
      return {
        success: true,
        message: 'Lookup value updated successfully',
        value: this.transformValue(value),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update lookup value',
      };
    }
  }

  @Mutation(() => LookupMutationResultType)
  async deleteLookupValue(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<LookupMutationResultType> {
    try {
      await this.lookupsService.deleteValue(id);
      return {
        success: true,
        message: 'Lookup value deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete lookup value',
      };
    }
  }

  @Mutation(() => LookupMutationResultType)
  async addLookupTranslation(
    @Args('input') input: AddLookupTranslationInput,
  ): Promise<LookupMutationResultType> {
    try {
      const translation = await this.lookupsService.addTranslation(input);
      return {
        success: true,
        message: 'Translation added successfully',
        translation: this.transformTranslation(translation),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add translation',
      };
    }
  }

  @Mutation(() => LookupMutationResultType)
  async deleteLookupTranslation(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<LookupMutationResultType> {
    try {
      await this.lookupsService.deleteTranslation(id);
      return {
        success: true,
        message: 'Translation deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete translation',
      };
    }
  }

  // ============================================================================
  // Transform Helpers
  // ============================================================================

  private transformCategory(cat: any): LookupCategoryType {
    return {
      id: cat.id,
      code: cat.code,
      name: cat.name,
      description: cat.description ?? undefined,
      isSystem: cat.isSystem,
      isGlobal: cat.isGlobal,
      sortOrder: cat.sortOrder,
      valueCount: cat._count?.values ?? cat.values?.length ?? 0,
      values: cat.values?.map((v: any) => this.transformValue(v)),
    };
  }

  private transformValue(val: any): LookupValueType {
    return {
      id: val.id,
      categoryId: val.categoryId,
      clubId: val.clubId ?? undefined,
      code: val.code,
      name: val.name,
      description: val.description ?? undefined,
      icon: val.icon ?? undefined,
      color: val.color ?? undefined,
      sortOrder: val.sortOrder,
      isActive: val.isActive,
      isDefault: val.isDefault,
      metadata: val.metadata ?? undefined,
      translations: val.translations?.map((t: any) => this.transformTranslation(t)),
      category: val.category ? this.transformCategory(val.category) : undefined,
    };
  }

  private transformTranslation(trans: any): LookupTranslationType {
    return {
      id: trans.id,
      lookupValueId: trans.lookupValueId,
      locale: trans.locale,
      name: trans.name,
      description: trans.description ?? undefined,
    };
  }
}
