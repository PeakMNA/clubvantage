import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import {
  UpdateOutletProductConfigInput,
  BulkOutletProductConfigInput,
  UpdateOutletGridConfigInput,
  UpdateSmartSuggestionConfigInput,
} from './outlet-config.input';

@Injectable()
export class OutletConfigService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // OUTLET PRODUCT CONFIG
  // ============================================================================

  async getOutletProductConfigs(outletId: string) {
    return this.prisma.outletProductConfig.findMany({
      where: { outletId },
      include: {
        product: {
          include: {
            category: true,
            variants: { where: { isActive: true } },
          },
        },
      },
      orderBy: [{ sortPriority: 'asc' }, { product: { name: 'asc' } }],
    });
  }

  async getOutletProductConfig(outletId: string, productId: string) {
    return this.prisma.outletProductConfig.findUnique({
      where: { outletId_productId: { outletId, productId } },
    });
  }

  async updateOutletProductConfig(
    outletId: string,
    productId: string,
    input: UpdateOutletProductConfigInput,
  ) {
    return this.prisma.outletProductConfig.upsert({
      where: { outletId_productId: { outletId, productId } },
      create: {
        outletId,
        productId,
        ...input,
        visibilityRules: input.visibilityRules || {},
      },
      update: {
        ...input,
        ...(input.visibilityRules && { visibilityRules: input.visibilityRules }),
      },
    });
  }

  async bulkUpdateOutletProductConfigs(
    outletId: string,
    input: BulkOutletProductConfigInput,
  ) {
    const { productIds, ...updates } = input;

    // Ensure all configs exist
    await Promise.all(
      productIds.map((productId) =>
        this.prisma.outletProductConfig.upsert({
          where: { outletId_productId: { outletId, productId } },
          create: { outletId, productId, ...updates },
          update: updates,
        }),
      ),
    );

    return this.prisma.outletProductConfig.findMany({
      where: { outletId, productId: { in: productIds } },
    });
  }

  async getQuickKeys(outletId: string) {
    const configs = await this.prisma.outletProductConfig.findMany({
      where: { outletId, isQuickKey: true, isVisible: true },
      include: {
        product: {
          include: { category: true, variants: true },
        },
      },
      orderBy: { quickKeyPosition: 'asc' },
    });

    return configs.map((c) => c.product);
  }

  // ============================================================================
  // OUTLET GRID CONFIG
  // ============================================================================

  async getOutletGridConfig(outletId: string) {
    return this.prisma.outletGridConfig.findUnique({
      where: { outletId },
    });
  }

  async updateOutletGridConfig(outletId: string, input: UpdateOutletGridConfigInput) {
    return this.prisma.outletGridConfig.upsert({
      where: { outletId },
      create: { outletId, ...input },
      update: input,
    });
  }

  // ============================================================================
  // SMART SUGGESTIONS
  // ============================================================================

  async getSmartSuggestionConfig(outletId: string) {
    return this.prisma.smartSuggestionConfig.findUnique({
      where: { outletId },
    });
  }

  async updateSmartSuggestionConfig(
    outletId: string,
    input: UpdateSmartSuggestionConfigInput,
  ) {
    return this.prisma.smartSuggestionConfig.upsert({
      where: { outletId },
      create: { outletId, ...input },
      update: input,
    });
  }

  // ============================================================================
  // VISIBILITY EVALUATION
  // ============================================================================

  evaluateVisibility(
    config: { visibilityRules: any; isVisible: boolean },
    context: { currentTime: Date; userRole: string; staffId?: string },
  ): boolean {
    if (!config.isVisible) return false;

    const rules = config.visibilityRules as any;
    if (!rules || Object.keys(rules).length === 0) return true;

    // Time-based rules
    if (rules.timeRules?.length) {
      const currentHour = context.currentTime.getHours();
      const currentMinutes = context.currentTime.getMinutes();
      const currentTimeMinutes = currentHour * 60 + currentMinutes;
      const currentDay = context.currentTime.getDay() || 7; // Convert 0 (Sunday) to 7

      const timeMatch = rules.timeRules.some((rule: any) => {
        const [startH, startM] = rule.startTime.split(':').map(Number);
        const [endH, endM] = rule.endTime.split(':').map(Number);
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;

        const dayMatch = rule.daysOfWeek.includes(currentDay);
        const timeMatch =
          currentTimeMinutes >= startMinutes && currentTimeMinutes < endMinutes;

        return dayMatch && timeMatch;
      });

      if (!timeMatch) return false;
    }

    // Role-based rules
    if (rules.roleRules) {
      const { allowedRoles, deniedRoles } = rules.roleRules;

      if (deniedRoles?.includes(context.userRole)) return false;
      if (allowedRoles?.length && !allowedRoles.includes(context.userRole)) return false;
    }

    return true;
  }
}
