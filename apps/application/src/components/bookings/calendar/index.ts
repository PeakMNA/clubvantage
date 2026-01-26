/**
 * Calendar Components
 *
 * Modular building blocks for the booking calendar grid.
 * These components can be composed to create different calendar views.
 */

// Buffer Block - Non-interactive setup/cleanup time indicator
export {
  BufferBlock,
  BufferBlockCompact,
  type BufferBlockProps,
} from './buffer-block';

// Empty Slot - Clickable available time slot
export {
  EmptySlot,
  EmptySlotRow,
  type EmptySlotProps,
  type EmptySlotRowProps,
  type SlotConstraint,
} from './empty-slot';

// Time Column - Fixed left column with time labels
export {
  TimeColumn,
  TimeColumnCompact,
  TimeColumnHeader,
  type TimeColumnProps,
} from './time-column';

// Current Time Indicator - Red line showing current time
export {
  CurrentTimeIndicator,
  CurrentTimeIndicatorMinimal,
  useCurrentTimePosition,
  type CurrentTimeIndicatorProps,
} from './current-time-indicator';

// Week View Grid - 7-day overview with booking density
export {
  WeekViewGrid,
  WeekViewGridSkeleton,
  type WeekViewGridProps,
  type WeekViewResource,
  type WeekViewBooking,
} from './week-view-grid';

// Status Legend - Color key for booking statuses
export {
  StatusLegend,
  StatusLegendCard,
  FirstVisitStatusLegend,
  useFirstVisitLegend,
  type StatusLegendProps,
  type FirstVisitStatusLegendProps,
} from './status-legend';

// Mobile Agenda View - Mobile-friendly agenda layout
export {
  MobileAgendaView,
  MobileAgendaViewSkeleton,
  MobileDatePicker,
  type MobileAgendaViewProps,
  type MobileAgendaBooking,
} from './mobile-agenda-view';

// Drag and Drop - Calendar booking rescheduling
export {
  DragPreview,
  DropZone,
  DragHandle,
  DragOverlay,
  useDragDrop,
  type DragPreviewProps,
  type DropZoneProps,
  type DragHandleProps,
  type DragBooking,
  type DropTarget,
  type DragDropState,
} from './drag-drop';

// Resource Headers - Calendar column headers
export {
  ResourceHeader,
  ResourceHeaderGroup,
  ResourceHeaderSkeleton,
  StaffHeader,
  type ResourceHeaderProps,
  type ResourceHeaderGroupProps,
  type StaffHeaderProps,
  type ResourceType,
} from './resource-header';

// Calendar Grid - Complete day view grid
export {
  CalendarGrid,
  CalendarGridSkeleton,
  type CalendarGridProps,
  type CalendarGridResource,
  type CalendarGridBooking,
} from './calendar-grid';

// Calendar Keyboard Navigation
export {
  useCalendarKeyboardNav,
  type FocusedCell,
  type UseCalendarKeyboardNavOptions,
  type UseCalendarKeyboardNavReturn,
} from './use-calendar-keyboard-nav';

// Quick Booking Popover - Inline booking from calendar slots
export {
  QuickBookingPopover,
  QuickBookingPopoverSkeleton,
  type QuickBookingPopoverProps,
  type QuickBookingContext,
  type QuickBookingMember,
  type QuickBookingService,
  type QuickBookingResult,
} from './quick-booking-popover';

// Quick Booking Hook - State management for quick booking
export {
  useQuickBooking,
  buildQuickBookingContext,
  buildStaffQuickBookingContext,
  buildFacilityQuickBookingContext,
  type UseQuickBookingOptions,
  type UseQuickBookingReturn,
} from './use-quick-booking';

// Empty Slot with Quick Book - Integrated slot + popover
export {
  EmptySlotWithQuickBook,
  EmptySlotWithQuickBookSkeleton,
  type EmptySlotWithQuickBookProps,
} from './empty-slot-with-quick-book';
