'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { PageHeader, Button } from '@clubvantage/ui';

export default function NewMemberPage() {
  const searchParams = useSearchParams();
  const fromApplication = searchParams.get('fromApplication') || searchParams.get('from');

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="New Member"
        description={
          fromApplication
            ? `Creating member from application ${fromApplication}`
            : 'Create a new club member'
        }
        breadcrumbs={[
          { label: 'Members', href: '/members' },
          { label: 'New Member' },
        ]}
        actions={
          <Link href={fromApplication ? `/members/applications/${fromApplication}` : '/members'}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-12 text-center">
        <div className="p-3 bg-amber-500/10 rounded-lg mb-4">
          <UserPlus className="h-8 w-8 text-amber-500" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Member Creation</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          The member creation form is not yet available. Members can currently be created
          through the applications workflow or imported via CSV.
        </p>
        <div className="flex gap-3 mt-6">
          <Link href="/members/applications">
            <Button variant="outline">View Applications</Button>
          </Link>
          <Link href="/members">
            <Button>Back to Members</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
