'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  // Base styles - Refined and elegant
  `inline-flex items-center justify-center gap-2 font-medium
   transition-all duration-300 ease-out-expo
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
   disabled:pointer-events-none disabled:opacity-50`,
  {
    variants: {
      variant: {
        // Primary - Rich forest green with gold hover
        primary: `
          bg-primary-500 text-cream-50
          shadow-sm shadow-primary-600/20
          hover:bg-primary-400 hover:shadow-md hover:shadow-primary-500/25
          active:bg-primary-600
        `,
        // Secondary - Outlined elegant
        secondary: `
          bg-transparent text-primary-600
          border-2 border-primary-500/30
          hover:border-primary-500 hover:bg-primary-50
          active:bg-primary-100
        `,
        // Accent - Warm gold for special actions
        accent: `
          bg-accent-400 text-primary-900
          shadow-sm shadow-accent-500/20
          hover:bg-accent-300 hover:shadow-md hover:shadow-accent-400/25
          active:bg-accent-500
        `,
        // Ghost - Minimal
        ghost: `
          text-charcoal-700
          hover:bg-charcoal-100 hover:text-charcoal-900
          active:bg-charcoal-200
        `,
        // Link style
        link: `
          text-primary-600 underline-offset-4
          hover:text-primary-500 hover:underline
        `,
      },
      size: {
        sm: 'h-9 px-4 text-sm rounded-lg',
        md: 'h-11 px-6 text-base rounded-lg',
        lg: 'h-13 px-8 text-base rounded-xl',
        xl: 'h-14 px-10 text-lg rounded-xl',
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
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
