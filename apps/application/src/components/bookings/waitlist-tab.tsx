'use client';

import { useState, useMemo } from 'react';
import { cn, Button, Badge } from '@clubvantage/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@clubvantage/ui';
import {
  Search,
  X,
  Clock,
  Bell,
  BellRing,
  Calendar,
  Sparkles,
  Building2,
  Check,
  Trash2,
  ChevronDown,
  Filter,
  Users,
  ArrowUpRight,
  MoreHorizontal,
  Loader2,
} from 'lucide-react';

// Types
type WaitlistStatus = 'waiting' | 'notified' | 'converted' | 'expired' | 'cancelled';

interface WaitlistMember {
  id: string;
  name: string;
  photoUrl?: string;
  memberNumber: string;
  phone?: string;
  email?: string;
}

interface WaitlistEntry {
  id: string;
  member: WaitlistMember;
  serviceType: 'service' | 'facility';
  serviceName: string;
  preferredDate: Date;
  preferredTimeRange: string;
  position: number;
  status: WaitlistStatus;
  createdAt: Date;
  notifiedAt?: Date;
  expiresAt?: Date;
  notes?: string;
}

export interface WaitlistTabProps {
  entries?: WaitlistEntry[];
  isLoading?: boolean;
  onNotify?: (entryId: string) => Promise<void>;
  onConvert?: (entryId: string) => void;
  onRemove?: (entryId: string) => Promise<void>;
  className?: string;
}

// Mock data
const mockEntries: WaitlistEntry[] = [
  {
    id: 'w1',
    member: { id: 'm1', name: 'Somchai Prasert', memberNumber: 'CV-2024-0001', phone: '+66 81 234 5678' },
    serviceType: 'service',
    serviceName: 'Thai Massage',
    preferredDate: new Date(),
    preferredTimeRange: '2:00 PM - 4:00 PM',
    position: 1,
    status: 'notified',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    notifiedAt: new Date(Date.now() - 30 * 60 * 1000),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  },
  {
    id: 'w2',
    member: { id: 'm2', name: 'Nattaya Wongchai', memberNumber: 'CV-2024-0042' },
    serviceType: 'facility',
    serviceName: 'Tennis Court',
    preferredDate: new Date(),
    preferredTimeRange: '10:00 AM - 12:00 PM',
    position: 2,
    status: 'waiting',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    id: 'w3',
    member: { id: 'm3', name: 'Wichai Thongkam', memberNumber: 'CV-2023-0188' },
    serviceType: 'service',
    serviceName: 'Swedish Massage',
    preferredDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    preferredTimeRange: '3:00 PM - 5:00 PM',
    position: 3,
    status: 'waiting',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    notes: 'Prefers therapist Nattaya',
  },
  {
    id: 'w4',
    member: { id: 'm4', name: 'Apinya Srisuk', memberNumber: 'CV-2024-0156' },
    serviceType: 'service',
    serviceName: 'Hot Stone Therapy',
    preferredDate: new Date(),
    preferredTimeRange: '11:00 AM - 1:00 PM',
    position: 4,
    status: 'converted',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: 'w5',
    member: { id: 'm5', name: 'Tanawat Phanit', memberNumber: 'CV-2023-0099' },
    serviceType: 'facility',
    serviceName: 'Badminton Court',
    preferredDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    preferredTimeRange: '6:00 PM - 8:00 PM',
    position: 5,
    status: 'expired',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
  },
];

const statusConfig: Record<WaitlistStatus, { label: string; bg: string; text: string }> = {
  waiting: {
    label: 'Waiting',
    bg: 'bg-blue-100 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-400',
  },
  notified: {
    label: 'Notified',
    bg: 'bg-amber-100 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-400',
  },
  converted: {
    label: 'Converted',
    bg: 'bg-emerald-100 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  expired: {
    label: 'Expired',
    bg: 'bg-muted',
    text: 'text-muted-foreground',
  },
  cancelled: {
    label: 'Cancelled',
    bg: 'bg-red-100 dark:bg-red-500/20',
    text: 'text-red-700 dark:text-red-400',
  },
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function formatTimeRemaining(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  if (diffMs <= 0) return 'Expired';

  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m left`;
  const diffHours = Math.floor(diffMins / 60);
  return `${diffHours}h left`;
}

interface WaitlistCardProps {
  entry: WaitlistEntry;
  onNotify: () => Promise<void>;
  onConvert: () => void;
  onRemove: () => Promise<void>;
}

function WaitlistCard({ entry, onNotify, onConvert, onRemove }: WaitlistCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const statusStyle = statusConfig[entry.status];
  const isActionable = entry.status === 'waiting' || entry.status === 'notified';

  const handleNotify = async () => {
    setIsNotifying(true);
    try {
      await onNotify();
    } finally {
      setIsNotifying(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove();
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 transition-all',
        entry.status === 'converted'
          ? 'border-emerald-200 dark:border-emerald-500/30'
          : entry.status === 'expired' || entry.status === 'cancelled'
            ? 'border-border opacity-60'
            : 'border-border'
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: Position & Info */}
        <div className="flex items-start gap-3">
          {/* Queue Position */}
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-bold',
              entry.status === 'waiting'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                : entry.status === 'notified'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                  : 'bg-muted text-muted-foreground'
            )}
          >
            #{entry.position}
          </div>

          {/* Member & Service Info */}
          <div className="min-w-0 flex-1">
            {/* Member */}
            <div className="mb-1.5 flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarImage src={entry.member.photoUrl} alt={entry.member.name} />
                <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                  {getInitials(entry.member.name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate font-medium text-foreground">
                {entry.member.name}
              </span>
              <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                {entry.member.memberNumber}
              </span>
            </div>

            {/* Service */}
            <div className="mb-1.5 flex items-center gap-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center text-muted-foreground">
                {entry.serviceType === 'service' ? (
                  <Sparkles className="h-4 w-4" />
                ) : (
                  <Building2 className="h-4 w-4" />
                )}
              </div>
              <span className="truncate text-sm text-foreground">
                {entry.serviceName}
              </span>
            </div>

            {/* Preferred Time */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(entry.preferredDate)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {entry.preferredTimeRange}
              </span>
            </div>

            {/* Notes */}
            {entry.notes && (
              <p className="mt-2 text-xs italic text-muted-foreground">
                "{entry.notes}"
              </p>
            )}

            {/* Notified Timer */}
            {entry.status === 'notified' && entry.expiresAt && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                <BellRing className="h-3 w-3" />
                <span>Notified • {formatTimeRemaining(entry.expiresAt)} to respond</span>
              </div>
            )}

            {/* Converted indicator */}
            {entry.status === 'converted' && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <Check className="h-3 w-3" />
                <span>Converted to booking</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Status & Actions */}
        <div className="flex items-center gap-2 sm:flex-col sm:items-end">
          {/* Status Badge */}
          <Badge className={cn('shrink-0', statusStyle.bg, statusStyle.text)}>
            {statusStyle.label}
          </Badge>

          {/* Time Added */}
          <span className="text-xs text-muted-foreground">
            Added {formatTimeAgo(entry.createdAt)}
          </span>

          {/* Actions */}
          {isActionable && (
            <div className="relative mt-1">
              <div className="flex gap-2">
                {entry.status === 'waiting' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleNotify}
                    disabled={isNotifying}
                    className="h-8"
                  >
                    <Bell className="mr-1.5 h-3 w-3" />
                    {isNotifying ? 'Sending...' : 'Notify'}
                  </Button>
                )}
                {entry.status === 'notified' && (
                  <Button size="sm" onClick={onConvert} className="h-8">
                    <ArrowUpRight className="mr-1.5 h-3 w-3" />
                    Convert
                  </Button>
                )}
                <button
                  type="button"
                  onClick={() => setShowActions(!showActions)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>

              {/* Actions Dropdown */}
              {showActions && (
                <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-border bg-card py-1 shadow-lg">
                  {entry.status === 'waiting' && (
                    <button
                      type="button"
                      onClick={() => {
                        onConvert();
                        setShowActions(false);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      Convert to Booking
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      handleRemove();
                      setShowActions(false);
                    }}
                    disabled={isRemoving}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    {isRemoving ? 'Removing...' : 'Remove'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type FilterStatus = 'all' | WaitlistStatus;

/**
 * WaitlistTab
 *
 * Displays and manages the booking waitlist with filtering, notifications, and conversion.
 */
export function WaitlistTab({
  entries = mockEntries,
  isLoading,
  onNotify,
  onConvert,
  onRemove,
  className,
}: WaitlistTabProps) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [localEntries, setLocalEntries] = useState(entries);

  // Filter entries
  const filteredEntries = useMemo(() => {
    let result = localEntries;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (entry) =>
          entry.member.name.toLowerCase().includes(query) ||
          entry.member.memberNumber.toLowerCase().includes(query) ||
          entry.serviceName.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((entry) => entry.status === statusFilter);
    }

    return result;
  }, [localEntries, searchQuery, statusFilter]);

  // Counts
  const counts = useMemo(() => {
    return {
      total: localEntries.length,
      waiting: localEntries.filter((e) => e.status === 'waiting').length,
      notified: localEntries.filter((e) => e.status === 'notified').length,
      converted: localEntries.filter((e) => e.status === 'converted').length,
    };
  }, [localEntries]);

  const handleNotify = async (entryId: string) => {
    if (onNotify) await onNotify(entryId);

    setLocalEntries((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              status: 'notified' as WaitlistStatus,
              notifiedAt: new Date(),
              expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
            }
          : entry
      )
    );
  };

  const handleConvert = (entryId: string) => {
    onConvert?.(entryId);

    setLocalEntries((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? { ...entry, status: 'converted' as WaitlistStatus }
          : entry
      )
    );
  };

  const handleRemove = async (entryId: string) => {
    if (onRemove) await onRemove(entryId);

    setLocalEntries((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? { ...entry, status: 'cancelled' as WaitlistStatus }
          : entry
      )
    );
  };

  const filterOptions: { value: FilterStatus; label: string; count?: number }[] = [
    { value: 'all', label: 'All', count: counts.total },
    { value: 'waiting', label: 'Waiting', count: counts.waiting },
    { value: 'notified', label: 'Notified', count: counts.notified },
    { value: 'converted', label: 'Converted', count: counts.converted },
    { value: 'expired', label: 'Expired' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card p-4 sm:p-6">
        {/* Title & Stats */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              Waitlist
            </h2>
            <p className="text-sm text-muted-foreground">
              {counts.waiting} waiting • {counts.notified} notified
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{counts.total}</span>
              <span className="text-muted-foreground">total</span>
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col gap-3 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member or service..."
              className={cn(
                'h-10 w-full rounded-lg border border-border bg-background pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground',
                'focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20'
              )}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className={cn(
                'flex h-10 items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm transition-colors',
                'hover:bg-muted',
                statusFilter !== 'all' && 'border-amber-500 bg-amber-50 dark:bg-amber-500/10'
              )}
            >
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">
                {filterOptions.find((o) => o.value === statusFilter)?.label}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-border bg-card py-1 shadow-lg">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(option.value);
                      setShowFilterDropdown(false);
                    }}
                    className={cn(
                      'flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-muted',
                      statusFilter === option.value && 'bg-muted'
                    )}
                  >
                    <span className="text-foreground">{option.label}</span>
                    {option.count !== undefined && (
                      <span className="text-muted-foreground">{option.count}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {filteredEntries.length > 0 ? (
          <div className="space-y-3">
            {filteredEntries.map((entry) => (
              <WaitlistCard
                key={entry.id}
                entry={entry}
                onNotify={() => handleNotify(entry.id)}
                onConvert={() => handleConvert(entry.id)}
                onRemove={() => handleRemove(entry.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No waitlist entries
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Members will appear here when they join a waitlist'}
            </p>
          </div>
        )}
      </div>

      {/* Footer Legend */}
      <div className="shrink-0 border-t border-border bg-muted/30 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            <span>Waiting for availability</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span>Notified (awaiting response)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Converted to booking</span>
          </div>
        </div>
      </div>
    </div>
  );
}
