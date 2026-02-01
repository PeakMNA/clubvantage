import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/shared/prisma/prisma.service';
import { TaxCalculatorService } from '@/shared/tax';
import { PaymentService } from './payment.service';
import {
  FlightCheckInInfoType,
  CheckInPlayerInfoType,
  CheckInPlayerType,
  PaymentStatus,
  PlayerPaymentInfoType,
  BookingLineItemType,
  TaxType,
  LineItemType,
  SettlementResultType,
  PlayerSettlementResultType,
  CheckInResultType,
  PlayerCheckInResultType,
  StarterTicketResponseType,
  StarterTicketPlayerType,
  FlightPaymentSummaryType,
  CheckInAuditEntryType,
  DailyCheckInReportType,
} from './golf.types';
import {
  AddLineItemInput,
  ProcessSettlementInput,
  CheckInFlightInput,
  UndoCheckInInput,
  GenerateTicketInput,
  CheckInAllPlayersInput,
  SettleAllPlayersInput,
  CheckInHistoryFilterInput,
} from './checkin.input';

@Injectable()
export class CheckInService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly taxCalculator: TaxCalculatorService,
    private readonly paymentService: PaymentService,
  ) {}

  // ============================================================================
  // FLIGHT CHECK-IN INFO
  // ============================================================================

  async getFlightCheckInInfo(teeTimeId: string): Promise<FlightCheckInInfoType> {
    const teeTime = await this.prisma.teeTime.findUnique({
      where: { id: teeTimeId },
      include: {
        course: true,
        players: {
          include: {
            member: true,
            dependent: { include: { member: true } },
            lineItems: { include: { paymentMethod: true } },
            checkInRecord: { include: { settledVia: true } },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!teeTime) {
      throw new NotFoundException('Tee time not found');
    }

    const players: CheckInPlayerInfoType[] = await Promise.all(
      teeTime.players.map(async (player) => {
        const playerInfo = this.getPlayerInfo(player);
        const rawLineItems = player.lineItems || [];

        // Transform line items to API type
        const lineItems: BookingLineItemType[] = rawLineItems.map((item) => ({
          id: item.id,
          type: item.type as LineItemType,
          description: item.description,
          baseAmount: Number(item.baseAmount),
          taxType: item.taxType as TaxType,
          taxRate: Number(item.taxRate),
          taxAmount: Number(item.taxAmount),
          totalAmount: Number(item.totalAmount),
          isPaid: item.isPaid,
          paidAt: item.paidAt || undefined,
          paymentMethod: (item as any).paymentMethod?.name || undefined,
          reference: item.reference || undefined,
          productId: item.productId || undefined,
          variantId: item.variantId || undefined,
        }));

        const totalDue = lineItems.reduce((sum, item) => sum + item.totalAmount, 0);
        const totalPaid = lineItems
          .filter((item) => item.isPaid)
          .reduce((sum, item) => sum + item.totalAmount, 0);
        const balanceDue = totalDue - totalPaid;

        // Determine payment status based on line items
        let paymentStatus: PaymentStatus;
        if (lineItems.length === 0) {
          paymentStatus = PaymentStatus.NO_CHARGES; // No charges added yet
        } else if (balanceDue <= 0) {
          paymentStatus = PaymentStatus.PREPAID; // All items paid
        } else if (totalPaid > 0) {
          paymentStatus = PaymentStatus.PARTIAL; // Some items paid
        } else {
          paymentStatus = PaymentStatus.UNPAID; // Nothing paid yet
        }

        let isSuspended = false;
        let suspensionReason: string | undefined;

        if (player.member) {
          const memberStatus = await this.prisma.member.findUnique({
            where: { id: player.member.id },
            select: { status: true },
          });
          isSuspended = memberStatus?.status === 'SUSPENDED';
          if (isSuspended) {
            suspensionReason = 'Account suspended';
          }
        }

        return {
          id: player.id,
          name: playerInfo.name,
          type: playerInfo.type,
          memberNumber: playerInfo.memberNumber,
          isCheckedIn: !!player.checkInRecord?.checkedInAt,
          checkedInAt: player.checkInRecord?.checkedInAt || undefined,
          isSuspended,
          suspensionReason,
          paymentStatus,
          totalDue,
          totalPaid,
          balanceDue,
          lineItems,
        };
      }),
    );

    return {
      id: teeTime.id,
      teeTime: teeTime.teeDate,
      course: teeTime.course?.name || 'Unknown',
      startingHole: teeTime.startingHole,
      cartNumber: undefined,
      caddyAssignment: undefined,
      players,
    };
  }

  // ============================================================================
  // PLAYER PAYMENT INFO
  // ============================================================================

  async getPlayerPaymentInfo(playerId: string): Promise<PlayerPaymentInfoType> {
    const player = await this.prisma.teeTimePlayer.findUnique({
      where: { id: playerId },
      include: {
        member: true,
        dependent: { include: { member: true } },
        lineItems: { include: { paymentMethod: true }, orderBy: { createdAt: 'asc' } },
        checkInRecord: { include: { settledVia: true } },
      },
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    const playerInfo = this.getPlayerInfo(player);
    const lineItems: BookingLineItemType[] = (player.lineItems || []).map((item) => ({
      id: item.id,
      type: item.type as LineItemType,
      description: item.description,
      baseAmount: Number(item.baseAmount),
      taxType: item.taxType as TaxType,
      taxRate: Number(item.taxRate),
      taxAmount: Number(item.taxAmount),
      totalAmount: Number(item.totalAmount),
      isPaid: item.isPaid,
      paidAt: item.paidAt || undefined,
      paymentMethod: item.paymentMethod?.name || undefined,
      reference: item.reference || undefined,
      productId: item.productId || undefined,
      variantId: item.variantId || undefined,
    }));

    const subtotal = lineItems.reduce((sum, item) => sum + item.baseAmount, 0);
    const totalTax = lineItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const grandTotal = lineItems.reduce((sum, item) => sum + item.totalAmount, 0);
    const paidOnline = lineItems
      .filter((item) => item.isPaid && item.paymentMethod?.toLowerCase().includes('online'))
      .reduce((sum, item) => sum + item.totalAmount, 0);
    const totalPaidAmount = lineItems
      .filter((item) => item.isPaid)
      .reduce((sum, item) => sum + item.totalAmount, 0);
    const balanceDue = grandTotal - totalPaidAmount;

    return {
      playerId: player.id,
      playerName: playerInfo.name,
      playerType: playerInfo.type,
      memberNumber: playerInfo.memberNumber,
      lineItems,
      subtotal,
      totalTax,
      grandTotal,
      paidOnline,
      balanceDue,
      isSettled: balanceDue <= 0,
      settledAt: player.checkInRecord?.settledAt || undefined,
      settledVia: player.checkInRecord?.settledVia?.name || undefined,
      settledBy: player.checkInRecord?.settledBy || undefined,
    };
  }

  // ============================================================================
  // LINE ITEM MANAGEMENT
  // ============================================================================

  async addLineItem(clubId: string, input: AddLineItemInput): Promise<BookingLineItemType> {
    const player = await this.prisma.teeTimePlayer.findUnique({
      where: { id: input.playerId },
      include: { teeTime: true },
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    const settings = await this.prisma.clubGolfSettings.findUnique({
      where: { clubId },
    });

    let taxRate = input.taxRate ?? Number(settings?.defaultTaxRate) ?? 7;
    let taxType = input.taxType ?? (settings?.defaultTaxType as TaxType) ?? TaxType.ADD;

    const { taxAmount, totalAmount } = this.taxCalculator.calculateTax(
      input.baseAmount,
      taxType,
      taxRate,
    );

    const lineItem = await this.prisma.bookingLineItem.create({
      data: {
        teeTimePlayer: { connect: { id: input.playerId } },
        type: input.type,
        description: input.description,
        baseAmount: input.baseAmount,
        taxType,
        taxRate,
        taxAmount,
        totalAmount,
        isPaid: false,
        ...(input.productId && { product: { connect: { id: input.productId } } }),
        ...(input.variantId && { variant: { connect: { id: input.variantId } } }),
      },
      include: { paymentMethod: true },
    });

    return {
      id: lineItem.id,
      type: lineItem.type as LineItemType,
      description: lineItem.description,
      baseAmount: Number(lineItem.baseAmount),
      taxType: lineItem.taxType as TaxType,
      taxRate: Number(lineItem.taxRate),
      taxAmount: Number(lineItem.taxAmount),
      totalAmount: Number(lineItem.totalAmount),
      isPaid: lineItem.isPaid,
      paidAt: lineItem.paidAt || undefined,
      paymentMethod: lineItem.paymentMethod?.name || undefined,
      reference: lineItem.reference || undefined,
      productId: lineItem.productId || undefined,
      variantId: lineItem.variantId || undefined,
    };
  }

  async removeLineItem(lineItemId: string): Promise<boolean> {
    const lineItem = await this.prisma.bookingLineItem.findUnique({
      where: { id: lineItemId },
    });

    if (!lineItem) {
      throw new NotFoundException('Line item not found');
    }

    if (lineItem.isPaid) {
      throw new BadRequestException('Cannot remove a paid line item');
    }

    await this.prisma.bookingLineItem.delete({ where: { id: lineItemId } });
    return true;
  }

  // ============================================================================
  // SETTLEMENT
  // ============================================================================

  async processSettlement(
    clubId: string,
    userId: string,
    input: ProcessSettlementInput,
  ): Promise<SettlementResultType> {
    const results: PlayerSettlementResultType[] = [];

    for (const payment of input.payments) {
      try {
        // Get player's unpaid line items
        const player = await this.prisma.teeTimePlayer.findUnique({
          where: { id: payment.playerId },
          include: { lineItems: true },
        });

        if (!player) {
          results.push({
            playerId: payment.playerId,
            amountPaid: 0,
            success: false,
            error: 'Player not found',
          });
          continue;
        }

        const unpaidLineItems = player.lineItems.filter((item) => !item.isPaid);
        const lineItemIds = payment.lineItemIds || unpaidLineItems.map((i) => i.id);
        const totalAmount = unpaidLineItems
          .filter((i) => lineItemIds.includes(i.id))
          .reduce((sum, i) => sum + Number(i.totalAmount), 0);

        if (lineItemIds.length === 0 || totalAmount === 0) {
          results.push({
            playerId: payment.playerId,
            amountPaid: 0,
            success: true,
            error: undefined,
          });
          continue;
        }

        // Check for partial payment setting
        if (payment.amount < totalAmount) {
          const settings = await this.prisma.clubGolfSettings.findUnique({
            where: { clubId },
          });

          if (!settings?.allowPartialPayment) {
            results.push({
              playerId: payment.playerId,
              amountPaid: 0,
              success: false,
              error: 'Partial payment not allowed',
            });
            continue;
          }
        }

        // Use PaymentService to process payment
        const result = await this.paymentService.processPayment({
          clubId,
          teeTimeId: input.teeTimeId,
          lineItemIds,
          amount: payment.amount,
          paymentMethodId: input.paymentMethodId,
          reference: input.reference,
          paidBy: userId,
        });

        // Update player check-in record with settlement info
        await this.prisma.playerCheckInRecord.upsert({
          where: { teeTimePlayerId: payment.playerId },
          create: {
            teeTimePlayer: { connect: { id: payment.playerId } },
            checkedInBy: userId,
            settledAt: result.settledAt,
            settledVia: { connect: { id: input.paymentMethodId } },
            settledBy: userId,
            totalPaid: result.amount,
          },
          update: {
            settledAt: result.settledAt,
            settledVia: { connect: { id: input.paymentMethodId } },
            settledBy: userId,
            totalPaid: { increment: result.amount },
          },
        });

        results.push({
          playerId: payment.playerId,
          amountPaid: result.amount,
          success: result.success,
          error: undefined,
        });
      } catch (error) {
        results.push({
          playerId: payment.playerId,
          amountPaid: 0,
          success: false,
          error: error.message,
        });
      }
    }

    const allSuccess = results.every((r) => r.success);
    const firstSuccessfulResult = results.find((r) => r.success);

    return {
      success: allSuccess,
      transactionId: firstSuccessfulResult ? 'See transaction history' : undefined,
      settledAt: new Date(),
      settledBy: userId,
      error: allSuccess ? undefined : 'Some settlements failed',
      players: results,
    };
  }

  // ============================================================================
  // CHECK-IN
  // ============================================================================

  async checkInFlight(
    clubId: string,
    userId: string,
    input: CheckInFlightInput,
  ): Promise<CheckInResultType> {
    const teeTime = await this.prisma.teeTime.findUnique({
      where: { id: input.teeTimeId },
      include: {
        course: true,
        players: {
          include: {
            member: true,
            dependent: { include: { member: true } },
            lineItems: true,
            checkInRecord: true,
          },
        },
      },
    });

    if (!teeTime) {
      throw new NotFoundException('Tee time not found');
    }

    const settings = await this.prisma.clubGolfSettings.findUnique({
      where: { clubId },
    });

    const checkedInAt = new Date();
    const results: PlayerCheckInResultType[] = [];

    for (const playerInput of input.players) {
      const player = teeTime.players.find((p) => p.id === playerInput.playerId);
      if (!player) {
        results.push({
          playerId: playerInput.playerId,
          checkedIn: false,
          error: 'Player not found',
        });
        continue;
      }

      if (player.checkInRecord?.checkedInAt) {
        results.push({
          playerId: playerInput.playerId,
          checkedIn: true,
          error: 'Already checked in',
        });
        continue;
      }

      if (settings?.blockSuspendedMembers && player.member) {
        const memberStatus = await this.prisma.member.findUnique({
          where: { id: player.member.id },
          select: { status: true },
        });
        if (memberStatus?.status === 'SUSPENDED') {
          results.push({
            playerId: playerInput.playerId,
            checkedIn: false,
            error: 'Member account is suspended',
          });
          continue;
        }
      }

      if (!playerInput.skipPaymentValidation && settings?.requireAllItemsPaid) {
        const lineItems = player.lineItems || [];
        const unpaidAmount = lineItems
          .filter((item) => !item.isPaid)
          .reduce((sum, item) => sum + Number(item.totalAmount), 0);

        if (unpaidAmount > 0) {
          results.push({
            playerId: playerInput.playerId,
            checkedIn: false,
            error: `Outstanding balance: ${unpaidAmount.toFixed(2)}`,
          });
          continue;
        }
      }

      await this.prisma.playerCheckInRecord.upsert({
        where: { teeTimePlayerId: playerInput.playerId },
        create: {
          teeTimePlayer: { connect: { id: playerInput.playerId } },
          checkedInAt,
          checkedInBy: userId,
          notes: input.notes,
        },
        update: {
          checkedInAt,
          checkedInBy: userId,
          notes: input.notes,
        },
      });

      await this.prisma.teeTimePlayer.update({
        where: { id: playerInput.playerId },
        data: { checkedInAt },
      });

      results.push({
        playerId: playerInput.playerId,
        checkedIn: true,
      });
    }

    const allCheckedIn = results.every((r) => r.checkedIn);
    if (allCheckedIn && results.length === teeTime.players.length) {
      await this.prisma.teeTime.update({
        where: { id: input.teeTimeId },
        data: { status: 'CHECKED_IN' },
      });
    }

    let ticketId: string | undefined;
    let ticketNumber: string | undefined;

    if (input.generateTicket && allCheckedIn) {
      const ticket = await this.generateStarterTicket(clubId, userId, {
        teeTimeId: input.teeTimeId,
        forceRegenerate: false,
      });
      ticketId = ticket.id;
      ticketNumber = ticket.ticketNumber;
    }

    return {
      success: allCheckedIn,
      checkedInAt,
      checkedInBy: userId,
      players: results,
      ticketId,
      ticketNumber,
    };
  }

  async undoCheckIn(userId: string, input: UndoCheckInInput): Promise<boolean> {
    const player = await this.prisma.teeTimePlayer.findUnique({
      where: { id: input.playerId },
      include: { checkInRecord: true },
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    if (!player.checkInRecord?.checkedInAt) {
      throw new BadRequestException('Player is not checked in');
    }

    await this.prisma.teeTimePlayer.update({
      where: { id: input.playerId },
      data: { checkedInAt: null },
    });

    await this.prisma.playerCheckInRecord.delete({
      where: { teeTimePlayerId: input.playerId },
    });

    return true;
  }

  // ============================================================================
  // STARTER TICKET
  // ============================================================================

  async generateStarterTicket(
    clubId: string,
    userId: string,
    input: GenerateTicketInput,
  ): Promise<StarterTicketResponseType> {
    const teeTime = await this.prisma.teeTime.findUnique({
      where: { id: input.teeTimeId },
      include: {
        course: true,
        players: {
          include: {
            member: true,
            dependent: { include: { member: true } },
            caddy: true,
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!teeTime) {
      throw new NotFoundException('Tee time not found');
    }

    // Check if ticket already exists
    const existingTicket = await this.prisma.starterTicket.findFirst({
      where: { teeTimeId: input.teeTimeId },
    });

    if (existingTicket && !input.forceRegenerate) {
      return this.mapToTicketResponse(existingTicket);
    }

    // Build player data for denormalized storage
    const players = teeTime.players.map((p) => {
      const info = this.getPlayerInfo(p);
      return {
        name: info.name,
        memberNumber: info.memberNumber,
        type: info.type,
      };
    });

    // Collect caddy names
    const caddyNames = teeTime.players
      .filter((p) => p.caddy)
      .map((p) => `${p.caddy!.firstName} ${p.caddy!.lastName}`)
      .filter((name, index, arr) => arr.indexOf(name) === index);

    // Collect rental items
    const rentalItems = teeTime.players
      .filter((p) => p.rentalRequest)
      .map((p) => p.rentalRequest!)
      .filter((item, index, arr) => arr.indexOf(item) === index);

    // Get cart number
    const cartNumber = teeTime.players.find((p) => p.cartRequest)?.cartRequest;

    const ticketNumber = `ST-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Date.now().toString(36).toUpperCase()}`;

    if (existingTicket && input.forceRegenerate) {
      // Update existing ticket
      const ticket = await this.prisma.starterTicket.update({
        where: { id: existingTicket.id },
        data: {
          ticketNumber,
          teeTimeValue: teeTime.teeDate,
          course: teeTime.course?.name || 'Unknown',
          startingHole: teeTime.startingHole,
          players: players as any,
          cartNumber,
          caddyName: caddyNames.length > 0 ? caddyNames.join(', ') : null,
          rentalItems,
          specialRequests: teeTime.notes,
          qrCodeData: `TKT:${ticketNumber}`,
          generatedAt: new Date(),
          generatedBy: userId,
        },
      });
      return this.mapToTicketResponse(ticket);
    }

    // Create new ticket
    const ticket = await this.prisma.starterTicket.create({
      data: {
        club: { connect: { id: clubId } },
        teeTime: { connect: { id: input.teeTimeId } },
        ticketNumber,
        teeTimeValue: teeTime.teeDate,
        course: teeTime.course?.name || 'Unknown',
        startingHole: teeTime.startingHole,
        players: players as any,
        cartNumber,
        caddyName: caddyNames.length > 0 ? caddyNames.join(', ') : null,
        rentalItems,
        specialRequests: teeTime.notes,
        qrCodeData: `TKT:${ticketNumber}`,
        generatedAt: new Date(),
        generatedBy: userId,
        reprintCount: 0,
      },
    });

    return this.mapToTicketResponse(ticket);
  }

  async markTicketPrinted(ticketId: string): Promise<StarterTicketResponseType> {
    const ticket = await this.prisma.starterTicket.update({
      where: { id: ticketId },
      data: {
        printedAt: new Date(),
        reprintCount: { increment: 1 },
      },
    });

    return this.mapToTicketResponse(ticket);
  }

  async getStarterTicket(ticketId: string): Promise<StarterTicketResponseType | null> {
    const ticket = await this.prisma.starterTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) return null;
    return this.mapToTicketResponse(ticket);
  }

  async getStarterTicketByTeeTime(teeTimeId: string): Promise<StarterTicketResponseType | null> {
    const ticket = await this.prisma.starterTicket.findFirst({
      where: { teeTimeId },
    });

    if (!ticket) return null;
    return this.mapToTicketResponse(ticket);
  }

  // ============================================================================
  // FLIGHT SUMMARY (Phase 6)
  // ============================================================================

  async getFlightPaymentSummary(teeTimeId: string): Promise<FlightPaymentSummaryType> {
    const teeTime = await this.prisma.teeTime.findUnique({
      where: { id: teeTimeId },
      include: {
        course: true,
        players: {
          include: {
            lineItems: true,
            checkInRecord: true,
          },
        },
      },
    });

    if (!teeTime) {
      throw new NotFoundException('Tee time not found');
    }

    const totalPlayers = teeTime.players.length;
    let checkedInCount = 0;
    let settledCount = 0;
    let totalDue = 0;
    let totalPaid = 0;

    for (const player of teeTime.players) {
      if (player.checkInRecord?.checkedInAt) {
        checkedInCount++;
      }
      if (player.checkInRecord?.settledAt) {
        settledCount++;
      }

      const lineItems = player.lineItems || [];
      totalDue += lineItems.reduce((sum, item) => sum + Number(item.totalAmount), 0);
      totalPaid += lineItems
        .filter((item) => item.isPaid)
        .reduce((sum, item) => sum + Number(item.totalAmount), 0);
    }

    return {
      teeTimeId: teeTime.id,
      teeTime: teeTime.teeDate,
      course: teeTime.course?.name || 'Unknown',
      totalPlayers,
      checkedInCount,
      settledCount,
      totalDue,
      totalPaid,
      totalBalance: totalDue - totalPaid,
      isFullyCheckedIn: checkedInCount === totalPlayers,
      isFullySettled: settledCount === totalPlayers,
    };
  }

  // ============================================================================
  // BATCH OPERATIONS (Phase 6)
  // ============================================================================

  async checkInAllPlayers(
    clubId: string,
    userId: string,
    input: CheckInAllPlayersInput,
  ): Promise<CheckInResultType> {
    const teeTime = await this.prisma.teeTime.findUnique({
      where: { id: input.teeTimeId },
      include: {
        players: { include: { checkInRecord: true } },
      },
    });

    if (!teeTime) {
      throw new NotFoundException('Tee time not found');
    }

    const players = teeTime.players
      .filter((p) => !p.checkInRecord?.checkedInAt)
      .map((p) => ({
        playerId: p.id,
        skipPaymentValidation: input.skipPaymentValidation,
      }));

    if (players.length === 0) {
      return {
        success: true,
        checkedInAt: new Date(),
        checkedInBy: userId,
        players: teeTime.players.map((p) => ({
          playerId: p.id,
          checkedIn: true,
          error: 'Already checked in',
        })),
      };
    }

    return this.checkInFlight(clubId, userId, {
      teeTimeId: input.teeTimeId,
      players,
      cartNumber: input.cartNumber,
      notes: input.notes,
      generateTicket: true,
    });
  }

  async settleAllPlayers(
    clubId: string,
    userId: string,
    input: SettleAllPlayersInput,
  ): Promise<SettlementResultType> {
    const teeTime = await this.prisma.teeTime.findUnique({
      where: { id: input.teeTimeId },
      include: {
        players: {
          include: {
            lineItems: true,
            checkInRecord: true,
          },
        },
      },
    });

    if (!teeTime) {
      throw new NotFoundException('Tee time not found');
    }

    const payments = teeTime.players
      .filter((p) => !p.checkInRecord?.settledAt)
      .map((p) => {
        const lineItems = p.lineItems || [];
        const unpaidLineItems = lineItems.filter((item) => !item.isPaid);
        const unpaidAmount = unpaidLineItems.reduce(
          (sum, item) => sum + Number(item.totalAmount),
          0,
        );

        return {
          playerId: p.id,
          amount: unpaidAmount,
          lineItemIds: unpaidLineItems.map((item) => item.id),
        };
      })
      .filter((p) => p.amount > 0);

    if (payments.length === 0) {
      return {
        success: true,
        transactionId: undefined,
        settledAt: new Date(),
        settledBy: userId,
        players: teeTime.players.map((p) => ({
          playerId: p.id,
          amountPaid: 0,
          success: true,
          error: 'Already settled',
        })),
      };
    }

    return this.processSettlement(clubId, userId, {
      teeTimeId: input.teeTimeId,
      payments,
      paymentMethodId: input.paymentMethodId,
      reference: input.reference,
    });
  }

  // ============================================================================
  // AUDIT / HISTORY (Phase 6)
  // ============================================================================

  async getCheckInHistory(
    clubId: string,
    filter: CheckInHistoryFilterInput,
  ): Promise<CheckInAuditEntryType[]> {
    const where: any = {};

    if (filter.teeTimeId) {
      where.teeTimePlayer = { teeTimeId: filter.teeTimeId };
    }

    if (filter.playerId) {
      where.teeTimePlayerId = filter.playerId;
    }

    const records = await this.prisma.playerCheckInRecord.findMany({
      where,
      take: filter.limit || 50,
      orderBy: { checkedInAt: 'desc' },
      include: {
        teeTimePlayer: {
          include: {
            member: true,
            dependent: true,
            teeTime: true,
          },
        },
        settledVia: true,
      },
    });

    return records.map((record) => {
      const playerInfo = this.getPlayerInfo(record.teeTimePlayer);

      let action = 'check_in';
      if (record.settledAt) {
        action = 'settlement';
      }

      return {
        id: record.id,
        action,
        teeTimeId: record.teeTimePlayer.teeTimeId,
        playerId: record.teeTimePlayerId,
        playerName: playerInfo.name,
        performedBy: record.checkedInBy || record.settledBy || 'system',
        performedAt: record.checkedInAt || record.createdAt,
        details: record.notes || undefined,
        amount: record.totalPaid ? Number(record.totalPaid) : undefined,
      };
    });
  }

  async getDailyCheckInReport(
    clubId: string,
    courseId: string,
    date: Date,
  ): Promise<DailyCheckInReportType> {
    const course = await this.prisma.golfCourse.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const teeTimes = await this.prisma.teeTime.findMany({
      where: {
        courseId,
        teeDate: { gte: startOfDay, lte: endOfDay },
        status: { not: 'CANCELLED' },
      },
      include: {
        players: {
          include: {
            lineItems: { include: { paymentMethod: true } },
            checkInRecord: true,
          },
        },
      },
      orderBy: { teeTime: 'asc' },
    });

    let totalPlayers = 0;
    let checkedInPlayers = 0;
    let noShowPlayers = 0;
    let totalRevenue = 0;
    let totalCash = 0;
    let totalCard = 0;
    let totalTransfer = 0;
    let totalAccount = 0;

    const flights: FlightPaymentSummaryType[] = [];

    for (const teeTime of teeTimes) {
      const flightPlayers = teeTime.players.length;
      let flightCheckedIn = 0;
      let flightSettled = 0;
      let flightDue = 0;
      let flightPaid = 0;

      for (const player of teeTime.players) {
        totalPlayers++;

        if (player.checkInRecord?.checkedInAt) {
          checkedInPlayers++;
          flightCheckedIn++;
        }

        if (player.checkInRecord?.settledAt) {
          flightSettled++;
        }

        const lineItems = player.lineItems || [];
        for (const item of lineItems) {
          flightDue += Number(item.totalAmount);
          if (item.isPaid) {
            const paidAmount = Number(item.totalAmount);
            flightPaid += paidAmount;
            totalRevenue += paidAmount;

            const method = (item.paymentMethod?.name || '').toLowerCase();
            if (method.includes('cash')) {
              totalCash += paidAmount;
            } else if (method.includes('card')) {
              totalCard += paidAmount;
            } else if (method.includes('transfer') || method.includes('qr')) {
              totalTransfer += paidAmount;
            } else if (method.includes('account') || method.includes('member')) {
              totalAccount += paidAmount;
            }
          }
        }
      }

      const teeTimeDate = new Date(teeTime.teeDate);
      const [hours, minutes] = teeTime.teeTime.split(':').map(Number);
      teeTimeDate.setHours(hours, minutes + 30, 0, 0);
      if (new Date() > teeTimeDate && flightCheckedIn < flightPlayers) {
        noShowPlayers += flightPlayers - flightCheckedIn;
      }

      flights.push({
        teeTimeId: teeTime.id,
        teeTime: teeTime.teeDate,
        course: course.name,
        totalPlayers: flightPlayers,
        checkedInCount: flightCheckedIn,
        settledCount: flightSettled,
        totalDue: flightDue,
        totalPaid: flightPaid,
        totalBalance: flightDue - flightPaid,
        isFullyCheckedIn: flightCheckedIn === flightPlayers,
        isFullySettled: flightSettled === flightPlayers,
      });
    }

    return {
      date,
      course: course.name,
      totalFlights: teeTimes.length,
      totalPlayers,
      checkedInPlayers,
      noShowPlayers,
      totalRevenue,
      totalCash,
      totalCard,
      totalTransfer,
      totalAccount,
      flights,
    };
  }

  // ============================================================================
  // TRANSACTION HISTORY (Phase 6)
  // ============================================================================

  async getTransactionHistory(
    clubId: string,
    teeTimeId?: string,
    playerId?: string,
  ) {
    return this.paymentService.getTransactionHistory({
      clubId,
      teeTimeId,
      playerId,
    });
  }

  // ============================================================================
  // PRIVATE HELPERS
  // ============================================================================

  private getPlayerInfo(player: any): {
    name: string;
    type: CheckInPlayerType;
    memberNumber?: string;
  } {
    if (player.member) {
      return {
        name: `${player.member.firstName} ${player.member.lastName}`,
        type: CheckInPlayerType.MEMBER,
        memberNumber: player.member.memberId,
      };
    }
    if (player.dependent) {
      return {
        name: `${player.dependent.firstName} ${player.dependent.lastName}`,
        type: CheckInPlayerType.DEPENDENT,
        memberNumber: player.dependent.member?.memberId,
      };
    }
    if (player.guestName) {
      return {
        name: player.guestName,
        type: CheckInPlayerType.GUEST,
      };
    }
    return {
      name: 'Walk-up',
      type: CheckInPlayerType.WALKUP,
    };
  }

  private mapToTicketResponse(ticket: any): StarterTicketResponseType {
    const players = (ticket.players as any[]) || [];

    return {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      teeTime: ticket.teeTimeValue,
      course: ticket.course,
      startingHole: ticket.startingHole,
      players: players.map((p: any) => ({
        name: p.name,
        memberNumber: p.memberNumber,
        type: p.type as CheckInPlayerType,
      })),
      cartNumber: ticket.cartNumber || undefined,
      caddyName: ticket.caddyName || undefined,
      rentalItems: ticket.rentalItems || [],
      specialRequests: ticket.specialRequests || undefined,
      qrCodeData: ticket.qrCodeData || undefined,
      generatedAt: ticket.generatedAt,
      generatedBy: ticket.generatedBy,
      printedAt: ticket.printedAt || undefined,
      reprintCount: ticket.reprintCount,
    };
  }
}
