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
  Clock,
  Check,
} from 'lucide-react';
import { StepIndicator } from './create-booking-wizard';
import type { BookingType } from './create-booking-wizard';

// Facility types
export interface Facility {
  id: string;
  name: string;
  type: 'court' | 'spa' | 'studio' | 'pool' | 'room';
  location: string;
  status: 'available' | 'partial' | 'maintenance';
  unavailableReason?: string;
}

// Service types
export interface Service {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  available: boolean;
  unavailableReason?: string;
}

export interface BookingPickerStepProps {
  mode: BookingType;
  facilities?: Facility[];
  services?: Service[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
  className?: string;
}

const facilityIcons: Record<Facility['type'], typeof Building2> = {
  court: Building2,
  spa: Sparkles,
  studio: Dumbbell,
  pool: Waves,
  room: DoorOpen,
};

const facilityTypeLabels: Record<Facility['type'], string> = {
  court: 'Court',
  spa: 'Spa',
  studio: 'Studio',
  pool: 'Pool',
  room: 'Room',
};

const statusColors: Record<Facility['status'], string> = {
  available: 'bg-emerald-500',
  partial: 'bg-amber-500',
  maintenance: 'bg-red-500',
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount);
}

// Mock data
const mockFacilities: Facility[] = [
  { id: 'f1', name: 'Tennis Court 1', type: 'court', location: 'Outdoor', status: 'available' },
  { id: 'f2', name: 'Tennis Court 2', type: 'court', location: 'Outdoor', status: 'available' },
  { id: 'f3', name: 'Tennis Court 3', type: 'court', location: 'Indoor', status: 'partial' },
  { id: 'f4', name: 'Badminton Court 1', type: 'court', location: 'Indoor', status: 'available' },
  { id: 'f5', name: 'Spa Room 1', type: 'spa', location: 'Level 2', status: 'available' },
  { id: 'f6', name: 'Spa Room 2', type: 'spa', location: 'Level 2', status: 'maintenance', unavailableReason: 'Under renovation' },
  { id: 'f7', name: 'Yoga Studio', type: 'studio', location: 'Level 3', status: 'available' },
  { id: 'f8', name: 'Swimming Pool', type: 'pool', location: 'Outdoor', status: 'available' },
  { id: 'f9', name: 'Meeting Room A', type: 'room', location: 'Level 1', status: 'available' },
  { id: 'f10', name: 'Meeting Room B', type: 'room', location: 'Level 1', status: 'partial' },
];

const mockServices: Service[] = [
  { id: 's1', name: 'Thai Massage', category: 'Spa', duration: 90, price: 2000, available: true },
  { id: 's2', name: 'Swedish Massage', category: 'Spa', duration: 60, price: 1500, available: true },
  { id: 's3', name: 'Hot Stone Therapy', category: 'Spa', duration: 75, price: 2500, available: true },
  { id: 's4', name: 'Facial Treatment', category: 'Spa', duration: 45, price: 1200, available: false, unavailableReason: 'No available therapist' },
  { id: 's5', name: 'Tennis Lesson (Private)', category: 'Sports', duration: 60, price: 1800, available: true },
  { id: 's6', name: 'Tennis Lesson (Group)', category: 'Sports', duration: 90, price: 800, available: true },
  { id: 's7', name: 'Yoga Class', category: 'Fitness', duration: 60, price: 500, available: true },
  { id: 's8', name: 'Personal Training', category: 'Fitness', duration: 60, price: 1500, available: true },
  { id: 's9', name: 'Swimming Lesson', category: 'Sports', duration: 45, price: 1000, available: true },
  { id: 's10', name: 'Pilates Class', category: 'Fitness', duration: 60, price: 600, available: true },
];

/**
 * BookingPickerStep
 *
 * Step 2 of the booking wizard - select a facility or service.
 */
export function BookingPickerStep({
  mode,
  facilities = mockFacilities,
  services = mockServices,
  selectedId,
  onSelect,
  onBack,
  onNext,
  className,
}: BookingPickerStepProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const isFacilityMode = mode === 'facility';
  const title = isFacilityMode ? 'Select a Facility' : 'Select a Service';
  const placeholder = isFacilityMode ? 'Search facilities...' : 'Search services...';

  // Filter items based on search
  const filteredFacilities = useMemo(() => {
    if (!isFacilityMode) return [];
    const query = searchQuery.toLowerCase();
    return facilities.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.type.toLowerCase().includes(query) ||
        f.location.toLowerCase().includes(query)
    );
  }, [isFacilityMode, facilities, searchQuery]);

  const filteredServices = useMemo(() => {
    if (isFacilityMode) return [];
    const query = searchQuery.toLowerCase();
    return services.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.category.toLowerCase().includes(query)
    );
  }, [isFacilityMode, services, searchQuery]);

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
            {title}
          </h2>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep="select" className="mb-4" />

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
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
          {isFacilityMode ? (
            filteredFacilities.length > 0 ? (
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
            )
          ) : filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isSelected={selectedId === service.id}
                onSelect={() => {
                  if (service.available) {
                    onSelect(service.id);
                  }
                }}
              />
            ))
          ) : (
            <EmptyState message="No services found" />
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

interface FacilityCardProps {
  facility: Facility;
  isSelected: boolean;
  onSelect: () => void;
}

function FacilityCard({ facility, isSelected, onSelect }: FacilityCardProps) {
  const Icon = facilityIcons[facility.type];
  const isUnavailable = facility.status === 'maintenance';

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isUnavailable}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all duration-200 sm:p-4',
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

interface ServiceCardProps {
  service: Service;
  isSelected: boolean;
  onSelect: () => void;
}

function ServiceCard({ service, isSelected, onSelect }: ServiceCardProps) {
  const isUnavailable = !service.available;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={isUnavailable}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all duration-200 sm:p-4',
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
        <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
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
            {service.name}
          </h3>
          <Badge
            variant="secondary"
            className="shrink-0 text-[10px] sm:text-xs"
          >
            {service.category}
          </Badge>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {service.duration} min
          </span>
          <span>•</span>
          <span className="font-medium text-foreground">
            {formatCurrency(service.price)}
          </span>
          {isUnavailable && service.unavailableReason && (
            <>
              <span>•</span>
              <span className="text-red-600 dark:text-red-400">
                {service.unavailableReason}
              </span>
            </>
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
              service.available ? 'bg-emerald-500' : 'bg-red-500'
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
      <Search className="mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
