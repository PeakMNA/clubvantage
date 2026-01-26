'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

const phoneNumbers = [
  { country: 'TH', number: '+66 2 123 4567' },
  { country: 'SG', number: '+65 6789 0123' },
  { country: 'MY', number: '+60 3 1234 5678' },
];

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 py-24">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,white_1px,transparent_1px)] bg-[size:60px_60px]" />
      </div>

      <div className="container relative">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-h2 text-white">
            Ready to modernize your club operations?
          </h2>
          <p className="mt-4 text-body-lg text-white/80">
            Join clubs across Southeast Asia who trust ClubVantage to streamline
            their operations and delight their members.
          </p>

          <div className="mt-10">
            <Button
              asChild
              size="lg"
              className="bg-white text-primary-600 hover:bg-neutral-100"
            >
              <Link href="/demo">Schedule a Demo</Link>
            </Button>
          </div>

          <div className="mt-10">
            <p className="text-sm text-white/60 mb-4">Or call us directly</p>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {phoneNumbers.map((phone) => (
                <a
                  key={phone.country}
                  href={`tel:${phone.number.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span className="font-medium">{phone.country}:</span>
                  <span>{phone.number}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
