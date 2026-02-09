'use client';

import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@clubvantage/ui';
import { ReceiptForm, type ReceiptFormData, type MemberSearchResult } from './receipt-form';
import { ConfirmPaymentDialog } from './billing-dialogs';
import { type MemberSelectionData } from './member-selection-card';
import { type AllocationInvoice } from './allocation-table-row';

interface PaymentRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Preselected member (optional) */
  preselectedMember?: MemberSelectionData | null;
  /** Callback to search for members */
  onMemberSearch: (query: string) => void;
  /** Member search results */
  memberSearchResults: MemberSearchResult[];
  /** Whether member search is in progress */
  isSearchingMembers?: boolean;
  /** Callback to fetch invoices for a member */
  onMemberSelect: (memberId: string) => Promise<{
    member: MemberSelectionData;
    invoices: AllocationInvoice[];
  }>;
  /** Available outlets */
  outlets: { id: string; name: string }[];
  /** Callback when payment is submitted */
  onSubmit: (data: ReceiptFormData) => Promise<void>;
  /** Loading state */
  isSubmitting?: boolean;
}

export function PaymentRecordModal({
  open,
  onOpenChange,
  preselectedMember,
  onMemberSearch,
  memberSearchResults,
  isSearchingMembers = false,
  onMemberSelect,
  outlets,
  onSubmit,
  isSubmitting = false,
}: PaymentRecordModalProps) {
  const [selectedMember, setSelectedMember] = useState<MemberSelectionData | null>(
    preselectedMember || null
  );
  const [pendingInvoices, setPendingInvoices] = useState<AllocationInvoice[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingData, setPendingData] = useState<ReceiptFormData | null>(null);
  const [error, setError] = useState<string>();

  const handleMemberSelect = useCallback(
    async (memberId: string) => {
      setIsLoadingInvoices(true);
      setError(undefined);
      try {
        const result = await onMemberSelect(memberId);
        setSelectedMember(result.member);
        setPendingInvoices(result.invoices);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load member data');
      } finally {
        setIsLoadingInvoices(false);
      }
    },
    [onMemberSelect]
  );

  const handleMemberClear = useCallback(() => {
    setSelectedMember(null);
    setPendingInvoices([]);
  }, []);

  const handleFormSubmit = (data: ReceiptFormData) => {
    setPendingData(data);
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    if (!pendingData) return;

    setError(undefined);
    try {
      await onSubmit(pendingData);
      // Reset state and close modal
      resetForm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment');
      setShowConfirmDialog(false);
    }
  };

  const resetForm = () => {
    setSelectedMember(preselectedMember || null);
    setPendingInvoices([]);
    setPendingData(null);
    setError(undefined);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  // Calculate dialog data
  const totalAllocated = pendingData
    ? Object.values(pendingData.allocations).reduce((sum, amount) => sum + amount, 0)
    : 0;
  const memberOutstanding = pendingInvoices.reduce((sum, inv) => sum + inv.balance, 0);
  const isSuspended = selectedMember?.agingStatus === 'SUSPENDED';
  const willReinstate = isSuspended && totalAllocated >= memberOutstanding;
  const remainsSuspended = isSuspended && !willReinstate;
  const outstandingAfter = memberOutstanding - totalAllocated;

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <ReceiptForm
              outlets={outlets}
              selectedMember={selectedMember}
              pendingInvoices={pendingInvoices}
              memberSearchResults={memberSearchResults}
              isSearching={isSearchingMembers}
              isSubmitting={isSubmitting}
              isLoadingInvoices={isLoadingInvoices}
              onMemberSearch={onMemberSearch}
              onMemberSelect={handleMemberSelect}
              onMemberClear={handleMemberClear}
              onSubmit={handleFormSubmit}
              onCancel={handleClose}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      {pendingData && selectedMember && (
        <ConfirmPaymentDialog
          isOpen={showConfirmDialog}
          isLoading={isSubmitting}
          amount={pendingData.amount}
          memberName={selectedMember.name}
          invoiceCount={Object.values(pendingData.allocations).filter((a) => a > 0).length}
          willReinstate={willReinstate}
          remainsSuspended={remainsSuspended}
          outstandingAmount={outstandingAfter > 0 ? outstandingAfter : undefined}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
