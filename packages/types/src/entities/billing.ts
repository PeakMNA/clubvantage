/**
 * Billing entity types for ClubVantage
 * Based on PRD-01 data model
 */

export const InvoiceStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  PAID: 'PAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  OVERDUE: 'OVERDUE',
  VOID: 'VOID',
  CANCELLED: 'CANCELLED',
} as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const PaymentMethod = {
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CREDIT_CARD: 'CREDIT_CARD',
  QR_PROMPTPAY: 'QR_PROMPTPAY',
  QR_PAYNOW: 'QR_PAYNOW',
  QR_DUITNOW: 'QR_DUITNOW',
  CHECK: 'CHECK',
  DIRECT_DEBIT: 'DIRECT_DEBIT',
  CREDIT: 'CREDIT',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const BillingTaxType = {
  VAT: 'VAT',
  GST: 'GST',
  SST: 'SST',
  EXEMPT: 'EXEMPT',
} as const;
export type BillingTaxType = (typeof BillingTaxType)[keyof typeof BillingTaxType];

export interface Invoice {
  id: string;
  tenantId: string;
  clubId: string;
  memberId: string;

  // Invoice Details
  invoiceNumber: string;
  taxInvoiceNumber?: string;
  status: InvoiceStatus;

  // Dates
  invoiceDate: Date;
  dueDate: Date;
  paidDate?: Date;

  // Amounts
  subtotal: number;
  taxAmount: number;
  total: number;
  amountPaid: number;
  balance: number;

  // Tax Details
  taxType: BillingTaxType;
  taxRate: number;
  taxId?: string;
  branchId?: string;

  // Currency
  currency: string; // THB, SGD, MYR

  // Notes
  notes?: string;
  internalNotes?: string;

  // Line Items
  lineItems: InvoiceLineItem[];

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  createdById: string;
}

export interface InvoiceLineItem {
  id: string;
  invoiceId: string;
  description: string;
  chargeTypeId?: string;
  quantity: number;
  unitPrice: number;
  taxType: BillingTaxType;
  taxRate: number;
  taxAmount: number;
  amount: number;
  sortOrder: number;
}

export interface ChargeType {
  id: string;
  tenantId: string;
  clubId: string;
  code: string;
  name: string;
  description?: string;
  defaultPrice: number;
  taxType: BillingTaxType;
  category: ChargeCategory;
  isActive: boolean;
  glAccountId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ChargeCategory = {
  MEMBERSHIP_DUES: 'MEMBERSHIP_DUES',
  FACILITY_BOOKING: 'FACILITY_BOOKING',
  GOLF_GREEN_FEE: 'GOLF_GREEN_FEE',
  GOLF_CADDY: 'GOLF_CADDY',
  GOLF_CART: 'GOLF_CART',
  GUEST_FEE: 'GUEST_FEE',
  F_AND_B: 'F_AND_B',
  PRO_SHOP: 'PRO_SHOP',
  SERVICE: 'SERVICE',
  PENALTY: 'PENALTY',
  OTHER: 'OTHER',
} as const;
export type ChargeCategory = (typeof ChargeCategory)[keyof typeof ChargeCategory];

export interface Payment {
  id: string;
  tenantId: string;
  clubId: string;
  memberId: string;

  // Payment Details
  paymentNumber: string;
  receiptNumber?: string;
  method: PaymentMethod;
  status: PaymentStatus;

  // Amount
  amount: number;
  currency: string;

  // Reference
  referenceNumber?: string;
  transactionId?: string;

  // QR Payment Details
  qrPaymentRef?: string;

  // Timestamps
  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;
  createdById: string;

  // Allocations
  allocations: PaymentAllocation[];
}

export interface PaymentAllocation {
  id: string;
  paymentId: string;
  invoiceId: string;
  amount: number;
  createdAt: Date;
}

export interface Receipt {
  id: string;
  tenantId: string;
  paymentId: string;
  memberId: string;
  receiptNumber: string;
  amount: number;
  currency: string;
  issuedDate: Date;
  createdAt: Date;
}

// Aging Report Types
export interface AgingBucket {
  memberId: string;
  memberName: string;
  memberId_display: string;
  current: number;      // 0-30 days
  days30: number;       // 31-60 days
  days60: number;       // 61-90 days
  days90: number;       // 91-120 days
  days120Plus: number;  // 120+ days
  total: number;
}
