'use client'

import { useState, useEffect } from 'react'
import { Save, RefreshCw, Mail, Palette } from 'lucide-react'
import { Button, cn } from '@clubvantage/ui'
import { getBrandConfig, getChannels, updateBrandConfigAction } from '../actions'

interface BrandConfig {
  id: string
  logoUrl?: string
  primaryColor?: string
  secondaryColor?: string
  tone?: string
  language?: string
  fromName?: string
  fromEmail?: string
  replyToEmail?: string
  guidelines?: string
}

interface Channel {
  id: string
  type: string
  status: string
  lastSyncAt?: string
}

export default function SettingsPage() {
  const [brandConfig, setBrandConfig] = useState<BrandConfig | null>(null)
  const [channels, setChannels] = useState<Channel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Brand config form state
  const [fromName, setFromName] = useState('')
  const [fromEmail, setFromEmail] = useState('')
  const [replyToEmail, setReplyToEmail] = useState('')
  const [tone, setTone] = useState('professional')
  const [language, setLanguage] = useState('en')
  const [primaryColor, setPrimaryColor] = useState('#f59e0b')
  const [secondaryColor, setSecondaryColor] = useState('#10b981')
  const [guidelines, setGuidelines] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const [config, channelsData] = await Promise.all([
          getBrandConfig().catch(() => null),
          getChannels().catch(() => []),
        ])
        if (config) {
          setBrandConfig(config)
          setFromName(config.fromName || '')
          setFromEmail(config.fromEmail || '')
          setReplyToEmail(config.replyToEmail || '')
          setTone(config.tone || 'professional')
          setLanguage(config.language || 'en')
          setPrimaryColor(config.primaryColor || '#f59e0b')
          setSecondaryColor(config.secondaryColor || '#10b981')
          setGuidelines(config.guidelines || '')
        }
        setChannels(channelsData)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      const result = await updateBrandConfigAction({
        fromName: fromName || undefined,
        fromEmail: fromEmail || undefined,
        replyToEmail: replyToEmail || undefined,
        tone,
        language,
        primaryColor,
        secondaryColor,
        guidelines: guidelines || undefined,
      })
      setBrandConfig(result)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch {
      // Handle error
    } finally {
      setIsSaving(false)
    }
  }

  const channelStatusColors: Record<string, string> = {
    ACTIVE: 'bg-emerald-500 text-white',
    INACTIVE: 'bg-stone-100 text-stone-600',
    ERROR: 'bg-red-500 text-white',
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Settings</h1>
          <p className="text-sm text-stone-500 mt-1">Configure your marketing brand and channels</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-stone-100 dark:bg-stone-800" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Settings</h1>
        <p className="text-sm text-stone-500 mt-1">Configure your marketing brand and channels</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sender Settings */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-stone-900 dark:border-stone-800">
          <div className="flex items-center gap-2 mb-4">
            <Mail className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Sender Settings</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                From Name
              </label>
              <input
                type="text"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                placeholder="e.g., Royal Bangkok Sports Club"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-stone-800 dark:border-stone-600 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                From Email
              </label>
              <input
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="e.g., noreply@royalbangkokclub.com"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-stone-800 dark:border-stone-600 dark:text-stone-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Reply-To Email
              </label>
              <input
                type="email"
                value={replyToEmail}
                onChange={(e) => setReplyToEmail(e.target.value)}
                placeholder="e.g., marketing@royalbangkokclub.com"
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-stone-800 dark:border-stone-600 dark:text-stone-100"
              />
            </div>
          </div>
        </div>

        {/* Brand Settings */}
        <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-stone-900 dark:border-stone-800">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Brand Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-stone-800 dark:border-stone-600 dark:text-stone-100"
                >
                  <option value="en">English</option>
                  <option value="th">Thai</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Primary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-9 w-12 rounded border border-stone-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-stone-800 dark:border-stone-600 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Secondary Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="h-9 w-12 rounded border border-stone-300 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-stone-800 dark:border-stone-600 dark:text-stone-100"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                Brand Guidelines
              </label>
              <textarea
                value={guidelines}
                onChange={(e) => setGuidelines(e.target.value)}
                placeholder="Describe your brand voice, dos and don'ts for AI content generation..."
                className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 dark:bg-stone-800 dark:border-stone-600 dark:text-stone-100"
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3">
        {saveSuccess && (
          <span className="text-sm text-emerald-600 font-medium">Settings saved successfully</span>
        )}
        <Button
          className="bg-gradient-to-br from-amber-500 to-amber-600 text-white"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>

      {/* Channel Configurations */}
      <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-stone-900 dark:border-stone-800">
        <h2 className="text-lg font-semibold mb-4 text-stone-900 dark:text-stone-100">Channels</h2>

        {channels.length === 0 ? (
          <p className="text-sm text-stone-500">No channels configured yet. Channels are created automatically when you send your first campaign.</p>
        ) : (
          <div className="space-y-3">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center justify-between rounded-lg border p-4 dark:border-stone-700"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-stone-400" />
                  <div>
                    <p className="font-medium text-stone-900 dark:text-stone-100">{channel.type}</p>
                    {channel.lastSyncAt && (
                      <p className="text-xs text-stone-500">
                        Last sync: {new Date(channel.lastSyncAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', channelStatusColors[channel.status] || 'bg-stone-100 text-stone-600')}>
                  {channel.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
