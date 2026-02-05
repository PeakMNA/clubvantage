'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Users, Lightbulb, Gift, Zap, Vote, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const countries = [
  { id: 'thailand', label: 'Thailand' },
  { id: 'singapore', label: 'Singapore' },
  { id: 'malaysia', label: 'Malaysia' },
  { id: 'hongkong', label: 'Hong Kong' },
  { id: 'indonesia', label: 'Indonesia' },
  { id: 'philippines', label: 'Philippines' },
  { id: 'other', label: 'Other' },
];

const clubTypes = [
  { id: 'golf', label: 'Golf Club' },
  { id: 'country', label: 'Country Club' },
  { id: 'fitness', label: 'Fitness Center' },
  { id: 'sports', label: 'Sports Club' },
  { id: 'other', label: 'Other' },
];

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

interface FormData {
  name: string;
  email: string;
  clubName: string;
  country: string;
  clubType: string;
}

export default function WaitlistPage() {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setWaitlistPosition(Math.floor(Math.random() * 20) + 13); // Mock position
    setIsSubmitted(true);
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
                  You&apos;re on the list!
                </h1>
                <p className="mt-4 text-body-lg text-charcoal-500">
                  Welcome to the ClubVantage founding member community.
                </p>

                <div className="mt-8 rounded-2xl bg-white border border-cream-300 p-8 shadow-sm">
                  <p className="text-sm text-charcoal-500">Your waitlist position</p>
                  <p className="mt-2 font-serif text-5xl font-bold text-primary-500">
                    #{waitlistPosition}
                  </p>
                  <p className="mt-4 text-charcoal-500">
                    We&apos;ll be in touch soon with early access details.
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                  <h3 className="font-serif font-semibold text-charcoal-800">What happens next?</h3>
                  <div className="text-left space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-600">
                        1
                      </div>
                      <p className="text-charcoal-500">
                        Check your email for a confirmation and community invite
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-600">
                        2
                      </div>
                      <p className="text-charcoal-500">
                        Join our private Slack to connect with other founding members
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-medium text-primary-600">
                        3
                      </div>
                      <p className="text-charcoal-500">
                        Vote on features and help shape our roadmap
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild>
                    <Link href="/roadmap">
                      View & Vote on Roadmap
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href="/">Back to Home</Link>
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
                  Limited spots available
                </div>

                <h2 className="font-serif text-2xl text-charcoal-800">Apply for Early Access</h2>
                <p className="mt-2 text-charcoal-500">
                  Tell us about your club so we can prioritize your needs.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <Input
                    label="Your Name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    error={errors.name}
                    required
                  />

                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                    required
                  />

                  <Input
                    label="Club Name"
                    name="clubName"
                    value={formData.clubName}
                    onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
                    error={errors.clubName}
                    required
                  />

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
              </div>

              {/* Benefits Column */}
              <div className="lg:pl-8">
                <div className="sticky top-24">
                  <div className="rounded-2xl bg-primary-800 p-8 text-cream-50">
                    <h2 className="font-serif text-2xl">Founding Member Benefits</h2>
                    <p className="mt-2 text-cream-200">
                      Early supporters get exclusive perks
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
                      <p className="text-sm text-cream-200">Current waitlist</p>
                      <p className="mt-1 font-serif text-3xl font-bold text-accent-400">12 / 50</p>
                      <p className="mt-1 text-sm text-cream-200">founding spots</p>
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
