'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Mail, Send, Trash2, Pause, Play } from 'lucide-react'
import { Button, cn } from '@clubvantage/ui'
import {
  getCampaigns,
  getSegments,
  createCampaignAction,
  deleteCampaignAction,
  sendCampaignAction,
} from '../actions'

interface Campaign {
  id: string
  name: string
  type: string
  status: string
  channels: string[]
  scheduledAt?: string
  sentAt?: string
  createdAt: string
  segmentCount?: number
  contentPieceCount?: number
  memberCount?: number
}

interface Segment {
  id: string
  name: string
  memberCount: number
}

export default function CampaignsPage() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [segments, setSegments] = useState<Segment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('')

  // Create form state
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState('ONE_SHOT')
  const [formChannels, setFormChannels] = useState<string[]>(['EMAIL'])
  const [formSegmentIds, setFormSegmentIds] = useState<string[]>([])

  const loadData = useCallback(async () => {
    try {
      const [campaignsData, segmentsData] = await Promise.all([
        getCampaigns(statusFilter ? { status: statusFilter, limit: 50 } : { limit: 50 }),
        getSegments(),
      ])
      setCampaigns(campaignsData)
      setSegments(segmentsData)
    } catch {
      // Data will be empty
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleCreate = async () => {
    if (!formName.trim()) return
    setIsCreating(true)
    try {
      await createCampaignAction({
        name: formName,
        type: formType,
        channels: formChannels,
        segmentIds: formSegmentIds.length > 0 ? formSegmentIds : undefined,
      })
      setShowCreateForm(false)
      setFormName('')
      setFormType('ONE_SHOT')
      setFormChannels(['EMAIL'])
      setFormSegmentIds([])
      await loadData()
    } finally {
      setIsCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCampaignAction(id)
      await loadData()
    } catch {
      // Handle error
    }
  }

  const handleSend = async (id: string) => {
    try {
      await sendCampaignAction(id)
      await loadData()
    } catch {
      // Handle error
    }
  }

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-stone-100 text-stone-600',
    ACTIVE: 'bg-emerald-500 text-white',
    PAUSED: 'bg-amber-500 text-white',
    COMPLETED: 'bg-blue-500 text-white',
    ARCHIVED: 'bg-stone-100 text-stone-500',
  }

  const statusFilters = ['', 'DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Campaigns</h1>
          <p className="text-sm text-stone-500 mt-1">Create and manage marketing campaigns</p>
        </div>
        <Button
          size="sm"
          className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 rounded-lg bg-stone-100 p-1 dark:bg-stone-800">
        {statusFilters.map((filter) => (
          <button
            key={filter || 'all'}
            onClick={() => setStatusFilter(filter)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              statusFilter === filter
                ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-100'
                : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
            )}
          >
            {filter || 'All'}
          </button>
        ))}
      </div>

      {/* Create Campaign Form */}
      {showCreateForm && (
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-stone-900 dark:border-stone-800">
          <h2 className="text-lg font-semibold mb-4 text-stone-900 dark:text-stone-100">New Campaign</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Campaign Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., February Newsletter"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-stone-800 dark:border-stone-600 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Type
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-stone-800 dark:border-stone-600 dark:text-stone-100"
              >
                <option value="ONE_SHOT">One-Shot</option>
                <option value="AUTOMATED_FLOW">Automated Flow</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Channel
              </label>
              <select
                value={formChannels[0]}
                onChange={(e) => setFormChannels([e.target.value])}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-stone-800 dark:border-stone-600 dark:text-stone-100"
              >
                <option value="EMAIL">Email</option>
                <option value="LINE">LINE</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Target Segments
              </label>
              <select
                multiple
                value={formSegmentIds}
                onChange={(e) =>
                  setFormSegmentIds(Array.from(e.target.selectedOptions, (o) => o.value))
                }
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-stone-800 dark:border-stone-600 dark:text-stone-100"
                size={3}
              >
                {segments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.memberCount} members)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={() => setShowCreateForm(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
              onClick={handleCreate}
              disabled={isCreating || !formName.trim()}
            >
              {isCreating ? 'Creating...' : 'Create Campaign'}
            </Button>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-16 dark:bg-stone-900 dark:border-stone-800">
          <Mail className="h-12 w-12 text-stone-300 mb-3" />
          <p className="text-lg font-medium text-stone-600 dark:text-stone-400">No campaigns yet</p>
          <p className="text-sm text-stone-500 mt-1">Create your first campaign to reach your audience</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="rounded-xl border bg-white p-5 shadow-sm dark:bg-stone-900 dark:border-stone-800"
            >
              <div className="flex items-center justify-between">
                <button
                  className="flex-1 text-left"
                  onClick={() => router.push(`/marketing/campaigns/${campaign.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-stone-900 dark:text-stone-100">{campaign.name}</h3>
                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', statusColors[campaign.status])}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
                    <span>{campaign.type}</span>
                    <span>&middot;</span>
                    <span>{campaign.channels.join(', ')}</span>
                    {campaign.segmentCount !== undefined && (
                      <>
                        <span>&middot;</span>
                        <span>{campaign.segmentCount} segments</span>
                      </>
                    )}
                    {campaign.sentAt && (
                      <>
                        <span>&middot;</span>
                        <span>Sent {new Date(campaign.sentAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </button>
                <div className="flex gap-1">
                  {campaign.status === 'DRAFT' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSend(campaign.id)}
                        title="Send campaign"
                      >
                        <Send className="h-4 w-4 text-emerald-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(campaign.id)}
                        title="Delete campaign"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
