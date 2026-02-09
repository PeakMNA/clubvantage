'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  // Base styles - Refined and elegant with enhanced transitions
  `inline-flex items-center justify-center gap-2 font-medium whitespace-nowrap
   transition-all duration-300 ease-out
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
   disabled:pointer-events-none disabled:opacity-50
   relative overflow-hidden`,
  {
    variants: {
      variant: {
        // Primary - Rich forest green with sophisticated hover
        primary: `
          bg-primary-500 text-cream-50
          shadow-sm shadow-primary-600/20
          hover:bg-primary-400 hover:shadow-lg hover:shadow-primary-500/30
          hover:-translate-y-0.5
          active:bg-primary-600 active:translate-y-0
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent
          before:-translate-x-full before:transition-transform before:duration-700
          hover:before:translate-x-full
        `,
        // Secondary - Outlined elegant with fill on hover
        secondary: `
          bg-transparent text-primary-600
          border-2 border-primary-500/30
          hover:border-primary-500 hover:bg-primary-50 hover:shadow-md hover:shadow-primary-500/10
          hover:-translate-y-0.5
          active:bg-primary-100 active:translate-y-0
        `,
        // Accent - Warm gold for special actions with glow
        accent: `
          bg-accent-400 text-primary-900
          shadow-sm shadow-accent-500/20
          hover:bg-accent-300 hover:shadow-lg hover:shadow-accent-400/40
          hover:-translate-y-0.5
          active:bg-accent-500 active:translate-y-0
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent
          before:-translate-x-full before:transition-transform before:duration-700
          hover:before:translate-x-full
        `,
        // Ghost - Minimal with subtle background
        ghost: `
          text-charcoal-700
          hover:bg-charcoal-100/80 hover:text-charcoal-900
          active:bg-charcoal-200
        `,
        // Link style with animated underline
        link: `
          text-primary-600 underline-offset-4
          hover:text-primary-500
          after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary-500
          after:transition-all after:duration-300
          hover:after:w-full
        `,
        // Dark variant for light backgrounds
        dark: `
          bg-charcoal-800 text-cream-50
          shadow-sm shadow-charcoal-900/20
          hover:bg-charcoal-700 hover:shadow-lg hover:shadow-charcoal-800/30
          hover:-translate-y-0.5
          active:bg-charcoal-900 active:translate-y-0
          before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent
          before:-translate-x-full before:transition-transform before:duration-700
          hover:before:translate-x-full
        `,
      },
      size: {
        sm: 'min-h-9 py-2 px-4 text-sm rounded-lg',
        md: 'min-h-11 py-2.5 px-6 text-base rounded-lg',
        lg: 'min-h-13 py-3 px-8 text-base rounded-xl',
        xl: 'min-h-14 py-3.5 px-10 text-lg rounded-xl',
        icon: 'h-10 w-10 rounded-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      isLoading,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const buttonClass = cn(buttonVariants({ variant, size, fullWidth, className }));

    // Handle asChild pattern - render the child with button styles
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<{ className?: string }>,
        {
          className: cn(buttonClass, (children.props as { className?: string }).className),
        }
      );
    }

    return (
      <button
        className={buttonClass}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="shrink-0 transition-transform duration-300 group-hover:scale-110">{leftIcon}</span>}
            <span className="relative z-10 inline-flex items-center gap-1">{children}</span>
            {rightIcon && <span className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
