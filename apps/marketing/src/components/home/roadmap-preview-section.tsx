'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronUp, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const topFeatures = [
  {
    id: '1',
    title: 'AI Marketing - Member Engagement',
    description: 'AI-powered campaigns for retention: smart emails, push notifications, and personalized offers.',
    votes: 68,
    category: 'Marketing',
    eta: 'Q4 2026',
  },
  {
    id: '2',
    title: 'WhatsApp Notifications',
    description: 'Booking confirmations, payment reminders, and announcements via WhatsApp.',
    votes: 67,
    category: 'Integrations',
    eta: 'Q4 2026',
  },
  {
    id: '3',
    title: 'AI Marketing - Acquisition',
    description: 'AI creates and optimizes ad campaigns on Google, Facebook, and Instagram.',
    votes: 56,
    category: 'Marketing',
    eta: '2027',
  },
];

export function RoadmapPreviewSection() {
  const [votedFeatures, setVotedFeatures] = React.useState<Set<string>>(new Set());

  const handleVote = (featureId: string) => {
    setVotedFeatures((prev) => {
      const next = new Set(prev);
      if (next.has(featureId)) {
        next.delete(featureId);
      } else {
        next.add(featureId);
      }
      return next;
    });
  };

  return (
    <section className="py-20 md:py-28 bg-primary-700 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-accent-400/10 via-transparent to-transparent" />

      <div className="relative container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-serif text-h1 text-cream-50">
            Help Us Decide What&apos;s Next
          </h2>
          <p className="mt-4 text-body-lg text-cream-100">
            These are the most-requested features. Join the waitlist to vote and influence our roadmap.
          </p>
        </div>

        {/* Top 3 Features */}
        <div className="max-w-3xl mx-auto space-y-4">
          {topFeatures.map((feature, index) => {
            const voted = votedFeatures.has(feature.id);
            const displayVotes = voted ? feature.votes + 1 : feature.votes;

            return (
              <div
                key={feature.id}
                className="group flex items-center gap-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl
                         border border-cream-100/10 hover:bg-white/15 transition-all duration-300"
              >
                {/* Rank */}
                <div className="flex h-10 w-10 items-center justify-center rounded-full
                              bg-accent-400/20 text-accent-400 font-serif font-bold text-lg">
                  {index + 1}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-cream-50 group-hover:text-accent-300 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-sm text-cream-200 line-clamp-1">
                    {feature.description}
                  </p>
                </div>

                {/* Category badge */}
                <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full bg-cream-100/10 text-cream-200 text-xs">
                  {feature.category}
                </span>

                {/* Vote button */}
                <button
                  onClick={() => handleVote(feature.id)}
                  className={cn(
                    'flex flex-col items-center rounded-xl border-2 px-3 py-2 transition-all duration-300',
                    voted
                      ? 'border-accent-400 bg-accent-400/20 text-accent-400'
                      : 'border-cream-100/20 text-cream-100 hover:border-cream-100/40'
                  )}
                >
                  <ChevronUp className="h-4 w-4" />
                  <span className="text-sm font-semibold">{displayVotes}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Button asChild size="lg" variant="accent" className="group">
            <Link href="/roadmap">
              Vote on the Roadmap
              <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
