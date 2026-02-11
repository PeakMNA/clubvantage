'use client';

import { useState } from 'react';
import { Camera, Copy, MoreVertical, Check, Sparkles } from 'lucide-react';
import { cn } from '@clubvantage/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@clubvantage/ui';
import { Button } from '@clubvantage/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@clubvantage/ui';
import { StatusBadge } from './status-badge';
import type { Member, MemberStatus } from './types';

interface MemberDetailHeaderProps {
  member: Member;
  onEdit?: () => void;
  onChangeStatus?: (status: MemberStatus) => void;
  onUploadPhoto?: () => void;
  onBalanceClick?: () => void;
  className?: string;
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function getBalanceColor(member: Member): string {
  if (member.balance <= 0) return 'text-emerald-600 dark:text-emerald-400';
  if (member.status === 'SUSPENDED') return 'text-red-600 dark:text-red-400';
  if (member.agingBucket === 'DAYS_91_PLUS') return 'text-red-600 dark:text-red-400';
  return 'text-amber-600 dark:text-amber-400';
}

function getAgingText(member: Member): string | null {
  if (member.balance <= 0) return null;
  switch (member.agingBucket) {
    case 'DAYS_30':
      return '30 days overdue';
    case 'DAYS_60':
      return '60 days overdue';
    case 'DAYS_90':
      return '90 days overdue';
    case 'DAYS_91_PLUS':
      return '91+ days overdue';
    default:
      return null;
  }
}

const statusOptions: MemberStatus[] = [
  'ACTIVE',
  'SUSPENDED',
  'LAPSED',
  'RESIGNED',
  'TERMINATED',
];

export function MemberDetailHeader({
  member,
  onEdit,
  onChangeStatus,
  onUploadPhoto,
  onBalanceClick,
  className,
}: MemberDetailHeaderProps) {
  const [copied, setCopied] = useState(false);
  const isReadOnly = member.status === 'TERMINATED' || member.status === 'RESIGNED';
  const isSuspended = member.status === 'SUSPENDED';
  const agingText = getAgingText(member);

  const handleCopyMemberNumber = async () => {
    await navigator.clipboard.writeText(member.memberNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusMap = {
    PROSPECT: 'prospect',
    LEAD: 'lead',
    APPLICANT: 'applicant',
    ACTIVE: 'active',
    SUSPENDED: 'suspended',
    LAPSED: 'lapsed',
    RESIGNED: 'resigned',
    TERMINATED: 'terminated',
    REACTIVATED: 'reactivated',
  } as const;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-card shadow-xl backdrop-blur-sm',
        isReadOnly && 'opacity-70',
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-transparent to-muted/30" />

      {/* Decorative accent line */}
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-border via-muted-foreground to-border" />

      <div className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-6 lg:p-8">
        {/* Left Section: Photo + Identity */}
        <div className="flex items-start gap-4 sm:gap-5">
          {/* Photo with upload overlay */}
          <div className="group relative shrink-0">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-border to-muted opacity-75" />
            <Avatar className="relative h-18 w-18 border-2 border-card shadow-lg sm:h-24 sm:w-24">
              <AvatarImage
                src={member.photoUrl}
                alt={`${member.firstName} ${member.lastName}`}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-muted to-muted/50 text-xl font-semibold text-muted-foreground sm:text-2xl">
                {getInitials(member.firstName, member.lastName)}
              </AvatarFallback>
            </Avatar>
            {!isReadOnly && (
              <button
                type="button"
                onClick={onUploadPhoto}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-foreground/60 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100"
              >
                <Camera className="h-5 w-5 text-background drop-shadow-lg sm:h-6 sm:w-6" />
              </button>
            )}
          </div>

          {/* Identity Info */}
          <div className="min-w-0 flex-1 pt-1">
            {/* Name */}
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
              {member.firstName} {member.lastName}
            </h1>

            {/* Member # with copy */}
            <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 rounded-lg bg-muted/80 px-2.5 py-1 backdrop-blur-sm">
                <span className="font-mono text-xs font-medium text-muted-foreground sm:text-sm">
                  {member.memberNumber}
                </span>
                <button
                  type="button"
                  onClick={handleCopyMemberNumber}
                  className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <StatusBadge status={statusMap[member.status]} size="md" />
            </div>

            {/* Membership Type */}
            <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground sm:text-base">
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{member.membershipTypeName}</span>
            </div>
          </div>
        </div>

        {/* Right Section: Balance + Actions */}
        <div className="flex flex-col gap-4 sm:items-end">
          {/* Balance Card */}
          <div className="rounded-xl bg-gradient-to-br from-muted to-muted/50 p-3 shadow-inner sm:p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground sm:text-right">
              Account Balance
            </p>
            <button
              type="button"
              onClick={onBalanceClick}
              className={cn(
                'mt-1 text-xl font-bold tracking-tight transition-all hover:scale-105 sm:text-2xl lg:text-3xl',
                getBalanceColor(member)
              )}
            >
              {formatCurrency(member.balance)}
            </button>
            {agingText && (
              <div className="mt-1 text-xs font-medium text-red-500/80 sm:text-right">
                {agingText}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              disabled={isReadOnly}
              className="bg-card/80 shadow-sm backdrop-blur-sm transition-all hover:bg-card hover:shadow-md"
            >
              Edit Profile
            </Button>

            {/* Change Status Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isReadOnly}
                  className="bg-card/80 shadow-sm backdrop-blur-sm transition-all hover:bg-card hover:shadow-md"
                >
                  <span className="hidden sm:inline">Change Status</span>
                  <span className="sm:hidden">Status</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="backdrop-blur-sm">
                {statusOptions
                  .filter((s) => s !== member.status)
                  .map((status) => (
                    <DropdownMenuItem
                      key={status}
                      onClick={() => onChangeStatus?.(status)}
                      className={cn(
                        'cursor-pointer',
                        (status === 'SUSPENDED' || status === 'TERMINATED') && 'text-red-600 dark:text-red-400'
                      )}
                    >
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* More Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 bg-card/80 shadow-sm backdrop-blur-sm transition-all hover:bg-card hover:shadow-md"
                  disabled={isReadOnly}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="backdrop-blur-sm">
                <DropdownMenuItem className="cursor-pointer">View Activity Log</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Send Email</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">Export Data</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status Indicators */}
          {isSuspended && member.suspensionReason && (
            <div className="rounded-lg bg-red-50 dark:bg-red-500/20 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 backdrop-blur-sm">
              Suspended: {member.suspensionReason}
            </div>
          )}
          {isReadOnly && (
            <div className="rounded-lg bg-muted/80 px-3 py-2 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              Read-only (Cancelled Member)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
