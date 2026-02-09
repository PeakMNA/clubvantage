'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X, ArrowRight, Globe } from 'lucide-react';
import { Logo } from '@/components/brand';

const navigationKeys = [
  { key: 'features', href: '/features' },
  { key: 'roadmap', href: '/roadmap' },
  { key: 'solutions', href: '/solutions' },
  { key: 'resources', href: '/resources' },
] as const;

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const toggleLocale = () => {
    const nextLocale = locale === 'en' ? 'th' : 'en';
    router.replace(pathname, { locale: nextLocale });
  };

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled
          ? 'bg-cream-100/90 backdrop-blur-xl border-b border-cream-300/50 shadow-sm'
          : 'bg-primary-800/95 backdrop-blur-sm'
      )}
    >
      <nav className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center">
          <Logo
            width={180}
            colorScheme={isScrolled ? 'default' : 'light'}
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-1">
          {navigationKeys.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300',
                isScrolled
                  ? 'text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-200'
                  : 'text-cream-100 hover:text-white hover:bg-white/10'
              )}
            >
              {tNav(item.key)}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex md:items-center md:gap-4">
          <button
            type="button"
            onClick={toggleLocale}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-300',
              isScrolled
                ? 'text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-200'
                : 'text-cream-100 hover:text-white hover:bg-white/10'
            )}
          >
            <Globe className="h-4 w-4" />
            {locale === 'en' ? 'TH' : 'EN'}
          </button>
          <Button
            asChild
            size="sm"
            variant={isScrolled ? 'primary' : 'accent'}
            className="group"
          >
            <Link href="/waitlist">
              {tCommon('joinWaitlist')}
              <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg transition-colors md:hidden',
            isScrolled
              ? 'text-charcoal-800 hover:bg-cream-200'
              : 'text-cream-100 hover:bg-cream-50/10'
          )}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? tCommon('closeMenu') : tCommon('openMenu')}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          'absolute inset-x-0 top-full overflow-hidden transition-all duration-300 md:hidden',
          isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="bg-cream-50 border-b border-cream-300 shadow-lg">
          <div className="container py-6 space-y-1">
            {/* Language Switcher (Mobile) */}
            <button
              type="button"
              onClick={toggleLocale}
              className="flex items-center gap-1.5 py-3 px-4 text-base font-medium text-charcoal-700 rounded-lg
                       hover:bg-cream-200 hover:text-charcoal-900 transition-colors w-full"
            >
              <Globe className="h-4 w-4" />
              {locale === 'en' ? 'TH' : 'EN'}
            </button>
            {navigationKeys.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="block py-3 px-4 text-base font-medium text-charcoal-700 rounded-lg
                         hover:bg-cream-200 hover:text-charcoal-900 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {tNav(item.key)}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-cream-300">
              <Button asChild fullWidth>
                <Link href="/waitlist" onClick={() => setIsMobileMenuOpen(false)}>
                  {tCommon('joinTheWaitlist')}
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
