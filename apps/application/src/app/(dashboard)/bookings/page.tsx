'use client';

import { useState, useMemo, useCallback } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader, Button } from '@clubvantage/ui';
import {
  useGetCalendarDayQuery,
  useGetBookingQuery,
  useGetFacilitiesQuery,
  useCheckInBookingMutation,
  useCancelBookingMutation,
  useRescheduleBookingMutation,
  useCreateBookingMutation,
  queryKeys,
} from '@clubvantage/api-client';
import { useBookingSubscription } from '@/components/bookings';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Import booking components
import {
  BookingProvider,
  useBooking,
  BookingsTabsLayout,
  type BookingsTab,
  CalendarDayView,
  CalendarDayViewSkeleton,
  BookingDetailPanel,
  CreateBookingModal,
  WaitlistTab,
  FacilitiesTab,
  ServicesTab,
  StaffTab,
  EquipmentTab,
  BookingEmptyState,
  BookingErrorState,
  // Quick booking
  useQuickBooking,
  QuickBookingPopover,
  type QuickBookingContext,
  type QuickBookingResult,
  type QuickBookingService,
} from '@/components/bookings';
import type { CalendarResource, CalendarBooking } from '@/components/bookings';
import type { BookingStatus } from '@/components/bookings';

// Import server actions
import {
  searchMembers,
  getServicesForStaff,
  prepareQuickBooking,
  // Facility CRUD
  createFacility,
  updateFacility,
  deleteFacility,
  // Service CRUD
  createService,
  updateService,
  deleteService,
  // Staff CRUD
  createStaffMember,
  updateStaffMember,
  deleteStaffMember,
  type FacilityCrudResult,
  type ServiceCrudResult,
  type StaffCrudResult,
} from './actions';
import type { CreateFacilityInput, UpdateFacilityInput, CreateServiceInput, UpdateServiceInput, CreateStaffMemberInput, UpdateStaffMemberInput, ResourceTypeEnum } from '@clubvantage/api-client';

// Helper to format date for API
function formatDateForApi(date: Date): string {
  const isoDate = date.toISOString().split('T')[0];
  return isoDate || new Date().toISOString().split('T')[0]!;
}

// Mock quick booking services
const quickBookingServices: QuickBookingService[] = [
  { id: 's1', name: 'Thai Massage', duration: 90, price: 2000, category: 'Spa' },
  { id: 's2', name: 'Swedish Massage', duration: 60, price: 1500, category: 'Spa' },
  { id: 's3', name: 'Hot Stone Therapy', duration: 75, price: 2500, category: 'Spa' },
  { id: 's5', name: 'Tennis Lesson (Private)', duration: 60, price: 1800, category: 'Sports' },
  { id: 's7', name: 'Yoga Class', duration: 60, price: 500, category: 'Fitness' },
  { id: 's8', name: 'Personal Training', duration: 60, price: 1500, category: 'Fitness' },
];

// Helper to map API status to component status
function mapStatus(status: string): BookingStatus {
  const statusMap: Record<string, BookingStatus> = {
    PENDING: 'confirmed', // Map pending to confirmed for display
    CONFIRMED: 'confirmed',
    CHECKED_IN: 'checked_in',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    NO_SHOW: 'no_show',
  };
  return statusMap[status] || 'confirmed';
}

// Helper to map resource type
function mapResourceType(type: string): 'court' | 'spa' | 'studio' | 'pool' | 'room' {
  const typeMap: Record<string, 'court' | 'spa' | 'studio' | 'pool' | 'room'> = {
    COURT: 'court',
    SPA: 'spa',
    STUDIO: 'studio',
    POOL: 'pool',
    ROOM: 'room',
  };
  return typeMap[type] || 'room';
}

// ============================================================================
// INNER COMPONENT (uses context)
// ============================================================================

function BookingsPageContent() {
  const {
    activeTab,
    setActiveTab,
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
    openWizard,
  } = useBooking();

  const queryClient = useQueryClient();
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  // Fetch calendar data from API
  const {
    data: calendarData,
    isLoading: isCalendarLoading,
    error: calendarError,
  } = useGetCalendarDayQuery(
    { date: formatDateForApi(selectedDate) },
    { staleTime: 30000 } // 30 seconds
  );

  // Fetch selected booking details
  const { data: bookingDetailData } = useGetBookingQuery(
    { id: selectedBookingId || '' },
    { enabled: !!selectedBookingId }
  );

  // Fetch facilities for resource mapping
  const { data: facilitiesData } = useGetFacilitiesQuery();

  // Mutations
  const checkInMutation = useCheckInBookingMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.calendarDay({ date: formatDateForApi(selectedDate) }) });
    },
  });

  const cancelMutation = useCancelBookingMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.calendarDay({ date: formatDateForApi(selectedDate) }) });
      setDetailPanelOpen(false);
    },
  });

  const rescheduleMutation = useRescheduleBookingMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.calendarDay({ date: formatDateForApi(selectedDate) }) });
    },
  });

  const createBookingMutation = useCreateBookingMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.calendarDay({ date: formatDateForApi(selectedDate) }) });
      toast.success('Booking created successfully');
    },
    onError: (error: Error) => {
      toast.error('Failed to create booking', {
        description: error.message,
      });
    },
  });

  // Quick booking state
  const [quickBookContext, setQuickBookContext] = useState<QuickBookingContext | null>(null);
  const [isQuickBookOpen, setIsQuickBookOpen] = useState(false);

  // Quick booking handlers
  const handleQuickBookSubmit = useCallback(async (result: QuickBookingResult) => {
    try {
      // Prepare and validate the booking
      const prepared = await prepareQuickBooking({
        clubId: 'default-club', // TODO: Get from context
        memberId: result.memberId,
        serviceId: result.serviceId,
        staffId: result.staffId,
        facilityId: result.facilityId,
        startTime: result.date,
        durationMinutes: result.duration,
      });

      if (!prepared.valid) {
        toast.error('Booking validation failed', {
          description: prepared.errors?.join(', '),
        });
        return;
      }

      // Show warnings if any
      if (prepared.warnings?.length) {
        toast.warning('Booking created with warnings', {
          description: prepared.warnings.join(', '),
        });
      }

      // Calculate end time
      const endTime = new Date(result.date);
      endTime.setMinutes(endTime.getMinutes() + result.duration);

      // Create the booking via GraphQL mutation
      await createBookingMutation.mutateAsync({
        input: {
          bookingType: 'SERVICE',
          memberId: result.memberId,
          serviceId: result.serviceId,
          staffId: result.staffId,
          facilityId: result.facilityId,
          startTime: result.date.toISOString(),
          endTime: endTime.toISOString(),
        },
      });

      setIsQuickBookOpen(false);
    } catch (error) {
      console.error('Quick booking error:', error);
      throw error; // Re-throw to keep popover open
    }
  }, [createBookingMutation]);

  const handleOpenFullWizard = useCallback(() => {
    setIsQuickBookOpen(false);
    // TODO: Pass context to wizard
    openWizard(true);
  }, [openWizard]);

  const handleMemberSearch = useCallback(async (query: string) => {
    const results = await searchMembers(query);
    return results.map((m) => ({
      id: m.id,
      name: m.name,
      memberNumber: m.memberNumber,
      membershipType: m.membershipType,
      status: m.status,
    }));
  }, []);

  // Subscribe to real-time updates
  useBookingSubscription({
    date: selectedDate,
  });

  // Transform API data to component format
  const resources: CalendarResource[] = useMemo(() => {
    if (!calendarData?.calendarDay?.resources) return [];
    return calendarData.calendarDay.resources.map((r) => ({
      id: r.id,
      name: r.name,
      type: mapResourceType(r.type),
      subtitle: r.subtitle,
    }));
  }, [calendarData]);

  const bookings: CalendarBooking[] = useMemo(() => {
    if (!calendarData?.calendarDay?.bookings) return [];
    return calendarData.calendarDay.bookings.map((b) => ({
      id: b.id,
      resourceId: b.resourceId,
      startTime: b.startTime,
      endTime: b.endTime,
      status: mapStatus(b.status),
      serviceName: b.serviceName,
      memberName: b.memberName,
      memberPhotoUrl: b.memberPhotoUrl,
      bufferBefore: b.bufferBefore,
      bufferAfter: b.bufferAfter,
    }));
  }, [calendarData]);

  // Convert API booking to detail panel format
  const bookingDetail = useMemo(() => {
    if (!bookingDetailData?.booking) return null;
    const b = bookingDetailData.booking;

    // Map member status to what the detail panel expects
    const memberStatus: 'ACTIVE' | 'SUSPENDED' =
      b.member.status === 'ACTIVE' ? 'ACTIVE' : 'SUSPENDED';

    return {
      id: b.id,
      member: {
        name: `${b.member.firstName} ${b.member.lastName}`,
        number: b.member.memberId,
        status: memberStatus,
      },
      service: {
        name: b.service?.name || 'Facility Booking',
        duration: b.durationMinutes,
      },
      date: new Date(b.startTime),
      startTime: new Date(b.startTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      endTime: new Date(b.endTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      staff: b.staff ? { name: `${b.staff.firstName} ${b.staff.lastName}` } : undefined,
      facility: {
        name: b.resource?.name || b.facility?.name || 'Unknown',
      },
      pricing: b.pricing
        ? {
            base: b.pricing.basePrice,
            modifiers: b.pricing.modifiers.map((m) => ({
              label: m.label,
              amount: m.amount,
              isPercentage: m.isPercentage,
            })),
            total: b.pricing.total,
          }
        : { base: 0, modifiers: [], total: 0 },
      status: mapStatus(b.status),
      createdAt: new Date(b.createdAt),
      createdBy: 'System', // TODO: Add to GraphQL query when schema supports it
      checkedInAt: undefined, // TODO: Add to GraphQL query when schema supports it
      cancelledAt: undefined, // TODO: Add to GraphQL query when schema supports it
      cancelReason: undefined, // TODO: Add to GraphQL query when schema supports it
    };
  }, [bookingDetailData]);

  // Date navigation
  const goToPrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Booking handlers
  const handleBookingClick = useCallback((bookingId: string) => {
    setSelectedBookingId(bookingId);
    setDetailPanelOpen(true);
  }, []);

  const handleSlotClick = useCallback((resourceId: string, time: Date) => {
    // Find the resource to get its name
    const resource = resources.find((r) => r.id === resourceId);
    const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

    // Open quick booking popover with context
    setQuickBookContext({
      date: time,
      time: timeStr,
      facilityId: resourceId,
      facilityName: resource?.name || 'Unknown',
      resourceType: 'facility',
    });
    setIsQuickBookOpen(true);
  }, [resources]);

  const handleCloseDetail = useCallback(() => {
    setDetailPanelOpen(false);
    setSelectedBookingId(null);
  }, []);

  const handleCheckIn = useCallback(async () => {
    if (!selectedBookingId) return;
    try {
      await checkInMutation.mutateAsync({ input: { bookingId: selectedBookingId } });
      toast.success('Member checked in successfully');
    } catch (error) {
      toast.error('Failed to check in');
    }
  }, [selectedBookingId, checkInMutation]);

  const handleCancel = useCallback(async () => {
    if (!selectedBookingId) return;
    try {
      await cancelMutation.mutateAsync({
        input: { id: selectedBookingId, reason: 'Cancelled by staff' },
      });
      toast.success('Booking cancelled');
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  }, [selectedBookingId, cancelMutation]);

  // Render tab content
  const renderTabContent = (tab: BookingsTab) => {
    switch (tab) {
      case 'calendar':
        return (
          <div className="space-y-4 p-4 sm:p-6">
            {/* Calendar Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={goToPrevDay}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="min-w-[240px] text-center text-lg font-semibold sm:min-w-[280px]">
                  {formatDateDisplay(selectedDate)}
                </h2>
                <Button variant="outline" size="icon" onClick={goToNextDay}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Today
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {/* View mode toggle */}
                <div className="flex rounded-md border border-border">
                  <Button
                    variant={viewMode === 'day' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="rounded-r-none"
                    onClick={() => setViewMode('day')}
                  >
                    Day
                  </Button>
                  <Button
                    variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="rounded-l-none"
                    onClick={() => setViewMode('week')}
                  >
                    Week
                  </Button>
                </div>
              </div>
            </div>

            {/* Calendar View */}
            {calendarError ? (
              <BookingErrorState
                variant="server"
                title="Failed to load calendar"
                description="Unable to load calendar data. Please try again."
                onRetry={() => queryClient.invalidateQueries({ queryKey: ['GetCalendarDay'] })}
              />
            ) : isCalendarLoading ? (
              <CalendarDayViewSkeleton resourceCount={6} />
            ) : resources.length === 0 ? (
              <BookingEmptyState
                variant="no-data"
                title="No resources configured"
                description="No resources are configured for this facility."
              />
            ) : (
              <CalendarDayView
                date={selectedDate}
                resources={resources}
                bookings={bookings}
                operatingHours={{ start: '06:00', end: '22:00' }}
                onBookingClick={handleBookingClick}
                onSlotClick={handleSlotClick}
              />
            )}
          </div>
        );

      case 'waitlist':
        return (
          <div className="p-4 sm:p-6">
            <WaitlistTab
              onNotify={async (id) => { console.log('Notify:', id); }}
              onConvert={async (id) => { console.log('Convert:', id); }}
              onRemove={async (id) => { console.log('Remove:', id); }}
            />
          </div>
        );

      case 'facilities':
        return (
          <div className="p-4 sm:p-6">
            <FacilitiesTab
              onViewSchedule={(id) => console.log('View schedule:', id)}
              onToggleStatus={(id) => console.log('Toggle status:', id)}
              onSetMaintenance={(id) => console.log('Set maintenance:', id)}
              onCreateFacility={async (data) => {
                const typeMap: Record<string, ResourceTypeEnum> = {
                  court: 'COURT' as ResourceTypeEnum,
                  spa: 'SPA' as ResourceTypeEnum,
                  studio: 'STUDIO' as ResourceTypeEnum,
                  pool: 'POOL' as ResourceTypeEnum,
                  room: 'ROOM' as ResourceTypeEnum,
                };
                const input: CreateFacilityInput = {
                  name: data.name,
                  type: typeMap[data.type] || ('ROOM' as ResourceTypeEnum),
                  location: data.location,
                  capacity: data.capacity,
                  description: data.description || undefined,
                  features: data.features.length > 0 ? data.features : undefined,
                  operatingHours: data.operatingHours.map((h) => ({
                    dayOfWeek: h.dayOfWeek,
                    isOpen: h.isOpen,
                    openTime: h.openTime || undefined,
                    closeTime: h.closeTime || undefined,
                  })),
                  isActive: data.isActive,
                };
                const result = await createFacility(input);
                if (result.success) {
                  toast.success('Facility created successfully');
                  queryClient.invalidateQueries({ queryKey: ['GetFacilities'] });
                } else {
                  toast.error(result.error || 'Failed to create facility');
                  throw new Error(result.error);
                }
              }}
              onUpdateFacility={async (data) => {
                if (!data.id) return;
                const typeMap: Record<string, ResourceTypeEnum> = {
                  court: 'COURT' as ResourceTypeEnum,
                  spa: 'SPA' as ResourceTypeEnum,
                  studio: 'STUDIO' as ResourceTypeEnum,
                  pool: 'POOL' as ResourceTypeEnum,
                  room: 'ROOM' as ResourceTypeEnum,
                };
                const input: UpdateFacilityInput = {
                  id: data.id,
                  name: data.name || undefined,
                  type: data.type ? typeMap[data.type] : undefined,
                  location: data.location || undefined,
                  capacity: data.capacity || undefined,
                  description: data.description || undefined,
                  features: data.features.length > 0 ? data.features : undefined,
                  operatingHours: data.operatingHours.map((h) => ({
                    dayOfWeek: h.dayOfWeek,
                    isOpen: h.isOpen,
                    openTime: h.openTime || undefined,
                    closeTime: h.closeTime || undefined,
                  })),
                  isActive: data.isActive,
                };
                const result = await updateFacility(input);
                if (result.success) {
                  toast.success('Facility updated successfully');
                  queryClient.invalidateQueries({ queryKey: ['GetFacilities'] });
                } else {
                  toast.error(result.error || 'Failed to update facility');
                  throw new Error(result.error);
                }
              }}
              onDeleteFacility={async (id) => {
                const result = await deleteFacility(id);
                if (result.success) {
                  toast.success('Facility deleted successfully');
                  queryClient.invalidateQueries({ queryKey: ['GetFacilities'] });
                } else {
                  toast.error(result.error || 'Failed to delete facility');
                  throw new Error(result.error);
                }
              }}
            />
          </div>
        );

      case 'services':
        return (
          <div className="p-4 sm:p-6">
            <ServicesTab
              onViewDetails={(id) => console.log('View service details:', id)}
              onToggleStatus={(id) => console.log('Toggle service status:', id)}
              onEditService={(id) => console.log('Edit service:', id)}
              onCreateService={async (data) => {
                const input: CreateServiceInput = {
                  name: data.name,
                  category: data.category,
                  description: data.description || undefined,
                  durationMinutes: data.durationMinutes,
                  bufferMinutes: data.bufferMinutes || undefined,
                  basePrice: data.basePrice,
                  isActive: data.isActive,
                  maxParticipants: data.maxParticipants || undefined,
                  requiredCapabilities: data.requiredCapabilities.length > 0 ? data.requiredCapabilities : undefined,
                  requiredFacilityFeatures: data.requiredFacilityFeatures.length > 0 ? data.requiredFacilityFeatures : undefined,
                  tierDiscounts: data.tierDiscounts.length > 0 ? data.tierDiscounts.map((t) => ({
                    tierName: t.tierName,
                    discountPercent: t.discountPercent,
                  })) : undefined,
                  variations: data.variations.length > 0 ? data.variations.map((v) => ({
                    name: v.name,
                    priceModifier: v.priceModifier,
                    priceType: v.priceType === 'add' ? 'add' : 'multiply',
                  })) : undefined,
                };
                const result = await createService(input);
                if (result.success) {
                  toast.success('Service created successfully');
                  queryClient.invalidateQueries({ queryKey: ['GetServices'] });
                } else {
                  toast.error(result.error || 'Failed to create service');
                  throw new Error(result.error);
                }
              }}
              onUpdateService={async (data) => {
                if (!data.id) return;
                const input: UpdateServiceInput = {
                  id: data.id,
                  name: data.name || undefined,
                  category: data.category || undefined,
                  description: data.description || undefined,
                  durationMinutes: data.durationMinutes || undefined,
                  bufferMinutes: data.bufferMinutes || undefined,
                  basePrice: data.basePrice || undefined,
                  isActive: data.isActive,
                  maxParticipants: data.maxParticipants || undefined,
                  requiredCapabilities: data.requiredCapabilities.length > 0 ? data.requiredCapabilities : undefined,
                  requiredFacilityFeatures: data.requiredFacilityFeatures.length > 0 ? data.requiredFacilityFeatures : undefined,
                  tierDiscounts: data.tierDiscounts.length > 0 ? data.tierDiscounts.map((t) => ({
                    tierName: t.tierName,
                    discountPercent: t.discountPercent,
                  })) : undefined,
                  variations: data.variations.length > 0 ? data.variations.map((v) => ({
                    name: v.name,
                    priceModifier: v.priceModifier,
                    priceType: v.priceType === 'add' ? 'add' : 'multiply',
                  })) : undefined,
                };
                const result = await updateService(input);
                if (result.success) {
                  toast.success('Service updated successfully');
                  queryClient.invalidateQueries({ queryKey: ['GetServices'] });
                } else {
                  toast.error(result.error || 'Failed to update service');
                  throw new Error(result.error);
                }
              }}
              onDeleteService={async (id) => {
                const result = await deleteService(id);
                if (result.success) {
                  toast.success('Service deleted successfully');
                  queryClient.invalidateQueries({ queryKey: ['GetServices'] });
                } else {
                  toast.error(result.error || 'Failed to delete service');
                  throw new Error(result.error);
                }
              }}
            />
          </div>
        );

      case 'staff':
        return (
          <div className="p-4 sm:p-6">
            <StaffTab
              onViewSchedule={(id) => console.log('View staff schedule:', id)}
              onSetAvailability={(id) => console.log('Set availability:', id)}
              onCreateStaff={async (data) => {
                const input: CreateStaffMemberInput = {
                  firstName: data.firstName,
                  lastName: data.lastName,
                  email: data.email || undefined,
                  phone: data.phone || undefined,
                  avatarUrl: data.avatarUrl || undefined,
                  userId: data.userId || undefined,
                  defaultFacilityId: data.defaultFacilityId || undefined,
                  isActive: data.isActive,
                  capabilities: data.capabilities.length > 0 ? data.capabilities.map((c) => ({
                    capability: c.capability,
                    level: c.level,
                  })) : undefined,
                  certifications: data.certifications.length > 0 ? data.certifications.map((c) => ({
                    name: c.name,
                    expiresAt: c.expiresAt,
                  })) : undefined,
                  workingHours: data.workingHours.map((h) => ({
                    dayOfWeek: h.dayOfWeek,
                    isOpen: h.isOpen,
                    openTime: h.openTime || undefined,
                    closeTime: h.closeTime || undefined,
                  })),
                };
                const result = await createStaffMember(input);
                if (result.success) {
                  toast.success('Staff member created successfully');
                  queryClient.invalidateQueries({ queryKey: ['GetBookingStaff'] });
                } else {
                  toast.error(result.error || 'Failed to create staff member');
                  throw new Error(result.error);
                }
              }}
              onUpdateStaff={async (data) => {
                if (!data.id) return;
                const input: UpdateStaffMemberInput = {
                  id: data.id,
                  firstName: data.firstName || undefined,
                  lastName: data.lastName || undefined,
                  email: data.email || undefined,
                  phone: data.phone || undefined,
                  avatarUrl: data.avatarUrl || undefined,
                  userId: data.userId || undefined,
                  defaultFacilityId: data.defaultFacilityId || undefined,
                  isActive: data.isActive,
                  capabilities: data.capabilities.length > 0 ? data.capabilities.map((c) => ({
                    capability: c.capability,
                    level: c.level,
                  })) : undefined,
                  certifications: data.certifications.length > 0 ? data.certifications.map((c) => ({
                    name: c.name,
                    expiresAt: c.expiresAt,
                  })) : undefined,
                  workingHours: data.workingHours.map((h) => ({
                    dayOfWeek: h.dayOfWeek,
                    isOpen: h.isOpen,
                    openTime: h.openTime || undefined,
                    closeTime: h.closeTime || undefined,
                  })),
                };
                const result = await updateStaffMember(input);
                if (result.success) {
                  toast.success('Staff member updated successfully');
                  queryClient.invalidateQueries({ queryKey: ['GetBookingStaff'] });
                } else {
                  toast.error(result.error || 'Failed to update staff member');
                  throw new Error(result.error);
                }
              }}
              onDeleteStaff={async (id) => {
                const result = await deleteStaffMember(id);
                if (result.success) {
                  toast.success('Staff member deleted successfully');
                  queryClient.invalidateQueries({ queryKey: ['GetBookingStaff'] });
                } else {
                  toast.error(result.error || 'Failed to delete staff member');
                  throw new Error(result.error);
                }
              }}
            />
          </div>
        );

      case 'equipment':
        return (
          <div className="p-4 sm:p-6">
            <EquipmentTab
              onViewDetails={(id) => console.log('View equipment details:', id)}
              onCheckOut={(id) => console.log('Check out equipment:', id)}
              onCheckIn={(id) => console.log('Check in equipment:', id)}
              onSetMaintenance={(id) => console.log('Set maintenance:', id)}
            />
          </div>
        );

      default:
        return <BookingEmptyState variant="no-data" />;
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 p-6 pb-0">
        <PageHeader
          title="Bookings"
          description="Manage facility bookings and service appointments"
          breadcrumbs={[{ label: 'Bookings' }]}
          actions={
            <Button onClick={() => openWizard(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          }
        />
      </div>

      <div className="flex-1 overflow-hidden px-6 pb-6">
        <BookingsTabsLayout
          activeTab={activeTab as BookingsTab}
          onTabChange={(tab) => setActiveTab(tab)}
          renderContent={renderTabContent}
        />
      </div>

      {/* Booking Detail Panel */}
      <BookingDetailPanel
        isOpen={detailPanelOpen}
        onClose={handleCloseDetail}
        booking={bookingDetail}
        onCheckIn={handleCheckIn}
        onCancel={handleCancel}
        onModify={() => console.log('Modify')}
        onEdit={() => console.log('Edit')}
      />

      {/* Create Booking Modal */}
      <CreateBookingModal />

      {/* Quick Booking Popover */}
      {quickBookContext && (
        <QuickBookingPopover
          open={isQuickBookOpen}
          context={quickBookContext}
          services={quickBookingServices}
          onSubmit={handleQuickBookSubmit}
          onOpenFullWizard={handleOpenFullWizard}
          onClose={() => setIsQuickBookOpen(false)}
          onSearchMembers={handleMemberSearch}
          isSubmitting={createBookingMutation.isPending}
          side="right"
          align="start"
        >
          {/* Hidden trigger - popover is controlled via open prop */}
          <div className="fixed -left-[9999px] top-0 h-0 w-0" aria-hidden="true" />
        </QuickBookingPopover>
      )}
    </div>
  );
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

export default function BookingsPage() {
  return (
    <BookingProvider>
      <BookingsPageContent />
    </BookingProvider>
  );
}
