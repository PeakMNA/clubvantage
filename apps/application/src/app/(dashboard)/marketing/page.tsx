'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Mail, Target, TrendingUp, Users, BarChart3, Sparkles } from 'lucide-react'
import { Button, cn } from '@clubvantage/ui'
import { getMarketingStats, getCampaigns, getSegments } from './actions'

interface MarketingStats {
  totalCampaigns: number
  activeCampaigns: number
  totalAudienceSize: number
  totalEmailsSent: number
}

interface Campaign {
  id: string
  name: string
  type: string
  status: string
  channels: string[]
  sentAt?: string
  segmentCount?: number
  memberCount?: number
}

interface Segment {
  id: string
  name: string
  type: string
  memberCount: number
  refreshedAt?: string
}

export default function MarketingDashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<MarketingStats | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [segments, setSegments] = useState<Segment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, campaignsData, segmentsData] = await Promise.all([
          getMarketingStats().catch(() => null),
          getCampaigns({ limit: 5 }).catch(() => []),
          getSegments().catch(() => []),
        ])
        if (statsData) setStats(statsData)
        setCampaigns(campaignsData)
        setSegments(segmentsData)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const statCards = [
    {
      label: 'Total Campaigns',
      value: stats?.totalCampaigns ?? 0,
      icon: Mail,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Active Campaigns',
      value: stats?.activeCampaigns ?? 0,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Total Audience',
      value: stats?.totalAudienceSize ?? 0,
      icon: Users,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Emails Sent',
      value: stats?.totalEmailsSent ?? 0,
      icon: BarChart3,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ]

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-stone-100 text-stone-600',
    ACTIVE: 'bg-emerald-500 text-white',
    PAUSED: 'bg-amber-500 text-white',
    COMPLETED: 'bg-blue-500 text-white',
    ARCHIVED: 'bg-stone-100 text-stone-500',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Marketing</h1>
          <p className="text-sm text-stone-500 mt-1">Manage campaigns, audiences, and content</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/marketing/audiences')}
          >
            <Target className="mr-2 h-4 w-4" />
            New Segment
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
            onClick={() => router.push('/marketing/campaigns')}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border bg-white p-5 shadow-sm dark:bg-stone-900 dark:border-stone-800"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">{card.label}</p>
                <p className="mt-1 text-2xl font-bold text-stone-900 dark:text-stone-100">
                  {isLoading ? '-' : card.value.toLocaleString()}
                </p>
              </div>
              <div className={cn('rounded-lg p-2.5', card.bg)}>
                <card.icon className={cn('h-5 w-5', card.color)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Campaigns */}
        <div className="rounded-xl border bg-white p-5 shadow-sm dark:bg-stone-900 dark:border-stone-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Recent Campaigns</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/marketing/campaigns')}
            >
              View All
            </Button>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Sparkles className="h-8 w-8 text-stone-300 mb-2" />
              <p className="text-sm text-stone-500">No campaigns yet</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => router.push('/marketing/campaigns')}
              >
                Create your first campaign
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {campaigns.map((campaign) => (
                <button
                  key={campaign.id}
                  onClick={() => router.push(`/marketing/campaigns/${campaign.id}`)}
                  className="flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors hover:bg-stone-50 dark:hover:bg-stone-800 dark:border-stone-700"
                >
                  <div>
                    <p className="font-medium text-stone-900 dark:text-stone-100">{campaign.name}</p>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {campaign.channels.join(', ')} &middot; {campaign.type}
                    </p>
                  </div>
                  <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', statusColors[campaign.status] || 'bg-stone-100 text-stone-600')}>
                    {campaign.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Audience Segments */}
        <div className="rounded-xl border bg-white p-5 shadow-sm dark:bg-stone-900 dark:border-stone-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Audience Segments</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/marketing/audiences')}
            >
              View All
            </Button>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-lg bg-stone-100 dark:bg-stone-800" />
              ))}
            </div>
          ) : segments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Target className="h-8 w-8 text-stone-300 mb-2" />
              <p className="text-sm text-stone-500">No segments yet</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => router.push('/marketing/audiences')}
              >
                Create your first segment
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {segments.map((segment) => (
                <div
                  key={segment.id}
                  className="flex items-center justify-between rounded-lg border p-3 dark:border-stone-700"
                >
                  <div>
                    <p className="font-medium text-stone-900 dark:text-stone-100">{segment.name}</p>
                    <p className="text-xs text-stone-500 mt-0.5">{segment.type} segment</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {segment.memberCount.toLocaleString()}
                    </p>
                    <p className="text-xs text-stone-500">members</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
