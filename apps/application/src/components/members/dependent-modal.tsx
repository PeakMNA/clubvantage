'use client';

import { useState, useEffect } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@clubvantage/ui';
import { Camera } from 'lucide-react';
import { Dependent, DependentRelationship } from './types';

export interface DependentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dependent?: Dependent; // If provided, we're editing
  onSubmit: (data: DependentFormData) => void;
  isLoading?: boolean;
}

export interface DependentFormData {
  firstName: string;
  lastName: string;
  relationship: DependentRelationship;
  dateOfBirth: string;
  email?: string;
  phone?: string;
  photoUrl?: string;
}

const initialFormData: DependentFormData = {
  firstName: '',
  lastName: '',
  relationship: 'SPOUSE',
  dateOfBirth: '',
  email: '',
  phone: '',
  photoUrl: '',
};

const relationshipOptions: { value: DependentRelationship; label: string }[] = [
  { value: 'SPOUSE', label: 'Spouse' },
  { value: 'CHILD', label: 'Child' },
  { value: 'PARENT', label: 'Parent' },
  { value: 'SIBLING', label: 'Sibling' },
];

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0) || '?'}${lastName.charAt(0) || '?'}`.toUpperCase();
}

export function DependentModal({
  open,
  onOpenChange,
  dependent,
  onSubmit,
  isLoading = false,
}: DependentModalProps) {
  const [formData, setFormData] = useState<DependentFormData>(initialFormData);

  const isEditing = !!dependent;

  useEffect(() => {
    if (dependent) {
      setFormData({
        firstName: dependent.firstName,
        lastName: dependent.lastName,
        relationship: dependent.relationship,
        dateOfBirth: dependent.dateOfBirth,
        email: dependent.email || '',
        phone: dependent.phone || '',
        photoUrl: dependent.photoUrl || '',
      });
    } else {
      setFormData(initialFormData);
    }
  }, [dependent, open]);

  const handleInputChange = (field: keyof DependentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Dependent' : 'Add Dependent'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="flex justify-center">
            <div className="relative">
              <Avatar className="h-20 w-20">
                {formData.photoUrl && <AvatarImage src={formData.photoUrl} />}
                <AvatarFallback className="bg-muted text-xl text-muted-foreground">
                  {getInitials(formData.firstName, formData.lastName)}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-amber-500 text-white shadow-sm hover:bg-amber-600"
                aria-label="Upload photo"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship *</Label>
            <select
              id="relationship"
              value={formData.relationship}
              onChange={(e) =>
                handleInputChange('relationship', e.target.value as DependentRelationship)
              }
              required
              className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2"
            >
              {relationshipOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isEditing ? 'Save Changes' : 'Add Dependent'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
