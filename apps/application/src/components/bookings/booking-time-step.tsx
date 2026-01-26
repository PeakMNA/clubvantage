'use client';

import { useState, useEffect, useMemo } from 'react';
import { cn, Button } from '@clubvantage/ui';
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, AlertCircle, Users } from 'lucide-react';
import { StepIndicator } from './create-booking-wizard';
import { TimeSlotButton, TimeSlotGroup, type TimeSlotStatus } from './time-slot-button';

interface TimeSlot {
  time: string;
  status: TimeSlotStatus;
  waitlistCount?: number;
  unavailableReason?: string;
}

interface TimeSlotGroup {
  label: string;
  slots: TimeSlot[];
}

export interface BookingTimeStepProps {
  serviceName: string;
  duration?: number; // in minutes
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  onBack: () => void;
  onNext: () => void;
  onJoinWaitlist?: () => void;
  className?: string;
  // Staff and facility context for availability-based slots
  selectedStaffId?: string;
  selectedFacilityId?: string;
  staffName?: string;
  facilityName?: string;
}

// Mock staff working hours data
interface StaffScheduleData {
  id: string;
  workHours: { start: string; end: string };
  bookedSlots: string[]; // Times already booked
}

// Mock facility operating hours data
interface FacilityScheduleData {
  id: string;
  operatingHours: { start: string; end: string };
  bookedSlots: string[]; // Times already booked
}

// Mock data for staff schedules
const mockStaffSchedules: StaffScheduleData[] = [
  { id: 'st1', workHours: { start: '09:00', end: '18:00' }, bookedSlots: ['09:00 AM', '10:30 AM', '12:00 PM', '3:00 PM'] },
  { id: 'st2', workHours: { start: '10:00', end: '19:00' }, bookedSlots: ['10:00 AM', '11:30 AM', '1:00 PM', '2:30 PM', '4:00 PM', '5:30 PM'] },
  { id: 'st4', workHours: { start: '06:00', end: '14:00' }, bookedSlots: ['7:00 AM', '8:30 AM'] },
  { id: 'st5', workHours: { start: '07:00', end: '15:00' }, bookedSlots: ['7:00 AM', '8:30 AM', '10:00 AM', '11:30 AM', '1:00 PM'] },
  { id: 'st6', workHours: { start: '08:00', end: '18:00' }, bookedSlots: ['9:00 AM', '11:00 AM', '2:00 PM'] },
];

// Mock data for facility schedules
const mockFacilitySchedules: FacilityScheduleData[] = [
  { id: 'f1', operatingHours: { start: '06:00', end: '21:00' }, bookedSlots: ['8:00 AM', '10:00 AM', '2:00 PM'] },
  { id: 'f2', operatingHours: { start: '06:00', end: '21:00' }, bookedSlots: ['9:00 AM', '11:00 AM', '3:00 PM', '5:00 PM'] },
  { id: 'f5', operatingHours: { start: '09:00', end: '20:00' }, bookedSlots: ['10:00 AM', '12:00 PM'] },
  { id: 'f7', operatingHours: { start: '06:00', end: '21:00' }, bookedSlots: ['7:00 AM', '9:00 AM', '11:00 AM'] },
];

// Helper to parse 24-hour time to minutes since midnight
function timeToMinutes(time24: string): number {
  const parts = time24.split(':').map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  return hours * 60 + minutes;
}

// Helper to format minutes since midnight to 12-hour time
function minutesToTime12(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return mins === 0 ? `${hour12}:00 ${period}` : `${hour12}:${mins.toString().padStart(2, '0')} ${period}`;
}

// Generate time slots based on staff and facility availability
function generateAvailabilityBasedSlots(
  date: Date,
  staffId?: string,
  facilityId?: string,
  serviceDuration: number = 60
): TimeSlotGroup[] {
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  // Get staff schedule if selected
  const staffSchedule = staffId ? mockStaffSchedules.find(s => s.id === staffId) : null;

  // Get facility schedule if selected
  const facilitySchedule = facilityId ? mockFacilitySchedules.find(f => f.id === facilityId) : null;

  // Determine available window - intersection of staff and facility hours
  let startMinutes = 8 * 60; // Default 8 AM
  let endMinutes = 20 * 60; // Default 8 PM

  if (staffSchedule) {
    const staffStart = timeToMinutes(staffSchedule.workHours.start);
    const staffEnd = timeToMinutes(staffSchedule.workHours.end);
    startMinutes = Math.max(startMinutes, staffStart);
    endMinutes = Math.min(endMinutes, staffEnd);
  }

  if (facilitySchedule) {
    const facilityStart = timeToMinutes(facilitySchedule.operatingHours.start);
    const facilityEnd = timeToMinutes(facilitySchedule.operatingHours.end);
    startMinutes = Math.max(startMinutes, facilityStart);
    endMinutes = Math.min(endMinutes, facilityEnd);
  }

  // Generate slots based on service duration (round to 30-min intervals for simplicity)
  const slotInterval = 30; // 30-minute slots
  const slots: TimeSlot[] = [];

  for (let mins = startMinutes; mins < endMinutes - serviceDuration + slotInterval; mins += slotInterval) {
    const timeStr = minutesToTime12(mins);

    // Check if slot is booked by staff
    const staffBooked = staffSchedule?.bookedSlots.includes(timeStr);

    // Check if slot is booked at facility
    const facilityBooked = facilitySchedule?.bookedSlots.includes(timeStr);

    // Determine slot status
    let status: TimeSlotStatus = 'available';
    let unavailableReason: string | undefined;
    let waitlistCount: number | undefined;

    if (staffBooked && facilityBooked) {
      status = 'unavailable';
      unavailableReason = 'Staff and facility booked';
    } else if (staffBooked) {
      status = 'unavailable';
      unavailableReason = 'Staff booked';
    } else if (facilityBooked) {
      status = 'unavailable';
      unavailableReason = 'Facility booked';
    }

    // Add some variety with waitlist slots on weekends
    if (status === 'available' && isWeekend && (mins === 10 * 60 || mins === 14 * 60 || mins === 17 * 60)) {
      status = 'full';
      waitlistCount = Math.floor(Math.random() * 3) + 1;
    }

    slots.push({ time: timeStr, status, unavailableReason, waitlistCount });
  }

  // Helper to parse hour from time string like "9:00 AM" or "12:30 PM"
  const parseHour = (timeStr: string): number => {
    const hourPart = timeStr.split(':')[0];
    return parseInt(hourPart ?? '0', 10);
  };

  // Group slots into morning, afternoon, evening
  const morningSlots = slots.filter(s => {
    const hour = parseHour(s.time);
    const isPM = s.time.includes('PM');
    if (isPM && hour === 12) return true; // 12 PM is noon, include in morning
    if (!isPM && hour < 12) return true;
    return false;
  });

  const afternoonSlots = slots.filter(s => {
    const hour = parseHour(s.time);
    const isPM = s.time.includes('PM');
    if (!isPM) return false;
    if (hour === 12) return false; // 12 PM is in morning group
    return hour >= 1 && hour < 5;
  });

  const eveningSlots = slots.filter(s => {
    const hour = parseHour(s.time);
    const isPM = s.time.includes('PM');
    if (!isPM) return false;
    return hour >= 5 && hour < 12;
  });

  return [
    { label: 'Morning', slots: morningSlots },
    { label: 'Afternoon', slots: afternoonSlots },
    { label: 'Evening', slots: eveningSlots },
  ].filter(group => group.slots.length > 0);
}

// Legacy mock time slots generator (fallback when no staff/facility selected)
function generateMockTimeSlots(date: Date): TimeSlotGroup[] {
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  const morningSlots: TimeSlot[] = [
    { time: '8:00 AM', status: 'available' },
    { time: '8:30 AM', status: 'available' },
    { time: '9:00 AM', status: 'unavailable', unavailableReason: 'No therapist available' },
    { time: '9:30 AM', status: 'available' },
    { time: '10:00 AM', status: 'full', waitlistCount: 2 },
    { time: '10:30 AM', status: 'available' },
    { time: '11:00 AM', status: 'available' },
    { time: '11:30 AM', status: isWeekend ? 'full' : 'available', waitlistCount: isWeekend ? 3 : 0 },
  ];

  const afternoonSlots: TimeSlot[] = [
    { time: '12:00 PM', status: 'unavailable', unavailableReason: 'Lunch break' },
    { time: '12:30 PM', status: 'unavailable', unavailableReason: 'Lunch break' },
    { time: '1:00 PM', status: 'available' },
    { time: '1:30 PM', status: 'available' },
    { time: '2:00 PM', status: 'full', waitlistCount: 1 },
    { time: '2:30 PM', status: 'available' },
    { time: '3:00 PM', status: 'available' },
    { time: '3:30 PM', status: 'available' },
    { time: '4:00 PM', status: isWeekend ? 'unavailable' : 'available', unavailableReason: isWeekend ? 'Closed for event' : undefined },
    { time: '4:30 PM', status: isWeekend ? 'unavailable' : 'available', unavailableReason: isWeekend ? 'Closed for event' : undefined },
  ];

  const eveningSlots: TimeSlot[] = [
    { time: '5:00 PM', status: 'available' },
    { time: '5:30 PM', status: 'available' },
    { time: '6:00 PM', status: 'full', waitlistCount: 4 },
    { time: '6:30 PM', status: 'available' },
    { time: '7:00 PM', status: 'available' },
    { time: '7:30 PM', status: 'unavailable', unavailableReason: 'Last slot closed' },
  ];

  return [
    { label: 'Morning', slots: morningSlots },
    { label: 'Afternoon', slots: afternoonSlots },
    { label: 'Evening', slots: eveningSlots },
  ];
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateFull(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
}

/**
 * BookingTimeStep
 *
 * Step 3 of the booking wizard - select date and time.
 * Shows time slots based on staff + facility availability when in staff-first flow.
 */
export function BookingTimeStep({
  serviceName,
  duration,
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeSelect,
  onBack,
  onNext,
  onJoinWaitlist,
  className,
  selectedStaffId,
  selectedFacilityId,
  staffName,
  facilityName,
}: BookingTimeStepProps) {
  const [holdTimer, setHoldTimer] = useState<number | null>(null);
  const [showWaitlistPrompt, setShowWaitlistPrompt] = useState(false);
  const [pendingWaitlistSlot, setPendingWaitlistSlot] = useState<TimeSlot | null>(null);

  // Use availability-based slots when staff/facility is selected, otherwise fallback to mock
  const timeSlotGroups = useMemo(() => {
    if (selectedStaffId || selectedFacilityId) {
      return generateAvailabilityBasedSlots(selectedDate, selectedStaffId, selectedFacilityId, duration || 60);
    }
    return generateMockTimeSlots(selectedDate);
  }, [selectedDate, selectedStaffId, selectedFacilityId, duration]);

  // Build context string for the header
  const bookingContext = useMemo(() => {
    const parts: string[] = [];
    if (staffName) parts.push(`with ${staffName}`);
    if (facilityName) parts.push(`at ${facilityName}`);
    return parts.length > 0 ? parts.join(' ') : null;
  }, [staffName, facilityName]);

  // Find selected slot details
  const selectedSlot = useMemo(() => {
    for (const group of timeSlotGroups) {
      const slot = group.slots.find((s) => s.time === selectedTime);
      if (slot) return slot;
    }
    return null;
  }, [timeSlotGroups, selectedTime]);

  const isWaitlistSelection = selectedSlot?.status === 'full';

  // Hold timer countdown
  useEffect(() => {
    if (selectedTime && !isWaitlistSelection) {
      setHoldTimer(5 * 60); // 5 minutes in seconds
      const interval = setInterval(() => {
        setHoldTimer((prev) => {
          if (prev === null || prev <= 0) {
            clearInterval(interval);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setHoldTimer(null);
    }
  }, [selectedTime, isWaitlistSelection]);

  const formatHoldTimer = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePrevDate = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    if (newDate >= new Date(new Date().setHours(0, 0, 0, 0))) {
      onDateChange(newDate);
      onTimeSelect(''); // Clear selection on date change
    }
  };

  const handleNextDate = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    onDateChange(newDate);
    onTimeSelect(''); // Clear selection on date change
  };

  const handleToday = () => {
    onDateChange(new Date());
    onTimeSelect('');
  };

  const handleTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    onDateChange(tomorrow);
    onTimeSelect('');
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.status === 'unavailable') return;

    if (slot.status === 'full') {
      setPendingWaitlistSlot(slot);
      setShowWaitlistPrompt(true);
    } else {
      onTimeSelect(slot.time);
      setShowWaitlistPrompt(false);
      setPendingWaitlistSlot(null);
    }
  };

  const handleConfirmWaitlist = () => {
    if (pendingWaitlistSlot) {
      onTimeSelect(pendingWaitlistSlot.time);
    }
    setShowWaitlistPrompt(false);
  };

  const canProceed = selectedTime !== null && selectedTime !== '';

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
          <div>
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">
              Select a time
            </h2>
            <p className="text-sm text-muted-foreground">
              {serviceName}
              {duration && ` • ${duration} min`}
            </p>
            {bookingContext && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {bookingContext}
              </p>
            )}
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep="time" className="mb-4" />

        {/* Date Navigation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevDate}
                disabled={isToday(selectedDate)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                aria-label="Previous day"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="min-w-[140px] text-center text-sm font-medium text-foreground sm:min-w-[180px] sm:text-base">
                {formatDateShort(selectedDate)}
              </span>
              <button
                type="button"
                onClick={handleNextDate}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Next day"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Quick date buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleToday}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  isToday(selectedDate)
                    ? 'bg-amber-500 text-white'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleTomorrow}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                  isTomorrow(selectedDate)
                    ? 'bg-amber-500 text-white'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                Tomorrow
              </button>
            </div>
          </div>

          {/* Full date display */}
          <p className="text-center text-xs text-muted-foreground">
            {formatDateFull(selectedDate)}
          </p>
        </div>
      </div>

      {/* Time Slots */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Hold Timer Banner */}
        {holdTimer !== null && holdTimer > 0 && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-500/10">
            <Clock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Reserved for you:{' '}
              <span className="font-semibold">{formatHoldTimer(holdTimer)}</span>
            </p>
          </div>
        )}

        {/* Waitlist Prompt */}
        {showWaitlistPrompt && pendingWaitlistSlot && (
          <div className="mb-4 rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
                <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">
                  Join waitlist for {pendingWaitlistSlot.time}?
                </h4>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Position #{(pendingWaitlistSlot.waitlistCount || 0) + 1} in queue.
                  You'll be notified if a spot opens up.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={handleConfirmWaitlist}>
                    Join Waitlist
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowWaitlistPrompt(false);
                      setPendingWaitlistSlot(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Time Slot Groups */}
        <div className="space-y-6">
          {timeSlotGroups.map((group) => (
            <div key={group.label}>
              <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {group.label}
              </h4>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
                {group.slots.map((slot) => (
                  <TimeSlotButton
                    key={slot.time}
                    time={slot.time}
                    status={selectedTime === slot.time ? 'selected' : slot.status}
                    waitlistCount={slot.waitlistCount}
                    unavailableReason={slot.unavailableReason}
                    onClick={() => handleSlotClick(slot)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/40" />
            <span>Unavailable</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            <span>Waitlist</span>
          </div>
        </div>

        {/* Duration Info Banner - Show when staff/facility selected */}
        {(selectedStaffId || selectedFacilityId) && duration && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              {duration} min slots based on service duration
            </p>
          </div>
        )}
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
          <Button
            onClick={isWaitlistSelection ? onJoinWaitlist : onNext}
            disabled={!canProceed}
          >
            {isWaitlistSelection ? 'Join Waitlist' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}
