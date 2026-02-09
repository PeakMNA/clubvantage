import { Playfair_Display, Plus_Jakarta_Sans, Noto_Sans_Thai, Noto_Serif_Thai } from 'next/font/google';
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

const notoSansThai = Noto_Sans_Thai({
  subsets: ['thai'],
  display: 'swap',
  variable: '--font-sans-thai',
  weight: ['400', '500', '600', '700'],
});

const notoSerifThai = Noto_Serif_Thai({
  subsets: ['thai'],
  display: 'swap',
  variable: '--font-serif-thai',
  weight: ['400', '500', '600', '700'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className={`${playfair.variable} ${jakarta.variable} ${notoSansThai.variable} ${notoSerifThai.variable}`}>
      <body className="min-h-screen bg-cream-100 font-sans antialiased">
        {/* Subtle grain texture overlay for warmth */}
        <div className="grain-overlay" aria-hidden="true" />
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
