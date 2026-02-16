'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { PageHeader, Button } from '@clubvantage/ui';

export default function EditMemberPage() {
  const params = useParams();
  const memberId = params.id as string;

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Edit Member"
        description="Modify member details and profile information"
        breadcrumbs={[
          { label: 'Members', href: '/members' },
          { label: 'Member Detail', href: `/members/${memberId}` },
          { label: 'Edit' },
        ]}
        actions={
          <Link href={`/members/${memberId}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Profile
            </Button>
          </Link>
        }
      />

      <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-12 text-center">
        <div className="p-3 bg-amber-500/10 rounded-lg mb-4">
          <Pencil className="h-8 w-8 text-amber-500" />
        </div>
        <h2 className="text-lg font-semibold mb-2">Member Editing</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          The member edit form is not yet available. Individual fields can be updated
          from the member detail page.
        </p>
        <Link href={`/members/${memberId}`} className="mt-6">
          <Button>Back to Member Detail</Button>
        </Link>
      </div>
    </div>
  );
}
