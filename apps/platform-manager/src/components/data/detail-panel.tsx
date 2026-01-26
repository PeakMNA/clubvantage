'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

const widths = {
  sm: 'w-80', // 320px
  md: 'w-[400px]',
  lg: 'w-[560px]',
};

export function DetailPanel({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 'md',
}: DetailPanelProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Handle Escape key
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap
  React.useEffect(() => {
    if (isOpen && panelRef.current) {
      const focusableElements = panelRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (event: KeyboardEvent) => {
        if (event.key !== 'Tab') return;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            event.preventDefault();
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      firstElement?.focus();

      return () => document.removeEventListener('keydown', handleTabKey);
    }
  }, [isOpen]);

  // Prevent body scroll when panel is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        className={cn(
          'fixed right-0 top-0 bottom-0 z-40 flex flex-col',
          'bg-white shadow-xl rounded-l-xl',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
          widths[width]
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200">
          <div>
            <h2
              id="panel-title"
              className="text-lg font-semibold text-slate-900"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 -m-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close panel"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer (optional) */}
        {footer && (
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}

// Detail Panel Section for organized content
interface DetailSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function DetailSection({ title, children, className }: DetailSectionProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {title && (
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}

// Detail Row for key-value pairs
interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

export function DetailRow({ label, value, className }: DetailRowProps) {
  return (
    <div className={cn('flex items-start justify-between py-2 border-b border-slate-100 last:border-0', className)}>
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900 text-right max-w-[60%]">
        {value}
      </span>
    </div>
  );
}

// Detail Actions for panel footers
interface DetailActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function DetailActions({ children, className }: DetailActionsProps) {
  return (
    <div className={cn('flex items-center justify-end gap-3', className)}>
      {children}
    </div>
  );
}
