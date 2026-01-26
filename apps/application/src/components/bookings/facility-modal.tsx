'use client';

import { useState, useCallback, useEffect } from 'react';
import { cn, Button } from '@clubvantage/ui';
import { X, Loader2, Building2 } from 'lucide-react';
import { OperatingHoursEditor, type DayHours, getDefaultHours } from './operating-hours-editor';

// Types
export interface FacilityFormData {
  id?: string;
  name: string;
  description: string;
  type: 'court' | 'spa' | 'studio' | 'pool' | 'room' | '';
  location: string;
  capacity: number;
  features: string[];
  operatingHours: DayHours[];
  revenueCenterId?: string;
  outletId?: string;
  isActive: boolean;
}

export interface FacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FacilityFormData) => Promise<void>;
  facility?: FacilityFormData | null;
  locations?: string[];
  revenueCenters?: { id: string; name: string }[];
  outlets?: { id: string; name: string }[];
  className?: string;
}

const FACILITY_TYPES = [
  { value: 'court', label: 'Court' },
  { value: 'spa', label: 'Spa Room' },
  { value: 'studio', label: 'Studio' },
  { value: 'pool', label: 'Pool' },
  { value: 'room', label: 'Room' },
];

const FACILITY_FEATURES = [
  'Lighting',
  'Covered',
  'Air-conditioned',
  'Equipment included',
  'Sound system',
  'Mirrors',
  'Showers',
  'Lockers',
  'Heated',
  'Indoor',
  'Outdoor',
];

const DEFAULT_LOCATIONS = [
  'Main Building - Level 1',
  'Main Building - Level 2',
  'Outdoor - Level G',
  'Fitness Center - Level 3',
  'Wellness Center - Level 2',
  'Clubhouse - Level 1',
  'Pool Area',
];

function getInitialFormData(facility?: FacilityFormData | null): FacilityFormData {
  return {
    id: facility?.id,
    name: facility?.name || '',
    description: facility?.description || '',
    type: facility?.type || '',
    location: facility?.location || '',
    capacity: facility?.capacity || 1,
    features: facility?.features || [],
    operatingHours: facility?.operatingHours || getDefaultHours(),
    revenueCenterId: facility?.revenueCenterId,
    outletId: facility?.outletId,
    isActive: facility?.isActive ?? true,
  };
}

/**
 * FacilityModal
 *
 * A modal dialog for creating or editing a facility.
 */
export function FacilityModal({
  isOpen,
  onClose,
  onSave,
  facility,
  locations = DEFAULT_LOCATIONS,
  revenueCenters = [],
  outlets = [],
  className,
}: FacilityModalProps) {
  const [formData, setFormData] = useState<FacilityFormData>(() => getInitialFormData(facility));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = !!facility?.id;

  // Reset form when facility changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData(facility));
      setErrors({});
    }
  }, [isOpen, facility]);

  const updateField = useCallback(<K extends keyof FacilityFormData>(
    field: K,
    value: FacilityFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const toggleFeature = useCallback((feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  }, []);

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be 100 characters or less';
    }

    if (!formData.type) {
      newErrors.type = 'Type is required';
    }

    if (!formData.location) {
      newErrors.location = 'Location is required';
    }

    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1';
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
      console.error('Failed to save facility:', error);
    } finally {
      setIsSaving(false);
    }
  }, [formData, validate, onSave, onClose]);

  const handleClose = useCallback(() => {
    if (!isSaving) {
      onClose();
    }
  }, [isSaving, onClose]);

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
        'fixed inset-x-4 top-[5%] z-50 mx-auto max-h-[90vh] w-full max-w-[600px] overflow-hidden rounded-xl border border-border bg-card shadow-xl sm:inset-x-auto',
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-500/20">
              <Building2 className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              {isEditMode ? 'Edit Facility' : 'Add Facility'}
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
            {/* Basic Info */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g., Tennis Court 1"
                  maxLength={100}
                  className={cn(
                    'h-10 w-full rounded-lg border bg-background px-3 text-sm',
                    errors.name
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-border focus:border-amber-500 focus:ring-amber-500/20'
                  )}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Optional description..."
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500/20"
                />
              </div>

              {/* Type & Location */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => updateField('type', e.target.value as FacilityFormData['type'])}
                    className={cn(
                      'h-10 w-full rounded-lg border bg-background px-3 text-sm',
                      errors.type
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-border focus:border-amber-500 focus:ring-amber-500/20'
                    )}
                  >
                    <option value="">Select type...</option>
                    {FACILITY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-xs text-red-500">{errors.type}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    className={cn(
                      'h-10 w-full rounded-lg border bg-background px-3 text-sm',
                      errors.location
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-border focus:border-amber-500 focus:ring-amber-500/20'
                    )}
                  >
                    <option value="">Select location...</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  {errors.location && (
                    <p className="mt-1 text-xs text-red-500">{errors.location}</p>
                  )}
                </div>
              </div>

              {/* Capacity & Status */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => updateField('capacity', parseInt(e.target.value) || 1)}
                    min={1}
                    className={cn(
                      'h-10 w-full rounded-lg border bg-background px-3 text-sm',
                      errors.capacity
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-border focus:border-amber-500 focus:ring-amber-500/20'
                    )}
                  />
                  {errors.capacity && (
                    <p className="mt-1 text-xs text-red-500">{errors.capacity}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Status <span className="text-red-500">*</span>
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
            </div>

            {/* Features */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Features
              </label>
              <div className="flex flex-wrap gap-2">
                {FACILITY_FEATURES.map((feature) => (
                  <label
                    key={feature}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
                      formData.features.includes(feature)
                        ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                        : 'border-border bg-background text-muted-foreground hover:border-stone-300'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={() => toggleFeature(feature)}
                      className="sr-only"
                    />
                    {feature}
                  </label>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Operating Hours */}
            <div>
              <label className="mb-3 block text-sm font-medium text-foreground">
                Operating Hours
              </label>
              <OperatingHoursEditor
                value={formData.operatingHours}
                onChange={(hours) => updateField('operatingHours', hours)}
              />
            </div>

            {/* Financial Section */}
            {(revenueCenters.length > 0 || outlets.length > 0) && (
              <>
                <div className="border-t border-border" />

                <div>
                  <label className="mb-3 block text-sm font-medium text-foreground">
                    Financial
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {revenueCenters.length > 0 && (
                      <div>
                        <label className="mb-1.5 block text-xs text-muted-foreground">
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

                    {outlets.length > 0 && (
                      <div>
                        <label className="mb-1.5 block text-xs text-muted-foreground">
                          Outlet
                        </label>
                        <select
                          value={formData.outletId || ''}
                          onChange={(e) => updateField('outletId', e.target.value || undefined)}
                          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-amber-500 focus:ring-amber-500/20"
                        >
                          <option value="">Select...</option>
                          {outlets.map((outlet) => (
                            <option key={outlet.id} value={outlet.id}>
                              {outlet.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
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
            {isEditMode ? 'Save Changes' : 'Save Facility'}
          </Button>
        </div>
      </div>
    </>
  );
}
