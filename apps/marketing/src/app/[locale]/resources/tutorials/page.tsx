import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Video, ArrowRight, Bell, Clock, Play } from 'lucide-react';

const plannedVideos = [
  {
    title: 'Getting Started with ClubVantage',
    duration: '10 min',
    description: 'Complete walkthrough of initial setup and configuration',
  },
  {
    title: 'Managing Your Member Directory',
    duration: '8 min',
    description: 'How to add, edit, and organize member information',
  },
  {
    title: 'Setting Up Your Tee Sheet',
    duration: '12 min',
    description: 'Configure tee times, intervals, and booking rules',
  },
  {
    title: 'Creating and Sending Invoices',
    duration: '7 min',
    description: 'Generate invoices and manage billing cycles',
  },
  {
    title: 'Using Aura AI Assistant',
    duration: '15 min',
    description: 'Leverage AI for bookings, insights, and automation',
  },
  {
    title: 'Facility Booking Deep Dive',
    duration: '10 min',
    description: 'Manage courts, rooms, and multi-facility bookings',
  },
];

export default function TutorialsPage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-neutral-50 to-white">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 mb-6">
                <Video className="h-8 w-8 text-primary-600" />
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm text-amber-700 mb-6">
                <Clock className="h-4 w-4" />
                Coming Q1 2026
              </div>
              <h1 className="text-h1 text-neutral-900">Video Tutorials</h1>
              <p className="mt-4 text-body-lg text-neutral-600">
                Step-by-step video guides to help you master every feature of ClubVantage.
                Our video library will launch with the MVP.
              </p>
            </div>
          </div>
        </section>

        {/* Video Grid Preview */}
        <section className="py-16 bg-neutral-50">
          <div className="container">
            <h2 className="text-2xl font-bold text-neutral-900 text-center mb-12">
              Videos We&apos;re Recording
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {plannedVideos.map((video) => (
                <div
                  key={video.title}
                  className="rounded-xl border border-neutral-200 bg-white overflow-hidden"
                >
                  {/* Video Placeholder */}
                  <div className="relative aspect-video bg-neutral-100 flex items-center justify-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
                      <Play className="h-6 w-6 text-neutral-400 ml-1" />
                    </div>
                    <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-neutral-900">{video.title}</h3>
                    <p className="mt-1 text-sm text-neutral-500">{video.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container">
            <div className="mx-auto max-w-xl text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 mb-4">
                <Bell className="h-6 w-6 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900">
                Be the First to Watch
              </h2>
              <p className="mt-4 text-neutral-600">
                Join our founding member community to get early access to tutorials
                and request specific video topics.
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
