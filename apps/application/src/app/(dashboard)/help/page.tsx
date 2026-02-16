'use client';

import { HelpCircle, Book, MessageSquare, Mail } from 'lucide-react';
import { PageHeader } from '@clubvantage/ui';

export default function HelpPage() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Help & Support"
        description="Get help with ClubVantage"
        breadcrumbs={[{ label: 'Help' }]}
      />

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-6 text-center">
          <div className="p-3 bg-blue-500/10 rounded-lg inline-block mb-3">
            <Book className="h-6 w-6 text-blue-500" />
          </div>
          <h3 className="font-semibold mb-1">Documentation</h3>
          <p className="text-sm text-muted-foreground">
            Browse guides and tutorials for all ClubVantage features.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 text-center">
          <div className="p-3 bg-emerald-500/10 rounded-lg inline-block mb-3">
            <MessageSquare className="h-6 w-6 text-emerald-500" />
          </div>
          <h3 className="font-semibold mb-1">Live Chat</h3>
          <p className="text-sm text-muted-foreground">
            Chat with our support team for real-time assistance.
          </p>
        </div>

        <div className="rounded-xl border bg-card p-6 text-center">
          <div className="p-3 bg-amber-500/10 rounded-lg inline-block mb-3">
            <Mail className="h-6 w-6 text-amber-500" />
          </div>
          <h3 className="font-semibold mb-1">Contact Support</h3>
          <p className="text-sm text-muted-foreground">
            Email support@clubvantage.io for billing or account issues.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-8 text-center">
        <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <h2 className="text-lg font-semibold mb-2">Need more help?</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The full help center with searchable knowledge base, video tutorials,
          and ticket submission is coming soon.
        </p>
      </div>
    </div>
  );
}
