import {
  Controller,
  Get,
  Post,
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
import { BookingsService, CreateBookingDto } from './bookings.service';
import { CurrentUser, CurrentTenant } from '@/common/decorators';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

@ApiTags('Bookings')
@ApiBearerAuth('JWT-auth')
@Controller({ version: '1' })
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get('facilities')
  @RequirePermissions('bookings.read')
  @ApiOperation({ summary: 'Get all facilities' })
  async getFacilities(@CurrentTenant() tenantId: string) {
    return this.bookingsService.getFacilities(tenantId);
  }

  @Get('facilities/:id/availability')
  @RequirePermissions('bookings.read')
  @ApiOperation({ summary: 'Get facility availability' })
  async getAvailability(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) facilityId: string,
    @Query('date') date: string,
    @Query('resourceId') resourceId?: string,
  ) {
    return this.bookingsService.getAvailability(tenantId, facilityId, date, resourceId);
  }

  @Post('bookings')
  @RequirePermissions('bookings.create')
  @ApiOperation({ summary: 'Create a booking' })
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.create(tenantId, dto, user.sub, user.email);
  }

  @Get('bookings/:id')
  @RequirePermissions('bookings.read')
  @ApiOperation({ summary: 'Get booking details' })
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.bookingsService.findOne(tenantId, id);
  }

  @Delete('bookings/:id')
  @RequirePermissions('bookings.cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  async cancel(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
  ) {
    return this.bookingsService.cancel(tenantId, id, reason, user.sub, user.email);
  }
}
