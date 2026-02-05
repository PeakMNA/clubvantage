import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import {
  Receipt,
  CreditCard,
  FileText,
  Calculator,
  TrendingUp,
  Clock,
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
    icon: FileText,
    title: 'Automated Invoicing',
    description: 'Generate and send invoices automatically based on membership plans, usage, and custom charges.',
  },
  {
    icon: CreditCard,
    title: 'Payment Processing',
    description: 'Accept credit cards, ACH, and bank transfers. Support recurring payments and split billing.',
  },
  {
    icon: Calculator,
    title: 'Tax Compliance',
    description: 'Automatic tax calculations, GST/VAT handling, and compliant reporting for audits.',
  },
  {
    icon: Clock,
    title: 'Payment Reminders',
    description: 'Automated dunning workflows with customizable reminder sequences and escalation paths.',
  },
  {
    icon: TrendingUp,
    title: 'AR Management',
    description: 'Track receivables, aging reports, and collection status with real-time dashboards.',
  },
  {
    icon: Receipt,
    title: 'Statement Generation',
    description: 'Member statements with full transaction history, available online and via email.',
  },
];

const useCases = [
  {
    title: 'Membership Dues',
    description: 'Automated monthly, quarterly, or annual billing with proration and plan changes.',
  },
  {
    title: 'Activity Charges',
    description: 'Post charges from golf, dining, spa, and retail directly to member accounts.',
  },
  {
    title: 'Event Billing',
    description: 'Tournament fees, event tickets, and special function charges with easy reconciliation.',
  },
  {
    title: 'Family Billing',
    description: 'Consolidated statements for family memberships with individual usage tracking.',
  },
];

export default function BillingFeaturePage() {
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
                  <Receipt className="h-6 w-6 text-accent-400" />
                </div>
                <StatusBadge />
              </div>
              <span className="text-label uppercase tracking-widest text-accent-400">
                Billing & Payments
              </span>
              <h1 className="mt-4 font-serif text-h1 text-cream-50">
                Streamlined Billing & Collections
              </h1>
              <p className="mt-6 text-body-lg text-cream-100">
                Automate invoicing, collect payments effortlessly, and stay compliant
                with comprehensive billing management built for clubs.
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
                Complete Billing Solution
              </h2>
              <p className="mt-4 text-body-lg text-charcoal-500 max-w-2xl mx-auto">
                Everything you need to manage club finances efficiently and professionally.
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
                  Billing That Works for You
                </h2>
                <p className="mt-4 text-body-lg text-charcoal-500">
                  Handle every billing scenario with ease, from simple dues
                  collection to complex multi-service invoicing.
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
                  <Receipt className="h-32 w-32 text-primary-300" />
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
                Ready to Simplify Your Billing?
              </h2>
              <p className="mt-4 text-body-lg text-cream-100">
                See how ClubVantage can transform your financial operations.
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
