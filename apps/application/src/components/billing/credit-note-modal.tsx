'use client';

import { useState, useMemo } from 'react';
import { Loader2, FileText } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@clubvantage/ui';

const CREDIT_NOTE_TYPES = [
  { value: 'REFUND', label: 'Refund' },
  { value: 'ADJUSTMENT', label: 'Billing Adjustment' },
  { value: 'COURTESY', label: 'Courtesy Credit' },
  { value: 'PROMO', label: 'Promotional Credit' },
  { value: 'RETURN', label: 'Product Return' },
  { value: 'CANCELLATION', label: 'Cancellation' },
  { value: 'WRITE_OFF', label: 'Write Off' },
] as const;

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
] as const;

export type CreditNoteType = (typeof CREDIT_NOTE_TYPES)[number]['value'];
export type CreditNoteReason = (typeof CREDIT_NOTE_REASONS)[number]['value'];

export interface CreditNoteFormData {
  memberId: string;
  type: CreditNoteType;
  reason: CreditNoteReason;
  reasonDetail?: string;
  amount: number;
  description: string;
  internalNotes?: string;
  memberVisibleNotes?: string;
}

interface CreditNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: MemberOption[];
  isLoadingMembers?: boolean;
  onMemberSearch?: (query: string) => void;
  onSubmit: (data: CreditNoteFormData) => Promise<void>;
  isSubmitting?: boolean;
  preSelectedMemberId?: string;
}

export function CreditNoteModal({
  open,
  onOpenChange,
  members,
  isLoadingMembers = false,
  onMemberSearch,
  onSubmit,
  isSubmitting = false,
  preSelectedMemberId,
}: CreditNoteModalProps) {
  const [memberId, setMemberId] = useState<string | undefined>(preSelectedMemberId);
  const [type, setType] = useState<CreditNoteType>('ADJUSTMENT');
  const [reason, setReason] = useState<CreditNoteReason>('BILLING_ERROR');
  const [reasonDetail, setReasonDetail] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [memberVisibleNotes, setMemberVisibleNotes] = useState('');
  const [error, setError] = useState<string>();

  const resetForm = () => {
    setMemberId(preSelectedMemberId);
    setType('ADJUSTMENT');
    setReason('BILLING_ERROR');
    setReasonDetail('');
    setAmount('');
    setDescription('');
    setInternalNotes('');
    setMemberVisibleNotes('');
    setError(undefined);
  };

  const handleSubmit = async () => {
    setError(undefined);

    if (!memberId) {
      setError('Please select a member');
      return;
    }

    if (!amount || amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    try {
      await onSubmit({
        memberId,
        type,
        reason,
        reasonDetail: reasonDetail || undefined,
        amount: Number(amount),
        description,
        internalNotes: internalNotes || undefined,
        memberVisibleNotes: memberVisibleNotes || undefined,
      });

      resetForm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create credit note');
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  // Auto-generate description based on type and reason
  const suggestedDescription = useMemo(() => {
    const typeLabel = CREDIT_NOTE_TYPES.find((t) => t.value === type)?.label || '';
    const reasonLabel = CREDIT_NOTE_REASONS.find((r) => r.value === reason)?.label || '';
    return `${typeLabel} - ${reasonLabel}`;
  }, [type, reason]);

  const handleAutoFillDescription = () => {
    setDescription(suggestedDescription);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-500" />
            Create Credit Note
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Member Selection */}
          <div className="space-y-2">
            <Label>Member *</Label>
            <MemberCombobox
              members={members}
              value={memberId}
              onValueChange={setMemberId}
              onSearch={onMemberSearch}
              isLoading={isLoadingMembers}
              placeholder="Search and select member..."
              disabled={!!preSelectedMemberId}
            />
          </div>

          {/* Type and Reason */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={type} onValueChange={(v) => setType(v as CreditNoteType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CREDIT_NOTE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reason *</Label>
              <Select value={reason} onValueChange={(v) => setReason(v as CreditNoteReason)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CREDIT_NOTE_REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
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
              value={reasonDetail}
              onChange={(e) => setReasonDetail(e.target.value)}
              placeholder="Additional explanation for the credit"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">฿</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="0.00"
                className="pl-8"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Description *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAutoFillDescription}
                className="text-xs text-amber-600 hover:text-amber-700"
              >
                Auto-fill from type/reason
              </Button>
            </div>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this credit for?"
            />
          </div>

          {/* Member Visible Notes */}
          <div className="space-y-2">
            <Label>Member Visible Notes (optional)</Label>
            <textarea
              value={memberVisibleNotes}
              onChange={(e) => setMemberVisibleNotes(e.target.value)}
              placeholder="Notes that will be shown to the member"
              rows={2}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Internal Notes */}
          <div className="space-y-2">
            <Label>Internal Notes (optional)</Label>
            <textarea
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Notes visible only to staff"
              rows={2}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Summary */}
          {amount && Number(amount) > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="text-sm text-emerald-700">
                Credit amount:{' '}
                <span className="font-semibold text-lg">
                  ฿{Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-xs text-emerald-600 mt-1">
                This credit will be applied to the member's account balance after approval.
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <FileText className="h-4 w-4 mr-1" />
            )}
            Create Credit Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
