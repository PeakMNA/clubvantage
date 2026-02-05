'use client';

import * as React from 'react';
import { Play, Users, Calendar } from 'lucide-react';

const stats = [
  { icon: Users, value: '50', label: 'Founding Spots' },
  { icon: Users, value: '12', label: 'Members Joined' },
  { icon: Calendar, value: '2.5', label: 'Year Roadmap' },
];

export function VideoSection() {
  const [isPlaying, setIsPlaying] = React.useState(false);

  return (
    <section id="video" className="py-20 md:py-28 bg-cream-100">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-label uppercase tracking-widest text-accent-500">
            Our Vision
          </span>
          <h2 className="mt-4 font-serif text-h1 text-charcoal-800">
            See What We&apos;re Building
          </h2>
          <p className="mt-4 text-body-lg text-charcoal-500">
            25 years of club expertise, rebuilt for the AI era.
          </p>
        </div>

        {/* Video Player */}
        <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl group">
          <div className="aspect-video bg-gradient-to-br from-primary-700 to-primary-900 relative">
            {!isPlaying ? (
              <>
                <div className="absolute inset-0 bg-charcoal-900/30" />
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center group/play"
                  aria-label="Play video"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-accent-400/20 animate-ping" />
                    <div className="absolute -inset-4 rounded-full bg-accent-400/10 animate-pulse" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-accent-400
                                  shadow-lg shadow-accent-500/30 transition-all duration-300
                                  group-hover/play:scale-110 group-hover/play:bg-accent-300">
                      <Play className="h-8 w-8 text-primary-900 ml-1" fill="currentColor" />
                    </div>
                  </div>
                </button>
                <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-charcoal-900/70 text-cream-100 text-sm">
                  1:30
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-cream-100">
                <p>Video player placeholder - embed actual video here</p>
              </div>
            )}
          </div>

          {/* Decorative corners */}
          <div className="absolute -top-2 -left-2 w-12 h-12">
            <div className="absolute top-0 left-0 w-full h-0.5 bg-accent-400/50" />
            <div className="absolute top-0 left-0 w-0.5 h-full bg-accent-400/50" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-12 h-12">
            <div className="absolute bottom-0 right-0 w-full h-0.5 bg-accent-400/50" />
            <div className="absolute bottom-0 right-0 w-0.5 h-full bg-accent-400/50" />
          </div>
        </div>

        {/* Stats below video */}
        <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 mb-3">
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
                <div className="text-3xl font-serif font-medium text-charcoal-800">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-charcoal-500">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
