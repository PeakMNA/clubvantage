import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { FeatureFlagsService } from '@/modules/feature-flags/feature-flags.service';
import { FeatureFlagsType } from './feature-flags.types';

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
}
