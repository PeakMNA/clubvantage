import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { SettingsService } from '@/modules/settings/settings.service';
import { ClubProfileType, BillingSettingsType } from './settings.types';
import { UpdateClubProfileInput, UpdateBillingSettingsInput } from './settings.input';

@Resolver()
@UseGuards(GqlAuthGuard)
export class SettingsResolver {
  constructor(private readonly settingsService: SettingsService) {}

  @Query(() => ClubProfileType, { name: 'clubProfile' })
  async getClubProfile(@GqlCurrentUser() user: JwtPayload) {
    return this.settingsService.getClubProfile(user.tenantId);
  }

  @Mutation(() => ClubProfileType)
  async updateClubProfile(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: UpdateClubProfileInput,
  ) {
    return this.settingsService.updateClubProfile(
      user.tenantId,
      input,
      user.sub,
      user.email,
    );
  }

  @Query(() => BillingSettingsType, { name: 'billingSettings' })
  async getBillingSettings(@GqlCurrentUser() user: JwtPayload) {
    return this.settingsService.getBillingSettings(user.tenantId);
  }

  @Mutation(() => BillingSettingsType)
  async updateBillingSettings(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: UpdateBillingSettingsInput,
  ) {
    return this.settingsService.updateBillingSettings(
      user.tenantId,
      input,
      user.sub,
      user.email,
    );
  }
}
