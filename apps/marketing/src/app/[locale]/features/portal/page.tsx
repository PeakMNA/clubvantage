'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import {
  Smartphone,
  Calendar,
  CreditCard,
  Bell,
  Users,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

const StatusBadge = () => (
  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium ml-3">
    <Clock className="h-4 w-4" />
    Coming Q3 2026
  </span>
);

const features = [
  {
    icon: Calendar,
    title: 'Easy Booking',
    description: 'Book tee times, courts, dining, and events from anywhere with real-time availability.',
  },
  {
    icon: CreditCard,
    title: 'Account Management',
    description: 'View statements, make payments, and manage billing preferences online.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Personalized alerts for bookings, events, and club updates via push and email.',
  },
  {
    icon: Users,
    title: 'Family Access',
    description: 'Manage dependent profiles, book for family members, and track usage.',
  },
  {
    icon: MessageSquare,
    title: 'Direct Messaging',
    description: 'Communicate with club staff, request services, and provide feedback.',
  },
  {
    icon: Smartphone,
    title: 'Digital Member Card',
    description: 'Mobile member ID for check-in, charging, and access control.',
  },
];

const useCases = [
  {
    title: 'Book a Tee Time',
    description: 'See availability, invite guests, request caddies and carts - all in seconds.',
  },
  {
    title: 'Pay Your Statement',
    description: 'Review charges, dispute items, and pay with saved payment methods.',
  },
  {
    title: 'RSVP to Events',
    description: 'Browse upcoming events, register your party, and manage dietary preferences.',
  },
  {
    title: 'Update Your Profile',
    description: 'Keep contact info current, manage communication preferences, and upload photos.',
  },
];

export default function PortalFeaturePage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="bg-primary-800 py-16 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-400/20">
                  <Smartphone className="h-6 w-6 text-accent-400" />
                </div>
                <StatusBadge />
              </div>
              <span className="text-label uppercase tracking-widest text-accent-400">
                Member Portal
              </span>
              <h1 className="mt-4 font-serif text-h1 text-cream-50">
                Mobile-First Member Experience
              </h1>
              <p className="mt-6 text-body-lg text-cream-100">
                Give your members the modern, self-service experience they expect.
                Book, pay, and connect from any device, anywhere.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild variant="accent">
                  <Link href="/waitlist">
                    Join Waitlist
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="border-cream-50/30 text-cream-50 hover:bg-cream-50/10">
                  <Link href="/roadmap">View Roadmap</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 md:py-24 bg-cream-100">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="font-serif text-h2 text-charcoal-800">
                Everything Members Need
              </h2>
              <p className="mt-4 text-body-lg text-charcoal-500 max-w-2xl mx-auto">
                A beautiful, intuitive interface that makes club life easier.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group p-6 bg-white rounded-2xl border border-cream-300 hover:border-primary-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 group-hover:bg-primary-500 transition-colors duration-300">
                      <Icon className="h-6 w-6 text-primary-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-charcoal-800">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-charcoal-500">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <span className="text-label uppercase tracking-widest text-accent-500">
                  Use Cases
                </span>
                <h2 className="mt-4 font-serif text-h2 text-charcoal-800">
                  Self-Service Made Simple
                </h2>
                <p className="mt-4 text-body-lg text-charcoal-500">
                  Reduce front desk calls while giving members the convenience
                  they want with 24/7 self-service access.
                </p>
                <ul className="mt-8 space-y-6">
                  {useCases.map((useCase) => (
                    <li key={useCase.title} className="flex items-start gap-4">
                      <CheckCircle2 className="h-6 w-6 text-primary-500 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-charcoal-800">{useCase.title}</h3>
                        <p className="text-charcoal-500">{useCase.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                  <Smartphone className="h-32 w-32 text-primary-300" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Coming Soon Notice */}
        <section className="py-12 bg-accent-50 border-y border-accent-200">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100">
                  <Sparkles className="h-6 w-6 text-accent-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-800">Coming Q3 2026</h3>
                  <p className="text-charcoal-500">Join the waitlist to be first in line for Member Portal.</p>
                </div>
              </div>
              <Button asChild>
                <Link href="/waitlist">
                  Join Waitlist
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-charcoal-800 py-16">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-h2 text-cream-50">
                Ready to Delight Your Members?
              </h2>
              <p className="mt-4 text-body-lg text-cream-200">
                See how ClubVantage Member Portal can transform the member experience.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild variant="accent">
                  <Link href="/waitlist">Join Waitlist</Link>
                </Button>
                <Button asChild variant="secondary" className="border-cream-100/30 text-cream-100 hover:bg-cream-100/10">
                  <Link href="/contact">Talk to Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
