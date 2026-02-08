'use client'

import { useState } from 'react'
import { cn } from '@clubvantage/ui'
import {
  Flag,
  CreditCard,
  Calendar,
  Megaphone,
  Bell,
} from 'lucide-react'
import { formatDistanceToNow, isToday, isYesterday } from 'date-fns'

type FilterType = 'all' | 'bookings' | 'billing' | 'club'

interface NotificationData {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: Date
  channel: string
}

const typeToFilter: Record<string, FilterType> = {
  TEE_TIME: 'bookings',
  BOOKING: 'bookings',
  BOOKING_CONFIRMATION: 'bookings',
  BOOKING_REMINDER: 'bookings',
  BOOKING_CANCELLATION: 'bookings',
  PAYMENT: 'billing',
  INVOICE: 'billing',
  STATEMENT: 'billing',
  BILLING: 'billing',
  EVENT: 'club',
  ANNOUNCEMENT: 'club',
  PROMOTION: 'club',
  CLUB_NEWS: 'club',
}

const typeToIcon: Record<string, React.ElementType> = {
  TEE_TIME: Flag,
  BOOKING: Calendar,
  BOOKING_CONFIRMATION: Calendar,
  BOOKING_REMINDER: Calendar,
  BOOKING_CANCELLATION: Calendar,
  PAYMENT: CreditCard,
  INVOICE: CreditCard,
  STATEMENT: CreditCard,
  BILLING: CreditCard,
  EVENT: Megaphone,
  ANNOUNCEMENT: Megaphone,
  PROMOTION: Megaphone,
  CLUB_NEWS: Megaphone,
}

const filters: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'billing', label: 'Billing' },
  { id: 'club', label: 'Club News' },
]

function getGroup(date: Date): string {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return 'Earlier'
}

export function NotificationsContent({
  notifications,
}: {
  notifications: NotificationData[]
}) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')

  const filtered = activeFilter === 'all'
    ? notifications
    : notifications.filter((n) => (typeToFilter[n.type] ?? 'club') === activeFilter)

  const groups = [...new Set(filtered.map((n) => getGroup(new Date(n.createdAt))))]

  return (
    <div className="px-5 py-6 pb-36">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-[22px] font-semibold text-stone-900">Notifications</h1>
        <button className="text-sm text-stone-500 font-medium">
          Mark all read
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-5 overflow-x-auto border-b border-stone-100 mb-5">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={cn(
              'pb-3 text-sm font-medium whitespace-nowrap transition-all relative',
              activeFilter === f.id ? 'text-stone-900' : 'text-stone-500'
            )}
          >
            {f.label}
            {activeFilter === f.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Bell className="h-10 w-10 text-stone-300 mb-3" />
          <p className="text-[15px] font-medium text-stone-500">No notifications</p>
          <p className="text-sm text-stone-400 mt-1">You&apos;re all caught up</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group}>
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                {group}
              </p>
              <div className="divide-y divide-stone-100">
                {filtered
                  .filter((n) => getGroup(new Date(n.createdAt)) === group)
                  .map((notification) => {
                    const Icon = typeToIcon[notification.type] ?? Bell
                    return (
                      <div
                        key={notification.id}
                        className="flex gap-3 py-4 first:pt-0"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-50 flex-shrink-0">
                          <Icon className="h-5 w-5 text-stone-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2">
                            <p
                              className={cn(
                                'text-[15px] text-stone-900 flex-1',
                                !notification.read ? 'font-semibold' : 'font-medium'
                              )}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-stone-900 mt-2 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-stone-500 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-xs text-stone-400 mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
