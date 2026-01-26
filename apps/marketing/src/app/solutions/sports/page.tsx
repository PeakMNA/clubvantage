'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft,
  Calendar,
  Users,
  CreditCard,
  BarChart3,
  MessageSquare,
  Trophy,
  Clock,
  Smartphone,
  CheckCircle2,
  MapPin,
  Layers,
  Award,
  Ticket,
} from 'lucide-react';

const modules = [
  {
    name: 'Multi-Facility Booking',
    icon: MapPin,
    description: 'Unified booking across all your sports facilities.',
    features: [
      'Tennis, squash, badminton courts',
      'Swimming pool lane booking',
      'Multi-purpose halls',
      'Outdoor field reservations',
      'Basketball and volleyball courts',
      'Real-time availability view',
      'Recurring bookings',
      'Prime time management',
      'Booking rules by membership',
      'Resource conflict prevention',
    ],
  },
  {
    name: 'League & Competition Management',
    icon: Trophy,
    description: 'Organize and run leagues, tournaments, and competitions.',
    features: [
      'League creation and scheduling',
      'Round-robin and knockout formats',
      'Team and individual competitions',
      'Automated fixture generation',
      'Live scoring integration',
      'Standings and leaderboards',
      'Player statistics tracking',
      'Championship brackets',
      'Historic records and archives',
      'Trophy and awards management',
    ],
  },
  {
    name: 'Event Coordination',
    icon: Ticket,
    description: 'Plan and execute club events seamlessly.',
    features: [
      'Event calendar management',
      'Registration and ticketing',
      'Capacity management',
      'Venue allocation',
      'Catering coordination',
      'Volunteer scheduling',
      'Event budget tracking',
      'Post-event feedback',
      'Photo gallery integration',
      'Social media promotion',
    ],
  },
  {
    name: 'Equipment & Rental',
    icon: Layers,
    description: 'Manage equipment inventory and rentals.',
    features: [
      'Equipment inventory tracking',
      'Rental reservation system',
      'Check-out/check-in workflow',
      'Pricing by duration/membership',
      'Equipment maintenance logs',
      'Damage and loss tracking',
      'Automated availability',
      'Deposit management',
      'Purchase integration',
      'Equipment location tracking',
    ],
  },
  {
    name: 'Coaching & Programs',
    icon: Award,
    description: 'Manage coaching staff and training programs.',
    features: [
      'Coach profiles and specializations',
      'Lesson booking system',
      'Group program management',
      'Youth academy programs',
      'Skill level progression',
      'Session packages',
      'Coach availability',
      'Performance assessments',
      'Certification tracking',
      'Coach-student matching',
    ],
  },
  {
    name: 'Member Management',
    icon: Users,
    description: 'Comprehensive member and family management.',
    features: [
      'Multi-sport memberships',
      'Family account management',
      'Junior programs enrollment',
      'Guest pass management',
      'Membership categories',
      'Sports-specific access rights',
      'Member skill tracking',
      'Playing history',
      'Preferences and interests',
      'Emergency contacts',
    ],
  },
  {
    name: 'Billing & Payments',
    icon: CreditCard,
    description: 'Flexible billing for diverse revenue streams.',
    features: [
      'Membership dues billing',
      'Court/facility fees',
      'Lesson and program payments',
      'Equipment rental charges',
      'Event registration fees',
      'Pro shop sales',
      'F&B integration',
      'Package and bundle pricing',
      'Online payment portal',
      'Statement generation',
    ],
  },
  {
    name: 'Scheduling & Calendar',
    icon: Calendar,
    description: 'Master calendar for all club activities.',
    features: [
      'Unified facility calendar',
      'League game scheduling',
      'Event planning calendar',
      'Maintenance windows',
      'Staff scheduling',
      'Program schedules',
      'Holiday management',
      'Calendar subscriptions',
      'Conflict detection',
      'Resource optimization',
    ],
  },
  {
    name: 'Member Portal & App',
    icon: Smartphone,
    description: 'Self-service access for members.',
    features: [
      'Court and facility booking',
      'League registration',
      'Event sign-ups',
      'Equipment reservations',
      'Account management',
      'Match results entry',
      'Standings and stats view',
      'Club communications',
      'Digital member card',
      'Push notifications',
    ],
  },
  {
    name: 'Reporting & Analytics',
    icon: BarChart3,
    description: 'Insights across all club operations.',
    features: [
      'Facility utilization reports',
      'Revenue by sport/facility',
      'Member activity analysis',
      'Program enrollment trends',
      'Peak usage patterns',
      'Coach performance metrics',
      'Equipment usage reports',
      'Event attendance analytics',
      'Custom dashboards',
      'Scheduled reporting',
    ],
  },
];

const highlights = [
  {
    stat: '30%',
    label: 'Higher utilization',
    description: 'Optimized facility booking',
  },
  {
    stat: '45%',
    label: 'More participation',
    description: 'Easy league registration',
  },
  {
    stat: '55%',
    label: 'Less scheduling conflicts',
    description: 'Smart calendar management',
  },
];

export default function SportsSolutionPage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

          <div className="container relative">
            <Link
              href="/solutions"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Solutions
            </Link>

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm border border-white/10 mb-6">
                <Trophy className="h-4 w-4" />
                Sports & Recreation Clubs
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Multi-Sport Facility Management Made Simple
              </h1>

              <p className="mt-6 text-xl text-neutral-300">
                Manage courts, leagues, events, and equipment across all your sports facilities
                with one unified platform designed for multi-sport clubs.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg">
                  <Link href="/waitlist">Join the Waitlist</Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  <Link href="/roadmap">View Roadmap</Link>
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl">
              {highlights.map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-3xl font-bold text-white">{item.stat}</div>
                  <div className="mt-1 text-sm font-medium text-blue-400">{item.label}</div>
                  <div className="mt-1 text-xs text-neutral-400">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Modules Grid */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-neutral-900">
                Complete Sports Club Management
              </h2>
              <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
                10 integrated modules to manage every sport and facility in your club.
              </p>
            </div>

            <div className="space-y-8">
              {modules.map((module, index) => {
                const Icon = module.icon;
                return (
                  <Card key={module.name} padding="lg" className="overflow-hidden">
                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Module Header */}
                      <div className="lg:w-1/3">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                            <Icon className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <span className="text-xs font-medium text-neutral-500">Module {index + 1}</span>
                            <h3 className="text-xl font-semibold text-neutral-900">{module.name}</h3>
                          </div>
                        </div>
                        <p className="text-neutral-600">{module.description}</p>
                      </div>

                      {/* Features List */}
                      <div className="lg:w-2/3 lg:border-l lg:border-neutral-200 lg:pl-8">
                        <h4 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                          Key Features
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {module.features.map((feature) => (
                            <div key={feature} className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                              <span className="text-sm text-neutral-700">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-neutral-50">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-neutral-900">
                Ready to Unify Your Sports Club Management?
              </h2>
              <p className="mt-4 text-lg text-neutral-600">
                Join our founding member program and help shape the future of sports club management.
                Get early access, influence our roadmap, and lock in lifetime pricing.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/waitlist">Join the Waitlist</Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/contact">Contact Us</Link>
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
