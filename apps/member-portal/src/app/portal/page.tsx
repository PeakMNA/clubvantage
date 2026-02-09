import type { Metadata } from 'next'
import Link from 'next/link'
import { format } from 'date-fns'

export const metadata: Metadata = {
  title: 'Dashboard | Member Portal',
}
import {
  ChevronRight,
  Flag,
  Calendar,
  QrCode,
  Receipt,
  Newspaper,
  CalendarDays,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react'
import { getMemberProfile, getAccountBalance, getUpcomingTeeTimes, getRecentTransactions } from '@/lib/data'
import { getAnnouncements } from '@/lib/data/news'
import { getUpcomingEvents } from '@/lib/data/events'
import { SuspensionBanner } from '@/components/portal/suspension-banner'
import { AuraSuggestion } from '@/components/portal/aura-suggestion'

const quickActions = [
  { href: '/portal/golf/book', icon: Flag, label: 'Book Tee Time', color: 'bg-stone-50 text-stone-700' },
  { href: '/portal/book', icon: Calendar, label: 'Facilities', color: 'bg-stone-50 text-stone-700' },
  { href: '/portal/member-id', icon: QrCode, label: 'Member ID', color: 'bg-stone-50 text-stone-700' },
  { href: '/portal/statements', icon: Receipt, label: 'Statements', color: 'bg-stone-50 text-stone-700' },
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

export default async function DashboardPage() {
  const [member, balance, upcomingTeeTimes, announcements, events, recentActivity] = await Promise.all([
    getMemberProfile(),
    getAccountBalance(),
    getUpcomingTeeTimes(),
    getAnnouncements(),
    getUpcomingEvents(),
    getRecentTransactions(),
  ])

  const initials = `${member.firstName[0]}${member.lastName[0]}`
  const memberSinceYear = member.joinDate.getFullYear()

  // Calculate days overdue for suspension banner
  const daysOverdue = balance.dueDate
    ? Math.floor((Date.now() - new Date(balance.dueDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0
  const showSuspensionBanner =
    member.status === 'SUSPENDED' || (balance.balance > 0 && daysOverdue >= 91)

  return (
    <div className="pb-36">
      {showSuspensionBanner && <SuspensionBanner daysOverdue={Math.max(daysOverdue, 0)} />}

      <div className="px-5 py-6 space-y-8">
      {/* Greeting Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[22px] font-semibold text-stone-900">
            {getGreeting()}, {member.firstName}
          </h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Member since {memberSinceYear}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-stone-900 flex items-center justify-center">
            <span className="text-sm font-bold text-white">{initials}</span>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="rounded-2xl p-5 card-glass shadow-lg shadow-stone-200/30">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-stone-500 font-medium">Outstanding</p>
            <p className="text-3xl font-bold text-stone-900 mt-1 tracking-tight">
              ฿{balance.balance.toLocaleString()}
            </p>
          </div>
          {balance.unbilledTotal > 0 && (
            <div className="text-right">
              <p className="text-xs text-stone-500 font-medium">Unbilled</p>
              <p className="text-lg font-semibold text-amber-600 mt-1">
                ฿{balance.unbilledTotal.toLocaleString()}
              </p>
            </div>
          )}
        </div>
        {balance.dueDate && (
          <p className="text-sm text-stone-500 mt-2">
            Due by {format(balance.dueDate, 'MMM d')}
          </p>
        )}
        {balance.balance > 0 && (
          <div className="flex items-center gap-3 mt-4">
            <Link
              href="/portal/pay"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer shadow-md shadow-amber-600/20"
            >
              Pay Now
            </Link>
            <Link
              href="/portal/statements"
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors"
            >
              View Statements
            </Link>
          </div>
        )}
      </div>

      {/* Aura Suggestion */}
      <AuraSuggestion
        hasBalance={balance.balance > 0}
        dueDate={balance.dueDate}
        upcomingTeeTimes={upcomingTeeTimes.length}
        nextTeeTime={upcomingTeeTimes[0] ?? null}
        upcomingEvents={events.length}
        firstName={member.firstName}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200 group-hover:shadow-md group-hover:shadow-stone-200/50 group-active:scale-95 bg-white/80 backdrop-blur-sm border border-stone-100 text-stone-700">
                <Icon className="h-6 w-6 text-amber-600 group-hover:text-amber-700 transition-colors" />
              </div>
              <span className="text-[11px] font-medium text-stone-600 text-center leading-tight group-hover:text-stone-900 transition-colors">
                {action.label}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-stone-900">Recent Activity</h2>
            <Link
              href="/portal/spending"
              className="flex items-center text-sm text-stone-500 font-medium"
            >
              See All
              <ChevronRight className="h-4 w-4 ml-0.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {recentActivity.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-stone-100"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 ${
                  item.type === 'payment' ? 'bg-emerald-50' : 'bg-stone-50'
                }`}>
                  {item.type === 'payment' ? (
                    <ArrowDownLeft className="h-5 w-5 text-emerald-600" />
                  ) : (
                    <ArrowUpRight className="h-5 w-5 text-stone-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-stone-900 truncate">
                    {item.description}
                  </p>
                  <p className="text-xs text-stone-500">
                    {format(item.date, 'MMM d')}
                  </p>
                </div>
                <p className={`text-[15px] font-semibold flex-shrink-0 ${
                  item.amount > 0 ? 'text-emerald-600' : 'text-stone-900'
                }`}>
                  {item.amount > 0 ? '+' : ''}฿{Math.abs(item.amount).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Tee Times */}
      {upcomingTeeTimes.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-stone-900">Upcoming</h2>
            <Link
              href="/portal/bookings"
              className="flex items-center text-sm text-stone-500 font-medium"
            >
              See All
              <ChevronRight className="h-4 w-4 ml-0.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {upcomingTeeTimes.map((tt) => (
              <Link
                key={tt.id}
                href={`/portal/golf/bookings/${tt.id}`}
                className="flex items-center gap-3 p-3 rounded-xl card-elevated cursor-pointer bg-white/80 backdrop-blur-sm border border-stone-100"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 flex-shrink-0">
                  <Flag className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-stone-900 tracking-tight">
                    {format(tt.date, 'EEE, MMM d')} &middot; {tt.time}
                  </p>
                  <p className="text-sm text-stone-500 mt-0.5">
                    {tt.courseName} &middot; {tt.playerCount} Players
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 text-stone-300 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {events.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-stone-900">Upcoming Events</h2>
            <Link
              href="/portal/events"
              className="flex items-center text-sm text-stone-500 font-medium"
            >
              See All
              <ChevronRight className="h-4 w-4 ml-0.5" />
            </Link>
          </div>
          <div className="overflow-x-auto -mx-5 px-5 pb-2">
            <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
              {events.slice(0, 4).map((event) => (
                <Link
                  key={event.id}
                  href={`/portal/events/${event.id}`}
                  className="relative w-64 rounded-xl overflow-hidden flex-shrink-0 active:opacity-70 transition-opacity"
                  style={{ aspectRatio: '16/10' }}
                >
                  {event.imageUrl ? (
                    <img src={event.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 bg-stone-100 flex items-center justify-center">
                      <CalendarDays className="h-10 w-10 text-stone-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-semibold text-[15px] line-clamp-1">{event.title}</p>
                    <p className="text-white/80 text-sm mt-0.5">
                      {format(new Date(event.startDate), 'MMM d')} &middot; {event.location}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Club News */}
      {announcements.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-stone-900">Club News</h2>
            <Link
              href="/portal/news"
              className="flex items-center text-sm text-stone-500 font-medium"
            >
              See All
              <ChevronRight className="h-4 w-4 ml-0.5" />
            </Link>
          </div>
          <div className="space-y-2">
            {announcements.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                href={`/portal/news/${item.id}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/80 backdrop-blur-sm border border-stone-100 active:opacity-70 transition-opacity"
              >
                {item.imageUrl ? (
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-stone-100">
                    <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-stone-50 flex items-center justify-center">
                    <Newspaper className="h-5 w-5 text-stone-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-stone-900 line-clamp-1">{item.title}</p>
                  <p className="text-sm text-stone-500 line-clamp-1 mt-0.5">{item.body}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-stone-300 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}
      </div>
    </div>
  )
}
