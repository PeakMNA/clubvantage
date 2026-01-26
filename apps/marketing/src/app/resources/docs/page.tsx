import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import {
  FileText,
  ArrowRight,
  Bell,
  Clock,
  BookOpen,
  Code,
  Zap,
  Settings,
  Users,
  CreditCard,
} from 'lucide-react';

const docSections = [
  {
    icon: Zap,
    title: 'Getting Started',
    description: 'Quick start guides, initial setup, and first steps',
    items: ['Installation Guide', 'Initial Configuration', 'Your First Club Setup', 'Importing Data'],
  },
  {
    icon: Users,
    title: 'Member Management',
    description: 'Managing members, applications, and memberships',
    items: ['Member Directory', 'Application Workflows', 'Membership Types', 'Dependent Management'],
  },
  {
    icon: CreditCard,
    title: 'Billing & Payments',
    description: 'Invoicing, payments, and financial management',
    items: ['Invoice Generation', 'Payment Processing', 'Statements', 'Aging Reports'],
  },
  {
    icon: BookOpen,
    title: 'Facility Booking',
    description: 'Managing bookings, tee times, and reservations',
    items: ['Tee Sheet Setup', 'Facility Configuration', 'Booking Rules', 'Recurring Bookings'],
  },
  {
    icon: Settings,
    title: 'Administration',
    description: 'System settings, users, and configuration',
    items: ['User Management', 'Roles & Permissions', 'Club Settings', 'Integrations'],
  },
  {
    icon: Code,
    title: 'API Reference',
    description: 'Developer documentation and API guides',
    items: ['Authentication', 'REST Endpoints', 'Webhooks', 'Rate Limits'],
  },
];

export default function DocsPage() {
  return (
    <>
      <Header />
      <main className="pt-16">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-neutral-50 to-white">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 mb-6">
                <FileText className="h-8 w-8 text-primary-600" />
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm text-amber-700 mb-6">
                <Clock className="h-4 w-4" />
                Coming Q1 2026
              </div>
              <h1 className="text-h1 text-neutral-900">Documentation</h1>
              <p className="mt-4 text-body-lg text-neutral-600">
                Comprehensive guides, tutorials, and API documentation to help you
                get the most out of ClubVantage.
              </p>
            </div>
          </div>
        </section>

        {/* Documentation Preview */}
        <section className="py-16 bg-neutral-50">
          <div className="container">
            <h2 className="text-2xl font-bold text-neutral-900 text-center mb-12">
              Documentation We&apos;re Preparing
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {docSections.map((section) => {
                const Icon = section.icon;
                return (
                  <div
                    key={section.title}
                    className="rounded-xl border border-neutral-200 bg-white p-6"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100">
                      <Icon className="h-5 w-5 text-neutral-600" />
                    </div>
                    <h3 className="mt-4 font-semibold text-neutral-900">{section.title}</h3>
                    <p className="mt-1 text-sm text-neutral-500">{section.description}</p>
                    <ul className="mt-4 space-y-2">
                      {section.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-neutral-600">
                          <div className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
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
                Early Access to Documentation
              </h2>
              <p className="mt-4 text-neutral-600">
                Founding members get early access to documentation and can provide
                feedback to help us improve our guides.
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
