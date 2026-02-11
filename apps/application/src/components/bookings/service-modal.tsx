'use client';

import { useState, useCallback, useEffect } from 'react';
import { cn, Button, Badge } from '@clubvantage/ui';
import { X, Loader2, Sparkles, Plus, ChevronDown, Edit2 } from 'lucide-react';
import { VariationsEditor, type ServiceVariation } from './variations-editor';

// Types
export interface TierDiscount {
  tierName: string;
  discountPercent: number;
}

export interface ServiceFormData {
  id?: string;
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  bufferMinutes: number;
  basePrice: number;
  tierDiscounts: TierDiscount[];
  requiredCapabilities: string[];
  enforceQualification: boolean;
  requiredFacilityFeatures: string[];
  variations: ServiceVariation[];
  maxParticipants?: number;
  revenueCenterId?: string;
  isActive: boolean;
}

export interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ServiceFormData) => Promise<void>;
  service?: ServiceFormData | null;
  availableCapabilities?: string[];
  availableFacilityFeatures?: string[];
  revenueCenters?: { id: string; name: string }[];
  currency?: string;
  className?: string;
}

const SERVICE_CATEGORIES = [
  { value: 'spa', label: 'Spa' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'sports', label: 'Sports' },
  { value: 'training', label: 'Training' },
  { value: 'wellness', label: 'Wellness' },
];

const DURATION_OPTIONS = [30, 45, 60, 75, 90, 120, 180];

const DEFAULT_CAPABILITIES = [
  'Thai Massage',
  'Swedish Massage',
  'Deep Tissue',
  'Aromatherapy',
  'Hot Stone',
  'Personal Training',
  'Group Fitness',
  'Yoga Instruction',
  'Pilates',
  'Tennis Coaching',
  'Golf Instruction',
  'Swimming Instruction',
];

const DEFAULT_FACILITY_FEATURES = [
  'Treatment Table',
  'Private Room',
  'Shower',
  'Air-conditioned',
  'Sound System',
  'Mirrors',
  'Equipment',
  'Mats',
  'Lighting',
];

const DEFAULT_TIERS = [
  { tierName: 'Gold', discountPercent: 5 },
  { tierName: 'Platinum', discountPercent: 10 },
];

function getInitialFormData(service?: ServiceFormData | null): ServiceFormData {
  return {
    id: service?.id,
    name: service?.name || '',
    description: service?.description || '',
    category: service?.category || '',
    durationMinutes: service?.durationMinutes || 60,
    bufferMinutes: service?.bufferMinutes || 0,
    basePrice: service?.basePrice || 0,
    tierDiscounts: service?.tierDiscounts || [],
    requiredCapabilities: service?.requiredCapabilities || [],
    enforceQualification: service?.enforceQualification ?? false,
    requiredFacilityFeatures: service?.requiredFacilityFeatures || [],
    variations: service?.variations || [],
    maxParticipants: service?.maxParticipants,
    revenueCenterId: service?.revenueCenterId,
    isActive: service?.isActive ?? true,
  };
}

/**
 * ServiceModal
 *
 * A modal for creating or editing a service with pricing, requirements, and variations.
 */
export function ServiceModal({
  isOpen,
  onClose,
  onSave,
  service,
  availableCapabilities = DEFAULT_CAPABILITIES,
  availableFacilityFeatures = DEFAULT_FACILITY_FEATURES,
  revenueCenters = [],
  currency = '฿',
  className,
}: ServiceModalProps) {
  const [formData, setFormData] = useState<ServiceFormData>(() => getInitialFormData(service));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showTierEditor, setShowTierEditor] = useState(false);
  const [showCapabilitiesDropdown, setShowCapabilitiesDropdown] = useState(false);
  const [showFeaturesDropdown, setShowFeaturesDropdown] = useState(false);

  const isEditMode = !!service?.id;

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData(service));
      setErrors({});
      setShowTierEditor(false);
    }
  }, [isOpen, service]);

  const updateField = useCallback(<K extends keyof ServiceFormData>(
    field: K,
    value: ServiceFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const addCapability = useCallback((capability: string) => {
    if (!formData.requiredCapabilities.includes(capability)) {
      updateField('requiredCapabilities', [...formData.requiredCapabilities, capability]);
    }
    setShowCapabilitiesDropdown(false);
  }, [formData.requiredCapabilities, updateField]);

  const removeCapability = useCallback((capability: string) => {
    updateField('requiredCapabilities', formData.requiredCapabilities.filter((c) => c !== capability));
  }, [formData.requiredCapabilities, updateField]);

  const addFacilityFeature = useCallback((feature: string) => {
    if (!formData.requiredFacilityFeatures.includes(feature)) {
      updateField('requiredFacilityFeatures', [...formData.requiredFacilityFeatures, feature]);
    }
    setShowFeaturesDropdown(false);
  }, [formData.requiredFacilityFeatures, updateField]);

  const removeFacilityFeature = useCallback((feature: string) => {
    updateField('requiredFacilityFeatures', formData.requiredFacilityFeatures.filter((f) => f !== feature));
  }, [formData.requiredFacilityFeatures, updateField]);

  const updateTierDiscount = useCallback((tierName: string, discountPercent: number) => {
    const existing = formData.tierDiscounts.find((t) => t.tierName === tierName);
    if (existing) {
      updateField('tierDiscounts', formData.tierDiscounts.map((t) =>
        t.tierName === tierName ? { ...t, discountPercent } : t
      ));
    } else {
      updateField('tierDiscounts', [...formData.tierDiscounts, { tierName, discountPercent }]);
    }
  }, [formData.tierDiscounts, updateField]);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.durationMinutes || formData.durationMinutes < 15) {
      newErrors.durationMinutes = 'Duration must be at least 15 minutes';
    }

    if (formData.basePrice < 0) {
      newErrors.basePrice = 'Price cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save service:', error);
    } finally {
      setIsSaving(false);
    }
  }, [formData, validate, onSave, onClose]);

  const handleClose = useCallback(() => {
    if (!isSaving) {
      onClose();
    }
  }, [isSaving, onClose]);

  const availableCapabilitiesToAdd = availableCapabilities.filter(
    (c) => !formData.requiredCapabilities.includes(c)
  );

  const availableFeaturesToAdd = availableFacilityFeatures.filter(
    (f) => !formData.requiredFacilityFeatures.includes(f)
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className={cn(
        'fixed inset-x-4 top-[5%] z-50 mx-auto max-h-[90vh] w-full max-w-[700px] overflow-hidden rounded-xl border border-border bg-card shadow-xl sm:inset-x-auto',
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-500/20">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              {isEditMode ? 'Edit Service' : 'Add Service'}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSaving}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Basic Information</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="e.g., Thai Massage"
                    className={cn(
                      'h-10 w-full rounded-lg border bg-background px-3 text-sm',
                      errors.name
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-border focus:border-amber-500 focus:ring-amber-500/20'
                    )}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className={cn(
                      'h-10 w-full rounded-lg border bg-background px-3 text-sm',
                      errors.category
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-border focus:border-amber-500 focus:ring-amber-500/20'
                    )}
                  >
                    <option value="">Select category...</option>
                    {SERVICE_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Service description..."
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Duration & Pricing */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Duration & Pricing</h3>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.durationMinutes}
                    onChange={(e) => updateField('durationMinutes', parseInt(e.target.value))}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-amber-500 focus:ring-amber-500/20"
                  >
                    {DURATION_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d} min
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Buffer Time
                  </label>
                  <input
                    type="number"
                    value={formData.bufferMinutes}
                    onChange={(e) => updateField('bufferMinutes', parseInt(e.target.value) || 0)}
                    min={0}
                    max={60}
                    placeholder="15"
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-amber-500 focus:ring-amber-500/20"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">Minutes between bookings</p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Base Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {currency}
                    </span>
                    <input
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) => updateField('basePrice', parseFloat(e.target.value) || 0)}
                      min={0}
                      step={0.01}
                      className="h-10 w-full rounded-lg border border-border bg-background pl-7 pr-3 text-sm focus:border-amber-500 focus:ring-amber-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Tier Discounts */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Tier Discounts</label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTierEditor(!showTierEditor)}
                  >
                    <Edit2 className="mr-1 h-3 w-3" />
                    {showTierEditor ? 'Done' : 'Edit Discounts'}
                  </Button>
                </div>

                {showTierEditor ? (
                  <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                    {DEFAULT_TIERS.map((tier) => {
                      const current = formData.tierDiscounts.find((t) => t.tierName === tier.tierName);
                      return (
                        <div key={tier.tierName} className="flex items-center gap-3">
                          <span className="w-24 text-sm text-foreground">{tier.tierName}:</span>
                          <input
                            type="number"
                            value={current?.discountPercent ?? tier.discountPercent}
                            onChange={(e) => updateTierDiscount(tier.tierName, parseFloat(e.target.value) || 0)}
                            min={0}
                            max={100}
                            className="h-8 w-20 rounded-md border border-border bg-background px-2 text-sm"
                          />
                          <span className="text-sm text-muted-foreground">% off</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {formData.tierDiscounts.length > 0
                      ? formData.tierDiscounts.map((t) => `${t.tierName}: ${t.discountPercent}% off`).join(', ')
                      : 'No tier discounts configured'}
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Requirements */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Requirements</h3>

              {/* Staff Capabilities */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Staff Capabilities Required
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.requiredCapabilities.map((cap) => (
                    <Badge key={cap} variant="outline" className="gap-1 pr-1">
                      {cap}
                      <button
                        type="button"
                        onClick={() => removeCapability(cap)}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {availableCapabilitiesToAdd.length > 0 && (
                    <div className="relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCapabilitiesDropdown(!showCapabilitiesDropdown)}
                        className="h-6 px-2 text-xs"
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Add
                      </Button>
                      {showCapabilitiesDropdown && (
                        <div className="absolute left-0 top-full z-10 mt-1 max-h-48 w-48 overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-lg">
                          {availableCapabilitiesToAdd.map((cap) => (
                            <button
                              key={cap}
                              type="button"
                              onClick={() => addCapability(cap)}
                              className="flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-muted"
                            >
                              {cap}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Enforce Qualification Toggle */}
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
                <div>
                  <label className="text-sm font-medium text-foreground">
                    Enforce staff qualification
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Only qualified staff can be booked for this service
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.enforceQualification}
                  onClick={() => updateField('enforceQualification', !formData.enforceQualification)}
                  className={cn(
                    'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                    formData.enforceQualification
                      ? 'bg-amber-500'
                      : 'bg-stone-200 dark:bg-stone-700'
                  )}
                >
                  <span
                    className={cn(
                      'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform',
                      formData.enforceQualification ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>

              {/* Facility Features */}
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Facility Features Required
                </label>
                <div className="flex flex-wrap gap-2">
                  {formData.requiredFacilityFeatures.map((feature) => (
                    <Badge key={feature} variant="outline" className="gap-1 pr-1">
                      {feature}
                      <button
                        type="button"
                        onClick={() => removeFacilityFeature(feature)}
                        className="ml-1 rounded-full p-0.5 hover:bg-muted"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {availableFeaturesToAdd.length > 0 && (
                    <div className="relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFeaturesDropdown(!showFeaturesDropdown)}
                        className="h-6 px-2 text-xs"
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Add
                      </Button>
                      {showFeaturesDropdown && (
                        <div className="absolute left-0 top-full z-10 mt-1 max-h-48 w-48 overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-lg">
                          {availableFeaturesToAdd.map((feature) => (
                            <button
                              key={feature}
                              type="button"
                              onClick={() => addFacilityFeature(feature)}
                              className="flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-muted"
                            >
                              {feature}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Variations */}
            <div>
              <label className="mb-3 block text-sm font-medium text-foreground">
                Variations & Add-ons
              </label>
              <VariationsEditor
                value={formData.variations}
                onChange={(variations) => updateField('variations', variations)}
                currency={currency}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Additional Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Additional Settings</h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    value={formData.maxParticipants || ''}
                    onChange={(e) => updateField('maxParticipants', parseInt(e.target.value) || undefined)}
                    min={1}
                    placeholder="Leave empty for 1"
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-amber-500 focus:ring-amber-500/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Status
                  </label>
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => updateField('isActive', e.target.value === 'active')}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-amber-500 focus:ring-amber-500/20"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {revenueCenters.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Revenue Center
                  </label>
                  <select
                    value={formData.revenueCenterId || ''}
                    onChange={(e) => updateField('revenueCenterId', e.target.value || undefined)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-amber-500 focus:ring-amber-500/20"
                  >
                    <option value="">Select...</option>
                    {revenueCenters.map((rc) => (
                      <option key={rc.id} value={rc.id}>
                        {rc.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="bg-amber-500 text-white hover:bg-amber-600"
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditMode ? 'Save Changes' : 'Save Service'}
          </Button>
        </div>
      </div>
    </>
  );
}
