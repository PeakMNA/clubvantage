import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

// Dashboard Stats Types
@ObjectType()
export class DashboardMemberStatsType {
  @Field(() => Int)
  total: number;

  @Field(() => Int)
  active: number;

  @Field(() => Int)
  newThisMonth: number;

  @Field(() => Float)
  growth: number;
}

@ObjectType()
export class DashboardFinancialStatsType {
  @Field(() => Float)
  totalOutstanding: number;

  @Field(() => Float)
  thisMonthRevenue: number;

  @Field(() => Float)
  lastMonthRevenue: number;

  @Field(() => Float)
  revenueGrowth: number;
}

@ObjectType()
export class DashboardBookingStatsType {
  @Field(() => Int)
  upcoming: number;
}

@ObjectType()
export class DashboardStatsType {
  @Field(() => DashboardMemberStatsType)
  members: DashboardMemberStatsType;

  @Field(() => DashboardFinancialStatsType)
  financial: DashboardFinancialStatsType;

  @Field(() => DashboardBookingStatsType)
  bookings: DashboardBookingStatsType;
}

// Financial Report Types
@ObjectType()
export class ReportPeriodType {
  @Field()
  startDate: string;

  @Field()
  endDate: string;
}

@ObjectType()
export class ReportInvoiceSummaryType {
  @Field(() => Int)
  count: number;

  @Field(() => Float)
  totalInvoiced: number;

  @Field(() => Float)
  totalCollected: number;

  @Field(() => Float)
  totalOutstanding: number;
}

@ObjectType()
export class ReportPaymentSummaryType {
  @Field(() => Int)
  count: number;

  @Field(() => Float)
  totalAmount: number;
}

@ObjectType()
export class FinancialReportType {
  @Field(() => ReportPeriodType)
  period: ReportPeriodType;

  @Field(() => ReportInvoiceSummaryType)
  invoices: ReportInvoiceSummaryType;

  @Field(() => ReportPaymentSummaryType)
  payments: ReportPaymentSummaryType;

  @Field(() => GraphQLJSON)
  byChargeType: any;
}

// Membership Report Types
@ObjectType()
export class MembershipReportType {
  @Field(() => GraphQLJSON)
  byStatus: any;

  @Field(() => GraphQLJSON)
  byType: any;

  @Field(() => Int)
  expiringThisMonth: number;
}

// AR Aging Report Types
@ObjectType()
export class ReportAgingBucketType {
  @Field(() => Float)
  amount: number;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class ReportARAgingType {
  @Field(() => ReportAgingBucketType)
  current: ReportAgingBucketType;

  @Field(() => ReportAgingBucketType, { name: 'days1to30' })
  '1-30': ReportAgingBucketType;

  @Field(() => ReportAgingBucketType, { name: 'days31to60' })
  '31-60': ReportAgingBucketType;

  @Field(() => ReportAgingBucketType, { name: 'days90Plus' })
  '90+': ReportAgingBucketType;
}

// Golf Utilization Report Types
@ObjectType()
export class GolfUtilizationReportType {
  @Field(() => ReportPeriodType)
  period: ReportPeriodType;

  @Field(() => Int)
  totalBookings: number;

  @Field(() => GraphQLJSON)
  byStatus: any;

  @Field(() => GraphQLJSON)
  byCourse: any;
}
