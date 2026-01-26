import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(tenantId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      newMembersLastMonth,
      totalOutstanding,
      thisMonthRevenue,
      lastMonthRevenue,
      upcomingBookings,
    ] = await Promise.all([
      this.prisma.member.count({
        where: { clubId: tenantId, deletedAt: null },
      }),
      this.prisma.member.count({
        where: { clubId: tenantId, status: 'ACTIVE', deletedAt: null },
      }),
      this.prisma.member.count({
        where: {
          clubId: tenantId,
          createdAt: { gte: startOfMonth },
          deletedAt: null,
        },
      }),
      this.prisma.member.count({
        where: {
          clubId: tenantId,
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
          deletedAt: null,
        },
      }),
      this.prisma.invoice.aggregate({
        where: {
          clubId: tenantId,
          status: {
            in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'],
          },
          deletedAt: null,
        },
        _sum: { balanceDue: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          clubId: tenantId,
          paymentDate: { gte: startOfMonth },
        },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: {
          clubId: tenantId,
          paymentDate: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { amount: true },
      }),
      this.prisma.booking.count({
        where: {
          clubId: tenantId,
          startTime: { gte: now },
          status: { notIn: ['CANCELLED', 'COMPLETED'] },
        },
      }),
    ]);

    const revenueGrowth = lastMonthRevenue._sum.amount
      ? ((thisMonthRevenue._sum.amount?.toNumber() || 0) -
          (lastMonthRevenue._sum.amount?.toNumber() || 0)) /
        (lastMonthRevenue._sum.amount?.toNumber() || 1) *
        100
      : 0;

    const memberGrowth = newMembersLastMonth
      ? ((newMembersThisMonth - newMembersLastMonth) / newMembersLastMonth) * 100
      : 0;

    return {
      members: {
        total: totalMembers,
        active: activeMembers,
        newThisMonth: newMembersThisMonth,
        growth: memberGrowth,
      },
      financial: {
        totalOutstanding: totalOutstanding._sum.balanceDue?.toNumber() || 0,
        thisMonthRevenue: thisMonthRevenue._sum.amount?.toNumber() || 0,
        lastMonthRevenue: lastMonthRevenue._sum.amount?.toNumber() || 0,
        revenueGrowth,
      },
      bookings: {
        upcoming: upcomingBookings,
      },
    };
  }

  async getFinancialReport(
    tenantId: string,
    startDate: string,
    endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const [invoices, payments, byChargeType] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: {
          clubId: tenantId,
          invoiceDate: { gte: start, lte: end },
          deletedAt: null,
        },
        _sum: { totalAmount: true, paidAmount: true, balanceDue: true },
        _count: true,
      }),
      this.prisma.payment.aggregate({
        where: {
          clubId: tenantId,
          paymentDate: { gte: start, lte: end },
        },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.invoiceLineItem.groupBy({
        by: ['chargeTypeId'],
        where: {
          invoice: {
            clubId: tenantId,
            invoiceDate: { gte: start, lte: end },
            deletedAt: null,
          },
        },
        _sum: { lineTotal: true },
      }),
    ]);

    return {
      period: { startDate, endDate },
      invoices: {
        count: invoices._count,
        totalInvoiced: invoices._sum.totalAmount?.toNumber() || 0,
        totalCollected: invoices._sum.paidAmount?.toNumber() || 0,
        totalOutstanding: invoices._sum.balanceDue?.toNumber() || 0,
      },
      payments: {
        count: payments._count,
        totalAmount: payments._sum.amount?.toNumber() || 0,
      },
      byChargeType,
    };
  }

  async getMembershipReport(tenantId: string) {
    const [byStatus, byType, expiringThisMonth] = await Promise.all([
      this.prisma.member.groupBy({
        by: ['status'],
        where: { clubId: tenantId, deletedAt: null },
        _count: true,
      }),
      this.prisma.member.groupBy({
        by: ['membershipTypeId'],
        where: { clubId: tenantId, deletedAt: null },
        _count: true,
      }),
      this.prisma.member.count({
        where: {
          clubId: tenantId,
          expiryDate: {
            gte: new Date(),
            lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
          },
          deletedAt: null,
        },
      }),
    ]);

    return {
      byStatus,
      byType,
      expiringThisMonth,
    };
  }

  async getARAgingReport(tenantId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const [current, thirtyDays, sixtyDays, ninetyPlus] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: {
          clubId: tenantId,
          dueDate: { gte: now },
          balanceDue: { gt: 0 },
          deletedAt: null,
        },
        _sum: { balanceDue: true },
        _count: true,
      }),
      this.prisma.invoice.aggregate({
        where: {
          clubId: tenantId,
          dueDate: { gte: thirtyDaysAgo, lt: now },
          balanceDue: { gt: 0 },
          deletedAt: null,
        },
        _sum: { balanceDue: true },
        _count: true,
      }),
      this.prisma.invoice.aggregate({
        where: {
          clubId: tenantId,
          dueDate: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
          balanceDue: { gt: 0 },
          deletedAt: null,
        },
        _sum: { balanceDue: true },
        _count: true,
      }),
      this.prisma.invoice.aggregate({
        where: {
          clubId: tenantId,
          dueDate: { lt: ninetyDaysAgo },
          balanceDue: { gt: 0 },
          deletedAt: null,
        },
        _sum: { balanceDue: true },
        _count: true,
      }),
    ]);

    return {
      current: {
        amount: current._sum.balanceDue?.toNumber() || 0,
        count: current._count,
      },
      '1-30': {
        amount: thirtyDays._sum.balanceDue?.toNumber() || 0,
        count: thirtyDays._count,
      },
      '31-60': {
        amount: sixtyDays._sum.balanceDue?.toNumber() || 0,
        count: sixtyDays._count,
      },
      '90+': {
        amount: ninetyPlus._sum.balanceDue?.toNumber() || 0,
        count: ninetyPlus._count,
      },
    };
  }

  async getGolfUtilizationReport(tenantId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const [totalBookings, byStatus, byCourse] = await Promise.all([
      this.prisma.teeTime.count({
        where: {
          clubId: tenantId,
          teeDate: { gte: start, lte: end },
        },
      }),
      this.prisma.teeTime.groupBy({
        by: ['status'],
        where: {
          clubId: tenantId,
          teeDate: { gte: start, lte: end },
        },
        _count: true,
      }),
      this.prisma.teeTime.groupBy({
        by: ['courseId'],
        where: {
          clubId: tenantId,
          teeDate: { gte: start, lte: end },
        },
        _count: true,
      }),
    ]);

    return {
      period: { startDate, endDate },
      totalBookings,
      byStatus,
      byCourse,
    };
  }
}
