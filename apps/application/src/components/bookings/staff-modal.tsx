'use client';

import { useState, useCallback, useEffect } from 'react';
import { cn, Button } from '@clubvantage/ui';
import { X, Loader2, User, Upload, Search } from 'lucide-react';
import { OperatingHoursEditor, type DayHours, getDefaultHours } from './operating-hours-editor';
import { CapabilitiesEditor, type StaffCapability } from './capabilities-editor';
import { CertificationsEditor, type StaffCertification } from './certifications-editor';

// Types
export interface StaffFormData {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  userId?: string;
  capabilities: StaffCapability[];
  certifications: StaffCertification[];
  workingHours: DayHours[];
  defaultFacilityId?: string;
  isActive: boolean;
}

export interface UserOption {
  id: string;
  name: string;
  email: string;
}

export interface FacilityOption {
  id: string;
  name: string;
}

export interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: StaffFormData) => Promise<void>;
  staff?: StaffFormData | null;
  facilities?: FacilityOption[];
  users?: UserOption[];
  availableCapabilities?: string[];
  className?: string;
}

function getInitialFormData(staff?: StaffFormData | null): StaffFormData {
  return {
    id: staff?.id,
    firstName: staff?.firstName || '',
    lastName: staff?.lastName || '',
    email: staff?.email || '',
    phone: staff?.phone || '',
    avatarUrl: staff?.avatarUrl,
    userId: staff?.userId,
    capabilities: staff?.capabilities || [],
    certifications: staff?.certifications || [],
    workingHours: staff?.workingHours || getDefaultHours(),
    defaultFacilityId: staff?.defaultFacilityId,
    isActive: staff?.isActive ?? true,
  };
}

/**
 * StaffModal
 *
 * A comprehensive modal for adding or editing a staff member.
 * Includes personal info, capabilities, certifications, and schedule configuration.
 */
export function StaffModal({
  isOpen,
  onClose,
  onSave,
  staff,
  facilities = [],
  users = [],
  availableCapabilities,
  className,
}: StaffModalProps) {
  const [formData, setFormData] = useState<StaffFormData>(() => getInitialFormData(staff));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const isEditMode = !!staff?.id;

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData(staff));
      setErrors({});
      setUserSearch('');
    }
  }, [isOpen, staff]);

  const updateField = useCallback(<K extends keyof StaffFormData>(
    field: K,
    value: StaffFormData[K]
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

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
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
      console.error('Failed to save staff:', error);
    } finally {
      setIsSaving(false);
    }
  }, [formData, validate, onSave, onClose]);

  const handleClose = useCallback(() => {
    if (!isSaving) {
      onClose();
    }
  }, [isSaving, onClose]);

  const selectUser = useCallback((user: UserOption) => {
    updateField('userId', user.id);
    setUserSearch(user.name);
    setShowUserDropdown(false);
  }, [updateField]);

  const clearUser = useCallback(() => {
    updateField('userId', undefined);
    setUserSearch('');
  }, [updateField]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const linkedUser = users.find((u) => u.id === formData.userId);

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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              {isEditMode ? 'Edit Staff Member' : 'Add Staff Member'}
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
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Personal Information</h3>

              <div className="flex gap-4">
                {/* Photo Upload */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-2">
                    {formData.avatarUrl ? (
                      <img
                        src={formData.avatarUrl}
                        alt="Staff photo"
                        className="h-24 w-24 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-muted">
                        <User className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      // In a real implementation, this would open a file picker
                      // For now, just set a placeholder
                    }}
                  >
                    <Upload className="mr-1 h-3 w-3" />
                    Upload Photo
                  </Button>
                </div>

                {/* Name Fields */}
                <div className="flex-1 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => updateField('firstName', e.target.value)}
                        placeholder="John"
                        className={cn(
                          'h-10 w-full rounded-lg border bg-background px-3 text-sm',
                          errors.firstName
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-border focus:border-amber-500 focus:ring-amber-500/20'
                        )}
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => updateField('lastName', e.target.value)}
                        placeholder="Smith"
                        className={cn(
                          'h-10 w-full rounded-lg border bg-background px-3 text-sm',
                          errors.lastName
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-border focus:border-amber-500 focus:ring-amber-500/20'
                        )}
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="john@example.com"
                        className={cn(
                          'h-10 w-full rounded-lg border bg-background px-3 text-sm',
                          errors.email
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-border focus:border-amber-500 focus:ring-amber-500/20'
                        )}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-foreground">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateField('phone', e.target.value)}
                        placeholder="+66 2 123 4567"
                        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-amber-500 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Link to User Account */}
              {users.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Link to User Account (optional)
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={linkedUser ? linkedUser.name : userSearch}
                      onChange={(e) => {
                        setUserSearch(e.target.value);
                        setShowUserDropdown(true);
                        if (!e.target.value) {
                          clearUser();
                        }
                      }}
                      onFocus={() => setShowUserDropdown(true)}
                      placeholder="Search user..."
                      className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-10 text-sm focus:border-amber-500 focus:ring-amber-500/20"
                    />
                    {formData.userId && (
                      <button
                        type="button"
                        onClick={clearUser}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}

                    {showUserDropdown && userSearch && filteredUsers.length > 0 && (
                      <div className="absolute left-0 top-full z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border bg-card py-1 shadow-lg">
                        {filteredUsers.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            onClick={() => selectUser(user)}
                            className="flex w-full flex-col items-start px-3 py-2 transition-colors hover:bg-muted"
                          >
                            <span className="text-sm font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">{user.email}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Linking allows this staff member to log in and view their schedule
                  </p>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Capabilities */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Capabilities</h3>
              <CapabilitiesEditor
                value={formData.capabilities}
                onChange={(capabilities) => updateField('capabilities', capabilities)}
                availableCapabilities={availableCapabilities}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Certifications */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Certifications</h3>
              <CertificationsEditor
                value={formData.certifications}
                onChange={(certifications) => updateField('certifications', certifications)}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-border" />

            {/* Schedule */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Schedule</h3>

              {facilities.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Default Facility
                  </label>
                  <select
                    value={formData.defaultFacilityId || ''}
                    onChange={(e) => updateField('defaultFacilityId', e.target.value || undefined)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-amber-500 focus:ring-amber-500/20"
                  >
                    <option value="">No default facility</option>
                    {facilities.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-3 block text-sm font-medium text-foreground">
                  Working Hours
                </label>
                <OperatingHoursEditor
                  value={formData.workingHours}
                  onChange={(hours) => updateField('workingHours', hours)}
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
            {isEditMode ? 'Save Changes' : 'Save Staff Member'}
          </Button>
        </div>
      </div>
    </>
  );
}
