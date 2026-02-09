'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';
import { submitContact } from '@/app/actions/contact';

const offices = [
  {
    country: 'Thailand',
    address: '123 Wireless Road, Lumpini, Bangkok 10330',
    phone: '+66 2 123 4567',
    email: 'thailand@clubvantage.io',
  },
  {
    country: 'Singapore',
    address: '1 Raffles Place, #20-01, Singapore 048616',
    phone: '+65 6789 0123',
    email: 'singapore@clubvantage.io',
  },
  {
    country: 'Malaysia',
    address: 'Level 10, Menara CIMB, Kuala Lumpur 50088',
    phone: '+60 3 1234 5678',
    email: 'malaysia@clubvantage.io',
  },
];

export default function ContactPage() {
  const t = useTranslations('contact');
  const tCommon = useTranslations('common');

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const result = await submitContact({
        name: `${formData.get('firstName')} ${formData.get('lastName')}`,
        email: formData.get('email') as string,
        clubName: (formData.get('company') as string) || '',
        message: formData.get('message') as string,
      });

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.error || tCommon('somethingWentWrong'));
      }
    } catch {
      setError(tCommon('somethingWentWrong'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-primary-800 py-16 md:py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-label uppercase tracking-widest text-accent-400">
                {t('title')}
              </span>
              <h1 className="mt-4 font-serif text-h1 text-cream-50">{t('getInTouch')}</h1>
              <p className="mt-4 text-body-lg text-cream-100">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-cream-100">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Contact Form */}
              <div className="bg-white rounded-2xl border border-cream-300 p-8 shadow-sm">
                <h2 className="font-serif text-2xl text-charcoal-800">{t('sendUsAMessage')}</h2>
                {isSubmitted ? (
                  <div className="mt-6 rounded-2xl bg-primary-50 border border-primary-200 p-6 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 mb-4">
                      <CheckCircle2 className="h-6 w-6 text-primary-600" />
                    </div>
                    <p className="text-primary-700 font-medium">
                      {t('thanksForReachingOut')}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {error && (
                      <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>
                    )}
                    <div className="grid gap-6 sm:grid-cols-2">
                      <Input label={t('firstName')} name="firstName" required />
                      <Input label={t('lastName')} name="lastName" required />
                    </div>
                    <Input label={t('email')} name="email" type="email" required />
                    <Input label={t('company')} name="company" />
                    <div>
                      <label className="block text-sm font-medium text-charcoal-700 mb-1.5">
                        {t('message')} <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="message"
                        rows={4}
                        className="flex w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-base
                                 text-charcoal-700 placeholder:text-charcoal-400
                                 hover:border-cream-400 transition-all duration-300
                                 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    <Button type="submit" fullWidth isLoading={isSubmitting}>
                      {t('sendMessage')}
                    </Button>
                  </form>
                )}
              </div>

              {/* Office Locations */}
              <div>
                <h2 className="font-serif text-2xl text-charcoal-800">{t('ourOffices')}</h2>
                <p className="mt-2 text-charcoal-500">
                  {t('servingPrestigiousClubs')}
                </p>
                <div className="mt-8 space-y-6">
                  {offices.map((office) => (
                    <div key={office.country} className="rounded-2xl border border-cream-300 bg-white p-6">
                      <h3 className="font-serif font-semibold text-charcoal-800">{office.country}</h3>
                      <div className="mt-4 space-y-3">
                        <div className="flex items-start gap-3 text-charcoal-600">
                          <MapPin className="h-5 w-5 shrink-0 text-charcoal-400 mt-0.5" />
                          <span>{office.address}</span>
                        </div>
                        <div className="flex items-center gap-3 text-charcoal-600">
                          <Phone className="h-5 w-5 shrink-0 text-charcoal-400" />
                          <a href={`tel:${office.phone.replace(/\s/g, '')}`} className="hover:text-primary-600 transition-colors">
                            {office.phone}
                          </a>
                        </div>
                        <div className="flex items-center gap-3 text-charcoal-600">
                          <Mail className="h-5 w-5 shrink-0 text-charcoal-400" />
                          <a href={`mailto:${office.email}`} className="hover:text-primary-600 transition-colors">
                            {office.email}
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
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
