import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

const solutions = [
  {
    title: 'Golf & Country Clubs',
    description: 'Purpose-built for the unique needs of golf and country clubs with tee sheet management, handicap tracking, and tournament tools.',
    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80',
    href: '/solutions/golf',
    features: ['Tee sheet management', 'Caddie & cart assignments', 'Tournament management', 'Pro shop integration'],
  },
  {
    title: 'Fitness & Wellness Centers',
    description: 'Streamline class scheduling, trainer management, and member engagement for fitness facilities of all sizes.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    href: '/solutions/fitness',
    features: ['Class scheduling', 'Trainer management', 'Attendance tracking', 'Equipment booking'],
  },
  {
    title: 'Sports & Recreation Clubs',
    description: 'Multi-sport facility management with court bookings, league organization, and event coordination.',
    image: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80',
    href: '/solutions/sports',
    features: ['Multi-facility booking', 'League management', 'Event coordination', 'Equipment rental'],
  },
];

export default function SolutionsPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-primary-800 py-16 md:py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-label uppercase tracking-widest text-accent-400">
                Solutions
              </span>
              <h1 className="mt-4 font-serif text-h1 text-cream-50">
                Solutions for every club type
              </h1>
              <p className="mt-4 text-body-lg text-cream-100">
                ClubVantage adapts to the unique needs of your facility.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-cream-100">
          <div className="container">
            <div className="space-y-12">
              {solutions.map((solution, index) => (
                <Link key={solution.title} href={solution.href}>
                  <Card hoverable padding="none" className="overflow-hidden group">
                    <div className={`grid md:grid-cols-2 ${index % 2 === 1 ? 'md:grid-flow-dense' : ''}`}>
                      <div className={`relative aspect-video md:aspect-auto min-h-[300px] ${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
                        <Image
                          src={solution.image}
                          alt={solution.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Subtle overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/20 to-transparent" />
                      </div>
                      <div className={`p-8 md:p-10 ${index % 2 === 1 ? 'md:col-start-1' : ''}`}>
                        <CardHeader>
                          <CardTitle className="font-serif text-2xl text-charcoal-800">{solution.title}</CardTitle>
                        </CardHeader>
                        <CardDescription className="mt-4 text-base text-charcoal-500">
                          {solution.description}
                        </CardDescription>
                        <ul className="mt-6 space-y-3">
                          {solution.features.map((feature) => (
                            <li key={feature} className="flex items-center gap-3 text-charcoal-600">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-8 flex items-center gap-2 text-primary-600 font-medium
                                      group-hover:text-primary-500 transition-colors">
                          Learn more
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
