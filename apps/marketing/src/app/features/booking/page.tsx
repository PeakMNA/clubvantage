import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import {
  CalendarDays,
  Clock,
  Users,
  Repeat,
  Bell,
  LayoutGrid,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const StatusBadge = () => (
  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium ml-3">
    <CheckCircle2 className="h-4 w-4" />
    Built
  </span>
);

const features = [
  {
    icon: LayoutGrid,
    title: 'Visual Calendar',
    description: 'Intuitive drag-and-drop calendar with day, week, and month views for all facilities.',
  },
  {
    icon: Clock,
    title: 'Real-Time Availability',
    description: 'Live availability updates across all booking channels - web, mobile, and front desk.',
  },
  {
    icon: Users,
    title: 'Resource Management',
    description: 'Manage rooms, courts, equipment, and staff assignments in one unified system.',
  },
  {
    icon: Repeat,
    title: 'Recurring Bookings',
    description: 'Set up recurring reservations for leagues, lessons, and regular member activities.',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    description: 'Automated confirmations, reminders, and waitlist notifications for members.',
  },
  {
    icon: CalendarDays,
    title: 'Booking Rules',
    description: 'Configurable booking windows, cancellation policies, and member priority access.',
  },
];

const useCases = [
  {
    title: 'Tennis & Racquet Courts',
    description: 'Court reservations with lighting fees, lesson scheduling, and tournament blocks.',
  },
  {
    title: 'Dining Reservations',
    description: 'Table management, party size handling, and special event bookings.',
  },
  {
    title: 'Spa & Wellness',
    description: 'Treatment rooms, therapist scheduling, and package appointments.',
  },
  {
    title: 'Event Spaces',
    description: 'Private rooms, banquet halls, and outdoor venues with catering coordination.',
  },
];

export default function BookingFeaturePage() {
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
                  <CalendarDays className="h-6 w-6 text-accent-400" />
                </div>
                <StatusBadge />
              </div>
              <span className="text-label uppercase tracking-widest text-accent-400">
                Facility Booking
              </span>
              <h1 className="mt-4 font-serif text-h1 text-cream-50">
                Smart Facility Scheduling
              </h1>
              <p className="mt-6 text-body-lg text-cream-100">
                Real-time availability and seamless booking for all your facilities.
                From courts to dining rooms, manage every reservation in one place.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild variant="accent">
                  <Link href="/waitlist">
                    Join Waitlist
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="border-cream-50/30 text-cream-50 hover:bg-cream-50/10">
                  <Link href="/waitlist">Join for Founder Pricing</Link>
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
                Powerful Booking Capabilities
              </h2>
              <p className="mt-4 text-body-lg text-charcoal-500 max-w-2xl mx-auto">
                Everything you need to manage facility reservations efficiently.
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
                  Every Facility, One System
                </h2>
                <p className="mt-4 text-body-lg text-charcoal-500">
                  Whether it&apos;s a tennis court or a private dining room,
                  manage all your facilities with consistent booking experiences.
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
                  <CalendarDays className="h-32 w-32 text-primary-300" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary-700 py-16">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-h2 text-cream-50">
                Ready to Optimize Your Bookings?
              </h2>
              <p className="mt-4 text-body-lg text-cream-100">
                See how ClubVantage can streamline your facility management.
              </p>
              <div className="mt-8">
                <Button asChild variant="accent">
                  <Link href="/waitlist">Join Waitlist</Link>
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
