import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import {
  SubAccountStatus,
  SubAccountPermission,
  Prisma,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const PIN_SALT_ROUNDS = 10;
const MAX_PIN_ATTEMPTS = 5;
const PIN_LOCKOUT_MINUTES = 30;

export interface CreateSubAccountInput {
  memberId: string;
  name: string;
  relationship: string;
  email?: string;
  phone?: string;
  pin: string;
  permissions?: SubAccountPermission[];
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  perTransactionLimit?: number;
  validFrom?: Date;
  validUntil?: Date;
  notifyPrimaryOnUse?: boolean;
  notifyOnLimitReached?: boolean;
}

export interface UpdateSubAccountInput {
  subAccountId: string;
  name?: string;
  relationship?: string;
  email?: string;
  phone?: string;
  permissions?: SubAccountPermission[];
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  perTransactionLimit?: number;
  validUntil?: Date;
  notifyPrimaryOnUse?: boolean;
  notifyOnLimitReached?: boolean;
}

export interface VerifyPinInput {
  subAccountId: string;
  pin: string;
}

export interface RecordTransactionInput {
  subAccountId: string;
  amount: number;
  description: string;
  category: SubAccountPermission;
  paymentTransactionId?: string;
  lineItemId?: string;
  teeTimeId?: string;
  locationName?: string;
  notes?: string;
}

export interface CheckLimitResult {
  allowed: boolean;
  reason?: string;
  currentDaily: number;
  currentWeekly: number;
  currentMonthly: number;
  dailyLimit: number | null;
  weeklyLimit: number | null;
  monthlyLimit: number | null;
  perTransactionLimit: number | null;
}

@Injectable()
export class SubAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  // ============================================================================
  // SUB-ACCOUNT CRUD
  // ============================================================================

  /**
   * Create a sub-account
   */
  async createSubAccount(tenantId: string, input: CreateSubAccountInput) {
    // Hash the PIN
    const hashedPin = await bcrypt.hash(input.pin, PIN_SALT_ROUNDS);

    return this.prisma.subAccount.create({
      data: {
        clubId: tenantId,
        memberId: input.memberId,
        name: input.name,
        relationship: input.relationship,
        email: input.email,
        phone: input.phone,
        pin: hashedPin,
        permissions: input.permissions ?? [SubAccountPermission.ALL],
        dailyLimit: input.dailyLimit,
        weeklyLimit: input.weeklyLimit,
        monthlyLimit: input.monthlyLimit,
        perTransactionLimit: input.perTransactionLimit,
        validFrom: input.validFrom ?? new Date(),
        validUntil: input.validUntil,
        notifyPrimaryOnUse: input.notifyPrimaryOnUse ?? false,
        notifyOnLimitReached: input.notifyOnLimitReached ?? true,
      },
      include: {
        member: true,
      },
    });
  }

  /**
   * Get sub-account by ID
   */
  async getSubAccount(subAccountId: string) {
    const subAccount = await this.prisma.subAccount.findUnique({
      where: { id: subAccountId },
      include: {
        member: true,
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!subAccount) {
      throw new NotFoundException('Sub-account not found');
    }

    return subAccount;
  }

  /**
   * Get sub-accounts for a member
   */
  async getSubAccountsByMember(memberId: string, activeOnly = true) {
    return this.prisma.subAccount.findMany({
      where: {
        memberId,
        ...(activeOnly && { status: SubAccountStatus.ACTIVE }),
      },
      include: {
        member: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get all sub-accounts for a club
   */
  async getSubAccounts(tenantId: string, status?: SubAccountStatus) {
    return this.prisma.subAccount.findMany({
      where: {
        clubId: tenantId,
        ...(status && { status }),
      },
      include: {
        member: true,
      },
      orderBy: [{ member: { lastName: 'asc' } }, { name: 'asc' }],
    });
  }

  /**
   * Update a sub-account
   */
  async updateSubAccount(input: UpdateSubAccountInput) {
    const subAccount = await this.getSubAccount(input.subAccountId);

    const updateData: Prisma.SubAccountUpdateInput = {};

    if (input.name !== undefined) updateData.name = input.name;
    if (input.relationship !== undefined) updateData.relationship = input.relationship;
    if (input.email !== undefined) updateData.email = input.email;
    if (input.phone !== undefined) updateData.phone = input.phone;
    if (input.permissions !== undefined) updateData.permissions = input.permissions;
    if (input.dailyLimit !== undefined) updateData.dailyLimit = input.dailyLimit;
    if (input.weeklyLimit !== undefined) updateData.weeklyLimit = input.weeklyLimit;
    if (input.monthlyLimit !== undefined) updateData.monthlyLimit = input.monthlyLimit;
    if (input.perTransactionLimit !== undefined)
      updateData.perTransactionLimit = input.perTransactionLimit;
    if (input.validUntil !== undefined) updateData.validUntil = input.validUntil;
    if (input.notifyPrimaryOnUse !== undefined)
      updateData.notifyPrimaryOnUse = input.notifyPrimaryOnUse;
    if (input.notifyOnLimitReached !== undefined)
      updateData.notifyOnLimitReached = input.notifyOnLimitReached;

    return this.prisma.subAccount.update({
      where: { id: input.subAccountId },
      data: updateData,
      include: {
        member: true,
      },
    });
  }

  /**
   * Change PIN for a sub-account
   */
  async changePin(subAccountId: string, newPin: string) {
    await this.getSubAccount(subAccountId);

    const hashedPin = await bcrypt.hash(newPin, PIN_SALT_ROUNDS);

    return this.prisma.subAccount.update({
      where: { id: subAccountId },
      data: {
        pin: hashedPin,
        pinAttempts: 0,
        pinLockedUntil: null,
      },
      include: {
        member: true,
      },
    });
  }

  /**
   * Change sub-account status
   */
  async changeStatus(subAccountId: string, status: SubAccountStatus) {
    await this.getSubAccount(subAccountId);

    return this.prisma.subAccount.update({
      where: { id: subAccountId },
      data: { status },
      include: {
        member: true,
      },
    });
  }

  /**
   * Delete a sub-account (soft delete by revoking)
   */
  async deleteSubAccount(subAccountId: string) {
    await this.getSubAccount(subAccountId);

    return this.prisma.subAccount.update({
      where: { id: subAccountId },
      data: { status: SubAccountStatus.REVOKED },
      include: {
        member: true,
      },
    });
  }

  // ============================================================================
  // PIN VERIFICATION
  // ============================================================================

  /**
   * Verify PIN for a sub-account
   */
  async verifyPin(input: VerifyPinInput, verifiedBy?: string): Promise<boolean> {
    const subAccount = await this.prisma.subAccount.findUnique({
      where: { id: input.subAccountId },
    });

    if (!subAccount) {
      throw new NotFoundException('Sub-account not found');
    }

    // Check if account is active
    if (subAccount.status !== SubAccountStatus.ACTIVE) {
      throw new ForbiddenException('Sub-account is not active');
    }

    // Check if account is within valid date range
    const now = new Date();
    if (subAccount.validFrom > now) {
      throw new ForbiddenException('Sub-account is not yet valid');
    }
    if (subAccount.validUntil && subAccount.validUntil < now) {
      throw new ForbiddenException('Sub-account has expired');
    }

    // Check if PIN is locked
    if (subAccount.pinLockedUntil && subAccount.pinLockedUntil > now) {
      const remainingMinutes = Math.ceil(
        (subAccount.pinLockedUntil.getTime() - now.getTime()) / (1000 * 60),
      );
      throw new ForbiddenException(
        `PIN is locked. Try again in ${remainingMinutes} minutes.`,
      );
    }

    // Verify PIN
    const isValid = await bcrypt.compare(input.pin, subAccount.pin);

    if (!isValid) {
      // Increment failed attempts
      const newAttempts = subAccount.pinAttempts + 1;
      const shouldLock = newAttempts >= MAX_PIN_ATTEMPTS;

      await this.prisma.subAccount.update({
        where: { id: input.subAccountId },
        data: {
          pinAttempts: newAttempts,
          pinLockedUntil: shouldLock
            ? new Date(now.getTime() + PIN_LOCKOUT_MINUTES * 60 * 1000)
            : null,
        },
      });

      if (shouldLock) {
        throw new ForbiddenException(
          `Too many failed attempts. PIN locked for ${PIN_LOCKOUT_MINUTES} minutes.`,
        );
      }

      return false;
    }

    // Reset attempts on successful verification
    await this.prisma.subAccount.update({
      where: { id: input.subAccountId },
      data: {
        pinAttempts: 0,
        pinLockedUntil: null,
      },
    });

    return true;
  }

  /**
   * Unlock a locked PIN
   */
  async unlockPin(subAccountId: string) {
    await this.getSubAccount(subAccountId);

    return this.prisma.subAccount.update({
      where: { id: subAccountId },
      data: {
        pinAttempts: 0,
        pinLockedUntil: null,
      },
      include: {
        member: true,
      },
    });
  }

  // ============================================================================
  // PERMISSION CHECKS
  // ============================================================================

  /**
   * Check if sub-account has permission for a category
   */
  hasPermission(subAccount: { permissions: SubAccountPermission[] }, category: SubAccountPermission): boolean {
    if (subAccount.permissions.includes(SubAccountPermission.ALL)) {
      return true;
    }
    return subAccount.permissions.includes(category);
  }

  /**
   * Check if sub-account can make a transaction
   */
  async checkCanTransact(
    subAccountId: string,
    amount: number,
    category: SubAccountPermission,
  ): Promise<CheckLimitResult> {
    const subAccount = await this.getSubAccount(subAccountId);

    // Check status
    if (subAccount.status !== SubAccountStatus.ACTIVE) {
      return {
        allowed: false,
        reason: 'Sub-account is not active',
        currentDaily: Number(subAccount.dailySpend),
        currentWeekly: Number(subAccount.weeklySpend),
        currentMonthly: Number(subAccount.monthlySpend),
        dailyLimit: subAccount.dailyLimit ? Number(subAccount.dailyLimit) : null,
        weeklyLimit: subAccount.weeklyLimit ? Number(subAccount.weeklyLimit) : null,
        monthlyLimit: subAccount.monthlyLimit ? Number(subAccount.monthlyLimit) : null,
        perTransactionLimit: subAccount.perTransactionLimit
          ? Number(subAccount.perTransactionLimit)
          : null,
      };
    }

    // Check permission
    if (!this.hasPermission(subAccount, category)) {
      return {
        allowed: false,
        reason: `No permission for ${category}`,
        currentDaily: Number(subAccount.dailySpend),
        currentWeekly: Number(subAccount.weeklySpend),
        currentMonthly: Number(subAccount.monthlySpend),
        dailyLimit: subAccount.dailyLimit ? Number(subAccount.dailyLimit) : null,
        weeklyLimit: subAccount.weeklyLimit ? Number(subAccount.weeklyLimit) : null,
        monthlyLimit: subAccount.monthlyLimit ? Number(subAccount.monthlyLimit) : null,
        perTransactionLimit: subAccount.perTransactionLimit
          ? Number(subAccount.perTransactionLimit)
          : null,
      };
    }

    // Reset spending counters if needed
    await this.resetSpendingIfNeeded(subAccountId);
    const refreshed = await this.getSubAccount(subAccountId);

    // Check per-transaction limit
    if (refreshed.perTransactionLimit && amount > Number(refreshed.perTransactionLimit)) {
      return {
        allowed: false,
        reason: `Exceeds per-transaction limit of ${Number(refreshed.perTransactionLimit)}`,
        currentDaily: Number(refreshed.dailySpend),
        currentWeekly: Number(refreshed.weeklySpend),
        currentMonthly: Number(refreshed.monthlySpend),
        dailyLimit: refreshed.dailyLimit ? Number(refreshed.dailyLimit) : null,
        weeklyLimit: refreshed.weeklyLimit ? Number(refreshed.weeklyLimit) : null,
        monthlyLimit: refreshed.monthlyLimit ? Number(refreshed.monthlyLimit) : null,
        perTransactionLimit: refreshed.perTransactionLimit
          ? Number(refreshed.perTransactionLimit)
          : null,
      };
    }

    // Check daily limit
    if (
      refreshed.dailyLimit &&
      Number(refreshed.dailySpend) + amount > Number(refreshed.dailyLimit)
    ) {
      return {
        allowed: false,
        reason: `Would exceed daily limit of ${Number(refreshed.dailyLimit)}`,
        currentDaily: Number(refreshed.dailySpend),
        currentWeekly: Number(refreshed.weeklySpend),
        currentMonthly: Number(refreshed.monthlySpend),
        dailyLimit: Number(refreshed.dailyLimit),
        weeklyLimit: refreshed.weeklyLimit ? Number(refreshed.weeklyLimit) : null,
        monthlyLimit: refreshed.monthlyLimit ? Number(refreshed.monthlyLimit) : null,
        perTransactionLimit: refreshed.perTransactionLimit
          ? Number(refreshed.perTransactionLimit)
          : null,
      };
    }

    // Check weekly limit
    if (
      refreshed.weeklyLimit &&
      Number(refreshed.weeklySpend) + amount > Number(refreshed.weeklyLimit)
    ) {
      return {
        allowed: false,
        reason: `Would exceed weekly limit of ${Number(refreshed.weeklyLimit)}`,
        currentDaily: Number(refreshed.dailySpend),
        currentWeekly: Number(refreshed.weeklySpend),
        currentMonthly: Number(refreshed.monthlySpend),
        dailyLimit: refreshed.dailyLimit ? Number(refreshed.dailyLimit) : null,
        weeklyLimit: Number(refreshed.weeklyLimit),
        monthlyLimit: refreshed.monthlyLimit ? Number(refreshed.monthlyLimit) : null,
        perTransactionLimit: refreshed.perTransactionLimit
          ? Number(refreshed.perTransactionLimit)
          : null,
      };
    }

    // Check monthly limit
    if (
      refreshed.monthlyLimit &&
      Number(refreshed.monthlySpend) + amount > Number(refreshed.monthlyLimit)
    ) {
      return {
        allowed: false,
        reason: `Would exceed monthly limit of ${Number(refreshed.monthlyLimit)}`,
        currentDaily: Number(refreshed.dailySpend),
        currentWeekly: Number(refreshed.weeklySpend),
        currentMonthly: Number(refreshed.monthlySpend),
        dailyLimit: refreshed.dailyLimit ? Number(refreshed.dailyLimit) : null,
        weeklyLimit: refreshed.weeklyLimit ? Number(refreshed.weeklyLimit) : null,
        monthlyLimit: Number(refreshed.monthlyLimit),
        perTransactionLimit: refreshed.perTransactionLimit
          ? Number(refreshed.perTransactionLimit)
          : null,
      };
    }

    return {
      allowed: true,
      currentDaily: Number(refreshed.dailySpend),
      currentWeekly: Number(refreshed.weeklySpend),
      currentMonthly: Number(refreshed.monthlySpend),
      dailyLimit: refreshed.dailyLimit ? Number(refreshed.dailyLimit) : null,
      weeklyLimit: refreshed.weeklyLimit ? Number(refreshed.weeklyLimit) : null,
      monthlyLimit: refreshed.monthlyLimit ? Number(refreshed.monthlyLimit) : null,
      perTransactionLimit: refreshed.perTransactionLimit
        ? Number(refreshed.perTransactionLimit)
        : null,
    };
  }

  // ============================================================================
  // TRANSACTIONS
  // ============================================================================

  /**
   * Record a transaction for a sub-account
   */
  async recordTransaction(tenantId: string, input: RecordTransactionInput, verifiedBy?: string) {
    const subAccount = await this.getSubAccount(input.subAccountId);

    // Check if transaction is allowed
    const canTransact = await this.checkCanTransact(
      input.subAccountId,
      input.amount,
      input.category,
    );

    if (!canTransact.allowed) {
      throw new BadRequestException(canTransact.reason);
    }

    // Create transaction and update spending in a transaction
    const [transaction] = await this.prisma.$transaction([
      this.prisma.subAccountTransaction.create({
        data: {
          clubId: tenantId,
          subAccountId: input.subAccountId,
          amount: input.amount,
          description: input.description,
          category: input.category,
          paymentTransactionId: input.paymentTransactionId,
          lineItemId: input.lineItemId,
          teeTimeId: input.teeTimeId,
          locationName: input.locationName,
          notes: input.notes,
          verifiedBy,
        },
      }),
      this.prisma.subAccount.update({
        where: { id: input.subAccountId },
        data: {
          dailySpend: { increment: input.amount },
          weeklySpend: { increment: input.amount },
          monthlySpend: { increment: input.amount },
        },
      }),
    ]);

    return transaction;
  }

  /**
   * Get transactions for a sub-account
   */
  async getTransactions(subAccountId: string, limit = 50) {
    return this.prisma.subAccountTransaction.findMany({
      where: { subAccountId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get transactions for a date range
   */
  async getTransactionsByDateRange(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    subAccountId?: string,
  ) {
    return this.prisma.subAccountTransaction.findMany({
      where: {
        clubId: tenantId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        ...(subAccountId && { subAccountId }),
      },
      include: {
        subAccount: {
          include: {
            member: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ============================================================================
  // SPENDING RESET
  // ============================================================================

  /**
   * Reset spending counters if the period has passed
   */
  async resetSpendingIfNeeded(subAccountId: string) {
    const subAccount = await this.prisma.subAccount.findUnique({
      where: { id: subAccountId },
    });

    if (!subAccount) return;

    const now = new Date();
    const updates: Prisma.SubAccountUpdateInput = {};

    // Check if daily reset is needed
    const lastDaily = new Date(subAccount.lastResetDaily);
    if (
      lastDaily.getDate() !== now.getDate() ||
      lastDaily.getMonth() !== now.getMonth() ||
      lastDaily.getFullYear() !== now.getFullYear()
    ) {
      updates.dailySpend = 0;
      updates.lastResetDaily = now;
    }

    // Check if weekly reset is needed (start of week = Monday)
    const lastWeekly = new Date(subAccount.lastResetWeekly);
    const getWeekNumber = (d: Date) => {
      const oneJan = new Date(d.getFullYear(), 0, 1);
      return Math.ceil(((d.getTime() - oneJan.getTime()) / 86400000 + oneJan.getDay() + 1) / 7);
    };
    if (
      getWeekNumber(lastWeekly) !== getWeekNumber(now) ||
      lastWeekly.getFullYear() !== now.getFullYear()
    ) {
      updates.weeklySpend = 0;
      updates.lastResetWeekly = now;
    }

    // Check if monthly reset is needed
    const lastMonthly = new Date(subAccount.lastResetMonthly);
    if (
      lastMonthly.getMonth() !== now.getMonth() ||
      lastMonthly.getFullYear() !== now.getFullYear()
    ) {
      updates.monthlySpend = 0;
      updates.lastResetMonthly = now;
    }

    if (Object.keys(updates).length > 0) {
      await this.prisma.subAccount.update({
        where: { id: subAccountId },
        data: updates,
      });
    }
  }

  /**
   * Manually reset all spending counters
   */
  async resetAllSpending(subAccountId: string) {
    await this.getSubAccount(subAccountId);

    return this.prisma.subAccount.update({
      where: { id: subAccountId },
      data: {
        dailySpend: 0,
        weeklySpend: 0,
        monthlySpend: 0,
        lastResetDaily: new Date(),
        lastResetWeekly: new Date(),
        lastResetMonthly: new Date(),
      },
      include: {
        member: true,
      },
    });
  }
}
