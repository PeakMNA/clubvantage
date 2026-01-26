import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform Admin | ClubVantage',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
