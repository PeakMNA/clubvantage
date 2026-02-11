'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Send, Trash2, Users, FileText, Sparkles, RefreshCw, Plus } from 'lucide-react'
import { Button, cn } from '@clubvantage/ui'
import {
  getCampaign,
  getCampaignMetrics,
  sendCampaignAction,
  deleteCampaignAction,
  generateContentAction,
} from '../../actions'

interface Campaign {
  id: string
  name: string
  type: string
  status: string
  channels: string[]
  scheduledAt?: string
  sentAt?: string
  createdAt: string
  segments: Array<{ id: string; name: string; memberCount: number }>
  contentPieces: Array<{
    id: string
    type: string
    subject: string
    body: string
    previewText?: string
    status: string
    variantLabel?: string
  }>
  segmentCount: number
  contentPieceCount: number
  memberCount: number
}

interface Metrics {
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  unsubscribed: number
}

export default function CampaignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'audience'>('overview')

  const loadCampaign = useCallback(async () => {
    try {
      const [data, metricsData] = await Promise.all([
        getCampaign(campaignId),
        getCampaignMetrics(campaignId).catch(() => null),
      ])
      setCampaign(data)
      if (metricsData) setMetrics(metricsData)
    } catch {
      // Handle error
    } finally {
      setIsLoading(false)
    }
  }, [campaignId])

  useEffect(() => {
    loadCampaign()
  }, [loadCampaign])

  const handleSend = async () => {
    if (!campaign) return
    try {
      await sendCampaignAction(campaign.id)
      await loadCampaign()
    } catch {
      // Handle error
    }
  }

  const handleDelete = async () => {
    if (!campaign) return
    try {
      await deleteCampaignAction(campaign.id)
      router.push('/marketing/campaigns')
    } catch {
      // Handle error
    }
  }

  const handleGenerateContent = async () => {
    if (!campaign) return
    setIsGenerating(true)
    try {
      await generateContentAction({
        campaignGoal: campaign.name,
        tone: 'professional',
      })
      await loadCampaign()
    } catch {
      // Handle error
    } finally {
      setIsGenerating(false)
    }
  }

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-stone-100 text-stone-600',
    ACTIVE: 'bg-emerald-500 text-white',
    PAUSED: 'bg-amber-500 text-white',
    COMPLETED: 'bg-blue-500 text-white',
    ARCHIVED: 'bg-stone-100 text-stone-500',
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-stone-100 dark:bg-stone-800" />
        <div className="h-64 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-lg font-medium text-stone-600">Campaign not found</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => router.push('/marketing/campaigns')}>
          Back to Campaigns
        </Button>
      </div>
    )
  }

  const tabs = ['overview', 'content', 'audience'] as const

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/marketing/campaigns')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">{campaign.name}</h1>
              <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', statusColors[campaign.status])}>
                {campaign.status}
              </span>
            </div>
            <p className="text-sm text-stone-500 mt-0.5">
              {campaign.type} &middot; {campaign.channels.join(', ')}
              {campaign.sentAt && ` \u00B7 Sent ${new Date(campaign.sentAt).toLocaleDateString()}`}
            </p>
          </div>
        </div>
        {campaign.status === 'DRAFT' && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4 text-red-500" />
              Delete
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
              onClick={handleSend}
            >
              <Send className="mr-2 h-4 w-4" />
              Send Campaign
            </Button>
          </div>
        )}
      </div>

      {/* Metrics (for sent/completed campaigns) */}
      {metrics && (campaign.status === 'ACTIVE' || campaign.status === 'COMPLETED') && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: 'Sent', value: metrics.sent },
            { label: 'Delivered', value: metrics.delivered },
            { label: 'Opened', value: metrics.opened },
            { label: 'Clicked', value: metrics.clicked },
            { label: 'Bounced', value: metrics.bounced },
            { label: 'Unsubscribed', value: metrics.unsubscribed },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-lg border bg-white p-3 text-center dark:bg-stone-900 dark:border-stone-800"
            >
              <p className="text-lg font-bold text-stone-900 dark:text-stone-100">
                {m.value.toLocaleString()}
              </p>
              <p className="text-xs text-stone-500">{m.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-stone-100 p-1 dark:bg-stone-800">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors',
              activeTab === tab
                ? 'bg-white text-stone-900 shadow-sm dark:bg-stone-700 dark:text-stone-100'
                : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-stone-900 dark:border-stone-800">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">Details</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone-500">Type</dt>
                <dd className="font-medium text-stone-900 dark:text-stone-100">{campaign.type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Channels</dt>
                <dd className="font-medium text-stone-900 dark:text-stone-100">{campaign.channels.join(', ')}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Segments</dt>
                <dd className="font-medium text-stone-900 dark:text-stone-100">{campaign.segmentCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Content Pieces</dt>
                <dd className="font-medium text-stone-900 dark:text-stone-100">{campaign.contentPieceCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Total Recipients</dt>
                <dd className="font-medium text-stone-900 dark:text-stone-100">{campaign.memberCount.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-stone-500">Created</dt>
                <dd className="font-medium text-stone-900 dark:text-stone-100">
                  {new Date(campaign.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-stone-900 dark:border-stone-800">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100 mb-3">Audience Segments</h3>
            {campaign.segments.length === 0 ? (
              <p className="text-sm text-stone-500">No segments attached</p>
            ) : (
              <div className="space-y-2">
                {campaign.segments.map((seg) => (
                  <div key={seg.id} className="flex items-center justify-between rounded-lg border p-3 dark:border-stone-700">
                    <span className="font-medium text-stone-900 dark:text-stone-100">{seg.name}</span>
                    <span className="text-sm text-stone-500">{seg.memberCount.toLocaleString()} members</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-4">
          {campaign.status === 'DRAFT' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateContent}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Content with AI
                </>
              )}
            </Button>
          )}

          {campaign.contentPieces.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-16 dark:bg-stone-900 dark:border-stone-800">
              <FileText className="h-12 w-12 text-stone-300 mb-3" />
              <p className="text-lg font-medium text-stone-600 dark:text-stone-400">No content yet</p>
              <p className="text-sm text-stone-500 mt-1">Generate content using AI or add manually</p>
            </div>
          ) : (
            campaign.contentPieces.map((piece) => (
              <div
                key={piece.id}
                className="rounded-xl border bg-white p-6 shadow-sm dark:bg-stone-900 dark:border-stone-800"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-stone-900 dark:text-stone-100">
                      {piece.variantLabel || piece.type}
                    </h3>
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      piece.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-600'
                    )}>
                      {piece.status}
                    </span>
                  </div>
                </div>
                {piece.subject && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-stone-500 uppercase mb-1">Subject</p>
                    <p className="text-sm font-medium text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 rounded-lg p-3">
                      {piece.subject}
                    </p>
                  </div>
                )}
                {piece.previewText && (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-stone-500 uppercase mb-1">Preview Text</p>
                    <p className="text-sm text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-800 rounded-lg p-3">
                      {piece.previewText}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-stone-500 uppercase mb-1">Body</p>
                  <div
                    className="rounded-lg border bg-white p-4 text-sm max-h-64 overflow-auto dark:bg-stone-800 dark:border-stone-700"
                    dangerouslySetInnerHTML={{ __html: piece.body }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'audience' && (
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-stone-900 dark:border-stone-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-900 dark:text-stone-100">
              Target Audience ({campaign.memberCount.toLocaleString()} members)
            </h3>
          </div>

          {campaign.segments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-stone-300 mb-3" />
              <p className="text-sm text-stone-500">No segments attached to this campaign</p>
            </div>
          ) : (
            <div className="space-y-3">
              {campaign.segments.map((seg) => (
                <div
                  key={seg.id}
                  className="flex items-center justify-between rounded-lg border p-4 dark:border-stone-700"
                >
                  <div>
                    <p className="font-medium text-stone-900 dark:text-stone-100">{seg.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-stone-900 dark:text-stone-100">
                      {seg.memberCount.toLocaleString()}
                    </p>
                    <p className="text-xs text-stone-500">members</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
