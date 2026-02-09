'use client';

import { useState, useCallback, useMemo } from 'react';
import { X, Loader2, ChevronDown, Search, Check } from 'lucide-react';
import { cn } from '@clubvantage/ui';
import { Button } from '@clubvantage/ui';
import { Checkbox } from '@clubvantage/ui';
import { Input } from '@clubvantage/ui';
import { Label } from '@clubvantage/ui';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@clubvantage/ui';
import type { MemberStatus, MemberFilters, LookupItem } from './types';

interface AdvancedFiltersPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: MemberFilters;
  onApply: (filters: MemberFilters) => void;
  isApplying?: boolean;
  revenueCenters?: LookupItem[];
  outlets?: LookupItem[];
}

// Searchable Multi-Select Dropdown Component
interface SearchableMultiSelectProps {
  label: string;
  options: LookupItem[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

function SearchableMultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Search...',
}: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const query = searchQuery.toLowerCase();
    return options.filter(
      (opt) =>
        opt.name.toLowerCase().includes(query) ||
        opt.code?.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  const handleToggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const selectedCount = selected.length;

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-stone-700 dark:text-stone-300">{label}</Label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-sm transition-colors',
            'hover:border-stone-300 dark:hover:border-stone-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20',
            isOpen && 'border-amber-500 ring-2 ring-amber-500/20'
          )}
        >
          <span className={cn(selectedCount === 0 && 'text-stone-400 dark:text-stone-500')}>
            {selectedCount === 0
              ? `Select ${label.toLowerCase()}...`
              : `${selectedCount} selected`}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-stone-400 dark:text-stone-500 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 shadow-lg">
            {/* Search input */}
            <div className="border-b border-stone-100 dark:border-stone-700 p-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
                <input
                  type="text"
                  placeholder={placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 w-full rounded border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 pl-8 pr-3 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Options list */}
            <div className="max-h-48 overflow-y-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-stone-500 dark:text-stone-400">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = selected.includes(option.id);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleToggle(option.id)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm transition-colors',
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                          : 'hover:bg-stone-50 dark:hover:bg-stone-800'
                      )}
                    >
                      <div
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                          isSelected
                            ? 'border-amber-500 bg-amber-500 text-white'
                            : 'border-stone-300'
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      <span className="flex-1 truncate">{option.name}</span>
                      {option.code && (
                        <span className="text-xs text-stone-400 dark:text-stone-500">
                          {option.code}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Clear selection */}
            {selectedCount > 0 && (
              <div className="border-t border-stone-100 dark:border-stone-700 p-2">
                <button
                  type="button"
                  onClick={() => {
                    onChange([]);
                    setSearchQuery('');
                  }}
                  className="w-full rounded px-3 py-1.5 text-sm text-stone-500 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-300"
                >
                  Clear selection
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const statusOptions: { value: MemberStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PROSPECT', label: 'Prospect' },
  { value: 'APPLICANT', label: 'Applicant' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'LAPSED', label: 'Lapsed' },
  { value: 'RESIGNED', label: 'Resigned' },
  { value: 'TERMINATED', label: 'Terminated' },
];

const membershipTypeOptions = [
  { value: 'individual', label: 'Individual' },
  { value: 'family', label: 'Family' },
  { value: 'corporate', label: 'Corporate' },
];

const agingBucketOptions = [
  { value: 'CURRENT', label: 'Current' },
  { value: 'DAYS_30', label: '30 days' },
  { value: 'DAYS_60', label: '60 days' },
  { value: 'DAYS_90', label: '90 days' },
  { value: 'DAYS_91_PLUS', label: '91+ days' },
];

const datePresets = [
  { value: 'this-month', label: 'This month' },
  { value: 'last-30', label: 'Last 30 days' },
  { value: 'this-year', label: 'This year' },
  { value: 'custom', label: 'Custom' },
];

export function AdvancedFiltersPanel({
  open,
  onOpenChange,
  filters,
  onApply,
  isApplying = false,
  revenueCenters = [],
  outlets = [],
}: AdvancedFiltersPanelProps) {
  const [localFilters, setLocalFilters] = useState<MemberFilters>(filters);
  const [datePreset, setDatePreset] = useState<string>('custom');

  const handleRevenueCenterChange = useCallback((ids: string[]) => {
    setLocalFilters((prev) => ({
      ...prev,
      revenueCenterIds: ids.length > 0 ? ids : undefined,
    }));
  }, []);

  const handleOutletChange = useCallback((ids: string[]) => {
    setLocalFilters((prev) => ({
      ...prev,
      outletIds: ids.length > 0 ? ids : undefined,
    }));
  }, []);

  const handleStatusChange = useCallback(
    (status: MemberStatus, checked: boolean) => {
      setLocalFilters((prev) => ({
        ...prev,
        statuses: checked
          ? [...(prev.statuses || []), status]
          : (prev.statuses || []).filter((s) => s !== status),
      }));
    },
    []
  );

  const handleMembershipTypeChange = useCallback(
    (type: string, checked: boolean) => {
      setLocalFilters((prev) => ({
        ...prev,
        membershipTypes: checked
          ? [...(prev.membershipTypes || []), type]
          : (prev.membershipTypes || []).filter((t) => t !== type),
      }));
    },
    []
  );

  const handleAgingBucketChange = useCallback(
    (bucket: string, checked: boolean) => {
      setLocalFilters((prev) => ({
        ...prev,
        agingBuckets: checked
          ? [...(prev.agingBuckets || []), bucket]
          : (prev.agingBuckets || []).filter((b) => b !== bucket),
      }));
    },
    []
  );

  const handleClearAll = useCallback(() => {
    setLocalFilters({});
    setDatePreset('custom');
  }, []);

  const handleApply = useCallback(() => {
    onApply(localFilters);
    onOpenChange(false);
  }, [localFilters, onApply, onOpenChange]);

  const handleDatePresetChange = useCallback((preset: string) => {
    setDatePreset(preset);
    const now = new Date();
    let fromDate: string | undefined;
    let toDate: string | undefined;

    switch (preset) {
      case 'this-month':
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1)
          .toISOString()
          .split('T')[0];
        toDate = now.toISOString().split('T')[0];
        break;
      case 'last-30':
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];
        toDate = now.toISOString().split('T')[0];
        break;
      case 'this-year':
        fromDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        toDate = now.toISOString().split('T')[0];
        break;
      default:
        fromDate = undefined;
        toDate = undefined;
    }

    setLocalFilters((prev) => ({
      ...prev,
      joinDateFrom: fromDate,
      joinDateTo: toDate,
    }));
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] overflow-y-auto sm:max-w-[400px]">
        <SheetHeader className="mb-6">
          <SheetTitle>Advanced Filters</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-stone-700 dark:text-stone-300">Status</Label>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${option.value}`}
                    checked={(localFilters.statuses || []).includes(option.value)}
                    onCheckedChange={(checked) =>
                      handleStatusChange(option.value, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`status-${option.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Membership Type */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-stone-700 dark:text-stone-300">
              Membership Type
            </Label>
            <div className="space-y-2">
              {membershipTypeOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`type-${option.value}`}
                    checked={(localFilters.membershipTypes || []).includes(
                      option.value
                    )}
                    onCheckedChange={(checked) =>
                      handleMembershipTypeChange(option.value, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`type-${option.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Center */}
          {revenueCenters.length > 0 && (
            <SearchableMultiSelect
              label="Revenue Center"
              options={revenueCenters}
              selected={localFilters.revenueCenterIds || []}
              onChange={handleRevenueCenterChange}
              placeholder="Search revenue centers..."
            />
          )}

          {/* Outlet */}
          {outlets.length > 0 && (
            <SearchableMultiSelect
              label="Outlet"
              options={outlets}
              selected={localFilters.outletIds || []}
              onChange={handleOutletChange}
              placeholder="Search outlets..."
            />
          )}

          {/* Join Date Range */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-stone-700 dark:text-stone-300">
              Join Date Range
            </Label>
            <div className="flex flex-wrap gap-2">
              {datePresets.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => handleDatePresetChange(preset.value)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                    datePreset === preset.value
                      ? 'bg-amber-500 text-white'
                      : 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-stone-500 dark:text-stone-400">From</Label>
                <Input
                  type="date"
                  value={localFilters.joinDateFrom || ''}
                  onChange={(e) => {
                    setDatePreset('custom');
                    setLocalFilters((prev) => ({
                      ...prev,
                      joinDateFrom: e.target.value || undefined,
                    }));
                  }}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-stone-500 dark:text-stone-400">To</Label>
                <Input
                  type="date"
                  value={localFilters.joinDateTo || ''}
                  onChange={(e) => {
                    setDatePreset('custom');
                    setLocalFilters((prev) => ({
                      ...prev,
                      joinDateTo: e.target.value || undefined,
                    }));
                  }}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Balance Range */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-stone-700 dark:text-stone-300">
              Balance Range
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-stone-500 dark:text-stone-400">Min Balance</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={localFilters.balanceMin ?? ''}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      balanceMin: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-stone-500 dark:text-stone-400">Max Balance</Label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={localFilters.balanceMax ?? ''}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      balanceMax: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Aging Bucket */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-stone-700 dark:text-stone-300">
              Aging Bucket
            </Label>
            <div className="space-y-2">
              {agingBucketOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`aging-${option.value}`}
                    checked={(localFilters.agingBuckets || []).includes(
                      option.value
                    )}
                    onCheckedChange={(checked) =>
                      handleAgingBucketChange(option.value, checked as boolean)
                    }
                  />
                  <label
                    htmlFor={`aging-${option.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-stone-700 dark:text-stone-300">
              Phone Number
            </Label>
            <Input
              type="tel"
              placeholder="Search by phone number"
              value={localFilters.phone || ''}
              onChange={(e) =>
                setLocalFilters((prev) => ({
                  ...prev,
                  phone: e.target.value || undefined,
                }))
              }
            />
          </div>
        </div>

        <SheetFooter className="mt-8 flex items-center justify-between border-t pt-4">
          <Button
            variant="ghost"
            onClick={handleClearAll}
            className="text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
          >
            Clear All
          </Button>
          <Button onClick={handleApply} disabled={isApplying}>
            {isApplying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
