// Types
export type { BookingStatus, CalendarSlotStatus, CoreBookingStatus, BookingStatusConfig } from './types';
export type { BookingsTab } from './bookings-tabs-layout';

// Hooks
export {
  useBookingSubscription,
  useMockBookingSubscription,
  type BookingEventType,
  type BookingUpdate,
  type UseBookingSubscriptionOptions,
  type UseBookingSubscriptionResult,
} from './hooks';

// Utilities
export {
  bookingStatusConfig,
  getBookingStatusStyles,
  getBookingStatusLabel,
  isActiveBookingStatus,
  isTerminalBookingStatus,
} from './booking-status-utils';

// Provider
export { BookingProvider, useBooking, type BookingSheetPrefill } from './booking-provider';

// Components
export { BookingStatusBadge, BookingStatusDot } from './booking-status-badge';
export { BookingsTabsLayout, useBookingsTab } from './bookings-tabs-layout';
export { BookingsSubheader } from './bookings-subheader';
export { BookingsPageShell } from './bookings-page-shell';
export {
  BookingBlock,
  BookingBlockPlaceholder,
  BookingBlockSkeleton,
  type BookingBlockProps,
} from './booking-block';
export {
  TimeSlotButton,
  TimeSlotButtonSkeleton,
  TimeSlotGroup,
  type TimeSlotButtonProps,
  type TimeSlotStatus,
} from './time-slot-button';
export {
  FilterChips,
  FilterChipButton,
  FilterChipGroup,
  FilterSection,
  ActiveFilterBar,
  type FilterChip,
  type FilterChipsProps,
} from './filter-chips';
export {
  CalendarDayView,
  CalendarDayViewSkeleton,
  type CalendarResource,
  type CalendarBooking,
  type CalendarDayViewProps,
} from './calendar-day-view';
export {
  BookingDetailPanel,
  BookingDetailPanelSkeleton,
  type BookingDetailPanelProps,
} from './booking-detail-panel';
export type {
  BookingPayment,
  BookingNote,
} from './booking-detail-panel';
export {
  CheckInInterface,
  type CheckInInterfaceProps,
} from './check-in-interface';
export {
  WaitlistTab,
  type WaitlistTabProps,
} from './waitlist-tab';
export {
  FacilitiesTab,
  type FacilitiesTabProps,
} from './facilities-tab';
export {
  ServicesTab,
  type ServicesTabProps,
} from './services-tab';
export {
  StaffTab,
  type StaffTabProps,
} from './staff-tab';
export {
  EquipmentTab,
  type EquipmentTabProps,
} from './equipment-tab';

// Editor components (for modals)
export {
  OperatingHoursEditor,
  getDefaultHours,
  type DayHours,
  type OperatingHoursEditorProps,
} from './operating-hours-editor';
export {
  CapabilitiesEditor,
  type StaffCapability,
  type CapabilitiesEditorProps,
} from './capabilities-editor';
export {
  CertificationsEditor,
  type StaffCertification,
  type CertificationsEditorProps,
} from './certifications-editor';
export {
  VariationsEditor,
  type ServiceVariation,
  type VariationsEditorProps,
} from './variations-editor';

// Modal components
export {
  FacilityModal,
  type FacilityModalProps,
  type FacilityFormData,
} from './facility-modal';
export {
  ServiceModal,
  type ServiceModalProps,
  type ServiceFormData,
} from './service-modal';
export {
  StaffModal,
  type StaffModalProps,
  type StaffFormData,
} from './staff-modal';
export {
  DeleteConfirmDialog,
  type DeleteConfirmDialogProps,
} from './delete-confirm-dialog';
export {
  SuspendedMemberWarning,
  SuspendedMemberBanner,
  SuspendedMemberInlineAlert,
  type SuspendedMemberWarningProps,
} from './suspended-member-warning';
export {
  BookingEmptyState,
  BookingCardSkeleton,
  BookingListSkeleton,
  BookingGridSkeleton,
  CalendarDaySkeleton,
  BookingDetailSkeleton,
  BookingPageSkeleton,
  BookingErrorState,
  BookingInlineError,
  BookingDataState,
  type BookingEmptyStateProps,
  type BookingLoadingSkeletonProps,
  type BookingErrorStateProps,
  type BookingDataStateProps,
} from './booking-states';

// Calendar sub-components
export {
  // Core components
  BufferBlock,
  BufferBlockCompact,
  EmptySlot,
  EmptySlotRow,
  TimeColumn,
  TimeColumnCompact,
  TimeColumnHeader,
  CurrentTimeIndicator,
  CurrentTimeIndicatorMinimal,
  useCurrentTimePosition,
  // Week view
  WeekViewGrid,
  WeekViewGridSkeleton,
  // Status legend
  StatusLegend,
  StatusLegendCard,
  // Mobile
  MobileAgendaView,
  MobileAgendaViewSkeleton,
  MobileDatePicker,
  // Drag and drop
  DragPreview,
  DropZone,
  DragHandle,
  DragOverlay,
  useDragDrop,
  // Resource headers
  ResourceHeader,
  ResourceHeaderGroup,
  ResourceHeaderSkeleton,
  StaffHeader,
  // Types
  type BufferBlockProps,
  type EmptySlotProps,
  type EmptySlotRowProps,
  type TimeColumnProps,
  type CurrentTimeIndicatorProps,
  type WeekViewGridProps,
  type WeekViewResource,
  type WeekViewBooking,
  type StatusLegendProps,
  type MobileAgendaViewProps,
  type MobileAgendaBooking,
  type DragPreviewProps,
  type DropZoneProps,
  type DragHandleProps,
  type DragBooking,
  type DropTarget,
  type DragDropState,
  type ResourceHeaderProps,
  type ResourceHeaderGroupProps,
  type StaffHeaderProps,
  type ResourceType,
  // Complete calendar grid
  CalendarGrid,
  CalendarGridSkeleton,
  type CalendarGridProps,
  type CalendarGridResource,
  type CalendarGridBooking,
} from './calendar';

// Shared booking components
export {
  BookingCreationSheet,
  type BookingCreationSheetProps,
} from './shared/booking-creation-sheet';
export {
  BookingSearchBar,
  type BookingSearchBarProps,
} from './shared/booking-search-bar';
export {
  StaffSchedule,
  StaffScheduleSkeleton,
  type StaffScheduleProps,
  type SlotStatus,
  type StaffTimelineSlot,
} from './shared/staff-schedule';
export {
  ServicePosPanel,
  ServicePosPanelSkeleton,
  type ServiceCard,
  type ServicePosPanelProps,
} from './shared/service-pos-panel';
