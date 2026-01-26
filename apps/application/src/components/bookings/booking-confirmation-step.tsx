'use client';

import { useState, useMemo } from 'react';
import { cn, Button, Badge } from '@clubvantage/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@clubvantage/ui';
import {
  ArrowLeft,
  Search,
  X,
  Check,
  Sparkles,
  Building2,
  Calendar,
  Clock,
  User,
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { StepIndicator } from './create-booking-wizard';

// Types
interface MemberInfo {
  id: string;
  name: string;
  photoUrl?: string;
  memberNumber: string;
  status: 'active' | 'suspended';
  outstandingBalance?: number;
}

interface AddOnSummary {
  id: string;
  name: string;
  price: number;
}

interface BookingSummary {
  type: 'facility' | 'service';
  name: string;
  date: Date;
  time: string;
  duration: number;
  staffName?: string;
  facilityName?: string;
  addOns: AddOnSummary[];
  basePrice: number;
  timeBandModifier?: number;
  memberDiscount?: number;
}

export interface BookingConfirmationStepProps {
  isStaffFlow?: boolean;
  loggedInMember?: MemberInfo;
  selectedMember: MemberInfo | null;
  onMemberSearch?: (query: string) => void;
  onMemberSelect?: (member: MemberInfo) => void;
  onMemberClear?: () => void;
  searchResults?: MemberInfo[];
  bookingSummary: BookingSummary;
  onBack: () => void;
  onConfirm: () => Promise<string>; // Returns booking number on success
  className?: string;
}

// Mock data
const mockSearchResults: MemberInfo[] = [
  { id: 'm1', name: 'Somchai Prasert', memberNumber: 'CV-2024-0001', status: 'active' },
  { id: 'm2', name: 'Nattaya Wongchai', memberNumber: 'CV-2024-0042', status: 'active', outstandingBalance: 15000 },
  { id: 'm3', name: 'Wichai Thongkam', memberNumber: 'CV-2023-0188', status: 'suspended' },
];

const mockBookingSummary: BookingSummary = {
  type: 'service',
  name: 'Thai Massage',
  date: new Date(),
  time: '2:30 PM',
  duration: 90,
  staffName: 'Nattaya W.',
  facilityName: 'Spa Room 1',
  addOns: [
    { id: 'a1', name: 'Aromatherapy', price: 300 },
    { id: 'a2', name: 'Hot Stone', price: 500 },
  ],
  basePrice: 2000,
  timeBandModifier: 0,
  memberDiscount: 200,
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

type ConfirmationState = 'ready' | 'creating' | 'success' | 'error';

/**
 * BookingConfirmationStep
 *
 * Step 5 (final) of the booking wizard - confirm and create booking.
 */
export function BookingConfirmationStep({
  isStaffFlow = false,
  loggedInMember,
  selectedMember,
  onMemberSearch,
  onMemberSelect,
  onMemberClear,
  searchResults = mockSearchResults,
  bookingSummary = mockBookingSummary,
  onBack,
  onConfirm,
  className,
}: BookingConfirmationStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [policyExpanded, setPolicyExpanded] = useState(false);
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>('ready');
  const [bookingNumber, setBookingNumber] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calculate totals
  const totals = useMemo(() => {
    const addOnsTotal = bookingSummary.addOns.reduce((sum, addon) => sum + addon.price, 0);
    const subtotal = bookingSummary.basePrice + addOnsTotal + (bookingSummary.timeBandModifier || 0);
    const discount = bookingSummary.memberDiscount || 0;
    const total = subtotal - discount;

    return {
      addOnsTotal,
      subtotal,
      discount,
      total,
    };
  }, [bookingSummary]);

  // Determine the member to display
  const displayMember = isStaffFlow ? selectedMember : loggedInMember;
  const isMemberSuspended = displayMember?.status === 'suspended';
  const canConfirm = !isMemberSuspended && (isStaffFlow ? selectedMember !== null : true);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowSearchResults(value.length > 0);
    onMemberSearch?.(value);
  };

  const handleMemberSelect = (member: MemberInfo) => {
    onMemberSelect?.(member);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleConfirm = async () => {
    setConfirmationState('creating');
    setErrorMessage(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const number = await onConfirm();
      setBookingNumber(number || `BK-${Date.now().toString().slice(-8)}`);
      setConfirmationState('success');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create booking');
      setConfirmationState('error');
    }
  };

  const handleRetry = () => {
    setConfirmationState('ready');
    setErrorMessage(null);
  };

  // Success State View
  if (confirmationState === 'success') {
    return (
      <div className={cn('flex h-full flex-col', className)}>
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          {/* Success Animation */}
          <div className="relative mb-6">
            <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="h-10 w-10" />
            </div>
          </div>

          <h2 className="mb-2 text-2xl font-semibold text-foreground">
            Booking Confirmed!
          </h2>
          <p className="mb-6 text-muted-foreground">
            Your booking has been successfully created
          </p>

          {/* Booking Number */}
          <div className="mb-8 rounded-lg border border-emerald-200 bg-emerald-50 px-6 py-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Booking Reference
            </p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              {bookingNumber}
            </p>
          </div>

          {/* Quick Summary */}
          <div className="mb-8 w-full max-w-sm rounded-lg border border-border bg-card p-4 text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                {bookingSummary.type === 'service' ? (
                  <Sparkles className="h-5 w-5" />
                ) : (
                  <Building2 className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="font-medium text-foreground">{bookingSummary.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(bookingSummary.date)} at {bookingSummary.time}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={onBack}>
              Book Another
            </Button>
            <Button>View Booking</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header */}
      <div className="shrink-0 border-b border-border p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            disabled={confirmationState === 'creating'}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">
            Confirm your booking
          </h2>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep="confirm" className="mb-0" />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
          {/* Error Banner */}
          {confirmationState === 'error' && errorMessage && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
              <XCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              <div className="flex-1">
                <p className="font-medium text-red-700 dark:text-red-400">
                  Booking Failed
                </p>
                <p className="mt-0.5 text-sm text-red-600 dark:text-red-400/80">
                  {errorMessage}
                </p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="mt-2 text-sm font-medium text-red-700 underline hover:no-underline dark:text-red-400"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Suspended Member Banner */}
          {isMemberSuspended && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/30 dark:bg-red-500/10">
              <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-medium text-red-700 dark:text-red-400">
                  Member Account Suspended
                </p>
                <p className="mt-0.5 text-sm text-red-600 dark:text-red-400/80">
                  This member cannot make bookings until their account is restored.
                </p>
              </div>
            </div>
          )}

          {/* Member Section (Staff Flow) */}
          {isStaffFlow && (
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Member
              </h3>

              {/* Member Search */}
              {!selectedMember && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search member by name, email, or number"
                    className={cn(
                      'h-11 w-full rounded-lg border border-border bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground',
                      'focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20'
                    )}
                  />

                  {/* Search Results Dropdown */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-60 overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
                      {searchResults.map((member) => (
                        <button
                          key={member.id}
                          type="button"
                          onClick={() => handleMemberSelect(member)}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.photoUrl} alt={member.name} />
                            <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                              {member.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {member.memberNumber}
                            </p>
                          </div>
                          <Badge
                            className={cn(
                              'shrink-0 text-[10px]',
                              member.status === 'active'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                            )}
                          >
                            {member.status.toUpperCase()}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Selected Member Card */}
              {selectedMember && (
                <div
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3',
                    isMemberSuspended
                      ? 'border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10'
                      : 'border-border bg-muted/30'
                  )}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedMember.photoUrl} alt={selectedMember.name} />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {getInitials(selectedMember.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium text-foreground">
                        {selectedMember.name}
                      </p>
                      <Badge
                        className={cn(
                          'shrink-0 text-[10px]',
                          selectedMember.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                        )}
                      >
                        {selectedMember.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedMember.memberNumber}
                    </p>
                    {selectedMember.outstandingBalance && selectedMember.outstandingBalance > 0 && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="h-3 w-3" />
                        {formatCurrency(selectedMember.outstandingBalance)} outstanding
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onMemberClear}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Clear member"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Member Section (Member Flow) */}
          {!isStaffFlow && loggedInMember && (
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="mb-3 text-sm font-semibold text-foreground">
                Booking for
              </h3>
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={loggedInMember.photoUrl} alt={loggedInMember.name} />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {getInitials(loggedInMember.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{loggedInMember.name}</p>
                  <p className="text-sm text-muted-foreground">{loggedInMember.memberNumber}</p>
                </div>
              </div>
            </div>
          )}

          {/* Booking Summary Card */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Booking Summary
            </h3>

            <div className="space-y-3">
              {/* Service/Facility */}
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                  {bookingSummary.type === 'service' ? (
                    <Sparkles className="h-5 w-5" />
                  ) : (
                    <Building2 className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{bookingSummary.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {bookingSummary.type}
                  </p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {formatDate(bookingSummary.date)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {bookingSummary.time}
                  </p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {bookingSummary.duration} minutes
                  </p>
                  <p className="text-sm text-muted-foreground">Duration</p>
                </div>
              </div>

              {/* Staff */}
              {bookingSummary.staffName && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {bookingSummary.staffName}
                    </p>
                    <p className="text-sm text-muted-foreground">Therapist</p>
                  </div>
                </div>
              )}

              {/* Location */}
              {bookingSummary.facilityName && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {bookingSummary.facilityName}
                    </p>
                    <p className="text-sm text-muted-foreground">Location</p>
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {bookingSummary.addOns.length > 0 && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="mb-2 text-sm font-medium text-foreground">Add-ons</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {bookingSummary.addOns.map((addon) => (
                      <li key={addon.id} className="flex items-center gap-2">
                        <Check className="h-3 w-3 text-emerald-500" />
                        <span>{addon.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="mb-4 text-sm font-semibold text-foreground">
              Price Breakdown
            </h3>

            <div className="space-y-2 text-sm">
              {/* Base Price */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Base price</span>
                <span className="text-foreground">
                  {formatCurrency(bookingSummary.basePrice)}
                </span>
              </div>

              {/* Add-ons */}
              {bookingSummary.addOns.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{addon.name}</span>
                  <span className="text-foreground">{formatCurrency(addon.price)}</span>
                </div>
              ))}

              {/* Time Band Modifier */}
              {bookingSummary.timeBandModifier !== undefined && bookingSummary.timeBandModifier !== 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    {bookingSummary.timeBandModifier > 0 ? 'Peak hour surcharge' : 'Off-peak discount'}
                  </span>
                  <span className={bookingSummary.timeBandModifier < 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}>
                    {bookingSummary.timeBandModifier > 0 ? '+' : ''}
                    {formatCurrency(bookingSummary.timeBandModifier)}
                  </span>
                </div>
              )}

              {/* Member Discount */}
              {totals.discount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Member discount</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    -{formatCurrency(totals.discount)}
                  </span>
                </div>
              )}

              {/* Divider */}
              <div className="my-3 border-t border-border" />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-foreground">Total</span>
                <span className="text-xl font-bold text-foreground">
                  {formatCurrency(totals.total)}
                </span>
              </div>
            </div>

            {/* Price Guarantee Note */}
            <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Price guaranteed for 5 minutes
            </p>
          </div>

          {/* Cancellation Policy */}
          <div className="rounded-lg border border-border bg-card">
            <button
              type="button"
              onClick={() => setPolicyExpanded(!policyExpanded)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <span className="text-sm font-semibold text-foreground">
                Cancellation Policy
              </span>
              {policyExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {policyExpanded && (
              <div className="border-t border-border px-4 pb-4">
                <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-start gap-2">
                    <span className="shrink-0 font-medium text-foreground">• 24+ hours:</span>
                    Full refund
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="shrink-0 font-medium text-foreground">• 12-24 hours:</span>
                    50% refund
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="shrink-0 font-medium text-foreground">• Under 12 hours:</span>
                    No refund
                  </p>
                  <p className="mt-3 text-xs italic">
                    No-shows will be charged the full booking amount.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border bg-card p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            disabled={confirmationState === 'creating'}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            Back
          </button>
          <Button
            onClick={handleConfirm}
            disabled={!canConfirm || confirmationState === 'creating'}
            className="min-w-[160px]"
          >
            {confirmationState === 'creating' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating booking...
              </>
            ) : (
              'Confirm Booking'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
