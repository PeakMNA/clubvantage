import { Resolver, Query, Mutation, Args, ID, Int, Float } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { assertPermission, AR_PERMISSIONS } from '@/common/decorators/permissions.decorator';

import { ARProfileService } from './ar-profile.service';
import { StatementPeriodService } from './statement-period.service';
import { StatementRunService } from './statement-run.service';
import { StatementService } from './statement.service';
import { CloseChecklistService } from './close-checklist.service';

import { ARProfileGQLType, ARProfileSyncResultType, MemberWithoutARProfileType } from './ar-profile.types';
import { StatementPeriodGQLType, PeriodStatusEnum } from './statement-period.types';
import { StatementRunGQLType, StatementRunTypeEnum, StatementRunStatusEnum } from './statement-run.types';
import { StatementGQLType } from './statement.types';
import { CloseChecklistGQLType, CloseChecklistStepGQLType, CanClosePeriodResultType } from './close-checklist.types';
import { SignOffStepInput, SkipStepInput } from './close-checklist.input';

import {
  CreateARProfileInput,
  UpdateARProfileInput,
  SuspendARProfileInput,
  CloseARProfileInput,
  ARProfileFilterInput,
  SyncARProfilesInput,
} from './ar-profile.input';
import {
  CreateStatementPeriodInput,
  UpdateStatementPeriodInput,
  ReopenStatementPeriodInput,
  StatementPeriodFilterInput,
} from './statement-period.input';
import { CreateStatementRunInput, StatementRunFilterInput } from './statement-run.input';

@Resolver()
@UseGuards(GqlAuthGuard)
export class ARStatementsResolver {
  constructor(
    private arProfileService: ARProfileService,
    private statementPeriodService: StatementPeriodService,
    private statementRunService: StatementRunService,
    private statementService: StatementService,
    private closeChecklistService: CloseChecklistService,
  ) {}

  // ==================== AR PROFILES ====================

  @Query(() => [ARProfileGQLType], { name: 'arProfiles' })
  async getARProfiles(
    @GqlCurrentUser() user: JwtPayload,
    @Args('filter', { nullable: true }) filter?: ARProfileFilterInput,
  ) {
    return this.arProfileService.findAll(user.tenantId, filter);
  }

  @Query(() => ARProfileGQLType, { name: 'arProfile' })
  async getARProfile(@Args('id', { type: () => ID }) id: string) {
    return this.arProfileService.findById(id);
  }

  @Query(() => ARProfileGQLType, { name: 'arProfileByMember', nullable: true })
  async getARProfileByMember(
    @GqlCurrentUser() user: JwtPayload,
    @Args('memberId', { type: () => ID }) memberId: string,
  ) {
    return this.arProfileService.findByMemberId(user.tenantId, memberId);
  }

  @Query(() => ARProfileGQLType, { name: 'arProfileByCityLedger', nullable: true })
  async getARProfileByCityLedger(
    @GqlCurrentUser() user: JwtPayload,
    @Args('cityLedgerId', { type: () => ID }) cityLedgerId: string,
  ) {
    return this.arProfileService.findByCityLedgerId(user.tenantId, cityLedgerId);
  }

  @Mutation(() => ARProfileGQLType)
  async createARProfile(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateARProfileInput,
  ) {
    if (input.profileType === 'MEMBER' && input.memberId) {
      return this.arProfileService.createForMember(
        user.tenantId,
        input.memberId,
        {
          statementDelivery: input.statementDelivery as any,
          paymentTermsDays: input.paymentTermsDays,
          creditLimit: input.creditLimit,
        },
        user.sub,
      );
    } else if (input.profileType === 'CITY_LEDGER' && input.cityLedgerId) {
      // Linked city ledger profile
      return this.arProfileService.createForCityLedger(
        user.tenantId,
        input.cityLedgerId,
        {
          statementDelivery: input.statementDelivery as any,
          paymentTermsDays: input.paymentTermsDays,
          creditLimit: input.creditLimit,
        },
        user.sub,
      );
    } else if (input.profileType === 'CITY_LEDGER' && input.accountName) {
      // Standalone city ledger profile (no linked entity)
      return this.arProfileService.createStandaloneCityLedger(
        user.tenantId,
        {
          accountName: input.accountName,
          contactEmail: input.contactEmail,
          contactPhone: input.contactPhone,
          billingAddress: input.billingAddress,
          taxId: input.taxId,
          businessRegistrationId: input.businessRegistrationId,
          branchName: input.branchName,
          branchCode: input.branchCode,
        },
        {
          statementDelivery: input.statementDelivery as any,
          paymentTermsDays: input.paymentTermsDays,
          creditLimit: input.creditLimit,
        },
        user.sub,
      );
    }
    throw new Error('Invalid profile type or missing required ID/account name');
  }

  @Mutation(() => ARProfileGQLType)
  async updateARProfile(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateARProfileInput,
  ) {
    return this.arProfileService.update(
      id,
      {
        statementDelivery: input.statementDelivery as any,
        paymentTermsDays: input.paymentTermsDays,
        creditLimit: input.creditLimit,
        accountName: input.accountName,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        billingAddress: input.billingAddress,
        taxId: input.taxId,
        businessRegistrationId: input.businessRegistrationId,
        branchName: input.branchName,
        branchCode: input.branchCode,
      },
      user.sub,
    );
  }

  @Mutation(() => ARProfileGQLType)
  async suspendARProfile(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: SuspendARProfileInput,
  ) {
    return this.arProfileService.suspend(id, input.reason, user.sub);
  }

  @Mutation(() => ARProfileGQLType)
  async reactivateARProfile(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.arProfileService.reactivate(id, user.sub);
  }

  @Mutation(() => ARProfileGQLType)
  async closeARProfile(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: CloseARProfileInput,
  ) {
    return this.arProfileService.close(id, input.reason, user.sub);
  }

  // ==================== AR PROFILE SYNC ====================

  @Query(() => Int, { name: 'membersWithoutARProfilesCount', description: 'Count of active members without AR profiles' })
  async getMembersWithoutARProfilesCount(@GqlCurrentUser() user: JwtPayload) {
    return this.arProfileService.getMembersWithoutARProfilesCount(user.tenantId);
  }

  @Query(() => [MemberWithoutARProfileType], { name: 'membersWithoutARProfiles', description: 'List of active members without AR profiles' })
  async getMembersWithoutARProfiles(@GqlCurrentUser() user: JwtPayload) {
    const members = await this.arProfileService.getMembersWithoutARProfiles(user.tenantId);
    return members.map(m => ({
      id: m.id,
      memberId: m.memberId,
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      membershipTypeName: m.membershipType?.name,
    }));
  }

  @Mutation(() => ARProfileSyncResultType, { description: 'Create AR profiles for all active members who do not have one' })
  async syncMembersToARProfiles(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input', { nullable: true }) input?: SyncARProfilesInput,
  ) {
    return this.arProfileService.syncMembersToARProfiles(
      user.tenantId,
      {
        statementDelivery: input?.statementDelivery as any,
        paymentTermsDays: input?.paymentTermsDays,
      },
      user.sub,
    );
  }

  @Mutation(() => ARProfileSyncResultType, { description: 'Create AR profiles for all active city ledgers who do not have one' })
  async syncCityLedgersToARProfiles(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input', { nullable: true }) input?: SyncARProfilesInput,
  ) {
    return this.arProfileService.syncCityLedgersToARProfiles(
      user.tenantId,
      {
        statementDelivery: input?.statementDelivery as any,
        paymentTermsDays: input?.paymentTermsDays,
      },
      user.sub,
    );
  }

  // ==================== STATEMENT PERIODS ====================

  @Query(() => [StatementPeriodGQLType], { name: 'statementPeriods' })
  async getStatementPeriods(
    @GqlCurrentUser() user: JwtPayload,
    @Args('filter', { nullable: true }) filter?: StatementPeriodFilterInput,
  ) {
    return this.statementPeriodService.findAll(user.tenantId, filter);
  }

  @Query(() => StatementPeriodGQLType, { name: 'statementPeriod' })
  async getStatementPeriod(@Args('id', { type: () => ID }) id: string) {
    return this.statementPeriodService.findById(id);
  }

  @Query(() => StatementPeriodGQLType, { name: 'currentStatementPeriod', nullable: true })
  async getCurrentStatementPeriod(@GqlCurrentUser() user: JwtPayload) {
    return this.statementPeriodService.getCurrentOpenPeriod(user.tenantId);
  }

  @Mutation(() => StatementPeriodGQLType)
  async createStatementPeriod(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateStatementPeriodInput,
  ) {
    return this.statementPeriodService.create(user.tenantId, {
      periodYear: input.periodYear,
      periodNumber: input.periodNumber,
      periodLabel: input.periodLabel,
      periodStart: new Date(input.periodStart),
      periodEnd: new Date(input.periodEnd),
      cutoffDate: new Date(input.cutoffDate),
    });
  }

  @Mutation(() => StatementPeriodGQLType, {
    description: 'Update statement period dates and label (only for OPEN or REOPENED periods)',
  })
  async updateStatementPeriod(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateStatementPeriodInput,
  ) {
    return this.statementPeriodService.update(id, {
      periodLabel: input.periodLabel,
      periodStart: input.periodStart ? new Date(input.periodStart) : undefined,
      periodEnd: input.periodEnd ? new Date(input.periodEnd) : undefined,
      cutoffDate: input.cutoffDate ? new Date(input.cutoffDate) : undefined,
    });
  }

  @Mutation(() => StatementPeriodGQLType)
  async closeStatementPeriod(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ) {
    assertPermission(user.permissions, AR_PERMISSIONS.CLOSE_PERIOD);
    return this.statementPeriodService.close(id, user.sub);
  }

  @Mutation(() => StatementPeriodGQLType)
  async reopenStatementPeriod(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: ReopenStatementPeriodInput,
  ) {
    assertPermission(user.permissions, AR_PERMISSIONS.REOPEN_PERIOD);
    return this.statementPeriodService.reopen(id, input.reason, user.sub);
  }

  @Mutation(() => Boolean)
  async deleteStatementPeriod(@Args('id', { type: () => ID }) id: string) {
    await this.statementPeriodService.delete(id);
    return true;
  }

  // ==================== STATEMENT RUNS ====================

  @Query(() => [StatementRunGQLType], { name: 'statementRuns' })
  async getStatementRuns(
    @GqlCurrentUser() user: JwtPayload,
    @Args('filter', { nullable: true }) filter?: StatementRunFilterInput,
  ) {
    return this.statementRunService.findAll(user.tenantId, filter);
  }

  @Query(() => StatementRunGQLType, { name: 'statementRun' })
  async getStatementRun(@Args('id', { type: () => ID }) id: string) {
    return this.statementRunService.findById(id);
  }

  @Query(() => [StatementRunGQLType], { name: 'statementRunsByPeriod' })
  async getStatementRunsByPeriod(
    @Args('periodId', { type: () => ID }) periodId: string,
  ) {
    return this.statementRunService.findByPeriod(periodId);
  }

  @Mutation(() => StatementRunGQLType)
  async startStatementRun(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateStatementRunInput,
  ) {
    return this.statementRunService.start(
      user.tenantId,
      input.statementPeriodId,
      input.runType as any,
      input.profileIds,
      user.sub,
    );
  }

  @Mutation(() => StatementRunGQLType)
  async cancelStatementRun(@Args('id', { type: () => ID }) id: string) {
    return this.statementRunService.cancel(id);
  }

  // ==================== STATEMENTS ====================

  @Query(() => [StatementGQLType], { name: 'statements' })
  async getStatements(
    @Args('runId', { type: () => ID }) runId: string,
    @Args('minBalance', { type: () => Float, nullable: true }) minBalance?: number,
    @Args('maxBalance', { type: () => Float, nullable: true }) maxBalance?: number,
  ) {
    return this.statementService.findByRun(runId, { minBalance, maxBalance });
  }

  @Query(() => StatementGQLType, { name: 'statement' })
  async getStatement(@Args('id', { type: () => ID }) id: string) {
    return this.statementService.findById(id);
  }

  @Query(() => [StatementGQLType], { name: 'memberStatements' })
  async getMemberStatements(
    @Args('memberId', { type: () => ID }) memberId: string,
  ) {
    return this.statementService.findByMember(memberId);
  }

  @Query(() => [StatementGQLType], { name: 'cityLedgerStatements' })
  async getCityLedgerStatements(
    @Args('cityLedgerId', { type: () => ID }) cityLedgerId: string,
  ) {
    return this.statementService.findByCityLedger(cityLedgerId);
  }

  @Query(() => [StatementGQLType], { name: 'profileStatements' })
  async getProfileStatements(
    @Args('arProfileId', { type: () => ID }) arProfileId: string,
    @Args('onlyFinal', { type: () => Boolean, defaultValue: true }) onlyFinal: boolean,
  ) {
    return this.statementService.findByProfile(arProfileId, onlyFinal);
  }

  @Mutation(() => StatementGQLType)
  async updateStatementDeliveryStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('channel') channel: string,
    @Args('status') status: string,
    @Args('error', { nullable: true }) error?: string,
  ) {
    return this.statementService.updateDeliveryStatus(
      id,
      channel as 'email' | 'print' | 'portal' | 'sms',
      status as any,
      error,
    );
  }

  @Mutation(() => StatementGQLType)
  async markStatementPortalViewed(@Args('id', { type: () => ID }) id: string) {
    return this.statementService.markPortalViewed(id);
  }

  // ==================== CLOSE CHECKLIST ====================

  @Query(() => CloseChecklistGQLType, { name: 'closeChecklist', nullable: true })
  async getCloseChecklist(
    @Args('periodId', { type: () => ID }) periodId: string,
  ) {
    return this.closeChecklistService.getByPeriod(periodId);
  }

  @Mutation(() => CloseChecklistGQLType)
  async createCloseChecklist(
    @GqlCurrentUser() user: JwtPayload,
    @Args('periodId', { type: () => ID }) periodId: string,
  ) {
    return this.closeChecklistService.createForPeriod(user.tenantId, periodId);
  }

  @Mutation(() => CloseChecklistStepGQLType)
  async signOffChecklistStep(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: SignOffStepInput,
  ) {
    assertPermission(user.permissions, AR_PERMISSIONS.SIGN_OFF_CHECKLIST);
    return this.closeChecklistService.signOffStep(input.stepId, user.sub, input.notes);
  }

  @Mutation(() => CloseChecklistStepGQLType)
  async runAutoVerification(
    @Args('stepId', { type: () => ID }) stepId: string,
  ) {
    return this.closeChecklistService.runAutoVerification(stepId);
  }

  @Mutation(() => CloseChecklistStepGQLType)
  async skipChecklistStep(
    @Args('input') input: SkipStepInput,
  ) {
    return this.closeChecklistService.skipStep(input.stepId, input.notes);
  }

  @Mutation(() => CloseChecklistGQLType)
  async runAllAutoChecks(
    @Args('checklistId', { type: () => ID }) checklistId: string,
  ) {
    return this.closeChecklistService.runAllAutoChecks(checklistId);
  }

  @Query(() => CanClosePeriodResultType, { name: 'canClosePeriod' })
  async getCanClosePeriod(
    @Args('checklistId', { type: () => ID }) checklistId: string,
  ) {
    return this.closeChecklistService.canClosePeriod(checklistId);
  }
}
