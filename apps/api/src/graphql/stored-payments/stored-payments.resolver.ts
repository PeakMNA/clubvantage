import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { StoredPaymentsService } from './stored-payments.service';
import {
  StoredPaymentMethodGraphQLType,
  AutoPaySettingGraphQLType,
  AutoPayAttemptGraphQLType,
  AutoPayResultGraphQLType,
  RemovePaymentMethodResultGraphQLType,
} from './stored-payments.types';
import {
  AddStoredPaymentInput,
  UpdateStoredPaymentInput,
  AutoPaySettingInput,
  ProcessAutoPayInput,
  GetAutoPayHistoryInput,
} from './stored-payments.input';
import { StoredPaymentMethodStatus } from '@prisma/client';

@Resolver()
@UseGuards(GqlAuthGuard)
export class StoredPaymentsResolver {
  constructor(private readonly storedPaymentsService: StoredPaymentsService) {}

  // ============================================================================
  // QUERIES
  // ============================================================================

  @Query(() => [StoredPaymentMethodGraphQLType], {
    name: 'memberPaymentMethods',
    description: 'Get all stored payment methods for a member',
  })
  async getMemberPaymentMethods(
    @Args('memberId', { type: () => ID }) memberId: string,
    @Args('activeOnly', { nullable: true, defaultValue: true }) activeOnly: boolean,
  ): Promise<StoredPaymentMethodGraphQLType[]> {
    const methods = await this.storedPaymentsService.getMemberPaymentMethods(memberId, activeOnly);
    return methods.map((m: any) => this.mapPaymentMethodToGraphQL(m));
  }

  @Query(() => StoredPaymentMethodGraphQLType, {
    name: 'paymentMethod',
    description: 'Get a single stored payment method',
    nullable: true,
  })
  async getPaymentMethod(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<StoredPaymentMethodGraphQLType | null> {
    try {
      const method = await this.storedPaymentsService.getPaymentMethod(id);
      return this.mapPaymentMethodToGraphQL(method);
    } catch {
      return null;
    }
  }

  @Query(() => AutoPaySettingGraphQLType, {
    name: 'memberAutoPaySetting',
    description: 'Get auto-pay settings for a member',
    nullable: true,
  })
  async getMemberAutoPaySetting(
    @Args('memberId', { type: () => ID }) memberId: string,
  ): Promise<AutoPaySettingGraphQLType | null> {
    const setting = await this.storedPaymentsService.getAutoPaySetting(memberId);
    if (!setting) return null;
    return this.mapAutoPaySettingToGraphQL(setting);
  }

  @Query(() => [AutoPayAttemptGraphQLType], {
    name: 'memberAutoPayHistory',
    description: 'Get auto-pay attempt history for a member',
  })
  async getMemberAutoPayHistory(
    @Args('input') input: GetAutoPayHistoryInput,
  ): Promise<AutoPayAttemptGraphQLType[]> {
    const attempts = await this.storedPaymentsService.getMemberAutoPayHistory(
      input.memberId,
      input.limit,
    );
    return attempts.map((a: any) => this.mapAutoPayAttemptToGraphQL(a));
  }

  @Query(() => [AutoPayAttemptGraphQLType], {
    name: 'invoiceAutoPayAttempts',
    description: 'Get auto-pay attempts for an invoice',
  })
  async getInvoiceAutoPayAttempts(
    @Args('invoiceId', { type: () => ID }) invoiceId: string,
  ): Promise<AutoPayAttemptGraphQLType[]> {
    const attempts = await this.storedPaymentsService.getInvoiceAutoPayAttempts(invoiceId);
    return attempts.map((a: any) => this.mapAutoPayAttemptToGraphQL(a));
  }

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  @Mutation(() => StoredPaymentMethodGraphQLType, {
    name: 'addPaymentMethod',
    description: 'Add a new stored payment method',
  })
  async addPaymentMethod(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: AddStoredPaymentInput,
  ): Promise<StoredPaymentMethodGraphQLType> {
    const method = await this.storedPaymentsService.addPaymentMethod(user.tenantId, input);
    return this.mapPaymentMethodToGraphQL(method);
  }

  @Mutation(() => StoredPaymentMethodGraphQLType, {
    name: 'updatePaymentMethod',
    description: 'Update a stored payment method',
  })
  async updatePaymentMethod(
    @Args('input') input: UpdateStoredPaymentInput,
  ): Promise<StoredPaymentMethodGraphQLType> {
    const method = await this.storedPaymentsService.updatePaymentMethod(input);
    return this.mapPaymentMethodToGraphQL(method);
  }

  @Mutation(() => RemovePaymentMethodResultGraphQLType, {
    name: 'removePaymentMethod',
    description: 'Remove a stored payment method',
  })
  async removePaymentMethod(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<RemovePaymentMethodResultGraphQLType> {
    return this.storedPaymentsService.removePaymentMethod(id);
  }

  @Mutation(() => StoredPaymentMethodGraphQLType, {
    name: 'setDefaultPaymentMethod',
    description: 'Set a payment method as default',
  })
  async setDefaultPaymentMethod(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<StoredPaymentMethodGraphQLType> {
    const method = await this.storedPaymentsService.setDefaultPaymentMethod(id);
    return this.mapPaymentMethodToGraphQL(method);
  }

  @Mutation(() => AutoPaySettingGraphQLType, {
    name: 'upsertAutoPaySetting',
    description: 'Create or update auto-pay settings',
  })
  async upsertAutoPaySetting(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: AutoPaySettingInput,
  ): Promise<AutoPaySettingGraphQLType> {
    const setting = await this.storedPaymentsService.upsertAutoPaySetting(user.tenantId, input);
    return this.mapAutoPaySettingToGraphQL(setting);
  }

  @Mutation(() => RemovePaymentMethodResultGraphQLType, {
    name: 'disableAutoPay',
    description: 'Disable auto-pay for a member',
  })
  async disableAutoPay(
    @Args('memberId', { type: () => ID }) memberId: string,
  ): Promise<RemovePaymentMethodResultGraphQLType> {
    return this.storedPaymentsService.disableAutoPay(memberId);
  }

  @Mutation(() => AutoPayResultGraphQLType, {
    name: 'processAutoPay',
    description: 'Manually process an auto-pay for an invoice',
  })
  async processAutoPay(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: ProcessAutoPayInput,
  ): Promise<AutoPayResultGraphQLType> {
    const attempt = await this.storedPaymentsService.createAutoPayAttempt(
      user.tenantId,
      user.sub, // Using user ID as member for admin action
      input.paymentMethodId,
      input.invoiceId,
      input.amount,
    );
    return this.storedPaymentsService.processAutoPayAttempt(attempt.id);
  }

  @Mutation(() => AutoPayResultGraphQLType, {
    name: 'retryAutoPayAttempt',
    description: 'Retry a failed auto-pay attempt',
  })
  async retryAutoPayAttempt(
    @Args('attemptId', { type: () => ID }) attemptId: string,
  ): Promise<AutoPayResultGraphQLType> {
    return this.storedPaymentsService.retryAutoPayAttempt(attemptId, true);
  }

  // ============================================================================
  // MAPPING HELPERS
  // ============================================================================

  private mapPaymentMethodToGraphQL = (method: any): StoredPaymentMethodGraphQLType => ({
    id: method.id,
    clubId: method.clubId,
    memberId: method.memberId,
    stripeCustomerId: method.stripeCustomerId ?? undefined,
    stripePaymentMethodId: method.stripePaymentMethodId,
    type: method.type,
    brand: method.brand,
    last4: method.last4,
    expiryMonth: method.expiryMonth ?? undefined,
    expiryYear: method.expiryYear ?? undefined,
    cardholderName: method.cardholderName ?? undefined,
    status: method.status,
    isDefault: method.isDefault,
    isAutoPayEnabled: method.isAutoPayEnabled,
    verifiedAt: method.verifiedAt ?? undefined,
    lastUsedAt: method.lastUsedAt ?? undefined,
    failureCount: method.failureCount,
    lastFailureReason: method.lastFailureReason ?? undefined,
    createdAt: method.createdAt,
    updatedAt: method.updatedAt,
  });

  private mapAutoPaySettingToGraphQL = (setting: any): AutoPaySettingGraphQLType => ({
    id: setting.id,
    clubId: setting.clubId,
    memberId: setting.memberId,
    paymentMethodId: setting.paymentMethodId,
    isEnabled: setting.isEnabled,
    schedule: setting.schedule,
    paymentDayOfMonth: setting.paymentDayOfMonth ?? undefined,
    maxPaymentAmount: setting.maxPaymentAmount ? Number(setting.maxPaymentAmount) : undefined,
    monthlyMaxAmount: setting.monthlyMaxAmount ? Number(setting.monthlyMaxAmount) : undefined,
    requireApprovalAbove: setting.requireApprovalAbove
      ? Number(setting.requireApprovalAbove)
      : undefined,
    payDuesOnly: setting.payDuesOnly,
    excludeCategories: setting.excludeCategories,
    notifyBeforePayment: setting.notifyBeforePayment,
    notifyDaysBefore: setting.notifyDaysBefore,
    notifyOnSuccess: setting.notifyOnSuccess,
    notifyOnFailure: setting.notifyOnFailure,
    maxRetryAttempts: setting.maxRetryAttempts,
    retryIntervalDays: setting.retryIntervalDays,
    createdAt: setting.createdAt,
    updatedAt: setting.updatedAt,
    paymentMethod: setting.paymentMethod
      ? this.mapPaymentMethodToGraphQL(setting.paymentMethod)
      : undefined,
  });

  private mapAutoPayAttemptToGraphQL = (attempt: any): AutoPayAttemptGraphQLType => ({
    id: attempt.id,
    clubId: attempt.clubId,
    memberId: attempt.memberId,
    paymentMethodId: attempt.paymentMethodId,
    invoiceId: attempt.invoiceId ?? undefined,
    amount: Number(attempt.amount),
    attemptNumber: attempt.attemptNumber,
    status: attempt.status,
    stripePaymentIntentId: attempt.stripePaymentIntentId ?? undefined,
    stripeChargeId: attempt.stripeChargeId ?? undefined,
    processedAt: attempt.processedAt ?? undefined,
    succeededAt: attempt.succeededAt ?? undefined,
    failedAt: attempt.failedAt ?? undefined,
    failureCode: attempt.failureCode ?? undefined,
    failureMessage: attempt.failureMessage ?? undefined,
    nextRetryAt: attempt.nextRetryAt ?? undefined,
    isManualRetry: attempt.isManualRetry,
    paymentTransactionId: attempt.paymentTransactionId ?? undefined,
    createdAt: attempt.createdAt,
    updatedAt: attempt.updatedAt,
    paymentMethod: attempt.paymentMethod
      ? this.mapPaymentMethodToGraphQL(attempt.paymentMethod)
      : undefined,
  });
}
