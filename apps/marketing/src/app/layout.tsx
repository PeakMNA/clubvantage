import type { Metadata } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { ChatWidget } from '@/components/chat/chat-widget';

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'ClubVantage — The Future of Club Management',
  description:
    'AI-first management platform for prestigious golf clubs, country clubs, and recreational facilities across Southeast Asia.',
  keywords: [
    'club management',
    'golf club software',
    'country club management',
    'membership management',
    'Southeast Asia',
    'AI club management',
  ],
  authors: [{ name: 'ClubVantage' }],
  openGraph: {
    title: 'ClubVantage — The Future of Club Management',
    description:
      'AI-first management platform for prestigious golf clubs, country clubs, and recreational facilities across Southeast Asia.',
    url: 'https://clubvantage.io',
    siteName: 'ClubVantage',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClubVantage — The Future of Club Management',
    description:
      'AI-first management platform for prestigious golf clubs, country clubs, and recreational facilities.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-cream-100 font-sans antialiased">
        {/* Subtle grain texture overlay for warmth */}
        <div className="grain-overlay" aria-hidden="true" />
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
