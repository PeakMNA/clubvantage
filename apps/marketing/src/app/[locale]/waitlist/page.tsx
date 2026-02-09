'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Users, Lightbulb, Gift, Zap, Vote, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { submitWaitlist, getWaitlistCount } from '@/app/actions/waitlist';

interface FormData {
  name: string;
  email: string;
  clubName: string;
  country: string;
  clubType: string;
}

export default function WaitlistPage() {
  const t = useTranslations('waitlist');
  const tCommon = useTranslations('common');
  const tCountries = useTranslations('countries');
  const tClubTypes = useTranslations('clubTypes');

  const countries = [
    { id: 'thailand', label: tCountries('thailand') },
    { id: 'singapore', label: tCountries('singapore') },
    { id: 'malaysia', label: tCountries('malaysia') },
    { id: 'hongkong', label: tCountries('hongkong') },
    { id: 'indonesia', label: tCountries('indonesia') },
    { id: 'philippines', label: tCountries('philippines') },
    { id: 'other', label: tCountries('other') },
  ];

  const clubTypes = [
    { id: 'golf', label: tClubTypes('golf') },
    { id: 'country', label: tClubTypes('country') },
    { id: 'fitness', label: tClubTypes('fitness') },
    { id: 'sports', label: tClubTypes('sports') },
    { id: 'other', label: tClubTypes('other') },
  ];

  const founderBenefits = [
    {
      icon: Gift,
      title: t('lifetimeFounderPricing'),
      description: t('lockInPricing'),
    },
    {
      icon: Vote,
      title: t('voteOnRoadmap'),
      description: t('influenceWhatWeBuild'),
    },
    {
      icon: Zap,
      title: t('earlyAccess'),
      description: t('tryFeatures'),
    },
    {
      icon: Users,
      title: t('directLine'),
      description: t('connectDirectly'),
    },
  ];

  const [formData, setFormData] = React.useState<FormData>({
    name: '',
    email: '',
    clubName: '',
    country: '',
    clubType: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [waitlistPosition, setWaitlistPosition] = React.useState(0);
  const [waitlistCount, setWaitlistCount] = React.useState(0);

  React.useEffect(() => {
    getWaitlistCount().then(setWaitlistCount);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = tCommon('required');
    if (!formData.email.trim()) newErrors.email = tCommon('required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = tCommon('invalidEmail');
    }
    if (!formData.clubName.trim()) newErrors.clubName = tCommon('required');
    if (!formData.country) newErrors.country = t('pleaseSelectCountry');
    if (!formData.clubType) newErrors.clubType = t('pleaseSelectClubType');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const result = await submitWaitlist({
        name: formData.name,
        email: formData.email,
        clubName: formData.clubName,
        country: formData.country,
        clubType: formData.clubType,
      });

      if (result.success && result.position) {
        setWaitlistPosition(result.position);
        setIsSubmitted(true);
      } else {
        setErrors({ email: result.error || tCommon('somethingWentWrong') });
      }
    } catch {
      setErrors({ email: tCommon('somethingWentWrong') });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <>
        <Header />
        <main className="pt-20">
          <section className="min-h-[calc(100vh-5rem)] flex items-center py-16 bg-cream-100">
            <div className="container">
              <div className="mx-auto max-w-2xl text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-500">
                  <Check className="h-10 w-10 text-cream-50" />
                </div>
                <h1 className="mt-8 font-serif text-h1 text-charcoal-800">
                  {t('youreOnTheList')}
                </h1>
                <p className="mt-4 text-body-lg text-charcoal-500">
                  {t('welcomeToFoundingMember')}
                </p>

                <div className="mt-8 rounded-2xl bg-white border border-cream-300 p-8 shadow-sm">
                  <p className="text-sm text-charcoal-500">{t('yourWaitlistPosition')}</p>
                  <p className="mt-2 font-serif text-5xl font-bold text-primary-500">
                    #{waitlistPosition}
                  </p>
                  <p className="mt-4 text-charcoal-500">
                    {t('weWillBeInTouch')}
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                  <h3 className="font-serif font-semibold text-charcoal-800">{t('whatHappensNext')}</h3>
                  <div className="text-left space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-600">
                        1
                      </div>
                      <p className="text-charcoal-500">
                        {t('step1')}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-600">
                        2
                      </div>
                      <p className="text-charcoal-500">
                        {t('step2')}
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-600">
                        3
                      </div>
                      <p className="text-charcoal-500">
                        {t('step3')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild>
                    <Link href="/roadmap">
                      {t('viewAndVoteOnRoadmap')}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href="/">{tCommon('backToHome')}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-primary-800 py-16 md:py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-400/20 text-accent-400 text-sm font-medium mb-4">
                {t('foundingMembers')}
              </span>
              <h1 className="mt-4 font-serif text-h1 text-cream-50">
                {t('heroTitle')}
              </h1>
              <p className="mt-4 text-body-lg text-cream-100">
                {t('heroSubtitle')}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-cream-100">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Form Column */}
              <div className="bg-white rounded-2xl border border-cream-300 p-8 shadow-sm">
                <div className="inline-flex items-center gap-2 rounded-full bg-accent-100 px-3 py-1 text-sm text-accent-700 mb-4">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
                  </span>
                  {t('limitedSpots')}
                </div>

                <h2 className="font-serif text-2xl text-charcoal-800">{t('applyForEarlyAccess')}</h2>
                <p className="mt-2 text-charcoal-500">
                  {t('tellUsAboutYourClub')}
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <Input
                    label={t('yourName')}
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                    required
                  />

                  <Input
                    label={t('email')}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                    required
                  />

                  <Input
                    label={t('clubName')}
                    name="clubName"
                    value={formData.clubName}
                    onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
                    error={errors.clubName}
                    required
                  />

                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                      {t('country')} <span className="text-red-500">*</span>
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
                      <option value="">{tCommon('selectCountry')}</option>
                      {countries.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                    {errors.country && (
                      <p className="mt-2 text-sm text-red-500">{errors.country}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                      {t('clubType')} <span className="text-red-500">*</span>
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
                      <option value="">{tCommon('selectClubType')}</option>
                      {clubTypes.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                    {errors.clubType && (
                      <p className="mt-2 text-sm text-red-500">{errors.clubType}</p>
                    )}
                  </div>

                  <Button type="submit" fullWidth size="lg" isLoading={isSubmitting}>
                    {tCommon('joinTheWaitlist')}
                  </Button>

                  <p className="text-xs text-center text-charcoal-400">
                    {t('byJoining')}
                  </p>
                </form>
              </div>

              {/* Benefits Column */}
              <div className="lg:pl-8">
                <div className="sticky top-24">
                  <div className="rounded-2xl bg-primary-800 p-8 text-cream-50">
                    <h2 className="font-serif text-2xl">{t('foundingMemberBenefits')}</h2>
                    <p className="mt-2 text-cream-200">
                      {t('earlySupporters')}
                    </p>

                    <div className="mt-8 space-y-6">
                      {founderBenefits.map((benefit) => {
                        const Icon = benefit.icon;
                        return (
                          <div key={benefit.title} className="flex gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cream-50/10">
                              <Icon className="h-5 w-5 text-accent-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-cream-50">{benefit.title}</h3>
                              <p className="mt-1 text-sm text-cream-200">
                                {benefit.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <hr className="my-8 border-cream-50/10" />

                    <div className="text-center">
                      <p className="text-sm text-cream-200">{t('currentWaitlist')}</p>
                      <p className="mt-1 font-serif text-3xl font-bold text-accent-400">{waitlistCount} / 50</p>
                      <p className="mt-1 text-sm text-cream-200">{t('foundingSpots')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
