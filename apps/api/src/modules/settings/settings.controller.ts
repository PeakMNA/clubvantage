import {
  Controller,
  Get,
  Patch,
  Body,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  SettingsService,
  UpdateClubProfileDto,
  UpdateBillingSettingsDto,
} from './settings.service';
import { CurrentUser, CurrentTenant } from '@/common/decorators';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

@ApiTags('Settings')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'settings', version: '1' })
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('club-profile')
  @RequirePermissions('settings.read')
  @ApiOperation({ summary: 'Get club profile' })
  async getClubProfile(@CurrentTenant() tenantId: string) {
    return this.settingsService.getClubProfile(tenantId);
  }

  @Patch('club-profile')
  @RequirePermissions('settings.update')
  @ApiOperation({ summary: 'Update club profile' })
  async updateClubProfile(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateClubProfileDto,
  ) {
    return this.settingsService.updateClubProfile(
      tenantId,
      dto,
      user.sub,
      user.email,
    );
  }

  @Get('billing')
  @RequirePermissions('settings.read')
  @ApiOperation({ summary: 'Get billing settings' })
  async getBillingSettings(@CurrentTenant() tenantId: string) {
    return this.settingsService.getBillingSettings(tenantId);
  }

  @Patch('billing')
  @RequirePermissions('settings.billing')
  @ApiOperation({ summary: 'Update billing settings' })
  async updateBillingSettings(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateBillingSettingsDto,
  ) {
    return this.settingsService.updateBillingSettings(
      tenantId,
      dto,
      user.sub,
      user.email,
    );
  }

  @Get('membership-types')
  @RequirePermissions('settings.read')
  @ApiOperation({ summary: 'Get membership types' })
  async getMembershipTypes(@CurrentTenant() tenantId: string) {
    return this.settingsService.getMembershipTypes(tenantId);
  }

  @Get('charge-types')
  @RequirePermissions('settings.read')
  @ApiOperation({ summary: 'Get charge types' })
  async getChargeTypes(@CurrentTenant() tenantId: string) {
    return this.settingsService.getChargeTypes(tenantId);
  }

  @Get('facilities')
  @RequirePermissions('settings.read')
  @ApiOperation({ summary: 'Get facilities' })
  async getFacilities(@CurrentTenant() tenantId: string) {
    return this.settingsService.getFacilities(tenantId);
  }

  @Get('golf-courses')
  @RequirePermissions('settings.read')
  @ApiOperation({ summary: 'Get golf courses' })
  async getGolfCourses(@CurrentTenant() tenantId: string) {
    return this.settingsService.getGolfCourses(tenantId);
  }
}
