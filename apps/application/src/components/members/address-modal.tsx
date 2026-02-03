'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@clubvantage/ui';
import type { Address } from './types';

// Address label/type options
export type AddressLabel = 'BILLING' | 'MAILING' | 'BOTH';

const addressLabelOptions: { value: AddressLabel; label: string }[] = [
  { value: 'BILLING', label: 'Billing' },
  { value: 'MAILING', label: 'Mailing' },
  { value: 'BOTH', label: 'Both' },
];

// Common country options
const countryOptions = [
  { value: 'Thailand', label: 'Thailand' },
  { value: 'United States', label: 'United States' },
  { value: 'United Kingdom', label: 'United Kingdom' },
  { value: 'Singapore', label: 'Singapore' },
  { value: 'Japan', label: 'Japan' },
  { value: 'Australia', label: 'Australia' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'Canada', label: 'Canada' },
  { value: 'Other', label: 'Other' },
];

export interface AddressFormData {
  label: string;
  type: AddressLabel;
  addressLine1: string;
  addressLine2?: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
}

export interface AddressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, we're editing an existing address */
  address?: Address;
  /** Callback when form is submitted */
  onSubmit: (data: AddressFormData) => void | Promise<void>;
  /** Loading state during submission */
  isLoading?: boolean;
  /** Whether this will be the first/only address (auto-set as primary) */
  isFirstAddress?: boolean;
}

const initialFormData: AddressFormData = {
  label: '',
  type: 'BILLING',
  addressLine1: '',
  addressLine2: '',
  subDistrict: '',
  district: '',
  province: '',
  postalCode: '',
  country: 'Thailand',
  isPrimary: false,
};

export function AddressModal({
  open,
  onOpenChange,
  address,
  onSubmit,
  isLoading = false,
  isFirstAddress = false,
}: AddressModalProps) {
  const [formData, setFormData] = useState<AddressFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressFormData, string>>>({});

  const isEditing = !!address;

  // Reset form when modal opens/closes or address changes
  useEffect(() => {
    if (open) {
      if (address) {
        // Edit mode: populate with existing address data
        setFormData({
          label: address.label || '',
          type: address.type,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 || '',
          subDistrict: address.subDistrict,
          district: address.district,
          province: address.province,
          postalCode: address.postalCode,
          country: address.country,
          isPrimary: address.isPrimary,
        });
      } else {
        // Create mode: reset to defaults
        setFormData({
          ...initialFormData,
          // Auto-set as primary if this is the first address
          isPrimary: isFirstAddress,
        });
      }
      setErrors({});
    }
  }, [address, open, isFirstAddress]);

  const handleInputChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AddressFormData, string>> = {};

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address Line 1 is required';
    }

    if (!formData.subDistrict.trim()) {
      newErrors.subDistrict = 'Sub-district is required';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }

    if (!formData.province.trim()) {
      newErrors.province = 'Province is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Failed to save address:', err);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData(initialFormData);
      setErrors({});
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Address' : 'Add Address'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Address Type/Label */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Address Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleInputChange('type', value as AddressLabel)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {addressLabelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => handleInputChange('label', e.target.value)}
                placeholder="e.g., Home, Office"
              />
            </div>
          </div>

          {/* Address Lines */}
          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1 *</Label>
            <Input
              id="addressLine1"
              value={formData.addressLine1}
              onChange={(e) => handleInputChange('addressLine1', e.target.value)}
              placeholder="Street address, building, apartment"
              className={errors.addressLine1 ? 'border-red-500' : ''}
            />
            {errors.addressLine1 && (
              <p className="text-xs text-red-500">{errors.addressLine1}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input
              id="addressLine2"
              value={formData.addressLine2}
              onChange={(e) => handleInputChange('addressLine2', e.target.value)}
              placeholder="Floor, unit, suite (optional)"
            />
          </div>

          {/* Sub-district and District */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subDistrict">Sub-district *</Label>
              <Input
                id="subDistrict"
                value={formData.subDistrict}
                onChange={(e) => handleInputChange('subDistrict', e.target.value)}
                placeholder="Sub-district / Tambon"
                className={errors.subDistrict ? 'border-red-500' : ''}
              />
              {errors.subDistrict && (
                <p className="text-xs text-red-500">{errors.subDistrict}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District *</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
                placeholder="District / Amphoe"
                className={errors.district ? 'border-red-500' : ''}
              />
              {errors.district && (
                <p className="text-xs text-red-500">{errors.district}</p>
              )}
            </div>
          </div>

          {/* Province and Postal Code */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="province">Province *</Label>
              <Input
                id="province"
                value={formData.province}
                onChange={(e) => handleInputChange('province', e.target.value)}
                placeholder="Province / State"
                className={errors.province ? 'border-red-500' : ''}
              />
              {errors.province && (
                <p className="text-xs text-red-500">{errors.province}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code *</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                placeholder="Postal / ZIP code"
                className={errors.postalCode ? 'border-red-500' : ''}
              />
              {errors.postalCode && (
                <p className="text-xs text-red-500">{errors.postalCode}</p>
              )}
            </div>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Select
              value={formData.country}
              onValueChange={(value) => handleInputChange('country', value)}
            >
              <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.country && (
              <p className="text-xs text-red-500">{errors.country}</p>
            )}
          </div>

          {/* Is Primary Checkbox */}
          <div className="flex items-center space-x-2 rounded-lg border border-border bg-muted/50 p-4">
            <Checkbox
              id="isPrimary"
              checked={formData.isPrimary}
              onCheckedChange={(checked) =>
                handleInputChange('isPrimary', checked === true)
              }
              disabled={isFirstAddress}
            />
            <div className="flex-1">
              <Label
                htmlFor="isPrimary"
                className="cursor-pointer text-sm font-medium"
              >
                Set as primary address
              </Label>
              <p className="text-xs text-muted-foreground">
                {isFirstAddress
                  ? 'This will be your primary address'
                  : 'Primary address is used for billing and correspondence'}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Add Address'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
