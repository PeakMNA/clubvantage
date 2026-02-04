import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards, Logger } from '@nestjs/common';
import { EngagementService } from '@/modules/engagement/engagement.service';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import {
  InterestCategoryType,
  MemberInterestType,
  DependentInterestType,
  MemberCommunicationPrefsType,
  EngagementDeleteResponseType,
} from './engagement.types';
import {
  CreateInterestCategoryInput,
  UpdateInterestCategoryInput,
  SetMemberInterestsInput,
  SetDependentInterestsInput,
  UpdateCommunicationPrefsInput,
  InterestCategoriesQueryArgs,
} from './engagement.input';

@Resolver()
@UseGuards(GqlAuthGuard)
export class EngagementResolver {
  private readonly logger = new Logger(EngagementResolver.name);

  constructor(private readonly engagementService: EngagementService) {}

  // ============================================================================
  // INTEREST CATEGORY QUERIES & MUTATIONS
  // ============================================================================

  @Query(() => [InterestCategoryType], {
    name: 'interestCategories',
    description: 'Get all interest categories for the club',
  })
  async getInterestCategories(
    @GqlCurrentUser() user: JwtPayload,
    @Args() args: InterestCategoriesQueryArgs,
  ): Promise<InterestCategoryType[]> {
    const categories = await this.engagementService.getInterestCategories(
      user.tenantId,
      args.isActive,
    );
    return categories.map((c) => this.transformCategory(c));
  }

  @Query(() => InterestCategoryType, {
    name: 'interestCategory',
    description: 'Get a single interest category by ID',
  })
  async getInterestCategory(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<InterestCategoryType> {
    const category = await this.engagementService.getInterestCategory(user.tenantId, id);
    return this.transformCategory(category);
  }

  @Mutation(() => InterestCategoryType, {
    name: 'createInterestCategory',
    description: 'Create a new interest category',
  })
  async createInterestCategory(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateInterestCategoryInput,
  ): Promise<InterestCategoryType> {
    const category = await this.engagementService.createInterestCategory(user.tenantId, input);
    return this.transformCategory(category);
  }

  @Mutation(() => InterestCategoryType, {
    name: 'updateInterestCategory',
    description: 'Update an existing interest category',
  })
  async updateInterestCategory(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateInterestCategoryInput,
  ): Promise<InterestCategoryType> {
    const category = await this.engagementService.updateInterestCategory(user.tenantId, id, input);
    return this.transformCategory(category);
  }

  @Mutation(() => EngagementDeleteResponseType, {
    name: 'deleteInterestCategory',
    description: 'Delete an interest category',
  })
  async deleteInterestCategory(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<EngagementDeleteResponseType> {
    return this.engagementService.deleteInterestCategory(user.tenantId, id);
  }

  // ============================================================================
  // MEMBER INTEREST QUERIES & MUTATIONS
  // ============================================================================

  @Query(() => [MemberInterestType], {
    name: 'memberInterests',
    description: 'Get all interests for a member',
  })
  async getMemberInterests(
    @GqlCurrentUser() user: JwtPayload,
    @Args('memberId', { type: () => ID }) memberId: string,
  ): Promise<MemberInterestType[]> {
    const interests = await this.engagementService.getMemberInterests(user.tenantId, memberId);
    return interests.map((i) => this.transformMemberInterest(i));
  }

  @Mutation(() => [MemberInterestType], {
    name: 'setMemberInterests',
    description: 'Set interests for a member (upserts)',
  })
  async setMemberInterests(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: SetMemberInterestsInput,
  ): Promise<MemberInterestType[]> {
    const interests = await this.engagementService.setMemberInterests(user.tenantId, input);
    return interests.map((i) => this.transformMemberInterest(i));
  }

  @Mutation(() => EngagementDeleteResponseType, {
    name: 'removeMemberInterest',
    description: 'Remove a specific interest from a member',
  })
  async removeMemberInterest(
    @GqlCurrentUser() user: JwtPayload,
    @Args('memberId', { type: () => ID }) memberId: string,
    @Args('categoryId', { type: () => ID }) categoryId: string,
  ): Promise<EngagementDeleteResponseType> {
    return this.engagementService.removeMemberInterest(user.tenantId, memberId, categoryId);
  }

  // ============================================================================
  // DEPENDENT INTEREST QUERIES & MUTATIONS
  // ============================================================================

  @Query(() => [DependentInterestType], {
    name: 'dependentInterests',
    description: 'Get all interests for a dependent',
  })
  async getDependentInterests(
    @GqlCurrentUser() user: JwtPayload,
    @Args('dependentId', { type: () => ID }) dependentId: string,
  ): Promise<DependentInterestType[]> {
    const interests = await this.engagementService.getDependentInterests(user.tenantId, dependentId);
    return interests.map((i) => this.transformDependentInterest(i));
  }

  @Mutation(() => [DependentInterestType], {
    name: 'setDependentInterests',
    description: 'Set interests for a dependent (upserts)',
  })
  async setDependentInterests(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: SetDependentInterestsInput,
  ): Promise<DependentInterestType[]> {
    const interests = await this.engagementService.setDependentInterests(user.tenantId, input);
    return interests.map((i) => this.transformDependentInterest(i));
  }

  @Mutation(() => EngagementDeleteResponseType, {
    name: 'removeDependentInterest',
    description: 'Remove a specific interest from a dependent',
  })
  async removeDependentInterest(
    @GqlCurrentUser() user: JwtPayload,
    @Args('dependentId', { type: () => ID }) dependentId: string,
    @Args('categoryId', { type: () => ID }) categoryId: string,
  ): Promise<EngagementDeleteResponseType> {
    return this.engagementService.removeDependentInterest(user.tenantId, dependentId, categoryId);
  }

  // ============================================================================
  // COMMUNICATION PREFERENCES QUERIES & MUTATIONS
  // ============================================================================

  @Query(() => MemberCommunicationPrefsType, {
    name: 'memberCommunicationPrefs',
    description: 'Get communication preferences for a member',
  })
  async getMemberCommunicationPrefs(
    @GqlCurrentUser() user: JwtPayload,
    @Args('memberId', { type: () => ID }) memberId: string,
  ): Promise<MemberCommunicationPrefsType> {
    const prefs = await this.engagementService.getCommunicationPrefs(user.tenantId, memberId);
    return this.transformCommunicationPrefs(prefs);
  }

  @Mutation(() => MemberCommunicationPrefsType, {
    name: 'updateMemberCommunicationPrefs',
    description: 'Update communication preferences for a member',
  })
  async updateMemberCommunicationPrefs(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: UpdateCommunicationPrefsInput,
  ): Promise<MemberCommunicationPrefsType> {
    const prefs = await this.engagementService.updateCommunicationPrefs(user.tenantId, input);
    return this.transformCommunicationPrefs(prefs);
  }

  // ============================================================================
  // TRANSFORM HELPERS
  // ============================================================================

  private transformCategory(category: any): InterestCategoryType {
    return {
      id: category.id,
      code: category.code,
      name: category.name,
      description: category.description ?? undefined,
      icon: category.icon ?? undefined,
      color: category.color ?? undefined,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  private transformMemberInterest(interest: any): MemberInterestType {
    return {
      id: interest.id,
      memberId: interest.memberId,
      categoryId: interest.categoryId,
      interestLevel: interest.interestLevel,
      source: interest.source,
      lastActivityAt: interest.lastActivityAt ?? undefined,
      activityCount: interest.activityCount,
      createdAt: interest.createdAt,
      updatedAt: interest.updatedAt,
      category: interest.category ? this.transformCategory(interest.category) : undefined,
    };
  }

  private transformDependentInterest(interest: any): DependentInterestType {
    return {
      id: interest.id,
      dependentId: interest.dependentId,
      categoryId: interest.categoryId,
      interestLevel: interest.interestLevel,
      createdAt: interest.createdAt,
      updatedAt: interest.updatedAt,
      category: interest.category ? this.transformCategory(interest.category) : undefined,
    };
  }

  private transformCommunicationPrefs(prefs: any): MemberCommunicationPrefsType {
    return {
      id: prefs.id,
      memberId: prefs.memberId,
      emailPromotions: prefs.emailPromotions,
      smsPromotions: prefs.smsPromotions,
      pushNotifications: prefs.pushNotifications,
      unsubscribedCategories: prefs.unsubscribedCategories ?? [],
      createdAt: prefs.createdAt,
      updatedAt: prefs.updatedAt,
    };
  }
}
