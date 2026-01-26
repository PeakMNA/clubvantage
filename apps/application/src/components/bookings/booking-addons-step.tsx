'use client';

import { useState, useMemo } from 'react';
import { cn, Button, Badge } from '@clubvantage/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@clubvantage/ui';
import { ArrowLeft, Check, Sparkles, Clock, Plus, Minus } from 'lucide-react';
import { StepIndicator } from './create-booking-wizard';

// Types
interface StaffMember {
  id: string;
  name: string;
  photoUrl?: string;
  available: boolean;
  specialties?: string[];
}

interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
}

interface PackageVariation {
  id: string;
  name: string;
  duration: number;
  price: number;
  isDefault?: boolean;
}

export interface BookingAddonsStepProps {
  serviceName: string;
  basePrice: number;
  staffMembers?: StaffMember[];
  addOns?: AddOn[];
  variations?: PackageVariation[];
  showStaffSelection?: boolean;
  selectedStaffId: string | null;
  onStaffSelect: (id: string | null) => void;
  selectedAddOnIds: string[];
  onAddOnToggle: (id: string) => void;
  selectedVariationId: string | null;
  onVariationSelect: (id: string) => void;
  onBack: () => void;
  onSkip: () => void;
  onNext: () => void;
  className?: string;
}

// Mock data
const mockStaffMembers: StaffMember[] = [
  { id: 'staff-1', name: 'Nattaya W.', available: true, specialties: ['Swedish', 'Thai'] },
  { id: 'staff-2', name: 'Somchai P.', available: true, specialties: ['Deep Tissue', 'Sports'] },
  { id: 'staff-3', name: 'Apinya S.', available: false, specialties: ['Aromatherapy'] },
  { id: 'staff-4', name: 'Wichai K.', available: true, specialties: ['Thai', 'Hot Stone'] },
];

const mockAddOns: AddOn[] = [
  { id: 'addon-1', name: 'Aromatherapy', description: 'Essential oils for relaxation', price: 300 },
  { id: 'addon-2', name: 'Hot Stone', description: 'Heated basalt stones for deep relaxation', price: 500 },
  { id: 'addon-3', name: 'Scalp Massage', description: '15 min head & scalp treatment', price: 200 },
  { id: 'addon-4', name: 'Foot Scrub', description: 'Exfoliating foot treatment', price: 250 },
];

const mockVariations: PackageVariation[] = [
  { id: 'var-1', name: 'Standard', duration: 60, price: 2000, isDefault: true },
  { id: 'var-2', name: 'Extended', duration: 90, price: 2800 },
  { id: 'var-3', name: 'Premium', duration: 120, price: 3500 },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount);
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * BookingAddonsStep
 *
 * Step 4 of the booking wizard - customize with add-ons and variations.
 */
export function BookingAddonsStep({
  serviceName,
  basePrice,
  staffMembers = mockStaffMembers,
  addOns = mockAddOns,
  variations = mockVariations,
  showStaffSelection = true,
  selectedStaffId,
  onStaffSelect,
  selectedAddOnIds,
  onAddOnToggle,
  selectedVariationId,
  onVariationSelect,
  onBack,
  onSkip,
  onNext,
  className,
}: BookingAddonsStepProps) {
  const [staffPreference, setStaffPreference] = useState<'any' | 'choose'>(
    selectedStaffId ? 'choose' : 'any'
  );

  // Calculate totals
  const totals = useMemo(() => {
    // Get variation price or base price
    const selectedVariation = variations.find((v) => v.id === selectedVariationId);
    const variationPrice = selectedVariation?.price ?? basePrice;

    // Sum add-ons
    const addOnsTotal = selectedAddOnIds.reduce((sum, id) => {
      const addon = addOns.find((a) => a.id === id);
      return sum + (addon?.price ?? 0);
    }, 0);

    return {
      base: variationPrice,
      addOns: addOnsTotal,
      total: variationPrice + addOnsTotal,
    };
  }, [variations, selectedVariationId, basePrice, selectedAddOnIds, addOns]);

  const handleStaffPreferenceChange = (pref: 'any' | 'choose') => {
    setStaffPreference(pref);
    if (pref === 'any') {
      onStaffSelect(null);
    }
  };

  const availableStaff = staffMembers.filter((s) => s.available);

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header */}
      <div className="shrink-0 border-b border-border p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              Customize your booking
            </h2>
            <p className="text-sm text-muted-foreground">
              Optional add-ons for {serviceName}
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep="options" className="mb-0" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-4 sm:p-6">
          {/* Staff Preference Section */}
          {showStaffSelection && availableStaff.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Therapist Preference
              </h3>

              <div className="space-y-3">
                {/* Any available option */}
                <label className="flex cursor-pointer items-center gap-3">
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                      staffPreference === 'any'
                        ? 'border-amber-500 bg-amber-500'
                        : 'border-border'
                    )}
                  >
                    {staffPreference === 'any' && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className="text-sm text-foreground">Any available</span>
                </label>

                {/* Choose therapist option */}
                <label className="flex cursor-pointer items-center gap-3">
                  <div
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                      staffPreference === 'choose'
                        ? 'border-amber-500 bg-amber-500'
                        : 'border-border'
                    )}
                    onClick={() => handleStaffPreferenceChange('choose')}
                  >
                    {staffPreference === 'choose' && (
                      <div className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span
                    className="text-sm text-foreground"
                    onClick={() => handleStaffPreferenceChange('choose')}
                  >
                    Choose therapist
                  </span>
                </label>

                {/* Staff list (shown when "Choose" selected) */}
                {staffPreference === 'choose' && (
                  <div className="mt-3 space-y-2 pl-8">
                    {availableStaff.map((staff) => (
                      <button
                        key={staff.id}
                        type="button"
                        onClick={() => onStaffSelect(staff.id)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all',
                          selectedStaffId === staff.id
                            ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500 dark:bg-amber-500/10'
                            : 'border-border hover:bg-muted/50'
                        )}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={staff.photoUrl} alt={staff.name} />
                          <AvatarFallback className="bg-muted text-muted-foreground text-sm">
                            {getInitials(staff.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {staff.name}
                          </p>
                          {staff.specialties && (
                            <p className="text-xs text-muted-foreground truncate">
                              {staff.specialties.join(', ')}
                            </p>
                          )}
                        </div>
                        <Badge className="shrink-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px]">
                          Available
                        </Badge>
                        {selectedStaffId === staff.id && (
                          <Check className="h-4 w-4 shrink-0 text-amber-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Package Variations Section */}
          {variations.length > 1 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Package Options
              </h3>

              <div className="space-y-2">
                {variations.map((variation) => (
                  <label
                    key={variation.id}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all',
                      selectedVariationId === variation.id
                        ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500 dark:bg-amber-500/10'
                        : 'border-border hover:bg-muted/50'
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                        selectedVariationId === variation.id
                          ? 'border-amber-500 bg-amber-500'
                          : 'border-border'
                      )}
                    >
                      {selectedVariationId === variation.id && (
                        <div className="h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                    <input
                      type="radio"
                      name="variation"
                      value={variation.id}
                      checked={selectedVariationId === variation.id}
                      onChange={() => onVariationSelect(variation.id)}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {variation.name}
                        </span>
                        {variation.isDefault && (
                          <Badge variant="secondary" className="text-[10px]">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{variation.duration} min</span>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(variation.price)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons Section */}
          {addOns.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Add-ons
              </h3>

              <div className="space-y-2">
                {addOns.map((addon) => {
                  const isSelected = selectedAddOnIds.includes(addon.id);

                  return (
                    <label
                      key={addon.id}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all',
                        isSelected
                          ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500 dark:bg-amber-500/10'
                          : 'border-border hover:bg-muted/50'
                      )}
                    >
                      <div
                        className={cn(
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors',
                          isSelected
                            ? 'border-amber-500 bg-amber-500'
                            : 'border-border'
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onAddOnToggle(addon.id)}
                        className="sr-only"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {addon.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {addon.description}
                        </p>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 text-sm font-medium',
                          isSelected
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-muted-foreground'
                        )}
                      >
                        +{formatCurrency(addon.price)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Running Total Footer */}
      <div className="shrink-0 border-t border-border bg-card">
        {/* Price breakdown */}
        <div className="border-b border-border px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
              <span>Base: {formatCurrency(totals.base)}</span>
              {totals.addOns > 0 && (
                <>
                  <Plus className="h-3 w-3" />
                  <span>Add-ons: {formatCurrency(totals.addOns)}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">=</span>
              <span className="text-lg font-semibold text-foreground">
                {formatCurrency(totals.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between p-4 sm:p-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onBack}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onSkip}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Skip
            </button>
          </div>
          <Button onClick={onNext}>Next</Button>
        </div>
      </div>
    </div>
  );
}
