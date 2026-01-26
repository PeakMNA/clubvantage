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
  ApiParam,
} from '@nestjs/swagger';
import { MembersService } from './members.service';
import {
  CreateMemberDto,
  UpdateMemberDto,
  MemberQueryDto,
  ChangeStatusDto,
} from './dto';
import { CurrentUser, CurrentTenant } from '@/common/decorators';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';
import { Audit } from '@/common/decorators/audit.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

@ApiTags('Members')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'members', version: '1' })
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @RequirePermissions('members.create')
  @Audit({ action: 'CREATE', entityType: 'Member' })
  @ApiOperation({ summary: 'Create a new member' })
  @ApiResponse({ status: 201, description: 'Member created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async create(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateMemberDto,
  ) {
    return this.membersService.create(tenantId, dto, user.sub, user.email);
  }

  @Get()
  @RequirePermissions('members.read')
  @ApiOperation({ summary: 'List members with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Members list' })
  async findAll(
    @CurrentTenant() tenantId: string,
    @Query() query: MemberQueryDto,
  ) {
    return this.membersService.findAll(tenantId, query);
  }

  @Get('stats')
  @RequirePermissions('members.read')
  @ApiOperation({ summary: 'Get member statistics' })
  @ApiResponse({ status: 200, description: 'Member stats' })
  async getStats(@CurrentTenant() tenantId: string) {
    return this.membersService.getStats(tenantId);
  }

  @Get(':id')
  @RequirePermissions('members.read')
  @ApiOperation({ summary: 'Get member by ID' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Member details' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async findOne(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.membersService.findOne(tenantId, id);
  }

  @Patch(':id')
  @RequirePermissions('members.update')
  @Audit({
    action: 'UPDATE',
    entityType: 'Member',
    getEntityId: (req) => req.params.id,
  })
  @ApiOperation({ summary: 'Update member' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Member updated' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async update(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.membersService.update(tenantId, id, dto, user.sub, user.email);
  }

  @Post(':id/status')
  @RequirePermissions('members.status')
  @Audit({
    action: 'STATUS_CHANGE',
    entityType: 'Member',
    getEntityId: (req) => req.params.id,
  })
  @ApiOperation({ summary: 'Change member status' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Status changed' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async changeStatus(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ChangeStatusDto,
  ) {
    return this.membersService.changeStatus(
      tenantId,
      id,
      dto,
      user.sub,
      user.email,
    );
  }

  @Delete(':id')
  @RequirePermissions('members.delete')
  @Audit({
    action: 'DELETE',
    entityType: 'Member',
    getEntityId: (req) => req.params.id,
  })
  @ApiOperation({ summary: 'Soft delete member' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Member deleted' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async remove(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.membersService.softDelete(tenantId, id, user.sub, user.email);
  }

  @Get(':id/dependents')
  @RequirePermissions('members.read')
  @ApiOperation({ summary: 'Get member dependents' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Dependents list' })
  async getDependents(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.membersService.getDependents(tenantId, id);
  }

  @Get(':id/invoices')
  @RequirePermissions('members.read', 'billing.read')
  @ApiOperation({ summary: 'Get member invoices' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Invoices list' })
  async getInvoices(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit') limit?: number,
  ) {
    return this.membersService.getInvoices(tenantId, id, limit);
  }

  @Get(':id/activity')
  @RequirePermissions('members.read')
  @ApiOperation({ summary: 'Get member activity log' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Activity log' })
  async getActivity(
    @CurrentTenant() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.membersService.getActivity(tenantId, id);
  }
}
