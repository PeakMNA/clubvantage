'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import {
  Users,
  Receipt,
  Trophy,
  CalendarDays,
  ShoppingBag,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export function ReadyNowSection() {
  const t = useTranslations('readyNow');
  const tc = useTranslations('common');

  const builtModules = [
    {
      icon: Users,
      title: t('members'),
      description: t('membersDesc'),
      features: [
        t('membersF1'),
        t('membersF2'),
        t('membersF3'),
      ],
      href: '/features/membership' as const,
    },
    {
      icon: Receipt,
      title: t('billing'),
      description: t('billingDesc'),
      features: [
        t('billingF1'),
        t('billingF2'),
        t('billingF3'),
      ],
      href: '/features/billing' as const,
    },
    {
      icon: Trophy,
      title: t('golf'),
      description: t('golfDesc'),
      features: [
        t('golfF1'),
        t('golfF2'),
        t('golfF3'),
      ],
      href: '/features/golf' as const,
    },
    {
      icon: CalendarDays,
      title: t('facilityBooking'),
      description: t('facilityBookingDesc'),
      features: [
        t('facilityBookingF1'),
        t('facilityBookingF2'),
        t('facilityBookingF3'),
      ],
      href: '/features/booking' as const,
    },
    {
      icon: ShoppingBag,
      title: t('pos'),
      description: t('posDesc'),
      features: [
        t('posF1'),
        t('posF2'),
        t('posF3'),
      ],
      href: '/features/retail' as const,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
            {tc('built')}
          </span>
        </div>
        <h2 className="font-serif text-h1 text-charcoal-800 max-w-2xl">
          {t('whatsReadyNow')}
        </h2>
        <p className="mt-4 text-body-lg text-charcoal-500 max-w-2xl">
          {t('subtitle')}
        </p>

        {/* Module Cards Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {builtModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.title}
                href={module.href}
                className="group relative p-6 bg-cream-50 rounded-2xl border border-cream-300
                         hover:border-emerald-200 hover:shadow-lg transition-all duration-300"
              >
                {/* Built badge */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    {tc('built')}
                  </span>
                </div>

                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl
                              bg-primary-100 group-hover:bg-primary-500 transition-colors duration-300">
                  <Icon className="h-6 w-6 text-primary-600 group-hover:text-white transition-colors duration-300" />
                </div>

                {/* Content */}
                <h3 className="mt-4 text-lg font-semibold text-charcoal-800 group-hover:text-primary-600 transition-colors">
                  {module.title}
                </h3>
                <p className="mt-1 text-sm text-charcoal-500">
                  {module.description}
                </p>

                {/* Feature list */}
                <ul className="mt-4 space-y-2">
                  {module.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs text-charcoal-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Learn more link */}
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-600
                              group-hover:text-primary-500 transition-colors">
                  {tc('learnMore')}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
