import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight, Bell, Clock } from 'lucide-react';

const upcomingTopics = [
  'Launching ClubVantage: Our Vision for AI-First Club Management',
  'Why Southeast Asian Clubs Need Modern Management Software',
  'The True Cost of Outdated Club Management Systems',
  'How AI is Transforming Member Experiences',
  '5 Common Club Management Challenges (And How to Solve Them)',
  'Building a Community-Driven Product: Our Founding Member Program',
];

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-neutral-50 to-white">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 mb-6">
                <BookOpen className="h-8 w-8 text-primary-600" />
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm text-amber-700 mb-6">
                <Clock className="h-4 w-4" />
                Coming Q1 2026
              </div>
              <h1 className="text-h1 text-neutral-900">Blog</h1>
              <p className="mt-4 text-body-lg text-neutral-600">
                Industry insights, product updates, and best practices for modern club management.
                Our blog will launch alongside the ClubVantage MVP.
              </p>
            </div>
          </div>
        </section>

        {/* Upcoming Topics */}
        <section className="py-16 bg-neutral-50">
          <div className="container">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-2xl font-bold text-neutral-900 text-center mb-8">
                Topics We&apos;re Preparing
              </h2>
              <div className="space-y-4">
                {upcomingTopics.map((topic, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-sm font-medium text-neutral-500">
                      {index + 1}
                    </div>
                    <span className="text-neutral-700">{topic}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Subscribe CTA */}
        <section className="py-16">
          <div className="container">
            <div className="mx-auto max-w-xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 mb-4">
                <Bell className="h-6 w-6 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">
                Get Notified When We Launch
              </h2>
              <p className="mt-4 text-neutral-600">
                Join our waitlist to receive our first blog posts and product updates
                directly in your inbox.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/waitlist">
                    Join the Waitlist
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="/resources">Back to Resources</Link>
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
