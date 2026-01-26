'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  'rounded-2xl border bg-white transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'border-cream-300 shadow-sm',
        elevated: 'border-cream-300 shadow-lg shadow-charcoal-200/10',
        outlined: 'border-cream-300',
        featured: 'border-accent-300 shadow-lg ring-2 ring-accent-100',
      },
      hoverable: {
        true: 'hover:shadow-xl hover:shadow-charcoal-200/15 hover:-translate-y-1 cursor-pointer',
      },
      padding: {
        none: '',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, hoverable, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, hoverable, padding, className }))}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5', className)} {...props} />
  )
);

CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('font-serif text-xl font-semibold text-charcoal-800', className)}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-charcoal-500', className)} {...props} />
));

CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('pt-4', className)} {...props} />
  )
);

CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center pt-4', className)} {...props} />
  )
);

CardFooter.displayName = 'CardFooter';

// Feature Card - for benefits section
interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  iconBackground?: string;
  title: string;
  description: string;
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ className, icon, iconBackground = 'bg-primary-100', title, description, ...props }, ref) => {
    return (
      <Card ref={ref} className={className} {...props}>
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-xl',
            iconBackground
          )}
        >
          {icon}
        </div>
        <CardHeader className="mt-4">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardDescription className="mt-2">{description}</CardDescription>
      </Card>
    );
  }
);

FeatureCard.displayName = 'FeatureCard';

// Pricing Card
interface PricingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  description: string;
  price: string;
  period: string;
  features: { name: string; included: boolean }[];
  ctaText: string;
  ctaHref: string;
  featured?: boolean;
  badge?: string;
}

const PricingCard = React.forwardRef<HTMLDivElement, PricingCardProps>(
  (
    {
      className,
      name,
      description,
      price,
      period,
      features,
      ctaText,
      ctaHref,
      featured = false,
      badge,
      ...props
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        variant={featured ? 'featured' : 'default'}
        padding="lg"
        className={cn('relative flex flex-col', featured && 'scale-105', className)}
        {...props}
      >
        {badge && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="inline-flex items-center rounded-full bg-accent-400 px-4 py-1 text-sm font-medium text-primary-900">
              {badge}
            </span>
          </div>
        )}
        <div>
          <h3 className="font-serif text-xl font-semibold text-charcoal-800">{name}</h3>
          <p className="mt-1 text-sm text-charcoal-500">{description}</p>
        </div>
        <div className="mt-6">
          <span className="font-serif text-4xl font-bold text-charcoal-800">{price}</span>
          <span className="text-charcoal-500">/{period}</span>
        </div>
        <ul className="mt-6 flex-1 space-y-3">
          {features.map((feature) => (
            <li key={feature.name} className="flex items-start gap-3">
              {feature.included ? (
                <svg
                  className="h-5 w-5 shrink-0 text-primary-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 shrink-0 text-charcoal-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span
                className={cn(
                  'text-sm',
                  feature.included ? 'text-charcoal-600' : 'text-charcoal-400'
                )}
              >
                {feature.name}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <a
            href={ctaHref}
            className={cn(
              'flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300',
              featured
                ? 'bg-primary-500 text-cream-50 hover:bg-primary-400 shadow-sm'
                : 'border-2 border-primary-500/30 text-primary-600 hover:border-primary-500 hover:bg-primary-50'
            )}
          >
            {ctaText}
          </a>
        </div>
      </Card>
    );
  }
);

PricingCard.displayName = 'PricingCard';

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  FeatureCard,
  PricingCard,
};
