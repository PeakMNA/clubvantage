'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

const stats = [
  { value: '50', label: 'Founding Spots', suffix: '' },
  { value: '12', label: 'Members Joined', suffix: '' },
  { value: '100', label: 'Lifetime Discount', suffix: '%' },
];

const benefits = [
  {
    number: '01',
    title: 'Shape the Product',
    description: 'Direct influence on features, priorities, and the roadmap that matters to you.',
  },
  {
    number: '02',
    title: 'Early Access',
    description: 'Be among the first to experience new capabilities before public release.',
  },
  {
    number: '03',
    title: 'Founder Pricing',
    description: 'Lock in exclusive lifetime pricing as a founding member.',
  },
];

export function EarlyAccessHero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-primary-700">
      {/* Elegant gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-500/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-accent-400/10 via-transparent to-transparent" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent-400/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 right-20 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />

      {/* Subtle diagonal lines pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 1px,
            rgba(255,255,255,0.5) 1px,
            rgba(255,255,255,0.5) 2px
          )`,
          backgroundSize: '8px 8px',
        }}
      />

      <div className="relative container pb-32">
        {/* Top accent line */}
        <div className="pt-32 pb-4">
          <div className="h-px w-24 bg-gradient-to-r from-accent-400 to-transparent" />
        </div>

        {/* Main content - Editorial asymmetric layout */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Left column - Main headline */}
          <div className="lg:col-span-7 pt-4">
            {/* Status badge */}
            <div className="inline-flex items-center gap-3 mb-10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-400" />
              </span>
              <span className="text-label uppercase tracking-widest text-cream-100">
                Now Accepting Founding Members
              </span>
            </div>

            {/* Editorial headline */}
            <h1 className="font-serif text-display-xl text-cream-50 leading-[0.95] tracking-tight">
              The Future of
              <br />
              <span className="text-accent-300">Club Management</span>
              <br />
              Starts Here
            </h1>

            {/* Subheadline */}
            <p className="mt-10 text-body-xl text-cream-100 max-w-xl leading-relaxed">
              Join our founding community of visionary club managers.
              Shape the AI-first platform that will transform how prestigious
              clubs operate across Southeast Asia.
            </p>

            {/* CTA buttons */}
            <div className="mt-12 flex flex-wrap items-center gap-5">
              <Button asChild size="lg" className="group">
                <Link href="/waitlist">
                  <Sparkles className="h-4 w-4 mr-2 transition-transform group-hover:rotate-12" />
                  Join the Waitlist
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Link
                href="/roadmap"
                className="inline-flex items-center gap-2 px-6 py-3 text-cream-100 font-medium
                         border border-cream-100/20 rounded-lg
                         transition-all duration-300 hover:border-cream-100/40 hover:bg-cream-100/5"
              >
                View Roadmap
              </Link>
            </div>
          </div>

          {/* Right column - Stats and benefits */}
          <div className="lg:col-span-5 lg:pt-20">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-6 pb-12 border-b border-cream-100/20">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="text-center animate-fade-up fill-forwards"
                  style={{ animationDelay: `${index * 100 + 200}ms` }}
                >
                  <div className="text-4xl font-serif font-medium text-cream-50">
                    {stat.value}
                    <span className="text-accent-400">{stat.suffix}</span>
                  </div>
                  <div className="mt-2 text-caption text-cream-200 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Benefits list */}
            <div className="pt-12 space-y-8">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit.number}
                  className="group flex gap-5 animate-fade-up fill-forwards"
                  style={{ animationDelay: `${index * 100 + 400}ms` }}
                >
                  <span className="text-label text-accent-400 font-mono">
                    {benefit.number}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-cream-50 group-hover:text-accent-300 transition-colors">
                      {benefit.title}
                    </h3>
                    <p className="mt-1 text-body-sm text-cream-200 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom decorative element */}
        <div className="absolute bottom-0 left-0 right-0">
          {/* Curved transition to next section */}
          <svg
            viewBox="0 0 1440 120"
            className="w-full h-auto"
            preserveAspectRatio="none"
          >
            <path
              d="M0,120 L0,60 Q360,0 720,60 T1440,60 L1440,120 Z"
              fill="rgb(250 247 242)"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
