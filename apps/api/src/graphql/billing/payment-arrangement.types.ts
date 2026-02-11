import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { Paginated } from '../common/pagination';
import { MemberSummaryBillingType, InvoiceType } from './billing.types';

export enum ArrangementFrequencyEnum {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum ArrangementStatusEnum {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DEFAULTED = 'DEFAULTED',
  CANCELLED = 'CANCELLED',
}

export enum InstallmentStatusEnum {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  WAIVED = 'WAIVED',
}

registerEnumType(ArrangementFrequencyEnum, {
  name: 'ArrangementFrequency',
  description: 'Payment arrangement frequency',
});

registerEnumType(ArrangementStatusEnum, {
  name: 'ArrangementStatus',
  description: 'Payment arrangement status',
});

registerEnumType(InstallmentStatusEnum, {
  name: 'InstallmentStatus',
  description: 'Installment payment status',
});

@ObjectType()
export class ArrangementInstallmentType {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  installmentNo: number;

  @Field()
  dueDate: Date;

  @Field()
  amount: string;

  @Field()
  paidAmount: string;

  @Field(() => InstallmentStatusEnum)
  status: InstallmentStatusEnum;

  @Field(() => ID, { nullable: true })
  paymentId?: string;

  @Field({ nullable: true })
  paidAt?: Date;
}

@ObjectType()
export class ArrangementInvoiceType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  invoiceId: string;

  @Field(() => InvoiceType, { nullable: true })
  invoice?: InvoiceType;
}

@ObjectType()
export class PaymentArrangementType {
  @Field(() => ID)
  id: string;

  @Field()
  arrangementNumber: string;

  @Field()
  totalAmount: string;

  @Field()
  paidAmount: string;

  @Field()
  remainingAmount: string;

  @Field(() => Int)
  installmentCount: number;

  @Field(() => ArrangementFrequencyEnum)
  frequency: ArrangementFrequencyEnum;

  @Field()
  startDate: Date;

  @Field()
  endDate: Date;

  @Field(() => ArrangementStatusEnum)
  status: ArrangementStatusEnum;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  approvedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => MemberSummaryBillingType, { nullable: true })
  member?: MemberSummaryBillingType;

  @Field(() => [ArrangementInstallmentType])
  installments: ArrangementInstallmentType[];

  @Field(() => [ArrangementInvoiceType])
  invoices: ArrangementInvoiceType[];
}

@ObjectType()
export class PaymentArrangementConnection extends Paginated(PaymentArrangementType) {}
