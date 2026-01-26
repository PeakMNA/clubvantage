'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, X, ChevronDown, ChevronUp } from 'lucide-react';

// Currency rates (simplified)
const currencies = {
  USD: { symbol: '$', rate: 1 },
  THB: { symbol: '฿', rate: 35 },
  SGD: { symbol: 'S$', rate: 1.35 },
  MYR: { symbol: 'RM', rate: 4.7 },
};

type CurrencyCode = keyof typeof currencies;

// Pricing tiers
const tiers = [
  {
    name: 'Starter',
    description: 'For small clubs getting started',
    basePrice: 300,
    memberLimit: '500',
    features: [
      { name: 'Up to 500 members', included: true },
      { name: 'Membership management', included: true },
      { name: 'Basic billing & invoicing', included: true },
      { name: 'Facility booking', included: true },
      { name: 'Email support', included: true },
      { name: 'Golf module', included: false },
      { name: 'Member portal', included: false },
      { name: 'Aura AI assistant', included: false },
    ],
    cta: 'Request Trial',
    href: '/demo',
  },
  {
    name: 'Professional',
    description: 'For growing clubs',
    basePrice: 800,
    memberLimit: '2,000',
    featured: true,
    badge: 'Most Popular',
    features: [
      { name: 'Up to 2,000 members', included: true },
      { name: 'Everything in Starter', included: true },
      { name: 'Golf module with tee sheet', included: true },
      { name: 'Member portal (PWA)', included: true },
      { name: 'Aura AI assistant', included: true },
      { name: 'Advanced reporting', included: true },
      { name: 'Priority support', included: true },
      { name: 'API access', included: true },
    ],
    cta: 'Request Trial',
    href: '/demo',
  },
  {
    name: 'Enterprise',
    description: 'For large clubs & chains',
    basePrice: 2500,
    memberLimit: 'Unlimited',
    features: [
      { name: 'Unlimited members', included: true },
      { name: 'Everything in Professional', included: true },
      { name: 'Multi-location support', included: true },
      { name: 'Custom integrations', included: true },
      { name: 'Dedicated CSM', included: true },
      { name: 'SLA guarantee', included: true },
      { name: 'On-premise option', included: true },
      { name: 'Custom training', included: true },
    ],
    cta: 'Contact Sales',
    href: '/contact',
  },
];

// FAQ items
const faqs = [
  {
    question: 'Can I upgrade or downgrade my plan?',
    answer:
      'Yes, you can change your plan at any time. When upgrading, you\'ll be prorated for the remaining billing period. When downgrading, the change takes effect at your next billing cycle.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'We offer trial access by request. Contact our sales team to discuss your needs and we\'ll set up a personalized trial environment for your club.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards, bank transfers, and local payment methods including PromptPay (Thailand), PayNow (Singapore), and DuitNow (Malaysia).',
  },
  {
    question: 'What happens if I exceed my member limit?',
    answer:
      'We\'ll notify you when you\'re approaching your limit. You can either upgrade to a higher tier or we can discuss custom pricing for your specific needs.',
  },
  {
    question: 'How long does implementation take?',
    answer:
      'Most clubs are fully operational within 2-4 weeks. Our team handles data migration, configuration, and staff training to ensure a smooth transition.',
  },
  {
    question: 'What kind of support do you provide?',
    answer:
      'All plans include email support. Professional plans get priority support with faster response times. Enterprise plans include a dedicated Customer Success Manager.',
  },
];

export default function PricingPage() {
  const [currency, setCurrency] = React.useState<CurrencyCode>('USD');
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'annual'>('monthly');
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);
  const [showComparison, setShowComparison] = React.useState(false);

  const formatPrice = (basePrice: number) => {
    const curr = currencies[currency];
    const price = basePrice * curr.rate;
    const annualDiscount = billingCycle === 'annual' ? 0.83 : 1;
    const finalPrice = Math.round(price * annualDiscount);
    return `${curr.symbol}${finalPrice.toLocaleString()}`;
  };

  return (
    <>
      <Header />
      <main className="pt-16">
        {/* Hero */}
        <section className="bg-neutral-50 py-16 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-h1 text-neutral-900">
                Simple, transparent pricing
              </h1>
              <p className="mt-4 text-body-lg text-neutral-600">
                Choose the plan that fits your club. No hidden fees.
              </p>

              {/* Toggles */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
                {/* Currency selector */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-600">Currency:</span>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                    className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {Object.keys(currencies).map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Billing toggle */}
                <div className="flex items-center gap-2 rounded-lg bg-white p-1 border border-neutral-200">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={cn(
                      'rounded-md px-4 py-2 text-sm font-medium transition-colors',
                      billingCycle === 'monthly'
                        ? 'bg-primary-500 text-white'
                        : 'text-neutral-600 hover:text-neutral-900'
                    )}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('annual')}
                    className={cn(
                      'rounded-md px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2',
                      billingCycle === 'annual'
                        ? 'bg-primary-500 text-white'
                        : 'text-neutral-600 hover:text-neutral-900'
                    )}
                  >
                    Annual
                    <span className="rounded-full bg-success-500 px-2 py-0.5 text-xs text-white">
                      Save 17%
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {tiers.map((tier) => (
                <div
                  key={tier.name}
                  className={cn(
                    'relative flex flex-col rounded-2xl border bg-white p-8',
                    tier.featured
                      ? 'border-primary-200 shadow-lg ring-2 ring-primary-100 scale-105 z-10'
                      : 'border-neutral-200 shadow-md'
                  )}
                >
                  {tier.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-1 text-sm font-medium text-white">
                        {tier.badge}
                      </span>
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-semibold text-neutral-900">
                      {tier.name}
                    </h3>
                    <p className="mt-1 text-sm text-neutral-600">
                      {tier.description}
                    </p>
                  </div>

                  <div className="mt-6">
                    <span className="text-4xl font-bold text-neutral-900">
                      {formatPrice(tier.basePrice)}
                    </span>
                    <span className="text-neutral-600">
                      /{billingCycle === 'annual' ? 'mo' : 'mo'}
                    </span>
                    {billingCycle === 'annual' && (
                      <p className="mt-1 text-sm text-neutral-500">
                        Billed annually
                      </p>
                    )}
                  </div>

                  <p className="mt-4 text-sm text-neutral-600">
                    Up to {tier.memberLimit} members
                  </p>

                  <ul className="mt-6 flex-1 space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature.name} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="h-5 w-5 shrink-0 text-success-500" />
                        ) : (
                          <X className="h-5 w-5 shrink-0 text-neutral-300" />
                        )}
                        <span
                          className={cn(
                            'text-sm',
                            feature.included
                              ? 'text-neutral-700'
                              : 'text-neutral-400'
                          )}
                        >
                          {feature.name}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8">
                    <Button
                      asChild
                      variant={tier.featured ? 'primary' : 'secondary'}
                      fullWidth
                    >
                      <Link href={tier.href}>{tier.cta}</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="bg-neutral-50 py-16">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="flex w-full items-center justify-between rounded-lg bg-white p-4 border border-neutral-200 hover:border-neutral-300 transition-colors"
              >
                <span className="font-medium text-neutral-900">
                  Compare all features
                </span>
                {showComparison ? (
                  <ChevronUp className="h-5 w-5 text-neutral-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-neutral-500" />
                )}
              </button>

              {showComparison && (
                <div className="mt-4 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200">
                        <th className="px-4 py-3 text-left text-sm font-medium text-neutral-600">
                          Feature
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-neutral-600">
                          Starter
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-primary-600 bg-primary-50">
                          Professional
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-neutral-600">
                          Enterprise
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {[
                        { name: 'Members', starter: '500', pro: '2,000', enterprise: 'Unlimited' },
                        { name: 'Membership management', starter: true, pro: true, enterprise: true },
                        { name: 'Billing & invoicing', starter: true, pro: true, enterprise: true },
                        { name: 'Facility booking', starter: true, pro: true, enterprise: true },
                        { name: 'Golf module', starter: false, pro: true, enterprise: true },
                        { name: 'Member portal', starter: false, pro: true, enterprise: true },
                        { name: 'Aura AI', starter: false, pro: true, enterprise: true },
                        { name: 'Advanced reporting', starter: false, pro: true, enterprise: true },
                        { name: 'API access', starter: false, pro: true, enterprise: true },
                        { name: 'Multi-location', starter: false, pro: false, enterprise: true },
                        { name: 'Custom integrations', starter: false, pro: false, enterprise: true },
                        { name: 'Dedicated CSM', starter: false, pro: false, enterprise: true },
                      ].map((row) => (
                        <tr key={row.name}>
                          <td className="px-4 py-3 text-sm text-neutral-700">
                            {row.name}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {typeof row.starter === 'boolean' ? (
                              row.starter ? (
                                <Check className="h-5 w-5 text-success-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-neutral-300 mx-auto" />
                              )
                            ) : (
                              <span className="text-sm text-neutral-700">{row.starter}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center bg-primary-50">
                            {typeof row.pro === 'boolean' ? (
                              row.pro ? (
                                <Check className="h-5 w-5 text-success-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-neutral-300 mx-auto" />
                              )
                            ) : (
                              <span className="text-sm text-neutral-700">{row.pro}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {typeof row.enterprise === 'boolean' ? (
                              row.enterprise ? (
                                <Check className="h-5 w-5 text-success-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-neutral-300 mx-auto" />
                              )
                            ) : (
                              <span className="text-sm text-neutral-700">{row.enterprise}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-h2 text-neutral-900 text-center">
                Frequently asked questions
              </h2>

              <div className="mt-12 space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-neutral-200 bg-white"
                  >
                    <button
                      onClick={() =>
                        setExpandedFaq(expandedFaq === index ? null : index)
                      }
                      className="flex w-full items-center justify-between p-4 text-left"
                    >
                      <span className="font-medium text-neutral-900">
                        {faq.question}
                      </span>
                      {expandedFaq === index ? (
                        <ChevronUp className="h-5 w-5 text-neutral-500 shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-neutral-500 shrink-0" />
                      )}
                    </button>
                    {expandedFaq === index && (
                      <div className="px-4 pb-4">
                        <p className="text-neutral-600">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary-500 py-16">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-h2 text-white">Still have questions?</h2>
              <p className="mt-4 text-body-lg text-white/80">
                Our team is here to help you find the right plan for your club.
              </p>
              <div className="mt-8">
                <Button
                  asChild
                  className="bg-white text-primary-600 hover:bg-neutral-100"
                >
                  <Link href="/contact">Contact Sales</Link>
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
