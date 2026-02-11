'use client'

import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Mail, MousePointerClick, Users, AlertTriangle } from 'lucide-react'
import { cn } from '@clubvantage/ui'
import { getCampaigns, getCampaignMetrics } from '../actions'

interface CampaignWithMetrics {
  id: string
  name: string
  status: string
  sentAt?: string
  metrics?: {
    sent: number
    delivered: number
    opened: number
    clicked: number
    bounced: number
    unsubscribed: number
  }
}

export default function AnalyticsPage() {
  const [campaigns, setCampaigns] = useState<CampaignWithMetrics[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const campaignsData = await getCampaigns({ status: 'COMPLETED', limit: 10 })
        const withMetrics = await Promise.all(
          campaignsData.map(async (c: any) => {
            try {
              const metrics = await getCampaignMetrics(c.id)
              return { ...c, metrics }
            } catch {
              return c
            }
          })
        )
        setCampaigns(withMetrics)
      } catch {
        // Data will be empty
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const totals = campaigns.reduce(
    (acc, c) => {
      if (!c.metrics) return acc
      return {
        sent: acc.sent + c.metrics.sent,
        delivered: acc.delivered + c.metrics.delivered,
        opened: acc.opened + c.metrics.opened,
        clicked: acc.clicked + c.metrics.clicked,
        bounced: acc.bounced + c.metrics.bounced,
        unsubscribed: acc.unsubscribed + c.metrics.unsubscribed,
      }
    },
    { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0 }
  )

  const openRate = totals.delivered > 0 ? ((totals.opened / totals.delivered) * 100).toFixed(1) : '0'
  const clickRate = totals.opened > 0 ? ((totals.clicked / totals.opened) * 100).toFixed(1) : '0'
  const bounceRate = totals.sent > 0 ? ((totals.bounced / totals.sent) * 100).toFixed(1) : '0'

  const summaryCards = [
    { label: 'Total Sent', value: totals.sent, icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Open Rate', value: `${openRate}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Click Rate', value: `${clickRate}%`, icon: MousePointerClick, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Bounce Rate', value: `${bounceRate}%`, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Analytics</h1>
        <p className="text-sm text-stone-500 mt-1">Track campaign performance and engagement metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border bg-white p-5 shadow-sm dark:bg-stone-900 dark:border-stone-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">{card.label}</p>
                <p className="mt-1 text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {isLoading ? '-' : typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                </p>
              </div>
              <div className={cn('rounded-lg p-2.5', card.bg)}>
                <card.icon className={cn('h-5 w-5', card.color)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign Performance Table */}
      <div className="rounded-xl border bg-white shadow-sm dark:bg-stone-900 dark:border-stone-800">
        <div className="p-5 border-b dark:border-stone-800">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Campaign Performance</h2>
        </div>
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="h-12 w-12 text-stone-300 mb-3" />
            <p className="text-sm text-stone-500">No completed campaigns with metrics yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-medium uppercase text-stone-500 dark:border-stone-800">
                  <th className="px-5 py-3">Campaign</th>
                  <th className="px-5 py-3 text-right">Sent</th>
                  <th className="px-5 py-3 text-right">Delivered</th>
                  <th className="px-5 py-3 text-right">Opened</th>
                  <th className="px-5 py-3 text-right">Clicked</th>
                  <th className="px-5 py-3 text-right">Bounced</th>
                  <th className="px-5 py-3 text-right">Open Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-stone-800">
                {campaigns.map((campaign) => {
                  const m = campaign.metrics
                  const rate = m && m.delivered > 0 ? ((m.opened / m.delivered) * 100).toFixed(1) : '-'
                  return (
                    <tr key={campaign.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-stone-900 dark:text-stone-100">{campaign.name}</p>
                        {campaign.sentAt && (
                          <p className="text-xs text-stone-500">
                            {new Date(campaign.sentAt).toLocaleDateString()}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right text-stone-600 dark:text-stone-400">
                        {m?.sent.toLocaleString() ?? '-'}
                      </td>
                      <td className="px-5 py-3 text-right text-stone-600 dark:text-stone-400">
                        {m?.delivered.toLocaleString() ?? '-'}
                      </td>
                      <td className="px-5 py-3 text-right text-stone-600 dark:text-stone-400">
                        {m?.opened.toLocaleString() ?? '-'}
                      </td>
                      <td className="px-5 py-3 text-right text-stone-600 dark:text-stone-400">
                        {m?.clicked.toLocaleString() ?? '-'}
                      </td>
                      <td className="px-5 py-3 text-right text-stone-600 dark:text-stone-400">
                        {m?.bounced.toLocaleString() ?? '-'}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className={cn(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          rate !== '-' && parseFloat(rate) > 20
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-stone-100 text-stone-600'
                        )}>
                          {rate === '-' ? '-' : `${rate}%`}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Unsubscribe Summary */}
      {totals.unsubscribed > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:bg-amber-900/20 dark:border-amber-800">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-300">
                {totals.unsubscribed.toLocaleString()} total unsubscribes
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                across {campaigns.length} completed campaigns
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
