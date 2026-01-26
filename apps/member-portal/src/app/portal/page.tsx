'use client'

import { BalanceCard } from '@/components/portal/balance-card'
import { QuickActions } from '@/components/portal/quick-actions'
import { TeeTimeCard } from '@/components/portal/tee-time-card'
import { cn } from '@clubvantage/ui'
import { ChevronRight, Receipt, CreditCard, Flag } from 'lucide-react'
import Link from 'next/link'
import type { TeeTimeBooking } from '@/lib/types'

// Default cancellation policy for mock data
const defaultCancellationPolicy = {
  fullRefundBefore: '',
  partialRefundBefore: '',
  noRefundAfter: '',
  partialRefundPercent: 50,
}

// Mock data - will be replaced with real data fetching
const mockUpcomingBookings: TeeTimeBooking[] = [
  {
    id: '1',
    date: '2026-01-25',
    time: '07:30',
    courseName: 'Championship Course',
    courseId: 'course-1',
    roundType: '18-hole',
    status: 'confirmed',
    players: [
      { id: '1', name: 'John Smith', type: 'member' },
      { id: '2', name: 'Sarah Smith', type: 'dependent' },
      { id: '3', name: 'Mike Johnson', type: 'guest' },
    ],
    cart: true,
    caddy: 'individual',
    totalPrice: 18500,
    priceBreakdown: [
      { label: 'Green Fee (3 players)', amount: 10500 },
      { label: 'Golf Cart', amount: 500 },
      { label: 'Individual Caddies (3)', amount: 7500 },
    ],
    cancellationPolicy: defaultCancellationPolicy,
    createdAt: '2026-01-20T10:00:00Z',
  },
  {
    id: '2',
    date: '2026-01-28',
    time: '10:00',
    courseName: 'Executive Course',
    courseId: 'course-2',
    roundType: '9-hole',
    status: 'pending',
    players: [
      { id: '1', name: 'John Smith', type: 'member' },
      { id: '4', name: 'Bob Wilson', type: 'guest' },
    ],
    cart: false,
    caddy: 'none',
    totalPrice: 7000,
    priceBreakdown: [{ label: 'Green Fee (2 players)', amount: 7000 }],
    cancellationPolicy: defaultCancellationPolicy,
    createdAt: '2026-01-21T14:00:00Z',
  },
]

interface ActivityItem {
  id: string
  type: 'payment' | 'charge' | 'booking'
  title: string
  subtitle: string
  timestamp: string
  amount?: number
}

const mockActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'payment',
    title: 'Payment Received',
    subtitle: 'Bank Transfer',
    timestamp: '2 hours ago',
    amount: -15000,
  },
  {
    id: '2',
    type: 'charge',
    title: 'Monthly Dues',
    subtitle: 'January 2026',
    timestamp: 'Yesterday',
    amount: 25000,
  },
  {
    id: '3',
    type: 'booking',
    title: 'Golf Booking',
    subtitle: 'Championship Course',
    timestamp: '3 days ago',
    amount: 3500,
  },
]

const activityIcons = {
  payment: CreditCard,
  charge: Receipt,
  booking: Flag,
}

const activityColors = {
  payment: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
  charge: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30',
  booking: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
}

export default function DashboardPage() {
  return (
    <div className="px-4 py-6 space-y-6">
      {/* Balance Card */}
      <BalanceCard
        balance={12500}
        dueDate="January 31, 2026"
        isOverdue={false}
        isSuspended={false}
        variant="full"
        onPayClick={() => console.log('Pay clicked')}
      />

      {/* Quick Actions */}
      <QuickActions suspended={false} />

      {/* Upcoming Tee Times */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            Upcoming Tee Times
          </h2>
          <Link
            href="/portal/golf"
            className="flex items-center text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            View All
            <ChevronRight className="h-4 w-4 ml-0.5" />
          </Link>
        </div>
        <div className="space-y-3">
          {mockUpcomingBookings.length > 0 ? (
            mockUpcomingBookings.map((booking) => (
              <TeeTimeCard key={booking.id} booking={booking} variant="full" />
            ))
          ) : (
            <div className="rounded-2xl bg-card border border-border/60 p-6 text-center">
              <Flag className="h-10 w-10 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
              <p className="text-sm text-stone-500 dark:text-stone-400">
                No upcoming tee times
              </p>
              <Link
                href="/portal/golf/book"
                className="inline-block mt-3 text-sm font-medium text-amber-600 hover:text-amber-700"
              >
                Book a tee time →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
            Recent Activity
          </h2>
          <Link
            href="/portal/statements"
            className="flex items-center text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            View All
            <ChevronRight className="h-4 w-4 ml-0.5" />
          </Link>
        </div>
        <div className="rounded-2xl bg-card border border-border/60 overflow-hidden">
          {mockActivity.map((item, idx) => {
            const Icon = activityIcons[item.type]
            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-3 p-4',
                  idx !== mockActivity.length - 1 &&
                    'border-b border-border/60'
                )}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl',
                    activityColors[item.type]
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 dark:text-stone-100">
                    {item.title}
                  </p>
                  <p className="text-xs text-stone-500">{item.subtitle}</p>
                </div>
                <div className="text-right">
                  {item.amount && (
                    <p
                      className={cn(
                        'text-sm font-semibold font-mono',
                        item.amount < 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-stone-900 dark:text-stone-100'
                      )}
                    >
                      {item.amount < 0 ? '-' : '+'}฿
                      {Math.abs(item.amount).toLocaleString()}
                    </p>
                  )}
                  <p className="text-xs text-stone-400">{item.timestamp}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
