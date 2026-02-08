'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  CreditCard,
  Plus,
  ShieldCheck,
  Phone,
} from 'lucide-react'

export function PaymentMethodsContent() {
  const router = useRouter()

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
          <h1 className="text-base font-semibold text-stone-900">Payment Methods</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-5 py-6 pb-36">
        {/* Intro */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-900 flex-shrink-0">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Payment Methods</h2>
            <p className="text-sm text-stone-500">Manage your saved payment options</p>
          </div>
        </div>

        {/* Empty State */}
        <div className="text-center py-12 mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-50 mx-auto mb-4">
            <CreditCard className="h-8 w-8 text-stone-300" />
          </div>
          <p className="text-[15px] font-medium text-stone-900 mb-1">No payment methods saved</p>
          <p className="text-sm text-stone-500 max-w-xs mx-auto">
            Payment methods will be available once online payments are enabled for your club.
          </p>
        </div>

        {/* Coming Soon */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">Online Payments Coming Soon</p>
              <p className="text-xs text-amber-700 mt-1">
                We&apos;re working on adding secure online payment options including credit cards, PromptPay, and bank transfers. You&apos;ll be able to pay your balance directly from the portal.
              </p>
            </div>
          </div>
        </div>

        {/* Current Payment Options */}
        <section>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-4">
            Current Payment Options
          </p>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-xl bg-stone-50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white flex-shrink-0">
                <CreditCard className="h-5 w-5 text-stone-500" />
              </div>
              <div>
                <p className="text-[15px] font-medium text-stone-900">On Account</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  Charges are added to your member account and included in your monthly statement.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl bg-stone-50">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white flex-shrink-0">
                <Phone className="h-5 w-5 text-stone-500" />
              </div>
              <div>
                <p className="text-[15px] font-medium text-stone-900">Contact Club</p>
                <p className="text-xs text-stone-500 mt-0.5">
                  For balance payments, contact the Membership Office at extension 100 or visit the front desk.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <div className="mt-8">
          <Link
            href="/portal/contact"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-stone-200 text-sm font-medium text-stone-700"
          >
            <Phone className="h-4 w-4" />
            Contact Membership Office
          </Link>
        </div>
      </div>
    </div>
  )
}
