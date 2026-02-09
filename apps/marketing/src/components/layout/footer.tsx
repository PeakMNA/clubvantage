'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Linkedin, Twitter, ArrowRight } from 'lucide-react';
import { subscribeNewsletter } from '@/app/actions/newsletter';
import { getWaitlistCount } from '@/app/actions/waitlist';

const socialLinks = [
  { name: 'LinkedIn', href: '#', icon: Linkedin },
  { name: 'Twitter', href: '#', icon: Twitter },
];

export function Footer() {
  const t = useTranslations('footer');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');

  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [waitlistCount, setWaitlistCount] = React.useState(0);

  React.useEffect(() => {
    getWaitlistCount().then(setWaitlistCount);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await subscribeNewsletter(email, 'footer');
      if (result.success) {
        setIsSubscribed(true);
        setEmail('');
      }
    } catch {
      // Silently fail for newsletter
    } finally {
      setIsSubmitting(false);
    }
  };

  const footerNavigation = {
    product: [
      { name: tNav('features'), href: '/features' },
      { name: tNav('roadmap'), href: '/roadmap' },
      { name: tCommon('joinWaitlist'), href: '/waitlist' },
    ],
    company: [
      { name: t('about'), href: '/about' },
      { name: t('contact'), href: '/contact' },
      { name: t('blog'), href: '/resources/blog' },
    ],
    resources: [
      { name: t('helpCenter'), href: '/resources/help' },
    ],
    legal: [
      { name: t('privacy'), href: '/privacy' },
      { name: t('terms'), href: '/terms' },
    ],
  };

  return (
    <footer className="bg-primary-800 text-cream-100">
      {/* Waitlist CTA Section */}
      <div className="border-b border-primary-700/50">
        <div className="container py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-label uppercase tracking-widest text-accent-400">
                {t('foundingMemberProgram')}
              </span>
              <h3 className="mt-4 font-serif text-3xl text-cream-50">
                {t('bePartOfSomethingExceptional')}
              </h3>
              <p className="mt-4 text-cream-200 max-w-md">
                {t('shapeTheProduct')}
              </p>
            </div>
            {isSubscribed ? (
              <div className="flex items-center gap-3 text-accent-400">
                <div className="h-10 w-10 rounded-full bg-accent-400/20 flex items-center justify-center">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-medium">{t('thanksForJoining')}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                <Input
                  type="email"
                  placeholder={t('enterWorkEmail')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1 bg-primary-700/50 border-primary-600 text-cream-50
                           placeholder:text-cream-300 focus:border-accent-400 focus:ring-accent-400"
                />
                <Button type="submit" variant="accent" isLoading={isSubmitting}>
                  {tCommon('joinWaitlist')}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-12">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center">
                <div className="absolute inset-0 bg-accent-400 rounded-xl rotate-3" />
                <span className="relative text-xl font-serif font-semibold text-primary-900">C</span>
              </div>
              <span className="text-xl font-semibold text-cream-50">ClubVantage</span>
            </Link>
            <p className="mt-6 text-cream-200 max-w-xs leading-relaxed">
              {t('buildingTheFuture')}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full
                          bg-primary-700/50 border border-primary-600">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-400" />
              </span>
              <span className="text-xs text-cream-100">{tCommon('inDevelopment')}</span>
            </div>
            <div className="mt-8 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="flex h-10 w-10 items-center justify-center rounded-lg
                           bg-primary-700/50 text-cream-200 border border-primary-600
                           hover:bg-primary-600 hover:text-white hover:border-primary-500
                           transition-all duration-300"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-cream-200">
              {t('product')}
            </h4>
            <ul className="mt-6 space-y-4">
              {footerNavigation.product.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-cream-200 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-cream-200">
              {t('company')}
            </h4>
            <ul className="mt-6 space-y-4">
              {footerNavigation.company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-cream-200 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-cream-200">
              {t('resources')}
            </h4>
            <ul className="mt-6 space-y-4">
              {footerNavigation.resources.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-cream-200 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Founding Members */}
      <div className="text-center py-4 border-t border-primary-700/50">
        <p className="text-sm text-cream-300">
          {t('joinFoundingMembers', { count: waitlistCount })}
        </p>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-700/50">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-cream-300">
              &copy; {new Date().getFullYear()} ClubVantage. {tCommon('allRightsReserved')}
            </p>
            <div className="flex gap-8">
              {footerNavigation.legal.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-cream-300 hover:text-white transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
