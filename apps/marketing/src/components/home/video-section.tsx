'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Play, Pause, Users, Calendar } from 'lucide-react';

export function VideoSection() {
  const tv = useTranslations('video');
  const th = useTranslations('hero');
  const tc = useTranslations('common');
  const [isPlaying, setIsPlaying] = React.useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const stats = [
    { icon: Users, value: '50', label: th('foundingSpots') },
    { icon: Users, value: '12', label: th('membersJoined') },
    { icon: Calendar, value: '2.5', label: tv('yearRoadmap') },
  ];

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section id="video" className="py-20 md:py-28 bg-cream-100">
      <div className="container">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-label uppercase tracking-widest text-accent-500">
            {tv('ourVision')}
          </span>
          <h2 className="mt-4 font-serif text-h1 text-charcoal-800">
            {tv('seeWhatWereBuilding')}
          </h2>
          <p className="mt-4 text-body-lg text-charcoal-500">
            {tv('subtitle')}
          </p>
        </div>

        {/* Video Player */}
        <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl group">
          <div className="aspect-video relative bg-charcoal-900">
            {/* Video element */}
            <video
              ref={videoRef}
              className="absolute inset-0 w-full h-full object-cover"
              poster="/images/clubvantage-golf.png"
              onEnded={() => setIsPlaying(false)}
              playsInline
              preload="auto"
            >
              <source src="/video/TheClubThatRunsItself.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            {/* Play/Pause overlay */}
            {!isPlaying && (
              <>
                <div className="absolute inset-0 bg-charcoal-900/30" />
                <button
                  onClick={handlePlayPause}
                  className="absolute inset-0 flex items-center justify-center group/play"
                  aria-label={tc('playVideo')}
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
                  1:35
                </div>
              </>
            )}

            {/* Pause button when playing */}
            {isPlaying && (
              <button
                onClick={handlePlayPause}
                className="absolute bottom-4 right-4 flex items-center justify-center w-12 h-12 rounded-full
                         bg-charcoal-900/70 text-cream-100 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={tc('pauseVideo')}
              >
                <Pause className="h-5 w-5" fill="currentColor" />
              </button>
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
