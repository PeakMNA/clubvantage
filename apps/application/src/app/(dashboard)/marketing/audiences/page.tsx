'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, RefreshCw, Sparkles, Users, Trash2 } from 'lucide-react'
import { Button, cn } from '@clubvantage/ui'
import {
  getSegments,
  createSegmentAction,
  deleteSegmentAction,
  refreshSegmentCountAction,
  translateSegmentQuery,
} from '../actions'

interface Segment {
  id: string
  name: string
  description?: string
  type: string
  memberCount: number
  isArchived: boolean
  rules?: unknown
  naturalLanguageQuery?: string
  refreshedAt?: string
  createdAt: string
}

interface TranslationResult {
  rules: unknown
  explanation: string
  estimatedCount: number
}

export default function AudiencesPage() {
  const [segments, setSegments] = useState<Segment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [nlQuery, setNlQuery] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null)
  const [newSegmentName, setNewSegmentName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [refreshingId, setRefreshingId] = useState<string | null>(null)

  const loadSegments = useCallback(async () => {
    try {
      const data = await getSegments()
      setSegments(data)
    } catch {
      // Segments will be empty
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSegments()
  }, [loadSegments])

  const handleTranslate = async () => {
    if (!nlQuery.trim()) return
    setIsTranslating(true)
    try {
      const result = await translateSegmentQuery(nlQuery)
      setTranslationResult(result)
    } catch {
      setTranslationResult(null)
    } finally {
      setIsTranslating(false)
    }
  }

  const handleCreateSegment = async () => {
    if (!newSegmentName.trim()) return
    setIsCreating(true)
    try {
      const rules = translationResult?.rules || []
      await createSegmentAction({
        name: newSegmentName,
        type: translationResult ? 'SMART' : 'CUSTOM',
        rules: Array.isArray(rules) ? rules : [],
        naturalLanguageQuery: nlQuery || undefined,
      })
      setShowCreateForm(false)
      setNewSegmentName('')
      setNlQuery('')
      setTranslationResult(null)
      await loadSegments()
    } catch {
      // Handle error
    } finally {
      setIsCreating(false)
    }
  }

  const handleRefresh = async (segmentId: string) => {
    setRefreshingId(segmentId)
    try {
      await refreshSegmentCountAction(segmentId)
      await loadSegments()
    } finally {
      setRefreshingId(null)
    }
  }

  const handleDelete = async (segmentId: string) => {
    try {
      await deleteSegmentAction(segmentId)
      await loadSegments()
    } catch {
      // Handle error
    }
  }

  const typeColors: Record<string, string> = {
    SMART: 'bg-purple-100 text-purple-700',
    CUSTOM: 'bg-blue-100 text-blue-700',
    MANUAL: 'bg-stone-100 text-stone-600',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Audiences</h1>
          <p className="text-sm text-stone-500 mt-1">Build and manage audience segments for your campaigns</p>
        </div>
        <Button
          size="sm"
          className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Segment
        </Button>
      </div>

      {/* Create Segment Form */}
      {showCreateForm && (
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-stone-900 dark:border-stone-800">
          <h2 className="text-lg font-semibold mb-4 text-stone-900 dark:text-stone-100">Create Audience Segment</h2>

          {/* AI Natural Language Builder */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Describe your audience in plain English
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                placeholder="e.g., Active members who haven't visited in 30 days with a golf membership"
                className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-stone-800 dark:border-stone-600 dark:text-stone-100"
                onKeyDown={(e) => e.key === 'Enter' && handleTranslate()}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleTranslate}
                disabled={isTranslating || !nlQuery.trim()}
              >
                {isTranslating ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Translate
              </Button>
            </div>
          </div>

          {/* Translation Result */}
          {translationResult && (
            <div className="mb-4 rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                {translationResult.explanation}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Estimated: ~{translationResult.estimatedCount.toLocaleString()} members
              </p>
            </div>
          )}

          {/* Segment Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
              Segment Name
            </label>
            <input
              type="text"
              value={newSegmentName}
              onChange={(e) => setNewSegmentName(e.target.value)}
              placeholder="e.g., Inactive Golf Members"
              className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-stone-800 dark:border-stone-600 dark:text-stone-100"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowCreateForm(false)
                setNlQuery('')
                setTranslationResult(null)
                setNewSegmentName('')
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
              onClick={handleCreateSegment}
              disabled={isCreating || !newSegmentName.trim()}
            >
              {isCreating ? 'Creating...' : 'Create Segment'}
            </Button>
          </div>
        </div>
      )}

      {/* Segments List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
          ))}
        </div>
      ) : segments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-white py-16 dark:bg-stone-900 dark:border-stone-800">
          <Users className="h-12 w-12 text-stone-300 mb-3" />
          <p className="text-lg font-medium text-stone-600 dark:text-stone-400">No segments yet</p>
          <p className="text-sm text-stone-500 mt-1">Create your first audience segment to start targeting members</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Segment
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {segments.map((segment) => (
            <div
              key={segment.id}
              className="flex items-center justify-between rounded-xl border bg-white p-5 shadow-sm dark:bg-stone-900 dark:border-stone-800"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-stone-900 dark:text-stone-100">{segment.name}</h3>
                  <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', typeColors[segment.type] || 'bg-stone-100 text-stone-600')}>
                    {segment.type}
                  </span>
                </div>
                {segment.description && (
                  <p className="text-sm text-stone-500 mt-1">{segment.description}</p>
                )}
                {segment.naturalLanguageQuery && (
                  <p className="text-xs text-purple-500 mt-1 italic">&ldquo;{segment.naturalLanguageQuery}&rdquo;</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-stone-900 dark:text-stone-100">
                    {segment.memberCount.toLocaleString()}
                  </p>
                  <p className="text-xs text-stone-500">members</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRefresh(segment.id)}
                    disabled={refreshingId === segment.id}
                    title="Refresh count"
                  >
                    <RefreshCw className={cn('h-4 w-4', refreshingId === segment.id && 'animate-spin')} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(segment.id)}
                    title="Archive segment"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
