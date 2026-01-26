'use client';

import * as React from 'react';
import { Sparkles, CreditCard, Calendar, Globe } from 'lucide-react';

const benefits = [
  {
    icon: Sparkles,
    pretitle: 'AI-Powered',
    title: 'Meet Aura',
    subtitle: 'Your AI Club Manager',
    description:
      'An intelligent assistant that learns your club\'s unique patterns, automates member communications, and provides 24/7 support.',
  },
  {
    icon: CreditCard,
    pretitle: 'Automated',
    title: 'Smart Billing',
    subtitle: 'Invoicing & Payments',
    description:
      'Local payment methods, multi-currency support, automated reminders, and complete tax compliance built for Southeast Asia.',
  },
  {
    icon: Calendar,
    pretitle: 'Unified',
    title: 'One Platform',
    subtitle: 'All Your Bookings',
    description:
      'Tee times, courts, classes, and amenities—all in one beautiful system with real-time availability.',
  },
  {
    icon: Globe,
    pretitle: 'Regional',
    title: 'Built for SEA',
    subtitle: 'Local Compliance',
    description:
      'VAT, GST, SST compliance. PromptPay, PayNow, DuitNow integrated. Thai and English language support.',
  },
];

export function BenefitsSection() {
  return (
    <section className="section-padding bg-cream-100">
      <div className="container">
        {/* Section Header - Editorial style */}
        <div className="max-w-3xl">
          <span className="text-label uppercase tracking-widest text-accent-500">
            Why ClubVantage
          </span>
          <h2 className="mt-4 font-serif text-h1 text-charcoal-800 leading-tight">
            Everything your club needs,
            <br />
            <span className="text-primary-500">nothing it doesn&apos;t.</span>
          </h2>
          <p className="mt-6 text-body-lg text-charcoal-500 max-w-2xl">
            One platform to manage memberships, bookings, billing, and more—designed
            specifically for prestigious clubs across Southeast Asia.
          </p>
        </div>

        {/* Divider */}
        <div className="my-16 divider-accent" />

        {/* Benefits Grid - Asymmetric editorial layout */}
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-20">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Number decoration */}
                <span className="absolute -left-4 -top-4 text-8xl font-serif font-medium text-cream-300/50 select-none">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="relative">
                  {/* Icon */}
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl
                                bg-primary-50 border border-primary-100
                                group-hover:bg-primary-100 group-hover:border-primary-200
                                transition-all duration-300">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>

                  {/* Content */}
                  <div className="mt-6">
                    <span className="text-caption uppercase tracking-wider text-accent-500">
                      {benefit.pretitle}
                    </span>
                    <h3 className="mt-2 font-serif text-2xl text-charcoal-800">
                      {benefit.title}
                    </h3>
                    <p className="text-lg font-medium text-charcoal-600">
                      {benefit.subtitle}
                    </p>
                    <p className="mt-4 text-body text-charcoal-500 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>

                  {/* Hover accent line */}
                  <div className="mt-6 h-px w-0 bg-accent-400 transition-all duration-500 group-hover:w-16" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
