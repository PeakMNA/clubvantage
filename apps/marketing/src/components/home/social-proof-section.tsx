'use client';

import * as React from 'react';

// Placeholder logos - will be replaced with real client logos
const clientLogos = [
  { name: 'Royal Bangkok Golf Club', id: 1 },
  { name: 'Singapore Country Club', id: 2 },
  { name: 'Kuala Lumpur Golf & Country Club', id: 3 },
  { name: 'Phuket Golf Resort', id: 4 },
  { name: 'Marina Bay Sports Club', id: 5 },
];

export function SocialProofSection() {
  // Don't render if no real data is available
  const hasRealData = false; // Set to true when real client data is available

  if (!hasRealData) {
    return null;
  }

  return (
    <section className="bg-neutral-50 py-12">
      <div className="container">
        <p className="text-center text-sm font-medium text-neutral-500 uppercase tracking-wider">
          Trusted by leading clubs across Southeast Asia
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {clientLogos.map((logo) => (
            <div
              key={logo.id}
              className="flex h-8 items-center justify-center text-neutral-400 grayscale hover:grayscale-0 transition-all"
            >
              {/* Placeholder - replace with actual logo images */}
              <span className="text-sm font-medium">{logo.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
