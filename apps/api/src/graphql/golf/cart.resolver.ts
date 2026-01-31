import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { CartService } from './cart.service';
import { CartDraftService } from './cart-draft.service';
import { PaymentService } from './payment.service';
import { CheckInService } from './checkin.service';
import {
  SlotCartType,
  BatchTotalType,
  TransferResultType,
  CartDraftType,
  BatchPaymentResultType,
  CheckInSlotsResultType,
  TeeTimeCartsType,
  UpdateQuantityResultType,
  RemoveLineItemResultType,
  BulkRemoveResultType,
  BulkTransferResultType,
  PayLineItemsResultType,
} from './golf.types';
import {
  TransferLineItemInput,
  UndoTransferInput,
  BatchPaymentInput,
  CheckInSlotsInput,
  SaveCartDraftInput,
  UpdateLineItemQuantityInput,
  RemoveLineItemInput,
  BulkRemoveLineItemsInput,
  BulkTransferLineItemsInput,
  PayLineItemsInput,
} from './cart.input';

/**
 * Resolver for Shopping Cart operations
 * Implements the slot-based cart model for golf check-in
 */
@Resolver()
@UseGuards(GqlAuthGuard)
export class CartResolver {
  constructor(
    private readonly cartService: CartService,
    private readonly cartDraftService: CartDraftService,
    private readonly paymentService: PaymentService,
    private readonly checkInService: CheckInService,
    private readonly prisma: PrismaService,
  ) {}

  // ============================================================================
  // QUERIES - SLOT CARTS
  // ============================================================================

  @Query(() => SlotCartType, {
    name: 'slotCart',
    description: 'Get cart for a specific player/slot',
    nullable: true,
  })
  async getSlotCart(
    @Args('playerId', { type: () => ID }) playerId: string,
  ): Promise<SlotCartType | null> {
    return this.cartService.getSlotCart(playerId);
  }

  @Query(() => TeeTimeCartsType, {
    name: 'teeTimeCarts',
    description: 'Get all carts for a tee time with context info',
  })
  async getTeeTimeCarts(
    @Args('teeTimeId', { type: () => ID }) teeTimeId: string,
  ): Promise<TeeTimeCartsType> {
    return this.cartService.getTeeTimeCartsWithContext(teeTimeId);
  }

  @Query(() => BatchTotalType, {
    name: 'batchTotal',
    description: 'Calculate totals for multiple players (for batch payment)',
  })
  async getBatchTotal(
    @Args('playerIds', { type: () => [ID] }) playerIds: string[],
  ): Promise<BatchTotalType> {
    return this.cartService.calculateBatchTotal(playerIds);
  }

  @Query(() => Boolean, {
    name: 'isTeeTimeFullySettled',
    description: 'Check if all players in a tee time are settled',
  })
  async isTeeTimeFullySettled(
    @Args('teeTimeId', { type: () => ID }) teeTimeId: string,
  ): Promise<boolean> {
    return this.cartService.isTeeTimeFullySettled(teeTimeId);
  }

  // ============================================================================
  // QUERIES - CART DRAFTS
  // ============================================================================

  @Query(() => CartDraftType, {
    name: 'cartDraft',
    description: 'Get cart draft for a tee time',
    nullable: true,
  })
  async getCartDraft(
    @Args('teeTimeId', { type: () => ID }) teeTimeId: string,
  ): Promise<CartDraftType | null> {
    const draft = await this.cartDraftService.getDraft(teeTimeId);
    if (!draft) return null;
    return {
      id: draft.id,
      teeTimeId: draft.teeTimeId,
      draftData: JSON.stringify(draft.draftData),
      updatedAt: draft.updatedAt,
      createdBy: draft.createdBy,
    };
  }

  @Query(() => Boolean, {
    name: 'hasDraft',
    description: 'Check if a tee time has a cart draft',
  })
  async hasDraft(
    @Args('teeTimeId', { type: () => ID }) teeTimeId: string,
  ): Promise<boolean> {
    return this.cartDraftService.hasDraft(teeTimeId);
  }

  @Query(() => [ID], {
    name: 'teeTimesWithDrafts',
    description: 'Get all tee time IDs with drafts for a specific date',
  })
  async getTeeTimesWithDrafts(
    @GqlCurrentUser() user: JwtPayload,
    @Args('date') date: Date,
  ): Promise<string[]> {
    return this.cartDraftService.getTeeTimesWithDrafts(user.tenantId, date);
  }

  // ============================================================================
  // MUTATIONS - TRANSFERS
  // ============================================================================

  @Mutation(() => TransferResultType, {
    name: 'transferLineItem',
    description: 'Transfer a line item from one player to another',
  })
  async transferLineItem(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: TransferLineItemInput,
  ): Promise<TransferResultType> {
    const result = await this.cartService.transferLineItem({
      ...input,
      transferredBy: user.sub,
    });
    return {
      success: result.success,
      error: result.error,
      lineItemId: result.lineItem?.id,
      isTransferred: result.lineItem?.isTransferred,
      transferredToPlayerId: result.lineItem?.transferredToPlayerId ?? undefined,
    };
  }

  @Mutation(() => TransferResultType, {
    name: 'undoTransfer',
    description: 'Undo a line item transfer',
  })
  async undoTransfer(
    @Args('input') input: UndoTransferInput,
  ): Promise<TransferResultType> {
    const result = await this.cartService.undoTransfer(input.lineItemId);
    return {
      success: result.success,
      error: result.error,
    };
  }

  // ============================================================================
  // MUTATIONS - BATCH PAYMENT
  // ============================================================================

  @Mutation(() => BatchPaymentResultType, {
    name: 'processBatchPayment',
    description: 'Process payment for multiple players at once',
  })
  async processBatchPayment(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: BatchPaymentInput,
  ): Promise<BatchPaymentResultType> {
    try {
      // Get unpaid line items for the selected players
      const unpaidItems = await this.cartService.getUnpaidLineItems(input.playerIds);

      if (unpaidItems.length === 0) {
        return {
          success: false,
          error: 'No unpaid items found for selected players',
        };
      }

      // Filter to specific line items if provided
      let lineItemsToProcess = unpaidItems;
      if (input.lineItemIds && input.lineItemIds.length > 0) {
        lineItemsToProcess = unpaidItems.filter(item =>
          input.lineItemIds!.includes(item.id),
        );
      }

      const totalAmount = lineItemsToProcess.reduce(
        (sum, item) => sum + Number(item.totalAmount),
        0,
      );

      // Process payment
      const paymentResult = await this.paymentService.processPayment({
        clubId: user.tenantId,
        teeTimeId: input.teeTimeId,
        lineItemIds: lineItemsToProcess.map(item => item.id),
        amount: totalAmount,
        paymentMethodId: input.paymentMethodId,
        reference: input.reference,
        paidBy: user.sub,
      });

      // Get updated cart info for each player
      const processedSlots = await Promise.all(
        input.playerIds.map(async playerId => {
          const cart = await this.cartService.getSlotCart(playerId);
          return {
            playerId,
            amountPaid: cart ? cart.paidAmount : 0,
            newBalance: cart ? cart.balanceDue : 0,
            isSettled: cart ? cart.isSettled : false,
          };
        }),
      );

      return {
        success: true,
        transactionId: paymentResult.transactionId,
        processedSlots,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  // ============================================================================
  // MUTATIONS - CHECK-IN
  // ============================================================================

  @Mutation(() => CheckInSlotsResultType, {
    name: 'checkInSlots',
    description: 'Check in multiple players at once',
  })
  async checkInSlots(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CheckInSlotsInput,
  ): Promise<CheckInSlotsResultType> {
    try {
      // Check all selected players are settled
      for (const playerId of input.playerIds) {
        const cart = await this.cartService.getSlotCart(playerId);
        if (cart && cart.balanceDue > 0) {
          return {
            success: false,
            error: `Player ${cart.playerName} has an outstanding balance of $${cart.balanceDue.toFixed(2)}`,
          };
        }
      }

      // Use existing check-in service for flight check-in
      // Map playerIds to the players format expected by checkInFlight
      const result = await this.checkInService.checkInFlight(
        user.tenantId,
        user.sub,
        {
          teeTimeId: input.teeTimeId,
          players: input.playerIds.map(playerId => ({
            playerId,
            skipPaymentValidation: true, // We already validated above
          })),
          notes: input.notes,
        },
      );

      // Clear the draft if check-in succeeded
      if (result.success) {
        await this.cartDraftService.clearDraft(input.teeTimeId);
      }

      return {
        success: result.success,
        checkedInSlots: result.players?.map(p => ({
          playerId: p.playerId,
          checkedInAt: result.checkedInAt, // Use the flight check-in time
          error: p.error,
        })),
        ticketId: result.ticketId,
        ticketNumber: result.ticketNumber,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Check-in failed',
      };
    }
  }

  // ============================================================================
  // MUTATIONS - QUANTITY & REMOVE
  // ============================================================================

  @Mutation(() => UpdateQuantityResultType, {
    name: 'updateLineItemQuantity',
    description: 'Update line item quantity',
  })
  async updateLineItemQuantity(
    @Args('input') input: UpdateLineItemQuantityInput,
  ): Promise<UpdateQuantityResultType> {
    return this.cartService.updateLineItemQuantity(input.lineItemId, input.quantity);
  }

  @Mutation(() => RemoveLineItemResultType, {
    name: 'removeLineItem',
    description: 'Remove a line item from cart',
  })
  async removeLineItem(
    @Args('input') input: RemoveLineItemInput,
  ): Promise<RemoveLineItemResultType> {
    return this.cartService.removeLineItem(input.lineItemId);
  }

  @Mutation(() => BulkRemoveResultType, {
    name: 'bulkRemoveLineItems',
    description: 'Remove multiple line items',
  })
  async bulkRemoveLineItems(
    @Args('input') input: BulkRemoveLineItemsInput,
  ): Promise<BulkRemoveResultType> {
    return this.cartService.bulkRemoveLineItems(input.lineItemIds);
  }

  @Mutation(() => BulkTransferResultType, {
    name: 'bulkTransferLineItems',
    description: 'Transfer multiple line items to another player',
  })
  async bulkTransferLineItems(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: BulkTransferLineItemsInput,
  ): Promise<BulkTransferResultType> {
    return this.cartService.bulkTransferLineItems(
      input.lineItemIds,
      input.toPlayerId,
      user.sub,
    );
  }

  @Mutation(() => PayLineItemsResultType, {
    name: 'payLineItems',
    description: 'Pay specific line items',
  })
  async payLineItems(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: PayLineItemsInput,
  ): Promise<PayLineItemsResultType> {
    try {
      // Get line items by IDs
      const lineItems = await this.prisma.bookingLineItem.findMany({
        where: {
          id: { in: input.lineItemIds },
          isPaid: false,
        },
        include: {
          teeTimePlayer: true,
        },
      });

      if (lineItems.length === 0) {
        return { success: false, error: 'No unpaid items found', paidCount: 0, totalPaid: 0 };
      }

      const totalAmount = lineItems.reduce(
        (sum, item) => sum + Number(item.totalAmount) * (item.quantity || 1),
        0,
      );

      const teeTimeId = lineItems[0].teeTimePlayer.teeTimeId;

      const paymentResult = await this.paymentService.processPayment({
        clubId: user.tenantId,
        teeTimeId,
        lineItemIds: input.lineItemIds,
        amount: totalAmount,
        paymentMethodId: input.paymentMethodId,
        reference: input.reference,
        paidBy: user.sub,
      });

      return {
        success: true,
        transactionId: paymentResult.transactionId,
        paidCount: lineItems.length,
        totalPaid: totalAmount,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
        paidCount: 0,
        totalPaid: 0,
      };
    }
  }

  // ============================================================================
  // MUTATIONS - CART DRAFTS
  // ============================================================================

  @Mutation(() => CartDraftType, {
    name: 'saveCartDraft',
    description: 'Save cart draft for a tee time',
  })
  async saveCartDraft(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: SaveCartDraftInput,
  ): Promise<CartDraftType> {
    // Parse the JSON string to object
    const draftData = JSON.parse(input.draftData);
    const draft = await this.cartDraftService.saveDraft(
      input.teeTimeId,
      draftData,
      user.sub,
    );
    return {
      id: draft.id,
      teeTimeId: draft.teeTimeId,
      draftData: JSON.stringify(draft.draftData),
      updatedAt: draft.updatedAt,
      createdBy: draft.createdBy,
    };
  }

  @Mutation(() => Boolean, {
    name: 'clearCartDraft',
    description: 'Clear cart draft for a tee time',
  })
  async clearCartDraft(
    @Args('teeTimeId', { type: () => ID }) teeTimeId: string,
  ): Promise<boolean> {
    return this.cartDraftService.clearDraft(teeTimeId);
  }
}
