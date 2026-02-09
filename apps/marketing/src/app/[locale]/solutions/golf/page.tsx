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
  Flag,
  Car,
  User,
  Trophy,
  Clock,
  Smartphone,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

const modules = [
  {
    name: 'Tee Sheet Management',
    icon: Calendar,
    description: 'Intelligent booking system designed specifically for golf operations.',
    features: [
      'Visual tee sheet with drag-and-drop bookings',
      'Multi-course support with unified view',
      'Configurable tee time intervals (7-15 min)',
      'Member, guest, and walk-up booking types',
      'Recurring booking templates',
      'Shotgun start tournament mode',
      'Crossover tee management (1st & 10th)',
      'Real-time availability sync',
      'Waitlist management with auto-notifications',
      'No-show tracking and penalties',
    ],
  },
  {
    name: 'Caddie Management',
    icon: User,
    description: 'Complete caddie scheduling, assignment, and performance tracking.',
    features: [
      'Caddie roster with skill levels and certifications',
      'Automatic assignment based on member preferences',
      'Forecaddie and single bag options',
      'Caddie request tracking from members',
      'Performance ratings and feedback collection',
      'Earnings tracking and payout management',
      'Availability scheduling',
      'Training and certification tracking',
    ],
  },
  {
    name: 'Cart Fleet Management',
    icon: Car,
    description: 'Track, assign, and maintain your entire cart fleet efficiently.',
    features: [
      'Real-time cart availability dashboard',
      'Automatic cart assignment with bookings',
      'GPS tracking integration ready',
      'Maintenance scheduling and history',
      'Battery/fuel level monitoring',
      'Cart condition reporting',
      'Member cart preferences',
      'Private cart storage tracking',
    ],
  },
  {
    name: 'Tournament Management',
    icon: Trophy,
    description: 'Run flawless tournaments from registration to leaderboard.',
    features: [
      'Multiple format support (stroke, match, stableford)',
      'Flight creation and management',
      'Handicap integration and calculations',
      'Live scoring with mobile app',
      'Real-time leaderboards',
      'Prize distribution management',
      'Sponsor integration tools',
      'Post-tournament reporting',
      'Results history and archives',
    ],
  },
  {
    name: 'Member Management',
    icon: Users,
    description: 'Comprehensive member lifecycle from application to renewal.',
    features: [
      'Online membership applications',
      'Customizable approval workflows',
      'Member categories and tiers',
      'Family and dependent management',
      'Membership transfers and conversions',
      'Playing rights configuration',
      'Handicap tracking integration',
      'Member communication preferences',
      'Document storage (contracts, IDs)',
      'Membership renewals and upgrades',
    ],
  },
  {
    name: 'Billing & Accounts',
    icon: CreditCard,
    description: 'Automated billing with full accounts receivable management.',
    features: [
      'Automated monthly statement generation',
      'Flexible billing cycles',
      'Multiple payment methods',
      'Online payment portal',
      'Credit/debit memo management',
      'Aging reports and collections',
      'Member spending limits',
      'F&B charge posting integration',
      'Pro shop sales integration',
      'Tax handling (VAT/GST)',
    ],
  },
  {
    name: 'Facility Booking',
    icon: Clock,
    description: 'Manage all club facilities beyond the golf course.',
    features: [
      'Dining reservations',
      'Function room bookings',
      'Spa and wellness appointments',
      'Tennis/racquet court scheduling',
      'Swimming pool lane booking',
      'Locker assignments',
      'Equipment rentals',
      'Recurring reservation support',
      'Capacity management',
      'Resource conflict prevention',
    ],
  },
  {
    name: 'Reporting & Analytics',
    icon: BarChart3,
    description: 'Data-driven insights for better club operations.',
    features: [
      'Course utilization dashboards',
      'Revenue per round analysis',
      'Member activity reports',
      'Pace of play tracking',
      'Caddie performance metrics',
      'Cart utilization reports',
      'F&B consumption analysis',
      'Membership trend reports',
      'Custom report builder',
      'Scheduled report delivery',
    ],
  },
  {
    name: 'Member Portal & App',
    icon: Smartphone,
    description: 'Self-service portal for members on any device.',
    features: [
      'Online tee time booking',
      'View and pay statements',
      'Update profile and preferences',
      'Book facilities and dining',
      'Request caddie preferences',
      'View handicap and scores',
      'Tournament registration',
      'Club communications inbox',
      'Digital member card',
      'Guest registration',
    ],
  },
  {
    name: 'Communication Hub',
    icon: MessageSquare,
    description: 'Keep members informed and engaged.',
    features: [
      'Email campaign management',
      'SMS notifications',
      'Push notifications (mobile app)',
      'Automated reminders',
      'Event announcements',
      'Course condition updates',
      'Member surveys and feedback',
      'Segmented messaging',
      'Communication history',
    ],
  },
];

const highlights = [
  {
    stat: '40%',
    label: 'Faster check-in',
    description: 'Streamlined arrival process',
  },
  {
    stat: '25%',
    label: 'More rounds booked',
    description: 'Optimized tee sheet utilization',
  },
  {
    stat: '60%',
    label: 'Less admin time',
    description: 'Automated workflows',
  },
];

export default function GolfSolutionPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 bg-primary-800 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-600/30 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent-400/10 to-transparent" />

          <div className="container relative">
            <Link
              href="/solutions"
              className="inline-flex items-center gap-2 text-cream-200 hover:text-cream-50 transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Solutions
            </Link>

            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-cream-50/10 px-4 py-2 text-sm text-cream-200 backdrop-blur-sm border border-cream-50/10 mb-6">
                <Flag className="h-4 w-4 text-accent-400" />
                Golf & Country Clubs
              </div>

              <h1 className="font-serif text-4xl md:text-5xl text-cream-50">
                The Complete Golf Club Management Platform
              </h1>

              <p className="mt-6 text-xl text-cream-100">
                Purpose-built for golf and country clubs with intelligent tee sheet management,
                caddie coordination, fleet tracking, and seamless member experiences.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" variant="accent">
                  <Link href="/waitlist">
                    Join the Waitlist
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="border-cream-50/30 text-cream-50 hover:bg-cream-50/10">
                  <Link href="/roadmap">View Roadmap</Link>
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl">
              {highlights.map((item) => (
                <div key={item.label} className="text-center">
                  <div className="font-serif text-3xl font-bold text-accent-400">{item.stat}</div>
                  <div className="mt-1 text-sm font-medium text-cream-50">{item.label}</div>
                  <div className="mt-1 text-xs text-cream-200">{item.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Modules Grid */}
        <section className="py-16 md:py-24 bg-cream-100">
          <div className="container">
            <div className="text-center mb-16">
              <span className="text-label uppercase tracking-widest text-accent-600">
                Platform Modules
              </span>
              <h2 className="mt-4 font-serif text-3xl text-charcoal-800">
                Everything You Need to Run Your Golf Club
              </h2>
              <p className="mt-4 text-lg text-charcoal-500 max-w-2xl mx-auto">
                10 integrated modules designed specifically for golf and country club operations.
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
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100">
                            <Icon className="h-6 w-6 text-primary-600" />
                          </div>
                          <div>
                            <span className="text-xs font-medium text-charcoal-400 uppercase tracking-wider">Module {index + 1}</span>
                            <h3 className="font-serif text-xl text-charcoal-800">{module.name}</h3>
                          </div>
                        </div>
                        <p className="text-charcoal-500">{module.description}</p>
                      </div>

                      {/* Features List */}
                      <div className="lg:w-2/3 lg:border-l lg:border-cream-300 lg:pl-8">
                        <h4 className="text-xs font-semibold text-charcoal-400 uppercase tracking-wider mb-4">
                          Key Features
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {module.features.map((feature) => (
                            <div key={feature} className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-primary-500 shrink-0 mt-0.5" />
                              <span className="text-sm text-charcoal-600">{feature}</span>
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
        <section className="py-16 bg-primary-800">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-serif text-3xl text-cream-50">
                Ready to Transform Your Golf Club?
              </h2>
              <p className="mt-4 text-lg text-cream-100">
                Join our founding member program and help shape the future of golf club management.
                Get early access, influence our roadmap, and lock in lifetime pricing.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg" variant="accent">
                  <Link href="/waitlist">Join the Waitlist</Link>
                </Button>
                <Button asChild variant="secondary" size="lg" className="border-cream-50/30 text-cream-50 hover:bg-cream-50/10">
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
