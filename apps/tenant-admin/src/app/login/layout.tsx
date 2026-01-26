import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Club Administration | ClubVantage',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
