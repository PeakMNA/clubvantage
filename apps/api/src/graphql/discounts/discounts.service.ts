import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { DiscountType, DiscountScope, Prisma } from '@prisma/client';
import {
  CreateDiscountInput,
  UpdateDiscountInput,
  ApplyDiscountInput,
  ApplyDiscountByCodeInput,
  ValidateDiscountInput,
  DiscountsQueryArgs,
} from './discounts.input';

export interface DiscountCalculation {
  originalAmount: number;
  discountAmount: number;
  newAmount: number;
  requiresApproval: boolean;
  approvalReason?: string;
}

export interface ApplyDiscountResult {
  success: boolean;
  message?: string;
  appliedDiscountId?: string;
  requiresApproval?: boolean;
  originalAmount?: number;
  discountedAmount?: number;
  savings?: number;
}

export interface DiscountValidationResult {
  isValid: boolean;
  message?: string;
  calculatedAmount?: number;
  requiresApproval?: boolean;
}

@Injectable()
export class DiscountService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // DISCOUNT CALCULATION
  // ============================================================================

  /**
   * Calculate discount amount based on type and value
   */
  calculateDiscount(
    originalAmount: number,
    type: DiscountType,
    value: number,
    maxDiscount?: number,
  ): DiscountCalculation {
    let discountAmount: number;

    if (type === DiscountType.PERCENTAGE) {
      discountAmount = (originalAmount * value) / 100;
    } else {
      discountAmount = value;
    }

    // Apply max discount cap if set
    if (maxDiscount && discountAmount > maxDiscount) {
      discountAmount = maxDiscount;
    }

    // Ensure discount doesn't exceed original amount
    if (discountAmount > originalAmount) {
      discountAmount = originalAmount;
    }

    const newAmount = originalAmount - discountAmount;

    // Check if approval is required (over 20% or over 500)
    const discountPercentage = (discountAmount / originalAmount) * 100;
    const requiresApproval = discountPercentage > 20 || discountAmount > 500;
    const approvalReason = requiresApproval
      ? `Discount exceeds ${discountPercentage > 20 ? '20%' : '500 THB'} threshold`
      : undefined;

    return {
      originalAmount,
      discountAmount: Math.round(discountAmount * 100) / 100,
      newAmount: Math.round(newAmount * 100) / 100,
      requiresApproval,
      approvalReason,
    };
  }

  // ============================================================================
  // DISCOUNT VALIDATION
  // ============================================================================

  /**
   * Validate a discount can be applied
   */
  async validateDiscount(
    tenantId: string,
    input: ValidateDiscountInput,
  ): Promise<DiscountValidationResult> {
    let discount;

    if (input.discountId) {
      discount = await this.prisma.discount.findFirst({
        where: { id: input.discountId, clubId: tenantId },
      });
    } else if (input.code) {
      discount = await this.prisma.discount.findFirst({
        where: { clubId: tenantId, code: input.code, isActive: true },
      });
    }

    if (!discount) {
      return { isValid: false, message: 'Discount not found' };
    }

    // Check if active
    if (!discount.isActive) {
      return { isValid: false, message: 'Discount is not active' };
    }

    // Check validity dates
    const now = new Date();
    if (discount.validFrom && discount.validFrom > now) {
      return { isValid: false, message: 'Discount is not yet valid' };
    }
    if (discount.validTo && discount.validTo < now) {
      return { isValid: false, message: 'Discount has expired' };
    }

    // Check usage limit
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      return { isValid: false, message: 'Discount usage limit reached' };
    }

    // Check minimum amount
    if (discount.minimumAmount && input.amount < Number(discount.minimumAmount)) {
      return {
        isValid: false,
        message: `Minimum order amount is ${discount.minimumAmount}`,
      };
    }

    // Check player type restrictions
    if (discount.playerTypes.length > 0 && input.playerType) {
      if (!discount.playerTypes.includes(input.playerType as any)) {
        return { isValid: false, message: 'Discount not valid for this player type' };
      }
    }

    // Check membership type restrictions
    if (discount.membershipTypeIds.length > 0 && input.membershipTypeId) {
      if (!discount.membershipTypeIds.includes(input.membershipTypeId)) {
        return { isValid: false, message: 'Discount not valid for this membership type' };
      }
    }

    // Calculate discount amount
    const calculation = this.calculateDiscount(
      input.amount,
      discount.type,
      Number(discount.value),
      discount.maximumDiscount ? Number(discount.maximumDiscount) : undefined,
    );

    // Check if approval is required based on threshold
    let requiresApproval = calculation.requiresApproval;
    if (discount.requiresApproval) {
      if (
        discount.approvalThreshold &&
        calculation.discountAmount >= Number(discount.approvalThreshold)
      ) {
        requiresApproval = true;
      } else {
        requiresApproval = true; // Always requires approval if flag is set
      }
    }

    return {
      isValid: true,
      calculatedAmount: calculation.discountAmount,
      requiresApproval,
    };
  }

  // ============================================================================
  // DISCOUNT CRUD OPERATIONS
  // ============================================================================

  /**
   * Get all discounts for a club with filtering
   */
  async getDiscounts(tenantId: string, args: DiscountsQueryArgs) {
    const where: Prisma.DiscountWhereInput = { clubId: tenantId };

    if (args.search) {
      where.OR = [
        { name: { contains: args.search, mode: 'insensitive' } },
        { code: { contains: args.search, mode: 'insensitive' } },
      ];
    }

    if (args.type) {
      where.type = args.type;
    }

    if (args.scope) {
      where.scope = args.scope;
    }

    if (args.isActive !== undefined) {
      where.isActive = args.isActive;
    }

    const orderBy: Prisma.DiscountOrderByWithRelationInput = {};
    if (args.sortBy) {
      orderBy[args.sortBy as keyof Prisma.DiscountOrderByWithRelationInput] =
        args.sortOrder === 'desc' ? 'desc' : 'asc';
    }

    const [discounts, total] = await Promise.all([
      this.prisma.discount.findMany({
        where,
        orderBy,
        skip: args.offset || 0,
        take: args.limit || 50,
      }),
      this.prisma.discount.count({ where }),
    ]);

    return { discounts, total };
  }

  /**
   * Get active discounts for POS use
   */
  async getActiveDiscounts(tenantId: string) {
    const now = new Date();

    return this.prisma.discount.findMany({
      where: {
        clubId: tenantId,
        isActive: true,
        OR: [{ validFrom: null }, { validFrom: { lte: now } }],
        AND: [{ OR: [{ validTo: null }, { validTo: { gte: now } }] }],
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get a single discount by ID
   */
  async getDiscount(tenantId: string, id: string) {
    const discount = await this.prisma.discount.findFirst({
      where: { id, clubId: tenantId },
      include: {
        appliedDiscounts: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!discount) {
      throw new NotFoundException('Discount not found');
    }

    return discount;
  }

  /**
   * Find discount by code
   */
  async getDiscountByCode(tenantId: string, code: string) {
    return this.prisma.discount.findFirst({
      where: {
        clubId: tenantId,
        code,
        isActive: true,
      },
    });
  }

  /**
   * Create a new discount
   */
  async createDiscount(tenantId: string, input: CreateDiscountInput) {
    // Check for duplicate code if provided
    if (input.code) {
      const existing = await this.prisma.discount.findFirst({
        where: {
          clubId: tenantId,
          code: input.code,
        },
      });

      if (existing) {
        throw new BadRequestException(`Discount code "${input.code}" already exists`);
      }
    }

    return this.prisma.discount.create({
      data: {
        clubId: tenantId,
        name: input.name,
        code: input.code,
        type: input.type,
        value: input.value,
        scope: input.scope,
        minimumAmount: input.conditions?.minimumAmount,
        maximumDiscount: input.conditions?.maximumDiscount,
        membershipTypeIds: input.conditions?.membershipTypeIds || [],
        playerTypes: (input.conditions?.playerTypes || []) as any[],
        validFrom: input.validity?.validFrom,
        validTo: input.validity?.validTo,
        usageLimit: input.validity?.usageLimit,
        requiresApproval: input.approval?.requiresApproval || false,
        approvalThreshold: input.approval?.approvalThreshold,
        isActive: input.isActive ?? true,
      },
    });
  }

  /**
   * Update an existing discount
   */
  async updateDiscount(tenantId: string, id: string, input: UpdateDiscountInput) {
    const existing = await this.prisma.discount.findFirst({
      where: { id, clubId: tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Discount not found');
    }

    // Check for duplicate code if changing
    if (input.code && input.code !== existing.code) {
      const duplicate = await this.prisma.discount.findFirst({
        where: {
          clubId: tenantId,
          code: input.code,
          id: { not: id },
        },
      });

      if (duplicate) {
        throw new BadRequestException(`Discount code "${input.code}" already exists`);
      }
    }

    const updateData: Prisma.DiscountUpdateInput = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.code !== undefined) updateData.code = input.code;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.value !== undefined) updateData.value = input.value;
    if (input.scope !== undefined) updateData.scope = input.scope;
    if (input.isActive !== undefined) updateData.isActive = input.isActive;

    if (input.conditions) {
      if (input.conditions.minimumAmount !== undefined) {
        updateData.minimumAmount = input.conditions.minimumAmount;
      }
      if (input.conditions.maximumDiscount !== undefined) {
        updateData.maximumDiscount = input.conditions.maximumDiscount;
      }
      if (input.conditions.membershipTypeIds !== undefined) {
        updateData.membershipTypeIds = input.conditions.membershipTypeIds;
      }
      if (input.conditions.playerTypes !== undefined) {
        updateData.playerTypes = input.conditions.playerTypes as any[];
      }
    }

    if (input.validity) {
      if (input.validity.validFrom !== undefined) {
        updateData.validFrom = input.validity.validFrom;
      }
      if (input.validity.validTo !== undefined) {
        updateData.validTo = input.validity.validTo;
      }
      if (input.validity.usageLimit !== undefined) {
        updateData.usageLimit = input.validity.usageLimit;
      }
    }

    if (input.approval) {
      if (input.approval.requiresApproval !== undefined) {
        updateData.requiresApproval = input.approval.requiresApproval;
      }
      if (input.approval.approvalThreshold !== undefined) {
        updateData.approvalThreshold = input.approval.approvalThreshold;
      }
    }

    return this.prisma.discount.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Delete a discount (soft delete by setting isActive = false)
   */
  async deleteDiscount(tenantId: string, id: string) {
    const existing = await this.prisma.discount.findFirst({
      where: { id, clubId: tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Discount not found');
    }

    await this.prisma.discount.update({
      where: { id },
      data: { isActive: false },
    });

    return true;
  }

  // ============================================================================
  // APPLY DISCOUNT OPERATIONS
  // ============================================================================

  /**
   * Apply a discount to a line item or transaction
   */
  async applyDiscount(
    tenantId: string,
    input: ApplyDiscountInput,
    appliedBy: string,
  ): Promise<ApplyDiscountResult> {
    const discount = await this.prisma.discount.findFirst({
      where: { id: input.discountId, clubId: tenantId },
    });

    if (!discount) {
      return { success: false, message: 'Discount not found' };
    }

    // Validate the discount
    const validation = await this.validateDiscount(tenantId, {
      discountId: input.discountId,
      amount: input.originalAmount,
    });

    if (!validation.isValid) {
      return { success: false, message: validation.message };
    }

    const calculation = this.calculateDiscount(
      input.originalAmount,
      discount.type,
      Number(discount.value),
      discount.maximumDiscount ? Number(discount.maximumDiscount) : undefined,
    );

    // Create the applied discount record
    const appliedDiscount = await this.prisma.appliedDiscount.create({
      data: {
        discountId: input.discountId,
        lineItemId: input.lineItemId,
        transactionId: input.transactionId,
        discountType: discount.type,
        discountValue: discount.value,
        calculatedAmount: calculation.discountAmount,
        appliedBy,
      },
    });

    // Increment usage count
    await this.prisma.discount.update({
      where: { id: input.discountId },
      data: { usageCount: { increment: 1 } },
    });

    return {
      success: true,
      appliedDiscountId: appliedDiscount.id,
      requiresApproval: calculation.requiresApproval || discount.requiresApproval,
      originalAmount: input.originalAmount,
      discountedAmount: calculation.newAmount,
      savings: calculation.discountAmount,
    };
  }

  /**
   * Apply a discount by code
   */
  async applyDiscountByCode(
    tenantId: string,
    input: ApplyDiscountByCodeInput,
    appliedBy: string,
  ): Promise<ApplyDiscountResult> {
    const discount = await this.getDiscountByCode(tenantId, input.code);

    if (!discount) {
      return { success: false, message: 'Invalid discount code' };
    }

    return this.applyDiscount(
      tenantId,
      {
        discountId: discount.id,
        lineItemId: input.lineItemId,
        transactionId: input.transactionId,
        originalAmount: input.originalAmount,
      },
      appliedBy,
    );
  }

  /**
   * Approve a pending discount
   */
  async approveDiscount(
    tenantId: string,
    appliedDiscountId: string,
    approvedBy: string,
    approvalNote?: string,
  ) {
    const appliedDiscount = await this.prisma.appliedDiscount.findFirst({
      where: {
        id: appliedDiscountId,
        discount: { clubId: tenantId },
      },
    });

    if (!appliedDiscount) {
      throw new NotFoundException('Applied discount not found');
    }

    return this.prisma.appliedDiscount.update({
      where: { id: appliedDiscountId },
      data: {
        approvedBy,
        approvalNote,
      },
    });
  }

  /**
   * Remove an applied discount
   */
  async removeAppliedDiscount(tenantId: string, appliedDiscountId: string) {
    const appliedDiscount = await this.prisma.appliedDiscount.findFirst({
      where: {
        id: appliedDiscountId,
        discount: { clubId: tenantId },
      },
      include: { discount: true },
    });

    if (!appliedDiscount) {
      throw new NotFoundException('Applied discount not found');
    }

    // Decrement usage count
    if (appliedDiscount.discountId) {
      await this.prisma.discount.update({
        where: { id: appliedDiscount.discountId },
        data: { usageCount: { decrement: 1 } },
      });
    }

    await this.prisma.appliedDiscount.delete({
      where: { id: appliedDiscountId },
    });

    return true;
  }

  /**
   * Get applied discounts for a line item
   */
  async getLineItemDiscounts(lineItemId: string) {
    return this.prisma.appliedDiscount.findMany({
      where: { lineItemId },
      include: { discount: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get applied discounts for a transaction
   */
  async getTransactionDiscounts(transactionId: string) {
    return this.prisma.appliedDiscount.findMany({
      where: { transactionId },
      include: { discount: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
