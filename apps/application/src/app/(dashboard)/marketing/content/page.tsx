'use client'

import { useState } from 'react'
import { Sparkles, RefreshCw, Copy, Check } from 'lucide-react'
import { Button, cn } from '@clubvantage/ui'
import { generateContentAction } from '../actions'

interface GeneratedContent {
  subject: string
  body: string
  previewText: string
}

export default function ContentPage() {
  const [campaignGoal, setCampaignGoal] = useState('')
  const [audienceDescription, setAudienceDescription] = useState('')
  const [tone, setTone] = useState('professional')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generated, setGenerated] = useState<GeneratedContent | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!campaignGoal.trim()) return
    setIsGenerating(true)
    try {
      const result = await generateContentAction({
        campaignGoal,
        audienceDescription: audienceDescription || undefined,
        tone,
      })
      setGenerated(result)
    } catch {
      // Handle error
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">AI Content Studio</h1>
        <p className="text-sm text-stone-500 mt-1">Generate email content using AI</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Form */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-stone-900 dark:border-stone-800">
          <h2 className="text-lg font-semibold mb-4 text-stone-900 dark:text-stone-100">Generate Content</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Campaign Goal *
              </label>
              <textarea
                value={campaignGoal}
                onChange={(e) => setCampaignGoal(e.target.value)}
                placeholder="e.g., Promote our new Sunday brunch menu with 20% member discount"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-stone-800 dark:border-stone-600 dark:text-stone-100"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Target Audience
              </label>
              <input
                type="text"
                value={audienceDescription}
                onChange={(e) => setAudienceDescription(e.target.value)}
                placeholder="e.g., Active members with dining preferences"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-stone-800 dark:border-stone-600 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Tone
              </label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-stone-800 dark:border-stone-600 dark:text-stone-100"
              >
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="luxurious">Luxurious</option>
                <option value="casual">Casual</option>
                <option value="formal">Formal</option>
              </select>
            </div>

            <Button
              className="w-full bg-gradient-to-br from-amber-500 to-amber-600 text-white"
              onClick={handleGenerate}
              disabled={isGenerating || !campaignGoal.trim()}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Content
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Generated Content Preview */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-stone-900 dark:border-stone-800">
          <h2 className="text-lg font-semibold mb-4 text-stone-900 dark:text-stone-100">Preview</h2>

          {!generated ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Sparkles className="h-12 w-12 text-stone-200 mb-3" />
              <p className="text-sm text-stone-500">Generated content will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-stone-500 uppercase">Subject Line</label>
                  <button
                    onClick={() => copyToClipboard(generated.subject, 'subject')}
                    className="text-stone-400 hover:text-stone-600"
                  >
                    {copiedField === 'subject' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-sm font-medium text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 rounded-lg p-3">
                  {generated.subject}
                </p>
              </div>

              {/* Preview Text */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-stone-500 uppercase">Preview Text</label>
                  <button
                    onClick={() => copyToClipboard(generated.previewText, 'preview')}
                    className="text-stone-400 hover:text-stone-600"
                  >
                    {copiedField === 'preview' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-stone-600 dark:text-stone-400 bg-stone-50 dark:bg-stone-800 rounded-lg p-3">
                  {generated.previewText}
                </p>
              </div>

              {/* Body Preview */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-stone-500 uppercase">Email Body</label>
                  <button
                    onClick={() => copyToClipboard(generated.body, 'body')}
                    className="text-stone-400 hover:text-stone-600"
                  >
                    {copiedField === 'body' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <div
                  className="rounded-lg border bg-white p-4 text-sm max-h-96 overflow-auto dark:bg-stone-800 dark:border-stone-700"
                  dangerouslySetInnerHTML={{ __html: generated.body }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
