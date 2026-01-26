'use client';

import { useMemo, useCallback } from 'react';
import { cn } from '@clubvantage/ui';
import { X } from 'lucide-react';
import { useBooking } from './booking-provider';
import { CreateBookingTypeSelection, type BookingType } from './create-booking-wizard';
import { BookingPickerStep, type Facility, type Service } from './booking-picker-step';
import { BookingStaffStep, type BookingStaff, type StaffSchedule } from './booking-staff-step';
import { BookingServiceByStaffStep, type ServiceForStaff } from './booking-service-by-staff-step';
import { BookingFacilityStep, type FacilityForBooking } from './booking-facility-step';
import { BookingTimeStep } from './booking-time-step';
import { BookingAddonsStep } from './booking-addons-step';
import { BookingConfirmationStep } from './booking-confirmation-step';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockFacilities: Facility[] = [
  { id: 'f1', name: 'Tennis Court 1', type: 'court', location: 'Outdoor', status: 'available' },
  { id: 'f2', name: 'Tennis Court 2', type: 'court', location: 'Outdoor', status: 'available' },
  { id: 'f3', name: 'Tennis Court 3', type: 'court', location: 'Indoor', status: 'partial' },
  { id: 'f4', name: 'Badminton Court 1', type: 'court', location: 'Indoor', status: 'available' },
  { id: 'f5', name: 'Spa Room 1', type: 'spa', location: 'Level 2', status: 'available' },
  { id: 'f6', name: 'Spa Room 2', type: 'spa', location: 'Level 2', status: 'maintenance', unavailableReason: 'Under renovation' },
  { id: 'f7', name: 'Yoga Studio', type: 'studio', location: 'Level 3', status: 'available' },
  { id: 'f8', name: 'Swimming Pool', type: 'pool', location: 'Outdoor', status: 'available' },
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
];

// Staff mock data for staff-first flow
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
];

// Services with facility requirement info for staff-first flow
const mockServicesForStaff: ServiceForStaff[] = [
  { id: 's1', name: 'Thai Massage', category: 'Spa', duration: 90, price: 2000, available: true, requiresFacility: true },
  { id: 's2', name: 'Swedish Massage', category: 'Spa', duration: 60, price: 1500, available: true, requiresFacility: true },
  { id: 's3', name: 'Hot Stone Therapy', category: 'Spa', duration: 75, price: 2500, available: true, requiresFacility: true },
  { id: 's4', name: 'Facial Treatment', category: 'Spa', duration: 45, price: 1200, available: true, requiresFacility: true },
  { id: 's5', name: 'Tennis Lesson (Private)', category: 'Sports', duration: 60, price: 1800, available: true, requiresFacility: true },
  { id: 's6', name: 'Tennis Lesson (Group)', category: 'Sports', duration: 90, price: 800, available: true, requiresFacility: true },
  { id: 's7', name: 'Yoga Class', category: 'Fitness', duration: 60, price: 500, available: true, requiresFacility: true },
  { id: 's8', name: 'Personal Training', category: 'Fitness', duration: 60, price: 1500, available: true, requiresFacility: false },
  { id: 's11', name: 'Aromatherapy', category: 'Spa', duration: 60, price: 1800, available: true, requiresFacility: true },
  { id: 's12', name: 'Deep Tissue', category: 'Spa', duration: 75, price: 2200, available: true, requiresFacility: true },
  { id: 's13', name: 'Strength Training', category: 'Fitness', duration: 60, price: 1600, available: true, requiresFacility: false },
  { id: 's14', name: 'HIIT', category: 'Fitness', duration: 45, price: 1400, available: true, requiresFacility: false },
  { id: 's15', name: 'Meditation Session', category: 'Wellness', duration: 30, price: 400, available: true, requiresFacility: false },
  { id: 's16', name: 'Pilates Class', category: 'Fitness', duration: 60, price: 600, available: true, requiresFacility: true },
];

// Facilities for staff-first flow
const mockFacilitiesForStaff: FacilityForBooking[] = [
  { id: 'f1', name: 'Tennis Court 1', type: 'court', location: 'Outdoor', status: 'available', operatingHours: { start: '06:00', end: '21:00' }, slotsAvailable: 12, totalSlots: 15 },
  { id: 'f2', name: 'Tennis Court 2', type: 'court', location: 'Outdoor', status: 'available', operatingHours: { start: '06:00', end: '21:00' }, slotsAvailable: 8, totalSlots: 15 },
  { id: 'f3', name: 'Tennis Court 3', type: 'court', location: 'Indoor', status: 'partial', operatingHours: { start: '07:00', end: '22:00' }, slotsAvailable: 3, totalSlots: 15 },
  { id: 'f5', name: 'Spa Room 1', type: 'spa', location: 'Level 2', status: 'available', operatingHours: { start: '09:00', end: '20:00' }, slotsAvailable: 6, totalSlots: 8 },
  { id: 'f6', name: 'Spa Room 2', type: 'spa', location: 'Level 2', status: 'maintenance', unavailableReason: 'Under renovation', operatingHours: { start: '09:00', end: '20:00' }, slotsAvailable: 0, totalSlots: 8 },
  { id: 'f7', name: 'Yoga Studio', type: 'studio', location: 'Level 3', status: 'available', operatingHours: { start: '06:00', end: '21:00' }, slotsAvailable: 5, totalSlots: 10 },
  { id: 'f8', name: 'Swimming Pool', type: 'pool', location: 'Outdoor', status: 'available', operatingHours: { start: '06:00', end: '20:00' }, slotsAvailable: 8, totalSlots: 14 },
];

// ============================================================================
// COMPONENT
// ============================================================================

export interface CreateBookingModalProps {
  className?: string;
}

/**
 * CreateBookingModal
 *
 * Full booking wizard modal that orchestrates all wizard steps.
 * Uses BookingContext for state management.
 */
export function CreateBookingModal({ className }: CreateBookingModalProps) {
  const {
    wizard,
    closeWizard,
    setBookingType,
    selectFacility,
    selectService,
    setWizardDate,
    setWizardTime,
    selectStaff,
    toggleAddOn,
    selectVariation,
    selectMember,
    goToNextStep,
    goToPreviousStep,
    setNeedsFacility,
    resetWizard,
  } = useBooking();

  const { isOpen, currentStep, bookingType, selectedFacility, selectedService, selectedDate, selectedTime, selectedStaff, selectedAddOns, selectedVariation, selectedMember, isStaffFlow, needsFacility } = wizard;

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        closeWizard();
      }
    },
    [closeWizard]
  );

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeWizard();
      }
    },
    [closeWizard]
  );

  // Get selected facility/service details
  const selectedItem = useMemo(() => {
    if (selectedFacility && bookingType !== 'staff') {
      const facility = mockFacilities.find((f) => f.id === selectedFacility.id);
      return facility ? { name: facility.name, duration: 60, price: 500 } : null;
    }
    if (selectedService) {
      // For staff flow, look in staff services; otherwise in regular services
      if (bookingType === 'staff') {
        const service = mockServicesForStaff.find((s) => s.id === selectedService.id);
        return service ? { name: service.name, duration: service.duration, price: service.price } : null;
      }
      const service = mockServices.find((s) => s.id === selectedService.id);
      return service ? { name: service.name, duration: service.duration, price: service.price } : null;
    }
    return null;
  }, [selectedFacility, selectedService, bookingType]);

  // Handle type selection and move to next step
  const handleTypeSelect = (type: BookingType) => {
    setBookingType(type);
  };

  // Handle facility/service selection
  const handleItemSelect = (id: string) => {
    if (bookingType === 'facility') {
      const facility = mockFacilities.find((f) => f.id === id);
      if (facility) {
        selectFacility({
          id: facility.id,
          name: facility.name,
          type: facility.type,
          location: facility.location,
        });
      }
    } else {
      const service = mockServices.find((s) => s.id === id);
      if (service) {
        selectService({
          id: service.id,
          name: service.name,
          category: service.category,
          duration: service.duration,
          price: service.price,
        });
      }
    }
  };

  // Handle staff selection (pass null for "any available")
  const handleStaffSelect = (staffId: string | null) => {
    if (staffId === null) {
      selectStaff(null);
    } else {
      // In real app, fetch staff details
      selectStaff({
        id: staffId,
        name: 'Selected Staff', // Would come from API
      });
    }
  };

  // Handle add-on toggle
  const handleAddOnToggle = (addonId: string) => {
    // In real app, fetch addon details
    toggleAddOn({
      id: addonId,
      name: 'Add-on', // Would come from API
      price: 300,
    });
  };

  // Handle variation selection
  const handleVariationSelect = (variationId: string) => {
    // In real app, fetch variation details
    selectVariation({
      id: variationId,
      name: 'Standard',
      duration: 60,
      price: 2000,
    });
  };

  // Handle booking confirmation
  const handleConfirm = async (): Promise<string> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const bookingNumber = `BK-${Date.now().toString().slice(-8)}`;
    return bookingNumber;
  };

  // Handle close after success
  const handleCloseAfterSuccess = () => {
    resetWizard();
    closeWizard();
  };

  // Handle staff selection in staff-first flow
  const handleStaffFlowStaffSelect = (staff: BookingStaff) => {
    selectStaff({
      id: staff.id,
      name: staff.name,
      photoUrl: staff.photoUrl,
      role: staff.role,
      capabilities: staff.capabilities,
      defaultFacilityId: staff.defaultFacilityId,
    });
  };

  // Handle service selection in staff-first flow
  const handleStaffFlowServiceSelect = (service: ServiceForStaff) => {
    selectService({
      id: service.id,
      name: service.name,
      category: service.category,
      duration: service.duration,
      price: service.price,
    });

    // Determine if we need the facility step
    // Skip facility step if: service doesn't require facility OR staff has a default facility
    const requiresFacility = service.requiresFacility ?? false;
    const staffHasDefaultFacility = !!selectedStaff?.defaultFacilityId;

    if (requiresFacility && !staffHasDefaultFacility) {
      setNeedsFacility(true);
    } else {
      setNeedsFacility(false);
      // If staff has default facility and service requires one, auto-select it
      if (requiresFacility && staffHasDefaultFacility && selectedStaff?.defaultFacilityId) {
        const defaultFacility = mockFacilitiesForStaff.find(f => f.id === selectedStaff.defaultFacilityId);
        if (defaultFacility) {
          selectFacility({
            id: defaultFacility.id,
            name: defaultFacility.name,
            type: defaultFacility.type,
            location: defaultFacility.location,
          });
        }
      }
    }
  };

  // Handle facility selection in staff-first flow
  const handleStaffFlowFacilitySelect = (facilityId: string) => {
    const facility = mockFacilitiesForStaff.find(f => f.id === facilityId);
    if (facility) {
      selectFacility({
        id: facility.id,
        name: facility.name,
        type: facility.type,
        location: facility.location,
      });
    }
  };

  if (!isOpen) return null;

  // Render Type Selection (Step 1) as its own modal
  if (currentStep === 'type') {
    return (
      <CreateBookingTypeSelection
        isOpen={isOpen}
        onClose={closeWizard}
        onSelect={handleTypeSelect}
        className={className}
      />
    );
  }

  // Render full-screen modal for other steps
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        className={cn(
          'relative flex h-full w-full flex-col bg-card sm:h-[90vh] sm:max-h-[800px] sm:max-w-[600px] sm:rounded-xl sm:shadow-xl',
          'animate-in fade-in-0 zoom-in-95 duration-200',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={closeWizard}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Step Content */}

        {/* Staff Step - Staff-first flow */}
        {currentStep === 'staff' && bookingType === 'staff' && (
          <BookingStaffStep
            staff={mockStaff}
            selectedId={selectedStaff?.id || null}
            onSelect={handleStaffFlowStaffSelect}
            onBack={goToPreviousStep}
            onNext={goToNextStep}
          />
        )}

        {/* Select Step - Facility/Service flow */}
        {currentStep === 'select' && bookingType && bookingType !== 'staff' && (
          <BookingPickerStep
            mode={bookingType}
            facilities={mockFacilities}
            services={mockServices}
            selectedId={selectedFacility?.id || selectedService?.id || null}
            onSelect={handleItemSelect}
            onBack={goToPreviousStep}
            onNext={goToNextStep}
          />
        )}

        {/* Select Step - Staff-first flow (service selection by staff capabilities) */}
        {currentStep === 'select' && bookingType === 'staff' && selectedStaff && (
          <BookingServiceByStaffStep
            staff={{
              id: selectedStaff.id,
              name: selectedStaff.name,
              photoUrl: selectedStaff.photoUrl,
              capabilities: selectedStaff.capabilities || [],
            }}
            services={mockServicesForStaff}
            selectedId={selectedService?.id || null}
            onSelect={handleStaffFlowServiceSelect}
            onBack={goToPreviousStep}
            onNext={goToNextStep}
            needsFacility={needsFacility}
          />
        )}

        {/* Facility Step - Staff-first flow (only when needed) */}
        {currentStep === 'facility' && bookingType === 'staff' && selectedService && (
          <BookingFacilityStep
            serviceName={selectedService.name}
            serviceCategory={selectedService.category}
            selectedDate={selectedDate}
            facilities={mockFacilitiesForStaff}
            selectedId={selectedFacility?.id || null}
            onSelect={handleStaffFlowFacilitySelect}
            onBack={goToPreviousStep}
            onNext={goToNextStep}
          />
        )}

        {currentStep === 'time' && selectedItem && (
          <BookingTimeStep
            serviceName={selectedItem.name}
            duration={selectedItem.duration}
            selectedDate={selectedDate}
            onDateChange={setWizardDate}
            selectedTime={selectedTime}
            onTimeSelect={setWizardTime}
            onBack={goToPreviousStep}
            onNext={goToNextStep}
            onJoinWaitlist={goToNextStep}
            selectedStaffId={selectedStaff?.id}
            selectedFacilityId={selectedFacility?.id}
            staffName={selectedStaff?.name}
            facilityName={selectedFacility?.name}
          />
        )}

        {currentStep === 'options' && selectedItem && (
          <BookingAddonsStep
            serviceName={selectedItem.name}
            basePrice={selectedItem.price}
            showStaffSelection={bookingType === 'service'} // Don't show for staff flow - already selected
            selectedStaffId={selectedStaff?.id || null}
            onStaffSelect={handleStaffSelect}
            selectedAddOnIds={selectedAddOns.map((a) => a.id)}
            onAddOnToggle={handleAddOnToggle}
            selectedVariationId={selectedVariation?.id || null}
            onVariationSelect={handleVariationSelect}
            onBack={goToPreviousStep}
            onSkip={goToNextStep}
            onNext={goToNextStep}
          />
        )}

        {currentStep === 'confirm' && selectedItem && selectedTime && (
          <BookingConfirmationStep
            isStaffFlow={isStaffFlow}
            selectedMember={selectedMember}
            onMemberSelect={(member) => selectMember(member)}
            onMemberClear={() => selectMember(null)}
            bookingSummary={{
              type: bookingType === 'facility' ? 'facility' : 'service', // Staff flow is treated as service
              name: selectedItem.name,
              date: selectedDate,
              time: selectedTime,
              duration: selectedVariation?.duration || selectedItem.duration,
              staffName: selectedStaff?.name,
              facilityName: selectedFacility?.name,
              addOns: selectedAddOns.map((a) => ({ id: a.id, name: a.name, price: a.price })),
              basePrice: selectedVariation?.price || selectedItem.price,
              memberDiscount: 200,
            }}
            onBack={goToPreviousStep}
            onConfirm={handleConfirm}
          />
        )}
      </div>
    </div>
  );
}
