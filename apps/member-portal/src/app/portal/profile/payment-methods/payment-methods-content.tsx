'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  CreditCard,
  Plus,
  ShieldCheck,
  Phone,
  Trash2,
  Star,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@clubvantage/ui'

interface PaymentMethodCard {
  id: string
  brand: string
  last4: string
  expiryMonth: number
  expiryYear: number
  isDefault: boolean
}

const brandIcons: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'Amex',
  discover: 'Discover',
  jcb: 'JCB',
}

function isExpiringSoon(month: number, year: number): boolean {
  const now = new Date()
  const expiry = new Date(year, month) // month is 1-indexed from Stripe, but Date is 0-indexed, so this is actually the first day after expiry
  const thirtyDays = 30 * 24 * 60 * 60 * 1000
  return expiry.getTime() - now.getTime() < thirtyDays
}

export function PaymentMethodsContent() {
  const router = useRouter()
  const [methods, setMethods] = useState<PaymentMethodCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null)
  const [hasOnlinePayments, setHasOnlinePayments] = useState(false)

  const fetchMethods = useCallback(async () => {
    try {
      const res = await fetch('/api/payments/methods')
      if (res.ok) {
        const data = await res.json()
        setMethods(data.methods)
        setHasOnlinePayments(true)
      }
    } catch {
      // Stripe not configured — show fallback UI
      setHasOnlinePayments(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchMethods() }, [fetchMethods])

  const handleRemove = useCallback(async (methodId: string) => {
    setRemovingId(methodId)
    try {
      await fetch('/api/payments/methods', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ methodId }),
      })
      setMethods((prev) => prev.filter((m) => m.id !== methodId))
    } finally {
      setRemovingId(null)
    }
  }, [])

  const handleSetDefault = useCallback(async (methodId: string) => {
    setSettingDefaultId(methodId)
    try {
      await fetch('/api/payments/methods', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ methodId }),
      })
      setMethods((prev) =>
        prev.map((m) => ({ ...m, isDefault: m.id === methodId }))
      )
    } finally {
      setSettingDefaultId(null)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-stone-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-stone-950/95 backdrop-blur-sm border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center justify-between px-5 py-3 pt-safe">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-50 dark:hover:bg-stone-800 -ml-1"
          >
            <ArrowLeft className="h-5 w-5 text-stone-700 dark:text-stone-300" />
          </button>
          <h1 className="text-base font-semibold text-stone-900 dark:text-stone-100">Payment Methods</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-5 py-6 pb-36">
        {/* Intro */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-900 dark:bg-stone-800 flex-shrink-0">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">Payment Methods</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">Manage your saved payment options</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-stone-400 dark:text-stone-500" />
          </div>
        ) : hasOnlinePayments && methods.length > 0 ? (
          <>
            {/* Saved Cards */}
            <section className="mb-8">
              <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-4">
                Saved Cards
              </p>
              <div className="space-y-3">
                {methods.map((method) => {
                  const expiring = isExpiringSoon(method.expiryMonth, method.expiryYear)
                  return (
                    <div
                      key={method.id}
                      className={cn(
                        'rounded-xl border p-4',
                        method.isDefault
                          ? 'border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/10'
                          : 'border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 flex-shrink-0">
                          <CreditCard className="h-5 w-5 text-stone-600 dark:text-stone-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[15px] font-medium text-stone-900 dark:text-stone-100 capitalize">
                              {brandIcons[method.brand] ?? method.brand} •••• {method.last4}
                            </p>
                            {method.isDefault && (
                              <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20 px-1.5 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                              Expires {method.expiryMonth}/{method.expiryYear}
                            </p>
                            {expiring && (
                              <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                                <AlertTriangle className="h-3 w-3" />
                                Expiring soon
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 pl-13">
                        {!method.isDefault && (
                          <button
                            onClick={() => handleSetDefault(method.id)}
                            disabled={settingDefaultId === method.id}
                            className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 active:bg-stone-50 dark:active:bg-stone-800 transition-colors"
                          >
                            {settingDefaultId === method.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Star className="h-3 w-3" />
                            )}
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleRemove(method.id)}
                          disabled={removingId === method.id}
                          className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-500/30 active:bg-red-50 dark:active:bg-red-500/10 transition-colors"
                        >
                          {removingId === method.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                          Remove
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Add New Card */}
            <Link
              href="/portal/pay"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-stone-200 dark:border-stone-700 text-sm font-medium text-stone-600 dark:text-stone-400 active:bg-stone-50 dark:active:bg-stone-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add New Card
            </Link>
          </>
        ) : !hasOnlinePayments ? (
          <>
            {/* Coming Soon */}
            <div className="rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 p-4 mb-6">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-300">Online Payments Coming Soon</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                    We&apos;re working on adding secure online payment options including credit cards, PromptPay, and bank transfers.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* No cards saved yet */
          <div className="text-center py-12 mb-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-50 dark:bg-stone-800 mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-stone-300 dark:text-stone-600" />
            </div>
            <p className="text-[15px] font-medium text-stone-900 dark:text-stone-100 mb-1">No payment methods saved</p>
            <p className="text-sm text-stone-500 dark:text-stone-400 max-w-xs mx-auto mb-6">
              Add a card to make payments faster.
            </p>
            <Link
              href="/portal/pay"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-sm font-semibold text-white active:bg-amber-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Card
            </Link>
          </div>
        )}

        {/* Current Payment Options */}
        <section className="mt-8">
          <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-4">
            Other Payment Options
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-stone-50 dark:bg-stone-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-stone-900 flex-shrink-0">
                <CreditCard className="h-5 w-5 text-stone-500 dark:text-stone-400" />
              </div>
              <div>
                <p className="text-[15px] font-medium text-stone-900 dark:text-stone-100">On Account</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Charges are added to your member account and included in your monthly statement.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-stone-50 dark:bg-stone-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-stone-900 flex-shrink-0">
                <Phone className="h-5 w-5 text-stone-500 dark:text-stone-400" />
              </div>
              <div>
                <p className="text-[15px] font-medium text-stone-900 dark:text-stone-100">Contact Club</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  For balance payments, contact the Membership Office at extension 100 or visit the front desk.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
