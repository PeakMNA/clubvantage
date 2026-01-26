'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, Shield, Calendar } from 'lucide-react';

// Blocked email domains (personal emails)
const blockedDomains = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'mail.com',
  'protonmail.com',
  'live.com',
  'msn.com',
];

const clubTypes = [
  { value: '', label: 'Select club type...' },
  { value: 'golf', label: 'Golf & Country Club' },
  { value: 'fitness', label: 'Fitness & Wellness Center' },
  { value: 'sports', label: 'Sports & Recreation Club' },
  { value: 'country', label: 'Country Club' },
  { value: 'other', label: 'Other' },
];

const memberCounts = [
  { value: '', label: 'Select member count...' },
  { value: 'under500', label: 'Under 500' },
  { value: '500-1000', label: '500 - 1,000' },
  { value: '1000-2000', label: '1,000 - 2,000' },
  { value: '2000+', label: '2,000+' },
];

const benefits = [
  'Live product walkthrough',
  'Features tailored to your club type',
  'Pricing discussion',
  'Q&A with our team',
];

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  clubType: string;
  memberCount: string;
  phone: string;
  privacyAccepted: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  clubType?: string;
  privacyAccepted?: string;
}

export default function DemoPage() {
  const [formData, setFormData] = React.useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    clubType: '',
    memberCount: '',
    phone: '',
    privacyAccepted: false,
  });
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const validateEmail = (email: string): string | undefined => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';

    const domain = email.split('@')[1]?.toLowerCase();
    if (blockedDomains.includes(domain)) {
      return 'Please use your work email address';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    if (!formData.company.trim()) newErrors.company = 'Company name is required';
    if (!formData.clubType) newErrors.clubType = 'Club type is required';
    if (!formData.privacyAccepted) newErrors.privacyAccepted = 'You must accept the privacy policy';

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
    setIsSubmitted(true);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when field is modified
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  if (isSubmitted) {
    return (
      <>
        <Header />
        <main className="pt-16">
          <section className="min-h-[calc(100vh-4rem)] flex items-center py-16">
            <div className="container">
              <div className="mx-auto max-w-2xl text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-500">
                  <Check className="h-8 w-8 text-white" />
                </div>
                <h1 className="mt-6 text-h1 text-neutral-900">
                  Thanks! Let&apos;s find a time that works
                </h1>
                <p className="mt-4 text-body-lg text-neutral-600">
                  Our team will be in touch within 24 hours to schedule your
                  personalized demo.
                </p>

                {/* Calendly placeholder */}
                <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-8">
                  <Calendar className="mx-auto h-12 w-12 text-neutral-400" />
                  <p className="mt-4 text-neutral-600">
                    Calendly calendar embed would appear here
                  </p>
                </div>

                <div className="mt-8">
                  <p className="text-sm text-neutral-500">
                    While you wait, check out our{' '}
                    <Link href="/features" className="text-primary-500 hover:underline">
                      features
                    </Link>{' '}
                    or{' '}
                    <Link href="/blog" className="text-primary-500 hover:underline">
                      blog
                    </Link>
                    .
                  </p>
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
      <main className="pt-16">
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Form Column */}
              <div>
                <h1 className="text-h1 text-neutral-900">Schedule Your Demo</h1>
                <p className="mt-4 text-body-lg text-neutral-600">
                  Get a personalized walkthrough of ClubVantage tailored to your
                  club&apos;s needs.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Input
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      error={errors.firstName}
                      required
                    />
                    <Input
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      error={errors.lastName}
                      required
                    />
                  </div>

                  <Input
                    label="Work Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    helperText="Please use your work email address"
                    required
                  />

                  <Input
                    label="Company Name"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    error={errors.company}
                    required
                  />

                  <div>
                    <label
                      htmlFor="clubType"
                      className="block text-sm font-medium text-neutral-700 mb-1.5"
                    >
                      Club Type <span className="text-error-500">*</span>
                    </label>
                    <select
                      id="clubType"
                      name="clubType"
                      value={formData.clubType}
                      onChange={handleChange}
                      className={`flex h-12 w-full rounded-md border bg-white px-4 py-3 text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                        errors.clubType
                          ? 'border-error-500'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      {clubTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.clubType && (
                      <p className="mt-1.5 text-sm text-error-500">
                        {errors.clubType}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="memberCount"
                      className="block text-sm font-medium text-neutral-700 mb-1.5"
                    >
                      Member Count
                    </label>
                    <select
                      id="memberCount"
                      name="memberCount"
                      value={formData.memberCount}
                      onChange={handleChange}
                      className="flex h-12 w-full rounded-md border border-neutral-300 bg-white px-4 py-3 text-base hover:border-neutral-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      {memberCounts.map((count) => (
                        <option key={count.value} value={count.value}>
                          {count.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Phone (optional)"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                  />

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="privacyAccepted"
                      name="privacyAccepted"
                      checked={formData.privacyAccepted}
                      onChange={handleChange}
                      className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                    />
                    <label htmlFor="privacyAccepted" className="text-sm text-neutral-600">
                      I agree to the{' '}
                      <Link href="/privacy" className="text-primary-500 hover:underline">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {errors.privacyAccepted && (
                    <p className="text-sm text-error-500">{errors.privacyAccepted}</p>
                  )}

                  <Button type="submit" fullWidth isLoading={isSubmitting}>
                    Schedule My Demo
                  </Button>
                </form>
              </div>

              {/* Benefits Column */}
              <div className="lg:pl-8">
                <div className="rounded-xl bg-neutral-50 p-8">
                  <h2 className="text-h4 text-neutral-900">What you&apos;ll see:</h2>
                  <ul className="mt-6 space-y-4">
                    {benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-3">
                        <Check className="h-5 w-5 shrink-0 text-success-500 mt-0.5" />
                        <span className="text-neutral-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <hr className="my-8 border-neutral-200" />

                  {/* Testimonial placeholder */}
                  <blockquote className="text-neutral-600 italic">
                    &ldquo;The demo was eye-opening. We signed up the same week.&rdquo;
                  </blockquote>
                  <p className="mt-4 text-sm text-neutral-500">
                    — Jennifer Tan, Owner
                    <br />
                    FitLife Club Singapore
                  </p>

                  <hr className="my-8 border-neutral-200" />

                  <div className="flex items-center gap-3 text-neutral-600">
                    <Shield className="h-5 w-5 text-neutral-400" />
                    <span className="text-sm">
                      Your information is secure and will never be shared.
                    </span>
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
