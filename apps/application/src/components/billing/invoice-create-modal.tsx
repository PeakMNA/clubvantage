'use client';

import { useState, useCallback, useMemo } from 'react';
import { Plus, Send, Save, Loader2 } from 'lucide-react';
import { cn } from '@clubvantage/ui';
import { Button } from '@clubvantage/ui';
import { Input } from '@clubvantage/ui';
import { Label } from '@clubvantage/ui';
import { MemberCombobox, type MemberOption } from '@clubvantage/ui';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@clubvantage/ui';
import { InvoiceLineItemRow, type LineItemData, type ChargeType } from './invoice-line-item-row';

export interface DiscountOption {
  id: string;
  name: string;
  code: string | null;
  type: string;
  value: number;
}

interface InvoiceCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: MemberOption[];
  chargeTypes: ChargeType[];
  discounts?: DiscountOption[];
  isLoadingMembers?: boolean;
  onMemberSearch?: (query: string) => void;
  onSubmit: (data: InvoiceFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export interface InvoiceFormData {
  memberId: string;
  invoiceDate: string;
  dueDate: string;
  notes?: string;
  lineItems: {
    chargeTypeId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
  }[];
  sendEmail: boolean;
  discountId?: string;
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0] || '';
}

export function InvoiceCreateModal({
  open,
  onOpenChange,
  members,
  chargeTypes,
  discounts = [],
  isLoadingMembers = false,
  onMemberSearch,
  onSubmit,
  isSubmitting = false,
}: InvoiceCreateModalProps) {
  const [memberId, setMemberId] = useState<string>();
  const [selectedDiscountId, setSelectedDiscountId] = useState<string>('');
  const [invoiceDate, setInvoiceDate] = useState(formatDateForInput(new Date()));
  const [dueDate, setDueDate] = useState(
    formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  );
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItemData[]>([
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
  const [error, setError] = useState<string>();

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

  const updateLineItem = (id: string, updated: LineItemData) => {
    setLineItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
  };

  const removeLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const selectedDiscount = discounts.find((d) => d.id === selectedDiscountId);

  const totals = useMemo(() => {
    let subtotal = 0;
    let taxTotal = 0;

    lineItems.forEach((item) => {
      const lineTotal = item.quantity * item.unitPrice;
      subtotal += lineTotal;
      if (item.taxable) {
        taxTotal += lineTotal * (item.taxRate / 100);
      }
    });

    const beforeDiscount = subtotal + taxTotal;
    let discountAmount = 0;
    if (selectedDiscount) {
      if (selectedDiscount.type === 'PERCENTAGE') {
        discountAmount = beforeDiscount * (selectedDiscount.value / 100);
      } else {
        discountAmount = Math.min(selectedDiscount.value, beforeDiscount);
      }
    }

    return {
      subtotal,
      taxTotal,
      discountAmount,
      total: beforeDiscount - discountAmount,
    };
  }, [lineItems, selectedDiscount]);

  const resetForm = () => {
    setMemberId(undefined);
    setInvoiceDate(formatDateForInput(new Date()));
    setDueDate(formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)));
    setNotes('');
    setSelectedDiscountId('');
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
    setError(undefined);
  };

  const handleSubmit = async (sendNow: boolean) => {
    setError(undefined);

    if (!memberId) {
      setError('Please select a member');
      return;
    }

    const validLineItems = lineItems.filter(
      (item) => item.chargeTypeId && item.unitPrice > 0
    );

    if (validLineItems.length === 0) {
      setError('Please add at least one line item');
      return;
    }

    try {
      await onSubmit({
        memberId,
        invoiceDate,
        dueDate,
        notes: notes || undefined,
        lineItems: validLineItems.map((item) => ({
          chargeTypeId: item.chargeTypeId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
        })),
        sendEmail: sendNow,
        discountId: selectedDiscountId || undefined,
      });

      resetForm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Member Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Member *</Label>
              <MemberCombobox
                members={members}
                value={memberId}
                onValueChange={setMemberId}
                onSearch={onMemberSearch}
                isLoading={isLoadingMembers}
                placeholder="Search and select member..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Invoice Date</Label>
                <Input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
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
                Subtotal:{' '}
                <span className="font-medium">
                  ฿{totals.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-sm">
                Tax:{' '}
                <span className="font-medium">
                  ฿{totals.taxTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="text-sm text-emerald-600">
                  Discount:{' '}
                  <span className="font-medium">
                    -฿{totals.discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="text-lg font-semibold">
                Total: ฿{totals.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Discount Selector */}
          {discounts.length > 0 && (
            <div className="space-y-2">
              <Label>Apply Discount (optional)</Label>
              <select
                className="w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={selectedDiscountId}
                onChange={(e) => setSelectedDiscountId(e.target.value)}
              >
                <option value="">No discount</option>
                {discounts.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                    {d.code ? ` (${d.code})` : ''} —{' '}
                    {d.type === 'PERCENTAGE' ? `${d.value}%` : `฿${d.value}`}
                  </option>
                ))}
              </select>
              {selectedDiscount && totals.discountAmount > 0 && (
                <p className="text-xs text-emerald-600">
                  Saves ฿{totals.discountAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes or memo for this invoice"
              rows={2}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Save Draft
          </Button>
          <Button onClick={() => handleSubmit(true)} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-1" />
            )}
            Create & Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
