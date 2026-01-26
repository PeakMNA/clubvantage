'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { cn, Button, Badge } from '@clubvantage/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@clubvantage/ui';
import {
  Search,
  X,
  QrCode,
  Clock,
  MapPin,
  Sparkles,
  Building2,
  Check,
  ChevronDown,
  AlertTriangle,
} from 'lucide-react';

// Types
type CheckInStatus = 'upcoming' | 'past_grace' | 'checked_in';

interface MemberInfo {
  id: string;
  name: string;
  photoUrl?: string;
  memberNumber: string;
}

interface CheckInBooking {
  id: string;
  time: string;
  serviceName: string;
  serviceType: 'service' | 'facility';
  member: MemberInfo;
  facilityName: string;
  status: CheckInStatus;
  minutesLate?: number;
  checkedInAt?: string;
  outletId?: string;
}

interface Outlet {
  id: string;
  name: string;
}

export interface CheckInInterfaceProps {
  bookings?: CheckInBooking[];
  outlets?: Outlet[];
  defaultOutletId?: string;
  onCheckIn?: (bookingId: string, outletId: string) => Promise<void>;
  onQrScan?: () => void;
  className?: string;
}

// Mock data
const mockOutlets: Outlet[] = [
  { id: 'outlet-1', name: 'Main Clubhouse' },
  { id: 'outlet-2', name: 'Spa & Wellness' },
  { id: 'outlet-3', name: 'Sports Complex' },
];

const mockBookings: CheckInBooking[] = [
  {
    id: 'b1',
    time: '9:00 AM',
    serviceName: 'Thai Massage',
    serviceType: 'service',
    member: { id: 'm1', name: 'Somchai Prasert', memberNumber: 'CV-2024-0001' },
    facilityName: 'Spa Room 1',
    status: 'checked_in',
    checkedInAt: '9:02 AM',
  },
  {
    id: 'b2',
    time: '9:30 AM',
    serviceName: 'Tennis Court',
    serviceType: 'facility',
    member: { id: 'm2', name: 'Nattaya Wongchai', memberNumber: 'CV-2024-0042' },
    facilityName: 'Court 3',
    status: 'past_grace',
    minutesLate: 8,
  },
  {
    id: 'b3',
    time: '10:00 AM',
    serviceName: 'Swedish Massage',
    serviceType: 'service',
    member: { id: 'm3', name: 'Wichai Thongkam', memberNumber: 'CV-2023-0188' },
    facilityName: 'Spa Room 2',
    status: 'upcoming',
  },
  {
    id: 'b4',
    time: '10:30 AM',
    serviceName: 'Yoga Class',
    serviceType: 'service',
    member: { id: 'm4', name: 'Apinya Srisuk', memberNumber: 'CV-2024-0156' },
    facilityName: 'Yoga Studio',
    status: 'upcoming',
  },
  {
    id: 'b5',
    time: '11:00 AM',
    serviceName: 'Badminton Court',
    serviceType: 'facility',
    member: { id: 'm5', name: 'Tanawat Phanit', memberNumber: 'CV-2023-0099' },
    facilityName: 'Court 1',
    status: 'upcoming',
  },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

interface CheckInCardProps {
  booking: CheckInBooking;
  outlets: Outlet[];
  defaultOutletId?: string;
  onCheckIn: (outletId: string) => Promise<void>;
}

function CheckInCard({ booking, outlets, defaultOutletId, onCheckIn }: CheckInCardProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedOutletId, setSelectedOutletId] = useState(defaultOutletId || outlets[0]?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowConfirmation(false);
      }
    }

    if (showConfirmation) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showConfirmation]);

  const handleCheckInClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirm = async () => {
    if (!selectedOutletId) return;
    setIsSubmitting(true);
    try {
      await onCheckIn(selectedOutletId);
      setShowConfirmation(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCheckedIn = booking.status === 'checked_in';
  const isPastGrace = booking.status === 'past_grace';

  return (
    <div
      className={cn(
        'relative rounded-lg border p-4 transition-all',
        isCheckedIn
          ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10'
          : isPastGrace
            ? 'border-amber-300 bg-card dark:border-amber-500/50'
            : 'border-border bg-card'
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: Time & Service Info */}
        <div className="flex items-start gap-3">
          {/* Time */}
          <div
            className={cn(
              'flex h-12 w-16 shrink-0 flex-col items-center justify-center rounded-lg text-center sm:h-14 sm:w-20',
              isCheckedIn
                ? 'bg-emerald-100 dark:bg-emerald-500/20'
                : isPastGrace
                  ? 'bg-amber-100 dark:bg-amber-500/20'
                  : 'bg-muted'
            )}
          >
            <span
              className={cn(
                'text-sm font-bold sm:text-base',
                isCheckedIn
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : isPastGrace
                    ? 'text-amber-700 dark:text-amber-400'
                    : 'text-foreground'
              )}
            >
              {booking.time.split(' ')[0]}
            </span>
            <span
              className={cn(
                'text-[10px] uppercase sm:text-xs',
                isCheckedIn
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : isPastGrace
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-muted-foreground'
              )}
            >
              {booking.time.split(' ')[1]}
            </span>
          </div>

          {/* Service & Member Info */}
          <div className="min-w-0 flex-1">
            {/* Service Name */}
            <div className="mb-1 flex items-center gap-2">
              <div
                className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded',
                  isCheckedIn
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground'
                )}
              >
                {booking.serviceType === 'service' ? (
                  <Sparkles className="h-4 w-4" />
                ) : (
                  <Building2 className="h-4 w-4" />
                )}
              </div>
              <span className="truncate font-medium text-foreground">
                {booking.serviceName}
              </span>
            </div>

            {/* Member */}
            <div className="mb-1.5 flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={booking.member.photoUrl} alt={booking.member.name} />
                <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                  {getInitials(booking.member.name)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate text-sm text-foreground">
                {booking.member.name}
              </span>
              <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                {booking.member.memberNumber}
              </span>
            </div>

            {/* Facility */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{booking.facilityName}</span>
            </div>

            {/* Late indicator */}
            {isPastGrace && booking.minutesLate && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-3 w-3" />
                <span>{booking.minutesLate} min late</span>
              </div>
            )}

            {/* Checked in timestamp */}
            {isCheckedIn && booking.checkedInAt && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <Check className="h-3 w-3" />
                <span>Checked in at {booking.checkedInAt}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Check In Button */}
        <div className="relative shrink-0" ref={dropdownRef}>
          {isCheckedIn ? (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
              <Check className="mr-1 h-3 w-3" />
              Checked In
            </Badge>
          ) : (
            <>
              <Button
                size="sm"
                onClick={handleCheckInClick}
                className={cn(
                  'w-full sm:w-auto',
                  isPastGrace && 'ring-2 ring-amber-400/50'
                )}
              >
                Check In
              </Button>

              {/* Confirmation Dropdown */}
              {showConfirmation && (
                <div className="absolute right-0 top-full z-20 mt-2 w-64 rounded-lg border border-border bg-card p-3 shadow-lg">
                  <p className="mb-2 text-sm font-medium text-foreground">
                    Confirm outlet:
                  </p>

                  {/* Outlet Select */}
                  <div className="relative mb-3">
                    <select
                      value={selectedOutletId}
                      onChange={(e) => setSelectedOutletId(e.target.value)}
                      className={cn(
                        'h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 pr-8 text-sm text-foreground',
                        'focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20'
                      )}
                    >
                      {outlets.map((outlet) => (
                        <option key={outlet.id} value={outlet.id}>
                          {outlet.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>

                  {/* Confirm Button */}
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : 'Complete Check-in'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * CheckInInterface
 *
 * Dedicated interface for front desk staff to check in members for their bookings.
 */
export function CheckInInterface({
  bookings = mockBookings,
  outlets = mockOutlets,
  defaultOutletId,
  onCheckIn,
  onQrScan,
  className,
}: CheckInInterfaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [localBookings, setLocalBookings] = useState(bookings);
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filter bookings based on search
  const filteredBookings = useMemo(() => {
    if (!debouncedSearch) return localBookings;

    const query = debouncedSearch.toLowerCase();
    return localBookings.filter(
      (booking) =>
        booking.member.name.toLowerCase().includes(query) ||
        booking.member.memberNumber.toLowerCase().includes(query) ||
        booking.serviceName.toLowerCase().includes(query) ||
        booking.facilityName.toLowerCase().includes(query)
    );
  }, [localBookings, debouncedSearch]);

  // Count of today's bookings (excluding checked in)
  const pendingCount = localBookings.filter((b) => b.status !== 'checked_in').length;
  const totalCount = localBookings.length;

  const handleCheckIn = useCallback(
    async (bookingId: string, outletId: string) => {
      // Call external handler if provided
      if (onCheckIn) {
        await onCheckIn(bookingId, outletId);
      }

      // Update local state
      setLocalBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId
            ? {
                ...booking,
                status: 'checked_in' as CheckInStatus,
                checkedInAt: new Date().toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                }),
                outletId,
              }
            : booking
        )
      );
    },
    [onCheckIn]
  );

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header */}
      <div className="shrink-0 border-b border-border bg-card p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
            Check-In
          </h1>
          <button
            type="button"
            onClick={onQrScan}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors',
              'hover:bg-muted hover:text-foreground',
              'sm:h-11 sm:w-11'
            )}
            aria-label="Scan QR code"
          >
            <QrCode className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, or member #"
            className={cn(
              'h-12 w-full rounded-lg border border-border bg-background pl-12 pr-12 text-base text-foreground placeholder:text-muted-foreground',
              'focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20'
            )}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* Section Header */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              Today's Bookings{' '}
              <span className="font-normal text-muted-foreground">
                ({pendingCount} pending / {totalCount} total)
              </span>
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Sorted by time</span>
            </div>
          </div>

          {/* Booking Cards */}
          {filteredBookings.length > 0 ? (
            <div className="space-y-3">
              {filteredBookings.map((booking) => (
                <CheckInCard
                  key={booking.id}
                  booking={booking}
                  outlets={outlets}
                  defaultOutletId={defaultOutletId}
                  onCheckIn={(outletId) => handleCheckIn(booking.id, outletId)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">
                No bookings found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'No bookings scheduled for today'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="shrink-0 border-t border-border bg-muted/30 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">
                {localBookings.filter((b) => b.status === 'checked_in').length}
              </span>{' '}
              checked in
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">
                {localBookings.filter((b) => b.status === 'past_grace').length}
              </span>{' '}
              late
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-muted-foreground" />
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">
                {localBookings.filter((b) => b.status === 'upcoming').length}
              </span>{' '}
              upcoming
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
