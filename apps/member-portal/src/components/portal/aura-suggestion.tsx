import Link from 'next/link'
import { format } from 'date-fns'
import { Sparkles, Flag, Receipt, CalendarDays } from 'lucide-react'

interface AuraSuggestionProps {
  hasBalance: boolean
  dueDate: Date | null
  upcomingTeeTimes: number
  nextTeeTime: { date: Date; time: string; courseName: string } | null
  upcomingEvents: number
  firstName: string
}

function getSuggestion(props: AuraSuggestionProps): {
  message: string
  cta: string
  href: string
  icon: typeof Flag
} | null {
  const { hasBalance, dueDate, nextTeeTime, upcomingTeeTimes, upcomingEvents } = props

  // Priority 1: Overdue balance
  if (hasBalance && dueDate && new Date(dueDate) < new Date()) {
    return {
      message: `Your balance is past due. View your statement to stay current.`,
      cta: 'View Statement',
      href: '/portal/statements',
      icon: Receipt,
    }
  }

  // Priority 2: Upcoming tee time reminder
  if (nextTeeTime) {
    const teeDate = new Date(nextTeeTime.date)
    const daysUntil = Math.ceil((teeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (daysUntil <= 2 && daysUntil >= 0) {
      return {
        message: `Your tee time at ${nextTeeTime.courseName} is ${daysUntil === 0 ? 'today' : daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`} at ${nextTeeTime.time}.`,
        cta: 'View Booking',
        href: '/portal/golf/bookings',
        icon: Flag,
      }
    }
  }

  // Priority 3: No tee times booked
  if (upcomingTeeTimes === 0) {
    return {
      message: `No upcoming tee times. The course is looking great this week!`,
      cta: 'Book Tee Time',
      href: '/portal/golf/book',
      icon: Flag,
    }
  }

  // Priority 4: Upcoming events
  if (upcomingEvents > 0) {
    return {
      message: `There ${upcomingEvents === 1 ? 'is 1 event' : `are ${upcomingEvents} events`} coming up at the club.`,
      cta: 'View Events',
      href: '/portal/events',
      icon: CalendarDays,
    }
  }

  return null
}

export function AuraSuggestion(props: AuraSuggestionProps) {
  const suggestion = getSuggestion(props)
  if (!suggestion) return null

  const Icon = suggestion.icon

  return (
    <Link
      href={suggestion.href}
      className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-stone-50 to-amber-50/50 border border-amber-100/60 active:opacity-70 transition-opacity"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 flex-shrink-0">
        <Sparkles className="h-4 w-4 text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-amber-700 mb-0.5">Aura Suggests</p>
        <p className="text-[14px] text-stone-700 leading-snug">{suggestion.message}</p>
        <span className="inline-block mt-2 text-xs font-semibold text-amber-600">
          {suggestion.cta} &rarr;
        </span>
      </div>
    </Link>
  )
}
