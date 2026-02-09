import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Receipt, CalendarDays, Trophy, Smartphone, Sparkles, ArrowRight, ShoppingBag, Megaphone } from 'lucide-react';

const featureKeys = [
  {
    titleKey: 'membershipManagement',
    descKey: 'membershipDesc',
    icon: Users,
    href: '/features/membership',
  },
  {
    titleKey: 'billingPayments',
    descKey: 'billingDesc',
    icon: Receipt,
    href: '/features/billing',
  },
  {
    titleKey: 'facilityBooking',
    descKey: 'facilityDesc',
    icon: CalendarDays,
    href: '/features/booking',
  },
  {
    titleKey: 'golfOperations',
    descKey: 'golfDesc',
    icon: Trophy,
    href: '/features/golf',
  },
  {
    titleKey: 'memberPortal',
    descKey: 'memberPortalDesc',
    icon: Smartphone,
    href: '/features/portal',
  },
  {
    titleKey: 'auraAi',
    descKey: 'auraAiDesc',
    icon: Sparkles,
    href: '/features/aura',
  },
  {
    titleKey: 'posRetail',
    descKey: 'posRetailDesc',
    icon: ShoppingBag,
    href: '/features/retail',
  },
  {
    titleKey: 'aiMarketing',
    descKey: 'aiMarketingDesc',
    icon: Megaphone,
    href: '/features/marketing',
  },
] as const;

export default async function FeaturesPage() {
  const t = await getTranslations('features');
  const tCommon = await getTranslations('common');

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-primary-800 py-16 md:py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-label uppercase tracking-widest text-accent-400">
                {t('platformFeatures')}
              </span>
              <h1 className="mt-4 font-serif text-h1 text-cream-50">
                {t('everythingYourClubNeeds')}
              </h1>
              <p className="mt-4 text-body-lg text-cream-100">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-cream-100">
          <div className="container">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featureKeys.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Link key={feature.titleKey} href={feature.href}>
                    <Card hoverable className="h-full group" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100
                                    group-hover:bg-primary-500 transition-colors duration-300">
                        <Icon className="h-6 w-6 text-primary-600 group-hover:text-cream-50 transition-colors duration-300" />
                      </div>
                      <CardHeader className="mt-6">
                        <CardTitle className="text-xl">{t(feature.titleKey)}</CardTitle>
                      </CardHeader>
                      <CardDescription className="mt-2 text-charcoal-500">
                        {t(feature.descKey)}
                      </CardDescription>
                      <div className="mt-6 flex items-center gap-2 text-primary-600 font-medium
                                    group-hover:text-primary-500 transition-colors">
                        {tCommon('learnMore')}
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
