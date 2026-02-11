'use client';

import { useMemo } from 'react';
import { cn } from '@clubvantage/ui';
import { Plus, Sparkles } from 'lucide-react';
import { useGetBookingStaffQuery } from '@clubvantage/api-client';

// ============================================================================
// TYPES
// ============================================================================

export type SlotStatus = 'available' | 'booked' | 'blocked';

export interface StaffTimelineSlot {
  hour: number;
  status: SlotStatus;
  bookingLabel?: string;
  memberRef?: string;
}

export interface StaffScheduleProps {
  date: Date;
  /** Filter to staff who can perform this service */
  serviceId?: string;
  /** Operating hours for the day */
  operatingHours?: { start: number; end: number };
  /** Callback when user clicks an available slot */
  onSlotSelect: (staffId: string, staffName: string, time: string) => void;
  /** Search query to filter staff */
  searchQuery?: string;
  /** When set, only show staff who have ALL of these capabilities */
  requiredCapabilities?: string[];
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function formatHour(hour: number): string {
  const h = hour % 12 || 12;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  return `${h}:00 ${ampm}`;
}

/** Generate mock timeline for a staff member (until we have per-staff calendar queries) */
function generateMockTimeline(
  staffId: string,
  startHour: number,
  endHour: number
): StaffTimelineSlot[] {
  const slots: StaffTimelineSlot[] = [];
  // Use a hash of staffId for deterministic mock data
  const hash = staffId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);

  for (let hour = startHour; hour < endHour; hour++) {
    // Lunch block
    if (hour === 12) {
      slots.push({ hour, status: 'blocked' });
      continue;
    }
    // Deterministic "booked" slots based on staff hash
    const isBooked = (hash + hour) % 3 === 0;
    if (isBooked) {
      const services = ['Thai Massage', 'Tennis', 'PT Session', 'Yoga', 'Swedish', 'Swim'];
      const members = ['M-042', 'M-108', 'M-221', 'M-177', 'M-055', 'M-301'];
      slots.push({
        hour,
        status: 'booked',
        bookingLabel: services[(hash + hour) % services.length],
        memberRef: members[(hash + hour) % members.length],
      });
    } else {
      slots.push({ hour, status: 'available' });
    }
  }
  return slots;
}

// Colors for avatar backgrounds (deterministic based on name)
const AVATAR_COLORS = [
  'bg-amber-500', 'bg-emerald-500', 'bg-blue-500', 'bg-purple-500',
  'bg-rose-500', 'bg-teal-500', 'bg-orange-500', 'bg-indigo-500',
];

function getAvatarColor(name: string): string {
  const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length] ?? 'bg-stone-500';
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function StaffSchedule({
  date,
  serviceId,
  operatingHours = { start: 8, end: 18 },
  onSlotSelect,
  searchQuery,
  requiredCapabilities,
  className,
}: StaffScheduleProps) {
  const { data, isLoading } = useGetBookingStaffQuery();

  const hours = useMemo(() => {
    const h: number[] = [];
    for (let i = operatingHours.start; i < operatingHours.end; i++) {
      h.push(i);
    }
    return h;
  }, [operatingHours]);

  // Filter and sort staff
  const staffList = useMemo(() => {
    if (!data?.bookingStaff) return [];

    let list = data.bookingStaff.filter((s) => s.isActive);

    // Filter by qualification (AND logic: staff must have ALL required capabilities)
    if (requiredCapabilities && requiredCapabilities.length > 0) {
      list = list.filter((s) => {
        const caps = s.capabilities ?? [];
        return requiredCapabilities.every((req) => caps.includes(req));
      });
    }

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q)
      );
    }

    return list;
  }, [data, searchQuery, requiredCapabilities]);

  if (isLoading) {
    return <StaffScheduleSkeleton hours={hours.length} className={className} />;
  }

  if (staffList.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
        <p className="text-sm text-muted-foreground">
          {searchQuery
            ? 'No staff match your search.'
            : requiredCapabilities && requiredCapabilities.length > 0
              ? 'No qualified staff available for this service.'
              : 'No active staff found.'}
        </p>
      </div>
    );
  }

  return (
    <div className={cn('overflow-auto rounded-lg border border-border bg-card', className)}>
      {/* Hours header */}
      <div className="sticky top-0 z-10 flex border-b border-border bg-card">
        <div className="w-[220px] shrink-0 border-r border-border px-3 py-2">
          <span className="text-xs font-medium text-muted-foreground">Staff</span>
        </div>
        <div className="flex flex-1">
          {hours.map((hour) => (
            <div
              key={hour}
              className="flex w-[80px] shrink-0 items-center justify-center border-r border-border py-2 last:border-r-0"
            >
              <span className="text-xs font-medium text-muted-foreground">
                {formatHour(hour)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Staff rows */}
      {staffList.map((staff, index) => {
        const fullName = `${staff.firstName} ${staff.lastName}`;
        const initials = getInitials(staff.firstName, staff.lastName);
        const avatarColor = getAvatarColor(fullName);
        const timeline = generateMockTimeline(staff.id, operatingHours.start, operatingHours.end);
        const isSuggested = index === 0;

        return (
          <div
            key={staff.id}
            className={cn(
              'flex border-b border-border last:border-b-0 hover:bg-muted/30',
              isSuggested && 'bg-emerald-50/30 dark:bg-emerald-500/5'
            )}
          >
            {/* Staff info */}
            <div className="flex w-[220px] shrink-0 items-center gap-2.5 border-r border-border px-3 py-3">
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white',
                  avatarColor
                )}
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="truncate text-sm font-medium text-foreground">
                    {staff.firstName} {staff.lastName.charAt(0)}.
                  </span>
                  {isSuggested && (
                    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                      <Sparkles className="h-2.5 w-2.5" />
                      Suggested
                    </span>
                  )}
                </div>
                {staff.capabilities && staff.capabilities.length > 0 && (
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {staff.capabilities.slice(0, 2).map((cap) => (
                      <span
                        key={cap}
                        className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                      >
                        {cap}
                      </span>
                    ))}
                    {staff.capabilities.length > 2 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{staff.capabilities.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Timeline slots */}
            <div className="flex flex-1">
              {timeline.map((slot) => {
                if (slot.status === 'available') {
                  return (
                    <button
                      key={slot.hour}
                      type="button"
                      onClick={() =>
                        onSlotSelect(
                          staff.id,
                          fullName,
                          `${slot.hour.toString().padStart(2, '0')}:00`
                        )
                      }
                      className={cn(
                        'group flex w-[80px] shrink-0 flex-col items-center justify-center border-r border-border last:border-r-0',
                        'transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500'
                      )}
                    >
                      <Plus className="h-4 w-4 text-transparent transition-colors group-hover:text-emerald-500" />
                    </button>
                  );
                }

                if (slot.status === 'booked') {
                  return (
                    <div
                      key={slot.hour}
                      className="flex w-[80px] shrink-0 flex-col items-center justify-center border-r border-border bg-amber-100 last:border-r-0 dark:bg-amber-500/10"
                    >
                      <span className="truncate text-[10px] font-medium text-amber-700 dark:text-amber-300">
                        {slot.bookingLabel}
                      </span>
                      {slot.memberRef && (
                        <span className="text-[9px] text-amber-600/70 dark:text-amber-400/60">
                          {slot.memberRef}
                        </span>
                      )}
                    </div>
                  );
                }

                // blocked
                return (
                  <div
                    key={slot.hour}
                    className="flex w-[80px] shrink-0 items-center justify-center border-r border-border bg-stone-100 last:border-r-0 dark:bg-stone-800"
                  >
                    <span className="text-[10px] text-stone-400">&mdash;</span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// SKELETON
// ============================================================================

interface StaffScheduleSkeletonProps {
  staffCount?: number;
  hours?: number;
  className?: string;
}

export function StaffScheduleSkeleton({
  staffCount = 4,
  hours = 10,
  className,
}: StaffScheduleSkeletonProps) {
  return (
    <div className={cn('overflow-hidden rounded-lg border border-border bg-card', className)}>
      {/* Header */}
      <div className="flex border-b border-border">
        <div className="w-[220px] shrink-0 border-r border-border px-3 py-2">
          <div className="h-3 w-10 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex flex-1">
          {Array.from({ length: hours }).map((_, i) => (
            <div
              key={i}
              className="flex w-[80px] shrink-0 items-center justify-center border-r border-border py-2 last:border-r-0"
            >
              <div className="h-3 w-12 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      {Array.from({ length: staffCount }).map((_, i) => (
        <div key={i} className="flex border-b border-border last:border-b-0">
          <div className="flex w-[220px] shrink-0 items-center gap-2.5 border-r border-border px-3 py-3">
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-20 animate-pulse rounded bg-muted" />
              <div className="h-2.5 w-16 animate-pulse rounded bg-muted" />
              <div className="flex gap-1">
                <div className="h-3 w-10 animate-pulse rounded bg-muted/60" />
                <div className="h-3 w-12 animate-pulse rounded bg-muted/60" />
              </div>
            </div>
          </div>
          <div className="flex flex-1">
            {Array.from({ length: hours }).map((_, j) => (
              <div
                key={j}
                className="flex w-[80px] shrink-0 items-center justify-center border-r border-border last:border-r-0"
              >
                {(i + j) % 3 === 0 && (
                  <div className="h-6 w-14 animate-pulse rounded bg-muted/50" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
