'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

const stats = [
  { value: '50', label: 'Founding Spots', suffix: '' },
  { value: '12', label: 'Members Joined', suffix: '' },
  { value: '50', label: 'Lifetime Discount', suffix: '%' },
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
  const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
  const heroRef = React.useRef<HTMLElement>(null);

  // Subtle parallax effect on mouse move
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
      setMousePosition({ x: x * 20, y: y * 20 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section ref={heroRef} className="relative min-h-screen overflow-hidden bg-primary-700">
      {/* Elegant gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-500/20 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-accent-400/10 via-transparent to-transparent" />

      {/* Animated decorative orbs with parallax */}
      <div
        className="absolute top-20 left-10 w-72 h-72 bg-accent-400/8 rounded-full blur-3xl float-gentle"
        style={{
          transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
          transition: 'transform 0.3s ease-out',
        }}
      />
      <div
        className="absolute bottom-40 right-20 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl"
        style={{
          transform: `translate(${mousePosition.x * -0.3}px, ${mousePosition.y * -0.3}px)`,
          transition: 'transform 0.3s ease-out',
          animation: 'floatGentle 10s ease-in-out infinite reverse',
        }}
      />
      <div
        className="absolute top-1/2 left-1/3 w-48 h-48 bg-accent-300/5 rounded-full blur-2xl"
        style={{
          transform: `translate(${mousePosition.x * 0.8}px, ${mousePosition.y * 0.8}px)`,
          transition: 'transform 0.2s ease-out',
        }}
      />

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

      {/* Decorative geometric elements */}
      <div className="absolute top-32 right-1/4 w-px h-32 bg-gradient-to-b from-accent-400/40 to-transparent opacity-0 animate-fade-in fill-forwards delay-6" />
      <div className="absolute bottom-1/3 left-16 w-24 h-px bg-gradient-to-r from-accent-400/30 to-transparent opacity-0 animate-fade-in fill-forwards delay-7" />

      <div className="relative container pb-32">
        {/* Top accent line with animation */}
        <div className="pt-32 pb-4">
          <div className="h-px w-0 bg-gradient-to-r from-accent-400 to-accent-400/0 animate-[slideInRight_1s_ease-out_forwards]" style={{ animationDelay: '200ms' }} />
        </div>

        {/* Main content - Editorial asymmetric layout */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Left column - Main headline */}
          <div className="lg:col-span-7 pt-4">
            {/* Status badge */}
            <div className="inline-flex items-center gap-3 mb-10 opacity-0 animate-fade-up fill-forwards">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-400" />
              </span>
              <span className="text-label uppercase tracking-widest text-cream-100">
                Now Accepting Founding Members
              </span>
            </div>

            {/* Editorial headline with staggered animation */}
            <h1 className="font-serif text-display-xl text-cream-50 leading-[0.95] tracking-tight">
              <span className="block opacity-0 animate-fade-up fill-forwards" style={{ animationDelay: '100ms' }}>
                The Future of
              </span>
              <span className="block opacity-0 animate-fade-up fill-forwards" style={{ animationDelay: '200ms' }}>
                <span className="relative">
                  <span className="text-accent-300">Club Management</span>
                  {/* Decorative underline */}
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-accent-400/30"
                    viewBox="0 0 200 12"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 9 Q50 0, 100 6 T200 3"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                      className="opacity-0 animate-fade-in fill-forwards"
                      style={{ animationDelay: '800ms' }}
                    />
                  </svg>
                </span>
              </span>
              <span className="block opacity-0 animate-fade-up fill-forwards" style={{ animationDelay: '300ms' }}>
                Starts Here
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-10 text-body-xl text-cream-100 max-w-xl leading-relaxed opacity-0 animate-fade-up fill-forwards" style={{ animationDelay: '400ms' }}>
              AI-first platform for golf clubs, fitness centers, and recreational facilities across Southeast Asia.
              Join our founding members to shape what we build.
            </p>

            {/* CTA buttons */}
            <div className="mt-12 flex flex-wrap items-center gap-5 opacity-0 animate-fade-up fill-forwards" style={{ animationDelay: '500ms' }}>
              <Button asChild size="lg" className="group pulse-glow">
                <Link href="/waitlist">
                  <Sparkles className="h-4 w-4 mr-2 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                  Join the Waitlist
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="border-cream-100/30 text-cream-100 hover:bg-cream-100/10">
                <Link href="#video">
                  <Play className="h-4 w-4 mr-2" />
                  Watch Video
                </Link>
              </Button>
            </div>
          </div>

          {/* Right column - Stats and benefits */}
          <div className="lg:col-span-5 lg:pt-20">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-6 pb-12 border-b border-cream-100/20">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="text-center opacity-0 animate-fade-up fill-forwards"
                  style={{ animationDelay: `${index * 100 + 300}ms` }}
                >
                  <div className="text-4xl font-serif font-medium text-cream-50 number-display">
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
                  className="group flex gap-5 opacity-0 animate-fade-up fill-forwards cursor-default"
                  style={{ animationDelay: `${index * 100 + 500}ms` }}
                >
                  <span className="text-label text-accent-400 font-mono transition-transform duration-300 group-hover:scale-110">
                    {benefit.number}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-cream-50 transition-colors duration-300 group-hover:text-accent-300">
                      {benefit.title}
                    </h3>
                    <p className="mt-1 text-body-sm text-cream-200 leading-relaxed transition-colors duration-300 group-hover:text-cream-100">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 relative opacity-0 animate-fade-up fill-forwards" style={{ animationDelay: '700ms' }}>
          <div className="relative mx-auto max-w-5xl">
            {/* Animated glow effect behind image */}
            <div
              className="absolute -inset-4 rounded-3xl blur-2xl transition-all duration-1000"
              style={{
                background: `radial-gradient(ellipse at ${50 + mousePosition.x}% ${50 + mousePosition.y}%, rgba(184, 134, 11, 0.25), rgba(27, 67, 50, 0.2), transparent)`,
              }}
            />

            {/* Dashboard image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-cream-100/10 hover-lift-glow">
              <Image
                src="/images/clubvantage-golf.png"
                alt="ClubVantage Golf Tee Sheet - Visual drag-and-drop scheduling"
                width={1200}
                height={675}
                className="w-full h-auto transition-transform duration-700 hover:scale-[1.02]"
                priority
              />
              {/* Subtle overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-900/20 via-transparent to-transparent pointer-events-none" />

              {/* Shine effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
            </div>

            {/* Animated corner accents */}
            <div className="absolute -top-2 -left-2 w-16 h-16 opacity-0 animate-fade-in fill-forwards" style={{ animationDelay: '900ms' }}>
              <div className="absolute top-0 left-0 w-full h-0.5 bg-accent-400/50 origin-left animate-[scaleIn_0.5s_ease-out_forwards]" style={{ animationDelay: '1000ms' }} />
              <div className="absolute top-0 left-0 w-0.5 h-full bg-accent-400/50 origin-top animate-[scaleIn_0.5s_ease-out_forwards]" style={{ animationDelay: '1100ms' }} />
            </div>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 opacity-0 animate-fade-in fill-forwards" style={{ animationDelay: '900ms' }}>
              <div className="absolute bottom-0 right-0 w-full h-0.5 bg-accent-400/50 origin-right animate-[scaleIn_0.5s_ease-out_forwards]" style={{ animationDelay: '1000ms' }} />
              <div className="absolute bottom-0 right-0 w-0.5 h-full bg-accent-400/50 origin-bottom animate-[scaleIn_0.5s_ease-out_forwards]" style={{ animationDelay: '1100ms' }} />
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
