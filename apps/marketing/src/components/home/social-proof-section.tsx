'use client';

import * as React from 'react';
import Image from 'next/image';

const screenshots = [
  { src: '/images/module-members.png', label: 'Member Management', caption: 'Full member lifecycle & directory' },
  { src: '/images/module-billing.png', label: 'Billing & Invoicing', caption: 'Invoices, payments & AR' },
  { src: '/images/module-golf.png', label: 'Golf Tee Sheet', caption: 'Visual drag-and-drop scheduling' },
  { src: '/images/module-facilities.png', label: 'Facility Booking', caption: 'Courts, rooms & services' },
  { src: '/images/module-dining.png', label: 'POS & Dining', caption: 'Point-of-sale & F&B' },
  { src: '/images/module-reports.png', label: 'Reports', caption: 'Analytics & insights' },
  { src: '/images/module-portal.png', label: 'Member Portal', caption: 'Self-service for members' },
  { src: '/images/module-ai.png', label: 'Aura AI', caption: 'Natural language assistant' },
];

export function SocialProofSection() {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  return (
    <section className="py-16 md:py-20 bg-white border-t border-cream-200">
      <div className="container">
        <div className="text-center mb-10">
          <span className="text-label uppercase tracking-widest text-primary-500">
            Platform Preview
          </span>
          <h2 className="mt-3 font-serif text-2xl md:text-3xl text-charcoal-800">
            Built for Modern Club Operations
          </h2>
          <p className="mt-2 text-charcoal-500 max-w-lg mx-auto">
            Every module designed from the ground up for the way clubs actually work.
          </p>
        </div>
      </div>

      {/* Scrollable carousel */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto px-6 pb-4 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {screenshots.map((shot) => (
          <div
            key={shot.label}
            className="flex-shrink-0 w-[320px] md:w-[400px] snap-center"
          >
            <div className="rounded-2xl border border-cream-300 bg-cream-50 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative aspect-[16/10] bg-cream-200">
                <Image
                  src={shot.src}
                  alt={shot.label}
                  fill
                  className="object-cover object-top"
                  sizes="400px"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-charcoal-800 text-sm">{shot.label}</h3>
                <p className="text-xs text-charcoal-500 mt-0.5">{shot.caption}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
