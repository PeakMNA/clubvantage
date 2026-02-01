import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { CheckInService } from './checkin.service';
import {
  FlightCheckInInfoType,
  PlayerPaymentInfoType,
  BookingLineItemType,
  SettlementResultType,
  CheckInResultType,
  StarterTicketResponseType,
  FlightPaymentSummaryType,
  CheckInAuditEntryType,
  DailyCheckInReportType,
  TicketValidationResultType,
  PaymentTransactionType,
} from './golf.types';
import {
  AddLineItemInput,
  RemoveLineItemInput,
  ProcessSettlementInput,
  CheckInFlightInput,
  UndoCheckInInput,
  GenerateTicketInput,
  PrintTicketInput,
  CheckInAllPlayersInput,
  SettleAllPlayersInput,
  CheckInHistoryFilterInput,
  DailyReportInput,
} from './checkin.input';
import { TicketPrintService } from './ticket-print.service';

/**
 * Resolver for Golf Check-in operations
 */
@Resolver()
@UseGuards(GqlAuthGuard)
export class CheckInResolver {
  constructor(
    private readonly checkInService: CheckInService,
    private readonly ticketPrintService: TicketPrintService,
  ) {}

  // ============================================================================
  // QUERIES - PAYMENT STATUS
  // ============================================================================

  @Query(() => FlightCheckInInfoType, {
    name: 'flightCheckInInfo',
    description: 'Get check-in info for all players in a tee time',
  })
  async getFlightCheckInInfo(
    @Args('teeTimeId', { type: () => ID }) teeTimeId: string,
  ): Promise<FlightCheckInInfoType> {
    return this.checkInService.getFlightCheckInInfo(teeTimeId);
  }

  @Query(() => PlayerPaymentInfoType, {
    name: 'playerPaymentInfo',
    description: 'Get detailed payment info for a single player',
  })
  async getPlayerPaymentInfo(
    @Args('playerId', { type: () => ID }) playerId: string,
  ): Promise<PlayerPaymentInfoType> {
    return this.checkInService.getPlayerPaymentInfo(playerId);
  }

  // ============================================================================
  // QUERIES - STARTER TICKET
  // ============================================================================

  @Query(() => StarterTicketResponseType, {
    name: 'starterTicket',
    description: 'Get starter ticket by ID',
    nullable: true,
  })
  async getStarterTicket(
    @Args('ticketId', { type: () => ID }) ticketId: string,
  ): Promise<StarterTicketResponseType | null> {
    return this.checkInService.getStarterTicket(ticketId);
  }

  @Query(() => StarterTicketResponseType, {
    name: 'starterTicketByTeeTime',
    description: 'Get starter ticket for a tee time',
    nullable: true,
  })
  async getStarterTicketByTeeTime(
    @Args('teeTimeId', { type: () => ID }) teeTimeId: string,
  ): Promise<StarterTicketResponseType | null> {
    return this.checkInService.getStarterTicketByTeeTime(teeTimeId);
  }

  // ============================================================================
  // MUTATIONS - LINE ITEMS
  // ============================================================================

  @Mutation(() => BookingLineItemType, {
    name: 'addLineItem',
    description: 'Add a line item to a player',
  })
  async addLineItem(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: AddLineItemInput,
  ): Promise<BookingLineItemType> {
    return this.checkInService.addLineItem(user.tenantId, input);
  }

  @Mutation(() => Boolean, {
    name: 'removeLineItem',
    description: 'Remove an unpaid line item',
  })
  async removeLineItem(
    @Args('input') input: RemoveLineItemInput,
  ): Promise<boolean> {
    return this.checkInService.removeLineItem(input.lineItemId);
  }

  // ============================================================================
  // MUTATIONS - SETTLEMENT
  // ============================================================================

  @Mutation(() => SettlementResultType, {
    name: 'processSettlement',
    description: 'Process payment settlement for players',
  })
  async processSettlement(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: ProcessSettlementInput,
  ): Promise<SettlementResultType> {
    return this.checkInService.processSettlement(
      user.tenantId,
      user.sub,
      input,
    );
  }

  // ============================================================================
  // MUTATIONS - CHECK-IN
  // ============================================================================

  @Mutation(() => CheckInResultType, {
    name: 'checkInFlight',
    description: 'Check in multiple players for a flight',
  })
  async checkInFlight(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CheckInFlightInput,
  ): Promise<CheckInResultType> {
    return this.checkInService.checkInFlight(
      user.tenantId,
      user.sub,
      input,
    );
  }

  @Mutation(() => Boolean, {
    name: 'undoCheckIn',
    description: 'Undo a player check-in',
  })
  async undoCheckIn(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: UndoCheckInInput,
  ): Promise<boolean> {
    return this.checkInService.undoCheckIn(user.sub, input);
  }

  // ============================================================================
  // MUTATIONS - STARTER TICKET
  // ============================================================================

  @Mutation(() => StarterTicketResponseType, {
    name: 'generateStarterTicket',
    description: 'Generate or regenerate a starter ticket for a tee time',
  })
  async generateStarterTicket(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: GenerateTicketInput,
  ): Promise<StarterTicketResponseType> {
    return this.checkInService.generateStarterTicket(
      user.tenantId,
      user.sub,
      input,
    );
  }

  @Mutation(() => StarterTicketResponseType, {
    name: 'printStarterTicket',
    description: 'Mark a starter ticket as printed',
  })
  async printStarterTicket(
    @Args('input') input: PrintTicketInput,
  ): Promise<StarterTicketResponseType> {
    return this.checkInService.markTicketPrinted(input.ticketId);
  }

  // ============================================================================
  // QUERIES - FLIGHT SUMMARY (Phase 6)
  // ============================================================================

  @Query(() => FlightPaymentSummaryType, {
    name: 'flightPaymentSummary',
    description: 'Get payment summary for a flight',
  })
  async getFlightPaymentSummary(
    @Args('teeTimeId', { type: () => ID }) teeTimeId: string,
  ): Promise<FlightPaymentSummaryType> {
    return this.checkInService.getFlightPaymentSummary(teeTimeId);
  }

  // ============================================================================
  // QUERIES - AUDIT / REPORTS (Phase 6)
  // ============================================================================

  @Query(() => [CheckInAuditEntryType], {
    name: 'checkInHistory',
    description: 'Get check-in audit history',
  })
  async getCheckInHistory(
    @GqlCurrentUser() user: JwtPayload,
    @Args('filter', { nullable: true }) filter?: CheckInHistoryFilterInput,
  ): Promise<CheckInAuditEntryType[]> {
    return this.checkInService.getCheckInHistory(user.tenantId, filter || {});
  }

  @Query(() => DailyCheckInReportType, {
    name: 'dailyCheckInReport',
    description: 'Get daily check-in report for a course',
  })
  async getDailyCheckInReport(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: DailyReportInput,
  ): Promise<DailyCheckInReportType> {
    return this.checkInService.getDailyCheckInReport(
      user.tenantId,
      input.courseId,
      input.date,
    );
  }

  @Query(() => [PaymentTransactionType], {
    name: 'transactionHistory',
    description: 'Get payment transaction history for a tee time',
  })
  async getTransactionHistory(
    @GqlCurrentUser() user: JwtPayload,
    @Args('teeTimeId', { type: () => ID }) teeTimeId: string,
  ): Promise<any[]> {
    return this.checkInService.getTransactionHistory(
      user.tenantId,
      teeTimeId,
    );
  }

  // ============================================================================
  // QUERIES - TICKET PRINT (Phase 5)
  // ============================================================================

  @Query(() => String, {
    name: 'ticketHTML',
    description: 'Get HTML template for a starter ticket',
  })
  async getTicketHTML(
    @Args('teeTimeId', { type: () => ID }) teeTimeId: string,
  ): Promise<string> {
    return this.ticketPrintService.generateTicketHTML(teeTimeId);
  }

  @Query(() => String, {
    name: 'receiptHTML',
    description: 'Get HTML template for a receipt',
  })
  async getReceiptHTML(
    @Args('teeTimeId', { type: () => ID }) teeTimeId: string,
    @Args('playerId', { type: () => ID }) playerId: string,
  ): Promise<string> {
    return this.ticketPrintService.generateReceiptHTML(teeTimeId, playerId);
  }

  @Query(() => TicketValidationResultType, {
    name: 'validateTicket',
    description: 'Validate a ticket by QR code data',
  })
  async validateTicket(
    @Args('qrCodeData') qrCodeData: string,
  ): Promise<TicketValidationResultType> {
    const result = await this.ticketPrintService.validateTicket(qrCodeData);
    return {
      valid: result.valid,
      ticketId: result.ticketId,
      teeTimeId: result.teeTimeId,
      message: result.message,
    };
  }

  // ============================================================================
  // MUTATIONS - BATCH OPERATIONS (Phase 6)
  // ============================================================================

  @Mutation(() => CheckInResultType, {
    name: 'checkInAllPlayers',
    description: 'Check in all players in a flight at once',
  })
  async checkInAllPlayers(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CheckInAllPlayersInput,
  ): Promise<CheckInResultType> {
    return this.checkInService.checkInAllPlayers(
      user.tenantId,
      user.sub,
      input,
    );
  }

  @Mutation(() => SettlementResultType, {
    name: 'settleAllPlayers',
    description: 'Settle all players in a flight at once',
  })
  async settleAllPlayers(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: SettleAllPlayersInput,
  ): Promise<SettlementResultType> {
    return this.checkInService.settleAllPlayers(
      user.tenantId,
      user.sub,
      input,
    );
  }
}
