'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@clubvantage/ui'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Car,
  Check,
  ChevronRight,
  Plus,
  Loader2,
} from 'lucide-react'
import { format, addDays, parseISO } from 'date-fns'
import { PlayerChip } from '@/components/portal/player-chip'
import {
  fetchMyCourses,
  fetchTeeSheet,
  fetchMyDependents,
  createGolfBooking,
  type CreateGolfBookingInput,
} from '../actions'
import type { BookingPlayer, GolfTimeSlot, PortalCourse } from '@/lib/types'

type BookingStep = 'course' | 'date' | 'time' | 'players' | 'resources' | 'confirm'

const steps: { key: BookingStep; label: string; icon: React.ElementType }[] = [
  { key: 'course', label: 'Course', icon: Calendar },
  { key: 'date', label: 'Date', icon: Calendar },
  { key: 'time', label: 'Time', icon: Clock },
  { key: 'players', label: 'Players', icon: Users },
  { key: 'resources', label: 'Resources', icon: Car },
  { key: 'confirm', label: 'Confirm', icon: Check },
]

export default function BookTeeTimePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<BookingStep>('course')

  // Data states
  const [courses, setCourses] = useState<PortalCourse[]>([])
  const [timeSlots, setTimeSlots] = useState<GolfTimeSlot[]>([])
  const [dependents, setDependents] = useState<BookingPlayer[]>([])
  const [isLoadingCourses, setIsLoadingCourses] = useState(true)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [isLoadingDependents, setIsLoadingDependents] = useState(false)

  // Selection states
  const [selectedCourse, setSelectedCourse] = useState<PortalCourse | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<GolfTimeSlot | null>(null)
  const [players, setPlayers] = useState<BookingPlayer[]>([])
  const [cart, setCart] = useState(false)
  const [caddy, setCaddy] = useState<'none' | 'shared' | 'individual'>('none')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Current member (placeholder - should come from auth)
  const currentMember: BookingPlayer = {
    id: 'self',
    name: 'John Smith',
    type: 'member',
    memberId: 'M-0001',
  }

  // Load courses on mount
  useEffect(() => {
    async function loadCourses() {
      setIsLoadingCourses(true)
      try {
        const data = await fetchMyCourses()
        setCourses(data)
      } catch (err) {
        console.error('Error loading courses:', err)
      } finally {
        setIsLoadingCourses(false)
      }
    }
    loadCourses()
  }, [])

  // Initialize players with current member
  useEffect(() => {
    if (players.length === 0) {
      setPlayers([currentMember])
    }
  }, [])

  // Load tee sheet when course and date are selected
  useEffect(() => {
    async function loadTeeSheet() {
      if (!selectedCourse || !selectedDate) return

      setIsLoadingSlots(true)
      try {
        const slots = await fetchTeeSheet(
          selectedCourse.id,
          new Date(selectedDate)
        )
        setTimeSlots(slots)
      } catch (err) {
        console.error('Error loading tee sheet:', err)
        setTimeSlots([])
      } finally {
        setIsLoadingSlots(false)
      }
    }
    loadTeeSheet()
  }, [selectedCourse, selectedDate])

  // Load dependents when reaching players step
  useEffect(() => {
    async function loadDependents() {
      if (currentStep === 'players' && dependents.length === 0) {
        setIsLoadingDependents(true)
        try {
          const data = await fetchMyDependents()
          setDependents(data)
        } catch (err) {
          console.error('Error loading dependents:', err)
        } finally {
          setIsLoadingDependents(false)
        }
      }
    }
    loadDependents()
  }, [currentStep, dependents.length])

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep)

  const canProceed = () => {
    switch (currentStep) {
      case 'course':
        return selectedCourse !== null
      case 'date':
        return selectedDate !== null
      case 'time':
        return selectedTime !== null
      case 'players':
        return players.length >= 1
      case 'resources':
        return true
      case 'confirm':
        return true
      default:
        return false
    }
  }

  const goNext = () => {
    const nextIndex = currentStepIndex + 1
    const nextStep = steps[nextIndex]
    if (nextIndex < steps.length && nextStep) {
      setCurrentStep(nextStep.key)
    }
  }

  const goBack = () => {
    const prevIndex = currentStepIndex - 1
    const prevStep = steps[prevIndex]
    if (prevIndex >= 0 && prevStep) {
      setCurrentStep(prevStep.key)
    }
  }

  const handleSubmit = async () => {
    if (!selectedCourse || !selectedDate || !selectedTime) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const input: CreateGolfBookingInput = {
        courseId: selectedCourse.id,
        teeDate: selectedDate,
        teeTime: selectedTime.time,
        holes: 18,
        players: players.map((p, idx) => ({
          position: idx + 1,
          playerType:
            p.type === 'member'
              ? 'MEMBER'
              : p.type === 'dependent'
                ? 'DEPENDENT'
                : 'GUEST',
          memberId: p.type === 'member' || p.type === 'dependent' ? p.id : undefined,
          guestName: p.type === 'guest' ? p.name : undefined,
          guestEmail: p.type === 'guest' ? p.email : undefined,
          guestPhone: p.type === 'guest' ? p.phone : undefined,
          cartType: cart
            ? idx % 2 === 0
              ? 'SHARED'
              : 'SHARED'
            : 'WALKING',
          sharedWithPosition: cart && idx % 2 === 1 ? idx : undefined,
        })),
      }

      const result = await createGolfBooking(input)

      if (result.success) {
        router.push('/portal/golf?booked=true')
      } else {
        setSubmitError(result.error || 'Failed to create booking')
      }
    } catch (err) {
      console.error('Error creating booking:', err)
      setSubmitError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const addPlayer = (player: BookingPlayer) => {
    if (players.length < 4 && !players.find((p) => p.id === player.id)) {
      setPlayers([...players, player])
    }
  }

  const removePlayer = (playerId: string) => {
    if (playerId !== currentMember.id) {
      setPlayers(players.filter((p) => p.id !== playerId))
    }
  }

  const addGuest = () => {
    const guestNumber = players.filter((p) => p.type === 'guest').length + 1
    const newGuest: BookingPlayer = {
      id: `g${Date.now()}`,
      name: `Guest ${guestNumber}`,
      type: 'guest',
    }
    addPlayer(newGuest)
  }

  // Generate next 14 days
  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const date = addDays(new Date(), i + 1)
    return {
      date: format(date, 'yyyy-MM-dd'),
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd'),
      month: format(date, 'MMM'),
      available: true,
    }
  })

  const calculateTotal = () => {
    let total = 0
    if (selectedTime) {
      total += (selectedTime.price ?? 0) * players.length
    }
    if (cart) total += 500
    if (caddy === 'shared') total += 1500
    if (caddy === 'individual') total += 2500 * players.length
    return total
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-stone-900 border-b border-border/60">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={() =>
              currentStepIndex > 0 ? goBack() : router.push('/portal/golf')
            }
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            <ArrowLeft className="h-5 w-5 text-stone-600 dark:text-stone-400" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold text-stone-900 dark:text-stone-100">
              Book Tee Time
            </h1>
            <p className="text-xs text-stone-500">
              Step {currentStepIndex + 1} of {steps.length}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-1 px-4 pb-3">
          {steps.map((step, idx) => (
            <div
              key={step.key}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors',
                idx <= currentStepIndex
                  ? 'bg-amber-500'
                  : 'bg-stone-200 dark:bg-stone-700'
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 pb-32">
        {/* Course Step */}
        {currentStep === 'course' && (
          <div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
              Select a Course
            </h2>
            {isLoadingCourses ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
              </div>
            ) : courses.length === 0 ? (
              <p className="text-stone-500 text-center py-8">
                No courses available
              </p>
            ) : (
              <div className="space-y-2">
                {courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => setSelectedCourse(course)}
                    className={cn(
                      'w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left',
                      selectedCourse?.id === course.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                        : 'border-transparent bg-white dark:bg-stone-800 hover:border-stone-200 dark:hover:border-stone-700'
                    )}
                  >
                    <div>
                      <p className="font-semibold text-stone-900 dark:text-stone-100">
                        {course.name}
                      </p>
                      <p className="text-sm text-stone-500">
                        {course.enable18HoleBooking ? '18 holes' : '9 holes'} •
                        Book up to {course.advanceBookingDays} days ahead
                      </p>
                    </div>
                    {selectedCourse?.id === course.id && (
                      <Check className="h-5 w-5 text-amber-500" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Date Step */}
        {currentStep === 'date' && (
          <div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
              Select a Date
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {availableDates.map((d) => (
                <button
                  key={d.date}
                  onClick={() => d.available && setSelectedDate(d.date)}
                  disabled={!d.available}
                  className={cn(
                    'flex flex-col items-center p-3 rounded-xl border-2 transition-all',
                    selectedDate === d.date
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                      : d.available
                        ? 'border-transparent bg-white dark:bg-stone-800 hover:border-stone-200 dark:hover:border-stone-700'
                        : 'border-transparent bg-stone-100 dark:bg-stone-800/50 opacity-50 cursor-not-allowed'
                  )}
                >
                  <span className="text-xs text-stone-500">{d.dayName}</span>
                  <span className="text-xl font-bold text-stone-900 dark:text-stone-100">
                    {d.dayNumber}
                  </span>
                  <span className="text-xs text-stone-500">{d.month}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Time Step */}
        {currentStep === 'time' && (
          <div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
              Select a Time
            </h2>
            <p className="text-sm text-stone-500 mb-4">
              {selectedDate &&
                format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
            </p>
            {isLoadingSlots ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
              </div>
            ) : timeSlots.length === 0 ? (
              <p className="text-stone-500 text-center py-8">
                No available times for this date
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => slot.available && setSelectedTime(slot)}
                    disabled={!slot.available}
                    className={cn(
                      'flex flex-col items-center p-3 rounded-xl border-2 transition-all',
                      selectedTime?.time === slot.time
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                        : slot.available
                          ? 'border-transparent bg-white dark:bg-stone-800 hover:border-stone-200 dark:hover:border-stone-700'
                          : 'border-transparent bg-stone-100 dark:bg-stone-800/50 opacity-50 cursor-not-allowed line-through'
                    )}
                  >
                    <span className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                      {slot.time}
                    </span>
                    {slot.available && (
                      <span className="text-xs text-stone-500">
                        {slot.price ? `฿${slot.price.toLocaleString()}` : ''}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Players Step */}
        {currentStep === 'players' && (
          <div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
              Who&apos;s Playing?
            </h2>
            <p className="text-sm text-stone-500 mb-4">
              Add up to 4 players ({players.length}/4)
            </p>

            {/* Current players */}
            <div className="space-y-2 mb-6">
              {players.map((player) => (
                <PlayerChip
                  key={player.id}
                  player={player}
                  editable
                  isSelf={player.id === currentMember.id}
                  onRemove={() => removePlayer(player.id)}
                />
              ))}
            </div>

            {players.length < 4 && (
              <>
                {/* Add dependents */}
                {isLoadingDependents ? (
                  <div className="flex items-center gap-2 text-stone-500 text-sm mb-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading dependents...
                  </div>
                ) : (
                  dependents.filter(
                    (d) => !players.find((p) => p.id === d.id)
                  ).length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                        Add Dependent
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {dependents
                          .filter((d) => !players.find((p) => p.id === d.id))
                          .map((dep) => (
                            <button
                              key={dep.id}
                              onClick={() => addPlayer(dep)}
                              className="flex items-center gap-2 px-3 py-2 rounded-full bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 text-sm font-medium hover:bg-teal-100 dark:hover:bg-teal-950/50 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                              {dep.name}
                            </button>
                          ))}
                      </div>
                    </div>
                  )
                )}

                {/* Add guest */}
                <button
                  onClick={addGuest}
                  className="flex items-center gap-2 px-4 py-3 w-full rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-600 text-stone-600 dark:text-stone-400 hover:border-amber-500 hover:text-amber-600 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Add Guest</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Resources Step */}
        {currentStep === 'resources' && (
          <div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
              Add Resources
            </h2>

            {/* Cart */}
            <div className="mb-4">
              <button
                onClick={() => setCart(!cart)}
                className={cn(
                  'flex items-center justify-between w-full p-4 rounded-xl border-2 transition-all',
                  cart
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                    : 'border-transparent bg-white dark:bg-stone-800'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-700">
                    <Car className="h-6 w-6 text-stone-600 dark:text-stone-400" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-stone-900 dark:text-stone-100">
                      Golf Cart
                    </p>
                    <p className="text-sm text-stone-500">฿500 per round</p>
                  </div>
                </div>
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
                    cart
                      ? 'border-amber-500 bg-amber-500'
                      : 'border-stone-300 dark:border-stone-600'
                  )}
                >
                  {cart && <Check className="h-4 w-4 text-white" />}
                </div>
              </button>
            </div>

            {/* Caddy */}
            <div>
              <p className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Caddy Service
              </p>
              <div className="space-y-2">
                {[
                  { value: 'none', label: 'No Caddy', price: 0 },
                  { value: 'shared', label: 'Shared Caddy', price: 1500 },
                  {
                    value: 'individual',
                    label: 'Individual Caddies',
                    price: 2500,
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setCaddy(option.value as 'none' | 'shared' | 'individual')
                    }
                    className={cn(
                      'flex items-center justify-between w-full p-4 rounded-xl border-2 transition-all',
                      caddy === option.value
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
                        : 'border-transparent bg-white dark:bg-stone-800'
                    )}
                  >
                    <div>
                      <p className="font-medium text-stone-900 dark:text-stone-100">
                        {option.label}
                      </p>
                      {option.price > 0 && (
                        <p className="text-sm text-stone-500">
                          ฿{option.price.toLocaleString()}
                          {option.value === 'individual' ? ' per player' : ''}
                        </p>
                      )}
                    </div>
                    <div
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
                        caddy === option.value
                          ? 'border-amber-500 bg-amber-500'
                          : 'border-stone-300 dark:border-stone-600'
                      )}
                    >
                      {caddy === option.value && (
                        <Check className="h-4 w-4 text-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Confirm Step */}
        {currentStep === 'confirm' && (
          <div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
              Confirm Booking
            </h2>

            {submitError && (
              <div className="mb-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  {submitError}
                </p>
              </div>
            )}

            <div className="rounded-2xl bg-white dark:bg-stone-800 border border-border/60 overflow-hidden">
              {/* Course */}
              <div className="p-4 border-b border-border/60">
                <p className="text-sm text-stone-500 mb-1">Course</p>
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  {selectedCourse?.name}
                </p>
              </div>

              {/* Date & Time */}
              <div className="p-4 border-b border-border/60">
                <p className="text-sm text-stone-500 mb-1">Date & Time</p>
                <p className="font-semibold text-stone-900 dark:text-stone-100">
                  {selectedDate &&
                    format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-stone-600 dark:text-stone-400">
                  {selectedTime?.time} • 18 holes
                </p>
              </div>

              {/* Players */}
              <div className="p-4 border-b border-border/60">
                <p className="text-sm text-stone-500 mb-2">Players</p>
                <div className="flex flex-wrap gap-2">
                  {players.map((player) => (
                    <PlayerChip key={player.id} player={player} />
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div className="p-4 border-b border-border/60">
                <p className="text-sm text-stone-500 mb-2">Resources</p>
                <div className="flex flex-wrap gap-2">
                  {cart && (
                    <span className="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-700 text-sm text-stone-600 dark:text-stone-300">
                      Golf Cart
                    </span>
                  )}
                  {caddy !== 'none' && (
                    <span className="px-3 py-1 rounded-full bg-stone-100 dark:bg-stone-700 text-sm text-stone-600 dark:text-stone-300">
                      {caddy === 'shared' ? 'Shared Caddy' : 'Individual Caddies'}
                    </span>
                  )}
                  {!cart && caddy === 'none' && (
                    <span className="text-sm text-stone-500">None selected</span>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="p-4 bg-stone-50 dark:bg-stone-900/50">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-stone-500">Total</p>
                  <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 font-mono">
                    ฿{calculateTotal().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-24 left-0 right-0 z-40 p-4 bg-white dark:bg-stone-900 border-t border-border/60 mb-safe">
        {currentStep === 'confirm' ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={cn(
              'w-full py-4 rounded-xl font-semibold text-base transition-all',
              'bg-amber-500 text-white hover:bg-amber-600',
              'shadow-lg shadow-amber-500/25',
              isSubmitting && 'opacity-75 cursor-not-allowed'
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Booking...
              </span>
            ) : (
              'Confirm Booking'
            )}
          </button>
        ) : (
          <button
            onClick={goNext}
            disabled={!canProceed()}
            className={cn(
              'w-full py-4 rounded-xl font-semibold text-base transition-all',
              'flex items-center justify-center gap-2',
              canProceed()
                ? 'bg-stone-900 text-white hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed dark:bg-stone-800 dark:text-stone-600'
            )}
          >
            Continue
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  )
}
