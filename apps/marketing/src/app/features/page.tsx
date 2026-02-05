import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Receipt, CalendarDays, Trophy, Smartphone, Sparkles, ArrowRight, ShoppingBag, Megaphone } from 'lucide-react';

const features = [
  {
    title: 'Membership Management',
    description: 'Complete member lifecycle management from application to renewal.',
    icon: Users,
    href: '/features/membership',
  },
  {
    title: 'Billing & Payments',
    description: 'Automate invoicing, collect payments, and stay tax compliant.',
    icon: Receipt,
    href: '/features/billing',
  },
  {
    title: 'Facility Booking',
    description: 'Real-time availability for all facilities with smart scheduling.',
    icon: CalendarDays,
    href: '/features/booking',
  },
  {
    title: 'Golf Operations',
    description: 'Purpose-built tee sheet with caddies, carts, and tournaments.',
    icon: Trophy,
    href: '/features/golf',
  },
  {
    title: 'Member Portal',
    description: 'Mobile-first experience for member self-service.',
    icon: Smartphone,
    href: '/features/portal',
  },
  {
    title: 'Aura AI Assistant',
    description: 'AI-powered assistant that learns your operations.',
    icon: Sparkles,
    href: '/features/aura',
  },
  {
    title: 'POS & Retail',
    description: 'Pro shop sales, inventory management, and member charging.',
    icon: ShoppingBag,
    href: '/features/retail',
  },
  {
    title: 'AI Marketing Agency',
    description: 'AI-driven engagement and acquisition marketing campaigns.',
    icon: Megaphone,
    href: '/features/marketing',
  },
];

export default function FeaturesPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-primary-800 py-16 md:py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-label uppercase tracking-widest text-accent-400">
                Platform Features
              </span>
              <h1 className="mt-4 font-serif text-h1 text-cream-50">
                Everything your club needs
              </h1>
              <p className="mt-4 text-body-lg text-cream-100">
                A comprehensive suite of tools designed specifically for club operations.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-cream-100">
          <div className="container">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Link key={feature.title} href={feature.href}>
                    <Card hoverable className="h-full group" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100
                                    group-hover:bg-primary-500 transition-colors duration-300">
                        <Icon className="h-6 w-6 text-primary-600 group-hover:text-cream-50 transition-colors duration-300" />
                      </div>
                      <CardHeader className="mt-6">
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                      </CardHeader>
                      <CardDescription className="mt-2 text-charcoal-500">
                        {feature.description}
                      </CardDescription>
                      <div className="mt-6 flex items-center gap-2 text-primary-600 font-medium
                                    group-hover:text-primary-500 transition-colors">
                        Learn more
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
