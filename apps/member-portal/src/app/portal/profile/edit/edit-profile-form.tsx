'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { updateProfile } from './actions'

interface ProfileData {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  address: string
  emergencyContact: string
  emergencyPhone: string
  memberId: string
  membershipType: string
}

export function EditProfileForm({ profile }: { profile: ProfileData }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSaved(false)

    const formData = new FormData(e.currentTarget)
    const result = await updateProfile(formData)

    if (result.success) {
      setSaved(true)
      setTimeout(() => router.back(), 800)
    } else {
      setError(result.error ?? 'Failed to save')
    }
    setSaving(false)
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
          <h1 className="text-base font-semibold text-stone-900">Edit Profile</h1>
          <div className="w-9" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-5 py-6 space-y-6 pb-36">
        {/* Read-only info */}
        <div className="rounded-xl bg-stone-50 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-500">Member ID</span>
            <span className="font-mono text-stone-900">{profile.memberId}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-stone-500">Membership</span>
            <span className="text-stone-900">{profile.membershipType}</span>
          </div>
        </div>

        {/* Name */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
            Personal Information
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-stone-600 mb-1 block">First Name</span>
              <input
                name="firstName"
                defaultValue={profile.firstName}
                required
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-[15px] text-stone-900 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400"
              />
            </label>
            <label className="block">
              <span className="text-sm text-stone-600 mb-1 block">Last Name</span>
              <input
                name="lastName"
                defaultValue={profile.lastName}
                required
                className="w-full rounded-xl border border-stone-200 px-4 py-3 text-[15px] text-stone-900 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-sm text-stone-600 mb-1 block">Email</span>
            <input
              name="email"
              type="email"
              defaultValue={profile.email}
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-[15px] text-stone-900 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400"
            />
          </label>

          <label className="block">
            <span className="text-sm text-stone-600 mb-1 block">Phone</span>
            <input
              name="phone"
              type="tel"
              defaultValue={profile.phone}
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-[15px] text-stone-900 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400"
            />
          </label>

          <label className="block">
            <span className="text-sm text-stone-600 mb-1 block">Address</span>
            <textarea
              name="address"
              defaultValue={profile.address}
              rows={2}
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-[15px] text-stone-900 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 resize-none"
            />
          </label>
        </fieldset>

        {/* Emergency Contact */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
            Emergency Contact
          </legend>
          <label className="block">
            <span className="text-sm text-stone-600 mb-1 block">Contact Name</span>
            <input
              name="emergencyContact"
              defaultValue={profile.emergencyContact}
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-[15px] text-stone-900 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400"
            />
          </label>
          <label className="block">
            <span className="text-sm text-stone-600 mb-1 block">Contact Phone</span>
            <input
              name="emergencyPhone"
              type="tel"
              defaultValue={profile.emergencyPhone}
              className="w-full rounded-xl border border-stone-200 px-4 py-3 text-[15px] text-stone-900 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400"
            />
          </label>
        </fieldset>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Success */}
        {saved && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700">
            Profile updated successfully
          </div>
        )}

        {/* Submit */}
        <div className="fixed bottom-24 left-0 right-0 z-40 px-5 py-4 bg-white border-t border-stone-200">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-stone-900 text-white font-semibold text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
