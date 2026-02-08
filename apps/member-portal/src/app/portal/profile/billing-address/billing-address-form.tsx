'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin } from 'lucide-react'
import { useToast } from '@/components/portal/toast'
import { updateBillingAddress } from './actions'
import type { BillingAddressData } from './actions'

export function BillingAddressForm({ address }: { address: BillingAddressData }) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    if (address.id) {
      formData.set('id', address.id)
    }

    const result = await updateBillingAddress(formData)
    setSaving(false)

    if (result.success) {
      toast('Billing address saved')
      router.back()
    } else {
      setError(result.error ?? 'Failed to save address')
    }
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
          <h1 className="text-base font-semibold text-stone-900">Billing Address</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-5 py-6 pb-36">
        {/* Intro */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-900 flex-shrink-0">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Billing Address</h2>
            <p className="text-sm text-stone-500">Used for invoices and statements</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Address Line 1 */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              name="addressLine1"
              defaultValue={address.addressLine1}
              required
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[15px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
              placeholder="Street address, house number"
            />
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Address Line 2
            </label>
            <input
              name="addressLine2"
              defaultValue={address.addressLine2}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[15px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
              placeholder="Apartment, suite, unit, etc."
            />
          </div>

          {/* Sub-District & District */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Sub-District <span className="text-red-500">*</span>
              </label>
              <input
                name="subDistrict"
                defaultValue={address.subDistrict}
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[15px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                placeholder="Tambon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                District <span className="text-red-500">*</span>
              </label>
              <input
                name="district"
                defaultValue={address.district}
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[15px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                placeholder="Amphoe"
              />
            </div>
          </div>

          {/* Province & Postal Code */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Province <span className="text-red-500">*</span>
              </label>
              <input
                name="province"
                defaultValue={address.province}
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[15px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                placeholder="Province"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                name="postalCode"
                defaultValue={address.postalCode}
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[15px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
                placeholder="10110"
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Country
            </label>
            <input
              name="country"
              defaultValue={address.country}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-[15px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-transparent"
              placeholder="Thailand"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3.5 rounded-xl text-sm font-semibold bg-stone-900 text-white disabled:bg-stone-300 disabled:text-stone-500 transition-colors mt-2"
          >
            {saving ? 'Saving...' : 'Save Address'}
          </button>
        </form>
      </div>
    </div>
  )
}
