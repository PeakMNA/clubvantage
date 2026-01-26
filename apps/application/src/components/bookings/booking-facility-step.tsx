'use client';

import { useState, useMemo } from 'react';
import { cn, Button, Badge } from '@clubvantage/ui';
import {
  ArrowLeft,
  Search,
  X,
  Building2,
  Sparkles,
  Dumbbell,
  Waves,
  DoorOpen,
  Check,
  Clock,
} from 'lucide-react';
import { StepIndicator, getWizardSteps } from './create-booking-wizard';

// Facility types
export interface FacilityForBooking {
  id: string;
  name: string;
  type: 'court' | 'spa' | 'studio' | 'pool' | 'room';
  location: string;
  status: 'available' | 'partial' | 'maintenance';
  unavailableReason?: string;
  operatingHours?: { start: string; end: string };
  slotsAvailable?: number;
  totalSlots?: number;
}

// Service category to facility type mapping
const serviceCategoryToFacilityType: Record<string, FacilityForBooking['type'][]> = {
  'Spa': ['spa', 'room'],
  'Sports': ['court'],
  'Fitness': ['studio', 'room'],
  'Wellness': ['studio', 'room', 'spa'],
};

export interface BookingFacilityStepProps {
  serviceName: string;
  serviceCategory?: string;
  selectedDate?: Date;
  facilities?: FacilityForBooking[];
  selectedId: string | null;
  onSelect: (facilityId: string) => void;
  onBack: () => void;
  onNext: () => void;
  className?: string;
}

const facilityIcons: Record<FacilityForBooking['type'], typeof Building2> = {
  court: Building2,
  spa: Sparkles,
  studio: Dumbbell,
  pool: Waves,
  room: DoorOpen,
};

const facilityTypeLabels: Record<FacilityForBooking['type'], string> = {
  court: 'Court',
  spa: 'Spa',
  studio: 'Studio',
  pool: 'Pool',
  room: 'Room',
};

const statusColors: Record<FacilityForBooking['status'], string> = {
  available: 'bg-emerald-500',
  partial: 'bg-amber-500',
  maintenance: 'bg-red-500',
};

function formatTime24to12(time24: string): string {
  const parts = time24.split(':').map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return minutes === 0 ? `${hour12}${period}` : `${hour12}:${minutes.toString().padStart(2, '0')}${period}`;
}

// Mock data
const mockFacilities: FacilityForBooking[] = [
  { id: 'f1', name: 'Tennis Court 1', type: 'court', location: 'Outdoor', status: 'available', operatingHours: { start: '06:00', end: '21:00' }, slotsAvailable: 12, totalSlots: 15 },
  { id: 'f2', name: 'Tennis Court 2', type: 'court', location: 'Outdoor', status: 'available', operatingHours: { start: '06:00', end: '21:00' }, slotsAvailable: 8, totalSlots: 15 },
  { id: 'f3', name: 'Tennis Court 3', type: 'court', location: 'Indoor', status: 'partial', operatingHours: { start: '07:00', end: '22:00' }, slotsAvailable: 3, totalSlots: 15 },
  { id: 'f4', name: 'Badminton Court 1', type: 'court', location: 'Indoor', status: 'available', operatingHours: { start: '07:00', end: '22:00' }, slotsAvailable: 10, totalSlots: 15 },
  { id: 'f5', name: 'Spa Room 1', type: 'spa', location: 'Level 2', status: 'available', operatingHours: { start: '09:00', end: '20:00' }, slotsAvailable: 6, totalSlots: 8 },
  { id: 'f6', name: 'Spa Room 2', type: 'spa', location: 'Level 2', status: 'maintenance', unavailableReason: 'Under renovation', operatingHours: { start: '09:00', end: '20:00' }, slotsAvailable: 0, totalSlots: 8 },
  { id: 'f7', name: 'Yoga Studio', type: 'studio', location: 'Level 3', status: 'available', operatingHours: { start: '06:00', end: '21:00' }, slotsAvailable: 5, totalSlots: 10 },
  { id: 'f8', name: 'Swimming Pool', type: 'pool', location: 'Outdoor', status: 'available', operatingHours: { start: '06:00', end: '20:00' }, slotsAvailable: 8, totalSlots: 14 },
  { id: 'f9', name: 'Meeting Room A', type: 'room', location: 'Level 1', status: 'available', operatingHours: { start: '08:00', end: '18:00' }, slotsAvailable: 7, totalSlots: 10 },
  { id: 'f10', name: 'Meeting Room B', type: 'room', location: 'Level 1', status: 'partial', operatingHours: { start: '08:00', end: '18:00' }, slotsAvailable: 2, totalSlots: 10 },
];

interface FacilityCardProps {
  facility: FacilityForBooking;
  isSelected: boolean;
  onSelect: () => void;
}

function FacilityCard({ facility, isSelected, onSelect }: FacilityCardProps) {
  const Icon = facilityIcons[facility.type];
  const isUnavailable = facility.status === 'maintenance';

  // Calculate availability percentage for visual indicator
  const availabilityPercent = facility.totalSlots && facility.totalSlots > 0
    ? Math.round(((facility.slotsAvailable ?? 0) / facility.totalSlots) * 100)
    : 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isUnavailable}
      className={cn(
        'group relative flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all duration-200 sm:p-4',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
        isSelected
          ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-500 dark:bg-amber-500/10'
          : isUnavailable
            ? 'cursor-not-allowed border-border bg-muted/30 opacity-60'
            : 'border-border bg-card hover:bg-muted/50'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-12 sm:w-12',
          isSelected
            ? 'bg-amber-500 text-white'
            : 'bg-muted text-muted-foreground'
        )}
      >
        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              'truncate text-sm font-medium sm:text-base',
              isSelected
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-foreground'
            )}
          >
            {facility.name}
          </h3>
          <Badge
            variant="secondary"
            className="shrink-0 text-[10px] sm:text-xs"
          >
            {facilityTypeLabels[facility.type]}
          </Badge>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
          <span>{facility.location}</span>
          {isUnavailable && facility.unavailableReason && (
            <>
              <span>•</span>
              <span className="text-red-600 dark:text-red-400">
                {facility.unavailableReason}
              </span>
            </>
          )}
        </div>

        {/* Availability Info - Only show for available/partial facilities */}
        {!isUnavailable && (
          <div className="mt-2 space-y-1.5 border-t border-border/50 pt-2">
            {/* Operating Hours */}
            {facility.operatingHours && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {formatTime24to12(facility.operatingHours.start)} - {formatTime24to12(facility.operatingHours.end)}
                </span>
              </div>
            )}

            {/* Slots Availability */}
            {facility.totalSlots !== undefined && facility.totalSlots > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      availabilityPercent >= 50 ? 'bg-emerald-500' : availabilityPercent >= 20 ? 'bg-amber-500' : 'bg-red-500'
                    )}
                    style={{ width: `${availabilityPercent}%` }}
                  />
                </div>
                <span className={cn(
                  'text-[10px]',
                  availabilityPercent >= 50 ? 'text-emerald-600 dark:text-emerald-400' : availabilityPercent >= 20 ? 'text-amber-600 dark:text-amber-400' : 'text-red-600 dark:text-red-400'
                )}>
                  {facility.slotsAvailable}/{facility.totalSlots} available
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status / Selected indicator */}
      <div className="shrink-0">
        {isSelected ? (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white">
            <Check className="h-4 w-4" />
          </span>
        ) : (
          <span
            className={cn(
              'block h-3 w-3 rounded-full',
              statusColors[facility.status]
            )}
            title={facility.status}
          />
        )}
      </div>
    </button>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Building2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/**
 * BookingFacilityStep
 *
 * Optional step for selecting a facility when the service requires one
 * and the staff doesn't have a default facility.
 */
export function BookingFacilityStep({
  serviceName,
  serviceCategory,
  selectedDate,
  facilities = mockFacilities,
  selectedId,
  onSelect,
  onBack,
  onNext,
  className,
}: BookingFacilityStepProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const steps = getWizardSteps('staff', true);

  // Format selected date for display
  const formattedDate = selectedDate
    ? selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : 'Today';

  // Filter facilities based on service category and search
  const filteredFacilities = useMemo(() => {
    let result = facilities;

    // Filter by service category compatibility
    if (serviceCategory) {
      const compatibleTypes = serviceCategoryToFacilityType[serviceCategory];
      if (compatibleTypes) {
        result = result.filter((f) => compatibleTypes.includes(f.type));
      }
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(query) ||
          f.type.toLowerCase().includes(query) ||
          f.location.toLowerCase().includes(query)
      );
    }

    // Sort: available first, then partial, then maintenance
    result = [...result].sort((a, b) => {
      const order: Record<FacilityForBooking['status'], number> = { available: 0, partial: 1, maintenance: 2 };
      return order[a.status] - order[b.status];
    });

    return result;
  }, [facilities, serviceCategory, searchQuery]);

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
            Select a Facility
          </h2>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep="facility" steps={steps} className="mb-4" />

        {/* Service & Date Info */}
        <div className="mb-4 rounded-lg bg-muted/50 p-3">
          <p className="text-sm text-muted-foreground">
            Select a facility for <span className="font-medium text-foreground">{serviceName}</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Showing availability for <span className="font-medium text-foreground">{formattedDate}</span>
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facilities..."
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
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="space-y-2">
          {filteredFacilities.length > 0 ? (
            filteredFacilities.map((facility) => (
              <FacilityCard
                key={facility.id}
                facility={facility}
                isSelected={selectedId === facility.id}
                onSelect={() => {
                  if (facility.status !== 'maintenance') {
                    onSelect(facility.id);
                  }
                }}
              />
            ))
          ) : (
            <EmptyState message="No facilities found" />
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
