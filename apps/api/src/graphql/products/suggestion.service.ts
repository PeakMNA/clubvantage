import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

interface SuggestionScore {
  productId: string;
  score: number;
}

@Injectable()
export class SuggestionService {
  constructor(private readonly prisma: PrismaService) {}

  async getSuggestions(
    outletId: string,
    staffId?: string,
    limit = 6,
  ) {
    const config = await this.prisma.smartSuggestionConfig.findUnique({
      where: { outletId },
    });

    if (!config?.enabled) return [];

    const currentHour = new Date().getHours();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get visible products for this outlet
    const productConfigs = await this.prisma.outletProductConfig.findMany({
      where: { outletId, isVisible: true },
      include: { product: true },
    });

    const productIds = productConfigs.map((pc) => pc.productId);

    // Get sales metrics for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [salesMetrics, staffUsage] = await Promise.all([
      this.prisma.productSalesMetric.findMany({
        where: {
          outletId,
          productId: { in: productIds },
          date: { gte: sevenDaysAgo },
        },
      }),
      staffId
        ? this.prisma.staffProductUsage.findMany({
            where: {
              outletId,
              staffId,
              productId: { in: productIds },
            },
          })
        : [],
    ]);

    // Calculate scores
    const scores = this.calculateScores(
      productIds,
      salesMetrics,
      staffUsage,
      currentHour,
      config,
    );

    // Get top products
    const topProductIds = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.productId);

    // Fetch full product data
    const products = await this.prisma.product.findMany({
      where: { id: { in: topProductIds } },
      include: {
        category: true,
        variants: { where: { isActive: true } },
      },
    });

    // Maintain score order
    return topProductIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean);
  }

  private calculateScores(
    productIds: string[],
    salesMetrics: any[],
    staffUsage: any[],
    currentHour: number,
    config: any,
  ): SuggestionScore[] {
    // Aggregate metrics by product
    const productMetrics = new Map<
      string,
      { totalSales: number; hourlySum: number; maxHourly: number }
    >();

    const staffUsageMap = new Map<string, number>();

    for (const id of productIds) {
      productMetrics.set(id, { totalSales: 0, hourlySum: 0, maxHourly: 0 });
    }

    for (const metric of salesMetrics) {
      const existing = productMetrics.get(metric.productId)!;
      existing.totalSales += metric.quantitySold;

      const hourlyData = metric.salesByHour as Record<string, number>;
      const currentHourSales = hourlyData[currentHour.toString()] || 0;
      existing.hourlySum += currentHourSales;

      const maxHourly = Math.max(...Object.values(hourlyData), 0);
      if (maxHourly > existing.maxHourly) existing.maxHourly = maxHourly;
    }

    for (const usage of staffUsage) {
      staffUsageMap.set(usage.productId, usage.usageCount);
    }

    // Find max values for normalization
    let maxTotalSales = 0;
    let maxHourlySum = 0;
    let maxStaffUsage = 0;

    for (const [, metrics] of productMetrics) {
      if (metrics.totalSales > maxTotalSales) maxTotalSales = metrics.totalSales;
      if (metrics.hourlySum > maxHourlySum) maxHourlySum = metrics.hourlySum;
    }

    for (const [, count] of staffUsageMap) {
      if (count > maxStaffUsage) maxStaffUsage = count;
    }

    // Calculate normalized scores
    return productIds.map((productId) => {
      const metrics = productMetrics.get(productId)!;
      const staffCount = staffUsageMap.get(productId) || 0;

      const timeScore = maxHourlySum > 0 ? metrics.hourlySum / maxHourlySum : 0;
      const velocityScore = maxTotalSales > 0 ? metrics.totalSales / maxTotalSales : 0;
      const staffScore = maxStaffUsage > 0 ? staffCount / maxStaffUsage : 0;

      const score =
        (timeScore * config.timeOfDayWeight +
          velocityScore * config.salesVelocityWeight +
          staffScore * config.staffHistoryWeight) /
        100;

      return { productId, score };
    });
  }

  // ============================================================================
  // METRICS COLLECTION
  // ============================================================================

  async recordSale(
    outletId: string,
    productId: string,
    quantity: number,
    revenue: number,
    staffId?: string,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentHour = new Date().getHours().toString();

    // Update or create sales metric
    await this.prisma.productSalesMetric.upsert({
      where: {
        productId_outletId_date: { productId, outletId, date: today },
      },
      create: {
        productId,
        outletId,
        date: today,
        quantitySold: quantity,
        revenue,
        transactionCount: 1,
        salesByHour: { [currentHour]: quantity },
      },
      update: {
        quantitySold: { increment: quantity },
        revenue: { increment: revenue },
        transactionCount: { increment: 1 },
        // Note: salesByHour JSON update requires raw query
      },
    });

    // Update staff usage if staffId provided
    if (staffId) {
      await this.prisma.staffProductUsage.upsert({
        where: {
          staffId_productId_outletId: { staffId, productId, outletId },
        },
        create: {
          staffId,
          productId,
          outletId,
          usageCount: 1,
        },
        update: {
          usageCount: { increment: 1 },
          lastUsedAt: new Date(),
        },
      });
    }
  }
}
