import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import {
  Trophy,
  Users,
  Car,
  ClipboardList,
  Timer,
  BarChart3,
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
    icon: Timer,
    title: 'Smart Tee Sheet',
    description: 'Visual tee time management with drag-and-drop, group optimization, and pace-of-play tracking.',
  },
  {
    icon: Users,
    title: 'Caddie Management',
    description: 'Caddie scheduling, assignment, and performance tracking with member preferences.',
  },
  {
    icon: Car,
    title: 'Cart Fleet',
    description: 'Real-time cart availability, GPS tracking, maintenance schedules, and automatic charging.',
  },
  {
    icon: Trophy,
    title: 'Tournament System',
    description: 'Full tournament management from registration to scoring with live leaderboards.',
  },
  {
    icon: ClipboardList,
    title: 'Check-in & Starter',
    description: 'Quick member check-in, group management, and starter sheet integration.',
  },
  {
    icon: BarChart3,
    title: 'Golf Analytics',
    description: 'Utilization reports, pace of play analysis, and revenue per round metrics.',
  },
];

const useCases = [
  {
    title: 'Daily Operations',
    description: 'Manage walk-ups, member reservations, and guest play with real-time availability.',
  },
  {
    title: 'Tournament Days',
    description: 'Shotgun starts, handicap management, and automatic scoring and payouts.',
  },
  {
    title: 'Lesson Programs',
    description: 'Pro scheduling, lesson packages, and student progress tracking.',
  },
  {
    title: 'Member Events',
    description: 'Club championships, member-guest events, and social golf outings.',
  },
];

export default function GolfFeaturePage() {
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
                  <Trophy className="h-6 w-6 text-accent-400" />
                </div>
                <StatusBadge />
              </div>
              <span className="text-label uppercase tracking-widest text-accent-400">
                Golf Operations
              </span>
              <h1 className="mt-4 font-serif text-h1 text-cream-50">
                Purpose-Built Golf Management
              </h1>
              <p className="mt-6 text-body-lg text-cream-100">
                The most comprehensive golf operations platform. Tee sheet, caddies,
                carts, and tournaments - all designed for the way clubs actually work.
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
                Complete Golf Operations Suite
              </h2>
              <p className="mt-4 text-body-lg text-charcoal-500 max-w-2xl mx-auto">
                Built by club professionals who understand the nuances of golf operations.
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
                  For Every Golf Scenario
                </h2>
                <p className="mt-4 text-body-lg text-charcoal-500">
                  From a quiet Tuesday morning to your biggest member-guest event,
                  ClubVantage handles it all with ease.
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
                  <Trophy className="h-32 w-32 text-primary-300" />
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
                Ready to Elevate Your Golf Operations?
              </h2>
              <p className="mt-4 text-body-lg text-cream-100">
                See why leading clubs choose ClubVantage for their golf management.
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
