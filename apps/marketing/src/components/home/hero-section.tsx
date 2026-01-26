'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

export function HeroSection() {
  const [isVideoPlaying, setIsVideoPlaying] = React.useState(false);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background gradient animation */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative container pt-32 pb-20">
        <div className="mx-auto max-w-4xl text-center">
          {/* Headline */}
          <h1 className="text-display text-white animate-fade-up">
            The AI-First Club Management Platform
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-body-lg text-neutral-300 max-w-2xl mx-auto animate-fade-up stagger-1">
            Streamline memberships, bookings, and billing for golf clubs, fitness
            centers, and recreational facilities across Southeast Asia.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up stagger-2">
            <Button asChild size="lg">
              <Link href="/demo">Schedule a Demo</Link>
            </Button>
            <Button asChild variant="secondary" size="lg" className="border-white/30 text-white hover:bg-white/10">
              <Link href="/pricing">See Pricing</Link>
            </Button>
          </div>

          {/* Video Section */}
          <div className="mt-16 animate-fade-up stagger-3">
            <div className="relative mx-auto max-w-3xl overflow-hidden rounded-xl shadow-2xl">
              {!isVideoPlaying ? (
                <div className="relative aspect-video">
                  {/* Video thumbnail */}
                  <Image
                    src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=1920&q=80"
                    alt="ClubVantage product demo"
                    fill
                    className="object-cover"
                    priority
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/30" />
                  {/* Play button */}
                  <button
                    onClick={() => setIsVideoPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center group"
                    aria-label="Play product demo video"
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110">
                      <Play className="h-8 w-8 text-primary-500 ml-1" fill="currentColor" />
                    </div>
                  </button>
                </div>
              ) : (
                <div className="aspect-video bg-black">
                  {/* Placeholder for video embed */}
                  <div className="flex h-full items-center justify-center text-white">
                    <p>Video player would be embedded here</p>
                  </div>
                </div>
              )}
            </div>
            <p className="mt-4 text-sm text-neutral-400">
              Watch the 2-minute product tour
            </p>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
