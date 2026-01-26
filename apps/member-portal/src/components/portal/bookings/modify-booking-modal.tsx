'use client'

import { useState } from 'react'
import { cn, Button, Dialog, DialogContent, DialogHeader, DialogTitle } from '@clubvantage/ui'
import { Calendar, Clock, X } from 'lucide-react'
import { MemberDatePicker } from './member-date-picker'
import { TimeSlotGrid } from './time-slot-grid'
import type { PortalBooking, TimeSlot } from '@/lib/types'

export interface ModifyBookingModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (newDate: string, newStartTime: string) => Promise<void>
  booking: PortalBooking
  fetchTimeSlots: (date: string) => Promise<TimeSlot[]>
  isLoading?: boolean
}

type Step = 'date' | 'time' | 'confirm'

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

export function ModifyBookingModal({
  isOpen,
  onClose,
  onConfirm,
  booking,
  fetchTimeSlots,
  isLoading = false,
}: ModifyBookingModalProps) {
  const [step, setStep] = useState<Step>('date')
  const [selectedDate, setSelectedDate] = useState<string | undefined>(booking.date)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | undefined>()
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bookingTitle = booking.type === 'facility' ? booking.facility.name : booking.service.name

  const handleDateSelect = async (date: string) => {
    setSelectedDate(date)
    setSelectedSlot(undefined)
    setLoadingSlots(true)
    setError(null)
    try {
      const slots = await fetchTimeSlots(date)
      setTimeSlots(slots)
      setStep('time')
    } catch (err) {
      console.error('Failed to load time slots:', err)
      setError('Unable to load available times. Please try again.')
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleTimeSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot)
    setStep('confirm')
  }

  const handleConfirm = async () => {
    if (!selectedDate || !selectedSlot) return
    setError(null)
    try {
      await onConfirm(selectedDate, selectedSlot.startTime)
    } catch (err) {
      console.error('Failed to reschedule:', err)
      setError('Failed to reschedule booking. Please try again.')
    }
  }

  const handleBack = () => {
    if (step === 'time') setStep('date')
    else if (step === 'confirm') setStep('time')
  }

  const handleClose = () => {
    setStep('date')
    setSelectedDate(booking.date)
    setSelectedSlot(undefined)
    setTimeSlots([])
    setError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Reschedule Booking
          </DialogTitle>
          <button
            onClick={handleClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Booking Info */}
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="font-medium text-foreground">{bookingTitle}</p>
            <p className="text-sm text-muted-foreground">
              Currently: {formatDate(booking.date)} at {formatTime(booking.startTime)}
            </p>
          </div>

          {/* Progress */}
          <div className="flex gap-1">
            {['date', 'time', 'confirm'].map((s, i) => (
              <div
                key={s}
                className={cn(
                  'h-1 flex-1 rounded-full',
                  ['date', 'time', 'confirm'].indexOf(step) >= i ? 'bg-amber-500' : 'bg-muted'
                )}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Step Content */}
          {step === 'date' && (
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-foreground">Select New Date</h3>
                <p className="text-sm text-muted-foreground">Choose when you'd like to reschedule</p>
              </div>
              {loadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                </div>
              ) : (
                <MemberDatePicker
                  selectedDate={selectedDate}
                  onSelectDate={handleDateSelect}
                />
              )}
            </div>
          )}

          {step === 'time' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">Select New Time</h3>
                  <p className="text-sm text-muted-foreground">{selectedDate && formatDate(selectedDate)}</p>
                </div>
                <button
                  onClick={handleBack}
                  className="text-sm text-amber-600 hover:text-amber-700"
                >
                  Change date
                </button>
              </div>
              {loadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                </div>
              ) : (
                <TimeSlotGrid
                  slots={timeSlots}
                  selectedSlotId={selectedSlot?.id}
                  onSelectSlot={handleTimeSelect}
                />
              )}
            </div>
          )}

          {step === 'confirm' && selectedDate && selectedSlot && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-foreground">Confirm Changes</h3>
                <p className="text-sm text-muted-foreground">Review your new booking time</p>
              </div>

              <div className="space-y-3 rounded-lg border border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">New Date</p>
                    <p className="font-medium text-foreground">{formatDate(selectedDate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">New Time</p>
                    <p className="font-medium text-foreground">{formatTime(selectedSlot.startTime)}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-amber-500 text-white hover:bg-amber-600"
                  onClick={handleConfirm}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    'Confirm Reschedule'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
