import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import {
  CheckInSettingsType,
  CheckInPolicyType,
  TaxConfigType,
  TaxOverrideType,
  StarterTicketConfigType,
  TicketContentConfigType,
  ProShopConfigType,
  POSConfigType,
  CheckInPaymentMethodType,
  TaxType,
  TicketGenerateOn,
  PrintOption,
  PaymentMethodTypeEnum,
  LineItemType,
} from './golf.types';
import {
  CheckInPolicyInput,
  TaxConfigInput,
  StarterTicketConfigInput,
  ProShopConfigInput,
  POSConfigInput,
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
} from './check-in-settings.input';

@Injectable()
export class CheckInSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get complete check-in settings for a club
   */
  async getCheckInSettings(clubId: string): Promise<CheckInSettingsType> {
    // Get or create golf settings
    let golfSettings = await this.prisma.clubGolfSettings.findUnique({
      where: { clubId },
    });

    if (!golfSettings) {
      // Create default settings
      golfSettings = await this.prisma.clubGolfSettings.create({
        data: { clubId },
      });
    }

    // Get payment methods
    const paymentMethods = await this.prisma.checkInPaymentMethod.findMany({
      where: { clubId },
      orderBy: { sortOrder: 'asc' },
    });

    // If no payment methods exist, create defaults
    if (paymentMethods.length === 0) {
      await this.createDefaultPaymentMethods(clubId);
      const newMethods = await this.prisma.checkInPaymentMethod.findMany({
        where: { clubId },
        orderBy: { sortOrder: 'asc' },
      });
      paymentMethods.push(...newMethods);
    }

    // Get tax overrides
    const taxOverrides = await this.prisma.taxOverride.findMany({
      where: { clubId },
    });

    return this.mapToCheckInSettings(golfSettings, paymentMethods, taxOverrides);
  }

  /**
   * Update check-in policy settings
   */
  async updateCheckInPolicy(
    clubId: string,
    input: CheckInPolicyInput,
  ): Promise<CheckInSettingsType> {
    await this.prisma.clubGolfSettings.upsert({
      where: { clubId },
      update: {
        allowPartialPayment: input.allowPartialPayment,
        blockSuspendedMembers: input.blockSuspendedMembers,
        showSuspensionReason: input.showSuspensionReason,
        requireAllItemsPaid: input.requireAllItemsPaid,
      },
      create: {
        clubId,
        allowPartialPayment: input.allowPartialPayment ?? false,
        blockSuspendedMembers: input.blockSuspendedMembers ?? true,
        showSuspensionReason: input.showSuspensionReason ?? true,
        requireAllItemsPaid: input.requireAllItemsPaid ?? true,
      },
    });

    return this.getCheckInSettings(clubId);
  }

  /**
   * Update tax configuration
   */
  async updateTaxConfig(
    clubId: string,
    input: TaxConfigInput,
  ): Promise<CheckInSettingsType> {
    // Update main settings
    await this.prisma.clubGolfSettings.upsert({
      where: { clubId },
      update: {
        defaultTaxRate: input.defaultRate,
        defaultTaxType: input.defaultType as any,
        taxLabel: input.taxLabel,
        showTaxBreakdown: input.showBreakdown,
        showTaxTypeIndicator: input.showTypeIndicator,
      },
      create: {
        clubId,
        defaultTaxRate: input.defaultRate ?? 7,
        defaultTaxType: (input.defaultType as any) ?? 'INCLUDE',
        taxLabel: input.taxLabel ?? 'Tax',
        showTaxBreakdown: input.showBreakdown ?? true,
        showTaxTypeIndicator: input.showTypeIndicator ?? true,
      },
    });

    // Update tax overrides if provided
    if (input.overrides) {
      // Delete existing overrides
      await this.prisma.taxOverride.deleteMany({
        where: { clubId },
      });

      // Create new overrides
      for (const override of input.overrides) {
        await this.prisma.taxOverride.create({
          data: {
            clubId,
            itemType: override.itemType as any,
            rate: override.rate,
            taxType: override.taxType as any,
          },
        });
      }
    }

    return this.getCheckInSettings(clubId);
  }

  /**
   * Update starter ticket configuration
   */
  async updateStarterTicketConfig(
    clubId: string,
    input: StarterTicketConfigInput,
  ): Promise<CheckInSettingsType> {
    const updateData: any = {};

    if (input.generateOn !== undefined) {
      updateData.ticketGenerateOn = input.generateOn;
    }
    if (input.autoGenerate !== undefined) {
      updateData.ticketAutoGenerate = input.autoGenerate;
    }
    if (input.defaultPrintOption !== undefined) {
      updateData.ticketDefaultPrint = input.defaultPrintOption;
    }
    if (input.content) {
      if (input.content.showTeeTime !== undefined) {
        updateData.ticketShowTeeTime = input.content.showTeeTime;
      }
      if (input.content.showCourse !== undefined) {
        updateData.ticketShowCourse = input.content.showCourse;
      }
      if (input.content.showStartingHole !== undefined) {
        updateData.ticketShowStartingHole = input.content.showStartingHole;
      }
      if (input.content.showPlayerNames !== undefined) {
        updateData.ticketShowPlayerNames = input.content.showPlayerNames;
      }
      if (input.content.showMemberNumbers !== undefined) {
        updateData.ticketShowMemberNumbers = input.content.showMemberNumbers;
      }
      if (input.content.showCartNumber !== undefined) {
        updateData.ticketShowCartNumber = input.content.showCartNumber;
      }
      if (input.content.showCaddyName !== undefined) {
        updateData.ticketShowCaddyName = input.content.showCaddyName;
      }
      if (input.content.showRentalItems !== undefined) {
        updateData.ticketShowRentalItems = input.content.showRentalItems;
      }
      if (input.content.showSpecialRequests !== undefined) {
        updateData.ticketShowSpecialReqs = input.content.showSpecialRequests;
      }
      if (input.content.showQRCode !== undefined) {
        updateData.ticketShowQRCode = input.content.showQRCode;
      }
    }

    await this.prisma.clubGolfSettings.upsert({
      where: { clubId },
      update: updateData,
      create: {
        clubId,
        ...updateData,
      },
    });

    return this.getCheckInSettings(clubId);
  }

  /**
   * Update pro shop configuration
   */
  async updateProShopConfig(
    clubId: string,
    input: ProShopConfigInput,
  ): Promise<CheckInSettingsType> {
    // Validate quick add product IDs if provided
    if (input.quickAddProductIds && input.quickAddProductIds.length > 10) {
      throw new BadRequestException('Maximum 10 quick add products allowed');
    }

    await this.prisma.clubGolfSettings.upsert({
      where: { clubId },
      update: {
        allowProShopAtCheckIn: input.allowAddAtCheckIn,
        showQuickAddItems: input.showQuickAddItems,
        quickAddProductIds: input.quickAddProductIds,
      },
      create: {
        clubId,
        allowProShopAtCheckIn: input.allowAddAtCheckIn ?? true,
        showQuickAddItems: input.showQuickAddItems ?? true,
        quickAddProductIds: input.quickAddProductIds ?? [],
      },
    });

    return this.getCheckInSettings(clubId);
  }

  /**
   * Update POS configuration
   */
  async updatePOSConfig(
    clubId: string,
    input: POSConfigInput,
  ): Promise<CheckInSettingsType> {
    await this.prisma.clubGolfSettings.upsert({
      where: { clubId },
      update: {
        posIsConnected: input.isConnected,
        posProvider: input.provider,
        posTerminalId: input.terminalId,
      },
      create: {
        clubId,
        posIsConnected: input.isConnected ?? false,
        posProvider: input.provider,
        posTerminalId: input.terminalId,
      },
    });

    return this.getCheckInSettings(clubId);
  }

  /**
   * Reset settings to defaults
   */
  async resetCheckInSettings(clubId: string): Promise<CheckInSettingsType> {
    // Delete existing settings
    await this.prisma.clubGolfSettings.deleteMany({
      where: { clubId },
    });

    // Delete tax overrides
    await this.prisma.taxOverride.deleteMany({
      where: { clubId },
    });

    // Delete payment methods
    await this.prisma.checkInPaymentMethod.deleteMany({
      where: { clubId },
    });

    // Get fresh settings (will create defaults)
    return this.getCheckInSettings(clubId);
  }

  // ============================================================================
  // PAYMENT METHODS
  // ============================================================================

  /**
   * Get all payment methods for a club
   */
  async getPaymentMethods(clubId: string): Promise<CheckInPaymentMethodType[]> {
    const methods = await this.prisma.checkInPaymentMethod.findMany({
      where: { clubId },
      orderBy: { sortOrder: 'asc' },
    });

    return methods.map(this.mapToPaymentMethod);
  }

  /**
   * Get a single payment method
   */
  async getPaymentMethod(id: string): Promise<CheckInPaymentMethodType | null> {
    const method = await this.prisma.checkInPaymentMethod.findUnique({
      where: { id },
    });

    return method ? this.mapToPaymentMethod(method) : null;
  }

  /**
   * Create a new payment method
   */
  async createPaymentMethod(
    clubId: string,
    input: CreatePaymentMethodInput,
  ): Promise<CheckInPaymentMethodType> {
    // Get max sort order
    const maxOrder = await this.prisma.checkInPaymentMethod.aggregate({
      where: { clubId },
      _max: { sortOrder: true },
    });

    const method = await this.prisma.checkInPaymentMethod.create({
      data: {
        clubId,
        name: input.name,
        icon: input.icon,
        type: input.type,
        requiresRef: input.requiresRef ?? false,
        opensPOS: input.opensPOS ?? false,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    });

    return this.mapToPaymentMethod(method);
  }

  /**
   * Update a payment method
   */
  async updatePaymentMethod(
    id: string,
    input: UpdatePaymentMethodInput,
  ): Promise<CheckInPaymentMethodType> {
    const method = await this.prisma.checkInPaymentMethod.update({
      where: { id },
      data: {
        name: input.name,
        icon: input.icon,
        type: input.type,
        isEnabled: input.isEnabled,
        requiresRef: input.requiresRef,
        opensPOS: input.opensPOS,
      },
    });

    return this.mapToPaymentMethod(method);
  }

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(id: string, clubId: string): Promise<boolean> {
    // Ensure at least one enabled method remains
    const enabledCount = await this.prisma.checkInPaymentMethod.count({
      where: { clubId, isEnabled: true, id: { not: id } },
    });

    const methodToDelete = await this.prisma.checkInPaymentMethod.findUnique({
      where: { id },
    });

    if (methodToDelete?.isEnabled && enabledCount === 0) {
      throw new BadRequestException('Cannot delete the last enabled payment method');
    }

    await this.prisma.checkInPaymentMethod.delete({
      where: { id },
    });

    return true;
  }

  /**
   * Reorder payment methods
   */
  async reorderPaymentMethods(
    clubId: string,
    orderedIds: string[],
  ): Promise<CheckInPaymentMethodType[]> {
    // Update sort order for each method
    for (let i = 0; i < orderedIds.length; i++) {
      await this.prisma.checkInPaymentMethod.updateMany({
        where: { id: orderedIds[i], clubId },
        data: { sortOrder: i },
      });
    }

    return this.getPaymentMethods(clubId);
  }

  /**
   * Toggle payment method enabled status
   */
  async togglePaymentMethod(
    id: string,
    clubId: string,
    isEnabled: boolean,
  ): Promise<CheckInPaymentMethodType> {
    // If disabling, ensure at least one method remains enabled
    if (!isEnabled) {
      const enabledCount = await this.prisma.checkInPaymentMethod.count({
        where: { clubId, isEnabled: true, id: { not: id } },
      });

      if (enabledCount === 0) {
        throw new BadRequestException('Cannot disable the last enabled payment method');
      }
    }

    const method = await this.prisma.checkInPaymentMethod.update({
      where: { id },
      data: { isEnabled },
    });

    return this.mapToPaymentMethod(method);
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private async createDefaultPaymentMethods(clubId: string): Promise<void> {
    const defaults = [
      { name: 'Cash', icon: 'cash', type: 'CASH', sortOrder: 0 },
      { name: 'QR Transfer', icon: 'qr', type: 'TRANSFER', requiresRef: true, sortOrder: 1 },
      { name: 'Card', icon: 'card', type: 'CARD', opensPOS: true, sortOrder: 2 },
      { name: 'Member Account', icon: 'account', type: 'ACCOUNT', sortOrder: 3 },
    ];

    for (const method of defaults) {
      await this.prisma.checkInPaymentMethod.create({
        data: {
          clubId,
          name: method.name,
          icon: method.icon,
          type: method.type,
          requiresRef: method.requiresRef ?? false,
          opensPOS: method.opensPOS ?? false,
          sortOrder: method.sortOrder,
        },
      });
    }
  }

  private mapToCheckInSettings(
    golfSettings: any,
    paymentMethods: any[],
    taxOverrides: any[],
  ): CheckInSettingsType {
    return {
      policy: {
        allowPartialPayment: golfSettings.allowPartialPayment,
        blockSuspendedMembers: golfSettings.blockSuspendedMembers,
        showSuspensionReason: golfSettings.showSuspensionReason,
        requireAllItemsPaid: golfSettings.requireAllItemsPaid,
      },
      paymentMethods: paymentMethods.map(this.mapToPaymentMethod),
      tax: {
        defaultRate: Number(golfSettings.defaultTaxRate),
        defaultType: golfSettings.defaultTaxType as TaxType,
        taxLabel: golfSettings.taxLabel,
        showBreakdown: golfSettings.showTaxBreakdown,
        showTypeIndicator: golfSettings.showTaxTypeIndicator,
        overrides: taxOverrides.map((o) => ({
          itemType: o.itemType as LineItemType,
          rate: Number(o.rate),
          taxType: o.taxType as TaxType,
        })),
      },
      starterTicket: {
        generateOn: golfSettings.ticketGenerateOn as TicketGenerateOn,
        autoGenerate: golfSettings.ticketAutoGenerate,
        defaultPrintOption: golfSettings.ticketDefaultPrint as PrintOption,
        content: {
          showTeeTime: golfSettings.ticketShowTeeTime,
          showCourse: golfSettings.ticketShowCourse,
          showStartingHole: golfSettings.ticketShowStartingHole,
          showPlayerNames: golfSettings.ticketShowPlayerNames,
          showMemberNumbers: golfSettings.ticketShowMemberNumbers,
          showCartNumber: golfSettings.ticketShowCartNumber,
          showCaddyName: golfSettings.ticketShowCaddyName,
          showRentalItems: golfSettings.ticketShowRentalItems,
          showSpecialRequests: golfSettings.ticketShowSpecialReqs,
          showQRCode: golfSettings.ticketShowQRCode,
        },
      },
      proShop: {
        allowAddAtCheckIn: golfSettings.allowProShopAtCheckIn,
        showQuickAddItems: golfSettings.showQuickAddItems,
        quickAddProductIds: golfSettings.quickAddProductIds || [],
      },
      pos: {
        isConnected: golfSettings.posIsConnected,
        provider: golfSettings.posProvider || undefined,
        terminalId: golfSettings.posTerminalId || undefined,
      },
    };
  }

  private mapToPaymentMethod(method: any): CheckInPaymentMethodType {
    return {
      id: method.id,
      name: method.name,
      icon: method.icon,
      type: method.type as PaymentMethodTypeEnum,
      isEnabled: method.isEnabled,
      requiresRef: method.requiresRef,
      opensPOS: method.opensPOS,
      sortOrder: method.sortOrder,
    };
  }
}
