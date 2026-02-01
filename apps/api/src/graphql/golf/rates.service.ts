import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import {
  CreateRateConfigInput,
  UpdateRateConfigInput,
  CreateGreenFeeRateInput,
  UpdateGreenFeeRateInput,
  CreateCartRateInput,
  UpdateCartRateInput,
  CreateCaddyRateInput,
  UpdateCaddyRateInput,
} from './rates.input';

@Injectable()
export class RatesService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // RATE CONFIGURATION CRUD
  // ============================================================================

  async getRateConfigs(tenantId: string, courseId: string, activeOnly?: boolean) {
    const where: any = {
      clubId: tenantId,
      courseId,
    };

    if (activeOnly) {
      where.isActive = true;
    }

    return this.prisma.golfRateConfig.findMany({
      where,
      include: {
        greenFeeRates: true,
        cartRates: true,
        caddyRates: true,
      },
      orderBy: [{ isActive: 'desc' }, { effectiveFrom: 'desc' }],
    });
  }

  async getRateConfig(tenantId: string, id: string) {
    const rateConfig = await this.prisma.golfRateConfig.findFirst({
      where: { id, clubId: tenantId },
      include: {
        greenFeeRates: true,
        cartRates: true,
        caddyRates: true,
      },
    });

    if (!rateConfig) {
      throw new NotFoundException('Rate configuration not found');
    }

    return rateConfig;
  }

  async createRateConfig(tenantId: string, input: CreateRateConfigInput) {
    // Verify course belongs to tenant
    const course = await this.prisma.golfCourse.findFirst({
      where: { id: input.courseId, clubId: tenantId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check for overlapping date ranges for active configs
    const overlapping = await this.prisma.golfRateConfig.findFirst({
      where: {
        clubId: tenantId,
        courseId: input.courseId,
        isActive: true,
        OR: [
          {
            // New config starts during existing config
            effectiveFrom: { lte: input.effectiveFrom },
            OR: [
              { effectiveTo: null },
              { effectiveTo: { gte: input.effectiveFrom } },
            ],
          },
          {
            // New config ends during existing config (if effectiveTo is provided)
            ...(input.effectiveTo && {
              effectiveFrom: { lte: input.effectiveTo },
              OR: [
                { effectiveTo: null },
                { effectiveTo: { gte: input.effectiveTo } },
              ],
            }),
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException(
        `Rate configuration "${overlapping.name}" already exists for this date range`,
      );
    }

    return this.prisma.golfRateConfig.create({
      data: {
        clubId: tenantId,
        courseId: input.courseId,
        name: input.name,
        description: input.description,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo,
        isActive: true,
      },
      include: {
        greenFeeRates: true,
        cartRates: true,
        caddyRates: true,
      },
    });
  }

  async updateRateConfig(tenantId: string, id: string, input: UpdateRateConfigInput) {
    // Verify rate config belongs to tenant
    const existing = await this.prisma.golfRateConfig.findFirst({
      where: { id, clubId: tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Rate configuration not found');
    }

    // If updating date range, check for overlaps
    if (input.effectiveFrom || input.effectiveTo) {
      const effectiveFrom = input.effectiveFrom || existing.effectiveFrom;
      const effectiveTo = input.effectiveTo !== undefined ? input.effectiveTo : existing.effectiveTo;

      const overlapping = await this.prisma.golfRateConfig.findFirst({
        where: {
          id: { not: id },
          clubId: tenantId,
          courseId: existing.courseId,
          isActive: true,
          OR: [
            {
              effectiveFrom: { lte: effectiveFrom },
              OR: [
                { effectiveTo: null },
                { effectiveTo: { gte: effectiveFrom } },
              ],
            },
            {
              ...(effectiveTo && {
                effectiveFrom: { lte: effectiveTo },
                OR: [
                  { effectiveTo: null },
                  { effectiveTo: { gte: effectiveTo } },
                ],
              }),
            },
          ],
        },
      });

      if (overlapping) {
        throw new BadRequestException(
          `Date range overlaps with existing rate configuration "${overlapping.name}"`,
        );
      }
    }

    return this.prisma.golfRateConfig.update({
      where: { id },
      data: {
        name: input.name,
        description: input.description,
        isActive: input.isActive,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo,
      },
      include: {
        greenFeeRates: true,
        cartRates: true,
        caddyRates: true,
      },
    });
  }

  async deleteRateConfig(tenantId: string, id: string) {
    // Verify rate config belongs to tenant
    const existing = await this.prisma.golfRateConfig.findFirst({
      where: { id, clubId: tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Rate configuration not found');
    }

    await this.prisma.golfRateConfig.delete({ where: { id } });
  }

  // ============================================================================
  // GREEN FEE RATE CRUD
  // ============================================================================

  async createGreenFeeRate(tenantId: string, input: CreateGreenFeeRateInput) {
    // Verify rate config belongs to tenant
    const rateConfig = await this.prisma.golfRateConfig.findFirst({
      where: { id: input.rateConfigId, clubId: tenantId },
    });

    if (!rateConfig) {
      throw new NotFoundException('Rate configuration not found');
    }

    // Check for duplicate
    const existing = await this.prisma.greenFee.findFirst({
      where: {
        rateConfigId: input.rateConfigId,
        playerType: input.playerType,
        holes: input.holes,
        timeCategory: input.timeCategory,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `Green fee rate already exists for ${input.playerType}, ${input.holes} holes, ${input.timeCategory}`,
      );
    }

    return this.prisma.greenFee.create({
      data: {
        rateConfigId: input.rateConfigId,
        playerType: input.playerType,
        holes: input.holes,
        timeCategory: input.timeCategory,
        amount: input.amount,
        taxType: input.taxType,
        taxRate: input.taxRate,
      },
    });
  }

  async updateGreenFeeRate(tenantId: string, id: string, input: UpdateGreenFeeRateInput) {
    // Verify green fee rate belongs to tenant's rate config
    const existing = await this.prisma.greenFee.findFirst({
      where: {
        id,
        rateConfig: { clubId: tenantId },
      },
    });

    if (!existing) {
      throw new NotFoundException('Green fee rate not found');
    }

    // If updating key fields, check for duplicate
    if (input.playerType || input.holes || input.timeCategory) {
      const playerType = input.playerType || existing.playerType;
      const holes = input.holes || existing.holes;
      const timeCategory = input.timeCategory || existing.timeCategory;

      const duplicate = await this.prisma.greenFee.findFirst({
        where: {
          id: { not: id },
          rateConfigId: existing.rateConfigId,
          playerType,
          holes,
          timeCategory,
        },
      });

      if (duplicate) {
        throw new BadRequestException(
          `Green fee rate already exists for ${playerType}, ${holes} holes, ${timeCategory}`,
        );
      }
    }

    return this.prisma.greenFee.update({
      where: { id },
      data: {
        playerType: input.playerType,
        holes: input.holes,
        timeCategory: input.timeCategory,
        amount: input.amount,
        taxType: input.taxType,
        taxRate: input.taxRate,
      },
    });
  }

  async deleteGreenFeeRate(tenantId: string, id: string) {
    // Verify green fee rate belongs to tenant's rate config
    const existing = await this.prisma.greenFee.findFirst({
      where: {
        id,
        rateConfig: { clubId: tenantId },
      },
    });

    if (!existing) {
      throw new NotFoundException('Green fee rate not found');
    }

    await this.prisma.greenFee.delete({ where: { id } });
  }

  // ============================================================================
  // CART RATE CRUD
  // ============================================================================

  async createCartRate(tenantId: string, input: CreateCartRateInput) {
    // Verify rate config belongs to tenant
    const rateConfig = await this.prisma.golfRateConfig.findFirst({
      where: { id: input.rateConfigId, clubId: tenantId },
    });

    if (!rateConfig) {
      throw new NotFoundException('Rate configuration not found');
    }

    // Check for duplicate
    const existing = await this.prisma.cartRate.findFirst({
      where: {
        rateConfigId: input.rateConfigId,
        cartType: input.cartType,
      },
    });

    if (existing) {
      throw new BadRequestException(`Cart rate already exists for ${input.cartType}`);
    }

    return this.prisma.cartRate.create({
      data: {
        rateConfigId: input.rateConfigId,
        cartType: input.cartType,
        amount: input.amount,
        taxType: input.taxType,
        taxRate: input.taxRate,
      },
    });
  }

  async updateCartRate(tenantId: string, id: string, input: UpdateCartRateInput) {
    // Verify cart rate belongs to tenant's rate config
    const existing = await this.prisma.cartRate.findFirst({
      where: {
        id,
        rateConfig: { clubId: tenantId },
      },
    });

    if (!existing) {
      throw new NotFoundException('Cart rate not found');
    }

    // If updating cartType, check for duplicate
    if (input.cartType) {
      const duplicate = await this.prisma.cartRate.findFirst({
        where: {
          id: { not: id },
          rateConfigId: existing.rateConfigId,
          cartType: input.cartType,
        },
      });

      if (duplicate) {
        throw new BadRequestException(`Cart rate already exists for ${input.cartType}`);
      }
    }

    return this.prisma.cartRate.update({
      where: { id },
      data: {
        cartType: input.cartType,
        amount: input.amount,
        taxType: input.taxType,
        taxRate: input.taxRate,
      },
    });
  }

  async deleteCartRate(tenantId: string, id: string) {
    // Verify cart rate belongs to tenant's rate config
    const existing = await this.prisma.cartRate.findFirst({
      where: {
        id,
        rateConfig: { clubId: tenantId },
      },
    });

    if (!existing) {
      throw new NotFoundException('Cart rate not found');
    }

    await this.prisma.cartRate.delete({ where: { id } });
  }

  // ============================================================================
  // CADDY RATE CRUD
  // ============================================================================

  async createCaddyRate(tenantId: string, input: CreateCaddyRateInput) {
    // Verify rate config belongs to tenant
    const rateConfig = await this.prisma.golfRateConfig.findFirst({
      where: { id: input.rateConfigId, clubId: tenantId },
    });

    if (!rateConfig) {
      throw new NotFoundException('Rate configuration not found');
    }

    // Check for duplicate
    const existing = await this.prisma.caddyRate.findFirst({
      where: {
        rateConfigId: input.rateConfigId,
        caddyType: input.caddyType,
      },
    });

    if (existing) {
      throw new BadRequestException(`Caddy rate already exists for ${input.caddyType}`);
    }

    return this.prisma.caddyRate.create({
      data: {
        rateConfigId: input.rateConfigId,
        caddyType: input.caddyType,
        amount: input.amount,
        taxType: input.taxType,
        taxRate: input.taxRate,
      },
    });
  }

  async updateCaddyRate(tenantId: string, id: string, input: UpdateCaddyRateInput) {
    // Verify caddy rate belongs to tenant's rate config
    const existing = await this.prisma.caddyRate.findFirst({
      where: {
        id,
        rateConfig: { clubId: tenantId },
      },
    });

    if (!existing) {
      throw new NotFoundException('Caddy rate not found');
    }

    // If updating caddyType, check for duplicate
    if (input.caddyType) {
      const duplicate = await this.prisma.caddyRate.findFirst({
        where: {
          id: { not: id },
          rateConfigId: existing.rateConfigId,
          caddyType: input.caddyType,
        },
      });

      if (duplicate) {
        throw new BadRequestException(`Caddy rate already exists for ${input.caddyType}`);
      }
    }

    return this.prisma.caddyRate.update({
      where: { id },
      data: {
        caddyType: input.caddyType,
        amount: input.amount,
        taxType: input.taxType,
        taxRate: input.taxRate,
      },
    });
  }

  async deleteCaddyRate(tenantId: string, id: string) {
    // Verify caddy rate belongs to tenant's rate config
    const existing = await this.prisma.caddyRate.findFirst({
      where: {
        id,
        rateConfig: { clubId: tenantId },
      },
    });

    if (!existing) {
      throw new NotFoundException('Caddy rate not found');
    }

    await this.prisma.caddyRate.delete({ where: { id } });
  }
}
