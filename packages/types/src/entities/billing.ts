/**
 * Billing entity types for ClubVantage
 * Based on PRD-01 data model
 */

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'VOID' | 'CANCELLED';

export type PaymentMethod =
  | 'CASH'
  | 'BANK_TRANSFER'
  | 'CREDIT_CARD'
  | 'QR_PROMPTPAY'  // Thailand
  | 'QR_PAYNOW'     // Singapore
  | 'QR_DUITNOW'    // Malaysia
  | 'CHECK'
  | 'DIRECT_DEBIT'
  | 'CREDIT';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type TaxType = 'VAT' | 'GST' | 'SST' | 'EXEMPT';

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
  taxType: TaxType;
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
  taxType: TaxType;
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
  taxType: TaxType;
  category: ChargeCategory;
  isActive: boolean;
  glAccountId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ChargeCategory =
  | 'MEMBERSHIP_DUES'
  | 'FACILITY_BOOKING'
  | 'GOLF_GREEN_FEE'
  | 'GOLF_CADDY'
  | 'GOLF_CART'
  | 'GUEST_FEE'
  | 'F_AND_B'
  | 'PRO_SHOP'
  | 'SERVICE'
  | 'PENALTY'
  | 'OTHER';

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
