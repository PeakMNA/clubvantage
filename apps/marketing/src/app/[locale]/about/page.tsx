'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
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

export default function AboutPage() {
  const t = useTranslations('about');
  const tCommon = useTranslations('common');
  const tFinalCta = useTranslations('finalCta');

  const milestones = [
    {
      year: '1999',
      title: t('milestone1Title'),
      description: t('milestone1Desc'),
    },
    {
      year: '2005',
      title: t('milestone2Title'),
      description: t('milestone2Desc'),
    },
    {
      year: '2015',
      title: t('milestone3Title'),
      description: t('milestone3Desc'),
    },
    {
      year: 'Dec 2025',
      title: t('milestone4Title'),
      description: t('milestone4Desc'),
    },
    {
      year: 'Q3 2026',
      title: t('milestone5Title'),
      description: t('milestone5Desc'),
    },
  ];

  const values = [
    {
      icon: Target,
      title: t('purposeBuilt'),
      description: t('purposeBuiltDesc'),
    },
    {
      icon: Heart,
      title: t('memberCentric'),
      description: t('memberCentricDesc'),
    },
    {
      icon: Lightbulb,
      title: t('innovation'),
      description: t('innovationDesc'),
    },
    {
      icon: Globe,
      title: t('regionalExpertise'),
      description: t('regionalExpertiseDesc'),
    },
  ];

  const stats = [
    { value: '25+', label: t('yearsExperience') },
    { value: '150+', label: t('clubsServed') },
    { value: '500K+', label: t('membersManaged') },
    { value: '6', label: t('countries') },
  ];

  const expertiseList = [
    t('expertiseList1'),
    t('expertiseList2'),
    t('expertiseList3'),
    t('expertiseList4'),
    t('expertiseList5'),
  ];

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
                  {t('yearsOfExcellence')}
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-serif text-display text-cream-50 leading-tight opacity-0 animate-fade-up fill-forwards delay-1">
                {t('heroTitle1')}
                <br />
                <span className="text-accent-300">{t('heroTitle2')}</span>
              </h1>

              {/* Description */}
              <p className="mt-8 text-body-xl text-cream-100 max-w-2xl leading-relaxed opacity-0 animate-fade-up fill-forwards delay-2">
                {t('heroDescription')}
              </p>

              {/* CTA */}
              <div className="mt-10 opacity-0 animate-fade-up fill-forwards delay-3">
                <Button asChild size="lg" variant="accent" className="group">
                  <Link href="/contact">
                    {t('letsTalk')}
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
                  {t('ourStory')}
                </span>
                <h2 className="mt-4 font-serif text-h1 text-charcoal-800 leading-tight">
                  {t('storyTitle1')}
                  <br />
                  <span className="text-primary-500">{t('storyTitle2')}</span>
                </h2>
                <div className="mt-8 space-y-6 text-body-lg text-charcoal-600 leading-relaxed">
                  <p>{t('storyP1')}</p>
                  <p>{t('storyP2')}</p>
                  <p>{t('storyP3')}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative pl-8 border-l-2 border-cream-300">
                {milestones.map((milestone) => (
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
                {t('whatDrivesUs')}
              </span>
              <h2 className="mt-4 font-serif text-h1 text-charcoal-800">
                {t('ourValues')}
              </h2>
              <p className="mt-4 text-body-lg text-charcoal-500">
                {t('valuesSubtitle')}
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
                    {t('domainExpertise')}
                    <br />
                    <span className="text-accent-300">{t('youCanTrust')}</span>
                  </h3>
                  <ul className="space-y-4 mt-8">
                    {expertiseList.map((item) => (
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
                  {t('whyItMatters')}
                </span>
                <h2 className="mt-4 font-serif text-h1 text-charcoal-800 leading-tight">
                  {t('experienceMakes')}
                  <br />
                  <span className="text-primary-500">{t('theDifference')}</span>
                </h2>
                <div className="mt-8 space-y-6 text-body-lg text-charcoal-600 leading-relaxed">
                  <p>{t('expertiseP1')}</p>
                  <p>{t('expertiseP2')}</p>
                  <p>{t('expertiseP3')}</p>
                </div>
                <div className="mt-10">
                  <Button asChild size="lg" className="group">
                    <Link href="/waitlist">
                      {tCommon('joinTheWaitlist')}
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
              {tFinalCta('readyToTransform')}
            </h2>
            <p className="mt-4 text-body-xl text-cream-100 max-w-2xl mx-auto">
              {t('joinForwardThinking')}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" variant="accent" className="group">
                <Link href="/waitlist">
                  {tCommon('joinTheWaitlist')}
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary" className="border-cream-100/30 text-cream-50 hover:bg-cream-50/10">
                <Link href="/contact">
                  {tCommon('contactUs')}
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
