import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { EODSettlementService } from './eod-settlement.service';
import {
  DailySettlementGraphQLType,
  SettlementExceptionGraphQLType,
  SettlementSummaryGraphQLType,
} from './eod-settlement.types';
import {
  OpenDayInput,
  UpdateSettlementTotalsInput,
  RecordCashCountInput,
  CreateExceptionInput,
  ResolveExceptionInput,
  CloseSettlementInput,
  ReopenSettlementInput,
  GetSettlementsInput,
} from './eod-settlement.input';

/**
 * Resolver for EOD Settlement management
 */
@Resolver()
@UseGuards(GqlAuthGuard)
export class EODSettlementResolver {
  constructor(private readonly settlementService: EODSettlementService) {}

  // ============================================================================
  // QUERIES
  // ============================================================================

  @Query(() => DailySettlementGraphQLType, {
    name: 'todaySettlement',
    description: 'Get today\'s settlement for the current club',
    nullable: true,
  })
  async getTodaySettlement(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<DailySettlementGraphQLType> {
    const settlement = await this.settlementService.getTodaySettlement(user.tenantId);
    return this.mapSettlementToGraphQL(settlement);
  }

  @Query(() => DailySettlementGraphQLType, {
    name: 'settlement',
    description: 'Get a settlement by ID',
    nullable: true,
  })
  async getSettlement(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<DailySettlementGraphQLType | null> {
    try {
      const settlement = await this.settlementService.getSettlement(id);
      return this.mapSettlementToGraphQL(settlement);
    } catch {
      return null;
    }
  }

  @Query(() => DailySettlementGraphQLType, {
    name: 'settlementByDate',
    description: 'Get or create a settlement for a specific date',
  })
  async getSettlementByDate(
    @GqlCurrentUser() user: JwtPayload,
    @Args('date') date: Date,
  ): Promise<DailySettlementGraphQLType> {
    const settlement = await this.settlementService.getOrCreateSettlement(user.tenantId, date);
    return this.mapSettlementToGraphQL(settlement);
  }

  @Query(() => [DailySettlementGraphQLType], {
    name: 'settlements',
    description: 'Get settlements for a date range',
  })
  async getSettlements(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: GetSettlementsInput,
  ): Promise<DailySettlementGraphQLType[]> {
    const settlements = await this.settlementService.getSettlements(
      user.tenantId,
      input.startDate,
      input.endDate,
    );
    return settlements.map((s) => this.mapSettlementToGraphQL(s));
  }

  @Query(() => SettlementSummaryGraphQLType, {
    name: 'settlementSummary',
    description: 'Get settlement summary',
  })
  async getSettlementSummary(
    @Args('settlementId', { type: () => ID }) settlementId: string,
  ): Promise<SettlementSummaryGraphQLType> {
    const summary = await this.settlementService.getSettlementSummary(settlementId);
    return {
      ...summary,
      actualCash: summary.actualCash ?? undefined,
      cashVariance: summary.cashVariance ?? undefined,
    };
  }

  @Query(() => [SettlementExceptionGraphQLType], {
    name: 'settlementExceptions',
    description: 'Get exceptions for a settlement',
  })
  async getSettlementExceptions(
    @Args('settlementId', { type: () => ID }) settlementId: string,
    @Args('pendingOnly', { nullable: true, defaultValue: false }) pendingOnly: boolean,
  ): Promise<SettlementExceptionGraphQLType[]> {
    const exceptions = await this.settlementService.getExceptions(settlementId, pendingOnly);
    return exceptions.map((e) => this.mapExceptionToGraphQL(e));
  }

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  @Mutation(() => DailySettlementGraphQLType, {
    name: 'openDay',
    description: 'Open a new business day',
  })
  async openDay(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: OpenDayInput,
  ): Promise<DailySettlementGraphQLType> {
    const settlement = await this.settlementService.openDay(
      user.tenantId,
      input.businessDate,
      user.sub,
    );
    return this.mapSettlementToGraphQL(settlement);
  }

  @Mutation(() => DailySettlementGraphQLType, {
    name: 'submitSettlementForReview',
    description: 'Submit settlement for review',
  })
  async submitForReview(
    @GqlCurrentUser() user: JwtPayload,
    @Args('settlementId', { type: () => ID }) settlementId: string,
  ): Promise<DailySettlementGraphQLType> {
    const settlement = await this.settlementService.submitForReview(settlementId, user.sub);
    return this.mapSettlementToGraphQL(settlement);
  }

  @Mutation(() => DailySettlementGraphQLType, {
    name: 'closeSettlement',
    description: 'Close a settlement',
  })
  async closeSettlement(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CloseSettlementInput,
  ): Promise<DailySettlementGraphQLType> {
    const settlement = await this.settlementService.closeDay(
      input.settlementId,
      user.sub,
      input.notes,
    );
    return this.mapSettlementToGraphQL(settlement);
  }

  @Mutation(() => DailySettlementGraphQLType, {
    name: 'reopenSettlement',
    description: 'Reopen a closed settlement',
  })
  async reopenSettlement(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: ReopenSettlementInput,
  ): Promise<DailySettlementGraphQLType> {
    const settlement = await this.settlementService.reopenSettlement(
      input.settlementId,
      user.sub,
      input.reason,
    );
    return this.mapSettlementToGraphQL(settlement);
  }

  @Mutation(() => DailySettlementGraphQLType, {
    name: 'updateSettlementTotals',
    description: 'Update settlement totals',
  })
  async updateSettlementTotals(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: UpdateSettlementTotalsInput,
  ): Promise<DailySettlementGraphQLType> {
    const settlement = await this.settlementService.updateTotals(input, user.sub);
    return this.mapSettlementToGraphQL(settlement);
  }

  @Mutation(() => DailySettlementGraphQLType, {
    name: 'recordCashCount',
    description: 'Record actual cash count',
  })
  async recordCashCount(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: RecordCashCountInput,
  ): Promise<DailySettlementGraphQLType> {
    const settlement = await this.settlementService.recordCashCount(input, user.sub);
    return this.mapSettlementToGraphQL(settlement);
  }

  @Mutation(() => DailySettlementGraphQLType, {
    name: 'recalculateSettlementTotals',
    description: 'Recalculate settlement totals from transactions',
  })
  async recalculateTotals(
    @GqlCurrentUser() user: JwtPayload,
    @Args('settlementId', { type: () => ID }) settlementId: string,
  ): Promise<DailySettlementGraphQLType> {
    const settlement = await this.settlementService.recalculateTotals(settlementId, user.tenantId);
    return this.mapSettlementToGraphQL(settlement);
  }

  @Mutation(() => SettlementExceptionGraphQLType, {
    name: 'createSettlementException',
    description: 'Create a settlement exception',
  })
  async createException(
    @Args('input') input: CreateExceptionInput,
  ): Promise<SettlementExceptionGraphQLType> {
    const exception = await this.settlementService.createException(input);
    return this.mapExceptionToGraphQL(exception);
  }

  @Mutation(() => SettlementExceptionGraphQLType, {
    name: 'resolveSettlementException',
    description: 'Resolve a settlement exception',
  })
  async resolveException(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: ResolveExceptionInput,
  ): Promise<SettlementExceptionGraphQLType> {
    const exception = await this.settlementService.resolveException(input, user.sub);
    return this.mapExceptionToGraphQL(exception);
  }

  // ============================================================================
  // MAPPING HELPERS
  // ============================================================================

  private mapSettlementToGraphQL = (settlement: any): DailySettlementGraphQLType => ({
    id: settlement.id,
    clubId: settlement.clubId,
    businessDate: settlement.businessDate,
    status: settlement.status,
    totalGrossSales: Number(settlement.totalGrossSales),
    totalDiscounts: Number(settlement.totalDiscounts),
    totalNetSales: Number(settlement.totalNetSales),
    totalTax: Number(settlement.totalTax),
    totalServiceCharge: Number(settlement.totalServiceCharge),
    totalCash: Number(settlement.totalCash),
    totalCard: Number(settlement.totalCard),
    totalMemberAccount: Number(settlement.totalMemberAccount),
    totalOther: Number(settlement.totalOther),
    totalRefunds: Number(settlement.totalRefunds),
    totalVoids: Number(settlement.totalVoids),
    expectedCash: Number(settlement.expectedCash),
    actualCash: settlement.actualCash ? Number(settlement.actualCash) : undefined,
    cashVariance: settlement.cashVariance ? Number(settlement.cashVariance) : undefined,
    transactionCount: settlement.transactionCount,
    refundCount: settlement.refundCount,
    voidCount: settlement.voidCount,
    openedBy: settlement.openedBy,
    openedAt: settlement.openedAt,
    reviewedBy: settlement.reviewedBy,
    reviewedAt: settlement.reviewedAt,
    closedBy: settlement.closedBy,
    closedAt: settlement.closedAt,
    notes: settlement.notes,
    createdAt: settlement.createdAt,
    updatedAt: settlement.updatedAt,
    exceptions: settlement.exceptions?.map(this.mapExceptionToGraphQL),
  });

  private mapExceptionToGraphQL = (exception: any): SettlementExceptionGraphQLType => ({
    id: exception.id,
    settlementId: exception.settlementId,
    type: exception.type,
    severity: exception.severity,
    resolution: exception.resolution,
    description: exception.description,
    amount: exception.amount ? Number(exception.amount) : undefined,
    transactionId: exception.transactionId,
    shiftId: exception.shiftId,
    lineItemId: exception.lineItemId,
    resolvedBy: exception.resolvedBy,
    resolvedAt: exception.resolvedAt,
    resolutionNote: exception.resolutionNote,
    createdAt: exception.createdAt,
    updatedAt: exception.updatedAt,
  });
}
