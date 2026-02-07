# Marketing Site Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Use frontend-design skill for all UI components.

**Goal:** Redesign ClubVantage marketing site for waitlist conversion with "shape the product" positioning and a 2.5-year roadmap.

**Architecture:** Update existing Next.js App Router marketing site. Modify homepage hero, add new sections, update waitlist form, refactor about page narrative, extend roadmap timeline. All changes use existing component patterns and design system.

**Tech Stack:** Next.js 14 (App Router), React, Tailwind CSS, Lucide Icons, existing ClubVantage design system (primary-*, accent-*, cream-*, charcoal-* colors).

**Design Direction:** Editorial luxury with restrained elegance. The aesthetic is "premium club management" - sophisticated typography, generous whitespace, subtle animations, and a color palette that conveys trust and expertise. Think high-end business publication meets modern SaaS.

---

## Phase 1: Homepage Redesign

### Task 1: Update Hero Section - Badge and Headline

**Files:**
- Modify: `apps/marketing/src/components/home/early-access-hero.tsx:112-150`

**Step 1: Update the status badge text**

Change from "Now Accepting Founding Members" to "Now Accepting Founding Members":

```tsx
// Line ~117-119 - Update badge text
<span className="text-label uppercase tracking-widest text-cream-100">
  Now Accepting Founding Members
</span>
```

**Step 2: Update the headline to match design spec**

```tsx
// Lines ~123-150 - Update headline
<h1 className="font-serif text-display-xl text-cream-50 leading-[0.95] tracking-tight">
  <span className="block opacity-0 animate-fade-up fill-forwards" style={{ animationDelay: '100ms' }}>
    The Future of
  </span>
  <span className="block opacity-0 animate-fade-up fill-forwards" style={{ animationDelay: '200ms' }}>
    <span className="relative">
      <span className="text-accent-300">Club Management</span>
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
```

**Step 3: Update subheadline**

```tsx
// Line ~153-157
<p className="mt-10 text-body-xl text-cream-100 max-w-xl leading-relaxed opacity-0 animate-fade-up fill-forwards" style={{ animationDelay: '400ms' }}>
  AI-first platform for golf clubs, fitness centers, and recreational facilities across Southeast Asia.
  Join our founding members to shape what we build.
</p>
```

**Step 4: Update CTA buttons**

```tsx
// Lines ~160-178 - Update CTAs
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
```

**Step 5: Run dev server to verify**

Run: `cd clubvantage && pnpm dev --filter marketing`
Expected: Hero displays with updated copy

**Step 6: Commit**

```bash
git add apps/marketing/src/components/home/early-access-hero.tsx
git commit -m "$(cat <<'EOF'
feat(marketing): update hero section copy for waitlist focus

- Update badge, headline, and subheadline per design spec
- Add video CTA button alongside waitlist button

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Create Video Section Component

**Files:**
- Create: `apps/marketing/src/components/home/video-section.tsx`

**Step 1: Create the video section component**

```tsx
'use client';

import * as React from 'react';
import { Play, Users, Calendar, Vote } from 'lucide-react';
import { cn } from '@/lib/utils';

const stats = [
  { icon: Users, value: '50', label: 'Founding Spots' },
  { icon: Users, value: '12', label: 'Members Joined' },
  { icon: Calendar, value: '2.5', label: 'Year Roadmap' },
];

export function VideoSection() {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const videoRef = React.useRef<HTMLDivElement>(null);

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
        <div
          ref={videoRef}
          className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl group"
        >
          {/* Video Thumbnail/Placeholder */}
          <div className="aspect-video bg-gradient-to-br from-primary-700 to-primary-900 relative">
            {!isPlaying ? (
              <>
                {/* Thumbnail overlay */}
                <div className="absolute inset-0 bg-charcoal-900/30" />

                {/* Play button */}
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center group/play"
                  aria-label="Play video"
                >
                  <div className="relative">
                    {/* Animated rings */}
                    <div className="absolute inset-0 rounded-full bg-accent-400/20 animate-ping" />
                    <div className="absolute -inset-4 rounded-full bg-accent-400/10 animate-pulse" />

                    {/* Play button circle */}
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-accent-400
                                  shadow-lg shadow-accent-500/30 transition-all duration-300
                                  group-hover/play:scale-110 group-hover/play:bg-accent-300">
                      <Play className="h-8 w-8 text-primary-900 ml-1" fill="currentColor" />
                    </div>
                  </div>
                </button>

                {/* Video duration badge */}
                <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-charcoal-900/70 text-cream-100 text-sm">
                  1:30
                </div>
              </>
            ) : (
              /* Actual video embed - replace with real video URL */
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
          {stats.map((stat, index) => {
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
```

**Step 2: Run TypeScript check**

Run: `cd clubvantage/apps/marketing && pnpm exec tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add apps/marketing/src/components/home/video-section.tsx
git commit -m "$(cat <<'EOF'
feat(marketing): add video section component

- Video player with animated play button
- Stats display (founding spots, members joined, roadmap length)
- Decorative corner accents matching design system

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Create "What's Ready Now" Section

**Files:**
- Create: `apps/marketing/src/components/home/ready-now-section.tsx`

**Step 1: Create the component**

```tsx
import Link from 'next/link';
import {
  Users,
  Receipt,
  Trophy,
  CalendarDays,
  ShoppingBag,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const builtModules = [
  {
    icon: Users,
    title: 'Members',
    description: 'Complete member lifecycle management',
    features: [
      'Member profiles with full history',
      'Application workflow with approvals',
      'Dependent and corporate management',
    ],
    href: '/features/membership',
  },
  {
    icon: Receipt,
    title: 'Billing',
    description: 'Invoicing, payments, tax compliance',
    features: [
      'Automated invoice generation',
      'Multiple payment gateways',
      'Tax compliance (VAT, GST, SST)',
    ],
    href: '/features/billing',
  },
  {
    icon: Trophy,
    title: 'Golf',
    description: 'Visual tee sheet, caddies, carts',
    features: [
      'Drag-and-drop tee sheet',
      'Caddie & cart assignment',
      'Course configuration',
    ],
    href: '/features/golf',
  },
  {
    icon: CalendarDays,
    title: 'Facility Booking',
    description: 'Courts, rooms, services',
    features: [
      'Real-time availability',
      'Recurring bookings',
      'Waitlist management',
    ],
    href: '/features/booking',
  },
  {
    icon: ShoppingBag,
    title: 'POS',
    description: 'Pro shop and retail operations',
    features: [
      'Fast checkout with scanning',
      'Inventory management',
      'Member account charging',
    ],
    href: '/features/retail',
  },
];

export function ReadyNowSection() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="container">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
            Built
          </span>
        </div>
        <h2 className="font-serif text-h1 text-charcoal-800 max-w-2xl">
          What&apos;s Ready Now
        </h2>
        <p className="mt-4 text-body-lg text-charcoal-500 max-w-2xl">
          These modules are complete and ready for founding members at launch.
        </p>

        {/* Module Cards Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {builtModules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.title}
                href={module.href}
                className="group relative p-6 bg-cream-50 rounded-2xl border border-cream-300
                         hover:border-emerald-200 hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Built badge */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    Built
                  </span>
                </div>

                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl
                              bg-primary-100 group-hover:bg-primary-500 transition-colors duration-300">
                  <Icon className="h-6 w-6 text-primary-600 group-hover:text-white transition-colors duration-300" />
                </div>

                {/* Content */}
                <h3 className="mt-4 text-lg font-semibold text-charcoal-800 group-hover:text-primary-600 transition-colors">
                  {module.title}
                </h3>
                <p className="mt-1 text-sm text-charcoal-500">
                  {module.description}
                </p>

                {/* Feature list */}
                <ul className="mt-4 space-y-2">
                  {module.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs text-charcoal-600">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Learn more link */}
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary-600
                              group-hover:text-primary-500 transition-colors">
                  Learn more
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Run TypeScript check**

Run: `cd clubvantage/apps/marketing && pnpm exec tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add apps/marketing/src/components/home/ready-now-section.tsx
git commit -m "$(cat <<'EOF'
feat(marketing): add 'What's Ready Now' section

- 5 module cards with 'Built' badges
- Feature lists for each module
- Hover states and animations

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Create "Coming Soon" Section

**Files:**
- Create: `apps/marketing/src/components/home/coming-soon-section.tsx`

**Step 1: Create the component**

```tsx
import Link from 'next/link';
import {
  Smartphone,
  Sparkles,
  Megaphone,
  ArrowRight,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const comingSoonModules = [
  {
    icon: Smartphone,
    title: 'Member Portal',
    description: 'Mobile-first self-service',
    eta: 'Q3 2026',
    features: [
      'PWA for iOS & Android',
      'Book, pay, manage accounts',
      'Family account access',
    ],
    href: '/features/portal',
  },
  {
    icon: Sparkles,
    title: 'Aura AI',
    description: 'Intelligent assistant',
    eta: 'Q3 2026',
    features: [
      '24/7 member support',
      'Natural language booking',
      'Operational insights',
    ],
    href: '/features/aura',
  },
  {
    icon: Megaphone,
    title: 'AI Marketing',
    description: 'Engagement & acquisition',
    eta: 'Q4 2026',
    features: [
      'Automated campaigns',
      'AI ad creation',
      'ROI optimization',
    ],
    href: '/features/marketing',
  },
];

export function ComingSoonSection() {
  return (
    <section className="py-20 md:py-28 bg-cream-200/50">
      <div className="container">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
            In Development
          </span>
        </div>
        <h2 className="font-serif text-h1 text-charcoal-800 max-w-2xl">
          Coming Soon
        </h2>
        <p className="mt-4 text-body-lg text-charcoal-500 max-w-2xl">
          These features are actively being built. Join as a founding member to influence priorities.
        </p>

        {/* Module Cards Grid */}
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {comingSoonModules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.title}
                href={module.href}
                className="group relative p-8 bg-white rounded-2xl border-2 border-dashed border-amber-200
                         hover:border-amber-300 hover:shadow-lg transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* ETA badge */}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                    <Clock className="h-3 w-3" />
                    {module.eta}
                  </span>
                </div>

                {/* Icon */}
                <div className="flex h-14 w-14 items-center justify-center rounded-xl
                              bg-amber-100 group-hover:bg-amber-500 transition-colors duration-300">
                  <Icon className="h-7 w-7 text-amber-600 group-hover:text-white transition-colors duration-300" />
                </div>

                {/* Content */}
                <h3 className="mt-6 text-xl font-semibold text-charcoal-800 group-hover:text-amber-600 transition-colors">
                  {module.title}
                </h3>
                <p className="mt-2 text-charcoal-500">
                  {module.description}
                </p>

                {/* Feature list */}
                <ul className="mt-6 space-y-3">
                  {module.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-charcoal-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0 mt-2" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Learn more link */}
                <div className="mt-6 flex items-center gap-1 text-sm font-medium text-amber-600
                              group-hover:text-amber-500 transition-colors">
                  Learn more
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

**Step 2: Run TypeScript check**

Run: `cd clubvantage/apps/marketing && pnpm exec tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add apps/marketing/src/components/home/coming-soon-section.tsx
git commit -m "$(cat <<'EOF'
feat(marketing): add 'Coming Soon' section

- 3 module cards with 'In Development' badges and ETA
- Dashed border style to differentiate from built features
- Amber color scheme for in-progress status

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Create "Shape What's Next" Roadmap Preview Section

**Files:**
- Create: `apps/marketing/src/components/home/roadmap-preview-section.tsx`

**Step 1: Create the component**

```tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronUp, Vote, ArrowRight, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

const topFeatures = [
  {
    id: '1',
    title: 'Member Mobile App (iOS & Android)',
    description: 'Native mobile apps for members to book, pay, and access their member card.',
    votes: 89,
    category: 'Portal',
  },
  {
    id: '2',
    title: 'Tournament Management',
    description: 'Full tournament setup with brackets, scoring, leaderboards, and prizes.',
    votes: 52,
    category: 'Golf',
  },
  {
    id: '3',
    title: 'AI Marketing Agency - Engagement',
    description: 'AI-powered campaigns for member engagement and retention.',
    votes: 68,
    category: 'Marketing',
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
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-400/20">
              <Vote className="h-5 w-5 text-accent-400" />
            </div>
          </div>
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
```

**Step 2: Run TypeScript check**

Run: `cd clubvantage/apps/marketing && pnpm exec tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add apps/marketing/src/components/home/roadmap-preview-section.tsx
git commit -m "$(cat <<'EOF'
feat(marketing): add roadmap preview section

- Top 3 most-voted features displayed
- Interactive voting buttons (demo mode)
- CTA to full roadmap page

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Create Final CTA Section with Inline Waitlist Form

**Files:**
- Create: `apps/marketing/src/components/home/final-cta-section.tsx`

**Step 1: Create the component**

```tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-cream-100/10 border-cream-100/20 text-cream-50 placeholder:text-cream-300
                           focus:border-accent-400 focus:ring-accent-400"
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
```

**Step 2: Run TypeScript check**

Run: `cd clubvantage/apps/marketing && pnpm exec tsc --noEmit`
Expected: No errors

**Step 3: Commit**

```bash
git add apps/marketing/src/components/home/final-cta-section.tsx
git commit -m "$(cat <<'EOF'
feat(marketing): add final CTA section with inline form

- Social proof counter
- Inline email capture form
- Success state with confirmation
- Link to full waitlist form

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Update Homepage to Use New Sections

**Files:**
- Modify: `apps/marketing/src/app/page.tsx`

**Step 1: Update the homepage imports and structure**

```tsx
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { EarlyAccessHero } from '@/components/home/early-access-hero';
import { VideoSection } from '@/components/home/video-section';
import { ReadyNowSection } from '@/components/home/ready-now-section';
import { ComingSoonSection } from '@/components/home/coming-soon-section';
import { RoadmapPreviewSection } from '@/components/home/roadmap-preview-section';
import { FinalCtaSection } from '@/components/home/final-cta-section';

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <EarlyAccessHero />
        <VideoSection />
        <ReadyNowSection />
        <ComingSoonSection />
        <RoadmapPreviewSection />
        <FinalCtaSection />
      </main>
      <Footer />
    </>
  );
}
```

**Step 2: Run dev server and verify**

Run: `cd clubvantage && pnpm dev --filter marketing`
Expected: Homepage displays all new sections in correct order

**Step 3: Commit**

```bash
git add apps/marketing/src/app/page.tsx
git commit -m "$(cat <<'EOF'
feat(marketing): update homepage with new section structure

- Hero → Video → Ready Now → Coming Soon → Roadmap Preview → Final CTA
- Remove old BenefitsSection and ModulesSection from homepage

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 2: Waitlist Page Redesign

### Task 8: Simplify Waitlist Form to 5 Fields

**Files:**
- Modify: `apps/marketing/src/app/waitlist/page.tsx`

**Step 1: Update form data interface**

```tsx
// Replace the FormData interface at ~line 61-71
interface FormData {
  name: string;
  email: string;
  clubName: string;
  country: string;
  clubType: string;
}
```

**Step 2: Update initial state**

```tsx
// Replace the useState at ~line 74-84
const [formData, setFormData] = React.useState<FormData>({
  name: '',
  email: '',
  clubName: '',
  country: '',
  clubType: '',
});
```

**Step 3: Update country options**

```tsx
// Add countries array after clubTypes
const countries = [
  { id: 'thailand', label: 'Thailand' },
  { id: 'singapore', label: 'Singapore' },
  { id: 'malaysia', label: 'Malaysia' },
  { id: 'hongkong', label: 'Hong Kong' },
  { id: 'indonesia', label: 'Indonesia' },
  { id: 'philippines', label: 'Philippines' },
  { id: 'other', label: 'Other' },
];
```

**Step 4: Update club types to include major types**

```tsx
// Update clubTypes array
const clubTypes = [
  { id: 'golf', label: 'Golf Club' },
  { id: 'country', label: 'Country Club' },
  { id: 'fitness', label: 'Fitness Center' },
  { id: 'sports', label: 'Sports Club' },
  { id: 'other', label: 'Other' },
];
```

**Step 5: Simplify form validation**

```tsx
// Update validateForm function
const validateForm = () => {
  const newErrors: Record<string, string> = {};
  if (!formData.name.trim()) newErrors.name = 'Required';
  if (!formData.email.trim()) newErrors.email = 'Required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    newErrors.email = 'Invalid email';
  }
  if (!formData.clubName.trim()) newErrors.clubName = 'Required';
  if (!formData.country) newErrors.country = 'Please select a country';
  if (!formData.clubType) newErrors.clubType = 'Please select a club type';
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

**Step 6: Simplify form JSX to 5 fields**

Replace the form content (~lines 247-417) with:

```tsx
<form onSubmit={handleSubmit} className="mt-8 space-y-6">
  {/* Name */}
  <Input
    label="Your Name"
    name="name"
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    error={errors.name}
    required
  />

  {/* Email */}
  <Input
    label="Email"
    name="email"
    type="email"
    value={formData.email}
    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
    error={errors.email}
    required
  />

  {/* Club Name */}
  <Input
    label="Club Name"
    name="clubName"
    value={formData.clubName}
    onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
    error={errors.clubName}
    required
  />

  {/* Country Dropdown */}
  <div>
    <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
      Country <span className="text-red-500">*</span>
    </label>
    <select
      value={formData.country}
      onChange={(e) => {
        setFormData({ ...formData, country: e.target.value });
        if (errors.country) setErrors({ ...errors, country: '' });
      }}
      className="flex h-12 w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-base
               text-charcoal-700 hover:border-cream-400 transition-colors
               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
    >
      <option value="">Select country...</option>
      {countries.map((c) => (
        <option key={c.id} value={c.id}>{c.label}</option>
      ))}
    </select>
    {errors.country && (
      <p className="mt-2 text-sm text-red-500">{errors.country}</p>
    )}
  </div>

  {/* Club Type Dropdown */}
  <div>
    <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
      Club Type <span className="text-red-500">*</span>
    </label>
    <select
      value={formData.clubType}
      onChange={(e) => {
        setFormData({ ...formData, clubType: e.target.value });
        if (errors.clubType) setErrors({ ...errors, clubType: '' });
      }}
      className="flex h-12 w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-base
               text-charcoal-700 hover:border-cream-400 transition-colors
               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
    >
      <option value="">Select club type...</option>
      {clubTypes.map((c) => (
        <option key={c.id} value={c.id}>{c.label}</option>
      ))}
    </select>
    {errors.clubType && (
      <p className="mt-2 text-sm text-red-500">{errors.clubType}</p>
    )}
  </div>

  <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
    Join the Waitlist
  </Button>

  <p className="text-xs text-center text-charcoal-400">
    By joining, you agree to receive updates about ClubVantage.
    Unsubscribe anytime.
  </p>
</form>
```

**Step 7: Update hero section copy**

```tsx
// Update hero section text at ~lines 212-226
<section className="bg-primary-800 py-16 md:py-20">
  <div className="container">
    <div className="mx-auto max-w-3xl text-center">
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-400/20 text-accent-400 text-sm font-medium mb-4">
        Founding Members
      </span>
      <h1 className="mt-4 font-serif text-h1 text-cream-50">
        Join the Future of Club Management
      </h1>
      <p className="mt-4 text-body-lg text-cream-100">
        Be among the first to experience ClubVantage. Founding members get lifetime pricing + shape the product.
      </p>
    </div>
  </div>
</section>
```

**Step 8: Update benefits sidebar**

```tsx
// Update founderBenefits array at ~lines 33-59
const founderBenefits = [
  {
    icon: Gift,
    title: 'Lifetime Founder Pricing',
    description: 'Lock in exclusive pricing forever',
  },
  {
    icon: Vote,
    title: 'Vote on Roadmap',
    description: 'Influence what we build next',
  },
  {
    icon: Zap,
    title: 'Early Access',
    description: 'Try features before public launch',
  },
  {
    icon: Users,
    title: 'Direct Line',
    description: 'Connect directly with our team',
  },
];
```

**Step 9: Run dev server and verify**

Run: `cd clubvantage && pnpm dev --filter marketing`
Expected: Waitlist page shows simplified 5-field form

**Step 10: Commit**

```bash
git add apps/marketing/src/app/waitlist/page.tsx
git commit -m "$(cat <<'EOF'
feat(marketing): simplify waitlist form to 5 fields

- Name, Email, Club Name, Country, Club Type
- Add countries: TH, SG, MY, HK, ID, PH, Other
- Update club types to major categories
- Update hero copy and benefits sidebar

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 3: About Page Redesign

### Task 9: Update About Page with Founder Story

**Files:**
- Modify: `apps/marketing/src/app/about/page.tsx`

**Step 1: Update milestones to reflect actual timeline**

```tsx
// Replace milestones array at ~lines 20-46
const milestones = [
  {
    year: '1999',
    title: 'The Beginning',
    description: 'Started implementing club management systems for golf courses in Thailand.',
  },
  {
    year: '2005',
    title: 'Regional Expansion',
    description: 'Extended services to Singapore, Malaysia, and Hong Kong.',
  },
  {
    year: '2015',
    title: 'Southeast Asia Coverage',
    description: 'Expanded to Indonesia and Philippines, serving 150+ clubs.',
  },
  {
    year: 'Dec 2025',
    title: 'ClubVantage Founded',
    description: 'Started fresh with AI-first architecture, built on 25 years of experience.',
  },
  {
    year: 'Q3 2026',
    title: 'MVP Launch',
    description: 'First release to founding members.',
  },
];
```

**Step 2: Update stats**

```tsx
// Update stats array at ~lines 71-76
const stats = [
  { value: '25+', label: 'Years Experience' },
  { value: '150+', label: 'Clubs Served' },
  { value: '500K+', label: 'Members Managed' },
  { value: '6', label: 'Countries' },
];
```

**Step 3: Update hero headline**

```tsx
// Update hero section at ~lines 134-139
<h1 className="font-serif text-display text-cream-50 leading-tight opacity-0 animate-fade-up fill-forwards delay-1">
  25 Years of Club Expertise,
  <br />
  <span className="text-accent-300">Rebuilt for the AI Era</span>
</h1>
```

**Step 4: Update the story section content**

```tsx
// Update story section text at ~lines 205-221
<div className="mt-8 space-y-6 text-body-lg text-charcoal-600 leading-relaxed">
  <p>
    In 1999, we wrote our first line of code for a golf club in Thailand.
    Back then, most clubs were running on paper ledgers and spreadsheets.
    We saw an opportunity to bring modern technology to an industry steeped in tradition.
  </p>
  <p>
    Over the next 25 years, we built systems for over 150 clubs across Southeast Asia—Thailand,
    Singapore, Malaysia, Hong Kong, Indonesia, and the Philippines. Each implementation
    taught us something new about what clubs truly need.
  </p>
  <p>
    After 25 years, we knew exactly what clubs need—and what legacy systems can&apos;t deliver.
    In late 2025, we started fresh: AI-first architecture, modern design, built on decades
    of experience. Now we&apos;re looking for founding members to build it with us.
  </p>
</div>
```

**Step 5: Run dev server and verify**

Run: `cd clubvantage && pnpm dev --filter marketing`
Expected: About page reflects updated founder story

**Step 6: Commit**

```bash
git add apps/marketing/src/app/about/page.tsx
git commit -m "$(cat <<'EOF'
feat(marketing): update about page with founder's story

- Update milestones to reflect 1999-2025 legacy + ClubVantage founding
- Add 6 countries to stats (TH, SG, MY, HK, ID, PH)
- Update hero headline: '25 Years of Club Expertise, Rebuilt for the AI Era'
- Update story content with ClubVantage narrative

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 4: Roadmap Page Updates

### Task 10: Update Roadmap Timeline to 2.5 Years (Hybrid Format)

**Files:**
- Modify: `apps/marketing/src/app/roadmap/page.tsx`

**Step 1: Update timeline to hybrid format (near-term quarters, far-term years)**

```tsx
// Replace timeline array at ~lines 44-93
const timeline: TimelineQuarter[] = [
  {
    quarter: 'Now',
    label: 'Foundation (Built)',
    isCurrent: true,
    features: [
      'Member Management & Directory',
      'Billing & Invoicing',
      'Golf Tee Sheet',
      'Facility Booking',
      'POS & Retail',
    ],
  },
  {
    quarter: 'Q3 2026',
    label: 'Launch',
    features: [
      'Member Portal (PWA)',
      'Aura AI Assistant (Basic)',
      'Mobile Apps (iOS & Android)',
    ],
  },
  {
    quarter: 'Q4 2026',
    label: 'Engagement',
    features: [
      'AI Marketing - Engagement',
      'Advanced Reporting',
      'WhatsApp Notifications',
    ],
  },
  {
    quarter: '2027',
    label: 'Intelligence',
    features: [
      'AI Marketing - Acquisition',
      'Predictive Analytics',
      'Handicap Integration',
      'Tournament Management',
    ],
  },
  {
    quarter: '2028',
    label: 'Ecosystem',
    features: [
      'Public API',
      'Integration Marketplace',
      'Multi-location Support',
      'White-label Option',
    ],
  },
];
```

**Step 2: Update feature statuses to match new timeline**

Update features in `initialFeatures` array to have correct statuses:
- Built features: `status: 'completed'`
- Q3 2026 features: `status: 'in-progress'`, `eta: 'Q3 2026'`
- Q4 2026 features: `status: 'planned'`, `eta: 'Q4 2026'`
- 2027+ features: `status: 'considering'`, `eta: '2027'` or `eta: '2028'`

**Step 3: Update status badges to match design spec**

```tsx
// Add new status for 'Built'
const statusConfig: Record<FeatureStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  completed: { label: 'Built', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  'in-progress': { label: 'In Development', color: 'bg-amber-100 text-amber-700', icon: Rocket },
  planned: { label: 'Coming Q4 2026', color: 'bg-blue-100 text-blue-700', icon: Clock },
  considering: { label: 'Coming 2027+', color: 'bg-gray-100 text-gray-600', icon: Lightbulb },
};
```

**Step 4: Run dev server and verify**

Run: `cd clubvantage && pnpm dev --filter marketing`
Expected: Roadmap shows updated 2.5-year timeline

**Step 5: Commit**

```bash
git add apps/marketing/src/app/roadmap/page.tsx
git commit -m "$(cat <<'EOF'
feat(marketing): update roadmap to 2.5-year hybrid timeline

- Now (Built) → Q3 2026 → Q4 2026 → 2027 → 2028
- Update feature statuses and ETAs
- Update status badge colors per design spec

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 5: Global Updates

### Task 11: Update All Feature Pages with Status Badges

**Files:**
- Modify: `apps/marketing/src/app/features/membership/page.tsx`
- Modify: `apps/marketing/src/app/features/billing/page.tsx`
- Modify: `apps/marketing/src/app/features/booking/page.tsx`
- Modify: `apps/marketing/src/app/features/golf/page.tsx`
- Modify: `apps/marketing/src/app/features/portal/page.tsx`
- Modify: `apps/marketing/src/app/features/aura/page.tsx`
- Modify: `apps/marketing/src/app/features/retail/page.tsx`
- Modify: `apps/marketing/src/app/features/marketing/page.tsx`

**Step 1: Add status badge component pattern**

For each feature page, add a status badge in the hero section. Built features get green badge, Coming Soon get amber.

Example for a "Built" feature (membership, billing, golf, booking, retail):
```tsx
{/* Add after the icon in hero section */}
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
  <CheckCircle2 className="h-4 w-4" />
  Built
</span>
```

Example for "Coming Soon" feature (portal, aura, marketing):
```tsx
{/* Add after the icon in hero section */}
<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
  <Clock className="h-4 w-4" />
  Coming Q3 2026
</span>
```

**Step 2: Update CTAs from "Request Demo" to "Join Waitlist"**

For each feature page, find and replace CTA buttons:
- `"Request Demo"` → `"Join Waitlist"`
- `"Schedule a Demo"` → `"Join Waitlist"`
- `"See It In Action"` → `"Join Waitlist"`
- `href="/demo"` → `href="/waitlist"`
- `"View Pricing"` → `"Join for Founder Pricing"` and `href="/pricing"` → `href="/waitlist"`

**Step 3: Run dev server and verify each page**

Run: `cd clubvantage && pnpm dev --filter marketing`
Expected: All feature pages show correct status badges and updated CTAs

**Step 4: Commit**

```bash
git add apps/marketing/src/app/features/
git commit -m "$(cat <<'EOF'
feat(marketing): add status badges and update CTAs on all feature pages

- Built badge (green): membership, billing, golf, booking, retail
- Coming Soon badge (amber): portal, aura, marketing
- Update all CTAs to point to /waitlist

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: Update Header Navigation CTAs

**Files:**
- Modify: `apps/marketing/src/components/layout/header.tsx`

**Step 1: Verify header already uses "Join Waitlist" CTA**

The header at line ~88 already shows "Join Waitlist" - no changes needed.

**Step 2: Commit (skip if no changes)**

No commit needed if header is already correct.

---

### Task 13: Update Footer with Founding Member Count

**Files:**
- Modify: `apps/marketing/src/components/layout/footer.tsx`

**Step 1: Read footer file**

**Step 2: Add founding member tagline to footer**

```tsx
{/* Add before the copyright notice */}
<div className="text-center py-4 border-t border-cream-300/50">
  <p className="text-sm text-charcoal-500">
    Join <span className="font-semibold text-primary-600">12</span> founding members shaping the future of club management
  </p>
</div>
```

**Step 3: Run dev server and verify**

Run: `cd clubvantage && pnpm dev --filter marketing`
Expected: Footer shows founding member count

**Step 4: Commit**

```bash
git add apps/marketing/src/components/layout/footer.tsx
git commit -m "$(cat <<'EOF'
feat(marketing): add founding member count to footer

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 14: Set Up Redirect from /demo to /waitlist

**Files:**
- Create: `apps/marketing/src/app/demo/page.tsx`

**Step 1: Create redirect page**

```tsx
import { redirect } from 'next/navigation';

export default function DemoPage() {
  redirect('/waitlist');
}
```

**Step 2: Commit**

```bash
git add apps/marketing/src/app/demo/page.tsx
git commit -m "$(cat <<'EOF'
feat(marketing): redirect /demo to /waitlist

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 15: Remove or Redirect Pricing Page

**Files:**
- Modify: `apps/marketing/src/app/pricing/page.tsx` (if exists)

**Step 1: Check if pricing page exists**

Run: `ls apps/marketing/src/app/pricing/`

**Step 2: If exists, convert to redirect**

```tsx
import { redirect } from 'next/navigation';

export default function PricingPage() {
  redirect('/waitlist');
}
```

**Step 3: Commit**

```bash
git add apps/marketing/src/app/pricing/
git commit -m "$(cat <<'EOF'
feat(marketing): redirect /pricing to /waitlist

Founder pricing messaging replaces public pricing page

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Phase 6: Final Verification

### Task 16: Full Site Verification

**Step 1: Start dev server**

Run: `cd clubvantage && pnpm dev --filter marketing`

**Step 2: Manual verification checklist**

- [ ] Homepage: Hero with updated copy
- [ ] Homepage: Video section with play button
- [ ] Homepage: "What's Ready Now" section with 5 modules
- [ ] Homepage: "Coming Soon" section with 3 modules
- [ ] Homepage: Roadmap preview with voting
- [ ] Homepage: Final CTA with inline form
- [ ] Waitlist: Simplified 5-field form
- [ ] Waitlist: Updated benefits sidebar
- [ ] About: Updated founder story and milestones
- [ ] About: 6 countries in stats
- [ ] Roadmap: 2.5-year hybrid timeline
- [ ] Roadmap: Updated feature statuses
- [ ] Features pages: Status badges on all 8 pages
- [ ] Features pages: CTAs point to /waitlist
- [ ] /demo redirects to /waitlist
- [ ] /pricing redirects to /waitlist
- [ ] Footer: Founding member count

**Step 3: Run TypeScript check**

Run: `cd clubvantage/apps/marketing && pnpm exec tsc --noEmit`
Expected: No errors

**Step 4: Run lint**

Run: `cd clubvantage/apps/marketing && pnpm lint`
Expected: No errors

**Step 5: Final commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
chore(marketing): complete marketing site redesign

Phase 1-6 implementation complete:
- Homepage with new section structure
- Waitlist page with simplified form
- About page with founder's story
- Roadmap with 2.5-year timeline
- All feature pages with status badges
- Global CTA updates to waitlist focus

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Success Metrics

After implementation, track:
- Waitlist signups (target: 50 founding members)
- Signup conversion rate (target: 10%+ of visitors)
- Country/club type distribution
- Roadmap votes per feature

---

**Document Status:** Ready for implementation
