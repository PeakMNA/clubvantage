'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ChevronUp,
  MessageSquare,
  Clock,
  CheckCircle2,
  Rocket,
  Lightbulb,
  Plus,
  ArrowRight,
  CalendarDays,
  Star,
} from 'lucide-react';

type FeatureStatus = 'planned' | 'in-progress' | 'completed' | 'considering';

interface Feature {
  id: string;
  title: string;
  description: string;
  status: FeatureStatus;
  votes: number;
  comments: number;
  category: string;
  eta?: string;
  isMvp?: boolean;
}

interface TimelineQuarter {
  quarter: string;
  label: string;
  features: string[];
  isCurrent?: boolean;
}

const timeline: TimelineQuarter[] = [
  {
    quarter: 'Q1 2026',
    label: 'MVP Launch',
    isCurrent: true,
    features: [
      'Member Management & Directory',
      'Basic Billing & Invoicing',
      'Tee Sheet & Golf Booking',
      'Facility Booking Calendar',
      'Aura AI Assistant (Basic)',
      'Member Portal (Web)',
    ],
  },
  {
    quarter: 'Q2 2026',
    label: 'Mobile & Integrations',
    features: [
      'Member Mobile App (iOS & Android)',
      'Golf Handicap Integration',
      'WhatsApp Notifications',
      'Advanced Reporting Dashboard',
      'Payment Gateway Integrations',
    ],
  },
  {
    quarter: 'Q3 2026',
    label: 'Advanced Features',
    features: [
      'Tournament Management',
      'Multi-Currency Billing',
      'Dependent Portal Access',
      'F&B POS Integration',
      'Automated Marketing Campaigns',
    ],
  },
  {
    quarter: 'Q4 2026',
    label: 'AI & Analytics',
    features: [
      'AI-Powered Revenue Insights',
      'Predictive Member Churn',
      'Smart Scheduling Optimization',
      'Advanced Analytics Suite',
      'API for Third-Party Apps',
    ],
  },
];

const statusConfig: Record<FeatureStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  considering: { label: 'Under Consideration', color: 'bg-accent-100 text-accent-700', icon: Lightbulb },
  planned: { label: 'Planned', color: 'bg-primary-100 text-primary-700', icon: Clock },
  'in-progress': { label: 'In Progress', color: 'bg-amber-100 text-amber-700', icon: Rocket },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
};

const categories = ['All', 'Membership', 'Billing', 'Booking', 'Golf', 'Portal', 'AI', 'Integrations'];

const initialFeatures: Feature[] = [
  // MVP Features (Q1 2026)
  {
    id: '1',
    title: 'Aura AI Assistant - Natural Language Booking',
    description: 'Let members book tee times and facilities using conversational AI. "Book me a tennis court tomorrow at 3pm"',
    status: 'in-progress',
    votes: 47,
    comments: 12,
    category: 'AI',
    eta: 'Q1 2026',
    isMvp: true,
  },
  {
    id: '3',
    title: 'Automated Payment Reminders',
    description: 'Smart reminders via email, SMS, and push notifications for overdue invoices with configurable escalation.',
    status: 'in-progress',
    votes: 62,
    comments: 8,
    category: 'Billing',
    eta: 'Q1 2026',
    isMvp: true,
  },
  {
    id: '5',
    title: 'QR Code Member Check-in',
    description: 'Members can scan QR codes at facilities for instant check-in and attendance tracking.',
    status: 'completed',
    votes: 55,
    comments: 7,
    category: 'Membership',
    isMvp: true,
  },
  {
    id: '6',
    title: 'Recurring Booking Templates',
    description: 'Set up weekly or monthly recurring bookings for regular players and groups.',
    status: 'in-progress',
    votes: 38,
    comments: 11,
    category: 'Booking',
    eta: 'Q1 2026',
    isMvp: true,
  },
  {
    id: '12',
    title: 'Guest Management & Tracking',
    description: 'Track guest visits, enforce limits, and streamline guest registration.',
    status: 'in-progress',
    votes: 48,
    comments: 10,
    category: 'Membership',
    eta: 'Q1 2026',
    isMvp: true,
  },
  // Q2 2026 Features
  {
    id: '2',
    title: 'Member Mobile App (iOS & Android)',
    description: 'Native mobile apps for members to book, pay, and access their member card on their phone.',
    status: 'planned',
    votes: 89,
    comments: 23,
    category: 'Portal',
    eta: 'Q2 2026',
  },
  {
    id: '4',
    title: 'Golf Handicap Integration',
    description: 'Automatic handicap calculation and syncing with national golf associations.',
    status: 'planned',
    votes: 41,
    comments: 15,
    category: 'Golf',
    eta: 'Q2 2026',
  },
  {
    id: '9',
    title: 'WhatsApp Integration',
    description: 'Send booking confirmations and reminders via WhatsApp for higher engagement.',
    status: 'planned',
    votes: 67,
    comments: 14,
    category: 'Integrations',
    eta: 'Q2 2026',
  },
  {
    id: '13',
    title: 'Advanced Reporting Dashboard',
    description: 'Comprehensive analytics with customizable dashboards, KPIs, and automated scheduled reports.',
    status: 'planned',
    votes: 54,
    comments: 12,
    category: 'AI',
    eta: 'Q2 2026',
  },
  // Q3 2026 Features
  {
    id: '7',
    title: 'Multi-Currency Billing',
    description: 'Support for billing members in different currencies with automatic conversion.',
    status: 'considering',
    votes: 29,
    comments: 6,
    category: 'Billing',
    eta: 'Q3 2026',
  },
  {
    id: '8',
    title: 'Tournament Management',
    description: 'Full tournament setup with brackets, scoring, leaderboards, and prize distribution.',
    status: 'considering',
    votes: 52,
    comments: 19,
    category: 'Golf',
    eta: 'Q3 2026',
  },
  {
    id: '10',
    title: 'Dependent Member Portal Access',
    description: 'Allow dependents to have their own login with appropriate permissions.',
    status: 'considering',
    votes: 33,
    comments: 9,
    category: 'Portal',
    eta: 'Q3 2026',
  },
  {
    id: '14',
    title: 'F&B POS Integration',
    description: 'Connect with restaurant POS systems to post charges directly to member accounts.',
    status: 'considering',
    votes: 45,
    comments: 8,
    category: 'Integrations',
    eta: 'Q3 2026',
  },
  // Q4 2026 Features
  {
    id: '11',
    title: 'AI-Powered Revenue Insights',
    description: 'Aura analyzes your data and proactively suggests opportunities to increase revenue.',
    status: 'considering',
    votes: 44,
    comments: 7,
    category: 'AI',
    eta: 'Q4 2026',
  },
  {
    id: '15',
    title: 'Predictive Member Churn Analysis',
    description: 'AI identifies members at risk of leaving so you can take proactive retention actions.',
    status: 'considering',
    votes: 37,
    comments: 5,
    category: 'AI',
    eta: 'Q4 2026',
  },
  {
    id: '16',
    title: 'Public API for Third-Party Apps',
    description: 'Full REST API for building custom integrations and third-party applications.',
    status: 'considering',
    votes: 31,
    comments: 11,
    category: 'Integrations',
    eta: 'Q4 2026',
  },
];

export default function RoadmapPage() {
  const [features, setFeatures] = React.useState(initialFeatures);
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const [votedFeatures, setVotedFeatures] = React.useState<Set<string>>(new Set());
  const [showSuggestModal, setShowSuggestModal] = React.useState(false);

  const handleVote = (featureId: string) => {
    if (votedFeatures.has(featureId)) {
      // Unvote
      setVotedFeatures((prev) => {
        const next = new Set(prev);
        next.delete(featureId);
        return next;
      });
      setFeatures((prev) =>
        prev.map((f) => (f.id === featureId ? { ...f, votes: f.votes - 1 } : f))
      );
    } else {
      // Vote
      setVotedFeatures((prev) => new Set(prev).add(featureId));
      setFeatures((prev) =>
        prev.map((f) => (f.id === featureId ? { ...f, votes: f.votes + 1 } : f))
      );
    }
  };

  const filteredFeatures =
    selectedCategory === 'All'
      ? features
      : features.filter((f) => f.category === selectedCategory);

  const groupedFeatures = {
    'in-progress': filteredFeatures.filter((f) => f.status === 'in-progress'),
    planned: filteredFeatures.filter((f) => f.status === 'planned'),
    considering: filteredFeatures.filter((f) => f.status === 'considering'),
    completed: filteredFeatures.filter((f) => f.status === 'completed'),
  };

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="bg-primary-800 py-16 md:py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-label uppercase tracking-widest text-accent-400">
                Roadmap
              </span>
              <h1 className="mt-4 font-serif text-h1 text-cream-50">Product Roadmap</h1>
              <p className="mt-4 text-body-lg text-cream-100">
                See what we&apos;re building and help us prioritize. Your votes directly
                influence what we work on next.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild variant="accent">
                  <Link href="/waitlist">
                    Join to Vote
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
                <Button
                  variant="secondary"
                  className="border-cream-50/30 text-cream-50 hover:bg-cream-50/10"
                  onClick={() => setShowSuggestModal(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Suggest a Feature
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-12 md:py-16 bg-cream-100 border-b border-cream-300">
          <div className="container">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
                <CalendarDays className="h-5 w-5 text-primary-600" />
              </div>
              <h2 className="font-serif text-2xl text-charcoal-800">Projected Timeline</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              {timeline.map((quarter, index) => (
                <div
                  key={quarter.quarter}
                  className={cn(
                    'relative rounded-2xl border-2 p-6 transition-all duration-300',
                    quarter.isCurrent
                      ? 'border-primary-500 bg-white shadow-lg'
                      : 'border-cream-300 bg-white hover:border-cream-400'
                  )}
                >
                  {/* Current badge */}
                  {quarter.isCurrent && (
                    <div className="absolute -top-3 left-4 inline-flex items-center gap-1 rounded-full bg-accent-400 px-3 py-1 text-xs font-medium text-primary-900">
                      <Star className="h-3 w-3" />
                      Current Focus
                    </div>
                  )}

                  {/* Quarter header */}
                  <div className="mb-4">
                    <div className="font-serif text-lg font-bold text-charcoal-800">{quarter.quarter}</div>
                    <div className={cn(
                      'text-sm font-medium',
                      quarter.isCurrent ? 'text-primary-600' : 'text-charcoal-500'
                    )}>
                      {quarter.label}
                    </div>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-2">
                    {quarter.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className={cn(
                          'h-4 w-4 shrink-0 mt-0.5',
                          quarter.isCurrent ? 'text-primary-500' : 'text-charcoal-400'
                        )} />
                        <span className="text-sm text-charcoal-600">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Timeline connector */}
                  {index < timeline.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-cream-400" />
                  )}
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm text-charcoal-500 text-center">
              Timeline is subject to change based on community feedback and priorities.
              <Link href="/waitlist" className="text-primary-600 hover:text-primary-500 ml-1">
                Join the waitlist
              </Link> to influence our roadmap.
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b border-cream-300 bg-white sticky top-20 z-40">
          <div className="container py-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-all duration-300',
                    selectedCategory === category
                      ? 'bg-primary-500 text-cream-50'
                      : 'bg-cream-200 text-charcoal-600 hover:bg-cream-300'
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Roadmap Board */}
        <section className="py-12 md:py-16 bg-cream-100">
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-4">
              {/* In Progress Column */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Rocket className="h-5 w-5 text-amber-600" />
                  <h2 className="font-semibold text-charcoal-800">In Progress</h2>
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                    {groupedFeatures['in-progress'].length}
                  </span>
                </div>
                <div className="space-y-4">
                  {groupedFeatures['in-progress']
                    .sort((a, b) => b.votes - a.votes)
                    .map((feature) => (
                      <FeatureCard
                        key={feature.id}
                        feature={feature}
                        voted={votedFeatures.has(feature.id)}
                        onVote={() => handleVote(feature.id)}
                      />
                    ))}
                </div>
              </div>

              {/* Planned Column */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-primary-600" />
                  <h2 className="font-semibold text-charcoal-800">Planned</h2>
                  <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                    {groupedFeatures.planned.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {groupedFeatures.planned
                    .sort((a, b) => b.votes - a.votes)
                    .map((feature) => (
                      <FeatureCard
                        key={feature.id}
                        feature={feature}
                        voted={votedFeatures.has(feature.id)}
                        onVote={() => handleVote(feature.id)}
                      />
                    ))}
                </div>
              </div>

              {/* Considering Column */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-accent-600" />
                  <h2 className="font-semibold text-charcoal-800">Considering</h2>
                  <span className="rounded-full bg-accent-100 px-2 py-0.5 text-xs font-medium text-accent-700">
                    {groupedFeatures.considering.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {groupedFeatures.considering
                    .sort((a, b) => b.votes - a.votes)
                    .map((feature) => (
                      <FeatureCard
                        key={feature.id}
                        feature={feature}
                        voted={votedFeatures.has(feature.id)}
                        onVote={() => handleVote(feature.id)}
                      />
                    ))}
                </div>
              </div>

              {/* Completed Column */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <h2 className="font-semibold text-charcoal-800">Completed</h2>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    {groupedFeatures.completed.length}
                  </span>
                </div>
                <div className="space-y-4">
                  {groupedFeatures.completed
                    .sort((a, b) => b.votes - a.votes)
                    .map((feature) => (
                      <FeatureCard
                        key={feature.id}
                        feature={feature}
                        voted={votedFeatures.has(feature.id)}
                        onVote={() => handleVote(feature.id)}
                      />
                    ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-primary-800 py-16">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-h2 text-cream-50">Have a feature idea?</h2>
              <p className="mt-4 text-body-lg text-cream-100">
                Join our founding member community to suggest features and help shape
                the future of ClubVantage.
              </p>
              <div className="mt-8">
                <Button asChild variant="accent">
                  <Link href="/waitlist">Join the Waitlist</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Suggest Feature Modal */}
      {showSuggestModal && (
        <SuggestFeatureModal onClose={() => setShowSuggestModal(false)} />
      )}
    </>
  );
}

function FeatureCard({
  feature,
  voted,
  onVote,
}: {
  feature: Feature;
  voted: boolean;
  onVote: () => void;
}) {
  return (
    <div className={cn(
      'rounded-2xl border bg-white p-4 hover:shadow-md transition-all duration-300',
      feature.isMvp ? 'border-primary-300 ring-1 ring-primary-100' : 'border-cream-300'
    )}>
      <div className="flex items-start gap-3">
        {/* Vote button */}
        <button
          onClick={onVote}
          className={cn(
            'flex flex-col items-center rounded-xl border-2 px-2 py-1.5 transition-all duration-300',
            voted
              ? 'border-primary-500 bg-primary-50 text-primary-600'
              : 'border-cream-300 text-charcoal-500 hover:border-cream-400'
          )}
        >
          <ChevronUp className="h-4 w-4" />
          <span className="text-sm font-semibold">{feature.votes}</span>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <h3 className="font-semibold text-charcoal-800 text-sm leading-tight flex-1">
              {feature.title}
            </h3>
            {feature.isMvp && (
              <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                <Star className="h-3 w-3" />
                MVP
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-charcoal-500 line-clamp-2">
            {feature.description}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-cream-200 px-2 py-0.5 text-xs text-charcoal-600">
              {feature.category}
            </span>
            {feature.eta && (
              <span className={cn(
                'rounded-full px-2 py-0.5 text-xs font-medium',
                feature.isMvp
                  ? 'bg-primary-50 text-primary-600'
                  : 'bg-cream-100 text-charcoal-500'
              )}>
                {feature.eta}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-charcoal-400">
              <MessageSquare className="h-3 w-3" />
              {feature.comments}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SuggestFeatureModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/50">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        {isSubmitted ? (
          <div className="text-center py-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100">
              <CheckCircle2 className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="mt-4 font-serif font-semibold text-charcoal-800">Thanks for the suggestion!</h3>
            <p className="mt-2 text-charcoal-500">
              We&apos;ll review your feature idea and add it to our roadmap if it fits.
            </p>
            <Button onClick={onClose} className="mt-6">
              Close
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-xl font-semibold text-charcoal-800">Suggest a Feature</h2>
              <button
                onClick={onClose}
                className="text-charcoal-400 hover:text-charcoal-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                  Feature Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Mobile check-in with QR codes"
                  required
                  className="flex h-12 w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-base
                           text-charcoal-700 placeholder:text-charcoal-400
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the feature and why it would be valuable..."
                  rows={4}
                  required
                  className="flex w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-base
                           text-charcoal-700 placeholder:text-charcoal-400
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                  className="flex h-12 w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-base
                           text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select category...</option>
                  {categories.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" onClick={onClose} fullWidth>
                  Cancel
                </Button>
                <Button type="submit" fullWidth isLoading={isSubmitting}>
                  Submit Suggestion
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
