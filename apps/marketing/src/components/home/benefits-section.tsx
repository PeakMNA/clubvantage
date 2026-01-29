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
  const sectionRef = React.useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-cream-100 overflow-hidden">
      <div className="container">
        {/* Section Header - Editorial style */}
        <div className="max-w-3xl">
          <span
            className={`inline-block text-label uppercase tracking-widest text-accent-500 transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Why ClubVantage
          </span>
          <h2
            className={`mt-4 font-serif text-h1 text-charcoal-800 leading-tight transition-all duration-700 delay-100 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Everything your club needs,
            <br />
            <span className="text-primary-500 relative">
              nothing it doesn&apos;t.
              {/* Decorative accent */}
              <svg
                className={`absolute -bottom-1 left-0 w-full h-2 text-accent-400/40 transition-all duration-1000 delay-500 ${
                  isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                }`}
                style={{ transformOrigin: 'left' }}
                viewBox="0 0 200 8"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 6 Q50 0, 100 4 T200 2"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
            </span>
          </h2>
          <p
            className={`mt-6 text-body-lg text-charcoal-500 max-w-2xl transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            One platform to manage memberships, bookings, billing, and more—designed
            specifically for prestigious clubs across Southeast Asia.
          </p>
        </div>

        {/* Animated Divider */}
        <div className="my-16 relative h-px">
          <div
            className={`absolute inset-0 bg-gradient-to-r from-transparent via-accent-400 to-transparent transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
            }`}
          />
        </div>

        {/* Benefits Grid - Asymmetric editorial layout */}
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-20">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            const delay = 400 + index * 150;

            return (
              <div
                key={benefit.title}
                className={`group relative transition-all duration-700 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${delay}ms` }}
              >
                {/* Number decoration with hover effect */}
                <span className="absolute -left-4 -top-4 text-8xl font-serif font-medium text-cream-300/50 select-none transition-all duration-500 group-hover:text-cream-400/60 group-hover:scale-105">
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="relative">
                  {/* Icon with enhanced hover */}
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl
                                bg-primary-50 border border-primary-100
                                group-hover:bg-primary-500 group-hover:border-primary-500
                                transition-all duration-500 group-hover:scale-110 group-hover:rotate-3
                                group-hover:shadow-lg group-hover:shadow-primary-500/20">
                    <Icon className="h-6 w-6 text-primary-600 group-hover:text-white transition-colors duration-500" />
                  </div>

                  {/* Content */}
                  <div className="mt-6">
                    <span className="text-caption uppercase tracking-wider text-accent-500">
                      {benefit.pretitle}
                    </span>
                    <h3 className="mt-2 font-serif text-2xl text-charcoal-800 group-hover:text-primary-600 transition-colors duration-300">
                      {benefit.title}
                    </h3>
                    <p className="text-lg font-medium text-charcoal-600">
                      {benefit.subtitle}
                    </p>
                    <p className="mt-4 text-body text-charcoal-500 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>

                  {/* Animated hover accent line */}
                  <div className="mt-6 h-0.5 w-0 bg-gradient-to-r from-accent-400 to-primary-400 transition-all duration-500 group-hover:w-20" />

                  {/* Subtle corner decoration on hover */}
                  <div className="absolute -right-2 -bottom-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute bottom-0 right-0 w-full h-px bg-accent-400/30" />
                    <div className="absolute bottom-0 right-0 w-px h-full bg-accent-400/30" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
