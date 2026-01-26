'use client';

import * as React from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  HelpCircle,
  ArrowRight,
  Search,
  MessageCircle,
  Mail,
  ChevronDown,
  ChevronUp,
  Users,
  CreditCard,
  Calendar,
  Settings,
  Smartphone,
  Shield,
} from 'lucide-react';

const faqCategories = [
  {
    icon: Users,
    title: 'Getting Started',
    faqs: [
      {
        question: 'What is ClubVantage?',
        answer: 'ClubVantage is an AI-first club management platform designed specifically for golf clubs, country clubs, fitness centers, and sports facilities in Southeast Asia. It helps clubs manage members, bookings, billing, and operations in one unified system.',
      },
      {
        question: 'When will ClubVantage be available?',
        answer: 'We are targeting Q1 2026 for our MVP launch. Join our waitlist to get early access and help shape the product as a founding member.',
      },
      {
        question: 'What types of clubs does ClubVantage support?',
        answer: 'ClubVantage is designed for golf and country clubs, fitness and wellness centers, and multi-sport recreational facilities. The platform adapts to the specific needs of each club type.',
      },
    ],
  },
  {
    icon: CreditCard,
    title: 'Pricing & Plans',
    faqs: [
      {
        question: 'How much does ClubVantage cost?',
        answer: 'Pricing will be announced closer to launch. Founding members who join the waitlist will receive exclusive lifetime discounts of up to 100% off the regular price.',
      },
      {
        question: 'What is the founding member program?',
        answer: 'Founding members get early access to ClubVantage, direct input on features and roadmap, and exclusive lifetime pricing. We are accepting only 50 founding member spots.',
      },
      {
        question: 'Is there a free trial?',
        answer: 'Yes, we will offer a free trial period for all new clubs. Founding members will get extended trial periods and additional benefits.',
      },
    ],
  },
  {
    icon: Calendar,
    title: 'Features & Capabilities',
    faqs: [
      {
        question: 'What is Aura AI?',
        answer: 'Aura is our AI assistant that helps with natural language booking, automated insights, revenue optimization suggestions, and member communication. It learns from your club\'s patterns to provide personalized recommendations.',
      },
      {
        question: 'Can ClubVantage integrate with our existing systems?',
        answer: 'Yes, we are building integrations with popular payment gateways, accounting systems, POS systems, and golf handicap services. Let us know what integrations are important to you.',
      },
      {
        question: 'Does ClubVantage support multiple languages?',
        answer: 'Yes, ClubVantage will support English, Thai, and other Southeast Asian languages. Multi-language support is a priority for our regional focus.',
      },
    ],
  },
  {
    icon: Smartphone,
    title: 'Member Portal & App',
    faqs: [
      {
        question: 'Will there be a mobile app for members?',
        answer: 'Yes, native iOS and Android apps for members are planned for Q2 2026. The web-based member portal will be available at MVP launch.',
      },
      {
        question: 'Can members book tee times online?',
        answer: 'Absolutely. Members can book tee times, facilities, and services through the member portal or mobile app. They can also use Aura AI for natural language booking.',
      },
    ],
  },
  {
    icon: Shield,
    title: 'Security & Data',
    faqs: [
      {
        question: 'Is my club\'s data secure?',
        answer: 'Yes, we take security seriously. ClubVantage uses industry-standard encryption, secure cloud infrastructure, and regular security audits to protect your data.',
      },
      {
        question: 'Where is data stored?',
        answer: 'Data is stored in secure cloud data centers in the Asia-Pacific region to ensure compliance with local data regulations and optimal performance.',
      },
      {
        question: 'Can we export our data?',
        answer: 'Yes, you can export your data at any time in standard formats. We believe your data belongs to you.',
      },
    ],
  },
  {
    icon: Settings,
    title: 'Support & Training',
    faqs: [
      {
        question: 'What support is available?',
        answer: 'We offer email support, documentation, video tutorials, and dedicated onboarding assistance. Founding members receive priority support.',
      },
      {
        question: 'Do you provide training?',
        answer: 'Yes, we provide comprehensive onboarding and training for your staff. This includes video tutorials, documentation, and live training sessions for founding members.',
      },
    ],
  },
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [expandedFaqs, setExpandedFaqs] = React.useState<Set<string>>(new Set());

  const toggleFaq = (id: string) => {
    setExpandedFaqs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const filteredCategories = faqCategories.map((category) => ({
    ...category,
    faqs: category.faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter((category) => category.faqs.length > 0);

  return (
    <>
      <Header />
      <main className="pt-16">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-neutral-50 to-white">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 mb-6">
                <HelpCircle className="h-8 w-8 text-primary-600" />
              </div>
              <h1 className="text-h1 text-neutral-900">Help Center</h1>
              <p className="mt-4 text-body-lg text-neutral-600">
                Find answers to common questions about ClubVantage.
              </p>

              {/* Search */}
              <div className="mt-8 max-w-md mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input
                  type="text"
                  placeholder="Search for answers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12"
                />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Sections */}
        <section className="py-16">
          <div className="container">
            <div className="mx-auto max-w-3xl space-y-12">
              {filteredCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <div key={category.title}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                        <Icon className="h-5 w-5 text-primary-600" />
                      </div>
                      <h2 className="text-xl font-semibold text-neutral-900">{category.title}</h2>
                    </div>
                    <div className="space-y-4">
                      {category.faqs.map((faq, index) => {
                        const faqId = `${category.title}-${index}`;
                        const isExpanded = expandedFaqs.has(faqId);
                        return (
                          <div
                            key={index}
                            className="rounded-xl border border-neutral-200 bg-white overflow-hidden"
                          >
                            <button
                              onClick={() => toggleFaq(faqId)}
                              className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 transition-colors"
                            >
                              <span className="font-medium text-neutral-900 pr-4">
                                {faq.question}
                              </span>
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-neutral-400 shrink-0" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-neutral-400 shrink-0" />
                              )}
                            </button>
                            {isExpanded && (
                              <div className="px-4 pb-4 text-neutral-600">
                                {faq.answer}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {filteredCategories.length === 0 && searchQuery && (
                <div className="text-center py-12">
                  <p className="text-neutral-500">No results found for &quot;{searchQuery}&quot;</p>
                  <Button
                    variant="link"
                    onClick={() => setSearchQuery('')}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-neutral-50">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-2xl font-bold text-neutral-900">
                Still have questions?
              </h2>
              <p className="mt-4 text-neutral-600">
                Can&apos;t find what you&apos;re looking for? We&apos;re here to help.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/contact">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Us
                  </Link>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <Link href="mailto:hello@clubvantage.io">
                    <Mail className="h-4 w-4 mr-2" />
                    Email Support
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Waitlist CTA */}
        <section className="py-16">
          <div className="container">
            <div className="mx-auto max-w-xl text-center">
              <h2 className="text-2xl font-bold text-neutral-900">
                Ready to transform your club?
              </h2>
              <p className="mt-4 text-neutral-600">
                Join our founding member program for early access and exclusive benefits.
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
