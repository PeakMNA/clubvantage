'use client';

import { Camera, MapPin, Phone, Mail, Calendar, Globe, Pencil, MoreVertical, Star, Plus } from 'lucide-react';
import { cn } from '@clubvantage/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@clubvantage/ui';
import { Button } from '@clubvantage/ui';
import { Badge } from '@clubvantage/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@clubvantage/ui';
import type { Member, Address } from './types';

interface ProfileTabProps {
  member: Member;
  onEditPersonalInfo?: () => void;
  onAddAddress?: () => void;
  onEditAddress?: (addressId: string) => void;
  onRemoveAddress?: (addressId: string) => void;
  onSetPrimaryAddress?: (addressId: string) => void;
  onUploadPhoto?: () => void;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatAddress(address: Address): string {
  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.subDistrict,
    address.district,
    address.province,
    address.postalCode,
    address.country,
  ].filter(Boolean);
  return parts.join(', ');
}

function getAddressTypeBadge(type: Address['type']): { label: string; className: string } {
  switch (type) {
    case 'BILLING':
      return { label: 'Billing', className: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' };
    case 'MAILING':
      return { label: 'Mailing', className: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' };
    case 'BOTH':
      return { label: 'Billing & Mailing', className: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400' };
    default:
      return { label: 'Address', className: 'bg-muted text-foreground' };
  }
}

export function ProfileTab({
  member,
  onEditPersonalInfo,
  onAddAddress,
  onEditAddress,
  onRemoveAddress,
  onSetPrimaryAddress,
  onUploadPhoto,
}: ProfileTabProps) {
  return (
    <div className="space-y-6">
      {/* Personal Information Card */}
      <div className="rounded-lg border border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
          <Button variant="outline" size="sm" onClick={onEditPersonalInfo}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>

        <div className="flex gap-6">
          {/* Photo */}
          <div className="group relative flex-shrink-0">
            <Avatar className="h-24 w-24">
              <AvatarImage src={member.photoUrl} alt={`${member.firstName} ${member.lastName}`} />
              <AvatarFallback className="bg-muted text-2xl text-muted-foreground">
                {getInitials(member.firstName, member.lastName)}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={onUploadPhoto}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Camera className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Info Grid */}
          <div className="grid flex-1 grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground">First Name</label>
              <p className="mt-1 text-sm text-foreground">{member.firstName}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Last Name</label>
              <p className="mt-1 text-sm text-foreground">{member.lastName}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Date of Birth</label>
              <p className="mt-1 flex items-center gap-2 text-sm text-foreground">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {member.dateOfBirth ? formatDate(member.dateOfBirth) : '—'}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nationality</label>
              <p className="mt-1 flex items-center gap-2 text-sm text-foreground">
                <Globe className="h-4 w-4 text-muted-foreground" />
                {member.nationality || '—'}
              </p>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Member Since</label>
              <p className="mt-1 text-sm text-muted-foreground">{formatDate(member.joinDate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information Card */}
      <div className="rounded-lg border border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Contact Information</h3>
          <Button variant="outline" size="sm" onClick={onEditPersonalInfo}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Email</label>
            <p className="mt-1 flex items-center gap-2 text-sm text-foreground">
              <Mail className="h-4 w-4 text-muted-foreground" />
              {member.email}
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Phone</label>
            <p className="mt-1 flex items-center gap-2 text-sm text-foreground">
              <Phone className="h-4 w-4 text-muted-foreground" />
              {member.phone}
            </p>
          </div>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="rounded-lg border border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Addresses</h3>
          <Button variant="outline" size="sm" onClick={onAddAddress}>
            <Plus className="mr-2 h-4 w-4" />
            Add Address
          </Button>
        </div>

        {member.addresses.length === 0 ? (
          <div className="py-8 text-center">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No addresses added</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={onAddAddress}>
              Add Address
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {member.addresses.map((address) => {
              const typeBadge = getAddressTypeBadge(address.type);
              return (
                <div
                  key={address.id}
                  className="flex items-start justify-between rounded-lg border border-border bg-muted p-4"
                >
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <Badge className={cn('text-xs', typeBadge.className)}>
                          {typeBadge.label}
                        </Badge>
                        {address.isPrimary && (
                          <span className="flex items-center gap-1 text-xs text-amber-600">
                            <Star className="h-3 w-3 fill-amber-500" />
                            Primary
                          </span>
                        )}
                        {address.label && (
                          <span className="text-xs text-muted-foreground">{address.label}</span>
                        )}
                      </div>
                      <p className="text-sm text-foreground">{formatAddress(address)}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditAddress?.(address.id)}>
                        Edit
                      </DropdownMenuItem>
                      {!address.isPrimary && (
                        <DropdownMenuItem onClick={() => onSetPrimaryAddress?.(address.id)}>
                          Set as Primary
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => onRemoveAddress?.(address.id)}
                        className="text-red-600"
                      >
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
