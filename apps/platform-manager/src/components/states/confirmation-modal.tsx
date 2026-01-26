'use client';

import * as React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  impacts?: string[];
  confirmLabel?: string;
  confirmVariant?: 'default' | 'destructive';
  requireInput?: {
    value: string;
    label: string;
  };
  loading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  impacts,
  confirmLabel = 'Confirm',
  confirmVariant = 'default',
  requireInput,
  loading = false,
}: ConfirmationModalProps) {
  const [inputValue, setInputValue] = React.useState('');

  const canConfirm = requireInput
    ? inputValue === requireInput.value
    : true;

  // Reset input when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setInputValue('');
    }
  }, [isOpen]);

  // Handle Escape key
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={loading ? undefined : onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
        <div className="bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-slate-400 hover:text-slate-600 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Warning Icon & Description */}
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center',
                  confirmVariant === 'destructive'
                    ? 'bg-red-100'
                    : 'bg-amber-100'
                )}
              >
                <AlertTriangle
                  className={cn(
                    'h-5 w-5',
                    confirmVariant === 'destructive'
                      ? 'text-red-600'
                      : 'text-amber-600'
                  )}
                />
              </div>
              <div className="flex-1">
                <p className="text-slate-700">{description}</p>

                {/* Impact List */}
                {impacts && impacts.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-slate-900 mb-2">
                      This will immediately:
                    </p>
                    <ul className="space-y-1">
                      {impacts.map((impact, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                          <span className="text-slate-400">•</span>
                          {impact}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Confirmation Input */}
            {requireInput && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type "{requireInput.value}" to confirm:
                </label>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={requireInput.value}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant={confirmVariant}
              onClick={onConfirm}
              disabled={!canConfirm || loading}
            >
              {loading ? 'Processing...' : confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

// Pre-configured confirmation modals
export function useSuspendConfirmation() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const resolveRef = React.useRef<((value: boolean) => void) | null>(null);

  const confirm = React.useCallback(
    (tenantName: string, memberCount: number, staffCount: number) => {
      setIsOpen(true);
      return new Promise<boolean>((resolve) => {
        resolveRef.current = resolve;
      });
    },
    []
  );

  const handleConfirm = React.useCallback(async () => {
    setLoading(true);
    resolveRef.current?.(true);
    setLoading(false);
    setIsOpen(false);
  }, []);

  const handleClose = React.useCallback(() => {
    resolveRef.current?.(false);
    setIsOpen(false);
  }, []);

  return {
    confirm,
    Modal: ({ tenantName, memberCount, staffCount }: { tenantName: string; memberCount: number; staffCount: number }) => (
      <ConfirmationModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Confirm Suspension"
        description={`You are about to suspend ${tenantName}.`}
        impacts={[
          `Block access for ${memberCount.toLocaleString()} members`,
          `Block access for ${staffCount} staff users`,
          'Disable all API access',
        ]}
        confirmLabel="Suspend Tenant"
        confirmVariant="destructive"
        loading={loading}
      />
    ),
  };
}

export function useArchiveConfirmation() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tenantName, setTenantName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const resolveRef = React.useRef<((value: boolean) => void) | null>(null);

  const confirm = React.useCallback((name: string) => {
    setTenantName(name);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = React.useCallback(async () => {
    setLoading(true);
    resolveRef.current?.(true);
    setLoading(false);
    setIsOpen(false);
  }, []);

  const handleClose = React.useCallback(() => {
    resolveRef.current?.(false);
    setIsOpen(false);
  }, []);

  return {
    confirm,
    Modal: () => (
      <ConfirmationModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Archive Tenant"
        description={`You are about to archive ${tenantName}.`}
        impacts={[
          'Will retain data for 90 days',
          'Cannot be reversed after 90 days',
          'Requires data export to be completed first',
        ]}
        confirmLabel="Archive Tenant"
        confirmVariant="destructive"
        requireInput={{ value: tenantName, label: tenantName }}
        loading={loading}
      />
    ),
  };
}
