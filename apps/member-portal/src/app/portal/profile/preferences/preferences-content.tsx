'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@clubvantage/ui'
import { ArrowLeft, Mail, MessageSquare, Bell } from 'lucide-react'
import { updatePreferences } from './actions'
import type { PreferencesData } from './actions'

const NOTIFICATION_CATEGORIES = [
  { key: 'billing', label: 'Billing & Payments', description: 'Statements, invoices, payment reminders' },
  { key: 'bookings', label: 'Bookings', description: 'Facility booking confirmations & reminders' },
  { key: 'golf', label: 'Golf', description: 'Tee time confirmations & course updates' },
  { key: 'events', label: 'Events', description: 'Club events, tournaments, social gatherings' },
  { key: 'dining', label: 'Dining', description: 'Restaurant specials, reservation updates' },
  { key: 'club', label: 'Club Updates', description: 'General announcements & news' },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors flex-shrink-0',
        checked ? 'bg-stone-900' : 'bg-stone-300'
      )}
    >
      <div
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        )}
      />
    </button>
  )
}

export function PreferencesContent({ initial }: { initial: PreferencesData }) {
  const router = useRouter()
  const [email, setEmail] = useState(initial.emailPromotions)
  const [sms, setSms] = useState(initial.smsPromotions)
  const [push, setPush] = useState(initial.pushNotifications)
  const [categories, setCategories] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    for (const cat of NOTIFICATION_CATEGORIES) {
      map[cat.key] = !initial.unsubscribedCategories.includes(cat.key)
    }
    return map
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const toggleCategory = (key: string) => {
    setCategories((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)

    const formData = new FormData()
    formData.set('emailPromotions', String(email))
    formData.set('smsPromotions', String(sms))
    formData.set('pushNotifications', String(push))
    for (const cat of NOTIFICATION_CATEGORIES) {
      formData.set(`cat_${cat.key}`, String(categories[cat.key] ?? false))
    }

    await updatePreferences(formData)
    setSaved(true)
    setSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-stone-100">
        <div className="flex items-center justify-between px-5 py-3 pt-safe">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-50 -ml-1"
          >
            <ArrowLeft className="h-5 w-5 text-stone-700" />
          </button>
          <h1 className="text-base font-semibold text-stone-900">Preferences</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-5 py-6 pb-36 space-y-8">
        {/* Communication Channels */}
        <section>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">
            Communication Channels
          </p>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-50">
                  <Mail className="h-4 w-4 text-stone-500" />
                </div>
                <div>
                  <p className="text-[15px] font-medium text-stone-900">Email</p>
                  <p className="text-xs text-stone-500">Promotions & newsletters</p>
                </div>
              </div>
              <Toggle checked={email} onChange={setEmail} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-50">
                  <MessageSquare className="h-4 w-4 text-stone-500" />
                </div>
                <div>
                  <p className="text-[15px] font-medium text-stone-900">SMS</p>
                  <p className="text-xs text-stone-500">Text message alerts</p>
                </div>
              </div>
              <Toggle checked={sms} onChange={setSms} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-50">
                  <Bell className="h-4 w-4 text-stone-500" />
                </div>
                <div>
                  <p className="text-[15px] font-medium text-stone-900">Push Notifications</p>
                  <p className="text-xs text-stone-500">In-app and device notifications</p>
                </div>
              </div>
              <Toggle checked={push} onChange={setPush} />
            </div>
          </div>
        </section>

        {/* Notification Categories */}
        <section>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">
            Notification Categories
          </p>
          <div className="space-y-4">
            {NOTIFICATION_CATEGORIES.map((cat) => (
              <div key={cat.key} className="flex items-center justify-between">
                <div>
                  <p className="text-[15px] font-medium text-stone-900">{cat.label}</p>
                  <p className="text-xs text-stone-500">{cat.description}</p>
                </div>
                <Toggle
                  checked={categories[cat.key] ?? true}
                  onChange={() => toggleCategory(cat.key)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Success Message */}
        {saved && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700">
            Preferences saved
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="fixed bottom-24 left-0 right-0 z-40 px-5 py-4 bg-white border-t border-stone-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 rounded-xl bg-stone-900 text-white font-semibold text-sm disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  )
}
