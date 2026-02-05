'use client';

import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  MessageSquare,
  Brain,
  Zap,
  TrendingUp,
  Shield,
  ArrowRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';

const StatusBadge = () => (
  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium ml-3">
    <Clock className="h-4 w-4" />
    Coming Q3 2026
  </span>
);

const features = [
  {
    icon: MessageSquare,
    title: 'Natural Language Interface',
    description: 'Ask questions in plain English. "Show me members who haven\'t visited in 30 days."',
  },
  {
    icon: Brain,
    title: 'Learns Your Operations',
    description: 'Aura understands your club\'s unique workflows, terminology, and member preferences.',
  },
  {
    icon: Zap,
    title: 'Smart Automation',
    description: 'Automate repetitive tasks. Aura handles follow-ups, reminders, and routine communications.',
  },
  {
    icon: TrendingUp,
    title: 'Predictive Insights',
    description: 'AI-powered predictions for member churn, demand forecasting, and revenue optimization.',
  },
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: 'Your data stays private. Aura operates within your security perimeter with full audit trails.',
  },
  {
    icon: Sparkles,
    title: 'Continuous Learning',
    description: 'Aura gets smarter over time, learning from your feedback and club patterns.',
  },
];

const capabilities = [
  'Answer member inquiries instantly',
  'Generate reports with natural language',
  'Draft personalized communications',
  'Identify at-risk members automatically',
  'Suggest optimal pricing strategies',
  'Automate routine administrative tasks',
  'Provide real-time operational insights',
  'Predict and prevent service issues',
];

export default function AuraFeaturePage() {
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
                  <Sparkles className="h-6 w-6 text-accent-400" />
                </div>
                <StatusBadge />
              </div>
              <span className="text-label uppercase tracking-widest text-accent-400">
                AI Assistant
              </span>
              <h1 className="mt-4 font-serif text-h1 text-cream-50">
                Meet Aura, Your AI Operations Partner
              </h1>
              <p className="mt-6 text-body-lg text-cream-100">
                An AI assistant that truly understands club operations.
                Ask anything, automate tasks, and get insights that drive results.
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

        {/* Features Grid */}
        <section className="py-16 md:py-24 bg-cream-100">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="font-serif text-h2 text-charcoal-800">
                AI That Gets Club Management
              </h2>
              <p className="mt-4 text-body-lg text-charcoal-500 max-w-2xl mx-auto">
                Not just another chatbot. Aura is trained on club operations and
                integrates deeply with your ClubVantage data.
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

        {/* Capabilities */}
        <section className="py-16 md:py-24 bg-primary-700">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="h-6 w-6 text-accent-400" />
                  <span className="text-label uppercase tracking-widest text-accent-400">
                    Aura Capabilities
                  </span>
                </div>
                <h2 className="font-serif text-h2 text-cream-50">
                  Your 24/7 Operations Expert
                </h2>
                <p className="mt-4 text-body-lg text-cream-100">
                  Aura handles the routine so your team can focus on what matters:
                  delivering exceptional member experiences.
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
                    <Sparkles className="h-32 w-32 text-accent-300" />
                    <Brain className="absolute -top-4 -right-4 h-12 w-12 text-accent-400 animate-pulse" />
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
                  <h3 className="font-semibold text-charcoal-800">Coming Q3 2026</h3>
                  <p className="text-charcoal-500">Join the waitlist to be first in line for Aura AI Assistant.</p>
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
                Ready for AI-Powered Operations?
              </h2>
              <p className="mt-4 text-body-lg text-cream-200">
                Be among the first to experience Aura when it launches.
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
