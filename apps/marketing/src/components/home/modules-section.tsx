'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ArrowRight, Users, Receipt, CalendarDays, Trophy, Smartphone, Sparkles, CheckCircle2, ShoppingBag, Megaphone } from 'lucide-react';

const modules = [
  {
    pretitle: 'Membership',
    title: 'Membership Management',
    description:
      'Complete member lifecycle management from application to renewal. Track dependents, handle transfers, and manage all membership types in one place.',
    features: [
      'Member profiles with full history',
      'Application workflow with approvals',
      'Dependent and corporate management',
      'Automated renewal reminders',
    ],
    image: '/images/module-members.png',
    href: '/features/membership',
    icon: Users,
    accent: 'primary',
  },
  {
    pretitle: 'Billing',
    title: 'Billing & Payments',
    description:
      'Automate invoicing, collect payments, and stay compliant with local tax requirements. Support for all major payment methods across Southeast Asia.',
    features: [
      'Automated invoice generation',
      'Multiple payment gateways',
      'Tax compliance (VAT, GST, SST)',
      'Aging reports and reminders',
    ],
    image: '/images/module-billing.png',
    href: '/features/billing',
    icon: Receipt,
    accent: 'accent',
  },
  {
    pretitle: 'Booking',
    title: 'Facility Booking',
    description:
      'Real-time availability for all facilities. Courts, classes, equipment, and services—all bookable from one system with smart conflict resolution.',
    features: [
      'Real-time availability',
      'Recurring bookings',
      'Equipment reservations',
      'Waitlist management',
    ],
    image: '/images/module-facilities.png',
    href: '/features/booking',
    icon: CalendarDays,
    accent: 'primary',
  },
  {
    pretitle: 'Golf',
    title: 'Golf Operations',
    description:
      'Purpose-built tee sheet with caddie and cart assignments, handicap tracking, tournament management, and pro shop integration.',
    features: [
      'Visual tee sheet',
      'Caddie & cart management',
      'Handicap integration',
      'Tournament tools',
    ],
    image: '/images/module-golf.png',
    href: '/features/golf',
    icon: Trophy,
    accent: 'accent',
  },
  {
    pretitle: 'Portal',
    title: 'Member Portal',
    description:
      'Give members 24/7 access to book, pay, and manage their accounts. Beautiful mobile-first experience that your members will love.',
    features: [
      'Mobile-optimized PWA',
      'Self-service bookings',
      'Online bill payments',
      'Family account access',
    ],
    image: '/images/module-portal.png',
    href: '/features/portal',
    icon: Smartphone,
    accent: 'primary',
  },
  {
    pretitle: 'AI',
    title: 'Aura AI Assistant',
    description:
      'Your AI-powered club manager that learns your operations, answers member questions, automates routine tasks, and provides actionable insights.',
    features: [
      '24/7 member support',
      'Smart booking assistance',
      'Operational insights',
      'Automated communications',
    ],
    image: '/images/module-ai.png',
    href: '/features/aura',
    icon: Sparkles,
    accent: 'accent',
  },
  {
    pretitle: 'Retail',
    title: 'POS & Retail',
    description:
      'Full-featured point-of-sale for pro shops and retail operations. Manage inventory, process sales, and charge directly to member accounts seamlessly.',
    features: [
      'Pro shop point-of-sale',
      'Inventory management',
      'Member account charging',
      'Sales analytics & reporting',
    ],
    image: '/images/module-retail.png',
    href: '/features/retail',
    icon: ShoppingBag,
    accent: 'primary',
  },
  {
    pretitle: 'Marketing',
    title: 'AI Marketing Agency',
    description:
      'Your AI-powered digital marketing team. Automate engagement campaigns for existing members and acquisition campaigns to attract new ones—all optimized by AI.',
    features: [
      'AI-driven engagement campaigns',
      'Automated acquisition marketing',
      'Multi-channel campaign orchestration',
      'ROI tracking & optimization',
    ],
    image: '/images/module-marketing.png',
    href: '/features/marketing',
    icon: Megaphone,
    accent: 'accent',
  },
];

export function ModulesSection() {
  return (
    <section>
      {modules.map((module, index) => {
        const isReversed = index % 2 === 1;
        const Icon = module.icon;

        return (
          <div
            key={module.title}
            className={cn(
              'section-padding',
              index % 2 === 0 ? 'bg-white' : 'bg-cream-200/50'
            )}
          >
            <div className="container">
              <div
                className={cn(
                  'grid items-center gap-16 lg:grid-cols-12',
                  isReversed && 'lg:grid-flow-dense'
                )}
              >
                {/* Content */}
                <div className={cn(
                  'lg:col-span-5',
                  isReversed ? 'lg:col-start-8' : ''
                )}>
                  {/* Pretitle with icon */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-xl',
                      module.accent === 'accent'
                        ? 'bg-accent-100 text-accent-600'
                        : 'bg-primary-100 text-primary-600'
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={cn(
                      'text-label uppercase tracking-widest',
                      module.accent === 'accent' ? 'text-accent-600' : 'text-primary-600'
                    )}>
                      {module.pretitle}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="font-serif text-h2 text-charcoal-800">
                    {module.title}
                  </h2>

                  {/* Description */}
                  <p className="mt-4 text-body-lg text-charcoal-500 leading-relaxed">
                    {module.description}
                  </p>

                  {/* Features */}
                  <ul className="mt-8 space-y-4">
                    {module.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className={cn(
                          'h-5 w-5 shrink-0 mt-0.5',
                          module.accent === 'accent' ? 'text-accent-500' : 'text-primary-500'
                        )} />
                        <span className="text-charcoal-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Link */}
                  <div className="mt-10">
                    <Link
                      href={module.href}
                      className={cn(
                        'group inline-flex items-center gap-2 font-medium transition-colors',
                        module.accent === 'accent'
                          ? 'text-accent-600 hover:text-accent-500'
                          : 'text-primary-600 hover:text-primary-500'
                      )}
                    >
                      Explore {module.pretitle}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>

                {/* Image */}
                <div className={cn(
                  'lg:col-span-7',
                  isReversed ? 'lg:col-start-1' : ''
                )}>
                  <div className="relative group">
                    {/* Decorative frame */}
                    <div className={cn(
                      'absolute -inset-4 rounded-3xl opacity-50 transition-opacity duration-500 group-hover:opacity-100',
                      module.accent === 'accent'
                        ? 'bg-gradient-to-br from-accent-200/50 to-transparent'
                        : 'bg-gradient-to-br from-primary-200/50 to-transparent'
                    )} />

                    {/* Image container */}
                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl">
                      <Image
                        src={module.image}
                        alt={module.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* Subtle overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/20 to-transparent" />
                    </div>

                    {/* Corner decoration */}
                    <div className={cn(
                      'absolute -bottom-2 -right-2 w-24 h-24 border-b-2 border-r-2 rounded-br-3xl',
                      module.accent === 'accent' ? 'border-accent-300' : 'border-primary-300'
                    )} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
