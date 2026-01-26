import * as React from 'react';
import { ChevronRight } from 'lucide-react';

import { cn } from '../lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Page description */
  description?: string;
  /** Breadcrumb items */
  breadcrumbs?: BreadcrumbItem[];
  /** Actions slot (buttons, etc.) */
  actions?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {breadcrumbs.map((item, index) => (
              <li key={index} className="flex items-center gap-1.5">
                {index > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/70" />}
                {item.href ? (
                  <a
                    href={item.href}
                    className="hover:text-amber-600 transition-colors duration-200"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className="text-foreground font-medium">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
