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
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService, CreateUserDto, UpdateUserDto, UserRole } from './users.service';
import { CurrentUser, CurrentTenant } from '@/common/decorators';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions('users.create')
  @ApiOperation({ summary: 'Create a new user' })
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateUserDto,
  ) {
    return this.usersService.create(tenantId, dto, user.sub, user.email);
  }

  @Get()
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'List users' })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query('search') search?: string,
    @Query('role') role?: UserRole,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.findAll(tenantId, { search, role, page, limit });
  }

  @Get('activity-log')
  @RequirePermissions('users.audit')
  @ApiOperation({ summary: 'Get activity log' })
  async getActivityLog(
    @CurrentTenant() tenantId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.getActivityLog(tenantId, { page, limit });
  }

  @Get(':id')
  @RequirePermissions('users.read')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.findOne(tenantId, id);
  }

  @Patch(':id')
  @RequirePermissions('users.update')
  @ApiOperation({ summary: 'Update user' })
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(tenantId, id, dto, user.sub, user.email);
  }

  @Post(':id/lock')
  @RequirePermissions('users.lock')
  @ApiOperation({ summary: 'Lock user account' })
  async lock(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('minutes') minutes: number = 30,
  ) {
    return this.usersService.lock(tenantId, id, minutes, user.sub, user.email);
  }

  @Post(':id/unlock')
  @RequirePermissions('users.unlock')
  @ApiOperation({ summary: 'Unlock user account' })
  async unlock(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.unlock(tenantId, id, user.sub, user.email);
  }

  @Delete(':id')
  @RequirePermissions('users.delete')
  @ApiOperation({ summary: 'Delete user' })
  async remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.usersService.softDelete(tenantId, id, user.sub, user.email);
  }
}
