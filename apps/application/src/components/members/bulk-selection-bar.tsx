'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check, Minus, ChevronDown, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@clubvantage/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@clubvantage/ui';
import { cn } from '@clubvantage/ui';
import type { MemberStatus } from './types';

// =============================================================================
// Types
// =============================================================================

export interface SelectedMember {
  id: string;
  memberNumber: string;
  name: string;
  status: MemberStatus;
}

export interface BulkSelectionBarProps {
  selectedMembers: SelectedMember[];
  onClearSelection: () => void;
  onSendInvoice: (memberIds: string[]) => void;
  onExport: (memberIds: string[]) => void;
  onChangeStatus: (memberIds: string[], newStatus: MemberStatus) => void;
  onDelete: (memberIds: string[]) => void;
  isActionLoading?: {
    sendInvoice?: boolean;
    export?: boolean;
    changeStatus?: boolean;
    delete?: boolean;
  };
  className?: string;
}

// =============================================================================
// Status Options
// =============================================================================

const statusOptions: { value: MemberStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'LAPSED', label: 'Lapsed' },
  { value: 'TERMINATED', label: 'Terminated' },
];

// =============================================================================
// Component
// =============================================================================

export function BulkSelectionBar({
  selectedMembers,
  onClearSelection,
  onSendInvoice,
  onExport,
  onChangeStatus,
  onDelete,
  isActionLoading = {},
  className,
}: BulkSelectionBarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedCount = selectedMembers.length;
  const isVisible = selectedCount > 0;

  // Group selection by status
  const statusCounts = selectedMembers.reduce(
    (acc, member) => {
      acc[member.status] = (acc[member.status] || 0) + 1;
      return acc;
    },
    {} as Record<MemberStatus, number>
  );

  const statusEntries = Object.entries(statusCounts) as [MemberStatus, number][];
  const hasMixedStatuses = statusEntries.length > 1;

  // Check for invalid combinations (e.g., can't send invoice to cancelled members)
  const hasInvalidForInvoice = statusCounts['TERMINATED'] > 0 || statusCounts['RESIGNED'] > 0;

  // Handle Escape key to clear selection
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        onClearSelection();
      }
    },
    [isVisible, onClearSelection]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle delete confirmation
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    onDelete(selectedMembers.map((m) => m.id));
    setShowDeleteConfirm(false);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  if (!isVisible) {
    return null;
  }

  const memberIds = selectedMembers.map((m) => m.id);

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]',
        'transform transition-transform duration-200',
        isVisible ? 'translate-y-0' : 'translate-y-full',
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Indeterminate checkbox visual */}
          <div className="flex h-5 w-5 items-center justify-center rounded border-2 border-amber-500 bg-amber-500">
            <Minus className="h-3 w-3 text-white" />
          </div>

          {/* Selection text */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">
              {selectedCount} member{selectedCount !== 1 ? 's' : ''} selected
            </span>

            {/* Selection summary toggle */}
            {hasMixedStatuses && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    isExpanded && 'rotate-180'
                  )}
                />
              </button>
            )}

            {/* Clear selection link */}
            <button
              onClick={onClearSelection}
              className="ml-2 text-sm text-amber-600 hover:text-amber-700 hover:underline"
            >
              Clear selection
            </button>
          </div>
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Warning for invalid combinations */}
          {hasInvalidForInvoice && (
            <div className="mr-2 flex items-center gap-1 text-sm text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <span>Some actions unavailable</span>
            </div>
          )}

          {/* Send Invoice */}
          <Button
            onClick={() => onSendInvoice(memberIds)}
            disabled={isActionLoading.sendInvoice || hasInvalidForInvoice}
          >
            {isActionLoading.sendInvoice && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Send Invoice
          </Button>

          {/* Export */}
          <Button
            variant="outline"
            onClick={() => onExport(memberIds)}
            disabled={isActionLoading.export}
          >
            {isActionLoading.export && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Export
          </Button>

          {/* Change Status Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isActionLoading.changeStatus}>
                {isActionLoading.changeStatus && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Change Status
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {statusOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onChangeStatus(memberIds, option.value)}
                  className="cursor-pointer"
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Delete (with confirmation) */}
          {!showDeleteConfirm ? (
            <Button
              variant="outline"
              onClick={handleDeleteClick}
              disabled={isActionLoading.delete}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              {isActionLoading.delete && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5">
              <span className="text-sm text-red-700">Confirm delete?</span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDeleteCancel}
                className="h-7 px-2"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleDeleteConfirm}
                className="h-7 bg-red-600 px-2 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Selection Summary */}
      {isExpanded && hasMixedStatuses && (
        <div className="border-t border-border bg-muted px-6 py-2">
          <div className="mx-auto flex max-w-7xl items-center gap-4 text-sm text-muted-foreground">
            <span>Selection breakdown:</span>
            {statusEntries.map(([status, count]) => (
              <span key={status} className="flex items-center gap-1">
                <span
                  className={cn(
                    'inline-block h-2 w-2 rounded-full',
                    status === 'ACTIVE' && 'bg-emerald-500',
                    status === 'REACTIVATED' && 'bg-emerald-500',
                    (status === 'PROSPECT' || status === 'LEAD' || status === 'APPLICANT') && 'bg-amber-500',
                    status === 'SUSPENDED' && 'bg-red-500',
                    (status === 'LAPSED' || status === 'RESIGNED' || status === 'TERMINATED') && 'bg-stone-400'
                  )}
                />
                {count} {status.toLowerCase()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
