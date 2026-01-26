import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GolfService, CreateFlightDto, UpdateFlightDto } from './golf.service';
import { CurrentUser, CurrentTenant } from '@/common/decorators';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

@ApiTags('Golf')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'golf', version: '1' })
export class GolfController {
  constructor(private readonly golfService: GolfService) {}

  @Get('teesheet')
  @RequirePermissions('golf.read')
  @ApiOperation({ summary: 'Get tee sheet for a date' })
  async getTeeSheet(
    @CurrentTenant() tenantId: string,
    @Query('courseId', ParseUUIDPipe) courseId: string,
    @Query('date') date: string,
  ) {
    return this.golfService.getTeeSheet(tenantId, courseId, date);
  }

  @Post('flights')
  @RequirePermissions('golf.book')
  @ApiOperation({ summary: 'Create a new flight booking' })
  async createFlight(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateFlightDto,
  ) {
    return this.golfService.createFlight(tenantId, dto, user.sub, user.email);
  }

  @Get('flights/:id')
  @RequirePermissions('golf.read')
  @ApiOperation({ summary: 'Get flight details' })
  async getFlight(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.golfService.getFlight(tenantId, id);
  }

  @Patch('flights/:id')
  @RequirePermissions('golf.update')
  @ApiOperation({ summary: 'Update flight' })
  async updateFlight(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFlightDto,
  ) {
    return this.golfService.updateFlight(tenantId, id, dto, user.sub, user.email);
  }

  @Delete('flights/:id')
  @RequirePermissions('golf.cancel')
  @ApiOperation({ summary: 'Cancel flight' })
  async cancelFlight(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
  ) {
    return this.golfService.cancelFlight(tenantId, id, reason, user.sub, user.email);
  }

  @Post('flights/:id/checkin')
  @RequirePermissions('golf.checkin')
  @ApiOperation({ summary: 'Check in flight' })
  async checkinFlight(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.golfService.checkinFlight(tenantId, id, user.sub, user.email);
  }

  @Get('courses')
  @RequirePermissions('golf.read')
  @ApiOperation({ summary: 'Get all golf courses' })
  async getCourses(@CurrentTenant() tenantId: string) {
    return this.golfService.getCourses(tenantId);
  }

  @Get('caddies')
  @RequirePermissions('golf.read')
  @ApiOperation({ summary: 'Get all caddies' })
  async getCaddies(@CurrentTenant() tenantId: string) {
    return this.golfService.getCaddies(tenantId);
  }
}
