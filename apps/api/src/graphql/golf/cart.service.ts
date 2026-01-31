import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';

export interface TransferLineItemInput {
  lineItemId: string;
  fromPlayerId: string;
  toPlayerId: string;
  transferredBy: string;
}

export interface TransferResult {
  success: boolean;
  error?: string;
  lineItem?: {
    id: string;
    isTransferred: boolean;
    transferredToPlayerId: string | null;
  };
}

export interface SlotCart {
  playerId: string;
  playerName: string;
  playerType: string;
  memberId?: string;
  memberNumber?: string;
  lineItems: Array<{
    id: string;
    type: string;
    description: string;
    baseAmount: number;
    taxType: string;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
    quantity: number;
    isPaid: boolean;
    paidAt?: Date;
    paymentMethod?: string;
    isTransferred: boolean;
    transferredFromPlayerName?: string;
  }>;
  transferredInItems: Array<{
    lineItemId: string;
    description: string;
    amount: number;
    fromPlayerId: string;
    fromPlayerName: string;
  }>;
  transferredOutItems: Array<{
    lineItemId: string;
    description: string;
    amount: number;
    fromPlayerId: string;
    fromPlayerName: string;
    toPlayerId: string;
    toPlayerName: string;
  }>;
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  isCheckedIn: boolean;
  checkedInAt?: Date;
  isSettled: boolean;
}

export interface BatchTotal {
  playerIds: string[];
  subtotal: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
  lineItemCount: number;
}

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Transfer a line item from one player's cart to another
   * The item stays in the original player's cart but is marked as transferred
   */
  async transferLineItem(input: TransferLineItemInput): Promise<TransferResult> {
    const { lineItemId, fromPlayerId, toPlayerId, transferredBy } = input;

    // Validate line item exists and belongs to fromPlayer
    const lineItem = await this.prisma.bookingLineItem.findUnique({
      where: { id: lineItemId },
      include: { teeTimePlayer: true },
    });

    if (!lineItem) {
      return { success: false, error: 'Line item not found' };
    }

    if (lineItem.teeTimePlayerId !== fromPlayerId) {
      return { success: false, error: 'Line item does not belong to source player' };
    }

    if (lineItem.isPaid) {
      return { success: false, error: 'Cannot transfer a paid line item' };
    }

    if (lineItem.isTransferred) {
      return { success: false, error: 'Line item is already transferred' };
    }

    // Validate toPlayer exists and is in the same tee time
    const toPlayer = await this.prisma.teeTimePlayer.findUnique({
      where: { id: toPlayerId },
    });

    if (!toPlayer) {
      return { success: false, error: 'Destination player not found' };
    }

    if (toPlayer.teeTimeId !== lineItem.teeTimePlayer.teeTimeId) {
      return { success: false, error: 'Players must be in the same tee time' };
    }

    // Perform the transfer
    const updated = await this.prisma.bookingLineItem.update({
      where: { id: lineItemId },
      data: {
        isTransferred: true,
        transferredFromPlayerId: fromPlayerId,
        transferredToPlayerId: toPlayerId,
        transferredAt: new Date(),
        originalPlayerId: lineItem.originalPlayerId || fromPlayerId,
        // Move the line item to the new player's cart
        teeTimePlayerId: toPlayerId,
      },
    });

    return {
      success: true,
      lineItem: {
        id: updated.id,
        isTransferred: updated.isTransferred,
        transferredToPlayerId: updated.transferredToPlayerId,
      },
    };
  }

  /**
   * Undo a transfer - move the line item back to the original player
   */
  async undoTransfer(lineItemId: string): Promise<{ success: boolean; error?: string }> {
    const lineItem = await this.prisma.bookingLineItem.findUnique({
      where: { id: lineItemId },
    });

    if (!lineItem) {
      return { success: false, error: 'Line item not found' };
    }

    if (!lineItem.isTransferred) {
      return { success: false, error: 'Line item is not transferred' };
    }

    if (lineItem.isPaid) {
      return { success: false, error: 'Cannot undo transfer of a paid line item' };
    }

    const originalPlayerId = lineItem.originalPlayerId || lineItem.transferredFromPlayerId;
    if (!originalPlayerId) {
      return { success: false, error: 'Original player not found' };
    }

    // Undo the transfer
    await this.prisma.bookingLineItem.update({
      where: { id: lineItemId },
      data: {
        isTransferred: false,
        transferredFromPlayerId: null,
        transferredToPlayerId: null,
        transferredAt: null,
        // Move back to original player
        teeTimePlayerId: originalPlayerId,
      },
    });

    return { success: true };
  }

  /**
   * Get the cart for a specific player/slot
   */
  async getSlotCart(playerId: string): Promise<SlotCart | null> {
    const player = await this.prisma.teeTimePlayer.findUnique({
      where: { id: playerId },
      include: {
        member: true,
        dependent: true,
        lineItems: {
          include: {
            paymentMethod: true,
            transferredFromPlayer: {
              include: { member: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        checkInRecord: true,
        // Items transferred out (where this player was the source)
        itemsTransferredFrom: {
          include: {
            teeTimePlayer: {
              include: { member: true },
            },
          },
        },
      },
    });

    if (!player) {
      return null;
    }

    // Get player name
    const playerName = player.member
      ? `${player.member.firstName} ${player.member.lastName}`
      : player.dependent
        ? `${player.dependent.firstName} ${player.dependent.lastName}`
        : player.guestName || 'Walk-up';

    // Get member info
    const memberId = player.member?.id;
    const memberNumber = player.member?.memberId;

    // Process line items (items in this player's cart)
    const lineItems = player.lineItems.map(item => ({
      id: item.id,
      type: item.type,
      description: item.description,
      baseAmount: Number(item.baseAmount),
      taxType: item.taxType,
      taxRate: Number(item.taxRate),
      taxAmount: Number(item.taxAmount),
      totalAmount: Number(item.totalAmount),
      quantity: item.quantity,
      isPaid: item.isPaid,
      paidAt: item.paidAt ?? undefined,
      paymentMethod: item.paymentMethod?.name,
      isTransferred: item.isTransferred,
      transferredFromPlayerName: item.transferredFromPlayer
        ? item.transferredFromPlayer.member
          ? `${item.transferredFromPlayer.member.firstName} ${item.transferredFromPlayer.member.lastName}`
          : item.transferredFromPlayer.guestName || 'Player'
        : undefined,
    }));

    // Items transferred into this cart from other players
    const transferredInItems = lineItems
      .filter(item => item.isTransferred && item.transferredFromPlayerName)
      .map(item => ({
        lineItemId: item.id,
        description: item.description,
        amount: item.totalAmount,
        fromPlayerId: '', // Would need to include this in the query
        fromPlayerName: item.transferredFromPlayerName || '',
      }));

    // Items transferred out to other players
    const transferredOutItems = player.itemsTransferredFrom.map(item => ({
      lineItemId: item.id,
      description: item.description,
      amount: Number(item.totalAmount),
      fromPlayerId: player.id,
      fromPlayerName: playerName,
      toPlayerId: item.teeTimePlayerId,
      toPlayerName: item.teeTimePlayer.member
        ? `${item.teeTimePlayer.member.firstName} ${item.teeTimePlayer.member.lastName}`
        : item.teeTimePlayer.guestName || 'Player',
    }));

    // Calculate totals (multiply by quantity)
    const subtotal = lineItems.reduce((sum, item) => sum + item.baseAmount * item.quantity, 0);
    const taxTotal = lineItems.reduce((sum, item) => sum + item.taxAmount * item.quantity, 0);
    const grandTotal = lineItems.reduce((sum, item) => sum + item.totalAmount * item.quantity, 0);
    const paidAmount = lineItems
      .filter(item => item.isPaid)
      .reduce((sum, item) => sum + item.totalAmount * item.quantity, 0);
    const balanceDue = grandTotal - paidAmount;

    return {
      playerId: player.id,
      playerName,
      playerType: player.playerType,
      memberId,
      memberNumber,
      lineItems,
      transferredInItems,
      transferredOutItems,
      subtotal,
      taxTotal,
      grandTotal,
      paidAmount,
      balanceDue,
      isCheckedIn: player.checkedIn,
      checkedInAt: player.checkedInAt ?? undefined,
      isSettled: balanceDue <= 0,
    };
  }

  /**
   * Calculate totals for multiple players (for batch payment)
   */
  async calculateBatchTotal(playerIds: string[]): Promise<BatchTotal> {
    const lineItems = await this.prisma.bookingLineItem.findMany({
      where: {
        teeTimePlayerId: { in: playerIds },
        isPaid: false,
      },
    });

    const subtotal = lineItems.reduce((sum, item) => sum + Number(item.baseAmount), 0);
    const taxTotal = lineItems.reduce((sum, item) => sum + Number(item.taxAmount), 0);
    const grandTotal = lineItems.reduce((sum, item) => sum + Number(item.totalAmount), 0);

    return {
      playerIds,
      subtotal,
      taxTotal,
      grandTotal,
      paidAmount: 0, // Only counting unpaid items
      balanceDue: grandTotal,
      lineItemCount: lineItems.length,
    };
  }

  /**
   * Get all carts for a tee time
   */
  async getTeeTimeCarts(teeTimeId: string): Promise<SlotCart[]> {
    const players = await this.prisma.teeTimePlayer.findMany({
      where: { teeTimeId },
      orderBy: { position: 'asc' },
    });

    const carts: SlotCart[] = [];
    for (const player of players) {
      const cart = await this.getSlotCart(player.id);
      if (cart) {
        carts.push(cart);
      }
    }

    return carts;
  }

  /**
   * Get all carts for a tee time with context info (tee time, course, etc.)
   */
  async getTeeTimeCartsWithContext(teeTimeId: string) {
    const teeTime = await this.prisma.teeTime.findUnique({
      where: { id: teeTimeId },
      include: {
        course: true,
      },
    });

    if (!teeTime) {
      throw new NotFoundException(`Tee time ${teeTimeId} not found`);
    }

    const slots = await this.getTeeTimeCarts(teeTimeId);

    // Check if all slots are settled and checked in
    const isFullySettled = slots.every(slot => slot.isSettled);
    const isFullyCheckedIn = slots.every(slot => slot.isCheckedIn);

    // Format tee time for display (e.g., "7:00 AM")
    const timeString = teeTime.teeTime;
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = (hours || 0) >= 12 ? 'PM' : 'AM';
    const displayHours = (hours || 0) % 12 || 12;
    const displayTime = `${displayHours}:${(minutes || 0).toString().padStart(2, '0')} ${period}`;

    return {
      teeTimeId: teeTime.id,
      teeTime: displayTime,
      courseName: teeTime.course.name,
      courseId: teeTime.course.id,
      date: teeTime.teeDate,
      slots,
      isFullySettled,
      isFullyCheckedIn,
    };
  }

  /**
   * Check if all players in a tee time are settled
   */
  async isTeeTimeFullySettled(teeTimeId: string): Promise<boolean> {
    const unpaidItems = await this.prisma.bookingLineItem.findFirst({
      where: {
        teeTimePlayer: { teeTimeId },
        isPaid: false,
      },
    });

    return unpaidItems === null;
  }

  /**
   * Get unpaid line items for specific players
   */
  async getUnpaidLineItems(playerIds: string[]) {
    return this.prisma.bookingLineItem.findMany({
      where: {
        teeTimePlayerId: { in: playerIds },
        isPaid: false,
      },
      include: {
        teeTimePlayer: {
          include: { member: true },
        },
      },
      orderBy: [
        { teeTimePlayerId: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }

  /**
   * Update line item quantity
   */
  async updateLineItemQuantity(
    lineItemId: string,
    quantity: number,
  ): Promise<{ success: boolean; error?: string; lineItem?: any }> {
    if (quantity < 1 || quantity > 99) {
      return { success: false, error: 'Quantity must be between 1 and 99' };
    }

    const lineItem = await this.prisma.bookingLineItem.findUnique({
      where: { id: lineItemId },
    });

    if (!lineItem) {
      return { success: false, error: 'Line item not found' };
    }

    if (lineItem.isPaid) {
      return { success: false, error: 'Cannot modify paid item' };
    }

    if (lineItem.isTransferred) {
      return { success: false, error: 'Cannot modify transferred item' };
    }

    const updated = await this.prisma.bookingLineItem.update({
      where: { id: lineItemId },
      data: { quantity },
    });

    return {
      success: true,
      lineItem: {
        id: updated.id,
        type: updated.type,
        description: updated.description,
        baseAmount: Number(updated.baseAmount),
        taxType: updated.taxType,
        taxRate: Number(updated.taxRate),
        taxAmount: Number(updated.taxAmount),
        totalAmount: Number(updated.totalAmount),
        quantity: updated.quantity,
        isPaid: updated.isPaid,
        isTransferred: updated.isTransferred,
      },
    };
  }

  /**
   * Remove a line item
   */
  async removeLineItem(
    lineItemId: string,
  ): Promise<{ success: boolean; error?: string; removedItem?: any }> {
    const lineItem = await this.prisma.bookingLineItem.findUnique({
      where: { id: lineItemId },
    });

    if (!lineItem) {
      return { success: false, error: 'Line item not found' };
    }

    if (lineItem.isPaid) {
      return { success: false, error: 'Cannot remove paid item' };
    }

    if (lineItem.isTransferred) {
      return { success: false, error: 'Cannot remove transferred item' };
    }

    const removedItem = {
      id: lineItem.id,
      type: lineItem.type,
      description: lineItem.description,
      baseAmount: Number(lineItem.baseAmount),
      taxType: lineItem.taxType,
      taxRate: Number(lineItem.taxRate),
      taxAmount: Number(lineItem.taxAmount),
      totalAmount: Number(lineItem.totalAmount),
      quantity: lineItem.quantity,
      isPaid: lineItem.isPaid,
      isTransferred: lineItem.isTransferred,
      teeTimePlayerId: lineItem.teeTimePlayerId,
      productId: lineItem.productId,
      variantId: lineItem.variantId,
    };

    await this.prisma.bookingLineItem.delete({
      where: { id: lineItemId },
    });

    return { success: true, removedItem };
  }

  /**
   * Bulk remove line items
   */
  async bulkRemoveLineItems(
    lineItemIds: string[],
  ): Promise<{ success: boolean; error?: string; removedCount: number; removedItems: any[] }> {
    const lineItems = await this.prisma.bookingLineItem.findMany({
      where: { id: { in: lineItemIds } },
    });

    // Check for paid or transferred items
    const invalidItems = lineItems.filter(item => item.isPaid || item.isTransferred);
    if (invalidItems.length > 0) {
      return {
        success: false,
        error: 'Cannot remove paid or transferred items',
        removedCount: 0,
        removedItems: [],
      };
    }

    const removedItems = lineItems.map(item => ({
      id: item.id,
      type: item.type,
      description: item.description,
      baseAmount: Number(item.baseAmount),
      taxType: item.taxType,
      taxRate: Number(item.taxRate),
      taxAmount: Number(item.taxAmount),
      totalAmount: Number(item.totalAmount),
      quantity: item.quantity,
      isPaid: item.isPaid,
      isTransferred: item.isTransferred,
    }));

    await this.prisma.bookingLineItem.deleteMany({
      where: { id: { in: lineItemIds } },
    });

    return {
      success: true,
      removedCount: lineItems.length,
      removedItems,
    };
  }

  /**
   * Bulk transfer line items
   */
  async bulkTransferLineItems(
    lineItemIds: string[],
    toPlayerId: string,
    transferredBy: string,
  ): Promise<{ success: boolean; error?: string; transferredCount: number }> {
    const lineItems = await this.prisma.bookingLineItem.findMany({
      where: { id: { in: lineItemIds } },
      include: { teeTimePlayer: true },
    });

    // Check for paid or already transferred items
    const invalidItems = lineItems.filter(item => item.isPaid || item.isTransferred);
    if (invalidItems.length > 0) {
      return {
        success: false,
        error: 'Cannot transfer paid or already transferred items',
        transferredCount: 0,
      };
    }

    // Verify target player exists and is in same tee time
    const toPlayer = await this.prisma.teeTimePlayer.findUnique({
      where: { id: toPlayerId },
    });

    if (!toPlayer) {
      return { success: false, error: 'Target player not found', transferredCount: 0 };
    }

    // All items should be from same tee time
    const teeTimeIds = new Set(lineItems.map(item => item.teeTimePlayer.teeTimeId));
    if (teeTimeIds.size > 1) {
      return { success: false, error: 'Items must be from same tee time', transferredCount: 0 };
    }

    if (lineItems.length === 0) {
      return { success: false, error: 'No items to transfer', transferredCount: 0 };
    }

    const teeTimeId = lineItems[0].teeTimePlayer.teeTimeId;
    if (toPlayer.teeTimeId !== teeTimeId) {
      return { success: false, error: 'Target player must be in same tee time', transferredCount: 0 };
    }

    // Perform bulk transfer - update each item individually to set originalPlayerId
    for (const item of lineItems) {
      await this.prisma.bookingLineItem.update({
        where: { id: item.id },
        data: {
          isTransferred: true,
          transferredFromPlayerId: item.teeTimePlayerId,
          transferredToPlayerId: toPlayerId,
          transferredAt: new Date(),
          originalPlayerId: item.originalPlayerId || item.teeTimePlayerId,
          teeTimePlayerId: toPlayerId,
        },
      });
    }

    return { success: true, transferredCount: lineItems.length };
  }
}
