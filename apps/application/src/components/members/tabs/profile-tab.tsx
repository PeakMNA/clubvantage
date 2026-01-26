'use client';

import { cn, Button, Badge } from '@clubvantage/ui';
import { Member, Address } from '../types';
import { Edit, Plus, MapPin, Mail, Phone, Calendar, Globe, CreditCard, Sparkles } from 'lucide-react';

export interface ProfileTabProps {
  member: Member;
  onEditPersonalInfo?: () => void;
  onAddAddress?: () => void;
  onEditAddress?: (addressId: string) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function AddressCard({
  address,
  onEdit,
}: {
  address: Address;
  onEdit?: () => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border/60 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md sm:p-5">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-3 sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 shadow-inner">
            <MapPin className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-foreground sm:text-base">{address.label}</span>
              {address.isPrimary && (
                <Badge className="bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/30 text-[10px] font-medium">
                  Primary
                </Badge>
              )}
              <Badge variant="outline" className="border text-[10px] font-medium text-muted-foreground">
                {address.type}
              </Badge>
            </div>
            <div className="mt-2 space-y-0.5">
              <p className="text-sm text-muted-foreground">
                {address.addressLine1}
                {address.addressLine2 && `, ${address.addressLine2}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {address.subDistrict}, {address.district}
              </p>
              <p className="text-sm text-muted-foreground">
                {address.province} {address.postalCode}
              </p>
              <p className="text-sm text-muted-foreground">{address.country}</p>
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 self-end rounded-lg opacity-0 transition-opacity group-hover:opacity-100 sm:self-start"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-3 sm:gap-4', className)}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 shadow-inner">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-sm font-medium text-foreground sm:text-base">{value}</p>
      </div>
    </div>
  );
}

export function ProfileTab({
  member,
  onEditPersonalInfo,
  onAddAddress,
  onEditAddress,
}: ProfileTabProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Personal Information */}
      <div className="relative overflow-hidden rounded-2xl border border/60 bg-white/80 shadow-lg shadow-slate-200/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />

        {/* Header */}
        <div className="relative flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Personal Information</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onEditPersonalInfo}
            className="w-fit border bg-white/80 shadow-sm backdrop-blur-sm transition-all hover:bg-card hover:shadow-md"
          >
            <Edit className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
        </div>

        {/* Content */}
        <div className="relative p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            <InfoItem icon={Mail} label="Email" value={member.email} />
            <InfoItem icon={Phone} label="Phone" value={member.phone} />
            <InfoItem icon={Calendar} label="Date of Birth" value={formatDate(member.dateOfBirth)} />
            <InfoItem icon={Globe} label="Nationality" value={member.nationality} />
          </div>
        </div>
      </div>

      {/* Addresses */}
      <div className="relative overflow-hidden rounded-2xl border border/60 bg-white/80 shadow-lg shadow-slate-200/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />

        {/* Header */}
        <div className="relative flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Addresses</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onAddAddress}
            className="w-fit border bg-white/80 shadow-sm backdrop-blur-sm transition-all hover:bg-card hover:shadow-md"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Address</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {/* Content */}
        <div className="relative p-4 sm:p-6">
          {member.addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border bg-muted/50 py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <MapPin className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">No addresses on file</p>
              <p className="mt-1 text-xs text-muted-foreground">Add an address to complete the member profile</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 border"
                onClick={onAddAddress}
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Add Address
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {member.addresses.map((address) => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onEdit={() => onEditAddress?.(address.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Membership Info */}
      <div className="relative overflow-hidden rounded-2xl border border/60 bg-white/80 shadow-lg shadow-slate-200/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent" />

        {/* Header */}
        <div className="relative border-b border-slate-100 p-4 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Membership Information</h2>
        </div>

        {/* Content */}
        <div className="relative p-4 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            <InfoItem
              icon={CreditCard}
              label="Member Number"
              value={member.memberNumber}
              className="[&_p:last-child]:font-mono"
            />
            <InfoItem icon={Sparkles} label="Membership Type" value={member.membershipTypeName} />
            <InfoItem icon={Calendar} label="Join Date" value={formatDate(member.joinDate)} />
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-muted to-muted/50 shadow-inner">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Auto-Pay</p>
                <div className="mt-1 flex items-center gap-2">
                  <div className={cn(
                    'h-2 w-2 rounded-full',
                    member.autoPay ? 'bg-emerald-500' : 'bg-slate-300'
                  )} />
                  <p className="text-sm font-medium text-foreground">
                    {member.autoPay ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
