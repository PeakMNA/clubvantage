'use client'

import { useState, useEffect } from 'react'
import { cn, Button } from '@clubvantage/ui'
import { AlertCircle, ArrowLeft, Calendar, Clock, MapPin, Check, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  MemberDatePicker,
  TimeSlotGrid,
  BookingSummary,
  BookingConfirmation,
} from '@/components/portal/bookings'
import type { PortalFacility, TimeSlot, DateAvailability } from '@/lib/types'
import {
  fetchFacilityById,
  fetchFacilityAvailability,
  createFacilityBooking,
} from '../../../bookings/actions'

type Step = 'date' | 'time' | 'duration' | 'summary' | 'confirmation'

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

export default function FacilityBookingWizard() {
  const params = useParams()
  const router = useRouter()
  const facilityId = typeof params.id === 'string' ? params.id : ''

  const [facility, setFacility] = useState<PortalFacility | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<Step>('date')

  // Booking selections
  const [selectedDate, setSelectedDate] = useState<string>()
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot>()
  const [selectedDuration, setSelectedDuration] = useState<number>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingId, setBookingId] = useState<string>()
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Load facility details
  const loadFacility = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchFacilityById(facilityId)
      setFacility(data)
      if (data?.bookingDurationMinutes[0]) {
        setSelectedDuration(data.bookingDurationMinutes[0])
      }
    } catch (err) {
      console.error('Failed to load facility:', err)
      setError('Unable to load facility details. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFacility()
  }, [facilityId])

  // Load time slots when date changes
  useEffect(() => {
    async function loadSlots() {
      if (!selectedDate) return
      try {
        const slots = await fetchFacilityAvailability(facilityId, selectedDate)
        setTimeSlots(slots)
      } catch (error) {
        console.error('Failed to load slots:', error)
      }
    }
    loadSlots()
  }, [facilityId, selectedDate])

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedSlot(undefined)
    setStep('time')
  }

  const handleTimeSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setStep('duration')
  }

  const handleDurationSelect = (duration: number) => {
    setSelectedDuration(duration)
    setStep('summary')
  }

  const handleConfirm = async () => {
    if (!selectedDate || !selectedSlot || !selectedDuration) return

    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const result = await createFacilityBooking({
        facilityId,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        durationMinutes: selectedDuration,
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
    if (step === 'time') setStep('date')
    else if (step === 'duration') setStep('time')
    else if (step === 'summary') setStep('duration')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
      </div>
    )
  }

  if (error || !facility) {
    return (
      <div className="p-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-500/30 dark:bg-red-500/10">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <p className="mb-1 font-medium text-red-700 dark:text-red-400">
            {error ? 'Something went wrong' : 'Facility not found'}
          </p>
          <p className="mb-4 text-sm text-red-600 dark:text-red-300">
            {error || 'The facility you are looking for could not be found.'}
          </p>
          <div className="flex justify-center gap-3">
            {error && (
              <Button
                variant="outline"
                size="sm"
                onClick={loadFacility}
                className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-500/50 dark:text-red-400 dark:hover:bg-red-500/20"
              >
                <RefreshCw className="mr-1.5 h-4 w-4" />
                Try Again
              </Button>
            )}
            <Link href="/portal/book/facilities">
              <Button variant="outline" size="sm">
                Back to Facilities
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const totalPrice = (facility.memberPrice ?? facility.basePrice) * (selectedDuration ? selectedDuration / 60 : 1)

  // Confirmation step
  if (step === 'confirmation' && bookingId) {
    return (
      <BookingConfirmation
        bookingId={bookingId}
        title={facility.name}
        subtitle={facility.location}
        date={selectedDate ? formatDate(selectedDate) : ''}
        time={selectedSlot ? formatTime(selectedSlot.startTime) : ''}
        location={facility.location}
        totalPaid={totalPrice}
        onGoHome={() => router.push('/portal')}
        onViewBooking={() => router.push(`/portal/bookings/${bookingId}`)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        {step === 'date' ? (
          <Link href={`/portal/book/facilities`}>
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
          <h1 className="text-lg font-bold text-foreground">{facility.name}</h1>
          <p className="text-xs text-muted-foreground">{facility.location}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1">
        {['date', 'time', 'duration', 'summary'].map((s, i) => (
          <div
            key={s}
            className={cn(
              'h-1 flex-1 rounded-full',
              ['date', 'time', 'duration', 'summary'].indexOf(step) >= i
                ? 'bg-amber-500'
                : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* Step Content */}
      {step === 'date' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Select Date</h2>
            <p className="text-sm text-muted-foreground">
              Choose your preferred date
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

      {step === 'duration' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Select Duration</h2>
            <p className="text-sm text-muted-foreground">
              Starting at {selectedSlot && formatTime(selectedSlot.startTime)}
            </p>
          </div>
          <div className="space-y-2">
            {facility.bookingDurationMinutes.map((duration) => {
              const price = (facility.memberPrice ?? facility.basePrice) * (duration / 60)
              const isSelected = selectedDuration === duration

              return (
                <button
                  key={duration}
                  onClick={() => handleDurationSelect(duration)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all',
                    isSelected
                      ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-400'
                      : 'border-border bg-card hover:border-amber-300'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full border',
                        isSelected
                          ? 'border-amber-500 bg-amber-500 text-white'
                          : 'border-border'
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span
                      className={cn(
                        'font-medium',
                        isSelected ? 'text-amber-700' : 'text-foreground'
                      )}
                    >
                      {duration} minutes
                    </span>
                  </div>
                  <span
                    className={cn(
                      'font-semibold',
                      isSelected ? 'text-amber-700' : 'text-foreground'
                    )}
                  >
                    {formatCurrency(price)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {step === 'summary' && (
        <BookingSummary
          title={facility.name}
          subtitle={facility.location}
          imageUrl={facility.imageUrl}
          details={[
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
              value: `${selectedDuration} minutes`,
            },
            {
              label: 'Location',
              value: facility.location,
              icon: <MapPin className="h-4 w-4" />,
            },
          ]}
          priceBreakdown={[
            { label: 'Base Price', amount: facility.basePrice * (selectedDuration! / 60) },
            ...(facility.memberPrice
              ? [
                  {
                    label: 'Member Discount',
                    amount: (facility.basePrice - facility.memberPrice) * (selectedDuration! / 60),
                    isDiscount: true,
                  },
                ]
              : []),
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
