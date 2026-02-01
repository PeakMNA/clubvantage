import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { CashDrawerStatus, CashMovementType, Prisma } from '@prisma/client';

export interface DenominationCount {
  denomination: number;
  count: number;
  total: number;
}

export interface ShiftSummary {
  shiftId: string;
  status: CashDrawerStatus;
  openedAt: Date;
  openedBy: string;
  closedAt?: Date;
  closedBy?: string;
  openingFloat: number;
  closingCount?: number;
  expectedCash: number;
  actualCash?: number;
  variance?: number;
  totalSales: number;
  totalRefunds: number;
  totalPaidIn: number;
  totalPaidOut: number;
  totalDrops: number;
  movementCount: number;
}

export interface OpenShiftInput {
  cashDrawerId: string;
  openingFloat: number;
  denominations?: Record<string, number>;
}

export interface CloseShiftInput {
  shiftId: string;
  closingCount: number;
  denominations?: Record<string, number>;
  varianceNote?: string;
}

export interface RecordMovementInput {
  shiftId: string;
  type: CashMovementType;
  amount: number;
  description?: string;
  reference?: string;
  reason?: string;
  transactionId?: string;
}

// Thai Baht denominations
export const THAI_DENOMINATIONS = [1000, 500, 100, 50, 20, 10, 5, 2, 1, 0.5, 0.25];

@Injectable()
export class CashDrawerService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // CASH DRAWER CRUD
  // ============================================================================

  /**
   * Get all cash drawers for a club
   */
  async getCashDrawers(tenantId: string, activeOnly = true) {
    const where: Prisma.CashDrawerWhereInput = { clubId: tenantId };
    if (activeOnly) {
      where.isActive = true;
    }

    return this.prisma.cashDrawer.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        shifts: {
          where: { status: CashDrawerStatus.OPEN },
          take: 1,
        },
      },
    });
  }

  /**
   * Get a single cash drawer by ID
   */
  async getCashDrawer(id: string) {
    const drawer = await this.prisma.cashDrawer.findUnique({
      where: { id },
      include: {
        shifts: {
          where: { status: CashDrawerStatus.OPEN },
          take: 1,
        },
      },
    });

    if (!drawer) {
      throw new NotFoundException('Cash drawer not found');
    }

    return drawer;
  }

  /**
   * Create a new cash drawer
   */
  async createCashDrawer(tenantId: string, name: string, location?: string) {
    return this.prisma.cashDrawer.create({
      data: {
        clubId: tenantId,
        name,
        location,
      },
    });
  }

  /**
   * Update a cash drawer
   */
  async updateCashDrawer(id: string, data: { name?: string; location?: string; isActive?: boolean }) {
    return this.prisma.cashDrawer.update({
      where: { id },
      data,
    });
  }

  // ============================================================================
  // SHIFT OPERATIONS
  // ============================================================================

  /**
   * Open a new shift on a cash drawer
   */
  async openShift(input: OpenShiftInput, openedBy: string) {
    // Check if drawer exists and has no open shift
    const drawer = await this.prisma.cashDrawer.findUnique({
      where: { id: input.cashDrawerId },
      include: {
        shifts: {
          where: { status: CashDrawerStatus.OPEN },
        },
      },
    });

    if (!drawer) {
      throw new NotFoundException('Cash drawer not found');
    }

    if (drawer.shifts.length > 0) {
      throw new BadRequestException('This drawer already has an open shift');
    }

    return this.prisma.cashDrawerShift.create({
      data: {
        cashDrawerId: input.cashDrawerId,
        openedBy,
        openingFloat: input.openingFloat,
        openingDenominations: input.denominations || {},
        status: CashDrawerStatus.OPEN,
      },
    });
  }

  /**
   * Get the current open shift for a drawer
   */
  async getCurrentShift(cashDrawerId: string) {
    const shift = await this.prisma.cashDrawerShift.findFirst({
      where: {
        cashDrawerId,
        status: CashDrawerStatus.OPEN,
      },
      include: {
        movements: {
          orderBy: { performedAt: 'desc' },
          take: 10,
        },
      },
    });

    return shift;
  }

  /**
   * Get a shift by ID
   */
  async getShift(shiftId: string) {
    const shift = await this.prisma.cashDrawerShift.findUnique({
      where: { id: shiftId },
      include: {
        cashDrawer: true,
        movements: {
          orderBy: { performedAt: 'asc' },
        },
      },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    return shift;
  }

  /**
   * Close a shift
   */
  async closeShift(input: CloseShiftInput, closedBy: string) {
    const shift = await this.prisma.cashDrawerShift.findUnique({
      where: { id: input.shiftId },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    if (shift.status !== CashDrawerStatus.OPEN) {
      throw new BadRequestException('Shift is not open');
    }

    // Calculate expected cash
    const expectedCash =
      Number(shift.openingFloat) +
      Number(shift.totalSales) -
      Number(shift.totalRefunds) +
      Number(shift.totalPaidIn) -
      Number(shift.totalPaidOut) -
      Number(shift.totalDrops);

    const variance = input.closingCount - expectedCash;

    return this.prisma.cashDrawerShift.update({
      where: { id: input.shiftId },
      data: {
        status: CashDrawerStatus.CLOSED,
        closedBy,
        closedAt: new Date(),
        closingCount: input.closingCount,
        closingDenominations: input.denominations || {},
        expectedCash,
        actualCash: input.closingCount,
        variance,
        varianceNote: input.varianceNote,
      },
    });
  }

  /**
   * Suspend a shift (temporary hold without closing)
   */
  async suspendShift(shiftId: string, suspendedBy: string) {
    const shift = await this.prisma.cashDrawerShift.findUnique({
      where: { id: shiftId },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    if (shift.status !== CashDrawerStatus.OPEN) {
      throw new BadRequestException('Shift is not open');
    }

    return this.prisma.cashDrawerShift.update({
      where: { id: shiftId },
      data: { status: CashDrawerStatus.SUSPENDED },
    });
  }

  /**
   * Resume a suspended shift
   */
  async resumeShift(shiftId: string, resumedBy: string) {
    const shift = await this.prisma.cashDrawerShift.findUnique({
      where: { id: shiftId },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    if (shift.status !== CashDrawerStatus.SUSPENDED) {
      throw new BadRequestException('Shift is not suspended');
    }

    return this.prisma.cashDrawerShift.update({
      where: { id: shiftId },
      data: { status: CashDrawerStatus.OPEN },
    });
  }

  // ============================================================================
  // CASH MOVEMENTS
  // ============================================================================

  /**
   * Record a cash movement
   */
  async recordMovement(input: RecordMovementInput, performedBy: string, approvedBy?: string) {
    const shift = await this.prisma.cashDrawerShift.findUnique({
      where: { id: input.shiftId },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    if (shift.status !== CashDrawerStatus.OPEN) {
      throw new BadRequestException('Cannot record movement on a closed shift');
    }

    // Create the movement
    const movement = await this.prisma.cashMovement.create({
      data: {
        shiftId: input.shiftId,
        type: input.type,
        amount: input.amount,
        description: input.description,
        reference: input.reference,
        reason: input.reason,
        transactionId: input.transactionId,
        performedBy,
        approvedBy,
      },
    });

    // Update shift totals based on movement type
    const updateData: Prisma.CashDrawerShiftUpdateInput = {};
    switch (input.type) {
      case CashMovementType.CASH_SALE:
        updateData.totalSales = { increment: input.amount };
        break;
      case CashMovementType.CASH_REFUND:
        updateData.totalRefunds = { increment: input.amount };
        break;
      case CashMovementType.PAID_IN:
        updateData.totalPaidIn = { increment: input.amount };
        break;
      case CashMovementType.PAID_OUT:
        updateData.totalPaidOut = { increment: input.amount };
        break;
      case CashMovementType.DROP:
        updateData.totalDrops = { increment: input.amount };
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.cashDrawerShift.update({
        where: { id: input.shiftId },
        data: updateData,
      });
    }

    return movement;
  }

  /**
   * Get movements for a shift
   */
  async getShiftMovements(shiftId: string, type?: CashMovementType) {
    const where: Prisma.CashMovementWhereInput = { shiftId };
    if (type) {
      where.type = type;
    }

    return this.prisma.cashMovement.findMany({
      where,
      orderBy: { performedAt: 'asc' },
    });
  }

  // ============================================================================
  // SHIFT SUMMARY
  // ============================================================================

  /**
   * Get shift summary
   */
  async getShiftSummary(shiftId: string): Promise<ShiftSummary> {
    const shift = await this.prisma.cashDrawerShift.findUnique({
      where: { id: shiftId },
      include: {
        movements: true,
      },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    const expectedCash =
      Number(shift.openingFloat) +
      Number(shift.totalSales) -
      Number(shift.totalRefunds) +
      Number(shift.totalPaidIn) -
      Number(shift.totalPaidOut) -
      Number(shift.totalDrops);

    return {
      shiftId: shift.id,
      status: shift.status,
      openedAt: shift.openedAt,
      openedBy: shift.openedBy,
      closedAt: shift.closedAt || undefined,
      closedBy: shift.closedBy || undefined,
      openingFloat: Number(shift.openingFloat),
      closingCount: shift.closingCount ? Number(shift.closingCount) : undefined,
      expectedCash,
      actualCash: shift.actualCash ? Number(shift.actualCash) : undefined,
      variance: shift.variance ? Number(shift.variance) : undefined,
      totalSales: Number(shift.totalSales),
      totalRefunds: Number(shift.totalRefunds),
      totalPaidIn: Number(shift.totalPaidIn),
      totalPaidOut: Number(shift.totalPaidOut),
      totalDrops: Number(shift.totalDrops),
      movementCount: shift.movements.length,
    };
  }

  // ============================================================================
  // DENOMINATION HELPERS
  // ============================================================================

  /**
   * Calculate total from denominations
   */
  calculateDenominationTotal(denominations: Record<string, number>): number {
    let total = 0;
    for (const [denom, count] of Object.entries(denominations)) {
      total += parseFloat(denom) * count;
    }
    return total;
  }

  /**
   * Get denomination breakdown
   */
  getDenominationBreakdown(denominations: Record<string, number>): DenominationCount[] {
    return THAI_DENOMINATIONS.map((denom) => ({
      denomination: denom,
      count: denominations[denom.toString()] || 0,
      total: (denominations[denom.toString()] || 0) * denom,
    })).filter((d) => d.count > 0);
  }

  // ============================================================================
  // SHIFT HISTORY
  // ============================================================================

  /**
   * Get shift history for a drawer
   */
  async getShiftHistory(cashDrawerId: string, limit = 30) {
    return this.prisma.cashDrawerShift.findMany({
      where: { cashDrawerId },
      orderBy: { openedAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get shifts for a date range
   */
  async getShiftsForPeriod(tenantId: string, startDate: Date, endDate: Date) {
    return this.prisma.cashDrawerShift.findMany({
      where: {
        cashDrawer: { clubId: tenantId },
        openedAt: { gte: startDate, lte: endDate },
      },
      include: {
        cashDrawer: true,
      },
      orderBy: { openedAt: 'desc' },
    });
  }
}
