'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Award,
  Users,
  Globe,
  Lightbulb,
  Target,
  Heart,
  Clock,
  CheckCircle2,
} from 'lucide-react';

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

const values = [
  {
    icon: Target,
    title: 'Purpose-Built',
    description: 'Every feature designed specifically for club operations, not generic business software adapted for clubs.',
  },
  {
    icon: Heart,
    title: 'Member-Centric',
    description: 'We believe exceptional member experiences are the foundation of thriving clubs.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'Continuously pushing boundaries with AI and automation while respecting tradition.',
  },
  {
    icon: Globe,
    title: 'Regional Expertise',
    description: 'Deep understanding of Southeast Asian business practices, compliance, and culture.',
  },
];

const stats = [
  { value: '25+', label: 'Years Experience' },
  { value: '150+', label: 'Clubs Served' },
  { value: '500K+', label: 'Members Managed' },
  { value: '6', label: 'Countries' },
];

export default function AboutPage() {
  const [isVisible, setIsVisible] = React.useState(false);
  const sectionRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden bg-primary-700">
          {/* Background elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-400/10 via-transparent to-transparent" />

          {/* Decorative pattern */}
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

          <div className="relative container">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 mb-8 opacity-0 animate-fade-up fill-forwards">
                <Clock className="h-4 w-4 text-accent-400" />
                <span className="text-label uppercase tracking-widest text-cream-100">
                  25+ Years of Excellence
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-serif text-display text-cream-50 leading-tight opacity-0 animate-fade-up fill-forwards delay-1">
                25 Years of Club Expertise,
                <br />
                <span className="text-accent-300">Rebuilt for the AI Era</span>
              </h1>

              {/* Description */}
              <p className="mt-8 text-body-xl text-cream-100 max-w-2xl leading-relaxed opacity-0 animate-fade-up fill-forwards delay-2">
                ClubVantage isn&apos;t built by software developers who read about clubs.
                It&apos;s built by professionals who&apos;ve spent over two decades in the trenches—understanding
                the unique challenges, workflows, and member expectations that make club management
                fundamentally different from any other business.
              </p>

              {/* CTA */}
              <div className="mt-10 opacity-0 animate-fade-up fill-forwards delay-3">
                <Button asChild size="lg" variant="accent" className="group">
                  <Link href="/contact">
                    Let&apos;s Talk
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Curved transition */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 80" className="w-full h-auto" preserveAspectRatio="none">
              <path d="M0,80 L0,40 Q720,0 1440,40 L1440,80 Z" fill="rgb(250 247 242)" />
            </svg>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-cream-100">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="text-center opacity-0 animate-fade-up fill-forwards"
                  style={{ animationDelay: `${400 + index * 100}ms` }}
                >
                  <div className="text-5xl font-serif font-medium text-primary-600 number-display">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-body-sm text-charcoal-500 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="section-padding bg-white">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Content */}
              <div>
                <span className="text-label uppercase tracking-widest text-accent-500">
                  Our Story
                </span>
                <h2 className="mt-4 font-serif text-h1 text-charcoal-800 leading-tight">
                  A Quarter Century of
                  <br />
                  <span className="text-primary-500">Club Innovation</span>
                </h2>
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
              </div>

              {/* Timeline */}
              <div className="relative pl-8 border-l-2 border-cream-300">
                {milestones.map((milestone, index) => (
                  <div
                    key={milestone.year}
                    className="relative pb-12 last:pb-0 group"
                  >
                    {/* Timeline dot */}
                    <div className="absolute -left-[calc(0.5rem+9px)] top-0 w-4 h-4 rounded-full bg-cream-100 border-2 border-primary-500 group-hover:bg-primary-500 transition-colors duration-300" />

                    {/* Content */}
                    <div className="pl-6">
                      <span className="text-accent-500 font-mono text-sm font-medium">
                        {milestone.year}
                      </span>
                      <h3 className="mt-1 text-xl font-semibold text-charcoal-800 group-hover:text-primary-600 transition-colors">
                        {milestone.title}
                      </h3>
                      <p className="mt-2 text-charcoal-500">
                        {milestone.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section ref={sectionRef} className="section-padding bg-cream-200/50">
          <div className="container">
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-label uppercase tracking-widest text-accent-500">
                What Drives Us
              </span>
              <h2 className="mt-4 font-serif text-h1 text-charcoal-800">
                Our Values
              </h2>
              <p className="mt-4 text-body-lg text-charcoal-500">
                The principles that guide every feature we build and every decision we make.
              </p>
            </div>

            {/* Values Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <div
                    key={value.title}
                    className={`group relative p-8 bg-white rounded-2xl border border-cream-300
                              hover:border-primary-200 hover:shadow-lg transition-all duration-500
                              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    {/* Icon */}
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl
                                  bg-primary-50 border border-primary-100
                                  group-hover:bg-primary-500 group-hover:border-primary-500
                                  transition-all duration-500">
                      <Icon className="h-6 w-6 text-primary-600 group-hover:text-white transition-colors duration-500" />
                    </div>

                    {/* Content */}
                    <h3 className="mt-6 text-xl font-semibold text-charcoal-800 group-hover:text-primary-600 transition-colors">
                      {value.title}
                    </h3>
                    <p className="mt-3 text-charcoal-500 leading-relaxed">
                      {value.description}
                    </p>

                    {/* Corner decoration */}
                    <div className="absolute top-4 right-4 w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-0 right-0 w-full h-px bg-accent-400/30" />
                      <div className="absolute top-0 right-0 w-px h-full bg-accent-400/30" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Expertise Section */}
        <section className="section-padding bg-white">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Visual */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary-100/50 to-accent-100/30 rounded-3xl" />
                <div className="relative bg-primary-700 rounded-2xl p-10 text-cream-50">
                  <Award className="h-12 w-12 text-accent-400 mb-6" />
                  <h3 className="font-serif text-3xl mb-4">
                    Domain Expertise
                    <br />
                    <span className="text-accent-300">You Can Trust</span>
                  </h3>
                  <ul className="space-y-4 mt-8">
                    {[
                      'Deep understanding of member lifecycle management',
                      'Expert knowledge of regional compliance requirements',
                      'Proven track record with prestigious clubs',
                      'Direct experience with operational challenges',
                      'Understanding of club culture and traditions',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-accent-400 shrink-0 mt-0.5" />
                        <span className="text-cream-100">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Content */}
              <div>
                <span className="text-label uppercase tracking-widest text-accent-500">
                  Why It Matters
                </span>
                <h2 className="mt-4 font-serif text-h1 text-charcoal-800 leading-tight">
                  Experience Makes
                  <br />
                  <span className="text-primary-500">The Difference</span>
                </h2>
                <div className="mt-8 space-y-6 text-body-lg text-charcoal-600 leading-relaxed">
                  <p>
                    When you work with ClubVantage, you&apos;re not explaining basic concepts
                    like member types, reciprocal arrangements, or seasonal billing cycles.
                    We already understand.
                  </p>
                  <p>
                    We know why a golf club&apos;s tee sheet is different from a simple
                    booking calendar. We understand the nuances of caddie management,
                    member statements, and corporate memberships. We&apos;ve solved these
                    problems hundreds of times.
                  </p>
                  <p>
                    This deep domain expertise means ClubVantage anticipates your needs
                    rather than requiring you to adapt to generic software limitations.
                  </p>
                </div>
                <div className="mt-10">
                  <Button asChild size="lg" className="group">
                    <Link href="/waitlist">
                      Join the Waitlist
                      <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary-700 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-accent-400/10 via-transparent to-transparent" />

          <div className="relative container text-center">
            <h2 className="font-serif text-h1 text-cream-50">
              Ready to Transform Your Club?
            </h2>
            <p className="mt-4 text-body-xl text-cream-100 max-w-2xl mx-auto">
              Join forward-thinking club managers who are shaping the future of club management.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" variant="accent" className="group">
                <Link href="/waitlist">
                  Join the Waitlist
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="border-cream-100/30 text-cream-50 hover:bg-cream-50/10">
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
