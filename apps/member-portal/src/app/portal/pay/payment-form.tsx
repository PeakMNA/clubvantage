'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@clubvantage/ui'
import { ArrowLeft, Loader2, CreditCard, Lock } from 'lucide-react'
import Link from 'next/link'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { getStripe } from '@/lib/stripe/client'

const stripePromise = getStripe()

interface PaymentFormProps {
  outstandingBalance: number
  defaultAmount: number
}

function CheckoutForm({ amount }: { amount: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    setError(null)

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/portal/pay/success`,
      },
    })

    if (submitError) {
      setError(submitError.message ?? 'Payment failed. Please try again.')
      setIsProcessing(false)
    }
  }, [stripe, elements, router])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-500/20 p-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={cn(
          'w-full rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition-colors',
          isProcessing
            ? 'bg-stone-400 dark:bg-stone-600 cursor-not-allowed'
            : 'bg-amber-600 active:bg-amber-700'
        )}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </span>
        ) : (
          `Pay ฿${amount.toLocaleString()}`
        )}
      </button>

      <div className="flex items-center justify-center gap-1.5 text-xs text-stone-400 dark:text-stone-500">
        <Lock className="h-3 w-3" />
        <span>Secured by Stripe</span>
      </div>
    </form>
  )
}

export function PaymentForm({ outstandingBalance, defaultAmount }: PaymentFormProps) {
  const [amount, setAmount] = useState(defaultAmount)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleProceed = useCallback(async () => {
    if (amount <= 0) return
    setIsCreating(true)

    try {
      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })

      const data = await res.json()
      if (data.clientSecret) {
        setClientSecret(data.clientSecret)
      }
    } catch {
      // Error handled silently — user can retry
    } finally {
      setIsCreating(false)
    }
  }, [amount])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/portal/statements"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 active:bg-stone-200 dark:active:bg-stone-700 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-stone-600 dark:text-stone-400" />
        </Link>
        <h1 className="text-[22px] font-semibold text-stone-900 dark:text-stone-100">Make Payment</h1>
      </div>

      {/* Balance Summary */}
      <div className="rounded-xl border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 p-4">
        <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">Outstanding Balance</p>
        <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
          ฿{outstandingBalance.toLocaleString()}
        </p>
      </div>

      {!clientSecret ? (
        <>
          {/* Amount Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Payment Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium text-stone-500 dark:text-stone-400">
                ฿
              </span>
              <input
                type="number"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={1}
                max={outstandingBalance}
                step={0.01}
                className="w-full rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 py-3.5 pl-8 pr-4 text-lg font-semibold text-stone-900 dark:text-stone-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <p className="text-xs text-stone-400 dark:text-stone-500">
              You can make a partial payment or pay the full balance.
            </p>
          </div>

          {/* Quick Amount Buttons */}
          {outstandingBalance > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAmount(outstandingBalance)}
                className={cn(
                  'flex-1 rounded-lg py-2.5 text-sm font-medium border transition-colors',
                  amount === outstandingBalance
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                    : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 active:bg-stone-50 dark:active:bg-stone-800'
                )}
              >
                Full Balance
              </button>
              {outstandingBalance > 1000 && (
                <button
                  type="button"
                  onClick={() => setAmount(Math.round(outstandingBalance / 2))}
                  className={cn(
                    'flex-1 rounded-lg py-2.5 text-sm font-medium border transition-colors',
                    amount === Math.round(outstandingBalance / 2)
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400'
                      : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 active:bg-stone-50 dark:active:bg-stone-800'
                  )}
                >
                  Half
                </button>
              )}
            </div>
          )}

          {/* Proceed Button */}
          <button
            type="button"
            onClick={handleProceed}
            disabled={amount <= 0 || isCreating}
            className={cn(
              'w-full rounded-xl px-5 py-3.5 text-sm font-semibold text-white transition-colors',
              amount <= 0 || isCreating
                ? 'bg-stone-300 dark:bg-stone-600 cursor-not-allowed'
                : 'bg-amber-600 active:bg-amber-700'
            )}
          >
            {isCreating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Preparing payment...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CreditCard className="h-4 w-4" />
                Continue to Payment
              </span>
            )}
          </button>
        </>
      ) : stripePromise ? (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#d97706',
                borderRadius: '12px',
              },
            },
          }}
        >
          <CheckoutForm amount={amount} />
        </Elements>
      ) : (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-500/20 p-4 text-sm text-amber-700 dark:text-amber-400">
          Online payments are not configured. Please contact the club office.
        </div>
      )}
    </div>
  )
}
