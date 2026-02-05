'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Users } from 'lucide-react';

export function FinalCtaSection() {
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <section className="py-20 md:py-28 bg-charcoal-800 relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 1px,
            rgba(255,255,255,0.5) 1px,
            rgba(255,255,255,0.5) 2px
          )`,
          backgroundSize: '8px 8px',
        }}
      />

      <div className="relative container">
        <div className="mx-auto max-w-2xl text-center">
          {/* Social proof */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-cream-100/10">
            <Users className="h-4 w-4 text-accent-400" />
            <span className="text-sm text-cream-100">
              Join <span className="font-semibold text-accent-400">12</span> founding members shaping the future
            </span>
          </div>

          <h2 className="font-serif text-h1 text-cream-50">
            Ready to Transform Your Club?
          </h2>
          <p className="mt-4 text-body-lg text-cream-200">
            Be among the first to experience ClubVantage. Founding members get lifetime pricing and direct influence on what we build.
          </p>

          {/* Inline form or success message */}
          {isSubmitted ? (
            <div className="mt-10 p-6 rounded-2xl bg-cream-100/10 border border-cream-100/20">
              <div className="flex items-center justify-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-400">
                  <Check className="h-5 w-5 text-primary-900" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-cream-50">You&apos;re on the list!</p>
                  <p className="text-sm text-cream-200">Check your email for next steps.</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-10">
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 h-12 px-4 rounded-xl bg-cream-100/10 border border-cream-100/20 text-cream-50 placeholder:text-cream-300
                           focus:outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20 transition-all"
                />
                <Button type="submit" variant="accent" isLoading={isSubmitting}>
                  Join Waitlist
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <p className="mt-4 text-xs text-cream-300">
                We&apos;ll send you updates about ClubVantage. Unsubscribe anytime.
              </p>
            </form>
          )}

          {/* Secondary link */}
          <div className="mt-8">
            <Link
              href="/waitlist"
              className="text-sm text-cream-200 hover:text-cream-100 transition-colors underline underline-offset-4"
            >
              Want to tell us more about your club? Fill out the full form →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
