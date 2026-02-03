'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Loader2,
  Check,
  CreditCard,
  Calendar,
  AlertCircle,
  Bell,
  Shield,
  Settings2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Input,
  Label,
  Switch,
  Checkbox,
  cn,
} from '@clubvantage/ui';
import {
  useGetMemberAutoPaySettingQuery,
  useGetMemberPaymentMethodsQuery,
  useUpsertAutoPaySettingMutation,
  useDisableAutoPayMutation,
  type AutoPaySetting,
  type AutoPaySchedule,
  type StoredPaymentMethod,
  type AutoPaySettingInput,
} from '@clubvantage/api-client';
import { useQueryClient } from '@tanstack/react-query';

export interface AutoPayModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberId: string;
  memberName?: string;
}

const SCHEDULE_OPTIONS: { value: AutoPaySchedule; label: string; description: string }[] = [
  {
    value: 'INVOICE_DUE',
    label: 'Invoice Due Date',
    description: 'Pay when invoice is due',
  },
  {
    value: 'STATEMENT_DATE',
    label: 'Statement Date',
    description: 'Pay on statement generation',
  },
  {
    value: 'MONTHLY_FIXED',
    label: 'Monthly Fixed Date',
    description: 'Pay on a specific day each month',
  },
];

interface FormState {
  isEnabled: boolean;
  paymentMethodId: string;
  schedule: AutoPaySchedule;
  paymentDayOfMonth: number;
  maxPaymentAmount: string;
  monthlyMaxAmount: string;
  requireApprovalAbove: string;
  payDuesOnly: boolean;
  notifyBeforePayment: boolean;
  notifyDaysBefore: number;
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;
}

const initialFormState: FormState = {
  isEnabled: true,
  paymentMethodId: '',
  schedule: 'INVOICE_DUE',
  paymentDayOfMonth: 1,
  maxPaymentAmount: '',
  monthlyMaxAmount: '',
  requireApprovalAbove: '',
  payDuesOnly: false,
  notifyBeforePayment: true,
  notifyDaysBefore: 3,
  notifyOnSuccess: true,
  notifyOnFailure: true,
};

function formatCardLabel(method: StoredPaymentMethod): string {
  const brand = method.brand.charAt(0).toUpperCase() + method.brand.slice(1).toLowerCase();
  return `${brand} **** ${method.last4}`;
}

export function AutoPayModal({
  open,
  onOpenChange,
  memberId,
  memberName,
}: AutoPayModalProps) {
  const queryClient = useQueryClient();

  // Fetch existing auto-pay settings
  const { data: settingData, isLoading: isLoadingSettings } = useGetMemberAutoPaySettingQuery(
    { memberId },
    { enabled: open && !!memberId }
  );

  // Fetch payment methods
  const { data: methodsData, isLoading: isLoadingMethods } = useGetMemberPaymentMethodsQuery(
    { memberId, activeOnly: true },
    { enabled: open && !!memberId }
  );

  const upsertMutation = useUpsertAutoPaySettingMutation();
  const disableMutation = useDisableAutoPayMutation();

  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string>();

  const existingSetting = settingData?.memberAutoPaySetting;
  const paymentMethods = methodsData?.memberPaymentMethods ?? [];
  const activePaymentMethods = useMemo(
    () => paymentMethods.filter((m) => m.status === 'ACTIVE'),
    [paymentMethods]
  );
  const isEditing = !!existingSetting;
  const isLoading = isLoadingSettings || isLoadingMethods;
  const isSaving = upsertMutation.isPending || disableMutation.isPending;

  // Initialize form when data loads
  useEffect(() => {
    if (existingSetting) {
      setFormState({
        isEnabled: existingSetting.isEnabled,
        paymentMethodId: existingSetting.paymentMethodId,
        schedule: existingSetting.schedule,
        paymentDayOfMonth: existingSetting.paymentDayOfMonth ?? 1,
        maxPaymentAmount: existingSetting.maxPaymentAmount?.toString() ?? '',
        monthlyMaxAmount: existingSetting.monthlyMaxAmount?.toString() ?? '',
        requireApprovalAbove: existingSetting.requireApprovalAbove?.toString() ?? '',
        payDuesOnly: existingSetting.payDuesOnly,
        notifyBeforePayment: existingSetting.notifyBeforePayment,
        notifyDaysBefore: existingSetting.notifyDaysBefore,
        notifyOnSuccess: existingSetting.notifyOnSuccess,
        notifyOnFailure: existingSetting.notifyOnFailure,
      });
    } else if (activePaymentMethods.length > 0 && !existingSetting) {
      // Set default payment method for new settings
      const defaultMethod = activePaymentMethods.find((m) => m.isDefault) ?? activePaymentMethods[0];
      if (defaultMethod) {
        setFormState((prev) => ({ ...prev, paymentMethodId: defaultMethod.id }));
      }
    }
    setHasChanges(false);
  }, [existingSetting, activePaymentMethods]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const validateForm = (): string | null => {
    if (!formState.paymentMethodId) {
      return 'Please select a payment method';
    }
    if (formState.schedule === 'MONTHLY_FIXED') {
      if (formState.paymentDayOfMonth < 1 || formState.paymentDayOfMonth > 28) {
        return 'Payment day must be between 1 and 28';
      }
    }
    if (formState.maxPaymentAmount && isNaN(parseFloat(formState.maxPaymentAmount))) {
      return 'Max payment amount must be a valid number';
    }
    if (formState.monthlyMaxAmount && isNaN(parseFloat(formState.monthlyMaxAmount))) {
      return 'Monthly max amount must be a valid number';
    }
    if (formState.requireApprovalAbove && isNaN(parseFloat(formState.requireApprovalAbove))) {
      return 'Approval threshold must be a valid number';
    }
    if (formState.notifyDaysBefore < 1 || formState.notifyDaysBefore > 14) {
      return 'Notification days must be between 1 and 14';
    }
    return null;
  };

  const handleSave = async () => {
    setError(undefined);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const input: AutoPaySettingInput = {
        memberId,
        paymentMethodId: formState.paymentMethodId,
        isEnabled: formState.isEnabled,
        schedule: formState.schedule,
        paymentDayOfMonth: formState.schedule === 'MONTHLY_FIXED' ? formState.paymentDayOfMonth : null,
        maxPaymentAmount: formState.maxPaymentAmount ? parseFloat(formState.maxPaymentAmount) : null,
        monthlyMaxAmount: formState.monthlyMaxAmount ? parseFloat(formState.monthlyMaxAmount) : null,
        requireApprovalAbove: formState.requireApprovalAbove ? parseFloat(formState.requireApprovalAbove) : null,
        payDuesOnly: formState.payDuesOnly,
        notifyBeforePayment: formState.notifyBeforePayment,
        notifyDaysBefore: formState.notifyDaysBefore,
        notifyOnSuccess: formState.notifyOnSuccess,
        notifyOnFailure: formState.notifyOnFailure,
      };

      await upsertMutation.mutateAsync({ input });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['GetMemberAutoPaySetting', { memberId }] });
      queryClient.invalidateQueries({ queryKey: ['GetMemberPaymentMethods', { memberId }] });

      setShowSuccess(true);
      setHasChanges(false);
      setTimeout(() => {
        setShowSuccess(false);
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save auto-pay settings');
    }
  };

  const handleDisable = async () => {
    setError(undefined);

    try {
      await disableMutation.mutateAsync({ memberId });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['GetMemberAutoPaySetting', { memberId }] });
      queryClient.invalidateQueries({ queryKey: ['GetMemberPaymentMethods', { memberId }] });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onOpenChange(false);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disable auto-pay');
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setFormState(initialFormState);
      setError(undefined);
      setHasChanges(false);
      onOpenChange(false);
    }
  };

  const selectedMethod = activePaymentMethods.find((m) => m.id === formState.paymentMethodId);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-amber-500" />
            Auto-Pay Settings
          </DialogTitle>
        </DialogHeader>

        {memberName && (
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
            <p className="text-sm text-stone-600">
              Configure automatic payments for <span className="font-medium text-stone-900">{memberName}</span>
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            <span className="ml-2 text-muted-foreground">Loading settings...</span>
          </div>
        ) : activePaymentMethods.length === 0 ? (
          <div className="py-8 text-center">
            <CreditCard className="mx-auto h-12 w-12 text-stone-300" />
            <h3 className="mt-4 text-base font-medium text-stone-900">No Payment Methods</h3>
            <p className="mt-2 text-sm text-stone-500">
              Add a payment method before setting up auto-pay.
            </p>
          </div>
        ) : (
          <div className="space-y-6 py-2">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-stone-200 bg-stone-50/50 p-4">
              <div>
                <Label className="text-base font-medium">Enable Auto-Pay</Label>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Automatically pay invoices when due
                </p>
              </div>
              <Switch
                checked={formState.isEnabled}
                onCheckedChange={(checked) => updateField('isEnabled', checked)}
              />
            </div>

            {formState.isEnabled && (
              <>
                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-stone-500" />
                    Payment Method
                  </Label>
                  <select
                    value={formState.paymentMethodId}
                    onChange={(e) => updateField('paymentMethodId', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="">Select a payment method</option>
                    {activePaymentMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {formatCardLabel(method)}
                        {method.isDefault ? ' (Default)' : ''}
                      </option>
                    ))}
                  </select>
                  {selectedMethod && (
                    <p className="text-xs text-muted-foreground">
                      Expires: {selectedMethod.expiryMonth?.toString().padStart(2, '0')}/{selectedMethod.expiryYear?.toString().slice(-2)}
                    </p>
                  )}
                </div>

                {/* Schedule */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-stone-500" />
                    Payment Schedule
                  </Label>
                  <div className="grid gap-2">
                    {SCHEDULE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateField('schedule', option.value)}
                        className={cn(
                          'flex items-center justify-between rounded-lg border p-3 text-left transition-all',
                          formState.schedule === option.value
                            ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500'
                            : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                        )}
                      >
                        <div>
                          <p className={cn(
                            'text-sm font-medium',
                            formState.schedule === option.value ? 'text-amber-700' : 'text-stone-900'
                          )}>
                            {option.label}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                        <div
                          className={cn(
                            'h-4 w-4 rounded-full border-2 transition-colors',
                            formState.schedule === option.value
                              ? 'border-amber-500 bg-amber-500'
                              : 'border-stone-300'
                          )}
                        >
                          {formState.schedule === option.value && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Monthly Fixed Date Picker */}
                  {formState.schedule === 'MONTHLY_FIXED' && (
                    <div className="ml-4 mt-2 flex items-center gap-2 rounded-lg bg-stone-50 p-3">
                      <Label className="text-sm whitespace-nowrap">Pay on day:</Label>
                      <Input
                        type="number"
                        min={1}
                        max={28}
                        value={formState.paymentDayOfMonth}
                        onChange={(e) => updateField('paymentDayOfMonth', parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">of each month</span>
                    </div>
                  )}
                </div>

                {/* Payment Limits */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-stone-500" />
                    Payment Limits
                  </Label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Max per Payment</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">฿</span>
                        <Input
                          type="text"
                          inputMode="decimal"
                          placeholder="No limit"
                          value={formState.maxPaymentAmount}
                          onChange={(e) => updateField('maxPaymentAmount', e.target.value)}
                          className="pl-7"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Monthly Max</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">฿</span>
                        <Input
                          type="text"
                          inputMode="decimal"
                          placeholder="No limit"
                          value={formState.monthlyMaxAmount}
                          onChange={(e) => updateField('monthlyMaxAmount', e.target.value)}
                          className="pl-7"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Require Approval Above</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">฿</span>
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="No approval required"
                        value={formState.requireApprovalAbove}
                        onChange={(e) => updateField('requireApprovalAbove', e.target.value)}
                        className="pl-7"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Payments above this amount will require member confirmation
                    </p>
                  </div>

                  <label className="flex items-center gap-2 rounded-lg bg-stone-50 p-3">
                    <Checkbox
                      checked={formState.payDuesOnly}
                      onCheckedChange={(checked) => updateField('payDuesOnly', checked as boolean)}
                    />
                    <div>
                      <span className="text-sm font-medium">Pay dues only</span>
                      <p className="text-xs text-muted-foreground">Only auto-pay membership dues, not other charges</p>
                    </div>
                  </label>
                </div>

                {/* Notification Preferences */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-stone-500" />
                    Notifications
                  </Label>

                  <div className="space-y-2 rounded-lg border border-stone-200 p-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm">Notify before payment</span>
                      <Switch
                        checked={formState.notifyBeforePayment}
                        onCheckedChange={(checked) => updateField('notifyBeforePayment', checked)}
                      />
                    </label>

                    {formState.notifyBeforePayment && (
                      <div className="ml-0 flex items-center gap-2 pt-1">
                        <Input
                          type="number"
                          min={1}
                          max={14}
                          value={formState.notifyDaysBefore}
                          onChange={(e) => updateField('notifyDaysBefore', parseInt(e.target.value) || 3)}
                          className="w-16"
                        />
                        <span className="text-sm text-muted-foreground">days before payment</span>
                      </div>
                    )}

                    <div className="border-t border-stone-100 pt-2">
                      <label className="flex items-center justify-between">
                        <span className="text-sm">Notify on successful payment</span>
                        <Switch
                          checked={formState.notifyOnSuccess}
                          onCheckedChange={(checked) => updateField('notifyOnSuccess', checked)}
                        />
                      </label>
                    </div>

                    <label className="flex items-center justify-between">
                      <span className="text-sm">Notify on failed payment</span>
                      <Switch
                        checked={formState.notifyOnFailure}
                        onCheckedChange={(checked) => updateField('notifyOnFailure', checked)}
                      />
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter className="mt-4 flex-col gap-3 sm:flex-row sm:justify-between">
          {isEditing && existingSetting?.isEnabled && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleDisable}
              disabled={isSaving}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Disable Auto-Pay
            </Button>
          )}
          <div className="flex gap-2 sm:ml-auto">
            <Button variant="outline" onClick={handleClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges || activePaymentMethods.length === 0}
              className="bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : showSuccess ? (
                <Check className="mr-2 h-4 w-4" />
              ) : null}
              {showSuccess ? 'Saved!' : isEditing ? 'Save Changes' : 'Enable Auto-Pay'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
