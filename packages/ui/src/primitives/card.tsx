import * as React from 'react';

import { cn } from '../lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/60 bg-card/80 text-card-foreground shadow-lg shadow-stone-200/30 dark:shadow-black/20 backdrop-blur-sm transition-all duration-300',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-semibold leading-none tracking-tight text-foreground', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

// Accent line component for cards
const CardAccent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: 'amber' | 'emerald' | 'stone' }
>(({ className, variant = 'amber', ...props }, ref) => {
  const gradients = {
    amber: 'bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300',
    emerald: 'bg-gradient-to-r from-emerald-300 via-emerald-500 to-emerald-300',
    stone: 'bg-gradient-to-r from-stone-300 via-stone-400 to-stone-300',
  };

  return (
    <div
      ref={ref}
      className={cn('absolute left-0 top-0 h-1 w-full', gradients[variant], className)}
      {...props}
    />
  );
});
CardAccent.displayName = 'CardAccent';

// Gradient overlay for cards
const CardGradient = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'absolute inset-0 bg-gradient-to-br from-stone-50/50 dark:from-stone-800/30 to-transparent pointer-events-none',
        className
      )}
      {...props}
    />
  )
);
CardGradient.displayName = 'CardGradient';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardAccent,
  CardGradient,
};
