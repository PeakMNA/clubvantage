import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  ArrowRight,
  Clock,
  Sparkles,
  MessageCircle,
  Lightbulb,
} from 'lucide-react';

const resources = [
  {
    title: 'Blog',
    description: 'Industry insights, product updates, and best practices for club management.',
    icon: BookOpen,
    href: '/resources/blog',
    comingSoon: true,
    preview: 'First posts coming with MVP launch',
  },
  {
    title: 'Documentation',
    description: 'Comprehensive guides and API documentation for developers.',
    icon: FileText,
    href: '/resources/docs',
    comingSoon: true,
    preview: 'Full documentation at launch',
  },
  {
    title: 'Video Tutorials',
    description: 'Step-by-step video guides to help you get the most out of ClubVantage.',
    icon: Video,
    href: '/resources/tutorials',
    comingSoon: true,
    preview: 'Video library in development',
  },
  {
    title: 'Help Center',
    description: 'Find answers to common questions and get support.',
    icon: HelpCircle,
    href: '/resources/help',
    comingSoon: false,
    preview: null,
  },
];

const upcomingContent = [
  {
    icon: Lightbulb,
    title: 'Getting Started Guide',
    description: 'Step-by-step guide to set up your club on ClubVantage',
  },
  {
    icon: Sparkles,
    title: 'AI Features Deep Dive',
    description: 'How to leverage Aura AI for smarter club operations',
  },
  {
    icon: MessageCircle,
    title: 'Best Practices',
    description: 'Tips from successful clubs using modern management tools',
  },
];

export default function ResourcesPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="bg-primary-800 py-16 md:py-20">
          <div className="container">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-700/50 px-4 py-2 text-sm text-cream-200 mb-6">
                <Clock className="h-4 w-4 text-accent-400" />
                Resources launching with MVP
              </div>
              <h1 className="font-serif text-h1 text-cream-50">Resources</h1>
              <p className="mt-4 text-body-lg text-cream-100">
                Everything you need to succeed with ClubVantage. We&apos;re building
                comprehensive resources to help you get the most out of the platform.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-cream-100">
          <div className="container">
            <div className="grid gap-8 sm:grid-cols-2">
              {resources.map((resource) => {
                const Icon = resource.icon;
                return (
                  <Link key={resource.title} href={resource.href}>
                    <Card hoverable className="h-full relative overflow-hidden group">
                      {resource.comingSoon && (
                        <div className="absolute top-4 right-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent-100 px-2.5 py-1 text-xs font-medium text-accent-700">
                            <Clock className="h-3 w-3" />
                            Coming Soon
                          </span>
                        </div>
                      )}
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100
                                    group-hover:bg-primary-500 transition-colors duration-300">
                        <Icon className="h-6 w-6 text-primary-600 group-hover:text-cream-50 transition-colors duration-300" />
                      </div>
                      <CardHeader className="mt-6">
                        <CardTitle className="text-xl">{resource.title}</CardTitle>
                      </CardHeader>
                      <CardDescription className="mt-2 text-charcoal-500">
                        {resource.description}
                      </CardDescription>
                      {resource.preview && (
                        <p className="mt-2 text-xs text-charcoal-400">
                          {resource.preview}
                        </p>
                      )}
                      <div className="mt-6 flex items-center gap-2 text-primary-600 font-medium
                                    group-hover:text-primary-500 transition-colors">
                        {resource.comingSoon ? 'Learn More' : 'Explore'}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Upcoming Content Preview */}
        <section className="py-16 bg-cream-200/50">
          <div className="container">
            <div className="text-center mb-12">
              <span className="text-label uppercase tracking-widest text-accent-600">
                In Development
              </span>
              <h2 className="mt-4 font-serif text-2xl text-charcoal-800">What We&apos;re Working On</h2>
              <p className="mt-2 text-charcoal-500">
                Content we&apos;re preparing for our founding members
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
              {upcomingContent.map((content) => {
                const Icon = content.icon;
                return (
                  <div
                    key={content.title}
                    className="rounded-2xl border border-cream-300 bg-white p-6 text-center"
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <h3 className="mt-4 font-serif font-semibold text-charcoal-800">{content.title}</h3>
                    <p className="mt-2 text-sm text-charcoal-500">{content.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-cream-100">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-serif text-2xl text-charcoal-800">
                Want early access to our resources?
              </h2>
              <p className="mt-4 text-charcoal-500">
                Join the waitlist to get notified when we publish new guides, tutorials,
                and best practices.
              </p>
              <div className="mt-8">
                <Button asChild size="lg">
                  <Link href="/waitlist">
                    Join the Waitlist
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
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
