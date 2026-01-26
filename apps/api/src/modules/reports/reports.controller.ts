import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CurrentTenant } from '@/common/decorators';
import { RequirePermissions } from '@/common/decorators/permissions.decorator';

@ApiTags('Reports')
@ApiBearerAuth('JWT-auth')
@Controller({ path: 'reports', version: '1' })
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @RequirePermissions('reports.dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats(@CurrentTenant() tenantId: string) {
    return this.reportsService.getDashboardStats(tenantId);
  }

  @Get('financial')
  @RequirePermissions('reports.financial')
  @ApiOperation({ summary: 'Get financial report' })
  async getFinancialReport(
    @CurrentTenant() tenantId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getFinancialReport(tenantId, startDate, endDate);
  }

  @Get('membership')
  @RequirePermissions('reports.membership')
  @ApiOperation({ summary: 'Get membership report' })
  async getMembershipReport(@CurrentTenant() tenantId: string) {
    return this.reportsService.getMembershipReport(tenantId);
  }

  @Get('ar-aging')
  @RequirePermissions('reports.financial')
  @ApiOperation({ summary: 'Get AR aging report' })
  async getARAgingReport(@CurrentTenant() tenantId: string) {
    return this.reportsService.getARAgingReport(tenantId);
  }

  @Get('golf-utilization')
  @RequirePermissions('reports.golf')
  @ApiOperation({ summary: 'Get golf utilization report' })
  async getGolfUtilizationReport(
    @CurrentTenant() tenantId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.reportsService.getGolfUtilizationReport(tenantId, startDate, endDate);
  }
}
