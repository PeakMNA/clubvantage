'use client';

import { useState, useCallback } from 'react';
import { X, Lock, Upload, User, Building2, Info } from 'lucide-react';
import {
  cn,
  Button,
  Input,
  Label,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Alert,
  AlertDescription,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@clubvantage/ui';
import type { MembershipType, Member } from './types';

type AddMemberMode = 'quick' | 'application';

export interface AddMemberFormData {
  mode: AddMemberMode;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  membershipTypeId: string;
  sponsorId: string;
  addressLine1: string;
  addressLine2: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  membershipTypes: MembershipType[];
  sponsors?: Pick<Member, 'id' | 'firstName' | 'lastName' | 'memberNumber'>[];
  onSubmit: (data: AddMemberFormData, documents?: { id?: File; address?: File }) => Promise<void>;
  isLoading?: boolean;
}

const initialFormData: AddMemberFormData = {
  mode: 'quick',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  nationality: 'Thai',
  membershipTypeId: '',
  sponsorId: '',
  addressLine1: '',
  addressLine2: '',
  subDistrict: '',
  district: '',
  province: 'Bangkok',
  postalCode: '',
  country: 'Thailand',
};

const nationalities = [
  'Thai',
  'American',
  'Australian',
  'British',
  'Canadian',
  'Chinese',
  'French',
  'German',
  'Indian',
  'Japanese',
  'Korean',
  'Singaporean',
  'Other',
];

const provinces = [
  'Bangkok',
  'Chiang Mai',
  'Chiang Rai',
  'Chonburi',
  'Khon Kaen',
  'Nakhon Ratchasima',
  'Nonthaburi',
  'Pathum Thani',
  'Phuket',
  'Samut Prakan',
  'Songkhla',
];

const countries = [
  'Thailand',
  'Australia',
  'Canada',
  'China',
  'France',
  'Germany',
  'India',
  'Japan',
  'Singapore',
  'South Korea',
  'United Kingdom',
  'United States',
  'Other',
];

export function AddMemberModal({
  open,
  onOpenChange,
  membershipTypes,
  sponsors = [],
  onSubmit,
  isLoading = false,
}: AddMemberModalProps) {
  const [formData, setFormData] = useState<AddMemberFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof AddMemberFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [documents, setDocuments] = useState<{ id?: File; address?: File }>({});
  const [dragOver, setDragOver] = useState<{ id: boolean; address: boolean }>({ id: false, address: false });

  // Check if selected membership type requires board approval
  const selectedType = membershipTypes.find((t) => t.id === formData.membershipTypeId);
  const requiresApproval = selectedType?.requiresBoardApproval ?? false;
  const requiresSponsor = selectedType?.requiresBoardApproval ?? false;

  // If type requires approval, force application mode
  const effectiveMode = requiresApproval ? 'application' : formData.mode;

  const handleInputChange = useCallback(
    (field: keyof AddMemberFormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const handleSelectChange = useCallback(
    (field: keyof AddMemberFormData) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const handleModeChange = (mode: AddMemberMode) => {
    if (mode === 'quick' && requiresApproval) return;
    setFormData((prev) => ({ ...prev, mode }));
  };

  const processFile = useCallback((type: 'id' | 'address', file: File) => {
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError(`${type === 'id' ? 'ID document' : 'Proof of address'} must be under 5MB`);
      return;
    }
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setSubmitError('Invalid file type. Please upload JPG, PNG, or PDF');
      return;
    }
    setDocuments((prev) => ({ ...prev, [type]: file }));
    setSubmitError(null);
  }, []);

  const handleFileChange = useCallback(
    (type: 'id' | 'address') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(type, file);
      }
    },
    [processFile]
  );

  const handleDragOver = useCallback(
    (type: 'id' | 'address') => (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver((prev) => ({ ...prev, [type]: true }));
    },
    []
  );

  const handleDragLeave = useCallback(
    (type: 'id' | 'address') => (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver((prev) => ({ ...prev, [type]: false }));
    },
    []
  );

  const handleDrop = useCallback(
    (type: 'id' | 'address') => (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver((prev) => ({ ...prev, [type]: false }));
      const file = e.dataTransfer.files?.[0];
      if (file) {
        processFile(type, file);
      }
    },
    [processFile]
  );

  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof AddMemberFormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    if (!formData.membershipTypeId) {
      newErrors.membershipTypeId = 'Membership type is required';
    }
    if (requiresSponsor && !formData.sponsorId) {
      newErrors.sponsorId = 'Sponsor is required for this membership type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, requiresSponsor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // For application mode, check documents
    if (effectiveMode === 'application') {
      if (!documents.id || !documents.address) {
        setSubmitError('Please upload required documents for the application');
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSubmit({ ...formData, mode: effectiveMode }, documents);
      // Reset form on success
      setFormData(initialFormData);
      setDocuments({});
      onOpenChange(false);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to create member. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isLoading) {
      setFormData(initialFormData);
      setErrors({});
      setSubmitError(null);
      setDocuments({});
      onOpenChange(false);
    }
  };

  const loading = isSubmitting || isLoading;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] w-full sm:w-[640px] max-w-[95vw] sm:max-w-[90vw] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Add New Member</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleClose}
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {submitError && (
            <Alert variant="destructive">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {/* Mode Selector */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleModeChange('quick')}
              disabled={requiresApproval}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-colors',
                effectiveMode === 'quick' && !requiresApproval
                  ? 'border-amber-500 bg-amber-50'
                  : 'border bg-card hover:bg-muted',
                requiresApproval && 'cursor-not-allowed opacity-50'
              )}
            >
              <User className="h-8 w-8 text-muted-foreground" />
              <div className="font-medium">Quick Add</div>
              <div className="text-xs text-muted-foreground">Direct member creation</div>
              {requiresApproval && (
                <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                  <Lock className="h-3 w-3" />
                  <span>Board approval required</span>
                </div>
              )}
            </button>
            <button
              type="button"
              onClick={() => handleModeChange('application')}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-colors',
                effectiveMode === 'application'
                  ? 'border-amber-500 bg-amber-50'
                  : 'border bg-card hover:bg-muted'
              )}
            >
              <Building2 className="h-8 w-8 text-muted-foreground" />
              <div className="font-medium">Application</div>
              <div className="text-xs text-muted-foreground">Submit for approval</div>
            </button>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Personal Information</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange('firstName')}
                  className={cn(errors.firstName && 'border-red-500')}
                  disabled={loading}
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange('lastName')}
                  className={cn(errors.lastName && 'border-red-500')}
                  disabled={loading}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  className={cn(errors.email && 'border-red-500')}
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  placeholder="+66 XX XXX XXXX"
                  className={cn(errors.phone && 'border-red-500')}
                  disabled={loading}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone}</p>
                )}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange('dateOfBirth')}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <Select
                  value={formData.nationality}
                  onValueChange={handleSelectChange('nationality')}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select nationality" />
                  </SelectTrigger>
                  <SelectContent>
                    {nationalities.map((nat) => (
                      <SelectItem key={nat} value={nat}>
                        {nat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Membership */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">Membership</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground hover:text-muted-foreground">
                      <Info className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <div className="space-y-2 text-xs">
                      <p className="font-semibold">Membership Type Comparison</p>
                      {membershipTypes.slice(0, 3).map((type) => (
                        <div key={type.id} className="border-t border-border pt-1">
                          <p className="font-medium">{type.name}</p>
                          <p className="text-muted-foreground">{type.description || 'Standard membership'}</p>
                          {type.requiresBoardApproval && (
                            <p className="text-amber-600">Requires board approval</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-2">
              <Label htmlFor="membershipType">Membership Type *</Label>
              <Select
                value={formData.membershipTypeId}
                onValueChange={handleSelectChange('membershipTypeId')}
                disabled={loading}
              >
                <SelectTrigger className={cn(errors.membershipTypeId && 'border-red-500')}>
                  <SelectValue placeholder="Select membership type" />
                </SelectTrigger>
                <SelectContent>
                  {membershipTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <span>{type.name}</span>
                        {type.requiresBoardApproval && (
                          <span className="text-xs text-amber-600">(Board approval)</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.membershipTypeId && (
                <p className="text-xs text-red-500">{errors.membershipTypeId}</p>
              )}
              {selectedType && (
                <p className="text-xs text-muted-foreground">{selectedType.description}</p>
              )}
            </div>
            {requiresSponsor && sponsors.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="sponsor">Sponsor *</Label>
                <Select
                  value={formData.sponsorId}
                  onValueChange={handleSelectChange('sponsorId')}
                  disabled={loading}
                >
                  <SelectTrigger className={cn(errors.sponsorId && 'border-red-500')}>
                    <SelectValue placeholder="Select a sponsor" />
                  </SelectTrigger>
                  <SelectContent>
                    {sponsors.map((sponsor) => (
                      <SelectItem key={sponsor.id} value={sponsor.id}>
                        {sponsor.firstName} {sponsor.lastName} ({sponsor.memberNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.sponsorId && (
                  <p className="text-xs text-red-500">{errors.sponsorId}</p>
                )}
              </div>
            )}
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Address</h3>
            <div className="space-y-2">
              <Label htmlFor="addressLine1">Address Line 1</Label>
              <Input
                id="addressLine1"
                value={formData.addressLine1}
                onChange={handleInputChange('addressLine1')}
                placeholder="Street address, building name"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                value={formData.addressLine2}
                onChange={handleInputChange('addressLine2')}
                placeholder="Apartment, suite, floor"
                disabled={loading}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="subDistrict">Sub-district</Label>
                <Input
                  id="subDistrict"
                  value={formData.subDistrict}
                  onChange={handleInputChange('subDistrict')}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={handleInputChange('district')}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="province">Province</Label>
                <Select
                  value={formData.province}
                  onValueChange={handleSelectChange('province')}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinces.map((prov) => (
                      <SelectItem key={prov} value={prov}>
                        {prov}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange('postalCode')}
                  maxLength={5}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={handleSelectChange('country')}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Documents (Application mode only) */}
          {effectiveMode === 'application' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Documents</h3>
              <p className="text-xs text-muted-foreground">
                Upload required documents for board review. Accepted formats: JPG, PNG, PDF (max 5MB each)
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>ID Document *</Label>
                  <label
                    onDragOver={handleDragOver('id')}
                    onDragLeave={handleDragLeave('id')}
                    onDrop={handleDrop('id')}
                    className={cn(
                      'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors hover:bg-muted',
                      documents.id ? 'border-emerald-500 bg-emerald-50' : 'border-border',
                      dragOver.id && 'border-amber-500 bg-amber-50',
                      loading && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <Upload className={cn('h-6 w-6', documents.id ? 'text-emerald-600' : dragOver.id ? 'text-amber-500' : 'text-muted-foreground')} />
                    <span className="mt-2 text-center text-sm text-muted-foreground">
                      {documents.id ? documents.id.name : dragOver.id ? 'Drop file here' : 'Drag & drop or click to upload'}
                    </span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={handleFileChange('id')}
                      disabled={loading}
                    />
                  </label>
                </div>
                <div className="space-y-2">
                  <Label>Proof of Address *</Label>
                  <label
                    onDragOver={handleDragOver('address')}
                    onDragLeave={handleDragLeave('address')}
                    onDrop={handleDrop('address')}
                    className={cn(
                      'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 transition-colors hover:bg-muted',
                      documents.address ? 'border-emerald-500 bg-emerald-50' : 'border-border',
                      dragOver.address && 'border-amber-500 bg-amber-50',
                      loading && 'cursor-not-allowed opacity-50'
                    )}
                  >
                    <Upload className={cn('h-6 w-6', documents.address ? 'text-emerald-600' : dragOver.address ? 'text-amber-500' : 'text-muted-foreground')} />
                    <span className="mt-2 text-center text-sm text-muted-foreground">
                      {documents.address ? documents.address.name : dragOver.address ? 'Drop file here' : 'Drag & drop or click to upload'}
                    </span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={handleFileChange('address')}
                      disabled={loading}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading
                ? 'Processing...'
                : effectiveMode === 'application'
                  ? 'Submit Application'
                  : 'Create Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
