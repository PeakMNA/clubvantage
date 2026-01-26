'use client'

import { ReportKpiCard } from './report-kpi-card'
import { AlertCard } from './alert-card'
import { Card, CardContent, CardHeader, CardTitle } from '@clubvantage/ui'
import { Users, CreditCard, Calendar, Receipt, FileText, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface DashboardKpi {
  label: string
  value: string | number
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    label?: string
  }
  sparklineData?: number[]
  href?: string
}

interface DashboardAlert {
  id: string
  type: 'warning' | 'action' | 'info' | 'success'
  title: string
  description: string
  href?: string
  actionLabel?: string
}

interface QuickStat {
  label: string
  value: string | number
  icon: React.ElementType
}

interface ActivityItem {
  id: string
  description: string
  timestamp: Date
  type: 'payment' | 'member' | 'invoice' | 'booking'
}

interface ManagerDashboardTabProps {
  kpis?: DashboardKpi[]
  alerts?: DashboardAlert[]
  quickStats?: QuickStat[]
  activities?: ActivityItem[]
  isLoading?: boolean
  onKpiClick?: (index: number) => void
  onAlertClick?: (alertId: string) => void
}

const defaultKpis: DashboardKpi[] = [
  {
    label: 'Revenue MTD',
    value: '฿2,450,000',
    trend: { value: 12.5, direction: 'up', label: 'vs last month' },
    sparklineData: [180, 200, 195, 220, 215, 235, 245],
    href: '/reports?tab=financial',
  },
  {
    label: 'Outstanding A/R',
    value: '฿890,000',
    trend: { value: 5.2, direction: 'down', label: 'vs last month' },
    sparklineData: [120, 110, 105, 100, 95, 92, 89],
    href: '/reports?tab=receivables',
  },
  {
    label: 'Active Members',
    value: '1,234',
    trend: { value: 2.1, direction: 'up', label: 'vs last month' },
    sparklineData: [1180, 1195, 1200, 1210, 1220, 1228, 1234],
    href: '/reports?tab=membership',
  },
  {
    label: 'Utilization',
    value: '78%',
    trend: { value: 8.3, direction: 'up', label: 'vs last month' },
    sparklineData: [65, 68, 70, 72, 74, 76, 78],
  },
]

const defaultAlerts: DashboardAlert[] = [
  {
    id: '1',
    type: 'warning',
    title: '12 members approaching suspension',
    description: '61-90 days overdue',
    href: '/reports?tab=receivables',
    actionLabel: 'View in Receivables',
  },
  {
    id: '2',
    type: 'action',
    title: '3 applications pending board',
    description: 'Awaiting approval',
    href: '/members?filter=pending-board',
    actionLabel: 'View in Members',
  },
  {
    id: '3',
    type: 'info',
    title: '8 WHT certificates need verification',
    description: 'Pending review',
    href: '/reports?tab=wht',
    actionLabel: 'View in WHT',
  },
]

const defaultQuickStats: QuickStat[] = [
  { label: 'New Members This Month', value: 15, icon: Users },
  { label: 'Payments Received Today', value: '฿125,000', icon: CreditCard },
  { label: 'Upcoming Bookings', value: 47, icon: Calendar },
]

const defaultActivities: ActivityItem[] = [
  {
    id: '1',
    description: 'Invoice #1234 paid by John Smith',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'payment',
  },
  {
    id: '2',
    description: 'New member application: Jane Doe',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    type: 'member',
  },
  {
    id: '3',
    description: 'Invoice #1235 generated for Michael Chen',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    type: 'invoice',
  },
  {
    id: '4',
    description: 'Tee time booked for tomorrow 8:00 AM',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    type: 'booking',
  },
  {
    id: '5',
    description: 'WHT certificate verified for Sarah Johnson',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    type: 'payment',
  },
]

const activityIcons: Record<string, React.ElementType> = {
  payment: Receipt,
  member: Users,
  invoice: FileText,
  booking: Calendar,
}

export function ManagerDashboardTab({
  kpis = defaultKpis,
  alerts = defaultAlerts,
  quickStats = defaultQuickStats,
  activities = defaultActivities,
  isLoading,
  onKpiClick,
  onAlertClick,
}: ManagerDashboardTabProps) {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <ReportKpiCard
            key={index}
            label={kpi.label}
            value={kpi.value}
            trend={kpi.trend}
            sparklineData={kpi.sparklineData}
            href={kpi.href}
            onClick={onKpiClick ? () => onKpiClick(index) : undefined}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Alert Cards */}
      {alerts.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-stone-900">Requires Attention</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                type={alert.type}
                title={alert.title}
                description={alert.description}
                href={alert.href}
                actionLabel={alert.actionLabel}
                onAction={onAlertClick ? () => onAlertClick(alert.id) : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {/* Quick Stats & Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-3">
              {quickStats.map((stat, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-lg bg-stone-50 p-3"
                >
                  <div className="rounded-lg bg-white p-2 shadow-sm">
                    <stat.icon className="h-5 w-5 text-stone-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
                    <p className="text-xs text-stone-500">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-[300px] space-y-3 overflow-y-auto">
              {activities.map((activity) => {
                const Icon = activityIcons[activity.type] || FileText
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="rounded-lg bg-stone-100 p-2">
                      <Icon className="h-4 w-4 text-stone-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-stone-700">{activity.description}</p>
                      <p className="text-xs text-stone-400">
                        <Clock className="mr-1 inline h-3 w-3" />
                        {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
