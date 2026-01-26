import * as React from 'react';
import { cn } from '@/lib/utils';

/**
 * Platform Manager Input Component
 *
 * Form input with support for:
 * - Label and helper text
 * - Error states and messages
 * - Various input types
 * - Disabled state
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, helperText, error, id, ...props }, ref) => {
    const inputId = id || React.useId();
    const hasError = Boolean(error);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            'flex h-10 w-full rounded border bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-150',
            'focus:outline-none focus:ring-1',
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500',
            'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-500',
            className
          )}
          ref={ref}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-sm text-red-600">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="text-sm text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
