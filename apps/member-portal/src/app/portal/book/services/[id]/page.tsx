'use client'

import { useState, useEffect } from 'react'
import { cn, Button } from '@clubvantage/ui'
import { AlertCircle, ArrowLeft, Calendar, Clock, RefreshCw, User, Check } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  MemberDatePicker,
  TimeSlotGrid,
  StaffSelector,
  VariationsPicker,
  BookingSummary,
  BookingConfirmation,
} from '@/components/portal/bookings'
import type { PortalService, PortalStaff, TimeSlot, ServiceVariation } from '@/lib/types'
import {
  fetchServiceById,
  fetchStaffForService,
  fetchServiceAvailability,
  createServiceBooking,
} from '../../../bookings/actions'

type Step = 'staff' | 'date' | 'time' | 'variations' | 'summary' | 'confirmation'

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(time: string | undefined): string {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours ?? '0', 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes ?? '00'} ${ampm}`
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function ServiceBookingWizard() {
  const params = useParams()
  const router = useRouter()
  const serviceId = typeof params.id === 'string' ? params.id : ''

  const [service, setService] = useState<PortalService | null>(null)
  const [staff, setStaff] = useState<PortalStaff[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<Step>('staff')

  // Booking selections
  const [selectedStaffId, setSelectedStaffId] = useState<string | 'any'>('any')
  const [selectedDate, setSelectedDate] = useState<string>()
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>()
  const [selectedVariationIds, setSelectedVariationIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingId, setBookingId] = useState<string>()
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Load service details and staff
  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [serviceData, staffData] = await Promise.all([
        fetchServiceById(serviceId),
        fetchStaffForService(serviceId),
      ])
      setService(serviceData)
      setStaff(staffData)
    } catch (err) {
      console.error('Failed to load service:', err)
      setError('Unable to load service details. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [serviceId])

  // Load time slots when date changes
  useEffect(() => {
    async function loadSlots() {
      if (!selectedDate) return
      try {
        const slots = await fetchServiceAvailability(
          serviceId,
          selectedDate,
          selectedStaffId === 'any' ? undefined : selectedStaffId
        )
        setTimeSlots(slots)
      } catch (error) {
        console.error('Failed to load slots:', error)
      }
    }
    loadSlots()
  }, [serviceId, selectedDate, selectedStaffId])

  const handleStaffSelect = (staffId: string | 'any') => {
    setSelectedStaffId(staffId)
    setStep('date')
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedSlot(undefined)
    setStep('time')
  }

  const handleTimeSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    if (service?.variations && service.variations.length > 0) {
      setStep('variations')
    } else {
      setStep('summary')
    }
  }

  const handleVariationsConfirm = () => {
    setStep('summary')
  }

  const toggleVariation = (variationId: string) => {
    setSelectedVariationIds((prev) =>
      prev.includes(variationId)
        ? prev.filter((id) => id !== variationId)
        : [...prev, variationId]
    )
  }

  const handleConfirm = async () => {
    if (!selectedDate || !selectedSlot) return

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const result = await createServiceBooking({
        serviceId,
        staffId: selectedStaffId === 'any' ? undefined : selectedStaffId,
        variationId: selectedVariationIds[0], // For now, just use first variation
        date: selectedDate,
        startTime: selectedSlot.startTime,
      })

      if (result.success && result.bookingId) {
        setBookingId(result.bookingId)
        setStep('confirmation')
      } else {
        setSubmitError(result.error || 'Failed to create booking. Please try again.')
      }
    } catch (err) {
      console.error('Failed to create booking:', err)
      setSubmitError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (step === 'date') setStep('staff')
    else if (step === 'time') setStep('date')
    else if (step === 'variations') setStep('time')
    else if (step === 'summary') {
      if (service?.variations && service.variations.length > 0) {
        setStep('variations')
      } else {
        setStep('time')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="p-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/30 dark:bg-red-500/10">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <p className="mb-1 font-medium text-red-700 dark:text-red-400">
            {error ? 'Something went wrong' : 'Service not found'}
          </p>
          <p className="mb-4 text-sm text-red-600 dark:text-red-300">
            {error || 'The service you are looking for could not be found.'}
          </p>
          <div className="flex justify-center gap-3">
            {error && (
              <Button
                variant="outline"
                size="sm"
                onClick={loadData}
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-500/50 dark:text-red-400 dark:hover:bg-red-500/20"
              >
                <RefreshCw className="mr-1.5 h-4 w-4" />
                Try Again
              </Button>
            )}
            <Link href="/portal/book/services">
              <Button variant="outline" size="sm">
                Back to Services
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Calculate total price
  const basePrice = service.memberPrice ?? service.basePrice
  const variationsPrice = selectedVariationIds.reduce((sum, id) => {
    const variation = service.variations?.find((v) => v.id === id)
    return sum + (variation?.additionalPrice ?? 0)
  }, 0)
  const totalPrice = basePrice + variationsPrice

  // Get selected staff name
  const selectedStaffName =
    selectedStaffId === 'any'
      ? 'Any Available'
      : staff.find((s) => s.id === selectedStaffId)?.name ?? ''

  // Confirmation step
  if (step === 'confirmation' && bookingId) {
    return (
      <BookingConfirmation
        bookingId={bookingId}
        title={service.name}
        subtitle={service.category}
        date={selectedDate ? formatDate(selectedDate) : ''}
        time={selectedSlot ? formatTime(selectedSlot.startTime) : ''}
        staffName={selectedStaffName}
        totalPaid={totalPrice}
        onGoHome={() => router.push('/portal')}
        onViewBooking={() => router.push(`/portal/bookings/${bookingId}`)}
      />
    )
  }

  const steps = service.variations && service.variations.length > 0
    ? ['staff', 'date', 'time', 'variations', 'summary']
    : ['staff', 'date', 'time', 'summary']

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        {step === 'staff' ? (
          <Link href={`/portal/book/services`}>
            <button className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
        ) : (
          <button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div>
          <h1 className="text-lg font-bold text-foreground">{service.name}</h1>
          <p className="text-xs text-muted-foreground">
            {service.durationMinutes} min • {formatCurrency(basePrice)}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1">
        {steps.map((s, i) => (
          <div
            key={s}
            className={cn(
              'h-1 flex-1 rounded-full',
              steps.indexOf(step) >= i ? 'bg-amber-500' : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Step Content */}
      {step === 'staff' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Select Therapist
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose your preferred therapist or let us assign one
            </p>
          </div>
          <StaffSelector
            staff={staff}
            selectedStaffId={selectedStaffId}
            onSelectStaff={handleStaffSelect}
          />
        </div>
      )}

      {step === 'date' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Select Date</h2>
            <p className="text-sm text-muted-foreground">
              {selectedStaffName !== 'Any Available'
                ? `With ${selectedStaffName}`
                : 'Any available therapist'}
            </p>
          </div>
          <MemberDatePicker
            selectedDate={selectedDate}
            onSelectDate={handleDateSelect}
          />
        </div>
      )}

      {step === 'time' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Select Time</h2>
            <p className="text-sm text-muted-foreground">
              {selectedDate && formatDate(selectedDate)}
            </p>
          </div>
          <TimeSlotGrid
            slots={timeSlots}
            selectedSlotId={selectedSlot?.id}
            onSelectSlot={handleTimeSelect}
          />
        </div>
      )}

      {step === 'variations' && service.variations && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Add-ons</h2>
            <p className="text-sm text-muted-foreground">
              Enhance your experience (optional)
            </p>
          </div>
          <VariationsPicker
            variations={service.variations}
            selectedVariationIds={selectedVariationIds}
            onToggleVariation={toggleVariation}
          />
          <Button
            onClick={handleVariationsConfirm}
            className="w-full bg-amber-500 text-white hover:bg-amber-600"
          >
            {selectedVariationIds.length > 0
              ? `Continue with ${selectedVariationIds.length} add-on${selectedVariationIds.length > 1 ? 's' : ''}`
              : 'Continue without add-ons'}
          </Button>
        </div>
      )}

      {step === 'summary' && (
        <BookingSummary
          title={service.name}
          subtitle={service.description}
          imageUrl={service.imageUrl}
          details={[
            {
              label: 'Therapist',
              value: selectedStaffName,
              icon: <User className="h-4 w-4" />,
            },
            {
              label: 'Date',
              value: selectedDate ? formatDate(selectedDate) : '',
              icon: <Calendar className="h-4 w-4" />,
            },
            {
              label: 'Time',
              value: selectedSlot ? formatTime(selectedSlot.startTime) : '',
              icon: <Clock className="h-4 w-4" />,
            },
            {
              label: 'Duration',
              value: `${service.durationMinutes} minutes`,
            },
          ]}
          priceBreakdown={[
            { label: 'Service', amount: service.basePrice },
            ...(service.memberPrice
              ? [
                  {
                    label: 'Member Discount',
                    amount: service.basePrice - service.memberPrice,
                    isDiscount: true,
                  },
                ]
              : []),
            ...selectedVariationIds.map((id) => {
              const variation = service.variations?.find((v) => v.id === id)
              return {
                label: variation?.name ?? 'Add-on',
                amount: variation?.additionalPrice ?? 0,
              }
            }),
          ]}
          totalPrice={totalPrice}
          onConfirm={handleConfirm}
          onBack={handleBack}
          isLoading={isSubmitting}
          confirmLabel="Confirm Booking"
        />
      )}
    </div>
  )
}
