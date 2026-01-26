import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Member Login | ClubVantage',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
