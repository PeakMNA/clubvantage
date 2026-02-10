'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { BookingStatus } from './types';
import type { BookingType, WizardStep } from './create-booking-wizard';

// ============================================================================
// TYPES
// ============================================================================

interface MemberInfo {
  id: string;
  name: string;
  photoUrl?: string;
  memberNumber: string;
  status: 'active' | 'suspended';
  outstandingBalance?: number;
}

interface SelectedFacility {
  id: string;
  name: string;
  type: string;
  location: string;
}

interface SelectedService {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
}

interface SelectedStaff {
  id: string;
  name: string;
  photoUrl?: string;
  role?: 'therapist' | 'trainer' | 'instructor' | 'coach';
  capabilities?: string[];
  defaultFacilityId?: string;
}

interface SelectedAddOn {
  id: string;
  name: string;
  price: number;
}

interface SelectedVariation {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface BookingWizardState {
  isOpen: boolean;
  currentStep: WizardStep;
  bookingType: BookingType | null;
  selectedFacility: SelectedFacility | null;
  selectedService: SelectedService | null;
  selectedDate: Date;
  selectedTime: string | null;
  selectedStaff: SelectedStaff | null;
  selectedAddOns: SelectedAddOn[];
  selectedVariation: SelectedVariation | null;
  selectedMember: MemberInfo | null;
  isStaffFlow: boolean;
  needsFacility: boolean;
}

interface CalendarBooking {
  id: string;
  resourceId: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  title: string;
  memberName: string;
  memberNumber: string;
  memberPhoto?: string;
}

interface BookingDetailState {
  isOpen: boolean;
  bookingId: string | null;
  booking: CalendarBooking | null;
}

// ============================================================================
// BOOKING CREATION SHEET (new tab-based flow)
// ============================================================================

export interface BookingSheetPrefill {
  facilityId?: string;
  facilityName?: string;
  serviceId?: string;
  serviceName?: string;
  staffId?: string;
  staffName?: string;
  date?: Date;
  startTime?: string;
  endTime?: string;
}

interface BookingSheetState {
  isOpen: boolean;
  prefilled: BookingSheetPrefill;
}

const initialSheetState: BookingSheetState = {
  isOpen: false,
  prefilled: {},
};

interface BookingContextValue {
  // Active tab
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Calendar state
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  viewMode: 'day' | 'week';
  setViewMode: (mode: 'day' | 'week') => void;

  // Booking creation sheet (new flow)
  bookingSheet: BookingSheetState;
  openBookingSheet: (prefilled: BookingSheetPrefill) => void;
  closeBookingSheet: () => void;

  // Booking wizard (deprecated — kept for backward compatibility during migration)
  wizard: BookingWizardState;
  openWizard: (isStaffFlow?: boolean) => void;
  closeWizard: () => void;
  setWizardStep: (step: WizardStep) => void;
  setBookingType: (type: BookingType) => void;
  selectFacility: (facility: SelectedFacility) => void;
  selectService: (service: SelectedService) => void;
  setWizardDate: (date: Date) => void;
  setWizardTime: (time: string | null) => void;
  selectStaff: (staff: SelectedStaff | null) => void;
  toggleAddOn: (addOn: SelectedAddOn) => void;
  selectVariation: (variation: SelectedVariation) => void;
  selectMember: (member: MemberInfo | null) => void;
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  setNeedsFacility: (needs: boolean) => void;
  resetWizard: () => void;

  // Booking detail panel
  detail: BookingDetailState;
  openBookingDetail: (booking: CalendarBooking) => void;
  closeBookingDetail: () => void;

  // Check-in modal
  checkInModal: {
    isOpen: boolean;
    bookingId: string | null;
  };
  openCheckInModal: (bookingId: string) => void;
  closeCheckInModal: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const BookingContext = createContext<BookingContextValue | null>(null);

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
}

// ============================================================================
// INITIAL STATES
// ============================================================================

const initialWizardState: BookingWizardState = {
  isOpen: false,
  currentStep: 'type',
  bookingType: null,
  selectedFacility: null,
  selectedService: null,
  selectedDate: new Date(),
  selectedTime: null,
  selectedStaff: null,
  selectedAddOns: [],
  selectedVariation: null,
  selectedMember: null,
  isStaffFlow: false,
  needsFacility: false,
};

const initialDetailState: BookingDetailState = {
  isOpen: false,
  bookingId: null,
  booking: null,
};

// ============================================================================
// STEP NAVIGATION
// ============================================================================

function getStepOrder(bookingType: BookingType | null, needsFacility: boolean): WizardStep[] {
  if (bookingType === 'staff') {
    if (needsFacility) {
      return ['type', 'staff', 'select', 'facility', 'time', 'options', 'confirm'];
    }
    return ['type', 'staff', 'select', 'time', 'options', 'confirm'];
  }
  // Default facility/service flow
  return ['type', 'select', 'time', 'options', 'confirm'];
}

function getNextStep(current: WizardStep, bookingType: BookingType | null, needsFacility: boolean): WizardStep {
  const stepOrder = getStepOrder(bookingType, needsFacility);
  const index = stepOrder.indexOf(current);
  const nextStep = stepOrder[index + 1];
  return index < stepOrder.length - 1 && nextStep ? nextStep : current;
}

function getPreviousStep(current: WizardStep, bookingType: BookingType | null, needsFacility: boolean): WizardStep {
  const stepOrder = getStepOrder(bookingType, needsFacility);
  const index = stepOrder.indexOf(current);
  const prevStep = stepOrder[index - 1];
  return index > 0 && prevStep ? prevStep : current;
}

// ============================================================================
// PROVIDER
// ============================================================================

interface BookingProviderProps {
  children: ReactNode;
  defaultTab?: string;
}

export function BookingProvider({ children, defaultTab = 'calendar' }: BookingProviderProps) {
  // Active tab state
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Calendar state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Wizard state
  const [wizard, setWizard] = useState<BookingWizardState>(initialWizardState);

  // Booking creation sheet state (new flow)
  const [bookingSheet, setBookingSheet] = useState<BookingSheetState>(initialSheetState);

  // Detail panel state
  const [detail, setDetail] = useState<BookingDetailState>(initialDetailState);

  // Check-in modal state
  const [checkInModal, setCheckInModal] = useState({ isOpen: false, bookingId: null as string | null });

  // ============================================================================
  // WIZARD ACTIONS
  // ============================================================================

  const openWizard = useCallback((isStaffFlow = false) => {
    setWizard({
      ...initialWizardState,
      isOpen: true,
      isStaffFlow,
      selectedDate: selectedDate,
    });
  }, [selectedDate]);

  const closeWizard = useCallback(() => {
    setWizard((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const setWizardStep = useCallback((step: WizardStep) => {
    setWizard((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const setBookingType = useCallback((type: BookingType) => {
    setWizard((prev) => ({
      ...prev,
      bookingType: type,
      // For staff type, go to staff step first; otherwise go to select
      currentStep: type === 'staff' ? 'staff' : 'select',
    }));
  }, []);

  const selectFacility = useCallback((facility: SelectedFacility) => {
    setWizard((prev) => ({
      ...prev,
      selectedFacility: facility,
      selectedService: null,
    }));
  }, []);

  const selectService = useCallback((service: SelectedService) => {
    setWizard((prev) => ({
      ...prev,
      selectedService: service,
      selectedFacility: null,
    }));
  }, []);

  const setWizardDate = useCallback((date: Date) => {
    setWizard((prev) => ({
      ...prev,
      selectedDate: date,
      selectedTime: null, // Clear time when date changes
    }));
  }, []);

  const setWizardTime = useCallback((time: string | null) => {
    setWizard((prev) => ({ ...prev, selectedTime: time }));
  }, []);

  const selectStaff = useCallback((staff: SelectedStaff | null) => {
    setWizard((prev) => ({ ...prev, selectedStaff: staff }));
  }, []);

  const toggleAddOn = useCallback((addOn: SelectedAddOn) => {
    setWizard((prev) => {
      const exists = prev.selectedAddOns.some((a) => a.id === addOn.id);
      return {
        ...prev,
        selectedAddOns: exists
          ? prev.selectedAddOns.filter((a) => a.id !== addOn.id)
          : [...prev.selectedAddOns, addOn],
      };
    });
  }, []);

  const selectVariation = useCallback((variation: SelectedVariation) => {
    setWizard((prev) => ({ ...prev, selectedVariation: variation }));
  }, []);

  const selectMember = useCallback((member: MemberInfo | null) => {
    setWizard((prev) => ({ ...prev, selectedMember: member }));
  }, []);

  const goToNextStep = useCallback(() => {
    setWizard((prev) => ({
      ...prev,
      currentStep: getNextStep(prev.currentStep, prev.bookingType, prev.needsFacility),
    }));
  }, []);

  const goToPreviousStep = useCallback(() => {
    setWizard((prev) => ({
      ...prev,
      currentStep: getPreviousStep(prev.currentStep, prev.bookingType, prev.needsFacility),
    }));
  }, []);

  const setNeedsFacility = useCallback((needs: boolean) => {
    setWizard((prev) => ({ ...prev, needsFacility: needs }));
  }, []);

  const resetWizard = useCallback(() => {
    setWizard(initialWizardState);
  }, []);

  // ============================================================================
  // BOOKING SHEET ACTIONS (new flow)
  // ============================================================================

  const openBookingSheet = useCallback((prefilled: BookingSheetPrefill) => {
    setBookingSheet({ isOpen: true, prefilled });
  }, []);

  const closeBookingSheet = useCallback(() => {
    setBookingSheet(initialSheetState);
  }, []);

  // ============================================================================
  // DETAIL PANEL ACTIONS
  // ============================================================================

  const openBookingDetail = useCallback((booking: CalendarBooking) => {
    setDetail({
      isOpen: true,
      bookingId: booking.id,
      booking,
    });
  }, []);

  const closeBookingDetail = useCallback(() => {
    setDetail(initialDetailState);
  }, []);

  // ============================================================================
  // CHECK-IN MODAL ACTIONS
  // ============================================================================

  const openCheckInModal = useCallback((bookingId: string) => {
    setCheckInModal({ isOpen: true, bookingId });
  }, []);

  const closeCheckInModal = useCallback(() => {
    setCheckInModal({ isOpen: false, bookingId: null });
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value = useMemo<BookingContextValue>(
    () => ({
      activeTab,
      setActiveTab,
      selectedDate,
      setSelectedDate,
      viewMode,
      setViewMode,
      bookingSheet,
      openBookingSheet,
      closeBookingSheet,
      wizard,
      openWizard,
      closeWizard,
      setWizardStep,
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
      detail,
      openBookingDetail,
      closeBookingDetail,
      checkInModal,
      openCheckInModal,
      closeCheckInModal,
    }),
    [
      activeTab,
      selectedDate,
      viewMode,
      bookingSheet,
      openBookingSheet,
      closeBookingSheet,
      wizard,
      openWizard,
      closeWizard,
      setWizardStep,
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
      detail,
      openBookingDetail,
      closeBookingDetail,
      checkInModal,
      openCheckInModal,
      closeCheckInModal,
    ]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}
