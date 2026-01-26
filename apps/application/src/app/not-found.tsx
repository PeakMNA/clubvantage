import Link from 'next/link';
import { Home } from 'lucide-react';
import { Button, EmptyState } from '@clubvantage/ui';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <EmptyState
        icon={<Home className="h-8 w-8" />}
        title="Page not found"
        description="Sorry, we couldn't find the page you're looking for."
        action={
          <Button asChild>
            <Link href="/">Go to Dashboard</Link>
          </Button>
        }
      />
    </div>
  );
}
