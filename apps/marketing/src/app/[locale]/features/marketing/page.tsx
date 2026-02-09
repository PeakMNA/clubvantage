'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import {
  Megaphone,
  Users,
  UserPlus,
  Mail,
  BarChart3,
  Zap,
  Target,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Clock,
} from 'lucide-react';

const StatusBadge = () => (
  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium ml-3">
    <Clock className="h-4 w-4" />
    Coming Q4 2026
  </span>
);

const engagementFeatures = [
  {
    icon: Mail,
    title: 'Smart Email Campaigns',
    description: 'AI creates personalized email sequences based on member behavior, preferences, and lifecycle stage.',
  },
  {
    icon: Zap,
    title: 'Automated Triggers',
    description: 'Set up behavior-based automations: birthday wishes, renewal reminders, win-back campaigns, and more.',
  },
  {
    icon: Users,
    title: 'Member Segmentation',
    description: 'AI automatically segments members by activity, spending, preferences, and engagement levels.',
  },
  {
    icon: BarChart3,
    title: 'Engagement Analytics',
    description: 'Track open rates, click-through rates, and measure the impact of each campaign on member behavior.',
  },
];

const acquisitionFeatures = [
  {
    icon: Target,
    title: 'AI Ad Creation',
    description: 'Aura generates compelling ad copy and creative for Google, Facebook, and Instagram campaigns.',
  },
  {
    icon: UserPlus,
    title: 'Lookalike Audiences',
    description: 'AI identifies and targets prospects who match your best members across digital platforms.',
  },
  {
    icon: TrendingUp,
    title: 'Budget Optimization',
    description: 'Automatically allocate budget to highest-performing channels and campaigns in real-time.',
  },
  {
    icon: BarChart3,
    title: 'Attribution & ROI',
    description: 'Full funnel tracking from first touch to membership signup with clear ROI reporting.',
  },
];

const capabilities = [
  'Personalized member communications at scale',
  'Multi-channel campaign orchestration',
  'A/B testing with AI optimization',
  'Referral program automation',
  'Social media content generation',
  'Lead nurturing workflows',
  'Campaign performance dashboards',
  'Integration with CRM and billing',
];

export default function MarketingFeaturePage() {
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
                  <Megaphone className="h-6 w-6 text-accent-400" />
                </div>
                <StatusBadge />
              </div>
              <span className="text-label uppercase tracking-widest text-accent-400">
                AI Marketing Agency
              </span>
              <h1 className="mt-4 font-serif text-h1 text-cream-50">
                Your AI-Powered Marketing Team
              </h1>
              <p className="mt-6 text-body-lg text-cream-100">
                Let Aura handle your marketing. AI-driven campaigns for member engagement
                and new member acquisition—automatically optimized for results.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild variant="accent">
                  <Link href="/waitlist">
                    Join Waitlist
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="border-cream-50/30 text-cream-50 hover:bg-cream-50/10">
                  <Link href="/roadmap">View Roadmap</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Engagement Section */}
        <section className="py-16 md:py-24 bg-cream-100">
          <div className="container">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
              <span className="text-label uppercase tracking-widest text-primary-600">
                Member Engagement
              </span>
            </div>
            <h2 className="font-serif text-h2 text-charcoal-800 max-w-2xl">
              Keep Members Engaged & Coming Back
            </h2>
            <p className="mt-4 text-body-lg text-charcoal-500 max-w-2xl">
              AI-powered campaigns that nurture relationships, increase visit frequency,
              and maximize member lifetime value.
            </p>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {engagementFeatures.map((feature) => {
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
                    <p className="mt-2 text-sm text-charcoal-500">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Acquisition Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-100">
                <UserPlus className="h-5 w-5 text-accent-600" />
              </div>
              <span className="text-label uppercase tracking-widest text-accent-600">
                Member Acquisition
              </span>
            </div>
            <h2 className="font-serif text-h2 text-charcoal-800 max-w-2xl">
              Attract New Members Automatically
            </h2>
            <p className="mt-4 text-body-lg text-charcoal-500 max-w-2xl">
              AI creates, launches, and optimizes digital ad campaigns to bring
              qualified prospects to your club.
            </p>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {acquisitionFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="group p-6 bg-cream-50 rounded-2xl border border-cream-300 hover:border-accent-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100 group-hover:bg-accent-500 transition-colors duration-300">
                      <Icon className="h-6 w-6 text-accent-600 group-hover:text-white transition-colors duration-300" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-charcoal-800">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-charcoal-500">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section className="py-16 md:py-24 bg-primary-700">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="h-6 w-6 text-accent-400" />
                  <span className="text-label uppercase tracking-widest text-accent-400">
                    Powered by Aura AI
                  </span>
                </div>
                <h2 className="font-serif text-h2 text-cream-50">
                  Marketing That Works While You Sleep
                </h2>
                <p className="mt-4 text-body-lg text-cream-100">
                  Aura continuously learns from your data to create more effective
                  campaigns. No marketing team required.
                </p>
                <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                  {capabilities.map((capability) => (
                    <li key={capability} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-accent-400 shrink-0 mt-0.5" />
                      <span className="text-cream-100">{capability}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-accent-400/20 to-primary-500/20 flex items-center justify-center">
                  <div className="relative">
                    <Megaphone className="h-32 w-32 text-accent-300" />
                    <Sparkles className="absolute -top-4 -right-4 h-12 w-12 text-accent-400 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Coming Soon Notice */}
        <section className="py-12 bg-accent-50 border-y border-accent-200">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-100">
                  <Sparkles className="h-6 w-6 text-accent-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-800">Coming Q4 2026</h3>
                  <p className="text-charcoal-500">Join the waitlist to be first in line for AI Marketing Agency.</p>
                </div>
              </div>
              <Button asChild>
                <Link href="/waitlist">
                  Join Waitlist
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-charcoal-800 py-16">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-h2 text-cream-50">
                Ready to Automate Your Marketing?
              </h2>
              <p className="mt-4 text-body-lg text-cream-200">
                See how ClubVantage AI Marketing Agency can grow your membership.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild variant="accent">
                  <Link href="/waitlist">Join Waitlist</Link>
                </Button>
                <Button asChild variant="secondary" className="border-cream-100/30 text-cream-100 hover:bg-cream-100/10">
                  <Link href="/contact">Talk to Sales</Link>
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
