import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, ForbiddenException } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { FeatureFlagsService } from '@/modules/feature-flags/feature-flags.service';
import {
  FeatureFlagsType,
  ClubFeatureFlagsSummaryType,
  TierDefaultsType,
} from './feature-flags.types';

/**
 * Helper function to check if user has platform admin privileges.
 * Throws ForbiddenException if user is not a platform admin.
 */
function requirePlatformAdmin(user: JwtPayload): void {
  const isPlatformAdmin =
    user.roles?.includes('SUPER_ADMIN') || user.roles?.includes('PLATFORM_ADMIN');
  if (!isPlatformAdmin) {
    throw new ForbiddenException(
      'Platform admin access required. Only SUPER_ADMIN or PLATFORM_ADMIN roles can access this resource.',
    );
  }
}

@Resolver()
@UseGuards(GqlAuthGuard)
export class FeatureFlagsResolver {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Query(() => FeatureFlagsType, { name: 'featureFlags' })
  async getFeatureFlags(@GqlCurrentUser() user: JwtPayload) {
    return this.featureFlagsService.getFeatureFlags(user.tenantId);
  }

  @Query(() => Boolean, { name: 'isFeatureEnabled' })
  async isFeatureEnabled(
    @GqlCurrentUser() user: JwtPayload,
    @Args('featureKey') featureKey: string,
  ) {
    return this.featureFlagsService.isFeatureEnabled(user.tenantId, featureKey);
  }

  @Mutation(() => FeatureFlagsType)
  async updateOperationalFlag(
    @GqlCurrentUser() user: JwtPayload,
    @Args('key') key: string,
    @Args('value') value: boolean,
  ) {
    return this.featureFlagsService.updateOperationalFlag(
      user.tenantId,
      key,
      value,
    );
  }

  // Platform Admin Methods

  @Query(() => FeatureFlagsType, { name: 'clubFeatureFlags' })
  async getClubFeatureFlags(
    @GqlCurrentUser() user: JwtPayload,
    @Args('clubId', { type: () => ID }) clubId: string,
  ) {
    requirePlatformAdmin(user);
    return this.featureFlagsService.getFeatureFlags(clubId);
  }

  @Query(() => [ClubFeatureFlagsSummaryType], { name: 'allClubFeatureFlags' })
  async getAllClubFeatureFlags(@GqlCurrentUser() user: JwtPayload) {
    requirePlatformAdmin(user);
    return this.featureFlagsService.getAllClubsWithFlags();
  }

  @Query(() => [TierDefaultsType], { name: 'tierDefaults' })
  async getTierDefaults(@GqlCurrentUser() user: JwtPayload) {
    requirePlatformAdmin(user);
    return await this.featureFlagsService.getTierDefaults();
  }

  @Mutation(() => FeatureFlagsType, { name: 'updateClubOperationalFlag' })
  async updateClubOperationalFlag(
    @GqlCurrentUser() user: JwtPayload,
    @Args('clubId', { type: () => ID }) clubId: string,
    @Args('key') key: string,
    @Args('value') value: boolean,
  ) {
    requirePlatformAdmin(user);
    return this.featureFlagsService.updateOperationalFlag(clubId, key, value);
  }
}
