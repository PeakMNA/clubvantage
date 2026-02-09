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
  Dumbbell,
  Heart,
  Clock,
  Smartphone,
  CheckCircle2,
  UserCheck,
  Target,
  Activity,
} from 'lucide-react';

const modules = [
  {
    name: 'Class Scheduling',
    icon: Calendar,
    description: 'Flexible class management for all fitness programs.',
    features: [
      'Visual weekly schedule builder',
      'Recurring class templates',
      'Multi-room/studio support',
      'Capacity limits per class',
      'Waitlist with auto-enrollment',
      'Class cancellation policies',
      'Substitute instructor assignment',
      'Member booking windows',
      'Late cancellation tracking',
      'Virtual class integration',
    ],
  },
  {
    name: 'Trainer & Staff Management',
    icon: UserCheck,
    description: 'Coordinate your fitness team efficiently.',
    features: [
      'Instructor profiles and specializations',
      'Availability scheduling',
      'Personal training session booking',
      'Commission and payout tracking',
      'Certification management',
      'Performance metrics',
      'Client assignment tracking',
      'Training program templates',
      'Staff communication tools',
      'Time-off management',
    ],
  },
  {
    name: 'Personal Training',
    icon: Target,
    description: 'Manage one-on-one and small group training.',
    features: [
      'Session package management',
      'Trainer-client matching',
      'Progress tracking tools',
      'Workout plan creation',
      'Session notes and history',
      'Package expiration alerts',
      'Automated session reminders',
      'Trainer availability sync',
      'Revenue per trainer reports',
      'Client goal tracking',
    ],
  },
  {
    name: 'Equipment & Space Booking',
    icon: Dumbbell,
    description: 'Manage equipment and facility reservations.',
    features: [
      'Equipment reservation system',
      'Time slot management',
      'Court/studio booking',
      'Pool lane reservations',
      'Equipment maintenance tracking',
      'Usage analytics',
      'Peak time management',
      'Cleaning schedule integration',
      'Equipment check-out/in',
      'Locker assignments',
    ],
  },
  {
    name: 'Member Management',
    icon: Users,
    description: 'Complete member lifecycle management.',
    features: [
      'Online membership signup',
      'Multiple membership tiers',
      'Family and corporate plans',
      'Access control integration',
      'Check-in/check-out tracking',
      'Visit history and patterns',
      'Member preferences',
      'Health questionnaires',
      'Emergency contacts',
      'Photo ID management',
    ],
  },
  {
    name: 'Billing & Payments',
    icon: CreditCard,
    description: 'Automated billing and revenue management.',
    features: [
      'Recurring membership billing',
      'Session package purchases',
      'Pro-rated billing',
      'Failed payment handling',
      'Online payment portal',
      'Retail and merchandise sales',
      'Gift cards and credits',
      'Promotional pricing',
      'Freeze and hold management',
      'Revenue recognition',
    ],
  },
  {
    name: 'Attendance & Check-in',
    icon: Clock,
    description: 'Track member visits and class attendance.',
    features: [
      'Self-service kiosk check-in',
      'Mobile app check-in',
      'QR code scanning',
      'Class attendance tracking',
      'No-show management',
      'Visit frequency reports',
      'Peak hour analysis',
      'Member engagement alerts',
      'Access control integration',
      'Guest check-in handling',
    ],
  },
  {
    name: 'Health & Wellness Tracking',
    icon: Heart,
    description: 'Support member health journeys.',
    features: [
      'Fitness assessment tools',
      'Body composition tracking',
      'Goal setting and progress',
      'Workout logging',
      'Wearable device integration',
      'Health metric dashboards',
      'Progress photo storage',
      'Milestone celebrations',
      'Wellness challenges',
      'Nutrition tracking integration',
    ],
  },
  {
    name: 'Member Portal & App',
    icon: Smartphone,
    description: 'Self-service for members on any device.',
    features: [
      'Class booking and cancellation',
      'Trainer session scheduling',
      'Account and billing management',
      'Workout history view',
      'Progress tracking',
      'Club announcements',
      'Digital membership card',
      'Facility availability',
      'Social features',
      'Push notifications',
    ],
  },
  {
    name: 'Reporting & Analytics',
    icon: BarChart3,
    description: 'Data-driven insights for growth.',
    features: [
      'Membership growth trends',
      'Class utilization reports',
      'Revenue analytics',
      'Member retention metrics',
      'Trainer performance',
      'Peak usage patterns',
      'Churn prediction',
      'Marketing ROI tracking',
      'Custom report builder',
      'Automated report delivery',
    ],
  },
];

const highlights = [
  {
    stat: '35%',
    label: 'Higher retention',
    description: 'Better member engagement',
  },
  {
    stat: '50%',
    label: 'More class bookings',
    description: 'Easy online scheduling',
  },
  {
    stat: '45%',
    label: 'Admin time saved',
    description: 'Automated workflows',
  },
];

export default function FitnessSolutionPage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-600/20 via-transparent to-transparent" />
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
                <Activity className="h-4 w-4" />
                Fitness & Wellness Centers
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white">
                Power Your Fitness Center with Smart Management
              </h1>

              <p className="mt-6 text-xl text-neutral-300">
                Streamline class scheduling, trainer management, and member engagement
                with a platform designed for fitness facilities of all sizes.
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
                  <div className="mt-1 text-sm font-medium text-orange-400">{item.label}</div>
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
                Complete Fitness Center Management
              </h2>
              <p className="mt-4 text-lg text-neutral-600 max-w-2xl mx-auto">
                10 integrated modules to manage every aspect of your fitness facility.
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
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
                            <Icon className="h-6 w-6 text-orange-600" />
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
                              <CheckCircle2 className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
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
                Ready to Elevate Your Fitness Center?
              </h2>
              <p className="mt-4 text-lg text-neutral-600">
                Join our founding member program and help shape the future of fitness management.
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
