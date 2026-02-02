import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Paginated } from '../common/pagination';
import { InvoiceStatus } from '@/modules/billing/dto/invoice-query.dto';
import { PaymentMethod } from '@/modules/billing/dto/create-payment.dto';

// Re-export and register enums for GraphQL
export { InvoiceStatus, PaymentMethod };

registerEnumType(InvoiceStatus, {
  name: 'InvoiceStatus',
  description: 'Invoice status options',
});

registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
  description: 'Payment method options',
});

@ObjectType()
export class MemberSummaryBillingType {
  @Field(() => ID)
  id: string;

  @Field()
  memberId: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;
}

@ObjectType()
export class ChargeTypeType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  code: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  defaultPrice?: string;

  @Field()
  taxable: boolean;

  @Field({ nullable: true })
  category?: string;
}

@ObjectType()
export class InvoiceLineItemType {
  @Field(() => ID)
  id: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  quantity: number;

  @Field()
  unitPrice: string;

  @Field()
  discountPct: string;

  @Field({ nullable: true })
  taxType?: string;

  @Field()
  taxRate: string;

  @Field()
  lineTotal: string;

  @Field(() => ChargeTypeType, { nullable: true })
  chargeType?: ChargeTypeType;
}

@ObjectType()
export class PaymentSummaryType {
  @Field(() => ID)
  id: string;

  @Field()
  receiptNumber: string;

  @Field()
  amount: string;

  @Field(() => PaymentMethod)
  method: PaymentMethod;

  @Field()
  paymentDate: Date;
}

@ObjectType()
export class PaymentAllocationSummaryType {
  @Field(() => ID)
  id: string;

  @Field()
  amount: string;

  @Field(() => PaymentSummaryType)
  payment: PaymentSummaryType;
}

@ObjectType()
export class InvoiceType {
  @Field(() => ID)
  id: string;

  @Field()
  invoiceNumber: string;

  @Field()
  invoiceDate: Date;

  @Field()
  dueDate: Date;

  @Field({ nullable: true })
  billingPeriod?: string;

  @Field()
  subtotal: string;

  @Field()
  taxAmount: string;

  @Field()
  discountAmount: string;

  @Field()
  totalAmount: string;

  @Field()
  paidAmount: string;

  @Field()
  balanceDue: string;

  @Field(() => InvoiceStatus)
  status: InvoiceStatus;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  internalNotes?: string;

  @Field({ nullable: true })
  sentAt?: Date;

  @Field({ nullable: true })
  viewedAt?: Date;

  @Field({ nullable: true })
  paidDate?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => MemberSummaryBillingType, { nullable: true })
  member?: MemberSummaryBillingType;

  @Field(() => [InvoiceLineItemType])
  lineItems: InvoiceLineItemType[];

  @Field(() => [PaymentAllocationSummaryType], { nullable: true })
  payments?: PaymentAllocationSummaryType[];
}

@ObjectType()
export class InvoiceConnection extends Paginated(InvoiceType) {}

@ObjectType()
export class PaymentType {
  @Field(() => ID)
  id: string;

  @Field()
  receiptNumber: string;

  @Field()
  amount: string;

  @Field(() => PaymentMethod)
  method: PaymentMethod;

  @Field()
  paymentDate: Date;

  @Field({ nullable: true })
  referenceNumber?: string;

  @Field({ nullable: true })
  bankName?: string;

  @Field({ nullable: true })
  accountLast4?: string;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  createdAt: Date;

  @Field(() => MemberSummaryBillingType, { nullable: true })
  member?: MemberSummaryBillingType;
}

@ObjectType()
export class PaymentConnection extends Paginated(PaymentType) {}

@ObjectType()
export class BillingStatsType {
  @Field()
  totalRevenue: string;

  @Field()
  outstandingBalance: string;

  @Field()
  overdueAmount: string;

  @Field()
  invoiceCount: number;

  @Field()
  paidCount: number;

  @Field()
  overdueCount: number;
}

// Transaction type for A/R history - combines invoices and payments
@ObjectType()
export class MemberTransactionType {
  @Field(() => ID)
  id: string;

  @Field()
  date: Date;

  @Field()
  type: string; // 'INVOICE' | 'PAYMENT' | 'CREDIT' | 'ADJUSTMENT'

  @Field()
  description: string;

  @Field({ nullable: true })
  invoiceNumber?: string;

  @Field()
  amount: string;

  @Field()
  runningBalance: string;
}

@ObjectType()
export class MemberTransactionsType {
  @Field(() => [MemberTransactionType])
  transactions: MemberTransactionType[];

  @Field()
  currentBalance: string;
}

// AR Aging types for aging dashboard
@ObjectType()
export class AgingBucketType {
  @Field()
  id: string; // 'current' | '30' | '60' | '90' | 'suspended'

  @Field()
  label: string;

  @Field()
  memberCount: number;

  @Field()
  totalAmount: string;

  @Field()
  percentage: number;
}

@ObjectType()
export class AgingMemberType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  photoUrl?: string;

  @Field()
  memberNumber: string;

  @Field()
  membershipType: string;

  @Field()
  oldestInvoiceDate: Date;

  @Field()
  balance: string;

  @Field()
  daysOutstanding: number;

  @Field()
  status: string; // 'current' | '30' | '60' | '90' | 'suspended'
}

@ObjectType()
export class ReinstatedMemberType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  clearedDate: Date;

  @Field()
  previousBalance: string;

  @Field(() => ID)
  receiptId: string;

  @Field()
  receiptNumber: string;
}

@ObjectType()
export class ArAgingReportType {
  @Field(() => [AgingBucketType])
  buckets: AgingBucketType[];

  @Field(() => [AgingMemberType])
  members: AgingMemberType[];

  @Field(() => [ReinstatedMemberType])
  reinstatedMembers: ReinstatedMemberType[];

  @Field()
  totalCount: number;
}

// Credit Note types
export enum CreditNoteType {
  REFUND = 'REFUND',
  ADJUSTMENT = 'ADJUSTMENT',
  COURTESY = 'COURTESY',
  PROMO = 'PROMO',
  WRITE_OFF = 'WRITE_OFF',
  RETURN = 'RETURN',
  CANCELLATION = 'CANCELLATION',
}

export enum CreditNoteReason {
  BILLING_ERROR = 'BILLING_ERROR',
  DUPLICATE_CHARGE = 'DUPLICATE_CHARGE',
  SERVICE_NOT_RENDERED = 'SERVICE_NOT_RENDERED',
  MEMBERSHIP_CANCELLATION = 'MEMBERSHIP_CANCELLATION',
  PRODUCT_RETURN = 'PRODUCT_RETURN',
  PRICE_ADJUSTMENT = 'PRICE_ADJUSTMENT',
  CUSTOMER_SATISFACTION = 'CUSTOMER_SATISFACTION',
  EVENT_CANCELLATION = 'EVENT_CANCELLATION',
  RAIN_CHECK = 'RAIN_CHECK',
  OVERPAYMENT = 'OVERPAYMENT',
  OTHER = 'OTHER',
}

export enum CreditNoteStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  APPLIED = 'APPLIED',
  PARTIALLY_APPLIED = 'PARTIALLY_APPLIED',
  REFUNDED = 'REFUNDED',
  VOIDED = 'VOIDED',
}

registerEnumType(CreditNoteType, {
  name: 'CreditNoteType',
  description: 'Credit note type options',
});

registerEnumType(CreditNoteReason, {
  name: 'CreditNoteReason',
  description: 'Credit note reason options',
});

registerEnumType(CreditNoteStatus, {
  name: 'CreditNoteStatus',
  description: 'Credit note status options',
});

@ObjectType()
export class CreditNoteLineItemType {
  @Field(() => ID)
  id: string;

  @Field()
  description: string;

  @Field()
  quantity: number;

  @Field()
  unitPrice: string;

  @Field()
  lineTotal: string;

  @Field()
  taxable: boolean;

  @Field()
  taxRate: string;

  @Field()
  taxAmount: string;

  @Field(() => ChargeTypeType, { nullable: true })
  chargeType?: ChargeTypeType;
}

@ObjectType()
export class CreditNoteApplicationType {
  @Field(() => ID)
  id: string;

  @Field()
  amountApplied: string;

  @Field()
  appliedAt: Date;

  @Field(() => InvoiceType, { nullable: true })
  invoice?: InvoiceType;
}

@ObjectType()
export class CreditNoteGraphQLType {
  @Field(() => ID)
  id: string;

  @Field()
  creditNoteNumber: string;

  @Field()
  issueDate: Date;

  @Field(() => CreditNoteType)
  type: CreditNoteType;

  @Field(() => CreditNoteReason)
  reason: CreditNoteReason;

  @Field({ nullable: true })
  reasonDetail?: string;

  @Field()
  subtotal: string;

  @Field()
  taxAmount: string;

  @Field()
  totalAmount: string;

  @Field()
  appliedToBalance: string;

  @Field()
  refundedAmount: string;

  @Field(() => CreditNoteStatus)
  status: CreditNoteStatus;

  @Field({ nullable: true })
  internalNotes?: string;

  @Field({ nullable: true })
  memberVisibleNotes?: string;

  @Field({ nullable: true })
  approvedAt?: Date;

  @Field({ nullable: true })
  voidedAt?: Date;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => MemberSummaryBillingType, { nullable: true })
  member?: MemberSummaryBillingType;

  @Field(() => [CreditNoteLineItemType])
  lineItems: CreditNoteLineItemType[];

  @Field(() => [CreditNoteApplicationType], { nullable: true })
  applications?: CreditNoteApplicationType[];
}

@ObjectType()
export class CreditNoteConnection extends Paginated(CreditNoteGraphQLType) {}
