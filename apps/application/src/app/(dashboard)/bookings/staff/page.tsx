'use client'

import { useState, useCallback, useTransition } from 'react'
import { Button } from '@clubvantage/ui'
import { ChevronLeft, ChevronRight, Loader2, Briefcase } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@clubvantage/ui/primitives/dialog'

import {
  useBooking,
  BookingCreationSheet,
  BookingSearchBar,
  StaffSchedule,
} from '@/components/bookings'
import { getServicesForStaff } from '@/app/(dashboard)/bookings/actions'

// ============================================================================
// TYPES
// ============================================================================

interface PendingSlot {
  staffId: string
  staffName: string
  time: string
}

interface StaffService {
  id: string
  name: string
  duration: number
  price: number
  category?: string
}

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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ============================================================================
// PAGE
// ============================================================================

export default function BookingsStaffPage() {
  const { selectedDate, setSelectedDate, bookingSheet, openBookingSheet, closeBookingSheet } = useBooking()

  // Search
  const [staffSearch, setStaffSearch] = useState('')

  // Service picker dialog state
  const [pendingSlot, setPendingSlot] = useState<PendingSlot | null>(null)
  const [staffServices, setStaffServices] = useState<StaffService[]>([])
  const [isLoadingServices, startLoadServices] = useTransition()

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

  const handleSlotSelect = useCallback((staffId: string, staffName: string, time: string) => {
    setPendingSlot({ staffId, staffName, time })
    setStaffServices([])

    // Load services this staff can perform
    startLoadServices(async () => {
      const services = await getServicesForStaff(staffId)
      setStaffServices(services)
    })
  }, [])

  const handleServicePick = useCallback(
    (service: StaffService) => {
      if (!pendingSlot) return

      // Calculate end time from service duration
      const [h, m] = pendingSlot.time.split(':').map(Number)
      const totalMin = (h ?? 0) * 60 + (m ?? 0) + service.duration
      const endTime = `${Math.floor(totalMin / 60)
        .toString()
        .padStart(2, '0')}:${(totalMin % 60).toString().padStart(2, '0')}`

      openBookingSheet({
        staffId: pendingSlot.staffId,
        staffName: pendingSlot.staffName,
        serviceId: service.id,
        serviceName: service.name,
        date: selectedDate,
        startTime: pendingSlot.time,
        endTime,
      })

      setPendingSlot(null)
      setStaffServices([])
    },
    [pendingSlot, selectedDate, openBookingSheet]
  )

  const handleCloseServicePicker = useCallback(() => {
    setPendingSlot(null)
    setStaffServices([])
  }, [])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <div className="flex h-full flex-col">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 sm:px-6">
          <h2 className="text-lg font-semibold text-foreground">Staff Schedule</h2>

          {/* Date Navigation */}
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

        {/* Content */}
        <div className="flex-1 overflow-auto px-4 pb-4 pt-3 sm:px-6">
          <div className="flex flex-col gap-3">
            {/* Staff Search */}
            <BookingSearchBar
              placeholder="Search staff..."
              value={staffSearch}
              onChange={setStaffSearch}
            />

            {/* Staff Schedule Grid — no service filter, shows ALL staff */}
            <StaffSchedule
              date={selectedDate}
              onSlotSelect={handleSlotSelect}
              searchQuery={staffSearch}
              className="max-h-[calc(100vh-260px)]"
            />
          </div>
        </div>
      </div>

      {/* Service Picker Dialog */}
      <Dialog open={!!pendingSlot} onOpenChange={(open) => { if (!open) handleCloseServicePicker() }}>
        <DialogContent className="max-w-sm">
          <DialogTitle className="text-base font-semibold">
            Select Service
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {pendingSlot && (
              <>
                Choose a service for <span className="font-medium text-foreground">{pendingSlot.staffName}</span> at{' '}
                <span className="font-medium text-foreground">
                  {(() => {
                    const [h, m] = pendingSlot.time.split(':').map(Number)
                    const hour = (h ?? 0) % 12 || 12
                    const ampm = (h ?? 0) >= 12 ? 'PM' : 'AM'
                    return `${hour}:${(m ?? 0).toString().padStart(2, '0')} ${ampm}`
                  })()}
                </span>
              </>
            )}
          </DialogDescription>

          <div className="mt-2 max-h-72 overflow-auto">
            {isLoadingServices ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                <p className="mt-2 text-xs text-muted-foreground">Loading services...</p>
              </div>
            ) : staffServices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Briefcase className="h-6 w-6 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No services available for this staff member.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {staffServices.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleServicePick(service)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-amber-50 dark:hover:bg-amber-500/10"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{service.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {service.duration} min
                        {service.category && <> · {service.category}</>}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                      {formatCurrency(service.price)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
