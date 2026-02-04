# Accounts Receivable Management Configuration Reference

**Date:** 2026-02-02
**Purpose:** Comprehensive reference of all accounts receivable and billing configuration options for club operations

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Billing Configuration](#2-billing-configuration)
3. [Invoice Management](#3-invoice-management)
4. [Payment Processing](#4-payment-processing)
5. [Payment Receipts & Multi-Invoice Settlement](#5-payment-receipts--multi-invoice-settlement)
6. [Tax Invoices & Receipts](#6-tax-invoices--receipts)
7. [Credit Notes & Adjustments](#7-credit-notes--adjustments)
8. [Credit Card Surcharges & Convenience Fees](#8-credit-card-surcharges--convenience-fees)
9. [Tax Configuration & Withholding Tax](#9-tax-configuration--withholding-tax)
10. [Credit Management](#10-credit-management)
11. [Auto-Pay & Recurring Billing](#11-auto-pay--recurring-billing)
12. [Accounts Receivable & Collections](#12-accounts-receivable--collections)
13. [Minimum Spend Requirements](#13-minimum-spend-requirements)
14. [Sub-Accounts & Authorized Users](#14-sub-accounts--authorized-users)
15. [Statements & Document Generation](#15-statements--document-generation)
16. [Reporting & Analytics](#16-reporting--analytics)
17. [Implementation Priority Matrix](#17-implementation-priority-matrix)

---

## 1. System Overview

### Configuration Hierarchy

```
Club Settings (global billing defaults)
└── Member Account
    ├── Invoices
    │   └── Line Items
    ├── Payments
    │   └── Allocations (to invoices)
    └── Credit Balance
```

### Core Entities

| Entity | Purpose | Key Relationships |
|--------|---------|-------------------|
| Invoice | Billing document | LineItems, Member, Payments |
| LineItem | Individual charge | Invoice, ChargeType |
| Payment | Received funds | Allocations, Invoices |
| PaymentAllocation | Links payment to invoice | Payment, Invoice |
| Receipt | Payment confirmation | Payment, Allocations |
| CreditNote | Reversal/adjustment | Invoice, Member |

---

## 2. Billing Configuration

### 2.1 Billing Cycles

| Cycle | Description | Use Case |
|-------|-------------|----------|
| **Monthly** | Bill on same day each month | Steady cash flow |
| **Quarterly** | Bill every 3 months | Reduce processing |
| **Semi-Annual** | Bill twice yearly | Seasonal clubs |
| **Annual** | Bill once per year | Simplicity |
| **Custom** | Flexible schedule | Special arrangements |

### 2.2 Billing Schedule Configuration

```typescript
interface BillingScheduleConfig {
  id: string;
  clubId: string;
  name: string;                    // "Standard Monthly"

  // Frequency
  frequency: BillingFrequency;
  billingDayOfMonth: number;       // 1-28

  // For non-monthly
  billingMonths?: number[];        // [1, 4, 7, 10] for quarterly

  // Due Date
  paymentTermsDays: number;        // Net 30

  // Late Fees
  lateFeeEnabled: boolean;
  lateFeeType: 'FIXED' | 'PERCENTAGE';
  lateFeeAmount: number;           // $25 or 1.5%
  lateFeeGraceDays: number;        // 5 days
  lateFeeMaximum?: number;         // Cap at $100

  // Proration
  prorationEnabled: boolean;
  prorationMethod: 'DAILY' | 'HALF_MONTH' | 'FULL_MONTH';

  // Deferred Revenue
  deferredRevenueEnabled: boolean; // Recognize over period

  // Automation
  autoGenerateInvoices: boolean;
  generateDaysBefore: number;      // 7 days before billing date
  autoSendInvoices: boolean;
  sendMethod: 'EMAIL' | 'PAPER' | 'BOTH';
}

enum BillingFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  ANNUAL = 'ANNUAL',
  CUSTOM = 'CUSTOM',
}
```

### 2.3 Charge Types

```typescript
interface ChargeType {
  id: string;
  clubId: string;

  // Identity
  name: string;                    // "Monthly Dues"
  code: string;                    // "DUES-MTH"
  description?: string;
  category: ChargeCategory;

  // Pricing
  defaultPrice?: number;

  // Tax
  taxable: boolean;
  taxRate?: number;                // Override default
  taxType: 'INCLUSIVE' | 'EXCLUSIVE';

  // Accounting
  glCode: string;                  // General ledger code
  revenueAccountId?: string;

  // Behavior
  isRecurring: boolean;
  isRefundable: boolean;
  requiresApproval: boolean;
  approvalThreshold?: number;
}

enum ChargeCategory {
  DUES = 'DUES',
  F_AND_B = 'F_AND_B',
  GOLF = 'GOLF',
  PRO_SHOP = 'PRO_SHOP',
  SPA = 'SPA',
  FITNESS = 'FITNESS',
  EVENTS = 'EVENTS',
  LOCKER = 'LOCKER',
  STORAGE = 'STORAGE',
  FEES = 'FEES',
  LATE_FEES = 'LATE_FEES',
  CREDITS = 'CREDITS',
  OTHER = 'OTHER',
}
```

---

## 3. Invoice Management

### 3.1 Invoice Structure

```typescript
interface Invoice {
  id: string;
  memberId: string;
  clubId: string;

  // Identity
  invoiceNumber: string;           // INV-2026-00001
  invoiceDate: Date;
  dueDate: Date;

  // Period
  periodStart?: Date;
  periodEnd?: Date;

  // Amounts
  subtotal: number;
  taxAmount: number;
  surchargeAmount: number;
  discountAmount: number;
  totalAmount: number;

  // Status
  status: InvoiceStatus;
  paidAmount: number;
  balanceAmount: number;

  // Payment
  paymentTermsDays: number;

  // Line Items
  lineItems: InvoiceLineItem[];

  // Notes
  notes?: string;
  internalNotes?: string;

  // Audit
  createdAt: Date;
  createdBy: string;
  sentAt?: Date;
  paidAt?: Date;
  voidedAt?: Date;
  voidedBy?: string;
  voidReason?: string;
}

enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  SENT = 'SENT',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  VOIDED = 'VOIDED',
  WRITTEN_OFF = 'WRITTEN_OFF',
}
```

### 3.2 Invoice Line Items

```typescript
interface InvoiceLineItem {
  id: string;
  invoiceId: string;

  // Details
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;

  // Tax
  taxable: boolean;
  taxRate: number;
  taxAmount: number;

  // Category
  chargeTypeId: string;
  category: ChargeCategory;

  // Reference
  referenceType?: 'TEE_TIME' | 'POS_TRANSACTION' | 'EVENT' | 'RECURRING';
  referenceId?: string;

  // Date
  serviceDate?: Date;

  // Accounting
  glCode?: string;
}
```

### 3.3 Invoice Configuration

```typescript
interface InvoiceConfig {
  clubId: string;

  // Numbering
  invoicePrefix: string;           // "INV"
  invoiceNumberFormat: string;     // "INV-{YYYY}-{NNNNNN}"
  nextInvoiceNumber: number;

  // Templates
  invoiceTemplateId: string;
  emailTemplateId: string;

  // Terms
  defaultPaymentTermsDays: number; // 30

  // Display
  showLineItemDates: boolean;
  showTaxBreakdown: boolean;
  showPaymentHistory: boolean;
  showAgingOnInvoice: boolean;

  // Consolidation
  consolidateByCategory: boolean;
  maxLineItemsBeforeConsolidation: number;
}
```

---

## 4. Payment Processing

### 4.1 Payment Methods

| Method | Code | Description | Integration |
|--------|------|-------------|------------|
| **Cash** | `CASH` | Physical currency | Manual entry |
| **Check** | `CHECK` | Paper check | Manual entry |
| **Credit Card** | `CREDIT_CARD` | Visa, MC, Amex | Stripe |
| **Bank Transfer** | `BANK_TRANSFER` | Wire/ACH | Manual or auto |
| **QR PromptPay** | `QR_PROMPTPAY` | Thailand QR | Auto confirm |
| **QR PayNow** | `QR_PAYNOW` | Singapore QR | Auto confirm |
| **QR DuitNow** | `QR_DUITNOW` | Malaysia QR | Auto confirm |
| **Direct Debit** | `DIRECT_DEBIT` | Bank account debit | Scheduled |
| **Credit Balance** | `CREDIT` | Apply account credit | Automatic |
| **Member Account** | `ACCOUNT` | Charge to account | Creates AR |

### 4.2 Payment Configuration

```typescript
interface PaymentConfig {
  clubId: string;

  // Receipt Numbering
  receiptPrefix: string;           // "RCP"
  receiptNumberFormat: string;     // "RCP-{YYYY}-{NNNNNN}"
  nextReceiptNumber: number;

  // Accepted Methods
  acceptedMethods: PaymentMethod[];

  // Processing
  stripeEnabled: boolean;
  stripeAccountId?: string;

  // Surcharges
  creditCardSurchargeEnabled: boolean;
  creditCardSurchargePercent: number;  // 2.5%
  surchargeAppliesTo: PaymentMethod[];

  // Minimums
  minimumPaymentAmount: number;    // $10

  // Overpayment
  allowOverpayment: boolean;
  overpaymentAction: 'CREDIT_BALANCE' | 'REFUND' | 'ASK';

  // Partial Payments
  allowPartialPayments: boolean;

  // Allocation
  defaultAllocationMethod: 'OLDEST_FIRST' | 'NEWEST_FIRST' | 'MANUAL' | 'PROPORTIONAL';

  // Withholding Tax (WHT)
  whtEnabled: boolean;             // Thailand, etc.
  whtDefaultRate: number;          // 3%
  whtRequiresCertificate: boolean;
}
```

### 4.3 Payment Data Model

```typescript
interface Payment {
  id: string;
  memberId: string;
  clubId: string;

  // Identity
  paymentNumber: string;           // PAY-2026-00001
  receiptNumber: string;           // RCP-2026-00001

  // Amount
  amount: number;                  // Total payment amount
  currency: string;

  // Method
  paymentMethod: PaymentMethod;
  referenceNumber?: string;        // Check #, transaction ID

  // Card Details (if card payment)
  cardBrand?: string;              // Visa, Mastercard
  cardLast4?: string;              // 4242
  cardExpiryMonth?: number;
  cardExpiryYear?: number;

  // Bank Details (if bank transfer)
  bankName?: string;
  bankAccountLast4?: string;

  // Status
  status: PaymentStatus;

  // Allocation
  allocatedAmount: number;
  unallocatedAmount: number;
  allocations: PaymentAllocation[];

  // Surcharges
  surchargeAmount: number;
  surchargeWaived: boolean;

  // Withholding Tax
  whtAmount: number;
  whtCertificateNumber?: string;
  whtCertificateUrl?: string;

  // Dates
  paymentDate: Date;
  receivedAt: Date;
  processedAt?: Date;

  // Notes
  notes?: string;
  internalNotes?: string;

  // Audit
  createdAt: Date;
  createdBy: string;
  voidedAt?: Date;
  voidedBy?: string;
  voidReason?: string;
}

enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  VOIDED = 'VOIDED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}
```

---

## 5. Payment Receipts & Multi-Invoice Settlement

### 5.1 Receipt Data Model

```typescript
interface PaymentReceipt {
  id: string;
  paymentId: string;
  memberId: string;
  clubId: string;

  // Identity
  receiptNumber: string;           // RCP-2026-00001
  receiptDate: Date;

  // Payment Summary
  paymentAmount: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;

  // Allocation Summary
  totalAllocated: number;
  totalUnallocated: number;
  invoicesSettled: ReceiptInvoiceSettlement[];

  // Totals Before Payment
  previousBalance: number;
  currentBalance: number;

  // Surcharges & Fees
  surchargeAmount: number;
  whtAmount: number;

  // Document
  pdfUrl?: string;
  emailedAt?: Date;
  printedAt?: Date;

  // Audit
  generatedAt: Date;
  generatedBy: string;
}

interface ReceiptInvoiceSettlement {
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  invoiceTotal: number;
  previouslyPaid: number;
  amountApplied: number;           // Amount from this payment
  remainingBalance: number;
  fullySettled: boolean;
}
```

### 5.2 Multi-Invoice Payment Allocation

```typescript
interface PaymentAllocation {
  id: string;
  paymentId: string;
  invoiceId: string;

  // Amount
  amount: number;

  // Auto or Manual
  allocationType: 'AUTO' | 'MANUAL';
  allocationMethod: 'OLDEST_FIRST' | 'NEWEST_FIRST' | 'PROPORTIONAL' | 'SPECIFIC';

  // Tracking
  allocatedBy?: string;
  allocatedAt: Date;

  // Reversal
  reversed: boolean;
  reversedAt?: Date;
  reversedBy?: string;
  reversalReason?: string;
}

// Multi-Invoice Settlement Rules
interface AllocationRules {
  // Priority Order for automatic allocation
  priorityOrder: ChargeCategory[];  // [LATE_FEES, DUES, F_AND_B, ...]

  // Split Rules
  allowSplitAcrossInvoices: boolean;
  allowSplitWithinInvoice: boolean;  // Partial line item payment
  allowPartialInvoicePayment: boolean;

  // Restrictions
  requireFullInvoicePayment: boolean;
  applyToOldestFirst: boolean;

  // Overpayment
  createCreditForOverpayment: boolean;
  maxCreditBalance?: number;
}
```

### 5.3 Settlement Workflow

```typescript
interface PaymentSettlementRequest {
  memberId: string;
  paymentAmount: number;
  paymentMethod: PaymentMethod;
  paymentReference?: string;

  // Allocation Strategy
  allocationStrategy: 'AUTO' | 'MANUAL';

  // For AUTO allocation
  autoAllocationMethod?: 'OLDEST_FIRST' | 'NEWEST_FIRST' | 'PROPORTIONAL';

  // For MANUAL allocation - specify exact amounts per invoice
  manualAllocations?: {
    invoiceId: string;
    amount: number;
  }[];

  // Surcharge handling
  includeSurcharge: boolean;
  surchargeAmount?: number;

  // WHT handling
  whtAmount?: number;
  whtCertificateNumber?: string;
}

interface PaymentSettlementResult {
  payment: Payment;
  receipt: PaymentReceipt;

  // Settled invoices
  settledInvoices: {
    invoiceId: string;
    invoiceNumber: string;
    amountApplied: number;
    newStatus: InvoiceStatus;
    fullyPaid: boolean;
  }[];

  // Remaining
  unallocatedAmount: number;
  creditCreated?: number;

  // Errors
  warnings: string[];
}
```

### 5.4 Receipt Display Configuration

```typescript
interface ReceiptDisplayConfig {
  clubId: string;

  // Header
  showClubLogo: boolean;
  showClubAddress: boolean;
  showMemberDetails: boolean;

  // Content
  showInvoiceBreakdown: boolean;   // List each invoice settled
  showLineItemDetail: boolean;     // Show line items per invoice
  showPaymentHistory: boolean;     // Recent payments
  showAccountSummary: boolean;     // Opening/closing balance
  showAgingBuckets: boolean;

  // Tax Details
  showTaxBreakdown: boolean;
  showTaxInvoiceNumber: boolean;
  showWHTDetails: boolean;

  // Footer
  showPaymentTerms: boolean;
  showContactInfo: boolean;
  showQRCode: boolean;             // For mobile payments
  customFooterText?: string;

  // Format
  paperSize: 'LETTER' | 'A4' | 'THERMAL';
  orientation: 'PORTRAIT' | 'LANDSCAPE';
}
```

### 5.5 Batch Payment Processing

```typescript
interface BatchPaymentImport {
  id: string;
  clubId: string;

  // Import Details
  fileName: string;
  importDate: Date;
  source: 'BANK_FILE' | 'STRIPE_EXPORT' | 'MANUAL_UPLOAD';

  // Processing
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;

  // Results
  paymentsCreated: string[];       // Payment IDs
  errors: BatchPaymentError[];

  // Audit
  importedBy: string;
  processedAt?: Date;
}

interface BatchPaymentError {
  rowNumber: number;
  memberIdentifier?: string;
  amount?: number;
  errorMessage: string;
  errorCode: string;
}
```

---

## 6. Tax Invoices & Receipts

### 6.1 Tax Invoice Configuration

```typescript
interface TaxInvoiceConfig {
  clubId: string;

  // Tax Invoice Numbering (separate from regular invoice)
  taxInvoicePrefix: string;        // "TI"
  taxInvoiceNumberFormat: string;  // "TI-{YYYY}-{NNNNNN}"
  nextTaxInvoiceNumber: number;

  // Tax Receipt Numbering
  taxReceiptPrefix: string;        // "TR"
  taxReceiptNumberFormat: string;
  nextTaxReceiptNumber: number;

  // Club Tax Registration
  taxRegistrationNumber: string;   // VAT number, GST number
  taxRegistrationName: string;
  taxRegistrationAddress: string;

  // Requirements
  requireTaxInvoiceForB2B: boolean;
  autoGenerateTaxInvoice: boolean;
  taxInvoiceThreshold?: number;    // Generate only for amounts > $X

  // Display
  showTaxBreakdownByRate: boolean;
  showGrossAndNet: boolean;
  showTaxRegistrationProminently: boolean;
}
```

### 6.2 Tax Invoice Data Model

```typescript
interface TaxInvoice {
  id: string;
  invoiceId: string;               // Link to source invoice
  memberId: string;
  clubId: string;

  // Identity
  taxInvoiceNumber: string;        // TI-2026-00001
  issueDate: Date;

  // Seller (Club)
  sellerTaxId: string;
  sellerName: string;
  sellerAddress: string;

  // Buyer (Member)
  buyerTaxId?: string;             // Member's tax ID if provided
  buyerName: string;
  buyerAddress: string;

  // Amounts
  subtotalExcludingTax: number;
  taxBreakdown: TaxBreakdownLine[];
  totalTax: number;
  grandTotal: number;

  // Line Items (aggregated by tax rate)
  lineItems: TaxInvoiceLineItem[];

  // Status
  status: 'ISSUED' | 'VOIDED' | 'REPLACED';
  replacedByTaxInvoiceId?: string;

  // Document
  pdfUrl?: string;

  // Audit
  issuedAt: Date;
  issuedBy: string;
  voidedAt?: Date;
  voidedBy?: string;
  voidReason?: string;
}

interface TaxBreakdownLine {
  taxRate: number;                 // 7%, 10%
  taxType: string;                 // "VAT", "GST", "Sales Tax"
  taxableAmount: number;
  taxAmount: number;
}

interface TaxInvoiceLineItem {
  description: string;
  quantity: number;
  unitPriceExcludingTax: number;
  taxRate: number;
  taxAmount: number;
  lineTotalIncludingTax: number;
  glCode?: string;
}
```

### 6.3 Tax Receipt Data Model

```typescript
interface TaxReceipt {
  id: string;
  paymentId: string;
  memberId: string;
  clubId: string;

  // Identity
  taxReceiptNumber: string;        // TR-2026-00001
  issueDate: Date;

  // Seller (Club)
  sellerTaxId: string;
  sellerName: string;
  sellerAddress: string;

  // Buyer (Member)
  buyerTaxId?: string;
  buyerName: string;
  buyerAddress: string;

  // Payment Details
  paymentAmount: number;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  paymentReference?: string;

  // Invoices Settled
  settledInvoices: TaxReceiptSettlement[];

  // Tax Summary
  totalTaxableAmount: number;
  totalTaxAmount: number;
  taxBreakdown: TaxBreakdownLine[];

  // WHT (if applicable)
  whtApplied: boolean;
  whtAmount?: number;
  whtRate?: number;
  whtCertificateNumber?: string;

  // Net Received
  grossPayment: number;
  lessWHT: number;
  netReceived: number;

  // Status
  status: 'ISSUED' | 'VOIDED';

  // Document
  pdfUrl?: string;

  // Audit
  issuedAt: Date;
  issuedBy: string;
}

interface TaxReceiptSettlement {
  taxInvoiceId?: string;
  taxInvoiceNumber?: string;
  invoiceId: string;
  invoiceNumber: string;
  invoiceDate: Date;
  invoiceTotal: number;
  amountApplied: number;
  taxablePortionApplied: number;
  taxPortionApplied: number;
}
```

### 6.4 Multi-Invoice Tax Receipt

When a single payment settles multiple invoices, the tax receipt must show:

```typescript
interface MultiInvoiceTaxReceipt extends TaxReceipt {
  // Summary header
  settlementSummary: {
    totalInvoices: number;
    totalInvoiceAmount: number;
    totalPreviouslyPaid: number;
    totalPaymentApplied: number;
    totalRemainingBalance: number;
  };

  // Invoice-by-invoice breakdown
  invoiceSettlements: {
    invoiceNumber: string;
    taxInvoiceNumber?: string;
    invoiceDate: Date;
    originalAmount: number;
    previouslyPaid: number;
    thisPayment: number;
    newBalance: number;
    fullySettled: boolean;

    // Tax breakdown per invoice
    taxableAmount: number;
    taxAmount: number;
    taxRate: number;
  }[];

  // Aggregate tax summary
  aggregateTaxSummary: {
    taxRate: number;
    totalTaxableFromAllInvoices: number;
    totalTaxFromAllInvoices: number;
  }[];
}
```

### 6.5 Annual Tax Summary Certificate

```typescript
interface AnnualTaxSummary {
  id: string;
  memberId: string;
  clubId: string;
  taxYear: number;

  // Member Details
  memberName: string;
  memberTaxId?: string;
  memberAddress: string;

  // Summary
  totalDuesPaid: number;           // For tax deduction purposes
  totalOtherChargesPaid: number;
  totalPayments: number;
  totalWHTWithheld: number;

  // Breakdown by Category
  categoryBreakdown: {
    category: ChargeCategory;
    totalPaid: number;
    taxable: boolean;
  }[];

  // WHT Summary (if applicable)
  whtSummary: {
    whtRate: number;
    totalBase: number;
    totalWHT: number;
    certificates: string[];        // Certificate numbers
  };

  // Document
  certificateNumber: string;
  issueDate: Date;
  pdfUrl?: string;

  // Audit
  generatedAt: Date;
  generatedBy: string;
}
```

---

## 7. Credit Notes & Adjustments

### 7.1 Credit Note Overview

Credit notes are used to reduce the amount owed by a member, either by reversing charges (refunds) or issuing credits for future use.

```typescript
interface CreditNoteConfig {
  clubId: string;

  // Numbering
  creditNotePrefix: string;        // "CN"
  creditNoteNumberFormat: string;  // "CN-{YYYY}-{NNNNNN}"
  nextCreditNoteNumber: number;

  // Approval
  requireApproval: boolean;
  approvalThreshold: number;       // Require approval for CN > $100
  approverRoles: string[];

  // Limits
  maxCreditNoteAmount?: number;    // Cap at $5000
  maxCreditNotesPerDay?: number;   // Rate limiting

  // Application
  autoApplyToBalance: boolean;     // Automatically reduce AR
  allowRefundToCard: boolean;      // Allow refund to original payment method
  allowRefundByCheck: boolean;

  // Tax Handling
  reverseTaxOnCredit: boolean;     // Also credit back tax
  generateCreditTaxDocument: boolean;
}
```

### 7.2 Credit Note Data Model

```typescript
interface CreditNote {
  id: string;
  clubId: string;
  memberId: string;

  // Identity
  creditNoteNumber: string;        // CN-2026-00001
  issueDate: Date;

  // Type
  type: CreditNoteType;
  reason: CreditNoteReason;
  reasonDetail?: string;

  // Source Reference
  sourceType?: 'INVOICE' | 'PAYMENT' | 'MANUAL';
  sourceInvoiceId?: string;        // If reversing specific invoice
  sourcePaymentId?: string;        // If refunding payment
  sourceLineItemIds?: string[];    // Specific line items being credited

  // Amounts
  subtotal: number;
  taxAmount: number;
  totalAmount: number;

  // Line Items
  lineItems: CreditNoteLineItem[];

  // Application
  applicationMethod: 'BALANCE' | 'REFUND' | 'BOTH';
  appliedToBalance: number;
  refundedAmount: number;

  // Refund Details (if applicable)
  refundMethod?: 'ORIGINAL_PAYMENT' | 'CHECK' | 'BANK_TRANSFER' | 'CASH';
  refundReference?: string;
  refundedAt?: Date;

  // Invoices Affected
  appliedToInvoices: CreditNoteApplication[];

  // Status
  status: CreditNoteStatus;

  // Approval
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;

  // Notes
  internalNotes?: string;
  memberVisibleNotes?: string;

  // Documents
  pdfUrl?: string;

  // Audit
  createdBy: string;
  createdAt: Date;
  voidedBy?: string;
  voidedAt?: Date;
  voidReason?: string;
}

enum CreditNoteType {
  REFUND = 'REFUND',               // Reversing a payment
  ADJUSTMENT = 'ADJUSTMENT',        // Correcting an error
  COURTESY = 'COURTESY',           // Goodwill credit
  PROMO = 'PROMO',                 // Promotional credit
  WRITE_OFF = 'WRITE_OFF',         // Writing off bad debt
  RETURN = 'RETURN',               // Product return
  CANCELLATION = 'CANCELLATION',   // Service cancellation
}

enum CreditNoteReason {
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

enum CreditNoteStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  APPLIED = 'APPLIED',
  PARTIALLY_APPLIED = 'PARTIALLY_APPLIED',
  REFUNDED = 'REFUNDED',
  VOIDED = 'VOIDED',
}
```

### 7.3 Credit Note Line Items

```typescript
interface CreditNoteLineItem {
  id: string;
  creditNoteId: string;

  // Reference (if crediting specific charge)
  originalInvoiceId?: string;
  originalLineItemId?: string;

  // Details
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;

  // Tax
  taxable: boolean;
  taxRate: number;
  taxAmount: number;

  // Category
  chargeTypeId?: string;
  category?: ChargeCategory;

  // Accounting
  glCode?: string;
  revenueAccountId?: string;
}
```

### 7.4 Credit Note Application

```typescript
interface CreditNoteApplication {
  id: string;
  creditNoteId: string;
  invoiceId: string;

  // Application
  amountApplied: number;
  appliedAt: Date;
  appliedBy: string;

  // Invoice Impact
  invoiceBalanceBefore: number;
  invoiceBalanceAfter: number;

  // Reversal
  reversed: boolean;
  reversedAt?: Date;
  reversedBy?: string;
  reversalReason?: string;
}

interface CreditNoteApplicationRequest {
  creditNoteId: string;

  // Application Strategy
  applicationMethod: 'AUTO' | 'MANUAL';

  // For AUTO
  applyToOldestFirst?: boolean;

  // For MANUAL
  applications?: {
    invoiceId: string;
    amount: number;
  }[];

  // Refund (if any remaining)
  refundRemaining: boolean;
  refundMethod?: 'ORIGINAL_PAYMENT' | 'CHECK' | 'BANK_TRANSFER';
}

interface CreditNoteApplicationResult {
  creditNote: CreditNote;

  // Applied to invoices
  invoicesAffected: {
    invoiceId: string;
    invoiceNumber: string;
    amountApplied: number;
    newBalance: number;
    newStatus: InvoiceStatus;
  }[];

  // Remaining
  remainingCredit: number;

  // Refund
  refundProcessed: boolean;
  refundAmount?: number;
  refundReference?: string;
}
```

### 7.5 Credit Note Workflow

```
┌───────────────┐     ┌─────────────────┐     ┌──────────┐
│ Create Credit │────►│ Pending Approval│────►│ Approved │
│     Note      │     │  (if required)  │     └────┬─────┘
└───────────────┘     └────────┬────────┘          │
                               │                   │
                               ▼                   ▼
                          ┌──────────┐      ┌────────────┐
                          │ Rejected │      │  Applied   │
                          └──────────┘      │ to Balance │
                                            └─────┬──────┘
                                                  │
                          ┌───────────────────────┼───────────────────────┐
                          │                       │                       │
                          ▼                       ▼                       ▼
                   ┌──────────────┐    ┌─────────────────┐    ┌──────────────┐
                   │ Fully Applied│    │Partially Applied│    │   Refunded   │
                   │  to Invoices │    │   + Credit Bal  │    │  to Member   │
                   └──────────────┘    └─────────────────┘    └──────────────┘
```

### 7.6 Pre-Built Credit Note Templates

| Template | Type | Use Case |
|----------|------|----------|
| **Billing Error Correction** | ADJUSTMENT | Staff made billing mistake |
| **Duplicate Charge Reversal** | REFUND | Same charge posted twice |
| **Service Cancellation** | CANCELLATION | Member cancelled booking/service |
| **Rain Check Credit** | COURTESY | Golf round interrupted by weather |
| **Membership Proration** | ADJUSTMENT | Member cancelled mid-cycle |
| **Product Return** | RETURN | Pro shop return within policy |
| **Customer Satisfaction** | COURTESY | Goodwill gesture for complaint |
| **Event Cancellation** | CANCELLATION | Club cancelled event |

### 7.7 Batch Credit Note Processing

```typescript
interface BatchCreditNoteRequest {
  clubId: string;

  // Batch Type
  type: 'PRORATION' | 'EVENT_CANCELLATION' | 'DUES_ADJUSTMENT';

  // Members
  memberIds?: string[];            // Specific members
  memberSegmentId?: string;        // Or by segment

  // Credit Details
  creditNoteType: CreditNoteType;
  reason: CreditNoteReason;
  reasonDetail: string;

  // Amount
  amountType: 'FIXED' | 'PERCENTAGE' | 'CALCULATED';
  fixedAmount?: number;
  percentage?: number;             // Of what? (invoice total, remaining balance)
  calculationMethod?: string;      // Custom formula

  // Application
  applicationMethod: 'BALANCE' | 'REFUND';

  // Processing
  effectiveDate: Date;
  requireApproval: boolean;
}

interface BatchCreditNoteResult {
  batchId: string;
  status: 'COMPLETED' | 'PARTIAL' | 'FAILED';

  // Results
  totalMembers: number;
  successfulCredits: number;
  failedCredits: number;
  totalCreditAmount: number;

  // Details
  creditNotes: {
    memberId: string;
    creditNoteId: string;
    creditNoteNumber: string;
    amount: number;
    status: string;
    error?: string;
  }[];
}
```

### 7.8 Credit Note Reports

| Report | Description | Frequency |
|--------|-------------|-----------|
| **Credit Notes Issued** | All credit notes by type, reason | Monthly |
| **Pending Approval** | Credit notes awaiting approval | Daily |
| **Unapplied Credits** | Credits not yet applied to invoices | Weekly |
| **Credit Note Aging** | Outstanding credits by age | Monthly |
| **Refunds Processed** | Refunds by method, amount | Monthly |
| **Credit Note by Staff** | Who issued, total amounts | Monthly |
| **Credit Note Reasons** | Breakdown by reason category | Monthly |

---

## 8. Credit Card Surcharges & Convenience Fees

### 8.1 Surcharge Configuration

```typescript
interface CreditCardSurchargeConfig {
  clubId: string;

  // Enable/Disable
  surchargeEnabled: boolean;
  convenienceFeeEnabled: boolean;

  // Surcharge Settings (percentage of transaction)
  surchargeType: 'PERCENTAGE' | 'FIXED' | 'TIERED';
  surchargePercent?: number;         // 2.5% typical
  surchargeFixed?: number;           // $2.50 per transaction
  surchargeMinimum?: number;         // Minimum fee $1.00
  surchargeMaximum?: number;         // Cap at $50

  // Tiered Surcharges
  surchargeTiers?: SurchargeTier[];

  // Card Type Specific
  cardTypeSurcharges: {
    visa: number;                    // 2.3%
    mastercard: number;              // 2.3%
    amex: number;                    // 3.5%
    discover: number;                // 2.5%
    diners: number;                  // 3.0%
    jcb: number;                     // 3.0%
  };

  // Exemptions
  exemptMembershipTypes: string[];   // Honorary members exempt
  exemptPaymentTypes: string[];      // Dues payments exempt
  exemptAmountThreshold?: number;    // No surcharge under $10

  // Display
  showSurchargeOnInvoice: boolean;
  surchargeDescription: string;      // "Credit Card Processing Fee"
  surchargeGLCode: string;           // Accounting code

  // Auto-Pay
  applySurchargeToAutoPay: boolean;  // Often waived for auto-pay
  autoPaySurchargeDiscount?: number; // 50% off surcharge

  // Compliance
  disclosureText: string;            // Legal disclosure
  showDisclosureBeforePayment: boolean;
}

interface SurchargeTier {
  minAmount: number;
  maxAmount: number;
  surchargePercent: number;
  surchargeFixed?: number;
}
```

---

## 9. Tax Configuration & Withholding Tax

### 9.1 Tax Rate Configuration

```typescript
interface TaxConfig {
  clubId: string;

  // Default Tax Rate
  defaultTaxRate: number;            // 7% VAT
  defaultTaxType: 'VAT' | 'GST' | 'SALES_TAX';
  taxInclusive: boolean;             // Prices include tax

  // Multiple Tax Rates
  taxRates: TaxRate[];

  // Tax Registration
  taxRegistrationNumber: string;     // Club's VAT/GST number
  taxRegistrationName: string;

  // Tax-Exempt Categories
  exemptCategories: ChargeCategory[];
  exemptMembershipTypes: string[];   // Diplomatic members
}

interface TaxRate {
  id: string;
  name: string;                      // "Standard VAT"
  rate: number;                      // 7
  type: 'VAT' | 'GST' | 'SALES_TAX' | 'SERVICE_TAX';
  appliesToCategories: ChargeCategory[];
  isDefault: boolean;
  effectiveFrom: Date;
  effectiveTo?: Date;
}
```

### 9.2 Withholding Tax (WHT) Configuration

```typescript
interface WithholdingTaxConfig {
  clubId: string;

  // Enable WHT
  whtEnabled: boolean;

  // Default Rates
  defaultWhtRate: number;            // 3%
  whtRates: WhtRate[];

  // Certificate Requirements
  requireCertificate: boolean;
  certificateDeadlineDays: number;   // 7 days to submit

  // Member Settings
  allowMemberOptIn: boolean;         // Members can choose to apply WHT
  autoApplyForB2B: boolean;          // Auto-apply for business members

  // Reporting
  whtReportFrequency: 'MONTHLY' | 'QUARTERLY';
  generateWhtCertificates: boolean;
}

interface WhtRate {
  id: string;
  name: string;                      // "Service WHT"
  rate: number;                      // 3
  appliesToCategories: ChargeCategory[];
  appliesToMemberTypes: string[];    // Corporate members
  effectiveFrom: Date;
  effectiveTo?: Date;
}
```

### 9.3 WHT Certificate Management

```typescript
interface WhtCertificate {
  id: string;
  clubId: string;
  memberId: string;
  paymentId: string;

  // Certificate Details
  certificateNumber: string;         // WHT-2026-00001
  issueDate: Date;
  taxPeriod: string;                 // "January 2026"

  // Amounts
  grossAmount: number;               // Payment before WHT
  whtRate: number;                   // 3%
  whtAmount: number;                 // Amount withheld

  // Payer (Member)
  payerTaxId: string;
  payerName: string;
  payerAddress: string;

  // Payee (Club)
  payeeTaxId: string;
  payeeName: string;
  payeeAddress: string;

  // Document
  documentUrl?: string;              // Uploaded certificate
  pdfUrl?: string;                   // Generated certificate
  status: 'PENDING' | 'RECEIVED' | 'VERIFIED' | 'REJECTED';

  // Verification
  verifiedBy?: string;
  verifiedAt?: Date;
  rejectionReason?: string;

  // Audit
  createdAt: Date;
  createdBy: string;
}
```

---

## 10. Credit Management

### 10.1 Credit Limit Configuration

```typescript
interface CreditConfig {
  clubId: string;

  // Default Limits
  defaultCreditLimit: number;        // $5,000
  creditLimitByMembershipType: {
    membershipTypeId: string;
    creditLimit: number;
  }[];

  // Alerts
  creditAlertThreshold: number;      // 80% utilization
  creditBlockThreshold: number;      // 100% - block charges
  sendAlertToMember: boolean;
  sendAlertToStaff: boolean;

  // Override Rules
  allowManagerOverride: boolean;
  overrideLimit?: number;            // Max temporary increase

  // Review
  creditReviewFrequency: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  autoAdjustBasedOnHistory: boolean;
}
```

### 10.2 Credit Balance Management

```typescript
interface MemberCredit {
  memberId: string;

  // Limits
  creditLimit: number;
  temporaryLimitIncrease?: number;
  temporaryLimitExpiry?: Date;

  // Balances
  currentBalance: number;            // Amount owed
  creditBalance: number;             // Prepaid credit
  availableCredit: number;           // Limit - Balance + Credit

  // Utilization
  utilizationPercent: number;
  isAtLimit: boolean;
  isBlocked: boolean;

  // History
  lastPaymentDate?: Date;
  lastPaymentAmount?: number;
  averageMonthlySpend: number;
  paymentHistory: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
}
```

---

## 11. Auto-Pay & Recurring Billing

### 11.1 Auto-Pay Configuration

```typescript
interface AutoPayConfig {
  clubId: string;

  // Enable/Disable
  autoPayEnabled: boolean;
  autoPayOptional: boolean;          // Member can opt out

  // Timing
  autoPayDayOfMonth: number;         // 5th of month
  autoPayRetryDays: number[];        // [3, 7, 14] days after failure
  maxRetryAttempts: number;          // 3

  // Payment Methods
  allowedPaymentMethods: PaymentMethod[];

  // Notifications
  notifyBeforeCharge: boolean;
  notifyDaysBefore: number;          // 3 days notice
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;

  // Failure Handling
  failureAction: 'SUSPEND' | 'NOTIFY_ONLY' | 'RETRY_ONLY';
  suspendAfterFailures: number;      // 3 consecutive
}
```

### 11.2 Stored Payment Methods

```typescript
interface StoredPaymentMethod {
  id: string;
  memberId: string;

  // Type
  type: 'CARD' | 'BANK_ACCOUNT';

  // Card Details
  cardBrand?: string;
  cardLast4?: string;
  cardExpiryMonth?: number;
  cardExpiryYear?: number;

  // Bank Details
  bankName?: string;
  bankAccountLast4?: string;
  bankAccountType?: 'CHECKING' | 'SAVINGS';

  // Stripe
  stripePaymentMethodId?: string;
  stripeCustomerId?: string;

  // Status
  isDefault: boolean;
  isActive: boolean;
  expiringWarningSent?: Date;

  // Audit
  createdAt: Date;
  lastUsedAt?: Date;
}
```

---

## 12. Accounts Receivable & Collections

### 12.1 AR Aging Buckets

```typescript
interface AgingBucketConfig {
  clubId: string;

  buckets: AgingBucket[];
}

interface AgingBucket {
  name: string;                      // "Current", "31-60 Days"
  minDays: number;                   // 0, 31
  maxDays?: number;                  // 30, 60 (null = 90+)
  color: string;                     // For dashboard display
  escalationAction?: EscalationAction;
}

interface EscalationAction {
  sendReminder: boolean;
  reminderTemplateId?: string;
  restrictBooking: boolean;
  restrictCharging: boolean;
  notifyManager: boolean;
  suspendMembership: boolean;
}
```

### 12.2 Collections Workflow

```typescript
interface CollectionsConfig {
  clubId: string;

  // Stages
  stages: CollectionStage[];

  // Automation
  autoAdvanceStages: boolean;
  advanceAfterDays: number;          // 14 days no response

  // Final Actions
  writeOffThreshold: number;         // Auto write-off < $25
  sendToCollections: boolean;
  collectionsAgencyId?: string;
}

interface CollectionStage {
  stage: number;
  name: string;                      // "Friendly Reminder"
  daysOverdue: number;               // 7 days
  actions: CollectionAction[];
}

interface CollectionAction {
  type: 'EMAIL' | 'SMS' | 'LETTER' | 'CALL' | 'RESTRICT' | 'SUSPEND';
  templateId?: string;
  restrictionType?: 'BOOKING' | 'CHARGING' | 'ACCESS';
  assignToRole?: string;             // Assign call to Collections
}
```

---

## 13. Minimum Spend Requirements

### 13.1 Minimum Spend Configuration

```typescript
interface MinimumSpendConfig {
  clubId: string;

  // Enable/Disable
  minimumSpendEnabled: boolean;

  // Requirements by Membership Type
  requirements: MinimumSpendRequirement[];

  // Period
  spendPeriod: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  periodResetDay: number;            // 1st of month/quarter

  // Tracking
  trackingCategories: ChargeCategory[];  // What counts toward minimum
  excludeCategories: ChargeCategory[];   // Dues don't count

  // Shortfall Handling
  autoChargeShortfall: boolean;
  shortfallChargeType: string;       // "Minimum Spend Shortfall"
  shortfallDueDate: number;          // Days after period end
}

interface MinimumSpendRequirement {
  membershipTypeId: string;
  membershipTierId?: string;
  minimumAmount: number;             // $500/quarter
  waivedForFirstPeriods: number;     // First 3 months waived
}
```

---

## 14. Sub-Accounts & Authorized Users

### 14.1 Sub-Account Configuration

```typescript
interface SubAccount {
  id: string;
  memberId: string;                // Parent member

  // Identity
  name: string;
  relationship: string;            // "Spouse", "Child", "Employee"
  email?: string;
  phone?: string;

  // Authentication
  pin: string;                     // Hashed 4-6 digit PIN
  pinAttempts: number;
  pinLockedUntil?: Date;

  // Validity
  status: SubAccountStatus;
  validFrom: Date;
  validUntil?: Date;

  // Permissions
  permissions: SubAccountPermission[];

  // Spending Limits
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  perTransactionLimit?: number;

  // Current Spend
  dailySpend: number;
  weeklySpend: number;
  monthlySpend: number;

  // Restrictions
  allowedOutlets?: string[];       // Specific outlets only
  blockedOutlets?: string[];
  allowedTimeStart?: string;       // "09:00"
  allowedTimeEnd?: string;         // "21:00"
}

enum SubAccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED',
  REVOKED = 'REVOKED',
}

enum SubAccountPermission {
  GOLF = 'GOLF',
  FOOD_BEVERAGE = 'FOOD_BEVERAGE',
  RETAIL = 'RETAIL',
  SPA = 'SPA',
  EVENTS = 'EVENTS',
  FITNESS = 'FITNESS',
  POOL = 'POOL',
  TENNIS = 'TENNIS',
  ALL = 'ALL',
}
```

---

## 15. Statements & Document Generation

### 15.1 Statement Configuration

```typescript
interface StatementConfig {
  clubId: string;

  // Schedule
  statementFrequency: 'WEEKLY' | 'MONTHLY';
  statementDayOfMonth: number;     // 1st of month
  statementCutoffDay: number;      // 25th (cutoff for current period)

  // Delivery
  deliveryMethod: 'EMAIL' | 'PAPER' | 'BOTH';
  emailTemplate: string;

  // Content
  showDetailedTransactions: boolean;
  showAgingBreakdown: boolean;
  showMinimumSpendProgress: boolean;
  showUpcomingCharges: boolean;
  showPaymentHistory: boolean;
  historyMonths: number;           // 3 months of history

  // Payment Link
  includePaymentLink: boolean;
  paymentLinkExpiresDays: number;  // 30 days

  // Reminders
  includeOutstandingReminder: boolean;
  reminderThreshold: number;       // Show if balance > $0
}
```

### 15.2 Document Generation Engine

```typescript
interface DocumentGenerationConfig {
  clubId: string;

  // PDF Generation
  pdfEngine: 'PUPPETEER' | 'REACT_PDF' | 'PRINCE';
  templateEngine: 'HANDLEBARS' | 'REACT' | 'MJML';

  // Branding
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  headerTemplate: string;
  footerTemplate: string;

  // Paper Settings
  paperSize: 'LETTER' | 'A4';
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}
```

### 15.3 Document Types

| Document | Description | Generation Trigger |
|----------|-------------|-------------------|
| **Monthly Statement** | Comprehensive account summary | Monthly schedule |
| **Invoice** | Individual charge or dues invoice | On charge creation |
| **Tax Invoice** | VAT/GST compliant invoice | On invoice finalization |
| **Receipt** | Payment confirmation | On payment |
| **Tax Receipt** | Payment with tax breakdown | On payment (if applicable) |
| **Past Due Notice** | Collections letter | Collections workflow |
| **Credit Note** | Refund/adjustment document | On credit issued |
| **WHT Certificate** | Withholding tax certificate | On WHT payment |
| **Annual Tax Summary** | Year-end tax statement | Year-end |

---

## 16. Reporting & Analytics

### 16.1 Standard Reports

| Report | Description | Frequency |
|--------|-------------|-----------|
| **Dues Revenue** | Dues collected vs expected | Monthly |
| **AR Aging** | Outstanding balances by bucket | Weekly |
| **Collections Activity** | Actions taken, results | Weekly |
| **Payment Summary** | Payments by method, date | Daily |
| **Credit Utilization** | Credit usage vs limits | Monthly |
| **Auto-Pay Summary** | Success/failure rates | Monthly |
| **Minimum Spend Compliance** | Members meeting requirements | Quarterly |
| **Payment Method Distribution** | Payments by method | Monthly |
| **Write-Off Summary** | Bad debt written off | Monthly |
| **Tax Summary** | Tax collected by rate | Monthly |

### 16.2 Key Performance Indicators

```typescript
interface ARKPIs {
  // Financial
  totalOutstanding: number;
  totalCurrent: number;
  totalOverdue: number;
  dso: number;                     // Days Sales Outstanding
  overdue91PlusAmount: number;
  badDebtWriteOff: number;

  // Collection Efficiency
  collectionRate: number;          // % collected on time
  averageCollectionDays: number;

  // Auto-Pay
  autoPayEnrollmentRate: number;   // % members enrolled
  autoPaySuccessRate: number;      // % successful charges

  // Credit
  averageCreditUtilization: number;
  membersAtCreditLimit: number;

  // Trends
  agingTrend: {
    date: Date;
    current: number;
    days30: number;
    days60: number;
    days90Plus: number;
  }[];
}
```

---

## 17. Implementation Priority Matrix

### Phase 1: Core Billing (Critical)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Invoice CRUD | Critical | Medium |
| Payment recording | Critical | Medium |
| Payment allocation | Critical | High |
| Receipt generation | Critical | Medium |
| Basic statements | Critical | Medium |

### Phase 2: Advanced Payments & Adjustments (High)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Multi-invoice settlement | High | High |
| Tax invoices & receipts | High | High |
| Credit notes & adjustments | High | Medium |
| Credit note approval workflow | Medium | Medium |
| Batch credit note processing | Medium | High |
| Credit card surcharges | High | Medium |
| WHT handling | High | Medium |

### Phase 3: Automation (Medium-High)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Auto-pay (Stripe) | High | High |
| Stored payment methods | High | High |
| Recurring billing automation | Medium | High |
| Collections workflow | Medium | High |

### Phase 4: Credit & Controls (Medium)

| Feature | Priority | Complexity |
|---------|----------|------------|
| Credit management | Medium | Medium |
| Minimum spend tracking | Medium | Medium |
| Sub-accounts with PIN | Medium | High |
| Spending limits | Medium | Medium |

### Phase 5: Reporting & Analytics (Medium)

| Feature | Priority | Complexity |
|---------|----------|------------|
| AR aging reports | Medium | Medium |
| KPI dashboard | Medium | Medium |
| Advanced analytics | Low | Medium |
| Tax reporting | Medium | Medium |

---

## Sources

This document incorporates industry research from:

- [Bill.com](https://www.bill.com/blog/accounts-receivable-best-practices) - AR best practices
- [Upflow](https://upflow.io/blog/ar-collections/accounts-receivable-management) - AR management
- [JP Morgan](https://www.jpmorgan.com/insights/treasury/receivables/accounts-receivable-management) - AR management guide
- [Invensis](https://www.invensis.net/blog/accounts-receivable-management-best-practices) - AR best practices 2025
- [Stripe](https://stripe.com/docs/payments) - Payment processing
- [Clubessential](https://www.clubessential.com/club-management-software/) - Private club management
- [Cobalt Software](https://www.mycobaltsoftware.com/) - Country club software
