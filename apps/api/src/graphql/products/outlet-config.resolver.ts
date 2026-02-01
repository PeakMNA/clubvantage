import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { OutletConfigService } from './outlet-config.service';
import { SuggestionService } from './suggestion.service';
import {
  OutletProductConfigType,
  OutletGridConfigType,
  SmartSuggestionConfigType,
  OutletProductPanelType,
} from './outlet-config.types';
import { ProductTypeGql } from './product.types';
import {
  UpdateOutletProductConfigInput,
  BulkOutletProductConfigInput,
  UpdateOutletGridConfigInput,
  UpdateSmartSuggestionConfigInput,
} from './outlet-config.input';

@Resolver()
@UseGuards(GqlAuthGuard)
export class OutletConfigResolver {
  constructor(
    private readonly outletConfigService: OutletConfigService,
    private readonly suggestionService: SuggestionService,
  ) {}

  // ============================================================================
  // QUERIES
  // ============================================================================

  @Query(() => [OutletProductConfigType], { name: 'outletProductConfigs' })
  async getOutletProductConfigs(
    @Args('outletId', { type: () => ID }) outletId: string,
  ) {
    return this.outletConfigService.getOutletProductConfigs(outletId);
  }

  @Query(() => OutletGridConfigType, { name: 'outletGridConfig', nullable: true })
  async getOutletGridConfig(
    @Args('outletId', { type: () => ID }) outletId: string,
  ) {
    return this.outletConfigService.getOutletGridConfig(outletId);
  }

  @Query(() => SmartSuggestionConfigType, { name: 'smartSuggestionConfig', nullable: true })
  async getSmartSuggestionConfig(
    @Args('outletId', { type: () => ID }) outletId: string,
  ) {
    return this.outletConfigService.getSmartSuggestionConfig(outletId);
  }

  @Query(() => [ProductTypeGql], { name: 'quickKeyProducts' })
  async getQuickKeys(
    @Args('outletId', { type: () => ID }) outletId: string,
  ) {
    return this.outletConfigService.getQuickKeys(outletId);
  }

  @Query(() => [ProductTypeGql], { name: 'smartSuggestions' })
  async getSuggestions(
    @GqlCurrentUser() user: JwtPayload,
    @Args('outletId', { type: () => ID }) outletId: string,
  ) {
    return this.suggestionService.getSuggestions(outletId, user.sub);
  }

  @Query(() => OutletProductPanelType, { name: 'outletProductPanel' })
  async getOutletProductPanel(
    @GqlCurrentUser() user: JwtPayload,
    @Args('outletId', { type: () => ID }) outletId: string,
  ) {
    const [gridConfig, suggestionConfig, quickKeys, suggestions] = await Promise.all([
      this.outletConfigService.getOutletGridConfig(outletId),
      this.outletConfigService.getSmartSuggestionConfig(outletId),
      this.outletConfigService.getQuickKeys(outletId),
      this.suggestionService.getSuggestions(outletId, user.sub),
    ]);

    return {
      gridConfig: gridConfig || {
        gridColumns: 6,
        gridRows: 4,
        tileSize: 'MEDIUM',
        showImages: true,
        showPrices: true,
        categoryStyle: 'TABS',
        showAllCategory: true,
        quickKeysEnabled: true,
        quickKeysCount: 8,
        quickKeysPosition: 'TOP',
      },
      suggestionConfig,
      quickKeys,
      suggestions,
    };
  }

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  @Mutation(() => OutletProductConfigType, { name: 'updateOutletProductConfig' })
  async updateOutletProductConfig(
    @Args('outletId', { type: () => ID }) outletId: string,
    @Args('productId', { type: () => ID }) productId: string,
    @Args('input') input: UpdateOutletProductConfigInput,
  ) {
    return this.outletConfigService.updateOutletProductConfig(outletId, productId, input);
  }

  @Mutation(() => [OutletProductConfigType], { name: 'bulkUpdateOutletProductConfigs' })
  async bulkUpdateOutletProductConfigs(
    @Args('outletId', { type: () => ID }) outletId: string,
    @Args('input') input: BulkOutletProductConfigInput,
  ) {
    return this.outletConfigService.bulkUpdateOutletProductConfigs(outletId, input);
  }

  @Mutation(() => OutletGridConfigType, { name: 'updateOutletGridConfig' })
  async updateOutletGridConfig(
    @Args('outletId', { type: () => ID }) outletId: string,
    @Args('input') input: UpdateOutletGridConfigInput,
  ) {
    return this.outletConfigService.updateOutletGridConfig(outletId, input);
  }

  @Mutation(() => SmartSuggestionConfigType, { name: 'updateSmartSuggestionConfig' })
  async updateSmartSuggestionConfig(
    @Args('outletId', { type: () => ID }) outletId: string,
    @Args('input') input: UpdateSmartSuggestionConfigInput,
  ) {
    return this.outletConfigService.updateSmartSuggestionConfig(outletId, input);
  }
}
