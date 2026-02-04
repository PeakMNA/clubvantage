# Month 1: Core Billing & AR Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the invoice-to-payment lifecycle with AR aging and collections foundation.

**Architecture:** Extend existing billing infrastructure with invoice creation modal, payment recording, credit notes, and AR dashboard. All operations go through GraphQL API with Prisma transactions.

**Tech Stack:** Next.js 14, NestJS GraphQL, Prisma, PostgreSQL, React Hook Form, Zod validation

---

## Pre-Implementation Checklist

Before starting, verify these exist:
- [x] Invoice model in Prisma schema
- [x] Payment model in Prisma schema
- [x] BillingResolver in API
- [x] Billing page at `/billing`
- [ ] CreditNote model (need to add)
- [ ] CollectionAction model (need to add)

---

## Task 1: Add CreditNote and Collections Schema

**Files:**
- Modify: `database/prisma/schema.prisma`
- Modify: `apps/api/src/billing/billing.types.ts`

**Step 1: Add CreditNote model to Prisma schema**

```prisma
model CreditNote {
  id              String           @id @default(cuid())
  clubId          String
  memberId        String
  creditNoteNumber String          @unique
  issueDate       DateTime         @default(now())

  // Type and reason
  type            CreditNoteType
  reason          CreditNoteReason
  reasonDetail    String?

  // Source
  sourceInvoiceId String?

  // Amounts
  subtotal        Decimal          @db.Decimal(12, 2)
  taxAmount       Decimal          @db.Decimal(12, 2) @default(0)
  totalAmount     Decimal          @db.Decimal(12, 2)

  // Application
  appliedToBalance  Decimal        @db.Decimal(12, 2) @default(0)
  refundedAmount    Decimal        @db.Decimal(12, 2) @default(0)

  // Status
  status          CreditNoteStatus @default(DRAFT)

  // Approval
  approvedBy      String?
  approvedAt      DateTime?

  // Notes
  internalNotes   String?
  memberVisibleNotes String?

  // Audit
  createdBy       String
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  voidedAt        DateTime?
  voidedBy        String?

  // Relations
  club            Club             @relation(fields: [clubId], references: [id])
  member          Member           @relation(fields: [memberId], references: [id])
  sourceInvoice   Invoice?         @relation("CreditNoteSource", fields: [sourceInvoiceId], references: [id])
  lineItems       CreditNoteLineItem[]
  applications    CreditNoteApplication[]

  @@index([clubId, memberId])
  @@index([creditNoteNumber])
}

enum CreditNoteType {
  REFUND
  ADJUSTMENT
  COURTESY
  PROMO
  WRITE_OFF
  RETURN
  CANCELLATION
}

enum CreditNoteReason {
  BILLING_ERROR
  DUPLICATE_CHARGE
  SERVICE_NOT_RENDERED
  MEMBERSHIP_CANCELLATION
  PRODUCT_RETURN
  PRICE_ADJUSTMENT
  CUSTOMER_SATISFACTION
  EVENT_CANCELLATION
  RAIN_CHECK
  OVERPAYMENT
  OTHER
}

enum CreditNoteStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  APPLIED
  PARTIALLY_APPLIED
  REFUNDED
  VOIDED
}

model CreditNoteLineItem {
  id              String       @id @default(cuid())
  creditNoteId    String
  description     String
  quantity        Decimal      @db.Decimal(10, 2) @default(1)
  unitPrice       Decimal      @db.Decimal(12, 2)
  lineTotal       Decimal      @db.Decimal(12, 2)
  taxable         Boolean      @default(false)
  taxRate         Decimal      @db.Decimal(5, 2) @default(0)
  taxAmount       Decimal      @db.Decimal(12, 2) @default(0)
  chargeTypeId    String?

  creditNote      CreditNote   @relation(fields: [creditNoteId], references: [id], onDelete: Cascade)
  chargeType      ChargeType?  @relation(fields: [chargeTypeId], references: [id])

  @@index([creditNoteId])
}

model CreditNoteApplication {
  id              String       @id @default(cuid())
  creditNoteId    String
  invoiceId       String
  amountApplied   Decimal      @db.Decimal(12, 2)
  appliedAt       DateTime     @default(now())
  appliedBy       String

  creditNote      CreditNote   @relation(fields: [creditNoteId], references: [id])
  invoice         Invoice      @relation(fields: [invoiceId], references: [id])

  @@index([creditNoteId])
  @@index([invoiceId])
}

model CollectionAction {
  id              String           @id @default(cuid())
  clubId          String
  memberId        String
  invoiceId       String?

  // Action
  actionType      CollectionActionType
  stage           Int              @default(1)

  // Details
  notes           String?
  templateUsed    String?
  sentVia         String?          // EMAIL, SMS, LETTER, CALL

  // Result
  result          CollectionResult?
  resultNotes     String?
  resultAt        DateTime?

  // Scheduling
  scheduledAt     DateTime?
  completedAt     DateTime?

  // Assignment
  assignedTo      String?

  // Audit
  createdBy       String
  createdAt       DateTime         @default(now())

  club            Club             @relation(fields: [clubId], references: [id])
  member          Member           @relation(fields: [memberId], references: [id])
  invoice         Invoice?         @relation(fields: [invoiceId], references: [id])

  @@index([clubId, memberId])
  @@index([scheduledAt])
}

enum CollectionActionType {
  REMINDER_EMAIL
  REMINDER_SMS
  REMINDER_LETTER
  PHONE_CALL
  RESTRICT_BOOKING
  RESTRICT_CHARGING
  SUSPEND_MEMBERSHIP
  WRITE_OFF
  SEND_TO_AGENCY
}

enum CollectionResult {
  PAYMENT_RECEIVED
  PAYMENT_PROMISED
  NO_ANSWER
  LEFT_MESSAGE
  DISPUTED
  HARDSHIP
  REFUSED
  CONTACT_INVALID
}
```

**Step 2: Run migration**

Run: `cd database && npx prisma migrate dev --name add_credit_notes_and_collections`
Expected: Migration successful

**Step 3: Commit**

```bash
git add database/prisma/schema.prisma
git commit -m "feat(billing): add CreditNote and CollectionAction models"
```

---

## Task 2: Invoice Creation Modal UI

**Files:**
- Create: `apps/application/src/components/billing/invoice-create-modal.tsx`
- Create: `apps/application/src/components/billing/invoice-line-item-row.tsx`
- Modify: `apps/application/src/app/(dashboard)/billing/page.tsx`

**Step 1: Create invoice line item row component**

```tsx
// apps/application/src/components/billing/invoice-line-item-row.tsx
'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@clubvantage/ui/primitives/button';
import { Input } from '@clubvantage/ui/primitives/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@clubvantage/ui/primitives/select';

interface ChargeType {
  id: string;
  name: string;
  code: string;
  defaultPrice?: number;
  taxable: boolean;
  taxRate?: number;
}

interface LineItemData {
  id: string;
  chargeTypeId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
  taxRate: number;
}

interface InvoiceLineItemRowProps {
  item: LineItemData;
  chargeTypes: ChargeType[];
  onChange: (item: LineItemData) => void;
  onRemove: () => void;
  isOnly: boolean;
}

export function InvoiceLineItemRow({
  item,
  chargeTypes,
  onChange,
  onRemove,
  isOnly,
}: InvoiceLineItemRowProps) {
  const handleChargeTypeChange = (chargeTypeId: string) => {
    const chargeType = chargeTypes.find((ct) => ct.id === chargeTypeId);
    if (chargeType) {
      onChange({
        ...item,
        chargeTypeId,
        description: chargeType.name,
        unitPrice: chargeType.defaultPrice ?? item.unitPrice,
        taxable: chargeType.taxable,
        taxRate: chargeType.taxRate ?? 0,
      });
    }
  };

  const lineTotal = item.quantity * item.unitPrice;
  const taxAmount = item.taxable ? lineTotal * (item.taxRate / 100) : 0;

  return (
    <div className="grid grid-cols-12 gap-2 items-center py-2 border-b border-stone-100">
      {/* Charge Type */}
      <div className="col-span-3">
        <Select value={item.chargeTypeId} onValueChange={handleChargeTypeChange}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Select charge type" />
          </SelectTrigger>
          <SelectContent>
            {chargeTypes.map((ct) => (
              <SelectItem key={ct.id} value={ct.id}>
                {ct.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="col-span-3">
        <Input
          value={item.description}
          onChange={(e) => onChange({ ...item, description: e.target.value })}
          placeholder="Description"
          className="h-9"
        />
      </div>

      {/* Quantity */}
      <div className="col-span-1">
        <Input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => onChange({ ...item, quantity: Number(e.target.value) || 1 })}
          className="h-9 text-right"
        />
      </div>

      {/* Unit Price */}
      <div className="col-span-2">
        <Input
          type="number"
          step="0.01"
          value={item.unitPrice}
          onChange={(e) => onChange({ ...item, unitPrice: Number(e.target.value) || 0 })}
          className="h-9 text-right"
        />
      </div>

      {/* Tax */}
      <div className="col-span-1 text-right text-sm text-stone-500">
        {item.taxable ? `${item.taxRate}%` : '-'}
      </div>

      {/* Line Total */}
      <div className="col-span-1 text-right font-medium">
        ${(lineTotal + taxAmount).toFixed(2)}
      </div>

      {/* Remove */}
      <div className="col-span-1 text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={isOnly}
          className="h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4 text-stone-400" />
        </Button>
      </div>
    </div>
  );
}
```

**Step 2: Create invoice creation modal**

```tsx
// apps/application/src/components/billing/invoice-create-modal.tsx
'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Send, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@clubvantage/ui/primitives/dialog';
import { Button } from '@clubvantage/ui/primitives/button';
import { Label } from '@clubvantage/ui/primitives/label';
import { Input } from '@clubvantage/ui/primitives/input';
import { Textarea } from '@clubvantage/ui/primitives/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@clubvantage/ui/primitives/select';
import { MemberSearchCombobox } from '../members/member-search-combobox';
import { InvoiceLineItemRow } from './invoice-line-item-row';
import { useChargeTypesQuery, useCreateInvoiceMutation } from '@clubvantage/api-client';
import { toast } from 'sonner';

const invoiceSchema = z.object({
  memberId: z.string().min(1, 'Member is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface LineItem {
  id: string;
  chargeTypeId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
  taxRate: number;
}

interface InvoiceCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function InvoiceCreateModal({
  open,
  onOpenChange,
  onSuccess,
}: InvoiceCreateModalProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: crypto.randomUUID(),
      chargeTypeId: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxable: false,
      taxRate: 0,
    },
  ]);

  const { data: chargeTypesData } = useChargeTypesQuery();
  const [createInvoice, { loading }] = useCreateInvoiceMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    },
  });

  const memberId = watch('memberId');

  const addLineItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        chargeTypeId: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        taxable: false,
        taxRate: 0,
      },
    ]);
  };

  const updateLineItem = (id: string, updated: LineItem) => {
    setLineItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
  };

  const removeLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const calculateTotals = useCallback(() => {
    let subtotal = 0;
    let taxTotal = 0;

    lineItems.forEach((item) => {
      const lineTotal = item.quantity * item.unitPrice;
      subtotal += lineTotal;
      if (item.taxable) {
        taxTotal += lineTotal * (item.taxRate / 100);
      }
    });

    return {
      subtotal,
      taxTotal,
      total: subtotal + taxTotal,
    };
  }, [lineItems]);

  const totals = calculateTotals();

  const onSubmit = async (data: InvoiceFormData, sendNow: boolean) => {
    const validLineItems = lineItems.filter(
      (item) => item.chargeTypeId && item.unitPrice > 0
    );

    if (validLineItems.length === 0) {
      toast.error('Please add at least one line item');
      return;
    }

    try {
      await createInvoice({
        variables: {
          input: {
            memberId: data.memberId,
            dueDate: data.dueDate,
            notes: data.notes,
            lineItems: validLineItems.map((item) => ({
              chargeTypeId: item.chargeTypeId,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              taxable: item.taxable,
              taxRate: item.taxRate,
            })),
            sendEmail: sendNow,
          },
        },
      });

      toast.success(sendNow ? 'Invoice created and sent' : 'Invoice saved as draft');
      reset();
      setLineItems([
        {
          id: crypto.randomUUID(),
          chargeTypeId: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          taxable: false,
          taxRate: 0,
        },
      ]);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to create invoice');
    }
  };

  const chargeTypes = chargeTypesData?.chargeTypes ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>

        <form className="space-y-6">
          {/* Member Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Member *</Label>
              <MemberSearchCombobox
                value={memberId}
                onSelect={(member) => setValue('memberId', member.id)}
              />
              {errors.memberId && (
                <p className="text-sm text-red-500">{errors.memberId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input type="date" {...register('dueDate')} />
              {errors.dueDate && (
                <p className="text-sm text-red-500">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Line Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            {/* Header */}
            <div className="grid grid-cols-12 gap-2 text-xs font-medium text-stone-500 uppercase py-2 border-b">
              <div className="col-span-3">Charge Type</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-1 text-right">Qty</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div className="col-span-1 text-right">Tax</div>
              <div className="col-span-1 text-right">Total</div>
              <div className="col-span-1"></div>
            </div>

            {/* Items */}
            {lineItems.map((item) => (
              <InvoiceLineItemRow
                key={item.id}
                item={item}
                chargeTypes={chargeTypes}
                onChange={(updated) => updateLineItem(item.id, updated)}
                onRemove={() => removeLineItem(item.id)}
                isOnly={lineItems.length === 1}
              />
            ))}

            {/* Totals */}
            <div className="pt-4 space-y-1 text-right">
              <div className="text-sm">
                Subtotal: <span className="font-medium">${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="text-sm">
                Tax: <span className="font-medium">${totals.taxTotal.toFixed(2)}</span>
              </div>
              <div className="text-lg font-semibold">
                Total: ${totals.total.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              {...register('notes')}
              placeholder="Internal notes or memo for this invoice"
              rows={2}
            />
          </div>
        </form>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleSubmit((data) => onSubmit(data, false))}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-1" />
            Save Draft
          </Button>
          <Button
            onClick={handleSubmit((data) => onSubmit(data, true))}
            disabled={loading}
          >
            <Send className="h-4 w-4 mr-1" />
            Create & Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 3: Run to verify component compiles**

Run: `cd apps/application && pnpm run build`
Expected: Build succeeds (may have type errors if API not updated yet)

**Step 4: Commit**

```bash
git add apps/application/src/components/billing/
git commit -m "feat(billing): add invoice creation modal UI"
```

---

## Task 3: Create Invoice GraphQL Mutation

**Files:**
- Modify: `apps/api/src/billing/billing.resolver.ts`
- Modify: `apps/api/src/billing/billing.service.ts`
- Create: `apps/api/src/billing/dto/create-invoice.input.ts`

**Step 1: Create input DTO**

```typescript
// apps/api/src/billing/dto/create-invoice.input.ts
import { InputType, Field, Float, Int, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsArray, ValidateNested, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateInvoiceLineItemInput {
  @Field(() => ID)
  @IsNotEmpty()
  chargeTypeId: string;

  @Field()
  @IsNotEmpty()
  description: string;

  @Field(() => Float, { defaultValue: 1 })
  quantity: number;

  @Field(() => Float)
  @IsNotEmpty()
  unitPrice: number;

  @Field(() => Boolean, { defaultValue: false })
  taxable: boolean;

  @Field(() => Float, { defaultValue: 0 })
  taxRate: number;
}

@InputType()
export class CreateInvoiceInput {
  @Field(() => ID)
  @IsNotEmpty()
  memberId: string;

  @Field()
  @IsNotEmpty()
  dueDate: string;

  @Field({ nullable: true })
  @IsOptional()
  notes?: string;

  @Field(() => [CreateInvoiceLineItemInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceLineItemInput)
  lineItems: CreateInvoiceLineItemInput[];

  @Field(() => Boolean, { defaultValue: false })
  @IsBoolean()
  sendEmail: boolean;
}
```

**Step 2: Add service method**

```typescript
// Add to apps/api/src/billing/billing.service.ts

async createInvoice(clubId: string, input: CreateInvoiceInput, createdBy: string) {
  const invoiceNumber = await this.generateInvoiceNumber(clubId);

  // Calculate totals
  let subtotal = 0;
  let taxAmount = 0;

  const lineItemsData = input.lineItems.map((item) => {
    const lineTotal = item.quantity * item.unitPrice;
    const lineTax = item.taxable ? lineTotal * (item.taxRate / 100) : 0;
    subtotal += lineTotal;
    taxAmount += lineTax;

    return {
      chargeTypeId: item.chargeTypeId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal,
      taxable: item.taxable,
      taxRate: item.taxRate,
      taxAmount: lineTax,
    };
  });

  const totalAmount = subtotal + taxAmount;

  const invoice = await this.prisma.invoice.create({
    data: {
      clubId,
      memberId: input.memberId,
      invoiceNumber,
      invoiceDate: new Date(),
      dueDate: new Date(input.dueDate),
      subtotal,
      taxAmount,
      totalAmount,
      balanceAmount: totalAmount,
      status: input.sendEmail ? 'SENT' : 'DRAFT',
      notes: input.notes,
      createdBy,
      lineItems: {
        create: lineItemsData,
      },
    },
    include: {
      lineItems: true,
      member: true,
    },
  });

  if (input.sendEmail) {
    // TODO: Send invoice email
    await this.sendInvoiceEmail(invoice);
  }

  return invoice;
}

private async generateInvoiceNumber(clubId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const lastInvoice = await this.prisma.invoice.findFirst({
    where: {
      clubId,
      invoiceNumber: { startsWith: prefix },
    },
    orderBy: { invoiceNumber: 'desc' },
  });

  let nextNumber = 1;
  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0', 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
}

private async sendInvoiceEmail(invoice: any) {
  // Email sending logic - implement with your email provider
  console.log(`Sending invoice ${invoice.invoiceNumber} to ${invoice.member.email}`);
}
```

**Step 3: Add resolver mutation**

```typescript
// Add to apps/api/src/billing/billing.resolver.ts

@Mutation(() => Invoice)
async createInvoice(
  @Args('input') input: CreateInvoiceInput,
  @CurrentUser() user: User,
) {
  return this.billingService.createInvoice(user.clubId, input, user.id);
}
```

**Step 4: Run tests**

Run: `cd apps/api && pnpm run test -- --testPathPattern=billing`
Expected: Tests pass (or skip if no tests yet)

**Step 5: Commit**

```bash
git add apps/api/src/billing/
git commit -m "feat(api): add createInvoice mutation with line items"
```

---

## Task 4: Payment Recording Modal

**Files:**
- Create: `apps/application/src/components/billing/payment-record-modal.tsx`
- Create: `apps/application/src/components/billing/invoice-allocation-row.tsx`

**Step 1: Create invoice allocation row**

```tsx
// apps/application/src/components/billing/invoice-allocation-row.tsx
'use client';

import { Input } from '@clubvantage/ui/primitives/input';
import { Checkbox } from '@clubvantage/ui/primitives/checkbox';
import { Badge } from '@clubvantage/ui/primitives/badge';
import { formatCurrency, formatDate } from '@clubvantage/utils';

interface OpenInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  totalAmount: number;
  balanceAmount: number;
  isOverdue: boolean;
}

interface AllocationData {
  invoiceId: string;
  amount: number;
  selected: boolean;
}

interface InvoiceAllocationRowProps {
  invoice: OpenInvoice;
  allocation: AllocationData;
  onChange: (allocation: AllocationData) => void;
  maxAmount: number;
}

export function InvoiceAllocationRow({
  invoice,
  allocation,
  onChange,
  maxAmount,
}: InvoiceAllocationRowProps) {
  const handleSelectChange = (checked: boolean) => {
    onChange({
      ...allocation,
      selected: checked,
      amount: checked ? Math.min(invoice.balanceAmount, maxAmount) : 0,
    });
  };

  const handleAmountChange = (value: string) => {
    const amount = Math.min(
      Math.max(0, parseFloat(value) || 0),
      invoice.balanceAmount,
      maxAmount
    );
    onChange({
      ...allocation,
      amount,
      selected: amount > 0,
    });
  };

  return (
    <div className="grid grid-cols-12 gap-2 items-center py-2 border-b border-stone-100">
      {/* Select */}
      <div className="col-span-1">
        <Checkbox
          checked={allocation.selected}
          onCheckedChange={handleSelectChange}
        />
      </div>

      {/* Invoice Number */}
      <div className="col-span-2 font-medium">
        {invoice.invoiceNumber}
      </div>

      {/* Date */}
      <div className="col-span-2 text-sm text-stone-600">
        {formatDate(invoice.invoiceDate)}
      </div>

      {/* Due Date */}
      <div className="col-span-2 text-sm">
        <span className={invoice.isOverdue ? 'text-red-600' : 'text-stone-600'}>
          {formatDate(invoice.dueDate)}
        </span>
        {invoice.isOverdue && (
          <Badge variant="destructive" className="ml-2 text-xs">
            Overdue
          </Badge>
        )}
      </div>

      {/* Balance */}
      <div className="col-span-2 text-right font-medium">
        {formatCurrency(invoice.balanceAmount)}
      </div>

      {/* Amount to Apply */}
      <div className="col-span-3">
        <Input
          type="number"
          step="0.01"
          min="0"
          max={Math.min(invoice.balanceAmount, maxAmount)}
          value={allocation.amount || ''}
          onChange={(e) => handleAmountChange(e.target.value)}
          disabled={!allocation.selected}
          className="h-9 text-right"
          placeholder="0.00"
        />
      </div>
    </div>
  );
}
```

**Step 2: Create payment recording modal**

```tsx
// apps/application/src/components/billing/payment-record-modal.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Banknote, Building2, QrCode } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@clubvantage/ui/primitives/dialog';
import { Button } from '@clubvantage/ui/primitives/button';
import { Label } from '@clubvantage/ui/primitives/label';
import { Input } from '@clubvantage/ui/primitives/input';
import { Textarea } from '@clubvantage/ui/primitives/textarea';
import { RadioGroup, RadioGroupItem } from '@clubvantage/ui/primitives/radio-group';
import { MemberSearchCombobox } from '../members/member-search-combobox';
import { InvoiceAllocationRow } from './invoice-allocation-row';
import {
  useMemberOpenInvoicesQuery,
  useRecordPaymentMutation,
} from '@clubvantage/api-client';
import { formatCurrency } from '@clubvantage/utils';
import { toast } from 'sonner';

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash', icon: Banknote },
  { value: 'CHECK', label: 'Check', icon: Building2 },
  { value: 'CREDIT_CARD', label: 'Credit Card', icon: CreditCard },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer', icon: Building2 },
  { value: 'QR_PROMPTPAY', label: 'QR PromptPay', icon: QrCode },
];

const paymentSchema = z.object({
  memberId: z.string().min(1, 'Member is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface Allocation {
  invoiceId: string;
  amount: number;
  selected: boolean;
}

interface PaymentRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedMemberId?: string;
  onSuccess?: () => void;
}

export function PaymentRecordModal({
  open,
  onOpenChange,
  preSelectedMemberId,
  onSuccess,
}: PaymentRecordModalProps) {
  const [allocations, setAllocations] = useState<Allocation[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      memberId: preSelectedMemberId || '',
      paymentMethod: 'CASH',
    },
  });

  const memberId = watch('memberId');
  const paymentAmount = watch('amount') || 0;

  const { data: invoicesData } = useMemberOpenInvoicesQuery({
    variables: { memberId },
    skip: !memberId,
  });

  const [recordPayment, { loading }] = useRecordPaymentMutation();

  const openInvoices = useMemo(() => {
    return (invoicesData?.memberOpenInvoices ?? []).map((inv) => ({
      ...inv,
      isOverdue: new Date(inv.dueDate) < new Date(),
    }));
  }, [invoicesData]);

  // Initialize allocations when invoices load
  useEffect(() => {
    setAllocations(
      openInvoices.map((inv) => ({
        invoiceId: inv.id,
        amount: 0,
        selected: false,
      }))
    );
  }, [openInvoices]);

  // Auto-allocate on amount change (oldest first)
  const handleAutoAllocate = () => {
    let remaining = paymentAmount;
    const sorted = [...openInvoices].sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

    const newAllocations = sorted.map((inv) => {
      const toApply = Math.min(remaining, inv.balanceAmount);
      remaining -= toApply;
      return {
        invoiceId: inv.id,
        amount: toApply,
        selected: toApply > 0,
      };
    });

    setAllocations(newAllocations);
  };

  const totalAllocated = useMemo(
    () => allocations.reduce((sum, a) => sum + a.amount, 0),
    [allocations]
  );

  const unallocated = paymentAmount - totalAllocated;

  const updateAllocation = (invoiceId: string, updated: Allocation) => {
    setAllocations((prev) =>
      prev.map((a) => (a.invoiceId === invoiceId ? updated : a))
    );
  };

  const onSubmit = async (data: PaymentFormData) => {
    const validAllocations = allocations.filter((a) => a.amount > 0);

    if (validAllocations.length === 0 && paymentAmount > 0) {
      toast.error('Please allocate the payment to at least one invoice, or it will be applied as credit');
    }

    try {
      await recordPayment({
        variables: {
          input: {
            memberId: data.memberId,
            amount: data.amount,
            paymentMethod: data.paymentMethod,
            referenceNumber: data.referenceNumber,
            notes: data.notes,
            allocations: validAllocations.map((a) => ({
              invoiceId: a.invoiceId,
              amount: a.amount,
            })),
          },
        },
      });

      toast.success('Payment recorded successfully');
      reset();
      setAllocations([]);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to record payment');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Member and Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Member *</Label>
              <MemberSearchCombobox
                value={memberId}
                onSelect={(member) => setValue('memberId', member.id)}
                disabled={!!preSelectedMemberId}
              />
              {errors.memberId && (
                <p className="text-sm text-red-500">{errors.memberId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method *</Label>
            <RadioGroup
              value={watch('paymentMethod')}
              onValueChange={(v) => setValue('paymentMethod', v)}
              className="flex flex-wrap gap-2"
            >
              {PAYMENT_METHODS.map((method) => (
                <div key={method.value} className="flex items-center">
                  <RadioGroupItem
                    value={method.value}
                    id={method.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={method.value}
                    className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer peer-data-[state=checked]:border-amber-500 peer-data-[state=checked]:bg-amber-50"
                  >
                    <method.icon className="h-4 w-4" />
                    {method.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Reference Number */}
          <div className="space-y-2">
            <Label>Reference Number (optional)</Label>
            <Input
              {...register('referenceNumber')}
              placeholder="Check #, transaction ID, etc."
            />
          </div>

          {/* Invoice Allocation */}
          {memberId && openInvoices.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Allocate to Invoices</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAutoAllocate}
                  disabled={!paymentAmount}
                >
                  Auto-Allocate (Oldest First)
                </Button>
              </div>

              {/* Header */}
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-stone-500 uppercase py-2 border-b">
                <div className="col-span-1"></div>
                <div className="col-span-2">Invoice #</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Due Date</div>
                <div className="col-span-2 text-right">Balance</div>
                <div className="col-span-3 text-right">Apply Amount</div>
              </div>

              {/* Rows */}
              {openInvoices.map((invoice) => {
                const allocation = allocations.find(
                  (a) => a.invoiceId === invoice.id
                ) || {
                  invoiceId: invoice.id,
                  amount: 0,
                  selected: false,
                };

                return (
                  <InvoiceAllocationRow
                    key={invoice.id}
                    invoice={invoice}
                    allocation={allocation}
                    onChange={(updated) => updateAllocation(invoice.id, updated)}
                    maxAmount={paymentAmount - totalAllocated + allocation.amount}
                  />
                );
              })}

              {/* Allocation Summary */}
              <div className="pt-4 text-right space-y-1">
                <div className="text-sm">
                  Total Allocated:{' '}
                  <span className="font-medium">{formatCurrency(totalAllocated)}</span>
                </div>
                {unallocated > 0 && (
                  <div className="text-sm text-amber-600">
                    Unallocated (will become credit):{' '}
                    <span className="font-medium">{formatCurrency(unallocated)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {memberId && openInvoices.length === 0 && (
            <div className="text-center py-8 text-stone-500">
              No open invoices for this member. Payment will be applied as credit.
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea
              {...register('notes')}
              placeholder="Payment notes"
              rows={2}
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={loading}>
            Record Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 3: Commit**

```bash
git add apps/application/src/components/billing/
git commit -m "feat(billing): add payment recording modal with allocation"
```

---

## Task 5: Record Payment GraphQL Mutation

**Files:**
- Create: `apps/api/src/billing/dto/record-payment.input.ts`
- Modify: `apps/api/src/billing/billing.service.ts`
- Modify: `apps/api/src/billing/billing.resolver.ts`

**Step 1: Create input DTO**

```typescript
// apps/api/src/billing/dto/record-payment.input.ts
import { InputType, Field, Float, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class PaymentAllocationInput {
  @Field(() => ID)
  @IsNotEmpty()
  invoiceId: string;

  @Field(() => Float)
  @IsNotEmpty()
  amount: number;
}

@InputType()
export class RecordPaymentInput {
  @Field(() => ID)
  @IsNotEmpty()
  memberId: string;

  @Field(() => Float)
  @IsNotEmpty()
  amount: number;

  @Field()
  @IsNotEmpty()
  paymentMethod: string;

  @Field({ nullable: true })
  @IsOptional()
  referenceNumber?: string;

  @Field({ nullable: true })
  @IsOptional()
  notes?: string;

  @Field(() => [PaymentAllocationInput], { defaultValue: [] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaymentAllocationInput)
  allocations: PaymentAllocationInput[];
}
```

**Step 2: Add service method**

```typescript
// Add to apps/api/src/billing/billing.service.ts

async recordPayment(clubId: string, input: RecordPaymentInput, createdBy: string) {
  return this.prisma.$transaction(async (tx) => {
    // Generate payment and receipt numbers
    const paymentNumber = await this.generatePaymentNumber(clubId);
    const receiptNumber = await this.generateReceiptNumber(clubId);

    // Calculate allocation total
    const totalAllocated = input.allocations.reduce((sum, a) => sum + a.amount, 0);
    const unallocated = input.amount - totalAllocated;

    // Create payment
    const payment = await tx.payment.create({
      data: {
        clubId,
        memberId: input.memberId,
        paymentNumber,
        receiptNumber,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        referenceNumber: input.referenceNumber,
        notes: input.notes,
        status: 'COMPLETED',
        allocatedAmount: totalAllocated,
        unallocatedAmount: unallocated,
        paymentDate: new Date(),
        receivedAt: new Date(),
        createdBy,
      },
    });

    // Create allocations and update invoice balances
    for (const alloc of input.allocations) {
      // Create allocation record
      await tx.paymentAllocation.create({
        data: {
          paymentId: payment.id,
          invoiceId: alloc.invoiceId,
          amount: alloc.amount,
          allocationType: 'MANUAL',
          allocatedBy: createdBy,
        },
      });

      // Update invoice balance and status
      const invoice = await tx.invoice.findUnique({
        where: { id: alloc.invoiceId },
      });

      if (invoice) {
        const newBalance = Number(invoice.balanceAmount) - alloc.amount;
        const newPaidAmount = Number(invoice.paidAmount || 0) + alloc.amount;

        let newStatus = invoice.status;
        if (newBalance <= 0) {
          newStatus = 'PAID';
        } else if (newPaidAmount > 0) {
          newStatus = 'PARTIAL';
        }

        await tx.invoice.update({
          where: { id: alloc.invoiceId },
          data: {
            balanceAmount: newBalance,
            paidAmount: newPaidAmount,
            status: newStatus,
            paidAt: newStatus === 'PAID' ? new Date() : undefined,
          },
        });
      }
    }

    // If there's unallocated amount, add to member credit balance
    if (unallocated > 0) {
      await tx.member.update({
        where: { id: input.memberId },
        data: {
          creditBalance: {
            increment: unallocated,
          },
        },
      });
    }

    return tx.payment.findUnique({
      where: { id: payment.id },
      include: {
        allocations: {
          include: { invoice: true },
        },
        member: true,
      },
    });
  });
}

private async generatePaymentNumber(clubId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `PAY-${year}-`;

  const lastPayment = await this.prisma.payment.findFirst({
    where: {
      clubId,
      paymentNumber: { startsWith: prefix },
    },
    orderBy: { paymentNumber: 'desc' },
  });

  let nextNumber = 1;
  if (lastPayment) {
    const lastNumber = parseInt(lastPayment.paymentNumber.split('-').pop() || '0', 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
}

private async generateReceiptNumber(clubId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `RCP-${year}-`;

  const lastPayment = await this.prisma.payment.findFirst({
    where: {
      clubId,
      receiptNumber: { startsWith: prefix },
    },
    orderBy: { receiptNumber: 'desc' },
  });

  let nextNumber = 1;
  if (lastPayment) {
    const lastNumber = parseInt(lastPayment.receiptNumber.split('-').pop() || '0', 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
}
```

**Step 3: Add resolver mutation**

```typescript
// Add to apps/api/src/billing/billing.resolver.ts

@Mutation(() => Payment)
async recordPayment(
  @Args('input') input: RecordPaymentInput,
  @CurrentUser() user: User,
) {
  return this.billingService.recordPayment(user.clubId, input, user.id);
}

@Query(() => [Invoice])
async memberOpenInvoices(
  @Args('memberId', { type: () => ID }) memberId: string,
  @CurrentUser() user: User,
) {
  return this.prisma.invoice.findMany({
    where: {
      clubId: user.clubId,
      memberId,
      status: { in: ['PENDING', 'SENT', 'PARTIAL', 'OVERDUE'] },
      balanceAmount: { gt: 0 },
    },
    orderBy: { dueDate: 'asc' },
  });
}
```

**Step 4: Regenerate GraphQL client**

Run: `cd apps/api && pnpm run start:dev` (let it start to regenerate schema)
Then: `cd packages/api-client && pnpm run codegen`
Expected: New queries/mutations generated

**Step 5: Commit**

```bash
git add apps/api/src/billing/ packages/api-client/
git commit -m "feat(api): add recordPayment mutation with invoice allocation"
```

---

## Task 6: AR Aging Dashboard

**Files:**
- Create: `apps/application/src/components/billing/ar-aging-dashboard.tsx`
- Create: `apps/application/src/components/billing/aging-bucket-card.tsx`

**Step 1: Create aging bucket card component**

```tsx
// apps/application/src/components/billing/aging-bucket-card.tsx
'use client';

import { cn } from '@clubvantage/ui/lib/utils';
import { formatCurrency } from '@clubvantage/utils';

interface AgingBucketCardProps {
  label: string;
  amount: number;
  count: number;
  color: 'green' | 'yellow' | 'orange' | 'red';
  onClick?: () => void;
}

const colorClasses = {
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  yellow: 'border-amber-200 bg-amber-50 text-amber-700',
  orange: 'border-orange-200 bg-orange-50 text-orange-700',
  red: 'border-red-200 bg-red-50 text-red-700',
};

export function AgingBucketCard({
  label,
  amount,
  count,
  color,
  onClick,
}: AgingBucketCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl border-2 text-left transition-all hover:shadow-md',
        colorClasses[color],
        onClick && 'cursor-pointer'
      )}
    >
      <div className="text-sm font-medium opacity-80">{label}</div>
      <div className="text-2xl font-bold mt-1">{formatCurrency(amount)}</div>
      <div className="text-xs opacity-70 mt-1">{count} invoices</div>
    </button>
  );
}
```

**Step 2: Create AR aging dashboard**

```tsx
// apps/application/src/components/billing/ar-aging-dashboard.tsx
'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@clubvantage/ui/primitives/card';
import { AgingBucketCard } from './aging-bucket-card';
import { useArAgingQuery } from '@clubvantage/api-client';
import { formatCurrency, formatPercent } from '@clubvantage/utils';

interface AgingBucket {
  label: string;
  minDays: number;
  maxDays: number | null;
  color: 'green' | 'yellow' | 'orange' | 'red';
}

const AGING_BUCKETS: AgingBucket[] = [
  { label: 'Current', minDays: 0, maxDays: 30, color: 'green' },
  { label: '31-60 Days', minDays: 31, maxDays: 60, color: 'yellow' },
  { label: '61-90 Days', minDays: 61, maxDays: 90, color: 'orange' },
  { label: '90+ Days', minDays: 91, maxDays: null, color: 'red' },
];

export function ArAgingDashboard() {
  const { data, loading } = useArAgingQuery();

  const bucketData = useMemo(() => {
    if (!data?.arAging) {
      return AGING_BUCKETS.map((bucket) => ({
        ...bucket,
        amount: 0,
        count: 0,
      }));
    }

    return AGING_BUCKETS.map((bucket) => {
      const matching = data.arAging.filter((item) => {
        const daysOverdue = item.daysOverdue;
        if (bucket.maxDays === null) {
          return daysOverdue >= bucket.minDays;
        }
        return daysOverdue >= bucket.minDays && daysOverdue <= bucket.maxDays;
      });

      return {
        ...bucket,
        amount: matching.reduce((sum, item) => sum + item.balanceAmount, 0),
        count: matching.length,
      };
    });
  }, [data]);

  const totalOutstanding = bucketData.reduce((sum, b) => sum + b.amount, 0);
  const totalOverdue = bucketData
    .filter((b) => b.minDays > 30)
    .reduce((sum, b) => sum + b.amount, 0);
  const overduePercent = totalOutstanding > 0 ? (totalOverdue / totalOutstanding) * 100 : 0;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-stone-500">
          Loading AR aging data...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-stone-500">Total Outstanding</div>
            <div className="text-3xl font-bold text-stone-900 mt-1">
              {formatCurrency(totalOutstanding)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-stone-500">Total Overdue</div>
            <div className="text-3xl font-bold text-red-600 mt-1">
              {formatCurrency(totalOverdue)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-stone-500">Overdue Percentage</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                'text-3xl font-bold',
                overduePercent > 20 ? 'text-red-600' : 'text-stone-900'
              )}>
                {formatPercent(overduePercent)}
              </span>
              {overduePercent > 20 && (
                <AlertTriangle className="h-6 w-6 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aging Buckets */}
      <Card>
        <CardHeader>
          <CardTitle>AR Aging by Bucket</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bucketData.map((bucket) => (
              <AgingBucketCard
                key={bucket.label}
                label={bucket.label}
                amount={bucket.amount}
                count={bucket.count}
                color={bucket.color}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* High Balance Members */}
      {data?.arAging && data.arAging.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Members with Highest Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {data.arAging
                .sort((a, b) => b.balanceAmount - a.balanceAmount)
                .slice(0, 10)
                .map((item) => (
                  <div
                    key={item.memberId}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <div className="font-medium">{item.memberName}</div>
                      <div className="text-sm text-stone-500">
                        {item.invoiceCount} invoices • {item.daysOverdue} days overdue
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        'font-semibold',
                        item.daysOverdue > 90 ? 'text-red-600' : 'text-stone-900'
                      )}>
                        {formatCurrency(item.balanceAmount)}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

**Step 3: Commit**

```bash
git add apps/application/src/components/billing/
git commit -m "feat(billing): add AR aging dashboard with bucket visualization"
```

---

## Task 7: AR Aging GraphQL Query

**Files:**
- Modify: `apps/api/src/billing/billing.resolver.ts`
- Modify: `apps/api/src/billing/billing.service.ts`
- Create: `apps/api/src/billing/dto/ar-aging.output.ts`

**Step 1: Create output type**

```typescript
// apps/api/src/billing/dto/ar-aging.output.ts
import { ObjectType, Field, Float, Int, ID } from '@nestjs/graphql';

@ObjectType()
export class ArAgingItem {
  @Field(() => ID)
  memberId: string;

  @Field()
  memberName: string;

  @Field()
  memberNumber: string;

  @Field(() => Float)
  balanceAmount: number;

  @Field(() => Int)
  invoiceCount: number;

  @Field(() => Int)
  daysOverdue: number;

  @Field(() => Date)
  oldestInvoiceDate: Date;
}
```

**Step 2: Add service method**

```typescript
// Add to apps/api/src/billing/billing.service.ts

async getArAging(clubId: string): Promise<ArAgingItem[]> {
  const today = new Date();

  const invoices = await this.prisma.invoice.findMany({
    where: {
      clubId,
      status: { in: ['PENDING', 'SENT', 'PARTIAL', 'OVERDUE'] },
      balanceAmount: { gt: 0 },
    },
    include: {
      member: true,
    },
    orderBy: { dueDate: 'asc' },
  });

  // Group by member
  const memberMap = new Map<string, {
    member: any;
    totalBalance: number;
    invoiceCount: number;
    oldestDueDate: Date;
  }>();

  for (const invoice of invoices) {
    const existing = memberMap.get(invoice.memberId);

    if (existing) {
      existing.totalBalance += Number(invoice.balanceAmount);
      existing.invoiceCount++;
      if (invoice.dueDate < existing.oldestDueDate) {
        existing.oldestDueDate = invoice.dueDate;
      }
    } else {
      memberMap.set(invoice.memberId, {
        member: invoice.member,
        totalBalance: Number(invoice.balanceAmount),
        invoiceCount: 1,
        oldestDueDate: invoice.dueDate,
      });
    }
  }

  return Array.from(memberMap.entries()).map(([memberId, data]) => {
    const daysOverdue = Math.max(
      0,
      Math.floor((today.getTime() - data.oldestDueDate.getTime()) / (1000 * 60 * 60 * 24))
    );

    return {
      memberId,
      memberName: `${data.member.firstName} ${data.member.lastName}`,
      memberNumber: data.member.memberNumber || memberId.slice(0, 8),
      balanceAmount: data.totalBalance,
      invoiceCount: data.invoiceCount,
      daysOverdue,
      oldestInvoiceDate: data.oldestDueDate,
    };
  });
}
```

**Step 3: Add resolver query**

```typescript
// Add to apps/api/src/billing/billing.resolver.ts

@Query(() => [ArAgingItem])
async arAging(@CurrentUser() user: User) {
  return this.billingService.getArAging(user.clubId);
}
```

**Step 4: Regenerate GraphQL client**

Run: `cd packages/api-client && pnpm run codegen`
Expected: arAgingQuery generated

**Step 5: Commit**

```bash
git add apps/api/src/billing/ packages/api-client/
git commit -m "feat(api): add AR aging query with member grouping"
```

---

## Task 8: Credit Note Creation Modal

**Files:**
- Create: `apps/application/src/components/billing/credit-note-modal.tsx`

**Step 1: Create credit note modal**

```tsx
// apps/application/src/components/billing/credit-note-modal.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@clubvantage/ui/primitives/dialog';
import { Button } from '@clubvantage/ui/primitives/button';
import { Label } from '@clubvantage/ui/primitives/label';
import { Input } from '@clubvantage/ui/primitives/input';
import { Textarea } from '@clubvantage/ui/primitives/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@clubvantage/ui/primitives/select';
import { MemberSearchCombobox } from '../members/member-search-combobox';
import { useCreateCreditNoteMutation } from '@clubvantage/api-client';
import { toast } from 'sonner';

const CREDIT_NOTE_TYPES = [
  { value: 'REFUND', label: 'Refund' },
  { value: 'ADJUSTMENT', label: 'Billing Adjustment' },
  { value: 'COURTESY', label: 'Courtesy Credit' },
  { value: 'PROMO', label: 'Promotional Credit' },
  { value: 'RETURN', label: 'Product Return' },
  { value: 'CANCELLATION', label: 'Cancellation' },
];

const CREDIT_NOTE_REASONS = [
  { value: 'BILLING_ERROR', label: 'Billing Error' },
  { value: 'DUPLICATE_CHARGE', label: 'Duplicate Charge' },
  { value: 'SERVICE_NOT_RENDERED', label: 'Service Not Rendered' },
  { value: 'MEMBERSHIP_CANCELLATION', label: 'Membership Cancellation' },
  { value: 'PRODUCT_RETURN', label: 'Product Return' },
  { value: 'PRICE_ADJUSTMENT', label: 'Price Adjustment' },
  { value: 'CUSTOMER_SATISFACTION', label: 'Customer Satisfaction' },
  { value: 'EVENT_CANCELLATION', label: 'Event Cancellation' },
  { value: 'RAIN_CHECK', label: 'Rain Check' },
  { value: 'OVERPAYMENT', label: 'Overpayment' },
  { value: 'OTHER', label: 'Other' },
];

const creditNoteSchema = z.object({
  memberId: z.string().min(1, 'Member is required'),
  type: z.string().min(1, 'Type is required'),
  reason: z.string().min(1, 'Reason is required'),
  reasonDetail: z.string().optional(),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  internalNotes: z.string().optional(),
});

type CreditNoteFormData = z.infer<typeof creditNoteSchema>;

interface CreditNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preSelectedMemberId?: string;
  onSuccess?: () => void;
}

export function CreditNoteModal({
  open,
  onOpenChange,
  preSelectedMemberId,
  onSuccess,
}: CreditNoteModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreditNoteFormData>({
    resolver: zodResolver(creditNoteSchema),
    defaultValues: {
      memberId: preSelectedMemberId || '',
      type: 'ADJUSTMENT',
      reason: 'BILLING_ERROR',
    },
  });

  const [createCreditNote, { loading }] = useCreateCreditNoteMutation();

  const memberId = watch('memberId');

  const onSubmit = async (data: CreditNoteFormData) => {
    try {
      await createCreditNote({
        variables: {
          input: {
            memberId: data.memberId,
            type: data.type,
            reason: data.reason,
            reasonDetail: data.reasonDetail,
            lineItems: [
              {
                description: data.description,
                quantity: 1,
                unitPrice: data.amount,
              },
            ],
            internalNotes: data.internalNotes,
          },
        },
      });

      toast.success('Credit note created');
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to create credit note');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Credit Note</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Member */}
          <div className="space-y-2">
            <Label>Member *</Label>
            <MemberSearchCombobox
              value={memberId}
              onSelect={(member) => setValue('memberId', member.id)}
              disabled={!!preSelectedMemberId}
            />
            {errors.memberId && (
              <p className="text-sm text-red-500">{errors.memberId.message}</p>
            )}
          </div>

          {/* Type and Reason */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={watch('type')}
                onValueChange={(v) => setValue('type', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CREDIT_NOTE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reason *</Label>
              <Select
                value={watch('reason')}
                onValueChange={(v) => setValue('reason', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CREDIT_NOTE_REASONS.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reason Detail */}
          <div className="space-y-2">
            <Label>Reason Details (optional)</Label>
            <Input
              {...register('reasonDetail')}
              placeholder="Additional explanation"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount *</Label>
            <Input
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              placeholder="0.00"
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description *</Label>
            <Input
              {...register('description')}
              placeholder="What is this credit for?"
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          {/* Internal Notes */}
          <div className="space-y-2">
            <Label>Internal Notes (optional)</Label>
            <Textarea
              {...register('internalNotes')}
              placeholder="Notes visible only to staff"
              rows={2}
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={loading}>
            Create Credit Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2: Commit**

```bash
git add apps/application/src/components/billing/credit-note-modal.tsx
git commit -m "feat(billing): add credit note creation modal"
```

---

## Task 9: Credit Note GraphQL Operations

**Files:**
- Create: `apps/api/src/billing/credit-note.resolver.ts`
- Create: `apps/api/src/billing/dto/create-credit-note.input.ts`

**Step 1: Create input DTO**

```typescript
// apps/api/src/billing/dto/create-credit-note.input.ts
import { InputType, Field, Float, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreditNoteLineItemInput {
  @Field()
  @IsNotEmpty()
  description: string;

  @Field(() => Float, { defaultValue: 1 })
  quantity: number;

  @Field(() => Float)
  @IsNotEmpty()
  unitPrice: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  chargeTypeId?: string;
}

@InputType()
export class CreateCreditNoteInput {
  @Field(() => ID)
  @IsNotEmpty()
  memberId: string;

  @Field()
  @IsNotEmpty()
  type: string;

  @Field()
  @IsNotEmpty()
  reason: string;

  @Field({ nullable: true })
  @IsOptional()
  reasonDetail?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  sourceInvoiceId?: string;

  @Field(() => [CreditNoteLineItemInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreditNoteLineItemInput)
  lineItems: CreditNoteLineItemInput[];

  @Field({ nullable: true })
  @IsOptional()
  internalNotes?: string;

  @Field({ nullable: true })
  @IsOptional()
  memberVisibleNotes?: string;
}
```

**Step 2: Create resolver**

```typescript
// apps/api/src/billing/credit-note.resolver.ts
import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreditNote } from './entities/credit-note.entity';
import { CreateCreditNoteInput } from './dto/create-credit-note.input';

@Resolver(() => CreditNote)
@UseGuards(JwtAuthGuard)
export class CreditNoteResolver {
  constructor(private readonly prisma: PrismaService) {}

  @Query(() => [CreditNote])
  async creditNotes(@CurrentUser() user: User) {
    return this.prisma.creditNote.findMany({
      where: { clubId: user.clubId },
      include: {
        member: true,
        lineItems: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Query(() => CreditNote, { nullable: true })
  async creditNote(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.prisma.creditNote.findFirst({
      where: { id, clubId: user.clubId },
      include: {
        member: true,
        lineItems: true,
        applications: { include: { invoice: true } },
      },
    });
  }

  @Mutation(() => CreditNote)
  async createCreditNote(
    @Args('input') input: CreateCreditNoteInput,
    @CurrentUser() user: User,
  ) {
    const creditNoteNumber = await this.generateCreditNoteNumber(user.clubId);

    // Calculate totals
    let subtotal = 0;
    const lineItemsData = input.lineItems.map((item) => {
      const lineTotal = item.quantity * item.unitPrice;
      subtotal += lineTotal;
      return {
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        lineTotal,
        chargeTypeId: item.chargeTypeId,
      };
    });

    return this.prisma.creditNote.create({
      data: {
        clubId: user.clubId,
        memberId: input.memberId,
        creditNoteNumber,
        type: input.type as any,
        reason: input.reason as any,
        reasonDetail: input.reasonDetail,
        sourceInvoiceId: input.sourceInvoiceId,
        subtotal,
        totalAmount: subtotal,
        status: 'PENDING_APPROVAL',
        internalNotes: input.internalNotes,
        memberVisibleNotes: input.memberVisibleNotes,
        createdBy: user.id,
        lineItems: {
          create: lineItemsData,
        },
      },
      include: {
        member: true,
        lineItems: true,
      },
    });
  }

  @Mutation(() => CreditNote)
  async approveCreditNote(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.prisma.creditNote.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: user.id,
        approvedAt: new Date(),
      },
      include: {
        member: true,
        lineItems: true,
      },
    });
  }

  @Mutation(() => CreditNote)
  async applyCreditNoteToBalance(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    const creditNote = await this.prisma.creditNote.findUnique({
      where: { id },
    });

    if (!creditNote || creditNote.status !== 'APPROVED') {
      throw new Error('Credit note must be approved before applying');
    }

    return this.prisma.$transaction(async (tx) => {
      // Add to member credit balance
      await tx.member.update({
        where: { id: creditNote.memberId },
        data: {
          creditBalance: {
            increment: Number(creditNote.totalAmount),
          },
        },
      });

      // Update credit note status
      return tx.creditNote.update({
        where: { id },
        data: {
          status: 'APPLIED',
          appliedToBalance: creditNote.totalAmount,
        },
        include: {
          member: true,
          lineItems: true,
        },
      });
    });
  }

  private async generateCreditNoteNumber(clubId: string): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `CN-${year}-`;

    const lastCreditNote = await this.prisma.creditNote.findFirst({
      where: {
        clubId,
        creditNoteNumber: { startsWith: prefix },
      },
      orderBy: { creditNoteNumber: 'desc' },
    });

    let nextNumber = 1;
    if (lastCreditNote) {
      const lastNumber = parseInt(
        lastCreditNote.creditNoteNumber.split('-').pop() || '0',
        10
      );
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
  }
}
```

**Step 3: Add module exports**

```typescript
// Update apps/api/src/billing/billing.module.ts to include CreditNoteResolver
```

**Step 4: Regenerate client**

Run: `cd packages/api-client && pnpm run codegen`

**Step 5: Commit**

```bash
git add apps/api/src/billing/
git commit -m "feat(api): add CreditNote resolver with CRUD operations"
```

---

## Task 10: Integrate Components into Billing Page

**Files:**
- Modify: `apps/application/src/app/(dashboard)/billing/page.tsx`

**Step 1: Update billing page with modals and dashboard**

```tsx
// apps/application/src/app/(dashboard)/billing/page.tsx
'use client';

import { useState } from 'react';
import { Plus, CreditCard, FileText, Receipt } from 'lucide-react';
import { Button } from '@clubvantage/ui/primitives/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@clubvantage/ui/primitives/tabs';
import { InvoiceCreateModal } from '@/components/billing/invoice-create-modal';
import { PaymentRecordModal } from '@/components/billing/payment-record-modal';
import { CreditNoteModal } from '@/components/billing/credit-note-modal';
import { ArAgingDashboard } from '@/components/billing/ar-aging-dashboard';
import { InvoiceRegister } from '@/components/billing/invoice-register';
import { ReceiptRegister } from '@/components/billing/receipt-register';
import { CreditNoteList } from '@/components/billing/credit-note-list';

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('invoices');
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [creditNoteModalOpen, setCreditNoteModalOpen] = useState(false);

  const handleRefresh = () => {
    // Trigger refetch of data
    window.location.reload();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Billing & AR</h1>
          <p className="text-stone-500">Manage invoices, payments, and receivables</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCreditNoteModalOpen(true)}
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Credit Note
          </Button>
          <Button
            variant="outline"
            onClick={() => setPaymentModalOpen(true)}
          >
            <Receipt className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
          <Button onClick={() => setInvoiceModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="credit-notes">Credit Notes</TabsTrigger>
          <TabsTrigger value="aging">AR Aging</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="mt-6">
          <InvoiceRegister />
        </TabsContent>

        <TabsContent value="receipts" className="mt-6">
          <ReceiptRegister />
        </TabsContent>

        <TabsContent value="credit-notes" className="mt-6">
          <CreditNoteList />
        </TabsContent>

        <TabsContent value="aging" className="mt-6">
          <ArAgingDashboard />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <InvoiceCreateModal
        open={invoiceModalOpen}
        onOpenChange={setInvoiceModalOpen}
        onSuccess={handleRefresh}
      />

      <PaymentRecordModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        onSuccess={handleRefresh}
      />

      <CreditNoteModal
        open={creditNoteModalOpen}
        onOpenChange={setCreditNoteModalOpen}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
```

**Step 2: Verify build**

Run: `cd apps/application && pnpm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add apps/application/src/app/(dashboard)/billing/
git commit -m "feat(billing): integrate invoice, payment, credit note modals into billing page"
```

---

## Summary

**Month 1 delivers:**

1. ✅ Invoice creation with line items and tax calculation
2. ✅ Payment recording with multi-invoice allocation
3. ✅ Credit notes with approval workflow
4. ✅ AR aging dashboard with bucket visualization
5. ✅ Integration into billing page

**Files created/modified:**
- 15+ new components
- 5+ new API resolvers/services
- Database schema updates for CreditNote and CollectionAction

**Next steps:**
- Month 2: POS sales completion and discount engine
- Month 3: Auto-pay and recurring billing with Stripe

---

Plan complete and saved to `docs/plans/2026-02-02-month1-billing-ar-implementation.md`. Two execution options:

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
