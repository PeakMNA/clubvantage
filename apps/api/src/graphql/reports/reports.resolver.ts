import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { ReportsService } from '@/modules/reports/reports.service';
import {
  DashboardStatsType,
  FinancialReportType,
  MembershipReportType,
  ReportARAgingType,
  GolfUtilizationReportType,
  CollectionMetricsType,
  ARAgingMemberType,
} from './reports.types';

@Resolver()
@UseGuards(GqlAuthGuard)
export class ReportsResolver {
  constructor(private readonly reportsService: ReportsService) {}

  @Query(() => DashboardStatsType, { name: 'reportsDashboard', description: 'Get dashboard statistics' })
  async getReportsDashboard(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<DashboardStatsType> {
    return this.reportsService.getDashboardStats(user.tenantId);
  }

  @Query(() => FinancialReportType, { name: 'reportsFinancial', description: 'Get financial report for a date range' })
  async getFinancialReport(
    @GqlCurrentUser() user: JwtPayload,
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
  ): Promise<FinancialReportType> {
    return this.reportsService.getFinancialReport(user.tenantId, startDate, endDate);
  }

  @Query(() => MembershipReportType, { name: 'reportsMembership', description: 'Get membership statistics' })
  async getMembershipReport(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<MembershipReportType> {
    return this.reportsService.getMembershipReport(user.tenantId);
  }

  @Query(() => ReportARAgingType, { name: 'reportsARAging', description: 'Get accounts receivable aging report' })
  async getARAgingReport(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<ReportARAgingType> {
    return this.reportsService.getARAgingReport(user.tenantId);
  }

  @Query(() => CollectionMetricsType, { name: 'reportsCollections', description: 'Get collection performance metrics' })
  async getCollectionMetrics(
    @GqlCurrentUser() user: JwtPayload,
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
  ): Promise<CollectionMetricsType> {
    return this.reportsService.getCollectionMetrics(user.tenantId, startDate, endDate);
  }

  @Query(() => [ARAgingMemberType], { name: 'reportsARAgingMembers', description: 'Get AR aging member list' })
  async getARAgingMembers(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<ARAgingMemberType[]> {
    return this.reportsService.getARAgingMembers(user.tenantId);
  }

  @Query(() => GolfUtilizationReportType, { name: 'reportsGolfUtilization', description: 'Get golf utilization report for a date range' })
  async getGolfUtilizationReport(
    @GqlCurrentUser() user: JwtPayload,
    @Args('startDate') startDate: string,
    @Args('endDate') endDate: string,
  ): Promise<GolfUtilizationReportType> {
    return this.reportsService.getGolfUtilizationReport(user.tenantId, startDate, endDate);
  }
}
