'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@clubvantage/ui'
import {
  ArrowLeft,
  ChevronDown,
  HelpCircle,
  Calendar,
  CreditCard,
  Flag,
  User,
  MessageSquare,
} from 'lucide-react'

interface FaqItem {
  question: string
  answer: string
}

interface FaqSection {
  title: string
  icon: React.ElementType
  items: FaqItem[]
}

const FAQ_SECTIONS: FaqSection[] = [
  {
    title: 'Bookings & Reservations',
    icon: Calendar,
    items: [
      {
        question: 'How far in advance can I book a facility?',
        answer: 'Members can book facilities up to 14 days in advance. Golf tee times can be booked up to 7 days in advance for members and 3 days for guests.',
      },
      {
        question: 'How do I cancel a booking?',
        answer: 'Go to your booking detail page and tap "Cancel". Free cancellation is available up to 24 hours before your reservation. Late cancellations may incur a 50% fee.',
      },
      {
        question: 'Can I bring guests?',
        answer: 'Yes, members can bring guests to most facilities. Guest fees apply and vary by facility. Add guests when making your booking or contact the front desk.',
      },
    ],
  },
  {
    title: 'Golf',
    icon: Flag,
    items: [
      {
        question: 'How do I book a tee time?',
        answer: 'Go to Golf > Book Tee Time, select your date, choose an available time slot, add players, and confirm your booking.',
      },
      {
        question: 'Can I request a caddy?',
        answer: 'Yes, caddy requests can be made during the booking process. Select your preferred caddy type (individual or shared) when booking your tee time.',
      },
      {
        question: 'What is the cancellation policy for tee times?',
        answer: 'Tee times can be cancelled free of charge up to 24 hours before the scheduled time. Cancellations within 24 hours may be subject to a fee.',
      },
    ],
  },
  {
    title: 'Billing & Payments',
    icon: CreditCard,
    items: [
      {
        question: 'When are statements generated?',
        answer: 'Monthly statements are generated on the 1st of each month covering the previous month\'s charges. You\'ll receive a notification when your statement is ready.',
      },
      {
        question: 'How do I pay my balance?',
        answer: 'Go to Statements, view your current balance, and tap "Pay Now". You can pay by credit card, bank transfer, or at the front desk.',
      },
      {
        question: 'What happens if my payment is overdue?',
        answer: 'Payments overdue by more than 30 days may incur late fees. Accounts overdue by 90+ days may have certain privileges suspended until the balance is settled.',
      },
    ],
  },
  {
    title: 'Account & Profile',
    icon: User,
    items: [
      {
        question: 'How do I update my personal information?',
        answer: 'Go to Profile > Personal Information to update your name, email, phone number, and other details.',
      },
      {
        question: 'How do I change my password?',
        answer: 'Go to Profile > Privacy & Security to change your password. You\'ll need to enter your current password first.',
      },
      {
        question: 'How do I manage my dependents?',
        answer: 'Go to Profile > Dependents to view, add, or manage dependent members linked to your account.',
      },
    ],
  },
]

function FaqAccordion({ item }: { item: FaqItem }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="w-full text-left py-4 border-b border-stone-50 last:border-0"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[15px] font-medium text-stone-900">{item.question}</p>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-stone-400 flex-shrink-0 transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </div>
      {isOpen && (
        <p className="text-sm text-stone-500 leading-relaxed mt-2 pr-8">
          {item.answer}
        </p>
      )}
    </button>
  )
}

export default function HelpPage() {
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
          <h1 className="text-base font-semibold text-stone-900">Help & FAQ</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-5 py-6 pb-36">
        {/* Intro */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-900 flex-shrink-0">
            <HelpCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900">How can we help?</h2>
            <p className="text-sm text-stone-500">Find answers to common questions below</p>
          </div>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {FAQ_SECTIONS.map((section) => {
            const Icon = section.icon
            return (
              <section key={section.title}>
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-stone-500" />
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    {section.title}
                  </p>
                </div>
                <div>
                  {section.items.map((item) => (
                    <FaqAccordion key={item.question} item={item} />
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-8 rounded-xl bg-stone-50 p-5 text-center">
          <MessageSquare className="h-8 w-8 text-stone-400 mx-auto mb-2" />
          <p className="text-[15px] font-semibold text-stone-900">Still need help?</p>
          <p className="text-sm text-stone-500 mt-1">
            Our team is here to assist you
          </p>
          <Link
            href="/portal/contact"
            className="inline-block mt-3 px-6 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold"
          >
            Contact Club
          </Link>
        </div>
      </div>
    </div>
  )
}
