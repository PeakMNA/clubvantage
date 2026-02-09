'use client';

import { use } from 'react';
import { useStatement } from '@/hooks/use-ar-statements';
import { StatementDetail, StatementDetailSkeleton } from '@/components/members/billing/statement-detail';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function StatementDetailPage({
  params,
}: {
  params: Promise<{ id: string; statementId: string }>;
}) {
  const { id: memberId, statementId } = use(params);
  const { statement, isLoading, error } = useStatement(statementId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <StatementDetailSkeleton />
      </div>
    );
  }

  if (error || !statement) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-white/80 py-16">
          <AlertCircle className="h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium text-foreground">Statement not found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This statement may have been removed or is no longer available.
          </p>
          <Link
            href={`/members/${memberId}`}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border/60 bg-white px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Member
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <StatementDetail
        statement={statement}
        memberId={memberId}
      />
    </div>
  );
}
