import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { CheckInSettingsService } from './check-in-settings.service';
import {
  CheckInSettingsType,
  CheckInPaymentMethodType,
} from './golf.types';
import {
  CheckInPolicyInput,
  TaxConfigInput,
  StarterTicketConfigInput,
  ProShopConfigInput,
  POSConfigInput,
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
} from './check-in-settings.input';

/**
 * Resolver for golf check-in settings
 */
@Resolver()
@UseGuards(GqlAuthGuard)
export class CheckInSettingsResolver {
  constructor(private readonly settingsService: CheckInSettingsService) {}

  // ============================================================================
  // QUERIES
  // ============================================================================

  @Query(() => CheckInSettingsType, {
    name: 'golfCheckInSettings',
    description: 'Get complete golf check-in settings for the current club',
  })
  async getCheckInSettings(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<CheckInSettingsType> {
    return this.settingsService.getCheckInSettings(user.tenantId);
  }

  @Query(() => [CheckInPaymentMethodType], {
    name: 'checkInPaymentMethods',
    description: 'Get all payment methods for check-in',
  })
  async getPaymentMethods(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<CheckInPaymentMethodType[]> {
    return this.settingsService.getPaymentMethods(user.tenantId);
  }

  @Query(() => CheckInPaymentMethodType, {
    name: 'checkInPaymentMethod',
    description: 'Get a single payment method by ID',
    nullable: true,
  })
  async getPaymentMethod(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<CheckInPaymentMethodType | null> {
    return this.settingsService.getPaymentMethod(id);
  }

  // ============================================================================
  // MUTATIONS - SETTINGS
  // ============================================================================

  @Mutation(() => CheckInSettingsType, {
    name: 'updateCheckInPolicy',
    description: 'Update check-in policy settings',
  })
  async updateCheckInPolicy(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CheckInPolicyInput,
  ): Promise<CheckInSettingsType> {
    return this.settingsService.updateCheckInPolicy(user.tenantId, input);
  }

  @Mutation(() => CheckInSettingsType, {
    name: 'updateTaxConfig',
    description: 'Update tax configuration including overrides',
  })
  async updateTaxConfig(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: TaxConfigInput,
  ): Promise<CheckInSettingsType> {
    return this.settingsService.updateTaxConfig(user.tenantId, input);
  }

  @Mutation(() => CheckInSettingsType, {
    name: 'updateStarterTicketConfig',
    description: 'Update starter ticket configuration',
  })
  async updateStarterTicketConfig(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: StarterTicketConfigInput,
  ): Promise<CheckInSettingsType> {
    return this.settingsService.updateStarterTicketConfig(user.tenantId, input);
  }

  @Mutation(() => CheckInSettingsType, {
    name: 'updateProShopConfig',
    description: 'Update pro shop integration settings',
  })
  async updateProShopConfig(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: ProShopConfigInput,
  ): Promise<CheckInSettingsType> {
    return this.settingsService.updateProShopConfig(user.tenantId, input);
  }

  @Mutation(() => CheckInSettingsType, {
    name: 'updatePOSConfig',
    description: 'Update POS integration settings',
  })
  async updatePOSConfig(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: POSConfigInput,
  ): Promise<CheckInSettingsType> {
    return this.settingsService.updatePOSConfig(user.tenantId, input);
  }

  @Mutation(() => CheckInSettingsType, {
    name: 'resetCheckInSettings',
    description: 'Reset all check-in settings to defaults',
  })
  async resetCheckInSettings(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<CheckInSettingsType> {
    return this.settingsService.resetCheckInSettings(user.tenantId);
  }

  // ============================================================================
  // MUTATIONS - PAYMENT METHODS
  // ============================================================================

  @Mutation(() => CheckInPaymentMethodType, {
    name: 'createCheckInPaymentMethod',
    description: 'Create a new payment method for check-in',
  })
  async createPaymentMethod(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreatePaymentMethodInput,
  ): Promise<CheckInPaymentMethodType> {
    return this.settingsService.createPaymentMethod(user.tenantId, input);
  }

  @Mutation(() => CheckInPaymentMethodType, {
    name: 'updateCheckInPaymentMethod',
    description: 'Update an existing payment method',
  })
  async updatePaymentMethod(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdatePaymentMethodInput,
  ): Promise<CheckInPaymentMethodType> {
    return this.settingsService.updatePaymentMethod(id, input);
  }

  @Mutation(() => Boolean, {
    name: 'deleteCheckInPaymentMethod',
    description: 'Delete a payment method',
  })
  async deletePaymentMethod(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.settingsService.deletePaymentMethod(id, user.tenantId);
  }

  @Mutation(() => [CheckInPaymentMethodType], {
    name: 'reorderCheckInPaymentMethods',
    description: 'Reorder payment methods by providing ordered IDs',
  })
  async reorderPaymentMethods(
    @GqlCurrentUser() user: JwtPayload,
    @Args('orderedIds', { type: () => [ID] }) orderedIds: string[],
  ): Promise<CheckInPaymentMethodType[]> {
    return this.settingsService.reorderPaymentMethods(user.tenantId, orderedIds);
  }

  @Mutation(() => CheckInPaymentMethodType, {
    name: 'toggleCheckInPaymentMethod',
    description: 'Enable or disable a payment method',
  })
  async togglePaymentMethod(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('isEnabled') isEnabled: boolean,
  ): Promise<CheckInPaymentMethodType> {
    return this.settingsService.togglePaymentMethod(id, user.tenantId, isEnabled);
  }
}
