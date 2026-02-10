'use client';

import { useState, useMemo, useCallback, useTransition } from 'react';
import { cn } from '@clubvantage/ui';
import { Button } from '@clubvantage/ui/primitives/button';
import { Input } from '@clubvantage/ui/primitives/input';
import { Label } from '@clubvantage/ui/primitives/label';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@clubvantage/ui/primitives/sheet';
import {
  Calendar,
  Clock,
  User,
  Sparkles,
  Search,
  Loader2,
  Check,
  X,
  Building2,
  Briefcase,
  ChevronDown,
  Plus,
} from 'lucide-react';
import {
  useCreateBookingMutation,
  useGetServicesQuery,
  useGetBookingStaffQuery,
} from '@clubvantage/api-client';
import { useQueryClient } from '@tanstack/react-query';
import { searchMembers } from '@/app/(dashboard)/bookings/actions';
import type { BookingSheetPrefill } from '../booking-provider';

// ============================================================================
// TYPES
// ============================================================================

interface MemberResult {
  id: string;
  name: string;
  memberNumber: string;
  membershipType?: string;
  status: 'active' | 'suspended' | 'lapsed';
}

export interface BookingCreationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilled: BookingSheetPrefill;
  onSuccess?: (bookingId: string) => void;
}

// ============================================================================
// HELPERS
// ============================================================================

function formatTime12Hour(time24: string): string {
  const parts = time24.split(':').map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return minutes === 0
    ? `${hour12} ${period}`
    : `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function buildISODateTime(date: Date, time: string): string {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return d.toISOString();
}

// ============================================================================
// COMPONENT
// ============================================================================

export function BookingCreationSheet({
  open,
  onOpenChange,
  prefilled,
  onSuccess,
}: BookingCreationSheetProps) {
  const queryClient = useQueryClient();

  // Member search state
  const [memberQuery, setMemberQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<MemberResult | null>(null);
  const [searchResults, setSearchResults] = useState<MemberResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Optional add-ons state
  const [addedServiceId, setAddedServiceId] = useState<string | null>(null);
  const [addedServiceName, setAddedServiceName] = useState<string | null>(null);
  const [addedStaffId, setAddedStaffId] = useState<string | null>(null);
  const [addedStaffName, setAddedStaffName] = useState<string | null>(null);
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [showStaffPicker, setShowStaffPicker] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');

  // Notes
  const [notes, setNotes] = useState('');

  // Fetch services/staff only when their pickers are open
  const { data: servicesData } = useGetServicesQuery(undefined, { enabled: showServicePicker });
  const { data: staffData } = useGetBookingStaffQuery(undefined, { enabled: showStaffPicker });

  // Filtered services
  const filteredServices = useMemo(() => {
    if (!servicesData?.services) return [];
    let list = servicesData.services.filter((s) => s.isActive);
    if (serviceSearch) {
      const q = serviceSearch.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
    }
    return list.slice(0, 8);
  }, [servicesData, serviceSearch]);

  // Filtered staff
  const filteredStaff = useMemo(() => {
    if (!staffData?.bookingStaff) return [];
    let list = staffData.bookingStaff.filter((s) => s.isActive);
    if (staffSearch) {
      const q = staffSearch.toLowerCase();
      list = list.filter(
        (s) => s.firstName.toLowerCase().includes(q) || s.lastName.toLowerCase().includes(q)
      );
    }
    return list.slice(0, 6);
  }, [staffData, staffSearch]);

  // Submission
  const [isPending, startTransition] = useTransition();
  const createBooking = useCreateBookingMutation();

  const isSubmitting = createBooking.isPending || isPending;

  // Resolved IDs (prefilled or user-added)
  const resolvedServiceId = prefilled.serviceId ?? addedServiceId ?? undefined;
  const resolvedStaffId = prefilled.staffId ?? addedStaffId ?? undefined;

  // Determine booking type
  const bookingType = resolvedServiceId ? 'SERVICE' : 'FACILITY';

  const canSubmit = useMemo(() => {
    if (!selectedMember) return false;
    if (!prefilled.startTime) return false;
    // Need either a facility or a service
    if (!prefilled.facilityId && !resolvedServiceId) return false;
    return true;
  }, [selectedMember, prefilled, resolvedServiceId]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleMemberSearch = useCallback(async (query: string) => {
    setMemberQuery(query);

    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      const results = await searchMembers(query);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSelectMember = useCallback((member: MemberResult) => {
    setSelectedMember(member);
    setMemberQuery(member.name);
    setShowSearchResults(false);
  }, []);

  const handleClearMember = useCallback(() => {
    setSelectedMember(null);
    setMemberQuery('');
    setSearchResults([]);
  }, []);

  const resetState = useCallback(() => {
    setSelectedMember(null);
    setMemberQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setAddedServiceId(null);
    setAddedServiceName(null);
    setAddedStaffId(null);
    setAddedStaffName(null);
    setShowServicePicker(false);
    setShowStaffPicker(false);
    setServiceSearch('');
    setStaffSearch('');
    setNotes('');
  }, []);

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        resetState();
      }
      onOpenChange(isOpen);
    },
    [onOpenChange, resetState]
  );

  const handleSubmit = useCallback(() => {
    if (!selectedMember || !prefilled.startTime || !prefilled.date) return;

    // Calculate end time (default 60 min if no endTime given)
    const endTime =
      prefilled.endTime ??
      (() => {
        const [h, m] = (prefilled.startTime ?? '09:00').split(':').map(Number);
        const total = (h ?? 0) * 60 + (m ?? 0) + 60;
        return `${Math.floor(total / 60)
          .toString()
          .padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
      })();

    startTransition(() => {
      createBooking.mutate(
        {
          input: {
            bookingType,
            memberId: selectedMember.id,
            startTime: buildISODateTime(prefilled.date!, prefilled.startTime!),
            endTime: buildISODateTime(prefilled.date!, endTime),
            facilityId: prefilled.facilityId ?? undefined,
            serviceId: resolvedServiceId,
            staffId: resolvedStaffId,
            notes: notes.trim() || undefined,
          },
        },
        {
          onSuccess: (data) => {
            if (data.createBooking.success) {
              queryClient.invalidateQueries({ queryKey: ['GetCalendarDay'] });
              queryClient.invalidateQueries({ queryKey: ['GetBookings'] });
              onSuccess?.(data.createBooking.booking?.id ?? '');
              handleOpenChange(false);
            }
          },
        }
      );
    });
  }, [
    selectedMember,
    prefilled,
    notes,
    bookingType,
    resolvedServiceId,
    resolvedStaffId,
    createBooking,
    queryClient,
    onSuccess,
    handleOpenChange,
  ]);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="flex w-[400px] flex-col p-0 sm:max-w-md">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-stone-200 px-4 py-3 dark:border-stone-700">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <SheetTitle className="text-base font-semibold text-stone-900 dark:text-stone-50">
            New Booking
          </SheetTitle>
        </div>
        <SheetDescription className="sr-only">
          Create a new booking with the pre-filled context
        </SheetDescription>

        {/* Context Banner */}
        <div className="bg-amber-50/50 px-4 py-2.5 dark:bg-amber-500/10">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600 dark:text-stone-400">
            {prefilled.date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(prefilled.date)}
              </span>
            )}
            {prefilled.startTime && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime12Hour(prefilled.startTime)}
                {prefilled.endTime && ` – ${formatTime12Hour(prefilled.endTime)}`}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            {prefilled.facilityName && (
              <span className="flex items-center gap-1 text-xs font-medium text-stone-700 dark:text-stone-300">
                <Building2 className="h-3 w-3" />
                {prefilled.facilityName}
              </span>
            )}
            {prefilled.serviceName && (
              <span className="flex items-center gap-1 text-xs font-medium text-stone-700 dark:text-stone-300">
                <Briefcase className="h-3 w-3" />
                {prefilled.serviceName}
              </span>
            )}
            {prefilled.staffName && (
              <span className="flex items-center gap-1 text-xs font-medium text-stone-700 dark:text-stone-300">
                <User className="h-3 w-3" />
                {prefilled.staffName}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-4">
            {/* Member Search */}
            <div className="space-y-1.5">
              <Label htmlFor="booking-member-search" className="text-xs font-medium">
                Member *
              </Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
                <Input
                  id="booking-member-search"
                  type="text"
                  placeholder="Search by name or member #..."
                  value={memberQuery}
                  onChange={(e) => handleMemberSearch(e.target.value)}
                  onFocus={() => memberQuery.length >= 2 && setShowSearchResults(true)}
                  className={cn(
                    'h-9 pl-8 pr-8 text-sm',
                    selectedMember &&
                      'border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-900/20'
                  )}
                />
                {isSearching && (
                  <Loader2 className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-stone-400" />
                )}
                {selectedMember && !isSearching && (
                  <button
                    type="button"
                    onClick={handleClearMember}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-stone-400 hover:bg-stone-200 hover:text-stone-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && !selectedMember && (
                  <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-auto rounded-md border border-stone-200 bg-white shadow-lg dark:border-stone-700 dark:bg-stone-900">
                    {searchResults.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => handleSelectMember(member)}
                        disabled={member.status === 'suspended'}
                        className={cn(
                          'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                          'hover:bg-stone-50 dark:hover:bg-stone-800',
                          member.status === 'suspended' && 'cursor-not-allowed opacity-50'
                        )}
                      >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                          {member.name.charAt(0)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="truncate font-medium text-stone-900 dark:text-stone-100">
                            {member.name}
                          </p>
                          <p className="truncate text-xs text-stone-500">
                            {member.memberNumber}
                            {member.membershipType && ` · ${member.membershipType}`}
                          </p>
                        </div>
                        {member.status === 'suspended' && (
                          <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-600">
                            Suspended
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {showSearchResults &&
                  memberQuery.length >= 2 &&
                  searchResults.length === 0 &&
                  !isSearching && (
                    <div className="absolute left-0 right-0 top-full z-10 mt-1 rounded-md border border-stone-200 bg-white p-3 text-center text-sm text-stone-500 shadow-lg dark:border-stone-700 dark:bg-stone-900">
                      No members found
                    </div>
                  )}
              </div>
              {selectedMember && (
                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <Check className="h-3 w-3" />
                  <span>{selectedMember.memberNumber}</span>
                  {selectedMember.membershipType && (
                    <>
                      <span className="text-stone-400">·</span>
                      <span>{selectedMember.membershipType}</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Selections Summary */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Booking Details</Label>
              <div className="rounded-lg border border-stone-200 bg-stone-50/50 dark:border-stone-700 dark:bg-stone-800/50">
                {prefilled.facilityName && (
                  <SummaryRow
                    icon={<Building2 className="h-3.5 w-3.5" />}
                    label="Facility"
                    value={prefilled.facilityName}
                  />
                )}
                {(prefilled.serviceName || addedServiceName) && (
                  <SummaryRow
                    icon={<Briefcase className="h-3.5 w-3.5" />}
                    label="Service"
                    value={prefilled.serviceName || addedServiceName!}
                    onClear={addedServiceId ? () => { setAddedServiceId(null); setAddedServiceName(null); } : undefined}
                  />
                )}
                {(prefilled.staffName || addedStaffName) && (
                  <SummaryRow
                    icon={<User className="h-3.5 w-3.5" />}
                    label="Staff"
                    value={prefilled.staffName || addedStaffName!}
                    onClear={addedStaffId ? () => { setAddedStaffId(null); setAddedStaffName(null); } : undefined}
                  />
                )}
                {prefilled.date && (
                  <SummaryRow
                    icon={<Calendar className="h-3.5 w-3.5" />}
                    label="Date"
                    value={formatDate(prefilled.date)}
                  />
                )}
                {prefilled.startTime && (
                  <SummaryRow
                    icon={<Clock className="h-3.5 w-3.5" />}
                    label="Time"
                    value={
                      prefilled.endTime
                        ? `${formatTime12Hour(prefilled.startTime)} – ${formatTime12Hour(prefilled.endTime)}`
                        : formatTime12Hour(prefilled.startTime)
                    }
                    isLast={!prefilled.facilityName && !prefilled.serviceName && !prefilled.staffName}
                  />
                )}
              </div>
            </div>

            {/* Optional: Add Service (when not prefilled) */}
            {!prefilled.serviceId && !addedServiceId && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowServicePicker((v) => !v)}
                  className="flex w-full items-center gap-2 rounded-lg border border-dashed border-stone-300 px-3 py-2 text-xs font-medium text-stone-600 transition-colors hover:border-amber-400 hover:text-amber-600 dark:border-stone-600 dark:text-stone-400 dark:hover:border-amber-500 dark:hover:text-amber-400"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Service
                  <ChevronDown className={cn('ml-auto h-3.5 w-3.5 transition-transform', showServicePicker && 'rotate-180')} />
                </button>
                {showServicePicker && (
                  <div className="mt-2 space-y-2">
                    <Input
                      placeholder="Search services..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <div className="max-h-36 overflow-auto rounded-md border border-stone-200 dark:border-stone-700">
                      {filteredServices.length === 0 ? (
                        <p className="p-2 text-center text-xs text-stone-400">No services found</p>
                      ) : (
                        filteredServices.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setAddedServiceId(s.id);
                              setAddedServiceName(s.name);
                              setShowServicePicker(false);
                              setServiceSearch('');
                            }}
                            className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs transition-colors hover:bg-stone-50 dark:hover:bg-stone-800"
                          >
                            <div>
                              <span className="font-medium text-stone-900 dark:text-stone-100">{s.name}</span>
                              <span className="ml-1.5 text-stone-400">{s.category}</span>
                            </div>
                            <span className="text-stone-500">{s.durationMinutes}min</span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Optional: Add Staff (when not prefilled) */}
            {!prefilled.staffId && !addedStaffId && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowStaffPicker((v) => !v)}
                  className="flex w-full items-center gap-2 rounded-lg border border-dashed border-stone-300 px-3 py-2 text-xs font-medium text-stone-600 transition-colors hover:border-amber-400 hover:text-amber-600 dark:border-stone-600 dark:text-stone-400 dark:hover:border-amber-500 dark:hover:text-amber-400"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Staff
                  <ChevronDown className={cn('ml-auto h-3.5 w-3.5 transition-transform', showStaffPicker && 'rotate-180')} />
                </button>
                {showStaffPicker && (
                  <div className="mt-2 space-y-2">
                    <Input
                      placeholder="Search staff..."
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <div className="max-h-36 overflow-auto rounded-md border border-stone-200 dark:border-stone-700">
                      {filteredStaff.length === 0 ? (
                        <p className="p-2 text-center text-xs text-stone-400">No staff found</p>
                      ) : (
                        filteredStaff.map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => {
                              setAddedStaffId(s.id);
                              setAddedStaffName(`${s.firstName} ${s.lastName}`);
                              setShowStaffPicker(false);
                              setStaffSearch('');
                            }}
                            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-stone-50 dark:hover:bg-stone-800"
                          >
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[10px] font-medium text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                              {s.firstName.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <span className="font-medium text-stone-900 dark:text-stone-100">
                                {s.firstName} {s.lastName}
                              </span>
                              {s.role && <span className="ml-1.5 text-stone-400">{s.role}</span>}
                            </div>
                            {s.capabilities && s.capabilities.length > 0 && (
                              <span className="text-stone-400">{s.capabilities.slice(0, 2).join(', ')}</span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="booking-notes" className="text-xs font-medium">
                Notes
              </Label>
              <textarea
                id="booking-notes"
                placeholder="Optional booking notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[60px] w-full resize-none rounded-md border border-stone-200 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/40 dark:border-stone-700"
                rows={2}
              />
            </div>

            {/* Error */}
            {createBooking.isError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                Failed to create booking. Please try again.
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 border-t border-stone-200 px-4 py-3 dark:border-stone-700">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Booking'
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function SummaryRow({
  icon,
  label,
  value,
  isLast,
  onClear,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  isLast?: boolean;
  onClear?: () => void;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 px-3 py-2',
        !isLast && 'border-b border-stone-200 dark:border-stone-700'
      )}
    >
      <span className="text-stone-400">{icon}</span>
      <span className="w-14 shrink-0 text-xs text-stone-500">{label}</span>
      <span className="flex-1 truncate text-sm font-medium text-stone-900 dark:text-stone-100">
        {value}
      </span>
      {onClear && (
        <button
          type="button"
          onClick={onClear}
          className="shrink-0 rounded-full p-0.5 text-stone-400 hover:bg-stone-200 hover:text-stone-600"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
