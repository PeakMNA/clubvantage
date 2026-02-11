import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PaymentArrangementService } from '@/modules/billing/payment-arrangement.service';
import { GqlAuthGuard } from '../guards/gql-auth.guard';
import { GqlCurrentUser } from '../common/decorators/gql-current-user.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import {
  PaymentArrangementType,
  PaymentArrangementConnection,
  ArrangementInstallmentType,
  ArrangementInvoiceType,
} from './payment-arrangement.types';
import {
  CreatePaymentArrangementInput,
  RecordInstallmentPaymentInput,
  PaymentArrangementsQueryArgs,
} from './payment-arrangement.input';
import { encodeCursor } from '../common/pagination';

@Resolver(() => PaymentArrangementType)
@UseGuards(GqlAuthGuard)
export class PaymentArrangementResolver {
  constructor(
    private readonly arrangementService: PaymentArrangementService,
  ) {}

  @Query(() => PaymentArrangementConnection, { name: 'paymentArrangements' })
  async getArrangements(
    @GqlCurrentUser() user: JwtPayload,
    @Args() args: PaymentArrangementsQueryArgs,
  ): Promise<PaymentArrangementConnection> {
    const { first, skip, memberId, status } = args;
    const page = skip ? Math.floor(skip / (first || 20)) + 1 : 1;
    const limit = first || 20;

    const { arrangements, totalCount } =
      await this.arrangementService.getArrangements(user.tenantId, {
        memberId,
        status,
        page,
        limit,
      });

    const edges = arrangements.map((a: any) => ({
      node: this.transform(a),
      cursor: encodeCursor(a.id),
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return {
      edges,
      pageInfo: {
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
        startCursor: edges.length > 0 ? edges[0].cursor : null,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      },
      totalCount,
    };
  }

  @Query(() => PaymentArrangementType, { name: 'paymentArrangement' })
  async getArrangement(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<PaymentArrangementType> {
    const arrangement = await this.arrangementService.getArrangement(
      user.tenantId,
      id,
    );
    return this.transform(arrangement);
  }

  @Mutation(() => PaymentArrangementType, { name: 'createPaymentArrangement' })
  async createArrangement(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: CreatePaymentArrangementInput,
  ): Promise<PaymentArrangementType> {
    const arrangement = await this.arrangementService.createArrangement(
      user.tenantId,
      {
        memberId: input.memberId,
        invoiceIds: input.invoiceIds,
        installmentCount: input.installmentCount,
        frequency: input.frequency,
        startDate: input.startDate.toISOString(),
        notes: input.notes,
      },
      user.sub,
    );
    return this.transform(arrangement);
  }

  @Mutation(() => PaymentArrangementType, { name: 'activatePaymentArrangement' })
  async activateArrangement(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<PaymentArrangementType> {
    const arrangement = await this.arrangementService.activateArrangement(
      user.tenantId,
      id,
      user.sub,
    );
    return this.transform(arrangement);
  }

  @Mutation(() => PaymentArrangementType, { name: 'recordInstallmentPayment' })
  async recordInstallmentPayment(
    @GqlCurrentUser() user: JwtPayload,
    @Args('input') input: RecordInstallmentPaymentInput,
  ): Promise<PaymentArrangementType> {
    const arrangement = await this.arrangementService.recordInstallmentPayment(
      user.tenantId,
      input.arrangementId,
      input.installmentId,
      input.paymentId,
      input.amount,
      user.sub,
    );
    return this.transform(arrangement);
  }

  @Mutation(() => PaymentArrangementType, { name: 'cancelPaymentArrangement' })
  async cancelArrangement(
    @GqlCurrentUser() user: JwtPayload,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<PaymentArrangementType> {
    const arrangement = await this.arrangementService.cancelArrangement(
      user.tenantId,
      id,
      user.sub,
    );
    return this.transform(arrangement);
  }

  private transform(arrangement: any): PaymentArrangementType {
    return {
      id: arrangement.id,
      arrangementNumber: arrangement.arrangementNumber,
      totalAmount: arrangement.totalAmount?.toString() || '0',
      paidAmount: arrangement.paidAmount?.toString() || '0',
      remainingAmount: arrangement.remainingAmount?.toString() || '0',
      installmentCount: arrangement.installmentCount,
      frequency: arrangement.frequency,
      startDate: arrangement.startDate,
      endDate: arrangement.endDate,
      status: arrangement.status,
      notes: arrangement.notes,
      approvedAt: arrangement.approvedAt,
      createdAt: arrangement.createdAt,
      updatedAt: arrangement.updatedAt,
      member: arrangement.member
        ? {
            id: arrangement.member.id,
            memberId: arrangement.member.memberId,
            firstName: arrangement.member.firstName,
            lastName: arrangement.member.lastName,
          }
        : undefined,
      installments:
        arrangement.installments?.map((inst: any) => ({
          id: inst.id,
          installmentNo: inst.installmentNo,
          dueDate: inst.dueDate,
          amount: inst.amount?.toString() || '0',
          paidAmount: inst.paidAmount?.toString() || '0',
          status: inst.status,
          paymentId: inst.paymentId,
          paidAt: inst.paidAt,
        })) || [],
      invoices:
        arrangement.invoices?.map((ai: any) => ({
          id: ai.id,
          invoiceId: ai.invoiceId,
          invoice: ai.invoice
            ? {
                id: ai.invoice.id,
                invoiceNumber: ai.invoice.invoiceNumber,
                invoiceDate: ai.invoice.invoiceDate,
                dueDate: ai.invoice.dueDate,
                totalAmount: ai.invoice.totalAmount?.toString() || '0',
                balanceDue: ai.invoice.balanceDue?.toString() || '0',
                status: ai.invoice.status,
                subtotal: ai.invoice.subtotal?.toString() || '0',
                taxAmount: ai.invoice.taxAmount?.toString() || '0',
                discountAmount: ai.invoice.discountAmount?.toString() || '0',
                paidAmount: ai.invoice.paidAmount?.toString() || '0',
                createdAt: ai.invoice.createdAt,
                updatedAt: ai.invoice.updatedAt,
                lineItems: [],
              }
            : undefined,
        })) || [],
    };
  }
}
