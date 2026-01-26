'use client';

import { useState, useMemo } from 'react';
import { cn, Button, Badge } from '@clubvantage/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@clubvantage/ui';
import {
  ArrowLeft,
  Search,
  X,
  Sparkles,
  Clock,
  Check,
} from 'lucide-react';
import { StepIndicator, getWizardSteps } from './create-booking-wizard';

export interface ServiceForStaff {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  available: boolean;
  unavailableReason?: string;
  requiresFacility?: boolean;
}

interface SelectedStaffInfo {
  id: string;
  name: string;
  photoUrl?: string;
  capabilities: string[];
}

export interface BookingServiceByStaffStepProps {
  staff: SelectedStaffInfo;
  services?: ServiceForStaff[];
  selectedId: string | null;
  onSelect: (service: ServiceForStaff) => void;
  onBack: () => void;
  onNext: () => void;
  needsFacility: boolean;
  className?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount);
}

// Mock data - all possible services
const mockServices: ServiceForStaff[] = [
  { id: 's1', name: 'Thai Massage', category: 'Spa', duration: 90, price: 2000, available: true, requiresFacility: true },
  { id: 's2', name: 'Swedish Massage', category: 'Spa', duration: 60, price: 1500, available: true, requiresFacility: true },
  { id: 's3', name: 'Hot Stone Therapy', category: 'Spa', duration: 75, price: 2500, available: true, requiresFacility: true },
  { id: 's4', name: 'Facial Treatment', category: 'Spa', duration: 45, price: 1200, available: true, requiresFacility: true },
  { id: 's5', name: 'Tennis Lesson (Private)', category: 'Sports', duration: 60, price: 1800, available: true, requiresFacility: true },
  { id: 's6', name: 'Tennis Lesson (Group)', category: 'Sports', duration: 90, price: 800, available: true, requiresFacility: true },
  { id: 's7', name: 'Yoga Class', category: 'Fitness', duration: 60, price: 500, available: true, requiresFacility: true },
  { id: 's8', name: 'Personal Training', category: 'Fitness', duration: 60, price: 1500, available: true, requiresFacility: false },
  { id: 's9', name: 'Swimming Lesson', category: 'Sports', duration: 45, price: 1000, available: true, requiresFacility: true },
  { id: 's10', name: 'Pilates Class', category: 'Fitness', duration: 60, price: 600, available: true, requiresFacility: true },
  { id: 's11', name: 'Aromatherapy', category: 'Spa', duration: 60, price: 1800, available: true, requiresFacility: true },
  { id: 's12', name: 'Deep Tissue', category: 'Spa', duration: 75, price: 2200, available: true, requiresFacility: true },
  { id: 's13', name: 'Strength Training', category: 'Fitness', duration: 60, price: 1600, available: true, requiresFacility: false },
  { id: 's14', name: 'HIIT', category: 'Fitness', duration: 45, price: 1400, available: true, requiresFacility: false },
  { id: 's15', name: 'Meditation Session', category: 'Wellness', duration: 30, price: 400, available: true, requiresFacility: false },
  { id: 's16', name: 'Aqua Aerobics', category: 'Fitness', duration: 45, price: 600, available: true, requiresFacility: true },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface ServiceCardProps {
  service: ServiceForStaff;
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
      <Sparkles className="mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="text-sm font-medium text-foreground">No services available</p>
      <p className="mt-1 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

/**
 * BookingServiceByStaffStep
 *
 * Step for selecting a service based on staff capabilities in the staff-first booking flow.
 */
export function BookingServiceByStaffStep({
  staff,
  services = mockServices,
  selectedId,
  onSelect,
  onBack,
  onNext,
  needsFacility,
  className,
}: BookingServiceByStaffStepProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const steps = getWizardSteps('staff', needsFacility);

  // Filter services based on staff capabilities
  const filteredServices = useMemo(() => {
    // First, filter by staff capabilities
    let result = services.filter((service) =>
      staff.capabilities.some(
        (cap) => cap.toLowerCase() === service.name.toLowerCase()
      )
    );

    // Then, filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.category.toLowerCase().includes(query)
      );
    }

    return result;
  }, [services, staff.capabilities, searchQuery]);

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
            Select a Service
          </h2>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep="select" steps={steps} className="mb-4" />

        {/* Staff Info */}
        <div className="mb-4 flex items-center gap-3 rounded-lg bg-muted/50 p-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={staff.photoUrl} alt={staff.name} />
            <AvatarFallback className="bg-amber-100 text-amber-700">
              {getInitials(staff.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">
              Services by {staff.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} available
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services..."
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
          {filteredServices.length > 0 ? (
            filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                isSelected={selectedId === service.id}
                onSelect={() => {
                  if (service.available) {
                    onSelect(service);
                  }
                }}
              />
            ))
          ) : (
            <EmptyState
              message={
                searchQuery
                  ? 'Try adjusting your search'
                  : `${staff.name} has no services configured`
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
