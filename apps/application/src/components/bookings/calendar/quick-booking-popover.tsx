'use client';

import { useState, useMemo, useCallback } from 'react';
import { cn } from '@clubvantage/ui';
import { Button } from '@clubvantage/ui/primitives/button';
import { Input } from '@clubvantage/ui/primitives/input';
import { Label } from '@clubvantage/ui/primitives/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@clubvantage/ui/primitives/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@clubvantage/ui/primitives/select';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Sparkles,
  ChevronRight,
  Search,
  Loader2,
  Check,
  X,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface QuickBookingContext {
  date: Date;
  time: string; // "09:00", "09:30", etc.
  staffId?: string;
  staffName?: string;
  facilityId?: string;
  facilityName?: string;
  resourceType: 'staff' | 'facility' | 'service';
}

export interface QuickBookingMember {
  id: string;
  name: string;
  memberNumber: string;
  membershipType?: string;
  avatarUrl?: string;
  status: 'active' | 'suspended' | 'lapsed';
}

export interface QuickBookingService {
  id: string;
  name: string;
  duration: number;
  price: number;
  category?: string;
}

export interface QuickBookingResult {
  memberId: string;
  memberName: string;
  serviceId: string;
  serviceName: string;
  date: Date;
  time: string;
  staffId?: string;
  facilityId?: string;
  duration: number;
  price: number;
}

export interface QuickBookingPopoverProps {
  /** Pre-filled context from calendar slot click */
  context: QuickBookingContext;
  /** Available services to choose from */
  services: QuickBookingService[];
  /** Callback when quick booking is submitted */
  onSubmit: (result: QuickBookingResult) => void;
  /** Callback to open full booking wizard */
  onOpenFullWizard: () => void;
  /** Callback when popover is closed */
  onClose: () => void;
  /** Whether popover is open */
  open: boolean;
  /** Member search function */
  onSearchMembers?: (query: string) => Promise<QuickBookingMember[]>;
  /** Whether booking is being submitted */
  isSubmitting?: boolean;
  /** Trigger element (typically EmptySlot) */
  children: React.ReactNode;
  /** Side of the popover */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Alignment of the popover */
  align?: 'start' | 'center' | 'end';
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatTime12Hour(time24: string): string {
  const parts = time24.split(':').map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return minutes === 0 ? `${hour12} ${period}` : `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function calculateEndTime(startTime: string, durationMinutes: number): string {
  const parts = startTime.split(':').map(Number);
  const startMinutes = (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
  const endMinutes = startMinutes + durationMinutes;
  const endHours = Math.floor(endMinutes / 60) % 24;
  const endMins = endMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
}

// ============================================================================
// MOCK DATA (will be replaced with actual search)
// ============================================================================

const mockMembers: QuickBookingMember[] = [
  { id: 'm1', name: 'John Smith', memberNumber: 'M-001', membershipType: 'Gold', status: 'active' },
  { id: 'm2', name: 'Sarah Johnson', memberNumber: 'M-002', membershipType: 'Platinum', status: 'active' },
  { id: 'm3', name: 'Michael Chen', memberNumber: 'M-003', membershipType: 'Silver', status: 'active' },
  { id: 'm4', name: 'Emily Davis', memberNumber: 'M-004', membershipType: 'Gold', status: 'suspended' },
  { id: 'm5', name: 'Robert Wilson', memberNumber: 'M-005', membershipType: 'Diamond', status: 'active' },
];

// ============================================================================
// COMPONENT
// ============================================================================

export function QuickBookingPopover({
  context,
  services,
  onSubmit,
  onOpenFullWizard,
  onClose,
  open,
  onSearchMembers,
  isSubmitting = false,
  children,
  side = 'right',
  align = 'start',
}: QuickBookingPopoverProps) {
  // State
  const [memberQuery, setMemberQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<QuickBookingMember | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [searchResults, setSearchResults] = useState<QuickBookingMember[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Derived state
  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId),
    [services, selectedServiceId]
  );

  const endTime = useMemo(
    () => selectedService ? calculateEndTime(context.time, selectedService.duration) : null,
    [context.time, selectedService]
  );

  const canSubmit = selectedMember && selectedService && !isSubmitting;

  // Handlers
  const handleMemberSearch = useCallback(async (query: string) => {
    setMemberQuery(query);

    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    setShowSearchResults(true);

    try {
      if (onSearchMembers) {
        const results = await onSearchMembers(query);
        setSearchResults(results);
      } else {
        // Mock search
        await new Promise((resolve) => setTimeout(resolve, 300));
        const filtered = mockMembers.filter(
          (m) =>
            m.name.toLowerCase().includes(query.toLowerCase()) ||
            m.memberNumber.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filtered);
      }
    } finally {
      setIsSearching(false);
    }
  }, [onSearchMembers]);

  const handleSelectMember = useCallback((member: QuickBookingMember) => {
    setSelectedMember(member);
    setMemberQuery(member.name);
    setShowSearchResults(false);
  }, []);

  const handleClearMember = useCallback(() => {
    setSelectedMember(null);
    setMemberQuery('');
    setSearchResults([]);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!selectedMember || !selectedService) return;

    onSubmit({
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      date: context.date,
      time: context.time,
      staffId: context.staffId,
      facilityId: context.facilityId,
      duration: selectedService.duration,
      price: selectedService.price,
    });
  }, [selectedMember, selectedService, context, onSubmit]);

  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) {
      onClose();
      // Reset state when closing
      setSelectedMember(null);
      setSelectedServiceId('');
      setMemberQuery('');
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [onClose]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={8}
        className="w-80 p-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-700">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <h3 className="font-semibold text-stone-900 dark:text-stone-50">
              Quick Book
            </h3>
          </div>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Context Banner */}
        <div className="bg-amber-50/50 px-4 py-2 dark:bg-amber-500/10">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600 dark:text-stone-400">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(context.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime12Hour(context.time)}
              {endTime && ` – ${formatTime12Hour(endTime)}`}
            </span>
          </div>
          {(context.staffName || context.facilityName) && (
            <div className="mt-1 flex items-center gap-1 text-xs font-medium text-stone-700 dark:text-stone-300">
              {context.staffName && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {context.staffName}
                </span>
              )}
              {context.staffName && context.facilityName && (
                <span className="text-stone-400">•</span>
              )}
              {context.facilityName && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {context.facilityName}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Form */}
        <div className="space-y-4 p-4">
          {/* Member Search */}
          <div className="space-y-1.5">
            <Label htmlFor="member-search" className="text-xs font-medium">
              Member
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
              <Input
                id="member-search"
                type="text"
                placeholder="Search by name or ID..."
                value={memberQuery}
                onChange={(e) => handleMemberSearch(e.target.value)}
                onFocus={() => memberQuery && setShowSearchResults(true)}
                className={cn(
                  'h-9 pl-8 pr-8 text-sm',
                  selectedMember && 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-900/20'
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
                <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-40 overflow-auto rounded-md border border-stone-200 bg-white shadow-lg dark:border-stone-700 dark:bg-stone-900">
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
                          {member.membershipType && ` • ${member.membershipType}`}
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

              {showSearchResults && memberQuery && searchResults.length === 0 && !isSearching && (
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
                    <span className="text-stone-400">•</span>
                    <span>{selectedMember.membershipType}</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Service Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="service-select" className="text-xs font-medium">
              Service
            </Label>
            <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
              <SelectTrigger id="service-select" className="h-9 text-sm">
                <SelectValue placeholder="Select a service..." />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    <div className="flex items-center justify-between gap-4">
                      <span>{service.name}</span>
                      <span className="text-xs text-stone-500">
                        {service.duration}min
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price Summary */}
          {selectedService && (
            <div className="rounded-lg bg-stone-50 p-3 dark:bg-stone-800/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                    {selectedService.name}
                  </p>
                  <p className="text-xs text-stone-500">
                    {selectedService.duration} minutes
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
                    {formatCurrency(selectedService.price)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-stone-200 px-4 py-3 dark:border-stone-700">
          <button
            type="button"
            onClick={onOpenFullWizard}
            className="flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
          >
            More options
            <ChevronRight className="h-3 w-3" />
          </button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Booking...
              </>
            ) : (
              'Book Now'
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * QuickBookingPopoverSkeleton
 *
 * Loading skeleton for the quick booking popover.
 */
export function QuickBookingPopoverSkeleton() {
  return (
    <div className="w-80 animate-pulse rounded-md border border-stone-200 bg-white p-4 shadow-md dark:border-stone-700 dark:bg-stone-900">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-4 w-4 rounded bg-stone-200 dark:bg-stone-700" />
        <div className="h-5 w-24 rounded bg-stone-200 dark:bg-stone-700" />
      </div>
      <div className="space-y-3">
        <div className="h-9 rounded bg-stone-100 dark:bg-stone-800" />
        <div className="h-9 rounded bg-stone-100 dark:bg-stone-800" />
        <div className="h-16 rounded bg-stone-100 dark:bg-stone-800" />
      </div>
      <div className="mt-4 flex justify-between">
        <div className="h-4 w-20 rounded bg-stone-200 dark:bg-stone-700" />
        <div className="h-8 w-24 rounded bg-stone-200 dark:bg-stone-700" />
      </div>
    </div>
  );
}
