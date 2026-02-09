import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import {
  Users,
  UserPlus,
  FileText,
  CreditCard,
  Bell,
  Shield,
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
    icon: UserPlus,
    title: 'Member Applications',
    description: 'Streamlined application process with customizable forms, document uploads, and approval workflows.',
  },
  {
    icon: FileText,
    title: 'Contract Management',
    description: 'Digital contracts with e-signatures, automatic renewals, and term tracking.',
  },
  {
    icon: CreditCard,
    title: 'Membership Plans',
    description: 'Flexible plan configuration with tiered pricing, family packages, and promotional offers.',
  },
  {
    icon: Bell,
    title: 'Renewal Automation',
    description: 'Automatic renewal reminders, prorated billing, and lapse prevention workflows.',
  },
  {
    icon: Shield,
    title: 'Access Control',
    description: 'Member privileges by type, facility access rules, and guest policies.',
  },
  {
    icon: Users,
    title: 'Family Management',
    description: 'Link family members, manage dependents, and track usage across household.',
  },
];

const useCases = [
  {
    title: 'New Member Onboarding',
    description: 'From application to first visit - automated welcome sequences and orientation scheduling.',
  },
  {
    title: 'Membership Upgrades',
    description: 'Easy plan changes with prorated billing and immediate access updates.',
  },
  {
    title: 'Retention Programs',
    description: 'Identify at-risk members and trigger personalized retention campaigns.',
  },
  {
    title: 'Corporate Memberships',
    description: 'Manage corporate accounts with designated members and billing consolidation.',
  },
];

export default function MembershipFeaturePage() {
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
                  <Users className="h-6 w-6 text-accent-400" />
                </div>
                <StatusBadge />
              </div>
              <span className="text-label uppercase tracking-widest text-accent-400">
                Membership Management
              </span>
              <h1 className="mt-4 font-serif text-h1 text-cream-50">
                Complete Member Lifecycle Management
              </h1>
              <p className="mt-6 text-body-lg text-cream-100">
                From application to renewal, manage every aspect of membership
                with powerful automation and personalized member experiences.
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
                Everything for Membership Management
              </h2>
              <p className="mt-4 text-body-lg text-charcoal-500 max-w-2xl mx-auto">
                Purpose-built tools to streamline operations and delight members.
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
                  Built for Modern Clubs
                </h2>
                <p className="mt-4 text-body-lg text-charcoal-500">
                  Whether you&apos;re managing 100 or 10,000 members, our platform
                  scales with your needs while maintaining that personal touch.
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
                  <Users className="h-32 w-32 text-primary-300" />
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
                Ready to Transform Member Management?
              </h2>
              <p className="mt-4 text-body-lg text-cream-100">
                See how ClubVantage can streamline your membership operations.
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
