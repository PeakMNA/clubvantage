'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@clubvantage/ui'
import { ArrowLeft, Plus, Users, X } from 'lucide-react'
import { addDependent, removeDependent } from './actions'
import type { DependentData } from './actions'

const RELATIONSHIPS = ['Spouse', 'Child', 'Parent', 'Sibling', 'Other']

export function DependentsContent({ dependents: initial }: { dependents: DependentData[] }) {
  const router = useRouter()
  const [dependents, setDependents] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)

  const activeDependents = dependents.filter((d) => d.isActive)

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await addDependent(formData)

    if (result.success) {
      setShowForm(false)
      router.refresh()
      // Optimistic: add to local state
      const newDep: DependentData = {
        id: `temp-${Date.now()}`,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        relationship: formData.get('relationship') as string,
        dateOfBirth: (formData.get('dateOfBirth') as string) || null,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        isActive: true,
      }
      setDependents([...dependents, newDep])
    } else {
      setError(result.error ?? 'Failed to add')
    }
    setSaving(false)
  }

  const handleRemove = async (id: string) => {
    setRemoving(id)
    const result = await removeDependent(id)
    if (result.success) {
      setDependents(dependents.map((d) => (d.id === id ? { ...d, isActive: false } : d)))
      router.refresh()
    }
    setRemoving(null)
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
          <h1 className="text-base font-semibold text-stone-900">Dependents</h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-50"
          >
            <Plus className="h-5 w-5 text-stone-700" />
          </button>
        </div>
      </div>

      <div className="px-5 py-6 pb-36">
        {/* Dependent List */}
        {activeDependents.length > 0 ? (
          <div className="space-y-3">
            {activeDependents.map((dep) => (
              <div
                key={dep.id}
                className="flex items-center gap-3 rounded-xl border border-stone-100 p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 flex-shrink-0">
                  <Users className="h-5 w-5 text-stone-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-stone-900">
                    {dep.firstName} {dep.lastName}
                  </p>
                  <p className="text-sm text-stone-500">{dep.relationship}</p>
                  {dep.email && (
                    <p className="text-xs text-stone-400 mt-0.5">{dep.email}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemove(dep.id)}
                  disabled={removing === dep.id}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"
                >
                  {removing === dep.id ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-300 border-t-transparent" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-50">
              <Users className="h-8 w-8 text-stone-300" />
            </div>
            <p className="text-stone-500 text-sm">No dependents added yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold"
            >
              Add Dependent
            </button>
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <div className="mt-6 rounded-xl border border-stone-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-stone-900">Add Dependent</h2>
              <button
                onClick={() => { setShowForm(false); setError(null) }}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-stone-50"
              >
                <X className="h-4 w-4 text-stone-500" />
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm text-stone-600 mb-1 block">First Name</span>
                  <input
                    name="firstName"
                    required
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 text-[15px] text-stone-900 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-stone-600 mb-1 block">Last Name</span>
                  <input
                    name="lastName"
                    required
                    className="w-full rounded-xl border border-stone-200 px-4 py-3 text-[15px] text-stone-900 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm text-stone-600 mb-1 block">Relationship</span>
                <select
                  name="relationship"
                  required
                  defaultValue=""
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 text-[15px] text-stone-900 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400 bg-white"
                >
                  <option value="" disabled>Select...</option>
                  {RELATIONSHIPS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm text-stone-600 mb-1 block">Date of Birth</span>
                <input
                  name="dateOfBirth"
                  type="date"
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 text-[15px] text-stone-900 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400"
                />
              </label>

              <label className="block">
                <span className="text-sm text-stone-600 mb-1 block">Email</span>
                <input
                  name="email"
                  type="email"
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 text-[15px] text-stone-900 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400"
                />
              </label>

              <label className="block">
                <span className="text-sm text-stone-600 mb-1 block">Phone</span>
                <input
                  name="phone"
                  type="tel"
                  className="w-full rounded-xl border border-stone-200 px-4 py-3 text-[15px] text-stone-900 outline-none focus:border-stone-400 focus:ring-1 focus:ring-stone-400"
                />
              </label>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-stone-900 text-white font-semibold text-sm disabled:opacity-50"
              >
                {saving ? 'Adding...' : 'Add Dependent'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
