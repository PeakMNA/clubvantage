'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { BookingStatus } from './types';

// ============================================================================
// TYPES
// ============================================================================

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

  // Booking creation sheet
  bookingSheet: BookingSheetState;
  openBookingSheet: (prefilled: BookingSheetPrefill) => void;
  closeBookingSheet: () => void;

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

const initialDetailState: BookingDetailState = {
  isOpen: false,
  bookingId: null,
  booking: null,
};

// ============================================================================
// PROVIDER
// ============================================================================

interface BookingProviderProps {
  children: ReactNode;
  defaultTab?: string;
}

export function BookingProvider({ children, defaultTab = 'facility' }: BookingProviderProps) {
  // Active tab state
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Calendar state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  // Booking creation sheet state
  const [bookingSheet, setBookingSheet] = useState<BookingSheetState>(initialSheetState);

  // Detail panel state
  const [detail, setDetail] = useState<BookingDetailState>(initialDetailState);

  // Check-in modal state
  const [checkInModal, setCheckInModal] = useState({ isOpen: false, bookingId: null as string | null });

  // ============================================================================
  // BOOKING SHEET ACTIONS
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
