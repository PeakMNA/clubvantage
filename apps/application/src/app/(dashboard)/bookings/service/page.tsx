'use client'

import { useState, useMemo, useCallback } from 'react'
import { Button } from '@clubvantage/ui'
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import { useGetServicesQuery } from '@clubvantage/api-client'
import { toast } from 'sonner'

import {
  useBooking,
  BookingCreationSheet,
  BookingSearchBar,
  StaffSchedule,
} from '@/components/bookings'
import {
  ServicePosPanel,
  type ServiceCard,
} from '@/components/bookings/shared/service-pos-panel'

// ============================================================================
// HELPERS
// ============================================================================

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ============================================================================
// PAGE STATE
// ============================================================================

type ServicePageView = 'pos' | 'staff-schedule'

// ============================================================================
// PAGE
// ============================================================================

export default function BookingsServicePage() {
  const { selectedDate, setSelectedDate, bookingSheet, openBookingSheet, closeBookingSheet } = useBooking()

  // View state
  const [view, setView] = useState<ServicePageView>('pos')
  const [selectedService, setSelectedService] = useState<ServiceCard | null>(null)
  const [staffSearch, setStaffSearch] = useState('')

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  const { data: servicesData, isLoading: servicesLoading } = useGetServicesQuery()

  // Transform services for POS panel
  const services: ServiceCard[] = useMemo(() => {
    if (!servicesData?.services) return []
    return servicesData.services.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      durationMinutes: s.durationMinutes,
      basePrice: s.basePrice,
      isActive: s.isActive,
      description: s.description,
      enforceQualification: s.enforceQualification,
      requiredCapabilities: s.requiredCapabilities as string[] | undefined,
    }))
  }, [servicesData])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const goToPrevDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() - 1)
    setSelectedDate(d)
  }

  const goToNextDay = () => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + 1)
    setSelectedDate(d)
  }

  const goToToday = () => setSelectedDate(new Date())

  const handleServiceSelect = useCallback((service: ServiceCard) => {
    setSelectedService(service)
    setStaffSearch('')
    setView('staff-schedule')
  }, [])

  const handleBackToPOS = useCallback(() => {
    setView('pos')
    setSelectedService(null)
    setStaffSearch('')
  }, [])

  const handleStaffSlotSelect = useCallback(
    (staffId: string, staffName: string, time: string) => {
      if (!selectedService) return

      // Calculate end time from service duration
      const [h, m] = time.split(':').map(Number)
      const totalMin = (h ?? 0) * 60 + (m ?? 0) + selectedService.durationMinutes
      const endTime = `${Math.floor(totalMin / 60)
        .toString()
        .padStart(2, '0')}:${(totalMin % 60).toString().padStart(2, '0')}`

      openBookingSheet({
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        staffId,
        staffName,
        date: selectedDate,
        startTime: time,
        endTime,
      })
    },
    [selectedService, selectedDate, openBookingSheet]
  )

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 sm:px-6">
          {/* Left: Back button (when in staff schedule view) or Title */}
          <div className="flex items-center gap-3">
            {view === 'staff-schedule' && selectedService ? (
              <>
                <Button variant="ghost" size="sm" onClick={handleBackToPOS} className="gap-1.5">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back
                </Button>
                <div className="h-5 w-px bg-stone-200 dark:bg-stone-700" />
                <div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {selectedService.name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedService.durationMinutes} min · Select available staff
                  </p>
                </div>
              </>
            ) : (
              <h2 className="text-lg font-semibold text-foreground">Service Bookings</h2>
            )}
          </div>

          {/* Right: Date Navigation */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPrevDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="min-w-[220px] text-center text-sm font-semibold sm:min-w-[260px] sm:text-base">
              {formatDateDisplay(selectedDate)}
            </h3>
            <Button variant="outline" size="icon" onClick={goToNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto px-4 pb-4 pt-3 sm:px-6">
          {view === 'pos' ? (
            // POS Panel View
            <ServicePosPanel
              services={services}
              isLoading={servicesLoading}
              onServiceSelect={handleServiceSelect}
            />
          ) : (
            // Staff Schedule View
            <div className="flex flex-col gap-3">
              {/* Staff Search */}
              <BookingSearchBar
                placeholder="Search staff..."
                value={staffSearch}
                onChange={setStaffSearch}
              />

              {/* Staff Schedule Grid */}
              <StaffSchedule
                date={selectedDate}
                serviceId={selectedService?.id}
                onSlotSelect={handleStaffSlotSelect}
                searchQuery={staffSearch}
                requiredCapabilities={
                  selectedService?.enforceQualification
                    ? selectedService.requiredCapabilities
                    : undefined
                }
                className="max-h-[calc(100vh-280px)]"
              />
            </div>
          )}
        </div>
      </div>

      {/* Booking Creation Sheet */}
      <BookingCreationSheet
        open={bookingSheet.isOpen}
        onOpenChange={(open) => { if (!open) closeBookingSheet() }}
        prefilled={bookingSheet.prefilled}
        onSuccess={() => toast.success('Booking created successfully')}
      />
    </>
  )
}
