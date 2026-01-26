'use client';

import { useState, useMemo } from 'react';
import { cn, Button, Badge } from '@clubvantage/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@clubvantage/ui';
import {
  ArrowLeft,
  Search,
  X,
  Clock,
  Check,
  Star,
  UserCheck,
  Coffee,
  Palmtree,
  Calendar,
} from 'lucide-react';
import { StepIndicator, getWizardSteps } from './create-booking-wizard';

// Types
type StaffStatus = 'available' | 'busy' | 'off_duty' | 'on_leave';
type StaffRole = 'therapist' | 'trainer' | 'instructor' | 'coach';

export interface StaffSchedule {
  workHours: { start: string; end: string }; // e.g. "09:00" - "18:00"
  bookingsToday: number;
  totalSlotsToday: number;
  nextAvailableSlot?: string; // "Today at 2:00 PM"
}

export interface BookingStaff {
  id: string;
  name: string;
  photoUrl?: string;
  role: StaffRole;
  status: StaffStatus;
  capabilities: string[];
  rating?: number;
  defaultFacilityId?: string;
  schedule?: StaffSchedule;
}

export interface BookingStaffStepProps {
  staff?: BookingStaff[];
  selectedId: string | null;
  onSelect: (staff: BookingStaff) => void;
  onBack: () => void;
  onNext: () => void;
  className?: string;
}

const roleConfig: Record<StaffRole, { label: string; color: string }> = {
  therapist: { label: 'Therapist', color: 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400' },
  trainer: { label: 'Trainer', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
  instructor: { label: 'Instructor', color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' },
  coach: { label: 'Coach', color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
};

const statusConfig: Record<StaffStatus, { label: string; bg: string; text: string; icon: typeof UserCheck }> = {
  available: {
    label: 'Available',
    bg: 'bg-emerald-100 dark:bg-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: UserCheck,
  },
  busy: {
    label: 'In Session',
    bg: 'bg-amber-100 dark:bg-amber-500/20',
    text: 'text-amber-700 dark:text-amber-400',
    icon: Clock,
  },
  off_duty: {
    label: 'Off Duty',
    bg: 'bg-muted',
    text: 'text-muted-foreground',
    icon: Coffee,
  },
  on_leave: {
    label: 'On Leave',
    bg: 'bg-blue-100 dark:bg-blue-500/20',
    text: 'text-blue-700 dark:text-blue-400',
    icon: Palmtree,
  },
};

// Mock data
const mockStaff: BookingStaff[] = [
  {
    id: 'st1',
    name: 'Nattaya Wongchai',
    role: 'therapist',
    status: 'available',
    capabilities: ['Thai Massage', 'Swedish Massage', 'Hot Stone Therapy', 'Aromatherapy'],
    rating: 4.9,
    defaultFacilityId: 'f5',
    schedule: {
      workHours: { start: '09:00', end: '18:00' },
      bookingsToday: 4,
      totalSlotsToday: 8,
      nextAvailableSlot: 'Today at 2:00 PM',
    },
  },
  {
    id: 'st2',
    name: 'Somchai Prasert',
    role: 'therapist',
    status: 'busy',
    capabilities: ['Thai Massage', 'Hot Stone Therapy', 'Deep Tissue'],
    rating: 4.7,
    defaultFacilityId: 'f5',
    schedule: {
      workHours: { start: '10:00', end: '19:00' },
      bookingsToday: 6,
      totalSlotsToday: 8,
      nextAvailableSlot: 'Today at 4:30 PM',
    },
  },
  {
    id: 'st3',
    name: 'Apinya Srisuk',
    role: 'therapist',
    status: 'off_duty',
    capabilities: ['Swedish Massage', 'Facial Treatment', 'Aromatherapy'],
    rating: 4.8,
    schedule: {
      workHours: { start: '09:00', end: '17:00' },
      bookingsToday: 0,
      totalSlotsToday: 0,
    },
  },
  {
    id: 'st4',
    name: 'Wichai Thongkam',
    role: 'trainer',
    status: 'available',
    capabilities: ['Personal Training', 'Strength Training', 'HIIT'],
    rating: 4.6,
    schedule: {
      workHours: { start: '06:00', end: '14:00' },
      bookingsToday: 2,
      totalSlotsToday: 8,
      nextAvailableSlot: 'Available now',
    },
  },
  {
    id: 'st5',
    name: 'Tanawat Phanit',
    role: 'instructor',
    status: 'busy',
    capabilities: ['Yoga Class', 'Pilates Class', 'Meditation Session'],
    rating: 4.9,
    defaultFacilityId: 'f7',
    schedule: {
      workHours: { start: '07:00', end: '15:00' },
      bookingsToday: 5,
      totalSlotsToday: 6,
      nextAvailableSlot: 'Today at 1:00 PM',
    },
  },
  {
    id: 'st6',
    name: 'Preecha Kamol',
    role: 'coach',
    status: 'available',
    capabilities: ['Tennis Lesson (Private)', 'Tennis Lesson (Group)'],
    rating: 4.8,
    defaultFacilityId: 'f1',
    schedule: {
      workHours: { start: '08:00', end: '18:00' },
      bookingsToday: 3,
      totalSlotsToday: 10,
      nextAvailableSlot: 'Available now',
    },
  },
  {
    id: 'st7',
    name: 'Kulap Intira',
    role: 'instructor',
    status: 'on_leave',
    capabilities: ['Swimming Lesson', 'Aqua Aerobics'],
    rating: 4.5,
    defaultFacilityId: 'f8',
    schedule: {
      workHours: { start: '09:00', end: '17:00' },
      bookingsToday: 0,
      totalSlotsToday: 0,
    },
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

function formatTime24to12(time24: string): string {
  const parts = time24.split(':').map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return minutes === 0 ? `${hour12}${period}` : `${hour12}:${minutes.toString().padStart(2, '0')}${period}`;
}

type FilterRole = 'all' | StaffRole;

interface StaffCardProps {
  staff: BookingStaff;
  isSelected: boolean;
  onSelect: () => void;
}

function StaffCard({ staff, isSelected, onSelect }: StaffCardProps) {
  const roleStyle = roleConfig[staff.role];
  const statusStyle = statusConfig[staff.status];
  const StatusIcon = statusStyle.icon;
  const isAvailable = staff.status === 'available';
  const schedule = staff.schedule;

  // Calculate utilization percentage for progress bar
  const utilizationPercent = schedule && schedule.totalSlotsToday > 0
    ? Math.round((schedule.bookingsToday / schedule.totalSlotsToday) * 100)
    : 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!isAvailable}
      className={cn(
        'group relative flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all duration-200 sm:p-4',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
        isSelected
          ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500 dark:bg-amber-500/10'
          : !isAvailable
            ? 'cursor-not-allowed border-border bg-muted/30 opacity-60'
            : 'border-border bg-card hover:bg-muted/50'
      )}
    >
      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src={staff.photoUrl} alt={staff.name} />
          <AvatarFallback className="bg-muted text-muted-foreground">
            {getInitials(staff.name)}
          </AvatarFallback>
        </Avatar>
        {/* Status Indicator */}
        <span
          className={cn(
            'absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-card',
            staff.status === 'available' && 'bg-emerald-500',
            staff.status === 'busy' && 'bg-amber-500',
            staff.status === 'off_duty' && 'bg-muted-foreground',
            staff.status === 'on_leave' && 'bg-blue-500'
          )}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Name & Rating */}
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              'truncate text-sm font-medium sm:text-base',
              isSelected
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-foreground'
            )}
          >
            {staff.name}
          </h3>
          {staff.rating && (
            <span className="flex shrink-0 items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400">
              <Star className="h-3 w-3 fill-current" />
              {staff.rating}
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="mt-1 flex flex-wrap gap-1.5">
          <Badge className={cn('text-[10px]', roleStyle.color)}>
            {roleStyle.label}
          </Badge>
          <Badge className={cn('text-[10px]', statusStyle.bg, statusStyle.text)}>
            <StatusIcon className="mr-0.5 h-3 w-3" />
            {statusStyle.label}
          </Badge>
        </div>

        {/* Schedule Preview - Only show for available/busy staff */}
        {schedule && (staff.status === 'available' || staff.status === 'busy') && (
          <div className="mt-2 space-y-1.5 border-t border-border/50 pt-2">
            {/* Work Hours */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {formatTime24to12(schedule.workHours.start)} - {formatTime24to12(schedule.workHours.end)}
              </span>
            </div>

            {/* Next Available */}
            {schedule.nextAvailableSlot && (
              <div className="flex items-center gap-1.5 text-xs">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className={cn(
                  schedule.nextAvailableSlot === 'Available now'
                    ? 'font-medium text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground'
                )}>
                  {schedule.nextAvailableSlot === 'Available now' ? 'Available now' : `Next: ${schedule.nextAvailableSlot}`}
                </span>
              </div>
            )}

            {/* Utilization Bar */}
            {schedule.totalSlotsToday > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      utilizationPercent >= 80 ? 'bg-red-500' : utilizationPercent >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                    )}
                    style={{ width: `${utilizationPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground">
                  {schedule.bookingsToday}/{schedule.totalSlotsToday} booked
                </span>
              </div>
            )}
          </div>
        )}

        {/* Capabilities */}
        <div className="mt-2 flex flex-wrap gap-1">
          {staff.capabilities.slice(0, 3).map((capability) => (
            <span
              key={capability}
              className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              {capability}
            </span>
          ))}
          {staff.capabilities.length > 3 && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              +{staff.capabilities.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Selected indicator */}
      <div className="shrink-0">
        {isSelected ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white">
            <Check className="h-4 w-4" />
          </span>
        ) : (
          <span
            className={cn(
              'block h-3 w-3 rounded-full',
              staff.status === 'available' ? 'bg-emerald-500' : 'bg-muted-foreground'
            )}
          />
        )}
      </div>
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <UserCheck className="mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/**
 * BookingStaffStep
 *
 * Step for selecting a staff member in the staff-first booking flow.
 */
export function BookingStaffStep({
  staff = mockStaff,
  selectedId,
  onSelect,
  onBack,
  onNext,
  className,
}: BookingStaffStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<FilterRole>('all');

  const steps = getWizardSteps('staff', false);

  // Filter staff
  const filteredStaff = useMemo(() => {
    let result = staff;

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.capabilities.some((cap) => cap.toLowerCase().includes(query))
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      result = result.filter((s) => s.role === roleFilter);
    }

    // Sort: available first, then busy, then others
    result = [...result].sort((a, b) => {
      const order: Record<StaffStatus, number> = { available: 0, busy: 1, off_duty: 2, on_leave: 3 };
      return order[a.status] - order[b.status];
    });

    return result;
  }, [staff, searchQuery, roleFilter]);

  const roleOptions: { value: FilterRole; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'trainer', label: 'Trainer' },
    { value: 'therapist', label: 'Therapist' },
    { value: 'coach', label: 'Coach' },
    { value: 'instructor', label: 'Instructor' },
  ];

  const canProceed = selectedId !== null;

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Header */}
      <div className="shrink-0 border-b border-border p-4 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">
            Select a Staff Member
          </h2>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep="staff" steps={steps} className="mb-4" />

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff or specialty..."
            className={cn(
              'h-11 w-full rounded-lg border border-border bg-background pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground',
              'focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20'
            )}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Role Filter Chips */}
        <div className="flex flex-wrap gap-2">
          {roleOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRoleFilter(option.value)}
              className={cn(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                roleFilter === option.value
                  ? 'bg-amber-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="space-y-2">
          {filteredStaff.length > 0 ? (
            filteredStaff.map((member) => (
              <StaffCard
                key={member.id}
                staff={member}
                isSelected={selectedId === member.id}
                onSelect={() => {
                  if (member.status === 'available') {
                    onSelect(member);
                  }
                }}
              />
            ))
          ) : (
            <EmptyState
              message={
                searchQuery || roleFilter !== 'all'
                  ? 'No staff found matching your criteria'
                  : 'No staff members available'
              }
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border bg-card p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Back
          </button>
          <Button onClick={onNext} disabled={!canProceed}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
