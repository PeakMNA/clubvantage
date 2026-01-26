'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu, X, ArrowRight } from 'lucide-react';

const navigation = [
  { name: 'Features', href: '/features' },
  { name: 'Roadmap', href: '/roadmap' },
  { name: 'Solutions', href: '/solutions' },
  { name: 'Resources', href: '/resources' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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
          : 'bg-transparent'
      )}
    >
      <nav className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center">
            {/* Logo mark - elegant C */}
            <div className="absolute inset-0 bg-primary-500 rounded-xl rotate-3 transition-transform group-hover:rotate-6" />
            <span className="relative text-xl font-serif font-semibold text-cream-50">C</span>
          </div>
          <div className="flex flex-col">
            <span className={cn(
              'text-lg font-semibold tracking-tight transition-colors',
              isScrolled ? 'text-charcoal-900' : 'text-cream-50'
            )}>
              ClubVantage
            </span>
            <span className={cn(
              'text-[10px] uppercase tracking-[0.2em] transition-colors',
              isScrolled ? 'text-charcoal-500' : 'text-cream-100'
            )}>
              Club Management
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300',
                isScrolled
                  ? 'text-charcoal-700 hover:text-charcoal-900 hover:bg-cream-200'
                  : 'text-cream-100 hover:text-white hover:bg-white/10'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex md:items-center md:gap-4">
          <Button
            asChild
            size="sm"
            variant={isScrolled ? 'primary' : 'accent'}
            className="group"
          >
            <Link href="/waitlist">
              Join Waitlist
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
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
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
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block py-3 px-4 text-base font-medium text-charcoal-700 rounded-lg
                         hover:bg-cream-200 hover:text-charcoal-900 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-cream-300">
              <Button asChild fullWidth>
                <Link href="/waitlist" onClick={() => setIsMobileMenuOpen(false)}>
                  Join the Waitlist
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
