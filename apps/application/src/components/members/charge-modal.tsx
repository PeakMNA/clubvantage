'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@clubvantage/ui';
import { Button } from '@clubvantage/ui';
import { Input } from '@clubvantage/ui';
import { Label } from '@clubvantage/ui';
import { Separator } from '@clubvantage/ui';
import { cn } from '@clubvantage/ui';
import {
  Charge,
  ChargeType,
  RecurringFrequency,
  UsageType,
  TaxMethod,
  LookupItem,
} from './types';

// Template charge for quick-add
export interface ChargeTemplate {
  id: string;
  name: string;
  description: string;
  chargeType: ChargeType;
  frequency?: RecurringFrequency;
  usageType?: UsageType;
  amount: number;
  taxMethod: TaxMethod;
  taxRate: number;
}

export interface ChargeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  charge?: Charge; // If provided, we're editing
  templateCharges?: ChargeTemplate[];
  revenueCenters?: LookupItem[];
  outlets?: LookupItem[];
  defaultRevenueCenterId?: string;
  defaultOutletId?: string;
  onSubmit: (data: ChargeFormData) => void;
  onRemove?: (chargeId: string) => void;
  isLoading?: boolean;
  // Credit limit checking
  currentBalance?: number;
  creditLimit?: number | null;
  autoSuspendOnCreditExceeded?: boolean;
  allowManagerOverride?: boolean;
}

export interface ChargeFormData {
  name: string;
  description: string;
  chargeType: ChargeType;
  frequency?: RecurringFrequency;
  usageType?: UsageType;
  amount: number;
  taxMethod: TaxMethod;
  taxRate: number;
  startDate: string;
  endDate?: string;
  revenueCenterId?: string;
  outletId?: string;
  // Suspend fields (edit mode only)
  isSuspended?: boolean;
  suspendReason?: string;
}

const getDefaultStartDate = (): string => {
  const date = new Date().toISOString().split('T')[0];
  return date ?? new Date().toLocaleDateString('en-CA'); // fallback to YYYY-MM-DD format
};

const initialFormData: ChargeFormData = {
  name: '',
  description: '',
  chargeType: 'RECURRING',
  frequency: 'MONTHLY',
  usageType: undefined,
  amount: 0,
  taxMethod: 'ADD_ON',
  taxRate: 7,
  startDate: getDefaultStartDate(),
  endDate: '',
  revenueCenterId: '',
  outletId: '',
  isSuspended: false,
  suspendReason: '',
};

const frequencyOptions: { value: RecurringFrequency; label: string }[] = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'SEMI_ANNUAL', label: 'Semi-Annual' },
  { value: 'ANNUAL', label: 'Annual' },
];

const usageTypeOptions: { value: UsageType; label: string }[] = [
  { value: 'PER_VISIT', label: 'Per Visit' },
  { value: 'PER_BOOKING', label: 'Per Booking' },
  { value: 'PER_HOUR', label: 'Per Hour' },
  { value: 'PER_SESSION', label: 'Per Session' },
];

const taxMethodOptions: { value: TaxMethod; label: string }[] = [
  { value: 'ADD_ON', label: 'Add-on (amount + tax)' },
  { value: 'INCLUDED', label: 'Included (amount includes tax)' },
  { value: 'EXEMPT', label: 'Exempt (no tax)' },
];

export function ChargeModal({
  open,
  onOpenChange,
  charge,
  templateCharges = [],
  revenueCenters = [],
  outlets = [],
  defaultRevenueCenterId,
  defaultOutletId,
  onSubmit,
  onRemove,
  isLoading = false,
  currentBalance = 0,
  creditLimit,
  autoSuspendOnCreditExceeded = false,
  allowManagerOverride = false,
}: ChargeModalProps) {
  const [formData, setFormData] = useState<ChargeFormData>(initialFormData);
  const [templatesExpanded, setTemplatesExpanded] = useState(false);
  const [useDefaultAttribution, setUseDefaultAttribution] = useState(true);
  const [managerOverrideApproved, setManagerOverrideApproved] = useState(false);

  const isEditing = !!charge;

  // Credit limit warning computation
  const creditWarning = useMemo(() => {
    if (creditLimit == null || creditLimit <= 0) return null;
    const newBalance = currentBalance + formData.amount;
    const utilization = (newBalance / creditLimit) * 100;
    if (utilization >= 100) {
      return {
        level: 'exceeded' as const,
        message: `This charge will exceed the credit limit (${Math.round(utilization)}% of ฿${creditLimit.toLocaleString()})`,
        blocked: autoSuspendOnCreditExceeded && !managerOverrideApproved,
      };
    }
    if (utilization >= 80) {
      return {
        level: 'warning' as const,
        message: `Balance will reach ${Math.round(utilization)}% of credit limit (฿${creditLimit.toLocaleString()})`,
        blocked: false,
      };
    }
    return null;
  }, [currentBalance, formData.amount, creditLimit, autoSuspendOnCreditExceeded, managerOverrideApproved]);
  const hasDefaults = !!(defaultRevenueCenterId || defaultOutletId);

  useEffect(() => {
    if (charge) {
      setFormData({
        name: charge.name,
        description: charge.description,
        chargeType: charge.chargeType,
        frequency: charge.frequency,
        usageType: charge.usageType,
        amount: charge.amount,
        taxMethod: charge.taxMethod,
        taxRate: charge.taxRate,
        startDate: charge.startDate,
        endDate: charge.endDate || '',
        revenueCenterId: charge.revenueCenterId || '',
        outletId: charge.outletId || '',
        isSuspended: charge.status === 'SUSPENDED',
        suspendReason: charge.suspendedReason || '',
      });
      setUseDefaultAttribution(false);
    } else {
      // Apply defaults from membership type when creating new charge
      setFormData({
        ...initialFormData,
        revenueCenterId: defaultRevenueCenterId || '',
        outletId: defaultOutletId || '',
      });
      setUseDefaultAttribution(true);
    }
  }, [charge, open, defaultRevenueCenterId, defaultOutletId]);

  const handleApplyTemplate = (template: ChargeTemplate) => {
    setFormData((prev) => ({
      ...prev,
      name: template.name,
      description: template.description,
      chargeType: template.chargeType,
      frequency: template.frequency,
      usageType: template.usageType,
      amount: template.amount,
      taxMethod: template.taxMethod,
      taxRate: template.taxRate,
    }));
    setTemplatesExpanded(false);
  };

  const getDefaultAttributionText = () => {
    const parts: string[] = [];
    const revenueCenter = revenueCenters.find((rc) => rc.id === defaultRevenueCenterId);
    const outlet = outlets.find((o) => o.id === defaultOutletId);
    if (revenueCenter) parts.push(revenueCenter.name);
    if (outlet) parts.push(outlet.name);
    return parts.length > 0 ? parts.join(' / ') : 'None configured';
  };

  const handleInputChange = (field: keyof ChargeFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChargeTypeChange = (type: ChargeType) => {
    setFormData((prev) => ({
      ...prev,
      chargeType: type,
      frequency: type === 'RECURRING' ? 'MONTHLY' : undefined,
      usageType: type === 'USAGE_BASED' ? 'PER_VISIT' : undefined,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClose = () => {
    setFormData(initialFormData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] w-[560px] max-w-[90vw] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Charge' : 'Add Charge'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Suggestions - Only show when creating and templates available */}
          {!isEditing && templateCharges.length > 0 && (
            <div className="rounded-lg border border-border bg-muted/50">
              <button
                type="button"
                onClick={() => setTemplatesExpanded(!templatesExpanded)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Add from template
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {templateCharges.length}
                  </span>
                </div>
                {templatesExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {templatesExpanded && (
                <div className="border-t border-border px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {templateCharges.map((template) => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => handleApplyTemplate(template)}
                        className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/20"
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Charge Type Toggle / Indicator */}
          <div className="space-y-2">
            <Label>Charge Type</Label>
            {isEditing ? (
              // Read-only indicator when editing
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium',
                    formData.chargeType === 'RECURRING'
                      ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                      : 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400'
                  )}
                >
                  {formData.chargeType === 'RECURRING' ? 'Recurring' : 'Usage-Based'}
                </span>
                <span className="text-xs text-muted-foreground">Cannot be changed</span>
              </div>
            ) : (
              // Interactive toggle when creating
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleChargeTypeChange('RECURRING')}
                  className={cn(
                    'flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors',
                    formData.chargeType === 'RECURRING'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                      : 'border-border text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  Recurring
                </button>
                <button
                  type="button"
                  onClick={() => handleChargeTypeChange('USAGE_BASED')}
                  className={cn(
                    'flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors',
                    formData.chargeType === 'USAGE_BASED'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400'
                      : 'border-border text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  Usage-Based
                </button>
              </div>
            )}
          </div>

          <Separator />

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Charge Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Monthly Membership Fee"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleInputChange('description', e.target.value)
                }
                placeholder="Describe this charge"
                rows={2}
                className="flex w-full resize-none rounded-md border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <Separator />

          {/* Pricing */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>

              {/* Credit Limit Warning */}
              {creditWarning && (
                <div className={cn(
                  'col-span-2 flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm',
                  creditWarning.level === 'exceeded'
                    ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
                    : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400'
                )}>
                  {creditWarning.level === 'exceeded' ? (
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  )}
                  <div>
                    <p className="text-xs font-medium">{creditWarning.message}</p>
                    {creditWarning.blocked && (
                      <p className="mt-1 text-xs">
                        Auto-suspend is enabled. {allowManagerOverride ? 'Manager override available below.' : 'This charge cannot be submitted.'}
                      </p>
                    )}
                    {creditWarning.blocked && allowManagerOverride && (
                      <label className="mt-2 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={managerOverrideApproved}
                          onChange={(e) => setManagerOverrideApproved(e.target.checked)}
                          className="rounded border-red-300"
                        />
                        <span className="text-xs font-medium">Manager override: approve this charge</span>
                      </label>
                    )}
                  </div>
                </div>
              )}

              {formData.chargeType === 'RECURRING' ? (
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <select
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) =>
                      handleInputChange('frequency', e.target.value as RecurringFrequency)
                    }
                    className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                  >
                    {frequencyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="usageType">Usage Type *</Label>
                  <select
                    id="usageType"
                    value={formData.usageType}
                    onChange={(e) =>
                      handleInputChange('usageType', e.target.value as UsageType)
                    }
                    className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                  >
                    {usageTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxMethod">Tax Method</Label>
                <select
                  id="taxMethod"
                  value={formData.taxMethod}
                  onChange={(e) =>
                    handleInputChange('taxMethod', e.target.value as TaxMethod)
                  }
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                >
                  {taxMethodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.taxRate}
                  onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)}
                  disabled={formData.taxMethod === 'EXEMPT'}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <div className="relative">
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  className={cn(!formData.endDate && 'text-muted-foreground')}
                />
                {!formData.endDate && (
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    Ongoing
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Revenue Center & Outlet - Attribution Section */}
          {(revenueCenters.length > 0 || outlets.length > 0) && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Attribution</Label>
                  {hasDefaults && useDefaultAttribution && (
                    <button
                      type="button"
                      onClick={() => setUseDefaultAttribution(false)}
                      className="text-sm text-amber-600 hover:text-amber-700 hover:underline"
                    >
                      Change
                    </button>
                  )}
                </div>

                {hasDefaults && useDefaultAttribution ? (
                  <p className="text-sm text-muted-foreground">
                    Using defaults from membership type
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {revenueCenters.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="revenueCenterId" className="text-xs text-muted-foreground">
                          Revenue Center
                        </Label>
                        <select
                          id="revenueCenterId"
                          value={formData.revenueCenterId}
                          onChange={(e) => handleInputChange('revenueCenterId', e.target.value)}
                          className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                        >
                          <option value="">Select revenue center</option>
                          {revenueCenters.map((rc) => (
                            <option key={rc.id} value={rc.id}>
                              {rc.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {outlets.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="outletId" className="text-xs text-muted-foreground">
                          Outlet
                        </Label>
                        <select
                          id="outletId"
                          value={formData.outletId}
                          onChange={(e) => handleInputChange('outletId', e.target.value)}
                          className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
                        >
                          <option value="">Select outlet</option>
                          {outlets.map((outlet) => (
                            <option key={outlet.id} value={outlet.id}>
                              {outlet.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Suspend Section - Only show when editing */}
          {isEditing && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Suspend this charge</Label>
                    <p className="text-sm text-muted-foreground">
                      Temporarily stop billing for this charge
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.isSuspended}
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        isSuspended: !prev.isSuspended,
                        suspendReason: !prev.isSuspended ? prev.suspendReason : '',
                      }))
                    }
                    className={cn(
                      'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2',
                      formData.isSuspended ? 'bg-amber-500' : 'bg-muted'
                    )}
                  >
                    <span
                      className={cn(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-card shadow ring-0 transition duration-200 ease-in-out',
                        formData.isSuspended ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </button>
                </div>

                {formData.isSuspended && (
                  <div className="space-y-2">
                    <Label htmlFor="suspendReason">
                      Reason for suspension {!charge?.suspendedReason && '*'}
                    </Label>
                    <textarea
                      id="suspendReason"
                      value={formData.suspendReason}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        handleInputChange('suspendReason', e.target.value)
                      }
                      placeholder="Enter reason for suspending this charge"
                      rows={2}
                      required={formData.isSuspended && !charge?.suspendedReason}
                      className="flex w-full resize-none rounded-md border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                    {charge?.suspendedAt && (
                      <p className="text-xs text-muted-foreground">
                        Originally suspended on{' '}
                        {new Date(charge.suspendedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          <DialogFooter className="flex-col gap-3 sm:flex-row sm:justify-between">
            {/* Remove Charge link - only when editing */}
            {isEditing && onRemove && charge && (
              <button
                type="button"
                onClick={() => onRemove(charge.id)}
                className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 hover:underline"
                disabled={isLoading}
              >
                Remove Charge
              </button>
            )}
            <div className="flex gap-2 sm:ml-auto">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || (formData.isSuspended && !formData.suspendReason) || (creditWarning?.blocked ?? false)}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Save Changes' : 'Add Charge'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
