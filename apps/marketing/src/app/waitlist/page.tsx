'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Users, Lightbulb, Gift, Zap, Star, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const clubTypes = [
  { id: 'golf', label: 'Golf & Country Club', icon: '⛳' },
  { id: 'fitness', label: 'Fitness Center', icon: '🏋️' },
  { id: 'sports', label: 'Sports Club', icon: '🎾' },
  { id: 'social', label: 'Social Club', icon: '🏛️' },
  { id: 'other', label: 'Other', icon: '📍' },
];

const interestAreas = [
  { id: 'membership', label: 'Membership Management' },
  { id: 'billing', label: 'Billing & Payments' },
  { id: 'booking', label: 'Facility Booking' },
  { id: 'golf', label: 'Golf Operations' },
  { id: 'portal', label: 'Member Portal' },
  { id: 'ai', label: 'AI Assistant (Aura)' },
  { id: 'reporting', label: 'Reporting & Analytics' },
  { id: 'communication', label: 'Member Communication' },
];

const founderBenefits = [
  {
    icon: Gift,
    title: 'Lifetime Discount',
    description: 'Lock in 50% off our standard pricing forever',
  },
  {
    icon: Lightbulb,
    title: 'Feature Influence',
    description: 'Vote on features and shape our development roadmap',
  },
  {
    icon: Zap,
    title: 'Early Access',
    description: 'Try new features weeks before public release',
  },
  {
    icon: Users,
    title: 'Direct Line',
    description: 'Private Slack channel with our founding team',
  },
  {
    icon: Star,
    title: 'Founder Badge',
    description: 'Permanent recognition as a founding member',
  },
];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  clubName: string;
  clubType: string;
  memberCount: string;
  interests: string[];
  biggestChallenge: string;
  howHeard: string;
}

export default function WaitlistPage() {
  const [formData, setFormData] = React.useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    clubName: '',
    clubType: '',
    memberCount: '',
    interests: [],
    biggestChallenge: '',
    howHeard: '',
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [waitlistPosition, setWaitlistPosition] = React.useState(0);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Required';
    if (!formData.email.trim()) newErrors.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }
    if (!formData.clubName.trim()) newErrors.clubName = 'Required';
    if (!formData.clubType) newErrors.clubType = 'Please select a club type';
    if (formData.interests.length === 0) newErrors.interests = 'Select at least one area';
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

  const toggleInterest = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(id)
        ? prev.interests.filter((i) => i !== id)
        : [...prev.interests, id],
    }));
    if (errors.interests) {
      setErrors((prev) => ({ ...prev, interests: '' }));
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
              <span className="text-label uppercase tracking-widest text-accent-400">
                Founding Member Program
              </span>
              <h1 className="mt-4 font-serif text-h1 text-cream-50">
                Join the Founding Community
              </h1>
              <p className="mt-4 text-body-lg text-cream-100">
                Help us build the club management platform you actually want.
                Your input directly shapes what we build.
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
                  {/* Basic Info */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Input
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      error={errors.firstName}
                      required
                    />
                    <Input
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      error={errors.lastName}
                      required
                    />
                  </div>

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
                    label="Club/Organization Name"
                    name="clubName"
                    value={formData.clubName}
                    onChange={(e) => setFormData({ ...formData, clubName: e.target.value })}
                    error={errors.clubName}
                    required
                  />

                  {/* Club Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-3">
                      Club Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {clubTypes.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, clubType: type.id });
                            if (errors.clubType) setErrors({ ...errors, clubType: '' });
                          }}
                          className={cn(
                            'flex items-center gap-2 rounded-xl border-2 px-4 py-3 text-left transition-all duration-300',
                            formData.clubType === type.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-cream-300 hover:border-cream-400'
                          )}
                        >
                          <span className="text-xl">{type.icon}</span>
                          <span className="text-sm font-medium text-charcoal-700">
                            {type.label}
                          </span>
                        </button>
                      ))}
                    </div>
                    {errors.clubType && (
                      <p className="mt-2 text-sm text-red-500">{errors.clubType}</p>
                    )}
                  </div>

                  {/* Member Count */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                      Approximate Member Count
                    </label>
                    <select
                      value={formData.memberCount}
                      onChange={(e) => setFormData({ ...formData, memberCount: e.target.value })}
                      className="flex h-12 w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-base
                               text-charcoal-700 hover:border-cream-400 transition-colors
                               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select range...</option>
                      <option value="<100">Less than 100</option>
                      <option value="100-500">100 - 500</option>
                      <option value="500-1000">500 - 1,000</option>
                      <option value="1000-2000">1,000 - 2,000</option>
                      <option value="2000+">2,000+</option>
                    </select>
                  </div>

                  {/* Interest Areas */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-3">
                      What features interest you most? <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {interestAreas.map((area) => (
                        <button
                          key={area.id}
                          type="button"
                          onClick={() => toggleInterest(area.id)}
                          className={cn(
                            'rounded-full px-4 py-2 text-sm font-medium transition-all duration-300',
                            formData.interests.includes(area.id)
                              ? 'bg-primary-500 text-cream-50'
                              : 'bg-cream-200 text-charcoal-600 hover:bg-cream-300'
                          )}
                        >
                          {area.label}
                        </button>
                      ))}
                    </div>
                    {errors.interests && (
                      <p className="mt-2 text-sm text-red-500">{errors.interests}</p>
                    )}
                  </div>

                  {/* Biggest Challenge */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                      What&apos;s your biggest operational challenge?
                    </label>
                    <textarea
                      value={formData.biggestChallenge}
                      onChange={(e) => setFormData({ ...formData, biggestChallenge: e.target.value })}
                      rows={3}
                      placeholder="Tell us what keeps you up at night..."
                      className="flex w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-base
                               text-charcoal-700 placeholder:text-charcoal-400
                               hover:border-cream-400 transition-colors
                               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <p className="mt-1 text-xs text-charcoal-400">
                      This helps us prioritize features that matter most
                    </p>
                  </div>

                  {/* How Heard */}
                  <div>
                    <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                      How did you hear about us?
                    </label>
                    <select
                      value={formData.howHeard}
                      onChange={(e) => setFormData({ ...formData, howHeard: e.target.value })}
                      className="flex h-12 w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-base
                               text-charcoal-700 hover:border-cream-400 transition-colors
                               focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select...</option>
                      <option value="search">Search Engine</option>
                      <option value="social">Social Media</option>
                      <option value="referral">Friend/Colleague</option>
                      <option value="event">Event/Conference</option>
                      <option value="other">Other</option>
                    </select>
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
