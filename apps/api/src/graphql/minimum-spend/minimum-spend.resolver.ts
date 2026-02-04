import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { MinimumSpendService } from './minimum-spend.service';
import {
  MinimumSpendRequirementGraphQLType,
  MemberMinimumSpendGraphQLType,
} from './minimum-spend.types';
import {
  CreateRequirementInput,
  UpdateRequirementInput,
  RecordSpendInput,
  ResolveShortfallInput,
  ExemptMemberInput,
  GetMemberSpendsInput,
  ClosePeriodInput,
} from './minimum-spend.input';

@Resolver()
@UseGuards(GqlAuthGuard)
export class MinimumSpendResolver {
  constructor(private readonly minimumSpendService: MinimumSpendService) {}

  // ============================================================================
  // QUERIES
  // ============================================================================

  @Query(() => [MinimumSpendRequirementGraphQLType], {
    name: 'minimumSpendRequirements',
    description: 'Get all minimum spend requirements for the club',
  })
  async getRequirements(
    @GqlCurrentUser() user: JwtPayload,
    @Args('activeOnly', { nullable: true, defaultValue: true }) activeOnly: boolean,
  ): Promise<MinimumSpendRequirementGraphQLType[]> {
    const requirements = await this.minimumSpendService.getRequirements(user.tenantId, activeOnly);
    return requirements.map((r) => this.mapRequirementToGraphQL(r));
  }

  @Query(() => MinimumSpendRequirementGraphQLType, {
    name: 'minimumSpendRequirement',
    description: 'Get a minimum spend requirement by ID',
    nullable: true,
  })
  async getRequirement(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MinimumSpendRequirementGraphQLType | null> {
    try {
      const requirement = await this.minimumSpendService.getRequirement(id);
      return this.mapRequirementToGraphQL(requirement);
    } catch {
      return null;
    }
  }

  @Query(() => [MemberMinimumSpendGraphQLType], {
    name: 'memberMinimumSpends',
    description: 'Get member minimum spend records',
  })
  async getMemberSpends(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: GetMemberSpendsInput,
  ): Promise<MemberMinimumSpendGraphQLType[]> {
    if (input.memberId) {
      const spends = await this.minimumSpendService.getMemberSpends(input.memberId);
      return spends.map((s) => this.mapMemberSpendToGraphQL(s));
    }

    const spends = await this.minimumSpendService.getMemberSpendsByStatus(
      user.tenantId,
      input.status,
      input.periodStart,
      input.periodEnd,
    );
    return spends.map((s) => this.mapMemberSpendToGraphQL(s));
  }

  @Query(() => MemberMinimumSpendGraphQLType, {
    name: 'memberMinimumSpend',
    description: 'Get a member minimum spend record by ID',
    nullable: true,
  })
  async getMemberSpend(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MemberMinimumSpendGraphQLType | null> {
    try {
      const spend = await this.minimumSpendService.getMemberSpend(id);
      return this.mapMemberSpendToGraphQL(spend);
    } catch {
      return null;
    }
  }

  @Query(() => MemberMinimumSpendGraphQLType, {
    name: 'currentMemberSpend',
    description: 'Get or create current period spend for a member and requirement',
  })
  async getCurrentMemberSpend(
    @GqlCurrentUser() user: JwtPayload,
    @Args('memberId', { type: () => ID }) memberId: string,
    @Args('requirementId', { type: () => ID }) requirementId: string,
  ): Promise<MemberMinimumSpendGraphQLType> {
    const spend = await this.minimumSpendService.getOrCreateMemberSpend(
      user.tenantId,
      memberId,
      requirementId,
    );
    return this.mapMemberSpendToGraphQL(spend);
  }

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  @Mutation(() => MinimumSpendRequirementGraphQLType, {
    name: 'createMinimumSpendRequirement',
    description: 'Create a new minimum spend requirement',
  })
  async createRequirement(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateRequirementInput,
  ): Promise<MinimumSpendRequirementGraphQLType> {
    const requirement = await this.minimumSpendService.createRequirement(user.tenantId, input);
    return this.mapRequirementToGraphQL(requirement);
  }

  @Mutation(() => MinimumSpendRequirementGraphQLType, {
    name: 'updateMinimumSpendRequirement',
    description: 'Update a minimum spend requirement',
  })
  async updateRequirement(
    @Args('input') input: UpdateRequirementInput,
  ): Promise<MinimumSpendRequirementGraphQLType> {
    const requirement = await this.minimumSpendService.updateRequirement(input);
    return this.mapRequirementToGraphQL(requirement);
  }

  @Mutation(() => MinimumSpendRequirementGraphQLType, {
    name: 'deleteMinimumSpendRequirement',
    description: 'Delete (deactivate) a minimum spend requirement',
  })
  async deleteRequirement(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<MinimumSpendRequirementGraphQLType> {
    const requirement = await this.minimumSpendService.deleteRequirement(id);
    return this.mapRequirementToGraphQL(requirement);
  }

  @Mutation(() => MemberMinimumSpendGraphQLType, {
    name: 'recordMinimumSpend',
    description: 'Record spending against a member minimum spend requirement',
  })
  async recordSpend(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: RecordSpendInput,
  ): Promise<MemberMinimumSpendGraphQLType> {
    const spend = await this.minimumSpendService.recordSpend(user.tenantId, input, user.sub);
    return this.mapMemberSpendToGraphQL(spend);
  }

  @Mutation(() => MemberMinimumSpendGraphQLType, {
    name: 'resolveMinimumSpendShortfall',
    description: 'Resolve a minimum spend shortfall',
  })
  async resolveShortfall(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: ResolveShortfallInput,
  ): Promise<MemberMinimumSpendGraphQLType> {
    const spend = await this.minimumSpendService.resolveShortfall(input, user.sub);
    return this.mapMemberSpendToGraphQL(spend);
  }

  @Mutation(() => MemberMinimumSpendGraphQLType, {
    name: 'exemptMemberFromMinimumSpend',
    description: 'Exempt a member from a minimum spend requirement',
  })
  async exemptMember(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: ExemptMemberInput,
  ): Promise<MemberMinimumSpendGraphQLType> {
    const spend = await this.minimumSpendService.exemptMember(input, user.sub);
    return this.mapMemberSpendToGraphQL(spend);
  }

  @Mutation(() => MemberMinimumSpendGraphQLType, {
    name: 'removeMinimumSpendExemption',
    description: 'Remove minimum spend exemption from a member',
  })
  async removeExemption(
    @Args('memberSpendId', { type: () => ID }) memberSpendId: string,
  ): Promise<MemberMinimumSpendGraphQLType> {
    const spend = await this.minimumSpendService.removeExemption(memberSpendId);
    return this.mapMemberSpendToGraphQL(spend);
  }

  @Mutation(() => [MemberMinimumSpendGraphQLType], {
    name: 'closeMinimumSpendPeriod',
    description: 'Close a minimum spend period and process shortfalls',
  })
  async closePeriod(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: ClosePeriodInput,
  ): Promise<MemberMinimumSpendGraphQLType[]> {
    const spends = await this.minimumSpendService.closePeriod(
      user.tenantId,
      input.periodEnd,
      user.sub,
    );
    return spends.map((s) => this.mapMemberSpendToGraphQL(s));
  }

  @Mutation(() => MemberMinimumSpendGraphQLType, {
    name: 'recalculateMemberSpend',
    description: 'Recalculate member spend from transactions',
  })
  async recalculateSpend(
    @GqlCurrentUser() user: JwtPayload,
    @Args('memberSpendId', { type: () => ID }) memberSpendId: string,
  ): Promise<MemberMinimumSpendGraphQLType> {
    const spend = await this.minimumSpendService.recalculateMemberSpend(
      memberSpendId,
      user.tenantId,
    );
    return this.mapMemberSpendToGraphQL(spend);
  }

  // ============================================================================
  // MAPPING HELPERS
  // ============================================================================

  private mapRequirementToGraphQL = (requirement: any): MinimumSpendRequirementGraphQLType => ({
    id: requirement.id,
    clubId: requirement.clubId,
    name: requirement.name,
    description: requirement.description,
    membershipTypes: requirement.membershipTypes,
    minimumAmount: Number(requirement.minimumAmount),
    period: requirement.period,
    includeFoodBeverage: requirement.includeFoodBeverage,
    includeGolf: requirement.includeGolf,
    includeSpa: requirement.includeSpa,
    includeRetail: requirement.includeRetail,
    includeEvents: requirement.includeEvents,
    includedCategories: requirement.includedCategories,
    excludedCategories: requirement.excludedCategories,
    defaultShortfallAction: requirement.defaultShortfallAction,
    gracePeriodDays: requirement.gracePeriodDays,
    allowPartialCredit: requirement.allowPartialCredit,
    notifyAtPercent: requirement.notifyAtPercent,
    notifyDaysBeforeEnd: requirement.notifyDaysBeforeEnd,
    isActive: requirement.isActive,
    effectiveFrom: requirement.effectiveFrom,
    effectiveTo: requirement.effectiveTo,
    createdAt: requirement.createdAt,
    updatedAt: requirement.updatedAt,
  });

  private mapMemberSpendToGraphQL = (spend: any): MemberMinimumSpendGraphQLType => ({
    id: spend.id,
    clubId: spend.clubId,
    memberId: spend.memberId,
    requirementId: spend.requirementId,
    periodStart: spend.periodStart,
    periodEnd: spend.periodEnd,
    periodLabel: spend.periodLabel,
    requiredAmount: Number(spend.requiredAmount),
    currentSpend: Number(spend.currentSpend),
    projectedSpend: spend.projectedSpend ? Number(spend.projectedSpend) : undefined,
    shortfallAmount: spend.shortfallAmount ? Number(spend.shortfallAmount) : undefined,
    carryForwardAmount: Number(spend.carryForwardAmount),
    status: spend.status,
    isExempt: spend.isExempt,
    exemptReason: spend.exemptReason,
    exemptBy: spend.exemptBy,
    exemptAt: spend.exemptAt,
    shortfallAction: spend.shortfallAction,
    shortfallResolvedBy: spend.shortfallResolvedBy,
    shortfallResolvedAt: spend.shortfallResolvedAt,
    shortfallNote: spend.shortfallNote,
    shortfallInvoiceId: spend.shortfallInvoiceId,
    lastCalculatedAt: spend.lastCalculatedAt,
    createdAt: spend.createdAt,
    updatedAt: spend.updatedAt,
    requirement: spend.requirement
      ? this.mapRequirementToGraphQL(spend.requirement)
      : undefined,
  });
}
