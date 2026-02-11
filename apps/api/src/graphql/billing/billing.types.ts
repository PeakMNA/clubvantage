import { ObjectType, Field, ID, Int, registerEnumType } from '@nestjs/graphql';
import { Paginated } from '../common/pagination';
import { InvoiceStatus } from '@/modules/billing/dto/invoice-query.dto';
import { PaymentMethod } from '@/modules/billing/dto/create-payment.dto';
import {
  ARCycleType,
  ARCloseBehavior,
} from '@/modules/billing/dto/club-billing-settings.dto';

// Re-export and register enums for GraphQL
export { InvoiceStatus, PaymentMethod, ARCycleType, ARCloseBehavior };

// City Ledger enums
export enum CityLedgerTypeEnum {
  CORPORATE = 'CORPORATE',
  HOUSE = 'HOUSE',
  VENDOR = 'VENDOR',
  OTHER = 'OTHER',
}

export enum CityLedgerStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

// AR Account type discriminator
export enum ArAccountType {
  MEMBER = 'MEMBER',
  CITY_LEDGER = 'CITY_LEDGER',
}

registerEnumType(CityLedgerTypeEnum, {
  name: 'CityLedgerAccountType',
  description: 'City ledger account type',
});

registerEnumType(CityLedgerStatusEnum, {
  name: 'CityLedgerStatus',
  description: 'City ledger account status',
});

registerEnumType(ArAccountType, {
  name: 'ArAccountType',
  description: 'AR account type discriminator',
});

registerEnumType(InvoiceStatus, {
  name: 'InvoiceStatus',
  description: 'Invoice status options',
});

registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
  description: 'Payment method options',
});

registerEnumType(ARCycleType, {
  name: 'ARCycleType',
  description: 'AR billing cycle type for period generation',
});

registerEnumType(ARCloseBehavior, {
  name: 'ARCloseBehavior',
  description: 'How AR periods are closed',
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
export class PaymentAllocationType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  invoiceId: string;

  @Field()
  invoiceNumber: string;

  @Field()
  amount: string;

  @Field()
  balanceAfter: string;
}

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

  @Field({ nullable: true })
  status?: string;

  @Field()
  createdAt: Date;

  @Field(() => MemberSummaryBillingType, { nullable: true })
  member?: MemberSummaryBillingType;

  @Field(() => [PaymentAllocationType], { nullable: true })
  allocations?: PaymentAllocationType[];
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
  id: string; // 'CURRENT' | 'DAYS_30' | 'DAYS_60' | 'DAYS_90' | 'SUSPENDED'

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
  status: string; // 'CURRENT' | 'DAYS_30' | 'DAYS_60' | 'DAYS_90' | 'SUSPENDED'
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

// City Ledger Types
@ObjectType()
export class CityLedgerType {
  @Field(() => ID)
  id: string;

  @Field()
  accountNumber: string;

  @Field()
  accountName: string;

  @Field(() => CityLedgerTypeEnum)
  accountType: CityLedgerTypeEnum;

  @Field({ nullable: true })
  contactName?: string;

  @Field({ nullable: true })
  contactEmail?: string;

  @Field({ nullable: true })
  contactPhone?: string;

  @Field({ nullable: true })
  billingAddress?: string;

  @Field({ nullable: true })
  taxId?: string;

  @Field({ nullable: true })
  creditLimit?: string;

  @Field()
  creditBalance: string;

  @Field()
  outstandingBalance: string;

  @Field()
  paymentTerms: number;

  @Field(() => CityLedgerStatusEnum)
  status: CityLedgerStatusEnum;

  @Field({ nullable: true })
  notes?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class CityLedgerConnection extends Paginated(CityLedgerType) {}

// AR Account Search Result - unified type for Member and City Ledger search
@ObjectType()
export class ArAccountSearchResult {
  @Field(() => ID)
  id: string;

  @Field(() => ArAccountType)
  accountType: ArAccountType;

  @Field()
  accountNumber: string;

  @Field()
  accountName: string;

  @Field({ nullable: true })
  subType?: string; // Membership type for members, CityLedgerType for city ledger

  @Field()
  outstandingBalance: string;

  @Field()
  creditBalance: string;

  @Field()
  invoiceCount: number;

  @Field({ nullable: true })
  agingStatus?: string; // 'CURRENT' | 'DAYS_30' | 'DAYS_60' | 'DAYS_90' | 'SUSPENDED'

  @Field({ nullable: true })
  photoUrl?: string;

  @Field({ nullable: true })
  dependentCount?: number; // For members with dependents
}

// FIFO Allocation types
@ObjectType()
export class FifoAllocationItem {
  @Field(() => ID)
  invoiceId: string;

  @Field()
  invoiceNumber: string;

  @Field()
  dueDate: Date;

  @Field()
  balance: string;

  @Field()
  allocatedAmount: string;
}

@ObjectType()
export class FifoAllocationPreview {
  @Field(() => [FifoAllocationItem])
  allocations: FifoAllocationItem[];

  @Field()
  totalAllocated: string;

  @Field()
  remainingPayment: string;

  @Field()
  creditToAdd: string;
}

// Batch Settlement Result
@ObjectType()
export class BatchSettlementAllocation {
  @Field(() => ID)
  invoiceId: string;

  @Field()
  invoiceNumber: string;

  @Field()
  amount: string;

  @Field()
  previousBalance: string;

  @Field()
  newBalance: string;
}

@ObjectType()
export class BatchSettlementResult {
  @Field(() => ID)
  paymentId: string;

  @Field()
  receiptNumber: string;

  @Field(() => [BatchSettlementAllocation])
  allocations: BatchSettlementAllocation[];

  @Field()
  totalAllocated: string;

  @Field()
  creditAdded: string;

  @Field()
  newOutstandingBalance: string;

  @Field()
  newCreditBalance: string;
}

// Batch Invoice Result types
@ObjectType()
export class BatchInvoiceErrorType {
  @Field()
  memberId: string;

  @Field({ nullable: true })
  memberName?: string;

  @Field()
  error: string;
}

@ObjectType()
export class BatchInvoiceResultType {
  @Field()
  createdCount: number;

  @Field()
  failedCount: number;

  @Field(() => [InvoiceType])
  invoices: InvoiceType[];

  @Field(() => [BatchInvoiceErrorType])
  errors: BatchInvoiceErrorType[];
}

// Statement types for member statement generation
@ObjectType()
export class MemberStatementInfoType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  memberNumber: string;

  @Field()
  membershipType: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  address?: string;
}

@ObjectType()
export class StatementType {
  @Field(() => MemberStatementInfoType)
  member: MemberStatementInfoType;

  @Field()
  periodStart: Date;

  @Field()
  periodEnd: Date;

  @Field()
  openingBalance: string;

  @Field()
  closingBalance: string;

  @Field(() => [MemberTransactionType])
  transactions: MemberTransactionType[];
}

// AR Period Settings Type
@ObjectType()
export class ARPeriodSettingsType {
  @Field(() => ARCycleType)
  arCycleType: ARCycleType;

  @Field(() => Int)
  arCustomCycleStartDay: number;

  @Field(() => Int)
  arCutoffDays: number;

  @Field(() => ARCloseBehavior)
  arCloseBehavior: ARCloseBehavior;

  @Field()
  arAutoGenerateNext: boolean;
}
