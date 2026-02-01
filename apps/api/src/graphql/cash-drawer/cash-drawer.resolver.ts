import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { CashDrawerService } from './cash-drawer.service';
import { CashMovementType } from '@prisma/client';
import {
  CashDrawerGraphQLType,
  CashDrawerShiftGraphQLType,
  CashMovementGraphQLType,
  ShiftSummaryGraphQLType,
} from './cash-drawer.types';
import {
  CreateCashDrawerInput,
  UpdateCashDrawerInput,
  OpenShiftInput,
  CloseShiftInput,
  RecordMovementInput,
} from './cash-drawer.input';

/**
 * Resolver for Cash Drawer management
 */
@Resolver()
@UseGuards(GqlAuthGuard)
export class CashDrawerResolver {
  constructor(private readonly cashDrawerService: CashDrawerService) {}

  // ============================================================================
  // CASH DRAWER QUERIES
  // ============================================================================

  @Query(() => [CashDrawerGraphQLType], {
    name: 'cashDrawers',
    description: 'Get all cash drawers for the current club',
  })
  async getCashDrawers(
    @GqlCurrentUser() user: JwtPayload,
    @Args('activeOnly', { nullable: true, defaultValue: true }) activeOnly: boolean,
  ): Promise<CashDrawerGraphQLType[]> {
    const drawers = await this.cashDrawerService.getCashDrawers(user.tenantId, activeOnly);
    return drawers.map((drawer) => this.mapDrawerToGraphQL(drawer));
  }

  @Query(() => CashDrawerGraphQLType, {
    name: 'cashDrawer',
    description: 'Get a single cash drawer by ID',
    nullable: true,
  })
  async getCashDrawer(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<CashDrawerGraphQLType | null> {
    try {
      const drawer = await this.cashDrawerService.getCashDrawer(id);
      return this.mapDrawerToGraphQL(drawer);
    } catch {
      return null;
    }
  }

  // ============================================================================
  // SHIFT QUERIES
  // ============================================================================

  @Query(() => CashDrawerShiftGraphQLType, {
    name: 'currentShift',
    description: 'Get the current open shift for a drawer',
    nullable: true,
  })
  async getCurrentShift(
    @Args('cashDrawerId', { type: () => ID }) cashDrawerId: string,
  ): Promise<CashDrawerShiftGraphQLType | null> {
    const shift = await this.cashDrawerService.getCurrentShift(cashDrawerId);
    return shift ? this.mapShiftToGraphQL(shift) : null;
  }

  @Query(() => CashDrawerShiftGraphQLType, {
    name: 'cashDrawerShift',
    description: 'Get a shift by ID',
    nullable: true,
  })
  async getShift(
    @Args('shiftId', { type: () => ID }) shiftId: string,
  ): Promise<CashDrawerShiftGraphQLType | null> {
    try {
      const shift = await this.cashDrawerService.getShift(shiftId);
      return this.mapShiftToGraphQL(shift);
    } catch {
      return null;
    }
  }

  @Query(() => ShiftSummaryGraphQLType, {
    name: 'shiftSummary',
    description: 'Get summary for a shift',
  })
  async getShiftSummary(
    @Args('shiftId', { type: () => ID }) shiftId: string,
  ): Promise<ShiftSummaryGraphQLType> {
    return this.cashDrawerService.getShiftSummary(shiftId);
  }

  @Query(() => [CashDrawerShiftGraphQLType], {
    name: 'shiftHistory',
    description: 'Get shift history for a drawer',
  })
  async getShiftHistory(
    @Args('cashDrawerId', { type: () => ID }) cashDrawerId: string,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 30 }) limit: number,
  ): Promise<CashDrawerShiftGraphQLType[]> {
    const shifts = await this.cashDrawerService.getShiftHistory(cashDrawerId, limit);
    return shifts.map((shift) => this.mapShiftToGraphQL(shift));
  }

  // ============================================================================
  // MOVEMENT QUERIES
  // ============================================================================

  @Query(() => [CashMovementGraphQLType], {
    name: 'shiftMovements',
    description: 'Get movements for a shift',
  })
  async getShiftMovements(
    @Args('shiftId', { type: () => ID }) shiftId: string,
    @Args('type', { type: () => CashMovementType, nullable: true }) type?: CashMovementType,
  ): Promise<CashMovementGraphQLType[]> {
    const movements = await this.cashDrawerService.getShiftMovements(shiftId, type);
    return movements.map((movement) => this.mapMovementToGraphQL(movement));
  }

  // ============================================================================
  // CASH DRAWER MUTATIONS
  // ============================================================================

  @Mutation(() => CashDrawerGraphQLType, {
    name: 'createCashDrawer',
    description: 'Create a new cash drawer',
  })
  async createCashDrawer(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateCashDrawerInput,
  ): Promise<CashDrawerGraphQLType> {
    const drawer = await this.cashDrawerService.createCashDrawer(
      user.tenantId,
      input.name,
      input.location,
    );
    return this.mapDrawerToGraphQL(drawer);
  }

  @Mutation(() => CashDrawerGraphQLType, {
    name: 'updateCashDrawer',
    description: 'Update a cash drawer',
  })
  async updateCashDrawer(
    @Args('input') input: UpdateCashDrawerInput,
  ): Promise<CashDrawerGraphQLType> {
    const { id, ...data } = input;
    const drawer = await this.cashDrawerService.updateCashDrawer(id, data);
    return this.mapDrawerToGraphQL(drawer);
  }

  // ============================================================================
  // SHIFT MUTATIONS
  // ============================================================================

  @Mutation(() => CashDrawerShiftGraphQLType, {
    name: 'openShift',
    description: 'Open a new shift on a cash drawer',
  })
  async openShift(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: OpenShiftInput,
  ): Promise<CashDrawerShiftGraphQLType> {
    const shift = await this.cashDrawerService.openShift(input, user.sub);
    return this.mapShiftToGraphQL(shift);
  }

  @Mutation(() => CashDrawerShiftGraphQLType, {
    name: 'closeShift',
    description: 'Close a shift',
  })
  async closeShift(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CloseShiftInput,
  ): Promise<CashDrawerShiftGraphQLType> {
    const shift = await this.cashDrawerService.closeShift(input, user.sub);
    return this.mapShiftToGraphQL(shift);
  }

  @Mutation(() => CashDrawerShiftGraphQLType, {
    name: 'suspendShift',
    description: 'Suspend a shift temporarily',
  })
  async suspendShift(
    @GqlCurrentUser() user: JwtPayload,
    @Args('shiftId', { type: () => ID }) shiftId: string,
  ): Promise<CashDrawerShiftGraphQLType> {
    const shift = await this.cashDrawerService.suspendShift(shiftId, user.sub);
    return this.mapShiftToGraphQL(shift);
  }

  @Mutation(() => CashDrawerShiftGraphQLType, {
    name: 'resumeShift',
    description: 'Resume a suspended shift',
  })
  async resumeShift(
    @GqlCurrentUser() user: JwtPayload,
    @Args('shiftId', { type: () => ID }) shiftId: string,
  ): Promise<CashDrawerShiftGraphQLType> {
    const shift = await this.cashDrawerService.resumeShift(shiftId, user.sub);
    return this.mapShiftToGraphQL(shift);
  }

  // ============================================================================
  // MOVEMENT MUTATIONS
  // ============================================================================

  @Mutation(() => CashMovementGraphQLType, {
    name: 'recordCashMovement',
    description: 'Record a cash movement',
  })
  async recordMovement(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: RecordMovementInput,
    @Args('approvedBy', { type: () => ID, nullable: true }) approvedBy?: string,
  ): Promise<CashMovementGraphQLType> {
    const movement = await this.cashDrawerService.recordMovement(input, user.sub, approvedBy);
    return this.mapMovementToGraphQL(movement);
  }

  // ============================================================================
  // MAPPING HELPERS
  // ============================================================================

  private mapDrawerToGraphQL = (drawer: any): CashDrawerGraphQLType => ({
    id: drawer.id,
    clubId: drawer.clubId,
    name: drawer.name,
    location: drawer.location,
    isActive: drawer.isActive,
    createdAt: drawer.createdAt,
    updatedAt: drawer.updatedAt,
    currentShift: drawer.shifts?.[0] ? this.mapShiftToGraphQL(drawer.shifts[0]) : undefined,
  });

  private mapShiftToGraphQL = (shift: any): CashDrawerShiftGraphQLType => ({
    id: shift.id,
    cashDrawerId: shift.cashDrawerId,
    status: shift.status,
    openedBy: shift.openedBy,
    openedAt: shift.openedAt,
    openingFloat: Number(shift.openingFloat),
    openingDenominations: shift.openingDenominations ? JSON.stringify(shift.openingDenominations) : undefined,
    closedBy: shift.closedBy,
    closedAt: shift.closedAt,
    closingCount: shift.closingCount ? Number(shift.closingCount) : undefined,
    closingDenominations: shift.closingDenominations ? JSON.stringify(shift.closingDenominations) : undefined,
    expectedCash: shift.expectedCash ? Number(shift.expectedCash) : undefined,
    actualCash: shift.actualCash ? Number(shift.actualCash) : undefined,
    variance: shift.variance ? Number(shift.variance) : undefined,
    varianceNote: shift.varianceNote,
    totalSales: Number(shift.totalSales),
    totalRefunds: Number(shift.totalRefunds),
    totalPaidIn: Number(shift.totalPaidIn),
    totalPaidOut: Number(shift.totalPaidOut),
    totalDrops: Number(shift.totalDrops),
    createdAt: shift.createdAt,
    cashDrawer: shift.cashDrawer ? this.mapDrawerToGraphQL(shift.cashDrawer) : undefined,
    movements: shift.movements?.map(this.mapMovementToGraphQL),
  });

  private mapMovementToGraphQL = (movement: any): CashMovementGraphQLType => ({
    id: movement.id,
    shiftId: movement.shiftId,
    type: movement.type,
    amount: Number(movement.amount),
    description: movement.description,
    reference: movement.reference,
    reason: movement.reason,
    approvedBy: movement.approvedBy,
    transactionId: movement.transactionId,
    performedBy: movement.performedBy,
    performedAt: movement.performedAt,
  });
}
