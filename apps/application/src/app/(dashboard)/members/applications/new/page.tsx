'use client';

import Link from 'next/link';
import { ArrowLeft, ClipboardPlus } from 'lucide-react';
import { PageHeader, Button } from '@clubvantage/ui';

export default function NewApplicationPage() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="New Application"
        description="Submit a new membership application"
        breadcrumbs={[
          { label: 'Members', href: '/members' },
          { label: 'Applications', href: '/members/applications' },
          { label: 'New Application' },
        ]}
        actions={
          <Link href="/members/applications">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-12 text-center">
        <div className="p-3 bg-amber-500/10 rounded-lg mb-4">
          <ClipboardPlus className="h-8 w-8 text-amber-500" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Application Submission</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          The application creation form is not yet available. Applications can currently
          be submitted through the member portal.
        </p>
        <Link href="/members/applications" className="mt-6">
          <Button>Back to Applications</Button>
        </Link>
      </div>
    </div>
  );
}
