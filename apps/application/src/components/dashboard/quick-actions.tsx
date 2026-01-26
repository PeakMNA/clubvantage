'use client';

import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@clubvantage/ui';

interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {actions.map((action) => {
            const buttonContent = (
              <>
                <action.icon className="h-5 w-5" />
                <span>{action.label}</span>
              </>
            );

            if (action.href) {
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  asChild
                >
                  <Link href={action.href}>{buttonContent}</Link>
                </Button>
              );
            }

            return (
              <Button
                key={action.id}
                variant="outline"
                className="h-auto flex-col gap-2 py-4"
                onClick={action.onClick}
              >
                {buttonContent}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
