import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { SubAccountsService } from './sub-accounts.service';
import {
  SubAccountGraphQLType,
  SubAccountTransactionGraphQLType,
  SubAccountLimitCheckGraphQLType,
  PinVerificationResultGraphQLType,
} from './sub-accounts.types';
import {
  CreateSubAccountInput,
  UpdateSubAccountInput,
  VerifyPinInput,
  ChangePinInput,
  ChangeSubAccountStatusInput,
  RecordTransactionInput,
  CheckLimitInput,
  GetTransactionsInput,
} from './sub-accounts.input';
import { SubAccountStatus } from '@prisma/client';

@Resolver()
@UseGuards(GqlAuthGuard)
export class SubAccountsResolver {
  constructor(private readonly subAccountsService: SubAccountsService) {}

  // ============================================================================
  // QUERIES
  // ============================================================================

  @Query(() => [SubAccountGraphQLType], {
    name: 'subAccounts',
    description: 'Get all sub-accounts for the club',
  })
  async getSubAccounts(
    @GqlCurrentUser() user: JwtPayload,
    @Args('status', { type: () => SubAccountStatus, nullable: true }) status?: SubAccountStatus,
  ): Promise<SubAccountGraphQLType[]> {
    const subAccounts = await this.subAccountsService.getSubAccounts(user.tenantId, status);
    return subAccounts.map((sa) => this.mapSubAccountToGraphQL(sa));
  }

  @Query(() => SubAccountGraphQLType, {
    name: 'subAccount',
    description: 'Get a sub-account by ID',
    nullable: true,
  })
  async getSubAccount(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SubAccountGraphQLType | null> {
    try {
      const subAccount = await this.subAccountsService.getSubAccount(id);
      return this.mapSubAccountToGraphQL(subAccount);
    } catch {
      return null;
    }
  }

  @Query(() => [SubAccountGraphQLType], {
    name: 'memberSubAccounts',
    description: 'Get sub-accounts for a member',
  })
  async getMemberSubAccounts(
    @Args('memberId', { type: () => ID }) memberId: string,
    @Args('activeOnly', { nullable: true, defaultValue: true }) activeOnly: boolean,
  ): Promise<SubAccountGraphQLType[]> {
    const subAccounts = await this.subAccountsService.getSubAccountsByMember(memberId, activeOnly);
    return subAccounts.map((sa) => this.mapSubAccountToGraphQL(sa));
  }

  @Query(() => SubAccountLimitCheckGraphQLType, {
    name: 'checkSubAccountLimit',
    description: 'Check if a sub-account can make a transaction',
  })
  async checkLimit(
    @Args('input') input: CheckLimitInput,
  ): Promise<SubAccountLimitCheckGraphQLType> {
    const result = await this.subAccountsService.checkCanTransact(
      input.subAccountId,
      input.amount,
      input.category,
    );
    return {
      ...result,
      dailyLimit: result.dailyLimit ?? undefined,
      weeklyLimit: result.weeklyLimit ?? undefined,
      monthlyLimit: result.monthlyLimit ?? undefined,
      perTransactionLimit: result.perTransactionLimit ?? undefined,
    };
  }

  @Query(() => [SubAccountTransactionGraphQLType], {
    name: 'subAccountTransactions',
    description: 'Get transactions for sub-accounts',
  })
  async getTransactions(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: GetTransactionsInput,
  ): Promise<SubAccountTransactionGraphQLType[]> {
    if (input.subAccountId && !input.startDate && !input.endDate) {
      const transactions = await this.subAccountsService.getTransactions(input.subAccountId);
      return transactions.map((t) => this.mapTransactionToGraphQL(t));
    }

    const startDate = input.startDate ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = input.endDate ?? new Date();

    const transactions = await this.subAccountsService.getTransactionsByDateRange(
      user.tenantId,
      startDate,
      endDate,
      input.subAccountId,
    );
    return transactions.map((t) => this.mapTransactionToGraphQL(t));
  }

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  @Mutation(() => SubAccountGraphQLType, {
    name: 'createSubAccount',
    description: 'Create a new sub-account',
  })
  async createSubAccount(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreateSubAccountInput,
  ): Promise<SubAccountGraphQLType> {
    const subAccount = await this.subAccountsService.createSubAccount(user.tenantId, input);
    return this.mapSubAccountToGraphQL(subAccount);
  }

  @Mutation(() => SubAccountGraphQLType, {
    name: 'updateSubAccount',
    description: 'Update a sub-account',
  })
  async updateSubAccount(
    @Args('input') input: UpdateSubAccountInput,
  ): Promise<SubAccountGraphQLType> {
    const subAccount = await this.subAccountsService.updateSubAccount(input);
    return this.mapSubAccountToGraphQL(subAccount);
  }

  @Mutation(() => PinVerificationResultGraphQLType, {
    name: 'verifySubAccountPin',
    description: 'Verify a sub-account PIN',
  })
  async verifyPin(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: VerifyPinInput,
  ): Promise<PinVerificationResultGraphQLType> {
    try {
      const success = await this.subAccountsService.verifyPin(input, user.sub);
      return {
        success,
        message: success ? 'PIN verified successfully' : 'Invalid PIN',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Mutation(() => SubAccountGraphQLType, {
    name: 'changeSubAccountPin',
    description: 'Change a sub-account PIN',
  })
  async changePin(
    @Args('input') input: ChangePinInput,
  ): Promise<SubAccountGraphQLType> {
    const subAccount = await this.subAccountsService.changePin(
      input.subAccountId,
      input.newPin,
    );
    return this.mapSubAccountToGraphQL(subAccount);
  }

  @Mutation(() => SubAccountGraphQLType, {
    name: 'changeSubAccountStatus',
    description: 'Change a sub-account status',
  })
  async changeStatus(
    @Args('input') input: ChangeSubAccountStatusInput,
  ): Promise<SubAccountGraphQLType> {
    const subAccount = await this.subAccountsService.changeStatus(
      input.subAccountId,
      input.status,
    );
    return this.mapSubAccountToGraphQL(subAccount);
  }

  @Mutation(() => SubAccountGraphQLType, {
    name: 'unlockSubAccountPin',
    description: 'Unlock a locked sub-account PIN',
  })
  async unlockPin(
    @Args('subAccountId', { type: () => ID }) subAccountId: string,
  ): Promise<SubAccountGraphQLType> {
    const subAccount = await this.subAccountsService.unlockPin(subAccountId);
    return this.mapSubAccountToGraphQL(subAccount);
  }

  @Mutation(() => SubAccountGraphQLType, {
    name: 'deleteSubAccount',
    description: 'Delete (revoke) a sub-account',
  })
  async deleteSubAccount(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<SubAccountGraphQLType> {
    const subAccount = await this.subAccountsService.deleteSubAccount(id);
    return this.mapSubAccountToGraphQL(subAccount);
  }

  @Mutation(() => SubAccountTransactionGraphQLType, {
    name: 'recordSubAccountTransaction',
    description: 'Record a transaction for a sub-account',
  })
  async recordTransaction(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: RecordTransactionInput,
  ): Promise<SubAccountTransactionGraphQLType> {
    const transaction = await this.subAccountsService.recordTransaction(
      user.tenantId,
      input,
      user.sub,
    );
    return this.mapTransactionToGraphQL(transaction);
  }

  @Mutation(() => SubAccountGraphQLType, {
    name: 'resetSubAccountSpending',
    description: 'Reset all spending counters for a sub-account',
  })
  async resetSpending(
    @Args('subAccountId', { type: () => ID }) subAccountId: string,
  ): Promise<SubAccountGraphQLType> {
    const subAccount = await this.subAccountsService.resetAllSpending(subAccountId);
    return this.mapSubAccountToGraphQL(subAccount);
  }

  // ============================================================================
  // MAPPING HELPERS
  // ============================================================================

  private mapSubAccountToGraphQL = (subAccount: any): SubAccountGraphQLType => ({
    id: subAccount.id,
    clubId: subAccount.clubId,
    memberId: subAccount.memberId,
    name: subAccount.name,
    relationship: subAccount.relationship,
    email: subAccount.email,
    phone: subAccount.phone,
    status: subAccount.status,
    validFrom: subAccount.validFrom,
    validUntil: subAccount.validUntil,
    permissions: subAccount.permissions,
    dailyLimit: subAccount.dailyLimit ? Number(subAccount.dailyLimit) : undefined,
    weeklyLimit: subAccount.weeklyLimit ? Number(subAccount.weeklyLimit) : undefined,
    monthlyLimit: subAccount.monthlyLimit ? Number(subAccount.monthlyLimit) : undefined,
    perTransactionLimit: subAccount.perTransactionLimit
      ? Number(subAccount.perTransactionLimit)
      : undefined,
    dailySpend: Number(subAccount.dailySpend),
    weeklySpend: Number(subAccount.weeklySpend),
    monthlySpend: Number(subAccount.monthlySpend),
    lastResetDaily: subAccount.lastResetDaily,
    lastResetWeekly: subAccount.lastResetWeekly,
    lastResetMonthly: subAccount.lastResetMonthly,
    notifyPrimaryOnUse: subAccount.notifyPrimaryOnUse,
    notifyOnLimitReached: subAccount.notifyOnLimitReached,
    pinAttempts: subAccount.pinAttempts,
    pinLockedUntil: subAccount.pinLockedUntil,
    createdAt: subAccount.createdAt,
    updatedAt: subAccount.updatedAt,
  });

  private mapTransactionToGraphQL = (transaction: any): SubAccountTransactionGraphQLType => ({
    id: transaction.id,
    clubId: transaction.clubId,
    subAccountId: transaction.subAccountId,
    amount: Number(transaction.amount),
    description: transaction.description,
    category: transaction.category,
    paymentTransactionId: transaction.paymentTransactionId,
    lineItemId: transaction.lineItemId,
    teeTimeId: transaction.teeTimeId,
    verifiedAt: transaction.verifiedAt,
    verifiedBy: transaction.verifiedBy,
    locationName: transaction.locationName,
    notes: transaction.notes,
    createdAt: transaction.createdAt,
    subAccount: transaction.subAccount
      ? this.mapSubAccountToGraphQL(transaction.subAccount)
      : undefined,
  });
}
