import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { CreditLimitService } from './credit-limits.service';
import {
  CreditCheckResultType,
  CreditStatusType,
  CreditLimitOverrideType,
  MemberAtRiskType,
  CreditSettingsType,
} from './credit-limits.types';
import {
  CreateCreditOverrideInput,
  UpdateCreditSettingsInput,
  CheckCreditInput,
} from './credit-limits.input';

/**
 * Resolver for Credit Limit management
 */
@Resolver()
@UseGuards(GqlAuthGuard)
export class CreditLimitResolver {
  constructor(private readonly creditLimitService: CreditLimitService) {}

  // ============================================================================
  // CREDIT CHECK QUERIES
  // ============================================================================

  @Query(() => CreditCheckResultType, {
    name: 'checkMemberCredit',
    description: 'Check if a charge is allowed for a member based on their credit limit',
  })
  async checkMemberCredit(
    @Args('input') input: CheckCreditInput,
  ): Promise<CreditCheckResultType> {
    const result = await this.creditLimitService.checkCredit(
      input.memberId,
      input.chargeAmount,
    );
    return {
      ...result,
      warning: result.warning as any,
    };
  }

  @Query(() => CreditStatusType, {
    name: 'memberCreditStatus',
    description: 'Get credit status for a member (for display in UI)',
    nullable: true,
  })
  async getMemberCreditStatus(
    @Args('memberId', { type: () => ID }) memberId: string,
  ): Promise<CreditStatusType | null> {
    return this.creditLimitService.getCreditStatus(memberId);
  }

  @Query(() => CreditSettingsType, {
    name: 'memberCreditSettings',
    description: 'Get credit settings for a member',
    nullable: true,
  })
  async getMemberCreditSettings(
    @Args('memberId', { type: () => ID }) memberId: string,
  ): Promise<CreditSettingsType | null> {
    const status = await this.creditLimitService.getCreditStatus(memberId);
    if (!status) return null;
    return {
      creditLimit: status.creditLimit,
      creditLimitEnabled: true,
      creditAlertThreshold: status.alertThreshold,
      creditBlockEnabled: status.isBlocked,
      creditOverrideAllowed: status.overrideAllowed,
    };
  }

  // ============================================================================
  // CREDIT OVERRIDE QUERIES
  // ============================================================================

  @Query(() => [CreditLimitOverrideType], {
    name: 'memberCreditOverrides',
    description: 'Get active credit limit overrides for a member',
  })
  async getMemberCreditOverrides(
    @Args('memberId', { type: () => ID }) memberId: string,
  ): Promise<CreditLimitOverrideType[]> {
    const overrides = await this.creditLimitService.getActiveOverrides(memberId);
    return overrides.map(this.mapOverrideToGraphQL);
  }

  @Query(() => [CreditLimitOverrideType], {
    name: 'memberCreditOverrideHistory',
    description: 'Get credit limit override history for a member',
  })
  async getMemberCreditOverrideHistory(
    @Args('memberId', { type: () => ID }) memberId: string,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 10 }) limit: number,
  ): Promise<CreditLimitOverrideType[]> {
    const overrides = await this.creditLimitService.getOverrideHistory(memberId, limit);
    return overrides.map(this.mapOverrideToGraphQL);
  }

  // ============================================================================
  // AT-RISK MEMBERS QUERIES
  // ============================================================================

  @Query(() => [MemberAtRiskType], {
    name: 'membersAtCreditRisk',
    description: 'Get members approaching or exceeding their credit limits',
  })
  async getMembersAtCreditRisk(
    @GqlCurrentUser() user: JwtPayload,
  ): Promise<MemberAtRiskType[]> {
    const members = await this.creditLimitService.getMembersAtRisk(user.tenantId);
    return members.map((m) => ({
      id: m.id,
      memberId: m.memberId,
      firstName: m.firstName,
      lastName: m.lastName,
      creditLimit: Number(m.creditLimit),
      outstandingBalance: Number(m.outstandingBalance),
      usagePercent: m.usagePercent,
      isAtRisk: m.isAtRisk,
      isExceeded: m.isExceeded,
    }));
  }

  // ============================================================================
  // CREDIT OVERRIDE MUTATIONS
  // ============================================================================

  @Mutation(() => CreditLimitOverrideType, {
    name: 'createCreditOverride',
    description: 'Create a credit limit override (temporary or permanent increase)',
  })
  async createCreditOverride(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateCreditOverrideInput,
  ): Promise<CreditLimitOverrideType> {
    const override = await this.creditLimitService.createOverride(
      input.memberId,
      input.newLimit,
      input.reason,
      user.sub,
      input.expiresAt,
    );
    return this.mapOverrideToGraphQL(override);
  }

  @Mutation(() => Boolean, {
    name: 'revertCreditOverride',
    description: 'Revert a credit limit override',
  })
  async revertCreditOverride(
    @GqlCurrentUser() user: JwtPayload,
    @Args('overrideId', { type: () => ID }) overrideId: string,
  ): Promise<boolean> {
    return this.creditLimitService.revertOverride(overrideId, user.sub);
  }

  // ============================================================================
  // CREDIT SETTINGS MUTATIONS
  // ============================================================================

  @Mutation(() => Boolean, {
    name: 'updateMemberCreditSettings',
    description: 'Update credit limit settings for a member',
  })
  async updateMemberCreditSettings(
    @Args('input') input: UpdateCreditSettingsInput,
  ): Promise<boolean> {
    const { memberId, ...settings } = input;
    await this.creditLimitService.updateCreditSettings(memberId, settings);
    return true;
  }

  // ============================================================================
  // MAPPING HELPERS
  // ============================================================================

  private mapOverrideToGraphQL = (override: any): CreditLimitOverrideType => ({
    id: override.id,
    memberId: override.memberId,
    previousLimit: Number(override.previousLimit),
    newLimit: Number(override.newLimit),
    reason: override.reason,
    approvedBy: override.approvedBy,
    approvedAt: override.approvedAt,
    expiresAt: override.expiresAt,
    isActive: override.isActive,
    createdAt: override.createdAt,
  });
}
