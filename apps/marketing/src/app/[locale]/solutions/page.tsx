import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const solutionKeys = [
  {
    titleKey: 'golfTitle',
    descKey: 'golfDesc',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80',
    href: '/solutions/golf',
    featureKeys: ['golfF1', 'golfF2', 'golfF3', 'golfF4'],
  },
  {
    titleKey: 'fitnessTitle',
    descKey: 'fitnessDesc',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    href: '/solutions/fitness',
    featureKeys: ['fitnessF1', 'fitnessF2', 'fitnessF3', 'fitnessF4'],
  },
  {
    titleKey: 'sportsTitle',
    descKey: 'sportsDesc',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
    href: '/solutions/sports',
    featureKeys: ['sportsF1', 'sportsF2', 'sportsF3', 'sportsF4'],
  },
] as const;

export default async function SolutionsPage() {
  const t = await getTranslations('solutions');
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
                {t('title')}
              </span>
              <h1 className="mt-4 font-serif text-h1 text-cream-50">
                {t('heroTitle')}
              </h1>
              <p className="mt-4 text-body-lg text-cream-100">
                {t('subtitle')}
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-cream-100">
          <div className="container">
            <div className="space-y-12">
              {solutionKeys.map((solution, index) => (
                <Link key={solution.titleKey} href={solution.href}>
                  <Card hoverable padding="none" className="overflow-hidden group">
                    <div className={`grid md:grid-cols-2 ${index % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                      <div className={`relative aspect-video md:aspect-auto min-h-[300px] ${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
                        <Image
                          src={solution.image}
                          alt={t(solution.titleKey)}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Subtle overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/20 to-transparent" />
                      </div>
                      <div className={`p-8 md:p-10 ${index % 2 === 1 ? 'md:col-start-1' : ''}`}>
                        <CardHeader>
                          <CardTitle className="font-serif text-2xl text-charcoal-800">{t(solution.titleKey)}</CardTitle>
                        </CardHeader>
                        <CardDescription className="mt-4 text-base text-charcoal-500">
                          {t(solution.descKey)}
                        </CardDescription>
                        <ul className="mt-6 space-y-3">
                          {solution.featureKeys.map((fKey) => (
                            <li key={fKey} className="flex items-center gap-3 text-charcoal-600">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                              {t(fKey)}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-8 flex items-center gap-2 text-primary-600 font-medium
                                      group-hover:text-primary-500 transition-colors">
                          {tCommon('learnMore')}
                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
