'use client'

import { useState } from 'react'
import { Calendar, Clock, X } from 'lucide-react'

interface RescheduleDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (date: string, time: string) => void
  bookingTitle: string
  currentDate: string
  currentTime: string
  isLoading?: boolean
}

const TIME_SLOTS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
]

export function RescheduleDialog({
  isOpen,
  onClose,
  onConfirm,
  bookingTitle,
  currentDate,
  currentTime,
  isLoading,
}: RescheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  if (!isOpen) return null

  // Min date is tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const canConfirm = selectedDate && selectedTime && !isLoading

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl p-5 pb-safe animate-in slide-in-from-bottom">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-stone-900">Reschedule Booking</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-stone-50"
          >
            <X className="h-5 w-5 text-stone-400" />
          </button>
        </div>

        {/* Current Booking Info */}
        <div className="rounded-xl bg-stone-50 p-3 mb-5">
          <p className="text-sm font-medium text-stone-700">{bookingTitle}</p>
          <p className="text-xs text-stone-500 mt-0.5">
            Currently: {currentDate} &middot; {currentTime}
          </p>
        </div>

        {/* New Date */}
        <div className="mb-4">
          <label className="flex items-center gap-1.5 text-sm font-medium text-stone-700 mb-1.5">
            <Calendar className="h-4 w-4" />
            New Date
          </label>
          <input
            type="date"
            min={minDate}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[15px] text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
          />
        </div>

        {/* New Time */}
        <div className="mb-6">
          <label className="flex items-center gap-1.5 text-sm font-medium text-stone-700 mb-1.5">
            <Clock className="h-4 w-4" />
            New Time
          </label>
          <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                onClick={() => setSelectedTime(slot)}
                className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedTime === slot
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-stone-600 border border-stone-300"
          >
            Cancel
          </button>
          <button
            onClick={() => canConfirm && onConfirm(selectedDate, selectedTime)}
            disabled={!canConfirm}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-stone-900 text-white disabled:bg-stone-300 disabled:text-stone-500 transition-colors"
          >
            {isLoading ? 'Rescheduling...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
